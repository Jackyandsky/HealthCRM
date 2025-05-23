import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import Product from '@/models/Product'; // To check if category is in use
import PlanTemplate from '@/models/PlanTemplate'; // To check if category is in use
import User from '@/models/User'; // For role checks

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

// GET /api/categories/[id] - Get a single category by ID or slug
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  // Public access
  try {
    await connectDB();
    const { id } = params;
    let category;

    // Check if ID is a valid MongoDB ObjectId, otherwise assume it's a slug
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      category = await Category.findById(id)
        .populate('parent_category_id', 'name slug')
        .populate('ancestor_ids', 'name slug')
        .select('-__v');
    } else {
      category = await Category.findOne({ slug: id })
        .populate('parent_category_id', 'name slug')
        .populate('ancestor_ids', 'name slug')
        .select('-__v');
    }

    if (!category) {
      return NextResponse.json({ message: '品类未找到' }, { status: 404 });
    }

    // Optionally, fetch direct children if requested
    const { searchParams } = new URL(request.url);
    if (searchParams.get('includeChildren') === 'true') {
        const children = await Category.find({ parent_category_id: category._id }).select('-__v -ancestor_ids');
        return NextResponse.json({ category, children });
    }
    
    return NextResponse.json({ category });

  } catch (error: any) {
    console.error('Get category by ID error:', error);
    return NextResponse.json({ message: '服务器错误，请稍后重试', error: error.message }, { status: 500 });
  }
}

// PUT /api/categories/[id] - Update a category
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authorizeRequest(request, ['admin', 'system_admin']);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const { id } = params;
    const body = await request.json();
    const { name, slug, type, parent_category_id, description, display_order, icon_url } = body;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return NextResponse.json({ message: '无效的品类ID格式' }, { status: 400 });
    }

    const categoryToUpdate = await Category.findById(id);
    if (!categoryToUpdate) {
        return NextResponse.json({ message: '品类未找到' }, { status: 404 });
    }

    // Handle slug update and uniqueness check
    if (slug && slug !== categoryToUpdate.slug) {
        const existingSlug = await Category.findOne({ slug: slug, _id: { $ne: id } });
        if (existingSlug) {
            return NextResponse.json({ message: '提供的slug已被其他品类使用' }, { status: 409 });
        }
        categoryToUpdate.slug = slug;
    } else if (name && name !== categoryToUpdate.name && !slug) { 
        // If name changes and slug is not provided, regenerate slug
        categoryToUpdate.slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
        const existingSlug = await Category.findOne({ slug: categoryToUpdate.slug, _id: { $ne: id } });
        if (existingSlug) {
             // Append a short hash if generated slug conflicts
            categoryToUpdate.slug = `${categoryToUpdate.slug}-${Date.now().toString(36).slice(-4)}`;
        }
    }
    
    if (name) categoryToUpdate.name = name;
    if (type) {
        if (!['product', 'plan_template'].includes(type)) {
            return NextResponse.json({ message: '无效的类型值' }, { status: 400 });
        }
        categoryToUpdate.type = type;
    }
    if (description !== undefined) categoryToUpdate.description = description;
    if (display_order !== undefined) categoryToUpdate.display_order = display_order;
    if (icon_url !== undefined) categoryToUpdate.icon_url = icon_url;

    // Parent category and ancestor_ids update (more complex if parent changes)
    if (parent_category_id !== undefined && String(parent_category_id) !== String(categoryToUpdate.parent_category_id)) {
        if (parent_category_id === null) {
            categoryToUpdate.parent_category_id = null;
            categoryToUpdate.ancestor_ids = [];
        } else {
            const parentCategory = await Category.findById(parent_category_id);
            if (!parentCategory) {
                return NextResponse.json({ message: '提供的父品类ID无效' }, { status: 400 });
            }
            // Prevent setting self or descendant as parent (circular dependency)
            if (String(parentCategory._id) === String(categoryToUpdate._id) || parentCategory.ancestor_ids.map(a => String(a)).includes(String(categoryToUpdate._id))) {
                 return NextResponse.json({ message: '不能将品类设置为自身的子品类或后代品类' }, { status: 400 });
            }
            categoryToUpdate.parent_category_id = parent_category_id;
            categoryToUpdate.ancestor_ids = [...(parentCategory.ancestor_ids || []), parent_category_id];
            // Potentially need to update ancestor_ids of all children of the current category - can be heavy
        }
    }
    
    categoryToUpdate.updated_at = new Date();
    await categoryToUpdate.save();
    
    // Populate for response
    const populatedCategory = await Category.findById(categoryToUpdate._id)
        .populate('parent_category_id', 'name slug')
        .populate('ancestor_ids', 'name slug')
        .select('-__v');

    return NextResponse.json({ message: '品类更新成功', category: populatedCategory });

  } catch (error: any) {
    console.error('Update category error:', error);
    if (error.code === 11000) {
      let field = '字段';
      if (error.keyPattern?.slug) field = 'slug';
      else if (error.keyPattern?.name && error.keyPattern?.parent_category_id && error.keyPattern?.type) field = '名称、父品类和类型的组合';
      return NextResponse.json({ message: `更新品类失败: ${field} 已存在或重复` }, { status: 409 });
    }
    return NextResponse.json({ message: '服务器错误，请稍后重试', error: error.message }, { status: 500 });
  }
}

// DELETE /api/categories/[id] - Delete a category
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authorizeRequest(request, ['admin', 'system_admin']);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const { id } = params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return NextResponse.json({ message: '无效的品类ID格式' }, { status: 400 });
    }

    // Check if category is in use by Products
    const productCount = await Product.countDocuments({ category_id: id });
    if (productCount > 0) {
      return NextResponse.json({ message: '无法删除品类: 仍有产品属于此品类' }, { status: 400 });
    }

    // Check if category is in use by PlanTemplates
    const planTemplateCount = await PlanTemplate.countDocuments({ category_id: id });
    if (planTemplateCount > 0) {
      return NextResponse.json({ message: '无法删除品类: 仍有计划模板属于此品类' }, { status: 400 });
    }
    
    // Check if it's a parent to other categories
    const childrenCount = await Category.countDocuments({ parent_category_id: id });
    if (childrenCount > 0) {
        return NextResponse.json({ message: '无法删除品类: 此品类下仍有子品类' }, { status: 400 });
    }

    const deletedCategory = await Category.findByIdAndDelete(id);

    if (!deletedCategory) {
      return NextResponse.json({ message: '品类未找到' }, { status: 404 });
    }

    return NextResponse.json({ message: '品类删除成功' });

  } catch (error: any) {
    console.error('Delete category error:', error);
    return NextResponse.json({ message: '服务器错误，请稍后重试', error: error.message }, { status: 500 });
  }
}
