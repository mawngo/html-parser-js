module.exports = {
  root: true,
  env: {
    node: true
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "tsconfig.json",
    sourceType: "module"
  },
  plugins: [
    "@typescript-eslint"
  ],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  rules: {
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "off",
    indent: ["warn", 2],
    quotes: ["error", "double"],
    semi: ["error", "always"]
  }
};
