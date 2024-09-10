<template>
  <div class="results-container color-test-content color-test-result-screen">
    <ColorResultsDisplay :userThresholds="userThresholds" />

    <!-- Conditional rendering for the action buttons -->
    <BottomButtons :showTestButtons="false" @reset="$emit('reset')" />

    <!-- New card for shared results -->
    <FloatingShareCard
      :isSharedResult="isSharedResult"
      :shareLink="shareLink"
      @start-test="$emit('start-test')"
    />
  </div>
</template>

<script>
import BottomButtons from './BottomButtons.vue'
import FloatingShareCard from './FloatingShareCard.vue'
import ColorResultsDisplay from './ColorResultsDisplay.vue'

export default {
  components: { BottomButtons, FloatingShareCard, ColorResultsDisplay },
  props: {
    userThresholds: {
      type: Array,
      default: () => []
    },
    isSharedResult: {
      type: Boolean,
      default: false
    },
    shareLink: {
      type: String,
      default: ''
    }
  },
  emits: ['reset', 'start-test']
}
</script>

<style scoped>
.results-container {
  width: 100%;
  height: auto;
  min-height: 100vh;
  overflow-y: visible;
  position: relative;
  padding-bottom: 40px;
}

.color-test-content.color-test-result-screen {
  height: auto !important;
  overflow: visible !important;
}
</style>
