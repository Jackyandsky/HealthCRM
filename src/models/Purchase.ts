import mongoose from 'mongoose';

const purchaseItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  productCode: {
    type: String,
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  priceType: {
    type: String,
    enum: ['retail', 'wholesale', 'preferred_customer'],
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
  },
  notes: String,
});

const purchaseSchema = new mongoose.Schema({
  purchaseId: {
    type: String,
    unique: true,
    required: true,
  },
  
  // 关联信息 - 移除重复数据
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  salesRepId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  healthPlanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HealthPlan',
    required: false,
  },
  
  // Purchase details
  items: [purchaseItemSchema],
  
  // Pricing summary
  subtotal: {
    type: Number,
    required: true,
    min: 0,
  },
  totalDiscount: {
    type: Number,
    default: 0,
    min: 0,
  },
  tax: {
    type: Number,
    default: 0,
    min: 0,
  },
  taxRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 1, // Percentage as decimal (0.1 = 10%)
  },
  shippingCost: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  
  // Payment information
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'bank_transfer', 'check', 'points', 'mixed'],
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'paid', 'refunded', 'cancelled'],
    default: 'pending',
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  paymentDate: Date,
  paymentReference: String, // Transaction ID, check number, etc.
  
  // 简化佣金追踪
  commissionAmount: {
    type: Number,
    default: 0,
  },
  
  // Order status and tracking
  orderStatus: {
    type: String,
    enum: ['draft', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'draft',
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  shippingDate: Date,
  deliveryDate: Date,
  trackingNumber: String,
  
  // 简化配送信息
  shippingAddress: String,
  
  notes: String,
  
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Pre-save middleware to generate purchase ID
purchaseSchema.pre('save', async function(next) {
  if (this.isNew && !this.purchaseId) {
    try {
      const count = await mongoose.model('Purchase').countDocuments();
      const year = new Date().getFullYear();
      const month = String(new Date().getMonth() + 1).padStart(2, '0');
      this.purchaseId = `PUR${year}${month}${String(count + 1).padStart(4, '0')}`;
    } catch (error) {
      return next(error as Error);
    }
  }
  
  // 根据销售代表的佣金率计算佣金
  if (this.salesRepId && this.totalAmount) {
    // 这里应该从User模型获取佣金率，简化处理
    this.commissionAmount = this.totalAmount * 0.05; // 默认5%
  }
  
  next();
});

// Add indexes for performance
purchaseSchema.index({ purchaseId: 1 });
purchaseSchema.index({ customerId: 1 });
purchaseSchema.index({ salesRepId: 1 });
purchaseSchema.index({ orderDate: -1 });
purchaseSchema.index({ paymentStatus: 1 });
purchaseSchema.index({ orderStatus: 1 });
purchaseSchema.index({ 'items.productId': 1 });
purchaseSchema.index({ createdAt: -1 });

// 简化文本搜索索引
purchaseSchema.index({
  purchaseId: 'text',
  'items.productName': 'text',
  'items.productCode': 'text',
});

export default mongoose.models.Purchase || mongoose.model('Purchase', purchaseSchema);