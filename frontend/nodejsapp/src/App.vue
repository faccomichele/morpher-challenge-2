<template>
  <div id="app">
    <TotalApp />
  </div>
</template>

<script>
import TotalApp from './components/TotalApp.vue'

export default {
  name: 'App',
  components: {
    TotalApp
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
