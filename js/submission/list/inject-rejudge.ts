declare global {
    interface Window {
        rejudgeSubmission(id: number, e: MouseEvent): void;
    }
}

const submissionRejudgeUrl = document.currentScript?.dataset.submissionRejudgeUrl;

window.rejudgeSubmission = (id, e) => {
    if (
        (typeof e !== "undefined" && e.ctrlKey) ||
        confirm(gettext("Are you sure you want to rejudge?"))
    ) {
        $.ajax({
            url: submissionRejudgeUrl,
            type: "POST",
            data: {
                id,
            },
        });
    }
};
