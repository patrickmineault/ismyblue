<template>
  <div>
    <Results :userThresholds="userThresholds" :isSharedResult="!hasCompletedOwnTest" />
    <!-- <div v-if="!hasCompletedOwnTest" class="floating-share-card">
      <div class="share-content">
        <h3>See how you compare!</h3>
        <button @click="startTest" class="start-test-button">Start Test</button>
      </div>
    </div> -->
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Results from './Results.vue'
import supabase from '@/supabaseClient'

export default {
  components: { Results },
  props: {
    id: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const router = useRouter()
    const userThresholds = ref([])
    const hasCompletedOwnTest = ref(false)

    onMounted(async () => {
      // Check if the user has completed their own test
      hasCompletedOwnTest.value = localStorage.getItem('hasCompletedTest') === 'true'

      try {
        const { data, error } = await supabase
          .from('color_test_results')
          .select('final_hues')
          .eq('id', props.id)
          .single()

        if (error) throw error

        userThresholds.value = data.final_hues
      } catch (error) {
        console.error('Error fetching shared results:', error)
      }
    })

    const startTest = () => {
      router.push('/')
    }

    return { startTest, userThresholds, hasCompletedOwnTest }
  }
}
</script>
