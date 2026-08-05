import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaComment, FaUserPlus, FaShare, FaAt, FaCommentDots } from 'react-icons/fa';
import { getNotifications, markAllAsRead } from '../services/notificationService';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const { data } = await getNotifications();
      setNotifications(data.notifications);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error(error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'like':
        return <FaHeart className="text-red-500" />;
      case 'comment':
        return <FaComment className="text-blue-500" />;
      case 'follow':
        return <FaUserPlus className="text-green-500" />;
      case 'share':
        return <FaShare className="text-purple-500" />;
      case 'mention':
        return <FaAt className="text-yellow-500" />;
      case 'message':
        return <FaCommentDots className="text-primary" />;
      default:
        return <FaHeart className="text-gray-500" />;
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
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow-md p-6 mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Notifications</h1>
        <button
          onClick={handleMarkAll}
          className="text-primary text-sm font-semibold hover:underline"
        >
          Mark all as read
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500 py-10">Loading...</p>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
          <p className="text-lg font-semibold">No notifications</p>
          <p className="text-sm">You're all caught up!</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md divide-y">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`flex items-center space-x-3 p-4 ${
                notification.read ? 'bg-white' : 'bg-blue-50'
              }`}
            >
              <div className="text-xl">{getIcon(notification.type)}</div>
              <Link to={`/profile/${notification.senderId?.username}`} className="flex-1">
                <div className="flex items-center">
                  <img
                    src={notification.senderId?.profilePicture || 'https://via.placeholder.com/40'}
                    alt={notification.senderId?.fullname}
                    className="w-10 h-10 rounded-full object-cover mr-3"
                  />
                  <div>
                    <p className="text-sm">
                      <span className="font-semibold">{notification.senderId?.fullname}</span>{' '}
                      {notification.text}
                    </p>
                    <p className="text-xs text-gray-500">{timeAgo(notification.createdAt)}</p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
