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

// Import the HealthPlan model
const HealthPlan = require('./src/models/HealthPlan.ts').default;

async function testHealthPlan() {
  await connectDB();
  
  try {
    // Find existing customers and users for testing
    const Customer = mongoose.model('Customer');
    const User = mongoose.model('User');
    
    const customers = await Customer.find({ isActive: true }).limit(1);
    const users = await User.find({ isActive: true }).limit(1);
    
    if (customers.length === 0 || users.length === 0) {
      console.log('❌ No customers or users found for testing');
      return;
    }
    
    const customer = customers[0];
    const user = users[0];
    
    console.log('📋 Creating test health plan...');
    
    // Create a test health plan
    const testHealthPlan = new HealthPlan({
      customerId: customer._id,
      customerName: customer.name || 'Test Customer',
      customerEmail: customer.email || '',
      customerPhone: customer.phone || '',
      assignedToId: user._id,
      assignedToName: user.name || 'Test User',
      createdById: user._id,
      createdByName: user.name || 'Test User',
      title: 'Test Health Plan - Basic Wellness',
      description: 'A comprehensive test health plan for basic wellness',
      planType: 'basic',
      status: 'draft',
      priority: 'medium',
      
      healthAssessment: {
        currentHealth: {
          overall_rating: 7,
          energy_level: 6,
          stress_level: 5,
          sleep_quality: 7,
          physical_activity: 'moderate',
          weight: '70',
          height: '175',
          bmi: '22.9'
        },
        medicalHistory: {
          conditions: ['None'],
          medications: [],
          allergies: ['None'],
          surgeries: [],
          familyHistory: ['Diabetes Type 2']
        },
        lifestyle: {
          smoking: 'never',
          alcohol: 'light',
          diet_type: 'balanced',
          exercise_frequency: '3-4_times',
          stress_factors: ['Work pressure'],
          sleep_hours: 7
        },
        nutritionalDeficiencies: []
      },
      
      healthGoals: [
        {
          category: 'weight_management',
          description: 'Maintain current healthy weight',
          targetValue: '70kg',
          currentValue: '70kg',
          targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
          priority: 'medium',
          status: 'active',
          progress: {
            percentage: 50,
            milestones: []
          },
          notes: 'Focus on maintaining current weight through balanced nutrition'
        }
      ],
      
      productRecommendations: [],
      
      timeline: {
        startDate: new Date(),
        reviewDates: [
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
          new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)  // 90 days
        ],
        milestones: []
      },
      
      costAnalysis: {
        estimatedMonthlyCost: {
          retail: 0,
          wholesale: 0,
          preferredCustomer: 0
        },
        totalEstimatedCost: {
          retail: 0,
          wholesale: 0,
          preferredCustomer: 0
        }
      },
      
      progress: {
        overallProgress: 25,
        goalsAchieved: 0,
        totalGoals: 1,
        complianceRate: 85,
        nextReviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      
      feedback: [],
      
      notes: {
        public: 'This is a test health plan to verify the system is working correctly.',
        private: 'Internal notes for testing purposes',
        instructions: 'Follow the basic wellness guidelines',
        warnings: 'Consult healthcare provider for any concerns'
      },
      
      tags: ['test', 'basic', 'wellness']
    });
    
    const saved = await testHealthPlan.save();
    console.log('✅ Test health plan created successfully!');
    console.log('Plan ID:', saved.planId);
    console.log('MongoDB ID:', saved._id);
    
    // Test fetching the health plan
    const fetched = await HealthPlan.findById(saved._id)
      .populate('customerId', 'customerId name email phone category')
      .populate('assignedToId', 'employeeId name email department')
      .populate('createdById', 'employeeId name email department')
      .lean();
    
    console.log('✅ Health plan fetched successfully!');
    console.log('Fetched plan title:', fetched.title);
    console.log('Health goals count:', fetched.healthGoals?.length || 0);
    console.log('Timeline start date:', fetched.timeline?.startDate);
    
  } catch (error) {
    console.error('❌ Error testing health plan:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

testHealthPlan();