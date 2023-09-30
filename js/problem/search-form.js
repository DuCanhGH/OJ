const myOptions = $("#types option").get().map(e => $(e));
const selected = $("#types").val();

myOptions.sort((a, b) => {
    return a.text().localeCompare(b.text(), "vi");
});

if (selected !== undefined) {
    $("#types").empty().append(myOptions);
    $("#types").val(selected);
}
