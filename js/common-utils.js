/**
 * @param {JQuery<HTMLElement>} label
 */
export function countDown(label) {
    const initial = parseInt(label.attr("data-secs") ?? "0");
    const start = Date.now();

    /**
     * @param {number} num
     * @returns
     */
    function format(num) {
        const s = "0" + num;
        return s.substring(s.length - 2);
    }

    const timer = setInterval(() => {
        const time = Math.round(initial - (Date.now() - start) / 1000);
        if (time <= 0) {
            clearInterval(timer);
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        }
        const d = Math.floor(time / 86400);
        const h = Math.floor((time % 86400) / 3600);
        const m = Math.floor((time % 3600) / 60);
        const s = time % 60;
        if (d > 0) {
            label.text(
                npgettext("time format with day", "%d day %h:%m:%s", "%d days %h:%m:%s", d)
                    .replace("%d", "" + d)
                    .replace("%h", format(h))
                    .replace("%m", format(m))
                    .replace("%s", format(s)),
            );
        } else {
            label.text(
                pgettext("time format without day", "%h:%m:%s")
                    .replace("%h", format(h))
                    .replace("%m", format(m))
                    .replace("%s", format(s)),
            );
        }
    }, 1000);
}
