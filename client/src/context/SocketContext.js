import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [newMessage, setNewMessage] = useState(null);
  const socketRef = useRef(null);

// In single-host mode Socket.IO runs on the same server that serves the
  // frontend, so we connect to the current host (no hardcoded port).
  const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || window.location.origin;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const newSocket = io(SOCKET_URL, {
      auth: { token },
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on('online-users', (users) => {
      setOnlineUsers(users);
    });

    newSocket.on('user-online', ({ userId }) => {
      setOnlineUsers((prev) => (prev.includes(userId) ? prev : [...prev, userId]));
    });

    newSocket.on('user-offline', ({ userId }) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== userId));
    });

    newSocket.on('notification', (data) => {
      setNotifications((prev) => [data, ...prev]);
    });

    newSocket.on('message-received', (message) => {
      setNewMessage(message);
    });

    newSocket.on('new-message', (data) => {
      setNewMessage(data.message);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [SOCKET_URL]);

  // Emit message send
  const emitSendMessage = (data) => {
    if (socketRef.current) {
      socketRef.current.emit('send-message', data);
    }
  };

  const emitTyping = (data) => {
    if (socketRef.current) {
      socketRef.current.emit('typing', data);
    }
  };

  const emitMessageSeen = (data) => {
    if (socketRef.current) {
      socketRef.current.emit('message-seen', data);
    }
  };

  const emitNotify = (data) => {
    if (socketRef.current) {
      socketRef.current.emit('notify', data);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
        notifications,
        newMessage,
        emitSendMessage,
        emitTyping,
        emitMessageSeen,
        emitNotify,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
