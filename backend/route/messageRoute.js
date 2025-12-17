// backend/routes/messageRoute.js

import express from 'express';
import messageModel from '../models/messageModel.js';
import adminAuthMiddleware from '../middleware/adminAuth.js';
import authMiddleware from '../middleware/auth.js'; 
import jwt from 'jsonwebtoken'; 

const messageRouter = express.Router();

messageRouter.post("/send", async (req, res) => {
    const { name, email, subject, message } = req.body;
    
    let userId = null;
    const token = req.headers.token;
    
    if (token) {
        try {
            const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
            userId = decodedToken.id;
        } catch (e) {
            console.log("Optional token present but invalid, processing as guest.");
        }
    }
    
    try {
        const newMessage = new messageModel({
            userId: userId, 
            name: name,
            email: email,
            subject: subject,
            message: message,
            isRead: false,
        });

        await newMessage.save();

        res.json({ success: true, message: "Message sent successfully." });

    } catch (error) {
        console.error("Error saving new message:", error); 
        res.json({ success: false, message: "Server error. Could not save message." });
    }
});


messageRouter.get("/user", authMiddleware, async (req, res) => {
    try {
        const userMessages = await messageModel.find({ userId: req.userId }).sort({ timestamp: -1 });

        res.json({ success: true, data: userMessages });
    } catch (error) {
        console.error("Error fetching user messages:", error);
        res.json({ success: false, message: "Server error fetching history." });
    }
});


messageRouter.get("/list", adminAuthMiddleware, async (req, res) => {
    try {
        const messages = await messageModel.find({}); 
        res.json({ success: true, data: messages });
    } catch (error) {
        console.error("Error fetching message list:", error);
        res.json({ success: false, message: "Server error fetching messages." });
    }
});

messageRouter.get("/newcount", adminAuthMiddleware, async (req, res) => {
    try {
        
        const count = await messageModel.countDocuments({ isRead: false }); 
        res.json({ success: true, count: count });
    } catch (error) {
        console.error("Error fetching new message count:", error);
        res.json({ success: false, message: "Server error fetching count." });
    }
});

messageRouter.post("/markread", adminAuthMiddleware, async (req, res) => {
    const { messageId } = req.body;
    try {
        const message = await messageModel.findByIdAndUpdate(
            messageId, 
            { isRead: true },
            { new: true }
        );
        if (!message) {
            return res.json({ success: false, message: "Message not found." });
        }
        res.json({ success: true, message: "Message marked as read." });
    } catch (error) {
        console.error("Error marking message as read:", error);
        res.json({ success: false, message: "Server error." });
    }
});


messageRouter.post("/reply", adminAuthMiddleware, async (req, res) => {
    const { messageId, replyText } = req.body;
    const adminId = req.adminId; 

    try {
        const message = await messageModel.findById(messageId);
        if (!message) {
            return res.json({ success: false, message: "Message not found." });
        }

    
        message.replies.push({ adminId, replyText });
        message.isRead = true; 
        await message.save();

        res.json({ success: true, message: "Reply sent successfully." });
    } catch (error) {
        console.error("Error sending reply:", error);
        res.json({ success: false, message: "Server error sending reply." });
    }
});


export default messageRouter;