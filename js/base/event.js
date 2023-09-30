import { WSEventDispatcher } from "$js/event.js";

const daemonLocation = document.currentScript?.dataset.daemonLocation ?? "";
const daemonPollLocation = document.currentScript?.dataset.daemonPollLocation ?? "";
const lastMessage = document.currentScript?.dataset.lastMessage ?? "null";

window.eventDispatcher = new WSEventDispatcher(
    daemonLocation,
    daemonPollLocation,
    JSON.parse(lastMessage),
);