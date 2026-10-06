# 1541 Drive Timing

[Project home](../README.md) · [Visual tour](./visual-tour.md) · [Lab guide](./lab.md) · [Doctor guide](./doctor.md) · [Support API](./api.md) · [Development notes](./development.md)

This page records how the lab models a stock Commodore 1541 reading a disk for
a stock Commodore 64 `LOAD` with no fast loader, JiffyDOS, or speeder
cartridge. The speed map, the **Optimize** button, and the
`LOAD "*",8,1` animation all use this model. The constants live in
`window.TPP.d64.driveTiming` in [support.js](../support.js).

## Timing Constants

Most values come from the 1541 DOS 2.6 ROM. The disk controller code runs in a
VIA timer interrupt whose latch is `$3A00` cycles at 1 MHz, about 14.85 ms, and
the DOS counts most mechanical delays in those interrupts. Commodore's own
source comments quote older, rounder figures (for example "1.5 sec" for
spin-up); where they disagree with the register values, the lab uses the
register values.

| Constant                    | Value                                          | Source                                                |
| --------------------------- | ---------------------------------------------- | ----------------------------------------------------- |
| Rotation                    | 300 RPM, 200 ms per revolution                 | 1540/1541 Service Manual                              |
| One sector passing the head | 9.5 ms (tracks 1-17) to 11.8 ms (tracks 31-35) | 200 ms divided by the zone's sector count             |
| Controller interrupt        | about 14.85 ms                                 | ROM timer latch `$3A00`                               |
| Head step                   | one half-track per interrupt, 29.7 ms a track  | ROM stepper code; fast stepping needs 200+ half-steps |
| Settle after a seek         | 5 interrupts, about 74 ms                      | ROM                                                   |
| Motor spin-up wait          | 60 interrupts, about 0.89 s                    | ROM `$F98A`                                           |
| Motor run-on after last job | 255 interrupts, about 3.8 s                    | ROM `$F997`                                           |
| Bump                        | 92 half-steps outward, about 1.37 s            | ROM `$F388`                                           |
| Serial transfer to a C64    | about 400 bytes/s; 0.63 s per 254-byte block   | Service Manual (400 B/s); measured 403 B/s            |
| File interleave             | 10 sectors                                     | DOS source, inherited from the PET 4040 drive         |
| Directory interleave        | 3 sectors                                      | DOS source, inherited from the PET 4040 drive         |

The C64 transfers more slowly than the VIC-20 because its video chip pauses the
CPU about every 0.5 ms, so the serial protocol uses longer hold times. The
drive's `UI-` command selects the faster VIC-20 timing.

## What A Stock LOAD Does

For `LOAD "*",8,1` on a freshly inserted disk:

1. The motor turns on, and the DOS waits about 0.89 s for it to spin up.
2. The drive initializes: it steps to track 18 and reads the BAM and disk ID
   at 18/0. The DOS re-reads the BAM only after a disk change, detected by the
   write-protect sensor (`AUTOI` `$C63D`), or on an `I` command. The first
   `LOAD "*"` reads it again regardless (`$D828`).
3. It follows the directory chain to the first PRG entry; SEQ, USR, REL, and
   scratched entries are skipped. If that entry was never closed, the drive
   reports error 60. After a `LOAD`, `"*"` reopens the last program by its
   remembered track and sector without searching (1541 User's Guide).
4. OPEN reads only the file's first block (`STRRD` `$D09B`), and the drive
   starts sending it.
5. When block 1 is used up, the DOS reads block 2 and waits for it (`DBLBUF`
   `$CF1E`), so the C64 waits for that whole read.
6. From then on the DOS double-buffers (`RDBYT` `$D156`): as it starts sending
   a block it queues the read of the next one into the other buffer, so the
   head reads ahead while the serial bus is busy for about 0.63 s. If a read
   is not finished when a send ends, the C64 waits.
7. The motor keeps running for about 3.8 s after the last job.

During a normal load "over 60 sectors may pass while one is being sent"
(Transactor, March 1987). That read-ahead window hides interleave,
rotational waits, and short seeks. A 1987 Transactor test found that changing
the interleave "didn't have much effect at normal loading speeds", while it
mattered a lot with fast loaders.

## Other Commands

**Named LOAD** (`LOAD "NAME",8,1`). The `,1` never reaches the drive; it only
tells the C64 to use the file's load address. The drive asks for a PRG and
takes the first directory entry whose name matches, of any type. If that
entry is not a PRG, the drive reports error 64 FILE TYPE MISMATCH, even when a
PRG with the same name comes later. A missing name is error 62, and a file
that was never closed is error 60. The C64 shows `?FILE NOT FOUND ERROR` for
all of these; the real reason is on the drive's error channel.

**Sequential files** (`OPEN 2,8,2,"NAME,S,R"`). The drive reads them exactly
like a LOAD, with the same block 1 to block 2 wait and read-ahead. Reading
with the KERNAL's `CHRIN` from machine code runs at about LOAD speed, which is
what the lab models. A 1985 Ahoy! test read a 40 KB file with BASIC `INPUT#`
at about 365 bytes/s; a BASIC `GET#` loop is much slower because every
statement addresses the drive again, and no figure was found for it.

**Directory listing** (`LOAD "$",8`). The drive builds the listing as a file
(`LOADIR` `$DA55`) and sends it in 256-byte buffers of eight 32-byte lines:

- the load address and header line (disk name, ID, and DOS type);
- one line per directory entry whose type byte is not 0, including splat
  files (marked `*`), locked files (marked `<`), and closed DEL entries;
- `BLOCKS FREE.` with the end marker, taken from a count kept in RAM.

The total is 32 + 32 × entries + 32 bytes. Formatting an entry already
searches for the next one (`GETNAM` `$C6CE`), so a buffer needs every directory
sector up to the next listed entry. Directory sectors are read like a file:
18/1 at OPEN, the second one when first needed with the C64 waiting, then
each later one ahead.

**REL records** (`OPEN 2,8,2,"NAME"` then the `P` command). OPEN reads the
file's first data block, then side sector 0. Each side sector lists all six
side sectors and up to 120 data blocks. The `P` command maps a record to a
data block (`FNDREL` `$CE0E`):

- offset = (record − 1) × record length, block = offset ÷ 254, side sector =
  block ÷ 120;
- the drive reads a different side sector only if the record needs one;
- it reads the record's data block and the one after it (`STRDBL` `$D0AF`),
  unless the record is in the block already in memory;
- a record that runs past the end of its block continues in the next block.

The drive sends the record up to its last non-zero byte, with no added
carriage return; an unwritten record reads as one byte. Records start at 1.
A record past the end of the file is error 50 RECORD NOT PRESENT.

## The Speed Map's Two Views

The 🚦 button cycles through **Stock LOAD**, **DOS layout**, and off.

**Stock LOAD** colors each file link by the delay it adds to a stock `LOAD`.
A file's first link always stalls, because block 2 is only read once block 1
has been sent. After that, the read-ahead has the whole 0.63 s send to
finish, so a link stalls only when seek, settle, rotational wait, and the
sector itself take longer than that. In practice only jumps of about 16
tracks or more stall. The score is the share of
the link's time the bus spends sending data. Rotational waits use the average
of half a revolution, because the read is queued at a time set by the serial
transfer, and because a real disk does not record where each track starts
relative to the others. The directory is searched inside the drive before any
data is sent, so this view does not score directory links.

**DOS layout** colors each link by how closely it follows the placement the
1541 DOS itself uses when it writes a file (`NXTTS`, `$F11E`):

- Stay on the current track while it has free blocks.
- Aim 10 sectors past the previous block. If that runs off the track, subtract
  the sector count, then 1 more unless the result is 0. Take that sector if
  free, otherwise the next free sector above it, otherwise the first free one.
- When the track is full, move one track further from track 18 and keep going
  in that direction, wrapping to the other side after the last track.
- Start each new file on the first track with free blocks in the order 17, 19,
  16, 20, and so on, at its lowest free sector.
- Lay the directory out on track 18 with interleave 3:
  1, 4, 7, 10, 13, 16, 2, 5, and so on.

A link that skips its target scores 100% when every sector it skipped is used
by another file or by an earlier block of the same file, because the DOS
skips taken sectors. A D64 does not record which file was written first, so
the score gives other files the benefit of the doubt. This view measures
conformance to Commodore's design, not speed.

**Optimize** rewrites files using the same DOS placement rule.

## Official Advice And Practice

Commodore's 1541 User's Guide says only that "the DOS fills up the diskette
from the center outward"; no official guidance on optimizing layout was found.
The stock 1541 has no interleave command (the 1571 and 1581 add `U0>S`).
Magazines such as Transactor showed how to change the interleave by poking the
DOS's interleave variable, and concluded it barely matters for stock loads.
In practice, commercial software and users relied on fast loaders, which are
far faster than the stock `LOAD` (one benchmark measured Epyx FastLoad at about
2,100 bytes/s and JiffyDOS at about 3,700 bytes/s) and are sensitive to
interleave.

## Simplifications And Open Questions

- In the REL `P` command, the ROM appears to request the block after the
  record twice; the lab shows it once.
- How long the drive spends formatting each 256-byte directory buffer is not
  measured, and the lab treats it as instant.
- The read job only starts when the wanted sector is a few sectors away, and
  waiting for it briefly pauses the serial transfer. The animation and speed
  map do not model this; it is small and depends little on layout.
- The KERNAL's own overhead before and between transfers is not modelled.
- The animation draws sector 0 of every track at the same angle. On a real
  1541 each track starts wherever formatting began.
- Disk rotation is drawn clockwise as seen from the label side. The 5.25-inch
  standard (ECMA-66) specifies counterclockwise rotation seen from the
  recorded side, and the 1541's head reads the side away from the label, so
  the two agree. No 1541-specific statement was found.
- How long the disk coasts after the motor stops is not documented; the
  animation uses half a second.
- No measured VIC-20 transfer rate or PAL versus NTSC difference was found,
  nor why the 4040's designers chose interleaves of 10 and 3.

## Sources

- Commented 1541 DOS ROM disassembly (Frank Kontros):
  <http://www.ffd2.com/fridge/docs/1541dis.html>
- _Inside Commodore DOS_ (Immers & Neufeld), annotated ROM listing:
  <https://g3sl.github.io/c1541rom.html>
- Commodore's DOS source for the 1541, 1540, and 4040:
  <https://github.com/mist64/cbmsrc>
- 1540/1541 Service Manual:
  <https://www.classic-computing.org/wp-content/uploads/2016/01/15401541_SERVICE-MANUAL.pdf>
- 1541 User's Guide:
  <http://www.zimmers.net/anonftp/pub/cbm/manuals/drives/1541_Users_Guide.pdf>
- Michael Steil, "Commodore Peripheral Bus: Part 4":
  <https://www.pagetable.com/?p=1135>
- Transactor Vol. 7 No. 5 (March 1987), "The 1541 Interleave Factor":
  <https://archive.org/download/transactor-magazines-v7-i05/trans_v7_i05_djvu.txt>
- 1541 load-speed benchmark (403 bytes/s):
  <https://www.obliterator918.com/dtb/>
- D64 format notes (Peter Schepers):
  <http://unusedino.de/ec64/technical/formats/d64.html>
- ECMA-66, 130 mm flexible disk cartridges:
  <https://www.ecma-international.org/wp-content/uploads/ECMA-66_1st_edition_september_1980.pdf>
