/** @type {import("@types/eslint").Linter.BaseConfig} */
module.exports = {
	root: true,
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended",
		"prettier",
	],
	parser: "@typescript-eslint/parser",
	plugins: ["@typescript-eslint", "html"],
	parserOptions: {
		sourceType: "module",
		ecmaVersion: 2020,
		warnOnUnsupportedTypeScriptVersion: false,
	},
	env: {
		browser: true,
		es2017: true,
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
};
