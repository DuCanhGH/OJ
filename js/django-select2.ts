import type { Options, DataFormat, GroupedDataFormat } from "./$declarations/select2.js";

declare global {
    interface JQuery {
        djangoSelect2(
            options: Options<
                DataFormat | GroupedDataFormat,
                {
                    results: (DataFormat | GroupedDataFormat)[];
                    more: boolean;
                }
            >,
        ): void;
    }
}

$.fn.djangoSelect2 = (options) => {
    const settings = $.extend({}, options);
    $.each(this, (_, element) => {
        const $element = $(element);
        if ($element.hasClass("django-select2-heavy")) {
            $element.select2({
                ajax: {
                    data(params) {
                        return {
                            term: params.term,
                            page: params.page,
                            field_id: $element.data("field_id"),
                        };
                    },
                    processResults(data) {
                        return {
                            results: data.results,
                            pagination: {
                                more: data.more,
                            },
                        };
                    },
                },
                ...settings,
            });
        } else {
            $element.select2(settings);
        }
    });
    return this;
};

$(() => {
    $(".django-select2:not([id*=__prefix__])").djangoSelect2({
        dropdownAutoWidth: true,
    });
});

if ("django" in window && "jQuery" in window.django)
    django.jQuery(document).on("formset:added", function (_, $row: JQuery<HTMLElement>) {
        $row.find(".django-select2").each((_, el) => {
            // Notice how we are passing it into a different jQuery.
            $(el).djangoSelect2({
                dropdownAutoWidth: true,
            });
        });
    });
