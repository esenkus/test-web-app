// Cart page script
import { API, Utils } from "../js/main.js";

document.addEventListener("DOMContentLoaded", () => {
  initializeCart();
  setupEventListeners();
});

// Get the appropriate image for a product
function getProductImage(product) {
  // Use the imagePath from the product if available
  if (product.imagePath) {
    return `.${product.imagePath}`;
  }

  // Fallback to the old method if imagePath is not available (for backward compatibility)
  switch (product.id) {
    case 1: // Android App Protection
    case 2: // Web Application Security
      return "./assets/images/Digital.ai_App_Security_Logo.svg";
    case 4: // Agility
      return "./assets/images/agility-logo-fc-dark.svg";
    case 5: // Release
      return "./assets/images/release-logo-no-echo-fc-dark.svg";
    case 6: // Deploy
      return "./assets/images/deploy-logo-no-echo-fc-dark.svg";
    case 7: // Continuous Testing
      return "./assets/images/continuous-testing-logo-no-echo-fc-dark.svg";
    case 8: // App Aware
      return "./assets/images/app-aware-logo-no-echo-fc-dark.svg";
    default:
      return "./assets/images/placeholder.svg";
  }
}

// Initialize cart page
async function initializeCart() {
  if (!API.isAuthenticated()) {
    document.getElementById("cart-loading").style.display = "none";
    document.getElementById("not-authenticated").style.display = "block";
    return;
  }

  try {
    const basket = await API.getBasket();

    if (!Array.isArray(basket) || basket.length === 0) {
      displayEmptyCart();
      return;
    }

    // Map basket items to include product details
    const itemsWithDetails = [];

    for (const item of basket) {
      try {
        const product = await API.getProductById(item.productId);
        itemsWithDetails.push({
          ...item,
          product,
        });
      } catch (error) {
        console.error(`Error fetching product ${item.productId}:`, error);
      }
    }

    if (itemsWithDetails.length === 0) {
      displayEmptyCart();
      return;
    }

    displayCartItems(itemsWithDetails);
    updateCartSummary(itemsWithDetails);

    // Hide loading indicator and show cart content
    document.getElementById("cart-loading").style.display = "none";
    document.getElementById("cart-content").style.display = "block";

    // Update cart count in header
    let itemCount = itemsWithDetails.reduce(
      (total, item) => total + item.quantity,
      0
    );
    Utils.updateCartCount(itemCount);
  } catch (error) {
    console.error("Error loading cart:", error);
    document.getElementById("cart-loading").style.display = "none";
    document.getElementById("cart-empty").style.display = "block";
    document.getElementById("cart-empty").innerHTML = `
            <h3>Error Loading Cart</h3>
            <p>${
              error.message || "Something went wrong while loading your cart."
            }</p>
            <a href="products.html" class="btn btn-primary">Browse Products</a>
        `;
  }
}

// Display empty cart message
function displayEmptyCart() {
  document.getElementById("cart-loading").style.display = "none";
  document.getElementById("cart-empty").style.display = "block";
  Utils.updateCartCount(0);
}

// Display cart items
function displayCartItems(items) {
  const cartItemsContainer = document.getElementById("cart-items");
  cartItemsContainer.innerHTML = "";

  items.forEach((item) => {
    const cartItem = document.createElement("div");
    cartItem.className = "cart-item";
    cartItem.setAttribute("data-id", item.id);

    cartItem.innerHTML = `
            <div class="cart-item-image">
                <img src="${getProductImage(item.product)}" alt="${
                  item.product.name
                }">
            </div>
            <div class="cart-item-details">
                <h3>${item.product.name}</h3>
                <p>Version ${item.product.version}</p>
            </div>
            <div class="cart-item-quantity">
                <button class="cart-quantity-btn decrease-quantity" data-id="${
                  item.id
                }">-</button>
                <input type="number" class="cart-quantity-input" value="${
                  item.quantity
                }" min="1" max="10" data-id="${item.id}">
                <button class="cart-quantity-btn increase-quantity" data-id="${
                  item.id
                }">+</button>
            </div>
            <div class="cart-item-price">${Utils.formatPrice(
              item.product.price * item.quantity
            )}</div>
            <button class="cart-item-remove" data-id="${item.id}">
                <i class="fas fa-trash"></i>
            </button>
        `;

    cartItemsContainer.appendChild(cartItem);
  });
}

// Update cart summary
function updateCartSummary(items) {
  const subtotal = items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  const shipping = subtotal > 0 ? 10 : 0;
  const total = subtotal + shipping;

  document.getElementById("subtotal-amount").textContent =
    Utils.formatPrice(subtotal);
  document.getElementById("shipping-amount").textContent =
    Utils.formatPrice(shipping);
  document.getElementById("total-amount").textContent =
    Utils.formatPrice(total);
}

// Setup event listeners
function setupEventListeners() {
  const cartItemsContainer = document.getElementById("cart-items");

  if (cartItemsContainer) {
    // Event delegation for cart item actions
    cartItemsContainer.addEventListener("click", async (e) => {
      // Handle decrease quantity
      if (e.target.classList.contains("decrease-quantity")) {
        const itemId = e.target.getAttribute("data-id");
        await updateItemQuantity(itemId, -1);
      }

      // Handle increase quantity
      if (e.target.classList.contains("increase-quantity")) {
        const itemId = e.target.getAttribute("data-id");
        await updateItemQuantity(itemId, 1);
      }

      // Handle remove item
      if (
        e.target.classList.contains("cart-item-remove") ||
        (e.target.parentElement &&
          e.target.parentElement.classList.contains("cart-item-remove"))
      ) {
        const itemId = e.target.classList.contains("cart-item-remove")
          ? e.target.getAttribute("data-id")
          : e.target.parentElement.getAttribute("data-id");

        await removeItem(itemId);
      }
    });

    // Handle quantity input changes
    cartItemsContainer.addEventListener("change", async (e) => {
      if (e.target.classList.contains("cart-quantity-input")) {
        const itemId = e.target.getAttribute("data-id");
        const newQuantity = parseInt(e.target.value);

        if (isNaN(newQuantity) || newQuantity < 1) {
          e.target.value = 1;
          await updateItemQuantity(itemId, 0, 1);
        } else if (newQuantity > 10) {
          e.target.value = 10;
          await updateItemQuantity(itemId, 0, 10);
        } else {
          await updateItemQuantity(itemId, 0, newQuantity);
        }
      }
    });
  }

  // Checkout button
  const checkoutBtn = document.getElementById("checkout-btn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      Utils.showNotification(
        "Checkout functionality is not yet implemented!",
        "info"
      );
    });
  }
}

// Update item quantity
async function updateItemQuantity(itemId, change, absoluteValue = null) {
  try {
    // Find current quantity
    const quantityInput = document.querySelector(
      `.cart-quantity-input[data-id="${itemId}"]`
    );

    if (!quantityInput) return;

    let currentQuantity = parseInt(quantityInput.value);
    let newQuantity;

    if (absoluteValue !== null) {
      // Set to absolute value
      newQuantity = absoluteValue;
    } else {
      // Increment/decrement
      newQuantity = currentQuantity + change;

      // Enforce limits
      if (newQuantity < 1) newQuantity = 1;
      if (newQuantity > 10) newQuantity = 10;
    }

    // Update UI immediately for responsiveness
    quantityInput.value = newQuantity;

    // Update on server
    await API.updateBasketItem(itemId, newQuantity);

    // Refresh cart to update totals
    refreshCart();
  } catch (error) {
    console.error("Error updating item quantity:", error);
    Utils.showNotification("Failed to update cart", "error");

    // Revert UI change since server update failed
    initializeCart();
  }
}

// Remove item from cart
async function removeItem(itemId) {
  try {
    // Remove from server
    await API.removeFromBasket(itemId);

    // Remove from UI
    const itemElement = document.querySelector(
      `.cart-item[data-id="${itemId}"]`
    );
    if (itemElement) {
      itemElement.remove();
    }

    // Refresh cart
    refreshCart();
  } catch (error) {
    console.error("Error removing item from cart:", error);
    Utils.showNotification("Failed to remove item from cart", "error");
  }
}

// Refresh cart data
async function refreshCart() {
  try {
    const basket = await API.getBasket();

    if (!Array.isArray(basket) || basket.length === 0) {
      displayEmptyCart();
      return;
    }

    // Map basket items to include product details
    const itemsWithDetails = [];

    for (const item of basket) {
      try {
        const product = await API.getProductById(item.productId);
        itemsWithDetails.push({
          ...item,
          product,
        });
      } catch (error) {
        console.error(`Error fetching product ${item.productId}:`, error);
      }
    }

    // Update cart summary
    updateCartSummary(itemsWithDetails);

    // Update price displays for each item
    itemsWithDetails.forEach((item) => {
      const priceElement = document.querySelector(
        `.cart-item[data-id="${item.id}"] .cart-item-price`
      );
      if (priceElement) {
        priceElement.textContent = Utils.formatPrice(
          item.product.price * item.quantity
        );
      }
    });

    // Update cart count in header
    let itemCount = itemsWithDetails.reduce(
      (total, item) => total + item.quantity,
      0
    );
    Utils.updateCartCount(itemCount);
  } catch (error) {
    console.error("Error refreshing cart:", error);
  }
}
