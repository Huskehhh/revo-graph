<template>
  <div id="app">
    <LineChart v-if="loaded" :graph-data="chartData" :styles="myStyles"/>
    <button @click="increase()">Increase size</button>
    <button @click="decrease()">Decrease size</button>
  </div>
</template>

<script>
import LineChart from "./components/LineChart";

const API_URL = process.env.VUE_APP_API_URL;

export default {
  name: 'App',
  components: {
    LineChart
  },
  data() {
    return {
      height: 600,
      width: 1000,
      loaded: false,
      chartData: null,
    };
  },
  methods: {
    increase() {
      this.height += 50;
      this.width += 100;
    },
    decrease() {
      this.height -= 50;
      this.width -= 100;
    }
  },
  mounted() {
    this.axios.get(API_URL + "/graph").then((response) => {
      this.loaded = true;
      this.chartData = JSON.parse(response.data);
    });
  },
  computed: {
    myStyles() {
      return {
        height: `${this.height}px`,
        width: `${this.width}px`,
        position: 'relative',
        margin: 'auto'
      }
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #097aec;
  margin-top: 60px;
}

body, html {
  background: #242424;
}
</style>
