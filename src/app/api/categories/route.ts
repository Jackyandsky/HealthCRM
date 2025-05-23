import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import Product from '@/models/Product'; // To check if category is in use by products
import PlanTemplate from '@/models/PlanTemplate'; // To check if category is in use by plan templates
import User from '@/models/User'; // For role checks

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'health-crm-secret-key-2024';

// Helper function for JWT verification and role check (copied from product routes)
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

// POST /api/categories - Create a new category
export async function POST(request: NextRequest) {
  const auth = await authorizeRequest(request, ['admin', 'system_admin']);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const body = await request.json();
    const { name, type, slug, parent_category_id, description, display_order, icon_url } = body;

    if (!name || !type) {
      return NextResponse.json({ message: '名称和类型是必填项' }, { status: 400 });
    }
    
    if (type && !['product', 'plan_template'].includes(type)) {
        return NextResponse.json({ message: '无效的类型值' }, { status: 400 });
    }

    // Slug generation is handled by pre-save hook in model if not provided
    // However, if slug is provided, we should check for its uniqueness
    if (slug) {
        const existingSlug = await Category.findOne({ slug });
        if (existingSlug) {
            return NextResponse.json({ message: '提供的slug已存在' }, { status: 409 });
        }
    }
    
    let ancestor_ids: string[] = [];
    if (parent_category_id) {
        const parentCategory = await Category.findById(parent_category_id);
        if (!parentCategory) {
            return NextResponse.json({ message: '提供的父品类ID无效' }, { status: 400 });
        }
        ancestor_ids = [...(parentCategory.ancestor_ids || []), parent_category_id];
    }


    const newCategory = new Category({
      name,
      slug, // Will be auto-generated if null/empty and name is present
      type,
      parent_category_id: parent_category_id || null,
      ancestor_ids,
      description,
      display_order,
      icon_url,
      // created_at and updated_at are handled by timestamps
    });

    await newCategory.save();
    return NextResponse.json({ message: '品类创建成功', category: newCategory }, { status: 201 });

  } catch (error: any) {
    console.error('Create category error:', error);
    if (error.code === 11000) { // Handles unique index violations (e.g., slug or name/parent/type combo)
      let field = '字段';
      if (error.keyPattern?.slug) field = 'slug';
      else if (error.keyPattern?.name && error.keyPattern?.parent_category_id && error.keyPattern?.type) field = '名称、父品类和类型的组合';
      return NextResponse.json({ message: `创建品类失败: ${field} 已存在或重复` }, { status: 409 });
    }
    return NextResponse.json({ message: '服务器错误，请稍后重试', error: error.message }, { status: 500 });
  }
}

// GET /api/categories - List categories
export async function GET(request: NextRequest) {
  // Public access for listing categories
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const parentId = searchParams.get('parent_category_id');
    const search = searchParams.get('search');
    const fetchChildrenOf = searchParams.get('fetchChildrenOf'); // ID of parent to fetch direct children
    const fetchTree = searchParams.get('fetchTree'); // 'true' to fetch full tree, or an ID to fetch subtree

    let query: any = {};

    if (type) query.type = type;
    if (search) query.name = { $regex: search, $options: 'i' };
    
    if (parentId === "null") { // Fetch root categories
        query.parent_category_id = null;
    } else if (parentId) {
        query.parent_category_id = parentId;
    }

    if (fetchChildrenOf) { // Specific request to get direct children of a parent
        query.parent_category_id = fetchChildrenOf;
    }
    
    // Simple list for now, tree fetching can be complex and might need a dedicated endpoint or graphQL
    // For a basic tree structure, one might fetch all and reconstruct on client, or use $graphLookup (more advanced)
    
    const categories = await Category.find(query)
      .populate('parent_category_id', 'name slug')
      .sort({ display_order: 1, name: 1 })
      .select('-__v');

    return NextResponse.json({ categories });

  } catch (error: any) {
    console.error('Get categories error:', error);
    return NextResponse.json({ message: '服务器错误，请稍后重试', error: error.message }, { status: 500 });
  }
}
