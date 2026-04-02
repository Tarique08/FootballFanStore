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

    dom.hamburger?.addEventListener("click", toggleNav);
    dom.navScrim?.addEventListener("click", closeNav);
    dom.navLinks.forEach((link) => {
        link.addEventListener("click", () => closeNav());
    });

    document.querySelectorAll("[data-close]").forEach((button) => {
        button.addEventListener("click", () => closePanel(button.getAttribute("data-close")));
    });

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

function renderCatalog() {
    dom.productSections.forEach((section) => {
        const category = section.getAttribute("data-category");
        const products = state.products.filter((product) => product.category === category);

        section.innerHTML = products.map(createProductCard).join("");
        observeReveals(section);
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

function escapeAttribute(value) {
    return escapeHtml(value);
}
