'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

interface Product {
  _id: string
  productCode: string
  productName: string
  category: string
  description?: string
  ingredients?: string[]
  servingSize?: string
  servingsPerContainer?: number
  benefits?: string[]
  healthConcerns?: string[]
  recommendedDosage?: string
  usageInstructions?: string
  precautions?: string[]
  contraindications?: string[]
  retailPrice?: number
  wholesalePrice?: number
  preferredCustomerPrice?: number
  points?: number
  stockStatus: string
  popularity: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth/login')
      return
    }
    
    loadProduct()
  }, [params.id])

  const loadProduct = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/products/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setProduct(data.data)
      } else if (response.status === 404) {
        router.push('/dashboard/products')
      }
    } catch (error) {
      console.error('Error loading product:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!product || !confirm(`确定要删除产品 "${product.productName}" 吗？`)) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/products/${product._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        router.push('/dashboard/products')
      } else {
        alert('删除失败')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('删除失败')
    }
  }

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'bg-green-100 text-green-800'
      case 'low_stock': return 'bg-yellow-100 text-yellow-800'
      case 'out_of_stock': return 'bg-red-100 text-red-800'
      case 'discontinued': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStockStatusText = (status: string) => {
    switch (status) {
      case 'in_stock': return '有库存'
      case 'low_stock': return '库存不足'
      case 'out_of_stock': return '缺货'
      case 'discontinued': return '已停产'
      default: return status
    }
  }

  const getStockStatusIcon = (status: string) => {
    switch (status) {
      case 'in_stock': return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'low_stock': return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
      case 'out_of_stock': return <XCircleIcon className="h-5 w-5 text-red-500" />
      case 'discontinued': return <XCircleIcon className="h-5 w-5 text-gray-500" />
      default: return null
    }
  }

  const getCategoryName = (category: string) => {
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
    return categoryNames[category] || category
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">产品未找到</h2>
          <Link href="/dashboard/products" className="btn btn-primary mt-4">
            返回产品列表
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Link
                  href="/dashboard/products"
                  className="mr-4 text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeftIcon className="h-6 w-6" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{product.productName}</h1>
                  <p className="mt-1 text-sm text-gray-600">
                    产品编码: {product.productCode}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Link
                  href={`/dashboard/products/${product._id}/edit`}
                  className="btn btn-secondary flex items-center"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  编辑
                </Link>
                <button
                  onClick={handleDelete}
                  className="btn btn-danger flex items-center"
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">基本信息</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">产品分类</dt>
                  <dd className="mt-1 text-sm text-gray-900">{getCategoryName(product.category)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">库存状态</dt>
                  <dd className="mt-1">
                    <div className="flex items-center">
                      {getStockStatusIcon(product.stockStatus)}
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStockStatusColor(product.stockStatus)}`}>
                        {getStockStatusText(product.stockStatus)}
                      </span>
                    </div>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">受欢迎程度</dt>
                  <dd className="mt-1 text-sm text-gray-900">{product.popularity}/100</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">状态</dt>
                  <dd className="mt-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {product.isActive ? '启用' : '禁用'}
                    </span>
                  </dd>
                </div>
                {product.description && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">产品描述</dt>
                    <dd className="mt-1 text-sm text-gray-900">{product.description}</dd>
                  </div>
                )}
              </div>
            </div>

            {/* Product Details */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">产品详情</h2>
              <div className="space-y-4">
                {product.servingSize && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">服用剂量</dt>
                    <dd className="mt-1 text-sm text-gray-900">{product.servingSize}</dd>
                  </div>
                )}
                {product.servingsPerContainer && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">每瓶份数</dt>
                    <dd className="mt-1 text-sm text-gray-900">{product.servingsPerContainer}</dd>
                  </div>
                )}
                {product.ingredients && product.ingredients.length > 0 && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">成分列表</dt>
                    <dd className="mt-1">
                      <ul className="list-disc list-inside text-sm text-gray-900">
                        {product.ingredients.map((ingredient, index) => (
                          <li key={index}>{ingredient}</li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                )}
                {product.benefits && product.benefits.length > 0 && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">功效和好处</dt>
                    <dd className="mt-1">
                      <ul className="list-disc list-inside text-sm text-gray-900">
                        {product.benefits.map((benefit, index) => (
                          <li key={index}>{benefit}</li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                )}
                {product.healthConcerns && product.healthConcerns.length > 0 && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">针对的健康问题</dt>
                    <dd className="mt-1">
                      <ul className="list-disc list-inside text-sm text-gray-900">
                        {product.healthConcerns.map((concern, index) => (
                          <li key={index}>{concern}</li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                )}
              </div>
            </div>

            {/* Usage Instructions */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">使用指导</h2>
              <div className="space-y-4">
                {product.recommendedDosage && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">推荐用量</dt>
                    <dd className="mt-1 text-sm text-gray-900">{product.recommendedDosage}</dd>
                  </div>
                )}
                {product.usageInstructions && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">使用说明</dt>
                    <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">{product.usageInstructions}</dd>
                  </div>
                )}
                {product.precautions && product.precautions.length > 0 && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">注意事项</dt>
                    <dd className="mt-1">
                      <ul className="list-disc list-inside text-sm text-gray-900">
                        {product.precautions.map((precaution, index) => (
                          <li key={index}>{precaution}</li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                )}
                {product.contraindications && product.contraindications.length > 0 && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">禁忌症</dt>
                    <dd className="mt-1">
                      <ul className="list-disc list-inside text-sm text-red-600">
                        {product.contraindications.map((contraindication, index) => (
                          <li key={index}>{contraindication}</li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Information */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">价格信息</h2>
              <div className="space-y-3">
                {product.retailPrice && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">零售价</span>
                    <span className="text-sm text-gray-900">¥{product.retailPrice.toFixed(2)}</span>
                  </div>
                )}
                {product.wholesalePrice && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">批发价</span>
                    <span className="text-sm text-gray-900">¥{product.wholesalePrice.toFixed(2)}</span>
                  </div>
                )}
                {product.preferredCustomerPrice && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">优惠客户价</span>
                    <span className="text-sm text-gray-900">¥{product.preferredCustomerPrice.toFixed(2)}</span>
                  </div>
                )}
                {product.points && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">积分值</span>
                    <span className="text-sm text-gray-900">{product.points}</span>
                  </div>
                )}
              </div>
            </div>

            {/* System Information */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">系统信息</h2>
              <div className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">创建时间</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(product.createdAt).toLocaleString('zh-CN')}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">更新时间</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(product.updatedAt).toLocaleString('zh-CN')}
                  </dd>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">快速操作</h2>
              <div className="space-y-3">
                <Link
                  href={`/dashboard/products/${product._id}/edit`}
                  className="w-full btn btn-secondary flex items-center justify-center"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  编辑产品
                </Link>
                <button
                  onClick={handleDelete}
                  className="w-full btn btn-danger flex items-center justify-center"
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  删除产品
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}