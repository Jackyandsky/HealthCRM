'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeftIcon,
} from '@heroicons/react/24/outline'
import type { Purchase } from '@/lib/types'

export default function EditPurchasePage({ params }: { params: { id: string } }) {
  const [purchase, setPurchase] = useState<Purchase | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState('')
  const [orderStatus, setOrderStatus] = useState('')
  const [paidAmount, setPaidAmount] = useState(0)
  const [shippingAddress, setShippingAddress] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [notes, setNotes] = useState('')
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
        const purchaseData = data.data
        setPurchase(purchaseData)
        setPaymentStatus(purchaseData.paymentStatus)
        setOrderStatus(purchaseData.orderStatus)
        setPaidAmount(purchaseData.paidAmount || 0)
        setShippingAddress(purchaseData.shippingAddress || '')
        setTrackingNumber(purchaseData.trackingNumber || '')
        setNotes(purchaseData.notes || '')
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setSaving(true)
      const token = localStorage.getItem('token')
      
      const updateData = {
        paymentStatus,
        orderStatus,
        paidAmount,
        shippingAddress,
        trackingNumber,
        notes,
      }

      const response = await fetch(`/api/purchases/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        router.push(`/dashboard/purchases/${params.id}`)
      } else {
        const data = await response.json()
        alert(data.message || '更新失败')
      }
    } catch (error) {
      console.error('Error updating purchase:', error)
      alert('更新失败')
    } finally {
      setSaving(false)
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
                  href={`/dashboard/purchases/${params.id}`}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ArrowLeftIcon className="h-6 w-6" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">编辑订单</h1>
                  <p className="mt-1 text-sm text-gray-600">
                    订单号: {purchase.purchaseId}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order Status */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">订单状态</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="paymentStatus" className="block text-sm font-medium text-gray-700">
                  付款状态
                </label>
                <select
                  id="paymentStatus"
                  className="mt-1 input"
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                >
                  <option value="pending">待付款</option>
                  <option value="partial">部分付款</option>
                  <option value="paid">已付款</option>
                  <option value="refunded">已退款</option>
                  <option value="cancelled">已取消</option>
                </select>
              </div>

              <div>
                <label htmlFor="orderStatus" className="block text-sm font-medium text-gray-700">
                  订单状态
                </label>
                <select
                  id="orderStatus"
                  className="mt-1 input"
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value)}
                >
                  <option value="draft">草稿</option>
                  <option value="confirmed">已确认</option>
                  <option value="processing">处理中</option>
                  <option value="shipped">已发货</option>
                  <option value="delivered">已送达</option>
                  <option value="cancelled">已取消</option>
                  <option value="returned">已退货</option>
                </select>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">付款信息</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="totalAmount" className="block text-sm font-medium text-gray-700">
                  订单总额
                </label>
                <div className="mt-1 text-lg font-medium text-gray-900">
                  ¥{purchase.totalAmount.toLocaleString()}
                </div>
              </div>

              <div>
                <label htmlFor="paidAmount" className="block text-sm font-medium text-gray-700">
                  已付金额
                </label>
                <input
                  type="number"
                  id="paidAmount"
                  step="0.01"
                  min="0"
                  max={purchase.totalAmount}
                  className="mt-1 input"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            {purchase.totalAmount > paidAmount && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="text-sm text-yellow-800">
                  待付金额: ¥{(purchase.totalAmount - paidAmount).toLocaleString()}
                </div>
              </div>
            )}
          </div>

          {/* Shipping Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">配送信息</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="shippingAddress" className="block text-sm font-medium text-gray-700">
                  配送地址
                </label>
                <input
                  type="text"
                  id="shippingAddress"
                  className="mt-1 input"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="输入配送地址"
                />
              </div>

              <div>
                <label htmlFor="trackingNumber" className="block text-sm font-medium text-gray-700">
                  物流单号
                </label>
                <input
                  type="text"
                  id="trackingNumber"
                  className="mt-1 input"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="输入物流单号"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">备注</h3>
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                订单备注
              </label>
              <textarea
                id="notes"
                rows={4}
                className="mt-1 input"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="输入订单备注信息"
              />
            </div>
          </div>

          {/* Order Items (Read-only) */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">订单商品</h3>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ¥{item.unitPrice.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ¥{item.totalPrice.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Link
              href={`/dashboard/purchases/${params.id}`}
              className="btn btn-secondary"
            >
              取消
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
            >
              {saving ? '保存中...' : '保存更改'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}