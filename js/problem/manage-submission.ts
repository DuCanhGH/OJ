const select2Theme = document.currentScript?.dataset.select2Theme;
const compareUrl = document.currentScript?.dataset.compareUrl;
const rejudgeUrl = document.currentScript?.dataset.rejudgeUrl;

$(() => {
    $("#by-lang-filter").select2({
        theme: select2Theme,
        multiple: true,
        placeholder: gettext("Leave empty to not filter by language"),
    });

    $("#by-result-filter").select2({
        theme: select2Theme,
        multiple: true,
        placeholder: gettext("Leave empty to not filter by result"),
    });

    $("#rescore-all").on("click", (e) => {
        e.preventDefault();
        if (confirm(e.currentTarget.dataset.warning)) {
            $(e.currentTarget).parents("form").trigger("submit");
        }
    });

    $("#compare").on("click", (e) => {
        e.preventDefault();

        if (!compareUrl) return;

        const usernames = $("#id_user option:selected")
            .toArray()
            .map((item) => $(item).text());

        if (usernames.length === 0) {
            alert(gettext("Please select at least one user."));
            return;
        }

        const qs = usernames.map((item) => "username=" + item).join("&");

        window.location.href = `${compareUrl}?${qs}`;
    });

    const $useId = $("#by-range-check");
    const $idStart = $("#by-range-start");
    const $idEnd = $("#by-range-end");
    $("#rejudge-selected").on("click", (e) => {
        e.preventDefault();

        if (!rejudgeUrl) return;

        if ($useId.prop("checked")) {
            const start = parseInt($idStart.val() as string);
            const end = parseInt($idEnd.val() as string);
            if (!start || !end) {
                alert(gettext("Need valid values for both start and end IDs."));
                return;
            } else if (start > end) {
                alert(gettext("End ID must be after start ID."));
                return;
            }
        }

        const $form = $(e.currentTarget).parents("form");
        $.post(
            rejudgeUrl,
            $form.serialize(),
            "text",
        )
            .done((count) => {
                if (
                    confirm(
                        interpolate(
                            gettext(
                                "You are about to rejudge %(count)s submissions. Are you sure you want to do this?",
                            ),
                            {
                                count: String(count),
                            },
                            true,
                        ),
                    )
                ) {
                    $form.trigger("submit");
                }
            })
            .fail(() => {
                if (
                    confirm(
                        gettext(
                            "You are about to rejudge a few submissions. Are you sure you want to do this?",
                        ),
                    )
                ) {
                    $form.trigger("submit");
                }
            });
    });

    $useId.on("change", (e) => {
        const rangeFilterInputs = $("#by-range-filter").find("input");
        if ($(e.currentTarget).attr("checked")) {
            rangeFilterInputs.prop("disabled", "");
        } else {
            rangeFilterInputs.removeProp("disabled");
        }
    });
});
