import flatpickr from "flatpickr";

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
        return confirm("{{ _('Are you sure you want to delete this blog post?') }}");
    });
});
