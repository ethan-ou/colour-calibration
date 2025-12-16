import { colourPatches, grayscalePatches, prePatches, type ColorSpace } from "./patches";
import { accurateInterval } from "./interval";

const backgroundEl = document.getElementById("background") as HTMLElement;
const statusEl = document.getElementById("status") as HTMLElement;
const colorSpaceSelect = document.getElementById("colorSpace") as HTMLSelectElement;

const patchesRemaining = document.querySelector(`[data-mode="patchesRemaining"]`) as HTMLElement;

type Mode = "colour" | "grayscale";

interface State {
  mode: Mode;
  colorSpace: ColorSpace;
  interval: number;
  running: boolean;
  preQueueIdx: number;
  queueIdx: number;
  preQueue: string[];
  queue: string[];
}

const state: State = {
  mode: "colour",
  colorSpace: "srgb",
  interval: 500,
  running: false,
  preQueueIdx: 0,
  queueIdx: 0,
  preQueue: [],
  queue: [],
};

statusEl.addEventListener("click", (e) => {
  const target = e.target as HTMLElement;
  const { mode } = target.dataset;

  switch (mode) {
    case "start":
      start();
      break;
    case "stop":
      stop();
      break;
    case "colour":
      changeMode(mode as Mode);
      break;
    case "grayscale":
      changeMode(mode as Mode);
      break;
    default:
      break;
  }
});

colorSpaceSelect.addEventListener("change", (e) => {
  const target = e.target as HTMLSelectElement;
  changeColorSpace(target.value as ColorSpace);
});

function start() {
  if (state.running === true) {
    return;
  }

  const preStart = () => {
    return new Promise<void>((resolve) => {
      state.preQueue = prePatches(3, state.colorSpace);

      const preInterval = accurateInterval(() => {
        if (state.running === false || state.preQueueIdx === state.preQueue.length) {
          preInterval.cancel();
          resolve();
        } else {
          backgroundEl.style.backgroundColor = state.preQueue[state.preQueueIdx];
          state.preQueueIdx++;
          patchesRemaining.textContent = "Pre-Start";
        }
      }, 1000);
    });
  };

  const onStart = () => {
    return new Promise<void>((resolve) => {
      switch (state.mode) {
        case "colour":
          state.queue = colourPatches(4096, state.colorSpace);
          break;
        case "grayscale":
          state.queue = grayscalePatches(33, state.colorSpace);
          state.queue.push(...grayscalePatches(33, state.colorSpace));
          state.queue.push(...grayscalePatches(33, state.colorSpace));
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

          patchesRemaining.textContent = `${state.queue.length - state.queueIdx}`;
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

function changeMode(mode: Mode) {
  if (state.running === false) {
    state.mode = mode;

    document.querySelectorAll("button[data-mode]").forEach((e) => e.classList.remove("active"));
    document.querySelector(`[data-mode="${mode}"]`)?.classList.add("active");
  }
}

function changeColorSpace(colorSpace: ColorSpace) {
  if (state.running === false) {
    state.colorSpace = colorSpace;
  }
}

function onLoad() {
  document.querySelectorAll("button[data-mode]").forEach((e) => e.classList.remove("active"));
  document.querySelector(`[data-mode="${state.mode}"]`)?.classList.add("active");
  colorSpaceSelect.value = state.colorSpace;
}

onLoad();
