import "$prebundled/featherlight/featherlight.min.js";
import "$prebundled/timezone-map/timezone-picker.js";

const timezonePickerJson = document.currentScript?.dataset.timezonePickerJson;

$(() => {
    if (timezonePickerJson === undefined) return;

    $("#open-map").featherlight({
        afterOpen() {
            window.timezone_picker(
                $(".featherlight-inner .map-inset"),
                $("#id_timezone"),
                timezonePickerJson,
            );
        },
    });
});
