import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/admin/studentRoutes.js';
import roomRoutes from './routes/admin/roomRoutes.js';
import requestRoutes from './routes/admin/requestRoutes.js';
import contractRoutes from './routes/admin/contractRoutes.js';
import feedbackRoutes from './routes/admin/feedbackRoutes.js';
import settingRoutes from './routes/admin/settingRoutes.js';
import knowledgeRoutes from './routes/admin/knowledgeRoutes.js';
import notificationRoutes from './routes/admin/notificationRoutes.js';
import invoiceRoutes from './routes/admin/invoiceRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import studentPortalRoutes from './routes/studentRoutes.js';

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin/students', studentRoutes);
app.use('/api/admin/rooms', roomRoutes);
app.use('/api/admin/requests', requestRoutes);
app.use('/api/admin/contracts', contractRoutes);
app.use('/api/admin/feedbacks', feedbackRoutes);
app.use('/api/admin/settings', settingRoutes);
app.use('/api/admin/knowledge', knowledgeRoutes);
app.use('/api/admin/notifications', notificationRoutes);
app.use('/api/admin/invoices', invoiceRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/student', studentPortalRoutes);

app.get('/', (req, res) => {
  res.send('Dorm Management API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
