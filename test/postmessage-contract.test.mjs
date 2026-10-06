import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../index.js", import.meta.url), "utf8");
const markup = await readFile(
  new URL("../index.html", import.meta.url),
  "utf8",
);

test("accepts D64 postMessage payloads from any opener and loads them through the normal image flow", () => {
  assert.match(source, /STORAGE_D64_MESSAGE_TYPE/);
  assert.match(source, /message\.type !== STORAGE_D64_MESSAGE_TYPE/);
  const receiverSource = source.split("const notifyOpenerReady")[0];
  assert.doesNotMatch(receiverSource, /event\.origin !==/);
  assert.match(
    source,
    /loadImageBytes\(\s*bytes,\s*sourceName \|\| "received\.d64"/,
  );
});

test("notifies an opener when a requested D64 inspection tab is ready", () => {
  assert.match(source, /STORAGE_D64_READY_MESSAGE_TYPE/);
  assert.match(source, /window\.opener\.postMessage/);
  assert.match(source, /receiveRequestId/);
  assert.match(source, /\n\s*"\*",\n\s*\);/);
});

test("provides a URL dialog that fetches and loads a D64 image", () => {
  assert.match(markup, /id="open-url-button"/);
  assert.match(markup, /id="url-dialog"/);
  assert.match(markup, /id="url-input"/);
  assert.match(source, /fetch\(url\)/);
  assert.match(source, /new Uint8Array\(await response\.arrayBuffer\(\)\)/);
});

test("provides integration help that generates a copyable embed function", () => {
  assert.match(markup, /id="integration-help-button"/);
  assert.match(markup, /id="integration-dialog"/);
  assert.match(markup, /id="integration-url-input"/);
  assert.match(markup, /id="integration-code"/);
  assert.match(markup, /id="integration-copy"/);
  assert.match(source, /navigator\.clipboard\.writeText/);
  assert.match(source, /storage-d64:load/);
});
