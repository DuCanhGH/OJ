declare global {
    interface Window {
        /**
         * This method is only available when you include `dmmd-preview.js`.
         * @param $preview 
         */
        registerDmmdPreview($preview: JQuery<HTMLElement>): void;
    }
}

export {};