// src/pages/MessageList/MessageList.jsx (Using Standard CSS Classes)

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import moment from 'moment';
import { IoMailOutline, IoChatbubblesOutline, IoCheckmarkCircleOutline } from 'react-icons/io5';
import './MessageList.css'; // Import the CSS file

const MessageList = ({ url }) => {
    
    const adminToken = localStorage.getItem("adminToken"); 

    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState(null); 
    const [replyText, setReplyText] = useState('');
    const [newMsgCount, setNewMsgCount] = useState(0); // 🎯 NEW: State for unread count

    // ✅ NEW FUNCTION: Fetch the count of unread messages (isRead: false)
    const fetchNewMessagesCount = useCallback(async () => {
        if (!adminToken) return;

        try {
            // Note: We'll create this /api/message/newcount endpoint in the backend
            const response = await axios.get(url + "/api/message/newcount", {
                headers: { token: adminToken }
            });
            
            if (response.data.success) {
                const count = response.data.count;
                setNewMsgCount(count);

                // 🎯 Toast Notification Logic
                if (count > 0) {
                    toast.info(`📧 You have ${count} new support message${count > 1 ? 's' : ''}!`, {
                        position: "top-right",
                        autoClose: 5000, // Make it persistent for 5 seconds
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        // Unique ID to prevent duplicate toast messages if the count is the same
                        toastId: "newMessagesNotification" 
                    });
                } else {
                    // Close the persistent toast if the count drops to zero
                    toast.dismiss("newMessagesNotification");
                }
            }
        } catch (error) {
            console.error("Error fetching new message count:", error);
        }
    }, [url, adminToken]); // Dependency array for useCallback


    const fetchMessages = useCallback(async () => {
        setLoading(true);
        if (!adminToken) {
            toast.error("Admin authentication failed. Please log in.");
            setLoading(false);
            return;
        }
        try {
            const response = await axios.get(url + "/api/message/list", {
                headers: { token: adminToken } 
            });

            if (response.data.success) {
                // Sort: Unread (false) first, then by latest timestamp
                const sortedMessages = response.data.data.sort((a, b) => {
                    if (a.isRead !== b.isRead) {
                        return a.isRead - b.isRead; 
                    }
                    return new Date(b.timestamp) - new Date(a.timestamp);
                });
                setMessages(sortedMessages);
                
                // 🎯 Action: Recalculate and update local count from fetched data
                const unreadCount = response.data.data.filter(msg => !msg.isRead).length;
                setNewMsgCount(unreadCount);

            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error("Error fetching messages.");
            console.error("Error fetching messages:", error);
        } finally {
            setLoading(false);
        }
    }, [url, adminToken]);

    const handleReply = async (messageId) => {
        if (replyText.trim() === "") {
            toast.error("Reply cannot be empty.");
            return;
        }
        if (!adminToken) {
            toast.error("Admin authentication failed.");
            return;
        }

        try {
            const response = await axios.post(url + "/api/message/reply", {
                messageId,
                replyText
            }, {
                headers: { token: adminToken }
            });

            if (response.data.success) {
                toast.success("Reply sent and message marked as resolved.");
                setReplyingTo(null);
                setReplyText('');
                fetchMessages(); 
                
                // 🎯 Action: Immediately update the count state on successful reply
                setNewMsgCount(prevCount => Math.max(0, prevCount - 1));

            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error("Error sending reply.");
            console.error("Error sending reply:", error);
        }
    };

    // ✅ NEW LOGIC: Set up initial fetch and Polling Interval
    useEffect(() => {
        fetchMessages(); // Initial fetch
        
        // Polling: Check for new messages every 15 seconds
        const intervalId = setInterval(fetchNewMessagesCount, 15000); 

        // Cleanup function
        return () => clearInterval(intervalId); 
    }, [fetchMessages, fetchNewMessagesCount]); 
    
    // ✅ NEW LOGIC: Mark message as read when the admin clicks/opens the reply form
    const handleOpenReply = async (message) => {
        setReplyingTo(message._id);
        setReplyText('');

        if (!message.isRead && adminToken) {
            try {
                // Endpoint to specifically mark a message as read without replying
                await axios.post(url + "/api/message/markread", { messageId: message._id }, {
                    headers: { token: adminToken }
                });

                // Update local state and count
                setMessages(prev => prev.map(msg => 
                    msg._id === message._id ? { ...msg, isRead: true } : msg
                ));
                setNewMsgCount(prevCount => Math.max(0, prevCount - 1));
            } catch (error) {
                console.error("Error marking message as read:", error);
            }
        }
    }


    return (
        <div className="message-list-page">
            <h2 className="page-title">
                <IoMailOutline className="title-icon" />
                Customer Support Inbox 
                {/* 🎯 Display the count near the title */}
                {newMsgCount > 0 && (
                    <span className="status-tag tag-new pulse-text">{newMsgCount} NEW</span>
                )}
            </h2>
            
            {loading ? (
                <div className="loading-message">Loading messages...</div>
            ) : messages.length === 0 ? (
                <div className="inbox-empty-message">
                    <IoCheckmarkCircleOutline className="empty-icon" />
                    <p>Inbox Zero! No new messages.</p>
                </div>
            ) : (
                <div className="message-list-container">
                    {messages.map((message) => {
                        const isNew = !message.isRead;
                        const isReplying = replyingTo === message._id;

                        return (
                            <div 
                                key={message._id} 
                                // 🎯 Use handleOpenReply to mark as read on click
                                onClick={isNew ? () => handleOpenReply(message) : undefined} 
                                className={`message-container ${isNew ? 'new-message' : 'resolved-message'}`}
                            >
                                <div className="message-header">
                                    <div className="message-subject-group">
                                        <p className="message-subject">
                                            {message.subject}
                                        </p>
                                        <span className={`status-tag ${isNew ? 'tag-new' : 'tag-resolved'}`}>
                                            {isNew ? 'NEW' : 'RESOLVED'}
                                        </span>
                                    </div>
                                    <div className="message-info">
                                        <p className="message-sender">
                                            From: <span>{message.name}</span> &lt;{message.email}&gt;
                                        </p>
                                        <p className="message-date">
                                            {moment(message.timestamp).format('MMM Do, h:mm a')}
                                        </p>
                                    </div>
                                </div>

                                <div className="message-body">
                                    <p className="message-text">
                                        **Message:** {message.message}
                                    </p>
                                </div>

                                {/* Existing Replies Section */}
                                {message.replies && message.replies.length > 0 && (
                                    <div className="replies-history">
                                        <p className="history-title">
                                            <IoChatbubblesOutline className="history-icon" />
                                            Admin History ({message.replies.length}):
                                        </p>
                                        {message.replies.slice(-1).map((reply, index) => ( // Only show last reply
                                            <div key={index} className="latest-reply-box">
                                                <p className="reply-content">
                                                    **Latest Reply:** {reply.replyText}
                                                </p>
                                                <p className="reply-date">
                                                    Replied on: {moment(reply.timestamp).format('YYYY-MM-DD HH:mm')}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Reply Button / Form */}
                                <div className="message-actions">
                                    {isReplying ? (
                                        <div className="reply-form-container">
                                            <textarea
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                                rows="4"
                                                placeholder="Type your reply here..."
                                                className="reply-textarea"
                                            />
                                            <div className="reply-buttons">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setReplyingTo(null); }}
                                                    className="btn btn-cancel"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleReply(message._id); }}
                                                    className="btn btn-primary"
                                                >
                                                    Send Reply
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation(); 
                                                // 🎯 Use the new handler here
                                                handleOpenReply(message); 
                                            }}
                                            className="btn btn-reply"
                                        >
                                            Reply to Message
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MessageList;