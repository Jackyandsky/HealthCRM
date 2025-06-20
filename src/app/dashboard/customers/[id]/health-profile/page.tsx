'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeftIcon,
  HeartIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ChartBarIcon,
  StarIcon,
  CalendarDaysIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

interface Product {
  _id: string
  productCode: string
  productName: string
  category: string
}

interface ProductUsage {
  _id?: string
  productId: string
  productName: string
  productCode: string
  startDate: string
  endDate?: string
  dosage: string
  frequency: string
  purpose: string
  effectiveness: number
  sideEffects?: string
  willContinue: boolean
  notes?: string
  remainingQuantity?: number
  adherence: 'excellent' | 'good' | 'fair' | 'poor'
}

interface HealthAssessment {
  _id?: string
  assessmentDate: string
  assessedBy: string
  category: string
  questions: Array<{
    question: string
    answer: string
    type: string
    score?: number
  }>
  totalScore?: number
  maxScore?: number
  notes?: string
}

interface Customer {
  _id: string
  customerId: string
  firstName: string
  lastName: string
  email?: string
  phone: string
  dateOfBirth?: string
  gender?: string
  customerType: string
  
  healthProfile: {
    height?: number
    weight?: number
    bmi?: number
    bloodType?: string
    chronicConditions?: string[]
    allergies?: string[]
    currentMedications?: string[]
    healthGoals?: string[]
    dietaryRestrictions?: string[]
  }
  
  productUsage: ProductUsage[]
  
  interests: {
    productCategories?: string[]
    healthConcerns?: string[]
    budgetRange?: string
    purchaseFrequency?: string
  }
}

const EFFECTIVENESS_LABELS = {
  1: '无效果',
  2: '轻微效果',
  3: '中等效果', 
  4: '明显效果',
  5: '非常有效'
}

const ADHERENCE_OPTIONS = [
  { value: 'excellent', label: '优秀 (>90%)', color: 'bg-green-100 text-green-800' },
  { value: 'good', label: '良好 (75-90%)', color: 'bg-blue-100 text-blue-800' },
  { value: 'fair', label: '一般 (50-75%)', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'poor', label: '较差 (<50%)', color: 'bg-red-100 text-red-800' },
]

const FREQUENCY_OPTIONS = [
  '每日一次',
  '每日两次',
  '每日三次',
  '每周三次',
  '隔日一次',
  '按需服用',
  '其他'
]

const HEALTH_GOAL_OPTIONS = [
  '体重管理',
  '增强免疫力',
  '改善睡眠',
  '提高能量',
  '心血管健康',
  '骨骼健康',
  '消化健康',
  '皮肤健康',
  '认知功能',
  '运动表现',
  '抗衰老',
  '压力管理',
  '荷尔蒙平衡',
  '排毒净化'
]

const HEALTH_CONCERN_OPTIONS = [
  '高血压',
  '高血糖',
  '高血脂',
  '关节炎',
  '失眠',
  '消化不良',
  '贫血',
  '骨质疏松',
  '慢性疲劳',
  '记忆力下降',
  '皮肤问题',
  '更年期症状',
  '免疫力低下',
  '压力过大'
]

const PRODUCT_CATEGORIES = [
  '基础营养',
  '维生素',
  '矿物质',
  '抗氧化剂',
  '护肤产品',
  '体重管理',
  '运动营养',
  '心血管健康',
  '骨骼健康',
  '消化健康',
  '免疫支持',
  '能量支持'
]

export default function CustomerHealthProfilePage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [activeTab, setActiveTab] = useState('overview')
  
  // Product Usage Management
  const [editingUsage, setEditingUsage] = useState<string | null>(null)
  const [newUsage, setNewUsage] = useState<Partial<ProductUsage>>({
    productId: '',
    dosage: '',
    frequency: '每日一次',
    purpose: '',
    effectiveness: 3,
    adherence: 'good',
    willContinue: true,
    startDate: new Date().toISOString().split('T')[0]
  })
  const [showAddUsage, setShowAddUsage] = useState(false)

  // Health Goals Management
  const [editingGoals, setEditingGoals] = useState(false)
  const [tempGoals, setTempGoals] = useState<string[]>([])

  // Health Concerns Management
  const [editingConcerns, setEditingConcerns] = useState(false)
  const [tempConcerns, setTempConcerns] = useState<string[]>([])

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
      
      // Load customer
      const customerResponse = await fetch(`/api/customers/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (!customerResponse.ok) {
        throw new Error('Failed to load customer')
      }
      
      const customerData = await customerResponse.json()
      setCustomer(customerData.customer)
      setTempGoals(customerData.customer.healthProfile?.healthGoals || [])
      setTempConcerns(customerData.customer.interests?.healthConcerns || [])

      // Load products
      const productsResponse = await fetch('/api/products?limit=1000', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (productsResponse.ok) {
        const productsData = await productsResponse.json()
        setProducts(productsData.data?.products || [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
      alert('加载数据失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveHealthProfile = async (field: string, value: any) => {
    try {
      setSaving(true)
      const token = localStorage.getItem('token')
      
      const updateData = {
        [field]: value
      }
      
      const response = await fetch(`/api/customers/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        await loadData()
      } else {
        const data = await response.json()
        alert(data.message || '保存失败')
      }
    } catch (error) {
      console.error('Error saving health profile:', error)
      alert('保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleAddProductUsage = async () => {
    if (!newUsage.productId || !newUsage.dosage || !newUsage.purpose) {
      alert('请填写必填字段')
      return
    }

    const product = products.find(p => p._id === newUsage.productId)
    if (!product) {
      alert('请选择有效的产品')
      return
    }

    const usageData: ProductUsage = {
      productId: newUsage.productId,
      productName: product.productName,
      productCode: product.productCode,
      startDate: newUsage.startDate || new Date().toISOString().split('T')[0],
      dosage: newUsage.dosage || '',
      frequency: newUsage.frequency || '每日一次',
      purpose: newUsage.purpose || '',
      effectiveness: newUsage.effectiveness || 3,
      adherence: newUsage.adherence || 'good',
      willContinue: newUsage.willContinue !== undefined ? newUsage.willContinue : true,
      sideEffects: newUsage.sideEffects || '',
      notes: newUsage.notes || '',
      remainingQuantity: newUsage.remainingQuantity
    }

    const updatedUsage = [...(customer?.productUsage || []), usageData]
    await handleSaveHealthProfile('productUsage', updatedUsage)
    
    setNewUsage({
      productId: '',
      dosage: '',
      frequency: '每日一次',
      purpose: '',
      effectiveness: 3,
      adherence: 'good',
      willContinue: true,
      startDate: new Date().toISOString().split('T')[0]
    })
    setShowAddUsage(false)
  }

  const handleUpdateProductUsage = async (index: number, field: string, value: any) => {
    if (!customer) return

    const updatedUsage = [...customer.productUsage]
    updatedUsage[index] = { ...updatedUsage[index], [field]: value }
    
    await handleSaveHealthProfile('productUsage', updatedUsage)
  }

  const handleRemoveProductUsage = async (index: number) => {
    if (!customer || !confirm('确定要删除这个产品使用记录吗？')) return

    const updatedUsage = customer.productUsage.filter((_, i) => i !== index)
    await handleSaveHealthProfile('productUsage', updatedUsage)
  }

  const calculateBMI = () => {
    if (customer?.healthProfile?.height && customer?.healthProfile?.weight) {
      const height = customer.healthProfile.height / 100
      const weight = customer.healthProfile.weight
      return (weight / (height * height)).toFixed(1)
    }
    return null
  }

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: '偏瘦', color: 'text-blue-600' }
    if (bmi < 25) return { label: '正常', color: 'text-green-600' }
    if (bmi < 30) return { label: '超重', color: 'text-yellow-600' }
    return { label: '肥胖', color: 'text-red-600' }
  }

  const getEffectivenessColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600'
    if (rating >= 3) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getAdherenceDisplay = (adherence: string) => {
    const option = ADHERENCE_OPTIONS.find(opt => opt.value === adherence)
    return option || { label: adherence, color: 'bg-gray-100 text-gray-800' }
  }

  const renderStars = (rating: number, onChange?: (rating: number) => void) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onChange && onChange(star)}
            className={`${onChange ? 'cursor-pointer' : 'cursor-default'} ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
            disabled={!onChange}
          >
            {star <= rating ? (
              <StarIconSolid className="h-5 w-5" />
            ) : (
              <StarIcon className="h-5 w-5" />
            )}
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {EFFECTIVENESS_LABELS[rating as keyof typeof EFFECTIVENESS_LABELS]}
        </span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">客户未找到</h3>
          <Link href="/dashboard/customers" className="btn btn-primary mt-4">
            返回客户列表
          </Link>
        </div>
      </div>
    )
  }

  const bmi = calculateBMI()
  const bmiCategory = bmi ? getBMICategory(parseFloat(bmi)) : null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Link
                  href={`/dashboard/customers/${params.id}`}
                  className="text-gray-400 hover:text-gray-600 mr-4"
                >
                  <ArrowLeftIcon className="h-6 w-6" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {customer.firstName} {customer.lastName} - 健康档案
                  </h1>
                  <p className="mt-1 text-sm text-gray-600">
                    客户ID: {customer.customerId} | 全面的健康和产品使用管理
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Link
                  href={`/dashboard/customers/${params.id}/edit`}
                  className="btn btn-secondary flex items-center"
                >
                  <PencilIcon className="h-5 w-5 mr-2" />
                  编辑客户
                </Link>
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
                { id: 'overview', label: '健康概览', icon: HeartIcon },
                { id: 'products', label: '产品使用', icon: CubeIcon },
                { id: 'goals', label: '健康目标', icon: CheckIcon },
                { id: 'analytics', label: '健康分析', icon: ChartBarIcon },
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
            {/* Health Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Basic Health Metrics */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">基本健康指标</h3>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">身高 (cm)</label>
                          <input
                            type="number"
                            className="mt-1 input"
                            value={customer.healthProfile?.height || ''}
                            onChange={(e) => handleSaveHealthProfile('healthProfile.height', parseInt(e.target.value) || null)}
                            placeholder="170"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">体重 (kg)</label>
                          <input
                            type="number"
                            step="0.1"
                            className="mt-1 input"
                            value={customer.healthProfile?.weight || ''}
                            onChange={(e) => handleSaveHealthProfile('healthProfile.weight', parseFloat(e.target.value) || null)}
                            placeholder="65.0"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-700">BMI</label>
                      <div className="mt-1">
                        {bmi ? (
                          <div>
                            <div className="text-2xl font-bold text-gray-900">{bmi}</div>
                            <div className={`text-sm font-medium ${bmiCategory?.color}`}>
                              {bmiCategory?.label}
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-400">需要身高体重</div>
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-700">血型</label>
                      <select
                        className="mt-1 input"
                        value={customer.healthProfile?.bloodType || ''}
                        onChange={(e) => handleSaveHealthProfile('healthProfile.bloodType', e.target.value)}
                      >
                        <option value="">选择血型</option>
                        <option value="A">A型</option>
                        <option value="B">B型</option>
                        <option value="AB">AB型</option>
                        <option value="O">O型</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Health Conditions */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">健康状况</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">慢性疾病</label>
                        <textarea
                          rows={3}
                          className="mt-1 input"
                          value={customer.healthProfile?.chronicConditions?.join('\n') || ''}
                          onChange={(e) => handleSaveHealthProfile('healthProfile.chronicConditions', 
                            e.target.value.split('\n').filter(item => item.trim())
                          )}
                          placeholder="每行输入一个疾病..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">过敏史</label>
                        <textarea
                          rows={3}
                          className="mt-1 input"
                          value={customer.healthProfile?.allergies?.join('\n') || ''}
                          onChange={(e) => handleSaveHealthProfile('healthProfile.allergies', 
                            e.target.value.split('\n').filter(item => item.trim())
                          )}
                          placeholder="每行输入一个过敏原..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">当前用药</label>
                        <textarea
                          rows={3}
                          className="mt-1 input"
                          value={customer.healthProfile?.currentMedications?.join('\n') || ''}
                          onChange={(e) => handleSaveHealthProfile('healthProfile.currentMedications', 
                            e.target.value.split('\n').filter(item => item.trim())
                          )}
                          placeholder="每行输入一个药物..."
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">饮食限制</h3>
                    <textarea
                      rows={8}
                      className="input"
                      value={customer.healthProfile?.dietaryRestrictions?.join('\n') || ''}
                      onChange={(e) => handleSaveHealthProfile('healthProfile.dietaryRestrictions', 
                        e.target.value.split('\n').filter(item => item.trim())
                      )}
                      placeholder="每行输入一个饮食限制..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Product Usage Tab */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">USANA产品使用记录</h3>
                  <button
                    onClick={() => setShowAddUsage(true)}
                    className="btn btn-primary btn-sm flex items-center"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    添加产品
                  </button>
                </div>

                {/* Add New Product Usage Form */}
                {showAddUsage && (
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h4 className="text-md font-medium text-gray-900 mb-4">添加新的产品使用记录</h4>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">产品 *</label>
                        <select
                          className="mt-1 input"
                          value={newUsage.productId || ''}
                          onChange={(e) => setNewUsage(prev => ({ ...prev, productId: e.target.value }))}
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
                        <label className="block text-sm font-medium text-gray-700">开始日期</label>
                        <input
                          type="date"
                          className="mt-1 input"
                          value={newUsage.startDate || ''}
                          onChange={(e) => setNewUsage(prev => ({ ...prev, startDate: e.target.value }))}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">剂量 *</label>
                        <input
                          type="text"
                          className="mt-1 input"
                          value={newUsage.dosage || ''}
                          onChange={(e) => setNewUsage(prev => ({ ...prev, dosage: e.target.value }))}
                          placeholder="如: 1片, 2粒"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">频率</label>
                        <select
                          className="mt-1 input"
                          value={newUsage.frequency || ''}
                          onChange={(e) => setNewUsage(prev => ({ ...prev, frequency: e.target.value }))}
                        >
                          {FREQUENCY_OPTIONS.map((freq) => (
                            <option key={freq} value={freq}>{freq}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">使用目的 *</label>
                        <input
                          type="text"
                          className="mt-1 input"
                          value={newUsage.purpose || ''}
                          onChange={(e) => setNewUsage(prev => ({ ...prev, purpose: e.target.value }))}
                          placeholder="如: 增强免疫力"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">效果评价</label>
                        <div className="mt-1">
                          {renderStars(newUsage.effectiveness || 3, (rating) => 
                            setNewUsage(prev => ({ ...prev, effectiveness: rating }))
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">服用依从性</label>
                        <select
                          className="mt-1 input"
                          value={newUsage.adherence || ''}
                          onChange={(e) => setNewUsage(prev => ({ ...prev, adherence: e.target.value as any }))}
                        >
                          {ADHERENCE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">剩余数量</label>
                        <input
                          type="number"
                          className="mt-1 input"
                          value={newUsage.remainingQuantity || ''}
                          onChange={(e) => setNewUsage(prev => ({ ...prev, remainingQuantity: parseInt(e.target.value) || undefined }))}
                          placeholder="剩余片数"
                        />
                      </div>

                      <div className="sm:col-span-2 lg:col-span-3">
                        <label className="block text-sm font-medium text-gray-700">副作用</label>
                        <textarea
                          rows={2}
                          className="mt-1 input"
                          value={newUsage.sideEffects || ''}
                          onChange={(e) => setNewUsage(prev => ({ ...prev, sideEffects: e.target.value }))}
                          placeholder="描述任何副作用..."
                        />
                      </div>

                      <div className="sm:col-span-2 lg:col-span-3">
                        <label className="block text-sm font-medium text-gray-700">备注</label>
                        <textarea
                          rows={2}
                          className="mt-1 input"
                          value={newUsage.notes || ''}
                          onChange={(e) => setNewUsage(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="其他备注..."
                        />
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="willContinue"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          checked={newUsage.willContinue || false}
                          onChange={(e) => setNewUsage(prev => ({ ...prev, willContinue: e.target.checked }))}
                        />
                        <label htmlFor="willContinue" className="ml-2 block text-sm text-gray-700">
                          计划继续使用
                        </label>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center space-x-3">
                      <button
                        onClick={handleAddProductUsage}
                        disabled={saving}
                        className="btn btn-primary"
                      >
                        {saving ? '保存中...' : '保存记录'}
                      </button>
                      <button
                        onClick={() => setShowAddUsage(false)}
                        className="btn btn-secondary"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                )}

                {/* Current Product Usage */}
                {customer.productUsage && customer.productUsage.length > 0 ? (
                  <div className="space-y-4">
                    {customer.productUsage.map((usage, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="text-lg font-medium text-gray-900">{usage.productName}</h4>
                            <p className="text-sm text-gray-600">产品代码: {usage.productCode}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setEditingUsage(editingUsage === index.toString() ? null : index.toString())}
                              className="text-primary-600 hover:text-primary-800"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleRemoveProductUsage(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">使用期间</label>
                            <div className="mt-1 text-sm text-gray-900">
                              {usage.startDate ? new Date(usage.startDate).toLocaleDateString('zh-CN') : 'N/A'}
                              {usage.endDate && ` - ${new Date(usage.endDate).toLocaleDateString('zh-CN')}`}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">剂量 & 频率</label>
                            {editingUsage === index.toString() ? (
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  className="input"
                                  value={usage.dosage}
                                  onChange={(e) => handleUpdateProductUsage(index, 'dosage', e.target.value)}
                                  placeholder="剂量"
                                />
                                <select
                                  className="input"
                                  value={usage.frequency}
                                  onChange={(e) => handleUpdateProductUsage(index, 'frequency', e.target.value)}
                                >
                                  {FREQUENCY_OPTIONS.map((freq) => (
                                    <option key={freq} value={freq}>{freq}</option>
                                  ))}
                                </select>
                              </div>
                            ) : (
                              <div className="mt-1 text-sm text-gray-900">
                                {usage.dosage} - {usage.frequency}
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">使用目的</label>
                            {editingUsage === index.toString() ? (
                              <input
                                type="text"
                                className="input"
                                value={usage.purpose}
                                onChange={(e) => handleUpdateProductUsage(index, 'purpose', e.target.value)}
                              />
                            ) : (
                              <div className="mt-1 text-sm text-gray-900">{usage.purpose}</div>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">效果评价</label>
                            {editingUsage === index.toString() ? (
                              <div className="mt-1">
                                {renderStars(usage.effectiveness, (rating) => 
                                  handleUpdateProductUsage(index, 'effectiveness', rating)
                                )}
                              </div>
                            ) : (
                              <div className="mt-1">
                                {renderStars(usage.effectiveness)}
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">服用依从性</label>
                            {editingUsage === index.toString() ? (
                              <select
                                className="input"
                                value={usage.adherence}
                                onChange={(e) => handleUpdateProductUsage(index, 'adherence', e.target.value)}
                              >
                                {ADHERENCE_OPTIONS.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <div className="mt-1">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAdherenceDisplay(usage.adherence).color}`}>
                                  {getAdherenceDisplay(usage.adherence).label}
                                </span>
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">剩余数量</label>
                            {editingUsage === index.toString() ? (
                              <input
                                type="number"
                                className="input"
                                value={usage.remainingQuantity || ''}
                                onChange={(e) => handleUpdateProductUsage(index, 'remainingQuantity', parseInt(e.target.value) || null)}
                              />
                            ) : (
                              <div className="mt-1 text-sm text-gray-900">
                                {usage.remainingQuantity || 'N/A'}
                                {usage.remainingQuantity && usage.remainingQuantity < 10 && (
                                  <ExclamationTriangleIcon className="inline h-4 w-4 text-orange-500 ml-1" />
                                )}
                              </div>
                            )}
                          </div>

                          {usage.sideEffects && (
                            <div className="sm:col-span-2 lg:col-span-3">
                              <label className="block text-sm font-medium text-gray-700">副作用</label>
                              {editingUsage === index.toString() ? (
                                <textarea
                                  rows={2}
                                  className="input"
                                  value={usage.sideEffects}
                                  onChange={(e) => handleUpdateProductUsage(index, 'sideEffects', e.target.value)}
                                />
                              ) : (
                                <div className="mt-1 text-sm text-gray-900">{usage.sideEffects}</div>
                              )}
                            </div>
                          )}

                          {usage.notes && (
                            <div className="sm:col-span-2 lg:col-span-3">
                              <label className="block text-sm font-medium text-gray-700">备注</label>
                              {editingUsage === index.toString() ? (
                                <textarea
                                  rows={2}
                                  className="input"
                                  value={usage.notes}
                                  onChange={(e) => handleUpdateProductUsage(index, 'notes', e.target.value)}
                                />
                              ) : (
                                <div className="mt-1 text-sm text-gray-900">{usage.notes}</div>
                              )}
                            </div>
                          )}

                          <div className="flex items-center">
                            {editingUsage === index.toString() ? (
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                  checked={usage.willContinue}
                                  onChange={(e) => handleUpdateProductUsage(index, 'willContinue', e.target.checked)}
                                />
                                <label className="ml-2 block text-sm text-gray-700">
                                  计划继续使用
                                </label>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                {usage.willContinue ? (
                                  <CheckIcon className="h-5 w-5 text-green-500" />
                                ) : (
                                  <XMarkIcon className="h-5 w-5 text-red-500" />
                                )}
                                <span className="ml-2 text-sm text-gray-700">
                                  {usage.willContinue ? '计划继续使用' : '不再使用'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CubeIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">暂无产品使用记录</h3>
                    <p className="mt-1 text-sm text-gray-500">开始添加USANA产品使用记录来跟踪健康效果</p>
                  </div>
                )}
              </div>
            )}

            {/* Health Goals Tab */}
            {activeTab === 'goals' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">健康目标管理</h3>
                  <button
                    onClick={() => setEditingGoals(!editingGoals)}
                    className="btn btn-primary btn-sm flex items-center"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    {editingGoals ? '保存目标' : '编辑目标'}
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* Health Goals */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">健康目标</label>
                    {editingGoals ? (
                      <div className="space-y-2">
                        {HEALTH_GOAL_OPTIONS.map((goal) => (
                          <div key={goal} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`goal-${goal}`}
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                              checked={tempGoals.includes(goal)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setTempGoals([...tempGoals, goal])
                                } else {
                                  setTempGoals(tempGoals.filter(g => g !== goal))
                                }
                              }}
                            />
                            <label htmlFor={`goal-${goal}`} className="ml-2 block text-sm text-gray-700">
                              {goal}
                            </label>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            handleSaveHealthProfile('healthProfile.healthGoals', tempGoals)
                            setEditingGoals(false)
                          }}
                          className="btn btn-primary btn-sm mt-3"
                        >
                          保存健康目标
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {customer.healthProfile?.healthGoals && customer.healthProfile.healthGoals.length > 0 ? (
                          customer.healthProfile.healthGoals.map((goal, index) => (
                            <span
                              key={index}
                              className="inline-flex px-3 py-1 text-sm font-medium bg-primary-100 text-primary-800 rounded-full mr-2 mb-2"
                            >
                              {goal}
                            </span>
                          ))
                        ) : (
                          <p className="text-gray-500">暂未设置健康目标</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Health Concerns */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">健康关注点</label>
                    {editingConcerns ? (
                      <div className="space-y-2">
                        {HEALTH_CONCERN_OPTIONS.map((concern) => (
                          <div key={concern} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`concern-${concern}`}
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                              checked={tempConcerns.includes(concern)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setTempConcerns([...tempConcerns, concern])
                                } else {
                                  setTempConcerns(tempConcerns.filter(c => c !== concern))
                                }
                              }}
                            />
                            <label htmlFor={`concern-${concern}`} className="ml-2 block text-sm text-gray-700">
                              {concern}
                            </label>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            handleSaveHealthProfile('interests.healthConcerns', tempConcerns)
                            setEditingConcerns(false)
                          }}
                          className="btn btn-primary btn-sm mt-3"
                        >
                          保存健康关注点
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {customer.interests?.healthConcerns && customer.interests.healthConcerns.length > 0 ? (
                          customer.interests.healthConcerns.map((concern, index) => (
                            <span
                              key={index}
                              className="inline-flex px-3 py-1 text-sm font-medium bg-orange-100 text-orange-800 rounded-full mr-2 mb-2"
                            >
                              {concern}
                            </span>
                          ))
                        ) : (
                          <div>
                            <p className="text-gray-500 mb-3">暂未设置健康关注点</p>
                            <button
                              onClick={() => setEditingConcerns(true)}
                              className="btn btn-secondary btn-sm"
                            >
                              添加关注点
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Interests */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">感兴趣的产品类别</label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                    {PRODUCT_CATEGORIES.map((category) => (
                      <div key={category} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`category-${category}`}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          checked={customer.interests?.productCategories?.includes(category) || false}
                          onChange={(e) => {
                            const currentCategories = customer.interests?.productCategories || []
                            const newCategories = e.target.checked
                              ? [...currentCategories, category]
                              : currentCategories.filter(c => c !== category)
                            handleSaveHealthProfile('interests.productCategories', newCategories)
                          }}
                        />
                        <label htmlFor={`category-${category}`} className="ml-2 block text-sm text-gray-700">
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Purchase Preferences */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">预算范围</label>
                    <select
                      className="mt-1 input"
                      value={customer.interests?.budgetRange || ''}
                      onChange={(e) => handleSaveHealthProfile('interests.budgetRange', e.target.value)}
                    >
                      <option value="">选择预算范围</option>
                      <option value="under_500">500元以下</option>
                      <option value="500_1000">500-1000元</option>
                      <option value="1000_2000">1000-2000元</option>
                      <option value="2000_5000">2000-5000元</option>
                      <option value="over_5000">5000元以上</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">购买频率</label>
                    <select
                      className="mt-1 input"
                      value={customer.interests?.purchaseFrequency || ''}
                      onChange={(e) => handleSaveHealthProfile('interests.purchaseFrequency', e.target.value)}
                    >
                      <option value="">选择购买频率</option>
                      <option value="monthly">每月</option>
                      <option value="quarterly">每季度</option>
                      <option value="semi_annually">每半年</option>
                      <option value="annually">每年</option>
                      <option value="irregular">不定期</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Health Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">健康数据分析</h3>
                
                {/* Product Effectiveness Overview */}
                {customer.productUsage && customer.productUsage.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">产品效果概览</h4>
                    <div className="space-y-4">
                      {customer.productUsage.map((usage, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900">{usage.productName}</div>
                            <div className="text-sm text-gray-600">{usage.purpose}</div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-sm">
                              <span className="text-gray-600">效果:</span>
                              <span className={`ml-1 font-medium ${getEffectivenessColor(usage.effectiveness)}`}>
                                {usage.effectiveness}/5
                              </span>
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-600">依从性:</span>
                              <span className={`ml-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAdherenceDisplay(usage.adherence).color}`}>
                                {getAdherenceDisplay(usage.adherence).label.split(' ')[0]}
                              </span>
                            </div>
                            <div className="text-sm">
                              {usage.willContinue ? (
                                <span className="text-green-600 font-medium">继续使用</span>
                              ) : (
                                <span className="text-red-600 font-medium">停止使用</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Summary Stats */}
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">
                            {(customer.productUsage.reduce((sum, usage) => sum + usage.effectiveness, 0) / customer.productUsage.length).toFixed(1)}
                          </div>
                          <div className="text-sm text-gray-600">平均效果评分</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">
                            {customer.productUsage.filter(usage => usage.willContinue).length}
                          </div>
                          <div className="text-sm text-gray-600">继续使用产品数</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">
                            {customer.productUsage.filter(usage => usage.adherence === 'excellent' || usage.adherence === 'good').length}
                          </div>
                          <div className="text-sm text-gray-600">良好依从性产品数</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Health Profile Summary */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">健康档案汇总</h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="text-sm font-medium text-blue-800">健康目标</div>
                      <div className="text-2xl font-bold text-blue-900">
                        {customer.healthProfile?.healthGoals?.length || 0}
                      </div>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <div className="text-sm font-medium text-orange-800">健康关注点</div>
                      <div className="text-2xl font-bold text-orange-900">
                        {customer.interests?.healthConcerns?.length || 0}
                      </div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="text-sm font-medium text-green-800">在用产品</div>
                      <div className="text-2xl font-bold text-green-900">
                        {customer.productUsage?.filter(usage => usage.willContinue).length || 0}
                      </div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="text-sm font-medium text-purple-800">慢性疾病</div>
                      <div className="text-2xl font-bold text-purple-900">
                        {customer.healthProfile?.chronicConditions?.length || 0}
                      </div>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg">
                      <div className="text-sm font-medium text-red-800">过敏史</div>
                      <div className="text-2xl font-bold text-red-900">
                        {customer.healthProfile?.allergies?.length || 0}
                      </div>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <div className="text-sm font-medium text-yellow-800">当前用药</div>
                      <div className="text-2xl font-bold text-yellow-900">
                        {customer.healthProfile?.currentMedications?.length || 0}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">健康建议</h4>
                  <div className="space-y-3">
                    {customer.productUsage && customer.productUsage.some(usage => usage.effectiveness < 3) && (
                      <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                          <div className="font-medium text-yellow-800">产品效果关注</div>
                          <div className="text-sm text-yellow-700">
                            有部分产品效果评分较低，建议与客户沟通调整剂量或更换产品
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {customer.productUsage && customer.productUsage.some(usage => usage.adherence === 'poor' || usage.adherence === 'fair') && (
                      <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                        <InformationCircleIcon className="h-5 w-5 text-orange-600 mt-0.5" />
                        <div>
                          <div className="font-medium text-orange-800">服用依从性提醒</div>
                          <div className="text-sm text-orange-700">
                            客户的产品服用依从性需要改善，建议提供更多使用指导
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {bmi && (parseFloat(bmi) < 18.5 || parseFloat(bmi) > 25) && (
                      <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                        <HeartIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <div className="font-medium text-blue-800">BMI关注</div>
                          <div className="text-sm text-blue-700">
                            客户BMI为{bmi}({bmiCategory?.label})，建议关注体重管理相关产品
                          </div>
                        </div>
                      </div>
                    )}

                    {(!customer.healthProfile?.healthGoals || customer.healthProfile.healthGoals.length === 0) && (
                      <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <CheckIcon className="h-5 w-5 text-gray-600 mt-0.5" />
                        <div>
                          <div className="font-medium text-gray-800">健康目标设置</div>
                          <div className="text-sm text-gray-700">
                            建议与客户一起设置明确的健康目标，以制定更精准的产品推荐方案
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}