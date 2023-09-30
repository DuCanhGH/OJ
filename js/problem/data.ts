import "$prebundled/jquery-sortable.js";
import "$prebundled/featherlight/featherlight.min.js";
import "$vnoj/jszip/jszip.min.js";

const select2Theme = document.currentScript?.dataset.select2Theme;

let validFiles = (JSON.parse($("#valid-files-json").text()) as string[]).sort();
const testcaseLimit = Number("{{ testcase_limit }}");
const testcaseSoftLimit = Number("{{ testcase_soft_limit }}");

$(() => {
    function autofillIfExists($select, file) {
        if (!$select.val() && ~validFiles.indexOf(file))
            $select.append(new Option(file, file, true, true)).change();
    }

    const validFilesOptions = validFiles.map((file) => {
        return { id: file, text: file };
    });

    const $table = $("#case-table");
    $table.on("add-row", (e, $tr) => {
        $tr.find("input")
            .filter("[id$=file]")
            .each((_, el) => {
                let $select: JQuery<HTMLElement>;
                const val = $(el)
                    .replaceWith(
                        ($select = $("<select>").attr({
                            id: $(el).attr("id"),
                            name: $(el).attr("name"),
                            style: "width: 100%",
                        })),
                    )
                    .val();

                if (typeof val === "number" || typeof val === "object") {
                    return;
                }

                const option = new Option(val, val, true, true);
                $select
                    .select2({
                        theme: select2Theme,
                        ajax: {
                            transport(_, success) {
                                success({ results: validFilesOptions });
                            },
                        },
                        allowClear: true,
                        placeholder: "",
                    })
                    .append(option)
                    .trigger("change")
                    .on("change", () => {
                        const val = $select.val();
                        if (val && typeof val === "string") {
                            if ($select.attr("id")?.endsWith("input_file")) {
                                autofillIfExists(
                                    $tr.find("select[id$=output_file]"),
                                    val.replace(/in(?!.*?in)/, "out"),
                                );
                            } else {
                                autofillIfExists(
                                    $tr.find("select[id$=input_file]"),
                                    val.replace(/out(?!.*?out)/, "in"),
                                );
                            }
                        }
                    });
            });
    });

    let order = 0;

    function handleTableReorder() {
        let inBatch = false;
        $table.find("tbody:first tr").each((_, el) => {
            switch ($(el).attr("data-type")) {
                case "C":
                    $(el).find("input[id$=points], input[id$=pretest]").toggle(!inBatch);
                    break;
                case "S":
                    inBatch = true;
                    break;
                case "E":
                    inBatch = false;
            }
        });
    }

    function tryParseJson(json: string) {
        try {
            return JSON.parse(json);
        } catch (e) {
            return {};
        }
    }

    const $args = $("#id_problem-data-checker_args");
    const $checker = $("#id_problem-data-checker");
    const $customCheckerFile = $("#id_problem-data-custom_checker");
    const $customCheckerType = $("#id_problem-data-checker_type");
    const $trCustomCheckerFile = $customCheckerFile.parent().parent();
    const $trCustomCheckerType = $customCheckerType.parent().parent();
    let init = true;

    (function checker_args_auto_fill() {
        // auto fill for float checker
        const $td = $checker.parent();
        const $precision = $("<input>", {
            type: "number",
            value: tryParseJson($args.val()).precision || 6,
            title: "{{ _('precision (decimal digits)') }}",
            style: "width: 4em",
        })
            .on("change", (e) => {
                if ($checker.val().startsWith("floats")) {
                    $args.val(JSON.stringify({ precision: parseInt($(e.currentTarget).val()) }));
                }
            })
            .appendTo($td);

        // auto fill for custom checker
        $customCheckerFile.on("change", () => {
            if ($checker.val() === "bridged" && !init) {
                let $file_name = $customCheckerFile.val().split("\\").pop();
                // Handle case that the current file is null but we have a file in database
                const $old_file = $customCheckerFile.parent().find("a")[0];
                if ($old_file && $file_name == "") {
                    $file_name = $old_file.innerText;
                }
                if (!($file_name == "")) {
                    $file_name = $file_name.split("/").pop();
                    $file_ext = $file_name.split(".").pop();
                    if (!["cpp", "pas", "java"].includes($file_ext)) {
                        alert(
                            "{{ _('Expected checker's extension must be in [cpp, pas, java], found ') }}'" +
                                $file_ext +
                                "'",
                        );
                    } else {
                        $lang = $file_ext.toUpperCase();
                        if ($lang == "CPP") $lang = "CPP17";
                        if ($lang == "JAVA") $lang = "JAVA8";
                        $args.val(
                            JSON.stringify({
                                files: $file_name,
                                lang: $lang,
                                type: $customCheckerType.find(":selected").val(),
                            }),
                        );
                        if ($lang == "PY") $args.val("");
                    }
                }
            }
        });

        $customCheckerType.on("change", () => {
            if (!$args.val() || init) return;
            const old_args = tryParseJson($args.val());
            if ("type" in old_args) {
                old_args["type"] = $customCheckerType.find(":selected").val();
            }
            $args.val(JSON.stringify(old_args));
        });

        if (init && $args.val()) {
            const old_args = tryParseJson($args.val());
            if ("type" in old_args) $customCheckerType.val(old_args["type"]);
        }

        $checker
            .on("change", () => {
                $customCheckerFile.toggle($checker.val() === "bridged").change();
                $customCheckerType.toggle($checker.val() === "bridged").change();
                $trCustomCheckerFile.toggle($checker.val() === "bridged");
                $trCustomCheckerType.toggle($checker.val() === "bridged");
                $precision.toggle($checker.val().startsWith("floats")).change();
                if (!($checker.val() === "bridged" || $checker.val().startsWith("floats")))
                    $args.val("");
                init = false;
            })
            .trigger("change");
    })();

    const $grader = $("#id_problem-data-grader");
    const $io_method = $("#id_problem-data-io_method");
    const $io_input_file = $("#id_problem-data-io_input_file");
    const $io_output_file = $("#id_problem-data-io_output_file");
    const $custom_grader_file = $("#id_problem-data-custom_grader");
    const $custom_header_file = $("#id_problem-data-custom_header");
    const $grader_args = $("#id_problem-data-grader_args");

    const $tr_io_method = $io_method.parent().parent();
    const $tr_io_input_file = $io_input_file.parent().parent();
    const $tr_io_output_file = $io_output_file.parent().parent();
    const $tr_custom_grader_file = $custom_grader_file.parent().parent();
    const $tr_custom_header_file = $custom_header_file.parent().parent();
    const $tr_grader_args = $grader_args.parent().parent();

    function clean_io_method() {
        const old_args = tryParseJson($grader_args.val());
        delete old_args.io_method;
        delete old_args.io_input_file;
        delete old_args.io_output_file;
        $grader_args.val(JSON.stringify(old_args));
    }

    $grader
        .on("change", () => {
            const grader = $grader.val();
            const standard_grader = grader === "standard";
            const signature_grader = grader === "signature";
            const output_only = grader === "output_only";
            const standard_io = $io_method.val() === "standard";

            if (!standard_grader) {
                clean_io_method();
            }

            $tr_io_method.toggle(standard_grader);
            $tr_io_input_file.toggle(standard_grader && !standard_io);
            $tr_io_output_file.toggle(standard_grader && !standard_io);
            $tr_custom_grader_file.toggle(!standard_grader && !output_only && !!grader);
            $tr_custom_header_file.toggle(signature_grader);
            $tr_grader_args.toggle(signature_grader);
        })
        .trigger("change");

    $io_method.on("change", () => {
        const standard_io = $io_method.val() === "standard";
        $tr_io_input_file.toggle(!standard_io);
        $tr_io_output_file.toggle(!standard_io);

        if (standard_io) {
            clean_io_method();
        } else {
            const old_args = tryParseJson($grader_args.val());
            old_args["io_method"] = $io_method.val();
            $grader_args.val(JSON.stringify(old_args));
        }
    });

    $io_input_file.on("change", () => {
        const old_args = tryParseJson($grader_args.val());
        old_args["io_input_file"] = $io_input_file.val();
        $grader_args.val(JSON.stringify(old_args));
    });

    $io_output_file.on("change", () => {
        const old_args = tryParseJson($grader_args.val());
        old_args["io_output_file"] = $io_output_file.val();
        $grader_args.val(JSON.stringify(old_args));
    });

    if ($grader.val() === "standard") {
        $io_method.val(tryParseJson($grader_args.val()).io_method || "standard").change();
        if ($io_method.val() === "file") {
            $io_input_file.val(tryParseJson($grader_args.val()).io_input_file || "").change();
            $io_output_file.val(tryParseJson($grader_args.val()).io_output_file || "").change();
        }
    }

    const $td = $checker.parent();

    $("<a/>", {
        text: "{{_('Instruction')}}",
        style: "margin-left:3em;",
        target: "_blank",
        href: "/custom_checkers",
    }).appendTo($td);

    const $file_test = $("#id_problem-data-zipfile");
    $("<br>").appendTo($file_test.parent());
    $("<input/>", {
        type: "submit",
        value: "{{ _('Please press this button if you have just updated the zip data') }}",
        class: "button",
        style: "display: inherit",
        id: "submit-button",
    }).appendTo($file_test.parent());

    $table
        .on("add-row", (e, $tr) => {
            const $order = $tr
                .find("input")
                .filter("[id$=order]")
                .attr("type", "hidden")
                .val(++order);
            $order
                .after($("<span>", { class: "order" }).text($order.val()))
                .after($("<i>", { class: "fa fa-fw fa-lg fa-ellipsis-v" }));

            const $opts = $tr.find("input").slice(2, 6);
            const $files = $tr.find("select").slice(1, 3);
            const $checker = $files.end().last();
            $tr.find("select[id$=type]")
                .change((e) => {
                    const $this = $(e.currentTarget),
                        val = $this.val();
                    let disabled;
                    switch (val) {
                        case "S":
                        case "E":
                            disabled = val == "S";
                            $opts.toggle(val == "S");
                            $files.siblings(".select2").hide();
                            $checker.toggle(val == "S");
                            break;
                        default: {
                            $opts.toggle(val == "C");
                            $files.siblings(".select2").toggle(val == "C");
                            $checker.toggle(val == "C");
                            const $prevs = $tr.prevAll("tr[data-type=S], tr[data-type=E]");
                            disabled =
                                $prevs.length && $prevs.get(0).getAttribute("data-type") == "S";
                            $tr.find("input[id$=points], input[id$=pretest]").toggle(
                                val == "C" && !disabled,
                            );
                        }
                    }
                    $tr.attr("data-type", val)
                        .nextUntil('tr[data-type=S], tr[data-type=E], tr[data-type=""]')
                        .find("input[id$=points], input[id$=pretest]")
                        .toggle(!disabled);
                })
                .change();

            const tooltip_classes = "tooltipped tooltipped-s";
            $tr.find("a.edit-generator-args")
                .mouseover(() => {
                    switch ($tr.attr("data-type")) {
                        case "C":
                        case "S":
                            const $this = $(this).addClass(tooltip_classes);
                            $this.attr("aria-label", $this.prev().val() || "(none)");
                    }
                })
                .mouseout(() => {
                    $(this).removeClass(tooltip_classes).removeAttr("aria-label");
                })
                .featherlight($(".generator-args-editor"), {
                    beforeOpen: () => {
                        switch ($tr.attr("data-type")) {
                            case "C":
                            case "S":
                                return true;
                            default:
                                return false;
                        }
                    },
                    afterOpen: () => {
                        const $input = this.$currentTarget.prev();
                        this.$instance
                            .find(".generator-args-editor")
                            .find("textarea")
                            .val($input.val())
                            .end()
                            .find(".button")
                            .click(() => {
                                $input.val($(this).prev().val());
                                $.featherlight.current().close();
                            })
                            .end()
                            .show();
                    },
                });
        })
        .find("tbody:first")
        .find("tr")
        .each(() => {
            $table.trigger("add-row", [$(this)]);
        });

    $("form").on("submit", () => {
        $table
            .find("tbody:first")
            .find("tr")
            .each((_, el) => {
                let filled = false;
                $(el)
                    .find("input, select")
                    .each((_, el) => {
                        const $this = $(el);
                        if (!$this.attr("name")) return;
                        if ($this.attr("type") === "checkbox") filled ||= $this.is(":checked");
                        else if (!$this.attr("name")?.endsWith("order")) filled ||= !!$this.val();
                    });
                if (!filled) $(el).find("input[id$=order]").val("");
            });

        // Check all hidden "Clear" checkboxes
        // so the corresponding files are cleaned up automatically by django-cleanup
        $(":checkbox")
            .filter((_, el) => el.id.endsWith("clear_id"))
            .each((_, el) => {
                if ($(el).parent().is(":hidden")) {
                    $(el).attr("checked", "");
                }
            });
    });

    const $total = $("#id_cases-TOTAL_FORMS");
    let alerted = false;

    $("a#add-case-row").on("click", () => {
        const total = parseInt($total.val());
        if (total >= testcaseSoftLimit) {
            if (!alerted) {
                const s = `{{_('You are about to create more than ${testcaseSoftLimit} testcases.')}}\n{{_('Please do not create too many testcases if not really necessary.')}}`;
                alert(s);
                alerted = true;
            }
        }
        if (total >= testcaseLimit) {
            const s = `{{_('Too many testcases')}}: ${total}\n{{_('Number of testcases must not exceed ${testcaseLimit}')}}`;
            alert(s);
            return true;
        }
        let $tr;
        $table.find("tbody:first").append(
            ($tr = $(
                $table
                    .find(".extra-row-body")
                    .html()
                    .replace(/__prefix__/g, $total.val()),
            )),
        );
        $tr.find('.type-column select option[value="C"]').attr("selected", true);
        $total.val(parseInt($total.val()) + 1);
        $table.trigger("add-row", [$tr]);
        return false;
    });

    function reordering_row(oldIndex, newIndex, $item) {
        if (newIndex > oldIndex) {
            const order = parseInt(
                $item
                    .parent()
                    .children()
                    .slice(oldIndex, newIndex)
                    .each(() => {
                        const $order = $(this).find("input[id$=order]");
                        $order
                            .val(parseInt($order.val()) - 1)
                            .siblings("span.order")
                            .text($order.val());
                    })
                    .last()
                    .after($item)
                    .find("input[id$=order]")
                    .val(),
            );
            $item
                .find("input[id$=order]")
                .val(order + 1)
                .siblings("span.order")
                .text(order + 1);
        } else if (newIndex < oldIndex) {
            const order = parseInt(
                $item
                    .parent()
                    .children()
                    .slice(newIndex + 1, oldIndex + 1)
                    .each(() => {
                        const $order = $(this).find("input[id$=order]");
                        $order
                            .val(parseInt($order.val()) + 1)
                            .siblings("span.order")
                            .text($order.val());
                    })
                    .first()
                    .before($item)
                    .find("input[id$=order]")
                    .val(),
            );
            $item
                .find("input[id$=order]")
                .val(order - 1)
                .siblings("span.order")
                .text(order - 1);
        }
        if (newIndex != oldIndex) handleTableReorder();
    }

    $("a#add-case-first-row").on("click", () => {
        const cntRow = parseInt($total.val());
        $("a#add-case-row").trigger("click");
        if (cntRow == parseInt($total.val())) return false;
        const newIndex = -1;
        const oldIndex = parseInt($total.val()) - 1;
        const $item = $($table.find("tbody:first").children()[oldIndex]);
        reordering_row(oldIndex, newIndex, $item);
        return false;
    });

    $("#case-table tbody").on("click", ".add-case-row-below", (event) => {
        const cntRow = parseInt($total.val());
        $("a#add-case-row").trigger("click");
        if (cntRow == parseInt($total.val())) return false;
        const $current_row = $(event.currentTarget).parent().parent();
        const newIndex = parseInt($current_row.find("input[id$=order]").val()) - 1;
        const oldIndex = parseInt($total.val()) - 1;
        const $item = $($current_row.parent().children()[oldIndex]);
        reordering_row(oldIndex, newIndex, $item);
        return false;
    });

    function fill_testcases() {
        console.log("Filling testcase...");
        const inFiles = [],
            outFiles = [];
        const input_re = new RegExp(/^(?=.*?\.in|in).*?(?:(?:^|\W)(\d+)[^\d\s]+)?(\d+)[^\d\s]*$/);
        const output_re = new RegExp(
            /^(?=.*?\.out|.*?\.ok|.*?\.ans|out|ok|ans).*?(?:(?:^|\W)(\d+)[^\d\s]+)?(\d+)[^\d\s]*$/,
        );
        for (let i = 0; i < validFiles.length; i++) {
            if (input_re.test(validFiles[i].toLowerCase().replace("/", "."))) {
                inFiles.push(validFiles[i]);
            }
            if (output_re.test(validFiles[i].toLowerCase().replace("/", "."))) {
                outFiles.push(validFiles[i]);
            }
        }
        if (inFiles.length == 0) {
            alert(
                "{{_('No input/output files. Make sure your files are following themis/cms test format')}}",
            );
            return false;
        }
        if (inFiles.length != outFiles.length) {
            s = `{{_('The number of input files (${inFiles.length}) do not match the number of output files (${outFiles.length})!')}}`;
            s = s + `Input: ${inFiles}\n=====================\n`;
            s = s + `Output: ${outFiles}\n`;
            alert(s);
            return false;
        }
        n_test = Math.min(inFiles.length, testcaseLimit);
        // add boxes
        while ($total.val() < n_test) {
            $("a#add-case-row").click();
        }
        // natsort
        const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
        inFiles.sort(collator.compare);
        outFiles.sort(collator.compare);
        // fill cases
        for (let i = 0; i < n_test; i++) {
            $("#id_cases-" + i + "-input_file")
                .append(new Option(inFiles[i], inFiles[i], true, true))
                .trigger("change");
            $("#id_cases-" + i + "-output_file")
                .append(new Option(outFiles[i], outFiles[i], true, true))
                .trigger("change");
            $("#id_cases-" + i + "-points")
                .val("1")
                .trigger("change");
        }
        $("#fill-test-case-noti").show();
        if (inFiles.length > testcaseLimit) {
            const s =
                `{{_('Too many testcases')}}: ${inFiles.length}\n{{_('Number of testcases must not exceed ${testcaseLimit}')}}\n` +
                `{{_('Because of that, only the first ${testcaseLimit} testcases will be saved!')}}`;
            alert(s);
        }
        return false;
    }

    let oldIndex;
    $table.sortable({
        containerSelector: "table",
        itemPath: "> tbody:first",
        itemSelector: "tr",
        handle: "i.fa-ellipsis-v",
        placeholder: '<tr class="placeholder">',
        onDragStart($item, container, _super) {
            oldIndex = $item.index();
            _super($item, container);
        },
        onDrop($item, container, _super) {
            const newIndex = $item.index();
            reordering_row(oldIndex, newIndex, $item);
            _super($item, container);
        },
    });

    $("input#delete-all").on("change", () => {
        if (this.checked) {
            $("input[name$='DELETE']").attr("checked", true);
        } else {
            $("input[name$='DELETE']").attr("checked", false);
        }
    });
    $("#problem-data-zipfile-clear_id").on("change", (e) => {
        if (this.checked) {
            $("input#delete-all").attr("checked", "");
        } else {
            $("input#delete-all").removeAttr("checked");
        }
        $("input#delete-all").trigger("change");
    });
    if (parseInt($total.val()) == 0 && validFiles.length) {
        fill_testcases();
    }

    $("#id_problem-data-zipfile").on("change", (event) => {
        let fileInput = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (ev) => {
            JSZip.loadAsync(ev.target.result)
                .then((zip) => {
                    validFiles = Object.keys(zip.files).sort();
                    fill_testcases();
                })
                .catch((err) => {
                    console.log(err);
                    console.error("Failed to open as ZIP file");
                    alert("{{ _('Test file must be a ZIP file') }}");
                    event.target.value = "";
                });
        };
        reader.readAsArrayBuffer(fileInput);
    });
    $("form").dirty("setAsClean");
}).trigger("change");
