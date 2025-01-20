<script setup>
import { onMounted } from "vue";
import { RouterLink } from "vue-router";
// Mobile Navigation Toggle
onMounted(() => {
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");
  if (!hamburger || !navLinks) {
    throw new Error("Element not found");
  }
  hamburger.addEventListener("click", () => {
    navLinks.classList.toggle("active");
    hamburger.classList.toggle("active");
  });
  // Smooth Scrolling for Navigation Links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
        });
        // Close mobile menu if open
        navLinks.classList.remove("active");
        hamburger.classList.remove("active");
      }
    });
  });
});
</script>

<template>
  <header>
    <nav class="navbar">
      <div class="logo">
        <img src="./assets/images/image.png" alt="School Logo" />
        <h1>Freshman Screening Portal</h1>
      </div>
      <div class="nav-links">
        <RouterLink to="/">Home</RouterLink>
        <a href="#about">About</a>
        <!-- <a href="#contact">Contact</a> -->
        <RouterLink to="/login" class="login-btn">Login</RouterLink>
      </div>
      <div class="hamburger">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </nav>
  </header>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
