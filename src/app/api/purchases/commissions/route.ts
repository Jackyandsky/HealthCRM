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
    const salesRepId = searchParams.get('salesRepId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const paid = searchParams.get('paid') // 'true', 'false', or undefined for all
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Build filter
    const filter: any = { 
      isActive: true,
      orderStatus: { $ne: 'cancelled' },
      commissionAmount: { $gt: 0 }
    }
    
    if (salesRepId) {
      filter.salesRepId = salesRepId
    }
    
    if (startDate || endDate) {
      filter.orderDate = {}
      if (startDate) filter.orderDate.$gte = new Date(startDate)
      if (endDate) filter.orderDate.$lte = new Date(endDate)
    }
    
    if (paid !== undefined) {
      filter.commissionPaid = paid === 'true'
    }

    const skip = (page - 1) * limit

    // Get commission records
    const [commissions, totalCount] = await Promise.all([
      Purchase.find(filter)
        .select('purchaseId customerId customerName salesRepId salesRepName orderDate totalAmount commissionRate commissionAmount commissionPaid commissionPaidDate')
        .populate('customerId', 'name email category')
        .populate('salesRepId', 'name email department employeeId')
        .sort({ orderDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Purchase.countDocuments(filter)
    ])

    // Get summary statistics
    const summary = await Purchase.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalCommissionEarned: { $sum: '$commissionAmount' },
          totalCommissionPaid: { 
            $sum: { 
              $cond: ['$commissionPaid', '$commissionAmount', 0] 
            }
          },
          totalCommissionPending: { 
            $sum: { 
              $cond: [{ $eq: ['$commissionPaid', false] }, '$commissionAmount', 0] 
            }
          },
          totalOrders: { $sum: 1 },
          ordersPaid: {
            $sum: { $cond: ['$commissionPaid', 1, 0] }
          },
          ordersPending: {
            $sum: { $cond: [{ $eq: ['$commissionPaid', false] }, 1, 0] }
          }
        }
      }
    ])

    // Get commission by sales rep (if not filtered by specific rep)
    let repBreakdown = []
    if (!salesRepId) {
      repBreakdown = await Purchase.aggregate([
        { $match: filter },
        {
          $group: {
            _id: {
              salesRepId: '$salesRepId',
              salesRepName: '$salesRepName'
            },
            totalCommissionEarned: { $sum: '$commissionAmount' },
            totalCommissionPaid: { 
              $sum: { 
                $cond: ['$commissionPaid', '$commissionAmount', 0] 
              }
            },
            totalCommissionPending: { 
              $sum: { 
                $cond: [{ $eq: ['$commissionPaid', false] }, '$commissionAmount', 0] 
              }
            },
            orderCount: { $sum: 1 },
            averageCommission: { $avg: '$commissionAmount' },
          }
        },
        { $sort: { totalCommissionEarned: -1 } }
      ])
    }

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      message: 'Commission data retrieved successfully',
      data: {
        commissions,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNext: page < totalPages,
          hasPrev: page > 1,
          limit
        },
        summary: summary[0] || {
          totalCommissionEarned: 0,
          totalCommissionPaid: 0,
          totalCommissionPending: 0,
          totalOrders: 0,
          ordersPaid: 0,
          ordersPending: 0,
        },
        repBreakdown
      }
    })
  } catch (error) {
    console.error('Error fetching commission data:', error)
    return NextResponse.json(
      { message: 'Failed to fetch commission data', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const decoded = verifyToken(request)
    
    if (!decoded || decoded.role !== 'system_admin') {
      return NextResponse.json(
        { message: 'Unauthorized - System admin access required' },
        { status: 403 }
      )
    }

    await connectDB()
    
    const body = await request.json()
    const { purchaseIds, action } = body // action: 'mark_paid' or 'mark_unpaid'

    if (!Array.isArray(purchaseIds) || purchaseIds.length === 0) {
      return NextResponse.json(
        { message: 'Purchase IDs array is required' },
        { status: 400 }
      )
    }

    if (!['mark_paid', 'mark_unpaid'].includes(action)) {
      return NextResponse.json(
        { message: 'Invalid action. Use mark_paid or mark_unpaid' },
        { status: 400 }
      )
    }

    const updateData: any = {
      commissionPaid: action === 'mark_paid',
      updatedAt: new Date()
    }

    if (action === 'mark_paid') {
      updateData.commissionPaidDate = new Date()
    } else {
      updateData.commissionPaidDate = null
    }

    const result = await Purchase.updateMany(
      { 
        _id: { $in: purchaseIds },
        isActive: true,
        orderStatus: { $ne: 'cancelled' }
      },
      updateData
    )

    return NextResponse.json({
      message: `Commission status updated for ${result.modifiedCount} purchases`,
      data: {
        modifiedCount: result.modifiedCount,
        action
      }
    })

  } catch (error) {
    console.error('Error updating commission status:', error)
    return NextResponse.json(
      { message: 'Failed to update commission status', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}