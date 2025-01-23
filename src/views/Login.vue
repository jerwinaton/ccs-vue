<template>
  <div class="login-container">
    <div class="login-card">
      <img :src="ccsLogo" alt="CCS Logo" class="logo" />
      <div class="card-header">
        <h2>Welcome Back</h2>
        <p>Sign in to continue to your account</p>
      </div>

      <form id="loginForm" class="login-form">
        <div class="error-message" id="errorMessage"></div>

        <div class="form-group">
          <label for="email">Email Address</label>
          <input type="email" id="email" name="email" required />
        </div>

        <div class="form-group password-group">
          <label for="password">Password</label>
          <div class="password-input-group">
            <input type="password" id="password" name="password" required />
            <button type="button" class="password-toggle" tabindex="-1">
              <i class="far fa-eye"></i>
            </button>
          </div>
        </div>

        <div class="form-group">
          <div class="remember-forgot">
            <label class="checkbox-label">
              <input type="checkbox" id="rememberMe" name="rememberMe" />
              <span class="checkbox-custom"></span>
              Remember me
            </label>
            <RouterLink to="/forgot-password" class="forgot-link"
              >Forgot Password?</RouterLink
            >
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary">
            <i class="fas fa-sign-in-alt"></i> Sign In
          </button>
          <p class="register-link">
            Don't have an account?
            <RouterLink to="/register">Create Account</RouterLink>
          </p>
        </div>
      </form>
    </div>
  </div>

  <!-- Loading Spinner -->
  <div class="loading-spinner" id="loadingSpinner">
    <div class="spinner"></div>
    <p>Signing in...</p>
  </div>
</template>
<script setup>
import { useRouter } from "vue-router";
import "../assets/css/styles.css";
import ccsLogo from "../assets/images/image.png";

import { auth, db } from "../js/firebase-config";
import { onMounted } from "vue";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
const router = useRouter();
onMounted(() => {
  // DOM Elements
  const loginForm = document.getElementById("loginForm");
  const errorMessage = document.getElementById("errorMessage");
  const loadingSpinner = document.getElementById("loadingSpinner");
  const passwordInput = document.getElementById("password");
  const passwordToggle = document.querySelector(".password-toggle");

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
      const userCredential = await signInWithEmailAndPassword(
        auth,
        loginForm.email.value,
        passwordInput.value
      );

      // Get user data
      const userDocRef = doc(db, "users", userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.data();

      // Redirect based on role
      if (userData.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/applicant/dashboard");
      }
    } catch (error) {
      // Handle errors
      if (error.code === "auth/invalid-credential") {
        errorMessage.textContent =
          "Invalid Credentials. Please check your email and password.";
      } else {
        errorMessage.textContent = error.message;
      }

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
</script>
<style></style>
