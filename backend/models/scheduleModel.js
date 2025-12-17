import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // To link to the user who created it
    items: { type: Array, required: true }, // A snapshot of the items in the cart
    amount: { type: Number, required: true }, // The total amount for this scheduled order
    address: { type: Object, required: true }, // The delivery address
    
    // Scheduling Fields
    scheduleType: { type: String, enum: ['one-time', 'recurring'], required: true },
    deliveryTimestamp: { type: Date, required: true }, // The date and time for the NEXT delivery
    recurrenceRule: { type: String, enum: [null, 'daily', 'weekdays', 'weekly'], default: null }, // e.g., 'daily', 'weekly'
    
    // Control Fields
    updateCutoffHours: { type: Number, default: 2 }, // Business rule: Cannot update within 2 hours of delivery
    isActive: { type: Boolean, default: true }, // Allows user to pause/resume the schedule
    
    // Stripe Integration for Recurring Payments
    stripePaymentMethodId: { type: String, required: true }, // Saved Stripe Payment Method ID
    stripeCustomerId: { type: String, required: true }, // Saved Stripe Customer ID

}, { timestamps: true });

const scheduleModel = mongoose.models.schedule || mongoose.model("schedule", scheduleSchema);

export default scheduleModel;
