
const express = require('express');
const router = express.Router();
const { listDb, listStyleDb } = require('../database');

// Get all lists for a user
router.get('/users/:userId/lists', async (req, res) => {
  try {
    const { userId } = req.params;
    const lists = await listDb.getListsByUserId(userId);
    res.json(lists);
  } catch (error) {
    console.error('Error getting user lists:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create a new list
router.post('/users/:userId/lists', async (req, res) => {
  try {
    const { userId } = req.params;
    const { title, description } = req.body;
    const newList = await listDb.createList(userId, title, description);
    res.status(201).json(newList);
  } catch (error) {
    console.error('Error creating list:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get a list by ID (with style)
router.get('/lists/:listId', async (req, res) => {
  try {
    const { listId } = req.params;
    const list = await listDb.getListById(listId);
    if (!list) {
      return res.status(404).json({ success: false, error: 'List not found' });
    }
    const style = await listStyleDb.getListStyleByListId(listId);
    res.json({
      ...list,
      style: style || {
        backgroundColor: '#ffffff',
        accentColor: '#0078ff',
        fontFamily: 'Inter, sans-serif',
        borderRadius: 'rounded-2xl',
        itemSpacing: '4',
        backgroundImage: '',
        backgroundPattern: '',
        titleColor: '',
        textColor: '',
      }
    });
  } catch (error) {
    console.error('Error getting list:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Check if a list exists
router.get('/lists/:listId/exists', async (req, res) => {
  try {
    const { listId } = req.params;
    const exists = await listDb.listExists(listId);
    res.json({ exists });
  } catch (error) {
    console.error('Error checking if list exists:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update a list and its style
router.put('/lists/:listId', async (req, res) => {
  try {
    const { listId } = req.params;
    const { title, description, image, style } = req.body;
    await listDb.updateList(listId, { title, description, image });
    if (style) {
      await listStyleDb.updateListStyle(listId, style);
    }
    const updatedList = await listDb.getListById(listId);
    const updatedStyle = await listStyleDb.getListStyleByListId(listId);
    res.json({
      ...updatedList,
      style: updatedStyle || {
        backgroundColor: '#ffffff',
        accentColor: '#0078ff',
        fontFamily: 'Inter, sans-serif',
        borderRadius: 'rounded-2xl',
        itemSpacing: '4',
        backgroundImage: '',
        backgroundPattern: '',
        titleColor: '',
        textColor: '',
      }
    });
  } catch (error) {
    console.error('Error updating list:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete a list
router.delete('/lists/:listId', async (req, res) => {
  try {
    const { listId } = req.params;
    await listDb.deleteList(listId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting list:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
