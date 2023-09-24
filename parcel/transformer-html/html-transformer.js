// @ts-nocheck
import ThrowableDiagnostic from "@parcel/diagnostic";
import { Transformer } from "@parcel/plugin";
import nullthrows from "nullthrows";
import PostHTML from "posthtml";
import { parser as parse } from "posthtml-parser";
import { render } from "posthtml-render";
import semver from "semver";

import collectDependencies from "./dependencies.js";
import extractInlineAssets from "./inline.js";

export default (new Transformer({
    canReuseAST({ ast }) {
        return ast.type === "posthtml" && semver.satisfies(ast.version, "^0.4.0");
    },

    async parse({ asset }) {
        return {
            type: "posthtml",
            version: "0.4.1",
            program: parse(await asset.getCode(), {
                lowerCaseTags: true,
                lowerCaseAttributeNames: true,
                sourceLocations: true,
                xmlMode: asset.type === "xhtml",
            }),
        };
    },

    async transform({ asset, options }) {
        if (asset.type === "htm") {
            asset.type = "html";
        }

        asset.bundleBehavior = "isolated";
        let ast = nullthrows(await asset.getAST());
        let hasModuleScripts;
        try {
            hasModuleScripts = collectDependencies(asset, ast);
        } catch (errors) {
            if (Array.isArray(errors)) {
                throw new ThrowableDiagnostic({
                    diagnostic: errors.map((error) => ({
                        message: error.message,
                        origin: "@parcel/transformer-html",
                        codeFrames: [
                            {
                                filePath: error.filePath,
                                language: "html",
                                codeHighlights: [error.loc],
                            },
                        ],
                    })),
                });
            }
            throw errors;
        }

        const { assets: inlineAssets, hasModuleScripts: hasInlineModuleScripts } =
            extractInlineAssets(asset, ast);

        const result = [asset, ...inlineAssets];

        // empty <script></script> is added to make sure HMR is working even if user
        // didn't add any.
        if (options.hmrOptions && !(hasModuleScripts || hasInlineModuleScripts)) {
            const script = {
                tag: "script",
                attrs: {
                    src: asset.addURLDependency("hmr.js", {
                        priority: "parallel",
                    }),
                },
                content: [],
            };

            const found = findFirstMatch(ast, [{ tag: "body" }, { tag: "html" }]);

            if (found) {
                found.content = found.content || [];
                found.content.push(script);
            } else {
                // Insert at the very end.
                ast.program.push(script);
            }

            asset.setAST(ast);

            result.push({
                type: "js",
                content: "",
                uniqueKey: "hmr.js",
            });
        }

        return result;
    },

    generate({ ast, asset }) {
        return {
            content: render(ast.program, {
                // @ts-expect-error weird types
                closingSingleTag: asset.type === "xhtml" ? "slash" : undefined,
            }),
        };
    },
}));

/**
 * 
 * @param {import("@parcel/types").AST} ast 
 * @param {*} expressions 
 * @returns 
 */
function findFirstMatch(ast, expressions) {
    let found;

    for (const expression of expressions) {
        // @ts-expect-error weird types
        PostHTML().match.call(ast.program, expression, (node) => {
            found = node;
            return node;
        });

        if (found) {
            return found;
        }
    }
}
