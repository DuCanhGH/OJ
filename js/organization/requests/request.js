$(() => {
    $("#id_reason").on("click", (e) => {
        if (e.ctrlKey && (e.key === "Enter" || e.key === "ShiftLeft" || e.key === "ShiftRight")) {
            $(e.currentTarget).closest("form").trigger("submit");
        }
    });
});
