declare global {
    interface Window {
        /**
         * Only available when you include `submission/status/rejudge.js`.
         */
        confirmAndRejudge: ((form: HTMLFormElement) => void) | undefined;
    }
}

window.confirmAndRejudge = (form) => {
    if (confirm(gettext("Are you sure you want to rejudge?"))) {
        form.submit();
    }
};
