import mongoose from 'mongoose';

const planItemSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  product_name_snapshot: String,
  dosage_amount: Number,
  dosage_unit: String,
  frequency_value: Number,
  frequency_unit: String,
  timing_instructions: String,
  item_duration_value: Number,
  item_duration_unit: String,
  item_start_date_offset_days: { type: Number, default: 0 },
  notes: String,
}, { _id: true }); // _id is crucial for linking with purchase_logs as per description

const planSchema = new mongoose.Schema({
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // User with role 'customer'
  assigned_by_admin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // User with role 'admin' or 'system_admin'
  plan_template_id: { type: mongoose.Schema.Types.ObjectId, ref: 'PlanTemplate', sparse: true },
  name: { type: String, required: true },
  description: String,
  target_symptoms: [String],
  expected_outcome: String,
  start_date: { type: Date, required: true },
  estimated_end_date: Date,
  actual_end_date: Date,
  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'cancelled', 'pending_review'],
    default: 'active',
  },
  items: [planItemSchema],
  total_estimated_cost: {
    amount: Number,
    currency: String,
  },
  last_consumption_calculation_at: Date,
  progress_notes: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

planSchema.index({ customer_id: 1 });
planSchema.index({ assigned_by_admin_id: 1 });
planSchema.index({ plan_template_id: 1 });
planSchema.index({ start_date: 1 });
planSchema.index({ status: 1 });
planSchema.index({ target_symptoms: 1 }); // Added based on description.txt for plans
planSchema.index({ estimated_end_date: 1 }); // Added based on description.txt for plans

export default mongoose.models.Plan || mongoose.model('Plan', planSchema);
