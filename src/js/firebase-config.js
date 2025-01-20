// Import the functions you need from the SDKs you need
import firebase from "firebase/app";
import "firebase/auth"; // Import firebase auth separately
import "firebase/firestore"; // Import firestore

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
// Initialize Firebase app
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app(); // if already initialized
}

// Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

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
      !currentPath.includes("login") &&
      !currentPath.includes("register") &&
      !currentPath.includes("index")
    ) {
      window.location.href = "/login";
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
  createUser,
  createExam,
  submitExam,
  scheduleInterview,
  getApplicationStatistics,
};
