import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getGroupDetail, toggleJoinGroup } from '../services/groupService';
import { getAllPosts } from '../services/postService';
import { useSocket } from '../context/SocketContext';
import PostCard from '../components/PostCard';
import PostCreator from '../components/PostCreator';
import AcademicBadge from '../components/AcademicBadge';
import { FaUsers, FaArrowLeft } from 'react-icons/fa';

const GroupDetail = () => {
  const { id } = useParams();
  const { socket, emitGroupUpdate } = useSocket();
  const [group, setGroup] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGroupData = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await getGroupDetail(id);
      setGroup(data);

      // Load posts for this group's course code or general feed
      const postsRes = await getAllPosts(1, 'all', data.code || '');
      setPosts(postsRes.data.posts);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchGroupData();
  }, [fetchGroupData]);

  useEffect(() => {
    if (!socket) return undefined;

    const handleGroupUpdate = (data) => {
      if (data.groupId === id) fetchGroupData();
    };
    socket.on('group-updated', handleGroupUpdate);
    return () => socket.off('group-updated', handleGroupUpdate);
  }, [socket, id, fetchGroupData]);

  const handleJoin = async () => {
    try {
      const { data } = await toggleJoinGroup(id);
      emitGroupUpdate({ groupId: id, action: data.joined ? 'joined' : 'left', memberCount: data.memberCount });
      fetchGroupData();
    } catch (error) {
      console.error(error);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500 font-medium">Loading group details...</div>;
  }

  if (!group) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="font-bold text-lg">Group not found</p>
        <Link to="/groups" className="text-primary font-bold text-xs underline mt-2 inline-block">
          Return to Study Groups
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Back button */}
      <Link to="/groups" className="inline-flex items-center text-xs font-bold text-gray-600 hover:text-primary mb-4">
        <FaArrowLeft className="mr-1" /> Back to Study Groups
      </Link>

      {/* Header Banner */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded border border-blue-200 uppercase">
                {group.category}
              </span>
              {group.code && (
                <span className="bg-gray-900 text-white text-xs font-extrabold px-2.5 py-0.5 rounded uppercase">
                  {group.code}
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900">{group.name}</h1>
            <p className="text-xs text-gray-600 mt-2 max-w-2xl leading-relaxed">{group.description}</p>
          </div>

          <button
            onClick={handleJoin}
            className="bg-primary text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-sm hover:bg-primary-dark transition"
          >
            Join / Leave Group
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center text-xs text-gray-500 space-x-4">
          <span>👥 {group.members?.length || 0} Members</span>
          <span>·</span>
          <span>Created by {group.creatorId?.fullname}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Discussion Feed Column */}
        <div className="lg:col-span-2">
          <PostCreator onPostCreated={handlePostCreated} />

          <h2 className="font-bold text-sm text-gray-700 mb-3 flex items-center">
            Group Discussion Feed ({posts.length})
          </h2>

          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}

          {posts.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500 text-xs">
              No posts in this study hub yet. Post a question or course note above!
            </div>
          )}
        </div>

        {/* Group Members Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-bold text-xs uppercase text-gray-500 mb-3 flex items-center">
              <FaUsers className="mr-1.5 text-primary" /> Group Members ({group.members?.length || 0})
            </h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {group.members?.map((m) => (
                <div key={m._id} className="flex items-center space-x-2.5">
                  <img
                    src={m.profilePicture || 'https://via.placeholder.com/32'}
                    alt={m.fullname}
                    className="w-8 h-8 rounded-full object-cover border border-gray-200"
                  />
                  <div className="truncate flex-1">
                    <p className="text-xs font-bold text-gray-900 truncate">{m.fullname}</p>
                    <div className="flex items-center space-x-1 mt-0.5">
                      <AcademicBadge role={m.role} showText={true} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupDetail;
