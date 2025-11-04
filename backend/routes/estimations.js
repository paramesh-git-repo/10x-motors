const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Estimation = require('../models/Estimation');

// Get all estimations with pagination and filters
router.get('/', auth, async (req, res) => {
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
        { estimationNumber: { $regex: search, $options: 'i' } },
        { 'items.description': { $regex: search, $options: 'i' } }
      ];
    }

    // Get total count
    const total = await Estimation.countDocuments(filter);

    // Get estimations
    const estimations = await Estimation.find(filter)
      .populate('customer', 'name phone email')
      .populate('vehicle', 'make model year plateNumber')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean()
      .exec();

    res.json({
      success: true,
      data: estimations,
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

// Get single estimation
router.get('/:id', auth, async (req, res) => {
  try {
    const estimation = await Estimation.findById(req.params.id)
      .populate('customer')
      .populate('vehicle')
      .lean()
      .exec();

    if (!estimation) {
      return res.status(404).json({ message: 'Estimation not found' });
    }

    res.json({ success: true, data: estimation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create estimation
router.post('/', auth, async (req, res) => {
  try {
    // Calculate totals
    const items = req.body.items || [];
    const subtotal = items.reduce((sum, item) => {
      const qty = item.quantity || 1;
      const price = item.unitPrice || 0;
      const total = qty * price;
      return sum + total;
    }, 0);

    const cgstRate = req.body.cgstRate || 0.09;
    const sgstRate = req.body.sgstRate || 0.09;
    const cgstAmount = subtotal * cgstRate;
    const sgstAmount = subtotal * sgstRate;
    const discount = req.body.discount || 0;
    const total = subtotal + cgstAmount + sgstAmount - discount;

    // Prepare items with total prices
    const itemsWithTotals = items.map(item => ({
      description: item.description,
      quantity: item.quantity || 1,
      unitPrice: item.unitPrice || 0,
      totalPrice: (item.quantity || 1) * (item.unitPrice || 0)
    }));

    const estimationData = {
      ...req.body,
      items: itemsWithTotals,
      subtotal,
      cgstRate,
      sgstRate,
      cgstAmount,
      sgstAmount,
      discount,
      total
    };

    const estimation = await Estimation.create(estimationData);
    const populatedEstimation = await Estimation.findById(estimation._id)
      .populate('customer vehicle')
      .lean()
      .exec();

    res.status(201).json({ success: true, data: populatedEstimation });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update estimation
router.put('/:id', auth, async (req, res) => {
  try {
    // Recalculate totals if items changed
    if (req.body.items) {
      const items = req.body.items;
      const subtotal = items.reduce((sum, item) => {
        const qty = item.quantity || 1;
        const price = item.unitPrice || 0;
        const total = qty * price;
        return sum + total;
      }, 0);

      const cgstRate = req.body.cgstRate || 0.09;
      const sgstRate = req.body.sgstRate || 0.09;
      const cgstAmount = subtotal * cgstRate;
      const sgstAmount = subtotal * sgstRate;
      const discount = req.body.discount || 0;
      const total = subtotal + cgstAmount + sgstAmount - discount;

      req.body.subtotal = subtotal;
      req.body.cgstAmount = cgstAmount;
      req.body.sgstAmount = sgstAmount;
      req.body.total = total;

      // Prepare items with total prices
      req.body.items = items.map(item => ({
        description: item.description,
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || 0,
        totalPrice: (item.quantity || 1) * (item.unitPrice || 0)
      }));
    }

    const estimation = await Estimation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('customer vehicle')
      .lean({ defaults: true })
      .exec();

    if (!estimation) {
      return res.status(404).json({ message: 'Estimation not found' });
    }

    res.json({ success: true, data: estimation });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete estimation
router.delete('/:id', auth, async (req, res) => {
  try {
    const estimation = await Estimation.findByIdAndDelete(req.params.id);

    if (!estimation) {
      return res.status(404).json({ message: 'Estimation not found' });
    }

    res.json({ success: true, message: 'Estimation deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

