import React, { useState, useEffect } from 'react';
import {
  FaUsers, FaFileAlt, FaComment, FaFlag, FaEnvelope, FaCommentDots,
  FaTrash, FaBan, FaCheckCircle, FaUserCheck,
} from 'react-icons/fa';
import {
  getStats, getAllUsers, getAdminPosts, toggleSuspend, deleteUser, deletePost,
  getReports, updateReportStatus,
} from '../services/adminService';

const AdminDashboard = () => {
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, postsRes, reportsRes] = await Promise.all([
        getStats(),
        getAllUsers(),
        getAdminPosts(),
        getReports(),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data.users);
      setPosts(postsRes.data);
      setReports(reportsRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (userId) => {
    try {
      await toggleSuspend(userId);
      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, isSuspended: !u.isSuspended } : u
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Delete this user and all their content?')) {
      try {
        await deleteUser(userId);
        setUsers((prev) => prev.filter((u) => u._id !== userId));
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('Delete this post?')) {
      try {
        await deletePost(postId);
        setPosts((prev) => prev.filter((p) => p._id !== postId));
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleReportStatus = async (reportId, status) => {
    try {
      await updateReportStatus(reportId, status);
      setReports((prev) =>
        prev.map((r) => (r._id === reportId ? { ...r, status } : r))
      );
    } catch (error) {
      console.error(error);
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <FaFlag /> },
    { id: 'users', label: 'Users', icon: <FaUsers /> },
    { id: 'posts', label: 'Posts', icon: <FaFileAlt /> },
    { id: 'reports', label: 'Reports', icon: <FaFlag /> },
  ];

  const StatCard = ({ icon, label, value }) => (
    <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">{label}</p>
        <p className="text-3xl font-bold">{value}</p>
      </div>
      <div className="text-3xl text-primary">{icon}</div>
    </div>
  );

  if (loading) {
    return <div className="text-center py-20 text-gray-500">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6 bg-white rounded-lg shadow-md p-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center space-x-1 px-4 py-2 rounded-lg text-sm font-semibold transition ${
              tab === t.id ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Dashboard tab */}
      {tab === 'dashboard' && stats && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <StatCard icon={<FaUsers />} label="Total Users" value={stats.totalUsers} />
            <StatCard icon={<FaFileAlt />} label="Total Posts" value={stats.totalPosts} />
            <StatCard icon={<FaComment />} label="Comments" value={stats.totalComments} />
            <StatCard icon={<FaFlag />} label="Pending Reports" value={stats.totalReports} />
            <StatCard icon={<FaEnvelope />} label="Messages" value={stats.totalMessages} />
<StatCard icon={<FaCommentDots />} label="Conversations" value={stats.totalConversations} />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold mb-4">Recent Users</h3>
              <div className="space-y-3">
                {stats.recentUsers.map((u) => (
                  <div key={u._id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <img
                        src={u.profilePicture || 'https://via.placeholder.com/32'}
                        alt={u.fullname}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium">{u.fullname}</p>
                        <p className="text-xs text-gray-500">@{u.username}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {u.isAdmin && <FaUserCheck className="text-primary" />}
                      {u.isSuspended && <FaBan className="text-red-500" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold mb-4">Recent Posts</h3>
              <div className="space-y-3">
                {stats.recentPosts.map((p) => (
                  <div key={p._id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <img
                        src={p.userId?.profilePicture || 'https://via.placeholder.com/32'}
                        alt={p.userId?.fullname}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium">{p.userId?.fullname}</p>
                        <p className="text-xs text-gray-500 truncate max-w-xs">
                          {p.text || 'Image/Video post'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users tab */}
      {tab === 'users' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-semibold">User</th>
                <th className="text-left px-4 py-3 text-sm font-semibold">Role</th>
                <th className="text-left px-4 py-3 text-sm font-semibold">Status</th>
                <th className="text-left px-4 py-3 text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((u) => (
                <tr key={u._id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <img
                        src={u.profilePicture || 'https://via.placeholder.com/32'}
                        alt={u.fullname}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium">{u.fullname}</p>
                        <p className="text-xs text-gray-500">@{u.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {u.isAdmin ? (
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-semibold">Admin</span>
                    ) : (
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">User</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {u.isSuspended ? (
                      <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-semibold">Suspended</span>
                    ) : (
                      <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs font-semibold">Active</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSuspend(u._id)}
                        title={u.isSuspended ? 'Activate' : 'Suspend'}
                        className="text-yellow-600 hover:bg-yellow-50 p-1 rounded"
                      >
                        <FaBan />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u._id)}
                        title="Delete"
                        className="text-red-600 hover:bg-red-50 p-1 rounded"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Posts tab */}
      {tab === 'posts' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-semibold">Author</th>
                <th className="text-left px-4 py-3 text-sm font-semibold">Content</th>
                <th className="text-left px-4 py-3 text-sm font-semibold">Likes</th>
                <th className="text-left px-4 py-3 text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {posts.map((p) => (
                <tr key={p._id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <img
                        src={p.userId?.profilePicture || 'https://via.placeholder.com/32'}
                        alt={p.userId?.fullname}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <p className="text-sm font-medium">{p.userId?.fullname}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                    {p.text || 'Image/Video post'}
                  </td>
                  <td className="px-4 py-3 text-sm">{p.likes?.length || 0}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDeletePost(p._id)}
                      className="text-red-600 hover:bg-red-50 p-1 rounded"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reports tab */}
      {tab === 'reports' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-semibold">Reporter</th>
                <th className="text-left px-4 py-3 text-sm font-semibold">Type</th>
                <th className="text-left px-4 py-3 text-sm font-semibold">Reason</th>
                <th className="text-left px-4 py-3 text-sm font-semibold">Status</th>
                <th className="text-left px-4 py-3 text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {reports.map((r) => (
                <tr key={r._id}>
                  <td className="px-4 py-3 text-sm">{r.reporterId?.fullname}</td>
                  <td className="px-4 py-3">
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                      {r.targetType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{r.reason}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      r.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-600'
                        : r.status === 'reviewed'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleReportStatus(r._id, 'reviewed')}
                        className="text-green-600 hover:bg-green-50 p-1 rounded"
                        title="Mark reviewed"
                      >
                        <FaCheckCircle />
                      </button>
                      <button
                        onClick={() => handleReportStatus(r._id, 'dismissed')}
                        className="text-gray-600 hover:bg-gray-100 p-1 rounded"
                        title="Dismiss"
                      >
                        <FaBan />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
