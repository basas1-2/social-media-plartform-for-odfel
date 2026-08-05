const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const fileUrl = require('../utils/fileUrl');

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res, next) => {
  try {
    const { conversationId, text } = req.body;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!conversation.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not a member of this conversation' });
    }

    let image = '';
    let video = '';
    let document = '';

    if (req.files) {
      if (req.files.image) {
        image = fileUrl(req, req.files.image[0].path.replace(/\\/g, '/'));
      }
      if (req.files.video) {
        video = fileUrl(req, req.files.video[0].path.replace(/\\/g, '/'));
      }
      if (req.files.document) {
        document = fileUrl(req, req.files.document[0].path.replace(/\\/g, '/'));
      }
    }

    if (!text && !image && !video && !document) {
      return res.status(400).json({ message: 'Message cannot be empty' });
    }

    const message = await Message.create({
      conversationId,
      senderId: req.user._id,
      text: text || '',
      image,
      video,
      document,
    });

    // Update conversation last message
    conversation.lastMessage = text || (image ? '📷 Photo' : video ? '🎬 Video' : document ? '📄 Document' : '');
    conversation.lastMessageSender = req.user._id;
    conversation.lastMessageAt = Date.now();
    await conversation.save();

    // Notify the other member
    const receiverId = conversation.members.find((m) => m.toString() !== req.user._id.toString());
    if (receiverId) {
      await Notification.create({
        receiverId,
        senderId: req.user._id,
        type: 'message',
        conversationId: conversation._id,
        text: `${req.user.fullname} sent you a message`,
      });
    }

    const populated = await Message.findById(message._id)
      .populate('senderId', 'fullname username profilePicture');

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark message as seen
// @route   PUT /api/messages/:id/seen
// @access  Private
const markAsSeen = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (!message.seenBy.includes(req.user._id)) {
      message.seenBy.push(req.user._id);
    }
    message.seen = true;
    await message.save();

    res.json({ message: 'Marked as seen', seen: true });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete message (for current user)
// @route   DELETE /api/messages/:id
// @access  Private
const deleteMessage = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.senderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Can only delete your own messages' });
    }

    if (!message.deletedFor.includes(req.user._id)) {
      message.deletedFor.push(req.user._id);
    }
    await message.save();

    res.json({ message: 'Message deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { sendMessage, markAsSeen, deleteMessage };
