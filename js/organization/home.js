import { getI18n } from "$js/utils.js";

const isOrgOpen = document.currentScript?.dataset.isOrgOpen === "true";
const i18n = getI18n(document.currentScript?.dataset, {
    confirmLeave: "i18nConfirmLeave",
    warnRejoinToShowUp: "i18nWarnRejoinToShowUp",
    warnRequestMembershipToJoin: "i18nWarnRequestMembershipToJoin",
});

$(() => {
    $(".leave-organization").on("click", () => {
        return confirm(
            `${i18n.confirmLeave}\n${
                isOrgOpen ? i18n.warnRejoinToShowUp : i18n.warnRequestMembershipToJoin
            }`,
        );
    });
});
