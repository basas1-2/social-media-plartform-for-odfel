const Schedule = require('../models/Schedule');

// @desc    Create schedule / academic event deadline
// @route   POST /api/schedule
// @access  Private
const createSchedule = async (req, res, next) => {
  try {
    const { title, description, courseCode, eventType, eventDate, meetingLink } = req.body;

    if (!title || !eventDate) {
      return res.status(400).json({ message: 'Title and event date are required' });
    }

    const event = await Schedule.create({
      title,
      description: description || '',
      courseCode: courseCode ? courseCode.toUpperCase().trim() : '',
      eventType: eventType || 'deadline',
      eventDate,
      meetingLink: meetingLink || '',
      creatorId: req.user._id,
    });

    const populated = await Schedule.findById(event._id).populate('creatorId', 'fullname username profilePicture role');
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Get academic schedules / deadlines
// @route   GET /api/schedule
// @access  Private
const getSchedules = async (req, res, next) => {
  try {
    const { eventType, courseCode } = req.query;
    const query = { isDeleted: false };

    if (eventType && eventType !== 'all') {
      query.eventType = eventType;
    }
    if (courseCode) {
      query.courseCode = new RegExp(courseCode.trim(), 'i');
    }

    const events = await Schedule.find(query)
      .sort({ eventDate: 1 })
      .populate('creatorId', 'fullname username profilePicture role institution department');

    res.json(events);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete schedule event
// @route   DELETE /api/schedule/:id
// @access  Private
const deleteSchedule = async (req, res, next) => {
  try {
    const event = await Schedule.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Schedule event not found' });

    if (event.creatorId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'You can only delete your own created events' });
    }

    event.isDeleted = true;
    await event.save();

    res.json({ message: 'Schedule event deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSchedule,
  getSchedules,
  deleteSchedule,
};
