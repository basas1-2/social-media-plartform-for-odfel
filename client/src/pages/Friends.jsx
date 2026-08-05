import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getFriends } from '../services/userService';
import UserCard from '../components/UserCard';

const Friends = () => {
  const { username } = useParams();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFriends();
    // eslint-disable-next-line
  }, [username]);

  const loadFriends = async () => {
    setLoading(true);
    try {
      const { data } = await getFriends(username);
      setFriends(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow-md p-6 mb-4">
        <h1 className="text-2xl font-semibold">Following</h1>
        <p className="text-gray-500 text-sm">People this user follows</p>
      </div>

      {loading ? (
        <p className="text-center text-gray-500 py-10">Loading...</p>
      ) : friends.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
          <p className="text-lg font-semibold">No following yet</p>
          <p className="text-sm">This user hasn't followed anyone</p>
        </div>
      ) : (
        <div className="space-y-4">
          {friends.map((friend) => (
            <UserCard key={friend._id} user={friend} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Friends;
