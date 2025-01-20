// Import Firebase modules
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

class ExamCreator {
    constructor() {
        this.questionsList = document.getElementById('questionsList');
        this.templates = {
            'multiple-choice': document.getElementById('multipleChoiceTemplate'),
            'essay': document.getElementById('essayTemplate'),
            'enumeration': document.getElementById('enumerationTemplate'),
            'coding': document.getElementById('codingTemplate')
        };
        
        this.initializeFirebase();
        this.initializeEventListeners();
        this.setupAuthCheck();
    }

    initializeFirebase() {
        const app = initializeApp(firebaseConfig);
        this.db = getFirestore(app);
        this.auth = getAuth(app);
    }

    setupAuthCheck() {
        onAuthStateChanged(this.auth, (user) => {
            if (!user || user.role !== 'admin') {
                window.location.href = '../login.html';
            }
        });
    }

    initializeEventListeners() {
        // Add question buttons
        document.querySelectorAll('.add-question-btn').forEach(button => {
            button.addEventListener('click', () => {
                const questionType = button.getAttribute('data-type');
                this.addQuestion(questionType);
            });
        });

        // Save exam button
        document.querySelector('.save-exam-btn').addEventListener('click', () => {
            this.validateAndSaveExam();
        });

        // Preview exam button
        document.querySelector('.preview-exam-btn')?.addEventListener('click', () => {
            this.previewExam();
        });

        // Global event delegation for dynamic elements
        this.questionsList.addEventListener('click', (e) => {
            const target = e.target;
            this.handleQuestionActions(target);
        });

        // Auto-save functionality
        this.setupAutoSave();
    }

    handleQuestionActions(target) {
        const actions = {
            'delete-question-btn': () => this.deleteQuestion(target),
            'move-up-btn': () => this.moveQuestion(target, 'up'),
            'move-down-btn': () => this.moveQuestion(target, 'down'),
            'add-option-btn': () => this.addOption(target),
            'add-answer-btn': () => this.addAnswer(target),
            'add-test-case-btn': () => this.addTestCase(target),
            'remove-option-btn': () => this.removeItem(target, '.option-item'),
            'remove-answer-btn': () => this.removeItem(target, '.answer-item'),
            'remove-test-case-btn': () => this.removeItem(target, '.test-case-item')
        };

        const actionButton = target.closest('[class$="-btn"]');
        if (actionButton) {
            const actionClass = Array.from(actionButton.classList)
                .find(cls => cls.endsWith('-btn'));
            if (actions[actionClass]) {
                actions[actionClass]();
            }
        }
    }

    addQuestion(type) {
        const template = this.templates[type];
        if (!template) return;

        const clone = template.content.cloneNode(true);
        const questionItem = clone.querySelector('.question-item');
        
        // Add unique IDs to form elements
        const timestamp = Date.now();
        questionItem.querySelectorAll('input, textarea, select').forEach(element => {
            element.id = `${element.id || element.getAttribute('name') || 'field'}-${timestamp}`;
        });

        this.questionsList.appendChild(clone);
        this.updateQuestionNumbers();
        this.saveToLocalStorage();
    }

    deleteQuestion(target) {
        const questionItem = target.closest('.question-item');
        if (confirm('Are you sure you want to delete this question?')) {
            questionItem.remove();
            this.updateQuestionNumbers();
            this.saveToLocalStorage();
        }
    }

    moveQuestion(target, direction) {
        const questionItem = target.closest('.question-item');
        const sibling = direction === 'up' ? 
            questionItem.previousElementSibling : 
            questionItem.nextElementSibling;

        if (sibling) {
            questionItem.parentNode.insertBefore(
                direction === 'up' ? questionItem : sibling,
                direction === 'up' ? sibling : questionItem
            );
            this.updateQuestionNumbers();
            this.saveToLocalStorage();
        }
    }

    addOption(target) {
        const optionsList = target.closest('.question-item').querySelector('.options-list');
        const timestamp = Date.now();
        const optionItem = document.createElement('div');
        optionItem.className = 'option-item';
        optionItem.innerHTML = `
            <input type="radio" name="correct-answer-${timestamp}" id="option-${timestamp}">
            <input type="text" placeholder="Option text" id="option-text-${timestamp}">
            <button class="remove-option-btn"><i class="fas fa-times"></i></button>
        `;
        optionsList.appendChild(optionItem);
        this.saveToLocalStorage();
    }

    addAnswer(target) {
        const answersList = target.closest('.question-item').querySelector('.answers-list');
        const timestamp = Date.now();
        const answerItem = document.createElement('div');
        answerItem.className = 'answer-item';
        answerItem.innerHTML = `
            <input type="text" placeholder="Answer" id="answer-${timestamp}">
            <button class="remove-answer-btn"><i class="fas fa-times"></i></button>
        `;
        answersList.appendChild(answerItem);
        this.saveToLocalStorage();
    }

    addTestCase(target) {
        const testCasesList = target.closest('.question-item').querySelector('.test-cases-list');
        const timestamp = Date.now();
        const testCaseItem = document.createElement('div');
        testCaseItem.className = 'test-case-item';
        testCaseItem.innerHTML = `
            <div class="form-group">
                <label>Input</label>
                <textarea class="test-input" id="test-input-${timestamp}" placeholder="Test case input"></textarea>
            </div>
            <div class="form-group">
                <label>Expected Output</label>
                <textarea class="test-output" id="test-output-${timestamp}" placeholder="Expected output"></textarea>
            </div>
            <button class="remove-test-case-btn"><i class="fas fa-times"></i></button>
        `;
        testCasesList.appendChild(testCaseItem);
        this.saveToLocalStorage();
    }

    removeItem(target, selector) {
        const item = target.closest(selector);
        if (item) {
            item.remove();
            this.saveToLocalStorage();
        }
    }

    updateQuestionNumbers() {
        this.questionsList.querySelectorAll('.question-item').forEach((item, index) => {
            const header = item.querySelector('h4');
            const type = item.getAttribute('data-type');
            header.textContent = `${type.charAt(0).toUpperCase() + type.slice(1)} Question ${index + 1}`;
        });
    }

    validateAndSaveExam() {
        const examData = this.collectExamData();
        const validationResult = this.validateExamData(examData);

        if (validationResult.valid) {
            this.saveExam(examData);
        } else {
            this.showValidationErrors(validationResult.errors);
        }
    }

    collectExamData() {
        const examData = {
            title: document.getElementById('examTitle').value,
            description: document.getElementById('examDescription').value,
            duration: parseInt(document.getElementById('examDuration').value),
            passingScore: parseInt(document.getElementById('passingScore').value),
            questions: []
        };

        document.querySelectorAll('.question-item').forEach(questionItem => {
            const questionData = this.collectQuestionData(questionItem);
            examData.questions.push(questionData);
        });

        return examData;
    }

    collectQuestionData(questionItem) {
        const type = questionItem.getAttribute('data-type');
        const baseData = {
            type,
            text: questionItem.querySelector('.question-text').value,
            points: parseInt(questionItem.querySelector('.question-points')?.value || '1')
        };

        const collectors = {
            'multiple-choice': () => this.collectMultipleChoiceData(questionItem),
            'essay': () => this.collectEssayData(questionItem),
            'enumeration': () => this.collectEnumerationData(questionItem),
            'coding': () => this.collectCodingData(questionItem)
        };

        return { ...baseData, ...collectors[type]() };
    }

    validateExamData(examData) {
        const errors = [];

        // Validate exam basics
        if (!examData.title) errors.push('Exam title is required');
        if (!examData.description) errors.push('Exam description is required');
        if (examData.duration < 1) errors.push('Duration must be at least 1 minute');
        if (examData.passingScore < 1 || examData.passingScore > 100) {
            errors.push('Passing score must be between 1 and 100');
        }

        // Validate questions
        if (examData.questions.length === 0) {
            errors.push('At least one question is required');
        }

        examData.questions.forEach((question, index) => {
            const questionErrors = this.validateQuestion(question, index + 1);
            errors.push(...questionErrors);
        });

        return {
            valid: errors.length === 0,
            errors
        };
    }

    validateQuestion(question, index) {
        const errors = [];
        const prefix = `Question ${index}: `;

        if (!question.text) {
            errors.push(prefix + 'Question text is required');
        }

        const validators = {
            'multiple-choice': () => this.validateMultipleChoice(question, prefix),
            'essay': () => this.validateEssay(question, prefix),
            'enumeration': () => this.validateEnumeration(question, prefix),
            'coding': () => this.validateCoding(question, prefix)
        };

        if (validators[question.type]) {
            errors.push(...validators[question.type]());
        }

        return errors;
    }

    async saveExam(examData) {
        try {
            this.showLoading(true);
            
            // Add metadata
            examData.createdBy = this.auth.currentUser.uid;
            examData.createdAt = serverTimestamp();
            examData.status = 'active';

            // Save to Firebase
            const examRef = await addDoc(collection(this.db, 'exams'), examData);

            this.showSuccess('Exam saved successfully!');
            this.clearLocalStorage();
            
            // Redirect after a short delay
            setTimeout(() => {
                window.location.href = 'exams.html';
            }, 1500);
        } catch (error) {
            console.error('Error saving exam:', error);
            this.showError('Failed to save exam. Please try again.');
        } finally {
            this.showLoading(false);
        }
    }

    setupAutoSave() {
        const debounce = (func, wait) => {
            let timeout;
            return (...args) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(this, args), wait);
            };
        };

        const autoSave = debounce(() => {
            const examData = this.collectExamData();
            this.saveToLocalStorage(examData);
        }, 1000);

        document.querySelector('.exam-form').addEventListener('input', autoSave);
    }

    saveToLocalStorage(data = null) {
        if (!data) {
            data = this.collectExamData();
        }
        localStorage.setItem('examDraft', JSON.stringify(data));
    }

    loadFromLocalStorage() {
        const saved = localStorage.getItem('examDraft');
        if (saved) {
            const data = JSON.parse(saved);
            this.loadExamData(data);
        }
    }

    clearLocalStorage() {
        localStorage.removeItem('examDraft');
    }

    showLoading(show) {
        const overlay = document.querySelector('.loading-overlay');
        if (show) {
            overlay.classList.add('active');
        } else {
            overlay.classList.remove('active');
        }
    }

    showSuccess(message) {
        // Implement toast or notification system
        alert(message);
    }

    showError(message) {
        // Implement toast or notification system
        alert(message);
    }

    showValidationErrors(errors) {
        const errorList = errors.map(error => `• ${error}`).join('\n');
        alert('Please fix the following errors:\n\n' + errorList);
    }
}

// Initialize exam creator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const examCreator = new ExamCreator();
    examCreator.loadFromLocalStorage();
});
