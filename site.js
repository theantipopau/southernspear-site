/* ==========================================================================
   Southern Spear — website behaviour
   No framework, no dependencies. Everything here is progressive enhancement:
   with JavaScript disabled the page is still complete and readable, and the
   roadmap, changelog and status panels simply report that they could not load.

   Data comes from data/CHANGELOG.md and data/DEVELOPMENT_ROADMAP.md, which
   Tools/publish_site.py copies from the private game repository. Nothing on
   this page is hard-coded from those documents.
   ========================================================================== */
(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.add("js");

  /* ---------------------------------------------------------------- utils */

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function clear(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function fetchText(url) {
    return fetch(url, { credentials: "omit" })
      .then(function (res) {
        if (!res.ok) throw new Error(url + " -> " + res.status);
        // The published Markdown may carry CRLF. Normalising here keeps every
        // heading and table row matching the same way in every browser.
        return res.text().then(function (text) { return text.replace(/\r\n?/g, "\n"); });
      });
  }

  function reportError(target, what, detail) {
    if (!target) return;
    clear(target);
    target.setAttribute("aria-busy", "false");
    var box = el("p", "error-note");
    box.appendChild(el("strong", null, what + " could not be loaded. "));
    box.appendChild(document.createTextNode(
      "It is published with this site as Markdown in "));
    box.appendChild(el("code", null, "data/"));
    box.appendChild(document.createTextNode(detail ? " (" + detail + ")." : "."));
    target.appendChild(box);
  }

  /* ------------------------------------------------------- markdown subset
     A deliberately small renderer covering exactly the constructs used by the
     project's own documents: ATX headings, paragraphs, lists (nested),
     tables, blockquotes, fenced code, thematic breaks, and inline strong,
     emphasis, code and strikethrough. Input is escaped before any of it runs,
     so document text can never inject markup.
     ---------------------------------------------------------------------- */

  function escapeHtml(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // Code spans are stashed behind a token that cannot occur in the project's
  // documents, so their contents are never re-processed as emphasis or links.
  var CODE_TOKEN = "ss-code-";
  var CODE_TOKEN_RE = /ss-code-(\d+)ss-code-/g;

  function inline(text) {
    var out = escapeHtml(text);
    var codes = [];
    out = out.replace(/`([^`]+)`/g, function (_, code) {
      codes.push(code);
      return CODE_TOKEN + (codes.length - 1) + CODE_TOKEN;
    });
    out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    out = out.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, "$1<em>$2</em>");
    out = out.replace(/~~([^~]+)~~/g, "<del>$1</del>");
    out = out.replace(CODE_TOKEN_RE, function (_, i) {
      return "<code>" + codes[Number(i)] + "</code>";
    });
    return out;
  }

  function splitTableRow(line) {
    var trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
    var cells = [];
    var current = "";
    for (var i = 0; i < trimmed.length; i++) {
      if (trimmed[i] === "\\" && trimmed[i + 1] === "|") {
        current += "|";
        i++;
      } else if (trimmed[i] === "|") {
        cells.push(current.trim());
        current = "";
      } else {
        current += trimmed[i];
      }
    }
    cells.push(current.trim());
    return cells;
  }

  function isTableDivider(line) {
    return /^\s*\|?[\s:-]*-[-\s:|]*\|?\s*$/.test(line) && line.indexOf("-") !== -1;
  }

  function renderMarkdown(source) {
    var lines = String(source).replace(/\r\n?/g, "\n").split("\n");
    var html = [];
    var i = 0;

    function closeList() {
      while (listStack.length) html.push(listStack.pop() === "ul" ? "</ul>" : "</ol>");
    }

    var listStack = [];

    while (i < lines.length) {
      var line = lines[i];

      if (!line.trim()) { closeList(); i++; continue; }

      // Fenced code
      if (/^\s*```/.test(line)) {
        closeList();
        var lang = line.replace(/^\s*```/, "").trim();
        var body = [];
        i++;
        while (i < lines.length && !/^\s*```/.test(lines[i])) { body.push(lines[i]); i++; }
        i++;
        html.push('<pre><code' + (lang ? ' class="lang-' + escapeHtml(lang) + '"' : "") + ">" +
          escapeHtml(body.join("\n")) + "</code></pre>");
        continue;
      }

      // Thematic break
      if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
        closeList();
        html.push("<hr>");
        i++;
        continue;
      }

      // Heading
      var heading = line.match(/^(#{1,6})\s+(.*)$/);
      if (heading) {
        closeList();
        var level = Math.min(heading[1].length, 6);
        html.push("<h" + level + ">" + inline(heading[2].trim()) + "</h" + level + ">");
        i++;
        continue;
      }

      // Table
      if (line.indexOf("|") !== -1 && i + 1 < lines.length && isTableDivider(lines[i + 1])) {
        closeList();
        var head = splitTableRow(line);
        i += 2;
        var rows = [];
        while (i < lines.length && lines[i].indexOf("|") !== -1 && lines[i].trim()) {
          rows.push(splitTableRow(lines[i]));
          i++;
        }
        html.push("<table><thead><tr>");
        head.forEach(function (cell) { html.push("<th>" + inline(cell) + "</th>"); });
        html.push("</tr></thead><tbody>");
        rows.forEach(function (row) {
          html.push("<tr>");
          for (var c = 0; c < head.length; c++) {
            html.push("<td>" + inline(row[c] || "") + "</td>");
          }
          html.push("</tr>");
        });
        html.push("</tbody></table>");
        continue;
      }

      // Blockquote
      if (/^\s*>/.test(line)) {
        closeList();
        var quote = [];
        while (i < lines.length && /^\s*>/.test(lines[i])) {
          quote.push(lines[i].replace(/^\s*>\s?/, ""));
          i++;
        }
        html.push("<blockquote>" + renderMarkdown(quote.join("\n")) + "</blockquote>");
        continue;
      }

      // Lists, including one level of nesting
      var listItem = line.match(/^(\s*)([-*+]|\d+\.)\s+(.*)$/);
      if (listItem) {
        var indent = listItem[1].length;
        var kind = /^\d/.test(listItem[2]) ? "ol" : "ul";
        var depth = indent >= 2 ? 1 : 0;
        while (listStack.length > depth + 1) html.push(listStack.pop() === "ul" ? "</ul>" : "</ol>");
        if (listStack.length === depth + 1) {
          if (listStack[listStack.length - 1] !== kind) {
            html.push(listStack.pop() === "ul" ? "</ul>" : "</ol>");
            listStack.push(kind);
            html.push(kind === "ul" ? "<ul>" : "<ol>");
          }
        } else {
          listStack.push(kind);
          html.push(kind === "ul" ? "<ul>" : "<ol>");
        }
        html.push("<li>" + inline(listItem[3]) + "</li>");
        i++;
        continue;
      }

      // Paragraph
      closeList();
      var para = [];
      while (i < lines.length && lines[i].trim() &&
             !/^(#{1,6}\s|\s*[-*+]\s|\s*\d+\.\s|\s*>|\s*```)/.test(lines[i]) &&
             lines[i].indexOf("|") === -1) {
        para.push(lines[i]);
        i++;
      }
      if (para.length) html.push("<p>" + inline(para.join(" ")) + "</p>");
      else i++;
    }

    closeList();
    return html.join("");
  }

  /* ------------------------------------------------------- scroll reveal */

  function initReveal() {
    var targets = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(targets, function (n) { n.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });
    Array.prototype.forEach.call(targets, function (node) { io.observe(node); });
  }

  /* ------------------------------------------------------------ navigation */

  function initNav() {
    var header = document.getElementById("site-header");
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.getElementById("primary-nav");
    var links = Array.prototype.slice.call(nav ? nav.querySelectorAll("a[href^='#']") : []);
    var sections = links
      .map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); })
      .filter(Boolean);

    // Scroll state. Only toggles a data attribute so there is no layout shift.
    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var scrolled = window.scrollY > 24;
        header.setAttribute("data-nav-state", scrolled ? "scrolled" : "top");
        ticking = false;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (!toggle || !nav) return;

    var isOpen = false;

    function focusable() {
      return Array.prototype.filter.call(
        nav.querySelectorAll("a[href], button:not([disabled])"),
        function (node) { return node.offsetParent !== null; }
      );
    }

    function setOpen(open) {
      isOpen = open;
      nav.setAttribute("data-open", open ? "true" : "false");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      var label = toggle.querySelector(".nav-toggle__label");
      if (label) label.textContent = open ? "Close" : "Menu";
      document.body.setAttribute("data-nav-open", open ? "true" : "false");
      if (open) {
        // The panel is still display:none or visibility:hidden until the
        // opening transition starts, so offsetParent is null and focusable()
        // finds nothing. Wait for layout before reaching into it.
        requestAnimationFrame(function () {
          var first = focusable()[0];
          if (first) first.focus();
        });
      }
    }

    toggle.addEventListener("click", function () { setOpen(!isOpen); });

    // Escape closes and returns focus to the toggle that opened it.
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && isOpen) {
        setOpen(false);
        toggle.focus();
      }
    });

    // Focus trap: Tab cycles inside the panel while it is open.
    nav.addEventListener("keydown", function (event) {
      if (event.key !== "Tab" || !isOpen) return;
      var items = focusable();
      if (!items.length) return;
      var first = items[0];
      var last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    // Following a link closes the panel.
    nav.addEventListener("click", function (event) {
      var anchor = event.target.closest ? event.target.closest("a[href^='#']") : null;
      if (anchor && isOpen) setOpen(false);
    });

    // Reset the panel if the viewport grows past the mobile breakpoint.
    var wide = window.matchMedia("(min-width: 1101px)");
    var onWide = function (e) { if (e.matches && isOpen) setOpen(false); };
    if (wide.addEventListener) wide.addEventListener("change", onWide);
    else if (wide.addListener) wide.addListener(onWide);

    // Active-section indicator.
    if (!("IntersectionObserver" in window) || !sections.length) return;
    var visible = new Map();
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { visible.set(entry.target.id, entry.isIntersecting); });
      var activeId = null;
      sections.forEach(function (section) {
        if (visible.get(section.id)) activeId = section.id;
      });
      links.forEach(function (a) {
        if (a.getAttribute("href") === "#" + activeId) a.setAttribute("aria-current", "true");
        else a.removeAttribute("aria-current");
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    sections.forEach(function (section) { spy.observe(section); });
  }

  /* ------------------------------------------------------------- lightbox */

  function initLightbox() {
    var box = document.getElementById("lightbox");
    if (!box) return;
    var image = document.getElementById("lightbox-image");
    var caption = document.getElementById("lightbox-caption");
    /* Triggers are looked up when the lightbox opens, not once at start-up,
       because the in-engine captures are rendered later from JSON and must
       join the same previous / next sequence as the static images. */
    var triggers = [];
    var current = -1;
    var opener = null;

    function show(index) {
      if (index < 0 || index >= triggers.length) return;
      current = index;
      var trigger = triggers[index];
      var thumb = trigger.querySelector("img");
      /* The trigger's declared full-size source is preferred, so "view
         larger" really is larger than the thumbnail the browser picked. If
         that path is ever stale, fall back to the resolved thumbnail source,
         which is the defect that was fixed when the lightbox first shipped. */
      var fallback = thumb ? thumb.currentSrc : null;
      image.onerror = function () {
        if (fallback && image.getAttribute("src") !== fallback) {
          delete image.dataset.failed;
          image.style.opacity = "";
          image.src = fallback;
        }
      };
      var src = trigger.getAttribute("data-lightbox-src") || fallback;
      if (!src) return;
      image.src = src;
      image.alt = trigger.getAttribute("data-lightbox-alt") || "";
      caption.textContent = trigger.getAttribute("data-lightbox-caption") || "";
      box.hidden = false;
      document.body.setAttribute("data-nav-open", "true");
      var close = box.querySelector(".lightbox__close");
      if (close) close.focus();
    }

    function close() {
      box.hidden = true;
      image.removeAttribute("src");
      document.body.setAttribute("data-nav-open", "false");
      if (opener) opener.focus();
    }

    document.addEventListener("click", function (event) {
      var trigger = event.target.closest && event.target.closest("[data-lightbox-src]");
      if (!trigger || box.contains(trigger)) return;
      triggers = Array.prototype.slice.call(document.querySelectorAll("[data-lightbox-src]"));
      opener = trigger;
      show(triggers.indexOf(trigger));
    });

    box.addEventListener("click", function (event) {
      if (event.target.hasAttribute("data-lightbox-close")) close();
      var step = event.target.getAttribute && event.target.getAttribute("data-lightbox-step");
      if (step) show((current + Number(step) + triggers.length) % triggers.length);
    });

    document.addEventListener("keydown", function (event) {
      if (box.hidden) return;
      if (event.key === "Escape") { event.preventDefault(); close(); }
      if (event.key === "ArrowRight") show((current + 1) % triggers.length);
      if (event.key === "ArrowLeft") show((current - 1 + triggers.length) % triggers.length);
      if (event.key === "Tab") {
        // Keep focus inside the dialog.
        var items = Array.prototype.filter.call(
          box.querySelectorAll("button, [href]"),
          function (n) { return n.offsetParent !== null; }
        );
        if (!items.length) return;
        var first = items[0];
        var last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });
  }

  /* ------------------------------------------------------------ data utils */

  // Extracts the body of a named "### HEADING" or "## HEADING" section.
  // Done by walking lines rather than with a lookahead, because JavaScript has
  // no end-of-input anchor that behaves like Python's \Z.
  function sectionOf(text, heading) {
    var wanted = heading.toUpperCase();
    var out = [];
    var collecting = false;
    text.split("\n").forEach(function (line) {
      var match = line.match(/^#{1,6}\s+(.*?)\s*$/);
      // Recent sessions label their parts in bold capitals ("**NEXT ACTION** text"), not as headings.
      var bold = !match && line.match(/^\*\*([A-Z][A-Z &\/-]*)\*\*\s*(.*)$/);
      if (bold) {
        collecting = normaliseHeading(bold[1]) === wanted;
        if (collecting && bold[2]) out.push(bold[2]);
        return;
      }
      if (match) {
        if (collecting) { collecting = false; }
        // Headings in these documents are numbered, e.g. "## 2. Phase Summary".
        else if (normaliseHeading(match[1]) === wanted) { collecting = true; }
        return;
      }
      if (collecting) out.push(line);
    });
    return out.join("\n").replace(/^\s*\n/, "").trim();
  }

  function normaliseHeading(heading) {
    return String(heading).replace(/^\d+(\.\d+)*\.?\s+/, "").trim().toUpperCase();
  }

  function listItems(markdown, limit) {
    return markdown
      .split("\n")
      .map(function (line) { return line.match(/^\s*[-*+]\s+(.*)$/); })
      .filter(Boolean)
      .map(function (m) { return m[1].trim(); })
      .filter(function (s) { return s.length > 2; })
      .slice(0, limit || 4);
  }

  // Trims an over-long value for a card without cutting mid-word.
  function clip(text, max) {
    var value = plain(text);
    if (value.length <= max) return value;
    var cut = value.slice(0, max);
    return cut.slice(0, cut.lastIndexOf(" ")) + "\u2026";
  }

  function plain(markdown) {
    return String(markdown)
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*[^*]+\*/g, "$1")
      .replace(/~~([^~]+)~~/g, "$1")
      .replace(/^[-*+]\s+/gm, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function parseSessions(text) {
    var seen = {};
    return text
      .split(/\n(?=## )/)
      .filter(function (chunk) { return /^## Session/.test(chunk); })
      .map(function (chunk) {
        var lines = chunk.split("\n");
        var heading = lines[0].replace(/^##\s+/, "").trim();
        var dateMatch = heading.match(/(\d{4}-\d{2}-\d{2})/);
        var numberMatch = heading.match(/Session\s+([0-9a-z]+)/i);
        var title = heading
          .replace(/^Session\s+[0-9a-z]+\s*[\u2014\u2013-]?\s*/i, "")
          .replace(/^\d{4}-\d{2}-\d{2}\s*[\u2014\u2013-]?\s*/, "")
          .trim();
        return {
          heading: heading,
          number: numberMatch ? parseFloat(numberMatch[1]) : 0,
          date: dateMatch ? dateMatch[1] : "",
          // Session headings carry inline code spans; strip the markers so the
          // title reads as text rather than as literal backticks.
          title: plain(title),
          body: lines.slice(1).join("\n"),
          slug: "session-" + (numberMatch ? numberMatch[1].toLowerCase() : Math.abs(hash(heading))),
          source: chunk
        };
      })
      .sort(function (a, b) { return b.number - a.number; })
      .map(function (session) {
        /* The source log has reused session numbers (two 023s, two 028s, two
           032s and so on from parallel sessions). Two nodes may not share one
           id: the second occurrence gets a -2, -3 suffix so every deep link
           resolves to exactly one session. */
        var n = (seen[session.slug] || 0) + 1;
        seen[session.slug] = n;
        session.slug = n === 1 ? session.slug : session.slug + "-" + n;
        return session;
      });
  }

  function hash(text) {
    var h = 0;
    for (var i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) | 0;
    return h;
  }

  /* Categories are only claimed when a keyword is unambiguous. Anything that
     does not match confidently stays as "Development". */
  var CATEGORIES = [
    { id: "networking", label: "Networking", re: /\b(netcode|replicat\w*|dedicated server|server build|latency|jitter|packet loss|network emulation|lobby|session host|eos\b|reconnect\w*|authority|authoritative)\b/i },
    { id: "maps", label: "Maps", re: /\b(map|level|greybox|graybox|blockout|dry river|terrain|landscape|navmesh|navigation mesh|world partition|streaming|dressing|objective actor|spawn|encounter)\b/i },
    { id: "gameplay", label: "Gameplay", re: /\b(weapon|recoil|damage|health|ammunition|grenade|suppression|revive|round|scoring|game mode|objective|gas\b|ability|role|training|qualification|fire team|fireteam|movement|melee|reload)\b/i },
    { id: "ui", label: "UI", re: /\b(widget|hud|menu|interface|ui\b|compass|minimap|screen|front end|settings|typography|font|layout|icon)\b/i },
    { id: "audio", label: "Audio", re: /\b(sound|audio|music|footstep|ambience|voice|soundbank|attenuation)\b/i },
    { id: "assets", label: "Assets", re: /\b(model|texture|mesh|animation|anim\b|asset|import\w*|blender|fab\b|material|skeleton|rig\b)\b/i },
    { id: "accessibility", label: "Accessibility", re: /\b(accessib\w*|colour|color|colourblind|colorblind|subtitle|caption|font scale|remap|contrast|reduced motion)\b/i },
    { id: "performance", label: "Performance", re: /\b(performance|fps|frame rate|profil\w*|optimis\w*|optimiz\w*|budget|memory|lod\b|draw call)\b/i },
    { id: "documentation", label: "Documentation", re: /\b(document\w*|readme|adr\b|decision log|register\b|test plan|changelog|roadmap|spec\b)\b/i }
  ];

  function categoriesFor(session) {
    var haystack = sectionOf(session.source, "COMPLETED") + " " +
                   sectionOf(session.source, "ASSETS") + " " +
                   session.title;
    var found = CATEGORIES.filter(function (cat) { return cat.re.test(haystack); });
    if (!found.length) return ["development"];
    return found.slice(0, 2).map(function (cat) { return cat.id; });
  }

  /* ------------------------------------------------------ status + roadmap */

  var CHANGELOG = "data/CHANGELOG.md";
  var ROADMAP = "data/DEVELOPMENT_ROADMAP.md";

  // Held between the two fetches so the status panel can quote the roadmap's
  // own Current Status table rather than a stale copy in the changelog.
  var roadmapText = "";
  var currentPhase = null;

  function readCurrentPhase(text) {
    var block = sectionOf(text, "Current Status");
    if (!block) return null;
    var names = {
      0: "Audit & Architecture", 1: "Greybox Vertical Slice", 2: "Infantry Combat",
      3: "Training & Progression", 4: "Maps & Layers", 5: "Online Hardening",
      6: "Content & Polish"
    };
    var cells = block.split("\n")
      .map(function (l) {
        return l.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map(function (c) { return c.trim(); });
      })
      .filter(function (c) { return c.length >= 2; });
    var active = cells.filter(function (c) {
      return /^Phase\s+\d/.test(c[0]) && /active|in progress/i.test(c[1]);
    })[0];
    if (!active) return null;
    var num = Number(active[0].match(/^Phase\s+(\d+)/)[1]);
    return {
      num: num,
      label: "Phase " + num + " \u2014 " + (names[num] || ""),
      detail: clip(active[1], 190)
    };
  }

  function renderStatus(sessions, changelogText) {
    var host = document.getElementById("status");
    if (!host) return;
    clear(host);

    var glance = {};
    var glanceBlock = sectionOf(changelogText, "Status At A Glance");
    if (glanceBlock) {
      glanceBlock.split("\n").forEach(function (line) {
        if (line.indexOf("|") === -1) return;
        var cells = line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|");
        var key = cells[0].trim().toLowerCase().replace(/\?/g, "");
        if (cells.length >= 2 && key && !/^-{2,}$/.test(key)) {
          glance[key] = cells[1].trim();
        }
      });
    }

    var latest = sessions[0];
    var nextAction = plain(sectionOf(latest.source, "NEXT ACTION"));
    var risks = plain(sectionOf(latest.source, "RISKS"));
    var completed = listItems(sectionOf(latest.source, "COMPLETED"), 4);

    var cards = [
      {
        label: "Current phase", accent: true,
        value: currentPhase ? currentPhase.label : clip(glance["current phase"] || "Not recorded", 80),
        state: currentPhase ? "progress" : "planned",
        meta: currentPhase ? currentPhase.detail : "From the changelog's Status At A Glance table."
      },
      {
        label: "Current milestone",
        value: latest ? "Session " + latest.number : "Not recorded",
        state: "progress",
        body: latest ? clip(latest.title, 120) : "",
        meta: latest && latest.date ? "Recorded " + latest.date : ""
      },
      {
        label: "Recently completed",
        value: latest ? "Latest session" : "Not recorded",
        state: "complete",
        list: completed.map(function (item) { return clip(item, 150); }),
        meta: glance["buildable"] ? "Buildable: " + plain(glance["buildable"]) : ""
      },
      {
        label: "Next major objective",
        value: "The single next action",
        state: "planned",
        body: clip(nextAction || "Not recorded.", 220),
        meta: glance["playable"] ? "Playable: " + plain(glance["playable"]) : ""
      },
      {
        label: "Open risks",
        value: risks ? "Carried forward" : "None recorded",
        state: /blocked|not run/i.test(risks) ? "blocked" : "testing",
        body: clip(risks || "Not recorded.", 220),
        meta: glance["current phase"] ? "Changelog Status At A Glance: " + clip(glance["current phase"], 90) : ""
      }
    ];

    cards.forEach(function (card) {
      var node = el("article", "status-card" + (card.accent ? " status-card--accent" : ""));
      node.appendChild(el("p", "status-card__label", card.label));

      var head = el("div", "phase__meta");
      var state = el("span", "state state--" + (card.state || "planned"));
      state.appendChild(el("span", null, ({
        planned: "Planned", progress: "In progress", testing: "Testing",
        complete: "Complete", blocked: "Blocked"
      })[card.state] || "Planned"));
      head.appendChild(state);
      node.appendChild(head);

      node.appendChild(el("p", "status-card__value", card.value));

      if (card.body) node.appendChild(el("p", "status-card__body", card.body));
      if (card.list && card.list.length) {
        var ul = el("ul", "status-card__body");
        card.list.forEach(function (item) {
          var li = el("li");
          li.innerHTML = inline(item);
          ul.appendChild(li);
        });
        node.appendChild(ul);
      }
      if (card.meta) node.appendChild(el("p", "status-card__meta", card.meta));
      host.appendChild(node);
    });

    host.setAttribute("aria-busy", "false");
  }

  function renderRoadmap(text) {
    var host = document.getElementById("roadmap-phases");
    if (!host) return;
    clear(host);

    // Phase summary table gives goal and exit criterion for every phase.
    var summary = {};
    var summaryBlock = sectionOf(text, "Phase Summary");
    if (summaryBlock) {
      summaryBlock.split("\n").forEach(function (line) {
        var trimmed = line.trim();
        if (!trimmed.startsWith("|")) return;
        var cells = trimmed.replace(/^\|/, "").replace(/\|$/, "").split("|").map(function (c) { return c.trim(); });
        if (cells.length < 3) return;
        if (/^:?-{2,}:?$/.test(cells[0])) return;
        var head = cells[0].replace(/^\*\*/, "").replace(/\*\*$/, "").trim();
        var num = head.match(/^(\d+)\.\s*(.+)$/);
        if (!num) return;
        summary[num[1]] = { name: num[2].trim(), goal: cells[1], exit: cells[2] };
      });
    }

    // Current Status table gives the authoritative per-phase state.
    var states = {};
    var stateBlock = sectionOf(text, "Current Status");
    if (stateBlock) {
      stateBlock.split("\n").forEach(function (line) {
        var trimmed = line.trim();
        if (trimmed.indexOf("|") === -1) return;
        var cells = trimmed.replace(/^\|/, "").replace(/\|$/, "").split("|").map(function (c) { return c.trim(); });
        var label = cells[0] || "";
        var value = cells[1] || "";
        if (!value) return;
        if (/^Phase\s+\d/.test(label)) {
          // Dated rows ("Phase 1 at 2026-10-05") follow the phase's own row; the first one is the state.
          var key = label.match(/\d+/)[0];
          if (states[key] === undefined) states[key] = value;
        } else {
          var range = label.match(/^Phases?\s+(\d+)\s*[\u2013\u2014-]\s*(\d+)/);
          if (range) {
            for (var n = Number(range[1]); n <= Number(range[2]); n++) states[n] = value;
          }
        }
      });
    }

    // Long-form body for each phase, used by the expandable details. The match
    // is deliberately not anchored to the end of the chunk, which is
    // multi-line, so it is restricted to the heading line only.
    var bodies = {};
    var sections = text.split(/\n(?=##\s)/);
    sections.forEach(function (chunk) {
      var m = chunk.match(/^##\s+\d+\.\s+Phase\s+(\d+)\s*[\u2014\u2013-]\s*([^\n]+)/);
      if (!m) return;
      var body = chunk.split("\n").slice(1).join("\n")
        .replace(/^\*\*Status:.*$/m, "")
        .trim();
      bodies[m[1]] = { name: m[2].trim(), body: body };
    });

    var numbers = Object.keys(summary).sort(function (a, b) { return Number(a) - Number(b); });
    if (!numbers.length) {
      numbers = Object.keys(bodies).sort(function (a, b) { return Number(a) - Number(b); });
    }

    var LABELS = {
      complete: "Complete", active: "In progress", progress: "In progress",
      blocked: "Blocked", "not started": "Planned"
    };

    var meter = [];
    numbers.forEach(function (num) {
      var info = summary[num] || bodies[num] || {};
      var rawState = states[num] || "";
      var key = /complete/i.test(rawState) ? "complete"
        : /active|in progress/i.test(rawState) ? "progress"
        : /block/i.test(rawState) ? "blocked"
        : "planned";
      var label = rawState.replace(/\*\*/g, "").split("—")[0].trim() ||
        (LABELS[key] || "Planned");

      meter.push({ num: num, name: info.name || "Phase " + num, key: key });

      var phase = el("article", "phase phase--" + (key === "progress" ? "current" : key === "complete" ? "done" : "todo"));
      phase.id = "phase-" + num;

      var rail = el("div", "phase__rail");
      rail.appendChild(el("span", "phase__node"));
      rail.appendChild(el("p", "phase__num", "Phase " + num));
      phase.appendChild(rail);

      var body = el("div", "phase__body");
      body.appendChild(el("h3", "phase__title", info.name || "Phase " + num));

      var meta = el("div", "phase__meta");
      var state = el("span", "state state--" + key);
      state.appendChild(el("span", null, LABELS[key] || "Planned"));
      meta.appendChild(state);
      body.appendChild(meta);

      if (info.goal) body.appendChild(el("p", "phase__goal", plain(info.goal)));

      var bodyText = bodies[num] ? bodies[num].body : "";
      if (bodyText) {
        var details = el("details", "phase__details");
        details.id = "phase-" + num + "-details";
        details.appendChild(el("summary", null, "Phase detail"));
        // Rendered on first open, like the changelog, so the timeline itself
        // stays cheap even though every phase carries a full document section.
        details.addEventListener("toggle", function () {
          if (!details.open || details.querySelector(".markdown-body")) return;
          var md = el("div", "markdown-body");
          md.innerHTML = renderMarkdown(bodyText);
          details.appendChild(md);
        });
        body.appendChild(details);
      }

      if (info.exit) {
        var exit = el("p", "phase__exit");
        exit.appendChild(el("strong", null, "Exit criterion: "));
        exit.appendChild(el("span", null, plain(info.exit)));
        body.appendChild(exit);
      }

      phase.appendChild(body);
      host.appendChild(phase);
    });

    renderRoadmapMeter(meter);
    host.setAttribute("aria-busy", "false");
  }  /* ------------------------------------------------------ in-engine captures */

  var SCREENSHOTS = "data/screenshots.json";

  function formatDate(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
    if (!m) return iso || "";
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return Number(m[3]) + " " + months[Number(m[2]) - 1] + " " + m[1];
  }

  function renderCaptures(data) {
    var host = document.getElementById("capture-gallery");
    if (!host) return;
    var shots = (data && data.screenshots) || [];
    host.setAttribute("aria-busy", "false");
    // With nothing published the static note in the HTML stays as it is.
    if (!shots.length) return;
    clear(host);

    var list = el("ul", "gallery gallery--captures");
    list.setAttribute("role", "list");
    shots.forEach(function (shot, index) {
      // Each file carries its real pixel width, smallest first.
      var files = (shot.files || []).slice().sort(function (a, b) { return a.width - b.width; });
      if (!files.length && !shot.animated) return;
      var largest = shot.animated ? shot.animated.replace(/\.webp$/, "") : files[files.length - 1].path;
      var srcset = function (ext) {
        return files.map(function (f) { return f.path + "." + ext + " " + f.width + "w"; }).join(", ");
      };
      var where = [shot.map, formatDate(shot.captured), shot.session ? "Session " + shot.session : ""]
        .filter(Boolean).join(" · ");

      // The newest capture leads at full width; the rest share the grid.
      var item = el("li", "gallery__item" + (index === 0 ? " gallery__item--wide" : ""));
      var button = el("button", "gallery__btn");
      button.type = "button";
      button.setAttribute("data-lightbox-src", largest + (shot.animated ? ".webp" : ".jpg"));
      button.setAttribute("data-lightbox-alt", shot.alt);
      button.setAttribute("data-lightbox-caption",
        shot.title + (shot.animated ? " — in-engine clip, pre-alpha build. " : " — in-engine capture, pre-alpha build. ") + where + "." +
        (shot.note ? " " + shot.note : ""));

      var picture = el("picture");
      var sizes = index === 0 ? "(max-width: 1240px) 100vw, 1240px" : "(max-width: 700px) 100vw, 420px";
      (shot.animated ? [] : ["avif", "webp"]).forEach(function (ext) {
        var source = el("source");
        source.type = "image/" + ext;
        source.srcset = srcset(ext);
        source.sizes = sizes;
        picture.appendChild(source);
      });
      var img = el("img");
      img.src = shot.animated || files[0].path + ".jpg";
      if (!shot.animated) img.srcset = srcset("jpg");
      img.sizes = sizes;
      img.width = shot.width;
      img.height = shot.height;
      img.alt = shot.alt;
      img.loading = "lazy";
      img.decoding = "async";
      picture.appendChild(img);
      button.appendChild(picture);

      var meta = el("span", "gallery__meta gallery__meta--capture");
      meta.appendChild(el("span", "badge badge--capture", shot.animated ? "In-engine clip" : "In-engine"));
      var text = el("span", "gallery__meta-text");
      text.appendChild(el("span", "gallery__meta-title", shot.title));
      text.appendChild(el("span", "gallery__meta-where", where));
      meta.appendChild(text);
      button.appendChild(meta);

      item.appendChild(button);
      list.appendChild(item);
    });
    host.appendChild(list);
    host.appendChild(el("p", "captures__note",
      "Work in progress: captured from the pre-alpha build on the date shown, and not representative " +
      "of final quality."));
  }

  /* --------------------------------------------------------- roadmap meter */

  /* A one-line overview of the seven phases above the timeline. It shows each
     phase's state as the roadmap records it and nothing more: the project
     tracks no completion percentage, so none is drawn or implied. */
  function renderRoadmapMeter(phases) {
    var host = document.getElementById("roadmap-meter");
    if (!host || !phases.length) return;
    clear(host);

    var done = phases.filter(function (p) { return p.key === "complete"; }).length;
    var current = phases.filter(function (p) { return p.key === "progress"; });
    var summary = done + " of " + phases.length + " phases complete";
    if (current.length) {
      summary += " · " + current.map(function (p) { return "Phase " + p.num; }).join(", ") + " in progress";
    }
    host.appendChild(el("p", "roadmap-meter__summary", summary));

    var LABELS = { complete: "Complete", progress: "In progress", blocked: "Blocked", planned: "Planned" };
    var list = el("ol", "roadmap-meter__track");
    phases.forEach(function (phase) {
      var li = el("li", "roadmap-meter__step roadmap-meter__step--" + phase.key);
      var link = el("a", "roadmap-meter__link");
      link.href = "#phase-" + phase.num;
      link.appendChild(el("span", "roadmap-meter__bar"));
      link.appendChild(el("span", "roadmap-meter__num", String(phase.num)));
      link.appendChild(el("span", "roadmap-meter__name", phase.name));
      link.appendChild(el("span", "u-visually-hidden", ": " + (LABELS[phase.key] || "Planned")));
      li.appendChild(link);
      list.appendChild(li);
    });
    host.appendChild(list);
    host.hidden = false;
  }

  /* ----------------------------------------------------- development pulse */

  /* Plain counts read from the changelog: how many sessions are recorded and
     the span of dates they cover. Every figure is a count or a date taken from
     the log, never an estimate. */
  function renderPulse(sessions) {
    var host = document.getElementById("dev-pulse");
    if (!host || !sessions || !sessions.length) return;
    clear(host);
    var dated = sessions.filter(function (s) { return s.date; })
      .map(function (s) { return s.date; }).sort();
    var first = dated[0];
    var last = dated[dated.length - 1];
    var stats = [
      { value: String(sessions.length), label: "Working sessions recorded" },
      { value: formatDate(first), label: "First session" },
      { value: formatDate(last), label: "Latest session" }
    ];
    stats.forEach(function (stat) {
      var node = el("div", "pulse__stat");
      node.appendChild(el("dt", "pulse__label", stat.label));
      node.appendChild(el("dd", "pulse__value", stat.value));
      host.appendChild(node);
    });
    host.hidden = false;
  }

  /* -------------------------------------------------------------- changelog */

  /* The changelog now lives on changelog.html. This file is shared by both
     pages: on the home page a small "latest session" panel renders from the
     same fetch, and the full search / filter log renders only where its
     controls exist. */

  function renderLatestUpdate(sessions) {
    var host = document.getElementById("latest-update");
    if (!host) return;
    clear(host);

    var latest = sessions[0];
    if (!latest) {
      var none = el("p", "error-note");
      none.appendChild(document.createTextNode("No sessions are recorded yet."));
      host.appendChild(none);
      host.setAttribute("aria-busy", "false");
      return;
    }

    var node = el("article", "session session--latest latest-update__session");
    node.id = latest.slug;

    var summary = el("div", "latest-update__head");
    summary.appendChild(el("p", "session__date", latest.date || "\u2014"));
    var tags = el("div", "session__tags");
    tags.appendChild(el("span", "badge badge--wip", "Latest update"));
    summary.appendChild(tags);
    node.appendChild(summary);

    node.appendChild(el("h3", "session__title", latest.title || latest.heading));

    var completed = listItems(sectionOf(latest.source, "COMPLETED"), 4);
    if (completed.length) {
      var ul = el("ul", "latest-update__points");
      completed.forEach(function (item) {
        var li = el("li");
        li.innerHTML = inline(item);
        ul.appendChild(li);
      });
      node.appendChild(ul);
    }

    var nextAction = plain(sectionOf(latest.source, "NEXT ACTION"));
    if (nextAction) {
      var next = el("p", "latest-update__next");
      next.appendChild(el("strong", null, "Next: "));
      next.appendChild(document.createTextNode(clip(nextAction, 260)));
      node.appendChild(next);
    }

    var actions = el("p", "latest-update__actions");
    var more = el("a", "btn btn--brass btn--sm", "Read the full session");
    more.href = "changelog.html#" + latest.slug;
    actions.appendChild(more);
    var all = el("a", "btn btn--outline btn--sm", "Every session");
    all.href = "changelog.html";
    actions.appendChild(all);
    node.appendChild(actions);

    host.appendChild(node);
    host.setAttribute("aria-busy", "false");
  }

  function renderChangelog(sessions) {
    var host = document.getElementById("changelog-list");
    var filterHost = document.getElementById("changelog-filters");
    var search = document.getElementById("changelog-search");
    var count = document.getElementById("changelog-count");
    var empty = document.getElementById("changelog-empty");
    // A page without the search controls is not the changelog page; there is
    // nothing for the log to bind to there.
    if (!host || !filterHost || !search) return;

    clear(host);

    // Bodies are rendered on first open. Thirty fully rendered sessions is
    // several thousand DOM nodes before the reader has scrolled to them; the
    // search index and the filters are built from the session source instead.
    // Only the two most recent stay eager, which is all the fold needs and
    // keeps the document under the size where style recalculation starts to
    // show up in Total Blocking Time.
    var EAGER = 2;

    function buildBody(node, session) {
      var body = el("div", "session__body markdown-body");
      body.innerHTML = renderMarkdown(session.body);

      var actions = el("div", "session__actions");
      var anchor = el("a", "session__link", "Link to this session");
      anchor.href = "#" + session.slug;
      actions.appendChild(anchor);

      var copy = el("button", "session__link", "Copy link");
      copy.type = "button";
      copy.addEventListener("click", function () {
        // Canonical home is changelog.html, where the full log now lives.
        var url = window.location.origin +
                  window.location.pathname.replace(/[^/]*$/, "changelog.html") +
                  "#" + session.slug;
        var reset = function (text) {
          copy.textContent = text;
          window.setTimeout(function () { copy.textContent = "Copy link"; }, 2000);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(function () { reset("Link copied"); },
            function () { reset("Copy failed"); });
        } else {
          reset("Link copied");
        }
      });
      actions.appendChild(copy);
      body.appendChild(actions);
      node.appendChild(body);
    }

    var records = sessions.map(function (session, index) {
      var node = el("details", "session" + (index === 0 ? " session--latest" : ""));
      node.id = session.slug;
      node.setAttribute("data-date", session.date);
      node.setAttribute("data-search", plain(session.source).toLowerCase());
      node.setAttribute("data-categories", categoriesFor(session).join(" "));

      var summary = el("summary", "session__summary");
      summary.appendChild(el("span", "session__date", session.date || "—"));
      var main = el("div");
      main.appendChild(el("h3", "session__title", session.title || session.heading));
      if (index === 0) {
        var tags = el("div", "session__tags");
        tags.appendChild(el("span", "badge badge--wip", "Latest update"));
        main.appendChild(tags);
      }
      summary.appendChild(main);
      node.appendChild(summary);

      if (index < EAGER) {
        buildBody(node, session);
      } else {
        node.addEventListener("toggle", function () {
          if (node.open && !node.querySelector(".session__body")) buildBody(node, session);
        });
      }

      return {
        node: node,
        session: session,
        date: session.date,
        categories: node.getAttribute("data-categories").split(" "),
        haystack: node.getAttribute("data-search")
      };
    });

    var currentDay = null;
    var group = null;
    records.forEach(function (record) {
      if (record.date !== currentDay) {
        currentDay = record.date;
        group = el("div", "day-group");
        var label = el("h3", "day-group__label", currentDay || "Undated");
        group.appendChild(label);
        host.appendChild(group);
      }
      group.appendChild(record.node);
    });

    // Filters, built from the categories actually present.
    var present = {};
    records.forEach(function (record) {
      record.categories.forEach(function (id) { present[id] = (present[id] || 0) + 1; });
    });
    var all = el("button", "filter", "All");
    all.type = "button";
    all.setAttribute("aria-pressed", "true");
    all.appendChild(el("span", "filter__count", String(records.length)));
    filterHost.appendChild(all);

    var active = "all";
    var term = "";

    Object.keys(present).sort().forEach(function (id) {
      var meta = CATEGORIES.filter(function (c) { return c.id === id; })[0];
      var button = el("button", "filter", (meta ? meta.label : "Development"));
      button.type = "button";
      button.setAttribute("aria-pressed", "false");
      button.setAttribute("data-filter", id);
      button.appendChild(el("span", "filter__count", String(present[id])));
      filterHost.appendChild(button);
    });

    function apply() {
      var shown = 0;
      records.forEach(function (record) {
        var matchesTerm = !term || record.haystack.indexOf(term) !== -1;
        var matchesCat = active === "all" || record.categories.indexOf(active) !== -1;
        var show = matchesTerm && matchesCat;
        record.node.hidden = !show;
        if (show) shown++;
      });
      // Hide day headings that no longer contain a visible session.
      Array.prototype.forEach.call(host.querySelectorAll(".day-group"), function (dayGroup) {
        var any = Array.prototype.some.call(dayGroup.querySelectorAll(".session:not(.latest-update__session)"), function (n) { return !n.hidden; });
        dayGroup.hidden = !any;
      });
      count.textContent = shown === records.length
        ? records.length + " sessions"
        : shown + " of " + records.length + " sessions match";

      // An empty result set needs to say so, and offer a way out, rather than
      // leaving a blank column under a count of zero.
      if (empty) empty.hidden = shown !== 0;
    }

    function resetFilters() {
      active = "all";
      term = "";
      if (search) search.value = "";
      Array.prototype.forEach.call(filterHost.querySelectorAll(".filter"), function (b) {
        b.setAttribute("aria-pressed", b.getAttribute("data-filter") === "all" ? "true" : "false");
      });
      apply();
      if (search) search.focus();
    }
    if (empty) {
      var reset = empty.querySelector("[data-changelog-reset]");
      if (reset) reset.addEventListener("click", resetFilters);
    }

    filterHost.addEventListener("click", function (event) {
      var button = event.target.closest(".filter");
      if (!button) return;
      active = button.getAttribute("data-filter") || "all";
      Array.prototype.forEach.call(filterHost.querySelectorAll(".filter"), function (b) {
        b.setAttribute("aria-pressed", b === button ? "true" : "false");
      });
      apply();
    });

    if (search) {
      var debounce;
      search.addEventListener("input", function () {
        window.clearTimeout(debounce);
        debounce = window.setTimeout(function () {
          term = search.value.trim().toLowerCase();
          apply();
        }, 140);
      });
    }

    // Exposed so a deep link into a filtered-out session can clear the filter
    // and reveal itself.
    clearChangelogFilters = function () {
      resetFilters();
      if (search) search.blur();
    };

    host.setAttribute("aria-busy", "false");
    apply();
    revealFragment();
  }

  /* -------------------------------------------------------------- fragments */

  // The roadmap and changelog are rendered after load, so the browser's own
  // fragment navigation runs before their anchors exist and silently gives up.
  // This re-runs it once the content is in the DOM, expands whatever was
  // linked to, and clears any active filter that would hide the target.
  var clearChangelogFilters = null;
  var fragmentTimer = null;

  function revealFragment() {
    window.clearTimeout(fragmentTimer);
    // The two documents resolve independently; retry briefly so a link into
    // the changelog still lands if the roadmap fetch is the slow one.
    fragmentTimer = window.setTimeout(function () {
      var id = (window.location.hash || "").replace(/^#/, "");
      if (!id) return;

      // The full log moved to changelog.html, so an old /#session-NNN link
      // forwards there instead of failing silently on the home page.
      if (/^session-/.test(id) && !document.getElementById(id)) {
        window.location.replace(
          window.location.pathname.replace(/[^/]*$/, "changelog.html") + "#" + id);
        return;
      }

      var target = document.getElementById(id);
      if (!target) return;

      if (target.classList.contains("session")) {
        // A live search or filter would keep the target hidden.
        var list = document.getElementById("changelog-list");
        if (list && target.hidden && clearChangelogFilters) clearChangelogFilters();
        target.hidden = false;
        if ("open" in target) target.open = true;
        if (!target.querySelector(".session__body")) {
          target.dispatchEvent(new Event("toggle"));
        }
      } else if (target.classList.contains("phase")) {
        var details = target.querySelector(".phase__details");
        if (details) {
          details.open = true;
          if (!details.querySelector(".markdown-body")) {
            details.dispatchEvent(new Event("toggle"));
          }
        }
      } else {
        // A section or element link (e.g. #roadmap, #faq). Nothing to expand,
        // but the anchor was resolved before the roadmap and changelog were
        // fetched, so it needs the same correction as a phase or session.
      }

      var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      // The anchor is resolved before the documents are fetched, and the page
      // uses content-visibility, so a section's height is not known until the
      // browser lays it out. Scroll, then correct as the layout settles -
      // otherwise a section link lands where the section was before the
      // roadmap and changelog expanded underneath it.
      var header = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 68;
      var settle = function (left) {
        if (Math.abs(target.getBoundingClientRect().top - (header + 12)) > 8) {
          target.scrollIntoView({ behavior: "auto", block: "start" });
        }
        if (left > 0) window.setTimeout(function () { settle(left - 1); }, 120);
      };
      target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      window.setTimeout(function () { settle(6); }, reduce ? 0 : 220);
      // Move focus without a second scroll, so keyboard users continue from
      // the linked item rather than the top of the document.
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    }, 60);
  }

  /* ------------------------------------------------------------------ init */

  function init() {
    initReveal();
    initNav();
    initLightbox();
    window.addEventListener("hashchange", revealFragment);

    var year = document.getElementById("year");
    if (year) year.textContent = String(new Date().getFullYear());

    // Broken images should degrade to their alt text, not a broken icon.
    document.addEventListener("error", function (event) {
      var target = event.target;
      if (target && target.tagName === "IMG" && !target.dataset.failed) {
        target.dataset.failed = "true";
        target.style.opacity = "0.25";
      }
    }, true);

    var sessions = null;
    var changelogText = null;
    var statusPainted = false;

    // The status panel quotes both documents, so it waits for both. Whichever
    // request finishes last triggers the render.
    function renderStatusWhenReady() {
      if (statusPainted || !sessions || !roadmapText) return;
      statusPainted = true;
      try {
        renderStatus(sessions, changelogText);
      } catch (error) {
        reportError(document.getElementById("status"), "Development status", error.message);
      }
    }

    if (document.getElementById("capture-gallery")) {
      fetchText(SCREENSHOTS).then(function (text) {
        renderCaptures(JSON.parse(text));
      }).catch(function () {
        // No view model yet: the static "none published" note stays.
        var host = document.getElementById("capture-gallery");
        if (host) host.setAttribute("aria-busy", "false");
      });
    }

    fetchText(ROADMAP).then(function (text) {
      roadmapText = text;
      currentPhase = readCurrentPhase(text);
      try {
        renderRoadmap(text);
        var panel = document.querySelector(".doc-panel");
        if (panel) {
          panel.addEventListener("toggle", function () {
            var doc = document.getElementById("roadmap-doc");
            if (!panel.open || !doc || doc.childElementCount) return;
            doc.innerHTML = renderMarkdown(text);
          });
        }
      } catch (error) {
        reportError(document.getElementById("roadmap-phases"), "The roadmap", error.message);
      }
      renderStatusWhenReady();
    }).catch(function (error) {
      reportError(document.getElementById("roadmap-phases"), "The roadmap", error.message);
      reportError(document.getElementById("roadmap-doc"), "The roadmap document", error.message);
    }).then(revealFragment);

    fetchText(CHANGELOG).then(function (text) {
      changelogText = text;
      sessions = parseSessions(text);
      try {
        renderChangelog(sessions);
      } catch (error) {
        reportError(document.getElementById("changelog-list"), "The changelog", error.message);
      }
      // The home page's latest-session panel renders from the same fetch,
      // independently of whether this page has the full log's controls.
      try {
        renderPulse(sessions);
      } catch (error) {
        // The pulse is a summary of the log; if it fails the log still shows.
      }
      try {
        renderLatestUpdate(sessions);
      } catch (error) {
        reportError(document.getElementById("latest-update"), "The latest update", error.message);
      }
      renderStatusWhenReady();
    }).catch(function (error) {
      reportError(document.getElementById("changelog-list"), "The changelog", error.message);
      reportError(document.getElementById("latest-update"), "The latest update", error.message);
      reportError(document.getElementById("status"), "Development status", error.message);
    }).then(revealFragment);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
