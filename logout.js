document.getElementById('logoutBtn').addEventListener('click', function() {
    localStorage.removeItem('currentUser');
    window.location.reload(); //Refresh page to show guest view
});