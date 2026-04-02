import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();

connectDB();

const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@dorm.com' });

    if (!adminExists) {
      await User.create({
        fullname: 'System Admin',
        email: 'admin@dorm.com',
        password: 'admin123', // Will be hashed by pre-save middlware
        role: 'Admin',
      });
      console.log('Admin user created successfully!');
    } else {
      console.log('Admin user already exists.');
    }
    process.exit();
  } catch (error) {
    console.error(`Error with seeding admin: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
