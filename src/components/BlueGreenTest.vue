<template>
  <div class="blue-green-test-wrapper">
    <div :style="containerStyle" class="blue-green-test-container">
      <div v-if="!showResults" class="blue-green-test-content">
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
          :binPosition="BIN_POSITION"
          :count="BIN_COUNT"
          :xCdf="X_CDF"
          :yCdf="Y_CDF"
          :userThreshold="finalHue"
        />
      </div>
      <div v-if="rounds < MAX_ROUNDS" class="blue-green-test-button-container three-buttons">
        <button @click="selectColor(leftButton)" class="blue-green-test-button grow-button">
          This is {{ leftButton }}
        </button>
        <button @click="reset" class="blue-green-test-button mid-reset-button grow-button">
          Reset
        </button>
        <button @click="selectColor(rightButton)" class="blue-green-test-button grow-button">
          This is {{ rightButton }}
        </button>
      </div>
      <div v-else class="blue-green-test-button-container two-buttons">
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
    <div v-if="firstColorMislabeled" class="about-popup">
      <div class="about-content">
        <h2>Whoops!</h2>
        <p>
          The first color is always very green or very blue. If you mislabel the first color, you
          won't get accurate thresholds. This might indicate you have an unusually calibrated
          screen, a night filter, or you made a mistake. Try again?
        </p>
        <button @click="reset()" class="reset-button reset-button">Reset</button>
      </div>
    </div>
    <div
      v-if="rounds == MAX_ROUNDS && (allSame == 'blue' || allSame == 'green')"
      class="about-popup"
    >
      <div class="about-content">
        <h2>Whoops!</h2>
        <p>
          You labeled all the colors as {{ allSame }}. We can't infer a boundary based on your
          responses. This might indicate you have an unusually calibrated screen or a night filter.
        </p>
        <button @click="reset()" class="reset-button reset-button">Reset</button>
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
          Color perception is tricky to measure--vision scientists use specialized calibrated
          equipment to measure color perception. Graphic designers use physical color cards, such as
          those
          <a
            href="https://www.npr.org/2024/07/19/1197961103/pantone-colors-lawrence-herbert-stuart-semple-standards"
            >made by Pantone</a
          >, so that they can communicate colors unambiguously. Here we use your monitor or phone to
          test how you categorize colors, which is far from perfect, since your calibration may
          differ from mine.
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
          focuses on blue-green hues between 150 and 210. On the web, HSL coordinates are translated
          to
          <a href="https://en.wikipedia.org/wiki/SRGB">sRGB color space</a>, the standard color
          space of the web, which is not perceptually uniform. These sRGB values are translated
          nonlinearly to your monitor through a gamma curve.
        </p>
        <p>
          The test assumes that your responses between blue and green are represented by a sigmoid
          curve. It sequentially fits that sigmoid curve to your responses:
        </p>

        <img src="@/assets/formula.svg" alt="Formula" />
        <br />
        <p>
          This is equivalent to a logistic regression model. The test uses a maximum-a-posteriori
          (MAP) estimation algorithm (specifically, a second order Newton method implemented in pure
          JS, no calls to a backend) to fit the sigmoid curve to your responses, with a vague prior
          on the scale and offset parameters. It uses the fitted curve to determine which color will
          be presented next. It tries to be smart about where it samples new points, focusing on
          regions where you're predicted to be intermediately confident in your responses. To
          improve the validity of the results, it randomizes which points it samples, and uses a
          noise mask to mitigate visual adaptation.
        </p>
        <p>
          It's a curve fit, not a binary search. In theory, if you feel like you're guessing in the
          middle shades, or even guessing incorrectly, that should be fine. If you're inconsistent
          in the middle, the curve fit should be able to recover, although your estimated threshold
          will have larger error bars.
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
        <h2>What information does this website collect?</h2>
        <p>
          This website collects aggregate usage metrics to understand how many people use the site
          and when. Since we received plenty of responses to the test, we have closed data
          submission.
        </p>
        <h2>Who made this?</h2>
        <p>
          I'm Patrick Mineault, a neuroscience and AI researcher. I made this as a side project
          using Claude 3.5 Sonnet. I obtained a PhD in visual neuroscience from McGill in 2014. You
          can read <a href="https://neuroai.science">my blog here</a>.
        </p>
        <h2>Can I make a version of this for my favorite color pair?</h2>
        <p>
          <a href="https://github.com/patrickmineault/ismyblue">Right this way to Github.</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { MAX_ROUNDS, BIN_POSITION, BIN_COUNT, X_CDF, Y_CDF } from '@/config' // Adjust the import path as needed
</script>

<script>
import { MAX_ROUNDS, VERSION, BIN_POSITION, BIN_COUNT, X_CDF, Y_CDF } from '@/config'
import confetti from 'https://cdn.skypack.dev/canvas-confetti'
import Results from './Results.vue'
import { fitSigmoid } from '@/utils/glmUtils'

import maskImage from '@/assets/mask.png'

export default {
  components: {
    Results
  },
  data() {
    return {
      currentHue: Math.random() > 0.5 ? 150 : 210,
      showInitialMessage: true,
      polarity: 0,
      rounds: 0,
      finalHue: 0,
      responses: [],
      showMask: false,
      maskImageUrl: maskImage,
      showAbout: false,
      showDemo: false,
      greenButtonRight: Math.random() > 0.5,
      firstColorMislabeled: false,
      allSame: false,
      showResults: false,
      errorMessage: ''
    }
  },
  computed: {
    rightButton() {
      return this.greenButtonRight ? 'green' : 'blue'
    },
    leftButton() {
      return this.greenButtonRight ? 'blue' : 'green'
    },
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

      if (this.rounds === 0) {
        if (color === 'blue' && this.currentHue < 180) {
          this.firstColorMislabeled = true
        } else if (color === 'green' && this.currentHue > 180) {
          this.firstColorMislabeled = true
        }
        if (this.firstColorMislabeled) {
          return
        }
      }

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
        if (
          this.responses.every((r) => r.response === 'blue') ||
          this.responses.every((r) => r.response === 'green')
        ) {
          this.allSame = this.responses[0].response
          return
        }
        this.finalHue = 180 - b
        this.currentHue = this.finalHue
        this.showResults = true
        confetti()
      }
      this.showMask = true
      setTimeout(() => {
        this.showMask = false
      }, 200)
    },
    reset() {
      let currentHue = Math.random() > 0.5 ? 150 : 210
      if (this.firstColorMislabeled) {
        currentHue = this.currentHue == 210 ? 150 : 210
      }

      this.currentHue = currentHue
      this.rounds = 0
      this.finalHue = 0
      this.polarity = 0
      this.showInitialMessage = true
      this.responses = []
      this.showMask = false
      this.firstColorMislabeled = false
      this.allSame = false
      this.showResults = false

      setTimeout(() => {
        this.showInitialMessage = false
      }, 2000)
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

.about-content h3 {
  font-size: 1.2rem;
  margin-top: 1rem;
}

.about-content p {
  margin-bottom: 1rem;
}

/* Ensure text inputs match select styling */
input[type='text'].form-control {
  border: 2px solid #4a90e2;
}

/* Style for the submit button */
.reset-button {
  background-color: #4a90e2;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.reset-button:hover {
  background-color: #2a70c2;
}
</style>
