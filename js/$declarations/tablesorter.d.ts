declare module "$prebundled/tablesorter.js" {
    declare global {
        interface JQuery {
            tablesorter(config?: any): void;
        }
    }
}
