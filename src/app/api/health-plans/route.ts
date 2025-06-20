import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import HealthPlan from '@/models/HealthPlan'
import Customer from '@/models/Customer'
import Product from '@/models/Product'
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
    const planType = searchParams.get('planType')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const needsReview = searchParams.get('needsReview') === 'true'
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

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
    
    if (planType) {
      filter.planType = planType
    }
    
    if (startDate || endDate) {
      filter['timeline.startDate'] = {}
      if (startDate) filter['timeline.startDate'].$gte = new Date(startDate)
      if (endDate) filter['timeline.startDate'].$lte = new Date(endDate)
    }
    
    if (needsReview) {
      const today = new Date()
      filter.$or = [
        { 'progress.nextReviewDate': { $lte: today } },
        { 'progress.nextReviewDate': { $exists: false } },
        { status: 'review_needed' }
      ]
    }
    
    if (search) {
      filter.$text = { $search: search }
    }

    // Build sort object
    const sort: any = {}
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1

    const skip = (page - 1) * limit
    
    const [healthPlans, totalCount] = await Promise.all([
      HealthPlan.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('customerId', 'name email phone category healthProfile')
        .populate('assignedToId', 'name email department employeeId')
        .populate('createdById', 'name email')
        .populate('productRecommendations.productId', 'productCode productName category benefits')
        .lean(),
      HealthPlan.countDocuments(filter)
    ])

    const totalPages = Math.ceil(totalCount / limit)

    // Calculate summary statistics
    const summaryStats = await HealthPlan.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalPlans: { $sum: 1 },
          activePlans: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          draftPlans: {
            $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
          },
          completedPlans: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          reviewNeeded: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $eq: ['$status', 'review_needed'] },
                    { $lte: ['$progress.nextReviewDate', new Date()] }
                  ]
                },
                1,
                0
              ]
            }
          },
          averageProgress: { $avg: '$progress.overallProgress' },
          totalEstimatedCost: { $avg: '$costAnalysis.estimatedMonthlyCost.retail' }
        }
      }
    ])

    return NextResponse.json({
      message: 'Health plans retrieved successfully',
      data: {
        healthPlans,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNext: page < totalPages,
          hasPrev: page > 1,
          limit
        },
        summary: summaryStats[0] || {
          totalPlans: 0,
          activePlans: 0,
          draftPlans: 0,
          completedPlans: 0,
          reviewNeeded: 0,
          averageProgress: 0,
          totalEstimatedCost: 0,
        }
      }
    })
  } catch (error) {
    console.error('Error fetching health plans:', error)
    return NextResponse.json(
      { message: 'Failed to fetch health plans', error: error instanceof Error ? error.message : 'Unknown error' },
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
    const requiredFields = ['customerId', 'title', 'planType']
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

    // Validate products if provided
    if (body.productRecommendations && body.productRecommendations.length > 0) {
      const productIds = body.productRecommendations.map((rec: any) => rec.productId)
      const products = await Product.find({ _id: { $in: productIds } })
      
      if (products.length !== productIds.length) {
        return NextResponse.json(
          { message: 'One or more products not found' },
          { status: 400 }
        )
      }

      // Enrich product recommendations with product details
      body.productRecommendations = body.productRecommendations.map((rec: any) => {
        const product = products.find(p => p._id.toString() === rec.productId)
        return {
          ...rec,
          productCode: product?.productCode,
          productName: product?.productName,
          estimatedCost: {
            retail: product?.retailPrice || 0,
            wholesale: product?.wholesalePrice || 0,
            preferredCustomer: product?.preferredCustomerPrice || 0
          }
        }
      })
    }

    const healthPlanData = {
      customerId: body.customerId,
      customerName: customer.name,
      createdById: decoded.userId,
      createdByName: decoded.name || 'Admin',
      assignedToId: body.assignedToId || decoded.userId,
      assignedToName: body.assignedToName || decoded.name || 'Admin',
      title: body.title,
      description: body.description,
      planType: body.planType,
      priority: body.priority || 'medium',
      healthAssessment: body.healthAssessment || {},
      healthGoals: body.healthGoals || [],
      productRecommendations: body.productRecommendations || [],
      timeline: {
        startDate: body.timeline?.startDate ? new Date(body.timeline.startDate) : new Date(),
        endDate: body.timeline?.endDate ? new Date(body.timeline.endDate) : null,
        reviewDates: body.timeline?.reviewDates?.map((date: string) => new Date(date)) || [],
        milestones: body.timeline?.milestones || []
      },
      schedule: body.schedule || [],
      notes: body.notes || {},
      tags: body.tags || [],
      templateId: body.templateId,
      templateName: body.templateName,
      customizations: body.customizations || []
    }

    // Calculate cost analysis if products are provided
    if (body.productRecommendations && body.productRecommendations.length > 0) {
      const monthlyCosts = {
        retail: 0,
        wholesale: 0,
        preferredCustomer: 0
      }

      body.productRecommendations.forEach((rec: any) => {
        monthlyCosts.retail += rec.estimatedCost?.retail || 0
        monthlyCosts.wholesale += rec.estimatedCost?.wholesale || 0
        monthlyCosts.preferredCustomer += rec.estimatedCost?.preferredCustomer || 0
      })

      let planDuration = 3 // Default 3 months
      if (body.timeline?.endDate && body.timeline?.startDate) {
        planDuration = Math.ceil((new Date(body.timeline.endDate).getTime() - new Date(body.timeline.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30))
      }

      (healthPlanData as any).costAnalysis = {
        estimatedMonthlyCost: monthlyCosts,
        totalEstimatedCost: {
          retail: monthlyCosts.retail * planDuration,
          wholesale: monthlyCosts.wholesale * planDuration,
          preferredCustomer: monthlyCosts.preferredCustomer * planDuration
        },
        costBreakdown: []
      }
    }

    // Set initial progress
    ;(healthPlanData as any).progress = {
      overallProgress: 0,
      goalsAchieved: 0,
      totalGoals: body.healthGoals?.length || 0,
      complianceRate: 0,
      nextReviewDate: body.timeline?.reviewDates?.[0] ? new Date(body.timeline.reviewDates[0]) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    }

    const healthPlan = new HealthPlan(healthPlanData)
    await healthPlan.save()

    // Populate the created health plan
    const populatedHealthPlan = await HealthPlan.findById(healthPlan._id)
      .populate('customerId', 'name email phone category')
      .populate('assignedToId', 'name email department')
      .populate('createdById', 'name email')
      .populate('productRecommendations.productId', 'productCode productName category')

    return NextResponse.json({
      message: 'Health plan created successfully',
      data: populatedHealthPlan
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating health plan:', error)
    return NextResponse.json(
      { message: 'Failed to create health plan', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}