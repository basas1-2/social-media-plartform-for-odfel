const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      default: '',
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    courseCode: {
      type: String,
      default: '',
      trim: true,
      uppercase: true,
    },
    eventType: {
      type: String,
      enum: ['deadline', 'virtual_class', 'study_session', 'exam_prep', 'general'],
      default: 'deadline',
    },
    eventDate: {
      type: Date,
      required: [true, 'Event date and time is required'],
    },
    meetingLink: {
      type: String,
      default: '',
      trim: true,
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

ScheduleSchema.index({ eventDate: 1, courseCode: 1 });

module.exports = mongoose.model('Schedule', ScheduleSchema);
