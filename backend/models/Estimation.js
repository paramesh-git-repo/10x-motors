const mongoose = require('mongoose');

const estimationSchema = new mongoose.Schema({
  estimationNumber: {
    type: String,
    required: [true, 'Please provide an estimation number'],
    unique: true
  },
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
  items: [{
    description: String,
    quantity: {
      type: Number,
      default: 1
    },
    unitPrice: Number,
    totalPrice: Number
  }],
  subtotal: {
    type: Number,
    default: 0
  },
  cgstRate: {
    type: Number,
    default: 0.09
  },
  sgstRate: {
    type: Number,
    default: 0.09
  },
  cgstAmount: {
    type: Number,
    default: 0
  },
  sgstAmount: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    default: 0
  },
  validUntil: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'accepted', 'rejected', 'expired'],
    default: 'draft'
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Indexes
estimationSchema.index({ customer: 1 });
estimationSchema.index({ vehicle: 1 });
estimationSchema.index({ status: 1 });
estimationSchema.index({ validUntil: 1 });

// Generate estimation number before save
estimationSchema.pre('save', async function(next) {
  if (!this.isNew || this.estimationNumber) {
    return next();
  }
  
  const count = await this.constructor.countDocuments();
  const year = new Date().getFullYear();
  this.estimationNumber = `EST-${year}-${String(count + 1).padStart(6, '0')}`;
  next();
});

module.exports = mongoose.model('Estimation', estimationSchema);

