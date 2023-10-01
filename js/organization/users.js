$(() => {
    $("form.kick-form")
        .find("a.button")
        .on("click", (e) => {
            if (confirm(gettext("Are you sure you want to kick this user?"))) {
                $(e.currentTarget).parent().trigger("submit");
            }
            return false;
        });
});
