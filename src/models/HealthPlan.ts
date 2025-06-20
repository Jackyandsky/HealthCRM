import mongoose from 'mongoose'

const productRecommendationSchema = new mongoose.Schema({
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
  estimatedCost: {
    retail: Number,
    wholesale: Number,
    preferredCustomer: Number
  },
  notes: String
})

const healthGoalSchema = new mongoose.Schema({
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
  description: {
    type: String,
    required: true
  },
  targetValue: String,
  currentValue: String,
  targetDate: Date,
  priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  status: { type: String, enum: ['active', 'achieved', 'paused', 'cancelled'], default: 'active' },
  progress: {
    percentage: { type: Number, min: 0, max: 100, default: 0 },
    milestones: [{
      description: String,
      targetDate: Date,
      completedDate: Date,
      status: { type: String, enum: ['pending', 'completed', 'overdue'], default: 'pending' }
    }]
  },
  notes: String
})

const assessmentSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: [
      'general_health', 'nutrition', 'lifestyle', 'medical_history',
      'fitness_level', 'stress_level', 'sleep_quality', 'dietary_habits'
    ],
    required: true
  },
  questions: [{
    question: String,
    answer: String,
    type: { type: String, enum: ['text', 'number', 'scale', 'multiple_choice', 'boolean'] },
    options: [String],
    score: Number
  }],
  totalScore: Number,
  maxScore: Number,
  assessment_date: { type: Date, default: Date.now },
  assessedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: String
})

const scheduleSchema = new mongoose.Schema({
  type: { type: String, enum: ['consultation', 'follow_up', 'review', 'adjustment'], required: true },
  scheduledDate: { type: Date, required: true },
  completedDate: Date,
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'], default: 'scheduled' },
  notes: String,
  outcomes: String,
  nextActions: [String]
})

const healthPlanSchema = new mongoose.Schema({
  planId: {
    type: String,
    unique: true,
    index: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    index: true
  },
  customerName: {
    type: String,
    required: true
  },
  createdById: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdByName: {
    type: String,
    required: true
  },
  assignedToId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedToName: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  planType: {
    type: String,
    enum: ['basic', 'comprehensive', 'specialized', 'maintenance', 'intensive'],
    default: 'basic'
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'completed', 'cancelled', 'review_needed'],
    default: 'draft',
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Health Assessment
  healthAssessment: {
    currentHealth: {
      overall_rating: { type: Number, min: 1, max: 10 },
      energy_level: { type: Number, min: 1, max: 10 },
      stress_level: { type: Number, min: 1, max: 10 },
      sleep_quality: { type: Number, min: 1, max: 10 },
      physical_activity: { type: String, enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'] },
      bmi: Number,
      weight: Number,
      height: Number
    },
    medicalHistory: {
      conditions: [String],
      medications: [String],
      allergies: [String],
      surgeries: [String],
      familyHistory: [String]
    },
    lifestyle: {
      smoking: { type: String, enum: ['never', 'former', 'occasional', 'regular'] },
      alcohol: { type: String, enum: ['never', 'occasional', 'moderate', 'frequent'] },
      diet_type: { type: String, enum: ['omnivore', 'vegetarian', 'vegan', 'keto', 'paleo', 'other'] },
      exercise_frequency: { type: String, enum: ['none', 'rarely', 'weekly', 'regularly', 'daily'] },
      stress_factors: [String],
      sleep_hours: Number
    },
    nutritionalDeficiencies: [String],
    assessments: [assessmentSchema]
  },

  // Health Goals
  healthGoals: [healthGoalSchema],
  
  // Product Recommendations
  productRecommendations: [productRecommendationSchema],
  
  // Schedule and Milestones
  timeline: {
    startDate: { type: Date, required: true },
    endDate: Date,
    reviewDates: [Date],
    milestones: [{
      title: String,
      description: String,
      targetDate: Date,
      completedDate: Date,
      status: { type: String, enum: ['pending', 'in_progress', 'completed', 'overdue'], default: 'pending' }
    }]
  },
  
  schedule: [scheduleSchema],
  
  // Cost Analysis
  costAnalysis: {
    estimatedMonthlyCost: {
      retail: { type: Number, default: 0 },
      wholesale: { type: Number, default: 0 },
      preferredCustomer: { type: Number, default: 0 }
    },
    totalEstimatedCost: {
      retail: { type: Number, default: 0 },
      wholesale: { type: Number, default: 0 },
      preferredCustomer: { type: Number, default: 0 }
    },
    costBreakdown: [{
      category: String,
      amount: Number,
      percentage: Number
    }]
  },

  // Progress Tracking
  progress: {
    overallProgress: { type: Number, min: 0, max: 100, default: 0 },
    goalsAchieved: { type: Number, default: 0 },
    totalGoals: { type: Number, default: 0 },
    complianceRate: { type: Number, min: 0, max: 100, default: 0 },
    lastReviewDate: Date,
    nextReviewDate: Date,
    adherenceNotes: String
  },

  // Feedback and Adjustments
  feedback: [{
    date: { type: Date, default: Date.now },
    type: { type: String, enum: ['customer', 'provider', 'system'], default: 'customer' },
    category: { type: String, enum: ['satisfaction', 'side_effects', 'effectiveness', 'compliance', 'cost', 'other'] },
    rating: { type: Number, min: 1, max: 5 },
    content: String,
    responseRequired: { type: Boolean, default: false },
    response: String,
    providedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],

  adjustments: [{
    date: { type: Date, default: Date.now },
    type: { type: String, enum: ['product_change', 'dosage_adjustment', 'goal_modification', 'timeline_change', 'other'] },
    reason: String,
    description: String,
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    approved: { type: Boolean, default: false },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvalDate: Date
  }],

  // Notes and Documentation
  notes: {
    public: String,
    private: String,
    instructions: String,
    warnings: String
  },

  tags: [String],
  
  // Template Information
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HealthPlanTemplate'
  },
  templateName: String,
  customizations: [{
    field: String,
    originalValue: String,
    customValue: String,
    reason: String
  }],

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
healthPlanSchema.index({
  title: 'text',
  description: 'text',
  customerName: 'text',
  'notes.public': 'text',
  'notes.instructions': 'text',
  tags: 'text'
})

// Compound indexes for performance
healthPlanSchema.index({ customerId: 1, status: 1 })
healthPlanSchema.index({ assignedToId: 1, status: 1 })
healthPlanSchema.index({ createdAt: -1 })
healthPlanSchema.index({ 'timeline.startDate': 1, 'timeline.endDate': 1 })
healthPlanSchema.index({ planType: 1, status: 1 })

// Pre-save middleware to generate plan ID
healthPlanSchema.pre('save', async function(next) {
  if (this.isNew && !this.planId) {
    try {
      const currentDate = new Date()
      const year = currentDate.getFullYear()
      const month = String(currentDate.getMonth() + 1).padStart(2, '0')
      
      // Count existing plans for this month
      const count = await mongoose.model('HealthPlan').countDocuments({
        planId: new RegExp(`^HP${year}${month}`)
      })
      
      this.planId = `HP${year}${month}${String(count + 1).padStart(4, '0')}`
    } catch (error) {
      return next(error as Error)
    }
  }
  next()
})

// Virtual for plan duration
healthPlanSchema.virtual('duration').get(function() {
  if (this.timeline?.startDate && this.timeline?.endDate) {
    const diffTime = Math.abs(this.timeline.endDate.getTime() - this.timeline.startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }
  return null
})

// Virtual for active goals count
healthPlanSchema.virtual('activeGoalsCount').get(function() {
  return this.healthGoals?.filter((goal: any) => goal.status === 'active').length || 0
})

// Virtual for essential products count
healthPlanSchema.virtual('essentialProductsCount').get(function() {
  return this.productRecommendations?.filter((rec: any) => rec.priority === 'essential').length || 0
})

// Instance method to calculate progress
healthPlanSchema.methods.calculateProgress = function() {
  const goals = this.healthGoals || []
  if (goals.length === 0) return 0
  
  const totalProgress = goals.reduce((sum: number, goal: any) => sum + goal.progress.percentage, 0)
  return Math.round(totalProgress / goals.length)
}

// Instance method to calculate monthly cost
healthPlanSchema.methods.calculateMonthlyCost = function(priceType = 'retail') {
  return (this.productRecommendations || []).reduce((total: number, rec: any) => {
    const productCost = rec.estimatedCost?.[priceType] || 0
    return total + productCost
  }, 0)
}

// Static method to find plans needing review
healthPlanSchema.statics.findPlansNeedingReview = function() {
  const today = new Date()
  return this.find({
    isActive: true,
    status: 'active',
    $or: [
      { 'progress.nextReviewDate': { $lte: today } },
      { 'progress.nextReviewDate': { $exists: false } },
      { status: 'review_needed' }
    ]
  }).populate('customerId assignedToId')
}

const HealthPlan = mongoose.models.HealthPlan || mongoose.model('HealthPlan', healthPlanSchema)

export default HealthPlan