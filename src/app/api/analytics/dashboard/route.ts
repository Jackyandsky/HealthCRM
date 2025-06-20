import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Customer from '@/models/Customer'
import Product from '@/models/Product'
import Purchase from '@/models/Purchase'
import FollowUp from '@/models/FollowUp'
import HealthPlan from '@/models/HealthPlan'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const decoded = verifyToken(request)
    
    if (!decoded || !['system_admin', 'admin'].includes(decoded.role)) {
      return NextResponse.json(
        { message: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    await connectDB()
    
    const searchParams = request.nextUrl.searchParams
    const timeRange = searchParams.get('timeRange') || '30' // days
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(timeRange))

    // Customer Analytics
    const [
      totalCustomers,
      newCustomers,
      customersByType,
      customersByStatus,
      averageCustomerValue
    ] = await Promise.all([
      Customer.countDocuments({ isActive: true }),
      Customer.countDocuments({ 
        isActive: true,
        createdAt: { $gte: startDate }
      }),
      Customer.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$customerType', count: { $sum: 1 } } }
      ]),
      Customer.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Customer.aggregate([
        { $match: { isActive: true, customerValue: { $exists: true } } },
        { $group: { _id: null, avgValue: { $avg: '$customerValue' } } }
      ])
    ])

    // Sales Analytics
    const [
      totalRevenue,
      totalOrders,
      revenueByMonth,
      topProducts,
      salesByCategory
    ] = await Promise.all([
      Purchase.aggregate([
        { $match: { 
          paymentStatus: { $in: ['paid', 'partial'] },
          orderDate: { $gte: startDate }
        }},
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Purchase.countDocuments({ 
        orderDate: { $gte: startDate }
      }),
      Purchase.aggregate([
        { $match: { 
          paymentStatus: { $in: ['paid', 'partial'] },
          orderDate: { $gte: new Date(new Date().getFullYear(), 0, 1) } // This year
        }},
        { $group: {
          _id: { 
            year: { $year: '$orderDate' },
            month: { $month: '$orderDate' }
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }},
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      Purchase.aggregate([
        { $match: { orderDate: { $gte: startDate } } },
        { $unwind: '$items' },
        { $group: {
          _id: {
            productCode: '$items.productCode',
            productName: '$items.productName'
          },
          quantity: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.totalPrice' }
        }},
        { $sort: { revenue: -1 } },
        { $limit: 10 }
      ]),
      Product.aggregate([
        { $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$retailPrice' }
        }},
        { $sort: { count: -1 } }
      ])
    ])

    // Health Plans Analytics
    const [
      totalHealthPlans,
      activeHealthPlans,
      plansByType,
      planCompletionRate,
      averageProgress
    ] = await Promise.all([
      HealthPlan.countDocuments({ isActive: true }),
      HealthPlan.countDocuments({ 
        isActive: true,
        status: 'active'
      }),
      HealthPlan.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$planType', count: { $sum: 1 } } }
      ]),
      HealthPlan.aggregate([
        { $match: { isActive: true, status: 'completed' } },
        { $count: 'completed' }
      ]),
      HealthPlan.aggregate([
        { $match: { isActive: true, 'progress.overallProgress': { $exists: true } } },
        { $group: { _id: null, avgProgress: { $avg: '$progress.overallProgress' } } }
      ])
    ])

    // Follow-up Analytics
    const [
      totalFollowUps,
      pendingFollowUps,
      completedFollowUps,
      followUpsByOutcome,
      averageSatisfaction
    ] = await Promise.all([
      FollowUp.countDocuments({ isActive: true }),
      FollowUp.countDocuments({ 
        isActive: true,
        status: { $in: ['scheduled', 'in_progress'] }
      }),
      FollowUp.countDocuments({ 
        isActive: true,
        status: 'completed',
        completedDate: { $gte: startDate }
      }),
      FollowUp.aggregate([
        { $match: { 
          isActive: true,
          status: 'completed',
          completedDate: { $gte: startDate }
        }},
        { $group: { _id: '$outcome', count: { $sum: 1 } } }
      ]),
      FollowUp.aggregate([
        { $match: { 
          isActive: true,
          customerSatisfaction: { $exists: true, $ne: null }
        }},
        { $group: { _id: null, avgSatisfaction: { $avg: '$customerSatisfaction' } } }
      ])
    ])

    // Product Usage Analytics
    const productUsageStats = await Customer.aggregate([
      { $match: { isActive: true, 'productUsage.0': { $exists: true } } },
      { $unwind: '$productUsage' },
      { $group: {
        _id: '$productUsage.productName',
        avgEffectiveness: { $avg: '$productUsage.effectiveness' },
        userCount: { $sum: 1 },
        continueRate: { 
          $avg: { $cond: ['$productUsage.willContinue', 1, 0] }
        }
      }},
      { $sort: { userCount: -1 } },
      { $limit: 10 }
    ])

    // Growth Metrics
    const growthMetrics = await Customer.aggregate([
      { $match: { isActive: true } },
      { $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        newCustomers: { $sum: 1 }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 } // Last 12 months
    ])

    return NextResponse.json({
      message: 'Analytics data retrieved successfully',
      data: {
        overview: {
          totalCustomers,
          newCustomers,
          totalRevenue: totalRevenue[0]?.total || 0,
          totalOrders,
          totalHealthPlans,
          activeHealthPlans,
          pendingFollowUps,
          averageCustomerValue: averageCustomerValue[0]?.avgValue || 0
        },
        customers: {
          byType: customersByType,
          byStatus: customersByStatus,
          growth: growthMetrics
        },
        sales: {
          revenueByMonth,
          topProducts,
          salesByCategory,
          totalRevenue: totalRevenue[0]?.total || 0,
          totalOrders
        },
        healthPlans: {
          byType: plansByType,
          completionRate: planCompletionRate[0]?.completed || 0,
          averageProgress: averageProgress[0]?.avgProgress || 0,
          total: totalHealthPlans,
          active: activeHealthPlans
        },
        followUps: {
          total: totalFollowUps,
          pending: pendingFollowUps,
          completed: completedFollowUps,
          byOutcome: followUpsByOutcome,
          averageSatisfaction: averageSatisfaction[0]?.avgSatisfaction || 0
        },
        productUsage: productUsageStats,
        timeRange: parseInt(timeRange)
      }
    })
  } catch (error) {
    console.error('Error fetching analytics data:', error)
    return NextResponse.json(
      { message: 'Failed to fetch analytics data', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}