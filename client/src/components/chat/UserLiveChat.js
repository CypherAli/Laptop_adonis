import React, { useState, useEffect, useRef, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageCircle, FiX, FiSend, FiUser, FiMinus } from 'react-icons/fi';
import AuthContext from '../../context/AuthContext';
import { io } from 'socket.io-client';
import './ChatWidget.css';

/**
 * User LiveChat Widget - Chat trực tiếp với Partner (giống GuestChat nhưng lưu lịch sử)
 * Logged-in users can chat with partners and save chat history
 */
const UserLiveChat = () => {
    const { user } = useContext(AuthContext);
    const [socket, setSocket] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messageInput, setMessageInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [partners, setPartners] = useState([]);
    const [selectedPartner, setSelectedPartner] = useState(null);
    const [activeConversation, setActiveConversation] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    
    // Draggable state
    const [position, setPosition] = useState({ x: 20, y: 20 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef({ x: 0, y: 0 });
    const positionRef = useRef({ x: 20, y: 20 });
    const chatWidgetRef = useRef(null);
    
    // Button draggable state - Position at bottom right corner
    const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
    const [isButtonDragging, setIsButtonDragging] = useState(false);
    const buttonDragStartRef = useRef({ x: 0, y: 0 });
    const buttonPositionRef = useRef({ x: 0, y: 0 });
    const buttonRef = useRef(null);

    // Initialize button position on mount
    useEffect(() => {
        const initialX = window.innerWidth - 100;
        const initialY = window.innerHeight - 100;
        setButtonPosition({ x: initialX, y: initialY });
        buttonPositionRef.current = { x: initialX, y: initialY };
    }, []);

    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3333/api';

    // Initialize socket connection for logged-in user
    useEffect(() => {
        if (!user) {
            console.log('⚠️ UserLiveChat: User not logged in');
            return;
        }

        const userId = user._id || user.id;
        if (!userId) {
            console.log('⚠️ UserLiveChat: User ID not available yet');
            return;
        }

        const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:3333', {
            transports: ['websocket', 'polling']
        });

        newSocket.on('connect', () => {
            console.log('✅ User socket connected:', newSocket.id);
            newSocket.emit('user:join', userId);
        });

        newSocket.on('message:received', (data) => {
            console.log('📨 Message received:', data);
            // Only add message if it's for current conversation
            if (data.conversationId === activeConversation?._id) {
                setMessages(prev => {
                    // Check for duplicate
                    const isDuplicate = prev.some(msg => 
                        msg._id === data.message._id || 
                        (msg.temp && msg.content === data.message.content && 
                         Math.abs(new Date(msg.createdAt) - new Date(data.message.createdAt)) < 1000)
                    );
                    
                    if (isDuplicate) {
                        // Replace temp message with real one
                        return prev.map(msg => 
                            msg.temp && msg.content === data.message.content 
                                ? { ...data.message, temp: false } 
                                : msg
                        );
                    }
                    
                    return [...prev, data.message];
                });
            }
        });

        newSocket.on('typing:active', ({ username }) => {
            setIsTyping(true);
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            typingTimeoutRef.current = setTimeout(() => {
                setIsTyping(false);
            }, 3000);
        });

        newSocket.on('typing:inactive', () => {
            setIsTyping(false);
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [user, activeConversation]);

    // Update socket event listeners when activeConversation changes
    useEffect(() => {
        if (socket && activeConversation) {
            socket.emit('conversation:join', activeConversation._id);
            
            return () => {
                socket.emit('conversation:leave', activeConversation._id);
            };
        }
    }, [socket, activeConversation]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Fetch active partners
    const fetchPartners = async () => {
        try {
            const response = await fetch(`${apiUrl}/chat/partners`);
            const data = await response.json();
            if (data.success) {
                setPartners(data.partners);
            }
        } catch (error) {
            console.error('Error fetching partners:', error);
        }
    };

    // Open chat
    const handleOpenChat = async () => {
        // Set chat position near the button
        const chatX = Math.max(0, Math.min(buttonPositionRef.current.x - 350, window.innerWidth - 400));
        const chatY = Math.max(0, Math.min(buttonPositionRef.current.y, window.innerHeight - 650));
        
        positionRef.current = { x: chatX, y: chatY };
        setPosition({ x: chatX, y: chatY });
        
        setIsOpen(true);
        setIsMinimized(false);
        
        if (partners.length === 0) {
            await fetchPartners();
        }
    };

    // Select partner and create conversation (with JWT auth for logged-in users)
    const handleSelectPartner = async (partner) => {
        try {
            const token = localStorage.getItem('token');
            
            const response = await fetch(`${apiUrl}/chat/conversations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify({
                    targetUserId: partner._id,
                    subject: 'Customer Inquiry'
                })
            });

            const data = await response.json();
            if (data.success) {
                setActiveConversation(data.conversation);
                setSelectedPartner(partner);
                await loadMessages(data.conversation._id);
            }
        } catch (error) {
            console.error('Error creating conversation:', error);
        }
    };

    // Load messages for conversation
    const loadMessages = async (conversationId) => {
        try {
            const response = await fetch(`${apiUrl}/chat/messages/${conversationId}`);
            const data = await response.json();
            if (data.success) {
                setMessages(data.messages);
            }
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    // Send message (saves to database for logged-in users)
    const handleSendMessage = (e) => {
        e.preventDefault();
        
        const userId = user?._id || user?.id;
        if (!messageInput.trim() || !socket || !activeConversation || !userId) return;

        // Emit message via socket
        socket.emit('message:send', {
            conversationId: activeConversation._id,
            content: messageInput.trim(),
            senderType: 'user',
            userId: userId,
            userName: user.name || user.username
        });

        // Add optimistic message
        const optimisticMessage = {
            _id: 'temp_' + Date.now(),
            conversation: activeConversation._id,
            content: messageInput.trim(),
            senderType: 'user',
            sender: userId,
            createdAt: new Date(),
            temp: true
        };
        
        setMessages(prev => [...prev, optimisticMessage]);
        setMessageInput('');
        
        // Stop typing
        if (socket) {
            socket.emit('typing:stop', { conversationId: activeConversation._id });
        }
    };

    // Handle input change with typing indicator
    const handleInputChange = (e) => {
        setMessageInput(e.target.value);

        if (!socket || !activeConversation || !user) return;

        socket.emit('typing:start', {
            conversationId: activeConversation._id,
            userName: user.name || user.username
        });

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('typing:stop', {
                conversationId: activeConversation._id
            });
        }, 3000);
    };

    const handleClose = () => {
        setIsOpen(false);
        setIsMinimized(false);
    };

    const handleMinimize = () => {
        setIsMinimized(!isMinimized);
    };

    // Drag handlers for chat window
    const handleMouseDown = (e) => {
        if (e.target.closest('.chat-widget-header')) {
            e.preventDefault();
            setIsDragging(true);
            dragStartRef.current = {
                x: e.clientX - positionRef.current.x,
                y: e.clientY - positionRef.current.y
            };
        }
    };

    const handleMouseMove = (e) => {
        if (isDragging) {
            e.preventDefault();
            const newX = e.clientX - dragStartRef.current.x;
            const newY = e.clientY - dragStartRef.current.y;
            
            const maxX = window.innerWidth - 400;
            const maxY = window.innerHeight - 600;
            
            const boundedX = Math.max(0, Math.min(newX, maxX));
            const boundedY = Math.max(0, Math.min(newY, maxY));
            
            positionRef.current = { x: boundedX, y: boundedY };
            
            if (chatWidgetRef.current) {
                chatWidgetRef.current.style.left = `${boundedX}px`;
                chatWidgetRef.current.style.top = `${boundedY}px`;
            }
        }
    };

    const handleMouseUp = () => {
        if (isDragging) {
            setIsDragging(false);
            setPosition(positionRef.current);
        }
    };

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isDragging]);

    // Button drag handlers
    const handleButtonMouseDown = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsButtonDragging(true);
        buttonDragStartRef.current = {
            x: e.clientX - buttonPositionRef.current.x,
            y: e.clientY - buttonPositionRef.current.y
        };
    };

    const handleButtonMouseMove = (e) => {
        if (isButtonDragging) {
            e.preventDefault();
            const newX = e.clientX - buttonDragStartRef.current.x;
            const newY = e.clientY - buttonDragStartRef.current.y;
            
            const maxX = window.innerWidth - 80;
            const maxY = window.innerHeight - 80;
            
            const boundedX = Math.max(0, Math.min(newX, maxX));
            const boundedY = Math.max(0, Math.min(newY, maxY));
            
            buttonPositionRef.current = { x: boundedX, y: boundedY };
            
            if (buttonRef.current) {
                buttonRef.current.style.left = `${boundedX}px`;
                buttonRef.current.style.top = `${boundedY}px`;
            }
        }
    };

    const handleButtonMouseUp = () => {
        if (isButtonDragging) {
            setIsButtonDragging(false);
            setButtonPosition(buttonPositionRef.current);
        }
    };

    const handleButtonClick = (e) => {
        if (!isButtonDragging) {
            handleOpenChat();
        }
    };

    useEffect(() => {
        if (isButtonDragging) {
            document.addEventListener('mousemove', handleButtonMouseMove);
            document.addEventListener('mouseup', handleButtonMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleButtonMouseMove);
                document.removeEventListener('mouseup', handleButtonMouseUp);
            };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isButtonDragging]);

    const formatTime = (date) => {
        const d = new Date(date);
        return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    // Only show for logged-in users (but check user exists first)
    if (!user) {
        return null;
    }

    // If user exists but no _id yet, show loading or still show button
    const userId = user._id || user.id;

    return (
        <>
            {/* Chat Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        ref={buttonRef}
                        className="chat-widget-button user-chat-button"
                        onClick={handleButtonClick}
                        onMouseDown={handleButtonMouseDown}
                        style={{
                            position: 'fixed',
                            left: `${buttonPosition.x}px`,
                            top: `${buttonPosition.y}px`,
                            right: 'auto',
                            bottom: 'auto',
                            cursor: isButtonDragging ? 'grabbing' : 'grab',
                            transition: isButtonDragging ? 'none' : 'transform 0.3s ease, box-shadow 0.3s ease'
                        }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        whileHover={{ scale: isButtonDragging ? 1 : 1.1 }}
                        whileTap={{ scale: isButtonDragging ? 1 : 0.9 }}
                    >
                        <FiMessageCircle size={24} />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        ref={chatWidgetRef}
                        className={`chat-widget-container ${isMinimized ? 'minimized' : ''} ${isDragging ? 'dragging' : ''}`}
                        style={{
                            position: 'fixed',
                            left: `${position.x}px`,
                            top: `${position.y}px`,
                            right: 'auto',
                            bottom: 'auto',
                            cursor: isDragging ? 'grabbing' : 'default',
                            transition: isDragging ? 'none' : 'box-shadow 0.3s ease'
                        }}
                        initial={{ opacity: 0, y: 50, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.8 }}
                    >
                        {/* Header */}
                        <div 
                            className="chat-widget-header"
                            onMouseDown={handleMouseDown}
                            style={{ cursor: 'grab' }}
                        >
                            <div className="chat-widget-header-info">
                                <div className="chat-avatar">
                                    <FiUser />
                                </div>
                                <div>
                                    <h4>{selectedPartner ? selectedPartner.shopName : 'Chọn Partner'}</h4>
                                    <span className="online-status">
                                        <span className="status-dot"></span>
                                        {selectedPartner ? 'Đang hoạt động' : 'Hỗ trợ khách hàng'}
                                    </span>
                                </div>
                            </div>
                            <div className="chat-widget-actions">
                                <button onClick={handleMinimize} className="chat-action-btn">
                                    <FiMinus />
                                </button>
                                <button onClick={handleClose} className="chat-action-btn">
                                    <FiX />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        {!isMinimized && (
                            <>
                                {!selectedPartner ? (
                                    <div className="partner-selection">
                                        <h3>Chọn Partner để chat:</h3>
                                        <div className="partner-list">
                                            {partners.map(partner => (
                                                <div
                                                    key={partner._id}
                                                    className="partner-item"
                                                    onClick={() => handleSelectPartner(partner)}
                                                >
                                                    <div className="partner-avatar">
                                                        <FiUser />
                                                    </div>
                                                    <div className="partner-info">
                                                        <h4>{partner.shopName}</h4>
                                                        <p>{partner.email}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {/* Messages */}
                                        <div className="chat-widget-messages">
                                            {messages.length === 0 ? (
                                                <div className="chat-empty">
                                                    <FiMessageCircle size={48} />
                                                    <p>Bắt đầu cuộc trò chuyện</p>
                                                </div>
                                            ) : (
                                                messages.map((msg) => (
                                                    <div
                                                        key={msg._id}
                                                        className={`message ${
                                                            msg.senderType === 'user' || msg.sender === userId ? 'sent' : 'received'
                                                        } ${msg.temp ? 'temp' : ''}`}
                                                    >
                                                        <div className="message-content">
                                                            <p>{msg.content}</p>
                                                            <span className="message-time">
                                                                {formatTime(msg.createdAt)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                            {isTyping && (
                                                <div className="typing-indicator">
                                                    <span></span>
                                                    <span></span>
                                                    <span></span>
                                                </div>
                                            )}
                                            <div ref={messagesEndRef} />
                                        </div>

                                        {/* Input */}
                                        <form className="chat-widget-input" onSubmit={handleSendMessage}>
                                            <input
                                                type="text"
                                                placeholder="Nhập tin nhắn..."
                                                value={messageInput}
                                                onChange={handleInputChange}
                                            />
                                            <button type="submit" disabled={!messageInput.trim()}>
                                                <FiSend />
                                            </button>
                                        </form>
                                    </>
                                )}
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default UserLiveChat;
