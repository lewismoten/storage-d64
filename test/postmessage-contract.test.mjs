import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const source = await readFile(
  new URL("../external-load.js", import.meta.url),
  "utf8",
);
const labSource = await readFile(
  new URL("../index.js", import.meta.url),
  "utf8",
);
const markup = await readFile(
  new URL("../index.html", import.meta.url),
  "utf8",
);

test("accepts D64 postMessage payloads from any opener and loads them through the normal image flow", () => {
  assert.match(source, /STORAGE_D64_MESSAGE_TYPE/);
  assert.match(source, /message\.type !== STORAGE_D64_MESSAGE_TYPE/);
  const receiverSource = source
    .split("const receiveD64Message")[1]
    .split("const notifyOpenerReady")[0];
  assert.doesNotMatch(receiverSource, /event\.origin !==/);
  assert.match(
    source,
    /app\.loadImageBytes\(\s*bytes,\s*sourceName \|\| "received\.d64"/,
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

test("accepts D64 postMessage bytes as a Uint8Array, ArrayBuffer, typed array view, or plain byte array", () => {
  assert.match(source, /const bytes = readReceivedD64Bytes\(message\.bytes\)/);
  assert.match(source, /value instanceof Uint8Array/);
  assert.match(source, /value instanceof ArrayBuffer/);
  assert.match(source, /ArrayBuffer\.isView\(value\)/);
  assert.match(source, /Array\.isArray\(value\)/);
  assert.match(
    source,
    /!Number\.isInteger\(byte\) \|\| byte < 0 \|\| byte > 255/,
  );
});

test("integration help can generate a loader that sends bytes instead of a URL", () => {
  assert.match(markup, /id="integration-source-select"/);
  assert.match(markup, /<option value="bytes">/);
  assert.match(source, /async function inspectD64Bytes\(bytes/);
  assert.match(source, /async function inspectD64\(url\)/);
});

test("index.js delegates external loading to external-load.js and announces readiness after initializing", () => {
  assert.match(
    markup,
    /<script src="\.\/support\.js"><\/script>\s*<script src="\.\/external-load\.js"><\/script>\s*<script src="\.\/index\.js"><\/script>/,
  );
  assert.match(
    source,
    /TPP\.d64ExternalLoad = Object\.freeze\(\{ install: install \}\)/,
  );
  assert.match(labSource, /externalLoad\.install\(\{/);
  assert.match(
    labSource,
    /initialize\(\);[\s\S]*externalLoader\.notifyOpenerReady\(\);/,
  );
  assert.doesNotMatch(labSource, /storage-d64:load/);
});
