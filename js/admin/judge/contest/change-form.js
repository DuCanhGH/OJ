django.jQuery(($) => {
    $(".rerate-link").appendTo("div#bottombar").show();
    $(".rejudge-link").on("click", () => {
        return confirm(gettext("Are you sure you want to rejudge ALL the submissions?"));
    });
    $(".rescore-link").on("click", () => {
        return confirm(gettext("Are you sure you want to rescore ALL the submissions?"));
    });
    $(".resend-link").on("click", () => {
        return confirm(gettext("Are you sure you want to resend this announcement?"));
    });
});
