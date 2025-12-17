// backend/seedAdmin.js

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import 'dotenv/config'; 
import adminModel from './models/adminModel.js'; 

const ADMIN_EMAIL = 'wajiha@gmail.com'; 
const ADMIN_NAME = 'wajiha User';
const ADMIN_PASSWORD = 'wajiha123'; 
const ADMIN_SALT_ROUNDS = 10; 


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
       
        const existingAdmin = await adminModel.findOne({ email: ADMIN_EMAIL });
        if (existingAdmin) {
            console.log(`❌ Admin with email ${ADMIN_EMAIL} already exists. Skipping.`);
            return;
        }

       
        const salt = await bcrypt.genSalt(ADMIN_SALT_ROUNDS);
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

      
        const newAdmin = new adminModel({
            name: ADMIN_NAME,
            email: ADMIN_EMAIL,
            password: hashedPassword,
            role: 'admin'
        });

        await newAdmin.save();

        console.log(`✅ Successfully created new Admin user: ${ADMIN_EMAIL}`);
        console.log(`   Name: ${ADMIN_NAME}`);
        console.log(`   Password (Plaintext): ${ADMIN_PASSWORD}`); 
        
    } catch (error) {
        console.error("🚨 Error during Admin creation:", error.message);
    } finally {
        await mongoose.connection.close();
        console.log("MongoDB connection closed.");
    }
};


createAdmin();