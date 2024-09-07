<template>
  <ColorTest />
</template>

<script>
import ColorTest from './components/ColorTest.vue'

export default {
  name: 'App',
  components: {
    ColorTest
  }
}
</script>

<style>
html,
body,
#app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

#app {
  position: absolute;
  top: 0;
  left: 0;
}
</style>
