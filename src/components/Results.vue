<template>
  <div class="results-container color-test-content color-test-result-screen">
    <div class="gradient-container">
      <svg ref="mainSvg" class="main-svg"></svg>
      <div v-for="(pair, index) in COLOR_PAIRS" :key="index" class="color-label-container">
        <div class="color-label">
          <p class="result-text"><i>Your</i> {{ pair.color1 }}</p>
        </div>
        <div class="color-description">
          <p class="result-text">
            <i>Your</i> {{ pair.color1 }}-{{ pair.color2 }} boundary is at hue
            {{ Math.round(userThresholds[index]) }}.
            <span v-if="hasData(pair)">
              You categorized {{ formatPercentage(inclusivePercentages[index]) }} of the hues as
              {{ pair.color2 }}.
              <span v-if="inclusivePercentages[index] > 0.55">
                more {{ pair.color2 }} than {{ Math.round(inclusivePercentages[index] * 100) }}% of
                the population. For <i>you</i>, the middle color is
                <span
                  class="color-chip"
                  :style="{
                    backgroundColor: `hsl(${Math.round(userThresholds[index])}, 100%, 50%)`
                  }"
                ></span
                >.
              </span>
              <span v-else-if="inclusivePercentages[index] < 0.45">
                more {{ pair.color1 }} than
                {{ Math.round((1 - inclusivePercentages[index]) * 100) }}% of the population. For
                <i>you</i>, the middle color is
                <span
                  class="color-chip"
                  :style="{
                    backgroundColor: `hsl(${Math.round(userThresholds[index])}, 100%, 50%)`
                  }"
                ></span
                >.
              </span>
              <span v-else>
                about average compared to the population. For <i>you</i>, the middle color is
                <span
                  class="color-chip"
                  :style="{
                    backgroundColor: `hsl(${Math.round(userThresholds[index])}, 100%, 50%)`
                  }"
                ></span
                >.
              </span>
            </span>
            <span v-else>
              We don't have enough data yet to compare your results with others. For <i>you</i>, the
              middle color is
              <span
                class="color-chip"
                :style="{ backgroundColor: `hsl(${Math.round(userThresholds[index])}, 100%, 50%)` }"
              ></span
              >.
            </span>
          </p>
        </div>
      </div>
    </div>

    <!-- Conditional rendering for the action buttons -->
    <!-- <div v-if="!isSharedResult" class="sticky-buttons"> -->
    <div class="sticky-buttons">
      <div class="color-test-button-container two-buttons">
        <button
          @click="$emit('show-about')"
          class="color-test-button final-reset-button grow-button"
        >
          About
        </button>
        <button @click="$emit('reset')" class="color-test-button final-reset-button grow-button">
          Retake Test
        </button>
      </div>
    </div>

    <!-- Conditional rendering for the share card -->
    <!-- <div v-if="!isSharedResult" class="floating-share-card"> -->
    <div class="floating-share-card">
      <div class="share-content">
        <h3>Share your results</h3>
        <div class="social-icons">
          <i class="fab fa-twitter" @click="shareOnTwitter"></i>
          <i class="fab fa-facebook" @click="shareOnFacebook"></i>
        </div>
        <div class="share-link">
          <input type="text" :value="shareLink" readonly class="share-link-input" />
          <button @click="copyShareLink" class="copy-button">
            <i class="fas fa-copy"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- New card for shared results -->
    <!-- <div v-if="isSharedResult" class="floating-share-card"> -->
    <div class="floating-share-card">
      <div class="share-content">
        <h3>See how you compare!</h3>
        <button @click="$emit('start-test')" class="start-test-button">Start Test</button>
      </div>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3'
import { COLOR_PAIRS, COLOR_DATA } from '@/colorTestConfig'

export default {
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
  data() {
    return {
      svgWidth: 0,
      svgHeight: 2400,
      margin: { top: 20, right: 30, bottom: 20, left: 40 },
      COLOR_PAIRS,
      inclusivePercentages: [] // You'll need to calculate and populate this array
    }
  },
  mounted() {
    this.createContinuousGradient()
    window.addEventListener('resize', this.handleResize)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    handleResize() {
      this.createContinuousGradient()
    },
    createContinuousGradient() {
      const svg = d3.select(this.$refs.mainSvg)
      svg.selectAll('*').remove() // Clear existing content

      // Set width and height
      this.svgWidth = this.$el.clientWidth
      this.svgHeight = 2400 // Adjust this value as needed

      // Set viewBox to create responsive SVG
      svg
        .attr('viewBox', `0 0 ${this.svgWidth} ${this.svgHeight}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')

      // Create the continuous gradient
      const defs = svg.append('defs')
      const gradient = defs
        .append('linearGradient')
        .attr('id', 'continuous-gradient')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%')

      // Add color stops for each color pair
      COLOR_PAIRS.forEach((pair, index) => {
        const offset = (index / COLOR_PAIRS.length) * 100
        gradient
          .append('stop')
          .attr('offset', `${offset}%`)
          .attr('stop-color', `hsl(${pair.hueRange[0]}, 100%, 50%)`)
        gradient
          .append('stop')
          .attr('offset', `${((index + 1) / COLOR_PAIRS.length) * 100}%`)
          .attr('stop-color', `hsl(${pair.hueRange[1]}, 100%, 50%)`)
      })

      // Create the main group element
      const g = svg.append('g')

      // Create the gradient rectangle
      g.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', this.svgWidth)
        .attr('height', this.svgHeight)
        .style('fill', 'url(#continuous-gradient)')

      // Create individual plots for each color pair
      const pairHeight = this.svgHeight / COLOR_PAIRS.length
      COLOR_PAIRS.forEach((pair, index) => {
        this.createPlot(g, pair, index, this.svgWidth, pairHeight)
      })
    },
    createPlot(g, pair, index, width, height) {
      const plotG = g
        .append('g')
        .attr('transform', `translate(${this.margin.left},${this.margin.top + index * height})`)

      const y = d3.scaleLinear().domain(pair.hueRange).range([0, height])

      const x = d3.scaleLinear().domain([0, 1]).range([0, width])

      const colorKey = `${pair.color1}_${pair.color2}`
      const xCdf = COLOR_DATA[colorKey].X_CDF
      const yCdf = COLOR_DATA[colorKey].Y_CDF

      // Create line generator
      const line = d3
        .line()
        .x((d) => x(d[1]))
        .y((d) => y(d[0]))

      // Create path for CDF line
      plotG
        .append('path')
        .datum(d3.zip(xCdf, yCdf))
        .attr('fill', 'none')
        .attr('stroke', 'black')
        .attr('stroke-width', 1)
        .attr('d', line)

      // Add user threshold line
      const userThresholdY = y(this.userThresholds[index])
      plotG
        .append('line')
        .attr('x1', 0)
        .attr('x2', width)
        .attr('y1', userThresholdY)
        .attr('y2', userThresholdY)
        .attr('stroke', 'black')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5')

      // Add y-axis (now on the left side)
      plotG.append('g').call(d3.axisLeft(y).ticks(5))
    },
    getColorInclusive(index) {
      const pair = COLOR_PAIRS[index]
      const colorKey = `${pair.color1}_${pair.color2}`
      const xCdf = COLOR_DATA[colorKey].X_CDF
      const yCdf = COLOR_DATA[colorKey].Y_CDF
      const userThreshold = this.userThresholds[index]
      const cdfIndex = xCdf.findIndex((value) => value > userThreshold)
      return cdfIndex !== -1 ? yCdf[cdfIndex] : 1
    },
    hasData(pair) {
      // Implement this method to check if you have data for the given pair
      // Return true if data is available, false otherwise
      return true // Placeholder implementation
    },
    formatPercentage(value) {
      return (value * 100).toFixed(1) + '%'
    },
    shareOnTwitter() {
      window.open(
        `https://twitter.com/intent/tweet?text=Check out my color test results!&url=${encodeURIComponent(this.shareLink)}`,
        '_blank'
      )
    },
    shareOnFacebook() {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(this.shareLink)}`,
        '_blank'
      )
    },
    copyShareLink() {
      navigator.clipboard
        .writeText(this.shareLink)
        .then(() => {
          alert('Link copied to clipboard!')
        })
        .catch((err) => {
          console.error('Failed to copy link: ', err)
        })
    }
  }
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

.gradient-container {
  position: relative;
  width: 100%;
  height: 2400px;
}

.main-svg {
  width: 100%;
  height: 100%;
}

.color-label-container {
  position: absolute;
  right: 0;
  left: 0;
  height: calc(100% / 6);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.color-label {
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: rgba(255, 255, 255, 0.7);
  color: black;
  padding: 8px;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.color-description {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(255, 255, 255, 0.7);
  color: black;
  backdrop-filter: blur(5px);
  padding: 10px;
  border-radius: 8px;
  text-align: center;
  font-size: 14px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.color-pair-result {
  padding: 20px;
  background-color: white;
  margin-bottom: 10px;
}

.result-text {
  background-color: rgba(255, 255, 255, 0.7);
  padding: 5px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
}

/* Position color label containers */
.color-label-container:nth-child(1) {
  top: -16.66%;
} /* Shifted up by half a section */
.color-label-container:nth-child(2) {
  top: 0%;
} /* Shifted up by half a section */
.color-label-container:nth-child(3) {
  top: 16.67%;
} /* Shifted up by half a section */
.color-label-container:nth-child(4) {
  top: 33.34%;
} /* Shifted up by half a section */
.color-label-container:nth-child(5) {
  top: 50%;
} /* Shifted up by half a section */
.color-label-container:nth-child(6) {
  top: 66.67%;
}
.color-label-container:nth-child(7) {
  top: 83.33%;
}

.start-test-button {
  background-color: #4a90e2;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.start-test-button:hover {
  background-color: #3a7bc8;
}
</style>
