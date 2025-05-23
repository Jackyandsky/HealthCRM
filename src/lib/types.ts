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

// Removed Patient interface

// Removed Appointment interface
// Removed MedicalRecord interface
// Removed Billing interface

export interface DashboardStats {
  totalCustomers: number // Renamed from totalPatients
  // todayAppointments: number, // Commenting out for now, to be replaced by relevant CRM stats
  // pendingBills: number, // Commenting out for now, to be replaced by relevant CRM stats
  // totalRevenue: number, // Commenting out for now, to be replaced by relevant CRM stats
  activePlans?: number; // Example: Number of active customer plans
  upcomingFollowUps?: number; // Example: Follow-ups due soon
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
