import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import FollowUp from '@/models/FollowUp'
import Customer from '@/models/Customer'
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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search')
    const customerId = searchParams.get('customerId')
    const assignedToId = searchParams.get('assignedToId')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const type = searchParams.get('type')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const overdue = searchParams.get('overdue') === 'true'
    const sortBy = searchParams.get('sortBy') || 'scheduledDate'
    const sortOrder = searchParams.get('sortOrder') || 'asc'

    // Build filter object
    const filter: any = { isActive: true }
    
    if (customerId) {
      filter.customerId = customerId
    }
    
    if (assignedToId) {
      filter.assignedToId = assignedToId
    }
    
    if (status) {
      filter.status = status
    }
    
    if (priority) {
      filter.priority = priority
    }
    
    if (type) {
      filter.type = type
    }
    
    if (startDate || endDate) {
      filter.scheduledDate = {}
      if (startDate) filter.scheduledDate.$gte = new Date(startDate)
      if (endDate) filter.scheduledDate.$lte = new Date(endDate)
    }
    
    if (overdue) {
      filter.scheduledDate = { $lt: new Date() }
      filter.status = { $in: ['scheduled', 'in_progress'] }
    }
    
    if (search) {
      filter.$text = { $search: search }
    }

    // Build sort object
    const sort: any = {}
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1

    const skip = (page - 1) * limit
    
    const [followUps, totalCount] = await Promise.all([
      FollowUp.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('customerId', 'name email phone category')
        .populate('assignedToId', 'name email department')
        .populate('createdById', 'name email')
        .populate('productUsage.productId', 'productCode productName category')
        .lean(),
      FollowUp.countDocuments(filter)
    ])

    const totalPages = Math.ceil(totalCount / limit)

    // Calculate summary statistics
    const summaryStats = await FollowUp.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalFollowUps: { $sum: 1 },
          completedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          scheduledCount: {
            $sum: { $cond: [{ $eq: ['$status', 'scheduled'] }, 1, 0] }
          },
          overdueCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $in: ['$status', ['scheduled', 'in_progress']] },
                    { $lt: ['$scheduledDate', new Date()] }
                  ]
                },
                1,
                0
              ]
            }
          },
          averageRating: { $avg: '$customerSatisfaction' },
        }
      }
    ])

    return NextResponse.json({
      message: 'Follow-ups retrieved successfully',
      data: {
        followUps,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNext: page < totalPages,
          hasPrev: page > 1,
          limit
        },
        summary: summaryStats[0] || {
          totalFollowUps: 0,
          completedCount: 0,
          scheduledCount: 0,
          overdueCount: 0,
          averageRating: 0,
        }
      }
    })
  } catch (error) {
    console.error('Error fetching follow-ups:', error)
    return NextResponse.json(
      { message: 'Failed to fetch follow-ups', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const decoded = verifyToken(request)
    
    if (!decoded || !['system_admin', 'admin'].includes(decoded.role)) {
      return NextResponse.json(
        { message: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    await connectDB()
    
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ['customerId', 'title', 'type', 'scheduledDate', 'communicationMethod']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { message: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Verify customer exists
    const customer = await Customer.findById(body.customerId)
    if (!customer) {
      return NextResponse.json(
        { message: 'Customer not found' },
        { status: 404 }
      )
    }

    const followUpData = {
      customerId: body.customerId,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      assignedToId: body.assignedToId || decoded.userId,
      assignedToName: body.assignedToName || decoded.name || 'Admin',
      createdById: decoded.userId,
      createdByName: decoded.name || 'Admin',
      title: body.title,
      description: body.description,
      type: body.type,
      priority: body.priority || 'medium',
      scheduledDate: new Date(body.scheduledDate),
      scheduledTime: body.scheduledTime,
      communicationMethod: body.communicationMethod,
      relatedPurchaseId: body.relatedPurchaseId,
      relatedPlanId: body.relatedPlanId,
      tags: body.tags || [],
      publicNotes: body.publicNotes,
      internalNotes: body.internalNotes,
    }

    const followUp = new FollowUp(followUpData)
    await followUp.save()

    // Populate the created follow-up
    const populatedFollowUp = await FollowUp.findById(followUp._id)
      .populate('customerId', 'name email phone category')
      .populate('assignedToId', 'name email department')
      .populate('createdById', 'name email')

    return NextResponse.json({
      message: 'Follow-up created successfully',
      data: populatedFollowUp
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating follow-up:', error)
    return NextResponse.json(
      { message: 'Failed to create follow-up', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}