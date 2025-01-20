<template>
  <div class="registration-container">
    <div class="registration-card">
      <img :src="ccsLogo" alt="CCS Logo" class="logo" />
      <div class="card-header">
        <h2>Create Account</h2>
        <p>Join the CCS Freshman Screening Program</p>
      </div>

      <form id="registrationForm" class="registration-form">
        <div class="error-message" id="errorMessage"></div>

        <!-- Personal Information -->
        <div class="form-row">
          <div class="form-group">
            <label for="firstName">First Name</label>
            <input type="text" id="firstName" name="firstName" required />
          </div>
          <div class="form-group">
            <label for="lastName">Last Name</label>
            <input type="text" id="lastName" name="lastName" required />
          </div>
        </div>

        <!-- Contact Information -->
        <div class="form-row">
          <div class="form-group">
            <label for="email">Email Address</label>
            <input type="email" id="email" name="email" required />
          </div>
          <div class="form-group">
            <label for="phone">Contact Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              pattern="[0-9]{11}"
              placeholder="09XXXXXXXXX"
            />
          </div>
        </div>

        <!-- Academic Information -->
        <div class="form-row">
          <div class="form-group">
            <label for="strand">Senior High School Strand</label>
            <select id="strand" name="strand" required>
              <option value="">Select Strand</option>
              <option value="STEM">STEM</option>
              <option value="ICT">ICT</option>
              <option value="ABM">ABM</option>
              <option value="HUMSS">HUMSS</option>
              <option value="GAS">GAS</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div class="form-group">
            <label for="gwa">General Weighted Average</label>
            <input
              type="number"
              id="gwa"
              name="gwa"
              step="0.01"
              min="75"
              max="100"
              required
            />
          </div>
        </div>

        <!-- Account Security -->
        <div class="form-group password-group">
          <label for="password">Password</label>
          <div class="password-input-group">
            <input type="password" id="password" name="password" required />
            <button type="button" class="password-toggle" tabindex="-1">
              <i class="far fa-eye"></i>
            </button>
          </div>
          <div class="password-strength" id="passwordStrength">
            <div class="strength-meter"></div>
            <span class="strength-text"></span>
          </div>
        </div>

        <div class="form-group password-group">
          <label for="confirmPassword">Confirm Password</label>
          <div class="password-input-group">
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              required
            />
            <button type="button" class="password-toggle" tabindex="-1">
              <i class="far fa-eye"></i>
            </button>
          </div>
        </div>

        <div class="form-group terms-group">
          <label class="checkbox-label">
            <input
              type="checkbox"
              id="termsAccepted"
              name="termsAccepted"
              required
            />
            <span class="checkbox-custom"></span>
            I agree to the <a href="#" id="termsLink">Terms and Conditions</a>
          </label>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" id="registerButton">
            <i class="fas fa-user-plus"></i> Create Account
          </button>
          <p class="login-link">
            Already have an account?
            <RouterLink to="/login">Sign in</RouterLink>
          </p>
        </div>
      </form>
    </div>
  </div>

  <!-- Terms Modal -->
  <div id="termsModal" class="modal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Terms and Conditions</h2>
        <button class="btn-close" id="closeModal">&times;</button>
      </div>
      <div class="modal-body">
        <p>Your information will be handled according to our privacy policy.</p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary" id="acceptTerms">I Accept</button>
      </div>
    </div>
  </div>

  <!-- Loading Spinner -->
  <div class="loading-spinner" id="loadingSpinner">
    <div class="spinner"></div>
    <p>Creating your account...</p>
  </div>

  <!-- Success Modal -->
  <div id="successModal" class="modal">
    <div class="modal-content">
      <h2>Registration Successful!</h2>
      <p>
        Your account has been created. You can now
        <RouterLink tp="/login">log in</RouterLink>.
      </p>
    </div>
  </div>
</template>
<script setup>
import "../assets/css/styles.css";
import ccsLogo from "../assets/images/image.png";
</script>
