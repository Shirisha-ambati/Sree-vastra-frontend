# Sree Vastram Frontend

Customer-facing web interface and admin dashboard for the Sree Vastram e-commerce platform.

## Structure

```
Frontend/
├── index.html              # Home page
├── cart.html               # Shopping cart
├── order.html              # Checkout & order form
├── product-details.html    # Product detail view
├── profile.html            # Customer profile
├── search-results.html     # Search results
├── login.html              # Customer login
├── register.html           # Customer registration
├── [category].html         # Category pages:
│   ├── cotton.html
│   ├── saree.html
│   ├── homedecor.html
│   ├── stitched-cotton-suits.html
│   └── customised jeans.html
├── admin/                  # Admin dashboard
│   ├── index.html          # Admin login
│   ├── dashboard.html      # Admin panel
│   ├── admin.js            # Dashboard logic
│   └── admin.css           # Dashboard styles
├── script.js               # Main JavaScript
├── api.js                  # API helper functions
├── style.css               # Main stylesheet
└── README.md               # This file
```

## Setup

### 1. Local Development

Serve files with a local web server on port 5500:

```bash
# If using Live Server in VS Code
Open index.html in Live Server
```

Or use Python:

```bash
python -m http.server 5500
```

### 2. API Configuration

Update API endpoint in these files if backend is on different port:

- `api.js` - Line 1: `const BACKEND = "http://127.0.0.1:3001/api"`
- `admin/admin.js` - Line 1: `const API = "http://127.0.0.1:3001/api"`

## Pages

### Customer Pages

#### `index.html` - Home

- Navigation bar with cart & login
- Product categories
- Search functionality
- Featured products

#### Category Pages (cotton.html, saree.html, etc.)

- Product listing by category
- Add to cart
- Filter by color/size
- Product images

#### `product-details.html`

- Full product information
- Color & size selection
- Quantity controls
- Add to cart button

#### `cart.html`

- View cart items
- Modify quantities
- Remove items
- Order summary
- Checkout button

#### `order.html`

- Pre-fill customer details (if logged in)
- Delivery address form
- Order summary
- WhatsApp integration for final confirmation

#### `login.html` & `register.html`

- Customer authentication
- JWT token storage
- Persist user session

#### `profile.html`

- View customer info
- Update address
- View order history
- Logout

### Admin Pages

#### `admin/index.html` - Admin Login

- Email & password login
- JWT token validation
- Redirect to dashboard on success

#### `admin/dashboard.html` - Admin Panel

- Overview with statistics
- All orders management
- Product catalog
- Stock tracking
- Order status updates

## LocalStorage Keys

### Customer Data

- `cart` - Shopping cart items (JSON array)
- `customerToken` - JWT authentication token
- `customerInfo` - Customer profile data (name, email, phone, address)
- `orderItem` - Current order being processed

### Admin Data

- `adminToken` - Admin JWT token

## JavaScript Files

### `script.js`

- Navigation menu toggle
- Search functionality
- Product card rendering
- Cart operations (add, remove, update qty)
- Customer authentication flow

### `api.js`

- Fetch wrapper functions
- API endpoint calls
- Error handling

### `admin/admin.js`

- Dashboard data loading
- Orders table rendering
- Product management
- Status updates
- Search & filtering

## Styling

### `style.css` - Main stylesheet

- Variables for brand colors (pink/magenta theme)
- Responsive design (mobile-first)
- Navigation styles
- Product cards
- Forms & buttons
- Footer

### `admin/admin.css` - Admin styles

- Dark theme dashboard
- Sidebar navigation
- Data tables
- Modals
- Charts (if added)

## Features

### Customer Features

✅ Browse products by category
✅ Search products
✅ Add to cart (localStorage)
✅ Checkout with shipping address
✅ Order via WhatsApp
✅ Create account & login
✅ View profile & orders
✅ Multi-color & size selection

### Admin Features

✅ View all orders
✅ Update order status
✅ Manage products (CRUD)
✅ Track inventory
✅ Dashboard statistics
✅ Search orders & products

## API Integration

### Customer Authentication

```javascript
// Login
POST /api/auth/login
{
  email: "user@example.com",
  password: "password123"
}
// Returns: { token, customer: {...} }
```

### Orders

```javascript
// Create order
POST /api/orders
{
  customer_name: "John Doe",
  customer_phone: "9876543210",
  customer_address: "123 Main St, City, 12345",
  items: [{name, color, size, price, quantity}],
  total_price: 2500
}
```

### Products

```javascript
// Get all products
GET /api/products

// Get by category
GET /api/products?category=sarees
```

## Known Limitations

- No inventory decrement on purchase (backend doesn't update stock)
- No payment processing (WhatsApp confirmation only)
- No email notifications
- Cart stored in localStorage (not synced to server)
- No order tracking after WhatsApp confirmation

## Future Improvements

- Move pages to organized folder structure
- Add email confirmations
- Implement online payment gateway
- Add product reviews & ratings
- Inventory management
- Order tracking with status updates
- Mobile app version
- Analytics dashboard

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Responsive Design

- Mobile: < 480px
- Tablet: 480px - 900px
- Desktop: > 900px
