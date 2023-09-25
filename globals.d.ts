import type { WSEventDispatcher } from "$resources/event.js";

declare global {
    interface Window {
        event_dispatcher: WSEventDispatcher;
        parsedCookie: Record<string, string>;
    }
}
