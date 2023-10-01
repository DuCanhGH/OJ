const selectAllName = document.currentScript?.dataset.selectAllName;

django.jQuery(($) => {
    const box = $(`div#${selectAllName}`);
    const original = box.find(".original-checkboxes");
    $(".checkall").on("click", (e) => {
        original.find(":checkbox").prop("checked", $(e.currentTarget).attr("checked"));
    });
});
