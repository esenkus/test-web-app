// About page script
import API from "./api.js";
import Utils from "./utils.js";
import Components from "./components.js";

document.addEventListener("DOMContentLoaded", async () => {
  // Load components
  await Components.loadComponents();

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
