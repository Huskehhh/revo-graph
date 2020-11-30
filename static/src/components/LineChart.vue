<script>
import {Line} from 'vue-chartjs'

export default {
  extends: Line,
  props: {
    graphData: Object,
  },
  mounted() {
    let graph = {
      labels: ["Innaloo"],
      datasets: [
        {
          label: "Active members",
          backgroundColor: "#1f75d0",
          data: []
        }
      ]
    };

    for (let i = 0; i < this.graphData.length; i++) {
      let entry = this.graphData[i];
      let beautified_label = entry.date_time.substring(5, entry.date_time.length - 3);
      graph.labels.push(beautified_label);
      graph.datasets[0].data.push(entry.count);
    }

    this.renderChart(graph, {
      responsive: true,
      maintainAspectRatio: false
    })
  }
}
</script>

<style>

</style>
