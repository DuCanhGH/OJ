declare global {
    interface Window {
        /**
         * This method is only available when you include `blog/media-js.js`.
         * 
         * Upvote a blog.
         * @param id 
         */
        blogUpvote(id: string): void;
        /**
         * This method is only available when you include `blog/media-js.js`.
         * 
         * Downvote a blog.
         * @param id 
         */
        blogDownvote(id: string): void;
    }
}

export {};