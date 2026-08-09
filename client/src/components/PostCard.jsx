 import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaComment, FaShare, FaBookmark, FaTrash, FaEdit, FaFlag } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { toggleLike, deletePost, getComments, addComment, savePost, sharePost } from '../services/postService';
import { useSocket } from '../context/SocketContext';

const PostCard = ({ post, onDelete, onUpdate }) => {
  const { user } = useAuth();
  const { onlineUsers, emitNotify } = useSocket();
  const [liked, setLiked] = useState(post?.likes?.includes(user?._id) || false);
  const [likeCount, setLikeCount] = useState(post?.likes?.length || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [saved, setSaved] = useState(post?.savedBy?.includes(user?._id) || false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(post?.text || '');
  const [showActions, setShowActions] = useState(false);

  const isOwner = post?.userId?._id === user?._id;
  const isOnline = onlineUsers.includes(post?.userId?._id);

  const handleLike = async () => {
    try {
      const { data } = await toggleLike(post._id);
      setLiked(data.liked);
      setLikeCount(data.likes);
      if (data.liked && post.userId._id !== user._id) {
        emitNotify({ receiverId: post.userId._id, type: 'like', postId: post._id });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    try {
      const { data } = await addComment(post._id, commentText);
      setComments((prev) => [data, ...prev]);
      setCommentText('');
      if (post.userId._id !== user._id) {
        emitNotify({ receiverId: post.userId._id, type: 'comment', postId: post._id });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const loadComments = async () => {
    try {
      const { data } = await getComments(post._id);
      setComments(data);
    } catch (error) {
      console.error(error);
    }
  };

  const toggleComments = () => {
    setShowComments(!showComments);
    if (!showComments && comments.length === 0) {
      loadComments();
    }
  };

  const handleSave = async () => {
    try {
      const { data } = await savePost(post._id);
      setSaved(data.saved);
    } catch (error) {
      console.error(error);
    }
  };

  const handleShare = async () => {
    try {
      await sharePost(post._id);
      alert('Post shared!');
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Delete this post?')) {
      try {
        await deletePost(post._id);
        if (onDelete) onDelete(post._id);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow-md mb-4">
      {/* Header */}
      <div className="p-4 flex items-center justify-between relative">
        <div className="flex items-center space-x-3">
          <Link to={`/profile/${post?.userId?.username}`} className="relative">
            <img
              src={post?.userId?.profilePicture || 'https://via.placeholder.com/40'}
              alt={post?.userId?.fullname}
              className="w-10 h-10 rounded-full object-cover"
            />
            {isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
            )}
          </Link>
          <div>
            <Link to={`/profile/${post?.userId?.username}`} className="font-semibold hover:underline">
              {post?.userId?.fullname}
            </Link>
            <p className="text-xs text-gray-500">@{post?.userId?.username} · {timeAgo(post?.createdAt)}</p>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="text-gray-500 hover:text-gray-700 text-xl px-2"
          >
            ...
          </button>
          {showActions && (
            <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg py-1 z-10">
              {isOwner && (
                <>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                  >
                    <FaEdit className="inline mr-2" /> Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600"
                  >
                    <FaTrash className="inline mr-2" /> Delete
                  </button>
                </>
              )}
              <button
                onClick={() => alert('Report submitted')}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
              >
                <FaFlag className="inline mr-2" /> Report
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-2">
        {isEditing ? (
          <div>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full border rounded-lg p-2 mb-2"
              rows="3"
            />
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  if (onUpdate) onUpdate(post._id, { text: editText });
                  setIsEditing(false);
                }}
                className="bg-primary text-white px-4 py-1 rounded-lg text-sm"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="bg-gray-200 px-4 py-1 rounded-lg text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="whitespace-pre-wrap">{post?.text}</p>
        )}
      </div>

{/* Images */}
      {post?.images && post.images.length > 0 && (
        <div className={`post-images-grid grid ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-1 px-4`}>
          {post.images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`post-${i}`}
              className="w-full max-h-96 object-cover rounded-lg"
            />
          ))}
        </div>
      )}

      {/* Video */}
      {post?.video && (
        <div className="px-4">
          <video src={post.video} controls className="w-full max-h-96 rounded-lg" />
        </div>
      )}

      {/* Counts */}
      <div className="px-4 py-2 flex justify-between text-sm text-gray-500">
        <span>{likeCount} likes</span>
        <span>{post?.comments?.length || 0} comments</span>
      </div>

      {/* Actions */}
      <div className="border-t border-gray-200 px-2 py-1 flex justify-around">
        <button
          onClick={handleLike}
          className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm transition ${
            liked ? 'text-red-500' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <FaHeart size={18} /> <span>Like</span>
        </button>
        <button
          onClick={toggleComments}
          className="flex items-center space-x-1 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
        >
          <FaComment size={18} /> <span>Comment</span>
        </button>
        <button
          onClick={handleShare}
          className="flex items-center space-x-1 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
        >
          <FaShare size={18} /> <span>Share</span>
        </button>
        <button
          onClick={handleSave}
          className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm transition ${
            saved ? 'text-primary' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <FaBookmark size={18} /> <span>Save</span>
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="border-t border-gray-200 p-4">
          <div className="flex space-x-2 mb-3">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleComment()}
              placeholder="Write a comment..."
              className="flex-1 border rounded-full px-4 py-2 text-sm"
            />
            <button
              onClick={handleComment}
              className="bg-primary text-white px-4 py-2 rounded-full text-sm"
            >
              Post
            </button>
          </div>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {comments.map((comment) => (
              <div key={comment._id} className="flex space-x-2">
                <img
                  src={comment.userId?.profilePicture || 'https://via.placeholder.com/32'}
                  alt={comment.userId?.fullname}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="bg-gray-100 rounded-lg px-3 py-2 flex-1">
                  <p className="text-sm font-semibold">{comment.userId?.fullname}</p>
                  <p className="text-sm">{comment.comment}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
