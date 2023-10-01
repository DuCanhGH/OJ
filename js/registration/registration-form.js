$(() => {
    $(".pass-req-link").on("click", () => {
        $(".pass-req").toggle("fast");
        return false;
    });
    try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (typeof tz === "string" && $(`#id_timezone option[value="${tz}"]`).length) {
            $("#id_timezone").val(tz).trigger("change");
        }
    } catch (e) {
        // Do nothing
    }
});
