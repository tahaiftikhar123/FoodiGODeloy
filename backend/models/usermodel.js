// models/userModel.js

import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cartData: { type: Object, default: {} },
    // ✨ NEW: Add a favorites field (array of food IDs)
    favorites: { type: [mongoose.Schema.Types.ObjectId], ref: 'food', default: [] }, 
}, { minimize: false }); // minimize: false ensures default fields are created

const userModel = mongoose.models.user || mongoose.model("user", userSchema);
export default userModel;