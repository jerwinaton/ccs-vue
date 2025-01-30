import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db } from "./firebase-config.js";
import Chart from "chart.js/auto";

export class AdminDashboard {
  constructor() {
    // Initialize Firebase

    this.db = db;
    this.auth = auth;

    // Initialize charts
    this.applicantProgressChart = null;
    this.examPerformanceChart = null;

    // Check authentication
    // this.checkAuth();

    // Initialize dashboard
    this.initializeDashboard();

    // Setup event listeners
    this.setupEventListeners();
  }

  updateAdminProfile(user) {
    const adminName = document.getElementById("adminName");
    const adminAvatar = document.getElementById("adminAvatar");

    adminName.textContent = user.displayName || user.email;
    if (user.photoURL) {
      adminAvatar.src = user.photoURL;
    }
  }

  async initializeDashboard() {
    this.showLoading(true);
    try {
      console.log("Initializing dashboard...");
      // Load data in parallel, but ensure charts are created first
      await this.initializeCharts();

      // Ensure charts exist before updating them
      if (this.applicationTrendsChart && this.examPerformanceChart) {
        await this.updateChartData();
      } else {
        console.error("Charts were not initialized properly.");
      }

      await Promise.all([
        this.loadStatistics(),
        this.loadRecentApplications(),
        this.loadUpcomingInterviews(),
      ]);

      // Set current date
      this.updateCurrentDate();

      // Setup real-time listeners
      this.setupRealtimeListeners();
    } catch (error) {
      console.error("Error initializing dashboard:", error);
      // Show error message to user
      alert("Error loading dashboard data. Please refresh the page.");
    } finally {
      this.showLoading(false);
    }
  }

  async loadStatistics() {
    try {
      // Get total applicants
      const applicantsQuery = query(collection(this.db, "applicants"));
      const applicantsSnapshot = await getDocs(applicantsQuery);
      document.getElementById("totalApplicants").textContent =
        applicantsSnapshot.size;

      // Get active exams
      const examsQuery = query(
        collection(this.db, "exams"),
        where("status", "==", "active")
      );
      const examsSnapshot = await getDocs(examsQuery);
      document.getElementById("activeExams").textContent = examsSnapshot.size;

      // Get pending interviews
      const interviewsQuery = query(
        collection(this.db, "interviews"),
        where("status", "==", "pending")
      );
      const interviewsSnapshot = await getDocs(interviewsQuery);
      document.getElementById("scheduledInterviews").textContent =
        interviewsSnapshot.size;

      // Calculate pass rate
      const passedQuery = query(
        collection(this.db, "applicants"),
        where("status", "==", "passed")
      );
      const passedSnapshot = await getDocs(passedQuery);
      const passRate = (
        (passedSnapshot.size / applicantsSnapshot.size) *
        100
      ).toFixed(1);
      document.getElementById("successRate").textContent = passRate + "%";
    } catch (error) {
      console.error("Error loading statistics:", error);
      throw error;
    }
  }

  async initializeCharts() {
    // Initialize Applicant Progress Chart
    // Check if a Chart instance already exists on this canvas
    if (this.applicationTrendsChart) {
      this.applicationTrendsChart.destroy(); // Destroy previous instance
    }
    if (this.examPerformanceChart) {
      this.examPerformanceChart.destroy(); // Destroy previous instance
    }
    const applicantProgressCtx = document
      .getElementById("applicationTrends")
      .getContext("2d");
    this.applicationTrendsChart = new Chart(applicantProgressCtx, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "New Applicants",
            data: [],
            borderColor: "#3498db",
            tension: 0.4,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    // Initialize Exam Performance Chart
    const examPerformanceCtx = document
      .getElementById("examPerformance")
      .getContext("2d");
    this.examPerformanceChart = new Chart(examPerformanceCtx, {
      type: "bar",
      data: {
        labels: ["0-20", "21-40", "41-60", "61-80", "81-100"],
        datasets: [
          {
            label: "Number of Applicants",
            data: [0, 0, 0, 0, 0],
            backgroundColor: [
              "#e74c3c",
              "#e67e22",
              "#f1c40f",
              "#2ecc71",
              "#27ae60",
            ],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
    console.log("Charts initialized");
    console.log(this.applicationTrendsChart);
    console.log(this.examPerformanceChart);

    // Load initial chart data
    // await this.updateChartData();
  }

  async updateChartData() {
    try {
      console.log(
        "Updating chart data...",
        this.applicationTrendsChart,
        this.examPerformanceChart
      );

      // Ensure charts are initialized before updating
      if (!this.applicationTrendsChart || !this.examPerformanceChart) {
        console.error("Charts not initialized. Skipping update.");
        return;
      }

      // Fetch Applicant Data
      const applicantsQuery = query(
        collection(this.db, "applicants"),
        orderBy("createdAt", "desc"),
        limit(7)
      );
      const applicantsSnapshot = await getDocs(applicantsQuery);

      const dates = [];
      const counts = [];
      applicantsSnapshot.forEach((doc) => {
        const date = doc.data().createdAt.toDate();
        dates.unshift(date.toLocaleDateString());
        counts.unshift(counts.length > 0 ? counts[0] + 1 : 1);
      });

      //  Ensure the chart exists before updating it
      if (this.applicantProgressChart) {
        this.applicantProgressChart.data.labels = dates;
        this.applicantProgressChart.data.datasets[0].data = counts;
        this.applicantProgressChart.update();
      } else {
        console.warn("Applicant Progress Chart is not initialized.");
      }

      // Fetch data for Exam Performance Chart
      const examResultsQuery = query(collection(this.db, "examResults"));
      const examResultsSnapshot = await getDocs(examResultsQuery);

      const performanceBuckets = [0, 0, 0, 0, 0];
      examResultsSnapshot.forEach((doc) => {
        const score = doc.data().score;
        const bucketIndex = Math.min(Math.floor(score / 20), 4);
        performanceBuckets[bucketIndex]++;
      });

      if (this.examPerformanceChart) {
        this.examPerformanceChart.data.datasets[0].data = performanceBuckets;
        this.examPerformanceChart.update();
      } else {
        console.warn("Exam Performance Chart is not initialized.");
      }
    } catch (error) {
      console.error("Error updating chart data:", error);
      throw error;
    }
  }

  async loadRecentApplications() {
    try {
      const applicationsQuery = query(
        collection(this.db, "applicants"),
        orderBy("createdAt", "desc"),
        limit(5)
      );
      const snapshot = await getDocs(applicationsQuery);

      const tbody = document.querySelector("#recentApplications");
      tbody.innerHTML = "";

      snapshot.forEach((doc) => {
        const data = doc.data();
        const tr = document.createElement("tr");
        tr.innerHTML = `
                    <td class="capitalize">${data.lastName}, ${
          data.firstName
        }</td>
                    <td>${data.createdAt?.toDate().toLocaleDateString()}</td>
                    <td><span class="capitalize status-badge status-${
                      data.applicationStatus
                    }">${data.applicationStatus}</span></td>
                    <td>
                        <button class="action-btn btn-view" data-id="${
                          doc.id
                        }">View</button>
                    </td>
                `;
        tbody.appendChild(tr);
      });
    } catch (error) {
      console.error("Error loading recent applications:", error);
      throw error;
    }
  }

  async loadUpcomingInterviews() {
    try {
      const today = new Date();
      const interviewsQuery = query(
        collection(this.db, "interviews"),
        where("date", ">=", today),
        orderBy("date", "asc"),
        limit(5)
      );
      const snapshot = await getDocs(interviewsQuery);

      const tbody = document.querySelector("#pendingInterviews");
      tbody.innerHTML = "";

      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log(data);
        const tr = document.createElement("tr");
        tr.innerHTML = `
                    <td>${data.applicantName}</td>
                    <td>${data.date.toDate().toLocaleString()}</td>
                    <td>${data.interviewer}</td>
                    <td>
                        <button class="action-btn btn-view" data-id="${
                          doc.id
                        }">View</button>
                        <button class="action-btn btn-edit" data-id="${
                          doc.id
                        }">Edit</button>
                    </td>
                `;
        tbody.appendChild(tr);
      });
    } catch (error) {
      console.error("Error loading upcoming interviews:", error);
      throw error;
    }
  }

  setupRealtimeListeners() {
    // Listen for new applications
    const applicationsQuery = query(
      collection(this.db, "applicants"),
      orderBy("createdAt", "desc"),
      limit(5)
    );
    onSnapshot(applicationsQuery, (snapshot) => {
      if (!snapshot.empty) {
        this.loadRecentApplications();
        this.loadStatistics();
        // this.updateChartData();
      }
    });

    // Listen for interview updates
    const interviewsQuery = query(
      collection(this.db, "interviews"),
      where("date", ">=", new Date()),
      orderBy("date", "asc"),
      limit(5)
    );
    onSnapshot(interviewsQuery, (snapshot) => {
      if (!snapshot.empty) {
        this.loadUpcomingInterviews();
        this.loadStatistics();
      }
    });
  }

  setupEventListeners() {
    // Logout button
    document.getElementById("logoutBtn").addEventListener("click", () => {
      console.log("logout");
      this.handleLogout();
    });

    // Table action buttons
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("action-btn")) {
        const id = e.target.dataset.id;
        const action = e.target.classList.contains("btn-view")
          ? "view"
          : "edit";
        this.handleTableAction(action, id);
      }
    });
  }

  async handleLogout() {
    try {
      await signOut(this.auth);
      window.location.href = "../login.html";
    } catch (error) {
      console.error("Error signing out:", error);
      alert("Error signing out. Please try again.");
    }
  }

  handleTableAction(action, id) {
    if (action === "view") {
      window.location.href = `view-details.html?id=${id}`;
    } else if (action === "edit") {
      window.location.href = `edit-details.html?id=${id}`;
    }
  }

  updateCurrentDate() {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const currentDate = new Date().toLocaleDateString("en-US", options);
    document.getElementById("currentDate").textContent = currentDate;
  }

  showLoading(show) {
    const overlay = document.querySelector(".loading-overlay");
    if (show) {
      overlay.classList.add("active");
    } else {
      overlay.classList.remove("active");
    }
  }
}

// Applicants Management
let applicants = [];
let currentPage = 1;
const itemsPerPage = 10;

// Initialize applicants data
function initializeApplicants() {
  const applicantsRef = collection(db, "applicants");

  onSnapshot(applicantsRef, (snapshot) => {
    let applicants = [];
    snapshot.forEach((doc) => {
      applicants.push({ id: doc.id, ...doc.data() });
    });

    updateStatistics();
    renderApplicants();
  });
}
// Update statistics cards
function updateStatistics() {
  const total = applicants.length;
  const pending = applicants.filter((a) => a.status === "pending").length;
  const approved = applicants.filter((a) => a.status === "approved").length;
  const rejected = applicants.filter((a) => a.status === "rejected").length;

  document.querySelector(".stat-card.total .stat-number").textContent = total;
  document.querySelector(".stat-card.pending .stat-number").textContent =
    pending;
  document.querySelector(".stat-card.approved .stat-number").textContent =
    approved;
  document.querySelector(".stat-card.rejected .stat-number").textContent =
    rejected;
}

// Render applicants table
function renderApplicants() {
  const tableBody = document.getElementById("applicantsTableBody");
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const filteredApplicants = filterApplicants();
  const paginatedApplicants = filteredApplicants.slice(startIndex, endIndex);

  tableBody.innerHTML = "";
  paginatedApplicants.forEach((applicant) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td><input type="checkbox" class="applicant-checkbox" value="${
              applicant.id
            }"></td>
            <td>${applicant.id}</td>
            <td>${applicant.firstName} ${applicant.lastName}</td>
            <td>${applicant.program}</td>
            <td><span class="status-badge status-${applicant.status}">${
      applicant.status
    }</span></td>
            <td>${applicant.examScore || "N/A"}</td>
            <td>${new Date(applicant.appliedDate).toLocaleDateString()}</td>
            <td>
                <button class="btn-view" onclick="viewApplicant('${
                  applicant.id
                }')">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
    tableBody.appendChild(row);
  });

  updatePagination(filteredApplicants.length);
}

// Filter applicants based on search and filters
function filterApplicants() {
  const searchTerm = document
    .getElementById("applicantSearch")
    .value.toLowerCase();
  const statusFilter = document.getElementById("statusFilter").value;
  const programFilter = document.getElementById("programFilter").value;

  return applicants.filter((applicant) => {
    const matchesSearch = (applicant.firstName + " " + applicant.lastName)
      .toLowerCase()
      .includes(searchTerm);
    const matchesStatus = !statusFilter || applicant.status === statusFilter;
    const matchesProgram =
      !programFilter || applicant.program === programFilter;

    return matchesSearch && matchesStatus && matchesProgram;
  });
}

// Update pagination
function updatePagination(totalItems) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const pagination = document.querySelector(".pagination");
  const pageNumbers = pagination.querySelector(".page-numbers");
  const prevBtn = pagination.querySelector("button:first-child");
  const nextBtn = pagination.querySelector("button:last-child");

  // Update showing entries text
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(startIndex + itemsPerPage - 1, totalItems);
  document.getElementById("showingStart").textContent = totalItems
    ? startIndex
    : 0;
  document.getElementById("showingEnd").textContent = endIndex;
  document.getElementById("totalEntries").textContent = totalItems;

  // Update pagination buttons
  pageNumbers.innerHTML = "";
  for (let i = 1; i <= totalPages; i++) {
    const button = document.createElement("button");
    button.className = `btn-page${i === currentPage ? " active" : ""}`;
    button.textContent = i;
    button.onclick = () => {
      currentPage = i;
      renderApplicants();
    };
    pageNumbers.appendChild(button);
  }

  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;

  prevBtn.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      renderApplicants();
    }
  };

  nextBtn.onclick = () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderApplicants();
    }
  };
}

// View applicant details
function viewApplicant(applicantId) {
  const applicant = applicants.find((a) => a.id === applicantId);
  if (!applicant) return;

  // Update modal content
  document.getElementById(
    "applicantName"
  ).textContent = `${applicant.firstName} ${applicant.lastName}`;
  document.getElementById("applicantId").textContent = `ID: ${applicant.id}`;
  document.getElementById(
    "applicantStatus"
  ).className = `status-badge status-${applicant.status}`;
  document.getElementById("applicantStatus").textContent = applicant.status;

  // Personal Information
  document.getElementById(
    "fullName"
  ).textContent = `${applicant.firstName} ${applicant.lastName}`;
  document.getElementById("email").textContent = applicant.email;
  document.getElementById("phone").textContent = applicant.phone;
  document.getElementById("dob").textContent = new Date(
    applicant.dateOfBirth
  ).toLocaleDateString();
  document.getElementById("address").textContent = applicant.address;
  document.getElementById("program").textContent = applicant.program;

  // Academic Information
  document.getElementById("schoolName").textContent = applicant.highSchool;
  document.getElementById("gradYear").textContent = applicant.graduationYear;
  document.getElementById("gpa").textContent = applicant.gpa;

  // Update exam scores
  if (applicant.examScore) {
    document.getElementById("examScore").textContent = applicant.examScore;
    document
      .querySelector(".score-circle circle.progress")
      .style.setProperty("--progress", applicant.examScore / 100);

    // Update section scores
    const sections = ["mathematics", "english", "science", "logic"];
    sections.forEach((section) => {
      const score = applicant.sectionScores?.[section] || 0;
      const progressBar = document.querySelector(
        `.score-bar:contains('${section}') .progress`
      );
      const scoreValue = document.querySelector(
        `.score-bar:contains('${section}') .score-value`
      );
      if (progressBar && scoreValue) {
        progressBar.style.width = `${score}%`;
        scoreValue.textContent = `${score}%`;
      }
    });
  }

  // Show modal
  const modal = document.getElementById("applicantModal");
  modal.style.display = "block";
}

// Update applicant status
async function updateStatus(status) {
  const applicantId = document
    .getElementById("applicantId")
    .textContent.replace("ID: ", "");
  try {
    const applicantRef = doc(db, "applicants", applicantId);

    await updateDoc(applicantRef, {
      status: status,
      updatedAt: serverTimestamp(),
    });

    // Close modal
    document.getElementById("applicantModal").style.display = "none";

    // Show success message
    showNotification("Status updated successfully", "success");
  } catch (error) {
    console.error("Error updating status:", error);
    showNotification("Error updating status", "error");
  }
}

// Export applicants data
function exportApplicants() {
  const filteredApplicants = filterApplicants();
  const csvContent = convertToCSV(filteredApplicants);
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `applicants_export_${new Date().toISOString()}.csv`
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Convert applicants data to CSV
function convertToCSV(applicants) {
  const headers = [
    "ID",
    "First Name",
    "Last Name",
    "Email",
    "Phone",
    "Program",
    "Status",
    "Exam Score",
    "Applied Date",
  ];

  const rows = applicants.map((applicant) => [
    applicant.id,
    applicant.firstName,
    applicant.lastName,
    applicant.email,
    applicant.phone,
    applicant.program,
    applicant.status,
    applicant.examScore || "",
    new Date(applicant.appliedDate).toLocaleDateString(),
  ]);

  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  initializeApplicants();

  // Search and filter events
  document.getElementById("applicantSearch").addEventListener("input", () => {
    currentPage = 1;
    renderApplicants();
  });

  document.getElementById("statusFilter").addEventListener("change", () => {
    currentPage = 1;
    renderApplicants();
  });

  document.getElementById("programFilter").addEventListener("change", () => {
    currentPage = 1;
    renderApplicants();
  });

  // Modal close events
  document.querySelector(".btn-close").addEventListener("click", () => {
    document.getElementById("applicantModal").style.display = "none";
  });

  document.querySelector(".btn-close-modal").addEventListener("click", () => {
    document.getElementById("applicantModal").style.display = "none";
  });

  window.addEventListener("click", (event) => {
    const modal = document.getElementById("applicantModal");
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });

  // Tab switching
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabPanes = document.querySelectorAll(".tab-pane");

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetTab = button.dataset.tab;

      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabPanes.forEach((pane) => pane.classList.remove("active"));

      button.classList.add("active");
      document.getElementById(targetTab).classList.add("active");
    });
  });

  // Select all checkbox
  document.getElementById("selectAll").addEventListener("change", (e) => {
    const checkboxes = document.querySelectorAll(".applicant-checkbox");
    checkboxes.forEach((checkbox) => (checkbox.checked = e.target.checked));
  });

  new AdminDashboard();
});

// Show notification
function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("show");
    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }, 100);
}
