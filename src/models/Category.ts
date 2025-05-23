import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true, required: true }, // URL-friendly version of the name
  description: String,
  parent_category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', sparse: true },
  ancestor_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }], // For easier tree traversal
  type: { // Type of items this category is for
    type: String,
    enum: ['product', 'plan_template'], // As per description.txt
    default: 'product',
    required: true,
  },
  display_order: Number,
  icon_url: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

categorySchema.index({ slug: 1 });
categorySchema.index({ parent_category_id: 1 });
categorySchema.index({ ancestor_ids: 1 });
categorySchema.index({ type: 1 });
categorySchema.index({ name: 1, parent_category_id: 1, type: 1 }, { unique: true, sparse: true }); // Ensures name is unique per type within a parent

// Pre-save hook to generate slug if not provided
categorySchema.pre('save', function(next) {
  if (this.isModified('name') && this.name && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  }
  next();
});

export default mongoose.models.Category || mongoose.model('Category', categorySchema);
