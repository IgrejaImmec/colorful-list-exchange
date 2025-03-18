
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

export { testConnection, userDb, paymentDb };
