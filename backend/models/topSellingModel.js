import mongoose from "mongoose";

const topSellingSchema = new mongoose.Schema({
    foodId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    cartAdditionCount: { type: Number, default: 0 }
}, { timestamps: true });

const topSellingModel = mongoose.models.topSelling || mongoose.model("topSelling", topSellingSchema);
export default topSellingModel;