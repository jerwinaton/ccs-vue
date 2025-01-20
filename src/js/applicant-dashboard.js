// DOM Elements
const menuToggle = document.querySelector('.menu-toggle');
const sidebar = document.querySelector('.sidebar');
const navLinks = document.querySelectorAll('.sidebar-nav a');
const sections = document.querySelectorAll('.dashboard-section');
const logoutBtn = document.getElementById('logoutBtn');

// Toggle sidebar on mobile
menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
});

// Navigation
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetSection = link.getAttribute('data-section');
        
        // Update active states
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        sections.forEach(section => {
            section.classList.remove('active');
            if (section.id === targetSection) {
                section.classList.add('active');
            }
        });

        // Close sidebar on mobile after navigation
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('active');
        }
    });
});

// Notifications
const notifications = document.querySelectorAll('.notification-item');
notifications.forEach(notification => {
    notification.addEventListener('click', () => {
        notification.classList.remove('unread');
    });
});

// Start Exam Button
const startExamBtns = document.querySelectorAll('.start-exam-btn');
startExamBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Here you would typically check if the exam is available and redirect to the exam page
        const examCard = btn.closest('.exam-card');
        const examTitle = examCard.querySelector('h3').textContent;
        
        if (confirm(`Are you ready to start ${examTitle}? Once started, the timer cannot be paused.`)) {
            // Redirect to exam page
            window.location.href = `take-exam.html?exam=${encodeURIComponent(examTitle)}`;
        }
    });
});

// Mock data for demonstration
const mockExamData = {
    generalAssessment: {
        title: 'General Assessment',
        status: 'available',
        duration: '2 hours',
        questions: 50,
        dueDate: 'July 15, 2024'
    },
    codingTest: {
        title: 'Coding Assessment',
        status: 'locked',
        duration: '3 hours',
        problems: 3,
        requirement: 'Complete General Assessment first'
    }
};

// Update exam cards with mock data
function updateExamCards() {
    const examCards = document.querySelectorAll('.exam-card');
    examCards.forEach(card => {
        const examTitle = card.querySelector('h3').textContent;
        const exam = mockExamData[examTitle.toLowerCase().replace(/\s+/g, '')];
        
        if (exam) {
            card.querySelector('.exam-status').textContent = exam.status;
            const info = card.querySelector('.exam-info');
            if (info) {
                info.innerHTML = `
                    <p><i class="fas fa-clock"></i> Duration: ${exam.duration}</p>
                    <p><i class="fas fa-${exam.questions ? 'list' : 'code'}"></i> 
                        ${exam.questions ? `Questions: ${exam.questions}` : `Problems: ${exam.problems}`}</p>
                    <p><i class="fas fa-${exam.dueDate ? 'calendar' : 'lock'}"></i> 
                        ${exam.dueDate || exam.requirement}</p>
                `;
            }
        }
    });
}

// Mock progress data
const mockProgress = {
    registration: {
        status: 'completed',
        date: 'July 1, 2024'
    },
    generalAssessment: {
        status: 'active',
        dueDate: 'July 15, 2024'
    },
    codingTest: {
        status: 'pending',
        message: 'Unlocks after General Assessment'
    },
    interview: {
        status: 'pending',
        message: 'Final Step'
    }
};

// Update progress tracker
function updateProgressTracker() {
    const progressSteps = document.querySelectorAll('.progress-step');
    progressSteps.forEach(step => {
        const stepTitle = step.querySelector('h3').textContent.toLowerCase().replace(/\s+/g, '');
        const progress = mockProgress[stepTitle];
        
        if (progress) {
            if (progress.status === 'completed') {
                step.classList.add('completed');
            } else if (progress.status === 'active') {
                step.classList.add('active');
            }
            
            const statusText = step.querySelector('p');
            if (statusText) {
                if (progress.date) {
                    statusText.textContent = `Completed on ${progress.date}`;
                } else if (progress.dueDate) {
                    statusText.textContent = `Due: ${progress.dueDate}`;
                } else {
                    statusText.textContent = progress.message;
                }
            }
        }
    });
}

// Initialize dashboard
function initializeDashboard() {
    updateExamCards();
    updateProgressTracker();
}

// Call initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeDashboard);

// Logout functionality (to be connected with Firebase)
logoutBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
        // Here you would typically sign out from Firebase
        window.location.href = '../login.html';
    }
});

// Password Change Functionality
const passwordForm = document.getElementById('changePasswordForm');
const passwordInputs = document.querySelectorAll('.password-input input');
const toggleButtons = document.querySelectorAll('.toggle-password');
const strengthBar = document.querySelector('.strength-bar');
const strengthText = document.querySelector('.strength-text');
const requirementItems = document.querySelectorAll('.password-requirements li');

// Toggle password visibility
toggleButtons.forEach(button => {
    button.addEventListener('click', () => {
        const input = button.previousElementSibling;
        const type = input.getAttribute('type');
        input.setAttribute('type', type === 'password' ? 'text' : 'password');
        button.querySelector('i').className = `fas fa-${type === 'password' ? 'eye-slash' : 'eye'}`;
    });
});

// Password strength checker
function checkPasswordStrength(password) {
    let strength = 0;
    const requirements = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    // Update requirement indicators
    requirementItems.forEach(item => {
        const requirement = item.dataset.requirement;
        if (requirements[requirement]) {
            item.classList.add('valid');
            item.querySelector('i').className = 'fas fa-check';
            strength++;
        } else {
            item.classList.remove('valid');
            item.querySelector('i').className = 'fas fa-times';
        }
    });

    // Update strength bar
    const percentage = (strength / 5) * 100;
    strengthBar.style.width = `${percentage}%`;
    strengthBar.style.background = getStrengthColor(percentage);

    // Update strength text
    strengthText.textContent = getStrengthText(percentage);
    strengthText.style.color = getStrengthColor(percentage);

    return strength === 5;
}

function getStrengthColor(percentage) {
    if (percentage <= 20) return '#e74c3c';
    if (percentage <= 40) return '#e67e22';
    if (percentage <= 60) return '#f1c40f';
    if (percentage <= 80) return '#2ecc71';
    return '#27ae60';
}

function getStrengthText(percentage) {
    if (percentage <= 20) return 'Very Weak';
    if (percentage <= 40) return 'Weak';
    if (percentage <= 60) return 'Medium';
    if (percentage <= 80) return 'Strong';
    return 'Very Strong';
}

// Password form submission
passwordForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
        showNotification('Passwords do not match!', 'error');
        return;
    }

    if (!checkPasswordStrength(newPassword)) {
        showNotification('Password does not meet all requirements!', 'error');
        return;
    }

    try {
        const user = auth.currentUser;
        const credential = EmailAuthProvider.credential(
            user.email,
            currentPassword
        );

        // Show loading state
        const submitButton = passwordForm.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
        submitButton.disabled = true;

        // Reauthenticate user
        await reauthenticateWithCredential(user, credential);
        
        // Update password
        await updatePassword(user, newPassword);
        
        // Reset form and show success message
        passwordForm.reset();
        showNotification('Password updated successfully!', 'success');

        // Reset button state
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    } catch (error) {
        console.error('Error updating password:', error);
        showNotification('Failed to update password. Please check your current password and try again.', 'error');
    }
});

// Live password strength checking
document.getElementById('newPassword')?.addEventListener('input', (e) => {
    checkPasswordStrength(e.target.value);
});

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Animate out and remove
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Exam Security Features
function setupExamSecurity() {
    if (document.querySelector('.exam-section')) {
        // Initialize exam security state
        const examState = {
            warningCount: 0,
            maxWarnings: 3,
            isFullscreen: false,
            examStarted: false
        };

        // Disable right-click
        document.addEventListener('contextmenu', (e) => {
            if (examState.examStarted) {
                e.preventDefault();
                showNotification('Right-click is disabled during the exam', 'warning');
            }
        });

        // Keyboard shortcuts prevention
        document.addEventListener('keydown', (e) => {
            if (examState.examStarted) {
                // Prevent common shortcuts
                if (
                    (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'p' || e.key === 'a')) ||
                    (e.altKey && e.key === 'Tab') ||
                    e.key === 'F12' ||
                    (e.ctrlKey && e.shiftKey && e.key === 'I') ||
                    (e.ctrlKey && e.shiftKey && e.key === 'C')
                ) {
                    e.preventDefault();
                    showNotification('Keyboard shortcuts are disabled during the exam', 'warning');
                }
            }
        });

        // Tab/Window visibility
        document.addEventListener('visibilitychange', () => {
            if (examState.examStarted && document.hidden) {
                examState.warningCount++;
                if (examState.warningCount <= examState.maxWarnings) {
                    showNotification(`Warning ${examState.warningCount}/${examState.maxWarnings}: Switching tabs/windows is not allowed!`, 'warning');
                } else {
                    showNotification('Maximum warnings reached. Your exam will be submitted.', 'error');
                    submitExam();
                }
            }
        });

        // Prevent copy-paste
        ['copy', 'paste', 'cut'].forEach(event => {
            document.addEventListener(event, (e) => {
                if (examState.examStarted) {
                    e.preventDefault();
                    showNotification(`${event.charAt(0).toUpperCase() + event.slice(1)} is not allowed during the exam`, 'warning');
                }
            });
        });

        // Fullscreen management
        document.getElementById('startExam')?.addEventListener('click', async () => {
            try {
                await document.documentElement.requestFullscreen();
                examState.isFullscreen = true;
                examState.examStarted = true;
                showNotification('Exam started in fullscreen mode', 'success');
                startExamTimer();
            } catch (error) {
                showNotification('Please allow fullscreen to start the exam', 'error');
            }
        });

        // Monitor fullscreen changes
        document.addEventListener('fullscreenchange', () => {
            if (examState.examStarted && !document.fullscreenElement) {
                examState.warningCount++;
                if (examState.warningCount <= examState.maxWarnings) {
                    showNotification(`Warning ${examState.warningCount}/${examState.maxWarnings}: Fullscreen is required!`, 'warning');
                    document.documentElement.requestFullscreen();
                } else {
                    showNotification('Maximum warnings reached. Your exam will be submitted.', 'error');
                    submitExam();
                }
            }
        });

        // Exam timer
        function startExamTimer() {
            const timerDisplay = document.getElementById('examTimer');
            if (!timerDisplay) return;

            const duration = parseInt(timerDisplay.dataset.duration) || 3600; // Default 1 hour
            let timeLeft = duration;

            const timer = setInterval(() => {
                if (timeLeft <= 0) {
                    clearInterval(timer);
                    showNotification('Time\'s up! Submitting your exam...', 'warning');
                    submitExam();
                    return;
                }

                const hours = Math.floor(timeLeft / 3600);
                const minutes = Math.floor((timeLeft % 3600) / 60);
                const seconds = timeLeft % 60;

                timerDisplay.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
                
                if (timeLeft <= 300) { // 5 minutes warning
                    timerDisplay.classList.add('warning');
                    if (timeLeft === 300) {
                        showNotification('5 minutes remaining!', 'warning');
                    }
                }

                timeLeft--;
            }, 1000);
        }

        function submitExam() {
            // Add your exam submission logic here
            document.getElementById('examForm')?.submit();
            if (document.fullscreenElement) {
                document.exitFullscreen();
            }
            examState.examStarted = false;
        }
    }
}

// Initialize exam security when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setupExamSecurity();
});
