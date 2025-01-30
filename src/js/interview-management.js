// Initialize Firebase
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";

import { db } from "./firebase-config.js";

// Global Variables
let interviews = [];
let currentPage = 1;
const itemsPerPage = 10;

// Initialize interview data
async function initializeInterviews() {
  try {
    const interviewsRef = collection(db, "interviews");
    const querySnapshot = await getDocs(interviewsRef);
    interviews = [];
    querySnapshot.forEach((doc) => {
      interviews.push({ id: doc.id, ...doc.data() });
    });
    updateStatistics();
    renderInterviews();
    loadApplicants();
    loadInterviewers();
  } catch (error) {
    console.error("Error initializing interviews:", error);
    showNotification("Error loading interviews", "error");
  }
}

// Update statistics
function updateStatistics() {
  const today = new Date().toDateString();

  const todayCount = interviews.filter(
    (interview) => new Date(interview.date).toDateString() === today
  ).length;

  const pendingCount = interviews.filter(
    (interview) =>
      interview.status === "scheduled" || interview.status === "ongoing"
  ).length;

  const completedCount = interviews.filter(
    (interview) => interview.status === "completed"
  ).length;

  const passedCount = interviews.filter(
    (interview) =>
      interview.status === "completed" && interview.recommendation === "hire"
  ).length;

  const passRate = completedCount
    ? Math.round((passedCount / completedCount) * 100)
    : 0;

  document.getElementById("todayInterviews").textContent = todayCount;
  document.getElementById("pendingInterviews").textContent = pendingCount;
  document.getElementById("completedInterviews").textContent = completedCount;
  document.getElementById("passRate").textContent = passRate + "%";
}

// Render interviews table
function renderInterviews() {
  const tableBody = document.getElementById("interviewsTableBody");
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const filteredInterviews = filterInterviews();
  const paginatedInterviews = filteredInterviews.slice(startIndex, endIndex);

  tableBody.innerHTML = "";
  paginatedInterviews.forEach((interview) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td><input type="checkbox" class="interview-checkbox" value="${
              interview.id
            }"></td>
            <td>${interview.applicantName}</td>
            <td>${formatDateTime(interview.date)}</td>
            <td>${interview.duration} mins</td>
            <td>${interview.interviewer}</td>
            <td><span class="status-badge status-${interview.status}">${
      interview.status
    }</span></td>
            <td>${interview.score || "-"}</td>
            <td>
                <button class="btn-view" onclick="viewInterview('${
                  interview.id
                }')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-edit" onclick="editInterview('${
                  interview.id
                }')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" onclick="deleteInterview('${
                  interview.id
                }')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
    tableBody.appendChild(row);
  });

  updatePagination(filteredInterviews.length);
}

// Filter interviews
function filterInterviews() {
  const searchTerm = document
    .getElementById("interviewSearch")
    .value.toLowerCase();
  const statusFilter = document.getElementById("statusFilter").value;
  const dateFilter = document.getElementById("dateFilter").value;

  return interviews.filter((interview) => {
    const matchesSearch =
      interview.applicantName.toLowerCase().includes(searchTerm) ||
      interview.interviewer.toLowerCase().includes(searchTerm);
    const matchesStatus = !statusFilter || interview.status === statusFilter;
    const matchesDate = filterByDate(interview.date, dateFilter);

    return matchesSearch && matchesStatus && matchesDate;
  });
}

// Filter by date helper
function filterByDate(interviewDate, filter) {
  if (!filter) return true;

  const date = new Date(interviewDate);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  switch (filter) {
    case "today":
      return date.toDateString() === today.toDateString();
    case "tomorrow":
      return date.toDateString() === tomorrow.toDateString();
    case "week":
      const weekEnd = new Date(today);
      weekEnd.setDate(weekEnd.getDate() + 7);
      return date >= today && date <= weekEnd;
    case "month":
      return (
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    default:
      return true;
  }
}

// Schedule new interview
async function scheduleInterview() {
  const form = document.getElementById("scheduleForm");
  const formData = new FormData(form);

  try {
    const interviewData = {
      applicantName:
        document.getElementById("applicantSelect").options[
          document.getElementById("applicantSelect").selectedIndex
        ].text,
      applicantId: formData.get("applicantSelect"),
      date: new Date(
        formData.get("interviewDate") + "T" + formData.get("interviewTime")
      ).toISOString(),
      duration: parseInt(formData.get("duration")),
      interviewer:
        document.getElementById("interviewerSelect").options[
          document.getElementById("interviewerSelect").selectedIndex
        ].text,
      interviewerId: formData.get("interviewerSelect"),
      type: formData.get("interviewType"),
      notes: formData.get("notes"),
      status: "scheduled",
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, "interviews"), interviewData);
    interviews.push({ id: docRef.id, ...interviewData });

    closeModal("scheduleModal");
    showNotification("Interview scheduled successfully", "success");
    updateStatistics();
    renderInterviews();
  } catch (error) {
    console.error("Error scheduling interview:", error);
    showNotification("Error scheduling interview", "error");
  }
}

// View interview details
async function viewInterview(interviewId) {
  const interview = interviews.find((i) => i.id === interviewId);
  if (!interview) return;

  // Populate overview tab
  document.getElementById("detailApplicantName").textContent =
    interview.applicantName;
  document.getElementById("detailApplicantEmail").textContent =
    interview.applicantEmail || "-";
  document.getElementById("detailApplicantPhone").textContent =
    interview.applicantPhone || "-";
  document.getElementById("detailDateTime").textContent = formatDateTime(
    interview.date
  );
  document.getElementById(
    "detailDuration"
  ).textContent = `${interview.duration} minutes`;
  document.getElementById("detailType").textContent = interview.type;
  document.getElementById("detailInterviewer").textContent =
    interview.interviewer;
  document.getElementById("detailStatus").textContent = interview.status;

  // Populate evaluation tab if completed
  if (interview.status === "completed") {
    populateEvaluation(interview);
  }

  // Populate notes
  renderNotes(interview.notes || []);

  document.getElementById("detailsModal").style.display = "block";
}

// Save evaluation
async function saveEvaluation() {
  const interviewId = document.querySelector("[data-interview-id]").dataset
    .interviewId;
  const interview = interviews.find((i) => i.id === interviewId);

  try {
    const evaluationData = {
      technicalSkills: {
        problemSolving: parseInt(
          document.querySelector('input[name="problemSolving"]:checked').value
        ),
        technicalKnowledge: parseInt(
          document.querySelector('input[name="technicalKnowledge"]:checked')
            .value
        ),
      },
      softSkills: {
        communication: parseInt(
          document.querySelector('input[name="communication"]:checked').value
        ),
        attitude: parseInt(
          document.querySelector('input[name="attitude"]:checked').value
        ),
      },
      notes: document.getElementById("evaluationNotes").value,
      recommendation: document.getElementById("recommendation").value,
      status: "completed",
      completedAt: new Date().toISOString(),
    };

    await updateDoc(doc(db, "interviews", interviewId), evaluationData);
    Object.assign(interview, evaluationData);

    closeModal("detailsModal");
    showNotification("Evaluation saved successfully", "success");
    updateStatistics();
    renderInterviews();
  } catch (error) {
    console.error("Error saving evaluation:", error);
    showNotification("Error saving evaluation", "error");
  }
}

// Add note
async function addNote() {
  const interviewId = document.querySelector("[data-interview-id]").dataset
    .interviewId;
  const noteText = document.getElementById("newNote").value.trim();

  if (!noteText) return;

  try {
    const note = {
      text: noteText,
      createdAt: new Date().toISOString(),
      createdBy: "Admin", // Replace with actual user name
    };

    const interview = interviews.find((i) => i.id === interviewId);
    const notes = [...(interview.notes || []), note];

    await updateDoc(doc(db, "interviews", interviewId), { notes });
    interview.notes = notes;

    document.getElementById("newNote").value = "";
    renderNotes(notes);
    showNotification("Note added successfully", "success");
  } catch (error) {
    console.error("Error adding note:", error);
    showNotification("Error adding note", "error");
  }
}

// Helper Functions
function formatDateTime(dateString) {
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString("en-US", options);
}

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

function closeModal(modalId) {
  document.getElementById(modalId).style.display = "none";
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  initializeInterviews();

  // Search and filter events
  document.getElementById("interviewSearch").addEventListener("input", () => {
    currentPage = 1;
    renderInterviews();
  });

  document.getElementById("statusFilter").addEventListener("change", () => {
    currentPage = 1;
    renderInterviews();
  });

  document.getElementById("dateFilter").addEventListener("change", () => {
    currentPage = 1;
    renderInterviews();
  });

  // Modal close events
  document.querySelectorAll(".btn-close").forEach((button) => {
    button.addEventListener("click", () => {
      button.closest(".modal").style.display = "none";
    });
  });

  // Close modal when clicking outside
  window.addEventListener("click", (event) => {
    if (event.target.classList.contains("modal")) {
      event.target.style.display = "none";
    }
  });

  // Tab switching
  document.querySelectorAll(".tab-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const targetTab = button.dataset.tab;

      document
        .querySelectorAll(".tab-btn")
        .forEach((btn) => btn.classList.remove("active"));
      document
        .querySelectorAll(".tab-pane")
        .forEach((pane) => pane.classList.remove("active"));

      button.classList.add("active");
      document.getElementById(targetTab).classList.add("active");
    });
  });

  // Select all checkbox
  document.getElementById("selectAll").addEventListener("change", (e) => {
    document
      .querySelectorAll(".interview-checkbox")
      .forEach((checkbox) => (checkbox.checked = e.target.checked));
  });
});
