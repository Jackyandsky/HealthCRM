import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category'; // For populating category name
import Tag from '@/models/Tag'; // For populating tag names
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

// POST /api/products - Create a new product
export async function POST(request: NextRequest) {
  const auth = await authorizeRequest(request, ['admin', 'system_admin']);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const body = await request.json();
    const { productCode, productName, category_id, price, stockStatus } = body;

    if (!productCode || !productName || !category_id) {
      return NextResponse.json({ message: '产品代码, 产品名称, 和品类ID是必填项' }, { status: 400 });
    }
    
    // Check if category exists
    const categoryExists = await Category.findById(category_id);
    if (!categoryExists) {
        return NextResponse.json({ message: '提供的品类ID无效' }, { status: 400 });
    }

    const newProduct = new Product({
      ...body,
      created_by_admin_id: auth.user?.id, // Assuming JWT 'id' field stores user's ObjectId
    });

    await newProduct.save();
    return NextResponse.json({ message: '产品创建成功', product: newProduct }, { status: 201 });

  } catch (error: any) {
    console.error('Create product error:', error);
    if (error.code === 11000) {
      return NextResponse.json({ message: '创建产品失败: 产品代码已存在' }, { status: 409 });
    }
    return NextResponse.json({ message: '服务器错误，请稍后重试', error: error.message }, { status: 500 });
  }
}

// GET /api/products - List products
export async function GET(request: NextRequest) {
  // Public access for listing products, no role check needed initially for GET list
  // const auth = await authorizeRequest(request);
  // if (auth.error) return auth.error;

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const sortField = searchParams.get('sortField') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const categoryId = searchParams.get('category_id');
    const tags = searchParams.get('tags')?.split(',');
    const brand = searchParams.get('brand');
    const stockStatus = searchParams.get('stockStatus');

    const skip = (page - 1) * limit;
    let query: any = {};

    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { productCode: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (categoryId) query.category_id = categoryId;
    if (brand) query.brand = brand;
    if (stockStatus) query.stockStatus = stockStatus;
    if (tags && tags.length > 0) {
        // Find Tag ObjectIds first
        const tagObjects = await Tag.find({ name: { $in: tags } }).select('_id');
        if (tagObjects.length > 0) {
            query.tags = { $in: tagObjects.map(t => t._id) };
        } else {
            // If no tags found by name, return empty to avoid matching products with non-existent tags
            query.tags = { $in: [] }; 
        }
    }


    const sortObj: any = {};
    if (sortField === 'price') { // Assuming 'price' is a field in your Product model, e.g., retailPrice
        sortObj['retailPrice'] = sortOrder === 'asc' ? 1 : -1;
    } else {
        sortObj[sortField] = sortOrder === 'asc' ? 1 : -1;
    }
    

    const [products, totalCount] = await Promise.all([
      Product.find(query)
        .populate({ path: 'category_id', select: 'name slug type' })
        .populate({ path: 'tags', select: 'name type' })
        .populate({ path: 'created_by_admin_id', select: 'name email' })
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .select('-__v'),
      Product.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      products,
      currentPage: page,
      totalPages,
      totalCount,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    });

  } catch (error: any) {
    console.error('Get products error:', error);
    return NextResponse.json({ message: '服务器错误，请稍后重试', error: error.message }, { status: 500 });
  }
}
