// scripts/api.js

const API_BASE = '';  // empty = same origin

export async function signup(email, password) {
    const res = await fetch(`${API_BASE}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    return await res.json();
}

export async function login(email, password) {
    const res = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    return await res.json();
}

export async function logout() {
    await fetch(`${API_BASE}/api/logout`, { method: 'POST' });
}

export async function checkSession() {
    const res = await fetch(`${API_BASE}/api/check_session`);
    return await res.json();
}

export async function getCart() {
    const res = await fetch(`${API_BASE}/api/cart`);
    if (!res.ok) throw new Error('Not logged in');
    return await res.json();
}

export async function saveCart(cart) {
    const res = await fetch(`${API_BASE}/api/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cart)
    });
    return await res.json();
}

export async function getOrders() {
    const res = await fetch(`${API_BASE}/api/orders`);
    return await res.json();
}

export async function placeOrder(orderData) {
    const res = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
    });
    return await res.json();
}