// controllers/categoryController.js

import categoryModel from "../models/categoryModel.js";
import fs from "fs"; 
import path from "path"; // Import path for robust path handling

// Add new category
const addCategory = async (req, res) => {
    // Determine the path to the uploads directory (root of the backend project)
    const uploadsPath = path.join(process.cwd(), "uploads");

    try {
        console.log("Attempting to add category:", req.body.name);
        
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Image is required" });
        }

        const { name, description } = req.body;
        
        if (!name || !description) {
            // If validation fails, delete the uploaded file immediately
            const filePath = path.join(uploadsPath, req.file.filename);
            fs.unlink(filePath, (err) => {
                if (err) console.error("Error cleaning up image:", err.message);
            });
            return res.status(400).json({ success: false, message: "Name and description are required" });
        }

        // Check if category name already exists
        const existingCategory = await categoryModel.findOne({ name });
        if (existingCategory) {
            // Clean up the uploaded image if the category name is a duplicate
            const filePath = path.join(uploadsPath, req.file.filename);
            fs.unlink(filePath, (err) => {
                if (err) console.error("Error cleaning up duplicate category image:", err.message);
            });
            return res.status(400).json({ success: false, message: "Category name already exists" });
        }

        const category = new categoryModel({
            name,
            description,
            image: req.file.filename,
        });

        await category.save();
        res.json({ success: true, message: "Category Added", data: category });
    } catch (error) {
        console.error("Critical Error in addCategory:", error); 
        
        // Ensure any uploaded file is deleted if the DB save fails
        if (req.file && req.file.filename) {
            const filePath = path.join(uploadsPath, req.file.filename);
             fs.unlink(filePath, (err) => {
                if (err) console.error("Error cleaning up failed upload image:", err.message);
            });
        }
        
        res.status(500).json({ success: false, message: "Server Error occurred while adding the category." });
    }
};


const listCategory = async (req, res) => {
    try {
        const categories = await categoryModel.find({});
        res.json({ success: true, data: categories });
    } catch (error) {
        console.error("Error listing categories:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

const removeCategory = async (req, res) => {
    try {
        const { id } = req.body; 
        
       
        const category = await categoryModel.findById(id);

        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        
        const imagePath = path.join(process.cwd(), 'uploads', category.image);
        
        fs.unlink(imagePath, (err) => {
           
            if (err && err.code !== 'ENOENT') { 
                console.error("Error deleting category image:", err.message);
            
            } else if (!err) {
                 console.log(`Image deleted successfully: ${category.image}`);
            }
        });

 
        await categoryModel.findByIdAndDelete(id);

        res.json({ success: true, message: "Category removed successfully" });
    } catch (error) {
        console.error("Error in removeCategory:", error);
        
        res.status(500).json({ success: false, message: "Action cannot be performed: Server Error" }); 
    }
};

const updateCategory = async (req, res) => {
    try {
        const { id, name, description } = req.body;
        const uploadsPath = path.join(process.cwd(), "uploads");

        const category = await categoryModel.findById(id);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        const updateData = { name, description };

        if (req.file) {
          
            const oldImagePath = path.join(uploadsPath, category.image);
            fs.unlink(oldImagePath, (err) => {
                if (err && err.code !== 'ENOENT') console.error("Error deleting old image:", err);
            });
       
            updateData.image = req.file.filename;
        }

        const updatedCategory = await categoryModel.findByIdAndUpdate(id, updateData, { new: true });
        res.json({ success: true, message: "Category Updated Successfully", data: updatedCategory });

    } catch (error) {
        console.error("Update Error:", error);
        res.status(500).json({ success: false, message: "Error updating category" });
    }
};

export { addCategory, listCategory, removeCategory, updateCategory };