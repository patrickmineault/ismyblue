<template>
  <div class="color-results-display">
    <ColorGradient :userThresholds="userThresholds" />
    <ColorPairResult
      v-for="(pair, index) in COLOR_PAIRS"
      :key="index"
      :pair="pair"
      :index="index"
      :userThreshold="userThresholds[index]"
      :inclusivePercentage="inclusivePercentages[index]"
      :binPositions="binPositions[index]"
      :counts="counts[index]"
      :xCdf="xCdfs[index]"
      :yCdf="yCdfs[index]"
    />
  </div>
</template>

<script>
import { COLOR_PAIRS, COLOR_DATA } from '@/colorTestConfig'
import ColorGradient from './ColorGradient.vue'
import ColorPairResult from './ColorPairResult.vue'

export default {
  components: {
    ColorGradient,
    ColorPairResult
  },
  props: {
    userThresholds: {
      type: Array,
      required: true
    },
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
    }
  },
  data() {
    return {
      COLOR_PAIRS,
      inclusivePercentages: []
    }
  },
  created() {
    this.calculateInclusivePercentages()
  },
  methods: {
    calculateInclusivePercentages() {
      this.inclusivePercentages = this.COLOR_PAIRS.map((pair, index) => {
        return this.getColorInclusive(index)
      })
    },
    getColorInclusive(index) {
      const pair = COLOR_PAIRS[index]
      const colorKey = `${pair.color1}_${pair.color2}`
      const xCdf = COLOR_DATA[colorKey].X_CDF
      const yCdf = COLOR_DATA[colorKey].Y_CDF
      const userThreshold = this.userThresholds[index]
      const cdfIndex = xCdf.findIndex((value) => value > userThreshold)
      return cdfIndex !== -1 ? yCdf[cdfIndex] : 1
    }
  }
}
</script>

<style scoped>
.color-results-display {
  position: relative;
  width: 100%;
  height: 2400px;
}
</style>
