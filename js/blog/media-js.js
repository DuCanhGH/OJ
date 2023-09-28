import "$prebundled/featherlight/featherlight.min.js";

const upvoteUrl = document.currentScript?.dataset.upvoteUrl;
const downvoteUrl = document.currentScript?.dataset.downvoteUrl;

$(document).on("ready", () => {
    /**
     * @param {string | undefined} url 
     * @param {string} id 
     * @param {number} delta 
     * @param {() => void} onSuccess 
     * @returns 
     */
    function ajaxVote(url, id, delta, onSuccess) {
        if (!url) {
            return undefined;
        }
        return $.ajax({
            url,
            type: "POST",
            data: {
                id,
            },
            success() {
                var score = $("#post-" + id + " #post-score").first();
                score.text(parseInt(score.text()) + delta);
                onSuccess?.();
            },
            error(data) {
                alert("Could not vote: " + data.responseText);
            },
        });
    }

    /**
     * @param {string} id 
     * @returns 
     */
    function getVotes(id) {
        const $post = $("#post-" + id);
        return {
            upvote: $post.find(".upvote-link").first(),
            downvote: $post.find(".downvote-link").first(),
        };
    }

    window.blogUpvote = (id) => {
        ajaxVote(upvoteUrl, id, 1, () => {
            const $votes = getVotes(id);
            if ($votes.downvote.hasClass("voted")) $votes.downvote.removeClass("voted");
            else $votes.upvote.addClass("voted");
        });
    };

    window.blogDownvote = (id) => {
        ajaxVote(downvoteUrl, id, -1, () => {
            const $votes = getVotes(id);
            if ($votes.upvote.hasClass("voted")) $votes.upvote.removeClass("voted");
            else $votes.downvote.addClass("voted");
        });
    };

    $("votes-link").find("a[data-featherlight]").featherlight();
});
