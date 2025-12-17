import scheduleModel from "../models/scheduleModel.js";
import userModel from "../models/usermodel.js";
import Stripe from "stripe";
import orderModel from "../models/orderModel.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const calculateTotalAmount = (items) => {
    let total = 0;
    items.forEach(item => {
        total += (item.quantity || 0) * (item.price || 0);
    });
    return parseFloat(total.toFixed(2));
};

// --- CUSTOMER-FACING CONTROLLERS (Rest of the functions remain unchanged) ---
export const createSchedule = async (req, res) => {
    try {
        const { items, amount, address, deliveryTimestamp, recurrenceRule, paymentMethodId } = req.body;
        const userId = req.userId;

        if (!items || !amount || !address || !deliveryTimestamp || !paymentMethodId || !address.firstName || !address.email) {
            return res.status(400).json({ success: false, message: "Missing required schedule or address details." });
        }
        
        const requestedDeliveryTime = new Date(deliveryTimestamp);
        const now = new Date();
        
        if (requestedDeliveryTime <= now) {
            return res.status(400).json({ success: false, message: "Scheduled time must be in the future." });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        const customer = await stripe.customers.create({
            payment_method: paymentMethodId,
            email: user.email,
            invoice_settings: {
                default_payment_method: paymentMethodId,
            },
        });

        const newSchedule = new scheduleModel({
            userId,
            items,
            amount,
            address,
            scheduleType: recurrenceRule === 'one-time' || !recurrenceRule ? 'one-time' : 'recurring',
            deliveryTimestamp,
            recurrenceRule: recurrenceRule === 'one-time' ? null : recurrenceRule,
            stripePaymentMethodId: paymentMethodId,
            stripeCustomerId: customer.id
        });

        await newSchedule.save();
        
        res.json({ success: true, message: "Order scheduled successfully!", scheduleId: newSchedule._id });

    } catch (error) {
        console.error("Error creating schedule:", error);
        res.status(500).json({ success: false, message: "Failed to schedule order." });
    }
};

export const listSchedules = async (req, res) => {
    try {
        const userId = req.userId;
        const schedules = await scheduleModel.find({ userId });
        res.json({ success: true, data: schedules });
    } catch (error) {
        console.error("Error listing schedules:", error);
        res.status(500).json({ success: false, message: "Failed to retrieve schedules." });
    }
};

export const toggleScheduleActive = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;
        const userId = req.userId;

        const schedule = await scheduleModel.findOneAndUpdate(
            { _id: id, userId },
            { isActive },
            { new: true }
        );

        if (!schedule) {
            return res.status(404).json({ success: false, message: "Schedule not found or not owned by user." });
        }

        const message = isActive ? "Schedule resumed successfully." : "Schedule paused successfully.";
        res.json({ success: true, message });

    } catch (error) {
        console.error("Error toggling schedule:", error);
        res.status(500).json({ success: false, message: "Failed to toggle schedule status." });
    }
};

export const updateSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const { deliveryTimestamp, recurrenceRule, items } = req.body; 

        const schedule = await scheduleModel.findOne({ _id: id, userId: req.userId });
        if (!schedule) {
            return res.status(404).json({ success: false, message: "Schedule not found or not owned by user." });
        }
        
        const now = new Date();
        const deliveryTime = new Date(schedule.deliveryTimestamp); 
        const hoursUntilDelivery = (deliveryTime - now) / (1000 * 60 * 60);

        if (hoursUntilDelivery < schedule.updateCutoffHours) {
            return res.status(400).json({ success: false, message: `Cannot update schedule within ${schedule.updateCutoffHours} hours of delivery.` });
        }
        
        if (items && items.length === 0) {
            return res.status(400).json({ success: false, message: "Schedule must contain at least one item." });
        }
        
        if (deliveryTimestamp) {
            const requestedDeliveryTime = new Date(deliveryTimestamp);
            const now = new Date();
            if (requestedDeliveryTime <= now) {
                return res.status(400).json({ success: false, message: "New scheduled time must be in the future." });
            }
        }
        
        if (items) {
            schedule.items = items;
            schedule.amount = calculateTotalAmount(items);
        }

        if (deliveryTimestamp) {
            schedule.deliveryTimestamp = deliveryTimestamp;
        }
        
        schedule.recurrenceRule = recurrenceRule === 'one-time' ? null : recurrenceRule;
        schedule.scheduleType = recurrenceRule === 'one-time' || !recurrenceRule ? 'one-time' : 'recurring';


        await schedule.save();
        res.json({ success: true, message: "Schedule updated successfully" });
    } catch (error) {
        console.error("Error updating schedule:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const deleteSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const schedule = await scheduleModel.findOneAndDelete({ _id: id, userId: req.userId });

        if (!schedule) {
            return res.status(404).json({ success: false, message: "Schedule not found or not owned by user." });
        }

        res.json({ success: true, message: "Schedule deleted successfully" });
    } catch (error) {
        console.error("Error deleting schedule:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// --- ADMIN-FACING CONTROLLERS (Rest of the functions remain unchanged) ---

export const adminListSchedules = async (req, res) => {
    try {
        const schedules = await scheduleModel.find({})
            .populate({
                path: 'userId',
                select: 'name email', 
                model: userModel,
            })
            .sort({ deliveryTimestamp: 1 }); 

        const formattedSchedules = schedules.map(schedule => {
            const scheduleObject = schedule.toObject(); 
            if (scheduleObject.userId) {
                scheduleObject.user = scheduleObject.userId;
                delete scheduleObject.userId;
            }
            return scheduleObject;
        });

        res.json({ success: true, data: formattedSchedules });

    } catch (error) {
        console.error("Error listing all schedules for admin:", error);
        res.status(500).json({ success: false, message: "Failed to retrieve all schedules for admin." });
    }
};

export const adminToggleScheduleActive = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;
        
        const schedule = await scheduleModel.findOneAndUpdate(
            { _id: id },
            { isActive },
            { new: true }
        );

        if (!schedule) {
            return res.status(404).json({ success: false, message: "Schedule not found." });
        }

        const message = isActive ? "Schedule resumed successfully." : "Schedule paused successfully.";
        res.json({ success: true, message });

    } catch (error) {
        console.error("Error toggling schedule for admin:", error);
        res.status(500).json({ success: false, message: "Failed to toggle schedule status." });
    }
};

export const adminDeleteSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const schedule = await scheduleModel.findOneAndDelete({ _id: id });

        if (!schedule) {
            return res.status(404).json({ success: false, message: "Schedule not found" });
        }

        res.json({ success: true, message: "Schedule deleted successfully" });
    } catch (error) {
        console.error("Error deleting schedule for admin:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

