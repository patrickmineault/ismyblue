<template>
  <div class="blue-green-test-wrapper">
    <div :style="containerStyle" class="blue-green-test-container">
      <div v-if="rounds < MAX_ROUNDS" class="blue-green-test-content">
        <transition name="fade-up" mode="out-in">
          <h1 v-if="showInitialMessage" key="initial" class="blue-green-test-title">
            <span class="background-white">Test <i>your</i> color categorization</span>
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
        <button
          @click="showAbout = true"
          class="blue-green-test-button final-reset-button grow-button"
        >
          About
        </button>
        <button @click="reset" class="blue-green-test-button final-reset-button grow-button">
          Reset
        </button>
      </div>
    </div>
    <div v-if="showAbout" class="about-popup">
      <div class="about-content">
        <button @click="showAbout = false" class="close-button">&times;</button>
        <h2>About This Website</h2>
        <p>
          People have different names for the colors they see.
          <a href="https://en.wikipedia.org/wiki/Sapir%E2%80%93Whorf_hypothesis" target="_blank"
            >Language can affect how we memorize and name colors</a
          >. This is a color naming test designed to measure your personal blue-green boundary.
        </p>
        <h2>Test validity</h2>
        <p>
          <b><i>This website is for entertainment purposes only.</i></b>
        </p>
        <p>
          Color perception is tricky to measure–vision scientists use specialized calibrated
          equipment to color perception. Graphic designers use physical color cards, such as those
          <a
            href="https://www.npr.org/2024/07/19/1197961103/pantone-colors-lawrence-herbert-stuart-semple-standards"
            >made by Pantone</a
          >, so that they can communicate colors unambiguously. Here we use your monitor or phone to
          test how you categorize colors, which is far from perfect.
        </p>
        <p>
          The validity of the inference is limited by the calibration of your monitor, ambient
          lighting, and filters such as night mode. Despite these limitations, the results should
          have good test-retest reliability <i>on the same device, in the same ambient light</i>,
          which you can verify by taking the test multiple times. If you want to compare your
          results with friends, use the same device in the same ambient light.
        </p>
        <p>
          Getting outlier results doesn't mean there's anything wrong with your vision. It might
          mean you have an idiosyncratic way of naming colors, or that your monitor and lighting is
          unusual.
        </p>
        <h2>Technical Details</h2>
        <p>
          The test asks you to categorize colors sequentially. Colors are often represented in HSL
          (hue, saturation, lightness) color space. Hue 120 is green, and hue 240 is blue. The test
          focuses on blue-green hues between 150 and 210. The test asssumes that your responses
          between blue and green are represented by a sigmoid curve. It sequentially fits that
          sigmoid curve to your responses, and uses the fitted curve to predict the color you will
          name next. The test uses a maximum-a-posteriori (MAP) estimation algorithm to fit the
          sigmoid curve to your responses. This is equivalent to a logistic regression model with a
          vague prior on the scale and offset parameters. It tries to be smart about where it
          samples new points, focusing on regions where you're intermediately confident in your
          responses. To improve the validity of the results, it randomizes which points it samples,
          and uses a noise mask to mitigate visual adaptation.
        </p>
        <h2>Results</h2>
        <p>
          In early experiments, we found that people's responses cluster around 175, which
          coincidentally is the same as the named HTML color turquoise
          <span class="color-chip-turquoise mr-1"></span>. This is interesting, because the nominal
          boundary between blue and green is at 180, the named HTML color cyan
          <span class="color-chip-cyan mr-1"></span>. That means most people's boundaries are
          shifted toward saying that cyan is blue.
        </p>
        <h2>What happens when I hit submit?</h2>
        <p>
          When you hit submit, we store your responses anonymously so we can aggregate them later
          and measure aggregate naming curves. We don't store any information that would identify
          you personally.
        </p>
        <h2>Who made this?</h2>
        <p>
          I'm Patrick Mineault, a neuroscience and AI researcher. I made this as a side project
          using Claude 3.5 Sonnet. I obtained a PhD in visual neuroscience from McGill in 2014. You
          can read <a href="https://neuroai.science">my blog here</a>.
        </p>
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
      yCdf: Y_CDF,
      showAbout: false
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
<style scoped>
.color-chip-turquoise {
  display: inline-block;
  width: 1em;
  height: 1em;
  background-color: turquoise;
  border: 2px solid black;
  border-radius: 0.2em;
  margin-bottom: -0.2em;
}
.color-chip-cyan {
  display: inline-block;
  width: 1em;
  height: 1em;
  background-color: cyan;
  border: 2px solid black;
  border-radius: 0.2em;
  margin-bottom: -0.2em;
}

.about-popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.about-content {
  background-color: white;
  color: black;
  padding: 2rem;
  border-radius: 8px;
  max-width: 80%;
  max-height: 80%;
  overflow-y: auto;
  position: relative;
  font-family: 'Cabin', sans-serif;
  font-size: 0.9rem;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
}

.about-content h2 {
  margin-top: 0;
  font-size: 1.2rem;
}

.about-content p {
  margin-bottom: 1rem;
}
</style>
