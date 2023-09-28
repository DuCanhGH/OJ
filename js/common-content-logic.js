import "$prebundled/clipboard/clipboard.js";
import "$prebundled/clipboard/tooltip.js";

import { getI18n } from "./utils.js";

const i18n = getI18n(document.currentScript?.dataset, {
    clickToCopy: "i18nClickToCopy",
    copy: "i18nCopy",
    copied: "i18nCopied",
});

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
                            title: i18n.clickToCopy,
                        }).text(i18n.copy)),
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
                showTooltip(e.trigger, i18n.copied);
            });

            // @ts-expect-error Not our Clipboard
            curClipboard.on("error", (e) => {
                showTooltip(e.trigger, fallbackMessage(e.action));
            });
        });
    };
    window.addCodeCopyButtons($(document));
});
