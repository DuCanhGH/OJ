import { countDown } from "$js/common-utils.js";

$(() => {
    function check($obj: JQuery<HTMLElement>, duration: number) {
        const group = $obj.parent().find(".form-group");
        if ($obj.is(":checked")) {
            group.fadeIn(duration);
        } else {
            group.fadeOut(duration);
        }
    }
    check($("#id_submission_download"), 0);
    $("#id_submission_download").on("change", (e) => {
        check($(e.currentTarget), 300);
    });
    $("#prepare-download").on("click", () => {
        return confirm(gettext("Are you sure you want to prepare a download?"));
    });
});

$(document).on("ready", () => {
    $(".time-remaining").each((_, el) => {
        countDown($(el));
    });
});
