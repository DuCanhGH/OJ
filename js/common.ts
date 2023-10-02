import cookie from "js-cookie";

interface RegisterNotifyOptions {
    change?(_: boolean): void;
    $checkbox?: JQuery<HTMLElement>;
}

declare global {
    interface Window {
        fixDiv($div: JQuery<HTMLDivElement>, height: number): void;
        notify(type: string, title: string, data?: NotificationOptions, timeout?: number): void;
        registerNotify(type: string, options?: RegisterNotifyOptions): void;
        registerTime(elems: JQuery<HTMLElement>): void;
        registerToggle<T>(link: JQuery<T>): void;
    }
}

window.fixDiv = ($div, height) => {
    const divOffset = ($div.offset()?.top ?? 0) - ($("html").offset()?.top ?? 0);
    let isMoving: boolean = false;
    function moving() {
        $div.css("position", "absolute").css("top", divOffset);
        isMoving = true;
    }
    function fix() {
        $div.css("position", "fixed").css("top", height);
        isMoving = false;
    }
    const scrollTop = $(window).scrollTop();
    if (scrollTop !== undefined) {
        scrollTop - divOffset > -height ? fix() : moving();
        $(window).on("scroll", () => {
            if (scrollTop - divOffset > -height == isMoving) {
                isMoving ? fix() : moving();
            }
        });
    }
};

const notificationTemplate = {
    icon: "/logo.png",
};
const notificationTimeout = 5000;

window.notify = (type, title, data, timeout = notificationTimeout) => {
    if (localStorage.getItem(`${type}_notification`) !== "true") return;
    const template =
        (window[(type + "_notification_template") as any] as unknown as NotificationOptions) ||
        notificationTemplate;
    const resolvedData = typeof data !== "undefined" ? $.extend({}, template, data) : template;
    const object = new Notification(title, resolvedData);
    if (timeout) {
        setTimeout(() => {
            object.close();
        }, timeout);
    }
    return object;
};

window.registerNotify = (type, options = {}) => {
    const key = `${type}_notification`;

    function statusChange() {
        options.change?.(localStorage.getItem(key) === "true");
    }

    if ("Notification" in window) {
        if (localStorage.getItem(key) === null || Notification.permission !== "granted") {
            localStorage.setItem(key, "false");
        }

        options.$checkbox
            ?.on("change", (e) => {
                const status = $(e.currentTarget).is(":checked");
                if (status) {
                    if (Notification.permission === "granted") {
                        localStorage[key] = "true";
                        window.notify(type, "Notification enabled!");
                        statusChange();
                    } else
                        Notification.requestPermission((permission) => {
                            if (permission === "granted") {
                                localStorage.setItem(key, "true");
                                window.notify(type, "Notification enabled!");
                            } else {
                                localStorage.setItem(key, "false");
                            }
                            statusChange();
                        });
                } else {
                    localStorage.setItem(key, "false");
                    statusChange();
                }
            })
            .prop("checked", localStorage.getItem(key) === "true");

        $(window).on("storage", (e) => {
            if ((e.originalEvent as any)?.key === key) {
                options.$checkbox?.prop("checked", (e.originalEvent as any)?.newValue == "true");
                statusChange();
            }
        });
    } else {
        options.$checkbox?.hide();
        localStorage.setItem(key, "false");
    }
    statusChange();
};

window.registerTime = ($elems) => {
    const limit = 60;
    $elems.each((_, el) => {
        let outdated = false;
        const $this = $(el);
        const time = moment($this.attr("data-iso"));
        const relFormat = $this.attr("data-format") ?? "{time}";

        function update() {
            if ($("body").hasClass("window-hidden")) {
                outdated = true;
                return;
            }
            outdated = false;
            if (moment().diff(time, "seconds") < limit) {
                $this.text(relFormat.replace("{time}", time.fromNow()));
            } else {
                $this.text(relFormat.replace("{time}", time.format("h:mm:ss a, DD/MM/YYYY")));
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

    function onchange(evt: {
        type: string;
    }) {
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

        if (evt.type in evtMap) {
            document.body.className = evtMap[evt.type as keyof typeof evtMap];
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

window.registerToggle = ($link) => {
    $link.on("click", () => {
        const toggled = $link.next(".toggled");
        if (toggled.is(":visible")) {
            toggled.hide(400);
            $link.removeClass("open");
            $link.addClass("closed");
        } else {
            toggled.show(400);
            $link.addClass("open");
            $link.removeClass("closed");
        }
    });
}

$(function registerAllToggles() {
    $(".toggle").each(() => {
        window.registerToggle($(this));
    });
});

$(() => {
    window.registerTime($(".time-with-rel"));

    $("form").on("submit", () => {
        // Prevent multiple submissions of forms, see #565
        $("button[type=submit], input[type=submit]").prop("disabled", "");
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

    const $navList = $("#nav-list");
    $("#navicon")
        .on("click", (event) => {
            event.stopPropagation();
            $navList.toggleClass("show-list");
            if ($navList.is(":hidden")) {
                $(event.currentTarget).trigger("blur").removeClass("hover");
            }
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

    $navList.find("li a .nav-expand").on("click", (event) => {
        event.preventDefault();
        $(event.currentTarget).parent().siblings("ul").toggleClass("show-list");
    });

    $navList.find("li a").each((_, el) => {
        if (!$(el).siblings("ul").length) return;
        $(el)
            .on("contextmenu", (event) => {
                event.preventDefault();
            })
            .on("taphold", () => {
                $(el).siblings("ul").css("display", "block");
            });
    });

    $navList.on("click", (event) => {
        event.stopPropagation();
    });

    $("html").on("click", () => {
        $navList.removeClass("show-list");
    });

    $.ajaxSetup({
        beforeSend(xhr, settings) {
            if (
                settings.type &&
                !/^(GET|HEAD|OPTIONS|TRACE)$/.test(settings.type) &&
                !settings.crossDomain
            ) {
                const csrfToken = cookie.get("csrftoken");
                if (csrfToken !== undefined) {
                    xhr.setRequestHeader("X-CSRFToken", csrfToken);
                }
            }
        },
    });
});
