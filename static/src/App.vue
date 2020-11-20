<template>
  <div id="app">
    <LineChart v-if="loaded" :graph-data="chartData" :styles="styles"/>
  </div>
</template>

<script>
import LineChart from "./components/LineChart";

export default {
  name: 'App',
  components: {
    LineChart
  },
  data() {
    return {
      loaded: false,
      chartData: null,
      styles: {
        width: "50%",
        height: "50%",
        position: "relative",
        margin: "auto"
      }
    };
  },
  mounted() {
    this.axios.get("/api/graph").then((response) => {
      this.loaded = true;
      this.chartData = JSON.parse(response.data);
    });
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
