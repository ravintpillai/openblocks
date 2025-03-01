/**
 * libs to import as global var
 * name: module name
 * mergeDefaultAndNameExports: whether to merge default and named exports
 */
export const libs = [
  "axios",
  "redux",
  "react-router",
  "react-router-dom",
  "react-redux",
  "react",
  "react-dom",
  "lodash",
  "history",
  "antd",
  "moment",
  "@dnd-kit/core",
  "@dnd-kit/modifiers",
  "@dnd-kit/sortable",
  "@dnd-kit/utilities",
  {
    name: "openblocks-sdk",
    from: "./src/index.sdk.ts",
  },
  {
    name: "styled-components",
    mergeDefaultAndNameExports: true,
  },
];

/**
 * get global var name from module name
 * @param {string} name
 * @returns
 */
export const getLibGlobalVarName = (name) => {
  return "$" + name.replace(/@/g, "$").replace(/[\/\-]/g, "_");
};

export const getLibNames = () => {
  return libs.map((i) => {
    if (typeof i === "object") {
      return i.name;
    }
    return i;
  });
};

export const getAllLibGlobalVarNames = () => {
  const ret = {};
  libs.forEach((lib) => {
    let name = lib;
    if (typeof lib === "object") {
      name = lib.name;
    }
    ret[name] = getLibGlobalVarName(name);
  });
  return ret;
};

export const libsImportCode = () => {
  const lines = [];
  libs.forEach((i) => {
    let name = i;
    let merge = false;
    let from = name;

    if (typeof i === "object") {
      name = i.name;
      merge = i.mergeDefaultAndNameExports ?? false;
      from = i.from ?? name;
    }

    const varName = getLibGlobalVarName(name);
    if (merge) {
      lines.push(`import * as ${varName}_named_exports from '${from}';`);
      lines.push(`import ${varName} from '${from}';`);
      lines.push(`Object.assign(${varName}, ${varName}_named_exports);`);
    } else {
      lines.push(`import * as ${varName} from '${from}';`);
    }
    lines.push(`window.${varName} = ${varName};\n`);
  });
  return lines.join("\n");
};
