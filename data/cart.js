// data/cart.js
import { getCart, saveCart } from '../scripts/api.js';

export let cart = [];

export async function loadCart() {
    cart = await getCart();
}

export function saveCartLocal() {
    saveCart(cart);
}

export function addToCart(productId, quantity) {
    let existing = cart.find(item => item.productId === productId);
    if (existing) existing.quantity += quantity;
    else cart.push({ productId, quantity, deliveryOptionId: '1' });
    saveCart(cart);
}