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
  
  // Customer information
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  customerName: {
    type: String,
    required: true,
  },
  customerEmail: String,
  customerPhone: String,
  
  // Sales representative
  salesRepId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  salesRepName: {
    type: String,
    required: true,
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
  
  // Commission tracking
  commissionRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 1, // Percentage as decimal
  },
  commissionAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  commissionPaid: {
    type: Boolean,
    default: false,
  },
  commissionPaidDate: Date,
  
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
  
  // Shipping address
  shippingAddress: {
    name: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'China',
    },
    phone: String,
  },
  
  // Additional information
  notes: String,
  internalNotes: String, // For staff use only
  source: {
    type: String,
    enum: ['online', 'phone', 'in_person', 'referral', 'event'],
    default: 'in_person',
  },
  
  // Return/refund information
  returnRequested: {
    type: Boolean,
    default: false,
  },
  returnDate: Date,
  returnReason: String,
  refundAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  refundDate: Date,
  
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
  
  // Calculate commission amount
  if (this.commissionRate && this.totalAmount) {
    this.commissionAmount = this.totalAmount * this.commissionRate;
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

// Add text index for search
purchaseSchema.index({
  purchaseId: 'text',
  customerName: 'text',
  customerEmail: 'text',
  'items.productName': 'text',
  'items.productCode': 'text',
});

export default mongoose.models.Purchase || mongoose.model('Purchase', purchaseSchema);