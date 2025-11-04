const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const whatsappService = require('../services/whatsappService');
const Customer = require('../models/Customer');
const Invoice = require('../models/Invoice');
const Service = require('../models/Service');

// Send test message
router.post('/test', async (req, res) => {
  try {
    const { number, message } = req.body;

    if (!number) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    const msg = message || 'Test message from CRM';
    await whatsappService.sendMessage(number, msg);

    res.json({
      success: true,
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('WhatsApp test error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Send invoice notification
router.post('/invoice/:id', async (req, res) => {
  try {
    await whatsappService.sendInvoiceNotification(req.params.id);

    res.json({
      success: true,
      message: 'Invoice notification sent'
    });
  } catch (error) {
    console.error('WhatsApp invoice error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Send service completion notification
router.post('/service/:id', async (req, res) => {
  try {
    await whatsappService.sendServiceCompletionNotification(req.params.id);

    res.json({
      success: true,
      message: 'Service completion notification sent'
    });
  } catch (error) {
    console.error('WhatsApp service error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Send appointment confirmation
router.post('/appointment/:id', async (req, res) => {
  try {
    await whatsappService.sendAppointmentConfirmation(req.params.id);

    res.json({
      success: true,
      message: 'Appointment confirmation sent'
    });
  } catch (error) {
    console.error('WhatsApp appointment error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Send reminder notification
router.post('/reminder/:id', async (req, res) => {
  try {
    await whatsappService.sendReminderNotification(req.params.id);

    res.json({
      success: true,
      message: 'Reminder notification sent'
    });
  } catch (error) {
    console.error('WhatsApp reminder error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get WhatsApp status
router.get('/status', async (req, res) => {
  try {
    const client = whatsappService.getClient();
    const isConnected = client !== null;

    res.json({
      success: true,
      connected: isConnected,
      enabled: String(process.env.OPEN_WA_ENABLE || 'false').toLowerCase() === 'true'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

