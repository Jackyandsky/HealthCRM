'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeftIcon,
  UserIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline'

interface Customer {
  _id: string
  customerId: string
  name: string
  email?: string
  phone?: string
  category: string
}

interface User {
  _id: string
  employeeId: string
  name: string
  email: string
  department?: string
}

interface Product {
  _id: string
  productCode: string
  productName: string
  category: string
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

const ADHERENCE_OPTIONS = [
  { value: 'excellent', label: '优秀' },
  { value: 'good', label: '良好' },
  { value: 'fair', label: '一般' },
  { value: 'poor', label: '较差' },
]

export default function NewFollowUpPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(false)
  const [customerSearch, setCustomerSearch] = useState('')
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const router = useRouter()

  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    assignedToId: '',
    title: '',
    description: '',
    type: 'general_inquiry',
    priority: 'medium',
    scheduledDate: '',
    scheduledTime: '',
    communicationMethod: 'phone',
    relatedPurchaseId: '',
    publicNotes: '',
    internalNotes: '',
    tags: [] as string[],
    productUsage: [] as Array<{
      productId: string
      productName: string
      adherence: string
      effectiveness: number
      remainingQuantity?: number
      notes?: string
    }>,
    actionItems: [] as Array<{
      description: string
      dueDate?: string
      assignedTo?: string
      priority: string
    }>
  })

  const [newTag, setNewTag] = useState('')
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth/login')
      return
    }
    
    loadInitialData()
  }, [])

  useEffect(() => {
    if (customerSearch) {
      const filtered = customers.filter(customer =>
        customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
        customer.customerId.toLowerCase().includes(customerSearch.toLowerCase()) ||
        customer.email?.toLowerCase().includes(customerSearch.toLowerCase())
      )
      setFilteredCustomers(filtered)
    } else {
      setFilteredCustomers(customers)
    }
  }, [customerSearch, customers])

  const loadInitialData = async () => {
    try {
      const token = localStorage.getItem('token')
      
      const [customersRes, usersRes, productsRes] = await Promise.all([
        fetch('/api/customers?limit=100', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch('/api/users', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch('/api/products?limit=100', {
          headers: { 'Authorization': `Bearer ${token}` },
        })
      ])

      if (customersRes.ok) {
        const customersData = await customersRes.json()
        setCustomers(customersData.data.customers || [])
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData.data || [])
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json()
        setProducts(productsData.data.products || [])
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
    setFormData(prev => ({
      ...prev,
      customerId: customer._id,
      customerName: customer.name
    }))
    setCustomerSearch(customer.name)
    setShowCustomerDropdown(false)
    loadCustomerPurchases(customer._id)
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const addProductUsage = () => {
    setFormData(prev => ({
      ...prev,
      productUsage: [...prev.productUsage, {
        productId: '',
        productName: '',
        adherence: 'good',
        effectiveness: 3,
        remainingQuantity: undefined,
        notes: ''
      }]
    }))
  }

  const updateProductUsage = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      productUsage: prev.productUsage.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const removeProductUsage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      productUsage: prev.productUsage.filter((_, i) => i !== index)
    }))
  }

  const addActionItem = () => {
    setFormData(prev => ({
      ...prev,
      actionItems: [...prev.actionItems, {
        description: '',
        dueDate: '',
        assignedTo: '',
        priority: 'medium'
      }]
    }))
  }

  const updateActionItem = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      actionItems: prev.actionItems.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const removeActionItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      actionItems: prev.actionItems.filter((_, i) => i !== index)
    }))
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
      const response = await fetch('/api/follow-ups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
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
          {/* Basic Information */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <UserIcon className="h-5 w-5 mr-2" />
                基本信息
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="relative">
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
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-gray-500">
                            {customer.customerId} | {customer.email}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="assignedToId" className="block text-sm font-medium text-gray-700">
                    负责人
                  </label>
                  <select
                    id="assignedToId"
                    className="mt-1 input"
                    value={formData.assignedToId}
                    onChange={(e) => setFormData(prev => ({ ...prev, assignedToId: e.target.value }))}
                  >
                    <option value="">选择负责人</option>
                    {users.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name} ({user.employeeId})
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

                <div className="sm:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    回访描述
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
              </div>
            </div>
          </div>

          {/* Schedule Information */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <CalendarDaysIcon className="h-5 w-5 mr-2" />
                时间安排
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
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
              </div>

              {purchases.length > 0 && (
                <div>
                  <label htmlFor="relatedPurchaseId" className="block text-sm font-medium text-gray-700">
                    关联订单
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
            </div>
          </div>

          {/* Product Usage */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">产品使用情况</h3>
                <button
                  type="button"
                  onClick={addProductUsage}
                  className="btn btn-secondary btn-sm flex items-center"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  添加产品
                </button>
              </div>
            </div>
            <div className="p-6">
              {formData.productUsage.length === 0 ? (
                <p className="text-gray-500 text-center py-4">暂无产品使用记录</p>
              ) : (
                <div className="space-y-4">
                  {formData.productUsage.map((usage, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900">产品 {index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeProductUsage(index)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">产品</label>
                          <select
                            className="mt-1 input"
                            value={usage.productId}
                            onChange={(e) => {
                              const product = products.find(p => p._id === e.target.value)
                              updateProductUsage(index, 'productId', e.target.value)
                              updateProductUsage(index, 'productName', product?.productName || '')
                            }}
                          >
                            <option value="">选择产品</option>
                            {products.map((product) => (
                              <option key={product._id} value={product._id}>
                                {product.productName} ({product.productCode})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">依从性</label>
                          <select
                            className="mt-1 input"
                            value={usage.adherence}
                            onChange={(e) => updateProductUsage(index, 'adherence', e.target.value)}
                          >
                            {ADHERENCE_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">效果评分 (1-5)</label>
                          <input
                            type="number"
                            min="1"
                            max="5"
                            className="mt-1 input"
                            value={usage.effectiveness}
                            onChange={(e) => updateProductUsage(index, 'effectiveness', parseInt(e.target.value))}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">剩余数量</label>
                          <input
                            type="number"
                            min="0"
                            className="mt-1 input"
                            value={usage.remainingQuantity || ''}
                            onChange={(e) => updateProductUsage(index, 'remainingQuantity', e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700">备注</label>
                          <input
                            type="text"
                            className="mt-1 input"
                            value={usage.notes || ''}
                            onChange={(e) => updateProductUsage(index, 'notes', e.target.value)}
                            placeholder="使用情况备注..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Items */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">行动事项</h3>
                <button
                  type="button"
                  onClick={addActionItem}
                  className="btn btn-secondary btn-sm flex items-center"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  添加事项
                </button>
              </div>
            </div>
            <div className="p-6">
              {formData.actionItems.length === 0 ? (
                <p className="text-gray-500 text-center py-4">暂无行动事项</p>
              ) : (
                <div className="space-y-4">
                  {formData.actionItems.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900">事项 {index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeActionItem(index)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700">描述</label>
                          <input
                            type="text"
                            className="mt-1 input"
                            value={item.description}
                            onChange={(e) => updateActionItem(index, 'description', e.target.value)}
                            placeholder="输入行动事项描述..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">优先级</label>
                          <select
                            className="mt-1 input"
                            value={item.priority}
                            onChange={(e) => updateActionItem(index, 'priority', e.target.value)}
                          >
                            {PRIORITY_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">截止日期</label>
                          <input
                            type="date"
                            className="mt-1 input"
                            value={item.dueDate || ''}
                            onChange={(e) => updateActionItem(index, 'dueDate', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">负责人</label>
                          <select
                            className="mt-1 input"
                            value={item.assignedTo || ''}
                            onChange={(e) => updateActionItem(index, 'assignedTo', e.target.value)}
                          >
                            <option value="">选择负责人</option>
                            {users.map((user) => (
                              <option key={user._id} value={user._id}>
                                {user.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                附加信息
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                  标签
                </label>
                <div className="mt-1 flex items-center space-x-2">
                  <input
                    type="text"
                    className="input flex-1"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="输入标签..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="btn btn-secondary btn-sm"
                  >
                    添加
                  </button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="publicNotes" className="block text-sm font-medium text-gray-700">
                  公开备注
                </label>
                <textarea
                  id="publicNotes"
                  rows={3}
                  className="mt-1 input"
                  value={formData.publicNotes}
                  onChange={(e) => setFormData(prev => ({ ...prev, publicNotes: e.target.value }))}
                  placeholder="客户可见的备注信息..."
                />
              </div>

              <div>
                <label htmlFor="internalNotes" className="block text-sm font-medium text-gray-700">
                  内部备注
                </label>
                <textarea
                  id="internalNotes"
                  rows={3}
                  className="mt-1 input"
                  value={formData.internalNotes}
                  onChange={(e) => setFormData(prev => ({ ...prev, internalNotes: e.target.value }))}
                  placeholder="内部使用的备注信息..."
                />
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