import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { collection, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/js/firebase-config";

export const useExamStore = defineStore("exam", () => {
  const exams = ref([]);
  const currentPage = ref(1);
  const itemsPerPage = 10;

  // Fetch exams from Firebase
  function initializeExams() {
    const examsRef = collection(db, "exams");
    onSnapshot(examsRef, (snapshot) => {
      exams.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    });
  }

  // Computed statistics
  const totalExams = computed(() => exams.value.length);
  const activeExams = computed(
    () => exams.value.filter((e) => e.status === "active").length
  );
  const completedToday = computed(() => {
    const today = new Date().toDateString();
    return exams.value.filter(
      (e) =>
        e.status === "completed" &&
        new Date(e.completedDate).toDateString() === today
    ).length;
  });

  const avgScore = computed(() => {
    const scores = exams.value.flatMap((e) => e.participantScores || []);
    return scores.length
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;
  });

  // Delete Exam
  async function deleteExam(examId) {
    await deleteDoc(doc(db, "exams", examId));
  }

  return {
    exams,
    currentPage,
    itemsPerPage,
    totalExams,
    activeExams,
    completedToday,
    avgScore,
    initializeExams,
    deleteExam,
  };
});
