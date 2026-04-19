import { addToCart } from "../data/cart.js";  // we still need addToCart for "Buy it again"
import { formatCurrency } from "./utils/money.js";
import { getOrders } from "./api.js";
import dayjs from "https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js";

function updateCartQuantity() {
    // We'll keep the cart quantity from the backend – but for simplicity,
    // you can also fetch cart again. We'll keep the old method or just fetch.
    // For now, we'll reload the cart quantity from the server.
    import("./api.js").then(api => {
        api.getCart().then(cart => {
            let total = cart.reduce((sum, item) => sum + item.quantity, 0);
            document.querySelector(".js-cart-quantity").innerHTML = total;
        });
    });
}

async function renderOrders() {
    const orders = await getOrders();
    const ordersGrid = document.querySelector(".js-orders-grid");
    if (orders.length === 0) {
        ordersGrid.innerHTML = '<div class="empty-orders">You have no orders.</div>';
        return;
    }
    ordersGrid.innerHTML = orders.map(order => {
        const orderDate = dayjs(order.placedDate).format("MMMM D");
        const total = formatCurrency(order.totalCents);
        const itemsHtml = order.items.map(item => {
            const deliveryDate = dayjs(item.deliveryDateISO).format("dddd, MMMM D");
            return `
                <div class="product-image-container">
                    <img src="${item.productImage}" />
                </div>
                <div class="product-details">
                    <div class="product-name">${item.productName}</div>
                    <div class="product-delivery-date">Arriving on: ${deliveryDate}</div>
                    <div class="product-quantity">Quantity: ${item.quantity}</div>
                    <button class="buy-again-button button-primary" data-product-id="${item.productId}" data-quantity="${item.quantity}">
                        <img class="buy-again-icon" src="images/icons/buy-again.png" />
                        <span class="buy-again-message">Buy it again</span>
                    </button>
                </div>
                <div class="product-actions">
                    <a href="tracking.html?orderId=${order.id}&productId=${item.productId}">
                        <button class="track-package-button button-secondary">Track package</button>
                    </a>
                    <button class="cancel-package-button button-secondary" data-order-id="${order.id}" data-product-id="${item.productId}" data-product-name="${item.productName}">
                        Cancel package
                    </button>
                </div>
            `;
        }).join("");
        return `
            <div class="order-container">
                <div class="order-header">
                    <div class="order-header-left-section">
                        <div class="order-date"><div class="order-header-label">Order Placed:</div><div>${orderDate}</div></div>
                        <div class="order-total"><div class="order-header-label">Total:</div><div>$${total}</div></div>
                    </div>
                    <div class="order-header-right-section">
                        <div class="order-header-label">Order ID:</div><div>${order.id}</div>
                    </div>
                </div>
                <div class="order-details-grid">${itemsHtml}</div>
            </div>
        `;
    }).join("");
    
    // Attach buy again listeners
    document.querySelectorAll(".buy-again-button").forEach(button => {
        button.addEventListener("click", () => {
            const productId = button.dataset.productId;
            const quantity = parseInt(button.dataset.quantity);
            addToCart(productId, quantity);
            updateCartQuantity();
            alert(`${quantity} item(s) added to cart.`);
        });
    });
    
    // Cancel package – we will keep the modal but need to update backend.
    // For simplicity, we'll keep the modal logic as before but it must delete from server.
    // I'll show a simplified version: you can implement a DELETE call to /api/orders/... if you want.
    // For now, just console.log.
    document.querySelectorAll(".cancel-package-button").forEach(button => {
        button.addEventListener("click", () => {
            alert("Cancel feature requires additional backend endpoint. Will be added later.");
        });
    });
}

// Search setup (same as before)
function setupSearch() {
    const searchInput = document.querySelector(".search-bar");
    const searchButton = document.querySelector(".search-button");
    if (!searchInput || !searchButton) return;
    const executeSearch = () => {
        const query = searchInput.value.trim();
        if (query) window.location.href = `/?search=${encodeURIComponent(query)}`;
        else window.location.href = "/";
    };
    searchButton.addEventListener("click", executeSearch);
    searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") executeSearch();
    });
}

renderOrders();
updateCartQuantity();
setupSearch();