import assert from "node:assert/strict";
import test from "node:test";
import vm from "node:vm";
import { readFile } from "node:fs/promises";

const source = await readFile(
  new URL("../support.js", import.meta.url),
  "utf8",
);
const sandbox = {
  window: {},
  Uint8Array,
  ArrayBuffer,
  Math,
  Object,
  String,
  Number,
  Boolean,
  Error,
  Set,
  Map,
  JSON,
};
vm.runInNewContext(source, sandbox);
const { d64 } = sandbox.window.TPP;

test("uses the standard 1541 ten-sector interleave for same-track file reads", () => {
  assert.equal(d64.estimateNextSectorWindow({ track: 17, sector: 0 }, 17), 10);
});

test("optimizer prefers the candidate with the shorter modeled read delay", () => {
  const allocation = {
    trackCount: 35,
    map: {
      16: Array(21).fill(false),
      17: Array(21).fill(false),
    },
  };
  allocation.map[16][4] = true;
  allocation.map[17][15] = true;
  const candidate = d64.findNearestSmartSector(allocation, {
    track: 17,
    sector: 0,
  });
  assert.equal(candidate.track, 16);
  assert.equal(candidate.sector, 4);
});

test("Optimize never replaces a layout with a lower link score", () => {
  const image = d64.buildImage([
    { name: "ONE", type: "prg", data: new Uint8Array(254 * 4) },
  ]);
  const before = d64.averageFileLinkScore(image);
  const worse = d64.fragmentImage(image);
  const reflowImage = d64.reflowImage;
  d64.reflowImage = () => worse;
  try {
    const optimized = d64.defragmentImage(image);
    assert.ok(d64.averageFileLinkScore(optimized) >= before);
  } finally {
    d64.reflowImage = reflowImage;
  }
});
