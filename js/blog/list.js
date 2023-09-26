import { countDown } from "../common-utils.js";

$(document).on("ready", () => {
    $(".time-remaining").each((_, el) => {
        countDown($(el));
    });

    $(".blog-sidebar").hide();
    $("#blog-tab")
        .find("a")
        .on("click", (e) => {
            e.preventDefault();
            $("#blog-tab").addClass("active");
            $("#event-tab").removeClass("active");
            $(".blog-content").show();
            $(".blog-sidebar").hide();
        });
    $("#event-tab")
        .find("a")
        .on("click", (e) => {
            e.preventDefault();
            $("#event-tab").addClass("active");
            $("#blog-tab").removeClass("active");
            $(".blog-content").hide();
            $(".blog-sidebar").show();
        });
});
