'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  UserGroupIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'

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
  salesRep?: {
    _id: string
    name: string
  }
  followUp: {
    nextContactDate?: string
    priority: string
    lastContactDate?: string
  }
  productUsage?: Array<{
    productName: string
    effectiveness?: number
    willContinue?: boolean
  }>
  status: string
  isActive: boolean
  createdAt: string
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sortField, setSortField] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
  // 过滤器
  const [filterType, setFilterType] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterSalesRep, setFilterSalesRep] = useState('')
  
  const [salesReps, setSalesReps] = useState<Array<{_id: string, name: string}>>([])
  const [activeTab, setActiveTab] = useState('all')
  
  const router = useRouter()

  const tabs = [
    { id: 'all', name: '全部客户', count: 0 },
    { id: 'potential', name: '潜在客户', count: 0 },
    { id: 'new', name: '新客户', count: 0 },
    { id: 'regular', name: '常规客户', count: 0 },
    { id: 'vip', name: 'VIP客户', count: 0 },
    { id: 'followup', name: '需要回访', count: 0 },
    { id: 'medication', name: '产品不足', count: 0 },
    { id: 'urgent', name: '紧急处理', count: 0 },
  ]

  useEffect(() => {
    loadCustomers()
    loadSalesReps()
  }, [currentPage, searchTerm, sortField, sortOrder, filterType, filterPriority, filterStatus, filterSalesRep, activeTab])

  const loadCustomers = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/auth/login')
        return
      }

      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchTerm,
        sortField,
        sortOrder,
        customerType: filterType,
        priority: filterPriority,
        status: filterStatus,
        salesRep: filterSalesRep,
        tab: activeTab,
      })

      const response = await fetch(`/api/customers?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setCustomers(data.customers)
        setTotalPages(data.totalPages)
      } else if (response.status === 401) {
        router.push('/auth/login')
      }
    } catch (error) {
      console.error('Error loading customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSalesReps = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/users?role=admin,system_admin', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setSalesReps(data.users || [])
      }
    } catch (error) {
      console.error('Error loading sales reps:', error)
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
    setCurrentPage(1)
  }

  const handleDeleteCustomer = async (customerId: string, customerName: string) => {
    if (!confirm(`确定要删除客户"${customerName}"吗？此操作不可逆。`)) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        loadCustomers()
        alert('客户已成功删除')
      } else {
        const data = await response.json()
        alert(data.message || '删除失败，请重试')
      }
    } catch (error) {
      console.error('Error deleting customer:', error)
      alert('删除时发生错误')
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('zh-CN')
  }

  const calculateAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) return '-'
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  const getCustomerTypeColor = (type: string) => {
    const colors = {
      potential: 'bg-gray-100 text-gray-800',
      new: 'bg-green-100 text-green-800',
      regular: 'bg-blue-100 text-blue-800',
      vip: 'bg-purple-100 text-purple-800',
      inactive: 'bg-red-100 text-red-800',
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800',
    }
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      blocked: 'bg-red-100 text-red-800',
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const isFollowUpDue = (date?: string) => {
    if (!date) return false
    const followUpDate = new Date(date)
    const today = new Date()
    return followUpDate <= today
  }

  const isProductLow = (productUsage?: Array<{effectiveness?: number}>) => {
    if (!productUsage) return false
    return productUsage.some(product => product.effectiveness && product.effectiveness <= 2)
  }

  const clearFilters = () => {
    setFilterType('')
    setFilterPriority('')
    setFilterStatus('')
    setFilterSalesRep('')
    setSearchTerm('')
    setCurrentPage(1)
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
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="p-2 text-gray-400 hover:text-gray-500"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">客户管理</h1>
                <p className="text-sm text-gray-500">管理客户信息和健康档案</p>
              </div>
            </div>
            <Link
              href="/dashboard/customers/new"
              className="btn btn-primary flex items-center space-x-2"
            >
              <PlusIcon className="h-5 w-5" />
              <span>添加客户</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    setCurrentPage(1)
                  }}
                  className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex-1 max-w-lg">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="form-input pl-10"
                    placeholder="搜索客户姓名、ID或电话..."
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={clearFilters}
                  className="btn btn-secondary text-sm"
                >
                  清除过滤
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">客户类型</label>
                <select
                  className="form-input"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="">全部类型</option>
                  <option value="potential">潜在客户</option>
                  <option value="new">新客户</option>
                  <option value="regular">常规客户</option>
                  <option value="vip">VIP客户</option>
                  <option value="inactive">非活跃</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">优先级</label>
                <select
                  className="form-input"
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                >
                  <option value="">全部优先级</option>
                  <option value="urgent">紧急</option>
                  <option value="high">高</option>
                  <option value="medium">中</option>
                  <option value="low">低</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
                <select
                  className="form-input"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="">全部状态</option>
                  <option value="active">活跃</option>
                  <option value="inactive">非活跃</option>
                  <option value="blocked">已停用</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">销售代表</label>
                <select
                  className="form-input"
                  value={filterSalesRep}
                  onChange={(e) => setFilterSalesRep(e.target.value)}
                >
                  <option value="">全部销售</option>
                  {salesReps.map((rep) => (
                    <option key={rep._id} value={rep._id}>
                      {rep.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Customers Table */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center mb-4">
                <UserGroupIcon className="h-6 w-6 text-gray-400 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">
                  客户列表 ({customers.length} 人)
                </h3>
              </div>

              {customers.length === 0 ? (
                <div className="text-center py-12">
                  <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    暂无客户
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    开始添加客户来管理他们的信息。
                  </p>
                  <div className="mt-6">
                    <Link
                      href="/dashboard/customers/new"
                      className="btn btn-primary"
                    >
                      <PlusIcon className="h-5 w-5 mr-2" />
                      添加客户
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('firstName')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>客户信息</span>
                            {sortField === 'firstName' && (
                              sortOrder === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />
                            )}
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          联系方式
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          年龄/性别
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('customerType')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>类型/优先级</span>
                            {sortField === 'customerType' && (
                              sortOrder === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />
                            )}
                          </div>
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('followUp.nextContactDate')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>回访日期</span>
                            {sortField === 'followUp.nextContactDate' && (
                              sortOrder === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />
                            )}
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          销售代表
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          状态/提醒
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {customers.map((customer) => (
                        <tr key={customer._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {customer.firstName} {customer.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {customer.customerId}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {customer.phone}
                            </div>
                            <div className="text-sm text-gray-500">
                              {customer.email || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {calculateAge(customer.dateOfBirth)} 岁
                            </div>
                            <div className="text-sm text-gray-500">
                              {customer.gender === 'male' ? '男' : customer.gender === 'female' ? '女' : '其他'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-1">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCustomerTypeColor(customer.customerType)}`}>
                                {customer.customerType === 'potential' ? '潜在' : customer.customerType === 'new' ? '新' : customer.customerType === 'regular' ? '常规' : customer.customerType === 'vip' ? 'VIP' : '非活跃'}
                              </span>
                              <br />
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(customer.followUp.priority)}`}>
                                {customer.followUp.priority === 'low' ? '低' : customer.followUp.priority === 'medium' ? '中' : customer.followUp.priority === 'high' ? '高' : '紧急'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {customer.followUp.nextContactDate ? (
                                <div className={`flex items-center space-x-1 ${isFollowUpDue(customer.followUp.nextContactDate) ? 'text-red-600' : ''}`}>
                                  <ChatBubbleLeftRightIcon className="h-4 w-4" />
                                  <span>{formatDate(customer.followUp.nextContactDate)}</span>
                                  {isFollowUpDue(customer.followUp.nextContactDate) && (
                                    <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400">未安排</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {customer.salesRep ? (
                                <div>{customer.salesRep.name}</div>
                              ) : (
                                <span className="text-gray-400">未指定</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-1">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(customer.status)}`}>
                                {customer.status === 'active' ? '活跃' : customer.status === 'inactive' ? '非活跃' : '已停用'}
                              </span>
                              {isProductLow(customer.productUsage) && (
                                <div className="flex items-center space-x-1 text-orange-600">
                                  <ExclamationTriangleIcon className="h-4 w-4" />
                                  <span className="text-xs">产品效果差</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <Link
                                href={`/dashboard/customers/${customer._id}`}
                                className="text-primary-600 hover:text-primary-900"
                                title="查看详情"
                              >
                                <EyeIcon className="h-5 w-5" />
                              </Link>
                              <Link
                                href={`/dashboard/customers/${customer._id}/edit`}
                                className="text-yellow-600 hover:text-yellow-900"
                                title="编辑"
                              >
                                <PencilIcon className="h-5 w-5" />
                              </Link>
                              <button
                                onClick={() => handleDeleteCustomer(customer._id, `${customer.firstName} ${customer.lastName}`)}
                                className="text-red-600 hover:text-red-900"
                                title="删除客户"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
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
                        第 <span className="font-medium">{currentPage}</span> 页，共{' '}
                        <span className="font-medium">{totalPages}</span> 页
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
      </main>
    </div>
  )
}
