import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  patientId: {
    type: String,
    unique: true,
    required: true,
  },
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
  dateOfBirth: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true,
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
  },
  insurance: {
    provider: String,
    policyNumber: String,
    groupNumber: String,
  },
  medicalHistory: [{
    condition: String,
    diagnosedDate: Date,
    notes: String,
  }],
  allergies: [{
    allergen: String,
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe'],
    },
    notes: String,
  }],
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    startDate: Date,
    endDate: Date,
    prescribedBy: String,
    remainingDays: Number, // 剩余用药天数
  }],
  // 新增字段
  patientType: {
    type: String,
    enum: ['regular', 'vip', 'emergency'],
    default: 'regular',
  },
  lastVisitDate: Date,
  nextFollowUpDate: Date, // 下次回访日期
  assignedDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  notes: String, // 特殊备注
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'discharged', 'deceased'],
    default: 'active',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// 添加索引
patientSchema.index({ patientId: 1 });
patientSchema.index({ email: 1 });
patientSchema.index({ phone: 1 });
patientSchema.index({ nextFollowUpDate: 1 });
patientSchema.index({ lastVisitDate: 1 });
patientSchema.index({ assignedDoctor: 1 });

export default mongoose.models.Patient || mongoose.model('Patient', patientSchema);
