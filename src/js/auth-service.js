import { 
    getAuth, 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged 
} from 'firebase/auth';
import { applicantService, adminService } from './firestore-service.js';

const auth = getAuth();

export const authService = {
    // Initialize auth state listener
    initAuthStateListener(callback) {
        return onAuthStateChanged(auth, callback);
    },

    // Sign in
    async signIn(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Check if admin
            const adminResult = await adminService.getAdmin(user.uid);
            if (adminResult.success) {
                return { success: true, user, role: 'admin', data: adminResult.data };
            }
            
            // Check if applicant
            const applicantResult = await applicantService.getApplicant(user.uid);
            if (applicantResult.success) {
                return { success: true, user, role: 'applicant', data: applicantResult.data };
            }
            
            return { success: false, error: 'User profile not found' };
        } catch (error) {
            console.error('Sign in error:', error);
            return { success: false, error: error.message };
        }
    },

    // Register new applicant
    async registerApplicant(email, password, applicantData) {
        try {
            // Create authentication user
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Create applicant profile
            const result = await applicantService.createApplicant({
                uid: user.uid,
                email,
                ...applicantData
            });

            if (!result.success) {
                throw new Error('Failed to create applicant profile');
            }

            return { success: true, user };
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: error.message };
        }
    },

    // Sign out
    async signOut() {
        try {
            await signOut(auth);
            return { success: true };
        } catch (error) {
            console.error('Sign out error:', error);
            return { success: false, error: error.message };
        }
    },

    // Get current user
    getCurrentUser() {
        return auth.currentUser;
    }
};
