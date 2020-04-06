const path = require('path')
const fs = require('fs')
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const babel = require('@babel/core')
function resolveFile(filename){
  const content = fs.readFileSync(filename,'utf-8')
  const ast = parser.parse(content,{
    sourceType:'module'
  })
  const dependencies = {}
  traverse(ast,{
    ImportDeclaration({node}){
      const dirname = path.dirname(filename)
      const newFile = './'+path.join(dirname,node.source.value)
      dependencies[node.source.value] = newFile
    }
  })
  const {code} = babel.transformFromAstSync(ast,null,{
    presets:['@babel/preset-env']
  })
  return {  
    filename,
    dependencies,
    code
  }
}

function getGraph(filename){
  let allModules = [resolveFile(filename)]
  for (let index = 0; index < allModules.length; index++) {
    const {dependencies} = allModules[index];
    for (const key in dependencies) {
      if (dependencies.hasOwnProperty(key)) {
        const element = dependencies[key];
        allModules.push(resolveFile(element))
      }
    }
  }
  const graph = {}
  allModules.forEach(v=>{
    graph[v.filename] = {
      dependencies:v.dependencies,
      code:v.code
    }
  })
  return graph
}
console.log(getGraph('./src/index.js'))