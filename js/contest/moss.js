$(() => {
    $(".contest-moss").on("click", () => {
        return confirm(gettext("Are you sure you want to MOSS the contest?"));
    });
    $(".contest-moss-delete").on("click", () => {
        return confirm(gettext("Are you sure you want to delete the MOSS results?"));
    });
});
