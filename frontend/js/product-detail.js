// Product detail page script
import { API, Utils } from "../js/main.js";

document.addEventListener("DOMContentLoaded", () => {
  loadProductDetails();
  setupEventListeners();

  // Initialize reviews section based on auth state
  const isAuthenticated = API.isAuthenticated();
  if (isAuthenticated) {
    document.getElementById("add-review-section").style.display = "block";
    document.getElementById("login-to-review").style.display = "none";
  } else {
    document.getElementById("add-review-section").style.display = "none";
    document.getElementById("login-to-review").style.display = "block";
  }
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

    // Load reviews after product details are loaded
    loadProductReviews(productId);
  } catch (error) {
    console.error("Error loading product details:", error);
    showError("Failed to load product details");
  }
}

// Load reviews for the product
async function loadProductReviews(productId) {
  const reviewsSection = document.getElementById("reviews-section");
  const reviewsList = document.getElementById("reviews-list");
  const reviewsLoading = document.getElementById("reviews-loading");
  const noReviews = document.getElementById("no-reviews");

  reviewsSection.style.display = "block";

  try {
    const reviews = await API.getProductReviews(productId);

    reviewsLoading.style.display = "none";

    if (!reviews || reviews.length === 0) {
      noReviews.style.display = "block";
      return;
    }

    // Sort reviews by date (newest first)
    reviews.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Display reviews
    reviews.forEach((review) => {
      const reviewElement = createReviewElement(review);
      reviewsList.appendChild(reviewElement);
    });
  } catch (error) {
    console.error("Error loading reviews:", error);
    reviewsLoading.style.display = "none";
    reviewsList.innerHTML =
      '<div class="error">Failed to load reviews. Please try again later.</div>';
  }
}

// Create a review element
function createReviewElement(review) {
  const reviewItem = document.createElement("div");
  reviewItem.className = "review-item";

  // Format date
  const reviewDate = new Date(review.date);
  const formattedDate = reviewDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Create star rating HTML
  const starsHtml = generateStarRating(review.rating);

  // Set review HTML
  reviewItem.innerHTML = `
    <div class="review-header">
      <span class="review-author">${review.username}</span>
      <span class="review-date">${formattedDate}</span>
    </div>
    <div class="review-rating">
      ${starsHtml}
    </div>
    <div class="review-comment">
      ${review.comment}
    </div>
  `;

  return reviewItem;
}

// Generate star rating HTML
function generateStarRating(rating) {
  let starsHtml = "";
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      starsHtml += '<i class="fas fa-star"></i>';
    } else {
      starsHtml += '<i class="far fa-star"></i>';
    }
  }
  return starsHtml;
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

  // Review form submission
  const reviewForm = document.getElementById("review-form");
  if (reviewForm) {
    reviewForm.addEventListener("submit", submitReview);
  }

  // Star rating click handler
  const stars = document.querySelectorAll(".star-rating i");
  stars.forEach((star) => {
    star.addEventListener("click", () => {
      const rating = parseInt(star.getAttribute("data-rating"));
      document.getElementById("review-rating").value = rating;
      updateStarRating(rating);
    });
  });

  // Initialize star rating UI
  updateStarRating(5);
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

// Submit a new review
async function submitReview(event) {
  event.preventDefault();

  const productId = Utils.getUrlParam("id");
  const ratingInput = document.getElementById("review-rating");
  const commentInput = document.getElementById("review-comment");
  const reviewError = document.getElementById("review-error");
  const submitButton = document.getElementById("submit-review-btn");

  const rating = parseInt(ratingInput.value);
  const comment = commentInput.value.trim();

  // Clear previous errors
  reviewError.style.display = "none";
  reviewError.textContent = "";

  // Validate inputs
  if (!rating || rating < 1 || rating > 5) {
    reviewError.textContent = "Please select a rating from 1 to 5 stars";
    reviewError.style.display = "block";
    return;
  }

  if (!comment) {
    reviewError.textContent = "Please enter a review comment";
    reviewError.style.display = "block";
    return;
  }

  // Disable submit button during submission
  submitButton.disabled = true;
  submitButton.textContent = "Submitting...";

  try {
    // Submit the review
    await API.addProductReview(productId, rating, comment);

    // Show success message
    const successMessage = document.createElement("div");
    successMessage.className = "review-success";
    successMessage.textContent = "Your review was submitted successfully!";

    const reviewForm = document.getElementById("review-form");
    reviewForm.parentNode.insertBefore(successMessage, reviewForm);

    // Reset form
    commentInput.value = "";

    // Update the star rating UI to reflect the initial state
    updateStarRating(5);
    ratingInput.value = "5";

    // Reload reviews after a short delay
    setTimeout(() => {
      // Clear existing reviews
      document.getElementById("reviews-list").innerHTML = "";

      // Reload reviews
      loadProductReviews(productId);

      // Remove success message after reload
      successMessage.remove();

      // Re-enable submit button
      submitButton.disabled = false;
      submitButton.textContent = "Submit Review";
    }, 1500);
  } catch (error) {
    console.error("Error submitting review:", error);
    reviewError.textContent =
      error.message || "Failed to submit review. Please try again.";
    reviewError.style.display = "block";

    // Re-enable submit button
    submitButton.disabled = false;
    submitButton.textContent = "Submit Review";
  }
}

// Update star rating UI
function updateStarRating(rating) {
  const stars = document.querySelectorAll(".star-rating i");
  stars.forEach((star, index) => {
    if (index < rating) {
      star.className = "fas fa-star"; // Solid star
    } else {
      star.className = "far fa-star"; // Empty star
    }
  });
}
