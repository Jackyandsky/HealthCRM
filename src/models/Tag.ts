import mongoose from 'mongoose';

const tagSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { // Type of entity this tag applies to
    type: String,
    enum: ['user', 'product', 'plan_template', 'follow_up', 'general'], // As per description.txt
    required: true,
  },
  created_by_admin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

tagSchema.index({ name: 1, type: 1 }, { unique: true }); // Ensures name is unique per type

export default mongoose.models.Tag || mongoose.model('Tag', tagSchema);
