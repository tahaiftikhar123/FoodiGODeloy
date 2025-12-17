

import express from "express";

import { addCategory, listCategory, removeCategory, updateCategory } from "../controllers/categoryController.js";


import multer from "multer";
import fs from "fs";
import path from "path";

const categoryRouter = express.Router();


const uploadDir = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadDir)) {
    console.log("Creating uploads directory...");
    fs.mkdirSync(uploadDir);
}


const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      
        cb(null, `${Date.now()}-${path.basename(file.originalname, path.extname(file.originalname))}${path.extname(file.originalname)}`);
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 }, 
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            return cb(null, true);
        }
        cb(new Error("Only image files are allowed"));
    },
});


const uploadErrorHandler = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ success: false, message: `Multer Error: ${err.message}` });
    } else if (err) {
        return res.status(400).json({ success: false, message: `Upload Error: ${err.message}` });
    }
    next();
};


categoryRouter.post("/add", upload.single("image"), uploadErrorHandler, addCategory);


categoryRouter.get("/list", listCategory);

categoryRouter.post("/update", upload.single("image"), uploadErrorHandler, updateCategory);
categoryRouter.post("/remove", removeCategory);

export default categoryRouter;