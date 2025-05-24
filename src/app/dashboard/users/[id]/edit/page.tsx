'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeftIcon,
  UserIcon,
  CheckIcon,
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
    teamLead?: string
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
  customerAccess?: {
    canViewAll?: boolean
    assignedTerritories?: string[]
    customerLimit?: number
  }
  isActive: boolean
}

interface TeamLead {
  _id: string
  name: string
  employeeId: string
}

interface CurrentUser {
  role: string
}

export default function EditUserPage({ params }: { params: { id: string } }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
    phone: '',
    salesInfo: {
      territory: '',
      teamLead: '',
      commissionRate: '',
      salesGoal: {
        monthly: '',
        quarterly: '',
        annual: '',
      },
      certification: {
        level: '',
        expiryDate: '',
      },
    },
    customerAccess: {
      canViewAll: false,
      assignedTerritories: '',
      customerLimit: '',
    },
    isActive: true,
  })
  
  const [user, setUser] = useState<User | null>(null)
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [teamLeads, setTeamLeads] = useState<TeamLead[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Get current user info
    const userData = localStorage.getItem('user')
    if (userData) {
      setCurrentUser(JSON.parse(userData))
    }
    loadUser()
    loadTeamLeads()
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
        const userData = data.user
        setUser(userData)
        
        // Populate form with user data
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          password: '',
          confirmPassword: '',
          role: userData.role || 'customer',
          phone: userData.phone || '',
          salesInfo: {
            territory: userData.salesInfo?.territory || '',
            teamLead: userData.salesInfo?.teamLead?._id || '',
            commissionRate: userData.salesInfo?.commissionRate?.toString() || '',
            salesGoal: {
              monthly: userData.salesInfo?.salesGoal?.monthly?.toString() || '',
              quarterly: userData.salesInfo?.salesGoal?.quarterly?.toString() || '',
              annual: userData.salesInfo?.salesGoal?.annual?.toString() || '',
            },
            certification: {
              level: userData.salesInfo?.certification?.level || '',
              expiryDate: userData.salesInfo?.certification?.expiryDate ? 
                new Date(userData.salesInfo.certification.expiryDate).toISOString().split('T')[0] : '',
            },
          },
          customerAccess: {
            canViewAll: userData.customerAccess?.canViewAll || false,
            assignedTerritories: userData.customerAccess?.assignedTerritories?.join(', ') || '',
            customerLimit: userData.customerAccess?.customerLimit?.toString() || '',
          },
          isActive: userData.isActive,
        })
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

  const loadTeamLeads = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/users?role=system_admin,admin', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setTeamLeads(data.users || [])
      }
    } catch (error) {
      console.error('Error loading team leads:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    // Validate password confirmation if password is provided
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('密码确认不匹配')
      setSaving(false)
      return
    }

    try {
      const token = localStorage.getItem('token')
      
      // Prepare data for submission
      const submissionData = {
        ...formData,
        salesInfo: {
          ...formData.salesInfo,
          commissionRate: formData.salesInfo.commissionRate ? Number(formData.salesInfo.commissionRate) : undefined,
          salesGoal: {
            monthly: formData.salesInfo.salesGoal.monthly ? Number(formData.salesInfo.salesGoal.monthly) : undefined,
            quarterly: formData.salesInfo.salesGoal.quarterly ? Number(formData.salesInfo.salesGoal.quarterly) : undefined,
            annual: formData.salesInfo.salesGoal.annual ? Number(formData.salesInfo.salesGoal.annual) : undefined,
          },
        },
        customerAccess: {
          ...formData.customerAccess,
          assignedTerritories: formData.customerAccess.assignedTerritories 
            ? formData.customerAccess.assignedTerritories.split(',').map(s => s.trim()).filter(s => s)
            : [],
          customerLimit: formData.customerAccess.customerLimit ? Number(formData.customerAccess.customerLimit) : undefined,
        }
      }

      // Remove confirmPassword from submission
      delete submissionData.confirmPassword

      // Only include password if it's provided
      if (!submissionData.password) {
        delete submissionData.password
      }

      const response = await fetch(`/api/users/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(submissionData),
      })

      const data = await response.json()

      if (response.ok) {
        router.push(`/dashboard/users/${params.id}`)
      } else {
        setError(data.message || '更新用户失败')
      }
    } catch (error) {
      console.error('Update user error:', error)
      setError('更新时发生错误，请重试')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    
    if (name.includes('.')) {
      const parts = name.split('.')
      if (parts.length === 2) {
        const [parent, child] = parts
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent as keyof typeof prev] as any,
            [child]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
          },
        }))
      } else if (parts.length === 3) {
        const [parent, grandParent, child] = parts
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent as keyof typeof prev] as any,
            [grandParent]: {
              ...(prev[parent as keyof typeof prev] as any)[grandParent],
              [child]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
            },
          },
        }))
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
      }))
    }
  }

  const canEditUser = () => {
    if (!currentUser || !user) return false
    // 系统管理员可以编辑所有用户，管理员只能编辑客户
    if (currentUser.role === 'system_admin') return true
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

  if (error && !user) {
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
              <h1 className="text-2xl font-bold text-gray-900">编辑用户</h1>
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

  if (!canEditUser()) {
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
              <h1 className="text-2xl font-bold text-gray-900">编辑用户</h1>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              您没有权限编辑此用户
            </div>
          </div>
        </main>
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
                href={`/dashboard/users/${params.id}`}
                className="p-2 text-gray-400 hover:text-gray-500"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">编辑用户</h1>
                <p className="text-sm text-gray-500">修改 {user?.name} 的信息</p>
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
                  <label className="form-label">姓名 *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="form-input"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="form-label">邮箱 *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="form-input"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="form-label">手机号码</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-input"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="form-label">角色 *</label>
                  <select
                    name="role"
                    required
                    className="form-input"
                    value={formData.role}
                    onChange={handleChange}
                    disabled={currentUser?.role !== 'system_admin'}
                  >
                    <option value="customer">客户</option>
                    <option value="admin">管理员</option>
                    <option value="system_admin">系统管理员</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">新密码 (留空则不修改)</label>
                  <input
                    type="password"
                    name="password"
                    className="form-input"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="form-label">确认新密码</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    className="form-input"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="mt-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-900">账户激活</span>
                </label>
              </div>
            </div>

            {/* 销售信息 - 仅针对管理员和系统管理员 */}
            {(formData.role === 'admin' || formData.role === 'system_admin') && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">销售信息</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="form-label">销售区域</label>
                    <input
                      type="text"
                      name="salesInfo.territory"
                      className="form-input"
                      value={formData.salesInfo.territory}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="form-label">团队主管</label>
                    <select
                      name="salesInfo.teamLead"
                      className="form-input"
                      value={formData.salesInfo.teamLead}
                      onChange={handleChange}
                    >
                      <option value="">请选择主管</option>
                      {teamLeads.map((lead) => (
                        <option key={lead._id} value={lead._id}>
                          {lead.name} ({lead.employeeId})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">佣金比例 (%)</label>
                    <input
                      type="number"
                      name="salesInfo.commissionRate"
                      className="form-input"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.salesInfo.commissionRate}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="form-label">认证级别</label>
                    <input
                      type="text"
                      name="salesInfo.certification.level"
                      className="form-input"
                      value={formData.salesInfo.certification.level}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="form-label">认证到期日期</label>
                    <input
                      type="date"
                      name="salesInfo.certification.expiryDate"
                      className="form-input"
                      value={formData.salesInfo.certification.expiryDate}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">销售目标</h4>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                    <div>
                      <label className="form-label">月度目标 (¥)</label>
                      <input
                        type="number"
                        name="salesInfo.salesGoal.monthly"
                        className="form-input"
                        min="0"
                        value={formData.salesInfo.salesGoal.monthly}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label className="form-label">季度目标 (¥)</label>
                      <input
                        type="number"
                        name="salesInfo.salesGoal.quarterly"
                        className="form-input"
                        min="0"
                        value={formData.salesInfo.salesGoal.quarterly}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label className="form-label">年度目标 (¥)</label>
                      <input
                        type="number"
                        name="salesInfo.salesGoal.annual"
                        className="form-input"
                        min="0"
                        value={formData.salesInfo.salesGoal.annual}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 客户访问权限 - 仅针对管理员和系统管理员 */}
            {(formData.role === 'admin' || formData.role === 'system_admin') && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">客户访问权限</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="form-label">分配区域 (用逗号分隔)</label>
                    <input
                      type="text"
                      name="customerAccess.assignedTerritories"
                      className="form-input"
                      placeholder="如：华北,华东,华南"
                      value={formData.customerAccess.assignedTerritories}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="form-label">客户数量限制</label>
                    <input
                      type="number"
                      name="customerAccess.customerLimit"
                      className="form-input"
                      min="0"
                      value={formData.customerAccess.customerLimit}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div className="mt-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="customerAccess.canViewAll"
                      checked={formData.customerAccess.canViewAll}
                      onChange={handleChange}
                      className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-900">可查看所有客户</span>
                  </label>
                </div>
              </div>
            )}

            {/* 提交按钮 */}
            <div className="flex justify-end space-x-3">
              <Link
                href={`/dashboard/users/${params.id}`}
                className="btn btn-secondary"
              >
                取消
              </Link>
              <button
                type="submit"
                disabled={saving}
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
