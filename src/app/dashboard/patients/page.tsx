'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  UserGroupIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'

interface Patient {
  _id: string
  patientId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  gender: string
  patientType: string
  priority: string
  status: string
  lastVisitDate?: string
  nextFollowUpDate?: string
  assignedDoctor?: {
    _id: string
    name: string
    department: string
  }
  medications?: Array<{
    name: string
    remainingDays?: number
  }>
  address: {
    street?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
  }
  isActive: boolean
  createdAt: string
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sortField, setSortField] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
  // 过滤器
  const [filterType, setFilterType] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterDoctor, setFilterDoctor] = useState('')
  
  const [doctors, setDoctors] = useState<Array<{_id: string, name: string}>>([])
  const [activeTab, setActiveTab] = useState('all')
  
  const router = useRouter()

  const tabs = [
    { id: 'all', name: '全部患者', count: 0 },
    { id: 'followup', name: '需要回访', count: 0 },
    { id: 'medication', name: '药物不足', count: 0 },
    { id: 'urgent', name: '紧急处理', count: 0 },
  ]

  useEffect(() => {
    loadPatients()
    loadDoctors()
  }, [currentPage, searchTerm, sortField, sortOrder, filterType, filterPriority, filterStatus, filterDoctor, activeTab])

  const loadPatients = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/auth/login')
        return
      }

      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchTerm,
        sortField,
        sortOrder,
        type: filterType,
        priority: filterPriority,
        status: filterStatus,
        doctor: filterDoctor,
        tab: activeTab,
      })

      const response = await fetch(`/api/patients?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setPatients(data.patients)
        setTotalPages(data.totalPages)
      } else if (response.status === 401) {
        router.push('/auth/login')
      }
    } catch (error) {
      console.error('Error loading patients:', error)
    } finally {
      setLoading(false)
    }
  }

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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
    setCurrentPage(1)
  }

  const handleDeletePatient = async (patientId: string) => {
    if (!confirm('确定要删除此患者吗？此操作不可逆。')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/patients/${patientId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        loadPatients()
      } else {
        alert('删除失败，请重试')
      }
    } catch (error) {
      console.error('Error deleting patient:', error)
      alert('删除时发生错误')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN')
  }

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  const getPatientTypeColor = (type: string) => {
    const colors = {
      regular: 'bg-blue-100 text-blue-800',
      vip: 'bg-purple-100 text-purple-800',
      emergency: 'bg-red-100 text-red-800',
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800',
    }
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      discharged: 'bg-blue-100 text-blue-800',
      deceased: 'bg-red-100 text-red-800',
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const isFollowUpDue = (date?: string) => {
    if (!date) return false
    const followUpDate = new Date(date)
    const today = new Date()
    return followUpDate <= today
  }

  const isMedicationLow = (medications?: Array<{remainingDays?: number}>) => {
    if (!medications) return false
    return medications.some(med => med.remainingDays && med.remainingDays <= 7)
  }

  const clearFilters = () => {
    setFilterType('')
    setFilterPriority('')
    setFilterStatus('')
    setFilterDoctor('')
    setSearchTerm('')
    setCurrentPage(1)
  }

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
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="p-2 text-gray-400 hover:text-gray-500"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">患者管理</h1>
                <p className="text-sm text-gray-500">管理患者信息和档案</p>
              </div>
            </div>
            <Link
              href="/dashboard/patients/new"
              className="btn btn-primary flex items-center space-x-2"
            >
              <PlusIcon className="h-5 w-5" />
              <span>添加患者</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    setCurrentPage(1)
                  }}
                  className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex-1 max-w-lg">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="form-input pl-10"
                    placeholder="搜索患者姓名、ID或电话..."
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={clearFilters}
                  className="btn btn-secondary text-sm"
                >
                  清除过滤
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">患者类型</label>
                <select
                  className="form-input"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="">全部类型</option>
                  <option value="regular">普通患者</option>
                  <option value="vip">VIP患者</option>
                  <option value="emergency">急诊患者</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">优先级</label>
                <select
                  className="form-input"
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                >
                  <option value="">全部优先级</option>
                  <option value="urgent">紧急</option>
                  <option value="high">高</option>
                  <option value="medium">中</option>
                  <option value="low">低</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
                <select
                  className="form-input"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="">全部状态</option>
                  <option value="active">活跃</option>
                  <option value="inactive">非活跃</option>
                  <option value="discharged">已出院</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">指定医生</label>
                <select
                  className="form-input"
                  value={filterDoctor}
                  onChange={(e) => setFilterDoctor(e.target.value)}
                >
                  <option value="">全部医生</option>
                  {doctors.map((doctor) => (
                    <option key={doctor._id} value={doctor._id}>
                      {doctor.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Patients Table */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center mb-4">
                <UserGroupIcon className="h-6 w-6 text-gray-400 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">
                  患者列表 ({patients.length} 人)
                </h3>
              </div>

              {patients.length === 0 ? (
                <div className="text-center py-12">
                  <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    暂无患者
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    开始添加患者来管理他们的信息。
                  </p>
                  <div className="mt-6">
                    <Link
                      href="/dashboard/patients/new"
                      className="btn btn-primary"
                    >
                      <PlusIcon className="h-5 w-5 mr-2" />
                      添加患者
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('firstName')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>患者信息</span>
                            {sortField === 'firstName' && (
                              sortOrder === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />
                            )}
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          联系方式
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          年龄/性别
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('patientType')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>类型/优先级</span>
                            {sortField === 'patientType' && (
                              sortOrder === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />
                            )}
                          </div>
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('nextFollowUpDate')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>回访日期</span>
                            {sortField === 'nextFollowUpDate' && (
                              sortOrder === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />
                            )}
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          指定医生
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          状态/提醒
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {patients.map((patient) => (
                        <tr key={patient._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {patient.firstName} {patient.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {patient.patientId}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {patient.phone}
                            </div>
                            <div className="text-sm text-gray-500">
                              {patient.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {calculateAge(patient.dateOfBirth)} 岁
                            </div>
                            <div className="text-sm text-gray-500">
                              {patient.gender === 'male' ? '男' : patient.gender === 'female' ? '女' : '其他'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-1">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPatientTypeColor(patient.patientType)}`}>
                                {patient.patientType === 'regular' ? '普通' : patient.patientType === 'vip' ? 'VIP' : '急诊'}
                              </span>
                              <br />
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(patient.priority)}`}>
                                {patient.priority === 'low' ? '低' : patient.priority === 'medium' ? '中' : patient.priority === 'high' ? '高' : '紧急'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {patient.nextFollowUpDate ? (
                                <div className={`flex items-center space-x-1 ${isFollowUpDue(patient.nextFollowUpDate) ? 'text-red-600' : ''}`}>
                                  <CalendarIcon className="h-4 w-4" />
                                  <span>{formatDate(patient.nextFollowUpDate)}</span>
                                  {isFollowUpDue(patient.nextFollowUpDate) && (
                                    <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400">未安排</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {patient.assignedDoctor ? (
                                <div>
                                  <div>{patient.assignedDoctor.name}</div>
                                  <div className="text-xs text-gray-500">{patient.assignedDoctor.department}</div>
                                </div>
                              ) : (
                                <span className="text-gray-400">未指定</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-1">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(patient.status)}`}>
                                {patient.status === 'active' ? '活跃' : patient.status === 'inactive' ? '非活跃' : '已出院'}
                              </span>
                              {isMedicationLow(patient.medications) && (
                                <div className="flex items-center space-x-1 text-orange-600">
                                  <ExclamationTriangleIcon className="h-4 w-4" />
                                  <span className="text-xs">药物不足</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <Link
                                href={`/dashboard/patients/${patient._id}`}
                                className="text-primary-600 hover:text-primary-900"
                                title="查看详情"
                              >
                                <EyeIcon className="h-5 w-5" />
                              </Link>
                              <Link
                                href={`/dashboard/patients/${patient._id}/edit`}
                                className="text-yellow-600 hover:text-yellow-900"
                                title="编辑"
                              >
                                <PencilIcon className="h-5 w-5" />
                              </Link>
                              <button
                                onClick={() => handleDeletePatient(patient._id)}
                                className="text-red-600 hover:text-red-900"
                                title="删除"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      上一页
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      下一页
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        第 <span className="font-medium">{currentPage}</span> 页，共{' '}
                        <span className="font-medium">{totalPages}</span> 页
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          上一页
                        </button>
                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          下一页
                        </button>
                      </nav>
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
