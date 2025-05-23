import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import connectDB from '@/lib/mongodb'
import Customer from '@/models/Customer'
import User from '@/models/User' // Added User model import

export async function GET(request: NextRequest) {
  try {
    // Verify JWT token
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: '未授权访问' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    
    try {
      jwt.verify(token, process.env.NEXTAUTH_SECRET || 'health-crm-secret-key-2024')
    } catch (error) {
      return NextResponse.json(
        { message: '无效的访问令牌' },
        { status: 401 }
      )
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const sortField = searchParams.get('sortField') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    
    // 过滤器
    const customerType = searchParams.get('customerType') || ''
    const priority = searchParams.get('priority') || ''
    const status = searchParams.get('status') || ''
    const salesRep = searchParams.get('salesRep') || ''
    const tab = searchParams.get('tab') || 'all'

    const skip = (page - 1) * limit

    // 构建搜索查询
    let searchQuery: any = { isActive: true }
    
    if (search) {
      searchQuery.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { customerId: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ]
    }

    // 应用过滤器
    if (customerType) {
      searchQuery.customerType = customerType
    }

    if (priority) {
      searchQuery['followUp.priority'] = priority
    }

    if (status) {
      searchQuery.status = status
    }

    if (salesRep) {
      searchQuery.salesRep = salesRep
    }

    // Tab-based filtering
    const today = new Date()
    
    switch (tab) {
      case 'potential':
        searchQuery.customerType = 'potential'
        break
      case 'new':
        searchQuery.customerType = 'new'
        break
      case 'regular':
        searchQuery.customerType = 'regular'
        break
      case 'vip':
        searchQuery.customerType = 'vip'
        break
      case 'inactive':
        searchQuery.customerType = 'inactive'
        break
      case 'followup':
        // 需要回访的客户（回访日期在今天或之前）
        searchQuery['followUp.nextContactDate'] = { $lte: today }
        break
      case 'medication':
        // 产品余量不足的客户（效果评分低或需要补充）
        searchQuery.$or = [
          { 'productUsage.effectiveness': { $lte: 2 } },
          { 'productUsage.willContinue': true }
        ]
        break
      case 'urgent':
        // 紧急处理的客户
        searchQuery['followUp.priority'] = 'urgent'
        break
      case 'all':
      default:
        // 全部客户，不添加额外过滤
        break
    }

    // 构建排序对象
    const sortObj: any = {}
    sortObj[sortField] = sortOrder === 'asc' ? 1 : -1

    // 获取客户数据和总数
    const [customers, totalCount] = await Promise.all([
      Customer.find(searchQuery)
        .populate('salesRep', 'name email') // Added email to salesRep
        .populate('user_id', 'name email role isActive') // Populate user info
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .select('-__v'), // Exclude __v from Customer, populated fields will be included
      Customer.countDocuments(searchQuery)
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      customers,
      currentPage: page,
      totalPages,
      totalCount,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    })

  } catch (error) {
    console.error('Get customers error:', error)
    return NextResponse.json(
      { message: '服务器错误，请稍后重试' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify JWT token
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: '未授权访问' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    
    try {
      jwt.verify(token, process.env.NEXTAUTH_SECRET || 'health-crm-secret-key-2024')
    } catch (error) {
      return NextResponse.json(
        { message: '无效的访问令牌' },
        { status: 401 }
      )
    }

    await connectDB()

    const body = await request.json()
    
    // 验证必需字段
    const { user_id, firstName, lastName, phone } = body // Added user_id to destructuring
    if (!user_id || !firstName || !lastName || !phone) {
      return NextResponse.json(
        { message: 'user_id, 姓名和电话都是必需的' }, // Updated message
        { status: 400 }
      )
    }

    // Verify User exists and has role 'customer'
    const user = await User.findById(user_id)
    if (!user) {
      return NextResponse.json(
        { message: '提供的user_id无效，用户不存在' },
        { status: 404 } // Not Found
      )
    }
    if (user.role !== 'customer') {
      return NextResponse.json(
        { message: '提供的用户不是客户角色' },
        { status: 400 } // Bad Request
      )
    }

    // Verify Customer profile doesn't already exist for this user_id
    const existingCustomerProfile = await Customer.findOne({ user_id })
    if (existingCustomerProfile) {
      return NextResponse.json(
        { message: '此用户已存在客户资料' },
        { status: 409 } // Conflict
      )
    }

    // 生成客户ID (existing logic, can be kept or modified)
    const lastCustomer = await Customer.findOne({}, {}, { sort: { 'createdAt': -1 } })
    let customerIdNumber = 1
    
    if (lastCustomer && lastCustomer.customerId) {
      const lastIdNumber = parseInt(lastCustomer.customerId.replace('C', ''))
      customerIdNumber = lastIdNumber + 1
    }
    
    const customerId = `C${customerIdNumber.toString().padStart(4, '0')}`

    // 创建新客户
    const customer = new Customer({
      user_id, // Store the provided user_id
      customerId,
      ...body,
    })

    await customer.save()

    // 返回时填充销售代表和用户信息
    await customer.populate('salesRep', 'name email') // Added email to salesRep populate
    await customer.populate('user_id', 'name email role') // Populate basic user info

    return NextResponse.json({
      message: '客户创建成功',
      customer, // Customer now includes populated user_id details
    })

  } catch (error) {
    console.error('Create customer error:', error)
    
    if (error.code === 11000) { // Duplicate key error
      let message = '创建客户失败，存在重复键。';
      if (error.keyPattern && error.keyPattern.user_id) {
        message = '此用户已存在客户资料 (user_id 重复)';
      } else if (error.keyPattern && error.keyPattern.customerId) {
        message = '客户ID (customerId) 已存在';
      } else if (error.keyPattern && error.keyPattern.email) {
        // Assuming email might be unique in Customer model in future, though not specified now
        message = '客户邮箱已存在';
      }
      return NextResponse.json(
        { message },
        { status: 409 } // Conflict is more appropriate for duplicate unique key
      )
    }
    
    return NextResponse.json(
      { message: '服务器错误，请稍后重试' },
      { status: 500 }
    )
  }
}
