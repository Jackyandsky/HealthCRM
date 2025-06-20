'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeftIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  BellIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  ClockIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth/login')
      return
    }
    
    setLoading(false)
  }, [router])

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
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Link
                  href="/dashboard"
                  className="text-gray-400 hover:text-gray-600 mr-4"
                >
                  <ArrowLeftIcon className="h-6 w-6" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">系统设置</h1>
                  <p className="mt-1 text-sm text-gray-600">
                    系统配置和参数管理
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Placeholder Content */}
        <div className="text-center py-12">
          <Cog6ToothIcon className="mx-auto h-24 w-24 text-gray-400" />
          <h3 className="mt-4 text-xl font-medium text-gray-900">系统设置模块</h3>
          <p className="mt-2 text-gray-600 max-w-lg mx-auto">
            这个功能正在开发中。将包括用户权限管理、系统参数配置、业务规则设置等全面的系统管理功能。
          </p>
          
          {/* Settings Categories */}
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-blue-100 rounded-lg">
                <UserGroupIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="mt-4 text-lg font-medium text-gray-900">用户管理</h4>
              <p className="mt-2 text-sm text-gray-600">
                用户权限配置、角色管理、部门设置、访问控制
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-lg">
                <ShieldCheckIcon className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="mt-4 text-lg font-medium text-gray-900">安全设置</h4>
              <p className="mt-2 text-sm text-gray-600">
                密码策略、登录安全、数据加密、审计日志
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-purple-100 rounded-lg">
                <BellIcon className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="mt-4 text-lg font-medium text-gray-900">通知设置</h4>
              <p className="mt-2 text-sm text-gray-600">
                邮件通知、短信提醒、系统消息、跟进提醒
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-yellow-100 rounded-lg">
                <GlobeAltIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <h4 className="mt-4 text-lg font-medium text-gray-900">系统配置</h4>
              <p className="mt-2 text-sm text-gray-600">
                区域设置、语言配置、时区设定、系统参数
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-lg">
                <CurrencyDollarIcon className="h-6 w-6 text-red-600" />
              </div>
              <h4 className="mt-4 text-lg font-medium text-gray-900">业务设置</h4>
              <p className="mt-2 text-sm text-gray-600">
                产品价格策略、佣金配置、库存阈值、业务流程
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-indigo-100 rounded-lg">
                <ClockIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <h4 className="mt-4 text-lg font-medium text-gray-900">自动化设置</h4>
              <p className="mt-2 text-sm text-gray-600">
                定时任务、自动跟进、库存预警、报表生成
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-pink-100 rounded-lg">
                <DocumentTextIcon className="h-6 w-6 text-pink-600" />
              </div>
              <h4 className="mt-4 text-lg font-medium text-gray-900">模板管理</h4>
              <p className="mt-2 text-sm text-gray-600">
                健康计划模板、邮件模板、报表模板、文档模板
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-gray-100 rounded-lg">
                <Cog6ToothIcon className="h-6 w-6 text-gray-600" />
              </div>
              <h4 className="mt-4 text-lg font-medium text-gray-900">系统维护</h4>
              <p className="mt-2 text-sm text-gray-600">
                数据备份、系统监控、性能优化、错误日志
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-teal-100 rounded-lg">
                <GlobeAltIcon className="h-6 w-6 text-teal-600" />
              </div>
              <h4 className="mt-4 text-lg font-medium text-gray-900">第三方集成</h4>
              <p className="mt-2 text-sm text-gray-600">
                API配置、外部系统集成、数据同步、接口管理
              </p>
            </div>
          </div>

          <div className="mt-12">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Cog6ToothIcon className="h-6 w-6 text-amber-600" />
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-amber-800">
                    开发中功能
                  </h4>
                  <p className="mt-1 text-sm text-amber-700">
                    系统设置模块正在积极开发中，将为系统管理员提供全面的配置管理功能。
                    包括用户权限细粒度控制、业务流程自定义、系统性能监控等高级功能。
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h4 className="text-lg font-medium text-gray-900 mb-4">临时访问</h4>
            <div className="flex justify-center space-x-4">
              <Link
                href="/dashboard/users"
                className="btn btn-primary"
              >
                用户管理
              </Link>
              <Link
                href="/dashboard"
                className="btn btn-secondary"
              >
                返回仪表板
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}