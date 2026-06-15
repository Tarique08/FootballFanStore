const THEME_STORAGE_KEY = "ffs-theme";
const CART_STORAGE_KEY = "ffs-cart";
const API_PRODUCTS_URL = "/api/products";
const FALLBACK_PRODUCTS_URL = "data/products.json";
const ASSET_BASE_PATH = "images/ChOb/";
const FREE_SHIPPING_THRESHOLD = 2499;
const FLAT_SHIPPING = 99;

const state = {
    products: [],
    cart: loadCart(),
    currentProductId: null
};

const currencyFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
});

const dom = {
    body: document.body,
    themeToggle: document.getElementById("themeToggle"),
    themeToggleText: document.querySelector(".theme-toggle-text"),
    themeToggleIcon: document.querySelector(".theme-toggle-icon"),
    hamburger: document.getElementById("hamburger"),
    nav: document.getElementById("nav"),
    navScrim: document.getElementById("navScrim"),
    navLinks: Array.from(document.querySelectorAll(".nav-link")),
    openSearchButtons: [
        document.getElementById("openSearch"),
        document.getElementById("heroSearchBtn"),
        document.getElementById("footerSearchBtn")
    ].filter(Boolean),
    openCartButtons: [
        document.getElementById("openCart"),
        document.getElementById("footerCartBtn")
    ].filter(Boolean),
    cartButton: document.getElementById("openCart"),
    cartCount: document.getElementById("cartCount"),
    searchModal: document.getElementById("searchModal"),
    productModal: document.getElementById("productModal"),
    cartDrawer: document.getElementById("cartDrawer"),
    searchInput: document.getElementById("searchInput"),
    searchResults: document.getElementById("searchResults"),
    searchSummary: document.getElementById("searchSummary"),
    productModalBody: document.getElementById("productModalBody"),
    productSections: Array.from(document.querySelectorAll(".products-grid[data-category]")),
    cartItems: document.getElementById("cartItems"),
    cartSubtotal: document.getElementById("cartSubtotal"),
    cartShipping: document.getElementById("cartShipping"),
    cartTotal: document.getElementById("cartTotal"),
    toastStack: document.getElementById("toastStack"),
    checkoutForm: document.getElementById("checkoutForm"),
    checkoutStatus: document.getElementById("checkoutStatus"),
    newsletterForm: document.getElementById("newsletterForm"),
    contactForm: document.getElementById("contactForm"),
    contactStatus: document.getElementById("contactStatus")
};

let revealObserver = null;

init();

async function init() {
    bindEvents();
    applyTheme(localStorage.getItem(THEME_STORAGE_KEY) || "light");
    setupRevealObserver();
    renderCart();
    updateCartCount();

    try {
        state.products = await fetchProducts();
        renderCatalog();
        renderCart();
        refreshSearchResults("");
    } catch (error) {
        const message = error instanceof Error ? error.message : "Catalog unavailable.";
        renderCatalogError(message);
        showToast("error", "Catalog unavailable", message);
    }
}

function bindEvents() {
    dom.themeToggle?.addEventListener("click", toggleTheme);

    dom.openSearchButtons.forEach((button) => {
        button.addEventListener("click", () => {
            openPanel("searchModal");
            dom.searchInput?.focus();
        });
    });

    dom.openCartButtons.forEach((button) => {
        button.addEventListener("click", () => openPanel("cartDrawer"));
    });

<<<<<<< HEAD
// ===== Sticky Header Element (visual 'pop' is handled by CSS on hover) =====
const header = document.querySelector('.header');

// Ensure page content is offset below the fixed header so elements are not
// cut off on small screens. We set this on load and on resize so the value
// matches the actual header height (including stacked header bars).
function adjustBodyPadding() {
    if (header) {
        document.body.style.paddingTop = header.offsetHeight + 'px';
    }
}
window.addEventListener('load', adjustBodyPadding);
window.addEventListener('resize', adjustBodyPadding);

// Configurable asset base path. If you move product images, set `window.ASSET_BASE_PATH` before this script runs.
// Default to the ChOb folder where your provided images live
window.ASSET_BASE_PATH = window.ASSET_BASE_PATH || 'images/ChOb/';

// Remove scroll-driven shadows so header only 'pops' on hover (CSS).
// If you later want shadow on scroll for small screens, we can reintroduce a class toggle here.

// Header is fixed and should remain visible — removed scroll-hide/reveal logic.
=======
    dom.hamburger?.addEventListener("click", toggleNav);
    dom.navScrim?.addEventListener("click", closeNav);
    dom.navLinks.forEach((link) => {
        link.addEventListener("click", () => closeNav());
    });

    document.querySelectorAll("[data-close]").forEach((button) => {
        button.addEventListener("click", () => closePanel(button.getAttribute("data-close")));
    });
>>>>>>> 08abbdffd31af7c0f25bd5589ca16e9578376aae

    document.addEventListener("click", handleDelegatedClick);
    document.addEventListener("keydown", handleGlobalKeydown);

    dom.searchInput?.addEventListener("input", (event) => {
        refreshSearchResults(event.target.value);
    });

    dom.checkoutForm?.addEventListener("submit", submitOrder);
    dom.newsletterForm?.addEventListener("submit", submitNewsletter);
    dom.contactForm?.addEventListener("submit", submitContact);
}

async function fetchProducts() {
    try {
        const response = await fetch(API_PRODUCTS_URL, { headers: { Accept: "application/json" } });
        if (!response.ok) {
            throw new Error("Primary catalog request failed.");
        }
        return response.json();
    } catch {
        const fallbackResponse = await fetch(FALLBACK_PRODUCTS_URL, { headers: { Accept: "application/json" } });
        if (!fallbackResponse.ok) {
            throw new Error("Could not load the product catalog.");
        }
        return fallbackResponse.json();
    }
}

<<<<<<< HEAD
// ===== Add to Cart Animation with Arc =====
document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', function(event) {
        addToCart(this, event);
    });
});

/**
 * Main function to trigger add to cart animation
 * @param {HTMLElement} button - The button element that was clicked
 * @param {Event} event - The click event from the button
 */
function addToCart(button, event) {
    // Add cleat element if not already present
    let cleat = button.querySelector('.cleat');
    if (!cleat) {
        cleat = document.createElement('div');
        cleat.className = 'cleat';
        // Use the requested cleat filename (uses configurable base path); provide inline SVG fallback
        cleat.innerHTML = `<img src="${window.ASSET_BASE_PATH}cleat_ffs1.png" alt="Cleat" onerror="this.onerror=null;this.src='data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'120\' height=\'80\'><rect width=\'100%25\' height=\'100%25\' fill=\'%23ffffff00\' /><text x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' fill=\'%23000\' font-size=\'12\'>Cleat</text></svg>'">`;
        button.appendChild(cleat);
    }
    
    // Disable button during animation
    button.disabled = true;
    // Save original button text; change to 'Thank You' after cleat animation completes
    const _originalBtnText = button.textContent;

    // Start cleat kick animation
    cleat.classList.add('kicking');
    
    // Adjust cleat movement closer to the ball (move a bit left and up)
    setTimeout(() => {
        cleat.style.transform = 'translate(-36px, -8px)';
    }, 100);

    // Determine cleat animation duration from CSS (fallback to 1200ms)
    let cleatAnimDuration = 1200;
    try {
        const cs = window.getComputedStyle(cleat);
        let dur = cs.animationDuration || cs.getPropertyValue('animation-duration') || '1.2s';
        if (dur.includes('ms')) cleatAnimDuration = parseFloat(dur);
        else if (dur.includes('s')) cleatAnimDuration = parseFloat(dur) * 1000;
    } catch (e) {
        cleatAnimDuration = 1200;
    }

    // Change button to thanked state after cleat animation finishes
    setTimeout(() => {
        button.textContent = 'Thank You';
        button.classList.add('thanked');
    }, cleatAnimDuration);

    // Wait for cleat to "kick" then launch the ball
    setTimeout(() => {
        launchFootballWithArc(button);
    }, 350); // Kick happens mid-animation

    // Re-enable button after animation completes. Keep Thank You for a short while.
    const REENABLE_DELAY = 1800 + 400; // duration (1800ms) + cushion
    setTimeout(() => {
        button.disabled = false;
        cleat.classList.remove('kicking');
        button.classList.remove('thanked');
        button.textContent = _originalBtnText;

        // If user is not logged in, open the login modal after the animation finishes
        if (typeof isUserLoggedIn !== 'undefined' && !isUserLoggedIn) {
            // small delay so the cart animation completes visually
            setTimeout(() => {
                if (typeof openLoginModal === 'function') {
                    openLoginModal();
                } else {
                    const lm = document.getElementById('loginModal');
                    if (lm) lm.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            }, 500);
        }
    }, REENABLE_DELAY);
}

/**
 * Creates and animates the football with ARC TRAJECTORY from button to cart
 * @param {HTMLElement} button - The button element that was clicked
 */
function launchFootballWithArc(button) {
    // Create football element
    const football = document.createElement('div');
    football.className = 'football';
    // Use the requested ball filename (uses configurable base path); provide inline SVG fallback
    football.innerHTML = `<img src="${window.ASSET_BASE_PATH}ball_ffs1.png" alt="Football" onerror="this.onerror=null;this.src='data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'120\' height=\'120\'><rect width=\'100%25\' height=\'100%25\' fill=\'%23ffffff00\' /><circle cx=\'60\' cy=\'60\' r=\'50\' fill=\'%23ffffff\' stroke=\'%23000\' stroke-width=\'4\' /><text x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' fill=\'%23000\' font-size=\'14\'>Ball</text></svg>'">`;
    
    // Get positions
    const buttonRect = button.getBoundingClientRect();
    const cartContainer = document.getElementById('cartContainer');
    const cartRect = cartContainer.getBoundingClientRect();

    // Start position (at button)
    const startX = buttonRect.left + buttonRect.width / 2;
    const startY = buttonRect.top + buttonRect.height / 2;
    
    // End position (at cart)
    const endX = cartRect.left + cartRect.width / 2;
    const endY = cartRect.top + cartRect.height / 2;

    // Append first so we can measure the football size and center it on coordinates
    document.body.appendChild(football);

    const ballRect = football.getBoundingClientRect();
    const ballHalfW = ballRect.width / 2;
    const ballHalfH = ballRect.height / 2;

    football.style.left = (startX - ballHalfW) + 'px';
    football.style.top = (startY - ballHalfH) + 'px';
    football.style.opacity = '1';

    // Calculate arc trajectory
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Arc height based on distance (higher arc for longer distances)
    const arcHeight = Math.min(distance * 0.4, 200); // Max 200px arc height

    // Animation duration: 1800ms (1.8 seconds) as requested
    const duration = 1800; // milliseconds

    // Use timestamp-driven animation so duration is accurate regardless of frame rate
    let startTime = null;

    const animateArc = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);

        if (progress >= 1) {
            // Animation complete: snap to end (centered on cart)
            football.style.left = (endX - ballHalfW) + 'px';
            football.style.top = (endY - ballHalfH) + 'px';
            football.style.transform = 'rotate(1080deg) scale(0.3)';

            // Change cart image to show half-ball in cart
            const cartImg = document.querySelector('#cartContainer img');
            if (cartImg) {
                cartImg.src = window.ASSET_BASE_PATH + 'cart_toggle_ffs.png';
            }

            // When ball reaches cart
            setTimeout(() => {
                updateCartCount();
                football.remove();
                showSuccessMessage();
                // Restore cart icon after a moment
                if (cartImg) {
                    setTimeout(() => {
                        cartImg.src = window.ASSET_BASE_PATH + 'cart_ffs1.png';
                    }, 1200);
                }
            }, 200);
            return;
        }

        // Easing function for smooth movement
        const easeProgress = progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        // Calculate current X position (linear)
        const currentX = startX + (deltaX * easeProgress);

        // Calculate current Y position with PARABOLIC ARC
        // Arc formula: y = -4h(x)(x-1) where h is arc height
        const arcProgress = progress;
        const arcOffset = -4 * arcHeight * arcProgress * (arcProgress - 1);
        const currentY = startY + (deltaY * easeProgress) - arcOffset;

        // Apply position
        football.style.left = (currentX - ballHalfW) + 'px';
        football.style.top = (currentY - ballHalfH) + 'px';

        // Rotate the ball as it flies
        const rotation = progress * 1080; // 3 full rotations
        const scale = 1 - (progress * 0.6); // Shrink as it approaches
        football.style.transform = `rotate(${rotation}deg) scale(${scale})`;

        requestAnimationFrame(animateArc);
    };

    // Start animation
    requestAnimationFrame(animateArc);
}

/**
 * Updates the cart count with animation
 */
function updateCartCount() {
    const cartCountElement = document.getElementById('cartCount');
    let count = parseInt(cartCountElement.textContent);
    count++;
    cartCountElement.textContent = count;
    
    // Pulse animation
    cartCountElement.classList.add('pulse');
    setTimeout(() => {
        cartCountElement.classList.remove('pulse');
    }, 400);
}

/**
 * Shows the success message temporarily
 */
function showSuccessMessage() {
    const message = document.getElementById('successMessage');
    message.classList.add('show');
    
    setTimeout(() => {
        message.classList.remove('show');
    }, 1500);
}

// ===== Quick View Button =====
document.querySelectorAll('.quick-view-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const productCard = this.closest('.product-card');
        const productName = productCard.querySelector('.product-name').textContent;
        alert(`Quick View: ${productName}\n\n(Full modal implementation would go here)`);
    });
});

// ===== Newsletter Form =====
const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = this.querySelector('input[type="email"]').value;
        alert(`Thanks for subscribing with: ${email}\n\nYou'll receive our latest updates!`);
        this.reset();
=======
function renderCatalog() {
    dom.productSections.forEach((section) => {
        const category = section.getAttribute("data-category");
        const products = state.products.filter((product) => product.category === category);

        section.innerHTML = products.map(createProductCard).join("");
        observeReveals(section);
>>>>>>> 08abbdffd31af7c0f25bd5589ca16e9578376aae
    });
}

function renderCatalogError(message) {
    dom.productSections.forEach((section) => {
        section.innerHTML = `
            <div class="empty-state">
                <strong>We could not load this collection.</strong>
                <p>${escapeHtml(message)}</p>
            </div>
        `;
    });
}

function createProductCard(product) {
    const badgeClass = getBadgeClass(product.badge);
    return `
        <article class="product-card reveal" data-product-id="${product.id}">
            <div class="product-card__media">
                ${product.badge ? `<span class="product-card__badge ${badgeClass}">${escapeHtml(product.badge)}</span>` : ""}
                <img src="${escapeAttribute(product.image)}" alt="${escapeAttribute(product.name)}">
            </div>
            <div class="product-card__content">
                <h3>${escapeHtml(product.name)}</h3>
                <p class="product-card__description">${escapeHtml(product.description)}</p>
                <div class="product-card__prices">
                    <strong class="price-now">${formatCurrency(product.price)}</strong>
                    <span class="price-before">${formatCurrency(product.originalPrice)}</span>
                </div>
                <div class="pill-row">
                    ${product.sizes.slice(0, 4).map((size) => `<span class="size-pill">${escapeHtml(size)}</span>`).join("")}
                </div>
                <div class="card-btn-row">
                    <button class="product-btn" type="button" data-action="add-to-cart" data-product-id="${product.id}" data-size="${product.sizes[1] || product.sizes[0]}">Add to cart</button>
                    <button class="ghost-btn" type="button" data-action="quick-view" data-product-id="${product.id}">Quick view</button>
                </div>
            </div>
        </article>
    `;
}

function refreshSearchResults(query) {
    if (!dom.searchResults || !dom.searchSummary) return;

    const normalizedQuery = (query || "").trim().toLowerCase();
    const products = normalizedQuery
        ? state.products.filter((product) => buildSearchText(product).includes(normalizedQuery))
        : state.products.filter((product) => product.featured).slice(0, 6);

    if (!normalizedQuery) {
        dom.searchSummary.textContent = "Showing featured picks across all collections.";
    } else {
        dom.searchSummary.textContent = `${products.length} result${products.length === 1 ? "" : "s"} for "${query.trim()}".`;
    }

    if (!products.length) {
        dom.searchResults.innerHTML = `
            <div class="empty-state">
                <strong>No matching jerseys yet.</strong>
                <p>Try another club, country, player era, or collection keyword.</p>
            </div>
        `;
        return;
    }

    dom.searchResults.innerHTML = products.map((product) => `
        <article class="search-result-card">
            <img src="${escapeAttribute(product.image)}" alt="${escapeAttribute(product.name)}">
            <div class="product-card__content">
                <span class="section-tag">${escapeHtml(categoryLabel(product.category))}</span>
                <h3>${escapeHtml(product.name)}</h3>
                <p>${escapeHtml(product.description)}</p>
                <div class="product-card__prices">
                    <strong class="price-now">${formatCurrency(product.price)}</strong>
                    <span class="price-before">${formatCurrency(product.originalPrice)}</span>
                </div>
                <div class="card-btn-row">
                    <button class="product-btn" type="button" data-action="add-to-cart" data-product-id="${product.id}" data-size="${product.sizes[1] || product.sizes[0]}">Add</button>
                    <button class="ghost-btn" type="button" data-action="quick-view" data-product-id="${product.id}">View</button>
                </div>
            </div>
        </article>
    `).join("");
}

function renderProductModal(productId) {
    const product = getProductById(productId);
    if (!product || !dom.productModalBody) return;

    state.currentProductId = productId;
    dom.productModalBody.innerHTML = `
        <div class="product-modal__layout">
            <div class="product-modal__media">
                <img src="${escapeAttribute(product.image)}" alt="${escapeAttribute(product.name)}">
            </div>
            <div class="product-modal__details">
                <span class="section-tag">${escapeHtml(categoryLabel(product.category))}</span>
                <h3>${escapeHtml(product.name)}</h3>
                <p class="product-modal__copy">${escapeHtml(product.description)}</p>
                <div class="product-card__prices">
                    <strong class="price-now">${formatCurrency(product.price)}</strong>
                    <span class="price-before">${formatCurrency(product.originalPrice)}</span>
                </div>
                <div>
                    <p class="modal-kicker">Choose a size</p>
                    <div class="size-selector">
                        ${product.sizes.map((size, index) => `
                            <label class="size-option">
                                <input type="radio" name="modalSize" value="${escapeAttribute(size)}" ${index === 1 || (index === 0 && product.sizes.length === 1) ? "checked" : ""}>
                                <span>${escapeHtml(size)}</span>
                            </label>
                        `).join("")}
                    </div>
                </div>
                <div class="card-btn-row">
                    <button class="product-btn" type="button" id="modalAddToCart" data-product-id="${product.id}">Add to cart</button>
                    <button class="ghost-btn" type="button" data-action="open-cart">Go to cart</button>
                </div>
            </div>
        </div>
    `;

    openPanel("productModal");
}

function renderCart() {
    if (!dom.cartItems || !dom.cartSubtotal || !dom.cartShipping || !dom.cartTotal) return;

    const detailedItems = getDetailedCartItems();
    const subtotal = detailedItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const shipping = detailedItems.length ? getShipping(subtotal) : 0;
    const total = subtotal + shipping;

    dom.cartSubtotal.textContent = formatCurrency(subtotal);
    dom.cartShipping.textContent = detailedItems.length ? formatCurrency(shipping) : formatCurrency(0);
    dom.cartTotal.textContent = formatCurrency(total);

    if (!detailedItems.length) {
        dom.cartItems.innerHTML = `
            <div class="cart-empty">
                <h3>Your cart is empty.</h3>
                <p>Add a jersey from any collection to test the persistent cart and guest checkout flow.</p>
            </div>
        `;
        return;
    }

    dom.cartItems.innerHTML = detailedItems.map(({ product, quantity, size }) => `
        <article class="cart-item" data-cart-key="${product.id}::${size}">
            <img src="${escapeAttribute(product.image)}" alt="${escapeAttribute(product.name)}">
            <div class="cart-item__body">
                <div class="product-card__prices">
                    <h3>${escapeHtml(product.name)}</h3>
                    <strong>${formatCurrency(product.price * quantity)}</strong>
                </div>
                <p>Size ${escapeHtml(size)} · ${escapeHtml(categoryLabel(product.category))}</p>
                <div class="qty-row">
                    <button class="qty-btn" type="button" data-action="decrease-qty" data-product-id="${product.id}" data-size="${size}">−</button>
                    <span class="qty-pill">${quantity}</span>
                    <button class="qty-btn" type="button" data-action="increase-qty" data-product-id="${product.id}" data-size="${size}">+</button>
                    <button class="remove-link" type="button" data-action="remove-item" data-product-id="${product.id}" data-size="${size}">Remove</button>
                </div>
            </div>
        </article>
    `).join("");
}

function updateCartCount() {
    if (!dom.cartCount) return;
    const count = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    dom.cartCount.textContent = String(count);
    dom.cartCount.classList.add("bump");
    window.setTimeout(() => dom.cartCount?.classList.remove("bump"), 260);
}

function addToCart(productId, size, sourceElement) {
    const product = getProductById(productId);
    if (!product) return;

    const resolvedSize = size || product.sizes[1] || product.sizes[0];
    const existingItem = state.cart.find((item) => item.productId === productId && item.size === resolvedSize);

    if (existingItem) {
        existingItem.quantity = Math.min(existingItem.quantity + 1, 10);
    } else {
        state.cart.push({
            productId,
            size: resolvedSize,
            quantity: 1
        });
    }

    persistCart();
    renderCart();
    updateCartCount();
    animateBallToCart(sourceElement);
    showToast("success", "Added to cart", `${product.name} (${resolvedSize}) is ready in your bag.`);
}

function changeQuantity(productId, size, delta) {
    const item = state.cart.find((entry) => entry.productId === productId && entry.size === size);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
        state.cart = state.cart.filter((entry) => !(entry.productId === productId && entry.size === size));
    } else {
        item.quantity = Math.min(item.quantity, 10);
    }

    persistCart();
    renderCart();
    updateCartCount();
}

function removeCartItem(productId, size) {
    state.cart = state.cart.filter((entry) => !(entry.productId === productId && entry.size === size));
    persistCart();
    renderCart();
    updateCartCount();
}

async function submitOrder(event) {
    event.preventDefault();
    if (!dom.checkoutForm || !dom.checkoutStatus) return;

    if (!state.cart.length) {
        showToast("error", "Cart is empty", "Add at least one jersey before placing an order.");
        return;
    }

    const payload = {
        items: state.cart,
        customer: Object.fromEntries(new FormData(dom.checkoutForm).entries())
    };

    setStatus(dom.checkoutStatus, "Submitting your order...");

    try {
        const data = await apiPost("/api/orders", payload);
        dom.checkoutForm.reset();
        state.cart = [];
        persistCart();
        renderCart();
        updateCartCount();
        setStatus(dom.checkoutStatus, `Order confirmed. Reference: ${data.orderId}`);
        showToast("success", "Order confirmed", `Your mock order ${data.orderId} was saved successfully.`);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Could not place your order.";
        setStatus(dom.checkoutStatus, message);
        showToast("error", "Checkout failed", message);
    }
}

async function submitNewsletter(event) {
    event.preventDefault();
    if (!dom.newsletterForm) return;

    const formData = new FormData(dom.newsletterForm);
    const email = String(formData.get("email") || "").trim();

    try {
        const data = await apiPost("/api/newsletter", { email });
        dom.newsletterForm.reset();
        showToast("success", "Subscribed", data.message || "You are on the list for new drops.");
    } catch (error) {
        const message = error instanceof Error ? error.message : "Could not save your subscription.";
        showToast("error", "Newsletter error", message);
    }
}

async function submitContact(event) {
    event.preventDefault();
    if (!dom.contactForm || !dom.contactStatus) return;

    const payload = Object.fromEntries(new FormData(dom.contactForm).entries());
    setStatus(dom.contactStatus, "Sending your message...");

    try {
        const data = await apiPost("/api/contact", payload);
        dom.contactForm.reset();
        setStatus(dom.contactStatus, data.message || "Message received.");
        showToast("success", "Message sent", "Your request is now stored in the backend inbox.");
    } catch (error) {
        const message = error instanceof Error ? error.message : "Could not send your message.";
        setStatus(dom.contactStatus, message);
        showToast("error", "Message failed", message);
    }
}

async function apiPost(url, payload) {
    let response;

    try {
        response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json"
            },
            body: JSON.stringify(payload)
        });
    } catch {
        throw new Error("Backend unavailable. Start the local server to submit this form.");
    }

    let data = {};

    try {
        data = await response.json();
    } catch {
        data = {};
    }

    if (!response.ok) {
        throw new Error(data.error || "Request failed.");
    }

    return data;
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
}

function applyTheme(theme) {
    const resolvedTheme = theme === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", resolvedTheme);

    if (!dom.themeToggle || !dom.themeToggleText || !dom.themeToggleIcon) return;

    if (resolvedTheme === "dark") {
        dom.themeToggleText.textContent = "Light";
        dom.themeToggleIcon.textContent = "☀";
        dom.themeToggle.title = "Switch to light theme";
        dom.themeToggle.setAttribute("aria-label", "Switch to light theme");
    } else {
        dom.themeToggleText.textContent = "Dark";
        dom.themeToggleIcon.textContent = "◐";
        dom.themeToggle.title = "Switch to dark theme";
        dom.themeToggle.setAttribute("aria-label", "Switch to dark theme");
    }
}

function toggleNav() {
    if (!dom.nav || !dom.hamburger || !dom.navScrim) return;
    const isOpen = dom.nav.classList.toggle("is-open");
    dom.hamburger.setAttribute("aria-expanded", String(isOpen));
    dom.navScrim.hidden = !isOpen;
    dom.body.classList.toggle("nav-open", isOpen);
}

function closeNav() {
    if (!dom.nav || !dom.hamburger || !dom.navScrim) return;
    dom.nav.classList.remove("is-open");
    dom.hamburger.setAttribute("aria-expanded", "false");
    dom.navScrim.hidden = true;
    dom.body.classList.remove("nav-open");
}

function openPanel(panelId) {
    closeNav();
    closeAllPanels();

    const panel = document.getElementById(panelId);
    if (!panel) return;

    panel.hidden = false;
    dom.body.classList.add("panel-open");
}

function closePanel(panelId) {
    if (!panelId) return;
    const panel = document.getElementById(panelId);
    if (!panel) return;

    panel.hidden = true;
    if ([dom.searchModal, dom.productModal, dom.cartDrawer].every((entry) => !entry || entry.hidden)) {
        dom.body.classList.remove("panel-open");
    }
}

function closeAllPanels() {
    [dom.searchModal, dom.productModal, dom.cartDrawer].forEach((panel) => {
        if (panel) panel.hidden = true;
    });
    dom.body.classList.remove("panel-open");
}

function handleDelegatedClick(event) {
    const target = event.target.closest("[data-action], #modalAddToCart");
    if (!target) return;

    const action = target.id === "modalAddToCart" ? "modal-add-to-cart" : target.getAttribute("data-action");
    const productId = target.getAttribute("data-product-id");
    const size = target.getAttribute("data-size");

    if (action === "quick-view" && productId) {
        renderProductModal(productId);
        return;
    }

    if (action === "add-to-cart" && productId) {
        addToCart(productId, size, target);
        return;
    }

    if (action === "modal-add-to-cart" && productId) {
        const checkedSize = document.querySelector('input[name="modalSize"]:checked');
        addToCart(productId, checkedSize?.value, target);
        closePanel("productModal");
        return;
    }

    if (action === "open-cart") {
        closePanel("productModal");
        openPanel("cartDrawer");
        return;
    }

    if ((action === "increase-qty" || action === "decrease-qty" || action === "remove-item") && productId) {
        const itemSize = target.getAttribute("data-size");
        if (!itemSize) return;

        if (action === "increase-qty") changeQuantity(productId, itemSize, 1);
        if (action === "decrease-qty") changeQuantity(productId, itemSize, -1);
        if (action === "remove-item") removeCartItem(productId, itemSize);
    }
}

function handleGlobalKeydown(event) {
    if (event.key === "Escape") {
        closeNav();
        closeAllPanels();
    }
}

function animateBallToCart(sourceElement) {
    if (!sourceElement || !dom.cartButton) return;

    const sourceRect = sourceElement.getBoundingClientRect();
    const cartRect = dom.cartButton.getBoundingClientRect();
    const ball = document.createElement("img");
    ball.src = `${ASSET_BASE_PATH}ball_ffs1.png`;
    ball.alt = "";
    ball.className = "flying-ball";
    document.body.appendChild(ball);

    const startX = sourceRect.left + sourceRect.width / 2;
    const startY = sourceRect.top + sourceRect.height / 2;
    const endX = cartRect.left + cartRect.width / 2;
    const endY = cartRect.top + cartRect.height / 2;
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const arcHeight = Math.max(90, Math.abs(deltaX) * 0.22);
    const duration = 720;
    const ballHalf = 17;

    let startTime = null;

    const tick = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const eased = progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        const currentX = startX + deltaX * eased;
        const currentY = startY + deltaY * eased - arcHeight * (1 - Math.pow(progress * 2 - 1, 2));
        ball.style.left = `${currentX - ballHalf}px`;
        ball.style.top = `${currentY - ballHalf}px`;
        ball.style.transform = `rotate(${progress * 720}deg) scale(${1 - progress * 0.35})`;
        ball.style.opacity = String(1 - progress * 0.1);

        if (progress < 1) {
            requestAnimationFrame(tick);
            return;
        }

        ball.remove();
    };

    requestAnimationFrame(tick);
}

function showToast(type, title, description) {
    if (!dom.toastStack) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <strong>${escapeHtml(title)}</strong>
        <p>${escapeHtml(description)}</p>
    `;

    dom.toastStack.appendChild(toast);
    window.setTimeout(() => toast.remove(), 3200);
}

function getDetailedCartItems() {
    return state.cart
        .map((item) => {
            const product = getProductById(item.productId);
            return product ? { ...item, product } : null;
        })
        .filter(Boolean);
}

function getProductById(productId) {
    return state.products.find((product) => product.id === productId);
}

function getShipping(subtotal) {
    return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
}

function persistCart() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.cart));
}

function loadCart() {
    try {
        const parsed = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]");
        return Array.isArray(parsed) ? parsed.filter(isValidCartItem) : [];
    } catch {
        return [];
    }
}

function isValidCartItem(item) {
    return item && typeof item.productId === "string" && typeof item.size === "string" && Number.isInteger(item.quantity);
}

function categoryLabel(category) {
    if (category === "wc2026") return "World Cup 2026";
    if (category === "club") return "Club Jerseys";
    return "Retro Collection";
}

function buildSearchText(product) {
    return [product.name, product.description, product.category, ...(product.searchTerms || [])]
        .join(" ")
        .toLowerCase();
}

function getBadgeClass(badge) {
    const normalized = (badge || "").toLowerCase();
    if (normalized === "hot") return "hot";
    if (normalized === "legend") return "legend";
    return "";
}

function formatCurrency(amount) {
    return currencyFormatter.format(Number(amount || 0));
}

function setStatus(element, message) {
    if (element) element.textContent = message;
}

function setupRevealObserver() {
    if (!("IntersectionObserver" in window)) {
        document.querySelectorAll(".reveal").forEach((element) => element.classList.add("is-visible"));
        return;
    }

    revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px"
    });

    observeReveals(document);
}

function observeReveals(scope) {
    if (!revealObserver) return;
    scope.querySelectorAll(".reveal").forEach((element) => {
        if (!element.classList.contains("is-visible")) {
            revealObserver.observe(element);
        }
    });
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

<<<<<<< HEAD
// Animate badges on scroll
document.querySelectorAll('.badge').forEach(badge => {
    badge.style.opacity = '0';
    badge.style.transform = 'translateY(20px)';
    badge.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(badge);
});

// Ensure cart image is updated if used elsewhere
const cartImage = document.querySelector('#cartContainer img');
if (cartImage) {
    // Use the requested cart image filename (via configurable base path); fallback to inline SVG if missing so UI is visible
    cartImage.src = window.ASSET_BASE_PATH + 'cart_ffs1.png';
    cartImage.onerror = function() {
        this.onerror = null;
        this.src = 'data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'120\' height=\'80\'><rect width=\'100%25\' height=\'100%25\' fill=\'%23ffffff00\' /><g fill=\'%23000\'><rect x=\'10\' y=\'30\' width=\'80\' height=\'30\' rx=\'6\' /><circle cx=\'35\' cy=\'65\' r=\'6\' /><circle cx=\'75\' cy=\'65\' r=\'6\' /></g><text x=\'50%25\' y=\'20%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' fill=\'%23000\' font-size=\'12\'>Cart</text></svg>';
    };
}

// ===== LOGIN MODAL FUNCTIONALITY =====
// This block implements the modal, tabs, forms and user dropdown behaviour.
const loginBtnMain = document.getElementById('loginBtn');
const loginModal = document.getElementById('loginModal');
const loginModalClose = document.getElementById('loginModalClose');
const loginModalOverlay = document.getElementById('loginModalOverlay');
const loginTab = document.getElementById('loginTab');
const signupTab = document.getElementById('signupTab');
const loginFormMain = document.getElementById('loginForm');
const signupFormMain = document.getElementById('signupForm');
const continueAsGuest = document.getElementById('continueAsGuest');
const continueAsGuestSignup = document.getElementById('continueAsGuestSignup');
const userDropdownContainerMain = document.getElementById('userDropdownContainer');
const userBtnMain = document.getElementById('userBtn');
const logoutBtnMain = document.getElementById('logoutBtn');

// Track login state
let isUserLoggedIn = false;

function openLoginModal() {
    if (!loginModal) return;
    loginModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLoginModal() {
    if (!loginModal) return;
    loginModal.classList.remove('active');
    document.body.style.overflow = '';
}

if (loginBtnMain) loginBtnMain.addEventListener('click', openLoginModal);
if (loginModalClose) loginModalClose.addEventListener('click', closeLoginModal);
if (loginModalOverlay) loginModalOverlay.addEventListener('click', closeLoginModal);

if (continueAsGuest) continueAsGuest.addEventListener('click', closeLoginModal);
if (continueAsGuestSignup) continueAsGuestSignup.addEventListener('click', closeLoginModal);

if (loginTab && signupTab) {
    loginTab.addEventListener('click', () => {
        loginTab.classList.add('active');
        signupTab.classList.remove('active');
        if (loginFormMain) loginFormMain.style.display = 'block';
        if (signupFormMain) signupFormMain.style.display = 'none';
    });
    signupTab.addEventListener('click', () => {
        signupTab.classList.add('active');
        loginTab.classList.remove('active');
        if (signupFormMain) signupFormMain.style.display = 'block';
        if (loginFormMain) loginFormMain.style.display = 'none';
    });
}

if (loginFormMain) {
    loginFormMain.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail')?.value || '';
        const password = document.getElementById('loginPassword')?.value || '';
        if (email && password) {
            const firstName = email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1);
            isUserLoggedIn = true;
            if (loginBtnMain) loginBtnMain.style.display = 'none';
            if (userDropdownContainerMain) userDropdownContainerMain.style.display = 'block';
            const userNameEl = document.getElementById('userName');
            if (userNameEl) userNameEl.textContent = firstName;
            closeLoginModal();
            loginFormMain.reset();
            showSuccessMessage(`Welcome back, ${firstName}!`);
        }
    });
}

if (signupFormMain) {
    signupFormMain.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('signupName')?.value || '';
        const email = document.getElementById('signupEmail')?.value || '';
        const password = document.getElementById('signupPassword')?.value || '';
        const confirmPassword = document.getElementById('signupConfirmPassword')?.value || '';
        if (password !== confirmPassword) { alert('Passwords do not match!'); return; }
        if (name && email && password) {
            const firstName = name.split(' ')[0];
            isUserLoggedIn = true;
            if (loginBtnMain) loginBtnMain.style.display = 'none';
            if (userDropdownContainerMain) userDropdownContainerMain.style.display = 'block';
            const userNameEl = document.getElementById('userName');
            if (userNameEl) userNameEl.textContent = firstName;
            closeLoginModal();
            signupFormMain.reset();
            showSuccessMessage(`Account created! Welcome, ${firstName}!`);
        }
    });
}

if (userBtnMain) {
    userBtnMain.addEventListener('click', (e) => {
        e.stopPropagation();
        if (userDropdownContainerMain) userDropdownContainerMain.classList.toggle('active');
    });
}

document.addEventListener('click', (e) => {
    if (userDropdownContainerMain && !userDropdownContainerMain.contains(e.target)) {
        userDropdownContainerMain.classList.remove('active');
    }
});

if (logoutBtnMain) {
    logoutBtnMain.addEventListener('click', (e) => {
        e.preventDefault();
        isUserLoggedIn = false;
        if (loginBtnMain) loginBtnMain.style.display = 'inline-flex';
        if (userDropdownContainerMain) { userDropdownContainerMain.style.display = 'none'; userDropdownContainerMain.classList.remove('active'); }
        showSuccessMessage('You have been logged out successfully!');
    });
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && loginModal && loginModal.classList.contains('active')) closeLoginModal();
});
=======
function escapeAttribute(value) {
    return escapeHtml(value);
}
>>>>>>> 08abbdffd31af7c0f25bd5589ca16e9578376aae
