import { 
    getFirestore, 
    collection, 
    doc, 
    addDoc, 
    getDoc, 
    getDocs, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    orderBy, 
    limit,
    startAfter,
    serverTimestamp 
} from 'firebase/firestore';

const db = getFirestore();

// Applicant Management
export const applicantService = {
    async createApplicant(applicantData) {
        try {
            const applicantsRef = collection(db, 'applicants');
            const docRef = await addDoc(applicantsRef, {
                ...applicantData,
                status: 'pending',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error('Error creating applicant:', error);
            return { success: false, error: error.message };
        }
    },

    async getApplicant(applicantId) {
        try {
            const docRef = doc(db, 'applicants', applicantId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
            }
            return { success: false, error: 'Applicant not found' };
        } catch (error) {
            console.error('Error getting applicant:', error);
            return { success: false, error: error.message };
        }
    },

    async updateApplicantStatus(applicantId, status) {
        try {
            const docRef = doc(db, 'applicants', applicantId);
            await updateDoc(docRef, {
                status,
                updatedAt: serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            console.error('Error updating applicant status:', error);
            return { success: false, error: error.message };
        }
    },

    async queryApplicants({ status, course, page = 1, limit: pageSize = 10 }) {
        try {
            let q = collection(db, 'applicants');
            const conditions = [];

            if (status) conditions.push(where('status', '==', status));
            if (course) conditions.push(where('course', '==', course));
            conditions.push(orderBy('createdAt', 'desc'));
            conditions.push(limit(pageSize));

            if (page > 1 && this.lastDocument) {
                conditions.push(startAfter(this.lastDocument));
            }

            q = query(q, ...conditions);
            const snapshot = await getDocs(q);
            
            const applicants = [];
            snapshot.forEach(doc => {
                applicants.push({ id: doc.id, ...doc.data() });
            });

            this.lastDocument = snapshot.docs[snapshot.docs.length - 1];

            return { 
                success: true, 
                data: applicants,
                hasMore: snapshot.docs.length === pageSize
            };
        } catch (error) {
            console.error('Error querying applicants:', error);
            return { success: false, error: error.message };
        }
    }
};

// Exam Management
export const examService = {
    async createExam(examData) {
        try {
            const examsRef = collection(db, 'exams');
            const docRef = await addDoc(examsRef, {
                ...examData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error('Error creating exam:', error);
            return { success: false, error: error.message };
        }
    },

    async getExam(examId) {
        try {
            const docRef = doc(db, 'exams', examId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
            }
            return { success: false, error: 'Exam not found' };
        } catch (error) {
            console.error('Error getting exam:', error);
            return { success: false, error: error.message };
        }
    },

    async submitExamResult(examId, applicantId, resultData) {
        try {
            const resultsRef = collection(db, 'examResults');
            const docRef = await addDoc(resultsRef, {
                examId,
                applicantId,
                ...resultData,
                submittedAt: serverTimestamp()
            });
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error('Error submitting exam result:', error);
            return { success: false, error: error.message };
        }
    },

    async getApplicantExamResults(applicantId) {
        try {
            const q = query(
                collection(db, 'examResults'),
                where('applicantId', '==', applicantId),
                orderBy('submittedAt', 'desc')
            );
            const snapshot = await getDocs(q);
            
            const results = [];
            snapshot.forEach(doc => {
                results.push({ id: doc.id, ...doc.data() });
            });
            
            return { success: true, data: results };
        } catch (error) {
            console.error('Error getting exam results:', error);
            return { success: false, error: error.message };
        }
    }
};

// Interview Management
export const interviewService = {
    async scheduleInterview(interviewData) {
        try {
            const interviewsRef = collection(db, 'interviews');
            const docRef = await addDoc(interviewsRef, {
                ...interviewData,
                status: 'scheduled',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error('Error scheduling interview:', error);
            return { success: false, error: error.message };
        }
    },

    async updateInterviewStatus(interviewId, status, notes = '') {
        try {
            const docRef = doc(db, 'interviews', interviewId);
            await updateDoc(docRef, {
                status,
                notes,
                updatedAt: serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            console.error('Error updating interview status:', error);
            return { success: false, error: error.message };
        }
    },

    async getApplicantInterviews(applicantId) {
        try {
            const q = query(
                collection(db, 'interviews'),
                where('applicantId', '==', applicantId),
                orderBy('scheduledAt', 'desc')
            );
            const snapshot = await getDocs(q);
            
            const interviews = [];
            snapshot.forEach(doc => {
                interviews.push({ id: doc.id, ...doc.data() });
            });
            
            return { success: true, data: interviews };
        } catch (error) {
            console.error('Error getting interviews:', error);
            return { success: false, error: error.message };
        }
    },

    async queryInterviews({ status, date, interviewer, page = 1, limit: pageSize = 10 }) {
        try {
            let q = collection(db, 'interviews');
            const conditions = [];

            if (status) conditions.push(where('status', '==', status));
            if (date) conditions.push(where('scheduledAt', '>=', date));
            if (interviewer) conditions.push(where('interviewerId', '==', interviewer));
            conditions.push(orderBy('scheduledAt', 'asc'));
            conditions.push(limit(pageSize));

            if (page > 1 && this.lastDocument) {
                conditions.push(startAfter(this.lastDocument));
            }

            q = query(q, ...conditions);
            const snapshot = await getDocs(q);
            
            const interviews = [];
            snapshot.forEach(doc => {
                interviews.push({ id: doc.id, ...doc.data() });
            });

            this.lastDocument = snapshot.docs[snapshot.docs.length - 1];

            return { 
                success: true, 
                data: interviews,
                hasMore: snapshot.docs.length === pageSize
            };
        } catch (error) {
            console.error('Error querying interviews:', error);
            return { success: false, error: error.message };
        }
    }
};

// Admin Management
export const adminService = {
    async createAdmin(adminData) {
        try {
            const adminsRef = collection(db, 'admins');
            const docRef = await addDoc(adminsRef, {
                ...adminData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error('Error creating admin:', error);
            return { success: false, error: error.message };
        }
    },

    async getAdmin(adminId) {
        try {
            const docRef = doc(db, 'admins', adminId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
            }
            return { success: false, error: 'Admin not found' };
        } catch (error) {
            console.error('Error getting admin:', error);
            return { success: false, error: error.message };
        }
    },

    async updateAdminRole(adminId, role) {
        try {
            const docRef = doc(db, 'admins', adminId);
            await updateDoc(docRef, {
                role,
                updatedAt: serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            console.error('Error updating admin role:', error);
            return { success: false, error: error.message };
        }
    }
};

// Dashboard Statistics
export const dashboardService = {
    async getApplicationStats() {
        try {
            const stats = {
                total: 0,
                pending: 0,
                approved: 0,
                rejected: 0,
                byCourse: {}
            };

            const q = query(collection(db, 'applicants'));
            const snapshot = await getDocs(q);
            
            snapshot.forEach(doc => {
                const data = doc.data();
                stats.total++;
                stats[data.status]++;
                
                if (!stats.byCourse[data.course]) {
                    stats.byCourse[data.course] = 0;
                }
                stats.byCourse[data.course]++;
            });

            return { success: true, data: stats };
        } catch (error) {
            console.error('Error getting application stats:', error);
            return { success: false, error: error.message };
        }
    },

    async getExamStats() {
        try {
            const stats = {
                totalExams: 0,
                totalSubmissions: 0,
                averageScore: 0,
                passingRate: 0
            };

            const examsSnapshot = await getDocs(collection(db, 'exams'));
            stats.totalExams = examsSnapshot.size;

            const resultsSnapshot = await getDocs(collection(db, 'examResults'));
            let totalScore = 0;
            let passing = 0;

            resultsSnapshot.forEach(doc => {
                const data = doc.data();
                stats.totalSubmissions++;
                totalScore += data.score || 0;
                if (data.passed) passing++;
            });

            stats.averageScore = stats.totalSubmissions ? totalScore / stats.totalSubmissions : 0;
            stats.passingRate = stats.totalSubmissions ? (passing / stats.totalSubmissions) * 100 : 0;

            return { success: true, data: stats };
        } catch (error) {
            console.error('Error getting exam stats:', error);
            return { success: false, error: error.message };
        }
    }
};
