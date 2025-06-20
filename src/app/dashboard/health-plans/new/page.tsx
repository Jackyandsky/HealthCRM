'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
  ChartBarIcon
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

const PRODUCT_PRIORITIES = [
  { value: 'essential', label: '必需', color: 'bg-red-100 text-red-800' },
  { value: 'recommended', label: '推荐', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'optional', label: '可选', color: 'bg-green-100 text-green-800' },
]

export default function NewHealthPlanPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [templates, setTemplates] = useState<HealthPlanTemplate[]>([])
  const [loading, setLoading] = useState(false)
  const [customerSearch, setCustomerSearch] = useState('')
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<HealthPlanTemplate | null>(null)
  const router = useRouter()

  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    assignedToId: '',
    title: '',
    description: '',
    planType: 'basic',
    priority: 'medium',
    
    // Health Assessment
    healthAssessment: {
      currentHealth: {
        overall_rating: 5,
        energy_level: 5,
        stress_level: 5,
        sleep_quality: 5,
        physical_activity: 'moderate',
        bmi: '',
        weight: '',
        height: ''
      },
      medicalHistory: {
        conditions: [] as string[],
        medications: [] as string[],
        allergies: [] as string[],
        surgeries: [] as string[],
        familyHistory: [] as string[]
      },
      lifestyle: {
        smoking: 'never',
        alcohol: 'occasional',
        diet_type: 'omnivore',
        exercise_frequency: 'weekly',
        stress_factors: [] as string[],
        sleep_hours: 8
      },
      nutritionalDeficiencies: [] as string[]
    },

    // Health Goals
    healthGoals: [] as Array<{
      category: string
      description: string
      targetValue: string
      currentValue: string
      targetDate: string
      priority: string
      progress: {
        percentage: number
        milestones: Array<{
          description: string
          targetDate: string
          status: string
        }>
      }
      notes: string
    }>,

    // Product Recommendations
    productRecommendations: [] as Array<{
      productId: string
      productCode: string
      productName: string
      dosage: string
      frequency: {
        morning: number
        afternoon: number
        evening: number
        notes: string
      }
      duration: {
        value: number
        unit: string
      }
      purpose: string[]
      priority: string
      notes: string
    }>,

    // Timeline
    timeline: {
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      reviewDates: [] as string[],
      milestones: [] as Array<{
        title: string
        description: string
        targetDate: string
        status: string
      }>
    },

    // Notes
    notes: {
      public: '',
      private: '',
      instructions: '',
      warnings: ''
    },

    tags: [] as string[]
  })

  const [newTag, setNewTag] = useState('')
  const [newCondition, setNewCondition] = useState('')
  const [newMedication, setNewMedication] = useState('')
  const [newAllergy, setNewAllergy] = useState('')
  const [newStressFactor, setNewStressFactor] = useState('')
  const [newDeficiency, setNewDeficiency] = useState('')

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
      
      const [customersRes, usersRes, productsRes, templatesRes] = await Promise.all([
        fetch('/api/customers?limit=100', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch('/api/users', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch('/api/products?limit=100', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch('/api/health-plan-templates?limit=20&status=active', {
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

      if (templatesRes.ok) {
        const templatesData = await templatesRes.json()
        setTemplates(templatesData.data.templates || [])
      }
    } catch (error) {
      console.error('Error loading initial data:', error)
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
  }

  const handleTemplateSelect = (template: HealthPlanTemplate) => {
    setSelectedTemplate(template)
    setFormData(prev => ({
      ...prev,
      title: template.name,
      description: template.description,
      healthGoals: template.healthGoals.map((goal: any) => ({
        category: goal.category,
        description: goal.description,
        targetValue: '',
        currentValue: '',
        targetDate: '',
        priority: goal.priority,
        progress: {
          percentage: 0,
          milestones: goal.milestones?.map((m: any) => ({
            description: m.description,
            targetDate: '',
            status: 'pending'
          })) || []
        },
        notes: ''
      })),
      productRecommendations: template.productRecommendations.map((rec: any) => ({
        productId: rec.productId,
        productCode: rec.productCode,
        productName: rec.productName,
        dosage: rec.dosage,
        frequency: rec.frequency,
        duration: rec.duration,
        purpose: rec.purpose || [],
        priority: rec.priority,
        notes: ''
      })),
      timeline: {
        ...prev.timeline,
        endDate: (template as any).duration?.typical ? 
          new Date(Date.now() + (template as any).duration.typical.value * ((template as any).duration.typical.unit === 'months' ? 30 : 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          : ''
      }
    }))
  }

  const addHealthGoal = () => {
    setFormData(prev => ({
      ...prev,
      healthGoals: [...prev.healthGoals, {
        category: 'general_wellness',
        description: '',
        targetValue: '',
        currentValue: '',
        targetDate: '',
        priority: 'medium',
        progress: {
          percentage: 0,
          milestones: []
        },
        notes: ''
      }]
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
    setFormData(prev => ({
      ...prev,
      productRecommendations: [...prev.productRecommendations, {
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
        notes: ''
      }]
    }))
  }

  const updateProductRecommendation = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      productRecommendations: prev.productRecommendations.map((rec, i) => 
        i === index ? { ...rec, [field]: value } : rec
      )
    }))
  }

  const removeProductRecommendation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      productRecommendations: prev.productRecommendations.filter((_, i) => i !== index)
    }))
  }

  const addArrayItem = (arrayPath: string, value: string) => {
    if (!value.trim()) return
    
    const pathParts = arrayPath.split('.')
    setFormData(prev => {
      const newData = { ...prev }
      let current: any = newData
      
      for (let i = 0; i < pathParts.length - 1; i++) {
        current = current[pathParts[i]]
      }
      
      const lastKey = pathParts[pathParts.length - 1]
      if (!current[lastKey].includes(value.trim())) {
        current[lastKey] = [...current[lastKey], value.trim()]
      }
      
      return newData
    })
  }

  const removeArrayItem = (arrayPath: string, index: number) => {
    const pathParts = arrayPath.split('.')
    setFormData(prev => {
      const newData = { ...prev }
      let current: any = newData
      
      for (let i = 0; i < pathParts.length - 1; i++) {
        current = current[pathParts[i]]
      }
      
      const lastKey = pathParts[pathParts.length - 1]
      current[lastKey] = current[lastKey].filter((_: any, i: number) => i !== index)
      
      return newData
    })
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

  const calculateBMI = () => {
    const weight = parseFloat(formData.healthAssessment.currentHealth.weight)
    const height = parseFloat(formData.healthAssessment.currentHealth.height) / 100 // Convert cm to m
    
    if (weight && height) {
      const bmi = weight / (height * height)
      setFormData(prev => ({
        ...prev,
        healthAssessment: {
          ...prev.healthAssessment,
          currentHealth: {
            ...prev.healthAssessment.currentHealth,
            bmi: bmi.toFixed(1)
          }
        }
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.customerId || !formData.title) {
      alert('请填写所有必填字段')
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/health-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          templateId: selectedTemplate?._id,
          templateName: selectedTemplate?.name
        }),
      })

      if (response.ok) {
        router.push('/dashboard/health-plans')
      } else {
        const data = await response.json()
        alert(data.message || '创建失败')
      }
    } catch (error) {
      console.error('Error creating health plan:', error)
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
                  href="/dashboard/health-plans"
                  className="mr-4 text-gray-400 hover:text-gray-600"
                >
                  <ArrowLeftIcon className="h-6 w-6" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">新建健康计划</h1>
                  <p className="mt-1 text-sm text-gray-600">
                    创建个性化的健康和营养补充计划
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Template Selection */}
          {templates.length > 0 && !selectedTemplate && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <CubeIcon className="h-5 w-5 mr-2" />
                  选择计划模板（可选）
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {templates.slice(0, 6).map((template) => (
                    <div
                      key={template._id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 cursor-pointer transition-colors"
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{template.name}</h4>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          template.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                          template.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {template.difficulty === 'beginner' ? '初级' :
                           template.difficulty === 'intermediate' ? '中级' : '高级'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{template.healthGoals?.length || 0} 个目标</span>
                        <span>{template.productRecommendations?.length || 0} 个产品</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => setSelectedTemplate({} as HealthPlanTemplate)}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    跳过模板选择，手动创建 →
                  </button>
                </div>
              </div>
            </div>
          )}

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
                    计划标题 *
                  </label>
                  <input
                    type="text"
                    id="title"
                    className="mt-1 input"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="输入健康计划标题"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    计划描述
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    className="mt-1 input"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="详细描述此健康计划的目标和内容..."
                  />
                </div>

                <div>
                  <label htmlFor="planType" className="block text-sm font-medium text-gray-700">
                    计划类型 *
                  </label>
                  <select
                    id="planType"
                    className="mt-1 input"
                    value={formData.planType}
                    onChange={(e) => setFormData(prev => ({ ...prev, planType: e.target.value }))}
                    required
                  >
                    {PLAN_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label} - {type.description}
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

          {/* Health Assessment */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <HeartIcon className="h-5 w-5 mr-2" />
                健康评估
              </h3>
            </div>
            <div className="p-6 space-y-8">
              {/* Current Health */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">当前健康状况</h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      整体健康评分 (1-10)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      className="mt-1 input"
                      value={formData.healthAssessment.currentHealth.overall_rating}
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
                      value={formData.healthAssessment.currentHealth.energy_level}
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
                      value={formData.healthAssessment.currentHealth.stress_level}
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
                      value={formData.healthAssessment.currentHealth.sleep_quality}
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
                      身高 (cm)
                    </label>
                    <input
                      type="number"
                      className="mt-1 input"
                      value={formData.healthAssessment.currentHealth.height}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        healthAssessment: {
                          ...prev.healthAssessment,
                          currentHealth: {
                            ...prev.healthAssessment.currentHealth,
                            height: e.target.value
                          }
                        }
                      }))}
                      onBlur={calculateBMI}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      体重 (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      className="mt-1 input"
                      value={formData.healthAssessment.currentHealth.weight}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        healthAssessment: {
                          ...prev.healthAssessment,
                          currentHealth: {
                            ...prev.healthAssessment.currentHealth,
                            weight: e.target.value
                          }
                        }
                      }))}
                      onBlur={calculateBMI}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      BMI
                    </label>
                    <input
                      type="text"
                      className="mt-1 input bg-gray-50"
                      value={formData.healthAssessment.currentHealth.bmi}
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      运动活跃度
                    </label>
                    <select
                      className="mt-1 input"
                      value={formData.healthAssessment.currentHealth.physical_activity}
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
                      <option value="sedentary">久坐不动</option>
                      <option value="light">轻度活动</option>
                      <option value="moderate">中度活动</option>
                      <option value="active">积极活跃</option>
                      <option value="very_active">非常活跃</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Medical History */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">病史信息</h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Health Conditions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">健康状况</label>
                    <div className="mt-1 flex items-center space-x-2">
                      <input
                        type="text"
                        className="input flex-1"
                        value={newCondition}
                        onChange={(e) => setNewCondition(e.target.value)}
                        placeholder="添加健康状况..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addArrayItem('healthAssessment.medicalHistory.conditions', newCondition)
                            setNewCondition('')
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          addArrayItem('healthAssessment.medicalHistory.conditions', newCondition)
                          setNewCondition('')
                        }}
                        className="btn btn-secondary btn-sm"
                      >
                        添加
                      </button>
                    </div>
                    {formData.healthAssessment.medicalHistory.conditions.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {formData.healthAssessment.medicalHistory.conditions.map((condition, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                            <span className="text-sm">{condition}</span>
                            <button
                              type="button"
                              onClick={() => removeArrayItem('healthAssessment.medicalHistory.conditions', index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Medications */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">当前用药</label>
                    <div className="mt-1 flex items-center space-x-2">
                      <input
                        type="text"
                        className="input flex-1"
                        value={newMedication}
                        onChange={(e) => setNewMedication(e.target.value)}
                        placeholder="添加药物..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addArrayItem('healthAssessment.medicalHistory.medications', newMedication)
                            setNewMedication('')
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          addArrayItem('healthAssessment.medicalHistory.medications', newMedication)
                          setNewMedication('')
                        }}
                        className="btn btn-secondary btn-sm"
                      >
                        添加
                      </button>
                    </div>
                    {formData.healthAssessment.medicalHistory.medications.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {formData.healthAssessment.medicalHistory.medications.map((medication, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                            <span className="text-sm">{medication}</span>
                            <button
                              type="button"
                              onClick={() => removeArrayItem('healthAssessment.medicalHistory.medications', index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Allergies */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">过敏信息</label>
                    <div className="mt-1 flex items-center space-x-2">
                      <input
                        type="text"
                        className="input flex-1"
                        value={newAllergy}
                        onChange={(e) => setNewAllergy(e.target.value)}
                        placeholder="添加过敏原..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addArrayItem('healthAssessment.medicalHistory.allergies', newAllergy)
                            setNewAllergy('')
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          addArrayItem('healthAssessment.medicalHistory.allergies', newAllergy)
                          setNewAllergy('')
                        }}
                        className="btn btn-secondary btn-sm"
                      >
                        添加
                      </button>
                    </div>
                    {formData.healthAssessment.medicalHistory.allergies.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {formData.healthAssessment.medicalHistory.allergies.map((allergy, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                            <span className="text-sm">{allergy}</span>
                            <button
                              type="button"
                              onClick={() => removeArrayItem('healthAssessment.medicalHistory.allergies', index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Nutritional Deficiencies */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">营养缺乏</label>
                    <div className="mt-1 flex items-center space-x-2">
                      <input
                        type="text"
                        className="input flex-1"
                        value={newDeficiency}
                        onChange={(e) => setNewDeficiency(e.target.value)}
                        placeholder="添加营养缺乏..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addArrayItem('healthAssessment.nutritionalDeficiencies', newDeficiency)
                            setNewDeficiency('')
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          addArrayItem('healthAssessment.nutritionalDeficiencies', newDeficiency)
                          setNewDeficiency('')
                        }}
                        className="btn btn-secondary btn-sm"
                      >
                        添加
                      </button>
                    </div>
                    {formData.healthAssessment.nutritionalDeficiencies.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {formData.healthAssessment.nutritionalDeficiencies.map((deficiency, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                            <span className="text-sm">{deficiency}</span>
                            <button
                              type="button"
                              onClick={() => removeArrayItem('healthAssessment.nutritionalDeficiencies', index)}
                              className="text-red-600 hover:text-red-800"
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

              {/* Lifestyle */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">生活方式</h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">吸烟状况</label>
                    <select
                      className="mt-1 input"
                      value={formData.healthAssessment.lifestyle.smoking}
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
                      <option value="never">从不吸烟</option>
                      <option value="former">曾经吸烟</option>
                      <option value="occasional">偶尔吸烟</option>
                      <option value="regular">经常吸烟</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">饮酒情况</label>
                    <select
                      className="mt-1 input"
                      value={formData.healthAssessment.lifestyle.alcohol}
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
                      <option value="never">从不饮酒</option>
                      <option value="occasional">偶尔饮酒</option>
                      <option value="moderate">适度饮酒</option>
                      <option value="frequent">经常饮酒</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">饮食类型</label>
                    <select
                      className="mt-1 input"
                      value={formData.healthAssessment.lifestyle.diet_type}
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
                      <option value="omnivore">杂食</option>
                      <option value="vegetarian">素食</option>
                      <option value="vegan">纯素</option>
                      <option value="keto">生酮饮食</option>
                      <option value="paleo">原始饮食</option>
                      <option value="other">其他</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">睡眠时间 (小时)</label>
                    <input
                      type="number"
                      min="4"
                      max="12"
                      step="0.5"
                      className="mt-1 input"
                      value={formData.healthAssessment.lifestyle.sleep_hours}
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
                </div>

                {/* Stress Factors */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">压力来源</label>
                  <div className="mt-1 flex items-center space-x-2">
                    <input
                      type="text"
                      className="input flex-1"
                      value={newStressFactor}
                      onChange={(e) => setNewStressFactor(e.target.value)}
                      placeholder="添加压力来源..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addArrayItem('healthAssessment.lifestyle.stress_factors', newStressFactor)
                          setNewStressFactor('')
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        addArrayItem('healthAssessment.lifestyle.stress_factors', newStressFactor)
                        setNewStressFactor('')
                      }}
                      className="btn btn-secondary btn-sm"
                    >
                      添加
                    </button>
                  </div>
                  {formData.healthAssessment.lifestyle.stress_factors.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.healthAssessment.lifestyle.stress_factors.map((factor, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                        >
                          {factor}
                          <button
                            type="button"
                            onClick={() => removeArrayItem('healthAssessment.lifestyle.stress_factors', index)}
                            className="ml-1 text-red-600 hover:text-red-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Health Goals */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <ChartBarIcon className="h-5 w-5 mr-2" />
                  健康目标
                </h3>
                <button
                  type="button"
                  onClick={addHealthGoal}
                  className="btn btn-secondary btn-sm flex items-center"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  添加目标
                </button>
              </div>
            </div>
            <div className="p-6">
              {formData.healthGoals.length === 0 ? (
                <p className="text-gray-500 text-center py-4">暂无健康目标</p>
              ) : (
                <div className="space-y-4">
                  {formData.healthGoals.map((goal, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900">目标 {index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeHealthGoal(index)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">目标类别</label>
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
                          <label className="block text-sm font-medium text-gray-700">优先级</label>
                          <select
                            className="mt-1 input"
                            value={goal.priority}
                            onChange={(e) => updateHealthGoal(index, 'priority', e.target.value)}
                          >
                            <option value="low">低</option>
                            <option value="medium">中</option>
                            <option value="high">高</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">目标日期</label>
                          <input
                            type="date"
                            className="mt-1 input"
                            value={goal.targetDate}
                            onChange={(e) => updateHealthGoal(index, 'targetDate', e.target.value)}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700">目标描述</label>
                          <input
                            type="text"
                            className="mt-1 input"
                            value={goal.description}
                            onChange={(e) => updateHealthGoal(index, 'description', e.target.value)}
                            placeholder="描述具体的健康目标..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">目标值</label>
                          <input
                            type="text"
                            className="mt-1 input"
                            value={goal.targetValue}
                            onChange={(e) => updateHealthGoal(index, 'targetValue', e.target.value)}
                            placeholder="如: 减重5公斤"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">当前值</label>
                          <input
                            type="text"
                            className="mt-1 input"
                            value={goal.currentValue}
                            onChange={(e) => updateHealthGoal(index, 'currentValue', e.target.value)}
                            placeholder="如: 当前体重70公斤"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700">备注</label>
                          <input
                            type="text"
                            className="mt-1 input"
                            value={goal.notes}
                            onChange={(e) => updateHealthGoal(index, 'notes', e.target.value)}
                            placeholder="添加备注信息..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Recommendations */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <CubeIcon className="h-5 w-5 mr-2" />
                  产品推荐
                </h3>
                <button
                  type="button"
                  onClick={addProductRecommendation}
                  className="btn btn-secondary btn-sm flex items-center"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  添加产品
                </button>
              </div>
            </div>
            <div className="p-6">
              {formData.productRecommendations.length === 0 ? (
                <p className="text-gray-500 text-center py-4">暂无产品推荐</p>
              ) : (
                <div className="space-y-4">
                  {formData.productRecommendations.map((recommendation, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900">产品 {index + 1}</h4>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            PRODUCT_PRIORITIES.find(p => p.value === recommendation.priority)?.color || 'bg-gray-100 text-gray-800'
                          }`}>
                            {PRODUCT_PRIORITIES.find(p => p.value === recommendation.priority)?.label || recommendation.priority}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeProductRecommendation(index)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">产品</label>
                          <select
                            className="mt-1 input"
                            value={recommendation.productId}
                            onChange={(e) => {
                              const product = products.find(p => p._id === e.target.value)
                              updateProductRecommendation(index, 'productId', e.target.value)
                              if (product) {
                                updateProductRecommendation(index, 'productCode', product.productCode)
                                updateProductRecommendation(index, 'productName', product.productName)
                              }
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
                          <label className="block text-sm font-medium text-gray-700">用量</label>
                          <input
                            type="text"
                            className="mt-1 input"
                            value={recommendation.dosage}
                            onChange={(e) => updateProductRecommendation(index, 'dosage', e.target.value)}
                            placeholder="如: 1粒"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">优先级</label>
                          <select
                            className="mt-1 input"
                            value={recommendation.priority}
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
                          <label className="block text-sm font-medium text-gray-700">早上</label>
                          <input
                            type="number"
                            min="0"
                            className="mt-1 input"
                            value={recommendation.frequency.morning}
                            onChange={(e) => updateProductRecommendation(index, 'frequency', {
                              ...recommendation.frequency,
                              morning: parseInt(e.target.value) || 0
                            })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">下午</label>
                          <input
                            type="number"
                            min="0"
                            className="mt-1 input"
                            value={recommendation.frequency.afternoon}
                            onChange={(e) => updateProductRecommendation(index, 'frequency', {
                              ...recommendation.frequency,
                              afternoon: parseInt(e.target.value) || 0
                            })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">晚上</label>
                          <input
                            type="number"
                            min="0"
                            className="mt-1 input"
                            value={recommendation.frequency.evening}
                            onChange={(e) => updateProductRecommendation(index, 'frequency', {
                              ...recommendation.frequency,
                              evening: parseInt(e.target.value) || 0
                            })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">持续时间</label>
                          <div className="mt-1 flex space-x-2">
                            <input
                              type="number"
                              min="1"
                              className="input flex-1"
                              value={recommendation.duration.value}
                              onChange={(e) => updateProductRecommendation(index, 'duration', {
                                ...recommendation.duration,
                                value: parseInt(e.target.value) || 1
                              })}
                            />
                            <select
                              className="input w-20"
                              value={recommendation.duration.unit}
                              onChange={(e) => updateProductRecommendation(index, 'duration', {
                                ...recommendation.duration,
                                unit: e.target.value
                              })}
                            >
                              <option value="days">天</option>
                              <option value="weeks">周</option>
                              <option value="months">月</option>
                            </select>
                          </div>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700">备注</label>
                          <input
                            type="text"
                            className="mt-1 input"
                            value={recommendation.notes}
                            onChange={(e) => updateProductRecommendation(index, 'notes', e.target.value)}
                            placeholder="用法说明或特殊注意事项..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <CalendarDaysIcon className="h-5 w-5 mr-2" />
                时间安排
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                    开始日期 *
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    className="mt-1 input"
                    value={formData.timeline.startDate}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      timeline: { ...prev.timeline, startDate: e.target.value }
                    }))}
                    required
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
                    value={formData.timeline.endDate}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      timeline: { ...prev.timeline, endDate: e.target.value }
                    }))}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                备注信息
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label htmlFor="publicNotes" className="block text-sm font-medium text-gray-700">
                  公开备注
                </label>
                <textarea
                  id="publicNotes"
                  rows={3}
                  className="mt-1 input"
                  value={formData.notes.public}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    notes: { ...prev.notes, public: e.target.value }
                  }))}
                  placeholder="客户可见的备注信息..."
                />
              </div>

              <div>
                <label htmlFor="instructions" className="block text-sm font-medium text-gray-700">
                  使用说明
                </label>
                <textarea
                  id="instructions"
                  rows={3}
                  className="mt-1 input"
                  value={formData.notes.instructions}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    notes: { ...prev.notes, instructions: e.target.value }
                  }))}
                  placeholder="详细的使用指导和注意事项..."
                />
              </div>

              <div>
                <label htmlFor="privateNotes" className="block text-sm font-medium text-gray-700">
                  内部备注
                </label>
                <textarea
                  id="privateNotes"
                  rows={3}
                  className="mt-1 input"
                  value={formData.notes.private}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    notes: { ...prev.notes, private: e.target.value }
                  }))}
                  placeholder="内部使用的备注信息..."
                />
              </div>

              <div>
                <label htmlFor="warnings" className="block text-sm font-medium text-gray-700">
                  重要提醒
                </label>
                <textarea
                  id="warnings"
                  rows={2}
                  className="mt-1 input"
                  value={formData.notes.warnings}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    notes: { ...prev.notes, warnings: e.target.value }
                  }))}
                  placeholder="重要的安全提醒或禁忌事项..."
                />
              </div>

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
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-4">
            <Link
              href="/dashboard/health-plans"
              className="btn btn-secondary"
            >
              取消
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? '创建中...' : '创建健康计划'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}