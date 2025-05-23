import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import connectDB from '@/lib/mongodb'
import Patient from '@/models/Patient'

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

    const patient = await Patient.findById(params.id)
      .populate('assignedDoctor', 'name department')

    if (!patient) {
      return NextResponse.json(
        { message: '患者不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({ patient })

  } catch (error) {
    console.error('Get patient error:', error)
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
    
    // Validate required fields
    const { firstName, lastName, phone, dateOfBirth, gender } = body
    if (!firstName || !lastName || !phone || !dateOfBirth || !gender) {
      return NextResponse.json(
        { message: '姓名、电话、出生日期和性别都是必需的' },
        { status: 400 }
      )
    }

    const patient = await Patient.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    ).populate('assignedDoctor', 'name department')

    if (!patient) {
      return NextResponse.json(
        { message: '患者不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: '患者信息更新成功',
      patient,
    })

  } catch (error) {
    console.error('Update patient error:', error)
    
    if (error.code === 11000) {
      return NextResponse.json(
        { message: '邮箱已被其他患者使用' },
        { status: 400 }
      )
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

    // Check permissions (only admin or doctor can delete)
    if (!['admin', 'doctor'].includes(decoded.role)) {
      return NextResponse.json(
        { message: '权限不足' },
        { status: 403 }
      )
    }

    await connectDB()

    const patient = await Patient.findByIdAndDelete(params.id)

    if (!patient) {
      return NextResponse.json(
        { message: '患者不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: '患者删除成功',
    })

  } catch (error) {
    console.error('Delete patient error:', error)
    return NextResponse.json(
      { message: '服务器错误，请稍后重试' },
      { status: 500 }
    )
  }
}
