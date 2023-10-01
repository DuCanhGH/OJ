import { createTwoFilesPatch } from "diff";
import { Diff2HtmlUI } from "diff2html/lib/ui/js/diff2html-ui-slim.js";

const firstSource = document.currentScript?.dataset.firstSource;
const secondSource = document.currentScript?.dataset.secondSource;

$(() => {
    const targetElement = document.getElementById("diffResult");

    if (targetElement === null || firstSource === undefined || secondSource === undefined) return;

    const patch = createTwoFilesPatch("dummy", "dummy", firstSource, secondSource);

    const diff2htmlUi = new Diff2HtmlUI(targetElement, patch, {
        drawFileList: false,
        outputFormat: "side-by-side",
        fileContentToggle: false,
    });

    diff2htmlUi.draw();
    diff2htmlUi.highlightCode();

    $(".d2h-file-name:first").text("Diff Result");

    if (firstSource === secondSource) {
        $(".d2h-tag:first").attr("class", "d2h-tag d2h-added d2h-added-tag");
        $(".d2h-tag:first").text("IDENTICAL");
    }
});
