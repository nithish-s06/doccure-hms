// ==========================================================================
// ui-dragula-init.js — wires up the [data-plugin="dragula"] demo blocks on
// ui-dragula.html using the vendored Dragula library (assets/libs/dragula).
// ==========================================================================
(function () {
    "use strict";
    if (typeof dragula !== "function") return;

    document.querySelectorAll('[data-plugin="dragula"]').forEach(function (el) {
        var containers = [el];
        var raw = el.getAttribute("data-containers");
        if (raw) {
            try {
                var ids = JSON.parse(raw);
                var resolved = ids.map(function (id) { return document.getElementById(id); }).filter(Boolean);
                if (resolved.length) containers = resolved;
            } catch (e) { /* fall back to [el] */ }
        }

        var options = {};
        var handleClass = el.getAttribute("data-handleclass");
        if (handleClass) {
            options.moves = function (item, source, handle) {
                return !!(handle && handle.closest("." + handleClass));
            };
        }

        dragula(containers, options);
    });
})();
