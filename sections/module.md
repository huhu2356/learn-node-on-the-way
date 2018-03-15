# 模块

* [`[Basic]` 模块机制](#模块机制)
* [`[Basic]` 热更新](#热更新)
* [`[Basic]` 上下文](#上下文)
* [`[Basic]` 包管理](#包管理)

## 模块机制

务必仔细看下** [module的文档] **(https://nodejs.org/api/modules.html) 

node的模块机制是基于 [`CommonJS`](http://javascript.ruanyifeng.com/nodejs/module.html) 规范的，同步加载模块;

在node中引入模块，需要经历3个步骤：1.路径分析 2.文件定位 3.编译执行

node分为核心模块和文件模块（用户定义），部分核心模块会在node进程开始时被以二进制文件形式加载进内存；

模块优先从缓存加载；且如果缓存里没有，就会对模块进行路径分析，即通过require的中模块标识符传递给require.resolve()获取模块绝对路径定位文件，然后编译执行完，以文件模块真实路径为索引，将编译执行后的结果放到缓存中；

node里每个文件都是一个独立的模块，每个module都被modoule wrapper给包装了一层;

```
(function(exports, require, module, __filename, __dirname) {
// Module code actually lives in here
});
```

[module.exports 和 exports 的区别](https://stackoverflow.com/questions/7137397/module-exports-vs-exports-in-node-js),在每个模块里最顶层this指module.exports，且该模块实际导出的module.exports

避免cyclic dependencies问题，可以[Just make sure your necessary exports are defined before you require a file with a circular dependency](https://stackoverflow.com/questions/10869276/how-to-deal-with-cyclic-dependencies-in-node-js).

module里的this指的是module.exports对象；
[Meaning of “this” in node.js modules and functions](https://stackoverflow.com/questions/22770299/meaning-of-this-in-node-js-modules-and-functions)

[In what scope are module variables stored in node.js?](https://stackoverflow.com/questions/15406062/in-what-scope-are-module-variables-stored-in-node-js)

[How to use global variable in node.js?](https://stackoverflow.com/questions/10987444/how-to-use-global-variable-in-node-js)

[Why does a module level return statement work in Node.js?](https://stackoverflow.com/questions/28955047/why-does-a-module-level-return-statement-work-in-node-js/28955050#28955050)

[为什么 Node.js 不给每一个.js文件以独立的上下文来避免作用域被污染?](https://www.zhihu.com/question/57375179/answer/152633354)

module.require不等于require, require是在module.require的基础上又增加了一些新的属性，例如require.resolve,require.main,具体可参考[源码](https://github.com/nodejs/node-v0.x-archive/blob/ef4344311e19a4f73c031508252b21712b22fe8a/lib/module.js#L364)；

module.exports must be done immediately. It cannot be done in any callbacks;

```javascript
function require(/* ... */) {
  const module = { exports: {} };
  ((module, exports) => {
    // Module code here. In this example, define a function.
    function someFunc() {}
    exports = someFunc;
    // At this point, exports is no longer a shortcut to module.exports, and
    // this module will still export an empty default object.
    module.exports = someFunc;
    // At this point, the module will now export someFunc, instead of the
    // default object.
  })(module, module.exports);
  return module.exports;
}
```

```javascript
// b.js
(function (exports, require, module, __filename, __dirname) {
  t = 111;
})();

// a.js
(function (exports, require, module, __filename, __dirname) {
  // ...
  console.log(t); // 111
})();
```

## 热更新

[Node监视文件以实现热更新](https://ngtmuzi.com/Node%E7%9B%91%E8%A7%86%E6%96%87%E4%BB%B6%E4%BB%A5%E5%AE%9E%E7%8E%B0%E7%83%AD%E6%9B%B4%E6%96%B0/)

[Node.js Web应用代码热更新的另类思路](http://fex.baidu.com/blog/2015/05/nodejs-hot-swapping/)

## 上下文

```javascript
'use strict';
const vm = require('vm');

let code =
`(function(require) {

  const http = require('http');

  http.createServer( (request, response) => {
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.end('Hello World\\n');
  }).listen(8124);

  console.log('Server running at http://127.0.0.1:8124/');
})`;

vm.runInThisContext(code)(require);
```

正常情况下每个node进程只有一个上下文，即一个global对象;vm提供一个新的上下文，即创建一个sandbox对象，代码在sandbox对象下运行，不会污染外部上下文；

## 包管理

left-pad事件