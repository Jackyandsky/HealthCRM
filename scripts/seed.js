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

// Customer Schema
const customerSchema = new mongoose.Schema({
  customerId: String,
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  dateOfBirth: Date,
  gender: String,
  customerType: {
    type: String,
    enum: ['potential', 'new', 'regular', 'vip', 'inactive'],
    default: 'potential',
  },
  salesRep: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  followUp: {
    nextContactDate: Date,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    lastContactDate: Date,
  },
  productUsage: [{
    productName: String,
    effectiveness: Number,
    willContinue: Boolean,
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'blocked'],
    default: 'active',
  },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Customer = mongoose.models.Customer || mongoose.model('Customer', customerSchema);

async function seedUsers() {
  console.log('🌱 Seeding users...');
  
  const users = [
    {
      name: 'System Admin',
      email: 'sysadmin@healthcrm.com',
      password: await bcrypt.hash('admin123', 12),
      role: 'system_admin',
      phone: '+86-138-0000-0001',
      department: 'IT',
    },
    {
      name: 'Sales Manager Zhang',
      email: 'manager.zhang@healthcrm.com',
      password: await bcrypt.hash('admin123', 12),
      role: 'admin',
      phone: '+86-138-0000-0101',
      department: 'Sales',
    },
    {
      name: 'Sales Rep Li',
      email: 'sales.li@healthcrm.com',
      password: await bcrypt.hash('admin123', 12),
      role: 'admin',
      phone: '+86-138-0000-0102',
      department: 'Sales',
    },
    {
      name: 'Customer Wang Ming',
      email: 'wang.ming@customer.com',
      password: await bcrypt.hash('customer123', 12),
      role: 'customer',
      phone: '+86-138-0000-1001',
      department: '',
    },
    {
      name: 'Customer Liu Fang',
      email: 'liu.fang@customer.com',
      password: await bcrypt.hash('customer123', 12),
      role: 'customer',
      phone: '+86-138-0000-1002',
      department: '',
    },
  ];

  await User.deleteMany({});
  const createdUsers = await User.insertMany(users);
  console.log(`✅ Created ${createdUsers.length} users`);
  return createdUsers;
}

async function seedCustomers() {
  console.log('🌱 Seeding customers...');
  
  // Get admin users for sales rep assignment
  const admins = await User.find({ role: { $in: ['admin', 'system_admin'] } });
  
  const customers = [
    {
      customerId: 'C0001',
      firstName: '小明',
      lastName: '王',
      email: 'xiaoming.wang@email.com',
      phone: '+86-138-1001-0001',
      dateOfBirth: new Date('1985-03-15'),
      gender: 'male',
      customerType: 'vip',
      salesRep: admins[0]?._id,
      followUp: {
        nextContactDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        priority: 'high',
        lastContactDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      },
      productUsage: [
        {
          productName: 'USANA CellSentials',
          effectiveness: 4,
          willContinue: true,
        },
      ],
      status: 'active',
    },
    {
      customerId: 'C0002',
      firstName: '小红',
      lastName: '李',
      email: 'xiaohong.li@email.com',
      phone: '+86-138-1002-0002',
      dateOfBirth: new Date('1992-07-22'),
      gender: 'female',
      customerType: 'regular',
      salesRep: admins[1]?._id || admins[0]?._id,
      followUp: {
        nextContactDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        priority: 'medium',
        lastContactDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
      },
      productUsage: [
        {
          productName: 'USANA Probiotics',
          effectiveness: 3,
          willContinue: true,
        },
      ],
      status: 'active',
    },
    {
      customerId: 'C0003',
      firstName: '建国',
      lastName: '张',
      email: 'jianguo.zhang@email.com',
      phone: '+86-138-1003-0003',
      dateOfBirth: new Date('1975-11-08'),
      gender: 'male',
      customerType: 'new',
      salesRep: admins[0]?._id,
      followUp: {
        nextContactDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago (overdue)
        priority: 'urgent',
        lastContactDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 21 days ago
      },
      productUsage: [
        {
          productName: 'USANA BiOmega',
          effectiveness: 2, // Low effectiveness
          willContinue: false,
        },
      ],
      status: 'active',
    },
    {
      customerId: 'C0004',
      firstName: '美丽',
      lastName: '陈',
      email: 'meili.chen@email.com',
      phone: '+86-138-1004-0004',
      dateOfBirth: new Date('2000-04-12'),
      gender: 'female',
      customerType: 'potential',
      salesRep: admins[1]?._id || admins[0]?._id,
      followUp: {
        nextContactDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        priority: 'low',
        lastContactDate: null,
      },
      productUsage: [],
      status: 'active',
    },
    {
      customerId: 'C0005',
      firstName: '勇',
      lastName: '刘',
      email: 'yong.liu@email.com',
      phone: '+86-138-1005-0005',
      dateOfBirth: new Date('1968-12-03'),
      gender: 'male',
      customerType: 'regular',
      salesRep: admins[0]?._id,
      followUp: {
        nextContactDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        priority: 'medium',
        lastContactDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      },
      productUsage: [
        {
          productName: 'USANA MagneCal D',
          effectiveness: 5,
          willContinue: true,
        },
        {
          productName: 'USANA Vita Antioxidant',
          effectiveness: 1, // Very low effectiveness
          willContinue: false,
        },
      ],
      status: 'active',
    },
  ];

  await Customer.deleteMany({});
  const createdCustomers = await Customer.insertMany(customers);
  console.log(`✅ Created ${createdCustomers.length} customers`);
  return createdCustomers;
}

async function seedDatabase() {
  try {
    await connectDB();
    
    console.log('🚀 Starting database seeding...');
    
    const users = await seedUsers();
    const customers = await seedCustomers();
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`Users: ${users.length}`);
    console.log(`Customers: ${customers.length}`);
    
    console.log('\n🔐 Test Login Credentials:');
    console.log('System Admin: sysadmin@healthcrm.com / admin123');
    console.log('Sales Manager: manager.zhang@healthcrm.com / admin123');
    console.log('Sales Rep: sales.li@healthcrm.com / admin123');
    console.log('Customer: wang.ming@customer.com / customer123');
    
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
