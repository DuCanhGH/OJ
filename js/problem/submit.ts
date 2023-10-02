declare global {
    interface Window {
        ace_source: any;
    }
}

const languageTemplateAjax = document.currentScript?.dataset.languageTemplateAjax;
const select2Theme = document.currentScript?.dataset.select2Theme;

$(() => {
    let previousTemplate = "";

    function updateLanguageTemplate() {
        const source = $("textarea#id_source");
        if (source.val() == previousTemplate.replace(/\r/g, "") || source.val() == "") {
            const langId = $("#id_language").val();
            const code = localStorage.getItem("submit:" + $("#id_language").val());

            function updateSubmitArea(code: string) {
                previousTemplate = code;
                source.val(code);
                window.ace_source.getSession().setValue(code);
            }

            if (code !== null) {
                updateSubmitArea(code);
            } else if (languageTemplateAjax) {
                $.get(languageTemplateAjax, {
                    id: langId,
                }).done((template) => {
                    updateSubmitArea(template);
                });
            }
        }
    }

    function makeDisplayData(data: JQuery<HTMLElement>) {
        const siteData = data.attr("data-info");
        const judgeData = data.attr("data-judge-info");
        const displayData = siteData || judgeData;
        return displayData;
    }

    // Terrible hack, adapted from https://github.com/select2/select2/issues/4436
    // @ts-ignore
    $.fn.select2.amd.define(
        "select2/data/customAdapter",
        ["select2/results", "select2/utils"],
        // @ts-ignore
        function (Result, Utils) {
            // @ts-ignore
            const RefPresenter = function ($element, options, dataAdapter) {
                // @ts-ignore
                RefPresenter.__super__.constructor.call(this, $element, options, dataAdapter);
            };
            // @ts-ignore
            Utils.Extend(RefPresenter, Result);
            // @ts-ignore
            RefPresenter.prototype.bind = function (container, $container) {
                // @ts-ignore
                container.on("results:focus", function (params) {
                    const data = makeDisplayData($("option[data-id=" + params.data.id + "]"));
                    if (data) $("#result-version-info").text(data);
                });
                // @ts-ignore
                RefPresenter.__super__.bind.call(this, container, $container);
            };
            // @ts-ignore
            return RefPresenter;
        },
    );

    const customAdapter = $.fn.select2.amd.require("select2/data/customAdapter");

    $("#id_language").select2({
        theme: select2Theme,
        templateResult(state) {
            if (!state.id) return state.text; // optgroup
            return state.text;
        },
        templateSelection(state) {
            if (!state.id) return state.text; // optgroup
            const data = makeDisplayData($("option[data-id=" + state.id + "]"));
            if (!data) return state.text;
            return $("<span>").append($("<b>").text(state.text), " (", data, ")");
        },
        resultsAdapter: customAdapter,
    });

    $("#id_language").on("select2:open", () => {
        const dropdown = $(".select2-dropdown");
        if (!$("#result-version-info").length) {
            dropdown.append($('<span id="result-version-info">'));
        }
        dropdown.attr("id", "language-select2");
    });

    $("#id_judge").on("select2:open", () => {
        const dropdown = $(".select2-dropdown");
        $("#result-version-info").remove();
        dropdown.attr("id", "judge-select2");
    });

    $("#id_language").on("change", () => {
        const lang = $("#id_language").find("option:selected").attr("data-ace");
        window.ace_source.getSession().setMode("ace/mode/" + lang);
        updateLanguageTemplate();
    });

    $("#ace_source").on("ace_load", (_, editor) => {
        updateLanguageTemplate();
        editor.commands.addCommand({
            name: "save",
            bindKey: { win: "Ctrl-S", mac: "Command-S" },
            exec() {
                localStorage.setItem(
                    "submit:" + $("#id_language").val(),
                    editor.getSession().getValue(),
                );
            },
        });
        editor.commands.addCommand({
            name: "open",
            bindKey: { win: "Ctrl-O", mac: "Command-O" },
            exec() {
                $("#file_select").trigger("click");
            },
        });
        editor.getSession().setUseWrapMode(true);
        editor.setFontSize(14);
        editor.setPrintMarginColumn(100);
        editor.focus();

        $(editor.container).on("dragover", (e) => {
            const types = e.originalEvent?.dataTransfer?.types;
            if (types && Array.prototype.indexOf.call(types, "Files") !== -1) {
                e.stopPropagation();
                e.preventDefault();
            }
        });

        $(editor.container).on("drop", (e) => {
            e.preventDefault();
            $("#file_select").prop("files", e.originalEvent?.dataTransfer?.files);
            handleFileSelect();
        });
    });

    $(window)
        .on("resize", () => {
            const windowHeight = $(window).height();
            if (!windowHeight) return;
            $("#ace_source").height(Math.max(windowHeight - 353, 100));
        })
        .trigger("resize");

    $("#problem_submit").on("submit", (event) => {
        if (($("#id_source").val() as string).length > 65536) {
            alert(gettext("Your source code must contain at most 65536 characters."));
            event.preventDefault();
            $("#problem_submit").find(":submit").removeAttr("disabled");
        }
    });

    function onLanguageChange() {
        const obj = document.getElementById("id_language") as HTMLSelectElement;
        const fileonly = obj.options[obj.selectedIndex].getAttribute("data-fileonly");
        if (fileonly === "True") {
            if (!$("#editor").hasClass("hidden")) {
                $("#editor").addClass("hidden");
            }
            if ($("#file-submit").hasClass("hidden")) {
                $("#file-submit").removeClass("hidden");
            }

            const fileExt = "." + obj.options[obj.selectedIndex].getAttribute("data-ext");
            const fileSizeLimit = obj.options[obj.selectedIndex].getAttribute("data-file-size");
            $("#file_upload").val("");
            $("#file_upload").attr({ accept: fileExt });
            $("#file_drag").html(
                `<b>${gettext(
                    "Click to select a file or drag a file into this box",
                )}</b><br>${interpolate(
                    gettext("Only accept %(fileExt)s. Maximum file size is %(fileSizeLimit)s MB."),
                    {
                        fileExt,
                        fileSizeLimit: fileSizeLimit ?? "0",
                    },
                    true,
                )}`,
            );
        } else {
            if ($("#editor").hasClass("hidden")) {
                $("#editor").removeClass("hidden");
            }
            if (!$("#file-submit").hasClass("hidden")) {
                $("#file-submit").addClass("hidden");
            }
        }
    }

    $("#id_language").on("change", () => {
        onLanguageChange();
    });

    onLanguageChange();

    $("#file_drag").on("dragover", (e) => {
        e.stopPropagation();
        e.preventDefault();
        $("#file_drag").addClass("hover");
    });
    $("#file_drag").on("dragleave", (e) => {
        e.stopPropagation();
        e.preventDefault();
        $("#file_drag").removeClass("hover");
    });
    $("#file_drag").on("drop", (e) => {
        e.stopPropagation();
        e.preventDefault();
        $("#file_drag").removeClass("hover");
        $("#file_upload").prop("files", e.originalEvent?.dataTransfer?.files);
        handleFileChange();
    });
});

function handleFileSelect() {
    const file = $<HTMLInputElement>("#file_select")[0].files?.[0];
    if (file !== undefined) {
        const reader = new FileReader();
        reader.onload = () => {
            window.ace_source.session.setValue(reader.result);

            if (file.name.search(".") != -1) {
                const ext = file.name.split(".").pop();
                const languages = $<HTMLSelectElement>("#id_language")[0].options;
                for (let i = languages.length - 1; i >= 0; i--) {
                    if (
                        languages[i].getAttribute("data-fileonly") === "False" &&
                        languages[i].getAttribute("data-ext") === ext
                    ) {
                        $("#id_language").val(languages[i].value).trigger("change");
                        break;
                    }
                }
            }
        };
        reader.readAsText(file);
    }
}

function handleFileChange() {
    const file = $<HTMLInputElement>("#file_upload")[0].files?.[0];
    if (file !== undefined) {
        $("#file_drag").html(
            `<b>${gettext("File name")}:</b> ` +
                file.name +
                "<br>" +
                `<b>${gettext("File size")}:</b> ` +
                (file.size / (1024 * 1024)).toFixed(2) +
                " MB",
        );
    }
}

// https://stackoverflow.com/questions/43043113/how-to-force-reloading-a-page-when-using-browser-back-button#comment105570384_43043658
if ((window.performance.getEntriesByType("navigation")[0] as any).type === "back_forward") {
    location.reload();
}
