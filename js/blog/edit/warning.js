import flatpickr from "flatpickr";

import { getI18n } from "$js/utils.js";

const i18n = getI18n(document.currentScript?.dataset, {
    confirmDeleteBlog: "i18nConfirmDeleteBlog",
});

// This code activates flatpickr on fields with the 'datetimefield' class when the document has loaded
window.addEventListener("DOMContentLoaded", () => {
    // @ts-expect-error weird typings
    flatpickr(".datetimefield", {
        enableTime: true,
        enableSeconds: true,
        dateFormat: "Y-m-d H:i:S",
        time_24hr: true,
    });
});

$(() => {
    $("#delete-button").on("click", () => {
        return confirm(i18n.confirmDeleteBlog);
    });
});
