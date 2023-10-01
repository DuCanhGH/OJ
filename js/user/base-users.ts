const select2Theme = document.currentScript?.dataset.select2Theme;
const userSearchUrl = document.currentScript?.dataset.userSearchUrl;

$(() => {
    $("#search-handle").replaceWith(
        $("<select>").attr({
            id: "search-handle",
            name: "handle",
            onchange: "form.submit()",
        }),
    );
    const inUserRedirect = false;
    $("#search-handle").select2<{
        gravatar_url: string;
        display_rank: string;
        text: string;
    }>({
        theme: select2Theme,
        placeholder: gettext("Search by handle..."),
        ajax: {
            url: userSearchUrl,
        },
        minimumInputLength: 1,
        templateResult(data) {
            if (!("gravatar_url" in data)) return $("<span>");

            return $("<span>")
                .append(
                    $("<img>", {
                        class: "user-search-image",
                        src: data.gravatar_url,
                        width: 24,
                        height: 24,
                    }),
                )
                .append(
                    $("<span>", { class: data.display_rank + " user-search-name" }).text(data.text),
                );
        },
    });

    $("#search-handle").on("select2:selecting", () => {
        return !inUserRedirect;
    });

    let $last: JQuery<HTMLElement> | null = null;
    $(window)
        .on("hashchange", () => {
            const hash = window.location.hash;
            if (hash.startsWith("#!")) {
                const $user = $("#user-" + hash.substring(2)).addClass("highlight");
                if ($user) {
                    $(document).scrollTop($user.position().top - 50);
                    if ($last !== null) $last.removeClass("highlight");
                    $last = $user;
                }
            }
        })
        .trigger("hashchange");
});
