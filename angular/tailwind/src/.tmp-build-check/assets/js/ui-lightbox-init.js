// ==========================================================================
// ui-lightbox-init.js — lightweight, dependency-free image lightbox for
// ui-lightbox.html. Opens .image-popup / .image-popup-desc links (grouped
// per .preview-content block) in a full-screen overlay with prev/next nav.
// ==========================================================================
(function () {
    "use strict";

    var overlay, imgEl, captionEl, titleEl, descEl, prevBtn, nextBtn;
    var group = [];
    var index = 0;

    function build() {
        overlay = document.createElement("div");
        overlay.className = "ui-lightbox-overlay";
        overlay.innerHTML =
            '<button type="button" class="ui-lightbox-close" aria-label="Close"><i class="icon-x"></i></button>' +
            '<button type="button" class="ui-lightbox-nav ui-lightbox-prev" aria-label="Previous"><i class="icon-chevron-left"></i></button>' +
            '<div class="ui-lightbox-stage">' +
                '<img class="ui-lightbox-img" alt="">' +
                '<div class="ui-lightbox-caption"><h4 class="ui-lightbox-title"></h4><p class="ui-lightbox-desc"></p></div>' +
            "</div>" +
            '<button type="button" class="ui-lightbox-nav ui-lightbox-next" aria-label="Next"><i class="icon-chevron-right"></i></button>';
        document.body.appendChild(overlay);

        imgEl = overlay.querySelector(".ui-lightbox-img");
        captionEl = overlay.querySelector(".ui-lightbox-caption");
        titleEl = overlay.querySelector(".ui-lightbox-title");
        descEl = overlay.querySelector(".ui-lightbox-desc");
        prevBtn = overlay.querySelector(".ui-lightbox-prev");
        nextBtn = overlay.querySelector(".ui-lightbox-next");

        overlay.querySelector(".ui-lightbox-close").addEventListener("click", close);
        overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });
        prevBtn.addEventListener("click", function () { show(index - 1); });
        nextBtn.addEventListener("click", function () { show(index + 1); });
        document.addEventListener("keydown", function (e) {
            if (!overlay.classList.contains("is-open")) return;
            if (e.key === "Escape") close();
            else if (e.key === "ArrowLeft") show(index - 1);
            else if (e.key === "ArrowRight") show(index + 1);
        });
    }

    function show(i) {
        if (!group.length) return;
        index = (i + group.length) % group.length;
        var link = group[index];
        var img = link.querySelector("img");
        imgEl.src = link.getAttribute("href");
        imgEl.alt = img ? img.alt || "" : "";

        var title = link.getAttribute("data-title");
        var desc = link.getAttribute("data-description");
        captionEl.classList.toggle("hidden", !title && !desc);
        titleEl.textContent = title || "";
        titleEl.classList.toggle("hidden", !title);
        descEl.textContent = desc || "";
        descEl.classList.toggle("hidden", !desc);

        var multi = group.length > 1;
        prevBtn.classList.toggle("hidden", !multi);
        nextBtn.classList.toggle("hidden", !multi);
    }

    function open(link, links) {
        if (!overlay) build();
        group = links;
        show(links.indexOf(link));
        overlay.classList.add("is-open");
        document.documentElement.classList.add("overflow-hidden");
    }

    function close() {
        if (!overlay) return;
        overlay.classList.remove("is-open");
        document.documentElement.classList.remove("overflow-hidden");
    }

    document.addEventListener("click", function (e) {
        var link = e.target.closest(".image-popup, .image-popup-desc");
        if (!link) return;
        e.preventDefault();
        var selector = link.classList.contains("image-popup-desc") ? ".image-popup-desc" : ".image-popup";
        var wrap = link.closest(".preview-content") || document;
        var links = Array.prototype.slice.call(wrap.querySelectorAll(selector));
        open(link, links.length ? links : [link]);
    });
})();
