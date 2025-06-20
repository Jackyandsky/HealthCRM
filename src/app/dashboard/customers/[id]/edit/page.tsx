'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeftIcon,
  CheckIcon,
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
    name?: string
  }
  nextContactDate?: string
  lastContactDate?: string
  contactFrequency?: string
  healthProfile?: {
    height?: number
    weight?: number
    bloodType?: string
    chronicConditions?: string[]
    allergies?: string[]
    currentMedications?: string[]
    healthGoals?: string[]
    dietaryRestrictions?: string[]
  }
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
}

interface SalesRep {
  _id: string
  name: string
  department: string
}

// Helper function to parse optional number fields from form strings
const parseOptionalNumber = (val: string): number | undefined => {
  if (val.trim() === '') return undefined;
  const num = Number(val);
  return isNaN(num) ? undefined : num; // Return undefined if not a valid number
};

export default function EditCustomerPage({ params }: { params: { id: string } }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    customerType: 'potential',
    salesRep: '', // Stores the ID of the salesRep
    nextContactDate: '',
    lastContactDate: '',
    contactFrequency: 'monthly',
    status: 'active',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'China',
    },
    healthProfile: {
      height: '',
      weight: '',
      bloodType: '',
      chronicConditions: '',
      allergies: '',
      currentMedications: '',
      healthGoals: '',
      dietaryRestrictions: '',
    },
    interests: {
      budgetRange: '',
      purchaseFrequency: '',
    },
    customerValue: '',
    tags: '',
    notes: '',
  })
  
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [salesReps, setSalesReps] = useState<SalesRep[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const customerId = params.id;

  const loadSalesReps = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        // If a token is absolutely required for this call and missing,
        // a redirect or error state specific to sales reps could be set.
        // For now, assuming the API might allow access or fail gracefully.
        console.warn('No token found for loading sales reps.');
      }
      const response = await fetch('/api/users?role=admin,system_admin', {
        headers: {
          'Authorization': `Bearer ${token}`, // Token might be null here, API should handle
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setSalesReps(data.users || [])
      } else {
        console.error('Failed to load sales reps, status:', response.status);
        // Optionally set an error if sales reps are critical and fail to load
        // setError(prev => prev || '销售代表加载失败'); 
      }
    } catch (err) {
      console.error('Error loading sales reps:', err)
       // setError(prev => prev || '销售代表加载时发生网络错误');
    }
  }, [/* router is stable, add if navigation on error here */]);

  const loadCustomer = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/auth/login')
        return
      }

      const response = await fetch(`/api/customers/${customerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        const customerData = data.customer as Customer
        setCustomer(customerData)
        
        setFormData({
          firstName: customerData.firstName || '',
          lastName: customerData.lastName || '',
          email: customerData.email || '',
          phone: customerData.phone || '',
          dateOfBirth: customerData.dateOfBirth ? 
            new Date(customerData.dateOfBirth).toISOString().split('T')[0] : '',
          gender: customerData.gender || '',
          customerType: customerData.customerType || 'potential',
          salesRep: customerData.salesRep?._id || '',
          nextContactDate: customerData.nextContactDate ? 
            new Date(customerData.nextContactDate).toISOString().split('T')[0] : '',
          lastContactDate: customerData.lastContactDate ? 
            new Date(customerData.lastContactDate).toISOString().split('T')[0] : '',
          contactFrequency: customerData.contactFrequency || 'monthly',
          status: customerData.status || 'active',
          address: {
            street: customerData.address?.street || '',
            city: customerData.address?.city || '',
            state: customerData.address?.state || '',
            zipCode: customerData.address?.zipCode || '',
            country: customerData.address?.country || 'China',
          },
          healthProfile: {
            height: customerData.healthProfile?.height?.toString() || '',
            weight: customerData.healthProfile?.weight?.toString() || '',
            bloodType: customerData.healthProfile?.bloodType || '',
            chronicConditions: customerData.healthProfile?.chronicConditions?.join(', ') || '',
            allergies: customerData.healthProfile?.allergies?.join(', ') || '',
            currentMedications: customerData.healthProfile?.currentMedications?.join(', ') || '',
            healthGoals: customerData.healthProfile?.healthGoals?.join(', ') || '',
            dietaryRestrictions: customerData.healthProfile?.dietaryRestrictions?.join(', ') || '',
          },
          interests: {
            budgetRange: customerData.interests?.budgetRange || '',
            purchaseFrequency: customerData.interests?.purchaseFrequency || '',
          },
          customerValue: customerData.customerValue?.toString() || '',
          tags: customerData.tags?.join(', ') || '',
          notes: customerData.notes || '',
        })
      } else if (response.status === 401) {
        router.push('/auth/login')
      } else if (response.status === 404) {
        setError('客户不存在')
        setCustomer(null);
      } else {
        const resData = await response.json()
        setError(resData.message || '加载客户信息失败')
        setCustomer(null);
      }
    } catch (err) {
      console.error('Error loading customer:', err)
      setError('加载时发生错误')
      setCustomer(null);
    } finally {
      setLoading(false)
    }
  }, [customerId, router]);

  useEffect(() => {
    loadCustomer()
    loadSalesReps()
  }, [loadCustomer, loadSalesReps])


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('用户未认证，请重新登录。');
        router.push('/auth/login');
        setSaving(false);
        return;
      }
      
      const submissionData = {
        ...formData,
        email: formData.email.trim() === '' ? undefined : formData.email.trim(),
        dateOfBirth: formData.dateOfBirth.trim() === '' ? undefined : formData.dateOfBirth,
        gender: formData.gender.trim() === '' ? undefined : formData.gender,
        salesRep: formData.salesRep.trim() === '' ? undefined : formData.salesRep,
        nextContactDate: formData.nextContactDate.trim() === '' ? undefined : formData.nextContactDate,
        lastContactDate: formData.lastContactDate.trim() === '' ? undefined : formData.lastContactDate,
        contactFrequency: formData.contactFrequency,
        address: {
            ...formData.address,
            street: formData.address.street.trim() === '' ? undefined : formData.address.street,
            city: formData.address.city.trim() === '' ? undefined : formData.address.city,
            state: formData.address.state.trim() === '' ? undefined : formData.address.state,
            zipCode: formData.address.zipCode.trim() === '' ? undefined : formData.address.zipCode,
            country: formData.address.country.trim() === '' ? undefined : formData.address.country,
        },
        healthProfile: {
          height: parseOptionalNumber(formData.healthProfile.height),
          weight: parseOptionalNumber(formData.healthProfile.weight),
          bloodType: formData.healthProfile.bloodType.trim() === '' ? undefined : formData.healthProfile.bloodType,
          chronicConditions: formData.healthProfile.chronicConditions.trim()
            ? formData.healthProfile.chronicConditions.split(',').map(s => s.trim()).filter(s => s)
            : [],
          allergies: formData.healthProfile.allergies.trim()
            ? formData.healthProfile.allergies.split(',').map(s => s.trim()).filter(s => s)
            : [],
          currentMedications: formData.healthProfile.currentMedications.trim()
            ? formData.healthProfile.currentMedications.split(',').map(s => s.trim()).filter(s => s)
            : [],
          healthGoals: formData.healthProfile.healthGoals.trim()
            ? formData.healthProfile.healthGoals.split(',').map(s => s.trim()).filter(s => s)
            : [],
          dietaryRestrictions: formData.healthProfile.dietaryRestrictions.trim()
            ? formData.healthProfile.dietaryRestrictions.split(',').map(s => s.trim()).filter(s => s)
            : [],
        },
        interests: {
            ...formData.interests,
            budgetRange: formData.interests.budgetRange.trim() === '' ? undefined : formData.interests.budgetRange,
            purchaseFrequency: formData.interests.purchaseFrequency.trim() === '' ? undefined : formData.interests.purchaseFrequency,
        },
        customerValue: parseOptionalNumber(formData.customerValue),
        tags: formData.tags.trim()
          ? formData.tags.split(',').map(s => s.trim()).filter(s => s)
          : [],
        notes: formData.notes.trim() === '' ? undefined : formData.notes,
      };

      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(submissionData),
      })

      const data = await response.json() // Attempt to parse JSON regardless of status for error messages

      if (response.ok) {
        router.push(`/dashboard/customers/${customerId}`)
      } else {
        setError(data.message || `更新客户失败 (状态: ${response.status})`)
      }
    } catch (err) {
      console.error('Update customer error:', err)
      setError('更新时发生错误，请重试')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as object),
          [child]: value,
        },
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error && !customer) {
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
              <h1 className="text-2xl font-bold text-gray-900">编辑客户</h1>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link
                href={`/dashboard/customers/${customerId}`}
                className="p-2 text-gray-400 hover:text-gray-500"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">编辑客户</h1>
                <p className="text-sm text-gray-500">修改 {customer?.firstName || formData.firstName} {customer?.lastName || formData.lastName} 的信息</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
                {error}
              </div>
            )}

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">基本信息</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="lastName" className="form-label">姓 *</label>
                  <input
                    id="lastName"
                    type="text"
                    name="lastName"
                    required
                    className="form-input"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="firstName" className="form-label">名 *</label>
                  <input
                    id="firstName"
                    type="text"
                    name="firstName"
                    required
                    className="form-input"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="form-label">手机号码 *</label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    required
                    className="form-input"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="form-label">邮箱</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    className="form-input"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="dateOfBirth" className="form-label">出生日期</label>
                  <input
                    id="dateOfBirth"
                    type="date"
                    name="dateOfBirth"
                    className="form-input"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="gender" className="form-label">性别</label>
                  <select
                    id="gender"
                    name="gender"
                    className="form-input"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="">请选择</option>
                    <option value="male">男</option>
                    <option value="female">女</option>
                    <option value="other">其他</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">客户分类</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="customerType" className="form-label">客户类型</label>
                  <select
                    id="customerType"
                    name="customerType"
                    className="form-input"
                    value={formData.customerType}
                    onChange={handleChange}
                  >
                    <option value="potential">潜在客户</option>
                    <option value="new">新客户</option>
                    <option value="regular">常规客户</option>
                    <option value="vip">VIP客户</option>
                    <option value="inactive">非活跃客户</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="salesRep" className="form-label">分配销售</label>
                  <select
                    id="salesRep"
                    name="salesRep"
                    className="form-input"
                    value={formData.salesRep}
                    onChange={handleChange}
                  >
                    <option value="">请选择销售代表</option>
                    {salesReps.map((rep) => (
                      <option key={rep._id} value={rep._id}>
                        {rep.name} {rep.department ? `- ${rep.department}`: ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="status" className="form-label">客户状态</label>
                  <select
                    id="status"
                    name="status"
                    className="form-input"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="active">活跃</option>
                    <option value="inactive">非活跃</option>
                    <option value="blocked">已停用</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="customerValue" className="form-label">客户价值评分 (1-5)</label>
                  <select
                    id="customerValue"
                    name="customerValue"
                    className="form-input"
                    value={formData.customerValue}
                    onChange={handleChange}
                  >
                    <option value="">请选择</option>
                    <option value="1">1星</option>
                    <option value="2">2星</option>
                    <option value="3">3星</option>
                    <option value="4">4星</option>
                    <option value="5">5星</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">联系管理</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="nextContactDate" className="form-label">下次联系日期</label>
                  <input
                    id="nextContactDate"
                    type="date"
                    name="nextContactDate"
                    className="form-input"
                    value={formData.nextContactDate}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="lastContactDate" className="form-label">最后联系日期</label>
                  <input
                    id="lastContactDate"
                    type="date"
                    name="lastContactDate"
                    className="form-input"
                    value={formData.lastContactDate}
                    onChange={handleChange}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="contactFrequency" className="form-label">联系频率</label>
                  <select
                    id="contactFrequency"
                    name="contactFrequency"
                    className="form-input"
                    value={formData.contactFrequency}
                    onChange={handleChange}
                  >
                    <option value="weekly">每周</option>
                    <option value="monthly">每月</option>
                    <option value="quarterly">每季度</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">健康档案</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="healthProfile.height" className="form-label">身高 (cm)</label>
                  <input
                    id="healthProfile.height"
                    type="number"
                    name="healthProfile.height"
                    className="form-input"
                    value={formData.healthProfile.height}
                    onChange={handleChange}
                    placeholder="例如: 175"
                  />
                </div>
                <div>
                  <label htmlFor="healthProfile.weight" className="form-label">体重 (kg)</label>
                  <input
                    id="healthProfile.weight"
                    type="number"
                    name="healthProfile.weight"
                    className="form-input"
                    value={formData.healthProfile.weight}
                    onChange={handleChange}
                    placeholder="例如: 70"
                  />
                </div>
                <div>
                  <label htmlFor="healthProfile.bloodType" className="form-label">血型</label>
                  <select
                    id="healthProfile.bloodType"
                    name="healthProfile.bloodType"
                    className="form-input"
                    value={formData.healthProfile.bloodType}
                    onChange={handleChange}
                  >
                    <option value="">请选择</option>
                    <option value="A">A型</option>
                    <option value="B">B型</option>
                    <option value="AB">AB型</option>
                    <option value="O">O型</option>
                    <option value="Unknown">未知</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="healthProfile.chronicConditions" className="form-label">慢性疾病 (用逗号分隔)</label>
                  <input
                    id="healthProfile.chronicConditions"
                    type="text"
                    name="healthProfile.chronicConditions"
                    className="form-input"
                    placeholder="如：高血压, 糖尿病"
                    value={formData.healthProfile.chronicConditions}
                    onChange={handleChange}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="healthProfile.allergies" className="form-label">过敏史 (用逗号分隔)</label>
                  <input
                    id="healthProfile.allergies"
                    type="text"
                    name="healthProfile.allergies"
                    className="form-input"
                    placeholder="如：海鲜, 花粉"
                    value={formData.healthProfile.allergies}
                    onChange={handleChange}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="healthProfile.currentMedications" className="form-label">当前用药 (用逗号分隔)</label>
                  <input
                    id="healthProfile.currentMedications"
                    type="text"
                    name="healthProfile.currentMedications"
                    className="form-input"
                    placeholder="如：降压药, 维生素D"
                    value={formData.healthProfile.currentMedications}
                    onChange={handleChange}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="healthProfile.healthGoals" className="form-label">健康目标 (用逗号分隔)</label>
                  <input
                    id="healthProfile.healthGoals"
                    type="text"
                    name="healthProfile.healthGoals"
                    className="form-input"
                    placeholder="如：减肥, 增强免疫力, 改善睡眠"
                    value={formData.healthProfile.healthGoals}
                    onChange={handleChange}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="healthProfile.dietaryRestrictions" className="form-label">饮食限制 (用逗号分隔)</label>
                  <input
                    id="healthProfile.dietaryRestrictions"
                    type="text"
                    name="healthProfile.dietaryRestrictions"
                    className="form-input"
                    placeholder="如：素食, 无糖, 低钠"
                    value={formData.healthProfile.dietaryRestrictions}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">兴趣和需求</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="interests.budgetRange" className="form-label">预算范围</label>
                  <select
                    id="interests.budgetRange"
                    name="interests.budgetRange"
                    className="form-input"
                    value={formData.interests.budgetRange}
                    onChange={handleChange}
                  >
                    <option value="">请选择</option>
                    <option value="under_500">500元以下</option>
                    <option value="500_1000">500-1000元</option>
                    <option value="1000_2000">1000-2000元</option>
                    <option value="2000_5000">2000-5000元</option>
                    <option value="over_5000">5000元以上</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="interests.purchaseFrequency" className="form-label">购买频率</label>
                  <select
                    id="interests.purchaseFrequency"
                    name="interests.purchaseFrequency"
                    className="form-input"
                    value={formData.interests.purchaseFrequency}
                    onChange={handleChange}
                  >
                    <option value="">请选择</option>
                    <option value="monthly">每月</option>
                    <option value="quarterly">每季度</option>
                    <option value="semi_annually">每半年</option>
                    <option value="annually">每年</option>
                    <option value="irregular">不定期</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">地址信息</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="address.street" className="form-label">详细地址</label>
                  <input
                    id="address.street"
                    type="text"
                    name="address.street"
                    className="form-input"
                    value={formData.address.street}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="address.city" className="form-label">城市</label>
                  <input
                    id="address.city"
                    type="text"
                    name="address.city"
                    className="form-input"
                    value={formData.address.city}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="address.state" className="form-label">省份</label>
                  <input
                    id="address.state"
                    type="text"
                    name="address.state"
                    className="form-input"
                    value={formData.address.state}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="address.zipCode" className="form-label">邮编</label>
                  <input
                    id="address.zipCode"
                    type="text"
                    name="address.zipCode"
                    className="form-input"
                    value={formData.address.zipCode}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="address.country" className="form-label">国家</label>
                  <input
                    id="address.country"
                    type="text"
                    name="address.country"
                    className="form-input"
                    value={formData.address.country}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">标签和备注</h3>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="tags" className="form-label">标签 (用逗号分隔)</label>
                  <input
                    id="tags"
                    type="text"
                    name="tags"
                    className="form-input"
                    placeholder="如：高价值客户, 重点关注, VIP"
                    value={formData.tags}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="notes" className="form-label">客户备注</label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={4}
                    className="form-input"
                    placeholder="记录客户特殊情况、偏好等..."
                    value={formData.notes}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6">
              <Link
                href={`/dashboard/customers/${customerId}`}
                className="btn btn-secondary"
              >
                取消
              </Link>
              <button
                type="submit"
                disabled={saving || loading}
                className="btn btn-primary flex items-center space-x-2"
              >
                <CheckIcon className="h-5 w-5" />
                <span>{saving ? '保存中...' : '保存更改'}</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}