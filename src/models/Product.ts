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
  category: {
    type: String,
    enum: [
      'vitamins', // 维生素
      'minerals', // 矿物质
      'antioxidants', // 抗氧化剂
      'omega', // 欧米伽
      'probiotics', // 益生菌
      'protein', // 蛋白质
      'weight_management', // 体重管理
      'skincare', // 护肤品
      'energy_metabolism', // 能量代谢
      'immune_support', // 免疫支持
      'heart_health', // 心脏健康
      'bone_joint', // 骨骼关节
      'digestive_health', // 消化健康
      'brain_cognitive', // 大脑认知
      'womens_health', // 女性健康
      'mens_health', // 男性健康
      'childrens_health', // 儿童健康
    ],
    required: true,
  },
  
  // 产品详情
  description: String,
  ingredients: [String], // 成分列表
  servingSize: String, // 服用剂量
  servingsPerContainer: Number, // 每瓶份数
  
  // 简化产品信息
  benefits: [String],
  dosage: String,
  instructions: String,
  
  // 简化价格信息
  retailPrice: Number,
  wholesalePrice: Number,
  preferredPrice: Number,
  
  // 库存状态
  stockStatus: {
    type: String,
    enum: ['in_stock', 'low_stock', 'out_of_stock'],
    default: 'in_stock',
  },
  
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// 添加索引
productSchema.index({ productCode: 1 });
productSchema.index({ category: 1 });
productSchema.index({ stockStatus: 1 });
productSchema.index({ popularity: -1 });

export default mongoose.models.Product || mongoose.model('Product', productSchema);
