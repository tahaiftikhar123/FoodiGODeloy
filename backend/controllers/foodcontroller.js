import FoodModel from "../models/foodmodel.js";
import fs from "fs"; // Needed for removefood

// --- Configuration for Low Stock Alert ---
const LOW_STOCK_THRESHOLD = 10; 
// -----------------------------------------

// Helper function for admin low stock notification (can be called from order controller)
const checkLowStock = async () => { 
    try {
        const lowStockItems = await FoodModel.find({
            stock: { $gt: 0, $lte: LOW_STOCK_THRESHOLD }
        }).select('name stock'); 

        if (lowStockItems.length > 0) {
            // 🎯 ADMIN NOTIFICATION LOGIC GOES HERE 🎯
            console.log("\n🚨 LOW STOCK ALERT FOR ADMIN:");
            lowStockItems.forEach(item => {
                console.log(`- ${item.name} is running low (Stock: ${item.stock})`);
            });
            
            return { success: true, count: lowStockItems.length, items: lowStockItems };
        }
        return { success: true, count: 0, message: "Stock levels are fine." };
    } catch (error) {
        console.error("Error checking low stock:", error);
        return { success: false, message: "Error running stock check." };
    }
};

// 1. ADD FOOD Controller
const addFood = async (req, res) => {
    try {
        console.log("Inside addFood controller", { body: req.body, file: req.file });
        
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Image is required" });
        }

        const { name, description, price, category, stock } = req.body; 

        if (!name || !description || !price || !category || stock === undefined || stock === null) {
            return res.status(400).json({ success: false, message: "All fields including stock are required" });
        }
        if (isNaN(price) || price < 0) {
            return res.status(400).json({ success: false, message: "Price must be a valid positive number" });
        }
        const parsedStock = parseInt(stock);
        if (isNaN(parsedStock) || parsedStock < 0) {
            return res.status(400).json({ success: false, message: "Stock must be a non-negative integer" });
        }

        const image_filename = req.file.filename;

        const food = new FoodModel({
            name,
            description,
            price: Number(price),
            category,
            image: image_filename,
            stock: parsedStock, 
        });

        await food.save();
        res.json({ success: true, message: "Food Added", data: food });
    } catch (error) {
        console.error("Error in addFood:", error);
        if (error.name === "ValidationError") {
            return res.status(400).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: "Server Error" });
    }
};


// 2. LIST FOOD Controller
const listfood = async (req,res)=>{
    try{
        const foods = await FoodModel.find({}); 
        res.json({success:true,data:foods})
    }
    catch(error){
        console.log(error)
        res.json({sucess:false,message:"error"})
    }
}


// 3. REMOVE FOOD Controller
const removefood = async (req, res) => {
    try {
        const { id } = req.body; 
        const food = await FoodModel.findById(id);

        if (!food) {
            return res.status(404).json({ success: false, message: "Food not found" });
        }

        const imagePath = `uploads/${food.image}`;
        fs.unlink(imagePath, (err) => {
            if (err) console.error("Error deleting image:", err.message);
        });

        await FoodModel.findByIdAndDelete(id);

        res.json({ success: true, message: "Food removed successfully" });
    } catch (error) {
        console.error("Error in removefood:", error);
        res.status(500).json({ success: false, message: "Error removing food" });
    }
};


// 4. UPDATE STOCK Controller (Legacy/Dedicated Stock Update)
const updateStock = async (req, res) => {
    try {
        const { id, stock } = req.body;
        
        if (!id || stock === undefined || stock === null || isNaN(stock) || stock < 0) {
            return res.status(400).json({ success: false, message: "Invalid ID or stock value." });
        }

        const updatedFood = await FoodModel.findByIdAndUpdate(
            id,
            { stock: Number(stock) },
            { new: true, runValidators: true }
        );

        if (!updatedFood) {
            return res.status(404).json({ success: false, message: "Food item not found." });
        }

        await checkLowStock(); 

        res.json({ success: true, message: "Stock updated successfully", data: updatedFood });

    } catch (error) {
        console.error("Error in updateStock:", error);
        res.status(500).json({ success: false, message: "Server Error during stock update." });
    }
};


// 5. UPDATE DETAILS Controller (Handles Stock, Category, and Price)
const updateDetails = async (req, res) => {
    try {
        const { id, stock, category, price } = req.body;
        
        // Basic Validation
        if (!id || stock === undefined || category === undefined || price === undefined) {
            return res.status(400).json({ success: false, message: "Missing item ID or fields." });
        }
        
        // Find and update the food item
        const updatedFood = await FoodModel.findByIdAndUpdate(
            id,
            { 
                stock: Number(stock), 
                category: category, 
                price: Number(price) 
            },
            { new: true, runValidators: true } 
        );

        if (!updatedFood) {
            return res.status(404).json({ success: false, message: "Food item not found." });
        }
        
        // Optional: Trigger low stock check after update
        if (updatedFood.stock <= LOW_STOCK_THRESHOLD) {
             await checkLowStock(); 
        }

        res.json({ success: true, message: "Item details updated successfully", data: updatedFood });

    } catch (error) {
        console.error("Error in updateDetails:", error);
        res.status(500).json({ success: false, message: "Server Error during item update. Check backend console." });
    }
};


// Final exports line in the backend file:
export { addFood, listfood, removefood, checkLowStock, updateStock, updateDetails };