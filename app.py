from flask import Flask, request, jsonify, session, send_from_directory
from flask_cors import CORS
import hashlib
import secrets
import sqlite3
import os

app = Flask(__name__, static_folder='.')
app.secret_key = secrets.token_hex(16)
CORS(app, supports_credentials=True)

# ---------- Database helpers ----------
def get_db():
    conn = sqlite3.connect('amazon.db')
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS cart_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            product_id TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            delivery_option_id TEXT DEFAULT '1',
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(user_id, product_id)
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS orders (
            id TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL,
            placed_date TEXT NOT NULL,
            total_cents INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id TEXT NOT NULL,
            product_id TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            product_name TEXT NOT NULL,
            product_image TEXT NOT NULL,
            price_cents INTEGER NOT NULL,
            delivery_date_iso TEXT NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
        )
    ''')
    conn.commit()
    conn.close()

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

# ---------- API Routes ----------
@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
    if cursor.fetchone():
        return jsonify({'error': 'Email already registered'}), 409
    hashed = hash_password(password)
    cursor.execute("INSERT INTO users (email, password_hash) VALUES (?, ?)", (email, hashed))
    db.commit()
    user_id = cursor.lastrowid
    session['user_id'] = user_id
    return jsonify({'message': 'Signup successful', 'user_id': user_id}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT id, password_hash FROM users WHERE email = ?", (email,))
    row = cursor.fetchone()
    if not row or row['password_hash'] != hash_password(password):
        return jsonify({'error': 'Invalid email or password'}), 401
    session['user_id'] = row['id']
    return jsonify({'message': 'Login successful', 'user_id': row['id']}), 200

@app.route('/api/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'message': 'Logged out'}), 200

@app.route('/api/check_session', methods=['GET'])
def check_session():
    if 'user_id' in session:
        return jsonify({'logged_in': True, 'user_id': session['user_id']})
    return jsonify({'logged_in': False}), 200

@app.route('/api/cart', methods=['GET'])
def get_cart():
    if 'user_id' not in session:
        return jsonify({'error': 'Not logged in'}), 401
    user_id = session['user_id']
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT product_id, quantity, delivery_option_id FROM cart_items WHERE user_id = ?", (user_id,))
    rows = cursor.fetchall()
    cart = [{'productId': r['product_id'], 'quantity': r['quantity'], 'deliveryOptionId': r['delivery_option_id']} for r in rows]
    return jsonify(cart), 200

@app.route('/api/cart', methods=['POST'])
def update_cart():
    if 'user_id' not in session:
        return jsonify({'error': 'Not logged in'}), 401
    user_id = session['user_id']
    cart_data = request.json   # expects full array of cart items
    db = get_db()
    cursor = db.cursor()
    cursor.execute("DELETE FROM cart_items WHERE user_id = ?", (user_id,))
    for item in cart_data:
        cursor.execute('''
            INSERT INTO cart_items (user_id, product_id, quantity, delivery_option_id)
            VALUES (?, ?, ?, ?)
        ''', (user_id, item['productId'], item['quantity'], item.get('deliveryOptionId', '1')))
    db.commit()
    return jsonify({'message': 'Cart saved'}), 200

@app.route('/api/orders', methods=['GET'])
def get_orders():
    if 'user_id' not in session:
        return jsonify({'error': 'Not logged in'}), 401
    user_id = session['user_id']
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT id, placed_date, total_cents FROM orders WHERE user_id = ? ORDER BY placed_date DESC", (user_id,))
    orders_rows = cursor.fetchall()
    orders = []
    for o in orders_rows:
        cursor.execute("SELECT product_id, quantity, product_name, product_image, price_cents, delivery_date_iso FROM order_items WHERE order_id = ?", (o['id'],))
        items_rows = cursor.fetchall()
        items = [{
            'productId': i['product_id'],
            'quantity': i['quantity'],
            'productName': i['product_name'],
            'productImage': i['product_image'],
            'priceCents': i['price_cents'],
            'deliveryDateISO': i['delivery_date_iso']
        } for i in items_rows]
        orders.append({
            'id': o['id'],
            'placedDate': o['placed_date'],
            'totalCents': o['total_cents'],
            'items': items
        })
    return jsonify(orders), 200

@app.route('/api/orders', methods=['POST'])
def place_order():
    if 'user_id' not in session:
        return jsonify({'error': 'Not logged in'}), 401
    user_id = session['user_id']
    data = request.json
    db = get_db()
    cursor = db.cursor()
    cursor.execute('''
        INSERT INTO orders (id, user_id, placed_date, total_cents)
        VALUES (?, ?, ?, ?)
    ''', (data['orderId'], user_id, data['placedDate'], data['totalCents']))
    for item in data['items']:
        cursor.execute('''
            INSERT INTO order_items (order_id, product_id, quantity, product_name, product_image, price_cents, delivery_date_iso)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (data['orderId'], item['productId'], item['quantity'], item['productName'], item['productImage'], item['priceCents'], item['deliveryDateISO']))
    cursor.execute("DELETE FROM cart_items WHERE user_id = ?", (user_id,))
    db.commit()
    return jsonify({'message': 'Order placed'}), 201

# ---------- Serve HTML & static files ----------
# Because we set static_folder='.', Flask will serve any file from the root.
# But we need to make sure index.html is served on '/'
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    # Prevent directory traversal attacks
    if '..' in filename or filename.startswith('/'):
        return 'Forbidden', 403
    return send_from_directory('.', filename)

# ---------- Run the app ----------
if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)