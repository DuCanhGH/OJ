declare module "$prebundled/timezone-map/timezone-picker.js" {
    declare global {
        interface Window {
            timezone_picker($map: JQuery<HTMLElement>, $field: JQuery<HTMLElement>, jsonData: any): void;
        }
    }
}
