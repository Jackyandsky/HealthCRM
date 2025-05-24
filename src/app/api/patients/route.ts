import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import connectDB from '@/lib/mongodb'
import Patient from '@/models/Patient'

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
    
    // Filters
    const type = searchParams.get('type') || ''
    const priority = searchParams.get('priority') || ''
    const status = searchParams.get('status') || ''
    const doctor = searchParams.get('doctor') || ''
    const tab = searchParams.get('tab') || 'all'

    const skip = (page - 1) * limit

    // Build search query
    let searchQuery: any = { isActive: true }
    
    if (search) {
      searchQuery.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { patientId: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ]
    }

    // Apply filters
    if (type) {
      searchQuery.patientType = type
    }

    if (priority) {
      searchQuery.priority = priority
    }

    if (status) {
      searchQuery.status = status
    }

    if (doctor) {
      searchQuery.assignedDoctor = doctor
    }

    // Handle tab-based filtering
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]

    switch (tab) {
      case 'followup':
        // 需要回访的患者（回访日期在今天或之前）
        searchQuery.nextFollowUpDate = { $lte: today }
        break
      case 'medication':
        // 药物不足的患者（剩余用药少于7天）
        searchQuery['medications.remainingDays'] = { $lte: 7 }
        break
      case 'urgent':
        // 紧急处理的患者
        searchQuery.priority = 'urgent'
        break
      case 'all':
      default:
        // 全部患者，不添加额外过滤
        break
    }

    // Build sort object
    const sortObj: any = {}
    sortObj[sortField] = sortOrder === 'asc' ? 1 : -1

    // Get patients and total count with populated doctor info
    const [patients, totalCount] = await Promise.all([
      Patient.find(searchQuery)
        .populate('assignedDoctor', 'name department')
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .select('-__v'),
      Patient.countDocuments(searchQuery)
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      patients,
      currentPage: page,
      totalPages,
      totalCount,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    })

  } catch (error) {
    console.error('Get patients error:', error)
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
    
    // Validate required fields
    const { firstName, lastName, phone, dateOfBirth, gender } = body
    if (!firstName || !lastName || !phone || !dateOfBirth || !gender) {
      return NextResponse.json(
        { message: '姓名、电话、出生日期和性别都是必需的' },
        { status: 400 }
      )
    }

    // Generate patient ID
    const lastPatient = await Patient.findOne({}, {}, { sort: { 'createdAt': -1 } })
    let patientIdNumber = 1
    
    if (lastPatient && lastPatient.patientId) {
      const lastIdNumber = parseInt(lastPatient.patientId.replace('P', ''))
      patientIdNumber = lastIdNumber + 1
    }
    
    const patientId = `P${patientIdNumber.toString().padStart(3, '0')}`

    // Create new patient
    const patient = new Patient({
      patientId,
      ...body,
    })

    await patient.save()

    // Populate the assignedDoctor field before returning
    await patient.populate('assignedDoctor', 'name department')

    return NextResponse.json({
      message: '患者创建成功',
      patient,
    })

  } catch (error) {
    console.error('Create patient error:', error)
    
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
