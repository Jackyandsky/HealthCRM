import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Purchase from '@/models/Purchase'
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
    const salesRepId = searchParams.get('salesRepId')
    const paymentStatus = searchParams.get('paymentStatus')
    const orderStatus = searchParams.get('orderStatus')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Build filter object
    const filter: any = { isActive: true }
    
    if (customerId) {
      filter.customerId = customerId
    }
    
    if (salesRepId) {
      filter.salesRepId = salesRepId
    }
    
    if (paymentStatus) {
      filter.paymentStatus = paymentStatus
    }
    
    if (orderStatus) {
      filter.orderStatus = orderStatus
    }
    
    if (startDate || endDate) {
      filter.orderDate = {}
      if (startDate) filter.orderDate.$gte = new Date(startDate)
      if (endDate) filter.orderDate.$lte = new Date(endDate)
    }
    
    if (search) {
      filter.$text = { $search: search }
    }

    // Build sort object
    const sort: any = {}
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1

    const skip = (page - 1) * limit
    
    const [purchases, totalCount] = await Promise.all([
      Purchase.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('customerId', 'name email phone category')
        .populate('salesRepId', 'name email department')
        .populate('items.productId', 'productCode productName category stockStatus')
        .lean(),
      Purchase.countDocuments(filter)
    ])

    const totalPages = Math.ceil(totalCount / limit)

    // Calculate summary statistics
    const summaryStats = await Purchase.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: '$totalAmount' },
          totalCommission: { $sum: '$commissionAmount' },
        }
      }
    ])

    return NextResponse.json({
      message: 'Purchases retrieved successfully',
      data: {
        purchases,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNext: page < totalPages,
          hasPrev: page > 1,
          limit
        },
        summary: summaryStats[0] || {
          totalRevenue: 0,
          totalOrders: 0,
          averageOrderValue: 0,
          totalCommission: 0,
        }
      }
    })
  } catch (error) {
    console.error('Error fetching purchases:', error)
    return NextResponse.json(
      { message: 'Failed to fetch purchases', error: error instanceof Error ? error.message : 'Unknown error' },
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
    const requiredFields = ['customerId', 'items']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { message: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Validate items
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { message: 'At least one item is required' },
        { status: 400 }
      )
    }

    // Verify customer exists
    const customer = await Customer.findById(body.customerId)
    if (!customer) {
      return NextResponse.json(
        { message: 'Customer not found' },
        { status: 404 }
      )
    }

    // Verify and calculate item totals
    let subtotal = 0
    const processedItems = []

    for (const item of body.items) {
      // Verify product exists
      const product = await Product.findById(item.productId)
      if (!product) {
        return NextResponse.json(
          { message: `Product not found: ${item.productId}` },
          { status: 404 }
        )
      }

      const quantity = parseInt(item.quantity)
      const unitPrice = parseFloat(item.unitPrice)
      const discount = parseFloat(item.discount || 0)
      
      if (quantity <= 0 || unitPrice < 0) {
        return NextResponse.json(
          { message: 'Invalid quantity or price' },
          { status: 400 }
        )
      }

      const totalPrice = (quantity * unitPrice) - discount

      processedItems.push({
        productId: item.productId,
        productCode: product.productCode,
        productName: product.productName,
        quantity,
        unitPrice,
        priceType: item.priceType || 'retail',
        totalPrice,
        discount,
        notes: item.notes || '',
      })

      subtotal += totalPrice
    }

    // Calculate totals
    const totalDiscount = parseFloat(body.totalDiscount || 0)
    const taxRate = parseFloat(body.taxRate || 0)
    const shippingCost = parseFloat(body.shippingCost || 0)
    const tax = (subtotal - totalDiscount) * taxRate
    const totalAmount = subtotal - totalDiscount + tax + shippingCost

    const purchaseData = {
      customerId: body.customerId,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      salesRepId: decoded.userId,
      salesRepName: decoded.name || 'Admin',
      items: processedItems,
      subtotal,
      totalDiscount,
      tax,
      taxRate,
      shippingCost,
      totalAmount,
      paymentMethod: body.paymentMethod || 'cash',
      paymentStatus: body.paymentStatus || 'pending',
      orderStatus: body.orderStatus || 'confirmed',
      orderDate: body.orderDate ? new Date(body.orderDate) : new Date(),
      shippingAddress: body.shippingAddress,
      notes: body.notes,
      internalNotes: body.internalNotes,
      source: body.source || 'in_person',
      commissionRate: parseFloat(body.commissionRate || 0),
    }

    const purchase = new Purchase(purchaseData)
    await purchase.save()

    // Populate the created purchase
    const populatedPurchase = await Purchase.findById(purchase._id)
      .populate('customerId', 'name email phone category')
      .populate('salesRepId', 'name email department')
      .populate('items.productId', 'productCode productName category stockStatus')

    return NextResponse.json({
      message: 'Purchase created successfully',
      data: populatedPurchase
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating purchase:', error)
    return NextResponse.json(
      { message: 'Failed to create purchase', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}