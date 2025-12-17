// backend/middleware/auth.js (The recommended version)

import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
    const { token } = req.headers;

    if (!token) {
        // Return 401 status code (Unauthorized)
        return res
            .status(401)
            .json({ success: false, message: "Not authorized, please login again" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // CRITICAL: Set the user ID for all dependent routes (like /api/message/user)
        req.userId = decoded.id; 
        console.log("User ID from middleware:", req.userId);

        next();
    } catch (error) {
        console.log("JWT Error:", error.message);
        // Return 401 status code for invalid token
        return res.status(401).json({ success: false, message: "Token is invalid" });
    }
};

export default authMiddleware;