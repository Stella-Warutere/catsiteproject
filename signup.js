//Select the form
const signupForm = document.getElementById('signupform');

// Listen for form submission
signupForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission behavior

    // Get the form data
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Validate the form data
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    } 

    //Create user object
    const user = {
        username: username,
        email: email,
        password: password
    }; 
    
    //Save to localStorage(temporary storage for demonstration purposes
    let users = JSON.parse(localStorage.getItem('users')) || [];
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));

    alert("Signup successful! Redirecting to login page.");
    // Optionally, redirect to the login page
    window.location.href = 'login.html';
});