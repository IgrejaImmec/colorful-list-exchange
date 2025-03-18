
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { userDb, paymentDb } = require('./src/services/dbService');

const app = express();
const PORT = process.env.PORT || 3001;

// API configuration
const MERCADO_PAGO_TOKEN = 'APP_USR-957794627794363-082308-6665c8bdcf1ceeeb07e1c6a3430fb855-198355928';

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('ListaAi API is running');
});

// Create PIX payment
app.post('/server/pix', async (req, res) => {
  try {
    const paymentData = req.body;
    
    // Call Mercado Pago API to create PIX payment
    const response = await axios.post(
      'https://api.mercadopago.com/v1/payments', 
      {
        ...paymentData,
        payment_method_id: paymentData.paymentMethodId
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${MERCADO_PAGO_TOKEN}`
        }
      }
    );
    
    // Record payment in our database (for production use)
    if (response.data && response.data.id) {
      await paymentDb.recordPayment({
        paymentId: response.data.id,
        userId: req.body.userId || 'anonymous',
        amount: paymentData.transaction_amount,
        description: paymentData.description,
        status: response.data.status
      });
    }
    
    res.json({
      success: true,
      result: response.data,
      point_of_interaction: response.data.point_of_interaction
    });
  } catch (error) {
    console.error('Error creating PIX payment:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data?.message || error.message
    });
  }
});

// Verify payment status
app.get('/server/payments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const response = await axios.get(`https://api.mercadopago.com/v1/payments/${id}`, {
      headers: {
        Authorization: `Bearer ${MERCADO_PAGO_TOKEN}`
      }
    });
    
    // Update payment status in our database
    await paymentDb.updatePaymentStatus(id, response.data.status);
    
    res.json({
      success: true,
      status: response.data.status,
      approved: response.data.status === 'approved',
      data: response.data
    });
  } catch (error) {
    console.error('Error verifying payment:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data?.message || error.message
    });
  }
});

// User registration
app.post('/server/users', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await userDb.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }
    
    // Create new user
    const newUser = await userDb.createUser(name, email, password);
    
    res.status(201).json({
      success: true,
      user: newUser
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// User login
app.post('/server/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await userDb.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    // Validate password (in production, compare hashed passwords)
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        hasSubscription: user.has_subscription === 1,
        subscriptionExpiry: user.subscription_expiry
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
