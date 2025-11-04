const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Please provide a customer']
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Please provide a vehicle']
  },
  serviceType: {
    type: String,
    required: [true, 'Please provide a service type'],
    trim: true,
    default: 'other'
  },
  description: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  scheduledAt: {
    type: Date
  },
  expectedDeliveryDate: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  technician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  laborHours: {
    type: Number,
    default: 0
  },
  partsUsed: [{
    name: String,
    quantity: Number,
    unitPrice: Number,
    totalPrice: Number
  }],
  totalCost: {
    type: Number,
    default: 0
  },
  advancedPaid: {
    type: Number,
    default: 0
  },
  invoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice'
  },
  vehicleModel: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    street: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    zipCode: {
      type: String,
      trim: true
    }
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes
serviceSchema.index({ customer: 1 });
serviceSchema.index({ vehicle: 1 });
serviceSchema.index({ status: 1 });
serviceSchema.index({ scheduledAt: 1 });
serviceSchema.index({ technician: 1 });
serviceSchema.index({ invoice: 1 });

module.exports = mongoose.model('Service', serviceSchema);

