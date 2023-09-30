export function getOrganizationCodes() {
    const orgList: string[] = [];

    $("#ranking-table > tbody > *").each((_, el) => {
        const orgAnchor = $(el).find("div > div > .personal-info > .organization > a")[0];

        if (orgAnchor) {
            orgList.push($(orgAnchor).text());
        }
    });

    orgList.sort();
    orgList.push("Other");

    const orgOptions = $("#org-check-list");
    orgOptions.empty();

    orgList.forEach((org) => {
        orgOptions.append(`<option value="${org}">${org}</option>`);
    });
};

export function restoreChecklistOptions(contestKey: string) {
    const selectedOrgsLs = localStorage.getItem(`filter-selected-orgs-${contestKey}`);
    if (selectedOrgsLs === null) {
        return;
    }
    $("#org-check-list").val(JSON.parse(selectedOrgsLs)).trigger("change");
};
