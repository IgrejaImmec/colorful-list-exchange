
/**
 * MOCK BACKEND SERVER
 * This file simulates a Node.js backend structure with Prisma
 * It's for documentation purposes only and isn't actually used in the app
 */

/*
// Example of a Node.js + Express + Prisma backend for ListaAi
import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Get all items for a list
app.get('/api/lists/:listId/items', async (req, res) => {
  try {
    const { listId } = req.params;
    const items = await prisma.item.findMany({
      where: { listId },
      include: { claimedBy: true }
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching items' });
  }
});

// Add a new item to a list
app.post('/api/lists/:listId/items', async (req, res) => {
  try {
    const { listId } = req.params;
    const { name, description } = req.body;
    
    const newItem = await prisma.item.create({
      data: {
        name,
        description,
        list: { connect: { id: listId } }
      }
    });
    
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: 'Error creating item' });
  }
});

// Update an item
app.put('/api/items/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const { name, description } = req.body;
    
    const updatedItem = await prisma.item.update({
      where: { id: itemId },
      data: { name, description }
    });
    
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ error: 'Error updating item' });
  }
});

// Delete an item
app.delete('/api/items/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    await prisma.item.delete({ where: { id: itemId } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error deleting item' });
  }
});

// Claim an item
app.post('/api/items/:itemId/claim', async (req, res) => {
  try {
    const { itemId } = req.params;
    const { name, phone } = req.body;
    
    const updatedItem = await prisma.item.update({
      where: { id: itemId },
      data: {
        claimed: true,
        claimedBy: {
          create: { name, phone }
        }
      },
      include: { claimedBy: true }
    });
    
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ error: 'Error claiming item' });
  }
});

// Get list settings
app.get('/api/lists/:listId', async (req, res) => {
  try {
    const { listId } = req.params;
    
    const list = await prisma.list.findUnique({
      where: { id: listId },
      include: { style: true }
    });
    
    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }
    
    res.json({
      title: list.title,
      description: list.description,
      style: list.style || {}
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching list' });
  }
});

// Update list settings
app.put('/api/lists/:listId', async (req, res) => {
  try {
    const { listId } = req.params;
    const { title, description, style } = req.body;
    
    // Update list basic info
    const updatedList = await prisma.list.update({
      where: { id: listId },
      data: {
        title,
        description,
        style: style ? {
          upsert: {
            update: style,
            create: {
              ...style
            }
          }
        } : undefined
      },
      include: { style: true }
    });
    
    res.json({
      title: updatedList.title,
      description: updatedList.description,
      style: updatedList.style
    });
  } catch (error) {
    res.status(500).json({ error: 'Error updating list' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
*/

// This file doesn't export anything - it's just for documentation
const serverInfo = {
  structure: "Fictitious Node.js + Express + Prisma backend",
  endpoints: [
    "GET /api/lists/:listId/items - Get all items for a list",
    "POST /api/lists/:listId/items - Add a new item to a list",
    "PUT /api/items/:itemId - Update an item",
    "DELETE /api/items/:itemId - Delete an item",
    "POST /api/items/:itemId/claim - Claim an item",
    "GET /api/lists/:listId - Get list settings",
    "PUT /api/lists/:listId - Update list settings"
  ]
};

export default serverInfo;
