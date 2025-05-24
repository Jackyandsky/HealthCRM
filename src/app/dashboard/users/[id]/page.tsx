'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'

interface User {
  _id: string
  employeeId: string
  name: string
  email: string
  role: string
  phone?: string
  salesInfo?: {
    territory?: string
    teamLead?: {
      _id: string
      name: string
      employeeId: string
    }
    commissionRate?: number
    salesGoal?: {
      monthly?: number
      quarterly?: number
      annual?: number
    }
    certification?: {
      level?: string
      expiryDate?: string
    }
  }
  performance?: {
    currentMonth?: {
      sales: number
      customers: number
      orders: number
    }
    currentQuarter?: {
      sales: number
      customers: number
      orders: number
    }
    currentYear?: {
      sales: number
      customers: number
      orders: number
    }
  }
  customerAccess?: {
    canViewAll?: boolean
    assignedTerritories?: string[]
    customerLimit?: number
  }
  isActive: boolean
  lastLogin?: string
  createdAt: string
  updatedAt: string
}

interface CurrentUser {
  role: string
}

export default function UserDetailsPage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<User | null>(null)
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Get current user info
    const userData = localStorage.getItem('user')
    if (userData) {
      setCurrentUser(JSON.parse(userData))
    }
    loadUser()
  }, [params.id])

  const loadUser = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/auth/login')
        return
      }

      const response = await fetch(`/api/users/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else if (response.status === 401) {
        router.push('/auth/login')
      } else if (response.status === 404) {
        setError('用户不存在')
      } else {
        const data = await response.json()
        setError(data.message || '加载用户信息失败')
      }
    } catch (error) {
      console.error('Error loading user:', error)
      setError('加载时发生错误')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!user || !confirm('确定要删除此用户吗？此操作不可逆。')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/users/${user._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        router.push('/dashboard/users')
      } else {
        const data = await response.json()
        alert(data.message || '删除失败，请重试')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('删除时发生错误')
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('zh-CN')
  }

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('zh-CN')
  }

  const getRoleColor = (role: string) => {
    const colors = {
      system_admin: 'bg-red-100 text-red-800',
      admin: 'bg-blue-100 text-blue-800',
      customer: 'bg-green-100 text-green-800',
    }
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getRoleName = (role: string) => {
    const names = {
      system_admin: '系统管理员',
      admin: '管理员',
      customer: '客户',
    }
    return names[role as keyof typeof names] || role
  }

  const canEditUser = () => {
    if (!currentUser || !user) return false
    // 系统管理员可以编辑所有用户，管理员只能编辑客户
    if (currentUser.role === 'system_admin') return true
    if (currentUser.role === 'admin' && user.role === 'customer') return true
    return false
  }

  const canDeleteUser = () => {
    if (!currentUser || !user) return false
    // 系统管理员可以删除非系统管理员的用户，管理员只能删除客户
    if (currentUser.role === 'system_admin' && user.role !== 'system_admin') return true
    if (currentUser.role === 'admin' && user.role === 'customer') return true
    return false
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
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center py-4">
              <Link
                href="/dashboard/users"
                className="p-2 text-gray-400 hover:text-gray-500 mr-4"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">用户详情</h1>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/users"
                className="p-2 text-gray-400 hover:text-gray-500"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">用户详情</h1>
                <p className="text-sm text-gray-500">{user.name} 的详细信息</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {canEditUser() && (
                <Link
                  href={`/dashboard/users/${user._id}/edit`}
                  className="btn btn-secondary flex items-center space-x-2"
                >
                  <PencilIcon className="h-5 w-5" />
                  <span>编辑</span>
                </Link>
              )}
              {canDeleteUser() && (
                <button
                  onClick={handleDeleteUser}
                  className="btn btn-danger flex items-center space-x-2"
                >
                  <TrashIcon className="h-5 w-5" />
                  <span>删除</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左侧主要信息 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 基本信息 */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">基本信息</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">姓名</p>
                      <p className="font-medium text-gray-900">{user.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">员工ID</p>
                      <p className="font-medium text-gray-900">{user.employeeId || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">邮箱</p>
                      <p className="font-medium text-gray-900">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">手机号码</p>
                      <p className="font-medium text-gray-900">{user.phone || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="h-5 w-5"></div>
                    <div>
                      <p className="text-sm text-gray-500">角色</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                        {getRoleName(user.role)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="h-5 w-5"></div>
                    <div>
                      <p className="text-sm text-gray-500">状态</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? '活跃' : '停用'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 销售信息 - 仅对管理员和系统管理员显示 */}
              {(user.role === 'admin' || user.role === 'system_admin') && user.salesInfo && (
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">销售信息</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-500">销售区域</p>
                      <p className="font-medium text-gray-900">{user.salesInfo.territory || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">团队主管</p>
                      <p className="font-medium text-gray-900">
                        {user.salesInfo.teamLead ? 
                          `${user.salesInfo.teamLead.name} (${user.salesInfo.teamLead.employeeId})` : 
                          '-'
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">佣金比例</p>
                      <p className="font-medium text-gray-900">
                        {user.salesInfo.commissionRate ? `${user.salesInfo.commissionRate}%` : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">认证级别</p>
                      <p className="font-medium text-gray-900">{user.salesInfo.certification?.level || '-'}</p>
                    </div>
                  </div>

                  {/* 销售目标 */}
                  {user.salesInfo.salesGoal && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">销售目标</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-500">月度目标</p>
                          <p className="text-lg font-semibold text-gray-900">
                            ¥{user.salesInfo.salesGoal.monthly?.toLocaleString() || '-'}
                          </p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-500">季度目标</p>
                          <p className="text-lg font-semibold text-gray-900">
                            ¥{user.salesInfo.salesGoal.quarterly?.toLocaleString() || '-'}
                          </p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-500">年度目标</p>
                          <p className="text-lg font-semibold text-gray-900">
                            ¥{user.salesInfo.salesGoal.annual?.toLocaleString() || '-'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 业绩统计 - 仅对管理员和系统管理员显示 */}
              {(user.role === 'admin' || user.role === 'system_admin') && user.performance && (
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">业绩统计</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* 本月业绩 */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">本月业绩</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">销售额</span>
                          <span className="text-sm font-medium">¥{user.performance.currentMonth?.sales?.toLocaleString() || '0'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">客户数</span>
                          <span className="text-sm font-medium">{user.performance.currentMonth?.customers || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">订单数</span>
                          <span className="text-sm font-medium">{user.performance.currentMonth?.orders || 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* 本季业绩 */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">本季业绩</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">销售额</span>
                          <span className="text-sm font-medium">¥{user.performance.currentQuarter?.sales?.toLocaleString() || '0'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">客户数</span>
                          <span className="text-sm font-medium">{user.performance.currentQuarter?.customers || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">订单数</span>
                          <span className="text-sm font-medium">{user.performance.currentQuarter?.orders || 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* 本年业绩 */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">本年业绩</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">销售额</span>
                          <span className="text-sm font-medium">¥{user.performance.currentYear?.sales?.toLocaleString() || '0'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">客户数</span>
                          <span className="text-sm font-medium">{user.performance.currentYear?.customers || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">订单数</span>
                          <span className="text-sm font-medium">{user.performance.currentYear?.orders || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 右侧信息 */}
            <div className="space-y-6">
              {/* 账户信息 */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">账户信息</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CalendarIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">创建时间</p>
                      <p className="text-sm font-medium text-gray-900">{formatDateTime(user.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CalendarIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">最后更新</p>
                      <p className="text-sm font-medium text-gray-900">{formatDateTime(user.updatedAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CalendarIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">最后登录</p>
                      <p className="text-sm font-medium text-gray-900">{formatDateTime(user.lastLogin)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 客户访问权限 - 仅对管理员和系统管理员显示 */}
              {(user.role === 'admin' || user.role === 'system_admin') && user.customerAccess && (
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">客户访问权限</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">查看所有客户</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.customerAccess.canViewAll 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.customerAccess.canViewAll ? '是' : '否'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">分配区域</p>
                      <p className="text-sm font-medium text-gray-900">
                        {user.customerAccess.assignedTerritories?.length ? 
                          user.customerAccess.assignedTerritories.join(', ') : 
                          '-'
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">客户数量限制</p>
                      <p className="text-sm font-medium text-gray-900">
                        {user.customerAccess.customerLimit || '无限制'}
                      </p>
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
