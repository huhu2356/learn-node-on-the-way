# 事件/异步

* [`[Basic]` Promise](/sections/event-async.md#promise)
* [`[Doc]` Events (事件)](/sections/event-async.md#events)
* [`[Doc]` Event Loop](/sections/event-async.md#Event Loop)
* [`[Point]` 阻塞/异步](/sections/event-async.md#阻塞异步)
* [`[Point]` 并行/并发](/sections/event-async.md#并行并发)

## 简述

异步还是不异步? 这是一个问题.

node里面io是异步的，异步与同步区别在于异步任务之间是独立的，同步任务之间是相互关联，依赖的，例如任务1必须要等任务2执行完才能执行；正是因为异步io才导致不会阻塞js代码（js执行代码是单线程的，但是node本身是多线程的，例如有其他io线程来处理），例如读取文件fs.readFile(file, callback)，js代码执行这个异步操作，然后交由其他线程去读取文件，本身js执行线程继续执行接下来的其他代码，当读取文件完毕后会发送一个事件，然后将事件处理函数即listener放入queue中等待执行；

[Asynchronous vs synchronous execution, what does it really mean?](https://stackoverflow.com/questions/748175/asynchronous-vs-synchronous-execution-what-does-it-really-mean)
[When is JavaScript synchronous?](https://stackoverflow.com/questions/2035645/when-is-javascript-synchronous)

## Promise

基础知识：MDN

> <a name="q-1"></a> Promise 中 .then 的第二参数与 .catch 有什么区别?

[Promise : then vs then + catch](https://stackoverflow.com/questions/33278280/promise-then-vs-then-catch)
[When is .then(success, fail) considered an antipattern for promises?](https://stackoverflow.com/questions/24662289/when-is-thensuccess-fail-considered-an-antipattern-for-promises)


另外关于同步与异步, 有个问题希望大家看一下, 这是很简单的 Promise 的使用例子:

```javascript
let doSth = new Promise((resolve, reject) => {
  console.log('hello');
  resolve();
});

doSth.then(() => {
  console.log('over');
});
```

毫无疑问的可以得到一下输出结果:

```
hello
over
```

但是首先的问题是, 该 Promise 封装的代码肯定是同步的, 那么这个 then 的执行是异步的吗?
then的执行是异步的，后面再加个console.log('xxx')可以测试

其次的问题是, 如下代码, `setTimeout` 到 10s 之后再 `.then` 调用, 那么 `hello` 是会在 10s 之后在打印吗, 还是一开始就打印? hello一开始就打印

```javascript
let doSth = new Promise((resolve, reject) => {
  console.log('hello');
  resolve();
});

setTimeout(() => {
  doSth.then(() => {
    console.log('over');
  })
}, 10000);
```

以及理解如下代码的执行顺序 ([出处](https://zhuanlan.zhihu.com/p/25407758)):

```javascript
setTimeout(function() {
  console.log(1)
}, 0);
new Promise(function executor(resolve) {
  console.log(2);
  for( var i=0 ; i<10000 ; i++ ) {
    i == 9999 && resolve();
  }
  console.log(3);
}).then(function() {
  console.log(4);
});
console.log(5);
```

我对4和1的顺序存在疑问，个人觉得执行顺序不是应该考虑promise具体实现中resolve和reject方法是用什么实现的吗？setTimeout or process.nextTick or ???

Promise简单实现

[规范](https://promisesaplus.com/)
[Stack Overflow上一个老哥的实现](https://www.promisejs.org/implementing/)
主要参考美团上一个老哥的实现[剖析 Promise 之基础篇](https://tech.meituan.com/promise-insight.html),
之前提出的[问题](https://cnodejs.org/topic/5a5f05549288dc8153287ee6#5a5f08e79288dc8153287ee8)

修改后---->[传送门](/sections/simple_promise.js)

如何把callback转换为promise呢？
[How do I convert an existing callback API to promises?](https://stackoverflow.com/questions/22519784/how-do-i-convert-an-existing-callback-api-to-promises)

async await
基础：MDN
[6 Reasons Why JavaScript’s Async/Await Blows Promises Away (Tutorial)](https://hackernoon.com/6-reasons-why-javascripts-async-await-blows-promises-away-tutorial-c7ec10518dd9)

## Events

`Events` 是 Node.js 中一个非常重要的 core 模块, 在 node 中有许多重要的 core API 都是依赖其建立的. 比如 `Stream` 是基于 `Events` 实现的, 而 `fs`, `net`, `http` 等模块都依赖 `Stream`, 所以 `Events` 模块的重要性可见一斑.

通过继承 EventEmitter 来使得一个类具有 node 提供的基本的 event 方法, 这样的对象可以称作 emitter, 而触发(emit)事件的 cb 则称作 listener. 

> <a name="q-2"></a> Eventemitter 的 emit 是同步还是异步?

Node.js 中 Eventemitter 的 emit 是同步的. 在官方文档中有说明:

> The EventListener calls all listeners synchronously in the order in which they were registered. This is important to ensure the proper sequencing of events and to avoid race conditions or logic errors.

另外, 可以讨论如下的执行结果是输出 `hi 1` 还是 `hi 2`?
hi 1 
hi 2

```javascript
const EventEmitter = require('events');

let emitter = new EventEmitter();

emitter.on('myEvent', () => {
  console.log('hi 1');
});

emitter.on('myEvent', () => {
  console.log('hi 2');
});

emitter.emit('myEvent');
```

或者如下情况是否会死循环? 会死循环

```javascript
const EventEmitter = require('events');

let emitter = new EventEmitter();

emitter.on('myEvent', () => {
  console.log('hi');
  emitter.emit('myEvent');
});

emitter.emit('myEvent');
```

以及这样会不会死循环? 不会死循环,新注册的myEvent监听器要等下一个myEvent事件才会触发

```javascript
const EventEmitter = require('events');

let emitter = new EventEmitter();

emitter.on('myEvent', function sth () {
  emitter.on('myEvent', sth);
  console.log('hi');
});

emitter.emit('myEvent');
```

## 阻塞/异步

> <a name="q-3"></a> 如何判断接口是否异步? 是否只要有回调函数就是异步? 

看文档或者console.log打印看下情况，如果开发者自己调用回调函数则并不会异步，node中的异步IO和非IO的异步API（setTimeout等）为异步。

> 有这样一个场景, 你在线上使用 koa 搭建了一个网站, 这个网站项目中有一个你同事写的接口 A, 而 A 接口中在特殊情况下会变成死循环. 那么首先问题是, 如果触发了这个死循环, 会对网站造成什么影响?

Node.js 中执行 js 代码的过程是单线程的. 只有当前代码都执行完, 才会切入事件循环, 然后从事件队列中 pop 出下一个回调函数开始执行代码. 所以 ① 实现一个 sleep 函数, 只要通过一个死循环就可以阻塞整个 js 的执行流程. (关于如何避免坑爹的同事写出死循环, 在后面的测试环节有写到.)

> <a name="q-5"></a> 如何实现一个 sleep 函数? ①

[What is the JavaScript version of sleep()?](https://stackoverflow.com/questions/951021/what-is-the-javascript-version-of-sleep)

```javascript
function sleep(ms) {
  var start = Date.now(), expire = start + ms;
  while (Date.now() < expire) ;
  return;
}

使用async await
async function init(){
  console.log(1)
  await sleep(1000)
  console.log(2)
}
function sleep(ms){
   return new Promise(resolve=>{
       setTimeout(resolve,ms)
   })
}
```

如果在线上的网站中出现了死循环的逻辑被触发, 整个进程就会一直卡在死循环中, 如果没有多进程部署的话, 之后的网站请求全部会超时, js 代码没有结束那么事件队列就会停下等待不会执行异步, 整个网站无法响应.

> <a name="q-6"></a> 如何实现一个异步的 reduce? (注:不是异步完了之后同步 reduce)

需要了解 reduce 的情况, 是第 n 个与 n+1 的结果异步处理完之后, 在用新的结果与第 n+2 个元素继续依次异步下去. 不贴答案, 期待诸君的版本.

## Event Loop

```
   ┌───────────────────────┐
┌─>│        timers         │
│  └──────────┬────────────┘
│  ┌──────────┴────────────┐
│  │     I/O callbacks     │
│  └──────────┬────────────┘
│  ┌──────────┴────────────┐
│  │     idle, prepare     │
│  └──────────┬────────────┘      ┌───────────────┐
│  ┌──────────┴────────────┐      │   incoming:   │
│  │         poll          │<─────┤  connections, │
│  └──────────┬────────────┘      │   data, etc.  │
│  ┌──────────┴────────────┐      └───────────────┘
│  │        check          │
│  └──────────┬────────────┘
│  ┌──────────┴────────────┐
└──┤    close callbacks    │
   └───────────────────────┘
```

关于事件循环, Timers 以及 nextTick 的关系详见官方文档 The Node.js Event Loop, Timers, and process.nextTick(): [英文](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)

[setImmediate() vs nextTick() vs setTimeout(fn,0) – in depth explanation](http://voidcanvas.com/setimmediate-vs-nexttick-vs-settimeout/)

Callback execution is part of core JavaScript. V8 or other javascript engines handle that.
Event loop is not part of the javascript engine. It is developed separately by the consumer (by consumer I mean node, google-chrome etc).
I/O is for internal input outputs... like file reading etc. Poll is for user http requests.

主要结合官方文档和上面那个老哥的文章
Timer: It handles the callbacks assigned by setTimeout & setInterval after the given time threshold is completed. 
I/O callbacks: Handles all callbacks except the ones set by setTimeout, setInterval & setImmediate. It also does not have any close callbacks. 处理IO回调，例如file reading;
Idle, prepare: Used internally. 
Pole: Retrieve new I/O events. 例如http request；
Check: Here the callbacks of setImmediate() is handled. 
Close callbacks: Handles close connection callbacks etc. (eg: socket connection close) 
nextTickQueue: Holds the callbacks of process.nextTick(); but not a part of the event loop.


## 并行/并发

并行 (Parallel) 与并发 (Concurrent) 是两个很常见的概念.

[Concurrency vs Parallelism - What is the difference?](https://stackoverflow.com/questions/1050222/concurrency-vs-parallelism-what-is-the-difference)

![con_and_par](http://joearms.github.io/images/con_and_par.jpg)

并发 (Concurrent) = 2 队列对应 1 咖啡机.

并行 (Parallel) = 2 队列对应 2 咖啡机.

Node.js 通过事件循环来挨个抽取事件队列中的一个个 Task 执行, 从而避免了传统的多线程情况下 `2个队列对应 1个咖啡机` 的时候上线文切换以及资源争抢/同步的问题, 所以获得了高并发的成就.

至于在 node 中并行, 你可以通过 cluster 来再添加一个咖啡机.
