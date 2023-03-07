<template>
  <v-app id="app">
    Hello
  </v-app>
</template>

<script>

export default {
  name: 'App',
  data() {
    return {
      loading: false,
    };
  },
};
</script>

<style>

#app {
  font-family: 'Poppins', 'Open Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.blink {
  background: #1056c0;
  animation: back 2s infinite;
}
@keyframes back{
  0%, 100%  { background: #1056c0;}
  50% { background: #ef0a1a;}
}
.border-l {
  border-left: 2px solid #333;
}
.h-full {
  height: 100%;
}
</style>
