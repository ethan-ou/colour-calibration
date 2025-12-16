export const colourMode = (number: number): number => Math.pow(number, 3);

export const grayscaleMode = (number: number): number => number;

export type ColorSpace =
  | "srgb"
  | "srgb-linear"
  | "display-p3"
  | "display-p3-linear"
  | "rec2020"
  | "rec2100-pq"
  | "rec2100-hlg"
  | "rec2100-linear";

export function colourPatches(
  quantityPerChannel: number = 16,
  colorSpace: ColorSpace = "srgb"
): string[] {
  if (quantityPerChannel < 2) {
    throw Error("Quantity per channel cannot be lower than 2.");
  }

  const values = createChannelValues(quantityPerChannel);

  const colours: string[] = [];

  for (let r = 0; r < values.length; r++) {
    for (let g = 0; g < values.length; g++) {
      for (let b = 0; b < values.length; b++) {
        colours.push(createColorString(values[r], values[g], values[b], colorSpace));
      }
    }
  }

  return colours;
}

export function grayscalePatches(quantity: number = 33, colorSpace: ColorSpace = "srgb"): string[] {
  if (quantity < 2) {
    throw Error("Quantity cannot be lower than 2.");
  }

  const values = createChannelValues(quantity);
  return values.map((value) => createColorString(value, value, value, colorSpace));
}

export function prePatches(quantity: number = 3, colorSpace: ColorSpace = "srgb"): string[] {
  const colours: string[] = [];

  for (let i = 0; i < quantity; i++) {
    colours.push(createColorString(1, 1, 1, colorSpace));
    colours.push(createColorString(0, 0, 0, colorSpace));
  }

  colours.push(createColorString(1, 1, 1, colorSpace));

  return colours;
}

function createColorString(r: number, g: number, b: number, colorSpace: ColorSpace): string {
  // Always emit the CSS color() functional notation using predefined RGB color spaces.
  // Channels are represented as 0-1 numbers (use toFixed to keep output compact/consistent).
  return `color(${colorSpace} ${r.toFixed(6)} ${g.toFixed(6)} ${b.toFixed(6)})`;
}

function createChannelValues(quantity: number): number[] {
  const values: number[] = [];

  // For color() function, values are always 0-1
  for (let i = 0; i < quantity; i++) {
    const value = i / (quantity - 1);
    values.push(value);
  }

  return values;
}
