import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { UserManager } from './firebase/users.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBkGhlq460DmsOkIzABpLDHMSlnsdvWtr4",
    authDomain: "ccs-freshman-screening.firebaseapp.com",
    projectId: "ccs-freshman-screening",
    storageBucket: "ccs-freshman-screening.firebasestorage.app",
    messagingSenderId: "338007472587",
    appId: "1:338007472587:web:594f6c3c9c4d59a74e5e4e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM elements
const registrationForm = document.getElementById('registrationForm');
const errorMessage = document.getElementById('errorMessage');
const loadingSpinner = document.getElementById('loadingSpinner');
const successModal = document.getElementById('successModal');

// Form submission handler
registrationForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMessage.style.display = 'none';

    try {
        // Get form values
        const applicantData = {
            email: registrationForm.email.value,
            password: registrationForm.password.value,
            firstName: registrationForm.firstName.value,
            lastName: registrationForm.lastName.value,
            contactNumber: registrationForm.phone.value,
            strand: registrationForm.strand.value,
            gwa: parseFloat(registrationForm.gwa.value),
            // Additional required fields for applicant
            middleName: '',  // Can be updated later
            address: '',     // Can be updated later
            birthDate: '',   // Can be updated later
            gender: '',      // Can be updated later
            school: ''       // Can be updated later
        };

        // Validate password match
        if (applicantData.password !== registrationForm.confirmPassword.value) {
            throw new Error("Passwords do not match.");
        }

        // Validate GWA
        if (isNaN(applicantData.gwa) || applicantData.gwa < 75 || applicantData.gwa > 100) {
            throw new Error("Please enter a valid GWA between 75 and 100.");
        }

        // Show loading spinner
        loadingSpinner.style.display = 'flex';

        // Create applicant using UserManager
        const result = await UserManager.createApplicant(applicantData);

        if (result.success) {
            // Hide loading spinner and show success modal
            loadingSpinner.style.display = 'none';
            successModal.style.display = 'block';

            // Clear form
            registrationForm.reset();
        } else {
            throw new Error("Failed to create account. Please try again.");
        }

    } catch (error) {
        loadingSpinner.style.display = 'none';
        errorMessage.textContent = error.message;
        errorMessage.style.display = 'block';

        // Log error for debugging
        console.error('Registration error:', error);
    }
});

// Password visibility toggle
document.querySelectorAll('.password-toggle').forEach(toggleButton => {
    toggleButton.addEventListener('click', (event) => {
        const input = event.target.closest('.password-input-group').querySelector('input');
        const icon = event.target.closest('button').querySelector('i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    });
});

// Close success modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === successModal) {
        successModal.style.display = 'none';
        window.location.href = 'login.html'; // Redirect to login page
    }
});
