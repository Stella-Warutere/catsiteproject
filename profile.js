// Get the current user from localStorage
const currentUser = JSON.parse(localStorage.getItem('currentUser'));
const logoutBtn = document.getElementById('logoutBtn');

// Display user information
if (currentUser) {
    const displayName = currentUser.username || currentUser.email;
    document.getElementById('welcome-msg').textContent = `Welcome, ${displayName}!`;
    document.getElementById('user-info').textContent = `You are logged in as ${displayName}.`;
    logoutBtn.style.display = 'inline-block'; // Show logout button
} else {
    document.getElementById('welcome-msg').textContent = 'Welcome, Guest!';
    document.getElementById('user-info').textContent = 'Please log in to access your profile.';
    logoutBtn.style.display = 'none'; // Hide logout button
}

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    window.location.reload(); // Refresh page to show guest view
});
