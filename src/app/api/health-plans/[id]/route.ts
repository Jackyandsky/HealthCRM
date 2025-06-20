import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import HealthPlan from '@/models/HealthPlan'
import { verifyToken } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const decoded = verifyToken(request)
    
    if (!decoded) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectDB()
    
    // First, get the document without product populate to check its structure
    const healthPlanRaw = await HealthPlan.findById(params.id).lean()
    
    if (!healthPlanRaw) {
      return NextResponse.json(
        { message: 'Health plan not found' },
        { status: 404 }
      )
    }
    
    console.log('Raw health plan structure:', Object.keys(healthPlanRaw))
    console.log('Products field content:', (healthPlanRaw as any).products)
    console.log('ProductRecommendations field content:', (healthPlanRaw as any).productRecommendations)
    
    // Now populate based on what fields exist - skip automatic populate and go straight to manual
    let healthPlan
    if ((healthPlanRaw as any).products) {
      console.log('Using new schema (products field found) - doing manual population')
      healthPlan = await HealthPlan.findById(params.id)
        .populate('customerId', 'firstName lastName email phone customerType')
        .lean()
      
      // Always do manual population for products since populate isn't working
      if ((healthPlan as any).products && (healthPlan as any).products.length > 0) {
        console.log('Starting manual population for', (healthPlan as any).products.length, 'products')
        const Product = (await import('@/models/Product')).default
        for (let i = 0; i < (healthPlan as any).products.length; i++) {
          if ((healthPlan as any).products[i].productId) {
            try {
              console.log('Looking up product:', (healthPlan as any).products[i].productId)
              const product = await Product.findById((healthPlan as any).products[i].productId).select('productCode productName category retailPrice wholesalePrice preferredCustomerPrice').lean()
              if (product) {
                console.log('Found product:', product)
                ;(healthPlan as any).products[i].productId = product
              } else {
                console.log('Product not found for ID:', (healthPlan as any).products[i].productId)
              }
            } catch (productError: any) {
              console.log('Failed to populate product:', (healthPlan as any).products[i].productId, productError.message)
            }
          }
        }
        console.log('Manual population complete')
      }
    } else if ((healthPlanRaw as any).productRecommendations) {
      console.log('Using old schema (productRecommendations field found)')
      try {
        healthPlan = await HealthPlan.findById(params.id)
          .populate('customerId', 'firstName lastName email phone customerType')
          .populate({
            path: 'productRecommendations.productId',
            select: 'productCode productName category retailPrice wholesalePrice preferredCustomerPrice',
            strictPopulate: false
          })
          .lean()
      } catch (populateError: any) {
        console.log('Populate failed, falling back to basic query:', populateError.message)
        healthPlan = await HealthPlan.findById(params.id)
          .populate('customerId', 'firstName lastName email phone customerType')
          .lean()
      }
    } else {
      console.log('No product fields found, using basic populate')
      healthPlan = await HealthPlan.findById(params.id)
        .populate('customerId', 'firstName lastName email phone customerType')
        .lean()
    }
    
    if (!healthPlan) {
      return NextResponse.json(
        { message: 'Health plan not found' },
        { status: 404 }
      )
    }

    console.log('Final populated health plan:', JSON.stringify(healthPlan, null, 2))
    
    // Return simplified health plan data
    const responseData = {
      ...healthPlan,
      tags: (healthPlan as any).tags || []
    }

    return NextResponse.json({
      message: 'Health plan retrieved successfully',
      data: responseData
    })
  } catch (error) {
    console.error('Error fetching health plan:', error)
    return NextResponse.json(
      { message: 'Failed to fetch health plan', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const decoded = verifyToken(request)
    
    if (!decoded) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectDB()
    
    const body = await request.json()
    
    // Check if health plan exists
    const existingHealthPlan = await HealthPlan.findById(params.id)
    if (!existingHealthPlan) {
      return NextResponse.json(
        { message: 'Health plan not found' },
        { status: 404 }
      )
    }

    // Update allowed fields for simplified model
    const allowedFields = [
      'title', 'description', 'tags', 'products'
    ]

    const updateData: any = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    const updatedHealthPlan = await HealthPlan.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('customerId', 'firstName lastName email phone customerType')

    return NextResponse.json({
      message: 'Health plan updated successfully',
      data: updatedHealthPlan
    })

  } catch (error) {
    console.error('Error updating health plan:', error)
    return NextResponse.json(
      { message: 'Failed to update health plan', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const decoded = verifyToken(request)
    
    if (!decoded) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectDB()
    
    const healthPlan = await HealthPlan.findById(params.id)
    if (!healthPlan) {
      return NextResponse.json(
        { message: 'Health plan not found' },
        { status: 404 }
      )
    }

    // Soft delete by setting isActive to false
    await HealthPlan.findByIdAndUpdate(
      params.id,
      { 
        isActive: false
      }
    )

    return NextResponse.json({
      message: 'Health plan deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting health plan:', error)
    return NextResponse.json(
      { message: 'Failed to delete health plan', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}