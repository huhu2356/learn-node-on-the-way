# 进程

* [`[Doc]` Process (进程)](/sections/process.md#process)

## Process

Node.js的process是全局变量, 具体的细节见[官方文档](https://nodejs.org/docs/latest-v9.x/api/process.html)

### process.nextTick

上一节已经提到过 `process.nextTick` 了, 这是一个你需要了解的, 重要的, 基础方法.

[文档](https://nodejs.org/docs/latest-v9.x/api/process.html#process_process_nexttick_callback_args)

The process.nextTick() method adds the callback to the "next tick queue". Once the current turn of the event loop turn runs to completion, all callbacks currently in the next tick queue will be called.

This is not a simple alias to setTimeout(fn, 0). It is much more efficient. It runs before any additional I/O events (including timers) fire in subsequent ticks of the event loop.

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

`process.nextTick` 并不属于 Event loop 中的某一个阶段, 而是在 Event loop 的每一个阶段结束后, 直接执行 `nextTickQueue` 中插入的 "Tick", 并且直到整个 Queue 处理完. 所以面试时又有可以问的问题了, 递归调用 process.nextTick 会怎么样? (doge

官方文档里给出了解答：
Note: The next tick queue is completely drained on each pass of the event loop before additional I/O is processed. As a result, recursively setting nextTick callbacks will block any I/O from happening, just like a while(true); loop.

process.nextTick()在当前操作执行完后就会被立即执行；

```javascript
function test() { 
  process.nextTick(() => test());
}
```

这种情况与以下情况, 有什么区别? 为什么?

两者都会一直循环下去，但是process.nextTick()会阻塞任何IO回调函数执行，即阻塞event loop，
而setTimeout()不会，另外setImmediate()也不会阻塞；

```javascript
function test() { 
  setTimeout(() => test(), 0);
}
```

### 配置

> <a name="q-cwd"></a> 进程的当前工作目录是什么? 有什么作用?

当前进程启动的目录, 通过 process.cwd() 获取当前工作目录 (current working directory), 通常是命令行启动的时候所在的目录, 文件操作等使用相对路径的时候会相对当前工作目录来获取文件.

一些获取配置的第三方模块就是通过你的当前目录来找配置文件的. 所以如果你错误的目录启动脚本, 可能没法得到正确的结果. 在程序中可以通过 `process.chdir()` 来改变当前的工作目录.

### 标准流

在 process 对象上还暴露了 `process.stderr`, `process.stdout` 以及 `process.stdin` 三个标准流, 常见的面试问题是问 **console.log 是同步还是异步? 如何实现一个 console.log?** [参考](https://nodejs.org/docs/latest-v9.x/api/process.html#process_a_note_on_process_i_o),但奇怪的是我在win10下测试了终端console.log输出为何是同步的呢，按文档里讲ttys情况下是异步的。。。