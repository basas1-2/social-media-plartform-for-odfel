const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Resource title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      default: '',
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    courseCode: {
      type: String,
      required: [true, 'Course code is required'],
      trim: true,
      uppercase: true,
    },
    subject: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      enum: ['Lecture Note', 'Past Question', 'Syllabus', 'Assignment Guide', 'Textbook/Ebook', 'Other'],
      default: 'Lecture Note',
    },
    filePath: {
      type: String,
      required: [true, 'Resource file is required'],
    },
    originalName: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    fileType: {
      type: String,
      default: 'document',
    },
    uploaderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    downloadsCount: {
      type: Number,
      default: 0,
    },
    upvotes: [
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

ResourceSchema.index({ courseCode: 1, category: 1, title: 'text' });

module.exports = mongoose.model('Resource', ResourceSchema);
