import "$prebundled/clipboard/clipboard.js";
import "$prebundled/clipboard/tooltip.js";

$(() => {
    const info_float = $(".info-float");
    if (info_float.length) {
        const container = $("#content-right");
        if (!featureTest("position", "sticky")) {
            fix_div(info_float, 55);
            $(window).resize(() => {
                info_float.width(container.width());
            });
            info_float.width(container.width());
        }
    }

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
                            title: "{{ _('Click to copy') }}",
                        }).text("{{ _('Copy') }}")),
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
                showTooltip(e.trigger, "{{ _('Copied!') }}");
            });

            // @ts-expect-error Not our Clipboard
            curClipboard.on("error", (e) => {
                showTooltip(e.trigger, fallbackMessage(e.action));
            });
        });
    };
    window.addCodeCopyButtons($(document));
});
