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
  const directoryCount = document.getElementById("directory-count");
  const fileTableBody = document.getElementById("file-table-body");
  const deletedFilesPanel = document.getElementById("deleted-files-panel");
  const deletedCount = document.getElementById("deleted-count");
  const deletedFilesList = document.getElementById("deleted-files-list");
  const numberFormatter = new Intl.NumberFormat("en-US");

  const REQUIRED_API = [
    "buildImage",
    "readHeader",
    "readFiles",
    "readDeletedEntries",
    "estimateImageUsage",
    "fileName",
    "unlockFile",
    "lockFile",
    "openFile",
    "closeFile",
    "scratchFile",
    "undeleteFile",
  ];

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

    refreshView();
    setStatus(
      "D64 helpers ready. Create a blank image or load an existing one.",
    );
  };

  initialize();
})();
