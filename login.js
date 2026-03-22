//Select the form
const loginForm = document.getElementById('loginform');
const POST_LOGIN_REDIRECT_KEY = 'postLoginRedirect';

// Listen for form submission
loginForm.addEventListener('submit', function(e) {
    e.preventDefault(); // Prevent the default form submission behavior

    // Get the form data
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

   //Retrieve users from localStorage
   const users = JSON.parse(localStorage.getItem('users')) || [];

   //Find the user with the matching email and password
   const user = users.find(u => u.email === email && u.password === password);

   if (user) {
       alert('Login successful!');
       localStorage.setItem('currentUser', JSON.stringify(user));
       const redirectTarget = localStorage.getItem(POST_LOGIN_REDIRECT_KEY);

       if (redirectTarget) {
           localStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
           window.location.href = redirectTarget;
           return;
       }

       // Redirect to the success page
       window.location.href = 'success.html';
   } else {
       alert('Invalid email or password.');
   }
});
