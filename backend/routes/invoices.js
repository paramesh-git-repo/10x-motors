const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const auth = require('../middleware/auth');
const Invoice = require('../models/Invoice');

// Validation middleware
const validateRequest = (req, res, next) => {
  const errors = [];
  
  // Check customer
  const customerValue = req.body.customer;
  if (!customerValue || (typeof customerValue === 'string' && customerValue.trim() === '')) {
    errors.push('Customer is required');
  }
  
  // Check vehicle
  const vehicleValue = req.body.vehicle;
  if (!vehicleValue || (typeof vehicleValue === 'string' && vehicleValue.trim() === '')) {
    errors.push('Vehicle is required');
  }
  
  // Check items
  if (!req.body.items || !Array.isArray(req.body.items) || req.body.items.length === 0) {
    errors.push('At least one item is required');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({ message: errors.join('; ') });
  }
  
  next();
};

// Get all invoices with pagination and filters
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['draft', 'sent', 'paid', 'overdue', 'cancelled']),
  query('search').optional().isString()
], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const skip = (page - 1) * limit;
    const { status, search } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Get total count
    const total = await Invoice.countDocuments(filter);

    // Get invoices
    const invoices = await Invoice.find(filter)
      .populate('customer', 'name phone email')
      .populate('vehicle', 'make model year plateNumber')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean()
      .exec();

    res.json({
      success: true,
      data: invoices,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single invoice
router.get('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('customer')
      .populate('vehicle')
      .populate('services')
      .lean()
      .exec();

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create invoice
router.post('/', validateRequest, async (req, res) => {
  try {
    // Clean up data - handle empty strings
    const invoiceData = { ...req.body };
    
    // Remove empty strings for optional fields
    if (invoiceData.status === '' || !invoiceData.status) {
      delete invoiceData.status; // Let model default handle it
    } else if (invoiceData.status === 'unpaid') {
      // Map 'unpaid' to 'draft' since 'unpaid' is not a valid enum value
      invoiceData.status = 'draft'
    }
    if (invoiceData.notes === '' || !invoiceData.notes) {
      delete invoiceData.notes;
    }
    
    // Calculate totals
    const calculateTotals = (items) => {
      const subtotal = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
      const { taxRate = 0.1, discount = 0 } = invoiceData;
      const taxAmount = subtotal * taxRate;
      const total = subtotal + taxAmount - discount;

      return { subtotal, taxAmount, total };
    };

    if (invoiceData.items && Array.isArray(invoiceData.items)) {
      // Ensure items have proper structure
      invoiceData.items = invoiceData.items.map(item => ({
        description: item.description || '',
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || 0,
        totalPrice: (item.quantity || 1) * (item.unitPrice || 0)
      }));
      
      Object.assign(invoiceData, calculateTotals(invoiceData.items));
    }

    console.log('Creating invoice with data:', JSON.stringify(invoiceData, null, 2));
    
    const invoice = await Invoice.create(invoiceData);
    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate('customer vehicle services')
      .lean()
      .exec();
    
    res.status(201).json({ success: true, data: populatedInvoice });
  } catch (error) {
    console.error('Invoice creation error:', error.message);
    console.error('Error details:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update invoice
router.put('/:id', async (req, res) => {
  try {
    // If status is being updated to paid, set paidAt
    if (req.body.status === 'paid' && !req.body.paidAt) {
      req.body.paidAt = new Date();
    }

    // Recalculate totals if items are updated
    if (req.body.items) {
      const subtotal = req.body.items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
      const invoice = await Invoice.findById(req.params.id).lean();
      const { taxRate = 0.1, discount = 0 } = invoice;
      const taxAmount = subtotal * taxRate;
      const total = subtotal + taxAmount - discount;

      req.body.subtotal = subtotal;
      req.body.taxAmount = taxAmount;
      req.body.total = total;
    }

    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('customer vehicle services')
      .lean()
      .exec();

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json({ success: true, data: invoice });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete invoice
router.delete('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json({ success: true, message: 'Invoice deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

