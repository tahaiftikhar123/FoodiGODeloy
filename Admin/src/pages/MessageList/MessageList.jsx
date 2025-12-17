import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import moment from 'moment';
import { IoMailOutline, IoChatbubblesOutline, IoCheckmarkCircleOutline, IoTrashOutline } from 'react-icons/io5';
import './MessageList.css';

const MessageList = ({ url }) => {
    const adminToken = localStorage.getItem("adminToken");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [newMsgCount, setNewMsgCount] = useState(0);

    // 1. Fetch unread count for notifications
    const fetchNewMessagesCount = useCallback(async () => {
        if (!adminToken) return;
        try {
            const response = await axios.get(url + "/api/message/newcount", {
                headers: { token: adminToken }
            });
            if (response.data.success) {
                setNewMsgCount(response.data.count);
            }
        } catch (error) {
            console.error("Error fetching count:", error);
        }
    }, [url, adminToken]);

    // 2. Fetch all messages and handle the loading state
    const fetchMessages = useCallback(async () => {
        setLoading(true); // Start loading
        if (!adminToken) {
            toast.error("Admin authentication failed.");
            setLoading(false);
            return;
        }
        try {
            const response = await axios.get(url + "/api/message/list", {
                headers: { token: adminToken }
            });
            if (response.data.success) {
                // Sort: Unread first, then by date
                const sorted = response.data.data.sort((a, b) => {
                    if (a.isRead !== b.isRead) return a.isRead - b.isRead;
                    return new Date(b.timestamp) - new Date(a.timestamp);
                });
                setMessages(sorted);
                setNewMsgCount(response.data.data.filter(msg => !msg.isRead).length);
            }
        } catch (error) {
            toast.error("Error fetching messages.");
        } finally {
            setLoading(false); // Stop loading regardless of success/fail
        }
    }, [url, adminToken]);

    // 3. Handle sending a reply
    const handleReply = async (messageId) => {
        if (!replyText.trim()) return toast.error("Reply cannot be empty.");
        try {
            const response = await axios.post(url + "/api/message/reply", 
                { messageId, replyText }, 
                { headers: { token: adminToken } }
            );
            if (response.data.success) {
                toast.success("Reply sent!");
                setReplyingTo(null);
                setReplyText('');
                fetchMessages(); // Refresh list
            }
        } catch (error) {
            toast.error("Error sending reply.");
        }
    };

    // 4. Delete message logic
    const handleDelete = async (messageId) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            const response = await axios.post(url + "/api/message/delete", { messageId }, {
                headers: { token: adminToken }
            });
            if (response.data.success) {
                toast.success("Deleted");
                setMessages(prev => prev.filter(msg => msg._id !== messageId));
                fetchNewMessagesCount();
            }
        } catch (error) {
            toast.error("Delete failed");
        }
    };

    const handleOpenReply = async (message) => {
        setReplyingTo(message._id);
        setReplyText('');
        if (!message.isRead) {
            try {
                await axios.post(url + "/api/message/markread", { messageId: message._id }, {
                    headers: { token: adminToken }
                });
                setMessages(prev => prev.map(msg => 
                    msg._id === message._id ? { ...msg, isRead: true } : msg
                ));
                setNewMsgCount(prev => Math.max(0, prev - 1));
            } catch (error) { console.error(error); }
        }
    };

    // 5. Initialize and set up polling
    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchNewMessagesCount, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, [fetchMessages, fetchNewMessagesCount]);

    if (loading) return <div className="loading-spinner">Loading messages...</div>;

    return (
        <div className="message-list-page">
            <h2 className="page-title">
                <IoMailOutline className="title-icon" />
                Customer Support Inbox 
                {newMsgCount > 0 && <span className="status-tag tag-new pulse-text">{newMsgCount} NEW</span>}
            </h2>
            
            {messages.length === 0 ? (
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
                            <div key={message._id} className={`message-container ${isNew ? 'new-message' : 'resolved-message'}`}>
                                <div className="message-header">
                                    <div className="message-subject-group">
                                        <p className="message-subject">{message.subject}</p>
                                        <span className={`status-tag ${isNew ? 'tag-new' : 'tag-resolved'}`}>
                                            {isNew ? 'NEW' : 'RESOLVED'}
                                        </span>
                                    </div>
                                    <div className="message-info">
                                        <p className="message-sender">From: <span>{message.name}</span> &lt;{message.email}&gt;</p>
                                        <p className="message-date">{moment(message.timestamp).format('MMM Do, h:mm a')}</p>
                                    </div>
                                </div>

                                <div className="message-body">
                                    <p className="message-text"><strong>Message:</strong> {message.message}</p>
                                </div>

                                {message.replies && message.replies.length > 0 && (
                                    <div className="replies-history">
                                        <p className="history-title"><IoChatbubblesOutline className="history-icon" /> History:</p>
                                        <div className="latest-reply-box">
                                            <p className="reply-content"><strong>Admin:</strong> {message.replies[message.replies.length - 1].replyText}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="message-actions">
                                    {!isReplying && (
                                        <button onClick={() => handleDelete(message._id)} className="btn btn-delete">
                                            <IoTrashOutline /> Delete
                                        </button>
                                    )}

                                    {isReplying ? (
                                        <div className="reply-form-container">
                                            <textarea 
                                                value={replyText} 
                                                onChange={(e) => setReplyText(e.target.value)} 
                                                className="reply-textarea" 
                                                placeholder="Type reply..."
                                            />
                                            <div className="reply-buttons">
                                                <button onClick={() => setReplyingTo(null)} className="btn btn-cancel">Cancel</button>
                                                <button onClick={() => handleReply(message._id)} className="btn btn-primary">Send Reply</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button onClick={() => handleOpenReply(message)} className="btn btn-reply">
                                            Reply
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