import * as workerTimers from "worker-timers";

export function accurateInterval(fn, time) {
  var cancel, nextAt, timeout, wrapper;

  nextAt = new Date().getTime() + time;
  timeout = null;

  wrapper = function () {
    nextAt += time;
    timeout = workerTimers.setTimeout(wrapper, nextAt - new Date().getTime());
    return fn();
  };

  cancel = function () {
    return workerTimers.clearTimeout(timeout);
  };

  timeout = workerTimers.setTimeout(wrapper, nextAt - new Date().getTime());

  return {
    cancel: cancel
  };
}
