import { getI18n } from "$js/utils.js";

const i18n = getI18n(document.currentScript?.dataset, {
    confirmLeave: "i18nConfirmLeave",
    confirmLeaveNoReturn: "i18nConfirmLeaveNoReturn",
    confirmJoin: "i18nConfirmJoin",
    confirmJoinStartTimer: "i18nConfirmJoinStartTimer",
    confirmJoinLeaveContest: "i18nConfirmJoinLeaveContest",
    confirmRegister: "i18nConfirmRegister",
});

$(() => {
    const officialContestMode = document.currentScript?.dataset.officialContestMode === "true";
    const inContest = document.currentScript?.dataset.inContest === "true";

    $(".leaving-forever").on("click", () => {
        return confirm(`${i18n.confirmLeave}\n${i18n.confirmLeaveNoReturn}`);
    });

    if (!officialContestMode) {
        $(".first-join").on("click", () => {
            return confirm(`${i18n.confirmJoin}\n${i18n.confirmJoinStartTimer}`);
        });
    }

    if (inContest) {
        $(".contest-join").on("click", () => {
            return confirm(`${i18n.confirmJoin}\n${i18n.confirmJoinLeaveContest}`);
        });
    }

    $(".register-warning").on("click", () => {
        return confirm(i18n.confirmRegister);
    });
});
