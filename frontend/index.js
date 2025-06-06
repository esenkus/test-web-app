// Main index.js for homepage
import API from "./js/api.js";
import Utils from "./js/utils.js";

document.addEventListener("DOMContentLoaded", () => {
  // Initialize UI
  Utils.updateAuthUI();

  // Load products
  loadFeaturedProducts();

  // Setup event listeners
  setupEventListeners();

  // Update cart count if user is logged in
  if (API.isAuthenticated()) {
    try {
      API.getBasket()
        .then((basket) => {
          let itemCount = 0;
          if (Array.isArray(basket)) {
            itemCount = basket.reduce(
              (total, item) => total + item.quantity,
              0
            );
          }
          Utils.updateCartCount(itemCount);
        })
        .catch((error) => {
          console.error("Error loading basket:", error);
        });
    } catch (error) {
      console.error("Error checking authentication status:", error);
    }
  }
});

// Load featured products on the homepage
async function loadFeaturedProducts() {
  const featuredContainer = document.getElementById("featured-products");

  try {
    const products = await API.getProducts();

    if (featuredContainer) {
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
    }
  } catch (error) {
    console.error("Error loading featured products:", error);
    if (featuredContainer) {
      featuredContainer.innerHTML =
        '<p class="error">Failed to load products. Please try again later.</p>';
    }
  }
}

// Create a product card element
function createProductCard(product) {
  const card = document.createElement("div");
  card.className = "product-card";

  card.innerHTML = `
        <div class="product-image">
            <img src="https://via.placeholder.com/300x200?text=${
              product.name
            }" alt="${product.name}">
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
