## webpack要做的事情
1. 利用babel完成代码转换，生成依赖
2. 生成依赖图谱
3. 生成可执行文件
## 安装依赖
1. babel相关
   1. @babel/parser
      1. 生成AST抽象语法树
   2. @babel/traverse
      1. 进行AST遍历
      2. 记录依赖关系
   3. @babel/core @babel/preset-env
      1. 进行代码的转换
## 编写代码
1. resolveFile
   1. 写一个解析文件的函数f
      1. 传入文件路径
      2. 返回对象
         1. 文件名
         2. 依赖
            1. 数组
               1. 依赖的文件名（包含路径）
               2. 需要把模块中引用的相对路径转成适合f使用的路径
                  1. 后面会多次使用函数f
         3. 转换后的代码
            1. babel转换
2. 生成依赖图谱
   1. 是一个所有模块的汇总
      1. obj
         1. key为每个模块的绝对路径
            1. 需要经过计算获得
               1. 因为模块之间引用可能是相对路径
         2. value中要有该模块的dependencies
            1. 形如 {./message.js: "./src\message.js"}
            2. 执行localRequire函数的本质 
               1. 由相对路径a找到绝对路径b
               2. 把b作为参数
                  1. 执行reuire函数
3. 根据模板生成可执行代码
   1. [模板](./dist.js)
##　生成的代码分析
1. index.js
   1. [require](./dist2.js)
   2. 使用到require为模板中的localRequire
      1. var _message = _interopRequireDefault(require("./message.js"));
   ```js
   function localRequire(relativePath) {
      return require(graph[module].dependencies[relativePath]);
    }
   ``` 
2. [export](./dist3.js)
