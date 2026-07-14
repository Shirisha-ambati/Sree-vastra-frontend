# Frontend Security Guide

Security best practices for the Sree Vastram customer and admin interfaces.

## 🔒 Frontend Security Features

### 1. **Input Sanitization**

- `escapeHtml()` function prevents XSS attacks
- All user-generated content is escaped before displaying
- Used for product names, customer names, addresses, etc.

### 2. **Local Storage Security**

- Only store JWT tokens in localStorage
- Never store passwords or sensitive data
- Clear tokens on logout
- Use `localStorage.clear()` to remove all data

### 3. **Authentication**

- JWT tokens stored with unique keys:
  - `customerToken` - Customer authentication
  - `adminToken` - Admin authentication
  - `customerInfo` - Non-sensitive customer data
- Tokens validated on every protected page load
- Auto-redirect to login if token invalid

### 4. **Authorization Checks**

- Admin pages check for `adminToken` presence
- Customer pages check for `customerToken` if protected
- Redirect to login if unauthorized

### 5. **HTTPS Enforcement** (Production)

- Configure server to serve only HTTPS
- Browsers block mixed content

### 6. **Content Security Policy** (Recommended)

Add to HTML `<head>`:

```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';"
/>
```

---

## 🛡️ Security Checklist - Frontend

### Before Deployment

- [ ] Remove all `console.log()` statements with sensitive data
- [ ] Enable HTTPS on web server
- [ ] Add Content-Security-Policy headers
- [ ] Minify and bundle JavaScript
- [ ] Set secure CORS headers
- [ ] Configure proper cache headers
- [ ] Add security.txt file
- [ ] Set X-Frame-Options header
- [ ] Set X-Content-Type-Options header
- [ ] Implement HSTS (HTTP Strict Transport Security)

---

## 🚨 Common Vulnerabilities & Prevention

### 1. **XSS (Cross-Site Scripting)**

**Problem**: Attacker injects malicious script

```javascript
// ❌ VULNERABLE
document.getElementById("name").innerHTML = userInput;

// ✅ SAFE
function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
document.getElementById("name").textContent = escapeHtml(userInput);
```

**Current Status**: ✅ Using `escapeHtml()` in all necessary places

### 2. **CSRF (Cross-Site Request Forgery)**

**Problem**: Attacker tricks user into making unwanted requests

**Prevention**:

- ✅ Using JWT tokens instead of cookies
- ✅ Tokens sent in Authorization header (not in cookies)
- ✅ Backend validates CORS origin

### 3. **Sensitive Data in LocalStorage**

**Problem**: localStorage can be accessed by any JavaScript

```javascript
// ❌ DON'T STORE
localStorage.setItem("password", password);
localStorage.setItem("creditCard", cardNumber);

// ✅ SAFE TO STORE
localStorage.setItem("token", jwtToken);
localStorage.setItem("userName", "John Doe"); // Non-sensitive
```

**Current Implementation**: ✅ Only storing tokens and user info

### 4. **API Key Exposure**

**Problem**: API keys hardcoded in frontend

```javascript
// ❌ VULNERABLE
const API = "http://localhost:3001/api";
// If this includes API keys, it's exposed

// ✅ SAFE
const API = "http://localhost:3001/api";
// Use JWT tokens for authentication instead
```

### 5. **Session Hijacking**

**Prevention**:

- ✅ Use HTTPS to prevent token interception
- ✅ Token expiration (30 days for customer)
- ✅ Clear tokens on logout
- ✅ Validate token on sensitive operations

---

## 🔐 Secure Coding Practices

### LocalStorage Management

```javascript
// Save token securely
function saveToken(token) {
  localStorage.setItem("customerToken", token);
}

// Retrieve token
function getToken() {
  return localStorage.getItem("customerToken");
}

// Clear on logout
function logout() {
  localStorage.removeItem("customerToken");
  localStorage.removeItem("customerInfo");
  localStorage.removeItem("cart");
  window.location.href = "index.html";
}
```

### API Calls with Authentication

```javascript
// Always include token in Authorization header
async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem("customerToken");
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API}${endpoint}`, {
    ...options,
    headers,
  });

  return response.json();
}
```

### Data Validation

```javascript
// Validate email format
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Validate phone (basic)
function isValidPhone(phone) {
  return /^[0-9]{10}$/.test(phone.replace(/\D/g, ""));
}

// Validate URL
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}
```

---

## 🔑 Token Management

### Token Lifecycle

```javascript
// 1. LOGIN - Get token
const response = await fetch(`${API}/customers/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});
const { token } = await response.json();
localStorage.setItem("customerToken", token);

// 2. USE TOKEN - In all authenticated requests
const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

// 3. VALIDATE TOKEN - On page load
const token = localStorage.getItem("customerToken");
if (!token) {
  // Redirect to login
}

// 4. LOGOUT - Clear token
localStorage.removeItem("customerToken");
```

### Handling Expired Tokens

```javascript
async function apiCallWithRefresh(endpoint, options = {}) {
  let response = await apiCall(endpoint, options);

  // If token expired (401)
  if (response.status === 401) {
    localStorage.removeItem("customerToken");
    window.location.href = "login.html";
    return null;
  }

  return response;
}
```

---

## 🌐 Server Security Headers

### Recommended Headers (Configure on Server)

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'; script-src 'self'
Referrer-Policy: no-referrer
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

### Nginx Configuration Example

```nginx
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header Content-Security-Policy "default-src 'self';" always;
```

---

## 🧪 Testing Security

### Test Cases

```javascript
// 1. XSS Prevention
const xssPayload = "<img src=x onerror='alert(1)'>";
escapeHtml(xssPayload);
// Should return: &lt;img src=x onerror=&#039;alert(1)&#039;&gt;

// 2. Token Validation
const invalidToken = "invalid.token.here";
localStorage.setItem("customerToken", invalidToken);
// Should fail on API call and redirect to login

// 3. CORS Violation
fetch("http://evil.com/api/data");
// Should be blocked by browser CORS policy

// 4. LocalStorage XSS
localStorage.setItem("malicious", "<script>alert('xss')</script>");
// Should be escaped when retrieved

// 5. Redirect After Login
// Login successful → Should redirect to dashboard
// Login failed → Should show error message
```

---

## 📋 Browser Security Features

### Enable in Users' Browsers

- ✅ JavaScript enabled (required for app)
- ✅ Cookies accepted (for session management)
- ✅ Third-party cookies blocked (recommended)
- ✅ HTTPS enforcement
- ✅ Mixed content warning enabled

### Browser Extensions (Recommended)

- uBlock Origin (ad blocker)
- Privacy Badger (tracker blocker)
- HTTPS Everywhere (automatic HTTPS)
- NoScript (JavaScript control)

---

## 🚀 Production Deployment

### Before Going Live

```bash
# 1. Minify JavaScript
npm run build  # If using build tools

# 2. Remove console statements
grep -r "console\." . --include="*.js"

# 3. Enable HTTPS
# Configure SSL/TLS certificate

# 4. Add security headers
# Configure web server (Nginx/Apache)

# 5. Update API endpoint
# Change from localhost:3001 to production domain

# 6. Content Security Policy
# Add to server or HTML meta tags

# 7. Test security headers
# Use: https://securityheaders.com
```

### HTTPS Configuration

```html
<!-- Force HTTPS -->
<meta
  http-equiv="Content-Security-Policy"
  content="upgrade-insecure-requests"
/>
```

---

## 🛡️ User Security Tips

### For Customers

1. **Use Strong Password**
   - At least 8 characters
   - Mix of uppercase, lowercase, numbers
   - Don't reuse passwords

2. **Protect Your Account**
   - Logout when done
   - Don't share your password
   - Verify SSL certificate (green lock)
   - Check URL is correct domain

3. **Public Computer**
   - Always logout
   - Clear browser cache
   - Use incognito mode if possible

4. **Suspicious Activity**
   - Report unauthorized orders
   - Change password immediately
   - Contact support

### For Admins

1. **Strong Admin Password**
   - Use password manager
   - Change regularly (monthly)
   - Never share credentials
   - Use unique password

2. **Protect Admin Access**
   - Use VPN when accessing from public WiFi
   - Use 2FA if available
   - Monitor for unauthorized access
   - Log all admin actions

3. **Device Security**
   - Keep OS updated
   - Use antivirus software
   - Don't use shared computers
   - Lock screen when away

---

## 📚 Additional Resources

### Tools

- **OWASP ZAP**: Automated security scanner
- **Burp Suite**: Web security testing
- **Security.txt**: Security vulnerability reporting
- **Have I Been Pwned**: Check if email is compromised

### Learning

- **OWASP Top 10**: https://owasp.org/www-project-top-ten/
- **MDN Web Security**: https://developer.mozilla.org/en-US/docs/Web/Security
- **Web.dev Security**: https://web.dev/security/

---

## 🆘 Report Security Issues

**Do NOT** post security vulnerabilities publicly!

1. Email: security@sreevastrm.com
2. Describe the vulnerability
3. Provide proof of concept (if possible)
4. Allow time for fix before disclosure
5. We'll credit responsible disclosure

---

**Last Updated**: July 13, 2026
**Version**: 1.0
