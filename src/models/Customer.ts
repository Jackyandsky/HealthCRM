import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  customerId: {
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
  
  // 简化健康档案
  healthProfile: {
    height: Number,
    weight: Number,
    allergies: [String],
    medications: [String],
  },
  
  // 简化产品使用记录 - 移除嵌套数组，使用关联
  currentProducts: [String], // 当前使用的产品代码
  
  // 简化跟进管理
  nextContactDate: Date,
  lastContactDate: Date,
  contactFrequency: {
    type: String,
    enum: ['weekly', 'monthly', 'quarterly'],
    default: 'monthly',
  },
  
  // 简化地址
  city: String,
  
  // 客户评分
  customerValue: {
    type: Number,
    min: 1,
    max: 5,
    default: 3,
  },
  
  notes: String,
  
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// 简化索引
customerSchema.index({ customerId: 1 });
customerSchema.index({ email: 1 });
customerSchema.index({ phone: 1 });
customerSchema.index({ salesRep: 1 });
customerSchema.index({ customerType: 1 });
customerSchema.index({ nextContactDate: 1 });

export default mongoose.models.Customer || mongoose.model('Customer', customerSchema);
