export const colorMode = (number) => Math.pow(number, 3);

export const grayscaleMode = (number) => number;

export function colorPatches(quantity = 4096) {
  if (quantity < 2) {
    throw Error("Quantity cannot be lower than 2.");
  }

  const colorsPerChannel = Math.cbrt(quantity);

  if (!Number.isInteger(colorsPerChannel)) {
    throw Error("Number of patches needs to be an integer under a cube root.");
  }

  const values = createChannelValues(colorsPerChannel);

  const colors = [];

  for (let r = 0; r < values.length; r++) {
    for (let g = 0; g < values.length; g++) {
      for (let b = 0; b < values.length; b++) {
        colors.push(`rgb(${values[r]}, ${values[g]}, ${values[b]})`);
      }
    }
  }

  return colors;
}

export function grayscalePatches(quantity = 33) {
  if (quantity < 2) {
    throw Error("Quantity cannot be lower than 2.");
  }

  const values = createChannelValues(quantity);
  return values.map((value) => `rgb(${value}, ${value}, ${value})`);
}

export function prePatches(quantity = 3) {
  const colors = [];

  for (let i = 0; i < quantity; i++) {
    colors.push(`rgb(255, 255, 255)`);
    colors.push(`rgb(0, 0, 0)`);
  }

  colors.push(`rgb(255, 255, 255)`);

  return colors;
}

function createChannelValues(quantity) {
  const values = [];

  // Step 1: Calculate the Step Size, Excluding Black
  const step = 255 / (quantity - 1);

  // Step 2: Add Values to Array
  for (let i = 0; i < quantity; i++) {
    const value = Math.round(i * step);
    values.push(value);
  }

  return values;
}
