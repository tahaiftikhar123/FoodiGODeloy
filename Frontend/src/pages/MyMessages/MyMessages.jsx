// src/pages/MyMessages/MyMessages.jsx

import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { StoreContext } from '../../context/storecontext';
import { toast } from 'react-toastify';
import moment from 'moment';
import { IoChevronDown, IoChevronUp } from 'react-icons/io5';

const MyMessages = () => {
    const { url, token } = useContext(StoreContext);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedMessageId, setExpandedMessageId] = useState(null);

    // Use useCallback to stabilize the function definition
    const fetchUserMessages = useCallback(async () => {
        // 🎯 CRITICAL CHECK: Function should not run if token is missing
        if (!token) {
            setLoading(false); 
            // Do NOT show toast here, as the useEffect handles the overall state.
            return;
        }
        
        setLoading(true);
        try {
            const response = await axios.get(url + "/api/message/user", {
                headers: { token }
            });

            if (response.data.success) {
                setMessages(response.data.data);
            } else {
                // Show error if fetching fails despite having a token (e.g., token invalid)
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error("Error fetching message history.");
            console.error("Error fetching user messages:", error);
        } finally {
            setLoading(false);
        }
    }, [token, url]); // Dependencies for useCallback

    const toggleExpand = (id) => {
        setExpandedMessageId(expandedMessageId === id ? null : id);
    };

    // Use the stabilized function in the dependency array
    useEffect(() => {
        // 🎯 ONLY CALL fetchUserMessages if token exists
        if (token) {
            fetchUserMessages();
        } else {
            // Set loading to false if no token is found on mount
            setLoading(false); 
        }
    }, [token, fetchUserMessages]); 
    // We keep 'token' here to trigger a re-fetch when the user logs in 
    // and the context updates 'token'.

    // ----------------------------------------------------
    // CONDITIONAL RENDERING FOR BETTER UX
    // ----------------------------------------------------

    if (loading) {
        return <div className="text-center py-10 text-lg text-gray-600">Loading your message history...</div>;
    }

    if (!token) {
        return (
            <div className="max-w-4xl mx-auto my-12 p-8 bg-red-100 rounded-xl text-center">
                <h1 className="text-3xl font-bold text-red-700 mb-4">Access Denied</h1>
                <p className="text-lg text-red-600">Please log in to view your message history and complaints.</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto my-12 p-4 md:p-8">
            <h1 className="text-3xl font-bold text-orange-600 mb-8 border-b pb-3">
                Your Message and Complaint History
            </h1>

            {messages.length === 0 ? (
                <div className="bg-blue-50 p-6 rounded-lg text-center">
                    <p className="text-gray-600 text-lg">You haven't sent any messages yet.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {messages.map((message) => (
                        <div 
                            key={message._id} 
                            className="bg-white p-5 rounded-xl shadow-lg border border-gray-100"
                        >
                            <div 
                                onClick={() => toggleExpand(message._id)}
                                className="flex justify-between items-center cursor-pointer"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-3 mb-1">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full 
                                            ${message.replies.length > 0 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {message.replies.length > 0 ? 'REPLIED' : 'PENDING'}
                                        </span>
                                        <p className="text-lg font-semibold truncate text-gray-800">
                                            {message.subject}
                                        </p>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        Submitted: {moment(message.timestamp).format('MMM Do, YYYY')}
                                    </p>
                                </div>
                                {expandedMessageId === message._id ? (
                                    <IoChevronUp className="w-6 h-6 text-orange-600 ml-4" />
                                ) : (
                                    <IoChevronDown className="w-6 h-6 text-gray-500 ml-4" />
                                )}
                            </div>

                            {/* Detailed Content (Expands on click) */}
                            {expandedMessageId === message._id && (
                                <div className="mt-4 pt-4 border-t border-dashed">
                                    <h3 className="text-md font-bold mb-2 text-gray-700">Your Original Message:</h3>
                                    <p className="bg-gray-50 p-3 rounded-lg text-sm whitespace-pre-wrap">{message.message}</p>

                                    {/* Admin Replies */}
                                    {message.replies.length > 0 && (
                                        <div className="mt-5 space-y-3">
                                            <h3 className="text-md font-bold text-blue-600">Admin Replies ({message.replies.length}):</h3>
                                            {message.replies.map((reply, index) => (
                                                <div key={index} className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                                                    <p className="text-sm font-medium text-blue-800">
                                                        Admin Response:
                                                    </p>
                                                    <p className="mt-1 text-gray-700 whitespace-pre-wrap">{reply.replyText}</p>
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        Replied on: {moment(reply.timestamp).format('YYYY-MM-DD HH:mm')}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {message.replies.length === 0 && (
                                        <p className="mt-4 text-sm italic text-yellow-700">The admin is currently reviewing your message and has not yet replied.</p>
                                    )}
                                </div>
                            )}

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyMessages;