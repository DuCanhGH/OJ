interface Status {
    code: "SUCCESS" | "FAILURE" | "PROGRESS" | "WORKING";
    done: number;
    total: number;
    error: string | undefined;
    stage: string | undefined;
}

const taskStatusAjax = document.currentScript?.dataset.taskStatusAjax;

$(() => {
    const $jumbotron = $(".jumbotron");
    const task_id = $jumbotron.attr("data-task-id");
    const status = JSON.parse($jumbotron.attr("data-task-status") as string) as Status;
    const redirect = $jumbotron.attr("data-redirect");
    const $stage = $jumbotron.find(".stage");
    const $progress = $jumbotron.find(".progress");
    const $known = $jumbotron.find(".progress-known");
    const $knownBar = $known.find(".progress-bar");
    const $knownText = $known.find(".progress-text");
    const $fail = $jumbotron.find(".progress-failed");
    const $failText = $fail.find(".progress-bar");

    function showStatus(status: Status) {
        $progress.hide();
        switch (status.code) {
            case "SUCCESS":
                $progress.filter(".progress-complete").show();
                break;
            case "FAILURE":
                if (status.error) $failText.text(status.error);
                $fail.show();
                break;
            case "PROGRESS":
                $knownBar
                    .attr({
                        "aria-valuenow": "" + status.done,
                        "aria-valuemax": "" + status.total,
                    })
                    .width((100 * status.done) / status.total + "%");
                $knownText.text(status.done + " / " + status.total);
                $known.show();
                break;
            case "WORKING":
                $progress.filter(".progress-unknown").show();
                break;
        }
        $stage.text(status.stage || "");
    }

    function needAjax(status: Status) {
        return status.code !== "SUCCESS" && status.code !== "FAILURE";
    }

    function doAjax(backoff: number = 1) {
        if (taskStatusAjax === undefined) return;

        $.get(taskStatusAjax, {
            id: task_id,
        })
            .done((data) => {
                showStatus(data);
                if (data.code === "SUCCESS") {
                    if (redirect) window.location.href = redirect;
                } else if (needAjax(data)) {
                    setTimeout(() => doAjax(), 500);
                }
            })
            .fail((_, status) => {
                console.log(status);
                setTimeout(() => {
                    doAjax(backoff * 2);
                }, backoff);
            });
    }

    showStatus(status);
    if (needAjax(status)) {
        doAjax();
    }
});
