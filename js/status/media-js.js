import "$prebundled/tablesorter.js";

const statusTableUrl = document.currentScript?.dataset.statusTableUrl;

$(() => {
    const table = $("#judge-status");
    table.tablesorter();

    const tooltip_classes = "tooltipped tooltipped-w";
    /**
     * @type {string | undefined | null}
     */
    let activeJudge = null;
    /**
     * @type {string | undefined | null}
     */
    let activeLang = null;

    /**
     * @param {JQuery<HTMLElement>} where
     */
    function displayTooltip(where) {
        const runtimeInfo = where.attr("data-runtime-info");
        if (runtimeInfo !== undefined)
            where.addClass(tooltip_classes).attr("aria-label", runtimeInfo);
    }

    function installTooltips() {
        $(".runtime-label").each((_, el) => {
            const link = $(el);
            link.on("mouseenter", () => {
                activeJudge = link.attr("data-judge");
                activeLang = link.attr("data-lang");
                displayTooltip(link);
            }).on("mouseleave", () => {
                activeJudge = activeLang = null;
                link.removeClass(tooltip_classes).removeAttr("aria-label");
            });
        });
    }

    let outdated = false;

    function updateTable() {
        if ($("body").hasClass("window-hidden")) {
            outdated = true;
            return;
        }
        $.ajax({
            url: statusTableUrl,
        })
            .done((data) => {
                // Readd the tooltip classes to minimize flicker on update
                const newNode = $(data);

                if (activeLang && activeJudge) {
                    const selected = newNode.find(
                        "[data-judge=" + activeJudge + "][data-lang=" + activeLang + "]",
                    );
                    if (selected) {
                        // Might have been removed, when a judge disconnected
                        displayTooltip(selected);
                    }
                }

                table.html(newNode[0]);

                installTooltips();
            })
            .always(() => {
                outdated = false;
                setTimeout(updateTable, 10000);
            });
    }

    $(window).on("dmoj:window-visible", () => {
        if (outdated) updateTable();
    });

    setTimeout(updateTable, 10000);
    installTooltips();
});
