import React, { useState, useEffect, useRef, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageCircle, FiX, FiSend, FiMinus, FiMaximize2, FiUsers } from 'react-icons/fi';
import AuthContext from '../../context/AuthContext';
import axios from 'axios';
import './PartnerChatWidget.css';

const AnonymousChatWidget = () => {
    const { user } = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [showPartnerList, setShowPartnerList] = useState(true);
    const [selectedPartner, setSelectedPartner] = useState(null);
    const [messageInput, setMessageInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(false);
    const [conversationId, setConversationId] = useState(null);
    const [anonymousId, setAnonymousId] = useState(null);
    const [anonymousName, setAnonymousName] = useState('Khách');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef(null);
    const pollingIntervalRef = useRef(null);
    
    // Single position state for both button and chat box - they move together
    const [widgetPosition, setWidgetPosition] = useState(() => {
        const saved = localStorage.getItem('chatWidgetPosition');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                return { x: window.innerWidth - 424, y: window.innerHeight - 650 };
            }
        }
        // Default position: bottom-right corner (chat box sized)
        return { x: window.innerWidth - 424, y: window.innerHeight - 650 };
    });
    
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef({ x: 0, y: 0 });
    const widgetRef = useRef(null);

    // Update widget position on resize - keep within bounds
    useEffect(() => {
        const handleResize = () => {
            const chatBoxWidth = 400;
            const chatBoxHeight = 600;
            const padding = 10;
            setWidgetPosition(prev => ({
                x: Math.max(padding, Math.min(prev.x, window.innerWidth - chatBoxWidth - padding)),
                y: Math.max(padding, Math.min(prev.y, window.innerHeight - chatBoxHeight - padding))
            }));
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Get or create anonymous ID
    useEffect(() => {
        let id = localStorage.getItem('anonymousId');
        if (!id) {
            id = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('anonymousId', id);
        }
        setAnonymousId(id);

        const name = localStorage.getItem('anonymousName') || 'Guest';
        setAnonymousName(name);
    }, []);

    useEffect(() => {
        if (isOpen && partners.length === 0) {
            fetchPartners();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Polling for new messages (for anonymous users without socket)
    useEffect(() => {
        if (conversationId && !user) {
            // Start polling every 3 seconds
            pollingIntervalRef.current = setInterval(() => {
                fetchMessages(conversationId);
            }, 3000);

            return () => {
                if (pollingIntervalRef.current) {
                    clearInterval(pollingIntervalRef.current);
                }
            };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversationId, user]);

    const getHeaders = () => {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (user) {
            headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
        } else {
            headers['X-Anonymous-Id'] = anonymousId;
            headers['X-Anonymous-Name'] = anonymousName;
        }

        return headers;
    };

    const fetchPartners = async () => {
        try {
            setLoading(true);
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
            const response = await axios.get(`${apiUrl}/partner/list-active`, {
                headers: user ? { 'Authorization': `Bearer ${localStorage.getItem('token')}` } : {}
            });
            
            if (response.data.success) {
                setPartners(response.data.partners || []);
            }
        } catch (error) {
            console.error('Error fetching partners:', error);
        } finally {
            setLoading(false);
        }
    };

    const createOrGetConversation = async (partnerId) => {
        try {
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
            const response = await axios.post(
                `${apiUrl}/chat/conversations`,
                {
                    targetUserId: partnerId,
                    subject: 'Product Consultation'
                },
                { headers: getHeaders() }
            );

            if (response.data.success) {
                const convId = response.data.conversation._id;
                setConversationId(convId);
                
                // Save conversation ID for this partner
                if (!user) {
                    localStorage.setItem(`conversation_${partnerId}`, convId);
                }
                
                return convId;
            }
        } catch (error) {
            console.error('Error creating conversation:', error);
            return null;
        }
    };

    const fetchMessages = async (convId) => {
        try {
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
            const response = await axios.get(
                `${apiUrl}/chat/conversations/${convId}/messages`,
                { headers: getHeaders() }
            );

            if (response.data.success) {
                setMessages(response.data.messages || []);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleOpenChat = () => {
        setIsOpen(true);
        setIsMinimized(false);
    };

    const handleClose = () => {
        // Normalize position so button stays in viewport when chat closes
        const buttonX = positionRef.current.x + 340;
        const buttonY = positionRef.current.y + 540;
        const padding = 20;
        const buttonSize = 60;
        
        // Ensure button is within viewport bounds
        let newWidgetX = positionRef.current.x;
        let newWidgetY = positionRef.current.y;
        
        // If button would be outside right edge
        if (buttonX + buttonSize > window.innerWidth - padding) {
            newWidgetX = window.innerWidth - padding - buttonSize - 340;
        }
        // If button would be outside left edge  
        if (buttonX < padding) {
            newWidgetX = padding - 340;
        }
        // If button would be outside bottom edge
        if (buttonY + buttonSize > window.innerHeight - padding) {
            newWidgetY = window.innerHeight - padding - buttonSize - 540;
        }
        // If button would be outside top edge
        if (buttonY < padding) {
            newWidgetY = padding - 540;
        }
        
        // Update position if needed
        if (newWidgetX !== positionRef.current.x || newWidgetY !== positionRef.current.y) {
            positionRef.current = { x: newWidgetX, y: newWidgetY };
            setWidgetPosition({ x: newWidgetX, y: newWidgetY });
            localStorage.setItem('chatWidgetPosition', JSON.stringify(positionRef.current));
        }
        
        setIsOpen(false);
        setIsMinimized(false);
        setShowPartnerList(true);
        setSelectedPartner(null);
        setConversationId(null);
        
        // Stop polling
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
        }
    };

    const handleMinimize = () => {
        setIsMinimized(!isMinimized);
    };

    // Double-click anywhere on chat box to close it (for when X button is not accessible)
    const handleDoubleClick = (e) => {
        // Don't close if double-clicking on input or message area (user might be selecting text)
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        handleClose();
    };

    const handleSelectPartner = async (partner) => {
        setSelectedPartner(partner);
        setShowPartnerList(false);
        
        // Clear old anonymous conversation IDs when logged in
        if (user) {
            // Don't use localStorage conversation ID for authenticated users
            const convId = await createOrGetConversation(partner._id);
            if (convId) {
                await fetchMessages(convId);
            }
        } else {
            // For anonymous users, try to get existing conversation ID from localStorage
            let convId = localStorage.getItem(`conversation_${partner._id}`);
            
            // Create or get conversation
            if (!convId) {
                convId = await createOrGetConversation(partner._id);
            } else {
                setConversationId(convId);
            }
            
            // Fetch messages
            if (convId) {
                await fetchMessages(convId);
            }
        }
    };

    const handleBackToList = () => {
        setShowPartnerList(true);
        setSelectedPartner(null);
        setMessages([]);
        setConversationId(null);
        
        // Stop polling
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        
        if (!messageInput.trim() || !conversationId || isSending) return;

        setIsSending(true);
        
        // Temporarily stop polling to avoid conflicts
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
        }
        
        const tempId = `temp_${Date.now()}`;
        const messageData = {
            _id: tempId,
            message: messageInput.trim(),
            senderRole: user ? user.role : 'anonymous',
            anonymousName: user ? null : anonymousName,
            sender: user ? { username: user.username, _id: user._id } : null,
            createdAt: new Date(),
            isTemp: true
        };

        // Add to UI immediately
        setMessages(prev => [...prev, messageData]);
        const messageCopy = messageInput.trim();
        setMessageInput('');

        try {
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
            const response = await axios.post(
                `${apiUrl}/chat/conversations/${conversationId}/messages`,
                { message: messageCopy },
                { headers: getHeaders() }
            );

            if (response.data.success) {
                // Replace temp message with real one
                setMessages(prev => 
                    prev.map(msg => 
                        msg._id === tempId ? { ...response.data.message, isTemp: false } : msg
                    )
                );
            }
        } catch (error) {
            console.error('Error sending message:', error);
            // Remove temp message if failed
            setMessages(prev => prev.filter(msg => msg._id !== tempId));
            
            // Show user-friendly error message
            const errorMsg = error.response?.data?.message || 'Không thể gửi tin nhắn. Vui lòng thử lại.';
            alert(errorMsg);
        } finally {
            setIsSending(false);
            
            // Restart polling for anonymous users after a short delay
            if (!user && conversationId) {
                setTimeout(() => {
                    if (!pollingIntervalRef.current && conversationId) {
                        pollingIntervalRef.current = setInterval(() => {
                            fetchMessages(conversationId);
                        }, 3000);
                    }
                }, 1000);
            }
        }
    };

    const formatTime = (date) => {
        const d = new Date(date);
        return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    const getSenderName = (msg) => {
        if (msg.senderRole === 'anonymous') {
            return msg.anonymousName || 'Guest';
        }
        if (msg.sender) {
            return msg.sender.shopName || msg.sender.username || 'Partner';
        }
        return 'User';
    };

    const isOwnMessage = (msg) => {
        if (user) {
            return msg.sender && msg.sender._id === (user._id || user.id);
        } else {
            return msg.senderRole === 'anonymous' && msg.anonymousId === anonymousId;
        }
    };

    // Refs for drag state to avoid closure issues
    const isDraggingRef = useRef(false);
    const positionRef = useRef(widgetPosition);
    const hasDraggedRef = useRef(false);

    // Keep refs in sync
    useEffect(() => {
        positionRef.current = widgetPosition;
    }, [widgetPosition]);

    // Ensure button stays in viewport on window resize
    useEffect(() => {
        const handleResize = () => {
            const buttonX = positionRef.current.x + 340;
            const buttonY = positionRef.current.y + 540;
            const padding = 20;
            const buttonSize = 60;
            
            let newWidgetX = positionRef.current.x;
            let newWidgetY = positionRef.current.y;
            let needsUpdate = false;
            
            // If button would be outside right edge
            if (buttonX + buttonSize > window.innerWidth - padding) {
                newWidgetX = window.innerWidth - padding - buttonSize - 340;
                needsUpdate = true;
            }
            // If button would be outside bottom edge
            if (buttonY + buttonSize > window.innerHeight - padding) {
                newWidgetY = window.innerHeight - padding - buttonSize - 540;
                needsUpdate = true;
            }
            
            if (needsUpdate) {
                positionRef.current = { x: newWidgetX, y: newWidgetY };
                setWidgetPosition({ x: newWidgetX, y: newWidgetY });
                localStorage.setItem('chatWidgetPosition', JSON.stringify(positionRef.current));
            }
        };
        
        window.addEventListener('resize', handleResize);
        // Also check on mount
        handleResize();
        
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Unified drag handler - works for both button and chat box header
    const handleDragStart = (e, isFromHeader = false) => {
        // Only block drag if clicking buttons INSIDE header (close, minimize buttons)
        // Don't block if this IS the messenger button itself (isFromHeader=false)
        if (isFromHeader && (e.target.tagName === 'BUTTON' || e.target.closest('button'))) {
            return;
        }
        
        e.preventDefault();
        e.stopPropagation();
        
        isDraggingRef.current = true;
        hasDraggedRef.current = false;
        setIsDragging(true);
        
        // For button: need to calculate offset from button position to widget position
        // Button is at (widgetPosition.x + 340, widgetPosition.y + 540)
        let offsetX, offsetY;
        if (isFromHeader) {
            // Dragging from header - click pos relative to widget top-left
            offsetX = e.clientX - positionRef.current.x;
            offsetY = e.clientY - positionRef.current.y;
        } else {
            // Dragging from button - button is at bottom-right corner
            // Button position: (widget.x + 340, widget.y + 540)
            offsetX = e.clientX - (positionRef.current.x + 340);
            offsetY = e.clientY - (positionRef.current.y + 540);
        }
        
        dragStartRef.current = { x: offsetX, y: offsetY, isFromHeader };
        
        const handleMouseMove = (moveEvent) => {
            if (!isDraggingRef.current) return;
            
            hasDraggedRef.current = true;
            const chatBoxWidth = 400;
            const padding = 10;
            
            let newX, newY;
            if (dragStartRef.current.isFromHeader) {
                newX = moveEvent.clientX - dragStartRef.current.x;
                newY = moveEvent.clientY - dragStartRef.current.y;
            } else {
                // From button - convert back to widget position
                newX = moveEvent.clientX - dragStartRef.current.x - 340;
                newY = moveEvent.clientY - dragStartRef.current.y - 540;
            }
            
            // Constrain: only prevent going off-screen completely
            // Allow negative y so chat box can go lower (button visible)
            const minX = padding - 340; // Allow button to be at left edge
            const maxX = window.innerWidth - 70; // Button at right edge
            const minY = padding - 540; // Allow button to be at top edge  
            const maxY = window.innerHeight - 70; // Button at bottom edge
            
            newX = Math.max(minX, Math.min(newX, maxX));
            newY = Math.max(minY, Math.min(newY, maxY));
            
            positionRef.current = { x: newX, y: newY };
            setWidgetPosition({ x: newX, y: newY });
        };

        const handleMouseUp = () => {
            isDraggingRef.current = false;
            setIsDragging(false);
            
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            
            // Save position
            localStorage.setItem('chatWidgetPosition', JSON.stringify(positionRef.current));
        };
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    // Touch handlers for header (chat box) - separate from button
    const handleHeaderTouchStart = (e) => {
        // Only prevent drag if clicking buttons INSIDE header (close, minimize)
        if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
            return;
        }
        
        const touch = e.touches[0];
        isDraggingRef.current = true;
        hasDraggedRef.current = false;
        setIsDragging(true);
        
        dragStartRef.current = {
            x: touch.clientX - positionRef.current.x,
            y: touch.clientY - positionRef.current.y,
            isFromHeader: true
        };
    };

    // Touch handlers for button (messenger button)
    const handleButtonTouchStart = (e) => {
        const touch = e.touches[0];
        isDraggingRef.current = true;
        hasDraggedRef.current = false;
        setIsDragging(true);
        
        // Button is at widget position + offset
        dragStartRef.current = {
            x: touch.clientX - (positionRef.current.x + 340),
            y: touch.clientY - (positionRef.current.y + 540),
            isFromHeader: false
        };
    };

    const handleTouchMove = (e) => {
        if (!isDraggingRef.current) return;
        e.preventDefault();
        
        hasDraggedRef.current = true;
        const touch = e.touches[0];
        const padding = 10;
        
        let newX, newY;
        if (dragStartRef.current.isFromHeader) {
            newX = touch.clientX - dragStartRef.current.x;
            newY = touch.clientY - dragStartRef.current.y;
        } else {
            // From button - convert back to widget position
            newX = touch.clientX - dragStartRef.current.x - 340;
            newY = touch.clientY - dragStartRef.current.y - 540;
        }
        
        // Same constraints as mouse
        const minX = padding - 340;
        const maxX = window.innerWidth - 70;
        const minY = padding - 540;
        const maxY = window.innerHeight - 70;
        
        newX = Math.max(minX, Math.min(newX, maxX));
        newY = Math.max(minY, Math.min(newY, maxY));
        
        positionRef.current = { x: newX, y: newY };
        setWidgetPosition({ x: newX, y: newY });
    };

    const handleTouchEnd = () => {
        isDraggingRef.current = false;
        setIsDragging(false);
        localStorage.setItem('chatWidgetPosition', JSON.stringify(positionRef.current));
    };

    // Handle click (only if not dragged)
    const handleButtonClick = (e) => {
        // Only trigger click if mouse hasn't moved (not a drag)
        if (!hasDraggedRef.current) {
            handleOpenChat();
        }
        hasDraggedRef.current = false;
    };

    // Calculate button position (bottom-right of chat box area)
    const getButtonPosition = () => ({
        left: widgetPosition.x + 340, // 400 - 60
        top: widgetPosition.y + 540,  // 600 - 60
    });

    return (
        <>
            {/* Chat Button - Native Draggable */}
            {!isOpen && (
                <button
                    ref={widgetRef}
                    className="partner-chat-button"
                    onMouseDown={(e) => handleDragStart(e, false)}
                    onTouchStart={handleButtonTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onClick={handleButtonClick}
                    style={{
                        position: 'fixed',
                        ...getButtonPosition(),
                        transform: isDragging ? 'scale(1.05)' : 'scale(1)',
                        boxShadow: isDragging 
                            ? '0 15px 40px rgba(51, 102, 204, 0.7)' 
                            : '0 8px 24px rgba(51, 102, 204, 0.4)',
                    }}
                    title="💬 Chat với Shop - Kéo thả để di chuyển"
                >
                    <FiMessageCircle size={24} />
                </button>
            )}

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className={`partner-chat-container ${isMinimized ? 'minimized' : ''} ${isDragging ? 'dragging' : ''}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        onDoubleClick={handleDoubleClick}
                        style={{
                            left: widgetPosition.x,
                            top: widgetPosition.y,
                        }}
                    >
                        {/* Header - Draggable */}
                        <div 
                            className="partner-chat-header"
                            onMouseDown={(e) => handleDragStart(e, true)}
                            onTouchStart={handleHeaderTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                            title="Kéo để di chuyển"
                        >
                            <div className="header-left">
                                {!showPartnerList && selectedPartner && (
                                    <button 
                                        onClick={handleBackToList}
                                        className="back-button"
                                        title="Back to list"
                                    >
                                        ←
                                    </button>
                                )}
                                <FiMessageCircle size={20} />
                                <h4>
                                    {showPartnerList 
                                        ? 'Select Shop' 
                                        : selectedPartner?.name || selectedPartner?.businessName || 'Shop'}
                                </h4>
                                {!user && (
                                    <span className="anonymous-indicator" title={`ID: ${anonymousId}`}>
                                        (Guest)
                                    </span>
                                )}
                            </div>
                            <div className="header-actions">
                                <button onClick={handleMinimize} title={isMinimized ? "Expand" : "Minimize"}>
                                    {isMinimized ? <FiMaximize2 size={18} /> : <FiMinus size={18} />}
                                </button>
                                <button onClick={handleClose} title="Close">
                                    <FiX size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        {!isMinimized && (
                            <div className="partner-chat-content">
                                {showPartnerList ? (
                                    // Partner List
                                    <div className="partner-list">
                                        {!user && (
                                            <div className="anonymous-notice">
                                                <p>💬 You are chatting as a guest</p>
                                                <small>Login to save chat history</small>
                                            </div>
                                        )}
                                        {loading ? (
                                            <div className="loading-state">
                                                <div className="spinner"></div>
                                                <p>Loading shop list...</p>
                                            </div>
                                        ) : partners.length === 0 ? (
                                            <div className="empty-state">
                                                <FiUsers size={48} />
                                                <p>No shops available</p>
                                            </div>
                                        ) : (
                                            <div className="partner-items">
                                                {partners.map((partner) => (
                                                    <motion.div
                                                        key={partner._id}
                                                        className="partner-item"
                                                        onClick={() => handleSelectPartner(partner)}
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                    >
                                                        <div className="partner-avatar">
                                                            {partner.name?.charAt(0) || partner.businessName?.charAt(0) || 'S'}
                                                        </div>
                                                        <div className="partner-info">
                                                            <h5>{partner.name || partner.businessName || 'Shop'}</h5>
                                                            <p>{partner.email}</p>
                                                        </div>
                                                        <div className="partner-status online">●</div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    // Chat Messages
                                    <>
                                        <div className="messages-container">
                                            {messages.length === 0 ? (
                                                <div className="empty-chat">
                                                    <FiMessageCircle size={48} />
                                                    <p>Start conversation</p>
                                                    {!user && (
                                                        <small>You can ask about products, prices...</small>
                                                    )}
                                                </div>
                                            ) : (
                                                messages.map((msg) => (
                                                    <motion.div
                                                        key={msg._id}
                                                        className={`message ${isOwnMessage(msg) ? 'sent' : 'received'} ${msg.isTemp ? 'temp' : ''}`}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                    >
                                                        <div className="message-sender">
                                                            {getSenderName(msg)}
                                                        </div>
                                                        <div className="message-content">
                                                            {msg.message}
                                                        </div>
                                                        <div className="message-time">
                                                            {formatTime(msg.createdAt)}
                                                            {msg.isTemp && ' • Sending...'}
                                                        </div>
                                                    </motion.div>
                                                ))
                                            )}
                                            <div ref={messagesEndRef} />
                                        </div>

                                        {/* Input Form */}
                                        <form className="message-input-form" onSubmit={handleSendMessage}>
                                            <input
                                                type="text"
                                                className="message-input"
                                                placeholder={user ? "Type a message..." : "Type your question..."}
                                                value={messageInput}
                                                onChange={(e) => setMessageInput(e.target.value)}
                                            />
                                            <button
                                                type="submit"
                                                className="send-button"
                                                disabled={!messageInput.trim() || isSending}
                                                title={isSending ? 'Đang gửi...' : 'Gửi tin nhắn'}
                                            >
                                                <FiSend size={18} />
                                            </button>
                                        </form>
                                    </>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AnonymousChatWidget;
