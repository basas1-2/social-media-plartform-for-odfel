import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaHome,
  FaUserFriends,
  FaBell,
  FaCommentDots,
  FaBookmark,
  FaCog,
  FaSignOutAlt,
  FaShieldAlt,
  FaUsers,
  FaBook,
  FaCalendarAlt,
  FaSearch,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { getNotifications } from '../services/notificationService';
import AcademicBadge from './AcademicBadge';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

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

  const navItem = 'nav-icon flex items-center justify-center px-2 sm:px-2.5 md:px-3 py-2 rounded-lg hover:bg-white/20 transition cursor-pointer text-xs sm:text-sm font-medium flex-shrink-0';

  return (
    <nav className="bg-primary text-white shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5">
        {/* Main Row */}
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-lg sm:text-xl md:text-2xl font-black flex items-center tracking-wide flex-shrink-0 mr-2">
            <span className="bg-white text-primary px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg mr-1.5 font-black shadow-sm text-sm sm:text-base">C</span>
            <span>CODFEL <span className="text-[10px] sm:text-xs text-blue-200 font-normal hidden xs:inline">Network</span></span>
          </Link>

          {/* Search bar on Laptop/Desktop */}
          <div className="hidden md:flex flex-1 max-w-sm mx-4 relative">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/70 text-xs" />
            <input
              type="text"
              placeholder="Search courses, study notes, or peers..."
              className="w-full bg-white/20 text-white placeholder-white/70 rounded-full pl-9 pr-4 py-1.5 text-xs outline-none focus:bg-white/30 transition border border-white/10"
              onFocus={() => navigate('/search')}
            />
          </div>

          {/* Navigation Links & User Menu */}
          <div className="flex items-center space-x-0.5 sm:space-x-1.5 md:space-x-2 overflow-x-auto no-scrollbar">
            {/* Mobile search toggle icon */}
            <button
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className="md:hidden p-2 rounded-lg hover:bg-white/20 transition text-white"
              title="Search"
            >
              <FaSearch size={16} />
            </button>

            <Link to="/" className={navItem} title="Feed">
              <FaHome size={18} className="md:mr-1" />
              <span className="hidden lg:inline">Feed</span>
            </Link>

            <Link to="/groups" className={navItem} title="Study Groups">
              <FaUsers size={18} className="md:mr-1" />
              <span className="hidden lg:inline">Study Groups</span>
            </Link>

            <Link to="/resources" className={navItem} title="Resource Library">
              <FaBook size={17} className="md:mr-1" />
              <span className="hidden lg:inline">Library</span>
            </Link>

            <Link to="/schedule" className={navItem} title="Schedule">
              <FaCalendarAlt size={17} className="md:mr-1" />
              <span className="hidden lg:inline">Schedule</span>
            </Link>

            <Link to="/messages" className={navItem} title="Messages">
              <FaCommentDots size={18} />
            </Link>

            <Link to="/notifications" className={`${navItem} relative`} title="Notifications">
              <FaBell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center shadow-sm">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            {/* STRICT ADMIN CHECK: Only rendered if user.isAdmin is true */}
            {user?.isAdmin && (
              <Link to="/admin" className={`${navItem} bg-red-600/80 hover:bg-red-600 font-bold`} title="Admin Dashboard">
                <FaShieldAlt size={18} className="md:mr-1 text-yellow-300" />
                <span className="hidden lg:inline">Admin</span>
              </Link>
            )}

            {/* User Profile Menu Dropdown */}
            <div className="relative ml-1 flex-shrink-0">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center p-1 rounded-lg hover:bg-white/20 transition focus:outline-none"
              >
                <img
                  src={user?.profilePicture || 'https://via.placeholder.com/40'}
                  alt="profile"
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-white shadow-xs"
                />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white text-gray-800 rounded-2xl shadow-2xl py-2 z-50 border border-gray-100 animate-fadeIn">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-gray-900 text-sm truncate">{user?.fullname}</p>
                      <AcademicBadge role={user?.role} showText={true} />
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">@{user?.username}</p>
                    {user?.courseOfStudy && (
                      <p className="text-xs font-medium text-primary mt-1 truncate">
                        📚 {user?.courseOfStudy}
                      </p>
                    )}
                  </div>
                  <Link
                    to={`/profile/${user?.username}`}
                    className="block px-4 py-2 hover:bg-gray-50 text-xs font-semibold flex items-center text-gray-700"
                    onClick={() => setShowDropdown(false)}
                  >
                    <FaUserFriends className="mr-3 text-gray-400" /> My Academic Profile
                  </Link>
                  <Link
                    to="/saved"
                    className="block px-4 py-2 hover:bg-gray-50 text-xs font-semibold flex items-center text-gray-700"
                    onClick={() => setShowDropdown(false)}
                  >
                    <FaBookmark className="mr-3 text-gray-400" /> Saved Notes & Posts
                  </Link>
                  <Link
                    to="/edit-profile"
                    className="block px-4 py-2 hover:bg-gray-50 text-xs font-semibold flex items-center text-gray-700"
                    onClick={() => setShowDropdown(false)}
                  >
                    <FaCog className="mr-3 text-gray-400" /> Edit Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 text-xs flex items-center text-red-600 font-bold border-t border-gray-100"
                  >
                    <FaSignOutAlt className="mr-3" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Row - visible when toggled on phone screens */}
        {showMobileSearch && (
          <div className="mt-2 pt-2 border-t border-white/20 md:hidden">
            <input
              type="text"
              placeholder="Search courses, notes, peers..."
              className="w-full bg-white/20 text-white placeholder-white/70 rounded-full px-4 py-1.5 text-xs outline-none focus:bg-white/30"
              onFocus={() => {
                setShowMobileSearch(false);
                navigate('/search');
              }}
            />
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
