
-- Create database (if not already created)
-- CREATE DATABASE u455784928_BankData;

-- Use the database
USE u455784928_BankData;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  has_subscription TINYINT(1) DEFAULT 0,
  subscription_expiry DATETIME,
  created_at DATETIME,
  updated_at DATETIME
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  payment_id VARCHAR(255) NOT NULL UNIQUE,
  user_id VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2),
  description TEXT,
  status VARCHAR(50),
  created_at DATETIME,
  updated_at DATETIME
);

-- Create lists table
CREATE TABLE IF NOT EXISTS lists (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image VARCHAR(255),
  created_at DATETIME,
  updated_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create items table
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
);

-- Create list styles table
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
);
