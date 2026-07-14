// ── Hero Background Slider ─────────────────────────────────────────────────
const heroOverlay = document.querySelector(".hero-overlay");

if (heroOverlay) {
  const images = [
    "https://image2url.com/images/1763529966715-c6552562-b2d2-416c-8ece-b3713d607702.jpg",
    "https://image2url.com/images/1763530024454-66b51a0e-c181-4f72-984d-c1df4ce286b5.avif",
    "https://image2url.com/images/1763530077475-e86f267c-897e-47d8-ad9c-0103eb82d80e.avif",
  ];
  let current = 0;
  function changeBackground() {
    heroOverlay.style.backgroundImage = `url(${images[current]})`;
    current = (current + 1) % images.length;
  }
  changeBackground();
  setInterval(changeBackground, 3000);
}

// ── Hamburger toggle ───────────────────────────────────────────────────────
const hamburger = document.querySelector(".hamburger");
const navLinks = document.querySelector(".nav-links");
if (hamburger && navLinks) {
  hamburger.addEventListener("click", () => {
    navLinks.classList.toggle("active");
    hamburger.classList.toggle("toggle");
  });
}

// ── Scroll effect for navbar ───────────────────────────────────────────────
const navbar = document.querySelector(".navbar");
if (navbar) {
  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 50);
  });
}

// ── Navbar Auth State ──────────────────────────────────────────────────────
// Priority: admin token > customer token > logged out
(function updateNavAuth() {
  const adminToken = localStorage.getItem("adminToken");
  const customerToken = localStorage.getItem("customerToken");
  const customerInfo = JSON.parse(
    localStorage.getItem("customerInfo") || "null",
  );

  // Determine prefix for paths (admin folder is one level deeper)
  const isInAdmin = window.location.pathname.includes("/admin/");
  const prefix = isInAdmin ? "../" : "";

  // Desktop button
  const loginBtn = document.querySelector(".nav-icons .login.btn");
  if (loginBtn) {
    if (adminToken) {
      loginBtn.textContent = "📊 Dashboard";
      loginBtn.onclick = () => {
        location.href = prefix + "admin/dashboard.html";
      };
    } else if (customerToken) {
      const name = customerInfo?.name?.split(" ")[0] || "Profile";
      loginBtn.textContent = `👤 ${name}`;
      loginBtn.onclick = () => {
        location.href = prefix + "profile.html";
      };
    } else {
      loginBtn.textContent = "Login";
      loginBtn.onclick = () => {
        location.href = prefix + "login.html";
      };
    }
  }

  // Mobile nav link
  document.querySelectorAll(".nav-links .mobile-only a").forEach((link) => {
    const txt = link.textContent.trim();
    if (txt === "Login" || txt === "👤 Profile" || txt === "📊 Dashboard") {
      if (adminToken) {
        link.textContent = "📊 Dashboard";
        link.href = prefix + "admin/dashboard.html";
      } else if (customerToken) {
        link.textContent = "👤 Profile";
        link.href = prefix + "profile.html";
      } else {
        link.textContent = "Login";
        link.href = prefix + "login.html";
      }
    }
  });
})();

// ── Search functionality ───────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const searchIcon = document.querySelector(".search-bar .search-icon");

  function triggerSearch() {
    if (!searchInput) return;
    const query = searchInput.value.trim();
    if (query) {
      const isInAdmin = window.location.pathname.includes("/admin/");
      const prefix = isInAdmin ? "../" : "";
      window.location.href = `${prefix}search-results.html?q=${encodeURIComponent(query)}`;
    }
  }

  if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        triggerSearch();
      }
    });
  }

  if (searchIcon) {
    searchIcon.addEventListener("click", () => {
      triggerSearch();
    });
  }
});
