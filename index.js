(function () {
  const d64 = window.TPP && window.TPP.d64;

  const state = {
    image: null,
    sourceName: "",
    objectUrl: null,
  };

  const createForm = document.getElementById("create-form");
  const diskNameInput = document.getElementById("disk-name");
  const diskIdInput = document.getElementById("disk-id");
  const diskFormatSelect = document.getElementById("disk-format");
  const imageUpload = document.getElementById("image-upload");
  const loadButton = document.getElementById("load-button");
  const downloadButton = document.getElementById("download-button");
  const refreshButton = document.getElementById("refresh-button");
  const currentFileName = document.getElementById("current-file-name");
  const status = document.getElementById("status");
  const headerSummary = document.getElementById("header-summary");
  const usageSummary = document.getElementById("usage-summary");
  const directoryCount = document.getElementById("directory-count");
  const fileTableBody = document.getElementById("file-table-body");

  const REQUIRED_API = [
    "buildImage",
    "readHeader",
    "readFiles",
    "estimateImageUsage",
    "fileName",
    "diskSignature",
    "unlockFile",
    "lockFile",
    "openFile",
    "closeFile",
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
    return '<span class="flag ' + className + '">' + text + "</span>";
  };

  const updateDownloadLinkState = function () {
    releaseObjectUrl();
    if (!state.image) return;
    state.objectUrl = URL.createObjectURL(
      new Blob([state.image], { type: "application/octet-stream" }),
    );
  };

  const refreshView = function () {
    if (!state.image) {
      renderDefinitionList(headerSummary, [
        { label: "Status", value: "No image loaded" },
      ]);
      renderDefinitionList(usageSummary, [
        { label: "Status", value: "Waiting for an image" },
      ]);
      directoryCount.textContent = "0 entries";
      fileTableBody.innerHTML =
        '<tr><td colspan="6" class="empty-state">Load or create a disk image to see directory entries.</td></tr>';
      setCurrentImage(null, "");
      return;
    }

    const header = d64.readHeader(state.image);
    const files = d64.readFiles(state.image);
    const usage = d64.estimateImageUsage(files, {
      trackCount: header.trackCount,
      hasErrorInfo: header.hasErrorInfo,
    });
    const geometry = d64.describeGeometry(state.image);

    renderDefinitionList(headerSummary, [
      { label: "Disk Name", value: toDisplayValue(header.diskName) },
      { label: "Disk ID", value: toDisplayValue(header.diskId) },
      { label: "DOS Type", value: toDisplayValue(header.dosType) },
      { label: "DOS Version", value: toDisplayValue(header.dosVersionName) },
      { label: "Format", value: toDisplayValue(header.format) },
      { label: "Tracks", value: toDisplayValue(header.trackCount) },
      { label: "Sectors", value: toDisplayValue(header.sectorCount) },
      {
        label: "Error Info",
        value: header.hasErrorInfo ? "Appended sector table" : "None",
      },
      {
        label: "Disk Signature",
        value: toDisplayValue(d64.diskSignature(state.image)),
      },
    ]);

    renderDefinitionList(usageSummary, [
      { label: "Image Size", value: geometry.imageSize + " bytes" },
      { label: "Data Area", value: geometry.dataSize + " bytes" },
      { label: "File Count", value: String(files.length) },
      {
        label: "File Sectors",
        value: String(usage.totalFileSectors),
      },
      {
        label: "Directory Sectors",
        value: String(usage.directorySectors),
      },
      {
        label: "Usable File Sectors",
        value: String(usage.usableFileSectors),
      },
    ]);

    directoryCount.textContent =
      files.length.toString() + (files.length === 1 ? " entry" : " entries");

    if (!files.length) {
      fileTableBody.innerHTML =
        '<tr><td colspan="6" class="empty-state">This disk has no directory entries.</td></tr>';
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
          flagMarkup(file.closed, {
            trueClass: "good",
            falseClass: "warn",
            trueText: "Closed",
            falseText: "Open",
          }) +
          "</td>" +
          "<td>" +
          flagMarkup(file.locked, {
            trueClass: "bad",
            falseClass: "good",
            trueText: "Locked",
            falseText: "Unlocked",
          }) +
          "</td>" +
          '<td><div class="row-actions">' +
          '<button type="button" data-action="toggle-lock" data-name="' +
          escapeHtml(file.name) +
          '">' +
          (file.locked ? "Unlock" : "Lock") +
          "</button>" +
          '<button type="button" data-action="toggle-closed" data-name="' +
          escapeHtml(file.name) +
          '">' +
          (file.closed ? "Mark Open" : "Mark Closed") +
          "</button>" +
          "</div></td>" +
          "</tr>"
        );
      })
      .join("");
  };

  const loadImageBytes = function (bytes, sourceName, message) {
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
      loadButton.disabled = true;
      return;
    }

    createForm.addEventListener("submit", createDiskImage);
    loadButton.addEventListener("click", loadSelectedFile);
    imageUpload.addEventListener("change", function () {
      if (imageUpload.files && imageUpload.files[0]) {
        setStatus("Ready to load " + imageUpload.files[0].name + ".");
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
      updateFileFlag(button.dataset.action, button.dataset.name);
    });
    window.addEventListener("beforeunload", releaseObjectUrl);

    refreshView();
    setStatus(
      "D64 helpers ready. Create a blank image or load an existing one.",
    );
  };

  initialize();
})();
