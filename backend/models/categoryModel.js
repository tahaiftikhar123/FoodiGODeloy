// models/categoryModel.js (TEMPORARY FIX SCRIPT)
import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        unique: true,
        sparse: true 
    },
    image: { type: String, required: true },
    description: { type: String }
}, { timestamps: true });

// --- START TEMPORARY FIX LOGIC ---
// This pre-save hook attempts to drop the conflicting index whenever the model initializes.
categorySchema.pre('save', async function(next) {
    if (this.isNew) {
        try {
            // Check if the old index exists and drop it
            const indexes = await mongoose.connection.db.collection('categories').indexInformation();
            if (indexes.menu_name_1) {
                console.log("OLD INDEX FOUND: menu_name_1. Attempting to drop it...");
                await mongoose.connection.db.collection('categories').dropIndex("menu_name_1");
                console.log("OLD INDEX menu_name_1 DROPPED SUCCESSFULLY.");
            }
        } catch (error) {
            // Ignore if the index is already dropped or if it fails for other reasons
            if (error.code !== 27) { // 27 is 'index not found'
                 console.warn("Index drop failed (may be harmless):", error.message);
            }
        }
    }
    next();
});
// --- END TEMPORARY FIX LOGIC ---

const categoryModel = mongoose.models.category || mongoose.model("category", categorySchema);

export default categoryModel;