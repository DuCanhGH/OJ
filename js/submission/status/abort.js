$(() => {
    $(document).on("keydown", (e) => {
        // Ctrl-Enter or Command-Enter
        if ((e.metaKey || e.ctrlKey) && e.code === "Enter") {
            $("#abort-button form").trigger("submit");
        }
    });
});
