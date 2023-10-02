import cookie from "js-cookie";

import type { Ticket } from "../types.js";

const filterUserIds = JSON.parse(document.currentScript?.dataset.filterUserIds ?? "[]");
const filterOwnId = JSON.parse(document.currentScript?.dataset.filterOwnId ?? "null");
const filterAssigneeIds = JSON.parse(document.currentScript?.dataset.filterAssigneeIds ?? "[]");
const newTicketUrl = document.currentScript?.dataset.newTicketUrl;
const select2Theme = document.currentScript?.dataset.select2Theme;
const ticketUserSelect2Url = document.currentScript?.dataset.ticketUserSelect2Url;
const ticketAssigneeSelect2Url = document.currentScript?.dataset.ticketAssigneeSelect2Url;

$(() => {
    $("input#open, input#own").on("click", () => {
        const csrfToken = cookie.get("csrftoken");
        if (csrfToken) {
            $("<form>")
                .attr("action", window.location.pathname + "?" + $("form#filter-form").serialize())
                .append(
                    $("<input>")
                        .attr("type", "hidden")
                        .attr("name", "csrfmiddlewaretoken")
                        .attr("value", csrfToken),
                )
                .attr("method", "POST")
                .appendTo($("body"))
                .trigger("submit");
        }
    });

    window.registerNotify("ticket", {
        $checkbox: $("#notification"),
        change(enabled) {
            if (!enabled) {
                for (const key of Object.keys(localStorage)) {
                    if (key.startsWith("ticket:open:")) {
                        localStorage.removeItem(key);
                    }
                }
            }
        },
    });

    function mainListNotify(id: string) {
        const key = "ticket:open:" + id;
        const lsKey = localStorage.getItem(key);
        return lsKey === null || lsKey === "0";
    }

    const $tbody = $("#ticket-list").find("tbody");

    function newTicket(ticket: Ticket) {
        console.log("Fetching data for: " + ticket.id);
        $.ajax({
            url: newTicketUrl,
            data: { id: ticket.id },
            success(data) {
                console.log("Got data for: " + ticket.id);
                console.log(data);
                $tbody.prepend($(data.row));
                window.notify("ticket", data.notification.title, {
                    body: data.notification.body,
                });
            },
            error(data) {
                if (data.status === 403) {
                    console.log("No right to see: " + ticket.id);
                } else {
                    console.log("Could not load ticket:");
                    console.log(data.responseText);
                }
            },
        });
    }

    function ticketStatus(ticket: Ticket) {
        if (!mainListNotify(ticket.id)) return;

        const $row = $("#ticket-" + ticket.id);
        console.log("Ticket status change: " + ticket.id);
        if ($row.length) {
            const $status = $row.find("td").first().find("i");
            if (ticket.open) {
                $status.removeClass("fa-check-circle-o").addClass("fa-exclamation-circle");
                window.notify("ticket", gettext("Reopened: ") + ticket.title);
            } else {
                $status.removeClass("fa-exclamation-circle").addClass("fa-check-circle-o");
                window.notify("ticket", gettext("Closed: ") + ticket.title);
            }
        }
    }

    window.loadDynamicUpdate = () => {
        const $assignees = $(filterAssigneeIds);

        window.eventDispatcher.autoReconnect = true;
        window.eventDispatcher.on<Ticket>("tickets", (message) => {
            console.log(message);
            if (
                filterOwnId != null &&
                message.user != filterOwnId &&
                !~message.assignees.indexOf(filterOwnId)
            )
                return;
            if (filterUserIds.length && !~filterUserIds.indexOf(message.user)) return;
            if ($assignees.length && !$assignees.filter(message.assignees).length) return;
            switch (message.type) {
                case "new-ticket":
                    newTicket(message);
                    break;
                case "ticket-status":
                    ticketStatus(message);
                    break;
            }
        });
    };

    interface Select2Data {
        gravatar_url: string;
        display_rank: string;
        text: string;
    }

    function resolveTemplate(data: Select2Data) {
        return $("<span>")
            .append(
                $("<img>", {
                    class: "user-search-image",
                    src: data.gravatar_url,
                    width: 24,
                    height: 24,
                }),
            )
            .append(
                $("<span>", { class: data.display_rank + " user-search-name" }).text(data.text),
            );
    }

    $("#filter-user").select2<Select2Data>({
        theme: select2Theme,
        templateResult(data) {
            if (!("gravatar_url" in data)) return $("<span>");
            return resolveTemplate(data);
        },
        ajax: {
            data(params) {
                return {
                    term: params.term || "",
                    page: params.page || 1,
                };
            },
            processResults(data) {
                return {
                    results: data.results,
                    pagination: {
                        more: data.more,
                    },
                };
            },
            url: ticketUserSelect2Url,
        },
    });
    $("#filter-assignee").select2<{
        gravatar_url: string;
        display_rank: string;
        text: string;
    }>({
        theme: select2Theme,
        templateResult(data) {
            if (!("gravatar_url" in data)) return $("<span>");
            return resolveTemplate(data);
        },
        ajax: {
            data(params) {
                return {
                    term: params.term || "",
                    page: params.page || 1,
                };
            },
            processResults(data) {
                return {
                    results: data.results,
                    pagination: {
                        more: data.more,
                    },
                };
            },
            url: ticketAssigneeSelect2Url,
        },
    });
});
