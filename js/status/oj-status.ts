import "$vnoj/daterangepicker/daterangepicker.min.js";

import { drawVerticalStackedBarChart, drawBarChart, drawPieChart } from "$js/stats/media-js.js";

const statsDataAllUrl = document.currentScript?.dataset.statsDataAllUrl;

let byDayChart: ReturnType<typeof drawVerticalStackedBarChart> = null;
let byLanguageChart: ReturnType<typeof drawPieChart> = null;
let resultChart: ReturnType<typeof drawPieChart> = null;
let queueTimeChart: ReturnType<typeof drawBarChart> = null;
let orgByDayChart: ReturnType<typeof drawVerticalStackedBarChart> = null;

function drawCharts(startDate: moment.Moment, endDate: moment.Moment) {
    $.ajax({
        url: statsDataAllUrl,
        type: "POST",
        data: {
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            utc_offset: moment().utcOffset(),
        },
        success(stats) {
            if (byDayChart == null) {
                byDayChart = drawVerticalStackedBarChart(stats.by_day, $("#by-day"));
            } else {
                byDayChart.data = stats.by_day;
                byDayChart.update();
            }
            if (byLanguageChart == null) {
                byLanguageChart = drawPieChart(stats.by_language, $("#by-language"));
            } else {
                byLanguageChart.data = stats.by_language;
                byLanguageChart.update();
            }
            if (resultChart == null) {
                resultChart = drawPieChart(stats.result, $("#result"));
            } else {
                resultChart.data = stats.result;
                resultChart.update();
            }
            if (queueTimeChart == null) {
                queueTimeChart = drawBarChart(stats.queue_time, $("#queue-time"), false);
            } else {
                queueTimeChart.data = stats.queue_time;
                queueTimeChart.update();
            }
            if (orgByDayChart == null) {
                orgByDayChart = drawVerticalStackedBarChart(
                    stats.org_by_day,
                    $("#org-by-day"),
                    true,
                );
            } else {
                orgByDayChart.data = stats.org_by_day;
                orgByDayChart.update();
            }
        },
        error() {
            console.log("Could not load OJ stats");
        },
    });
}

$(() => {
    const dateFormat = gettext("HH:mm:ss MMMM D, YYYY");

    function cb(startDate: moment.Moment, endDate: moment.Moment) {
        $("#daterange span").html(
            startDate.format(dateFormat) + " - " + endDate.format(dateFormat),
        );
    }

    $("#daterange").daterangepicker(
        {
            timePicker: true,
            timePicker24Hour: true,
            timePickerSeconds: true,
            locale: {
                customRangeLabel: gettext("Custom Range"),
                applyLabel: gettext("Apply"),
                cancelLabel: gettext("Cancel"),
                fromLabel: gettext("From"),
                toLabel: gettext("To"),
            },
            ranges: {
                [gettext("Last Minute")]: [moment().subtract(1, "minutes"), moment()],
                [gettext("Last Hour")]: [moment().subtract(1, "hours"), moment()],
                [gettext("Today")]: [moment().startOf("day"), moment().endOf("day")],
                [gettext("Yesterday")]: [
                    moment().subtract(1, "days").startOf("day"),
                    moment().subtract(1, "days").endOf("day"),
                ],
                [gettext("Last 7 Days")]: [
                    moment().subtract(6, "days").startOf("day"),
                    moment().endOf("day"),
                ],
                [gettext("Last 14 Days")]: [
                    moment().subtract(13, "days").startOf("day"),
                    moment().endOf("day"),
                ],
                [gettext("Last 30 Days")]: [
                    moment().subtract(29, "days").startOf("day"),
                    moment().endOf("day"),
                ],
                [gettext("Last 60 Days")]: [
                    moment().subtract(59, "days").startOf("day"),
                    moment().endOf("day"),
                ],
                [gettext("Last 90 Days")]: [
                    moment().subtract(89, "days").startOf("day"),
                    moment().endOf("day"),
                ],
            },
        },
        cb,
    );

    $("#daterange").on("apply.daterangepicker", (_, picker) => {
        drawCharts(picker.startDate, picker.endDate);
    });
});
