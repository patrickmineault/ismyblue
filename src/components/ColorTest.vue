<!-- ONLY CHANGE THIS FILE! -->
<template>
  <div class="color-test-wrapper">
    <div :style="containerStyle" class="color-test-container">
      <div v-if="rounds < MAX_ROUNDS" class="color-test-content">
        <transition name="fade-up" mode="out-in">
          <h1 v-if="showInitialMessage" key="initial" class="color-test-title">
            <span class="background-white">Test <i>your</i> color categorization</span>
          </h1>
          <h1 v-else-if="showSecondMessage" key="second" class="color-test-title">
            <span class="background-white">What color is this? Choose below</span>
          </h1>
          <h1 v-else key="main" class="color-test-title">
            <span class="background-white">
              Is <i>my </i>
              <GlitchText
                :text="currentPair.color1"
                :alternateText="currentPair.color2"
                :glitchInterval="7000"
              />
              <i> your </i>
              <GlitchText
                :text="currentPair.color1"
                :alternateText="currentPair.color2"
                :glitchInterval="8000"
              />?
            </span>
          </h1>
        </transition>
      </div>
      <div v-else class="color-test-content color-test-result-screen">
        <DemographicsModal v-if="!demographicsSubmitted" @submit="submitDemographics" />
        <Results
          v-if="rounds === MAX_ROUNDS"
          :binPositions="binPositions"
          :counts="counts"
          :xCdfs="xCdfs"
          :yCdfs="yCdfs"
          :userThresholds="finalHues"
          :isSharedResult="false"
          :shareLink="shareLink"
          @reset="reset"
          @start-test="startNewTest"
        />
      </div>

      <BottomButtons
        :showTestButtons="rounds < MAX_ROUNDS"
        :buttonOrder="buttonOrder"
        @select-color="selectColor"
        @reset="reset"
      />

      <!-- Add the floating share card -->
      <FloatingShareCard
        v-if="rounds === MAX_ROUNDS"
        :isSharedResult="false"
        :shareLink="shareLink"
      />
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import supabase from '@/supabaseClient'
import { MAX_ROUNDS, VERSION, COLOR_PAIRS, COLOR_DATA } from '@/colorTestConfig'
import confetti from 'https://cdn.skypack.dev/canvas-confetti'
import Results from './Results.vue'
import BottomButtons from './BottomButtons.vue'
import DemographicsModal from './DemographicsModal.vue'
import { fitSigmoid } from '@/utils/glmUtils'
import { fetchAggregateData } from '@/colorTestConfig'

import maskImage from '@/assets/mask.png'
import GlitchText from './GlitchText.vue'

export default {
  components: {
    Results,
    GlitchText,
    BottomButtons,
    DemographicsModal
  },
  setup() {
    const shareLink = ref('')
    return {
      shareLink
    }
  },
  data() {
    return {
      // Test configuration
      MAX_ROUNDS: MAX_ROUNDS,
      colorPairs: COLOR_PAIRS,
      currentPairIndex: 0,

      // User inputs and responses
      finalHues: COLOR_PAIRS.map(() => 0),
      responses: COLOR_PAIRS.map(() => []),

      // Test state
      currentHue: this.getInitialHue(COLOR_PAIRS[0].hueRange),
      demographicsSubmitted: false,
      polarity: 0,
      rounds: 0,
      showInitialMessage: true,
      showMask: false,
      showSecondMessage: false,
      submitted: false,
      testInputCount: 0,

      // Device and user info
      anonymousId: this.generateAnonymousId(),
      colorDepth: 0,
      pixelRatio: 1,
      screenHeight: 0,
      screenWidth: 0,
      timestamp: '',
      userAgent: '',

      // Test data and analytics
      aggregateData: null,
      binPositions: COLOR_PAIRS.map(
        (pair) => COLOR_DATA[`${pair.color1}_${pair.color2}`].BIN_POSITION
      ),
      counts: COLOR_PAIRS.map((pair) => COLOR_DATA[`${pair.color1}_${pair.color2}`].BIN_COUNT),
      logData: [],
      testStartTime: null,
      xCdfs: COLOR_PAIRS.map((pair) => COLOR_DATA[`${pair.color1}_${pair.color2}`].X_CDF),
      yCdfs: COLOR_PAIRS.map((pair) => COLOR_DATA[`${pair.color1}_${pair.color2}`].Y_CDF),

      // UI elements
      maskImageUrl: maskImage
    }
  },
  computed: {
    currentColor() {
      return `hsl(${this.currentHue}, 100%, 50%)`
    },
    currentPair() {
      return this.colorPairs[this.currentPairIndex]
    },
    containerStyle() {
      if (this.rounds === MAX_ROUNDS) {
        return {
          backgroundColor: 'white'
        }
      } else if (this.showMask) {
        return {
          backgroundColor: 'transparent',
          backgroundImage: `url(${this.maskImageUrl})`,
          backgroundRepeat: 'repeat',
          backgroundSize: 'auto'
        }
      } else {
        return {
          backgroundColor: this.currentColor
        }
      }
    },
    buttonOrder() {
      return this.currentPairIndex % 2 === 0
        ? [this.currentPair.color1, this.currentPair.color2]
        : [this.currentPair.color2, this.currentPair.color1]
    }
  },
  methods: {
    selectColor(color) {
      const roundStartTime = performance.now()

      // console.log('Color selected:', {
      //   round: this.rounds + 1,
      //   currentHue: this.currentHue,
      //   selectedColor: color,
      //   currentPair: this.currentPair
      // })

      // Determine which color in the pair was actually selected
      const actualSelectedColor =
        this.currentPair.color1 === color ? this.currentPair.color1 : this.currentPair.color2

      this.responses[this.currentPairIndex].push({
        hue: this.currentHue,
        response: actualSelectedColor
      })

      // Get the new probe value
      const fitSigmoidStartTime = performance.now()
      const { a, b, newProbe, polarity } = fitSigmoid(
        this.responses[this.currentPairIndex].map((r) => r.hue),
        this.responses[this.currentPairIndex].map((r) => r.response === this.currentPair.color2),
        this.polarity,
        0.4,
        this.currentPair.hueRange
      )
      const fitSigmoidEndTime = performance.now()
      const fitSigmoidDuration = fitSigmoidEndTime - fitSigmoidStartTime

      this.polarity = polarity == 1 ? -1 : 1
      const previousHue = this.currentHue
      this.currentHue = newProbe
      this.rounds++

      const roundData = {
        round: this.rounds,
        previousHue,
        newHue: this.currentHue,
        response: actualSelectedColor,
        newProbe,
        polarity: this.polarity,
        roundDuration: performance.now() - roundStartTime,
        fitSigmoidDuration,
        sigmoidParameters: { a, b }
      }

      this.logData.push(roundData)

      // console.log(`Round ${this.rounds} completed:`, roundData)

      if (this.rounds === MAX_ROUNDS) {
        this.finalHues[this.currentPairIndex] =
          (this.currentPair.hueRange[0] + this.currentPair.hueRange[1]) / 2 - b
        this.currentPairIndex = (this.currentPairIndex + 1) % this.colorPairs.length
        if (this.currentPairIndex === 0) {
          this.completeTest()
        } else {
          this.currentHue = this.getInitialHue(this.currentPair.hueRange)
          this.rounds = 0 // Reset rounds for the next color pair
        }
      }

      // Log color transition
      // console.log('Color transition:', {
      //   from: previousHue,
      //   to: this.currentHue,
      //   difference: this.currentHue - previousHue
      // })

      this.showMask = true
      setTimeout(() => {
        this.showMask = false
        // console.log('Mask removed')
      }, 200)

      this.testInputCount++
      if (this.testInputCount === 3) {
        this.showSecondMessage = false
      }
    },
    startNewTest() {
      this.reset()
    },
    reset() {
      this.anonymousId = this.generateAnonymousId()
      this.currentPairIndex = 0
      this.responses = this.colorPairs.map(() => [])
      this.finalHues = this.colorPairs.map(() => 0)
      this.currentHue = this.getInitialHue(this.currentPair.hueRange)
      this.rounds = 0
      this.showInitialMessage = true
      this.showSecondMessage = false
      this.testInputCount = 0
      this.submitted = false
      this.showMask = false
      this.testStartTime = performance.now()
      this.logData = []
      this.demographicsSubmitted = false
      // console.log('Test reset. New test started.')
      setTimeout(() => {
        this.showInitialMessage = false
        this.showSecondMessage = true
        // console.log('Initial message hidden, second message shown')
      }, 2000)
    },
    generateAnonymousId() {
      return (
        Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      )
    },
    async submitDemographics(demographicsData) {
      try {
        const { error } = await supabase.from('color_test_demo').insert([
          {
            anonymous_id: this.anonymousId,
            first_language: demographicsData.firstLanguage,
            color_blindness: demographicsData.colorBlindness
          }
        ])
        if (error) throw error
        this.demographicsSubmitted = true
        // Now that demographics are submitted, we can submit the test results
        await this.submitResults()
        confetti()
      } catch (error) {
        console.error('Error submitting demographics:', error)
        alert('Failed to submit demographics. Please try again.')
      }
    },
    async submitResults() {
      this.gatherDeviceInfo()
      const now = new Date()
      this.timestamp = now.toISOString()

      // Create a local timestamp by adjusting for timezone offset
      const offsetMs = now.getTimezoneOffset() * 60 * 1000
      const localDate = new Date(now.getTime() - offsetMs)
      this.localTimestamp = localDate.toISOString()

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
          final_hues: this.finalHues,
          version: VERSION,
          test_duration: performance.now() - this.testStartTime,
          log_data: this.logData
        }
        console.log('Submitting results:', payload)

        // Log Supabase configuration
        console.log('Supabase URL:', supabase)

        // Insert data and get the inserted row
        const { data, error } = await supabase.from('color_test_results').insert([payload]).select()

        if (error) throw error

        // Generate share link using the inserted row's ID
        if (data && data[0] && data[0].id) {
          const resultId = data[0].id
          console.log('Result ID:', resultId)
          this.shareLink = `${window.location.origin}/result/${resultId}`
          console.log('Result link:', this.shareLink)

          this.testCompleted = true // Set the flag

          // Navigate to the Results page with the user's data
          this.$router.push({
            name: 'SharedResult',
            params: { id: resultId }
          })
        } else {
          console.error('No valid data returned from insert operation')
        }

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
    },
    getInitialHue(hueRange) {
      return Math.random() > 0.5 ? hueRange[0] : hueRange[1]
    },
    async completeTest() {
      this.finalHues = this.colorPairs.map((pair, index) => {
        const midpoint = (pair.hueRange[0] + pair.hueRange[1]) / 2
        const responses = this.responses[index]
        const { b } = fitSigmoid(
          responses.map((r) => r.hue),
          responses.map((r) => r.response === pair.color2),
          0,
          0.4,
          pair.hueRange
        )
        return midpoint - b
      })

      // Fetch aggregate data
      this.aggregateData = await fetchAggregateData()
    }
  },
  GlitchText,
  mounted() {
    this.testStartTime = performance.now()
    setTimeout(() => {
      this.showInitialMessage = false
      this.showSecondMessage = true
    }, 2000)
  }
}
</script>

<style src="./ColorTest.css" scoped />
<style scoped>
.color-test-title {
  position: relative;
}

.background-white {
  position: relative;
  z-index: 1;
}
</style>
