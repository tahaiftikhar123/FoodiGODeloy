// backend/seedAdmin.js

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import 'dotenv/config'; // Make sure to load environment variables
import adminModel from './models/adminModel.js'; 

// --- Configuration ---
const ADMIN_EMAIL = 'admin@gmail.com'; // Change this for new users
const ADMIN_NAME = 'Admin User';
const ADMIN_PASSWORD = 'admin123'; // Change this for new users
const ADMIN_SALT_ROUNDS = 10; // Must match your registration logic

// --- Database Connection (Customize if needed) ---
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected for Seeding.");
    } catch (error) {
        console.error("MongoDB Connection Failed:", error.message);
        process.exit(1);
    }
};

const createAdmin = async () => {
    await connectDB();
    
    try {
        // 1. Check if Admin already exists
        const existingAdmin = await adminModel.findOne({ email: ADMIN_EMAIL });
        if (existingAdmin) {
            console.log(`❌ Admin with email ${ADMIN_EMAIL} already exists. Skipping.`);
            return;
        }

        // 2. Generate Hash (ensures 100% compatibility with your login logic)
        const salt = await bcrypt.genSalt(ADMIN_SALT_ROUNDS);
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

        // 3. Create and Save the Admin User
        const newAdmin = new adminModel({
            name: ADMIN_NAME,
            email: ADMIN_EMAIL,
            password: hashedPassword,
            role: 'admin'
        });

        await newAdmin.save();

        console.log(`✅ Successfully created new Admin user: ${ADMIN_EMAIL}`);
        console.log(`   Name: ${ADMIN_NAME}`);
        console.log(`   Password (Plaintext): ${ADMIN_PASSWORD}`); // For immediate use
        
    } catch (error) {
        console.error("🚨 Error during Admin creation:", error.message);
    } finally {
        // Close connection gracefully
        await mongoose.connection.close();
        console.log("MongoDB connection closed.");
    }
};

// Start the process
createAdmin();