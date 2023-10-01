const currentLanguageCode = document.currentScript?.dataset.currentLanguageCode;

moment.locale(currentLanguageCode);

declare global {
    interface Window {
        submitLanguage(lang: string): void;
    }
}

/**
 * @param {string} lang
 */
window.submitLanguage = (lang) => {
    if (lang !== currentLanguageCode) {
        $("input[name=language]").val(lang);
        $("#set_language").trigger("submit");
    }
}

$(() => {
    $("img.unveil").unveil(200);
});