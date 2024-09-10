<template>
  <div v-if="show" class="about-popup">
    <div class="about-content">
      <button @click="closeAbout" class="close-button">&times;</button>
      <h2>About This Website</h2>
      <p>
        People have different names for the colors they see.
        <a href="https://en.wikipedia.org/wiki/Sapir%E2%80%93Whorf_hypothesis" target="_blank"
          >Language can affect how we memorize and name colors</a
        >. This is a color naming test designed to measure your personal color boundaries.
      </p>
      <h2>Origins and Expansion</h2>
      <p>
        The original version of this test, focusing on the blue-green boundary, was created by
        Patrick Mineault, a neuroscience and AI researcher. I was so impressed by his implementation
        that I decided to expand it to cover all color boundaries. A huge thank you to Patrick for
        the awesome idea and the initial implementation!
      </p>
      <p>
        You can find Patrick's original blue-green test and more about his work at
        <a href="https://neuroai.science">his blog</a>.
      </p>
      <h2>About the Developer</h2>
      <p>
        This expanded version of the color test was created by me, bapic. I'm an aspiring developer
        working on improving my coding skills. This project presented an excellent opportunity to
        challenge myself and learn more about web development, color theory, and data visualization.
        By expanding Patrick's original concept to cover all color boundaries, I aimed to create a
        more comprehensive color perception test while honing my programming abilities.
      </p>
      <p>
        If you'd like to connect or see what else I'm working on, you can find me on X (formerly
        Twitter) at
        <a href="https://x.com/itsbapic" target="_blank">@itsbapic</a>.
      </p>
      <h2>Test validity</h2>
      <p>
        <b><i>This website is for entertainment purposes only.</i></b>
      </p>
      <p>
        Color perception is tricky to measure–vision scientists use specialized calibrated equipment
        to color perception. Graphic designers use physical color cards, such as those
        <a
          href="https://www.npr.org/2024/07/19/1197961103/pantone-colors-lawrence-herbert-stuart-semple-standards"
          >made by Pantone</a
        >, so that they can communicate colors unambiguously. Here we use your monitor or phone to
        test how you categorize colors, which is far from perfect, since your calibration may differ
        from mine.
      </p>
      <p>
        The validity of the inference is limited by the calibration of your monitor, ambient
        lighting, and filters such as night mode. Despite these limitations, the results should have
        good test-retest reliability <i>on the same device, in the same ambient light</i>, which you
        can verify by taking the test multiple times. If you want to compare your results with
        friends, use the same device in the same ambient light.
      </p>
      <p>
        Getting outlier results doesn't mean there's anything wrong with your vision. It might mean
        you have an idiosyncratic way of naming colors, or that your monitor and lighting is
        unusual.
      </p>
      <h2>Technical Details</h2>
      <p>
        The test asks you to categorize colors sequentially. Colors are often represented in HSL
        (hue, saturation, lightness) color space. Hue 120 is green, and hue 240 is blue. The test
        focuses on blue-green hues between 150 and 210. The test assumes that your responses between
        blue and green are represented by a sigmoid curve. It sequentially fits that sigmoid curve
        to your responses:
      </p>

      <img src="@/assets/formula.svg" alt="Formula" />
      <br />
      <p>
        This is equivalent to a logistic regression model. The test uses a maximum-a-posteriori
        (MAP) estimation algorithm (specifically, a second order Newton method implemented in pure
        JS, no calls to a backend) to fit the sigmoid curve to your responses, with a vague prior on
        the scale and offset parameters. It uses the fitted curve to determine which color will be
        presented next. It tries to be smart about where it samples new points, focusing on regions
        where you're predicted to be intermediately confident in your responses. To improve the
        validity of the results, it randomizes which points it samples, and uses a noise mask to
        mitigate visual adaptation.
      </p>
      <p>
        It's a curve fit, not a binary search. In theory, if you feel like you're guessing in the
        middle shades, or even guessing incorrectly, that should be fine. If you're inconsistent in
        the middle, the curve fit should be able to recover, although your estimated threshold will
        have larger error bars.
      </p>

      <h2>Results</h2>
      <p>
        In early experiments, we found that people's responses cluster around 175, which
        coincidentally is the same as the named HTML color turquoise
        <span class="color-chip-turquoise mr-1"></span>. This is interesting, because the nominal
        boundary between blue and green is at 180, the named HTML color cyan
        <span class="color-chip-cyan mr-1"></span>. That means most people's boundaries are shifted
        toward saying that cyan is blue.
      </p>
      <h2>What happens when I hit submit?</h2>
      <p>
        When you hit submit, we store your responses anonymously so we can aggregate them later and
        measure aggregate naming curves. We don't store any information that would identify you
        personally.
      </p>
      <h2>Who made this?</h2>
      <p>
        The original blue-green version was created by Patrick Mineault, a neuroscience and AI
        researcher. He obtained a PhD in visual neuroscience from McGill in 2014. You can read
        <a href="https://neuroai.science">his blog here</a>.
      </p>
      <p>
        This expanded version, covering all color boundaries, was developed by me as a learning
        project. I'm passionate about coding and saw this as an opportunity to improve my skills
        while creating something interesting and interactive.
      </p>
      <h2>Can I make a version of this for my favorite color pair?</h2>
      <p>
        Absolutely! The source code for Patrick's original project is available on GitHub. Feel free
        to fork it, modify it, or use it as inspiration for your own projects.
        <a href="https://github.com/patrickmineault/ismyblue"
          >Check out the GitHub repository here.</a
        >
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AboutCard',
  props: {
    show: {
      type: Boolean,
      required: true
    }
  },
  emits: ['close'],
  methods: {
    closeAbout() {
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.about-popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.about-content {
  background-color: white;
  color: black;
  padding: 2rem;
  border-radius: 8px;
  max-width: 80%;
  max-height: 80%;
  overflow-y: auto;
  position: relative;
  font-family: 'Cabin', sans-serif;
  font-size: 0.9rem;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
}

.about-content h2 {
  margin-top: 0;
  font-size: 1.2rem;
}

.about-content h3 {
  font-size: 1.2rem;
  margin-top: 1rem;
}

.about-content p {
  margin-bottom: 1rem;
}
</style>
