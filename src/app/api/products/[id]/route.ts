import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import { verifyToken } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const product = await Product.findById(params.id).lean()
    
    if (!product) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Product retrieved successfully',
      data: product
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { message: 'Failed to fetch product', error: error instanceof Error ? error.message : 'Unknown error' },
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
    
    // Check if product exists
    const existingProduct = await Product.findById(params.id)
    if (!existingProduct) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      )
    }

    // If updating product code, check for duplicates
    if (body.productCode && body.productCode !== existingProduct.productCode) {
      const duplicateProduct = await Product.findOne({ 
        productCode: body.productCode,
        _id: { $ne: params.id }
      })
      if (duplicateProduct) {
        return NextResponse.json(
          { message: 'Product code already exists' },
          { status: 400 }
        )
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      params.id,
      { 
        ...body,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    )

    return NextResponse.json({
      message: 'Product updated successfully',
      data: updatedProduct
    })

  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { message: 'Failed to update product', error: error instanceof Error ? error.message : 'Unknown error' },
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
    
    if (!decoded || !['system_admin', 'admin'].includes(decoded.role)) {
      return NextResponse.json(
        { message: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    await connectDB()
    
    const product = await Product.findById(params.id)
    if (!product) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      )
    }

    // Soft delete by setting isActive to false
    await Product.findByIdAndUpdate(
      params.id,
      { 
        isActive: false,
        updatedAt: new Date()
      }
    )

    return NextResponse.json({
      message: 'Product deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { message: 'Failed to delete product', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}