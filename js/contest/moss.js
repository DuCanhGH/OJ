import { getI18n } from "$js/utils.js";

const i18n = getI18n(document.currentScript?.dataset, {
    confirmMoss: "i18nConfirmMoss",
    confirmDeleteMoss: "i18nConfirmDeleteMoss",
});

$(() => {
    $(".contest-moss").on("click", () => {
        return confirm(i18n.confirmMoss);
    });
    $(".contest-moss-delete").on("click", () => {
        return confirm(i18n.confirmDeleteMoss);
    });
});
