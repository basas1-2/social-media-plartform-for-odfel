import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FaUserPlus, FaUserCheck, FaEdit, FaCommentDots } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { getProfile, toggleFollow } from '../services/userService';
import { getUserPosts } from '../services/postService';
import { createConversation } from '../services/messageService';
import PostCard from '../components/PostCard';
import PostCreator from '../components/PostCreator';

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  const isOwnProfile = profile?._id === currentUser?._id;

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line
  }, [username]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const { data } = await getProfile(username);
      setProfile(data);
      setFollowersCount(data.followersCount);
      setFollowing(data.followers?.some((f) => f._id === currentUser?._id));
      const { data: userPosts } = await getUserPosts(data._id);
      setPosts(userPosts);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      await toggleFollow(profile._id);
      setFollowing(!following);
      setFollowersCount(following ? followersCount - 1 : followersCount + 1);
    } catch (error) {
      console.error(error);
    }
  };

  const handleMessage = async () => {
    try {
      const { data } = await createConversation(profile._id);
      navigate('/messages', { state: { conversationId: data._id } });
    } catch (error) {
      console.error(error);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-500">Loading...</div>;
  }

  if (!profile) {
    return <div className="text-center py-20 text-gray-500">User not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Cover */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="relative profile-cover bg-gradient-to-r from-primary to-secondary">
          {profile.coverPhoto && (
            <img src={profile.coverPhoto} alt="cover" className="w-full h-full object-cover" />
          )}
        </div>

        {/* Profile info */}
        <div className="px-6 pb-6">
          <div className="flex flex-col md:flex-row md:items-end -mt-12">
            <img
              src={profile.profilePicture || 'https://via.placeholder.com/120'}
              alt={profile.fullname}
              className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover border-4 border-white bg-white"
            />
            <div className="md:ml-4 md:mb-2 flex-1 mt-2">
              <h1 className="text-2xl font-bold">{profile.fullname}</h1>
              <p className="text-gray-500">@{profile.username}</p>
              {profile.bio && <p className="text-gray-700 mt-1">{profile.bio}</p>}
            </div>
            <div className="flex space-x-2 md:mb-2 mt-3">
              {isOwnProfile ? (
                <Link
                  to="/edit-profile"
                  className="flex items-center space-x-1 bg-gray-100 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200"
                >
                  <FaEdit /> <span>Edit Profile</span>
                </Link>
              ) : (
                <>
                  <button
                    onClick={handleFollow}
                    className={`flex items-center space-x-1 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                      following
                        ? 'bg-gray-200 text-gray-700'
                        : 'bg-primary text-white hover:bg-primary-dark'
                    }`}
                  >
                    {following ? <FaUserCheck /> : <FaUserPlus />}
                    <span>{following ? 'Following' : 'Follow'}</span>
                  </button>
                  <button
                    onClick={handleMessage}
                    className="flex items-center space-x-1 bg-gray-100 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200"
                  >
                    <FaCommentDots /> <span>Message</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex space-x-6 mt-4 pt-4 border-t">
            <div>
              <span className="font-bold text-lg">{posts.length}</span>
              <span className="text-gray-500 ml-1">Posts</span>
            </div>
            <Link to={`/friends/${profile.username}`} className="hover:text-primary">
              <span className="font-bold text-lg">{profile.followersCount}</span>
              <span className="text-gray-500 ml-1">Followers</span>
            </Link>
            <Link to={`/friends/${profile.username}`} className="hover:text-primary">
              <span className="font-bold text-lg">{profile.followingCount}</span>
              <span className="text-gray-500 ml-1">Following</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Posts</h2>

        {/* Post creator - only on own profile */}
        {isOwnProfile && (
          <div className="mb-4">
            <PostCreator onPostCreated={handlePostCreated} />
          </div>
        )}

        {posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
            <p className="text-lg font-semibold">No posts yet</p>
            <p className="text-sm">This user hasn't posted anything</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} onDelete={() => loadProfile()} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
