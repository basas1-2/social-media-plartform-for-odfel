import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaHeart,
  FaComment,
  FaShare,
  FaBookmark,
  FaTrash,
  FaEdit,
  FaFlag,
  FaFileDownload,
  FaCheckCircle,
  FaThumbsUp,
  FaQuestionCircle,
  FaBookOpen,
  FaBullhorn,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import {
  toggleLike,
  deletePost,
  getComments,
  addComment,
  savePost,
  sharePost,
  markBestAnswer,
  toggleCommentUpvote,
} from '../services/postService';
import { useSocket } from '../context/SocketContext';
import AcademicBadge from './AcademicBadge';

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
  const [isSolved, setIsSolved] = useState(post?.isSolved || false);
  const [solvedCommentId, setSolvedCommentId] = useState(post?.solvedCommentId || null);

  const isOwner = post?.userId?._id === user?._id;
  const isOnline = onlineUsers.includes(post?.userId?._id);
  const canMarkBestAnswer = isOwner || ['lecturer', 'tutor', 'admin'].includes(user?.role);

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
    if (!showComments) {
      loadComments();
    }
  };

  const handleMarkBestAnswer = async (commentId) => {
    try {
      await markBestAnswer(post._id, commentId);
      setIsSolved(true);
      setSolvedCommentId(commentId);
      loadComments();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to mark best answer');
    }
  };

  const handleUpvoteComment = async (commentId) => {
    try {
      const { data } = await toggleCommentUpvote(commentId);
      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId
            ? {
                ...c,
                upvotes: data.upvoted
                  ? [...(c.upvotes || []), user._id]
                  : (c.upvotes || []).filter((uid) => uid !== user._id),
              }
            : c
        )
      );
    } catch (error) {
      console.error(error);
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
      alert('Post shared on your feed!');
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this academic post?')) {
      try {
        await deletePost(post._id);
        if (onDelete) onDelete(post._id);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const timeAgo = (date) => {
    if (!date) return '';
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

  const renderPostTypeTag = () => {
    switch (post?.postType) {
      case 'question':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <FaQuestionCircle className="mr-1" />
            {isSolved ? 'Q&A (Solved)' : 'Q&A Question'}
          </span>
        );
      case 'study_material':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <FaBookOpen className="mr-1" />
            Study Material
          </span>
        );
      case 'announcement':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            <FaBullhorn className="mr-1" />
            Announcement
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md mb-4 border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center justify-between relative border-b border-gray-50">
        <div className="flex items-center space-x-3">
          <Link to={`/profile/${post?.userId?.username}`} className="relative">
            <img
              src={post?.userId?.profilePicture || 'https://via.placeholder.com/40'}
              alt={post?.userId?.fullname}
              className="w-11 h-11 rounded-full object-cover border border-gray-200"
            />
            {isOnline && (
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></span>
            )}
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <Link to={`/profile/${post?.userId?.username}`} className="font-bold text-gray-900 hover:text-primary transition">
                {post?.userId?.fullname}
              </Link>
              <AcademicBadge role={post?.userId?.role} />
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-500 mt-0.5">
              <span>@{post?.userId?.username}</span>
              <span>·</span>
              <span>{timeAgo(post?.createdAt)}</span>
              {post?.courseCode && (
                <>
                  <span>·</span>
                  <span className="bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded font-bold uppercase border border-blue-200">
                    {post.courseCode}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {renderPostTypeTag()}
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="text-gray-400 hover:text-gray-700 text-lg px-2 py-1 rounded-lg hover:bg-gray-100"
            >
              •••
            </button>
            {showActions && (
              <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-100 rounded-lg shadow-xl py-1 z-10">
                {isOwner && (
                  <>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-xs font-medium flex items-center text-gray-700"
                    >
                      <FaEdit className="mr-2 text-gray-400" /> Edit Post
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full text-left px-4 py-2 hover:bg-red-50 text-xs font-medium flex items-center text-red-600"
                    >
                      <FaTrash className="mr-2" /> Delete Post
                    </button>
                  </>
                )}
                <button
                  onClick={() => alert('Report submitted to course moderator.')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-xs font-medium flex items-center text-gray-700"
                >
                  <FaFlag className="mr-2 text-gray-400" /> Report Content
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-3">
        {isEditing ? (
          <div>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:border-primary outline-none"
              rows="3"
            />
            <div className="flex space-x-2 mt-2">
              <button
                onClick={() => {
                  if (onUpdate) onUpdate(post._id, { text: editText });
                  setIsEditing(false);
                }}
                className="bg-primary text-white px-4 py-1.5 rounded-lg text-xs font-semibold"
              >
                Save Changes
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="bg-gray-200 text-gray-700 px-4 py-1.5 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="whitespace-pre-wrap text-gray-800 text-sm leading-relaxed">{post?.text}</p>
        )}
      </div>

      {/* Document Attachments */}
      {post?.documents && post.documents.length > 0 && (
        <div className="px-4 pb-3 space-y-2">
          {post.documents.map((doc, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-xl bg-blue-50/70 border border-blue-100 hover:bg-blue-100/80 transition"
            >
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                  {doc.originalName.split('.').pop() || 'DOC'}
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-gray-900 truncate">{doc.originalName}</p>
                  <p className="text-[10px] text-gray-500">{(doc.fileSize / 1024).toFixed(0)} KB · Document File</p>
                </div>
              </div>
              <a
                href={doc.filePath}
                target="_blank"
                rel="noreferrer"
                download
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition flex-shrink-0"
              >
                <FaFileDownload />
                <span>Download</span>
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Image Gallery */}
      {post?.images && post.images.length > 0 && (
        <div className={`grid ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-1 px-4 pb-3`}>
          {post.images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`post-${i}`}
              className="w-full max-h-96 object-cover rounded-xl"
            />
          ))}
        </div>
      )}

      {/* Video Attachment */}
      {post?.video && (
        <div className="px-4 pb-3">
          <video src={post.video} controls className="w-full max-h-96 rounded-xl object-cover" />
        </div>
      )}

      {/* Statistics Row */}
      <div className="px-4 py-2 flex items-center justify-between text-xs text-gray-500 border-t border-gray-50">
        <span>{likeCount} Helpful Votes / Likes</span>
        <span>{post?.comments?.length || 0} Comments & Answers</span>
      </div>

      {/* Action Buttons */}
      <div className="border-t border-gray-100 px-2 py-1 flex justify-around bg-gray-50/50">
        <button
          onClick={handleLike}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
            liked ? 'text-red-500 font-bold' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <FaHeart size={16} /> <span>{liked ? 'Liked' : 'Like'}</span>
        </button>
        <button
          onClick={toggleComments}
          className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition"
        >
          <FaComment size={16} /> <span>Answers & Comments</span>
        </button>
        <button
          onClick={handleShare}
          className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition"
        >
          <FaShare size={16} /> <span>Repost</span>
        </button>
        <button
          onClick={handleSave}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
            saved ? 'text-primary font-bold' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <FaBookmark size={16} /> <span>{saved ? 'Saved' : 'Save'}</span>
        </button>
      </div>

      {/* Comments & Answers Section */}
      {showComments && (
        <div className="border-t border-gray-100 p-4 bg-gray-50/30">
          <div className="flex space-x-2 mb-3">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleComment()}
              placeholder={post?.postType === 'question' ? 'Write your answer or explanation...' : 'Write a comment...'}
              className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-xs outline-none focus:border-primary focus:bg-white"
            />
            <button
              onClick={handleComment}
              className="bg-primary text-white px-5 py-2 rounded-full text-xs font-semibold hover:bg-primary-dark shadow-sm transition"
            >
              Publish
            </button>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {comments.map((comment) => {
              const isBest = comment.isBestAnswer || comment._id === solvedCommentId;
              const hasUpvoted = comment.upvotes?.includes(user?._id);

              return (
                <div
                  key={comment._id}
                  className={`p-3 rounded-xl border transition ${
                    isBest
                      ? 'bg-emerald-50/80 border-emerald-300 shadow-sm'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  {isBest && (
                    <div className="flex items-center text-xs font-bold text-emerald-800 mb-2 bg-emerald-100 px-2.5 py-1 rounded-md w-fit border border-emerald-300">
                      <FaCheckCircle className="mr-1.5 text-emerald-600" />
                      Verified Solution / Best Answer
                    </div>
                  )}

                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <img
                        src={comment.userId?.profilePicture || 'https://via.placeholder.com/32'}
                        alt={comment.userId?.fullname}
                        className="w-7 h-7 rounded-full object-cover border border-gray-200"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-gray-900">{comment.userId?.fullname}</span>
                          <AcademicBadge role={comment.userId?.role} />
                        </div>
                        <p className="text-[10px] text-gray-400">@{comment.userId?.username}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleUpvoteComment(comment._id)}
                        className={`flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] border transition ${
                          hasUpvoted
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <FaThumbsUp size={10} />
                        <span>{comment.upvotes?.length || 0}</span>
                      </button>

                      {post?.postType === 'question' && canMarkBestAnswer && !isBest && (
                        <button
                          onClick={() => handleMarkBestAnswer(comment._id)}
                          className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded font-bold hover:bg-emerald-700 shadow-xs"
                        >
                          Mark Best Answer
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-gray-800 mt-2 pl-9 whitespace-pre-wrap">{comment.comment}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
