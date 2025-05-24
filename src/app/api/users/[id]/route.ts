import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    let decoded: any
    
    try {
      decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'health-crm-secret-key-2024')
    } catch (error) {
      return NextResponse.json(
        { message: '无效的访问令牌' },
        { status: 401 }
      )
    }

    await connectDB()

    const user = await User.findById(params.id)
      .populate('salesInfo.teamLead', 'name employeeId')
      .select('-password -__v')

    if (!user) {
      return NextResponse.json(
        { message: '用户不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })

  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { message: '服务器错误，请稍后重试' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    let decoded: any
    
    try {
      decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'health-crm-secret-key-2024')
    } catch (error) {
      return NextResponse.json(
        { message: '无效的访问令牌' },
        { status: 401 }
      )
    }

    // Check permissions
    if (decoded.role !== 'system_admin') {
      return NextResponse.json(
        { message: '权限不足' },
        { status: 403 }
      )
    }

    await connectDB()

    const body = await request.json()
    
    // Validate required fields
    const { name, email, role } = body
    if (!name || !email || !role) {
      return NextResponse.json(
        { message: '姓名、邮箱和角色都是必需的' },
        { status: 400 }
      )
    }

    // Check if email is already taken by another user
    const existingUser = await User.findOne({ 
      email, 
      _id: { $ne: params.id } 
    })
    
    if (existingUser) {
      return NextResponse.json(
        { message: '邮箱已被其他用户使用' },
        { status: 400 }
      )
    }

    // Prepare update data
    const updateData = { ...body }
    
    // If password is provided, hash it
    if (body.password) {
      updateData.password = await bcrypt.hash(body.password, 12)
    } else {
      // Remove password from update if not provided
      delete updateData.password
    }

    const user = await User.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('salesInfo.teamLead', 'name employeeId')
      .select('-password -__v')

    if (!user) {
      return NextResponse.json(
        { message: '用户不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: '用户信息更新成功',
      user,
    })

  } catch (error) {
    console.error('Update user error:', error)
    
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    let decoded: any
    
    try {
      decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'health-crm-secret-key-2024')
    } catch (error) {
      return NextResponse.json(
        { message: '无效的访问令牌' },
        { status: 401 }
      )
    }

    // Check permissions (only system admin can delete)
    if (decoded.role !== 'system_admin') {
      return NextResponse.json(
        { message: '权限不足' },
        { status: 403 }
      )
    }

    await connectDB()

    // Get the user to check if it's a system admin
    const userToDelete = await User.findById(params.id)
    if (!userToDelete) {
      return NextResponse.json(
        { message: '用户不存在' },
        { status: 404 }
      )
    }

    // Prevent deleting system admin users
    if (userToDelete.role === 'system_admin') {
      return NextResponse.json(
        { message: '不能删除系统管理员账户' },
        { status: 403 }
      )
    }

    // Soft delete by setting isActive to false
    const user = await User.findByIdAndUpdate(
      params.id,
      { isActive: false },
      { new: true }
    )

    return NextResponse.json({
      message: '用户已停用',
    })

  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { message: '服务器错误，请稍后重试' },
      { status: 500 }
    )
  }
}
