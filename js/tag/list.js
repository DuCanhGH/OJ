const selectedTag = document.currentScript?.dataset.selectedTag;

if (selectedTag !== undefined) {
    $(() => {
        const elm = $(`.accordion .card-body a[tag_id=${selectedTag}]`)[0];
        if (elm) {
            const el = $(elm);
            el.parent().addClass("row-selected");
            el.parent().parent().addClass("show");
            el.parent().parent().slideDown(0);
        }
    });
} else {
    $(() => {
        const elm = $(".accordion .card-toggle")[0];
        if (elm) {
            const el = $(elm);
            el.next().addClass("show");
            el.next().slideDown(0);
        }
    });
}
