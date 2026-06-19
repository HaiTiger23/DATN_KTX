import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
dotenv.config();

const testChat = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            family: 4,
            serverSelectionTimeoutMS: 5000
        });
        console.log("Connected to MongoDB");

        // Get an Admin and a Student
        const User = (await import('./src/models/User.js')).default;
        
        const admin = await User.findOne({ role: { $in: ['admin', 'Admin'] } });
        const student = await User.findOne({ role: { $in: ['student', 'Student'] } });
        
        if (!admin || !student) {
            console.log("Cannot find admin or student");
            return;
        }

        const adminToken = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const studentToken = jwt.sign({ id: student._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        const sendChat = async (token, message, isAdmin = false) => {
            const url = isAdmin ? 'http://localhost:5556/api/admin/chat' : 'http://localhost:5556/api/student/chat';
            // Wait, does the project use /api/admin/chat or /api/student/chat? Or is it /api/chat?
            // Let's assume it's /api/chat or we can check the routes.
            // Let's check routes first. Let's just try /api/admin/chat and /api/student/chat based on typical structure.
        }

        console.log("Admin:", admin.email);
        console.log("Student:", student.email);

    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
};

testChat();
