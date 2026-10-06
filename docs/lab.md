# D64 Lab Guide

[Project home](../README.md) · [Visual tour](./visual-tour.md) · [Doctor guide](./doctor.md) · [Support API](./api.md) · [Development notes](./development.md)

This guide focuses on the browser test lab in [index.html](../index.html) and
[index.js](../index.js).

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
- optional speed-map overlay with Stock LOAD and DOS layout views
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

### 1541 Drive

The 💿 button in the disk map toolbar shows the drive simulation: the
read/write head in the head window, the spinning disk, and the **1541 Drive**
panel beside the disk map. Hiding it stops anything the drive is doing. The
head carries two LEDs: green while it reads and red while it writes.

Pick a **Command** and press **Run**. The panel shows the exact BASIC command:

- **LOAD "\*",8,1** loads the first program in the directory. On a fresh disk
  the motor spins up for about 0.9 s, the head reads the BAM at 18/0, and the
  drive searches the directory. Run it again and the drive reopens the same
  program directly, as a real 1541 does.
- **LOAD a program by name** loads the PRG you pick. The drive takes the first
  directory entry with that name; if it is not a PRG, it reports
  `64,FILE TYPE MISMATCH`.
- **Read a SEQ or USR file** opens the file with `OPEN 2,8,2,"NAME,S,R"` and
  reads it to the end.
- **LOAD "$",8** sends the directory listing, 32 bytes per line, reading the
  directory sectors as it goes.
- **Read a REL record** opens a REL file and positions to the record number
  you type, reading the side sector and data blocks the record needs.

For files, the drive sends block 1, waits while it reads block 2, and then
reads each next block while it sends the current one, about 0.63 s per block,
so the readout often shows the head reading while the bus is sending. The
green LED lights as each sector passes under the head, and sectors already
read are outlined in green. The motor keeps running for about 3.8 s
afterwards; another command in that time skips the spin-up.

- **Initialize** runs the ROM's bump: 92 half-steps outward, knocking against
  the stop once the head reaches track 1. The stock DOS bumps during error
  recovery and before formatting.
- **Stop** stops the drive straight away.
- **Sound** turns the head knocking on or off. It is off by default.
- **Playback** slows the animation to 1/4 or 1/10 speed. At real speed a
  sector passes the head in about 10 ms.

The readout shows what the head and the serial bus are doing, the head's
track and the sector under it, the motor state, and how many bytes have been
sent. Errors show the drive's error channel message. The timing comes from the
1541 ROM and is shared with the speed map; see
[Drive timing](./drive-timing.md) for the values, sources, and
simplifications.

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

Doctor is documented more fully in the [Doctor guide](./doctor.md), but the lab
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
- `Optimize` reflows files and directory sectors the way the 1541 DOS lays them out
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

For more on those limits, see the [project home](../README.md) and the
[Doctor guide](./doctor.md).
