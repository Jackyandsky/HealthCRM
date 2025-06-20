'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeftIcon,
  UserIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

interface FollowUp {
  _id: string
  followUpId: string
  customerId: any
  customerName: string
  customerEmail?: string
  customerPhone?: string
  assignedToId: any
  assignedToName: string
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
  healthStatus?: {
    currentCondition?: string
    improvements?: string[]
    concerns?: string[]
    sideEffects?: string[]
  }
  productUsage?: Array<{
    productId: any
    productName?: string
    adherence: string
    effectiveness: number
    remainingQuantity?: number
    notes?: string
  }>
  actionItems?: Array<{
    description: string
    dueDate?: string
    assignedTo?: string
    priority: string
    status: 'pending' | 'in_progress' | 'completed'
  }>
  recommendations?: string[]
  nextFollowUpDate?: string
  nextFollowUpReason?: string
  internalNotes?: string
  publicNotes?: string
  tags?: string[]
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

const ADHERENCE_OPTIONS = [
  { value: 'excellent', label: '优秀' },
  { value: 'good', label: '良好' },
  { value: 'fair', label: '一般' },
  { value: 'poor', label: '较差' },
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
  const [users, setUsers] = useState<User[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    priority: '',
    scheduledDate: '',
    scheduledTime: '',
    status: '',
    communicationMethod: '',
    assignedToId: '',
    completedDate: '',
    actualDuration: '',
    outcome: '',
    customerSatisfaction: '',
    customerFeedback: '',
    healthStatus: {
      currentCondition: '',
      improvements: [] as string[],
      concerns: [] as string[],
      sideEffects: [] as string[]
    },
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
      status: 'pending' | 'in_progress' | 'completed'
    }>,
    recommendations: [] as string[],
    nextFollowUpDate: '',
    nextFollowUpReason: '',
    internalNotes: '',
    publicNotes: '',
    tags: [] as string[]
  })

  const [newTag, setNewTag] = useState('')
  const [newRecommendation, setNewRecommendation] = useState('')
  const [newImprovement, setNewImprovement] = useState('')
  const [newConcern, setNewConcern] = useState('')
  const [newSideEffect, setNewSideEffect] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth/login')
      return
    }
    
    loadInitialData()
  }, [params.id])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      const [followUpRes, usersRes, productsRes] = await Promise.all([
        fetch(`/api/follow-ups/${params.id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch('/api/users', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch('/api/products?limit=100', {
          headers: { 'Authorization': `Bearer ${token}` },
        })
      ])

      if (followUpRes.ok) {
        const followUpData = await followUpRes.json()
        const followUpRecord = followUpData.data
        setFollowUp(followUpRecord)
        
        // Populate form data
        setFormData({
          title: followUpRecord.title || '',
          description: followUpRecord.description || '',
          type: followUpRecord.type || '',
          priority: followUpRecord.priority || '',
          scheduledDate: followUpRecord.scheduledDate ? followUpRecord.scheduledDate.split('T')[0] : '',
          scheduledTime: followUpRecord.scheduledTime || '',
          status: followUpRecord.status || '',
          communicationMethod: followUpRecord.communicationMethod || '',
          assignedToId: followUpRecord.assignedToId?._id || followUpRecord.assignedToId || '',
          completedDate: followUpRecord.completedDate ? followUpRecord.completedDate.split('T')[0] : '',
          actualDuration: followUpRecord.actualDuration?.toString() || '',
          outcome: followUpRecord.outcome || '',
          customerSatisfaction: followUpRecord.customerSatisfaction?.toString() || '',
          customerFeedback: followUpRecord.customerFeedback || '',
          healthStatus: {
            currentCondition: followUpRecord.healthStatus?.currentCondition || '',
            improvements: followUpRecord.healthStatus?.improvements || [],
            concerns: followUpRecord.healthStatus?.concerns || [],
            sideEffects: followUpRecord.healthStatus?.sideEffects || []
          },
          productUsage: followUpRecord.productUsage?.map((usage: any) => ({
            productId: usage.productId?._id || usage.productId || '',
            productName: usage.productName || usage.productId?.productName || '',
            adherence: usage.adherence || 'good',
            effectiveness: usage.effectiveness || 3,
            remainingQuantity: usage.remainingQuantity,
            notes: usage.notes || ''
          })) || [],
          actionItems: followUpRecord.actionItems?.map((item: any) => ({
            description: item.description || '',
            dueDate: item.dueDate ? item.dueDate.split('T')[0] : '',
            assignedTo: item.assignedTo || '',
            priority: item.priority || 'medium',
            status: item.status || 'pending'
          })) || [],
          recommendations: followUpRecord.recommendations || [],
          nextFollowUpDate: followUpRecord.nextFollowUpDate ? followUpRecord.nextFollowUpDate.split('T')[0] : '',
          nextFollowUpReason: followUpRecord.nextFollowUpReason || '',
          internalNotes: followUpRecord.internalNotes || '',
          publicNotes: followUpRecord.publicNotes || '',
          tags: followUpRecord.tags || []
        })
      } else {
        router.push('/dashboard/follow-ups')
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
      router.push('/dashboard/follow-ups')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.scheduledDate) {
      alert('请填写所有必填字段')
      return
    }

    setSaving(true)

    try {
      const token = localStorage.getItem('token')
      
      const updateData = {
        ...formData,
        actualDuration: formData.actualDuration ? parseInt(formData.actualDuration) : undefined,
        customerSatisfaction: formData.customerSatisfaction ? parseInt(formData.customerSatisfaction) : undefined,
      }

      const response = await fetch(`/api/follow-ups/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        router.push(`/dashboard/follow-ups/${params.id}`)
      } else {
        const data = await response.json()
        alert(data.message || '更新失败')
      }
    } catch (error) {
      console.error('Error updating follow-up:', error)
      alert('更新失败')
    } finally {
      setSaving(false)
    }
  }

  // Helper functions for dynamic arrays
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

  const addRecommendation = () => {
    if (newRecommendation.trim()) {
      setFormData(prev => ({
        ...prev,
        recommendations: [...prev.recommendations, newRecommendation.trim()]
      }))
      setNewRecommendation('')
    }
  }

  const removeRecommendation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      recommendations: prev.recommendations.filter((_, i) => i !== index)
    }))
  }

  const addImprovement = () => {
    if (newImprovement.trim()) {
      setFormData(prev => ({
        ...prev,
        healthStatus: {
          ...prev.healthStatus,
          improvements: [...prev.healthStatus.improvements, newImprovement.trim()]
        }
      }))
      setNewImprovement('')
    }
  }

  const removeImprovement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      healthStatus: {
        ...prev.healthStatus,
        improvements: prev.healthStatus.improvements.filter((_, i) => i !== index)
      }
    }))
  }

  const addConcern = () => {
    if (newConcern.trim()) {
      setFormData(prev => ({
        ...prev,
        healthStatus: {
          ...prev.healthStatus,
          concerns: [...prev.healthStatus.concerns, newConcern.trim()]
        }
      }))
      setNewConcern('')
    }
  }

  const removeConcern = (index: number) => {
    setFormData(prev => ({
      ...prev,
      healthStatus: {
        ...prev.healthStatus,
        concerns: prev.healthStatus.concerns.filter((_, i) => i !== index)
      }
    }))
  }

  const addSideEffect = () => {
    if (newSideEffect.trim()) {
      setFormData(prev => ({
        ...prev,
        healthStatus: {
          ...prev.healthStatus,
          sideEffects: [...prev.healthStatus.sideEffects, newSideEffect.trim()]
        }
      }))
      setNewSideEffect('')
    }
  }

  const removeSideEffect = (index: number) => {
    setFormData(prev => ({
      ...prev,
      healthStatus: {
        ...prev.healthStatus,
        sideEffects: prev.healthStatus.sideEffects.filter((_, i) => i !== index)
      }
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
        priority: 'medium',
        status: 'pending'
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
                    编号: {followUp.followUpId} | 客户: {followUp.customerName}
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
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
                    沟通方式
                  </label>
                  <select
                    id="communicationMethod"
                    className="mt-1 input"
                    value={formData.communicationMethod}
                    onChange={(e) => setFormData(prev => ({ ...prev, communicationMethod: e.target.value }))}
                  >
                    {COMMUNICATION_METHODS.map((method) => (
                      <option key={method.value} value={method.value}>
                        {method.label}
                      </option>
                    ))}
                  </select>
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
              </div>

              <div>
                <label htmlFor="customerFeedback" className="block text-sm font-medium text-gray-700">
                  客户反馈
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

              <div>
                <label htmlFor="nextFollowUpReason" className="block text-sm font-medium text-gray-700">
                  下次回访原因
                </label>
                <input
                  type="text"
                  id="nextFollowUpReason"
                  className="mt-1 input"
                  value={formData.nextFollowUpReason}
                  onChange={(e) => setFormData(prev => ({ ...prev, nextFollowUpReason: e.target.value }))}
                  placeholder="下次回访的具体原因..."
                />
              </div>
            </div>
          </div>

          {/* Health Status */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">健康状况</h3>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  当前状况
                </label>
                <textarea
                  rows={2}
                  className="mt-1 input"
                  value={formData.healthStatus.currentCondition}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    healthStatus: { ...prev.healthStatus, currentCondition: e.target.value }
                  }))}
                  placeholder="描述客户当前的健康状况..."
                />
              </div>

              {/* Improvements */}
              <div>
                <label className="block text-sm font-medium text-gray-700">改善情况</label>
                <div className="mt-1 flex items-center space-x-2">
                  <input
                    type="text"
                    className="input flex-1"
                    value={newImprovement}
                    onChange={(e) => setNewImprovement(e.target.value)}
                    placeholder="添加改善项目..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImprovement())}
                  />
                  <button
                    type="button"
                    onClick={addImprovement}
                    className="btn btn-secondary btn-sm"
                  >
                    添加
                  </button>
                </div>
                {formData.healthStatus.improvements.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {formData.healthStatus.improvements.map((improvement, index) => (
                      <div key={index} className="flex items-center justify-between bg-green-50 px-3 py-2 rounded">
                        <span className="text-sm text-green-800">{improvement}</span>
                        <button
                          type="button"
                          onClick={() => removeImprovement(index)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Concerns */}
              <div>
                <label className="block text-sm font-medium text-gray-700">关注事项</label>
                <div className="mt-1 flex items-center space-x-2">
                  <input
                    type="text"
                    className="input flex-1"
                    value={newConcern}
                    onChange={(e) => setNewConcern(e.target.value)}
                    placeholder="添加关注事项..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addConcern())}
                  />
                  <button
                    type="button"
                    onClick={addConcern}
                    className="btn btn-secondary btn-sm"
                  >
                    添加
                  </button>
                </div>
                {formData.healthStatus.concerns.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {formData.healthStatus.concerns.map((concern, index) => (
                      <div key={index} className="flex items-center justify-between bg-red-50 px-3 py-2 rounded">
                        <span className="text-sm text-red-800">{concern}</span>
                        <button
                          type="button"
                          onClick={() => removeConcern(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Side Effects */}
              <div>
                <label className="block text-sm font-medium text-gray-700">副作用</label>
                <div className="mt-1 flex items-center space-x-2">
                  <input
                    type="text"
                    className="input flex-1"
                    value={newSideEffect}
                    onChange={(e) => setNewSideEffect(e.target.value)}
                    placeholder="添加副作用..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSideEffect())}
                  />
                  <button
                    type="button"
                    onClick={addSideEffect}
                    className="btn btn-secondary btn-sm"
                  >
                    添加
                  </button>
                </div>
                {formData.healthStatus.sideEffects.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {formData.healthStatus.sideEffects.map((effect, index) => (
                      <div key={index} className="flex items-center justify-between bg-orange-50 px-3 py-2 rounded">
                        <span className="text-sm text-orange-800">{effect}</span>
                        <button
                          type="button"
                          onClick={() => removeSideEffect(index)}
                          className="text-orange-600 hover:text-orange-800"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
                        <h4 className="font-medium text-gray-900 flex items-center">
                          {item.status === 'completed' ? (
                            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                          ) : (
                            <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
                          )}
                          事项 {index + 1}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeActionItem(index)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                          <label className="block text-sm font-medium text-gray-700">状态</label>
                          <select
                            className="mt-1 input"
                            value={item.status}
                            onChange={(e) => updateActionItem(index, 'status', e.target.value)}
                          >
                            <option value="pending">待办</option>
                            <option value="in_progress">进行中</option>
                            <option value="completed">已完成</option>
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

          {/* Recommendations */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">建议事项</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  className="input flex-1"
                  value={newRecommendation}
                  onChange={(e) => setNewRecommendation(e.target.value)}
                  placeholder="添加建议..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRecommendation())}
                />
                <button
                  type="button"
                  onClick={addRecommendation}
                  className="btn btn-secondary btn-sm"
                >
                  添加
                </button>
              </div>
              {formData.recommendations.length > 0 && (
                <div className="space-y-2">
                  {formData.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded">
                      <span className="text-sm text-blue-800">{recommendation}</span>
                      <button
                        type="button"
                        onClick={() => removeRecommendation(index)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
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