
const express = require('express');
const cors = require('cors');
const { initializeDatabase, createPool } = require('./database');

// Initialize express application
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Create connection pool
const pool = createPool();

// Health check route
app.get('/', (req, res) => {
  res.send('ListaAi API is running');
});

// API Routes
// -----------------------------------------------------

// User login (mock version that works without database)
app.post('/server/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log(`Tentativa de login: ${email}`);
    
    // Mock admin user for testing (use this to login when DB is not available)
    const mockAdmin = {
      id: '1',
      name: 'Administrador',
      email: 'admin@admin.com',
      password: 'admin123',
      has_subscription: 1,
      subscription_expiry: null
    };
    
    // First try mock login (always works even without DB)
    if (email === mockAdmin.email && password === mockAdmin.password) {
      console.log('Login mockado bem-sucedido!');
      return res.json({
        success: true,
        user: {
          id: mockAdmin.id,
          name: mockAdmin.name,
          email: mockAdmin.email,
          hasSubscription: mockAdmin.has_subscription === 1,
          subscriptionExpiry: mockAdmin.subscription_expiry
        }
      });
    }
    
    // If not mock user, try database login
    try {
      // Try to find user in database
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      
      const user = rows.length > 0 ? rows[0] : null;
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Credenciais inválidas'
        });
      }
      
      // Validate password (in production, compare hashed passwords)
      if (user.password !== password) {
        return res.status(401).json({
          success: false,
          error: 'Credenciais inválidas'
        });
      }
      
      console.log('Login com banco de dados bem-sucedido!');
      
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
    } catch (dbError) {
      console.error('Erro ao tentar login com banco de dados:', dbError);
      console.log('Utilizando apenas login mockado devido a erro no banco.');
      
      // Se houve um erro no banco, retorne um erro para que o front tente o login mockado
      return res.status(500).json({
        success: false,
        error: 'Falha ao conectar com o banco de dados'
      });
    }
  } catch (error) {
    console.error('Erro durante login:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Redirect all other /server routes to error or mock response
app.all('/server/*', (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Esta rota não está disponível no modo mockado',
    message: 'Use o login mockado com admin@admin.com / admin123'
  });
});

// Initialize database before starting the server
async function startServer() {
  try {
    // Try to initialize database (might fail if DB is not available)
    try {
      await initializeDatabase();
      console.log('Database initialized successfully.');
    } catch (dbError) {
      console.error('Warning: Failed to initialize database:', dbError);
      console.log('Starting server in mock mode - use admin@admin.com / admin123 to login');
    }
    
    // Start server regardless of DB initialization
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Login mockado disponível: admin@admin.com / senha: admin123`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
