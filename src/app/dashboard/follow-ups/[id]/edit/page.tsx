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

interface FollowUp {
  _id: string
  followUpId: string
  customerId: any
  title: string
  description?: string
  type: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  scheduledDate: string
  scheduledTime?: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled' | 'no_response'
  communicationMethod: string
  completedDate?: string
  actualDuration?: number
  outcome?: string
  customerSatisfaction?: number
  customerFeedback?: string
  nextFollowUpDate?: string
  notes?: string
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

const STATUS_OPTIONS = [
  { value: 'scheduled', label: '已安排' },
  { value: 'in_progress', label: '进行中' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' },
  { value: 'rescheduled', label: '已重新安排' },
  { value: 'no_response', label: '无回应' },
]

const COMMUNICATION_METHODS = [
  { value: 'phone', label: '电话' },
  { value: 'email', label: '邮件' },
  { value: 'wechat', label: '微信' },
  { value: 'sms', label: '短信' },
  { value: 'in_person', label: '面谈' },
  { value: 'video_call', label: '视频通话' },
]

const OUTCOME_OPTIONS = [
  { value: 'successful', label: '成功完成' },
  { value: 'partially_successful', label: '部分完成' },
  { value: 'unsuccessful', label: '未成功' },
  { value: 'rescheduled', label: '已重新安排' },
  { value: 'no_contact', label: '无法联系' },
]

export default function EditFollowUpPage({ params }: { params: { id: string } }) {
  const [followUp, setFollowUp] = useState<FollowUp | null>(null)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [customerSearch, setCustomerSearch] = useState('')
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const customerDropdownRef = useRef<HTMLDivElement>(null)
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
    status: 'scheduled',
    communicationMethod: 'phone',
    relatedPurchaseId: '',
    completedDate: '',
    actualDuration: '',
    outcome: '',
    customerSatisfaction: '',
    customerFeedback: '',
    nextFollowUpDate: '',
    notes: ''
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth/login')
      return
    }
    
    loadInitialData()
  }, [params.id])

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
      setLoading(true)
      const token = localStorage.getItem('token')
      
      const [followUpRes, customersRes] = await Promise.all([
        fetch(`/api/follow-ups/${params.id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch('/api/customers?limit=100', {
          headers: { 'Authorization': `Bearer ${token}` },
        })
      ])

      if (followUpRes.ok) {
        const followUpData = await followUpRes.json()
        const followUpRecord = followUpData.data
        setFollowUp(followUpRecord)
        
        // Set customer search and load their purchases
        if (followUpRecord.customerId) {
          const customerName = followUpRecord.customerId.firstName ? 
            `${followUpRecord.customerId.firstName} ${followUpRecord.customerId.lastName}` : 
            followUpRecord.customerId.firstName || followUpRecord.customerId.lastName || ''
          setCustomerSearch(customerName)
          loadCustomerPurchases(followUpRecord.customerId._id || followUpRecord.customerId)
        }
        
        // Populate form data
        setFormData({
          customerId: followUpRecord.customerId?._id || followUpRecord.customerId || '',
          customerName: followUpRecord.customerId?.firstName ? `${followUpRecord.customerId.firstName} ${followUpRecord.customerId.lastName}` : '',
          title: followUpRecord.title || '',
          description: followUpRecord.description || '',
          type: followUpRecord.type || 'general_inquiry',
          priority: followUpRecord.priority || 'medium',
          scheduledDate: followUpRecord.scheduledDate ? followUpRecord.scheduledDate.split('T')[0] : '',
          scheduledTime: followUpRecord.scheduledTime || '',
          status: followUpRecord.status || 'scheduled',
          communicationMethod: followUpRecord.communicationMethod || 'phone',
          relatedPurchaseId: '',
          completedDate: followUpRecord.completedDate ? followUpRecord.completedDate.split('T')[0] : '',
          actualDuration: followUpRecord.actualDuration?.toString() || '',
          outcome: followUpRecord.outcome || '',
          customerSatisfaction: followUpRecord.customerSatisfaction?.toString() || '',
          customerFeedback: followUpRecord.customerFeedback || '',
          nextFollowUpDate: followUpRecord.nextFollowUpDate ? followUpRecord.nextFollowUpDate.split('T')[0] : '',
          notes: followUpRecord.notes || ''
        })
      } else {
        router.push('/dashboard/follow-ups')
      }

      if (customersRes.ok) {
        const customersData = await customersRes.json()
        setCustomers(customersData.customers || [])
      }
    } catch (error) {
      console.error('Error loading initial data:', error)
      router.push('/dashboard/follow-ups')
    } finally {
      setLoading(false)
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
    
    if (!formData.title || !formData.scheduledDate) {
      alert('请填写所有必填字段')
      return
    }

    setSaving(true)
    
    // Small delay to prevent browser extension conflicts
    await new Promise(resolve => setTimeout(resolve, 100))

    try {
      const token = localStorage.getItem('token')
      
      // Prepare submission data
      const submissionData = {
        ...formData,
        scheduledDate: new Date(formData.scheduledDate + (formData.scheduledTime ? `T${formData.scheduledTime}` : 'T00:00')),
        completedDate: formData.completedDate ? new Date(formData.completedDate) : undefined,
        nextFollowUpDate: formData.nextFollowUpDate ? new Date(formData.nextFollowUpDate) : undefined,
        actualDuration: formData.actualDuration ? parseInt(formData.actualDuration) : undefined,
        customerSatisfaction: formData.customerSatisfaction ? parseInt(formData.customerSatisfaction) : undefined,
        // Clean up empty enum fields
        outcome: formData.outcome || undefined,
        // Remove fields that don't exist in the model
        customerName: undefined,
        relatedPurchaseId: undefined
      }

      const response = await fetch(`/api/follow-ups/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(submissionData),
      })
      
      if (response.ok) {
        router.push(`/dashboard/follow-ups/${params.id}`)
      } else {
        const errorText = await response.text()
        console.error('Update failed:', response.status, errorText)
        try {
          const data = JSON.parse(errorText)
          alert(data.message || '更新失败')
        } catch {
          alert(`更新失败: ${response.status} ${response.statusText}`)
        }
      }
    } catch (error) {
      console.error('Error updating follow-up:', error)
      
      // Handle specific browser errors
      if (error instanceof Error) {
        if (error.message.includes('native messaging host')) {
          alert('浏览器扩展冲突，请禁用相关扩展后重试，或使用其他浏览器')
        } else if (error.message.includes('Failed to fetch')) {
          alert('网络连接失败，请检查网络连接')
        } else {
          alert(`更新失败: ${error.message}`)
        }
      } else {
        alert('更新失败，请重试')
      }
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

  if (!followUp) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">回访记录未找到</h2>
          <Link href="/dashboard/follow-ups" className="mt-4 btn btn-primary">
            返回回访列表
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
                  href={`/dashboard/follow-ups/${params.id}`}
                  className="mr-4 text-gray-400 hover:text-gray-600"
                >
                  <ArrowLeftIcon className="h-6 w-6" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">编辑回访</h1>
                  <p className="mt-1 text-sm text-gray-600">
                    编号: {followUp.followUpId}
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
              <h3 className="text-lg font-medium text-gray-900">编辑回访</h3>
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

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    回访状态
                  </label>
                  <select
                    id="status"
                    className="mt-1 input"
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
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

                <div>
                  <label htmlFor="completedDate" className="block text-sm font-medium text-gray-700">
                    完成日期
                  </label>
                  <input
                    type="date"
                    id="completedDate"
                    className="mt-1 input"
                    value={formData.completedDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, completedDate: e.target.value }))}
                  />
                </div>

                <div>
                  <label htmlFor="actualDuration" className="block text-sm font-medium text-gray-700">
                    实际用时(分钟)
                  </label>
                  <input
                    type="number"
                    id="actualDuration"
                    className="mt-1 input"
                    value={formData.actualDuration}
                    onChange={(e) => setFormData(prev => ({ ...prev, actualDuration: e.target.value }))}
                    placeholder="如: 30"
                  />
                </div>

                <div>
                  <label htmlFor="outcome" className="block text-sm font-medium text-gray-700">
                    回访结果
                  </label>
                  <select
                    id="outcome"
                    className="mt-1 input"
                    value={formData.outcome}
                    onChange={(e) => setFormData(prev => ({ ...prev, outcome: e.target.value }))}
                  >
                    <option value="">选择结果</option>
                    {OUTCOME_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="customerSatisfaction" className="block text-sm font-medium text-gray-700">
                    满意度评分 (1-5)
                  </label>
                  <input
                    type="number"
                    id="customerSatisfaction"
                    min="1"
                    max="5"
                    className="mt-1 input"
                    value={formData.customerSatisfaction}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerSatisfaction: e.target.value }))}
                  />
                </div>

                <div>
                  <label htmlFor="nextFollowUpDate" className="block text-sm font-medium text-gray-700">
                    下次回访日期
                  </label>
                  <input
                    type="date"
                    id="nextFollowUpDate"
                    className="mt-1 input"
                    value={formData.nextFollowUpDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, nextFollowUpDate: e.target.value }))}
                  />
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

                <div className="sm:col-span-2 lg:col-span-3">
                  <label htmlFor="customerFeedback" className="block text-sm font-medium text-gray-700">
                    客户反馈 (可选)
                  </label>
                  <textarea
                    id="customerFeedback"
                    rows={3}
                    className="mt-1 input"
                    value={formData.customerFeedback}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerFeedback: e.target.value }))}
                    placeholder="记录客户的反馈意见..."
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-3">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                    备注信息 (可选)
                  </label>
                  <textarea
                    id="notes"
                    rows={3}
                    className="mt-1 input"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="输入回访相关的备注信息..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-4">
            <Link
              href={`/dashboard/follow-ups/${params.id}`}
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