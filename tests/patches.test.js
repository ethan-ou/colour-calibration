import { colorPatches, grayscalePatches } from "../src/patches";
import fs from "fs";

test("Generates Grayscale Patches", () => {
  const testPatches = JSON.parse(
    fs.readFileSync("tests/mocks/grayscalePatches.json")
  );

  const patches = grayscalePatches(33);

  expect(patches.length).toBe(33);
  expect(patches).toEqual(testPatches);

  // Check first and last colours are black and white.
  expect(patches[0]).toBe("rgb(0, 0, 0)");
  expect(patches[patches.length - 1]).toBe("rgb(255, 255, 255)");
});

test("Generates Color Patches", () => {
  function colorBitPatches() {
    const colours = [];
    for (let i = 0; i < 1 << 12; i++) {
      const r = ((i >> 8) & 0xf) * 0x11;
      const g = ((i >> 4) & 0xf) * 0x11;
      const b = (i & 0xf) * 0x11;
      colours.push(`rgb(${r}, ${g}, ${b})`);
    }
    return colours;
  }

  const testPatches = JSON.parse(
    fs.readFileSync("tests/mocks/colorPatches.json")
  );

  // Check color patches match bit shifted version.
  const generatedTestPatches = colorBitPatches();

  const patches = colorPatches(4096);

  expect(patches.length).toBe(4096);
  expect(patches).toEqual(testPatches);
  expect(patches).toEqual(generatedTestPatches);

  // Check first and last colours are black and white.
  expect(patches[0]).toBe("rgb(0, 0, 0)");
  expect(patches[patches.length - 1]).toBe("rgb(255, 255, 255)");
});

test("Generates Grayscale Patches of Different Sizes", () => {
  const patches2 = grayscalePatches(2);
  expect(patches2.length).toBe(2);
  expect(patches2[0]).toBe("rgb(0, 0, 0)");
  expect(patches2[patches2.length - 1]).toBe("rgb(255, 255, 255)");

  const patches10 = grayscalePatches(10);
  expect(patches10.length).toBe(10);
  expect(patches10[0]).toBe("rgb(0, 0, 0)");
  expect(patches10[patches10.length - 1]).toBe("rgb(255, 255, 255)");
});

test("Generates Color Patches of Different Sizes", () => {
  const patches2 = colorPatches(Math.pow(2, 3));
  expect(patches2.length).toBe(Math.pow(2, 3));
  expect(patches2[0]).toBe("rgb(0, 0, 0)");
  expect(patches2[patches2.length - 1]).toBe("rgb(255, 255, 255)");

  const patches10 = colorPatches(Math.pow(10, 3));
  expect(patches10.length).toBe(Math.pow(10, 3));
  expect(patches10[0]).toBe("rgb(0, 0, 0)");
  expect(patches10[patches10.length - 1]).toBe("rgb(255, 255, 255)");
});
