<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import Sidebar from "../components/Sidebar.vue";
</script>

<template>
  <div class="dashboard-container">
    <Sidebar />

    <!-- Main Content -->
    <main class="main-content">
      <div class="top-bar">
        <!-- Top bar content -->
      </div>

      <div class="exam-creator">
        <div class="exam-header">
          <h2>Create New Exam</h2>
          <button class="save-exam-btn">
            <i class="fas fa-save"></i> Save Exam
          </button>
        </div>

        <div class="exam-form">
          <div class="exam-basics">
            <div class="form-group">
              <label for="examTitle">Exam Title</label>
              <input
                type="text"
                id="examTitle"
                placeholder="Enter exam title"
              />
            </div>
            <div class="form-group">
              <label for="examDescription">Description</label>
              <textarea
                id="examDescription"
                placeholder="Enter exam description"
              ></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="examDuration">Duration (minutes)</label>
                <input type="number" id="examDuration" min="1" value="60" />
              </div>
              <div class="form-group">
                <label for="passingScore">Passing Score (%)</label>
                <input
                  type="number"
                  id="passingScore"
                  min="1"
                  max="100"
                  value="70"
                />
              </div>
            </div>
          </div>

          <div class="questions-container">
            <div class="questions-header">
              <h3>Questions</h3>
              <div class="question-type-buttons">
                <button class="add-question-btn" data-type="multiple-choice">
                  <i class="fas fa-list"></i> Multiple Choice
                </button>
                <button class="add-question-btn" data-type="essay">
                  <i class="fas fa-paragraph"></i> Essay
                </button>
                <button class="add-question-btn" data-type="enumeration">
                  <i class="fas fa-list-ol"></i> Enumeration
                </button>
                <button class="add-question-btn" data-type="coding">
                  <i class="fas fa-code"></i> Coding
                </button>
              </div>
            </div>

            <div id="questionsList" class="questions-list">
              <!-- Questions will be added here dynamically -->
            </div>
          </div>
        </div>
      </div>

      <div class="loading-overlay">
        <div class="loading-content">
          <div class="loading-spinner"></div>
          <div class="loading-text">Saving exam...</div>
        </div>
      </div>
    </main>
  </div>
  <!-- Question Templates -->
  <template id="multipleChoiceTemplate">
    <div class="question-item" data-type="multiple-choice">
      <div class="question-header">
        <h4>Multiple Choice Question</h4>
        <div class="question-actions">
          <button class="move-up-btn"><i class="fas fa-arrow-up"></i></button>
          <button class="move-down-btn">
            <i class="fas fa-arrow-down"></i>
          </button>
          <button class="delete-question-btn">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
      <div class="question-content">
        <div class="form-group">
          <label>Question Text</label>
          <textarea
            class="question-text"
            placeholder="Enter your question"
          ></textarea>
        </div>
        <div class="options-container">
          <label>Options</label>
          <div class="options-list">
            <div class="option-item">
              <input type="radio" name="correct-answer" />
              <input type="text" placeholder="Option text" />
              <button class="remove-option-btn">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
          <button class="add-option-btn">
            <i class="fas fa-plus"></i> Add Option
          </button>
        </div>
      </div>
    </div>
  </template>

  <template id="essayTemplate">
    <div class="question-item" data-type="essay">
      <div class="question-header">
        <h4>Essay Question</h4>
        <div class="question-actions">
          <button class="move-up-btn"><i class="fas fa-arrow-up"></i></button>
          <button class="move-down-btn">
            <i class="fas fa-arrow-down"></i>
          </button>
          <button class="delete-question-btn">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
      <div class="question-content">
        <div class="form-group">
          <label>Question Text</label>
          <textarea
            class="question-text"
            placeholder="Enter your question"
          ></textarea>
        </div>
        <div class="form-group">
          <label>Word Limit</label>
          <input type="number" class="word-limit" min="1" value="500" />
        </div>
        <div class="form-group">
          <label>Rubric</label>
          <textarea
            class="rubric-text"
            placeholder="Enter grading rubric"
          ></textarea>
        </div>
      </div>
    </div>
  </template>

  <template id="enumerationTemplate">
    <div class="question-item" data-type="enumeration">
      <div class="question-header">
        <h4>Enumeration Question</h4>
        <div class="question-actions">
          <button class="move-up-btn"><i class="fas fa-arrow-up"></i></button>
          <button class="move-down-btn">
            <i class="fas fa-arrow-down"></i>
          </button>
          <button class="delete-question-btn">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
      <div class="question-content">
        <div class="form-group">
          <label>Question Text</label>
          <textarea
            class="question-text"
            placeholder="Enter your question"
          ></textarea>
        </div>
        <div class="answers-container">
          <label>Correct Answers</label>
          <div class="answers-list">
            <div class="answer-item">
              <input type="text" placeholder="Answer" />
              <button class="remove-answer-btn">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
          <button class="add-answer-btn">
            <i class="fas fa-plus"></i> Add Answer
          </button>
        </div>
        <div class="form-group">
          <label>Required Correct Answers</label>
          <input type="number" class="required-correct" min="1" value="1" />
        </div>
      </div>
    </div>
  </template>

  <template id="codingTemplate">
    <div class="question-item" data-type="coding">
      <div class="question-header">
        <h4>Coding Question</h4>
        <div class="question-actions">
          <button class="move-up-btn"><i class="fas fa-arrow-up"></i></button>
          <button class="move-down-btn">
            <i class="fas fa-arrow-down"></i>
          </button>
          <button class="delete-question-btn">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
      <div class="question-content">
        <div class="form-group">
          <label>Problem Statement</label>
          <textarea
            class="question-text"
            placeholder="Enter the coding problem"
          ></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Programming Language</label>
            <select class="programming-language">
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="javascript">JavaScript</option>
              <option value="cpp">C++</option>
            </select>
          </div>
          <div class="form-group">
            <label>Time Limit (seconds)</label>
            <input type="number" class="time-limit" min="1" value="5" />
          </div>
        </div>
        <div class="form-group">
          <label>Sample Input</label>
          <textarea
            class="sample-input"
            placeholder="Enter sample input"
          ></textarea>
        </div>
        <div class="form-group">
          <label>Sample Output</label>
          <textarea
            class="sample-output"
            placeholder="Enter expected output"
          ></textarea>
        </div>
        <div class="test-cases-container">
          <label>Test Cases</label>
          <div class="test-cases-list">
            <div class="test-case-item">
              <div class="form-group">
                <label>Input</label>
                <textarea
                  class="test-input"
                  placeholder="Test case input"
                ></textarea>
              </div>
              <div class="form-group">
                <label>Expected Output</label>
                <textarea
                  class="test-output"
                  placeholder="Expected output"
                ></textarea>
              </div>
              <button class="remove-test-case-btn">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
          <button class="add-test-case-btn">
            <i class="fas fa-plus"></i> Add Test Case
          </button>
        </div>
      </div>
    </div>
  </template>
</template>
