import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/login",
      name: "login",

      component: () => import("../views/Login.vue"),
    },
    {
      path: "/register",
      name: "register",

      component: () => import("../views/Register.vue"),
    },
    {
      path: "/applicant/dashboard",
      name: "applicantDashboard",

      component: () => import("../views/applicant/Dashboard.vue"),
    },
    {
      path: "/applicant/take-exam",
      name: "applicantTakeExam",

      component: () => import("../views/applicant/TakeExam.vue"),
    },
    {
      path: "/applicant/exam-results",
      name: "applicantExamResults",

      component: () => import("../views/applicant/ExamResults.vue"),
    },
    {
      path: "/admin/dashboard",
      name: "adminDashboard",

      component: () => import("../views/admin/Dashboard.vue"),
    },
    {
      path: "/admin/exams",
      name: "adminExams",

      component: () => import("../views/admin/Exams.vue"),
    },
    {
      path: "/admin/interviews",
      name: "adminInterviews",

      component: () => import("../views/admin/Interviews.vue"),
    },
    {
      path: "/admin/create-exam",
      name: "adminCreateExam",

      component: () => import("../views/admin/CreateExam.vue"),
    },
  ],
});

export default router;
