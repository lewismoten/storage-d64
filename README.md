# D64 Storage Medium

This folder contains a browser-ready storage plug-in that registers a `d64` storage medium with the TPP API.

It is designed to be hosted independently as static JavaScript. It does not depend on Tiny Pockets Press by name, but it does depend on a host exposing the TPP storage API and a Commodore 64 D64 export core.

## What It Registers

The entry point is [plugin.js](./plugin.js).

The storage-medium support helpers live in [support.js](./support.js).

The support API reference lives in [support.md](./support.md).

The Doctor guide lives in [DOCTOR.md](./DOCTOR.md).

The browser lab guide lives in [LAB.md](./LAB.md).

Developer-facing structure notes live in [DEVELOPMENT.md](./DEVELOPMENT.md).

The local browser test lab lives in [index.html](./index.html) and
[index.js](./index.js).

The lab can also rebuild a loaded image into either a deliberately
fragmented layout or a compact defragmented layout for visualization, while
preserving and scoring layout choices that affect follow-up read efficiency.

When loaded, it calls:

```js
window.TPP.registerStorage({
  id: "d64",
  name: "Commodore 64 D64",
  description:
    "Exports rendered page graphics and assets into Commodore 64 disk images.",
  export: async function (options) {
    return window.TPP.exportImagesD64Core(options || {});
  },
});
```

The storage medium id is:

```text
d64
```

## Required Host API

The host application must provide:

- `window.TPP.registerStorage(storage)`
- `window.TPP.exportImagesD64Core(options)`

In practice, the host's D64 core is responsible for Commodore 64 rendering, asset preparation, optional multi-disk ZIP bundling, and download behavior.

The storage plug-in itself also lazy-loads its own D64 support module, which is responsible for low-level disk image concerns such as:

- track and sector sizing
- BAM generation
- directory entry generation
- file sector allocation
- final `.d64` byte-image assembly

When that support script loads, it exposes:

```js
window.TPP.d64;
```

That namespace is intended to be usable directly by other repos, not just by Tiny Pockets Press.

## What This Plug-in Relies On

This plug-in is intentionally thin. It does not:

- convert source content into C64 screen data
- choose palette or dithering rules
- trigger its own download logic

It registers the storage medium, lazy-loads `support.js` when needed, and then forwards `options` to the host:

```js
await storage.export(options);
```

## `export(options)` Signature

The plug-in forwards a single `options` object unchanged to:

```js
window.TPP.exportImagesD64Core(options);
```

That means the real accepted shape is defined by the host.

For a generic storage-medium contract, these fields are recommended to be shared across both `d64` and `zip`:

```ts
type StorageExportOptions = {
  files?: StorageFile[];
  getFiles?: () => StorageFile[] | Promise<StorageFile[]>;
  metadata?: Record<string, unknown>;
  options?: Record<string, unknown>;
  onProgress?: (detail: unknown) => void;
  signal?: AbortSignal;
};

type StorageFile = {
  name: string;
  bytes?: Uint8Array | ArrayBuffer;
  blob?: Blob;
  text?: string;
  data?: unknown;
  type?: string;
  metadata?: Record<string, unknown>;
};
```

## Shared Option Guidance

These shared fields are a good baseline for any storage medium:

- `files`: a prebuilt list of files or logical assets the medium should package
- `getFiles`: a lazy callback the host can expose instead of precomputing `files`
- `metadata`: generic metadata about the export, title, or bundle
- `options`: medium-specific settings nested under one property
- `onProgress`: optional callback for status updates
- `signal`: optional cancellation signal

For D64 specifically, `files` may represent either raw output files or higher-level logical assets that the host's D64 core converts into disk records.

## Current Tiny Pockets Press Behavior

In this repository, the current D64 storage medium still delegates to a Tiny Pockets Press host-specific export core. That implementation is driven primarily by the active book state and C64 export settings rather than a generic `files` array.

Common host-side options currently involved in the D64 flow include:

- `format`
- `colorDepth`
- `palette`
- `threshold`
- `dithering`
- `preDitherEnabled`
- `preDither`
- `preDitherThreshold`

The current host also forces C64-oriented export behavior, such as:

- `format: "d64"`
- `palette: "c64"`
- target size appropriate for Commodore 64 graphics

So while `files` and `getFiles` are recommended shared parameters for a generic host, they are not yet the primary contract used by this specific implementation.

## How To Load It

Load the plug-in after the host has created `window.TPP`:

```html
<script src="https://example.com/storage/d64/plugin.js"></script>
```

After that, the host should be able to resolve the storage medium by id `d64`.

## Local Test Lab

This repo also includes a static D64 lab for exercising the low-level support
helpers directly in the browser.

Start a local web server from this folder:

```bash
npm run lab
```

Then open:

```text
http://localhost:1541/
```

The lab lets you:

- start from a default blank disk image immediately on load
- create a new blank disk image with selectable geometry
- load an existing disk image from disk
- inspect header metadata, usage, and directory state
- list active and deleted directory entries
- rename files, change file types, and toggle file lock and open/closed flags
- delete, restore, deoptimize, and optimize files and whole images
- run a read-only Doctor diagnosis that reports structural issues and recoverable conditions
- drag host files into the image and export individual files back out
- inspect the disk layout, sector usage, directory track, and file placement
- open sector and file byte data in a hex/printable viewer and edit bytes in place
- compare read-efficiency layout visually with the speed-map overlay
- download either the current full image or individual extracted files

The lab is also meant to help improve read behavior in emulators that model
real drive timing, including disk rotation, head movement, and the pace at
which data can be delivered back to the computer. It can be used both as an
editor and as a timing-aware layout workbench for understanding why one sector
layout reads faster than another.

The disk layout view also includes:

- a sector legend for disk structure and file types
- a selected-sector inspector with track/sector metadata
- a physical sector model and bitplane view for the selected sector
- inferred read-timing and read-optimization scoring for chained sectors
- a floppy-shell presentation mode, including sleeve/cover visualization

The editing workflow is intentionally available through multiple views so you
can approach a problem from the level that makes the most sense:

- structured forms for disk headers, directory entries, BAM state, and repair flows
- hex and printable-text editing for sectors, files, and selected byte ranges
- color-coded bitmask views that map fields and flags back to their stored bytes when possible

The disk layout inspector in the lab can also show inferred disk-level context,
such as the logical disk ID associated with a selected sector. A plain `.d64`
image does not store low-level GCR details like sync marks, per-sector physical
headers, or exact rotational timing. When the lab shows that kind of context,
it is inferred from the logical DOS structures in the image, especially the
header/BAM sector at track 18 sector 0.

Current rebuild behavior in the lab and support layer includes:

- sequential file allocation that prefers tracks near track `18`
- directory-sector layout on track `18` using directory interleave `3`
- fragmented rebuilds that intentionally scatter file sectors and directory sectors
- read-optimization scoring for both file chains and directory-sector links

Clicking a file's `Bytes` value opens a full-file payload hex viewer/editor.
Clicking a sector in the disk map opens a per-sector hex viewer/editor.

## D64 Limits And Inferred Physical Details

A plain `.d64` stores logical sector data, directory entries, the BAM, and
optionally one appended error byte per sector. It does not preserve the full
low-level magnetic-disk encoding that a real floppy surface would have carried.

That means the lab and support layer cannot directly read or reproduce details
such as:

- sync marks and other GCR-level framing details
- checksum/check-bit style on-disk encoding details
- exact rotational placement and timing of sectors
- weak bits, density tricks, or other copy-protection-specific recording patterns

Where the lab shows physical-sector context, timing hints, disk-structure
visuals, or expected header-style information, that data is inferred from the
logical contents of the `.d64` image and from common 1541-style conventions. It
is meant to help explain what would normally be expected on a legitimate disk,
not to claim that those exact magnetic details are stored in the image.

## Doctor Guide

The Doctor utility has its own guide in [DOCTOR.md](./DOCTOR.md).

That document covers:

- what Doctor detects
- what it can repair automatically
- which actions are left as review or opt-in repairs because they may be destructive
- how Auto Repair is intended to stay on the non-destructive side when possible

W Why use 

Storage D64 is not just for disk I/O. The lab works for repairs and as a learning and editing aid:

- disk layout, zone, and timing visuals help explain why some images read faster
- hex, text, and form-based editors give multiple ways to inspect the same bytes
- color-coded bitmask views help map fields and flags back to their stored layout
- drag-and-drop import and per-file export make image maintenance easier


## Notes

- Registration failures are reported with `console.error`.
- The plug-in is designed so the D64 storage medium can live in its own repo and still depend on a shared TPP host API.
