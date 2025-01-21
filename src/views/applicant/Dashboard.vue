<script setup>
import ccsLogo from "@/assets/images/image.png";
import "@/assets/css/applicant-dashboard.css";
import "@/assets/css/components/loading-overlay.css";
import "@/js/applicant-dashboard.js";
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { auth } from "@/js/firebase-config";

const router = useRouter();
onMounted(() => {
  // DOM Elements
  const sidebar = document.querySelector(".sidebar");
  const navLinks = document.querySelectorAll(".sidebar-nav a");
  const sections = document.querySelectorAll(".dashboard-section");
  const logoutBtn = document.getElementById("logoutBtn");
  // Toggle sidebar on mobile
  if (!sidebar || !navLinks || !sections || !logoutBtn) {
    throw new Error("Element not found");
  }

  // Navigation
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetSection = link.getAttribute("data-section");

      // Update active states
      navLinks.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");

      sections.forEach((section) => {
        section.classList.remove("active");
        if (section.id === targetSection) {
          section.classList.add("active");
        }
      });

      // Close sidebar on mobile after navigation
      if (window.innerWidth <= 768) {
        sidebar.classList.remove("active");
      }
    });
  });
  // Logout functionality (to be connected with Firebase)
  logoutBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to logout?")) {
      // Here you would typically sign out from Firebase
      router.push("/login");
    }
  });

  // Start Exam Button
  const startExamBtns = document.querySelectorAll(".start-exam-btn");
  startExamBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Here you would typically check if the exam is available and redirect to the exam page
      const examCard = btn.closest(".exam-card");
      const examTitle = examCard.querySelector("h3").textContent;

      if (
        confirm(
          `Are you ready to start ${examTitle}? Once started, the timer cannot be paused.`
        )
      ) {
        // Redirect to exam page
        window.location.href = `take-exam.html?exam=${encodeURIComponent(
          examTitle
        )}`;
      }
    });
  });
});
</script>
<template>
  <div class="applicant-container">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-brand">
        <img :src="ccsLogo" alt="Logo" class="brand-logo" />
        <h2>Applicant Portal</h2>
      </div>

      <nav class="sidebar-menu">
        <ul>
          <li class="active">
            <a href="dashboard.html">
              <i class="fas fa-home"></i>
              <span>Dashboard</span>
            </a>
          </li>
          <li>
            <a href="profile.html">
              <i class="fas fa-user"></i>
              <span>My Profile</span>
            </a>
          </li>
          <li>
            <a href="exams.html">
              <i class="fas fa-file-alt"></i>
              <span>Exams</span>
            </a>
          </li>
          <li>
            <a href="interviews.html">
              <i class="fas fa-calendar-alt"></i>
              <span>Interviews</span>
            </a>
          </li>
          <li>
            <a href="requirements.html">
              <i class="fas fa-tasks"></i>
              <span>Requirements</span>
            </a>
          </li>
        </ul>
      </nav>

      <div class="sidebar-footer">
        <button id="logoutBtn" class="btn-logout">
          <i class="fas fa-sign-out-alt"></i>
          <span>Logout</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Header -->
      <header class="content-header">
        <div class="header-left">
          <h1>Welcome Back, <span id="applicantName">Loading...</span></h1>
          <p class="current-date" id="currentDate"></p>
        </div>
        <div class="applicant-profile">
          <div class="profile-info">
            <h3 id="applicantId">Loading...</h3>
            <p>Applicant ID</p>
          </div>
          <img
            src="../assets/default-avatar.png"
            alt="Profile"
            id="applicantAvatar"
          />
        </div>
      </header>

      <!-- Application Status -->
      <div class="status-card">
        <div class="status-header">
          <h3 class="status-title">Application Status</h3>
          <span class="status-badge status-pending" id="applicationStatus"
            >Pending</span
          >
        </div>
        <div class="progress-section">
          <p>Application Progress</p>
          <div class="progress-bar">
            <div class="progress-fill" style="width: 60%"></div>
          </div>
        </div>
      </div>

      <!-- Upcoming Events -->
      <div class="events-section">
        <div class="events-header">
          <h3>Upcoming Events</h3>
        </div>
        <div id="upcomingEvents">
          <div class="event-card">
            <div class="event-icon event-exam">
              <i class="fas fa-file-alt"></i>
            </div>
            <div class="event-details">
              <h4>Entrance Examination</h4>
              <p>Computer Science Department</p>
            </div>
            <div class="event-time">
              <span>Tomorrow</span>
              <span>9:00 AM</span>
            </div>
          </div>
          <div class="event-card">
            <div class="event-icon event-interview">
              <i class="fas fa-user-tie"></i>
            </div>
            <div class="event-details">
              <h4>Initial Interview</h4>
              <p>With Department Head</p>
            </div>
            <div class="event-time">
              <span>Next Week</span>
              <span>2:00 PM</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Requirements Status -->
      <div class="requirements-section">
        <div class="events-header">
          <h3>Requirements Checklist</h3>
        </div>
        <div id="requirementsList">
          <div class="requirement-item">
            <div class="requirement-status">
              <div class="status-icon status-complete">
                <i class="fas fa-check"></i>
              </div>
            </div>
            <div class="requirement-info">
              <h4>Application Form</h4>
              <p>Submitted on July 1, 2023</p>
            </div>
          </div>
          <div class="requirement-item">
            <div class="requirement-status">
              <div class="status-icon status-pending">
                <i class="fas fa-clock"></i>
              </div>
            </div>
            <div class="requirement-info">
              <h4>High School Transcript</h4>
              <p>Under verification</p>
            </div>
          </div>
          <div class="requirement-item">
            <div class="requirement-status">
              <div class="status-icon status-missing">
                <i class="fas fa-times"></i>
              </div>
            </div>
            <div class="requirement-info">
              <h4>Medical Certificate</h4>
              <p>Not yet submitted</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>

  <!-- Loading Overlay -->
  <div class="loading-overlay">
    <div class="loading-content">
      <div class="loading-spinner"></div>
      <div class="loading-text">Loading dashboard data...</div>
    </div>
  </div>
</template>
