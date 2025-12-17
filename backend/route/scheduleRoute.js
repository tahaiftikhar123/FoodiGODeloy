import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
    createSchedule,
    listSchedules,
    toggleScheduleActive, // CUSTOMER FUNCTION
    updateSchedule,
    deleteSchedule, // CUSTOMER FUNCTION
    getTopSellingItems,
    adminListSchedules,
    // ⭐ NEW: Import Admin specific functions
    adminToggleScheduleActive, 
    adminDeleteSchedule
} from "../controllers/scheduleController.js";

const scheduleRoute = express.Router();

// --- CUSTOMER ROUTES (Unchanged, using customer-specific controllers) ---
scheduleRoute.post("/create", authMiddleware, createSchedule);
scheduleRoute.get("/list", authMiddleware, listSchedules);
scheduleRoute.put("/update/:id", authMiddleware, updateSchedule);
scheduleRoute.put("/toggle/:id", authMiddleware, toggleScheduleActive);
scheduleRoute.delete('/delete/:id', authMiddleware, deleteSchedule);
scheduleRoute.get("/top-selling", getTopSellingItems); // Used by Admin Dashboard

// --- ADMIN ROUTES (Using new, fixed controllers) ---

// Route used by ListSchedules.jsx to fetch all data
scheduleRoute.get("/adminlist", authMiddleware, adminListSchedules); 

// ⭐ NEW ADMIN ENDPOINT for Toggle operation (This is the fix)
scheduleRoute.put("/admin/toggle/:id", authMiddleware, adminToggleScheduleActive); 

// ⭐ NEW ADMIN ENDPOINT for Delete operation (This is the fix)
scheduleRoute.delete('/admin/delete/:id', authMiddleware, adminDeleteSchedule); 

export default scheduleRoute;