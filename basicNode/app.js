const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const mongoose = require('mongoose');
const taskRoutes = require('./routes/taskRoutes');
const authRoutes = require('./routes/authRoutes');
const TaskModel = require('./models/taskModel');

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskdb';

// Enable Cross-Origin Resource Sharing (CORS) for React integration
app.use(cors());

// Middleware for request body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP Request Logger Middleware (Morgan) - runs only in development/default
app.use(morgan('dev'));

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Root Route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the basicNode API. Visit /api/tasks to manage tasks.'
  });
});

// 404 Route handler for undefined paths
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API Route Not Found'
  });
});

// Connect to MongoDB and start the server
mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB successfully.');
    
    // Seed default user and tasks if the database is empty
    await TaskModel.seedData();

    // Start the Server
    app.listen(PORT, () => {
      console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection error:', err.message);
    process.exit(1);
  });
