<template>
  <Sidebar />
  <div class="admin-container">
    <!-- Main Content -->
    <main class="main-content">
      <!-- Header -->
      <header class="content-header">
        <div class="header-left">
          <h1>Welcome Back, <span id="adminName">Loading...</span></h1>
          <p class="current-date" id="currentDate"></p>
        </div>
        <div class="admin-profile">
          <div class="profile-info">
            <p>Administrator</p>
          </div>
          <img :src="avatar" alt="Profile" id="adminAvatar" />
        </div>
      </header>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon applicants">
            <i class="fas fa-users"></i>
          </div>
          <div class="stat-details">
            <h3>Total Applicants</h3>
            <p id="totalApplicants">0</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon exams">
            <i class="fas fa-file-alt"></i>
          </div>
          <div class="stat-details">
            <h3>Active Exams</h3>
            <p id="activeExams">0</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon interviews">
            <i class="fas fa-calendar-check"></i>
          </div>
          <div class="stat-details">
            <h3>Scheduled Interviews</h3>
            <p id="scheduledInterviews">0</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon success">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-details">
            <h3>Success Rate</h3>
            <p id="successRate"></p>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="charts-section">
        <div class="chart-container">
          <div class="chart-header">
            <h3>Application Trends</h3>
            <div class="chart-actions">
              <button class="btn-chart-filter active">Weekly</button>
              <button class="btn-chart-filter">Monthly</button>
              <button class="btn-chart-filter">Yearly</button>
            </div>
          </div>
          <div class="chart-body">
            <canvas id="applicationTrends"></canvas>
          </div>
        </div>
        <div class="chart-container">
          <div class="chart-header">
            <h3>Exam Performance</h3>
            <div class="chart-actions">
              <button class="btn-chart-filter active">All</button>
              <button class="btn-chart-filter">Technical</button>
              <button class="btn-chart-filter">Aptitude</button>
            </div>
          </div>
          <div class="chart-body">
            <canvas id="examPerformance"></canvas>
          </div>
        </div>
      </div>

      <!-- Tables Section -->
      <div class="tables-section">
        <div class="table-container">
          <div class="table-header">
            <h3>Recent Applications</h3>
            <a href="applicants.html" class="btn-view-all">View All</a>
          </div>
          <div class="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody id="recentApplications">
                <!-- Will be populated by JavaScript -->
              </tbody>
            </table>
          </div>
        </div>
        <div class="table-container">
          <div class="table-header">
            <h3>Upcoming Interviews</h3>
            <a href="interviews.html" class="btn-view-all">View All</a>
          </div>
          <div class="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Date & Time</th>
                  <th>Type</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody id="pendingInterviews">
                <!-- Will be populated by JavaScript -->
              </tbody>
            </table>
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
<script setup>
import "@/assets/css/admin-dashboard.css";
import "@/assets/css/styles.css";
import "@/assets/css/components/loading-overlay.css";

import avatar from "@/assets/images/avatar.webp";
import Sidebar from "@/views/admin/components/Sidebar.vue";
import { AdminDashboard } from "@/js/admin-dashboard";
import { onMounted } from "vue";
onMounted(async () => {
  const adminDashboard = new AdminDashboard();
  await adminDashboard.initializeDashboard();
  // adminDashboard.setupEventListeners();
});
</script>
