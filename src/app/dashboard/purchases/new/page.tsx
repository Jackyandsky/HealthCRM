'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeftIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface Customer {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  customerType: string
}

interface Product {
  _id: string
  productCode: string
  productName: string
  retailPrice: number
  wholesalePrice: number
  preferredPrice: number
  stockStatus: string
}

interface HealthPlan {
  _id: string
  planId: string
  title: string
  products: any[]
}

interface PurchaseItem {
  productId: string
  productCode: string
  productName: string
  quantity: number
  unitPrice: number
  priceType: 'retail' | 'wholesale' | 'preferred'
  totalPrice: number
}

export default function NewPurchasePage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [healthPlans, setHealthPlans] = useState<HealthPlan[]>([])
  const [loading, setLoading] = useState(false)
  const [customerId, setCustomerId] = useState('')
  const [healthPlanId, setHealthPlanId] = useState('')
  const [items, setItems] = useState<PurchaseItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [paymentStatus, setPaymentStatus] = useState('pending')
  const [orderStatus, setOrderStatus] = useState('confirmed')
  const [shippingAddress, setShippingAddress] = useState('')
  const [notes, setNotes] = useState('')
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth/login')
      return
    }
    
    loadCustomers()
    loadProducts()
  }, [])

  useEffect(() => {
    if (customerId) {
      loadHealthPlans()
    } else {
      setHealthPlans([])
      setHealthPlanId('')
    }
  }, [customerId])

  const loadCustomers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/customers?limit=100', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setCustomers(data.customers || [])
      }
    } catch (error) {
      console.error('Error loading customers:', error)
    }
  }

  const loadProducts = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/products?limit=100', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setProducts(data.data?.products || [])
      }
    } catch (error) {
      console.error('Error loading products:', error)
    }
  }

  const loadHealthPlans = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/health-plans?customerId=${customerId}&limit=50`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setHealthPlans(data.data?.healthPlans || [])
      }
    } catch (error) {
      console.error('Error loading health plans:', error)
    }
  }

  const loadRecommendedProducts = (selectedHealthPlanId: string) => {
    if (!selectedHealthPlanId) {
      setItems([])
      return
    }
    
    const selectedPlan = healthPlans.find(plan => plan._id === selectedHealthPlanId)
    if (!selectedPlan || !selectedPlan.products) {
      setItems([])
      return
    }

    const recommendedItems = selectedPlan.products.map(planProduct => {
      // Handle both populated and non-populated productId
      const productId = typeof planProduct.productId === 'object' ? planProduct.productId._id : planProduct.productId
      const product = products.find(p => p._id === productId)
      
      if (!product) {
        console.log('Product not found for ID:', productId)
        return null
      }

      return {
        productId: productId,
        productCode: product.productCode,
        productName: product.productName,
        quantity: planProduct.quantity || 1,
        unitPrice: product.retailPrice || 0,
        priceType: 'retail' as 'retail' | 'wholesale' | 'preferred',
        totalPrice: (planProduct.quantity || 1) * (product.retailPrice || 0)
      }
    }).filter(item => item !== null)

    setItems(recommendedItems as PurchaseItem[])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof PurchaseItem, value: any) => {
    const updatedItems = [...items]
    updatedItems[index] = { ...updatedItems[index], [field]: value }

    // Auto-fill product details when product is selected
    if (field === 'productId' && value) {
      const product = products.find(p => p._id === value)
      if (product) {
        updatedItems[index].productCode = product.productCode
        updatedItems[index].productName = product.productName
        updatedItems[index].unitPrice = product.retailPrice
        updatedItems[index].priceType = 'retail'
      }
    }

    // Update unit price when price type changes
    if (field === 'priceType' && updatedItems[index].productId) {
      const product = products.find(p => p._id === updatedItems[index].productId)
      if (product) {
        updatedItems[index].unitPrice = value === 'retail' ? product.retailPrice : 
                                       value === 'wholesale' ? product.wholesalePrice : 
                                       product.preferredPrice
      }
    }

    // Calculate total price
    updatedItems[index].totalPrice = updatedItems[index].quantity * updatedItems[index].unitPrice

    setItems(updatedItems)
  }

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.totalPrice, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!customerId) {
      alert('请选择客户')
      return
    }
    
    if (items.length === 0) {
      alert('请选择包含产品的健康方案')
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      const purchaseData = {
        customerId,
        healthPlanId: healthPlanId || undefined,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          priceType: item.priceType,
        })),
        paymentMethod,
        paymentStatus,
        orderStatus,
        shippingAddress,
        notes,
        subtotal: calculateSubtotal(),
        totalAmount: calculateSubtotal(),
      }

      const response = await fetch('/api/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(purchaseData),
      })

      if (response.ok) {
        router.push('/dashboard/purchases')
      } else {
        const data = await response.json()
        alert(data.message || '创建订单失败')
      }
    } catch (error) {
      console.error('Error creating purchase:', error)
      alert('创建订单失败')
    } finally {
      setLoading(false)
    }
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
                  <h1 className="text-2xl font-bold text-gray-900">新增订单</h1>
                  <p className="mt-1 text-sm text-gray-600">
                    创建新的客户订单
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Selection */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">客户信息</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="customerId" className="block text-sm font-medium text-gray-700">
                  选择客户 *
                </label>
                <select
                  id="customerId"
                  required
                  className="mt-1 input"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                >
                  <option value="">请选择客户</option>
                  {customers.map((customer) => (
                    <option key={customer._id} value={customer._id}>
                      {customer.firstName} {customer.lastName} ({customer.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="healthPlanId" className="block text-sm font-medium text-gray-700">
                  关联产品方案 (可选)
                </label>
                <select
                  id="healthPlanId"
                  className="mt-1 input"
                  value={healthPlanId}
                  onChange={(e) => {
                    setHealthPlanId(e.target.value)
                    loadRecommendedProducts(e.target.value)
                  }}
                  disabled={!customerId}
                >
                  <option value="">请选择产品方案</option>
                  {healthPlans.map((plan) => (
                    <option key={plan._id} value={plan._id}>
                      {plan.title} ({plan.planId})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">订单商品</h3>
              <div className="text-sm text-gray-500">
                {healthPlanId ? '来自所选产品方案' : '请先选择产品方案'}
              </div>
            </div>

            {items.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                {customerId ? (healthPlanId ? '所选方案暂无产品' : '请选择产品方案以加载商品') : '请先选择客户'}
              </p>
            ) : (
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="text-sm font-medium text-gray-900">商品 {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          产品信息
                        </label>
                        <div className="mt-1 p-2 bg-gray-50 rounded border">
                          <div className="font-medium text-gray-900">{item.productName}</div>
                          <div className="text-sm text-gray-500">{item.productCode}</div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          数量 *
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          className="mt-1 input"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          价格类型
                        </label>
                        <select
                          className="mt-1 input"
                          value={item.priceType}
                          onChange={(e) => updateItem(index, 'priceType', e.target.value)}
                        >
                          <option value="retail">零售价</option>
                          <option value="wholesale">批发价</option>
                          <option value="preferred">优惠价</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          小计
                        </label>
                        <div className="mt-1 text-lg font-medium text-gray-900">
                          ¥{item.totalPrice.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="border-t pt-4">
                  <div className="flex justify-end">
                    <div className="text-right">
                      <div className="text-lg font-medium text-gray-900">
                        总计: ¥{calculateSubtotal().toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Details */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">订单详情</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">
                  付款方式
                </label>
                <select
                  id="paymentMethod"
                  className="mt-1 input"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="cash">现金</option>
                  <option value="card">刷卡</option>
                  <option value="bank_transfer">银行转账</option>
                  <option value="check">支票</option>
                </select>
              </div>

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
                  <option value="paid">已付款</option>
                  <option value="partial">部分付款</option>
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
                </select>
              </div>

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
            </div>

            <div className="mt-4">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                备注
              </label>
              <textarea
                id="notes"
                rows={3}
                className="mt-1 input"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="订单备注信息"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Link
              href="/dashboard/purchases"
              className="btn btn-secondary"
            >
              取消
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? '创建中...' : '创建订单'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}