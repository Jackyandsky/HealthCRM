'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeftIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline'

interface Doctor {
  _id: string
  name: string
  department: string
}

export default function NewPatientPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    patientType: 'regular',
    priority: 'medium',
    status: 'active',
    assignedDoctor: '',
    nextFollowUpDate: '',
    notes: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'China',
    },
    emergencyContact: {
      name: '',
      relationship: '',
      phone: '',
    },
    insurance: {
      provider: '',
      policyNumber: '',
      groupNumber: '',
    },
  })
  
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    loadDoctors()
  }, [])

  const loadDoctors = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/users?role=doctor', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setDoctors(data.users || [])
      }
    } catch (error) {
      console.error('Error loading doctors:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        router.push('/dashboard/patients')
      } else {
        setError(data.message || '创建患者失败')
      }
    } catch (error) {
      console.error('Create patient error:', error)
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
                href="/dashboard/patients"
                className="p-2 text-gray-400 hover:text-gray-500"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">新增患者</h1>
                <p className="text-sm text-gray-500">创建新的患者档案</p>
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
                  <label className="form-label">出生日期 *</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    required
                    className="form-input"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="form-label">性别 *</label>
                  <select
                    name="gender"
                    required
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

            {/* 医疗信息 */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">医疗信息</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="form-label">患者类型</label>
                  <select
                    name="patientType"
                    className="form-input"
                    value={formData.patientType}
                    onChange={handleChange}
                  >
                    <option value="regular">普通患者</option>
                    <option value="vip">VIP患者</option>
                    <option value="emergency">急诊患者</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">优先级</label>
                  <select
                    name="priority"
                    className="form-input"
                    value={formData.priority}
                    onChange={handleChange}
                  >
                    <option value="low">低</option>
                    <option value="medium">中</option>
                    <option value="high">高</option>
                    <option value="urgent">紧急</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">指定医生</label>
                  <select
                    name="assignedDoctor"
                    className="form-input"
                    value={formData.assignedDoctor}
                    onChange={handleChange}
                  >
                    <option value="">请选择医生</option>
                    {doctors.map((doctor) => (
                      <option key={doctor._id} value={doctor._id}>
                        {doctor.name} - {doctor.department}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">下次回访日期</label>
                  <input
                    type="date"
                    name="nextFollowUpDate"
                    className="form-input"
                    value={formData.nextFollowUpDate}
                    onChange={handleChange}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="form-label">特殊备注</label>
                  <textarea
                    name="notes"
                    rows={3}
                    className="form-input"
                    value={formData.notes}
                    onChange={handleChange}
                  />
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

            {/* 紧急联系人 */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">紧急联系人</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div>
                  <label className="form-label">姓名</label>
                  <input
                    type="text"
                    name="emergencyContact.name"
                    className="form-input"
                    value={formData.emergencyContact.name}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="form-label">关系</label>
                  <input
                    type="text"
                    name="emergencyContact.relationship"
                    className="form-input"
                    value={formData.emergencyContact.relationship}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="form-label">电话</label>
                  <input
                    type="tel"
                    name="emergencyContact.phone"
                    className="form-input"
                    value={formData.emergencyContact.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* 保险信息 */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">保险信息</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div>
                  <label className="form-label">保险公司</label>
                  <input
                    type="text"
                    name="insurance.provider"
                    className="form-input"
                    value={formData.insurance.provider}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="form-label">保单号</label>
                  <input
                    type="text"
                    name="insurance.policyNumber"
                    className="form-input"
                    value={formData.insurance.policyNumber}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="form-label">群组号</label>
                  <input
                    type="text"
                    name="insurance.groupNumber"
                    className="form-input"
                    value={formData.insurance.groupNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* 提交按钮 */}
            <div className="flex justify-end space-x-3">
              <Link
                href="/dashboard/patients"
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
                <span>{loading ? '创建中...' : '创建患者'}</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
