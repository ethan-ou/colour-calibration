import { colourPatches, grayscalePatches, prePatches } from "./patches";
import { accurateInterval } from "./interval";

const backgroundEl = document.getElementById("background");
const statusEl = document.getElementById("status");

const patchesRemaining = document.querySelector(
  `[data-mode="patchesRemaining"]`
);

const state = {
  mode: "colour",
  interval: 500,
  running: false,
  preQueueIdx: 0,
  queueIdx: 0,
  preQueue: [],
  queue: []
};

statusEl.addEventListener("click", (e) => {
  const { mode } = e.target.dataset;

  switch (mode) {
    case "start":
      start();
      break;
    case "stop":
      stop();
      break;
    case "colour":
      changeMode(mode);
      break;
    case "grayscale":
      changeMode(mode);
      break;
    default:
      break;
  }
});

function start() {
  if (state.running === true) {
    return;
  }

  const preStart = () => {
    return new Promise((resolve, reject) => {
      state.preQueue = prePatches();

      const preInterval = accurateInterval(() => {
        if (
          state.running === false ||
          state.preQueueIdx === state.preQueue.length
        ) {
          preInterval.cancel();
          resolve();
        } else {
          backgroundEl.style.backgroundColor =
            state.preQueue[state.preQueueIdx];
          state.preQueueIdx++;
          patchesRemaining.textContent = "Pre-Start";
        }
      }, 1000);
    });
  };

  const onStart = () => {
    return new Promise((resolve, reject) => {
      switch (state.mode) {
        case "colour":
          state.queue = colourPatches();
          break;
        case "grayscale":
          state.queue = grayscalePatches();
          state.queue.push(...grayscalePatches());
          state.queue.push(...grayscalePatches());
          break;
        default:
          break;
      }

      const interval = accurateInterval(() => {
        if (state.running === false || state.queueIdx === state.queue.length) {
          interval.cancel();
          stop();
          resolve();
        } else {
          backgroundEl.style.backgroundColor = state.queue[state.queueIdx];
          state.queueIdx++;

          patchesRemaining.textContent = `${
            state.queue.length - state.queueIdx
          }`;
        }
      }, state.interval);
    });
  };

  state.running = true;

  preStart().then(() => onStart());
}

function stop() {
  state.running = false;
  state.preQueueIdx = 0;
  state.queueIdx = 0;
  backgroundEl.style.backgroundColor = "";

  patchesRemaining.textContent = "Finished";
}

function changeMode(mode) {
  if (state.running === false) {
    state.mode = mode;

    document
      .querySelectorAll("button[data-mode]")
      .forEach((e) => e.classList.remove("active"));
    document.querySelector(`[data-mode="${mode}"]`).classList.add("active");
  }
}

function onLoad() {
  document
    .querySelectorAll("button[data-mode]")
    .forEach((e) => e.classList.remove("active"));
  document.querySelector(`[data-mode="${state.mode}"]`).classList.add("active");
}

onLoad();
