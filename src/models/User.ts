import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    unique: true,
    sparse: true,
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
    enum: ['system_admin', 'admin', 'customer'],
    default: 'customer',
  },
  phone: String,
  
  // 销售相关信息
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
}, {
  timestamps: true,
});

// 生成员工ID
userSchema.pre('save', async function(next) {
  if (!this.employeeId) {
    // const lastUser = await this.constructor.findOne({}, {}, { sort: { 'createdAt': -1 } });
    const UserModel = mongoose.model('User'); // 直接通过名称获取模型

    // 为 lastUser 提供类型，使其至少包含 employeeId 和 createdAt (如果用于排序)
    const lastUser = await UserModel.findOne({}, {}, { sort: { 'createdAt': -1 } })
        .lean() // 使用 .lean() 获取普通 JS 对象，可能更快且类型更容易处理
        .exec() as { employeeId?: string; createdAt?: Date } | null; 
    let employeeNumber = 1;
    
    if (lastUser && lastUser.employeeId) {
      const lastNumber = parseInt(lastUser.employeeId.replace('EMP', ''));
      employeeNumber = lastNumber + 1;
    }
    
    this.employeeId = `EMP${employeeNumber.toString().padStart(3, '0')}`;
  }
  next();
});

export default mongoose.models.User || mongoose.model('User', userSchema);
