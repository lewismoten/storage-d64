# D64 Lab Guide

This guide focuses on the browser test lab in [index.html](./index.html) and
[index.js](./index.js).

The lab is both a disk-image editor and a visualization tool for understanding
how directory layout, sector placement, and timing-related disk behavior affect
an emulator-friendly `.d64`.

## What The Lab Is For

The lab is useful for:

- creating a blank disk image and working on it immediately
- loading an existing image and inspecting its structure
- editing directory entries and disk metadata through forms
- editing sectors, ranges, file payloads, and selected fields in hex or printable form
- diagnosing disk issues with Doctor
- repairing, restoring, deleting, destroying, optimizing, and deoptimizing files
- visualizing file placement, timing zones, and sector usage
- drag-and-drop importing files from the host filesystem
- downloading either the full image or extracted files

## Main Areas Of The UI

## Left Sidebar

The sidebar is the control and status area.

- `Image`: create, load, and download the current image
- `Filename`: shows the currently loaded source image name
- `Disk Header`: shows header fields such as disk name, ID, DOS markers, geometry, and related metadata
- `Usage`: shows logical byte usage and the usage chart
- `Utilities`: launches Doctor, Validate, Deoptimize, Optimize, and Corrupt actions

## Disk Layout

The disk layout panel is the main visualization surface.

It includes:

- a pan-and-zoom platter view
- optional speed-map overlay
- cover/sleeve presentation mode
- sector and structure legends
- track and sector hover details
- speed-zone rings and timing-aware layout hints
- a selected-sector inspector
- a physical-sector model
- a sector bitplane view

The disk map is intended to help explain both where data lives and why one
layout may read more efficiently than another in emulators that model rotation,
head movement, and transfer timing.

## Directory Files

The active directory table is the main working list of reachable files.

Typical actions include:

- reordering entries
- editing directory-entry metadata
- toggling state and protection
- downloading files
- deleting files
- opening a file payload in the byte editor

The `#` column is the directory-entry index used by many review and repair
flows.

## Deleted Files

Deleted entries are listed separately so they can be inspected, restored, or
destroyed without mixing them into the active directory view.

Deleted entries may still carry recoverable file chains, type hints, and other
metadata, but Doctor may flag them as unsafe or ambiguous depending on the
condition of the chain.

## Unreachable Files

The unreachable list is for directory records or file chains that exist in some
form but are not currently reachable through a normal active directory walk.

These can sometimes be:

- repaired back into a reachable directory slot
- reviewed in the directory-entry editor
- downloaded
- restored if they are deleted entries
- destroyed if the chain is no longer wanted

## Editing Surfaces

The lab intentionally gives you several ways to approach the same bytes.

## Structured Forms

Use forms when you want the safest or most direct editing path.

Examples:

- disk header dialogs
- directory entry dialogs
- BAM editor dialog
- Doctor review dialogs

These forms try to explain the meaning of fields rather than exposing only raw
bytes.

## Hex And Printable Editing

Use the hex viewer when you need exact control.

The lab can open:

- a full file payload
- a single logical sector
- a disk-name range
- a BAM byte range
- a doctor-highlighted byte range
- directory-entry bytes

The viewer supports:

- paired hex and printable views
- highlighted bytes relevant to a Doctor issue
- masked or reserved regions where editing should not apply
- multiple-byte selection
- range editing

## Bitmask Views

Bitmask views exist in several places to map stored bytes back to meaning.

Examples include:

- selected sector bitplanes
- directory-entry byte maps
- BAM byte maps

When possible, the colors correspond to specific field roles so it is easier to
move between form-based editing and raw storage layout.

## Doctor Workflow

Doctor is documented more fully in [DOCTOR.md](./DOCTOR.md), but the lab
workflow is:

1. run a read-only diagnosis
2. inspect each issue in context
3. choose `View`, `Review`, `Repair`, `Remove Entry`, `Truncate`, or other targeted actions
4. use `Auto Repair` only for the non-destructive or low-risk actions Doctor can perform confidently

Doctor is meant for conventional cleanup and emulator-facing repair, not for
preserving unusual protection tricks or nonstandard disk behavior.

## Validate, Optimize, And Deoptimize

The utilities are related but distinct:

- `Validate` rebuilds or reconciles structural allocation state more conservatively
- `Optimize` reflows files and directory sectors toward more efficient reading
- `Deoptimize` intentionally scatters layout so timing and fragmentation effects are easier to study
- `Corrupt` introduces sample faults so Doctor and the editing tools can be exercised

## Drag And Drop

The lab accepts host files dropped onto the disk layout area.

Typical behavior:

- imported files are added to the image
- default types are inferred from name or extension when possible
- otherwise a safe default is used

The UI also supports dragging directory rows to reorder entries.

## Physical-Disk Limits

The lab can visualize or infer many things about a floppy, but a `.d64` only
stores logical data plus optional per-sector error bytes.

That means:

- sync marks are inferred, not stored
- physical header/check data is inferred, not stored
- exact rotational placement is modeled approximately, not preserved
- copy-protection tricks may be normalized or lost during repair or rebuild

For more on those limits, see [README.md](./README.md) and
[DOCTOR.md](./DOCTOR.md).
