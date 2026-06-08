const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const taskRoutes = require('./routes/taskRoutes');

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for request body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP Request Logger Middleware (Morgan) - runs only in development/default
app.use(morgan('dev'));

// Mount Routes
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

// Start the Server
app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
