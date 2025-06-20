import mongoose from 'mongoose';

const followUpSchema = new mongoose.Schema({
  followUpId: {
    type: String,
    unique: true,
    required: true,
  },
  
  // Customer information
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  
  // Assigned staff
  assignedToId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdById: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  // Follow-up details
  title: {
    type: String,
    required: true,
  },
  description: String,
  
  // Follow-up type and purpose
  type: {
    type: String,
    enum: [
      'health_check',      // 健康检查
      'product_feedback',  // 产品反馈
      'reorder_reminder',  // 补货提醒
      'plan_adjustment',   // 计划调整
      'satisfaction_survey', // 满意度调查
      'general_inquiry',   // 一般咨询
      'complaint_resolution', // 投诉处理
      'education',         // 健康教育
      'promotional',       // 促销活动
      'other'             // 其他
    ],
    required: true,
  },
  
  // Priority level
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  
  // Scheduling
  scheduledDate: {
    type: Date,
    required: true,
  },
  scheduledTime: String, // e.g., "14:30"
  
  // Status tracking
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled', 'no_response'],
    default: 'scheduled',
  },
  
  // Communication method
  communicationMethod: {
    type: String,
    enum: ['phone', 'email', 'wechat', 'sms', 'in_person', 'video_call'],
    required: true,
  },
  
  // Follow-up results (filled after completion)
  completedDate: Date,
  actualDuration: Number, // minutes
  
  // Outcome and feedback
  outcome: {
    type: String,
    enum: ['successful', 'partially_successful', 'unsuccessful', 'rescheduled', 'no_contact'],
  },
  
  customerSatisfaction: {
    type: Number,
    min: 1,
    max: 5, // 1-5 rating scale
  },
  
  // 简化跟进结果
  customerFeedback: String,
  recommendations: String,
  
  // 下次跟进
  nextFollowUpDate: Date,
  
  notes: String,
  
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Pre-save middleware to generate follow-up ID
followUpSchema.pre('save', async function(next) {
  if (this.isNew && !this.followUpId) {
    try {
      const count = await mongoose.model('FollowUp').countDocuments();
      const year = new Date().getFullYear();
      const month = String(new Date().getMonth() + 1).padStart(2, '0');
      this.followUpId = `FU${year}${month}${String(count + 1).padStart(4, '0')}`;
    } catch (error) {
      return next(error as Error);
    }
  }
  
  next();
});

// Add indexes for performance (followUpId already has unique index, customerId is in compound indexes below)
followUpSchema.index({ assignedToId: 1 });
followUpSchema.index({ scheduledDate: 1 });
followUpSchema.index({ status: 1 });
followUpSchema.index({ priority: 1 });
followUpSchema.index({ type: 1 });
followUpSchema.index({ createdAt: -1 });

// Compound indexes for common queries
followUpSchema.index({ assignedToId: 1, status: 1, scheduledDate: 1 });
followUpSchema.index({ customerId: 1, status: 1 });
followUpSchema.index({ status: 1, scheduledDate: 1 });

// 简化搜索索引
followUpSchema.index({
  followUpId: 'text',
  title: 'text',
  description: 'text',
});

export default mongoose.models.FollowUp || mongoose.model('FollowUp', followUpSchema);