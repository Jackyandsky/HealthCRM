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

    console.log('Connecting to database...')
    await connectDB()
    console.log('Database connected successfully')
    
    // Test basic HealthPlan model access
    try {
      const testCount = await HealthPlan.countDocuments({})
      console.log('Total health plans in database:', testCount)
    } catch (testError) {
      console.error('Error accessing HealthPlan model:', testError)
      throw testError
    }
    
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search')
    const customerId = searchParams.get('customerId')
    const tags = searchParams.get('tags')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Build filter object for simplified model
    const filter: any = { isActive: true }
    
    if (customerId) {
      filter.customerId = customerId
    }
    
    if (tags) {
      filter.tags = { $in: tags.split(',') }
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ]
    }

    // Build sort object
    const sort: any = {}
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1

    const skip = (page - 1) * limit
    
    console.log('Filter being applied:', filter)
    console.log('Sort being applied:', sort)
    
    let healthPlans, totalCount
    
    try {
      console.log('Starting database query...')
      const results = await Promise.all([
        HealthPlan.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .populate('customerId', 'firstName lastName email phone customerType')
          .lean(),
        HealthPlan.countDocuments(filter)
      ])
      
      healthPlans = results[0]
      totalCount = results[1]
      
      console.log('Database query completed successfully')
      console.log('Raw healthPlans before processing:', healthPlans)
      console.log('Total count:', totalCount)
    } catch (dbError) {
      console.error('Database query failed:', dbError)
      throw dbError
    }

    const totalPages = Math.ceil(totalCount / limit)

    // Calculate summary statistics - handle both old and new schema
    const summaryStats = await HealthPlan.aggregate([
      { $match: {} },
      {
        $addFields: {
          productCount: {
            $cond: {
              if: { $ifNull: ['$products', false] },
              then: { $size: '$products' },
              else: {
                $cond: {
                  if: { $ifNull: ['$productRecommendations', false] },
                  then: { $size: '$productRecommendations' },
                  else: 0
                }
              }
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          totalPlans: { $sum: 1 },
          totalProducts: { $sum: '$productCount' },
          totalCustomers: { $addToSet: '$customerId' }
        }
      },
      {
        $addFields: {
          totalCustomers: { $size: '$totalCustomers' }
        }
      }
    ])

    console.log('Health plans found:', healthPlans.length)
    console.log('Summary stats:', summaryStats[0])

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
          totalProducts: 0,
          totalCustomers: 0
        }
      }
    })
  } catch (error) {
    console.error('Error fetching health plans:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { 
        message: 'Failed to fetch health plans', 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      },
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
    
    // Validate required fields for simplified model
    const requiredFields = ['customerId', 'title']
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

    // Validate products if provided (simplified model uses 'products' not 'productRecommendations')
    if (body.products && body.products.length > 0) {
      const productIds = body.products.map((product: any) => product.productId)
      const products = await Product.find({ _id: { $in: productIds } })
      
      if (products.length !== productIds.length) {
        return NextResponse.json(
          { message: 'One or more products not found' },
          { status: 400 }
        )
      }
    }

    // Create health plan data object for simplified model
    const healthPlanData = {
      customerId: body.customerId,
      title: body.title,
      description: body.description || '',
      tags: body.tags || [],
      products: body.products || []
    }


    const healthPlan = new HealthPlan(healthPlanData)
    await healthPlan.save()

    // Populate the created health plan for simplified model
    const populatedHealthPlan = await HealthPlan.findById(healthPlan._id)
      .populate('customerId', 'firstName lastName email phone customerType')
      .populate('products.productId', 'productCode productName category')

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