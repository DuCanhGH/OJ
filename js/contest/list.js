import "$prebundled/featherlight/featherlight.min.js";

import { countDown } from "$js/common-utils.js";

const officialContestMode = document.currentScript?.dataset.officialContestMode === "true";
const inContest = document.currentScript?.dataset.inContest === "true";
const hidePrivateContestsAttr = document.currentScript?.dataset.hidePrivateContests;
const contest = document.currentScript?.dataset.contest ?? "(unknown contest)";

$(document).on("ready", () => {
    $(".time-remaining").each((_, el) => {
        countDown($(el));
    });

    $(".contest-tag").find("a[data-featherlight]").featherlight();

    if (officialContestMode) {
        $(".join-warning").on("click", () => {
            const warningLeaveContest = inContest
                ? `\n${interpolate(
                      gettext("Joining this contest will leave %(contest)s."),
                      { contest },
                      true,
                  )}`
                : "";
            return confirm(
                `${gettext("Are you sure you want to join?")}\n${gettext(
                    "Joining a contest for the first time starts your timer, after which it becomes unstoppable.",
                )}${warningLeaveContest}`,
            );
        });
    }

    if (inContest) {
        $(".spectate-warning").on("click", () => {
            return confirm(
                `${gettext("Are you sure you want to spectate?")}\n${interpolate(
                    gettext("Spectating this contest will leave %(contest)s."),
                    { contest },
                    true,
                )}`,
            );
        });
    }

    $(".register-warning").on("click", () => {
        return confirm(gettext("Are you sure you want to register?"));
    });

    if (typeof hidePrivateContestsAttr !== "undefined") {
        const hidePrivateContests = hidePrivateContestsAttr === "true";
        if (hidePrivateContests) {
            $("#hide-private-contests-checkbox").prop("checked", true);
        }

        $("#hide-private-contests-checkbox").on("click", () => {
            const parser = new URL(window.location.href);
            parser.searchParams.set(
                "hide_private_contests",
                hidePrivateContests ? "false" : "true",
            );
            window.location.href = parser.href;
        });
    }

    // var tooltip_classes = 'tooltipped tooltipped-e';
    //
    // $('.contest-tag').each(function () {
    //     var link = $(this);//
    //     link.mouseenter(function (e) {
    //         link.addClass(tooltip_classes).attr('aria-label', link.attr('data-description'));
    //     }).mouseleave(function (e) {
    //         link.removeClass(tooltip_classes).removeAttr('aria-label');
    //     });
    // });
});
