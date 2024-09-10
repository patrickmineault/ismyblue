<template>
  <div class="sticky-buttons">
    <div v-if="showTestButtons" class="color-test-button-container three-buttons">
      <button
        @click="$emit('select-color', buttonOrder[0])"
        class="color-test-button blue-button grow-button"
      >
        This is {{ buttonOrder[0] }}
      </button>
      <button @click="$emit('reset')" class="color-test-button mid-reset-button grow-button">
        Reset
      </button>
      <button
        @click="$emit('select-color', buttonOrder[1])"
        class="color-test-button green-button grow-button"
      >
        This is {{ buttonOrder[1] }}
      </button>
    </div>
    <div v-if="!showTestButtons" class="color-test-button-container two-buttons">
      <button @click="openAbout" class="color-test-button final-reset-button grow-button">
        About
      </button>
      <button @click="$emit('reset')" class="color-test-button final-reset-button grow-button">
        Retake Test
      </button>
    </div>
    <AboutCard :show="showAbout" @close="closeAbout" />
  </div>
</template>

<script>
import AboutCard from './AboutCard.vue'

export default {
  name: 'BottomButtons',
  components: {
    AboutCard
  },
  props: {
    showTestButtons: {
      type: Boolean,
      default: true
    },
    buttonOrder: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      showAbout: false
    }
  },
  methods: {
    openAbout() {
      this.showAbout = true
    },
    closeAbout() {
      this.showAbout = false
    }
  },
  emits: ['select-color', 'reset']
}
</script>

<style scoped>
.sticky-buttons {
  position: sticky;
  bottom: 0;
  background-color: white;
  border-top: 1px solid #ccc;
}

.color-test-button-container {
  width: 100%;
  height: 60px;
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.color-test-button {
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  font-weight: bold;
  flex: 1 auto;
  margin: 0;
  background-color: black;
  color: white;
  overflow: hidden;
  display: inline-block;
  box-shadow: inset 0 0 0 0 rgba(255, 255, 255, 1);
  border-top: 1px solid white;
}

.mid-reset-button {
  border-left: 1px solid white;
  border-right: 1px solid white;
}

.final-reset-button {
  border-left: 1px solid white;
}

.color-test-button:disabled {
  cursor: not-allowed;
  background-color: #222;
}

.color-test-button:focus {
  outline: none;
}

.color-test-button:focus-visible {
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 1);
}

.three-buttons .color-test-button {
  width: 33.3333%;
}

.two-buttons .color-test-button {
  width: 50%;
}

@media (hover: hover) and (pointer: fine) {
  .color-test-button:hover:not(:disabled) {
    box-shadow: inset 0 0 0 4px rgba(255, 255, 255, 1);
  }
}

@media (hover: none) {
  .color-test-button:hover {
    box-shadow: none;
  }
}

.color-test-button:active:not(:disabled) {
  box-shadow: inset 0 0 0 4px rgba(255, 255, 255, 1);
  transition: box-shadow 0.1s ease;
}
</style>
