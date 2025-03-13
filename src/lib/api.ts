
// Mock API service to simulate backend communication
import { ListItem, ListStyle } from "@/context/ListContext";
import { mockLists } from "./mockData";

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock database to store multiple lists
interface ListData {
  [listId: string]: {
    items: ListItem[];
    settings: {
      title: string;
      description: string;
      image: string;
      style: ExtendedListStyle;
    }
  }
}

// Initialize the mock database with preloaded data
const mockDatabase: ListData = { ...mockLists };

// Default list settings
const defaultListSettings = {
  title: 'Minha Lista',
  description: 'Descrição da minha lista',
  image: '',
  style: {
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
};

export interface ExtendedListStyle extends ListStyle {
  borderRadius: string;
  itemSpacing: string;
  backgroundImage: string;
  backgroundPattern: string;
  titleColor: string;
  textColor: string;
}

const getRandomDelay = () => Math.floor(Math.random() * 300) + 200;

// Ensure a list exists in the database
const ensureListExists = (listId: string) => {
  if (!mockDatabase[listId]) {
    // Create a new list with default settings
    mockDatabase[listId] = {
      items: [],
      settings: {...defaultListSettings}
    };
  }
  return mockDatabase[listId];
};

export const api = {
  checkListExists: async (listId: string): Promise<boolean> => {
    console.log(`🔄 Checking if list ${listId} exists...`);
    await delay(getRandomDelay());
    // For mock purposes, we'll create the list if it doesn't exist
    ensureListExists(listId);
    console.log(`✅ List ${listId} exists!`);
    return true;
  },
  
  getItems: async (listId: string): Promise<ListItem[]> => {
    console.log(`🔄 Fetching items for list ${listId}...`);
    await delay(getRandomDelay());
    const list = ensureListExists(listId);
    console.log('✅ Items fetched successfully!');
    return [...list.items];
  },
  
  addItem: async (listId: string, name: string, description: string): Promise<ListItem> => {
    console.log(`🔄 Adding item "${name}" to list ${listId}...`);
    await delay(getRandomDelay());
    
    const newItem: ListItem = {
      id: crypto.randomUUID(),
      name,
      description,
      claimed: false
    };
    
    const list = ensureListExists(listId);
    list.items.push(newItem);
    console.log('✅ Item added successfully!');
    return newItem;
  },
  
  updateItem: async (listId: string, id: string, data: Partial<ListItem>): Promise<ListItem> => {
    console.log(`🔄 Updating item ${id} in list ${listId}...`);
    await delay(getRandomDelay());
    
    const list = ensureListExists(listId);
    const index = list.items.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Item not found');
    
    list.items[index] = { ...list.items[index], ...data };
    console.log('✅ Item updated successfully!');
    return list.items[index];
  },
  
  deleteItem: async (listId: string, id: string): Promise<void> => {
    console.log(`🔄 Deleting item ${id} from list ${listId}...`);
    await delay(getRandomDelay());
    
    const list = ensureListExists(listId);
    list.items = list.items.filter(item => item.id !== id);
    console.log('✅ Item deleted successfully!');
  },
  
  claimItem: async (listId: string, id: string, name: string, phone: string): Promise<ListItem> => {
    console.log(`🔄 Claiming item ${id} in list ${listId}...`);
    await delay(getRandomDelay());
    
    const list = ensureListExists(listId);
    const index = list.items.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Item not found');
    
    list.items[index] = { 
      ...list.items[index], 
      claimed: true, 
      claimedBy: { name, phone } 
    };
    
    console.log('✅ Item claimed successfully!');
    return list.items[index];
  },
  
  getListSettings: async (listId: string): Promise<{
    title: string;
    description: string;
    image: string;
    style: ExtendedListStyle;
  }> => {
    console.log(`🔄 Fetching settings for list ${listId}...`);
    await delay(getRandomDelay());
    const list = ensureListExists(listId);
    console.log('✅ List settings fetched successfully!');
    return { ...list.settings };
  },
  
  updateListSettings: async (listId: string, settings: {
    title?: string;
    description?: string;
    image?: string;
    style?: Partial<ExtendedListStyle>;
  }): Promise<{
    title: string;
    description: string;
    image: string;
    style: ExtendedListStyle;
  }> => {
    console.log(`🔄 Updating settings for list ${listId}...`);
    await delay(getRandomDelay());
    
    const list = ensureListExists(listId);
    
    if (settings.title) list.settings.title = settings.title;
    if (settings.description) list.settings.description = settings.description;
    if (settings.image !== undefined) list.settings.image = settings.image;
    if (settings.style) {
      list.settings.style = { ...list.settings.style, ...settings.style };
    }
    
    console.log('✅ List settings updated successfully!');
    return { ...list.settings };
  }
};

export const getPrismaDbSchema = () => {
  // Mock PrismaDB schema for documentation purposes
  return `
// This is your Prisma schema file for ListaAi,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model List {
  id           String    @id @default(cuid())
  title        String
  description  String?
  image        String?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  items        Item[]
  style        ListStyle?
}

model Item {
  id          String    @id @default(cuid())
  name        String
  description String?
  claimed     Boolean   @default(false)
  claimedBy   ClaimedBy?
  listId      String
  list        List      @relation(fields: [listId], references: [id], onDelete: Cascade)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model ClaimedBy {
  id        String   @id @default(cuid())
  name      String
  phone     String
  itemId    String   @unique
  item      Item     @relation(fields: [itemId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
}

model ListStyle {
  id               String  @id @default(cuid())
  backgroundColor  String  @default("#ffffff")
  accentColor      String  @default("#0078ff")
  fontFamily       String  @default("Inter, sans-serif")
  borderRadius     String  @default("rounded-2xl")
  itemSpacing      String  @default("4")
  backgroundImage  String? 
  backgroundPattern String?
  titleColor       String?
  textColor        String?
  listId           String  @unique
  list             List    @relation(fields: [listId], references: [id], onDelete: Cascade)
}
  `;
};
