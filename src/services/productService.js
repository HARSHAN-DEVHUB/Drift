import { 
  ref as dbRef, 
  push, 
  set, 
  update, 
  remove, 
  get, 
  child,
  query,
  orderByChild,
  equalTo
} from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { database, storage } from "../config/firebase";

// Product CRUD Operations
export const productService = {
  // Create a new product
  async createProduct(productData, imageFiles) {
    try {
      // Upload images to Firebase Storage
      const imageUrls = await this.uploadProductImages(imageFiles);
      
      const product = {
        ...productData,
        images: imageUrls,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const productsRef = dbRef(database, 'products');
      const newProductRef = push(productsRef);
      await set(newProductRef, product);
      
      return { id: newProductRef.key, ...product };
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  },

  // Get all products
  async getAllProducts() {
    try {
      const productsRef = dbRef(database, 'products');
      const snapshot = await get(productsRef);
      
      if (snapshot.exists()) {
        const products = [];
        const data = snapshot.val();
        
        // Convert object to array and sort by createdAt
        Object.keys(data).forEach(key => {
          products.push({
            id: key,
            ...data[key]
          });
        });
        
        // Sort by createdAt descending
        products.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        
        return products;
      }
      
      return [];
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  // Get product by ID
  async getProductById(productId) {
    try {
      const productRef = dbRef(database, `products/${productId}`);
      const snapshot = await get(productRef);
      
      if (snapshot.exists()) {
        return { id: productId, ...snapshot.val() };
      } else {
        throw new Error("Product not found");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      throw error;
    }
  },

  // Get products by category
  async getProductsByCategory(category) {
    try {
      const products = await this.getAllProducts();
      return products.filter(product => product.category === category);
    } catch (error) {
      console.error("Error fetching products by category:", error);
      throw error;
    }
  },

  // Get products by category and subcategory
  async getProductsBySubcategory(category, subcategory) {
    try {
      const products = await this.getAllProducts();
      return products.filter(
        product => product.category === category && product.subcategory === subcategory
      );
    } catch (error) {
      console.error("Error fetching products by subcategory:", error);
      throw error;
    }
  },

  // Update product
  async updateProduct(productId, updates) {
    try {
      const productRef = dbRef(database, `products/${productId}`);
      await update(productRef, {
        ...updates,
        updatedAt: Date.now()
      });
      return { id: productId, ...updates };
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  },

  // Delete product
  async deleteProduct(productId) {
    try {
      const productRef = dbRef(database, `products/${productId}`);
      
      // Get product data to delete associated images
      const snapshot = await get(productRef);
      if (snapshot.exists()) {
        const product = snapshot.val();
        
        // Delete images from storage
        if (product.images && Array.isArray(product.images)) {
          await this.deleteProductImages(product.images);
        }
      }
      
      await remove(productRef);
      return { success: true };
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  },

  // Upload product images to Firebase Storage
  async uploadProductImages(imageFiles) {
    try {
      const uploadPromises = imageFiles.map(async (file) => {
        const timestamp = Date.now();
        const fileName = `products/${timestamp}_${file.name}`;
        const fileRef = storageRef(storage, fileName);
        
        await uploadBytes(fileRef, file);
        const downloadURL = await getDownloadURL(fileRef);
        return downloadURL;
      });

      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error("Error uploading images:", error);
      throw error;
    }
  },

  // Delete product images from Firebase Storage
  async deleteProductImages(imageUrls) {
    try {
      const deletePromises = imageUrls.map(async (url) => {
        try {
          const imageRef = storageRef(storage, url);
          await deleteObject(imageRef);
        } catch (error) {
          console.warn("Could not delete image:", url, error);
        }
      });

      await Promise.all(deletePromises);
    } catch (error) {
      console.error("Error deleting images:", error);
    }
  }
};

// Category Management
export const categoryService = {
  // Get all categories
  async getAllCategories() {
    try {
      const categoriesRef = dbRef(database, 'categories');
      const snapshot = await get(categoriesRef);
      
      if (snapshot.exists()) {
        return snapshot.val();
      }
      
      // Return default categories if none exist
      return {
        appliances: ['refrigerator', 'air-conditioner'],
        mobiles: ['apple', 'vivo', 'oppo', 'realme', 'oneplus', 'motorola'],
        electronics: ['home-theater', 'sound-bar'],
        tv: ['toshiba', 'mi', 'realme', 'samsung', 'lg', 'assembled-tv', 'tcl'],
        trending: ['best-sellers', 'new-arrivals']
      };
    } catch (error) {
      console.error("Error fetching categories:", error);
      // Return default categories on error
      return {
        appliances: ['refrigerator', 'air-conditioner'],
        mobiles: ['apple', 'vivo', 'oppo', 'realme', 'oneplus', 'motorola'],
        electronics: ['home-theater', 'sound-bar'],
        tv: ['toshiba', 'mi', 'realme', 'samsung', 'lg', 'assembled-tv', 'tcl'],
        trending: ['best-sellers', 'new-arrivals']
      };
    }
  },

  // Add or update category
  async saveCategory(categoryName, subcategories) {
    try {
      const categoryId = categoryName.toLowerCase().replace(/\s+/g, '-');
      const categoryRef = dbRef(database, `categories/${categoryId}`);
      
      await set(categoryRef, subcategories);
      
      return { success: true };
    } catch (error) {
      console.error("Error saving category:", error);
      throw error;
    }
  },

  // Delete category
  async deleteCategory(categoryName) {
    try {
      const categoryId = categoryName.toLowerCase().replace(/\s+/g, '-');
      const categoryRef = dbRef(database, `categories/${categoryId}`);
      await remove(categoryRef);
      return { success: true };
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  }
};
