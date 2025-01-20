// Exam Management
let exams = [];
let currentPage = 1;
const itemsPerPage = 10;

// Initialize exam data
function initializeExams() {
    // Fetch exams data from Firebase
    const examsRef = firebase.firestore().collection('exams');
    examsRef.onSnapshot((snapshot) => {
        exams = [];
        snapshot.forEach((doc) => {
            exams.push({ id: doc.id, ...doc.data() });
        });
        updateStatistics();
        renderExams();
    });
}

// Update statistics cards
function updateStatistics() {
    const total = exams.length;
    const active = exams.filter(e => e.status === 'active').length;
    const completedToday = exams.filter(e => {
        const today = new Date().toDateString();
        return e.status === 'completed' && new Date(e.completedDate).toDateString() === today;
    }).length;

    // Calculate average score
    const scores = exams.flatMap(e => e.participantScores || []);
    const avgScore = scores.length ? 
        Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    document.getElementById('totalExams').textContent = total;
    document.getElementById('activeExaminees').textContent = active;
    document.getElementById('completedToday').textContent = completedToday;
    document.getElementById('averageScore').textContent = avgScore + '%';
}

// Render exams table
function renderExams() {
    const tableBody = document.getElementById('examsTableBody');
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const filteredExams = filterExams();
    const paginatedExams = filteredExams.slice(startIndex, endIndex);

    tableBody.innerHTML = '';
    paginatedExams.forEach(exam => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="checkbox" class="exam-checkbox" value="${exam.id}"></td>
            <td>${exam.id}</td>
            <td>${exam.title}</td>
            <td>${exam.type}</td>
            <td><span class="status-badge status-${exam.status}">${exam.status}</span></td>
            <td>${new Date(exam.date).toLocaleDateString()}</td>
            <td>${exam.duration} mins</td>
            <td>${exam.participants || 0}</td>
            <td>
                <button class="btn-view" onclick="viewExam('${exam.id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-edit" onclick="editExam('${exam.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" onclick="deleteExam('${exam.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    updatePagination(filteredExams.length);
}

// Filter exams based on search and filters
function filterExams() {
    const searchTerm = document.getElementById('examSearch').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const typeFilter = document.getElementById('typeFilter').value;

    return exams.filter(exam => {
        const matchesSearch = exam.title.toLowerCase().includes(searchTerm);
        const matchesStatus = !statusFilter || exam.status === statusFilter;
        const matchesType = !typeFilter || exam.type === typeFilter;

        return matchesSearch && matchesStatus && matchesType;
    });
}

// Update pagination
function updatePagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const pagination = document.querySelector('.pagination');
    const pageNumbers = pagination.querySelector('.page-numbers');
    const prevBtn = pagination.querySelector('button:first-child');
    const nextBtn = pagination.querySelector('button:last-child');

    // Update showing entries text
    const startIndex = (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(startIndex + itemsPerPage - 1, totalItems);
    document.getElementById('showingStart').textContent = totalItems ? startIndex : 0;
    document.getElementById('showingEnd').textContent = endIndex;
    document.getElementById('totalEntries').textContent = totalItems;

    // Update pagination buttons
    pageNumbers.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.className = `btn-page${i === currentPage ? ' active' : ''}`;
        button.textContent = i;
        button.onclick = () => {
            currentPage = i;
            renderExams();
        };
        pageNumbers.appendChild(button);
    }

    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;

    prevBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            renderExams();
        }
    };

    nextBtn.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderExams();
        }
    };
}

// View exam details
function viewExam(examId) {
    const exam = exams.find(e => e.id === examId);
    if (!exam) return;

    // Update modal content
    document.getElementById('examTitle').textContent = exam.title;
    document.getElementById('examStatus').className = `status-badge status-${exam.status}`;
    document.getElementById('examStatus').textContent = exam.status;

    // Overview Information
    document.getElementById('examType').textContent = exam.type;
    document.getElementById('examDuration').textContent = `${exam.duration} minutes`;
    document.getElementById('totalQuestions').textContent = exam.questions?.length || 0;
    document.getElementById('passingScore').textContent = `${exam.passingScore}%`;
    document.getElementById('startDate').textContent = new Date(exam.startDate).toLocaleString();
    document.getElementById('endDate').textContent = new Date(exam.endDate).toLocaleString();

    // Performance Summary
    document.getElementById('totalParticipants').textContent = exam.participants || 0;
    document.getElementById('avgScore').textContent = 
        exam.participantScores?.length ? 
        Math.round(exam.participantScores.reduce((a, b) => a + b, 0) / exam.participantScores.length) + '%' : 
        '0%';
    document.getElementById('passRate').textContent = 
        exam.participants ? 
        Math.round((exam.passedCount || 0) / exam.participants * 100) + '%' : 
        '0%';

    // Show modal
    const modal = document.getElementById('examModal');
    modal.style.display = 'block';
}

// Edit exam
async function editExam(examId) {
    window.location.href = `create-exam.html?id=${examId}`;
}

// Delete exam
async function deleteExam(examId) {
    if (!confirm('Are you sure you want to delete this exam?')) return;

    try {
        await firebase.firestore().collection('exams').doc(examId).delete();
        showNotification('Exam deleted successfully', 'success');
    } catch (error) {
        console.error('Error deleting exam:', error);
        showNotification('Error deleting exam', 'error');
    }
}

// Export exam data
function exportExamData() {
    const filteredExams = filterExams();
    const csvContent = convertToCSV(filteredExams);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `exams_export_${new Date().toISOString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Convert exams data to CSV
function convertToCSV(exams) {
    const headers = [
        'ID',
        'Title',
        'Type',
        'Status',
        'Date',
        'Duration',
        'Participants',
        'Average Score',
        'Pass Rate'
    ];

    const rows = exams.map(exam => [
        exam.id,
        exam.title,
        exam.type,
        exam.status,
        new Date(exam.date).toLocaleDateString(),
        exam.duration,
        exam.participants || 0,
        exam.participantScores?.length ? 
            Math.round(exam.participantScores.reduce((a, b) => a + b, 0) / exam.participantScores.length) + '%' : 
            '0%',
        exam.participants ? 
            Math.round((exam.passedCount || 0) / exam.participants * 100) + '%' : 
            '0%'
    ]);

    return [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    initializeExams();

    // Search and filter events
    document.getElementById('examSearch').addEventListener('input', () => {
        currentPage = 1;
        renderExams();
    });

    document.getElementById('statusFilter').addEventListener('change', () => {
        currentPage = 1;
        renderExams();
    });

    document.getElementById('typeFilter').addEventListener('change', () => {
        currentPage = 1;
        renderExams();
    });

    // Modal close events
    document.querySelector('.btn-close').addEventListener('click', () => {
        document.getElementById('examModal').style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        const modal = document.getElementById('examModal');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Tab switching
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;
            
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });

    // Select all checkbox
    document.getElementById('selectAll').addEventListener('change', (e) => {
        const checkboxes = document.querySelectorAll('.exam-checkbox');
        checkboxes.forEach(checkbox => checkbox.checked = e.target.checked);
    });
});

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }, 100);
}
