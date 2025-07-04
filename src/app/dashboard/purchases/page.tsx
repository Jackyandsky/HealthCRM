'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentTextIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import DashboardHeader from '@/components/ui/DashboardHeader'
import type { Purchase } from '@/lib/types'

interface PurchasesSummary {
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
}

const PAYMENT_STATUS_OPTIONS = [
  { value: 'pending', label: '待付款', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'partial', label: '部分付款', color: 'bg-blue-100 text-blue-800' },
  { value: 'paid', label: '已付款', color: 'bg-green-100 text-green-800' },
  { value: 'refunded', label: '已退款', color: 'bg-purple-100 text-purple-800' },
  { value: 'cancelled', label: '已取消', color: 'bg-red-100 text-red-800' },
]

const ORDER_STATUS_OPTIONS = [
  { value: 'draft', label: '草稿', color: 'bg-gray-100 text-gray-800' },
  { value: 'confirmed', label: '已确认', color: 'bg-blue-100 text-blue-800' },
  { value: 'processing', label: '处理中', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'shipped', label: '已发货', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'delivered', label: '已送达', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: '已取消', color: 'bg-red-100 text-red-800' },
  { value: 'returned', label: '已退货', color: 'bg-purple-100 text-purple-800' },
]

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [summary, setSummary] = useState<PurchasesSummary>({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
  })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('')
  const [orderStatus, setOrderStatus] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
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
    
    loadPurchases()
  }, [currentPage, search, paymentStatus, orderStatus, startDate, endDate])

  const loadPurchases = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
      })
      
      if (search) params.append('search', search)
      if (paymentStatus) params.append('paymentStatus', paymentStatus)
      if (orderStatus) params.append('orderStatus', orderStatus)
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      
      const response = await fetch(`/api/purchases?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setPurchases(data.data.purchases)
        setTotalPages(data.data.pagination.totalPages)
        setTotalCount(data.data.pagination.totalCount)
        setSummary(data.data.summary)
      }
    } catch (error) {
      console.error('Error loading purchases:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (purchaseId: string, purchaseCode: string) => {
    if (!confirm(`确定要删除订单 "${purchaseCode}" 吗？此操作不可撤销。`)) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/purchases/${purchaseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        loadPurchases()
      } else {
        const data = await response.json()
        alert(data.message || '删除失败')
      }
    } catch (error) {
      console.error('Error deleting purchase:', error)
      alert('删除失败')
    }
  }

  const getStatusDisplay = (status: string, options: typeof PAYMENT_STATUS_OPTIONS) => {
    const option = options.find(opt => opt.value === status)
    return option || { label: status, color: 'bg-gray-100 text-gray-800' }
  }

  const resetFilters = () => {
    setSearch('')
    setPaymentStatus('')
    setOrderStatus('')
    setStartDate('')
    setEndDate('')
    setCurrentPage(1)
  }

  if (loading && purchases.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title="销售记录"
        description="管理客户购买记录和销售数据"
        backHref="/dashboard"
        showDashboardLink={false}
      >
        <Link
          href="/dashboard/purchases/new"
          className="btn btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          新增订单
        </Link>
      </DashboardHeader>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CurrencyDollarIcon className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      总销售额
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      ¥{summary.totalRevenue.toLocaleString()}
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
                  <ShoppingCartIcon className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      订单总数
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {summary.totalOrders}
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
                  <DocumentTextIcon className="h-6 w-6 text-indigo-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      平均订单价值
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      ¥{summary.averageOrderValue.toLocaleString()}
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                  搜索订单
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="search"
                    className="input pl-10"
                    placeholder="订单号或客户..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="paymentStatus" className="block text-sm font-medium text-gray-700">
                  付款状态
                </label>
                <select
                  id="paymentStatus"
                  className="mt-1 input"
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                >
                  <option value="">所有状态</option>
                  {PAYMENT_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="orderStatus" className="block text-sm font-medium text-gray-700">
                  订单状态
                </label>
                <select
                  id="orderStatus"
                  className="mt-1 input"
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value)}
                >
                  <option value="">所有状态</option>
                  {ORDER_STATUS_OPTIONS.map((option) => (
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

        {/* Purchases Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">订单列表</h3>
          </div>
          
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : purchases.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              没有找到订单记录
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      订单信息
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      客户信息
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      金额
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      付款状态
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      订单状态
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {purchases.map((purchase) => {
                    const paymentStatusDisplay = getStatusDisplay(purchase.paymentStatus, PAYMENT_STATUS_OPTIONS)
                    const orderStatusDisplay = getStatusDisplay(purchase.orderStatus, ORDER_STATUS_OPTIONS)
                    
                    return (
                      <tr key={purchase._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {purchase.purchaseId}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(purchase.orderDate).toLocaleDateString('zh-CN')}
                            </div>
                            <div className="text-xs text-gray-400">
                              {purchase.items.length} 件商品
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {purchase.customerId?.firstName} {purchase.customerId?.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {purchase.customerId?.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              ¥{purchase.totalAmount.toLocaleString()}
                            </div>
                            {purchase.paidAmount > 0 && (
                              <div className="text-sm text-green-600">
                                已付 ¥{purchase.paidAmount.toLocaleString()}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${paymentStatusDisplay.color}`}>
                            {paymentStatusDisplay.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${orderStatusDisplay.color}`}>
                            {orderStatusDisplay.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <Link
                              href={`/dashboard/purchases/${purchase._id}`}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="查看详情"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Link>
                            <Link
                              href={`/dashboard/purchases/${purchase._id}/edit`}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="编辑"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Link>
                            {purchase.orderStatus !== 'delivered' && (
                              <button
                                onClick={() => handleDelete(purchase._id, purchase.purchaseId)}
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