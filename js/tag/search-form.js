const select2Theme = document.currentScript?.dataset.select2Theme;
const tagProblemRandomUrl = document.currentScript?.dataset.tagProblemRandomUrl;

$(() => {
    const $form = $("form#filter-form");

    $("#judges")
        .select2({
            theme: select2Theme,
            multiple: true,
            placeholder: "{{ _('Filter by online judge...') }}",
        })
        .css({ visibility: "visible" });

    $("#go").on("click", () => {
        $form.trigger("click");
    });

    $("#random").on("click", (e) => {
        const action = $form.attr("action");

        if (action === undefined || tagProblemRandomUrl === undefined) return;

        $form.attr("action", tagProblemRandomUrl).attr("target", "_blank").trigger("submit");
        $form.attr("action", action).attr("target", "");
        e.preventDefault();
    });
});
