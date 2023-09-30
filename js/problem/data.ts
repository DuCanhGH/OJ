import "$prebundled/jquery-sortable.js";
import "$prebundled/featherlight/featherlight.min.js";
import "$vnoj/jszip/jszip.min.js";

import { getI18n } from "$js/utils.js";

const select2Theme = document.currentScript?.dataset.select2Theme;

let validFiles = (JSON.parse($("#valid-files-json").text()) as string[]).sort();
const testcaseLimit = Number(document.currentScript?.dataset.testcaseLimit);
const testcaseSoftLimit = Number(document.currentScript?.dataset.testcaseSoftLimit);
const i18n = getI18n(document.currentScript?.dataset, {
    precisionDecimalDigits: "i18nPrecisionDecimalDigits",
    invalidCheckerExtension: "i18nInvalidCheckerExtension",
    testcaseLimitExceeded: "i18nTestcaseLimitExceeded",
    testcaseLimitExceededInfo: "i18nTestcaseLimitExceededInfo",
});

$(() => {
    function autofillIfExists($select: JQuery<HTMLElement>, file: string) {
        if (!$select.val() && ~validFiles.indexOf(file))
            $select.append(new Option(file, file, true, true)).trigger("change");
    }

    const validFilesOptions = validFiles.map((file) => {
        return { id: file, text: file };
    });

    const $table = $("#case-table");
    $table.on("add-row", (_, $tr: JQuery<HTMLElement>) => {
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
            value: tryParseJson($args.val() as string).precision || 6,
            title: i18n.precisionDecimalDigits,
            style: "width: 4em",
        })
            .on("change", (e) => {
                if (($checker.val() as string).startsWith("floats")) {
                    $args.val(
                        JSON.stringify({ precision: parseInt($(e.currentTarget).val() as string) }),
                    );
                }
            })
            .appendTo($td);

        // auto fill for custom checker
        $customCheckerFile.on("change", () => {
            if ($checker.val() === "bridged" && !init) {
                let $fileName = ($customCheckerFile.val() as string).split("\\").pop();
                // Handle case that the current file is null but we have a file in database
                const $old_file = $customCheckerFile.parent().find("a")[0];
                if ($old_file && $fileName == "") {
                    $fileName = $old_file.innerText;
                }
                if (!($fileName === undefined || $fileName == "")) {
                    $fileName = $fileName.split("/").pop();
                    const $fileExt = $fileName?.split(".").pop();
                    if ($fileExt) {
                        if (!["cpp", "pas", "java"].includes($fileExt)) {
                            alert(`${i18n.invalidCheckerExtension}${$fileExt}'`);
                        } else {
                            let $lang = $fileExt.toUpperCase();
                            if ($lang == "CPP") $lang = "CPP17";
                            if ($lang == "JAVA") $lang = "JAVA8";
                            $args.val(
                                JSON.stringify({
                                    files: $fileName,
                                    lang: $lang,
                                    type: $customCheckerType.find(":selected").val(),
                                }),
                            );
                            if ($lang == "PY") $args.val("");
                        }
                    }
                }
            }
        });

        $customCheckerType.on("change", () => {
            if (!$args.val() || init) return;
            const oldArgs = tryParseJson($args.val() as string);
            if ("type" in oldArgs) {
                oldArgs["type"] = $customCheckerType.find(":selected").val();
            }
            $args.val(JSON.stringify(oldArgs));
        });

        if (init && $args.val()) {
            const oldArgs = tryParseJson($args.val() as string);
            if ("type" in oldArgs) $customCheckerType.val(oldArgs["type"]);
        }

        $checker
            .on("change", () => {
                $customCheckerFile.toggle($checker.val() === "bridged").trigger("change");
                $customCheckerType.toggle($checker.val() === "bridged").trigger("change");
                $trCustomCheckerFile.toggle($checker.val() === "bridged");
                $trCustomCheckerType.toggle($checker.val() === "bridged");
                const $checkerVal = $checker.val();
                if (typeof $checkerVal === "string") {
                    $precision.toggle($checkerVal.startsWith("floats")).trigger("change");
                }
                if (
                    !(
                        typeof $checkerVal === "string" &&
                        ($checkerVal === "bridged" || $checkerVal.startsWith("floats"))
                    )
                ) {
                    $args.val("");
                }
                init = false;
            })
            .trigger("change");
    })();

    const $grader = $("#id_problem-data-grader");
    const $ioMethod = $("#id_problem-data-io_method");
    const $ioInputFile = $("#id_problem-data-io_input_file");
    const $ioOutputFile = $("#id_problem-data-io_output_file");
    const $customGraderFile = $("#id_problem-data-custom_grader");
    const $customHeaderFile = $("#id_problem-data-custom_header");
    const $graderArgs = $("#id_problem-data-grader_args");

    const $trIoMethod = $ioMethod.parent().parent();
    const $trIoInputFile = $ioInputFile.parent().parent();
    const $trIoOutputFile = $ioOutputFile.parent().parent();
    const $trCustomGraderFile = $customGraderFile.parent().parent();
    const $trCustomHeaderFile = $customHeaderFile.parent().parent();
    const $trGraderArgs = $graderArgs.parent().parent();

    function clean_io_method() {
        const oldArgs = tryParseJson($graderArgs.val() as string);
        delete oldArgs.io_method;
        delete oldArgs.io_input_file;
        delete oldArgs.io_output_file;
        $graderArgs.val(JSON.stringify(oldArgs));
    }

    $grader
        .on("change", () => {
            const grader = $grader.val();
            const standardGrader = grader === "standard";
            const signatureGrader = grader === "signature";
            const outputOnly = grader === "output_only";
            const standardIo = $ioMethod.val() === "standard";

            if (!standardGrader) {
                clean_io_method();
            }

            $trIoMethod.toggle(standardGrader);
            $trIoInputFile.toggle(standardGrader && !standardIo);
            $trIoOutputFile.toggle(standardGrader && !standardIo);
            $trCustomGraderFile.toggle(!standardGrader && !outputOnly && !!grader);
            $trCustomHeaderFile.toggle(signatureGrader);
            $trGraderArgs.toggle(signatureGrader);
        })
        .trigger("change");

    $ioMethod.on("change", () => {
        const standard_io = $ioMethod.val() === "standard";
        $trIoInputFile.toggle(!standard_io);
        $trIoOutputFile.toggle(!standard_io);

        if (standard_io) {
            clean_io_method();
        } else {
            const old_args = tryParseJson($graderArgs.val() as string);
            old_args["io_method"] = $ioMethod.val();
            $graderArgs.val(JSON.stringify(old_args));
        }
    });

    $ioInputFile.on("change", () => {
        const old_args = tryParseJson($graderArgs.val() as string);
        old_args["io_input_file"] = $ioInputFile.val();
        $graderArgs.val(JSON.stringify(old_args));
    });

    $ioOutputFile.on("change", () => {
        const old_args = tryParseJson($graderArgs.val() as string);
        old_args["io_output_file"] = $ioOutputFile.val();
        $graderArgs.val(JSON.stringify(old_args));
    });

    if ($grader.val() === "standard") {
        $ioMethod
            .val(tryParseJson($graderArgs.val() as string).io_method || "standard")
            .trigger("change");
        if ($ioMethod.val() === "file") {
            $ioInputFile
                .val(tryParseJson($graderArgs.val() as string).io_input_file || "")
                .trigger("change");
            $ioOutputFile
                .val(tryParseJson($graderArgs.val() as string).io_output_file || "")
                .trigger("change");
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
        .on("add-row", (_, $tr: JQuery<HTMLElement>) => {
            const $order = $tr
                .find("input")
                .filter("[id$=order]")
                .attr("type", "hidden")
                .val(++order);

            $order
                .after($("<span>", { class: "order" }).text($order.val() as any))
                .after($("<i>", { class: "fa fa-fw fa-lg fa-ellipsis-v" }));

            const $opts = $tr.find("input").slice(2, 6);
            const $files = $tr.find("select").slice(1, 3);
            const $checker = $files.end().last();
            $tr.find("select[id$=type]")
                .on("change", (e) => {
                    const $this = $(e.currentTarget),
                        val = $this.val();
                    let disabled: boolean;
                    switch (val) {
                        case "S":
                        case "E":
                            disabled = val === "S";
                            $opts.toggle(val === "S");
                            $files.siblings(".select2").hide();
                            $checker.toggle(val == "S");
                            break;
                        default: {
                            $opts.toggle(val == "C");
                            $files.siblings(".select2").toggle(val === "C");
                            $checker.toggle(val == "C");
                            const $prevs = $tr.prevAll("tr[data-type=S], tr[data-type=E]");
                            disabled =
                                $prevs.length > 0 &&
                                $prevs.get(0)?.getAttribute("data-type") === "S";
                            $tr.find("input[id$=points], input[id$=pretest]").toggle(
                                val === "C" && !disabled,
                            );
                        }
                    }
                    $tr.attr("data-type", val as string)
                        .nextUntil('tr[data-type=S], tr[data-type=E], tr[data-type=""]')
                        .find("input[id$=points], input[id$=pretest]")
                        .toggle(!disabled);
                })
                .trigger("change");

            const tooltipClasses = "tooltipped tooltipped-s";
            $tr.find("a.edit-generator-args")
                .on("mouseover", (e) => {
                    switch ($tr.attr("data-type")) {
                        case "C":
                        case "S": {
                            const $this = $(e.currentTarget).addClass(tooltipClasses);
                            $this.attr("aria-label", ($this.prev().val() as string) || "(none)");
                        }
                    }
                })
                .on("mouseout", (e) => {
                    $(e.currentTarget).removeClass(tooltipClasses).removeAttr("aria-label");
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
                    afterOpen(e) {
                        const $input = $(e.currentTarget).prev();
                        $(e.currentTarget)
                            .find(".generator-args-editor")
                            .find("textarea")
                            .val($input.val() as string | number)
                            .end()
                            .find(".button")
                            .on("click", (ev) => {
                                $input.val($(ev.currentTarget).prev().val() as string | number);
                                $.featherlight.current().close();
                            })
                            .end()
                            .show();
                    },
                });
        })
        .find("tbody:first")
        .find("tr")
        .each((_, el) => {
            $table.trigger("add-row", [$(el)]);
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
        const total = parseInt($total.val() as string);
        if (total >= testcaseSoftLimit) {
            if (!alerted) {
                const s = `${i18n.testcaseLimitExceeded.replace(
                    "{testcase_soft_limit}",
                    "" + testcaseSoftLimit,
                )}\n${i18n.testcaseLimitExceededInfo}`;
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
                    .replace(/__prefix__/g, $total.val() as string),
            )),
        );
        $tr.find('.type-column select option[value="C"]').attr("selected", "");
        $total.val(parseInt($total.val() as string) + 1);
        $table.trigger("add-row", [$tr]);
        return false;
    });

    function reorderingRow(oldIndex: number, newIndex: number, $item: JQuery<HTMLElement>) {
        if (newIndex > oldIndex) {
            const order = parseInt(
                $item
                    .parent()
                    .children()
                    .slice(oldIndex, newIndex)
                    .each((_, el) => {
                        const $order = $(el).find("input[id$=order]");
                        $order
                            .val(parseInt($order.val() as string) - 1)
                            .siblings("span.order")
                            .text($order.val() as string);
                    })
                    .last()
                    .after($item)
                    .find("input[id$=order]")
                    .val() as string,
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
                    .each((_, el) => {
                        const $order = $(el).find("input[id$=order]");
                        $order
                            .val(parseInt($order.val() as string) + 1)
                            .siblings("span.order")
                            .text($order.val() as string);
                    })
                    .first()
                    .before($item)
                    .find("input[id$=order]")
                    .val() as string,
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
        const cntRow = parseInt($total.val() as string);
        $("a#add-case-row").trigger("click");
        if (cntRow == parseInt($total.val() as string)) return false;
        const newIndex = -1;
        const oldIndex = parseInt($total.val() as string) - 1;
        const $item = $($table.find("tbody:first").children()[oldIndex]);
        reorderingRow(oldIndex, newIndex, $item);
        return false;
    });

    $("#case-table tbody").on("click", ".add-case-row-below", (event) => {
        const cntRow = parseInt($total.val() as string);
        $("a#add-case-row").trigger("click");
        if (cntRow == parseInt($total.val() as string)) return false;
        const $current_row = $(event.currentTarget).parent().parent();
        const newIndex = parseInt($current_row.find("input[id$=order]").val() as string) - 1;
        const oldIndex = parseInt($total.val() as string) - 1;
        const $item = $($current_row.parent().children()[oldIndex]);
        reorderingRow(oldIndex, newIndex, $item);
        return false;
    });

    function fillTestcases() {
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
            const s =
                `{{_('The number of input files (${inFiles.length}) do not match the number of output files (${outFiles.length})!')}}` +
                `Input: ${inFiles}\n=====================\n` +
                `Output: ${outFiles}\n`;
            alert(s);
            return false;
        }
        const nTest = Math.min(inFiles.length, testcaseLimit);
        // add boxes
        while (+($total.val() as string) < nTest) {
            $("a#add-case-row").trigger("click");
        }
        // natsort
        const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
        inFiles.sort(collator.compare);
        outFiles.sort(collator.compare);
        // fill cases
        for (let i = 0; i < nTest; i++) {
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

    let oldIndex: number;
    $table.sortable({
        containerSelector: "table",
        itemPath: "> tbody:first",
        itemSelector: "tr",
        handle: "i.fa-ellipsis-v",
        placeholder: '<tr class="placeholder">',
        onDragStart($item, container, _super) {
            if (!$item) return;
            oldIndex = $item?.index();
            _super?.($item, container);
        },
        onDrop($item, container, _super) {
            if (!$item) return;
            const newIndex = $item.index();
            reorderingRow(oldIndex, newIndex, $item);
            _super?.($item, container);
        },
    });

    $("input#delete-all").on("change", (e) => {
        if ($(e.currentTarget).attr("checked")) {
            $("input[name$='DELETE']").attr("checked", "");
        } else {
            $("input[name$='DELETE']").removeAttr("checked");
        }
    });
    $("#problem-data-zipfile-clear_id").on("change", (e) => {
        if ($(e.currentTarget).attr("checked")) {
            $("input#delete-all").attr("checked", "");
        } else {
            $("input#delete-all").removeAttr("checked");
        }
        $("input#delete-all").trigger("change");
    });
    if (parseInt($total.val() as string) == 0 && validFiles.length) {
        fillTestcases();
    }

    $("#id_problem-data-zipfile").on("change", (event) => {
        const fileInput = (event.target as HTMLInputElement).files?.[0];

        if (!fileInput) return;

        const reader = new FileReader();

        reader.onload = (ev) => {
            const targetResult = ev.target?.result;
            if (targetResult !== undefined && targetResult !== null) {
                JSZip.loadAsync(targetResult)
                    .then((zip) => {
                        validFiles = Object.keys(zip.files).sort();
                        fillTestcases();
                    })
                    .catch((err) => {
                        console.log(err);
                        console.error("Failed to open as ZIP file");
                        alert("{{ _('Test file must be a ZIP file') }}");
                        (event.target as HTMLInputElement).value = "";
                    });
            }
        };
        reader.readAsArrayBuffer(fileInput);
    });
    $("form").dirty("setAsClean");
}).trigger("change");
