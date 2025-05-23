import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import Tag from '@/models/Tag';
import User from '@/models/User'; // For role checks and created_by_admin_id
import Product from '@/models/Product'; // To check if tag is in use
import PlanTemplate from '@/models/PlanTemplate'; // To check if tag is in use
import FollowUp from '@/models/FollowUp'; // To check if tag is in use

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'health-crm-secret-key-2024';

// Helper function for JWT verification and role check
async function authorizeRequest(request: NextRequest, allowedRoles: string[] = []) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: NextResponse.json({ message: '未授权访问: 未提供令牌' }, { status: 401 }), user: null };
  }
  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
      return { error: NextResponse.json({ message: '权限不足' }, { status: 403 }), user: null };
    }
    return { error: null, user: decoded };
  } catch (error) {
    return { error: NextResponse.json({ message: '无效的访问令牌' }, { status: 401 }), user: null };
  }
}

// POST /api/tags - Create a new tag
export async function POST(request: NextRequest) {
  const auth = await authorizeRequest(request, ['admin', 'system_admin']);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const body = await request.json();
    const { name, type } = body;

    if (!name || !type) {
      return NextResponse.json({ message: '名称和类型是必填项' }, { status: 400 });
    }
    
    if (!['user', 'product', 'plan_template', 'follow_up', 'general'].includes(type)) {
        return NextResponse.json({ message: '无效的标签类型值' }, { status: 400 });
    }

    const newTag = new Tag({
      name,
      type,
      created_by_admin_id: auth.user?.id, // User's ObjectId from JWT
    });

    await newTag.save();
    return NextResponse.json({ message: '标签创建成功', tag: newTag }, { status: 201 });

  } catch (error: any) {
    console.error('Create tag error:', error);
    if (error.code === 11000) { // Handles unique index violation for name/type combo
      return NextResponse.json({ message: '创建标签失败: 该类型下名称已存在' }, { status: 409 });
    }
    return NextResponse.json({ message: '服务器错误，请稍后重试', error: error.message }, { status: 500 });
  }
}

// GET /api/tags - List tags
export async function GET(request: NextRequest) {
  // Public or broader access for listing tags
  // const auth = await authorizeRequest(request);
  // if (auth.error) return auth.error;
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20'); // Default to 20 tags per page
    const sortField = searchParams.get('sortField') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    let query: any = {};
    const skip = (page - 1) * limit;

    if (type) query.type = type;
    if (search) query.name = { $regex: search, $options: 'i' };
    
    const sortObj: any = {};
    sortObj[sortField] = sortOrder === 'asc' ? 1 : -1;

    const [tags, totalCount] = await Promise.all([
        Tag.find(query)
            .populate('created_by_admin_id', 'name email')
            .sort(sortObj)
            .skip(skip)
            .limit(limit)
            .select('-__v'),
        Tag.countDocuments(query)
    ]);
    
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({ 
        tags,
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1,
    });

  } catch (error: any) {
    console.error('Get tags error:', error);
    return NextResponse.json({ message: '服务器错误，请稍后重试', error: error.message }, { status: 500 });
  }
}
