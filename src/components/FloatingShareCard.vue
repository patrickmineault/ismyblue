<template>
  <div class="floating-share-card">
    <div class="share-content">
      <h3>{{ cardTitle }}</h3>
      <template v-if="hasCompletedOwnTest">
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
      </template>
      <template v-else>
        <button @click="$emit('start-test')" class="start-test-button">Start Test</button>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FloatingShareCard',
  props: {
    hasCompletedOwnTest: {
      type: Boolean,
      required: true
    },
    shareLink: {
      type: String,
      default: ''
    }
  },
  mounted() {
    console.log('FloatingShareCard: Received props:', {
      hasCompletedOwnTest: this.hasCompletedOwnTest,
      shareLink: this.shareLink
    })
  },
  computed: {
    cardTitle() {
      if (this.hasCompletedOwnTest) {
        return 'Share your results'
      } else {
        return 'See how you compare!'
      }
    }
  },
  methods: {
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
.floating-share-card {
  position: fixed;
  bottom: 120px;
  left: 50%;
  transform: translateX(-50%);
  color: black;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  padding: 25px;
  padding-left: 35px;
  padding-right: 35px;
  z-index: 20;
  max-width: 90%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  animation: rainbow-effect 10s linear infinite;
}

.floating-share-card * {
  pointer-events: auto;
}

@keyframes rainbow-effect {
  0% {
    background-color: hsla(0, 100%, 50%, 0.3);
    border: 2px solid hsl(0, 100%, 50%);
    box-shadow: 0 0 10px hsl(0, 100%, 50%);
  }
  16.67% {
    background-color: hsla(60, 100%, 50%, 0.3);
    border: 2px solid hsl(60, 100%, 50%);
    box-shadow: 0 0 10px hsl(60, 100%, 50%);
  }
  33.33% {
    background-color: hsla(120, 100%, 50%, 0.3);
    border: 2px solid hsl(120, 100%, 50%);
    box-shadow: 0 0 10px hsl(120, 100%, 50%);
  }
  50% {
    background-color: hsla(180, 100%, 50%, 0.3);
    border: 2px solid hsl(180, 100%, 50%);
    box-shadow: 0 0 10px hsl(180, 100%, 50%);
  }
  66.67% {
    background-color: hsla(240, 100%, 50%, 0.3);
    border: 2px solid hsl(240, 100%, 50%);
    box-shadow: 0 0 10px hsl(240, 100%, 50%);
  }
  83.33% {
    background-color: hsla(300, 100%, 50%, 0.3);
    border: 2px solid hsl(300, 100%, 50%);
    box-shadow: 0 0 10px hsl(300, 100%, 50%);
  }
  100% {
    background-color: hsla(360, 100%, 50%, 0.3);
    border: 2px solid hsl(360, 100%, 50%);
    box-shadow: 0 0 10px hsl(360, 100%, 50%);
  }
}

.share-content {
  width: 100%;
}

.share-content h3 {
  text-align: center;
  font-weight: 800;
  font-size: 1.5em;
  margin-bottom: 15px;
}

.social-icons {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
}

.social-icons i {
  font-size: 1.5em;
  margin: 0 10px;
  cursor: pointer;
}

.share-link {
  display: inline-flex;
  background-color: #222;
  color: white;
  border-radius: 4px;
  overflow: hidden;
}

.share-link-input {
  flex-grow: 1;
  padding: 8px 12px;
  border: none;
  background-color: transparent;
  color: white;
  font-size: 0.9em;
  width: calc(100% + 240px);
  min-width: 0;
}

.share-link-input:focus {
  outline: none;
  background-color: #333;
}

.copy-button {
  padding: 5px 10px;
  background-color: #333;
  border: 1px solid #555;
  border-left: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  color: #fff;
}

.copy-button:hover {
  background-color: #444;
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
