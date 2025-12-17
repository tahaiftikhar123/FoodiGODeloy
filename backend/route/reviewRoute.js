import express from 'express';
import { addReview, listReviewsByFoodId } from '../controllers/reviewController.js';
// 🎯 IMPORTANT: Replace '../middleware/auth.js' with the actual path to your middleware
import authMiddleware from '../middleware/auth.js'; 

const reviewRouter = express.Router();

// Route to add a new review (Protected route: requires user authentication)
reviewRouter.post("/add", authMiddleware, addReview);

// Route to get all reviews for a specific food item (Public route)
reviewRouter.get("/list/:foodId", listReviewsByFoodId);

export default reviewRouter;