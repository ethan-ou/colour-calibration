import { colourPatches, grayscalePatches, prePatches, type ColorSpace } from "./patches";
import { accurateInterval } from "./interval";

const backgroundEl = document.getElementById("background") as HTMLElement;
const statusEl = document.getElementById("status") as HTMLElement;
const colorSpaceSelect = document.getElementById("colorSpace") as HTMLSelectElement;
const colourPatchesPerChannelSelect = document.getElementById(
  "colourPatchesPerChannel"
) as HTMLSelectElement;
const grayscalePatchesSelect = document.getElementById("grayscalePatches") as HTMLSelectElement;
const colourPatchesInfo = document.getElementById("colourPatchesInfo") as HTMLElement;
const grayscalePatchesInfo = document.getElementById("grayscalePatchesInfo") as HTMLElement;
const fullscreenButton = document.getElementById("fullscreenButton") as HTMLButtonElement;
const settingsButton = document.getElementById("settingsButton") as HTMLButtonElement;
const settingsDialog = document.getElementById("settingsDialog") as HTMLDialogElement;
const closeDialogButton = document.getElementById("closeDialog") as HTMLButtonElement;

const patchesRemaining = document.querySelector(`[data-mode="patchesRemaining"]`) as HTMLElement;

type Mode = "colour" | "grayscale";

interface State {
  mode: Mode;
  colorSpace: ColorSpace;
  colourPatchesPerChannel: number;
  grayscalePatches: number;
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
  colourPatchesPerChannel: 16,
  grayscalePatches: 32,
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
    default:
      break;
  }
});

settingsDialog.addEventListener("click", (e) => {
  const target = e.target as HTMLElement;
  const { mode } = target.dataset;

  switch (mode) {
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

fullscreenButton.addEventListener("click", () => {
  toggleFullscreen();
});

settingsButton.addEventListener("click", () => {
  settingsDialog.showModal();
});

closeDialogButton.addEventListener("click", () => {
  settingsDialog.close();
});

colorSpaceSelect.addEventListener("change", (e) => {
  const target = e.target as HTMLSelectElement;
  changeColorSpace(target.value as ColorSpace);
});

colourPatchesPerChannelSelect.addEventListener("change", (e) => {
  const target = e.target as HTMLSelectElement;
  changeColourPatchesPerChannel(parseInt(target.value));
});

grayscalePatchesSelect.addEventListener("change", (e) => {
  const target = e.target as HTMLSelectElement;
  changeGrayscalePatches(parseInt(target.value));
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
          state.queue = colourPatches(state.colourPatchesPerChannel, state.colorSpace);
          break;
        case "grayscale":
          state.queue = grayscalePatches(state.grayscalePatches, state.colorSpace);
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

    settingsDialog
      .querySelectorAll("button[data-mode]")
      .forEach((e) => e.classList.remove("active"));
    settingsDialog.querySelector(`[data-mode="${mode}"]`)?.classList.add("active");
  }
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch((err) => {
      console.error(`Error attempting to enable fullscreen: ${err.message}`);
    });
    fullscreenButton.textContent = "Exit Fullscreen";
  } else {
    document.exitFullscreen();
    fullscreenButton.textContent = "Fullscreen";
  }
}

// Update button text when fullscreen changes (e.g., via ESC key)
document.addEventListener("fullscreenchange", () => {
  if (document.fullscreenElement) {
    fullscreenButton.textContent = "Exit Fullscreen";
  } else {
    fullscreenButton.textContent = "Fullscreen";
  }
});

function changeColorSpace(colorSpace: ColorSpace) {
  if (state.running === false) {
    state.colorSpace = colorSpace;
  }
}

function changeColourPatchesPerChannel(quantity: number) {
  if (state.running === false) {
    state.colourPatchesPerChannel = quantity;
    updateColourPatchesInfo();
  }
}

function changeGrayscalePatches(quantity: number) {
  if (state.running === false) {
    state.grayscalePatches = quantity;
    updateGrayscalePatchesInfo();
  }
}

function updateColourPatchesInfo() {
  const totalPatches = Math.pow(state.colourPatchesPerChannel, 3);
  const estimatedTime = (totalPatches * state.interval) / 1000;
  const minutes = Math.floor(estimatedTime / 60);
  const seconds = Math.round(estimatedTime % 60);

  colourPatchesInfo.textContent = `${totalPatches.toLocaleString()} total patches (~${minutes}m ${seconds}s)`;
}

function updateGrayscalePatchesInfo() {
  const totalPatches = state.grayscalePatches;
  const estimatedTime = (totalPatches * state.interval) / 1000;
  const minutes = Math.floor(estimatedTime / 60);
  const seconds = Math.round(estimatedTime % 60);

  grayscalePatchesInfo.textContent = `${totalPatches.toLocaleString()} total patches (~${minutes}m ${seconds}s)`;
}

function updateColorSpaceOptions() {
  const options = colorSpaceSelect.querySelectorAll("option");

  // Check for P3 support
  const supportsP3 = window.matchMedia("(color-gamut: p3)").matches;

  // Check for Rec. 2020 support
  const supportsRec2020 = window.matchMedia("(color-gamut: rec2020)").matches;

  options.forEach((option) => {
    const gamut = option.getAttribute("data-gamut");

    if (gamut === "p3" && !supportsP3) {
      option.disabled = true;
      option.textContent += " (Not Supported)";
    } else if (gamut === "rec2020" && !supportsRec2020) {
      option.disabled = true;
      option.textContent += " (Not Supported)";
    }
  });

  // If current selection is disabled, fallback to sRGB
  const currentOption = colorSpaceSelect.querySelector(
    `option[value="${state.colorSpace}"]`
  ) as HTMLOptionElement;
  if (currentOption && currentOption.disabled) {
    state.colorSpace = "srgb";
    colorSpaceSelect.value = "srgb";
  }
}

function onLoad() {
  updateColorSpaceOptions();
  settingsDialog.querySelectorAll("button[data-mode]").forEach((e) => e.classList.remove("active"));
  settingsDialog.querySelector(`[data-mode="${state.mode}"]`)?.classList.add("active");
  colorSpaceSelect.value = state.colorSpace;
  colourPatchesPerChannelSelect.value = state.colourPatchesPerChannel.toString();
  grayscalePatchesSelect.value = state.grayscalePatches.toString();
  updateColourPatchesInfo();
  updateGrayscalePatchesInfo();
}

onLoad();
