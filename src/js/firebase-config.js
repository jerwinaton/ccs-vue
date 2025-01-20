// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// https://firebase.google.com/docs/web/setup#available-libraries

import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCXhg-tr6E09tYXCVNBj9MFUfxJa4-T2ao",
  authDomain: "ccs-freshmen-screening.firebaseapp.com",
  projectId: "ccs-freshmen-screening",
  storageBucket: "ccs-freshmen-screening.firebasestorage.app",
  messagingSenderId: "407376061142",
  appId: "1:407376061142:web:d5052d54975e0a4a2a5f77",
  measurementId: "G-FEZNMF4ZGL",
};
// const firebaseConfig = {
//     apiKey: "AIzaSyBkGhlq460DmsOkIzABpLDHMSlnsdvWtr4",
//     authDomain: "ccs-freshman-screening.firebaseapp.com",
//     projectId: "ccs-freshman-screening",
//     storageBucket: "ccs-freshman-screening.firebasestorage.app",
//     messagingSenderId: "338007472587",
//     appId: "1:338007472587:web:594f6c3c9c4d59a74e5e4e"
// };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Collection references
const usersRef = db.collection("users");
const examsRef = db.collection("exams");
const submissionsRef = db.collection("submissions");
const interviewsRef = db.collection("interviews");

// Authentication state observer
auth.onAuthStateChanged((user) => {
  if (user) {
    // User is signed in
    usersRef
      .doc(user.uid)
      .get()
      .then((doc) => {
        if (doc.exists) {
          const userData = doc.data();
          const userType = userData.userType;

          // Redirect based on user type if not on correct dashboard
          const currentPath = window.location.pathname;
          if (!currentPath.includes(`${userType}/dashboard`)) {
            window.location.href = `/${userType}/dashboard.html`;
          }
        }
      });
  } else {
    // User is signed out
    const currentPath = window.location.pathname;
    if (
      !currentPath.includes("login.html") &&
      !currentPath.includes("register.html") &&
      !currentPath.includes("index.html")
    ) {
      window.location.href = "/login.html";
    }
  }
});

// User management functions
const createUser = async (userData) => {
  try {
    // Create authentication account
    const userCredential = await auth.createUserWithEmailAndPassword(
      userData.email,
      userData.password
    );
    const user = userCredential.user;

    // Create user document in Firestore
    await usersRef.doc(user.uid).set({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phone: userData.phone,
      birthdate: userData.birthdate,
      school: userData.school,
      program: userData.program,
      userType: "applicant",
      createdAt: db.serverTimestamp(),
      status: "pending",
    });

    return user;
  } catch (error) {
    throw error;
  }
};

// Exam management functions
const createExam = async (examData) => {
  try {
    const examRef = await examsRef.add({
      title: examData.title,
      description: examData.description,
      type: examData.type,
      questions: examData.questions,
      duration: examData.duration,
      createdBy: auth.currentUser.uid,
      createdAt: db.serverTimestamp(),
      status: "active",
    });
    return examRef;
  } catch (error) {
    throw error;
  }
};

const submitExam = async (examId, answers) => {
  try {
    const submissionRef = await submissionsRef.add({
      examId: examId,
      userId: auth.currentUser.uid,
      answers: answers,
      submittedAt: db.serverTimestamp(),
      status: "submitted",
    });
    return submissionRef;
  } catch (error) {
    throw error;
  }
};

// Interview management functions
const scheduleInterview = async (interviewData) => {
  try {
    const interviewRef = await interviewsRef.add({
      applicantId: interviewData.applicantId,
      scheduledBy: auth.currentUser.uid,
      dateTime: interviewData.dateTime,
      duration: interviewData.duration,
      meetingLink: interviewData.meetingLink,
      status: "scheduled",
      createdAt: db.serverTimestamp(),
    });
    return interviewRef;
  } catch (error) {
    throw error;
  }
};

// Statistics and reporting functions
const getApplicationStatistics = async () => {
  try {
    const stats = {
      total: 0,
      pending: 0,
      passed: 0,
      failed: 0,
    };

    const snapshot = await usersRef.where("userType", "==", "applicant").get();
    snapshot.forEach((doc) => {
      const data = doc.data();
      stats.total++;
      stats[data.status]++;
    });

    return stats;
  } catch (error) {
    throw error;
  }
};

// Export Firebase services and functions
export {
  auth,
  db,
  storage,
  createUser,
  createExam,
  submitExam,
  scheduleInterview,
  getApplicationStatistics,
};
