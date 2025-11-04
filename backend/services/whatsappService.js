const wa = require('@open-wa/wa-automate');
const Customer = require('../models/Customer');
const Invoice = require('../models/Invoice');
const Reminder = require('../models/Reminder');
const Service = require('../models/Service');

let whatsappClient = null;

// Initialize WhatsApp client
async function initializeWhatsApp() {
  try {
    whatsappClient = await wa.create({
      sessionId: process.env.OPEN_WA_SESSION || 'crm-session',
      headless: process.env.NODE_ENV === 'production',
      useChrome: true,
      qrTimeout: 0,
      authTimeout: 0,
      puppeteerOptions: {
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/google-chrome-stable',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--window-size=1280,720'
        ]
      }
    });

    console.log('✅ WhatsApp client initialized');
    setupMessageHandler();
    
    // Send test message if number is configured
    const TEST_WHATSAPP_NUMBER = process.env.TEST_WHATSAPP_NUMBER;
    if (TEST_WHATSAPP_NUMBER) {
      try {
        await sendMessage(TEST_WHATSAPP_NUMBER, 'Hello! CRM WhatsApp automation is ready.');
        console.log('✅ Test message sent');
      } catch (err) {
        console.error('❌ Failed to send test message:', err.message);
      }
    }
    
    return whatsappClient;
  } catch (err) {
    console.error('❌ Failed to initialize WhatsApp:', err);
    throw err;
  }
}

// Setup message handler
function setupMessageHandler() {
  whatsappClient.onMessage(async (msg) => {
    try {
      console.log('📩 Received:', msg.body, 'from', msg.from);
      
      const message = msg.body.toLowerCase().trim();
      const fromNumber = msg.from.replace('@c.us', '').replace('@s.whatsapp.net', '');

      // Find customer by phone number
      const customer = await Customer.findOne({ 
        $or: [
          { phone: fromNumber },
          { alternateMobile: fromNumber }
        ]
      }).populate('vehicles');

      if (!customer) {
        await sendMessage(msg.from, 'Sorry, your number is not registered in our system. Please contact our office.');
        return;
      }

      // Handle different commands
      if (message === 'hi' || message === 'hello') {
        await sendMessage(msg.from, `Hello ${customer.name}! 👋 How can we help you today?\n\nCommands: status, invoice, reminders, help`);
      } 
      else if (message === 'status' || message === 'my services') {
        await handleStatusCheck(fromNumber, customer);
      }
      else if (message === 'invoice' || message === 'invoices') {
        await handleInvoiceCheck(fromNumber, customer);
      }
      else if (message === 'reminders' || message === 'reminder') {
        await handleReminderCheck(fromNumber, customer);
      }
      else if (message === 'help') {
        await sendMessage(msg.from, `📋 Available Commands:\n\n• status - Check your service status\n• invoice - View pending invoices\n• reminders - Check upcoming reminders\n• help - Show this menu`);
      }
      else {
        await sendMessage(msg.from, 'I didn\'t understand that. Type "help" to see available commands.');
      }
    } catch (err) {
      console.error('Error handling message:', err);
    }
  });
}

// Send message helper
async function sendMessage(toNumber, message) {
  try {
    if (!whatsappClient) {
      throw new Error('WhatsApp client not initialized');
    }

    const formattedNumber = toNumber.includes('@') ? toNumber : `${toNumber}@c.us`;
    await whatsappClient.sendText(formattedNumber, message);
    console.log(`✅ Message sent to ${formattedNumber}`);
  } catch (err) {
    console.error(`❌ Failed to send message to ${toNumber}:`, err.message);
    throw err;
  }
}

// Handle status check
async function handleStatusCheck(fromNumber, customer) {
  try {
    const pendingServices = await Service.find({
      customer: customer._id,
      status: { $in: ['pending', 'in-progress'] }
    }).populate('vehicle').sort({ scheduledAt: 1 }).limit(5);

    if (pendingServices.length === 0) {
      await sendMessage(fromNumber, 'You have no pending services at the moment. ✅');
      return;
    }

    let message = `🔧 Your Service Status:\n\n`;
    pendingServices.forEach((service, index) => {
      message += `${index + 1}. ${service.serviceType}\n`;
      message += `   Status: ${service.status}\n`;
      message += `   Scheduled: ${new Date(service.scheduledAt).toLocaleDateString()}\n`;
      if (service.vehicle) {
        message += `   Vehicle: ${service.vehicle.make} ${service.vehicle.model}\n`;
      }
      message += `\n`;
    });

    await sendMessage(fromNumber, message);
  } catch (err) {
    console.error('Error checking status:', err);
    await sendMessage(fromNumber, 'Sorry, couldn\'t retrieve your service status. Please try again later.');
  }
}

// Handle invoice check
async function handleInvoiceCheck(fromNumber, customer) {
  try {
    const pendingInvoices = await Invoice.find({
      customer: customer._id,
      status: { $in: ['sent', 'overdue'] }
    }).populate('vehicle').sort({ dueDate: 1 }).limit(5);

    if (pendingInvoices.length === 0) {
      await sendMessage(fromNumber, 'You have no pending invoices. ✅');
      return;
    }

    let message = `💰 Your Pending Invoices:\n\n`;
    pendingInvoices.forEach((invoice, index) => {
      message += `${index + 1}. Invoice #${invoice.invoiceNumber}\n`;
      message += `   Amount: $${invoice.total.toFixed(2)}\n`;
      message += `   Due: ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'Not set'}\n`;
      message += `   Status: ${invoice.status}\n\n`;
    });

    await sendMessage(fromNumber, message);
  } catch (err) {
    console.error('Error checking invoices:', err);
    await sendMessage(fromNumber, 'Sorry, couldn\'t retrieve your invoices. Please try again later.');
  }
}

// Handle reminder check
async function handleReminderCheck(fromNumber, customer) {
  try {
    const upcomingReminders = await Reminder.find({
      customer: customer._id,
      status: 'pending',
      scheduledDate: { $gte: new Date() }
    }).populate('vehicle').sort({ scheduledDate: 1 }).limit(5);

    if (upcomingReminders.length === 0) {
      await sendMessage(fromNumber, 'You have no upcoming reminders. ✅');
      return;
    }

    let message = `📅 Your Upcoming Reminders:\n\n`;
    upcomingReminders.forEach((reminder, index) => {
      message += `${index + 1}. ${reminder.title}\n`;
      message += `   Date: ${new Date(reminder.scheduledDate).toLocaleDateString()}\n`;
      message += `   Type: ${reminder.type}\n\n`;
    });

    await sendMessage(fromNumber, message);
  } catch (err) {
    console.error('Error checking reminders:', err);
    await sendMessage(fromNumber, 'Sorry, couldn\'t retrieve your reminders. Please try again later.');
  }
}

// Send service completion notification
async function sendServiceCompletionNotification(serviceId) {
  try {
    const service = await Service.findById(serviceId).populate('customer vehicle');
    if (!service || !service.customer) {
      return;
    }

    const customer = service.customer;
    const phoneNumber = customer.phone.replace(/\D/g, ''); // Remove non-digits
    
    const message = `🎉 Service Complete!\n\n` +
      `Your ${service.serviceType} is ready for pickup.\n` +
      `Vehicle: ${service.vehicle ? service.vehicle.make + ' ' + service.vehicle.model : 'N/A'}\n` +
      `Thank you for choosing us!`;

    await sendMessage(phoneNumber, message);
    console.log(`✅ Service completion notification sent to ${customer.name}`);
  } catch (err) {
    console.error('Error sending service completion notification:', err);
  }
}

// Send invoice notification
async function sendInvoiceNotification(invoiceId) {
  try {
    const invoice = await Invoice.findById(invoiceId).populate('customer vehicle');
    if (!invoice || !invoice.customer) {
      throw new Error('Invoice not found or customer missing');
    }

    const customer = invoice.customer;
    const phoneNumber = customer.phone.replace(/\D/g, '');
    
    if (!phoneNumber) {
      throw new Error('Customer phone number is missing');
    }

    let message = '';
    
    if (invoice.status === 'paid') {
      message = `✅ Payment Received!\n\n` +
        `Thank you for your payment!\n\n` +
        `Invoice #: ${invoice.invoiceNumber}\n` +
        `Amount: $${invoice.total.toFixed(2)}\n` +
        `Paid Date: ${invoice.paidAt ? new Date(invoice.paidAt).toLocaleDateString() : new Date().toLocaleDateString()}\n` +
        `\nWe appreciate your business! 🎉`;
    } else {
      message = `📄 New Invoice\n\n` +
        `Invoice #: ${invoice.invoiceNumber}\n` +
        `Amount: $${invoice.total.toFixed(2)}\n` +
        `Due Date: ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'Not set'}\n` +
        `\nThank you for your business!`;
    }

    await sendMessage(phoneNumber, message);
    console.log(`✅ Invoice notification sent to ${customer.name}`);
  } catch (err) {
    console.error('Error sending invoice notification:', err);
    throw err;
  }
}

// Send payment reminder
async function sendPaymentReminder(invoiceId) {
  try {
    const invoice = await Invoice.findById(invoiceId).populate('customer vehicle');
    if (!invoice || !invoice.customer) {
      return;
    }

    const customer = invoice.customer;
    const phoneNumber = customer.phone.replace(/\D/g, '');
    
    const daysOverdue = invoice.dueDate ? 
      Math.floor((new Date() - new Date(invoice.dueDate)) / (1000 * 60 * 60 * 24)) : 0;
    
    const message = `🔔 Payment Reminder\n\n` +
      `Invoice #: ${invoice.invoiceNumber}\n` +
      `Amount: $${invoice.total.toFixed(2)}\n` +
      `Due Date: ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'Not set'}\n` +
      `${daysOverdue > 0 ? `Days Overdue: ${daysOverdue}` : 'Due Today'}\n` +
      `\nPlease make payment at your earliest convenience.`;

    await sendMessage(phoneNumber, message);
    console.log(`✅ Payment reminder sent to ${customer.name}`);
  } catch (err) {
    console.error('Error sending payment reminder:', err);
  }
}

// Send appointment confirmation
async function sendAppointmentConfirmation(serviceId) {
  try {
    const service = await Service.findById(serviceId).populate('customer vehicle');
    if (!service || !service.customer) {
      return;
    }

    const customer = service.customer;
    const phoneNumber = customer.phone.replace(/\D/g, '');
    
    const message = `✅ Appointment Confirmed\n\n` +
      `Service: ${service.serviceType}\n` +
      `Date: ${new Date(service.scheduledAt).toLocaleString()}\n` +
      `Vehicle: ${service.vehicle ? service.vehicle.make + ' ' + service.vehicle.model : 'N/A'}\n` +
      `\nWe look forward to serving you!`;

    await sendMessage(phoneNumber, message);
    console.log(`✅ Appointment confirmation sent to ${customer.name}`);
  } catch (err) {
    console.error('Error sending appointment confirmation:', err);
  }
}

// Send reminder notification
async function sendReminderNotification(reminderId) {
  try {
    const reminder = await Reminder.findById(reminderId).populate('customer vehicle');
    if (!reminder || !reminder.customer) {
      throw new Error('Reminder not found or customer missing');
    }

    const customer = reminder.customer;
    const phoneNumber = customer.phone.replace(/\D/g, '');
    
    if (!phoneNumber) {
      throw new Error('Customer phone number is missing');
    }

    const message = `📅 Reminder\n\n` +
      `Title: ${reminder.title}\n` +
      `Date: ${new Date(reminder.scheduledDate).toLocaleDateString()}\n` +
      `Type: ${reminder.type}\n` +
      (reminder.description ? `Description: ${reminder.description}\n` : '') +
      `\nPlease be prepared for this reminder.`;

    await sendMessage(phoneNumber, message);
    console.log(`✅ Reminder notification sent to ${customer.name}`);
  } catch (err) {
    console.error('Error sending reminder notification:', err);
    throw err;
  }
}

// Get WhatsApp client instance
function getClient() {
  return whatsappClient;
}

module.exports = {
  initializeWhatsApp,
  sendMessage,
  sendServiceCompletionNotification,
  sendInvoiceNotification,
  sendPaymentReminder,
  sendAppointmentConfirmation,
  sendReminderNotification,
  getClient
};

