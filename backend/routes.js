
const express = require('express');
const router = express.Router();
const axios = require('axios');
const { createPool } = require('./database');

// Create connection pool
const pool = createPool();

// API configuration
const MERCADO_PAGO_TOKEN = 'APP_USR-957794627794363-082308-6665c8bdcf1ceeeb07e1c6a3430fb855-198355928';

// Database helper functions
const userDb = {
  findUserByEmail: async (email) => {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      return null;
    }
  },
  
  createUser: async (name, email, password) => {
    try {
      const [result] = await pool.execute(
        'INSERT INTO users (name, email, password, created_at) VALUES (?, ?, ?, NOW())',
        [name, email, password]
      );
      
      return result.insertId ? { id: result.insertId, name, email } : null;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }
};

const paymentDb = {
  recordPayment: async (paymentData) => {
    try {
      const { paymentId, userId, amount, description, status } = paymentData;
      
      const [result] = await pool.execute(
        'INSERT INTO payments (payment_id, user_id, amount, description, status, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
        [paymentId, userId, amount, description, status]
      );
      
      return result.insertId ? { id: result.insertId, ...paymentData } : null;
    } catch (error) {
      console.error('Error recording payment:', error);
      return null;
    }
  },
  
  getPaymentById: async (paymentId) => {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM payments WHERE payment_id = ?',
        [paymentId]
      );
      
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error getting payment by id:', error);
      return null;
    }
  },
  
  updatePaymentStatus: async (paymentId, status) => {
    try {
      await pool.execute(
        'UPDATE payments SET status = ?, updated_at = NOW() WHERE payment_id = ?',
        [status, paymentId]
      );
      
      if (status === 'approved') {
        // If payment is approved, update user subscription
        const [payments] = await pool.execute(
          'SELECT user_id FROM payments WHERE payment_id = ?',
          [paymentId]
        );
        
        if (payments.length > 0) {
          const userId = payments[0].user_id;
          
          // Update user subscription
          await pool.execute(
            'UPDATE users SET has_subscription = 1, subscription_expiry = DATE_ADD(NOW(), INTERVAL 30 DAY) WHERE id = ?',
            [userId]
          );
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error updating payment status:', error);
      return false;
    }
  }
};

const listDb = {
  getListsByUserId: async (userId) => {
    try {
      const [lists] = await pool.execute(
        `SELECT l.*, 
          (SELECT COUNT(*) FROM items WHERE list_id = l.id) as itemCount,
          (SELECT COUNT(*) FROM items WHERE list_id = l.id AND claimed = 1) as claimedCount
         FROM lists l
         WHERE l.user_id = ?
         ORDER BY l.created_at DESC`,
        [userId]
      );
      
      return lists.map((list) => ({
        id: list.id.toString(),
        title: list.title,
        description: list.description || '',
        itemCount: parseInt(list.itemCount),
        claimedCount: parseInt(list.claimedCount),
        createdAt: list.created_at,
        image: list.image || ''
      }));
    } catch (error) {
      console.error('Error getting lists by user id:', error);
      return [];
    }
  },
  
  createList: async (userId, title, description) => {
    try {
      const [result] = await pool.execute(
        'INSERT INTO lists (user_id, title, description, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
        [userId, title, description]
      );
      
      if (!result.insertId) {
        throw new Error('Failed to create list');
      }
      
      // Create default style for the list
      await pool.execute(
        'INSERT INTO list_styles (list_id, background_color, accent_color, font_family, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
        [result.insertId, '#ffffff', '#0078ff', 'Inter, sans-serif']
      );
      
      return { 
        id: result.insertId.toString(),
        title,
        description
      };
    } catch (error) {
      console.error('Error creating list:', error);
      throw error;
    }
  },
  
  getListById: async (listId) => {
    try {
      const [lists] = await pool.execute(
        'SELECT * FROM lists WHERE id = ?',
        [listId]
      );
      
      if (lists.length === 0) {
        return null;
      }
      
      const list = lists[0];
      
      return {
        id: list.id.toString(),
        title: list.title,
        description: list.description || '',
        image: list.image || '',
        createdAt: list.created_at,
        userId: list.user_id.toString()
      };
    } catch (error) {
      console.error('Error getting list by id:', error);
      return null;
    }
  },
  
  updateList: async (listId, data) => {
    try {
      const updates = [];
      const values = [];
      
      if (data.title !== undefined) {
        updates.push('title = ?');
        values.push(data.title);
      }
      
      if (data.description !== undefined) {
        updates.push('description = ?');
        values.push(data.description);
      }
      
      if (data.image !== undefined) {
        updates.push('image = ?');
        values.push(data.image);
      }
      
      if (updates.length === 0) {
        return true; // Nothing to update
      }
      
      updates.push('updated_at = NOW()');
      
      const query = `UPDATE lists SET ${updates.join(', ')} WHERE id = ?`;
      values.push(listId);
      
      await pool.execute(query, values);
      
      return true;
    } catch (error) {
      console.error('Error updating list:', error);
      return false;
    }
  },
  
  deleteList: async (listId) => {
    try {
      // Delete all items in the list
      await pool.execute('DELETE FROM items WHERE list_id = ?', [listId]);
      
      // Delete list style
      await pool.execute('DELETE FROM list_styles WHERE list_id = ?', [listId]);
      
      // Delete the list
      await pool.execute('DELETE FROM lists WHERE id = ?', [listId]);
      
      return true;
    } catch (error) {
      console.error('Error deleting list:', error);
      return false;
    }
  },
  
  listExists: async (listId) => {
    try {
      const [rows] = await pool.execute(
        'SELECT 1 FROM lists WHERE id = ?',
        [listId]
      );
      
      return rows.length > 0;
    } catch (error) {
      console.error('Error checking if list exists:', error);
      return false;
    }
  }
};

const itemDb = {
  getItemsByListId: async (listId) => {
    try {
      const [items] = await pool.execute(
        'SELECT * FROM items WHERE list_id = ? ORDER BY created_at ASC',
        [listId]
      );
      
      return items.map((item) => ({
        id: item.id.toString(),
        name: item.name,
        description: item.description || '',
        claimed: item.claimed === 1,
        ...(item.claimed === 1 && item.claimed_by_name ? {
          claimedBy: {
            name: item.claimed_by_name,
            phone: item.claimed_by_phone || ''
          }
        } : {})
      }));
    } catch (error) {
      console.error('Error getting items by list id:', error);
      return [];
    }
  },
  
  createItem: async (listId, name, description) => {
    try {
      const [result] = await pool.execute(
        'INSERT INTO items (list_id, name, description, claimed, created_at, updated_at) VALUES (?, ?, ?, 0, NOW(), NOW())',
        [listId, name, description]
      );
      
      return {
        id: result.insertId.toString(),
        name,
        description,
        claimed: false
      };
    } catch (error) {
      console.error('Error creating item:', error);
      throw error;
    }
  },
  
  updateItem: async (itemId, data) => {
    try {
      const updates = [];
      const values = [];
      
      if (data.name !== undefined) {
        updates.push('name = ?');
        values.push(data.name);
      }
      
      if (data.description !== undefined) {
        updates.push('description = ?');
        values.push(data.description);
      }
      
      if (data.claimed !== undefined) {
        updates.push('claimed = ?');
        values.push(data.claimed ? 1 : 0);
        
        // If unclaiming, clear claimed_by fields
        if (!data.claimed) {
          updates.push('claimed_by_name = NULL');
          updates.push('claimed_by_phone = NULL');
        }
      }
      
      if (updates.length === 0) {
        // Nothing to update, get the current item
        const [items] = await pool.execute('SELECT * FROM items WHERE id = ?', [itemId]);
        if (items.length === 0) {
          throw new Error('Item not found');
        }
        
        const item = items[0];
        return {
          id: item.id.toString(),
          name: item.name,
          description: item.description || '',
          claimed: item.claimed === 1,
          ...(item.claimed === 1 && item.claimed_by_name ? {
            claimedBy: {
              name: item.claimed_by_name,
              phone: item.claimed_by_phone || ''
            }
          } : {})
        };
      }
      
      updates.push('updated_at = NOW()');
      
      const query = `UPDATE items SET ${updates.join(', ')} WHERE id = ?`;
      values.push(itemId);
      
      await pool.execute(query, values);
      
      // Get the updated item
      const [items] = await pool.execute('SELECT * FROM items WHERE id = ?', [itemId]);
      if (items.length === 0) {
        throw new Error('Item not found');
      }
      
      const item = items[0];
      return {
        id: item.id.toString(),
        name: item.name,
        description: item.description || '',
        claimed: item.claimed === 1,
        ...(item.claimed === 1 && item.claimed_by_name ? {
          claimedBy: {
            name: item.claimed_by_name,
            phone: item.claimed_by_phone || ''
          }
        } : {})
      };
    } catch (error) {
      console.error('Error updating item:', error);
      throw error;
    }
  },
  
  deleteItem: async (itemId) => {
    try {
      await pool.execute('DELETE FROM items WHERE id = ?', [itemId]);
      
      return true;
    } catch (error) {
      console.error('Error deleting item:', error);
      return false;
    }
  },
  
  claimItem: async (itemId, name, phone) => {
    try {
      await pool.execute(
        'UPDATE items SET claimed = 1, claimed_by_name = ?, claimed_by_phone = ?, updated_at = NOW() WHERE id = ?',
        [name, phone, itemId]
      );
      
      // Get the updated item
      const [items] = await pool.execute('SELECT * FROM items WHERE id = ?', [itemId]);
      if (items.length === 0) {
        throw new Error('Item not found');
      }
      
      const item = items[0];
      return {
        id: item.id.toString(),
        name: item.name,
        description: item.description || '',
        claimed: true,
        claimedBy: {
          name: item.claimed_by_name,
          phone: item.claimed_by_phone || ''
        }
      };
    } catch (error) {
      console.error('Error claiming item:', error);
      throw error;
    }
  }
};

const listStyleDb = {
  getListStyleByListId: async (listId) => {
    try {
      const [styles] = await pool.execute(
        'SELECT * FROM list_styles WHERE list_id = ?',
        [listId]
      );
      
      if (styles.length === 0) {
        return null;
      }
      
      const style = styles[0];
      
      return {
        backgroundColor: style.background_color || '#ffffff',
        accentColor: style.accent_color || '#0078ff',
        fontFamily: style.font_family || 'Inter, sans-serif',
        borderRadius: style.border_radius || 'rounded-2xl',
        itemSpacing: style.item_spacing || '4',
        backgroundImage: style.background_image || '',
        backgroundPattern: style.background_pattern || '',
        titleColor: style.title_color || '',
        textColor: style.text_color || ''
      };
    } catch (error) {
      console.error('Error getting list style by list id:', error);
      return null;
    }
  },
  
  updateListStyle: async (listId, styleData) => {
    try {
      // Check if style exists for this list
      const [styles] = await pool.execute(
        'SELECT * FROM list_styles WHERE list_id = ?',
        [listId]
      );
      
      if (styles.length === 0) {
        // Create new style
        await pool.execute(
          `INSERT INTO list_styles 
           (list_id, background_color, accent_color, font_family, border_radius, item_spacing,
            background_image, background_pattern, title_color, text_color, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            listId,
            styleData.backgroundColor || '#ffffff',
            styleData.accentColor || '#0078ff',
            styleData.fontFamily || 'Inter, sans-serif',
            styleData.borderRadius || 'rounded-2xl',
            styleData.itemSpacing || '4',
            styleData.backgroundImage || '',
            styleData.backgroundPattern || '',
            styleData.titleColor || '',
            styleData.textColor || ''
          ]
        );
      } else {
        // Update existing style
        const updates = [];
        const values = [];
        
        if (styleData.backgroundColor !== undefined) {
          updates.push('background_color = ?');
          values.push(styleData.backgroundColor);
        }
        
        if (styleData.accentColor !== undefined) {
          updates.push('accent_color = ?');
          values.push(styleData.accentColor);
        }
        
        if (styleData.fontFamily !== undefined) {
          updates.push('font_family = ?');
          values.push(styleData.fontFamily);
        }
        
        if (styleData.borderRadius !== undefined) {
          updates.push('border_radius = ?');
          values.push(styleData.borderRadius);
        }
        
        if (styleData.itemSpacing !== undefined) {
          updates.push('item_spacing = ?');
          values.push(styleData.itemSpacing);
        }
        
        if (styleData.backgroundImage !== undefined) {
          updates.push('background_image = ?');
          values.push(styleData.backgroundImage);
        }
        
        if (styleData.backgroundPattern !== undefined) {
          updates.push('background_pattern = ?');
          values.push(styleData.backgroundPattern);
        }
        
        if (styleData.titleColor !== undefined) {
          updates.push('title_color = ?');
          values.push(styleData.titleColor);
        }
        
        if (styleData.textColor !== undefined) {
          updates.push('text_color = ?');
          values.push(styleData.textColor);
        }
        
        if (updates.length > 0) {
          updates.push('updated_at = NOW()');
          
          const query = `UPDATE list_styles SET ${updates.join(', ')} WHERE list_id = ?`;
          values.push(listId);
          
          await pool.execute(query, values);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error updating list style:', error);
      return false;
    }
  }
};

// Routes
// Create PIX payment
router.post('/pix', async (req, res) => {
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
router.get('/payments/:id', async (req, res) => {
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
router.post('/users', async (req, res) => {
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
router.post('/login', async (req, res) => {
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
router.get('/users/:userId/lists', async (req, res) => {
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
router.post('/users/:userId/lists', async (req, res) => {
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
router.get('/lists/:listId', async (req, res) => {
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
router.get('/lists/:listId/exists', async (req, res) => {
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
router.put('/lists/:listId', async (req, res) => {
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
router.delete('/lists/:listId', async (req, res) => {
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
router.get('/lists/:listId/items', async (req, res) => {
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
router.post('/lists/:listId/items', async (req, res) => {
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
router.put('/lists/:listId/items/:itemId', async (req, res) => {
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
router.delete('/lists/:listId/items/:itemId', async (req, res) => {
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
router.post('/lists/:listId/items/:itemId/claim', async (req, res) => {
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

module.exports = router;
