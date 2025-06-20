'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeftIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline'

interface SalesRep {
  _id: string
  name: string
  department: string
}

export default function NewCustomerPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    customerType: 'potential',
    salesRep: '',
    nextContactDate: '',
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
      chronicConditions: '',
      allergies: '',
      healthGoals: '',
    },
    interests: {
      budgetRange: '',
      purchaseFrequency: '',
    },
    notes: '',
  })
  
  const [salesReps, setSalesReps] = useState<SalesRep[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    loadSalesReps()
  }, [])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      
      // Prepare data for submission
      const submissionData = {
        ...formData,
        healthProfile: {
          ...formData.healthProfile,
          height: formData.healthProfile.height ? Number(formData.healthProfile.height) : undefined,
          weight: formData.healthProfile.weight ? Number(formData.healthProfile.weight) : undefined,
          chronicConditions: formData.healthProfile.chronicConditions 
            ? formData.healthProfile.chronicConditions.split(',').map(s => s.trim()).filter(s => s)
            : [],
          allergies: formData.healthProfile.allergies 
            ? formData.healthProfile.allergies.split(',').map(s => s.trim()).filter(s => s)
            : [],
          healthGoals: formData.healthProfile.healthGoals 
            ? formData.healthProfile.healthGoals.split(',').map(s => s.trim()).filter(s => s)
            : [],
        }
      }

      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(submissionData),
      })

      const data = await response.json()

      if (response.ok) {
        router.push('/dashboard/customers')
      } else {
        setError(data.message || '创建客户失败')
      }
    } catch (error) {
      console.error('Create customer error:', error)
      setError('创建时发生错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as any,
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
                <h1 className="text-2xl font-bold text-gray-900">新增客户</h1>
                <p className="text-sm text-gray-500">创建新的客户档案</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {/* 基本信息 */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">基本信息</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="form-label">姓 *</label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    className="form-input"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="form-label">名 *</label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    className="form-input"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="form-label">手机号码 *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    className="form-input"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="form-label">邮箱</label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="form-label">出生日期</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    className="form-input"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="form-label">性别</label>
                  <select
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

            {/* 客户分类 */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">客户分类</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="form-label">客户类型</label>
                  <select
                    name="customerType"
                    className="form-input"
                    value={formData.customerType}
                    onChange={handleChange}
                  >
                    <option value="potential">潜在客户</option>
                    <option value="new">新客户</option>
                    <option value="regular">常规客户</option>
                    <option value="vip">VIP客户</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">分配销售</label>
                  <select
                    name="salesRep"
                    className="form-input"
                    value={formData.salesRep}
                    onChange={handleChange}
                  >
                    <option value="">请选择销售代表</option>
                    {salesReps.map((rep) => (
                      <option key={rep._id} value={rep._id}>
                        {rep.name} - {rep.department}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">下次联系日期</label>
                  <input
                    type="date"
                    name="nextContactDate"
                    className="form-input"
                    value={formData.nextContactDate}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="form-label">联系频率</label>
                  <select
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

            {/* 健康档案 */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">健康档案</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="form-label">身高 (cm)</label>
                  <input
                    type="number"
                    name="healthProfile.height"
                    className="form-input"
                    value={formData.healthProfile.height}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="form-label">体重 (kg)</label>
                  <input
                    type="number"
                    name="healthProfile.weight"
                    className="form-input"
                    value={formData.healthProfile.weight}
                    onChange={handleChange}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="form-label">慢性疾病 (用逗号分隔)</label>
                  <input
                    type="text"
                    name="healthProfile.chronicConditions"
                    className="form-input"
                    placeholder="如：高血压, 糖尿病"
                    value={formData.healthProfile.chronicConditions}
                    onChange={handleChange}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="form-label">过敏史 (用逗号分隔)</label>
                  <input
                    type="text"
                    name="healthProfile.allergies"
                    className="form-input"
                    placeholder="如：海鲜, 花粉"
                    value={formData.healthProfile.allergies}
                    onChange={handleChange}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="form-label">健康目标 (用逗号分隔)</label>
                  <input
                    type="text"
                    name="healthProfile.healthGoals"
                    className="form-input"
                    placeholder="如：减肥, 增强免疫力, 改善睡眠"
                    value={formData.healthProfile.healthGoals}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* 兴趣和需求 */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">兴趣和需求</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="form-label">预算范围</label>
                  <select
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
                  <label className="form-label">购买频率</label>
                  <select
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

            {/* 地址信息 */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">地址信息</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="form-label">详细地址</label>
                  <input
                    type="text"
                    name="address.street"
                    className="form-input"
                    value={formData.address.street}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="form-label">城市</label>
                  <input
                    type="text"
                    name="address.city"
                    className="form-input"
                    value={formData.address.city}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="form-label">省份</label>
                  <input
                    type="text"
                    name="address.state"
                    className="form-input"
                    value={formData.address.state}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="form-label">邮编</label>
                  <input
                    type="text"
                    name="address.zipCode"
                    className="form-input"
                    value={formData.address.zipCode}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="form-label">国家</label>
                  <input
                    type="text"
                    name="address.country"
                    className="form-input"
                    value={formData.address.country}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* 备注 */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">备注</h3>
              <div>
                <label className="form-label">客户备注</label>
                <textarea
                  name="notes"
                  rows={4}
                  className="form-input"
                  placeholder="记录客户特殊情况、偏好等..."
                  value={formData.notes}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* 提交按钮 */}
            <div className="flex justify-end space-x-3">
              <Link
                href="/dashboard/customers"
                className="btn btn-secondary"
              >
                取消
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary flex items-center space-x-2"
              >
                <UserPlusIcon className="h-5 w-5" />
                <span>{loading ? '创建中...' : '创建客户'}</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
