const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const fileUrl = require('../utils/fileUrl');
const mongoose = require('mongoose');

// @desc    Create post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res, next) => {
  try {
    const { text, tags, postType, courseCode, subject } = req.body;

    let images = [];
    let video = '';
    let documents = [];

    if (req.files) {
      if (req.files.images) {
        images = req.files.images.map((f) =>
          fileUrl(req, f.path.replace(/\\/g, '/'))
        );
      }
      if (req.files.video) {
        video = fileUrl(req, req.files.video[0].path.replace(/\\/g, '/'));
      }
      if (req.files.documents) {
        documents = req.files.documents.map((f) => ({
          originalName: f.originalname,
          filePath: fileUrl(req, f.path.replace(/\\/g, '/')),
          fileSize: f.size || 0,
          fileType: f.mimetype || 'document',
        }));
      }
    }

    if (!text && images.length === 0 && !video && documents.length === 0) {
      return res.status(400).json({ message: 'Post must have text, media, or educational document' });
    }

    const post = await Post.create({
      userId: req.user._id,
      text,
      postType: postType || 'general',
      courseCode: courseCode ? courseCode.toUpperCase().trim() : '',
      subject: subject || '',
      images,
      video,
      documents,
      tags: tags ? JSON.parse(tags) : [],
    });

    // Create mention notifications
    if (tags && tags.length) {
      const mentionedUsers = typeof tags === 'string' ? JSON.parse(tags) : tags;
      for (const uid of mentionedUsers) {
        if (uid !== req.user._id.toString()) {
          await Notification.create({
            receiverId: uid,
            senderId: req.user._id,
            type: 'mention',
            postId: post._id,
            text: `${req.user.fullname} mentioned you in a post`,
          });
        }
      }
    }

    const populated = await Post.findById(post._id).populate('userId', 'fullname username profilePicture role');

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Get feed posts
// @route   GET /api/posts/feed
// @access  Private
const getFeed = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { postType, courseCode } = req.query;

    const me = await require('../models/User').findById(req.user._id).select('following');
    const following = me.following;
    following.push(req.user._id);

    const query = {
      userId: { $in: following },
      isDeleted: false,
    };

    if (postType && postType !== 'all') {
      query.postType = postType;
    }
    if (courseCode) {
      query.courseCode = new RegExp(courseCode.trim(), 'i');
    }

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'fullname username profilePicture role institution department courseOfStudy');

    const total = await Post.countDocuments(query);

    res.json({ posts, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all posts (for explore / Q&A search)
// @route   GET /api/posts/all
// @access  Private
const getAllPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { postType, courseCode, search } = req.query;

    const query = { isDeleted: false };
    if (postType && postType !== 'all') {
      query.postType = postType;
    }
    if (courseCode) {
      query.courseCode = new RegExp(courseCode.trim(), 'i');
    }
    if (search) {
      const sRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ text: sRegex }, { courseCode: sRegex }, { subject: sRegex }];
    }

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'fullname username profilePicture role institution department courseOfStudy');

    const total = await Post.countDocuments(query);
    res.json({ posts, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user posts
// @route   GET /api/posts/user/:userId
// @access  Public
const getUserPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({ userId: req.params.userId, isDeleted: false })
      .sort({ createdAt: -1 })
      .populate('userId', 'fullname username profilePicture');

    res.json(posts);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Public
const getPost = async (req, res, next) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, isDeleted: false }).populate(
      'userId',
      'fullname username profilePicture'
    );
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    next(error);
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private (owner)
const updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'You can only edit your own posts' });
    }

    const { text } = req.body;
    if (text !== undefined) post.text = text;

    if (req.files) {
      if (req.files.images) {
        const newImages = req.files.images.map((f) => fileUrl(req, f.path.replace(/\\/g, '/')));
        post.images = post.images.concat(newImages);
      }
      if (req.files.video) {
        post.video = fileUrl(req, req.files.video[0].path.replace(/\\/g, '/'));
      }
    }

    await post.save();
    const populated = await Post.findById(post._id).populate('userId', 'fullname username profilePicture');
    res.json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete post (soft delete)
// @route   DELETE /api/posts/:id
// @access  Private (owner or admin)
const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'You can only delete your own posts' });
    }

    post.isDeleted = true;
    await post.save();

    // Soft-delete comments too
    await Comment.updateMany({ postId: post._id }, { isDeleted: true });

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Like/Unlike post
// @route   PUT /api/posts/:id/like
// @access  Private
const toggleLike = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const hasLiked = post.likes.includes(req.user._id);

    if (hasLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== req.user._id.toString());
      await post.save();
      res.json({ liked: false, likes: post.likes.length });
    } else {
      post.likes.push(req.user._id);
      await post.save();

      if (post.userId.toString() !== req.user._id.toString()) {
        await Notification.create({
          receiverId: post.userId,
          senderId: req.user._id,
          type: 'like',
          postId: post._id,
          text: `${req.user.fullname} liked your post`,
        });
      }

      res.json({ liked: true, likes: post.likes.length });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Share/Repost post
// @route   PUT /api/posts/:id/share
// @access  Private
const sharePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.shares.includes(req.user._id)) {
      return res.status(400).json({ message: 'You already shared this post' });
    }

    post.shares.push(req.user._id);
    await post.save();

    if (post.userId.toString() !== req.user._id.toString()) {
      await Notification.create({
        receiverId: post.userId,
        senderId: req.user._id,
        type: 'share',
        postId: post._id,
        text: `${req.user.fullname} shared your post`,
      });
    }

    res.json({ message: 'Post shared', shares: post.shares.length });
  } catch (error) {
    next(error);
  }
};

// @desc    Save/Unsave post
// @route   PUT /api/posts/:id/save
// @access  Private
const savePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const hasSaved = post.savedBy.includes(req.user._id);

    if (hasSaved) {
      post.savedBy = post.savedBy.filter((id) => id.toString() !== req.user._id.toString());
      await post.save();
      res.json({ saved: false });
    } else {
      post.savedBy.push(req.user._id);
      await post.save();
      res.json({ saved: true });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get saved posts
// @route   GET /api/posts/saved/all
// @access  Private
const getSavedPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({
      savedBy: req.user._id,
      isDeleted: false,
    })
      .sort({ updatedAt: -1 })
      .populate('userId', 'fullname username profilePicture');

    res.json(posts);
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment
// @route   POST /api/posts/:id/comments
// @access  Private
const addComment = async (req, res, next) => {
  try {
    const { comment } = req.body;
    if (!comment) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const newComment = await Comment.create({
      postId: post._id,
      userId: req.user._id,
      comment,
    });

    post.comments.push(newComment._id);
    await post.save();

    if (post.userId.toString() !== req.user._id.toString()) {
      await Notification.create({
        receiverId: post.userId,
        senderId: req.user._id,
        type: 'comment',
        postId: post._id,
        commentId: newComment._id,
        text: `${req.user.fullname} commented: ${comment.slice(0, 60)}`,
      });
    }

    const populated = await Comment.findById(newComment._id).populate(
      'userId',
      'fullname username profilePicture'
    );

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Get comments for post
// @route   GET /api/posts/:id/comments
// @access  Public
const getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ postId: req.params.id })
      .sort({ isBestAnswer: -1, createdAt: -1 })
      .populate('userId', 'fullname username profilePicture role institution department');

    res.json(comments);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark comment as best answer / verified solution
// @route   PUT /api/posts/:id/comments/:commentId/best-answer
// @access  Private (Post owner, Lecturer, or Admin)
const markBestAnswer = async (req, res, next) => {
  try {
    const { id, commentId } = req.params;
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const isPostOwner = post.userId.toString() === req.user._id.toString();
    const isEducator = ['lecturer', 'tutor', 'admin'].includes(req.user.role);

    if (!isPostOwner && !isEducator) {
      return res.status(403).json({ message: 'Only the question poster or a lecturer/tutor can mark the best answer' });
    }

    // Reset previous best answer if any
    await Comment.updateMany({ postId: id }, { isBestAnswer: false });

    const targetComment = await Comment.findById(commentId);
    if (!targetComment) return res.status(404).json({ message: 'Comment not found' });

    targetComment.isBestAnswer = true;
    await targetComment.save();

    post.isSolved = true;
    post.solvedCommentId = commentId;
    await post.save();

    if (targetComment.userId.toString() !== req.user._id.toString()) {
      await Notification.create({
        receiverId: targetComment.userId,
        senderId: req.user._id,
        type: 'comment',
        postId: id,
        commentId,
        text: `Your answer was marked as the Best Answer / Verified Solution!`,
      });
    }

    res.json({ message: 'Marked as best answer successfully', commentId });
  } catch (error) {
    next(error);
  }
};

// @desc    Upvote comment / answer
// @route   PUT /api/posts/comments/:commentId/upvote
// @access  Private
const toggleCommentUpvote = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const hasUpvoted = comment.upvotes.includes(req.user._id);

    if (hasUpvoted) {
      comment.upvotes = comment.upvotes.filter((uid) => uid.toString() !== req.user._id.toString());
      await comment.save();
      res.json({ upvoted: false, count: comment.upvotes.length });
    } else {
      comment.upvotes.push(req.user._id);
      await comment.save();
      res.json({ upvoted: true, count: comment.upvotes.length });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
