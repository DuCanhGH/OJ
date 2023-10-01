declare global {
    interface Window {
        loadMorePp(): void;
    }
}

const userPpUrl = document.currentScript?.dataset.userPpUrl;

let showPpBase = 1, currentlyRequestingPp = false;

window.loadMorePp = () => {
    if (currentlyRequestingPp || userPpUrl === undefined) return;

    currentlyRequestingPp = true;

    $.get(userPpUrl, {
        start: showPpBase * 10,
        end: (showPpBase + 1) * 10,
    }).done((data) => {
        const results = $(data["results"]);
        $(".pp-table").append(results);
        // @ts-expect-error fix common.js
        register_time(results.find(".time-with-rel"));
        showPpBase++;
        if (!data["has_more"]) {
            $("#pp-load-link-wrapper").hide();
        }
        currentlyRequestingPp = false;
    });
};
