const currentLanguageCode = document.currentScript?.dataset.currentLanguageCode;

moment.locale(currentLanguageCode);
$(() => {
    $("img.unveil").unveil(200);
});

/**
 * @param {string} lang
 */
function submitLanguage(lang) {
    if (lang !== currentLanguageCode) {
        $("input[name=language]").val(lang);
        $("#set_language").trigger("submit");
    }
}

$("#flag_vi").on("click", () => submitLanguage("vi"));
$("#flag_en").on("click", () => submitLanguage("en"));
