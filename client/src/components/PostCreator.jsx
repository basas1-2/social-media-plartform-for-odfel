import React, { useState } from 'react';
import { FaImage, FaVideo, FaFileAlt, FaTimes, FaQuestionCircle, FaBookOpen, FaBullhorn, FaGlobe } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { createPost } from '../services/postService';

const PostCreator = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [postType, setPostType] = useState('general');
  const [courseCode, setCourseCode] = useState('');
  const [subject, setSubject] = useState('');
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [videoPreview, setVideoPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    const previews = files.map((f) => URL.createObjectURL(f));
    setPreviewImages(previews);
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    setVideo(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const handleDocumentChange = (e) => {
    const files = Array.from(e.target.files);
    setDocuments(files);
  };

  const clearAll = () => {
    setText('');
    setPostType('general');
    setCourseCode('');
    setSubject('');
    setImages([]);
    setVideo(null);
    setDocuments([]);
    setPreviewImages([]);
    setVideoPreview('');
    setError('');
  };

  const handleSubmit = async () => {
    if (!text.trim() && images.length === 0 && !video && documents.length === 0) {
      setError('Write something or add files/documents to post');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const formData = {
        text,
        postType,
        courseCode,
        subject,
        images,
        video,
        documents,
      };
      const { data } = await createPost(formData);
      clearAll();
      if (onPostCreated) onPostCreated(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-5 border border-gray-100">
      {/* Top Header: Post Type Selector & Course Code */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-gray-100">
        <div className="flex items-center space-x-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => setPostType('general')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              postType === 'general'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FaGlobe />
            <span>General Update</span>
          </button>

          <button
            type="button"
            onClick={() => setPostType('question')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              postType === 'question'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            <FaQuestionCircle />
            <span>Ask Q&A</span>
          </button>

          <button
            type="button"
            onClick={() => setPostType('study_material')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              postType === 'study_material'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <FaBookOpen />
            <span>Study Note</span>
          </button>

          {(['lecturer', 'tutor', 'admin'].includes(user?.role) || user?.isAdmin) && (
            <button
              type="button"
              onClick={() => setPostType('announcement')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                postType === 'announcement'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
              }`}
            >
              <FaBullhorn />
              <span>Announcement</span>
            </button>
          )}
        </div>

        {/* Optional Course Code Input */}
        <div className="w-full sm:w-auto">
          <input
            type="text"
            placeholder="Course Code (e.g. CIT201)"
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
            className="w-full sm:w-36 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-xs font-bold uppercase text-primary placeholder-gray-400 outline-none focus:border-primary focus:bg-white"
          />
        </div>
      </div>

      {/* Main Text Area */}
      <div className="flex items-start space-x-3">
        <img
          src={user?.profilePicture || 'https://via.placeholder.com/40'}
          alt="profile"
          className="w-10 h-10 rounded-full object-cover border border-gray-200"
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            postType === 'question'
              ? 'What academic question do you need help with?'
              : postType === 'study_material'
              ? 'Share a summary, lecture note, or study resource...'
              : postType === 'announcement'
              ? 'Post an official course notice or deadline announcement...'
              : "Share an update with your distance learning peers..."
          }
          className="flex-1 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition resize-none"
          rows="3"
        />
      </div>

      {/* Documents Attached Preview */}
      {documents.length > 0 && (
        <div className="mt-3 space-y-1.5">
          <p className="text-xs font-semibold text-gray-500">Attached Documents:</p>
          {documents.map((doc, idx) => (
            <div key={idx} className="flex items-center justify-between bg-blue-50 text-blue-800 text-xs px-3 py-1.5 rounded-lg border border-blue-200">
              <span className="truncate font-medium flex items-center">
                <FaFileAlt className="mr-2 text-blue-600" />
                {doc.name} ({(doc.size / 1024).toFixed(0)} KB)
              </span>
              <button
                type="button"
                onClick={() => setDocuments(documents.filter((_, i) => i !== idx))}
                className="text-red-500 hover:text-red-700 ml-2"
              >
                <FaTimes />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Media Previews */}
      {previewImages.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-3">
          {previewImages.map((img, i) => (
            <div key={i} className="relative">
              <img src={img} alt="preview" className="w-full h-24 object-cover rounded-lg" />
              <button
                type="button"
                onClick={() => {
                  setImages(images.filter((_, idx) => idx !== i));
                  setPreviewImages(previewImages.filter((_, idx) => idx !== i));
                }}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md"
              >
                <FaTimes size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {videoPreview && (
        <div className="relative mt-3">
          <video src={videoPreview} className="w-full h-44 object-cover rounded-lg" controls />
          <button
            type="button"
            onClick={() => {
              setVideo(null);
              setVideoPreview('');
            }}
            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md"
          >
            <FaTimes size={12} />
          </button>
        </div>
      )}

      {error && <p className="text-red-500 text-xs font-semibold mt-2">{error}</p>}

      {/* Actions Bar */}
      <div className="flex items-center justify-between mt-3 border-t border-gray-100 pt-3">
        <div className="flex items-center space-x-1 sm:space-x-3">
          <label className="cursor-pointer flex items-center space-x-1 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 text-gray-600 text-xs font-medium transition">
            <FaImage className="text-emerald-500" />
            <span>Photo</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="hidden"
            />
          </label>

          <label className="cursor-pointer flex items-center space-x-1 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 text-gray-600 text-xs font-medium transition">
            <FaVideo className="text-red-500" />
            <span>Video</span>
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
              className="hidden"
            />
          </label>

          <label className="cursor-pointer flex items-center space-x-1 px-2.5 py-1.5 rounded-lg hover:bg-blue-50 text-blue-700 text-xs font-medium transition">
            <FaFileAlt className="text-blue-500" />
            <span>Document</span>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.rtf,.zip,.rar"
              multiple
              onChange={handleDocumentChange}
              className="hidden"
            />
          </label>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-primary text-white px-5 py-1.5 rounded-lg text-sm font-semibold hover:bg-primary-dark shadow-sm transition disabled:opacity-50"
        >
          {loading ? 'Publishing...' : 'Share Post'}
        </button>
      </div>
    </div>
  );
};

export default PostCreator;
