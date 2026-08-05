import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PostCreator from '../components/PostCreator';
import PostCard from '../components/PostCard';
import UserCard from '../components/UserCard';
import { getFeed } from '../services/postService';
import { getSuggestions } from '../services/userService';

const Home = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadSuggestions = useCallback(async () => {
    try {
      const { data } = await getSuggestions();
      setSuggestions(data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const loadFeed = useCallback(async (pageNum) => {
    try {
      const { data } = await getFeed(pageNum);
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
  }, []);

  useEffect(() => {
    loadFeed(1);
    loadSuggestions();
  }, [loadFeed, loadSuggestions]);

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handleDelete = (postId) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex gap-6">
        {/* Left sidebar - Suggestions */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-20">
            <div className="bg-white rounded-lg shadow-md p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <Link to={`/profile/${user?.username}`} className="flex items-center space-x-2">
                  <img
                    src={user?.profilePicture || 'https://via.placeholder.com/40'}
                    alt="profile"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-sm">{user?.fullname}</p>
                    <p className="text-xs text-gray-500">@{user?.username}</p>
                  </div>
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="font-semibold text-gray-700 mb-3">People You May Know</h3>
              <div className="space-y-3">
                {suggestions.map((s) => (
                  <Link
                    key={s._id}
                    to={`/profile/${s.username}`}
                    className="flex items-center space-x-2 hover:bg-gray-50 p-2 rounded-lg"
                  >
                    <img
                      src={s.profilePicture || 'https://via.placeholder.com/32'}
                      alt={s.fullname}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm font-medium">{s.fullname}</p>
                      <p className="text-xs text-gray-500">@{s.username}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main feed */}
        <div className="flex-1 max-w-2xl">
          <PostCreator onPostCreated={handlePostCreated} />
          {loading ? (
            <div className="text-center py-10 text-gray-500">Loading...</div>
          ) : (
            <>
              {posts.map((post) => (
                <PostCard key={post._id} post={post} onDelete={handleDelete} />
              ))}
              {hasMore && (
                <button
                  onClick={() => loadFeed(page + 1)}
                  className="w-full bg-white py-3 rounded-lg shadow-md text-primary font-semibold hover:bg-gray-50"
                >
                  Load More
                </button>
              )}
              {posts.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                  <p className="text-lg font-semibold">No posts yet</p>
                  <p>Follow people to see their posts here</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right sidebar - Friends */}
        <div className="hidden xl:block w-56 flex-shrink-0">
          <div className="sticky top-20 bg-white rounded-lg shadow-md p-4">
            <h3 className="font-semibold text-gray-700 mb-3">Suggestions</h3>
            <div className="space-y-3">
              {suggestions.slice(0, 5).map((s) => (
                <UserCard key={s._id} user={s} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
