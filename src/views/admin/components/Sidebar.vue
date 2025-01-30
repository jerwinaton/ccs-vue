<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <!-- Sidebar -->
  <aside class="sidebar">
    <div class="sidebar-brand">
      <img :src="ccsLogo" alt="Logo" class="brand-logo" />
      <h2>Admin Portal</h2>
    </div>

    <nav class="sidebar-menu">
      <ul>
        <li :class="{ active: isActive('/admin/dashboard') }">
          <RouterLink to="/admin/dashboard">
            <i class="fas fa-home"></i>
            <span>Dashboard</span>
          </RouterLink>
        </li>
        <li :class="{ active: isActive('/admin/applicants') }">
          <RouterLink to="/admin/dashboard">
            <i class="fas fa-users"></i>
            <span>Applicants</span>
          </RouterLink>
        </li>
        <li :class="{ active: isActive('/admin/exams') }">
          <RouterLink to="/admin/exams">
            <i class="fas fa-file-alt"></i>
            <span>Exams</span>
          </RouterLink>
        </li>
        <li :class="{ active: isActive('/admin/interviews') }">
          <RouterLink to="/admin/interviews">
            <i class="fas fa-calendar-alt"></i>
            <span>Interviews</span>
          </RouterLink>
        </li>
        <!-- <li>
          <a href="reports.html">
            <i class="fas fa-chart-bar"></i>
            <span>Reports</span>
          </a>
        </li>
        <li>
          <a href="analytics.html">
            <i class="fas fa-chart-line"></i>
            <span>Analytics</span>
          </a>
        </li>
        <li>
          <a href="notifications.html">
            <i class="fas fa-bell"></i>
            <span>Notifications</span>
          </a>
        </li>
        <li>
          <a href="users.html">
            <i class="fas fa-user-cog"></i>
            <span>User Management</span>
          </a>
        </li>
        <li>
          <a href="audit.html">
            <i class="fas fa-history"></i>
            <span>Audit Logs</span>
          </a>
        </li>
        <li>
          <a href="settings.html">
            <i class="fas fa-cog"></i>
            <span>Settings</span>
          </a>
        </li> -->
      </ul>
    </nav>

    <div class="sidebar-footer">
      <button id="logoutBtn" class="btn-logout">
        <i class="fas fa-sign-out-alt"></i>
        <span>Logout</span>
      </button>
    </div>
  </aside>
</template>
<script setup>
import { computed } from "vue";
import { RouterLink, useRoute } from "vue-router";
const route = useRoute();
import ccsLogo from "@/assets/images/image.png";

// Function to check if the current route matches the given path
const isActive = computed(() => (path) => route.path.startsWith(path));
</script>
