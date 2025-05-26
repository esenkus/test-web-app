// Login page script
import { API, Utils, Components } from "../js/main.js";

document.addEventListener("DOMContentLoaded", async () => {
  // Load components
  await Components.loadComponents();

  // If already logged in, redirect to homepage
  if (API.isAuthenticated()) {
    redirectAfterAuth();
    return;
  }

  setupLoginForm();
});

// Setup login form
function setupLoginForm() {
  const loginForm = document.getElementById("login-form");
  const loginError = document.getElementById("login-error");

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value;

      if (!username || !password) {
        showError("Please enter both username and password");
        return;
      }

      try {
        const token = await API.login(username, password);

        if (token) {
          // Save token and redirect
          API.saveToken(token);
          showError("", false);
          Utils.showNotification("Login successful! Redirecting...");

          setTimeout(() => {
            redirectAfterAuth();
          }, 1000);
        } else {
          showError("Invalid username or password");
        }
      } catch (error) {
        console.error("Login error:", error);
        showError(error.message || "Login failed. Please try again.");
      }
    });
  }
}

// Show error message
function showError(message, isError = true) {
  const errorElement = document.getElementById("login-error");

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
