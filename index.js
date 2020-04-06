const path = require("path");
const fs = require("fs");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const babel = require("@babel/core");
function resolveFile(filename) {
  const content = fs.readFileSync(filename, "utf-8");
  const ast = parser.parse(content, {
    sourceType: "module",
  });
  const dependencies = {};
  traverse(ast, {
    ImportDeclaration({ node }) {
      const dirname = path.dirname(filename);
      const newFile = "./" + path.join(dirname, node.source.value);
      dependencies[node.source.value] = newFile;
    },
  });
  const { code } = babel.transformFromAstSync(ast, null, {
    presets: ["@babel/preset-env"],
  });
  return {
    filename,
    dependencies,
    code,
  };
}

function getGraph(filename) {
  let allModules = [resolveFile(filename)];
  for (let index = 0; index < allModules.length; index++) {
    const { dependencies } = allModules[index];
    for (const key in dependencies) {
      if (dependencies.hasOwnProperty(key)) {
        const element = dependencies[key];
        allModules.push(resolveFile(element));
      }
    }
  }
  const graph = {};
  allModules.forEach((v) => {
    graph[v.filename] = {
      dependencies: v.dependencies,
      code: v.code,
    };
  });
  return graph;
}

function getFinalCode(entry) {
  const graph = JSON.stringify(getGraph(entry));
  return `
        (function(graph) {
            //require函数的本质是执行一个模块的代码，然后将相应变量挂载到exports对象上
            function require(module) {
                //localRequire的本质是拿到依赖包的exports变量
                function localRequire(relativePath) {
                    return require(graph[module].dependencies[relativePath]);
                }
                var exports = {};
                (function(require, exports, code) {
                    eval(code);
                })(localRequire, exports, graph[module].code);
                return exports;//函数返回指向局部变量，形成闭包，exports变量在函数执行后不会被摧毁
            }
            require('${entry}')
        })(${graph})`;
}
console.log(getFinalCode("./src/index.js"));
