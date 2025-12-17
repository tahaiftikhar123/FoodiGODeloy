import reviewModel from "../models/reviewModel.js";
import userModel from "../models/usermodel.js";

// Function to add a new review (Requires Auth Middleware to run first)
const addReview = async (req, res) => {
    try {
        // userId should come from the middleware (req.userId)
        const userId = req.userId; 
        const { foodId, rating, comment } = req.body;

        // 1. Basic Validation
        if (!foodId || !rating || !comment || !userId) {
            return res.json({ success: false, message: "Missing required fields or authentication failed." });
        }
        
        // 2. Fetch User Name for display
        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found." });
        }
        const userName = user.name; 

        // 3. Create and Save Review
        const newReview = new reviewModel({
            foodId: foodId,
            userId: userId, // Linked to the authenticated user
            userName: userName, // Stored for display
            rating: rating,
            comment: comment,
        });

        await newReview.save();
        
        res.json({ success: true, message: "Review added successfully" });
        
    } catch (error) {
        console.log("Error in addReview:", error);
        // Common error: Mongoose validation error (e.g., if rating is out of range)
        res.json({ success: false, message: "Server error while adding review." });
    }
};

// Function to get all reviews for a specific food item
const listReviewsByFoodId = async (req, res) => {
    try {
        const { foodId } = req.params;
        
        if (!foodId) {
            return res.json({ success: false, message: "Food ID is required." });
        }
        
        // Find all reviews matching the foodId, sort by newest first
        // We can optionally use .populate('userId', 'name') here if needed, 
        // but since we save userName directly, simple find is sufficient.
        const reviews = await reviewModel.find({ foodId: foodId }).sort({ createdAt: -1 });

        res.json({ success: true, data: reviews });

    } catch (error) {
        console.log("Error in listReviewsByFoodId:", error);
        res.json({ success: false, message: "Server error while fetching reviews." });
    }
};

export { addReview, listReviewsByFoodId };