# Amazon Clone – CS50 Final Project

**Video Demo:**

Watch the project demo here:  
https://youtu.be/R6u7LjF5w9s?si=U8QbzIStpj-zZkDT

## Overview

This is a full‑stack web application that replicates core features of an e‑commerce platform like Amazon. Users can sign up, log in, browse products, add items to their cart, modify delivery options, place orders, view order history, track packages, and cancel orders. The project was developed over 3–4 months while learning JavaScript, Flask, and database design.

## Features

- **User Authentication** – Signup, login, logout, session management (Flask sessions).
- **Product Catalog** – Displays products with images, ratings, prices, and quantity selector.
- **Search** – Filter products by name or keywords.
- **Shopping Cart** – Add/update/delete items, choose delivery options (standard, expedited, next‑day).
- **Checkout** – Review order, calculate shipping, estimated tax, and place order.
- **Order History** – View all placed orders, buy‑again functionality.
- **Order Tracking** – Visual progress bar (Preparing → Shipped → Delivered) based on delivery date.
- **Cancel Order** – Modal with reason selection (front‑end only for now; backend ready to extend).
- **Persistent Data** – All users, carts, and orders stored in SQLite database.
- **Responsive Design** – Works on desktop, tablet, and mobile.
- **Jelly Glass Theme** – Glassmorphism UI with orange gradients, blur effects, and smooth animations.

## Technologies Used

- **Frontend**: HTML5, CSS3 (Glassmorphism, Flexbox, Grid), JavaScript (ES6 modules)
- **Backend**: Python 3, Flask, Flask‑CORS
- **Database**: SQLite3
- **Authentication**: Server‑side sessions, SHA‑256 password hashing
- **External Libraries**: day.js (date handling), Fonts (Google Roboto)

## File Structure

```
project/
├── app.py                  # Flask backend, API endpoints, database init
├── amazon.db               # SQLite database (auto‑created)
├── requirements.txt        # Python dependencies
├── index.html              # Home page (product listing)
├── login.html              # Login / Signup page
├── checkout.html           # Shopping cart and checkout
├── orders.html             # Order history
├── tracking.html           # Order tracking
├── styles/                 # All my style files
│   ├── shared/
│   │   ├── general.css
│   │   └── amazon-header.css
│   └── pages/
│       ├── amazon.css
│       ├── orders.css
│       |── tracking.css
|         └── checkout/
|         ├── checkout.css
|         └── checkout-header.css
├── scripts/
│   ├── api.js              # Fetch wrapper for backend calls
│   ├── amazon.js           # Home page logic
│   ├── checkout.js         # Cart rendering & order placement
│   ├── orders.js           # Order history & buy again
│   ├── tracking.js         # Tracking progress
│   └── utils/
│       └── money.js        # Format cents to dollars
├── data/
│   ├── products.js         # Product catalogue (static)
│   ├── deliveryOptions.js  # Delivery options
│   └── cart.js             # Local cart helper (partially used)
├── images/                 # Product images, logos, icons
└── README.md
```

## Setup and Installation

1. **Clone or download** the project files.
2. **Create a virtual environment** (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate   # On Windows: venv\Scripts\activate
   ```
3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
4. **Run the application**:
   ```bash
   python app.py
   ```
5. **Open your browser** and go to `http://localhost:5000`.

> The database (`amazon.db`) will be created automatically on first run.  
> All user data, carts, and orders are stored there.

## How to Use

- **Sign up** with an email and password, or log in if you already have an account.
- **Browse products** – use the search bar to filter by name or keywords.
- **Add to cart** – choose a quantity and click “Add to Cart”.
- **Go to checkout** – update quantities, delete items, or change delivery options.
- **Place order** – the order is saved and cart is cleared.
- **View orders** – from the “Returns & Orders” link in the header.
- **Buy it again** – quickly add a previous order’s items back to the cart.
- **Track package** – see the delivery progress bar.
- **Cancel order** – opens a modal to select a reason (currently front‑end demo).

## Development Journey

This project was built over 3–4 months while I was learning JavaScript. I started with static HTML/CSS, then gradually added interactivity, connected to a Flask backend, and implemented authentication and database persistence. Many features (delivery options, order tracking, buy‑again) were added step by step as I understood more about client‑server communication. The glassmorphism UI was a fun challenge to make the site feel modern and “jelly‑like”.

## CS50 Requirements

- **Web application** with Python (Flask) backend and JavaScript frontend.
- **Database** (SQLite) stores users, carts, and orders.
- **Responsive** design using CSS Grid and Flexbox.
- **Session management** for user login.
- **At least three API endpoints** – signup/login, cart operations, order placement.
- **Video demo** explaining the project.

## Future Improvements

- Implement actual order cancellation (backend endpoint).
- Add product reviews and ratings.
- Payment integration (Stripe, PayPal).
- Product recommendations based on order history.
- Account bar
- Dark mode
- Admin panel to manage products and orders.

## Acknowledgements

- CS50 team for the inspiration and guidance.
- Fonts and icons from Google Fonts & standard emoji.
- Day.js library for date manipulation.
- All product data and images are for educational purposes only.

---

**Thank you for checking out my project!**  
*Feel free to reach out with any questions.*
