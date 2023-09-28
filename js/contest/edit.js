import "$vnoj/jquery.formset.js";

import flatpickr from "flatpickr";

import { getI18n } from "../utils.js";

const contestProblemFormsetPrefix = document.currentScript?.dataset.contestProblemFormsetPrefix;
const i18n = getI18n(document.currentScript?.dataset, {
    enterToSelectMultipleUsers: "i18nEntToSelMulUsers",
});

// This code activates flatpickr on fields with the 'datetimefield' class when the document has loaded
window.addEventListener("DOMContentLoaded", () => {
    // @ts-expect-error weird types
    flatpickr(".datetimefield", {
        enableTime: true,
        enableSeconds: true,
        dateFormat: "Y-m-d H:i:S",
        time_24hr: true,
    });
});

$(() => {
    $("#form_set tr").formset({
        prefix: contestProblemFormsetPrefix,
    });

    const noResults = () => i18n.enterToSelectMultipleUsers;

    $(document).one("click", "#id_private_contestants + .select2", () => {
        $("#id_private_contestants").data().select2.options.get("translations").dict["noResults"] =
            noResults;
    });

    $(document).on("keyup", "#id_private_contestants + .select2 .select2-search__field", (e) => {
        if (e.code === "Enter") {
            const $idPrivateContestants = $("#id_private_contestants");
            const contestants = String($(e.currentTarget).val()).split(/[\s,]+/);
            if (contestants.length <= 1) {
                // Skip to let select2 handle this
                return;
            }

            $.ajax({
                type: "GET",
                url: $idPrivateContestants.data().select2.dataAdapter.ajaxOptions.url,
                data: {
                    multiple_terms: contestants,
                },
                success(response) {
                    for (const contestant of response.results) {
                        $idPrivateContestants.select2("trigger", "select", {
                            data: contestant,
                        });
                    }
                },
            });
        }
    });
});
