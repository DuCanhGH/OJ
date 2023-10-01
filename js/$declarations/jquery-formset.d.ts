declare module "$vnoj/jquery.formset.js" {
    declare global {
        interface JQueryFormsetOptions {
            /**
             * The form prefix for your django formset
             */
            prefix?: string;
            /**
             * The jQuery selection cloned to generate new form instances
             */
            formTemplate?: any;
            /**
             * Text for the add link
             */
            addText?: string;
            /**
             * Text for the delete link
             */
            deleteText?: string;
            /**
             * Container CSS class for the add link
             */
            addContainerClass?: string;
            /**
             * Container CSS class for the delete link
             */
            deleteContainerClass?: string;
            /**
             * CSS class applied to the add link
             */
            addCssClass?: string;
            /**
             * CSS class applied to the delete link
             */
            deleteCssClass?: string;
            /**
             * CSS class applied to each form in a formset
             */
            formCssClass?: string;
            /**
             * Additional CSS classes, which will be applied to each form in turn
             */
            extraClasses?: string[];
            /**
             * jQuery selector for fields whose values should be kept when the form is cloned
             */
            keepFieldValues?: string;
            /**
             * Function called each time a new form is added
             */
            added?(row: JQuery<HTMLElement>): void;
            /**
             * Function called each time a form is deleted
             */
            removed?(row: JQuery<HTMLElement>): void;
            /**
             * When set to true, hide last empty add form (becomes visible when clicking on add button)
             */
            hideLastAddForm?: boolean;
        }
        interface JQuery {
            formset(arg: JQueryFormsetOptions): JQuery<HTMLElement>;
        }
    }
}
