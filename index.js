(function () {
  const d64 = window.TPP && window.TPP.d64;

  const state = {
    image: null,
    sourceName: "",
    objectUrl: null,
    deletedTypeHints: {},
    diskLayout: null,
    selectedSectorKey: "",
    diskCoverVisible: false,
  };

  const createForm = document.getElementById("create-form");
  const createDialog = document.getElementById("create-dialog");
  const createButton = document.getElementById("create-button");
  const createCancel = document.getElementById("create-cancel");
  const loadButton = document.getElementById("load-button");
  const diskNameInput = document.getElementById("disk-name");
  const diskIdInput = document.getElementById("disk-id");
  const diskFormatSelect = document.getElementById("disk-format");
  const imageUpload = document.getElementById("image-upload");
  const downloadButton = document.getElementById("download-button");
  const fragmentButton = document.getElementById("fragment-button");
  const defragmentButton = document.getElementById("defragment-button");
  const currentFileName = document.getElementById("current-file-name");
  const status = document.getElementById("status");
  const headerSummary = document.getElementById("header-summary");
  const usageSummary = document.getElementById("usage-summary");
  const usageChartPanel = document.getElementById("usage-chart-panel");
  const usageChart = document.getElementById("usage-chart");
  const usageLegend = document.getElementById("usage-legend");
  const diskMapFrame = document.getElementById("disk-map-frame");
  const diskMap = document.getElementById("disk-map");
  const diskMapPointer = document.getElementById("disk-map-pointer");
  const diskMapTooltip = document.getElementById("disk-map-tooltip");
  const diskDropHint = document.getElementById("disk-drop-hint");
  const diskMapLegend = document.getElementById("disk-map-legend");
  const diskMapSummary = document.getElementById("disk-map-summary");
  const diskMapCoverToggle = document.getElementById("disk-map-cover-toggle");
  const diskMapZoomIn = document.getElementById("disk-map-zoom-in");
  const diskMapZoomOut = document.getElementById("disk-map-zoom-out");
  const diskMapZoomReset = document.getElementById("disk-map-zoom-reset");
  const directoryCount = document.getElementById("directory-count");
  const fileTableBody = document.getElementById("file-table-body");
  const deletedFilesPanel = document.getElementById("deleted-files-panel");
  const deletedCount = document.getElementById("deleted-count");
  const deletedFilesList = document.getElementById("deleted-files-list");
  const fileTypeDialog = document.getElementById("file-type-dialog");
  const fileTypeForm = document.getElementById("file-type-form");
  const fileTypeDialogName = document.getElementById("file-type-dialog-name");
  const fileTypeTarget = document.getElementById("file-type-target");
  const fileTypeSelect = document.getElementById("file-type-select");
  const fileRecordLengthField = document.getElementById(
    "file-record-length-field",
  );
  const fileRecordLengthInput = document.getElementById(
    "file-record-length-input",
  );
  const fileTypeCancel = document.getElementById("file-type-cancel");
  const fileNameDialog = document.getElementById("file-name-dialog");
  const fileNameForm = document.getElementById("file-name-form");
  const fileNameDialogName = document.getElementById("file-name-dialog-name");
  const fileNameTarget = document.getElementById("file-name-target");
  const fileNameInput = document.getElementById("file-name-input");
  const fileNameCancel = document.getElementById("file-name-cancel");
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
    "fragmentImage",
    "defragmentImage",
    "addFile",
    "trackSectorCount",
  ];
  const DISK_MAP_COLORS = Object.freeze({
    free: "#6f5133",
    unknownUsed: "#6c8ea3",
    reservedTrack: "#7d8c98",
    reservedTrackFree: "#4f3823",
    reservedTrackStroke: "rgba(255,255,255,0.08)",
    header: "#f2a65a",
    bam: "#ffd166",
    directory: "#7ed6df",
    prgUsed: "#00d1b2",
    prgTail: "#98f5e1",
    seqUsed: "#4dabf7",
    seqTail: "#a9dcff",
    usrUsed: "#c77dff",
    usrTail: "#e0b8ff",
    relUsed: "#f59f00",
    relTail: "#ffd37a",
    relSide: "#ff9f43",
    relSideTail: "#ffd3a1",
    deleted: "#e03131",
    deletedTail: "#ff8787",
    trackStroke: "rgba(255,255,255,0.08)",
  });
  const SHELL_COLOR_PRESETS = Object.freeze([
    {
      id: "black",
      label: "Black",
      popularity: 62,
      swatch: "#262a31",
      stops: ["#4a5059", "#30353d", "#1d2127"],
    },
    {
      id: "dark-blue",
      label: "Dark Blue",
      popularity: 12,
      swatch: "#3f536f",
      stops: ["#6982a2", "#4d6482", "#2e3d52"],
    },
    {
      id: "light-blue",
      label: "Light Blue / Cyan",
      popularity: 5,
      swatch: "#79b9d4",
      stops: ["#b1dce8", "#83bfd5", "#5c96af"],
    },
    {
      id: "red",
      label: "Red",
      popularity: 4,
      swatch: "#bb4f49",
      stops: ["#de8d84", "#c76059", "#923a36"],
    },
    {
      id: "green",
      label: "Green",
      popularity: 3.5,
      swatch: "#5f8a53",
      stops: ["#92b184", "#719b63", "#4a6b40"],
    },
    {
      id: "yellow",
      label: "Yellow",
      popularity: 3,
      swatch: "#d2be55",
      stops: ["#efe08e", "#dcc75f", "#a79034"],
    },
    {
      id: "orange",
      label: "Orange",
      popularity: 2,
      swatch: "#d18849",
      stops: ["#ebb17d", "#d99358", "#a76631"],
    },
    {
      id: "off-white",
      label: "White / Off-white",
      popularity: 2.5,
      swatch: "#d9d6ca",
      stops: ["#f0ede6", "#d8d3c5", "#b9b3a4"],
    },
    {
      id: "gray",
      label: "Gray",
      popularity: 1.5,
      swatch: "#8f969d",
      stops: ["#b5bcc3", "#8f969d", "#717980"],
    },
    {
      id: "beige",
      label: "Tan / Beige / Cream",
      popularity: 1.5,
      swatch: "#cbb798",
      stops: ["#e5d5bc", "#ccb799", "#aa926f"],
    },
    {
      id: "purple",
      label: "Purple / Violet / Pink",
      popularity: 1.25,
      swatch: "#a472b5",
      stops: ["#d2b0df", "#ab7abb", "#7b4f8f"],
    },
    {
      id: "brown",
      label: "Brown",
      popularity: 0.5,
      swatch: "#7d5740",
      stops: ["#a98268", "#7f5a41", "#5f422f"],
    },
    {
      id: "smoke",
      label: "Frosted / Smoke",
      popularity: 0.5,
      swatch: "#8ea3a9",
      stops: ["#c7d5d8", "#9fb0b4", "#72848a"],
    },
    {
      id: "novelty",
      label: "Metallic / Novelty",
      popularity: 0.25,
      swatch: "#9f9180",
      stops: ["#d3c8bc", "#a89a88", "#786d60"],
    },
  ]);
  const LABEL_STYLE_PRESETS = Object.freeze([
    { id: "standard", label: "Standard top", weight: 45 },
    { id: "commercial", label: "Commercial print", weight: 15 },
    { id: "no-label", label: "No label", weight: 15 },
    { id: "smaller", label: "Smaller top", weight: 10 },
    { id: "narrow", label: "Narrow strip", weight: 6 },
    { id: "colored", label: "Colored label", weight: 4 },
    { id: "layered", label: "Layered labels", weight: 3 },
    { id: "corner", label: "Corner label", weight: 2 },
  ]);
  const DISK_MAP_PHYSICAL = Object.freeze({
    indexHoleAngle: Math.PI * 0.58,
    indexHoleRadius: 60,
    indexHoleSize: 4.2,
    spindleRadius: 50,
    spindleOutlineRadius: 58,
    spindleHoleRadius: 46,
    headWindowOffsetX: 0,
    headWindowOffsetY: 148,
    headWindowWidth: 46,
    headWindowHeight: 176,
    headWindowRadius: 22,
    platterRadius: 246,
    mechanismOuterRadius: 226,
    mechanismInnerRadius: 104,
    mechanismTrackCount: 40,
    shellX: 17,
    shellY: 20,
    shellWidth: 516,
    shellHeight: 516,
    shellRadius: 18,
    labelX: 30,
    labelY: 30,
    labelWidth: 490,
    labelHeight: 70,
  });
  const DISK_MAP_VIEWBOX = Object.freeze({
    width: 760,
    height: 620,
    diskCenterX: 275,
    diskCenterY: 276,
  });
  const diskMapView = {
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    dragging: false,
    dragMoved: false,
    dragStartX: 0,
    dragStartY: 0,
    originOffsetX: 0,
    originOffsetY: 0,
    hoveredSectorElement: null,
    selectedSectorElement: null,
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

  const formatExactBytes = function (value) {
    const bytes = Math.max(0, Math.round(Number(value) || 0));
    return formatNumber(bytes) + " bytes";
  };

  const formatByteSize = function (value) {
    const bytes = Math.max(0, Number(value) || 0);
    const units = ["b", "kb", "mb", "gb", "tb"];
    let unitIndex = 0;
    let scaled = bytes;
    while (scaled >= 1000 && unitIndex < units.length - 1) {
      scaled /= 1024;
      unitIndex += 1;
    }
    const decimals = unitIndex > 0 && scaled < 100 ? 1 : 0;
    const rounded = decimals
      ? Math.round(scaled * 10) / 10
      : Math.round(scaled);
    return (
      String(decimals ? rounded.toFixed(1).replace(/\.0$/, "") : rounded) +
      units[unitIndex]
    );
  };

  const formatByteHtml = function (value) {
    return (
      '<span title="' +
      escapeHtml(formatExactBytes(value)) +
      '">' +
      escapeHtml(formatByteSize(value)) +
      "</span>"
    );
  };

  const inferDroppedFileType = function (name) {
    const extension = String(name || "")
      .trim()
      .toLowerCase()
      .match(/\.([^.]+)$/);
    const ext = extension ? extension[1] : "";
    if (["prg", "p00", "bas"].includes(ext)) return "prg";
    if (["usr", "u00"].includes(ext)) return "usr";
    if (["rel", "r00"].includes(ext)) return "rel";
    if (["seq", "s00"].includes(ext)) return "seq";
    return "seq";
  };

  const normalizeDroppedFileName = function (name) {
    const trimmed = String(name || "").trim();
    if (!trimmed) return "UNTITLED";
    return (
      d64.normalizeFileName(trimmed.replace(/\.[^.]+$/, "").trim(), 16) ||
      d64.normalizeFileName(trimmed, 16) ||
      "UNTITLED"
    );
  };

  const hasDuplicateFileName = function (nextName, currentName) {
    if (!state.image) return false;
    const normalizedNextName = d64.normalizeFileName(nextName, 16);
    const normalizedCurrentName = d64.normalizeFileName(currentName, 16);
    return d64.readFiles(state.image).some(function (entry) {
      const entryName = d64.normalizeFileName(entry.name, 16);
      return (
        entryName === normalizedNextName && entryName !== normalizedCurrentName
      );
    });
  };

  const validateFileNameInput = function () {
    const nextName = d64.normalizeFileName(fileNameInput.value, 16);
    if (!nextName) {
      fileNameInput.setCustomValidity("File name can not be empty.");
      return false;
    }
    if (hasDuplicateFileName(nextName, fileNameTarget.value)) {
      fileNameInput.setCustomValidity("A file with that name already exists.");
      return false;
    }
    fileNameInput.setCustomValidity("");
    return true;
  };

  const toggleDiskDropTarget = function (isActive) {
    diskMapFrame.classList.toggle("is-file-drop-target", Boolean(isActive));
    diskDropHint.hidden = !isActive;
  };

  const syncFileTypeDialog = function () {
    const isRel = fileTypeSelect.value === "rel";
    fileRecordLengthField.hidden = !isRel;
  };

  const isFileDragEvent = function (event) {
    const types =
      event &&
      event.dataTransfer &&
      event.dataTransfer.types &&
      Array.from(event.dataTransfer.types);
    return Boolean(types && types.includes("Files"));
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
    fragmentButton.disabled = !state.image;
    defragmentButton.disabled = !state.image;
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
          (row.html != null ? row.html : escapeHtml(row.value)) +
          "</dd></div>"
        );
      })
      .join("");
  };

  const hashDiskName = function (value) {
    const text =
      String(value || "")
        .trim()
        .toUpperCase() || "UNTITLED";
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  };

  const pickShellColorPreset = function (diskName) {
    const hash = hashDiskName(diskName);
    const totalWeight = SHELL_COLOR_PRESETS.reduce(function (sum, preset) {
      return sum + preset.popularity;
    }, 0);
    const target = (hash / 0xffffffff) * totalWeight;
    let running = 0;
    for (let index = 0; index < SHELL_COLOR_PRESETS.length; index += 1) {
      const preset = SHELL_COLOR_PRESETS[index];
      running += preset.popularity;
      if (target <= running) return preset;
    }
    return SHELL_COLOR_PRESETS[0];
  };

  const pickWeightedPreset = function (presets, hash) {
    const totalWeight = presets.reduce(function (sum, preset) {
      return sum + preset.weight;
    }, 0);
    const target = ((hash >>> 0) / 0xffffffff) * totalWeight;
    let running = 0;
    for (let index = 0; index < presets.length; index += 1) {
      const preset = presets[index];
      running += preset.weight;
      if (target <= running) return preset;
    }
    return presets[0];
  };

  const randomUnitFromHash = function (hash) {
    return (hash >>> 0) / 0xffffffff;
  };

  const inferDeletedEntryType = function (entry) {
    const hintedType = state.deletedTypeHints[entry.index];
    if (hintedType) return hintedType;
    if (entry.sideSectorTrack) return "rel";
    return "prg";
  };

  const buildLabelLayout = function (diskName, diskId, shellPreset) {
    const key =
      String(diskName || "")
        .trim()
        .toUpperCase() +
      "|" +
      String(diskId || "")
        .trim()
        .toUpperCase();
    const styleHash = hashDiskName(key);
    const offsetHash = hashDiskName(key + "|OFFSET");
    const rotateHash = hashDiskName(key + "|ROTATE");
    const colorHash = hashDiskName(key + "|COLOR");
    const style = pickWeightedPreset(LABEL_STYLE_PRESETS, styleHash);
    const shellX = DISK_MAP_PHYSICAL.shellX;
    const shellY = DISK_MAP_PHYSICAL.shellY;
    const shellWidth = DISK_MAP_PHYSICAL.shellWidth;
    const shellHeight = DISK_MAP_PHYSICAL.shellHeight;
    const topMargin = 12;
    const centeredX = shellX + shellWidth * 0.5;
    const offsetUnit = ((offsetHash >>> 0) / 0xffffffff - 0.5) * 10;
    const rotation = (((rotateHash >>> 0) / 0xffffffff) * 2 - 1) * 2.2;
    const pastelLabels = [
      ["#fbf6d3", "#efe2a3"],
      ["#e6f0ff", "#b8d4ff"],
      ["#ffe4ef", "#f2b7ce"],
      ["#e2f7e7", "#bce3c1"],
    ];
    const pastel =
      pastelLabels[
        Math.floor(((colorHash >>> 0) / 0xffffffff) * pastelLabels.length) %
          pastelLabels.length
      ];
    const base = {
      id: style.id,
      x: shellX + shellWidth * 0.12,
      y: shellY + topMargin,
      width: shellWidth * 0.76,
      height: shellHeight * 0.28,
      rx: 14,
      rotate: rotation,
      fillStops: ["#f7f3e5", "#ece3ca"],
      secondaryLabel: null,
      textMode: "label",
      titleScale: 1,
      noteScale: 1,
    };
    if (style.id === "commercial") {
      base.x = shellX + shellWidth * 0.09;
      base.width = shellWidth * 0.82;
      base.height = shellHeight * 0.29;
      base.rotate = rotation * 0.35;
      base.titleScale = 0.96;
      return base;
    }
    if (style.id === "smaller") {
      base.x = shellX + shellWidth * 0.14;
      base.width = shellWidth * 0.72;
      base.height = shellHeight * 0.24;
      base.y += 2;
      base.rotate = rotation * 0.7;
      base.titleScale = 0.94;
      return base;
    }
    if (style.id === "narrow") {
      base.x = shellX + shellWidth * 0.12;
      base.width = shellWidth * 0.76;
      base.height = shellHeight * 0.18;
      base.y += 4;
      base.rotate = rotation * 0.45;
      base.titleScale = 0.82;
      base.noteScale = 0.82;
      return base;
    }
    if (style.id === "corner") {
      base.x = shellX + shellWidth * 0.54;
      base.width = shellWidth * 0.34;
      base.height = shellHeight * 0.18;
      base.y += 5;
      base.rotate = rotation * 0.35;
      base.titleScale = 0.72;
      base.noteScale = 0.7;
      return base;
    }
    if (style.id === "colored") {
      base.fillStops = pastel;
      base.rotate = rotation * 0.65;
      return base;
    }
    if (style.id === "layered") {
      base.rotate = rotation * 0.5;
      base.secondaryLabel = {
        x: base.x + 8,
        y: base.y + 5,
        width: base.width * 0.96,
        height: base.height * 0.92,
        rx: 13,
        rotate: base.rotate + 1.3,
        fillStops: ["#f4ead6", "#e6d7b7"],
      };
      return base;
    }
    if (style.id === "no-label") {
      return {
        id: style.id,
        x: shellX + 18,
        y: shellY + 18,
        width: 0,
        height: 0,
        rx: 0,
        rotate: 0,
        fillStops: null,
        secondaryLabel: null,
        textMode: "shell",
        titleScale: 0.92,
        noteScale: 0.8,
      };
    }
    base.x += offsetUnit;
    base.rotate = rotation * 0.55;
    return base;
  };

  const buildCoverLayout = function (diskName, diskId) {
    const key =
      String(diskName || "")
        .trim()
        .toUpperCase() +
      "|" +
      String(diskId || "")
        .trim()
        .toUpperCase();
    const styleHash = hashDiskName(key + "|COVER");
    const tiltHash = hashDiskName(key + "|COVER_TILT");
    const styles = [
      {
        id: "cream-red",
        fill: "#eee4cd",
        stroke: "#c8b58d",
        accent: "#b03b38",
        text: "#2f2b28",
        motif: "band",
      },
      {
        id: "blue-white",
        fill: "#2f5f9a",
        stroke: "#183a67",
        accent: "#f5f7fb",
        text: "#f3f8ff",
        motif: "panel",
      },
      {
        id: "black-grid",
        fill: "#1f2329",
        stroke: "#090b0e",
        accent: "#f0f2f5",
        text: "#fafcff",
        motif: "grid",
      },
      {
        id: "tan-typed",
        fill: "#d8c3a0",
        stroke: "#ae9470",
        accent: "#7d4a2d",
        text: "#3d2f22",
        motif: "typed",
      },
      {
        id: "magenta-label",
        fill: "#be4d82",
        stroke: "#8b2f5c",
        accent: "#f7e7ef",
        text: "#fff7fb",
        motif: "block",
      },
      {
        id: "white-dotmatrix",
        fill: "#f2f0e7",
        stroke: "#cbc6b6",
        accent: "#d96c3f",
        text: "#2f3134",
        motif: "dot",
      },
    ];
    const style =
      styles[
        Math.floor(randomUnitFromHash(styleHash) * styles.length) %
          styles.length
      ];
    return {
      style: style,
      tilt: (randomUnitFromHash(tiltHash) * 2 - 1) * 1.6,
    };
  };

  const collectCoverPrograms = function (image) {
    const header = d64.readHeader(image);
    const entries = d64.readDirectoryEntriesFrom(
      image,
      header.nextDirectoryTrack,
      header.nextDirectorySector,
      { includeDeleted: true },
    ).entries;
    return entries
      .map(function (entry) {
        const type = entry.typeByte
          ? String(entry.fileType || "").toLowerCase()
          : inferDeletedEntryType(entry);
        return {
          name: entry.name,
          deleted: entry.deleted === true,
          type: type,
          index: entry.index,
        };
      })
      .filter(function (entry) {
        return entry.type === "prg" && String(entry.name || "").trim();
      });
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
    diskMapCoverToggle.disabled = !hasImage;
    diskMapCoverToggle.textContent = state.diskCoverVisible
      ? "Show Media"
      : "Show Cover";
    diskMapZoomIn.disabled = !hasImage;
    diskMapZoomOut.disabled = !hasImage;
    diskMapZoomReset.disabled = !hasImage;
  };

  const resetDiskMapView = function () {
    const svg = diskMap.querySelector("svg");
    if (svg) {
      const targetFillRatio = 0.98;
      const scaleX = svg.clientWidth / DISK_MAP_VIEWBOX.width;
      const scaleY = svg.clientHeight / DISK_MAP_VIEWBOX.height;
      const shellCenterX =
        DISK_MAP_PHYSICAL.shellX + DISK_MAP_PHYSICAL.shellWidth * 0.5;
      const shellCenterY =
        DISK_MAP_PHYSICAL.shellY + DISK_MAP_PHYSICAL.shellHeight * 0.5;
      const fitScale = clampDiskMapScale(
        Math.min(
          (svg.clientWidth * targetFillRatio) /
            (DISK_MAP_PHYSICAL.shellWidth * scaleX),
          (svg.clientHeight * targetFillRatio) /
            (DISK_MAP_PHYSICAL.shellHeight * scaleY),
        ),
      );
      diskMapView.scale = fitScale;
      diskMapView.offsetX =
        fitScale * (svg.clientWidth * 0.5 - shellCenterX * scaleX);
      diskMapView.offsetY =
        fitScale * (svg.clientHeight * 0.5 - shellCenterY * scaleY);
    } else {
      diskMapView.scale = 1;
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

  const setSelectedDiskMapSectorElement = function (element) {
    if (diskMapView.selectedSectorElement === element) return;
    if (diskMapView.selectedSectorElement) {
      diskMapView.selectedSectorElement.classList.remove("is-selected");
    }
    diskMapView.selectedSectorElement = element || null;
    if (diskMapView.selectedSectorElement) {
      diskMapView.selectedSectorElement.classList.add("is-selected");
    }
  };

  const applySelectedDiskMapSector = function () {
    if (!state.selectedSectorKey) {
      setSelectedDiskMapSectorElement(null);
      return;
    }
    setSelectedDiskMapSectorElement(
      diskMap.querySelector('[data-key="' + state.selectedSectorKey + '"]'),
    );
  };

  const clearSelectedDiskMapSector = function () {
    state.selectedSectorKey = "";
    setSelectedDiskMapSectorElement(null);
  };

  const centerDiskMapOnSectorElement = function (element) {
    if (!element) return;
    const mapRect = diskMap.getBoundingClientRect();
    const sectorRect = element.getBoundingClientRect();
    if (
      !mapRect.width ||
      !mapRect.height ||
      !sectorRect.width ||
      !sectorRect.height
    ) {
      return;
    }
    diskMapView.offsetX +=
      mapRect.left +
      mapRect.width * 0.5 -
      (sectorRect.left + sectorRect.width * 0.5);
    diskMapView.offsetY +=
      mapRect.top +
      mapRect.height * 0.5 -
      (sectorRect.top + sectorRect.height * 0.5);
    applyDiskMapTransform();
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
          return (
            (segment.fullLabel || segment.label) +
            ": " +
            formatByteSize(segment.value) +
            " (" +
            formatExactBytes(segment.value) +
            ")"
          );
        })
        .join(", "),
    );
    usageLegend.innerHTML = segments
      .map(function (segment) {
        return (
          '<div class="legend-row" title="' +
          escapeHtml(segment.fullLabel || segment.label) +
          '">' +
          '<span class="legend-swatch" style="background:' +
          segment.color +
          '"></span>' +
          "<span>" +
          escapeHtml(segment.label) +
          "</span>" +
          "<strong>" +
          formatByteHtml(segment.value) +
          "</strong>" +
          "</div>"
        );
      })
      .join("");
  };

  const buildUsageSegments = function (values) {
    const source = values || {};
    return [
      {
        label: "Used",
        fullLabel: "File payload",
        value: Math.max(0, Number(source.totalPayloadBytes) || 0),
        color: "#8ef3e6",
      },
      {
        label: "Overhead",
        fullLabel: "File overhead",
        value: Math.max(0, Number(source.fileOverheadBytes) || 0),
        color: "#ffd36b",
      },
      {
        label: "Directory",
        fullLabel: "Directory reserved",
        value: Math.max(0, Number(source.directoryReservedBytes) || 0),
        color: "#ff8e90",
      },
      {
        label: "Trash",
        fullLabel: "Deleted chains",
        value: Math.max(0, Number(source.deletedBytes) || 0),
        color: DISK_MAP_COLORS.deleted,
      },
      {
        label: "Free",
        fullLabel: "Free space",
        value: Math.max(0, Number(source.freeBytes) || 0),
        color: "#3f82ff",
      },
    ];
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

  const toHexByte = function (value) {
    return Math.max(0, Math.min(255, Number(value) || 0))
      .toString(16)
      .toUpperCase()
      .padStart(2, "0");
  };

  const toHexWord = function (value) {
    return Math.max(0, Number(value) || 0)
      .toString(16)
      .toUpperCase()
      .padStart(4, "0");
  };

  const toPrintableSectorChar = function (value) {
    const byte = Number(value) || 0;
    if (byte >= 32 && byte <= 126) return String.fromCharCode(byte);
    return ".";
  };

  const renderSectorHexDump = function (bytes) {
    return renderSectorHexDumpWithOptions(bytes, {});
  };

  const renderSectorHexDumpWithOptions = function (bytes, options) {
    const config = options || {};
    const dimStart = Number.isFinite(config.dimStart)
      ? Math.max(0, Math.floor(config.dimStart))
      : null;
    const rows = [];
    for (let offset = 0; offset < bytes.length; offset += 16) {
      const chunk = bytes.subarray(offset, offset + 16);
      const hexMarkup = Array.from(chunk)
        .map(function (value, index) {
          const absoluteIndex = offset + index;
          const classes = ["sector-hex-byte"];
          if (absoluteIndex === 0 || absoluteIndex === 1) {
            classes.push("is-link");
          }
          if (dimStart != null && absoluteIndex >= dimStart) {
            classes.push("is-dim");
          }
          return (
            '<span class="' +
            classes.join(" ") +
            '">' +
            toHexByte(value) +
            "</span>"
          );
        })
        .join(" ");
      const asciiMarkup = Array.from(chunk)
        .map(function (value, index) {
          const absoluteIndex = offset + index;
          const classes = ["sector-ascii-char"];
          if (absoluteIndex === 0 || absoluteIndex === 1) {
            classes.push("is-link");
          }
          if (dimStart != null && absoluteIndex >= dimStart) {
            classes.push("is-dim");
          }
          return (
            '<span class="' +
            classes.join(" ") +
            '">' +
            escapeHtml(toPrintableSectorChar(value)) +
            "</span>"
          );
        })
        .join("");
      rows.push(
        '<div class="sector-hex-row">' +
          '<span class="sector-hex-offset">' +
          toHexWord(offset) +
          "</span>" +
          '<span class="sector-hex-bytes">' +
          hexMarkup +
          "</span>" +
          '<span class="sector-hex-ascii">' +
          asciiMarkup +
          "</span>" +
          "</div>",
      );
    }
    return rows.join("");
  };

  const getSectorUsedPayloadBytes = function (sectorBytes, info) {
    if (!info || !/Data|relSide/.test(String(info.category || ""))) {
      return null;
    }
    const nextTrack = sectorBytes[0];
    const nextSector = sectorBytes[1];
    if (nextTrack === 0) {
      return Math.max(0, Math.min(254, nextSector - 1));
    }
    return 254;
  };

  const getSectorTailDimStart = function (sectorBytes, info) {
    const usedPayloadBytes = getSectorUsedPayloadBytes(sectorBytes, info);
    if (usedPayloadBytes == null || usedPayloadBytes >= 254) {
      return null;
    }
    return 2 + usedPayloadBytes;
  };

  const isValidSectorAddress = function (track, sector, source) {
    const geometry = d64.describeGeometry(source || state.image);
    const normalizedTrack = Math.floor(Number(track) || 0);
    const normalizedSector = Math.floor(Number(sector) || 0);
    return (
      normalizedTrack >= 1 &&
      normalizedTrack <= geometry.trackCount &&
      normalizedSector >= 0 &&
      normalizedSector < d64.trackSectorCount(normalizedTrack)
    );
  };

  const selectDiskMapSector = function (track, sector, options) {
    const config = options || {};
    if (!isValidSectorAddress(track, sector, state.image)) return;
    state.selectedSectorKey = String(track) + ":" + String(sector);
    applySelectedDiskMapSector();
    if (config.centerView) {
      centerDiskMapOnSectorElement(diskMapView.selectedSectorElement);
    }
    renderDiskMapInspector();
  };

  const renderSectorJumpButton = function (track, sector, label) {
    return (
      '<button type="button" class="sector-link-button" data-action="jump-sector" data-track="' +
      String(track) +
      '" data-sector="' +
      String(sector) +
      '">' +
      escapeHtml(label) +
      "</button>"
    );
  };

  const renderPhysicalSectorLegend = function (
    track,
    sector,
    sectorBytes,
    info,
    logicalDiskIdBytes,
  ) {
    const id1 = logicalDiskIdBytes[0];
    const id2 = logicalDiskIdBytes[1];
    const headerChecksum = track ^ sector ^ id1 ^ id2;
    const usedPayloadBytes = getSectorUsedPayloadBytes(sectorBytes, info);
    const unusedPayloadBytes =
      usedPayloadBytes == null ? null : Math.max(0, 254 - usedPayloadBytes);
    const shorthand = [
      {
        label: "SYNC",
        value: "...",
        source: "expected",
        note: "GCR sync marks on physical disk",
      },
      {
        label: "HDR",
        value: "08",
        source: "expected",
        note: "Decoded sector-header mark",
      },
      {
        label: "CHK",
        value: toHexByte(headerChecksum),
        source: "inferred",
        note: "Header checksum inferred from T/S + disk ID",
      },
      {
        label: "SEC",
        value: toHexByte(sector),
        source: "inferred",
        note: "Sector number",
      },
      {
        label: "TRK",
        value: toHexByte(track),
        source: "inferred",
        note: "Track number",
      },
      {
        label: "ID1",
        value: toHexByte(id1),
        source: "inferred",
        note: "Disk ID byte 1 from T18/S0",
      },
      {
        label: "ID2",
        value: toHexByte(id2),
        source: "inferred",
        note: "Disk ID byte 2 from T18/S0",
      },
      {
        label: "DATA",
        value: "07",
        source: "expected",
        note: "Decoded data-header mark",
      },
      {
        label: "LINK",
        value: toHexByte(sectorBytes[0]) + " " + toHexByte(sectorBytes[1]),
        source: "stored",
        note: "First two bytes in the .d64 sector",
      },
      {
        label: "PAY",
        value:
          usedPayloadBytes == null ? "254b" : formatByteSize(usedPayloadBytes),
        title:
          usedPayloadBytes == null
            ? formatExactBytes(254)
            : formatExactBytes(usedPayloadBytes),
        source: usedPayloadBytes == null ? "stored" : "inferred",
        note:
          usedPayloadBytes == null
            ? "256-byte logical block view"
            : "Logical payload bytes used",
      },
    ];
    if (unusedPayloadBytes) {
      shorthand.push({
        label: "TAIL",
        value: formatByteSize(unusedPayloadBytes),
        title: formatExactBytes(unusedPayloadBytes),
        source: "stored",
        note: "Bytes preserved in sector but beyond logical payload",
      });
    }
    return (
      '<div class="sector-physical">' +
      '<div class="sector-physical-head"><strong>Physical Sector Model</strong><span>Decoded shorthand of what a 1541 sector would carry on disk</span></div>' +
      '<div class="sector-physical-strip">' +
      shorthand
        .map(function (part) {
          return (
            '<div class="sector-physical-chip is-' +
            part.source +
            '" title="' +
            escapeHtml(
              part.title ? part.note + " (" + part.title + ")" : part.note,
            ) +
            '">' +
            '<span class="sector-physical-chip-label">' +
            escapeHtml(part.label) +
            "</span>" +
            '<span class="sector-physical-chip-value">' +
            escapeHtml(part.value) +
            "</span>" +
            "</div>"
          );
        })
        .join("") +
      "</div>" +
      '<div class="sector-physical-legend">' +
      '<span><i class="sector-physical-dot is-stored"></i>Stored in .d64</span>' +
      '<span><i class="sector-physical-dot is-inferred"></i>Inferred from logical DOS data</span>' +
      '<span><i class="sector-physical-dot is-expected"></i>Expected on physical disk but not stored in .d64</span>' +
      "</div>" +
      "</div>"
    );
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
        const isReservedTrack = track === 18;
        markSector(sectorMap, track, sector, {
          category:
            isFree === true
              ? isReservedTrack
                ? "reservedFree"
                : "free"
              : isFree === false
                ? isReservedTrack
                  ? "reservedUsed"
                  : "unknownUsed"
                : "unknownUsed",
          color:
            isFree === true
              ? isReservedTrack
                ? DISK_MAP_COLORS.reservedTrackFree
                : DISK_MAP_COLORS.free
              : isReservedTrack
                ? DISK_MAP_COLORS.reservedTrack
                : DISK_MAP_COLORS.unknownUsed,
          stroke: isReservedTrack
            ? DISK_MAP_COLORS.reservedTrackStroke
            : DISK_MAP_COLORS.trackStroke,
          label:
            isFree === true
              ? isReservedTrack
                ? "Free sector on reserved BAM/directory track"
                : "Free sector"
              : isReservedTrack
                ? "Reserved BAM/directory track sector"
                : "Used or untracked sector",
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
    const deletedEntries = d64.readDeletedEntries(image);
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

    deletedEntries.forEach(function (entry) {
      const deletedType = inferDeletedEntryType(entry);
      try {
        const chain = d64.readFileChain(
          image,
          entry.startTrack,
          entry.startSector,
        );
        chain.blocks.forEach(function (block, blockIndex) {
          markSector(sectorMap, block.track, block.sector, {
            category: "deletedData",
            color: DISK_MAP_COLORS.deleted,
            tailColor: DISK_MAP_COLORS.deletedTail,
            stroke: DISK_MAP_COLORS.trackStroke,
            label:
              entry.name +
              " (deleted " +
              deletedType.toUpperCase() +
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
        if (deletedType === "rel" && entry.sideSectorTrack) {
          d64
            .readRelativeSideSectors(
              image,
              entry.sideSectorTrack,
              entry.sideSectorSector,
            )
            .forEach(function (sideSector, sideIndex) {
              markSector(sectorMap, sideSector.track, sideSector.sector, {
                category: "deletedRelSide",
                color: DISK_MAP_COLORS.deleted,
                tailColor: DISK_MAP_COLORS.deletedTail,
                stroke: DISK_MAP_COLORS.trackStroke,
                label:
                  entry.name +
                  " (deleted REL side sector " +
                  String(sideIndex + 1) +
                  ")",
                usedFraction: 1,
                unusedFraction: 0,
              });
            });
        }
      } catch (error) {
        markSector(sectorMap, entry.startTrack, entry.startSector, {
          category: "deletedData",
          color: DISK_MAP_COLORS.deleted,
          stroke: DISK_MAP_COLORS.trackStroke,
          label: entry.name + " (deleted) could not be fully traced",
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
          [
            "Header",
            DISK_MAP_COLORS.header,
            null,
            "Track 18 sector 0 disk header",
          ],
          [
            "Track 18",
            DISK_MAP_COLORS.reservedTrack,
            null,
            "Reserved directory track underlay",
          ],
          [
            "BAM / Free",
            DISK_MAP_COLORS.free,
            null,
            "Free sectors according to the BAM",
          ],
          [
            "Directory",
            DISK_MAP_COLORS.directory,
            null,
            "Directory chain sectors",
          ],
          [
            "Used / Unknown",
            DISK_MAP_COLORS.unknownUsed,
            null,
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
            DISK_MAP_COLORS.prgTail,
            "Dark = used bytes, light = tail bytes",
          ],
          [
            "SEQ",
            DISK_MAP_COLORS.seqUsed,
            DISK_MAP_COLORS.seqTail,
            "Dark = used bytes, light = tail bytes",
          ],
          [
            "USR",
            DISK_MAP_COLORS.usrUsed,
            DISK_MAP_COLORS.usrTail,
            "Dark = used bytes, light = tail bytes",
          ],
          [
            "REL Data",
            DISK_MAP_COLORS.relUsed,
            DISK_MAP_COLORS.relTail,
            "Dark = used bytes, light = tail bytes",
          ],
          [
            "REL Side",
            DISK_MAP_COLORS.relSide,
            DISK_MAP_COLORS.relSideTail,
            "REL side-sector chain. Dark = used bytes, light = tail bytes",
          ],
          [
            "Deleted",
            DISK_MAP_COLORS.deleted,
            DISK_MAP_COLORS.deletedTail,
            "Deleted file chains and deleted REL side sectors. Dark = used bytes, light = tail bytes",
          ],
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
              const swatchStyle = row[2]
                ? "background:linear-gradient(135deg, " +
                  row[1] +
                  " 0 50%, " +
                  row[2] +
                  " 50% 100%)"
                : "background:" + row[1];
              return (
                '<div class="disk-map-legend-row"' +
                (row[3] ? ' title="' + escapeHtml(row[3]) + '"' : "") +
                ">" +
                '<span class="disk-map-swatch" style="' +
                swatchStyle +
                '"></span>' +
                "<span><strong>" +
                escapeHtml(row[0]) +
                "</strong></span></div>"
              );
            })
            .join("") +
          "</section>"
        );
      })
      .join("");
  };

  const renderDiskMapInspector = function () {
    if (!state.image || !state.selectedSectorKey || !state.diskLayout) {
      renderDiskMapLegend();
      return;
    }

    const parts = state.selectedSectorKey.split(":");
    const track = Math.max(1, Math.floor(Number(parts[0]) || 0));
    const sector = Math.max(0, Math.floor(Number(parts[1]) || 0));
    const key = String(track) + ":" + String(sector);
    const info = state.diskLayout.sectorMap[key];
    const sectorBytes = d64.readSector(state.image, track, sector);
    const offset = d64.trackOffset(track, sector);
    const sectorIndex = d64.sectorIndex(track, sector, state.image);
    const logicalHeader = d64.readHeader(state.image);
    const logicalDiskIdBytes = d64
      .readSector(state.image, 18, 0)
      .subarray(
        d64.headerOffsets.diskIdStart,
        d64.headerOffsets.diskIdStart + 2,
      );
    const nextTrack = sectorBytes[0];
    const nextSector = sectorBytes[1];
    const hasNextSectorLink = isValidSectorAddress(nextTrack, nextSector);
    const rows = [
      {
        label: "Purpose",
        value: info ? info.label : "Sector data",
      },
      {
        label: "Offset",
        html: "0x" + toHexWord(offset) + " (" + formatByteHtml(offset) + ")",
      },
      {
        label: "Sector Index",
        value:
          sectorIndex >= 0
            ? formatNumber(sectorIndex) +
              " / " +
              formatNumber(state.diskLayout.geometry.sectorCount - 1)
            : "n/a",
      },
      {
        label: "Link Bytes",
        html: hasNextSectorLink
          ? '<div class="sector-link-row"><span class="sector-link-raw">' +
            escapeHtml(
              toHexByte(nextTrack) + " " + toHexByte(nextSector) + " ->",
            ) +
            "</span>" +
            renderSectorJumpButton(
              nextTrack,
              nextSector,
              "T" +
                String(nextTrack).padStart(2, "0") +
                " S" +
                String(nextSector).padStart(2, "0"),
            ) +
            "</div>"
          : escapeHtml(
              nextTrack === 0
                ? toHexByte(nextTrack) +
                    " " +
                    toHexByte(nextSector) +
                    " (final block marker / used-byte count)"
                : toHexByte(nextTrack) + " " + toHexByte(nextSector),
            ),
      },
      {
        label: "Logical Disk ID",
        value:
          toHexByte(logicalDiskIdBytes[0]) +
          " " +
          toHexByte(logicalDiskIdBytes[1]) +
          " (inferred from T18/S0 header)",
      },
    ];

    if (track === 18 && sector === 0) {
      const bam = d64.readBam(state.image);
      const freeBlocks = bam.tracks.reduce(function (sum, trackInfo) {
        return sum + Math.max(0, Number(trackInfo.freeCount) || 0);
      }, 0);
      rows.push(
        { label: "Disk Name", value: toDisplayValue(logicalHeader.diskName) },
        { label: "Disk ID", value: toDisplayValue(logicalHeader.diskId) },
        { label: "DOS Type", value: toDisplayValue(logicalHeader.dosType) },
        {
          label: "DOS Version",
          value: toDisplayValue(logicalHeader.dosVersionName),
        },
        {
          label: "Directory Start",
          html:
            '<div class="sector-link-row"><span class="sector-link-raw">' +
            "Start at" +
            "</span>" +
            renderSectorJumpButton(
              logicalHeader.nextDirectoryTrack,
              logicalHeader.nextDirectorySector,
              "T" +
                String(logicalHeader.nextDirectoryTrack).padStart(2, "0") +
                " S" +
                String(logicalHeader.nextDirectorySector).padStart(2, "0"),
            ) +
            "</div>",
        },
        { label: "BAM Free Blocks", value: formatNumber(freeBlocks) },
      );
    } else if (track === 18) {
      const directory = d64.readDirectoryEntriesFrom(
        state.image,
        logicalHeader.nextDirectoryTrack,
        logicalHeader.nextDirectorySector,
        { includeDeleted: true },
      );
      const sectorEntries = directory.entries.filter(function (entry) {
        return entry.track === track && entry.sector === sector;
      });
      rows.push(
        { label: "Reserved Track", value: "Directory / BAM track" },
        {
          label: "Directory Slots",
          value:
            formatNumber(
              sectorEntries.filter(function (entry) {
                return entry.typeByte;
              }).length,
            ) +
            " active, " +
            formatNumber(
              sectorEntries.filter(function (entry) {
                return entry.deleted;
              }).length,
            ) +
            " deleted",
        },
      );
    } else if (info && /Data|relSide/.test(String(info.category || ""))) {
      rows.push({
        label: "Data Use",
        html:
          typeof info.usedFraction === "number"
            ? formatByteHtml(Math.round(info.usedFraction * 254)) +
              " of 254b payload"
            : "Sector payload",
      });
    }
    const tailDimStart = getSectorTailDimStart(sectorBytes, info);

    diskMapLegend.innerHTML =
      '<section class="sector-inspector">' +
      '<div class="sector-inspector-head">' +
      "<div>" +
      "<h4>Track " +
      String(track) +
      " Sector " +
      String(sector) +
      "</h4>" +
      "<p>Click another sector to inspect it.</p>" +
      "</div>" +
      '<button type="button" class="sector-inspector-close" data-action="show-legend">Show Legend</button>' +
      "</div>" +
      '<dl class="sector-inspector-meta">' +
      rows
        .map(function (row) {
          return (
            "<div><dt>" +
            escapeHtml(row.label) +
            "</dt><dd>" +
            (row.html || escapeHtml(row.value || "")) +
            "</dd></div>"
          );
        })
        .join("") +
      "</dl>" +
      '<p class="sector-inspector-note">Physical sync marks and per-sector on-disk headers are not stored in a plain .d64 image. Disk ID shown here is inferred from the logical DOS header at T18/S0.</p>' +
      renderPhysicalSectorLegend(
        track,
        sector,
        sectorBytes,
        info,
        logicalDiskIdBytes,
      ) +
      '<div class="sector-inspector-dump">' +
      '<div class="sector-inspector-dump-head"><strong>Sector Data</strong><span>Hex + printable view' +
      (tailDimStart != null
        ? " · dimmed tail bytes are beyond used payload"
        : "") +
      "</span></div>" +
      '<div class="sector-hex-viewer">' +
      renderSectorHexDumpWithOptions(sectorBytes, { dimStart: tailDimStart }) +
      "</div>" +
      "</div>" +
      "</section>";
  };

  const renderDiskMap = function (image) {
    if (!image) {
      state.diskLayout = null;
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
    state.diskLayout = layout;
    const diskHeader = d64.readHeader(image);
    const diskFiles = d64.readFiles(image);
    const shellPreset = pickShellColorPreset(diskHeader.diskName);
    const labelLayout = buildLabelLayout(
      diskHeader.diskName,
      diskHeader.diskId,
      shellPreset,
    );
    const coverLayout = buildCoverLayout(
      diskHeader.diskName,
      diskHeader.diskId,
    );
    const coverPrograms = collectCoverPrograms(image).slice(0, 8);
    const geometry = layout.geometry;
    const platterRadius = DISK_MAP_PHYSICAL.platterRadius;
    const mechanismOuterRadius = DISK_MAP_PHYSICAL.mechanismOuterRadius;
    const mechanismInnerRadius = DISK_MAP_PHYSICAL.mechanismInnerRadius;
    const mechanismTrackCount = DISK_MAP_PHYSICAL.mechanismTrackCount;
    const trackBand =
      (mechanismOuterRadius - mechanismInnerRadius) / mechanismTrackCount;
    const outerRadius = mechanismOuterRadius;
    const innerRadius = outerRadius - trackBand * geometry.trackCount;
    const cx = DISK_MAP_VIEWBOX.diskCenterX;
    const cy = DISK_MAP_VIEWBOX.diskCenterY;
    const sectorZeroAngleOffset = DISK_MAP_PHYSICAL.indexHoleAngle;
    const indexHolePoint = {
      x: cx + 74,
      y: cy + 2,
    };
    const headWindowX =
      cx +
      DISK_MAP_PHYSICAL.headWindowOffsetX -
      DISK_MAP_PHYSICAL.headWindowWidth / 2;
    const headWindowY =
      cy +
      DISK_MAP_PHYSICAL.headWindowOffsetY -
      DISK_MAP_PHYSICAL.headWindowHeight / 2;
    const shellX = DISK_MAP_PHYSICAL.shellX;
    const shellY = DISK_MAP_PHYSICAL.shellY;
    const shellWidth = DISK_MAP_PHYSICAL.shellWidth;
    const shellHeight = DISK_MAP_PHYSICAL.shellHeight;
    const shellRadius = DISK_MAP_PHYSICAL.shellRadius;
    const centeredX = shellX + shellWidth * 0.5;
    const centeredY = shellY + shellHeight * 0.5;
    const dustCoverX = shellX - 12;
    const dustCoverY = shellY - 8;
    const dustCoverWidth = shellWidth + 24;
    const dustCoverHeight = shellHeight + 20;
    const dustSleeveTop = Math.min(
      shellY + 112,
      Math.max(shellY + 82, labelLayout.y + labelLayout.height + 6),
    );
    const dustSleeveInset = 6;
    const dustSleeveX = shellX + dustSleeveInset;
    const dustSleeveY = dustSleeveTop;
    const dustSleeveWidth = shellWidth - dustSleeveInset * 2;
    const dustSleeveHeight = shellY + shellHeight - dustSleeveTop - 8;
    const exposedTabHeight = dustSleeveY - shellY + 8;
    const coverBackX = shellX - 14;
    const coverBackY = dustSleeveY - 20;
    const coverBackWidth = shellWidth + 28;
    const coverBackHeight = shellY + shellHeight - coverBackY + 18;
    const coverFrontX = shellX - 4;
    const coverFrontY = dustSleeveY;
    const coverFrontWidth = shellWidth + 8;
    const coverFrontHeight = shellY + shellHeight - coverFrontY + 14;
    const shellCutoutFill = "#b9c8d2";
    const writeNotchX = shellX + shellWidth - 10;
    const writeNotchY = shellY + 118;
    const diskNameLabel = String(diskHeader.diskName || "UNTITLED DISK");
    const diskNumberLabel = String(diskHeader.diskId || "00");
    const firstPrgFile = diskFiles.find(function (file) {
      return String(file.type || "").toLowerCase() === "prg";
    });
    const prgHintLabel = firstPrgFile
      ? 'LOAD"' +
        String(firstPrgFile.name || "").replace(/"/g, "") +
        '",8,1  RUN'
      : "No PRG auto-run hint available";
    const coverProgramLines = coverPrograms
      .map(function (entry, index) {
        return (
          '<text x="' +
          (coverFrontX + 18).toFixed(2) +
          '" y="' +
          (coverFrontY + 58 + index * 22).toFixed(2) +
          '" class="disk-map-cover-program' +
          (entry.deleted ? " is-deleted" : "") +
          '" style="fill:' +
          coverLayout.style.text +
          '">' +
          escapeHtml(entry.name) +
          "</text>"
        );
      })
      .join("");
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
        const usedStartAngle =
          endAngle - (endAngle - startAngle) * totalFraction;
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
                usedStartAngle,
                endAngle,
              ) +
              '" class="disk-map-sector" data-track="' +
              String(track) +
              '" data-sector="' +
              String(sector) +
              '" data-key="' +
              key +
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
                startAngle,
                usedStartAngle,
              ) +
              '" class="disk-map-sector" data-track="' +
              String(track) +
              '" data-sector="' +
              String(sector) +
              '" data-key="' +
              key +
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
              '" data-key="' +
              key +
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
      '<linearGradient id="disk-shell-fill" x1="0%" y1="0%" x2="0%" y2="100%">' +
      '<stop offset="0%" stop-color="' +
      shellPreset.stops[0] +
      '" />' +
      '<stop offset="56%" stop-color="' +
      shellPreset.stops[1] +
      '" />' +
      '<stop offset="100%" stop-color="' +
      shellPreset.stops[2] +
      '" />' +
      "</linearGradient>" +
      '<linearGradient id="disk-label-fill" x1="0%" y1="0%" x2="100%" y2="100%">' +
      '<stop offset="0%" stop-color="' +
      (labelLayout.fillStops ? labelLayout.fillStops[0] : "#f7f3e5") +
      '" />' +
      '<stop offset="100%" stop-color="' +
      (labelLayout.fillStops ? labelLayout.fillStops[1] : "#ece3ca") +
      '" />' +
      "</linearGradient>" +
      '<linearGradient id="disk-label-fill-secondary" x1="0%" y1="0%" x2="100%" y2="100%">' +
      '<stop offset="0%" stop-color="' +
      (labelLayout.secondaryLabel
        ? labelLayout.secondaryLabel.fillStops[0]
        : "#f4ead6") +
      '" />' +
      '<stop offset="100%" stop-color="' +
      (labelLayout.secondaryLabel
        ? labelLayout.secondaryLabel.fillStops[1]
        : "#e6d7b7") +
      '" />' +
      "</linearGradient>" +
      '<radialGradient id="disk-platter-fill" cx="45%" cy="38%" r="70%">' +
      '<stop offset="0%" stop-color="#9b7650" />' +
      '<stop offset="48%" stop-color="#7b5a3a" />' +
      '<stop offset="100%" stop-color="#4b3624" />' +
      "</radialGradient>" +
      '<radialGradient id="disk-inner-ring-fill" cx="50%" cy="50%" r="75%">' +
      '<stop offset="0%" stop-color="#0d1115" />' +
      '<stop offset="100%" stop-color="#1f252b" />' +
      "</radialGradient>" +
      '<radialGradient id="disk-hub-fill" cx="50%" cy="50%" r="75%">' +
      '<stop offset="0%" stop-color="#10222d" />' +
      '<stop offset="100%" stop-color="#081620" />' +
      "</radialGradient>" +
      '<filter id="disk-spin-glow" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="0" stdDeviation="1.8" flood-color="rgba(8, 28, 39, 0.78)" flood-opacity="1" /></filter>' +
      '<marker id="disk-spin-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M 1 1 L 9 5 L 1 9" fill="none" stroke="rgba(215, 250, 247, 0.96)" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" /></marker>' +
      "</defs>" +
      (state.diskCoverVisible
        ? '<rect x="' +
          coverBackX.toFixed(2) +
          '" y="' +
          coverBackY.toFixed(2) +
          '" width="' +
          coverBackWidth.toFixed(2) +
          '" height="' +
          coverBackHeight.toFixed(2) +
          '" rx="18" fill="' +
          coverLayout.style.accent +
          '" stroke="' +
          coverLayout.style.stroke +
          '" stroke-width="1.2" />' +
          '<rect x="' +
          shellX +
          '" y="' +
          shellY +
          '" width="' +
          shellWidth +
          '" height="' +
          exposedTabHeight.toFixed(2) +
          '" rx="' +
          shellRadius +
          '" fill="url(#disk-shell-fill)" stroke="rgba(255,255,255,0.18)" stroke-width="1.2" />'
        : '<rect x="' +
          shellX +
          '" y="' +
          shellY +
          '" width="' +
          shellWidth +
          '" height="' +
          shellHeight +
          '" rx="' +
          shellRadius +
          '" fill="url(#disk-shell-fill)" stroke="rgba(255,255,255,0.18)" stroke-width="1.2" />') +
      (labelLayout.secondaryLabel
        ? '<rect x="' +
          labelLayout.secondaryLabel.x.toFixed(2) +
          '" y="' +
          labelLayout.secondaryLabel.y.toFixed(2) +
          '" width="' +
          labelLayout.secondaryLabel.width.toFixed(2) +
          '" height="' +
          labelLayout.secondaryLabel.height.toFixed(2) +
          '" rx="' +
          labelLayout.secondaryLabel.rx.toFixed(2) +
          '" fill="url(#disk-label-fill-secondary)" stroke="rgba(96, 100, 106, 0.18)" transform="rotate(' +
          labelLayout.secondaryLabel.rotate.toFixed(2) +
          " " +
          centeredX.toFixed(2) +
          " " +
          (shellY + 52).toFixed(2) +
          ')" />'
        : "") +
      (labelLayout.id === "no-label"
        ? ""
        : '<rect x="' +
          labelLayout.x.toFixed(2) +
          '" y="' +
          labelLayout.y.toFixed(2) +
          '" width="' +
          labelLayout.width.toFixed(2) +
          '" height="' +
          labelLayout.height.toFixed(2) +
          '" rx="' +
          labelLayout.rx.toFixed(2) +
          '" fill="url(#disk-label-fill)" stroke="rgba(96, 100, 106, 0.24)" transform="rotate(' +
          labelLayout.rotate.toFixed(2) +
          " " +
          centeredX.toFixed(2) +
          " " +
          (shellY + 52).toFixed(2) +
          ')" />') +
      '<text x="' +
      (labelLayout.textMode === "shell" ? shellX + 18 : labelLayout.x + 16) +
      '" y="' +
      (labelLayout.textMode === "shell"
        ? shellY + 30
        : labelLayout.y + 22 * labelLayout.titleScale) +
      '" class="disk-map-shell-title" transform="' +
      (labelLayout.textMode === "shell"
        ? ""
        : "rotate(" +
          labelLayout.rotate.toFixed(2) +
          " " +
          centeredX.toFixed(2) +
          " " +
          (shellY + 52).toFixed(2) +
          ")") +
      '" style="font-size:' +
      (19 * labelLayout.titleScale).toFixed(2) +
      'px">' +
      escapeHtml(diskNameLabel) +
      "</text>" +
      '<text x="' +
      (labelLayout.textMode === "shell" ? shellX + 18 : labelLayout.x + 16) +
      '" y="' +
      (labelLayout.textMode === "shell"
        ? shellY + 48
        : labelLayout.y + 40 * labelLayout.noteScale) +
      '" class="disk-map-shell-subtitle" transform="' +
      (labelLayout.textMode === "shell"
        ? ""
        : "rotate(" +
          labelLayout.rotate.toFixed(2) +
          " " +
          centeredX.toFixed(2) +
          " " +
          (shellY + 52).toFixed(2) +
          ")") +
      '" style="font-size:' +
      (10 * labelLayout.noteScale).toFixed(2) +
      'px">' +
      escapeHtml(prgHintLabel) +
      "</text>" +
      '<text x="' +
      (labelLayout.textMode === "shell"
        ? shellX + shellWidth - 20
        : labelLayout.x + labelLayout.width - 16) +
      '" y="' +
      (labelLayout.textMode === "shell"
        ? shellY + 30
        : labelLayout.y + 22 * labelLayout.titleScale) +
      '" class="disk-map-shell-diskno" transform="' +
      (labelLayout.textMode === "shell"
        ? ""
        : "rotate(" +
          labelLayout.rotate.toFixed(2) +
          " " +
          centeredX.toFixed(2) +
          " " +
          (shellY + 52).toFixed(2) +
          ")") +
      '" style="font-size:' +
      (11 * labelLayout.titleScale).toFixed(2) +
      'px">Disk: ' +
      escapeHtml(diskNumberLabel) +
      "</text>" +
      (state.diskCoverVisible
        ? ""
        : '<circle cx="' +
          cx +
          '" cy="' +
          cy +
          '" r="' +
          String(platterRadius + 5) +
          '" fill="url(#disk-platter-fill)" stroke="rgba(40, 28, 18, 0.44)" stroke-width="1.4" />' +
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
          sectors.join("") +
          '<circle cx="' +
          cx +
          '" cy="' +
          cy +
          '" r="' +
          DISK_MAP_PHYSICAL.spindleOutlineRadius.toFixed(2) +
          '" fill="url(#disk-inner-ring-fill)" stroke="rgba(42, 48, 54, 0.66)" stroke-width="1.3" />' +
          '<circle cx="' +
          cx +
          '" cy="' +
          cy +
          '" r="' +
          (DISK_MAP_PHYSICAL.spindleOutlineRadius - 5).toFixed(2) +
          '" fill="none" stroke="rgba(154, 172, 188, 0.18)" stroke-width="1.1" />' +
          '<rect x="' +
          headWindowX.toFixed(2) +
          '" y="' +
          headWindowY.toFixed(2) +
          '" width="' +
          DISK_MAP_PHYSICAL.headWindowWidth.toFixed(2) +
          '" height="' +
          DISK_MAP_PHYSICAL.headWindowHeight.toFixed(2) +
          '" rx="' +
          DISK_MAP_PHYSICAL.headWindowRadius.toFixed(2) +
          '" fill="none" stroke="rgba(42, 48, 54, 0.74)" stroke-width="1.4" />' +
          '<circle cx="' +
          indexHolePoint.x.toFixed(2) +
          '" cy="' +
          indexHolePoint.y.toFixed(2) +
          '" r="' +
          DISK_MAP_PHYSICAL.indexHoleSize.toFixed(2) +
          '" fill="' +
          shellCutoutFill +
          '" stroke="rgba(42, 48, 54, 0.7)" stroke-width="0.9" />' +
          '<circle cx="' +
          indexHolePoint.x.toFixed(2) +
          '" cy="' +
          indexHolePoint.y.toFixed(2) +
          '" r="' +
          (DISK_MAP_PHYSICAL.indexHoleSize + 6).toFixed(2) +
          '" fill="none" stroke="rgba(42, 48, 54, 0.54)" stroke-width="1.1" />' +
          '<circle cx="' +
          cx +
          '" cy="' +
          cy +
          '" r="' +
          DISK_MAP_PHYSICAL.spindleHoleRadius.toFixed(2) +
          '" fill="' +
          shellCutoutFill +
          '" />' +
          '<path d="' +
          describeArcPath(
            cx,
            cy,
            Math.max(DISK_MAP_PHYSICAL.spindleHoleRadius - 8, 24),
            Math.PI * 1.22,
            Math.PI * 2.68,
          ) +
          '" fill="none" stroke="rgba(190, 244, 240, 0.96)" stroke-width="2.7" stroke-linecap="round" marker-end="url(#disk-spin-arrow)" filter="url(#disk-spin-glow)" />' +
          '<rect x="' +
          writeNotchX +
          '" y="' +
          writeNotchY +
          '" width="14" height="42" rx="2" fill="' +
          shellCutoutFill +
          '" />' +
          '<circle cx="' +
          (shellX + shellWidth * 0.46).toFixed(2) +
          '" cy="' +
          (shellY + shellHeight).toFixed(2) +
          '" r="6.4" fill="' +
          shellCutoutFill +
          '" />' +
          '<circle cx="' +
          (shellX + shellWidth * 0.54).toFixed(2) +
          '" cy="' +
          (shellY + shellHeight).toFixed(2) +
          '" r="6.4" fill="' +
          shellCutoutFill +
          '" />') +
      (state.diskCoverVisible
        ? '<rect x="' +
          coverFrontX.toFixed(2) +
          '" y="' +
          coverFrontY.toFixed(2) +
          '" width="' +
          coverFrontWidth.toFixed(2) +
          '" height="' +
          coverFrontHeight.toFixed(2) +
          '" rx="16" fill="' +
          coverLayout.style.fill +
          '" stroke="' +
          coverLayout.style.stroke +
          '" stroke-width="1.1" />' +
          '<rect x="' +
          (coverFrontX + 4).toFixed(2) +
          '" y="' +
          (coverFrontY + 4).toFixed(2) +
          '" width="' +
          (coverFrontWidth - 8).toFixed(2) +
          '" height="9" rx="4.5" fill="rgba(0,0,0,0.08)" />' +
          '<path d="M ' +
          (coverFrontX + 12).toFixed(2) +
          " " +
          (coverFrontY + 10).toFixed(2) +
          " H " +
          (coverFrontX + coverFrontWidth - 12).toFixed(2) +
          '" stroke="rgba(0,0,0,0.18)" stroke-width="3.2" stroke-linecap="round" />' +
          '<path d="M ' +
          (coverFrontX + 14).toFixed(2) +
          " " +
          (coverFrontY + 8).toFixed(2) +
          " H " +
          (coverFrontX + coverFrontWidth - 14).toFixed(2) +
          '" stroke="rgba(255,255,255,0.22)" stroke-width="1" stroke-linecap="round" />' +
          (coverLayout.style.motif === "band"
            ? '<rect x="' +
              coverFrontX.toFixed(2) +
              '" y="' +
              coverFrontY.toFixed(2) +
              '" width="' +
              coverFrontWidth.toFixed(2) +
              '" height="28" fill="' +
              coverLayout.style.accent +
              '" />'
            : coverLayout.style.motif === "panel"
              ? '<rect x="' +
                (coverFrontX + 16).toFixed(2) +
                '" y="' +
                (coverFrontY + 14).toFixed(2) +
                '" width="' +
                (coverFrontWidth - 32).toFixed(2) +
                '" height="52" fill="#f0efe8" stroke="#dad7cc" />'
              : coverLayout.style.motif === "grid"
                ? '<path d="M ' +
                  coverFrontX.toFixed(2) +
                  " " +
                  (coverFrontY + 22).toFixed(2) +
                  " H " +
                  (coverFrontX + coverFrontWidth).toFixed(2) +
                  " M " +
                  coverFrontX.toFixed(2) +
                  " " +
                  (coverFrontY + 46).toFixed(2) +
                  " H " +
                  (coverFrontX + coverFrontWidth).toFixed(2) +
                  '" stroke="#d3d7de" stroke-width="1" />'
                : coverLayout.style.motif === "typed"
                  ? '<rect x="' +
                    (coverFrontX + 14).toFixed(2) +
                    '" y="' +
                    (coverFrontY + 14).toFixed(2) +
                    '" width="' +
                    (coverFrontWidth - 28).toFixed(2) +
                    '" height="48" fill="#efe9db" />'
                  : coverLayout.style.motif === "block"
                    ? '<rect x="' +
                      (coverFrontX + 14).toFixed(2) +
                      '" y="' +
                      (coverFrontY + 14).toFixed(2) +
                      '" width="78" height="' +
                      (coverFrontHeight - 28).toFixed(2) +
                      '" fill="#f3edf2" />'
                    : '<path d="M ' +
                      (coverFrontX + 18).toFixed(2) +
                      " " +
                      (coverFrontY + 28).toFixed(2) +
                      " H " +
                      (coverFrontX + coverFrontWidth - 18).toFixed(2) +
                      '" stroke="#8a867d" stroke-width="1" stroke-dasharray="1.5 3" />') +
          '<text x="' +
          (coverFrontX + 18).toFixed(2) +
          '" y="' +
          (coverFrontY + 30).toFixed(2) +
          '" class="disk-map-cover-title" style="fill:' +
          coverLayout.style.text +
          '">' +
          escapeHtml(diskNameLabel) +
          "</text>" +
          coverProgramLines +
          '<path d="M ' +
          (coverFrontX + 16).toFixed(2) +
          " " +
          (coverFrontY + coverFrontHeight - 14).toFixed(2) +
          " H " +
          (coverFrontX + coverFrontWidth - 16).toFixed(2) +
          '" stroke="rgba(0,0,0,0.1)" stroke-width="1.1" stroke-linecap="round" />' +
          '<path d="M ' +
          (coverFrontX + coverFrontWidth - 8).toFixed(2) +
          " " +
          (coverFrontY + 46).toFixed(2) +
          " L " +
          (coverFrontX + coverFrontWidth + 8).toFixed(2) +
          " " +
          (coverFrontY + 46).toFixed(2) +
          " L " +
          (coverFrontX + coverFrontWidth + 8).toFixed(2) +
          " " +
          (coverFrontY + coverFrontHeight - 44).toFixed(2) +
          " L " +
          (coverFrontX + coverFrontWidth - 8).toFixed(2) +
          " " +
          (coverFrontY + coverFrontHeight - 44).toFixed(2) +
          '" fill="' +
          coverLayout.style.stroke +
          '" stroke="' +
          coverLayout.style.stroke +
          '" stroke-width="0.9" />'
        : "") +
      "</svg>";
    applyDiskMapTransform();
    applySelectedDiskMapSector();
    syncDiskMapControls();
    renderDiskMapInspector();
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
          formatByteHtml((entry.blockCount || 0) * 254) +
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

  const estimateDeletedUsageBytes = function (image, entries) {
    return (Array.isArray(entries) ? entries : []).reduce(function (
      sum,
      entry,
    ) {
      try {
        const chain = d64.readFileChain(
          image,
          entry.startTrack,
          entry.startSector,
        );
        let total = chain.blocks.length * 256;
        if (entry.sideSectorTrack) {
          total +=
            d64.readRelativeSideSectors(
              image,
              entry.sideSectorTrack,
              entry.sideSectorSector,
            ).length * 256;
        }
        return sum + total;
      } catch (error) {
        return sum + Math.max(0, Number(entry.blockCount) || 0) * 256;
      }
    }, 0);
  };

  const refreshView = function () {
    if (!state.image) {
      renderDefinitionList(headerSummary, [
        { label: "Disk Name", value: "-" },
        { label: "Disk ID / DOS", value: "-" },
        { label: "Format", value: "-" },
        { label: "Tracks / Sectors", value: "-" },
        { label: "DOS Version", value: "-" },
        { label: "Error Info", value: "-" },
      ]);
      renderDefinitionList(usageSummary, [
        { label: "File Count", value: "-" },
        { label: "File / Dir Sectors", value: "-" },
      ]);
      renderUsageChart(buildUsageSegments());
      renderDiskMap(null);
      renderDeletedFiles();
      directoryCount.textContent = "0 entries";
      fileTableBody.innerHTML =
        '<tr><td colspan="7" class="empty-state">Load or create a disk image to see directory entries.</td></tr>';
      setCurrentImage(null, "");
      return;
    }

    const header = d64.readHeader(state.image);
    const shellPreset = pickShellColorPreset(header.diskName);
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
    const deletedBytes = estimateDeletedUsageBytes(state.image, deletedEntries);
    const fileOverheadBytes = Math.max(
      0,
      allocatedSectorBytes - totalPayloadBytes,
    );
    const freeBytes = Math.max(
      0,
      geometry.dataSize -
        directoryReservedBytes -
        allocatedSectorBytes -
        deletedBytes,
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
      { label: "Files", value: String(files.length) },
      {
        label: "File / Dir Sectors",
        value:
          formatNumber(usage.totalFileSectors) +
          " / " +
          formatNumber(usage.directorySectors),
      },
    ]);
    renderUsageChart(
      buildUsageSegments({
        totalPayloadBytes: totalPayloadBytes,
        fileOverheadBytes: fileOverheadBytes,
        directoryReservedBytes: directoryReservedBytes,
        deletedBytes: deletedBytes,
        freeBytes: freeBytes,
      }),
    );
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
          '<button type="button" class="file-type-button" data-action="edit-name" data-name="' +
          escapeHtml(file.name) +
          '" aria-label="' +
          escapeHtml("Rename " + file.name) +
          '">' +
          escapeHtml(file.name) +
          "</button>" +
          "</td>" +
          "<td>" +
          '<button type="button" class="file-type-button" data-action="edit-type" data-name="' +
          escapeHtml(file.name) +
          '" aria-label="' +
          escapeHtml("Edit file type for " + file.name) +
          '">' +
          escapeHtml(String(file.type || "").toUpperCase()) +
          "</button>" +
          "</td>" +
          "<td>" +
          escapeHtml(String((file.entry && file.entry.blockCount) || 0)) +
          "</td>" +
          "<td>" +
          formatByteHtml((file.data && file.data.length) || 0) +
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
      closeCreateDialog();
    } catch (error) {
      setStatus(error.message || String(error), true);
    }
  };

  const openCreateDialog = function () {
    if (typeof createDialog.showModal === "function") {
      createDialog.showModal();
    } else {
      createDialog.setAttribute("open", "open");
    }
  };

  const closeCreateDialog = function () {
    if (typeof createDialog.close === "function") {
      createDialog.close();
    } else {
      createDialog.removeAttribute("open");
    }
  };

  const loadSelectedFile = async function () {
    const file = imageUpload.files && imageUpload.files[0];
    if (!file) {
      setStatus("Choose a disk image first.", true);
      return;
    }
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      loadImageBytes(bytes, file.name, "Loaded existing D64 image.");
    } catch (error) {
      setStatus(error.message || String(error), true);
    } finally {
      imageUpload.value = "";
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

  const openFileTypeDialog = function (fileName) {
    if (!state.image) return;
    const file = d64.readFiles(state.image).find(function (entry) {
      return entry.name === fileName;
    });
    if (!file) {
      setStatus("File not found: " + fileName, true);
      return;
    }
    fileTypeTarget.value = file.name;
    fileTypeDialogName.textContent = file.name;
    fileTypeSelect.value = String(file.type || "prg").toLowerCase();
    fileRecordLengthInput.value = String(
      Math.max(1, Math.min(254, Number(file.recordLength) || 32)),
    );
    syncFileTypeDialog();
    if (typeof fileTypeDialog.showModal === "function") {
      fileTypeDialog.showModal();
    } else {
      fileTypeDialog.setAttribute("open", "open");
    }
  };

  const openFileNameDialog = function (fileName) {
    if (!state.image) return;
    const file = d64.readFiles(state.image).find(function (entry) {
      return entry.name === fileName;
    });
    if (!file) {
      setStatus("File not found: " + fileName, true);
      return;
    }
    fileNameTarget.value = file.name;
    fileNameDialogName.textContent = file.name;
    fileNameInput.value = file.name;
    validateFileNameInput();
    if (typeof fileNameDialog.showModal === "function") {
      fileNameDialog.showModal();
    } else {
      fileNameDialog.setAttribute("open", "open");
    }
  };

  const closeFileTypeDialog = function () {
    if (typeof fileTypeDialog.close === "function") {
      fileTypeDialog.close();
    } else {
      fileTypeDialog.removeAttribute("open");
    }
  };

  const closeFileNameDialog = function () {
    if (typeof fileNameDialog.close === "function") {
      fileNameDialog.close();
    } else {
      fileNameDialog.removeAttribute("open");
    }
  };

  const saveFileTypeDialog = function (event) {
    event.preventDefault();
    if (!state.image) return;
    const fileName = fileTypeTarget.value;
    const nextType = fileTypeSelect.value;
    const updates = {
      type: nextType,
    };
    if (nextType === "rel") {
      updates.recordLength = Math.max(
        1,
        Math.min(254, Number(fileRecordLengthInput.value) || 32),
      );
    }
    try {
      const nextImage = d64.updateFile(state.image, fileName, updates);
      loadImageBytes(
        nextImage,
        state.sourceName || "disk.d64",
        "Updated file type for " + fileName + ".",
      );
      closeFileTypeDialog();
    } catch (error) {
      setStatus(error.message || String(error), true);
    }
  };

  const saveFileNameDialog = function (event) {
    event.preventDefault();
    if (!state.image) return;
    const fileName = fileNameTarget.value;
    const nextName = d64.normalizeFileName(fileNameInput.value, 16);
    if (!validateFileNameInput()) {
      fileNameInput.reportValidity();
      return;
    }
    try {
      const nextImage = d64.renameFile(state.image, fileName, nextName);
      loadImageBytes(
        nextImage,
        state.sourceName || "disk.d64",
        "Renamed " + fileName + " to " + nextName + ".",
      );
      closeFileNameDialog();
    } catch (error) {
      setStatus(error.message || String(error), true);
    }
  };

  const rebuildDiskLayout = function (mode) {
    if (!state.image) return;
    try {
      const deletedBefore = d64.readDeletedEntries(state.image).length;
      const nextImage =
        mode === "fragmented"
          ? d64.fragmentImage(state.image)
          : d64.defragmentImage(state.image);
      if (!nextImage) {
        throw new Error(
          mode === "fragmented"
            ? "Unable to fragment the current D64 image."
            : "Unable to defragment the current D64 image.",
        );
      }
      const message =
        (mode === "fragmented"
          ? "Fragmented active file allocation across the disk."
          : "Defragmented active files into a compact layout.") +
        (deletedBefore
          ? " Deleted recovery entries were cleared during the rebuild."
          : "");
      loadImageBytes(nextImage, state.sourceName || "disk.d64", message);
    } catch (error) {
      setStatus(error.message || String(error), true);
    }
  };

  const addHostFilesToImage = async function (fileList) {
    if (!state.image) {
      setStatus(
        "Load or create a disk image before dropping files into it.",
        true,
      );
      return;
    }
    const files = Array.from(fileList || []).filter(function (file) {
      return file && typeof file.arrayBuffer === "function";
    });
    if (!files.length) return;
    let nextImage = state.image;
    for (let index = 0; index < files.length; index += 1) {
      const hostFile = files[index];
      const bytes = new Uint8Array(await hostFile.arrayBuffer());
      nextImage = d64.addFile(nextImage, {
        name: normalizeDroppedFileName(hostFile.name),
        type: inferDroppedFileType(hostFile.name),
        data: bytes,
      });
      if (!nextImage) {
        throw new Error(
          "Unable to add " + hostFile.name + " to the disk image.",
        );
      }
    }
    loadImageBytes(
      nextImage,
      state.sourceName || "disk.d64",
      "Added " +
        files.length +
        " host file" +
        (files.length === 1 ? "" : "s") +
        " to the disk image.",
    );
  };

  const startDiskMapDrag = function (event) {
    if (
      !state.image ||
      !diskMap.querySelector("svg") ||
      diskMapView.scale <= 1.01
    )
      return;
    diskMapView.dragging = true;
    diskMapView.dragMoved = false;
    diskMapView.dragStartX = event.clientX;
    diskMapView.dragStartY = event.clientY;
    diskMapView.originOffsetX = diskMapView.offsetX;
    diskMapView.originOffsetY = diskMapView.offsetY;
    diskMap.classList.add("is-dragging");
  };

  const moveDiskMapDrag = function (event) {
    if (!diskMapView.dragging) return;
    if (
      Math.abs(event.clientX - diskMapView.dragStartX) > 3 ||
      Math.abs(event.clientY - diskMapView.dragStartY) > 3
    ) {
      diskMapView.dragMoved = true;
    }
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
      createButton.disabled = true;
      loadButton.disabled = true;
      return;
    }

    createButton.addEventListener("click", openCreateDialog);
    loadButton.addEventListener("click", function () {
      imageUpload.click();
    });
    createForm.addEventListener("submit", createDiskImage);
    createCancel.addEventListener("click", function () {
      closeCreateDialog();
    });
    imageUpload.addEventListener("change", function () {
      if (imageUpload.files && imageUpload.files[0]) {
        setStatus("Loading " + imageUpload.files[0].name + "...");
        loadSelectedFile();
      }
    });
    diskMapFrame.addEventListener("dragenter", function (event) {
      if (!isFileDragEvent(event)) return;
      event.preventDefault();
      toggleDiskDropTarget(true);
    });
    diskMapFrame.addEventListener("dragover", function (event) {
      if (!isFileDragEvent(event)) return;
      event.preventDefault();
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = state.image ? "copy" : "none";
      }
      toggleDiskDropTarget(true);
    });
    diskMapFrame.addEventListener("dragleave", function (event) {
      if (!event.relatedTarget || !diskMapFrame.contains(event.relatedTarget)) {
        toggleDiskDropTarget(false);
      }
    });
    diskMapFrame.addEventListener("drop", async function (event) {
      if (!isFileDragEvent(event)) return;
      event.preventDefault();
      toggleDiskDropTarget(false);
      try {
        await addHostFilesToImage(
          event.dataTransfer && event.dataTransfer.files,
        );
      } catch (error) {
        setStatus(error.message || String(error), true);
      }
    });
    downloadButton.addEventListener("click", downloadCurrentImage);
    fragmentButton.addEventListener("click", function () {
      rebuildDiskLayout("fragmented");
    });
    defragmentButton.addEventListener("click", function () {
      rebuildDiskLayout("sequential");
    });
    diskMapZoomIn.addEventListener("click", function () {
      zoomDiskMap(1);
    });
    diskMapCoverToggle.addEventListener("click", function () {
      if (!state.image) return;
      state.diskCoverVisible = !state.diskCoverVisible;
      renderDiskMap(state.image);
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
    diskMap.addEventListener("click", function (event) {
      if (!state.image) return;
      if (diskMapView.dragMoved) {
        diskMapView.dragMoved = false;
        return;
      }
      const target = event.target.closest("[data-key]");
      if (!target) {
        clearSelectedDiskMapSector();
        renderDiskMapLegend();
        return;
      }
      selectDiskMapSector(target.dataset.track, target.dataset.sector);
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
    fileTypeSelect.addEventListener("change", syncFileTypeDialog);
    fileTypeForm.addEventListener("submit", saveFileTypeDialog);
    fileTypeCancel.addEventListener("click", function () {
      closeFileTypeDialog();
    });
    fileNameInput.addEventListener("input", function () {
      const normalizedValue = d64.normalizeFileName(fileNameInput.value, 16, {
        trim: false,
      });
      if (fileNameInput.value !== normalizedValue) {
        const start = fileNameInput.selectionStart;
        const end = fileNameInput.selectionEnd;
        const delta = fileNameInput.value.length - normalizedValue.length;
        fileNameInput.value = normalizedValue;
        if (typeof start === "number" && typeof end === "number") {
          const nextStart = Math.max(0, start - delta);
          const nextEnd = Math.max(0, end - delta);
          fileNameInput.setSelectionRange(nextStart, nextEnd);
        }
      }
      validateFileNameInput();
    });
    fileNameForm.addEventListener("submit", saveFileNameDialog);
    fileNameCancel.addEventListener("click", function () {
      closeFileNameDialog();
    });
    fileTableBody.addEventListener("click", function (event) {
      const button = event.target.closest("button[data-action]");
      if (!button) return;
      if (button.dataset.action === "edit-name") {
        openFileNameDialog(button.dataset.name);
        return;
      }
      if (button.dataset.action === "edit-type") {
        openFileTypeDialog(button.dataset.name);
        return;
      }
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
    diskMapLegend.addEventListener("click", function (event) {
      const jumpButton = event.target.closest('[data-action="jump-sector"]');
      if (jumpButton) {
        selectDiskMapSector(
          jumpButton.dataset.track,
          jumpButton.dataset.sector,
          { centerView: true },
        );
        return;
      }
      const button = event.target.closest('[data-action="show-legend"]');
      if (!button) return;
      clearSelectedDiskMapSector();
      renderDiskMapLegend();
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
