const init = ($element, options) => {
    $element.select2(options);
};

const initHeavy = ($element, options) => {
    const settings = $.extend(
        {
            ajax: {
                data(params) {
                    return {
                        term: params.term,
                        page: params.page,
                        field_id: $element.data("field_id"),
                    };
                },
                processResults(data, page) {
                    return {
                        results: data.results,
                        pagination: {
                            more: data.more,
                        },
                    };
                },
            },
        },
        options,
    );

    $element.select2(settings);
};

$.fn.djangoSelect2 = function (options) {
    const settings = $.extend({}, options);
    $.each(this, (_, element) => {
        const $element = $(element);
        if ($element.hasClass("django-select2-heavy")) {
            initHeavy($element, settings);
        } else {
            init($element, settings);
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
    django.jQuery(document).on("formset:added", function (event, $row) {
        $row.find(".django-select2").each(function () {
            // Notice how we are passing it into a different jQuery.
            $(this).djangoSelect2({
                dropdownAutoWidth: true,
            });
        });
    });
