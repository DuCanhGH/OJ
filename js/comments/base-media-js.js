import "$prebundled/featherlight/featherlight.min.js";

const upvoteCommentUrl = document.currentScript?.dataset.upvoteCommentUrl;
const downvoteCommentUrl = document.currentScript?.dataset.downvoteCommentUrl;
const hideCommentUrl = document.currentScript?.dataset.hideCommentUrl;

$(document).on("ready", () => {
    window.replyComment = (parent) => {
        const $commentReply = $("#comment-" + parent + "-reply");
        const replyId = "reply-" + parent;
        const newId = "id" + parent + "_body";
        if ($commentReply.find("#" + replyId).length === 0) {
            const $replyForm = $("#new-comment").clone(true).prop("id", replyId);
            $replyForm.find("h3").html(gettext("Replying to comment"));
            $replyForm.prepend('<a class="close">x</a>');
            $replyForm.find("form.comment-submit-form input#id_parent").val(parent);
            $replyForm.find("div#id_body-wmd-wrapper").prop("id", newId + "-wmd-wrapper");
            $replyForm
                .find("div#id_body_wmd_button_bar")
                .empty()
                .prop("id", newId + "_wmd_button_bar");
            $replyForm.find("textarea.wmd-input").val("").prop("id", newId);
            $replyForm
                .find("div#id_body-preview")
                .attr("data-textarea-id", newId)
                .prop("id", newId + "-preview");
            $replyForm.appendTo($commentReply);
            window.registerDmmdPreview($replyForm.find("div#" + newId + "-preview"));
            if ("DjangoPagedown" in window) {
                window.DjangoPagedown.createEditor($replyForm.find("textarea.wmd-input").get(0));
            }
        }
        $commentReply.fadeIn();

        const $commentReplyOffset = $commentReply.offset();
        const $navigationHeight = $("#navigation").height();

        if (!$commentReplyOffset || !$navigationHeight) return;

        $("html, body").animate(
            {
                scrollTop: $commentReplyOffset.top - $navigationHeight - 4,
            },
            500,
        );
    };

    $(document).on("click", ".close", (e) => {
        $(e.currentTarget).closest(".reply-comment").fadeOut();
    });

    /**
     * @param {JQuery<HTMLElement>} $comment
     */
    function updateMath($comment) {
        if ("MathJax" in window) {
            const $body = $comment.find(".comment-body");
            MathJax.typesetPromise([$body[0]]).then(() => {
                $body.find(".tex-image").hide();
                $body.find(".tex-text").show();
            });
        }
    }

    window.showRevision = (commentId, offset) => {
        const $comment = $("#comment-" + commentId);

        // If .comment-body is hidden, then this is a bad comment that the user has not clicked
        // Thus the revision retrieval should do nothing
        if (!$comment.find(".comment-body").is(":visible")) return;

        const currentRevisionAttr = $comment.attr("data-revision");
        const maxRevisionAttr = $comment.attr("data-max-revision");
        const revisionAjaxAttr = $comment.attr("data-revision-ajax");

        if (!currentRevisionAttr || !maxRevisionAttr || !revisionAjaxAttr) return;

        const currentRevision = parseInt(currentRevisionAttr);
        const maxRevision = parseInt(maxRevisionAttr);
        const showRevision = currentRevision + offset;

        // Do nothing if desired revision is out of buonds
        if (showRevision < 0 || showRevision > maxRevision) return;

        $comment.attr("data-revision", showRevision);

        $.get(revisionAjaxAttr, {
            revision: showRevision,
        }).done((body) => {
            $comment
                .find(".previous-revision")
                .css({ visibility: showRevision == 0 ? "hidden" : "" });
            $comment
                .find(".next-revision")
                .css({ visibility: showRevision == maxRevision ? "hidden" : "" });
            const $content = $comment.find(".content").html(body);

            let editText = gettext("edit {edits}").replace("{edits}", "" + showRevision);

            if (showRevision == 0) {
                editText = gettext("original");
            } else if (showRevision == maxRevision && maxRevision == 1) {
                editText = gettext("edited");
            }

            $comment.find(".comment-edit-text").text(" " + editText + " ");
            updateMath($content);
            window.addCodeCopyButtons?.($content);
        });
    };

    /**
     *
     * @param {string} url
     * @param {string} id
     * @param {number} delta
     * @param {(() => void) | undefined} onSuccess
     * @returns
     */
    function ajaxVote(url, id, delta, onSuccess) {
        return $.ajax({
            url,
            type: "POST",
            data: {
                id,
            },
            success() {
                const score = $("#comment-" + id + " .comment-score").first();
                score.text(parseInt(score.text()) + delta);
                onSuccess?.();
            },
            error(data) {
                alert(gettext("Could not vote: {error}").replace("{error}", data.responseText));
            },
        });
    }

    /**
     * @param {string} id
     * @returns
     */
    const getVotes = (id) => {
        const $comment = $("#comment-" + id);
        return {
            upvote: $comment.find(".upvote-link").first(),
            downvote: $comment.find(".downvote-link").first(),
        };
    };

    window.commentUpvote = (id) => {
        if (!upvoteCommentUrl) return;

        ajaxVote(upvoteCommentUrl, id, 1, () => {
            const $votes = getVotes(id);
            if ($votes.downvote.hasClass("voted")) $votes.downvote.removeClass("voted");
            else $votes.upvote.addClass("voted");
        });
    };

    window.commentDownvote = (id) => {
        if (!downvoteCommentUrl) return;

        ajaxVote(downvoteCommentUrl, id, -1, () => {
            const $votes = getVotes(id);
            if ($votes.upvote.hasClass("voted")) $votes.upvote.removeClass("voted");
            else $votes.downvote.addClass("voted");
        });
    };

    const $comments = $(".comments");
    $comments.find("a.hide-comment").on("click", (e) => {
        e.preventDefault();

        if (!hideCommentUrl) {
            alert("Hiding comments is not supported.");
            return;
        }

        if (!(e.ctrlKey || e.metaKey || confirm(gettext("Are you sure you want to hide this comment?"))))
            return;

        const id = $(e.currentTarget).attr("data-id");
        $.post(hideCommentUrl, { id })
            .then(() => {
                $("#comment-" + id).remove();
                $("#comment-" + id + "-children").remove();
            })
            .catch(() => {
                alert(gettext("Could not hide comment."));
            });
    });

    $comments.find("a.edit-link").featherlight({
        afterOpen() {
            if ("DjangoPagedown" in window) {
                const $wmd = $(".featherlight .wmd-input");
                if ($wmd.length) {
                    window.DjangoPagedown.createEditor($wmd.get(0));
                    if ("MathJax" in window) {
                        const preview = $(".featherlight div.wmd-preview")[0];
                        const wmdId = $wmd.attr("id");
                        if (wmdId) {
                            window.editors[wmdId].hooks.chain("onPreviewRefresh", () => {
                                MathJax.typesetPromise([preview]);
                            });
                        }
                        MathJax.typesetPromise([preview]);
                    }
                }
            }
            $("#comment-edit").on("submit", (event) => {
                event.preventDefault();
                const id = $("#comment-edit").find(".comment-id").text();
                const readback = $("#comment-edit").find(".read-back").text();
                const actionUrl = $(event.currentTarget).attr("action");
                if (!actionUrl) return;
                $.post(actionUrl, $(event.currentTarget).serialize())
                    .done(() => {
                        $.featherlight.current().close();
                        $.ajax({
                            url: readback,
                        })
                            .done((data) => {
                                const $comment = $("#comment-" + id);
                                const $area = $comment.find(".comment-body").first();
                                $area.html(data);
                                updateMath($comment);
                                window.addCodeCopyButtons?.($area);
                                const $edits = $comment.find(".comment-edits").first();
                                $edits.text(gettext("updated"));
                            })
                            .fail(() => {
                                alert(gettext("Failed to update comment body."));
                            });
                    })
                    .fail((data) => {
                        alert(
                            gettext("Could not edit comment: {error}").replace(
                                "{error}",
                                data.responseText,
                            ),
                        );
                    });
            });
        },
        beforeClose() {
            if ("DjangoPagedown" in window) {
                const $wmd = $(".featherlight .wmd-input");
                if ($wmd.length) {
                    window.DjangoPagedown.destroyEditor($wmd.get(0));
                }
            }
        },
        variant: "featherlight-edit",
    });

    $("votes-link").find("a[data-featherlight]").featherlight();

    const $root = $("html, body");
    $comments.find("a.comment-link").on("click", (e) => {
        const href = $(e.currentTarget).attr("href");
        if (!href) return;
        $root.animate(
            {
                scrollTop: $(href).offset()?.top ?? 0,
            },
            500,
            () => {
                window.location.hash = href;
            },
        );
        return false;
    });

    $("img.unveil").unveil(200);

    window.commentShowContent = (commentId) => {
        const $comment = $("#comment-" + commentId);
        $comment.find(".comment-body").show();
        $comment.find(".bad-comment-body").hide();
    };

    const codeRegex = [/#include\s*<.+>/, /using\s+namespace/, /int\s+main/, /print\s*\(.+\)/];
    $(document).on("click", "form.comment-submit-form .button[type=submit]", async (e) => {
        const form = $(e.currentTarget).parents("form");
        const text = form.find("#id_body").val();
        if (text && codeRegex.some((regex) => regex.test(String(text)))) {
            if (
                !confirm(
                    gettext(
                        "Looks like you're trying to post a source code!\n\nThe comment section are not for posting source code.\nIf you want to submit your solution, please use the 'Submit solution' button.\n\nAre you sure you want to post this?",
                    ),
                )
            ) {
                e.preventDefault();
            }
        }
    });
});
