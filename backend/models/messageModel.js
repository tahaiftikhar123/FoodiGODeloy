// backend/models/messageModel.js

import mongoose from "mongoose";

const replySchema = new mongoose.Schema({
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'admin' },
    replyText: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

const messageSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'user', 
        required: false 
    },
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    
    timestamp: { type: Date, default: Date.now },
    
    // Admin Management Fields
    isRead: { type: Boolean, default: false },
    replies: [replySchema]
}, { minimize: false });

const messageModel = mongoose.models.message || mongoose.model("message", messageSchema);

export default messageModel;