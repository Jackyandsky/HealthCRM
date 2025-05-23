import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import connectDB from '@/lib/mongodb'
import Patient from '@/models/Patient'
import Appointment from '@/models/Appointment'
import Billing from '@/models/Billing'

export async function GET(request: NextRequest) {
  try {
    // Verify JWT token
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: '未授权访问' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    
    try {
      jwt.verify(token, process.env.NEXTAUTH_SECRET || 'health-crm-secret-key-2024')
    } catch (error) {
      return NextResponse.json(
        { message: '无效的访问令牌' },
        { status: 401 }
      )
    }

    await connectDB()

    // Get current date for today's appointments
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    // Get current month for revenue calculation
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)

    // Get basic stats (since we don't have appointments and billing collections populated yet)
    const totalPatients = await Patient.countDocuments({ isActive: true })

    // Return mock data for now since we haven't created appointments and billing yet
    return NextResponse.json({
      totalPatients,
      todayAppointments: 3, // Mock data
      pendingBills: 5, // Mock data
      totalRevenue: 15420.50, // Mock data
    })

  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { message: '服务器错误，请稍后重试' },
      { status: 500 }
    )
  }
}
