$(() => {
    window.registerDmmdPreview = ($preview) => {
        const $form = $preview.parents("form").first();
        const $update = $preview.find(".dmmd-preview-update");
        const $content = $preview.find(".dmmd-preview-content");
        const previewUrl = $preview.attr("data-preview-url");

        if (!previewUrl) {
            return;
        }

        const $textarea = $("#" + $preview.attr("data-textarea-id"));

        // Submit the form if Ctrl+Enter is pressed in pagedown textarea.
        $textarea.on("keydown", (ev) => {
            // Ctrl+Enter pressed (metaKey used to support command key on mac).
            if ((ev.metaKey || ev.ctrlKey) && ev.which == 13) {
                $form.trigger("submit");
            }
        });

        $update
            .on("submit", () => {
                const text = $textarea.val();
                if (text) {
                    $preview.addClass("dmmd-preview-stale");
                    $.post(
                        previewUrl,
                        {
                            content: text,
                            csrfmiddlewaretoken: window.parsedCookie["csrftoken"],
                        },
                        (result) => {
                            $content.html(result);
                            $preview
                                .addClass("dmmd-preview-has-content")
                                .removeClass("dmmd-preview-stale");

                            const $jax = $content.find(".require-mathjax-support");
                            if ($jax.length) {
                                if (!("MathJax" in window)) {
                                    $.ajax({
                                        type: "GET",
                                        url: $jax.attr("data-config"),
                                        dataType: "script",
                                        cache: true,
                                        success() {
                                            $.ajax({
                                                type: "GET",
                                                url: "https://cdnjs.cloudflare.com/ajax/libs/mathjax/3.2.0/es5/tex-chtml.min.js",
                                                dataType: "script",
                                                cache: true,
                                                success() {
                                                    MathJax.typesetPromise([$content[0]]).then(
                                                        () => {
                                                            $content.find(".tex-image").hide();
                                                            $content.find(".tex-text").show();
                                                        },
                                                    );
                                                },
                                            });
                                        },
                                    });
                                } else {
                                    MathJax.typesetPromise([$content[0]]).then(() => {
                                        $content.find(".tex-image").hide();
                                        $content.find(".tex-text").show();
                                    });
                                }
                            }
                        },
                    );
                } else {
                    $content.empty();
                    $preview
                        .removeClass("dmmd-preview-has-content")
                        .removeClass("dmmd-preview-stale");
                }
            })
            .trigger("click");

        const timeout = $preview.attr("data-timeout");
        /**
         * @type {ReturnType<typeof setTimeout> | null}
         */
        let lastEvent = null;
        let lastText = $textarea.val();
        if (timeout) {
            const parsedTimeout = parseInt(timeout);
            $textarea.on("keyup paste", () => {
                let text = $textarea.val();
                if (lastText == text) return;
                lastText = text;

                $preview.addClass("dmmd-preview-stale");
                if (lastEvent) clearTimeout(lastEvent);
                lastEvent = setTimeout(
                    () => {
                        $update.trigger("click");
                        lastEvent = null;
                    },
                    isNaN(parsedTimeout) ? 0 : parsedTimeout,
                );
            });
        }
    };

    $(".dmmd-preview").each((_, el) => {
        window.registerDmmdPreview($(el));
    });

    if ("django" in window && "jQuery" in window.django)
        django.jQuery(document).on("formset:added", (_, $row) => {
            const $preview = $row.find(".dmmd-preview");
            if ($preview.length) {
                let id = $row.attr("id");
                id = id.substr(id.lastIndexOf("-") + 1);
                $preview.attr(
                    "data-textarea-id",
                    $preview.attr("data-textarea-id").replace("__prefix__", id),
                );
                window.registerDmmdPreview($preview);
            }
        });
});
