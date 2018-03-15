const PENDING = 0;
const FULFILLED = 1;
const REJECTED = 2;

function SimplePromise(fn) {
  let state = PENDING;
  let value = null;
  let deferreds = [];

  this.then = function (onFulfilled, onRejected) {
    return new SimplePromise(function (resolve, reject) {
      // 当promise某一结果状态处理函数完成后，应将bridge promise状态改变，并向其传递结果值
      handle({
        onFulfilled: onFulfilled || null,
        onRejected: onRejected || null,
        resolve: resolve,
        reject: reject
      });
    });
  }

  function handle(deferred) {
    if (state === PENDING) {
      deferreds.push(deferred);
      return;
    }

    let cb = state === FULFILLED ? deferred.onFulfilled : deferred.onRejected;
    // 当前promise一结果状态未注册相应处理函数，则将状态传递
    if (cb === null) {
      cb = state === FULFILLED ? deferred.resolve : deferred.reject;
      cb(value);
      return;
    }

    setTimeout(function () {
      try {
        let ret = cb(value);
        deferred.resolve(ret);
      } catch (e) {
        deferred.reject(e);
      }
    }, 0);

  }

  function finale() {
    // 立刻将这些注册处理方法压入timers queue中
    deferreds.forEach(deferred => handle(deferred));
  }

  function resolve(newValue) {
    // 用于处理方法返回的结果是promise
    if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
      let then = newValue.then;
      if (typeof then === 'function') {
        // bridge promise为了获取方法中返回的promise的结果值，向它注册异步操作后的处理函数
        then.call(newValue, resolve, reject);
        return;
      }
    }

    state = FULFILLED;
    value = newValue;
    finale();
  }

  function reject(reason) {
    state = REJECTED;
    value = reson;
    finale();
  }

  function doResolve(fn, resolve, reject) {
    let done = false;
    try {
      fn(function (value) {
        if (done) return;
        done = true;
        resolve(value);
      }, function (reson) {
        if (done) return;
        done = true;
        reject(reson);
      })
    } catch (e) {
      if (done) return;
      done = true;
      reject(e);
    }
  }

  doResolve(fn, resolve, reject);
}