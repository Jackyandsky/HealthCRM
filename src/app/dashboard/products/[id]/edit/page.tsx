'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

const CATEGORIES = [
  { value: 'vitamins', label: '维生素' },
  { value: 'minerals', label: '矿物质' },
  { value: 'antioxidants', label: '抗氧化剂' },
  { value: 'omega', label: '欧米伽' },
  { value: 'probiotics', label: '益生菌' },
  { value: 'protein', label: '蛋白质' },
  { value: 'weight_management', label: '体重管理' },
  { value: 'skincare', label: '护肤品' },
  { value: 'energy_metabolism', label: '能量代谢' },
  { value: 'immune_support', label: '免疫支持' },
  { value: 'heart_health', label: '心脏健康' },
  { value: 'bone_joint', label: '骨骼关节' },
  { value: 'digestive_health', label: '消化健康' },
  { value: 'brain_cognitive', label: '大脑认知' },
  { value: 'womens_health', label: '女性健康' },
  { value: 'mens_health', label: '男性健康' },
  { value: 'childrens_health', label: '儿童健康' },
]

const STOCK_STATUS_OPTIONS = [
  { value: 'in_stock', label: '有库存' },
  { value: 'low_stock', label: '库存不足' },
  { value: 'out_of_stock', label: '缺货' },
  { value: 'discontinued', label: '已停产' },
]

interface ProductForm {
  productCode: string
  productName: string
  category: string
  description: string
  ingredients: string
  servingSize: string
  servingsPerContainer: string
  benefits: string
  healthConcerns: string
  recommendedDosage: string
  usageInstructions: string
  precautions: string
  contraindications: string
  retailPrice: string
  wholesalePrice: string
  preferredCustomerPrice: string
  points: string
  stockStatus: string
  popularity: string
  isActive: boolean
}

export default function EditProductPage({ params }: { params: { id: string } }) {
  const [form, setForm] = useState<ProductForm>({
    productCode: '',
    productName: '',
    category: '',
    description: '',
    ingredients: '',
    servingSize: '',
    servingsPerContainer: '',
    benefits: '',
    healthConcerns: '',
    recommendedDosage: '',
    usageInstructions: '',
    precautions: '',
    contraindications: '',
    retailPrice: '',
    wholesalePrice: '',
    preferredCustomerPrice: '',
    points: '',
    stockStatus: 'in_stock',
    popularity: '0',
    isActive: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth/login')
      return
    }
    
    loadProduct()
  }, [params.id])

  const loadProduct = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/products/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        const product = data.data
        
        setForm({
          productCode: product.productCode || '',
          productName: product.productName || '',
          category: product.category || '',
          description: product.description || '',
          ingredients: Array.isArray(product.ingredients) ? product.ingredients.join('\n') : '',
          servingSize: product.servingSize || '',
          servingsPerContainer: product.servingsPerContainer?.toString() || '',
          benefits: Array.isArray(product.benefits) ? product.benefits.join('\n') : '',
          healthConcerns: Array.isArray(product.healthConcerns) ? product.healthConcerns.join('\n') : '',
          recommendedDosage: product.recommendedDosage || '',
          usageInstructions: product.usageInstructions || '',
          precautions: Array.isArray(product.precautions) ? product.precautions.join('\n') : '',
          contraindications: Array.isArray(product.contraindications) ? product.contraindications.join('\n') : '',
          retailPrice: product.retailPrice?.toString() || '',
          wholesalePrice: product.wholesalePrice?.toString() || '',
          preferredCustomerPrice: product.preferredCustomerPrice?.toString() || '',
          points: product.points?.toString() || '',
          stockStatus: product.stockStatus || 'in_stock',
          popularity: product.popularity?.toString() || '0',
          isActive: product.isActive !== false,
        })
      } else if (response.status === 404) {
        router.push('/dashboard/products')
      }
    } catch (error) {
      console.error('Error loading product:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement
      setForm(prev => ({ ...prev, [name]: checkbox.checked }))
    } else {
      setForm(prev => ({ ...prev, [name]: value }))
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!form.productCode.trim()) {
      newErrors.productCode = '产品编码不能为空'
    }
    if (!form.productName.trim()) {
      newErrors.productName = '产品名称不能为空'
    }
    if (!form.category) {
      newErrors.category = '请选择产品分类'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setSaving(true)

    try {
      const token = localStorage.getItem('token')
      
      // Prepare data
      const productData = {
        ...form,
        ingredients: form.ingredients.split('\n').filter(item => item.trim()),
        benefits: form.benefits.split('\n').filter(item => item.trim()),
        healthConcerns: form.healthConcerns.split('\n').filter(item => item.trim()),
        precautions: form.precautions.split('\n').filter(item => item.trim()),
        contraindications: form.contraindications.split('\n').filter(item => item.trim()),
        servingsPerContainer: form.servingsPerContainer ? parseInt(form.servingsPerContainer) : undefined,
        retailPrice: form.retailPrice ? parseFloat(form.retailPrice) : undefined,
        wholesalePrice: form.wholesalePrice ? parseFloat(form.wholesalePrice) : undefined,
        preferredCustomerPrice: form.preferredCustomerPrice ? parseFloat(form.preferredCustomerPrice) : undefined,
        points: form.points ? parseInt(form.points) : undefined,
        popularity: parseInt(form.popularity),
      }

      const response = await fetch(`/api/products/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      })

      if (response.ok) {
        router.push(`/dashboard/products/${params.id}`)
      } else {
        const data = await response.json()
        alert(data.message || '更新产品失败')
      }
    } catch (error) {
      console.error('Error updating product:', error)
      alert('更新产品失败')
    } finally {
      setSaving(false)
    }
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
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center">
              <Link
                href={`/dashboard/products/${params.id}`}
                className="mr-4 text-gray-500 hover:text-gray-700"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">编辑产品</h1>
                <p className="mt-1 text-sm text-gray-600">
                  修改产品信息
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">基本信息</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="productCode" className="block text-sm font-medium text-gray-700">
                  产品编码 *
                </label>
                <input
                  type="text"
                  id="productCode"
                  name="productCode"
                  className={`mt-1 input ${errors.productCode ? 'border-red-500' : ''}`}
                  value={form.productCode}
                  onChange={handleChange}
                  placeholder="例如: VITA-001"
                />
                {errors.productCode && (
                  <p className="mt-1 text-sm text-red-600">{errors.productCode}</p>
                )}
              </div>

              <div>
                <label htmlFor="productName" className="block text-sm font-medium text-gray-700">
                  产品名称 *
                </label>
                <input
                  type="text"
                  id="productName"
                  name="productName"
                  className={`mt-1 input ${errors.productName ? 'border-red-500' : ''}`}
                  value={form.productName}
                  onChange={handleChange}
                  placeholder="产品名称"
                />
                {errors.productName && (
                  <p className="mt-1 text-sm text-red-600">{errors.productName}</p>
                )}
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  产品分类 *
                </label>
                <select
                  id="category"
                  name="category"
                  className={`mt-1 input ${errors.category ? 'border-red-500' : ''}`}
                  value={form.category}
                  onChange={handleChange}
                >
                  <option value="">选择分类</option>
                  {CATEGORIES.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                )}
              </div>

              <div>
                <label htmlFor="stockStatus" className="block text-sm font-medium text-gray-700">
                  库存状态
                </label>
                <select
                  id="stockStatus"
                  name="stockStatus"
                  className="mt-1 input"
                  value={form.stockStatus}
                  onChange={handleChange}
                >
                  {STOCK_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  产品描述
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className="mt-1 input"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="详细描述产品特点和用途..."
                />
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-center">
                  <input
                    id="isActive"
                    name="isActive"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    checked={form.isActive}
                    onChange={handleChange}
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                    启用产品
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">产品详情</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="servingSize" className="block text-sm font-medium text-gray-700">
                  服用剂量
                </label>
                <input
                  type="text"
                  id="servingSize"
                  name="servingSize"
                  className="mt-1 input"
                  value={form.servingSize}
                  onChange={handleChange}
                  placeholder="例如: 2粒"
                />
              </div>

              <div>
                <label htmlFor="servingsPerContainer" className="block text-sm font-medium text-gray-700">
                  每瓶份数
                </label>
                <input
                  type="number"
                  id="servingsPerContainer"
                  name="servingsPerContainer"
                  className="mt-1 input"
                  value={form.servingsPerContainer}
                  onChange={handleChange}
                  placeholder="60"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="ingredients" className="block text-sm font-medium text-gray-700">
                  成分列表
                </label>
                <textarea
                  id="ingredients"
                  name="ingredients"
                  rows={3}
                  className="mt-1 input"
                  value={form.ingredients}
                  onChange={handleChange}
                  placeholder="每行一个成分..."
                />
                <p className="mt-1 text-sm text-gray-500">每行输入一个成分</p>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="benefits" className="block text-sm font-medium text-gray-700">
                  功效和好处
                </label>
                <textarea
                  id="benefits"
                  name="benefits"
                  rows={3}
                  className="mt-1 input"
                  value={form.benefits}
                  onChange={handleChange}
                  placeholder="每行一个功效..."
                />
                <p className="mt-1 text-sm text-gray-500">每行输入一个功效</p>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="healthConcerns" className="block text-sm font-medium text-gray-700">
                  针对的健康问题
                </label>
                <textarea
                  id="healthConcerns"
                  name="healthConcerns"
                  rows={3}
                  className="mt-1 input"
                  value={form.healthConcerns}
                  onChange={handleChange}
                  placeholder="每行一个健康问题..."
                />
                <p className="mt-1 text-sm text-gray-500">每行输入一个健康问题</p>
              </div>
            </div>
          </div>

          {/* Usage Instructions */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">使用指导</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="recommendedDosage" className="block text-sm font-medium text-gray-700">
                  推荐用量
                </label>
                <input
                  type="text"
                  id="recommendedDosage"
                  name="recommendedDosage"
                  className="mt-1 input"
                  value={form.recommendedDosage}
                  onChange={handleChange}
                  placeholder="例如: 每日2次，每次1粒"
                />
              </div>

              <div>
                <label htmlFor="usageInstructions" className="block text-sm font-medium text-gray-700">
                  使用说明
                </label>
                <textarea
                  id="usageInstructions"
                  name="usageInstructions"
                  rows={3}
                  className="mt-1 input"
                  value={form.usageInstructions}
                  onChange={handleChange}
                  placeholder="详细的使用方法和注意事项..."
                />
              </div>

              <div>
                <label htmlFor="precautions" className="block text-sm font-medium text-gray-700">
                  注意事项
                </label>
                <textarea
                  id="precautions"
                  name="precautions"
                  rows={3}
                  className="mt-1 input"
                  value={form.precautions}
                  onChange={handleChange}
                  placeholder="每行一个注意事项..."
                />
                <p className="mt-1 text-sm text-gray-500">每行输入一个注意事项</p>
              </div>

              <div>
                <label htmlFor="contraindications" className="block text-sm font-medium text-gray-700">
                  禁忌症
                </label>
                <textarea
                  id="contraindications"
                  name="contraindications"
                  rows={3}
                  className="mt-1 input"
                  value={form.contraindications}
                  onChange={handleChange}
                  placeholder="每行一个禁忌症..."
                />
                <p className="mt-1 text-sm text-gray-500">每行输入一个禁忌症</p>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">价格信息</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label htmlFor="retailPrice" className="block text-sm font-medium text-gray-700">
                  零售价 (¥)
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="retailPrice"
                  name="retailPrice"
                  className="mt-1 input"
                  value={form.retailPrice}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label htmlFor="wholesalePrice" className="block text-sm font-medium text-gray-700">
                  批发价 (¥)
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="wholesalePrice"
                  name="wholesalePrice"
                  className="mt-1 input"
                  value={form.wholesalePrice}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label htmlFor="preferredCustomerPrice" className="block text-sm font-medium text-gray-700">
                  优惠客户价 (¥)
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="preferredCustomerPrice"
                  name="preferredCustomerPrice"
                  className="mt-1 input"
                  value={form.preferredCustomerPrice}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label htmlFor="points" className="block text-sm font-medium text-gray-700">
                  积分值
                </label>
                <input
                  type="number"
                  id="points"
                  name="points"
                  className="mt-1 input"
                  value={form.points}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Additional Settings */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">其他设置</h2>
            <div>
              <label htmlFor="popularity" className="block text-sm font-medium text-gray-700">
                受欢迎程度 (0-100)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                id="popularity"
                name="popularity"
                className="mt-1 input"
                value={form.popularity}
                onChange={handleChange}
                placeholder="0"
              />
              <p className="mt-1 text-sm text-gray-500">0为最低，100为最高</p>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3">
            <Link
              href={`/dashboard/products/${params.id}`}
              className="btn btn-secondary"
            >
              取消
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
            >
              {saving ? '保存中...' : '保存更改'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}