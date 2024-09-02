<template>
  <div class="results-container">
    <div class="svg-container">
      <svg ref="svg" class="w-full h-96"></svg>
      <div class="absolute top-0 left-0 p-1">
        <div class="blue-green-test-result-color">
          <p class="result-text bg-white bg-opacity-70 p-1 rounded"><i>Your</i> green</p>
        </div>
      </div>
      <div class="absolute top-0 right-0 p-1">
        <div class="blue-green-test-result-color">
          <p class="result-text bg-white bg-opacity-70 p-1 rounded"><i>Your</i> blue</p>
        </div>
      </div>
    </div>
    <div class="blue-green-test-result-text w-full mt-0 bg-white">
      <p class="result-text">
        <i>Your</i> boundary is at hue {{ Math.round(userThreshold)
        }}<span v-html="greenInclusive"></span>
      </p>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3'

export default {
  props: {
    binPosition: Array,
    count: Array,
    xCdf: Array,
    yCdf: Array,
    userThreshold: Number
  },
  computed: {
    currentColor() {
      return `hsl(${this.userThreshold}, 100%, 50%)`
    },
    greenInclusive() {
      const index = this.xCdf.findIndex((value) => value > this.userThreshold)
      const greenInclusive = index !== -1 ? this.yCdf[index] : 1
      if (greenInclusive > 0.55) {
        return (
          ', bluer than ' +
          Math.round(greenInclusive * 100) +
          '% of the population. For <i>you</i>, turquoise is green.'
        )
      } else if (greenInclusive < 0.45) {
        return (
          ', greener than ' +
          Math.round((1 - greenInclusive) * 100) +
          '% of the population. For <i>you</i>, turquoise is blue.'
        )
      } else {
        return ", just like the population median. You're a true neutral."
      }
    }
  },
  mounted() {
    this.createPlot()
  },
  handleResize() {
    this.createPlot()
  },
  methods: {
    createPlot() {
      const svg = d3.select(this.$refs.svg)
      const width = this.$refs.svg.clientWidth
      const height = this.$refs.svg.clientHeight
      const margin = { top: 0, right: 0, bottom: 0, left: 0 }
      const innerWidth = width - margin.left - margin.right
      const innerHeight = height - margin.top - margin.bottom

      let range_l = 155
      let range_r = 205
      const x = d3.scaleLinear().domain([range_l, range_r]).range([0, innerWidth])
      const y = d3.scaleLinear().domain([0, 1]).range([innerHeight, 0])

      const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

      // Create gradient background
      const defs = svg.append('defs')
      const gradient = defs
        .append('linearGradient')
        .attr('id', 'hue-gradient')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '0%')

      for (let i = range_l; i <= range_r; i++) {
        const hue = i
        gradient
          .append('stop')
          .attr('offset', `${((i - range_l) / (range_r - range_l)) * 100}%`)
          .attr('stop-color', `hsl(${hue}, 100%, 50%)`)
      }

      g.append('rect')
        .attr('width', innerWidth)
        .attr('height', innerHeight)
        .attr('fill', 'url(#hue-gradient)')

      // Create line generator
      const line = d3
        .line()
        .x((d) => x(d[0]))
        .y((d) => y(d[1]))

      // Create path for CDF line
      const path = g
        .append('path')
        .datum(d3.zip(this.xCdf, this.yCdf))
        .attr('fill', 'none')
        .attr('stroke', 'black')
        .attr('stroke-width', 1)
        .attr('d', line)

      // Calculate the start and end points for clipping
      const startX = x(range_l)
      const endX = x(range_r)

      // Create a clip path
      const clipPath = defs.append('clipPath').attr('id', 'gradient-clip')

      clipPath
        .append('rect')
        .attr('x', startX)
        .attr('y', 0)
        .attr('width', endX - startX)
        .attr('height', innerHeight)

      // Add vertical line for user threshold
      const userThresholdX = x(this.userThreshold)
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
      path.attr('clip-path', 'url(#gradient-clip)')

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

      // Add labels
      svg
        .append('text')
        .attr('x', width / 2)
        .attr('y', height - 5)
        .attr('text-anchor', 'middle')

      svg
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', 15)
        .attr('text-anchor', 'middle')

      // Add the label
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

      window.addEventListener('resize', this.handleResize)
    }
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
  }
}
</script>

<style src="./BlueGreenTest.css" scoped />
<style scoped>
.results-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  padding: 0;
  margin: 0;
}

.svg-container {
  flex-grow: 1;
  position: relative;
  width: 100%;
}

svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
