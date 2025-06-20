import mongoose from 'mongoose'

const templateProductSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productCode: {
    type: String,
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  dosage: {
    type: String,
    required: true
  },
  frequency: {
    morning: { type: Number, default: 0 },
    afternoon: { type: Number, default: 0 },
    evening: { type: Number, default: 0 },
    notes: String
  },
  duration: {
    value: { type: Number, required: true },
    unit: { type: String, enum: ['days', 'weeks', 'months'], default: 'months' }
  },
  purpose: [String],
  priority: { type: String, enum: ['essential', 'recommended', 'optional'], default: 'recommended' },
  alternatives: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    reason: String,
    conditions: [String]
  }]
})

const templateGoalSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: [
      'weight_management', 'immune_support', 'energy_vitality', 'heart_health',
      'digestive_health', 'bone_joint_health', 'brain_cognitive', 'skin_beauty',
      'sports_performance', 'stress_management', 'sleep_quality', 'anti_aging',
      'detox_cleanse', 'hormonal_balance', 'other'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  targetMetrics: [{
    name: String,
    unit: String,
    targetValue: String,
    timeframe: String
  }],
  priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  expectedDuration: {
    value: Number,
    unit: { type: String, enum: ['days', 'weeks', 'months'] }
  },
  milestones: [{
    title: String,
    description: String,
    timeframe: String,
    criteria: [String]
  }]
})

const assessmentQuestionSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: [
      'general_health', 'nutrition', 'lifestyle', 'medical_history',
      'fitness_level', 'stress_level', 'sleep_quality', 'dietary_habits'
    ],
    required: true
  },
  question: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'number', 'scale', 'multiple_choice', 'boolean'],
    required: true
  },
  options: [String],
  scoring: {
    enabled: { type: Boolean, default: false },
    scale: {
      min: Number,
      max: Number
    },
    weights: [{
      answer: String,
      score: Number
    }]
  },
  required: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
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
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: [
      'weight_loss', 'weight_gain', 'muscle_building', 'immune_boost',
      'energy_enhancement', 'heart_health', 'digestive_health', 'bone_health',
      'brain_health', 'skin_beauty', 'sports_nutrition', 'stress_relief',
      'sleep_improvement', 'anti_aging', 'detox', 'hormonal_balance',
      'general_wellness', 'custom'
    ],
    required: true,
    index: true
  },
  targetAudience: {
    ageGroups: [{
      type: String,
      enum: ['children', 'teens', 'young_adults', 'adults', 'seniors']
    }],
    genders: [{
      type: String,
      enum: ['male', 'female', 'all']
    }],
    lifestyles: [{
      type: String,
      enum: ['sedentary', 'active', 'athletic', 'professional', 'student', 'retired']
    }],
    healthConditions: [String],
    excludeConditions: [String]
  },
  duration: {
    typical: {
      value: { type: Number, required: true },
      unit: { type: String, enum: ['weeks', 'months'], default: 'months' }
    },
    minimum: {
      value: Number,
      unit: { type: String, enum: ['weeks', 'months'] }
    },
    maximum: {
      value: Number,
      unit: { type: String, enum: ['weeks', 'months'] }
    }
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  
  // Template Components
  assessmentQuestions: [assessmentQuestionSchema],
  healthGoals: [templateGoalSchema],
  productRecommendations: [templateProductSchema],
  
  // Schedule Template
  scheduleTemplate: {
    initialConsultation: {
      required: { type: Boolean, default: true },
      timeframe: String,
      duration: Number
    },
    followUpSchedule: [{
      type: { type: String, enum: ['follow_up', 'review', 'adjustment'] },
      interval: {
        value: Number,
        unit: { type: String, enum: ['days', 'weeks', 'months'] }
      },
      duration: Number,
      description: String
    }],
    milestoneReviews: [{
      title: String,
      timeframe: String,
      criteria: [String]
    }]
  },

  // Cost Information
  costEstimate: {
    monthly: {
      retail: { min: Number, max: Number, average: Number },
      wholesale: { min: Number, max: Number, average: Number },
      preferredCustomer: { min: Number, max: Number, average: Number }
    },
    total: {
      retail: { min: Number, max: Number, average: Number },
      wholesale: { min: Number, max: Number, average: Number },
      preferredCustomer: { min: Number, max: Number, average: Number }
    }
  },

  // Success Metrics
  successCriteria: [{
    metric: String,
    targetValue: String,
    timeframe: String,
    priority: { type: String, enum: ['critical', 'important', 'nice_to_have'] }
  }],

  expectedOutcomes: [{
    category: String,
    description: String,
    timeframe: String,
    probability: { type: Number, min: 0, max: 100 }
  }],

  // Usage Instructions
  instructions: {
    preparation: [String],
    implementation: [String],
    monitoring: [String],
    adjustments: [String]
  },

  contraindications: [String],
  warnings: [String],
  prerequisites: [String],

  // Template Metadata
  version: {
    type: String,
    default: '1.0'
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'retired', 'under_review'],
    default: 'draft',
    index: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalDate: Date,
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Usage Statistics
  usageStats: {
    timesUsed: { type: Number, default: 0 },
    successRate: { type: Number, min: 0, max: 100, default: 0 },
    averageRating: { type: Number, min: 0, max: 5, default: 0 },
    lastUsed: Date,
    feedback: [{
      rating: { type: Number, min: 1, max: 5 },
      comment: String,
      providedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      date: { type: Date, default: Date.now }
    }]
  },

  tags: [String],
  
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Create text index for search
healthPlanTemplateSchema.index({
  name: 'text',
  description: 'text',
  category: 'text',
  tags: 'text'
})

// Compound indexes for performance
healthPlanTemplateSchema.index({ category: 1, status: 1 })
healthPlanTemplateSchema.index({ 'targetAudience.ageGroups': 1, 'targetAudience.genders': 1 })
healthPlanTemplateSchema.index({ difficulty: 1, category: 1 })
healthPlanTemplateSchema.index({ createdAt: -1 })

// Pre-save middleware to generate template ID
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

// Virtual for total products count
healthPlanTemplateSchema.virtual('totalProductsCount').get(function() {
  return this.productRecommendations.length
})

// Virtual for essential products count
healthPlanTemplateSchema.virtual('essentialProductsCount').get(function() {
  return this.productRecommendations.filter((rec: any) => rec.priority === 'essential').length
})

// Virtual for assessment questions count
healthPlanTemplateSchema.virtual('assessmentQuestionsCount').get(function() {
  return this.assessmentQuestions.length
})

// Instance method to calculate estimated cost
healthPlanTemplateSchema.methods.calculateEstimatedCost = function(priceType = 'retail', duration = 1) {
  const monthlyCost = this.productRecommendations.reduce((total: number, rec: any) => {
    // This would need to be calculated based on actual product prices
    // For now, return the template estimate
    return total
  }, 0)
  
  return {
    monthly: this.costEstimate.monthly[priceType]?.average || 0,
    total: (this.costEstimate.monthly[priceType]?.average || 0) * duration
  }
}

// Static method to find templates by criteria
healthPlanTemplateSchema.statics.findByCriteria = function(criteria: any) {
  const filter: any = { isActive: true, status: 'active' }
  
  if (criteria.category) filter.category = criteria.category
  if (criteria.difficulty) filter.difficulty = criteria.difficulty
  if (criteria.ageGroup) filter['targetAudience.ageGroups'] = criteria.ageGroup
  if (criteria.gender) filter['targetAudience.genders'] = { $in: [criteria.gender, 'all'] }
  if (criteria.lifestyle) filter['targetAudience.lifestyles'] = criteria.lifestyle
  
  return this.find(filter)
    .populate('createdBy', 'name email')
    .populate('approvedBy', 'name email')
    .sort({ 'usageStats.successRate': -1, 'usageStats.timesUsed': -1 })
}

// Static method to get popular templates
healthPlanTemplateSchema.statics.getPopularTemplates = function(limit = 10) {
  return this.find({ isActive: true, status: 'active' })
    .sort({ 'usageStats.timesUsed': -1, 'usageStats.averageRating': -1 })
    .limit(limit)
    .populate('createdBy', 'name email')
}

const HealthPlanTemplate = mongoose.models.HealthPlanTemplate || mongoose.model('HealthPlanTemplate', healthPlanTemplateSchema)

export default HealthPlanTemplate