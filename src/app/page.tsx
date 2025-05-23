import Link from 'next/link'
import { 
  UserGroupIcon, 
  CalendarIcon, 
  DocumentTextIcon, 
  CurrencyDollarIcon,
  ChartBarIcon,
  Cog6ToothIcon 
} from '@heroicons/react/24/outline'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-primary-900">Health CRM</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/login"
                className="btn btn-secondary"
              >
                登录
              </Link>
              <Link
                href="/auth/register"
                className="btn btn-primary"
              >
                注册
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            客户健康与消费
            <span className="text-primary-600">管理系统</span>
          </h2>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            集成客户管理、健康计划、购买记录和用户反馈的一体化解决方案
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Link
                href="/dashboard"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10"
              >
                进入系统
              </Link>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Customer Management */}
            <div className="card">
              <div className="card-body text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  <UserGroupIcon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">客户管理</h3>
                <p className="mt-2 text-base text-gray-500">
                  完整的客户信息管理，包括购买历史、健康计划等
                </p>
              </div>
            </div>

            {/* Plan Management (New Feature) */}
            <div className="card">
              <div className="card-body text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  <CalendarIcon className="h-6 w-6" /> {/* Re-using icon, consider changing if a better one is available */}
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">计划管理</h3>
                <p className="mt-2 text-base text-gray-500">
                  创建和管理客户的健康计划和产品使用方案
                </p>
              </div>
            </div>

            {/* Follow-up/Feedback Management (New Feature) */}
            <div className="card">
              <div className="card-body text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  <DocumentTextIcon className="h-6 w-6" /> {/* Re-using icon */}
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">回访记录</h3>
                <p className="mt-2 text-base text-gray-500">
                  记录客户回访信息和产品使用反馈
                </p>
              </div>
            </div>

            {/* Product Management (New or existing, but relevant to CRM) */}
            <div className="card">
              <div className="card-body text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  {/* Assuming CurrencyDollarIcon or similar for products/purchases */}
                  <CurrencyDollarIcon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">产品与购买</h3>
                <p className="mt-2 text-base text-gray-500">
                  管理产品信息并记录客户购买历史
                </p>
              </div>
            </div>

            {/* Analytics */}
            <div className="card">
              <div className="card-body text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  <ChartBarIcon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">数据分析</h3>
                <p className="mt-2 text-base text-gray-500">
                  实时数据报表和分析，帮助优化医疗服务质量
                </p>
              </div>
            </div>

            {/* Settings */}
            <div className="card">
              <div className="card-body text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  <Cog6ToothIcon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">系统配置</h3>
                <p className="mt-2 text-base text-gray-500">
                  灵活的系统配置，支持多角色权限管理和个性化设置
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-16">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900">系统概览</h3>
              <p className="mt-2 text-gray-600">一体化医疗管理解决方案</p>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-8 md:grid-cols-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">500+</div>
                <div className="text-sm text-gray-500">活跃用户</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">100+</div>
                <div className="text-sm text-gray-500">健康计划</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">20+</div>
                <div className="text-sm text-gray-500">管理人员</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">98%</div>
                <div className="text-sm text-gray-500">客户满意度</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-base text-gray-500">
              © 2024 Health CRM. 保留所有权利。
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
