import "$prebundled/clipboard/clipboard.js";
import "$prebundled/clipboard/tooltip.js";

$(() => {
    $(document)
        .find("pre code")
        .each((_, el) => {
            let copyButton: JQuery<HTMLSpanElement>;
            $(el)
                .closest(".source-wrap")
                .before(
                    $("<div>", { class: "copy-clipboard" }).append(
                        (copyButton = $("<span>", {
                            class: "btn-clipboard",
                            "data-clipboard-text": $(el).text(),
                            title: "Click to copy",
                        }).text("Copy")) as unknown as JQuery<JQuery.Node>,
                    ) as unknown as JQuery<JQuery.Node>,
                );

            const firstCopyButton = copyButton[0];

            $(firstCopyButton).on("mouseleave", (e) => {
                const target = $(e.currentTarget);
                target.attr("class", "btn-clipboard");
                target.removeAttr("aria-label");
            });

            // @ts-expect-error Not our Clipboard
            const curClipboard = new Clipboard(firstCopyButton);

            // @ts-expect-error Not our Clipboard
            curClipboard.on("success", (e) => {
                e.clearSelection();
                showTooltip(e.trigger, "Copied!");
            });

            // @ts-expect-error Not our Clipboard
            curClipboard.on("error", (e) => {
                showTooltip(e.trigger, fallbackMessage(e.action));
            });
        });
});
