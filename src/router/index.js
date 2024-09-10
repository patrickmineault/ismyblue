import { createRouter, createWebHistory } from 'vue-router'
import ColorTest from '@/components/ColorTest.vue'
import Results from '@/components/Results.vue'
import SharedResults from '@/components/SharedResults.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: ColorTest
  },
  {
    path: '/results',
    name: 'Results',
    component: Results,
    props: true
  },
  {
    path: '/result/:id',
    name: 'SharedResult',
    component: SharedResults,
    props: (route) => ({
      id: route.params.id
      // userThresholds: JSON.parse(route.query.userThresholds || '[]')
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
