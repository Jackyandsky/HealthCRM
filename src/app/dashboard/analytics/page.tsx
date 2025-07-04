'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  HeartIcon,
  CubeIcon,
  ArrowTrendingUpIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  StarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import DashboardHeader from '@/components/ui/DashboardHeader'

interface AnalyticsData {
  overview: {
    totalCustomers: number
    newCustomers: number
    totalRevenue: number
    totalOrders: number
    totalHealthPlans: number
    activeHealthPlans: number
    pendingFollowUps: number
    averageCustomerValue: number
  }
  customers: {
    byType: Array<{ _id: string; count: number }>
    byStatus: Array<{ _id: string; count: number }>
    growth: Array<{ _id: { year: number; month: number }; newCustomers: number }>
  }
  sales: {
    revenueByMonth: Array<{ _id: { year: number; month: number }; revenue: number; orders: number }>
    topProducts: Array<{ _id: { productCode: string; productName: string }; quantity: number; revenue: number }>
    salesByCategory: Array<{ _id: string; count: number; avgPrice: number }>
    totalRevenue: number
    totalOrders: number
  }
  healthPlans: {
    byType: Array<{ _id: string; count: number }>
    completionRate: number
    averageProgress: number
    total: number
    active: number
  }
  followUps: {
    total: number
    pending: number
    completed: number
    byOutcome: Array<{ _id: string; count: number }>
    averageSatisfaction: number
  }
  productUsage: Array<{
    _id: string
    avgEffectiveness: number
    userCount: number
    continueRate: number
  }>
  timeRange: number
}

const CUSTOMER_TYPE_LABELS = {
  potential: '潜在客户',
  new: '新客户',
  regular: '常规客户',
  vip: 'VIP客户',
  inactive: '非活跃客户'
}

const CUSTOMER_STATUS_LABELS = {
  active: '活跃',
  inactive: '非活跃',
  blocked: '已停用'
}

const PLAN_TYPE_LABELS = {
  basic: '基础计划',
  comprehensive: '综合计划',
  specialized: '专项计划',
  maintenance: '维护计划',
  intensive: '强化计划'
}

const OUTCOME_LABELS = {
  successful: '成功',
  partially_successful: '部分成功',
  unsuccessful: '未成功',
  rescheduled: '重新安排',
  no_contact: '未联系到'
}

export default function AnalyticsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [timeRange, setTimeRange] = useState('30')
  const [error, setError] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<string>('')
  const [customers, setCustomers] = useState<Array<{_id: string, firstName: string, lastName: string, customerId: string}>>([])
  const [customerTimeline, setCustomerTimeline] = useState<Array<any>>([])
  const [timelineLoading, setTimelineLoading] = useState(false)

  const loadAnalyticsData = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const token = localStorage.getItem('token')

      const response = await fetch(`/api/analytics/dashboard?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const result = await response.json()
        setData(result.data)
      } else {
        const errorData = await response.json()
        setError(errorData.message || '加载数据失败')
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
      setError('加载数据时发生错误')
    } finally {
      setLoading(false)
    }
  }, [timeRange])

  const loadCustomers = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/customers?limit=100', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const result = await response.json()
        setCustomers(result.customers || [])
      } else {
        console.error('Failed to load customers:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error loading customers:', error)
    }
  }, [])

  const loadCustomerTimeline = useCallback(async () => {
    if (!selectedCustomer) return

    try {
      setTimelineLoading(true)
      const token = localStorage.getItem('token')

      // Load customer activities from multiple endpoints
      const [purchasesRes, followUpsRes, plansRes] = await Promise.all([
        fetch(`/api/purchases?customerId=${selectedCustomer}&limit=50`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`/api/follow-ups?customerId=${selectedCustomer}&limit=50`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`/api/health-plans?customerId=${selectedCustomer}&limit=50`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])

      const [purchases, followUps, plans] = await Promise.all([
        purchasesRes.ok ? purchasesRes.json() : { data: { purchases: [] } },
        followUpsRes.ok ? followUpsRes.json() : { data: { followUps: [] } },
        plansRes.ok ? plansRes.json() : { data: { plans: [] } }
      ])

      // Combine and sort timeline events
      const timeline = [
        ...(purchases.data.purchases || []).map((item: any) => ({
          ...item,
          type: 'purchase',
          date: item.orderDate,
          title: `购买订单 ${item.purchaseId}`,
          description: `总金额: ¥${item.totalAmount}`
        })),
        ...(followUps.data.followUps || []).map((item: any) => ({
          ...item,
          type: 'follow_up',
          date: item.scheduledDate,
          title: `回访: ${item.title}`,
          description: item.description || '客户回访记录'
        })),
        ...(plans.data.plans || []).map((item: any) => ({
          ...item,
          type: 'health_plan',
          date: item.createdAt,
          title: `健康计划: ${item.title}`,
          description: item.description || '健康计划创建'
        }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      setCustomerTimeline(timeline)
    } catch (error) {
      console.error('Error loading customer timeline:', error)
    } finally {
      setTimelineLoading(false)
    }
  }, [selectedCustomer])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth/login')
      return
    }

    loadAnalyticsData()
    loadCustomers()
  }, [router, timeRange, loadAnalyticsData, loadCustomers])

  useEffect(() => {
    if (selectedCustomer) {
      loadCustomerTimeline()
    }
  }, [selectedCustomer, loadCustomerTimeline])

  const formatCurrency = (amount: number) => {
    return `¥${amount.toLocaleString()}`
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const getMonthName = (month: number) => {
    const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    return months[month - 1]
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`h-4 w-4 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader
          title="数据分析"
          description="业务数据统计和趋势分析"
          backHref="/dashboard"
          showDashboardLink={false}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">加载失败</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">暂无数据</h3>
          <button onClick={loadAnalyticsData} className="btn btn-primary mt-4">
            重新加载
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title="数据分析"
        description="业务数据统计和趋势分析"
        backHref="/dashboard"
        showDashboardLink={false}
      >
        <select
          className="input"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
        >
          <option value="7">最近7天</option>
          <option value="30">最近30天</option>
          <option value="90">最近90天</option>
          <option value="365">最近1年</option>
        </select>
        <button
          onClick={loadAnalyticsData}
          className="btn btn-primary"
        >
          刷新数据
        </button>
      </DashboardHeader>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserGroupIcon className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      总客户数
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {data.overview.totalCustomers}
                    </dd>
                    <dd className="text-sm text-green-600">
                      新增 {data.overview.newCustomers}
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
                  <CurrencyDollarIcon className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      销售额
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {formatCurrency(data.overview.totalRevenue)}
                    </dd>
                    <dd className="text-sm text-gray-600">
                      {data.overview.totalOrders} 笔订单
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
                  <HeartIcon className="h-6 w-6 text-purple-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      健康计划
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {data.overview.totalHealthPlans}
                    </dd>
                    <dd className="text-sm text-blue-600">
                      {data.overview.activeHealthPlans} 个进行中
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
                  <ChatBubbleLeftRightIcon className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      待跟进
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {data.overview.pendingFollowUps}
                    </dd>
                    <dd className="text-sm text-orange-600">
                      需要关注
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
          {/* Customer Distribution */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">客户分布</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-md font-medium text-gray-700 mb-2">按类型分布</h4>
                {data.customers.byType.map((item) => (
                  <div key={item._id} className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600">
                      {CUSTOMER_TYPE_LABELS[item._id as keyof typeof CUSTOMER_TYPE_LABELS] || item._id}
                    </span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${(item.count / data.overview.totalCustomers) * 100}%`
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8">
                        {item.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sales Trends */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">销售趋势</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-900">
                    {formatCurrency(data.sales.totalRevenue)}
                  </div>
                  <div className="text-sm text-green-600">总销售额</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-900">
                    {data.sales.totalOrders}
                  </div>
                  <div className="text-sm text-blue-600">总订单数</div>
                </div>
              </div>
              
              {data.sales.revenueByMonth.length > 0 && (
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-2">月度销售</h4>
                  <div className="space-y-2">
                    {data.sales.revenueByMonth.slice(-6).map((item) => (
                      <div key={`${item._id.year}-${item._id.month}`} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {item._id.year}年{getMonthName(item._id.month)}
                        </span>
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900 mr-2">
                            {formatCurrency(item.revenue)}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({item.orders}笔)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top Products and Health Plans */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
          {/* Top Products */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">热销产品</h3>
            <div className="space-y-3">
              {data.sales.topProducts.slice(0, 8).map((product, index) => (
                <div key={product._id.productCode} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {product._id.productName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {product._id.productCode}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(product.revenue)}
                    </div>
                    <div className="text-xs text-gray-500">
                      销量: {product.quantity}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Health Plan Analytics */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">健康计划分析</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-900">
                    {formatPercentage(data.healthPlans.averageProgress)}
                  </div>
                  <div className="text-sm text-purple-600">平均进度</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-900">
                    {data.healthPlans.completionRate}
                  </div>
                  <div className="text-sm text-green-600">已完成</div>
                </div>
              </div>

              <div>
                <h4 className="text-md font-medium text-gray-700 mb-2">计划类型分布</h4>
                {data.healthPlans.byType.map((item) => (
                  <div key={item._id} className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600">
                      {PLAN_TYPE_LABELS[item._id as keyof typeof PLAN_TYPE_LABELS] || item._id}
                    </span>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{
                            width: `${(item.count / data.healthPlans.total) * 100}%`
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-6">
                        {item.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Product Usage and Follow-up Analytics */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
          {/* Product Usage Effectiveness */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">产品使用效果</h3>
            <div className="space-y-3">
              {data.productUsage.slice(0, 8).map((usage) => (
                <div key={usage._id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {usage._id}
                    </div>
                    <div className="text-xs text-gray-500">
                      {usage.userCount} 人使用
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-xs text-gray-600 mr-2">效果:</span>
                      {renderStars(usage.avgEffectiveness)}
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs text-gray-600 mr-1">继续率:</span>
                      <span className="text-sm font-medium text-green-600">
                        {formatPercentage(usage.continueRate * 100)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Follow-up Analytics */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">跟进效果分析</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-900">
                    {data.followUps.total}
                  </div>
                  <div className="text-xs text-blue-600">总跟进数</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-lg font-bold text-yellow-900">
                    {data.followUps.pending}
                  </div>
                  <div className="text-xs text-yellow-600">待处理</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-900">
                    {data.followUps.completed}
                  </div>
                  <div className="text-xs text-green-600">已完成</div>
                </div>
              </div>

              {data.followUps.averageSatisfaction > 0 && (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-2">平均客户满意度</div>
                  {renderStars(data.followUps.averageSatisfaction)}
                </div>
              )}

              {data.followUps.byOutcome.length > 0 && (
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-2">跟进结果</h4>
                  {data.followUps.byOutcome.map((item) => (
                    <div key={item._id} className="flex items-center justify-between py-1">
                      <span className="text-sm text-gray-600">
                        {OUTCOME_LABELS[item._id as keyof typeof OUTCOME_LABELS] || item._id}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">关键洞察</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center">
                <ArrowTrendingUpIcon className="h-5 w-5 text-blue-600 mr-2" />
                <h4 className="text-sm font-medium text-blue-800">客户增长</h4>
              </div>
              <p className="mt-2 text-sm text-blue-700">
                最近{timeRange}天新增{data.overview.newCustomers}位客户，
                平均客户价值为{formatCurrency(data.overview.averageCustomerValue)}
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center">
                <CubeIcon className="h-5 w-5 text-green-600 mr-2" />
                <h4 className="text-sm font-medium text-green-800">产品表现</h4>
              </div>
              <p className="mt-2 text-sm text-green-700">
                {data.sales.topProducts.length > 0 && 
                  `热销产品《${data.sales.topProducts[0]._id.productName}》销售额达${formatCurrency(data.sales.topProducts[0].revenue)}`
                }
              </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center">
                <HeartIcon className="h-5 w-5 text-purple-600 mr-2" />
                <h4 className="text-sm font-medium text-purple-800">健康计划</h4>
              </div>
              <p className="mt-2 text-sm text-purple-700">
                {data.overview.activeHealthPlans}个健康计划进行中，
                平均完成度为{formatPercentage(data.healthPlans.averageProgress)}
              </p>
            </div>
          </div>
        </div>

        {/* Customer Timeline Section */}
        <div className="bg-white shadow rounded-lg p-6 mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">客户活动时间线</h3>
          <div className="mb-4">
            <label htmlFor="customerSelect" className="block text-sm font-medium text-gray-700 mb-2">
              选择客户
            </label>
            <div className="relative">
              <select
                id="customerSelect"
                className="input w-full max-w-md"
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
              >
                <option value="">请选择客户...</option>
                {customers.map((customer) => (
                  <option key={customer._id} value={customer._id}>
                    {customer.firstName} {customer.lastName} ({customer.customerId})
                  </option>
                ))}
              </select>
              <MagnifyingGlassIcon className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {selectedCustomer && (
            <div className="border-t pt-4">
              {timelineLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : customerTimeline.length > 0 ? (
                <div className="flow-root">
                  <ul className="-mb-8">
                    {customerTimeline.map((event, eventIdx) => (
                      <li key={`${event.type}-${event._id}`}>
                        <div className="relative pb-8">
                          {eventIdx !== customerTimeline.length - 1 ? (
                            <span
                              className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                              aria-hidden="true"
                            />
                          ) : null}
                          <div className="relative flex space-x-3">
                            <div>
                              <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                                event.type === 'purchase' ? 'bg-green-500' :
                                event.type === 'follow_up' ? 'bg-blue-500' :
                                'bg-purple-500'
                              }`}>
                                {event.type === 'purchase' ? (
                                  <CurrencyDollarIcon className="h-5 w-5 text-white" />
                                ) : event.type === 'follow_up' ? (
                                  <ChatBubbleLeftRightIcon className="h-5 w-5 text-white" />
                                ) : (
                                  <HeartIcon className="h-5 w-5 text-white" />
                                )}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{event.title}</p>
                                <p className="text-sm text-gray-500">{event.description}</p>
                                {event.type === 'follow_up' && event.status && (
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                                    event.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    event.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {event.status === 'completed' ? '已完成' :
                                     event.status === 'in_progress' ? '进行中' :
                                     event.status === 'scheduled' ? '已安排' : event.status}
                                  </span>
                                )}
                              </div>
                              <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                <time dateTime={event.date}>
                                  {new Date(event.date).toLocaleDateString('zh-CN')}
                                </time>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  该客户暂无活动记录
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}