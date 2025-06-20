'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentTextIcon,
  UserIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CubeIcon,
  HeartIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

interface HealthPlan {
  _id: string
  planId: string
  customerId: any
  customerName: string
  assignedToId: any
  assignedToName: string
  title: string
  description?: string
  planType: string
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled' | 'review_needed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  timeline: {
    startDate: string
    endDate?: string
  }
  progress: {
    overallProgress: number
    goalsAchieved: number
    totalGoals: number
    complianceRate: number
    nextReviewDate?: string
  }
  costAnalysis: {
    estimatedMonthlyCost: {
      retail: number
      wholesale: number
      preferredCustomer: number
    }
  }
  healthGoals: any[]
  productRecommendations: any[]
  createdAt: string
  updatedAt: string
}

interface HealthPlanSummary {
  totalPlans: number
  activePlans: number
  draftPlans: number
  completedPlans: number
  reviewNeeded: number
  averageProgress: number
  totalEstimatedCost: number
}

const PLAN_TYPES = [
  { value: 'basic', label: '基础计划', icon: DocumentTextIcon },
  { value: 'comprehensive', label: '综合计划', icon: CubeIcon },
  { value: 'specialized', label: '专项计划', icon: HeartIcon },
  { value: 'maintenance', label: '维护计划', icon: CheckCircleIcon },
  { value: 'intensive', label: '强化计划', icon: SparklesIcon },
]

const PRIORITY_OPTIONS = [
  { value: 'urgent', label: '紧急', color: 'bg-red-100 text-red-800' },
  { value: 'high', label: '高', color: 'bg-orange-100 text-orange-800' },
  { value: 'medium', label: '中', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'low', label: '低', color: 'bg-green-100 text-green-800' },
]

const STATUS_OPTIONS = [
  { value: 'draft', label: '草稿', color: 'bg-gray-100 text-gray-800' },
  { value: 'active', label: '进行中', color: 'bg-blue-100 text-blue-800' },
  { value: 'paused', label: '暂停', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'completed', label: '已完成', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: '已取消', color: 'bg-red-100 text-red-800' },
  { value: 'review_needed', label: '需要复查', color: 'bg-purple-100 text-purple-800' },
]

export default function HealthPlansPage() {
  const [healthPlans, setHealthPlans] = useState<HealthPlan[]>([])
  const [summary, setSummary] = useState<HealthPlanSummary>({
    totalPlans: 0,
    activePlans: 0,
    draftPlans: 0,
    completedPlans: 0,
    reviewNeeded: 0,
    averageProgress: 0,
    totalEstimatedCost: 0,
  })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [planTypeFilter, setPlanTypeFilter] = useState('')
  const [needsReview, setNeedsReview] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth/login')
      return
    }
    
    loadHealthPlans()
  }, [currentPage, search, statusFilter, priorityFilter, planTypeFilter, needsReview])

  const loadHealthPlans = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
      })
      
      if (search) params.append('search', search)
      if (statusFilter) params.append('status', statusFilter)
      if (priorityFilter) params.append('priority', priorityFilter)
      if (planTypeFilter) params.append('planType', planTypeFilter)
      if (needsReview) params.append('needsReview', 'true')
      
      const response = await fetch(`/api/health-plans?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setHealthPlans(data.data.healthPlans)
        setTotalPages(data.data.pagination.totalPages)
        setTotalCount(data.data.pagination.totalCount)
        setSummary(data.data.summary)
      }
    } catch (error) {
      console.error('Error loading health plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (planId: string, planCode: string) => {
    if (!confirm(`确定要删除健康计划 "${planCode}" 吗？`)) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/health-plans/${planId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        loadHealthPlans()
      } else {
        const data = await response.json()
        alert(data.message || '删除失败')
      }
    } catch (error) {
      console.error('Error deleting health plan:', error)
      alert('删除失败')
    }
  }

  const getOptionDisplay = (value: string, options: any[]) => {
    const option = options.find(opt => opt.value === value)
    return option || { label: value, color: 'bg-gray-100 text-gray-800' }
  }

  const getPlanTypeDisplay = (value: string) => {
    const planType = PLAN_TYPES.find(type => type.value === value)
    return planType?.label || value
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN')
  }

  const isReviewNeeded = (plan: HealthPlan) => {
    if (plan.status === 'review_needed') return true
    if (plan.progress.nextReviewDate) {
      return new Date(plan.progress.nextReviewDate) <= new Date()
    }
    return false
  }

  const resetFilters = () => {
    setSearch('')
    setStatusFilter('')
    setPriorityFilter('')
    setPlanTypeFilter('')
    setNeedsReview(false)
    setCurrentPage(1)
  }

  if (loading && healthPlans.length === 0) {
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
              <div>
                <h1 className="text-2xl font-bold text-gray-900">健康计划管理</h1>
                <p className="mt-1 text-sm text-gray-600">
                  个性化健康计划制定和进度跟踪
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Link
                  href="/dashboard/health-plans/templates"
                  className="btn btn-secondary flex items-center"
                >
                  <CubeIcon className="h-5 w-5 mr-2" />
                  计划模板
                </Link>
                <Link
                  href="/dashboard/health-plans/analytics"
                  className="btn btn-secondary flex items-center"
                >
                  <ChartBarIcon className="h-5 w-5 mr-2" />
                  数据分析
                </Link>
                <Link
                  href="/dashboard/health-plans/new"
                  className="btn btn-primary flex items-center"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  新建计划
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DocumentTextIcon className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      总计划数
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {summary.totalPlans}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      进行中
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {summary.activePlans}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DocumentTextIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      草稿
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {summary.draftPlans}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      已完成
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {summary.completedPlans}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      需复查
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {summary.reviewNeeded}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-6 w-6 text-indigo-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      平均进度
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {summary.averageProgress ? `${summary.averageProgress.toFixed(1)}%` : 'N/A'}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                  搜索计划
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="search"
                    className="input pl-10"
                    placeholder="标题或客户..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700">
                  状态
                </label>
                <select
                  id="statusFilter"
                  className="mt-1 input"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">所有状态</option>
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="priorityFilter" className="block text-sm font-medium text-gray-700">
                  优先级
                </label>
                <select
                  id="priorityFilter"
                  className="mt-1 input"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <option value="">所有优先级</option>
                  {PRIORITY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="planTypeFilter" className="block text-sm font-medium text-gray-700">
                  计划类型
                </label>
                <select
                  id="planTypeFilter"
                  className="mt-1 input"
                  value={planTypeFilter}
                  onChange={(e) => setPlanTypeFilter(e.target.value)}
                >
                  <option value="">所有类型</option>
                  {PLAN_TYPES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end space-x-2">
                <div className="flex items-center">
                  <input
                    id="needsReview"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    checked={needsReview}
                    onChange={(e) => setNeedsReview(e.target.checked)}
                  />
                  <label htmlFor="needsReview" className="ml-2 block text-sm text-gray-700">
                    需要复查
                  </label>
                </div>
                <button
                  onClick={resetFilters}
                  className="btn btn-secondary btn-sm"
                >
                  重置
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Health Plans Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">健康计划列表</h3>
          </div>
          
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : healthPlans.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              没有找到健康计划
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      计划信息
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      客户信息
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      类型/状态
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      进度
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      时间
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {healthPlans.map((plan) => {
                    const priorityDisplay = getOptionDisplay(plan.priority, PRIORITY_OPTIONS)
                    const statusDisplay = getOptionDisplay(plan.status, STATUS_OPTIONS)
                    const reviewNeeded = isReviewNeeded(plan)
                    
                    return (
                      <tr key={plan._id} className={`hover:bg-gray-50 ${reviewNeeded ? 'bg-yellow-50' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {plan.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              编号: {plan.planId}
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${priorityDisplay.color}`}>
                                {priorityDisplay.label}
                              </span>
                              {reviewNeeded && (
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                  需复查
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {plan.customerName}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <UserIcon className="h-4 w-4 mr-1" />
                              {plan.assignedToName}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-gray-900 mb-1">
                              {getPlanTypeDisplay(plan.planType)}
                            </div>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusDisplay.color}`}>
                              {statusDisplay.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-gray-900">
                              {plan.progress.overallProgress}%
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${plan.progress.overallProgress}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              目标: {plan.progress.goalsAchieved}/{plan.progress.totalGoals}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-gray-900">
                              开始: {formatDate(plan.timeline.startDate)}
                            </div>
                            {plan.timeline.endDate && (
                              <div className="text-sm text-gray-500">
                                结束: {formatDate(plan.timeline.endDate)}
                              </div>
                            )}
                            {plan.progress.nextReviewDate && (
                              <div className="text-xs text-gray-500">
                                复查: {formatDate(plan.progress.nextReviewDate)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <Link
                              href={`/dashboard/health-plans/${plan._id}`}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="查看详情"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Link>
                            <Link
                              href={`/dashboard/health-plans/${plan._id}/edit`}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="编辑"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Link>
                            {plan.status !== 'completed' && (
                              <button
                                onClick={() => handleDelete(plan._id, plan.planId)}
                                className="text-red-600 hover:text-red-900"
                                title="删除"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  上一页
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  下一页
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    显示第 <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> 到{' '}
                    <span className="font-medium">{Math.min(currentPage * 10, totalCount)}</span> 条，
                    共 <span className="font-medium">{totalCount}</span> 条记录
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      上一页
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => 
                        page === 1 || 
                        page === totalPages || 
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      )
                      .map((page, index, array) => (
                        <div key={page}>
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                              ...
                            </span>
                          )}
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === currentPage
                                ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        </div>
                      ))}
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      下一页
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}