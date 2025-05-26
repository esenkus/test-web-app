// Components handler for loading reusable UI components
const Components = {
  // Load components from the components directory
  async loadComponents() {
    // Determine if we're in the pages directory or at the root
    const isInPagesDir = window.location.pathname.includes("/pages/");
    const rootPath = isInPagesDir ? "../" : "./";

    // Load header component
    await this.loadComponent(
      "header-container",
      `${rootPath}components/header.html`,
      { rootPath }
    );

    // Load footer component
    await this.loadComponent(
      "footer-container",
      `${rootPath}components/footer.html`,
      { rootPath }
    );
  },

  // Load a component and inject it into the DOM
  async loadComponent(containerId, componentPath, data = {}) {
    try {
      const container = document.getElementById(containerId);
      if (!container) return;

      const response = await fetch(componentPath);
      if (!response.ok) {
        throw new Error(`Failed to load component: ${componentPath}`);
      }

      let html = await response.text();

      // Replace any variables in the template
      Object.keys(data).forEach((key) => {
        const regex = new RegExp(`{{${key}}}`, "g");
        html = html.replace(regex, data[key]);
      });

      container.innerHTML = html;

      // If this is the header, we need to update the auth UI
      if (containerId === "header-container") {
        // We need to import Utils inside this function since
        // it's loaded as a module
        import("./utils.js").then((module) => {
          const Utils = module.default;
          Utils.updateAuthUI();
        });
      }

      // Mark active navigation links
      this.markActiveLinks();
    } catch (error) {
      console.error(`Error loading component ${componentPath}:`, error);
    }
  },

  // Mark the current page link as active
  markActiveLinks() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll(".nav-link");

    navLinks.forEach((link) => {
      // Extract filename from the link's href attribute
      const linkPath = link.getAttribute("href");
      const linkPathEnd = linkPath.split("/").pop();

      // Check if the current path ends with the link's filename
      if (currentPath.endsWith(linkPathEnd)) {
        link.classList.add("active");
      } else if (
        currentPath.endsWith("index.html") &&
        linkPathEnd === "index.html"
      ) {
        link.classList.add("active");
      } else if (currentPath === "/" && linkPathEnd === "index.html") {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  },
};

export default Components;
