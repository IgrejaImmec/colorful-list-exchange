
const express = require('express');
const cors = require('cors');
const routes = require('./routes');

// Initialize express application
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get('/', (req, res) => {
  res.send('ListaAi API is running');
});

// Apply all routes
app.use('/server', routes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
