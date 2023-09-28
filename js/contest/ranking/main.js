const showVirtual = document.currentScript?.dataset.showVirtual === "true";
$(() => {
    const url = "{{ url('contest_participation', contest.key, '__username__') }}";
    const placeholder = $("#search-contest")
        .replaceWith(
            $("<select>").attr({
                id: "search-contest",
            }),
        )
        .attr("placeholder");

    $("#search-contest")
        .select2({
            theme: "{{ DMOJ_SELECT2_THEME }}",
            placeholder: placeholder,
            ajax: {
                url: "{{ url('contest_user_search_select2_ajax', contest.key) }}",
            },
            minimumInputLength: 1,
            templateResult(data) {
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
        .on("change", () => {
            window.location.href = url.replace("__username__", $(this).val());
        });

    $("#show-personal-info-checkbox").click(() => {
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

    const contestKey = document.currentScript?.dataset.contestKey;

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
            theme: "{{ DMOJ_SELECT2_THEME }}",
            multiple: true,
            closeOnSelect: false,
            placeholder: "{{ _('Search organizations') }}",
        });

        const selection = $("#org-check-list").data().select2.selection;
        const results = $("#org-check-list").data().select2.results;

        $("#org-check-list").on("select2:selecting", (e) => {
            let id = e.params.args.data.id;
            let val = $(e.target).val().concat([id]);
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
            let id = e.params.args.data.id;
            let val = $(e.target)
                .val()
                .filter((v) => {
                    return v !== id;
                });
            $(e.target).val(val).trigger("change");

            if (selection.$search.val() != "") {
                selection.$search.val("");
                selection.trigger("query", {});
            } else {
                results.setClasses();
            }

            return false;
        });

        $("#org-check-list").data().select2.toggleDropdown = () => {
            selection.$search.trigger("focus");

            if (!this.isOpen()) {
                this.open();
            }
        };

        $("#filter-by-organization-button").click(() => {
            $("#org-check-list-wrapper").toggle();
            $("#org-check-list").select2("open");
        });
    });

    if (localStorage.getItem(`filter-cleared-${contestKey}`) === null) {
        localStorage.setItem(`filter-cleared-${contestKey}`, "true");
    }

    if (localStorage.getItem(`filter-selected-orgs-${contestKey}`) === null) {
        localStorage.setItem(`filter-selected-orgs-${contestKey}`, []);
    }

    $("#apply-organization-filter").on("click", () => {
        $("#org-check-list-wrapper").hide();

        let selected_orgs = $("#org-check-list")
            .val()
            .map((x) => x.trim());
        localStorage.setItem(`filter-selected-orgs-${contestKey}`, selected_orgs);
        window.applyRankingFilter();
    });

    $("#clear-organization-filter").on("click", () => {
        $("#org-check-list").val(null).trigger("change");
        $("#apply-organization-filter").trigger("click");
    });

    // hide checklist by clicking outside
    $(document).on("mouseup", (e) => {
        e.stopPropagation();

        // if clicked on the filter button
        // then this function should not do anything
        if ($("#filter-by-organization-button").has(e.target).length !== 0) {
            return;
        }

        if ($("#select2-org-check-list-results").has(e.target).length !== 0) {
            return;
        }

        if (
            $(e.target).attr("id") &&
            $(e.target).attr("id").startsWith("select2-org-check-list-result")
        ) {
            return;
        }

        // check if the clicked area is the checklist or not
        if ($("#org-dropdown-check-list").has(e.target).length === 0) {
            $("#apply-organization-filter").click();
        }
    });

    window.getOrganizationCodes = () => {
        let org_list = [];

        $("#ranking-table > tbody > *").each(() => {
            let org_anchor = $(this).find("div > div > .personal-info > .organization > a")[0];

            if (org_anchor) {
                org_list.push(org_anchor.text);
            }
        });

        org_list.sort();
        org_list.push("Other");

        org_list = new Set(org_list);

        let org_options = $("#org-check-list");
        org_options.empty();

        org_list.forEach((org) => {
            org_options.append(`<option value="${org}">${org}</option>`);
        });
    };

    window.getOrganizationCodes();

    function extractCurrentAbsRank(row_text) {
        let paren_surround_text = row_text.match(/\(([^)]+)\)/);
        let current_abs_rank = paren_surround_text !== null ? paren_surround_text[1] : row_text;
        return current_abs_rank;
    }

    window.clearRankingFilter = () => {
        if (localStorage.getItem(`filter-cleared-${contestKey}`) == "true") {
            return;
        }

        $("#ranking-table > tbody > tr[id]").each(() => {
            $(this).show();
            $(this).find("td")[0].innerHTML = extractCurrentAbsRank(
                $(this).find("td")[0].innerText,
            );
        });

        localStorage.setItem(`filter-cleared-${contestKey}`, "true");
    };

    window.applyRankingFilter = () => {
        let counter = 0;
        let previous_abs_rank = -1;
        let selected_orgs = localStorage.getItem(`filter-selected-orgs-${contestKey}`);

        if (!selected_orgs.length) {
            window.clearRankingFilter();
            return;
        }

        $("#ranking-table > tbody > tr[id]").each(() => {
            let row = $(this);

            let org_anchor = row.find("div > div > .personal-info > .organization > a")[0];
            let org = org_anchor ? org_anchor.text : "Other";

            if (!selected_orgs.includes(org.trim())) {
                row.hide();
                return;
            }

            row.show();
            let current_abs_rank = extractCurrentAbsRank(row.find("td")[0].innerText);

            if (previous_abs_rank == -1 || previous_abs_rank != current_abs_rank) {
                ++counter;
            }

            row.find("td")[0].innerHTML = `${counter}<br>(${current_abs_rank})`;
            previous_abs_rank = current_abs_rank;
        });

        if (counter > 0) {
            localStorage.setItem(`filter-cleared-${contestKey}`, "false");
        }
    };

    window.applyRankingFilter();

    window.restoreChecklistOptions = () => {
        let selected_orgs = localStorage.getItem(`filter-selected-orgs-${contestKey}`).split(",");
        $("#org-check-list").val(selected_orgs).trigger("change");
    };

    window.restoreChecklistOptions();

    window.enableAdminOperations = () => {
        $("a.disqualify-participation").click((e) => {
            e.preventDefault();
            if (
                e.ctrlKey ||
                e.metaKey ||
                confirm("{{ _('Are you sure you want to disqualify this participation?') }}")
            )
                $(this).closest("form").submit();
        });
        $("a.un-disqualify-participation").click((e) => {
            e.preventDefault();
            if (
                e.ctrlKey ||
                e.metaKey ||
                confirm("{{ _('Are you sure you want to un-disqualify this participation?') }}")
            )
                $(this).closest("form").submit();
        });
    };

    window.enableAdminOperations();
});

if (document.currentScript.dataset.tab === "ranking") {
    $.fn.ignore = (sel) => {
        return this.clone()
            .find(sel || ">*")
            .remove()
            .end();
    };

    function download_table_as_csv() {
        function clean_text(text) {
            // Remove new line and leading/trailing spaces
            text = text.replace(/(\r\n|\n|\r)/gm, "").trim();
            // Escape double-quote with double-double-quote
            text = text.replace(/"/g, '""');

            return '"' + text + '"';
        }

        var csv = [];

        $("#ranking-table thead tr").each(() => {
            var header = [];
            $(this)
                .find("th")
                .each(() => {
                    var $col = $(this);

                    if ($col.hasClass("rating-column")) {
                        // Skip rating
                        return;
                    } else if ($col.hasClass("rank")) {
                        // Rank
                        header.push(clean_text($col.text()));
                    } else if ($col.hasClass("username")) {
                        // Username and Full name
                        header.push(clean_text("{{ _('Username') }}"));
                        header.push(clean_text("{{ _('Full Name') }}"));
                    } else {
                        // Point
                        var name = $col.find(".problem-code").text();
                        if (name == "") {
                            name = $col.text();
                        }
                        header.push(clean_text(name));
                    }
                });
            csv.push(header.join(","));
        });

        $("#ranking-table tbody tr").each(() => {
            // Skip hidden row (due to filtering)
            if ($(this).is(":hidden")) {
                return;
            }

            var row_data = [];
            $(this)
                .find("td")
                .each(() => {
                    var $col = $(this);

                    if ($col.hasClass("rating-column")) {
                        // Skip rating
                        return;
                    } else if ($col.hasClass("user-name")) {
                        // Username and Full name
                        row_data.push(clean_text($col.find(".rating").first().text()));
                        row_data.push(clean_text($col.find(".personal-info").first().text()));
                    } else {
                        // Point or rank
                        row_data.push(clean_text($col.ignore(".solving-time").text()));
                    }
                });
            csv.push(row_data.join(","));
        });

        var csv_string = csv.join("\n");
        var filename =
            "ranking_{{ contest.key }}_" + moment().format("YYYY-MM-DD-HH-mm-ss") + ".csv";
        var link = document.createElement("a");
        link.style.display = "none";
        link.setAttribute("target", "_blank");
        link.setAttribute(
            "href",
            "data:text/csv;charset=utf-8,\uFEFF" + encodeURIComponent(csv_string),
        );
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
