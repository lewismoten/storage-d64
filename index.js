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
    heatMapVisible: false,
    hexViewContext: null,
    doctorReport: null,
    doctorRunCount: 0,
    returnToDoctorReport: false,
    draggedFileName: "",
    draggedEntryIndex: "",
    dropTargetEntryIndex: "",
    dropPlacement: "before",
    doctorEntryContext: null,
    bamDialogContext: null,
    bamDialogDraft: null,
    bamDialogAnalysis: null,
    returnToBamDialog: null,
    bamHoverTrack: null,
    bamHoverSector: null,
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
  const doctorButton = document.getElementById("doctor-button");
  const validateButton = document.getElementById("validate-button");
  const fragmentButton = document.getElementById("fragment-button");
  const defragmentButton = document.getElementById("defragment-button");
  const corruptButton = document.getElementById("corrupt-button");
  const heatmapButton = document.getElementById("heatmap-button");
  const currentFileName = document.getElementById("current-file-name");
  const status = document.getElementById("status");
  const headerSummary = document.getElementById("header-summary");
  const usageSummary = document.getElementById("usage-summary");
  const usageChartPanel = document.getElementById("usage-chart-panel");
  const usageChart = document.getElementById("usage-chart");
  const usageLegend = document.getElementById("usage-legend");
  const diskMapFrame = document.getElementById("disk-map-frame");
  const diskMap = document.getElementById("disk-map");
  const diskMapHeatmapSummary = document.getElementById(
    "disk-map-heatmap-summary",
  );
  const diskMapPointer = document.getElementById("disk-map-pointer");
  const diskMapTooltip = document.getElementById("disk-map-tooltip");
  const diskDropHint = document.getElementById("disk-drop-hint");
  const diskMapLegend = document.getElementById("disk-map-legend");
  const diskMapInspector = document.getElementById("disk-map-inspector");
  const diskMapPhysical = document.getElementById("disk-map-physical");
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
  const restoreFileDialog = document.getElementById("restore-file-dialog");
  const restoreFileForm = document.getElementById("restore-file-form");
  const restoreFileDialogName = document.getElementById(
    "restore-file-dialog-name",
  );
  const restoreFileTarget = document.getElementById("restore-file-target");
  const restoreFileName = document.getElementById("restore-file-name");
  const restoreFileSelect = document.getElementById("restore-file-select");
  const restoreFileCancel = document.getElementById("restore-file-cancel");
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
  const headerDiskNameDialog = document.getElementById(
    "header-disk-name-dialog",
  );
  const headerDiskNameForm = document.getElementById("header-disk-name-form");
  const headerDiskNameDialogName = document.getElementById(
    "header-disk-name-dialog-name",
  );
  const headerDiskNameInput = document.getElementById("header-disk-name-input");
  const headerDiskNameCancel = document.getElementById(
    "header-disk-name-cancel",
  );
  const doctorEntryDialog = document.getElementById("doctor-entry-dialog");
  const doctorEntryForm = document.getElementById("doctor-entry-form");
  const doctorEntryDialogName = document.getElementById(
    "doctor-entry-dialog-name",
  );
  const doctorEntryDialogMeta = document.getElementById(
    "doctor-entry-dialog-meta",
  );
  const doctorEntryIndex = document.getElementById("doctor-entry-index");
  const doctorEntryNameField = document.getElementById(
    "doctor-entry-name-field",
  );
  const doctorEntryTypeField = document.getElementById(
    "doctor-entry-type-field",
  );
  const doctorEntryType = document.getElementById("doctor-entry-type");
  const doctorEntryName = document.getElementById("doctor-entry-name");
  const doctorEntryStartTrack = document.getElementById(
    "doctor-entry-start-track",
  );
  const doctorEntryStartSector = document.getElementById(
    "doctor-entry-start-sector",
  );
  const doctorEntryBlockCount = document.getElementById(
    "doctor-entry-block-count",
  );
  const doctorEntryBlockCountField = document.getElementById(
    "doctor-entry-block-count-field",
  );
  const doctorEntryClosed = document.getElementById("doctor-entry-closed");
  const doctorEntryLocked = document.getElementById("doctor-entry-locked");
  const doctorEntryRelGroup = document.getElementById("doctor-entry-rel-group");
  const doctorEntrySideTrackField = document.getElementById(
    "doctor-entry-side-track-field",
  );
  const doctorEntrySideTrack = document.getElementById(
    "doctor-entry-side-track",
  );
  const doctorEntrySideSectorField = document.getElementById(
    "doctor-entry-side-sector-field",
  );
  const doctorEntrySideSector = document.getElementById(
    "doctor-entry-side-sector",
  );
  const doctorEntryRecordLengthField = document.getElementById(
    "doctor-entry-record-length-field",
  );
  const doctorEntryRecordLength = document.getElementById(
    "doctor-entry-record-length",
  );
  const doctorEntryRecordCapacity = document.getElementById(
    "doctor-entry-record-capacity",
  );
  const doctorEntryCancel = document.getElementById("doctor-entry-cancel");
  const doctorEntrySave = document.getElementById("doctor-entry-save");
  const doctorEntryBitmaskButton = document.getElementById(
    "doctor-entry-bitmask-button",
  );
  const doctorEntryBitmask = document.getElementById("doctor-entry-bitmask");
  const doctorDiskIdDialog = document.getElementById("doctor-disk-id-dialog");
  const doctorDiskIdForm = document.getElementById("doctor-disk-id-form");
  const doctorDiskIdDialogName = document.getElementById(
    "doctor-disk-id-dialog-name",
  );
  const doctorDiskIdInput = document.getElementById("doctor-disk-id-input");
  const doctorDiskIdCancel = document.getElementById("doctor-disk-id-cancel");
  const doctorDosTypeDialog = document.getElementById("doctor-dos-type-dialog");
  const doctorDosTypeForm = document.getElementById("doctor-dos-type-form");
  const doctorDosTypeDialogName = document.getElementById(
    "doctor-dos-type-dialog-name",
  );
  const doctorDosTypeSelect = document.getElementById("doctor-dos-type-select");
  const doctorDosTypeCancel = document.getElementById("doctor-dos-type-cancel");
  const doctorDosVersionDialog = document.getElementById(
    "doctor-dos-version-dialog",
  );
  const doctorDosVersionForm = document.getElementById(
    "doctor-dos-version-form",
  );
  const doctorDosVersionDialogName = document.getElementById(
    "doctor-dos-version-dialog-name",
  );
  const doctorDosVersionSelect = document.getElementById(
    "doctor-dos-version-select",
  );
  const doctorDosVersionCancel = document.getElementById(
    "doctor-dos-version-cancel",
  );
  const bamDialog = document.getElementById("bam-dialog");
  const bamForm = document.getElementById("bam-form");
  const bamDialogName = document.getElementById("bam-dialog-name");
  const bamGrid = document.getElementById("bam-grid");
  const bamTooltip = document.getElementById("bam-tooltip");
  const bamBitmaskButton = document.getElementById("bam-bitmask-button");
  const bamBitmask = document.getElementById("bam-bitmask");
  const bamCancel = document.getElementById("bam-cancel");
  const sectorDataDialog = document.getElementById("sector-data-dialog");
  const sectorDataDialogTitle = document.getElementById(
    "sector-data-dialog-title",
  );
  const sectorDataDialogName = document.getElementById(
    "sector-data-dialog-name",
  );
  const sectorDataDialogBody = document.getElementById(
    "sector-data-dialog-body",
  );
  const sectorDataClose = document.getElementById("sector-data-close");
  const sectorByteDialog = document.getElementById("sector-byte-dialog");
  const sectorByteForm = document.getElementById("sector-byte-form");
  const sectorByteDialogName = document.getElementById(
    "sector-byte-dialog-name",
  );
  const sectorByteDialogMeta = document.getElementById(
    "sector-byte-dialog-meta",
  );
  const sectorByteModeField = document.getElementById("sector-byte-mode-field");
  const sectorByteModeHex = document.getElementById("sector-byte-mode-hex");
  const sectorByteModeText = document.getElementById("sector-byte-mode-text");
  const sectorByteTrack = document.getElementById("sector-byte-track");
  const sectorByteSector = document.getElementById("sector-byte-sector");
  const sectorByteIndex = document.getElementById("sector-byte-index");
  const sectorByteValue = document.getElementById("sector-byte-value");
  const sectorByteTextField = document.getElementById("sector-byte-text-field");
  const sectorByteText = document.getElementById("sector-byte-text");
  const sectorByteTextMeta = document.getElementById("sector-byte-text-meta");
  const sectorByteCancel = document.getElementById("sector-byte-cancel");
  const doctorDialog = document.getElementById("doctor-dialog");
  const doctorDialogName = document.getElementById("doctor-dialog-name");
  const doctorSummary = document.getElementById("doctor-summary");
  const doctorReportBody = document.getElementById("doctor-report-body");
  const doctorClose = document.getElementById("doctor-close");
  const numberFormatter = new Intl.NumberFormat("en-US");

  const REQUIRED_API = [
    "buildImage",
    "readHeader",
    "readBam",
    "readFreeMap",
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
    "scratchFileWithReport",
    "undeleteFile",
    "destroyDeletedFile",
    "destroyDeletedFileWithReport",
    "repairBlockCounts",
    "diagnoseImage",
    "validateImage",
    "fragmentImage",
    "defragmentImage",
    "corruptImageForDoctor",
    "addFile",
    "reorderFiles",
    "trackSectorCount",
    "readDirectoryEntry",
    "writeDirectoryEntryBytes",
    "writeBamFreeMap",
    "encodeDirectoryEntryType",
    "encodeFileName",
    "normalizeDiskNameFieldBytes",
    "describeDosVersion",
  ];
  const DISK_MAP_COLORS = Object.freeze({
    free: "#6f5133",
    suspiciousFree: "#111111",
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
  const HEATMAP_YELLOW_SCORE = 70;
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
    status.dataset.error = isError ? "true" : "false";
    status.classList.toggle("is-visible", Boolean(message));
  };

  const normalizeDiskId = function (value) {
    return (
      String(value || "")
        .trim()
        .toUpperCase() || "TL"
    ).slice(0, 2);
  };

  const normalizeDoctorDiskIdValue = function (value) {
    return String(value || "")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 2);
  };

  const doctorDosTypeOptions = Object.values(
    (d64 && d64.dosTypeInfo) || {
      "2A": {
        code: "2A",
        label: "2A",
        description: "Standard 1541-style CBM DOS disk",
        is1541Valid: true,
      },
    },
  );

  const doctorDosVersionOptions = Object.values(
    (d64 && d64.dosVersionInfo) || {
      65: {
        key: "dos2_6",
        code: 0x41,
        ascii: "A",
        label: "1541 / D64",
        description: "1541 / D64 DOS version byte",
        is1541Valid: true,
      },
    },
  ).sort(function (left, right) {
    const order = { 65: 0, 0: 1, 67: 2, 68: 3 };
    const leftOrder =
      order[left && left.code] != null
        ? order[left.code]
        : 999 + (left.code || 0);
    const rightOrder =
      order[right && right.code] != null
        ? order[right.code]
        : 999 + (right.code || 0);
    return leftOrder - rightOrder;
  });

  const formatDosTypeChipLabel = function (dosTypeInfo, dosTypeValue) {
    const code = String((dosTypeInfo && dosTypeInfo.code) || "").toUpperCase();
    if (code) return code;
    const value = String(dosTypeValue || "");
    if (value && /^[ -~]+$/.test(value)) {
      return value;
    }
    if (value) {
      return Array.from(value)
        .map(function (char) {
          return (
            "0x" +
            char.charCodeAt(0).toString(16).toUpperCase().padStart(2, "0")
          );
        })
        .join(" ");
    }
    return "0x00";
  };

  const formatDosVersionChipLabel = function (dosVersionInfo, dosVersionByte) {
    if (dosVersionInfo && dosVersionInfo.ascii) {
      return dosVersionInfo.ascii;
    }
    const byte = Math.max(0, Math.min(255, Number(dosVersionByte) || 0));
    if (byte >= 32 && byte <= 126) {
      return String.fromCharCode(byte);
    }
    return "0x" + byte.toString(16).toUpperCase().padStart(2, "0");
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

  const encodeHtmlAttribute = function (value) {
    return escapeHtml(value);
  };

  const matchesDoctorSectorHighlight = function (highlight, track, sector) {
    return (
      highlight &&
      Number(highlight.track) === Number(track) &&
      Number(highlight.sector) === Number(sector)
    );
  };

  const findDoctorIssueHighlight = function (issue, track, sector) {
    if (!issue || !Array.isArray(issue.sectorHighlights)) return null;
    return (
      issue.sectorHighlights.find(function (highlight) {
        return matchesDoctorSectorHighlight(highlight, track, sector);
      }) || null
    );
  };

  const findMatchingDoctorIssue = function (report, context) {
    const issues = report && Array.isArray(report.issues) ? report.issues : [];
    const target = context || {};
    return (
      issues.find(function (issue) {
        if (target.code && issue.code !== target.code) return false;
        if (
          target.entryIndex != null &&
          Number(issue.entryIndex) !== Number(target.entryIndex)
        ) {
          return false;
        }
        if (
          target.track != null &&
          target.sector != null &&
          Array.isArray(issue.sectorHighlights) &&
          issue.sectorHighlights.length
        ) {
          return issue.sectorHighlights.some(function (highlight) {
            return matchesDoctorSectorHighlight(
              highlight,
              target.track,
              target.sector,
            );
          });
        }
        return true;
      }) || null
    );
  };

  const renderDoctorTextWithSectorLinks = function (text, issueIndex) {
    const source = String(text || "");
    const pattern = /T\s*(\d{1,2})\s*S\s*(\d{1,2})/gi;
    let cursor = 0;
    let markup = "";
    let match = pattern.exec(source);
    while (match) {
      const start = match.index;
      const end = start + match[0].length;
      markup += escapeHtml(source.slice(cursor, start));
      markup +=
        '<button type="button" class="doctor-sector-link" data-action="open-doctor-sector" data-issue-index="' +
        encodeHtmlAttribute(String(issueIndex)) +
        '" data-track="' +
        encodeHtmlAttribute(String(Number(match[1]))) +
        '" data-sector="' +
        encodeHtmlAttribute(String(Number(match[2]))) +
        '">' +
        escapeHtml(match[0].replace(/\s+/g, " ").trim()) +
        "</button>";
      cursor = end;
      match = pattern.exec(source);
    }
    markup += escapeHtml(source.slice(cursor));
    return markup;
  };

  const findDoctorIssueByIndex = function (issueIndex) {
    return (
      (state.doctorReport &&
        Array.isArray(state.doctorReport.issues) &&
        state.doctorReport.issues[issueIndex]) ||
      null
    );
  };

  const extractDoctorSectorKeys = function (issue) {
    const keys = {};
    if (issue && Array.isArray(issue.sectorHighlights)) {
      issue.sectorHighlights.forEach(function (highlight) {
        if (!highlight || highlight.track == null || highlight.sector == null) {
          return;
        }
        keys[
          String(Number(highlight.track)) +
            ":" +
            String(Number(highlight.sector))
        ] = true;
      });
    }
    if (issue && Array.isArray(issue.items)) {
      issue.items.forEach(function (item) {
        const match = /T\s*(\d{1,2})\s*S\s*(\d{1,2})/i.exec(String(item || ""));
        if (!match) return;
        keys[String(Number(match[1])) + ":" + String(Number(match[2]))] = true;
      });
    }
    return keys;
  };

  const extractDoctorTrackMismatchMap = function (issue) {
    const mismatches = {};
    if (!issue || issue.code !== "incorrect-bam-free-counts") {
      return mismatches;
    }
    (Array.isArray(issue.items) ? issue.items : []).forEach(function (item) {
      const match =
        /Track\s+(\d+):\s+BAM says\s+(\d+),\s+bits show\s+(\d+)/i.exec(
          String(item || ""),
        );
      if (!match) return;
      mismatches[Math.max(1, Number(match[1]) || 0)] = {
        bamFreeCount: Number(match[2]) || 0,
        bitFreeCount: Number(match[3]) || 0,
      };
    });
    return mismatches;
  };

  const getBamRelevantDoctorIssues = function () {
    return (
      (state.doctorReport && Array.isArray(state.doctorReport.issues)
        ? state.doctorReport.issues
        : []
      ).filter(function (issue) {
        return (
          issue &&
          (issue.code === "incorrect-bam-free-counts" ||
            issue.code === "bam-disagrees-used-blocks-marked-free" ||
            issue.code === "orphaned-allocated-blocks")
        );
      }) || []
    );
  };

  const getBamLegendMarkup = function () {
    return [
      '<span class="bam-legend-item"><span class="bam-legend-swatch is-free"></span>Free</span>',
      '<span class="bam-legend-item"><span class="bam-legend-swatch is-used"></span>Used</span>',
      '<span class="bam-legend-item"><span class="bam-legend-swatch is-active"></span>Active</span>',
      '<span class="bam-legend-item"><span class="bam-legend-swatch is-unreachable"></span>Unreachable</span>',
      '<span class="bam-legend-item"><span class="bam-legend-swatch is-untracked"></span>Invalid</span>',
    ].join("");
  };

  const buildBamSectorPreview = function () {
    if (!state.image || !state.bamDialogDraft) return null;
    const previewImage = d64.writeBamFreeMap(state.image, state.bamDialogDraft);
    const sectorBytes = d64.readSector(previewImage, 18, 0);
    const bamStart = d64.headerOffsets.bamStart;
    const bamEnd = bamStart + 35 * 4;
    return sectorBytes.subarray(bamStart, bamEnd);
  };

  const buildBamPreviewImage = function () {
    if (!state.image || !state.bamDialogDraft) return null;
    return d64.writeBamFreeMap(state.image, state.bamDialogDraft);
  };

  const getBamDialogRelevantIssues = function () {
    const report = state.bamDialogAnalysis;
    return (
      (report && Array.isArray(report.issues) ? report.issues : []).filter(
        function (issue) {
          return (
            issue &&
            (issue.code === "incorrect-bam-free-counts" ||
              issue.code === "bam-disagrees-used-blocks-marked-free" ||
              issue.code === "orphaned-allocated-blocks")
          );
        },
      ) || []
    );
  };

  const buildBamByteRoleMap = function (byteCount) {
    const roleMap = {};
    const total = Math.max(0, Math.floor(Number(byteCount) || 0));
    for (let byteIndex = 0; byteIndex < total; byteIndex += 1) {
      roleMap[byteIndex] = byteIndex % 4 === 0 ? "bam-count" : "bam-free";
    }
    return roleMap;
  };

  const getBamBitmaskPixelClass = function (track, sector) {
    const issueInfo = getBamCellIssueInfo(track, sector);
    let baseClass = "is-used";
    if (issueInfo && issueInfo.issueClass === "is-problem-free") {
      baseClass = "is-active";
    } else if (issueInfo && issueInfo.issueClass === "is-problem-used") {
      baseClass = "is-unreachable";
    } else if (
      state.bamDialogDraft[track] &&
      state.bamDialogDraft[track][sector]
    ) {
      baseClass = "is-free";
    }
    return baseClass;
  };

  const renderBamBitmask = function () {
    if (!bamBitmask || !bamBitmaskButton) return;
    const bytes = buildBamSectorPreview();
    if (!bytes || !bytes.length) {
      bamBitmask.innerHTML = "";
      bamBitmaskButton.disabled = true;
      return;
    }
    bamBitmaskButton.disabled = false;
    bamBitmask.setAttribute("viewBox", "0 0 " + String(bytes.length) + " 8");
    const zones = [];
    const zeroColumns = [];
    const pixels = [];
    const hoverOutlines = [];
    for (let byteIndex = 0; byteIndex < bytes.length; byteIndex += 1) {
      const track = Math.floor(byteIndex / 4) + 1;
      const sectorCount = d64.trackSectorCount(track);
      const byteInTrack = byteIndex % 4;
      const isEvenTrack = track % 2 === 0;
      const role = byteInTrack === 0 ? "count" : "bam";
      const value = Number(bytes[byteIndex]) || 0;
      zones.push(
        '<rect class="bam-bitmask-zone is-' +
          role +
          (isEvenTrack ? " is-track-even" : "") +
          '" x="' +
          String(byteIndex) +
          '" y="0" width="1" height="8"></rect>',
      );
      if (value === 0) {
        zeroColumns.push(
          '<rect class="bam-bitmask-zero-column" x="' +
            String(byteIndex) +
            '" y="0" width="1" height="8"></rect>',
        );
      }
      for (let bit = 0; bit < 8; bit += 1) {
        let pixelClass = "";
        let pixelAttributes = "";
        if (byteInTrack === 0) {
          const maxCountBit = Math.floor(Math.log2(Math.max(1, sectorCount)));
          if (bit > maxCountBit) {
            pixelClass = "is-unused";
          } else {
            pixelClass =
              ((value >> bit) & 1) === 1 ? "is-count-on" : "is-count-off";
            if (isEvenTrack) {
              pixelClass += " is-track-even";
            }
            pixelAttributes =
              ' data-count-track="' +
              String(track) +
              '" data-count-bit="' +
              String(bit) +
              '"';
          }
        } else {
          const sector = (byteInTrack - 1) * 8 + bit;
          if (sector >= sectorCount) {
            pixelClass = "is-unused";
          } else {
            const baseClass = getBamBitmaskPixelClass(track, sector);
            pixelClass =
              baseClass +
              (((value >> bit) & 1) === 1 ? "-on" : "-off") +
              (isEvenTrack ? " is-track-even" : "");
            pixelAttributes =
              ' data-track="' +
              String(track) +
              '" data-sector="' +
              String(sector) +
              '"';
            hoverOutlines.push(
              '<rect class="bam-bitmask-hover-outline bam-bitmask-hover-outline-dark" data-track="' +
                String(track) +
                '" data-sector="' +
                String(sector) +
                '" x="' +
                (byteIndex - 0.24).toFixed(3) +
                '" y="' +
                (bit - 0.24).toFixed(3) +
                '" width="1.48" height="1.48"></rect>',
            );
            hoverOutlines.push(
              '<rect class="bam-bitmask-hover-outline bam-bitmask-hover-outline-light" data-track="' +
                String(track) +
                '" data-sector="' +
                String(sector) +
                '" x="' +
                (byteIndex - 0.24).toFixed(3) +
                '" y="' +
                (bit - 0.24).toFixed(3) +
                '" width="1.48" height="1.48"></rect>',
            );
          }
        }
        pixels.push(
          '<rect class="bam-bitmask-pixel ' +
            pixelClass +
            '"' +
            pixelAttributes +
            ' x="' +
            String(byteIndex) +
            '" y="' +
            String(bit) +
            '" width="1" height="1"></rect>',
        );
      }
      if (byteInTrack === 0) {
        const maxCountBit = Math.floor(Math.log2(Math.max(1, sectorCount)));
        hoverOutlines.push(
          '<rect class="bam-bitmask-hover-outline bam-bitmask-hover-outline-dark" data-track-byte="' +
            String(track) +
            '" x="' +
            (byteIndex - 0.24).toFixed(3) +
            '" y="' +
            (-0.24).toFixed(3) +
            '" width="4.48" height="8.48"></rect>',
        );
        hoverOutlines.push(
          '<rect class="bam-bitmask-hover-outline bam-bitmask-hover-outline-light" data-track-byte="' +
            String(track) +
            '" x="' +
            (byteIndex - 0.24).toFixed(3) +
            '" y="' +
            (-0.24).toFixed(3) +
            '" width="4.48" height="8.48"></rect>',
        );
        hoverOutlines.push(
          '<rect class="bam-bitmask-hover-outline bam-bitmask-hover-outline-dark" data-count-track="' +
            String(track) +
            '" x="' +
            (byteIndex - 0.24).toFixed(3) +
            '" y="' +
            (-0.24).toFixed(3) +
            '" width="1.48" height="' +
            (maxCountBit + 1.48).toFixed(3) +
            '"></rect>',
        );
        hoverOutlines.push(
          '<rect class="bam-bitmask-hover-outline bam-bitmask-hover-outline-light" data-count-track="' +
            String(track) +
            '" x="' +
            (byteIndex - 0.24).toFixed(3) +
            '" y="' +
            (-0.24).toFixed(3) +
            '" width="1.48" height="' +
            (maxCountBit + 1.48).toFixed(3) +
            '"></rect>',
        );
      }
    }
    bamBitmask.innerHTML =
      zones.join("") +
      zeroColumns.join("") +
      pixels.join("") +
      hoverOutlines.join("");
  };

  const setBamGridHover = function (track, sector, options) {
    const config = options || {};
    state.bamHoverTrack =
      track == null ? null : Math.max(1, Math.floor(Number(track) || 0));
    state.bamHoverSector =
      sector == null ? null : Math.max(0, Math.floor(Number(sector) || 0));
    if (!bamGrid) return;
    bamGrid.querySelectorAll(".is-hovered").forEach(function (node) {
      node.classList.remove("is-hovered");
    });
    if (bamBitmask) {
      bamBitmask.querySelectorAll(".is-hovered").forEach(function (node) {
        node.classList.remove("is-hovered");
      });
    }
    if (state.bamHoverTrack == null) return;
    const selectors = [
      '[data-track-header="' + String(state.bamHoverTrack) + '"]',
      '[data-freecount-track="' + String(state.bamHoverTrack) + '"]',
    ];
    if (state.bamHoverSector != null) {
      selectors.unshift(
        '[data-track="' +
          String(state.bamHoverTrack) +
          '"][data-sector="' +
          String(state.bamHoverSector) +
          '"]',
      );
      selectors.push(
        '[data-sector-header="' + String(state.bamHoverSector) + '"]',
      );
    }
    selectors.forEach(function (selector) {
      bamGrid.querySelectorAll(selector).forEach(function (node) {
        node.classList.add("is-hovered");
      });
    });
    if (bamBitmask) {
      const bitmaskSelectors = [];
      if (state.bamHoverSector != null) {
        bitmaskSelectors.push(
          '[data-track="' +
            String(state.bamHoverTrack) +
            '"][data-sector="' +
            String(state.bamHoverSector) +
            '"]',
        );
      }
      if (config.highlightCountBits) {
        bitmaskSelectors.push(
          '[data-count-track="' + String(state.bamHoverTrack) + '"]',
        );
      }
      if (config.highlightTrackBytes) {
        bitmaskSelectors.push(
          '[data-track-byte="' + String(state.bamHoverTrack) + '"]',
        );
      }
      bitmaskSelectors.forEach(function (selector) {
        bamBitmask.querySelectorAll(selector).forEach(function (node) {
          node.classList.add("is-hovered");
        });
      });
    }
  };

  const getBamCellIssueInfo = function (track, sector) {
    if (!state.image || !state.bamDialogDraft) return "";
    const key = String(track) + ":" + String(sector);
    const draftValue =
      state.bamDialogDraft[track] && state.bamDialogDraft[track][sector];
    const relevantIssues = getBamDialogRelevantIssues();
    const selectedIssue = findDoctorIssueByIndex(
      Number(
        state.bamDialogContext && state.bamDialogContext.issueIndex != null
          ? state.bamDialogContext.issueIndex
          : -1,
      ),
    );
    const concerns = [];
    let issueClass = "";
    let hasTrackWarning = false;
    let isCurrentReview = false;
    relevantIssues.forEach(function (issue) {
      if (!issue) return;
      if (issue.code === "bam-disagrees-used-blocks-marked-free") {
        const issueKeys = extractDoctorSectorKeys(issue);
        if (issueKeys[key] && draftValue === true) {
          concerns.push({
            code: issue.code,
            detail:
              "This sector is claimed by the directory or an active file chain, but the BAM still marks it free.",
            className: "is-problem-free",
          });
        }
      } else if (issue.code === "orphaned-allocated-blocks") {
        const issueKeys = extractDoctorSectorKeys(issue);
        if (issueKeys[key] && draftValue === false) {
          concerns.push({
            code: issue.code,
            detail:
              "The BAM marks this sector used, but no reachable active file or directory structure claims it.",
            className: "is-problem-used",
          });
        }
      } else if (issue.code === "incorrect-bam-free-counts") {
        const trackMismatches = extractDoctorTrackMismatchMap(issue);
        if (trackMismatches[track]) {
          hasTrackWarning = true;
          concerns.push({
            code: issue.code,
            detail:
              "Track " +
              String(track) +
              " has a free-count mismatch. BAM says " +
              String(trackMismatches[track].bamFreeCount) +
              ", but the bitmap currently contains " +
              String(trackMismatches[track].bitFreeCount) +
              " free sectors.",
            className:
              draftValue === true ? "is-problem-free" : "is-problem-used",
          });
        }
      }
    });
    if (concerns.length) {
      issueClass = concerns[0].className;
    }
    if (selectedIssue) {
      const selectedIssueStillPresent = relevantIssues.find(function (issue) {
        return issue && issue.code === selectedIssue.code;
      });
      if (!selectedIssueStillPresent) {
        isCurrentReview = false;
      } else if (selectedIssue.code === "incorrect-bam-free-counts") {
        const trackMismatches = extractDoctorTrackMismatchMap(
          selectedIssueStillPresent,
        );
        isCurrentReview = Boolean(trackMismatches[track]);
      } else {
        const selectedKeys = extractDoctorSectorKeys(selectedIssueStillPresent);
        isCurrentReview = Boolean(
          selectedKeys[key] &&
          ((selectedIssue.code === "bam-disagrees-used-blocks-marked-free" &&
            draftValue === true) ||
            (selectedIssue.code === "orphaned-allocated-blocks" &&
              draftValue === false)),
        );
      }
    }
    const statusLabel =
      draftValue == null
        ? "Not in BAM"
        : draftValue
          ? "Marked Free"
          : "Marked Used";
    const detail = concerns.length
      ? concerns.map(function (concern) {
          return concern.detail;
        })
      : track > 35
        ? [
            "This track is outside the standard 35-track D64 BAM area and is shown for reference only.",
          ]
        : [
            "This sector is currently " +
              statusLabel.toLowerCase() +
              " in the BAM.",
          ];
    return {
      statusLabel: statusLabel,
      detail: detail,
      issueClass: issueClass,
      hasTrackWarning: hasTrackWarning,
      isCurrentReview: isCurrentReview,
      concerns: concerns,
    };
  };

  const getBamCellTooltipMarkup = function (track, sector) {
    const info = getBamCellIssueInfo(track, sector);
    if (!info) return "";
    return (
      "<strong>T" +
      escapeHtml(String(track)) +
      " S" +
      escapeHtml(String(sector)) +
      "</strong>" +
      info.detail
        .map(function (detail) {
          return "<p>" + escapeHtml(detail) + "</p>";
        })
        .join("")
    );
  };

  const showBamTooltip = function (markup, clientX, clientY) {
    if (!markup) {
      bamTooltip.hidden = true;
      bamTooltip.innerHTML = "";
      return;
    }
    bamTooltip.innerHTML = markup;
    bamTooltip.hidden = false;
    const offset = 14;
    bamTooltip.style.left = String(clientX + offset) + "px";
    bamTooltip.style.top = String(clientY + offset) + "px";
  };

  const hideBamTooltip = function () {
    bamTooltip.hidden = true;
    bamTooltip.innerHTML = "";
  };

  const findActiveFileByEntryIndex = function (entryIndex) {
    if (!state.image) return null;
    const targetIndex = String(entryIndex == null ? "" : entryIndex);
    if (!targetIndex) return null;
    return (
      d64.readFiles(state.image).find(function (file) {
        return (
          String(
            file.entry && file.entry.index != null ? file.entry.index : "",
          ) === targetIndex
        );
      }) || null
    );
  };

  const renderDuplicateDoctorGroups = function (groups, issueIndex) {
    return (Array.isArray(groups) ? groups : [])
      .map(function (group) {
        const refs = (Array.isArray(group.entries) ? group.entries : [])
          .map(function (entry) {
            const track = Number(entry && entry.track);
            const sector = Number(entry && entry.sector);
            const slot = Number(entry && entry.slot);
            const entryIndex = Number(entry && entry.index);
            return (
              '<span class="doctor-inline-entry">(' +
              '<button type="button" class="doctor-sector-link" data-action="open-doctor-sector" data-issue-index="' +
              encodeHtmlAttribute(String(issueIndex)) +
              '" data-track="' +
              encodeHtmlAttribute(String(track)) +
              '" data-sector="' +
              encodeHtmlAttribute(String(sector)) +
              '">' +
              escapeHtml("T" + String(track) + " S" + String(sector)) +
              "</button> " +
              '<button type="button" class="doctor-slot-link" data-action="edit-doctor-entry" data-entry-index="' +
              encodeHtmlAttribute(String(entryIndex)) +
              '" data-issue-index="' +
              encodeHtmlAttribute(String(issueIndex)) +
              '">' +
              escapeHtml("Slot " + String(slot)) +
              "</button>)</span>"
            );
          })
          .join(", ");
        return (
          '<div class="doctor-inline-group">' +
          '<span class="doctor-inline-name">' +
          escapeHtml(String((group && group.name) || "")) +
          "</span>" +
          '<span class="doctor-inline-entry-list">' +
          refs +
          "</span>" +
          "</div>"
        );
      })
      .join("");
  };

  const isDoctorSectorItemList = function (items) {
    if (!Array.isArray(items) || !items.length) return false;
    return items.every(function (item) {
      const value = String(item || "").trim();
      return /^T\s*\d{1,2}\s*S\s*\d{1,2}$/.test(value);
    });
  };

  const formatNumber = function (value) {
    return numberFormatter.format(Math.max(0, Math.round(Number(value) || 0)));
  };

  const mixColor = function (start, end, ratio) {
    const normalizeHex = function (hex) {
      const value = String(hex || "").replace("#", "");
      const expanded =
        value.length === 3
          ? value
              .split("")
              .map(function (part) {
                return part + part;
              })
              .join("")
          : value.padStart(6, "0").slice(0, 6);
      return {
        r: parseInt(expanded.slice(0, 2), 16),
        g: parseInt(expanded.slice(2, 4), 16),
        b: parseInt(expanded.slice(4, 6), 16),
      };
    };
    const startColor = normalizeHex(start);
    const endColor = normalizeHex(end);
    const amount = Math.max(0, Math.min(1, Number(ratio) || 0));
    const toHex = function (value) {
      return Math.round(value).toString(16).padStart(2, "0");
    };
    return (
      "#" +
      toHex(startColor.r + (endColor.r - startColor.r) * amount) +
      toHex(startColor.g + (endColor.g - startColor.g) * amount) +
      toHex(startColor.b + (endColor.b - startColor.b) * amount)
    );
  };

  const scoreToHeatColor = function (score) {
    const safeScore = Math.max(0, Math.min(100, Number(score) || 0));
    if (safeScore <= HEATMAP_YELLOW_SCORE) {
      return mixColor("#e03131", "#ffd43b", safeScore / HEATMAP_YELLOW_SCORE);
    }
    return mixColor(
      "#ffd43b",
      "#2fce6d",
      (safeScore - HEATMAP_YELLOW_SCORE) / (100 - HEATMAP_YELLOW_SCORE),
    );
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

  const hasDuplicateFileName = function (nextName, currentEntryIndex) {
    if (!state.image) return false;
    const normalizedNextName = d64.normalizeFileName(nextName, 16);
    const targetIndex = String(
      currentEntryIndex == null ? "" : currentEntryIndex,
    );
    return d64.readFiles(state.image).some(function (entry) {
      const entryName = d64.normalizeFileName(entry.name, 16);
      return (
        entryName === normalizedNextName &&
        String(
          entry.entry && entry.entry.index != null ? entry.entry.index : "",
        ) !== targetIndex
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

  const hasDuplicateDoctorEntryName = function (nextName, entryIndex) {
    if (!state.image) return false;
    const normalizedNextName = d64.normalizeFileName(nextName, 16);
    const targetIndex = Math.max(0, Math.floor(Number(entryIndex) || 0));
    return d64.readFiles(state.image).some(function (file) {
      const entry = file.entry || {};
      return (
        Number(entry.index) !== targetIndex &&
        d64.normalizeFileName(file.name, 16) === normalizedNextName
      );
    });
  };

  const validateDoctorEntryDialog = function () {
    if (!state.image) return false;
    const geometry = d64.describeGeometry(state.image);
    const nextName = d64.normalizeFileName(doctorEntryName.value, 16);
    const entryIndexValue = Math.max(
      0,
      Math.floor(Number(doctorEntryIndex.value) || 0),
    );
    const type = String(doctorEntryType.value || "prg").toLowerCase();
    const startTrack = Math.max(
      0,
      Math.floor(Number(doctorEntryStartTrack.value) || 0),
    );
    const startSector = Math.max(
      0,
      Math.floor(Number(doctorEntryStartSector.value) || 0),
    );
    const sideTrack = Math.max(
      0,
      Math.floor(Number(doctorEntrySideTrack.value) || 0),
    );
    const sideSector = Math.max(
      0,
      Math.floor(Number(doctorEntrySideSector.value) || 0),
    );
    const recordLength = Math.max(
      0,
      Math.floor(Number(doctorEntryRecordLength.value) || 0),
    );

    doctorEntryName.setCustomValidity("");
    doctorEntryStartTrack.setCustomValidity("");
    doctorEntryStartSector.setCustomValidity("");
    doctorEntrySideTrack.setCustomValidity("");
    doctorEntrySideSector.setCustomValidity("");
    doctorEntryRecordLength.setCustomValidity("");

    if (!nextName) {
      doctorEntryName.setCustomValidity("File name can not be empty.");
      return false;
    }
    if (hasDuplicateDoctorEntryName(nextName, entryIndexValue)) {
      doctorEntryName.setCustomValidity(
        "A file with that name already exists.",
      );
      return false;
    }
    if (
      startTrack > geometry.trackCount ||
      (startTrack > 0 && startSector >= d64.trackSectorCount(startTrack)) ||
      (startTrack === 0 && startSector !== 0)
    ) {
      doctorEntryStartTrack.setCustomValidity(
        "Start track/sector must point to a valid sector or 0/0.",
      );
      doctorEntryStartSector.setCustomValidity(
        "Start track/sector must point to a valid sector or 0/0.",
      );
      return false;
    }
    if (type === "rel") {
      if (
        sideTrack > geometry.trackCount ||
        (sideTrack > 0 && sideSector >= d64.trackSectorCount(sideTrack)) ||
        (sideTrack === 0 && sideSector !== 0)
      ) {
        doctorEntrySideTrack.setCustomValidity(
          "REL side track/sector must point to a valid sector or 0/0.",
        );
        doctorEntrySideSector.setCustomValidity(
          "REL side track/sector must point to a valid sector or 0/0.",
        );
        return false;
      }
      if (recordLength < 1 || recordLength > 254) {
        doctorEntryRecordLength.setCustomValidity(
          "REL record length must be between 1 and 254.",
        );
        return false;
      }
    }
    return true;
  };

  const syncDoctorEntryDialog = function () {
    const isRel = String(doctorEntryType.value || "").toLowerCase() === "rel";
    doctorEntryRelGroup.hidden = !isRel;
  };

  const syncDoctorEntryRecordCapacity = function () {
    if (!doctorEntryRecordCapacity) return;
    const type = String(doctorEntryType.value || "").toLowerCase();
    if (type !== "rel") {
      doctorEntryRecordCapacity.textContent = "Max records: not applicable";
      return;
    }
    const blockCount = Math.max(
      0,
      Math.floor(Number(doctorEntryBlockCount.value) || 0),
    );
    const recordLength = Math.max(
      1,
      Math.min(254, Math.floor(Number(doctorEntryRecordLength.value) || 32)),
    );
    if (blockCount < 2) {
      doctorEntryRecordCapacity.textContent =
        "Max records: 0 (" + formatNumber(blockCount) + " blocks)";
      return;
    }
    const relDataSectorsPerSideSector = 120;
    let dataSectors = 0;
    let sideSectors = 0;
    for (let candidate = blockCount - 1; candidate >= 1; candidate -= 1) {
      const candidateSideSectors = Math.max(
        1,
        Math.ceil(candidate / relDataSectorsPerSideSector),
      );
      if (candidate + candidateSideSectors <= blockCount) {
        dataSectors = candidate;
        sideSectors = candidateSideSectors;
        break;
      }
    }
    const payloadBytes = dataSectors * 254;
    const maxRecords = Math.floor(payloadBytes / recordLength);
    doctorEntryRecordCapacity.textContent =
      "Max records: " +
      formatNumber(maxRecords) +
      " (" +
      formatNumber(dataSectors) +
      " data, " +
      formatNumber(sideSectors) +
      " side, " +
      formatByteSize(payloadBytes) +
      ")";
  };

  const getDoctorEntrySourceEntry = function () {
    if (!state.image) return null;
    const entryIndexValue = Math.max(
      0,
      Math.floor(Number(doctorEntryIndex.value) || 0),
    );
    const context = state.doctorEntryContext || { mode: "edit-entry" };
    return context.mode === "restore-deleted"
      ? d64.readDeletedEntries(state.image).find(function (candidate) {
          return String(candidate.index) === String(entryIndexValue);
        }) || null
      : d64.readDirectoryEntry(state.image, entryIndexValue);
  };

  const buildDoctorEntryPreviewBytes = function (entry) {
    if (!entry) return null;
    const nextName = d64.normalizeFileName(doctorEntryName.value, 16);
    const nextType = String(doctorEntryType.value || "prg").toLowerCase();
    const nextStartTrack = Math.max(
      0,
      Math.floor(Number(doctorEntryStartTrack.value) || 0),
    );
    const nextStartSector = Math.max(
      0,
      Math.floor(Number(doctorEntryStartSector.value) || 0),
    );
    const nextBlockCount = Math.max(
      0,
      Math.min(65535, Math.floor(Number(doctorEntryBlockCount.value) || 0)),
    );
    const nextSideTrack =
      nextType === "rel"
        ? Math.max(0, Math.floor(Number(doctorEntrySideTrack.value) || 0))
        : 0;
    const nextSideSector =
      nextType === "rel"
        ? Math.max(0, Math.floor(Number(doctorEntrySideSector.value) || 0))
        : 0;
    const nextRecordLength =
      nextType === "rel"
        ? Math.max(
            1,
            Math.min(
              254,
              Math.floor(Number(doctorEntryRecordLength.value) || 32),
            ),
          )
        : 0;
    const context = state.doctorEntryContext || { mode: "edit-entry" };
    const nextEntryBytes = entry.raw.slice();
    nextEntryBytes[2] =
      context.mode === "restore-deleted"
        ? d64.encodeDirectoryEntryType(nextType, {
            closed: doctorEntryClosed.checked,
            locked: doctorEntryLocked.checked,
          })
        : d64.encodeDirectoryEntryType(nextType, {
            closed: doctorEntryClosed.checked,
            locked: doctorEntryLocked.checked,
          });
    nextEntryBytes[3] = nextStartTrack & 0xff;
    nextEntryBytes[4] = nextStartSector & 0xff;
    nextEntryBytes.set(d64.encodeFileName(nextName, 16), 5);
    nextEntryBytes[21] = nextSideTrack & 0xff;
    nextEntryBytes[22] = nextSideSector & 0xff;
    nextEntryBytes[23] = nextRecordLength & 0xff;
    nextEntryBytes[28] = nextBlockCount & 0xff;
    nextEntryBytes[29] = (nextBlockCount >> 8) & 0xff;
    return nextEntryBytes;
  };

  const getDoctorEntryByteRole = function (byteIndex) {
    if (byteIndex === 2) return "type-status";
    if (byteIndex === 3 || byteIndex === 4) return "start";
    if (byteIndex >= 5 && byteIndex <= 20) return "name";
    if (byteIndex === 21 || byteIndex === 22) return "side";
    if (byteIndex === 23) return "record";
    if (byteIndex === 28 || byteIndex === 29) return "blocks";
    return "unused";
  };

  const getDoctorEntryBitRole = function (byteIndex, bitIndex) {
    if (byteIndex === 2) {
      if (bitIndex === 7) return "closed";
      if (bitIndex === 6) return "locked";
      if (bitIndex >= 3 && bitIndex <= 5) return "unused";
      return "type-status";
    }
    return getDoctorEntryByteRole(byteIndex);
  };

  const doctorEntryByteUsesBitLabels = function (byteIndex) {
    return byteIndex === 2;
  };

  const renderDoctorEntryBitmask = function () {
    if (!doctorEntryBitmask) return;
    const entry = getDoctorEntrySourceEntry();
    const bytes = buildDoctorEntryPreviewBytes(entry);
    if (!entry || !bytes) {
      doctorEntryBitmask.innerHTML = "";
      doctorEntryBitmaskButton.disabled = true;
      return;
    }
    doctorEntryBitmaskButton.disabled = false;
    const zones = [];
    const zeroColumns = [];
    const pixels = [];
    const digits = [];
    for (let byteIndex = 0; byteIndex < 32; byteIndex += 1) {
      const role = getDoctorEntryByteRole(byteIndex);
      const value = bytes[byteIndex];
      zones.push(
        '<rect class="doctor-entry-bitmask-zone is-' +
          role +
          '" x="' +
          String(byteIndex) +
          '" y="0" width="1" height="8"></rect>',
      );
      if ((Number(value) || 0) === 0) {
        zeroColumns.push(
          '<rect class="doctor-entry-bitmask-zero-column" x="' +
            String(byteIndex) +
            '" y="0" width="1" height="8"></rect>',
        );
      }
      for (let bit = 0; bit < 8; bit += 1) {
        const actualBit = bit;
        const bitRole = getDoctorEntryBitRole(byteIndex, actualBit);
        if (bitRole === "unused") {
          pixels.push(
            '<rect class="doctor-entry-bitmask-pixel is-unused" x="' +
              String(byteIndex) +
              '" y="' +
              String(bit) +
              '" width="1" height="1"></rect>',
          );
          continue;
        }
        if (((value >> actualBit) & 1) === 0) continue;
        pixels.push(
          '<rect class="doctor-entry-bitmask-pixel is-' +
            bitRole +
            '" x="' +
            String(byteIndex) +
            '" y="' +
            String(bit) +
            '" width="1" height="1"></rect>',
        );
        if (doctorEntryByteUsesBitLabels(byteIndex)) {
          digits.push(
            '<text class="doctor-entry-bitmask-digit is-' +
              bitRole +
              '" x="' +
              (byteIndex + 0.5).toFixed(3) +
              '" y="' +
              (bit + 0.56).toFixed(3) +
              '">' +
              String(actualBit) +
              "</text>",
          );
        }
      }
    }
    doctorEntryBitmask.innerHTML =
      zones.join("") + zeroColumns.join("") + pixels.join("") + digits.join("");
  };

  const openDoctorEntryHexDialog = function () {
    if (!state.image) return;
    const entry = getDoctorEntrySourceEntry();
    if (!entry) return;
    const entryOffset =
      d64.trackOffset(entry.track, entry.sector) + entry.slot * 32;
    const byteRoleMap = {};
    const maskedByteIndexes = [];
    for (let byteIndex = 0; byteIndex < 32; byteIndex += 1) {
      byteRoleMap[byteIndex] = getDoctorEntryByteRole(byteIndex);
      if (byteRoleMap[byteIndex] === "unused") {
        maskedByteIndexes.push(byteIndex);
      }
    }
    openImageRangeDialog({
      title:
        "Directory Entry T" +
        String(entry.track) +
        " S" +
        String(entry.sector) +
        " Slot " +
        String(entry.slot),
      dialogTitle: "Directory Entry Bytes",
      note: "This is the 32-byte directory entry record.",
      absoluteOffsets: Array.from({ length: 32 }, function (_, index) {
        return entryOffset + index;
      }),
      highlightLinkBytes: false,
      byteRoleMap: byteRoleMap,
      maskedByteIndexes: maskedByteIndexes,
    });
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
    doctorButton.disabled = !state.image;
    validateButton.disabled = !state.image;
    fragmentButton.disabled = !state.image;
    defragmentButton.disabled = !state.image;
    corruptButton.disabled = !state.image;
    heatmapButton.disabled = !state.image;
    doctorButton.textContent =
      "Doctor" +
      (state.doctorRunCount ? " (" + String(state.doctorRunCount) + ")" : "");
  };

  const resetDeletedTypeHints = function () {
    state.deletedTypeHints = {};
  };

  const updateDoctorRunIndicators = function () {
    doctorButton.textContent =
      "Doctor" +
      (state.doctorRunCount ? " (" + String(state.doctorRunCount) + ")" : "");
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
      '" data-entry-index="' +
      escapeHtml(String(labels.entryIndex || "")) +
      '" aria-label="' +
      escapeHtml(labels.ariaLabel) +
      '">' +
      text +
      "</button>"
    );
  };

  const actionIconMarkup = function (options) {
    const config = options || {};
    return (
      '<button type="button" class="file-type-button file-action-button' +
      (config.danger ? " is-danger" : "") +
      '" data-action="' +
      escapeHtml(String(config.action || "")) +
      '" data-entry-index="' +
      escapeHtml(String(config.entryIndex || "")) +
      '" aria-label="' +
      escapeHtml(String(config.ariaLabel || config.title || "")) +
      '" title="' +
      escapeHtml(String(config.title || "")) +
      '">' +
      '<span class="file-action-icon file-action-icon-default" aria-hidden="true">' +
      escapeHtml(String(config.defaultIcon || "")) +
      "</span>" +
      '<span class="file-action-icon file-action-icon-hover" aria-hidden="true">' +
      escapeHtml(String(config.hoverIcon || config.defaultIcon || "")) +
      "</span>" +
      "</button>"
    );
  };

  const formatDirectoryTypeLabel = function (file) {
    const base = String((file && file.type) || "").toUpperCase();
    if (!base) return "";
    return (
      (file && file.closed === false ? "*" : "") +
      base +
      (file && file.locked ? "<" : "")
    );
  };

  const formatDoctorEntryLocationLabel = function (item) {
    const name = String((item && item.name) || "").trim() || "Unnamed";
    const track = Math.max(0, Math.floor(Number(item && item.track) || 0));
    const sector = Math.max(0, Math.floor(Number(item && item.sector) || 0));
    const slot = Math.max(0, Math.floor(Number(item && item.slot) || 0));
    return (
      name +
      " [T" +
      String(track) +
      " S" +
      String(sector) +
      "] [Slot " +
      String(slot) +
      "]"
    );
  };

  const readDirectoryRows = function (image) {
    if (!image) return [];
    return d64.readDirectoryEntries(image).map(function (entry) {
      let file = null;
      let readError = "";
      try {
        file = d64.readFile(image, entry);
      } catch (error) {
        readError = String(error && error.message ? error.message : error);
      }
      return {
        name: entry.name,
        type: entry.fileType || "unknown",
        closed: entry.closed,
        locked: entry.locked,
        recordLength: entry.recordLength || undefined,
        data: file ? file.payload.slice() : new Uint8Array(0),
        unusedTailData: file ? file.unusedTailData.slice() : new Uint8Array(0),
        readError: readError,
        entry: entry,
      };
    });
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
    heatmapButton.disabled = !hasImage;
    heatmapButton.classList.toggle("is-on", hasImage && state.heatMapVisible);
    heatmapButton.classList.toggle(
      "is-off",
      !hasImage || !state.heatMapVisible,
    );
    heatmapButton.setAttribute(
      "aria-label",
      state.heatMapVisible ? "Turn speed map off" : "Turn speed map on",
    );
    heatmapButton.setAttribute(
      "data-tooltip-text",
      state.heatMapVisible
        ? "Speed map is on. Toggle to hide the overlay that colors sectors by estimated read efficiency."
        : "Speed map is off. Toggle to color sectors by estimated read efficiency.",
    );
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
    if (byte === 0x20 || byte === 0xa0) return " ";
    if (byte >= 32 && byte <= 126) return String.fromCharCode(byte);
    return ".";
  };

  const normalizeDiskNameText = function (value) {
    return String(value || "")
      .toUpperCase()
      .replace(/[^A-Z0-9 !"#$%&'()*+\-./:;<=>?@]+/g, "");
  };

  const encodeDiskNamePetsciiText = function (value) {
    return Uint8Array.from(
      Array.from(normalizeDiskNameText(value)).map(function (char) {
        return char === " " ? 0xa0 : char.charCodeAt(0);
      }),
    );
  };

  const renderSectorHexDump = function (bytes) {
    return renderSectorHexDumpWithOptions(bytes, {});
  };

  const renderSectorHexDumpWithOptions = function (bytes, options) {
    const config = options || {};
    const dimStart = Number.isFinite(config.dimStart)
      ? Math.max(0, Math.floor(config.dimStart))
      : null;
    const showOffsets = config.showOffsets !== false;
    const highlightLinkBytes = config.highlightLinkBytes !== false;
    const invalidByteIndexes = Array.isArray(config.invalidByteIndexes)
      ? config.invalidByteIndexes.reduce(function (result, value) {
          result[Math.max(0, Math.floor(Number(value) || 0))] = true;
          return result;
        }, {})
      : {};
    const significantByteIndexes = Array.isArray(config.highlightByteIndexes)
      ? config.highlightByteIndexes.reduce(function (result, value) {
          result[Math.max(0, Math.floor(Number(value) || 0))] = true;
          return result;
        }, {})
      : {};
    const byteRoleMap = config.byteRoleMap || {};
    const maskedByteIndexes = Array.isArray(config.maskedByteIndexes)
      ? config.maskedByteIndexes.reduce(function (result, value) {
          result[Math.max(0, Math.floor(Number(value) || 0))] = true;
          return result;
        }, {})
      : {};
    const selectionStart = Number.isFinite(config.selectionStart)
      ? Math.max(0, Math.floor(config.selectionStart))
      : null;
    const selectionEnd = Number.isFinite(config.selectionEnd)
      ? Math.max(0, Math.floor(config.selectionEnd))
      : null;
    const selectedMin =
      selectionStart == null || selectionEnd == null
        ? null
        : Math.min(selectionStart, selectionEnd);
    const selectedMax =
      selectionStart == null || selectionEnd == null
        ? null
        : Math.max(selectionStart, selectionEnd);
    const rows = [
      '<div class="sector-hex-row sector-hex-header' +
        (showOffsets ? "" : " sector-hex-row-no-offset") +
        '">' +
        '<span class="sector-hex-offset">' +
        (showOffsets ? "" : "") +
        "</span>" +
        '<span class="sector-hex-bytes">' +
        Array.from({ length: 16 }, function (_, index) {
          return (
            (index === 0 ? "&nbsp;" : "") +
            '<span class="sector-hex-byte">' +
            index.toString(16).toUpperCase() +
            "</span>" +
            (index < 15 ? "&nbsp;&nbsp;" : "")
          );
        }).join("") +
        "</span>" +
        '<span class="sector-hex-ascii">ASCII</span>' +
        "</div>",
    ];
    for (let offset = 0; offset < bytes.length; offset += 16) {
      const chunk = bytes.subarray(offset, offset + 16);
      const hexMarkup = Array.from({ length: 16 }, function (_, index) {
        if (index >= chunk.length) {
          return '<span class="sector-hex-byte is-masked">&nbsp;&nbsp;</span>';
        }
        const value = chunk[index];
        const absoluteIndex = offset + index;
        const classes = ["sector-hex-byte"];
        const isMasked = Boolean(maskedByteIndexes[absoluteIndex]);
        if ((Number(value) || 0) === 0) {
          classes.push("is-zero");
        }
        if (
          highlightLinkBytes &&
          (absoluteIndex === 0 || absoluteIndex === 1)
        ) {
          classes.push("is-link");
        }
        if (dimStart != null && absoluteIndex >= dimStart) {
          classes.push("is-dim");
        }
        if (invalidByteIndexes[absoluteIndex]) {
          classes.push("is-invalid");
        }
        if (significantByteIndexes[absoluteIndex]) {
          classes.push("is-significant");
        }
        if (byteRoleMap[absoluteIndex]) {
          classes.push("is-role-" + String(byteRoleMap[absoluteIndex]));
        }
        if (isMasked) {
          classes.push("is-masked");
        }
        if (
          selectedMin != null &&
          absoluteIndex >= selectedMin &&
          absoluteIndex <= selectedMax
        ) {
          classes.push("is-selected");
        }
        return (
          '<span class="' +
          classes.join(" ") +
          '"' +
          (isMasked ? "" : ' data-byte-index="' + String(absoluteIndex) + '"') +
          ">" +
          (isMasked ? "&nbsp;&nbsp;" : toHexByte(value)) +
          "</span>"
        );
      }).join("&nbsp;");
      const asciiMarkup = Array.from(chunk)
        .map(function (value, index) {
          const absoluteIndex = offset + index;
          const classes = ["sector-ascii-char"];
          const isMasked = Boolean(maskedByteIndexes[absoluteIndex]);
          if (
            highlightLinkBytes &&
            (absoluteIndex === 0 || absoluteIndex === 1)
          ) {
            classes.push("is-link");
          }
          if (dimStart != null && absoluteIndex >= dimStart) {
            classes.push("is-dim");
          }
          if (invalidByteIndexes[absoluteIndex]) {
            classes.push("is-invalid");
          }
          if (significantByteIndexes[absoluteIndex]) {
            classes.push("is-significant");
          }
          if (byteRoleMap[absoluteIndex]) {
            classes.push("is-role-" + String(byteRoleMap[absoluteIndex]));
          }
          if (isMasked) {
            classes.push("is-masked");
          }
          if (
            selectedMin != null &&
            absoluteIndex >= selectedMin &&
            absoluteIndex <= selectedMax
          ) {
            classes.push("is-selected");
          }
          return (
            '<span class="' +
            classes.join(" ") +
            '"' +
            (isMasked
              ? ""
              : ' data-byte-index="' + String(absoluteIndex) + '"') +
            ">" +
            (isMasked ? "&nbsp;" : escapeHtml(toPrintableSectorChar(value))) +
            "</span>"
          );
        })
        .join("");
      rows.push(
        '<div class="sector-hex-row' +
          (showOffsets ? "" : " sector-hex-row-no-offset") +
          '">' +
          '<span class="sector-hex-offset">' +
          (showOffsets ? toHexWord(offset) : "") +
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

  const estimateSectorLinkMetrics = function (
    track,
    sector,
    nextTrack,
    nextSector,
  ) {
    if (!isValidSectorAddress(nextTrack, nextSector, state.image)) {
      return null;
    }
    const previousBlock = {
      track: Math.max(1, Math.floor(Number(track) || 0)),
      sector: Math.max(0, Math.floor(Number(sector) || 0)),
    };
    const targetTrack = Math.max(1, Math.floor(Number(nextTrack) || 0));
    const targetSector = Math.max(0, Math.floor(Number(nextSector) || 0));
    const rotationMsPerRevolution = 200;
    const headStepMsPerTrack = 3;
    const targetSectorCount = d64.trackSectorCount(targetTrack);
    const predictedSector = d64.estimateNextSectorWindow(
      previousBlock,
      targetTrack,
    );
    const seekDistance = Math.abs(targetTrack - previousBlock.track);
    const rotationalDistance =
      (targetSector - predictedSector + targetSectorCount) % targetSectorCount;
    const seekMs = seekDistance * headStepMsPerTrack;
    const rotationMs =
      (rotationalDistance / targetSectorCount) * rotationMsPerRevolution;
    const totalMs = seekMs + rotationMs;
    const worstRotationMs =
      targetSectorCount > 1
        ? ((targetSectorCount - 1) / targetSectorCount) *
          rotationMsPerRevolution
        : rotationMsPerRevolution;
    const bestMs = seekMs;
    const worstMs = seekMs + worstRotationMs;
    const score =
      worstMs <= bestMs
        ? 100
        : Math.max(
            0,
            Math.min(100, ((worstMs - totalMs) / (worstMs - bestMs)) * 100),
          );
    return {
      predictedSector: predictedSector,
      seekDistance: seekDistance,
      rotationalDistance: rotationalDistance,
      seekMs: seekMs,
      rotationMs: rotationMs,
      totalMs: totalMs,
      bestMs: bestMs,
      worstMs: worstMs,
      score: score,
    };
  };

  const estimateDirectoryLinkMetrics = function (
    currentSector,
    nextTrack,
    nextSector,
    usedSectors,
  ) {
    if (Math.floor(Number(nextTrack) || 0) !== 18) {
      return null;
    }
    if (!isValidSectorAddress(nextTrack, nextSector, state.image)) {
      return null;
    }
    const normalizedCurrentSector = Math.max(
      1,
      Math.floor(Number(currentSector) || 0),
    );
    const idealNextSector = d64.findNextDirectoryInterleaveSector(
      normalizedCurrentSector,
      usedSectors,
    );
    if (!Number.isFinite(Number(idealNextSector))) {
      return null;
    }
    const trackSectorCount = d64.trackSectorCount(18);
    const idealDistance =
      (idealNextSector - normalizedCurrentSector + trackSectorCount) %
      trackSectorCount;
    const actualDistance =
      (Math.floor(Number(nextSector) || 0) -
        normalizedCurrentSector +
        trackSectorCount) %
      trackSectorCount;
    const extraDistance =
      (actualDistance - idealDistance + trackSectorCount) % trackSectorCount;
    const rotationMsPerRevolution = 200;
    const totalMs =
      (actualDistance / trackSectorCount) * rotationMsPerRevolution;
    const bestMs = (idealDistance / trackSectorCount) * rotationMsPerRevolution;
    const worstMs =
      bestMs +
      ((trackSectorCount - 1) / trackSectorCount) * rotationMsPerRevolution;
    const score = Math.max(
      0,
      Math.min(
        100,
        ((trackSectorCount - 1 - extraDistance) / (trackSectorCount - 1)) * 100,
      ),
    );
    return {
      predictedSector: idealNextSector,
      rotationalDistance: actualDistance,
      totalMs: totalMs,
      bestMs: bestMs,
      worstMs: worstMs,
      score: score,
      extraDistance: extraDistance,
      model: "directory",
    };
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
    const preamble = shorthand.slice(0, 8);
    const linkPart = shorthand[8];
    const payloadPart = shorthand[9];
    const tailPart = shorthand[10] || null;
    const usedBytes =
      usedPayloadBytes == null
        ? 254
        : Math.max(0, Math.min(254, usedPayloadBytes));
    const nextTrack = sectorBytes[0];
    const nextSector = sectorBytes[1];
    const hasNextSectorLink = isValidSectorAddress(nextTrack, nextSector);
    const linkMetrics =
      info && info.linkMetrics
        ? info.linkMetrics
        : hasNextSectorLink
          ? estimateSectorLinkMetrics(track, sector, nextTrack, nextSector)
          : null;

    const renderMiniSegment = function (part) {
      return (
        '<span class="sector-physical-mini is-' +
        part.source +
        '" title="' +
        escapeHtml(
          part.title ? part.note + " (" + part.title + ")" : part.note,
        ) +
        '">' +
        "<strong>" +
        escapeHtml(part.label) +
        "</strong>" +
        "<span>" +
        escapeHtml(part.value) +
        "</span></span>"
      );
    };

    const renderBitplane = function () {
      const zeroColumns = [];
      const pixels = [];
      for (let byteIndex = 0; byteIndex < sectorBytes.length; byteIndex += 1) {
        const value = sectorBytes[byteIndex];
        const fillClass =
          byteIndex < 2
            ? "is-link"
            : byteIndex < usedBytes + 2
              ? "is-payload"
              : "is-tail";
        if ((Number(value) || 0) === 0) {
          zeroColumns.push(
            '<rect class="sector-bitplane-zero-column" x="' +
              String(byteIndex) +
              '" y="0" width="1" height="8"></rect>',
          );
        }
        for (let bit = 0; bit < 8; bit += 1) {
          if (((value >> (7 - bit)) & 1) === 0) continue;
          pixels.push(
            '<rect class="sector-bitplane-pixel ' +
              fillClass +
              '" x="' +
              String(byteIndex) +
              '" y="' +
              String(bit) +
              '" width="1" height="1"></rect>',
          );
        }
      }
      return (
        '<button type="button" class="sector-bitplane-button" data-action="open-sector-data" data-track="' +
        String(track) +
        '" data-sector="' +
        String(sector) +
        '" title="Open sector data">' +
        '<svg class="sector-bitplane" viewBox="0 0 256 8" preserveAspectRatio="none" aria-hidden="true">' +
        '<rect class="sector-bitplane-zone is-link" x="0" y="0" width="2" height="8"></rect>' +
        '<rect class="sector-bitplane-zone is-payload" x="2" y="0" width="' +
        String(Math.max(0, usedBytes)) +
        '" height="8"></rect>' +
        (tailPart
          ? '<rect class="sector-bitplane-zone is-tail" x="' +
            String(usedBytes + 2) +
            '" y="0" width="' +
            String(Math.max(0, 254 - usedBytes)) +
            '" height="8"></rect>'
          : "") +
        zeroColumns.join("") +
        pixels.join("") +
        "</svg>" +
        "</button>"
      );
    };

    const renderTimingSummary = function () {
      if (!linkMetrics) return "";
      return (
        '<div class="sector-physical-timing">' +
        '<span class="sector-physical-chip is-inferred" title="' +
        escapeHtml(
          linkMetrics.model === "directory"
            ? "Estimated directory follow-up delay on track 18. Directory sectors treat interleave 3 as the ideal next placement."
            : "Estimated delay before the drive can start reading the linked sector. Based on ~300 RPM rotation and ~3 ms per track head step.",
        ) +
        '">' +
        "<strong>Next Read</strong><span>" +
        linkMetrics.totalMs.toFixed(1) +
        " ms</span></span>" +
        '<span class="sector-physical-chip is-expected" title="' +
        escapeHtml(
          linkMetrics.model === "directory"
            ? "Ideal directory interleave target is sector " +
                String(linkMetrics.predictedSector) +
                ". Actual follow-up waits " +
                linkMetrics.rotationalDistance +
                " physical sector" +
                (linkMetrics.rotationalDistance === 1 ? "" : "s") +
                "."
            : "Predicted arrival window lands near sector " +
                String(linkMetrics.predictedSector) +
                ". Rotational wait is " +
                linkMetrics.rotationalDistance +
                " sector" +
                (linkMetrics.rotationalDistance === 1 ? "" : "s") +
                ".",
        ) +
        '">' +
        "<strong>Window</strong><span>S" +
        String(linkMetrics.predictedSector).padStart(2, "0") +
        " +" +
        String(linkMetrics.rotationalDistance) +
        "</span></span>" +
        '<span class="sector-physical-chip is-stored" title="' +
        escapeHtml(
          linkMetrics.model === "directory"
            ? "Read optimization score for this directory link. 100% matches the preferred interleave-3 follow-up placement on track 18."
            : "Optimization score for this link. 100% is the best reachable next sector without overshooting the estimated arrival window; 0% is nearly a full extra rotation.",
        ) +
        '">' +
        "<strong>Score</strong><span>" +
        linkMetrics.score.toFixed(0) +
        "%</span></span>" +
        "</div>"
      );
    };

    return (
      '<section class="sector-physical">' +
      '<div class="sector-physical-head"><strong>Physical Sector Model</strong><span>Approximate 1541 on-disk layout inferred from this logical sector.</span></div>' +
      '<div class="sector-physical-preamble">' +
      preamble.map(renderMiniSegment).join("") +
      "</div>" +
      '<div class="sector-physical-bar-wrap">' +
      '<div class="sector-bitplane-wrap">' +
      renderBitplane() +
      "</div>" +
      renderTimingSummary() +
      '<div class="sector-physical-bar-labels">' +
      (hasNextSectorLink
        ? renderSectorJumpButton(
            nextTrack,
            nextSector,
            "LINK " + toHexByte(nextTrack) + " " + toHexByte(nextSector),
          )
        : '<span title="' +
          escapeHtml(linkPart.note) +
          '">LINK ' +
          escapeHtml(linkPart.value) +
          "</span>") +
      '<button type="button" class="sector-physical-bar-label" data-action="open-sector-data" data-track="' +
      String(track) +
      '" data-sector="' +
      String(sector) +
      '" title="' +
      escapeHtml(
        payloadPart.note +
          " (" +
          (payloadPart.title || formatExactBytes(254)) +
          ")",
      ) +
      '">SECTOR DATA ' +
      escapeHtml(payloadPart.value) +
      "</button>" +
      (tailPart
        ? '<span title="' +
          escapeHtml(tailPart.note + " (" + (tailPart.title || "") + ")") +
          '">TAIL ' +
          escapeHtml(tailPart.value) +
          "</span>"
        : "") +
      "</div>" +
      "</div>" +
      '<div class="sector-physical-legend">' +
      '<span><i class="sector-physical-dot is-stored"></i>Stored</span>' +
      '<span><i class="sector-physical-dot is-inferred"></i>Inferred</span>' +
      '<span><i class="sector-physical-dot is-expected"></i>Expected only</span>' +
      "</div>" +
      "</section>"
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
        directoryIndex: index,
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
            fileName: entry.name,
            fileType: type.toUpperCase(),
            blockLabel: String(blockIndex + 1),
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
                fileName: entry.name,
                fileType: "REL",
                blockLabel: "Side " + String(sideIndex + 1),
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
            fileName: entry.name,
            fileType: "DEL " + deletedType.toUpperCase(),
            blockLabel: String(blockIndex + 1),
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
                fileName: entry.name,
                fileType: "DEL REL",
                blockLabel: "Side " + String(sideIndex + 1),
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

    Object.keys(sectorMap).forEach(function (key) {
      const sectorInfo = sectorMap[key];
      if (!sectorInfo) return;
      if (
        sectorInfo.category !== "free" &&
        sectorInfo.category !== "reservedFree"
      ) {
        return;
      }
      const sectorBytes = d64.readSector(
        image,
        sectorInfo.track,
        sectorInfo.sector,
      );
      let hasNonZeroData = false;
      for (let index = 0; index < sectorBytes.length; index += 1) {
        if ((Number(sectorBytes[index]) || 0) !== 0) {
          hasNonZeroData = true;
          break;
        }
      }
      if (!hasNonZeroData) return;
      sectorInfo.category = "suspiciousFree";
      sectorInfo.color = DISK_MAP_COLORS.suspiciousFree;
      sectorInfo.stroke = DISK_MAP_COLORS.trackStroke;
      sectorInfo.label =
        sectorInfo.track === 18
          ? "Reserved free sector with unexpected nonzero data"
          : "Free sector with unexpected nonzero data";
      sectorInfo.usedFraction = 1;
      sectorInfo.unusedFraction = 0;
    });

    Object.keys(sectorMap).forEach(function (key) {
      const sectorInfo = sectorMap[key];
      if (
        /^(free|reservedFree|suspiciousFree|header|directory)$/.test(
          String(sectorInfo.category || ""),
        )
      ) {
        return;
      }
      const sectorBytes = d64.readSector(
        image,
        sectorInfo.track,
        sectorInfo.sector,
      );
      const nextTrack = sectorBytes[0];
      const nextSector = sectorBytes[1];
      const metrics = estimateSectorLinkMetrics(
        sectorInfo.track,
        sectorInfo.sector,
        nextTrack,
        nextSector,
      );
      if (!metrics) return;
      sectorInfo.linkMetrics = metrics;
      sectorInfo.heatColor = scoreToHeatColor(metrics.score);
    });

    const visitedDirectorySectors = [];
    directory.sectors.forEach(function (sectorInfo) {
      if (sectorInfo.track !== 18 || sectorInfo.sector === 0) {
        return;
      }
      const key = String(sectorInfo.track) + ":" + String(sectorInfo.sector);
      const currentSectorInfo = sectorMap[key];
      if (!currentSectorInfo || sectorInfo.nextTrack === 0) {
        visitedDirectorySectors.push(sectorInfo.sector);
        return;
      }
      const metrics = estimateDirectoryLinkMetrics(
        sectorInfo.sector,
        sectorInfo.nextTrack,
        sectorInfo.nextSector,
        visitedDirectorySectors.concat([sectorInfo.sector]),
      );
      if (metrics) {
        currentSectorInfo.linkMetrics = metrics;
        currentSectorInfo.heatColor = scoreToHeatColor(metrics.score);
      }
      visitedDirectorySectors.push(sectorInfo.sector);
    });

    const scoredSectors = Object.values(sectorMap).filter(
      function (sectorInfo) {
        return (
          sectorInfo &&
          sectorInfo.linkMetrics &&
          Number.isFinite(Number(sectorInfo.linkMetrics.score))
        );
      },
    );
    const averageLinkScore = scoredSectors.length
      ? scoredSectors.reduce(function (sum, sectorInfo) {
          return sum + (Number(sectorInfo.linkMetrics.score) || 0);
        }, 0) / scoredSectors.length
      : null;

    return {
      geometry: geometry,
      sectorMap: sectorMap,
      directorySectors: directory.sectors.length,
      activeFiles: activeEntries.length,
      averageLinkScore: averageLinkScore,
      scoredSectorCount: scoredSectors.length,
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
            "Suspicious",
            DISK_MAP_COLORS.suspiciousFree,
            null,
            "BAM-free sectors that still contain nonzero bytes",
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
      diskMapInspector.hidden = true;
      diskMapInspector.innerHTML = "";
      diskMapPhysical.hidden = true;
      diskMapPhysical.innerHTML = "";
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
    const rows = [
      {
        label: "Offset",
        value: "0x" + toHexWord(offset),
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
    ];

    if (info && info.fileName) {
      rows.unshift(
        {
          label: "Block",
          value: info.blockLabel || "-",
        },
        {
          label: "Type",
          value: info.fileType || "-",
        },
        {
          label: "File",
          value: info.fileName || "-",
        },
      );
    } else {
      rows.unshift({
        label: "Purpose",
        value: info ? info.label : "Sector data",
      });
    }

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
        value:
          typeof info.usedFraction === "number"
            ? (info.usedFraction * 100).toFixed(1).replace(/\.0$/, "") + "%"
            : "Sector payload",
      });
    }
    diskMapPhysical.hidden = false;
    diskMapPhysical.innerHTML = renderPhysicalSectorLegend(
      track,
      sector,
      sectorBytes,
      info,
      logicalDiskIdBytes,
    );

    diskMapInspector.hidden = false;
    diskMapInspector.innerHTML =
      '<section class="sector-inspector">' +
      '<div class="sector-inspector-head">' +
      "<div>" +
      "<h4>Track " +
      String(track) +
      " Sector " +
      String(sector) +
      "</h4>" +
      "</div>" +
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
      "</section>";
  };

  const closeSectorDataDialog = function () {
    state.hexViewContext = null;
    if (typeof sectorDataDialog.close === "function") {
      sectorDataDialog.close();
    } else {
      sectorDataDialog.removeAttribute("open");
    }
    if (state.returnToBamDialog && state.image) {
      const bamReturn = Object.assign({}, state.returnToBamDialog);
      state.returnToBamDialog = null;
      state.returnToDoctorReport = Boolean(bamReturn.returnToDoctor);
      openBamDialog({
        issueIndex:
          bamReturn.issueIndex != null
            ? Math.max(0, Number(bamReturn.issueIndex) || 0)
            : -1,
        returnToDoctor: Boolean(bamReturn.returnToDoctor),
      });
      return;
    }
    if (state.returnToDoctorReport && state.image) {
      state.returnToDoctorReport = false;
      reopenDoctorReport();
    }
  };

  const setSectorDataHoverIndex = function (byteIndex) {
    const nodes = sectorDataDialogBody.querySelectorAll("[data-byte-index]");
    nodes.forEach(function (node) {
      node.classList.toggle(
        "is-hover",
        byteIndex !== "" && node.dataset.byteIndex === byteIndex,
      );
    });
  };

  const selectionCrossesMaskedBytes = function (startIndex, endIndex) {
    if (
      !state.hexViewContext ||
      !state.hexViewContext.renderConfig ||
      !Array.isArray(state.hexViewContext.renderConfig.maskedByteIndexes)
    ) {
      return false;
    }
    const maskedLookup =
      state.hexViewContext.renderConfig.maskedByteIndexes.reduce(function (
        result,
        value,
      ) {
        result[Math.max(0, Math.floor(Number(value) || 0))] = true;
        return result;
      }, {});
    const min = Math.min(startIndex, endIndex);
    const max = Math.max(startIndex, endIndex);
    for (let index = min; index <= max; index += 1) {
      if (maskedLookup[index]) return true;
    }
    return false;
  };

  const buildFileByteOffsetMap = function (fileRecord) {
    const offsets = [];
    const blocks =
      fileRecord && Array.isArray(fileRecord.blocks) ? fileRecord.blocks : [];
    blocks.forEach(function (block) {
      const usedBytes = Math.max(
        0,
        Math.min(254, Number(block.usedBytes) || 0),
      );
      const sectorOffset = d64.trackOffset(block.track, block.sector) + 2;
      for (let index = 0; index < usedBytes; index += 1) {
        offsets.push(sectorOffset + index);
      }
    });
    return offsets;
  };

  const closeSectorByteDialog = function () {
    if (typeof sectorByteDialog.close === "function") {
      sectorByteDialog.close();
    } else {
      sectorByteDialog.removeAttribute("open");
    }
  };

  const getSelectedHexRange = function () {
    if (!state.hexViewContext) return null;
    const start = Number(state.hexViewContext.selectionStart);
    const end = Number(state.hexViewContext.selectionEnd);
    if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
    return {
      start: Math.min(start, end),
      end: Math.max(start, end),
    };
  };

  const renderActiveHexView = function () {
    if (!state.hexViewContext) return;
    sectorDataDialogTitle.textContent = String(
      state.hexViewContext.dialogTitle || "Sector Data",
    );
    sectorDataDialogName.textContent = String(
      state.hexViewContext.dialogName || "",
    );
    sectorDataDialogBody.dataset.mode = String(state.hexViewContext.mode || "");
    const note = state.hexViewContext.note
      ? '<p class="sector-data-dialog-note">' +
        escapeHtml(String(state.hexViewContext.note)) +
        "</p>"
      : "";
    const warning = state.hexViewContext.warning
      ? '<p class="sector-data-dialog-warning">' +
        escapeHtml(String(state.hexViewContext.warning)) +
        "</p>"
      : "";
    const selectionTip =
      '<p class="sector-data-dialog-tip">Tip: Shift-click to select multiple bytes, then click the selection to edit that range.</p>';
    sectorDataDialogBody.innerHTML =
      note +
      warning +
      selectionTip +
      '<div class="sector-hex-viewer">' +
      renderSectorHexDumpWithOptions(
        state.hexViewContext.bytes || new Uint8Array(0),
        Object.assign({}, state.hexViewContext.renderConfig || {}, {
          selectionStart: state.hexViewContext.selectionStart,
          selectionEnd: state.hexViewContext.selectionEnd,
        }),
      ) +
      "</div>";
  };

  const syncSectorByteTextField = function (options) {
    const config = options || {};
    const visible = Boolean(config.visible);
    sectorByteTextField.hidden = !visible;
    sectorByteTextMeta.hidden = !visible;
    sectorByteModeField.hidden = !visible;
    sectorByteDialog.dataset.textKind = visible
      ? String(config.kind || "")
      : "";
    if (!visible) {
      sectorByteModeHex.checked = true;
      sectorByteModeText.checked = false;
      sectorByteText.value = "";
      sectorByteText.removeAttribute("maxlength");
      sectorByteText.removeAttribute("placeholder");
      sectorByteText.setCustomValidity("");
      return;
    }
    sectorByteModeHex.checked = true;
    sectorByteModeText.checked = false;
    sectorByteText.value = "";
    sectorByteText.maxLength = String(
      Math.max(1, Math.floor(Number(config.maxLength) || 1)),
    );
    sectorByteText.placeholder = String(
      config.placeholder || "Type replacement text",
    );
    sectorByteTextMeta.textContent = String(
      config.meta ||
        "Writes text into the selected byte and the following bytes.",
    );
    sectorByteText.setCustomValidity("");
  };

  const openFileDataDialog = function (entryIndex) {
    if (!state.image) return;
    const fileInfo = findActiveFileByEntryIndex(entryIndex);
    const file =
      fileInfo && fileInfo.entry
        ? d64.readFile(state.image, fileInfo.entry)
        : null;
    if (!file) {
      setStatus("File not found.", true);
      return;
    }
    const displayName =
      file.entry && file.entry.name ? file.entry.name : "File";
    state.hexViewContext = {
      mode: "file",
      fileName: displayName,
      dialogTitle: "File Data",
      dialogName: displayName + " bytes",
      note: "Payload bytes only. Link bytes and REL side sectors are not shown here.",
      bytes: file.payload || new Uint8Array(0),
      byteOffsets: buildFileByteOffsetMap(file),
      renderConfig: {},
      selectionStart: null,
      selectionEnd: null,
      selectionAnchor: null,
    };
    renderActiveHexView();
    if (typeof sectorDataDialog.showModal === "function") {
      sectorDataDialog.showModal();
    } else {
      sectorDataDialog.setAttribute("open", "open");
    }
  };

  const openImageRangeDialog = function (config) {
    const options = config || {};
    const sourceBytes =
      options.sourceBytes instanceof Uint8Array
        ? options.sourceBytes
        : state.image;
    if (!sourceBytes) return;
    const absoluteOffsets = Array.isArray(options.absoluteOffsets)
      ? options.absoluteOffsets
          .map(function (value) {
            return Math.floor(Number(value));
          })
          .filter(function (value) {
            return (
              Number.isFinite(value) && value >= 0 && value < sourceBytes.length
            );
          })
      : [];
    if (!absoluteOffsets.length) return;
    const subset = new Uint8Array(
      absoluteOffsets.map(function (absoluteOffset) {
        return sourceBytes[absoluteOffset];
      }),
    );
    let invalidByteIndexes = Array.isArray(options.invalidByteIndexes)
      ? options.invalidByteIndexes
      : [];
    if (options.rangeKind === "disk-name") {
      invalidByteIndexes = absoluteOffsets.reduce(function (
        result,
        absoluteOffset,
        index,
      ) {
        const value = sourceBytes[absoluteOffset];
        if (value === 0x00 || value === 0xa0 || value === 0x20) {
          return result;
        }
        const char = String.fromCharCode(value & 0xff);
        if (!/^[A-Z0-9 !"#$%&'()*+\-./:;<=>?@]$/.test(char)) {
          result.push(index);
        }
        return result;
      }, []);
    }
    state.hexViewContext = {
      mode: "absolute-range",
      title: String(options.title || "Byte Range"),
      dialogTitle: String(options.dialogTitle || options.title || "Byte Range"),
      dialogName: String(options.title || "Byte Range"),
      note: options.note ? String(options.note) : "",
      bytes: subset,
      absoluteOffsets: absoluteOffsets,
      byteOffsets: absoluteOffsets.slice(),
      rangeConfig: {
        title: String(options.title || "Byte Range"),
        note: options.note ? String(options.note) : "",
        dialogTitle: String(
          options.dialogTitle || options.title || "Byte Range",
        ),
        showOffsets: options.showOffsets !== false,
        highlightLinkBytes: options.highlightLinkBytes !== false,
        rangeKind: String(options.rangeKind || ""),
        textConfig: options.textConfig || null,
      },
      doctorContext: options.doctorContext || null,
      renderConfig: {
        showOffsets: options.showOffsets !== false,
        highlightLinkBytes: options.highlightLinkBytes !== false,
        invalidByteIndexes: invalidByteIndexes,
        byteRoleMap: options.byteRoleMap || {},
        maskedByteIndexes: Array.isArray(options.maskedByteIndexes)
          ? options.maskedByteIndexes.slice()
          : [],
        highlightByteIndexes: Array.isArray(options.highlightByteIndexes)
          ? options.highlightByteIndexes.slice()
          : [],
      },
      selectionStart: null,
      selectionEnd: null,
      selectionAnchor: null,
    };
    renderActiveHexView();
    if (typeof sectorDataDialog.showModal === "function") {
      sectorDataDialog.showModal();
    } else {
      sectorDataDialog.setAttribute("open", "open");
    }
  };

  const openImageByteDialog = function (config) {
    const options = config || {};
    const absoluteOffsets = Array.isArray(options.absoluteOffsets)
      ? options.absoluteOffsets
          .map(function (value) {
            return Math.floor(Number(value));
          })
          .filter(function (value) {
            return (
              Number.isFinite(value) && value >= 0 && value < state.image.length
            );
          })
      : [Math.max(0, Math.floor(Number(options.absoluteOffset) || 0))];
    const absoluteOffset = absoluteOffsets[0];
    if (
      !state.image ||
      !absoluteOffsets.length ||
      absoluteOffset >= state.image.length
    )
      return;
    sectorByteDialog.dataset.absoluteOffset = String(absoluteOffset);
    sectorByteDialog.dataset.absoluteOffsets = absoluteOffsets.join(",");
    sectorByteDialog.dataset.mode = String(options.mode || "");
    sectorByteDialog.dataset.fileName = String(options.fileName || "");
    sectorByteDialog.dataset.track = String(options.track || "");
    sectorByteDialog.dataset.sector = String(options.sector || "");
    sectorByteDialog.dataset.byteIndex = String(options.byteIndex || "0");
    sectorByteTrack.value = String(options.track || "");
    sectorByteSector.value = String(options.sector || "");
    sectorByteIndex.value = String(options.byteIndex || "0");
    sectorByteDialogName.textContent = String(options.title || "Edit Byte");
    sectorByteDialogMeta.textContent = String(
      options.meta ||
        "Absolute offset " +
          toHexWord(absoluteOffset) +
          " (" +
          numberFormatter.format(absoluteOffset) +
          " bytes)",
    );
    sectorByteValue.value = absoluteOffsets
      .map(function (offset) {
        return toHexByte(state.image[offset]);
      })
      .join(" ");
    sectorByteValue.maxLength = String(
      Math.max(2, absoluteOffsets.length * 3 - 1),
    );
    sectorByteText.value = absoluteOffsets
      .map(function (offset) {
        return toPrintableSectorChar(state.image[offset]);
      })
      .join("");
    const rangeTextConfig =
      options.mode === "absolute-range" &&
      state.hexViewContext &&
      state.hexViewContext.mode === "absolute-range" &&
      state.hexViewContext.rangeConfig &&
      state.hexViewContext.rangeConfig.textConfig
        ? state.hexViewContext.rangeConfig.textConfig
        : null;
    if (rangeTextConfig && rangeTextConfig.kind === "disk-name") {
      syncSectorByteTextField({
        visible: true,
        kind: "disk-name",
        maxLength: absoluteOffsets.length,
        placeholder: "Type disk name text",
        meta:
          "Disk name PETSCII text. " +
          String(Math.max(0, absoluteOffsets.length)) +
          " byte" +
          (absoluteOffsets.length === 1 ? "" : "s") +
          " selected.",
      });
    } else {
      syncSectorByteTextField({
        visible: absoluteOffsets.length > 1,
        kind: "text",
        maxLength: absoluteOffsets.length,
        placeholder: "Type replacement text",
        meta:
          "Writes text into the " +
          String(absoluteOffsets.length) +
          " selected byte" +
          (absoluteOffsets.length === 1 ? "" : "s") +
          ".",
      });
    }
    if (typeof sectorByteDialog.showModal === "function") {
      sectorByteDialog.showModal();
    } else {
      sectorByteDialog.setAttribute("open", "open");
    }
    sectorByteValue.focus();
    sectorByteValue.select();
  };

  const openSectorDataDialog = function (track, sector, options) {
    const config = options || {};
    if (!state.image || !isValidSectorAddress(track, sector, state.image))
      return;
    const normalizedTrack = Math.max(1, Math.floor(Number(track) || 0));
    const normalizedSector = Math.max(0, Math.floor(Number(sector) || 0));
    const key = String(normalizedTrack) + ":" + String(normalizedSector);
    const info = state.diskLayout && state.diskLayout.sectorMap[key];
    const sectorBytes = d64.readSector(
      state.image,
      normalizedTrack,
      normalizedSector,
    );
    const tailDimStart = getSectorTailDimStart(sectorBytes, info);
    const notes = [];
    if (tailDimStart != null) {
      notes.push("Dimmed tail bytes are beyond used payload.");
    }
    if (
      Array.isArray(config.highlightByteIndexes) &&
      config.highlightByteIndexes.length
    ) {
      notes.push(
        "Blue highlights mark bytes relevant to the selected Doctor issue.",
      );
    }
    sectorDataDialogName.textContent =
      "Track " +
      String(normalizedTrack) +
      " Sector " +
      String(normalizedSector);
    state.hexViewContext = {
      mode: "sector",
      track: normalizedTrack,
      sector: normalizedSector,
      dialogTitle: "Sector Data",
      dialogName:
        "Track " +
        String(normalizedTrack) +
        " Sector " +
        String(normalizedSector),
      note: notes.join(" "),
      bytes: sectorBytes,
      byteOffsets: Array.from(
        { length: sectorBytes.length },
        function (_, index) {
          return d64.trackOffset(normalizedTrack, normalizedSector) + index;
        },
      ),
      renderConfig: {
        dimStart: tailDimStart,
        highlightByteIndexes: Array.isArray(config.highlightByteIndexes)
          ? config.highlightByteIndexes.slice()
          : [],
      },
      doctorContext: config.doctorContext || null,
      selectionStart: null,
      selectionEnd: null,
      selectionAnchor: null,
    };
    renderActiveHexView();
    if (typeof sectorDataDialog.showModal === "function") {
      sectorDataDialog.showModal();
    } else {
      sectorDataDialog.setAttribute("open", "open");
    }
  };

  const openSectorByteDialog = function (track, sector, byteIndex) {
    if (!state.image || !isValidSectorAddress(track, sector, state.image)) {
      return;
    }
    const normalizedTrack = Math.max(1, Math.floor(Number(track) || 0));
    const normalizedSector = Math.max(0, Math.floor(Number(sector) || 0));
    const normalizedIndex = Math.max(0, Math.min(255, Number(byteIndex) || 0));
    const absoluteOffset =
      d64.trackOffset(normalizedTrack, normalizedSector) + normalizedIndex;
    openImageByteDialog({
      absoluteOffset: absoluteOffset,
      mode: "sector",
      track: normalizedTrack,
      sector: normalizedSector,
      byteIndex: normalizedIndex,
      title:
        "Track " +
        String(normalizedTrack) +
        " Sector " +
        String(normalizedSector) +
        " Byte " +
        toHexByte(normalizedIndex),
      meta:
        "Absolute offset " +
        toHexWord(absoluteOffset) +
        " (" +
        numberFormatter.format(absoluteOffset) +
        " bytes)",
    });
  };

  const saveSectorByteDialog = function (event) {
    event.preventDefault();
    if (!state.image) return;
    const track = Number(
      sectorByteDialog.dataset.track || sectorByteTrack.value,
    );
    const sector = Number(
      sectorByteDialog.dataset.sector || sectorByteSector.value,
    );
    const byteIndex = Number(
      sectorByteDialog.dataset.byteIndex || sectorByteIndex.value,
    );
    const absoluteOffset = Number(
      sectorByteDialog.dataset.absoluteOffset || -1,
    );
    const absoluteOffsets = String(
      sectorByteDialog.dataset.absoluteOffsets || "",
    )
      .split(",")
      .map(function (value) {
        return Math.floor(Number(value));
      })
      .filter(function (value) {
        return Number.isFinite(value) && value >= 0;
      });
    const nextValueText = String(sectorByteValue.value || "")
      .trim()
      .toUpperCase();
    const hexParts = nextValueText
      ? nextValueText.split(/\s+/).filter(Boolean)
      : [];
    if (
      !hexParts.length ||
      hexParts.length !== absoluteOffsets.length ||
      hexParts.some(function (part) {
        return !/^[0-9A-F]{2}$/.test(part);
      })
    ) {
      sectorByteValue.setCustomValidity(
        "Enter exactly " +
          String(Math.max(1, absoluteOffsets.length)) +
          " two-digit hex value" +
          (absoluteOffsets.length === 1 ? "" : "s") +
          ".",
      );
      sectorByteValue.reportValidity();
      return;
    }
    sectorByteValue.setCustomValidity("");
    if (
      !Number.isFinite(absoluteOffset) ||
      absoluteOffset < 0 ||
      !absoluteOffsets.length
    )
      return;
    const nextImage = state.image.slice();
    const overwriteText = String(sectorByteText.value || "");
    if (
      sectorByteModeText.checked &&
      sectorByteDialog.dataset.textKind === "disk-name" &&
      overwriteText.trim() !== ""
    ) {
      const normalizedText = normalizeDiskNameText(overwriteText);
      if (overwriteText !== normalizedText) {
        sectorByteText.value = normalizedText;
      }
      if (!normalizedText) {
        sectorByteText.setCustomValidity(
          "Use A-Z, 0-9, spaces, and the supported punctuation only.",
        );
        sectorByteText.reportValidity();
        return;
      }
      sectorByteText.setCustomValidity("");
      const encodedText = encodeDiskNamePetsciiText(normalizedText);
      encodedText.forEach(function (byteValue, index) {
        if (!Number.isFinite(Number(absoluteOffsets[index]))) return;
        nextImage[absoluteOffsets[index]] = byteValue;
      });
    } else if (sectorByteModeText.checked && overwriteText !== "") {
      const printableText = Array.from(overwriteText);
      printableText
        .slice(0, absoluteOffsets.length)
        .forEach(function (char, index) {
          nextImage[absoluteOffsets[index]] = char.charCodeAt(0) & 0xff;
        });
    } else {
      hexParts.forEach(function (part, index) {
        nextImage[absoluteOffsets[index]] = parseInt(part, 16);
      });
    }
    const rangeOffsets =
      state.hexViewContext &&
      state.hexViewContext.mode === "absolute-range" &&
      Array.isArray(state.hexViewContext.absoluteOffsets)
        ? state.hexViewContext.absoluteOffsets.slice()
        : null;
    const rangeConfig =
      state.hexViewContext && state.hexViewContext.mode === "absolute-range"
        ? state.hexViewContext.rangeConfig || {}
        : {};
    const doctorContext =
      state.hexViewContext && state.hexViewContext.doctorContext
        ? Object.assign({}, state.hexViewContext.doctorContext)
        : null;
    const diagnosisAfterEdit = doctorContext
      ? d64.diagnoseImage(nextImage)
      : null;
    const resolvedIssue = doctorContext
      ? !findMatchingDoctorIssue(diagnosisAfterEdit, doctorContext)
      : null;
    const resolutionSuffix =
      resolvedIssue == null
        ? ""
        : resolvedIssue
          ? " Doctor issue resolved."
          : " Doctor issue still present.";
    loadImageBytes(
      nextImage,
      state.sourceName || "disk.d64",
      sectorByteModeText.checked &&
        sectorByteDialog.dataset.textKind === "disk-name" &&
        overwriteText.trim() !== ""
        ? "Updated disk name text." + resolutionSuffix
        : "Updated T" +
            String(track).padStart(2, "0") +
            "/S" +
            String(sector).padStart(2, "0") +
            " byte range " +
            toHexByte(byteIndex) +
            (absoluteOffsets.length > 1
              ? "-" +
                toHexByte(byteIndex + Math.max(0, absoluteOffsets.length - 1))
              : "") +
            " to " +
            nextValueText +
            "." +
            resolutionSuffix,
      { resetDeletedTypeHints: false },
    );
    if (diagnosisAfterEdit) {
      state.doctorReport = diagnosisAfterEdit;
    }
    if (
      sectorByteDialog.dataset.mode === "file" &&
      sectorByteDialog.dataset.fileName
    ) {
      openFileDataDialog(sectorByteDialog.dataset.fileName);
    } else if (rangeOffsets && rangeOffsets.length) {
      openImageRangeDialog(
        Object.assign({}, rangeConfig, {
          absoluteOffsets: rangeOffsets,
          doctorContext: doctorContext,
        }),
      );
    } else {
      selectDiskMapSector(track, sector);
      openSectorDataDialog(track, sector, {
        highlightByteIndexes:
          state.hexViewContext &&
          state.hexViewContext.renderConfig &&
          Array.isArray(state.hexViewContext.renderConfig.highlightByteIndexes)
            ? state.hexViewContext.renderConfig.highlightByteIndexes.slice()
            : [],
        doctorContext: doctorContext,
      });
    }
    if (diagnosisAfterEdit) {
      refreshDoctorReport(nextImage);
    }
    closeSectorByteDialog();
  };

  const renderDiskMap = function (image) {
    if (!image) {
      state.diskLayout = null;
      diskMapSummary.textContent = "Waiting for an image";
      diskMap.innerHTML =
        "Load or create a disk image to view tracks and sectors.";
      diskMap.className = "disk-map empty-state";
      diskMapHeatmapSummary.hidden = true;
      diskMapHeatmapSummary.textContent = "";
      diskMapHeatmapSummary.removeAttribute("style");
      setHoveredDiskMapSector(null);
      hideDiskMapPointer();
      hideDiskMapTooltip();
      resetDiskMapView();
      syncDiskMapControls();
      renderDiskMapLegend();
      renderDiskMapInspector();
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
        const displayColor =
          state.heatMapVisible && info && info.heatColor
            ? info.heatColor
            : null;
        const displayTailColor =
          state.heatMapVisible && info && info.heatColor
            ? mixColor(info.heatColor, "#f4f8fb", 0.46)
            : null;
        const efficiencySuffix =
          info && info.linkMetrics
            ? " · efficiency " + info.linkMetrics.score.toFixed(0) + "%"
            : "";
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
              (displayColor || info.color) +
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
                  " used bytes" +
                  efficiencySuffix,
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
              (displayTailColor || info.tailColor) +
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
                  " · tail bytes" +
                  efficiencySuffix,
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
              (displayColor ||
                (info ? info.color : DISK_MAP_COLORS.unknownUsed)) +
              '" stroke="' +
              (info ? info.stroke : DISK_MAP_COLORS.trackStroke) +
              '" stroke-width="0.5" data-tooltip="' +
              escapeHtml(
                "T" +
                  String(track) +
                  " S" +
                  String(sector) +
                  " · " +
                  (info ? info.label : "Sector") +
                  efficiencySuffix,
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
    renderDiskMapLegend();
    if (
      state.heatMapVisible &&
      layout &&
      Number(layout.scoredSectorCount || 0) > 0 &&
      layout.averageLinkScore != null &&
      Number.isFinite(Number(layout.averageLinkScore))
    ) {
      const averageScore = Math.max(
        0,
        Math.min(100, Number(layout.averageLinkScore) || 0),
      );
      diskMapHeatmapSummary.hidden = false;
      diskMapHeatmapSummary.textContent =
        "Avg Read Score " + averageScore.toFixed(0) + "%";
      diskMapHeatmapSummary.title =
        "Average read optimization score across " +
        formatNumber(layout.scoredSectorCount || 0) +
        " linked sectors.";
      diskMapHeatmapSummary.style.background = scoreToHeatColor(averageScore);
    } else if (state.heatMapVisible && layout) {
      diskMapHeatmapSummary.hidden = false;
      diskMapHeatmapSummary.textContent = "Avg Read Score N/A";
      diskMapHeatmapSummary.title =
        "No valid linked-sector reads are available yet. A blank disk or image without chained follow-up sectors can not produce a meaningful average read score.";
      diskMapHeatmapSummary.style.background = "rgba(91, 110, 120, 0.88)";
    } else {
      diskMapHeatmapSummary.hidden = true;
      diskMapHeatmapSummary.textContent = "";
      diskMapHeatmapSummary.removeAttribute("style");
      diskMapHeatmapSummary.removeAttribute("title");
    }
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
          actionIconMarkup({
            action: "restore-file",
            entryIndex: String(entry.index),
            title: "Restore",
            ariaLabel: "Restore " + entry.name,
            defaultIcon: "↩️",
            hoverIcon: "♻️",
          }) +
          actionIconMarkup({
            action: "destroy-deleted-file",
            entryIndex: String(entry.index),
            title: "Destroy",
            ariaLabel: "Destroy " + entry.name,
            defaultIcon: "💣",
            hoverIcon: "💥",
            danger: true,
          }) +
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
        { label: "Disk ID", value: "-" },
        { label: "DOS Type", value: "-" },
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
    const files = readDirectoryRows(state.image);
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
      {
        label: "Disk Name",
        html:
          '<button type="button" class="meta-inline-button" data-action="edit-disk-name" aria-label="Edit disk name">' +
          escapeHtml(toDisplayValue(header.diskName)) +
          "</button>",
      },
      {
        label: "Disk ID",
        html:
          '<button type="button" class="meta-inline-button" data-action="edit-disk-id" aria-label="Edit disk ID">' +
          escapeHtml(toDisplayValue(header.diskId)) +
          "</button>",
      },
      {
        label: "DOS Type",
        html: (() => {
          const dosTypeInfo =
            d64 && d64.describeDosType
              ? d64.describeDosType(header.dosType)
              : null;
          const dosTypeLabel = formatDosTypeChipLabel(
            dosTypeInfo,
            header.dosType,
          );
          const dosTypeDescription =
            (dosTypeInfo && dosTypeInfo.description) || "Unknown";
          return (
            '<button type="button" class="meta-inline-button" data-action="edit-dos-type" aria-label="Edit DOS type" title="' +
            escapeHtml(dosTypeDescription) +
            '">' +
            escapeHtml(dosTypeLabel) +
            "</button>"
          );
        })(),
      },
      { label: "Format", value: toDisplayValue(header.format) },
      {
        label: "Tracks / Sectors",
        html:
          '<span class="meta-inline-value">' +
          escapeHtml(toDisplayValue(header.trackCount)) +
          " / " +
          escapeHtml(toDisplayValue(header.sectorCount)) +
          '</span> <button type="button" class="meta-inline-button" data-action="open-bam-dialog" aria-label="Open BAM dialog">BAM</button>',
      },
      {
        label: "DOS Version",
        html: (() => {
          const dosVersionInfo =
            d64 && d64.describeDosVersion
              ? d64.describeDosVersion(header.dosVersionByte)
              : null;
          const dosVersionLabel = formatDosVersionChipLabel(
            dosVersionInfo,
            header.dosVersionByte,
          );
          const dosVersionDescription =
            (dosVersionInfo && dosVersionInfo.description) ||
            "Unknown DOS version byte";
          return (
            '<button type="button" class="meta-inline-button" data-action="edit-dos-version" aria-label="Edit DOS version" title="' +
            escapeHtml(dosVersionDescription) +
            '">' +
            escapeHtml(dosVersionLabel) +
            "</button>"
          );
        })(),
      },
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
    clearDropGhost();

    if (!files.length) {
      fileTableBody.innerHTML =
        '<tr><td colspan="10" class="empty-state">This disk has no directory entries.</td></tr>';
      return;
    }

    const seenActiveNames = {};
    fileTableBody.innerHTML = files
      .map(function (file) {
        if (
          state.draggedEntryIndex !== "" &&
          String(
            file.entry && file.entry.index != null ? file.entry.index : "",
          ) === String(state.draggedEntryIndex)
        ) {
          return "";
        }
        const normalizedName = String(file.name || "")
          .trim()
          .toUpperCase();
        const isSuccessiveDuplicate =
          Boolean(normalizedName) && Boolean(seenActiveNames[normalizedName]);
        if (normalizedName) {
          seenActiveNames[normalizedName] = true;
        }
        return (
          '<tr data-file-name="' +
          escapeHtml(file.name) +
          '" data-entry-index="' +
          escapeHtml(
            String(
              file.entry && file.entry.index != null ? file.entry.index : "",
            ),
          ) +
          '"' +
          (isSuccessiveDuplicate
            ? ' class="is-successive-duplicate" title="A previous active entry already uses this filename. Loading may prefer the earlier entry."'
            : "") +
          ">" +
          '<td class="drag-cell"><button type="button" class="drag-handle" draggable="true" data-drag-handle="true" data-name="' +
          escapeHtml(file.name) +
          '" data-entry-index="' +
          escapeHtml(
            String(
              file.entry && file.entry.index != null ? file.entry.index : "",
            ),
          ) +
          '" aria-label="' +
          escapeHtml("Drag to reorder " + file.name) +
          '">::</button></td>' +
          "<td>" +
          '<button type="button" class="file-type-button" data-action="edit-doctor-entry" data-entry-index="' +
          escapeHtml(
            String(
              file.entry && file.entry.index != null ? file.entry.index : "",
            ),
          ) +
          '" aria-label="' +
          escapeHtml("Edit directory entry for " + file.name) +
          '">' +
          escapeHtml(
            String(
              file.entry && file.entry.index != null ? file.entry.index : "",
            ),
          ) +
          "</button>" +
          "</td>" +
          "<td>" +
          escapeHtml(file.name) +
          "</td>" +
          "<td>" +
          escapeHtml(formatDirectoryTypeLabel(file)) +
          "</td>" +
          "<td>" +
          escapeHtml(String((file.entry && file.entry.blockCount) || 0)) +
          "</td>" +
          "<td>" +
          '<button type="button" class="file-type-button" data-action="edit-bytes" data-entry-index="' +
          escapeHtml(
            String(
              file.entry && file.entry.index != null ? file.entry.index : "",
            ),
          ) +
          '" aria-label="' +
          escapeHtml("Edit bytes for " + file.name) +
          '">' +
          formatByteHtml((file.data && file.data.length) || 0) +
          "</button>" +
          "</td>" +
          "<td>" +
          actionIconMarkup({
            action: "toggle-closed",
            entryIndex: String(
              file.entry && file.entry.index != null ? file.entry.index : "",
            ),
            title: file.closed ? "Open" : "Close",
            ariaLabel: (file.closed ? "Open " : "Close ") + file.name,
            defaultIcon: file.closed ? "📄" : "✏️",
            hoverIcon: file.closed ? "✏️" : "📄",
          }) +
          "</td>" +
          "<td>" +
          actionIconMarkup({
            action: "toggle-lock",
            entryIndex: String(
              file.entry && file.entry.index != null ? file.entry.index : "",
            ),
            title: file.locked ? "Unlock" : "Lock",
            ariaLabel: (file.locked ? "Unlock " : "Lock ") + file.name,
            defaultIcon: file.locked ? "🔒" : "🔓",
            hoverIcon: file.locked ? "🔓" : "🔒",
          }) +
          "</td>" +
          "<td>" +
          actionIconMarkup({
            action: "download-file",
            entryIndex: String(
              file.entry && file.entry.index != null ? file.entry.index : "",
            ),
            title: "Download",
            ariaLabel: "Download " + file.name,
            defaultIcon: "💾",
            hoverIcon: "⬇️",
          }) +
          "</td>" +
          "<td>" +
          actionIconMarkup({
            action: "delete-file",
            entryIndex: String(
              file.entry && file.entry.index != null ? file.entry.index : "",
            ),
            title: "Delete",
            ariaLabel: "Delete " + file.name,
            defaultIcon: "🗑️",
            hoverIcon: "🚮",
            danger: true,
          }) +
          "</td>" +
          "</tr>"
        );
      })
      .join("");
  };

  const clearDropGhost = function () {
    const ghost = fileTableBody.querySelector("tr.drop-ghost");
    if (ghost) {
      ghost.remove();
    }
    fileTableBody.querySelectorAll("tr.is-drop-target").forEach(function (row) {
      row.classList.remove("is-drop-target");
    });
  };

  const ensureDropGhost = function () {
    let ghost = fileTableBody.querySelector("tr.drop-ghost");
    if (ghost) {
      return ghost;
    }
    ghost = document.createElement("tr");
    ghost.className = "drop-ghost";
    ghost.innerHTML =
      '<td colspan="9">Move <span class="drop-ghost-name"></span> here</td>';
    return ghost;
  };

  const moveDropGhost = function (targetRow, placement) {
    if (state.draggedEntryIndex === "" || !targetRow) return;
    const ghost = ensureDropGhost();
    const label = ghost.querySelector(".drop-ghost-name");
    if (label) {
      label.textContent = state.draggedFileName;
    }
    clearDropGhost();
    if (placement === "after" && targetRow.nextSibling) {
      fileTableBody.insertBefore(ghost, targetRow.nextSibling);
    } else if (placement === "after") {
      fileTableBody.appendChild(ghost);
    } else {
      fileTableBody.insertBefore(ghost, targetRow);
    }
    targetRow.classList.add("is-drop-target");
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

  const validateCurrentImage = function () {
    if (!state.image) return;
    try {
      loadImageBytes(
        d64.validateImage(state.image),
        state.sourceName || "disk.d64",
        "Validated disk image and rebuilt the BAM from closed file chains.",
        { resetDeletedTypeHints: false },
      );
      refreshDoctorReportAfterImageChange();
    } catch (error) {
      setStatus(error.message || String(error), true);
    }
  };

  const corruptCurrentImageForDoctor = function () {
    if (!state.image) return;
    try {
      loadImageBytes(
        d64.corruptImageForDoctor(state.image),
        state.sourceName || "disk.d64",
        "Corrupted the image to trigger a broad Doctor issue set.",
        { resetDeletedTypeHints: false },
      );
    } catch (error) {
      setStatus(error.message || String(error), true);
    }
  };

  const rebuildBamFromDoctor = function () {
    if (!state.image) return;
    try {
      const nextImage = d64.validateImage(state.image);
      loadImageBytes(
        nextImage,
        state.sourceName || "disk.d64",
        "Rebuilt the BAM from closed file chains.",
        { resetDeletedTypeHints: false },
      );
      refreshDoctorReportAfterImageChange();
    } catch (error) {
      setStatus(error.message || String(error), true);
    }
  };

  const repairDoctorBamAllocations = function () {
    if (!state.image) return;
    try {
      const nextImage = d64.validateImage(state.image);
      loadImageBytes(
        nextImage,
        state.sourceName || "disk.d64",
        "Repaired BAM allocation flags from reachable closed file chains.",
        { resetDeletedTypeHints: false },
      );
      refreshDoctorReportAfterImageChange();
    } catch (error) {
      setStatus(error.message || String(error), true);
    }
  };

  const normalizeDoctorDiskName = function () {
    if (!state.image) return;
    try {
      const nextImage = state.image.slice();
      const start = d64.trackOffset(18, 0) + d64.headerOffsets.diskNameStart;
      const length = d64.headerOffsets.diskNameLength;
      const normalized = d64.normalizeDiskNameFieldBytes(
        nextImage.subarray(start, start + length),
        { length: length },
      );
      nextImage.set(normalized, start);
      loadImageBytes(
        nextImage,
        state.sourceName || "disk.d64",
        "Normalized disk name bytes to PETSCII spaces where needed.",
        { resetDeletedTypeHints: false },
      );
      refreshDoctorReportAfterImageChange();
    } catch (error) {
      setStatus(error.message || String(error), true);
    }
  };

  const closeDoctorDialog = function (options) {
    const config = options || {};
    if (!config.preserveReturnTarget) {
      state.returnToDoctorReport = false;
    }
    if (typeof doctorDialog.close === "function") {
      doctorDialog.close();
    } else {
      doctorDialog.removeAttribute("open");
    }
  };

  const closeDoctorDiskIdDialog = function () {
    if (typeof doctorDiskIdDialog.close === "function") {
      doctorDiskIdDialog.close();
    } else {
      doctorDiskIdDialog.removeAttribute("open");
    }
  };

  const closeBamDialog = function (options) {
    const config = options || {};
    const shouldReturnToDoctor =
      !config.preserveReturnTarget && state.returnToDoctorReport && state.image;
    if (!config.preserveReturnTarget) {
      state.returnToDoctorReport = false;
    }
    if (!config.preserveBamReturn) {
      state.returnToBamDialog = null;
    }
    state.bamDialogContext = null;
    state.bamDialogDraft = null;
    state.bamHoverTrack = null;
    state.bamHoverSector = null;
    hideBamTooltip();
    if (typeof bamDialog.close === "function") {
      bamDialog.close();
    } else {
      bamDialog.removeAttribute("open");
    }
    if (shouldReturnToDoctor) {
      reopenDoctorReport();
    }
  };

  const renderBamDialog = function () {
    if (!state.image || !state.bamDialogDraft) {
      bamGrid.innerHTML = "";
      state.bamDialogAnalysis = null;
      renderBamBitmask();
      return;
    }
    try {
      const previewImage = buildBamPreviewImage();
      state.bamDialogAnalysis = previewImage
        ? d64.diagnoseImage(previewImage)
        : null;
    } catch (error) {
      state.bamDialogAnalysis = null;
    }
    bamDialogName.innerHTML = getBamLegendMarkup();
    const geometry = d64.describeGeometry(state.image);
    const trackCount = Math.max(1, Number(geometry.trackCount) || 35);
    const maxSectors = Array.from({ length: trackCount }, function (_, index) {
      return d64.trackSectorCount(index + 1);
    }).reduce(function (max, sectorCount) {
      return Math.max(max, sectorCount);
    }, 0);
    bamGrid.innerHTML =
      '<table class="bam-grid-table">' +
      "<thead><tr>" +
      '<th class="bam-grid-corner">T/S</th>' +
      Array.from({ length: maxSectors }, function (_, sector) {
        return (
          '<th class="bam-grid-sector" data-sector-header="' +
          escapeHtml(String(sector)) +
          '">' +
          escapeHtml(String(sector)) +
          "</th>"
        );
      }).join("") +
      '<th class="bam-grid-freecount">Free</th>' +
      "</tr></thead>" +
      "<tbody>" +
      Array.from({ length: trackCount }, function (_, index) {
        const track = index + 1;
        const sectorCount = d64.trackSectorCount(track);
        const trackMap = state.bamDialogDraft[track] || [];
        const editableTrack = track <= 35;
        const freeCount = editableTrack
          ? trackMap.filter(function (value) {
              return value === true;
            }).length
          : null;
        return (
          '<tr class="bam-grid-row">' +
          '<th class="bam-grid-track" scope="row" data-track-header="' +
          escapeHtml(String(track)) +
          '">' +
          escapeHtml(String(track)) +
          "</th>" +
          Array.from({ length: maxSectors }, function (_, sector) {
            if (sector >= sectorCount) {
              return '<td><span class="bam-cell is-empty" aria-hidden="true"></span></td>';
            }
            const value = trackMap[sector];
            const issueInfo = getBamCellIssueInfo(track, sector);
            if (value == null || !editableTrack) {
              return (
                '<td><button type="button" class="bam-cell is-untracked" ' +
                'aria-label="Track ' +
                encodeHtmlAttribute(String(track)) +
                " sector " +
                encodeHtmlAttribute(String(sector)) +
                ' is outside the standard BAM range." disabled data-track="' +
                encodeHtmlAttribute(String(track)) +
                '" data-sector="' +
                encodeHtmlAttribute(String(sector)) +
                '"></button></td>'
              );
            }
            return (
              '<td><button type="button" class="bam-cell ' +
              (value ? "is-free" : "is-used") +
              (issueInfo && issueInfo.issueClass
                ? " " + issueInfo.issueClass
                : "") +
              (issueInfo && issueInfo.hasTrackWarning
                ? " is-track-warning"
                : "") +
              (issueInfo && issueInfo.isCurrentReview
                ? " is-current-review"
                : "") +
              '" data-track="' +
              encodeHtmlAttribute(String(track)) +
              '" data-sector="' +
              encodeHtmlAttribute(String(sector)) +
              '" aria-label="Track ' +
              encodeHtmlAttribute(String(track)) +
              " sector " +
              encodeHtmlAttribute(String(sector)) +
              " marked " +
              encodeHtmlAttribute(value ? "free" : "used") +
              '"></button></td>'
            );
          }).join("") +
          '<td class="bam-grid-freecount" data-freecount-track="' +
          escapeHtml(String(track)) +
          '">' +
          escapeHtml(freeCount == null ? "—" : String(freeCount)) +
          "</td>" +
          "</tr>"
        );
      }).join("") +
      "</tbody></table>";
    renderBamBitmask();
  };

  const openBamDialog = function (options) {
    if (!state.image) return;
    const config = options || {};
    state.bamDialogContext = {
      issueIndex:
        config.issueIndex != null ? Math.max(0, Number(config.issueIndex)) : -1,
      returnToDoctor: Boolean(config.returnToDoctor),
    };
    state.bamDialogDraft = d64.readFreeMap(state.image);
    bamDialogName.innerHTML = getBamLegendMarkup();
    renderBamDialog();
    if (typeof bamDialog.showModal === "function") {
      bamDialog.showModal();
    } else {
      bamDialog.setAttribute("open", "open");
    }
  };

  const saveBamDialog = function (event) {
    event.preventDefault();
    if (!state.image || !state.bamDialogDraft) return;
    try {
      const shouldReturnToDoctor = Boolean(state.returnToDoctorReport);
      const nextImage = d64.writeBamFreeMap(state.image, state.bamDialogDraft);
      closeBamDialog({ preserveReturnTarget: shouldReturnToDoctor });
      loadImageBytes(
        nextImage,
        state.sourceName || "disk.d64",
        "Updated BAM allocation map.",
        { resetDeletedTypeHints: false },
      );
      if (shouldReturnToDoctor) {
        refreshDoctorReportAfterImageChange({ inline: false });
      }
    } catch (error) {
      setStatus(error.message || String(error), true);
    }
  };

  const openDoctorDiskIdDialog = function (value, options) {
    const config = options || {};
    const normalizedValue = normalizeDoctorDiskIdValue(value || "00") || "00";
    doctorDiskIdDialogName.textContent =
      "Set the two-character disk ID stored in the header.";
    doctorDiskIdDialog.dataset.source = config.source || "header";
    doctorDiskIdInput.value = normalizedValue;
    doctorDiskIdInput.setCustomValidity("");
    if (typeof doctorDiskIdDialog.showModal === "function") {
      doctorDiskIdDialog.showModal();
    } else {
      doctorDiskIdDialog.setAttribute("open", "open");
    }
    doctorDiskIdInput.focus();
    doctorDiskIdInput.select();
  };

  const closeHeaderDiskNameDialog = function () {
    if (typeof headerDiskNameDialog.close === "function") {
      headerDiskNameDialog.close();
    } else {
      headerDiskNameDialog.removeAttribute("open");
    }
  };

  const openHeaderDiskNameDialog = function (value) {
    const normalizedValue = normalizeDiskNameText(value || "");
    headerDiskNameDialogName.textContent =
      "Set the 16-character disk name stored in the header.";
    headerDiskNameInput.value = normalizedValue;
    headerDiskNameInput.setCustomValidity("");
    if (typeof headerDiskNameDialog.showModal === "function") {
      headerDiskNameDialog.showModal();
    } else {
      headerDiskNameDialog.setAttribute("open", "open");
    }
    headerDiskNameInput.focus();
    headerDiskNameInput.select();
  };

  const closeDoctorDosTypeDialog = function () {
    if (typeof doctorDosTypeDialog.close === "function") {
      doctorDosTypeDialog.close();
    } else {
      doctorDosTypeDialog.removeAttribute("open");
    }
  };

  const closeDoctorDosVersionDialog = function () {
    if (typeof doctorDosVersionDialog.close === "function") {
      doctorDosVersionDialog.close();
    } else {
      doctorDosVersionDialog.removeAttribute("open");
    }
  };

  const openDoctorDosTypeDialog = function (value) {
    const normalizedValue =
      (d64 && d64.normalizeDosType ? d64.normalizeDosType(value) : "2A") ||
      "2A";
    doctorDosTypeDialogName.textContent =
      "Choose a known DOS type. Only 2A is valid for a 1541-style disk.";
    doctorDosTypeSelect.innerHTML = doctorDosTypeOptions
      .map(function (option) {
        const optionValue = option.code || option.label || "2A";
        return (
          '<option value="' +
          escapeHtml(String(optionValue)) +
          '"' +
          (String(optionValue) === String(normalizedValue) ? " selected" : "") +
          ">" +
          escapeHtml(
            String(optionValue) +
              " - " +
              String(option.description || optionValue),
          ) +
          "</option>"
        );
      })
      .join("");
    if (typeof doctorDosTypeDialog.showModal === "function") {
      doctorDosTypeDialog.showModal();
    } else {
      doctorDosTypeDialog.setAttribute("open", "open");
    }
    doctorDosTypeSelect.focus();
  };

  const openDoctorDosVersionDialog = function (value, options) {
    const config = options || {};
    const numericValue = Math.max(
      0,
      Math.min(
        255,
        Math.round(
          Number(value) ||
            (d64 && d64.dosVersions ? d64.dosVersions.dos2_6 : 0x41),
        ),
      ),
    );
    doctorDosVersionDialogName.textContent =
      "Choose a known DOS version byte. 0x41 is the normal 1541 / D64 value.";
    doctorDosVersionDialog.dataset.source = config.source || "doctor";
    doctorDosVersionSelect.innerHTML = doctorDosVersionOptions
      .map(function (option) {
        const optionValue = Number(option.code) & 0xff;
        return (
          '<option value="' +
          escapeHtml(String(optionValue)) +
          '"' +
          (optionValue === numericValue ? " selected" : "") +
          ">" +
          escapeHtml(
            "0x" +
              optionValue.toString(16).toUpperCase().padStart(2, "0") +
              " - " +
              String(option.label || option.key || optionValue) +
              " (" +
              String(option.description || "") +
              ")",
          ) +
          "</option>"
        );
      })
      .join("");
    if (typeof doctorDosVersionDialog.showModal === "function") {
      doctorDosVersionDialog.showModal();
    } else {
      doctorDosVersionDialog.setAttribute("open", "open");
    }
    doctorDosVersionSelect.focus();
  };

  const writeDoctorDiskId = function (value, options) {
    if (!state.image) return;
    const config = options || {};
    const diskId = normalizeDoctorDiskIdValue(value || "00") || "00";
    const nextImage = state.image.slice();
    const start = d64.trackOffset(18, 0) + d64.headerOffsets.diskIdStart;
    nextImage.set(d64.encodeFileName(diskId, 2), start);
    loadImageBytes(
      nextImage,
      state.sourceName || "disk.d64",
      'Updated disk ID to "' + diskId + '".',
      { resetDeletedTypeHints: false },
    );
    if (config.refreshDoctor === true) {
      refreshDoctorReportAfterImageChange();
    }
  };

  const repairDoctorDiskId = function () {
    try {
      writeDoctorDiskId("00", { refreshDoctor: true });
    } catch (error) {
      setStatus(error.message || String(error), true);
    }
  };

  const writeHeaderDiskName = function (value) {
    if (!state.image) return;
    const diskName = normalizeDiskNameText(value || "").slice(0, 16);
    const nextImage = state.image.slice();
    const start = d64.trackOffset(18, 0) + d64.headerOffsets.diskNameStart;
    nextImage.set(d64.encodeFileName(diskName, 16), start);
    loadImageBytes(
      nextImage,
      state.sourceName || "disk.d64",
      'Updated disk name to "' + (diskName || "UNTITLED") + '".',
      { resetDeletedTypeHints: false },
    );
  };

  const writeDoctorDosType = function (value) {
    if (!state.image) return;
    const dosType =
      (d64 && d64.normalizeDosType ? d64.normalizeDosType(value) : "2A") ||
      "2A";
    const nextImage = state.image.slice();
    const start = d64.trackOffset(18, 0) + d64.headerOffsets.dosTypeStart;
    nextImage.set(d64.encodeFileName(dosType, 2), start);
    loadImageBytes(
      nextImage,
      state.sourceName || "disk.d64",
      'Updated DOS type to "' + dosType + '".',
      { resetDeletedTypeHints: false },
    );
    refreshDoctorReportAfterImageChange();
  };

  const writeDoctorDosVersion = function (value, options) {
    if (!state.image) return;
    const config = options || {};
    const numericValue =
      typeof value === "number" ? value : Number.parseInt(String(value), 10);
    const dosVersion = Math.max(
      0,
      Math.min(
        255,
        Number.isFinite(numericValue)
          ? Math.round(numericValue)
          : (d64 && d64.dosVersions && d64.dosVersions.dos2_6) || 0x41,
      ),
    );
    const nextImage = state.image.slice();
    const start = d64.trackOffset(18, 0) + d64.headerOffsets.dosVersion;
    nextImage[start] = dosVersion & 0xff;
    loadImageBytes(
      nextImage,
      state.sourceName || "disk.d64",
      "Updated DOS version to 0x" +
        dosVersion.toString(16).toUpperCase().padStart(2, "0") +
        ".",
      { resetDeletedTypeHints: false },
    );
    if (config.refreshDoctor === true) {
      refreshDoctorReportAfterImageChange();
    }
  };

  const repairDoctorDosType = function () {
    try {
      writeDoctorDosType((d64 && d64.dosTypes && d64.dosTypes.dos2a) || "2A");
    } catch (error) {
      setStatus(error.message || String(error), true);
    }
  };

  const repairDoctorDosVersion = function () {
    try {
      writeDoctorDosVersion(
        (d64 && d64.dosVersions && d64.dosVersions.dos2_6) || 0x41,
        { refreshDoctor: true },
      );
    } catch (error) {
      setStatus(error.message || String(error), true);
    }
  };

  const saveDoctorDosTypeDialog = function (event) {
    event.preventDefault();
    try {
      writeDoctorDosType(doctorDosTypeSelect.value || "2A");
      closeDoctorDosTypeDialog();
    } catch (error) {
      setStatus(error.message || String(error), true);
    }
  };

  const saveDoctorDosVersionDialog = function (event) {
    event.preventDefault();
    try {
      writeDoctorDosVersion(doctorDosVersionSelect.value, {
        refreshDoctor: doctorDosVersionDialog.dataset.source === "doctor",
      });
      closeDoctorDosVersionDialog();
    } catch (error) {
      setStatus(error.message || String(error), true);
    }
  };

  const saveDoctorDiskIdDialog = function (event) {
    event.preventDefault();
    const normalizedValue = normalizeDoctorDiskIdValue(doctorDiskIdInput.value);
    if (doctorDiskIdInput.value !== normalizedValue) {
      doctorDiskIdInput.value = normalizedValue;
    }
    if (normalizedValue.length !== 2) {
      doctorDiskIdInput.setCustomValidity(
        "Disk ID must be exactly two characters.",
      );
      doctorDiskIdInput.reportValidity();
      return;
    }
    doctorDiskIdInput.setCustomValidity("");
    try {
      writeDoctorDiskId(normalizedValue, {
        refreshDoctor: doctorDiskIdDialog.dataset.source === "doctor",
      });
      closeDoctorDiskIdDialog();
    } catch (error) {
      setStatus(error.message || String(error), true);
    }
  };

  const saveHeaderDiskNameDialog = function (event) {
    event.preventDefault();
    const normalizedValue = normalizeDiskNameText(headerDiskNameInput.value);
    if (headerDiskNameInput.value !== normalizedValue) {
      headerDiskNameInput.value = normalizedValue;
    }
    headerDiskNameInput.setCustomValidity("");
    try {
      writeHeaderDiskName(normalizedValue);
      closeHeaderDiskNameDialog();
    } catch (error) {
      setStatus(error.message || String(error), true);
    }
  };

  const repairDoctorSplatFiles = function () {
    if (!state.image) return;
    try {
      let nextImage = state.image.slice();
      let repairedCount = 0;
      for (
        let sectorIndex = 1;
        sectorIndex < d64.trackSectorCount(18);
        sectorIndex += 1
      ) {
        const sector = d64.readSector(nextImage, 18, sectorIndex);
        if (!sector || sector.length < 256) continue;
        for (let slot = 0; slot < 8; slot += 1) {
          const offset = slot * 32;
          const entry = d64.parseDirectoryEntryBytes(
            sector.subarray(offset, offset + 32),
            {
              index: (sectorIndex - 1) * 8 + slot,
              track: 18,
              sector: sectorIndex,
              slot: slot,
            },
          );
          entry.deleted = d64.isDeletedDirectoryEntry(entry);
          if (!entry.typeByte || entry.deleted || entry.closed !== false) {
            continue;
          }
          const entryBytes = entry.raw.slice();
          entryBytes[2] = entryBytes[2] | d64.directoryEntryFlags.closed;
          nextImage = d64.writeDirectoryEntryBytes(
            nextImage,
            entry,
            entryBytes,
          );
          repairedCount += 1;
        }
      }
      loadImageBytes(
        nextImage,
        state.sourceName || "disk.d64",
        repairedCount
          ? "Closed " +
              String(repairedCount) +
              " splat/open file" +
              (repairedCount === 1 ? "" : "s") +
              "."
          : "No splat files needed repair.",
        { resetDeletedTypeHints: false },
      );
      refreshDoctorReportAfterImageChange();
    } catch (error) {
      setStatus(error.message || String(error), true);
    }
  };

  const repairDoctorDuplicateFilenames = function () {
    if (!state.image || !state.doctorReport) return;
    try {
      const issues = Array.isArray(state.doctorReport.issues)
        ? state.doctorReport.issues
        : [];
      const issue = issues.find(function (candidate) {
        return candidate && candidate.code === "duplicate-filenames-repairable";
      });
      if (
        !issue ||
        !Array.isArray(issue.duplicateGroups) ||
        !issue.duplicateGroups.length
      ) {
        setStatus("No duplicate filenames needed repair.");
        return;
      }
      let nextImage = state.image.slice();
      let removedCount = 0;
      issue.duplicateGroups.forEach(function (group) {
        if (
          !group ||
          !Array.isArray(group.entries) ||
          group.entries.length < 2
        ) {
          return;
        }
        const keptByStart = {};
        group.entries.forEach(function (entryRef) {
          const startKey =
            String(Number(entryRef.startTrack) || 0) +
            ":" +
            String(Number(entryRef.startSector) || 0);
          if (!keptByStart[startKey]) {
            keptByStart[startKey] = true;
            return;
          }
          const entry = d64.readDirectoryEntry(nextImage, entryRef.index);
          if (!entry || !entry.typeByte) return;
          const entryBytes = entry.raw.slice();
          entryBytes[2] = 0x00;
          nextImage = d64.writeDirectoryEntryBytes(
            nextImage,
            entry,
            entryBytes,
          );
          removedCount += 1;
        });
      });
      loadImageBytes(
        nextImage,
        state.sourceName || "disk.d64",
        removedCount
          ? "Marked " +
              String(removedCount) +
              " duplicate directory entr" +
              (removedCount === 1 ? "y as DEL." : "ies as DEL.")
          : "No duplicate filenames shared the same start sector.",
        { resetDeletedTypeHints: false },
      );
      refreshDoctorReportAfterImageChange();
    } catch (error) {
      setStatus(error.message || String(error), true);
    }
  };

  const autoRepairDoctorIssues = function () {
    if (!state.image || !state.doctorReport) return;
    try {
      const issues = Array.isArray(state.doctorReport.issues)
        ? state.doctorReport.issues
        : [];
      const hasIssue = function (code) {
        return issues.some(function (issue) {
          return issue && issue.code === code;
        });
      };
      let nextImage = state.image.slice();
      const steps = [];

      if (hasIssue("invalid-disk-name-field")) {
        const start = d64.trackOffset(18, 0) + d64.headerOffsets.diskNameStart;
        const length = d64.headerOffsets.diskNameLength;
        const normalized = d64.normalizeDiskNameFieldBytes(
          nextImage.subarray(start, start + length),
          { length: length },
        );
        nextImage.set(normalized, start);
        steps.push("normalized disk name");
      }

      if (hasIssue("short-disk-id")) {
        const start = d64.trackOffset(18, 0) + d64.headerOffsets.diskIdStart;
        nextImage.set(d64.encodeFileName("00", 2), start);
        steps.push('set disk ID to "00"');
      }

      if (hasIssue("unknown-dos-version")) {
        const start = d64.trackOffset(18, 0) + d64.headerOffsets.dosVersion;
        nextImage[start] =
          (d64 && d64.dosVersions && d64.dosVersions.dos2_6) || 0x41;
        steps.push("set DOS version to 0x41");
      }

      if (hasIssue("unexpected-dos-type")) {
        const start = d64.trackOffset(18, 0) + d64.headerOffsets.dosTypeStart;
        nextImage.set(
          d64.encodeFileName(
            (d64 && d64.dosTypes && d64.dosTypes.dos2a) || "2A",
            2,
          ),
          start,
        );
        steps.push('set DOS type to "2A"');
      }

      if (hasIssue("splat-files")) {
        let closedCount = 0;
        for (
          let sectorIndex = 1;
          sectorIndex < d64.trackSectorCount(18);
          sectorIndex += 1
        ) {
          const sector = d64.readSector(nextImage, 18, sectorIndex);
          if (!sector || sector.length < 256) continue;
          for (let slot = 0; slot < 8; slot += 1) {
            const offset = slot * 32;
            const entry = d64.parseDirectoryEntryBytes(
              sector.subarray(offset, offset + 32),
              {
                index: (sectorIndex - 1) * 8 + slot,
                track: 18,
                sector: sectorIndex,
                slot: slot,
              },
            );
            entry.deleted = d64.isDeletedDirectoryEntry(entry);
            if (!entry.typeByte || entry.deleted || entry.closed !== false) {
              continue;
            }
            const entryBytes = entry.raw.slice();
            entryBytes[2] = entryBytes[2] | d64.directoryEntryFlags.closed;
            nextImage = d64.writeDirectoryEntryBytes(
              nextImage,
              entry,
              entryBytes,
            );
            closedCount += 1;
          }
        }
        if (closedCount) {
          steps.push(
            "closed " +
              String(closedCount) +
              " splat/open file" +
              (closedCount === 1 ? "" : "s"),
          );
        }
      }

      if (hasIssue("directory-block-count-mismatch")) {
        const repaired = d64.repairBlockCounts(nextImage);
        if (repaired && repaired.image) {
          nextImage = repaired.image;
          if (repaired.repairedCount) {
            steps.push(
              "repaired " +
                String(repaired.repairedCount) +
                " block count" +
                (repaired.repairedCount === 1 ? "" : "s"),
            );
          }
        }
      }

      if (
        hasIssue("incorrect-bam-free-counts") ||
        hasIssue("bam-disagrees-used-blocks-marked-free") ||
        hasIssue("orphaned-allocated-blocks")
      ) {
        nextImage = d64.validateImage(nextImage);
        steps.push("repaired BAM allocation flags");
      }

      const duplicateIssue = issues.find(function (issue) {
        return issue && issue.code === "duplicate-filenames-repairable";
      });
      if (
        duplicateIssue &&
        Array.isArray(duplicateIssue.duplicateGroups) &&
        duplicateIssue.duplicateGroups.some(function (group) {
          return group && group.consolidatable;
        })
      ) {
        let removedCount = 0;
        duplicateIssue.duplicateGroups.forEach(function (group) {
          if (
            !group ||
            !Array.isArray(group.entries) ||
            group.entries.length < 2
          ) {
            return;
          }
          const keptByStart = {};
          group.entries.forEach(function (entryRef) {
            const startKey =
              String(Number(entryRef.startTrack) || 0) +
              ":" +
              String(Number(entryRef.startSector) || 0);
            if (!keptByStart[startKey]) {
              keptByStart[startKey] = true;
              return;
            }
            const entry = d64.readDirectoryEntry(nextImage, entryRef.index);
            if (!entry || !entry.typeByte) return;
            const entryBytes = entry.raw.slice();
            entryBytes[2] = 0x00;
            nextImage = d64.writeDirectoryEntryBytes(
              nextImage,
              entry,
              entryBytes,
            );
            removedCount += 1;
          });
        });
        if (removedCount) {
          steps.push(
            "marked " +
              String(removedCount) +
              " duplicate entr" +
              (removedCount === 1 ? "y as DEL" : "ies as DEL"),
          );
        }
      }

      if (
        hasIssue("damaged-bam-or-header") &&
        !(
          hasIssue("incorrect-bam-free-counts") ||
          hasIssue("bam-disagrees-used-blocks-marked-free") ||
          hasIssue("orphaned-allocated-blocks")
        )
      ) {
        nextImage = d64.validateImage(nextImage);
        steps.push("rebuilt BAM");
      }

      loadImageBytes(
        nextImage,
        state.sourceName || "disk.d64",
        steps.length
          ? "Auto repaired: " + steps.join(", ") + "."
          : "No supported Doctor repairs were needed.",
        { resetDeletedTypeHints: false },
      );
      refreshDoctorReportAfterImageChange();
    } catch (error) {
      setStatus(error.message || String(error), true);
    }
  };

  const renderDoctorReport = function (report) {
    const diagnosis = report || {
      summary: {
        repairable: 0,
        warning: 0,
        informational: 0,
        total: 0,
      },
      issues: [],
    };
    state.doctorReport = diagnosis;
    const total = Math.max(0, Number(diagnosis.summary.total) || 0);
    doctorSummary.innerHTML =
      '<div class="doctor-summary-grid">' +
      '<div class="doctor-summary-card"><strong>' +
      escapeHtml(String(state.doctorRunCount || 0)) +
      "</strong><span>Runs</span></div>" +
      '<div class="doctor-summary-card doctor-summary-card-repairable"><strong>' +
      escapeHtml(String(diagnosis.summary.repairable || 0)) +
      "</strong><span>Repairable</span></div>" +
      '<div class="doctor-summary-card doctor-summary-card-warning"><strong>' +
      escapeHtml(String(diagnosis.summary.warning || 0)) +
      "</strong><span>Warnings</span></div>" +
      '<div class="doctor-summary-card doctor-summary-card-info"><strong>' +
      escapeHtml(String(diagnosis.summary.informational || 0)) +
      "</strong><span>Info</span></div>" +
      '<div class="doctor-summary-card"><strong>' +
      escapeHtml(String(total)) +
      "</strong><span>Total</span></div>" +
      "</div>";
    const supportedAutoRepairCodes = {
      "invalid-disk-name-field": true,
      "short-disk-id": true,
      "unknown-dos-version": true,
      "unexpected-dos-type": true,
      "damaged-bam-or-header": true,
      "incorrect-bam-free-counts": true,
      "bam-disagrees-used-blocks-marked-free": true,
      "orphaned-allocated-blocks": true,
      "splat-files": true,
      "directory-block-count-mismatch": true,
      "duplicate-filenames-repairable": true,
    };
    const autoRepairIssues = diagnosis.issues.filter(function (issue) {
      return issue && supportedAutoRepairCodes[issue.code];
    });
    if (!total) {
      doctorReportBody.innerHTML =
        '<div class="doctor-empty">No structural problems were detected.</div>';
      return;
    }
    const renderDoctorAction = function (issue, issueIndex) {
      if (issue.code === "invalid-disk-name-field") {
        return (
          '<div class="doctor-issue-actions">' +
          '<button type="button" class="file-type-button" data-action="normalize-doctor-disk-name">' +
          "Repair" +
          "</button>" +
          '<button type="button" class="file-type-button" data-action="open-doctor-disk-name-hex">' +
          "Review" +
          "</button>" +
          "</div>"
        );
      }
      if (issue.code === "short-disk-id") {
        return (
          '<div class="doctor-issue-actions">' +
          '<button type="button" class="file-type-button" data-action="repair-doctor-disk-id">' +
          "Repair" +
          "</button>" +
          '<button type="button" class="file-type-button" data-action="set-doctor-disk-id">' +
          "Review" +
          "</button>" +
          "</div>"
        );
      }
      if (issue.code === "unknown-dos-version") {
        return (
          '<div class="doctor-issue-actions">' +
          '<button type="button" class="file-type-button" data-action="repair-doctor-dos-version">' +
          "Repair" +
          "</button>" +
          '<button type="button" class="file-type-button" data-action="review-doctor-dos-version">' +
          "Review" +
          "</button>" +
          "</div>"
        );
      }
      if (issue.code === "unexpected-dos-type") {
        return (
          '<div class="doctor-issue-actions">' +
          '<button type="button" class="file-type-button" data-action="repair-doctor-dos-type">' +
          "Repair" +
          "</button>" +
          '<button type="button" class="file-type-button" data-action="review-doctor-dos-type">' +
          "Review" +
          "</button>" +
          "</div>"
        );
      }
      if (issue.code === "damaged-bam-or-header") {
        return (
          '<div class="doctor-issue-actions">' +
          '<button type="button" class="file-type-button" data-action="rebuild-doctor-bam">' +
          "Rebuild" +
          "</button>" +
          "</div>"
        );
      }
      if (issue.code === "splat-files") {
        return (
          '<div class="doctor-issue-actions">' +
          '<button type="button" class="file-type-button" data-action="repair-doctor-splat-files">' +
          "Repair" +
          "</button>" +
          "</div>"
        );
      }
      if (issue.code === "directory-block-count-mismatch") {
        return (
          '<div class="doctor-issue-actions">' +
          '<button type="button" class="file-type-button" data-action="edit-doctor-entry" data-entry-index="' +
          escapeHtml(String(issue.entryIndex != null ? issue.entryIndex : "")) +
          '">' +
          "View" +
          "</button>" +
          '<button type="button" class="file-type-button" data-action="repair-doctor-block-counts" data-entry-index="' +
          escapeHtml(String(issue.entryIndex != null ? issue.entryIndex : "")) +
          '">' +
          "Repair" +
          "</button>" +
          "</div>"
        );
      }
      if (
        issue.code === "incorrect-bam-free-counts" ||
        issue.code === "bam-disagrees-used-blocks-marked-free" ||
        issue.code === "orphaned-allocated-blocks"
      ) {
        return (
          '<div class="doctor-issue-actions">' +
          '<button type="button" class="file-type-button" data-action="repair-doctor-bam-allocations">' +
          "Repair" +
          "</button>" +
          '<button type="button" class="file-type-button" data-action="review-doctor-bam" data-issue-index="' +
          escapeHtml(String(issueIndex)) +
          '">' +
          "Review" +
          "</button>" +
          "</div>"
        );
      }
      if (
        issue.code === "duplicate-filenames" &&
        Array.isArray(issue.duplicateGroups) &&
        issue.duplicateGroups.some(function (group) {
          return group && group.consolidatable;
        })
      ) {
        return (
          '<div class="doctor-issue-actions">' +
          '<button type="button" class="file-type-button" data-action="repair-doctor-duplicate-filenames">' +
          "Repair" +
          "</button>" +
          "</div>"
        );
      }
      return "";
    };
    doctorReportBody.innerHTML =
      (autoRepairIssues.length
        ? '<div class="doctor-report-actions">' +
          '<button type="button" class="file-type-button" data-action="auto-repair-doctor">' +
          "Auto Repair" +
          "</button>" +
          "</div>"
        : "") +
      diagnosis.issues
        .map(function (issue, issueIndex) {
          const duplicateGroupMarkup =
            (issue.code === "duplicate-filenames-repairable" ||
              issue.code === "duplicate-filenames-warning") &&
            Array.isArray(issue.duplicateGroups) &&
            issue.duplicateGroups.length
              ? renderDuplicateDoctorGroups(issue.duplicateGroups, issueIndex)
              : "";
          const renderLinkedDoctorText = function (value) {
            return issue.code === "directory-block-count-mismatch"
              ? escapeHtml(String(value || ""))
              : renderDoctorTextWithSectorLinks(
                  String(value || ""),
                  issueIndex,
                );
          };
          const hasSectorItemGrid = isDoctorSectorItemList(issue.items);
          const shouldCollapseSectorItems =
            hasSectorItemGrid &&
            Array.isArray(issue.items) &&
            issue.items.length > 18;
          const items =
            issue.code === "invalid-file-types" && Array.isArray(issue.items)
              ? issue.items
                  .map(function (item) {
                    const track = Math.max(
                      0,
                      Math.floor(Number(item && item.track) || 0),
                    );
                    const sector = Math.max(
                      0,
                      Math.floor(Number(item && item.sector) || 0),
                    );
                    const slot = Math.max(
                      0,
                      Math.floor(Number(item && item.slot) || 0),
                    );
                    const entryIndex = Math.max(
                      0,
                      Math.floor(Number(item && item.entryIndex) || 0),
                    );
                    const name =
                      String((item && item.name) || "").trim() || "Unnamed";
                    return (
                      '<li class="doctor-invalid-file-type-item">' +
                      '<span class="doctor-inline-name">' +
                      escapeHtml(name) +
                      "</span> " +
                      '<button type="button" class="doctor-sector-link" data-action="open-doctor-sector" data-issue-index="' +
                      encodeHtmlAttribute(String(issueIndex)) +
                      '" data-track="' +
                      encodeHtmlAttribute(String(track)) +
                      '" data-sector="' +
                      encodeHtmlAttribute(String(sector)) +
                      '">' +
                      escapeHtml("T" + String(track) + " S" + String(sector)) +
                      "</button> " +
                      '<button type="button" class="doctor-slot-link" data-action="edit-doctor-entry" data-entry-index="' +
                      encodeHtmlAttribute(String(entryIndex)) +
                      '" data-issue-index="' +
                      encodeHtmlAttribute(String(issueIndex)) +
                      '">' +
                      escapeHtml("Slot " + String(slot)) +
                      "</button>" +
                      "</li>"
                    );
                  })
                  .join("")
              : Array.isArray(issue.items)
                ? issue.items
                    .map(function (item) {
                      return "<li>" + renderLinkedDoctorText(item) + "</li>";
                    })
                    .join("")
                : "";
          return (
            '<article class="doctor-issue doctor-issue-' +
            escapeHtml(issue.level || "informational") +
            '">' +
            '<div class="doctor-issue-heading">' +
            '<span class="doctor-level doctor-level-' +
            escapeHtml(issue.level || "informational") +
            '">' +
            escapeHtml(String(issue.level || "informational")) +
            "</span>" +
            "<h4>" +
            escapeHtml(issue.message || "Issue detected") +
            "</h4>" +
            "</div>" +
            (issue.details
              ? '<p class="doctor-issue-details">' +
                renderLinkedDoctorText(issue.details) +
                "</p>"
              : "") +
            (duplicateGroupMarkup
              ? '<div class="doctor-inline-groups">' +
                duplicateGroupMarkup +
                "</div>"
              : items
                ? shouldCollapseSectorItems
                  ? '<details class="doctor-issue-items-toggle"><summary>' +
                    escapeHtml(String(issue.items.length)) +
                    " sectors found</summary>" +
                    '<ul class="doctor-issue-items doctor-issue-items-grid">' +
                    items +
                    "</ul></details>"
                  : '<ul class="doctor-issue-items' +
                    (issue.code === "invalid-file-types"
                      ? " doctor-invalid-file-type-items"
                      : "") +
                    (hasSectorItemGrid ? " doctor-issue-items-grid" : "") +
                    '">' +
                    items +
                    "</ul>"
                : "") +
            renderDoctorAction(issue, issueIndex) +
            "</article>"
          );
        })
        .join("");
  };

  const runDoctorDiagnosis = function () {
    if (!state.image) return;
    try {
      refreshDoctorReport();
      if (typeof doctorDialog.showModal === "function") {
        doctorDialog.showModal();
      } else {
        doctorDialog.setAttribute("open", "open");
      }
      const report = state.doctorReport || { summary: { total: 0 } };
      setStatus(
        report.summary.total
          ? "Doctor completed a read-only diagnosis."
          : "Doctor found no structural problems.",
      );
    } catch (error) {
      setStatus(error.message || String(error), true);
    }
  };

  const refreshDoctorReport = function (imageOverride) {
    const image = imageOverride || state.image;
    if (!image) return;
    state.doctorRunCount += 1;
    updateDoctorRunIndicators();
    const report = d64.diagnoseImage(image);
    state.doctorReport = report;
    doctorDialogName.textContent =
      (state.sourceName || "Unsaved image") +
      " · " +
      String(report.summary.total || 0) +
      " issue" +
      (Number(report.summary.total || 0) === 1 ? "" : "s") +
      " · run #" +
      String(state.doctorRunCount);
    renderDoctorReport(report);
  };

  const reopenDoctorReport = function () {
    if (!state.image) return;
    runDoctorDiagnosis();
  };

  const isDoctorDialogOpen = function () {
    if (!doctorDialog) return false;
    if (typeof doctorDialog.open === "boolean") {
      return doctorDialog.open;
    }
    return doctorDialog.hasAttribute("open");
  };

  const refreshDoctorReportAfterImageChange = function (options) {
    if (!state.image) return;
    const config = options || {};
    const shouldRefreshInline = config.inline !== false && isDoctorDialogOpen();
    if (shouldRefreshInline) {
      refreshDoctorReport();
      setStatus(
        "Doctor reran after image change. Run #" +
          String(state.doctorRunCount) +
          ".",
      );
      return;
    }
    if (state.returnToDoctorReport) {
      closeDoctorDialog();
      const rerun = function () {
        runDoctorDiagnosis();
      };
      if (
        typeof window !== "undefined" &&
        typeof window.requestAnimationFrame === "function"
      ) {
        window.requestAnimationFrame(function () {
          window.requestAnimationFrame(rerun);
        });
        return;
      }
      window.setTimeout(rerun, 16);
    }
  };

  const repairMismatchedBlockCounts = function (entryIndex) {
    if (!state.image) return;
    try {
      const result =
        entryIndex == null
          ? d64.repairBlockCounts(state.image)
          : d64.repairBlockCounts(state.image, Number(entryIndex));
      if (!result || !result.image) {
        throw new Error("Unable to repair directory block counts.");
      }
      loadImageBytes(
        result.image,
        state.sourceName || "disk.d64",
        result.repairedCount
          ? "Repaired " +
              String(result.repairedCount) +
              " mismatched block count" +
              (result.repairedCount === 1 ? "" : "s") +
              "."
          : "No mismatched block counts needed repair.",
        { resetDeletedTypeHints: false },
      );
      refreshDoctorReportAfterImageChange();
    } catch (error) {
      setStatus(error.message || String(error), true);
    }
  };

  const downloadDiskFile = function (entryIndex) {
    if (!state.image) return;
    const file = findActiveFileByEntryIndex(entryIndex);
    if (!file) {
      setStatus("File not found.", true);
      return;
    }
    const extension =
      {
        prg: ".prg",
        seq: ".seq",
        usr: ".usr",
        rel: ".rel",
      }[String(file.type || "").toLowerCase()] || "";
    const downloadName = /\.[^.\s]+$/.test(String(file.name || ""))
      ? file.name
      : file.name + extension;
    const link = document.createElement("a");
    const objectUrl = URL.createObjectURL(
      new Blob([file.data || new Uint8Array(0)], {
        type: "application/octet-stream",
      }),
    );
    link.href = objectUrl;
    link.download = downloadName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
    setStatus("Downloaded " + file.name + ".");
  };

  const updateFileFlag = function (action, entryIndex) {
    if (!state.image) return;
    try {
      let nextImage = state.image;
      const file = findActiveFileByEntryIndex(entryIndex);
      if (!file || !file.entry) {
        throw new Error("File not found.");
      }
      if (action === "toggle-lock") {
        nextImage =
          file && file.locked
            ? d64.unlockFile(state.image, file.entry)
            : d64.lockFile(state.image, file.entry);
      } else if (action === "toggle-closed") {
        nextImage =
          file && file.closed
            ? d64.openFile(state.image, file.entry)
            : d64.closeFile(state.image, file.entry);
      }
      loadImageBytes(
        nextImage,
        state.sourceName || "disk.d64",
        "Updated file flags for " + file.name + ".",
      );
    } catch (error) {
      setStatus(error.message || String(error), true);
    }
  };

  const deleteFile = function (entryIndex) {
    if (!state.image) return;
    try {
      const file = findActiveFileByEntryIndex(entryIndex);
      if (!file || !file.entry) {
        throw new Error("File not found.");
      }
      if (file.locked) {
        setStatus(
          'Protected file "' +
            file.name +
            '" can not be deleted until it is unlocked.',
          true,
        );
        return;
      }
      state.deletedTypeHints[file.entry.index] = String(file.type || "")
        .trim()
        .toLowerCase();
      let scratchResult = null;
      let statusMessage = "Deleted " + file.name + ".";
      scratchResult = d64.scratchFileWithReport(state.image, file.entry);
      if (scratchResult && scratchResult.partial) {
        const stopReasonMap = {
          loop: "a loop in the file chain",
          "crossed-other-chain": "a sector already claimed by another chain",
          "invalid-pointer": "an invalid track/sector pointer",
          "side-sector-error": "a REL side-sector problem",
        };
        const stopReason =
          stopReasonMap[scratchResult.stoppedReason] || "a chain problem";
        statusMessage =
          "Deleted " +
          file.name +
          ", and freed " +
          numberFormatter.format(scratchResult.freedSectors || 0) +
          " sector" +
          (Number(scratchResult.freedSectors || 0) === 1 ? "" : "s") +
          " before reaching " +
          stopReason +
          ".";
      }
      loadImageBytes(
        scratchResult.image,
        state.sourceName || "disk.d64",
        statusMessage,
        {
          resetDeletedTypeHints: false,
        },
      );
    } catch (error) {
      setStatus(error.message || String(error), true);
    }
  };

  const destroyDeletedFile = function (entryIndex) {
    if (!state.image) return;
    try {
      const deletedEntry = d64
        .readDeletedEntries(state.image)
        .find(function (entry) {
          return String(entry.index) === String(entryIndex);
        });
      if (!deletedEntry) throw new Error("Deleted file not found.");
      const destroyResult = d64.destroyDeletedFileWithReport(
        state.image,
        deletedEntry,
      );
      let statusMessage = "Destroyed deleted entry " + deletedEntry.name + ".";
      if (destroyResult && destroyResult.partial) {
        const stopReasonMap = {
          loop: "a loop in the deleted chain",
          "crossed-other-chain": "a sector already claimed by another chain",
          "invalid-pointer": "an invalid track/sector pointer",
          "side-sector-error": "a REL side-sector problem",
        };
        const stopReason =
          stopReasonMap[destroyResult.stoppedReason] || "a chain problem";
        statusMessage =
          "Destroyed deleted entry " +
          deletedEntry.name +
          " and cleared " +
          numberFormatter.format(destroyResult.clearedSectors || 0) +
          " sector" +
          (Number(destroyResult.clearedSectors || 0) === 1 ? "" : "s") +
          " before reaching " +
          stopReason +
          ".";
      }
      loadImageBytes(
        destroyResult.image,
        state.sourceName || "disk.d64",
        statusMessage,
        { resetDeletedTypeHints: false },
      );
      delete state.deletedTypeHints[deletedEntry.index];
    } catch (error) {
      setStatus(error.message || String(error), true);
    }
  };

  const reorderDirectoryFiles = function (draggedEntryIndex, targetEntryIndex) {
    if (
      !state.image ||
      draggedEntryIndex === "" ||
      targetEntryIndex === "" ||
      String(draggedEntryIndex) === String(targetEntryIndex)
    )
      return;
    try {
      const files = d64.readFiles(state.image);
      const entryIndexes = files.map(function (file) {
        return String(
          file.entry && file.entry.index != null ? file.entry.index : "",
        );
      });
      const fromIndex = entryIndexes.indexOf(String(draggedEntryIndex));
      const toIndex = entryIndexes.indexOf(String(targetEntryIndex));
      if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return;
      const reordered = entryIndexes.slice();
      const moved = reordered.splice(fromIndex, 1)[0];
      let insertIndex = toIndex;
      if (state.dropPlacement === "after") {
        insertIndex += 1;
      }
      if (fromIndex < insertIndex) {
        insertIndex -= 1;
      }
      reordered.splice(insertIndex, 0, moved);
      state.draggedFileName = "";
      state.draggedEntryIndex = "";
      state.dropTargetEntryIndex = "";
      state.dropPlacement = "before";
      loadImageBytes(
        d64.reorderFiles(state.image, reordered),
        state.sourceName || "disk.d64",
        "Reordered directory files.",
        { resetDeletedTypeHints: false },
      );
    } catch (error) {
      setStatus(error.message || String(error), true);
    }
  };

  const openFileTypeDialog = function (entryIndex) {
    if (!state.image) return;
    const file = findActiveFileByEntryIndex(entryIndex);
    if (!file) {
      setStatus("File not found.", true);
      return;
    }
    fileTypeTarget.value = String(
      file.entry && file.entry.index != null ? file.entry.index : "",
    );
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

  const openFileNameDialog = function (entryIndex) {
    if (!state.image) return;
    const file = findActiveFileByEntryIndex(entryIndex);
    if (!file) {
      setStatus("File not found.", true);
      return;
    }
    fileNameTarget.value = String(
      file.entry && file.entry.index != null ? file.entry.index : "",
    );
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

  const openDoctorEntryDialog = function (entryIndexValue, options) {
    const config = options || {};
    if (!state.image) return;
    const entry = config.restoreDeleted
      ? d64.readDeletedEntries(state.image).find(function (candidate) {
          return String(candidate.index) === String(entryIndexValue);
        }) || null
      : d64.readDirectoryEntry(state.image, entryIndexValue);
    if (!entry || (!entry.typeByte && !config.restoreDeleted)) {
      setStatus("Directory entry not found.", true);
      return;
    }
    state.doctorEntryContext = {
      mode: config.restoreDeleted ? "restore-deleted" : "edit-entry",
      entryIndex: String(entry.index),
      returnToDoctor: Boolean(config.returnToDoctor),
    };
    doctorEntryIndex.value = String(entry.index);
    doctorEntryDialogName.textContent =
      "Track " +
      String(entry.track) +
      " Sector " +
      String(entry.sector) +
      " Slot " +
      String(entry.slot);
    doctorEntryDialogMeta.textContent = config.restoreDeleted
      ? "Review the deleted entry fields, then restore the file from this directory slot."
      : "Edit the fields stored in this directory entry record.";
    doctorEntrySave.textContent = config.restoreDeleted
      ? "Restore File"
      : "Save Entry";
    doctorEntryType.value = String(
      config.restoreDeleted
        ? state.deletedTypeHints[entry.index] ||
            (entry.sideSectorTrack ? "rel" : "prg")
        : entry.fileType || "prg",
    ).toLowerCase();
    doctorEntryName.value = String(entry.name || "");
    doctorEntryStartTrack.value = String(Number(entry.startTrack) || 0);
    doctorEntryStartSector.value = String(Number(entry.startSector) || 0);
    doctorEntryBlockCount.value = String(Number(entry.blockCount) || 0);
    doctorEntryNameField.classList.toggle(
      "is-significant",
      Boolean(config.highlightName),
    );
    doctorEntryBlockCountField.classList.toggle(
      "is-significant",
      Boolean(config.highlightBlockCount),
    );
    doctorEntryTypeField.classList.toggle(
      "is-significant",
      Boolean(config.highlightType),
    );
    doctorEntryClosed.checked = Boolean(entry.closed);
    doctorEntryLocked.checked = Boolean(entry.locked);
    doctorEntrySideTrack.value = String(Number(entry.sideSectorTrack) || 0);
    doctorEntrySideSector.value = String(Number(entry.sideSectorSector) || 0);
    doctorEntryRecordLength.value = String(Number(entry.recordLength) || 32);
    syncDoctorEntryDialog();
    syncDoctorEntryRecordCapacity();
    validateDoctorEntryDialog();
    renderDoctorEntryBitmask();
    if (typeof doctorEntryDialog.showModal === "function") {
      doctorEntryDialog.showModal();
    } else {
      doctorEntryDialog.setAttribute("open", "open");
    }
  };

  const closeDoctorEntryDialog = function () {
    state.doctorEntryContext = null;
    if (typeof doctorEntryDialog.close === "function") {
      doctorEntryDialog.close();
    } else {
      doctorEntryDialog.removeAttribute("open");
    }
  };

  const saveFileTypeDialog = function (event) {
    event.preventDefault();
    if (!state.image) return;
    const file = findActiveFileByEntryIndex(fileTypeTarget.value);
    if (!file || !file.entry) {
      setStatus("File not found.", true);
      return;
    }
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
      const nextImage = d64.updateFile(state.image, file.entry, updates);
      loadImageBytes(
        nextImage,
        state.sourceName || "disk.d64",
        "Updated file type for " + file.name + ".",
      );
      closeFileTypeDialog();
    } catch (error) {
      setStatus(error.message || String(error), true);
    }
  };

  const saveFileNameDialog = function (event) {
    event.preventDefault();
    if (!state.image) return;
    const file = findActiveFileByEntryIndex(fileNameTarget.value);
    if (!file || !file.entry) {
      setStatus("File not found.", true);
      return;
    }
    const nextName = d64.normalizeFileName(fileNameInput.value, 16);
    if (!validateFileNameInput()) {
      fileNameInput.reportValidity();
      return;
    }
    try {
      const nextImage = d64.renameFile(state.image, file.entry, nextName);
      loadImageBytes(
        nextImage,
        state.sourceName || "disk.d64",
        "Renamed " + file.name + " to " + nextName + ".",
      );
      closeFileNameDialog();
    } catch (error) {
      setStatus(error.message || String(error), true);
    }
  };

  const saveDoctorEntryDialog = function (event) {
    event.preventDefault();
    if (!state.image) return;
    if (!validateDoctorEntryDialog()) {
      if (doctorEntryName.validationMessage) {
        doctorEntryName.reportValidity();
      } else if (doctorEntryStartTrack.validationMessage) {
        doctorEntryStartTrack.reportValidity();
      } else if (doctorEntrySideTrack.validationMessage) {
        doctorEntrySideTrack.reportValidity();
      } else if (doctorEntryRecordLength.validationMessage) {
        doctorEntryRecordLength.reportValidity();
      }
      return;
    }
    try {
      const entryIndexValue = Math.max(
        0,
        Math.floor(Number(doctorEntryIndex.value) || 0),
      );
      const context = state.doctorEntryContext || {
        mode: "edit-entry",
        returnToDoctor: false,
      };
      const entry =
        context.mode === "restore-deleted"
          ? d64.readDeletedEntries(state.image).find(function (candidate) {
              return String(candidate.index) === String(entryIndexValue);
            }) || null
          : d64.readDirectoryEntry(state.image, entryIndexValue);
      if (!entry || (!entry.typeByte && context.mode !== "restore-deleted")) {
        throw new Error("Directory entry not found.");
      }
      const nextName = d64.normalizeFileName(doctorEntryName.value, 16);
      const nextType = String(doctorEntryType.value || "prg").toLowerCase();
      const nextStartTrack = Math.max(
        0,
        Math.floor(Number(doctorEntryStartTrack.value) || 0),
      );
      const nextStartSector = Math.max(
        0,
        Math.floor(Number(doctorEntryStartSector.value) || 0),
      );
      const nextBlockCount = Math.max(
        0,
        Math.min(65535, Math.floor(Number(doctorEntryBlockCount.value) || 0)),
      );
      const nextSideTrack =
        nextType === "rel"
          ? Math.max(0, Math.floor(Number(doctorEntrySideTrack.value) || 0))
          : 0;
      const nextSideSector =
        nextType === "rel"
          ? Math.max(0, Math.floor(Number(doctorEntrySideSector.value) || 0))
          : 0;
      const nextRecordLength =
        nextType === "rel"
          ? Math.max(
              1,
              Math.min(
                254,
                Math.floor(Number(doctorEntryRecordLength.value) || 32),
              ),
            )
          : 0;
      const nextEntryBytes = entry.raw.slice();
      nextEntryBytes[2] =
        context.mode === "restore-deleted"
          ? 0x00
          : d64.encodeDirectoryEntryType(nextType, {
              closed: doctorEntryClosed.checked,
              locked: doctorEntryLocked.checked,
            });
      nextEntryBytes[3] = nextStartTrack & 0xff;
      nextEntryBytes[4] = nextStartSector & 0xff;
      nextEntryBytes.set(d64.encodeFileName(nextName, 16), 5);
      nextEntryBytes[21] = nextSideTrack & 0xff;
      nextEntryBytes[22] = nextSideSector & 0xff;
      nextEntryBytes[23] = nextRecordLength & 0xff;
      nextEntryBytes[28] = nextBlockCount & 0xff;
      nextEntryBytes[29] = (nextBlockCount >> 8) & 0xff;
      if (context.mode === "restore-deleted") {
        const stagedImage = d64.writeDirectoryEntryBytes(
          state.image,
          entry,
          nextEntryBytes,
        );
        const stagedDeletedEntry = d64
          .readDeletedEntries(stagedImage)
          .find(function (candidate) {
            return String(candidate.index) === String(entry.index);
          });
        if (!stagedDeletedEntry) {
          throw new Error("Deleted file not found.");
        }
        const restoredImage = d64.undeleteFile(
          stagedImage,
          stagedDeletedEntry,
          {
            type: nextType,
            name: nextName,
            closed: doctorEntryClosed.checked,
            locked: doctorEntryLocked.checked,
          },
        );
        loadImageBytes(
          restoredImage,
          state.sourceName || "disk.d64",
          "Restored " + nextName + " as " + nextType.toUpperCase() + ".",
          { resetDeletedTypeHints: false },
        );
        delete state.deletedTypeHints[stagedDeletedEntry.index];
      } else {
        const nextImage = d64.writeDirectoryEntryBytes(
          state.image,
          entry,
          nextEntryBytes,
        );
        const issueResolved = !findMatchingDoctorIssue(
          d64.diagnoseImage(nextImage),
          {
            code: "directory-block-count-mismatch",
            entryIndex: entry.index,
          },
        );
        loadImageBytes(
          nextImage,
          state.sourceName || "disk.d64",
          "Updated directory entry for " +
            nextName +
            "." +
            (issueResolved
              ? " Doctor issue resolved."
              : " Doctor issue still present."),
          { resetDeletedTypeHints: false },
        );
        refreshDoctorReportAfterImageChange({ inline: false });
      }
      closeDoctorEntryDialog();
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
    doctorButton.addEventListener("click", runDoctorDiagnosis);
    validateButton.addEventListener("click", validateCurrentImage);
    fragmentButton.addEventListener("click", function () {
      rebuildDiskLayout("fragmented");
    });
    defragmentButton.addEventListener("click", function () {
      rebuildDiskLayout("sequential");
    });
    corruptButton.addEventListener("click", corruptCurrentImageForDoctor);
    diskMapZoomIn.addEventListener("click", function () {
      zoomDiskMap(1);
    });
    diskMapCoverToggle.addEventListener("click", function () {
      if (!state.image) return;
      state.diskCoverVisible = !state.diskCoverVisible;
      renderDiskMap(state.image);
    });
    heatmapButton.addEventListener("click", function () {
      if (!state.image) return;
      state.heatMapVisible = !state.heatMapVisible;
      syncDiskMapControls();
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
        renderDiskMapInspector();
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
    headerDiskNameInput.addEventListener("input", function () {
      const normalizedValue = normalizeDiskNameText(headerDiskNameInput.value);
      if (headerDiskNameInput.value !== normalizedValue) {
        const start = headerDiskNameInput.selectionStart;
        const end = headerDiskNameInput.selectionEnd;
        const delta = headerDiskNameInput.value.length - normalizedValue.length;
        headerDiskNameInput.value = normalizedValue;
        if (typeof start === "number" && typeof end === "number") {
          const nextStart = Math.max(0, start - delta);
          const nextEnd = Math.max(0, end - delta);
          headerDiskNameInput.setSelectionRange(nextStart, nextEnd);
        }
      }
    });
    headerDiskNameForm.addEventListener("submit", saveHeaderDiskNameDialog);
    headerDiskNameCancel.addEventListener("click", function () {
      closeHeaderDiskNameDialog();
    });
    headerSummary.addEventListener("click", function (event) {
      const button = event.target.closest("button[data-action]");
      if (!button) return;
      if (button.dataset.action === "edit-disk-name") {
        const header = state.image ? d64.readHeader(state.image) : null;
        openHeaderDiskNameDialog((header && header.diskName) || "");
        return;
      }
      if (button.dataset.action === "edit-disk-id") {
        const header = state.image ? d64.readHeader(state.image) : null;
        openDoctorDiskIdDialog((header && header.diskId) || "00", {
          source: "header",
        });
        return;
      }
      if (button.dataset.action === "edit-dos-version") {
        const header = state.image ? d64.readHeader(state.image) : null;
        openDoctorDosVersionDialog(
          (header && header.dosVersionByte) != null
            ? header.dosVersionByte
            : (d64 && d64.dosVersions && d64.dosVersions.dos2_6) || 0x41,
          { source: "header" },
        );
        return;
      }
      if (button.dataset.action === "edit-dos-type") {
        const header = state.image ? d64.readHeader(state.image) : null;
        openDoctorDosTypeDialog(
          (header && header.dosType) ||
            (d64 && d64.dosTypes && d64.dosTypes.dos2a) ||
            "2A",
        );
        return;
      }
      if (button.dataset.action === "open-bam-dialog") {
        openBamDialog();
      }
    });
    doctorEntryType.addEventListener("change", function () {
      syncDoctorEntryDialog();
      syncDoctorEntryRecordCapacity();
      validateDoctorEntryDialog();
      renderDoctorEntryBitmask();
    });
    doctorEntryName.addEventListener("input", function () {
      const normalizedValue = d64.normalizeFileName(doctorEntryName.value, 16, {
        trim: false,
      });
      if (doctorEntryName.value !== normalizedValue) {
        const start = doctorEntryName.selectionStart;
        const end = doctorEntryName.selectionEnd;
        const delta = doctorEntryName.value.length - normalizedValue.length;
        doctorEntryName.value = normalizedValue;
        if (typeof start === "number" && typeof end === "number") {
          doctorEntryName.setSelectionRange(
            Math.max(0, start - delta),
            Math.max(0, end - delta),
          );
        }
      }
      validateDoctorEntryDialog();
      renderDoctorEntryBitmask();
    });
    [
      doctorEntryStartTrack,
      doctorEntryStartSector,
      doctorEntryBlockCount,
      doctorEntrySideTrack,
      doctorEntrySideSector,
      doctorEntryRecordLength,
    ].forEach(function (input) {
      input.addEventListener("input", function () {
        syncDoctorEntryRecordCapacity();
        validateDoctorEntryDialog();
        renderDoctorEntryBitmask();
      });
      input.addEventListener("change", syncDoctorEntryRecordCapacity);
    });
    doctorEntryClosed.addEventListener("change", renderDoctorEntryBitmask);
    doctorEntryLocked.addEventListener("change", renderDoctorEntryBitmask);
    doctorEntryBitmaskButton.addEventListener("click", function () {
      openDoctorEntryHexDialog();
    });
    doctorEntryForm.addEventListener("submit", saveDoctorEntryDialog);
    doctorEntryCancel.addEventListener("click", function () {
      const shouldReturnToDoctor = Boolean(
        state.doctorEntryContext && state.doctorEntryContext.returnToDoctor,
      );
      closeDoctorEntryDialog();
      if (
        shouldReturnToDoctor &&
        typeof doctorDialog.showModal === "function"
      ) {
        doctorDialog.showModal();
      } else if (shouldReturnToDoctor) {
        doctorDialog.setAttribute("open", "open");
      }
    });
    doctorDiskIdInput.addEventListener("input", function () {
      const normalizedValue = normalizeDoctorDiskIdValue(
        doctorDiskIdInput.value,
      );
      if (doctorDiskIdInput.value !== normalizedValue) {
        doctorDiskIdInput.value = normalizedValue;
      }
      doctorDiskIdInput.setCustomValidity("");
    });
    doctorDiskIdForm.addEventListener("submit", saveDoctorDiskIdDialog);
    doctorDiskIdCancel.addEventListener("click", function () {
      closeDoctorDiskIdDialog();
    });
    doctorDosTypeForm.addEventListener("submit", saveDoctorDosTypeDialog);
    doctorDosTypeCancel.addEventListener("click", function () {
      closeDoctorDosTypeDialog();
    });
    doctorDosVersionForm.addEventListener("submit", saveDoctorDosVersionDialog);
    doctorDosVersionCancel.addEventListener("click", function () {
      closeDoctorDosVersionDialog();
    });
    bamGrid.addEventListener("click", function (event) {
      const button = event.target.closest("button[data-track][data-sector]");
      if (!button || !state.bamDialogDraft) return;
      const track = Math.max(1, Math.floor(Number(button.dataset.track) || 0));
      const sector = Math.max(
        0,
        Math.floor(Number(button.dataset.sector) || 0),
      );
      if (
        !state.bamDialogDraft[track] ||
        state.bamDialogDraft[track][sector] == null
      ) {
        return;
      }
      state.bamDialogDraft[track][sector] =
        !state.bamDialogDraft[track][sector];
      renderBamDialog();
      setBamGridHover(track, sector);
    });
    bamGrid.addEventListener("mousemove", function (event) {
      const button = event.target.closest("button[data-track][data-sector]");
      const freeCountCell = event.target.closest("[data-freecount-track]");
      const trackHeader = event.target.closest("[data-track-header]");
      if (!button && !freeCountCell && !trackHeader) {
        setBamGridHover(null, null);
        hideBamTooltip();
        return;
      }
      if (trackHeader && !button && !freeCountCell) {
        const track = Math.max(
          1,
          Math.floor(Number(trackHeader.dataset.trackHeader) || 0),
        );
        setBamGridHover(track, null, { highlightTrackBytes: true });
        hideBamTooltip();
        return;
      }
      if (freeCountCell && !button) {
        const track = Math.max(
          1,
          Math.floor(Number(freeCountCell.dataset.freecountTrack) || 0),
        );
        setBamGridHover(track, null, { highlightCountBits: true });
        hideBamTooltip();
        return;
      }
      const track = Math.max(1, Math.floor(Number(button.dataset.track) || 0));
      const sector = Math.max(
        0,
        Math.floor(Number(button.dataset.sector) || 0),
      );
      setBamGridHover(track, sector);
      const issueInfo = getBamCellIssueInfo(track, sector);
      const shouldShowTooltip =
        Boolean(issueInfo && issueInfo.issueClass) || track > 35;
      if (!shouldShowTooltip) {
        hideBamTooltip();
        return;
      }
      showBamTooltip(
        getBamCellTooltipMarkup(track, sector),
        event.clientX,
        event.clientY,
      );
    });
    bamGrid.addEventListener("mouseleave", function () {
      setBamGridHover(null, null);
      hideBamTooltip();
    });
    bamForm.addEventListener("submit", saveBamDialog);
    bamCancel.addEventListener("click", function () {
      closeBamDialog();
    });
    bamDialog.addEventListener("cancel", function (event) {
      event.preventDefault();
      closeBamDialog();
    });
    bamBitmaskButton.addEventListener("click", function () {
      if (!state.image) return;
      const previewImage = d64.writeBamFreeMap(
        state.image,
        state.bamDialogDraft,
      );
      state.returnToBamDialog = {
        issueIndex:
          state.bamDialogContext && state.bamDialogContext.issueIndex != null
            ? Number(state.bamDialogContext.issueIndex)
            : -1,
        returnToDoctor: Boolean(state.returnToDoctorReport),
      };
      closeBamDialog({ preserveBamReturn: true });
      const bamStart = d64.trackOffset(18, 0) + d64.headerOffsets.bamStart;
      const bamLength = 35 * 4;
      openImageRangeDialog({
        title: "BAM Bytes",
        dialogTitle: "BAM Bytes",
        note: "Only the 35 standard BAM track rows are shown.",
        sourceBytes: previewImage,
        absoluteOffsets: Array.from({ length: bamLength }, function (_, index) {
          return bamStart + index;
        }),
        showOffsets: false,
        highlightLinkBytes: false,
        byteRoleMap: buildBamByteRoleMap(bamLength),
      });
    });
    sectorByteValue.addEventListener("input", function () {
      sectorByteModeHex.checked = true;
      const normalizedValue = String(sectorByteValue.value || "")
        .toUpperCase()
        .replace(/[^0-9A-F\s]/g, "")
        .replace(/\s+/g, " ")
        .trimStart();
      if (sectorByteValue.value !== normalizedValue) {
        sectorByteValue.value = normalizedValue;
      }
      sectorByteValue.setCustomValidity("");
    });
    sectorByteText.addEventListener("input", function () {
      sectorByteModeText.checked = true;
      if (sectorByteDialog.dataset.textKind !== "disk-name") {
        sectorByteText.setCustomValidity("");
        return;
      }
      const normalizedValue = normalizeDiskNameText(sectorByteText.value);
      if (sectorByteText.value !== normalizedValue) {
        sectorByteText.value = normalizedValue;
      }
      sectorByteText.setCustomValidity("");
    });
    sectorByteForm.addEventListener("submit", saveSectorByteDialog);
    sectorByteCancel.addEventListener("click", function () {
      closeSectorByteDialog();
    });
    doctorClose.addEventListener("click", function () {
      closeDoctorDialog();
    });
    doctorReportBody.addEventListener("click", function (event) {
      const button = event.target.closest("button[data-action]");
      if (!button) return;
      if (button.dataset.action === "open-doctor-disk-name-hex") {
        const report = state.doctorReport;
        const issue = findMatchingDoctorIssue(report, {
          code: "invalid-disk-name-field",
        });
        const highlight = issue ? findDoctorIssueHighlight(issue, 18, 0) : null;
        state.returnToDoctorReport = true;
        closeDoctorDialog({ preserveReturnTarget: true });
        const start = d64.trackOffset(18, 0) + d64.headerOffsets.diskNameStart;
        const length = d64.headerOffsets.diskNameLength;
        openImageRangeDialog({
          title: "Disk Name Bytes",
          note: "Only the 16 bytes that make up the disk name field are shown.",
          dialogTitle: "Disk Name",
          showOffsets: false,
          highlightLinkBytes: false,
          rangeKind: "disk-name",
          textConfig: { kind: "disk-name" },
          doctorContext: issue
            ? {
                code: issue.code,
                track: 18,
                sector: 0,
              }
            : null,
          highlightByteIndexes: highlight ? highlight.byteIndexes || [] : [],
          absoluteOffsets: Array.from({ length: length }, function (_, index) {
            return start + index;
          }),
        });
        return;
      }
      if (button.dataset.action === "normalize-doctor-disk-name") {
        normalizeDoctorDiskName();
        return;
      }
      if (button.dataset.action === "repair-doctor-disk-id") {
        repairDoctorDiskId();
        return;
      }
      if (button.dataset.action === "set-doctor-disk-id") {
        const header = state.image ? d64.readHeader(state.image) : null;
        openDoctorDiskIdDialog((header && header.diskId) || "00", {
          source: "doctor",
        });
        return;
      }
      if (button.dataset.action === "repair-doctor-dos-version") {
        repairDoctorDosVersion();
        return;
      }
      if (button.dataset.action === "review-doctor-dos-version") {
        const header = state.image ? d64.readHeader(state.image) : null;
        openDoctorDosVersionDialog(
          (header && header.dosVersionByte) != null
            ? header.dosVersionByte
            : (d64 && d64.dosVersions && d64.dosVersions.dos2_6) || 0x41,
          { source: "doctor" },
        );
        return;
      }
      if (button.dataset.action === "repair-doctor-dos-type") {
        repairDoctorDosType();
        return;
      }
      if (button.dataset.action === "repair-doctor-bam-allocations") {
        repairDoctorBamAllocations();
        return;
      }
      if (button.dataset.action === "review-doctor-bam") {
        const issueIndex = Math.max(
          0,
          Math.floor(Number(button.dataset.issueIndex) || 0),
        );
        const issue = findDoctorIssueByIndex(issueIndex);
        state.returnToDoctorReport = true;
        closeDoctorDialog({ preserveReturnTarget: true });
        openBamDialog({
          issueIndex: issueIndex,
          returnToDoctor: true,
          meta: issue ? issue.message : "",
        });
        return;
      }
      if (button.dataset.action === "review-doctor-dos-type") {
        const header = state.image ? d64.readHeader(state.image) : null;
        openDoctorDosTypeDialog(
          (header && header.dosType) ||
            (d64 && d64.dosTypes && d64.dosTypes.dos2a) ||
            "2A",
        );
        return;
      }
      if (button.dataset.action === "repair-doctor-splat-files") {
        repairDoctorSplatFiles();
        return;
      }
      if (button.dataset.action === "repair-doctor-duplicate-filenames") {
        repairDoctorDuplicateFilenames();
        return;
      }
      if (button.dataset.action === "repair-doctor-block-counts") {
        repairMismatchedBlockCounts(button.dataset.entryIndex);
        return;
      }
      if (button.dataset.action === "edit-doctor-entry") {
        const issueIndex = Math.max(
          0,
          Math.floor(Number(button.dataset.issueIndex) || 0),
        );
        const issue =
          state.doctorReport &&
          Array.isArray(state.doctorReport.issues) &&
          state.doctorReport.issues[issueIndex]
            ? state.doctorReport.issues[issueIndex]
            : null;
        closeDoctorDialog();
        openDoctorEntryDialog(button.dataset.entryIndex, {
          highlightBlockCount:
            Boolean(issue) && issue.code === "directory-block-count-mismatch",
          highlightName:
            Boolean(issue) &&
            (issue.code === "duplicate-filenames-repairable" ||
              issue.code === "duplicate-filenames-warning"),
          highlightType: Boolean(issue) && issue.code === "invalid-file-types",
          returnToDoctor: true,
        });
        return;
      }
      if (button.dataset.action === "repair-doctor-block-counts-all") {
        repairMismatchedBlockCounts();
        return;
      }
      if (button.dataset.action === "auto-repair-doctor") {
        autoRepairDoctorIssues();
        return;
      }
      if (button.dataset.action === "rebuild-doctor-bam") {
        rebuildBamFromDoctor();
        return;
      }
      if (button.dataset.action === "open-doctor-sector") {
        const issueIndex = Math.max(
          0,
          Math.floor(Number(button.dataset.issueIndex) || 0),
        );
        const track = Math.max(
          1,
          Math.floor(Number(button.dataset.track) || 0),
        );
        const sector = Math.max(
          0,
          Math.floor(Number(button.dataset.sector) || 0),
        );
        const issue =
          state.doctorReport &&
          Array.isArray(state.doctorReport.issues) &&
          state.doctorReport.issues[issueIndex]
            ? state.doctorReport.issues[issueIndex]
            : null;
        const highlight = findDoctorIssueHighlight(issue, track, sector);
        state.returnToDoctorReport = true;
        closeDoctorDialog({ preserveReturnTarget: true });
        selectDiskMapSector(track, sector, { centerView: true });
        openSectorDataDialog(track, sector, {
          highlightByteIndexes: highlight ? highlight.byteIndexes || [] : [],
          doctorContext: issue
            ? {
                code: issue.code,
                entryIndex:
                  issue.entryIndex != null ? Number(issue.entryIndex) : null,
                track: track,
                sector: sector,
              }
            : null,
        });
      }
    });
    fileTableBody.addEventListener("click", function (event) {
      const button = event.target.closest("button[data-action]");
      if (!button) return;
      const entryIndex = button.dataset.entryIndex;
      if (button.dataset.action === "edit-doctor-entry") {
        openDoctorEntryDialog(entryIndex, {
          highlightBlockCount: false,
          returnToDoctor: false,
        });
        return;
      }
      if (button.dataset.action === "edit-bytes") {
        openFileDataDialog(entryIndex);
        return;
      }
      if (button.dataset.action === "download-file") {
        downloadDiskFile(entryIndex);
        return;
      }
      if (button.dataset.action === "delete-file") {
        deleteFile(entryIndex);
        return;
      }
      updateFileFlag(button.dataset.action, entryIndex);
    });
    fileTableBody.addEventListener("dragstart", function (event) {
      const handle = event.target.closest("[data-drag-handle='true']");
      if (!handle) {
        event.preventDefault();
        return;
      }
      const row = handle.closest("tr[data-entry-index]");
      if (!row) return;
      state.draggedFileName = row.dataset.fileName || "";
      state.draggedEntryIndex = row.dataset.entryIndex || "";
      state.dropTargetEntryIndex = "";
      state.dropPlacement = "before";
      renderDirectory();
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", state.draggedEntryIndex);
      }
    });
    fileTableBody.addEventListener("dragover", function (event) {
      if (state.draggedEntryIndex === "") return;
      event.preventDefault();
      const row = event.target.closest("tr[data-entry-index]");
      if (!row) {
        const rows = Array.from(
          fileTableBody.querySelectorAll("tr[data-entry-index]"),
        );
        const lastRow = rows.length ? rows[rows.length - 1] : null;
        if (!lastRow) return;
        state.dropTargetEntryIndex = lastRow.dataset.entryIndex || "";
        state.dropPlacement = "after";
        moveDropGhost(lastRow, "after");
        if (event.dataTransfer) {
          event.dataTransfer.dropEffect = "move";
        }
        return;
      }
      const rect = row.getBoundingClientRect();
      const before = event.clientY < rect.top + rect.height / 2;
      state.dropTargetEntryIndex = row.dataset.entryIndex || "";
      state.dropPlacement = before ? "before" : "after";
      moveDropGhost(row, state.dropPlacement);
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = "move";
      }
    });
    fileTableBody.addEventListener("dragleave", function (event) {
      const row = event.target.closest("tr[data-entry-index]");
      if (!row) return;
      row.classList.remove("is-drop-target");
    });
    fileTableBody.addEventListener("drop", function (event) {
      if (state.draggedEntryIndex === "" || state.dropTargetEntryIndex === "")
        return;
      event.preventDefault();
      clearDropGhost();
      reorderDirectoryFiles(
        state.draggedEntryIndex,
        state.dropTargetEntryIndex,
      );
    });
    fileTableBody.addEventListener("dragend", function () {
      clearDropGhost();
      state.draggedFileName = "";
      state.draggedEntryIndex = "";
      state.dropTargetEntryIndex = "";
      state.dropPlacement = "before";
      renderDirectory();
    });
    deletedFilesList.addEventListener("click", function (event) {
      const button = event.target.closest("button[data-action]");
      if (!button) return;
      if (button.dataset.action === "destroy-deleted-file") {
        destroyDeletedFile(button.dataset.entryIndex);
        return;
      }
      if (button.dataset.action !== "restore-file") return;
      openDoctorEntryDialog(button.dataset.entryIndex, {
        restoreDeleted: true,
        returnToDoctor: false,
      });
    });
    diskMapLegend.addEventListener("click", function (event) {
      const jumpButton = event.target.closest('[data-action="jump-sector"]');
      if (jumpButton) {
        selectDiskMapSector(
          jumpButton.dataset.track,
          jumpButton.dataset.sector,
          { centerView: true },
        );
      }
    });
    diskMapPhysical.addEventListener("click", function (event) {
      const jumpButton = event.target.closest('[data-action="jump-sector"]');
      if (jumpButton) {
        selectDiskMapSector(
          jumpButton.dataset.track,
          jumpButton.dataset.sector,
          { centerView: true },
        );
        return;
      }
      const button = event.target.closest('[data-action="open-sector-data"]');
      if (!button) return;
      openSectorDataDialog(button.dataset.track, button.dataset.sector);
    });
    sectorDataDialogBody.addEventListener("mouseover", function (event) {
      const target = event.target.closest("[data-byte-index]");
      if (!target) return;
      setSectorDataHoverIndex(target.dataset.byteIndex || "");
    });
    sectorDataDialogBody.addEventListener("click", function (event) {
      const target = event.target.closest("[data-byte-index]");
      if (!target) return;
      const byteIndex = Math.max(
        0,
        Math.floor(Number(target.dataset.byteIndex) || 0),
      );
      if (
        !state.hexViewContext ||
        !Array.isArray(state.hexViewContext.byteOffsets)
      ) {
        return;
      }
      const currentRange = getSelectedHexRange();
      if (
        event.shiftKey &&
        Number.isFinite(state.hexViewContext.selectionAnchor)
      ) {
        if (
          selectionCrossesMaskedBytes(
            state.hexViewContext.selectionAnchor,
            byteIndex,
          )
        ) {
          state.hexViewContext.warning =
            "Multiple selected bytes can not cross an unused/reserved area.";
          renderActiveHexView();
          setStatus(
            "Multiple selected bytes can not cross an unused/reserved area.",
            true,
          );
          return;
        }
        state.hexViewContext.warning = "";
        state.hexViewContext.selectionStart =
          state.hexViewContext.selectionAnchor;
        state.hexViewContext.selectionEnd = byteIndex;
        renderActiveHexView();
        return;
      }
      state.hexViewContext.warning = "";
      if (
        currentRange &&
        byteIndex >= currentRange.start &&
        byteIndex <= currentRange.end
      ) {
        const doctorContext = state.hexViewContext.doctorContext || null;
        const selectedOffsets = state.hexViewContext.byteOffsets.slice(
          currentRange.start,
          currentRange.end + 1,
        );
        const firstAbsoluteOffset = selectedOffsets[0];
        const titlePrefix =
          state.hexViewContext.mode === "file"
            ? state.hexViewContext.fileName || "File"
            : state.hexViewContext.title ||
              state.hexViewContext.dialogName ||
              "Range";
        openImageByteDialog({
          absoluteOffset: firstAbsoluteOffset,
          absoluteOffsets: selectedOffsets,
          mode: String(state.hexViewContext.mode || ""),
          fileName: state.hexViewContext.fileName || "",
          byteIndex: currentRange.start,
          title:
            titlePrefix +
            " Bytes " +
            toHexWord(currentRange.start) +
            (currentRange.end > currentRange.start
              ? "-" + toHexWord(currentRange.end)
              : ""),
          meta:
            "Selected " +
            String(selectedOffsets.length) +
            " byte" +
            (selectedOffsets.length === 1 ? "" : "s") +
            ".",
        });
        return;
      }
      state.hexViewContext.selectionAnchor = byteIndex;
      state.hexViewContext.selectionStart = byteIndex;
      state.hexViewContext.selectionEnd = byteIndex;
      renderActiveHexView();
    });
    sectorDataDialogBody.addEventListener("mousedown", function (event) {
      const target = event.target.closest("[data-byte-index]");
      if (!target) return;
      event.preventDefault();
    });
    sectorDataDialogBody.addEventListener("mouseout", function (event) {
      const target = event.target.closest("[data-byte-index]");
      if (!target) return;
      const related = event.relatedTarget;
      if (
        related &&
        target.closest(".sector-data-dialog-body")?.contains(related)
      ) {
        const nextTarget =
          related.nodeType === 1 &&
          related.closest &&
          related.closest("[data-byte-index]");
        if (
          nextTarget &&
          nextTarget.dataset.byteIndex === target.dataset.byteIndex
        ) {
          return;
        }
      }
      setSectorDataHoverIndex("");
    });
    sectorDataClose.addEventListener("click", closeSectorDataDialog);
    window.addEventListener("beforeunload", releaseObjectUrl);
    syncDiskMapControls();
    try {
      const defaultOptions = {
        diskName: "TEST LAB",
        diskId: "TP",
        format: d64.diskFormats ? d64.diskFormats.d64_35_track : "d64_35_track",
        name: "TEST LAB",
      };
      const defaultImage = d64.buildImage([], defaultOptions);
      if (!defaultImage) {
        throw new Error("Unable to create the default blank disk image.");
      }
      loadImageBytes(
        defaultImage,
        d64.fileName(defaultOptions),
        "Blank disk image ready.",
      );
    } catch (error) {
      refreshView();
      setStatus(error.message || String(error), true);
    }
  };

  initialize();
})();
