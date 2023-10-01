const problemCode = document.currentScript?.dataset.problemCode;

$(() => {
    $("#pdf_button").on("click", async (e) => {
        e.preventDefault();
        if (!$("#raw_problem").attr("src")) $("#raw_problem").attr("src", `${problemCode}/raw`);

        // @ts-expect-error here we go again...
        while (!$(".math-loaded", frames["raw_problem"].document).length) {
            await new Promise((r) => setTimeout(r, 200));
        }

        // @ts-expect-error here we go again...
        frames["raw_problem"].print();
    });
});
