const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Customer = require('../models/Customer');
const Service = require('../models/Service');
const Invoice = require('../models/Invoice');
const Reminder = require('../models/Reminder');
const Vehicle = require('../models/Vehicle');

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    const totalVehicles = await Vehicle.countDocuments();
    const totalServices = await Service.countDocuments();
    const totalInvoices = await Invoice.countDocuments();
    const totalPendingServices = await Service.countDocuments({ status: 'pending' });
    const totalPendingInvoices = await Invoice.countDocuments({ status: { $in: ['draft', 'sent'] } });
    const totalRevenue = await Invoice.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    // Get pending services with details
    const pendingServices = await Service.find({ status: 'pending' })
      .populate('customer', 'name phone')
      .populate('vehicle', 'make model plateNumber')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()
      .exec();

    console.log('Pending services count:', pendingServices.length)
    console.log('Pending services:', JSON.stringify(pendingServices, null, 2))

    // Get pending invoices with details
    const pendingInvoices = await Invoice.find({ status: { $in: ['draft', 'sent'] } })
      .populate('customer', 'name phone')
      .populate('vehicle', 'make model plateNumber')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()
      .exec();

    console.log('Pending invoices count:', pendingInvoices.length)
    console.log('Pending invoices:', JSON.stringify(pendingInvoices, null, 2))

    // Revenue by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const revenueByMonth = await Invoice.aggregate([
      { 
        $match: { 
          status: 'paid',
          createdAt: { $gte: sixMonthsAgo }
        } 
      },
      {
        $group: {
          _id: { 
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          revenue: { $sum: '$total' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Upcoming reminders (next 7 days)
    const upcomingReminders = await Reminder.find({
      scheduledDate: {
        $gte: new Date(),
        $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      status: 'pending'
    })
      .populate('customer', 'name phone')
      .populate('vehicle', 'make model plateNumber')
      .limit(10)
      .lean()
      .exec();

    res.json({
      success: true,
      data: {
        totalCustomers,
        totalVehicles,
        totalServices,
        totalInvoices,
        totalPendingServices,
        totalPendingInvoices,
        totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
        revenueByMonth,
        upcomingReminders,
        pendingServices,
        pendingInvoices
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

