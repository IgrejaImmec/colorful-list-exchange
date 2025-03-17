
// Database service for connection to MySQL
// This should ONLY be used in a non-browser environment
import mysql from 'mysql2/promise';

// Check if we're running in a browser environment
const isBrowser = typeof window !== 'undefined';

// Database connection configuration
const dbConfig = {
  host: 'localhost', // Assuming the database is on localhost
  user: 'QuedSoft',
  password: 'Sdwpyt*p1',
  database: 'BankData'
};

// Create a pool connection to MySQL
let pool: mysql.Pool | null = null;

// Test the database connection
const testConnection = async (): Promise<boolean> => {
  // In browser environments, we'll always return false
  if (isBrowser) {
    console.log('Running in browser environment - database connections not supported');
    return false;
  }
  
  try {
    // Only create the pool if it doesn't exist and we're not in a browser
    if (!pool && !isBrowser) {
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

// Mock user database operations for client-side
const userDb = {
  // These are just mock placeholders for the browser environment
  findUserByEmail: async (email: string) => {
    if (isBrowser) {
      console.log('Running in browser - database operations not supported');
      return null;
    }
    return null;
  },
  
  createUser: async (name: string, email: string, password: string) => {
    if (isBrowser) {
      console.log('Running in browser - database operations not supported');
      return null;
    }
    return null;
  }
};

export { testConnection, userDb };
