'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeftIcon,
  UserIcon,
  CubeIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
  HomeIcon
} from '@heroicons/react/24/outline'

interface Customer {
  _id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
}

interface Product {
  _id: string
  productCode: string
  productName: string
  category: string
  description?: string
  retailPrice?: number
  wholesalePrice?: number
  preferredCustomerPrice?: number
}

const COMMON_TAGS = [
  '基础营养', '全面保健', '体重管理', '美肌护理', '日常维护',
  '免疫提升', '睡眠改善', '消化健康', '骨骼健康', '心血管'
]

export default function NewHealthPlanPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [customerSearch, setCustomerSearch] = useState('')
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const customerDropdownRef = useRef<HTMLDivElement>(null)
  const productDropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    title: '',
    description: '',
    tags: [] as string[],
    products: [] as Array<{
      productId: string
      customGuidance: string
    }>
  })

  const [newTag, setNewTag] = useState('')
  const [productSearch, setProductSearch] = useState('')
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [showProductDropdown, setShowProductDropdown] = useState(false)
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth/login')
      return
    }
    
    loadInitialData()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target as Node)) {
        setShowCustomerDropdown(false)
      }
      if (productDropdownRef.current && !productDropdownRef.current.contains(event.target as Node)) {
        setShowProductDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    const timer = setTimeout(() => {
      if (customerSearch) {
        const filtered = customers.filter(customer =>
          `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(customerSearch.toLowerCase()) ||
          customer.email?.toLowerCase().includes(customerSearch.toLowerCase())
        )
        setFilteredCustomers(filtered)
        setShowCustomerDropdown(true)
      } else {
        setFilteredCustomers(customers)
        setShowCustomerDropdown(false)
      }
    }, 300)

    setDebounceTimer(timer)

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [customerSearch, customers])

  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    const timer = setTimeout(() => {
      if (productSearch) {
        const filtered = products.filter(product =>
          product.productName.toLowerCase().includes(productSearch.toLowerCase()) ||
          product.productCode.toLowerCase().includes(productSearch.toLowerCase()) ||
          product.category.toLowerCase().includes(productSearch.toLowerCase())
        )
        setFilteredProducts(filtered)
        setShowProductDropdown(true)
      } else {
        setFilteredProducts(products)
        setShowProductDropdown(false)
      }
    }, 300)

    setDebounceTimer(timer)

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [productSearch, products])

  const loadInitialData = async () => {
    try {
      const token = localStorage.getItem('token')
      
      const [customersRes, productsRes] = await Promise.all([
        fetch('/api/customers?limit=100', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch('/api/products?limit=100', {
          headers: { 'Authorization': `Bearer ${token}` },
        })
      ])

      if (customersRes.ok) {
        const customersData = await customersRes.json()
        setCustomers(customersData.customers || [])
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json()
        setProducts(productsData.data?.products || [])
      }
    } catch (error) {
      console.error('Error loading initial data:', error)
    }
  }

  const handleCustomerSelect = (customer: Customer) => {
    setFormData(prev => ({
      ...prev,
      customerId: customer._id,
      customerName: `${customer.firstName} ${customer.lastName}`
    }))
    setCustomerSearch(`${customer.firstName} ${customer.lastName}`)
    setShowCustomerDropdown(false)
  }

  const addProduct = (product: Product) => {
    // Check if product already exists
    if (formData.products.some(p => p.productId === product._id)) {
      setProductSearch('')
      setShowProductDropdown(false)
      return
    }

    setFormData(prev => ({
      ...prev,
      products: [...prev.products, {
        productId: product._id,
        customGuidance: `根据产品说明，建议${prev.customerName}按照${product.description || '标准'}方式使用。`
      }]
    }))
    setProductSearch('')
    setShowProductDropdown(false)
  }

  const updateProductGuidance = (index: number, guidance: string) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.map((product, i) => 
        i === index ? { ...product, customGuidance: guidance } : product
      )
    }))
  }

  const removeProduct = (index: number) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
    }))
  }

  const addTag = (tag?: string) => {
    const tagToAdd = tag || newTag.trim()
    if (tagToAdd && !formData.tags.includes(tagToAdd)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagToAdd]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const getProductById = (productId: string) => {
    return products.find(p => p._id === productId)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.customerId || !formData.title) {
      alert('请填写所有必填字段')
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/health-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push('/dashboard/health-plans')
      } else {
        const data = await response.json()
        alert(data.message || '创建失败')
      }
    } catch (error) {
      console.error('Error creating health plan:', error)
      alert('创建失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link
                  href="/dashboard/health-plans"
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ArrowLeftIcon className="h-6 w-6" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">新建产品消费方案</h1>
                  <p className="mt-1 text-sm text-gray-600">
                    为客户定制产品消费指导方案
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard"
                className="btn btn-secondary flex items-center"
              >
                <HomeIcon className="h-5 w-5 mr-2" />
                主控面板
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <UserIcon className="h-5 w-5 mr-2" />
                基本信息
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="relative" ref={customerDropdownRef}>
                  <label htmlFor="customer" className="block text-sm font-medium text-gray-700">
                    客户 *
                  </label>
                  <input
                    type="text"
                    className="mt-1 input"
                    placeholder="搜索客户..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                  />
                  {showCustomerDropdown && filteredCustomers.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredCustomers.map((customer) => (
                        <div
                          key={customer._id}
                          className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleCustomerSelect(customer)}
                        >
                          <div className="font-medium">{customer.firstName} {customer.lastName}</div>
                          <div className="text-sm text-gray-500">
                            {customer.email}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    方案标题 *
                  </label>
                  <input
                    type="text"
                    id="title"
                    className="mt-1 input"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="输入方案标题"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    方案描述
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    className="mt-1 input"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="详细描述此产品消费方案的目标和内容..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">标签</h3>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  常用标签
                </label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addTag(tag)}
                      disabled={formData.tags.includes(tag)}
                      className={`px-3 py-1 text-sm rounded-full border ${
                        formData.tags.includes(tag)
                          ? 'bg-blue-100 text-blue-800 border-blue-200 cursor-not-allowed'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  自定义标签
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    className="input flex-1"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="输入自定义标签..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <button
                    type="button"
                    onClick={() => addTag()}
                    className="btn btn-secondary btn-sm"
                  >
                    添加
                  </button>
                </div>
              </div>

              {formData.tags.length > 0 && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    已选标签
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Products */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <CubeIcon className="h-5 w-5 mr-2" />
                产品列表
              </h3>
            </div>
            <div className="p-6">
              {/* Add Product */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  添加产品
                </label>
                <div className="relative" ref={productDropdownRef}>
                  <input
                    type="text"
                    className="input"
                    placeholder="搜索产品..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                  />
                  {showProductDropdown && filteredProducts.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredProducts.map((product) => (
                        <div
                          key={product._id}
                          className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                          onClick={() => addProduct(product)}
                        >
                          <div className="font-medium">{product.productName}</div>
                          <div className="text-sm text-gray-500">
                            {product.productCode} | {product.category}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Product List */}
              {formData.products.length === 0 ? (
                <p className="text-gray-500 text-center py-8">暂无产品</p>
              ) : (
                <div className="space-y-4">
                  {formData.products.map((productItem, index) => {
                    const product = getProductById(productItem.productId)
                    return (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="font-medium text-gray-900">{product?.productName}</h4>
                            <p className="text-sm text-gray-500">
                              {product?.productCode} | {product?.category}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeProduct(index)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            定制指导 (基于客户情况和产品原始指导)
                          </label>
                          <textarea
                            rows={3}
                            className="input"
                            value={productItem.customGuidance}
                            onChange={(e) => updateProductGuidance(index, e.target.value)}
                            placeholder="根据客户具体情况，提供个性化的产品使用指导..."
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-4">
            <Link
              href="/dashboard/health-plans"
              className="btn btn-secondary"
            >
              取消
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? '创建中...' : '创建方案'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}