const mysql = require('mysql2/promise');

// Database connection configuration
const dbConfig = {
  host: 'srv1196.hstgr.io', 
  user: 'u455784928_QuedSoft',
  password: 'Sdwpyt*p1',
  database: 'u455784928_BankData',
  port: 3306
};

// Create tables if they don't exist
async function initializeDatabase() {
  let connection;
  try {
    console.log('Initializing database connection...');
    connection = await mysql.createConnection(dbConfig);

    console.log('Checking and creating tables if needed...');
    // Criação das tabelas principais do sistema
    // -----------------------------------------------------
    // Tabela de Usuários
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        has_subscription TINYINT(1) DEFAULT 0,
        subscription_expiry DATETIME,
        created_at DATETIME,
        updated_at DATETIME
      )
    `);

    // Tabela de Pagamentos
    await connection.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        payment_id VARCHAR(255) NOT NULL UNIQUE,
        user_id VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2),
        description TEXT,
        status VARCHAR(50),
        created_at DATETIME,
        updated_at DATETIME
      )
    `);

    // Tabela de Listas
    await connection.query(`
      CREATE TABLE IF NOT EXISTS lists (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image VARCHAR(255),
        created_at DATETIME,
        updated_at DATETIME,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Tabela de Itens
    await connection.query(`
      CREATE TABLE IF NOT EXISTS items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        list_id INT,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        claimed TINYINT(1) DEFAULT 0,
        claimed_by_name VARCHAR(255),
        claimed_by_phone VARCHAR(50),
        created_at DATETIME,
        updated_at DATETIME,
        FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE
      )
    `);

    // Tabela de Estilo das Listas
    await connection.query(`
      CREATE TABLE IF NOT EXISTS list_styles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        list_id INT,
        background_color VARCHAR(50) DEFAULT '#ffffff',
        accent_color VARCHAR(50) DEFAULT '#0078ff',
        font_family VARCHAR(255) DEFAULT 'Inter, sans-serif',
        border_radius VARCHAR(50) DEFAULT 'rounded-2xl',
        item_spacing VARCHAR(10) DEFAULT '4',
        background_image VARCHAR(255),
        background_pattern VARCHAR(255),
        title_color VARCHAR(50),
        text_color VARCHAR(50),
        created_at DATETIME,
        updated_at DATETIME,
        FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE
      )
    `);

    // -----------------------------------------------------
    // Criação de usuário admin de teste (caso não exista)
    // Por padrão: email: admin@admin.com | senha: admin123
    const [rows] = await connection.query(
      "SELECT * FROM users WHERE email = 'admin@admin.com'"
    );
    if (rows.length === 0) {
      await connection.query(
        `INSERT INTO users (name, email, password, has_subscription, created_at) VALUES (?, ?, ?, ?, NOW())`,
        ['Administrador', 'admin@admin.com', 'admin123', 1]
      );
      console.log('Usuário admin padrão criado: email=admin@admin.com senha=admin123');
    } else {
      console.log('Usuário admin já existe');
    }

    console.log('Database tables initialized successfully.');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database initialization connection closed.');
    }
  }
}

// Create a pool for the application to use
const createPool = () => {
  return mysql.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
};

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

// ---- export database helpers for routers ----
module.exports = {
  initializeDatabase,
  createPool,
  dbConfig,
  userDb,
  paymentDb,
  listDb,
  itemDb,
  listStyleDb
};
