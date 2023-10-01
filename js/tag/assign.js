const select2Theme = document.currentScript?.dataset.select2Theme;

$(() => {
    $("#tags").select2({
        theme: select2Theme,
        closeOnSelect: false,
    });

    $("body").on("click", ".select2-results__group", (e) => {
        $(e.currentTarget).siblings().toggle();
    });

    $("body").on("click", ".select2-selection__rendered", () => {
        $(".select2-results__group").trigger("click");
    });
});
