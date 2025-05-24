import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import connectDB from '@/lib/mongodb'
import Customer from '@/models/Customer'

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
        .populate('salesRep', 'name')
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .select('-__v'),
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
    const { firstName, lastName, phone } = body
    if (!firstName || !lastName || !phone) {
      return NextResponse.json(
        { message: '姓名和电话都是必需的' },
        { status: 400 }
      )
    }

    // 生成客户ID
    const lastCustomer = await Customer.findOne({}, {}, { sort: { 'createdAt': -1 } })
    let customerIdNumber = 1
    
    if (lastCustomer && lastCustomer.customerId) {
      const lastIdNumber = parseInt(lastCustomer.customerId.replace('C', ''))
      customerIdNumber = lastIdNumber + 1
    }
    
    const customerId = `C${customerIdNumber.toString().padStart(4, '0')}`

    // 创建新客户
    const customer = new Customer({
      customerId,
      ...body,
    })

    await customer.save()

    // 返回时填充销售代表信息
    await customer.populate('salesRep', 'name')

    return NextResponse.json({
      message: '客户创建成功',
      customer,
    })

  } catch (error) {
    console.error('Create customer error:', error)
    
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const mongoError = error as { code: unknown; keyValue?: Record<string, unknown> };
      if (mongoError.code === 11000) {
        const conflictingField = mongoError.keyValue ? Object.keys(mongoError.keyValue).join(', ') : '字段';
        return NextResponse.json(
          { message: `创建失败：${conflictingField}已存在。` },
          { status: 409 } // 409 Conflict is more appropriate for duplicate data
        );
      }
    }
    return NextResponse.json(
      { message: '服务器错误，请稍后重试' },
      { status: 500 }
    )
  }
}
