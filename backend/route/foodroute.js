// backend/route/foodroute.js

import express from "express";
// 🎯 FIX: Import the new updateStock function from the controller
import { addFood ,listfood,removefood, updateStock,updateDetails } from "../controllers/foodcontroller.js"; 

import multer from "multer";
import fs from "fs";
import path from "path";

const foodRouter = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      return cb(null, true);
    }
    cb(new Error("Only image files are allowed"));
  },
});



// Multer error handling middleware
const uploadErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ success: false, message: err.message });
  } else if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next();
};

// Log incoming requests
foodRouter.post("/add", (req, res, next) => {
  console.log("Received POST request to /api/food/add");
  next();
}, upload.single("image"), uploadErrorHandler, addFood);

foodRouter.get("/list",listfood)
foodRouter.post("/remove",removefood);
// 🎯 ROUTE USES THE IMPORTED FUNCTION
foodRouter.post("/update_stock", updateStock); 
foodRouter.post("/update_details", updateDetails);

export default foodRouter;