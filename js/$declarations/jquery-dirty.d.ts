declare global {
    interface JQueryDirtyOptions {
        preventLeaving?: boolean;
        leavingMessage?: string;
        /**
         * This function is fired when the form gets dirty.
         */
        onDirty?(): void;
        /**
         * This function is fired when the form gets clean again.
         */
        onClean?(): void;
        /**
         * Fire onDirty/onClean on each modification of the form.
         */
        fireEventsOnEachChange?: boolean;
    }
    interface JQuery {
        dirty(
            options:
                | JQueryDirtyOptions
                | "isDirty"
                | "isClean"
                | "refreshEvents"
                | "resetForm"
                | "setAsClean"
                | "setAsDirty"
                | "showDirtyFields",
        ): void;
    }
}

export {};
