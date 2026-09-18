// Seed script to create an admin user
// Usage: node scripts/seedAdmin.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });
dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const seedAdmin = async () => {
  await connectDB();

  const adminExists = await User.findOne({ isAdmin: true });
  if (adminExists) {
    console.log(`Admin already exists: ${adminExists.username}`);
    process.exit(0);
  }

  try {
    const admin = await User.create({
      fullname: 'System Admin',
      username: 'admin',
      email: 'admin@codfel.com',
      password: 'admin123',
      isAdmin: true,
    });

    console.log('✅ Admin created successfully:');
    console.log(`   Username: ${admin.username}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: admin123`);
  } catch (error) {
    console.error('Error creating admin:', error.message);
  }

  process.exit(0);
};

seedAdmin();
