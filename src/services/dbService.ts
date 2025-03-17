
import mysql from 'mysql2/promise';

// Database connection configuration
const dbConfig = {
  host: 'localhost', // This might need to be updated to the actual host
  user: 'QuedSoft',
  password: 'Sdwpyt*p1',
  database: 'BankData'
};

// Create a connection pool
const pool = mysql.createPool(dbConfig);

// Test the database connection
const testConnection = async (): Promise<boolean> => {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection successful');
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
};

// User-related database operations
const userDb = {
  // Find a user by email
  findUserByEmail: async (email: string) => {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      return (rows as any[])[0] || null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  },
  
  // Create a new user
  createUser: async (name: string, email: string, password: string) => {
    try {
      const [result] = await pool.execute(
        'INSERT INTO users (id, name, email, password, created_at) VALUES (?, ?, ?, ?, ?)',
        [crypto.randomUUID(), name, email, password, new Date()]
      );
      
      // Get the created user
      return userDb.findUserByEmail(email);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }
};

export { testConnection, userDb };
