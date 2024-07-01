const fs = require("fs/promises");
const path = require("path");

const esmPackageJson = {
  "type": "module"
};

fs
  .writeFile(path.resolve("dist", "esm", "package.json"), JSON.stringify(esmPackageJson, null, 2))
  .then(() => console.log("Created esm package.json"))
  .catch((e) => console.error(e));


fs.readFile(path.resolve("package.json"), "utf-8")
  .then(f => {
    const json = JSON.parse(f);
    delete json["devDependencies"];
    delete json["volta"];
    return JSON.stringify(json, null, 2);
  })
  .then(f => fs.writeFile(path.resolve("dist", "package.json"), f))
  .then(() => console.log("Created package.json"))
  .catch((e) => console.error(e));

fs.copyFile(path.resolve("README.md"), path.resolve("dist", "README.md"))
  .then(() => console.log("Created README.md"))
  .catch((e) => console.error(e));
fs.copyFile(path.resolve("LICENSE"), path.resolve("dist", "LICENSE"))
  .then(() => console.log("Created LICENSE"))
  .catch((e) => console.error(e));
