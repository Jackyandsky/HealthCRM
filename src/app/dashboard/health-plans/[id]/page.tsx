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
  PencilIcon,
  TrashIcon,
  DocumentTextIcon,
  ChartBarIcon,
  StarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  TagIcon,
  BanknotesIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

interface HealthPlan {
  _id: string
  planId: string
  customerId: any
  customerName: string
  customerEmail?: string
  customerPhone?: string
  assignedToId: any
  assignedToName: string
  createdById: any
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
      bmi?: string
      weight?: string
      height?: string
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

  healthGoals: Array<{
    category: string
    description: string
    targetValue?: string
    currentValue?: string
    targetDate?: string
    priority: string
    status: string
    progress: {
      percentage: number
      milestones?: Array<{
        description: string
        targetDate?: string
        completedDate?: string
        status: string
      }>
    }
    notes?: string
  }>

  productRecommendations: Array<{
    productId: any
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
      unit: string
    }
    purpose: string[]
    priority: string
    estimatedCost?: {
      retail: number
      wholesale: number
      preferredCustomer: number
    }
    notes?: string
  }>

  timeline: {
    startDate: string
    endDate?: string
    reviewDates: string[]
    milestones: Array<{
      title: string
      description: string
      targetDate?: string
      completedDate?: string
      status: string
    }>
  }

  costAnalysis: {
    estimatedMonthlyCost: {
      retail: number
      wholesale: number
      preferredCustomer: number
    }
    totalEstimatedCost: {
      retail: number
      wholesale: number
      preferredCustomer: number
    }
  }

  progress: {
    overallProgress: number
    goalsAchieved: number
    totalGoals: number
    complianceRate: number
    lastReviewDate?: string
    nextReviewDate?: string
    adherenceNotes?: string
  }

  feedback: Array<{
    date: string
    type: string
    category: string
    rating?: number
    content: string
    responseRequired: boolean
    response?: string
    providedBy?: any
  }>

  notes: {
    public?: string
    private?: string
    instructions?: string
    warnings?: string
  }

  tags: string[]
  templateId?: any
  templateName?: string
  
  createdAt: string
  updatedAt: string
}

const PLAN_TYPES: { [key: string]: string } = {
  basic: '基础计划',
  comprehensive: '综合计划',
  specialized: '专项计划',
  maintenance: '维护计划',
  intensive: '强化计划',
}

const PRIORITY_COLORS: { [key: string]: string } = {
  urgent: 'bg-red-100 text-red-800',
  high: 'bg-orange-100 text-orange-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-green-100 text-green-800',
}

const PRIORITY_LABELS: { [key: string]: string } = {
  urgent: '紧急',
  high: '高',
  medium: '中',
  low: '低',
}

const STATUS_COLORS: { [key: string]: string } = {
  draft: 'bg-gray-100 text-gray-800',
  active: 'bg-blue-100 text-blue-800',
  paused: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  review_needed: 'bg-purple-100 text-purple-800',
}

const STATUS_LABELS: { [key: string]: string } = {
  draft: '草稿',
  active: '进行中',
  paused: '暂停',
  completed: '已完成',
  cancelled: '已取消',
  review_needed: '需要复查',
}

const HEALTH_GOAL_CATEGORIES: { [key: string]: string } = {
  weight_management: '体重管理',
  immune_support: '免疫支持',
  energy_vitality: '能量活力',
  heart_health: '心脏健康',
  digestive_health: '消化健康',
  bone_joint_health: '骨骼关节',
  brain_cognitive: '大脑认知',
  skin_beauty: '皮肤美容',
  sports_performance: '运动表现',
  stress_management: '压力管理',
  sleep_quality: '睡眠质量',
  anti_aging: '抗衰老',
  detox_cleanse: '排毒净化',
  hormonal_balance: '荷尔蒙平衡',
  other: '其他',
}

const PRODUCT_PRIORITIES: { [key: string]: { label: string; color: string } } = {
  essential: { label: '必需', color: 'bg-red-100 text-red-800' },
  recommended: { label: '推荐', color: 'bg-yellow-100 text-yellow-800' },
  optional: { label: '可选', color: 'bg-green-100 text-green-800' },
}

export default function HealthPlanDetailPage({ params }: { params: { id: string } }) {
  const [healthPlan, setHealthPlan] = useState<HealthPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [priceType, setPriceType] = useState<'retail' | 'wholesale' | 'preferredCustomer'>('retail')
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth/login')
      return
    }
    
    loadHealthPlan()
  }, [params.id])

  const loadHealthPlan = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      const response = await fetch(`/api/health-plans/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setHealthPlan(data.data)
      } else {
        router.push('/dashboard/health-plans')
      }
    } catch (error) {
      console.error('Error loading health plan:', error)
      router.push('/dashboard/health-plans')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!healthPlan || !confirm(`确定要删除健康计划 "${healthPlan.planId}" 吗？`)) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/health-plans/${healthPlan._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        router.push('/dashboard/health-plans')
      } else {
        const data = await response.json()
        alert(data.message || '删除失败')
      }
    } catch (error) {
      console.error('Error deleting health plan:', error)
      alert('删除失败')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN')
  }

  const isReviewNeeded = (plan: HealthPlan) => {
    if (plan.status === 'review_needed') return true
    if (plan.progress.nextReviewDate) {
      return new Date(plan.progress.nextReviewDate) <= new Date()
    }
    return false
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star}>
            {star <= rating ? (
              <StarIconSolid className="h-5 w-5 text-yellow-400" />
            ) : (
              <StarIcon className="h-5 w-5 text-gray-300" />
            )}
          </span>
        ))}
        <span className="ml-2 text-sm text-gray-600">({rating}/5)</span>
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

  if (!healthPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">健康计划未找到</h2>
          <Link href="/dashboard/health-plans" className="mt-4 btn btn-primary">
            返回健康计划列表
          </Link>
        </div>
      </div>
    )
  }

  const reviewNeeded = isReviewNeeded(healthPlan)

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
                  <div className="flex items-center space-x-3">
                    <h1 className="text-2xl font-bold text-gray-900">{healthPlan.title}</h1>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${STATUS_COLORS[healthPlan.status]}`}>
                      {STATUS_LABELS[healthPlan.status]}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${PRIORITY_COLORS[healthPlan.priority]}`}>
                      {PRIORITY_LABELS[healthPlan.priority]}
                    </span>
                    {reviewNeeded && (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        需复查
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    计划编号: {healthPlan.planId} | 类型: {PLAN_TYPES[healthPlan.planType]}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Link
                  href={`/dashboard/health-plans/${healthPlan._id}/edit`}
                  className="btn btn-secondary flex items-center"
                >
                  <PencilIcon className="h-5 w-5 mr-2" />
                  编辑
                </Link>
                {healthPlan.status !== 'completed' && (
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
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Progress Overview */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <ChartBarIcon className="h-5 w-5 mr-2" />
                  进度概览
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{healthPlan.progress.overallProgress}%</div>
                    <div className="text-sm text-gray-500">总体进度</div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${healthPlan.progress.overallProgress}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {healthPlan.progress.goalsAchieved}/{healthPlan.progress.totalGoals}
                    </div>
                    <div className="text-sm text-gray-500">已达成目标</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">{healthPlan.progress.complianceRate}%</div>
                    <div className="text-sm text-gray-500">依从率</div>
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
              <div className="p-6 space-y-6">
                {/* Current Health */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">当前健康状况</h4>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="text-center p-3 border border-gray-200 rounded-lg">
                      <div className="text-lg font-semibold text-gray-900">
                        {healthPlan.healthAssessment.currentHealth.overall_rating || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">整体健康</div>
                    </div>
                    <div className="text-center p-3 border border-gray-200 rounded-lg">
                      <div className="text-lg font-semibold text-gray-900">
                        {healthPlan.healthAssessment.currentHealth.energy_level || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">能量水平</div>
                    </div>
                    <div className="text-center p-3 border border-gray-200 rounded-lg">
                      <div className="text-lg font-semibold text-gray-900">
                        {healthPlan.healthAssessment.currentHealth.stress_level || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">压力水平</div>
                    </div>
                    <div className="text-center p-3 border border-gray-200 rounded-lg">
                      <div className="text-lg font-semibold text-gray-900">
                        {healthPlan.healthAssessment.currentHealth.sleep_quality || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">睡眠质量</div>
                    </div>
                  </div>
                  
                  {(healthPlan.healthAssessment.currentHealth.weight || healthPlan.healthAssessment.currentHealth.height || healthPlan.healthAssessment.currentHealth.bmi) && (
                    <div className="mt-4 grid grid-cols-3 gap-4">
                      {healthPlan.healthAssessment.currentHealth.height && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">身高</dt>
                          <dd className="mt-1 text-sm text-gray-900">{healthPlan.healthAssessment.currentHealth.height} cm</dd>
                        </div>
                      )}
                      {healthPlan.healthAssessment.currentHealth.weight && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">体重</dt>
                          <dd className="mt-1 text-sm text-gray-900">{healthPlan.healthAssessment.currentHealth.weight} kg</dd>
                        </div>
                      )}
                      {healthPlan.healthAssessment.currentHealth.bmi && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">BMI</dt>
                          <dd className="mt-1 text-sm text-gray-900">{healthPlan.healthAssessment.currentHealth.bmi}</dd>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Medical History */}
                {(healthPlan.healthAssessment.medicalHistory.conditions?.length || 
                  healthPlan.healthAssessment.medicalHistory.medications?.length || 
                  healthPlan.healthAssessment.medicalHistory.allergies?.length) && (
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">病史信息</h4>
                    <div className="space-y-3">
                      {healthPlan.healthAssessment.medicalHistory.conditions && healthPlan.healthAssessment.medicalHistory.conditions.length > 0 && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">健康状况</dt>
                          <dd className="mt-1">
                            <div className="flex flex-wrap gap-1">
                              {healthPlan.healthAssessment.medicalHistory.conditions.map((condition, index) => (
                                <span key={index} className="inline-flex px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                                  {condition}
                                </span>
                              ))}
                            </div>
                          </dd>
                        </div>
                      )}
                      {healthPlan.healthAssessment.medicalHistory.medications && healthPlan.healthAssessment.medicalHistory.medications.length > 0 && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">当前用药</dt>
                          <dd className="mt-1">
                            <div className="flex flex-wrap gap-1">
                              {healthPlan.healthAssessment.medicalHistory.medications.map((medication, index) => (
                                <span key={index} className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                  {medication}
                                </span>
                              ))}
                            </div>
                          </dd>
                        </div>
                      )}
                      {healthPlan.healthAssessment.medicalHistory.allergies && healthPlan.healthAssessment.medicalHistory.allergies.length > 0 && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">过敏信息</dt>
                          <dd className="mt-1">
                            <div className="flex flex-wrap gap-1">
                              {healthPlan.healthAssessment.medicalHistory.allergies.map((allergy, index) => (
                                <span key={index} className="inline-flex px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                  {allergy}
                                </span>
                              ))}
                            </div>
                          </dd>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Nutritional Deficiencies */}
                {healthPlan.healthAssessment.nutritionalDeficiencies && healthPlan.healthAssessment.nutritionalDeficiencies.length > 0 && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">营养缺乏</dt>
                    <dd className="mt-1">
                      <div className="flex flex-wrap gap-1">
                        {healthPlan.healthAssessment.nutritionalDeficiencies.map((deficiency, index) => (
                          <span key={index} className="inline-flex px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                            {deficiency}
                          </span>
                        ))}
                      </div>
                    </dd>
                  </div>
                )}
              </div>
            </div>

            {/* Health Goals */}
            {healthPlan.healthGoals && healthPlan.healthGoals.length > 0 && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <ChartBarIcon className="h-5 w-5 mr-2" />
                    健康目标
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {healthPlan.healthGoals.map((goal, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-medium text-gray-900">{goal.description}</h4>
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                {HEALTH_GOAL_CATEGORIES[goal.category] || goal.category}
                              </span>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                goal.status === 'achieved' ? 'bg-green-100 text-green-800' :
                                goal.status === 'active' ? 'bg-blue-100 text-blue-800' :
                                goal.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {goal.status === 'achieved' ? '已达成' :
                                 goal.status === 'active' ? '进行中' :
                                 goal.status === 'paused' ? '暂停' : '已取消'}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 text-sm text-gray-600">
                              {goal.currentValue && (
                                <div>
                                  <span className="font-medium">当前值:</span> {goal.currentValue}
                                </div>
                              )}
                              {goal.targetValue && (
                                <div>
                                  <span className="font-medium">目标值:</span> {goal.targetValue}
                                </div>
                              )}
                              {goal.targetDate && (
                                <div>
                                  <span className="font-medium">目标日期:</span> {formatDate(goal.targetDate)}
                                </div>
                              )}
                            </div>
                            {goal.notes && (
                              <p className="mt-2 text-sm text-gray-600">{goal.notes}</p>
                            )}
                          </div>
                          <div className="ml-4 text-center">
                            <div className="text-lg font-semibold text-gray-900">{goal.progress.percentage}%</div>
                            <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${goal.progress.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Product Recommendations */}
            {healthPlan.productRecommendations && healthPlan.productRecommendations.length > 0 && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <CubeIcon className="h-5 w-5 mr-2" />
                      产品推荐
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">价格类型:</span>
                      <select
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                        value={priceType}
                        onChange={(e) => setPriceType(e.target.value as any)}
                      >
                        <option value="retail">零售价</option>
                        <option value="wholesale">批发价</option>
                        <option value="preferredCustomer">优选客户价</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {healthPlan.productRecommendations.map((recommendation, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-medium text-gray-900">{recommendation.productName}</h4>
                              <span className="text-sm text-gray-500">({recommendation.productCode})</span>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                PRODUCT_PRIORITIES[recommendation.priority]?.color || 'bg-gray-100 text-gray-800'
                              }`}>
                                {PRODUCT_PRIORITIES[recommendation.priority]?.label || recommendation.priority}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4 text-sm">
                              <div>
                                <span className="font-medium text-gray-500">用量:</span> {recommendation.dosage}
                              </div>
                              <div>
                                <span className="font-medium text-gray-500">早中晚:</span> {recommendation.frequency.morning}-{recommendation.frequency.afternoon}-{recommendation.frequency.evening}
                              </div>
                              <div>
                                <span className="font-medium text-gray-500">持续时间:</span> {recommendation.duration.value} {
                                  recommendation.duration.unit === 'months' ? '月' :
                                  recommendation.duration.unit === 'weeks' ? '周' : '天'
                                }
                              </div>
                              {recommendation.estimatedCost && (
                                <div>
                                  <span className="font-medium text-gray-500">月费用:</span> ¥{recommendation.estimatedCost[priceType]}
                                </div>
                              )}
                            </div>
                            {recommendation.purpose && recommendation.purpose.length > 0 && (
                              <div className="mt-2">
                                <span className="font-medium text-gray-500">用途:</span>
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {recommendation.purpose.map((purpose, i) => (
                                    <span key={i} className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                      {purpose}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {recommendation.notes && (
                              <p className="mt-2 text-sm text-gray-600">{recommendation.notes}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Feedback */}
            {healthPlan.feedback && healthPlan.feedback.length > 0 && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">客户反馈</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {healthPlan.feedback.map((feedback, index) => (
                      <div key={index} className="border-l-4 border-blue-400 pl-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">
                              {feedback.type === 'customer' ? '客户反馈' : feedback.type === 'provider' ? '服务商反馈' : '系统反馈'}
                            </span>
                            {feedback.rating && renderStars(feedback.rating)}
                          </div>
                          <span className="text-sm text-gray-500">{formatDateTime(feedback.date)}</span>
                        </div>
                        <p className="mt-1 text-sm text-gray-700">{feedback.content}</p>
                        {feedback.response && (
                          <div className="mt-2 p-2 bg-gray-50 rounded">
                            <p className="text-sm text-gray-600"><strong>回复:</strong> {feedback.response}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            {(healthPlan.notes.public || healthPlan.notes.instructions || healthPlan.notes.private || healthPlan.notes.warnings) && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <DocumentTextIcon className="h-5 w-5 mr-2" />
                    备注信息
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  {healthPlan.notes.public && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">公开备注</dt>
                      <dd className="mt-1 text-sm text-gray-900 bg-blue-50 p-3 rounded-md">
                        {healthPlan.notes.public}
                      </dd>
                    </div>
                  )}
                  {healthPlan.notes.instructions && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">使用说明</dt>
                      <dd className="mt-1 text-sm text-gray-900 bg-green-50 p-3 rounded-md">
                        {healthPlan.notes.instructions}
                      </dd>
                    </div>
                  )}
                  {healthPlan.notes.warnings && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">重要提醒</dt>
                      <dd className="mt-1 text-sm text-gray-900 bg-red-50 p-3 rounded-md">
                        {healthPlan.notes.warnings}
                      </dd>
                    </div>
                  )}
                  {healthPlan.notes.private && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">内部备注</dt>
                      <dd className="mt-1 text-sm text-gray-900 bg-yellow-50 p-3 rounded-md">
                        {healthPlan.notes.private}
                      </dd>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">快速操作</h3>
              </div>
              <div className="p-6 space-y-3">
                {healthPlan.customerPhone && (
                  <a
                    href={`tel:${healthPlan.customerPhone}`}
                    className="w-full btn btn-secondary flex items-center justify-center"
                  >
                    <PhoneIcon className="h-4 w-4 mr-2" />
                    拨打电话
                  </a>
                )}
                {healthPlan.customerEmail && (
                  <a
                    href={`mailto:${healthPlan.customerEmail}`}
                    className="w-full btn btn-secondary flex items-center justify-center"
                  >
                    <EnvelopeIcon className="h-4 w-4 mr-2" />
                    发送邮件
                  </a>
                )}
                <Link
                  href={`/dashboard/customers/${healthPlan.customerId?._id || healthPlan.customerId}`}
                  className="w-full btn btn-secondary flex items-center justify-center"
                >
                  <UserIcon className="h-4 w-4 mr-2" />
                  查看客户
                </Link>
              </div>
            </div>

            {/* Basic Info */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">基本信息</h3>
              </div>
              <div className="p-6">
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">客户姓名</dt>
                    <dd className="mt-1 text-sm text-gray-900">{healthPlan.customerName}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">负责人</dt>
                    <dd className="mt-1 text-sm text-gray-900">{healthPlan.assignedToName}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">创建人</dt>
                    <dd className="mt-1 text-sm text-gray-900">{healthPlan.createdByName}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">创建时间</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatDateTime(healthPlan.createdAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">最后更新</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatDateTime(healthPlan.updatedAt)}</dd>
                  </div>
                  {healthPlan.templateName && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">使用模板</dt>
                      <dd className="mt-1 text-sm text-gray-900">{healthPlan.templateName}</dd>
                    </div>
                  )}
                </dl>
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
              <div className="p-6">
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">开始日期</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatDate(healthPlan.timeline.startDate)}</dd>
                  </div>
                  {healthPlan.timeline.endDate && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">结束日期</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formatDate(healthPlan.timeline.endDate)}</dd>
                    </div>
                  )}
                  {healthPlan.progress.nextReviewDate && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">下次复查</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formatDate(healthPlan.progress.nextReviewDate)}</dd>
                    </div>
                  )}
                  {healthPlan.progress.lastReviewDate && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">上次复查</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formatDate(healthPlan.progress.lastReviewDate)}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            {/* Cost Analysis */}
            {healthPlan.costAnalysis && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <BanknotesIcon className="h-5 w-5 mr-2" />
                    费用分析
                  </h3>
                </div>
                <div className="p-6">
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">月费用 ({priceType === 'retail' ? '零售价' : priceType === 'wholesale' ? '批发价' : '优选客户价'})</dt>
                      <dd className="mt-1 text-lg font-semibold text-gray-900">
                        ¥{healthPlan.costAnalysis.estimatedMonthlyCost[priceType]?.toFixed(2) || '0.00'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">总费用</dt>
                      <dd className="mt-1 text-lg font-semibold text-gray-900">
                        ¥{healthPlan.costAnalysis.totalEstimatedCost[priceType]?.toFixed(2) || '0.00'}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}

            {/* Tags */}
            {healthPlan.tags && healthPlan.tags.length > 0 && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <TagIcon className="h-5 w-5 mr-2" />
                    标签
                  </h3>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-2">
                    {healthPlan.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {tag}
                      </span>
                    ))}
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