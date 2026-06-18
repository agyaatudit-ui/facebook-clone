import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const newSocket = io('https://facebook-clone-api-52k8.onrender.com');
      newSocket.on('connect', () => {
        newSocket.emit('setup', user._id);
      });
      newSocket.on('online-users', (users) => setOnlineUsers(users));
      setSocket(newSocket);
      return () => { newSocket.disconnect(); setSocket(null); };
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
