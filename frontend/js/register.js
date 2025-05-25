// Registration page script
import { API, Utils } from "../js/main.js";

document.addEventListener("DOMContentLoaded", () => {
  // If already logged in, redirect to homepage
  if (API.isAuthenticated()) {
    redirectAfterAuth();
    return;
  }

  setupRegistrationForm();
});

// Setup registration form
function setupRegistrationForm() {
  const registerForm = document.getElementById("register-form");
  const registerError = document.getElementById("register-error");

  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirm-password").value;

      // Validate inputs
      if (!username) {
        showError("Please enter a username");
        return;
      }

      if (username.length < 3) {
        showError("Username must be at least 3 characters long");
        return;
      }

      if (!password) {
        showError("Please enter a password");
        return;
      }

      if (password.length < 6) {
        showError("Password must be at least 6 characters long");
        return;
      }

      if (password !== confirmPassword) {
        showError("Passwords do not match");
        return;
      }

      try {
        const result = await API.register(username, password);

        showError("", false);
        Utils.showNotification("Registration successful! Please log in.");

        setTimeout(() => {
          window.location.href = "login.html";
        }, 1500);
      } catch (error) {
        console.error("Registration error:", error);
        showError(error.message || "Registration failed. Please try again.");
      }
    });
  }
}

// Show error message
function showError(message, isError = true) {
  const errorElement = document.getElementById("register-error");

  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = isError && message ? "block" : "none";
  }
}

// Redirect after successful authentication
function redirectAfterAuth() {
  // Check if there's a redirect parameter in the URL
  const urlParams = new URLSearchParams(window.location.search);
  const redirectUrl = urlParams.get("redirect");

  if (redirectUrl) {
    window.location.href = redirectUrl;
  } else {
    window.location.href = "../index.html";
  }
}
