
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

module.exports = {
  initializeDatabase,
  createPool,
  dbConfig
};
