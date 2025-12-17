// backend/controllers/favoriteController.js
import userModel from "../models/usermodel.js";
const toggleFavorite = async (req, res) => {
    try {
        // 🎯 FIX: Read ID from req.userId
        const userId = req.userId; 
        const { itemId } = req.body;

        let userData = await userModel.findById(userId);
        if (!userData) {
            return res.json({ success: false, message: "User not found" });
        }

        const isFavorited = userData.favorites.includes(itemId);
        // ... (Rest of the logic remains the same) ...
        
        if (isFavorited) {
            // Remove
            userData.favorites = userData.favorites.filter(id => id.toString() !== itemId.toString());
            await userData.save();
            res.json({ success: true, message: "Removed from favorites", action: "remove" });
        } else {
            // Add
            userData.favorites.push(itemId);
            await userData.save();
            res.json({ success: true, message: "Added to favorites", action: "add" });
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error toggling favorite" });
    }
}

// Get User Favorites
const getFavorites = async (req, res) => {
    try {
        // 🎯 FIX: Read ID from req.userId
        const userId = req.userId; 
        const userData = await userModel.findById(userId);

        if (!userData) {
            return res.json({ success: false, message: "User not found" });
        }

        res.json({ success: true, favorites: userData.favorites });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching favorites" });
    }
}

export { toggleFavorite, getFavorites };