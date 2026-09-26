// ==========================================================================
// Auth pages: OTP input group + showcase counter animation
// ==========================================================================
(function () {
    "use strict";

    /* Shared OTP-input group behaviour (digit auto-advance, backspace, paste)
       — used by otp-verification.html and two-factor-authentication.html. */
    window.initOtpInputs = function (rootSelector) {
        var wrap = document.querySelector(rootSelector || "[data-otp]");
        if (!wrap) return;
        var inputs = Array.prototype.slice.call(wrap.querySelectorAll(".otp-input"));
        inputs.forEach(function (inp, i) {
            inp.addEventListener("input", function () {
                inp.value = inp.value.replace(/[^0-9]/g, "").slice(0, 1);
                inp.classList.toggle("is-filled", !!inp.value);
                if (inp.value && inputs[i + 1]) inputs[i + 1].focus();
            });
            inp.addEventListener("keydown", function (e) {
                if (e.key === "Backspace" && !inp.value && inputs[i - 1]) { inputs[i - 1].focus(); inputs[i - 1].value = ""; inputs[i - 1].classList.remove("is-filled"); }
            });
            inp.addEventListener("paste", function (e) {
                e.preventDefault();
                var digits = (e.clipboardData || window.clipboardData).getData("text").replace(/[^0-9]/g, "").split("");
                inputs.forEach(function (t, n) { if (digits[n] != null) { t.value = digits[n]; t.classList.add("is-filled"); } });
                var next = inputs[Math.min(digits.length, inputs.length - 1)];
                if (next) next.focus();
            });
        });
    };

    /* Counter animation for the showcase stats */
    function runCounters() {
        document.querySelectorAll("aside [data-count]").forEach(function (el) {
            var target = parseInt(el.getAttribute("data-count"), 10) || 0;
            var suffix = el.getAttribute("data-suffix") || "";
            var start = null, dur = 1100;
            function step(ts) {
                if (!start) start = ts;
                var p = Math.min((ts - start) / dur, 1);
                var eased = 1 - Math.pow(1 - p, 3);
                el.textContent = Math.round(eased * target) + (p === 1 ? suffix : "");
                if (p < 1) requestAnimationFrame(step);
            }
            requestAnimationFrame(step);
        });
    }
    var first = document.querySelector("aside [data-count]");
    if (first && "IntersectionObserver" in window) {
        var io = new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (e) { if (e.isIntersecting) { runCounters(); obs.disconnect(); } });
        }, { threshold: 0.4 });
        io.observe(first);
    } else { runCounters(); }

    /* Shared CTA loading state — for forms whose submit button has default/loading spans */
    document.addEventListener("submit", function (e) {
        var btn = e.target && e.target.querySelector ? e.target.querySelector("button[type=submit].lg-cta") : null;
        if (!btn) return;
        var d = btn.querySelector(".js-cta-default"), l = btn.querySelector(".js-cta-loading");
        if (d && l) { d.classList.add("hidden"); l.classList.remove("hidden"); l.classList.add("flex"); }
        btn.setAttribute("aria-busy", "true");
    });

    /* Shared mock "successful auth" redirect — forms marked
       data-submit-redirect="target.html" navigate there instead of submitting. */
    document.addEventListener("submit", function (e) {
        var target = e.target && e.target.getAttribute ? e.target.getAttribute("data-submit-redirect") : null;
        if (!target) return;
        e.preventDefault();
        window.location.href = target;
    });
})();













