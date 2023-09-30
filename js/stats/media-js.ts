import { Chart } from "chart.js";

export function drawPieChart(data: any, $chart: JQuery<HTMLElement>) {
    const ctx = $chart.find("canvas")[0].getContext("2d");

    if (ctx === null) return null;

    const chart = new Chart(ctx, {
        type: "pie",
        data,
        options: {
            maintainAspectRatio: false,
            responsive: false,
            animation: false,
            plugins: {
                legend: {
                    position: "right",
                    labels: {
                        color: "black",
                        boxWidth: 20,
                    },
                },
            },
        },
    });

    return chart;
}

export function drawBarChart(data: any, $chart: JQuery<HTMLElement>, showPercentage = true) {
    const orig_data = JSON.parse(JSON.stringify(data));
    const ctx = $chart.find("canvas")[0].getContext("2d");

    if (ctx === null) return null;

    ctx.canvas.height = 20 * data.labels.length + 100;
    const chart = new Chart(ctx, {
        type: "bar",
        data: data,
        options: {
            indexAxis: "y",
            maintainAspectRatio: false,
            scales: {
                x: {
                    min: 0,
                },
            },
            onClick(e) {
                const nearest = chart.getElementsAtEventForMode(
                    e as any,
                    "nearest",
                    {
                        intersect: false,
                        axis: "y",
                    },
                    false,
                );
                if (nearest.length) {
                    const bar = nearest[0];
                    const datasetIndex = bar.datasetIndex,
                        index = bar.index,
                        hidden = chart.getDataVisibility(index);

                    chart.data.datasets[datasetIndex].data[index] = !hidden
                        ? 0
                        : orig_data.datasets[datasetIndex].data[index];

                    chart.toggleDataVisibility(index);
                    chart.update();
                }
            },
            plugins: {
                legend: {
                    display: false,
                },
                tooltip: {
                    callbacks: {
                        label(tooltipItem: any) {
                            return showPercentage
                                ? Math.round(tooltipItem.value * 100) / 100 + "%"
                                : tooltipItem.value;
                        },
                    },
                },
            },
        },
    });
    return chart;
}

export function drawVerticalBarChart(data: any, $chart: JQuery<HTMLElement>) {
    const ctx = $chart.find("canvas")[0].getContext("2d");

    if (ctx === null) return null;

    const chart = new Chart(ctx, {
        type: "bar",
        data: data,
        options: {
            maintainAspectRatio: false,
            scales: {
                x: {
                    min: 0,
                },
            },
            plugins: {
                legend: {
                    display: false,
                },
            },
        },
    });

    return chart;
}

export function drawStackedBarChart(data: any, $chart: JQuery<HTMLElement>) {
    const ctx = $chart.find("canvas")[0].getContext("2d");

    if (ctx === null) return null;

    ctx.canvas.height = 20 * data.labels.length + 100;

    const chart = new Chart(ctx, {
        type: "bar",
        data,
        options: {
            indexAxis: "y",
            maintainAspectRatio: false,
            scales: {
                x: {
                    stacked: true,
                    min: 0,
                },
                y: {
                    stacked: true,
                },
            },
            plugins: {
                tooltip: {
                    mode: "index",
                    intersect: false,
                    callbacks: {
                        footer(tooltipItems) {
                            let total = 0;
                            for (let i = 0; i < tooltipItems.length; ++i) {
                                total += +tooltipItems[i].label;
                            }
                            return "Total: " + total;
                        },
                    },
                },
                legend: {
                    labels: {
                        generateLabels(chart) {
                            const data = chart.data;
                            if (!Array.isArray(data.datasets)) {
                                return [];
                            }

                            let total = 0;
                            data.datasets.forEach((dataset, i) => {
                                if (chart.isDatasetVisible(i)) {
                                    let totalDataset = 0;
                                    for (const data of dataset.data) {
                                        if (typeof data === "number") {
                                            totalDataset += data;
                                        }
                                    }
                                    total += totalDataset;
                                }
                            });

                            const labels = data.datasets.map((dataset: any, i) => {
                                return {
                                    text: dataset.label,
                                    fillStyle: !Array.isArray(dataset.backgroundColor)
                                        ? dataset.backgroundColor
                                        : dataset.backgroundColor[0],
                                    hidden: !chart.isDatasetVisible(i),
                                    lineCap: dataset.borderCapStyle,
                                    lineDash: dataset.borderDash,
                                    lineDashOffset: dataset.borderDashOffset,
                                    lineJoin: dataset.borderJoinStyle,
                                    lineWidth: dataset.borderWidth,
                                    strokeStyle: dataset.borderColor,
                                    pointStyle: dataset.pointStyle,
                                    datasetIndex: i,
                                };
                            }, this);

                            labels.push({
                                text: "Total: " + total,
                                fillStyle: "transparent",
                                strokeStyle: "transparent",
                                datasetIndex: -1,
                            } as any);

                            return labels;
                        },
                    },
                    onClick(_, legendItem) {
                        const index = legendItem.datasetIndex;

                        if (index === undefined) return;

                        const ci = this.chart;

                        const meta = ci.getDatasetMeta(index);

                        meta.hidden = !meta.hidden ? !ci.data.datasets[index].hidden : false;

                        ci.update();
                    },
                },
            },
        },
    });
    return chart;
}

export function drawVerticalStackedBarChart(
    data: any,
    $chart: JQuery<HTMLElement>,
    displayYRightAxis = false,
) {
    const ctx = $chart.find("canvas")[0].getContext("2d");

    if (ctx === null) return null;

    ctx.canvas.height = 20 * data.labels.length + 100;

    const chart = new Chart(ctx, {
        type: "bar",
        data: data,
        options: {
            maintainAspectRatio: false,
            scales: {
                x: {
                    stacked: true,
                    min: 0,
                },
                y: {
                    stacked: true,
                },
                yRightAxis: {
                    position: "right",
                    display: displayYRightAxis,
                },
            },
            plugins: {
                tooltip: {
                    mode: "index",
                    intersect: false,
                    callbacks: {
                        footer(tooltipItems) {
                            let total = 0;
                            for (let i = 0; i < tooltipItems.length; ++i) {
                                total += +tooltipItems[i].formattedValue;
                            }
                            return "Total: " + total;
                        },
                    },
                },
                legend: {
                    labels: {
                        generateLabels(chart) {
                            const data = chart.data;
                            if (!Array.isArray(data.datasets)) {
                                return [];
                            }

                            let total = 0;
                            data.datasets.forEach((dataset, i) => {
                                if (chart.isDatasetVisible(i)) {
                                    let totalDataset = 0;
                                    for (const data of dataset.data) {
                                        if (typeof data === "number") {
                                            totalDataset += data;
                                        }
                                    }
                                    total += totalDataset;
                                }
                            });

                            const labels = data.datasets.map((dataset: any, i) => {
                                return {
                                    text: dataset.label,
                                    fillStyle: !Array.isArray(dataset.backgroundColor)
                                        ? dataset.backgroundColor
                                        : dataset.backgroundColor[0],
                                    hidden: !chart.isDatasetVisible(i),
                                    lineCap: dataset.borderCapStyle,
                                    lineDash: dataset.borderDash,
                                    lineDashOffset: dataset.borderDashOffset,
                                    lineJoin: dataset.borderJoinStyle,
                                    lineWidth: dataset.borderWidth,
                                    strokeStyle: dataset.borderColor,
                                    pointStyle: dataset.pointStyle,
                                    datasetIndex: i,
                                };
                            }, this);

                            labels.push({
                                text: "Total: " + total,
                                fillStyle: "transparent",
                                strokeStyle: "transparent",
                                datasetIndex: -1,
                            } as any);

                            return labels;
                        },
                    },
                    onClick(_, legendItem) {
                        const index = legendItem.datasetIndex;
                        if (index === undefined) return;
                        const ci = this.chart;
                        const meta = ci.getDatasetMeta(index);

                        meta.hidden = !meta.hidden ? !ci.data.datasets[index].hidden : false;

                        ci.update();
                    },
                },
            },
        },
    });
    return chart;
}
