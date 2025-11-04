const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Please provide a customer']
  },
  make: {
    type: String,
    required: [true, 'Please provide a make'],
    trim: true
  },
  model: {
    type: String,
    required: [true, 'Please provide a model'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Please provide a year'],
    min: 1900,
    max: new Date().getFullYear() + 1
  },
  plateNumber: {
    type: String,
    required: [true, 'Please provide a plate number'],
    trim: true,
    uppercase: true
  },
  vin: {
    type: String,
    trim: true,
    uppercase: true
  },
  color: {
    type: String,
    trim: true
  },
  mileage: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
vehicleSchema.index({ plateNumber: 1 });
vehicleSchema.index({ customer: 1 });
vehicleSchema.index({ vin: 1 });

module.exports = mongoose.model('Vehicle', vehicleSchema);

