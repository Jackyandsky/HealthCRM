'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeftIcon,
} from '@heroicons/react/24/outline'

interface Customer {
  _id: string
  customerId: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  customerType: string
}

interface Purchase {
  _id: string
  purchaseId: string
  totalAmount: number
  orderDate: string
}

const FOLLOW_UP_TYPES = [
  { value: 'health_check', label: '健康检查' },
  { value: 'product_feedback', label: '产品反馈' },
  { value: 'reorder_reminder', label: '补货提醒' },
  { value: 'plan_adjustment', label: '计划调整' },
  { value: 'satisfaction_survey', label: '满意度调查' },
  { value: 'general_inquiry', label: '一般咨询' },
  { value: 'complaint_resolution', label: '投诉处理' },
  { value: 'education', label: '健康教育' },
  { value: 'promotional', label: '促销活动' },
  { value: 'other', label: '其他' },
]

const PRIORITY_OPTIONS = [
  { value: 'low', label: '低' },
  { value: 'medium', label: '中' },
  { value: 'high', label: '高' },
  { value: 'urgent', label: '紧急' },
]

const COMMUNICATION_METHODS = [
  { value: 'phone', label: '电话' },
  { value: 'email', label: '邮件' },
  { value: 'wechat', label: '微信' },
  { value: 'sms', label: '短信' },
  { value: 'in_person', label: '面谈' },
  { value: 'video_call', label: '视频通话' },
]

export default function NewFollowUpPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(false)
  const [customerSearch, setCustomerSearch] = useState('')
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const router = useRouter()

  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    title: '',
    description: '',
    type: 'general_inquiry',
    priority: 'medium',
    scheduledDate: '',
    scheduledTime: '',
    communicationMethod: 'phone',
    relatedPurchaseId: ''
  })
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const customerDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth/login')
      return
    }
    
    loadInitialData()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target as Node)) {
        setShowCustomerDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (customerSearch) {
      const filtered = customers.filter(customer => {
        const fullName = `${customer.firstName} ${customer.lastName}`
        return fullName.toLowerCase().includes(customerSearch.toLowerCase()) ||
               customer.customerId.toLowerCase().includes(customerSearch.toLowerCase()) ||
               customer.email?.toLowerCase().includes(customerSearch.toLowerCase())
      })
      setFilteredCustomers(filtered)
    } else {
      setFilteredCustomers(customers)
    }
  }, [customerSearch, customers])

  const loadInitialData = async () => {
    try {
      const token = localStorage.getItem('token')
      
      const customersRes = await fetch('/api/customers?limit=100', {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (customersRes.ok) {
        const customersData = await customersRes.json()
        setCustomers(customersData.customers || [])
      }
    } catch (error) {
      console.error('Error loading initial data:', error)
    }
  }

  const loadCustomerPurchases = async (customerId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/purchases?customerId=${customerId}&limit=10`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setPurchases(data.data.purchases || [])
      }
    } catch (error) {
      console.error('Error loading customer purchases:', error)
    }
  }

  const handleCustomerSelect = (customer: Customer) => {
    const fullName = `${customer.firstName} ${customer.lastName}`
    setFormData(prev => ({
      ...prev,
      customerId: customer._id,
      customerName: fullName
    }))
    setCustomerSearch(fullName)
    setShowCustomerDropdown(false)
    loadCustomerPurchases(customer._id)
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.customerId || !formData.title || !formData.scheduledDate) {
      alert('请填写所有必填字段')
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      
      // Prepare submission data with required fields
      const submissionData = {
        ...formData,
        scheduledDate: new Date(formData.scheduledDate + (formData.scheduledTime ? `T${formData.scheduledTime}` : 'T00:00')),
        publicNotes: formData.description, // Use description as notes
        // Remove fields that don't exist in the model
        customerName: undefined
      }
      
      const response = await fetch('/api/follow-ups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(submissionData),
      })

      if (response.ok) {
        router.push('/dashboard/follow-ups')
      } else {
        const data = await response.json()
        alert(data.message || '创建失败')
      }
    } catch (error) {
      console.error('Error creating follow-up:', error)
      alert('创建失败')
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
              <div className="flex items-center">
                <Link
                  href="/dashboard/follow-ups"
                  className="mr-4 text-gray-400 hover:text-gray-600"
                >
                  <ArrowLeftIcon className="h-6 w-6" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">新增回访</h1>
                  <p className="mt-1 text-sm text-gray-600">
                    创建新的客户回访计划
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Follow-up Information */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">创建回访</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="relative sm:col-span-2 lg:col-span-1" ref={customerDropdownRef}>
                  <label htmlFor="customer" className="block text-sm font-medium text-gray-700">
                    客户 *
                  </label>
                  <input
                    type="text"
                    className="mt-1 input"
                    placeholder="搜索客户..."
                    value={customerSearch}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value)
                      setShowCustomerDropdown(true)
                    }}
                    onFocus={() => setShowCustomerDropdown(true)}
                  />
                  {showCustomerDropdown && filteredCustomers.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredCustomers.map((customer) => (
                        <div
                          key={customer._id}
                          className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleCustomerSelect(customer)}
                        >
                          <div className="font-medium">{customer.firstName} {customer.lastName}</div>
                          <div className="text-sm text-gray-500">
                            {customer.customerId} | {customer.email}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                    回访类型 *
                  </label>
                  <select
                    id="type"
                    className="mt-1 input"
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    required
                  >
                    {FOLLOW_UP_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                    优先级
                  </label>
                  <select
                    id="priority"
                    className="mt-1 input"
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  >
                    {PRIORITY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2 lg:col-span-3">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    回访标题 *
                  </label>
                  <input
                    type="text"
                    id="title"
                    className="mt-1 input"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="输入回访标题"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700">
                    安排日期 *
                  </label>
                  <input
                    type="date"
                    id="scheduledDate"
                    className="mt-1 input"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="scheduledTime" className="block text-sm font-medium text-gray-700">
                    安排时间
                  </label>
                  <input
                    type="time"
                    id="scheduledTime"
                    className="mt-1 input"
                    value={formData.scheduledTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                  />
                </div>

                <div>
                  <label htmlFor="communicationMethod" className="block text-sm font-medium text-gray-700">
                    沟通方式 *
                  </label>
                  <select
                    id="communicationMethod"
                    className="mt-1 input"
                    value={formData.communicationMethod}
                    onChange={(e) => setFormData(prev => ({ ...prev, communicationMethod: e.target.value }))}
                    required
                  >
                    {COMMUNICATION_METHODS.map((method) => (
                      <option key={method.value} value={method.value}>
                        {method.label}
                      </option>
                    ))}
                  </select>
                </div>

                {purchases.length > 0 && (
                  <div className="sm:col-span-2 lg:col-span-3">
                    <label htmlFor="relatedPurchaseId" className="block text-sm font-medium text-gray-700">
                      关联订单 (可选)
                    </label>
                    <select
                      id="relatedPurchaseId"
                      className="mt-1 input"
                      value={formData.relatedPurchaseId}
                      onChange={(e) => setFormData(prev => ({ ...prev, relatedPurchaseId: e.target.value }))}
                    >
                      <option value="">选择关联订单</option>
                      {purchases.map((purchase) => (
                        <option key={purchase._id} value={purchase._id}>
                          {purchase.purchaseId} - ¥{purchase.totalAmount} ({new Date(purchase.orderDate).toLocaleDateString('zh-CN')})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="sm:col-span-2 lg:col-span-3">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    回访描述 (可选)
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    className="mt-1 input"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="输入回访描述..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-4">
            <Link
              href="/dashboard/follow-ups"
              className="btn btn-secondary"
            >
              取消
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? '创建中...' : '创建回访'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}