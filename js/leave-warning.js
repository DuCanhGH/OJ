import "$vnoj/jquery.dirty.min.js";
import { getI18n } from "./utils.js";

const i18n = getI18n(document.currentScript?.dataset, {
    leavingMessage: "i18nLeavingMessage",
});

$(() => {
    $("form").dirty({
        preventLeaving: true,
        leavingMessage: i18n.leavingMessage,
    });
});
