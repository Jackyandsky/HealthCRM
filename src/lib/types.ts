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

export interface Product {
  _id: string
  productCode: string
  productName: string
  category: string
  description?: string
  ingredients?: string[]
  servingSize?: string
  servingsPerContainer?: number
  targetAudience?: {
    ageGroups?: string[]
    genders?: string[]
    healthGoals?: string[]
    lifestyles?: string[]
  }
  benefits?: string[]
  healthConcerns?: string[]
  recommendedDosage?: string
  usageInstructions?: string
  precautions?: string[]
  contraindications?: string[]
  retailPrice?: number
  wholesalePrice?: number
  preferredCustomerPrice?: number
  points?: number
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued'
  recommendedCombinations?: Array<{
    productCode: string
    productName: string
    reason: string
  }>
  popularity: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ProductCategory {
  id: string
  name: string
  englishName: string
  productCount: number
  lowStockCount: number
  outOfStockCount: number
}

export interface PurchaseItem {
  productId: string
  productCode: string
  productName: string
  quantity: number
  unitPrice: number
  priceType: 'retail' | 'wholesale' | 'preferred_customer'
  totalPrice: number
  discount: number
  notes?: string
}

export interface Purchase {
  _id: string
  purchaseId: string
  customerId: string | any
  customerName: string
  customerEmail?: string
  customerPhone?: string
  salesRepId: string | any
  salesRepName: string
  items: PurchaseItem[]
  subtotal: number
  totalDiscount: number
  tax: number
  taxRate: number
  shippingCost: number
  totalAmount: number
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'check' | 'points' | 'mixed'
  paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded' | 'cancelled'
  paidAmount: number
  paymentDate?: string
  paymentReference?: string
  commissionRate: number
  commissionAmount: number
  commissionPaid: boolean
  commissionPaidDate?: string
  orderStatus: 'draft' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned'
  orderDate: string
  shippingDate?: string
  deliveryDate?: string
  trackingNumber?: string
  shippingAddress?: {
    name?: string
    street?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
    phone?: string
  }
  notes?: string
  internalNotes?: string
  source: 'online' | 'phone' | 'in_person' | 'referral' | 'event'
  returnRequested: boolean
  returnDate?: string
  returnReason?: string
  refundAmount: number
  refundDate?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface PurchaseAnalytics {
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  totalCommission: number
  totalItemsSold: number
  uniqueCustomers: number
}

export interface FollowUpActionItem {
  description: string
  dueDate?: string
  assignedTo?: string
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'in_progress' | 'completed'
}

export interface ProductUsage {
  productId: string
  productName?: string
  adherence: 'excellent' | 'good' | 'fair' | 'poor'
  effectiveness: number
  remainingQuantity?: number
  notes?: string
}

export interface FollowUp {
  _id: string
  followUpId: string
  customerId: string | any
  customerName: string
  customerEmail?: string
  customerPhone?: string
  assignedToId: string | any
  assignedToName: string
  createdById: string | any
  createdByName: string
  title: string
  description?: string
  type: 'health_check' | 'product_feedback' | 'reorder_reminder' | 'plan_adjustment' | 
        'satisfaction_survey' | 'general_inquiry' | 'complaint_resolution' | 'education' | 
        'promotional' | 'other'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  scheduledDate: string
  scheduledTime?: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled' | 'no_response'
  communicationMethod: 'phone' | 'email' | 'wechat' | 'sms' | 'in_person' | 'video_call'
  completedDate?: string
  actualDuration?: number
  outcome?: 'successful' | 'partially_successful' | 'unsuccessful' | 'rescheduled' | 'no_contact'
  customerSatisfaction?: number
  customerFeedback?: string
  healthStatus?: {
    currentCondition?: string
    improvements?: string[]
    concerns?: string[]
    sideEffects?: string[]
  }
  productUsage?: ProductUsage[]
  actionItems?: FollowUpActionItem[]
  recommendations?: string[]
  nextFollowUpDate?: string
  nextFollowUpReason?: string
  internalNotes?: string
  publicNotes?: string
  attachments?: Array<{
    filename: string
    url: string
    uploadDate: string
  }>
  relatedPurchaseId?: string
  relatedPlanId?: string
  reminderSent: boolean
  reminderDate?: string
  tags?: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface HealthPlan {
  _id: string
  planId: string
  customerId: string | any
  customerName: string
  createdById: string | any
  createdByName: string
  assignedToId: string | any
  assignedToName: string
  title: string
  description?: string
  planType: 'basic' | 'comprehensive' | 'specialized' | 'maintenance' | 'intensive'
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled' | 'review_needed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  
  healthAssessment: {
    currentHealth: {
      overall_rating?: number
      energy_level?: number
      stress_level?: number
      sleep_quality?: number
      physical_activity?: string
      bmi?: number
      weight?: number
      height?: number
    }
    medicalHistory: {
      conditions?: string[]
      medications?: string[]
      allergies?: string[]
      surgeries?: string[]
      familyHistory?: string[]
    }
    lifestyle: {
      smoking?: string
      alcohol?: string
      diet_type?: string
      exercise_frequency?: string
      stress_factors?: string[]
      sleep_hours?: number
    }
    nutritionalDeficiencies?: string[]
    assessments?: Array<{
      category: string
      questions: Array<{
        question: string
        answer: string
        type: string
        options?: string[]
        score?: number
      }>
      totalScore?: number
      maxScore?: number
      assessment_date: string
      assessedBy: string | any
      notes?: string
    }>
  }

  healthGoals: Array<{
    category: string
    description: string
    targetValue?: string
    currentValue?: string
    targetDate?: string
    priority: 'high' | 'medium' | 'low'
    status: 'active' | 'achieved' | 'paused' | 'cancelled'
    progress: {
      percentage: number
      milestones: Array<{
        description: string
        targetDate?: string
        completedDate?: string
        status: 'pending' | 'completed' | 'overdue'
      }>
    }
    notes?: string
  }>

  productRecommendations: Array<{
    productId: string | any
    productCode: string
    productName: string
    dosage: string
    frequency: {
      morning: number
      afternoon: number
      evening: number
      notes?: string
    }
    duration: {
      value: number
      unit: 'days' | 'weeks' | 'months'
    }
    purpose: string[]
    priority: 'essential' | 'recommended' | 'optional'
    estimatedCost: {
      retail: number
      wholesale: number
      preferredCustomer: number
    }
    notes?: string
  }>

  timeline: {
    startDate: string
    endDate?: string
    reviewDates: string[]
    milestones: Array<{
      title: string
      description: string
      targetDate?: string
      completedDate?: string
      status: 'pending' | 'in_progress' | 'completed' | 'overdue'
    }>
  }

  schedule: Array<{
    type: 'consultation' | 'follow_up' | 'review' | 'adjustment'
    scheduledDate: string
    completedDate?: string
    status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'
    notes?: string
    outcomes?: string
    nextActions?: string[]
  }>

  costAnalysis: {
    estimatedMonthlyCost: {
      retail: number
      wholesale: number
      preferredCustomer: number
    }
    totalEstimatedCost: {
      retail: number
      wholesale: number
      preferredCustomer: number
    }
    costBreakdown: Array<{
      category: string
      amount: number
      percentage: number
    }>
  }

  progress: {
    overallProgress: number
    goalsAchieved: number
    totalGoals: number
    complianceRate: number
    lastReviewDate?: string
    nextReviewDate?: string
    adherenceNotes?: string
  }

  feedback: Array<{
    date: string
    type: 'customer' | 'provider' | 'system'
    category: 'satisfaction' | 'side_effects' | 'effectiveness' | 'compliance' | 'cost' | 'other'
    rating?: number
    content: string
    responseRequired: boolean
    response?: string
    providedBy?: string | any
  }>

  adjustments: Array<{
    date: string
    type: 'product_change' | 'dosage_adjustment' | 'goal_modification' | 'timeline_change' | 'other'
    reason: string
    description: string
    changedBy: string | any
    approved: boolean
    approvedBy?: string | any
    approvalDate?: string
  }>

  notes: {
    public?: string
    private?: string
    instructions?: string
    warnings?: string
  }

  tags: string[]
  templateId?: string | any
  templateName?: string
  customizations: Array<{
    field: string
    originalValue: string
    customValue: string
    reason: string
  }>
  
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface HealthPlanTemplate {
  _id: string
  templateId: string
  name: string
  description: string
  category: string
  targetAudience: {
    ageGroups: string[]
    genders: string[]
    lifestyles: string[]
    healthConditions: string[]
    excludeConditions: string[]
  }
  duration: {
    typical: {
      value: number
      unit: 'weeks' | 'months'
    }
    minimum?: {
      value: number
      unit: 'weeks' | 'months'
    }
    maximum?: {
      value: number
      unit: 'weeks' | 'months'
    }
  }
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  
  assessmentQuestions: Array<{
    category: string
    question: string
    type: 'text' | 'number' | 'scale' | 'multiple_choice' | 'boolean'
    options?: string[]
    scoring?: {
      enabled: boolean
      scale?: {
        min: number
        max: number
      }
      weights?: Array<{
        answer: string
        score: number
      }>
    }
    required: boolean
    order: number
  }>

  healthGoals: Array<{
    category: string
    title: string
    description: string
    targetMetrics: Array<{
      name: string
      unit: string
      targetValue: string
      timeframe: string
    }>
    priority: 'high' | 'medium' | 'low'
    expectedDuration: {
      value: number
      unit: 'days' | 'weeks' | 'months'
    }
    milestones: Array<{
      title: string
      description: string
      timeframe: string
      criteria: string[]
    }>
  }>

  productRecommendations: Array<{
    productId: string | any
    productCode: string
    productName: string
    dosage: string
    frequency: {
      morning: number
      afternoon: number
      evening: number
      notes?: string
    }
    duration: {
      value: number
      unit: 'days' | 'weeks' | 'months'
    }
    purpose: string[]
    priority: 'essential' | 'recommended' | 'optional'
    alternatives: Array<{
      productId: string | any
      reason: string
      conditions: string[]
    }>
  }>

  scheduleTemplate: {
    initialConsultation: {
      required: boolean
      timeframe?: string
      duration?: number
    }
    followUpSchedule: Array<{
      type: 'follow_up' | 'review' | 'adjustment'
      interval: {
        value: number
        unit: 'days' | 'weeks' | 'months'
      }
      duration?: number
      description?: string
    }>
    milestoneReviews: Array<{
      title: string
      timeframe: string
      criteria: string[]
    }>
  }

  costEstimate: {
    monthly: {
      retail: { min: number; max: number; average: number }
      wholesale: { min: number; max: number; average: number }
      preferredCustomer: { min: number; max: number; average: number }
    }
    total: {
      retail: { min: number; max: number; average: number }
      wholesale: { min: number; max: number; average: number }
      preferredCustomer: { min: number; max: number; average: number }
    }
  }

  successCriteria: Array<{
    metric: string
    targetValue: string
    timeframe: string
    priority: 'critical' | 'important' | 'nice_to_have'
  }>

  expectedOutcomes: Array<{
    category: string
    description: string
    timeframe: string
    probability: number
  }>

  instructions: {
    preparation: string[]
    implementation: string[]
    monitoring: string[]
    adjustments: string[]
  }

  contraindications: string[]
  warnings: string[]
  prerequisites: string[]

  version: string
  status: 'draft' | 'active' | 'retired' | 'under_review'
  approvedBy?: string | any
  approvalDate?: string
  createdBy: string | any
  lastModifiedBy?: string | any

  usageStats: {
    timesUsed: number
    successRate: number
    averageRating: number
    lastUsed?: string
    feedback: Array<{
      rating: number
      comment: string
      providedBy: string | any
      date: string
    }>
  }

  tags: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface DashboardStats {
  totalPatients: number
  todayAppointments: number
  pendingBills: number
  totalRevenue: number
  totalCustomers?: number
  newCustomers?: number
  pendingFollowUps?: number
  totalHealthPlans?: number
  activeHealthPlans?: number
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
