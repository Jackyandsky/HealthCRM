import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    unique: true,
    sparse: true, // Added sparse for optional unique field
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['system_admin', 'admin', 'customer', 'sales_manager', 'sales_rep', 'customer_service', 'marketing'],
    // Removed default to enforce explicit role assignment
  },
  phone: String, // Retained

  // New fields from description.txt
  managing_admin_id: { // For customers, tracks their managing admin
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    sparse: true,
  },
  tags: [{ // Renamed from user_tags for consistency with description.txt
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag', // Assuming a 'Tag' model will be created
  }],
  address: {
    street: String,
    city: String,
    state_province: String,
    postal_code: String,
    country: String,
  },
  preferences: {
    communication_prefs: {
      email_notifications: { type: Boolean, default: true },
      sms_notifications: { type: Boolean, default: false },
    },
    language: { type: String, default: 'en' },
  },
  other_info: mongoose.Schema.Types.Mixed,

  // 销售相关信息 (Staff-specific, should be optional)
  salesInfo: {
    territory: String, // 销售区域
    teamLead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    commissionRate: Number, // 佣金比例
    salesGoal: {
      monthly: Number,
      quarterly: Number,
      annual: Number,
    },
    certification: {
      level: String, // 认证级别
      expiryDate: Date,
    },
  },
  
  // 业绩统计
  performance: {
    currentMonth: {
      sales: Number,
      customers: Number,
      orders: Number,
    },
    currentQuarter: {
      sales: Number,
      customers: Number,
      orders: Number,
    },
    currentYear: {
      sales: Number,
      customers: Number,
      orders: Number,
    },
  },
  
  // 客户管理权限
  customerAccess: {
    canViewAll: Boolean,
    assignedTerritories: [String],
    customerLimit: Number,
  },
  
  avatar: String,
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: Date,
  // avatar: String, // This was already present and is retained
}, {
  timestamps: true, // Retained
});

// Modified pre-save hook for employeeId generation
userSchema.pre('save', async function(next) {
  // Only generate employeeId if the role is not 'customer' and employeeId is not already set
  if (this.role !== 'customer' && !this.employeeId) {
    // Simple sequential ID generation for non-customer roles
    // For a more robust solution in a distributed environment, consider UUIDs or a dedicated sequence generator.
    const lastUserWithEmployeeId = await this.constructor.findOne({ employeeId: { $exists: true, $ne: null } }, {}, { sort: { 'employeeId': -1 } });
    let employeeNumber = 1;
    
    if (lastUserWithEmployeeId && lastUserWithEmployeeId.employeeId) {
      const match = lastUserWithEmployeeId.employeeId.match(/EMP(\d+)/);
      if (match && match[1]) {
        const lastNumber = parseInt(match[1]);
        employeeNumber = lastNumber + 1;
      }
    }
    this.employeeId = `EMP${employeeNumber.toString().padStart(3, '0')}`;
  }
  
  // Ensure employeeId is not set for 'customer' role if it somehow got a value
  // Or, if it's meant to be strictly null for customers, ensure it here.
  // For now, we'll allow it to be null if the role is customer and it wasn't set.
  // If a customer is changed to a non-customer role, the ID would be generated on next save if not present.

  next();
});

export default mongoose.models.User || mongoose.model('User', userSchema);
