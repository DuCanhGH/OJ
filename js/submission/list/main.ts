import type { OptGroupData, OptionData } from "$js/declarations/select2.js";
import { Chart } from "chart.js";

const dynamicUpdate = document.currentScript?.dataset.dynamicUpdate === "true";
const paginatorPerPage = document.currentScript?.dataset.paginatorPerPage;
const submissionSingleQueryUrl = document.currentScript?.dataset.submissionSingleQueryUrl;
const EVENT_LAST_MSG = JSON.parse(document.currentScript?.dataset.eventLastMessage ?? "null");
const select2Theme = document.currentScript?.dataset.select2Theme;
const statsUpdateInterval = Number(document.currentScript?.dataset.statsUpdateTime);

declare global {
    interface Window {
        dynamicContestId: any;
        dynamicUserId: any;
        dynamicProblemId: any;
        showProblem: boolean | undefined;
        loadDynamicUpdate(): void;
    }
}

if (dynamicUpdate && EVENT_LAST_MSG) {
    window.dynamicContestId = JSON.parse(document.currentScript?.dataset.dynamicContestId ?? "null");
    window.dynamicUserId = JSON.parse(document.currentScript?.dataset.dynamicUserId ?? "null");
    window.dynamicProblemId = JSON.parse(document.currentScript?.dataset.dynamicProblemId ?? "null");
    window.showProblem = document.currentScript?.dataset.showProblem === "true";
}

const resultsJson = JSON.parse($("#results-json").text());
const resultsColorsJson = JSON.parse($("#results-colors-json").text());

$(() => {
    function escapeRegExp(str: string) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
    }

    function idAndTextMatcher(
        params: {
            term: string;
        },
        data: OptGroupData | OptionData,
    ) {
        if (!("id" in data)) return data;
        if (params.term.trim() === "") return data;
        const regex = new RegExp(escapeRegExp(params.term), "i");
        return data.text.search(regex) >= 0 || data.id.search(regex) >= 0 ? data : null;
    }

    $("#status")
        .select2({
            theme: select2Theme,
            multiple: true,
            placeholder: gettext("Filter by status..."),
            matcher: idAndTextMatcher,
            width: "100%",
        })
        .css({ visibility: "visible" });

    $("#language")
        .select2({
            theme: select2Theme,
            multiple: true,
            placeholder: gettext("Filter by language..."),
            matcher: idAndTextMatcher,
            width: "100%",
        })
        .css({ visibility: "visible" });

    $("#organization")
        .select2({
            theme: select2Theme,
            multiple: false,
            matcher: idAndTextMatcher,
            width: "100%",
        })
        .css({ visibility: "visible" });
});

// Draw the statistics graph.
let chart: Chart<"pie"> | null = null;
function statsGraph(rawData: {
    categories: {
        code: string;
        count: number;
        name: string;
    }[];
    total: number;
}) {
    const ctx = $("#status-graph").find("canvas")[0].getContext("2d");
    const font = $("body").css("font-family");
    if (chart !== null) {
        chart.destroy();
    }
    if (!ctx) return;

    chart = new Chart(ctx, {
        type: "pie",
        data: {
            datasets: [
                {
                    data: rawData.categories.map((entry) => {
                        return entry.count;
                    }),
                    backgroundColor: rawData.categories.map((entry) => {
                        return resultsColorsJson[entry.code];
                    }),
                },
            ],
            labels: rawData.categories.map((entry) => {
                return entry.name;
            }),
        },
        options: {
            animation: false,
            font: {
                family: font,
            },
            plugins: {
                tooltip: {
                    titleFont: {
                        family: font,
                    },
                    bodyFont: {
                        family: font,
                    },
                },
                legend: {
                    display: false,
                },
            },
        },
    });

    $("#total-submission-count").text(rawData.total);
}

$(() => {
    statsGraph(resultsJson);
});

window.loadDynamicUpdate = () => {
    const _collect = (e: any) => {
        return e.value;
    };
    const language_filter = $.map($("select#language option[selected]"), _collect);
    const status_filter = $.map($("select#status option[selected]"), _collect);
    const organization_filter = $.map($("select#organization option[selected]"), _collect);

    const table = $("#submissions-table");
    const statistics = $("#statistics-table");
    let doing_ajax = false;
    let first = parseInt(table.find(">div:first-child").attr("id") as string);

    const updateSubmission = (message: {
        id: number;
        language: string;
        status: string;
        organizations: number[];
    }, force = false) => {
        if (
            language_filter.length &&
            "language" in message &&
            language_filter.indexOf(message.language) == -1
        )
            return;
        if (
            status_filter.length &&
            "status" in message &&
            status_filter.indexOf(message.status) == -1
        )
            return;
        if (
            organization_filter.length &&
            "organizations" in message &&
            message.organizations.indexOf(parseInt(organization_filter[0])) == -1
        )
            return;
        const id = message.id;
        let row = table.find("div#" + id);
        if (row.length < 1) {
            if (id < first) return;
            first = id;
            row = $("<div>", { id: id, class: "submission-row" }).hide().prependTo(table);
            if (table.find(">div").length >= Number(paginatorPerPage)) {
                table.find(">div:last-child").slideUp("slow", function () {
                    $(this).remove();
                });
            }
        }
        if (force || !doing_ajax) {
            if (!force) doing_ajax = true;
            $.ajax({
                url: submissionSingleQueryUrl,
                data: { id: id, show_problem: window.showProblem },
            })
                .done((data) => {
                    const was_shown = row.is(":visible");
                    row.html(data);
                    // @ts-expect-error update common.js
                    register_time(row.find(".time-with-rel"));
                    if (!was_shown) {
                        row.slideDown("slow");
                    }
                    if (!force)
                        setTimeout(() => {
                            doing_ajax = false;
                        }, 1000);
                })
                .fail(() => {
                    console.log("Failed to update submission: " + id);
                    if (!force) doing_ajax = false;
                });
        }
    };

    let statsOutdated = false;
    let lastStatsUpdate = Date.now();

    function updateStats() {
        if (Date.now() - lastStatsUpdate < statsUpdateInterval) return;
        $.ajax({
            url: "?results",
        })
            .done((data) => {
                lastStatsUpdate = Date.now();
                statsGraph(data);
            })
            .fail(() => {
                console.log("Failed to update statistics table!");
            })
            .always(() => {
                statsOutdated = false;
            });
    }

    $(window).on("dmoj:window-visible", () => {
        if (statsOutdated) updateStats();
    });

    const $body = $(document.body);

    window.eventDispatcher.on("submissions", (message: any) => {
        if (
            (window.dynamicUserId && message.user != window.dynamicProblemId) ||
            (window.dynamicProblemId && message.problem != window.dynamicProblemId) ||
            (window.dynamicContestId && message.contest != window.dynamicContestId)
        )
            return;
        if (message.type == "update-submission") {
            if (message.state == "test-case" && $body.hasClass("window-hidden")) return;
            updateSubmission(message, false);
        } else if (message.type == "done-submission") {
            updateSubmission(message, true);
            if (!statistics.length) return;
            if ($("body").hasClass("window-hidden")) {
                statsOutdated = true;
                return;
            };
            updateStats();
        }
    });

    window.eventDispatcher.onwsclose((event: any) => {
        if (event.code == 1001) {
            console.log("Navigated away");
            return;
        }
        console.log("You probably should refresh?");
        $(".ws-closed")
            .show()
            .find("a")
            .on("click", () => {
                window.location.reload();
            });
    });
}
