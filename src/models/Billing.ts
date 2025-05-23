import mongoose from 'mongoose';

const billingSchema = new mongoose.Schema({
  invoiceId: {
    type: String,
    unique: true,
    required: true,
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
  },
  medicalRecord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicalRecord',
  },
  serviceDate: {
    type: Date,
    required: true,
  },
  services: [{
    code: String, // CPT code
    description: String,
    quantity: {
      type: Number,
      default: 1,
    },
    unitPrice: Number,
    total: Number,
  }],
  subtotal: {
    type: Number,
    required: true,
  },
  tax: {
    type: Number,
    default: 0,
  },
  discount: {
    type: Number,
    default: 0,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  insurance: {
    provider: String,
    claimNumber: String,
    coverage: Number, // percentage
    approvedAmount: Number,
    deductible: Number,
    copay: Number,
  },
  patientPayment: {
    amount: Number,
    method: {
      type: String,
      enum: ['cash', 'card', 'check', 'bank-transfer', 'insurance'],
    },
    transactionId: String,
    date: Date,
  },
  status: {
    type: String,
    enum: ['pending', 'partial', 'paid', 'overdue', 'cancelled'],
    default: 'pending',
  },
  dueDate: Date,
  notes: String,
}, {
  timestamps: true,
});

export default mongoose.models.Billing || mongoose.model('Billing', billingSchema);
