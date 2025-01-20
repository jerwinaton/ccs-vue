import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const loginForm = document.getElementById("loginForm");
  const errorMessage = document.getElementById("errorMessage");
  const loadingSpinner = document.getElementById("loadingSpinner");
  const passwordInput = document.getElementById("password");
  const passwordToggle = document.querySelector(".password-toggle");
  const firebaseConfig = {
    apiKey: "AIzaSyCXhg-tr6E09tYXCVNBj9MFUfxJa4-T2ao",
    authDomain: "ccs-freshmen-screening.firebaseapp.com",
    projectId: "ccs-freshmen-screening",
    storageBucket: "ccs-freshmen-screening.firebasestorage.app",
    messagingSenderId: "407376061142",
    appId: "1:407376061142:web:d5052d54975e0a4a2a5f77",
    measurementId: "G-FEZNMF4ZGL",
  };
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);

  // Initialize Firebase services
  const auth = getAuth(app);
  const db = getFirestore(app);

  window.auth = auth;
  window.db = db;

  // Password visibility toggle
  passwordToggle.addEventListener("click", function () {
    const icon = this.querySelector("i");

    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      icon.classList.remove("fa-eye");
      icon.classList.add("fa-eye-slash");
    } else {
      passwordInput.type = "password";
      icon.classList.remove("fa-eye-slash");
      icon.classList.add("fa-eye");
    }
  });

  // Form submission handler
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      // Show loading spinner
      loadingSpinner.style.display = "flex";
      errorMessage.style.display = "none";

      // Sign in user
      const userCredential = await window.auth.signInWithEmailAndPassword(
        loginForm.email.value,
        passwordInput.value
      );

      // Get user data
      const userDoc = await window.db
        .doc(`users/${userCredential.user.uid}`)
        .get();
      const userData = userDoc.data();

      // Redirect based on role
      if (userData.role === "admin") {
        window.location.href = "/admin/dashboard.html";
      } else {
        window.location.href = "/applicant/dashboard.html";
      }
    } catch (error) {
      // Handle errors
      errorMessage.textContent = error.message;
      errorMessage.style.display = "block";
      loadingSpinner.style.display = "none";
    }
  });

  // Form validation
  loginForm.querySelectorAll("input").forEach((input) => {
    input.addEventListener("invalid", (e) => {
      e.preventDefault();
      input.classList.add("invalid");
    });

    input.addEventListener("input", () => {
      if (input.validity.valid) {
        input.classList.remove("invalid");
      }
    });
  });
});
