import "$prebundled/featherlight/featherlight.min.js";
import "$prebundled/timezone-map/timezone-picker.js";

import timezonePickerJson from "$prebundled/timezone-map/timezone-picker.json";

$(() => {
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
