import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Purchase from '@/models/Purchase'
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
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const salesRepId = searchParams.get('salesRepId')
    const period = searchParams.get('period') || 'month' // week, month, quarter, year

    // Build base filter
    const baseFilter: any = { isActive: true, orderStatus: { $ne: 'cancelled' } }
    
    if (startDate || endDate) {
      baseFilter.orderDate = {}
      if (startDate) baseFilter.orderDate.$gte = new Date(startDate)
      if (endDate) baseFilter.orderDate.$lte = new Date(endDate)
    } else {
      // Default to current month if no dates specified
      const now = new Date()
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      baseFilter.orderDate = { $gte: firstDay, $lte: lastDay }
    }
    
    if (salesRepId) {
      baseFilter.salesRepId = salesRepId
    }

    // Overall statistics
    const overallStats = await Purchase.aggregate([
      { $match: baseFilter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: '$totalAmount' },
          totalCommission: { $sum: '$commissionAmount' },
          totalItemsSold: { $sum: { $sum: '$items.quantity' } },
          uniqueCustomers: { $addToSet: '$customerId' },
        }
      },
      {
        $project: {
          totalRevenue: 1,
          totalOrders: 1,
          averageOrderValue: 1,
          totalCommission: 1,
          totalItemsSold: 1,
          uniqueCustomers: { $size: '$uniqueCustomers' },
        }
      }
    ])

    // Sales by period (for chart data)
    let groupByPeriod = {}
    switch (period) {
      case 'week':
        groupByPeriod = {
          year: { $year: '$orderDate' },
          week: { $week: '$orderDate' }
        }
        break
      case 'quarter':
        groupByPeriod = {
          year: { $year: '$orderDate' },
          quarter: { 
            $ceil: { $divide: [{ $month: '$orderDate' }, 3] }
          }
        }
        break
      case 'year':
        groupByPeriod = {
          year: { $year: '$orderDate' }
        }
        break
      default: // month
        groupByPeriod = {
          year: { $year: '$orderDate' },
          month: { $month: '$orderDate' }
        }
    }

    const salesByPeriod = await Purchase.aggregate([
      { $match: baseFilter },
      {
        $group: {
          _id: groupByPeriod,
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
          averageOrderValue: { $avg: '$totalAmount' },
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.week': 1, '_id.quarter': 1 } }
    ])

    // Top products by revenue
    const topProducts = await Purchase.aggregate([
      { $match: baseFilter },
      { $unwind: '$items' },
      {
        $group: {
          _id: {
            productId: '$items.productId',
            productCode: '$items.productCode',
            productName: '$items.productName'
          },
          totalRevenue: { $sum: '$items.totalPrice' },
          totalQuantity: { $sum: '$items.quantity' },
          orderCount: { $sum: 1 },
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 }
    ])

    // Sales by payment method
    const paymentMethodStats = await Purchase.aggregate([
      { $match: baseFilter },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' },
        }
      },
      { $sort: { revenue: -1 } }
    ])

    // Sales by status
    const statusStats = await Purchase.aggregate([
      { $match: baseFilter },
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' },
        }
      }
    ])

    // Top customers by revenue
    const topCustomers = await Purchase.aggregate([
      { $match: baseFilter },
      {
        $group: {
          _id: {
            customerId: '$customerId',
            customerName: '$customerName',
            customerEmail: '$customerEmail'
          },
          totalRevenue: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
          averageOrderValue: { $avg: '$totalAmount' },
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 }
    ])

    // Sales representative performance (if not filtered by specific rep)
    let salesRepPerformance = []
    if (!salesRepId) {
      salesRepPerformance = await Purchase.aggregate([
        { $match: baseFilter },
        {
          $group: {
            _id: {
              salesRepId: '$salesRepId',
              salesRepName: '$salesRepName'
            },
            totalRevenue: { $sum: '$totalAmount' },
            orderCount: { $sum: 1 },
            averageOrderValue: { $avg: '$totalAmount' },
            commissionAmount: { $sum: '$commissionAmount' },
          }
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: 10 }
      ])
    }

    // Recent trends (last 30 days daily)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const dailyTrends = await Purchase.aggregate([
      { 
        $match: { 
          ...baseFilter,
          orderDate: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$orderDate' },
            month: { $month: '$orderDate' },
            day: { $dayOfMonth: '$orderDate' }
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ])

    return NextResponse.json({
      message: 'Analytics retrieved successfully',
      data: {
        overview: overallStats[0] || {
          totalRevenue: 0,
          totalOrders: 0,
          averageOrderValue: 0,
          totalCommission: 0,
          totalItemsSold: 0,
          uniqueCustomers: 0,
        },
        salesByPeriod,
        topProducts,
        paymentMethodStats,
        statusStats,
        topCustomers,
        salesRepPerformance,
        dailyTrends,
        period: {
          type: period,
          startDate: baseFilter.orderDate.$gte,
          endDate: baseFilter.orderDate.$lte,
        }
      }
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { message: 'Failed to fetch analytics', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}