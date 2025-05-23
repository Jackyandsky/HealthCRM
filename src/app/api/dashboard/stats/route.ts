import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import connectDB from '@/lib/mongodb'
// import Patient from '@/models/Patient' // Removed Patient model
import User from '@/models/User' // Added User model
// import Appointment from '@/models/Appointment' // Removed Appointment model
// import Billing from '@/models/Billing' // Removed Billing model

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

    // Get basic stats
    const totalCustomers = await User.countDocuments({ role: 'customer', isActive: true })
    
    // Placeholder for future CRM stats
    const activePlans = 0; // Replace with actual logic, e.g., User.countDocuments({ role: 'customer', 'plan.isActive': true })
    const upcomingFollowUps = 0; // Replace with actual logic e.g. FollowUp.countDocuments({ date: { $gte: today, $lt: oneWeekFromToday } })


    // Updated stats response
    return NextResponse.json({
      totalCustomers,
      activePlans, // Example new stat
      upcomingFollowUps, // Example new stat
      // todayAppointments: 3, // Mock data - REMOVED
      // pendingBills: 5, // Mock data - REMOVED
      // totalRevenue: 15420.50, // Mock data - REMOVED
    })

  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { message: '服务器错误，请稍后重试' },
      { status: 500 }
    )
  }
}
