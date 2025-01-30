<template>
  <div class="admin-container">
    <Sidebar />
    <!-- Main Content -->
    <main class="main-content">
      <!-- Header -->
      <header class="content-header">
        <div class="header-left">
          <h1>Interview Management</h1>
        </div>
        <div class="header-actions">
          <button id="scheduleBtn" class="btn btn-primary">
            <i class="fas fa-plus"></i> Schedule Interview
          </button>
          <button id="exportBtn" class="btn btn-secondary">
            <i class="fas fa-download"></i> Export Data
          </button>
        </div>
      </header>

      <!-- Statistics Cards -->
      <section class="stats-section">
        <div class="stat-card">
          <i class="fas fa-calendar-check"></i>
          <div class="stat-info">
            <h3>Today's Interviews</h3>
            <p id="todayCount">0</p>
          </div>
        </div>
        <div class="stat-card">
          <i class="fas fa-clock"></i>
          <div class="stat-info">
            <h3>Pending</h3>
            <p id="pendingCount">0</p>
          </div>
        </div>
        <div class="stat-card">
          <i class="fas fa-check-circle"></i>
          <div class="stat-info">
            <h3>Completed</h3>
            <p id="completedCount">0</p>
          </div>
        </div>
        <div class="stat-card">
          <i class="fas fa-chart-line"></i>
          <div class="stat-info">
            <h3>Pass Rate</h3>
            <p id="passRate">0%</p>
          </div>
        </div>
      </section>

      <!-- Filters -->
      <section class="filters-section">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input
            type="text"
            id="searchInput"
            placeholder="Search applicants..."
          />
        </div>
        <div class="filter-group">
          <select id="statusFilter">
            <option value="">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select id="dateFilter">
            <option value="">All Dates</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </section>

      <!-- Interviews Table -->
      <section class="table-section">
        <div class="table-container">
          <table id="interviewsTable">
            <thead>
              <tr>
                <th>Applicant Name</th>
                <th>Date & Time</th>
                <th>Type</th>
                <th>Interviewer</th>
                <th>Status</th>
                <th>Score</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="interviewsTableBody">
              <!-- Populated by JavaScript -->
            </tbody>
          </table>
        </div>
        <!-- Pagination -->
        <div class="pagination">
          <span class="pagination-info"
            >Showing <span id="startCount">0</span> to
            <span id="endCount">0</span> of <span id="totalCount">0</span></span
          >
          <div class="pagination-controls">
            <button id="prevPage" class="btn-page">
              <i class="fas fa-chevron-left"></i>
            </button>
            <div id="pageNumbers" class="page-numbers">
              <!-- Populated by JavaScript -->
            </div>
            <button id="nextPage" class="btn-page">
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </section>
    </main>
  </div>
  <!-- Schedule Interview Modal -->
  <div id="scheduleModal" class="modal">
    <div class="modal-content">
      <div class="modal-header">
        <h2><i class="fas fa-calendar-plus"></i> Schedule Interview</h2>
        <button class="close-modal"><i class="fas fa-times"></i></button>
      </div>
      <div class="modal-body">
        <form id="scheduleForm">
          <div class="form-group">
            <label for="applicantSelect">Applicant</label>
            <select id="applicantSelect" required>
              <!-- Populated by JavaScript -->
            </select>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="interviewDate">Date</label>
              <input type="date" id="interviewDate" required />
            </div>
            <div class="form-group">
              <label for="interviewTime">Time</label>
              <input type="time" id="interviewTime" required />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="interviewType">Type</label>
              <select id="interviewType" required>
                <option value="">Select Type</option>
                <option value="initial">Initial Interview</option>
                <option value="technical">Technical Interview</option>
                <option value="final">Final Interview</option>
              </select>
            </div>
            <div class="form-group">
              <label for="interviewer">Interviewer</label>
              <select id="interviewer" required>
                <!-- Populated by JavaScript -->
              </select>
            </div>
          </div>
          <div class="form-group">
            <label for="notes">Notes (Optional)</label>
            <textarea id="notes" rows="3"></textarea>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" data-dismiss="modal">Cancel</button>
        <button class="btn btn-primary" id="saveScheduleBtn">Schedule</button>
      </div>
    </div>
  </div>

  <!-- Interview Details Modal -->
  <div id="detailsModal" class="modal">
    <div class="modal-content">
      <div class="modal-header">
        <h2><i class="fas fa-info-circle"></i> Interview Details</h2>
        <button class="close-modal"><i class="fas fa-times"></i></button>
      </div>
      <div class="modal-body">
        <div class="tabs">
          <button class="tab-btn active" data-tab="details">Details</button>
          <button class="tab-btn" data-tab="evaluation">Evaluation</button>
          <button class="tab-btn" data-tab="notes">Notes</button>
        </div>

        <!-- Details Tab -->
        <div id="detailsTab" class="tab-content active">
          <div class="details-grid">
            <div class="detail-item">
              <label>Applicant</label>
              <p id="detailApplicant"></p>
            </div>
            <div class="detail-item">
              <label>Schedule</label>
              <p id="detailSchedule"></p>
            </div>
            <div class="detail-item">
              <label>Type</label>
              <p id="detailType"></p>
            </div>
            <div class="detail-item">
              <label>Interviewer</label>
              <p id="detailInterviewer"></p>
            </div>
            <div class="detail-item">
              <label>Status</label>
              <p id="detailStatus"></p>
            </div>
          </div>
        </div>

        <!-- Evaluation Tab -->
        <div id="evaluationTab" class="tab-content">
          <form id="evaluationForm">
            <div class="evaluation-section">
              <h3>Technical Skills</h3>
              <div class="rating-group">
                <label>Problem Solving</label>
                <div class="rating">
                  <input type="radio" name="problemSolving" value="1" /> 1
                  <input type="radio" name="problemSolving" value="2" /> 2
                  <input type="radio" name="problemSolving" value="3" /> 3
                  <input type="radio" name="problemSolving" value="4" /> 4
                  <input type="radio" name="problemSolving" value="5" /> 5
                </div>
              </div>
              <div class="rating-group">
                <label>Technical Knowledge</label>
                <div class="rating">
                  <input type="radio" name="technicalKnowledge" value="1" /> 1
                  <input type="radio" name="technicalKnowledge" value="2" /> 2
                  <input type="radio" name="technicalKnowledge" value="3" /> 3
                  <input type="radio" name="technicalKnowledge" value="4" /> 4
                  <input type="radio" name="technicalKnowledge" value="5" /> 5
                </div>
              </div>
            </div>

            <div class="evaluation-section">
              <h3>Soft Skills</h3>
              <div class="rating-group">
                <label>Communication</label>
                <div class="rating">
                  <input type="radio" name="communication" value="1" /> 1
                  <input type="radio" name="communication" value="2" /> 2
                  <input type="radio" name="communication" value="3" /> 3
                  <input type="radio" name="communication" value="4" /> 4
                  <input type="radio" name="communication" value="5" /> 5
                </div>
              </div>
              <div class="rating-group">
                <label>Attitude</label>
                <div class="rating">
                  <input type="radio" name="attitude" value="1" /> 1
                  <input type="radio" name="attitude" value="2" /> 2
                  <input type="radio" name="attitude" value="3" /> 3
                  <input type="radio" name="attitude" value="4" /> 4
                  <input type="radio" name="attitude" value="5" /> 5
                </div>
              </div>
            </div>

            <div class="form-group">
              <label for="evaluationNotes">Evaluation Notes</label>
              <textarea id="evaluationNotes" rows="4"></textarea>
            </div>
          </form>
        </div>

        <!-- Notes Tab -->
        <div id="notesTab" class="tab-content">
          <div class="notes-container">
            <div class="notes-list" id="notesList">
              <!-- Populated by JavaScript -->
            </div>
            <div class="add-note">
              <textarea id="newNote" placeholder="Add a note..."></textarea>
              <button class="btn btn-primary" id="addNoteBtn">Add Note</button>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" data-dismiss="modal">Close</button>
        <button class="btn btn-primary" id="saveEvaluationBtn">
          Save Changes
        </button>
      </div>
    </div>
  </div>

  <!-- Loading Spinner -->
  <div id="loadingSpinner" class="loading-spinner">
    <div class="spinner"></div>
    <p>Loading...</p>
  </div>
</template>
<script setup>
import Sidebar from "@/views/admin/components/Sidebar.vue";
</script>
