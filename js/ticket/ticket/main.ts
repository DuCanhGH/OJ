import "$prebundled/featherlight/featherlight.min.js";

import type { Ticket } from "../types.js";

const ticketId = document.currentScript?.dataset.ticketId;
const ticketMessageUrl = document.currentScript?.dataset.ticketMessageUrl;

$(() => {
    const $h2 = $("#content").find("> h2:first-child");
    const $voteStatus = $h2.find(".vote-status i"),
        $status = $h2.find(".status i"),
        $title = $h2.find(".title");

    function updateTicketState(open: boolean) {
        if (open) $status.removeClass("fa-check-circle-o").addClass("fa-exclamation-circle");
        else $status.removeClass("fa-exclamation-circle").addClass("fa-check-circle-o");
        $(".close-ticket").toggle(open);
        $(".open-ticket").toggle(!open);
    }

    function updateTicketVote(contributive: boolean) {
        if (contributive) $voteStatus.removeClass("fa-minus").addClass("fa-arrow-up");
        else $voteStatus.removeClass("fa-arrow-up").addClass("fa-minus");
        $(".vote-norm").toggle(contributive);
        $(".vote-good").toggle(!contributive);
    }

    $(".close-ticket, .open-ticket").on("click", (e) => {
        const open = $(e.currentTarget).attr("data-open") === "1";
        $.ajax({
            url: $(e.currentTarget).attr("data-ajax"),
            type: "POST",
            success() {
                updateTicketState(open);
            },
            error(data) {
                alert(
                    gettext("Could not change ticket: {error}").replace(
                        "{error}",
                        data.responseText,
                    ),
                );
            },
        });
    });

    $(".vote-good, .vote-norm").on("click", (e) => {
        const contributive = $(e.currentTarget).attr("data-contributive") === "1";
        $.ajax({
            url: $(e.currentTarget).attr("data-ajax"),
            type: "POST",
            success() {
                updateTicketVote(contributive);
            },
            error(data) {
                alert("Could not change ticket: " + data.responseText);
            },
        });
    });

    $(".edit-notes").featherlight({
        afterOpen() {
            const $form = $("#edit-notes");
            $form.find(".submit").on("click", () => {
                const actionUrl = $form.attr("action");
                if (actionUrl === undefined) return false;
                $.post(actionUrl, $form.serialize()).done((data) => {
                    $("#ticket-notes")
                        .find(".info-empty")
                        .toggle(!data)
                        .end()
                        .find(".info-real")
                        .html(data);
                    $.featherlight.current().close();
                });
                return false;
            });
        },
    });

    const pageRefKey = `ticket:open:${ticketId}`,
        pageCloseKey = pageRefKey + ":close";

    let pageRef: number | null = null;

    function increasePageRef() {
        const pageRefLs = localStorage.getItem(pageRefKey);
        if (pageRefLs !== null && !Number.isNaN(+pageRefLs)) {
            const pageRefNewValue = +pageRefLs + 1;
            localStorage.setItem(pageRefKey, "" + pageRefNewValue);
            pageRef = pageRefNewValue;
        } else {
            localStorage.setItem(pageRefKey, "1");
            pageRef = 1;
        }
    }

    function decreasePageRef() {
        const pageRefLs = localStorage.getItem(pageRefKey);
        if (pageRefLs !== null && !Number.isNaN(+pageRefLs)) {
            const pageRefNewValue = +pageRefLs - 1;
            localStorage.removeItem(pageCloseKey);
            localStorage.setItem(pageRefKey, "" + pageRefNewValue);
        }
        pageRef = null;
    }

    function isHighestRef() {
        console.log(localStorage[pageRefKey], pageRef);
        if (pageRefKey in localStorage) return +localStorage[pageRefKey] == pageRef;
        return true;
    }

    $(window).on("storage", (e) => {
        // @ts-expect-error weird
        if (e.originalEvent.key == pageCloseKey && e.originalEvent.newValue !== null) {
            // @ts-expect-error weird
            if (pageRef != null && pageRef > +e.originalEvent.newValue) {
                --pageRef;
            }
        }
    });

    window.registerNotify("ticket", {
        change(enabled: any) {
            if (enabled) increasePageRef();
        },
    });

    $(window).on("beforeunload", () => {
        decreasePageRef();
    });

    function ticketStatus(ticket: Ticket) {
        updateTicketState(ticket.open);
        if (isHighestRef()) {
            window.notify(
                "ticket",
                (ticket.open ? gettext("Reopened: ") : gettext("Closed: ")) + $title.text(),
            );
        }
    }

    function ticketMessage(ticket: Ticket) {
        console.log("Fetching data for: " + ticket.message);
        $.ajax({
            url: ticketMessageUrl,
            data: { message: ticket.message },
            success(data) {
                console.log("Got data for: " + ticket.message);
                console.log(data);
                $("#messages").append($(data.message));
            },
            error(data) {
                if (data.status === 403) console.log("No right to see: " + ticket.message);
                else {
                    console.log("Could not load ticket message:");
                    console.log(data.responseText);
                }
            },
        });
    }

    window.loadDynamicUpdate = () => {
        window.eventDispatcher.auto_reconnect = true;
        window.eventDispatcher.on(`ticket-${ticketId}`, (message: any) => {
            console.log(message);
            switch (message.type) {
                case "ticket-status":
                    ticketStatus(message);
                    break;
                case "ticket-message":
                    ticketMessage(message);
                    break;
            }
        });
    };
});
