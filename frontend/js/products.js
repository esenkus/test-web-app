// Products page script
import API from "./api.js";
import Utils from "./utils.js";
import Components from "./components.js";

document.addEventListener("DOMContentLoaded", async () => {
  // Load components
  await Components.loadComponents();

  // Load products
  loadProducts();

  // Set up event listeners
  setupEventListeners();

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

// Load all products
async function loadProducts() {
  const productsGrid = document.getElementById("products-grid");

  try {
    const products = await API.getProducts();

    if (productsGrid) {
      // Clear loading message
      productsGrid.innerHTML = "";

      if (products.length === 0) {
        productsGrid.innerHTML =
          '<p class="no-products">No products available at the moment.</p>';
        return;
      }

      products.forEach((product) => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
      });
    }
  } catch (error) {
    console.error("Error loading products:", error);
    if (productsGrid) {
      productsGrid.innerHTML =
        '<p class="error">Failed to load products. Please try again later.</p>';
    }
  }
}

// Get the appropriate image for a product
function getProductImage(product) {
  // Use the imagePath from the product if available
  if (product.imagePath) {
    // Handle relative paths based on the current location
    const isInPagesDir = window.location.pathname.includes("/pages/");
    const prefix = isInPagesDir ? ".." : ".";
    return `${prefix}${product.imagePath}`;
  }

  // Fallback to the old method if imagePath is not available (for backward compatibility)
  switch (product.id) {
    case 1: // Android App Protection
    case 2: // Web Application Security
      return "../assets/images/Digital.ai_App_Security_Logo.svg";
    case 4: // Agility
      return "../assets/images/agility-logo-fc-dark.svg";
    case 5: // Release
      return "../assets/images/release-logo-no-echo-fc-dark.svg";
    case 6: // Deploy
      return "../assets/images/deploy-logo-no-echo-fc-dark.svg";
    case 7: // Continuous Testing
      return "../assets/images/continuous-testing-logo-no-echo-fc-dark.svg";
    case 8: // App Aware
      return "../assets/images/app-aware-logo-no-echo-fc-dark.svg";
    default:
      return "../assets/images/placeholder.svg";
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
                <a href="product-detail.html?id=${
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
  // Sort products
  const sortSelect = document.getElementById("sort-select");
  if (sortSelect) {
    sortSelect.addEventListener("change", sortProducts);
  }

  // Search products
  const searchButton = document.getElementById("search-button");
  if (searchButton) {
    searchButton.addEventListener("click", searchProducts);
  }

  // Search on enter key
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        searchProducts();
      }
    });
  }

  // Add to cart buttons using delegation
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
            "login.html?redirect=" + encodeURIComponent(window.location.href);
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

// Sort products based on selected option
function sortProducts() {
  const sortSelect = document.getElementById("sort-select");
  const productsGrid = document.getElementById("products-grid");

  if (!sortSelect || !productsGrid) return;

  const sortValue = sortSelect.value;
  const products = Array.from(productsGrid.querySelectorAll(".product-card"));

  products.sort((a, b) => {
    if (sortValue === "name-asc") {
      return a
        .querySelector(".product-title")
        .textContent.localeCompare(
          b.querySelector(".product-title").textContent
        );
    } else if (sortValue === "name-desc") {
      return b
        .querySelector(".product-title")
        .textContent.localeCompare(
          a.querySelector(".product-title").textContent
        );
    } else if (sortValue === "price-asc") {
      const priceA = parseFloat(
        a.querySelector(".product-price").textContent.replace("$", "")
      );
      const priceB = parseFloat(
        b.querySelector(".product-price").textContent.replace("$", "")
      );
      return priceA - priceB;
    } else if (sortValue === "price-desc") {
      const priceA = parseFloat(
        a.querySelector(".product-price").textContent.replace("$", "")
      );
      const priceB = parseFloat(
        b.querySelector(".product-price").textContent.replace("$", "")
      );
      return priceB - priceA;
    }
    return 0;
  });

  // Clear container and append sorted products
  productsGrid.innerHTML = "";
  products.forEach((product) => {
    productsGrid.appendChild(product);
  });
}

// Search products
function searchProducts() {
  const searchInput = document.getElementById("search-input");
  const productsGrid = document.getElementById("products-grid");

  if (!searchInput || !productsGrid) return;

  const searchQuery = searchInput.value.trim().toLowerCase();

  if (searchQuery === "") {
    // If search is empty, show all products
    const products = document.querySelectorAll(".product-card");
    products.forEach((product) => {
      product.style.display = "block";
    });
    return;
  }

  // Filter products based on search query
  const products = document.querySelectorAll(".product-card");
  let hasResults = false;

  products.forEach((product) => {
    const title = product
      .querySelector(".product-title")
      .textContent.toLowerCase();
    const description = product
      .querySelector(".product-description")
      .textContent.toLowerCase();

    if (title.includes(searchQuery) || description.includes(searchQuery)) {
      product.style.display = "block";
      hasResults = true;
    } else {
      product.style.display = "none";
    }
  });

  // Show no results message
  if (!hasResults) {
    const noResults = document.createElement("p");
    noResults.className = "no-products";
    noResults.textContent = `No products found matching "${searchQuery}"`;

    productsGrid.appendChild(noResults);
  }
}
