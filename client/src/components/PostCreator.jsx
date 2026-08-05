import React, { useState } from 'react';
import { FaImage, FaVideo, FaTimes } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { createPost } from '../services/postService';

const PostCreator = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);
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

  const clearAll = () => {
    setText('');
    setImages([]);
    setVideo(null);
    setPreviewImages([]);
    setVideoPreview('');
    setError('');
  };

  const handleSubmit = async () => {
    if (!text.trim() && images.length === 0 && !video) {
      setError('Write something or add media');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const formData = {
        text,
        images,
        video,
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
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-center space-x-3">
        <img
          src={user?.profilePicture || 'https://via.placeholder.com/40'}
          alt="profile"
          className="w-10 h-10 rounded-full object-cover"
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's on your mind?"
          className="flex-1 border rounded-lg px-4 py-2 outline-none focus:border-primary"
          rows="2"
        />
      </div>

      {/* Media previews */}
      {previewImages.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-3">
          {previewImages.map((img, i) => (
            <div key={i} className="relative">
              <img src={img} alt="preview" className="w-full h-24 object-cover rounded-lg" />
              <button
                onClick={() => {
                  setImages(images.filter((_, idx) => idx !== i));
                  setPreviewImages(previewImages.filter((_, idx) => idx !== i));
                }}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
              >
                <FaTimes size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {videoPreview && (
        <div className="relative mt-3">
          <video src={videoPreview} className="w-full h-48 object-cover rounded-lg" controls />
          <button
            onClick={() => {
              setVideo(null);
              setVideoPreview('');
            }}
            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
          >
            <FaTimes size={12} />
          </button>
        </div>
      )}

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      {/* Actions */}
      <div className="flex items-center justify-between mt-3 border-t pt-3">
        <div className="flex space-x-2">
          <label className="cursor-pointer flex items-center space-x-1 px-3 py-1 rounded-lg hover:bg-gray-100 text-gray-600">
            <FaImage className="text-green-500" />
            <span className="text-sm">Photo</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
          <label className="cursor-pointer flex items-center space-x-1 px-3 py-1 rounded-lg hover:bg-gray-100 text-gray-600">
            <FaVideo className="text-red-500" />
            <span className="text-sm">Video</span>
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
              className="hidden"
            />
          </label>
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-dark disabled:opacity-50"
        >
          {loading ? 'Posting...' : 'Post'}
        </button>
      </div>
    </div>
  );
};

export default PostCreator;
