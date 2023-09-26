$(document).on("click", ".accordion .card-toggle", function (e) {
    e.preventDefault();

    const $this = $(e.currentTarget);

    if ($this.next().hasClass("show")) {
        $this.next().removeClass("show");
        $this.next().slideUp();
    } else {
        $this.parent().parent().find(".card-body").removeClass("show");
        $this.parent().parent().find(".card-body").slideUp();
        $this.next().addClass("show");
        $this.next().slideDown();
    }
});
