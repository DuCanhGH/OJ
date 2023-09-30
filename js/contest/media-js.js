const contest = document.currentScript?.dataset.contestName ?? "(unknown contest)";
const officialContestMode = document.currentScript?.dataset.officialContestMode === "true";
const inContest = document.currentScript?.dataset.inContest === "true";

$(() => {
    $(".leaving-forever").on("click", () => {
        return confirm(
            `${gettext("Are you sure you want to leave?")}\n${gettext(
                "You cannot come back to a virtual participation. You will have to start a new one.",
            )}`,
        );
    });

    if (!officialContestMode) {
        $(".first-join").on("click", () => {
            return confirm(
                `${gettext("Are you sure you want to join?")}\n${gettext(
                    "Joining a contest starts your timer, after which it becomes unstoppable.",
                )}`,
            );
        });
    }

    if (inContest) {
        $(".contest-join").on("click", () => {
            return confirm(
                `${gettext("Are you sure you want to join?")}\n${interpolate(
                    gettext("Joining this contest will leave %(contest)s."),
                    { contest },
                    true,
                )}`,
            );
        });
    }

    $(".register-warning").on("click", () => {
        return confirm(gettext("Are you sure you want to register?"));
    });
});
