// Profile page script
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

  // Load user profile
  loadUserProfile();

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

async function loadUserProfile() {
  const profileContainer = document.getElementById("user-profile");

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not authenticated");
    }

    // Parse token to get username
    const payload = JSON.parse(atob(token.split(".")[1]));
    const username = payload.sub;

    // Set up event listeners for buttons
    document.addEventListener("click", function (e) {
      if (e.target && e.target.id === "change-password-btn") {
        alert("Change password functionality will be implemented soon!");
      }
      if (e.target && e.target.id === "edit-profile-btn") {
        alert("Edit profile functionality will be implemented soon!");
      }
    });

    // For a real application, you would fetch user details from the server
    // For now, just display the username and some placeholder data
    profileContainer.innerHTML = `
            <div class="profile-detail">
                <label>Username:</label>
                <p>${username}</p>
            </div>
            <div class="profile-detail">
                <label>Email:</label>
                <p>${username}@example.com</p>
            </div>
            <div class="profile-detail">
                <label>Member Since:</label>
                <p>May 1, 2025</p>
            </div>
            <div class="profile-detail">
                <label>Account Type:</label>
                <p>Standard</p>
            </div>
        `;
  } catch (error) {
    console.error("Error loading profile:", error);
    profileContainer.innerHTML =
      '<p class="error">Failed to load profile information. Please try again later.</p>';
  }
}
