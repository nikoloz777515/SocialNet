import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const ChatContext = createContext();
const API_URL = `${import.meta.env.VITE_API_URL}/api`;

const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
};

export const ChatProvider = ({ children }) => {
    const { user } = useAuth();
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState({});


    const [friends, setFriends] = useState([]);
    const [searchResults, setSearchResults] = useState([]);


    const fetchFriends = useCallback(async () => {
        if (!user) return;
        const token = getCookie('jwt');
        try {

            const res = await fetch(`${API_URL}/friend/friends`, {
                headers: { 'Authorization': `Bearer ${token}` },
                credentials: 'include'
            });
            const data = await res.json();
            if (res.ok) {

                setFriends(data.friends || []);
            }
        } catch (err) {
            console.error("Error fetching friends:", err);
        }
    }, [user]);


    useEffect(() => {
        if (user?._id) {
            fetchFriends();
        }
    }, [user?._id, fetchFriends]);

    useEffect(() => {
        if (user?._id) {
            const newSocket = io(import.meta.env.VITE_API_URL, { withCredentials: true });
            setSocket(newSocket);
            newSocket.emit('setup', user._id);
            newSocket.on('userStatusUpdate', (users) => setOnlineUsers(users));
            return () => newSocket.disconnect();
        }
    }, [user?._id]);

    const fetchMessages = useCallback(async (chatId) => {
        if (!chatId || !socket) return;
        const token = getCookie('jwt');
        try {
            socket.emit('join chat', chatId);
            const response = await fetch(`${API_URL}/message/${chatId}`, {
                headers: { 'Authorization': `Bearer ${token}` },
                credentials: 'include'
            });
            const data = await response.json();
            if (data.status === 'success') {
                setMessages(data.data);
            }
        } catch (err) {
            console.error("Fetch messages error:", err);
        }
    }, [socket]);

    useEffect(() => {
        if (activeChat?._id) fetchMessages(activeChat._id);
    }, [activeChat?._id, fetchMessages]);

    useEffect(() => {
        if (!socket) return;

        socket.on('message received', (newMessage) => {
            setMessages((prev) => {
                if (prev.some(m => m._id === newMessage._id)) return prev;
                return [...prev, newMessage];
            });
        });

        socket.on('message deleted', (deletedId) => {
            setMessages((prev) => prev.filter(m => m._id !== deletedId));
        });

        socket.on('message updated', (updatedMsg) => {
            setMessages((prev) => prev.map(m => m._id === updatedMsg._id ? updatedMsg : m));
        });

        return () => {
            socket.off('message received');
            socket.off('message deleted');
            socket.off('message updated');
        };
    }, [socket]);

    const sendMessage = async (content) => {
        if (!activeChat) return;
        const token = getCookie('jwt');
        let body;
        let headers = { 'Authorization': `Bearer ${token}` };

        if (content instanceof FormData) {
            body = content;
            if (activeChat.isGroup || activeChat.members) body.append('groupId', activeChat._id);
            else body.append('receiverId', activeChat._id);
        } else {
            headers['Content-Type'] = 'application/json';
            const payload = (activeChat.isGroup || activeChat.members)
                ? { groupId: activeChat._id, content }
                : { receiverId: activeChat._id, content };
            body = JSON.stringify(payload);
        }

        const res = await fetch(`${API_URL}/message`, {
            method: 'POST',
            headers: headers,
            body: body,
            credentials: 'include'
        });
        return await res.json();
    };

    const searchGroups = async (query) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }
        const token = getCookie('jwt');
        try {
            const res = await fetch(`${API_URL}/group/search?query=${query}`, {
                headers: { 'Authorization': `Bearer ${token}` },
                credentials: 'include'
            });
            const data = await res.json();
            if (data.status === 'success') {
                setSearchResults(data.data);
            }
        } catch (err) {
            console.error("Search error:", err);
        }
    };

    const joinGroup = async (groupId) => {
        const token = getCookie('jwt');
        try {
            const res = await fetch(`${API_URL}/group/${groupId}/join`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                credentials: 'include'
            });
            const data = await res.json();
            return data.status === 'success';
        } catch (err) {
            console.error("Join error:", err);
            return false;
        }
    };

    const deleteMessageAction = async (messageId) => {
        const token = getCookie('jwt');
        try {
            const res = await fetch(`${API_URL}/message/${messageId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
                credentials: 'include'
            });
            if (res.ok) {
                setMessages(prev => prev.filter(m => m._id !== messageId));
            }
        } catch (err) {
            console.error("Delete error:", err);
        }
    };

    const editMessageAction = async (messageId, newContent) => {
        const token = getCookie('jwt');
        try {
            const res = await fetch(`${API_URL}/message/${messageId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: newContent }),
                credentials: 'include'
            });
            const data = await res.json();
            if (res.ok) {
                setMessages(prev => prev.map(m => m._id === messageId ? data.data : m));
            }
            return data;
        } catch (err) {
            console.error("Edit error:", err);
        }
    };

    return (
        <ChatContext.Provider value={{
            activeChat,
            setActiveChat,
            messages,
            setMessages,
            sendMessage,
            socket,
            deleteMessageAction,
            editMessageAction,
            searchGroups,
            searchResults,
            joinGroup,
            friends,
            fetchFriends,
            onlineUsers
        }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => useContext(ChatContext);