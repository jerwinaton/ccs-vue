<template>
  <Sidebar />
  <main class="main-container">
    <!-- Header -->
    <header class="content-header">
      <div class="header-left">
        <h1>Applicants</h1>
      </div>
    </header>
    <div class="table-container">
      <div class="table-header">
        <h3>Recent Applications</h3>
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
          <tbody>
            <tr v-for="applicant in applicants" :key="applicant.id">
              <td>{{ applicant.name }}</td>
              <td>{{ applicant.date }}</td>
              <td>{{ applicant.status }}</td>
              <td>
                <button @click="viewApplicant(applicant.id)">View</button>
              </td>
            </tr>
            <tr v-if="applicants.length === 0">
              <td colspan="4">No recent applications found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { collection, getDocs } from "firebase/firestore";
import Sidebar from "./components/Sidebar.vue";
import "@/assets/css/styles.css";
// import "@/assets/css/components/loading-overlay.css";
// import "@/assets/css/admin-dashboard.css";

import { db } from "@/js/firebase-config";
// Reactive state to store applicants
const applicants = ref([]);

// Fetch applicants from Firestore
const loadApplicants = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "applicants"));
    applicants.value = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().firstName || "Unknown",
      date: doc.data().createdAt?.toDate().toLocaleDateString() || "N/A",
      status: doc.data().status || "Pending",
    }));
  } catch (error) {
    console.error("Error fetching applicants:", error);
  }
};

// Load data when component is mounted
onMounted(() => {
  loadApplicants();
});
</script>
