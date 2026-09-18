import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FaUserPlus, FaUserCheck, FaEdit, FaCommentDots, FaGraduationCap, FaBook } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { getProfile, toggleFollow } from '../services/userService';
import { getUserPosts } from '../services/postService';
import { createConversation } from '../services/messageService';
import PostCard from '../components/PostCard';
import PostCreator from '../components/PostCreator';
import AcademicBadge from '../components/AcademicBadge';

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
    return <div className="text-center py-20 text-gray-500 font-medium">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="text-center py-20 text-gray-500 font-bold">User profile not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Cover */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
        <div className="relative profile-cover bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 h-44">
          {profile.coverPhoto && (
            <img src={profile.coverPhoto} alt="cover" className="w-full h-full object-cover" />
          )}
        </div>

        {/* Profile info */}
        <div className="px-6 pb-6">
          <div className="flex flex-col md:flex-row md:items-end -mt-14">
            <img
              src={profile.profilePicture || 'https://via.placeholder.com/120'}
              alt={profile.fullname}
              className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-white bg-white shadow-md"
            />
            <div className="md:ml-5 md:mb-2 flex-1 mt-3">
              <div className="flex flex-wrap items-center space-x-2">
                <h1 className="text-2xl font-black text-gray-900">{profile.fullname}</h1>
                <AcademicBadge role={profile.role} />
              </div>
              <p className="text-xs text-gray-500 font-medium">@{profile.username}</p>

              {/* Academic Affiliations */}
              <div className="mt-2 text-xs font-medium text-gray-700 space-y-1">
                {profile.courseOfStudy && (
                  <p className="flex items-center text-primary font-bold">
                    <FaBook className="mr-1.5" /> Course: {profile.courseOfStudy} ({profile.academicLevel || 'Distance Student'})
                  </p>
                )}
                {profile.department && (
                  <p className="flex items-center text-gray-600">
                    <FaGraduationCap className="mr-1.5" /> Department of {profile.department} · {profile.institution || 'ODFEL Network'}
                  </p>
                )}
              </div>

              {profile.bio && <p className="text-xs text-gray-600 mt-2 bg-gray-50 p-2.5 rounded-lg border border-gray-100 leading-relaxed">{profile.bio}</p>}
            </div>

            <div className="flex space-x-2 md:mb-2 mt-4">
              {isOwnProfile ? (
                <Link
                  to="/edit-profile"
                  className="flex items-center space-x-1.5 bg-gray-100 text-gray-800 px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-200 transition"
                >
                  <FaEdit /> <span>Edit Profile</span>
                </Link>
              ) : (
                <>
                  <button
                    onClick={handleFollow}
                    className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                      following
                        ? 'bg-gray-200 text-gray-700'
                        : 'bg-primary text-white hover:bg-primary-dark shadow-sm'
                    }`}
                  >
                    {following ? <FaUserCheck /> : <FaUserPlus />}
                    <span>{following ? 'Following' : 'Follow'}</span>
                  </button>
                  <button
                    onClick={handleMessage}
                    className="flex items-center space-x-1.5 bg-gray-100 text-gray-800 px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-200 transition"
                  >
                    <FaCommentDots /> <span>Message</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex space-x-8 mt-5 pt-4 border-t border-gray-100 text-xs">
            <div>
              <span className="font-extrabold text-base text-gray-900">{posts.length}</span>
              <span className="text-gray-500 font-medium ml-1.5">Academic Posts</span>
            </div>
            <Link to={`/friends/${profile.username}`} className="hover:text-primary">
              <span className="font-extrabold text-base text-gray-900">{profile.followersCount}</span>
              <span className="text-gray-500 font-medium ml-1.5">Followers</span>
            </Link>
            <Link to={`/friends/${profile.username}`} className="hover:text-primary">
              <span className="font-extrabold text-base text-gray-900">{profile.followingCount}</span>
              <span className="text-gray-500 font-medium ml-1.5">Following</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="mt-6">
        <h2 className="text-base font-bold text-gray-800 mb-4">Academic Posts & Shared Notes ({posts.length})</h2>

        {/* Post creator - only on own profile */}
        {isOwnProfile && (
          <div className="mb-4">
            <PostCreator onPostCreated={handlePostCreated} />
          </div>
        )}

        {posts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
            <p className="text-base font-bold text-gray-800">No posts shared yet</p>
            <p className="text-xs mt-1">This user hasn't posted any academic questions or notes.</p>
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
