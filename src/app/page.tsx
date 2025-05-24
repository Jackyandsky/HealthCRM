import Link from 'next/link'
import { 
  UserGroupIcon, 
  ShoppingBagIcon,
  HeartIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ChatBubbleLeftRightIcon
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
            USANA保健品
            <span className="text-primary-600">客户关系管理</span>
          </h2>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            专为USANA保健品销售人员打造的客户健康与消费管理一体化解决方案
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
                  完整的客户信息管理，包括健康档案、消费记录等
                </p>
              </div>
            </div>

            {/* Product Management */}
            <div className="card">
              <div className="card-body text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  <ShoppingBagIcon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">商品管理</h3>
                <p className="mt-2 text-base text-gray-500">
                  USANA保健品信息管理，支持分类和搜索功能
                </p>
              </div>
            </div>

            {/* Health Plans */}
            <div className="card">
              <div className="card-body text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  <HeartIcon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">服用计划</h3>
                <p className="mt-2 text-base text-gray-500">
                  针对客户健康状况制定个性化的保健品服用计划
                </p>
              </div>
            </div>

            {/* Purchase Records */}
            <div className="card">
              <div className="card-body text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  <CurrencyDollarIcon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">购买记录</h3>
                <p className="mt-2 text-base text-gray-500">
                  客户购买历史记录，支持消费潜力分析和跟踪
                </p>
              </div>
            </div>

            {/* Follow-up Records */}
            <div className="card">
              <div className="card-body text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  <ChatBubbleLeftRightIcon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">回访记录</h3>
                <p className="mt-2 text-base text-gray-500">
                  客户回访和反馈管理，跟踪产品使用效果
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
                  销售数据报表和分析，帮助优化销售策略
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
                <div className="text-sm text-gray-500">活跃患者</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">1200+</div>
                <div className="text-sm text-gray-500">预约记录</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">50+</div>
                <div className="text-sm text-gray-500">医护人员</div>
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
