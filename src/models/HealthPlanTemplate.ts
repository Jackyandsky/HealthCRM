import mongoose from 'mongoose'

const templateProductSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productCode: String,
  productName: String,
  dosage: String,
  duration: String,
  purpose: String,
  priority: { 
    type: String, 
    enum: ['essential', 'recommended', 'optional'], 
    default: 'recommended' 
  }
})

const healthPlanTemplateSchema = new mongoose.Schema({
  templateId: {
    type: String,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  category: {
    type: String,
    enum: [
      'weight_management', 'immune_support', 'energy_vitality', 'heart_health',
      'digestive_health', 'bone_joint_health', 'brain_cognitive', 'skin_beauty',
      'general_wellness', 'custom'
    ],
    required: true,
    index: true
  },
  
  // 简化目标受众
  targetAudience: {
    ageGroups: [String],
    genders: [String],
  },
  
  // 典型周期
  duration: {
    type: String,
    default: '3 months'
  },
  
  // 健康目标模板
  healthGoals: [String],
  
  // 产品推荐
  productRecommendations: [templateProductSchema],
  
  // 成本估算
  estimatedMonthlyCost: {
    retail: Number,
    wholesale: Number,
    preferred: Number
  },
  
  status: {
    type: String,
    enum: ['draft', 'active', 'retired'],
    default: 'draft',
    index: true
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // 使用统计
  timesUsed: {
    type: Number,
    default: 0
  },
  
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
})

// 基本索引
healthPlanTemplateSchema.index({ name: 'text', description: 'text' })
healthPlanTemplateSchema.index({ category: 1, status: 1 })

// 自动生成模板ID
healthPlanTemplateSchema.pre('save', async function(next) {
  if (this.isNew && !this.templateId) {
    try {
      const count = await mongoose.model('HealthPlanTemplate').countDocuments()
      this.templateId = `TPL${String(count + 1).padStart(6, '0')}`
    } catch (error) {
      return next(error as Error)
    }
  }
  next()
})

const HealthPlanTemplate = mongoose.models.HealthPlanTemplate || mongoose.model('HealthPlanTemplate', healthPlanTemplateSchema)

export default HealthPlanTemplate