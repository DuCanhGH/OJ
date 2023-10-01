$(() => {
    $("input#open, input#own").click(() => {
        $("<form>")
            .attr("action", window.location.pathname + "?" + $("form#filter-form").serialize())
            .append(
                $("<input>")
                    .attr("type", "hidden")
                    .attr("name", "csrfmiddlewaretoken")
                    .attr("value", window.parsedToken["csrftoken"]),
            )
            .attr("method", "POST")
            .appendTo($("body"))
            .submit();
    });

    register_notify("ticket", {
        $checkbox: $("#notification"),
        change: (enabled) => {
            if (!enabled)
                for (key in localStorage)
                    if (key.startsWith("ticket:open:")) delete localStorage[key];
        },
    });

    function main_list_notify(id) {
        key = "ticket:open:" + id;
        return !(key in localStorage) || localStorage[key] == "0";
    }

    const $tbody = $("#ticket-list").find("tbody");

    function new_ticket(ticket) {
        console.log("Fetching data for: " + ticket.id);
        $.ajax({
            url: "{{ url('ticket_ajax') }}",
            data: { id: ticket.id },
            success(data) {
                console.log("Got data for: " + ticket.id);
                console.log(data);
                $tbody.prepend($(data.row));
                notify("ticket", data.notification.title, {
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

    function ticket_status(ticket) {
        if (!main_list_notify(ticket.id)) return;

        const $row = $("#ticket-" + ticket.id);
        console.log("Ticket status change: " + ticket.id);
        if ($row.length) {
            const $status = $row.find("td").first().find("i");
            if (ticket.open) {
                $status.removeClass("fa-check-circle-o").addClass("fa-exclamation-circle");
                notify("ticket", "{{ _('Reopened: ') }}" + ticket.title);
            } else {
                $status.removeClass("fa-exclamation-circle").addClass("fa-check-circle-o");
                notify("ticket", "{{ _('Closed: ') }}" + ticket.title);
            }
        }
    }

    window.load_dynamic_update = () => {
        const $assignees = $(filter_assignee_ids);

        eventDispatcher.auto_reconnect = true;
        eventDispatcher.on("tickets", (message) => {
            console.log(message);
            if (
                filter_own_id != null &&
                message.user != filter_own_id &&
                !~message.assignees.indexOf(filter_own_id)
            )
                return;
            if (filter_user_ids.length && !~filter_user_ids.indexOf(message.user)) return;
            if ($assignees.length && !$assignees.filter(message.assignees).length) return;
            switch (message.type) {
                case "new-ticket":
                    new_ticket(message);
                    break;
                case "ticket-status":
                    ticket_status(message);
                    break;
            }
        });
    };

    const userSelect2 = {
        theme: "{{ DMOJ_SELECT2_THEME }}",
        templateResult(data, container) {
            return $("<span>")
                .append(
                    $("<img>", {
                        class: "user-search-image",
                        src: data.gravatar_url,
                        width: 24,
                        height: 24,
                    }) as unknown as JQuery<JQuery.Node>,
                )
                .append(
                    $("<span>", { class: data.display_rank + " user-search-name" }).text(
                        data.text,
                    ) as unknown as JQuery<JQuery.Node>,
                );
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
        },
    };

    $("#filter-user").select2(
        $.extend(true, {}, userSelect2, {
            ajax: { url: "{{ url('ticket_user_select2_ajax') }}" },
        }),
    );
    $("#filter-assignee").select2(
        $.extend(true, {}, userSelect2, {
            ajax: { url: "{{ url('ticket_assignee_select2_ajax') }}" },
        }),
    );
});
