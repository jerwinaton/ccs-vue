import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

// Firebase configuration
// const firebaseConfig = {
//     apiKey: "AIzaSyBkGhlq460DmsOkIzABpLDHMSlnsdvWtr4",
//     authDomain: "ccs-freshman-screening.firebaseapp.com",
//     projectId: "ccs-freshman-screening",
//     storageBucket: "ccs-freshman-screening.firebasestorage.app",
//     messagingSenderId: "338007472587",
//     appId: "1:338007472587:web:594f6c3c9c4d59a74e5e4e"
// };
const firebaseConfig = {
  apiKey: "AIzaSyCXhg-tr6E09tYXCVNBj9MFUfxJa4-T2ao",
  authDomain: "ccs-freshmen-screening.firebaseapp.com",
  projectId: "ccs-freshmen-screening",
  storageBucket: "ccs-freshmen-screening.firebasestorage.app",
  messagingSenderId: "407376061142",
  appId: "1:407376061142:web:d5052d54975e0a4a2a5f77",
  measurementId: "G-FEZNMF4ZGL",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Database Collections
const collections = {
  users: collection(db, "users"),
  applicants: collection(db, "applicants"),
  admins: collection(db, "admins"),
  exams: collection(db, "exams"),
  examResults: collection(db, "examResults"),
  interviews: collection(db, "interviews"),
  schedules: collection(db, "schedules"),
};

// User Management
export async function createUser(email, password, userType, userData) {
  try {
    // Create authentication user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const uid = userCredential.user.uid;

    // Create user document based on user type
    const userDoc = {
      uid,
      email,
      userType,
      createdAt: serverTimestamp(),
      ...userData,
    };

    if (userType === "applicant") {
      await setDoc(doc(collections.applicants, uid), {
        ...userDoc,
        applicationStatus: "pending",
        examStatus: "not_started",
        interviewStatus: "not_scheduled",
      });
    } else if (userType === "admin") {
      await setDoc(doc(collections.admins, uid), {
        ...userDoc,
        role: userData.role || "staff",
      });
    }

    return { success: true, uid };
  } catch (error) {
    console.error("Error creating user:", error);
    return { success: false, error: error.message };
  }
}

// Exam Management
export async function createExam(examData) {
  try {
    const examDoc = {
      ...examData,
      createdAt: serverTimestamp(),
      status: "draft",
      totalQuestions: examData.questions.length,
      submissions: 0,
    };

    const docRef = await addDoc(collections.exams, examDoc);
    return { success: true, examId: docRef.id };
  } catch (error) {
    console.error("Error creating exam:", error);
    return { success: false, error: error.message };
  }
}

export async function submitExamResult(userId, examId, resultData) {
  try {
    const resultDoc = {
      userId,
      examId,
      ...resultData,
      submittedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collections.examResults, resultDoc);
    return { success: true, resultId: docRef.id };
  } catch (error) {
    console.error("Error submitting exam result:", error);
    return { success: false, error: error.message };
  }
}

// Interview Management
export async function scheduleInterview(applicantId, interviewData) {
  try {
    const interviewDoc = {
      applicantId,
      ...interviewData,
      scheduledAt: serverTimestamp(),
      status: "scheduled",
    };

    const docRef = await addDoc(collections.interviews, interviewDoc);

    // Update applicant's interview status
    await setDoc(
      doc(collections.applicants, applicantId),
      {
        interviewStatus: "scheduled",
      },
      { merge: true }
    );

    return { success: true, interviewId: docRef.id };
  } catch (error) {
    console.error("Error scheduling interview:", error);
    return { success: false, error: error.message };
  }
}

// Sample Data Structures

// Applicant Document Structure
const applicantStructure = {
  uid: "string", // Firebase Auth UID
  email: "string",
  userType: "applicant",
  firstName: "string",
  lastName: "string",
  contactNumber: "string",
  address: "string",
  birthDate: "timestamp",
  course: "string",
  applicationStatus: "string", // pending, under_review, accepted, rejected
  examStatus: "string", // not_started, scheduled, completed, passed, failed
  interviewStatus: "string", // not_scheduled, scheduled, completed, passed, failed
  documents: {
    // Required documents
    birthCertificate: "string", // URL
    gradingSheet: "string", // URL
    goodMoral: "string", // URL
  },
  createdAt: "timestamp",
};

// Admin Document Structure
const adminStructure = {
  uid: "string", // Firebase Auth UID
  email: "string",
  userType: "admin",
  firstName: "string",
  lastName: "string",
  role: "string", // admin, staff, interviewer
  permissions: ["string"], // array of permission codes
  createdAt: "timestamp",
};

// Exam Document Structure
const examStructure = {
  title: "string",
  description: "string",
  duration: "number", // in minutes
  passingScore: "number",
  totalQuestions: "number",
  status: "string", // draft, published, archived
  questions: [
    {
      id: "string",
      type: "string", // multiple_choice, essay
      question: "string",
      options: ["string"], // for multiple choice
      correctAnswer: "string",
      points: "number",
    },
  ],
  createdAt: "timestamp",
  publishedAt: "timestamp",
  submissions: "number",
};

// Exam Result Document Structure
const examResultStructure = {
  userId: "string",
  examId: "string",
  score: "number",
  answers: [
    {
      questionId: "string",
      answer: "string",
      isCorrect: "boolean",
      points: "number",
    },
  ],
  totalScore: "number",
  passed: "boolean",
  startedAt: "timestamp",
  submittedAt: "timestamp",
};

// Interview Document Structure
const interviewStructure = {
  applicantId: "string",
  interviewerId: "string",
  date: "timestamp",
  duration: "number", // in minutes
  type: "string", // initial, technical, final
  status: "string", // scheduled, ongoing, completed, cancelled
  evaluation: {
    technicalSkills: {
      problemSolving: "number", // 1-5
      technicalKnowledge: "number", // 1-5
    },
    softSkills: {
      communication: "number", // 1-5
      attitude: "number", // 1-5
    },
    notes: "string",
    recommendation: "string", // hire, consider, reject
  },
  scheduledAt: "timestamp",
  completedAt: "timestamp",
};

export const databaseStructure = {
  applicantStructure,
  adminStructure,
  examStructure,
  examResultStructure,
  interviewStructure,
};
