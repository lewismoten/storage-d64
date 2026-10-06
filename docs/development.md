# D64 Development Notes

[Project home](../README.md) · [Visual tour](./visual-tour.md) · [Lab guide](./lab.md) · [Doctor guide](./doctor.md) · [Support API](./api.md)

This document is aimed at people working on the storage module itself.

It explains how the repository is split between the public support layer, the
thin storage plug-in, and the browser lab UI.

The plug-in's `window.TPP` integration targets the Tiny Pockets Press API. Its
original print workflow arranged double-sided pages for cutting, signature
sewing, and binding into very small books; the wider project later added
creative tooling such as an emulator-readable e-reader. Keep the storage
module's host integration thin so its D64 helpers remain independently useful.

## File Map

- [plugin.js](../plugin.js): registers the `d64` storage medium with a host `TPP` runtime
- [support.js](../support.js): the main reusable D64 support namespace
- [api.md](./api.md): API reference for `window.TPP.d64`
- [index.html](../index.html): browser lab markup and dialog structure
- [index.css](../index.css): browser lab styling
- [index.js](../index.js): browser lab behavior, rendering, dialogs, Doctor UI, and editing flows
- [external-load.js](../external-load.js): receives D64 images from other websites through `postMessage`, opens D64 URLs, and generates the website integration script
- [README.md](../README.md): project overview
- [lab.md](./lab.md): browser lab usage guide
- [doctor.md](./doctor.md): Doctor behavior and repair policy

## Layer Responsibilities

## `plugin.js`

`plugin.js` is intentionally thin.

Its job is to:

- register the `d64` storage medium with the host
- lazy-load or rely on the D64 support layer
- forward export options to the host-specific D64 export core

It should not become the place where low-level disk logic or browser-lab logic
lives.

## `support.js`

`support.js` is the reusable core.

It owns:

- disk-format enums and constants
- header parsing
- directory parsing
- file-chain reading
- image creation and rebuilding
- deletion and undelete helpers
- relocation, repair, and normalization helpers
- Doctor diagnosis and many repair routines
- logical validation and inspection helpers

As a rule of thumb, if logic can be reused outside the lab UI, it should
probably live in `support.js`.

## `index.js`

`index.js` is the browser-lab orchestration layer.

It owns:

- rendering the disk map and legends
- panning, zooming, hover state, and selection state
- dialogs and form synchronization
- toast/status messaging
- hex-viewer presentation and selection UX
- BAM editing UI
- Doctor report rendering and per-issue actions
- directory-table interaction and drag/drop behavior

As a rule of thumb, if code depends on the DOM, visual state, or user
interaction flow, it belongs here rather than in `support.js`.

## `external-load.js`

`external-load.js` holds every way a disk image arrives from outside the page,
so the cross-site contract can be reviewed in one place:

- the `storage-d64:ready` / `storage-d64:load` `postMessage` handshake with an
  opener on another website, including byte validation
- the **Open from URL** dialog
- the website integration dialog and the script it generates for website
  developers

It loads before `index.js` and exposes `window.TPP.d64ExternalLoad.install`.
`index.js` calls `install` with `loadImageBytes`, `setStatus`, and the dialog
helpers, and then calls the returned `notifyOpenerReady` after the default
blank disk has loaded. External loading reaches the rest of the lab only
through those functions.

## Support-Layer API Families

The support namespace is large enough that it helps to think about it in
groups.

Common families include:

- image and geometry helpers
- header and DOS metadata helpers
- directory-entry readers and writers
- file-chain and payload readers
- image builders and rebuilders
- optimize/deoptimize/reflow helpers
- delete, undelete, destroy, and unreachable-entry repair helpers
- BAM inspection and validation helpers
- Doctor diagnosis and repair helpers

The reference for the exported API remains [api.md](./api.md). This
document is intentionally more architectural than exhaustive.

## UI And Support Boundary

A good boundary is:

- `support.js` answers what the image means and how bytes should change
- `index.js` answers how the user sees that information and chooses the change

Examples:

- calculating whether a reserved-track repair is possible belongs in `support.js`
- disabling a button and showing why belongs in `index.js`
- building a repaired image belongs in `support.js`
- choosing whether that action is labeled `Repair`, `Review`, or `Truncate` belongs in `index.js`

## Doctor Design Notes

Doctor is split across both layers:

- `support.js` performs diagnosis and many repair operations
- `index.js` turns those issues into reviewable UI, linked sectors, chips, forms, and hex highlights

That split matters because not every issue should be auto-fixed, and not every
repair should be exposed the same way.

When adding Doctor behavior:

1. add or refine the structural diagnosis in `support.js`
2. decide whether the repair is safe, destructive, or ambiguous
3. expose the right UI action in `index.js`
4. include or exclude it from `Auto Repair` intentionally
5. document the behavior in [doctor.md](./doctor.md) when the policy changes

## Editing Philosophy

The lab intentionally supports multiple editing paths:

- forms for structured edits
- hex editing for exact byte control
- printable-text views where that makes sense
- color-coded bitmasks to map storage layout back to meaning

When adding a new editing surface, try to keep those views consistent with one
another rather than letting each drift into a different interpretation of the
same bytes.

## Timing And Visualization

The disk map is more than decoration.

It is meant to support:

- timing-aware emulator optimization
- explanation of speed zones and sector density
- chain-following and layout reasoning
- understanding reserved-track behavior
- spotting suspicious or orphaned sectors visually

Visual additions should help explain storage behavior, not just add ornament.

## Running The Project

Local lab server:

```bash
npm run lab
```

Formatting:

```bash
npm run format
npm run format:check
```

The project currently relies heavily on interactive browser verification. There
is not yet a dedicated automated test suite covering the full support layer and
UI behavior.

## Documentation Expectations

When features change, these are the most likely docs to need updates:

- [README.md](../README.md): project overview and major user-facing capabilities
- [lab.md](./lab.md): lab workflows and UI behavior
- [doctor.md](./doctor.md): detection, repair, and auto-repair policy
- [api.md](./api.md): public API reference

If a change affects only internal code structure, update this file instead of
expanding the public README unnecessarily.
