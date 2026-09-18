const express = require('express');
const router = express.Router();
const {
  uploadResource,
  getResources,
  incrementDownload,
  toggleUpvoteResource,
} = require('../controllers/resourceController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.post('/', protect, upload.single('file'), uploadResource);
router.get('/', protect, getResources);
router.put('/:id/download', protect, incrementDownload);
router.put('/:id/upvote', protect, toggleUpvoteResource);

module.exports = router;
