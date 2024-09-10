<template>
  <span class="glitch-container">
    {{ displayText }}
    <span class="glitch-mask" :style="maskStyle" v-show="isGlitching"></span>
  </span>
</template>

<script>
import maskImage from '@/assets/mask.png'

export default {
  props: {
    text: String,
    alternateText: String,
    glitchInterval: {
      type: Number,
      default: 7000
    }
  },
  data() {
    return {
      isGlitching: false,
      displayText: '',
      maskImage: maskImage,
      isAlternate: false
    }
  },
  computed: {
    maskStyle() {
      return {
        backgroundImage: `url(${this.maskImage})`,
        backgroundSize: '500%',
        backgroundPosition: 'center',
        animation: this.isGlitching ? 'glitchAnimation 0.2s infinite' : 'none'
      }
    }
  },
  mounted() {
    this.displayText = this.text
    this.startGlitchInterval()
  },
  methods: {
    startGlitchInterval() {
      setInterval(() => {
        this.glitch()
      }, this.glitchInterval)
    },
    glitch() {
      this.isGlitching = true
      this.isAlternate = !this.isAlternate
      this.displayText = this.isAlternate ? this.alternateText : this.text
      setTimeout(() => {
        this.isGlitching = false
      }, 200)
    }
  }
}
</script>

<style scoped>
.glitch-container {
  position: relative;
  display: inline-block;
}

.glitch-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;
}

@keyframes glitchAnimation {
  0% {
    background-position: 0% 0%;
  }
  20% {
    background-position: -5% -5%;
  }
  40% {
    background-position: 5% 5%;
  }
  60% {
    background-position: -5% 5%;
  }
  80% {
    background-position: 5% -5%;
  }
  100% {
    background-position: 0% 0%;
  }
}
</style>
