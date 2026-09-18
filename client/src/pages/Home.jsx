import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PostCreator from '../components/PostCreator';
import PostCard from '../components/PostCard';
import AcademicBadge from '../components/AcademicBadge';
import { getAllPosts } from '../services/postService';
import { getSuggestions } from '../services/userService';
import { FaGlobe, FaQuestionCircle, FaBookOpen, FaBullhorn, FaSearch, FaUsers, FaBook, FaCalendarAlt } from 'react-icons/fa';

const Home = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [postTypeFilter, setPostTypeFilter] = useState('all');
  const [courseCodeFilter] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const loadSuggestions = useCallback(async () => {
    try {
      const { data } = await getSuggestions();
      setSuggestions(data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const loadFeed = useCallback(async (pageNum = 1, type = postTypeFilter, code = courseCodeFilter, search = searchInput) => {
    try {
      setLoading(true);
      const { data } = await getAllPosts(pageNum, type, code, search);
      if (pageNum === 1) {
        setPosts(data.posts);
      } else {
        setPosts((prev) => [...prev, ...data.posts]);
      }
      setHasMore(pageNum < data.pages);
      setPage(pageNum);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [postTypeFilter, courseCodeFilter, searchInput]);

  useEffect(() => {
    loadFeed(1, postTypeFilter, courseCodeFilter, searchInput);
    loadSuggestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postTypeFilter, courseCodeFilter, loadSuggestions]);

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handleDelete = (postId) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadFeed(1, postTypeFilter, courseCodeFilter, searchInput);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex gap-6">
        {/* Main Feed Column */}
        <div className="flex-1 max-w-2xl mx-auto lg:mx-0">
          {/* Post Creator Widget */}
          <PostCreator onPostCreated={handlePostCreated} />

          {/* Academic Feed Filter Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 mb-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2 mb-2">
              <div className="flex items-center space-x-1 overflow-x-auto text-xs font-bold">
                <button
                  onClick={() => setPostTypeFilter('all')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition ${
                    postTypeFilter === 'all'
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FaGlobe />
                  <span>All Discussions</span>
                </button>

                <button
                  onClick={() => setPostTypeFilter('question')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition ${
                    postTypeFilter === 'question'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FaQuestionCircle />
                  <span>Q&A Forum</span>
                </button>

                <button
                  onClick={() => setPostTypeFilter('study_material')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition ${
                    postTypeFilter === 'study_material'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FaBookOpen />
                  <span>Study Notes</span>
                </button>

                <button
                  onClick={() => setPostTypeFilter('announcement')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition ${
                    postTypeFilter === 'announcement'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FaBullhorn />
                  <span>Notices</span>
                </button>
              </div>
            </div>

            {/* Course Filter & Search Form */}
            <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                <input
                  type="text"
                  placeholder="Search course code or topics (e.g. CIT201)..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-xs outline-none focus:border-primary focus:bg-white"
                />
              </div>
              <button
                type="submit"
                className="bg-gray-800 text-white text-xs font-semibold px-4 py-1.5 rounded-lg hover:bg-black transition"
              >
                Filter
              </button>
            </form>
          </div>

          {/* Posts Feed */}
          {loading && page === 1 ? (
            <div className="text-center py-12 text-gray-500 font-medium">Loading educational discussions...</div>
          ) : (
            <>
              {posts.map((post) => (
                <PostCard key={post._id} post={post} onDelete={handleDelete} />
              ))}

              {hasMore && (
                <button
                  onClick={() => loadFeed(page + 1)}
                  className="w-full bg-white py-3 rounded-xl shadow-sm border border-gray-100 text-primary font-bold text-sm hover:bg-blue-50 transition mb-6"
                >
                  Load More Discussions
                </button>
              )}

              {posts.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 text-center py-12 px-4 text-gray-500">
                  <p className="text-lg font-bold text-gray-800">No educational posts found</p>
                  <p className="text-xs mt-1">Be the first to post a study note, course question, or general update!</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Sidebar - Academic Quick Links & Suggestions */}
        <div className="hidden lg:block w-72 flex-shrink-0">
          <div className="sticky top-20 space-y-4">
            {/* User Profile Summary Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <Link to={`/profile/${user?.username}`} className="flex items-center space-x-3">
                <img
                  src={user?.profilePicture || 'https://via.placeholder.com/44'}
                  alt="profile"
                  className="w-11 h-11 rounded-full object-cover border border-gray-200"
                />
                <div>
                  <p className="font-bold text-gray-900 text-sm">{user?.fullname}</p>
                  <p className="text-xs text-gray-500">@{user?.username}</p>
                  <div className="mt-1">
                    <AcademicBadge role={user?.role} />
                  </div>
                </div>
              </Link>
              {user?.courseOfStudy && (
                <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-600">
                  <p className="font-medium text-gray-800">📚 {user?.courseOfStudy}</p>
                  <p className="text-gray-500">{user?.academicLevel} · {user?.institution || 'ODFEL Network'}</p>
                </div>
              )}
            </div>

            {/* Quick Academic Navigation Box */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500 mb-3">ODFEL Hubs</h3>
              <div className="space-y-2 text-xs font-semibold">
                <Link
                  to="/groups"
                  className="flex items-center space-x-2.5 p-2 rounded-lg bg-blue-50 text-blue-800 hover:bg-blue-100 transition"
                >
                  <FaUsers className="text-blue-600" />
                  <span>Course Study Groups</span>
                </Link>
                <Link
                  to="/resources"
                  className="flex items-center space-x-2.5 p-2 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition"
                >
                  <FaBook className="text-emerald-600" />
                  <span>Digital Study Library</span>
                </Link>
                <Link
                  to="/schedule"
                  className="flex items-center space-x-2.5 p-2 rounded-lg bg-purple-50 text-purple-800 hover:bg-purple-100 transition"
                >
                  <FaCalendarAlt className="text-purple-600" />
                  <span>Academic Deadlines</span>
                </Link>
              </div>
            </div>

            {/* People You May Know */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500 mb-3">Distance Learning Peers</h3>
              <div className="space-y-3">
                {suggestions.map((s) => (
                  <Link
                    key={s._id}
                    to={`/profile/${s.username}`}
                    className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg transition"
                  >
                    <div className="flex items-center space-x-2.5 overflow-hidden">
                      <img
                        src={s.profilePicture || 'https://via.placeholder.com/32'}
                        alt={s.fullname}
                        className="w-8 h-8 rounded-full object-cover border border-gray-200"
                      />
                      <div className="truncate">
                        <p className="text-xs font-bold text-gray-900 truncate">{s.fullname}</p>
                        <p className="text-[10px] text-gray-400 truncate">@{s.username}</p>
                      </div>
                    </div>
                    <AcademicBadge role={s.role} showText={false} />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
