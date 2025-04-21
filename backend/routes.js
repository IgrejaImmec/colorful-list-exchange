
const express = require('express');
const router = express.Router();

// Modular route imports
const usersRoutes = require('./routes/users');
const listsRoutes = require('./routes/lists');
const itemsRoutes = require('./routes/items');
const paymentsRoutes = require('./routes/payments');

// Mount all routers
router.use('/users', usersRoutes);        // /server/users/...
router.use('/', listsRoutes);             // handles /server/*lists*/...
router.use('/', itemsRoutes);             // handles /server/*items*/...
router.use('/', paymentsRoutes);          // handles /server/pix, /server/payments

module.exports = router;
