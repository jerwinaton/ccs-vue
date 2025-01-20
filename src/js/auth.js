// Toggle between Applicant and Admin login
const userTypeButtons = document.querySelectorAll('.user-type-toggle button');
let currentUserType = 'applicant';

userTypeButtons.forEach(button => {
    button.addEventListener('click', () => {
        userTypeButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentUserType = button.getAttribute('data-type');
        
        // Clear form and errors when switching user type
        document.getElementById('loginForm').reset();
        clearAllErrors();
    });
});

// Initialize password toggle
togglePassword('password', 'togglePassword');

// Login Form Submission
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Clear previous errors
        clearAllErrors();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Validate inputs
        let hasError = false;
        
        if (!validateEmail(email)) {
            showError('emailError', 'Please enter a valid email address');
            hasError = true;
        }
        
        if (password.length < 8) {
            showError('passwordError', 'Password must be at least 8 characters long');
            hasError = true;
        }
        
        if (hasError) return;
        
        // Show loading spinner
        showLoading('loadingContainer');
        
        try {
            // Here you would typically make an API call to your backend
            // For now, we'll simulate an API call with a timeout
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Redirect based on user type
            if (currentUserType === 'admin') {
                window.location.href = 'admin/dashboard.html';
            } else {
                window.location.href = 'applicant/dashboard.html';
            }
        } catch (error) {
            showError('passwordError', 'Invalid email or password');
        } finally {
            hideLoading('loadingContainer');
        }
    });
}

// Clear all error messages
function clearAllErrors() {
    clearError('emailError');
    clearError('passwordError');
}

// Registration Form Validation (if on registration page)
const registrationForm = document.getElementById('registrationForm');
if (registrationForm) {
    registrationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        clearAllErrors();
        
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        let hasError = false;
        
        // Validate first name
        if (firstName.length < 2) {
            showError('firstNameError', 'First name is required');
            hasError = true;
        }
        
        // Validate last name
        if (lastName.length < 2) {
            showError('lastNameError', 'Last name is required');
            hasError = true;
        }
        
        // Validate email
        if (!validateEmail(email)) {
            showError('emailError', 'Please enter a valid email address');
            hasError = true;
        }
        
        // Validate password
        if (!validatePassword(password)) {
            showError('passwordError', 'Password must be at least 8 characters long and contain uppercase, lowercase, and numbers');
            hasError = true;
        }
        
        // Validate password confirmation
        if (password !== confirmPassword) {
            showError('confirmPasswordError', 'Passwords do not match');
            hasError = true;
        }
        
        if (hasError) return;
        
        showLoading('loadingContainer');
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Redirect to login page after successful registration
            window.location.href = 'login.html';
        } catch (error) {
            showError('generalError', 'An error occurred during registration. Please try again.');
        } finally {
            hideLoading('loadingContainer');
        }
    });
}

// Password strength indicator
const passwordInput = document.getElementById('password');
if (passwordInput) {
    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        let strength = 0;
        
        // Length check
        if (password.length >= 8) strength++;
        // Uppercase check
        if (/[A-Z]/.test(password)) strength++;
        // Lowercase check
        if (/[a-z]/.test(password)) strength++;
        // Number check
        if (/\d/.test(password)) strength++;
        
        const strengthIndicator = document.getElementById('passwordStrength');
        if (strengthIndicator) {
            strengthIndicator.className = 'password-strength';
            switch (strength) {
                case 0:
                case 1:
                    strengthIndicator.classList.add('weak');
                    strengthIndicator.textContent = 'Weak';
                    break;
                case 2:
                case 3:
                    strengthIndicator.classList.add('medium');
                    strengthIndicator.textContent = 'Medium';
                    break;
                case 4:
                    strengthIndicator.classList.add('strong');
                    strengthIndicator.textContent = 'Strong';
                    break;
            }
        }
    });
}
