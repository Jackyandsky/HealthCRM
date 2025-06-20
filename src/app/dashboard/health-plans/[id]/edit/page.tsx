'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeftIcon,
  UserIcon,
  CalendarDaysIcon,
  HeartIcon,
  CubeIcon,
  PlusIcon,
  TrashIcon,
  DocumentTextIcon,
  CheckIcon,
  DocumentCheckIcon
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
  retailPrice?: number
  wholesalePrice?: number
  preferredCustomerPrice?: number
}

interface HealthPlanTemplate {
  _id: string
  templateId: string
  name: string
  description: string
  category: string
  difficulty: string
  healthGoals: any[]
  productRecommendations: any[]
  costEstimate: any
}

interface HealthGoal {
  category: string
  description: string
  targetValue?: string
  currentValue?: string
  targetDate?: string
  priority: string
  status: string
  progress: {
    percentage: number
    milestones: Array<{
      description: string
      targetDate?: string
      completedDate?: string
      status: string
    }>
  }
  notes?: string
}

interface ProductRecommendation {
  productId: string
  productCode: string
  productName: string
  dosage: string
  frequency: {
    morning: number
    afternoon: number
    evening: number
    notes?: string
  }
  duration: {
    value: number
    unit: 'days' | 'weeks' | 'months'
  }
  purpose: string[]
  priority: string
  estimatedCost: {
    retail: number
    wholesale: number
    preferredCustomer: number
  }
  notes?: string
}

interface HealthPlan {
  _id: string
  planId: string
  customerId: string
  customerName: string
  customerEmail?: string
  customerPhone?: string
  assignedToId: string
  assignedToName: string
  createdById: string
  createdByName: string
  title: string
  description?: string
  planType: string
  status: string
  priority: string
  
  healthAssessment: {
    currentHealth: {
      overall_rating?: number
      energy_level?: number
      stress_level?: number
      sleep_quality?: number
      physical_activity?: string
      bmi?: number
      weight?: number
      height?: number
    }
    medicalHistory: {
      conditions?: string[]
      medications?: string[]
      allergies?: string[]
      surgeries?: string[]
      familyHistory?: string[]
    }
    lifestyle: {
      smoking?: string
      alcohol?: string
      diet_type?: string
      exercise_frequency?: string
      stress_factors?: string[]
      sleep_hours?: number
    }
    nutritionalDeficiencies?: string[]
  }

  healthGoals: HealthGoal[]
  productRecommendations: ProductRecommendation[]
  
  timeline: {
    startDate: string
    endDate?: string
    reviewDates: string[]
  }
  
  notes: {
    public?: string
    private?: string
    instructions?: string
    warnings?: string
  }
  
  tags: string[]
  templateId?: string
  templateName?: string
}

const PLAN_TYPES = [
  { value: 'basic', label: '基础计划', description: '基本健康维护计划' },
  { value: 'comprehensive', label: '综合计划', description: '全面健康改善计划' },
  { value: 'specialized', label: '专项计划', description: '针对特定健康目标' },
  { value: 'maintenance', label: '维护计划', description: '现有健康状态维护' },
  { value: 'intensive', label: '强化计划', description: '密集型健康干预' },
]

const PRIORITY_OPTIONS = [
  { value: 'low', label: '低' },
  { value: 'medium', label: '中' },
  { value: 'high', label: '高' },
  { value: 'urgent', label: '紧急' },
]

const STATUS_OPTIONS = [
  { value: 'draft', label: '草稿' },
  { value: 'active', label: '进行中' },
  { value: 'paused', label: '暂停' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' },
  { value: 'review_needed', label: '需要复查' },
]

const HEALTH_GOAL_CATEGORIES = [
  { value: 'weight_management', label: '体重管理' },
  { value: 'immune_support', label: '免疫支持' },
  { value: 'energy_vitality', label: '能量活力' },
  { value: 'heart_health', label: '心脏健康' },
  { value: 'digestive_health', label: '消化健康' },
  { value: 'bone_joint_health', label: '骨骼关节' },
  { value: 'brain_cognitive', label: '大脑认知' },
  { value: 'skin_beauty', label: '皮肤美容' },
  { value: 'sports_performance', label: '运动表现' },
  { value: 'stress_management', label: '压力管理' },
  { value: 'sleep_quality', label: '睡眠质量' },
  { value: 'anti_aging', label: '抗衰老' },
  { value: 'detox_cleanse', label: '排毒净化' },
  { value: 'hormonal_balance', label: '荷尔蒙平衡' },
  { value: 'other', label: '其他' },
]

const GOAL_PRIORITIES = [
  { value: 'high', label: '高' },
  { value: 'medium', label: '中' },
  { value: 'low', label: '低' },
]

const GOAL_STATUSES = [
  { value: 'active', label: '进行中' },
  { value: 'achieved', label: '已实现' },
  { value: 'paused', label: '暂停' },
  { value: 'cancelled', label: '已取消' },
]

const PRODUCT_PRIORITIES = [
  { value: 'essential', label: '必需', color: 'bg-red-100 text-red-800' },
  { value: 'recommended', label: '推荐', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'optional', label: '可选', color: 'bg-green-100 text-green-800' },
]

const PHYSICAL_ACTIVITY_OPTIONS = [
  { value: 'sedentary', label: '久坐不动' },
  { value: 'light', label: '轻度活动' },
  { value: 'moderate', label: '中度活动' },
  { value: 'active', label: '活跃' },
  { value: 'very_active', label: '非常活跃' },
]

const LIFESTYLE_OPTIONS = {
  smoking: [
    { value: 'never', label: '从不吸烟' },
    { value: 'former', label: '曾经吸烟' },
    { value: 'light', label: '偶尔吸烟' },
    { value: 'moderate', label: '适度吸烟' },
    { value: 'heavy', label: '大量吸烟' },
  ],
  alcohol: [
    { value: 'never', label: '从不饮酒' },
    { value: 'light', label: '偶尔饮酒' },
    { value: 'moderate', label: '适度饮酒' },
    { value: 'heavy', label: '大量饮酒' },
  ],
  diet_type: [
    { value: 'balanced', label: '均衡饮食' },
    { value: 'vegetarian', label: '素食' },
    { value: 'vegan', label: '纯素食' },
    { value: 'low_carb', label: '低碳水' },
    { value: 'high_protein', label: '高蛋白' },
    { value: 'mediterranean', label: '地中海饮食' },
    { value: 'other', label: '其他' },
  ],
  exercise_frequency: [
    { value: 'never', label: '从不运动' },
    { value: '1-2_times', label: '每周1-2次' },
    { value: '3-4_times', label: '每周3-4次' },
    { value: '5-6_times', label: '每周5-6次' },
    { value: 'daily', label: '每天' },
  ],
}

export default function EditHealthPlanPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [customers, setCustomers] = useState<Customer[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [templates, setTemplates] = useState<HealthPlanTemplate[]>([])
  
  const [formData, setFormData] = useState<HealthPlan>({
    _id: '',
    planId: '',
    customerId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    assignedToId: '',
    assignedToName: '',
    createdById: '',
    createdByName: '',
    title: '',
    description: '',
    planType: 'basic',
    status: 'draft',
    priority: 'medium',
    healthAssessment: {
      currentHealth: {},
      medicalHistory: {},
      lifestyle: {},
      nutritionalDeficiencies: []
    },
    healthGoals: [],
    productRecommendations: [],
    timeline: {
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      reviewDates: []
    },
    notes: {},
    tags: [],
    templateId: '',
    templateName: ''
  })

  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth/login')
      return
    }
    
    loadData()
  }, [params.id])

  const loadData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      // Load health plan
      const planResponse = await fetch(`/api/health-plans/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (!planResponse.ok) {
        throw new Error('Failed to load health plan')
      }
      
      const planData = await planResponse.json()
      setFormData(planData.data)

      // Load supporting data
      const [customersRes, usersRes, productsRes, templatesRes] = await Promise.all([
        fetch('/api/customers?limit=1000', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/users?limit=1000', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/products?limit=1000', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/health-plan-templates?limit=100', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])

      if (customersRes.ok) {
        const customersData = await customersRes.json()
        setCustomers(customersData.data?.customers || [])
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData.data?.users || [])
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json()
        setProducts(productsData.data?.products || [])
      }

      if (templatesRes.ok) {
        const templatesData = await templatesRes.json()
        setTemplates(templatesData.data?.templates || [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
      alert('加载数据失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const token = localStorage.getItem('token')
      
      // Calculate BMI if height and weight are provided
      if (formData.healthAssessment.currentHealth.height && formData.healthAssessment.currentHealth.weight) {
        const height = formData.healthAssessment.currentHealth.height / 100 // convert to meters
        const weight = formData.healthAssessment.currentHealth.weight
        const bmi = weight / (height * height)
        formData.healthAssessment.currentHealth.bmi = Math.round(bmi * 10) / 10
      }

      const response = await fetch(`/api/health-plans/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push(`/dashboard/health-plans/${params.id}`)
      } else {
        const data = await response.json()
        alert(data.message || '保存失败')
      }
    } catch (error) {
      console.error('Error saving health plan:', error)
      alert('保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find(c => c._id === customerId)
    if (customer) {
      setFormData(prev => ({
        ...prev,
        customerId,
        customerName: customer.name,
        customerEmail: customer.email || '',
        customerPhone: customer.phone || ''
      }))
    }
  }

  const handleAssignedToChange = (userId: string) => {
    const user = users.find(u => u._id === userId)
    if (user) {
      setFormData(prev => ({
        ...prev,
        assignedToId: userId,
        assignedToName: user.name
      }))
    }
  }

  const addHealthGoal = () => {
    const newGoal: HealthGoal = {
      category: 'weight_management',
      description: '',
      targetValue: '',
      currentValue: '',
      targetDate: '',
      priority: 'medium',
      status: 'active',
      progress: {
        percentage: 0,
        milestones: []
      },
      notes: ''
    }
    
    setFormData(prev => ({
      ...prev,
      healthGoals: [...prev.healthGoals, newGoal]
    }))
  }

  const updateHealthGoal = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      healthGoals: prev.healthGoals.map((goal, i) => 
        i === index ? { ...goal, [field]: value } : goal
      )
    }))
  }

  const removeHealthGoal = (index: number) => {
    setFormData(prev => ({
      ...prev,
      healthGoals: prev.healthGoals.filter((_, i) => i !== index)
    }))
  }

  const addProductRecommendation = () => {
    const newRecommendation: ProductRecommendation = {
      productId: '',
      productCode: '',
      productName: '',
      dosage: '',
      frequency: {
        morning: 0,
        afternoon: 0,
        evening: 0,
        notes: ''
      },
      duration: {
        value: 1,
        unit: 'months'
      },
      purpose: [],
      priority: 'recommended',
      estimatedCost: {
        retail: 0,
        wholesale: 0,
        preferredCustomer: 0
      },
      notes: ''
    }
    
    setFormData(prev => ({
      ...prev,
      productRecommendations: [...prev.productRecommendations, newRecommendation]
    }))
  }

  const updateProductRecommendation = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      productRecommendations: prev.productRecommendations.map((rec, i) => {
        if (i === index) {
          if (field === 'productId') {
            const product = products.find(p => p._id === value)
            if (product) {
              return {
                ...rec,
                productId: value,
                productCode: product.productCode,
                productName: product.productName,
                estimatedCost: {
                  retail: product.retailPrice || 0,
                  wholesale: product.wholesalePrice || 0,
                  preferredCustomer: product.preferredCustomerPrice || 0
                }
              }
            }
          }
          return { ...rec, [field]: value }
        }
        return rec
      })
    }))
  }

  const removeProductRecommendation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      productRecommendations: prev.productRecommendations.filter((_, i) => i !== index)
    }))
  }

  const applyTemplate = (template: HealthPlanTemplate) => {
    const updatedFormData = {
      ...formData,
      healthGoals: template.healthGoals || [],
      productRecommendations: template.productRecommendations?.map(rec => ({
        ...rec,
        estimatedCost: {
          retail: rec.estimatedCost?.retail || 0,
          wholesale: rec.estimatedCost?.wholesale || 0,
          preferredCustomer: rec.estimatedCost?.preferredCustomer || 0
        }
      })) || [],
      templateId: template._id,
      templateName: template.name
    }
    
    setFormData(updatedFormData)
    setShowTemplateModal(false)
  }

  const getCategoryLabel = (value: string) => {
    const category = HEALTH_GOAL_CATEGORIES.find(cat => cat.value === value)
    return category?.label || value
  }

  const getPriorityLabel = (value: string) => {
    const priority = PRODUCT_PRIORITIES.find(p => p.value === value)
    return priority?.label || value
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
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
                  href={`/dashboard/health-plans/${params.id}`}
                  className="text-gray-400 hover:text-gray-600 mr-4"
                >
                  <ArrowLeftIcon className="h-6 w-6" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">编辑健康计划</h1>
                  <p className="mt-1 text-sm text-gray-600">
                    修改健康计划的详细信息
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowTemplateModal(true)}
                  className="btn btn-secondary flex items-center"
                >
                  <CubeIcon className="h-5 w-5 mr-2" />
                  应用模板
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn btn-primary flex items-center"
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  ) : (
                    <DocumentCheckIcon className="h-5 w-5 mr-2" />
                  )}
                  {saving ? '保存中...' : '保存更改'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'basic', label: '基本信息', icon: DocumentTextIcon },
                { id: 'assessment', label: '健康评估', icon: HeartIcon },
                { id: 'goals', label: '健康目标', icon: CheckIcon },
                { id: 'products', label: '产品推荐', icon: CubeIcon },
                { id: 'timeline', label: '时间安排', icon: CalendarDaysIcon },
                { id: 'notes', label: '备注标签', icon: DocumentTextIcon },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className={`-ml-0.5 mr-2 h-5 w-5 ${
                    activeTab === tab.id ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`} />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      计划标题 *
                    </label>
                    <input
                      type="text"
                      id="title"
                      required
                      className="mt-1 input"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label htmlFor="planType" className="block text-sm font-medium text-gray-700">
                      计划类型 *
                    </label>
                    <select
                      id="planType"
                      required
                      className="mt-1 input"
                      value={formData.planType}
                      onChange={(e) => setFormData(prev => ({ ...prev, planType: e.target.value }))}
                    >
                      {PLAN_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="customerId" className="block text-sm font-medium text-gray-700">
                      客户 *
                    </label>
                    <select
                      id="customerId"
                      required
                      className="mt-1 input"
                      value={formData.customerId}
                      onChange={(e) => handleCustomerChange(e.target.value)}
                    >
                      <option value="">选择客户...</option>
                      {customers.map((customer) => (
                        <option key={customer._id} value={customer._id}>
                          {customer.name} ({customer.customerId})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="assignedToId" className="block text-sm font-medium text-gray-700">
                      负责人 *
                    </label>
                    <select
                      id="assignedToId"
                      required
                      className="mt-1 input"
                      value={formData.assignedToId}
                      onChange={(e) => handleAssignedToChange(e.target.value)}
                    >
                      <option value="">选择负责人...</option>
                      {users.map((user) => (
                        <option key={user._id} value={user._id}>
                          {user.name} ({user.employeeId})
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
                      状态
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
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    计划描述
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    className="mt-1 input"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>
            )}

            {/* Health Assessment Tab */}
            {activeTab === 'assessment' && (
              <div className="space-y-8">
                {/* Current Health */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">当前健康状况</h3>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        整体健康评分 (1-10)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        className="mt-1 input"
                        value={formData.healthAssessment.currentHealth.overall_rating || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          healthAssessment: {
                            ...prev.healthAssessment,
                            currentHealth: {
                              ...prev.healthAssessment.currentHealth,
                              overall_rating: parseInt(e.target.value)
                            }
                          }
                        }))}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        能量水平 (1-10)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        className="mt-1 input"
                        value={formData.healthAssessment.currentHealth.energy_level || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          healthAssessment: {
                            ...prev.healthAssessment,
                            currentHealth: {
                              ...prev.healthAssessment.currentHealth,
                              energy_level: parseInt(e.target.value)
                            }
                          }
                        }))}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        压力水平 (1-10)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        className="mt-1 input"
                        value={formData.healthAssessment.currentHealth.stress_level || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          healthAssessment: {
                            ...prev.healthAssessment,
                            currentHealth: {
                              ...prev.healthAssessment.currentHealth,
                              stress_level: parseInt(e.target.value)
                            }
                          }
                        }))}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        睡眠质量 (1-10)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        className="mt-1 input"
                        value={formData.healthAssessment.currentHealth.sleep_quality || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          healthAssessment: {
                            ...prev.healthAssessment,
                            currentHealth: {
                              ...prev.healthAssessment.currentHealth,
                              sleep_quality: parseInt(e.target.value)
                            }
                          }
                        }))}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        身体活动水平
                      </label>
                      <select
                        className="mt-1 input"
                        value={formData.healthAssessment.currentHealth.physical_activity || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          healthAssessment: {
                            ...prev.healthAssessment,
                            currentHealth: {
                              ...prev.healthAssessment.currentHealth,
                              physical_activity: e.target.value
                            }
                          }
                        }))}
                      >
                        <option value="">选择活动水平...</option>
                        {PHYSICAL_ACTIVITY_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        体重 (kg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        className="mt-1 input"
                        value={formData.healthAssessment.currentHealth.weight || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          healthAssessment: {
                            ...prev.healthAssessment,
                            currentHealth: {
                              ...prev.healthAssessment.currentHealth,
                              weight: parseFloat(e.target.value)
                            }
                          }
                        }))}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        身高 (cm)
                      </label>
                      <input
                        type="number"
                        className="mt-1 input"
                        value={formData.healthAssessment.currentHealth.height || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          healthAssessment: {
                            ...prev.healthAssessment,
                            currentHealth: {
                              ...prev.healthAssessment.currentHealth,
                              height: parseInt(e.target.value)
                            }
                          }
                        }))}
                      />
                    </div>

                    {formData.healthAssessment.currentHealth.height && formData.healthAssessment.currentHealth.weight && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          BMI (自动计算)
                        </label>
                        <input
                          type="text"
                          className="mt-1 input bg-gray-50"
                          value={formData.healthAssessment.currentHealth.bmi || 'N/A'}
                          disabled
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Medical History */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">病史信息</h3>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        现有疾病 (每行一个)
                      </label>
                      <textarea
                        rows={3}
                        className="mt-1 input"
                        value={formData.healthAssessment.medicalHistory.conditions?.join('\n') || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          healthAssessment: {
                            ...prev.healthAssessment,
                            medicalHistory: {
                              ...prev.healthAssessment.medicalHistory,
                              conditions: e.target.value.split('\n').filter(item => item.trim())
                            }
                          }
                        }))}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        当前用药 (每行一个)
                      </label>
                      <textarea
                        rows={3}
                        className="mt-1 input"
                        value={formData.healthAssessment.medicalHistory.medications?.join('\n') || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          healthAssessment: {
                            ...prev.healthAssessment,
                            medicalHistory: {
                              ...prev.healthAssessment.medicalHistory,
                              medications: e.target.value.split('\n').filter(item => item.trim())
                            }
                          }
                        }))}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        过敏史 (每行一个)
                      </label>
                      <textarea
                        rows={3}
                        className="mt-1 input"
                        value={formData.healthAssessment.medicalHistory.allergies?.join('\n') || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          healthAssessment: {
                            ...prev.healthAssessment,
                            medicalHistory: {
                              ...prev.healthAssessment.medicalHistory,
                              allergies: e.target.value.split('\n').filter(item => item.trim())
                            }
                          }
                        }))}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        家族病史 (每行一个)
                      </label>
                      <textarea
                        rows={3}
                        className="mt-1 input"
                        value={formData.healthAssessment.medicalHistory.familyHistory?.join('\n') || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          healthAssessment: {
                            ...prev.healthAssessment,
                            medicalHistory: {
                              ...prev.healthAssessment.medicalHistory,
                              familyHistory: e.target.value.split('\n').filter(item => item.trim())
                            }
                          }
                        }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Lifestyle */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">生活方式</h3>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        吸烟状况
                      </label>
                      <select
                        className="mt-1 input"
                        value={formData.healthAssessment.lifestyle.smoking || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          healthAssessment: {
                            ...prev.healthAssessment,
                            lifestyle: {
                              ...prev.healthAssessment.lifestyle,
                              smoking: e.target.value
                            }
                          }
                        }))}
                      >
                        <option value="">选择...</option>
                        {LIFESTYLE_OPTIONS.smoking.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        饮酒状况
                      </label>
                      <select
                        className="mt-1 input"
                        value={formData.healthAssessment.lifestyle.alcohol || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          healthAssessment: {
                            ...prev.healthAssessment,
                            lifestyle: {
                              ...prev.healthAssessment.lifestyle,
                              alcohol: e.target.value
                            }
                          }
                        }))}
                      >
                        <option value="">选择...</option>
                        {LIFESTYLE_OPTIONS.alcohol.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        饮食类型
                      </label>
                      <select
                        className="mt-1 input"
                        value={formData.healthAssessment.lifestyle.diet_type || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          healthAssessment: {
                            ...prev.healthAssessment,
                            lifestyle: {
                              ...prev.healthAssessment.lifestyle,
                              diet_type: e.target.value
                            }
                          }
                        }))}
                      >
                        <option value="">选择...</option>
                        {LIFESTYLE_OPTIONS.diet_type.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        运动频率
                      </label>
                      <select
                        className="mt-1 input"
                        value={formData.healthAssessment.lifestyle.exercise_frequency || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          healthAssessment: {
                            ...prev.healthAssessment,
                            lifestyle: {
                              ...prev.healthAssessment.lifestyle,
                              exercise_frequency: e.target.value
                            }
                          }
                        }))}
                      >
                        <option value="">选择...</option>
                        {LIFESTYLE_OPTIONS.exercise_frequency.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        睡眠时间 (小时)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="24"
                        step="0.5"
                        className="mt-1 input"
                        value={formData.healthAssessment.lifestyle.sleep_hours || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          healthAssessment: {
                            ...prev.healthAssessment,
                            lifestyle: {
                              ...prev.healthAssessment.lifestyle,
                              sleep_hours: parseFloat(e.target.value)
                            }
                          }
                        }))}
                      />
                    </div>

                    <div className="sm:col-span-2 lg:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">
                        压力因素 (每行一个)
                      </label>
                      <textarea
                        rows={3}
                        className="mt-1 input"
                        value={formData.healthAssessment.lifestyle.stress_factors?.join('\n') || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          healthAssessment: {
                            ...prev.healthAssessment,
                            lifestyle: {
                              ...prev.healthAssessment.lifestyle,
                              stress_factors: e.target.value.split('\n').filter(item => item.trim())
                            }
                          }
                        }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Nutritional Deficiencies */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">营养缺乏</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      已知营养缺乏 (每行一个)
                    </label>
                    <textarea
                      rows={3}
                      className="mt-1 input"
                      value={formData.healthAssessment.nutritionalDeficiencies?.join('\n') || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        healthAssessment: {
                          ...prev.healthAssessment,
                          nutritionalDeficiencies: e.target.value.split('\n').filter(item => item.trim())
                        }
                      }))}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Health Goals Tab */}
            {activeTab === 'goals' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">健康目标</h3>
                  <button
                    onClick={addHealthGoal}
                    className="btn btn-primary btn-sm flex items-center"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    添加目标
                  </button>
                </div>

                {formData.healthGoals.length === 0 ? (
                  <div className="text-center py-8">
                    <HeartIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">暂无健康目标</h3>
                    <p className="mt-1 text-sm text-gray-500">开始添加健康目标来创建计划</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.healthGoals.map((goal, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-md font-medium text-gray-900">目标 {index + 1}</h4>
                          <button
                            onClick={() => removeHealthGoal(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              目标类别
                            </label>
                            <select
                              className="mt-1 input"
                              value={goal.category}
                              onChange={(e) => updateHealthGoal(index, 'category', e.target.value)}
                            >
                              {HEALTH_GOAL_CATEGORIES.map((category) => (
                                <option key={category.value} value={category.value}>
                                  {category.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              优先级
                            </label>
                            <select
                              className="mt-1 input"
                              value={goal.priority}
                              onChange={(e) => updateHealthGoal(index, 'priority', e.target.value)}
                            >
                              {GOAL_PRIORITIES.map((priority) => (
                                <option key={priority.value} value={priority.value}>
                                  {priority.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              状态
                            </label>
                            <select
                              className="mt-1 input"
                              value={goal.status}
                              onChange={(e) => updateHealthGoal(index, 'status', e.target.value)}
                            >
                              {GOAL_STATUSES.map((status) => (
                                <option key={status.value} value={status.value}>
                                  {status.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="sm:col-span-2 lg:col-span-3">
                            <label className="block text-sm font-medium text-gray-700">
                              目标描述
                            </label>
                            <textarea
                              rows={2}
                              className="mt-1 input"
                              value={goal.description}
                              onChange={(e) => updateHealthGoal(index, 'description', e.target.value)}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              当前值
                            </label>
                            <input
                              type="text"
                              className="mt-1 input"
                              value={goal.currentValue || ''}
                              onChange={(e) => updateHealthGoal(index, 'currentValue', e.target.value)}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              目标值
                            </label>
                            <input
                              type="text"
                              className="mt-1 input"
                              value={goal.targetValue || ''}
                              onChange={(e) => updateHealthGoal(index, 'targetValue', e.target.value)}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              目标日期
                            </label>
                            <input
                              type="date"
                              className="mt-1 input"
                              value={goal.targetDate || ''}
                              onChange={(e) => updateHealthGoal(index, 'targetDate', e.target.value)}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              进度百分比 (%)
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              className="mt-1 input"
                              value={goal.progress.percentage}
                              onChange={(e) => updateHealthGoal(index, 'progress', {
                                ...goal.progress,
                                percentage: parseInt(e.target.value) || 0
                              })}
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">
                              备注
                            </label>
                            <textarea
                              rows={2}
                              className="mt-1 input"
                              value={goal.notes || ''}
                              onChange={(e) => updateHealthGoal(index, 'notes', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Product Recommendations Tab */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">产品推荐</h3>
                  <button
                    onClick={addProductRecommendation}
                    className="btn btn-primary btn-sm flex items-center"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    添加产品
                  </button>
                </div>

                {formData.productRecommendations.length === 0 ? (
                  <div className="text-center py-8">
                    <CubeIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">暂无产品推荐</h3>
                    <p className="mt-1 text-sm text-gray-500">添加USANA产品推荐来制定补充计划</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {formData.productRecommendations.map((rec, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-md font-medium text-gray-900">产品推荐 {index + 1}</h4>
                          <button
                            onClick={() => removeProductRecommendation(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">
                              产品 *
                            </label>
                            <select
                              className="mt-1 input"
                              value={rec.productId}
                              onChange={(e) => updateProductRecommendation(index, 'productId', e.target.value)}
                            >
                              <option value="">选择产品...</option>
                              {products.map((product) => (
                                <option key={product._id} value={product._id}>
                                  {product.productName} ({product.productCode})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              优先级
                            </label>
                            <select
                              className="mt-1 input"
                              value={rec.priority}
                              onChange={(e) => updateProductRecommendation(index, 'priority', e.target.value)}
                            >
                              {PRODUCT_PRIORITIES.map((priority) => (
                                <option key={priority.value} value={priority.value}>
                                  {priority.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              剂量
                            </label>
                            <input
                              type="text"
                              className="mt-1 input"
                              value={rec.dosage}
                              onChange={(e) => updateProductRecommendation(index, 'dosage', e.target.value)}
                              placeholder="如: 1片, 2粒"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              早上
                            </label>
                            <input
                              type="number"
                              min="0"
                              className="mt-1 input"
                              value={rec.frequency.morning}
                              onChange={(e) => updateProductRecommendation(index, 'frequency', {
                                ...rec.frequency,
                                morning: parseInt(e.target.value) || 0
                              })}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              下午
                            </label>
                            <input
                              type="number"
                              min="0"
                              className="mt-1 input"
                              value={rec.frequency.afternoon}
                              onChange={(e) => updateProductRecommendation(index, 'frequency', {
                                ...rec.frequency,
                                afternoon: parseInt(e.target.value) || 0
                              })}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              晚上
                            </label>
                            <input
                              type="number"
                              min="0"
                              className="mt-1 input"
                              value={rec.frequency.evening}
                              onChange={(e) => updateProductRecommendation(index, 'frequency', {
                                ...rec.frequency,
                                evening: parseInt(e.target.value) || 0
                              })}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              持续时间
                            </label>
                            <div className="mt-1 flex space-x-2">
                              <input
                                type="number"
                                min="1"
                                className="input flex-1"
                                value={rec.duration.value}
                                onChange={(e) => updateProductRecommendation(index, 'duration', {
                                  ...rec.duration,
                                  value: parseInt(e.target.value) || 1
                                })}
                              />
                              <select
                                className="input w-24"
                                value={rec.duration.unit}
                                onChange={(e) => updateProductRecommendation(index, 'duration', {
                                  ...rec.duration,
                                  unit: e.target.value as 'days' | 'weeks' | 'months'
                                })}
                              >
                                <option value="days">天</option>
                                <option value="weeks">周</option>
                                <option value="months">月</option>
                              </select>
                            </div>
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">
                              用途 (每行一个)
                            </label>
                            <textarea
                              rows={2}
                              className="mt-1 input"
                              value={rec.purpose.join('\n')}
                              onChange={(e) => updateProductRecommendation(index, 'purpose', 
                                e.target.value.split('\n').filter(item => item.trim())
                              )}
                              placeholder="如: 增强免疫力\n改善睡眠质量"
                            />
                          </div>

                          <div className="sm:col-span-2 lg:col-span-3">
                            <label className="block text-sm font-medium text-gray-700">
                              备注
                            </label>
                            <textarea
                              rows={2}
                              className="mt-1 input"
                              value={rec.notes || ''}
                              onChange={(e) => updateProductRecommendation(index, 'notes', e.target.value)}
                            />
                          </div>

                          {rec.estimatedCost && (
                            <div className="sm:col-span-2 lg:col-span-3">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                预估费用
                              </label>
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div className="text-center p-2 bg-gray-50 rounded">
                                  <div className="font-medium">零售价</div>
                                  <div className="text-lg">¥{rec.estimatedCost.retail}</div>
                                </div>
                                <div className="text-center p-2 bg-gray-50 rounded">
                                  <div className="font-medium">批发价</div>
                                  <div className="text-lg">¥{rec.estimatedCost.wholesale}</div>
                                </div>
                                <div className="text-center p-2 bg-gray-50 rounded">
                                  <div className="font-medium">优惠价</div>
                                  <div className="text-lg">¥{rec.estimatedCost.preferredCustomer}</div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Timeline Tab */}
            {activeTab === 'timeline' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">时间安排</h3>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                      开始日期 *
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      required
                      className="mt-1 input"
                      value={formData.timeline.startDate}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        timeline: {
                          ...prev.timeline,
                          startDate: e.target.value
                        }
                      }))}
                    />
                  </div>

                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                      结束日期
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      className="mt-1 input"
                      value={formData.timeline.endDate || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        timeline: {
                          ...prev.timeline,
                          endDate: e.target.value
                        }
                      }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    复查日期 (每行一个日期)
                  </label>
                  <textarea
                    rows={3}
                    className="input"
                    value={formData.timeline.reviewDates.join('\n')}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      timeline: {
                        ...prev.timeline,
                        reviewDates: e.target.value.split('\n').filter(date => date.trim())
                      }
                    }))}
                    placeholder="2024-02-01&#10;2024-03-01&#10;2024-04-01"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    格式: YYYY-MM-DD，每行一个日期
                  </p>
                </div>
              </div>
            )}

            {/* Notes & Tags Tab */}
            {activeTab === 'notes' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">备注和标签</h3>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="publicNotes" className="block text-sm font-medium text-gray-700">
                      公开备注
                    </label>
                    <textarea
                      id="publicNotes"
                      rows={4}
                      className="mt-1 input"
                      value={formData.notes.public || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        notes: {
                          ...prev.notes,
                          public: e.target.value
                        }
                      }))}
                      placeholder="客户可见的备注信息..."
                    />
                  </div>

                  <div>
                    <label htmlFor="privateNotes" className="block text-sm font-medium text-gray-700">
                      私有备注
                    </label>
                    <textarea
                      id="privateNotes"
                      rows={4}
                      className="mt-1 input"
                      value={formData.notes.private || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        notes: {
                          ...prev.notes,
                          private: e.target.value
                        }
                      }))}
                      placeholder="内部使用备注..."
                    />
                  </div>

                  <div>
                    <label htmlFor="instructions" className="block text-sm font-medium text-gray-700">
                      使用说明
                    </label>
                    <textarea
                      id="instructions"
                      rows={4}
                      className="mt-1 input"
                      value={formData.notes.instructions || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        notes: {
                          ...prev.notes,
                          instructions: e.target.value
                        }
                      }))}
                      placeholder="详细的使用指导..."
                    />
                  </div>

                  <div>
                    <label htmlFor="warnings" className="block text-sm font-medium text-gray-700">
                      注意事项
                    </label>
                    <textarea
                      id="warnings"
                      rows={4}
                      className="mt-1 input"
                      value={formData.notes.warnings || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        notes: {
                          ...prev.notes,
                          warnings: e.target.value
                        }
                      }))}
                      placeholder="重要提醒和注意事项..."
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                    标签 (空格分隔)
                  </label>
                  <input
                    type="text"
                    id="tags"
                    className="mt-1 input"
                    value={formData.tags.join(' ')}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      tags: e.target.value.split(' ').filter(tag => tag.trim())
                    }))}
                    placeholder="减肥 免疫 活力 美容"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    用空格分隔多个标签
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Template Selection Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">选择健康计划模板</h3>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">关闭</span>
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <div
                  key={template._id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => applyTemplate(template)}
                >
                  <h4 className="font-medium text-gray-900">{template.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-gray-500">{template.category}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      template.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                      template.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {template.difficulty === 'beginner' ? '初级' :
                       template.difficulty === 'intermediate' ? '中级' : '高级'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {templates.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">暂无可用模板</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}