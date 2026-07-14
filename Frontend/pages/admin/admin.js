/* ═══════════════════════════════════════════════
   Sree Vastram — Admin Dashboard JS
   ═══════════════════════════════════════════════ */

const API = API_BASE_URL;

// ── Auth guard ────────────────────────────────────────────────
const token = localStorage.getItem("adminToken");
if (!token) window.location.href = "index.html";

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// ── Toast notifications ───────────────────────────────────────
function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  const icons = { success: "✅", error: "❌", info: "ℹ️" };
  toast.innerHTML = `<span>${icons[type] || "ℹ️"}</span> ${message}`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// ── Section navigation ────────────────────────────────────────
function switchSection(name) {
  document
    .querySelectorAll(".section")
    .forEach((s) => s.classList.remove("active"));
  document
    .querySelectorAll(".nav-link")
    .forEach((a) => a.classList.remove("active"));

  document.getElementById(`section-${name}`)?.classList.add("active");
  document
    .querySelector(`.nav-link[data-section="${name}"]`)
    ?.classList.add("active");

  const titles = {
    overview: "📊 Overview",
    orders: "📦 Orders",
    products: "👗 Products",
  };
  document.getElementById("pageTitle").textContent = titles[name] || name;

  if (name === "overview") loadOverview();
  if (name === "orders") loadOrders();
  if (name === "products") loadProducts();
}

document.querySelectorAll(".nav-link[data-section]").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    switchSection(link.dataset.section);
  });
});

// ── Logout ────────────────────────────────────────────────────
document.getElementById("logoutBtn").addEventListener("click", () => {
  if (confirm("Log out?")) {
    localStorage.removeItem("adminToken");
    window.location.href = "index.html";
  }
});

// ══════════════════════════════════════════════════════════════
//  OVERVIEW
// ══════════════════════════════════════════════════════════════
async function loadOverview() {
  await Promise.all([loadStats(), loadRecentOrders()]);
}

async function loadStats() {
  const grid = document.getElementById("statsGrid");
  grid.innerHTML = `<div class="loader-wrap"><div class="spinner"></div> Loading…</div>`;
  try {
    const res = await fetch(`${API}/stats`, { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    grid.innerHTML = `
      <div class="stat-card pink">
        <div class="stat-icon">📦</div>
        <div class="stat-value">${data.totalOrders}</div>
        <div class="stat-label">Total Orders</div>
      </div>
      <div class="stat-card green">
        <div class="stat-icon">💰</div>
        <div class="stat-value">₹${Number(data.totalRevenue).toLocaleString("en-IN")}</div>
        <div class="stat-label">Total Revenue</div>
      </div>
      <div class="stat-card orange">
        <div class="stat-icon">⏳</div>
        <div class="stat-value">${data.pendingOrders}</div>
        <div class="stat-label">Pending Orders</div>
      </div>
      <div class="stat-card blue">
        <div class="stat-icon">👗</div>
        <div class="stat-value">${data.totalProducts}</div>
        <div class="stat-label">Total Products</div>
      </div>
      <div class="stat-card purple">
        <div class="stat-icon">⚠️</div>
        <div class="stat-value">${data.lowStockItems}</div>
        <div class="stat-label">Low Stock Items</div>
      </div>
    `;
  } catch (err) {
    grid.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div>Failed to load stats.<br><small>${err.message}</small></div>`;
  }
}

async function loadRecentOrders() {
  const wrap = document.getElementById("recentOrdersWrap");
  wrap.innerHTML = `<div class="loader-wrap"><div class="spinner"></div> Loading…</div>`;
  try {
    const res = await fetch(`${API}/orders`, { headers: authHeaders() });
    const orders = await res.json();
    if (!res.ok) throw new Error(orders.error);
    renderOrdersTable(orders.slice(0, 5), wrap);
  } catch (err) {
    wrap.innerHTML = `<div class="empty-state">❌ ${err.message}</div>`;
  }
}

// ══════════════════════════════════════════════════════════════
//  ORDERS
// ══════════════════════════════════════════════════════════════
let allOrders = [];

async function loadOrders() {
  const wrap = document.getElementById("ordersTableWrap");
  wrap.innerHTML = `<div class="loader-wrap"><div class="spinner"></div> Loading orders…</div>`;
  try {
    const res = await fetch(`${API}/orders`, { headers: authHeaders() });
    allOrders = await res.json();
    if (!res.ok) throw new Error(allOrders.error);
    renderOrdersTable(allOrders, wrap, true);
  } catch (err) {
    wrap.innerHTML = `<div class="empty-state">❌ ${err.message}</div>`;
  }
}

function renderOrdersTable(orders, container, withActions = false) {
  if (!orders.length) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">📦</div>No orders yet.</div>`;
    return;
  }

  const rows = orders
    .map((o) => {
      const date = new Date(o.created_at).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      // Items with color and size
      const itemsPreview = Array.isArray(o.items)
        ? o.items
            .map(
              (i) =>
                `${i.name} (${i.color || "-"}, ${i.size || "-"}) x${i.quantity || 1}`,
            )
            .join(", ")
        : typeof o.items === "object"
          ? JSON.stringify(o.items)
          : o.items;

      const statusOptions = [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ]
        .map(
          (s) =>
            `<option value="${s}" ${o.status === s ? "selected" : ""}>${capitalize(s)}</option>`,
        )
        .join("");

      return `
      <tr>
        <td><strong>#${o.id}</strong></td>
        <td>${o.customer_name}</td>
        <td>${o.customer_phone}</td>
        <td class="order-items-preview" title="${escHtml(itemsPreview)}">${escHtml(itemsPreview)}</td>
        <td class="order-address-preview" title="${escHtml(o.customer_address)}">${escHtml(o.customer_address)}</td>
        <td><strong>₹${Number(o.total_price).toLocaleString("en-IN")}</strong></td>
        <td>${
          withActions
            ? `<select class="status-select" onchange="updateOrderStatus(${o.id}, this.value)">${statusOptions}</select>`
            : `<span class="badge badge-${o.status}">${capitalize(o.status)}</span>`
        }</td>
        <td>${date}</td>
        ${withActions ? `<td><button class="btn btn-sm btn-delete" onclick="deleteOrder(${o.id})">🗑</button></td>` : ""}
      </tr>
    `;
    })
    .join("");

  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Order #</th>
          <th>Customer</th>
          <th>Phone</th>
          <th>Items (Color, Size)</th>
          <th>Address</th>
          <th>Total</th>
          <th>Status</th>
          <th>Date</th>
          ${withActions ? "<th>Action</th>" : ""}
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

async function updateOrderStatus(orderId, status) {
  try {
    const res = await fetch(`${API}/orders/${orderId}/status`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    showToast(`Order #${orderId} updated to "${status}"`, "success");
  } catch (err) {
    showToast(`Error: ${err.message}`, "error");
  }
}

async function deleteOrder(orderId) {
  if (!confirm(`Delete order #${orderId}? This cannot be undone.`)) return;
  try {
    const res = await fetch(`${API}/orders/${orderId}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    showToast("Order deleted", "success");
    loadOrders();
  } catch (err) {
    showToast(`Error: ${err.message}`, "error");
  }
}

// Orders search
document.getElementById("orderSearch").addEventListener("input", (e) => {
  const q = e.target.value.toLowerCase();
  const filtered = allOrders.filter(
    (o) =>
      o.customer_name.toLowerCase().includes(q) ||
      o.customer_phone.toLowerCase().includes(q),
  );
  renderOrdersTable(filtered, document.getElementById("ordersTableWrap"), true);
});

// ══════════════════════════════════════════════════════════════
//  PRODUCTS
// ══════════════════════════════════════════════════════════════
let allProducts = [];

async function loadProducts() {
  const wrap = document.getElementById("productsTableWrap");
  wrap.innerHTML = `<div class="loader-wrap"><div class="spinner"></div> Loading products…</div>`;
  try {
    const res = await fetch(`${API}/products`);
    allProducts = await res.json();
    renderProductsTable(allProducts, wrap);
  } catch (err) {
    wrap.innerHTML = `<div class="empty-state">❌ ${err.message}</div>`;
  }
}

function renderProductsTable(products, container) {
  if (!products.length) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">👗</div>No products yet. Add one!</div>`;
    return;
  }

  const catLabels = {
    cotton: "Cotton Suits",
    stitched: "Stitched Suits",
    sarees: "Sarees",
    homedecor: "Home Decor",
    customised: "Customised Jeans",
  };

  const rows = products
    .map(
      (p) => `
    <tr>
      <td><strong>#${p.id}</strong></td>
      <td>
        <div style="display:flex;align-items:center;gap:10px;">
          ${p.image_url ? `<img class="product-thumb" src="${p.image_url}" alt="${escHtml(p.name)}" onerror="this.style.display='none'" />` : ""}
          <span>${escHtml(p.name)}</span>
        </div>
      </td>
      <td>${catLabels[p.category] || p.category}</td>
      <td><strong>₹${Number(p.price).toLocaleString("en-IN")}</strong></td>
      <td class="${p.stock < 10 ? "stock-low" : "stock-ok"}">
        ${p.stock < 10 ? "⚠️ " : ""}${p.stock}
      </td>
      <td>${(p.sizes || []).join(", ") || "—"}</td>
      <td>
        <div style="display:flex;gap:6px;">
          <button class="btn btn-sm btn-edit" onclick="openEditProduct(${p.id})">✏️ Edit</button>
          <button class="btn btn-sm btn-delete" onclick="deleteProduct(${p.id})">🗑 Del</button>
        </div>
      </td>
    </tr>
  `,
    )
    .join("");

  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Product</th>
          <th>Category</th>
          <th>Price</th>
          <th>Stock</th>
          <th>Sizes</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

// Products search
document.getElementById("productSearch").addEventListener("input", (e) => {
  const q = e.target.value.toLowerCase();
  const filtered = allProducts.filter(
    (p) =>
      String(p.name || "")
        .toLowerCase()
        .includes(q) ||
      String(p.category || "")
        .toLowerCase()
        .includes(q),
  );
  renderProductsTable(filtered, document.getElementById("productsTableWrap"));
});

// ── Product Modal ─────────────────────────────────────────────
const modal = document.getElementById("productModal");

function openModal(title = "Add Product") {
  document.getElementById("modalTitle").textContent = title;
  modal.classList.add("open");
}
function closeModal() {
  modal.classList.remove("open");
  document.getElementById("productForm").reset();
  document.getElementById("productId").value = "";
}

document.getElementById("addProductBtn").addEventListener("click", () => {
  closeModal();
  openModal("➕ Add Product");
});
document.getElementById("closeModal").addEventListener("click", closeModal);
document.getElementById("cancelModal").addEventListener("click", closeModal);
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

function openEditProduct(id) {
  const p = allProducts.find((x) => x.id === id);
  if (!p) return;

  document.getElementById("productId").value = p.id;
  document.getElementById("pName").value = p.name || "";
  document.getElementById("pCategory").value = p.category || "";
  document.getElementById("pPrice").value = p.price || "";
  document.getElementById("pStock").value = p.stock || 0;
  document.getElementById("pImage").value = p.image_url || "";
  document.getElementById("pColors").value = Array.isArray(p.colors)
    ? p.colors.join(", ")
    : String(p.colors || "");
  document.getElementById("pSizes").value = Array.isArray(p.sizes)
    ? p.sizes.join(", ")
    : String(p.sizes || "");
  document.getElementById("pDesc").value = p.description || "";

  openModal(`✏️ Edit: ${p.name}`);
}

document.getElementById("productForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("productId").value;
  const btn = document.getElementById("saveProductBtn");

  const payload = {
    name: document.getElementById("pName").value.trim(),
    category: document.getElementById("pCategory").value,
    price: parseFloat(document.getElementById("pPrice").value),
    stock: parseInt(document.getElementById("pStock").value),
    image_url: document.getElementById("pImage").value.trim(),
    colors: document
      .getElementById("pColors")
      .value.split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    sizes: document
      .getElementById("pSizes")
      .value.split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    description: document.getElementById("pDesc").value.trim(),
  };

  btn.textContent = "Saving…";
  btn.disabled = true;

  try {
    const url = id ? `${API}/products/${id}` : `${API}/products`;
    const method = id ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    showToast(id ? "✅ Product updated!" : "✅ Product added!", "success");
    closeModal();
    loadProducts();
  } catch (err) {
    showToast(`Error: ${err.message}`, "error");
  } finally {
    btn.textContent = "Save Product";
    btn.disabled = false;
  }
});

async function deleteProduct(id) {
  const p = allProducts.find((x) => x.id === id);
  if (!confirm(`Delete "${p?.name}"? This cannot be undone.`)) return;
  try {
    const res = await fetch(`${API}/products/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    showToast("Product deleted", "success");
    loadProducts();
  } catch (err) {
    showToast(`Error: ${err.message}`, "error");
  }
}

// ── Helpers ───────────────────────────────────────────────────
function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
}
function escHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── Init ──────────────────────────────────────────────────────
loadOverview();
