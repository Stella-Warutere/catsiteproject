const userIcon = document.getElementById('userIcon');
const verticalNav = document.getElementById('verticalNav');
const scrollTopBtn = document.getElementById('scrollTopBtn');
const wishlistStatus = document.getElementById('wishlistStatus');
const clearWishlistBtn = document.getElementById('clearWishlistBtn');
const wishlistToggles = document.querySelectorAll('.wishlist-toggle');
const buyLinks = document.querySelectorAll('a[href^="sinvoice.html"]');

const WISHLIST_STORAGE_KEY = 'wishlistBreeds';
const POST_LOGIN_REDIRECT_KEY = 'postLoginRedirect';

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

function getWishlist() {
    return JSON.parse(localStorage.getItem(WISHLIST_STORAGE_KEY)) || [];
}

function setWishlist(breeds) {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(breeds));
}

function updateWishlistUi() {
    const wishlist = getWishlist();

    wishlistToggles.forEach((toggle) => {
        toggle.checked = wishlist.includes(toggle.dataset.breed);
    });

    if (!wishlist.length) {
        wishlistStatus.textContent = 'No cats in your wishlist yet.';
        return;
    }

    wishlistStatus.textContent = `Wishlist: ${wishlist.join(', ')}.`;
}

function updateScrollIndicator() {
    const scrollTop = window.scrollY;
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollableHeight > 0 ? Math.min(scrollTop / scrollableHeight, 1) : 0;

    scrollTopBtn.style.setProperty('--scroll-progress', `${progress * 100}%`);
    scrollTopBtn.classList.toggle('visible', scrollTop > 140);
}

function toggleNav() {
    verticalNav.classList.toggle('active');
    userIcon.classList.toggle('active');
}

userIcon.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleNav();
});

userIcon.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleNav();
    }
});

document.addEventListener('click', (event) => {
    if (!verticalNav.contains(event.target) && !userIcon.contains(event.target)) {
        verticalNav.classList.remove('active');
        userIcon.classList.remove('active');
    }
});

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

wishlistToggles.forEach((toggle) => {
    toggle.addEventListener('change', () => {
        const wishlist = getWishlist();
        const breed = toggle.dataset.breed;

        if (toggle.checked && !wishlist.includes(breed)) {
            wishlist.push(breed);
        }

        if (!toggle.checked) {
            const index = wishlist.indexOf(breed);
            if (index !== -1) {
                wishlist.splice(index, 1);
            }
        }

        setWishlist(wishlist);
        updateWishlistUi();
    });
});

buyLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
        if (getCurrentUser()) {
            return;
        }

        event.preventDefault();
        localStorage.setItem(POST_LOGIN_REDIRECT_KEY, link.href);
        alert('Please log in before proceeding to purchase.');
        window.location.href = 'login.html';
    });
});

if (clearWishlistBtn) {
    clearWishlistBtn.addEventListener('click', () => {
        setWishlist([]);
        updateWishlistUi();
    });
}

window.addEventListener('scroll', updateScrollIndicator, { passive: true });

updateWishlistUi();
updateScrollIndicator();
