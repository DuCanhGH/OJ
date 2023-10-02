import { decodeJSONBytes, urlSafeBase64Encode, isCredentialPublicKey } from "$js/user/webauthn-helpers.js";

const webauthnAssert = document.currentScript?.dataset.webauthnAssert;

$(() => {
    function buf2hex(buffer: ArrayBuffer) {
        return Array.prototype.map
            .call(new Uint8Array(buffer), (x) => ("00" + x.toString(16)).slice(-2))
            .join("");
    }

    $("#use-webauthn").on("click", (event) => {
        event.preventDefault();

        if (webauthnAssert === undefined) return;

        $.getJSON(webauthnAssert)
            .done((publicKey) => {
                decodeJSONBytes(publicKey);
                navigator.credentials.get({ publicKey }).then((credential) => {
                    if (credential === null || !isCredentialPublicKey(credential)) return;

                    // This is the result of `navigator.credentials.get()`, so we can safely cast it.
                    const response = credential.response as AuthenticatorAssertionResponse;

                    $("#id_webauthn_response").val(
                        JSON.stringify({
                            id: credential.id,
                            response: {
                                authData: urlSafeBase64Encode(response.authenticatorData),
                                clientData: urlSafeBase64Encode(response.clientDataJSON),
                                signature: buf2hex(response.signature),
                            },
                        }),
                    );

                    $("#2fa-form").trigger("submit");
                });
            })
            .fail(() => alert(gettext("Failed to contact server.")));
    });
});
