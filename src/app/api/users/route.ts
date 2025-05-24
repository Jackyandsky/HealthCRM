import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

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
    const role = searchParams.get('role') || ''
    const department = searchParams.get('department') || ''
    const sortField = searchParams.get('sortField') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const skip = (page - 1) * limit

    // Build search query
    let searchQuery: any = {}
    
    if (search) {
      searchQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ]
    }

    if (role) {
      // Handle multiple roles separated by comma
      if (role.includes(',')) {
        const roles = role.split(',').map(r => r.trim())
        searchQuery.role = { $in: roles }
      } else {
        searchQuery.role = role
      }
    }

    if (department) {
      searchQuery.department = department
    }

    // Build sort object
    const sortObj: any = {}
    sortObj[sortField] = sortOrder === 'asc' ? 1 : -1

    // Get users and total count
    const [users, totalCount] = await Promise.all([
      User.find(searchQuery)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .select('-password -__v'),
      User.countDocuments(searchQuery)
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      users,
      currentPage: page,
      totalPages,
      totalCount,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    })

  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { message: '服务器错误，请稍后重试' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify JWT token and admin role
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: '未授权访问' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    let decoded: any
    
    try {
      decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'health-crm-secret-key-2024')
    } catch (error) {
      return NextResponse.json(
        { message: '无效的访问令牌' },
        { status: 401 }
      )
    }

    // Check if user is admin
    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { message: '权限不足' },
        { status: 403 }
      )
    }

    await connectDB()

    const body = await request.json()
    const { name, email, password, role, phone, department } = body

    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { message: '姓名、邮箱、密码和角色都是必需的' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { message: '该邮箱已被使用' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      phone,
      department,
    })

    await user.save()

    // Return user data without password
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      department: user.department,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }

    return NextResponse.json({
      message: '用户创建成功',
      user: userData,
    })

  } catch (error) {
    console.error('Create user error:', error)
    
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
