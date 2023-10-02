import { getOrganizationCodes, restoreChecklistOptions } from "./utils.js";

const showVirtual = document.currentScript?.dataset.showVirtual === "true";
const select2Theme = document.currentScript?.dataset.select2Theme;
const contestKey = document.currentScript?.dataset.contestKey;
const url = document.currentScript?.dataset.url;
const searchContestUrl = document.currentScript?.dataset.searchContestUrl;
const tab = document.currentScript?.dataset.tab;

declare global {
    interface Window {
        downloadTableAsCsv(): void;
        enableAdminOperations(): void;
        applyRankingFilter(): void;
    }
    interface JQuery {
        ignore(sel?: string): JQuery<HTMLElement>;
    }
}

function extractCurrentAbsRank(rowText: string) {
    const parenSurroundtext = rowText.match(/\(([^)]+)\)/);
    const currentAbsRank = parenSurroundtext !== null ? parenSurroundtext[1] : rowText;
    return currentAbsRank;
}

function clearRankingFilter() {
    if (localStorage.getItem(`filter-cleared-${contestKey}`) == "true") {
        return;
    }

    $("#ranking-table > tbody > tr[id]").each((_, el) => {
        $(el).show();
        $(el).find("td")[0].innerHTML = extractCurrentAbsRank($(el).find("td")[0].innerText);
    });

    localStorage.setItem(`filter-cleared-${contestKey}`, "true");
}

$(() => {
    if (!url || !contestKey) return;
    const placeholder = $("#search-contest")
        .replaceWith(
            $("<select>").attr({
                id: "search-contest",
            }),
        )
        .attr("placeholder");

    $("#search-contest")
        .select2<{
            gravatar_url: string;
            display_rank: string;
            text: string;
        }>({
            theme: select2Theme,
            placeholder: placeholder,
            ajax: {
                url: searchContestUrl,
            },
            minimumInputLength: 1,
            templateResult(data) {
                if (!("gravatar_url" in data)) {
                    return $("<span>");
                }
                return $("<span>")
                    .append(
                        $("<img>", {
                            class: "user-search-image",
                            src: data.gravatar_url,
                            width: 24,
                            height: 24,
                        }),
                    )
                    .append(
                        $("<span>", {
                            class: data.display_rank + " user-search-name",
                        }).text(data.text),
                    );
            },
        })
        .on("change", (e) => {
            window.location.href = url.replace("__username__", String($(e.currentTarget).val()));
        });

    $("#show-personal-info-checkbox").on("click", () => {
        $(".personal-info").toggle();
        localStorage.setItem(
            "show-personal-info",
            $(".personal-info").is(":visible") ? "true" : "false",
        );
    });

    if (localStorage.getItem("show-personal-info") == "true") {
        $(".personal-info").show();
        $("#show-personal-info-checkbox").prop("checked", true);
    }

    if (showVirtual) {
        $("#show-virtual-participations-checkbox").prop("checked", true);
    }

    $("#show-virtual-participations-checkbox").on("click", () => {
        const parser = new URL(window.location.href);
        parser.searchParams.set("show_virtual", showVirtual ? "false" : "true");
        window.location.href = parser.href;
    });

    $("a#cache_alert").on("click", (e) => {
        const $closer = $(e.currentTarget);
        $closer.parent().hide();
        localStorage.setItem(`hide-cache-alert-${contestKey}`, "true");
    });

    if (localStorage.getItem(`hide-cache-alert-${contestKey}`) == "true") {
        $("a#cache_alert").trigger("click");
    }

    $("a#frozen_alert").on("click", (e) => {
        const $closer = $(e.currentTarget);
        $closer.parent().hide();
        localStorage.setItem(`hide-frozen-alert-${contestKey}`, "true");
    });

    if (localStorage.getItem(`hide-frozen-alert-${contestKey}`) == "true") {
        $("a#frozen_alert").trigger("click");
    }

    // hack to keep scroll position after selecting option
    // https://stackoverflow.com/questions/55045146/select2-do-not-scroll-on-selection
    // scrollAfterSelect is only available after v4.0.6
    $(() => {
        $("#org-check-list").select2({
            theme: select2Theme,
            multiple: true,
            closeOnSelect: false,
            placeholder: gettext("Search organizations"),
        });

        const selection = $("#org-check-list").data().select2.selection;
        const results = $("#org-check-list").data().select2.results;

        $("#org-check-list").on("select2:selecting", (e) => {
            const id = (e.params as any).args.data.id;
            const targetVal = $(e.target).val();
            if (typeof targetVal !== "object") {
                return false;
            }
            const val = targetVal.concat([id]);
            $(e.target).val(val).trigger("change");

            if (selection.$search.val() != "") {
                selection.$search.val("");
                selection.trigger("query", {});
            } else {
                results.setClasses();
            }

            return false;
        });

        $("#org-check-list").on("select2:unselecting", (e) => {
            const id = (e.params as any).args.data.id;
            const targetVal = $(e.target).val();

            if (typeof targetVal !== "object") {
                return;
            }

            const val = targetVal.filter((v) => v !== id);

            $(e.target).val(val).trigger("change");

            if (selection.$search.val() != "") {
                selection.$search.val("");
                selection.trigger("query", {});
            } else {
                results.setClasses();
            }

            return false;
        });

        $("#org-check-list").data().select2.toggleDropdown = function () {
            selection.$search.trigger("focus");

            if (!this.isOpen()) {
                this.open();
            }
        };

        $("#filter-by-organization-button").on("click", () => {
            $("#org-check-list-wrapper").toggle();
            $("#org-check-list").select2("open");
        });
    });

    if (localStorage.getItem(`filter-cleared-${contestKey}`) === null) {
        localStorage.setItem(`filter-cleared-${contestKey}`, "true");
    }

    if (localStorage.getItem(`filter-selected-orgs-${contestKey}`) === null) {
        localStorage.setItem(`filter-selected-orgs-${contestKey}`, "[]");
    }

    window.applyRankingFilter = () => {
        let counter = 0;
        let previousAbsRank = -1;
        const selectedOrgs = localStorage.getItem(`filter-selected-orgs-${contestKey}`);

        if (selectedOrgs === null) {
            clearRankingFilter();
            return;
        }

        $("#ranking-table > tbody > tr[id]").each((_, el) => {
            const row = $(el);

            const orgAnchor = row.find("div > div > .personal-info > .organization > a")[0];
            const org = orgAnchor ? $(orgAnchor).text() : "Other";

            if (!selectedOrgs.includes(org.trim())) {
                row.hide();
                return;
            }

            row.show();

            const currentAbsRank = extractCurrentAbsRank(row.find("td")[0].innerText);

            if (previousAbsRank == -1 || previousAbsRank !== +currentAbsRank) {
                ++counter;
            }

            row.find("td")[0].innerHTML = `${counter}<br>(${currentAbsRank})`;
            previousAbsRank = +currentAbsRank;
        });

        if (counter > 0) {
            localStorage.setItem(`filter-cleared-${contestKey}`, "false");
        }
    };

    $("#apply-organization-filter").on("click", () => {
        $("#org-check-list-wrapper").hide();

        const checkList = $("#org-check-list").val();

        if (typeof checkList !== "object") {
            return;
        }

        const selectedOrgs = checkList.map((x) => x.trim());

        localStorage.setItem(`filter-selected-orgs-${contestKey}`, `[${selectedOrgs.join(",")}]`);
        window.applyRankingFilter();
    });

    $("#clear-organization-filter").on("click", () => {
        $("#org-check-list")
            .val(null as any)
            .trigger("change");
        $("#apply-organization-filter").trigger("click");
    });

    // hide checklist by clicking outside
    $(document).on("mouseup", (e) => {
        e.stopPropagation();

        const target = e.target as any;

        // if clicked on the filter button
        // then this function should not do anything
        if ($("#filter-by-organization-button").has(target).length !== 0) {
            return;
        }

        if ($("#select2-org-check-list-results").has(target).length !== 0) {
            return;
        }

        const targetId = $(target).attr("id");

        if (targetId && targetId.startsWith("select2-org-check-list-result")) {
            return;
        }

        // check if the clicked area is the checklist or not
        if ($("#org-dropdown-check-list").has(target).length === 0) {
            $("#apply-organization-filter").trigger("click");
        }
    });

    getOrganizationCodes();

    window.applyRankingFilter();

    restoreChecklistOptions(contestKey);

    window.enableAdminOperations = () => {
        $("a.disqualify-participation").on("click", (e) => {
            e.preventDefault();
            if (e.ctrlKey || e.metaKey || confirm(gettext("Are you sure you want to disqualify this participation?"))) {
                $(e.currentTarget).closest("form").trigger("submit");
            }
        });
        $("a.un-disqualify-participation").on("click", (e) => {
            e.preventDefault();
            if (e.ctrlKey || e.metaKey || confirm(gettext("Are you sure you want to un-disqualify this participation?"))) {
                $(e.currentTarget).closest("form").trigger("submit");
            }
        });
    };

    window.enableAdminOperations();
});

if (tab === "ranking") {
    $.fn.ignore = function (sel) {
        return this.clone()
            .find(sel || ">*")
            .remove()
            .end();
    };

    window.downloadTableAsCsv = () => {
        function cleanText(text: string) {
            // Remove new line and leading/trailing spaces
            text = text.replace(/(\r\n|\n|\r)/gm, "").trim();
            // Escape double-quote with double-double-quote
            text = text.replace(/"/g, '""');

            return '"' + text + '"';
        }

        const csv: string[] = [];

        $("#ranking-table thead tr").each((_, el) => {
            const header: string[] = [];
            $(el)
                .find("th")
                .each((_, el) => {
                    const $col = $(el);

                    if ($col.hasClass("rating-column")) {
                        // Skip rating
                        return;
                    } else if ($col.hasClass("rank")) {
                        // Rank
                        header.push(cleanText($col.text()));
                    } else if ($col.hasClass("username")) {
                        // Username and Full name
                        header.push(cleanText("{{ _('Username') }}"));
                        header.push(cleanText("{{ _('Full Name') }}"));
                    } else {
                        // Point
                        let name = $col.find(".problem-code").text();
                        if (name == "") {
                            name = $col.text();
                        }
                        header.push(cleanText(name));
                    }
                });
            csv.push(header.join(","));
        });

        $("#ranking-table tbody tr").each((_, el) => {
            // Skip hidden row (due to filtering)
            if ($(el).is(":hidden")) {
                return;
            }

            const rowData: string[] = [];
            $(el)
                .find("td")
                .each((_, el) => {
                    const $col = $(el);

                    if ($col.hasClass("rating-column")) {
                        // Skip rating
                        return;
                    } else if ($col.hasClass("user-name")) {
                        // Username and Full name
                        rowData.push(cleanText($col.find(".rating").first().text()));
                        rowData.push(cleanText($col.find(".personal-info").first().text()));
                    } else {
                        // Point or rank
                        rowData.push(cleanText($col.ignore(".solving-time").text()));
                    }
                });

            csv.push(rowData.join(","));
        });

        const csvString = csv.join("\n");
        const filename = `ranking_${contestKey}_${moment().format("YYYY-MM-DD-HH-mm-ss")}.csv`;
        const link = document.createElement("a");
        link.style.display = "none";
        link.setAttribute("target", "_blank");
        link.setAttribute(
            "href",
            "data:text/csv;charset=utf-8,\uFEFF" + encodeURIComponent(csvString),
        );
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
}
