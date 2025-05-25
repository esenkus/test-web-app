// About page script
import API from "../js/api.js";
import Utils from "../js/utils.js";

document.addEventListener("DOMContentLoaded", async () => {
  // Initialize the UI
  Utils.updateAuthUI();

  // Update cart count if user is logged in
  if (API.isAuthenticated()) {
    try {
      const basket = await API.getBasket();
      let itemCount = 0;
      if (Array.isArray(basket)) {
        itemCount = basket.reduce((total, item) => total + item.quantity, 0);
      }
      Utils.updateCartCount(itemCount);
    } catch (error) {
      console.error("Error loading basket:", error);
    }
  }
});
