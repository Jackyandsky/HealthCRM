import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  user_id: { // Added user_id field for linking to User model
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  },
  customerId: { // Retained existing customerId
    type: String,
    unique: true,
    required: true,
  },
  // 基本信息
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: String,
  phone: {
    type: String,
    required: true,
  },
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
  },
  
  // 客户分类
  customerType: {
    type: String,
    enum: ['potential', 'new', 'regular', 'vip', 'inactive'],
    default: 'potential',
  },
  
  // 销售相关
  salesRep: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // 分配的销售代表
  },
  referredBy: String, // 推荐人
  leadSource: {
    type: String,
    enum: ['website', 'referral', 'social_media', 'event', 'cold_call', 'advertisement', 'other'],
    default: 'other',
  },
  
  // 健康档案
  healthProfile: {
    height: Number, // cm
    weight: Number, // kg
    bmi: Number,
    bloodType: String,
    chronicConditions: [String], // 慢性疾病
    allergies: [String], // 过敏史
    currentMedications: [String], // 当前用药
    healthGoals: [String], // 健康目标
    dietaryRestrictions: [String], // 饮食限制
  },
  
  // USANA产品使用情况
  productUsage: [{
    productName: String,
    productCode: String,
    startDate: Date,
    endDate: Date,
    dosage: String,
    frequency: String,
    purpose: String, // 使用目的
    effectiveness: {
      type: Number,
      min: 1,
      max: 5, // 1-5分效果评价
    },
    sideEffects: String,
    willContinue: Boolean,
    notes: String,
  }],
  
  // 购买历史
  purchaseHistory: [{
    orderDate: Date,
    products: [{
      productName: String,
      productCode: String,
      quantity: Number,
      unitPrice: Number,
      totalPrice: Number,
    }],
    totalAmount: Number,
    paymentMethod: String,
    orderStatus: {
      type: String,
      enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
  }],
  
  // 沟通记录
  communicationHistory: [{
    date: Date,
    type: {
      type: String,
      enum: ['phone', 'email', 'meeting', 'message', 'visit'],
    },
    purpose: {
      type: String,
      enum: ['consultation', 'follow_up', 'sales', 'support', 'complaint'],
    },
    content: String,
    outcome: String,
    nextAction: String,
    contactedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  }],
  
  // 跟进管理
  followUp: {
    nextContactDate: Date,
    frequency: {
      type: String,
      enum: ['weekly', 'biweekly', 'monthly', 'quarterly', 'as_needed'],
      default: 'monthly',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    notes: String,
    lastContactDate: Date,
  },
  
  // 兴趣和需求
  interests: {
    productCategories: [String], // 感兴趣的产品类别
    healthConcerns: [String], // 健康关注点
    budgetRange: {
      type: String,
      enum: ['under_500', '500_1000', '1000_2000', '2000_5000', 'over_5000'],
    },
    purchaseFrequency: {
      type: String,
      enum: ['monthly', 'quarterly', 'semi_annually', 'annually', 'irregular'],
    },
  },
  
  // 地址信息
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  
  // 状态管理
  status: {
    type: String,
    enum: ['active', 'inactive', 'blocked'],
    default: 'active',
  },
  
  // 评分和标签
  customerValue: {
    type: Number,
    min: 1,
    max: 5, // 客户价值评分
    default: 3,
  },
  tags: [String], // 自定义标签
  notes: String, // 备注
  
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// 添加索引
customerSchema.index({ customerId: 1 });
customerSchema.index({ email: 1 });
customerSchema.index({ phone: 1 });
customerSchema.index({ salesRep: 1 });
customerSchema.index({ customerType: 1 });
customerSchema.index({ 'followUp.nextContactDate': 1 });
customerSchema.index({ 'followUp.priority': 1 });

export default mongoose.models.Customer || mongoose.model('Customer', customerSchema);
