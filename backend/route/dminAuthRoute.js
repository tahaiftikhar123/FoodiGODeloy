

import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import adminModel from '../models/adminModel.js'; 

const adminAuthRouter = express.Router();


const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET);
};

adminAuthRouter.post("/admin_login", async (req, res) => {
    const { email, password } = req.body;
    try {
        // 🎯 Find user in the dedicated admin collection
        const user = await adminModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "Admin not found." });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.json({ success: false, message: "Invalid credentials." });
        }

        const token = createToken(user._id);
        res.json({ success: true, token });

    } catch (error) {
        console.error("Admin Login Error:", error);
        res.json({ success: false, message: "Server error during login." });
    }
});

export default adminAuthRouter;