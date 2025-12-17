import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    foodId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'food',
        required: true
    },
    // Linking directly to the User model
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user', 
        required: true // Now required since it links to a logged-in user
    },
    userName: { // Kept for denormalization/easy access, but can be derived from userId
        type: String,
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    comment: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const reviewModel = mongoose.models.review || mongoose.model("review", reviewSchema);

export default reviewModel;