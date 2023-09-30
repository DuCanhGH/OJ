import "$prebundled/clipboard/clipboard.js";
import "$prebundled/clipboard/tooltip.js";

$(() => {
    window.addCodeCopyButtons = ($container) => {
        $container.find("pre code").each((_, el) => {
            let copyButton;
            $(el)
                .parent()
                .before(
                    $("<div>", { class: "copy-clipboard" }).append(
                        (copyButton = $("<span>", {
                            class: "btn-clipboard",
                            "data-clipboard-text": $(el).text(),
                            title: gettext("Click to copy"),
                        }).text(gettext("Copy"))),
                    ),
                );

            const firstCopyButton = copyButton.get(0);

            if (!firstCopyButton) return;

            $(firstCopyButton).on("mouseleave", () => {
                $(el).attr("class", "btn-clipboard");
                $(el).removeAttr("aria-label");
            });

            // @ts-expect-error Not our Clipboard
            const curClipboard = new Clipboard(firstCopyButton);

            // @ts-expect-error Not our Clipboard
            curClipboard.on("success", (e) => {
                e.clearSelection();
                showTooltip(e.trigger, gettext("Copied!"));
            });

            // @ts-expect-error Not our Clipboard
            curClipboard.on("error", (e) => {
                showTooltip(e.trigger, fallbackMessage(e.action));
            });
        });
    };
    window.addCodeCopyButtons($(document));
});
