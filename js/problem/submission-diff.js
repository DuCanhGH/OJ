import "$prebundled/featherlight/featherlight.min.js";

const submissionsDiffUrl = document.currentScript?.dataset.submissionsDiffUrl;

$(function () {
    $("a.sub-case-status").featherlight($(".partial-output-window"), {
        afterOpen(e) {
            const $parent = $(e.currentTarget).parent();
            const partial = $parent.attr("data-partial-output");
            if (partial !== undefined) {
                $(e.currentTarget)
                    .find(".partial-output-window")
                    .find("code")
                    .text(partial)
                    .end()
                    .show();
            }
        },
    });

    $("input.sub-check").on("change", (e) => {
        const table = $(e.currentTarget).closest("table");
        const column = $(e.currentTarget).parent().index();
        const sel = "tr td:nth-child(" + (column + 1) + ") input.sub-check";
        const count = table.find(sel + ":checked").length;
        if (count == 1) {
            table.find(sel + ":not(:checked)").attr("disabled", "");
        } else {
            table.find(sel).removeAttr("disabled");
        }
    });

    $("#diff").on("click", (e) => {
        e.preventDefault();

        if (!submissionsDiffUrl) return;

        const first = $("#case-table tr td:nth-child(1) input.sub-check:checked")[0];
        const second = $("#case-table tr td:nth-child(2) input.sub-check:checked")[0];

        if (!first || !second) {
            alert("Please select two submissions.");
            return;
        }

        const firstId = $(first).parent().parent().attr("sub-id");
        const second_id = $(second).parent().parent().attr("sub-id");

        if (firstId === second_id) {
            alert("Please select two different submissions.");
            return;
        }

        window.location.href = `${submissionsDiffUrl}?first_id=${firstId}&second_id=${second_id}`;
    });

    const highlightId = new URL(window.location.href).searchParams.get("highlight");

    if (highlightId) {
        const row = $("tr[sub-id=" + highlightId + "]");
        if (row.length > 0) {
            row.addClass("highlighted");
            const checkbox = row.find("td:nth-child(2) input.sub-check");
            checkbox.attr("checked", "");
            checkbox.trigger("change");
        }
    }
});
