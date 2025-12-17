import userModel from "../models/usermodel.js";
import topSellingModel from "../models/topSellingModel.js";

const AddtoCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { itemId, name } = req.body; 

    const userData = await userModel.findById(userId);
    if (!userData) {
      return res.json({ success: false, message: "User not found" });
    }

    let cartData = userData.cartData || {};
    cartData[itemId] = (cartData[itemId] || 0) + 1;

    await userModel.findByIdAndUpdate(
      userId,
      { $set: { cartData } },
      { new: true }
    );

    // Update Top Selling stats globally
    await topSellingModel.findOneAndUpdate(
        { foodId: itemId },
        { 
            $inc: { cartAdditionCount: 1 }, 
            $set: { name: name || "Food Item" } 
        },
        { upsert: true }
    );

    res.json({ success: true, message: "Added to cart", cartData });
  } catch (error) {
    res.json({ success: false, message: "Error adding to cart" });
  }
};

const removefromcart = async (req, res) => {
  try {
    const userId = req.userId;
    const { itemId } = req.body;
    const userData = await userModel.findById(userId);
    let cartData = userData.cartData || {};

    if (cartData[itemId] > 0) {
      cartData[itemId] -= 1;
      if (cartData[itemId] === 0) delete cartData[itemId];
    }
    await userModel.findByIdAndUpdate(userId, { $set: { cartData } });
    res.json({ success: true, message: "Removed from cart" });
  } catch (error) {
    res.json({ success: false, message: "Error removing from cart" });
  }
};

const getCart = async (req, res) => {
  try {
    const userData = await userModel.findById(req.userId);
    res.json({ success: true, cartData: userData.cartData || {} });
  } catch (error) {
    res.json({ success: false, message: "Error fetching cart" });
  }
};

export { AddtoCart, removefromcart, getCart };