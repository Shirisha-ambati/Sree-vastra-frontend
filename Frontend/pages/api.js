/**
 * api.js — Shared API utilities for Sree Vastram frontend
 */
const API_BASE_URL = "http://localhost:3001/api";
// Backwards-compatible alias for the existing catalogue helpers.
const API_BASE = API_BASE_URL;

async function apiFetch(path, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      credentials: "include",
      ...options,
    });
    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await response.json()
      : null;
    if (!response.ok) {
      const error = new Error(data?.error || `Server returned an error (${response.status}).`);
      error.status = response.status;
      error.data = data;
      throw error;
    }
    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("Backend unavailable or a network error occurred.");
    }
    throw error;
  }
}

/**
 * Fetch products by category and render them into a container element.
 * @param {string} category - e.g. 'cotton', 'sarees', 'stitched', 'homedecor', 'customised'
 * @param {string} containerId - ID of the DOM element to render cards into
 * @param {string} cardClass - CSS class for each card (e.g. 'clothes-card', 'sarees-card')
 */
async function loadProductsByCategory(category, containerId, cardClass) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div style="text-align:center;padding:3rem;color:#ccc;width:100%;">
      <div style="font-size:2rem;margin-bottom:0.5rem;">⏳</div>
      Loading products…
    </div>`;

  try {
    const data = await apiFetch(`/products?category=${encodeURIComponent(category)}`);

    if (!data.length) {
      container.innerHTML = `
        <div style="text-align:center;padding:3rem;color:#aaa;width:100%;">
          <div style="font-size:2.5rem;margin-bottom:0.75rem;">🧵</div>
          No products in this category yet. Check back soon!
        </div>`;
      return;
    }

    container.innerHTML = data
      .map((p) => {
        // Use first image from JSONB images object, fall back to image_url
        const imgUrl =
          p.images && Object.keys(p.images).length
            ? Object.values(p.images)[0]
            : p.image_url || "";

        return `
        <div class="${cardClass}">
          <a href="product-details.html?id=${p.id}">
            <img src="${imgUrl}" alt="${escHtml(p.name)}" loading="lazy"
                 onerror="this.style.display='none'" />
          </a>
          <h3>${escHtml(p.name)}</h3>
          <p style="text-align:center;color:#e60073;font-weight:600;margin:0 0 10px;">
            ₹${Number(p.price).toLocaleString("en-IN")}
          </p>
          <div style="text-align:center;margin-bottom:10px;">
            <a href="product-details.html?id=${p.id}" class="btn explore-btn" style="font-size:0.82rem;padding:6px 14px;">
              View Details
            </a>
          </div>
        </div>`;
      })
      .join("");
  } catch (err) {
    container.innerHTML = `
      <div style="text-align:center;padding:3rem;color:#e60073;width:100%;">
        ❌ Could not load products. Make sure the backend server is running.<br>
        <small style="color:#aaa">${err.message}</small>
      </div>`;
  }
}

function escHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Search products and render them.
 * @param {string} query - The search query
 * @param {string} containerId - ID of the container element
 */
async function searchProducts(query, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div style="text-align:center;padding:3rem;color:#ccc;width:100%;">
      <div style="font-size:2rem;margin-bottom:0.5rem;">⏳</div>
      Searching products…
    </div>`;

  try {
    const data = await apiFetch(`/products?search=${encodeURIComponent(query)}`);

    if (!data.length) {
      container.innerHTML = `
        <div style="text-align:center;padding:3rem;color:#aaa;width:100%;">
          <div style="font-size:2.5rem;margin-bottom:0.75rem;">🔍</div>
          No products match your search "${escHtml(query)}".
        </div>`;
      return;
    }

    container.innerHTML = data
      .map((p) => {
        const imgUrl =
          p.images && Object.keys(p.images).length
            ? Object.values(p.images)[0]
            : p.image_url || "";

        return `
        <div class="clothes-card">
          <a href="product-details.html?id=${p.id}">
            <img src="${imgUrl}" alt="${escHtml(p.name)}" loading="lazy"
                 onerror="this.style.display='none'" />
          </a>
          <h3>${escHtml(p.name)}</h3>
          <p style="text-align:center;color:#e60073;font-weight:600;margin:0 0 10px;">
            ₹${Number(p.price).toLocaleString("en-IN")}
          </p>
          <div style="text-align:center;margin-bottom:10px;">
            <a href="product-details.html?id=${p.id}" class="btn explore-btn" style="font-size:0.82rem;padding:6px 14px;">
              View Details
            </a>
          </div>
        </div>`;
      })
      .join("");
  } catch (err) {
    container.innerHTML = `
      <div style="text-align:center;padding:3rem;color:#e60073;width:100%;">
        ❌ Search failed. Make sure the backend server is running.<br>
        <small style="color:#aaa">${err.message}</small>
      </div>`;
  }
}
