const isOrgOpen = document.currentScript?.dataset.isOrgOpen === "true";

$(() => {
    $(".leave-organization").on("click", () => {
        return confirm(
            `${gettext("Are you sure you want to leave this organization?")}\n${
                isOrgOpen
                    ? gettext("You will have to rejoin to show up on the organization leaderboard.")
                    : gettext("You will have to request membership in order to join again.")
            }`,
        );
    });
});
