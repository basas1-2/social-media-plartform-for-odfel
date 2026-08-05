const express = require('express');
const router = express.Router();
const {
  sendMessage,
  markAsSeen,
  deleteMessage,
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.post('/', protect, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 },
  { name: 'document', maxCount: 1 },
]), sendMessage);

router.put('/:id/seen', protect, markAsSeen);
router.delete('/:id', protect, deleteMessage);

module.exports = router;
