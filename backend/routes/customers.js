const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const auth = require('../middleware/auth');
const Customer = require('../models/Customer');
const Vehicle = require('../models/Vehicle');

// Validation
const createValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('email').optional().isEmail().withMessage('Please provide a valid email')
];

// Get all customers with pagination and search
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().isString()
], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    // Build search filter
    const filter = search ? {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ]
    } : {};

    // Get total count
    const total = await Customer.countDocuments(filter);

    // Get customers
    const customers = await Customer.find(filter)
      .populate('vehicles')
      .sort({ createdAt: -1 })  // Latest first
      .limit(limit)
      .skip(skip)
      .lean()
      .exec();

    res.json({
      success: true,
      data: customers,
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

// Get single customer with vehicles
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .populate('vehicles')
      .lean()
      .exec();

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create customer
router.post('/', createValidation, async (req, res) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json({ success: true, data: customer });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update customer
router.put('/:id', async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).lean().exec();

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json({ success: true, data: customer });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete customer
router.delete('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Check if customer has vehicles
    if (customer.vehicles && customer.vehicles.length > 0) {
      await Vehicle.deleteMany({ _id: { $in: customer.vehicles } });
    }

    await Customer.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

