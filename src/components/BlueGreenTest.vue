<template>
  <div class="color-wheel-test-wrapper">
    <div :style="containerStyle" class="color-wheel-test-container">
      <div v-if="!testCompleted" class="color-wheel-test-content">
        <transition name="fade-up" mode="out-in">
          <h1 v-if="showInitialMessage" key="initial" class="color-wheel-test-title">
            <span class="background-white">Test <i>your</i> color categorization</span>
          </h1>
          <h1 v-else-if="currentColorPairBasedOnHue" key="main" class="color-wheel-test-title">
            <span class="background-white">Is this {{ currentColorPairBasedOnHue.color1 }} or {{ currentColorPairBasedOnHue.color2 }}?</span>
          </h1>
          <p v-if="!showInitialMessage && currentColorPairBasedOnHue" class="debug-text">
  Debug: Actual color shown: {{ getColorNameForHue(currentHue) }}
</p>
        </transition>
      </div>
      <div v-else class="color-wheel-test-content color-wheel-test-result-screen">
        <Results :colorResults="colorResults" />
      </div>
      <div v-if="!testCompleted && currentColorPairBasedOnHue" class="color-wheel-test-button-container">
        <button @click="selectColor(currentColorPairBasedOnHue.color1)" class="color-wheel-test-button grow-button">
          {{ currentColorPairBasedOnHue.color1 }}
        </button>
        <button @click="selectColor(currentColorPairBasedOnHue.color2)" class="color-wheel-test-button grow-button">
          {{ currentColorPairBasedOnHue.color2 }}
        </button>
      </div>
      <div v-if="!testCompleted" class="color-wheel-test-button-container two-buttons">
        <button
          @click="submitResults"
          class="color-wheel-test-button submit-button grow-button"
          :disabled="submitted"
        >
          {{ submitted ? 'Submitted!' : 'Submit results' }}
        </button>
        <button
          @click="showAbout = true"
          class="color-wheel-test-button final-reset-button grow-button"
        >
          About
        </button>
        <button @click="reset" class="color-wheel-test-button final-reset-button grow-button">
          Reset
        </button>
      </div>
    </div>
    <div v-if="submitted && showDemo" class="color-wheel-test-submitted-message about-popup">
      <div class="about-content">
        <button @click="showDemo = false" class="close-button">&times;</button>
        <h2>Thanks! Before you go...</h2>
        <p>
          Optionally tell us a bit about yourself. We'll make aggregate plots for how different
          people categorize colors.
        </p>
        <h3>Your first language</h3>
        <form @submit.prevent="submitDemographics">
          <div class="form-group">
            <label for="firstLanguage"
              >Languages differ in how they name colors. What's your first language?</label
            >
            <div>
              <select id="firstLanguage" v-model="firstLanguage" class="form-control">
                <option value="Unspecified">Select a language</option>
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="Portuguese">Portuguese</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Italian">Italian</option>
                <option value="Greek">Greek</option>
                <option value="Russian">Russian</option>
                <option value="Arabic">Arabic</option>
                <option value="Chinese">Chinese</option>
                <option value="Japanese">Japanese</option>
                <option value="Korean">Korean</option>
                <option value="Thai">Thai</option>
                <option value="Vietnamese">Vietnamese</option>
                <option value="Other with blue-green distinction">
                  Another language with distinct words for blue and green
                </option>
                <option value="Other without blue-green distinction">
                  Another language without a blue-green distinction
                </option>
              </select>
            </div>
          </div>
          <h3>Are you colorblind?</h3>
          <div class="form-group">
            <label for="colorBlindness">Being colorblind might affect the results.</label>
            <div>
              <select id="colorBlindness" v-model="colorBlindness" class="form-control">
                <option value="unspecified">Select an option</option>
                <option value="dontknow">I don't know</option>
                <option value="no">No</option>
                <option value="red-green">Yes, red-green, unknown subtype</option>
                <option value="protanopia">Yes, protanopia</option>
                <option value="protanomaly">Yes, protanomaly</option>
                <option value="deuteranopia">Yes, deuteranopia</option>
                <option value="deuteranomaly">Yes, deuteranomaly</option>
                <option value="tritanopia">Yes, tritanopia</option>
                <option value="tritanomaly">Yes, tritanomaly</option>
                <option value="achromatopsia">Yes, achromatopsia</option>
                <option value="achromatomaly">Yes, achromatomaly</option>
              </select>
            </div>
            <p><b>This is not a diagnostic tool.</b></p>
          </div>
          <button type="submit" class="submit-button-demo">Submit</button>
        </form>
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
          focuses on blue-green hues between 150 and 210. The test assumes that your responses
          between blue and green are represented by a sigmoid curve. It sequentially fits that
          sigmoid curve to your responses, with a vague prior on the scale and offset parameters. It
          uses the fitted curve to determine which color will be presented next. It tries to be
          smart about where it samples new points, focusing on regions where you're predicted to be
          intermediately confident in your responses. To improve the validity of the results, it
          randomizes which points it samples, and uses a noise mask to mitigate visual adaptation.
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
        <h2>Can I make a version of this for my favorite color pair?</h2>
        <p>
          <a href="https://github.com/patrickmineault/ismyblue">Right this way to Github.</a>
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
      currentHue: 0,
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
      showAbout: false,
      showDemo: false,
      anonymousId: this.generateAnonymousId(),
      colorResults: [],
      currentRound: 0,
      firstLanguage: '',
      colorBlindness: '',
      COLOR_PAIRS: [
        { color1: 'red', color2: 'orange', range: [0, 30] },
        { color1: 'orange', color2: 'yellow', range: [30, 60] },
        { color1: 'yellow', color2: 'green', range: [60, 120] },
        { color1: 'green', color2: 'blue', range: [120, 240] },
        { color1: 'blue', color2: 'purple', range: [240, 300] },
        { color1: 'purple', color2: 'red', range: [300, 360] },
      ],
      currentColorPair: null,
      testCompleted: false,
      MAX_ROUNDS_PER_PAIR: 7,
      currentPairRounds: 0
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
      if (this.testCompleted) {
        return { backgroundColor: 'white' }
      } else if (this.showMask) {
        return {
          backgroundColor: 'transparent',
          backgroundImage: `url(${this.maskImageUrl})`,
          backgroundRepeat: 'repeat',
          backgroundSize: 'auto'
        }
      } else {
        return { backgroundColor: this.currentColor }
      }
    },
    isTestInProgress() {
      return this.currentRound < this.COLOR_PAIRS.length
    },
    currentColorPairBasedOnHue() {
      return this.COLOR_PAIRS.find(pair => 
        this.currentHue >= pair.range[0] && this.currentHue <= pair.range[1]
      ) || this.COLOR_PAIRS[0];
    }
  },
  methods: {
    startTest() {
      this.currentRound = 0
      this.moveToNextColorPair()
      this.testCompleted = false
      this.showInitialMessage = true
      console.log('Starting test')
      setTimeout(() => {
        this.showInitialMessage = false
      }, 2000)
    },

    selectColor(color) {
  console.log(`Selected color: ${color}, Current hue: ${this.currentHue}`);
  this.responses.push({ hue: this.currentHue, response: color })

  const { b, newProbe, polarity } = fitSigmoid(
    this.responses.map((r) => r.hue),
    this.responses.map((r) => r.response === this.currentColorPair.color2),
    this.polarity,
    0.4
  )

  this.polarity = polarity == 1 ? -1 : 1
  this.currentHue = newProbe
  this.currentPairRounds++

  console.log(`New hue after fitSigmoid: ${this.currentHue}`);
  console.log(`Current color pair before update: ${JSON.stringify(this.currentColorPair)}`);

  this.updateCurrentColorPair();

  console.log(`Current color pair after update: ${JSON.stringify(this.currentColorPair)}`);
  console.log(`Current pair rounds: ${this.currentPairRounds}`);

  if (this.currentPairRounds >= this.MAX_ROUNDS_PER_PAIR) {
    this.finishColorPair(b)
  } else {
    this.showMask = true
    setTimeout(() => {
      this.showMask = false
    }, 200)
  }
},

finishColorPair(threshold) {
  const midpoint = (this.currentColorPair.range[0] + this.currentColorPair.range[1]) / 2
  const finalHue = midpoint - threshold

  this.colorResults.push({
    color1: this.currentColorPair.color1,
    color2: this.currentColorPair.color2,
    threshold: finalHue,
    slope: this.calculateSlope(this.responses)
  })

  console.log(`Finished color pair: ${JSON.stringify(this.currentColorPair)}`);
  console.log(`Final hue: ${finalHue}`);

  this.moveToNextColorPair()
},

    moveToNextColorPair() {
      this.currentRound++;
      if (this.currentRound < this.COLOR_PAIRS.length) {
        this.currentColorPair = this.COLOR_PAIRS[this.currentRound];
        this.currentHue = this.getRandomHue(this.currentColorPair.range);
        this.responses = [];
        this.currentPairRounds = 0;
        this.polarity = 0;
        console.log(`Moved to next color pair: ${JSON.stringify(this.currentColorPair)}`);
        console.log(`New current hue: ${this.currentHue}`);
      } else {
        this.finishTest();
      }
    },

    getColorNameForHue(hue) {
  const pair = this.COLOR_PAIRS.find(p => hue >= p.range[0] && hue < p.range[1]);
  if (!pair) return 'unknown';
  if (hue < (pair.range[0] + pair.range[1]) / 2) {
    return pair.color1;
  } else {
    return pair.color2;
  }
},

    updateCurrentColorPair() {
  const newPair = this.currentColorPairBasedOnHue;
  
  console.log(`Updating current color pair. Current hue: ${this.currentHue}`);
  console.log(`New pair based on hue: ${JSON.stringify(newPair)}`);
  
  if (newPair !== this.currentColorPair) {
    console.log(`Changing color pair from ${JSON.stringify(this.currentColorPair)} to ${JSON.stringify(newPair)}`);
    this.currentColorPair = newPair;
    this.responses = [];
    this.currentPairRounds = 0;
    this.polarity = 0;
  } else {
    console.log(`Keeping current color pair: ${JSON.stringify(this.currentColorPair)}`);
  }
},

    finishTest() {
      confetti()
      this.testCompleted = true
    },

    getRandomHue([min, max]) {
      const hue = Math.random() * (max - min) + min;
      console.log(`Generated random hue: ${hue} for range [${min}, ${max}]`);
      return hue;
    },

    calculateSlope(responses) {
      // Implement slope calculation based on responses
    },

    reset() {
      this.anonymousId = this.generateAnonymousId()
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

    generateAnonymousId() {
      return (
        Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      )
    },

    async submitDemographics() {
      try {
        const { data, error } = await supabase.from('color_test_demo').insert([
          {
            anonymous_id: this.anonymousId,
            first_language: this.firstLanguage,
            color_blindness: this.colorBlindness
          }
        ])
        this.showDemo = false
      } catch (error) {
        console.error('Error submitting demographics:', error)
        alert('Failed to submit demographics. Please try again.')
      }
    },

    async submitResults() {
      this.gatherDeviceInfo()
      const now = new Date()
      this.timestamp = now.toISOString()
      this.localTimestamp = now.toLocaleString()

      try {
        const payload = {
          anonymous_id: this.anonymousId,
          user_agent: this.userAgent,
          screen_width: this.screenWidth,
          screen_height: this.screenHeight,
          color_depth: this.colorDepth,
          pixel_ratio: this.pixelRatio,
          timestamp: this.timestamp,
          local_timestamp: this.localTimestamp,
          responses: this.responses,
          final_hue: this.finalHue,
          version: VERSION
        }
        const { data, error } = await supabase.from('color_test_results').insert([payload])
        console.log(payload)

        if (error) throw error

        this.submitted = true
        this.showDemo = true
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

  created() {
    // Initialize currentColorPair when the component is created
    this.currentColorPair = this.COLOR_PAIRS[0]
  },

  mounted() {
    this.startTest()
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

.debug-text {
  font-size: 1rem;
  color: black;
  background-color: white;
  padding: 5px;
  border-radius: 5px;
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

.form-control {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: 'Cabin', sans-serif;
  font-size: 1rem;
  color: #333;
  background-color: #fff;
  appearance: none; /* Removes default styling in some browsers */
  -webkit-appearance: none; /* For older versions of Safari */
  -moz-appearance: none;
}

select.form-control {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23333' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 12px;
  padding-right: 2rem;
}

.form-control:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
}

/* Style specifically for the language dropdown */
#firstLanguage {
  border: 2px solid #4a90e2;
  transition: border-color 0.3s ease;
}

#firstLanguage:hover {
  border-color: #2a70c2;
}

/* Ensure text inputs match select styling */
input[type='text'].form-control {
  border: 2px solid #4a90e2;
}

/* Style for the submit button */
.submit-button-demo {
  background-color: #4a90e2;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.submit-button-demo:hover {
  background-color: #2a70c2;
}
</style>
