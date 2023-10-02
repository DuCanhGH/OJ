import { Chart, ScatterController } from "chart.js";
import "chartjs-adapter-moment";

interface Rating {
    label: string;
    timestamp: string | number;
    rating: number;
    x: Date;
    y: number;
    date: string;
    class: string;
    height: string;
    ranking: string;
    link: string;
}

const ratingHistory = JSON.parse($("#rating-data").text() || "[]") as Rating[];

$.each(ratingHistory, (_, item) => {
    item.x = new Date(item.timestamp);
    item.y = item.rating;
});

class RatingScatterController extends ScatterController {
    draw() {
        const yHighlight = [
            {
                begin: 0,
                end: 1200,
                color: "rgb(128, 128, 128, 0.43)",
            },
            {
                begin: 1200,
                end: 1400,
                color: "rgb(0, 128, 0, 0.4)",
            },
            {
                begin: 1400,
                end: 1600,
                color: "rgb(3, 168, 158, 0.4)",
            },
            {
                begin: 1600,
                end: 1900,
                color: "rgb(0, 0, 255, 0.37)",
            },
            {
                begin: 1900,
                end: 2200,
                color: "rgb(170, 0, 170, 0.4)",
            },
            {
                begin: 2200,
                end: 2300,
                color: "rgb(255, 140, 0, 0.4)",
            },
            {
                begin: 2300,
                end: 2400,
                color: "rgb(255, 140, 0, 0.4)",
            },
            {
                begin: 2400,
                end: 2600,
                color: "rgb(255, 0, 0, 0.4)",
            },
            {
                begin: 2600,
                end: 2900,
                color: "rgb(255, 0, 0, 0.4)",
            },
            {
                begin: 2900,
                end: 3600,
                color: "rgb(165, 28, 28, 0.4)",
            },
        ] as const;

        const ctx = this.chart.ctx;
        const xAxis = this.chart.scales["x"];
        const yAxis = this.chart.scales["y"];

        ctx.save();
        yHighlight.forEach((range) => {
            let yRangeBeginPixel = yAxis.getPixelForValue(range.begin),
                yRangeEndPixel = yAxis.getPixelForValue(range.end);

            if (range.begin >= yAxis.max || range.end <= yAxis.min) {
                return;
            }

            yRangeEndPixel = Math.max(yAxis.top + 1, yRangeEndPixel);
            yRangeBeginPixel = Math.min(yAxis.bottom - 1, yRangeBeginPixel);

            if (yRangeBeginPixel < yRangeEndPixel) {
                return;
            }

            ctx.fillStyle = range.color;
            ctx.fillRect(
                xAxis.left + 1,
                yRangeEndPixel,
                xAxis.right - xAxis.left,
                yRangeBeginPixel - yRangeEndPixel,
            );
        });
        ctx.restore();

        super.draw();
    }
}

Chart.register(RatingScatterController);

$(() => {
    const $canvas = $("#rating-chart").find("canvas");
    const ctx = $canvas.get(0)?.getContext("2d");

    if (ctx === undefined || ctx === null) return;

    const getItem = (index: number) => {
        return ratingHistory[index];
    };

    const ratings = ratingHistory.map((x) => {
        return x.rating;
    });

    const ratingChart = new Chart(ctx, {
        type: "scatter",
        data: {
            datasets: [
                {
                    label: "rating",
                    backgroundColor: "rgb(0, 0, 0, 0)",
                    borderColor: "#A31515",
                    pointBackgroundColor: "#FFF",
                    pointHoverBackgroundColor: "#A31515",
                    pointRadius: 5,
                    pointHoverRadius: 5,
                    showLine: true,
                    data: ratingHistory,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            elements: {
                line: {
                    tension: 0,
                },
            },
            layout: {
                padding: {
                    right: 10,
                },
            },
            scales: {
                x: {
                    type: "time",
                },
                y: {
                    suggestedMin: Math.max(0, Math.min.apply(null, ratings) - 50),
                    suggestedMax: Math.max.apply(null, ratings) + 50,
                    ticks: {
                        precision: 0,
                    },
                },
            },
            plugins: {
                legend: {
                    display: false,
                },
                tooltip: {
                    enabled: false,
                    external(tooltipModel) {
                        const $tooltip = $("#rating-tooltip");

                        if (tooltipModel.tooltip.opacity == 0) {
                            $tooltip.hide();
                            return;
                        }

                        const { element, dataIndex } = tooltipModel.tooltip.dataPoints[0];
                        const item = getItem(dataIndex);

                        $tooltip.find(".contest").text(item.label);
                        $tooltip.find(".date").text(item.date);
                        $tooltip
                            .find(".rate-box")
                            .attr("class", "rate-box " + item.class)
                            .find("span")
                            .css("height", item.height);
                        $tooltip
                            .find(".rating")
                            .text(item.rating)
                            .attr("class", "rating " + item.class);
                        $tooltip.find(".rank").text(item.ranking);

                        $tooltip.removeClass("above below");

                        const $tooltipHeight = $tooltip.height();
                        const $tooltipWidth = $tooltip.width();
                        const position = $canvas.offset();
                        const container = $("#page-container").offset();

                        const tooltipFont = tooltipModel.tooltip.options.bodyFont;

                        if (
                            $tooltipHeight !== undefined &&
                            $tooltipWidth !== undefined &&
                            position !== undefined &&
                            container !== undefined
                        ) {
                            $tooltip.addClass(element.y < $tooltipHeight ? "below" : "above");
                            $tooltip
                                .css({
                                    left:
                                        position.left -
                                        container.left +
                                        element.x +
                                        $tooltipWidth / 2,
                                    top:
                                        position.top -
                                        container.top +
                                        element.y -
                                        $tooltipHeight -
                                        13,
                                    ...(tooltipFont !== undefined &&
                                        typeof tooltipFont !== "function" &&
                                        typeof tooltipFont.family !== "function" &&
                                        typeof tooltipFont.size !== "function" &&
                                        typeof tooltipFont.style !== "function" && {
                                            "font-family": tooltipFont.family,
                                            "font-size": tooltipFont.size,
                                            "font-style": tooltipFont.style,
                                        }),
                                })
                                .show();
                        }
                    },
                },
            },
        },
    });

    $canvas[0].addEventListener("click", (evt) => {
        const elements = ratingChart.getElementsAtEventForMode(
            evt,
            "index",
            { intersect: true },
            false,
        );
        if (elements.length > 0) {
            const item = getItem(elements[0].index);
            window.location.href = item.link;
        }
    });

    $canvas[0].addEventListener("mousemove", (evt) => {
        const elements = ratingChart.getElementsAtEventForMode(
            evt,
            "index",
            { intersect: true },
            false,
        );
        if (elements.length > 0) {
            $canvas.css("cursor", "pointer");
        } else {
            $canvas.css("cursor", "");
        }
    });
});
