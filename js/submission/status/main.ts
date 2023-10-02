const submissionId = document.currentScript?.dataset.submissionId;
const submissionSecretId = document.currentScript?.dataset.submissionSecretId;
const submissionTestcasesQueryUrl = document.currentScript?.dataset.submissionTestcasesQueryUrl;

$(() => {
    let blocked = false,
        request = false;
    const list = $("#test-cases");

    function update() {
        if (blocked) {
            request = true;
            return;
        }
        request = false;
        blocked = true;
        $.ajax({
            url: submissionTestcasesQueryUrl,
            data: { id: submissionId },
        })
            .done((data) => {
                list.empty()
                    .html(data)
                    .find(".toggle")
                    .each((_, el) => {
                        window.registerToggle($(el));
                    });
                setTimeout(() => {
                    blocked = false;
                    if (request) update();
                }, 500);
            })
            .fail(() => {
                console.log("Failed to update testcases!");
            });

        const windowScrollTop = $(window).scrollTop(),
            windowHeight = $(window).height(),
            documentHeight = $(document).height();

        if (
            windowScrollTop &&
            windowHeight &&
            documentHeight &&
            windowScrollTop + windowHeight > documentHeight - 100
        ) {
            $("html, body").animate({ scrollTop: documentHeight }, 0);
        }
    }

    window.eventDispatcher.on(`sub_${submissionSecretId}`, (message: any) => {
        switch (message.type) {
            case "internal-error":
            case "grading-end":
            case "compile-error":
                $("#abort-button").remove();
                $("#grading-label").remove();
                update();
                break;
            case "test-case":
            case "grading-begin":
            case "processing":
                update();
                break;
        }
    });
});
