const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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

// Patient Schema
const patientSchema = new mongoose.Schema({
  patientId: String,
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  dateOfBirth: Date,
  gender: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
  },
  insurance: {
    provider: String,
    policyNumber: String,
    groupNumber: String,
  },
  medicalHistory: [{
    condition: String,
    diagnosedDate: Date,
    notes: String,
  }],
  allergies: [{
    allergen: String,
    severity: String,
    notes: String,
  }],
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    startDate: Date,
    prescribedBy: String,
  }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Patient = mongoose.models.Patient || mongoose.model('Patient', patientSchema);

async function seedUsers() {
  console.log('🌱 Seeding users...');
  
  const users = [
    {
      name: 'Dr. Sarah Johnson',
      email: 'dr.johnson@healthcrm.com',
      password: await bcrypt.hash('doctor123', 12),
      role: 'doctor',
      phone: '+1-555-0101',
      department: 'Cardiology',
    },
    {
      name: 'Dr. Michael Chen',
      email: 'dr.chen@healthcrm.com',
      password: await bcrypt.hash('doctor123', 12),
      role: 'doctor',
      phone: '+1-555-0102',
      department: 'Neurology',
    },
    {
      name: 'Dr. Emily Rodriguez',
      email: 'dr.rodriguez@healthcrm.com',
      password: await bcrypt.hash('doctor123', 12),
      role: 'doctor',
      phone: '+1-555-0103',
      department: 'Pediatrics',
    },
    {
      name: 'Nurse Lisa Wong',
      email: 'nurse.wong@healthcrm.com',
      password: await bcrypt.hash('nurse123', 12),
      role: 'nurse',
      phone: '+1-555-0201',
      department: 'Emergency',
    },
    {
      name: 'Admin Alice Smith',
      email: 'admin@healthcrm.com',
      password: await bcrypt.hash('admin123', 12),
      role: 'admin',
      phone: '+1-555-0001',
      department: 'Administration',
    },
    {
      name: 'Receptionist Mary Davis',
      email: 'receptionist@healthcrm.com',
      password: await bcrypt.hash('reception123', 12),
      role: 'receptionist',
      phone: '+1-555-0301',
      department: 'Front Desk',
    },
  ];

  await User.deleteMany({});
  const createdUsers = await User.insertMany(users);
  console.log(`✅ Created ${createdUsers.length} users`);
  return createdUsers;
}

async function seedPatients() {
  console.log('🌱 Seeding patients...');
  
  const patients = [
    {
      patientId: 'P001',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@email.com',
      phone: '+1-555-1001',
      dateOfBirth: new Date('1985-03-15'),
      gender: 'male',
      address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
      },
      emergencyContact: {
        name: 'Jane Doe',
        relationship: 'Wife',
        phone: '+1-555-1002',
      },
      insurance: {
        provider: 'Blue Cross Blue Shield',
        policyNumber: 'BC123456789',
        groupNumber: 'GRP001',
      },
      medicalHistory: [
        {
          condition: 'Hypertension',
          diagnosedDate: new Date('2020-01-15'),
          notes: 'Well controlled with medication',
        },
      ],
      allergies: [
        {
          allergen: 'Penicillin',
          severity: 'moderate',
          notes: 'Causes rash',
        },
      ],
      medications: [
        {
          name: 'Lisinopril',
          dosage: '10mg',
          frequency: 'Once daily',
          startDate: new Date('2020-01-15'),
          prescribedBy: 'Dr. Johnson',
        },
      ],
    },
    {
      patientId: 'P002',
      firstName: 'Maria',
      lastName: 'Garcia',
      email: 'maria.garcia@email.com',
      phone: '+1-555-1003',
      dateOfBirth: new Date('1992-07-22'),
      gender: 'female',
      address: {
        street: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90210',
        country: 'USA',
      },
      emergencyContact: {
        name: 'Carlos Garcia',
        relationship: 'Husband',
        phone: '+1-555-1004',
      },
      insurance: {
        provider: 'Aetna',
        policyNumber: 'AET987654321',
        groupNumber: 'GRP002',
      },
      medicalHistory: [
        {
          condition: 'Diabetes Type 2',
          diagnosedDate: new Date('2021-06-10'),
          notes: 'Managing with diet and medication',
        },
      ],
      allergies: [],
      medications: [
        {
          name: 'Metformin',
          dosage: '500mg',
          frequency: 'Twice daily',
          startDate: new Date('2021-06-10'),
          prescribedBy: 'Dr. Chen',
        },
      ],
    },
    {
      patientId: 'P003',
      firstName: 'Robert',
      lastName: 'Johnson',
      email: 'robert.johnson@email.com',
      phone: '+1-555-1005',
      dateOfBirth: new Date('1975-11-08'),
      gender: 'male',
      address: {
        street: '789 Pine St',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        country: 'USA',
      },
      emergencyContact: {
        name: 'Susan Johnson',
        relationship: 'Sister',
        phone: '+1-555-1006',
      },
      insurance: {
        provider: 'Cigna',
        policyNumber: 'CIG456789123',
        groupNumber: 'GRP003',
      },
      medicalHistory: [],
      allergies: [
        {
          allergen: 'Shellfish',
          severity: 'severe',
          notes: 'Anaphylactic reaction',
        },
      ],
      medications: [],
    },
    {
      patientId: 'P004',
      firstName: 'Emily',
      lastName: 'Wilson',
      email: 'emily.wilson@email.com',
      phone: '+1-555-1007',
      dateOfBirth: new Date('2010-04-12'),
      gender: 'female',
      address: {
        street: '321 Elm St',
        city: 'Houston',
        state: 'TX',
        zipCode: '77001',
        country: 'USA',
      },
      emergencyContact: {
        name: 'Jennifer Wilson',
        relationship: 'Mother',
        phone: '+1-555-1008',
      },
      insurance: {
        provider: 'United Healthcare',
        policyNumber: 'UHC789123456',
        groupNumber: 'GRP004',
      },
      medicalHistory: [
        {
          condition: 'Asthma',
          diagnosedDate: new Date('2015-09-20'),
          notes: 'Exercise-induced asthma',
        },
      ],
      allergies: [
        {
          allergen: 'Dust mites',
          severity: 'mild',
          notes: 'Causes sneezing and congestion',
        },
      ],
      medications: [
        {
          name: 'Albuterol inhaler',
          dosage: '90mcg',
          frequency: 'As needed',
          startDate: new Date('2015-09-20'),
          prescribedBy: 'Dr. Rodriguez',
        },
      ],
    },
    {
      patientId: 'P005',
      firstName: 'James',
      lastName: 'Miller',
      email: 'james.miller@email.com',
      phone: '+1-555-1009',
      dateOfBirth: new Date('1968-12-03'),
      gender: 'male',
      address: {
        street: '654 Maple Dr',
        city: 'Phoenix',
        state: 'AZ',
        zipCode: '85001',
        country: 'USA',
      },
      emergencyContact: {
        name: 'Patricia Miller',
        relationship: 'Wife',
        phone: '+1-555-1010',
      },
      insurance: {
        provider: 'Medicare',
        policyNumber: 'MED123456789',
        groupNumber: 'GRP005',
      },
      medicalHistory: [
        {
          condition: 'High Cholesterol',
          diagnosedDate: new Date('2019-03-12'),
          notes: 'Family history of heart disease',
        },
        {
          condition: 'Arthritis',
          diagnosedDate: new Date('2022-01-08'),
          notes: 'Osteoarthritis in knees',
        },
      ],
      allergies: [],
      medications: [
        {
          name: 'Atorvastatin',
          dosage: '20mg',
          frequency: 'Once daily',
          startDate: new Date('2019-03-12'),
          prescribedBy: 'Dr. Johnson',
        },
      ],
    },
  ];

  await Patient.deleteMany({});
  const createdPatients = await Patient.insertMany(patients);
  console.log(`✅ Created ${createdPatients.length} patients`);
  return createdPatients;
}

async function seedDatabase() {
  try {
    await connectDB();
    
    console.log('🚀 Starting database seeding...');
    
    const users = await seedUsers();
    const patients = await seedPatients();
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`Users: ${users.length}`);
    console.log(`Patients: ${patients.length}`);
    
    console.log('\n🔐 Test Login Credentials:');
    console.log('Admin: admin@healthcrm.com / admin123');
    console.log('Doctor: dr.johnson@healthcrm.com / doctor123');
    console.log('Nurse: nurse.wong@healthcrm.com / nurse123');
    console.log('Receptionist: receptionist@healthcrm.com / reception123');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the seeder
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
