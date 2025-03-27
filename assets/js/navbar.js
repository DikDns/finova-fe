document.addEventListener("DOMContentLoaded", () => {
  const navbarToggler = document.querySelector(".navbar-toggler");
  const navbarCollapse = document.querySelector(".navbar-collapse");
  const navLinks = document.querySelectorAll(".nav-link");
  const navbarClose = document.querySelector(".navbar-close");

  // Toggle menu state
  navbarToggler.addEventListener("click", () => {
    navbarCollapse.classList.toggle("show");
    navbarToggler.classList.toggle("active");
    document.body.style.overflow = navbarCollapse.classList.contains("show")
      ? "hidden"
      : "";
  });

  // Add close button functionality
  navbarClose.addEventListener("click", () => {
    navbarCollapse.classList.remove("show");
    navbarToggler.classList.remove("active");
    document.body.style.overflow = "";
  });

  // Close menu when clicking outside
  document.addEventListener("click", (e) => {
    if (
      !navbarCollapse.contains(e.target) &&
      !navbarToggler.contains(e.target) &&
      navbarCollapse.classList.contains("show")
    ) {
      navbarCollapse.classList.remove("show");
      document.body.style.overflow = "";
    }
  });

  // Close menu when clicking nav links
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navbarCollapse.classList.remove("show");
      document.body.style.overflow = "";
    });
  });
});
