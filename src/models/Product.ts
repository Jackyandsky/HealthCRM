import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  productCode: {
    type: String,
    unique: true,
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  brand: { // Added brand field
    type: String,
    default: 'USANA',
  },
  category_id: { // Renamed from category, changed type and added ref
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  images: [String], // Added images field for URLs

  // 产品详情
  description: String,
  ingredients: [String], // 成分列表
  servingSize: String, // 服用剂量
  servingsPerContainer: Number, // 每瓶份数
  
  // 适用人群
  targetAudience: {
    ageGroups: [String], // 年龄组
    genders: [String], // 性别
    healthGoals: [String], // 健康目标
    lifestyles: [String], // 生活方式
  },
  
  // 功效和好处
  benefits: [String],
  healthConcerns: [String], // 针对的健康问题
  
  // 使用指导
  recommendedDosage: String,
  usageInstructions: String,
  precautions: [String], // 注意事项
  contraindications: [String], // 禁忌症
  
  // 价格信息
  retailPrice: Number,
  wholesalePrice: Number,
  preferredCustomerPrice: Number,
  points: Number, // 积分值
  
  // 库存状态
  stockStatus: {
    type: String,
    enum: ['in_stock', 'low_stock', 'out_of_stock', 'discontinued'],
    default: 'in_stock',
  },
  
  // 推荐搭配
  recommendedCombinations: [{
    productCode: String,
    productName: String,
    reason: String, // 搭配理由
  }],
  
  // 销售数据
  popularity: {
    type: Number,
    default: 0, // 受欢迎程度评分
  },
  
  isActive: {
    type: Boolean,
    default: true,
  },
  tags: [{ // Added tags field
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag',
  }],
  created_by_admin_id: { // Added created_by_admin_id field
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// 添加索引
productSchema.index({ productCode: 1 });
productSchema.index({ category_id: 1 }); // Updated index for category_id
productSchema.index({ stockStatus: 1 });
productSchema.index({ popularity: -1 });
productSchema.index({ tags: 1 }); // Added index for tags
productSchema.index({ created_by_admin_id: 1 }); // Added index for created_by_admin_id

export default mongoose.models.Product || mongoose.model('Product', productSchema);
