import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUserPlus, FaUserCheck } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { toggleFollow } from '../services/userService';

const UserCard = ({ user }) => {
  const { user: currentUser } = useAuth();
  const [following, setFollowing] = useState(
    user?.followers?.includes(currentUser?._id) || false
  );
  const [followCount, setFollowCount] = useState(user?.followers?.length || 0);

  const isSelf = user?._id === currentUser?._id;

  const handleFollow = async () => {
    try {
      await toggleFollow(user._id);
      setFollowing(!following);
      setFollowCount(following ? followCount - 1 : followCount + 1);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
      <Link to={`/profile/${user?.username}`} className="flex items-center space-x-3">
        <img
          src={user?.profilePicture || 'https://via.placeholder.com/48'}
          alt={user?.fullname}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <p className="font-semibold hover:underline">{user?.fullname}</p>
          <p className="text-sm text-gray-500">@{user?.username}</p>
          <p className="text-xs text-gray-400">{followCount} followers</p>
        </div>
      </Link>
      {!isSelf && (
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
      )}
    </div>
  );
};

export default UserCard;
