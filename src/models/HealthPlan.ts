import mongoose from 'mongoose'

const productItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1
  },
  dosage: String,
  frequency: String,
  notes: String
}, { _id: false })

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
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  planType: {
    type: String,
    enum: ['basic', 'comprehensive', 'specialized', 'maintenance', 'intensive'],
    default: 'basic'
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'completed', 'cancelled'],
    default: 'draft',
    index: true
  },
  
  // Simplified product list
  products: [productItemSchema],
  
  // Tags for categorization
  tags: [String],
  
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
})

// 基本索引
healthPlanSchema.index({ customerId: 1 })
healthPlanSchema.index({ tags: 1 })
healthPlanSchema.index({ createdAt: -1 })

// 自动生成计划ID
healthPlanSchema.pre('save', async function(next) {
  if (this.isNew && !this.planId) {
    try {
      const currentDate = new Date()
      const year = currentDate.getFullYear()
      const month = String(currentDate.getMonth() + 1).padStart(2, '0')
      
      const count = await mongoose.model('HealthPlan').countDocuments({
        planId: new RegExp(`^PC${year}${month}`)
      })
      
      this.planId = `PC${year}${month}${String(count + 1).padStart(4, '0')}`
    } catch (error) {
      return next(error as Error)
    }
  }
  next()
})

const HealthPlan = mongoose.models.HealthPlan || mongoose.model('HealthPlan', healthPlanSchema)

export default HealthPlan