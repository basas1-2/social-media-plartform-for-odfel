const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      maxlength: [5000, 'Post text cannot exceed 5000 characters'],
      default: '',
    },
    postType: {
      type: String,
      enum: ['general', 'question', 'study_material', 'announcement'],
      default: 'general',
    },
    courseCode: {
      type: String,
      default: '',
      trim: true,
      uppercase: true,
    },
    subject: {
      type: String,
      default: '',
      trim: true,
    },
    images: [
      {
        type: String,
      },
    ],
    video: {
      type: String,
      default: '',
    },
    documents: [
      {
        originalName: { type: String, required: true },
        filePath: { type: String, required: true },
        fileSize: { type: Number, default: 0 },
        fileType: { type: String, default: 'document' },
      },
    ],
    isSolved: {
      type: Boolean,
      default: false,
    },
    solvedCommentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
    shares: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    savedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

PostSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Post', PostSchema);
