// ==========================================================================
// ui-rangeslider-init.js — wires up every slider demo on ui-rangeslider.html
// using the vendored noUiSlider library (assets/libs/nouislider).
// ==========================================================================
(function () {
    "use strict";
    if (typeof noUiSlider === "undefined") return;

    function round(v) { return Math.round(v); }
    function hex2(v) { return v.toString(16).padStart(2, "0"); }

    // 1) Basic single-handle sliders — also covers the 5 "Color Scheme" swatches,
    //    which share this class alongside a *-range color class.
    document.querySelectorAll(".rangeslider_basic").forEach(function (el) {
        if (el.noUiSlider) return;
        noUiSlider.create(el, {
            start: [20],
            connect: "lower",
            range: { min: 0, max: 100 }
        });
    });

    // 2) Multi element range
    var multiEl = document.getElementById("rangeslider_multielement");
    if (multiEl) {
        noUiSlider.create(multiEl, {
            start: [20, 80],
            connect: true,
            range: { min: 0, max: 100 }
        });
    }

    // 3) Value range slider with live lower/upper readouts
    var nonlinear = document.getElementById("nonlinear");
    if (nonlinear) {
        var lowerVal = document.getElementById("lower-value");
        var upperVal = document.getElementById("upper-value");
        noUiSlider.create(nonlinear, {
            start: [500, 4000],
            connect: true,
            step: 1,
            range: { min: 100, "50%": 4000, max: 10000 }
        });
        nonlinear.noUiSlider.on("update", function (values, handle) {
            var target = handle === 0 ? lowerVal : upperVal;
            if (target) target.textContent = round(values[handle]);
        });
    }

    // 4) Locking sliders together
    var slider1 = document.getElementById("slider1");
    var slider2 = document.getElementById("slider2");
    var span1 = document.getElementById("slider1-span");
    var span2 = document.getElementById("slider2-span");
    var lockBtn = document.getElementById("lockbutton");
    if (slider1 && slider2) {
        noUiSlider.create(slider1, { start: 30, range: { min: 0, max: 100 } });
        noUiSlider.create(slider2, { start: 60, range: { min: 0, max: 100 } });
        var locked = false;
        slider1.noUiSlider.on("update", function (values) {
            if (span1) span1.textContent = round(values[0]);
        });
        slider2.noUiSlider.on("update", function (values) {
            if (span2) span2.textContent = round(values[0]);
        });
        slider1.noUiSlider.on("slide", function (values) {
            if (locked) slider2.noUiSlider.setHandle(0, values[0], false, false);
        });
        slider2.noUiSlider.on("slide", function (values) {
            if (locked) slider1.noUiSlider.setHandle(0, values[0], false, false);
        });
        if (lockBtn) {
            lockBtn.addEventListener("click", function () {
                locked = !locked;
                lockBtn.textContent = locked ? "Unlock" : "Lock";
            });
        }
    }

    // 5) Merging tooltips
    var tooltipSlider = document.getElementById("slider-merging-tooltips");
    if (tooltipSlider) {
        noUiSlider.create(tooltipSlider, {
            start: [20, 80],
            connect: true,
            tooltips: [true, true],
            range: { min: 0, max: 100 }
        });
    }

    // 6) Soft limits — handle can be dragged fully to the ends, but 80% of the
    //    travel distance covers only the middle band, so small moves near the
    //    edges snap toward the true min/max.
    var softSlider = document.getElementById("soft");
    if (softSlider) {
        noUiSlider.create(softSlider, {
            start: 500,
            connect: [true, false],
            range: {
                min: [0],
                "10%": [100, 100],
                "90%": [900, 100],
                max: [1000]
            }
        });
    }

    // 7) RGB color picker
    var redEl = document.getElementById("red");
    var greenEl = document.getElementById("green");
    var blueEl = document.getElementById("blue");
    var resultEl = document.getElementById("result");
    if (redEl && greenEl && blueEl) {
        [redEl, greenEl, blueEl].forEach(function (el) {
            noUiSlider.create(el, {
                start: 127,
                connect: [true, false],
                step: 1,
                orientation: "vertical",
                direction: "rtl",
                range: { min: 0, max: 255 }
            });
        });
        var updateColor = function () {
            var r = round(redEl.noUiSlider.get());
            var g = round(greenEl.noUiSlider.get());
            var b = round(blueEl.noUiSlider.get());
            var hex = "#" + hex2(r) + hex2(g) + hex2(b);
            if (resultEl) {
                resultEl.style.background = hex;
                resultEl.textContent = hex;
            }
        };
        redEl.noUiSlider.on("update", updateColor);
        greenEl.noUiSlider.on("update", updateColor);
        blueEl.noUiSlider.on("update", updateColor);
    }

    // 8) Multi Range — three handles, vertical
    var multiRangeEl = document.getElementById("slider-vertical");
    if (multiRangeEl) {
        noUiSlider.create(multiRangeEl, {
            start: [20, 50, 80],
            connect: [false, true, true, false],
            orientation: "vertical",
            range: { min: 0, max: 100 }
        });
    }

    // 9) Vertical Range — connect to the upper edge
    var connectUpperEl = document.getElementById("slider-connect-upper");
    if (connectUpperEl) {
        noUiSlider.create(connectUpperEl, {
            start: 40,
            connect: "upper",
            orientation: "vertical",
            range: { min: 0, max: 100 }
        });
    }

    // 10) Vertical Tooltip
    var verticalTooltipEl = document.getElementById("slider-vertical-tooltip");
    if (verticalTooltipEl) {
        noUiSlider.create(verticalTooltipEl, {
            start: [30, 70],
            connect: true,
            tooltips: true,
            orientation: "vertical",
            range: { min: 0, max: 100 }
        });
    }
})();
