const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const nodemailer = require('nodemailer');
const authRoutes = require('./routes/authRoutes');
const lostRoutes = require('./routes/lostRoutes');
const foundRoutes = require('./routes/foundRoutes');
const messageRoutes = require('./routes/messageRoutes');
const mapRoutes = require('./routes/mapRoutes');
const adminRoutes = require('./routes/adminRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Lost items routes
app.use('/api/lost', lostRoutes);

// Found items routes
app.use('/api/found', foundRoutes);

// Message routes
app.use('/api/messages', messageRoutes);

// Map routes
app.use('/api/map', mapRoutes);

// Admin routes
app.use('/api/admin', adminRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
