import { createRouter, createWebHistory } from 'vue-router'
import ColorTest from '@/components/ColorTest.vue'
import ResultsView from '@/components/Results.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: ColorTest
  },
  {
    path: '/result/:id',
    name: 'Results',
    component: ResultsView,
    props: (route) => ({
      id: route.params.id
    })
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'Home' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  console.log('Navigating to:', to.path)
  next()
})

export default router
