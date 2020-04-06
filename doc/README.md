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