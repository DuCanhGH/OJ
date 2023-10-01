import cookie from "js-cookie";

window.fix_div = (div, height) => {
    var div_offset = div.offset().top - $("html").offset().top;
    let is_moving;
    const moving = () => {
        div.css("position", "absolute").css("top", div_offset);
        is_moving = true;
    };
    const fix = () => {
        div.css("position", "fixed").css("top", height);
        is_moving = false;
    };
    $(window).scrollTop() - div_offset > -height ? fix() : moving();
    $(window).on("scroll", () => {
        if ($(window).scrollTop() - div_offset > -height == is_moving) is_moving ? fix() : moving();
    });
};

window.notification_template = {
    icon: "/logo.png",
};
window.notification_timeout = 5000;

window.notify = (type, title, data, timeout) => {
    if (localStorage[type + "_notification"] != "true") return;
    var template = window[type + "_notification_template"] || window.notification_template;
    var data = typeof data !== "undefined" ? $.extend({}, template, data) : template;
    var object = new Notification(title, data);
    if (typeof timeout === "undefined") timeout = window.notification_timeout;
    if (timeout)
        setTimeout(() => {
            object.close();
        }, timeout);
    return object;
};

window.register_notify = (type, options) => {
    if (typeof options === "undefined") options = {};

    function status_change() {
        if ("change" in options) options.change(localStorage[key] == "true");
    }

    var key = type + "_notification";
    if ("Notification" in window) {
        if (!(key in localStorage) || Notification.permission !== "granted")
            localStorage[key] = "false";

        if ("$checkbox" in options) {
            options.$checkbox
                .change(() => {
                    var status = $(this).is(":checked");
                    if (status) {
                        if (Notification.permission === "granted") {
                            localStorage[key] = "true";
                            window.notify(type, "Notification enabled!");
                            status_change();
                        } else
                            Notification.requestPermission((permission) => {
                                if (permission === "granted") {
                                    localStorage[key] = "true";
                                    window.notify(type, "Notification enabled!");
                                } else localStorage[key] = "false";
                                status_change();
                            });
                    } else {
                        localStorage[key] = "false";
                        status_change();
                    }
                })
                .prop("checked", localStorage[key] == "true");
        }

        $(window).on("storage", (e) => {
            e = e.originalEvent;
            if (e.key === key) {
                if ("$checkbox" in options) options.$checkbox.prop("checked", e.newValue == "true");
                status_change();
            }
        });
    } else {
        if ("$checkbox" in options) options.$checkbox.hide();
        localStorage[key] = "false";
    }
    status_change();
};

function register_time(elems, limit) {
    limit = 60;
    elems.each(() => {
        let outdated = false;
        const $this = $(this);
        const time = moment($this.attr("data-iso"));
        const rel_format = $this.attr("data-format") ?? "{time}";

        function update() {
            if ($("body").hasClass("window-hidden")) {
                outdated = true;
                return;
            }
            outdated = false;
            if (moment().diff(time, "seconds") < limit) {
                $this.text(rel_format.replace("{time}", time.fromNow()));
            } else {
                $this.text(rel_format.replace("{time}", time.format("h:mm:ss a, DD/MM/YYYY")));
            }
            setTimeout(update, 10000);
        }

        $(window).on("dmoj:window-visible", () => {
            if (outdated) update();
        });

        update();
    });
}

// http://stackoverflow.com/a/1060034/1090657
$(() => {
    document.addEventListener("visibilitychange", ({ type }) => onchange({ type }));

    /**
     * @param {{ type: string }} evt
     */
    function onchange(evt) {
        const v = "window-visible",
            h = "window-hidden",
            evtMap = {
                focus: v,
                focusin: v,
                pageshow: v,
                blur: h,
                focusout: h,
                pagehide: h,
            };

        evt = evt || window.event;
        if (evt.type in evtMap) {
            document.body.className = evtMap[evt.type];
        } else {
            document.body.className = document.hidden ? "window-hidden" : "window-visible";
        }

        if ("$" in window) {
            $(window).trigger("dmoj:" + document.body.className);
        }
    }

    // set the initial state (but only if browser supports the Page Visibility API)
    if (document.hidden !== undefined) {
        onchange({ type: document.hidden ? "blur" : "focus" });
    }
});

/**
 * @template T
 * @param {JQuery<T>} link
 */
function register_toggle(link) {
    link.on("click", () => {
        const toggled = link.next(".toggled");
        if (toggled.is(":visible")) {
            toggled.hide(400);
            link.removeClass("open");
            link.addClass("closed");
        } else {
            toggled.show(400);
            link.addClass("open");
            link.removeClass("closed");
        }
    });
}

$(function register_all_toggles() {
    $(".toggle").each(() => {
        register_toggle($(this));
    });
});

$(() => {
    register_time($(".time-with-rel"));

    $("form").on("submit", () => {
        // Prevent multiple submissions of forms, see #565
        $("button[type=submit], input[type=submit]").prop("disabled", true);
    });
});

$(() => {
    // Close dismissable boxes
    $("a.close").on("click", (e) => {
        const $closer = $(e.currentTarget);
        $closer.parent().fadeOut(200);
    });
});

$(() => {
    // Reveal spoiler
    $(document).on("click", "blockquote.spoiler", (e) => {
        $(e.currentTarget).addClass("is-visible");
        e.stopPropagation();
    });
});

$(() => {
    $(window).on("resize", () => {
        const width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        $("#viewport").attr("content", width > 480 ? "initial-scale=1" : "width=480");
    });

    var $nav_list = $("#nav-list");
    $("#navicon")
        .on("click", (event) => {
            event.stopPropagation();
            $nav_list.toggleClass("show-list");
            if ($nav_list.is(":hidden"))
                $(event.currentTarget).trigger("blur").removeClass("hover");
            else {
                $(event.currentTarget).addClass("hover");
            }
        })
        .on("mouseenter", (e) => {
            $(e.currentTarget).addClass("hover");
        })
        .on("mouseleave", (e) => {
            $(e.currentTarget).removeClass("hover");
        });

    $nav_list.find("li a .nav-expand").on("click", (event) => {
        event.preventDefault();
        $(event.currentTarget).parent().siblings("ul").toggleClass("show-list");
    });

    $nav_list.find("li a").each((_, el) => {
        if (!$(el).siblings("ul").length) return;
        $(el)
            .on("contextmenu", (event) => {
                event.preventDefault();
            })
            .on("taphold", () => {
                $(el).siblings("ul").css("display", "block");
            });
    });

    $nav_list.on("click", (event) => {
        event.stopPropagation();
    });

    $("html").on("click", () => {
        $nav_list.removeClass("show-list");
    });

    $.ajaxSetup({
        beforeSend(xhr, settings) {
            if (settings.type && !/^(GET|HEAD|OPTIONS|TRACE)$/.test(settings.type) && !settings.crossDomain) {
                const csrfToken = cookie.get("csrftoken");
                if (csrfToken !== undefined) {
                    xhr.setRequestHeader("X-CSRFToken", csrfToken);
                }
            }
        },
    });
});
