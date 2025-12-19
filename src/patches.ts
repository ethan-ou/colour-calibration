export const colourMode = (number: number): number => Math.pow(number, 3);

export const grayscaleMode = (number: number): number => number;

export type ColorSpace = "srgb" | "display-p3" | "rec2020";

/**
 * Generates a lattice of color patches with a radial warp toward the achromatic axis.
 * Spacing along the RGB channels is linear (no shadow bias),
 * but points are "pinched" toward the neutral line to stabilize inter-camera matching.
 */
export function colourPatches(
  quantityPerChannel: number = 16,
  colorSpace: ColorSpace = "display-p3",
  radialPinch: number = 2 // Values > 1 densify achromatic steps
): string[] {
  if (quantityPerChannel < 2) {
    throw Error("Quantity per channel cannot be lower than 2.");
  }

  // 1. Create linear steps (No shadow bias)
  const steps = Array.from({ length: quantityPerChannel }, (_, i) => {
    return i / (quantityPerChannel - 1);
  });

  const colours: string[] = [];

  // 2. Build the 3D lattice with Radial Warp
  for (let rBase of steps) {
    for (let gBase of steps) {
      for (let bBase of steps) {
        // Find the "Neutral Component" (the luma/achromatic center for this point)
        const luma = (rBase + gBase + bBase) / 3;

        // Calculate vector from the achromatic axis
        const dr = rBase - luma;
        const dg = gBase - luma;
        const db = bBase - luma;

        // Calculate saturation (distance from axis)
        const saturation = Math.sqrt(dr * dr + dg * dg + db * db);

        let r = rBase;
        let g = gBase;
        let b = bBase;

        if (saturation > 0) {
          // 3. Apply the Radial Pinch
          // This shifts the point closer to the neutral center without changing its brightness
          const newSaturation = Math.pow(saturation, radialPinch);
          const ratio = newSaturation / saturation;

          r = luma + dr * ratio;
          g = luma + dg * ratio;
          b = luma + db * ratio;
        }

        colours.push(
          createColorString(
            Math.max(0, Math.min(1, r)),
            Math.max(0, Math.min(1, g)),
            Math.max(0, Math.min(1, b)),
            colorSpace
          )
        );
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
