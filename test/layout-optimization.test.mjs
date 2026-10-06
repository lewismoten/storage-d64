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

test("optimizer stays on the current track the way the 1541 DOS does", () => {
  const allocation = {
    trackCount: 35,
    map: {
      16: Array(21).fill(false),
      17: Array(21).fill(false),
    },
  };
  allocation.map[16][4] = true;
  allocation.map[17][15] = true;
  // The DOS aims for 17/10, which is taken, so it takes the next free sector
  // above it on the same track instead of moving to track 16.
  const candidate = d64.findNextDosSector(allocation, {
    track: 17,
    sector: 0,
  });
  assert.equal(candidate.track, 17);
  assert.equal(candidate.sector, 15);
});

test("file allocation matches the 1541 DOS NXTTS chain", () => {
  const allocation = { trackCount: 35, map: {} };
  const chain = [];
  let block = d64.findNextDosSector(allocation, null);
  for (let index = 0; index < 23; index += 1) {
    chain.push(block.track + "/" + block.sector);
    d64.markAllocatedSector(allocation, block);
    block = d64.findNextDosSector(allocation, block);
  }
  assert.deepEqual(chain.slice(0, 5), [
    "17/0",
    "17/10",
    "17/20",
    "17/8",
    "17/18",
  ]);
  // When track 17 fills, the DOS moves away from track 18 and continues
  // from the last sector plus the interleave: 17/19 -> 16/7.
  assert.equal(chain[20], "17/19");
  assert.equal(chain[21], "16/7");
});

test("directory allocation matches the 1541 DOS interleave-3 chain", () => {
  // Copy out of the vm sandbox so deepEqual compares plain arrays.
  const order = Array.from(d64.buildDirectorySectorOrder(18));
  assert.deepEqual(
    order,
    [1, 4, 7, 10, 13, 16, 2, 5, 8, 11, 14, 17, 3, 6, 9, 12, 15, 18],
  );
});

test("stock LOAD links only stall when a seek outlasts sending a block", () => {
  const timing = d64.driveTiming;
  assert.equal(timing.rotationMs, 200);
  assert.ok(Math.abs(timing.trackStepMs - 29.696) < 1e-9);
  assert.ok(Math.abs(d64.driveSendMs(254) - 630.27) < 0.01);
  const sameTrack = d64.estimateStockLoadLink(
    { track: 17, sector: 0 },
    { track: 17, sector: 3 },
  );
  assert.equal(sameTrack.stallMs, 0);
  assert.equal(sameTrack.score, 100);
  const longJump = d64.estimateStockLoadLink(
    { track: 1, sector: 0 },
    { track: 35, sector: 0 },
  );
  assert.ok(longJump.stallMs > 500);
  assert.ok(longJump.score < 60);
});

test("DOS layout score rewards the DOS's own next block", () => {
  assert.equal(
    d64.scoreDosLayoutLink({ track: 17, sector: 20 }, { track: 17, sector: 8 })
      .score,
    100,
  );
  assert.equal(
    d64.scoreDosLayoutLink({ track: 17, sector: 19 }, { track: 16, sector: 7 })
      .score,
    100,
  );
  assert.equal(
    d64.scoreDosLayoutLink({ track: 17, sector: 0 }, { track: 30, sector: 0 })
      .score,
    0,
  );
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

test("a disk laid out by the DOS rule scores 100% on DOS layout", () => {
  const image = d64.buildImage([
    { name: "README", type: "seq", data: new Uint8Array(300) },
    { name: "GAME", type: "prg", data: new Uint8Array(254 * 12) },
    { name: "LEVELS", type: "prg", data: new Uint8Array(254 * 30) },
  ]);
  assert.equal(d64.scoreDosLayout(image).average, 100);
});
