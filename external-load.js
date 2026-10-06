// External loading for the D64 lab.
//
// Everything that lets a disk image come into the lab from outside this page
// lives here:
//
//   1. postMessage from another website. A page on any origin opens the lab
//      in a new window and posts the D64 bytes to it.
//   2. "Open D64 from URL". The lab fetches a URL itself.
//   3. The website integration dialog, which generates a copy-and-paste
//      script that website developers use to do (1).
//
// None of this code parses or renders disks. Once it has a Uint8Array, it hands
// the bytes to index.js through `app.loadImageBytes`, which runs exactly the
// same path as picking a local file.
//
// The postMessage handshake:
//
//   Opener (another website)                 Lab (this page)
//   -------------------------                ---------------
//   window.open(lab + "#receive=<id>")  -->  page loads, reads <id> from hash
//                                       <--  { type: "storage-d64:ready",
//                                              receiveRequestId: <id> }
//   { type: "storage-d64:load",         -->  validate bytes, then
//     sourceName, bytes }                    app.loadImageBytes(...)
//
// The lab does not check event.origin. Any page may send it a disk, because
// the only thing a message can do is open an image for viewing, the same as a
// visitor dropping in a file. The opener is the side that should verify
// origins, and the generated integration script does.
(function () {
  const TPP = (window.TPP = window.TPP || {});

  // Message types shared with the generated integration script below.
  const STORAGE_D64_MESSAGE_TYPE = "storage-d64:load";
  const STORAGE_D64_READY_MESSAGE_TYPE = "storage-d64:ready";

  // An opener that wants to send a disk opens the lab with "#receive=<id>".
  // The id is echoed back in the ready message so the opener can tell this
  // window apart from any other inspector windows it has open.
  const receiveRequestId = new URLSearchParams(
    window.location.hash.slice(1),
  ).get("receive");

  // Converts whatever arrived in `message.bytes` into a Uint8Array.
  //
  // Accepts a Uint8Array, ArrayBuffer, any other typed array or DataView, or a
  // plain array of integers 0-255. Returns null for anything else, including
  // an array with even one out-of-range or non-integer entry, so a bad payload
  // never loads as a silently corrupted disk.
  const readReceivedD64Bytes = function (value) {
    if (value instanceof Uint8Array) return value;
    if (value instanceof ArrayBuffer) return new Uint8Array(value);
    if (ArrayBuffer.isView(value)) {
      // Copy only the viewed range; the view may sit inside a larger buffer.
      return new Uint8Array(
        value.buffer.slice(
          value.byteOffset,
          value.byteOffset + value.byteLength,
        ),
      );
    }
    if (!Array.isArray(value)) return null;
    const bytes = new Uint8Array(value.length);
    for (let index = 0; index < value.length; index += 1) {
      const byte = value[index];
      if (!Number.isInteger(byte) || byte < 0 || byte > 255) return null;
      bytes[index] = byte;
    }
    return bytes;
  };

  // Keeps the file name safe to show in the UI and to reuse when the visitor
  // downloads the image.
  const sanitizeSourceName = function (name) {
    return String(name || "received.d64")
      .replace(/[^A-Za-z0-9._-]/g, "_")
      .slice(0, 128);
  };

  // Builds the snippet a website pastes in to open the lab and wait for it to
  // say it is ready. Both integration variants below start with this.
  const buildOpenInspectorSource = function (inspectorUrl) {
    return [
      "// Opens the D64 inspector in a new window and waits until it is ready",
      "// to receive a disk. Call this from a click handler so popup blockers",
      "// allow the new window.",
      "async function openD64Inspector() {",
      "  const inspectorUrl = " + JSON.stringify(inspectorUrl) + ";",
      "  const inspectorOrigin = new URL(inspectorUrl).origin;",
      "  const requestId = crypto.randomUUID();",
      "  const inspector = window.open(",
      '    inspectorUrl + "#receive=" + encodeURIComponent(requestId),',
      '    "storage-d64-inspector",',
      "  );",
      '  if (!inspector) throw new Error("Allow popups to inspect this D64.");',
      "",
      "  await new Promise((resolve, reject) => {",
      "    const timeout = setTimeout(() => {",
      '      window.removeEventListener("message", ready);',
      '      reject(new Error("The D64 inspector did not become ready."));',
      "    }, 10000);",
      "    function ready(event) {",
      "      // Only trust the window we opened, on the inspector's origin.",
      "      if (event.source !== inspector || event.origin !== inspectorOrigin) return;",
      '      if (event.data?.type !== "' +
        STORAGE_D64_READY_MESSAGE_TYPE +
        '") return;',
      "      if (event.data.receiveRequestId !== requestId) return;",
      "      clearTimeout(timeout);",
      '      window.removeEventListener("message", ready);',
      "      resolve();",
      "    }",
      '    window.addEventListener("message", ready);',
      "  });",
      "  return { inspector, inspectorOrigin };",
      "}",
      "",
      "",
    ].join("\n");
  };

  // Integration variant: the website already has the bytes in memory.
  const buildSendBytesSource = function () {
    return [
      "// Sends D64 bytes your page already has to the inspector.",
      "// bytes: Uint8Array, ArrayBuffer, or an array of numbers 0-255",
      'async function inspectD64Bytes(bytes, sourceName = "disk.d64") {',
      "  const { inspector, inspectorOrigin } = await openD64Inspector();",
      "  inspector.postMessage(",
      '    { type: "' + STORAGE_D64_MESSAGE_TYPE + '", sourceName, bytes },',
      "    inspectorOrigin,",
      "  );",
      "}",
      "",
      'inspectD64Bytes(myD64Bytes, "disk.d64");',
    ].join("\n");
  };

  // Integration variant: the website fetches a D64 by URL, then sends it.
  // The fetch runs on the website's own page, so the disk host only needs to
  // allow that website, not the inspector.
  const buildFetchUrlSource = function (url) {
    return [
      "// Fetches a D64 from a URL and sends it to the inspector.",
      "async function inspectD64(url) {",
      "  const { inspector, inspectorOrigin } = await openD64Inspector();",
      "  const response = await fetch(url);",
      '  if (!response.ok) throw new Error("Could not fetch D64: " + response.status);',
      "  const bytes = new Uint8Array(await response.arrayBuffer());",
      '  const sourceName = new URL(url).pathname.split("/").pop() || "disk.d64";',
      "  inspector.postMessage(",
      '    { type: "' + STORAGE_D64_MESSAGE_TYPE + '", sourceName, bytes },',
      "    inspectorOrigin,",
      "  );",
      "}",
      "",
      "inspectD64(" +
        JSON.stringify(url || "https://example.com/disk.d64") +
        ");",
    ].join("\n");
  };

  // Wires external loading into the lab. index.js calls this once and passes
  // in the few functions this file needs:
  //
  //   app.loadImageBytes(bytes, sourceName, statusMessage)
  //       Loads a Uint8Array as the current disk. May throw if the bytes are
  //       not a valid D64.
  //   app.setStatus(message, isError)
  //       Shows a status toast.
  //   app.openManagedDialog(dialog) / app.closeManagedDialog(dialog)
  //       Shows or hides a lab dialog.
  //
  // Returns { notifyOpenerReady }. index.js calls it after the lab has loaded
  // its default blank disk, so a disk sent by the opener replaces the blank
  // disk instead of being replaced by it.
  const install = function (app) {
    const openUrlButton = document.getElementById("open-url-button");
    const urlDialog = document.getElementById("url-dialog");
    const urlForm = document.getElementById("url-form");
    const urlInput = document.getElementById("url-input");
    const urlCancel = document.getElementById("url-cancel");
    const urlSubmit = document.getElementById("url-submit");
    const integrationHelpButton = document.getElementById(
      "integration-help-button",
    );
    const integrationDialog = document.getElementById("integration-dialog");
    const integrationDescription = document.getElementById(
      "integration-description",
    );
    const integrationSourceSelect = document.getElementById(
      "integration-source-select",
    );
    const integrationUrlField = document.getElementById(
      "integration-url-field",
    );
    const integrationUrlInput = document.getElementById(
      "integration-url-input",
    );
    const integrationCode = document.getElementById("integration-code");
    const integrationCopy = document.getElementById("integration-copy");
    const integrationClose = document.getElementById("integration-close");

    // --- 1. Receiving a disk from another website ---------------------------

    const receiveD64Message = function (event) {
      const message = event.data;
      // Ignore every other message, such as ones from browser extensions.
      if (!message || message.type !== STORAGE_D64_MESSAGE_TYPE) return;
      const bytes = readReceivedD64Bytes(message.bytes);
      if (!bytes || !bytes.length) {
        app.setStatus(
          "Received D64 message did not include image bytes. Send a Uint8Array, an ArrayBuffer, or an array of numbers 0-255.",
          true,
        );
        return;
      }
      const sourceName = sanitizeSourceName(message.sourceName);
      try {
        app.loadImageBytes(
          bytes,
          sourceName || "received.d64",
          "Loaded D64 image sent from another page.",
        );
      } catch (error) {
        app.setStatus(error.message || String(error), true);
      }
    };

    // Tells the opener the lab is listening. The target origin is "*" because
    // the lab does not know the opener's origin, and the message carries only
    // the request id the opener chose itself.
    const notifyOpenerReady = function () {
      if (!receiveRequestId || !window.opener) return;
      window.opener.postMessage(
        {
          type: STORAGE_D64_READY_MESSAGE_TYPE,
          receiveRequestId: receiveRequestId,
        },
        "*",
      );
    };

    // --- 2. Opening a disk from a URL ---------------------------------------

    const openUrlDialog = function () {
      urlInput.value = "";
      app.openManagedDialog(urlDialog);
      urlInput.focus();
    };

    const closeUrlDialog = function () {
      app.closeManagedDialog(urlDialog);
    };

    // The fetch runs from the lab's origin, so the disk host must send CORS
    // headers that allow it.
    const loadImageFromUrl = async function (event) {
      event.preventDefault();
      const url = String(urlInput.value || "").trim();
      try {
        const parsedUrl = new URL(url);
        if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
          throw new Error("Enter an http or https URL for a D64 image.");
        }
        urlSubmit.disabled = true;
        app.setStatus("Loading D64 image from URL...");
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(
            "Could not load the URL (HTTP " + String(response.status) + ").",
          );
        }
        const bytes = new Uint8Array(await response.arrayBuffer());
        const sourceName =
          parsedUrl.pathname.split("/").filter(Boolean).pop() || "remote.d64";
        app.loadImageBytes(bytes, sourceName, "Loaded D64 image from URL.");
        closeUrlDialog();
      } catch (error) {
        app.setStatus(
          error.message ||
            "Could not load that URL. Its server must allow cross-origin requests.",
          true,
        );
      } finally {
        urlSubmit.disabled = false;
      }
    };

    // --- 3. Generating the integration script for website developers -------

    const renderIntegrationCode = function () {
      const sendBytes = integrationSourceSelect.value === "bytes";
      const url = String(integrationUrlInput.value || "").trim();
      // The script opens this exact page, without any "#receive=" fragment.
      const inspectorUrl = window.location.href.split("#")[0];
      integrationUrlField.hidden = sendBytes;
      integrationDescription.textContent = sendBytes
        ? "Send D64 bytes your page already has, such as a generated image or a file the visitor picked. Pass a Uint8Array, an ArrayBuffer, or an array of numbers 0-255."
        : "Paste your public D64 URL to generate a copy-and-paste loader. The disk host must allow cross-origin browser requests (CORS).";
      integrationCode.value =
        buildOpenInspectorSource(inspectorUrl) +
        (sendBytes ? buildSendBytesSource() : buildFetchUrlSource(url));
    };

    const openIntegrationDialog = function () {
      integrationSourceSelect.value = "url";
      integrationUrlInput.value = "";
      renderIntegrationCode();
      app.openManagedDialog(integrationDialog);
      integrationUrlInput.focus();
    };

    const copyIntegrationCode = async function () {
      try {
        await navigator.clipboard.writeText(integrationCode.value);
        app.setStatus("Copied integration code to the clipboard.");
      } catch (error) {
        // Clipboard access can be denied; leave the code selected instead.
        integrationCode.focus();
        integrationCode.select();
        app.setStatus("Select and copy the generated integration code.", true);
      }
    };

    // --- Event wiring -------------------------------------------------------

    window.addEventListener("message", receiveD64Message);
    openUrlButton.addEventListener("click", openUrlDialog);
    urlForm.addEventListener("submit", loadImageFromUrl);
    urlCancel.addEventListener("click", closeUrlDialog);
    integrationHelpButton.addEventListener("click", openIntegrationDialog);
    integrationUrlInput.addEventListener("input", renderIntegrationCode);
    integrationSourceSelect.addEventListener("change", renderIntegrationCode);
    integrationCopy.addEventListener("click", copyIntegrationCode);
    integrationClose.addEventListener("click", function () {
      app.closeManagedDialog(integrationDialog);
    });

    return { notifyOpenerReady: notifyOpenerReady };
  };

  TPP.d64ExternalLoad = Object.freeze({ install: install });
})();
