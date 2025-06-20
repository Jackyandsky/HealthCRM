'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeftIcon,
  UserIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  TrashIcon,
  PhoneIcon,
  EnvelopeIcon,
  StarIcon,
  DocumentTextIcon,
  TagIcon,
  ListBulletIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

interface FollowUp {
  _id: string
  followUpId: string
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
  attachments?: Array<{
    filename: string
    url: string
    uploadDate: string
  }>
  relatedPurchaseId?: any
  tags?: string[]
  reminderSent: boolean
  reminderDate?: string
  createdAt: string
  updatedAt: string
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
  scheduled: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  rescheduled: 'bg-purple-100 text-purple-800',
  no_response: 'bg-gray-100 text-gray-800',
}

const STATUS_LABELS: { [key: string]: string } = {
  scheduled: '已安排',
  in_progress: '进行中',
  completed: '已完成',
  cancelled: '已取消',
  rescheduled: '已重新安排',
  no_response: '无回应',
}

const COMMUNICATION_METHODS: { [key: string]: string } = {
  phone: '电话',
  email: '邮件',
  wechat: '微信',
  sms: '短信',
  in_person: '面谈',
  video_call: '视频通话',
}

const ADHERENCE_LABELS: { [key: string]: string } = {
  excellent: '优秀',
  good: '良好',
  fair: '一般',
  poor: '较差',
}

export default function FollowUpDetailPage({ params }: { params: { id: string } }) {
  const [followUp, setFollowUp] = useState<FollowUp | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth/login')
      return
    }
    
    loadFollowUp()
  }, [params.id])

  const loadFollowUp = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      const response = await fetch(`/api/follow-ups/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setFollowUp(data.data)
      } else {
        router.push('/dashboard/follow-ups')
      }
    } catch (error) {
      console.error('Error loading follow-up:', error)
      router.push('/dashboard/follow-ups')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!followUp || !confirm(`确定要删除回访记录 "${followUp.followUpId}" 吗？`)) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/follow-ups/${followUp._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        router.push('/dashboard/follow-ups')
      } else {
        const data = await response.json()
        alert(data.message || '删除失败')
      }
    } catch (error) {
      console.error('Error deleting follow-up:', error)
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

  const isOverdue = (scheduledDate: string, status: string) => {
    if (status === 'completed' || status === 'cancelled') return false
    return new Date(scheduledDate) < new Date()
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

  const overdue = isOverdue(followUp.scheduledDate, followUp.status)

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
                  <div className="flex items-center space-x-3">
                    <h1 className="text-2xl font-bold text-gray-900">{followUp.title}</h1>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${STATUS_COLORS[followUp.status]}`}>
                      {STATUS_LABELS[followUp.status]}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${PRIORITY_COLORS[followUp.priority]}`}>
                      {PRIORITY_LABELS[followUp.priority]}
                    </span>
                    {overdue && (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        逾期
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    回访编号: {followUp.followUpId}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Link
                  href={`/dashboard/follow-ups/${followUp._id}/edit`}
                  className="btn btn-secondary flex items-center"
                >
                  <PencilIcon className="h-5 w-5 mr-2" />
                  编辑
                </Link>
                {followUp.status !== 'completed' && (
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
            {/* Basic Information */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <UserIcon className="h-5 w-5 mr-2" />
                  基本信息
                </h3>
              </div>
              <div className="p-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">客户姓名</dt>
                    <dd className="mt-1 text-sm text-gray-900 font-medium">{followUp.customerName}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">负责人</dt>
                    <dd className="mt-1 text-sm text-gray-900">{followUp.assignedToName}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">回访类型</dt>
                    <dd className="mt-1 text-sm text-gray-900">{FOLLOW_UP_TYPES[followUp.type] || followUp.type}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">沟通方式</dt>
                    <dd className="mt-1 text-sm text-gray-900">{COMMUNICATION_METHODS[followUp.communicationMethod] || followUp.communicationMethod}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">创建人</dt>
                    <dd className="mt-1 text-sm text-gray-900">{followUp.createdByName}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">创建时间</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatDateTime(followUp.createdAt)}</dd>
                  </div>
                  {followUp.description && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">描述</dt>
                      <dd className="mt-1 text-sm text-gray-900">{followUp.description}</dd>
                    </div>
                  )}
                </dl>
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
              <div className="p-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">安排日期</dt>
                    <dd className="mt-1 text-sm text-gray-900 font-medium">
                      {formatDate(followUp.scheduledDate)}
                    </dd>
                  </div>
                  {followUp.scheduledTime && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">安排时间</dt>
                      <dd className="mt-1 text-sm text-gray-900">{followUp.scheduledTime}</dd>
                    </div>
                  )}
                  {followUp.completedDate && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">完成时间</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formatDateTime(followUp.completedDate)}</dd>
                    </div>
                  )}
                  {followUp.actualDuration && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">实际用时</dt>
                      <dd className="mt-1 text-sm text-gray-900">{followUp.actualDuration} 分钟</dd>
                    </div>
                  )}
                  {followUp.nextFollowUpDate && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">下次回访日期</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formatDate(followUp.nextFollowUpDate)}</dd>
                    </div>
                  )}
                  {followUp.nextFollowUpReason && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">下次回访原因</dt>
                      <dd className="mt-1 text-sm text-gray-900">{followUp.nextFollowUpReason}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            {/* Customer Feedback */}
            {(followUp.outcome || followUp.customerSatisfaction || followUp.customerFeedback) && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                    客户反馈
                  </h3>
                </div>
                <div className="p-6">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    {followUp.outcome && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">回访结果</dt>
                        <dd className="mt-1 text-sm text-gray-900">{followUp.outcome}</dd>
                      </div>
                    )}
                    {followUp.customerSatisfaction && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">满意度评分</dt>
                        <dd className="mt-1">{renderStars(followUp.customerSatisfaction)}</dd>
                      </div>
                    )}
                    {followUp.customerFeedback && (
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-gray-500">客户反馈</dt>
                        <dd className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                          {followUp.customerFeedback}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            )}

            {/* Health Status */}
            {followUp.healthStatus && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                    健康状况
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  {followUp.healthStatus.currentCondition && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">当前状况</dt>
                      <dd className="mt-1 text-sm text-gray-900">{followUp.healthStatus.currentCondition}</dd>
                    </div>
                  )}
                  {followUp.healthStatus.improvements && followUp.healthStatus.improvements.length > 0 && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">改善情况</dt>
                      <dd className="mt-1">
                        <ul className="list-disc list-inside text-sm text-gray-900 space-y-1">
                          {followUp.healthStatus.improvements.map((improvement, index) => (
                            <li key={index}>{improvement}</li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                  )}
                  {followUp.healthStatus.concerns && followUp.healthStatus.concerns.length > 0 && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">关注事项</dt>
                      <dd className="mt-1">
                        <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                          {followUp.healthStatus.concerns.map((concern, index) => (
                            <li key={index}>{concern}</li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                  )}
                  {followUp.healthStatus.sideEffects && followUp.healthStatus.sideEffects.length > 0 && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">副作用</dt>
                      <dd className="mt-1">
                        <ul className="list-disc list-inside text-sm text-orange-600 space-y-1">
                          {followUp.healthStatus.sideEffects.map((effect, index) => (
                            <li key={index}>{effect}</li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Product Usage */}
            {followUp.productUsage && followUp.productUsage.length > 0 && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">产品使用情况</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {followUp.productUsage.map((usage, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                          <div>
                            <dt className="text-sm font-medium text-gray-500">产品名称</dt>
                            <dd className="mt-1 text-sm text-gray-900 font-medium">
                              {usage.productName || usage.productId?.productName || '未知产品'}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">依从性</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                              {ADHERENCE_LABELS[usage.adherence] || usage.adherence}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">效果评分</dt>
                            <dd className="mt-1">{renderStars(usage.effectiveness)}</dd>
                          </div>
                          {usage.remainingQuantity !== undefined && (
                            <div>
                              <dt className="text-sm font-medium text-gray-500">剩余数量</dt>
                              <dd className="mt-1 text-sm text-gray-900">{usage.remainingQuantity}</dd>
                            </div>
                          )}
                        </div>
                        {usage.notes && (
                          <div className="mt-4">
                            <dt className="text-sm font-medium text-gray-500">备注</dt>
                            <dd className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                              {usage.notes}
                            </dd>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Action Items */}
            {followUp.actionItems && followUp.actionItems.length > 0 && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <ListBulletIcon className="h-5 w-5 mr-2" />
                    行动事项
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {followUp.actionItems.map((item, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                        <div className="flex-shrink-0 pt-1">
                          {item.status === 'completed' ? (
                            <CheckCircleIcon className="h-5 w-5 text-green-500" />
                          ) : (
                            <ClockIcon className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">{item.description}</p>
                          <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                            {item.dueDate && (
                              <span>截止: {new Date(item.dueDate).toLocaleDateString('zh-CN')}</span>
                            )}
                            {item.assignedTo && (
                              <span>负责人: {item.assignedTo}</span>
                            )}
                            <span className={`px-2 py-1 rounded-full ${PRIORITY_COLORS[item.priority]}`}>
                              {PRIORITY_LABELS[item.priority]}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Recommendations */}
            {followUp.recommendations && followUp.recommendations.length > 0 && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">建议事项</h3>
                </div>
                <div className="p-6">
                  <ul className="list-disc list-inside text-sm text-gray-900 space-y-2">
                    {followUp.recommendations.map((recommendation, index) => (
                      <li key={index}>{recommendation}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Notes */}
            {(followUp.publicNotes || followUp.internalNotes) && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <DocumentTextIcon className="h-5 w-5 mr-2" />
                    备注信息
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  {followUp.publicNotes && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">公开备注</dt>
                      <dd className="mt-1 text-sm text-gray-900 bg-blue-50 p-3 rounded-md">
                        {followUp.publicNotes}
                      </dd>
                    </div>
                  )}
                  {followUp.internalNotes && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">内部备注</dt>
                      <dd className="mt-1 text-sm text-gray-900 bg-yellow-50 p-3 rounded-md">
                        {followUp.internalNotes}
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
                {followUp.customerPhone && (
                  <a
                    href={`tel:${followUp.customerPhone}`}
                    className="w-full btn btn-secondary flex items-center justify-center"
                  >
                    <PhoneIcon className="h-4 w-4 mr-2" />
                    拨打电话
                  </a>
                )}
                {followUp.customerEmail && (
                  <a
                    href={`mailto:${followUp.customerEmail}`}
                    className="w-full btn btn-secondary flex items-center justify-center"
                  >
                    <EnvelopeIcon className="h-4 w-4 mr-2" />
                    发送邮件
                  </a>
                )}
                <Link
                  href={`/dashboard/customers/${followUp.customerId?._id || followUp.customerId}`}
                  className="w-full btn btn-secondary flex items-center justify-center"
                >
                  <UserIcon className="h-4 w-4 mr-2" />
                  查看客户
                </Link>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">联系信息</h3>
              </div>
              <div className="p-6">
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">客户姓名</dt>
                    <dd className="mt-1 text-sm text-gray-900">{followUp.customerName}</dd>
                  </div>
                  {followUp.customerEmail && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">邮箱</dt>
                      <dd className="mt-1 text-sm text-gray-900">{followUp.customerEmail}</dd>
                    </div>
                  )}
                  {followUp.customerPhone && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">电话</dt>
                      <dd className="mt-1 text-sm text-gray-900">{followUp.customerPhone}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            {/* Tags */}
            {followUp.tags && followUp.tags.length > 0 && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <TagIcon className="h-5 w-5 mr-2" />
                    标签
                  </h3>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-2">
                    {followUp.tags.map((tag) => (
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

            {/* Reminder Status */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">提醒状态</h3>
              </div>
              <div className="p-6">
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">提醒已发送</dt>
                    <dd className="mt-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        followUp.reminderSent 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {followUp.reminderSent ? '是' : '否'}
                      </span>
                    </dd>
                  </div>
                  {followUp.reminderDate && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">提醒时间</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {formatDateTime(followUp.reminderDate)}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}