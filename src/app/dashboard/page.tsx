'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  UserGroupIcon,
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  BellIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  UsersIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline'

interface User {
  id: string
  name: string
  email: string
  role: string
  department: string
}

interface DashboardStats {
  totalCustomers: number
  newCustomers: number
  pendingFollowUps: number
  totalRevenue: number
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    newCustomers: 0,
    pendingFollowUps: 0,
    totalRevenue: 0,
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      router.push('/auth/login')
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      loadDashboardStats()
    } catch (error) {
      console.error('Error parsing user data:', error)
      router.push('/auth/login')
    }
  }, [router])

  const loadDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const menuItems = [
    {
      name: '客户管理',
      href: '/dashboard/customers',
      icon: UserGroupIcon,
      description: '管理客户信息和健康档案',
      roles: ['system_admin', 'admin'],
    },
    {
      name: '产品管理',
      href: '/dashboard/products',
      icon: ShoppingBagIcon,
      description: 'USANA产品目录管理',
      roles: ['system_admin', 'admin'],
    },
    {
      name: '健康计划',
      href: '/dashboard/health-plans',
      icon: HeartIcon,
      description: '个性化健康计划和补充方案',
      roles: ['system_admin', 'admin'],
    },
    {
      name: '购买记录',
      href: '/dashboard/purchases',
      icon: CurrencyDollarIcon,
      description: '客户购买记录和销售管理',
      roles: ['system_admin', 'admin'],
    },
    {
      name: '跟进管理',
      href: '/dashboard/follow-ups',
      icon: ChatBubbleLeftRightIcon,
      description: '客户跟进和沟通记录',
      roles: ['system_admin', 'admin'],
    },
    {
      name: '用户管理',
      href: '/dashboard/users',
      icon: UsersIcon,
      description: '管理系统用户和权限',
      roles: ['system_admin'],
    },
    {
      name: '数据分析',
      href: '/dashboard/analytics',
      icon: ChartBarIcon,
      description: '销售报表和数据统计',
      roles: ['system_admin', 'admin'],
    },
    {
      name: '系统设置',
      href: '/dashboard/settings',
      icon: Cog6ToothIcon,
      description: '系统配置和参数设置',
      roles: ['system_admin'],
    },
  ]

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role || '')
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-2xl font-bold text-primary-900">
                Health CRM
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-500">
                <BellIcon className="h-6 w-6" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-gray-500"
                  title="退出登录"
                >
                  <ArrowRightOnRectangleIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              欢迎回来，{user?.name}
            </h1>
            <p className="mt-1 text-gray-600">
              {user?.department} - {user?.role}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UserGroupIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        总客户数
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.totalCustomers}
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
                    <UserGroupIcon className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        新增客户
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.newCustomers}
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
                        待回访客户
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.pendingFollowUps}
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
                    <ChartBarIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        月销售额
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        ¥{stats.totalRevenue.toLocaleString()}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMenuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="relative group bg-white p-6 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 rounded-lg shadow hover:shadow-md transition-shadow duration-200"
              >
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-primary-50 text-primary-600 group-hover:bg-primary-100">
                    <item.icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {item.name}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {item.description}
                  </p>
                </div>
                <span
                  className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400"
                  aria-hidden="true"
                >
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="m11.293 17.293 1.414 1.414L19.414 12l-6.707-6.707-1.414 1.414L15.586 11H6v2h9.586l-4.293 4.293z" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>

          {/* Quick Stats for Urgent Items */}
          {(user?.role === 'system_admin' || user?.role === 'admin') && (
            <div className="mt-8 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">需要关注的事项</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ChatBubbleLeftRightIcon className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">需要回访</p>
                      <p className="text-sm text-red-600">5 位客户</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <HeartIcon className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-yellow-800">产品余量不足</p>
                      <p className="text-sm text-yellow-600">3 位客户</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <UserGroupIcon className="h-5 w-5 text-orange-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-orange-800">高价值客户</p>
                      <p className="text-sm text-orange-600">2 位客户</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
