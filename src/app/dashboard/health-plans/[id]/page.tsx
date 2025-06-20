'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeftIcon,
  UserIcon,
  CubeIcon,
  PencilIcon,
  TrashIcon,
  TagIcon,
  HomeIcon
} from '@heroicons/react/24/outline'

interface HealthPlan {
  _id: string
  planId: string
  customerId: {
    _id: string
    firstName: string
    lastName: string
    email: string
    phone: string
    customerType: string
  } | any
  title: string
  description?: string
  tags?: string[]
  products?: Array<{
    productId: {
      _id: string
      productCode: string
      productName: string
      category: string
      retailPrice: number
    }
    customGuidance: string
  }>
  productRecommendations?: Array<{
    productId: {
      _id: string
      productCode: string
      productName: string
      category: string
      retailPrice: number
    }
    customGuidance?: string
  }>
  createdAt: string
  updatedAt: string
}

export default function HealthPlanDetailPage({ params }: { params: { id: string } }) {
  const [healthPlan, setHealthPlan] = useState<HealthPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth/login')
      return
    }
    
    loadHealthPlan()
  }, [])

  const loadHealthPlan = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/health-plans/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Health plan data loaded:', data.data)
        setHealthPlan(data.data)
      } else {
        console.error('Failed to load health plan, status:', response.status)
        const errorData = await response.json().catch(() => ({}))
        console.error('Error details:', errorData)
      }
    } catch (error) {
      console.error('Error loading health plan:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`确定要删除产品方案 "${healthPlan?.planId}" 吗？`)) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/health-plans/${params.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        router.push('/dashboard/health-plans')
      } else {
        const data = await response.json()
        alert(data.message || '删除失败')
      }
    } catch (error) {
      console.error('Error deleting health plan:', error)
      alert('删除失败')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!healthPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">产品方案未找到</h1>
          <Link href="/dashboard/health-plans" className="btn btn-primary">
            返回列表
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
              <div className="flex items-center space-x-4">
                <Link
                  href="/dashboard/health-plans"
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ArrowLeftIcon className="h-6 w-6" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{healthPlan.title}</h1>
                  <p className="mt-1 text-sm text-gray-600">
                    方案编号: {healthPlan.planId}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Link
                  href="/dashboard"
                  className="btn btn-secondary flex items-center"
                >
                  <HomeIcon className="h-5 w-5 mr-2" />
                  主控面板
                </Link>
                <Link
                  href={`/dashboard/health-plans/${healthPlan._id}/edit`}
                  className="btn btn-secondary flex items-center"
                >
                  <PencilIcon className="h-5 w-5 mr-2" />
                  编辑
                </Link>
                <button
                  onClick={handleDelete}
                  className="btn btn-danger flex items-center"
                >
                  <TrashIcon className="h-5 w-5 mr-2" />
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          
          {/* Customer Information */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <UserIcon className="h-5 w-5 mr-2" />
                  客户信息
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">姓名</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {healthPlan.customerId?.firstName || healthPlan.customerId?.name || 'N/A'} {healthPlan.customerId?.lastName || ''}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">邮箱</label>
                    <p className="mt-1 text-sm text-gray-900">{healthPlan.customerId?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">电话</label>
                    <p className="mt-1 text-sm text-gray-900">{healthPlan.customerId?.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">客户类型</label>
                    <p className="mt-1 text-sm text-gray-900">{healthPlan.customerId?.customerType || healthPlan.customerId?.category || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tags */}
            {healthPlan.tags && healthPlan.tags.length > 0 && (
              <div className="bg-white shadow rounded-lg mt-6">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <TagIcon className="h-5 w-5 mr-2" />
                    标签
                  </h3>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-2">
                    {healthPlan.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Plan Details */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">方案详情</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">方案标题</label>
                    <p className="mt-1 text-lg font-medium text-gray-900">{healthPlan.title}</p>
                  </div>
                  {healthPlan.description && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">方案描述</label>
                      <p className="mt-1 text-sm text-gray-900">{healthPlan.description}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">创建时间</label>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(healthPlan.createdAt)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">更新时间</label>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(healthPlan.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Products */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <CubeIcon className="h-5 w-5 mr-2" />
                  产品列表 ({(healthPlan.products?.length || healthPlan.productRecommendations?.length || 0)})
                </h3>
              </div>
              <div className="p-6">
                {(() => {
                  const productsList = healthPlan.products || healthPlan.productRecommendations || []
                  return productsList.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">暂无产品</p>
                  ) : (
                    <div className="space-y-4">
                      {productsList.map((productItem: any, index: number) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">
                                {productItem.productId?.productName || productItem.productName || 'Product Name N/A'}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {productItem.productId?.productCode || productItem.productCode || 'N/A'} | {productItem.productId?.category || productItem.category || 'N/A'}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                零售价: ¥{(productItem.productId?.retailPrice || productItem.retailPrice || 0).toLocaleString()}
                              </p>
                              {(productItem.customGuidance || productItem.guidance) && (
                                <div className="mt-3">
                                  <label className="block text-sm font-medium text-gray-500">定制指导</label>
                                  <p className="mt-1 text-sm text-gray-900">{productItem.customGuidance || productItem.guidance}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}