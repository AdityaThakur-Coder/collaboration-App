import mongoose from 'mongoose';

const inviteSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  role: {
    type: String,
    enum: ['admin', 'member', 'viewer'],
    default: 'member'
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'expired'],
    default: 'pending'
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  },
  message: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Add indexes
inviteSchema.index({ email: 1, project: 1 });
inviteSchema.index({ token: 1 });
inviteSchema.index({ expiresAt: 1 });

export default mongoose.model('Invite', inviteSchema);