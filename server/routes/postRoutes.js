const express = require('express');
const router = express.Router();
const {
  createPost,
  getFeed,
  getAllPosts,
  getUserPosts,
  getPost,
  updatePost,
  deletePost,
  toggleLike,
  sharePost,
  savePost,
  getSavedPosts,
  addComment,
  getComments,
  markBestAnswer,
  toggleCommentUpvote,
} = require('../controllers/postController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.post('/', protect, upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'video', maxCount: 1 },
  { name: 'documents', maxCount: 5 },
]), createPost);

router.get('/feed', protect, getFeed);
router.get('/all', protect, getAllPosts);
router.get('/saved/all', protect, getSavedPosts);
router.get('/user/:userId', getUserPosts);
router.get('/:id', getPost);

router.put('/:id', protect, upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'video', maxCount: 1 },
  { name: 'documents', maxCount: 5 },
]), updatePost);

router.delete('/:id', protect, deletePost);
router.put('/:id/like', protect, toggleLike);
router.put('/:id/share', protect, sharePost);
router.put('/:id/save', protect, savePost);

router.post('/:id/comments', protect, addComment);
router.get('/:id/comments', getComments);
router.put('/:id/comments/:commentId/best-answer', protect, markBestAnswer);
router.put('/comments/:commentId/upvote', protect, toggleCommentUpvote);

module.exports = router;
