const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateProfile,
  toggleFollow,
  searchUsers,
  getSuggestions,
  getFriends,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { uploadAvatar, uploadCover } = require('../middleware/upload');

router.get('/search', protect, searchUsers);
router.get('/suggestions', protect, getSuggestions);
router.get('/:username', getUserProfile);
router.get('/:id/friends', protect, getFriends);
router.put('/:id/follow', protect, toggleFollow);
router.put(
  '/me',
  protect,
  uploadAvatar.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'coverPhoto', maxCount: 1 },
  ]),
  updateProfile
);

module.exports = router;
