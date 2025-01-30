<template>
  <Sidebar />
  <!-- Main Content -->
  <main class="main-content">
    <!-- Header -->
    <header class="content-header">
      <div class="header-left">
        <h1>Exam Management</h1>
      </div>
      <div class="header-right">
        <button class="btn-create" onclick="location.href='create-exam.html'">
          <i class="fas fa-plus"></i> Create New Exam
        </button>
      </div>
    </header>

    <!-- Exam Statistics -->
    <section class="stats-section">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-file-alt"></i>
          </div>
          <div class="stat-info">
            <h3>Total Exams</h3>
            <p class="stat-number" id="totalExams">0</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-users"></i>
          </div>
          <div class="stat-info">
            <h3>Active Examinees</h3>
            <p class="stat-number" id="activeExaminees">0</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-info">
            <h3>Completed Today</h3>
            <p class="stat-number" id="completedToday">0</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-chart-line"></i>
          </div>
          <div class="stat-info">
            <h3>Average Score</h3>
            <p class="stat-number" id="averageScore">0%</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Exam Management Section -->
    <section class="exam-section">
      <div class="section-header">
        <div class="search-filters">
          <div class="search-box">
            <input type="text" id="examSearch" placeholder="Search exams..." />
            <i class="fas fa-search"></i>
          </div>
          <div class="filter-group">
            <select id="statusFilter">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
            <select id="typeFilter">
              <option value="">All Types</option>
              <option value="entrance">Entrance Exam</option>
              <option value="aptitude">Aptitude Test</option>
              <option value="placement">Placement Test</option>
            </select>
          </div>
        </div>
        <div class="action-buttons">
          <button class="btn-export" onclick="exportExamData()">
            <i class="fas fa-download"></i> Export Data
          </button>
        </div>
      </div>

      <!-- Exams Table -->
      <div class="table-container">
        <table class="exams-table">
          <thead>
            <tr>
              <th>
                <input type="checkbox" id="selectAll" />
              </th>
              <th>Exam ID</th>
              <th>Title</th>
              <th>Type</th>
              <th>Status</th>
              <th>Date</th>
              <th>Duration</th>
              <th>Participants</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="examsTableBody">
            <!-- Table rows will be dynamically populated -->
          </tbody>
        </table>
        <div class="table-footer">
          <div class="table-info">
            Showing <span id="showingStart">0</span> to
            <span id="showingEnd">0</span> of
            <span id="totalEntries">0</span> entries
          </div>
          <div class="pagination">
            <button class="btn-page" disabled>Previous</button>
            <div class="page-numbers">
              <button class="btn-page active">1</button>
            </div>
            <button class="btn-page">Next</button>
          </div>
        </div>
      </div>
    </section>

    <!-- Exam Details Modal -->
    <div id="examModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Exam Details</h2>
          <button class="btn-close">×</button>
        </div>
        <div class="modal-body">
          <div class="exam-details">
            <div class="details-header">
              <h3 id="examTitle">Loading...</h3>
              <span id="examStatus" class="status-badge">Status</span>
            </div>

            <div class="details-tabs">
              <button class="tab-btn active" data-tab="overview">
                Overview
              </button>
              <button class="tab-btn" data-tab="questions">Questions</button>
              <button class="tab-btn" data-tab="results">Results</button>
              <button class="tab-btn" data-tab="settings">Settings</button>
            </div>

            <div class="tab-content">
              <!-- Overview Tab -->
              <div id="overview" class="tab-pane active">
                <div class="overview-grid">
                  <div class="info-group">
                    <label>Exam Type</label>
                    <p id="examType">Loading...</p>
                  </div>
                  <div class="info-group">
                    <label>Duration</label>
                    <p id="examDuration">Loading...</p>
                  </div>
                  <div class="info-group">
                    <label>Total Questions</label>
                    <p id="totalQuestions">Loading...</p>
                  </div>
                  <div class="info-group">
                    <label>Passing Score</label>
                    <p id="passingScore">Loading...</p>
                  </div>
                  <div class="info-group">
                    <label>Start Date</label>
                    <p id="startDate">Loading...</p>
                  </div>
                  <div class="info-group">
                    <label>End Date</label>
                    <p id="endDate">Loading...</p>
                  </div>
                </div>

                <div class="performance-summary">
                  <h4>Performance Summary</h4>
                  <div class="summary-stats">
                    <div class="stat-item">
                      <span class="stat-label">Total Participants</span>
                      <span class="stat-value" id="totalParticipants">0</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">Average Score</span>
                      <span class="stat-value" id="avgScore">0%</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">Pass Rate</span>
                      <span class="stat-value" id="passRate">0%</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Questions Tab -->
              <div id="questions" class="tab-pane">
                <div class="questions-list">
                  <!-- Questions will be dynamically loaded -->
                </div>
              </div>

              <!-- Results Tab -->
              <div id="results" class="tab-pane">
                <div class="results-filters">
                  <div class="search-box">
                    <input type="text" placeholder="Search participants..." />
                    <i class="fas fa-search"></i>
                  </div>
                  <select>
                    <option value="">All Results</option>
                    <option value="passed">Passed</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
                <div class="results-table">
                  <!-- Results table will be dynamically loaded -->
                </div>
              </div>

              <!-- Settings Tab -->
              <div id="settings" class="tab-pane">
                <form id="examSettingsForm">
                  <div class="settings-grid">
                    <div class="form-group">
                      <label>Time Limit (minutes)</label>
                      <input type="number" id="timeLimit" />
                    </div>
                    <div class="form-group">
                      <label>Passing Score (%)</label>
                      <input type="number" id="passingScoreInput" />
                    </div>
                    <div class="form-group">
                      <label>Shuffle Questions</label>
                      <input type="checkbox" id="shuffleQuestions" />
                    </div>
                    <div class="form-group">
                      <label>Show Results Immediately</label>
                      <input type="checkbox" id="showResults" />
                    </div>
                  </div>
                  <div class="form-actions">
                    <button type="submit" class="btn-save">Save Changes</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>

  <!-- Loading Overlay -->
  <div class="loading-overlay">
    <div class="loading-content">
      <div class="spinner"></div>
      <p>Loading...</p>
    </div>
  </div>
</template>
<script setup>
import { onMounted } from "vue";
import { useExamStore } from "@/stores/admin/exam";
import Sidebar from "@/views/admin/components/Sidebar.vue";

const examStore = useExamStore();

onMounted(() => {
  examStore.initializeExams();
});
</script>
