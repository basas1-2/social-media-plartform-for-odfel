import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaUserFriends, FaBell, FaCommentDots, FaBookmark, FaCog, FaSignOutAlt, FaShieldAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { getNotifications } from '../services/notificationService';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await getNotifications();
      setUnreadCount(data.unreadCount);
    } catch (error) {
      // ignore
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItem = 'flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-gray-100 transition cursor-pointer';

  return (
    <nav className="bg-primary text-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-2">
        <Link to="/" className="text-2xl font-bold flex items-center">
          <span className="bg-white text-primary px-2 py-1 rounded-lg mr-2">C</span>
          Codfel
        </Link>

        {/* Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-white/20 text-white placeholder-white/70 rounded-full px-4 py-2 outline-none focus:bg-white/30"
            onFocus={() => navigate('/search')}
          />
        </div>

        {/* Nav icons */}
        <div className="flex items-center space-x-1">
          <Link to="/" className={navItem} title="Home">
            <FaHome size={20} />
          </Link>
          <Link to="/saved" className={navItem} title="Saved">
            <FaBookmark size={20} />
          </Link>
          <Link to="/messages" className={navItem} title="Messages">
            <FaCommentDots size={20} />
          </Link>
          <Link to="/notifications" className={`${navItem} relative`} title="Notifications">
            <FaBell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
          {user?.isAdmin && (
            <Link to="/admin" className={navItem} title="Admin">
              <FaShieldAlt size={20} />
            </Link>
          )}

          {/* Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 px-2 py-1 rounded-lg hover:bg-white/20 transition"
            >
              <img
                src={user?.profilePicture || 'https://via.placeholder.com/40'}
                alt="profile"
                className="w-8 h-8 rounded-full object-cover border-2 border-white"
              />
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white text-gray-800 rounded-lg shadow-lg py-2 z-50">
                <div className="px-4 py-2 border-b">
                  <p className="font-semibold">{user?.fullname}</p>
                  <p className="text-sm text-gray-500">@{user?.username}</p>
                </div>
                <Link
                  to={`/profile/${user?.username}`}
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={() => setShowDropdown(false)}
                >
                  <FaUserFriends className="inline mr-2" /> My Profile
                </Link>
                <Link
                  to="/edit-profile"
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={() => setShowDropdown(false)}
                >
                  <FaCog className="inline mr-2" /> Edit Profile
                </Link>
                <Link
                  to="/settings"
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={() => setShowDropdown(false)}
                >
                  <FaCog className="inline mr-2" /> Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                >
                  <FaSignOutAlt className="inline mr-2" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
