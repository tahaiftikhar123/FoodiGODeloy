import orderModel from "../models/orderModel.js";
import userModel from "../models/usermodel.js";
import Stripe from "stripe";
import { sendEmailWithBill } from "../utils/emailUtils.js";
import { generateFoodiGOBillPDF } from "../utils/pdfUtils.js";
import PDFDocument from 'pdfkit';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const placeOrder = async (req, res) => {
    try {
        const frontend_url = "http://localhost:3000";
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized: User ID missing or token invalid." });
        }
        
        const items = req.body.items || [];
        const address = req.body.address || "";
        
        // FIX 1: Delivery charge set to 2
        const deliveryCharge = 2;

        const amount = items.reduce((sum, item) => sum + item.price * item.quantity, 0) + deliveryCharge;

        // FIX 2: Update minimum amount check for USD
        if (amount < 0.50) { 
            return res.status(400).json({ 
                success: false, 
                message: "Total order amount must be at least $0.50 for Stripe payment" 
            });
        }

        const newOrder = new orderModel({
            userId,
            items,
            amount,
            address,
            status: "Food Processing",
            payment: false,
            // 🎯 NEW FEATURE: Mark as new for admin
            isNew: true, 
        });

        await newOrder.save();

        console.log(`\n🔔 NEW ORDER PLACED: Order ID ${newOrder._id} for $${amount}`); // Admin log

        const line_items = items.map((item) => ({
            price_data: {
                // FIX 3: Currency to USD
                currency: "usd", 
                product_data: { name: item.name },
                unit_amount: item.price * 100, 
            },
            quantity: item.quantity,
        }));

        line_items.push({
            price_data: {
                // FIX 3: Currency to USD
                currency: "usd",
                product_data: { name: "Delivery Charges" },
                // FIX 4: deliveryCharge (2) * 100 = 200 cents ($2.00)
                unit_amount: deliveryCharge * 100, 
            },
            quantity: 1,
        });

        const session = await stripe.checkout.sessions.create({
            line_items,
            mode: "payment",
            success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
        });

        res.json({ success: true, session_url: session.url });
    } catch (error) {
        console.error("Stripe order error:", error); 
        res.status(500).json({ 
            success: false, 
            message: error.raw?.message || "Error placing order (Internal Server Error). Check server logs." 
        });
    }
};


const verifyOrder = async (req, res) => {
    const { orderId, success } = req.body;

    try {
        if (!orderId) {
            return res.status(400).json({ success: false, message: "Order ID is required" });
        }

        if (success === "true") {
            const order = await orderModel.findByIdAndUpdate(orderId, { payment: true }, { new: true });
            const user = await userModel.findByIdAndUpdate(order.userId, { cartData: {} }, { new: true });

            if (!order || !user) {
                return res.status(404).json({ success: false, message: "Order or user data not found." });
            }

            const customerName = `${order.address.firstName} ${order.address.lastName}`; 
            const customerEmail = user.email;
            
            const pdfBuffer = await generateFoodiGOBillPDF(order, customerName); 

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=FoodiGO_Invoice_${orderId.slice(-6)}.pdf`);
            res.setHeader('Content-Length', pdfBuffer.length);

            res.send(pdfBuffer); 
            
            sendEmailWithBill(customerEmail, order); 
            
        } else {
            // If payment failed, delete the order and related cart data
            const order = await orderModel.findByIdAndDelete(orderId);
            if(order) {
                await userModel.findByIdAndUpdate(order.userId, { $unset: { cartData: 1 } });
            }
            res.json({ success: false, message: "Payment failed, order deleted" });
        }
    } catch (error) {
        console.error("Error verifying order or generating PDF:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const usersOrder = async (req, res) => {
    try {
        const orders = await orderModel.find({ userId: req.userId });
        res.json({ success: true, data: orders });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error" });
    }
};

// ✅ Controller to get the count of UNSEEN orders for the admin sidebar badge
const getNewOrdersCount = async (req, res) => {
    try {
        // Find orders where payment is true (verified) and isNew is true (unseen by admin)
        const count = await orderModel.countDocuments({ payment: true, isNew: true });
        res.json({ success: true, count: count });
    } catch (error) {
        console.error("Error getting new orders count:", error);
        res.status(500).json({ success: false, message: "Error fetching count" });
    }
}


const listOrders = async (req,res) =>{
    try {
        // Fetch orders sorted by creation date (newest first)
        const orders = await orderModel.find({}).sort({ createdAt: -1 }); 
        res.json({success:true,data:orders})
        
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}


const removeOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.userId; // Assuming admin access is handled by middleware before this

        if (!orderId) {
            return res.status(400).json({ success: false, message: "Order ID is required" });
        }

        // Admin removal logic (no user ID check needed, only token)
        await orderModel.findByIdAndDelete(orderId);
        res.json({ success: true, message: "Order removed successfully" });
    } catch (error) {
        console.error("Error removing order:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};


const updateStatus = async (req,res) => {
    try {
        // Find and update status, also mark as seen if status is being updated.
        await orderModel.findByIdAndUpdate(req.body.orderId, {
            status: req.body.status,
            isNew: false // Mark as seen when status is updated
        })
        res.json({success:true,message:"Status Updated"})
    } catch (error) {
        console.log(error)
        res.json({success:false,message:"Failed"})
    }
}

// ✅ Controller to mark an order as seen (isNew: false)
const markAsSeen = async (req, res) => {
    try {
        const { orderId } = req.body;
        
        if (!orderId) {
            return res.status(400).json({ success: false, message: "Order ID is required." });
        }

        // Set isNew flag to false
        const order = await orderModel.findByIdAndUpdate(
            orderId, 
            { isNew: false }, 
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found." });
        }

        res.json({ success: true, message: "Order marked as seen.", data: order });
    } catch (error) {
        console.error("Error marking order as seen:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
}


export { placeOrder, updateStatus, verifyOrder, usersOrder, listOrders, removeOrder, getNewOrdersCount, markAsSeen };