declare global {
    interface Window {
        /**
         * This method is only available when you include `comments/base-media-js.js`.
         *
         * Reply a comment.
         * @param parent
         */
        replyComment: ((parent: string) => void) | undefined;
        /**
         * This method is only available when you include `comments/base-media-js.js`.
         * @param parent
         */
        showRevision: ((commentId: string, offset: number) => void) | undefined;
        /**
         * This method is only available when you include `comments/base-media-js.js`.
         * 
         * Show the content of a comment.
         * @param commentId
         */
        commentShowContent: ((commentId: string) => void) | undefined;
        /**
         * This method is only available when you include `comments/base-media-js.js`.
         * 
         * Upvote a comment.
         * @param id 
         */
        commentUpvote: ((id: string) => void) | undefined;
        /**
         * This method is only available when you include `comments/base-media-js.js`.
         * 
         * Downvote a comment.
         * @param id 
         */
        commentDownvote: ((id: string) => void) | undefined;
    }
}

export {};
