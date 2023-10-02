import cookie from "js-cookie";

declare global {
    interface Window {
        /**
         * This method is only available when you include `dmmd-preview.js`.
         * @param $preview
         */
        registerDmmdPreview($preview: JQuery<HTMLElement>): void;
    }
}

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
            if ((ev.metaKey || ev.ctrlKey) && ev.code === "Enter") {
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
                            csrfmiddlewaretoken: cookie.get("csrftoken"),
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
        let lastEvent: ReturnType<typeof setTimeout> | null = null;
        let lastText = $textarea.val();
        if (timeout) {
            const parsedTimeout = parseInt(timeout);
            $textarea.on("keyup paste", () => {
                const text = $textarea.val();
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
        django.jQuery(document).on("formset:added", (_, $row: JQuery<HTMLElement>) => {
            const $preview = $row.find(".dmmd-preview");
            if ($preview.length) {
                let id = $row.attr("id") as string;
                id = id.substring(id.lastIndexOf("-") + 1);
                const oldTextAreaId = $preview.attr("data-textarea-id") as string;
                $preview.attr("data-textarea-id", oldTextAreaId.replace("__prefix__", id));
                window.registerDmmdPreview($preview);
            }
        });
});
