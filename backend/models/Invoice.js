const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: [true, 'Please provide an invoice number'],
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
  services: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  }],
  items: [{
    description: String,
    quantity: Number,
    unitPrice: Number,
    totalPrice: Number
  }],
  subtotal: {
    type: Number,
    default: 0
  },
  taxRate: {
    type: Number,
    default: 0.1
  },
  taxAmount: {
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
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
    default: 'draft'
  },
  dueDate: {
    type: Date
  },
  paidAt: {
    type: Date
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Indexes
invoiceSchema.index({ customer: 1 });
invoiceSchema.index({ vehicle: 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ dueDate: 1 });

// Generate invoice number before save
invoiceSchema.pre('save', async function(next) {
  if (!this.isNew || this.invoiceNumber) {
    return next();
  }
  
  const count = await this.constructor.countDocuments();
  const year = new Date().getFullYear();
  this.invoiceNumber = `INV-${year}-${String(count + 1).padStart(6, '0')}`;
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);

