<template>
  <div class="gradient-container">
    <svg ref="mainSvg" class="main-svg"></svg>
  </div>
</template>

<script>
import * as d3 from 'd3'
import { COLOR_PAIRS, COLOR_DATA } from '@/colorTestConfig'

export default {
  props: {
    userThresholds: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      svgWidth: 0,
      svgHeight: 2400,
      margin: { top: 20, right: 30, bottom: 20, left: 40 },
      COLOR_PAIRS
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
      svg.selectAll('*').remove()

      this.svgWidth = this.$el.clientWidth
      this.svgHeight = 2400

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
      const plotHeight = height * 0.8 // Reduce plot height to 80% of available space
      const plotG = g
        .append('g')
        .attr(
          'transform',
          `translate(${this.margin.left},${this.margin.top + index * height + (height - plotHeight) / 2})`
        )

      const y = d3.scaleLinear().domain(pair.hueRange).range([0, height])

      const x = d3
        .scaleLinear()
        .domain([0, 1])
        .range([0, width - this.margin.left - this.margin.right])

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
    }
  }
}
</script>

<style scoped>
.gradient-container {
  position: relative;
  width: 100%;
  height: 2400px;
}

.main-svg {
  width: 100%;
  height: 100%;
}
</style>
