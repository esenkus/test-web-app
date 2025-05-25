// Orders page script
import API from "../js/api.js";
import Utils from "../js/utils.js";

document.addEventListener("DOMContentLoaded", () => {
  // Initialize the UI
  Utils.updateAuthUI();

  // Check if user is authenticated
  if (!API.isAuthenticated()) {
    window.location.href =
      "login.html?redirect=" + encodeURIComponent(window.location.href);
    return;
  }

  // Load user orders
  loadOrders();

  // Update cart count if user is logged in
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

async function loadOrders() {
  const ordersContainer = document.getElementById("orders-list");

  try {
    // In a real application, you would fetch orders from the server
    // For now, just display a message with a nicer design
    ordersContainer.innerHTML = `
            <div class="no-orders" style="text-align: center; padding: 2rem;">
                <i class="fas fa-shopping-bag" style="font-size: 3rem; color: var(--border-color); margin-bottom: 1rem;"></i>
                <h3>No Orders Yet</h3>
                <p>You haven't placed any orders with us yet.</p>
                <a href="products.html" class="btn btn-primary" style="margin-top: 1rem;">Browse Products</a>
            </div>
        `;
  } catch (error) {
    console.error("Error loading orders:", error);
    ordersContainer.innerHTML =
      '<p class="error">Failed to load orders. Please try again later.</p>';
  }
}
