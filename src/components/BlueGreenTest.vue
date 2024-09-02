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
        <Results
          :binPosition="binPosition"
          :count="count"
          :xCdf="xCdf"
          :yCdf="yCdf"
          :userThreshold="finalHue"
        />
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
import {
  MAX_ROUNDS,
  SUPABASE_URL,
  SUPABASE_KEY,
  VERSION,
  BIN_POSITION,
  BIN_COUNT,
  X_CDF,
  Y_CDF
} from '@/config'
import confetti from 'https://cdn.skypack.dev/canvas-confetti'
import Results from './Results.vue'
import { fitSigmoid } from '@/utils/glmUtils'

import maskImage from '@/assets/mask.png'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export default {
  components: {
    Results
  },
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
      maskImageUrl: maskImage,
      binPosition: BIN_POSITION,
      count: BIN_COUNT,
      xCdf: X_CDF,
      yCdf: Y_CDF
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
      if (this.rounds === MAX_ROUNDS) {
        return {
          backgroundColor: 'white'
        }
      } else if (this.showMask) {
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

<style src="./BlueGreenTest.css" scoped />
