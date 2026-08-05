const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Create or get conversation between two users
// @route   POST /api/conversations
// @access  Private
const createConversation = async (req, res, next) => {
  try {
    const { receiverId } = req.body;

    if (!receiverId) {
      return res.status(400).json({ message: 'Receiver ID required' });
    }

    if (receiverId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot message yourself' });
    }

    // Check existing conversation
    const existing = await Conversation.findOne({
      members: { $all: [req.user._id, receiverId], $size: 2 },
    }).populate('members', 'fullname username profilePicture isOnline lastSeen');

    if (existing) {
      return res.json(existing);
    }

    const conversation = await Conversation.create({
      members: [req.user._id, receiverId],
    });

    const populated = await Conversation.findById(conversation._id).populate(
      'members',
      'fullname username profilePicture isOnline lastSeen'
    );

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user conversations
// @route   GET /api/conversations
// @access  Private
const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      members: { $in: [req.user._id] },
    })
      .populate('members', 'fullname username profilePicture isOnline lastSeen')
      .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (error) {
    next(error);
  }
};

// @desc    Get messages in a conversation
// @route   GET /api/conversations/:id/messages
// @access  Private
const getMessages = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!conversation.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not a member of this conversation' });
    }

    const messages = await Message.find({
      conversationId: req.params.id,
      deletedFor: { $ne: req.user._id },
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    next(error);
  }
};

module.exports = { createConversation, getConversations, getMessages };
