import mongoose from 'mongoose';

const purchaseItemSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  product_name_snapshot: String,
  sku_snapshot: String,
  quantity: { type: Number, required: true, min: 1 },
  unit_price_snapshot: Number, // Price per unit at time of purchase
  total_item_price_snapshot: Number, // quantity * unit_price_snapshot
  linked_plan_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', sparse: true },
  linked_plan_item_id: { type: mongoose.Schema.Types.ObjectId, sparse: true }, // Refers to Plan.items._id
}, { _id: true });

const purchaseLogSchema = new mongoose.Schema({
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // User with role 'customer'
  logged_by_admin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', sparse: true }, // Admin who recorded
  order_reference_id: { type: String, sparse: true, index: true }, // External order ID, added index
  purchase_date: { type: Date, default: Date.now, required: true },
  total_amount: { type: Number, required: true },
  currency: { type: String, required: true }, // Consider adding a default system currency
  payment_status: {
    type: String,
    enum: ['paid', 'pending', 'refunded', 'failed'],
    default: 'paid',
  },
  notes: String,
  items: [purchaseItemSchema],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

purchaseLogSchema.index({ customer_id: 1 });
purchaseLogSchema.index({ purchase_date: 1 });
purchaseLogSchema.index({ payment_status: 1 });
// Indexes for fields within an array of subdocuments are defined on the path to the field.
purchaseLogSchema.index({ 'items.linked_plan_id': 1 });
purchaseLogSchema.index({ 'items.linked_plan_item_id': 1 });


export default mongoose.models.PurchaseLog || mongoose.model('PurchaseLog', purchaseLogSchema);
