const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function testLogin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email: 'admin@example.com' });
    
    if (!user) {
      console.log('User not found');
      return;
    }

    console.log('User found:', user.email);
    console.log('Checking password...');
    
    const isMatch = await user.matchPassword('password123');
    console.log('Password match:', isMatch);

    // Try with +password
    const userWithPassword = await User.findOne({ email: 'admin@example.com' }).select('+password');
    console.log('Has password field:', !!userWithPassword.password);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testLogin();

