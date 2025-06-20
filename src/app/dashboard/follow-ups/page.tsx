'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  BellIcon,
  CalendarDaysIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

interface FollowUp {
  _id: string
  followUpId: string
  customerId: any
  customerName: string
  customerEmail?: string
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
  outcome?: string
  customerSatisfaction?: number
  nextFollowUpDate?: string
  createdAt: string
}

interface FollowUpSummary {
  totalFollowUps: number
  completedCount: number
  scheduledCount: number
  overdueCount: number
  averageRating: number
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
  { value: 'urgent', label: '紧急', color: 'bg-red-100 text-red-800' },
  { value: 'high', label: '高', color: 'bg-orange-100 text-orange-800' },
  { value: 'medium', label: '中', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'low', label: '低', color: 'bg-green-100 text-green-800' },
]

const STATUS_OPTIONS = [
  { value: 'scheduled', label: '已安排', color: 'bg-blue-100 text-blue-800' },
  { value: 'in_progress', label: '进行中', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'completed', label: '已完成', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: '已取消', color: 'bg-red-100 text-red-800' },
  { value: 'rescheduled', label: '已重新安排', color: 'bg-purple-100 text-purple-800' },
  { value: 'no_response', label: '无回应', color: 'bg-gray-100 text-gray-800' },
]

const COMMUNICATION_METHODS = [
  { value: 'phone', label: '电话' },
  { value: 'email', label: '邮件' },
  { value: 'wechat', label: '微信' },
  { value: 'sms', label: '短信' },
  { value: 'in_person', label: '面谈' },
  { value: 'video_call', label: '视频通话' },
]

export default function FollowUpsPage() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([])
  const [summary, setSummary] = useState<FollowUpSummary>({
    totalFollowUps: 0,
    completedCount: 0,
    scheduledCount: 0,
    overdueCount: 0,
    averageRating: 0,
  })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [overdueOnly, setOverdueOnly] = useState(false)
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
    
    loadFollowUps()
  }, [currentPage, search, statusFilter, priorityFilter, typeFilter, startDate, endDate, overdueOnly])

  const loadFollowUps = async () => {
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
      if (typeFilter) params.append('type', typeFilter)
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      if (overdueOnly) params.append('overdue', 'true')
      
      const response = await fetch(`/api/follow-ups?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setFollowUps(data.data.followUps)
        setTotalPages(data.data.pagination.totalPages)
        setTotalCount(data.data.pagination.totalCount)
        setSummary(data.data.summary)
      }
    } catch (error) {
      console.error('Error loading follow-ups:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (followUpId: string, followUpCode: string) => {
    if (!confirm(`确定要删除回访记录 "${followUpCode}" 吗？`)) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/follow-ups/${followUpId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        loadFollowUps()
      } else {
        const data = await response.json()
        alert(data.message || '删除失败')
      }
    } catch (error) {
      console.error('Error deleting follow-up:', error)
      alert('删除失败')
    }
  }

  const getOptionDisplay = (value: string, options: any[]) => {
    const option = options.find(opt => opt.value === value)
    return option || { label: value, color: 'bg-gray-100 text-gray-800' }
  }

  const isOverdue = (scheduledDate: string, status: string) => {
    if (status === 'completed' || status === 'cancelled') return false
    return new Date(scheduledDate) < new Date()
  }

  const resetFilters = () => {
    setSearch('')
    setStatusFilter('')
    setPriorityFilter('')
    setTypeFilter('')
    setStartDate('')
    setEndDate('')
    setOverdueOnly(false)
    setCurrentPage(1)
  }

  if (loading && followUps.length === 0) {
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
                <h1 className="text-2xl font-bold text-gray-900">回访管理</h1>
                <p className="mt-1 text-sm text-gray-600">
                  客户回访计划和反馈记录管理
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Link
                  href="/dashboard/follow-ups/reminders"
                  className="btn btn-secondary flex items-center"
                >
                  <BellIcon className="h-5 w-5 mr-2" />
                  提醒管理
                </Link>
                <Link
                  href="/dashboard/follow-ups/analytics"
                  className="btn btn-secondary flex items-center"
                >
                  <ChartBarIcon className="h-5 w-5 mr-2" />
                  回访分析
                </Link>
                <Link
                  href="/dashboard/follow-ups/new"
                  className="btn btn-primary flex items-center"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  新增回访
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      总回访数
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {summary.totalFollowUps}
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
                  <CalendarDaysIcon className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      待回访
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {summary.scheduledCount}
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
                      逾期回访
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {summary.overdueCount}
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
                      {summary.completedCount}
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
                  <ClockIcon className="h-6 w-6 text-indigo-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      满意度
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {summary.averageRating ? `${summary.averageRating.toFixed(1)}/5` : 'N/A'}
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                  搜索回访
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
                <label htmlFor="typeFilter" className="block text-sm font-medium text-gray-700">
                  回访类型
                </label>
                <select
                  id="typeFilter"
                  className="mt-1 input"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="">所有类型</option>
                  {FOLLOW_UP_TYPES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                  开始日期
                </label>
                <input
                  type="date"
                  id="startDate"
                  className="mt-1 input"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
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
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              <div className="flex items-end">
                <div className="flex items-center">
                  <input
                    id="overdueOnly"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    checked={overdueOnly}
                    onChange={(e) => setOverdueOnly(e.target.checked)}
                  />
                  <label htmlFor="overdueOnly" className="ml-2 block text-sm text-gray-700">
                    仅显示逾期
                  </label>
                </div>
              </div>

              <div className="flex items-end">
                <button
                  onClick={resetFilters}
                  className="btn btn-secondary w-full"
                >
                  重置筛选
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Follow-ups Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">回访记录</h3>
          </div>
          
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : followUps.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              没有找到回访记录
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      回访信息
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      客户信息
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      类型/优先级
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      安排时间
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {followUps.map((followUp) => {
                    const priorityDisplay = getOptionDisplay(followUp.priority, PRIORITY_OPTIONS)
                    const statusDisplay = getOptionDisplay(followUp.status, STATUS_OPTIONS)
                    const typeDisplay = getOptionDisplay(followUp.type, FOLLOW_UP_TYPES)
                    const overdue = isOverdue(followUp.scheduledDate, followUp.status)
                    
                    return (
                      <tr key={followUp._id} className={`hover:bg-gray-50 ${overdue ? 'bg-red-50' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {followUp.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              编号: {followUp.followUpId}
                            </div>
                            {overdue && (
                              <div className="text-xs text-red-600 font-medium">
                                逾期回访
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {followUp.customerName}
                            </div>
                            <div className="text-sm text-gray-500">
                              负责人: {followUp.assignedToName}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-gray-900 mb-1">
                              {typeDisplay.label}
                            </div>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${priorityDisplay.color}`}>
                              {priorityDisplay.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-gray-900">
                              {new Date(followUp.scheduledDate).toLocaleDateString('zh-CN')}
                            </div>
                            {followUp.scheduledTime && (
                              <div className="text-sm text-gray-500">
                                {followUp.scheduledTime}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusDisplay.color}`}>
                            {statusDisplay.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <Link
                              href={`/dashboard/follow-ups/${followUp._id}`}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="查看详情"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Link>
                            <Link
                              href={`/dashboard/follow-ups/${followUp._id}/edit`}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="编辑"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Link>
                            {followUp.status !== 'completed' && (
                              <button
                                onClick={() => handleDelete(followUp._id, followUp.followUpId)}
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