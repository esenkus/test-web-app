// Main API service for handling backend requests
const API = {
  baseUrl: "http://localhost:8080",

  // Authentication endpoints
  async login(username, password) {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const token = await response.json();
      return token;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  async register(username, password) {
    try {
      const response = await fetch(`${this.baseUrl}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error("Registration failed");
      }

      return await response.json();
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  },

  // Product endpoints
  async getProducts() {
    try {
      const response = await fetch(`${this.baseUrl}/products`);

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  async getProductById(id) {
    try {
      const response = await fetch(`${this.baseUrl}/products/${id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch product");
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  },

  // Basket endpoints
  async getBasket() {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(`${this.baseUrl}/basket`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch basket");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching basket:", error);
      throw error;
    }
  },

  async addToBasket(productId, quantity) {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(`${this.baseUrl}/basket`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity }),
      });

      if (!response.ok) {
        throw new Error("Failed to add item to basket");
      }

      return await response.json();
    } catch (error) {
      console.error("Error adding to basket:", error);
      throw error;
    }
  },

  async updateBasketItem(itemId, quantity) {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(`${this.baseUrl}/basket/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
      });

      if (!response.ok) {
        throw new Error("Failed to update basket item");
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating basket item ${itemId}:`, error);
      throw error;
    }
  },

  async removeFromBasket(itemId) {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(`${this.baseUrl}/basket/${itemId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to remove item from basket");
      }

      return true;
    } catch (error) {
      console.error(`Error removing item ${itemId} from basket:`, error);
      throw error;
    }
  },

  // Reviews endpoints
  async getProductReviews(productId) {
    try {
      const response = await fetch(`${this.baseUrl}/reviews/${productId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching reviews for product ${productId}:`, error);
      throw error;
    }
  },

  async addProductReview(productId, rating, comment) {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(`${this.baseUrl}/reviews/${productId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, comment }),
      });

      if (!response.ok) {
        throw new Error("Failed to add review");
      }

      return await response.json();
    } catch (error) {
      console.error(`Error adding review for product ${productId}:`, error);
      throw error;
    }
  },

  // User authentication helpers
  isAuthenticated() {
    return localStorage.getItem("token") !== null;
  },

  getToken() {
    return localStorage.getItem("token");
  },

  saveToken(token) {
    localStorage.setItem("token", token);
  },

  removeToken() {
    localStorage.removeItem("token");
  },

  getUsername() {
    const token = this.getToken();
    if (!token) return null;

    try {
      // Simple JWT decoding (not verification)
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.sub;
    } catch (e) {
      console.error("Error parsing token:", e);
      return null;
    }
  },
};

export default API;
