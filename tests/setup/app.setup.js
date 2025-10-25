const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import your routes
try {
  const taskRoutes = require('../../../src/routes/v1/task.routes');
  app.use('/api/v1/task', taskRoutes);
  console.log('✅ Routes loaded successfully');
} catch (error) {
  console.log('❌ Failed to load routes:', error.message);
}

// Add error handling middleware to catch and format errors
app.use((error, req, res, next) => {
  console.error('=== UNHANDLED ERROR ===');
  console.error('Error message:', error.message);
  console.error('Error stack:', error.stack);
  console.error('=======================');

  res.status(500).json({
    success: false,
    error: {
      message: error.message,
      stack: process.env.NODE_ENV === 'test' ? error.stack : undefined,
    },
  });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

module.exports = app;
