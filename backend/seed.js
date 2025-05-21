const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Parking = require('./models/Parking');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/parking-system');
    console.log('Connected to MongoDB');

    // Clear existing data
    await Parking.deleteMany({});
    await User.deleteMany({});

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'admin'
    });
    await admin.save();
    console.log('Admin user created');

    // Create parking attendant
    const attendantPassword = await bcrypt.hash('attendant123', 10);
    const attendant = new User({
      firstName: 'Parking',
      lastName: 'Attendant',
      email: 'attendant@example.com',
      password: attendantPassword,
      role: 'parking_attendant'
    });
    await attendant.save();
    console.log('Parking attendant created');

    // Create parking lot
    const parking = new Parking({
      code: 'PARK001',
      name: 'Main Parking Lot',
      availableSpaces: 50,
      location: 'Downtown',
      chargingFeesPerHour: 1000 // 1000 RWF per hour
    });
    await parking.save();
    console.log('Parking lot created');

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase(); 