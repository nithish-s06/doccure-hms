// ==========================================================================
// expiry-tracking.js
// ==========================================================================
// Dreams HMS — Expiry Tracking
// Watches batches approaching expiry, banded by urgency, with value-at-risk
// and an audited disposal flow. Bands derive from days remaining. No API.
(function () {
    "use strict";
    if ((location.pathname.split("/").pop() || "index.html") !== "expiry-tracking.html") return;

    const $ = (id) => document.getElementById(id);
    const esc = (v) => String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

    // days < 0 means already expired (relative to today, 17 Jul 2026).
    let BATCHES = [
        { id: "EX-01", med: "Insulin Glargine", batch: "GLA26A2", location: "Cold Chain", qty: 60, days: -12, expiry: "05 Jul 2026", price: 8.4 },
        { id: "EX-02", med: "Adrenaline 1:1000", batch: "ADR25X9", location: "ED Satellite", qty: 25, days: -4, expiry: "13 Jul 2026", price: 3.1 },
        { id: "EX-03", med: "Augmentin Syrup", batch: "AUG26B4", location: "Main Pharmacy", qty: 220, days: 41, expiry: "27 Aug 2026", price: 0.9 },
        { id: "EX-04", med: "Humulin R", batch: "HUM26C8", location: "Cold Chain", qty: 480, days: 58, expiry: "13 Sep 2026", price: 6.2 },
        { id: "EX-05", med: "Ventolin Inhaler", batch: "VEN26K3", location: "ED Satellite", qty: 310, days: 74, expiry: "29 Sep 2026", price: 4.6 },
        { id: "EX-06", med: "Coumadin 5 mg", batch: "COU26A6", location: "Main Pharmacy", qty: 1600, days: 85, expiry: "10 Oct 2026", price: 0.19 },
        { id: "EX-07", med: "Zofran 4 mg", batch: "ZOF25Q1", location: "OR Store", qty: 90, days: 22, expiry: "08 Aug 2026", price: 0.74 },
        { id: "EX-08", med: "Tylenol 500 mg", batch: "TY26D077", location: "ED Satellite", qty: 900, days: 168, expiry: "01 Jan 2027", price: 0.08 },
        { id: "EX-09", med: "Ativan 2 mg/mL", batch: "ATV26F2", location: "OR Store", qty: 140, days: 132, expiry: "26 Nov 2026", price: 1.12 },
    ];

    // Urgency band derives from days remaining.
    function band(b) {
        if (b.days < 0) return { key: "expired", label: "Expired", badge: "badge-red", tone: "stock-out", rank: 0 };
        if (b.days <= 30) return { key: "30", label: "≤ 30 days", badge: "badge-red", tone: "stock-out", rank: 1 };
        if (b.days <= 90) return { key: "90", label: "≤ 90 days", badge: "badge-amber", tone: "stock-low", rank: 2 };
        return { key: "180", label: "≤ 180 days", badge: "badge-blue", tone: "stock-ok", rank: 3 };
    }

    const money = (n) => "$" + Math.round(n).toLocaleString();
    const atRisk = (b) => b.qty * b.price;

    function detailUrl(b) {
        return "expiry-item-detail.html?" + new URLSearchParams({
            id: b.id, med: b.med, batch: b.batch, location: b.location,
            qty: b.qty, days: b.days, expiry: b.expiry, price: b.price,
        }).toString();
    }

    function renderHero() {
        const expired = BATCHES.filter((b) => b.days < 0).length;
        const soon = BATCHES.filter((b) => b.days >= 0 && b.days <= 30).length;
        const flag =
            expired ? { cls: "tone-critical", text: expired + " Expired On Shelf" }
            : soon ? { cls: "tone-medium", text: "Rotation Needed" }
            : { cls: "tone-stable", text: "No Imminent Expiries" };
        $("ph-flag").className = "hms-chip " + flag.cls;
        $("ph-flag-text").textContent = flag.text;
        $("hero-summary").textContent = BATCHES.length + " batches watched · " + money(BATCHES.reduce((s, b) => s + atRisk(b), 0)) + " at risk";
    }

    function renderKpis() {
        const inBand = (k) => BATCHES.filter((b) => band(b).key === k);
        const expired = inBand("expired");
        const risk30 = inBand("30").reduce((s, b) => s + atRisk(b), 0);
        const totalRisk = BATCHES.reduce((s, b) => s + atRisk(b), 0);

        const cards = [
            { id: "kpi-watched", icon: "icon-calendar-clock", label: "Watched Batches", value: BATCHES.length, tone: "ph-primary", meta: "within 180 days" },
            { id: "kpi-expired", icon: "icon-circle-x", label: "Expired", value: expired.length, tone: "ph-danger", meta: "remove from shelf" },
            { id: "kpi-30", icon: "icon-triangle-alert", label: "≤ 30 Days", value: inBand("30").length, tone: "ph-amber", meta: money(risk30) + " at risk" },
            { id: "kpi-90", icon: "icon-clock", label: "≤ 90 Days", value: inBand("90").length, tone: "ph-sky", meta: "rotate to front" },
            { id: "kpi-180", icon: "icon-calendar", label: "≤ 180 Days", value: inBand("180").length, tone: "ph-violet", meta: "on the horizon" },
            { id: "kpi-risk", icon: "icon-dollar-sign", label: "Value at Risk", value: money(totalRisk), tone: "ph-slate", meta: "if all wasted" },
        ];

        $("kpi-row").innerHTML = cards
            .map((c) =>
                '<article class="ph-kpi ' + c.tone + '"><div class="ph-kpi-head"><span class="ph-kpi-icon"><i class="' + c.icon + '" aria-hidden="true"></i></span></div>' +
                '<p class="ph-kpi-value"><span id="' + c.id + '">' + c.value + '</span></p><p class="ph-kpi-label">' + c.label + "</p>" +
                '<p class="ph-kpi-meta"><i class="icon-circle-dot text-[8px]" aria-hidden="true"></i>' + c.meta + "</p></article>"
            )
            .join("");
    }

    // Rows are already present as static HTML (soonest-expiry-first, fixed
    // order). Filtering now only toggles visibility on the existing
    // [data-row-id] rows instead of rebuilding the table body.
    function renderGrid() {
        const q = $("search").value.trim().toLowerCase();
        const bd = $("filter-band").value;

        const matches = BATCHES.filter((b) => {
            const hit = !q || b.med.toLowerCase().includes(q) || b.batch.toLowerCase().includes(q);
            return hit && (!bd || band(b).key === bd);
        });
        const visible = new Set(matches.map((b) => b.id));

        $("grid-count").textContent = matches.length + (matches.length === 1 ? " batch" : " batches");

        let anyVisible = false;
        $("grid-body").querySelectorAll("[data-row-id]").forEach((tr) => {
            const show = visible.has(tr.dataset.rowId);
            tr.classList.toggle("hidden", !show);
            if (show) anyVisible = true;
        });
        const emptyRow = $("grid-empty-row");
        if (emptyRow) emptyRow.classList.toggle("hidden", anyVisible);
    }

    // Hero flag/summary and the 6 KPI cards are baked into the HTML for the
    // initial BATCHES state; renderHero()/renderKpis() are only invoked
    // again after a genuine mutation (batch disposal) below.
    function renderAll() {
        renderHero();
        renderKpis();
        renderGrid();
    }

    function openDispose(id) {
        const b = BATCHES.find((x) => x.id === id);
        if (!b) return;
        $("dm-sub").textContent = b.med + " · " + b.batch + " · " + b.qty.toLocaleString() + " units (" + money(atRisk(b)) + ")";
        $("dm-notes").value = "";
        $("dm-save").dataset.id = b.id;
        MC.openModal("dis-modal");
    }

    function init() {
        document.body.insertAdjacentHTML("beforeend", MC.deleteModalHTML);
        // Hero/KPIs are already correct in the static HTML for the initial
        // BATCHES state; only the watchlist grid needs an initial render.
        renderGrid();

        $("search").addEventListener("input", renderGrid);
        $("filter-band").addEventListener("change", renderGrid);

        $("grid-body").addEventListener("click", function (e) {
            const btn = e.target.closest("[data-act]");
            if (!btn) return;
            const b = BATCHES.find((x) => x.id === btn.dataset.id);
            if (!b) return;
            const act = btn.dataset.act;
            if (act === "dispose") openDispose(b.id);
            else if (act === "rotate") MC.toast(b.batch + " flagged first-out — pick before newer stock.", "success");
            else if (act === "return") MC.toast("Return raised for " + b.batch + " — supplier credit requested.", "info");
            else if (act === "discount") MC.toast(b.batch + " marked for clearance pricing.", "info");
        });

        $("btn-dispose").addEventListener("click", function () {
            const expired = BATCHES.filter((b) => b.days < 0);
            if (!expired.length) return MC.toast("No expired batches on the shelf.", "info");
            openDispose(expired[0].id);
        });
        $("btn-export").addEventListener("click", () => MC.toast("Expiry watchlist exported — " + BATCHES.length + " batches.", "success"));

        $("dm-cancel").addEventListener("click", () => MC.closeModal("dis-modal"));
        $("dm-save").addEventListener("click", function () {
            const b = BATCHES.find((x) => x.id === this.dataset.id);
            if (!b) return;
            BATCHES = BATCHES.filter((x) => x.id !== b.id);
            const rowEl = $("grid-body").querySelector('[data-row-id="' + b.id + '"]');
            if (rowEl) rowEl.remove();
            MC.closeModal("dis-modal");
            renderAll();
            MC.toast(b.batch + " disposed via " + $("dm-method").value.toLowerCase() + " — logged in the register.", "success");
        });

        MC.initDeleteModal();
        ["dis-modal", "del-modal"].forEach(MC.closeOnBackdrop);
        document.addEventListener("keydown", function (e) {
            if (e.key !== "Escape") return;
            ["dis-modal", "del-modal"].forEach(MC.closeModal);
        });
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
})();

// ==========================================================================
// inventory.js
// ==========================================================================
// NOTE: the two lines below (the opening IIFE wrapper here, and its closing
// "})();" just after the original file's last line) are NOT present in the
// original inventory.js — they were added only so this file's top-level
// declarations (SBADGE, data, nextId, editingId, rowHTML, updateStats,
// render, openAdd, openEdit, saveRecord, deleteRecord) get their own scope.
// pharmacy.js (merged below) declares the exact same top-level names;
// concatenating both as plain top-level module code is a SyntaxError
// ("Identifier has already been declared"). This wrapper is a scoping fix
// only — no page-anchor guard was added, and nothing else about the file's
// logic was changed. See the merge report for why that matters.
(function () {
if ((location.pathname.split("/").pop() || "index.html") !== "inventory.html") return;
const SBADGE = {
    Adequate: "text-success bg-success/10",
    "Low Stock": "text-warning bg-warning/10",
    "Out of Stock": "text-danger bg-danger/10",
};
let data = [
    {
        id: 1,
        name: "Surgical Gloves (Medium)",
        cat: "PPE",
        unit: "Box",
        stock: 180,
        reorder: 50,
        price: 8.5,
        supplier: "SafeMed Supplies",
        date: "2024-12-01",
        status: "Adequate",
    },
    {
        id: 2,
        name: "N95 Respirator Masks",
        cat: "PPE",
        unit: "Box",
        stock: 22,
        reorder: 30,
        price: 45.0,
        supplier: "ProtectPro",
        date: "2024-12-02",
        status: "Low Stock",
    },
    {
        id: 3,
        name: "IV Cannula 18G",
        cat: "Consumables",
        unit: "Pack",
        stock: 0,
        reorder: 100,
        price: 0.8,
        supplier: "MedSupply Co.",
        date: "2024-12-03",
        status: "Out of Stock",
    },
    {
        id: 4,
        name: "Hospital Bed Sheets",
        cat: "Linen",
        unit: "Piece",
        stock: 320,
        reorder: 100,
        price: 12.0,
        supplier: "TextileCare",
        date: "2024-12-01",
        status: "Adequate",
    },
    {
        id: 5,
        name: "Stethoscope (Classic)",
        cat: "Equipment",
        unit: "Piece",
        stock: 15,
        reorder: 5,
        price: 89.0,
        supplier: "MedEquip Ltd.",
        date: "2024-11-28",
        status: "Adequate",
    },
    {
        id: 6,
        name: "Alcohol-Based Hand Rub 500ml",
        cat: "Cleaning",
        unit: "Bottle",
        stock: 45,
        reorder: 60,
        price: 3.2,
        supplier: "HygieneFirst",
        date: "2024-12-04",
        status: "Low Stock",
    },
    {
        id: 7,
        name: "Surgical Masks (3-ply)",
        cat: "PPE",
        unit: "Box",
        stock: 280,
        reorder: 100,
        price: 6.0,
        supplier: "ProtectPro",
        date: "2024-12-02",
        status: "Adequate",
    },
    {
        id: 8,
        name: "BP Monitor (Digital)",
        cat: "Equipment",
        unit: "Piece",
        stock: 8,
        reorder: 3,
        price: 120.0,
        supplier: "MedEquip Ltd.",
        date: "2024-11-30",
        status: "Adequate",
    },
];
let nextId = 9,
    editingId = null;
function rowHTML(r) {
    return `<tr data-row-id="${r.id}"><td class="font-medium">${r.name}</td><td><span class="inline-block px-2 py-1 text-xs font-semibold rounded-lg whitespace-nowrap text-primary bg-primary/10">${r.cat}</span></td><td><span class="${r.stock <= r.reorder && r.stock > 0 ? "text-amber-600 font-semibold" : r.stock === 0 ? "text-red-600 font-semibold" : "text-gray-700 dark:text-gray-300"}">${r.stock}</span></td><td class="text-gray-500 dark:text-gray-400">${r.unit}</td><td class="text-gray-500 dark:text-gray-400">${r.reorder}</td><td class="text-gray-500 dark:text-gray-400 text-sm">${r.supplier}</td><td class="text-gray-500 dark:text-gray-400 text-sm">${r.date}</td><td><span class="inline-block px-2 py-1 text-xs font-semibold rounded-lg whitespace-nowrap ${SBADGE[r.status] || "text-gray-900 bg-light/60"}">${r.status}</span></td><td><div class="flex gap-1"><button onclick="openEdit(${r.id})" class="p-1.5 size-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400" title="Edit"><i class="icon-edit text-base"></i></button><button onclick="deleteRecord(${r.id},'${r.name}')" class="p-1.5 size-7 flex items-center justify-center rounded hover:bg-danger/20 dark:hover:bg-red-900/20 text-danger" title="Delete"><i class="icon-trash-2 text-base"></i></button></div></td></tr>`;
}
function updateStats() {
    document.getElementById("stat-total").textContent = data.length;
    document.getElementById("stat-ok").textContent = data.filter(
        (r) => r.status === "Adequate",
    ).length;
    document.getElementById("stat-low").textContent = data.filter(
        (r) => r.status === "Low Stock",
    ).length;
    document.getElementById("stat-out").textContent = data.filter(
        (r) => r.status === "Out of Stock",
    ).length;
}
function render(q = "", cat = "", status = "") {
    const matches = data.filter((r) => {
        const m = q
            ? r.name.toLowerCase().includes(q.toLowerCase()) ||
              r.supplier.toLowerCase().includes(q.toLowerCase())
            : true;
        return (
            m &&
            (cat ? r.cat === cat : true) &&
            (status ? r.status === status : true)
        );
    });
    document.getElementById("count").textContent =
        `${matches.length} of ${data.length}`;

    const visible = new Set(matches.map((r) => r.id));
    let anyVisible = false;
    document.querySelectorAll("#tbody [data-row-id]").forEach((tr) => {
        const show = visible.has(Number(tr.dataset.rowId));
        tr.classList.toggle("hidden", !show);
        if (show) anyVisible = true;
    });
    const emptyRow = document.getElementById("tbody-empty-row");
    if (emptyRow) emptyRow.classList.toggle("hidden", anyVisible);
}
function openAdd() {
    editingId = null;
    document.getElementById("m-title").textContent = "Add Item";
    document.getElementById("btn-save").textContent = "Add Item";
    document.getElementById("m-form").reset();
    document.getElementById("f-date").value = new Date()
        .toISOString()
        .split("T")[0];
    MC.openModal("form-modal");
}
function openEdit(id) {
    const r = data.find((x) => x.id === id);
    editingId = id;
    document.getElementById("m-title").textContent = "Edit Item";
    document.getElementById("btn-save").textContent = "Update";
    document.getElementById("f-name").value = r.name;
    document.getElementById("f-cat").value = r.cat;
    document.getElementById("f-unit").value = r.unit;
    document.getElementById("f-stock").value = r.stock;
    document.getElementById("f-reorder").value = r.reorder;
    document.getElementById("f-price").value = r.price;
    document.getElementById("f-supplier").value = r.supplier;
    document.getElementById("f-date").value = r.date;
    document.getElementById("f-status").value = r.status;
    MC.openModal("form-modal");
}
function saveRecord() {
    const name = document.getElementById("f-name").value.trim();
    if (!name) {
        MC.toast("Item name required", "error");
        return;
    }
    const rec = {
        name,
        cat: document.getElementById("f-cat").value,
        unit: document.getElementById("f-unit").value,
        stock: parseInt(document.getElementById("f-stock").value) || 0,
        reorder: parseInt(document.getElementById("f-reorder").value) || 0,
        price: parseFloat(document.getElementById("f-price").value) || 0,
        supplier: document.getElementById("f-supplier").value.trim(),
        date: document.getElementById("f-date").value,
        status: document.getElementById("f-status").value,
    };
    if (editingId) {
        const idx = data.findIndex((x) => x.id === editingId);
        data[idx] = { ...data[idx], ...rec };
        const existingEl = document.querySelector(
            '#tbody [data-row-id="' + editingId + '"]',
        );
        if (existingEl) existingEl.outerHTML = rowHTML(data[idx]);
        MC.toast("Item updated", "success");
    } else {
        const newRec = { id: nextId++, ...rec };
        data.push(newRec);
        const emptyRow = document.getElementById("tbody-empty-row");
        if (emptyRow) emptyRow.insertAdjacentHTML("beforebegin", rowHTML(newRec));
        else document.getElementById("tbody").insertAdjacentHTML("beforeend", rowHTML(newRec));
        MC.toast("Item added", "success");
    }
    MC.closeModal("form-modal");
    render(
        document.getElementById("search").value,
        document.getElementById("filter-cat").value,
        document.getElementById("filter-status").value,
    );
    updateStats();
}
function deleteRecord(id, name) {
    MC.confirmDelete(name, () => {
        data = data.filter((x) => x.id !== id);
        const rowEl = document.querySelector('#tbody [data-row-id="' + id + '"]');
        if (rowEl) rowEl.remove();
        render(
            document.getElementById("search").value,
            document.getElementById("filter-cat").value,
            document.getElementById("filter-status").value,
        );
        updateStats();
        MC.toast("Item removed", "success");
    });
}
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btn-add").onclick = openAdd;
    document.getElementById("btn-save").onclick = saveRecord;
    document.getElementById("m-close").onclick = () =>
        MC.closeModal("form-modal");
    document.getElementById("m-cancel").onclick = () =>
        MC.closeModal("form-modal");
    document
        .getElementById("search")
        .addEventListener("input", (e) =>
            render(
                e.target.value,
                document.getElementById("filter-cat").value,
                document.getElementById("filter-status").value,
            ),
        );
    document
        .getElementById("filter-cat")
        .addEventListener("change", (e) =>
            render(
                document.getElementById("search").value,
                e.target.value,
                document.getElementById("filter-status").value,
            ),
        );
    document
        .getElementById("filter-status")
        .addEventListener("change", (e) =>
            render(
                document.getElementById("search").value,
                document.getElementById("filter-cat").value,
                e.target.value,
            ),
        );
    MC.initDeleteModal();
    MC.closeOnBackdrop("form-modal");
    MC.closeOnBackdrop("del-modal");
});

})();

// ==========================================================================
// medicine-categories.js
// ==========================================================================
// Dreams HMS — Medicine Categories
// Manages the therapeutic taxonomy that groups the formulary. Every category
// metric (medicine count, stock health, value, controlled count) is derived
// from the category's medicine list, so the numbers always reconcile.
// Static demo data only — no API.
(function () {
    "use strict";
    if ((location.pathname.split("/").pop() || "index.html") !== "medicine-categories.html") return;

    const $ = (id) => document.getElementById(id);

    function esc(v) {
        return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
        });
    }

    function money(n) {
        if (n >= 1000) return "$" + (n / 1000).toFixed(1) + "k";
        return "$" + Number(n).toFixed(0);
    }

    /* ====================================================================
       Palette / icon options (shared with the Add/Edit swatch picker)
       ==================================================================== */

    const SWATCHES = [
        { cls: "cat-teal", icon: "icon-pill" },
        { cls: "cat-sky", icon: "icon-heart-pulse" },
        { cls: "cat-amber", icon: "icon-shield" },
        { cls: "cat-pink", icon: "icon-flask-round" },
        { cls: "cat-red", icon: "icon-syringe" },
        { cls: "cat-violet", icon: "icon-brain" },
        { cls: "cat-indigo", icon: "icon-wind" },
        { cls: "cat-cyan", icon: "icon-droplet" },
        { cls: "cat-orange", icon: "icon-eye" },
    ];

    /* ====================================================================
       Data — categories each own a list of medicines (name, stock, reorder,
       price, controlled). All category stats derive from these.
       ==================================================================== */

    let idSeq = 0;
    function cat(o) {
        idSeq++;
        return Object.assign({ id: "CAT-" + String(idSeq).padStart(2, "0"), status: "Active" }, o);
    }

    let CATS = [
        cat({
            name: "Analgesics", code: "ANL", cls: "cat-teal", icon: "icon-pill",
            desc: "Pain relief and antipyretics, from over-the-counter paracetamol to scheduled opioids.",
            meds: [
                { name: "Tylenol", stock: 8400, reorder: 2000, price: 0.08, ctrl: false },
                { name: "OxyContin", stock: 320, reorder: 400, price: 1.85, ctrl: true },
                { name: "Panadol", stock: 2600, reorder: 700, price: 0.15, ctrl: false },
                { name: "Cortisone Cream", stock: 1900, reorder: 600, price: 0.28, ctrl: false },
            ],
        }),
        cat({
            name: "Antibiotics", code: "ABX", cls: "cat-sky", icon: "icon-shield",
            desc: "Antibacterial agents for treating and preventing infection across body systems.",
            meds: [
                { name: "Amoxil", stock: 6100, reorder: 1500, price: 0.22, ctrl: false },
                { name: "Augmentin", stock: 610, reorder: 250, price: 0.9, ctrl: false },
                { name: "Ciprobay", stock: 3100, reorder: 900, price: 0.34, ctrl: false },
            ],
        }),
        cat({
            name: "Cardiovascular", code: "CVS", cls: "cat-red", icon: "icon-heart-pulse",
            desc: "Agents for hypertension, cholesterol, angina and other cardiac conditions.",
            meds: [
                { name: "Lipitor", stock: 5200, reorder: 1200, price: 0.31, ctrl: false },
                { name: "Norvasc", stock: 4800, reorder: 1200, price: 0.11, ctrl: false },
                { name: "Timoptic", stock: 430, reorder: 150, price: 1.4, ctrl: false },
            ],
        }),
        cat({
            name: "Respiratory", code: "RES", cls: "cat-indigo", icon: "icon-wind",
            desc: "Inhalers, bronchodilators and cough preparations for airway disease.",
            meds: [
                { name: "Ventolin", stock: 890, reorder: 300, price: 4.6, ctrl: false },
                { name: "Codeine Linctus", stock: 260, reorder: 150, price: 0.38, ctrl: true },
            ],
        }),
        cat({
            name: "Endocrine", code: "END", cls: "cat-amber", icon: "icon-flask-round",
            desc: "Diabetes, thyroid and hormone therapies including insulin.",
            meds: [
                { name: "Glucophage", stock: 7600, reorder: 2000, price: 0.06, ctrl: false },
                { name: "Humulin R", stock: 720, reorder: 250, price: 6.2, ctrl: false },
            ],
        }),
        cat({
            name: "Gastrointestinal", code: "GIT", cls: "cat-pink", icon: "icon-droplet",
            desc: "Acid suppression, antiemetics and agents for inflammatory bowel disease.",
            meds: [
                { name: "Nexium", stock: 3300, reorder: 900, price: 0.52, ctrl: false },
                { name: "Zofran", stock: 1450, reorder: 500, price: 0.74, ctrl: false },
                { name: "Salofalk", stock: 1200, reorder: 400, price: 0.63, ctrl: false },
            ],
        }),
        cat({
            name: "CNS", code: "CNS", cls: "cat-violet", icon: "icon-brain",
            desc: "Central nervous system drugs including anxiolytics, stimulants and sedatives.",
            meds: [
                { name: "Xanax", stock: 0, reorder: 250, price: 0.44, ctrl: true },
                { name: "Ativan", stock: 540, reorder: 200, price: 1.12, ctrl: true },
                { name: "Adderall", stock: 180, reorder: 300, price: 1.05, ctrl: true },
            ],
        }),
        cat({
            name: "Anticoagulants", code: "ACG", cls: "cat-cyan", icon: "icon-droplet",
            desc: "Blood-thinning agents for thromboprophylaxis and treatment.",
            meds: [
                { name: "Coumadin", stock: 2100, reorder: 800, price: 0.19, ctrl: false },
                { name: "Eliquis", stock: 940, reorder: 300, price: 3.1, ctrl: false },
            ],
        }),
        cat({
            name: "Ophthalmic", code: "OPH", cls: "cat-orange", icon: "icon-eye",
            desc: "Eye drops and ointments for glaucoma, infection and dry-eye management.",
            meds: [
                { name: "Xalatan", stock: 640, reorder: 200, price: 2.1, ctrl: false },
                { name: "Tobradex", stock: 410, reorder: 150, price: 3.45, ctrl: false },
                { name: "Restasis", stock: 95, reorder: 120, price: 5.8, ctrl: false },
            ],
        }),
    ];

    /* ====================================================================
       Derived metrics (single source of truth)
       ==================================================================== */

    function medStatus(m) {
        if (m.stock <= 0) return "out";
        if (m.stock <= m.reorder) return "low";
        return "ok";
    }

    // Computes every headline figure for a category from its medicine list.
    function stats(c) {
        const total = c.meds.length;
        const out = c.meds.filter((m) => medStatus(m) === "out").length;
        const low = c.meds.filter((m) => medStatus(m) === "low").length;
        const ok = total - out - low;
        const controlled = c.meds.filter((m) => m.ctrl).length;
        const value = c.meds.reduce((s, m) => s + m.stock * m.price, 0);
        // Health = share of drugs in stock, blended with a half-weight for low.
        const health = total ? Math.round(((ok + low * 0.5) / total) * 100) : 100;
        return { total: total, ok: ok, low: low, out: out, controlled: controlled, value: value, health: health };
    }

    function healthTone(pct) {
        if (pct >= 85) return { badge: "badge-green", label: "Healthy", tone: "tone-stable" };
        if (pct >= 60) return { badge: "badge-amber", label: "Watch", tone: "tone-medium" };
        return { badge: "badge-red", label: "At Risk", tone: "tone-critical" };
    }

    function detailUrl(c) {
        return "medicine-category-detail.html?" + new URLSearchParams({
            id: c.id, name: c.name, code: c.code, status: c.status,
        }).toString();
    }

    /* ====================================================================
       State
       ==================================================================== */

    let mode = "grid";
    let editingId = null;
    let pickCls = SWATCHES[0].cls;
    let pickIcon = SWATCHES[0].icon;

    function visible() {
        const q = $("search").value.trim().toLowerCase();
        const status = $("filter-status").value;
        const sort = $("sort").value;

        const rows = CATS.filter(function (c) {
            const hit = !q || c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
            return hit && (!status || c.status === status);
        });

        rows.sort(function (a, b) {
            if (sort === "count") return stats(b).total - stats(a).total;
            if (sort === "value") return stats(b).value - stats(a).value;
            if (sort === "health") return stats(a).health - stats(b).health; // worst first
            return a.name.localeCompare(b.name);
        });
        return rows;
    }

    /* ====================================================================
       SVG health ring — circumference 100 so dasharray reads as a percentage
       ==================================================================== */

    function ring(pct, cls) {
        return (
            '<svg class="ph-cat-ring ' + cls + '" viewBox="0 0 36 36" aria-hidden="true" focusable="false">' +
            '<circle class="ph-cat-ring-track" cx="18" cy="18" r="15.9155" fill="none" stroke="currentColor" stroke-width="3"></circle>' +
            '<circle cx="18" cy="18" r="15.9155" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" ' +
            'stroke-dasharray="' + pct + ' 100"></circle></svg>'
        );
    }

    /* ====================================================================
       Hero + KPIs
       ==================================================================== */

    function renderHero() {
        const active = CATS.filter((c) => c.status === "Active").length;
        const atRisk = CATS.filter((c) => stats(c).health < 60).length;
        const flag =
            atRisk >= 2 ? { cls: "tone-critical", text: atRisk + " Categories At Risk" }
            : atRisk === 1 ? { cls: "tone-medium", text: "1 Category At Risk" }
            : { cls: "tone-stable", text: "Taxonomy Healthy" };
        $("ph-flag").className = "hms-chip " + flag.cls;
        $("ph-flag-text").textContent = flag.text;
        $("hero-summary").textContent = active + " active categories · " + CATS.reduce((s, c) => s + c.meds.length, 0) + " medicines";
    }

    function renderKpis() {
        const total = CATS.length;
        const meds = CATS.reduce((s, c) => s + c.meds.length, 0);
        const controlled = CATS.filter((c) => stats(c).controlled > 0).length;
        const atRisk = CATS.filter((c) => stats(c).health < 60).length;
        const value = CATS.reduce((s, c) => s + stats(c).value, 0);
        const largest = CATS.slice().sort((a, b) => stats(b).total - stats(a).total)[0];

        const cards = [
            { id: "kpi-cats", icon: "icon-layers", label: "Categories", value: total, tone: "ph-primary", meta: "in taxonomy" },
            { id: "kpi-meds", icon: "icon-pill", label: "Total Medicines", value: meds, tone: "ph-sky", meta: "classified" },
            { id: "kpi-largest", icon: "icon-crown", label: "Largest", value: largest.code, tone: "ph-violet", meta: stats(largest).total + " medicines" },
            { id: "kpi-controlled", icon: "icon-shield", label: "With Controlled", value: controlled, tone: "ph-amber", meta: "hold scheduled drugs" },
            { id: "kpi-risk", icon: "icon-triangle-alert", label: "At Risk", value: atRisk, tone: "ph-danger", meta: "low stock health" },
            { id: "kpi-value", icon: "icon-dollar-sign", label: "Stock Value", value: money(value), tone: "ph-slate", meta: "across categories" },
        ];

        $("kpi-row").innerHTML = cards
            .map(function (c) {
                return (
                    '<article class="ph-kpi ' + c.tone + '">' +
                    '<div class="ph-kpi-head"><span class="ph-kpi-icon"><i class="' + c.icon + '" aria-hidden="true"></i></span></div>' +
                    '<p class="ph-kpi-value"><span id="' + c.id + '">' + c.value + "</span></p>" +
                    '<p class="ph-kpi-label">' + c.label + "</p>" +
                    '<p class="ph-kpi-meta"><i class="icon-circle-dot text-[8px]" aria-hidden="true"></i>' + c.meta + "</p></article>"
                );
            })
            .join("");
    }

    /* ====================================================================
       Grid view (cards)
       ==================================================================== */

    function renderGrid(rows) {
        $("cat-grid").innerHTML = rows
            .map(function (c) {
                const s = stats(c);
                const h = healthTone(s.health);
                const samples = c.meds.slice(0, 3).map((m) => '<span class="ph-pill">' + esc(m.name) + "</span>").join("");
                const more = c.meds.length > 3 ? '<span class="ph-pill">+' + (c.meds.length - 3) + "</span>" : "";

                return (
                    '<article class="ph-cat ' + c.cls + (c.status === "Archived" ? " opacity-60" : "") + '" data-open="' + esc(c.id) + '" tabindex="0" role="button" ' +
                    'aria-label="Open ' + esc(c.name) + ' category">' +
                    '<div class="flex items-start gap-3">' +
                    '<span class="ph-cat-icon"><i class="' + c.icon + '" aria-hidden="true"></i></span>' +
                    '<div class="min-w-0 flex-1"><div class="flex items-center gap-2">' +
                    '<h3 class="text-sm font-bold text-gray-900 truncate mr-auto">' + esc(c.name) + "</h3>" +
                    (s.controlled ? '<span class="ph-sched sched-2" title="Holds ' + s.controlled + ' controlled drug(s)"><i class="icon-shield text-[9px]" aria-hidden="true"></i>' + s.controlled + "</span>" : "") +
                    "</div>" +
                    '<p class="text-[10px] font-semibold text-gray-400">' + esc(c.code) + " · " + s.total + " medicines</p></div>" +
                    '<div class="relative grid place-items-center">' + ring(s.health, c.cls) + '<span class="ph-cat-ring-label">' + s.health + "%</span></div>" +
                    "</div>" +
                    '<p class="mt-3 text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2">' + esc(c.desc) + "</p>" +
                    '<div class="mt-3 flex flex-wrap gap-1.5">' + samples + more + "</div>" +
                    '<div class="mt-3 pt-3 border-t border-border-color dark:border-white/10 flex items-center gap-3 text-[10px] font-semibold">' +
                    '<span class="inline-flex items-center gap-1 text-success"><i class="icon-circle-check text-[10px]" aria-hidden="true"></i>' + s.ok + " ok</span>" +
                    '<span class="inline-flex items-center gap-1 text-warning"><i class="icon-triangle-alert text-[10px]" aria-hidden="true"></i>' + s.low + " low</span>" +
                    '<span class="inline-flex items-center gap-1 text-danger"><i class="icon-circle-x text-[10px]" aria-hidden="true"></i>' + s.out + " out</span>" +
                    '<span class="ml-auto text-gray-900 font-extrabold">' + money(s.value) + "</span></div>" +
                    "</article>"
                );
            })
            .join("");
    }

    /* ====================================================================
       List view (table)
       ==================================================================== */

    function renderList(rows) {
        $("list-body").innerHTML = rows
            .map(function (c) {
                const s = stats(c);
                const h = healthTone(s.health);
                return (
                    '<tr class="hms-row ' + c.cls + (c.status === "Archived" ? " opacity-60" : "") + '">' +
                    '<td class="hms-cell"><div class="flex items-center gap-3">' +
                    '<span class="ph-cat-icon size-9! text-sm!"><i class="' + c.icon + '" aria-hidden="true"></i></span>' +
                    '<div class="min-w-0"><p class="text-xs font-bold text-gray-900 truncate">' +
                    '<a href="' + detailUrl(c) + '" class="hover:underline">' + esc(c.name) + "</a></p>" +
                    '<p class="text-[10px] text-gray-400 truncate max-w-48">' + esc(c.desc) + "</p></div></div></td>" +
                    '<td class="hms-cell"><span class="hms-chip tone-slate">' + esc(c.code) + "</span></td>" +
                    '<td class="hms-cell"><span class="text-xs font-bold text-gray-900 tabular-nums">' + s.total + "</span></td>" +
                    '<td class="hms-cell"><div class="flex items-center gap-2 min-w-28">' +
                    '<svg class="ph-stock ' + h.tone.replace("tone-stable", "stock-ok").replace("tone-medium", "stock-low").replace("tone-critical", "stock-out") + '" viewBox="0 0 100 6" preserveAspectRatio="none" role="img" aria-label="' + s.health + ' percent stock health">' +
                    '<rect x="0" y="0" width="100" height="6" rx="3" fill="currentColor" opacity="0.15"></rect>' +
                    '<rect x="0" y="0" width="' + s.health + '" height="6" rx="3" fill="currentColor"></rect></svg>' +
                    '<span class="text-xs font-extrabold text-gray-900 tabular-nums w-9 text-right">' + s.health + "%</span></div></td>" +
                    '<td class="hms-cell"><span class="text-xs font-bold text-gray-900 tabular-nums">' + money(s.value) + "</span></td>" +
                    '<td class="hms-cell">' + (s.controlled ? '<span class="ph-sched sched-2"><i class="icon-shield text-[9px]" aria-hidden="true"></i>' + s.controlled + "</span>" : '<span class="text-[11px] text-gray-300 dark:text-slate-600">—</span>') + "</td>" +
                    '<td class="hms-cell">' + (c.status === "Active" ? '<span class="badge badge-green">Active</span>' : '<span class="badge badge-gray">Archived</span>') + "</td>" +
                    '<td class="hms-cell text-right">' +
                    MC.actions(c.id, [
                        { label: "View", icon: "icon-eye", act: "view" },
                        { label: "Edit", icon: "icon-pencil", act: "edit" },
                        { label: c.status === "Active" ? "Archive" : "Restore", icon: "icon-archive", act: "archive", danger: c.status === "Active" },
                    ]) +
                    "</td></tr>"
                );
            })
            .join("");
    }

    /* ====================================================================
       Render dispatch
       ==================================================================== */

    function render() {
        renderHero();
        renderKpis();
        const rows = visible();
        $("result-count").textContent = rows.length + " shown";

        const empty = rows.length === 0;
        $("empty-state").classList.toggle("hidden", !empty);

        if (mode === "grid") {
            $("grid-view").classList.toggle("hidden", empty);
            $("list-view").classList.add("hidden");
            if (!empty) renderGrid(rows);
        } else {
            $("list-view").classList.toggle("hidden", empty);
            $("grid-view").classList.add("hidden");
            if (!empty) renderList(rows);
        }
        if (window.HSStaticMethods) window.HSStaticMethods.autoInit();
    }

    /* ====================================================================
       Drawer
       ==================================================================== */

    function statTile(label, value, accentIcon) {
        return (
            '<div class="rounded-xl border border-border-color dark:border-white/10 p-2.5 text-center">' +
            '<i class="' + accentIcon + ' text-sm text-gray-400" aria-hidden="true"></i>' +
            '<p class="mt-1 text-base font-extrabold text-gray-900 tabular-nums">' + value + "</p>" +
            '<p class="text-[9px] font-bold uppercase tracking-wide text-gray-400">' + label + "</p></div>"
        );
    }

    function openDrawer(id) {
        const c = CATS.find((x) => x.id === id);
        if (!c) return;
        const s = stats(c);
        const h = healthTone(s.health);

        $("dw-icon").className = "ph-cat-icon " + c.cls + " grid size-12 shrink-0 place-items-center rounded-2xl";
        $("dw-icon").innerHTML = '<i class="' + c.icon + ' text-xl" aria-hidden="true"></i>';
        $("dw-title").textContent = c.name;
        $("dw-sub").textContent = c.code + " · " + s.total + " medicines";

        $("dw-chips").innerHTML =
            '<span class="hms-chip ' + h.tone + '">' + h.label + " · " + s.health + "%</span>" +
            (s.controlled ? '<span class="ph-sched sched-2"><i class="icon-shield text-[9px]" aria-hidden="true"></i>' + s.controlled + " controlled</span>" : "") +
            '<span class="hms-chip tone-slate">' + (c.status) + "</span>";

        $("dw-description").textContent = c.desc;

        $("dw-stats").innerHTML =
            statTile("Medicines", s.total, "icon-pill") +
            statTile("In Stock", s.ok, "icon-circle-check") +
            statTile("Low / Out", s.low + "/" + s.out, "icon-triangle-alert") +
            statTile("Value", money(s.value), "icon-dollar-sign");

        const pct = (n) => (s.total ? Math.round((n / s.total) * 100) : 0);
        $("dw-health").innerHTML =
            '<div class="flex items-center gap-3 mb-2.5">' +
            '<div class="relative grid place-items-center ' + c.cls + '">' + ring(s.health, c.cls) + '<span class="ph-cat-ring-label">' + s.health + "%</span></div>" +
            '<div><p class="text-sm font-bold text-gray-900">' + h.label + " stock health</p>" +
            '<p class="text-[11px] text-gray-400">' + s.ok + " in stock, " + s.low + " low, " + s.out + " out</p></div></div>" +
            '<div class="flex h-2 w-full overflow-hidden rounded-full">' +
            '<svg class="h-full w-full" viewBox="0 0 100 8" preserveAspectRatio="none" role="img" aria-label="Stock split">' +
            '<rect x="0" y="0" width="' + pct(s.ok) + '" height="8" fill="var(--color-success)"></rect>' +
            '<rect x="' + pct(s.ok) + '" y="0" width="' + pct(s.low) + '" height="8" fill="var(--color-warning)"></rect>' +
            '<rect x="' + (pct(s.ok) + pct(s.low)) + '" y="0" width="' + pct(s.out) + '" height="8" fill="var(--color-danger)"></rect></svg></div>';

        $("dw-meds").innerHTML = c.meds
            .map(function (m) {
                const st = medStatus(m);
                const badge = st === "out" ? "badge-red" : st === "low" ? "badge-amber" : "badge-green";
                const lbl = st === "out" ? "Out" : st === "low" ? "Low" : "OK";
                return (
                    '<li class="flex items-center gap-2.5 rounded-lg border border-border-color dark:border-white/10 px-3 py-2">' +
                    (m.ctrl ? '<i class="icon-shield text-[var(--ph-topical)] text-sm shrink-0" title="Controlled" aria-hidden="true"></i>' : '<i class="icon-pill text-gray-400 text-sm shrink-0" aria-hidden="true"></i>') +
                    '<div class="min-w-0 flex-1"><p class="text-xs font-bold text-gray-900 truncate">' + esc(m.name) + "</p>" +
                    '<p class="text-[10px] text-gray-400">' + m.stock.toLocaleString() + " units · $" + m.price.toFixed(2) + "</p></div>" +
                    '<span class="badge ' + badge + '">' + lbl + "</span></li>"
                );
            })
            .join("");

        ["dw-act-edit", "dw-act-add", "dw-act-archive"].forEach((b) => ($(b).dataset.id = c.id));
        const arch = $("dw-act-archive");
        arch.innerHTML = '<i class="icon-archive" aria-hidden="true"></i>' + (c.status === "Active" ? "Archive" : "Restore");

        $("drawer").classList.add("is-open");
        document.body.style.overflow = "hidden";
        $("dw-close").focus();
    }

    function closeDrawer() {
        $("drawer").classList.remove("is-open");
        document.body.style.overflow = "";
    }

    /* ====================================================================
       Add / edit modal
       ==================================================================== */

    function renderSwatches() {
        $("cm-swatches").innerHTML = SWATCHES.map(function (s) {
            const on = s.cls === pickCls;
            return (
                '<button type="button" data-swatch="' + s.cls + '" data-icon="' + s.icon + '" ' +
                'class="ph-cat-icon ' + s.cls + ' size-9! text-sm! ' + (on ? "ring-2 ring-offset-2 ring-[var(--ph-accent)]" : "") + '" ' +
                'aria-pressed="' + on + '"><i class="' + s.icon + '" aria-hidden="true"></i></button>'
            );
        }).join("");
    }

    function openCat(id) {
        editingId = id || null;
        const c = id ? CATS.find((x) => x.id === id) : null;
        $("cm-title").textContent = c ? "Edit Category" : "Add Category";
        $("cm-form").reset();

        if (c) {
            $("cm-name").value = c.name;
            $("cm-code").value = c.code;
            $("cm-desc").value = c.desc;
            pickCls = c.cls;
            pickIcon = c.icon;
        } else {
            pickCls = SWATCHES[0].cls;
            pickIcon = SWATCHES[0].icon;
        }
        renderSwatches();
        MC.openModal("cat-modal");
    }

    function archiveCat(id) {
        const c = CATS.find((x) => x.id === id);
        if (!c) return;
        c.status = c.status === "Active" ? "Archived" : "Active";
        render();
        MC.toast(c.name + (c.status === "Active" ? " restored." : " archived."), c.status === "Active" ? "success" : "info");
    }

    /* ====================================================================
       View toggle
       ==================================================================== */

    function setMode(next) {
        mode = next;
        const grid = next === "grid";
        $("view-grid").className = "grid size-8 place-items-center rounded-lg " + (grid ? "text-white bg-white/20" : "text-white/60 hover:text-white");
        $("view-list").className = "grid size-8 place-items-center rounded-lg " + (grid ? "text-white/60 hover:text-white" : "text-white bg-white/20");
        $("view-grid").setAttribute("aria-pressed", grid);
        $("view-list").setAttribute("aria-pressed", !grid);
        render();
    }

    /* ====================================================================
       Wiring
       ==================================================================== */

    function init() {
        document.body.insertAdjacentHTML("beforeend", MC.deleteModalHTML);

        // Grid cards (and the list-view rows behind them) are already present
        // as static HTML for the default state (no search/filter, sort:
        // name, grid mode) — see cat-grid/list-body in the markup. The hero
        // flag/summary and KPI cards are likewise baked in for that same
        // default CATS state, so skip the innerHTML rebuild on load and just
        // sync the summary bits; any later interaction (search, filter,
        // sort, view toggle, archive, add/edit) still goes through the full
        // render() below unchanged, which re-derives hero/KPIs too.
        (function initialSummary() {
            const rows = visible();
            $("result-count").textContent = rows.length + " shown";
            const empty = rows.length === 0;
            $("empty-state").classList.toggle("hidden", !empty);
            if (mode === "grid") {
                $("grid-view").classList.toggle("hidden", empty);
                $("list-view").classList.add("hidden");
            } else {
                $("list-view").classList.toggle("hidden", empty);
                $("grid-view").classList.add("hidden");
            }
        })();

        ["search", "filter-status", "sort"].forEach(function (id) {
            $(id).addEventListener(id === "search" ? "input" : "change", render);
        });

        $("view-grid").addEventListener("click", () => setMode("grid"));
        $("view-list").addEventListener("click", () => setMode("list"));

        // Grid cards open the drawer (click + keyboard).
        $("cat-grid").addEventListener("click", function (e) {
            const t = e.target.closest("[data-open]");
            if (t) openDrawer(t.dataset.open);
        });
        $("cat-grid").addEventListener("keydown", function (e) {
            if (e.key !== "Enter" && e.key !== " ") return;
            const t = e.target.closest("[data-open]");
            if (!t) return;
            e.preventDefault();
            openDrawer(t.dataset.open);
        });

        // List row actions
        $("list-body").addEventListener("click", function (e) {
            const btn = e.target.closest("[data-act]");
            if (!btn) return;
            const id = btn.dataset.id;
            const c = CATS.find((x) => x.id === id);
            if (btn.dataset.act === "view") openDrawer(id);
            else if (btn.dataset.act === "edit") openCat(id);
            else if (btn.dataset.act === "archive") {
                if (c && c.status === "Active") MC.confirmDelete(c.name + " category", () => archiveCat(id));
                else archiveCat(id);
            }
        });

        // Hero actions
        $("btn-add").addEventListener("click", () => openCat(null));
        $("btn-export").addEventListener("click", () => MC.toast("Categories exported — " + CATS.length + " categories.", "success"));

        // Drawer actions
        $("dw-close").addEventListener("click", closeDrawer);
        $("dw-backdrop").addEventListener("click", closeDrawer);
        $("dw-act-edit").addEventListener("click", function () {
            const id = this.dataset.id;
            closeDrawer();
            openCat(id);
        });
        $("dw-act-add").addEventListener("click", function () {
            closeDrawer();
            MC.toast("Add a medicine to this category from the Medicines page.", "info");
        });
        $("dw-act-archive").addEventListener("click", function () {
            const id = this.dataset.id;
            const c = CATS.find((x) => x.id === id);
            closeDrawer();
            if (c && c.status === "Active") MC.confirmDelete(c.name + " category", () => archiveCat(id));
            else archiveCat(id);
        });

        // Swatch picker
        $("cm-swatches").addEventListener("click", function (e) {
            const btn = e.target.closest("[data-swatch]");
            if (!btn) return;
            pickCls = btn.dataset.swatch;
            pickIcon = btn.dataset.icon;
            renderSwatches();
        });

        // Add/Edit modal
        $("cm-close").addEventListener("click", () => MC.closeModal("cat-modal"));
        $("cm-cancel").addEventListener("click", () => MC.closeModal("cat-modal"));
        $("cm-save").addEventListener("click", function () {
            const name = $("cm-name").value.trim();
            const code = $("cm-code").value.trim().toUpperCase();
            if (!name) return MC.toast("Enter a category name.", "error");
            if (!code) return MC.toast("Enter a short code.", "error");

            // Codes must stay unique so medicines map unambiguously.
            const clash = CATS.some((c) => c.code === code && c.id !== editingId);
            if (clash) return MC.toast("Code " + code + " is already in use.", "error");

            if (editingId) {
                const c = CATS.find((x) => x.id === editingId);
                Object.assign(c, { name: name, code: code, desc: $("cm-desc").value.trim() || c.desc, cls: pickCls, icon: pickIcon });
                MC.toast(name + " updated.", "success");
            } else {
                CATS.unshift(cat({ name: name, code: code, cls: pickCls, icon: pickIcon, desc: $("cm-desc").value.trim() || "No description provided.", meds: [] }));
                MC.toast(name + " category created.", "success");
            }
            MC.closeModal("cat-modal");
            render();
        });

        MC.initDeleteModal();
        ["cat-modal", "del-modal"].forEach(MC.closeOnBackdrop);

        document.addEventListener("keydown", function (e) {
            if (e.key !== "Escape") return;
            closeDrawer();
            ["cat-modal", "del-modal"].forEach(MC.closeModal);
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();

// ==========================================================================
// medicine-detail.js
// ==========================================================================
/**
 * Dreams HMS — Medicine Detail Page Logic
 * Handles monograph print triggers, URL query params, stock reorder modals, and batch quick actions.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Handle URL Query Parameters for Dynamic Data Loading
    const urlParams = new URLSearchParams(window.location.search);
    const medId = urlParams.get('id');
    const medName = urlParams.get('name');
    const medStock = urlParams.get('stock');
    const medPrice = urlParams.get('price');

    if (medName) {
        const brandNameEl = document.getElementById('mdd-brand-name');
        if (brandNameEl) {
            brandNameEl.childNodes[0].textContent = medName + ' ';
        }
    }
    if (medId) {
        const codeNoEl = document.getElementById('mdd-code-no');
        if (codeNoEl) codeNoEl.textContent = '#' + medId;
    }
    if (medStock) {
        const stockEl = document.getElementById('mdd-stat-stock');
        const statusTextEl = document.getElementById('mdd-status-text');
        if (stockEl) stockEl.textContent = Number(medStock).toLocaleString();
        if (statusTextEl) statusTextEl.textContent = `In Stock (${Number(medStock).toLocaleString()} Units)`;
    }
    if (medPrice) {
        const priceEl = document.getElementById('mdd-stat-price');
        if (priceEl) priceEl.textContent = medPrice.startsWith('$') ? medPrice : '$' + medPrice;
    }

    // 2. Print Monograph Trigger
    document.querySelectorAll('[data-action="print"]').forEach(btn => {
        btn.addEventListener('click', () => {
            window.print();
        });
    });

    // 3. Purchase Order Trigger
    const poBtn = document.getElementById('mdd-po-btn');
    if (poBtn) {
        poBtn.addEventListener('click', () => {
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    title: 'Create Purchase Order',
                    text: 'Generate PO for Tylenol (Acetaminophen 500mg) to primary vendor McKesson Corp?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonColor: '#0d9488',
                    cancelButtonColor: '#64748b',
                    confirmButtonText: 'Yes, Create PO'
                }).then((result) => {
                    if (result.isConfirmed) {
                        Swal.fire({
                            title: 'PO Generated!',
                            text: 'Purchase Order #PO-2026-8890 created successfully.',
                            icon: 'success',
                            confirmButtonColor: '#0d9488'
                        });
                    }
                });
            } else {
                alert('Purchase Order #PO-2026-8890 initiated with supplier McKesson.');
            }
        });
    }

    // 4. Adjust Stock Trigger
    const adjustBtn = document.getElementById('mdd-adjust-btn');
    if (adjustBtn) {
        adjustBtn.addEventListener('click', () => {
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    title: 'Adjust Inventory Stock',
                    html: `
                        <div class="text-left text-xs space-y-3 font-sans">
                            <div>
                                <label class="block font-semibold mb-1 text-slate-700 dark:text-slate-200">Adjustment Type</label>
                                <select id="swal-adj-type" class="w-full border rounded p-2 bg-slate-50 dark:bg-slate-800 dark:border-slate-700">
                                    <option value="addition">Stock In (Receipt / Return)</option>
                                    <option value="reduction">Stock Out (Disposal / Expiry)</option>
                                    <option value="audit">Audit Count Reconciliation</option>
                                </select>
                            </div>
                            <div>
                                <label class="block font-semibold mb-1 text-slate-700 dark:text-slate-200">Quantity Offset</label>
                                <input type="number" id="swal-adj-qty" value="100" class="w-full border rounded p-2 bg-slate-50 dark:bg-slate-800 dark:border-slate-700" />
                            </div>
                        </div>
                    `,
                    showCancelButton: true,
                    confirmButtonColor: '#0d9488',
                    confirmButtonText: 'Save Adjustment',
                    focusConfirm: false,
                    preConfirm: () => {
                        const qty = document.getElementById('swal-adj-qty').value;
                        return { qty };
                    }
                }).then((result) => {
                    if (result.isConfirmed) {
                        Swal.fire({
                            title: 'Stock Updated',
                            text: `Inventory adjustment logged successfully.`,
                            icon: 'success',
                            confirmButtonColor: '#0d9488'
                        });
                    }
                });
            } else {
                const qty = prompt('Enter quantity adjustment offset:', '100');
                if (qty) {
                    alert(`Adjusted stock by ${qty} units.`);
                }
            }
        });
    }
});

// ==========================================================================
// medicines.js
// ==========================================================================
// Dreams HMS — Medicine Formulary
// The pharmacy drug master catalog: dosage forms, controlled-substance
// schedules, stock status, pricing and a detail drawer. Sibling pages handle
// inventory, sales, expiry and prescriptions. Static demo data — no API.
(function () {
    "use strict";
    if ((location.pathname.split("/").pop() || "index.html") !== "medicines.html") return;

    const $ = (id) => document.getElementById(id);

    function esc(v) {
        return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
        });
    }

    function money(n) {
        return "$" + Number(n).toFixed(2);
    }

    /* ====================================================================
       Reference maps
       ==================================================================== */

    // Dosage form → icon + colour class (matches .form-* in CSS).
    const FORM = {
        Tablet: { icon: "icon-pill", cls: "form-tablet" },
        Capsule: { icon: "icon-tablets", cls: "form-capsule" },
        Syrup: { icon: "icon-flask-round", cls: "form-syrup" },
        Injection: { icon: "icon-syringe", cls: "form-injection" },
        Topical: { icon: "icon-hand", cls: "form-topical" },
        Drops: { icon: "icon-droplet", cls: "form-drops" },
        Inhaler: { icon: "icon-wind", cls: "form-inhaler" },
    };
    const FORM_FALLBACK = { icon: "icon-pill", cls: "form-tablet" };

    // DEA controlled-substance schedules (II–V); "OTC" = non-controlled.
    const SCHEDULE = {
        "2": { label: "C-II", cls: "sched-2", name: "Schedule II — high abuse potential" },
        "3": { label: "C-III", cls: "sched-3", name: "Schedule III" },
        "4": { label: "C-IV", cls: "sched-4", name: "Schedule IV" },
        "5": { label: "C-V", cls: "sched-5", name: "Schedule V" },
    };

    const CATEGORIES = ["Analgesics", "Antibiotics", "Cardiovascular", "Respiratory", "Endocrine", "Gastrointestinal", "CNS", "Anticoagulants"];

    const SUPPLIERS = ["McKesson", "Cardinal Health", "AmerisourceBergen", "Cencora", "Morris & Dickson"];

    const LOCATIONS = ["Main Pharmacy", "ED Satellite", "OR Store", "Ward Cabinets"];

    /* ====================================================================
       Formulary data
       ==================================================================== */

    let counter = 0;
    function mk(o) {
        counter++;
        return Object.assign({ code: "MED-" + String(counter).padStart(4, "0"), active: true }, o);
    };
    const detailUrl = function (m) {
        return "medicine-detail.html?" + new URLSearchParams({ code: m.code, brand: m.brand, generic: m.generic, category: m.category }).toString();
    }

    let MEDS = [
        mk({ brand: "Tylenol", generic: "Acetaminophen", category: "Analgesics", form: "Tablet", strength: "500 mg", sched: "OTC", price: 0.08, stock: 8400, reorder: 2000, supplier: "McKesson", indications: "Mild to moderate pain and fever reduction.", dosage: ["Adults: 500–1000 mg every 4–6h", "Max 3000 mg / 24h", "Hepatic impairment: reduce dose"], warnings: ["Hepatotoxic in overdose", "Avoid with chronic alcohol use"] }),
        mk({ brand: "Amoxil", generic: "Amoxicillin", category: "Antibiotics", form: "Capsule", strength: "500 mg", sched: "OTC", price: 0.22, stock: 6100, reorder: 1500, supplier: "Cardinal Health", indications: "Bacterial infections of the ear, nose, throat and urinary tract.", dosage: ["Adults: 500 mg every 8h", "Severe: 875 mg every 12h", "Complete full course"], warnings: ["Penicillin allergy — contraindicated", "May reduce oral contraceptive efficacy"] }),
        mk({ brand: "OxyContin", generic: "Oxycodone", category: "Analgesics", form: "Tablet", strength: "10 mg", sched: "2", price: 1.85, stock: 320, reorder: 400, supplier: "AmerisourceBergen", indications: "Severe pain requiring an opioid analgesic.", dosage: ["Individualise to response", "Extended-release: every 12h", "Do not crush or chew"], warnings: ["High abuse and dependence risk", "Respiratory depression", "Controlled — witness count required"] }),
        mk({ brand: "Lipitor", generic: "Atorvastatin", category: "Cardiovascular", form: "Tablet", strength: "20 mg", sched: "OTC", price: 0.31, stock: 5200, reorder: 1200, supplier: "Cencora", indications: "Hypercholesterolaemia and cardiovascular risk reduction.", dosage: ["Initial: 10–20 mg once daily", "Range: 10–80 mg daily", "Take in the evening"], warnings: ["Myopathy risk with fibrates", "Monitor liver enzymes"] }),
        mk({ brand: "Ventolin", generic: "Salbutamol", category: "Respiratory", form: "Inhaler", strength: "100 mcg/dose", sched: "OTC", price: 4.6, stock: 890, reorder: 300, supplier: "McKesson", indications: "Relief of bronchospasm in asthma and COPD.", dosage: ["1–2 puffs every 4–6h as needed", "Max 8 puffs / 24h", "Spacer improves delivery"], warnings: ["Overuse signals poor control", "Tachycardia at high doses"] }),
        mk({ brand: "Xanax", generic: "Alprazolam", category: "CNS", form: "Tablet", strength: "0.5 mg", sched: "4", price: 0.44, stock: 0, reorder: 250, supplier: "Cardinal Health", indications: "Anxiety and panic disorder.", dosage: ["Initial: 0.25–0.5 mg three times daily", "Taper to discontinue", "Avoid abrupt cessation"], warnings: ["Dependence with prolonged use", "Sedation — avoid driving", "Controlled — witness count required"] }),
        mk({ brand: "Coumadin", generic: "Warfarin", category: "Anticoagulants", form: "Tablet", strength: "5 mg", sched: "OTC", price: 0.19, stock: 2100, reorder: 800, supplier: "Cencora", indications: "Prophylaxis and treatment of thromboembolic disorders.", dosage: ["Dose to target INR 2–3", "Review INR regularly", "Consistent vitamin K intake"], warnings: ["Numerous drug and food interactions", "Bleeding risk — monitor INR"] }),
        mk({ brand: "Nexium", generic: "Esomeprazole", category: "Gastrointestinal", form: "Capsule", strength: "40 mg", sched: "OTC", price: 0.52, stock: 3300, reorder: 900, supplier: "Morris & Dickson", indications: "GERD and erosive oesophagitis.", dosage: ["20–40 mg once daily", "Before food", "Course 4–8 weeks"], warnings: ["Long-term use — B12 and magnesium", "Reduces clopidogrel effect"] }),
        mk({ brand: "Glucophage", generic: "Metformin", category: "Endocrine", form: "Tablet", strength: "850 mg", sched: "OTC", price: 0.06, stock: 7600, reorder: 2000, supplier: "McKesson", indications: "Type 2 diabetes mellitus, first-line.", dosage: ["Initial: 500 mg twice daily", "Titrate weekly", "Take with meals"], warnings: ["Hold before contrast imaging", "Rare lactic acidosis in renal impairment"] }),
        mk({ brand: "Ativan", generic: "Lorazepam", category: "CNS", form: "Injection", strength: "2 mg/mL", sched: "4", price: 1.12, stock: 540, reorder: 200, supplier: "AmerisourceBergen", indications: "Status epilepticus and acute agitation.", dosage: ["4 mg IV over 2 min, may repeat", "Dilute before IV", "Monitor respiration"], warnings: ["Respiratory depression", "Controlled — witness count required"] }),
        mk({ brand: "Zofran", generic: "Ondansetron", category: "Gastrointestinal", form: "Injection", strength: "4 mg/2mL", sched: "OTC", price: 0.74, stock: 1450, reorder: 500, supplier: "Cardinal Health", indications: "Prevention of nausea and vomiting.", dosage: ["4–8 mg IV before chemotherapy", "Slow IV push", "Max 16 mg/dose"], warnings: ["QT prolongation at high doses", "Caution with other QT drugs"] }),
        mk({ brand: "Augmentin", generic: "Amoxicillin/Clavulanate", category: "Antibiotics", form: "Syrup", strength: "228 mg/5mL", sched: "OTC", price: 0.9, stock: 610, reorder: 250, supplier: "Cencora", indications: "Respiratory and skin infections.", dosage: ["Weight-based in children", "Every 8–12h", "Refrigerate suspension"], warnings: ["Penicillin allergy — contraindicated", "GI upset common"] }),
        mk({ brand: "Norvasc", generic: "Amlodipine", category: "Cardiovascular", form: "Tablet", strength: "5 mg", sched: "OTC", price: 0.11, stock: 4800, reorder: 1200, supplier: "Morris & Dickson", indications: "Hypertension and angina.", dosage: ["5–10 mg once daily", "Elderly: start 2.5 mg", "Any time of day"], warnings: ["Peripheral oedema", "Caution in severe aortic stenosis"] }),
        mk({ brand: "Codeine Linctus", generic: "Codeine", category: "Respiratory", form: "Syrup", strength: "15 mg/5mL", sched: "5", price: 0.38, stock: 260, reorder: 150, supplier: "McKesson", indications: "Dry cough suppression.", dosage: ["5–10 mL every 4–6h", "Max per 24h per label", "Not under 12 years"], warnings: ["Dependence potential", "Controlled — record in register"] }),
        mk({ brand: "Cortisone Cream", generic: "Hydrocortisone", category: "Analgesics", form: "Topical", strength: "1%", sched: "OTC", price: 0.28, stock: 1900, reorder: 600, supplier: "Cardinal Health", indications: "Inflammatory skin conditions.", dosage: ["Apply thin film 1–2 times daily", "Short courses only", "Avoid broken skin"], warnings: ["Skin thinning with prolonged use", "Avoid facial use unless directed"] }),
        mk({ brand: "Timoptic", generic: "Timolol", category: "Cardiovascular", form: "Drops", strength: "0.5%", sched: "OTC", price: 1.4, stock: 430, reorder: 150, supplier: "Cencora", indications: "Open-angle glaucoma, raised intraocular pressure.", dosage: ["1 drop twice daily", "Punctal occlusion reduces absorption", "Space from other drops"], warnings: ["Systemic beta-blockade", "Caution in asthma"] }),
        mk({ brand: "Humulin R", generic: "Insulin (regular)", category: "Endocrine", form: "Injection", strength: "100 units/mL", sched: "OTC", price: 6.2, stock: 720, reorder: 250, supplier: "AmerisourceBergen", indications: "Diabetes mellitus glycaemic control.", dosage: ["Individualised subcutaneous dosing", "30 min before meals", "Refrigerate stock vials"], warnings: ["Hypoglycaemia risk", "Do not freeze"] }),
        mk({ brand: "Ciprobay", generic: "Ciprofloxacin", category: "Antibiotics", form: "Tablet", strength: "500 mg", sched: "OTC", price: 0.34, stock: 3100, reorder: 900, supplier: "Morris & Dickson", indications: "Urinary, respiratory and GI bacterial infections.", dosage: ["250–750 mg every 12h", "Avoid with dairy or antacids", "Complete full course"], warnings: ["Tendon rupture risk", "QT prolongation"] }),
        mk({ brand: "Adderall", generic: "Amphetamine/Dextroamphetamine", category: "CNS", form: "Tablet", strength: "20 mg", sched: "2", price: 1.05, stock: 180, reorder: 300, supplier: "Cardinal Health", indications: "ADHD and narcolepsy.", dosage: ["Individualise, lowest effective dose", "Morning dosing", "Assess cardiac history first"], warnings: ["High abuse potential", "Controlled — witness count required", "Cardiovascular risk"] }),
        mk({ brand: "Salofalk", generic: "Mesalazine", category: "Gastrointestinal", form: "Tablet", strength: "500 mg", sched: "OTC", price: 0.63, stock: 1200, reorder: 400, supplier: "Cencora", indications: "Ulcerative colitis, maintenance of remission.", dosage: ["1.5–3 g daily in divided doses", "Swallow whole", "With plenty of water"], warnings: ["Renal monitoring advised", "Salicylate sensitivity"] }),
        mk({ brand: "Panadol", generic: "Paracetamol", category: "Analgesics", form: "Syrup", strength: "120 mg/5mL", sched: "OTC", price: 0.15, stock: 2600, reorder: 700, supplier: "McKesson", indications: "Paediatric pain and fever.", dosage: ["Weight-based dosing", "Every 4–6h, max 4 doses/day", "Use measuring syringe"], warnings: ["Do not exceed labelled dose", "Check other paracetamol sources"] }),
        mk({ brand: "Eliquis", generic: "Apixaban", category: "Anticoagulants", form: "Tablet", strength: "5 mg", sched: "OTC", price: 3.1, stock: 940, reorder: 300, supplier: "Cardinal Health", indications: "Stroke prevention in atrial fibrillation, VTE.", dosage: ["5 mg twice daily", "Reduce to 2.5 mg if criteria met", "No routine INR needed"], warnings: ["Bleeding risk", "No specific antidote in most settings"] }),
    ];

    /* ====================================================================
       Derived
       ==================================================================== */

    // Stock status derived from level vs reorder point — never hardcoded.
    function stockStatus(m) {
        if (m.stock <= 0) return { key: "out", label: "Out of Stock", cls: "stock-out", badge: "badge-red" };
        if (m.stock <= m.reorder) return { key: "low", label: "Low Stock", cls: "stock-low", badge: "badge-amber" };
        return { key: "ok", label: "In Stock", cls: "stock-ok", badge: "badge-green" };
    }

    const isControlled = (m) => m.sched !== "OTC";

    /* ====================================================================
       State
       ==================================================================== */

    let activeCat = "";
    let page = 1;
    const PAGE_SIZE = 8;

    function filtered() {
        const q = $("search").value.trim().toLowerCase();
        const form = $("filter-form").value;
        const sched = $("filter-sched").value;
        const stock = $("filter-stock").value;

        return MEDS.filter(function (m) {
            const hit = !q || m.brand.toLowerCase().includes(q) || m.generic.toLowerCase().includes(q) || m.code.toLowerCase().includes(q);
            const okCat = !activeCat || m.category === activeCat;
            const okForm = !form || m.form === form;
            const okSched = !sched || (sched === "OTC" ? m.sched === "OTC" : m.sched === sched);
            const okStock = !stock || stockStatus(m).key === stock;
            return hit && okCat && okForm && okSched && okStock;
        });
    }

    /* ====================================================================
       Hero + KPIs
       ==================================================================== */

    function renderHero() {
        const active = MEDS.filter((m) => m.active).length;
        const out = MEDS.filter((m) => stockStatus(m).key === "out").length;
        const flag =
            out >= 3 ? { cls: "tone-critical", text: out + " Out of Stock" }
            : MEDS.filter((m) => stockStatus(m).key === "low").length >= 4 ? { cls: "tone-medium", text: "Stock Watch" }
            : { cls: "tone-stable", text: "Formulary Active" };
        $("ph-flag").className = "hms-chip " + flag.cls;
        $("ph-flag-text").textContent = flag.text;
        $("hero-summary").textContent = active + " active medicines · " + CATEGORIES.length + " categories";
    }

    function renderKpis() {
        const total = MEDS.length;
        const controlled = MEDS.filter(isControlled).length;
        const low = MEDS.filter((m) => stockStatus(m).key === "low").length;
        const out = MEDS.filter((m) => stockStatus(m).key === "out").length;
        const value = MEDS.reduce((s, m) => s + m.price * m.stock, 0);

        const cards = [
            { id: "kpi-total", icon: "icon-pill", label: "Total Medicines", value: total, tone: "ph-primary", meta: "in formulary" },
            { id: "kpi-active", icon: "icon-circle-check", label: "Active", value: MEDS.filter((m) => m.active).length, tone: "ph-sky", meta: "dispensable" },
            { id: "kpi-controlled", icon: "icon-shield", label: "Controlled", value: controlled, tone: "ph-violet", meta: "scheduled drugs" },
            { id: "kpi-low", icon: "icon-triangle-alert", label: "Low Stock", value: low, tone: "ph-amber", meta: "at/below reorder" },
            { id: "kpi-out", icon: "icon-circle-x", label: "Out of Stock", value: out, tone: "ph-danger", meta: "needs ordering" },
            { id: "kpi-value", icon: "icon-dollar-sign", label: "Stock Value", value: "$" + Math.round(value / 1000) + "k", tone: "ph-slate", meta: "at unit cost" },
        ];

        $("kpi-row").innerHTML = cards
            .map(function (c) {
                return (
                    '<article class="ph-kpi ' + c.tone + '">' +
                    '<div class="ph-kpi-head">' +
                    '<span class="ph-kpi-icon"><i class="' + c.icon + '" aria-hidden="true"></i></span>' +
                    "</div>" +
                    '<p class="ph-kpi-value"><span id="' + c.id + '">' + c.value + "</span></p>" +
                    '<p class="ph-kpi-label">' + c.label + "</p>" +
                    '<p class="ph-kpi-meta"><i class="icon-circle-dot text-[8px]" aria-hidden="true"></i>' + c.meta + "</p>" +
                    "</article>"
                );
            })
            .join("");
    }

    /* ====================================================================
       Category quick filter
       ==================================================================== */

    function renderCategories() {
        const chip = function (label, value) {
            const count = value ? MEDS.filter((m) => m.category === value).length : MEDS.length;
            const on = activeCat === value;
            return (
                '<button type="button" data-cat="' + esc(value) + '" ' +
                'class="hms-chip ' + (on ? "ph-primary" : "tone-slate") + ' transition-colors" aria-pressed="' + on + '">' +
                esc(label) + '<span class="opacity-60">' + count + "</span></button>"
            );
        };
        $("cat-chips").innerHTML = chip("All", "") + CATEGORIES.map((c) => chip(c, c)).join("");
    }

    /* ====================================================================
       Catalog table + pagination
       ==================================================================== */

    function stockBar(m) {
        const st = stockStatus(m);
        // Fill relative to twice the reorder level, capped at 100%.
        const ceiling = Math.max(m.reorder * 2, 1);
        const pct = Math.min(100, Math.round((m.stock / ceiling) * 100));
        return (
            '<div class="min-w-28"><div class="flex items-center gap-2">' +
            '<svg class="ph-stock ' + st.cls + '" viewBox="0 0 100 6" preserveAspectRatio="none" role="img" aria-label="' + m.stock + ' units, ' + st.label + '">' +
            '<rect x="0" y="0" width="100" height="6" rx="3" fill="currentColor" opacity="0.15"></rect>' +
            '<rect x="0" y="0" width="' + pct + '" height="6" rx="3" fill="currentColor"></rect></svg>' +
            '<span class="text-xs font-bold text-gray-900 tabular-nums w-12 text-right">' + m.stock.toLocaleString() + "</span></div>" +
            '<p class="mt-0.5 text-[10px] font-semibold text-gray-400">reorder @ ' + m.reorder.toLocaleString() + "</p></div>"
        );
    }

    function schedBadge(m) {
        if (!isControlled(m)) return '<span class="hms-chip tone-slate">Rx</span>';
        const s = SCHEDULE[m.sched];
        return '<span class="ph-sched ' + s.cls + '" title="' + esc(s.name) + '"><i class="icon-shield text-[9px]" aria-hidden="true"></i>' + s.label + "</span>";
    }

    // One row's markup for a medicine record (used both for the static rows
    // already in the page and to patch a single row after add/edit/toggle).
    function rowHTML(m) {
        const f = FORM[m.form] || FORM_FALLBACK;
        const st = stockStatus(m);
        return (
            '<tr class="hms-row' + (m.active ? "" : " opacity-60") + '" data-row-id="' + esc(m.code) + '">' +
            '<td class="hms-cell"><div class="flex items-center gap-3">' +
            '<span class="ph-form ' + f.cls + '"><i class="' + f.icon + '" aria-hidden="true"></i></span>' +
            '<div class="min-w-0"><p class="text-xs font-bold text-gray-900 truncate"><a href="' + detailUrl(m) + '" class="hover:underline">' + esc(m.brand) + "</a></p>" +
            '<p class="text-[10px] text-gray-400 truncate">' + esc(m.generic) + " · " + esc(m.code) + "</p></div></div></td>" +
            '<td class="hms-cell"><span class="hms-chip tone-info">' + esc(m.category) + "</span></td>" +
            '<td class="hms-cell"><p class="text-xs font-semibold text-gray-700 dark:text-gray-300">' + esc(m.form) + "</p>" +
            '<p class="text-[10px] text-gray-400">' + esc(m.strength) + "</p></td>" +
            '<td class="hms-cell">' + schedBadge(m) + "</td>" +
            '<td class="hms-cell">' + stockBar(m) + "</td>" +
            '<td class="hms-cell"><span class="text-xs font-bold text-gray-900 tabular-nums">' + money(m.price) + "</span></td>" +
            '<td class="hms-cell">' + (m.active ? '<span class="badge ' + st.badge + '">' + st.label + "</span>" : '<span class="badge badge-gray">Discontinued</span>') + "</td>" +
            '<td class="hms-cell text-right">' +
            MC.actions(m.code, [
                { label: "View", icon: "icon-eye", act: "view" },
                { label: "Edit", icon: "icon-pencil", act: "edit" },
                { label: "Reorder", icon: "icon-shopping-cart", act: "reorder" },
                { label: m.active ? "Discontinue" : "Reactivate", icon: "icon-power", act: "toggle", danger: m.active },
            ]) +
            "</td></tr>"
        );
    }

    // Rows are already present as static HTML in MEDS array order (a fresh
    // "Add" unshifts to the front of both MEDS and the DOM, so order always
    // stays in sync). Search/filter/category-chip/pagination changes now
    // only toggle [data-row-id] visibility instead of rebuilding the table.
    function renderGrid() {
        const rows = filtered();
        const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
        if (page > pages) page = pages;

        $("grid-count").textContent = rows.length + (rows.length === 1 ? " item" : " items");

        const emptyRow = $("grid-empty-row");
        if (!rows.length) {
            $("grid-body").querySelectorAll("[data-row-id]").forEach((tr) => tr.classList.add("hidden"));
            if (emptyRow) emptyRow.classList.remove("hidden");
            $("pager").innerHTML = "";
            return;
        }
        if (emptyRow) emptyRow.classList.add("hidden");

        const slice = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
        const visible = new Set(slice.map((m) => m.code));
        $("grid-body").querySelectorAll("[data-row-id]").forEach((tr) => {
            tr.classList.toggle("hidden", !visible.has(tr.dataset.rowId));
        });

        renderPager(rows.length, pages);
    }

    function renderPager(count, pages) {
        const from = (page - 1) * PAGE_SIZE + 1;
        const to = Math.min(page * PAGE_SIZE, count);
        const btn = (label, target, disabled, current) =>
            '<button type="button" data-page="' + target + '" ' + (disabled ? "disabled " : "") +
            'class="min-w-8 h-8 px-2 rounded-lg text-xs font-bold transition-colors ' +
            (current ? "bg-primary text-white" : disabled ? "text-gray-300 dark:text-slate-600 cursor-not-allowed" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700") +
            '">' + label + "</button>";

        let nums = "";
        for (let p = 1; p <= pages; p++) nums += btn(p, p, false, p === page);

        $("pager").innerHTML =
            '<p class="text-xs text-gray-500 dark:text-gray-400">Showing <strong class="text-gray-900">' + from + "–" + to + '</strong> of <strong class="text-gray-900">' + count + "</strong></p>" +
            '<div class="flex items-center gap-1">' +
            btn('<i class="icon-chevron-left"></i>', page - 1, page === 1) + nums + btn('<i class="icon-chevron-right"></i>', page + 1, page === pages) +
            "</div>";
    }

    /* ====================================================================
       Drawer
       ==================================================================== */

    function ov(term, value) {
        return (
            '<div><dt class="text-[10px] font-bold uppercase tracking-wider text-gray-400">' + term + "</dt>" +
            '<dd class="mt-0.5 text-xs font-bold text-gray-900">' + value + "</dd></div>"
        );
    }

    function openDrawer(code) {
        const m = MEDS.find((x) => x.code === code);
        if (!m) return;
        const f = FORM[m.form] || FORM_FALLBACK;
        const st = stockStatus(m);

        $("dw-form").className = "ph-form " + f.cls + " grid size-12 shrink-0 place-items-center rounded-2xl";
        $("dw-form").innerHTML = '<i class="' + f.icon + ' text-xl" aria-hidden="true"></i>';
        $("dw-title").textContent = m.brand;
        $("dw-sub").textContent = m.generic + " · " + m.code;

        $("dw-chips").innerHTML =
            '<span class="hms-chip tone-info">' + esc(m.category) + "</span>" +
            '<span class="hms-chip tone-slate">' + esc(m.form) + " · " + esc(m.strength) + "</span>" +
            (isControlled(m) ? '<span class="ph-sched ' + SCHEDULE[m.sched].cls + '"><i class="icon-shield text-[9px]" aria-hidden="true"></i>' + SCHEDULE[m.sched].label + "</span>" : "") +
            '<span class="hms-chip ' + st.cls.replace("stock-ok", "tone-stable").replace("stock-low", "tone-medium").replace("stock-out", "tone-critical") + '">' + st.label + "</span>";

        $("dw-overview").innerHTML =
            ov("Brand", esc(m.brand)) + ov("Generic", esc(m.generic)) +
            ov("Code", esc(m.code)) + ov("Category", esc(m.category)) +
            ov("Form", esc(m.form)) + ov("Strength", esc(m.strength)) +
            ov("Schedule", isControlled(m) ? SCHEDULE[m.sched].label : "Non-controlled (Rx)") +
            ov("Status", m.active ? "Active" : "Discontinued");

        $("dw-composition").innerHTML =
            '<p class="text-xs font-semibold text-gray-700 dark:text-gray-300">' + esc(m.generic) + " " + esc(m.strength) + "</p>" +
            '<p class="mt-1.5 text-xs text-gray-500 dark:text-gray-400">' + esc(m.indications) + "</p>";

        $("dw-dosage").innerHTML = m.dosage
            .map((d) => '<li class="flex items-start gap-2 rounded-lg border border-border-color dark:border-white/10 px-3 py-2"><i class="icon-check text-teal-500 text-sm shrink-0 mt-0.5" aria-hidden="true"></i><span class="text-xs text-gray-600 dark:text-gray-300">' + esc(d) + "</span></li>")
            .join("");

        $("dw-warnings").innerHTML = m.warnings
            .map((w) => '<li class="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/5 px-3 py-2"><i class="icon-triangle-alert text-danger text-sm shrink-0 mt-0.5" aria-hidden="true"></i><span class="text-xs text-gray-600 dark:text-gray-300">' + esc(w) + "</span></li>")
            .join("");

        // Stock split across locations (deterministic shares of the total).
        const shares = [0.55, 0.2, 0.15, 0.1];
        $("dw-stock").innerHTML = LOCATIONS.map(function (loc, i) {
            const qty = Math.round(m.stock * shares[i]);
            return (
                '<li class="flex items-center gap-2.5 rounded-lg border border-border-color dark:border-white/10 px-3 py-2">' +
                '<i class="icon-map-pin text-gray-400 text-sm shrink-0" aria-hidden="true"></i>' +
                '<span class="text-xs font-semibold text-gray-700 dark:text-gray-300 mr-auto">' + esc(loc) + "</span>" +
                '<span class="text-xs font-bold text-gray-900 tabular-nums">' + qty.toLocaleString() + "</span></li>"
            );
        }).join("");

        $("dw-supply").innerHTML =
            ov("Unit Price", money(m.price)) +
            ov("Stock Value", money(m.price * m.stock)) +
            ov("Reorder Level", m.reorder.toLocaleString()) +
            ov("On Hand", m.stock.toLocaleString()) +
            ov("Supplier", esc(m.supplier)) +
            ov("Reorder Qty", (m.reorder * 3).toLocaleString());

        // Toggle button label reflects current state.
        const tgl = $("dw-act-toggle");
        tgl.innerHTML = '<i class="icon-power" aria-hidden="true"></i>' + (m.active ? "Discontinue" : "Reactivate");
        ["dw-act-edit", "dw-act-reorder", "dw-act-toggle"].forEach((b) => ($(b).dataset.code = m.code));

        $("drawer").classList.add("is-open");
        document.body.style.overflow = "hidden";
        $("dw-close").focus();
    }

    function closeDrawer() {
        $("drawer").classList.remove("is-open");
        document.body.style.overflow = "";
    }

    /* ====================================================================
       Modals
       ==================================================================== */

    let editingCode = null;

    function openMed(code) {
        editingCode = code || null;
        const m = code ? MEDS.find((x) => x.code === code) : null;

        $("mm-title").textContent = m ? "Edit Medicine" : "Add Medicine";
        $("mm-form").reset();
        // #mm-category's <option> list is static in the HTML (mirrors the
        // fixed CATEGORIES array); only the selected value needs setting.

        if (m) {
            $("mm-brand").value = m.brand;
            $("mm-generic").value = m.generic;
            $("mm-category").value = m.category;
            $("mm-dosage-form").value = m.form;
            $("mm-strength").value = m.strength;
            $("mm-sched").value = m.sched;
            $("mm-price").value = m.price;
            $("mm-stock").value = m.stock;
            $("mm-reorder").value = m.reorder;
            $("mm-supplier").value = m.supplier;
            $("mm-indications").value = m.indications;
        }
        MC.openModal("med-modal");
    }

    function openReorder(code) {
        const m = MEDS.find((x) => x.code === code);
        if (!m) return;
        const st = stockStatus(m);
        $("ro-sub").textContent = m.brand + " · " + m.code;
        $("ro-summary").innerHTML =
            '<div class="flex items-center gap-3">' +
            '<span class="ph-form ' + (FORM[m.form] || FORM_FALLBACK).cls + '"><i class="' + (FORM[m.form] || FORM_FALLBACK).icon + '" aria-hidden="true"></i></span>' +
            '<div class="min-w-0 flex-1"><p class="text-xs font-bold text-gray-900">' + esc(m.brand) + " " + esc(m.strength) + "</p>" +
            '<p class="text-[10px] text-gray-400">On hand ' + m.stock.toLocaleString() + " · reorder @ " + m.reorder.toLocaleString() + "</p></div>" +
            '<span class="hms-chip ' + st.cls.replace("stock-ok", "tone-stable").replace("stock-low", "tone-medium").replace("stock-out", "tone-critical") + '">' + st.label + "</span></div>";
        $("ro-qty").value = m.reorder * 3;
        $("ro-supplier").innerHTML = SUPPLIERS.map((s) => '<option' + (s === m.supplier ? " selected" : "") + ">" + esc(s) + "</option>").join("");
        $("ro-notes").value = "";
        $("ro-save").dataset.code = m.code;
        MC.openModal("reorder-modal");
    }

    function toggleMed(code) {
        const m = MEDS.find((x) => x.code === code);
        if (!m) return;
        m.active = !m.active;
        const existingEl = $("grid-body").querySelector('[data-row-id="' + code + '"]');
        if (existingEl) existingEl.outerHTML = rowHTML(m);
        renderAll();
        MC.toast(m.brand + (m.active ? " reactivated." : " discontinued from the formulary."), m.active ? "success" : "info");
    }

    /* ====================================================================
       Render + wiring
       ==================================================================== */

    function renderAll() {
        renderHero();
        renderKpis();
        renderCategories();
        renderGrid();
    }

    function init() {
        document.body.insertAdjacentHTML("beforeend", MC.deleteModalHTML);
        // Hero flag/summary and the 6 KPI cards are baked into the HTML for
        // the initial MEDS state; renderHero()/renderKpis() only need to run
        // again via renderAll() after a genuine mutation (toggle, add/edit).
        renderCategories();
        renderGrid();

        ["search", "filter-form", "filter-sched", "filter-stock"].forEach(function (id) {
            $(id).addEventListener(id === "search" ? "input" : "change", function () {
                page = 1;
                renderGrid();
            });
        });

        $("cat-chips").addEventListener("click", function (e) {
            const btn = e.target.closest("[data-cat]");
            if (!btn) return;
            activeCat = btn.dataset.cat;
            page = 1;
            renderCategories();
            renderGrid();
        });

        $("pager").addEventListener("click", function (e) {
            const btn = e.target.closest("[data-page]");
            if (!btn || btn.disabled) return;
            const p = parseInt(btn.dataset.page, 10);
            if (p >= 1) {
                page = p;
                renderGrid();
            }
        });

        $("grid-body").addEventListener("click", function (e) {
            const btn = e.target.closest("[data-act]");
            if (!btn) return;
            const code = btn.dataset.id;
            const act = btn.dataset.act;
            if (act === "view") openDrawer(code);
            else if (act === "edit") openMed(code);
            else if (act === "reorder") openReorder(code);
            else if (act === "toggle") {
                const m = MEDS.find((x) => x.code === code);
                if (m && m.active) {
                    MC.confirmDelete(m.brand + " (" + m.code + ")", function () {
                        toggleMed(code);
                    });
                } else toggleMed(code);
            }
        });

        // Hero actions
        $("btn-add").addEventListener("click", () => openMed(null));
        $("btn-import").addEventListener("click", () => MC.toast("Formulary import — upload a CSV to bulk-add medicines.", "info"));
        $("btn-export").addEventListener("click", () => MC.toast("Formulary exported — " + MEDS.length + " medicines.", "success"));

        // Drawer quick actions
        $("dw-close").addEventListener("click", closeDrawer);
        $("dw-backdrop").addEventListener("click", closeDrawer);
        $("dw-act-edit").addEventListener("click", function () {
            const code = this.dataset.code;
            closeDrawer();
            openMed(code);
        });
        $("dw-act-reorder").addEventListener("click", function () {
            const code = this.dataset.code;
            closeDrawer();
            openReorder(code);
        });
        $("dw-act-toggle").addEventListener("click", function () {
            const code = this.dataset.code;
            const m = MEDS.find((x) => x.code === code);
            closeDrawer();
            if (m && m.active) MC.confirmDelete(m.brand + " (" + m.code + ")", () => toggleMed(code));
            else toggleMed(code);
        });

        // Add/Edit modal
        $("mm-close").addEventListener("click", () => MC.closeModal("med-modal"));
        $("mm-cancel").addEventListener("click", () => MC.closeModal("med-modal"));
        $("mm-save").addEventListener("click", function () {
            const brand = $("mm-brand").value.trim();
            const generic = $("mm-generic").value.trim();
            if (!brand) return MC.toast("Enter a brand name.", "error");
            if (!generic) return MC.toast("Enter a generic name.", "error");

            const data = {
                brand: brand, generic: generic, category: $("mm-category").value, form: $("mm-dosage-form").value,
                strength: $("mm-strength").value.trim() || "—", sched: $("mm-sched").value,
                price: parseFloat($("mm-price").value) || 0, stock: parseInt($("mm-stock").value, 10) || 0,
                reorder: parseInt($("mm-reorder").value, 10) || 0, supplier: $("mm-supplier").value.trim() || "—",
                indications: $("mm-indications").value.trim() || "Not specified.",
            };

            if (editingCode) {
                const m = MEDS.find((x) => x.code === editingCode);
                Object.assign(m, data);
                const existingEl = $("grid-body").querySelector('[data-row-id="' + m.code + '"]');
                if (existingEl) existingEl.outerHTML = rowHTML(m);
                MC.toast(brand + " updated.", "success");
            } else {
                const newRec = mk(Object.assign({ dosage: ["As directed by the prescriber"], warnings: ["Review full prescribing information"] }, data));
                MEDS.unshift(newRec);
                $("grid-body").insertAdjacentHTML("afterbegin", rowHTML(newRec));
                if (window.HSStaticMethods) window.HSStaticMethods.autoInit();
                MC.toast(brand + " added to the formulary.", "success");
            }
            MC.closeModal("med-modal");
            renderAll();
        });

        // Reorder modal
        $("ro-cancel").addEventListener("click", () => MC.closeModal("reorder-modal"));
        $("ro-save").addEventListener("click", function () {
            const m = MEDS.find((x) => x.code === this.dataset.code);
            if (!m) return;
            const qty = parseInt($("ro-qty").value, 10);
            if (!qty || qty < 1) return MC.toast("Enter an order quantity.", "error");
            MC.closeModal("reorder-modal");
            MC.toast("PO raised — " + qty.toLocaleString() + " units of " + m.brand + " from " + $("ro-supplier").value + ".", "success");
        });

        MC.initDeleteModal();
        ["med-modal", "reorder-modal", "del-modal"].forEach(MC.closeOnBackdrop);

        document.addEventListener("keydown", function (e) {
            if (e.key !== "Escape") return;
            closeDrawer();
            ["med-modal", "reorder-modal", "del-modal"].forEach(MC.closeModal);
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();

// ==========================================================================
// pharmacy-dashboard.js
// ==========================================================================
// Dreams HMS — Pharmacy Command Center
// Dr. Daniel Kim's dispensary: Rx kanban, inventory rings, low-stock
// shelf, expiry conveyor, controlled-drug vault, supplier dock, purchase
// center, category shelves, finance ledger and the activity feed.
// Every headline figure derives from the underlying lists. No API.
(function () {
    "use strict";
    if ((location.pathname.split("/").pop() || "index.html") !== "pharmacy-dashboard.html") return;

    const $ = (id) => document.getElementById(id);
    const esc = (v) => String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    const initials = (n) => n.replace(/^(Dr|Mr|Mrs|Ms)\.?\s+/i, "").split(/\s+/).slice(0, 2).map((p) => p.charAt(0).toUpperCase()).join("");
    const toast = (msg, tone) => (window.MC && MC.toast ? MC.toast(msg, tone || "info") : console.log(msg));

    /* ====================================================================
       Data — Central Pharmacy (now = 12:40 PM)
       ==================================================================== */

    const NOW_MIN = 12 * 60 + 40;

    const STEPS = [
        { name: "Prescription Received", time: "Continuous", min: 480, icon: "icon-inbox" },
        { name: "Verification", time: "≈ 4 min", min: 540, icon: "icon-file-check" },
        { name: "Medicine Picking", time: "≈ 6 min", min: 600, icon: "icon-package-search" },
        { name: "Pharmacist Review", time: "≈ 3 min", min: 760, icon: "icon-user-check" },
        { name: "Dispensing", time: "≈ 2 min", min: 900, icon: "icon-pill" },
        { name: "Completed", time: "Handoff", min: 1020, icon: "icon-badge-check" },
    ];
    const CURRENT_STEP = 3; // Pharmacist Review is the pinch point right now

    let RX = [
        { id: "RX-2481", patient: "Miriam Adeyemi", doctor: "Dr. Chen", pri: "Urgent", meds: 4, mins: 3, pay: "Insurance", lane: "new" },
        { id: "RX-2482", patient: "Peter Kowalski", doctor: "Dr. Osei", pri: "Normal", meds: 2, mins: 6, pay: "Paid", lane: "new" },
        { id: "RX-2478", patient: "Rosa Delgado", doctor: "Dr. Chen", pri: "Urgent", meds: 3, mins: 12, pay: "Insurance", lane: "verify" },
        { id: "RX-2479", patient: "Theo Lindqvist", doctor: "Dr. Osei", pri: "Normal", meds: 1, mins: 9, pay: "Pending", lane: "verify" },
        { id: "RX-2475", patient: "Harold Nakamura", doctor: "Dr. Chen", pri: "Normal", meds: 5, mins: 18, pay: "Paid", lane: "prep" },
        { id: "RX-2476", patient: "Sofia Marino", doctor: "Dr. Nakato", pri: "Normal", meds: 2, mins: 15, pay: "Paid", lane: "prep" },
        { id: "RX-2472", patient: "Fatima Al-Rashid", doctor: "Dr. Ferreira", pri: "Emergency", meds: 2, mins: 22, pay: "Insurance", lane: "ready" },
        { id: "RX-2473", patient: "Johan Petersen", doctor: "Dr. Chen", pri: "Normal", meds: 3, mins: 20, pay: "Paid", lane: "ready" },
        { id: "RX-2468", patient: "Margaret Whitfield", doctor: "Dr. Ferreira", pri: "Normal", meds: 6, mins: 0, pay: "Paid", lane: "done" },
        { id: "RX-2469", patient: "Hana Suzuki", doctor: "Dr. Nakato", pri: "Normal", meds: 1, mins: 0, pay: "Paid", lane: "done" },
        { id: "RX-2470", patient: "George Mensah", doctor: "Dr. Chen", pri: "VIP", meds: 2, mins: 0, pay: "Paid", lane: "done" },
    ];
    const LANES = [
        { key: "new", label: "New", tone: "rx-sky" },
        { key: "verify", label: "Verification", tone: "rx-amber" },
        { key: "prep", label: "Preparing", tone: "rx-violet" },
        { key: "ready", label: "Ready", tone: "rx-lime" },
        { key: "done", label: "Dispensed", tone: "rx-emerald" },
    ];
    const NEXT_LANE = { new: "verify", verify: "prep", prep: "ready", ready: "done" };
    const PRI_TONE = { Emergency: "rx-rose", Urgent: "rx-amber", VIP: "rx-violet", Normal: "rx-sky" };
    const PAY_TONE = { Paid: "rx-emerald", Insurance: "rx-sky", Pending: "rx-amber" };
    const DISPENSED_BEFORE = 115; // completed earlier today, before the board's window

    const INVENTORY = [
        { label: "Total Medicines", val: "1,284", pct: 100, tone: "rx-emerald", icon: "icon-boxes", sub: "SKUs on formulary" },
        { label: "Low Stock", val: "17", pct: 22, tone: "rx-amber", icon: "icon-package-minus", sub: "below minimum" },
        { label: "Out of Stock", val: "4", pct: 8, tone: "rx-rose", icon: "icon-package-x", sub: "substitutes flagged" },
        { label: "Expiring Soon", val: "23", pct: 30, tone: "rx-orange, rx-amber", icon: "icon-calendar-x", sub: "within 90 days" },
        { label: "Controlled Drugs", val: "36", pct: 88, tone: "rx-violet", icon: "icon-vault", sub: "vault stock healthy" },
        { label: "Returned Today", val: "6", pct: 15, tone: "rx-sky", icon: "icon-rotate-ccw", sub: "pending restock QC" },
        { label: "Pending Reorders", val: "12", pct: 40, tone: "rx-indigo", icon: "icon-truck", sub: "5 arriving this week" },
        { label: "Recalled Batches", val: "2", pct: 5, tone: "rx-rose", icon: "icon-triangle-alert", sub: "quarantined, pending pickup" },
    ];

    let LOW = [
        { name: "Amoxicillin 500 mg", cat: "Capsules", qty: 42, min: 200, supplier: "MediSupply Co.", next: "Jul 19", tone: "rx-rose" },
        { name: "Insulin Glargine 100 IU", cat: "Injections", qty: 8, min: 40, supplier: "BioPharm Labs", next: "Jul 18", tone: "rx-rose" },
        { name: "Salbutamol Inhaler", cat: "Respiratory", qty: 15, min: 60, supplier: "AeroMed Ltd.", next: "Jul 20", tone: "rx-amber" },
        { name: "Paracetamol Syrup 125 mg", cat: "Syrups", qty: 34, min: 100, supplier: "MediSupply Co.", next: "Jul 19", tone: "rx-amber" },
        { name: "Enoxaparin 40 mg", cat: "Injections", qty: 22, min: 80, supplier: "BioPharm Labs", next: "Jul 21", tone: "rx-amber" },
        { name: "ORS Sachets", cat: "Supplies", qty: 55, min: 150, supplier: "GlobalCare Dist.", next: "Jul 22", tone: "rx-lime" },
    ];

    const EXPIRY = [
        { window: "Today", tone: "rx-rose", critical: true, items: [
            { name: "Adrenaline 1 mg amp", qty: "6 amps", batch: "B-4417" },
            { name: "Cefuroxime 750 mg inj", qty: "12 vials", batch: "B-3921" },
        ] },
        { window: "7 Days", tone: "rx-amber", critical: false, items: [
            { name: "Metronidazole IV 500 mg", qty: "18 bags", batch: "B-4102" },
            { name: "Vitamin K amp", qty: "9 amps", batch: "B-4230" },
            { name: "Lidocaine 2% vial", qty: "14 vials", batch: "B-4055" },
        ] },
        { window: "30 Days", tone: "rx-lime", critical: false, items: [
            { name: "Omeprazole 20 mg caps", qty: "240 caps", batch: "B-3877" },
            { name: "Hepatitis B vaccine", qty: "20 doses", batch: "B-4310" },
            { name: "Diazepam 5 mg tabs", qty: "90 tabs", batch: "B-3990" },
        ] },
        { window: "90 Days", tone: "rx-sky", critical: false, items: [
            { name: "Atorvastatin 20 mg", qty: "600 tabs", batch: "B-3712" },
            { name: "Ibuprofen susp 100 mg", qty: "45 btls", batch: "B-3844" },
        ] },
    ];

    const VAULT = {
        rows: [
            { label: "Controlled medicines", val: "36 SKUs" },
            { label: "Dispensed today", val: "11 doses" },
            { label: "Remaining vault stock", val: "412 units" },
            { label: "Register entries today", val: "22 · dual-signed" },
            { label: "Discrepancies flagged", val: "0 open" },
            { label: "Next reconciliation", val: "Jul 18 · 9:00 AM" },
        ],
        audit: { due: "2:00 PM", items: 3, last: "Jul 15 · clean" },
    };

    let SUPPLIERS = [
        { name: "MediSupply Co.", kind: "Delivery inbound", tone: "rx-sky", eta: "ETA 1:30 PM", detail: "PO-1142 · 18 lines · antibiotics restock", late: false },
        { name: "BioPharm Labs", kind: "Late delivery", tone: "rx-rose", eta: "1 day late", detail: "PO-1138 · insulin cold-chain — escalated", late: true },
        { name: "AeroMed Ltd.", kind: "PO confirmed", tone: "rx-lime", eta: "Ships Jul 19", detail: "PO-1145 · respiratory line", late: false },
    ];

    const PO_STATS = [
        { label: "Purchase requests", n: 6, tone: "rx-sky", icon: "icon-file-plus" },
        { label: "Pending approval", n: 3, tone: "rx-amber", icon: "icon-hourglass" },
        { label: "Approved orders", n: 4, tone: "rx-lime", icon: "icon-check" },
        { label: "Received today", n: 2, tone: "rx-emerald", icon: "icon-package-check" },
    ];
    let PO_LIST = [
        { id: "PO-1146", detail: "Emergency insulin restock · BioPharm", state: "Awaiting approval", tone: "rx-amber" },
        { id: "PO-1145", detail: "Respiratory line · AeroMed", state: "Approved", tone: "rx-lime" },
        { id: "PO-1144", detail: "IV fluids bulk · GlobalCare", state: "Received", tone: "rx-emerald" },
    ];

    const CATS = [
        { name: "Tablets", icon: "icon-tablets", pct: 84, tone: "rx-emerald", n: "486 SKUs" },
        { name: "Capsules", icon: "icon-pill", pct: 71, tone: "rx-lime", n: "302 SKUs" },
        { name: "Syrups", icon: "icon-flask-round", pct: 58, tone: "rx-amber", n: "124 SKUs" },
        { name: "Injections", icon: "icon-syringe", pct: 43, tone: "rx-rose", n: "168 SKUs" },
        { name: "Vaccines", icon: "icon-shield-plus", pct: 77, tone: "rx-sky", n: "38 SKUs" },
        { name: "Supplies", icon: "icon-briefcase-medical", pct: 66, tone: "rx-violet", n: "166 SKUs" },
    ];

    const FIN = [
        { label: "Daily Sales", val: "$6,240", n: "142 receipts", tone: "rx-lime", icon: "icon-receipt" },
        { label: "Insurance Claims", val: "$3,910", n: "31 claims filed", tone: "rx-sky", icon: "icon-shield-check" },
        { label: "Refunds", val: "$180", n: "4 processed", tone: "rx-rose", icon: "icon-rotate-ccw" },
        { label: "Purchase Cost", val: "$4,860", n: "3 POs paid", tone: "rx-amber", icon: "icon-shopping-cart" },
    ];

    let ACTIVITY = [
        { time: "12:36 PM", cat: "Prescriptions", icon: "icon-file-check", tone: "rx-emerald", text: "RX-2478 verified — interaction check clear for Rosa Delgado" },
        { time: "12:32 PM", cat: "Dispensing", icon: "icon-pill", tone: "rx-lime", text: "RX-2470 dispensed to George Mensah — counselling done at Counter 3" },
        { time: "12:28 PM", cat: "Stock", icon: "icon-package-minus", tone: "rx-amber", text: "Low stock alert — Insulin Glargine below minimum (8 left)" },
        { time: "12:20 PM", cat: "Controlled", icon: "icon-vault", tone: "rx-violet", text: "Morphine 10 mg issued to ICU — dual signature logged" },
        { time: "12:12 PM", cat: "Purchases", icon: "icon-shopping-cart", tone: "rx-sky", text: "PO-1146 raised — emergency insulin restock sent for approval" },
        { time: "12:05 PM", cat: "Stock", icon: "icon-rotate-ccw", tone: "rx-amber", text: "6 units of Ceftriaxone returned from Ward 4B — QC pending" },
        { time: "11:58 AM", cat: "Dispensing", icon: "icon-pill", tone: "rx-lime", text: "RX-2469 dispensed to Hana Suzuki — insurance co-pay collected" },
        { time: "11:45 AM", cat: "Prescriptions", icon: "icon-inbox", tone: "rx-emerald", text: "4 new e-prescriptions received from OPD clinics" },
        { time: "11:30 AM", cat: "Purchases", icon: "icon-package-check", tone: "rx-sky", text: "PO-1144 received — 24 lines checked into main store" },
        { time: "11:10 AM", cat: "Controlled", icon: "icon-clipboard-check", tone: "rx-violet", text: "Vault count reconciled — no variance across 36 SKUs" },
    ];

    /* ====================================================================
       Renderers
       ==================================================================== */

    function renderHero() {
        const strip = $("urgent-strip");
        const e = RX.find((r) => r.pri === "Emergency" && r.lane !== "done");
        if (e) {
            strip.classList.add("is-alert");
            strip.innerHTML =
                '<span class="grid size-9 shrink-0 place-items-center rounded-xl bg-rose-500/25 text-rose-200"><i class="icon-siren" aria-hidden="true"></i></span>' +
                '<div class="min-w-0 flex-1"><p class="text-xs font-extrabold uppercase tracking-wider text-rose-200">Emergency order — ' + esc(e.id) + "</p>" +
                '<p class="mt-0.5 text-xs font-medium text-white/70">' + esc(e.patient) + " · " + esc(e.doctor) + " · " + e.meds + " items · waiting " + e.mins + " min — ready for handoff at Counter 1.</p></div>" +
                '<button type="button" id="btn-rush" class="rx-action shrink-0"><i class="icon-zap" aria-hidden="true"></i>Fast-track</button>';
            $("btn-rush").addEventListener("click", () => {
                e.lane = "done";
                renderAll();
                toast(e.id + " fast-tracked and dispensed — porter notified.", "success");
            });
        } else {
            strip.classList.remove("is-alert");
            strip.innerHTML =
                '<span class="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-400/20 text-emerald-200"><i class="icon-shield-check" aria-hidden="true"></i></span>' +
                '<div class="min-w-0 flex-1"><p class="text-xs font-extrabold uppercase tracking-wider text-emerald-200">No emergency orders</p>' +
                '<p class="mt-0.5 text-xs font-medium text-white/70">All urgent prescriptions cleared. Crash-cart stock verified at 12:00 PM.</p></div>';
        }
    }

    function renderSteps() {
        $("steps").innerHTML = STEPS.map((s, i) => {
            const state = i < CURRENT_STEP ? "is-done" : i === CURRENT_STEP ? "is-now" : "";
            return (
                '<li class="rx-step ' + state + '">' +
                '<span class="rx-step-node"><i class="' + s.icon + '" aria-hidden="true"></i></span>' +
                '<div><p class="rx-step-name">' + esc(s.name) + '</p><p class="rx-step-time">' + esc(s.time) + "</p></div>" +
                (i === CURRENT_STEP ? '<span class="rx-chip rx-emerald">Now</span>' : "") +
                "</li>"
            );
        }).join("");
        $("steps-chip").textContent = STEPS[CURRENT_STEP].name + " — busiest stage";
    }

    function renderKanban() {
        $("kanban").innerHTML = LANES.map((l) => {
            const items = RX.filter((r) => r.lane === l.key);
            return (
                '<div class="rx-lane ' + l.tone + '" data-lane="' + l.key + '"><div class="mb-2 flex items-center justify-between px-1">' +
                '<p class="text-[11px] font-extrabold uppercase tracking-wider text-gray-500">' + l.label + '</p><span class="rx-chip ' + l.tone + '">' + items.length + "</span></div>" +
                (items.map((r) => (
                    '<div class="rx-card ' + l.tone + (r.pri === "Emergency" && l.key !== "done" ? " is-stat" : "") + '" draggable="true" data-id="' + esc(r.id) + '">' +
                    '<div class="flex items-center gap-1.5">' +
                    '<span class="rx-id">' + esc(r.id) + "</span>" +
                    (r.pri !== "Normal" ? '<span class="rx-chip ' + PRI_TONE[r.pri] + ' text-[9px]">' + r.pri + "</span>" : "") +
                    (r.mins && l.key !== "done" ? '<span class="ml-auto text-[9px] font-bold text-gray-400 tabular-nums"><i class="icon-clock text-[9px]" aria-hidden="true"></i> ' + r.mins + "m</span>" : "") +
                    "</div>" +
                    '<p class="mt-1.5 truncate text-xs font-extrabold text-gray-900">' + esc(r.patient) + "</p>" +
                    '<p class="mt-0.5 text-[10px] font-semibold text-gray-500">' + esc(r.doctor) + " · " + r.meds + ' item' + (r.meds > 1 ? "s" : "") + "</p>" +
                    '<span class="mt-1 rx-chip ' + PAY_TONE[r.pay] + ' text-[9px]">' + r.pay + "</span>" +
                    (l.key !== "done"
                        ? '<div class="mt-2 flex items-center gap-0.5 border-t border-dashed border-border-color pt-1.5 dark:border-white/10" role="group" aria-label="' + esc(r.id) + ' actions">' +
                          '<button type="button" class="rx-card-btn" data-rx="view" data-id="' + esc(r.id) + '" title="View" aria-label="View prescription"><i class="icon-eye" aria-hidden="true"></i></button>' +
                          (l.key === "new" ? '<button type="button" class="rx-card-btn" data-rx="advance" data-id="' + esc(r.id) + '" title="Verify" aria-label="Verify"><i class="icon-file-check" aria-hidden="true"></i></button>' : "") +
                          (l.key === "verify" || l.key === "prep" ? '<button type="button" class="rx-card-btn" data-rx="advance" data-id="' + esc(r.id) + '" title="Advance" aria-label="Advance stage"><i class="icon-arrow-right" aria-hidden="true"></i></button>' : "") +
                          (l.key === "ready" ? '<button type="button" class="rx-card-btn" data-rx="advance" data-id="' + esc(r.id) + '" title="Dispense" aria-label="Dispense"><i class="icon-pill" aria-hidden="true"></i></button>' : "") +
                          '<button type="button" class="rx-card-btn" data-rx="hold" data-id="' + esc(r.id) + '" title="Hold" aria-label="Hold"><i class="icon-pause" aria-hidden="true"></i></button>' +
                          '<button type="button" class="rx-card-btn" data-rx="label" data-id="' + esc(r.id) + '" title="Print label" aria-label="Print label"><i class="icon-printer" aria-hidden="true"></i></button>' +
                          "</div>"
                        : "") +
                    "</div>"
                )).join("") || '<p class="py-4 text-center text-[10px] font-semibold text-gray-400">Empty</p>') +
                "</div>"
            );
        }).join("");
        const active = RX.filter((r) => r.lane !== "done").length;
        const avg = Math.round(RX.filter((r) => r.lane !== "done").reduce((s, r) => s + r.mins, 0) / Math.max(1, active));
        $("queue-chip").textContent = active + " active · avg " + avg + "m in queue";
    }

    function renderInventory() {
        $("inventory").innerHTML = INVENTORY.map((v) => {
            const tone = v.tone.split(",").pop().trim();
            const C = 2 * Math.PI * 20;
            return (
                '<div class="rx-inv ' + tone + '">' +
                '<span class="rx-ring"><svg viewBox="0 0 48 48"><circle class="rx-ring-track" cx="24" cy="24" r="20" fill="none" stroke="currentColor" stroke-width="4"/>' +
                '<circle class="rx-ring-fill" cx="24" cy="24" r="20" fill="none" stroke-width="4" stroke-linecap="round" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + (C * (1 - v.pct / 100)).toFixed(1) + '"/></svg>' +
                '<span class="rx-ring-label"><i class="' + v.icon + '" aria-hidden="true"></i></span></span>' +
                '<div class="min-w-0"><p class="text-base font-extrabold leading-none text-gray-900 tabular-nums">' + v.val + "</p>" +
                '<p class="mt-0.5 text-[10px] font-bold text-gray-500">' + v.label + "</p>" +
                '<p class="text-[9px] font-semibold text-gray-400">' + v.sub + "</p></div></div>"
            );
        }).join("");
    }

    function renderLow() {
        $("lowstock").innerHTML = LOW.map((m, i) => {
            const pct = Math.min(100, Math.round((m.qty / m.min) * 100));
            return (
                '<div class="rx-med ' + m.tone + '"><div class="flex items-start justify-between gap-2">' +
                '<div class="min-w-0"><p class="truncate text-xs font-extrabold text-gray-900">' + esc(m.name) + "</p>" +
                '<p class="mt-0.5 text-[10px] font-bold text-gray-500">' + esc(m.cat) + " · " + esc(m.supplier) + "</p></div>" +
                '<button type="button" data-po="' + i + '" class="shrink-0 rounded-lg bg-emerald-500/10 px-2 py-1 text-[10px] font-extrabold text-emerald-600 transition-colors hover:bg-emerald-500/20 dark:text-emerald-300">Reorder</button></div>' +
                '<div class="rx-med-track"><div class="rx-med-fill" style="width:0%" data-w="' + pct + '"></div></div>' +
                '<div class="mt-1.5 flex items-center justify-between text-[10px] font-semibold text-gray-400">' +
                '<span class="tabular-nums"><b class="font-extrabold text-gray-700 dark:text-gray-200">' + m.qty + "</b> of " + m.min + " min</span>" +
                '<span><i class="icon-calendar text-[10px]" aria-hidden="true"></i> Next PO ' + esc(m.next) + "</span></div></div>"
            );
        }).join("");
        requestAnimationFrame(() => document.querySelectorAll(".rx-med-fill").forEach((f) => (f.style.width = f.dataset.w + "%")));
        $("low-chip").textContent = LOW.length + " below minimum";
    }

    function renderExpiry() {
        $("expiry").innerHTML = EXPIRY.map((w) => (
            '<div class="rx-exp ' + w.tone + (w.critical ? " is-critical" : "") + '">' +
            '<div class="mb-2 flex items-center justify-between"><p class="text-[11px] font-extrabold uppercase tracking-wider text-gray-500">' + w.window + '</p>' +
            '<span class="rx-chip ' + w.tone + '">' + w.items.length + (w.critical ? " · act now" : "") + "</span></div>" +
            w.items.map((it) => (
                '<div class="rx-exp-item"><div class="min-w-0"><p class="truncate font-extrabold text-gray-800 dark:text-gray-200">' + esc(it.name) + '</p>' +
                '<p class="text-[9px] text-gray-400">Batch ' + esc(it.batch) + "</p></div>" +
                '<span class="shrink-0 tabular-nums text-[10px] font-bold text-gray-500">' + esc(it.qty) + "</span></div>"
            )).join("") +
            "</div>"
        )).join("");
        $("exp-chip").textContent = EXPIRY[0].items.length + " expiring today";
    }

    function renderVault() {
        $("vault").innerHTML =
            VAULT.rows.map((r) => '<div class="rx-vault-row"><span>' + r.label + '</span><b class="font-extrabold text-gray-900 tabular-nums">' + r.val + "</b></div>").join("");
        $("vault-audit").innerHTML =
            '<div class="flex items-center gap-2.5"><span class="rx-panel-icon rx-amber !size-8 text-xs"><i class="icon-clipboard-check" aria-hidden="true"></i></span>' +
            '<div class="min-w-0 flex-1"><p class="text-[11px] font-extrabold text-gray-900">Audit pending — ' + VAULT.audit.items + ' schedules</p>' +
            '<p class="text-[10px] font-semibold text-gray-400">Due ' + VAULT.audit.due + " · last audit " + VAULT.audit.last + "</p></div>" +
            '<button type="button" id="btn-vault-audit" class="shrink-0 rounded-lg bg-violet-500/10 px-2 py-1 text-[10px] font-extrabold text-violet-600 transition-colors hover:bg-violet-500/20 dark:text-violet-300">Start</button></div>';
        $("btn-vault-audit").addEventListener("click", () => toast("Controlled-drug audit opened — second pharmacist signature required.", "info"));
    }

    function renderSuppliers() {
        $("suppliers").innerHTML = SUPPLIERS.map((s, i) => (
            '<div class="rx-sup ' + s.tone + '"><span class="rx-sup-logo">' + esc(initials(s.name)) + "</span>" +
            '<div class="min-w-0 flex-1"><div class="flex items-center gap-2"><p class="truncate text-xs font-extrabold text-gray-900">' + esc(s.name) + '</p>' +
            '<span class="ml-auto shrink-0 text-[10px] font-bold ' + (s.late ? "text-rose-500" : "text-gray-400") + ' tabular-nums">' + esc(s.eta) + "</span></div>" +
            '<span class="mt-0.5 rx-chip ' + s.tone + ' text-[9px]">' + s.kind + "</span>" +
            '<p class="mt-1 truncate text-[10px] font-semibold text-gray-400">' + esc(s.detail) + "</p></div>" +
            (s.late ? '<button type="button" data-chase="' + i + '" class="shrink-0 self-center rounded-lg bg-rose-500/10 px-2 py-1 text-[10px] font-extrabold text-rose-600 transition-colors hover:bg-rose-500/20 dark:text-rose-300">Chase</button>' : "") +
            "</div>"
        )).join("");
        $("sup-chip").textContent = SUPPLIERS.length + " active · " + SUPPLIERS.filter((s) => s.late).length + " late";
    }

    function renderPo() {
        $("po-stats").innerHTML = PO_STATS.map((s) => (
            '<div class="rx-panel ' + s.tone + ' !flex-row items-center gap-2.5 !rounded-2xl p-2.5"><span class="rx-panel-icon !size-8 text-xs"><i class="' + s.icon + '" aria-hidden="true"></i></span>' +
            '<div><p class="text-base font-extrabold leading-none text-gray-900 tabular-nums">' + s.n + '</p><p class="mt-0.5 text-[10px] font-bold text-gray-400">' + s.label + "</p></div></div>"
        )).join("");
        $("po-list").innerHTML = PO_LIST.map((p) => (
            '<div class="flex items-center gap-2.5 rounded-xl border border-border-color p-2.5 dark:border-white/10">' +
            '<span class="rx-id ' + p.tone + '">' + esc(p.id) + "</span>" +
            '<p class="min-w-0 flex-1 truncate text-[11px] font-semibold text-gray-600 dark:text-gray-300">' + esc(p.detail) + "</p>" +
            '<span class="rx-chip ' + p.tone + ' text-[9px]">' + p.state + "</span></div>"
        )).join("");
    }

    function renderCats() {
        $("categories").innerHTML = CATS.map((c) => {
            const C = 2 * Math.PI * 24;
            return (
                '<div class="rx-shelf ' + c.tone + '">' +
                '<div class="relative mx-auto grid size-16 place-items-center">' +
                '<svg class="absolute inset-0 size-16 -rotate-90" viewBox="0 0 56 56"><circle class="rx-ring-track" cx="28" cy="28" r="24" fill="none" stroke="currentColor" stroke-width="4"/>' +
                '<circle class="rx-ring-fill" cx="28" cy="28" r="24" fill="none" stroke-width="4" stroke-linecap="round" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + (C * (1 - c.pct / 100)).toFixed(1) + '"/></svg>' +
                '<span class="rx-shelf-icon !size-9 !text-sm"><i class="' + c.icon + '" aria-hidden="true"></i></span></div>' +
                '<p class="mt-2 text-xs font-extrabold text-gray-900">' + c.name + "</p>" +
                '<p class="text-[10px] font-bold text-gray-400">' + c.n + '</p>' +
                '<p class="mt-0.5 text-[11px] font-extrabold tabular-nums" style="color:var(--rx-accent)">' + c.pct + "% stocked</p></div>"
            );
        }).join("");
    }

    function renderFin() {
        $("fin-hero").innerHTML =
            '<div class="flex items-center justify-between"><p class="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Pharmacy Revenue · Today</p>' +
            '<span class="rx-chip rx-emerald text-[9px]"><i class="icon-trending-up text-[9px]" aria-hidden="true"></i>Margin 28.4%</span></div>' +
            '<p class="mt-1.5 text-3xl font-extrabold text-gray-900 tabular-nums">$10,150</p>' +
            '<p class="mt-0.5 text-[10px] font-semibold text-gray-400">Sales + claims − refunds · vs $9,320 yesterday</p>';
        $("finance").innerHTML = FIN.map((f) => (
            '<div class="rx-fin ' + f.tone + '"><div class="flex items-center gap-2"><span class="rx-panel-icon !size-7 text-[11px]"><i class="' + f.icon + '" aria-hidden="true"></i></span>' +
            '<p class="text-[10px] font-extrabold uppercase tracking-wide text-gray-400">' + f.label + "</p></div>" +
            '<p class="mt-1.5 text-xl font-extrabold text-gray-900 tabular-nums">' + f.val + '</p><p class="text-[10px] font-semibold text-gray-400">' + f.n + "</p></div>"
        )).join("");
    }

    let actFilter = "All";
    function renderActivity() {
        const cats = ["All"].concat([...new Set(ACTIVITY.map((a) => a.cat))]);
        $("act-filters").innerHTML = cats.map((c) =>
            '<button type="button" data-cat="' + c + '" aria-pressed="' + (actFilter === c) + '" class="rx-chip rx-sky cursor-pointer' + (actFilter === c ? "" : " opacity-50") + '">' + c + "</button>"
        ).join("");
        $("activity").innerHTML = ACTIVITY.filter((a) => actFilter === "All" || a.cat === actFilter).map((a) => (
            '<div class="rx-tl ' + a.tone + '"><span class="rx-tl-icon"><i class="' + a.icon + '" aria-hidden="true"></i></span>' +
            '<div class="min-w-0 flex-1 pb-1"><div class="flex items-center gap-2"><span class="rx-chip ' + a.tone + ' text-[9px]">' + a.cat + '</span><span class="text-[10px] font-semibold text-gray-400 tabular-nums">' + esc(a.time) + "</span></div>" +
            '<p class="mt-1 text-[11px] font-semibold leading-relaxed text-gray-700 dark:text-gray-300">' + esc(a.text) + "</p></div></div>"
        )).join("");
    }

    function renderAll() {
        renderHero();
        renderKanban();
    }

    let dragRxId = null;
    document.addEventListener("dragstart", (e) => {
        const card = e.target.closest("#kanban [data-id]");
        if (!card) return;
        dragRxId = card.dataset.id;
        card.classList.add("is-dragging");
    });
    document.addEventListener("dragend", (e) => {
        const card = e.target.closest("#kanban [data-id]");
        if (card) card.classList.remove("is-dragging");
        document.querySelectorAll("#kanban .rx-lane").forEach((l) => l.classList.remove("is-drop-target"));
    });
    document.addEventListener("dragover", (e) => {
        const lane = e.target.closest("#kanban [data-lane]");
        if (!lane) return;
        e.preventDefault();
        document.querySelectorAll("#kanban .rx-lane").forEach((l) => l.classList.toggle("is-drop-target", l === lane));
    });
    document.addEventListener("drop", (e) => {
        const lane = e.target.closest("#kanban [data-lane]");
        if (!lane || dragRxId == null) return;
        e.preventDefault();
        const r = RX.find((x) => x.id === dragRxId);
        if (r && r.lane !== lane.dataset.lane) {
            r.lane = lane.dataset.lane;
            if (r.lane === "done") r.mins = 0;
            renderAll();
            toast(r.id + " moved to " + LANES.find((l) => l.key === r.lane).label + ".", "success");
        }
        dragRxId = null;
    });

    /* ====================================================================
       Wiring
       ==================================================================== */

    function init() {
        renderHero();
        renderSteps();
        renderKanban();
        renderInventory();
        renderLow();
        renderExpiry();
        renderVault();
        renderSuppliers();
        renderPo();
        renderCats();
        renderFin();
        renderActivity();

        // Kanban ops
        $("kanban").addEventListener("click", (e) => {
            const btn = e.target.closest("[data-rx]");
            if (!btn) return;
            const r = RX.find((x) => x.id === btn.dataset.id);
            const op = btn.dataset.rx;
            if (op === "view") return toast(r.id + " opened — " + r.meds + " items for " + r.patient + ".", "info");
            if (op === "label") return toast("Label printed for " + r.id + " — " + r.patient + ".", "success");
            if (op === "hold") {
                r.lane = "new";
                renderAll();
                return toast(r.id + " placed on hold — returned to New.", "info");
            }
            if (op === "advance") {
                const to = NEXT_LANE[r.lane];
                r.lane = to;
                if (to === "done") r.mins = 0;
                renderAll();
                const msg = { verify: "sent to verification", prep: "verified — picking started", ready: "reviewed — ready at counter", done: "dispensed to " + r.patient }[to];
                toast(r.id + " " + msg + ".", "success");
            }
        });

        // Low stock reorder
        $("lowstock").addEventListener("click", (e) => {
            const b = e.target.closest("[data-po]");
            if (!b) return;
            const m = LOW[parseInt(b.dataset.po, 10)];
            toast("Purchase request raised for " + m.name + " — " + m.supplier + ".", "success");
        });
        $("btn-po-all").addEventListener("click", () => toast("Bulk purchase order drafted for " + LOW.length + " low-stock lines.", "success"));

        // Suppliers
        $("suppliers").addEventListener("click", (e) => {
            const b = e.target.closest("[data-chase]");
            if (!b) return;
            const s = SUPPLIERS[parseInt(b.dataset.chase, 10)];
            s.late = false;
            s.kind = "Escalated — replied";
            s.tone = "rx-amber";
            s.eta = "ETA 4:00 PM";
            renderSuppliers();
            toast(s.name + " chased — cold-chain delivery confirmed for 4:00 PM.", "success");
        });

        $("btn-new-po").addEventListener("click", () => {
            PO_LIST.unshift({ id: "PO-1147", detail: "Draft — add lines from low stock", state: "Awaiting approval", tone: "rx-amber" });
            renderPo();
            toast("PO-1147 drafted — add lines and submit for approval.", "success");
        });

        // Activity filters
        $("act-filters").addEventListener("click", (e) => {
            const c = e.target.closest("[data-cat]");
            if (!c) return;
            actFilter = c.dataset.cat;
            renderActivity();
        });

        // Hero quick actions
        $("btn-newrx").addEventListener("click", () => {
            const id = "RX-" + (2483 + RX.filter((r) => r.id.startsWith("RX-24") && parseInt(r.id.slice(3), 10) > 2482).length);
            RX.unshift({ id, patient: "Walk-in Patient", doctor: "Dr. Ferreira", pri: "Normal", meds: 1, mins: 0, pay: "Pending", lane: "new" });
            renderAll();
            toast(id + " added to the queue.", "success");
        });
        $("btn-dispense").addEventListener("click", () => {
            const r = RX.find((x) => x.lane === "ready");
            if (!r) return toast("Nothing in Ready — advance a prescription first.", "info");
            r.lane = "done";
            r.mins = 0;
            renderAll();
            toast(r.id + " dispensed to " + r.patient + " at Counter 1.", "success");
        });
        $("btn-audit").addEventListener("click", () => toast("Cycle count started — shelf A1–A6 assigned to technician.", "info"));

        // Floating dock
        const fab = $("dock-fab"), menu = $("dock-menu");
        fab.addEventListener("click", () => {
            const open = menu.classList.toggle("is-closed");
            fab.classList.toggle("is-open", !open);
            fab.setAttribute("aria-expanded", String(!open));
        });
        menu.addEventListener("click", (e) => {
            const item = e.target.closest("[data-act]");
            if (!item) return;
            menu.classList.add("is-closed");
            fab.classList.remove("is-open");
            fab.setAttribute("aria-expanded", "false");
            toast(item.dataset.act + (item.dataset.act === "Emergency Medicine Issue" ? " — vault access requested, dual signature needed." : " opened."), item.dataset.act === "Emergency Medicine Issue" ? "error" : "success");
        });
        document.addEventListener("click", (e) => {
            if (!e.target.closest(".rx-dock")) {
                menu.classList.add("is-closed");
                fab.classList.remove("is-open");
                fab.setAttribute("aria-expanded", "false");
            }
        });
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
})();

// ==========================================================================
// pharmacy-inventory.js
// ==========================================================================
// Dreams HMS — Pharmacy Inventory
// Batch-level stock: quantities, locations, expiry windows and audited
// adjustments. Batch state derives from quantity + expiry. Static demo data.
(function () {
    "use strict";
    if ((location.pathname.split("/").pop() || "index.html") !== "pharmacy-inventory.html") return;

    const $ = (id) => document.getElementById(id);
    const esc = (v) => String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    const detailUrl = (b) => "pharmacy-inventory-detail.html?" + new URLSearchParams({ id: b.id, med: b.med, batch: b.batch, location: b.location }).toString();

    // Days until expiry are stored relative to today (17 Jul 2026) so the
    // demo needs no Date.now() while remaining internally consistent.
    let BATCHES = [
        { id: "BT-8801", med: "Tylenol 500 mg", batch: "TY26H114", location: "Main Pharmacy", qty: 5200, reorder: 1500, days: 412, expiry: "Sep 2027", price: 0.08 },
        { id: "BT-8802", med: "Tylenol 500 mg", batch: "TY26D077", location: "ED Satellite", qty: 900, reorder: 400, days: 168, expiry: "Jan 2027", price: 0.08 },
        { id: "BT-8803", med: "Amoxil 500 mg", batch: "AMX2609", location: "Main Pharmacy", qty: 4100, reorder: 1200, days: 290, expiry: "May 2027", price: 0.22 },
        { id: "BT-8804", med: "Ventolin Inhaler", batch: "VEN26K3", location: "ED Satellite", qty: 310, reorder: 120, days: 74, expiry: "Sep 2026", price: 4.6 },
        { id: "BT-8805", med: "Humulin R", batch: "HUM26C8", location: "Cold Chain", qty: 480, reorder: 200, days: 58, expiry: "Sep 2026", price: 6.2 },
        { id: "BT-8806", med: "Ativan 2 mg/mL", batch: "ATV26F2", location: "OR Store", qty: 140, reorder: 180, days: 132, expiry: "Nov 2026", price: 1.12 },
        { id: "BT-8807", med: "Zofran 4 mg", batch: "ZOF26J9", location: "OR Store", qty: 760, reorder: 300, days: 233, expiry: "Mar 2027", price: 0.74 },
        { id: "BT-8808", med: "Augmentin Syrup", batch: "AUG26B4", location: "Main Pharmacy", qty: 220, reorder: 250, days: 41, expiry: "Aug 2026", price: 0.9 },
        { id: "BT-8809", med: "Lipitor 20 mg", batch: "LIP26M1", location: "Main Pharmacy", qty: 3900, reorder: 1000, days: 502, expiry: "Dec 2027", price: 0.31 },
        { id: "BT-8810", med: "Coumadin 5 mg", batch: "COU26A6", location: "Main Pharmacy", qty: 1600, reorder: 700, days: 85, expiry: "Oct 2026", price: 0.19 },
    ];

    // State derives from quantity vs reorder and days-to-expiry.
    function state(b) {
        if (b.days <= 90) return { key: "expiring", label: "Expiring " + b.days + "d", badge: "badge-amber", tone: "stock-low" };
        if (b.qty <= b.reorder) return { key: "low", label: "Below Reorder", badge: "badge-red", tone: "stock-out" };
        return { key: "ok", label: "Healthy", badge: "badge-green", tone: "stock-ok" };
    }

    const money = (n) => "$" + Math.round(n).toLocaleString();

    function renderHero() {
        const low = BATCHES.filter((b) => state(b).key === "low").length;
        const exp = BATCHES.filter((b) => state(b).key === "expiring").length;
        const flag =
            low + exp >= 5 ? { cls: "tone-critical", text: "Stock Attention Needed" }
            : low + exp >= 2 ? { cls: "tone-medium", text: low + exp + " Batches Flagged" }
            : { cls: "tone-stable", text: "Stock Healthy" };
        $("ph-flag").className = "hms-chip " + flag.cls;
        $("ph-flag-text").textContent = flag.text;
        $("hero-summary").textContent = BATCHES.length + " batches · " + BATCHES.reduce((s, b) => s + b.qty, 0).toLocaleString() + " units";
    }

    function renderKpis() {
        const units = BATCHES.reduce((s, b) => s + b.qty, 0);
        const value = BATCHES.reduce((s, b) => s + b.qty * b.price, 0);
        const low = BATCHES.filter((b) => state(b).key === "low").length;
        const exp = BATCHES.filter((b) => state(b).key === "expiring").length;
        const cold = BATCHES.filter((b) => b.location === "Cold Chain").length;

        const cards = [
            { id: "kpi-batches", icon: "icon-package", label: "Batches", value: BATCHES.length, tone: "ph-primary", meta: "tracked lots" },
            { id: "kpi-units", icon: "icon-boxes", label: "Units On Hand", value: units.toLocaleString(), tone: "ph-sky", meta: "all locations" },
            { id: "kpi-low", icon: "icon-triangle-alert", label: "Below Reorder", value: low, tone: "ph-danger", meta: "need ordering" },
            { id: "kpi-exp", icon: "icon-calendar-clock", label: "Expiring ≤ 90d", value: exp, tone: "ph-amber", meta: "rotate first" },
            { id: "kpi-cold", icon: "icon-thermometer", label: "Cold Chain", value: cold, tone: "ph-violet", meta: "2–8 °C storage" },
            { id: "kpi-value", icon: "icon-dollar-sign", label: "Stock Value", value: "$" + Math.round(value / 1000) + "k", tone: "ph-slate", meta: "at unit cost" },
        ];

        $("kpi-row").innerHTML = cards
            .map((c) =>
                '<article class="ph-kpi ' + c.tone + '"><div class="ph-kpi-head"><span class="ph-kpi-icon"><i class="' + c.icon + '" aria-hidden="true"></i></span></div>' +
                '<p class="ph-kpi-value"><span id="' + c.id + '">' + c.value + '</span></p><p class="ph-kpi-label">' + c.label + "</p>" +
                '<p class="ph-kpi-meta"><i class="icon-circle-dot text-[8px]" aria-hidden="true"></i>' + c.meta + "</p></article>"
            )
            .join("");
    }

    // One row's markup for a batch (used both for the static rows already in
    // the page and to patch a single row after an adjust/move edit).
    function rowHTML(b) {
        const s = state(b);
        const pct = Math.min(100, Math.round((b.qty / (b.reorder * 2)) * 100));
        return (
            '<tr class="hms-row" data-row-id="' + esc(b.id) + '">' +
            '<td class="hms-cell"><p class="text-xs font-bold text-gray-900">' + esc(b.med) + "</p>" +
            '<a href="' + detailUrl(b) + '" class="text-[10px] text-gray-400 hover:text-primary hover:underline">' + esc(b.id) + "</a></td>" +
            '<td class="hms-cell"><span class="font-mono text-[11px] font-bold text-gray-900">' + esc(b.batch) + "</span></td>" +
            '<td class="hms-cell"><span class="hms-chip tone-info">' + esc(b.location) + "</span></td>" +
            '<td class="hms-cell"><div class="flex items-center gap-2 min-w-28">' +
            '<svg class="ph-stock ' + s.tone + '" viewBox="0 0 100 6" preserveAspectRatio="none" role="img" aria-label="' + b.qty + ' units">' +
            '<rect x="0" y="0" width="100" height="6" rx="3" fill="currentColor" opacity="0.15"></rect>' +
            '<rect x="0" y="0" width="' + pct + '" height="6" rx="3" fill="currentColor"></rect></svg>' +
            '<span class="text-xs font-extrabold text-gray-900 tabular-nums">' + b.qty.toLocaleString() + "</span></div>" +
            '<p class="mt-0.5 text-[10px] font-semibold text-gray-400">reorder @ ' + b.reorder.toLocaleString() + "</p></td>" +
            '<td class="hms-cell"><p class="text-xs font-semibold text-gray-700 dark:text-gray-300">' + esc(b.expiry) + "</p>" +
            '<p class="text-[10px] ' + (b.days <= 90 ? "font-bold text-warning" : "text-gray-400") + '">' + b.days + " days</p></td>" +
            '<td class="hms-cell"><span class="text-xs font-bold text-gray-900 tabular-nums">' + money(b.qty * b.price) + "</span></td>" +
            '<td class="hms-cell"><span class="badge ' + s.badge + '">' + s.label + "</span></td>" +
            '<td class="hms-cell text-right">' +
            MC.actions(b.id, [
                { label: "Adjust Quantity", icon: "icon-scale", act: "adjust" },
                { label: "Move Location", icon: "icon-arrow-right-left", act: "move" },
                { label: "Write Off Batch", icon: "icon-trash-2", act: "writeoff", danger: true },
            ]) +
            "</td></tr>"
        );
    }

    // Rows are already present as static HTML, soonest-expiry-first (fixed
    // order that never changes, since edits here never touch `days`).
    // Filtering now only toggles visibility on the existing [data-row-id]
    // rows instead of rebuilding the table body.
    function renderGrid() {
        const q = $("search").value.trim().toLowerCase();
        const loc = $("filter-location").value;
        const st = $("filter-state").value;

        const rows = BATCHES.filter((b) => {
            const hit = !q || b.med.toLowerCase().includes(q) || b.batch.toLowerCase().includes(q);
            return hit && (!loc || b.location === loc) && (!st || state(b).key === st);
        });
        const visible = new Set(rows.map((b) => b.id));

        $("grid-count").textContent = rows.length + (rows.length === 1 ? " batch" : " batches");

        let anyVisible = false;
        $("grid-body").querySelectorAll("[data-row-id]").forEach((tr) => {
            const show = visible.has(tr.dataset.rowId);
            tr.classList.toggle("hidden", !show);
            if (show) anyVisible = true;
        });
        const emptyRow = $("grid-empty-row");
        if (emptyRow) emptyRow.classList.toggle("hidden", anyVisible);
    }

    // Hero flag/summary and the 6 KPI cards are baked into the HTML for the
    // initial BATCHES state; renderHero()/renderKpis() are only invoked
    // again after a genuine mutation (adjust/move/write off) below.
    function renderAll() {
        renderHero();
        renderKpis();
        renderGrid();
    }

    function openAdjust(id) {
        $("am-batch").innerHTML = BATCHES.map((b) =>
            '<option value="' + esc(b.id) + '"' + (b.id === id ? " selected" : "") + ">" + esc(b.med) + " — " + esc(b.batch) + " (" + b.qty.toLocaleString() + ")</option>"
        ).join("");
        const b = BATCHES.find((x) => x.id === (id || BATCHES[0].id));
        $("am-qty").value = b ? b.qty : "";
        $("am-notes").value = "";
        MC.openModal("adj-modal");
    }

    function init() {
        document.body.insertAdjacentHTML("beforeend", MC.deleteModalHTML);
        // Hero/KPIs are already correct in the static HTML for the initial
        // BATCHES state; only the batch grid needs an initial render.
        renderGrid();

        $("search").addEventListener("input", renderGrid);
        $("filter-location").addEventListener("change", renderGrid);
        $("filter-state").addEventListener("change", renderGrid);

        $("grid-body").addEventListener("click", function (e) {
            const btn = e.target.closest("[data-act]");
            if (!btn) return;
            const b = BATCHES.find((x) => x.id === btn.dataset.id);
            if (!b) return;
            if (btn.dataset.act === "adjust") openAdjust(b.id);
            else if (btn.dataset.act === "move") {
                b.location = b.location === "Main Pharmacy" ? "ED Satellite" : "Main Pharmacy";
                const rowEl = $("grid-body").querySelector('[data-row-id="' + b.id + '"]');
                if (rowEl) rowEl.outerHTML = rowHTML(b);
                if (window.HSStaticMethods) window.HSStaticMethods.autoInit();
                renderAll();
                MC.toast(b.batch + " moved to " + b.location + ".", "success");
            } else if (btn.dataset.act === "writeoff") {
                MC.confirmDelete(b.med + " batch " + b.batch, function () {
                    BATCHES = BATCHES.filter((x) => x.id !== b.id);
                    const rowEl = $("grid-body").querySelector('[data-row-id="' + b.id + '"]');
                    if (rowEl) rowEl.remove();
                    renderAll();
                    MC.toast(b.batch + " written off and removed from stock.", "info");
                });
            }
        });

        $("btn-adjust").addEventListener("click", () => openAdjust(null));
        $("btn-count").addEventListener("click", () => MC.toast("Cycle count started — " + BATCHES.length + " batches on the sheet.", "info"));
        $("btn-export").addEventListener("click", () => MC.toast("Inventory exported — " + BATCHES.length + " batches.", "success"));

        // Selecting a batch in the modal pre-fills its current quantity.
        $("am-batch").addEventListener("change", function () {
            const b = BATCHES.find((x) => x.id === this.value);
            if (b) $("am-qty").value = b.qty;
        });
        $("am-cancel").addEventListener("click", () => MC.closeModal("adj-modal"));
        $("am-save").addEventListener("click", function () {
            const b = BATCHES.find((x) => x.id === $("am-batch").value);
            if (!b) return;
            const qty = parseInt($("am-qty").value, 10);
            if (isNaN(qty) || qty < 0) return MC.toast("Enter a valid quantity.", "error");
            const delta = qty - b.qty;
            b.qty = qty;
            const rowEl = $("grid-body").querySelector('[data-row-id="' + b.id + '"]');
            if (rowEl) rowEl.outerHTML = rowHTML(b);
            if (window.HSStaticMethods) window.HSStaticMethods.autoInit();
            renderAll();
            MC.toast(b.batch + " adjusted " + (delta >= 0 ? "+" : "") + delta.toLocaleString() + " (" + $("am-reason").value + ").", "success");
            MC.closeModal("adj-modal");
        });

        MC.initDeleteModal();
        ["adj-modal", "del-modal"].forEach(MC.closeOnBackdrop);
        document.addEventListener("keydown", function (e) {
            if (e.key !== "Escape") return;
            ["adj-modal", "del-modal"].forEach(MC.closeModal);
        });
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
})();

// ==========================================================================
// pharmacy-purchase-orders.js
// ==========================================================================
// Dreams HMS — Pharmacy Purchase Orders
// PO pipeline: Draft → Sent → Partially Received → Received. Status is
// derived from items received vs ordered. Static demo data — no API.
(function () {
    "use strict";
    if ((location.pathname.split("/").pop() || "index.html") !== "pharmacy-purchase-orders.html") return;

    const $ = (id) => document.getElementById(id);
    const esc = (v) => String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

    const SUPPLIERS = ["McKesson", "Cardinal Health", "AmerisourceBergen", "Cencora", "Morris & Dickson"];

    let seq = 4170;
    const mk = (o) => (seq++, Object.assign({ id: "PO-" + seq, cancelled: false }, o));

    let ORDERS = [
        mk({ supplier: "McKesson", items: 8, received: 8, value: 18400, expected: "12 Jul 2026", placed: "05 Jul" }),
        mk({ supplier: "Cardinal Health", items: 5, received: 5, value: 9600, expected: "14 Jul 2026", placed: "07 Jul" }),
        mk({ supplier: "AmerisourceBergen", items: 6, received: 4, value: 12750, expected: "17 Jul 2026", placed: "09 Jul" }),
        mk({ supplier: "Cencora", items: 4, received: 0, value: 7300, expected: "19 Jul 2026", placed: "11 Jul" }),
        mk({ supplier: "McKesson", items: 9, received: 3, value: 21050, expected: "18 Jul 2026", placed: "10 Jul" }),
        mk({ supplier: "Morris & Dickson", items: 3, received: 0, value: 4200, expected: "22 Jul 2026", placed: "14 Jul" }),
        mk({ supplier: "Cardinal Health", items: 7, received: 0, value: 15900, expected: "—", placed: "16 Jul", draft: true }),
        mk({ supplier: "Cencora", items: 2, received: 0, value: 1800, expected: "20 Jul 2026", placed: "13 Jul", cancelled: true }),
    ];

    // Status is derived, never stored: cancelled/draft flags first, then the
    // received count decides Sent / Partially Received / Received.
    function status(o) {
        if (o.cancelled) return { label: "Cancelled", badge: "badge-gray" };
        if (o.draft) return { label: "Draft", badge: "badge-blue" };
        if (o.received >= o.items) return { label: "Received", badge: "badge-green" };
        if (o.received > 0) return { label: "Partially Received", badge: "badge-amber" };
        return { label: "Sent", badge: "badge-purple" };
    }

    const money = (n) => "$" + n.toLocaleString();

    function detailUrl(o) {
        const s = status(o);
        return "pharmacy-purchase-order-detail.html?" + new URLSearchParams({
            id: o.id, supplier: o.supplier, items: o.items, received: o.received,
            value: o.value, expected: o.expected, placed: o.placed, status: s.label,
        }).toString();
    }

    function renderHero() {
        const open = ORDERS.filter((o) => !o.cancelled && status(o).label !== "Received").length;
        const partial = ORDERS.filter((o) => status(o).label === "Partially Received").length;
        const flag = partial >= 3 ? { cls: "tone-medium", text: "Deliveries Split" } : { cls: "tone-stable", text: "Procurement Flowing" };
        $("ph-flag").className = "hms-chip " + flag.cls;
        $("ph-flag-text").textContent = flag.text;
        $("hero-summary").textContent = ORDERS.length + " orders · " + open + " open";
    }

    function renderKpis() {
        const by = (l) => ORDERS.filter((o) => status(o).label === l).length;
        const openValue = ORDERS.filter((o) => !o.cancelled && status(o).label !== "Received").reduce((s, o) => s + o.value, 0);

        const cards = [
            { id: "kpi-total", icon: "icon-clipboard-list", label: "Total POs", value: ORDERS.length, tone: "ph-primary", meta: "this quarter" },
            { id: "kpi-draft", icon: "icon-pencil", label: "Draft", value: by("Draft"), tone: "ph-sky", meta: "not yet sent" },
            { id: "kpi-sent", icon: "icon-send", label: "Sent", value: by("Sent"), tone: "ph-violet", meta: "awaiting delivery" },
            { id: "kpi-partial", icon: "icon-package", label: "Partial", value: by("Partially Received"), tone: "ph-amber", meta: "split deliveries" },
            { id: "kpi-received", icon: "icon-package-check", label: "Received", value: by("Received"), tone: "ph-primary", meta: "fully booked in" },
            { id: "kpi-value", icon: "icon-dollar-sign", label: "Open Value", value: "$" + Math.round(openValue / 1000) + "k", tone: "ph-slate", meta: "committed spend" },
        ];

        $("kpi-row").innerHTML = cards
            .map((c) =>
                '<article class="ph-kpi ' + c.tone + '"><div class="ph-kpi-head"><span class="ph-kpi-icon"><i class="' + c.icon + '" aria-hidden="true"></i></span></div>' +
                '<p class="ph-kpi-value"><span id="' + c.id + '">' + c.value + '</span></p><p class="ph-kpi-label">' + c.label + "</p>" +
                '<p class="ph-kpi-meta"><i class="icon-circle-dot text-[8px]" aria-hidden="true"></i>' + c.meta + "</p></article>"
            )
            .join("");
    }

    // One row's markup for an order (used both for the static rows already in
    // the page and to patch a single row after a send/receive/cancel edit).
    function rowHTML(o) {
        const s = status(o);
        const pct = o.items ? Math.round((o.received / o.items) * 100) : 0;
        const tone = pct >= 100 ? "stock-ok" : pct > 0 ? "stock-low" : "stock-out";
        const acts = [{ label: "Print", icon: "icon-printer", act: "print" }];
        if (s.label === "Draft") acts.unshift({ label: "Send to Supplier", icon: "icon-send", act: "send" });
        if (s.label === "Sent" || s.label === "Partially Received") acts.unshift({ label: "Receive Delivery", icon: "icon-package-check", act: "receive" });
        if (!o.cancelled && s.label !== "Received") acts.push({ label: "Cancel PO", icon: "icon-x", act: "cancel", danger: true });

        return (
            '<tr class="hms-row' + (o.cancelled ? " opacity-60" : "") + '" data-row-id="' + esc(o.id) + '">' +
            '<td class="hms-cell"><a href="' + detailUrl(o) + '" class="font-mono text-[11px] font-bold text-primary hover:underline">' + esc(o.id) + "</a>" +
            '<p class="text-[10px] text-gray-400">placed ' + esc(o.placed) + "</p></td>" +
            '<td class="hms-cell"><span class="text-xs font-semibold text-gray-700 dark:text-gray-300">' + esc(o.supplier) + "</span></td>" +
            '<td class="hms-cell"><span class="text-xs font-bold text-gray-900 tabular-nums">' + o.items + "</span></td>" +
            '<td class="hms-cell"><div class="flex items-center gap-2 min-w-28">' +
            '<svg class="ph-stock ' + tone + '" viewBox="0 0 100 6" preserveAspectRatio="none" role="img" aria-label="' + o.received + " of " + o.items + ' items received">' +
            '<rect x="0" y="0" width="100" height="6" rx="3" fill="currentColor" opacity="0.15"></rect>' +
            '<rect x="0" y="0" width="' + pct + '" height="6" rx="3" fill="currentColor"></rect></svg>' +
            '<span class="text-xs font-extrabold text-gray-900 tabular-nums">' + o.received + "/" + o.items + "</span></div></td>" +
            '<td class="hms-cell"><span class="text-xs font-bold text-gray-900 tabular-nums">' + money(o.value) + "</span></td>" +
            '<td class="hms-cell"><span class="text-xs text-gray-600 dark:text-gray-300">' + esc(o.expected) + "</span></td>" +
            '<td class="hms-cell"><span class="badge ' + s.badge + '">' + s.label + "</span></td>" +
            '<td class="hms-cell text-right">' + MC.actions(o.id, acts) + "</td></tr>"
        );
    }

    // Rows are already present as static HTML, in insertion order (fixed —
    // renderGrid never re-sorts them). Filtering now only toggles visibility
    // on the existing [data-row-id] rows instead of rebuilding the table body.
    function renderGrid() {
        const q = $("search").value.trim().toLowerCase();
        const st = $("filter-status").value;
        const rows = ORDERS.filter((o) => {
            const hit = !q || o.id.toLowerCase().includes(q) || o.supplier.toLowerCase().includes(q);
            return hit && (!st || status(o).label === st);
        });
        const visible = new Set(rows.map((o) => o.id));

        $("grid-count").textContent = rows.length + (rows.length === 1 ? " order" : " orders");

        let anyVisible = false;
        $("grid-body").querySelectorAll("[data-row-id]").forEach((tr) => {
            const show = visible.has(tr.dataset.rowId);
            tr.classList.toggle("hidden", !show);
            if (show) anyVisible = true;
        });
        const emptyRow = $("grid-empty-row");
        if (emptyRow) emptyRow.classList.toggle("hidden", anyVisible);
    }

    function patchRow(o) {
        const rowEl = $("grid-body").querySelector('[data-row-id="' + o.id + '"]');
        if (rowEl) rowEl.outerHTML = rowHTML(o);
        if (window.HSStaticMethods) window.HSStaticMethods.autoInit();
    }

    // Hero flag/summary and the 6 KPI cards are baked into the HTML for the
    // initial ORDERS state; renderHero()/renderKpis() are only invoked again
    // after a genuine mutation (send/receive/cancel/create) below.
    function renderAll() {
        renderHero();
        renderKpis();
        renderGrid();
    }

    function init() {
        document.body.insertAdjacentHTML("beforeend", MC.deleteModalHTML);
        // Hero/KPIs are already correct in the static HTML for the initial
        // ORDERS state, and the supplier <option>s are baked in too; only the
        // order grid needs an initial render.
        renderGrid();

        $("search").addEventListener("input", renderGrid);
        $("filter-status").addEventListener("change", renderGrid);

        $("grid-body").addEventListener("click", function (e) {
            const btn = e.target.closest("[data-act]");
            if (!btn) return;
            const o = ORDERS.find((x) => x.id === btn.dataset.id);
            if (!o) return;
            const act = btn.dataset.act;

            if (act === "send") {
                o.draft = false;
                o.expected = "24 Jul 2026";
                patchRow(o);
                renderAll();
                MC.toast(o.id + " sent to " + o.supplier + ".", "success");
            } else if (act === "receive") {
                $("rc-sub").textContent = o.id + " · " + o.supplier + " · " + o.received + "/" + o.items + " received";
                $("rc-items").value = o.items - o.received;
                $("rc-notes").value = "";
                $("rc-save").dataset.id = o.id;
                MC.openModal("rc-modal");
            } else if (act === "cancel") {
                MC.confirmDelete(o.id + " (" + o.supplier + ")", function () {
                    o.cancelled = true;
                    patchRow(o);
                    renderAll();
                    MC.toast(o.id + " cancelled.", "info");
                });
            } else if (act === "print") {
                MC.toast(o.id + " sent to the printer.", "info");
                window.print();
            }
        });

        $("btn-add").addEventListener("click", function () {
            $("pm-form").reset();
            MC.openModal("po-modal");
        });
        $("btn-print").addEventListener("click", function () {
            MC.toast("Purchase order list sent to the printer.", "info");
            window.print();
        });

        $("pm-close").addEventListener("click", () => MC.closeModal("po-modal"));
        $("pm-cancel").addEventListener("click", () => MC.closeModal("po-modal"));
        $("pm-save").addEventListener("click", function () {
            const items = parseInt($("pm-items").value, 10);
            if (!items || items < 1) return MC.toast("Enter the number of line items.", "error");
            const o = mk({
                supplier: $("pm-supplier").value, items: items, received: 0,
                value: parseFloat($("pm-value").value) || 0,
                expected: $("pm-expected").value.trim() || "—", placed: "17 Jul", draft: true,
            });
            ORDERS.unshift(o);
            $("grid-body").insertAdjacentHTML("afterbegin", rowHTML(o));
            if (window.HSStaticMethods) window.HSStaticMethods.autoInit();
            MC.closeModal("po-modal");
            renderAll();
            MC.toast("Draft PO created for " + $("pm-supplier").value + ".", "success");
        });

        $("rc-cancel").addEventListener("click", () => MC.closeModal("rc-modal"));
        $("rc-save").addEventListener("click", function () {
            const o = ORDERS.find((x) => x.id === this.dataset.id);
            if (!o) return;
            const n = parseInt($("rc-items").value, 10);
            if (!n || n < 1) return MC.toast("Enter how many items arrived.", "error");
            o.received = Math.min(o.items, o.received + n);
            patchRow(o);
            MC.closeModal("rc-modal");
            renderAll();
            MC.toast(o.id + " — " + status(o).label + " (" + o.received + "/" + o.items + ").", "success");
        });

        MC.initDeleteModal();
        ["po-modal", "rc-modal", "del-modal"].forEach(MC.closeOnBackdrop);
        document.addEventListener("keydown", function (e) {
            if (e.key !== "Escape") return;
            ["po-modal", "rc-modal", "del-modal"].forEach(MC.closeModal);
        });
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
})();

// ==========================================================================
// pharmacy-sales.js
// ==========================================================================
// Dreams HMS — Pharmacy Sales
// Till transaction log with payment mix and refunds. KPI figures derive
// from the transaction list. Static demo data — no API.
(function () {
    "use strict";
    if ((location.pathname.split("/").pop() || "index.html") !== "pharmacy-sales.html") return;

    const $ = (id) => document.getElementById(id);
    const esc = (v) => String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

    const STATUS = { Paid: "badge-green", "Pending Claim": "badge-amber", Refunded: "badge-gray" };
    const PAY_ICON = { Cash: "icon-banknote", Card: "icon-credit-card", Insurance: "icon-shield" };

    let seq = 90210;
    const mk = (o) => (seq++, Object.assign({ id: "INV-" + seq }, o));

    let SALES = [
        mk({ customer: "Walk-in", items: 2, pay: "Cash", amount: 14.6, time: "07:22 AM", status: "Paid" }),
        mk({ customer: "Grant Sutherland", items: 3, pay: "Card", amount: 32.4, time: "07:48 AM", status: "Paid" }),
        mk({ customer: "Bernadette Cho", items: 1, pay: "Insurance", amount: 58.0, time: "08:05 AM", status: "Pending Claim" }),
        mk({ customer: "Walk-in", items: 4, pay: "Cash", amount: 21.15, time: "08:19 AM", status: "Paid" }),
        mk({ customer: "Camila Restrepo", items: 2, pay: "Insurance", amount: 44.9, time: "08:37 AM", status: "Pending Claim" }),
        mk({ customer: "Walk-in", items: 1, pay: "Card", amount: 9.8, time: "08:52 AM", status: "Refunded" }),
        mk({ customer: "Julian Alvarez", items: 2, pay: "Card", amount: 27.35, time: "09:04 AM", status: "Paid" }),
        mk({ customer: "Walk-in", items: 5, pay: "Cash", amount: 38.7, time: "09:18 AM", status: "Paid" }),
        mk({ customer: "Ophelia Grant", items: 3, pay: "Insurance", amount: 91.2, time: "09:33 AM", status: "Pending Claim" }),
    ];

    const money = (n) => "$" + n.toFixed(2);

    function detailUrl(s) {
        return "pharmacy-sale-detail.html?" + new URLSearchParams({ id: s.id, customer: s.customer, amount: s.amount, status: s.status }).toString();
    }

    // Revenue counts paid + pending; refunds are excluded.
    const revenue = () => SALES.filter((s) => s.status !== "Refunded").reduce((a, s) => a + s.amount, 0);

    function renderHero() {
        const claims = SALES.filter((s) => s.status === "Pending Claim").length;
        const flag = claims >= 4 ? { cls: "tone-medium", text: claims + " Claims Pending" } : { cls: "tone-stable", text: "Till Balanced" };
        $("ph-flag").className = "hms-chip " + flag.cls;
        $("ph-flag-text").textContent = flag.text;
        $("hero-summary").textContent = SALES.length + " sales · " + money(revenue()) + " taken";
    }

    function renderKpis() {
        const byPay = (p) => SALES.filter((s) => s.pay === p && s.status !== "Refunded").reduce((a, s) => a + s.amount, 0);
        const refunds = SALES.filter((s) => s.status === "Refunded").length;
        const items = SALES.filter((s) => s.status !== "Refunded").reduce((a, s) => a + s.items, 0);

        const cards = [
            { id: "kpi-revenue", icon: "icon-dollar-sign", label: "Revenue", value: money(revenue()), tone: "ph-primary", meta: "this shift" },
            { id: "kpi-count", icon: "icon-receipt", label: "Transactions", value: SALES.length, tone: "ph-sky", meta: items + " items sold" },
            { id: "kpi-cash", icon: "icon-banknote", label: "Cash", value: money(byPay("Cash")), tone: "ph-amber", meta: "in the drawer" },
            { id: "kpi-card", icon: "icon-credit-card", label: "Card", value: money(byPay("Card")), tone: "ph-violet", meta: "terminal takings" },
            { id: "kpi-insurance", icon: "icon-shield", label: "Insurance", value: money(byPay("Insurance")), tone: "ph-slate", meta: "claims raised" },
            { id: "kpi-refunds", icon: "icon-undo-2", label: "Refunds", value: refunds, tone: "ph-danger", meta: "processed today" },
        ];

        $("kpi-row").innerHTML = cards
            .map((c) =>
                '<article class="ph-kpi ' + c.tone + '"><div class="ph-kpi-head"><span class="ph-kpi-icon"><i class="' + c.icon + '" aria-hidden="true"></i></span></div>' +
                '<p class="ph-kpi-value"><span id="' + c.id + '">' + c.value + '</span></p><p class="ph-kpi-label">' + c.label + "</p>" +
                '<p class="ph-kpi-meta"><i class="icon-circle-dot text-[8px]" aria-hidden="true"></i>' + c.meta + "</p></article>"
            )
            .join("");
    }

    // One row's markup for a sale (used both for the static rows already in
    // the page and to patch a single row after a claim/refund edit).
    function rowHTML(s) {
        const acts = [{ label: "Print Receipt", icon: "icon-printer", act: "print" }];
        if (s.status === "Paid") acts.push({ label: "Refund", icon: "icon-undo-2", act: "refund", danger: true });
        if (s.status === "Pending Claim") acts.push({ label: "Mark Claim Paid", icon: "icon-check", act: "claim" });

        return (
            '<tr class="hms-row' + (s.status === "Refunded" ? " opacity-60" : "") + '" data-row-id="' + esc(s.id) + '">' +
            '<td class="hms-cell"><a class="font-mono text-[11px] font-bold text-primary hover:underline" href="' + detailUrl(s) + '">' + esc(s.id) + "</a></td>" +
            '<td class="hms-cell"><span class="text-xs font-semibold text-gray-700 dark:text-gray-300">' + esc(s.customer) + "</span></td>" +
            '<td class="hms-cell"><span class="text-xs font-bold text-gray-900 tabular-nums">' + s.items + "</span></td>" +
            '<td class="hms-cell"><span class="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300">' +
            '<i class="' + PAY_ICON[s.pay] + ' text-[12px] text-gray-400" aria-hidden="true"></i>' + s.pay + "</span></td>" +
            '<td class="hms-cell"><span class="text-xs font-extrabold text-gray-900 tabular-nums">' + money(s.amount) + "</span></td>" +
            '<td class="hms-cell"><span class="text-xs text-gray-500 dark:text-gray-400 tabular-nums">' + esc(s.time) + "</span></td>" +
            '<td class="hms-cell"><span class="badge ' + STATUS[s.status] + '">' + s.status + "</span></td>" +
            '<td class="hms-cell text-right">' + MC.actions(s.id, acts) + "</td></tr>"
        );
    }

    // Rows are already present as static HTML, in insertion order (fixed —
    // renderGrid never re-sorts them). Filtering now only toggles visibility
    // on the existing [data-row-id] rows instead of rebuilding the table body.
    function renderGrid() {
        const q = $("search").value.trim().toLowerCase();
        const pay = $("filter-pay").value;
        const st = $("filter-status").value;

        const rows = SALES.filter((s) => {
            const hit = !q || s.id.toLowerCase().includes(q) || s.customer.toLowerCase().includes(q);
            return hit && (!pay || s.pay === pay) && (!st || s.status === st);
        });
        const visible = new Set(rows.map((s) => s.id));

        $("grid-count").textContent = rows.length + (rows.length === 1 ? " sale" : " sales");

        let anyVisible = false;
        $("grid-body").querySelectorAll("[data-row-id]").forEach((tr) => {
            const show = visible.has(tr.dataset.rowId);
            tr.classList.toggle("hidden", !show);
            if (show) anyVisible = true;
        });
        const emptyRow = $("grid-empty-row");
        if (emptyRow) emptyRow.classList.toggle("hidden", anyVisible);
    }

    function patchRow(s) {
        const rowEl = $("grid-body").querySelector('[data-row-id="' + s.id + '"]');
        if (rowEl) rowEl.outerHTML = rowHTML(s);
        if (window.HSStaticMethods) window.HSStaticMethods.autoInit();
    }

    // Hero flag/summary and the 6 KPI cards are baked into the HTML for the
    // initial SALES state; renderHero()/renderKpis() are only invoked again
    // after a genuine mutation (claim settled/refund/new sale) below.
    function renderAll() {
        renderHero();
        renderKpis();
        renderGrid();
    }

    function init() {
        document.body.insertAdjacentHTML("beforeend", MC.deleteModalHTML);
        // Hero/KPIs are already correct in the static HTML for the initial
        // SALES state; only the sales grid needs an initial render.
        renderGrid();

        $("search").addEventListener("input", renderGrid);
        $("filter-pay").addEventListener("change", renderGrid);
        $("filter-status").addEventListener("change", renderGrid);

        $("grid-body").addEventListener("click", function (e) {
            const btn = e.target.closest("[data-act]");
            if (!btn) return;
            const s = SALES.find((x) => x.id === btn.dataset.id);
            if (!s) return;
            if (btn.dataset.act === "print") MC.toast("Receipt printed for " + s.id + ".", "info");
            else if (btn.dataset.act === "claim") {
                s.status = "Paid";
                patchRow(s);
                renderAll();
                MC.toast(s.id + " claim settled.", "success");
            } else if (btn.dataset.act === "refund") {
                MC.confirmDelete(s.id + " — refund " + money(s.amount), function () {
                    s.status = "Refunded";
                    patchRow(s);
                    renderAll();
                    MC.toast(s.id + " refunded " + money(s.amount) + ".", "info");
                });
            }
        });

        $("btn-add").addEventListener("click", function () {
            $("sl-form").reset();
            MC.openModal("sale-modal");
        });
        $("btn-close-till").addEventListener("click", function () {
            MC.toast("Till closed — " + money(revenue()) + " reconciled across " + SALES.length + " transactions.", "success");
        });
        $("btn-export").addEventListener("click", () => MC.toast("Sales exported — " + SALES.length + " transactions.", "success"));

        $("sl-close").addEventListener("click", () => MC.closeModal("sale-modal"));
        $("sl-cancel").addEventListener("click", () => MC.closeModal("sale-modal"));
        $("sl-save").addEventListener("click", function () {
            const amount = parseFloat($("sl-amount").value);
            if (!amount || amount <= 0) return MC.toast("Enter the sale amount.", "error");
            const pay = $("sl-pay").value;
            const s = mk({
                customer: $("sl-customer").value.trim() || "Walk-in",
                items: parseInt($("sl-items").value, 10) || 1,
                pay: pay, amount: amount, time: "09:42 AM",
                status: pay === "Insurance" ? "Pending Claim" : "Paid",
            });
            SALES.unshift(s);
            $("grid-body").insertAdjacentHTML("afterbegin", rowHTML(s));
            if (window.HSStaticMethods) window.HSStaticMethods.autoInit();
            MC.closeModal("sale-modal");
            renderAll();
            MC.toast("Sale completed — " + money(amount) + " " + pay.toLowerCase() + ".", "success");
        });

        MC.initDeleteModal();
        ["sale-modal", "del-modal"].forEach(MC.closeOnBackdrop);
        document.addEventListener("keydown", function (e) {
            if (e.key !== "Escape") return;
            ["sale-modal", "del-modal"].forEach(MC.closeModal);
        });
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
})();

// ==========================================================================
// pharmacy-supplier-detail.js
// ==========================================================================
document.addEventListener("DOMContentLoaded", function () {
  if (document.body.dataset.page !== "pharmacy-supplier-detail") return;

  var $ = function (id) { return document.getElementById(id); };
  var params = new URLSearchParams(window.location.search);
  var pick = function (key, fallback) { var v = params.get(key); return v && v.length ? v : fallback; };

  var s = {
    id: pick("id", "SUP-00142"),
    name: pick("name", "McKesson Pharmaceutical"),
    contact: pick("contact", "Dana Whitcomb"),
    location: pick("location", "Irving, Texas (HQ)"),
    phone: pick("phone", "(415) 983-8300"),
    status: pick("status", "Tier-1 Preferred"),
    ontime: pick("ontime", "98.4%"),
    spend: pick("spend", "$1.42M"),
  };

  if ($("pvr-supplier-name")) $("pvr-supplier-name").textContent = s.name;
  if ($("pvr-supplier-id")) $("pvr-supplier-id").textContent = s.id.startsWith("#") ? s.id : "#" + s.id;
  if ($("pvr-contact-person")) $("pvr-contact-person").textContent = s.contact;
  if ($("pvr-location")) $("pvr-location").textContent = s.location;
  if ($("pvr-phone")) $("pvr-phone").textContent = s.phone;
  if ($("pvr-status-text")) $("pvr-status-text").textContent = s.status;
  if ($("pvr-stat-ontime")) $("pvr-stat-ontime").textContent = s.ontime;
  if ($("pvr-stat-spend")) $("pvr-stat-spend").textContent = s.spend;

  document.title = s.name + " — Supplier Details — Dreams HMS";

  // ---- PURCHASE ORDERS TABLE ----
  // The 4 rows are fixed reference data (not derived from URL params like the
  // header fields above), so they are now static markup in #pvr-po-table-body
  // directly in the page; no JS render is needed for them.

  // ---- ACTION BUTTON EVENTS ----
  var triggerCreatePO = function () {
    var poNum = "PO-" + Math.floor(Math.random() * 90000 + 10000);
    if (confirm("Draft new Purchase Order (" + poNum + ") for " + s.name + "?")) {
      alert("New Purchase Order draft " + poNum + " initialized under Net-30 payment terms.");
    }
  };

  if ($("pvr-create-po-btn")) $("pvr-create-po-btn").addEventListener("click", triggerCreatePO);
  if ($("pvr-side-create-po")) $("pvr-side-create-po").addEventListener("click", triggerCreatePO);

  if ($("pvr-cert-btn")) {
    $("pvr-cert-btn").addEventListener("click", function () {
      alert("Downloading FDA & DEA Regulatory Compliance Certificate Package for " + s.name + " (PDF)...");
    });
  }

  if ($("pvr-contact-rep-btn")) {
    $("pvr-contact-rep-btn").addEventListener("click", function () {
      alert("Initiating priority message to Account Representative (" + (s.contact || "Dana Whitcomb") + ")...");
    });
  }

  document.querySelectorAll('[data-action="print"]').forEach(function (btn) {
    btn.addEventListener("click", function () {
      window.print();
    });
  });
});


// ==========================================================================
// pharmacy-suppliers.js
// ==========================================================================
// Dreams HMS — Pharmacy Suppliers
// Vendor directory for pharmacy procurement. Static demo data — no API.
(function () {
    "use strict";
    if ((location.pathname.split("/").pop() || "index.html") !== "pharmacy-suppliers.html") return;

    const $ = (id) => document.getElementById(id);
    const esc = (v) => String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

    const STATUS = { Preferred: "badge-green", Approved: "badge-blue", "On Hold": "badge-amber" };

    let seq = 0;
    const mk = (o) => (seq++, Object.assign({ id: "SUP-" + String(seq).padStart(2, "0") }, o));

    let SUPPLIERS = [
        mk({ name: "McKesson", contact: "Dana Whitcomb", email: "orders@mckesson.com", phone: "(415) 983-8300", city: "Irving, TX", cats: ["Analgesics", "Endocrine"], onTime: 97, openPos: 3, spend: 412000, status: "Preferred" }),
        mk({ name: "Cardinal Health", contact: "Luis Herrera", email: "supply@cardinalhealth.com", phone: "(614) 757-5000", city: "Dublin, OH", cats: ["Antibiotics", "CNS"], onTime: 94, openPos: 2, spend: 286000, status: "Preferred" }),
        mk({ name: "AmerisourceBergen", contact: "Renee Caldwell", email: "po@amerisourcebergen.com", phone: "(610) 727-7000", city: "Conshohocken, PA", cats: ["Analgesics", "Endocrine"], onTime: 91, openPos: 4, spend: 231000, status: "Approved" }),
        mk({ name: "Cencora", contact: "Piotr Zielinski", email: "orders@cencora.com", phone: "(610) 727-7429", city: "Philadelphia, PA", cats: ["Cardiovascular", "Gastrointestinal"], onTime: 88, openPos: 1, spend: 174000, status: "Approved" }),
        mk({ name: "Morris & Dickson", contact: "Abby Lantz", email: "sales@morrisdickson.com", phone: "(318) 424-5462", city: "Shreveport, LA", cats: ["Gastrointestinal", "Cardiovascular"], onTime: 82, openPos: 2, spend: 96000, status: "Approved" }),
        mk({ name: "Henry Schein", contact: "Tobias Grant", email: "rx@henryschein.com", phone: "(631) 843-5500", city: "Melville, NY", cats: ["Respiratory"], onTime: 64, openPos: 0, spend: 41000, status: "On Hold" }),
    ];

    function onTimeTone(p) {
        if (p >= 90) return "stock-ok";
        if (p >= 75) return "stock-low";
        return "stock-out";
    }

    function money(n) {
        return "$" + (n / 1000).toFixed(0) + "k";
    }

    function detailUrl(s) {
        return "pharmacy-supplier-detail.html?" + new URLSearchParams({ id: s.id, name: s.name, status: s.status }).toString();
    }

    function renderHero() {
        const hold = SUPPLIERS.filter((s) => s.status === "On Hold").length;
        const flag = hold >= 2 ? { cls: "tone-critical", text: hold + " On Hold" } : hold === 1 ? { cls: "tone-medium", text: "1 On Hold" } : { cls: "tone-stable", text: "Supply Chain Healthy" };
        $("ph-flag").className = "hms-chip " + flag.cls;
        $("ph-flag-text").textContent = flag.text;
        $("hero-summary").textContent = SUPPLIERS.length + " suppliers · " + SUPPLIERS.reduce((s, x) => s + x.openPos, 0) + " open POs";
    }

    function renderKpis() {
        const preferred = SUPPLIERS.filter((s) => s.status === "Preferred").length;
        const hold = SUPPLIERS.filter((s) => s.status === "On Hold").length;
        const openPos = SUPPLIERS.reduce((s, x) => s + x.openPos, 0);
        const spend = SUPPLIERS.reduce((s, x) => s + x.spend, 0);
        const avgOnTime = Math.round(SUPPLIERS.reduce((s, x) => s + x.onTime, 0) / SUPPLIERS.length);

        const cards = [
            { id: "kpi-total", icon: "icon-truck", label: "Suppliers", value: SUPPLIERS.length, tone: "ph-primary", meta: "registered vendors" },
            { id: "kpi-preferred", icon: "icon-star", label: "Preferred", value: preferred, tone: "ph-sky", meta: "first-choice vendors" },
            { id: "kpi-hold", icon: "icon-pause", label: "On Hold", value: hold, tone: "ph-danger", meta: "orders suspended" },
            { id: "kpi-pos", icon: "icon-clipboard-list", label: "Open POs", value: openPos, tone: "ph-amber", meta: "awaiting delivery" },
            { id: "kpi-ontime", icon: "icon-timer", label: "Avg On-Time", value: avgOnTime + "%", tone: "ph-violet", meta: "delivery performance" },
            { id: "kpi-spend", icon: "icon-dollar-sign", label: "YTD Spend", value: money(spend), tone: "ph-slate", meta: "across vendors" },
        ];

        $("kpi-row").innerHTML = cards
            .map((c) =>
                '<article class="ph-kpi ' + c.tone + '"><div class="ph-kpi-head"><span class="ph-kpi-icon"><i class="' + c.icon + '" aria-hidden="true"></i></span></div>' +
                '<p class="ph-kpi-value"><span id="' + c.id + '">' + c.value + '</span></p><p class="ph-kpi-label">' + c.label + "</p>" +
                '<p class="ph-kpi-meta"><i class="icon-circle-dot text-[8px]" aria-hidden="true"></i>' + c.meta + "</p></article>"
            )
            .join("");
    }

    // One row's markup for a supplier (used both for the static rows already
    // in the page and to patch a single row after an edit/hold change).
    function rowHTML(s) {
        const tone = onTimeTone(s.onTime);
        return (
            '<tr class="hms-row" data-row-id="' + esc(s.id) + '">' +
            '<td class="hms-cell"><div class="flex items-center gap-3">' +
            '<span class="hms-member-avatar ph-primary size-9! rounded-full!"><i class="icon-building-2 text-sm" aria-hidden="true"></i></span>' +
            '<div class="min-w-0"><p class="text-xs font-bold"><a class="text-primary hover:underline truncate" href="' + detailUrl(s) + '">' + esc(s.name) + "</a></p>" +
            '<p class="text-[10px] text-gray-400">' + esc(s.id) + " · " + esc(s.city) + "</p></div></div></td>" +
            '<td class="hms-cell"><p class="text-xs font-semibold text-gray-700 dark:text-gray-300">' + esc(s.contact) + "</p>" +
            '<p class="text-[10px] text-gray-400">' + esc(s.email) + "</p></td>" +
            '<td class="hms-cell"><div class="flex flex-wrap gap-1">' + s.cats.map((c) => '<span class="hms-chip tone-info">' + esc(c) + "</span>").join("") + "</div></td>" +
            '<td class="hms-cell"><div class="flex items-center gap-2 min-w-28">' +
            '<svg class="ph-stock ' + tone + '" viewBox="0 0 100 6" preserveAspectRatio="none" role="img" aria-label="' + s.onTime + ' percent on time">' +
            '<rect x="0" y="0" width="100" height="6" rx="3" fill="currentColor" opacity="0.15"></rect>' +
            '<rect x="0" y="0" width="' + s.onTime + '" height="6" rx="3" fill="currentColor"></rect></svg>' +
            '<span class="text-xs font-extrabold text-gray-900 tabular-nums w-9 text-right">' + s.onTime + "%</span></div></td>" +
            '<td class="hms-cell"><span class="text-xs font-bold text-gray-900 tabular-nums">' + s.openPos + "</span></td>" +
            '<td class="hms-cell"><span class="text-xs font-bold text-gray-900 tabular-nums">' + money(s.spend) + "</span></td>" +
            '<td class="hms-cell"><span class="badge ' + STATUS[s.status] + '">' + s.status + "</span></td>" +
            '<td class="hms-cell text-right">' +
            MC.actions(s.id, [
                { label: "Edit", icon: "icon-pencil", act: "edit" },
                { label: "New PO", icon: "icon-clipboard-list", act: "po" },
                { label: s.status === "On Hold" ? "Release Hold" : "Put On Hold", icon: "icon-pause", act: "hold", danger: s.status !== "On Hold" },
            ]) +
            "</td></tr>"
        );
    }

    // Rows are already present as static HTML, sorted by spend descending
    // (fixed order — new suppliers always start at spend 0, the minimum, so
    // they belong at the end; editing never changes spend). Filtering now
    // only toggles visibility on the existing [data-row-id] rows instead of
    // rebuilding the table body.
    function renderGrid() {
        const q = $("search").value.trim().toLowerCase();
        const status = $("filter-status").value;
        const rows = SUPPLIERS.filter((s) => {
            const hit = !q || s.name.toLowerCase().includes(q) || s.contact.toLowerCase().includes(q) || s.city.toLowerCase().includes(q);
            return hit && (!status || s.status === status);
        });
        const visible = new Set(rows.map((s) => s.id));

        $("grid-count").textContent = rows.length + (rows.length === 1 ? " supplier" : " suppliers");

        let anyVisible = false;
        $("grid-body").querySelectorAll("[data-row-id]").forEach((tr) => {
            const show = visible.has(tr.dataset.rowId);
            tr.classList.toggle("hidden", !show);
            if (show) anyVisible = true;
        });
        const emptyRow = $("grid-empty-row");
        if (emptyRow) emptyRow.classList.toggle("hidden", anyVisible);
    }

    function patchRow(s) {
        const rowEl = $("grid-body").querySelector('[data-row-id="' + s.id + '"]');
        if (rowEl) rowEl.outerHTML = rowHTML(s);
        if (window.HSStaticMethods) window.HSStaticMethods.autoInit();
    }

    // Hero flag/summary and the 6 KPI cards are baked into the HTML for the
    // initial SUPPLIERS state; renderHero()/renderKpis() are only invoked
    // again after a genuine mutation (edit/hold/release/add) below.
    function renderAll() {
        renderHero();
        renderKpis();
        renderGrid();
    }

    let editingId = null;

    function openSup(id) {
        editingId = id || null;
        const s = id ? SUPPLIERS.find((x) => x.id === id) : null;
        $("sm-title").textContent = s ? "Edit Supplier" : "Add Supplier";
        $("sm-form").reset();
        if (s) {
            $("sm-name").value = s.name;
            $("sm-contact").value = s.contact;
            $("sm-email").value = s.email;
            $("sm-phone").value = s.phone;
            $("sm-city").value = s.city;
            $("sm-status").value = s.status;
            $("sm-cats").value = s.cats.join(", ");
        }
        MC.openModal("sup-modal");
    }

    function init() {
        document.body.insertAdjacentHTML("beforeend", MC.deleteModalHTML);
        // Hero/KPIs are already correct in the static HTML for the initial
        // SUPPLIERS state; only the supplier grid needs an initial render.
        renderGrid();

        $("search").addEventListener("input", renderGrid);
        $("filter-status").addEventListener("change", renderGrid);

        $("grid-body").addEventListener("click", function (e) {
            const btn = e.target.closest("[data-act]");
            if (!btn) return;
            const s = SUPPLIERS.find((x) => x.id === btn.dataset.id);
            if (!s) return;
            if (btn.dataset.act === "edit") openSup(s.id);
            else if (btn.dataset.act === "po") MC.toast("New purchase order started for " + s.name + " — continue on Purchase Orders.", "info");
            else if (btn.dataset.act === "hold") {
                if (s.status !== "On Hold") {
                    MC.confirmDelete(s.name + " (put on hold)", function () {
                        s.status = "On Hold";
                        patchRow(s);
                        renderAll();
                        MC.toast(s.name + " placed on hold — no new orders.", "info");
                    });
                } else {
                    s.status = "Approved";
                    patchRow(s);
                    renderAll();
                    MC.toast(s.name + " hold released.", "success");
                }
            }
        });

        $("btn-add").addEventListener("click", () => openSup(null));
        $("btn-export").addEventListener("click", () => MC.toast("Supplier directory exported — " + SUPPLIERS.length + " vendors.", "success"));

        $("sm-close").addEventListener("click", () => MC.closeModal("sup-modal"));
        $("sm-cancel").addEventListener("click", () => MC.closeModal("sup-modal"));
        $("sm-save").addEventListener("click", function () {
            const name = $("sm-name").value.trim();
            if (!name) return MC.toast("Enter the company name.", "error");
            const data = {
                name: name, contact: $("sm-contact").value.trim() || "—", email: $("sm-email").value.trim() || "—",
                phone: $("sm-phone").value.trim() || "—", city: $("sm-city").value.trim() || "—",
                status: $("sm-status").value, cats: $("sm-cats").value.split(",").map((c) => c.trim()).filter(Boolean),
            };
            if (editingId) {
                const s = Object.assign(SUPPLIERS.find((x) => x.id === editingId), data);
                patchRow(s);
                MC.toast(name + " updated.", "success");
            } else {
                const s = mk(Object.assign({ onTime: 100, openPos: 0, spend: 0 }, data));
                SUPPLIERS.unshift(s);
                // Spend 0 is the minimum, so the new row always sorts last —
                // insert it just before the empty-state sentinel row.
                const emptyRow = $("grid-empty-row");
                if (emptyRow) emptyRow.insertAdjacentHTML("beforebegin", rowHTML(s));
                else $("grid-body").insertAdjacentHTML("beforeend", rowHTML(s));
                if (window.HSStaticMethods) window.HSStaticMethods.autoInit();
                MC.toast(name + " added to the directory.", "success");
            }
            MC.closeModal("sup-modal");
            renderAll();
        });

        MC.initDeleteModal();
        ["sup-modal", "del-modal"].forEach(MC.closeOnBackdrop);
        document.addEventListener("keydown", function (e) {
            if (e.key !== "Escape") return;
            ["sup-modal", "del-modal"].forEach(MC.closeModal);
        });
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
})();

// ==========================================================================
// pharmacy.js
// ==========================================================================
// NOTE: the two lines below (the opening IIFE wrapper here, and its closing
// "})();" just after the original file's last line) are NOT present in the
// original pharmacy.js — they were added only so this file's top-level
// declarations (SBADGE, data, nextId, editingId, rowHTML, updateStats,
// render, openAdd, openEdit, saveRecord, deleteRecord) get their own scope.
// inventory.js (merged above) declares the exact same top-level names;
// concatenating both as plain top-level module code is a SyntaxError
// ("Identifier has already been declared"). This wrapper is a scoping fix
// only — no page-anchor guard was added, and nothing else about the file's
// logic was changed. See the merge report for why that matters.
(function () {
if ((location.pathname.split("/").pop() || "index.html") !== "pharmacy.html") return;
const SBADGE = {
    "In Stock": "text-success bg-success/10",
    "Low Stock": "text-warning bg-warning/10",
    "Out of Stock": "text-danger bg-danger/10",
};
let data = [
    {
        id: 1,
        name: "Amoxicillin 500mg",
        generic: "Amoxicillin",
        cat: "Antibiotics",
        unit: "Capsule",
        stock: 820,
        reorder: 100,
        price: 1.2,
        supplier: "MedSupply Co.",
        expiry: "2025-06-30",
        status: "In Stock",
    },
    {
        id: 2,
        name: "Paracetamol 500mg",
        generic: "Acetaminophen",
        cat: "Analgesics",
        unit: "Tablet",
        stock: 3200,
        reorder: 500,
        price: 0.15,
        supplier: "PharmaDist Ltd.",
        expiry: "2026-01-15",
        status: "In Stock",
    },
    {
        id: 3,
        name: "Metformin 500mg",
        generic: "Metformin HCl",
        cat: "Antidiabetics",
        unit: "Tablet",
        stock: 45,
        reorder: 200,
        price: 0.8,
        supplier: "DiabCare Inc.",
        expiry: "2025-09-20",
        status: "Low Stock",
    },
    {
        id: 4,
        name: "Amlodipine 5mg",
        generic: "Amlodipine",
        cat: "Antihypertensives",
        unit: "Tablet",
        stock: 680,
        reorder: 100,
        price: 0.6,
        supplier: "CardioPharm",
        expiry: "2025-12-31",
        status: "In Stock",
    },
    {
        id: 5,
        name: "Omeprazole 20mg",
        generic: "Omeprazole",
        cat: "Antacids",
        unit: "Capsule",
        stock: 0,
        reorder: 150,
        price: 0.9,
        supplier: "GastroMed",
        expiry: "2025-08-10",
        status: "Out of Stock",
    },
    {
        id: 6,
        name: "Cetirizine 10mg",
        generic: "Cetirizine HCl",
        cat: "Antihistamines",
        unit: "Tablet",
        stock: 350,
        reorder: 80,
        price: 0.4,
        supplier: "AllergyCare",
        expiry: "2026-03-28",
        status: "In Stock",
    },
    {
        id: 7,
        name: "Vitamin D3 1000IU",
        generic: "Cholecalciferol",
        cat: "Vitamins",
        unit: "Tablet",
        stock: 30,
        reorder: 100,
        price: 0.25,
        supplier: "NutriPharma",
        expiry: "2025-11-15",
        status: "Low Stock",
    },
    {
        id: 8,
        name: "Azithromycin 250mg",
        generic: "Azithromycin",
        cat: "Antibiotics",
        unit: "Tablet",
        stock: 210,
        reorder: 50,
        price: 2.1,
        supplier: "MedSupply Co.",
        expiry: "2025-07-22",
        status: "In Stock",
    },
];
let nextId = 9,
    editingId = null;
function rowHTML(r) {
    return `<tr data-row-id="${r.id}"><td><p class="font-medium text-gray-900">${r.name}</p><p class="text-xs text-gray-400">${r.unit}</p></td><td class="text-gray-600 dark:text-gray-300">${r.generic}</td><td><span class="inline-block px-2 py-1 text-xs font-semibold rounded-lg whitespace-nowrap text-primary bg-primary/10">${r.cat}</span></td><td><span class="${r.stock <= r.reorder && r.stock > 0 ? "text-amber-600 font-semibold" : r.stock === 0 ? "text-red-600 font-semibold" : "text-gray-700 dark:text-gray-300"}">${r.stock}</span> <span class="text-xs text-gray-400">${r.unit}s</span></td><td class="text-gray-600 dark:text-gray-300">$${r.price.toFixed(2)}</td><td class="text-gray-500 dark:text-gray-400 text-sm">${r.supplier}</td><td class="text-gray-500 dark:text-gray-400 text-sm">${r.expiry}</td><td><span class="inline-block px-2 py-1 text-xs font-semibold rounded-lg whitespace-nowrap ${SBADGE[r.status] || "text-gray-900 bg-light/60"}">${r.status}</span></td><td><div class="flex gap-1"><button onclick="openEdit(${r.id})" class="p-1.5 size-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400" title="Edit"><i class="icon-edit text-base"></i></button><button onclick="deleteRecord(${r.id},'${r.name}')" class="p-1.5 size-7 flex items-center justify-center rounded hover:bg-danger/20 dark:hover:bg-red-900/20 text-danger" title="Delete"><i class="icon-trash-2 text-base"></i></button></div></td></tr>`;
}
function updateStats() {
    document.getElementById("stat-total").textContent = data.length;
    document.getElementById("stat-instock").textContent = data.filter(
        (r) => r.status === "In Stock",
    ).length;
    document.getElementById("stat-low").textContent = data.filter(
        (r) => r.status === "Low Stock",
    ).length;
    document.getElementById("stat-out").textContent = data.filter(
        (r) => r.status === "Out of Stock",
    ).length;
}
function render(q = "", cat = "", status = "") {
    const rows = data.filter((r) => {
        const m = q
            ? r.name.toLowerCase().includes(q.toLowerCase()) ||
              r.generic.toLowerCase().includes(q.toLowerCase()) ||
              r.supplier.toLowerCase().includes(q.toLowerCase())
            : true;
        return (
            m &&
            (cat ? r.cat === cat : true) &&
            (status ? r.status === status : true)
        );
    });
    document.getElementById("count").textContent =
        `${rows.length} of ${data.length}`;

    const visible = new Set(rows.map((r) => r.id));
    let anyVisible = false;
    document.querySelectorAll("#tbody [data-row-id]").forEach((tr) => {
        const show = visible.has(Number(tr.dataset.rowId));
        tr.classList.toggle("hidden", !show);
        if (show) anyVisible = true;
    });
    const emptyRow = document.getElementById("tbody-empty-row");
    if (emptyRow) emptyRow.classList.toggle("hidden", anyVisible);
}
function openAdd() {
    editingId = null;
    document.getElementById("m-title").textContent = "Add Medicine";
    document.getElementById("btn-save").textContent = "Add Medicine";
    document.getElementById("m-form").reset();
    MC.openModal("form-modal");
}
function openEdit(id) {
    const r = data.find((x) => x.id === id);
    editingId = id;
    document.getElementById("m-title").textContent = "Edit Medicine";
    document.getElementById("btn-save").textContent = "Update";
    document.getElementById("f-name").value = r.name;
    document.getElementById("f-generic").value = r.generic;
    document.getElementById("f-cat").value = r.cat;
    document.getElementById("f-unit").value = r.unit;
    document.getElementById("f-stock").value = r.stock;
    document.getElementById("f-reorder").value = r.reorder;
    document.getElementById("f-price").value = r.price;
    document.getElementById("f-supplier").value = r.supplier;
    document.getElementById("f-expiry").value = r.expiry;
    document.getElementById("f-status").value = r.status;
    MC.openModal("form-modal");
}
function saveRecord() {
    const name = document.getElementById("f-name").value.trim();
    if (!name) {
        MC.toast("Medicine name required", "error");
        return;
    }
    const stock = parseInt(document.getElementById("f-stock").value) || 0;
    const reorder = parseInt(document.getElementById("f-reorder").value) || 0;
    let status = document.getElementById("f-status").value;
    const rec = {
        name,
        generic: document.getElementById("f-generic").value.trim(),
        cat: document.getElementById("f-cat").value,
        unit: document.getElementById("f-unit").value,
        stock,
        reorder,
        price: parseFloat(document.getElementById("f-price").value) || 0,
        supplier: document.getElementById("f-supplier").value.trim(),
        expiry: document.getElementById("f-expiry").value,
        status,
    };
    if (editingId) {
        const idx = data.findIndex((x) => x.id === editingId);
        data[idx] = { ...data[idx], ...rec };
        const existingEl = document.querySelector(
            '#tbody [data-row-id="' + editingId + '"]',
        );
        if (existingEl) existingEl.outerHTML = rowHTML(data[idx]);
        MC.toast("Medicine updated", "success");
    } else {
        const newRec = { id: nextId++, ...rec };
        data.push(newRec);
        const emptyRow = document.getElementById("tbody-empty-row");
        if (emptyRow) emptyRow.insertAdjacentHTML("beforebegin", rowHTML(newRec));
        else document.getElementById("tbody").insertAdjacentHTML("beforeend", rowHTML(newRec));
        MC.toast("Medicine added", "success");
    }
    MC.closeModal("form-modal");
    render(
        document.getElementById("search").value,
        document.getElementById("filter-cat").value,
        document.getElementById("filter-status").value,
    );
    updateStats();
}
function deleteRecord(id, name) {
    MC.confirmDelete(name, () => {
        data = data.filter((x) => x.id !== id);
        const rowEl = document.querySelector('#tbody [data-row-id="' + id + '"]');
        if (rowEl) rowEl.remove();
        render(
            document.getElementById("search").value,
            document.getElementById("filter-cat").value,
            document.getElementById("filter-status").value,
        );
        updateStats();
        MC.toast("Medicine removed", "success");
    });
}
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btn-add").onclick = openAdd;
    document.getElementById("btn-save").onclick = saveRecord;
    document.getElementById("m-close").onclick = () =>
        MC.closeModal("form-modal");
    document.getElementById("m-cancel").onclick = () =>
        MC.closeModal("form-modal");
    document
        .getElementById("search")
        .addEventListener("input", (e) =>
            render(
                e.target.value,
                document.getElementById("filter-cat").value,
                document.getElementById("filter-status").value,
            ),
        );
    document
        .getElementById("filter-cat")
        .addEventListener("change", (e) =>
            render(
                document.getElementById("search").value,
                e.target.value,
                document.getElementById("filter-status").value,
            ),
        );
    document
        .getElementById("filter-status")
        .addEventListener("change", (e) =>
            render(
                document.getElementById("search").value,
                document.getElementById("filter-cat").value,
                e.target.value,
            ),
        );
    MC.initDeleteModal();
    MC.closeOnBackdrop("form-modal");
    MC.closeOnBackdrop("del-modal");
    render();
});

})();

// ==========================================================================
// prescription-detail.js
// ==========================================================================
document.addEventListener("DOMContentLoaded", function () {
  if (document.body.dataset.page !== "prescription-detail") return;

  var $ = function (id) { return document.getElementById(id); };
  var params = new URLSearchParams(window.location.search);
  var pick = function (key, fallback) { var v = params.get(key); return v && v.length ? v : fallback; };

  var r = {
    id: pick("id", "RX-30443"),
    patient: pick("patient", "Camila Restrepo"),
    mrn: pick("mrn", "#PAT-44091"),
    doctor: pick("doctor", "Dr. Marissa Bloom, MD"),
    drug: pick("drug", "Ketorolac 10 mg (Oral Tablet)"),
    status: pick("status", "Verified & Approved")
  };

  if ($("rxd-patient-name")) $("rxd-patient-name").textContent = r.patient;
  if ($("rxd-script-no")) $("rxd-script-no").textContent = r.id.startsWith("#") ? r.id : "#" + r.id;
  if ($("rxd-drug-title")) $("rxd-drug-title").textContent = r.drug;
  if ($("rxd-doctor-name")) $("rxd-doctor-name").textContent = r.doctor;
  if ($("rxd-mrn-no")) $("rxd-mrn-no").textContent = r.mrn;
  if ($("rxd-status-text")) $("rxd-status-text").textContent = r.status;
  if ($("rxd-side-doctor")) $("rxd-side-doctor").textContent = r.doctor;

  document.title = r.patient + " — " + r.id + " — Dreams HMS";

  // ---- DISPENSING ACTIONS ----
  var triggerDispense = function () {
    if (confirm("Proceed to dispense medication label & complete hand-off for " + r.id + "?")) {
      alert("Bottle label sent to Pharmacy Thermal Printer #03. Status updated to DISPENSED.");
    }
  };

  if ($("rxd-dispense-btn")) $("rxd-dispense-btn").addEventListener("click", triggerDispense);
  if ($("rxd-side-dispense")) $("rxd-side-dispense").addEventListener("click", triggerDispense);

  if ($("rxd-safety-btn")) {
    $("rxd-safety-btn").addEventListener("click", function () {
      alert("Clinical Interaction Check Passed: Zero contraindications found for " + r.drug + " against patient EHR profile.");
    });
  }

  document.querySelectorAll('[data-action="print"]').forEach(function (btn) {
    btn.addEventListener("click", function () {
      window.print();
    });
  });
});


// ==========================================================================
// prescriptions.js
// ==========================================================================
// Dreams HMS — Prescription Queue
// Dispensing pipeline: Pending → Verified → Dispensed, with holds for
// interaction or stock queries. Static demo data — no API.
(function () {
    "use strict";
    if ((location.pathname.split("/").pop() || "index.html") !== "prescriptions.html") return;

    const $ = (id) => document.getElementById(id);
    const esc = (v) => String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    // Deterministic photo per patient from the shared avatar set (assets/img/avatar/avatar-01..30.jpg).
    const AVATAR_COUNT = 30;
    function avatarSrc(name) {
        let h = 0;
        for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
        return "assets/img/avatar/avatar-" + String((h % AVATAR_COUNT) + 1).padStart(2, "0") + ".jpg";
    }

    const STATUS = { Pending: "badge-amber", Verified: "badge-blue", Dispensed: "badge-green", "On Hold": "badge-red" };
    const NEXT = { Pending: "Verified", Verified: "Dispensed" };

    let seq = 30440;
    const mk = (o) => (seq++, Object.assign({ id: "RX-" + seq }, o));

    function detailUrl(s) {
        return "prescription-detail.html?" + new URLSearchParams({
            id: s.id, patient: s.patient, drug: s.drug, status: s.status,
        }).toString();
    }

    let SCRIPTS = [
        mk({ patient: "Harold Nakamura", drug: "Amoxicillin 500 mg — 1 cap TDS, 7 days", prescriber: "Dr. Sarah Chen", type: "Inpatient", status: "Pending", wait: 12, ctrl: false }),
        mk({ patient: "Rosalind Pierce", drug: "Warfarin 5 mg — per INR schedule", prescriber: "Dr. Elena Vasquez", type: "Inpatient", status: "Pending", wait: 24, ctrl: false }),
        mk({ patient: "Deshawn Pritchard", drug: "Oxycodone 10 mg — 1 tab BD PRN", prescriber: "Dr. Marissa Bloom", type: "Discharge", status: "On Hold", wait: 47, ctrl: true, holdReason: "Controlled — awaiting second signature" }),
        mk({ patient: "Camila Restrepo", drug: "Ketorolac 10 mg — 1 tab QDS, 5 days", prescriber: "Dr. Marissa Bloom", type: "Discharge", status: "Verified", wait: 18, ctrl: false }),
        mk({ patient: "Julian Alvarez", drug: "Salbutamol inhaler — 2 puffs PRN", prescriber: "Dr. Amara Osei", type: "Outpatient", status: "Verified", wait: 9, ctrl: false }),
        mk({ patient: "Yolanda Prescott", drug: "Meropenem 1 g IV — q8h", prescriber: "Dr. Rafael Contreras", type: "Inpatient", status: "Dispensed", wait: 31, ctrl: false }),
        mk({ patient: "Grant Sutherland", drug: "Naproxen 250 mg — 1 tab BD with food", prescriber: "Dr. Elena Vasquez", type: "Outpatient", status: "Dispensed", wait: 22, ctrl: false }),
        mk({ patient: "Bernadette Cho", drug: "Ondansetron 4 mg — 1 tab TDS PRN", prescriber: "Dr. Sarah Chen", type: "Outpatient", status: "Pending", wait: 6, ctrl: false }),
        mk({ patient: "Emmett Sandoval", drug: "Enoxaparin 40 mg SC — OD", prescriber: "Dr. Yusuf Karim", type: "Inpatient", status: "Verified", wait: 15, ctrl: false }),
    ];

    function renderHero() {
        const pending = SCRIPTS.filter((s) => s.status === "Pending").length;
        const held = SCRIPTS.filter((s) => s.status === "On Hold").length;
        const flag =
            held >= 2 ? { cls: "tone-critical", text: held + " Scripts Held" }
            : pending >= 5 ? { cls: "tone-medium", text: "Queue Building" }
            : { cls: "tone-stable", text: "Queue Moving" };
        $("ph-flag").className = "hms-chip " + flag.cls;
        $("ph-flag-text").textContent = flag.text;
        $("hero-summary").textContent = SCRIPTS.length + " scripts today · " + pending + " pending";
    }

    function renderKpis() {
        const by = (st) => SCRIPTS.filter((s) => s.status === st).length;
        const ctrl = SCRIPTS.filter((s) => s.ctrl).length;
        const avgWait = Math.round(SCRIPTS.reduce((s, x) => s + x.wait, 0) / SCRIPTS.length);

        const cards = [
            { id: "kpi-total", icon: "icon-file-text", label: "Scripts Today", value: SCRIPTS.length, tone: "ph-primary", meta: "all sources" },
            { id: "kpi-pending", icon: "icon-clock", label: "Pending", value: by("Pending"), tone: "ph-amber", meta: "awaiting review" },
            { id: "kpi-verified", icon: "icon-circle-check", label: "Verified", value: by("Verified"), tone: "ph-sky", meta: "ready to dispense" },
            { id: "kpi-dispensed", icon: "icon-package-check", label: "Dispensed", value: by("Dispensed"), tone: "ph-primary", meta: "completed" },
            { id: "kpi-hold", icon: "icon-pause", label: "On Hold", value: by("On Hold"), tone: "ph-danger", meta: "query raised" },
            { id: "kpi-wait", icon: "icon-timer", label: "Avg Wait", value: avgWait + "m", tone: "ph-slate", meta: ctrl + " controlled in queue" },
        ];

        $("kpi-row").innerHTML = cards
            .map((c) =>
                '<article class="ph-kpi ' + c.tone + '"><div class="ph-kpi-head"><span class="ph-kpi-icon"><i class="' + c.icon + '" aria-hidden="true"></i></span></div>' +
                '<p class="ph-kpi-value"><span id="' + c.id + '">' + c.value + '</span></p><p class="ph-kpi-label">' + c.label + "</p>" +
                '<p class="ph-kpi-meta"><i class="icon-circle-dot text-[8px]" aria-hidden="true"></i>' + c.meta + "</p></article>"
            )
            .join("");
    }

    // One row's markup for a script (used both for the static rows already in
    // the page and to patch a single row after an advance/hold/release edit).
    function rowHTML(s) {
        const acts = [];
        if (NEXT[s.status]) acts.push({ label: "Mark " + NEXT[s.status], icon: "icon-check", act: "advance" });
        if (s.status !== "On Hold" && s.status !== "Dispensed") acts.push({ label: "Put On Hold", icon: "icon-pause", act: "hold", danger: true });
        if (s.status === "On Hold") acts.push({ label: "Release Hold", icon: "icon-play", act: "release" });
        acts.push({ label: "Print Label", icon: "icon-printer", act: "print" });

        return (
            '<tr class="hms-row" data-row-id="' + esc(s.id) + '">' +
            '<td class="hms-cell"><div class="flex items-center gap-3">' +
            '<span class="hms-member-avatar ph-primary size-9! overflow-hidden!"><img src="' + avatarSrc(s.patient) + '" alt="" class="size-full object-cover" loading="lazy"></span>' +
            '<div class="min-w-0"><p class="text-xs font-bold text-gray-900 truncate"><a href="' + detailUrl(s) + '" class="hover:underline">' + esc(s.patient) + "</a></p>" +
            '<p class="text-[10px] text-gray-400 font-mono">' + esc(s.id) + "</p></div></div></td>" +
            '<td class="hms-cell"><div class="flex items-center gap-2 max-w-64">' +
            (s.ctrl ? '<span class="ph-sched sched-2 shrink-0" title="Controlled substance"><i class="icon-shield text-[9px]" aria-hidden="true"></i>C</span>' : "") +
            '<p class="text-xs text-gray-600 dark:text-gray-300 truncate" title="' + esc(s.drug) + '">' + esc(s.drug) + "</p></div>" +
            (s.holdReason ? '<p class="mt-0.5 text-[10px] font-bold text-danger">' + esc(s.holdReason) + "</p>" : "") + "</td>" +
            '<td class="hms-cell"><span class="text-xs text-gray-600 dark:text-gray-300">' + esc(s.prescriber) + "</span></td>" +
            '<td class="hms-cell"><span class="hms-chip tone-info">' + s.type + "</span></td>" +
            '<td class="hms-cell"><span class="text-xs font-bold tabular-nums ' + (s.wait >= 30 ? "text-danger" : "text-gray-900") + '">' + s.wait + "m</span></td>" +
            '<td class="hms-cell"><span class="badge ' + STATUS[s.status] + '">' + s.status + "</span></td>" +
            '<td class="hms-cell text-right">' + MC.actions(s.id, acts) + "</td></tr>"
        );
    }

    // Held scripts float to the top, then longest-waiting first — this is
    // the same order the static rows were written in.
    function sortedScripts() {
        return SCRIPTS.slice().sort((a, b) => (a.status === "On Hold" ? -1 : 0) - (b.status === "On Hold" ? -1 : 0) || b.wait - a.wait);
    }

    // Rows are already present as static HTML, in the sorted order above.
    // Filtering only toggles visibility on the existing [data-row-id] rows
    // instead of rebuilding the table body.
    function renderGrid() {
        const q = $("search").value.trim().toLowerCase();
        const st = $("filter-status").value;
        const type = $("filter-type").value;

        const rows = SCRIPTS.filter((s) => {
            const hit = !q || s.id.toLowerCase().includes(q) || s.patient.toLowerCase().includes(q) || s.drug.toLowerCase().includes(q);
            return hit && (!st || s.status === st) && (!type || s.type === type);
        });
        const visible = new Set(rows.map((s) => s.id));

        $("grid-count").textContent = rows.length + (rows.length === 1 ? " script" : " scripts");

        let anyVisible = false;
        $("grid-body").querySelectorAll("[data-row-id]").forEach((tr) => {
            const show = visible.has(tr.dataset.rowId);
            tr.classList.toggle("hidden", !show);
            if (show) anyVisible = true;
        });
        const emptyRow = $("grid-empty-row");
        if (emptyRow) emptyRow.classList.toggle("hidden", anyVisible);
    }

    // Advance/hold/release can move a script between the held and non-held
    // groups, which changes its sort position — reposition the DOM to match
    // instead of just leaving insertion order stale.
    function reorderRows() {
        const tbody = $("grid-body");
        sortedScripts().forEach((s) => {
            const el = tbody.querySelector('[data-row-id="' + s.id + '"]');
            if (el) tbody.appendChild(el);
        });
        const emptyRow = $("grid-empty-row");
        if (emptyRow) tbody.appendChild(emptyRow);
    }

    function patchRow(s) {
        const rowEl = $("grid-body").querySelector('[data-row-id="' + s.id + '"]');
        if (rowEl) rowEl.outerHTML = rowHTML(s);
        if (window.HSStaticMethods) window.HSStaticMethods.autoInit();
    }

    function renderAll() {
        renderHero();
        renderKpis();
        renderGrid();
    }

    function init() {
        document.body.insertAdjacentHTML("beforeend", MC.deleteModalHTML);
        // Hero flag/summary and the KPI row are baked into the HTML for the
        // default SCRIPTS data — only the grid's search/filter view needs to
        // run on load. renderHero()/renderKpis() still run after a genuine
        // mutation (advance/hold/release/add) below.
        renderGrid();

        $("search").addEventListener("input", renderGrid);
        $("filter-status").addEventListener("change", renderGrid);
        $("filter-type").addEventListener("change", renderGrid);

        $("grid-body").addEventListener("click", function (e) {
            const btn = e.target.closest("[data-act]");
            if (!btn) return;
            const s = SCRIPTS.find((x) => x.id === btn.dataset.id);
            if (!s) return;
            const act = btn.dataset.act;

            if (act === "advance") {
                // Controlled scripts need the witness step before dispensing.
                if (s.ctrl && NEXT[s.status] === "Dispensed") {
                    MC.confirmDelete(s.id + " — controlled dispense (witness confirmed)", function () {
                        s.status = "Dispensed";
                        patchRow(s);
                        reorderRows();
                        renderAll();
                        MC.toast(s.id + " dispensed with witness signature.", "success");
                    });
                    return;
                }
                s.status = NEXT[s.status];
                patchRow(s);
                reorderRows();
                renderAll();
                MC.toast(s.id + " → " + s.status + ".", "success");
            } else if (act === "hold") {
                s.status = "On Hold";
                s.holdReason = "Pharmacist query raised";
                patchRow(s);
                reorderRows();
                renderAll();
                MC.toast(s.id + " placed on hold.", "info");
            } else if (act === "release") {
                s.status = "Pending";
                delete s.holdReason;
                patchRow(s);
                reorderRows();
                renderAll();
                MC.toast(s.id + " released back to the queue.", "success");
            } else if (act === "print") {
                MC.toast("Label printed for " + s.id + ".", "info");
            }
        });

        $("btn-add").addEventListener("click", function () {
            $("rx-form").reset();
            MC.openModal("rx-modal");
        });
        $("btn-print").addEventListener("click", function () {
            MC.toast("Dispensing queue sent to the printer.", "info");
            window.print();
        });

        $("rx-close").addEventListener("click", () => MC.closeModal("rx-modal"));
        $("rx-cancel").addEventListener("click", () => MC.closeModal("rx-modal"));
        $("rx-save").addEventListener("click", function () {
            const patient = $("rx-patient").value.trim();
            const drug = $("rx-drug").value.trim();
            if (!patient) return MC.toast("Enter the patient name.", "error");
            if (!drug) return MC.toast("Enter the medication and directions.", "error");
            const s = mk({
                patient: patient, drug: drug,
                prescriber: $("rx-prescriber").value.trim() || "—",
                type: $("rx-type").value, status: "Pending", wait: 0,
                ctrl: !!$("rx-controlled").value,
            });
            SCRIPTS.unshift(s);
            const emptyRow = $("grid-empty-row");
            if (emptyRow) emptyRow.insertAdjacentHTML("beforebegin", rowHTML(s));
            else $("grid-body").insertAdjacentHTML("beforeend", rowHTML(s));
            reorderRows();
            if (window.HSStaticMethods) window.HSStaticMethods.autoInit();
            MC.closeModal("rx-modal");
            renderAll();
            MC.toast("Prescription added for " + patient + ".", "success");
        });

        MC.initDeleteModal();
        ["rx-modal", "del-modal"].forEach(MC.closeOnBackdrop);
        document.addEventListener("keydown", function (e) {
            if (e.key !== "Escape") return;
            ["rx-modal", "del-modal"].forEach(MC.closeModal);
        });
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
})();

// ==========================================================================
// purchase-order-detail.js
// ==========================================================================
// ---- Purchase Order Detail --------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
  if (document.body.dataset.page !== "purchase-order-detail") return;

  var $ = function (id) { return document.getElementById(id); };
  var params = new URLSearchParams(window.location.search);
  var pick = function (key, fallback) { var v = params.get(key); return v && v.length ? v : fallback; };

  var r = {
    id: pick("id", "1"),
    supplier: pick("supplier", "MedSupply Co."),
    items: pick("items", "Gloves, Syringes, Masks"),
    amount: pick("amount", "3200"),
    date: pick("date", "2024-12-01"),
    status: pick("status", "Received"),
  };

  function fmt(n) {
    return "$" + parseFloat(n || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  var BADGE = {
    Draft: "text-gray-600 bg-gray-100",
    Sent: "text-warning bg-warning/10",
    Received: "text-success bg-success/10",
  };

  var poId = "#PO-" + String(r.id).padStart(5, "0");
  var itemList = r.items.split(",").map(function (s) { return s.trim(); }).filter(Boolean);
  var amountFmt = fmt(r.amount);

  $("pod-supplier-name").textContent = r.supplier;
  $("pod-status-badge").textContent = r.status;
  $("pod-po-id").textContent = poId;
  $("pod-items-count").textContent = itemList.length + (itemList.length === 1 ? " item" : " items");
  $("pod-date").textContent = r.date;
  $("pod-supplier-stat").textContent = r.supplier;
  $("pod-amount").textContent = amountFmt;
  $("pod-order-date").textContent = r.date;
  $("pod-status-stat").textContent = r.status;
  $("pod-side-supplier").textContent = r.supplier;
  $("pod-kv-supplier").textContent = r.supplier;
  $("pod-kv-poid").textContent = poId;
  $("pod-kv-amount").textContent = amountFmt;
  $("pod-kv-date").textContent = r.date;
  document.title = "Purchase Order " + poId + " — Dreams HMS";

  var STATUS_TONE = { Draft: "#4b5563", Sent: "#F59E0B", Received: "#009966" };

  var badgeCls = BADGE[r.status] || "text-gray-600 bg-gray-100";
  var badgeEl = $("pod-status-badge");
  badgeCls.split(" ").forEach(function (c) { badgeEl.classList.add(c); });

  var tone = STATUS_TONE[r.status] || "#94a3b8";
  var dot = badgeEl.previousElementSibling;
  if (dot) dot.style.background = tone;

  // ---- Workflow timeline ----
  var STAGES = ["Draft", "Sent", "Received"];
  var STAGE_ICON = ["icon-file-text", "icon-truck", "icon-check-circle"];
  var reachedIndex = STAGES.indexOf(r.status);
  reachedIndex = reachedIndex === -1 ? 0 : reachedIndex;

  $("pod-timeline").innerHTML = STAGES.map(function (label, i) {
    var state = i < reachedIndex ? "done" : i === reachedIndex ? "current" : "";
    var when = i <= reachedIndex ? r.date : "Pending";
    return '<div class="pod-tl-item ' + state + '"><span class="pod-tl-node"><i class="' + STAGE_ICON[i] + '"></i></span>' +
      '<p class="text-sm font-bold text-gray-900 dark:text-white">' + label + '</p>' +
      '<p class="text-xs text-gray-500 dark:text-gray-400">' + when + '</p></div>';
  }).join("");

  // ---- Items ordered ----
  $("pod-items-list").innerHTML = itemList.map(function (item) {
    return '<li><span class="ico"><i class="icon-package"></i></span>' + item + "</li>";
  }).join("");

  // ---- Actions ----
  var downloadHandler = function () {
    MC.toast("Preparing order PDF download…", "info");
  };
  $("pod-download-btn").onclick = downloadHandler;
  $("pod-download-btn-2").onclick = downloadHandler;
});

// ==========================================================================
// stock-alerts.js
// ==========================================================================
// Dreams HMS — Stock Alerts
// Actionable alert feed: out-of-stock, low stock, expiry, cold-chain and
// controlled-count events, with acknowledge → resolve flow. No API.
(function () {
    "use strict";
    if ((location.pathname.split("/").pop() || "index.html") !== "stock-alerts.html") return;

    const $ = (id) => document.getElementById(id);
    const esc = (v) => String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

    const TYPE = {
        out: { label: "Out of Stock", icon: "icon-circle-x", tone: "ph-danger", chip: "tone-critical" },
        low: { label: "Low Stock", icon: "icon-triangle-alert", tone: "ph-amber", chip: "tone-medium" },
        expiry: { label: "Expiry", icon: "icon-calendar-clock", tone: "ph-amber", chip: "tone-medium" },
        cold: { label: "Cold Chain", icon: "icon-thermometer", tone: "ph-sky", chip: "tone-info" },
        controlled: { label: "Controlled Count", icon: "icon-shield", tone: "ph-violet", chip: "tone-critical" },
    };

    let ALERTS = [
        { id: "AL-101", type: "out", title: "Xanax 0.5 mg out of stock", body: "Main Pharmacy shows zero on hand. 3 scripts waiting. Reorder level 250.", time: "09:36 AM", state: "open", severity: 3 },
        { id: "AL-102", type: "controlled", title: "C-II count variance — OxyContin", body: "Witness count found 318 tablets; register expects 320. Variance of 2 requires investigation and DEA log entry.", time: "09:20 AM", state: "open", severity: 3 },
        { id: "AL-103", type: "cold", title: "Cold room excursion — 22 minutes", body: "Cold Chain store logged 9.4 °C peak overnight. Insulin stock quarantined pending stability check.", time: "08:47 AM", state: "open", severity: 3 },
        { id: "AL-104", type: "low", title: "Adderall 20 mg below reorder", body: "180 on hand against a reorder level of 300. Preferred supplier Cardinal Health, lead time 3 days.", time: "08:15 AM", state: "ack", severity: 2 },
        { id: "AL-105", type: "expiry", title: "Adrenaline 1:1000 expired", body: "Batch ADR25X9 in ED Satellite passed expiry 4 days ago — 25 ampoules to withdraw.", time: "07:58 AM", state: "open", severity: 3 },
        { id: "AL-106", type: "low", title: "Ativan injection below reorder", body: "140 on hand against a reorder level of 180 in OR Store.", time: "07:40 AM", state: "ack", severity: 2 },
        { id: "AL-107", type: "expiry", title: "Zofran batch inside 30 days", body: "Batch ZOF25Q1 expires 08 Aug — 90 units. Rotate to front and use first.", time: "07:12 AM", state: "open", severity: 1 },
        { id: "AL-108", type: "cold", title: "Fridge 2 door ajar 6 minutes", body: "Within the 15-minute tolerance. Logged for trend only, no action needed.", time: "06:50 AM", state: "resolved", severity: 1 },
        { id: "AL-109", type: "low", title: "Codeine Linctus near reorder", body: "260 on hand, reorder at 150 — approaching threshold at current usage.", time: "06:31 AM", state: "resolved", severity: 1 },
    ];

    function renderHero() {
        const open = ALERTS.filter((a) => a.state === "open").length;
        const critical = ALERTS.filter((a) => a.state === "open" && a.severity === 3).length;
        const flag =
            critical >= 3 ? { cls: "tone-critical", text: critical + " Critical Alerts" }
            : open ? { cls: "tone-medium", text: open + " Alerts Open" }
            : { cls: "tone-stable", text: "All Clear" };
        $("ph-flag").className = "hms-chip " + flag.cls;
        $("ph-flag-text").textContent = flag.text;
        $("hero-summary").textContent = open + " open alerts · " + ALERTS.filter((a) => a.state === "resolved").length + " resolved today";
    }

    function renderKpis() {
        const open = ALERTS.filter((a) => a.state === "open");
        const byType = (t) => ALERTS.filter((a) => a.type === t && a.state !== "resolved").length;

        const cards = [
            { id: "kpi-open", icon: "icon-bell-ring", label: "Open Alerts", value: open.length, tone: "ph-danger", meta: "need action" },
            { id: "kpi-out", icon: "icon-circle-x", label: "Out of Stock", value: byType("out"), tone: "ph-danger", meta: "dispensing blocked" },
            { id: "kpi-low", icon: "icon-triangle-alert", label: "Low Stock", value: byType("low"), tone: "ph-amber", meta: "reorder due" },
            { id: "kpi-expiry", icon: "icon-calendar-clock", label: "Expiry", value: byType("expiry"), tone: "ph-sky", meta: "rotation / withdrawal" },
            { id: "kpi-cold", icon: "icon-thermometer", label: "Cold Chain", value: byType("cold"), tone: "ph-violet", meta: "temperature events" },
            { id: "kpi-controlled", icon: "icon-shield", label: "Controlled", value: byType("controlled"), tone: "ph-primary", meta: "count variances" },
        ];

        $("kpi-row").innerHTML = cards
            .map((c) =>
                '<article class="ph-kpi ' + c.tone + '"><div class="ph-kpi-head"><span class="ph-kpi-icon"><i class="' + c.icon + '" aria-hidden="true"></i></span></div>' +
                '<p class="ph-kpi-value"><span id="' + c.id + '">' + c.value + '</span></p><p class="ph-kpi-label">' + c.label + "</p>" +
                '<p class="ph-kpi-meta"><i class="icon-circle-dot text-[8px]" aria-hidden="true"></i>' + c.meta + "</p></article>"
            )
            .join("");
    }

    // One alert's markup — used both for the static cards already in the
    // page and to patch a single card after an acknowledge/resolve edit.
    function rowHTML(a) {
        const t = TYPE[a.type];
        const stateBadge =
            a.state === "open" ? '<span class="badge badge-red">Open</span>'
            : a.state === "ack" ? '<span class="badge badge-amber">Acknowledged</span>'
            : '<span class="badge badge-green">Resolved</span>';

        const btns =
            a.state === "open"
                ? '<button type="button" data-ack="' + a.id + '" class="px-2.5 py-1.5 rounded-lg bg-warning/10 text-warning text-[10px] font-bold hover:bg-warning/20 transition-colors">Acknowledge</button>'
                : a.state === "ack"
                ? '<button type="button" data-resolve="' + a.id + '" class="px-2.5 py-1.5 rounded-lg bg-success/10 text-success text-[10px] font-bold hover:bg-success/20 transition-colors">Resolve</button>'
                : "";
        const reorder = (a.type === "out" || a.type === "low") && a.state !== "resolved"
            ? '<button type="button" data-reorder="' + a.id + '" class="px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary text-[10px] font-bold hover:bg-primary/20 transition-colors">Raise PO</button>'
            : "";

        return (
            '<article class="flex gap-3 p-4' + (a.state === "resolved" ? " opacity-60" : "") + '" data-row-id="' + esc(a.id) + '">' +
            '<span class="ph-kpi-icon ' + t.tone + ' shrink-0"><i class="' + t.icon + '" aria-hidden="true"></i></span>' +
            '<div class="min-w-0 flex-1">' +
            '<div class="flex flex-wrap items-center gap-2">' +
            '<p class="text-xs font-bold text-gray-900 mr-auto">' + esc(a.title) + "</p>" +
            '<span class="hms-chip ' + t.chip + '">' + t.label + "</span>" + stateBadge + "</div>" +
            '<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">' + esc(a.body) + "</p>" +
            '<div class="mt-2 flex flex-wrap items-center gap-2">' +
            '<span class="text-[10px] font-semibold text-gray-400 tabular-nums mr-auto">' + esc(a.time) + " · " + esc(a.id) + "</span>" +
            reorder + btns +
            "</div></div></article>"
        );
    }

    // Open alerts float to the top, then highest severity first — this is
    // the same order the static cards were written in.
    function sortedAlerts() {
        return ALERTS.slice().sort((a, b) => (a.state === "open" ? -1 : 0) - (b.state === "open" ? -1 : 0) || b.severity - a.severity);
    }

    // Cards are already present as static HTML, in the sorted order above.
    // Filtering only toggles visibility on the existing [data-row-id] cards
    // instead of rebuilding the feed.
    function renderFeed() {
        const type = $("filter-type").value;
        const stateSel = $("filter-state").value;

        // Default view hides resolved; open first, then by severity.
        const rows = ALERTS.filter((a) => {
            const okType = !type || a.type === type;
            const okState = stateSel ? a.state === stateSel : a.state !== "resolved";
            return okType && okState;
        });
        const visible = new Set(rows.map((a) => a.id));

        $("feed-count").textContent = ALERTS.filter((a) => a.state === "open").length + " open";

        let anyVisible = false;
        $("feed").querySelectorAll("[data-row-id]").forEach((el) => {
            const show = visible.has(el.dataset.rowId);
            el.classList.toggle("hidden", !show);
            if (show) anyVisible = true;
        });
        const emptyRow = $("feed-empty-row");
        if (emptyRow) emptyRow.classList.toggle("hidden", anyVisible);
    }

    // Acknowledge/Resolve can move an alert between the open and non-open
    // groups, which changes its sort position — reposition the DOM to match
    // instead of leaving insertion order stale.
    function reorderRows() {
        const feed = $("feed");
        sortedAlerts().forEach((a) => {
            const el = feed.querySelector('[data-row-id="' + a.id + '"]');
            if (el) feed.appendChild(el);
        });
        const emptyRow = $("feed-empty-row");
        if (emptyRow) feed.appendChild(emptyRow);
    }

    function patchAlert(a) {
        const el = $("feed").querySelector('[data-row-id="' + a.id + '"]');
        if (el) el.outerHTML = rowHTML(a);
    }

    function renderAll() {
        renderHero();
        renderKpis();
        renderFeed();
    }

    function init() {
        document.body.insertAdjacentHTML("beforeend", MC.deleteModalHTML);
        // Hero flag/summary and the KPI row are baked into the HTML for the
        // default ALERTS data — only the feed's filter view needs to run on
        // load. renderHero()/renderKpis() still run after a genuine
        // acknowledge/resolve mutation below.
        renderFeed();

        $("filter-type").addEventListener("change", renderFeed);
        $("filter-state").addEventListener("change", renderFeed);

        $("feed").addEventListener("click", function (e) {
            const ack = e.target.closest("[data-ack]");
            if (ack) {
                const a = ALERTS.find((x) => x.id === ack.dataset.ack);
                a.state = "ack";
                patchAlert(a);
                reorderRows();
                renderAll();
                return MC.toast(a.id + " acknowledged — assigned to the duty pharmacist.", "info");
            }
            const res = e.target.closest("[data-resolve]");
            if (res) {
                const a = ALERTS.find((x) => x.id === res.dataset.resolve);
                a.state = "resolved";
                patchAlert(a);
                reorderRows();
                renderAll();
                return MC.toast(a.id + " resolved.", "success");
            }
            const ro = e.target.closest("[data-reorder]");
            if (ro) {
                const a = ALERTS.find((x) => x.id === ro.dataset.reorder);
                return MC.toast("Draft PO raised from " + a.id + " — continue on Purchase Orders.", "success");
            }
        });

        $("btn-ack-all").addEventListener("click", function () {
            const open = ALERTS.filter((a) => a.state === "open");
            if (!open.length) return MC.toast("No open alerts to acknowledge.", "info");
            open.forEach((a) => {
                a.state = "ack";
                patchAlert(a);
            });
            reorderRows();
            renderAll();
            MC.toast(open.length + " alerts acknowledged.", "success");
        });

        $("btn-rules").addEventListener("click", () => MC.openModal("rules-modal"));
        $("rl-cancel").addEventListener("click", () => MC.closeModal("rules-modal"));
        $("rl-save").addEventListener("click", function () {
            MC.closeModal("rules-modal");
            MC.toast("Alert rules saved — low @ " + $("rl-low").value + "%, expiry " + $("rl-expiry").value + "d, cold chain " + $("rl-cold").value + "m.", "success");
        });

        MC.initDeleteModal();
        ["rules-modal", "del-modal"].forEach(MC.closeOnBackdrop);
        document.addEventListener("keydown", function (e) {
            if (e.key !== "Escape") return;
            ["rules-modal", "del-modal"].forEach(MC.closeModal);
        });
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
})();

