# Valley SMM Panel – Complete Setup Guide

Kenya's #1 Social Media Marketing Panel with M-Pesa integration.

---

## 📁 Project Structure

```
valleysmm/
├── server.js              ← Main entry point
├── seed.js                ← Seeds 35+ services into DB
├── package.json
├── .env                   ← Your config (copy from .env.example)
├── backend/
│   ├── models/            ← MongoDB schemas
│   │   ├── User.js
│   │   ├── Service.js
│   │   ├── Order.js
│   │   └── Transaction.js
│   ├── routes/            ← API endpoints
│   │   ├── auth.js        ← Register, login, profile
│   │   ├── services.js    ← SMM services CRUD
│   │   ├── orders.js      ← Place & track orders
│   │   ├── mpesa.js       ← M-Pesa STK Push + callback
│   │   ├── wallet.js      ← Transactions & balance
│   │   └── admin.js       ← Admin dashboard stats
│   └── middleware/
│       └── auth.js        ← JWT authentication
└── public/
    ├── index.html         ← Landing page
    ├── login.html         ← Login
    ├── register.html      ← Registration
    ├── forgot.html        ← Forgot password
    ├── dashboard.html     ← User dashboard
    ├── services.html      ← Browse & order services
    ├── orders.html        ← Order history
    ├── wallet.html        ← Wallet & M-Pesa top-up
    ├── profile.html       ← Account settings
    ├── api-docs.html      ← API documentation
    ├── admin.html         ← Admin overview
    ├── admin-users.html   ← User management
    ├── admin-orders.html  ← Order management
    ├── admin-services.html← Service management
    ├── styles.css         ← Global styles
    └── shared.js          ← Shared JS utilities
```

---

## 🚀 Quick Start (Local)

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env
# Then edit .env with your values
```

### 3. Start MongoDB
```bash
# Option A: Local MongoDB
mongod

# Option B: Use MongoDB Atlas (free cloud) - recommended
# Sign up at mongodb.com/atlas, get connection string
```

### 4. Seed the database with services
```bash
node seed.js
```

### 5. Start the server
```bash
npm start
# or for development with auto-restart:
npm run dev
```

### 6. Open your browser
```
http://localhost:3000
```

**Default admin login:**
- Email: `admin@valleysmm.co.ke`
- Password: `Admin@1234`
- ⚠️ Change this immediately after first login!

---

## ☁️ Deployment (Recommended: Railway or Render)

### Deploy on Railway (Free tier available)
1. Push your code to GitHub
2. Go to railway.app → New Project → Deploy from GitHub
3. Add environment variables in Railway dashboard
4. Railway auto-detects Node.js and deploys

### Deploy on Render (Free tier)
1. Push to GitHub
2. Go to render.com → New Web Service
3. Connect your repo
4. Build command: `npm install`
5. Start command: `node server.js`
6. Add environment variables

### Deploy on VPS (DigitalOcean/Hostinger)
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 (keeps app running)
sudo npm install -g pm2

# Clone your repo
git clone https://github.com/yourusername/valleysmm.git
cd valleysmm
npm install

# Create .env file
nano .env

# Seed services
node seed.js

# Start with PM2
pm2 start server.js --name valleysmm
pm2 save
pm2 startup
```

---

## 🔑 Environment Variables

```env
# Required
PORT=3000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/valleysmm
JWT_SECRET=a_very_long_random_string_minimum_32_chars

# M-Pesa Daraja API (Safaricom)
# Get these from: https://developer.safaricom.co.ke
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_SHORTCODE=174379          ← Your paybill/till number
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=https://yourdomain.co.ke/api/mpesa/callback

# Upstream SMM API (optional - for real order fulfillment)
# Sign up at: justanotherpanel.com, smmheaven.com, etc.
SMM_API_URL=https://justanotherpanel.com/api/v2
SMM_API_KEY=your_api_key

# Email (Gmail - enable 2FA then create App Password)
EMAIL_USER=yourpanel@gmail.com
EMAIL_PASS=your_16_char_app_password

# Admin
ADMIN_EMAIL=admin@yourdomain.co.ke
```

---

## 📱 M-Pesa Integration Setup

1. Go to **https://developer.safaricom.co.ke**
2. Create an account and a new app
3. Get your **Consumer Key** and **Consumer Secret**
4. Apply for **Lipa Na M-Pesa Online** (production)
5. You'll receive a **Shortcode** and **Passkey**
6. Set your callback URL to: `https://yourdomain.co.ke/api/mpesa/callback`
7. Update your `.env` with these values

For testing, use Safaricom's **sandbox** environment first.

---

## 🔌 Upstream SMM API

To actually fulfill orders, connect to a wholesale SMM API provider:

| Provider | URL | Notes |
|---|---|---|
| JustAnotherPanel | justanotherpanel.com | Popular, affordable |
| SMMHeaven | smmheaven.com | Good quality |
| Peakerr | peakerr.com | Wide catalog |
| SMMFollows | smmfollows.com | Kenya-friendly |

1. Sign up at your chosen provider
2. Get your API key
3. Set `SMM_API_URL` and `SMM_API_KEY` in `.env`
4. When adding services in Admin → set the **Upstream API ID** to match their service ID

---

## 👤 Admin Panel

Access at: `yourdomain.co.ke/admin.html`

**Features:**
- Dashboard stats (revenue, users, orders)
- Manage users (credit/debit balance, suspend)
- Manage all orders (update status)
- Add/edit/toggle services
- Manual wallet adjustments

---

## 🛠️ Customization

### Change branding
- Edit `public/index.html` — update name, tagline, stats
- Replace "Valley SMM" with your brand name across all HTML files
- Update colors in `public/styles.css` (`:root` variables)

### Add new services
- Go to Admin → Services → Add Service
- Or edit `seed.js` and re-run `node seed.js`

### Change M-Pesa Paybill
- Update `MPESA_SHORTCODE` in `.env`
- Update the paybill number shown in `public/wallet.html`

### Custom domain
- Point your domain DNS to your server IP
- Install Nginx as reverse proxy:
```nginx
server {
    server_name yourdomain.co.ke;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}
```
- Install SSL: `sudo certbot --nginx -d yourdomain.co.ke`

---

## 📞 Support Pages to Add Later

- `/terms.html` — Terms of Service
- `/privacy.html` — Privacy Policy
- `/refund.html` — Refund Policy
- `/contact.html` — Contact form

---

## 💰 Monetization Tips

1. **Mark up prices** — Buy wholesale from upstream provider at e.g. KES 30/1K, sell at KES 60/1K
2. **Reseller plans** — Charge monthly fees for API access
3. **Referral program** — Give 5% commission on referred users
4. **Bundles** — Package deals (e.g. "Starter Pack: 1K followers + 500 likes")

---

Built with ❤️ for Kenya's digital economy 🇰🇪
