const tab = document.currentScript?.dataset.tab;

$(() => {
    (function installTooltips() {
        $("td.user-name")
            .find("> span:first-child")
            .each((_, el) => {
                const link = $(el);
                link.on("mouseenter", () => {
                    const start_time = link.siblings(".start-time").text().trim();
                    link.addClass("tooltipped tooltipped-e").attr("aria-label", start_time);
                }).on("mouseleave", () => {
                    link.removeClass("tooltipped tooltipped-e").removeAttr("aria-label");
                });
            });
    })();

    // Auto reload every 10 seconds
    let rankingOutdated = false;
    function updateRanking() {
        if ($("body").hasClass("window-hidden")) {
            rankingOutdated = true;
            return;
        }
        const queryParam = window.location.search;
        $.ajax({
            url: queryParam ? queryParam + "&raw" : "?raw",
        })
            .done((data) => {
                $("#ranking-table").html(data);
                if (localStorage.getItem("show-personal-info") == "true") {
                    $(".personal-info").show();
                    $("#show-personal-info-checkbox").prop("checked", true);
                }
                if (tab === "ranking") {
                    window.applyRankingFilter();
                }
                window.enableAdminOperations();
            })
            .always(() => {
                rankingOutdated = false;
                setTimeout(updateRanking, 10000);
            });
    }
    $(window).on("dmoj:window-visible", () => {
        if (rankingOutdated) {
            updateRanking();
        }
    });
    setTimeout(updateRanking, 10000);
});
