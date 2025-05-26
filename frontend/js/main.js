// Main JavaScript file for all pages
import API from "./api.js";
import Utils from "./utils.js";
import Components from "./components.js";

// Initialize authentication UI on every page
document.addEventListener("DOMContentLoaded", async () => {
  // Load header and footer components
  await Components.loadComponents();

  // Update cart count if authenticated
  if (API.isAuthenticated()) {
    API.getBasket()
      .then((basket) => {
        let itemCount = 0;
        if (Array.isArray(basket)) {
          itemCount = basket.reduce((total, item) => total + item.quantity, 0);
        }
        Utils.updateCartCount(itemCount);
      })
      .catch((error) => {
        console.error("Error loading basket:", error);
      });
  }
});

// Export for use in other scripts
export { API, Utils, Components };
