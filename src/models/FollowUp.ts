import mongoose from 'mongoose';

const followUpDetailLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  author_role: String, // "admin" or "customer"
  log_entry: { type: String, required: true },
}, { _id: true });

const followUpAttachmentSchema = new mongoose.Schema({
  file_name: String,
  file_url: String,
  uploaded_at: { type: Date, default: Date.now },
}, { _id: false }); // _id can be false if not strictly needed per attachment

const followUpSchema = new mongoose.Schema({
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // User with role 'customer'
  conducted_by_admin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Admin who conducted
  linked_plan_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', sparse: true },
  follow_up_date: { type: Date, default: Date.now, required: true },
  communication_method: {
    type: String,
    enum: ['phone', 'email', 'in_person', 'video_call', 'chat'],
  },
  title: String,
  summary: String,
  details_log: [followUpDetailLogSchema],
  customer_feedback: {
    overall_satisfaction_rating: Number, // 1-5
    symptom_changes_reported: String,
    side_effects_reported: String,
    questions_or_concerns: String,
  },
  admin_notes_observations: String,
  action_items_next_steps: String,
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }], // where type='follow_up'
  attachments: [followUpAttachmentSchema],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

followUpSchema.index({ customer_id: 1 });
followUpSchema.index({ conducted_by_admin_id: 1 });
followUpSchema.index({ linked_plan_id: 1 });
followUpSchema.index({ follow_up_date: 1 });
followUpSchema.index({ tags: 1 });
followUpSchema.index({ communication_method: 1 }); // Added index based on description.txt
followUpSchema.index({ 'customer_feedback.overall_satisfaction_rating': 1 }); // Added index based on description.txt


export default mongoose.models.FollowUp || mongoose.model('FollowUp', followUpSchema);
