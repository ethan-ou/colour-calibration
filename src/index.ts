import { colourPatches, prePatches, type ColorSpace } from "./patches";
import { accurateInterval } from "./interval";

const backgroundEl = document.getElementById("background") as HTMLElement;
const statusEl = document.getElementById("status") as HTMLElement;
const colorSpaceSelect = document.getElementById("colorSpace") as HTMLSelectElement;
const colourPatchesPerChannelSelect = document.getElementById(
  "colourPatchesPerChannel"
) as HTMLSelectElement;
const colourPatchesInfo = document.getElementById("colourPatchesInfo") as HTMLElement;
const fullscreenButton = document.getElementById("fullscreenButton") as HTMLButtonElement;
const settingsButton = document.getElementById("settingsButton") as HTMLButtonElement;
const settingsDialog = document.getElementById("settingsDialog") as HTMLDialogElement;
const closeDialogButton = document.getElementById("closeDialog") as HTMLButtonElement;

const patchesRemaining = document.querySelector(`[data-mode="patchesRemaining"]`) as HTMLElement;

interface State {
  colorSpace: ColorSpace;
  colourPatchesPerChannel: number;
  interval: number;
  running: boolean;
  preQueueIdx: number;
  queueIdx: number;
  preQueue: string[];
  queue: string[];
}

const state: State = {
  colorSpace: getWidestColorSpace(),
  colourPatchesPerChannel: 20,
  interval: 200,
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

function getWidestColorSpace(): ColorSpace {
  // Check for Rec. 2020 support
  if (window.matchMedia("(color-gamut: rec2020)").matches) {
    return "rec2020";
  }
  // Check for P3 support
  if (window.matchMedia("(color-gamut: p3)").matches) {
    return "display-p3";
  }
  // Fallback to sRGB
  return "srgb";
}

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
      state.queue = colourPatches(state.colourPatchesPerChannel, state.colorSpace);

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

function updateColourPatchesInfo() {
  const totalPatches = Math.pow(state.colourPatchesPerChannel, 3);
  // Add 7 seconds for pre-start phase (3 white/black cycles + 1 white at 1s each = 7s)
  const estimatedTime = (totalPatches * state.interval) / 1000 + 7;
  const minutes = Math.floor(estimatedTime / 60);
  const seconds = Math.round(estimatedTime % 60);

  colourPatchesInfo.textContent = `${totalPatches.toLocaleString()} total patches (~${minutes}m ${seconds}s)`;
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
  colorSpaceSelect.value = state.colorSpace;
  colourPatchesPerChannelSelect.value = state.colourPatchesPerChannel.toString();
  updateColourPatchesInfo();
}

onLoad();
