import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    // Get all unique categories with product counts
    const categories = await Product.aggregate([
      { $match: { isActive: true } },
      { 
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          lowStockCount: {
            $sum: {
              $cond: [
                { $eq: ['$stockStatus', 'low_stock'] },
                1,
                0
              ]
            }
          },
          outOfStockCount: {
            $sum: {
              $cond: [
                { $eq: ['$stockStatus', 'out_of_stock'] },
                1,
                0
              ]
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ])

    // Add category display names in Chinese
    const categoryNames: Record<string, string> = {
      'vitamins': '维生素',
      'minerals': '矿物质',
      'antioxidants': '抗氧化剂',
      'omega': '欧米伽',
      'probiotics': '益生菌',
      'protein': '蛋白质',
      'weight_management': '体重管理',
      'skincare': '护肤品',
      'energy_metabolism': '能量代谢',
      'immune_support': '免疫支持',
      'heart_health': '心脏健康',
      'bone_joint': '骨骼关节',
      'digestive_health': '消化健康',
      'brain_cognitive': '大脑认知',
      'womens_health': '女性健康',
      'mens_health': '男性健康',
      'childrens_health': '儿童健康',
    }

    const formattedCategories = categories.map(cat => ({
      id: cat._id,
      name: categoryNames[cat._id] || cat._id,
      englishName: cat._id,
      productCount: cat.count,
      lowStockCount: cat.lowStockCount,
      outOfStockCount: cat.outOfStockCount
    }))

    return NextResponse.json({
      message: 'Categories retrieved successfully',
      data: formattedCategories
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { message: 'Failed to fetch categories', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}