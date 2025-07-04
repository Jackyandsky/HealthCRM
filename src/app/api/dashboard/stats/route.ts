import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import connectDB from '@/lib/mongodb'
import Customer from '@/models/Customer'
import User from '@/models/User'

export const dynamic = 'force-dynamic'

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

    // Get current date for statistics
    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)

    // Get customer statistics
    const totalCustomers = await Customer.countDocuments({ isActive: true })
    
    // Get new customers this month
    const newCustomers = await Customer.countDocuments({
      isActive: true,
      createdAt: { $gte: startOfMonth, $lt: endOfMonth }
    })

    // Get customers needing follow-up
    const pendingFollowUps = await Customer.countDocuments({
      isActive: true,
      nextContactDate: { $lte: today }
    })

    // Mock revenue data for now
    const totalRevenue = 58420.50

    return NextResponse.json({
      totalCustomers,
      newCustomers,
      pendingFollowUps,
      totalRevenue,
    })

  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { message: '服务器错误，请稍后重试' },
      { status: 500 }
    )
  }
}
