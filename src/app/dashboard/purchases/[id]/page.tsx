'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  UserIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import type { Purchase } from '@/lib/types'

const PAYMENT_STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  partial: 'bg-blue-100 text-blue-800',
  paid: 'bg-green-100 text-green-800',
  refunded: 'bg-purple-100 text-purple-800',
  cancelled: 'bg-red-100 text-red-800',
}

const PAYMENT_STATUS_LABELS = {
  pending: '待付款',
  partial: '部分付款',
  paid: '已付款',
  refunded: '已退款',
  cancelled: '已取消',
}

const ORDER_STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-yellow-100 text-yellow-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  returned: 'bg-purple-100 text-purple-800',
}

const ORDER_STATUS_LABELS = {
  draft: '草稿',
  confirmed: '已确认',
  processing: '处理中',
  shipped: '已发货',
  delivered: '已送达',
  cancelled: '已取消',
  returned: '已退货',
}

export default function PurchaseDetailPage({ params }: { params: { id: string } }) {
  const [purchase, setPurchase] = useState<Purchase | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth/login')
      return
    }
    
    loadPurchase()
  }, [params.id])

  const loadPurchase = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/purchases/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setPurchase(data.data)
      } else {
        router.push('/dashboard/purchases')
      }
    } catch (error) {
      console.error('Error loading purchase:', error)
      router.push('/dashboard/purchases')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!purchase || !confirm(`确定要删除订单 "${purchase.purchaseId}" 吗？此操作不可撤销。`)) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/purchases/${params.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        router.push('/dashboard/purchases')
      } else {
        const data = await response.json()
        alert(data.message || '删除失败')
      }
    } catch (error) {
      console.error('Error deleting purchase:', error)
      alert('删除失败')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!purchase) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">订单不存在</h3>
          <Link href="/dashboard/purchases" className="mt-2 btn btn-primary">
            返回订单列表
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
                  href="/dashboard/purchases"
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ArrowLeftIcon className="h-6 w-6" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">订单详情</h1>
                  <p className="mt-1 text-sm text-gray-600">
                    订单号: {purchase.purchaseId}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Link
                  href={`/dashboard/purchases/${params.id}/edit`}
                  className="btn btn-secondary flex items-center"
                >
                  <PencilIcon className="h-5 w-5 mr-2" />
                  编辑
                </Link>
                {purchase.orderStatus !== 'delivered' && (
                  <button
                    onClick={handleDelete}
                    className="btn btn-danger flex items-center"
                  >
                    <TrashIcon className="h-5 w-5 mr-2" />
                    删除
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Purchase Items */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">订单商品</h3>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          商品
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          数量
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          单价
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          小计
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {purchase.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {item.productName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {item.productCode}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm text-gray-900">
                                ¥{item.unitPrice.toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-500">
                                {item.priceType === 'retail' ? '零售价' : 
                                 item.priceType === 'wholesale' ? '批发价' : '优惠价'}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ¥{item.totalPrice.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="mt-6 border-t pt-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">小计:</span>
                      <span className="text-gray-900">¥{purchase.subtotal.toLocaleString()}</span>
                    </div>
                    {purchase.totalDiscount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">折扣:</span>
                        <span className="text-red-600">-¥{purchase.totalDiscount.toLocaleString()}</span>
                      </div>
                    )}
                    {purchase.tax > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">税费:</span>
                        <span className="text-gray-900">¥{purchase.tax.toLocaleString()}</span>
                      </div>
                    )}
                    {purchase.shippingCost > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">运费:</span>
                        <span className="text-gray-900">¥{purchase.shippingCost.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-medium border-t pt-2">
                      <span className="text-gray-900">总计:</span>
                      <span className="text-gray-900">¥{purchase.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {purchase.notes && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">备注</h3>
                </div>
                <div className="p-6">
                  <p className="text-gray-700">{purchase.notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">订单状态</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <div className="text-sm text-gray-500">付款状态</div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${PAYMENT_STATUS_COLORS[purchase.paymentStatus as keyof typeof PAYMENT_STATUS_COLORS]}`}>
                    {PAYMENT_STATUS_LABELS[purchase.paymentStatus as keyof typeof PAYMENT_STATUS_LABELS]}
                  </span>
                </div>
                <div>
                  <div className="text-sm text-gray-500">订单状态</div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${ORDER_STATUS_COLORS[purchase.orderStatus as keyof typeof ORDER_STATUS_COLORS]}`}>
                    {ORDER_STATUS_LABELS[purchase.orderStatus as keyof typeof ORDER_STATUS_LABELS]}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">客户信息</h3>
              </div>
              <div className="p-6">
                <div className="flex items-center space-x-3">
                  <UserIcon className="h-8 w-8 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {purchase.customerId?.firstName} {purchase.customerId?.lastName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {purchase.customerId?.email}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Info */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">订单信息</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">下单时间</div>
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(purchase.orderDate).toLocaleString('zh-CN')}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">付款方式</div>
                    <div className="text-sm font-medium text-gray-900">
                      {purchase.paymentMethod === 'cash' ? '现金' :
                       purchase.paymentMethod === 'card' ? '刷卡' :
                       purchase.paymentMethod === 'bank_transfer' ? '银行转账' :
                       purchase.paymentMethod === 'check' ? '支票' : purchase.paymentMethod}
                    </div>
                  </div>
                </div>

                {purchase.shippingAddress && (
                  <div>
                    <div className="text-sm text-gray-500">配送地址</div>
                    <div className="text-sm font-medium text-gray-900">
                      {typeof purchase.shippingAddress === 'string' ? purchase.shippingAddress : ''}
                    </div>
                  </div>
                )}

                {purchase.trackingNumber && (
                  <div>
                    <div className="text-sm text-gray-500">物流单号</div>
                    <div className="text-sm font-medium text-gray-900">
                      {purchase.trackingNumber}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}