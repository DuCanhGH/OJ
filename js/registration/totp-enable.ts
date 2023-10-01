$(() => {
    if (window.navigator.userAgent.indexOf("Edge") >= 0) {
        const $qr = $(".totp-qr-code");
        const $canvas = $<HTMLCanvasElement>('<canvas width="400" height="400">').appendTo($qr);
        const ctx = $canvas[0].getContext("2d");
        if (ctx) {
            $qr.find("img").on("load", (e) => {
                // @ts-expect-error probably some old Edge stuff
                ctx.msImageSmoothingEnabled = false;
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(e.currentTarget, 0, 0, 400, 400);
                $(e.currentTarget).hide();
            });
        }
    }
});
