import { drawStackedBarChart, drawBarChart, drawPieChart } from "$js/stats/media-js.js";

$(() => {
    const stats = JSON.parse($("#stats").text());

    drawStackedBarChart(stats.problem_status_count, $("#problem-status-count"));
    drawBarChart(stats.problem_ac_rate, $("#problem-ac-rate"));
    drawPieChart(stats.language_count, $("#language-count"));
    drawBarChart(stats.language_ac_rate, $("#language-ac-rate"));
});
