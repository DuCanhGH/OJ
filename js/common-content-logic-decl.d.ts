declare global {
    interface Window {
        /**
         * This method is only available when you include `common-content-logic.js`.
         */
        addCodeCopyButtons: (<T = HTMLElement>($content: JQuery<T>) => void) | undefined;
    }
}

export {};
