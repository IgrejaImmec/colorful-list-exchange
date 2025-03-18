
// Database service for connection to MySQL
// This should ONLY be used in a non-browser environment

// Check if we're running in a browser environment
const isBrowser = typeof window !== 'undefined';

// Only import mysql in server environment
let mysql: any = null;
if (!isBrowser) {
  // This import will be skipped in browser environments
  // Dynamic import to avoid browser errors
  try {
    mysql = require('mysql2/promise');
  } catch (error) {
    console.error('Failed to import mysql2/promise:', error);
  }
}

// Database connection configuration
const dbConfig = {
  host: 'srv1196.hstgr.io', 
  user: 'u455784928_QuedSoft',
  password: 'Sdwpyt*p1',
  database: 'u455784928_BankData',
  port: 3306
};

// Create a pool connection to MySQL
let pool: any = null;

// Test the database connection
const testConnection = async (): Promise<boolean> => {
  // In browser environments, we'll always return false
  if (isBrowser) {
    console.log('Running in browser environment - database connections not supported');
    return false;
  }
  
  try {
    // Only create the pool if it doesn't exist and we're not in a browser
    if (!pool && !isBrowser && mysql) {
      pool = mysql.createPool(dbConfig);
    }
    
    // Test the connection
    if (pool) {
      const connection = await pool.getConnection();
      connection.release();
      console.log('Database connection successful');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
};

// User database operations
const userDb = {
  findUserByEmail: async (email: string) => {
    if (isBrowser) {
      console.log('Running in browser - database operations not supported');
      return null;
    }
    
    try {
      if (!pool) await testConnection();
      
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
  
  createUser: async (name: string, email: string, password: string) => {
    if (isBrowser) {
      console.log('Running in browser - database operations not supported');
      return null;
    }
    
    try {
      if (!pool) await testConnection();
      
      const [result] = await pool.execute(
        'INSERT INTO users (name, email, password, created_at) VALUES (?, ?, ?, NOW())',
        [name, email, password]
      );
      
      return result.insertId ? { id: result.insertId, name, email } : null;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  },
  
  verifyPayment: async (paymentId: string, userId: string) => {
    if (isBrowser) {
      console.log('Running in browser - database operations not supported');
      return false;
    }
    
    try {
      if (!pool) await testConnection();
      
      // First check if payment exists
      const [payments] = await pool.execute(
        'SELECT * FROM payments WHERE payment_id = ?',
        [paymentId]
      );
      
      if (payments.length === 0) {
        // Create a new payment record
        await pool.execute(
          'INSERT INTO payments (payment_id, user_id, status, created_at) VALUES (?, ?, "pending", NOW())',
          [paymentId, userId]
        );
      }
      
      return true;
    } catch (error) {
      console.error('Error verifying payment:', error);
      return false;
    }
  },
  
  updatePaymentStatus: async (paymentId: string, status: string) => {
    if (isBrowser) {
      console.log('Running in browser - database operations not supported');
      return false;
    }
    
    try {
      if (!pool) await testConnection();
      
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

// Payment database operations
const paymentDb = {
  recordPayment: async (paymentData: any) => {
    if (isBrowser) {
      console.log('Running in browser - database operations not supported');
      return null;
    }
    
    try {
      if (!pool) await testConnection();
      
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
  
  getPaymentById: async (paymentId: string) => {
    if (isBrowser) {
      console.log('Running in browser - database operations not supported');
      return null;
    }
    
    try {
      if (!pool) await testConnection();
      
      const [rows] = await pool.execute(
        'SELECT * FROM payments WHERE payment_id = ?',
        [paymentId]
      );
      
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error getting payment by id:', error);
      return null;
    }
  }
};

// List database operations
const listDb = {
  getListsByUserId: async (userId: string) => {
    if (isBrowser) {
      console.log('Running in browser - database operations not supported');
      return [];
    }
    
    try {
      if (!pool) await testConnection();
      
      const [lists] = await pool.execute(
        `SELECT l.*, 
          (SELECT COUNT(*) FROM items WHERE list_id = l.id) as itemCount,
          (SELECT COUNT(*) FROM items WHERE list_id = l.id AND claimed = 1) as claimedCount
         FROM lists l
         WHERE l.user_id = ?
         ORDER BY l.created_at DESC`,
        [userId]
      );
      
      return lists.map((list: any) => ({
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
  
  createList: async (userId: string, title: string, description: string) => {
    if (isBrowser) {
      console.log('Running in browser - database operations not supported');
      return null;
    }
    
    try {
      if (!pool) await testConnection();
      
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
  
  getListById: async (listId: string) => {
    if (isBrowser) {
      console.log('Running in browser - database operations not supported');
      return null;
    }
    
    try {
      if (!pool) await testConnection();
      
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
  
  updateList: async (listId: string, data: { title?: string; description?: string; image?: string }) => {
    if (isBrowser) {
      console.log('Running in browser - database operations not supported');
      return false;
    }
    
    try {
      if (!pool) await testConnection();
      
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
  
  deleteList: async (listId: string) => {
    if (isBrowser) {
      console.log('Running in browser - database operations not supported');
      return false;
    }
    
    try {
      if (!pool) await testConnection();
      
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
  
  listExists: async (listId: string) => {
    if (isBrowser) {
      console.log('Running in browser - database operations not supported');
      return false;
    }
    
    try {
      if (!pool) await testConnection();
      
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

// Item database operations
const itemDb = {
  getItemsByListId: async (listId: string) => {
    if (isBrowser) {
      console.log('Running in browser - database operations not supported');
      return [];
    }
    
    try {
      if (!pool) await testConnection();
      
      const [items] = await pool.execute(
        'SELECT * FROM items WHERE list_id = ? ORDER BY created_at ASC',
        [listId]
      );
      
      return items.map((item: any) => ({
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
  
  createItem: async (listId: string, name: string, description: string) => {
    if (isBrowser) {
      console.log('Running in browser - database operations not supported');
      return null;
    }
    
    try {
      if (!pool) await testConnection();
      
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
  
  updateItem: async (itemId: string, data: { name?: string; description?: string; claimed?: boolean }) => {
    if (isBrowser) {
      console.log('Running in browser - database operations not supported');
      return null;
    }
    
    try {
      if (!pool) await testConnection();
      
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
  
  deleteItem: async (itemId: string) => {
    if (isBrowser) {
      console.log('Running in browser - database operations not supported');
      return false;
    }
    
    try {
      if (!pool) await testConnection();
      
      await pool.execute('DELETE FROM items WHERE id = ?', [itemId]);
      
      return true;
    } catch (error) {
      console.error('Error deleting item:', error);
      return false;
    }
  },
  
  claimItem: async (itemId: string, name: string, phone: string) => {
    if (isBrowser) {
      console.log('Running in browser - database operations not supported');
      return null;
    }
    
    try {
      if (!pool) await testConnection();
      
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

// List style database operations
const listStyleDb = {
  getListStyleByListId: async (listId: string) => {
    if (isBrowser) {
      console.log('Running in browser - database operations not supported');
      return null;
    }
    
    try {
      if (!pool) await testConnection();
      
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
  
  updateListStyle: async (listId: string, styleData: any) => {
    if (isBrowser) {
      console.log('Running in browser - database operations not supported');
      return false;
    }
    
    try {
      if (!pool) await testConnection();
      
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

export { testConnection, userDb, paymentDb, listDb, itemDb, listStyleDb };
