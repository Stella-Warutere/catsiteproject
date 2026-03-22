const feedbackForm = document.getElementById('feedbackForm');
const reviewsList = document.getElementById('reviewsList');
const reviewTextInput = document.getElementById('reviewText');
const reviewNameInput = document.getElementById('reviewName');
const currentUser = JSON.parse(localStorage.getItem('currentUser'));

const STORAGE_KEY = 'feedbackReviews';

function formatTimestamp(value) {
    return new Date(value).toLocaleString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });
}

function getInitials(name) {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join('');
}

function buildReviewMarkup(review) {
    const timestamp = review.createdAt ? formatTimestamp(review.createdAt) : 'Recently added';

    return `
        <div class="review-meta">
            <span class="review-avatar" aria-hidden="true">${escapeHtml(getInitials(review.name) || 'U')}</span>
            <div class="review-author">
                <strong>${escapeHtml(review.name)}</strong>
                <span>${escapeHtml(timestamp)}</span>
            </div>
        </div>
        <p class="review-text">"${escapeHtml(review.text)}"</p>
    `;
}

function escapeHtml(value) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function renderStoredReviews() {
    const storedReviews = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

    storedReviews.forEach((review) => {
        const section = document.createElement('section');
        section.className = 'review-item user-review';
        section.innerHTML = buildReviewMarkup(review);
        reviewsList.appendChild(section);
    });
}

function syncReviewerName() {
    if (!currentUser) {
        reviewNameInput.readOnly = false;
        reviewNameInput.placeholder = 'Enter your name here';
        return;
    }

    const displayName = currentUser.username || currentUser.email || '';
    reviewNameInput.value = displayName;
    reviewNameInput.readOnly = true;
    reviewNameInput.setAttribute('aria-label', 'Signed in username');
}

feedbackForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const review = reviewTextInput.value.trim();
    const name = reviewNameInput.value.trim();

    if (!review || !name) {
        return;
    }

    const storedReviews = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    const reviewEntry = { name, text: review, createdAt: new Date().toISOString() };
    storedReviews.push(reviewEntry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedReviews));

    const section = document.createElement('section');
    section.className = 'review-item user-review';
    section.innerHTML = buildReviewMarkup(reviewEntry);
    reviewsList.appendChild(section);

    feedbackForm.reset();

    if (currentUser) {
        syncReviewerName();
    }
});

syncReviewerName();
renderStoredReviews();
