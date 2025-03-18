
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { userDb, paymentDb, listDb, itemDb, listStyleDb } = require('./src/services/dbService');

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
    
    // Record payment in our database
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

// Lists endpoints
// Get all lists for a user
app.get('/server/users/:userId/lists', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const lists = await listDb.getListsByUserId(userId);
    
    res.json(lists);
  } catch (error) {
    console.error('Error getting user lists:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create a new list
app.post('/server/users/:userId/lists', async (req, res) => {
  try {
    const { userId } = req.params;
    const { title, description } = req.body;
    
    const newList = await listDb.createList(userId, title, description);
    
    res.status(201).json(newList);
  } catch (error) {
    console.error('Error creating list:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get a list by ID
app.get('/server/lists/:listId', async (req, res) => {
  try {
    const { listId } = req.params;
    
    const list = await listDb.getListById(listId);
    if (!list) {
      return res.status(404).json({
        success: false,
        error: 'List not found'
      });
    }
    
    // Get list style
    const style = await listStyleDb.getListStyleByListId(listId);
    
    res.json({
      ...list,
      style: style || {
        backgroundColor: '#ffffff',
        accentColor: '#0078ff',
        fontFamily: 'Inter, sans-serif',
        borderRadius: 'rounded-2xl',
        itemSpacing: '4',
        backgroundImage: '',
        backgroundPattern: '',
        titleColor: '',
        textColor: '',
      }
    });
  } catch (error) {
    console.error('Error getting list:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Check if a list exists
app.get('/server/lists/:listId/exists', async (req, res) => {
  try {
    const { listId } = req.params;
    
    const exists = await listDb.listExists(listId);
    
    res.json({ exists });
  } catch (error) {
    console.error('Error checking if list exists:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update a list
app.put('/server/lists/:listId', async (req, res) => {
  try {
    const { listId } = req.params;
    const { title, description, image, style } = req.body;
    
    // Update the list
    await listDb.updateList(listId, { title, description, image });
    
    // Update the list style if provided
    if (style) {
      await listStyleDb.updateListStyle(listId, style);
    }
    
    // Get the updated list and style
    const updatedList = await listDb.getListById(listId);
    const updatedStyle = await listStyleDb.getListStyleByListId(listId);
    
    res.json({
      ...updatedList,
      style: updatedStyle || {
        backgroundColor: '#ffffff',
        accentColor: '#0078ff',
        fontFamily: 'Inter, sans-serif',
        borderRadius: 'rounded-2xl',
        itemSpacing: '4',
        backgroundImage: '',
        backgroundPattern: '',
        titleColor: '',
        textColor: '',
      }
    });
  } catch (error) {
    console.error('Error updating list:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete a list
app.delete('/server/lists/:listId', async (req, res) => {
  try {
    const { listId } = req.params;
    
    await listDb.deleteList(listId);
    
    res.json({
      success: true
    });
  } catch (error) {
    console.error('Error deleting list:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Items endpoints
// Get all items for a list
app.get('/server/lists/:listId/items', async (req, res) => {
  try {
    const { listId } = req.params;
    
    const items = await itemDb.getItemsByListId(listId);
    
    res.json(items);
  } catch (error) {
    console.error('Error getting list items:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create a new item
app.post('/server/lists/:listId/items', async (req, res) => {
  try {
    const { listId } = req.params;
    const { name, description } = req.body;
    
    const newItem = await itemDb.createItem(listId, name, description);
    
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update an item
app.put('/server/lists/:listId/items/:itemId', async (req, res) => {
  try {
    const { listId, itemId } = req.params;
    const updateData = req.body;
    
    const updatedItem = await itemDb.updateItem(itemId, updateData);
    
    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete an item
app.delete('/server/lists/:listId/items/:itemId', async (req, res) => {
  try {
    const { listId, itemId } = req.params;
    
    await itemDb.deleteItem(itemId);
    
    res.json({
      success: true
    });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Claim an item
app.post('/server/lists/:listId/items/:itemId/claim', async (req, res) => {
  try {
    const { listId, itemId } = req.params;
    const { name, phone } = req.body;
    
    const updatedItem = await itemDb.claimItem(itemId, name, phone);
    
    res.json(updatedItem);
  } catch (error) {
    console.error('Error claiming item:', error);
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
