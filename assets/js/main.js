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

  // Sticky header: hides on scroll down, reappears on scroll up. Stays
  // visible near the top of the page regardless of direction so it
  // doesn't flicker while the alert bar is still scrolling past.
  const siteHeader = document.querySelector('.site-header-syn');
  if (siteHeader) {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateHeaderVisibility = () => {
      const currentScrollY = window.scrollY;
      const headerHeight = siteHeader.offsetHeight;

      // Only flips once per threshold crossing, not on every scroll tick -
      // switching position on every direction change (instead of only
      // here) was what made scrolling feel janky.
      siteHeader.classList.toggle('is-scrolled', currentScrollY > headerHeight);

      if (currentScrollY <= headerHeight) {
        siteHeader.classList.remove('is-header-hidden');
      } else if (currentScrollY > lastScrollY) {
        siteHeader.classList.add('is-header-hidden');
      } else if (currentScrollY < lastScrollY) {
        siteHeader.classList.remove('is-header-hidden');
      }
      lastScrollY = currentScrollY;
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateHeaderVisibility);
        ticking = true;
      }
    }, { passive: true });
  }

  // Desktop mega-menu: hover-intent with a short close-delay so moving the
  // mouse from the nav item to its panel doesn't close it early.
  const megaItems = document.querySelectorAll('.nav-mega-syn-item');
  if (megaItems.length) {
    let closeTimer = null;
    megaItems.forEach(item => {
      item.addEventListener('mouseenter', () => {
        clearTimeout(closeTimer);
        megaItems.forEach(other => other.classList.toggle('is-open', other === item));
      });
      item.addEventListener('mouseleave', () => {
        closeTimer = setTimeout(() => item.classList.remove('is-open'), 150);
      });
      item.addEventListener('focusin', () => {
        clearTimeout(closeTimer);
        megaItems.forEach(other => other.classList.toggle('is-open', other === item));
      });
      item.addEventListener('focusout', (e) => {
        if (!item.contains(e.relatedTarget)) item.classList.remove('is-open');
      });
    });
  }

  // Mobile offcanvas 3-level drill-down (root -> category -> links)
  const navDrill = document.querySelector('.nav-offcanvas-syn');
  if (navDrill) {
    const screens = [...navDrill.querySelectorAll('.nav-offcanvas-syn-screen')];
    const goToScreen = (targetId, direction) => {
      screens.forEach(screen => {
        if (screen.dataset.screen === targetId) {
          screen.classList.remove('exit-left');
          screen.classList.add('is-active');
        } else if (screen.classList.contains('is-active')) {
          screen.classList.remove('is-active');
          screen.classList.toggle('exit-left', direction === 'forward');
        }
      });
    };

    navDrill.querySelectorAll('[data-open-screen]').forEach(btn => {
      btn.addEventListener('click', () => goToScreen(btn.dataset.openScreen, 'forward'));
    });
    navDrill.querySelectorAll('[data-back-screen]').forEach(btn => {
      btn.addEventListener('click', () => goToScreen(btn.dataset.backScreen, 'back'));
    });

    // Reset to the root screen whenever the menu is closed, so it doesn't
    // reopen mid-submenu.
    navDrill.addEventListener('hidden.bs.offcanvas', () => goToScreen('root', 'back'));
  }

  // Flip cards (Resources product cards): the corner icon flips the card
  // to reveal its back face, and flips it back again from there.
  document.querySelectorAll('[data-flip-trigger]').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('[data-flip-card]').classList.toggle('is-flipped');
    });
  });

  // Partner carousel (Module D): Swiper drives the slide mechanics, pointed
  // at the existing carousel-syn-* controls so the visual design is unchanged.
  const carouselEl = document.querySelector('.carousel-syn-swiper');
  if (carouselEl && window.Swiper) {
    const swiper = new window.Swiper(carouselEl, {
      slidesPerView: 1,
      navigation: {
        nextEl: '.carousel-syn-next',
        prevEl: '.carousel-syn-prev',
      },
      pagination: {
        el: '.carousel-syn-pagination',
        clickable: true,
        bulletClass: 'carousel-syn-dot',
        bulletActiveClass: 'is-active',
      },
    });

    // A single slide has nothing to navigate to - hide the controls rather
    // than show inert arrows/dots. Re-show automatically once more slides
    // are added later.
    const controls = document.querySelector('[data-carousel-controls]');
    if (controls) controls.hidden = swiper.slides.length <= 1;
  }

  // News Ideas carousel: 1 card below 575px, 2 between 575-1023, 3 at
  // 1024px+ (where all cards fit side by side with nothing left to slide).
  const newsCarouselEl = document.querySelector('.news-ideas-syn-swiper');
  if (newsCarouselEl && window.Swiper) {
    new window.Swiper(newsCarouselEl, {
      slidesPerView: 1,
      spaceBetween: 16,
      navigation: {
        nextEl: '.news-ideas-syn-next',
        prevEl: '.news-ideas-syn-prev',
      },
      pagination: {
        el: '.news-ideas-syn-pagination',
        clickable: true,
        bulletClass: 'carousel-syn-dot',
        bulletActiveClass: 'is-active',
      },
      breakpoints: {
        575: { slidesPerView: 2, spaceBetween: 16 },
        1024: { slidesPerView: 3, spaceBetween: 32 },
      },
    });
  }

  // Stat counters (Module C): count up from 0 the first time they scroll
  // into view (dev note: "numbers count up, odometer roll, on scroll").
  const statEls = document.querySelectorAll('.syn-stat, .syn-stat-sm');
  if (statEls.length && 'IntersectionObserver' in window) {
    const animateCount = (el) => {
      const match = el.textContent.trim().match(/^(\D*)([\d,]+)(\D*)$/);
      if (!match) return;
      const [, prefix, numStr, suffix] = match;
      const target = parseInt(numStr.replace(/,/g, ''), 10);
      const duration = 1200;
      const start = performance.now();
      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = prefix + Math.round(target * eased).toLocaleString() + suffix;
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const statObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    statEls.forEach(el => statObserver.observe(el));
  }

  console.log('Synovus initialized: Bootstrap 5 & SCSS ready.');
});
