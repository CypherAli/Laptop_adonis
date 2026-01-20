import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { io } from 'socket.io-client';
import AuthContext from './AuthContext';
import axios from '../api/axiosConfig';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const { user, token } = useContext(AuthContext);
    const [socket, setSocket] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const [typingUsers, setTypingUsers] = useState(new Set());
    const [loading, setLoading] = useState(false);

    // Fetch conversations
    const fetchConversations = useCallback(async () => {
        if (!token) return;
        
        setLoading(true);
        try {
            const res = await axios.get('/chat/conversations');
            setConversations(res.data.conversations || []);
        } catch (error) {
            console.error('Fetch conversations error:', error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    // Fetch unread count
    const fetchUnreadCount = useCallback(async () => {
        if (!token) return;
        
        try {
            const res = await axios.get('/chat/unread-count');
            setUnreadCount(res.data.unreadCount || 0);
        } catch (error) {
            console.error('Fetch unread count error:', error);
        }
    }, [token]);

    // Initialize Socket.IO connection
    useEffect(() => {
        if (user && token) {
            const newSocket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:3333', {
                auth: { token },
                transports: ['websocket', 'polling']
            });

            newSocket.on('connect', () => {
                console.log('✅ Socket connected:', newSocket.id);
                newSocket.emit('user:join', user.id);
            });

            newSocket.on('user:online', (userId) => {
                setOnlineUsers(prev => new Set([...prev, userId]));
            });

            newSocket.on('user:offline', (userId) => {
                setOnlineUsers(prev => {
                    const updated = new Set(prev);
                    updated.delete(userId);
                    return updated;
                });
            });

            newSocket.on('message:received', (message) => {
                setMessages(prev => [...prev, message]);
            });

            newSocket.on('notification:new_message', (data) => {
                // Show notification
                if (Notification.permission === 'granted') {
                    new Notification('Tin nhắn mới', {
                        body: data.message.message.substring(0, 50),
                        icon: '/logo192.png'
                    });
                }
            });

            newSocket.on('typing:active', ({ userId, username }) => {
                setTypingUsers(prev => new Set([...prev, `${userId}:${username}`]));
            });

            newSocket.on('typing:stop', ({ userId }) => {
                setTypingUsers(prev => {
                    const updated = new Set(prev);
                    [...updated].forEach(item => {
                        if (item.startsWith(userId)) {
                            updated.delete(item);
                        }
                    });
                    return updated;
                });
            });

            newSocket.on('messages:read', ({ userId }) => {
                // Update UI to show messages as read
                console.log(`Messages read by user: ${userId}`);
            });

            newSocket.on('error', (error) => {
                console.error('Socket error:', error);
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
            };
        }
    }, [user, token]);

    // Fetch messages for a conversation
    const fetchMessages = useCallback(async (conversationId) => {
        if (!token || !conversationId) return;
        
        setLoading(true);
        try {
            const res = await axios.get(`/chat/conversations/${conversationId}/messages`);
            setMessages(res.data.messages || []);
            
            // Join socket room
            if (socket) {
                socket.emit('conversation:join', conversationId);
            }
            
            // Mark as read
            await axios.put(`/chat/conversations/${conversationId}/read`);
            fetchUnreadCount();
        } catch (error) {
            console.error('Fetch messages error:', error);
        } finally {
            setLoading(false);
        }
    }, [token, socket, fetchUnreadCount]);

    // Create or get conversation
    const createConversation = useCallback(async (targetUserId, subject = 'Hỗ trợ khách hàng') => {
        if (!token) return null;
        
        try {
            const res = await axios.post('/chat/conversations', {
                targetUserId,
                subject
            });
            
            const conversation = res.data.conversation;
            setActiveConversation(conversation);
            
            if (!res.data.isNew) {
                // Load existing messages
                await fetchMessages(conversation._id);
            }
            
            fetchConversations();
            return conversation;
        } catch (error) {
            console.error('Create conversation error:', error);
            return null;
        }
    }, [token, fetchMessages, fetchConversations]);

    // Send message
    const sendMessage = useCallback((conversationId, message, attachments = []) => {
        if (!socket || !user) return;

        socket.emit('message:send', {
            conversationId,
            message,
            senderId: user.id,
            senderRole: user.role,
            attachments
        });

        // Optimistically add message to UI
        const optimisticMessage = {
            _id: Date.now(),
            conversation: conversationId,
            sender: { _id: user.id, username: user.username, role: user.role },
            message,
            createdAt: new Date(),
            temp: true
        };
        setMessages(prev => [...prev, optimisticMessage]);
    }, [socket, user]);

    // Send typing indicator
    const sendTyping = useCallback((conversationId, isTyping) => {
        if (!socket || !user) return;

        if (isTyping) {
            socket.emit('typing:start', {
                conversationId,
                userId: user.id,
                username: user.username
            });
        } else {
            socket.emit('typing:stop', {
                conversationId,
                userId: user.id
            });
        }
    }, [socket, user]);

    // Load conversations and unread count on mount
    useEffect(() => {
        if (user && token) {
            fetchConversations();
            fetchUnreadCount();
            
            // Request notification permission
            if (Notification.permission === 'default') {
                Notification.requestPermission();
            }
        }
    }, [user, token, fetchConversations, fetchUnreadCount]);

    const value = {
        socket,
        conversations,
        activeConversation,
        messages,
        unreadCount,
        onlineUsers,
        typingUsers,
        loading,
        setActiveConversation,
        fetchConversations,
        fetchMessages,
        createConversation,
        sendMessage,
        sendTyping,
        fetchUnreadCount
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};

export default ChatContext;
