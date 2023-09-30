import cookie from "js-cookie";
import noUiSlider from "nouislider";

const pointStart = Number(document.currentScript?.dataset.pointStart);
const pointEnd = Number(document.currentScript?.dataset.pointEnd);
const pointValues = JSON.parse(document.currentScript?.dataset.pointValues ?? "null");
const select2Theme = document.currentScript?.dataset.select2Theme;

$(() => {
    const $form = $("form#filter-form");
    const $search = $("#search");
    const $category = $("#category");

    function prepForm() {
        // disable point range when searching
        $("#point-start").prop("disabled", !!$search.val());
        $("#point-end").prop("disabled", !!$search.val());
        $search.prop("disabled", !$search.val());
        $category.prop("disabled", !$category.val());
    }

    function cleanSubmit() {
        prepForm();
        $form.trigger("submit");
    }

    $category
        .select2({
            theme: select2Theme,
        })
        .css({ visibility: "visible" })
        .on("change", cleanSubmit);
    (
        $("#types").select2({
            theme: select2Theme,
            multiple: 1,
            placeholder: gettext("Filter by type..."),
        } as any) as any
    ).css({ visibility: "visible" });

    // This is incredibly nasty to do but it's needed because otherwise the select2 steals the focus
    $search.on("keypress", (e) => {
        if (e.code == "Enter") $("#go").trigger("click");
    });

    $("#random").on("click", (e) => {
        const action = $form.attr("action");
        $form
            .attr("action", "{{ url('problem_random') }}")
            .attr("target", "_blank")
            .trigger("submit");
        if (action) {
            $form.attr("action", action).attr("target", "");
        }
        e.preventDefault();
    });

    $("#go").on("click", cleanSubmit);

    $("input#full_text, input#hide_solved, input#show_types, input#has_public_editorial").click(
        () => {
            prepForm();
            const csrfToken = cookie.get("csrftoken");
            if (csrfToken) {
                $("<form>")
                    .attr("action", window.location.pathname + "?" + $form.serialize())
                    .append(
                        $("<input>")
                            .attr("type", "hidden")
                            .attr("name", "csrfmiddlewaretoken")
                            .attr("value", csrfToken),
                    )
                    .attr("method", "POST")
                    .appendTo($("body"))
                    .trigger("submit");
            }
        },
    );

    const intFormatter = {
        to(value: number) {
            return value;
        },
        from(value: string) {
            return +value;
        },
    };

    const $slider = $("#point-slider");

    if ($slider.length) {
        const $start = $("#point-start");
        const $end = $("#point-end");

        noUiSlider
            .create($slider[0], {
                start: [pointStart, pointEnd],
                connect: true,
                snap: true,
                tooltips: [intFormatter, intFormatter],
                range: pointValues,
            })
            .on("change", (values) => {
                var start = +values[0],
                    end = +values[1];
                $start.prop("disabled", start === pointValues.min).val(start);
                $end.prop("disabled", end === pointValues.max).val(end);
            });
    }
});
