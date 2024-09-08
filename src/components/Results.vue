<template>
  <div class="results-container">
    <div class="results-content">
      <div v-for="(pair, index) in colorPairs" :key="index" class="color-test-result-screen">
        <div class="svg-container">
          <svg :ref="`svg${index}`" class="responsive-svg"></svg>
          <div class="absolute top-0 left-0 p-1">
            <div class="color-test-result-color">
              <p class="result-text bg-white bg-opacity-70 p-1 rounded">
                <i>Your</i> {{ pair.color1 }}
              </p>
            </div>
          </div>
          <div class="absolute top-0 right-0 p-1">
            <div class="color-test-result-color">
              <p class="result-text bg-white bg-opacity-70 p-1 rounded">
                <i>Your</i> {{ pair.color2 }}
              </p>
            </div>
          </div>
          <div v-if="!hasData(pair)" class="absolute inset-0 flex items-center justify-center">
            <p class="text-lg font-bold text-gray-600 bg-white bg-opacity-70 p-2 rounded">
              Insufficient data for {{ pair.color1 }}-{{ pair.color2 }} boundary
            </p>
          </div>
        </div>
        <div class="color-test-result-text w-full mt-0 bg-white">
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
    <div class="floating-actions">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3'
import { COLOR_PAIRS, COLOR_DATA } from '@/colorTestConfig'

export default {
  name: 'ResultsDisplay',
  props: {
    binPositions: {
      type: Array,
      required: true
    },
    counts: {
      type: Array,
      required: true
    },
    xCdfs: {
      type: Array,
      required: true
    },
    yCdfs: {
      type: Array,
      required: true
    },
    userThresholds: {
      type: Array,
      required: true
    },
    submitted: {
      type: Boolean,
      default: false
    },
    aggregateData: {
      type: Array,
      default: () => null
    }
  },
  data() {
    return {
      colorPairs: COLOR_PAIRS,
      svgWidth: 0,
      svgHeight: 0
    }
  },
  computed: {
    inclusivePercentages() {
      return this.userThresholds.map((threshold, index) => {
        const xCdf = this.xCdfs[index]
        const yCdf = this.yCdfs[index]
        if (!xCdf || !yCdf || xCdf.length === 0 || yCdf.length === 0) return 0
        const i = xCdf.findIndex((value) => value > threshold)
        return i !== -1 ? yCdf[i] : 1
      })
    }
  },
  mounted() {
    this.createPlots()
    this.updateSvgDimensions()
    window.addEventListener('resize', this.updateSvgDimensions)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.updateSvgDimensions)
  },
  methods: {
    hasData(pair) {
      const pairName = `${pair.color1}_${pair.color2}`
      return COLOR_DATA[pairName].BIN_POSITION.length > 0
    },
    formatPercentage(value) {
      return `${Math.round(value * 100)}%`
    },
    createPlots() {
      this.colorPairs.forEach((pair, index) => {
        if (this.hasData(pair)) {
          this.createPlot(index, pair)
        } else {
          this.createEmptyPlot(index, pair)
        }
      })
    },
    createPlot(index, pair) {
      const svg = d3.select(this.$refs[`svg${index}`][0])
      svg.selectAll('*').remove()

      const width = this.$refs[`svg${index}`][0].clientWidth
      const height = 240 // Reduced height
      const margin = { top: 20, right: 20, bottom: 30, left: 40 }
      const innerWidth = width - margin.left - margin.right
      const innerHeight = height - margin.top - margin.bottom

      const range_l = pair.hueRange[0]
      const range_r = pair.hueRange[1]
      const x = d3.scaleLinear().domain([range_l, range_r]).range([0, innerWidth])
      const y = d3.scaleLinear().domain([0, 1]).range([innerHeight, 0])

      const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

      // Create gradient background
      const defs = svg.append('defs')
      const gradient = defs
        .append('linearGradient')
        .attr('id', `hue-gradient-${index}`)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '0%')

      for (let i = range_l; i <= range_r; i++) {
        gradient
          .append('stop')
          .attr('offset', `${((i - range_l) / (range_r - range_l)) * 100}%`)
          .attr('stop-color', `hsl(${i}, 100%, 50%)`)
      }

      g.append('rect')
        .attr('width', innerWidth)
        .attr('height', innerHeight)
        .attr('fill', `url(#hue-gradient-${index})`)

      // Create line generator
      const line = d3
        .line()
        .x((d) => x(d[0]))
        .y((d) => y(d[1]))

      // Create path for CDF line
      const path = g
        .append('path')
        .datum(d3.zip(this.xCdfs[index], this.yCdfs[index]))
        .attr('fill', 'none')
        .attr('stroke', 'black')
        .attr('stroke-width', 1)
        .attr('d', line)

      // Calculate the start and end points for clipping
      const startX = x(range_l)
      const endX = x(range_r)

      // Create a clip path
      const clipPath = defs.append('clipPath').attr('id', `gradient-clip-${index}`)

      clipPath
        .append('rect')
        .attr('x', startX)
        .attr('y', 0)
        .attr('width', endX - startX)
        .attr('height', innerHeight)

      // Add vertical line for user threshold
      const userThresholdX = x(this.userThresholds[index])
      const thresh = g
        .append('line')
        .attr('x1', userThresholdX)
        .attr('x2', userThresholdX)
        .attr('y1', 0)
        .attr('y2', innerHeight)
        .attr('stroke', 'black')
        .attr('stroke-width', 3)
        .attr('stroke-dasharray', '5,5')

      // Apply the clip path to the CDF line
      path.attr('clip-path', `url(#gradient-clip-${index})`)

      // Animate the line
      const length = path.node().getTotalLength()
      path
        .attr('stroke-dasharray', length + ' ' + length)
        .attr('stroke-dashoffset', length)
        .transition()
        .duration(2000)
        .ease(d3.easeLinear)
        .attr('stroke-dashoffset', 0)

      // Animate the threshold line
      thresh
        .attr('y2', 0)
        .transition()
        .delay(2000) // Start after the path animation
        .duration(1000)
        .ease(d3.easeLinear)
        .attr('y2', innerHeight)

      // Add axes
      g.append('g').attr('transform', `translate(0,${innerHeight})`).call(d3.axisBottom(x).ticks(5))
      g.append('g').call(d3.axisLeft(y).ticks(5).tickFormat(d3.format('.0%')))

      // Add label
      const label = svg
        .append('text')
        .attr('x', width - margin.right - 10)
        .attr('y', height - margin.bottom - 10)
        .attr('text-anchor', 'end')
        .attr('font-size', '12px')
        .attr('fill', 'black')
        .text('threshold distribution')

      const bbox = label.node().getBBox()
      // Add a small line
      svg
        .append('line')
        .attr('x1', bbox.x - 30)
        .attr('y1', bbox.y + 8)
        .attr('x2', bbox.x - 10)
        .attr('y2', bbox.y + 8)
        .attr('stroke', 'black')
        .attr('stroke-width', 3)

      // Update SVG viewBox
      svg.attr('viewBox', `0 0 ${width} ${height}`)
    },
    createEmptyPlot(index, pair) {
      const svg = d3.select(this.$refs[`svg${index}`][0])
      svg.selectAll('*').remove()

      const width = this.$refs[`svg${index}`][0].clientWidth
      const height = 240 // Reduced height

      svg.attr('viewBox', `0 0 ${width} ${height}`)

      const gradient = svg
        .append('defs')
        .append('linearGradient')
        .attr('id', `gradient-${index}`)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '0%')

      const [startHue, endHue] = pair.hueRange
      gradient.append('stop').attr('offset', '0%').attr('stop-color', `hsl(${startHue}, 100%, 50%)`)
      gradient.append('stop').attr('offset', '100%').attr('stop-color', `hsl(${endHue}, 100%, 50%)`)

      svg
        .append('rect')
        .attr('width', width)
        .attr('height', height)
        .style('fill', `url(#gradient-${index})`)

      // Add vertical line for user threshold
      const x = d3.scaleLinear().domain(pair.hueRange).range([0, width])

      const userThresholdX = x(this.userThresholds[index])
      svg
        .append('line')
        .attr('x1', userThresholdX)
        .attr('x2', userThresholdX)
        .attr('y1', 0)
        .attr('y2', height)
        .attr('stroke', 'black')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '5,5')
    },
    getMiddleColor(pair) {
      const middleHue = (pair.hueRange[0] + pair.hueRange[1]) / 2
      return `hsl(${middleHue}, 100%, 50%)`
    },
    updateSvgDimensions() {
      // This method is no longer needed for resizing, but you can keep it if you need it for other purposes
    }
  }
  // beforeUnmount() {
  //   window.removeEventListener('resize', this.updateSvgDimensions)
  // }
}
</script>

<style src="./ColorTest.css" scoped />
<style scoped>
.results-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.results-content {
  flex-grow: 1;
  overflow-y: auto;
  padding-bottom: 60px; /* Height of the sticky buttons */
}

.sticky-buttons {
  position: sticky;
  bottom: 0;
  width: 100%;
  background-color: white;
  z-index: 10;
}

.svg-container {
  flex-grow: 1;
  position: relative;
  width: 100%;
  height: 240px; /* Reduced height */
}

svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.color-chip {
  display: inline-block;
  width: 1em;
  height: 1em;
  border: 2px solid black;
  border-radius: 0.2em;
  margin-bottom: -0.2em;
}

.floating-actions {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.floating-button {
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  font-size: 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.floating-button:hover {
  background-color: #2a70c2;
}

.color-gradient {
  width: 100%;
  height: auto;
}

.responsive-svg {
  width: 100%;
  height: 100%;
}
</style>
