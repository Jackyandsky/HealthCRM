import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import Tag from '@/models/Tag';
import User from '@/models/User'; // For role checks and populating created_by_admin_id
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

// GET /api/tags/[id] - Get a single tag by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  // Public access for single tag view
  try {
    await connectDB();
    const { id } = params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return NextResponse.json({ message: '无效的标签ID格式' }, { status: 400 });
    }

    const tag = await Tag.findById(id)
      .populate('created_by_admin_id', 'name email')
      .select('-__v');

    if (!tag) {
      return NextResponse.json({ message: '标签未找到' }, { status: 404 });
    }

    return NextResponse.json({ tag });

  } catch (error: any) {
    console.error('Get tag by ID error:', error);
    return NextResponse.json({ message: '服务器错误，请稍后重试', error: error.message }, { status: 500 });
  }
}

// PUT /api/tags/[id] - Update a tag
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authorizeRequest(request, ['admin', 'system_admin']);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const { id } = params;
    const body = await request.json();
    const { name, type } = body; // Only allow name and type to be updated for now

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return NextResponse.json({ message: '无效的标签ID格式' }, { status: 400 });
    }

    if (!name && !type) {
        return NextResponse.json({ message: '需要提供名称或类型进行更新' }, { status: 400 });
    }
    if (type && !['user', 'product', 'plan_template', 'follow_up', 'general'].includes(type)) {
        return NextResponse.json({ message: '无效的标签类型值' }, { status: 400 });
    }
    
    // Prevent created_by_admin_id from being updated via this route
    delete body.created_by_admin_id;

    const updatedTag = await Tag.findByIdAndUpdate(id, { name, type }, { new: true, runValidators: true })
      .populate('created_by_admin_id', 'name email')
      .select('-__v');

    if (!updatedTag) {
      return NextResponse.json({ message: '标签未找到' }, { status: 404 });
    }

    return NextResponse.json({ message: '标签更新成功', tag: updatedTag });

  } catch (error: any) {
    console.error('Update tag error:', error);
    if (error.code === 11000) { // Handles unique index violation for name/type combo
      return NextResponse.json({ message: '更新标签失败: 该类型下名称已存在' }, { status: 409 });
    }
    return NextResponse.json({ message: '服务器错误，请稍后重试', error: error.message }, { status: 500 });
  }
}

// DELETE /api/tags/[id] - Delete a tag
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authorizeRequest(request, ['admin', 'system_admin']);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const { id } = params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return NextResponse.json({ message: '无效的标签ID格式' }, { status: 400 });
    }

    // Optional: Check if the tag is in use before deletion.
    // This can be complex and resource-intensive depending on how many models use tags.
    // Example for Products (can be expanded for other models):
    const productCount = await Product.countDocuments({ tags: id });
    if (productCount > 0) {
      return NextResponse.json({ message: '无法删除标签: 仍有产品使用此标签。请先移除产品的此标签。' }, { status: 400 });
    }
    const userCount = await User.countDocuments({ tags: id });
     if (userCount > 0) {
      return NextResponse.json({ message: '无法删除标签: 仍有用户使用此标签。请先移除用户的此标签。' }, { status: 400 });
    }
    const planTemplateCount = await PlanTemplate.countDocuments({ tags: id });
    if (planTemplateCount > 0) {
      return NextResponse.json({ message: '无法删除标签: 仍有计划模板使用此标签。请先移除计划模板的此标签。' }, { status: 400 });
    }
    const followUpCount = await FollowUp.countDocuments({ tags: id });
    if (followUpCount > 0) {
      return NextResponse.json({ message: '无法删除标签: 仍有跟进记录使用此标签。请先移除跟进记录的此标签。' }, { status: 400 });
    }
    // Add similar checks for other models that use tags (e.g., User, PlanTemplate, FollowUp)

    const deletedTag = await Tag.findByIdAndDelete(id);

    if (!deletedTag) {
      return NextResponse.json({ message: '标签未找到' }, { status: 404 });
    }

    return NextResponse.json({ message: '标签删除成功' });

  } catch (error: any) {
    console.error('Delete tag error:', error);
    return NextResponse.json({ message: '服务器错误，请稍后重试', error: error.message }, { status: 500 });
  }
}
