const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const User = require('../models/User');

// Validation
const createValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['admin', 'technician', 'receptionist']).withMessage('Invalid role')
];

// Get all users (admin only)
router.get('/', auth, role('admin'), [
  body('page').optional().isInt({ min: 1 }),
  body('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const skip = (page - 1) * limit;

    // Get total count
    const total = await User.countDocuments();

    // Get users
    const users = await User.find()
      .select('-password')
      .limit(limit)
      .skip(skip)
      .lean()
      .exec();

    res.json({
      success: true,
      data: users,
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

// Get single user
router.get('/:id', auth, role('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .lean()
      .exec();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create user
router.post('/', auth, role('admin'), createValidation, async (req, res) => {
  try {
    const user = await User.create(req.body);
    const userObj = user.toObject();
    delete userObj.password;
    
    res.status(201).json({ success: true, data: userObj });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update user
router.put('/:id', auth, role('admin'), async (req, res) => {
  try {
    // Don't allow password update through this route
    delete req.body.password;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .select('-password')
      .lean()
      .exec();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete user
router.delete('/:id', auth, role('admin'), async (req, res) => {
  try {
    // Don't allow deleting yourself
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete yourself' });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

