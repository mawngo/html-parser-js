const fs = require("fs/promises");
const path = require("path");

const packageJson = {
  "type": "module"
};

fs
  .writeFile(path.resolve("./dist/esm/package.json"), JSON.stringify(packageJson, null, 2))
  .then(() => console.log("Created esm package.json"))
  .catch((e) => console.error(e));
