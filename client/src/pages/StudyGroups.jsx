import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getGroups, createGroup, toggleJoinGroup } from '../services/groupService';
import { useSocket } from '../context/SocketContext';
import { FaUsers, FaPlus, FaSearch, FaLock, FaGlobe, FaBookOpen } from 'react-icons/fa';

const StudyGroups = () => {
  const { socket, emitGroupUpdate } = useSocket();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Course Hub');
  const [privacy, setPrivacy] = useState('public');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await getGroups(categoryFilter, search);
      setGroups(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, search]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  useEffect(() => {
    if (!socket) return undefined;

    const handleGroupUpdate = () => fetchGroups();
    socket.on('group-updated', handleGroupUpdate);
    return () => socket.off('group-updated', handleGroupUpdate);
  }, [socket, fetchGroups]);

  const handleJoin = async (groupId, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const { data } = await toggleJoinGroup(groupId);
      emitGroupUpdate({ groupId, action: data.joined ? 'joined' : 'left', memberCount: data.memberCount });
      setGroups((prev) =>
        prev.map((g) =>
          g._id === groupId
            ? {
                ...g,
                joined: data.joined,
                members: data.joined ? [...g.members, {}] : g.members.slice(0, -1),
              }
            : g
        )
      );
      fetchGroups();
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Group name is required');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      const { data } = await createGroup({ name, code, description, category, privacy });
      emitGroupUpdate({ groupId: data._id, action: 'created', memberCount: data.members?.length || 1 });
      setName('');
      setCode('');
      setDescription('');
      setShowModal(false);
      fetchGroups();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create group');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl shadow-md p-6 text-white mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold flex items-center">
            <FaUsers className="mr-3 text-blue-200" />
            ODFEL Course Study Groups
          </h1>
          <p className="text-blue-100 text-sm mt-1 max-w-xl">
            Collaborate with distance learning peers, share course materials, discuss assignments, and join subject study hubs.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-white text-blue-800 font-bold px-5 py-2.5 rounded-xl shadow hover:bg-blue-50 transition flex items-center text-sm"
        >
          <FaPlus className="mr-2" /> Create Study Group
        </button>
      </div>

      {/* Filter & Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2 overflow-x-auto text-xs font-bold">
          {['all', 'Course Hub', 'Study Group', 'Department', 'Research Group'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg transition capitalize whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat === 'all' ? 'All Groups' : cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
          <input
            type="text"
            placeholder="Search group or code (e.g. CIT201)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-xs outline-none focus:border-primary focus:bg-white"
          />
        </div>
      </div>

      {/* Groups Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500 font-medium">Loading study groups...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {groups.map((group) => (
            <Link
              key={group._id}
              to={`/groups/${group._id}`}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="inline-block bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-200 mb-1 uppercase">
                      {group.category}
                    </span>
                    <h3 className="font-extrabold text-base text-gray-900 leading-snug">{group.name}</h3>
                  </div>
                  {group.code && (
                    <span className="bg-gray-800 text-white font-extrabold text-xs px-2 py-0.5 rounded">
                      {group.code}
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-600 mt-2 line-clamp-2">{group.description || 'No description provided.'}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <div className="flex items-center text-gray-500 space-x-2">
                  <span className="flex items-center">
                    <FaUsers className="mr-1 text-gray-400" />
                    {group.members?.length || 0} Members
                  </span>
                  <span>·</span>
                  <span className="flex items-center">
                    {group.privacy === 'private' ? <FaLock className="mr-1" /> : <FaGlobe className="mr-1" />}
                    {group.privacy}
                  </span>
                </div>

                <button
                  onClick={(e) => handleJoin(group._id, e)}
                  className="bg-primary text-white px-3 py-1 rounded-lg font-bold text-xs hover:bg-primary-dark shadow-xs transition"
                >
                  Join Group
                </button>
              </div>
            </Link>
          ))}

          {groups.length === 0 && (
            <div className="col-span-full bg-white rounded-2xl p-12 text-center text-gray-500 border border-gray-100">
              <FaBookOpen className="mx-auto text-4xl text-gray-300 mb-3" />
              <p className="font-bold text-base text-gray-800">No Study Groups Found</p>
              <p className="text-xs mt-1">Be the first to create a course study group for your department!</p>
            </div>
          )}
        </div>
      )}

      {/* Modal to Create Group */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <FaUsers className="mr-2 text-primary" /> Create New Study Group
            </h2>

            <form onSubmit={handleCreateGroup} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Group Name *</label>
                <input
                  type="text"
                  placeholder="e.g. CIT201 Data Structures & Algorithms Hub"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Course Code (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. CIT201"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-primary uppercase"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-primary"
                >
                  <option value="Course Hub">Course Hub</option>
                  <option value="Study Group">Study Group</option>
                  <option value="Department">Department Hub</option>
                  <option value="Research Group">Research Group</option>
                  <option value="General Interest">General Interest</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Privacy</label>
                <select
                  value={privacy}
                  onChange={(e) => setPrivacy(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-primary"
                >
                  <option value="public">Public (Anyone can join)</option>
                  <option value="private">Private (Approval required)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Description</label>
                <textarea
                  placeholder="Describe the target course, goals, and rules for this group..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-primary"
                  rows="3"
                />
              </div>

              {formError && <p className="text-red-500 font-bold">{formError}</p>}

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-100 text-gray-700 font-semibold px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-primary text-white font-bold px-5 py-2 rounded-lg hover:bg-primary-dark"
                >
                  {submitting ? 'Creating...' : 'Create Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyGroups;
