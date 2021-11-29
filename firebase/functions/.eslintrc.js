module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "google",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig.json", "tsconfig.dev.json"],
    sourceType: "module",
  },
  ignorePatterns: [
    "/lib/**/*", // Ignore built files.
  ],
  plugins: [
    "@typescript-eslint",
    "import",
  ],
  rules: {
    "quotes": ["error", "double"],
    "quotes": ["off"],
    "linebreak-style": ["off"],
    "semi": ["off"],
    "object-curly-spacing": ["off"],
    "max-len": ["off"],
    "comma-dangle": ["off"],
    "eol-last": ["off"],
    "require-jsdoc": ["off"],
    "indent": ["error", 2],
    "import/export": 1,
    "import/no-unresolved": 0,
  },
};
