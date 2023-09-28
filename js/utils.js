/**
 * @template {string} T 
 * @param {DOMStringMap | undefined} scriptDataset
 * @param  {Record<T, string>} mapKeyToDataset 
 * @returns {Record<T, string>}
 */
export function getI18n(scriptDataset, mapKeyToDataset) {
    const result = /** @type {Record<T, string>} */({});

    for (const key in mapKeyToDataset) {
        result[key] = scriptDataset?.[mapKeyToDataset[key]] ?? key;
    }

    return result;
}