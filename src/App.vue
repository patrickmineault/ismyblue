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
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL.substring(0, 10) + '...')
console.log('VITE_SUPABASE_KEY:', import.meta.env.VITE_SUPABASE_KEY.substring(0, 10) + '...')
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
