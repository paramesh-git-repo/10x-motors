console.log("🟢 whatsapp.js file started running...");

const { create } = require('@open-wa/wa-automate');

console.log("🚀 Starting WhatsApp automation...");

create({
  headless: false,
  useChrome: true,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  sessionDataPath: process.env.HOME + '/whatsapp-session',
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--remote-debugging-port=9222',
  ],
})
  .then((client) => {
    console.log("✅ WhatsApp automation initialized!");
    start(client);
  })
  .catch((err) => {
    console.error("❌ Error initializing WhatsApp automation:", err);
  });

function start(client) {
  console.log('📱 WhatsApp client connected!');

  // 💬 Send a test message immediately when connected
  client
    .sendText('919360726026@c.us', 'Hey bro! WhatsApp automation is working 🚀')
    .then(() => console.log("✅ Test message sent successfully!"))
    .catch((err) => console.error("❌ Failed to send message:", err));

  // 📩 Handle incoming messages
  client.onMessage(async (message) => {
    console.log('📩 Received:', message.body);

    if (message.body.toLowerCase() === 'hi') {
      await client.sendText(message.from, 'Hello 👋 Automated reply from CRM bot.');
    }
  });
}
