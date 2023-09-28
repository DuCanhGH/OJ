declare module "$prebundled/clipboard/tooltip.js" {
    declare global {
        var showTooltip: (trigger: any, message: string) => void;
        var fallbackMessage: (action: any) => string;
    }
}