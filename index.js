(function () {
  const d64 = window.TPP && window.TPP.d64;

  const state = {
    image: null,
    sourceName: "",
    objectUrl: null,
    deletedTypeHints: {},
  };

  const createForm = document.getElementById("create-form");
  const diskNameInput = document.getElementById("disk-name");
  const diskIdInput = document.getElementById("disk-id");
  const diskFormatSelect = document.getElementById("disk-format");
  const imageUpload = document.getElementById("image-upload");
  const downloadButton = document.getElementById("download-button");
  const refreshButton = document.getElementById("refresh-button");
  const currentFileName = document.getElementById("current-file-name");
  const status = document.getElementById("status");
  const headerSummary = document.getElementById("header-summary");
  const usageSummary = document.getElementById("usage-summary");
  const usageChartPanel = document.getElementById("usage-chart-panel");
  const usageChart = document.getElementById("usage-chart");
  const usageLegend = document.getElementById("usage-legend");
  const diskMap = document.getElementById("disk-map");
  const diskMapPointer = document.getElementById("disk-map-pointer");
  const diskMapTooltip = document.getElementById("disk-map-tooltip");
  const diskMapLegend = document.getElementById("disk-map-legend");
  const diskMapSummary = document.getElementById("disk-map-summary");
  const diskMapZoomIn = document.getElementById("disk-map-zoom-in");
  const diskMapZoomOut = document.getElementById("disk-map-zoom-out");
  const diskMapZoomReset = document.getElementById("disk-map-zoom-reset");
  const directoryCount = document.getElementById("directory-count");
  const fileTableBody = document.getElementById("file-table-body");
  const deletedFilesPanel = document.getElementById("deleted-files-panel");
  const deletedCount = document.getElementById("deleted-count");
  const deletedFilesList = document.getElementById("deleted-files-list");
  const numberFormatter = new Intl.NumberFormat("en-US");

  const REQUIRED_API = [
    "buildImage",
    "readHeader",
    "readBam",
    "readFiles",
    "readDeletedEntries",
    "readDirectoryEntriesFrom",
    "readFileChain",
    "readRelativeSideSectors",
    "estimateImageUsage",
    "fileName",
    "unlockFile",
    "lockFile",
    "openFile",
    "closeFile",
    "scratchFile",
    "undeleteFile",
    "trackSectorCount",
  ];
  const DISK_MAP_COLORS = Object.freeze({
    free: "#183a4e",
    unknownUsed: "#6c8ea3",
    header: "#f2a65a",
    bam: "#ffd166",
    directory: "#7ed6df",
    prgUsed: "#00d1b2",
    prgTail: "#98f5e1",
    seqUsed: "#4dabf7",
    seqTail: "#a9dcff",
    usrUsed: "#c77dff",
    usrTail: "#e0b8ff",
    relUsed: "#ff6b6b",
    relTail: "#ffb3b3",
    relSide: "#ff9f43",
    relSideTail: "#ffd3a1",
    deleted: "#8c98a4",
    trackStroke: "rgba(255,255,255,0.08)",
  });
  const DISK_MAP_PHYSICAL = Object.freeze({
    indexHoleAngle: Math.PI * 0.58,
    indexHoleRadius: 60,
    indexHoleSize: 4.2,
    spindleRadius: 46,
    platterRadius: 250,
    mechanismOuterRadius: 224,
    mechanismInnerRadius: 82,
    mechanismTrackCount: 40,
  });
  const DISK_MAP_VIEWBOX = Object.freeze({
    width: 760,
    height: 620,
    diskCenterX: 275,
    diskCenterY: 300,
  });
  const diskMapView = {
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    dragging: false,
    dragStartX: 0,
    dragStartY: 0,
    originOffsetX: 0,
    originOffsetY: 0,
    hoveredSectorElement: null,
  };

  const setStatus = function (message, isError) {
    status.textContent = message;
    status.style.color = isError ? "var(--bad)" : "";
  };

  const normalizeDiskId = function (value) {
    return (
      String(value || "")
        .trim()
        .toUpperCase() || "TL"
    ).slice(0, 2);
  };

  const toDisplayValue = function (value) {
    if (value == null || value === "") return "n/a";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    return String(value);
  };

  const escapeHtml = function (value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  };

  const formatNumber = function (value) {
    return numberFormatter.format(Math.max(0, Math.round(Number(value) || 0)));
  };

  const releaseObjectUrl = function () {
    if (!state.objectUrl) return;
    URL.revokeObjectURL(state.objectUrl);
    state.objectUrl = null;
  };

  const setCurrentImage = function (image, sourceName) {
    state.image = image instanceof Uint8Array ? image.slice() : null;
    state.sourceName = sourceName || "";
    currentFileName.textContent = state.sourceName || "Unsaved image";
    downloadButton.disabled = !state.image;
    refreshButton.disabled = !state.image;
  };

  const resetDeletedTypeHints = function () {
    state.deletedTypeHints = {};
  };

  const renderDefinitionList = function (node, rows) {
    node.innerHTML = rows
      .map(function (row) {
        return (
          "<div><dt>" +
          escapeHtml(row.label) +
          "</dt><dd>" +
          escapeHtml(row.value) +
          "</dd></div>"
        );
      })
      .join("");
  };

  const flagMarkup = function (value, labels) {
    const className = value ? labels.trueClass : labels.falseClass;
    const text = value ? labels.trueText : labels.falseText;
    return (
      '<button type="button" class="flag ' +
      className +
      '" data-action="' +
      labels.action +
      '" data-name="' +
      escapeHtml(labels.fileName) +
      '" aria-label="' +
      escapeHtml(labels.ariaLabel) +
      '">' +
      text +
      "</button>"
    );
  };

  const updateDownloadLinkState = function () {
    releaseObjectUrl();
    if (!state.image) return;
    state.objectUrl = URL.createObjectURL(
      new Blob([state.image], { type: "application/octet-stream" }),
    );
  };

  const clampDiskMapScale = function (scale) {
    return Math.max(0.7, Math.min(4, Number(scale) || 1));
  };

  const getDiskMapLocalPoint = function (clientX, clientY) {
    const rect = diskMap.getBoundingClientRect();
    return {
      x: clientX - (rect.left + rect.width / 2),
      y: clientY - (rect.top + rect.height / 2),
    };
  };

  const applyDiskMapTransform = function () {
    const svg = diskMap.querySelector("svg");
    if (!svg) return;
    svg.style.transform =
      "translate(" +
      diskMapView.offsetX +
      "px, " +
      diskMapView.offsetY +
      "px) scale(" +
      diskMapView.scale +
      ")";
    diskMap.classList.toggle("is-pannable", diskMapView.scale > 1.01);
  };

  const syncDiskMapControls = function () {
    const hasImage = Boolean(state.image);
    diskMapZoomIn.disabled = !hasImage;
    diskMapZoomOut.disabled = !hasImage;
    diskMapZoomReset.disabled = !hasImage;
  };

  const resetDiskMapView = function () {
    const svg = diskMap.querySelector("svg");
    diskMapView.scale = 1;
    if (svg) {
      const scaleX = svg.clientWidth / DISK_MAP_VIEWBOX.width;
      const scaleY = svg.clientHeight / DISK_MAP_VIEWBOX.height;
      diskMapView.offsetX =
        svg.clientWidth * 0.5 - DISK_MAP_VIEWBOX.diskCenterX * scaleX;
      diskMapView.offsetY =
        svg.clientHeight * 0.5 - DISK_MAP_VIEWBOX.diskCenterY * scaleY;
    } else {
      diskMapView.offsetX = 0;
      diskMapView.offsetY = 0;
    }
    applyDiskMapTransform();
  };

  const showDiskMapTooltip = function (text, clientX, clientY) {
    const frameRect = diskMap.parentElement.getBoundingClientRect();
    diskMapTooltip.hidden = false;
    diskMapTooltip.textContent = text;
    diskMapTooltip.style.left =
      Math.max(
        10,
        Math.min(frameRect.width - 190, clientX - frameRect.left + 14),
      ) + "px";
    diskMapTooltip.style.top =
      Math.max(10, clientY - frameRect.top + 14) + "px";
  };

  const hideDiskMapTooltip = function () {
    diskMapTooltip.hidden = true;
    diskMapTooltip.textContent = "";
  };

  const showDiskMapPointer = function (track, sector) {
    diskMapPointer.hidden = false;
    diskMapPointer.textContent =
      "Pointer: T" +
      String(track).padStart(2, "0") +
      " S" +
      String(sector).padStart(2, "0");
  };

  const hideDiskMapPointer = function () {
    diskMapPointer.hidden = true;
    diskMapPointer.textContent = "";
  };

  const setHoveredDiskMapSector = function (element) {
    if (diskMapView.hoveredSectorElement === element) return;
    if (diskMapView.hoveredSectorElement) {
      diskMapView.hoveredSectorElement.classList.remove("is-hovered");
    }
    diskMapView.hoveredSectorElement = element || null;
    if (diskMapView.hoveredSectorElement) {
      diskMapView.hoveredSectorElement.classList.add("is-hovered");
    }
  };

  const zoomDiskMapAtPoint = function (factor, clientX, clientY) {
    const nextScale = clampDiskMapScale(diskMapView.scale * factor);
    const appliedFactor = nextScale / diskMapView.scale;
    if (!Number.isFinite(appliedFactor) || appliedFactor === 1) return;
    const point = getDiskMapLocalPoint(clientX, clientY);
    diskMapView.offsetX =
      point.x - appliedFactor * (point.x - diskMapView.offsetX);
    diskMapView.offsetY =
      point.y - appliedFactor * (point.y - diskMapView.offsetY);
    diskMapView.scale = nextScale;
    applyDiskMapTransform();
  };

  const zoomDiskMap = function (direction) {
    const rect = diskMap.getBoundingClientRect();
    zoomDiskMapAtPoint(
      direction > 0 ? 1.08 : 1 / 1.08,
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
    );
  };

  const zoomDiskMapByWheel = function (deltaY, clientX, clientY) {
    const factor = Math.exp(-Math.max(-240, Math.min(240, deltaY)) * 0.0042);
    zoomDiskMapAtPoint(factor, clientX, clientY);
  };

  const renderUsageChart = function (segments) {
    if (!segments || !segments.length) {
      usageChartPanel.hidden = true;
      usageChart.style.background = "";
      usageChart.removeAttribute("aria-label");
      usageLegend.innerHTML = "";
      return;
    }

    const total = segments.reduce(function (sum, segment) {
      return sum + segment.value;
    }, 0);
    let offset = 0;
    const stops = segments
      .map(function (segment) {
        const start = total ? (offset / total) * 100 : 0;
        offset += segment.value;
        const end = total ? (offset / total) * 100 : 0;
        return (
          segment.color + " " + start.toFixed(2) + "% " + end.toFixed(2) + "%"
        );
      })
      .join(", ");

    usageChartPanel.hidden = false;
    usageChart.style.background =
      "conic-gradient(" +
      stops +
      "), radial-gradient(circle at center, rgba(8, 28, 39, 0.96) 0 54%, transparent 55%)";
    usageChart.setAttribute(
      "aria-label",
      segments
        .map(function (segment) {
          return segment.label + ": " + formatNumber(segment.value) + " bytes";
        })
        .join(", "),
    );
    usageLegend.innerHTML = segments
      .map(function (segment) {
        return (
          '<div class="legend-row">' +
          '<span class="legend-swatch" style="background:' +
          segment.color +
          '"></span>' +
          "<span>" +
          escapeHtml(segment.label) +
          "</span>" +
          "<strong>" +
          escapeHtml(formatNumber(segment.value) + " bytes") +
          "</strong>" +
          "</div>"
        );
      })
      .join("");
  };

  const polarToCartesian = function (cx, cy, radius, angle) {
    return {
      x: cx + radius * Math.cos(angle - Math.PI / 2),
      y: cy + radius * Math.sin(angle - Math.PI / 2),
    };
  };

  const describeArcPath = function (cx, cy, radius, startAngle, endAngle) {
    const start = polarToCartesian(cx, cy, radius, startAngle);
    const end = polarToCartesian(cx, cy, radius, endAngle);
    const largeArc = Math.abs(endAngle - startAngle) > Math.PI ? 1 : 0;
    const sweep = endAngle > startAngle ? 1 : 0;
    return [
      "M",
      start.x.toFixed(3),
      start.y.toFixed(3),
      "A",
      radius.toFixed(3),
      radius.toFixed(3),
      "0",
      largeArc,
      sweep,
      end.x.toFixed(3),
      end.y.toFixed(3),
    ].join(" ");
  };

  const describeArrowHead = function (x, y, angle, size) {
    const left = {
      x: x - size * Math.cos(angle - Math.PI / 6),
      y: y - size * Math.sin(angle - Math.PI / 6),
    };
    const right = {
      x: x - size * Math.cos(angle + Math.PI / 6),
      y: y - size * Math.sin(angle + Math.PI / 6),
    };
    return (
      "M " +
      left.x.toFixed(3) +
      " " +
      left.y.toFixed(3) +
      " L " +
      x.toFixed(3) +
      " " +
      y.toFixed(3) +
      " L " +
      right.x.toFixed(3) +
      " " +
      right.y.toFixed(3)
    );
  };

  const describeSectorPath = function (
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
  ) {
    const outerStart = polarToCartesian(cx, cy, outerRadius, startAngle);
    const outerEnd = polarToCartesian(cx, cy, outerRadius, endAngle);
    const innerEnd = polarToCartesian(cx, cy, innerRadius, endAngle);
    const innerStart = polarToCartesian(cx, cy, innerRadius, startAngle);
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    return [
      "M",
      outerStart.x.toFixed(3),
      outerStart.y.toFixed(3),
      "A",
      outerRadius.toFixed(3),
      outerRadius.toFixed(3),
      "0",
      largeArc,
      "1",
      outerEnd.x.toFixed(3),
      outerEnd.y.toFixed(3),
      "L",
      innerEnd.x.toFixed(3),
      innerEnd.y.toFixed(3),
      "A",
      innerRadius.toFixed(3),
      innerRadius.toFixed(3),
      "0",
      largeArc,
      "0",
      innerStart.x.toFixed(3),
      innerStart.y.toFixed(3),
      "Z",
    ].join(" ");
  };

  const markSector = function (map, track, sector, details) {
    const key = String(track) + ":" + String(sector);
    map[key] = Object.assign({ track: track, sector: sector }, details || {});
  };

  const buildDiskSectorMap = function (image) {
    const geometry = d64.describeGeometry(image);
    const bam = d64.readBam(image);
    const header = d64.readHeader(image);
    const directory = d64.readDirectoryEntriesFrom(
      image,
      header.nextDirectoryTrack,
      header.nextDirectorySector,
      { includeDeleted: true },
    );
    const sectorMap = {};

    for (let track = 1; track <= geometry.trackCount; track += 1) {
      const sectorCount = d64.trackSectorCount(track);
      const trackInfo = bam.tracks[track - 1];
      for (let sector = 0; sector < sectorCount; sector += 1) {
        const isFree =
          trackInfo && Array.isArray(trackInfo.sectorFree)
            ? trackInfo.sectorFree[sector]
            : null;
        markSector(sectorMap, track, sector, {
          category:
            isFree === true
              ? "free"
              : isFree === false
                ? "unknownUsed"
                : "unknownUsed",
          color:
            isFree === true
              ? DISK_MAP_COLORS.free
              : DISK_MAP_COLORS.unknownUsed,
          stroke: DISK_MAP_COLORS.trackStroke,
          label: isFree === true ? "Free sector" : "Used or untracked sector",
          usedFraction: isFree === true ? 0 : 1,
        });
      }
    }

    markSector(sectorMap, 18, 0, {
      category: "header",
      color: DISK_MAP_COLORS.header,
      stroke: DISK_MAP_COLORS.trackStroke,
      label: "Disk header and BAM sector",
      usedFraction: 1,
    });

    directory.sectors.forEach(function (sectorInfo, index) {
      if (sectorInfo.track === 18 && sectorInfo.sector === 0) return;
      markSector(sectorMap, sectorInfo.track, sectorInfo.sector, {
        category: "directory",
        color: DISK_MAP_COLORS.directory,
        stroke: DISK_MAP_COLORS.trackStroke,
        label: "Directory sector " + String(index + 1),
        usedFraction: 1,
      });
    });

    const activeEntries = directory.entries.filter(function (entry) {
      return entry.typeByte;
    });
    activeEntries.forEach(function (entry) {
      const type = String(entry.fileType || "prg").toLowerCase();
      const usedColor =
        {
          prg: DISK_MAP_COLORS.prgUsed,
          seq: DISK_MAP_COLORS.seqUsed,
          usr: DISK_MAP_COLORS.usrUsed,
          rel: DISK_MAP_COLORS.relUsed,
        }[type] || DISK_MAP_COLORS.prgUsed;
      const tailColor =
        {
          prg: DISK_MAP_COLORS.prgTail,
          seq: DISK_MAP_COLORS.seqTail,
          usr: DISK_MAP_COLORS.usrTail,
          rel: DISK_MAP_COLORS.relTail,
        }[type] || DISK_MAP_COLORS.prgTail;
      try {
        const chain = d64.readFileChain(
          image,
          entry.startTrack,
          entry.startSector,
        );
        chain.blocks.forEach(function (block, blockIndex) {
          markSector(sectorMap, block.track, block.sector, {
            category: type + "Data",
            color: usedColor,
            tailColor: tailColor,
            stroke: DISK_MAP_COLORS.trackStroke,
            label:
              entry.name +
              " (" +
              type.toUpperCase() +
              ") block " +
              String(blockIndex + 1),
            usedFraction: Math.max(
              0,
              Math.min(1, (block.usedBytes || 0) / 254),
            ),
            unusedFraction: Math.max(
              0,
              Math.min(1, (block.unusedBytes || 0) / 254),
            ),
          });
        });
        if (type === "rel" && entry.sideSectorTrack) {
          d64
            .readRelativeSideSectors(
              image,
              entry.sideSectorTrack,
              entry.sideSectorSector,
            )
            .forEach(function (sideSector, sideIndex) {
              markSector(sectorMap, sideSector.track, sideSector.sector, {
                category: "relSide",
                color: DISK_MAP_COLORS.relSide,
                tailColor: DISK_MAP_COLORS.relSideTail,
                stroke: DISK_MAP_COLORS.trackStroke,
                label:
                  entry.name +
                  " (REL side sector " +
                  String(sideIndex + 1) +
                  ")",
                usedFraction: 1,
                unusedFraction: 0,
              });
            });
        }
      } catch (error) {
        markSector(sectorMap, entry.startTrack, entry.startSector, {
          category: "unknownUsed",
          color: DISK_MAP_COLORS.unknownUsed,
          stroke: DISK_MAP_COLORS.trackStroke,
          label:
            entry.name +
            " (" +
            type.toUpperCase() +
            ") could not be fully traced",
          usedFraction: 1,
        });
      }
    });

    return {
      geometry: geometry,
      sectorMap: sectorMap,
      directorySectors: directory.sectors.length,
      activeFiles: activeEntries.length,
    };
  };

  const renderDiskMapLegend = function () {
    diskMapLegend.innerHTML = [
      {
        title: "Disk Structure",
        rows: [
          ["Header", DISK_MAP_COLORS.header, "Track 18 sector 0 disk header"],
          [
            "BAM / Free",
            DISK_MAP_COLORS.free,
            "Free sectors according to the BAM",
          ],
          ["Directory", DISK_MAP_COLORS.directory, "Directory chain sectors"],
          [
            "Used / Unknown",
            DISK_MAP_COLORS.unknownUsed,
            "Used sectors not tied to a decoded file",
          ],
        ],
      },
      {
        title: "File Types",
        rows: [
          [
            "PRG",
            DISK_MAP_COLORS.prgUsed,
            "Dark = used bytes, light = tail bytes",
          ],
          [
            "SEQ",
            DISK_MAP_COLORS.seqUsed,
            "Dark = used bytes, light = tail bytes",
          ],
          [
            "USR",
            DISK_MAP_COLORS.usrUsed,
            "Dark = used bytes, light = tail bytes",
          ],
          ["REL Data", DISK_MAP_COLORS.relUsed, "REL file data sectors"],
          ["REL Side", DISK_MAP_COLORS.relSide, "REL side-sector chain"],
        ],
      },
    ]
      .map(function (group) {
        return (
          '<section class="disk-map-legend-group"><h4>' +
          escapeHtml(group.title) +
          "</h4>" +
          group.rows
            .map(function (row) {
              return (
                '<div class="disk-map-legend-row">' +
                '<span class="disk-map-swatch" style="background:' +
                row[1] +
                '"></span>' +
                "<span><strong>" +
                escapeHtml(row[0]) +
                "</strong><br />" +
                escapeHtml(row[2]) +
                "</span></div>"
              );
            })
            .join("") +
          "</section>"
        );
      })
      .join("");
  };

  const renderDiskMap = function (image) {
    if (!image) {
      diskMapSummary.textContent = "Waiting for an image";
      diskMap.innerHTML =
        "Load or create a disk image to view tracks and sectors.";
      diskMap.className = "disk-map empty-state";
      setHoveredDiskMapSector(null);
      hideDiskMapPointer();
      hideDiskMapTooltip();
      resetDiskMapView();
      syncDiskMapControls();
      renderDiskMapLegend();
      return;
    }

    const layout = buildDiskSectorMap(image);
    const geometry = layout.geometry;
    const platterRadius = DISK_MAP_PHYSICAL.platterRadius;
    const mechanismOuterRadius = DISK_MAP_PHYSICAL.mechanismOuterRadius;
    const mechanismInnerRadius = DISK_MAP_PHYSICAL.mechanismInnerRadius;
    const mechanismTrackCount = DISK_MAP_PHYSICAL.mechanismTrackCount;
    const trackBand =
      (mechanismOuterRadius - mechanismInnerRadius) / mechanismTrackCount;
    const outerRadius = mechanismOuterRadius;
    const innerRadius = outerRadius - trackBand * geometry.trackCount;
    const cx = 275;
    const cy = 300;
    const sectorZeroAngleOffset = DISK_MAP_PHYSICAL.indexHoleAngle;
    const indexHolePoint = polarToCartesian(
      cx,
      cy,
      DISK_MAP_PHYSICAL.indexHoleRadius,
      DISK_MAP_PHYSICAL.indexHoleAngle,
    );
    const sectors = [];

    for (let track = 1; track <= geometry.trackCount; track += 1) {
      const sectorCount = d64.trackSectorCount(track);
      const trackOuter = outerRadius - (track - 1) * trackBand;
      const trackInner = trackOuter - trackBand + 1.1;
      for (let sector = 0; sector < sectorCount; sector += 1) {
        const key = String(track) + ":" + String(sector);
        const info = layout.sectorMap[key];
        const startAngle =
          ((sectorCount - sector - 1) / sectorCount) * Math.PI * 2 +
          sectorZeroAngleOffset;
        const endAngle =
          ((sectorCount - sector) / sectorCount) * Math.PI * 2 +
          sectorZeroAngleOffset;
        const totalFraction =
          info && typeof info.usedFraction === "number" ? info.usedFraction : 1;
        const usedEndAngle =
          startAngle + (endAngle - startAngle) * totalFraction;
        const basePath = describeSectorPath(
          cx,
          cy,
          trackInner,
          trackOuter,
          startAngle,
          endAngle,
        );
        if (info && totalFraction > 0 && totalFraction < 1 && info.tailColor) {
          sectors.push(
            '<path d="' +
              describeSectorPath(
                cx,
                cy,
                trackInner,
                trackOuter,
                startAngle,
                usedEndAngle,
              ) +
              '" class="disk-map-sector" data-track="' +
              String(track) +
              '" data-sector="' +
              String(sector) +
              '" fill="' +
              info.color +
              '" stroke="' +
              info.stroke +
              '" stroke-width="0.5" data-tooltip="' +
              escapeHtml(
                "T" +
                  String(track) +
                  " S" +
                  String(sector) +
                  " · " +
                  info.label +
                  " · " +
                  formatNumber(Math.round(totalFraction * 254)) +
                  " used bytes",
              ) +
              '"></path>',
          );
          sectors.push(
            '<path d="' +
              describeSectorPath(
                cx,
                cy,
                trackInner,
                trackOuter,
                usedEndAngle,
                endAngle,
              ) +
              '" class="disk-map-sector" data-track="' +
              String(track) +
              '" data-sector="' +
              String(sector) +
              '" fill="' +
              info.tailColor +
              '" stroke="' +
              info.stroke +
              '" stroke-width="0.5" data-tooltip="' +
              escapeHtml(
                "T" +
                  String(track) +
                  " S" +
                  String(sector) +
                  " · " +
                  info.label +
                  " · tail bytes",
              ) +
              '"></path>',
          );
        } else {
          sectors.push(
            '<path d="' +
              basePath +
              '" class="disk-map-sector" data-track="' +
              String(track) +
              '" data-sector="' +
              String(sector) +
              '" fill="' +
              (info ? info.color : DISK_MAP_COLORS.unknownUsed) +
              '" stroke="' +
              (info ? info.stroke : DISK_MAP_COLORS.trackStroke) +
              '" stroke-width="0.5" data-tooltip="' +
              escapeHtml(
                "T" +
                  String(track) +
                  " S" +
                  String(sector) +
                  " · " +
                  (info ? info.label : "Sector"),
              ) +
              '"></path>',
          );
        }
      }
      if (track === 1 || track === 18 || track === geometry.trackCount) {
        const labelAngle = Math.PI * 1.5;
        const labelPoint = polarToCartesian(
          cx,
          cy,
          trackInner + trackBand / 2,
          labelAngle,
        );
        sectors.push(
          '<text class="disk-map-track-label" x="' +
            labelPoint.x.toFixed(2) +
            '" y="' +
            labelPoint.y.toFixed(2) +
            '">T' +
            String(track) +
            "</text>",
        );
      }
    }

    diskMapSummary.textContent =
      formatNumber(geometry.trackCount) +
      " tracks · " +
      formatNumber(geometry.sectorCount) +
      " sectors · " +
      formatNumber(layout.activeFiles) +
      " active files";
    diskMap.className = "disk-map";
    diskMap.innerHTML =
      '<svg viewBox="0 0 760 620" role="img" aria-label="' +
      escapeHtml(
        "Disk layout map with " +
          String(geometry.trackCount) +
          " tracks and " +
          String(geometry.sectorCount) +
          " sectors",
      ) +
      '">' +
      "<defs>" +
      '<radialGradient id="disk-platter-fill" cx="45%" cy="38%" r="70%">' +
      '<stop offset="0%" stop-color="#9b7650" />' +
      '<stop offset="48%" stop-color="#7b5a3a" />' +
      '<stop offset="100%" stop-color="#4b3624" />' +
      "</radialGradient>" +
      '<radialGradient id="disk-hub-fill" cx="50%" cy="50%" r="75%">' +
      '<stop offset="0%" stop-color="#10222d" />' +
      '<stop offset="100%" stop-color="#081620" />' +
      "</radialGradient>" +
      '<marker id="disk-spin-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M 1 1 L 9 5 L 1 9" fill="none" stroke="rgba(156, 223, 220, 0.72)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></marker>' +
      "</defs>" +
      '<circle cx="' +
      cx +
      '" cy="' +
      cy +
      '" r="' +
      String(platterRadius + 6) +
      '" fill="url(#disk-platter-fill)" stroke="rgba(207, 177, 137, 0.26)" stroke-width="1.5" />' +
      '<circle cx="' +
      cx +
      '" cy="' +
      cy +
      '" r="' +
      mechanismOuterRadius.toFixed(2) +
      '" fill="none" stroke="rgba(231, 213, 184, 0.14)" stroke-width="1.2" stroke-dasharray="4 6" />' +
      '<circle cx="' +
      cx +
      '" cy="' +
      cy +
      '" r="' +
      mechanismInnerRadius.toFixed(2) +
      '" fill="none" stroke="rgba(231, 213, 184, 0.14)" stroke-width="1.2" stroke-dasharray="4 6" />' +
      '<line x1="' +
      (cx + mechanismInnerRadius + 10) +
      '" y1="' +
      cy +
      '" x2="' +
      (cx + mechanismOuterRadius + 64) +
      '" y2="' +
      cy +
      '" stroke="rgba(215, 190, 155, 0.34)" stroke-width="2" stroke-dasharray="7 7" />' +
      '<line x1="' +
      (cx + mechanismInnerRadius + 10) +
      '" y1="' +
      (cy - 8) +
      '" x2="' +
      (cx + mechanismInnerRadius + 10) +
      '" y2="' +
      (cy + 8) +
      '" stroke="rgba(215, 190, 155, 0.5)" stroke-width="2" />' +
      '<line x1="' +
      (cx + mechanismOuterRadius + 10) +
      '" y1="' +
      (cy - 8) +
      '" x2="' +
      (cx + mechanismOuterRadius + 10) +
      '" y2="' +
      (cy + 8) +
      '" stroke="rgba(215, 190, 155, 0.5)" stroke-width="2" />' +
      '<rect x="' +
      (cx + mechanismOuterRadius + 40) +
      '" y="' +
      (cy - 14) +
      '" width="28" height="28" rx="5" fill="rgba(200, 219, 224, 0.16)" stroke="rgba(215, 237, 240, 0.34)" />' +
      '<path d="M ' +
      (cx + mechanismOuterRadius + 40) +
      " " +
      (cy - 6) +
      " L " +
      (cx + mechanismOuterRadius + 26) +
      " " +
      cy +
      " L " +
      (cx + mechanismOuterRadius + 40) +
      " " +
      (cy + 6) +
      '" fill="rgba(200, 219, 224, 0.22)" stroke="rgba(215, 237, 240, 0.3)" />' +
      '<text class="disk-map-center-subtitle" x="' +
      (cx + mechanismOuterRadius + 54) +
      '" y="' +
      (cy - 22) +
      '">Head path</text>' +
      sectors.join("") +
      '<circle cx="' +
      cx +
      '" cy="' +
      cy +
      '" r="' +
      DISK_MAP_PHYSICAL.spindleRadius.toFixed(2) +
      '" fill="url(#disk-hub-fill)" stroke="rgba(185, 227, 242, 0.18)" />' +
      '<circle cx="' +
      indexHolePoint.x.toFixed(2) +
      '" cy="' +
      indexHolePoint.y.toFixed(2) +
      '" r="' +
      DISK_MAP_PHYSICAL.indexHoleSize.toFixed(2) +
      '" fill="rgba(20, 14, 10, 0.9)" stroke="rgba(228, 197, 154, 0.14)" stroke-width="0.9" />' +
      '<path d="' +
      describeArcPath(
        cx,
        cy,
        Math.max(DISK_MAP_PHYSICAL.spindleRadius - 14, 24),
        Math.PI * 1.22,
        Math.PI * 2.68,
      ) +
      '" fill="none" stroke="rgba(156, 223, 220, 0.72)" stroke-width="3" stroke-linecap="round" marker-end="url(#disk-spin-arrow)" />' +
      '<text class="disk-map-center-label" x="' +
      cx +
      '" y="' +
      (cy - 6) +
      '">D64</text>' +
      "</svg>";
    applyDiskMapTransform();
    syncDiskMapControls();
    renderDiskMapLegend();
  };

  const renderDeletedFiles = function () {
    const deletedFiles = state.image ? d64.readDeletedEntries(state.image) : [];
    deletedCount.textContent =
      deletedFiles.length.toString() +
      (deletedFiles.length === 1 ? " entry" : " entries");

    if (!deletedFiles.length) {
      deletedFilesPanel.hidden = true;
      deletedFilesList.innerHTML = "";
      return;
    }

    deletedFilesPanel.hidden = false;
    deletedFilesList.innerHTML = deletedFiles
      .map(function (entry) {
        const hintedType =
          state.deletedTypeHints[entry.index] ||
          (entry.sideSectorTrack ? "rel" : "prg");
        return (
          '<article class="deleted-file-card">' +
          "<div>" +
          '<div class="deleted-file-name">' +
          escapeHtml(entry.name) +
          "</div>" +
          '<div class="deleted-file-meta">' +
          "Deleted entry" +
          " · " +
          escapeHtml(formatNumber((entry.blockCount || 0) * 254)) +
          " bytes" +
          "</div>" +
          "</div>" +
          '<div class="restore-controls">' +
          '<label class="restore-type-field"><span>Type</span><select data-restore-type="' +
          String(entry.index) +
          '">' +
          '<option value=""' +
          (hintedType ? "" : " selected") +
          ">Unknown...</option>" +
          '<option value="prg"' +
          (hintedType === "prg" ? " selected" : "") +
          ">PRG</option>" +
          '<option value="seq"' +
          (hintedType === "seq" ? " selected" : "") +
          ">SEQ</option>" +
          '<option value="usr"' +
          (hintedType === "usr" ? " selected" : "") +
          ">USR</option>" +
          '<option value="rel"' +
          (hintedType === "rel" ? " selected" : "") +
          ">REL</option>" +
          "</select></label>" +
          '<button type="button" class="restore-button" data-action="restore-file" data-entry-index="' +
          String(entry.index) +
          '">Restore</button>' +
          "</div>" +
          "</article>"
        );
      })
      .join("");
  };

  const refreshView = function () {
    if (!state.image) {
      renderDefinitionList(headerSummary, [
        { label: "Status", value: "No image loaded" },
      ]);
      renderDefinitionList(usageSummary, [
        { label: "Status", value: "Waiting for an image" },
      ]);
      renderUsageChart(null);
      renderDiskMap(null);
      renderDeletedFiles();
      directoryCount.textContent = "0 entries";
      fileTableBody.innerHTML =
        '<tr><td colspan="7" class="empty-state">Load or create a disk image to see directory entries.</td></tr>';
      setCurrentImage(null, "");
      return;
    }

    const header = d64.readHeader(state.image);
    const files = d64.readFiles(state.image);
    const deletedEntries = d64.readDeletedEntries(state.image);
    const usage = d64.estimateImageUsage(files, {
      trackCount: header.trackCount,
      hasErrorInfo: header.hasErrorInfo,
    });
    const geometry = d64.describeGeometry(state.image);
    const totalPayloadBytes = files.reduce(function (sum, file) {
      return sum + ((file.data && file.data.length) || 0);
    }, 0);
    const directoryReservedBytes = usage.directorySectors * 256;
    const allocatedSectorBytes = usage.totalFileSectors * 256;
    const fileOverheadBytes = Math.max(
      0,
      allocatedSectorBytes - totalPayloadBytes,
    );
    const freeBytes = Math.max(
      0,
      geometry.dataSize - directoryReservedBytes - allocatedSectorBytes,
    );

    renderDefinitionList(headerSummary, [
      { label: "Disk Name", value: toDisplayValue(header.diskName) },
      {
        label: "Disk ID / DOS",
        value:
          toDisplayValue(header.diskId) +
          " / " +
          toDisplayValue(header.dosType),
      },
      { label: "Format", value: toDisplayValue(header.format) },
      {
        label: "Tracks / Sectors",
        value:
          toDisplayValue(header.trackCount) +
          " / " +
          toDisplayValue(header.sectorCount),
      },
      { label: "DOS Version", value: toDisplayValue(header.dosVersionName) },
      { label: "Error Info", value: header.hasErrorInfo ? "Yes" : "No" },
    ]);

    renderDefinitionList(usageSummary, [
      {
        label: "Image / Data",
        value:
          formatNumber(geometry.imageSize) +
          " / " +
          formatNumber(geometry.dataSize) +
          " bytes",
      },
      { label: "File Count", value: String(files.length) },
      {
        label: "File / Dir Sectors",
        value:
          formatNumber(usage.totalFileSectors) +
          " / " +
          formatNumber(usage.directorySectors),
      },
      { label: "Payload Bytes", value: formatNumber(totalPayloadBytes) },
      { label: "Free Bytes", value: formatNumber(freeBytes) },
    ]);
    renderUsageChart([
      {
        label: "File payload",
        value: totalPayloadBytes,
        color: "#8ef3e6",
      },
      {
        label: "File overhead",
        value: fileOverheadBytes,
        color: "#ffd36b",
      },
      {
        label: "Directory reserved",
        value: directoryReservedBytes,
        color: "#ff8e90",
      },
      {
        label: "Free space",
        value: freeBytes,
        color: "#3f82ff",
      },
    ]);
    renderDiskMap(state.image);

    directoryCount.textContent =
      files.length.toString() +
      (files.length === 1 ? " entry" : " entries") +
      (deletedEntries.length ? " · " + deletedEntries.length + " deleted" : "");
    renderDeletedFiles();

    if (!files.length) {
      fileTableBody.innerHTML =
        '<tr><td colspan="7" class="empty-state">This disk has no directory entries.</td></tr>';
      return;
    }

    fileTableBody.innerHTML = files
      .map(function (file) {
        return (
          "<tr>" +
          "<td>" +
          escapeHtml(file.name) +
          "</td>" +
          "<td>" +
          escapeHtml(String(file.type || "").toUpperCase()) +
          "</td>" +
          "<td>" +
          escapeHtml(String((file.entry && file.entry.blockCount) || 0)) +
          "</td>" +
          "<td>" +
          escapeHtml(formatNumber((file.data && file.data.length) || 0)) +
          "</td>" +
          "<td>" +
          flagMarkup(file.closed, {
            trueClass: "good",
            falseClass: "warn",
            trueText: "Closed",
            falseText: "Open",
            action: "toggle-closed",
            fileName: file.name,
            ariaLabel:
              (file.closed ? "Mark open " : "Mark closed ") + file.name,
          }) +
          "</td>" +
          "<td>" +
          flagMarkup(file.locked, {
            trueClass: "bad",
            falseClass: "good",
            trueText: "Locked",
            falseText: "Unlocked",
            action: "toggle-lock",
            fileName: file.name,
            ariaLabel: (file.locked ? "Unlock " : "Lock ") + file.name,
          }) +
          "</td>" +
          "<td>" +
          '<button type="button" class="delete-button" data-action="delete-file" data-name="' +
          escapeHtml(file.name) +
          '" aria-label="' +
          escapeHtml("Delete " + file.name) +
          '">Delete</button>' +
          "</td>" +
          "</tr>"
        );
      })
      .join("");
  };

  const loadImageBytes = function (bytes, sourceName, message, options) {
    const config = options || {};
    if (config.resetDeletedTypeHints !== false) {
      resetDeletedTypeHints();
    }
    setCurrentImage(bytes, sourceName);
    updateDownloadLinkState();
    refreshView();
    resetDiskMapView();
    setStatus(message || "Disk image ready.");
  };

  const createDiskImage = function (event) {
    event.preventDefault();
    try {
      const options = {
        diskName: String(diskNameInput.value || "").trim() || "TEST LAB",
        diskId: normalizeDiskId(diskIdInput.value),
        format: diskFormatSelect.value,
        name: String(diskNameInput.value || "").trim() || "TEST LAB",
      };
      const image = d64.buildImage([], options);
      if (!image) {
        throw new Error("Unable to create an empty D64 image.");
      }
      loadImageBytes(
        image,
        d64.fileName(options),
        "Created a new blank D64 image.",
      );
    } catch (error) {
      setStatus(error.message || String(error), true);
    }
  };

  const loadSelectedFile = async function () {
    const file = imageUpload.files && imageUpload.files[0];
    if (!file) {
      setStatus("Choose a .d64 file first.", true);
      return;
    }
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      loadImageBytes(bytes, file.name, "Loaded existing D64 image.");
    } catch (error) {
      setStatus(error.message || String(error), true);
    }
  };

  const downloadCurrentImage = function () {
    if (!state.image || !state.objectUrl) return;
    const link = document.createElement("a");
    link.href = state.objectUrl;
    link.download = state.sourceName || "disk.d64";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setStatus("Downloaded current D64 image.");
  };

  const updateFileFlag = function (action, fileName) {
    if (!state.image) return;
    try {
      let nextImage = state.image;
      if (action === "toggle-lock") {
        const file = d64.readFiles(state.image).find(function (entry) {
          return entry.name === fileName;
        });
        nextImage =
          file && file.locked
            ? d64.unlockFile(state.image, fileName)
            : d64.lockFile(state.image, fileName);
      } else if (action === "toggle-closed") {
        const file = d64.readFiles(state.image).find(function (entry) {
          return entry.name === fileName;
        });
        nextImage =
          file && file.closed
            ? d64.openFile(state.image, fileName)
            : d64.closeFile(state.image, fileName);
      }
      loadImageBytes(
        nextImage,
        state.sourceName || "disk.d64",
        "Updated file flags for " + fileName + ".",
      );
    } catch (error) {
      setStatus(error.message || String(error), true);
    }
  };

  const deleteFile = function (fileName) {
    if (!state.image) return;
    try {
      const file = d64.readFiles(state.image).find(function (entry) {
        return entry.name === fileName;
      });
      if (!file || !file.entry) {
        throw new Error("File not found: " + fileName);
      }
      state.deletedTypeHints[file.entry.index] = String(file.type || "")
        .trim()
        .toLowerCase();
      loadImageBytes(
        d64.scratchFile(state.image, fileName),
        state.sourceName || "disk.d64",
        "Deleted " + fileName + ".",
        { resetDeletedTypeHints: false },
      );
    } catch (error) {
      setStatus(error.message || String(error), true);
    }
  };

  const restoreDeletedFile = function (entryIndex, restoreType) {
    if (!state.image) return;
    try {
      const deletedEntry = d64
        .readDeletedEntries(state.image)
        .find(function (entry) {
          return String(entry.index) === String(entryIndex);
        });
      if (!deletedEntry) throw new Error("Deleted file not found.");
      loadImageBytes(
        d64.undeleteFile(state.image, deletedEntry, { type: restoreType }),
        state.sourceName || "disk.d64",
        "Restored " +
          deletedEntry.name +
          " as " +
          restoreType.toUpperCase() +
          ".",
        { resetDeletedTypeHints: false },
      );
      delete state.deletedTypeHints[deletedEntry.index];
    } catch (error) {
      setStatus(error.message || String(error), true);
    }
  };

  const startDiskMapDrag = function (event) {
    if (
      !state.image ||
      !diskMap.querySelector("svg") ||
      diskMapView.scale <= 1.01
    )
      return;
    diskMapView.dragging = true;
    diskMapView.dragStartX = event.clientX;
    diskMapView.dragStartY = event.clientY;
    diskMapView.originOffsetX = diskMapView.offsetX;
    diskMapView.originOffsetY = diskMapView.offsetY;
    diskMap.classList.add("is-dragging");
  };

  const moveDiskMapDrag = function (event) {
    if (!diskMapView.dragging) return;
    diskMapView.offsetX =
      diskMapView.originOffsetX + (event.clientX - diskMapView.dragStartX);
    diskMapView.offsetY =
      diskMapView.originOffsetY + (event.clientY - diskMapView.dragStartY);
    applyDiskMapTransform();
  };

  const stopDiskMapDrag = function () {
    if (!diskMapView.dragging) return;
    diskMapView.dragging = false;
    diskMap.classList.remove("is-dragging");
  };

  const initialize = function () {
    const missing = REQUIRED_API.filter(function (name) {
      return !d64 || typeof d64[name] !== "function";
    });
    if (missing.length) {
      setStatus(
        "Missing D64 helpers: " + missing.join(", ") + ". Check support.js.",
        true,
      );
      createForm.querySelector("button").disabled = true;
      return;
    }

    createForm.addEventListener("submit", createDiskImage);
    imageUpload.addEventListener("change", function () {
      if (imageUpload.files && imageUpload.files[0]) {
        setStatus("Loading " + imageUpload.files[0].name + "...");
        loadSelectedFile();
      }
    });
    downloadButton.addEventListener("click", downloadCurrentImage);
    diskMapZoomIn.addEventListener("click", function () {
      zoomDiskMap(1);
    });
    diskMapZoomOut.addEventListener("click", function () {
      zoomDiskMap(-1);
    });
    diskMapZoomReset.addEventListener("click", function () {
      resetDiskMapView();
    });
    diskMap.addEventListener("wheel", function (event) {
      if (!state.image) return;
      event.preventDefault();
      zoomDiskMapByWheel(event.deltaY, event.clientX, event.clientY);
    });
    diskMap.addEventListener("mousemove", function (event) {
      if (diskMapView.dragging) {
        setHoveredDiskMapSector(null);
        hideDiskMapPointer();
        hideDiskMapTooltip();
        return;
      }
      const target = event.target.closest("[data-tooltip]");
      if (!target) {
        setHoveredDiskMapSector(null);
        hideDiskMapPointer();
        hideDiskMapTooltip();
        return;
      }
      setHoveredDiskMapSector(target);
      showDiskMapPointer(target.dataset.track, target.dataset.sector);
      showDiskMapTooltip(
        target.getAttribute("data-tooltip"),
        event.clientX,
        event.clientY,
      );
    });
    diskMap.addEventListener("mouseleave", function () {
      setHoveredDiskMapSector(null);
      hideDiskMapPointer();
      hideDiskMapTooltip();
    });
    diskMap.addEventListener("mousedown", function (event) {
      if (event.button !== 0) return;
      event.preventDefault();
      startDiskMapDrag(event);
    });
    window.addEventListener("mousemove", moveDiskMapDrag);
    window.addEventListener("mouseup", stopDiskMapDrag);
    diskMap.addEventListener("mouseleave", function () {
      if (!diskMapView.dragging) return;
    });
    refreshButton.addEventListener("click", function () {
      try {
        refreshView();
        setStatus("Re-read the current disk image.");
      } catch (error) {
        setStatus(error.message || String(error), true);
      }
    });
    fileTableBody.addEventListener("click", function (event) {
      const button = event.target.closest("button[data-action]");
      if (!button) return;
      if (button.dataset.action === "delete-file") {
        deleteFile(button.dataset.name);
        return;
      }
      updateFileFlag(button.dataset.action, button.dataset.name);
    });
    deletedFilesList.addEventListener("click", function (event) {
      const button = event.target.closest("button[data-action='restore-file']");
      if (!button) return;
      const select = deletedFilesList.querySelector(
        "select[data-restore-type='" + button.dataset.entryIndex + "']",
      );
      restoreDeletedFile(
        button.dataset.entryIndex,
        select ? select.value : "prg",
      );
    });
    window.addEventListener("beforeunload", releaseObjectUrl);
    syncDiskMapControls();

    refreshView();
    setStatus(
      "D64 helpers ready. Create a blank image or load an existing one.",
    );
  };

  initialize();
})();
