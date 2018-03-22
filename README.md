# Node study

学习js和node差不多两月有余，哈，为了准备出去搬砖，遂将这段时间的学习感想记录一下，一来是回顾（~~自娱自乐~~），二来是方便以后查看~~那年今日的自己是多么傻逼~~


## javascript

- JavaScript DOM编程艺术（第2版） 逼乎推荐的入门书籍，感觉看了没啥卵用，愚蠢的书籍，浪费一周阅读的时间，建议烧掉

- js高程，1-7章，知识点讲的有点细，不过6，7两章关于原型的概念到是讲的不错

- [javascriptissexy系列](http://javascriptissexy.com) 不错，每篇文章差不多讲了一个概念，scope，closure，hosting，this等

- 深入理解ES6，看了部分篇章吧，感觉有些章节不知道是本身讲的不好，还是翻译有问题，总觉的理解的不是很到位（~~莫非是自己智障~~）

## 异步编程

这一块感觉是最有意思的地方了，从callback，到promise，再到async await，每一部分的基础用法参考MDN，此外需要做一些稍微深入的理解，当然最好能知道每种方式的原理和优劣了

（以下纯属个人瞎比比，可能有误）
首先要明确callback, promise, async await都只是实现异步编程的一种方式，例如callback完全可以同步执行。

先从callback说起吧，callback感觉利用了function is object这一特点，使得函数能被当作参数传给另一个函数，并且在另一个函数中执行，这也是callback本身的定义。例如我向某服务器发送一个请求，获取响应后，我再根据响应数据来进行后续处理，这样的话，需要把后面的所有逻辑代码封装到一个函数里面去，作为参数传给请求api。如果后面有第二个异步请求依赖于第一个请求返回的结果，则会嵌套进去，若多次这样嵌套则会形成callback hell。

还有一点是后续处理的代码居然传给了请求api，现在我需要把这控制权拿回来，也就是控制反转，那么使用promise即可。

promise相当于在原先异步请求api中，填充了resolve和reject占位符，等其自身状态改变后，调用通过then方法注册的函数（该函数也就是后续处理的代码）。promise本身就是一个state machine，感觉最为巧妙的一点是利用了bridge promise，从而造成其可以链式调用。

具体见[promise实现](/code/simple_promise.js)，参考美团上一个老哥的文章[剖析 Promise 之基础篇](https://tech.meituan.com/promise-insight.html)，不过个人觉得他文章里面有个地方有严重问题，我对之进行了改动（改动结果不确定），见[问题](https://cnodejs.org/topic/5a5f05549288dc8153287ee6#5a5f08e79288dc8153287ee8)

为何有了promise，还要有async await呢，见[6 Reasons Why JavaScript’s Async/Await Blows Promises Away (Tutorial)](https://hackernoon.com/6-reasons-why-javascripts-async-await-blows-promises-away-tutorial-c7ec10518dd9)

根据MDN介绍，async await其功能类似generator + yield promise，强烈推荐[ES6 Generators: Complete Series](https://davidwalsh.name/es6-generators)系列，目前只看了前三篇，感觉讲的非常好

## node api

这里根据[Eleme node interview](https://github.com/ElemeFE/node-interview/tree/master/sections/zh-cn)大纲来学习，目前只看了3篇半，主要依据其大纲和问题发散，然后来进行填充。

😔看到os那块真心吃力，有空了想好好撸门CSAPP

作为萌新，对里面一些不太好理解的或重要的知识点，补充了一些对stackoverflow问题的引用，以及一些blog文章

- [common](/sections/common.md) 引生出内容太吉尔多了，日后慢慢看
- [module](/sections/module.md) 嗯哼
- [event-async](/sections/event-async.md) 异步不异步 这是一个问题 值得进一步研究学习哟 
- [io](/sections/io.md) 流是个好东西 可惜了 不太会呀 源码什么的看来还是值得以后搞搞的呀
- [process](/sections/process.md) 只能看懂一丢丢 遂 卒 ~~~

## 数据结构和算法

leetcode和CC169，道阻且长。。。

## reference

学习道路中看过的一些不错的stackoverflow问题和blog文章整理（~~整理个毛线~~）







