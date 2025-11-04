const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const auth = require('../middleware/auth');
const Reminder = require('../models/Reminder');

// Validation
const createValidation = [
  body('customer').notEmpty().withMessage('Customer is required'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('scheduledDate').notEmpty().withMessage('Scheduled date is required'),
  body('type').optional().isIn(['service', 'inspection', 'registration', 'insurance', 'maintenance', 'other'])
];

// Get all reminders with pagination and filters
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['pending', 'completed', 'cancelled']),
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
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Get total count
    const total = await Reminder.countDocuments(filter);

    // Get reminders
    const reminders = await Reminder.find(filter)
      .populate('customer', 'name phone email')
      .populate('vehicle', 'make model year plateNumber')
      .sort({ scheduledDate: 1 })
      .limit(limit)
      .skip(skip)
      .lean()
      .exec();

    res.json({
      success: true,
      data: reminders,
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

// Get single reminder
router.get('/:id', async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id)
      .populate('customer vehicle createdBy')
      .lean()
      .exec();

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    res.json({ success: true, data: reminder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create reminder
router.post('/', createValidation, async (req, res) => {
  try {
    const reminderData = {
      ...req.body
      // createdBy: req.user.id (auth disabled for testing)
    };
    const reminder = await Reminder.create(reminderData);
    const populatedReminder = await Reminder.findById(reminder._id)
      .populate('customer vehicle createdBy')
      .lean()
      .exec();
    
    res.status(201).json({ success: true, data: populatedReminder });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update reminder
router.put('/:id', async (req, res) => {
  try {
    const reminder = await Reminder.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('customer vehicle createdBy')
      .lean()
      .exec();

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    res.json({ success: true, data: reminder });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete reminder
router.delete('/:id', async (req, res) => {
  try {
    const reminder = await Reminder.findByIdAndDelete(req.params.id);

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    res.json({ success: true, message: 'Reminder deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

