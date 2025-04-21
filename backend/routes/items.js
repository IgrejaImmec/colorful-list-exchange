
const express = require('express');
const router = express.Router();
const { itemDb } = require('../database');

// Get all items for a list
router.get('/lists/:listId/items', async (req, res) => {
  try {
    const { listId } = req.params;
    const items = await itemDb.getItemsByListId(listId);
    res.json(items);
  } catch (error) {
    console.error('Error getting list items:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create a new item
router.post('/lists/:listId/items', async (req, res) => {
  try {
    const { listId } = req.params;
    const { name, description } = req.body;
    const newItem = await itemDb.createItem(listId, name, description);
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update an item
router.put('/lists/:listId/items/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const updateData = req.body;
    const updatedItem = await itemDb.updateItem(itemId, updateData);
    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete an item
router.delete('/lists/:listId/items/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    await itemDb.deleteItem(itemId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Claim an item
router.post('/lists/:listId/items/:itemId/claim', async (req, res) => {
  try {
    const { itemId } = req.params;
    const { name, phone } = req.body;
    const updatedItem = await itemDb.claimItem(itemId, name, phone);
    res.json(updatedItem);
  } catch (error) {
    console.error('Error claiming item:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
