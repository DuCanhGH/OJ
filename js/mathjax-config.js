window.MathJax = {
    // @ts-expect-error I give up with MathJax
    tex: {
        inlineMath: [
            ["~", "~"],
            ["\\(", "\\)"],
        ],
    },
    options: {
        enableMenu: false,
    },
};
