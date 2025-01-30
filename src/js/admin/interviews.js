// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
  doc,
  updateDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { firebaseConfig } from "../../js/firebase-config.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// DOM Elements
const scheduleModal = document.getElementById("scheduleModal");
const scheduleBtn = document.querySelector("#scheduleBtn");
const saveScheduleBtn = document.getElementById("saveScheduleBtn");
const closeModalBtns = document.querySelectorAll(
  '[data-dismiss="modal"], .close-modal'
);
const applicantSelect = document.getElementById("applicantSelect");
const interviewerSelect = document.getElementById("interviewer");
const interviewDate = document.getElementById("interviewDate");
const interviewTime = document.getElementById("interviewTime");
const interviewType = document.getElementById("interviewType");
const notesInput = document.getElementById("notes");
const loadingSpinner = document.getElementById("loadingSpinner");

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded");
  if (scheduleBtn) {
    console.log("Schedule button found");
    scheduleBtn.addEventListener("click", () => {
      console.log("Schedule button clicked");
      openScheduleModal();
    });
  } else {
    console.error("Schedule button not found");
  }

  if (saveScheduleBtn) {
    saveScheduleBtn.addEventListener("click", handleScheduleSubmit);
  }

  if (closeModalBtns) {
    closeModalBtns.forEach((btn) => btn.addEventListener("click", closeModal));
  }

  // Initialize date picker with restrictions
  if (interviewDate) {
    const today = new Date();
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3); // Allow scheduling up to 3 months in advance
    interviewDate.min = today.toISOString().split("T")[0];
    interviewDate.max = maxDate.toISOString().split("T")[0];
  }

  // Close modal when clicking outside
  window.addEventListener("click", (event) => {
    if (event.target === scheduleModal) {
      closeModal();
    }
  });
});

// Functions
async function openScheduleModal() {
  console.log("Opening schedule modal");
  scheduleModal.style.display = "block";
  loadingSpinner.style.display = "block";

  try {
    // Fetch applicants who passed both screenings
    const applicantsQuery = query(
      collection(db, "applicants"),
      where("screeningStatus.part1", "==", "passed"),
      where("screeningStatus.part2", "==", "passed"),
      where("interviewStatus", "==", "pending"),
      orderBy("lastName")
    );

    const applicantsSnapshot = await getDocs(applicantsQuery);

    // Clear and populate applicant dropdown
    applicantSelect.innerHTML = '<option value="">Select Applicant</option>';

    if (applicantsSnapshot.empty) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "No eligible applicants found";
      option.disabled = true;
      applicantSelect.appendChild(option);
    } else {
      applicantsSnapshot.forEach((doc) => {
        const applicant = doc.data();
        const option = document.createElement("option");
        option.value = doc.id;
        option.textContent = `${applicant.lastName}, ${applicant.firstName} - ${applicant.course}`;
        applicantSelect.appendChild(option);
      });
    }

    // Fetch and populate interviewers
    const interviewersQuery = query(
      collection(db, "users"),
      where("role", "==", "interviewer"),
      where("status", "==", "active"),
      orderBy("lastName")
    );

    const interviewersSnapshot = await getDocs(interviewersQuery);

    // Clear and populate interviewer dropdown
    interviewerSelect.innerHTML =
      '<option value="">Select Interviewer</option>';

    if (interviewersSnapshot.empty) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "No active interviewers found";
      option.disabled = true;
      interviewerSelect.appendChild(option);
    } else {
      interviewersSnapshot.forEach((doc) => {
        const interviewer = doc.data();
        const option = document.createElement("option");
        option.value = doc.id;
        option.textContent = `${interviewer.lastName}, ${interviewer.firstName} - ${interviewer.department}`;
        interviewerSelect.appendChild(option);
      });
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    alert("Error loading data. Please try again.");
  } finally {
    loadingSpinner.style.display = "none";
  }
}

async function handleScheduleSubmit() {
  // Validate form
  if (!validateScheduleForm()) {
    return;
  }

  loadingSpinner.style.display = "block";
  saveScheduleBtn.disabled = true;

  try {
    // Get selected applicant and interviewer details
    const applicantDoc = await getDoc(
      doc(db, "applicants", applicantSelect.value)
    );
    const interviewerDoc = await getDoc(
      doc(db, "users", interviewerSelect.value)
    );

    const applicantData = applicantDoc.data();
    const interviewerData = interviewerDoc.data();

    // Create interview document
    const interviewDateTime = new Date(
      `${interviewDate.value}T${interviewTime.value}`
    );

    const interviewData = {
      applicantId: applicantSelect.value,
      applicantName: `${applicantData.lastName}, ${applicantData.firstName}`,
      applicantCourse: applicantData.course,
      interviewerId: interviewerSelect.value,
      interviewerName: `${interviewerData.lastName}, ${interviewerData.firstName}`,
      interviewerDepartment: interviewerData.department,
      dateTime: Timestamp.fromDate(interviewDateTime),
      type: interviewType.value,
      notes: notesInput.value,
      status: "scheduled",
      result: "pending",
      scores: {},
      feedback: "",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    // Add to Firestore
    const interviewRef = await addDoc(
      collection(db, "interviews"),
      interviewData
    );

    // Update applicant status
    await updateDoc(doc(db, "applicants", applicantSelect.value), {
      interviewStatus: "scheduled",
      currentInterviewId: interviewRef.id,
      updatedAt: Timestamp.now(),
    });

    // Success message and close modal
    alert("Interview scheduled successfully!");
    closeModal();
    location.reload(); // Refresh to show new interview
  } catch (error) {
    console.error("Error scheduling interview:", error);
    alert("Error scheduling interview. Please try again.");
  } finally {
    loadingSpinner.style.display = "none";
    saveScheduleBtn.disabled = false;
  }
}

function validateScheduleForm() {
  if (!applicantSelect.value) {
    alert("Please select an applicant");
    return false;
  }
  if (!interviewerSelect.value) {
    alert("Please select an interviewer");
    return false;
  }
  if (!interviewDate.value) {
    alert("Please select a date");
    return false;
  }
  if (!interviewTime.value) {
    alert("Please select a time");
    return false;
  }
  if (!interviewType.value) {
    alert("Please select an interview type");
    return false;
  }

  // Validate interview time is during business hours (8 AM to 5 PM)
  const selectedTime = interviewTime.value;
  const hour = parseInt(selectedTime.split(":")[0]);
  if (hour < 8 || hour >= 17) {
    alert("Please select a time between 8:00 AM and 5:00 PM");
    return false;
  }

  return true;
}

function closeModal() {
  scheduleModal.style.display = "none";
  // Reset form
  const form = document.querySelector("#scheduleForm");
  if (form) form.reset();
}

// State Management
let currentPage = 1;
const itemsPerPage = 10;
let totalItems = 0;
let currentInterviews = [];
let selectedInterviewId = null;

// Initialize
document.addEventListener("DOMContentLoaded", async () => {
  // Check authentication
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      // Load initial data
      await loadInterviews();
      await updateStatistics();
      setupEventListeners();
    } else {
      window.location.href = "/login";
    }
  });
});

// Event Listeners Setup
function setupEventListeners() {
  // Search and Filters
  const searchInput = document.getElementById("searchInput");
  const statusFilter = document.getElementById("statusFilter");
  const dateFilter = document.getElementById("dateFilter");
  searchInput.addEventListener("input", debounce(handleSearch, 300));
  statusFilter.addEventListener("change", handleFilters);
  dateFilter.addEventListener("change", handleFilters);

  // Modals
  const detailsModal = document.getElementById("detailsModal");
  const closeModalButtons = document.querySelectorAll(".close-modal");
  const dismissModalButtons = document.querySelectorAll(
    '[data-dismiss="modal"]'
  );
  const viewDetailsBtns = document.querySelectorAll(".view-details-btn");
  viewDetailsBtns.forEach((btn) => btn.addEventListener("click", viewDetails));
  closeModalButtons.forEach((btn) =>
    btn.addEventListener("click", closeModals)
  );
  dismissModalButtons.forEach((btn) =>
    btn.addEventListener("click", closeModals)
  );
  window.addEventListener("click", handleOutsideClick);

  // Evaluation Form
  const evaluationForm = document.getElementById("evaluationForm");
  const saveEvaluationBtn = document.getElementById("saveEvaluationBtn");
  evaluationForm.addEventListener("submit", handleEvaluationSubmit);
  saveEvaluationBtn.addEventListener("click", () => {
    evaluationForm.requestSubmit();
  });

  // Pagination
  const prevPage = document.getElementById("prevPage");
  const nextPage = document.getElementById("nextPage");
  prevPage.addEventListener("click", () => changePage(currentPage - 1));
  nextPage.addEventListener("click", () => changePage(currentPage + 1));

  // Export
  const exportBtn = document.getElementById("exportBtn");
  exportBtn.addEventListener("click", handleExport);
}

// Data Loading Functions
async function loadInterviews() {
  try {
    showLoading(true);
    const snapshot = await db.collection("interviews").get();
    currentInterviews = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    totalItems = currentInterviews.length;
    updatePagination();
    renderInterviews();
  } catch (error) {
    console.error("Error loading interviews:", error);
    showError("Failed to load interviews");
  } finally {
    showLoading(false);
  }
}

async function updateStatistics() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayCount = document.getElementById("todayCount");
    const pendingCount = document.getElementById("pendingCount");
    const completedCount = document.getElementById("completedCount");
    const passRate = document.getElementById("passRate");

    const todayInterviews = currentInterviews.filter(
      (interview) =>
        new Date(interview.dateTime).setHours(0, 0, 0, 0) === today.getTime()
    ).length;

    const pending = currentInterviews.filter(
      (interview) => interview.status === "scheduled"
    ).length;

    const completed = currentInterviews.filter(
      (interview) => interview.status === "completed"
    ).length;

    const passed = currentInterviews.filter(
      (interview) => interview.status === "completed" && interview.score >= 3
    ).length;

    todayCount.textContent = todayInterviews;
    pendingCount.textContent = pending;
    completedCount.textContent = completed;
    passRate.textContent = completed
      ? `${Math.round((passed / completed) * 100)}%`
      : "0%";
  } catch (error) {
    console.error("Error updating statistics:", error);
  }
}

// Render Functions
function renderInterviews() {
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageInterviews = currentInterviews.slice(start, end);

  const interviewsTableBody = document.getElementById("interviewsTableBody");
  interviewsTableBody.innerHTML = pageInterviews
    .map(
      (interview) => `
        <tr>
            <td>${interview.applicantName}</td>
            <td>${formatDateTime(interview.dateTime)}</td>
            <td>${interview.type}</td>
            <td>${interview.interviewer}</td>
            <td>
                <span class="status-badge status-${interview.status.toLowerCase()}">
                    ${interview.status}
                </span>
            </td>
            <td>${interview.score ? interview.score.toFixed(1) : "-"}</td>
            <td>
                <button class="btn-icon view-details-btn" onclick="viewDetails('${
                  interview.id
                }')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-icon" onclick="editInterview('${
                  interview.id
                }')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon" onclick="deleteInterview('${
                  interview.id
                }')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `
    )
    .join("");
}

function updatePagination() {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(start + itemsPerPage - 1, totalItems);

  const startCount = document.getElementById("startCount");
  const endCount = document.getElementById("endCount");
  const totalCount = document.getElementById("totalCount");

  startCount.textContent = totalItems ? start : 0;
  endCount.textContent = end;
  totalCount.textContent = totalItems;

  prevPage.disabled = currentPage === 1;
  nextPage.disabled = currentPage === totalPages;

  renderPageNumbers(totalPages);
}

function renderPageNumbers(totalPages) {
  const pageNumbers = document.getElementById("pageNumbers");
  pageNumbers.innerHTML = "";
  for (let i = 1; i <= totalPages; i++) {
    const button = document.createElement("button");
    button.className = `btn-page ${i === currentPage ? "active" : ""}`;
    button.textContent = i;
    button.addEventListener("click", () => changePage(i));
    pageNumbers.appendChild(button);
  }
}

// Event Handlers
async function handleSearch() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  filterInterviews();
}

async function handleFilters() {
  filterInterviews();
}

function filterInterviews() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const status = document.getElementById("statusFilter").value;
  const date = document.getElementById("dateFilter").value;

  const filtered = currentInterviews.filter((interview) => {
    const matchesSearch = interview.applicantName
      .toLowerCase()
      .includes(searchTerm);
    const matchesStatus = !status || interview.status === status;
    const matchesDate = !date || isDateMatch(interview.dateTime, date);
    return matchesSearch && matchesStatus && matchesDate;
  });

  currentInterviews = filtered;
  currentPage = 1;
  totalItems = filtered.length;
  updatePagination();
  renderInterviews();
}

// Utility Functions
function formatDateTime(dateTime) {
  const date = new Date(dateTime);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isDateMatch(dateTime, filter) {
  const date = new Date(dateTime);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  switch (filter) {
    case "today":
      return date.setHours(0, 0, 0, 0) === today.getTime();
    case "week":
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      return date >= weekStart && date <= weekEnd;
    case "month":
      return (
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    default:
      return true;
  }
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function showLoading(show) {
  loadingSpinner.style.display = show ? "flex" : "none";
}

function showError(message) {
  // Implement error toast/notification
  console.error(message);
}

function showSuccess(message) {
  // Implement success toast/notification
  console.log(message);
}

function closeModals() {
  scheduleModal.style.display = "none";
  detailsModal.style.display = "none";
}

function handleOutsideClick(e) {
  if (e.target === scheduleModal) scheduleModal.style.display = "none";
  if (e.target === detailsModal) detailsModal.style.display = "none";
}

// Make functions available globally
window.viewDetails = async (id) => {
  selectedInterviewId = id;
  await loadInterviewDetails(id);
  detailsModal.style.display = "block";
};

window.editInterview = (id) => {
  // Implement edit functionality
};

window.deleteInterview = async (id) => {
  if (!confirm("Are you sure you want to delete this interview?")) return;

  try {
    showLoading(true);
    await db.collection("interviews").doc(id).delete();
    await loadInterviews();
    showSuccess("Interview deleted successfully");
  } catch (error) {
    console.error("Error deleting interview:", error);
    showError("Failed to delete interview");
  } finally {
    showLoading(false);
  }
};

// Export functionality
async function handleExport() {
  try {
    showLoading(true);
    const data = currentInterviews.map((interview) => ({
      "Applicant Name": interview.applicantName,
      "Date & Time": formatDateTime(interview.dateTime),
      Type: interview.type,
      Interviewer: interview.interviewer,
      Status: interview.status,
      Score: interview.score || "-",
    }));

    const csv = convertToCSV(data);
    downloadCSV(csv, "interviews_export.csv");
    showSuccess("Export completed successfully");
  } catch (error) {
    console.error("Error exporting data:", error);
    showError("Failed to export data");
  } finally {
    showLoading(false);
  }
}

function convertToCSV(data) {
  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers.map((header) => JSON.stringify(row[header] || "")).join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}

function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}
