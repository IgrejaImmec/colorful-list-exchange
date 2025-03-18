
// API service to communicate with the backend server
import { ListItem } from "@/context/ListContext";
import axios from "axios";

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: "/server", // Will connect to our Express server
  headers: {
    "Content-Type": "application/json",
  },
});

// List style interface
export interface ExtendedListStyle {
  backgroundColor: string;
  accentColor: string;
  fontFamily: string;
  borderRadius: string;
  itemSpacing: string;
  backgroundImage: string;
  backgroundPattern: string;
  titleColor: string;
  textColor: string;
}

export const api = {
  checkListExists: async (listId: string): Promise<boolean> => {
    console.log(`🔄 Checking if list ${listId} exists...`);
    try {
      const response = await apiClient.get(`/lists/${listId}/exists`);
      console.log(`✅ List ${listId} exists!`);
      return response.data.exists;
    } catch (error) {
      console.error(`❌ Error checking if list ${listId} exists:`, error);
      return false;
    }
  },
  
  getItems: async (listId: string): Promise<ListItem[]> => {
    console.log(`🔄 Fetching items for list ${listId}...`);
    try {
      const response = await apiClient.get(`/lists/${listId}/items`);
      console.log('✅ Items fetched successfully!');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching items:', error);
      return [];
    }
  },
  
  addItem: async (listId: string, name: string, description: string): Promise<ListItem> => {
    console.log(`🔄 Adding item "${name}" to list ${listId}...`);
    try {
      const response = await apiClient.post(`/lists/${listId}/items`, {
        name,
        description
      });
      console.log('✅ Item added successfully!');
      return response.data;
    } catch (error) {
      console.error('❌ Error adding item:', error);
      throw error;
    }
  },
  
  updateItem: async (listId: string, id: string, data: Partial<ListItem>): Promise<ListItem> => {
    console.log(`🔄 Updating item ${id} in list ${listId}...`);
    try {
      const response = await apiClient.put(`/lists/${listId}/items/${id}`, data);
      console.log('✅ Item updated successfully!');
      return response.data;
    } catch (error) {
      console.error('❌ Error updating item:', error);
      throw error;
    }
  },
  
  deleteItem: async (listId: string, id: string): Promise<void> => {
    console.log(`🔄 Deleting item ${id} from list ${listId}...`);
    try {
      await apiClient.delete(`/lists/${listId}/items/${id}`);
      console.log('✅ Item deleted successfully!');
    } catch (error) {
      console.error('❌ Error deleting item:', error);
      throw error;
    }
  },
  
  claimItem: async (listId: string, id: string, name: string, phone: string): Promise<ListItem> => {
    console.log(`🔄 Claiming item ${id} in list ${listId}...`);
    try {
      const response = await apiClient.post(`/lists/${listId}/items/${id}/claim`, {
        name,
        phone
      });
      console.log('✅ Item claimed successfully!');
      return response.data;
    } catch (error) {
      console.error('❌ Error claiming item:', error);
      throw error;
    }
  },
  
  getListSettings: async (listId: string): Promise<{
    title: string;
    description: string;
    image: string;
    style: ExtendedListStyle;
  }> => {
    console.log(`🔄 Fetching settings for list ${listId}...`);
    try {
      const response = await apiClient.get(`/lists/${listId}`);
      console.log('✅ List settings fetched successfully!');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching list settings:', error);
      throw error;
    }
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
    try {
      const response = await apiClient.put(`/lists/${listId}`, settings);
      console.log('✅ List settings updated successfully!');
      return response.data;
    } catch (error) {
      console.error('❌ Error updating list settings:', error);
      throw error;
    }
  },

  getUserLists: async (userId: string): Promise<any[]> => {
    console.log(`🔄 Fetching lists for user ${userId}...`);
    try {
      const response = await apiClient.get(`/users/${userId}/lists`);
      console.log('✅ User lists fetched successfully!');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching user lists:', error);
      return [];
    }
  },

  createList: async (userId: string, title: string, description: string): Promise<string> => {
    console.log(`🔄 Creating list for user ${userId}...`);
    try {
      const response = await apiClient.post(`/users/${userId}/lists`, {
        title,
        description
      });
      console.log('✅ List created successfully!');
      return response.data.id;
    } catch (error) {
      console.error('❌ Error creating list:', error);
      throw error;
    }
  },

  deleteList: async (listId: string): Promise<boolean> => {
    console.log(`🔄 Deleting list ${listId}...`);
    try {
      await apiClient.delete(`/lists/${listId}`);
      console.log('✅ List deleted successfully!');
      return true;
    } catch (error) {
      console.error('❌ Error deleting list:', error);
      throw error;
    }
  }
};
