// Southern Spear site: menu toggle, and status/changelog rendered from the
// project's own Markdown (published alongside this page by Tools/publish_site.py).
(function () {
  "use strict";

  // Scroll reveal: fade sections in as they enter the viewport.
  document.documentElement.classList.add("js");
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i % 6, 5) * 60 + "ms";
      if (el.closest(".hero")) {
        // Above the fold: animate in on load rather than on scroll.
        setTimeout(function () { el.classList.add("in"); }, 40);
      } else {
        io.observe(el);
      }
    });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  var btn = document.querySelector(".menu-btn");
  var links = document.getElementById("nav-links");
  if (btn && links) {
    btn.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A" && links.classList.contains("open")) {
        links.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
      }
    });
  }

  function md(text) {
    if (window.marked) {
      // Our own trusted repo docs; raw HTML is still stripped defensively.
      return window.marked.parse(text.replace(/<[^>]+>/g, ""));
    }
    var pre = document.createElement("pre");
    pre.textContent = text;
    return pre.outerHTML;
  }

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html !== undefined) n.innerHTML = html;
    return n;
  }

  function fail(target, what) {
    target.innerHTML = "";
    target.appendChild(el("p", null, "Could not load " + what + ". It is published with this site as <code>data/</code> Markdown."));
  }

  // Split the changelog into "## Session ..." sections, newest first.
  function sessions(text) {
    var parts = text.split(/\n(?=## )/);
    return parts.filter(function (p) { return /^## Session/.test(p); }).reverse();
  }

  function sectionOf(sessionText, heading) {
    var re = new RegExp("### " + heading + "\\s*\\n([\\s\\S]*?)(?=\\n### |\\n---|$)");
    var m = sessionText.match(re);
    return m ? m[1].trim() : "";
  }

  fetch("data/CHANGELOG.md").then(function (r) {
    if (!r.ok) throw new Error(r.status);
    return r.text();
  }).then(function (text) {
    var list = sessions(text);
    var box = document.getElementById("changelog-list");
    box.innerHTML = "";
    list.forEach(function (s, i) {
      var title = s.split("\n")[0].replace(/^## /, "");
      var d = el("details");
      if (i === 0) d.open = true;
      d.appendChild(el("summary", null, title.replace(/</g, "&lt;")));
      d.appendChild(el("div", "md", md(s.split("\n").slice(1).join("\n"))));
      box.appendChild(d);
    });

    var status = document.getElementById("status");
    status.innerHTML = "";
    if (list.length) {
      var latest = list[0];
      var cards = [
        ["Latest session", "**" + latest.split("\n")[0].replace(/^## /, "") + "**"],
        ["Next action", sectionOf(latest, "NEXT ACTION") || "Not recorded."],
        ["Open risks", sectionOf(latest, "RISKS") || "Not recorded."]
      ];
      cards.forEach(function (c) {
        var card = el("article", "card md");
        card.appendChild(el("h3", null, c[0]));
        card.appendChild(el("div", null, md(c[1])));
        status.appendChild(card);
      });
    }
  }).catch(function () {
    fail(document.getElementById("changelog-list"), "the changelog");
    fail(document.getElementById("status"), "the status");
  });

  fetch("data/DEVELOPMENT_ROADMAP.md").then(function (r) {
    if (!r.ok) throw new Error(r.status);
    return r.text();
  }).then(function (text) {
    document.getElementById("roadmap-doc").innerHTML = md(text);
  }).catch(function () {
    fail(document.getElementById("roadmap-doc"), "the roadmap");
  });
})();
