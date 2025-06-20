import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import HealthPlanTemplate from '@/models/HealthPlanTemplate'
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
    const category = searchParams.get('category')
    const difficulty = searchParams.get('difficulty')
    const status = searchParams.get('status')
    const ageGroup = searchParams.get('ageGroup')
    const gender = searchParams.get('gender')
    const lifestyle = searchParams.get('lifestyle')
    const popular = searchParams.get('popular') === 'true'
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Build filter object
    const filter: any = { isActive: true }
    
    if (category) {
      filter.category = category
    }
    
    if (difficulty) {
      filter.difficulty = difficulty
    }
    
    if (status) {
      filter.status = status
    } else {
      filter.status = 'active' // Default to active templates
    }
    
    if (ageGroup) {
      filter['targetAudience.ageGroups'] = ageGroup
    }
    
    if (gender) {
      filter['targetAudience.genders'] = { $in: [gender, 'all'] }
    }
    
    if (lifestyle) {
      filter['targetAudience.lifestyles'] = lifestyle
    }
    
    if (search) {
      filter.$text = { $search: search }
    }

    // Build sort object
    let sort: any = {}
    if (popular) {
      sort = { 'usageStats.timesUsed': -1, 'usageStats.averageRating': -1 }
    } else {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1
    }

    const skip = (page - 1) * limit
    
    const [templates, totalCount] = await Promise.all([
      HealthPlanTemplate.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name email department')
        .populate('approvedBy', 'name email')
        .populate('productRecommendations.productId', 'productCode productName category retailPrice wholesalePrice preferredCustomerPrice')
        .lean(),
      HealthPlanTemplate.countDocuments(filter)
    ])

    const totalPages = Math.ceil(totalCount / limit)

    // Calculate summary statistics
    const summaryStats = await HealthPlanTemplate.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalTemplates: { $sum: 1 },
          activeTemplates: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          draftTemplates: {
            $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
          },
          averageRating: { $avg: '$usageStats.averageRating' },
          totalUsage: { $sum: '$usageStats.timesUsed' },
          categoryBreakdown: {
            $push: '$category'
          }
        }
      }
    ])

    // Get category distribution
    const categoryStats = await HealthPlanTemplate.aggregate([
      { $match: { isActive: true, status: 'active' } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          averageRating: { $avg: '$usageStats.averageRating' },
          totalUsage: { $sum: '$usageStats.timesUsed' }
        }
      },
      { $sort: { count: -1 } }
    ])

    return NextResponse.json({
      message: 'Health plan templates retrieved successfully',
      data: {
        templates,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNext: page < totalPages,
          hasPrev: page > 1,
          limit
        },
        summary: summaryStats[0] || {
          totalTemplates: 0,
          activeTemplates: 0,
          draftTemplates: 0,
          averageRating: 0,
          totalUsage: 0,
          categoryBreakdown: []
        },
        categoryStats: categoryStats || []
      }
    })
  } catch (error) {
    console.error('Error fetching health plan templates:', error)
    return NextResponse.json(
      { message: 'Failed to fetch health plan templates', error: error instanceof Error ? error.message : 'Unknown error' },
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
    const requiredFields = ['name', 'category', 'description']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { message: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
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
          productName: product?.productName
        }
      })
    }

    // Calculate cost estimates if products are provided
    let costEstimate = body.costEstimate || {}
    if (body.productRecommendations && body.productRecommendations.length > 0) {
      const monthlyCosts = {
        retail: { min: 0, max: 0, average: 0 },
        wholesale: { min: 0, max: 0, average: 0 },
        preferredCustomer: { min: 0, max: 0, average: 0 }
      }

      const products = await Product.find({ 
        _id: { $in: body.productRecommendations.map((rec: any) => rec.productId) } 
      })

      body.productRecommendations.forEach((rec: any) => {
        const product = products.find(p => p._id.toString() === rec.productId)
        if (product) {
          monthlyCosts.retail.average += product.retailPrice || 0
          monthlyCosts.wholesale.average += product.wholesalePrice || 0
          monthlyCosts.preferredCustomer.average += product.preferredCustomerPrice || 0
        }
      })

      // Set min/max as 80%-120% of average for estimation
      Object.keys(monthlyCosts).forEach(priceType => {
        const avg = monthlyCosts[priceType as keyof typeof monthlyCosts].average
        monthlyCosts[priceType as keyof typeof monthlyCosts] = {
          min: Math.round(avg * 0.8),
          max: Math.round(avg * 1.2),
          average: Math.round(avg)
        }
      })

      const duration = body.duration?.typical?.value || 3
      costEstimate = {
        monthly: monthlyCosts,
        total: {
          retail: {
            min: monthlyCosts.retail.min * duration,
            max: monthlyCosts.retail.max * duration,
            average: monthlyCosts.retail.average * duration
          },
          wholesale: {
            min: monthlyCosts.wholesale.min * duration,
            max: monthlyCosts.wholesale.max * duration,
            average: monthlyCosts.wholesale.average * duration
          },
          preferredCustomer: {
            min: monthlyCosts.preferredCustomer.min * duration,
            max: monthlyCosts.preferredCustomer.max * duration,
            average: monthlyCosts.preferredCustomer.average * duration
          }
        }
      }
    }

    const templateData = {
      name: body.name,
      description: body.description,
      category: body.category,
      targetAudience: body.targetAudience || {},
      duration: body.duration || {
        typical: { value: 3, unit: 'months' }
      },
      difficulty: body.difficulty || 'beginner',
      assessmentQuestions: body.assessmentQuestions || [],
      healthGoals: body.healthGoals || [],
      productRecommendations: body.productRecommendations || [],
      scheduleTemplate: body.scheduleTemplate || {},
      costEstimate,
      successCriteria: body.successCriteria || [],
      expectedOutcomes: body.expectedOutcomes || [],
      instructions: body.instructions || {},
      contraindications: body.contraindications || [],
      warnings: body.warnings || [],
      prerequisites: body.prerequisites || [],
      createdBy: decoded.userId,
      tags: body.tags || [],
      usageStats: {
        timesUsed: 0,
        successRate: 0,
        averageRating: 0,
        feedback: []
      }
    }

    const template = new HealthPlanTemplate(templateData)
    await template.save()

    // Populate the created template
    const populatedTemplate = await HealthPlanTemplate.findById(template._id)
      .populate('createdBy', 'name email department')
      .populate('productRecommendations.productId', 'productCode productName category')

    return NextResponse.json({
      message: 'Health plan template created successfully',
      data: populatedTemplate
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating health plan template:', error)
    return NextResponse.json(
      { message: 'Failed to create health plan template', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}