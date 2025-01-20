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
import "../assets/css/styles.css";
import ccsLogo from "../assets/images/image.png";
</script>
<style></style>
