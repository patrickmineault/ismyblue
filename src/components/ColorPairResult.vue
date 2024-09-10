<template>
  <div class="color-label-container" :style="containerStyle">
    <div class="color-label">
      <p class="result-text"><i>Your</i> {{ pair.color1 }}</p>
    </div>
    <div class="color-description">
      <p class="result-text">
        <i>Your</i> {{ pair.color1 }}-{{ pair.color2 }} boundary is at hue
        {{ Math.round(userThreshold) }}.
        <span v-if="hasData">
          You categorized {{ formatPercentage(inclusivePercentage) }} of the hues as
          {{ pair.color2 }}.
          <span v-if="inclusivePercentage > 0.55">
            more {{ pair.color2 }} than {{ Math.round(inclusivePercentage * 100) }}% of the
            population. For <i>you</i>, the middle color is
            <span
              class="color-chip"
              :style="{
                backgroundColor: `hsl(${Math.round(userThreshold)}, 100%, 50%)`
              }"
            ></span
            >.
          </span>
          <span v-else-if="inclusivePercentage < 0.45">
            more {{ pair.color1 }} than {{ Math.round((1 - inclusivePercentage) * 100) }}% of the
            population. For <i>you</i>, the middle color is
            <span
              class="color-chip"
              :style="{
                backgroundColor: `hsl(${Math.round(userThreshold)}, 100%, 50%)`
              }"
            ></span
            >.
          </span>
          <span v-else>
            about average compared to the population. For <i>you</i>, the middle color is
            <span
              class="color-chip"
              :style="{
                backgroundColor: `hsl(${Math.round(userThreshold)}, 100%, 50%)`
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
            :style="{ backgroundColor: `hsl(${Math.round(userThreshold)}, 100%, 50%)` }"
          ></span
          >.
        </span>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    pair: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    userThreshold: {
      type: Number,
      required: true
    },
    inclusivePercentage: {
      type: Number,
      required: true
    }
  },
  computed: {
    containerStyle() {
      return {
        top: `${this.index * 16.67}%`
      }
    },
    hasData() {
      // Implement this method to check if you have data for the given pair
      // Return true if data is available, false otherwise
      return true // Placeholder implementation
    }
  },
  methods: {
    formatPercentage(value) {
      return (value * 100).toFixed(1) + '%'
    }
  }
}
</script>

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
}
.color-label-container:nth-child(2) {
  top: 0%;
}
.color-label-container:nth-child(3) {
  top: 16.67%;
}
.color-label-container:nth-child(4) {
  top: 33.34%;
}
.color-label-container:nth-child(5) {
  top: 50%;
}
.color-label-container:nth-child(6) {
  top: 66.67%;
}
.color-label-container:nth-child(7) {
  top: 83.33%;
}
</style>
