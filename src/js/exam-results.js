// Initialize Firebase components
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// DOM Elements
const examDate = document.getElementById('examDate');
const examDuration = document.getElementById('examDuration');
const examStatus = document.getElementById('examStatus');
const scoreChart = document.getElementById('scoreChart');

// Chart Configuration
let chart = null;

// Initialize Results Page
async function initializeResults() {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            await loadExamResults(user.uid);
        } else {
            window.location.href = '../login.html';
        }
    });
}

// Load Exam Results from Firebase
async function loadExamResults(userId) {
    try {
        const examResultsRef = doc(db, 'examResults', userId);
        const examResultsDoc = await getDoc(examResultsRef);

        if (examResultsDoc.exists()) {
            const results = examResultsDoc.data();
            updateResultsDisplay(results);
            createScoreChart(results.sectionScores);
            updateFeedback(results.feedback);
            checkNextSteps(results);
        } else {
            console.error('No exam results found');
            // Handle case where results don't exist
        }
    } catch (error) {
        console.error('Error loading exam results:', error);
        // Handle error appropriately
    }
}

// Update Results Display
function updateResultsDisplay(results) {
    // Update meta information
    examDate.textContent = new Date(results.completedAt).toLocaleDateString();
    examDuration.textContent = formatDuration(results.duration);
    
    const passed = results.totalScore >= results.passingScore;
    examStatus.textContent = passed ? 'Passed' : 'Failed';
    examStatus.className = passed ? 'status-passed' : 'status-failed';

    // Update section scores
    Object.entries(results.sectionScores).forEach(([section, score]) => {
        const sectionCard = document.querySelector(`.section-card[data-section="${section}"]`);
        if (sectionCard) {
            sectionCard.querySelector('.section-score').textContent = `${score.obtained}/${score.total}`;
            sectionCard.querySelector('.progress').style.width = `${(score.obtained/score.total) * 100}%`;
            
            const details = sectionCard.querySelector('.section-details');
            updateSectionDetails(details, score);
        }
    });
}

// Create Score Distribution Chart
function createScoreChart(sectionScores) {
    const ctx = scoreChart.getContext('2d');
    
    // Destroy existing chart if it exists
    if (chart) {
        chart.destroy();
    }

    const sections = Object.keys(sectionScores);
    const scores = sections.map(section => 
        (sectionScores[section].obtained / sectionScores[section].total) * 100
    );

    chart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: sections.map(formatSectionName),
            datasets: [{
                label: 'Score Percentage',
                data: scores,
                backgroundColor: 'rgba(52, 152, 219, 0.2)',
                borderColor: 'rgba(52, 152, 219, 1)',
                pointBackgroundColor: 'rgba(52, 152, 219, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(52, 152, 219, 1)'
            }]
        },
        options: {
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        stepSize: 20
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// Update Section Details
function updateSectionDetails(detailsElement, score) {
    const details = [];

    switch (score.type) {
        case 'multipleChoice':
            details.push(
                `Correct Answers: ${score.correct}`,
                `Incorrect Answers: ${score.incorrect}`,
                `Accuracy: ${((score.correct / (score.correct + score.incorrect)) * 100).toFixed(1)}%`
            );
            break;
        case 'essay':
            details.push(
                `Content Score: ${score.contentScore}/5`,
                `Structure Score: ${score.structureScore}/5`,
                `Average Score: ${((score.obtained / score.total) * 100).toFixed(1)}%`
            );
            break;
        case 'coding':
            details.push(
                `Test Cases Passed: ${score.testCasesPassed}/${score.totalTestCases}`,
                `Code Quality: ${score.codeQuality}/5`,
                `Overall Score: ${((score.obtained / score.total) * 100).toFixed(1)}%`
            );
            break;
        case 'enumeration':
            details.push(
                `Correct Items: ${score.correctItems}/${score.totalItems}`,
                `Partial Credit: ${score.partialCredit}`,
                `Accuracy: ${((score.obtained / score.total) * 100).toFixed(1)}%`
            );
            break;
    }

    detailsElement.innerHTML = details.map(detail => `<p>${detail}</p>`).join('');
}

// Update Feedback Section
function updateFeedback(feedback) {
    const strengthsList = document.querySelector('.feedback-item:first-child ul');
    const improvementsList = document.querySelector('.feedback-item:last-child ul');

    strengthsList.innerHTML = feedback.strengths
        .map(strength => `<li>${strength}</li>`)
        .join('');

    improvementsList.innerHTML = feedback.improvements
        .map(improvement => `<li>${improvement}</li>`)
        .join('');
}

// Check Next Steps
function checkNextSteps(results) {
    const scheduleBtn = document.querySelector('.schedule-btn');
    const reviewBtn = document.querySelector('.review-btn');

    if (results.totalScore >= results.passingScore) {
        scheduleBtn.addEventListener('click', () => {
            window.location.href = 'schedule-interview.html';
        });

        reviewBtn.addEventListener('click', () => {
            window.location.href = 'study-materials.html';
        });
    } else {
        const stepCards = document.querySelectorAll('.step-card');
        stepCards.forEach(card => {
            card.innerHTML = `
                <i class="fas fa-books"></i>
                <h3>Review Materials</h3>
                <p>Review the study materials and try again in the next screening period.</p>
                <button class="review-btn">Access Materials</button>
            `;
        });
    }
}

// Utility Functions
function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
}

function formatSectionName(section) {
    return section
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase());
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeResults);

// Event Listeners for Next Steps
document.querySelector('.schedule-btn').addEventListener('click', async () => {
    try {
        // Check if user is authenticated
        const user = auth.currentUser;
        if (!user) {
            window.location.href = '../login.html';
            return;
        }

        // Get available interview slots
        const slotsRef = doc(db, 'interviewSlots', 'available');
        const slotsDoc = await getDoc(slotsRef);

        if (slotsDoc.exists()) {
            window.location.href = 'schedule-interview.html';
        } else {
            alert('No interview slots available at the moment. Please try again later.');
        }
    } catch (error) {
        console.error('Error checking interview slots:', error);
        alert('Error checking interview availability. Please try again later.');
    }
});

document.querySelector('.review-btn').addEventListener('click', () => {
    // Redirect to study materials page
    window.location.href = 'study-materials.html';
});
