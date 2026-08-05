import React, { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaImage, FaVideo, FaTimes } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { getMessages, sendMessage } from '../services/messageService';

const ChatWindow = ({ conversation, onBack }) => {
  const { user } = useAuth();
  const { emitTyping, emitMessageSeen, newMessage } = useSocket();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const otherUser = conversation?.members?.find((m) => m._id !== user?._id);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    loadMessages();
    // eslint-disable-next-line
  }, [conversation?._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Listen for new messages
  useEffect(() => {
    if (newMessage && newMessage.conversationId === conversation?._id) {
      setMessages((prev) => [...prev, newMessage]);
    }
  }, [newMessage, conversation?._id]);

  const loadMessages = async () => {
    try {
      const { data } = await getMessages(conversation._id);
      setMessages(data);
      // Mark unseen messages as seen
      data.forEach((msg) => {
        if (msg.senderId !== user._id && !msg.seen) {
          emitMessageSeen({ messageId: msg._id, conversationId: conversation._id });
        }
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleSend = async () => {
    if (!text.trim() && !image && !video) return;

    setLoading(true);
    try {
      const data = {
        conversationId: conversation._id,
        text,
        image,
        video,
      };
      const { data: msg } = await sendMessage(data);
      setMessages((prev) => [...prev, msg]);
      setText('');
      setImage(null);
      setVideo(null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    emitTyping({ conversationId: conversation._id, isTyping: e.target.value.length > 0 });
  };

  const timeFormat = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-white">
        <div className="flex items-center space-x-3">
          <button onClick={onBack} className="md:hidden text-gray-500">
            <FaTimes />
          </button>
          <img
            src={otherUser?.profilePicture || 'https://via.placeholder.com/40'}
            alt={otherUser?.fullname}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="font-semibold">{otherUser?.fullname}</p>
            <p className="text-xs text-gray-500">
              {otherUser?.isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
        {messages.map((msg) => {
          const isMine = msg.senderId?._id === user?._id || msg.senderId === user?._id;
          return (
            <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  isMine ? 'bg-primary text-white' : 'bg-white text-gray-800 shadow'
                }`}
              >
                {msg.text && <p className="break-words">{msg.text}</p>}
                {msg.image && (
                  <img src={msg.image} alt="message" className="rounded-lg max-w-full mt-1" />
                )}
                {msg.video && (
                  <video src={msg.video} controls className="rounded-lg max-w-full mt-1 max-h-48" />
                )}
                <p className={`text-xs mt-1 ${isMine ? 'text-white/70' : 'text-gray-400'}`}>
                  {timeFormat(msg.createdAt)}
                  {isMine && msg.seen && <span className="ml-1">✓✓</span>}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t bg-white">
        {image && (
          <div className="flex items-center justify-between mb-2 bg-gray-100 p-2 rounded">
            <span className="text-sm">📷 Image attached</span>
            <button onClick={() => setImage(null)} className="text-red-500">
              <FaTimes />
            </button>
          </div>
        )}
        {video && (
          <div className="flex items-center justify-between mb-2 bg-gray-100 p-2 rounded">
            <span className="text-sm">🎬 Video attached</span>
            <button onClick={() => setVideo(null)} className="text-red-500">
              <FaTimes />
            </button>
          </div>
        )}
        <div className="flex items-center space-x-2">
          <label className="cursor-pointer text-gray-500 hover:text-primary">
            <FaImage size={20} />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setImage(e.target.files[0])}
            />
          </label>
          <label className="cursor-pointer text-gray-500 hover:text-primary">
            <FaVideo size={20} />
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => setVideo(e.target.files[0])}
            />
          </label>
          <input
            value={text}
            onChange={handleTyping}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 border rounded-full px-4 py-2 outline-none"
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="bg-primary text-white p-2 rounded-full hover:bg-primary-dark disabled:opacity-50"
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
