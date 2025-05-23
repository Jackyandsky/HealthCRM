import mongoose from 'mongoose';

const planTemplateItemSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  product_name_snapshot: String, // Denormalized product name
  default_dosage_amount: Number, // Using Number, Mongoose can handle NumberDecimal
  default_dosage_unit: String,
  default_frequency_value: Number,
  default_frequency_unit: String, // e.g., "per_day", "per_week"
  default_timing_instructions: String, // e.g., "with meals"
  default_item_duration_value: Number,
  default_item_duration_unit: String, // e.g., "days", "weeks"
  notes_for_admin: String,
}, { _id: true }); // allow _id for sub-documents if needed for granular updates, or set to false

const planTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  target_symptoms: [String],
  intended_audience_tags: [String],
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }, // where type='plan_template'
  default_duration_days: Number,
  items: [planTemplateItemSchema],
  created_by_admin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  is_sharable_globally: { type: Boolean, default: false },
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }], // where type='plan_template'
  version: { type: Number, default: 1 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

planTemplateSchema.index({ name: 1 });
planTemplateSchema.index({ category_id: 1 });
planTemplateSchema.index({ created_by_admin_id: 1 });
planTemplateSchema.index({ tags: 1 });
planTemplateSchema.index({ target_symptoms: 1 });
planTemplateSchema.index({ intended_audience_tags: 1 });


export default mongoose.models.PlanTemplate || mongoose.model('PlanTemplate', planTemplateSchema);
