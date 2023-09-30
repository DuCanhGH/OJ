import type Moment from "moment";

import type { WSEventDispatcher } from "$resources/event.js";

declare global {
    interface Window {
        eventDispatcher: WSEventDispatcher;
        parsedCookie: Record<string, string>;
        DjangoPagedown: any;
        editors: any;
    }
    declare var gettext: (name: string) => string;
    declare var ngettext: (singular: string, plural: string, count: number) => string;
    declare var pgettext: (context: string, name: string) => string;
    declare var npgettext: (
        context: string,
        singular: string,
        plural: string,
        count: number,
    ) => string;
    declare var interpolate: <T extends boolean>(
        fmt: string,
        obj: T extends true ? Record<string, string> : string[],
        named: T,
    ) => string;
    declare namespace MathJax {
        export const typesetPromise: (args: HTMLElement[]) => Promise<void>;
    }
    declare var moment: Moment;
    declare var django: {
        jQuery: JQueryStatic;
    };
}

export {};
