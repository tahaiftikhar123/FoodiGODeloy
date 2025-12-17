// backend/models/adminModel.js

import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // You can add more admin-specific fields here (e.g., permissions, lastLogin)
    role: { type: String, default: "admin" } // Always defaults to admin
}, { minimize: false });

const adminModel = mongoose.models.admin || mongoose.model("admin", adminSchema);

export default adminModel;