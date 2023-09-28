import "$prebundled/featherlight/featherlight.min.js";

import { countDown } from "$js/common-utils.js";
import { getI18n } from "$js/utils.js";

const officialContestMode = document.currentScript?.dataset.officialContestMode === "true";
const inContest = document.currentScript?.dataset.inContest === "true";
const hidePrivateContestsAttr = document.currentScript?.dataset.hidePrivateContests;

const i18n = getI18n(document.currentScript?.dataset, {
    confirmJoin: "i18nConfirmJoin",
    confirmJoinStartTimer: "i18nConfirmJoinStartTimer",
    confirmJoinLeaveContest: "i18nConfirmJoinLeaveContest",
    confirmSpectate: "i18nConfirmSpectate",
    confirmSpectateLeaveContest: "i18nConfirmSpectateLeaveContest",
    confirmRegister: "i18nConfirmRegister",
});

$(document).on("ready", () => {
    $(".time-remaining").each((_, el) => {
        countDown($(el));
    });

    $(".contest-tag").find("a[data-featherlight]").featherlight();

    if (officialContestMode) {
        $(".join-warning").on("click", () => {
            return confirm(
                `${i18n.confirmJoin}\n` + i18n.confirmJoinStartTimer + inContest
                    ? `\n${i18n.confirmJoinLeaveContest}`
                    : "",
            );
        });
    }

    if (inContest) {
        $(".spectate-warning").on("click", () => {
            return confirm(`${i18n.confirmSpectate}\n` + i18n.confirmSpectateLeaveContest);
        });
    }

    $(".register-warning").on("click", () => {
        return confirm("{{ _('Are you sure you want to register?') }}");
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
