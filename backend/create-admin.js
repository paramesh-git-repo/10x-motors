const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crm');
    console.log('✅ Connected to MongoDB');

    // Check if admin user exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    
    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists:');
      console.log('   Email: admin@example.com');
      console.log('   Name:', existingAdmin.name);
      console.log('   Role:', existingAdmin.role);
      console.log('   Is Active:', existingAdmin.isActive);
      console.log('\n⚠️  If you forgot the password, you can:');
      console.log('   1. Use the forgot password feature');
      console.log('   2. Or reset it in MongoDB');
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
      isActive: true
    });

    console.log('✅ Admin user created successfully!');
    console.log('   Email: admin@example.com');
    console.log('   Password: password123');
    console.log('   Role: admin');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createAdmin();
