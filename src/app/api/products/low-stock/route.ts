import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
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
    const category = searchParams.get('category')
    
    // Build filter for low stock and out of stock products
    const filter: any = { 
      isActive: true,
      stockStatus: { $in: ['low_stock', 'out_of_stock'] }
    }
    
    if (category) {
      filter.category = category
    }

    const lowStockProducts = await Product.find(filter)
      .select('productCode productName category stockStatus retailPrice wholesalePrice preferredCustomerPrice')
      .sort({ stockStatus: 1, productName: 1 })
      .lean()

    // Group by stock status
    const groupedProducts = {
      outOfStock: lowStockProducts.filter(p => p.stockStatus === 'out_of_stock'),
      lowStock: lowStockProducts.filter(p => p.stockStatus === 'low_stock')
    }

    return NextResponse.json({
      message: 'Low stock products retrieved successfully',
      data: {
        products: lowStockProducts,
        grouped: groupedProducts,
        summary: {
          totalLowStock: groupedProducts.lowStock.length,
          totalOutOfStock: groupedProducts.outOfStock.length,
          totalAffected: lowStockProducts.length
        }
      }
    })
  } catch (error) {
    console.error('Error fetching low stock products:', error)
    return NextResponse.json(
      { message: 'Failed to fetch low stock products', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}