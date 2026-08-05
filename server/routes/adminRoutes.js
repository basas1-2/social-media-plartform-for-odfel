const express = require('express');
const router = express.Router();
const {
  getStats,
  getAllUsers,
  toggleSuspend,
  deleteUser,
  getAdminPosts,
  deleteAdminPost,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

router.use(protect, admin);

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.get('/posts', getAdminPosts);
router.put('/users/:id/suspend', toggleSuspend);
router.delete('/users/:id', deleteUser);
router.delete('/posts/:id', deleteAdminPost);

module.exports = router;
