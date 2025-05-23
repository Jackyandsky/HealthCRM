import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category'; // For populating category name
import Tag from '@/models/Tag'; // For populating tag names

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'health-crm-secret-key-2024';

// Helper function for JWT verification and role check (can be shared if placed in a common lib)
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

// GET /api/products/[id] - Get a single product
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  // Public access for single product view
  // const auth = await authorizeRequest(request); 
  // if (auth.error) return auth.error;

  try {
    await connectDB();
    const { id } = params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return NextResponse.json({ message: '无效的产品ID格式' }, { status: 400 });
    }

    const product = await Product.findById(id)
      .populate({ path: 'category_id', select: 'name slug type' })
      .populate({ path: 'tags', select: 'name type' })
      .populate({ path: 'created_by_admin_id', select: 'name email' })
      .select('-__v');

    if (!product) {
      return NextResponse.json({ message: '产品未找到' }, { status: 404 });
    }

    return NextResponse.json({ product });

  } catch (error: any) {
    console.error('Get product by ID error:', error);
    return NextResponse.json({ message: '服务器错误，请稍后重试', error: error.message }, { status: 500 });
  }
}

// PUT /api/products/[id] - Update a product
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authorizeRequest(request, ['admin', 'system_admin']);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const { id } = params;
    const body = await request.json();

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return NextResponse.json({ message: '无效的产品ID格式' }, { status: 400 });
    }
    
    if (body.category_id) {
        const categoryExists = await Category.findById(body.category_id);
        if (!categoryExists) {
            return NextResponse.json({ message: '提供的品类ID无效' }, { status: 400 });
        }
    }
    
    // Prevent created_by_admin_id from being updated
    delete body.created_by_admin_id;

    const updatedProduct = await Product.findByIdAndUpdate(id, body, { new: true, runValidators: true })
      .populate({ path: 'category_id', select: 'name slug type' })
      .populate({ path: 'tags', select: 'name type' })
      .populate({ path: 'created_by_admin_id', select: 'name email' })
      .select('-__v');

    if (!updatedProduct) {
      return NextResponse.json({ message: '产品未找到' }, { status: 404 });
    }

    return NextResponse.json({ message: '产品更新成功', product: updatedProduct });

  } catch (error: any) {
    console.error('Update product error:', error);
     if (error.code === 11000) { // Handle unique constraint errors (e.g. productCode)
      return NextResponse.json({ message: '更新产品失败: 产品代码已存在' }, { status: 409 });
    }
    return NextResponse.json({ message: '服务器错误，请稍后重试', error: error.message }, { status: 500 });
  }
}

// DELETE /api/products/[id] - Delete a product (soft delete by marking isActive: false)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authorizeRequest(request, ['admin', 'system_admin']);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const { id } = params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return NextResponse.json({ message: '无效的产品ID格式' }, { status: 400 });
    }

    // Soft delete: find product and update isActive to false
    // Or, if hard delete is preferred: const deletedProduct = await Product.findByIdAndDelete(id);
    const product = await Product.findByIdAndUpdate(id, { isActive: false }, { new: true });

    if (!product) {
      return NextResponse.json({ message: '产品未找到' }, { status: 404 });
    }

    return NextResponse.json({ message: '产品已停用 (软删除)' });

  } catch (error: any) {
    console.error('Delete product error:', error);
    return NextResponse.json({ message: '服务器错误，请稍后重试', error: error.message }, { status: 500 });
  }
}
