const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME;

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: DB_NAME,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  phone: String,
  department: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function createUsersWithCorrectPasswords() {
  await connectDB();
  
  console.log('🔐 Creating users with correct password hashes...');
  
  // Generate password hashes
  const adminHash = await bcrypt.hash('admin123', 12);
  const doctorHash = await bcrypt.hash('doctor123', 12);
  const nurseHash = await bcrypt.hash('nurse123', 12);
  const receptionHash = await bcrypt.hash('reception123', 12);
  
  const users = [
    {
      name: 'Admin Alice Smith',
      email: 'admin@healthcrm.com',
      password: adminHash,
      role: 'admin',
      phone: '+1-555-0001',
      department: 'Administration',
    },
    {
      name: 'Dr. Sarah Johnson',
      email: 'dr.johnson@healthcrm.com',
      password: doctorHash,
      role: 'doctor',
      phone: '+1-555-0101',
      department: 'Cardiology',
    },
    {
      name: 'Dr. Michael Chen',
      email: 'dr.chen@healthcrm.com',
      password: doctorHash,
      role: 'doctor',
      phone: '+1-555-0102',
      department: 'Neurology',
    },
    {
      name: 'Dr. Emily Rodriguez',
      email: 'dr.rodriguez@healthcrm.com',
      password: doctorHash,
      role: 'doctor',
      phone: '+1-555-0103',
      department: 'Pediatrics',
    },
    {
      name: 'Nurse Lisa Wong',
      email: 'nurse.wong@healthcrm.com',
      password: nurseHash,
      role: 'nurse',
      phone: '+1-555-0201',
      department: 'Emergency',
    },
    {
      name: 'Receptionist Mary Davis',
      email: 'receptionist@healthcrm.com',
      password: receptionHash,
      role: 'receptionist',
      phone: '+1-555-0301',
      department: 'Front Desk',
    },
  ];

  await User.deleteMany({});
  const createdUsers = await User.insertMany(users);
  
  console.log(`✅ Created ${createdUsers.length} users with correct passwords`);
  console.log('\n🔐 Test Login Credentials:');
  console.log('Admin: admin@healthcrm.com / admin123');
  console.log('Doctor: dr.johnson@healthcrm.com / doctor123');
  console.log('Nurse: nurse.wong@healthcrm.com / nurse123');
  console.log('Receptionist: receptionist@healthcrm.com / reception123');
  
  await mongoose.disconnect();
  console.log('🔌 Disconnected from MongoDB');
}

createUsersWithCorrectPasswords().catch(console.error);
