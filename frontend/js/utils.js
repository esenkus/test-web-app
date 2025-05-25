// Utility functions for the shop
const Utils = {
  // Format price to currency display
  formatPrice(price) {
    return `$${price.toFixed(2)}`;
  },

  // Create HTML elements with properties
  createElement(tag, props = {}, children = []) {
    const element = document.createElement(tag);

    Object.entries(props).forEach(([key, value]) => {
      if (key === "classList" && Array.isArray(value)) {
        value.forEach((cls) => element.classList.add(cls));
      } else if (key === "dataset" && typeof value === "object") {
        Object.entries(value).forEach(([dataKey, dataValue]) => {
          element.dataset[dataKey] = dataValue;
        });
      } else if (key.startsWith("on") && typeof value === "function") {
        element.addEventListener(key.substring(2).toLowerCase(), value);
      } else {
        element[key] = value;
      }
    });

    if (typeof children === "string") {
      element.textContent = children;
    } else if (Array.isArray(children)) {
      children.forEach((child) => {
        if (child instanceof Element) {
          element.appendChild(child);
        } else if (typeof child === "string") {
          element.appendChild(document.createTextNode(child));
        }
      });
    }

    return element;
  },

  // Show a notification toast
  showNotification(message, type = "success", duration = 3000) {
    const toast = this.createElement(
      "div",
      {
        classList: ["toast", `toast-${type}`],
      },
      message
    );

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("show");
    }, 10);

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, duration);
  },

  // Truncate text to a specific length
  truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  },

  // Validate form inputs
  validateInput(type, value) {
    switch (type) {
      case "email":
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      case "password":
        return value.length >= 6;
      case "username":
        return value.length >= 3;
      case "notEmpty":
        return value.trim() !== "";
      default:
        return true;
    }
  },

  // Handle form errors
  showFormError(inputElement, message) {
    const errorElement = this.createElement(
      "div",
      {
        classList: ["form-error"],
      },
      message
    );

    const existingError = inputElement.parentNode.querySelector(".form-error");
    if (existingError) {
      inputElement.parentNode.removeChild(existingError);
    }

    inputElement.classList.add("input-error");
    inputElement.parentNode.appendChild(errorElement);
  },

  clearFormError(inputElement) {
    const existingError = inputElement.parentNode.querySelector(".form-error");
    if (existingError) {
      inputElement.parentNode.removeChild(existingError);
    }
    inputElement.classList.remove("input-error");
  },

  // Navigation functions
  navigateTo(page) {
    window.location.href = page;
  },

  // Get URL parameters
  getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  },

  // Update cart count in header
  updateCartCount(count) {
    const cartCountElement = document.querySelector(".cart-count");
    if (cartCountElement) {
      cartCountElement.textContent = count;
    }
  }, // Update authentication UI elements
  updateAuthUI() {
    const isAuthenticated = localStorage.getItem("token") !== null;
    const username = isAuthenticated
      ? JSON.parse(atob(localStorage.getItem("token").split(".")[1])).sub
      : null;

    const authContainer = document.querySelector(".auth-buttons");
    if (!authContainer) return;

    // Determine if we're in a page within the pages directory or at the root
    const isInPagesDir = window.location.pathname.includes("/pages/");
    const profilePath = isInPagesDir ? "profile.html" : "pages/profile.html";
    const ordersPath = isInPagesDir ? "orders.html" : "pages/orders.html";
    const loginPath = isInPagesDir ? "login.html" : "pages/login.html";
    const registerPath = isInPagesDir ? "register.html" : "pages/register.html";

    if (isAuthenticated && username) {
      authContainer.innerHTML = `
        <div class="user-menu">
          <button class="btn btn-outline">Welcome, ${username}</button>
          <div class="user-dropdown">
            <a href="${profilePath}" class="user-dropdown-item">My Profile</a>
            <a href="${ordersPath}" class="user-dropdown-item">My Orders</a>
            <a href="#" class="user-dropdown-item" id="logout-btn">Logout</a>
          </div>
        </div>
      `;
      document.getElementById("logout-btn").addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("token");
        window.location.reload();
      });
    } else {
      authContainer.innerHTML = `
        <a href="${loginPath}" class="btn btn-outline">Login</a>
        <a href="${registerPath}" class="btn btn-primary">Register</a>
      `;
    }
  },
};

export default Utils;
