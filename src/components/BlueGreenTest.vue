<template>
  <div class="blue-green-test-wrapper">
    <div :style="{ backgroundColor: currentColor }" class="blue-green-test-container">
      <div v-if="rounds < 6" class="blue-green-test-content">
        <transition name="fade-up" mode="out-in">
          <h1 v-if="showInitialMessage" key="initial" class="blue-green-test-title">
            Test your color perception
          </h1>
          <h1 v-else key="main" class="blue-green-test-title">Is My Blue Your Blue?</h1>
        </transition>
      </div>
      <div v-else class="blue-green-test-content blue-green-test-result-screen">
        <div class="blue-green-test-result-color" :style="{ backgroundColor: bluerColor }">
          <p>This is Blue</p>
        </div>
        <div class="blue-green-test-result-text">
          <p>Your boundary is at hue {{ finalHue.toFixed(1) }}</p>
        </div>
        <div class="blue-green-test-result-color" :style="{ backgroundColor: greenerColor }">
          <p>This is Green</p>
        </div>
      </div>
      <div class="blue-green-test-button-container" :class="{ 'end-state': rounds >= 7 }">
        <button
          @click="selectColor('green')"
          class="blue-green-test-button"
          :class="{ invisible: rounds >= 7 }"
        >
          This is Blue
        </button>
        <button @click="reset" class="blue-green-test-button blue-green-test-reset-button">
          Reset
        </button>
        <button
          @click="selectColor('blue')"
          class="blue-green-test-button"
          :class="{ invisible: rounds >= 7 }"
        >
          This is Green
        </button>
      </div>
      <button
        v-if="rounds >= 6"
        @click="submitResults"
        class="blue-green-test-button blue-green-test-submit-button"
      >
        Submit your results
      </button>
    </div>
  </div>
</template>

<script>
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://agbofzcbkywbsojudbry.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnYm9memNia3l3YnNvanVkYnJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjMzNDQ0ODAsImV4cCI6MjAzODkyMDQ4MH0.WeYGvm00hGFeCJWQS-YWz-xm66OKq6Gu8zicRxoxYxg'
)

export default {
  data() {
    return {
      blueHue: 240,
      greenHue: 120,
      currentHue: 210,
      phi: (1 + Math.sqrt(5)) / 2, // Golden ratio
      showInitialMessage: true,
      rounds: 0,
      finalHue: 0,
      responses: [],
      submitting: false,
      userAgent: '',
      screenWidth: 0,
      screenHeight: 0,
      colorDepth: 0,
      pixelRatio: 1,
      timestamp: ''
    }
  },
  computed: {
    currentColor() {
      return `hsl(${this.currentHue}, 100%, 50%)`
    },
    bluerColor() {
      return `hsl(${this.finalHue + 5}, 100%, 50%)`
    },
    greenerColor() {
      return `hsl(${this.finalHue - 5}, 100%, 50%)`
    }
  },
  methods: {
    selectColor(color) {
      if (color === 'blue') {
        this.greenHue = this.currentHue
      } else {
        this.blueHue = this.currentHue
      }
      this.currentHue = this.blueHue + (this.greenHue - this.blueHue) / this.phi
      this.rounds++
      if (this.rounds === 6) {
        this.finalHue = this.currentHue
      }
      this.responses.push({ hue: this.currentHue, response: color })
    },
    reset() {
      this.blueHue = 240
      this.greenHue = 120
      this.currentHue = 210
      this.rounds = 0
      this.finalHue = 0
      this.showInitialMessage = true
      this.responses = []
      setTimeout(() => {
        this.showInitialMessage = false
      }, 2000)
    },
    async submitResults() {
      if (this.submitting) return
      this.submitting = true

      this.gatherDeviceInfo()
      this.timestamp = new Date().toISOString()

      try {
        const { data, error } = await supabase.from('color_test_results').insert([
          {
            user_agent: this.userAgent,
            screen_width: this.screenWidth,
            screen_height: this.screenHeight,
            color_depth: this.colorDepth,
            pixel_ratio: this.pixelRatio,
            timestamp: this.timestamp,
            responses: this.responses,
            final_hue: this.finalHue
          }
        ])

        if (error) throw error

        alert('Results submitted successfully!')
      } catch (error) {
        console.error('Error submitting results:', error)
        alert('Failed to submit results. Please try again.')
      } finally {
        this.submitting = false
      }
    },
    gatherDeviceInfo() {
      this.userAgent = navigator.userAgent
      this.screenWidth = window.screen.width
      this.screenHeight = window.screen.height
      this.colorDepth = window.screen.colorDepth
      this.pixelRatio = window.devicePixelRatio || 1
    }
  },
  mounted() {
    setTimeout(() => {
      this.showInitialMessage = false
    }, 2000)
  }
}
</script>

<style scoped>
.blue-green-test-wrapper {
  width: 100vw !important;
  max-width: none !important;
  height: 100vh;
  overflow: hidden;
}

.blue-green-test-container {
  width: 100% !important;
  max-width: none !important;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.blue-green-test-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100% !important;
  max-width: none !important;
}

.blue-green-test-title {
  font-size: 2.25rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: black;
  text-align: center;
  width: 100%;
}

.blue-green-test-button-container {
  width: 100%;
  padding: 0 20px 20px; /* Reduced padding for all screen sizes */
  display: flex;
  gap: 0.5rem; /* Reduced gap between buttons */
}

.blue-green-test-button {
  flex: 1;
  padding: 0.75rem 0; /* Slightly reduced vertical padding */
  background-color: #f0f0f0;
  color: #1f2937;
  font-weight: bold;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 0.9rem; /* Slightly smaller font size */
}

.blue-green-test-reset-button {
  flex: 0.8; /* Slightly larger than before to give it more space */
}

/* Adjust padding and font size for larger screens */
@media (min-width: 640px) {
  .blue-green-test-button-container {
    padding: 0 50px 50px; /* Return to original padding for larger screens */
    gap: 1rem;
  }

  .blue-green-test-button {
    padding: 1rem 0;
    font-size: 1rem;
  }

  .blue-green-test-reset-button {
    flex: 0.5; /* Return to original size for larger screens */
  }
}
.blue-green-test-button:hover:not(:disabled):not(.invisible) {
  background-color: #e0e0e0;
}

.blue-green-test-button.invisible {
  opacity: 0;
  pointer-events: none;
}

.blue-green-test-reset-button {
  flex: 0.5;
}

.blue-green-test-result-screen {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  width: 100% !important;
  max-width: none !important;
  height: 100%;
}

.blue-green-test-result-color {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.blue-green-test-result-text {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 1rem;
}

.blue-green-test-result-screen p {
  color: black;
  font-size: 1.5rem;
  font-weight: bold;
}

.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.5s ease;
}

.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

@media (min-width: 640px), (min-width: 1024px) {
  .blue-green-test-wrapper,
  .blue-green-test-container,
  .blue-green-test-content,
  .blue-green-test-result-screen {
    width: 100vw !important;
    max-width: none !important;
  }
}

@media (min-width: 1024px) {
  .blue-green-test-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
}

.blue-green-test-submit-button {
  margin-top: 1rem;
  background-color: #4caf50;
  color: white;
}
.blue-green-test-submit-button:hover {
  background-color: #45a049;
}
</style>
