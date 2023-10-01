import { countDown } from "$js/common-utils.js";

$(() => {
    /**
     * 
     * @param {JQuery<HTMLElement>} $obj 
     * @param {number} duration 
     */
    function check($obj, duration) {
        const group = $obj.parent().find(".form-group");
        if ($obj.is(":checked")) {
            group.fadeIn(duration);
        } else {
            group.fadeOut(duration);
        }
    }
    $("#id_submission_download").on("click", (e) => {
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
