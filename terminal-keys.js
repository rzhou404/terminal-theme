/* terminal-keys: vim-style keys for any page. Plain script, no build step, no dependencies.

   Use:  TerminalKeys.init({ links: "main a[href]", pages: ["/", "/about", "/contact"] })
   Or put data-links and data-pages (comma list) on the script tag and it starts by itself.

   Options (all optional):
     links        CSS selector for the links j/k move over   (default "main a[href]")
     pages        urls for keys 1-9
     statusLine   false to hide the bottom bar               (default true)
     selectedClass class put on the highlighted link          (default "kb-sel")
     home         url for q and h                            (default none)

   Keys: j/k or arrows move, Enter or l open, o new tab, d/u half page, gg/G ends, Esc clear.
   Ignored while typing in a field. Returns { destroy() } to remove everything it added. */
(function (root) {
  "use strict";
  function init(opt) {
    opt = opt || {};
    var sel = opt.links || "main a[href]";
    var pages = opt.pages || [];
    var cls = opt.selectedClass || "kb-sel";
    var idx = -1, last = "", links = [], pct = null, bar = null;

    if (opt.statusLine !== false) {
      bar = document.createElement("div");
      bar.className = "sl";
      bar.setAttribute("role", "status");
      bar.innerHTML =
        '<span><span class="mode">NORMAL</span> <kbd>j</kbd>/<kbd>k</kbd> links \u00b7 <kbd>enter</kbd> open \u00b7 ' +
        '<kbd>d</kbd>/<kbd>u</kbd> scroll \u00b7 <kbd>gg</kbd>/<kbd>G</kbd> ends' +
        (pages.length ? ' \u00b7 <kbd>1</kbd>-<kbd>' + pages.length + '</kbd> pages' : "") +
        ' \u00b7 <kbd>esc</kbd> clear</span><span class="pct">top</span>';
      document.body.appendChild(bar);
      pct = bar.querySelector(".pct");
    }

    function refresh() {
      links = [].slice.call(document.querySelectorAll(sel)).filter(function (a) { return a.offsetParent !== null; });
      if (idx >= links.length) idx = -1;
    }
    function upd() {
      if (!pct) return;
      var m = document.documentElement.scrollHeight - innerHeight;
      var pos = m <= 0 ? "all" : scrollY <= 0 ? "top" : scrollY >= m - 2 ? "bot" : Math.round((100 * scrollY) / m) + "%";
      pct.textContent = (idx >= 0 ? "link " + (idx + 1) + "/" + links.length + " \u00b7 " : "") + pos;
    }
    function pick(i) {
      if (links[idx]) links[idx].classList.remove(cls);
      idx = i;
      if (idx >= 0 && links[idx]) { links[idx].classList.add(cls); links[idx].scrollIntoView({ block: "nearest" }); }
      upd();
    }
    function open(blank) {
      var a = links[idx];
      if (!a) return;
      if (blank || a.target === "_blank") window.open(a.href, "_blank", "noopener");
      else a.click();
    }

    function onKey(ev) {
      var el = document.activeElement, t = el && el.tagName;
      if (ev.ctrlKey || ev.metaKey || ev.altKey || /INPUT|TEXTAREA|SELECT/.test(t) || (el && el.isContentEditable)) return;
      refresh();
      var k = ev.key, h = innerHeight / 2, n = links.length;
      var act = {
        j: function () { if (n) pick(idx < 0 ? 0 : Math.min(idx + 1, n - 1)); },
        k: function () { if (n) pick(idx < 0 ? n - 1 : Math.max(idx - 1, 0)); },
        l: function () { if (idx >= 0) open(false); },
        o: function () { if (idx >= 0) open(true); },
        Enter: function () { open(false); },
        Escape: function () { pick(-1); },
        d: function () { scrollBy(0, h); },
        u: function () { scrollBy(0, -h); },
        G: function () { scrollTo(0, document.documentElement.scrollHeight); }
      };
      act.ArrowDown = act.j; act.ArrowUp = act.k;
      if ((k === "q" || k === "h") && opt.home) { ev.preventDefault(); location.href = opt.home; return; }
      if (/^[1-9]$/.test(k) && pages[+k - 1]) { ev.preventDefault(); location.href = pages[+k - 1]; return; }
      if (k === "g") { if (last === "g") { scrollTo(0, 0); last = ""; } else last = "g"; return; }
      last = "";
      // Enter keeps its normal meaning (a focused button or link) unless a link is highlighted.
      if (k === "Enter" && idx < 0) return;
      if (act[k]) { ev.preventDefault(); act[k](); }
    }

    addEventListener("scroll", upd, { passive: true });
    addEventListener("keydown", onKey);
    upd();

    return {
      destroy: function () {
        removeEventListener("scroll", upd);
        removeEventListener("keydown", onKey);
        pick(-1);
        if (bar && bar.parentNode) bar.parentNode.removeChild(bar);
      }
    };
  }

  var api = { init: init };
  root.TerminalKeys = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;

  // Start from the script tag: <script src="terminal-keys.js" data-links="..." data-pages="/a,/b">
  var me = typeof document !== "undefined" && document.currentScript;
  if (me && me.dataset && (me.dataset.links || me.dataset.pages || me.dataset.home)) {
    var go = function () {
      init({
        links: me.dataset.links,
        pages: me.dataset.pages ? me.dataset.pages.split(",") : [],
        home: me.dataset.home
      });
    };
    if (document.body) go(); else document.addEventListener("DOMContentLoaded", go);
  }
})(typeof window !== "undefined" ? window : this);
