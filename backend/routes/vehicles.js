const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const Vehicle = require('../models/Vehicle');
const Customer = require('../models/Customer');

// Validation
const createValidation = [
  body('customer').notEmpty().withMessage('Customer is required'),
  body('make').trim().notEmpty().withMessage('Make is required'),
  body('model').trim().notEmpty().withMessage('Model is required'),
  body('year').isInt({ min: 1900 }).withMessage('Valid year is required'),
  body('plateNumber').trim().notEmpty().withMessage('Plate number is required')
];

// Get all vehicles with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const skip = (page - 1) * limit;

    const total = await Vehicle.countDocuments();
    const vehicles = await Vehicle.find()
      .populate('customer', 'name phone email')
      .limit(limit)
      .skip(skip)
      .lean()
      .exec();

    res.json({
      success: true,
      data: vehicles,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single vehicle
router.get('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate('customer')
      .lean()
      .exec();

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    res.json({ success: true, data: vehicle });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create vehicle
router.post('/', createValidation, async (req, res) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    
    // Add vehicle to customer's vehicles array
    if (req.body.customer) {
      await Customer.findByIdAndUpdate(
        req.body.customer,
        { $push: { vehicles: vehicle._id } },
        { new: true }
      );
    }

    const populatedVehicle = await Vehicle.findById(vehicle._id)
      .populate('customer')
      .lean()
      .exec();

    res.status(201).json({ success: true, data: populatedVehicle });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update vehicle
router.put('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('customer')
      .lean()
      .exec();

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    res.json({ success: true, data: vehicle });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete vehicle
router.delete('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Remove vehicle from customer's vehicles array
    if (vehicle.customer) {
      await Customer.findByIdAndUpdate(
        vehicle.customer,
        { $pull: { vehicles: vehicle._id } },
        { new: true }
      );
    }

    await Vehicle.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Vehicle deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

