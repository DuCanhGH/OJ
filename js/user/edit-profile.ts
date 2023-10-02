import "$prebundled/clipboard/clipboard.js";
import "$prebundled/clipboard/tooltip.js";

import { urlSafeBase64Encode, decodeJSONBytes, isCredentialPublicKey } from "./webauthn-helpers.js";

const removeApiToken = document.currentScript?.dataset.removeApiToken;
const webauthnAttest = document.currentScript?.dataset.webauthnAttest;

$(() => {
    $("#ace_user_script").on("ace_load", (_, editor) => {
        editor.getSession().setMode("ace/mode/javascript");
    });

    $("#disable-2fa-button").on("click", () => {
        alert(
            gettext(
                "The administrators for this site require all the staff to have Two-factor Authentication enabled, so it may not be disabled at this time.",
            ),
        );
    });

    $("#generate-api-token-button").on("click", (event) => {
        event.preventDefault();
        if (
            confirm(
                `${gettext(
                    "Are you sure you want to generate or regenerate your API token?",
                )}\n${gettext("This will invalidate any previous API tokens.")} ${gettext(
                    "It also allows access to your account without Two-factor Authentication.",
                )}\n\n${gettext(
                    "You will not be able to view your API token after you leave this page!",
                )}`,
            )
        ) {
            $("#api-token").text(gettext("Generating..."));

            $.ajax({
                type: "POST",
                url: $(event.currentTarget).attr("href"),
                dataType: "json",
                success(data) {
                    $("#api-token").text(data.data.token);
                    $("#generate-api-token-button").text(gettext("Regenerate"));

                    // Add remove button on-the-fly
                    if ($("#remove-api-token-button").length == 0) {
                        $("#generate-api-token-button").after(
                            $(`<a id="remove-api-token-button" \
                            href="${removeApiToken}" \
                            class="button inline-button ml-5">${gettext("Remove")}</a>`),
                        );
                    }
                },
            });
        }
    });

    // Delegated event handler because the remove button may have been added on-the-fly
    $("#api-token-td").on("click", "#remove-api-token-button", (event) => {
        event.preventDefault();
        if (confirm(gettext("Are you sure you want to remove your API token?"))) {
            $.ajax({
                type: "POST",
                url: $(event.currentTarget).attr("href"),
                dataType: "json",
                success() {
                    $("#api-token").text("");
                    $("#generate-api-token-button").text(gettext("Generate"));
                    $("#remove-api-token-button").remove();
                },
            });
        }
    });
});

$(() => {
    $("#new-webauthn").on("click", (event) => {
        event.preventDefault();

        if (webauthnAttest === undefined) return;

        $.getJSON(webauthnAttest)
            .done((publicKey) => {
                decodeJSONBytes(publicKey);
                navigator.credentials.create({ publicKey }).then((credential) => {
                    if (credential === null || !isCredentialPublicKey(credential)) return;

                    // This is the result of `navigator.credentials.create()`, so we can safely cast it.
                    const response = credential.response as AuthenticatorAttestationResponse;

                    $.post(webauthnAttest, {
                        credential: JSON.stringify({
                            id: credential.id,
                            response: {
                                attObj: urlSafeBase64Encode(response.attestationObject),
                                clientData: urlSafeBase64Encode(response.clientDataJSON),
                            },
                        }),
                        name: $("#new-webauthn-name").val(),
                    })
                        .then(() => window.location.reload())
                        .fail((jqXHR) => alert((jqXHR as any).responseText));
                });
            })
            .fail(() => alert(gettext("Failed to contact server.")));
    });

    $(".webauthn-delete").on("click", (event) => {
        event.preventDefault();
        if (confirm(gettext("Are you sure you want to delete this security key?"))) {
            $.post($(event.currentTarget).attr("data-delete-url"))
                .then(() => window.location.reload())
                .fail((jqXHR) => alert((jqXHR as any).responseText));
        }
    });
});

$(() => {
    $("#generate-scratch-codes-button").on("click", (event) => {
        event.preventDefault();
        if (
            confirm(
                `${gettext(
                    "Are you sure you want to generate or regenerate a new set of scratch codes?",
                )}\n${gettext(
                    "This will invalidate any previous scratch codes you have.",
                )}\n\n${gettext(
                    "You will not be able to view your scratch codes after you leave this page!",
                )}`,
            )
        ) {
            $("#scratch-codes").text(gettext("Generating..."));

            $("pre code").each((_, el) => {
                let copyButton: JQuery<HTMLSpanElement>;
                $(el)
                    .parent()
                    .before(
                        $("<div>", { class: "copy-clipboard" }).append(
                            (copyButton = $("<span>", {
                                class: "btn-clipboard",
                                id: "scratch-codes-copy-button",
                                "data-clipboard-text": "",
                                title: gettext("Click to copy"),
                            }).text(gettext("Copy"))),
                        ),
                    );

                const firstCopyButton = copyButton[0];

                $(firstCopyButton).on("mouseleave", (e) => {
                    const target = $(e.currentTarget);
                    target.attr("class", "btn-clipboard");
                    target.removeAttr("aria-label");
                });

                // @ts-expect-error Not our Clipboard
                const curClipboard = new Clipboard(firstCopyButton);

                // @ts-expect-error Not our Clipboard
                curClipboard.on("success", (e) => {
                    e.clearSelection();
                    showTooltip(e.trigger, gettext("Copied!"));
                });

                // @ts-expect-error Not our Clipboard
                curClipboard.on("error", (e) => {
                    showTooltip(e.trigger, fallbackMessage(e.action));
                });
            });

            $.ajax({
                type: "POST",
                url: $(event.currentTarget).attr("href"),
                dataType: "json",
                success: (data) => {
                    $("#scratch-codes").text(data.data.codes.join("\n"));
                    $("#scratch-codes-copy-button").attr(
                        "data-clipboard-text",
                        data.data.codes.join("\n"),
                    );
                    $("#generate-scratch-codes-button").text(gettext("Regenerate"));
                    $("#hidden-word").hide();
                    $("#scratch-codes-regen").show();
                },
            });
        }
    });
});
