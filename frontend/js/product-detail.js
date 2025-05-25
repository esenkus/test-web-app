// Product detail page script
import { API, Utils } from "../js/main.js";

document.addEventListener("DOMContentLoaded", () => {
  loadProductDetails();
  setupEventListeners();
});

// Load product details based on URL parameter
async function loadProductDetails() {
  const productId = Utils.getUrlParam("id");

  if (!productId) {
    showError("Product ID is missing");
    return;
  }

  try {
    const product = await API.getProductById(productId);
    displayProductDetails(product);
    document.getElementById("product-loading").style.display = "none";
    document.getElementById("product-detail").style.display = "flex";
  } catch (error) {
    console.error("Error loading product details:", error);
    showError("Failed to load product details");
  }
}

// Display product details in the UI
function displayProductDetails(product) {
  // Update breadcrumb
  document.getElementById("product-breadcrumb-name").textContent = product.name;

  // Update product details
  document.getElementById("product-title").textContent = product.name;
  document.getElementById(
    "product-version"
  ).textContent = `Version ${product.version}`;
  document.getElementById("product-price").textContent = Utils.formatPrice(
    product.price
  );
  document.getElementById("product-description").textContent =
    product.description;

  // Update product image
  const productImage = document.getElementById("product-image");
  if (product.imagePath) {
    productImage.src = `..${product.imagePath}`;
  } else {
    productImage.src = `../assets/images/product-large.svg`;
  }
  productImage.alt = product.name;

  // Set page title
  document.title = `${product.name} - Digital.ai Shop`;

  // Set add to cart button data
  const addToCartBtn = document.getElementById("add-to-cart-btn");
  addToCartBtn.setAttribute("data-id", product.id);
}

// Show error message
function showError(message) {
  document.getElementById("product-loading").style.display = "none";
  document.getElementById("product-detail").style.display = "none";

  const errorContainer = document.getElementById("product-error");
  errorContainer.style.display = "block";

  // Add specific error message if provided
  if (message) {
    const errorParagraph = errorContainer.querySelector("p");
    errorParagraph.textContent = message;
  }
}

// Setup event listeners
function setupEventListeners() {
  // Quantity buttons
  const decreaseBtn = document.getElementById("decrease-quantity");
  const increaseBtn = document.getElementById("increase-quantity");
  const quantityInput = document.getElementById("quantity");

  if (decreaseBtn && increaseBtn && quantityInput) {
    decreaseBtn.addEventListener("click", () => {
      const currentValue = parseInt(quantityInput.value);
      if (currentValue > 1) {
        quantityInput.value = currentValue - 1;
      }
    });

    increaseBtn.addEventListener("click", () => {
      const currentValue = parseInt(quantityInput.value);
      if (currentValue < 10) {
        quantityInput.value = currentValue + 1;
      }
    });

    // Validate quantity input
    quantityInput.addEventListener("change", () => {
      let value = parseInt(quantityInput.value);

      if (isNaN(value) || value < 1) {
        value = 1;
      } else if (value > 10) {
        value = 10;
      }

      quantityInput.value = value;
    });
  }

  // Add to cart button
  const addToCartBtn = document.getElementById("add-to-cart-btn");
  if (addToCartBtn) {
    addToCartBtn.addEventListener("click", addToCart);
  }

  // Back button
  const backBtn = document.getElementById("back-to-products");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.history.back();
    });
  }
}

// Add product to cart
async function addToCart() {
  if (!API.isAuthenticated()) {
    // If not logged in, redirect to login page
    Utils.showNotification("Please login to add items to your cart", "warning");
    setTimeout(() => {
      window.location.href =
        "login.html?redirect=" + encodeURIComponent(window.location.href);
    }, 1500);
    return;
  }

  const productId = document
    .getElementById("add-to-cart-btn")
    .getAttribute("data-id");
  const quantity = parseInt(document.getElementById("quantity").value);

  if (!productId || isNaN(quantity) || quantity < 1) {
    Utils.showNotification("Invalid product or quantity", "error");
    return;
  }

  try {
    // Add to cart
    await API.addToBasket(productId, quantity);
    Utils.showNotification(`${quantity} item(s) added to cart successfully!`);

    // Update cart count
    const basket = await API.getBasket();
    let itemCount = 0;
    if (Array.isArray(basket)) {
      itemCount = basket.reduce((total, item) => total + item.quantity, 0);
    }
    Utils.updateCartCount(itemCount);
  } catch (error) {
    console.error("Error adding to cart:", error);
    Utils.showNotification("Failed to add product to cart", "error");
  }
}
