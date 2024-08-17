<template>
  <div class="blue-green-test-wrapper">
    <div :style="containerStyle" class="blue-green-test-container">
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
          <p class="result-text">Boundary at hue {{ Math.round(finalHue) }}</p>
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
import { MAX_ROUNDS, SUPABASE_URL, SUPABASE_KEY, VERSION } from '@/config'
import confetti from 'https://cdn.skypack.dev/canvas-confetti'

import maskImage from '@/assets/mask.png'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

let fitSigmoid = (hues, responses, polarity, tailProbability = 0.2) => {
  // Initialize parameters
  let a = 0.2 // Initial guess for a
  let b = 0 // Initial guess for b
  const priorA = { mean: 0.2, sd: 0.5 }
  const priorB = { mean: 0, sd: 30 }

  // Helper functions
  const sigmoid = (x) => {
    if (x >= 0) {
      return 1 / (1 + Math.exp(-x))
    } else {
      const z = Math.exp(x)
      return z / (1 + z)
    }
  }

  const logSigmoid = (x) => {
    if (x >= 0) {
      return -Math.log1p(Math.exp(-x))
    } else {
      return x - Math.log1p(Math.exp(x))
    }
  }

  const logLikelihood = (a, b) => {
    return hues.reduce((sum, hue, i) => {
      const z = a * (hue - 180 + b)
      return sum + (responses[i] ? logSigmoid(z) : logSigmoid(-z))
    }, 0)
  }

  // Newton's method
  for (let iter = 0; iter < 10; iter++) {
    // TODO: Add convergence check
    const ll = logLikelihood(a, b)
    const grad_a =
      hues.reduce((sum, hue, i) => {
        const z = a * (hue - 180 + b)
        const s = sigmoid(z)
        return sum + (responses[i] - s) * (hue - 180 + b)
      }, 0) -
      (a - priorA.mean) / priorA.sd ** 2
    const grad_b =
      hues.reduce((sum, hue, i) => {
        const z = a * (hue - 180 + b)
        const s = sigmoid(z)
        return sum + (responses[i] - s) * a
      }, 0) -
      (b - priorB.mean) / priorB.sd ** 2
    const hess_aa =
      hues.reduce((sum, hue) => {
        const z = a * (hue - 180 + b)
        const s = sigmoid(z)
        return sum - s * (1 - s) * (hue - 180 + b) ** 2
      }, 0) -
      1 / priorA.sd ** 2
    const hess_ab = hues.reduce((sum, hue) => {
      const z = a * (hue - 180 + b)
      const s = sigmoid(z)
      return sum - s * (1 - s) * a * (hue - 180 + b)
    }, 0)
    const hess_bb =
      hues.reduce((sum, hue) => {
        const z = a * (hue - 180 + b)
        const s = sigmoid(z)
        return sum - s * (1 - s) * a ** 2
      }, 0) -
      1 / priorB.sd ** 2

    const det = hess_aa * hess_bb - hess_ab ** 2
    const delta_a = (hess_bb * grad_a - hess_ab * grad_b) / det
    const delta_b = (hess_aa * grad_b - hess_ab * grad_a) / det

    a -= delta_a
    b -= delta_b

    // Clamp a to prevent divergence.
    a = Math.max(0.01, a)

    console.log(a, b)

    if (Math.abs(delta_a) < 1e-6 && Math.abs(delta_b) < 1e-6) {
      break
    }
  }

  // Calculate the new probe value
  if (polarity == 0) {
    polarity = Math.random() < 0.5 ? 1 : -1
  }
  let percentile = polarity > 0 ? tailProbability : 1 - tailProbability
  let newProbe = 180 - b + Math.log(percentile / (1 - percentile)) / a
  newProbe = Math.max(120, Math.min(newProbe, 240))

  return { a, b, polarity, newProbe }
}

export default {
  data() {
    return {
      MAX_ROUNDS: MAX_ROUNDS,
      currentHue: Math.random() > 0.5 ? 150 : 210,
      showInitialMessage: true,
      polarity: 0,
      rounds: 0,
      finalHue: 0,
      responses: [],
      userAgent: '',
      screenWidth: 0,
      screenHeight: 0,
      colorDepth: 0,
      pixelRatio: 1,
      timestamp: '',
      submitted: false,
      showMask: false,
      maskImageUrl: maskImage
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
    },
    containerStyle() {
      if (this.showMask) {
        return {
          backgroundColor: this.showMask ? 'transparent' : this.currentColor,
          backgroundImage: this.showMask ? `url(${this.maskImageUrl})` : 'none',
          backgroundRepeat: 'repeat',
          backgroundSize: 'auto'
        }
      } else {
        return {
          backgroundColor: this.currentColor
        }
      }
    }
  },
  methods: {
    selectColor(color) {
      this.responses.push({ hue: this.currentHue, response: color })

      // Get the new probe value
      const { b, newProbe, polarity } = fitSigmoid(
        this.responses.map((r) => r.hue),
        this.responses.map((r) => r.response === 'blue'),
        this.polarity,
        0.4
      )
      this.polarity = polarity == 1 ? -1 : 1
      this.currentHue = newProbe
      this.rounds++
      if (this.rounds === MAX_ROUNDS) {
        this.finalHue = 180 - b
        this.currentHue = this.finalHue
        confetti()
      }
      this.showMask = true
      setTimeout(() => {
        this.showMask = false
      }, 200)
    },
    reset() {
      this.currentHue = Math.random() > 0.5 ? 150 : 210
      this.rounds = 0
      this.finalHue = 0
      this.showInitialMessage = true
      this.submitted = false
      this.responses = []
      this.showMask = false
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
            final_hue: this.finalHue,
            version: VERSION
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
