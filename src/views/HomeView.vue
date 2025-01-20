<script setup>
import Navbar from "@/components/Navbar.vue";
import { RouterLink } from "vue-router";
</script>

<template>
  <Navbar />
  <main>
    <section class="hero">
      <div class="hero-content">
        <h1>Welcome to Our Freshman Screening Portal</h1>
        <p>Start your academic journey with us</p>
        <div class="cta-buttons">
          <RouterLink to="/register" class="cta-btn">Register Now</RouterLink>
          <RouterLink to="/login" class="cta-btn secondary">Login</RouterLink>
        </div>
      </div>
    </section>

    <section id="about" class="about-section">
      <h2>About Our Institution</h2>
      <div class="about-content">
        <div class="about-text">
          <p>
            We are committed to providing quality education and nurturing future
            leaders in technology and innovation.
          </p>
          <p>
            Our screening process ensures that we select candidates who are not
            only academically excellent but also possess the right aptitude and
            passion for technology.
          </p>
        </div>
        <div class="screening-process">
          <h3>Screening Process</h3>
          <div class="process-steps">
            <div class="step">
              <i class="fas fa-file-alt"></i>
              <h4>General Assessment</h4>
              <p>Multiple choice, essay, and enumeration questions</p>
            </div>
            <div class="step">
              <i class="fas fa-code"></i>
              <h4>Coding Challenge</h4>
              <p>Practical programming problems</p>
            </div>
            <div class="step">
              <i class="fas fa-users"></i>
              <h4>Interview</h4>
              <p>Personal interview with our faculty</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>

  <footer>
    <div class="footer-content">
      <div class="footer-section">
        <h3>Contact Us</h3>
        <p><i class="fas fa-map-marker-alt"></i> 123 University Avenue</p>
        <p><i class="fas fa-phone"></i> (123) 456-7890</p>
        <p><i class="fas fa-envelope"></i> admissions@university.edu</p>
      </div>
      <div class="footer-section">
        <h3>Follow Us</h3>
        <div class="social-links">
          <a href="#"><i class="fab fa-facebook"></i></a>
          <a href="#"><i class="fab fa-twitter"></i></a>
          <a href="#"><i class="fab fa-instagram"></i></a>
          <a href="#"><i class="fab fa-linkedin"></i></a>
        </div>
      </div>
      <div class="footer-section">
        <h3>Quick Links</h3>
        <a href="#">Privacy Policy</a>
        <a href="#">Terms of Service</a>
        <a href="#">FAQ</a>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; 2024 Freshman Screening Portal. All rights reserved.</p>
    </div>
  </footer>
</template>
