export const colourMode = (number: number): number => Math.pow(number, 3);

export const grayscaleMode = (number: number): number => number;

export type ColorSpace = "srgb" | "display-p3" | "rec2020";

/**
 * Generates a lattice of color patches.
 * Spacing along the RGB channels is linear (no shadow bias).
 */
export function colourPatches(
  quantityPerChannel: number = 16,
  colorSpace: ColorSpace = "display-p3"
): string[] {
  if (quantityPerChannel < 2) {
    throw Error("Quantity per channel cannot be lower than 2.");
  }

  // Create linear steps (No shadow bias)
  const steps = Array.from({ length: quantityPerChannel }, (_, i) => {
    return i / (quantityPerChannel - 1);
  });

  const colours: string[] = [];

  // Build the 3D lattice
  for (let r of steps) {
    for (let g of steps) {
      for (let b of steps) {
        colours.push(createColorString(r, g, b, colorSpace));
      }
    }
  }

  return colours;
}

/**
 * High-resolution grayscale ramp.
 * Spacing is perfectly linear.
 */
export function grayscalePatches(
  quantity: number = 33,
  colorSpace: ColorSpace = "display-p3"
): string[] {
  if (quantity < 2) {
    throw Error("Quantity cannot be lower than 2.");
  }

  const values = Array.from({ length: quantity }, (_, i) => i / (quantity - 1));

  return values.map((v) => createColorString(v, v, v, colorSpace));
}

export function prePatches(quantity: number = 3, colorSpace: ColorSpace = "display-p3"): string[] {
  const colours: string[] = [];
  for (let i = 0; i < quantity; i++) {
    colours.push(createColorString(1, 1, 1, colorSpace));
    colours.push(createColorString(0, 0, 0, colorSpace));
  }
  colours.push(createColorString(1, 1, 1, colorSpace));
  return colours;
}

function createColorString(r: number, g: number, b: number, colorSpace: ColorSpace): string {
  return `color(${colorSpace} ${r.toFixed(6)} ${g.toFixed(6)} ${b.toFixed(6)})`;
}
