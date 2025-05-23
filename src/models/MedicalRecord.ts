import mongoose from 'mongoose';

const medicalRecordSchema = new mongoose.Schema({
  recordId: {
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
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  visitDate: {
    type: Date,
    required: true,
  },
  chiefComplaint: String,
  presentIllness: String,
  vitalSigns: {
    temperature: Number,
    bloodPressure: {
      systolic: Number,
      diastolic: Number,
    },
    heartRate: Number,
    respiratoryRate: Number,
    weight: Number,
    height: Number,
    bmi: Number,
  },
  physicalExamination: String,
  diagnosis: [{
    primary: Boolean,
    code: String, // ICD-10 code
    description: String,
    notes: String,
  }],
  treatment: {
    medications: [{
      name: String,
      dosage: String,
      frequency: String,
      duration: String,
      instructions: String,
    }],
    procedures: [{
      name: String,
      description: String,
      performedBy: String,
      date: Date,
    }],
    recommendations: [String],
  },
  labResults: [{
    testName: String,
    result: String,
    normalRange: String,
    unit: String,
    date: Date,
    notes: String,
  }],
  followUp: {
    required: Boolean,
    date: Date,
    instructions: String,
  },
  notes: String,
}, {
  timestamps: true,
});

export default mongoose.models.MedicalRecord || mongoose.model('MedicalRecord', medicalRecordSchema);
