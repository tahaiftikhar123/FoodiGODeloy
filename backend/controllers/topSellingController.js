import topSellingModel from "../models/topSellingModel.js";

// Ensure this is named exactly as the import in your route
export const getTopSellingByCart = async (req, res) => {
    try {
        const topItems = await topSellingModel.find({})
            .sort({ cartAdditionCount: -1 })
            .limit(10);
        res.json({ success: true, data: topItems });
    } catch (error) {
        console.error("Error in getTopSellingByCart:", error);
        res.status(500).json({ success: false, message: "Error fetching top items" });
    }
};