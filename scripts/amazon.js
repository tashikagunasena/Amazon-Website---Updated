import { products } from "../data/products.js";
import { checkSession, getCart, saveCart } from "./api.js";

let currentCart = [];

// ---------- Helper functions (same as original) ----------
function getSearchQuery() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("search") || "";
}

function filterProducts(products, searchTerm) {
  if (!searchTerm.trim()) return products;
  const term = searchTerm.toLowerCase().trim();
  return products.filter((product) => {
    const nameMatch = product.name.toLowerCase().includes(term);
    const keywordMatch = product.keywords.some((keyword) =>
      keyword.toLowerCase().includes(term)
    );
    return nameMatch || keywordMatch;
  });
}

// ---------- Render products (exactly as original) ----------
function renderProducts(productsToRender) {
  let productsHTML = "";
  productsToRender.forEach((product) => {
    productsHTML += `
      <div class="product-container">
        <div class="product-image-container">
          <img class="product-image" src="${product.image}" />
        </div>

        <div class="product-name limit-text-to-2-lines">
          ${product.name}
        </div>

        <div class="product-rating-container">
          <img
            class="product-rating-stars"
            src="images/ratings/rating-${product.rating.stars * 10}.png"
          />
          <div class="product-rating-count link-primary">
            ${product.rating.count}
          </div>
        </div>

        <div class="product-price">
          $${(product.priceCents / 100).toFixed(2)}
        </div>

        <div class="product-quantity-container">
          <select class="js-quantity-selector">
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="7">7</option>
            <option value="8">8</option>
            <option value="9">9</option>
            <option value="10">10</option>
          </select>
        </div>

        <div class="product-spacer"></div>

        <div class="added-to-cart js-added-to-cart">
          <img src="images/icons/checkmark.png" />
          Added to cart
        </div>

        <button
          class="add-to-cart-button button-primary js-add-to-cart"
          data-product-id="${product.id}"
        >
          Add to Cart
        </button>
      </div>
    `;
  });

  document.querySelector(".js-products-grid").innerHTML = productsHTML;
  attachAddToCartEvents();
}

// ---------- Add to cart handler (using API) ----------
function attachAddToCartEvents() {
  document.querySelectorAll(".js-add-to-cart").forEach((button) => {
    // Remove any previous listener to avoid duplicates
    button.removeEventListener("click", handleAddToCart);
    button.addEventListener("click", handleAddToCart);
  });
}

async function handleAddToCart(event) {
  const button = event.currentTarget;
  const productId = button.dataset.productId;
  const quantitySelector = button
    .closest(".product-container")
    .querySelector(".js-quantity-selector");
  const quantity = Number(quantitySelector.value);

  // Update local cart array
  const existingItem = currentCart.find((item) => item.productId === productId);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    currentCart.push({
      productId: productId,
      quantity: quantity,
      deliveryOptionId: "1", // default delivery option
    });
  }

  // Save to backend
  await saveCart(currentCart);
  updateCartQuantity();

  // Show "Added to cart" message (same as original)
  const addedMessage = button
    .closest(".product-container")
    .querySelector(".js-added-to-cart");
  addedMessage.classList.add("added-to-cart-visible");
  setTimeout(() => {
    addedMessage.classList.remove("added-to-cart-visible");
  }, 2000);

  // Reset quantity selector to 1 (original behaviour)
  quantitySelector.value = "1";
}

// ---------- Update cart icon quantity ----------
function updateCartQuantity() {
  let cartQuantity = 0;
  currentCart.forEach((cartItem) => {
    cartQuantity += cartItem.quantity;
  });
  document.querySelector(".js-cart-quantity").innerHTML = cartQuantity;
}

// ---------- Search functionality (original) ----------
function setupSearch() {
  const searchInput = document.querySelector(".search-bar");
  const searchButton = document.querySelector(".search-button");

  if (!searchInput || !searchButton) return;

  const executeSearch = () => {
    const query = searchInput.value.trim();
    if (query) {
      window.location.href = `/?search=${encodeURIComponent(query)}`;
    } else {
      window.location.href = "/";
    }
  };

  searchButton.addEventListener("click", executeSearch);
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") executeSearch();
  });
}

// ---------- Initialisation (check login, load cart, render) ----------
async function init() {
  // 1. Check if user is logged in
  const session = await checkSession();
  if (!session.logged_in) {
    window.location.href = "/login.html";
    return;
  }

  // 2. Load cart from backend
  try {
    currentCart = await getCart();
  } catch (err) {
    console.error("Failed to load cart:", err);
    currentCart = [];
  }
  updateCartQuantity();

  // 3. Filter products based on search query (if any)
  const searchQuery = getSearchQuery();
  const filteredProducts = filterProducts(products, searchQuery);
  renderProducts(filteredProducts);

  // 4. Pre-fill search bar if there is a search query
  if (searchQuery) {
    const searchInput = document.querySelector(".search-bar");
    if (searchInput) searchInput.value = searchQuery;
  }

  // 5. Set up search bar listeners
  setupSearch();
}

// Start the application
init();