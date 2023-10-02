import { countDown } from "../common-utils.js";

const contestId = document.currentScript?.dataset.contestId ?? "";
// Virtual = 0 is live participation, virtual = -1 is spectating
const shouldPush = document.currentScript?.dataset.shouldPush === "true";

$(() => {
    countDown($("#contest-time-remaining"));

    /**
     * @type {JQuery<HTMLElement> | null}
     */
    let selected = null;
    let xPosition = 0,
        yPosition = 0,
        xElement = 0,
        yElement = 0;

    $("#contest-info").on("mousedown", (e) => {
        selected = $(e.currentTarget);
        const selectedOffset = selected.offset();
        const scrollTop = $(window).scrollTop();
        if (selectedOffset && scrollTop) {
            xElement = xPosition - selectedOffset.left;
            yElement = yPosition - (selectedOffset.top - scrollTop);
        }
        return false;
    });

    const contestTimerPos = localStorage.getItem("contest_timer_pos");

    if (contestTimerPos) {
        const data = contestTimerPos.split(":");
        $("#contest-info").css({
            left: data[0],
            top: data[1],
        });
    }

    $("#contest-info").show();

    $(document).on("mousemove", (e) => {
        xPosition = e.screenX;
        yPosition = e.screenY;
        xPosition = Math.max(Math.min(xPosition, window.innerWidth), 0);
        yPosition = Math.max(Math.min(yPosition, window.innerHeight), 0);

        if (selected !== null) {
            const leftPx = xPosition - xElement + "px";
            const topPx = yPosition - yElement + "px";

            localStorage.setItem("contest_timer_pos", leftPx + ":" + topPx);

            selected.css({
                left: leftPx,
                top: topPx,
            });
        }
    });

    $(document).on("mouseup", () => {
        selected = null;
    });

    if (shouldPush) {
        $(() => {
            window.eventDispatcher.autoReconnect = true;
            window.eventDispatcher.on(`contest_${contestId}`, (data) => {
                alert(data.title + "\n\n" + data.message);
            });
        });
    }
});
