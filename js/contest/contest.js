import { countDown } from "$js/common-utils.js";

$(document).on("ready", () => {
    $(".time-remaining").each((_, el) => {
        countDown($(el));
    });
});
