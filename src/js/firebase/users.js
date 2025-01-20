// Firebase User Management and Database Structure

// Initialize Firebase Auth
const auth = firebase.auth();
const db = firebase.firestore();

// Collection References
const usersCollection = db.collection('users');
const applicantsCollection = db.collection('applicants');
const adminsCollection = db.collection('admins');

// User Roles
const USER_ROLES = {
    ADMIN: 'admin',
    APPLICANT: 'applicant'
};

// User Management Class
class UserManager {
    // Create new applicant
    static async createApplicant(userData) {
        try {
            // Create auth user
            const userCredential = await auth.createUserWithEmailAndPassword(
                userData.email,
                userData.password
            );

            const uid = userCredential.user.uid;

            // Create applicant profile
            const applicantData = {
                uid: uid,
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                middleName: userData.middleName || '',
                contactNumber: userData.contactNumber,
                address: userData.address,
                birthDate: userData.birthDate,
                gender: userData.gender,
                school: userData.school,
                strand: userData.strand,
                role: USER_ROLES.APPLICANT,
                applicationStatus: 'pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                // Application specific fields
                examStatus: 'not_taken',
                examSchedule: null,
                interviewStatus: 'not_scheduled',
                interviewSchedule: null,
                documents: {
                    reportCard: null,
                    goodMoral: null,
                    birthCertificate: null,
                    medicalCertificate: null
                }
            };

            // Save to applicants collection
            await applicantsCollection.doc(uid).set(applicantData);
            // Save basic info to users collection
            await usersCollection.doc(uid).set({
                uid: uid,
                email: userData.email,
                role: USER_ROLES.APPLICANT,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            return { success: true, uid: uid };
        } catch (error) {
            console.error('Error creating applicant:', error);
            throw error;
        }
    }

    // Create new admin
    static async createAdmin(adminData) {
        try {
            // Create auth user
            const userCredential = await auth.createUserWithEmailAndPassword(
                adminData.email,
                adminData.password
            );

            const uid = userCredential.user.uid;

            // Create admin profile
            const adminProfileData = {
                uid: uid,
                email: adminData.email,
                firstName: adminData.firstName,
                lastName: adminData.lastName,
                role: USER_ROLES.ADMIN,
                permissions: adminData.permissions || ['read'],
                department: adminData.department,
                position: adminData.position,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                createdBy: adminData.createdBy || null,
                lastLogin: null
            };

            // Save to admins collection
            await adminsCollection.doc(uid).set(adminProfileData);
            // Save basic info to users collection
            await usersCollection.doc(uid).set({
                uid: uid,
                email: adminData.email,
                role: USER_ROLES.ADMIN,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            return { success: true, uid: uid };
        } catch (error) {
            console.error('Error creating admin:', error);
            throw error;
        }
    }

    // Update applicant profile
    static async updateApplicantProfile(uid, updateData) {
        try {
            const applicantRef = applicantsCollection.doc(uid);
            
            updateData.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
            
            await applicantRef.update(updateData);
            return { success: true };
        } catch (error) {
            console.error('Error updating applicant profile:', error);
            throw error;
        }
    }

    // Update admin profile
    static async updateAdminProfile(uid, updateData) {
        try {
            const adminRef = adminsCollection.doc(uid);
            
            updateData.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
            
            await adminRef.update(updateData);
            return { success: true };
        } catch (error) {
            console.error('Error updating admin profile:', error);
            throw error;
        }
    }

    // Get user profile by UID
    static async getUserProfile(uid) {
        try {
            const userDoc = await usersCollection.doc(uid).get();
            
            if (!userDoc.exists) {
                throw new Error('User not found');
            }

            const userData = userDoc.data();
            let profileData;

            if (userData.role === USER_ROLES.APPLICANT) {
                const applicantDoc = await applicantsCollection.doc(uid).get();
                profileData = applicantDoc.data();
            } else if (userData.role === USER_ROLES.ADMIN) {
                const adminDoc = await adminsCollection.doc(uid).get();
                profileData = adminDoc.data();
            }

            return profileData;
        } catch (error) {
            console.error('Error getting user profile:', error);
            throw error;
        }
    }

    // Get all applicants with optional filters
    static async getApplicants(filters = {}) {
        try {
            let query = applicantsCollection;

            // Apply filters
            if (filters.applicationStatus) {
                query = query.where('applicationStatus', '==', filters.applicationStatus);
            }
            if (filters.examStatus) {
                query = query.where('examStatus', '==', filters.examStatus);
            }
            if (filters.interviewStatus) {
                query = query.where('interviewStatus', '==', filters.interviewStatus);
            }

            const snapshot = await query.get();
            return snapshot.docs.map(doc => doc.data());
        } catch (error) {
            console.error('Error getting applicants:', error);
            throw error;
        }
    }

    // Get all admins with optional department filter
    static async getAdmins(department = null) {
        try {
            let query = adminsCollection;

            if (department) {
                query = query.where('department', '==', department);
            }

            const snapshot = await query.get();
            return snapshot.docs.map(doc => doc.data());
        } catch (error) {
            console.error('Error getting admins:', error);
            throw error;
        }
    }

    // Delete user and their profile
    static async deleteUser(uid) {
        try {
            const userDoc = await usersCollection.doc(uid).get();
            
            if (!userDoc.exists) {
                throw new Error('User not found');
            }

            const userData = userDoc.data();

            // Delete from respective collection
            if (userData.role === USER_ROLES.APPLICANT) {
                await applicantsCollection.doc(uid).delete();
            } else if (userData.role === USER_ROLES.ADMIN) {
                await adminsCollection.doc(uid).delete();
            }

            // Delete from users collection
            await usersCollection.doc(uid).delete();

            // Delete auth user
            await auth.currentUser.delete();

            return { success: true };
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }

    // Update application status
    static async updateApplicationStatus(uid, status, notes = '') {
        try {
            await applicantsCollection.doc(uid).update({
                applicationStatus: status,
                statusNotes: notes,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            console.error('Error updating application status:', error);
            throw error;
        }
    }

    // Update document URLs
    static async updateDocuments(uid, documentUrls) {
        try {
            await applicantsCollection.doc(uid).update({
                'documents': documentUrls,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            console.error('Error updating documents:', error);
            throw error;
        }
    }
}

// Export the UserManager class
export { UserManager, USER_ROLES };
