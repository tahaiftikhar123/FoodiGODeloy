// backend/middleware/adminAuth.js (Verify this file is correct)

import jwt from "jsonwebtoken";
import adminModel from '../models/adminModel.js'; 

const adminAuthMiddleware = async (req, res, next) => {
    // 🎯 Ensure the token is pulled from the Authorization header or x-access-token
    // Assuming your frontend sends it in the 'token' header, this is correct:
    const { token } = req.headers; 

    if (!token) {
        return res.json({ success: false, message: "Not Authorized, token not found" });
    }

    try {
        // 1. Verify the token using the secret from .env
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        
        // 2. Look up the user ID in the dedicated Admin collection
        const user = await adminModel.findById(decodedToken.id); 

        if (!user) {
             return res.json({ success: false, message: "Unauthorized: Admin user not found." });
        }
        
        req.userId = decodedToken.id; 
        
        next();
        
    } catch (error) {
        // This is the block returning "Invalid Token"
        console.error("JWT Verification Error:", error.message);
        res.json({ success: false, message: "Authorization failed, Invalid Token." });
    }
}

export default adminAuthMiddleware;