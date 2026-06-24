# D64 Doctor Guide

The Doctor utility is a best-effort reviewer and repair assistant for ordinary
disk images.

It is primarily meant to help with:

- diagnosing trouble spots that make images behave poorly in emulators
- repairing structural damage in legitimate disks and working copies
- surfacing recoverable deleted entries and unreachable directory records
- optimizing file and directory layout for timing-aware emulator reads
- explaining and visualizing disk-format tradeoffs while editing

Doctor starts with a read-only diagnosis. It reports what it can detect first,
then offers repair or review actions where it is reasonable to do so.

## D64 Limits

A plain `.d64` stores logical sector payloads, directory entries, the BAM, and
optionally one appended error byte per sector. It does not preserve the full
magnetic-disk recording of an original floppy.

That means Doctor cannot truly inspect or preserve low-level details such as:

- sync marks and GCR framing details
- checksum or check-bit style on-disk encoding details
- exact rotational placement and timing of physical sectors
- weak bits, intentional density tricks, or many copy-protection recording patterns

When the lab shows physical-sector hints, timing models, or expected header
structure, those are inferred from the logical DOS contents of the image and
from common drive conventions. They are useful for understanding what would be
expected on a normal disk, but they are not stored directly inside the `.d64`.

## What Doctor Detects

Doctor currently looks for issues such as:

- invalid or unsupported image sizes and geometry mismatches
- damaged, missing, or suspicious BAM or header information
- invalid disk name, disk ID, DOS type, or DOS version fields
- incorrect BAM free-block counts
- BAM sectors that disagree with reachable directory or file chains
- sectors marked free even though active structures use them
- sectors marked used even though no reachable active structure claims them
- duplicate active filenames
- malformed directory entries or invalid/unsupported file types
- block-count mismatches between a directory entry and its readable chain
- invalid start pointers or invalid next-block pointers
- broken chains, circular chains, and cross-linked sectors
- files that cross into reserved directory/BAM sectors
- orphaned allocated blocks and suspicious nonzero unused sectors
- deleted `DEL` entries that may still be recoverable
- splat or unclosed files
- REL side-sector or record-length problems
- optional appended D64 error-byte observations
- nonzero slack or tail data that may matter to specialized disks

Issues are classified as:

- `informational`: useful to know, but not necessarily bad
- `warning`: suspicious, risky, or ambiguous
- `repairable`: Doctor has a concrete repair or review path available

## Repair Philosophy

Doctor tries to move an image toward a conventional, emulator-friendly logical
layout.

That is usually what you want for:

- ordinary archived disks
- working copies
- disks being cleaned up for emulator compatibility
- images you want to browse, edit, optimize, or extend

That is not always what you want for intentionally unusual originals. Some
software used nonstandard formatting, meaningful slack bytes, deliberately
unclaimed sectors, strange pointers, or other tricks for loading behavior or
copy protection. In those cases, a repair may normalize data that was unusual
on purpose.

Examples of repairs that can change behavior in unexpected ways include:

- truncating a damaged file chain
- replacing an invalid pointer with a safer terminating value
- rebuilding BAM state from reachable chains only
- clearing data from logically unused sectors or unused tail space
- normalizing invalid header or directory metadata

## What Doctor Attempts To Repair

Doctor can attempt repairs such as:

- rebuilding or correcting BAM allocation state
- fixing BAM free-count mismatches
- normalizing invalid disk-name bytes
- setting or reviewing disk ID, DOS type, and DOS version fields
- repairing active-file block counts
- closing splat or unclosed files
- converting certain invalid duplicate entries into deleted entries instead of dropping them outright
- repairing or relinking some unreachable directory entries
- relocating file sectors away from reserved directory/BAM track space when safe space exists
- cloning some cross-linked sectors into new chains when Doctor can isolate a safe branch to copy
- repairing selected metadata fields through directory-entry or BAM review dialogs

Some repairs depend on safe conditions, such as:

- enough free sectors being available
- a readable chain existing far enough to copy or truncate safely
- a conflict being isolated clearly enough that Doctor can tell which entry to rewrite

When Doctor can not prove a safe automatic repair, it falls back to a review
action or leaves the issue as a warning.

## Review Or Potentially Destructive Actions

Some repairs are intentionally left as explicit user choices because they may
discard, reinterpret, or relocate data. These are the kinds of actions that can
change an image in ways you might not want on a nonstandard original.

Examples include:

- truncating a file with a circular chain
- truncating a file whose final next-block pointer is invalid
- changing an invalid start pointer or file type
- removing one side of a cross-linked entry conflict
- restoring deleted entries whose original type or placement is uncertain
- editing BAM cells directly
- changing raw bytes in the hex editor

Doctor will usually offer `Review`, `View`, `Repair`, `Remove Entry`, or
similar targeted actions in these cases so you can decide how aggressive to be.

## Auto Repair

`Auto Repair` is intended to run the set of repairs that Doctor considers
non-destructive or low-risk normalizations.

In practice, Auto Repair is meant for problems where the safer intent is
obvious, such as:

- fixing BAM bookkeeping inconsistencies
- repairing block counts
- normalizing obviously invalid header bytes
- closing splat files
- applying other structural fixes that do not intentionally throw away file data

Auto Repair should skip actions that can be destructive or that could change
data unexpectedly, such as:

- truncating damaged chains
- choosing between competing cross-linked file entries when data ownership is ambiguous
- making manual byte-level edits
- any repair that depends on a user choosing how to reinterpret broken metadata

Availability still depends on whether the underlying image provides enough safe
information or free space to carry out the repair.

## Why Use Doctor

For many everyday images, Doctor is a practical way to diagnose trouble spots,
repair conventional damage, and improve how a disk behaves in emulators that
model real drive timing.
