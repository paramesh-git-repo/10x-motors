const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Please provide a customer']
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle'
  },
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['service', 'inspection', 'registration', 'insurance', 'maintenance', 'other'],
    default: 'other'
  },
  scheduledDate: {
    type: Date,
    required: [true, 'Please provide a scheduled date']
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending'
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringInterval: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    default: 'yearly'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
reminderSchema.index({ customer: 1 });
reminderSchema.index({ vehicle: 1 });
reminderSchema.index({ scheduledDate: 1 });
reminderSchema.index({ status: 1 });
reminderSchema.index({ type: 1 });

module.exports = mongoose.model('Reminder', reminderSchema);

