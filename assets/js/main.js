// ==========================================
// Synovus - Main JavaScript
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Bootstrap Tooltips if available
  if (window.bootstrap && window.bootstrap.Tooltip) {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    [...tooltipTriggerList].map(tooltipTriggerEl => new window.bootstrap.Tooltip(tooltipTriggerEl));
  }

  // Navbar glassmorphism scroll effect
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        navbar.classList.add('shadow-sm');
      } else {
        navbar.classList.remove('shadow-sm');
      }
    });
  }

  console.log('Synovus initialized: Bootstrap 5 & SCSS ready.');
});
