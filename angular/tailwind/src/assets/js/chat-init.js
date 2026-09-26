// ==========================================================================
// chat-init.js — contact list search filter for chat.html
// ==========================================================================
(function () {
    "use strict";

    var input = document.getElementById("chat-contact-search");
    var list = document.getElementById("chat-contact-list");
    if (!input || !list) return;

    var items = Array.prototype.slice.call(list.querySelectorAll(".chat-contact-item"));
    var emptyState = document.getElementById("chat-contact-empty");

    input.addEventListener("input", function () {
        var query = input.value.trim().toLowerCase();
        var visibleCount = 0;

        items.forEach(function (item) {
            var name = (item.querySelector(".font-semibold") || {}).textContent || "";
            var isMatch = name.toLowerCase().indexOf(query) !== -1;
            item.classList.toggle("hidden", !isMatch);
            if (isMatch) visibleCount++;
        });

        if (emptyState) emptyState.classList.toggle("hidden", visibleCount !== 0);
    });
})();
