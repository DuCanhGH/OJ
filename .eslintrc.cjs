/** @type {import("@types/eslint").Linter.BaseConfig} */
module.exports = {
    root: true,
    extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"],
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint", "html"],
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: ["tsconfig.json"],
        ecmaVersion: "latest",
        sourceType: "module",
        warnOnUnsupportedTypeScriptVersion: false,
        extraFileExtensions: [".html"]
    },
    env: {
        browser: true,
        es2022: true,
        node: true,
    },
    rules: {
        "@typescript-eslint/ban-ts-comment": "off",
        "@typescript-eslint/consistent-type-imports": "error",
        "@typescript-eslint/no-unused-vars": [
            "warn",
            { ignoreRestSiblings: true, varsIgnorePattern: "^(_|\\$\\$)", argsIgnorePattern: "^_" },
        ],
    },
    globals: {
        $: "readonly",
    },
};
