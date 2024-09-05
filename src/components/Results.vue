<template>
  <div class="results-container">
    <div class="svg-container">
      <svg ref="colorWheel" class="color-wheel"></svg>
      <svg ref="sigmoids" class="sigmoids"></svg>
    </div>
    <div class="results-text bg-white p-4">
      <p v-for="(result, index) in colorResults" :key="index" class="result-text">
        Your {{ result.color1 }}-{{ result.color2 }} boundary is at hue {{ Math.round(result.threshold) }}.
      </p>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3'

export default {
  props: {
    colorResults: Array, // Array of objects with color boundaries and thresholds
  },
  mounted() {
    this.createColorWheel()
    this.createSigmoidPlots()
  },
  methods: {
    createColorWheel() {
      const svg = d3.select(this.$refs.colorWheel)
      // Clear existing content
      svg.selectAll('*').remove()

      const width = this.$refs.colorWheel.clientWidth
      const height = this.$refs.colorWheel.clientHeight
      const radius = Math.min(width, height) / 2

      const g = svg.append('g')
        .attr('transform', `translate(${width/2},${height/2})`)

      // Create color scale
      const colorScale = d3.scaleSequential(d3.interpolateRainbow)
        .domain([0, 360])

      // Create arcs for each hue
      const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius)

      const arcs = g.selectAll('path')
        .data(d3.range(360))
        .enter().append('path')
        .attr('fill', d => colorScale(d))
        .attr('d', d => arc({
          startAngle: (d * Math.PI) / 180,
          endAngle: ((d + 1) * Math.PI) / 180
        }))

      // Add boundary lines
      this.colorResults.forEach(result => {
        const angle = (result.threshold * Math.PI) / 180
        g.append('line')
          .attr('x1', 0)
          .attr('y1', 0)
          .attr('x2', radius * Math.cos(angle))
          .attr('y2', radius * Math.sin(angle))
          .attr('stroke', 'black')
          .attr('stroke-width', 2)
      })
    },
    createSigmoidPlots() {
      const svg = d3.select(this.$refs.sigmoids)
      // Clear existing content
      svg.selectAll('*').remove()

      const width = this.$refs.sigmoids.clientWidth
      const height = this.$refs.sigmoids.clientHeight
      const margin = { top: 20, right: 20, bottom: 30, left: 40 }
      const innerWidth = width - margin.left - margin.right
      const innerHeight = height - margin.top - margin.bottom

      const x = d3.scaleLinear().range([0, innerWidth])
      const y = d3.scaleLinear().range([innerHeight, 0])

      const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`)

      // Create a sigmoid function
      const sigmoid = (x, threshold, slope) => 1 / (1 + Math.exp(-slope * (x - threshold)))

      // Plot sigmoids for each color boundary
      this.colorResults.forEach((result, index) => {
        const data = d3.range(0, 360, 1).map(d => ({
          x: d,
          y: sigmoid(d, result.threshold, result.slope)
        }))

        const line = d3.line()
          .x(d => x(d.x))
          .y(d => y(d.y))

        g.append('path')
          .datum(data)
          .attr('fill', 'none')
          .attr('stroke', d3.schemeCategory10[index % 10])
          .attr('stroke-width', 2)
          .attr('d', line)
      })

      // Add axes
      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x))

      g.append('g')
        .call(d3.axisLeft(y))

      // Add legend
      const legend = svg.append('g')
        .attr('font-family', 'sans-serif')
        .attr('font-size', 10)
        .attr('text-anchor', 'end')
        .selectAll('g')
        .data(this.colorResults)
        .enter().append('g')
        .attr('transform', (d, i) => `translate(0,${i * 20})`)

      legend.append('rect')
        .attr('x', width - 19)
        .attr('width', 19)
        .attr('height', 19)
        .attr('fill', (d, i) => d3.schemeCategory10[i % 10])

      legend.append('text')
        .attr('x', width - 24)
        .attr('y', 9.5)
        .attr('dy', '0.32em')
        .text(d => `${d.color1}-${d.color2}`)
    }
  }
}
</script>

<style scoped>
.results-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.svg-container {
  display: flex;
  flex-direction: row;
  height: 70%;
}

.color-wheel, .sigmoids {
  width: 50%;
  height: 100%;
}

.results-text {
  height: 30%;
  overflow-y: auto;
}
</style>
