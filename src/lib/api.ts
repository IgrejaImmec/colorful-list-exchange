
// Mock API service to simulate backend communication
import { ListItem, ListStyle } from "@/context/ListContext";

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock backend data
let mockItems: ListItem[] = [];
let mockListSettings = {
  title: 'Minha Lista',
  description: 'Descrição da minha lista',
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

export const api = {
  getItems: async (): Promise<ListItem[]> => {
    console.log('🔄 Fetching items from mock API...');
    await delay(getRandomDelay());
    console.log('✅ Items fetched successfully!');
    return [...mockItems];
  },
  
  addItem: async (name: string, description: string): Promise<ListItem> => {
    console.log(`🔄 Adding item "${name}" to mock API...`);
    await delay(getRandomDelay());
    
    const newItem: ListItem = {
      id: crypto.randomUUID(),
      name,
      description,
      claimed: false
    };
    
    mockItems.push(newItem);
    console.log('✅ Item added successfully!');
    return newItem;
  },
  
  updateItem: async (id: string, data: Partial<ListItem>): Promise<ListItem> => {
    console.log(`🔄 Updating item ${id} in mock API...`);
    await delay(getRandomDelay());
    
    const index = mockItems.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Item not found');
    
    mockItems[index] = { ...mockItems[index], ...data };
    console.log('✅ Item updated successfully!');
    return mockItems[index];
  },
  
  deleteItem: async (id: string): Promise<void> => {
    console.log(`🔄 Deleting item ${id} from mock API...`);
    await delay(getRandomDelay());
    
    mockItems = mockItems.filter(item => item.id !== id);
    console.log('✅ Item deleted successfully!');
  },
  
  claimItem: async (id: string, name: string, phone: string): Promise<ListItem> => {
    console.log(`🔄 Claiming item ${id} in mock API...`);
    await delay(getRandomDelay());
    
    const index = mockItems.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Item not found');
    
    mockItems[index] = { 
      ...mockItems[index], 
      claimed: true, 
      claimedBy: { name, phone } 
    };
    
    console.log('✅ Item claimed successfully!');
    return mockItems[index];
  },
  
  getListSettings: async (): Promise<{
    title: string;
    description: string;
    style: ExtendedListStyle;
  }> => {
    console.log('🔄 Fetching list settings from mock API...');
    await delay(getRandomDelay());
    console.log('✅ List settings fetched successfully!');
    return { ...mockListSettings };
  },
  
  updateListSettings: async (settings: {
    title?: string;
    description?: string;
    style?: Partial<ExtendedListStyle>;
  }): Promise<{
    title: string;
    description: string;
    style: ExtendedListStyle;
  }> => {
    console.log('🔄 Updating list settings in mock API...');
    await delay(getRandomDelay());
    
    if (settings.title) mockListSettings.title = settings.title;
    if (settings.description) mockListSettings.description = settings.description;
    if (settings.style) {
      mockListSettings.style = { ...mockListSettings.style, ...settings.style };
    }
    
    console.log('✅ List settings updated successfully!');
    return { ...mockListSettings };
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
