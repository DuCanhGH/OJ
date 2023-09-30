declare global {
    interface JQuery {
        /**
         * Load an image before they appear on the screen.
         * @param distance How far your user should be from the image for it to start to load.
         * @param callback Additional callback that is fired after the unveil is complete.
         * 
         * TODO: Remove this and use `loading="lazy" decoding="async" width="" height=""` instead.
         */
        unveil(distance: number, callback?: () => void): void;
    }
}

export {};
