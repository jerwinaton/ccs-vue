// DOM Elements
const timer = document.getElementById('timer');
const questionCount = document.getElementById('questionCount');
const questionGrid = document.getElementById('questionGrid');
const submitExamBtn = document.getElementById('submitExam');
const prevQuestionBtn = document.getElementById('prevQuestion');
const nextQuestionBtn = document.getElementById('nextQuestion');
const flagQuestionBtn = document.querySelector('.flag-question');
const submitModal = document.getElementById('submitModal');

// Exam State
let examState = {
    currentQuestion: 1,
    totalQuestions: 50,
    timeRemaining: 7200, // 2 hours in seconds
    answers: {},
    flaggedQuestions: new Set(),
    examStarted: false
};

// Initialize Exam
function initializeExam() {
    createQuestionGrid();
    startTimer();
    updateQuestionCount();
    loadQuestion(1);
    examState.examStarted = true;

    // Event Listeners
    submitExamBtn.addEventListener('click', showSubmitModal);
    prevQuestionBtn.addEventListener('click', () => navigateQuestion('prev'));
    nextQuestionBtn.addEventListener('click', () => navigateQuestion('next'));
    flagQuestionBtn.addEventListener('click', toggleFlagQuestion);

    // Save answers when radio buttons change
    document.addEventListener('change', (e) => {
        if (e.target.type === 'radio') {
            saveAnswer(examState.currentQuestion, e.target.value);
        }
    });

    // Autosave for essay and enumeration
    const textInputs = document.querySelectorAll('textarea, .answer-field input');
    textInputs.forEach(input => {
        input.addEventListener('input', debounce(() => {
            saveAnswer(examState.currentQuestion, input.value);
        }, 1000));
    });

    // Handle code editor changes
    const codeEditor = document.getElementById('codeEditor');
    if (codeEditor) {
        codeEditor.addEventListener('input', debounce(() => {
            saveAnswer(examState.currentQuestion, codeEditor.value);
        }, 1000));
    }
}

// Create Question Grid
function createQuestionGrid() {
    questionGrid.innerHTML = '';
    for (let i = 1; i <= examState.totalQuestions; i++) {
        const questionNumber = document.createElement('div');
        questionNumber.className = 'question-number';
        questionNumber.textContent = i;
        questionNumber.addEventListener('click', () => loadQuestion(i));
        questionGrid.appendChild(questionNumber);
    }
    updateQuestionGrid();
}

// Update Question Grid
function updateQuestionGrid() {
    const questionNumbers = document.querySelectorAll('.question-number');
    questionNumbers.forEach((number, index) => {
        const questionNum = index + 1;
        number.className = 'question-number';
        
        if (questionNum === examState.currentQuestion) {
            number.classList.add('current');
        }
        if (examState.answers[questionNum]) {
            number.classList.add('answered');
        }
        if (examState.flaggedQuestions.has(questionNum)) {
            number.classList.add('flagged');
        }
    });
}

// Timer Functions
function startTimer() {
    const timerInterval = setInterval(() => {
        if (examState.timeRemaining > 0) {
            examState.timeRemaining--;
            updateTimer();
        } else {
            clearInterval(timerInterval);
            submitExam();
        }
    }, 1000);
}

function updateTimer() {
    const hours = Math.floor(examState.timeRemaining / 3600);
    const minutes = Math.floor((examState.timeRemaining % 3600) / 60);
    const seconds = examState.timeRemaining % 60;
    
    timer.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    if (examState.timeRemaining <= 300) { // 5 minutes warning
        timer.style.color = '#e74c3c';
    }
}

// Question Navigation
function navigateQuestion(direction) {
    let nextQuestion;
    if (direction === 'prev') {
        nextQuestion = Math.max(1, examState.currentQuestion - 1);
    } else {
        nextQuestion = Math.min(examState.totalQuestions, examState.currentQuestion + 1);
    }
    loadQuestion(nextQuestion);
}

function loadQuestion(questionNumber) {
    // Save current question state if needed
    saveCurrentQuestionState();

    examState.currentQuestion = questionNumber;
    updateQuestionCount();
    updateQuestionGrid();
    
    // Load question content (this would typically fetch from a database)
    const questionTypes = document.querySelectorAll('.question-type');
    questionTypes.forEach(type => type.classList.remove('active'));
    
    // For demo purposes, we're cycling through question types
    const questionType = questionNumber % 4;
    switch(questionType) {
        case 0:
            document.querySelector('.multiple-choice').classList.add('active');
            break;
        case 1:
            document.querySelector('.essay').classList.add('active');
            break;
        case 2:
            document.querySelector('.enumeration').classList.add('active');
            break;
        case 3:
            document.querySelector('.coding').classList.add('active');
            break;
    }

    // Update flag button state
    flagQuestionBtn.classList.toggle('active', examState.flaggedQuestions.has(questionNumber));

    // Load saved answer if exists
    loadSavedAnswer(questionNumber);
}

// Answer Management
function saveAnswer(questionNumber, answer) {
    examState.answers[questionNumber] = answer;
    updateQuestionGrid();
    // In a real app, you might want to sync with a backend here
    saveToLocalStorage();
}

function loadSavedAnswer(questionNumber) {
    const answer = examState.answers[questionNumber];
    if (!answer) return;

    const questionType = questionNumber % 4;
    switch(questionType) {
        case 0: // Multiple Choice
            const radio = document.querySelector(`input[type="radio"][value="${answer}"]`);
            if (radio) radio.checked = true;
            break;
        case 1: // Essay
            const textarea = document.querySelector('.essay textarea');
            if (textarea) textarea.value = answer;
            break;
        case 2: // Enumeration
            const inputs = document.querySelectorAll('.enumeration input');
            if (Array.isArray(answer)) {
                inputs.forEach((input, i) => {
                    if (answer[i]) input.value = answer[i];
                });
            }
            break;
        case 3: // Coding
            const codeEditor = document.getElementById('codeEditor');
            if (codeEditor) codeEditor.value = answer;
            break;
    }
}

function saveCurrentQuestionState() {
    const questionType = examState.currentQuestion % 4;
    let answer;

    switch(questionType) {
        case 0: // Multiple Choice
            const selectedRadio = document.querySelector('input[type="radio"]:checked');
            if (selectedRadio) answer = selectedRadio.value;
            break;
        case 1: // Essay
            answer = document.querySelector('.essay textarea').value;
            break;
        case 2: // Enumeration
            answer = Array.from(document.querySelectorAll('.enumeration input')).map(input => input.value);
            break;
        case 3: // Coding
            answer = document.getElementById('codeEditor').value;
            break;
    }

    if (answer) saveAnswer(examState.currentQuestion, answer);
}

// Flag Questions
function toggleFlagQuestion() {
    if (examState.flaggedQuestions.has(examState.currentQuestion)) {
        examState.flaggedQuestions.delete(examState.currentQuestion);
    } else {
        examState.flaggedQuestions.add(examState.currentQuestion);
    }
    flagQuestionBtn.classList.toggle('active');
    updateQuestionGrid();
    saveToLocalStorage();
}

// Exam Submission
function showSubmitModal() {
    saveCurrentQuestionState();
    
    // Update summary
    const answered = Object.keys(examState.answers).length;
    const unanswered = examState.totalQuestions - answered;
    const flagged = examState.flaggedQuestions.size;

    const summaryItems = submitModal.querySelectorAll('.summary-item span:last-child');
    summaryItems[0].textContent = examState.totalQuestions;
    summaryItems[1].textContent = answered;
    summaryItems[2].textContent = unanswered;
    summaryItems[3].textContent = flagged;

    submitModal.classList.add('active');
}

function closeModal() {
    submitModal.classList.remove('active');
}

function submitExam() {
    // Save final state
    saveCurrentQuestionState();
    
    // Prepare exam data
    const examData = {
        answers: examState.answers,
        timeSpent: 7200 - examState.timeRemaining,
        flaggedQuestions: Array.from(examState.flaggedQuestions)
    };

    // In a real app, you would send this to your backend
    console.log('Submitting exam:', examData);
    
    // Redirect to results page
    // window.location.href = 'exam-results.html';
    alert('Exam submitted successfully!');
}

// Utility Functions
function updateQuestionCount() {
    questionCount.textContent = `${examState.currentQuestion}/${examState.totalQuestions}`;
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

function saveToLocalStorage() {
    if (typeof Storage !== 'undefined') {
        localStorage.setItem('examState', JSON.stringify({
            answers: examState.answers,
            flaggedQuestions: Array.from(examState.flaggedQuestions),
            timeRemaining: examState.timeRemaining,
            currentQuestion: examState.currentQuestion
        }));
    }
}

function loadFromLocalStorage() {
    if (typeof Storage !== 'undefined') {
        const saved = localStorage.getItem('examState');
        if (saved) {
            const state = JSON.parse(saved);
            examState.answers = state.answers || {};
            examState.flaggedQuestions = new Set(state.flaggedQuestions || []);
            examState.timeRemaining = state.timeRemaining || 7200;
            examState.currentQuestion = state.currentQuestion || 1;
        }
    }
}

// Code Editor Enhancements
function initializeCodeEditor() {
    const codeEditor = document.getElementById('codeEditor');
    if (!codeEditor) return;

    // Add basic editor features
    codeEditor.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = this.selectionStart;
            const end = this.selectionEnd;
            
            this.value = this.value.substring(0, start) + '    ' + this.value.substring(end);
            this.selectionStart = this.selectionEnd = start + 4;
        }
    });

    // Language selection
    const languageSelect = document.querySelector('.language-select');
    if (languageSelect) {
        languageSelect.addEventListener('change', function() {
            const language = this.value;
            // Update editor settings based on language
            switch(language) {
                case 'python':
                    codeEditor.value = 'def isPalindrome(str):\n    # Write your code here\n    pass';
                    break;
                case 'javascript':
                    codeEditor.value = 'function isPalindrome(str) {\n    // Write your code here\n}';
                    break;
                case 'java':
                    codeEditor.value = 'public class Solution {\n    public boolean isPalindrome(String str) {\n        // Write your code here\n    }\n}';
                    break;
            }
        });
    }

    // Run code button
    const runCodeBtn = document.querySelector('.run-code');
    if (runCodeBtn) {
        runCodeBtn.addEventListener('click', function() {
            // In a real app, this would send the code to a backend for execution
            const testCases = document.querySelectorAll('.test-case');
            testCases.forEach(testCase => {
                const status = testCase.querySelector('.status');
                status.className = 'status success';
                status.textContent = 'Passed';
            });
        });
    }
}

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    initializeExam();
    initializeCodeEditor();
});
