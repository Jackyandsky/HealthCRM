import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  appointmentId: {
    type: String,
    unique: true,
    required: true,
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  appointmentDate: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['consultation', 'follow-up', 'checkup', 'emergency', 'procedure'],
    required: true,
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled',
  },
  department: String,
  room: String,
  notes: String,
  symptoms: [String],
  reasonForVisit: String,
  cancellationReason: String,
  isRecurring: {
    type: Boolean,
    default: false,
  },
  recurringPattern: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
    },
    interval: Number,
    endDate: Date,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);
