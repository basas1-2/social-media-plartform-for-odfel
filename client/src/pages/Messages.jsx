import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { getConversations } from '../services/messageService';
import ChatWindow from '../components/ChatWindow';

const Messages = () => {
  const { user } = useAuth();
  const { onlineUsers } = useSocket();
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadConversations();
  }, []);

  // Select conversation from navigation state
  useEffect(() => {
    if (location.state?.conversationId) {
      const conv = conversations.find((c) => c._id === location.state.conversationId);
      if (conv) setActiveConversation(conv);
    }
  }, [location.state, conversations]);

  const loadConversations = async () => {
    try {
      const { data } = await getConversations();
      setConversations(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filterConversations = conversations.filter((conversation) => {
    const otherUser = conversation.members?.find((m) => m._id !== user?._id);
    return otherUser?.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           otherUser?.username?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getOtherUser = (conversation) => {
    return conversation.members?.find((m) => m._id !== user?._id);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden flex h-[calc(100vh-120px)]">
        {/* Conversation list */}
        <div className={`w-full md:w-80 border-r ${activeConversation ? 'hidden md:block' : 'block'}`}>
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold mb-3">Messages</h2>
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400 text-sm" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search conversations..."
                className="w-full border rounded-full pl-9 pr-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="overflow-y-auto h-[calc(100%-73px)]">
            {loading ? (
              <p className="text-center text-gray-500 py-8">Loading...</p>
            ) : filterConversations.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No conversations yet</p>
            ) : (
              filterConversations.map((conversation) => {
                const otherUser = getOtherUser(conversation);
                const isOnline = onlineUsers.includes(otherUser?._id);
                return (
                  <button
                    key={conversation._id}
                    onClick={() => setActiveConversation(conversation)}
                    className={`w-full flex items-center space-x-3 p-4 hover:bg-gray-50 transition ${
                      activeConversation?._id === conversation._id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={otherUser?.profilePicture || 'https://via.placeholder.com/48'}
                        alt={otherUser?.fullname}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold">{otherUser?.fullname}</p>
                      <p className="text-sm text-gray-500 truncate">
                        {conversation.lastMessage || 'Say hello!'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat window */}
        <div className={`flex-1 ${activeConversation ? 'block' : 'hidden md:flex'}`}>
          {activeConversation ? (
            <ChatWindow
              conversation={activeConversation}
              onBack={() => setActiveConversation(null)}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <p className="text-6xl mb-4">💬</p>
              <p className="text-lg font-semibold">Select a conversation</p>
              <p className="text-sm">Choose a chat to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
