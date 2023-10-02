interface SubmissionMetadata {
    min_year: number | null;
}

const languageCode = document.currentScript?.dataset.languageCode ?? "en-US";

let activeTooltip: JQuery<HTMLElement> | null = null;

function displayTooltip(where: JQuery<HTMLElement> | null) {
    if (activeTooltip !== null) {
        activeTooltip
            .removeClass(["tooltipped", "tooltipped-e", "tooltipped-w"])
            .removeAttr("aria-label");
    }
    if (where !== null) {
        const dayNum = parseInt(where.attr("data-day") ?? "0");
        const tooltip_direction = dayNum < 183 ? "tooltipped-e" : "tooltipped-w";
        const whereSubmissionActivity = where.attr("data-submission-activity");
        if (whereSubmissionActivity !== undefined) {
            where
                .addClass(["tooltipped", tooltip_direction])
                .attr("aria-label", whereSubmissionActivity);
        }
    }
    activeTooltip = where;
}

function installTooltips() {
    displayTooltip(null);
    $(".activity-label").each((_, el) => {
        const link = $(el);
        link.on("mouseover", () => {
            displayTooltip(link);
        }).on("mouseleave", () => {
            displayTooltip(null);
        });
    });
}

function initSubmissionTable(
    submissionActivity: Record<string, number>,
    metadata: SubmissionMetadata,
    languageCode: string,
) {
    const activityLevels = 5; // 5 levels of activity
    const currentYear = new Date().getFullYear();
    const $div = $("#submission-activity");

    function drawContribution(year: number) {
        $div.find("#submission-activity-table td").remove();
        $div.find("#year").attr("data-year", year);
        $div.find("#prev-year-action").css(
            "display",
            year > (metadata.min_year || currentYear) ? "" : "none",
        );
        $div.find("#next-year-action").css("display", year < currentYear ? "" : "none");

        let startDay = new Date(year, 0, 1);
        let endDay = new Date(year + 1, 0, 0);
        if (year == currentYear) {
            endDay = new Date();
            startDay = new Date(endDay.getFullYear() - 1, endDay.getMonth(), endDay.getDate() + 1);
            $div.find("#year").text(gettext("past year"));
        } else {
            $div.find("#year").text(year);
        }
        const days = [];
        for (
            let day = startDay, dayNum = 1;
            day <= endDay;
            day.setDate(day.getDate() + 1), dayNum++
        ) {
            const isodate = day.toISOString().split("T")[0];
            days.push({
                date: new Date(day),
                weekday: day.getDay(),
                day_num: dayNum,
                activity: submissionActivity[isodate] || 0,
            });
        }

        const sumActivity = days.reduce((sum, obj) => {
            return sum + obj.activity;
        }, 0);
        $div.find("#submission-total-count").text(
            ngettext("%(cnt)d total submission", "%(cnt)d total submissions", sumActivity).replace(
                "%(cnt)d",
                "" + sumActivity,
            ),
        );
        if (year == currentYear) {
            $("#submission-activity-header").text(
                ngettext(
                    "%(cnt)d submission in the last year",
                    "%(cnt)d submissions in the last year",
                    sumActivity,
                ).replace("%(cnt)d", "" + sumActivity),
            );
        } else {
            $("#submission-activity-header").text(
                ngettext(
                    "%(cnt)d submission in %(year)d",
                    "%(cnt)d submissions in %(year)d",
                    sumActivity,
                )
                    .replace("%(cnt)d", "" + sumActivity)
                    .replace("%(year)d", "" + year),
            );
        }

        for (let currentWeekday = 0; currentWeekday < days[0].weekday; currentWeekday++) {
            $div.find("#submission-" + currentWeekday).append(
                $("<td>").addClass("activity-blank").append("<div>"),
            );
        }

        const maxActivity = Math.max(
            1,
            Math.max.apply(
                null,
                days.map((obj) => {
                    return obj.activity;
                }),
            ),
        );
        days.forEach((obj) => {
            const level = Math.ceil((obj.activity / maxActivity) * (activityLevels - 1));
            const text = ngettext(
                "%(cnt)d submission on %(date)s",
                "%(cnt)d submissions on %(date)s",
                obj.activity,
            )
                .replace("%(cnt)d", "" + obj.activity)
                .replace(
                    "%(date)s",
                    obj.date.toLocaleDateString(languageCode, {
                        month: "short",
                        year: "numeric",
                        day: "numeric",
                    }),
                );

            $div.find("#submission-" + obj.weekday).append(
                $("<td>")
                    .addClass(["activity-label", "activity-" + level])
                    .attr("data-submission-activity", text)
                    .attr("data-day", obj.day_num)
                    .append("<div>"),
            );
        });

        installTooltips();
    }

    $("#prev-year-action").on("click", () => {
        const attrYear = $div.find("#year").attr("data-year");
        if (attrYear !== undefined) {
            drawContribution(parseInt(attrYear) - 1);
        }
    });
    $("#next-year-action").on("click", () => {
        const attrYear = $div.find("#year").attr("data-year");
        if (attrYear !== undefined) {
            drawContribution(parseInt(attrYear) + 1);
        }
    });

    drawContribution(currentYear);
    $("#submission-activity").css("display", "");
}

$(() => {
    initSubmissionTable(
        JSON.parse($("#submission-data").text()),
        JSON.parse($("#submission-metadata").text()),
        languageCode,
    );
});
