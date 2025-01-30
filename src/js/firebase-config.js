/* eslint-disable no-useless-catch */
// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth"; // Import firebase auth separately
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore"; // Import firestore
import { useRouter } from "vue-router";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);

// Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

// Collection references
const usersRef = collection(db, "users");
const examsRef = collection(db, "exams");
const submissionsRef = collection(db, "submissions");
const interviewsRef = collection(db, "interviews");
// Authentication state observer
auth.onAuthStateChanged((user) => {
  if (user) {
    // User is signed in
    const userDocRef = doc(db, "users", user.uid);

    getDoc(userDocRef).then((docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        const userRole = userData.role;

        // Redirect based on user type if not on correct dashboard
        // Get current page path
        const currentPath = window.location.pathname;

        // Define allowed non-dashboard pages
        const allowedPages = [
          "/admin/dashboard",
          "/admin/exams",
          "/admin/interviews",
          "/admin/exams/create",
        ];
        // Only redirect to dashboard if not already on an allowed page
        if (
          !currentPath.includes(`${userRole}/dashboard`) &&
          !allowedPages.some((page) => currentPath.includes(page))
        ) {
          router.push(`/${userRole}/dashboard`);
        }
      }
    });
  } else {
    // User is signed out
    const currentPath = window.location.pathname;
    if (!["/login", "/register", "/index"].includes(currentPath)) {
      router.push("/login");
    }
  }
});

// User management functions
const createUser = async (userData) => {
  try {
    // Create authentication account
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userData.email,
      userData.password
    );
    const user = userCredential.user;

    // Create user document in Firestore
    await setDoc(doc(usersRef, user.uid), {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phone: userData.phone,
      birthdate: userData.birthdate,
      school: userData.school,
      program: userData.program,
      userType: "applicant",
      createdAt: serverTimestamp(),
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
    const examRef = await addDoc(examsRef, {
      title: examData.title,
      description: examData.description,
      type: examData.type,
      questions: examData.questions,
      duration: examData.duration,
      createdBy: auth.currentUser?.uid || null,
      createdAt: serverTimestamp(),
      status: "active",
    });
    return examRef;
  } catch (error) {
    throw error;
  }
};

const submitExam = async (examId, answers) => {
  try {
    const submissionRef = await addDoc(submissionsRef, {
      examId: examId,
      userId: auth.currentUser?.uid || null,
      answers: answers,
      submittedAt: serverTimestamp(),
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
    const interviewRef = await addDoc(interviewsRef, {
      applicantId: interviewData.applicantId,
      scheduledBy: auth.currentUser?.uid || null,
      dateTime: interviewData.dateTime,
      duration: interviewData.duration,
      meetingLink: interviewData.meetingLink,
      status: "scheduled",
      createdAt: serverTimestamp(),
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

    const applicantsQuery = query(
      usersRef,
      where("userType", "==", "applicant")
    );
    const snapshot = await getDocs(applicantsQuery);
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
  createUser,
  createExam,
  submitExam,
  scheduleInterview,
  getApplicationStatistics,
};
