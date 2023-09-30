import "$vnoj/jquery.formset.js";

const langLimitFormsetPrefix = document.currentScript?.dataset.langLimitFormsetPrefix;

$(() => {
    if (langLimitFormsetPrefix) {
        $("#form_set tr").formset({
            prefix: langLimitFormsetPrefix,
        });

        $("#lang_limit_title")
            .on("click", () => {
                $("#lang_limit_title i").toggleClass("fa-caret-down fa-caret-up");
                $("#lang_limit_table").toggleClass("hidden");
            })
            .trigger("click");
    }

    function noResults() {
        return gettext("Press Enter to select multiple users...");
    }

    $(document).one("click", "#id_testers + .select2", () => {
        $("#id_testers").data().select2.options.get("translations").dict["noResults"] = noResults;
    });

    $(document).on("keyup", "#id_testers + .select2 .select2-search__field", (e) => {
        if (e.code === "Enter") {
            const $idTesters = $("#id_testers");
            const testers = ($(e.currentTarget).val() as string).split(/[\s,]+/);
            
            if (testers.length <= 1) {
                // Skip to let select2 handle this
                return;
            }

            $.ajax({
                type: "GET",
                url: $idTesters.data().select2.dataAdapter.ajaxOptions.url,
                data: {
                    multiple_terms: testers,
                },
                success(response) {
                    for (const tester of response.results) {
                        // @ts-expect-error typings...
                        $idTesters.select2("trigger", "select", {
                            data: tester,
                        });
                    }
                },
            });
        }
    });
});
