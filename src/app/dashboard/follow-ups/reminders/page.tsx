'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeftIcon,
  BellIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  UserIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowPathIcon,
  EyeIcon,
  PencilIcon,
  PhoneIcon
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
  type: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  scheduledDate: string
  scheduledTime?: string
  status: string
  communicationMethod: string
  reminderSent: boolean
  reminderDate?: string
  createdAt: string
}

interface ReminderSummary {
  total: number
  urgent: number
  high: number
  medium: number
  low: number
}

interface User {
  _id: string
  name: string
  email: string
  department?: string
}

const REMINDER_TYPES = [
  { value: 'overdue', label: '逾期回访', icon: ExclamationTriangleIcon, color: 'text-red-600' },
  { value: 'today', label: '今日回访', icon: CalendarDaysIcon, color: 'text-blue-600' },
  { value: 'upcoming', label: '即将到期', icon: ClockIcon, color: 'text-yellow-600' },
  { value: 'next_week', label: '下周安排', icon: CalendarDaysIcon, color: 'text-green-600' },
]

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

const FOLLOW_UP_TYPES: { [key: string]: string } = {
  health_check: '健康检查',
  product_feedback: '产品反馈',
  reorder_reminder: '补货提醒',
  plan_adjustment: '计划调整',
  satisfaction_survey: '满意度调查',
  general_inquiry: '一般咨询',
  complaint_resolution: '投诉处理',
  education: '健康教育',
  promotional: '促销活动',
  other: '其他',
}

const COMMUNICATION_METHODS: { [key: string]: string } = {
  phone: '电话',
  email: '邮件',
  wechat: '微信',
  sms: '短信',
  in_person: '面谈',
  video_call: '视频通话',
}

export default function RemindersPage() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([])
  const [groupedFollowUps, setGroupedFollowUps] = useState<{[key: string]: FollowUp[]}>({})
  const [summary, setSummary] = useState<ReminderSummary>({
    total: 0,
    urgent: 0,
    high: 0,
    medium: 0,
    low: 0,
  })
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState('overdue')
  const [selectedFollowUps, setSelectedFollowUps] = useState<string[]>([])
  const [assignedToFilter, setAssignedToFilter] = useState('')
  const [processing, setProcessing] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth/login')
      return
    }
    
    loadReminders()
    loadUsers()
  }, [selectedType, assignedToFilter])

  const loadReminders = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      const params = new URLSearchParams({
        type: selectedType,
      })
      
      if (assignedToFilter) {
        params.append('assignedToId', assignedToFilter)
      }
      
      const response = await fetch(`/api/follow-ups/reminders?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setFollowUps(data.data.followUps)
        setGroupedFollowUps(data.data.grouped)
        setSummary(data.data.summary)
      }
    } catch (error) {
      console.error('Error loading reminders:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data.data || [])
      }
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedFollowUps(followUps.map(f => f._id))
    } else {
      setSelectedFollowUps([])
    }
  }

  const handleSelectFollowUp = (followUpId: string, checked: boolean) => {
    if (checked) {
      setSelectedFollowUps(prev => [...prev, followUpId])
    } else {
      setSelectedFollowUps(prev => prev.filter(id => id !== followUpId))
    }
  }

  const handleBulkAction = async (action: string, reminderDate?: string, newScheduledDate?: string, newScheduledTime?: string) => {
    if (selectedFollowUps.length === 0) {
      alert('请先选择要操作的回访记录')
      return
    }

    setProcessing(true)

    try {
      const token = localStorage.getItem('token')
      const body: any = {
        followUpIds: selectedFollowUps,
        action
      }

      if (reminderDate) body.reminderDate = reminderDate
      if (newScheduledDate) body.newScheduledDate = newScheduledDate
      if (newScheduledTime) body.newScheduledTime = newScheduledTime

      const response = await fetch('/api/follow-ups/reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        const data = await response.json()
        alert(`成功处理 ${data.data.modifiedCount} 条记录`)
        setSelectedFollowUps([])
        loadReminders()
      } else {
        const data = await response.json()
        alert(data.message || '操作失败')
      }
    } catch (error) {
      console.error('Error processing bulk action:', error)
      alert('操作失败')
    } finally {
      setProcessing(false)
    }
  }

  const handleMarkReminderSent = () => {
    handleBulkAction('mark_reminder_sent')
  }

  const handleSnoozeReminder = () => {
    const snoozeDate = prompt('请输入延期提醒日期 (YYYY-MM-DD):')
    if (snoozeDate) {
      handleBulkAction('snooze_reminder', snoozeDate)
    }
  }

  const handleReschedule = () => {
    const newDate = prompt('请输入新的回访日期 (YYYY-MM-DD):')
    if (newDate) {
      const newTime = prompt('请输入新的回访时间 (HH:MM, 可选):')
      handleBulkAction('reschedule', undefined, newDate, newTime || undefined)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN')
  }

  const isOverdue = (scheduledDate: string, status: string) => {
    if (status === 'completed' || status === 'cancelled') return false
    return new Date(scheduledDate) < new Date()
  }

  const getTypeDisplay = (type: string) => {
    return REMINDER_TYPES.find(t => t.value === type) || REMINDER_TYPES[0]
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
              <div className="flex items-center">
                <Link
                  href="/dashboard/follow-ups"
                  className="mr-4 text-gray-400 hover:text-gray-600"
                >
                  <ArrowLeftIcon className="h-6 w-6" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    <BellIcon className="h-8 w-8 mr-3" />
                    提醒管理
                  </h1>
                  <p className="mt-1 text-sm text-gray-600">
                    回访提醒和批量操作管理
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BellIcon className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      总提醒数
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {summary.total}
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
                      紧急
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {summary.urgent}
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
                  <ExclamationTriangleIcon className="h-6 w-6 text-orange-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      高优先级
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {summary.high}
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
                  <ClockIcon className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      中优先级
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {summary.medium}
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
                      低优先级
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {summary.low}
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="typeFilter" className="block text-sm font-medium text-gray-700">
                  提醒类型
                </label>
                <select
                  id="typeFilter"
                  className="mt-1 input"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  {REMINDER_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="assignedToFilter" className="block text-sm font-medium text-gray-700">
                  负责人
                </label>
                <select
                  id="assignedToFilter"
                  className="mt-1 input"
                  value={assignedToFilter}
                  onChange={(e) => setAssignedToFilter(e.target.value)}
                >
                  <option value="">所有负责人</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSelectedType('overdue')
                    setAssignedToFilter('')
                  }}
                  className="btn btn-secondary w-full"
                >
                  重置筛选
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedFollowUps.length > 0 && (
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700">
                    已选择 {selectedFollowUps.length} 条记录
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleMarkReminderSent}
                    disabled={processing}
                    className="btn btn-primary btn-sm flex items-center"
                  >
                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                    标记已提醒
                  </button>
                  <button
                    onClick={handleSnoozeReminder}
                    disabled={processing}
                    className="btn btn-secondary btn-sm flex items-center"
                  >
                    <ClockIcon className="h-4 w-4 mr-1" />
                    延期提醒
                  </button>
                  <button
                    onClick={handleReschedule}
                    disabled={processing}
                    className="btn btn-secondary btn-sm flex items-center"
                  >
                    <ArrowPathIcon className="h-4 w-4 mr-1" />
                    重新安排
                  </button>
                  <button
                    onClick={() => setSelectedFollowUps([])}
                    className="btn btn-secondary btn-sm flex items-center"
                  >
                    <XMarkIcon className="h-4 w-4 mr-1" />
                    取消选择
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reminders List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  {getTypeDisplay(selectedType).label}
                </h3>
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {followUps.length} 条记录
                </span>
              </div>
              {followUps.length > 0 && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    checked={selectedFollowUps.length === followUps.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    全选
                  </label>
                </div>
              )}
            </div>
          </div>
          
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : followUps.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <BellIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p>当前没有需要提醒的回访记录</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      选择
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      回访信息
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      客户信息
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      安排时间
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      提醒状态
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {followUps.map((followUp) => {
                    const overdue = isOverdue(followUp.scheduledDate, followUp.status)
                    const isSelected = selectedFollowUps.includes(followUp._id)
                    
                    return (
                      <tr key={followUp._id} className={`hover:bg-gray-50 ${overdue ? 'bg-red-50' : ''} ${isSelected ? 'bg-blue-50' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            checked={isSelected}
                            onChange={(e) => handleSelectFollowUp(followUp._id, e.target.checked)}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {followUp.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {followUp.followUpId} | {FOLLOW_UP_TYPES[followUp.type] || followUp.type}
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${PRIORITY_COLORS[followUp.priority]}`}>
                                {PRIORITY_LABELS[followUp.priority]}
                              </span>
                              {overdue && (
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                  逾期
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {followUp.customerName}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <UserIcon className="h-4 w-4 mr-1" />
                              {followUp.assignedToName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {COMMUNICATION_METHODS[followUp.communicationMethod] || followUp.communicationMethod}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-gray-900 font-medium">
                              {formatDate(followUp.scheduledDate)}
                            </div>
                            {followUp.scheduledTime && (
                              <div className="text-sm text-gray-500">
                                {followUp.scheduledTime}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                              followUp.reminderSent 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {followUp.reminderSent ? (
                                <>
                                  <CheckCircleIcon className="h-3 w-3 mr-1" />
                                  已提醒
                                </>
                              ) : (
                                <>
                                  <BellIcon className="h-3 w-3 mr-1" />
                                  待提醒
                                </>
                              )}
                            </div>
                            {followUp.reminderDate && (
                              <div className="text-xs text-gray-500 mt-1">
                                {formatDateTime(followUp.reminderDate)}
                              </div>
                            )}
                          </div>
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
                            {followUp.customerPhone && (
                              <a
                                href={`tel:${followUp.customerPhone}`}
                                className="text-green-600 hover:text-green-900"
                                title="拨打电话"
                              >
                                <PhoneIcon className="h-4 w-4" />
                              </a>
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
        </div>

        {/* Priority Groups */}
        {Object.keys(groupedFollowUps).length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {Object.entries(groupedFollowUps).map(([priority, items]) => (
              <div key={priority} className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h4 className="text-lg font-medium text-gray-900 flex items-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mr-2 ${PRIORITY_COLORS[priority]}`}>
                      {PRIORITY_LABELS[priority]}
                    </span>
                    优先级 ({items.length})
                  </h4>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {items.slice(0, 5).map((item) => (
                      <div key={item._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{item.title}</div>
                          <div className="text-sm text-gray-500">{item.customerName}</div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(item.scheduledDate)}
                        </div>
                      </div>
                    ))}
                    {items.length > 5 && (
                      <div className="text-center">
                        <span className="text-sm text-gray-500">
                          还有 {items.length - 5} 条记录...
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}