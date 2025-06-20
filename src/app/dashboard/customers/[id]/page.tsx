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
  MapPinIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  HeartIcon,
  TagIcon,
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
  nextContactDate?: string
  lastContactDate?: string
  contactFrequency?: string
  healthProfile?: {
    height?: number
    weight?: number
    bmi?: number // Note: This could be calculated, not stored
    bloodType?: string
    chronicConditions?: string[]
    allergies?: string[]
    currentMedications?: string[]
    healthGoals?: string[]
    dietaryRestrictions?: string[]
  }
  productUsage?: Array<{
    productName: string
    productCode?: string
    startDate?: string
    endDate?: string
    dosage?: string
    frequency?: string
    purpose?: string
    effectiveness?: number
    sideEffects?: string
    willContinue?: boolean
    notes?: string
  }>
  purchaseHistory?: Array<{
    orderDate: string
    products: Array<{
      productName: string
      quantity: number
      unitPrice: number
      totalPrice: number
    }>
    totalAmount: number
    paymentMethod?: string
    orderStatus: string
  }>
  interests?: {
    productCategories?: string[]
    healthConcerns?: string[]
    budgetRange?: string
    purchaseFrequency?: string
  }
  address?: {
    street?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
  }
  status: string
  customerValue?: number
  tags?: string[]
  notes?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface CurrentUser {
  role: string
}

export default function CustomerDetailsPage({ params }: { params: { id: string } }) {
  const [customer, setCustomer] = useState<Customer | null>(null)
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
    loadCustomer()
  }, [params.id]) // eslint-disable-line react-hooks/exhaustive-deps 
  // Added eslint-disable for loadCustomer not being in deps, as it's stable in this context or use useCallback

  const loadCustomer = async () => {
    setLoading(true); // Ensure loading is true at the start of a fetch
    setError(''); // Reset error
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/auth/login')
        return
      }

      const response = await fetch(`/api/customers/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setCustomer(data.customer)
      } else if (response.status === 401) {
        router.push('/auth/login')
      } else if (response.status === 404) {
        setError('客户不存在')
        setCustomer(null); // Ensure customer is null on 404
      } else {
        const data = await response.json()
        setError(data.message || '加载客户信息失败')
        setCustomer(null);
      }
    } catch (error) {
      console.error('Error loading customer:', error)
      setError('加载时发生错误')
      setCustomer(null);
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCustomer = async () => {
    if (!customer || !confirm('确定要删除此客户吗？此操作不可逆。')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      // It's good practice to ensure token exists before an API call, even if page loaded with it
      if (!token) {
        alert('用户未登录，请重新登录后再试。');
        router.push('/auth/login');
        return;
      }
      const response = await fetch(`/api/customers/${customer._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        router.push('/dashboard/customers')
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

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('zh-CN')
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
    
    return age >= 0 ? age : '-'; // Ensure age is not negative
  }

  const calculateBMI = (height?: number, weight?: number) => {
    if (!height || !weight || height <= 0 || weight <=0) return '-' // Added checks for valid height/weight
    const bmi = weight / Math.pow(height / 100, 2)
    return bmi.toFixed(1)
  }

  const getCustomerTypeColor = (type: string) => {
    const colors: Record<string, string> = { // Added type for colors object
      potential: 'bg-gray-100 text-gray-800',
      new: 'bg-green-100 text-green-800',
      regular: 'bg-blue-100 text-blue-800',
      vip: 'bg-purple-100 text-purple-800',
      inactive: 'bg-red-100 text-red-800',
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const getContactFrequencyName = (frequency: string) => {
    const names: Record<string, string> = {
      weekly: '每周',
      monthly: '每月',
      quarterly: '每季度',
    }
    return names[frequency] || frequency
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = { // Added type
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      blocked: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getCustomerTypeName = (type: string) => {
    const names: Record<string, string> = { // Added type
      potential: '潜在客户',
      new: '新客户',
      regular: '常规客户',
      vip: 'VIP客户',
      inactive: '非活跃客户',
    }
    return names[type] || type
  }


  const getStatusName = (status: string) => {
    const names: Record<string, string> = { // Added type
      active: '活跃',
      inactive: '非活跃',
      blocked: '已停用',
    }
    return names[status] || status
  }

  const isContactDue = (date?: string) => {
    if (!date) return false
    const contactDate = new Date(date)
    const today = new Date()
    // Set time to 00:00:00 for today to compare dates accurately if contactDate is just a date
    today.setHours(0, 0, 0, 0); 
    contactDate.setHours(0,0,0,0); // Assuming nextContactDate is a date without time
    return contactDate <= today
  }

  const canEditCustomer = () => {
    if (!currentUser) return false
    return ['system_admin', 'admin'].includes(currentUser.role)
  }

  const canDeleteCustomer = () => {
    if (!currentUser) return false
    return ['system_admin', 'admin'].includes(currentUser.role)
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
                href="/dashboard/customers"
                className="p-2 text-gray-400 hover:text-gray-500 mr-4"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">客户详情</h1>
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

  if (!customer) {
    // This case should ideally be covered by error state if customer is not found (404)
    // or loading state. If it reaches here, it's an unexpected state.
    return (
        <div className="min-h-screen flex items-center justify-center">
            <p>未找到客户信息，或仍在加载中。</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/customers"
                className="p-2 text-gray-400 hover:text-gray-500"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">客户详情</h1>
                <p className="text-sm text-gray-500">{customer.firstName} {customer.lastName} 的详细信息</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href={`/dashboard/customers/${customer._id}/health-profile`}
                className="btn btn-primary flex items-center space-x-2"
              >
                <HeartIcon className="h-5 w-5" />
                <span>健康档案</span>
              </Link>
              {canEditCustomer() && (
                <Link
                  href={`/dashboard/customers/${customer._id}/edit`}
                  className="btn btn-secondary flex items-center space-x-2" // Ensure .btn and .btn-secondary are defined in your CSS
                >
                  <PencilIcon className="h-5 w-5" />
                  <span>编辑</span>
                </Link>
              )}
              {canDeleteCustomer() && (
                <button
                  onClick={handleDeleteCustomer}
                  className="btn btn-danger flex items-center space-x-2" // Ensure .btn and .btn-danger are defined in your CSS
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
                      <p className="font-medium text-gray-900">{customer.firstName} {customer.lastName}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <TagIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">客户ID</p>
                      <p className="font-medium text-gray-900">{customer.customerId}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">邮箱</p>
                      <p className="font-medium text-gray-900">{customer.email || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">手机号码</p>
                      <p className="font-medium text-gray-900">{customer.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CalendarIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">年龄</p>
                      <p className="font-medium text-gray-900">
                        {calculateAge(customer.dateOfBirth)} 岁
                        {customer.gender && ` / ${customer.gender === 'male' ? '男' : customer.gender === 'female' ? '女' : '其他'}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {/* Icon placeholder for alignment if needed, or adjust styling */}
                    <div className="h-5 w-5 flex-shrink-0"></div> {/* Or an appropriate icon */}
                    <div>
                      <p className="text-sm text-gray-500">客户类型</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCustomerTypeColor(customer.customerType)}`}>
                        {getCustomerTypeName(customer.customerType)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 地址信息 */}
                {customer.address && (customer.address.street || customer.address.city || customer.address.state || customer.address.country) && (
                  <div className="mt-6">
                    <div className="flex items-center space-x-3">
                      <MapPinIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">地址</p>
                        <p className="font-medium text-gray-900">
                          {[
                            customer.address.country,
                            customer.address.state,
                            customer.address.city,
                            customer.address.street
                          ].filter(Boolean).join(' ')}
                          {customer.address.zipCode && ` (${customer.address.zipCode})`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 健康档案 */}
              {customer.healthProfile && (
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">健康档案</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(customer.healthProfile.height || customer.healthProfile.weight) && (
                      <>
                        <div>
                          <p className="text-sm text-gray-500">身高/体重</p>
                          <p className="font-medium text-gray-900">
                            {customer.healthProfile.height || '-'} cm / {customer.healthProfile.weight || '-'} kg
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">BMI</p>
                          <p className="font-medium text-gray-900">
                            {calculateBMI(customer.healthProfile.height, customer.healthProfile.weight)}
                          </p>
                        </div>
                      </>
                    )}
                    {customer.healthProfile.bloodType && (
                      <div>
                        <p className="text-sm text-gray-500">血型</p>
                        <p className="font-medium text-gray-900">{customer.healthProfile.bloodType}</p>
                      </div>
                    )}
                  </div>

                  {customer.healthProfile.chronicConditions && customer.healthProfile.chronicConditions.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-500 mb-2">慢性疾病</p>
                      <div className="flex flex-wrap gap-2">
                        {customer.healthProfile.chronicConditions.map((condition, index) => (
                          <span key={index} className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                            {condition}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {customer.healthProfile.allergies && customer.healthProfile.allergies.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-500 mb-2">过敏史</p>
                      <div className="flex flex-wrap gap-2">
                        {customer.healthProfile.allergies.map((allergy, index) => (
                          <span key={index} className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                            {allergy}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {customer.healthProfile.healthGoals && customer.healthProfile.healthGoals.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-500 mb-2">健康目标</p>
                      <div className="flex flex-wrap gap-2">
                        {customer.healthProfile.healthGoals.map((goal, index) => (
                          <span key={index} className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            {goal}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 产品使用情况 */}
              {customer.productUsage && customer.productUsage.length > 0 && (
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">产品使用情况</h3>
                  <div className="space-y-4">
                    {customer.productUsage.map((product, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4"> {/* Consider more stable key if possible */}
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900">{product.productName}</h4>
                          {typeof product.effectiveness === 'number' && ( // Check if effectiveness is a number
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500">效果评分:</span>
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <HeartIcon
                                    key={star}
                                    className={`h-4 w-4 ${
                                      star <= (product.effectiveness || 0) // Safe access
                                        ? 'text-red-500 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">用法用量</p>
                            <p className="font-medium">{product.dosage || '-'} {product.frequency || ''}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">使用目的</p>
                            <p className="font-medium">{product.purpose || '-'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">开始日期</p>
                            <p className="font-medium">{formatDate(product.startDate)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">是否继续</p>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              product.willContinue ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {product.willContinue ? '是' : '否'}
                            </span>
                          </div>
                        </div>
                        {product.notes && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-500">备注：{product.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 购买历史 */}
              {customer.purchaseHistory && customer.purchaseHistory.length > 0 && (
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">购买历史</h3>
                  <div className="space-y-4">
                    {customer.purchaseHistory.map((purchase, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4"> {/* Consider more stable key */}
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-gray-900">订单日期: {formatDate(purchase.orderDate)}</p>
                            <p className="text-sm text-gray-500">支付方式: {purchase.paymentMethod || '-'}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">¥{purchase.totalAmount.toLocaleString()}</p>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              purchase.orderStatus === 'delivered' ? 'bg-green-100 text-green-800' : 
                              purchase.orderStatus === 'shipped' ? 'bg-blue-100 text-blue-800' :
                              purchase.orderStatus === 'paid' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {purchase.orderStatus} {/* Consider mapping to Chinese names */}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          {purchase.products.map((product, productIndex) => (
                            <div key={productIndex} className="flex justify-between text-sm"> {/* Consider more stable key */}
                              <span>{product.productName} × {product.quantity}</span>
                              <span>¥{product.totalPrice.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 右侧信息 */}
            <div className="space-y-6">
              {/* 联系信息 */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">联系信息</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">下次联系日期</p>
                      {customer.nextContactDate ? (
                        <div className={`flex items-center space-x-2 ${isContactDue(customer.nextContactDate) ? 'text-red-600' : 'text-gray-900'}`}>
                          <p className="font-medium">{formatDate(customer.nextContactDate)}</p>
                          {isContactDue(customer.nextContactDate) && (
                            <ExclamationTriangleIcon className="h-4 w-4 text-red-500" title="联系日期已到或已过" />
                          )}
                        </div>
                      ) : (
                        <p className="font-medium text-gray-900">未安排</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">最后联系</p>
                    <p className="font-medium text-gray-900">{formatDate(customer.lastContactDate)}</p>
                  </div>
                  {customer.contactFrequency && (
                    <div>
                      <p className="text-sm text-gray-500">联系频率</p>
                      <p className="font-medium text-gray-900">{getContactFrequencyName(customer.contactFrequency)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 销售信息 */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">销售信息</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">销售代表</p>
                    <p className="font-medium text-gray-900">
                      {customer.salesRep ? customer.salesRep.name : '未指定'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">状态</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(customer.status)}`}>
                      {getStatusName(customer.status)}
                    </span>
                  </div>
                  {typeof customer.customerValue === 'number' && ( // Check if customerValue is a number
                    <div>
                      <p className="text-sm text-gray-500">客户价值评分</p>
                      <div className="flex items-center space-x-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <CurrencyDollarIcon
                              key={star}
                              className={`h-4 w-4 ${
                                star <= (customer.customerValue || 0) // Safe access
                                  ? 'text-yellow-500 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium">{customer.customerValue}/5</span>
                      </div>
                    </div>
                  )}
                  {customer.interests && (
                    <>
                      {customer.interests.budgetRange && (
                        <div>
                          <p className="text-sm text-gray-500">预算范围</p>
                          <p className="font-medium text-gray-900">{customer.interests.budgetRange}</p>
                        </div>
                      )}
                      {customer.interests.purchaseFrequency && (
                        <div>
                          <p className="text-sm text-gray-500">购买频率</p>
                          <p className="font-medium text-gray-900">{customer.interests.purchaseFrequency}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* 标签和备注 */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">标签和备注</h3>
                <div className="space-y-4">
                  {customer.tags && customer.tags.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">标签</p>
                      <div className="flex flex-wrap gap-2">
                        {customer.tags.map((tag, index) => (
                          <span key={index} className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {customer.notes && (
                    <div>
                      <p className="text-sm text-gray-500">备注</p>
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">{customer.notes}</p> {/* Added whitespace-pre-wrap */}
                    </div>
                  )}
                </div>
              </div>

              {/* 账户信息 */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">账户信息</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CalendarIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">创建时间</p>
                      <p className="text-sm font-medium text-gray-900">{formatDateTime(customer.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CalendarIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">最后更新</p>
                      <p className="text-sm font-medium text-gray-900">{formatDateTime(customer.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}