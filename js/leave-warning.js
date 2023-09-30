import "$vnoj/jquery.dirty.min.js";

$(() => {
    $("form").dirty({
        preventLeaving: true,
        leavingMessage: gettext("Changes you made may not be saved."),
    });
});
