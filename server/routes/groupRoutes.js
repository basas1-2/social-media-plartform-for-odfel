const express = require('express');
const router = express.Router();
const {
  createGroup,
  getGroups,
  getGroupDetail,
  toggleJoinGroup,
} = require('../controllers/groupController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.post('/', protect, upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'coverPhoto', maxCount: 1 },
]), createGroup);

router.get('/', protect, getGroups);
router.get('/:id', protect, getGroupDetail);
router.put('/:id/join', protect, toggleJoinGroup);

module.exports = router;
