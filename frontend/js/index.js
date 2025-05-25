// Main JavaScript file for the index page
import API from "./api.js";
import Utils from "./utils.js";

document.addEventListener("DOMContentLoaded", async () => {
  // Initialize the UI
  Utils.updateAuthUI();

  // Load featured products
  await loadFeaturedProducts();

  // Set up event listeners
  setupEventListeners();

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

// Load featured products for the homepage
async function loadFeaturedProducts() {
  const featuredContainer = document.getElementById("featured-products");

  if (!featuredContainer) return;

  try {
    const products = await API.getProducts();

    // Clear loading message
    featuredContainer.innerHTML = "";

    // Display only first 4 products as featured
    const featuredProducts = products.slice(0, 4);

    if (featuredProducts.length === 0) {
      featuredContainer.innerHTML =
        '<p class="no-products">No products available at the moment.</p>';
      return;
    }

    featuredProducts.forEach((product) => {
      const productCard = createProductCard(product);
      featuredContainer.appendChild(productCard);
    });
  } catch (error) {
    console.error("Error loading featured products:", error);
    if (featuredContainer) {
      featuredContainer.innerHTML =
        '<p class="error">Failed to load products. Please try again later.</p>';
    }
  }
}

// Get the appropriate image for a product
function getProductImage(product) {
  // Use the imagePath from the product if available
  if (product.imagePath) {
    // Remove leading slash if present
    return product.imagePath.startsWith("/")
      ? product.imagePath.substring(1)
      : product.imagePath;
  }

  // Fallback to the old method if imagePath is not available (for backward compatibility)
  switch (product.id) {
    case 1: // Android App Protection
    case 2: // Web Application Security
      return "assets/images/Digital.ai_App_Security_Logo.svg";
    case 4: // Agility
      return "assets/images/agility-logo-fc-dark.svg";
    case 5: // Release
      return "assets/images/release-logo-no-echo-fc-dark.svg";
    case 6: // Deploy
      return "assets/images/deploy-logo-no-echo-fc-dark.svg";
    case 7: // Continuous Testing
      return "assets/images/continuous-testing-logo-no-echo-fc-dark.svg";
    case 8: // App Aware
      return "assets/images/app-aware-logo-no-echo-fc-dark.svg";
    default:
      return "assets/images/placeholder.svg";
  }
}

// Create a product card element
function createProductCard(product) {
  const card = document.createElement("div");
  card.className = "product-card";

  card.innerHTML = `
        <div class="product-image">
            <img src="${getProductImage(product)}" alt="${product.name}">
        </div>
        <div class="product-content">
            <h3 class="product-title">${product.name}</h3>
            <p class="product-version">Version ${product.version}</p>
            <p class="product-description">${Utils.truncateText(
              product.description,
              100
            )}</p>
            <p class="product-price">${Utils.formatPrice(product.price)}</p>
            <div class="product-action">
                <a href="pages/product-detail.html?id=${
                  product.id
                }" class="btn btn-outline">View Details</a>
                <button class="btn btn-primary add-to-cart" data-id="${
                  product.id
                }">Add to Cart</button>
            </div>
        </div>
    `;

  return card;
}

// Setup event listeners
function setupEventListeners() {
  // Handle add to cart button clicks using delegation
  document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("add-to-cart")) {
      e.preventDefault();

      const productId = e.target.getAttribute("data-id");

      if (!API.isAuthenticated()) {
        // If not logged in, redirect to login page
        Utils.showNotification(
          "Please login to add items to your cart",
          "warning"
        );
        setTimeout(() => {
          window.location.href =
            "pages/login.html?redirect=" +
            encodeURIComponent(window.location.href);
        }, 1500);
        return;
      }

      try {
        await API.addToBasket(productId, 1);
        Utils.showNotification("Product added to cart successfully!");

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
  });
}
