import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Purchase from '@/models/Purchase'
import { verifyToken } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const decoded = verifyToken(request)
    
    if (!decoded || !['system_admin', 'admin'].includes(decoded.role)) {
      return NextResponse.json(
        { message: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    await connectDB()
    
    const purchase = await Purchase.findById(params.id)
      .populate('customerId', 'name email phone category address')
      .populate('salesRepId', 'name email department employeeId')
      .populate('items.productId', 'productCode productName category stockStatus retailPrice wholesalePrice preferredCustomerPrice')
      .lean()
    
    if (!purchase) {
      return NextResponse.json(
        { message: 'Purchase not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Purchase retrieved successfully',
      data: purchase
    })
  } catch (error) {
    console.error('Error fetching purchase:', error)
    return NextResponse.json(
      { message: 'Failed to fetch purchase', error: error instanceof Error ? error.message : 'Unknown error' },
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
    
    if (!decoded || !['system_admin', 'admin'].includes(decoded.role)) {
      return NextResponse.json(
        { message: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    await connectDB()
    
    const body = await request.json()
    
    // Check if purchase exists
    const existingPurchase = await Purchase.findById(params.id)
    if (!existingPurchase) {
      return NextResponse.json(
        { message: 'Purchase not found' },
        { status: 404 }
      )
    }

    // Don't allow editing of completed purchases without special permission
    if (existingPurchase.orderStatus === 'delivered' && !body.forceUpdate) {
      return NextResponse.json(
        { message: 'Cannot modify delivered purchases without force update' },
        { status: 400 }
      )
    }

    // Update allowed fields
    const allowedFields = [
      'paymentStatus', 'paidAmount', 'paymentDate', 'paymentReference',
      'orderStatus', 'shippingDate', 'deliveryDate', 'trackingNumber',
      'shippingAddress', 'notes', 'internalNotes',
      'returnRequested', 'returnDate', 'returnReason',
      'refundAmount', 'refundDate', 'commissionPaid', 'commissionPaidDate'
    ]

    const updateData: any = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    // Convert date strings to Date objects
    const dateFields = ['paymentDate', 'shippingDate', 'deliveryDate', 'returnDate', 'refundDate', 'commissionPaidDate']
    for (const field of dateFields) {
      if (updateData[field]) {
        updateData[field] = new Date(updateData[field])
      }
    }

    updateData.updatedAt = new Date()

    const updatedPurchase = await Purchase.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('customerId', 'name email phone category')
     .populate('salesRepId', 'name email department')
     .populate('items.productId', 'productCode productName category stockStatus')

    return NextResponse.json({
      message: 'Purchase updated successfully',
      data: updatedPurchase
    })

  } catch (error) {
    console.error('Error updating purchase:', error)
    return NextResponse.json(
      { message: 'Failed to update purchase', error: error instanceof Error ? error.message : 'Unknown error' },
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
    
    if (!decoded || decoded.role !== 'system_admin') {
      return NextResponse.json(
        { message: 'Unauthorized - System admin access required' },
        { status: 403 }
      )
    }

    await connectDB()
    
    const purchase = await Purchase.findById(params.id)
    if (!purchase) {
      return NextResponse.json(
        { message: 'Purchase not found' },
        { status: 404 }
      )
    }

    // Don't allow deletion of purchases that are delivered or have payments
    if (purchase.orderStatus === 'delivered' || purchase.paidAmount > 0) {
      return NextResponse.json(
        { message: 'Cannot delete delivered purchases or purchases with payments' },
        { status: 400 }
      )
    }

    // Soft delete by setting isActive to false
    await Purchase.findByIdAndUpdate(
      params.id,
      { 
        isActive: false,
        orderStatus: 'cancelled',
        updatedAt: new Date()
      }
    )

    return NextResponse.json({
      message: 'Purchase deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting purchase:', error)
    return NextResponse.json(
      { message: 'Failed to delete purchase', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}