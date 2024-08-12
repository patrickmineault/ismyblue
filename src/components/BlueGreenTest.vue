<template>
  <div class="blue-green-test-wrapper">
    <div :style="{ backgroundColor: currentColor }" class="blue-green-test-container">
      <div v-if="rounds < MAX_ROUNDS" class="blue-green-test-content">
        <transition name="fade-up" mode="out-in">
          <h1 v-if="showInitialMessage" key="initial" class="blue-green-test-title">
            <span class="background-white">Test <i>your</i> color perception</span>
          </h1>
          <h1 v-else key="main" class="blue-green-test-title">
            <span class="background-white">Is <i>my</i> blue <i>your</i> blue?</span>
          </h1>
        </transition>
      </div>
      <div v-else class="blue-green-test-content blue-green-test-result-screen">
        <div class="blue-green-test-result-color" :style="{ backgroundColor: bluerColor }">
          <p class="result-text">This is <i>your</i> blue</p>
        </div>
        <div class="blue-green-test-result-text" :style="{ backgroundColor: currentColor }">
          <p class="result-text">Boundary at hue {{ finalHue.toFixed(1) }}</p>
        </div>
        <div class="blue-green-test-result-color" :style="{ backgroundColor: greenerColor }">
          <p class="result-text">This is <i>your</i> green</p>
        </div>
      </div>
      <div v-if="rounds < MAX_ROUNDS" class="blue-green-test-button-container three-buttons">
        <button @click="selectColor('blue')" class="blue-green-test-button blue-button grow-button">
          This is blue
        </button>
        <button @click="reset" class="blue-green-test-button mid-reset-button grow-button">
          Reset
        </button>
        <button
          @click="selectColor('green')"
          class="blue-green-test-button green-button grow-button"
        >
          This is green
        </button>
      </div>
      <div v-else class="blue-green-test-button-container two-buttons">
        <button
          @click="submitResults"
          class="blue-green-test-button submit-button grow-button"
          :disabled="submitted"
        >
          {{ submitted ? 'Submitted!' : 'Submit results' }}
        </button>
        <button @click="reset" class="blue-green-test-button final-reset-button grow-button">
          Reset
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { createClient } from '@supabase/supabase-js'
import { MAX_ROUNDS, SUPABASE_URL, SUPABASE_KEY } from '@/config'
import confetti from 'https://cdn.skypack.dev/canvas-confetti'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export default {
  data() {
    return {
      MAX_ROUNDS: MAX_ROUNDS,
      blueHue: 240,
      greenHue: 120,
      currentHue: 210,
      phi: (1 + Math.sqrt(5)) / 2, // Golden ratio
      showInitialMessage: true,
      rounds: 0,
      finalHue: 0,
      responses: [],
      userAgent: '',
      screenWidth: 0,
      screenHeight: 0,
      colorDepth: 0,
      pixelRatio: 1,
      timestamp: '',
      submitted: false
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
        this.blueHue = this.currentHue
      } else {
        this.greenHue = this.currentHue
      }
      this.currentHue = this.blueHue + (this.greenHue - this.blueHue) / this.phi
      this.rounds++
      if (this.rounds === MAX_ROUNDS) {
        this.finalHue = this.currentHue
        confetti()
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
      this.submitted = false
      this.responses = []
      setTimeout(() => {
        this.showInitialMessage = false
      }, 2000)
    },
    async submitResults() {
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

        this.submitted = true
      } catch (error) {
        console.error('Error submitting results:', error)
        alert('Failed to submit results. Please try again.')
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
  height: 100dvh;
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
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: black;
  text-align: center;
  width: 100%;
}

.blue-green-test-result-screen {
  display: flex;
  flex-direction: column;
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
  padding: 1rem;
}

.blue-green-test-result-text {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 1rem;
  background-color: rgba(255, 255, 255, 0.8);
}

.result-text,
.background-white {
  background-color: white;
  color: black;
  font-weight: bold;
  padding: 1px;
}

.result-text {
  font-size: 1.5rem;
}

.blue-green-test-button-container {
  width: 100%;
  height: 60px;
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.blue-green-test-button {
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  font-weight: bold;
  flex: 1 auto;
  margin: 0;
  background-color: black;
  color: white;
  overflow: hidden;
  display: inline-block;
  box-shadow: inset 0 0 0 0 rgba(255, 255, 255, 1);
}

.mid-reset-button {
  border-left: 1px solid white;
  border-right: 1px solid white;
}

.final-reset-button {
  border-left: 1px solid white;
}

.blue-green-test-button:disabled {
  cursor: not-allowed;
  background-color: #222;
}

.blue-green-test-button:focus {
  outline: none;
}

.blue-green-test-button:focus-visible {
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 1);
}

.three-buttons .blue-green-test-button {
  width: 33.3333%;
}

.two-buttons .blue-green-test-button {
  width: 50%;
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

@media (hover: hover) and (pointer: fine) {
  .blue-green-test-button:hover:not(:disabled) {
    box-shadow: inset 0 0 0 4px rgba(255, 255, 255, 1);
  }
}

@media (hover: none) {
  .blue-green-test-button:hover {
    box-shadow: none;
  }
}

.blue-green-test-button:active:not(:disabled) {
  box-shadow: inset 0 0 0 4px rgba(255, 255, 255, 1);
  transition: box-shadow 0.1s ease;
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
</style>
