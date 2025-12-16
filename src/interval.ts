import * as workerTimers from "worker-timers";

interface IntervalControl {
  cancel: () => void;
}

export function accurateInterval(fn: () => void, time: number): IntervalControl {
  let nextAt = new Date().getTime() + time;
  let timeout: ReturnType<typeof workerTimers.setTimeout> | null = null;

  const wrapper = function () {
    nextAt += time;
    timeout = workerTimers.setTimeout(wrapper, nextAt - new Date().getTime());
    return fn();
  };

  const cancel = function () {
    if (timeout !== null) {
      return workerTimers.clearTimeout(timeout);
    }
  };

  timeout = workerTimers.setTimeout(wrapper, nextAt - new Date().getTime());

  return {
    cancel: cancel,
  };
}
