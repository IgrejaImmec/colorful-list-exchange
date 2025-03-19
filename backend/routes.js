
const express = require('express');
const axios = require('axios');
const mysql = require('mysql2/promise');

const router = express.Router();

// Database connection configuration
const dbConfig = {
  host: 'srv1196.hstgr.io', 
  user: 'u455784928_QuedSoft',
  password: 'Sdwpyt*p1',
  database: 'u455784928_BankData',
  port: 3306
};

let pool = null;

// Initialize the database connection pool
const initializePool = async () => {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
    console.log('Database pool initialized');
  }
  return pool;
};

// API configuration
const MERCADO_PAGO_TOKEN = 'APP_USR-957794627794363-082308-6665c8bdcf1ceeeb07e1c6a3430fb855-198355928';

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
      const pool = await initializePool();
      await pool.execute(
        'INSERT INTO payments (payment_id, user_id, amount, description, status, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
        [response.data.id, req.body.userId || 'anonymous', paymentData.transaction_amount, paymentData.description, response.data.status]
      );
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
    const pool = await initializePool();
    await pool.execute(
      'UPDATE payments SET status = ?, updated_at = NOW() WHERE payment_id = ?',
      [response.data.status, id]
    );
    
    // If payment is approved, update user subscription
    if (response.data.status === 'approved') {
      const [payments] = await pool.execute(
        'SELECT user_id FROM payments WHERE payment_id = ?',
        [id]
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
    
    const pool = await initializePool();
    
    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }
    
    // Create new user
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, created_at) VALUES (?, ?, ?, NOW())',
      [name, email, password]
    );
    
    const newUser = {
      id: result.insertId,
      name,
      email
    };
    
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
    
    const pool = await initializePool();
    
    // Find user by email
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    const user = users[0];
    
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
    
    const pool = await initializePool();
    
    const [lists] = await pool.execute(
      `SELECT l.*, 
        (SELECT COUNT(*) FROM items WHERE list_id = l.id) as itemCount,
        (SELECT COUNT(*) FROM items WHERE list_id = l.id AND claimed = 1) as claimedCount
        FROM lists l
        WHERE l.user_id = ?
        ORDER BY l.created_at DESC`,
      [userId]
    );
    
    const formattedLists = lists.map(list => ({
      id: list.id.toString(),
      title: list.title,
      description: list.description || '',
      itemCount: parseInt(list.itemCount),
      claimedCount: parseInt(list.claimedCount),
      createdAt: list.created_at,
      image: list.image || ''
    }));
    
    res.json(formattedLists);
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
    
    const pool = await initializePool();
    
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
    
    const newList = {
      id: result.insertId.toString(),
      title,
      description
    };
    
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
    
    const pool = await initializePool();
    
    const [lists] = await pool.execute(
      'SELECT * FROM lists WHERE id = ?',
      [listId]
    );
    
    if (lists.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'List not found'
      });
    }
    
    const list = lists[0];
    
    // Get list style
    const [styles] = await pool.execute(
      'SELECT * FROM list_styles WHERE list_id = ?',
      [listId]
    );
    
    const style = styles.length > 0 ? {
      backgroundColor: styles[0].background_color || '#ffffff',
      accentColor: styles[0].accent_color || '#0078ff',
      fontFamily: styles[0].font_family || 'Inter, sans-serif',
      borderRadius: styles[0].border_radius || 'rounded-2xl',
      itemSpacing: styles[0].item_spacing || '4',
      backgroundImage: styles[0].background_image || '',
      backgroundPattern: styles[0].background_pattern || '',
      titleColor: styles[0].title_color || '',
      textColor: styles[0].text_color || '',
    } : {
      backgroundColor: '#ffffff',
      accentColor: '#0078ff',
      fontFamily: 'Inter, sans-serif',
      borderRadius: 'rounded-2xl',
      itemSpacing: '4',
      backgroundImage: '',
      backgroundPattern: '',
      titleColor: '',
      textColor: '',
    };
    
    res.json({
      id: list.id.toString(),
      title: list.title,
      description: list.description || '',
      image: list.image || '',
      createdAt: list.created_at,
      userId: list.user_id.toString(),
      style
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
    
    const pool = await initializePool();
    
    const [rows] = await pool.execute(
      'SELECT 1 FROM lists WHERE id = ?',
      [listId]
    );
    
    res.json({ exists: rows.length > 0 });
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
    
    const pool = await initializePool();
    
    // Update the list
    if (title !== undefined || description !== undefined || image !== undefined) {
      const updates = [];
      const values = [];
      
      if (title !== undefined) {
        updates.push('title = ?');
        values.push(title);
      }
      
      if (description !== undefined) {
        updates.push('description = ?');
        values.push(description);
      }
      
      if (image !== undefined) {
        updates.push('image = ?');
        values.push(image);
      }
      
      if (updates.length > 0) {
        updates.push('updated_at = NOW()');
        
        const query = `UPDATE lists SET ${updates.join(', ')} WHERE id = ?`;
        values.push(listId);
        
        await pool.execute(query, values);
      }
    }
    
    // Update the list style if provided
    if (style) {
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
            style.backgroundColor || '#ffffff',
            style.accentColor || '#0078ff',
            style.fontFamily || 'Inter, sans-serif',
            style.borderRadius || 'rounded-2xl',
            style.itemSpacing || '4',
            style.backgroundImage || '',
            style.backgroundPattern || '',
            style.titleColor || '',
            style.textColor || ''
          ]
        );
      } else {
        // Update existing style
        const updates = [];
        const values = [];
        
        if (style.backgroundColor !== undefined) {
          updates.push('background_color = ?');
          values.push(style.backgroundColor);
        }
        
        if (style.accentColor !== undefined) {
          updates.push('accent_color = ?');
          values.push(style.accentColor);
        }
        
        if (style.fontFamily !== undefined) {
          updates.push('font_family = ?');
          values.push(style.fontFamily);
        }
        
        if (style.borderRadius !== undefined) {
          updates.push('border_radius = ?');
          values.push(style.borderRadius);
        }
        
        if (style.itemSpacing !== undefined) {
          updates.push('item_spacing = ?');
          values.push(style.itemSpacing);
        }
        
        if (style.backgroundImage !== undefined) {
          updates.push('background_image = ?');
          values.push(style.backgroundImage);
        }
        
        if (style.backgroundPattern !== undefined) {
          updates.push('background_pattern = ?');
          values.push(style.backgroundPattern);
        }
        
        if (style.titleColor !== undefined) {
          updates.push('title_color = ?');
          values.push(style.titleColor);
        }
        
        if (style.textColor !== undefined) {
          updates.push('text_color = ?');
          values.push(style.textColor);
        }
        
        if (updates.length > 0) {
          updates.push('updated_at = NOW()');
          
          const query = `UPDATE list_styles SET ${updates.join(', ')} WHERE list_id = ?`;
          values.push(listId);
          
          await pool.execute(query, values);
        }
      }
    }
    
    // Get the updated list and style
    const [lists] = await pool.execute('SELECT * FROM lists WHERE id = ?', [listId]);
    const [styles] = await pool.execute('SELECT * FROM list_styles WHERE list_id = ?', [listId]);
    
    const updatedList = lists[0];
    const updatedStyle = styles.length > 0 ? {
      backgroundColor: styles[0].background_color || '#ffffff',
      accentColor: styles[0].accent_color || '#0078ff',
      fontFamily: styles[0].font_family || 'Inter, sans-serif',
      borderRadius: styles[0].border_radius || 'rounded-2xl',
      itemSpacing: styles[0].item_spacing || '4',
      backgroundImage: styles[0].background_image || '',
      backgroundPattern: styles[0].background_pattern || '',
      titleColor: styles[0].title_color || '',
      textColor: styles[0].text_color || ''
    } : {
      backgroundColor: '#ffffff',
      accentColor: '#0078ff',
      fontFamily: 'Inter, sans-serif',
      borderRadius: 'rounded-2xl',
      itemSpacing: '4',
      backgroundImage: '',
      backgroundPattern: '',
      titleColor: '',
      textColor: '',
    };
    
    res.json({
      id: updatedList.id.toString(),
      title: updatedList.title,
      description: updatedList.description || '',
      image: updatedList.image || '',
      style: updatedStyle
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
    
    const pool = await initializePool();
    
    // Delete all items in the list
    await pool.execute('DELETE FROM items WHERE list_id = ?', [listId]);
    
    // Delete list style
    await pool.execute('DELETE FROM list_styles WHERE list_id = ?', [listId]);
    
    // Delete the list
    await pool.execute('DELETE FROM lists WHERE id = ?', [listId]);
    
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
    
    const pool = await initializePool();
    
    const [items] = await pool.execute(
      'SELECT * FROM items WHERE list_id = ? ORDER BY created_at ASC',
      [listId]
    );
    
    const formattedItems = items.map(item => ({
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
    
    res.json(formattedItems);
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
    
    const pool = await initializePool();
    
    const [result] = await pool.execute(
      'INSERT INTO items (list_id, name, description, claimed, created_at, updated_at) VALUES (?, ?, ?, 0, NOW(), NOW())',
      [listId, name, description]
    );
    
    const newItem = {
      id: result.insertId.toString(),
      name,
      description,
      claimed: false
    };
    
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
    const { itemId } = req.params;
    const data = req.body;
    
    const pool = await initializePool();
    
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
    
    if (updates.length > 0) {
      updates.push('updated_at = NOW()');
      
      const query = `UPDATE items SET ${updates.join(', ')} WHERE id = ?`;
      values.push(itemId);
      
      await pool.execute(query, values);
    }
    
    // Get the updated item
    const [items] = await pool.execute('SELECT * FROM items WHERE id = ?', [itemId]);
    
    if (items.length === 0) {
      throw new Error('Item not found');
    }
    
    const item = items[0];
    const updatedItem = {
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
    const { itemId } = req.params;
    
    const pool = await initializePool();
    
    await pool.execute('DELETE FROM items WHERE id = ?', [itemId]);
    
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
    const { itemId } = req.params;
    const { name, phone } = req.body;
    
    const pool = await initializePool();
    
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
    const updatedItem = {
      id: item.id.toString(),
      name: item.name,
      description: item.description || '',
      claimed: true,
      claimedBy: {
        name: item.claimed_by_name,
        phone: item.claimed_by_phone || ''
      }
    };
    
    res.json(updatedItem);
  } catch (error) {
    console.error('Error claiming item:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check endpoint
router.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = router;
