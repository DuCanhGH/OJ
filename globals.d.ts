import type { WSEventDispatcher } from "$resources/event.js";

declare global {
    interface Window {
        eventDispatcher: WSEventDispatcher;
        parsedCookie: Record<string, string>;
        DjangoPagedown: any;
        editors: any;
    }
    declare var npgettext: (name: string, format1: string, format2: string, time: number) => string;
    declare var pgettext: (name: string, format: string) => string;
    declare namespace MathJax {
        export const typesetPromise: (args: HTMLElement[]) => Promise<void>;
    }
}

export {};
