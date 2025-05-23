// Global types for the application
declare global {
  var mongoose: any
}

export interface User {
  _id: string
  name: string
  email: string
  role: 'admin' | 'doctor' | 'nurse' | 'receptionist'
  phone?: string
  department?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Patient {
  _id: string
  patientId: string
  firstName: string
  lastName: string
  email?: string
  phone: string
  dateOfBirth: string
  gender: 'male' | 'female' | 'other'
  address: {
    street?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
  }
  emergencyContact?: {
    name?: string
    relationship?: string
    phone?: string
  }
  insurance?: {
    provider?: string
    policyNumber?: string
    groupNumber?: string
  }
  medicalHistory?: Array<{
    condition: string
    diagnosedDate: string
    notes?: string
  }>
  allergies?: Array<{
    allergen: string
    severity: 'mild' | 'moderate' | 'severe'
    notes?: string
  }>
  medications?: Array<{
    name: string
    dosage: string
    frequency: string
    startDate: string
    endDate?: string
    prescribedBy: string
  }>
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Appointment {
  _id: string
  appointmentId: string
  patient: string | Patient
  doctor: string | User
  appointmentDate: string
  startTime: string
  endTime: string
  type: 'consultation' | 'follow-up' | 'checkup' | 'emergency' | 'procedure'
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show'
  department?: string
  room?: string
  notes?: string
  symptoms?: string[]
  reasonForVisit?: string
  cancellationReason?: string
  isRecurring: boolean
  recurringPattern?: {
    frequency: 'daily' | 'weekly' | 'monthly'
    interval: number
    endDate?: string
  }
  createdAt: string
  updatedAt: string
}

export interface MedicalRecord {
  _id: string
  recordId: string
  patient: string | Patient
  appointment?: string | Appointment
  doctor: string | User
  visitDate: string
  chiefComplaint?: string
  presentIllness?: string
  vitalSigns?: {
    temperature?: number
    bloodPressure?: {
      systolic?: number
      diastolic?: number
    }
    heartRate?: number
    respiratoryRate?: number
    weight?: number
    height?: number
    bmi?: number
  }
  physicalExamination?: string
  diagnosis?: Array<{
    primary: boolean
    code?: string
    description: string
    notes?: string
  }>
  treatment?: {
    medications?: Array<{
      name: string
      dosage: string
      frequency: string
      duration: string
      instructions: string
    }>
    procedures?: Array<{
      name: string
      description: string
      performedBy: string
      date: string
    }>
    recommendations?: string[]
  }
  labResults?: Array<{
    testName: string
    result: string
    normalRange: string
    unit: string
    date: string
    notes?: string
  }>
  followUp?: {
    required: boolean
    date?: string
    instructions?: string
  }
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Billing {
  _id: string
  invoiceId: string
  patient: string | Patient
  appointment?: string | Appointment
  medicalRecord?: string | MedicalRecord
  serviceDate: string
  services: Array<{
    code?: string
    description: string
    quantity: number
    unitPrice: number
    total: number
  }>
  subtotal: number
  tax: number
  discount: number
  totalAmount: number
  insurance?: {
    provider?: string
    claimNumber?: string
    coverage?: number
    approvedAmount?: number
    deductible?: number
    copay?: number
  }
  patientPayment?: {
    amount?: number
    method?: 'cash' | 'card' | 'check' | 'bank-transfer' | 'insurance'
    transactionId?: string
    date?: string
  }
  status: 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled'
  dueDate?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface DashboardStats {
  totalPatients: number
  todayAppointments: number
  pendingBills: number
  totalRevenue: number
}

export interface ApiResponse<T> {
  message: string
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  currentPage: number
  totalPages: number
  totalCount: number
  hasNext: boolean
  hasPrev: boolean
}
