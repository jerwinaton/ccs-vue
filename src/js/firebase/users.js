// Firebase User Management and Database Structure
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { createUserWithEmailAndPassword, deleteUser } from "firebase/auth";
import { db, auth } from "@/js/firebase-config";

// Collection References
const usersCollection = collection(db, "users");
const applicantsCollection = collection(db, "applicants");
const adminsCollection = collection(db, "admins");

// User Roles
const USER_ROLES = {
  ADMIN: "admin",
  APPLICANT: "applicant",
};

// User Management Class
class UserManager {
  // Create new applicant
  static async createApplicant(userData) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );
      const uid = userCredential.user.uid;

      const applicantData = {
        uid,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        middleName: userData.middleName || "",
        contactNumber: userData.contactNumber,
        address: userData.address,
        birthDate: userData.birthDate,
        gender: userData.gender,
        school: userData.school,
        strand: userData.strand,
        role: USER_ROLES.APPLICANT,
        applicationStatus: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        examStatus: "not_taken",
        examSchedule: null,
        interviewStatus: "not_scheduled",
        interviewSchedule: null,
        documents: {
          reportCard: null,
          goodMoral: null,
          birthCertificate: null,
          medicalCertificate: null,
        },
      };

      await setDoc(doc(applicantsCollection, uid), applicantData);
      await setDoc(doc(usersCollection, uid), {
        uid,
        email: userData.email,
        role: USER_ROLES.APPLICANT,
        createdAt: serverTimestamp(),
      });

      return { success: true, uid };
    } catch (error) {
      console.error("Error creating applicant:", error);
      throw error;
    }
  }

  // Create new admin
  static async createAdmin(adminData) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        adminData.email,
        adminData.password
      );
      const uid = userCredential.user.uid;

      const adminProfileData = {
        uid,
        email: adminData.email,
        firstName: adminData.firstName,
        lastName: adminData.lastName,
        role: USER_ROLES.ADMIN,
        permissions: adminData.permissions || ["read"],
        department: adminData.department,
        position: adminData.position,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: adminData.createdBy || null,
        lastLogin: null,
      };

      await setDoc(doc(adminsCollection, uid), adminProfileData);
      await setDoc(doc(usersCollection, uid), {
        uid,
        email: adminData.email,
        role: USER_ROLES.ADMIN,
        createdAt: serverTimestamp(),
      });

      return { success: true, uid };
    } catch (error) {
      console.error("Error creating admin:", error);
      throw error;
    }
  }

  // Update user profile
  static async updateUserProfile(collectionRef, uid, updateData) {
    try {
      updateData.updatedAt = serverTimestamp();
      await updateDoc(doc(collectionRef, uid), updateData);
      return { success: true };
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  }

  // Get user profile by UID
  static async getUserProfile(uid) {
    try {
      const userDoc = await getDoc(doc(usersCollection, uid));
      if (!userDoc.exists()) throw new Error("User not found");

      const userData = userDoc.data();
      const profileDoc = await getDoc(
        doc(
          userData.role === USER_ROLES.APPLICANT
            ? applicantsCollection
            : adminsCollection,
          uid
        )
      );
      return profileDoc.exists() ? profileDoc.data() : null;
    } catch (error) {
      console.error("Error getting user profile:", error);
      throw error;
    }
  }

  // Get all applicants with optional filters
  static async getApplicants(filters = {}) {
    try {
      let q = query(applicantsCollection);
      if (filters.applicationStatus)
        q = query(
          q,
          where("applicationStatus", "==", filters.applicationStatus)
        );
      if (filters.examStatus)
        q = query(q, where("examStatus", "==", filters.examStatus));
      if (filters.interviewStatus)
        q = query(q, where("interviewStatus", "==", filters.interviewStatus));

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => doc.data());
    } catch (error) {
      console.error("Error getting applicants:", error);
      throw error;
    }
  }

  // Delete user and their profile
  static async deleteUser(uid) {
    try {
      const userDoc = await getDoc(doc(usersCollection, uid));
      if (!userDoc.exists()) throw new Error("User not found");

      const userData = userDoc.data();
      await deleteDoc(
        doc(
          userData.role === USER_ROLES.APPLICANT
            ? applicantsCollection
            : adminsCollection,
          uid
        )
      );
      await deleteDoc(doc(usersCollection, uid));
      await deleteUser(auth.currentUser);

      return { success: true };
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }
}

// Export the UserManager class
export { UserManager, USER_ROLES };
