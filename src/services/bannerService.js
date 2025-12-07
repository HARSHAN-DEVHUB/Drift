import { 
  ref as dbRef, 
  push, 
  set, 
  update, 
  remove, 
  get 
} from "firebase/database";
import { database } from "../config/firebase";

// Helper function to convert file to base64 (for free tier)
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

// Helper function to compress image
const compressImage = (file, maxWidth = 1920, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Resize if too large
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to compressed base64
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      
      img.onerror = reject;
    };
    
    reader.onerror = reject;
  });
};

// Banner CRUD Operations
export const bannerService = {
  // Create a new banner
  async createBanner(bannerData, imageFile) {
    try {
      // Compress and convert image to base64
      const compressedImageBase64 = await compressImage(imageFile, 1920, 0.7);
      
      const banner = {
        ...bannerData,
        imageUrl: compressedImageBase64,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const bannersRef = dbRef(database, 'banners');
      const newBannerRef = push(bannersRef);
      await set(newBannerRef, banner);
      
      return { id: newBannerRef.key, ...banner };
    } catch (error) {
      console.error("Error creating banner:", error);
      throw error;
    }
  },

  // Get all banners
  async getAllBanners() {
    try {
      const bannersRef = dbRef(database, 'banners');
      const snapshot = await get(bannersRef);
      
      if (snapshot.exists()) {
        const banners = [];
        const data = snapshot.val();
        
        Object.keys(data).forEach(key => {
          banners.push({
            id: key,
            ...data[key]
          });
        });
        
        // Sort by order (ascending)
        banners.sort((a, b) => (a.order || 0) - (b.order || 0));
        
        return banners;
      }
      
      return [];
    } catch (error) {
      console.error("Error fetching banners:", error);
      throw error;
    }
  },

  // Get active banners only
  async getActiveBanners() {
    try {
      const allBanners = await this.getAllBanners();
      return allBanners.filter(banner => banner.isActive);
    } catch (error) {
      console.error("Error fetching active banners:", error);
      throw error;
    }
  },

  // Update banner
  async updateBanner(bannerId, updates) {
    try {
      const bannerRef = dbRef(database, `banners/${bannerId}`);
      const updatedData = {
        ...updates,
        updatedAt: Date.now()
      };
      await update(bannerRef, updatedData);
      return { id: bannerId, ...updatedData };
    } catch (error) {
      console.error("Error updating banner:", error);
      throw error;
    }
  },

  // Delete banner
  async deleteBanner(bannerId) {
    try {
      const bannerRef = dbRef(database, `banners/${bannerId}`);
      await remove(bannerRef);
      return { success: true };
    } catch (error) {
      console.error("Error deleting banner:", error);
      throw error;
    }
  }
};
