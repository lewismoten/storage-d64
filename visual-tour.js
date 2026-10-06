(() => {
  const documents = [
    { id: "tour", label: "Visual tour", path: "docs/visual-tour.md" },
    { id: "lab", label: "Lab guide", path: "docs/lab.md" },
    { id: "doctor", label: "Doctor guide", path: "docs/doctor.md" },
    { id: "api", label: "Support API", path: "docs/api.md" },
    { id: "timing", label: "Drive timing", path: "docs/drive-timing.md" },
    {
      id: "development",
      label: "Development notes",
      path: "docs/development.md",
    },
    { id: "readme", label: "Project overview", path: "README.md" },
  ];

  const documentElement = document.getElementById("document");
  const navElement = document.getElementById("doc-nav-list");
  const documentById = new Map(documents.map((item) => [item.id, item]));
  const documentByPath = new Map(documents.map((item) => [item.path, item]));

  const escapeHtml = (value) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");

  const resolvePath = (target, sourcePath) =>
    new URL(
      target,
      new URL(sourcePath, "https://storage-d64.local/"),
    ).pathname.slice(1);

  const linkUrl = (target, sourcePath) => {
    const [path, fragment] = target.split("#", 2);
    const targetDocument = documentByPath.get(resolvePath(path, sourcePath));
    if (targetDocument) {
      return `./visual-tour.html?doc=${encodeURIComponent(targetDocument.id)}${
        fragment ? `#${encodeURIComponent(fragment)}` : ""
      }`;
    }
    return new URL(target, new URL(sourcePath, window.location.href)).href;
  };

  const renderInline = (source, sourcePath) => {
    let html = escapeHtml(source);
    html = html.replace(
      /!\[([^\]]*)\]\(([^\s)]+)(?:\s+&quot;([^&]*)&quot;)?\)/g,
      (_, alt, target, title) =>
        `<img src="${escapeHtml(
          new URL(target, new URL(sourcePath, window.location.href)).href,
        )}" alt="${alt}"${title ? ` title="${title}"` : ""}>`,
    );
    html = html.replace(
      /\[([^\]]+)\]\(([^\s)]+)(?:\s+&quot;([^&]*)&quot;)?\)/g,
      (_, label, target, title) =>
        `<a href="${escapeHtml(linkUrl(target, sourcePath))}"${
          title ? ` title="${title}"` : ""
        }>${label}</a>`,
    );
    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
    html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    html = html.replace(/~~([^~]+)~~/g, "<del>$1</del>");
    return html;
  };

  const splitTableRow = (line) =>
    line
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((cell) => cell.trim());

  const isTableDivider = (line) =>
    /^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);

  const renderMarkdown = (markdown, sourcePath) => {
    const lines = markdown.replaceAll("\r\n", "\n").split("\n");
    const output = [];
    let index = 0;

    while (index < lines.length) {
      const line = lines[index];
      if (!line.trim()) {
        index += 1;
        continue;
      }

      if (line.startsWith("```")) {
        const language = line.slice(3).trim();
        const code = [];
        index += 1;
        while (index < lines.length && !lines[index].startsWith("```")) {
          code.push(lines[index]);
          index += 1;
        }
        index += 1;
        output.push(
          `<pre><code${language ? ` class="language-${escapeHtml(language)}"` : ""}>${escapeHtml(code.join("\n"))}</code></pre>`,
        );
        continue;
      }

      const heading = line.match(/^(#{1,6})\s+(.+)$/);
      if (heading) {
        const level = heading[1].length;
        const text = heading[2];
        const id = text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        output.push(
          `<h${level} id="${id}">${renderInline(text, sourcePath)}</h${level}>`,
        );
        index += 1;
        continue;
      }

      if (/^\s*([-*_])\1\1+\s*$/.test(line)) {
        output.push("<hr>");
        index += 1;
        continue;
      }

      if (line.includes("|") && isTableDivider(lines[index + 1] || "")) {
        const headers = splitTableRow(line);
        const rows = [];
        index += 2;
        while (index < lines.length && lines[index].trim().includes("|")) {
          rows.push(splitTableRow(lines[index]));
          index += 1;
        }
        output.push(
          `<div class="table-wrap"><table><thead><tr>${headers
            .map((cell) => `<th>${renderInline(cell, sourcePath)}</th>`)
            .join("")}</tr></thead><tbody>${rows
            .map(
              (row) =>
                `<tr>${headers
                  .map(
                    (_, cellIndex) =>
                      `<td>${renderInline(row[cellIndex] || "", sourcePath)}</td>`,
                  )
                  .join("")}</tr>`,
            )
            .join("")}</tbody></table></div>`,
        );
        continue;
      }

      const list = line.match(/^\s*([-*+] |\d+\. )(.+)$/);
      if (list) {
        const ordered = /^\d+\. /.test(list[1]);
        const items = [];
        while (index < lines.length) {
          const item = lines[index].match(
            ordered ? /^\s*\d+\. (.+)$/ : /^\s*[-*+] (.+)$/,
          );
          if (!item) break;
          items.push(`<li>${renderInline(item[1], sourcePath)}</li>`);
          index += 1;
        }
        output.push(
          `<${ordered ? "ol" : "ul"}>${items.join("")}</${ordered ? "ol" : "ul"}>`,
        );
        continue;
      }

      const quote = [];
      while (index < lines.length && lines[index].startsWith("> ")) {
        quote.push(lines[index].slice(2));
        index += 1;
      }
      if (quote.length) {
        output.push(
          `<blockquote><p>${renderInline(quote.join(" "), sourcePath)}</p></blockquote>`,
        );
        continue;
      }

      const paragraph = [];
      while (index < lines.length && lines[index].trim()) {
        if (
          lines[index].startsWith("```") ||
          /^(#{1,6})\s+/.test(lines[index]) ||
          /^\s*([-*+] |\d+\. )/.test(lines[index])
        ) {
          break;
        }
        paragraph.push(lines[index].trim());
        index += 1;
      }
      if (paragraph.length) {
        output.push(
          `<p>${renderInline(paragraph.join("\n"), sourcePath).replaceAll("\n", "<br>")}</p>`,
        );
      } else {
        index += 1;
      }
    }

    return output.join("\n");
  };

  const renderNavigation = (selected) => {
    navElement.replaceChildren(
      ...documents.map((item) => {
        const link = document.createElement("a");
        link.href = `./visual-tour.html?doc=${encodeURIComponent(item.id)}`;
        link.textContent = item.label;
        if (item.id === selected.id) link.setAttribute("aria-current", "page");
        return link;
      }),
    );
  };

  const selectedId = new URLSearchParams(window.location.search).get("doc");
  const selected = documentById.get(selectedId) || documentById.get("tour");
  renderNavigation(selected);

  fetch(`./${selected.path}`)
    .then((response) => {
      if (!response.ok) throw new Error(`Could not load ${selected.path}.`);
      return response.text();
    })
    .then((markdown) => {
      document.title = `${selected.label} · storage-d64`;
      documentElement.innerHTML = renderMarkdown(markdown, selected.path);
      if (window.location.hash) {
        document
          .getElementById(decodeURIComponent(window.location.hash.slice(1)))
          ?.scrollIntoView();
      }
    })
    .catch((error) => {
      documentElement.innerHTML = `<h1>Documentation unavailable</h1><p>${escapeHtml(
        error.message,
      )} Run the project with <code>npm run lab</code> or open the hosted demo.</p>`;
    });
})();
