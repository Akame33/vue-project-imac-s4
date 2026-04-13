import { createRouter, createWebHistory } from "vue-router"
import FlagListView from "../views/FlagListView.vue"
import QuizView from "../views/QuizView.vue"

const routes = [
  {
    path: "/",
    name: "flag-list",
    component: FlagListView
  },
  {
    path: "/quiz",
    name: "quiz",
    component: QuizView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router