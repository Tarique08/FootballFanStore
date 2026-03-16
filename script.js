const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('nav');

function closeMobileNav() {
    if (!hamburger || !nav) return;
    hamburger.classList.remove('active');
    nav.classList.remove('active');
    document.body.classList.remove('nav-open');
}

if (hamburger && nav) {
    hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        hamburger.classList.toggle('active');
        nav.classList.toggle('active');
        document.body.classList.toggle('nav-open', nav.classList.contains('active'));
    });
}

// Theme preference is persisted between visits.
const themeToggleBtn = document.getElementById('themeToggle');
const THEME_STORAGE_KEY = 'ffs-theme';

function applyTheme(theme) {
    const resolvedTheme = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', resolvedTheme);

    if (!themeToggleBtn) return;
    const icon = themeToggleBtn.querySelector('.theme-toggle-icon');
    const text = themeToggleBtn.querySelector('.theme-toggle-text');

    if (resolvedTheme === 'dark') {
        if (icon) icon.textContent = '☀';
        if (text) text.textContent = 'Light';
        themeToggleBtn.setAttribute('title', 'Switch to light theme');
        themeToggleBtn.setAttribute('aria-label', 'Switch to light theme');
    } else {
        if (icon) icon.textContent = '☾';
        if (text) text.textContent = 'Dark';
        themeToggleBtn.setAttribute('title', 'Switch to dark theme');
        themeToggleBtn.setAttribute('aria-label', 'Switch to dark theme');
    }
}

const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'light';
applyTheme(savedTheme);

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(nextTheme);
        localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    });
}

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        closeMobileNav();
    });
});

document.addEventListener('click', (e) => {
    if (!nav || !hamburger) return;
    if (!nav.contains(e.target) && !hamburger.contains(e.target)) {
        closeMobileNav();
    }
});

window.addEventListener('resize', () => {
    if (window.innerWidth > 768) closeMobileNav();
});

const header = document.querySelector('.header');

// Keep content clear of the fixed header height on resize.
function adjustBodyPadding() {
    if (header) {
        document.body.style.paddingTop = header.offsetHeight + 'px';
    }
}
window.addEventListener('load', adjustBodyPadding);
window.addEventListener('resize', adjustBodyPadding);

window.ASSET_BASE_PATH = window.ASSET_BASE_PATH || 'images/ChOb/';

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            const headerHeight = header.offsetHeight;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerHeight - 20;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', function(event) {
        addToCart(this, event);
    });
});

// Handles the button, cleat kick, and follow-up cart launch timing.
function addToCart(button, event) {
    let cleat = button.querySelector('.cleat');
    if (!cleat) {
        cleat = document.createElement('div');
        cleat.className = 'cleat';
        cleat.innerHTML = `<img src="${window.ASSET_BASE_PATH}cleat_ffs1.png" alt="Cleat" onerror="this.onerror=null;this.src='data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'120\' height=\'80\'><rect width=\'100%25\' height=\'100%25\' fill=\'%23ffffff00\' /><text x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' fill=\'%23000\' font-size=\'12\'>Cleat</text></svg>'">`;
        button.appendChild(cleat);
    }
    
    button.disabled = true;
    const _originalBtnText = button.textContent;

    cleat.classList.add('kicking');
    
    setTimeout(() => {
        cleat.style.transform = 'translate(-36px, -8px)';
    }, 100);

    let cleatAnimDuration = 1200;
    try {
        const cs = window.getComputedStyle(cleat);
        let dur = cs.animationDuration || cs.getPropertyValue('animation-duration') || '1.2s';
        if (dur.includes('ms')) cleatAnimDuration = parseFloat(dur);
        else if (dur.includes('s')) cleatAnimDuration = parseFloat(dur) * 1000;
    } catch (e) {
        cleatAnimDuration = 1200;
    }

    setTimeout(() => {
        button.textContent = 'Thank You';
        button.classList.add('thanked');
    }, cleatAnimDuration);

    setTimeout(() => {
        launchFootballWithArc(button);
    }, 350);

    const REENABLE_DELAY = 1800 + 400;
    setTimeout(() => {
        button.disabled = false;
        cleat.classList.remove('kicking');
        button.classList.remove('thanked');
        button.textContent = _originalBtnText;

        if (typeof isUserLoggedIn !== 'undefined' && !isUserLoggedIn) {
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

function launchFootballWithArc(button) {
    const football = document.createElement('div');
    football.className = 'football';
    football.innerHTML = `<img src="${window.ASSET_BASE_PATH}ball_ffs1.png" alt="Football" onerror="this.onerror=null;this.src='data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'120\' height=\'120\'><rect width=\'100%25\' height=\'100%25\' fill=\'%23ffffff00\' /><circle cx=\'60\' cy=\'60\' r=\'50\' fill=\'%23ffffff\' stroke=\'%23000\' stroke-width=\'4\' /><text x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' fill=\'%23000\' font-size=\'14\'>Ball</text></svg>'">`;
    
    const buttonRect = button.getBoundingClientRect();
    const cartContainer = document.getElementById('cartContainer');
    const cartRect = cartContainer.getBoundingClientRect();

    const startX = buttonRect.left + buttonRect.width / 2;
    const startY = buttonRect.top + buttonRect.height / 2;
    
    const endX = cartRect.left + cartRect.width / 2;
    const endY = cartRect.top + cartRect.height / 2;

    document.body.appendChild(football);

    const ballRect = football.getBoundingClientRect();
    const ballHalfW = ballRect.width / 2;
    const ballHalfH = ballRect.height / 2;

    football.style.left = (startX - ballHalfW) + 'px';
    football.style.top = (startY - ballHalfH) + 'px';
    football.style.opacity = '1';

    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    const arcHeight = Math.min(distance * 0.4, 200);

    const duration = 1800;

    let startTime = null;

    const animateArc = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);

        if (progress >= 1) {
            football.style.left = (endX - ballHalfW) + 'px';
            football.style.top = (endY - ballHalfH) + 'px';
            football.style.transform = 'rotate(1080deg) scale(0.3)';

            const cartImg = document.querySelector('#cartContainer img');
            if (cartImg) {
                cartImg.src = window.ASSET_BASE_PATH + 'cart_toggle_ffs.png';
            }

            setTimeout(() => {
                updateCartCount();
                football.remove();
                showSuccessMessage();
                if (cartImg) {
                    setTimeout(() => {
                        cartImg.src = window.ASSET_BASE_PATH + 'cart_ffs1.png';
                    }, 1200);
                }
            }, 200);
            return;
        }

        const easeProgress = progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        const currentX = startX + (deltaX * easeProgress);

        // Parabolic arc from start to cart.
        const arcProgress = progress;
        const arcOffset = -4 * arcHeight * arcProgress * (arcProgress - 1);
        const currentY = startY + (deltaY * easeProgress) - arcOffset;

        football.style.left = (currentX - ballHalfW) + 'px';
        football.style.top = (currentY - ballHalfH) + 'px';

        const rotation = progress * 1080;
        const scale = 1 - (progress * 0.6);
        football.style.transform = `rotate(${rotation}deg) scale(${scale})`;

        requestAnimationFrame(animateArc);
    };

    requestAnimationFrame(animateArc);
}

function updateCartCount() {
    const cartCountElement = document.getElementById('cartCount');
    let count = parseInt(cartCountElement.textContent);
    count++;
    cartCountElement.textContent = count;
    
    cartCountElement.classList.add('pulse');
    setTimeout(() => {
        cartCountElement.classList.remove('pulse');
    }, 400);
}

function showSuccessMessage() {
    const message = document.getElementById('successMessage');
    message.classList.add('show');
    
    setTimeout(() => {
        message.classList.remove('show');
    }, 1500);
}

document.querySelectorAll('.quick-view-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const productCard = this.closest('.product-card');
        const productName = productCard.querySelector('.product-name').textContent;
        alert(`Quick View: ${productName}\n\n(Full modal implementation would go here)`);
    });
});

const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = this.querySelector('input[type="email"]').value;
        alert(`Thanks for subscribing with: ${email}\n\nYou'll receive our latest updates!`);
        this.reset();
    });
}

document.querySelector('.search-btn').addEventListener('click', () => {
    const searchTerm = prompt('Search for jerseys:');
    if (searchTerm) {
        alert(`Searching for: "${searchTerm}"\n\n(Search functionality would be implemented here)`);
    }
});

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.product-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});

document.querySelectorAll('.badge').forEach(badge => {
    badge.style.opacity = '0';
    badge.style.transform = 'translateY(20px)';
    badge.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(badge);
});

const cartImage = document.querySelector('#cartContainer img');
if (cartImage) {
    cartImage.src = window.ASSET_BASE_PATH + 'cart_ffs1.png';
    cartImage.onerror = function() {
        this.onerror = null;
        this.src = 'data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'120\' height=\'80\'><rect width=\'100%25\' height=\'100%25\' fill=\'%23ffffff00\' /><g fill=\'%23000\'><rect x=\'10\' y=\'30\' width=\'80\' height=\'30\' rx=\'6\' /><circle cx=\'35\' cy=\'65\' r=\'6\' /><circle cx=\'75\' cy=\'65\' r=\'6\' /></g><text x=\'50%25\' y=\'20%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' fill=\'%23000\' font-size=\'12\'>Cart</text></svg>';
    };
}

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
const mobileLoginLink = document.getElementById('mobileLoginLink');
const userDropdownContainerMain = document.getElementById('userDropdownContainer');
const userBtnMain = document.getElementById('userBtn');
const logoutBtnMain = document.getElementById('logoutBtn');

// Demo auth state for toggling login and user menu UI.
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

function syncMobileLoginVisibility() {
    if (!mobileLoginLink) return;
    mobileLoginLink.style.display = isUserLoggedIn ? 'none' : 'flex';
}

if (loginBtnMain) loginBtnMain.addEventListener('click', openLoginModal);
if (mobileLoginLink) {
    mobileLoginLink.addEventListener('click', () => {
        closeMobileNav();
        openLoginModal();
    });
}
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
            syncMobileLoginVisibility();
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
            syncMobileLoginVisibility();
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
        syncMobileLoginVisibility();
        showSuccessMessage('You have been logged out successfully!');
    });
}

    syncMobileLoginVisibility();

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && loginModal && loginModal.classList.contains('active')) closeLoginModal();
});
