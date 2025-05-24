import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import connectDB from '@/lib/mongodb'
import Customer from '@/models/Customer'

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
    
    try {
      jwt.verify(token, process.env.NEXTAUTH_SECRET || 'health-crm-secret-key-2024')
    } catch (error) {
      return NextResponse.json(
        { message: '无效的访问令牌' },
        { status: 401 }
      )
    }

    await connectDB()

    const customer = await Customer.findById(params.id)
      .populate('salesRep', 'name employeeId')

    if (!customer) {
      return NextResponse.json(
        { message: '客户不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({ customer })

  } catch (error) {
    console.error('Get customer error:', error)
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

    const customer = await Customer.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    ).populate('salesRep', 'name employeeId')

    if (!customer) {
      return NextResponse.json(
        { message: '客户不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: '客户信息更新成功',
      customer,
    })

  } catch (error) {
    console.error('Update customer error:', error)
    
    // if (error.code === 11000) {
    //   return NextResponse.json(
    //     { message: '邮箱已被其他客户使用' },
    //     { status: 400 }
    //   )
    // }
    if (typeof error === 'object' && error !== null && 'code' in error) {
      // 3. 类型断言，以便访问 code 和可能存在的 keyValue
      const mongoError = error as { code: unknown; keyValue?: Record<string, unknown> }; 
  
      if (mongoError.code === 11000) {
        // 检查是哪个字段导致了重复键错误 (通常是 email)
        let conflictingFieldMessage = '提供的一个或多个唯一字段已被使用。';
        if (mongoError.keyValue && mongoError.keyValue.email) {
          conflictingFieldMessage = '邮箱已被其他客户使用。';
        } else if (mongoError.keyValue && mongoError.keyValue.customerId) {
          conflictingFieldMessage = '客户ID已被其他客户使用。';
        }
        // 等等，可以为其他唯一键添加特定消息
  
        return NextResponse.json(
          { message: conflictingFieldMessage },
          // 409 Conflict 更适合表示由于与当前资源状态冲突而无法完成请求 (例如唯一键冲突)
          { status: 409 } 
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

    // 检查权限（系统管理员和管理员可以删除）
    if (!['system_admin', 'admin'].includes(decoded.role)) {
      return NextResponse.json(
        { message: '权限不足' },
        { status: 403 }
      )
    }

    await connectDB()

    const customer = await Customer.findByIdAndUpdate(
      params.id,
      { isActive: false },
      { new: true }
    )

    if (!customer) {
      return NextResponse.json(
        { message: '客户不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: '客户已停用',
    })

  } catch (error) {
    console.error('Delete customer error:', error)
    return NextResponse.json(
      { message: '服务器错误，请稍后重试' },
      { status: 500 }
    )
  }
}
