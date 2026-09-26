// ==========================================================================
// billing-dashboard.js
// ==========================================================================
// Dreams HMS — Billing & Revenue Command Center
// Nadia Rahman's finance floor: revenue pipeline, invoice kanban,
// analytics tiles with sparklines, payment mix, claims desk, collections
// ledger, department meters, refund rail, performance dials and the
// transaction feed. Headline figures derive from the lists. No API.
(function () {
    "use strict";

    const $ = (id) => document.getElementById(id);
    const esc = (v) => String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    const initials = (n) => n.replace(/^(Dr|Mr|Mrs|Ms)\.?\s+/i, "").split(/\s+/).slice(0, 2).map((p) => p.charAt(0).toUpperCase()).join("");
    const toast = (msg, tone) => (window.MC && MC.toast ? MC.toast(msg, tone || "info") : console.log(msg));
    const money = (n) => "$" + n.toLocaleString("en-US");

    /* ====================================================================
       Data — Finance Office (now = 4:05 PM)
       ==================================================================== */

    const PIPELINE = [
        { name: "Patient Registration", icon: "icon-user-plus", tx: 214, amount: "$3,210", pct: 100, pending: 0 },
        { name: "Consultation", icon: "icon-stethoscope", tx: 186, amount: "$14,880", pct: 92, pending: 6 },
        { name: "Invoice Generated", icon: "icon-file-text", tx: 162, amount: "$41,350", pct: 84, pending: 12 },
        { name: "Payment Processing", icon: "icon-credit-card", tx: 128, amount: "$28,940", pct: 71, pending: 18 },
        { name: "Insurance Verification", icon: "icon-shield-check", tx: 44, amount: "$19,230", pct: 58, pending: 9 },
        { name: "Completed", icon: "icon-badge-check", tx: 119, amount: "$26,180", pct: 66, pending: 0 },
    ];
    const CURRENT_STAGE = 3;

    let INVOICES = [
        { no: "INV-9218", patient: "Amelia Hartley", dept: "Radiology", amount: 1240, method: "Card", due: "Jul 17", ins: "Not covered", pri: "VIP", lane: "draft" },
        { no: "INV-9219", patient: "Dmitri Volkov", dept: "OPD", amount: 180, method: "Cash", due: "Jul 17", ins: "—", pri: "Normal", lane: "draft" },
        { no: "INV-9214", patient: "Harold Nakamura", dept: "IPD · Cardiology", amount: 4820, method: "Insurance", due: "Jul 19", ins: "Verifying", pri: "High", lane: "pending" },
        { no: "INV-9215", patient: "Sofia Marino", dept: "Laboratory", amount: 320, method: "UPI", due: "Jul 17", ins: "—", pri: "Normal", lane: "pending" },
        { no: "INV-9211", patient: "Rosa Delgado", dept: "IPD · Med-Surg", amount: 6140, method: "Insurance", due: "Jul 21", ins: "Claim filed", pri: "High", lane: "insurance" },
        { no: "INV-9208", patient: "Fatima Al-Rashid", dept: "Emergency", amount: 2210, method: "Insurance", due: "Jul 20", ins: "Pre-auth OK", pri: "Urgent", lane: "insurance" },
        { no: "INV-9209", patient: "Johan Petersen", dept: "OPD · Cardiology", amount: 260, method: "Card", due: "Paid 2:40 PM", ins: "—", pri: "Normal", lane: "paid" },
        { no: "INV-9206", patient: "Hana Suzuki", dept: "Laboratory", amount: 145, method: "UPI", due: "Paid 1:15 PM", ins: "—", pri: "Normal", lane: "paid" },
        { no: "INV-9187", patient: "Bruno Silva", dept: "Orthopedics", amount: 890, method: "Card", due: "Jul 10", ins: "Rejected", pri: "High", lane: "overdue" },
        { no: "INV-9171", patient: "George Mensah", dept: "Pharmacy", amount: 210, method: "Cash", due: "Jul 5", ins: "—", pri: "Normal", lane: "overdue" },
    ];
    const LANES = [
        { key: "draft", label: "Draft", tone: "bl-slate, bl-indigo" },
        { key: "pending", label: "Pending Payment", tone: "bl-amber" },
        { key: "insurance", label: "Insurance Review", tone: "bl-sky" },
        { key: "paid", label: "Paid", tone: "bl-emerald" },
        { key: "overdue", label: "Overdue", tone: "bl-rose" },
    ];
    const PRI_TONE = { Urgent: "bl-rose", High: "bl-amber", VIP: "bl-violet", Normal: "bl-sky" };
    const REVENUE_BASE = 24280; // settled before the board's window

    const ANALYTICS = [
        { label: "Today's Revenue", val: "$26,180", delta: "+9.2%", up: true, tone: "bl-gold", spark: [18, 22, 19, 25, 23, 28, 31] },
        { label: "Weekly Revenue", val: "$148,420", delta: "+6.4%", up: true, tone: "bl-emerald", spark: [110, 118, 126, 121, 133, 141, 148] },
        { label: "Monthly Revenue", val: "$512,090", delta: "+11.8%", up: true, tone: "bl-sky", spark: [380, 402, 431, 458, 470, 495, 512] },
        { label: "Outstanding Balance", val: "$38,660", delta: "-4.1%", up: false, good: true, tone: "bl-rose", spark: [52, 49, 47, 44, 42, 40, 38] },
        { label: "Collection Rate", val: "93.4%", delta: "+1.2 pts", up: true, tone: "bl-violet", spark: [88, 89, 91, 90, 92, 93, 93.4] },
        { label: "Avg Invoice Value", val: "$318", delta: "+$14", up: true, tone: "bl-amber", spark: [285, 290, 298, 301, 305, 312, 318] },
    ];

    const PAYMENTS = [
        { label: "Cash Payments", amount: 4120, tx: 38, pct: 16, tone: "bl-emerald", icon: "icon-banknote" },
        { label: "Card Payments", amount: 7860, tx: 41, pct: 30, tone: "bl-sky", icon: "icon-credit-card" },
        { label: "Online Payments", amount: 3340, tx: 22, pct: 13, tone: "bl-indigo", icon: "icon-globe" },
    ];

    let CLAIMS = [
        { no: "CLM-4471", provider: "MediShield Plus", patient: "Rosa Delgado", amount: 6140, status: "Under Review", tone: "bl-amber", expiring: false },
        { no: "CLM-4468", provider: "HealthFirst", patient: "Harold Nakamura", amount: 4820, status: "Pending", tone: "bl-sky", expiring: false },
        { no: "CLM-4462", provider: "CarePlus Assurance", patient: "Fatima Al-Rashid", amount: 2210, status: "Approved", tone: "bl-emerald", expiring: false },
        { no: "CLM-4455", provider: "MediShield Plus", patient: "Bruno Silva", amount: 890, status: "Rejected", tone: "bl-rose", expiring: false },
        { no: "CLM-4449", provider: "HealthFirst", patient: "Emmett Sandoval", amount: 3480, status: "Reimbursed", tone: "bl-violet", expiring: false },
        { no: "CLM-4431", provider: "CarePlus Assurance", patient: "Miriam Adeyemi", amount: 1750, status: "Expiring", tone: "bl-rose", expiring: true },
    ];
    const CLAIM_STATS = [
        { label: "Pending", n: 2, tone: "bl-sky", icon: "icon-hourglass" },
        { label: "Approved", n: 1, tone: "bl-emerald", icon: "icon-check" },
        { label: "Rejected", n: 1, tone: "bl-rose", icon: "icon-x" },
        { label: "Reimbursed", n: 1, tone: "bl-violet", icon: "icon-banknote" },
    ];

    let COLLECTIONS = [
        { patient: "Bruno Silva", amount: 890, due: "Jul 10", days: 7, reminded: "2 reminders sent", phone: "+1 555-0142", tone: "bl-rose" },
        { patient: "George Mensah", amount: 210, due: "Jul 5", days: 12, reminded: "Final notice sent", phone: "+1 555-0177", tone: "bl-rose" },
        { patient: "Peter Kowalski", amount: 460, due: "Jul 14", days: 3, reminded: "1 reminder sent", phone: "+1 555-0129", tone: "bl-amber" },
        { patient: "Selma Björk", amount: 1120, due: "Jul 16", days: 1, reminded: "Not reminded yet", phone: "+1 555-0158", tone: "bl-amber" },
    ];

    const DEPARTMENTS = [
        { name: "OPD", rev: 6840, growth: "+8%", up: true, tx: 96, pct: 26, tone: "bl-gold", icon: "icon-stethoscope" },
        { name: "IPD", rev: 8920, growth: "+12%", up: true, tx: 21, pct: 34, tone: "bl-emerald", icon: "icon-bed" },
        { name: "Pharmacy", rev: 4310, growth: "+5%", up: true, tx: 87, pct: 16, tone: "bl-violet", icon: "icon-pill" },
        { name: "Laboratory", rev: 3150, growth: "-2%", up: false, tx: 64, pct: 12, tone: "bl-sky", icon: "icon-flask-conical" },
    ];

    let REFUNDS = [
        { id: "RFD-312", patient: "Sofia Marino", amount: 85, reason: "Duplicate lab charge", state: "Pending Approval", tone: "bl-amber", icon: "icon-hourglass" },
        { id: "RFD-311", patient: "Amelia Hartley", amount: 220, reason: "Cancelled radiology slot", state: "Approved", tone: "bl-sky", icon: "icon-check" },
        { id: "RFD-309", patient: "Johan Petersen", amount: 60, reason: "Overpayment at counter", state: "Completed", tone: "bl-emerald", icon: "icon-badge-check" },
        { id: "RFD-308", patient: "Hana Suzuki", amount: 145, reason: "Test not performed", state: "Requested", tone: "bl-violet", icon: "icon-inbox" },
    ];

    const PERF = [
        { label: "Collection Efficiency", val: "93%", pct: 93, tone: "bl-emerald" },
        { label: "Insurance Success", val: "87%", pct: 87, tone: "bl-sky" },
        { label: "Avg Payment Time", val: "2.1d", pct: 79, tone: "bl-gold" },
        { label: "Refund Ratio", val: "1.8%", pct: 18, tone: "bl-violet" },
        { label: "Revenue Growth", val: "+11.8%", pct: 72, tone: "bl-amber" },
        { label: "Profit Margin", val: "24.6%", pct: 62, tone: "bl-rose" },
    ];

    let ACTIVITY = [
        { time: "4:02 PM", cat: "Payments", icon: "icon-hand-coins", tone: "bl-emerald", text: "Payment received — $260 card settlement for INV-9209" },
        { time: "3:55 PM", cat: "Invoices", icon: "icon-file-plus", tone: "bl-gold", text: "INV-9219 created — OPD consultation for Dmitri Volkov" },
        { time: "3:48 PM", cat: "Insurance", icon: "icon-shield-check", tone: "bl-sky", text: "CLM-4462 approved — CarePlus pre-auth for $2,210" },
        { time: "3:30 PM", cat: "Reminders", icon: "icon-bell-ring", tone: "bl-rose", text: "Collection reminder sent to Bruno Silva — $890, 7 days overdue" },
        { time: "3:12 PM", cat: "Refunds", icon: "icon-rotate-ccw", tone: "bl-violet", text: "RFD-309 processed — $60 refunded to Johan Petersen" },
        { time: "2:58 PM", cat: "Invoices", icon: "icon-file-x", tone: "bl-amber", text: "INV-9201 cancelled — duplicate registration charge voided" },
        { time: "2:40 PM", cat: "Payments", icon: "icon-smartphone", tone: "bl-emerald", text: "UPI payment — $145 for INV-9206, receipt auto-emailed" },
        { time: "2:15 PM", cat: "Insurance", icon: "icon-file-text", tone: "bl-sky", text: "CLM-4471 filed with MediShield Plus — $6,140 inpatient stay" },
        { time: "1:50 PM", cat: "Reminders", icon: "icon-mail", tone: "bl-rose", text: "Final notice issued to George Mensah — $210, 12 days overdue" },
        { time: "1:20 PM", cat: "Refunds", icon: "icon-inbox", tone: "bl-violet", text: "RFD-312 requested — duplicate lab charge flagged by front desk" },
    ];

    /* ====================================================================
       Renderers
       ==================================================================== */

    function laneTone(l) {
        return l.tone.split(",").pop().trim();
    }

    function renderHero() {
        const pendingSum = INVOICES.filter((i) => i.lane === "pending").reduce((s, i) => s + i.amount, 0);
        const overdueSum = INVOICES.filter((i) => i.lane === "overdue").reduce((s, i) => s + i.amount, 0);
        $("fact-collect").textContent = money(pendingSum);
        $("fact-outstanding").textContent = money(overdueSum + COLLECTIONS.reduce((s, c) => s + c.amount, 0) - overdueSum);
        $("fact-refunds").textContent = REFUNDS.filter((r) => r.state !== "Completed").length + " open";

        const paidToday = REVENUE_BASE + INVOICES.filter((i) => i.lane === "paid").reduce((s, i) => s + i.amount, 0);
        $("ticker-val").textContent = money(paidToday);
        $("ticker-sub").textContent = "171 transactions · +9.2% vs yesterday";

        const strip = $("close-strip");
        const gap = INVOICES.filter((i) => i.lane === "overdue").length;
        if (gap) {
            strip.classList.add("is-alert");
            strip.innerHTML =
                '<span class="grid size-9 shrink-0 place-items-center rounded-xl bg-rose-500/25 text-rose-200"><i class="icon-clock-alert" aria-hidden="true"></i></span>' +
                '<div class="min-w-0 flex-1"><p class="text-xs font-extrabold uppercase tracking-wider text-rose-200">Day closing blocked — ' + gap + " overdue invoices</p>" +
                '<p class="mt-0.5 text-xs font-medium text-white/70">' + money(overdueSum) + " must be collected, written off or escalated before the 6 PM reconciliation.</p></div>" +
                '<button type="button" id="btn-review-overdue" class="bl-action shrink-0"><i class="icon-eye" aria-hidden="true"></i>Review overdue</button>';
            $("btn-review-overdue").addEventListener("click", () => toast("Overdue worklist opened — 2 invoices assigned to collections.", "info"));
        } else {
            strip.classList.remove("is-alert");
            strip.innerHTML =
                '<span class="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-400/20 text-emerald-200"><i class="icon-badge-check" aria-hidden="true"></i></span>' +
                '<div class="min-w-0 flex-1"><p class="text-xs font-extrabold uppercase tracking-wider text-emerald-200">Ready for day closing</p>' +
                '<p class="mt-0.5 text-xs font-medium text-white/70">No overdue invoices on the board — reconciliation can start at 6 PM.</p></div>';
        }
    }

    function renderPipeline() {
        $("pipeline").innerHTML = PIPELINE.map((s, i) => {
            const state = i < CURRENT_STAGE ? "is-done" : i === CURRENT_STAGE ? "is-now" : "";
            return (
                '<li class="bl-stage ' + state + '">' +
                '<span class="bl-stage-node"><i class="' + s.icon + '" aria-hidden="true"></i></span>' +
                '<p class="text-[11px] font-bold ' + (i === CURRENT_STAGE ? "text-gray-900" : "text-gray-500") + '">' + esc(s.name) + "</p>" +
                '<div class="bl-stage-plate"><div class="flex items-baseline justify-between">' +
                '<p class="text-sm font-extrabold text-gray-900 tabular-nums">' + s.tx + ' <span class="text-[9px] font-bold text-gray-400">tx</span></p>' +
                '<p class="text-[11px] font-extrabold text-gray-700 tabular-nums dark:text-gray-200">' + s.amount + "</p></div>" +
                '<div class="bl-stage-bar"><span style="width:0%" data-w="' + s.pct + '"></span></div>' +
                '<div class="mt-1.5 flex items-center justify-between text-[9px] font-semibold"><span class="text-gray-400 tabular-nums">' + s.pct + "% flow</span>" +
                (s.pending ? '<span class="font-extrabold text-amber-500 tabular-nums">' + s.pending + " pending</span>" : '<span class="text-gray-400">Clear</span>') +
                "</div></div></li>"
            );
        }).join("");
        requestAnimationFrame(() => document.querySelectorAll(".bl-stage-bar span").forEach((b) => (b.style.width = b.dataset.w + "%")));
        $("pipe-chip").textContent = PIPELINE[CURRENT_STAGE].name + " — " + PIPELINE[CURRENT_STAGE].pending + " pending";
    }

    function renderKanban() {
        $("kanban").innerHTML = LANES.map((l) => {
            const tone = laneTone(l);
            const items = INVOICES.filter((i) => i.lane === l.key);
            const sum = items.reduce((s, i) => s + i.amount, 0);
            return (
                '<div class="bl-lane ' + tone + '"><div class="mb-2 flex items-center justify-between px-1">' +
                '<p class="text-[11px] font-extrabold uppercase tracking-wider text-gray-500">' + l.label + '</p>' +
                '<span class="bl-chip ' + tone + '">' + items.length + " · " + money(sum) + "</span></div>" +
                (items.map((v) => (
                    '<div class="bl-inv ' + tone + (l.key === "overdue" ? " is-overdue" : "") + '" data-row-id="' + esc(v.no) + '">' +
                    '<div class="flex items-center gap-1.5">' +
                    '<span class="bl-inv-no">' + esc(v.no) + "</span>" +
                    (v.pri !== "Normal" ? '<span class="bl-chip ' + PRI_TONE[v.pri] + ' text-[9px]">' + v.pri + "</span>" : "") +
                    '<span class="ml-auto text-sm font-extrabold text-gray-900 tabular-nums">' + money(v.amount) + "</span></div>" +
                    '<p class="mt-1.5 truncate text-xs font-extrabold text-gray-900">' + esc(v.patient) + "</p>" +
                    '<p class="mt-0.5 text-[10px] font-semibold text-gray-500">' + esc(v.dept) + "</p>" +
                    '<div class="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[9px] font-bold text-gray-400">' +
                    '<span><i class="icon-credit-card text-[9px]" aria-hidden="true"></i> ' + esc(v.method) + "</span>" +
                    '<span class="tabular-nums"><i class="icon-calendar text-[9px]" aria-hidden="true"></i> ' + esc(v.due) + "</span>" +
                    (v.ins !== "—" ? '<span class="bl-chip bl-sky text-[8px]">' + esc(v.ins) + "</span>" : "") +
                    "</div>" +
                    (l.key !== "paid"
                        ? '<div class="mt-2 flex items-center gap-0.5 border-t border-dashed border-border-color pt-1.5 dark:border-white/10" role="group" aria-label="' + esc(v.no) + ' actions">' +
                          '<button type="button" class="bl-inv-btn" data-i="view" data-no="' + esc(v.no) + '" title="View" aria-label="View invoice"><i class="icon-eye" aria-hidden="true"></i></button>' +
                          (l.key === "draft" ? '<button type="button" class="bl-inv-btn" data-i="edit" data-no="' + esc(v.no) + '" title="Edit" aria-label="Edit invoice"><i class="icon-pen-line" aria-hidden="true"></i></button>' : "") +
                          '<button type="button" class="bl-inv-btn" data-i="collect" data-no="' + esc(v.no) + '" title="Collect payment" aria-label="Collect payment"><i class="icon-hand-coins" aria-hidden="true"></i></button>' +
                          '<button type="button" class="bl-inv-btn" data-i="print" data-no="' + esc(v.no) + '" title="Print invoice" aria-label="Print invoice"><i class="icon-printer" aria-hidden="true"></i></button>' +
                          (l.key === "pending" || l.key === "overdue" ? '<button type="button" class="bl-inv-btn" data-i="remind" data-no="' + esc(v.no) + '" title="Send reminder" aria-label="Send reminder"><i class="icon-bell-ring" aria-hidden="true"></i></button>' : "") +
                          "</div>"
                        : '<p class="mt-2 border-t border-dashed border-border-color pt-1.5 text-[9px] font-bold text-emerald-500 dark:border-white/10"><i class="icon-badge-check text-[9px]" aria-hidden="true"></i> Settled · receipt emailed</p>') +
                    "</div>"
                )).join("") || '<p class="py-4 text-center text-[10px] font-semibold text-gray-400">Empty</p>') +
                "</div>"
            );
        }).join("");
        const open = INVOICES.filter((i) => i.lane !== "paid").length;
        $("board-chip").textContent = open + " open · " + money(INVOICES.filter((i) => i.lane !== "paid").reduce((s, i) => s + i.amount, 0)) + " in play";
    }

    function sparkPath(pts, w, h) {
        const min = Math.min(...pts), max = Math.max(...pts), span = max - min || 1;
        return pts.map((p, i) => (i ? "L" : "M") + ((i / (pts.length - 1)) * w).toFixed(1) + " " + (h - ((p - min) / span) * (h - 6) - 3).toFixed(1)).join(" ");
    }

    // Revenue analytics tiles are already painted as static HTML (sparkline
    // paths are pre-computed, final-state values) — renderAnalytics() is
    // kept below (unused) as the source-of-truth template, same treatment
    // as renderPipeline() above; nothing calls it on load any more.
    function renderAnalytics() {
        $("analytics").innerHTML = ANALYTICS.map((a) => {
            const path = sparkPath(a.spark, 96, 28);
            const goodDir = a.good ? !a.up : a.up;
            return (
                '<div class="bl-rev ' + a.tone + '">' +
                '<p class="text-[10px] font-extrabold uppercase tracking-wide text-gray-400">' + a.label + "</p>" +
                '<div class="mt-1 flex items-baseline gap-2"><p class="text-xl font-extrabold text-gray-900 tabular-nums">' + a.val + "</p>" +
                '<span class="text-[10px] font-extrabold ' + (goodDir ? "text-emerald-500" : "text-rose-500") + '">' + a.delta + "</span></div>" +
                '<svg class="mt-2 w-full" height="28" viewBox="0 0 96 28" preserveAspectRatio="none" aria-hidden="true">' +
                '<path class="bl-spark-fill" d="' + path + ' L96 28 L0 28 Z"/><path class="bl-spark" d="' + path + '"/></svg></div>'
            );
        }).join("");
    }

    // Payment mix bars are already painted as static HTML; renderPayments()
    // is kept below (unused) as the source-of-truth template. Only its
    // side effects — the pay-chip text and the width-fill entrance
    // animation — still need to run on load, handled directly in init().
    function renderPayments() {
        $("payments").innerHTML = PAYMENTS.map((p) => (
            '<div class="bl-pay ' + p.tone + '"><span class="bl-pay-icon"><i class="' + p.icon + '" aria-hidden="true"></i></span>' +
            '<div class="min-w-0 flex-1"><div class="flex items-baseline justify-between gap-2">' +
            '<p class="text-[11px] font-bold text-gray-500">' + p.label + '</p>' +
            '<p class="text-xs font-extrabold text-gray-900 tabular-nums">' + money(p.amount) + "</p></div>" +
            '<div class="bl-pay-track"><span class="bl-pay-fill" style="width:0%" data-w="' + p.pct + '"></span></div>' +
            '<div class="mt-1 flex items-center justify-between text-[9px] font-semibold text-gray-400 tabular-nums"><span>' + p.tx + " transactions</span><span>" + p.pct + "% of mix</span></div></div></div>"
        )).join("");
        requestAnimationFrame(() => document.querySelectorAll(".bl-pay-fill").forEach((f) => (f.style.width = f.dataset.w + "%")));
        $("pay-chip").textContent = PAYMENTS.reduce((s, p) => s + p.tx, 0) + " tx today";
    }

    let claimFilter = "All";
    function claimCardHTML(c) {
        return (
            '<div class="bl-claim ' + c.tone + (c.expiring ? " is-expiring" : "") + '" data-row-id="' + esc(c.no) + '">' +
            '<div class="flex items-center gap-2"><span class="bl-inv-no ' + c.tone + '">' + esc(c.no) + '</span>' +
            '<span class="bl-chip ' + c.tone + ' text-[9px]">' + c.status + '</span>' +
            '<span class="ml-auto text-sm font-extrabold text-gray-900 tabular-nums">' + money(c.amount) + "</span></div>" +
            '<p class="mt-1.5 truncate text-xs font-extrabold text-gray-900">' + esc(c.patient) + "</p>" +
            '<p class="mt-0.5 text-[10px] font-semibold text-gray-500"><i class="icon-building-2 text-[10px]" aria-hidden="true"></i> ' + esc(c.provider) + "</p>" +
            (c.expiring ? '<button type="button" data-resub="' + CLAIMS.indexOf(c) + '" class="mt-2 w-full rounded-lg bg-rose-500/10 py-1 text-[10px] font-extrabold text-rose-600 transition-colors hover:bg-rose-500/20 dark:text-rose-300">Resubmit before Jul 20</button>' : "") +
            "</div>"
        );
    }
    // Rebuilds the filter-chip row: the set of distinct statuses can shrink
    // (e.g. a resubmit removes the last "Expiring" claim), so this stays a
    // genuine recompute rather than a static list.
    function renderClaimFilters() {
        const states = ["All"].concat([...new Set(CLAIMS.map((c) => c.status))]);
        $("claim-filters").innerHTML = states.map((s) =>
            '<button type="button" data-cf="' + s + '" aria-pressed="' + (claimFilter === s) + '" class="bl-chip bl-sky cursor-pointer' + (claimFilter === s ? "" : " opacity-50") + '">' + s + "</button>"
        ).join("");
    }
    // Claim cards themselves are already in the static HTML (data-row-id
    // per claim's number) — this only shows/hides them under the filter.
    function applyClaimFilter() {
        const visible = new Set(CLAIMS.filter((c) => claimFilter === "All" || c.status === claimFilter).map((c) => c.no));
        let shown = 0;
        $("claims").querySelectorAll("[data-row-id]").forEach((el) => {
            const isVisible = visible.has(el.dataset.rowId);
            el.classList.toggle("hidden", !isVisible);
            if (isVisible) shown++;
        });
        const empty = $("claims-empty");
        if (empty) empty.classList.toggle("hidden", shown !== 0);
    }

    // Amounts never change (only the "reminded" note does), so col-chip's
    // total is baked into the static HTML and never needs recomputing here.
    function collectionRowHTML(c, i) {
        return (
            '<div class="bl-col ' + c.tone + '" data-row-id="' + i + '"><span class="bl-col-avatar">' + esc(initials(c.patient)) + "</span>" +
            '<div class="min-w-0 flex-1"><div class="flex items-center gap-2"><p class="truncate text-xs font-extrabold text-gray-900">' + esc(c.patient) + '</p>' +
            '<span class="ml-auto text-sm font-extrabold text-gray-900 tabular-nums">' + money(c.amount) + "</span></div>" +
            '<p class="mt-0.5 text-[10px] font-semibold text-gray-500 tabular-nums">Due ' + esc(c.due) + " · " + esc(c.reminded) + "</p>" +
            '<p class="mt-0.5 text-[10px] font-semibold text-gray-400"><i class="icon-phone text-[10px]" aria-hidden="true"></i> ' + esc(c.phone) + "</p></div>" +
            '<div class="bl-col-days"><p class="text-xs font-extrabold tabular-nums" style="color:var(--bl-accent)">' + c.days + '</p><p class="text-[7px] font-bold uppercase text-gray-400">days</p></div>' +
            '<button type="button" data-remind="' + i + '" class="shrink-0 self-center rounded-lg bg-rose-500/10 p-1.5 text-rose-500 transition-colors hover:bg-rose-500/20" title="Send reminder" aria-label="Send reminder"><i class="icon-bell-ring text-xs" aria-hidden="true"></i></button>' +
            "</div>"
        );
    }

    // Department revenue bars are already painted as static HTML;
    // renderDepartments() is kept below (unused) as the source-of-truth
    // template. Only its width-fill entrance animation still needs to run
    // on load, handled directly in init().
    function renderDepartments() {
        $("departments").innerHTML = DEPARTMENTS.map((d) => (
            '<div class="bl-dept ' + d.tone + '"><div class="flex items-center gap-2.5">' +
            '<span class="bl-panel-icon !size-8 shrink-0 text-xs"><i class="' + d.icon + '" aria-hidden="true"></i></span>' +
            '<div class="min-w-0 flex-1"><div class="flex items-baseline justify-between gap-2">' +
            '<p class="text-xs font-extrabold text-gray-900">' + d.name + '</p>' +
            '<p class="text-xs font-extrabold text-gray-900 tabular-nums">' + money(d.rev) + "</p></div>" +
            '<div class="bl-dept-track"><span class="bl-dept-fill" style="width:0%" data-w="' + d.pct + '"></span></div>' +
            '<div class="mt-1 flex items-center justify-between text-[9px] font-semibold text-gray-400 tabular-nums">' +
            '<span>' + d.tx + ' collections</span><span class="font-extrabold ' + (d.up ? "text-emerald-500" : "text-rose-500") + '">' + d.growth + " vs yesterday</span></div></div></div></div>"
        )).join("");
        requestAnimationFrame(() => document.querySelectorAll(".bl-dept-fill").forEach((f) => (f.style.width = f.dataset.w + "%")));
    }

    function refundCardHTML(r) {
        const i = REFUNDS.indexOf(r);
        return (
            '<div class="bl-ref ' + r.tone + '" data-row-id="' + esc(r.id) + '"><span class="bl-ref-dot"><i class="' + r.icon + '" aria-hidden="true"></i></span>' +
            '<div class="bl-ref-card"><div class="flex flex-wrap items-center gap-x-2 gap-y-1">' +
            '<span class="bl-inv-no ' + r.tone + '">' + esc(r.id) + '</span><span class="bl-chip ' + r.tone + ' text-[9px]">' + r.state + "</span>" +
            '<span class="ml-auto text-xs font-extrabold text-gray-900 tabular-nums">' + money(r.amount) + "</span></div>" +
            '<p class="mt-1 text-xs font-bold text-gray-800 dark:text-gray-200">' + esc(r.patient) + "</p>" +
            '<p class="mt-0.5 text-[10px] font-semibold text-gray-500">' + esc(r.reason) + "</p>" +
            (r.state === "Pending Approval" ? '<button type="button" data-appr="' + i + '" class="mt-1.5 text-[10px] font-extrabold text-primary hover:underline">Approve refund</button>' : "") +
            "</div></div>"
        );
    }
    function updateRefChip() {
        $("ref-chip").textContent = REFUNDS.filter((r) => r.state !== "Completed").length + " in workflow";
    }

    // Performance dials are already painted as static HTML (dashoffset
    // values are pre-computed, final-state values — nothing to animate);
    // renderPerf() is kept below (unused) as the source-of-truth template.
    function renderPerf() {
        $("perf").innerHTML = PERF.map((g) => {
            const C = 2 * Math.PI * 26;
            return (
                '<div class="bl-dial ' + g.tone + ' flex-col gap-1.5 rounded-2xl border border-border-color p-3 dark:border-white/10">' +
                '<div class="relative"><svg viewBox="0 0 64 64"><circle class="bl-dial-track" cx="32" cy="32" r="26" fill="none" stroke="currentColor" stroke-width="5"/>' +
                '<circle class="bl-dial-fill" cx="32" cy="32" r="26" fill="none" stroke-width="5" stroke-linecap="round" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + (C * (1 - g.pct / 100)).toFixed(1) + '"/></svg>' +
                '<span class="bl-dial-label">' + esc(g.val) + "</span></div>" +
                '<p class="text-center text-[10px] font-extrabold text-gray-500">' + g.label + "</p></div>"
            );
        }).join("");
    }

    // ACTIVITY is never mutated, so its category set never changes — the
    // filter chips are baked into the static HTML and only need their
    // active/inactive state toggled; the rows only need show/hide.
    let actFilter = "All";
    function applyActivityFilter() {
        $("act-filters").querySelectorAll("[data-cat]").forEach((btn) => {
            const active = btn.dataset.cat === actFilter;
            btn.setAttribute("aria-pressed", String(active));
            btn.classList.toggle("opacity-50", !active);
        });
        $("activity").querySelectorAll("[data-row-id]").forEach((el) => {
            const a = ACTIVITY[Number(el.dataset.rowId)];
            el.classList.toggle("hidden", !(actFilter === "All" || a.cat === actFilter));
        });
    }

    /* ====================================================================
       Wiring
       ==================================================================== */

    function findInv(no) {
        return INVOICES.find((i) => i.no === no);
    }

    function init() {
        if ((location.pathname.split("/").pop() || "index.html") !== "billing-dashboard.html") return;
        // Pipeline, kanban, claims, collections, refunds and activity are
        // already painted as static HTML — only the hero (for its dynamic
        // close-strip button) and the stage-bar entrance animation still
        // need to run on load.
        renderHero();
        // Analytics, payments, departments and perf are also already
        // painted as static HTML — only the payments/departments bar
        // entrance animation and the pay-chip text (both previously side
        // effects of their now-unused renderX() calls) still need to run.
        requestAnimationFrame(() => document.querySelectorAll(".bl-stage-bar span[data-w], .bl-pay-fill, .bl-dept-fill").forEach((b) => (b.style.width = b.dataset.w + "%")));
        $("pay-chip").textContent = PAYMENTS.reduce((s, p) => s + p.tx, 0) + " tx today";

        // Kanban ops
        $("kanban").addEventListener("click", (e) => {
            const btn = e.target.closest("[data-i]");
            if (!btn) return;
            const v = findInv(btn.dataset.no);
            const op = btn.dataset.i;
            if (op === "view") return toast(v.no + " — " + money(v.amount) + " · " + v.dept + " · due " + v.due + ".", "info");
            if (op === "edit") return toast(v.no + " opened in the invoice editor.", "info");
            if (op === "print") return toast(v.no + " sent to the printer.", "success");
            if (op === "remind") return toast("Payment reminder sent to " + v.patient + " for " + money(v.amount) + ".", "success");
            if (op === "collect") {
                v.lane = "paid";
                v.due = "Paid 4:05 PM";
                renderKanban();
                renderHero();
                toast(money(v.amount) + " collected from " + v.patient + " — receipt printed.", "success");
            }
        });

        // Claims
        $("claim-filters").addEventListener("click", (e) => {
            const f = e.target.closest("[data-cf]");
            if (!f) return;
            claimFilter = f.dataset.cf;
            renderClaimFilters();
            applyClaimFilter();
        });
        $("claims").addEventListener("click", (e) => {
            const b = e.target.closest("[data-resub]");
            if (!b) return;
            const c = CLAIMS[parseInt(b.dataset.resub, 10)];
            c.status = "Under Review";
            c.tone = "bl-amber";
            c.expiring = false;
            const existing = $("claims").querySelector(`[data-row-id="${c.no}"]`);
            if (existing) existing.outerHTML = claimCardHTML(c);
            renderClaimFilters();
            applyClaimFilter();
            renderHero();
            toast(c.no + " resubmitted to " + c.provider + " — expiry window reset.", "success");
        });

        // Collections reminders
        $("collections").addEventListener("click", (e) => {
            const b = e.target.closest("[data-remind]");
            if (!b) return;
            const idx = parseInt(b.dataset.remind, 10);
            const c = COLLECTIONS[idx];
            c.reminded = "Reminder sent 4:05 PM";
            const existing = $("collections").querySelector(`[data-row-id="${idx}"]`);
            if (existing) existing.outerHTML = collectionRowHTML(c, idx);
            toast("SMS + email reminder sent to " + c.patient + " for " + money(c.amount) + ".", "success");
        });

        // Refund approvals
        $("refunds").addEventListener("click", (e) => {
            const b = e.target.closest("[data-appr]");
            if (!b) return;
            const r = REFUNDS[parseInt(b.dataset.appr, 10)];
            r.state = "Approved";
            r.tone = "bl-sky";
            r.icon = "icon-check";
            const existing = $("refunds").querySelector(`[data-row-id="${r.id}"]`);
            if (existing) existing.outerHTML = refundCardHTML(r);
            updateRefChip();
            renderHero();
            toast(r.id + " approved — " + money(r.amount) + " queued for payout.", "success");
        });

        // Activity filters
        $("act-filters").addEventListener("click", (e) => {
            const c = e.target.closest("[data-cat]");
            if (!c) return;
            actFilter = c.dataset.cat;
            applyActivityFilter();
        });

        // Hero quick actions
        $("btn-invoice").addEventListener("click", () => {
            const no = "INV-92" + (20 + INVOICES.filter((i) => i.no > "INV-9219").length);
            INVOICES.unshift({ no, patient: "Walk-in Patient", dept: "OPD", amount: 150, method: "Cash", due: "Jul 17", ins: "—", pri: "Normal", lane: "draft" });
            renderKanban();
            renderHero();
            toast(no + " drafted — add line items to issue.", "success");
        });
        $("btn-collect").addEventListener("click", () => {
            const v = INVOICES.find((i) => i.lane === "pending");
            if (!v) return toast("No pending invoices — queue is clear.", "info");
            v.lane = "paid";
            v.due = "Paid 4:05 PM";
            renderKanban();
            renderHero();
            toast(money(v.amount) + " collected from " + v.patient + " (" + v.no + ").", "success");
        });
        $("btn-closing").addEventListener("click", () => {
            const gap = INVOICES.filter((i) => i.lane === "overdue").length;
            toast(gap ? "Closing blocked — " + gap + " overdue invoices need action first." : "Daily closing started — cash drawer reconciliation in progress.", gap ? "error" : "success");
        });

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
            toast(item.dataset.act + (item.dataset.act === "Export Revenue" ? " — CSV of today's ledger downloading." : item.dataset.act === "Daily Closing" ? " checklist opened." : " opened."), "success");
        });
        document.addEventListener("click", (e) => {
            if (!e.target.closest(".bl-dock")) {
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
// billing.js
// ==========================================================================
// NOTE: the two lines below (the opening IIFE wrapper here, and its closing
// "})();" just after the original file's last line) are NOT present in the
// original billing.js — they were added only so this file's top-level
// declarations (pad, detailUrl, SBADGE, fmt, data, nextId, editingId,
// rowHTML, updateStats, render, openAdd, openEdit, saveRecord, deleteRecord)
// get their own scope. insurance.js (merged below) declares the exact same
// top-level names; concatenating both as plain top-level module code is a
// SyntaxError ("Identifier has already been declared"). This wrapper is a
// scoping fix only — no page-anchor guard was added, and nothing else about
// the file's logic was changed. See the merge report for why that matters.
(function () {
if ((location.pathname.split("/").pop() || "index.html") !== "billing.html") return;
const pad = (n) => "#INV-" + String(n).padStart(4, "0");
const detailUrl = (r) => "billing-detail.html?" + new URLSearchParams({ id: r.id, patient: r.patient, amount: r.amount, status: r.status }).toString();
const SBADGE = {
    Paid: "text-success bg-success/10",
    Pending: "text-warning bg-warning/10",
    Overdue: "text-danger bg-danger/10",
    Cancelled: "text-gray-900 bg-light/60",
};
const fmt = (n) =>
    "$" +
    parseFloat(n || 0)
        .toFixed(2)
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
let data = [
    {
        id: 1,
        patient: "James Morrison",
        date: "2024-12-01",
        amount: 3200,
        paid: 3200,
        method: "Insurance",
        status: "Paid",
        items: "Cardiac consultation, ECG, CBC test",
    },
    {
        id: 2,
        patient: "Sarah Adams",
        date: "2024-12-02",
        amount: 850,
        paid: 850,
        method: "Card",
        status: "Paid",
        items: "Neurology consultation, MRI",
    },
    {
        id: 3,
        patient: "Robert Clark",
        date: "2024-12-03",
        amount: 12500,
        paid: 0,
        method: "Insurance",
        status: "Pending",
        items: "ICU stay 3 days, surgery, medication",
    },
    {
        id: 4,
        patient: "Emily Johnson",
        date: "2024-11-29",
        amount: 2100,
        paid: 2100,
        method: "Cash",
        status: "Paid",
        items: "Maternity package, delivery",
    },
    {
        id: 5,
        patient: "David Torres",
        date: "2024-12-04",
        amount: 5800,
        paid: 2900,
        method: "Insurance",
        status: "Pending",
        items: "Orthopedic surgery, physiotherapy",
    },
    {
        id: 6,
        patient: "Linda Nguyen",
        date: "2024-12-05",
        amount: 1200,
        paid: 0,
        method: "Online",
        status: "Overdue",
        items: "Oncology consultation, blood panel",
    },
    {
        id: 7,
        patient: "Michael Harris",
        date: "2024-12-01",
        amount: 4400,
        paid: 4400,
        method: "Card",
        status: "Paid",
        items: "Geriatrics admission 2 days, ECG",
    },
    {
        id: 8,
        patient: "Anna Peterson",
        date: "2024-11-30",
        amount: 680,
        paid: 680,
        method: "Cash",
        status: "Paid",
        items: "Pediatric consultation, vaccines",
    },
];
let nextId = 9,
    editingId = null;
function rowHTML(r) {
    const balance = r.amount - r.paid;
    return `<tr><td class="text-primary font-mono text-sm"><a href="${detailUrl(r)}">${pad(r.id)}</a></td><td class="font-medium text-gray-900">${r.patient}</td><td class="text-gray-500 dark:text-gray-400 text-sm">${r.date}</td><td class="text-gray-500 dark:text-gray-400 text-sm max-w-xs truncate">${r.items}</td><td class="font-semibold text-gray-900">${fmt(r.amount)}</td><td class="${balance > 0 ? "text-amber-600 font-semibold" : "text-emerald-600"}">${fmt(r.paid)}</td><td><span class="inline-block px-2 py-1 text-xs font-semibold rounded-lg whitespace-nowrap text-gray-900 bg-light/60">${r.method}</span></td><td><span class="inline-block px-2 py-1 text-xs font-semibold rounded-lg whitespace-nowrap ${SBADGE[r.status] || "text-gray-900 bg-light/60"}">${r.status}</span></td><td><div class="flex gap-1"><button onclick="openEdit(${r.id})" class="p-1.5 size-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400" title="Edit"><i class="icon-edit text-base"></i></button><button onclick="deleteRecord(${r.id},'${r.patient}')" class="p-1.5 size-7 flex items-center justify-center rounded hover:bg-danger/20 dark:hover:bg-red-900/20 text-danger" title="Delete"><i class="icon-trash-2 text-base"></i></button></div></td></tr>`;
}
function updateStats() {
    const total = data.reduce((s, r) => s + r.amount, 0);
    const paid = data
        .filter((r) => r.status === "Paid")
        .reduce((s, r) => s + r.amount, 0);
    const pend = data
        .filter((r) => r.status === "Pending")
        .reduce((s, r) => s + r.amount, 0);
    const over = data
        .filter((r) => r.status === "Overdue")
        .reduce((s, r) => s + r.amount, 0);
    document.getElementById("stat-total").textContent = fmt(total);
    document.getElementById("stat-paid").textContent = fmt(paid);
    document.getElementById("stat-pend").textContent = fmt(pend);
    document.getElementById("stat-over").textContent = fmt(over);
}
function render(q = "", method = "", status = "") {
    const rows = data.filter((r) => {
        const m = q
            ? r.patient.toLowerCase().includes(q.toLowerCase()) ||
              pad(r.id).includes(q)
            : true;
        return (
            m &&
            (method ? r.method === method : true) &&
            (status ? r.status === status : true)
        );
    });
    document.getElementById("count").textContent =
        `${rows.length} of ${data.length}`;
    // Rows are already in the static HTML (data-row-id per invoice id) —
    // this only shows/hides them under the current search/filter state.
    const visible = new Set(rows.map((r) => r.id));
    document
        .querySelectorAll("#tbody [data-row-id]")
        .forEach((tr) =>
            tr.classList.toggle("hidden", !visible.has(Number(tr.dataset.rowId))),
        );
    const emptyRow = document.getElementById("tbody-empty");
    if (emptyRow) emptyRow.classList.toggle("hidden", rows.length !== 0);
    updateStats();
}
function openAdd() {
    editingId = null;
    document.getElementById("m-title").textContent = "New Invoice";
    document.getElementById("btn-save").textContent = "Create Invoice";
    document.getElementById("m-form").reset();
    document.getElementById("f-date").value = new Date()
        .toISOString()
        .split("T")[0];
    MC.openModal("form-modal");
}
function openEdit(id) {
    const r = data.find((x) => x.id === id);
    editingId = id;
    document.getElementById("m-title").textContent = "Edit Invoice";
    document.getElementById("btn-save").textContent = "Update";
    document.getElementById("f-patient").value = r.patient;
    document.getElementById("f-date").value = r.date;
    document.getElementById("f-amount").value = r.amount;
    document.getElementById("f-paid").value = r.paid;
    document.getElementById("f-method").value = r.method;
    document.getElementById("f-status").value = r.status;
    document.getElementById("f-items").value = r.items;
    MC.openModal("form-modal");
}
function saveRecord() {
    const patient = document.getElementById("f-patient").value.trim();
    const amount = parseFloat(document.getElementById("f-amount").value);
    if (!patient) {
        MC.toast("Patient name required", "error");
        return;
    }
    if (!amount || amount <= 0) {
        MC.toast("Valid amount required", "error");
        return;
    }
    const rec = {
        patient,
        date: document.getElementById("f-date").value,
        amount,
        paid: parseFloat(document.getElementById("f-paid").value) || 0,
        method: document.getElementById("f-method").value,
        status: document.getElementById("f-status").value,
        items: document.getElementById("f-items").value.trim(),
    };
    if (editingId) {
        const idx = data.findIndex((x) => x.id === editingId);
        data[idx] = { ...data[idx], ...rec };
        const existing = document.querySelector(
            `#tbody [data-row-id="${editingId}"]`,
        );
        if (existing) existing.outerHTML = rowHTML(data[idx]);
        MC.toast("Invoice updated", "success");
    } else {
        const newRec = { id: nextId++, ...rec };
        data.push(newRec);
        const emptyRow = document.getElementById("tbody-empty");
        if (emptyRow) emptyRow.insertAdjacentHTML("beforebegin", rowHTML(newRec));
        else document.getElementById("tbody").insertAdjacentHTML("beforeend", rowHTML(newRec));
        MC.toast("Invoice created", "success");
    }
    MC.closeModal("form-modal");
    render(
        document.getElementById("search").value,
        document.getElementById("filter-method").value,
        document.getElementById("filter-status").value,
    );
}
function deleteRecord(id, name) {
    MC.confirmDelete(name, () => {
        data = data.filter((x) => x.id !== id);
        const existing = document.querySelector(`#tbody [data-row-id="${id}"]`);
        if (existing) existing.remove();
        render(
            document.getElementById("search").value,
            document.getElementById("filter-method").value,
            document.getElementById("filter-status").value,
        );
        MC.toast("Invoice voided", "success");
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
                document.getElementById("filter-method").value,
                document.getElementById("filter-status").value,
            ),
        );
    document
        .getElementById("filter-method")
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
                document.getElementById("filter-method").value,
                e.target.value,
            ),
        );
    MC.initDeleteModal();
    MC.closeOnBackdrop("form-modal");
    MC.closeOnBackdrop("del-modal");
    // Rows are already visible in the static HTML — only the stat cards
    // (already baked in too, but kept in sync here) need a paint.
    updateStats();
});
})();

// ==========================================================================
// estimate-detail.js
// ==========================================================================
document.addEventListener("DOMContentLoaded", function () {
    if ((location.pathname.split("/").pop() || "index.html") !== "estimate-detail.html") return;
    var $ = function (id) {
        return document.getElementById(id);
    };
    var params = new URLSearchParams(window.location.search);
    var pick = function (key, fallback) {
        var v = params.get(key);
        return v && v.length ? v : fallback;
    };

    var r = {
        id: pick("id", "1"),
        patient: pick("patient", "Priya Nair"),
        procedure: pick("procedure", "Elective knee arthroscopy"),
        amount: pick("amount", "7500"),
        date: pick("date", "2024-11-25"),
        status: pick("status", "Accepted"),
    };

    function fmt(n) {
        var num = Number(n) || 0;
        return (
            "$" +
            num
                .toFixed(2)
                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        );
    }

    var BADGE = {
        Draft: "text-gray-900 bg-light/60",
        Sent: "text-primary bg-primary/10",
        Accepted: "text-success bg-success/10",
        Expired: "text-danger bg-danger/10",
    };

    var estimateId = "#EST-" + (30000 + Number(r.id));
    var amountFmt = fmt(r.amount);

    $("esd-estimate-title").textContent = "Estimate " + estimateId;
    $("esd-status-badge").textContent = r.status;
    $("esd-estimate-id").textContent = estimateId;
    $("esd-patient-name").textContent = r.patient;
    $("esd-date").textContent = r.date;

    var procEl = $("esd-procedure");
    procEl.textContent = r.procedure;
    procEl.title = r.procedure;
    $("esd-amount").textContent = amountFmt;
    $("esd-stat-date").textContent = r.date;
    $("esd-stat-status").textContent = r.status;

    $("esd-side-patient").textContent = r.patient;
    $("esd-side-estimateid").textContent = estimateId;
    $("esd-side-amount").textContent = amountFmt;

    $("esd-kv-patient").textContent = r.patient;
    $("esd-kv-estimateid").textContent = estimateId;
    $("esd-kv-date").textContent = r.date;

    document.title = "Estimate " + estimateId + " — Dreams HMS";

    var badgeCls = BADGE[r.status] || "text-gray-900 bg-light/60";
    var toneMap = {
        Draft: "#94a3b8",
        Sent: "var(--color-primary)",
        Accepted: "#10b981",
        Expired: "#ef4444",
    };
    var dot = $("esd-status-badge").previousElementSibling;
    if (dot) dot.style.background = toneMap[r.status] || "#94a3b8";

    // ---- Summary card ----
    $("esd-summary").innerHTML =
        '<div class="esd-kv"><span class="k"><i class="icon-user text-[13px]"></i>Patient</span><span class="v">' +
        r.patient +
        '</span></div>' +
        '<div class="esd-kv"><span class="k"><i class="icon-hash text-[13px]"></i>Estimate #</span><span class="v">' +
        estimateId +
        '</span></div>' +
        '<div class="esd-kv"><span class="k"><i class="icon-stethoscope text-[13px]"></i>Procedure</span><span class="v">' +
        r.procedure +
        '</span></div>' +
        '<div class="esd-kv"><span class="k"><i class="icon-dollar-sign text-[13px]"></i>Amount</span><span class="v">' +
        amountFmt +
        '</span></div>' +
        '<div class="esd-kv"><span class="k"><i class="icon-calendar text-[13px]"></i>Date</span><span class="v">' +
        r.date +
        '</span></div>' +
        '<div class="esd-kv"><span class="k"><i class="icon-circle-check text-[13px]"></i>Status</span><span class="v"><span class="inline-block px-2 py-1 text-xs font-semibold rounded-lg whitespace-nowrap ' +
        badgeCls +
        '">' +
        r.status +
        "</span></span></div>";

    // ---- Actions ----
    var download = function () {
        if (window.MC && MC.toast) MC.toast("Preparing estimate download…", "info");
        else alert("Preparing estimate download…");
    };
    $("esd-download-btn").onclick = download;
});

// ==========================================================================
// insurance-claim-detail.js
// ==========================================================================
document.addEventListener('DOMContentLoaded', function () {
  if (document.body.dataset.page !== 'insurance-claim-detail') return;

  var $ = function (id) { return document.getElementById(id); };
  var params = new URLSearchParams(window.location.search);
  var pick = function (key, fallback) { var v = params.get(key); return v && v.length ? v : fallback; };
  var fmt = function (n) {
    return '$' + parseFloat(n || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  var r = {
    id: pick('id', '1'),
    patient: pick('patient', 'James Morrison'),
    insurer: pick('insurer', 'BlueCross Health'),
    type: pick('type', 'Inpatient'),
    amount: pick('amount', '3200'),
    approved: pick('approved', '3200'),
    date: pick('date', '2024-12-02'),
    tat: pick('tat', '4'),
    status: pick('status', 'Paid'),
  };

  var claimId = '#CLM-' + String(r.id).padStart(5, '0');

  var BADGE = {
    Submitted: 'text-warning bg-warning/10',
    'Under Review': 'text-primary bg-primary/10',
    Approved: 'text-success bg-success/10',
    Rejected: 'text-danger bg-danger/10',
    Paid: 'text-purple bg-purple/10',
  };
  var STATUS_TONE = {
    Submitted: '#F59E0B',
    'Under Review': '#0371c6',
    Approved: '#009966',
    Rejected: '#e7000b',
    Paid: '#7C3AED',
  };

  $('icd-patient-name').textContent = r.patient;
  $('icd-status-badge').textContent = r.status;
  $('icd-claim-id').textContent = claimId;
  $('icd-insurer-name').textContent = r.insurer;
  $('icd-claim-type').textContent = r.type;
  $('icd-date').textContent = r.date;
  $('icd-type').textContent = r.type;
  $('icd-amount').textContent = fmt(r.amount);
  $('icd-approved').textContent = Number(r.approved) > 0 ? fmt(r.approved) : '—';
  $('icd-tat').textContent = r.tat + ' days';
  $('icd-side-insurer').textContent = r.insurer;
  $('icd-side-type').textContent = r.type + ' Coverage';
  $('icd-kv-insurer').textContent = r.insurer;
  $('icd-kv-claimid').textContent = claimId;
  $('icd-kv-date').textContent = r.date;
  document.title = r.patient + ' — ' + claimId + ' — Dreams HMS';

  var badgeCls = BADGE[r.status] || 'text-gray-900 bg-light/60';
  var badgeEl = $('icd-status-badge');
  badgeCls.split(' ').forEach(function (c) { badgeEl.classList.add(c); });

  var tone = STATUS_TONE[r.status] || '#94a3b8';
  var dot = $('icd-status-badge').previousElementSibling;
  if (dot) dot.style.background = tone;

  // ---- Actions ----
  function download() { MC.toast('Preparing claim PDF download…', 'info'); }
  $('icd-download-btn').onclick = download;
  $('icd-side-download').onclick = download;
});

// ==========================================================================
// insurance.js
// ==========================================================================
// NOTE: wrapped in an IIFE (not present in the original file) for the same
// reason explained above billing.js — this file declares the exact same
// top-level names as billing.js, which would otherwise collide. Scoping fix
// only; no page-anchor guard was added. See the merge report.
(function () {
if ((location.pathname.split("/").pop() || "index.html") !== "insurance.html") return;
const pad = (n) => "#CLM-" + String(n).padStart(5, "0");
const detailUrl = (r) => "insurance-detail.html?" + new URLSearchParams({ id: r.id, patient: r.patient, insurer: r.insurer, status: r.status }).toString();
const SBADGE = {
    Submitted: "text-warning bg-warning/10",
    "Under Review": "text-primary bg-primary/10",
    Approved: "text-success bg-success/10",
    Rejected: "text-danger bg-danger/10",
    Paid: "text-purple bg-purple/10",
};
const fmt = (n) =>
    "$" +
    parseFloat(n || 0)
        .toFixed(2)
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
let data = [
    {
        id: 1,
        patient: "James Morrison",
        insurer: "BlueCross Health",
        policy: "BCH-2024-5501",
        amount: 3200,
        approved: 3200,
        date: "2024-12-02",
        status: "Paid",
        diag: "I21.0",
        notes: "",
    },
    {
        id: 2,
        patient: "Robert Clark",
        insurer: "United Health",
        policy: "UH-2024-8892",
        amount: 12500,
        approved: 11000,
        date: "2024-12-04",
        status: "Approved",
        diag: "I46.0",
        notes: "",
    },
    {
        id: 3,
        patient: "Emily Johnson",
        insurer: "Aetna Insurance",
        policy: "AE-2024-3312",
        amount: 2100,
        approved: 2100,
        date: "2024-11-30",
        status: "Paid",
        diag: "Z37.0",
        notes: "",
    },
    {
        id: 4,
        patient: "David Torres",
        insurer: "Cigna Health",
        policy: "CI-2024-7745",
        amount: 5800,
        approved: 0,
        date: "2024-12-05",
        status: "Under Review",
        diag: "M17.11",
        notes: "Pre-auth pending",
    },
    {
        id: 5,
        patient: "Linda Nguyen",
        insurer: "BlueCross Health",
        policy: "BCH-2024-9901",
        amount: 8400,
        approved: 0,
        date: "2024-12-06",
        status: "Submitted",
        diag: "C50.911",
        notes: "",
    },
    {
        id: 6,
        patient: "Michael Harris",
        insurer: "Medicare",
        policy: "MCR-2024-1125",
        amount: 4400,
        approved: 4400,
        date: "2024-12-02",
        status: "Paid",
        diag: "I50.9",
        notes: "",
    },
    {
        id: 7,
        patient: "Sarah Adams",
        insurer: "Aetna Insurance",
        policy: "AE-2024-2200",
        amount: 850,
        approved: 0,
        date: "2024-12-03",
        status: "Rejected",
        diag: "G43.909",
        notes: "Non-covered procedure",
    },
    {
        id: 8,
        patient: "Anna Peterson",
        insurer: "United Health",
        policy: "UH-2024-4451",
        amount: 680,
        approved: 680,
        date: "2024-12-01",
        status: "Paid",
        diag: "J11.1",
        notes: "",
    },
];
let nextId = 9,
    editingId = null;
function rowHTML(r) {
    return `<tr><td class="text-primary font-mono text-sm"><a href="${detailUrl(r)}">${pad(r.id)}</a></td><td class="font-medium text-gray-900">${r.patient}</td><td class="text-gray-600 dark:text-gray-300">${r.insurer}</td><td class="text-gray-500 dark:text-gray-400 font-mono text-sm">${r.policy}</td><td class="font-semibold text-gray-900">${fmt(r.amount)}</td><td class="${r.approved > 0 ? "text-emerald-600" : "text-gray-400"}">${r.approved > 0 ? fmt(r.approved) : "—"}</td><td class="text-gray-500 dark:text-gray-400 text-sm">${r.date}</td><td><span class="inline-block px-2 py-1 text-xs font-semibold rounded-lg whitespace-nowrap ${SBADGE[r.status] || "text-gray-900 bg-light/60"}">${r.status}</span></td><td><div class="flex gap-1"><button onclick="openEdit(${r.id})" class="p-1.5 size-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400" title="Edit"><i class="icon-edit text-base"></i></button><button onclick="deleteRecord(${r.id},'${r.patient}')" class="p-1.5 size-7 flex items-center justify-center rounded hover:bg-danger/20 dark:hover:bg-red-900/20 text-danger" title="Delete"><i class="icon-trash-2 text-base"></i></button></div></td></tr>`;
}
function updateStats() {
    const total = data.reduce((s, r) => s + r.amount, 0);
    const appr = data
        .filter((r) => ["Approved", "Paid"].includes(r.status))
        .reduce((s, r) => s + r.approved, 0);
    document.getElementById("stat-total").textContent = fmt(total);
    document.getElementById("stat-appr").textContent = fmt(appr);
    document.getElementById("stat-pend").textContent = data.filter((r) =>
        ["Submitted", "Under Review"].includes(r.status),
    ).length;
    document.getElementById("stat-rej").textContent = data.filter(
        (r) => r.status === "Rejected",
    ).length;
}
function render(q = "", status = "") {
    const rows = data.filter((r) => {
        const m = q
            ? r.patient.toLowerCase().includes(q.toLowerCase()) ||
              r.insurer.toLowerCase().includes(q.toLowerCase()) ||
              r.policy.toLowerCase().includes(q.toLowerCase())
            : true;
        return m && (status ? r.status === status : true);
    });
    document.getElementById("count").textContent =
        `${rows.length} of ${data.length}`;
    // Rows are already in the static HTML (data-row-id per claim id) —
    // this only shows/hides them under the current search/filter state.
    const visible = new Set(rows.map((r) => r.id));
    document
        .querySelectorAll("#tbody [data-row-id]")
        .forEach((tr) =>
            tr.classList.toggle("hidden", !visible.has(Number(tr.dataset.rowId))),
        );
    const emptyRow = document.getElementById("tbody-empty");
    if (emptyRow) emptyRow.classList.toggle("hidden", rows.length !== 0);
    updateStats();
}
function openAdd() {
    editingId = null;
    document.getElementById("m-title").textContent = "New Insurance Claim";
    document.getElementById("btn-save").textContent = "Submit Claim";
    document.getElementById("m-form").reset();
    document.getElementById("f-date").value = new Date()
        .toISOString()
        .split("T")[0];
    MC.openModal("form-modal");
}
function openEdit(id) {
    const r = data.find((x) => x.id === id);
    editingId = id;
    document.getElementById("m-title").textContent = "Edit Claim";
    document.getElementById("btn-save").textContent = "Update";
    document.getElementById("f-patient").value = r.patient;
    document.getElementById("f-insurer").value = r.insurer;
    document.getElementById("f-policy").value = r.policy;
    document.getElementById("f-amount").value = r.amount;
    document.getElementById("f-approved").value = r.approved;
    document.getElementById("f-date").value = r.date;
    document.getElementById("f-status").value = r.status;
    document.getElementById("f-diag").value = r.diag;
    document.getElementById("f-notes").value = r.notes;
    MC.openModal("form-modal");
}
function saveRecord() {
    const patient = document.getElementById("f-patient").value.trim();
    const insurer = document.getElementById("f-insurer").value.trim();
    if (!patient) {
        MC.toast("Patient name required", "error");
        return;
    }
    if (!insurer) {
        MC.toast("Insurer required", "error");
        return;
    }
    const rec = {
        patient,
        insurer,
        policy: document.getElementById("f-policy").value.trim(),
        amount: parseFloat(document.getElementById("f-amount").value) || 0,
        approved: parseFloat(document.getElementById("f-approved").value) || 0,
        date: document.getElementById("f-date").value,
        status: document.getElementById("f-status").value,
        diag: document.getElementById("f-diag").value.trim(),
        notes: document.getElementById("f-notes").value.trim(),
    };
    if (editingId) {
        const idx = data.findIndex((x) => x.id === editingId);
        data[idx] = { ...data[idx], ...rec };
        const existing = document.querySelector(
            `#tbody [data-row-id="${editingId}"]`,
        );
        if (existing) existing.outerHTML = rowHTML(data[idx]);
        MC.toast("Claim updated", "success");
    } else {
        const newRec = { id: nextId++, ...rec };
        data.push(newRec);
        const emptyRow = document.getElementById("tbody-empty");
        if (emptyRow) emptyRow.insertAdjacentHTML("beforebegin", rowHTML(newRec));
        else document.getElementById("tbody").insertAdjacentHTML("beforeend", rowHTML(newRec));
        MC.toast("Claim submitted", "success");
    }
    MC.closeModal("form-modal");
    render(
        document.getElementById("search").value,
        document.getElementById("filter-status").value,
    );
}
function deleteRecord(id, name) {
    MC.confirmDelete(name, () => {
        data = data.filter((x) => x.id !== id);
        const existing = document.querySelector(`#tbody [data-row-id="${id}"]`);
        if (existing) existing.remove();
        render(
            document.getElementById("search").value,
            document.getElementById("filter-status").value,
        );
        MC.toast("Claim deleted", "success");
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
                document.getElementById("filter-status").value,
            ),
        );
    document
        .getElementById("filter-status")
        .addEventListener("change", (e) =>
            render(document.getElementById("search").value, e.target.value),
        );
    MC.initDeleteModal();
    MC.closeOnBackdrop("form-modal");
    MC.closeOnBackdrop("del-modal");
    // Rows are already visible in the static HTML — only the stat cards
    // (already baked in too, but kept in sync here) need a paint.
    updateStats();
});
})();

// ==========================================================================
// invoice-detail.js
// ==========================================================================
/**
 * Dreams HMS — Invoice Detail Page Logic
 * Handles URL parameter parsing, PDF download triggers, email receipts, and official receipt printing.
 */

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const pick = (key, fallback) => {
        const v = urlParams.get(key);
        return v && v.length ? v : fallback;
    };

    const r = {
        id: pick("id", "2026-9041"),
        patient: pick("patient", "Anna Peterson"),
        amount: pick("amount", "1200"),
        issuedate: pick("issuedate", "15 Nov 2026"),
        duedate: pick("duedate", "30 Nov 2026"),
        status: pick("status", "Paid & Settled"),
    };

    function fmt(n) {
        const num = Number(n) || 0;
        return "$" + num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    const rawId = r.id.startsWith('#') || r.id.startsWith('INV') ? r.id : '#INV-' + r.id;
    const amountFmt = r.amount.startsWith('$') ? r.amount : fmt(r.amount);

    // Update Header DOM elements safely
    const titleEl = document.getElementById("ivd-invoice-title");
    const idEl = document.getElementById("ivd-invoice-id");
    const patientEl = document.getElementById("ivd-patient-name");
    const issueEl = document.getElementById("ivd-issue-date");
    const dueEl = document.getElementById("ivd-due-date");
    const statusBadgeEl = document.getElementById("ivd-status-badge");
    const amountEl = document.getElementById("ivd-amount");

    if (idEl) idEl.textContent = rawId;
    if (patientEl) patientEl.textContent = r.patient;
    if (issueEl) issueEl.textContent = r.issuedate;
    if (dueEl) dueEl.textContent = r.duedate;
    if (statusBadgeEl) statusBadgeEl.textContent = r.status;
    if (amountEl) amountEl.textContent = amountFmt;

    // Sidebar & KV elements
    const sidePatientEl = document.getElementById("ivd-side-patient");
    const sideInvoiceIdEl = document.getElementById("ivd-side-invoiceid");
    const kvPatientEl = document.getElementById("ivd-kv-patient");
    const kvInvoiceIdEl = document.getElementById("ivd-kv-invoiceid");
    const kvAmountEl = document.getElementById("ivd-kv-amount");
    const kvIssueEl = document.getElementById("ivd-kv-issue");

    if (sidePatientEl) sidePatientEl.textContent = r.patient;
    if (sideInvoiceIdEl) sideInvoiceIdEl.textContent = rawId;
    if (kvPatientEl) kvPatientEl.textContent = r.patient;
    if (kvInvoiceIdEl) kvInvoiceIdEl.textContent = rawId;
    if (kvAmountEl) kvAmountEl.textContent = amountFmt;
    if (kvIssueEl) kvIssueEl.textContent = r.issuedate;

    // 1. Print Official Receipt Trigger
    document.querySelectorAll('[data-action="print"]').forEach(btn => {
        btn.addEventListener('click', () => {
            window.print();
        });
    });

    // 2. Download PDF Trigger
    const triggerPDF = () => {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: 'Generating PDF Statement',
                text: `Compiling invoice ${rawId} for ${r.patient}...`,
                icon: 'info',
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                Swal.fire({
                    title: 'PDF Ready!',
                    text: `Invoice_${rawId.replace('#','')}.pdf downloaded.`,
                    icon: 'success',
                    confirmButtonColor: '#059669'
                });
            });
        } else {
            alert(`Downloading Invoice statement for ${rawId}...`);
        }
    };

    const downloadBtn = document.getElementById('ivd-download-btn');
    const downloadPdfSide = document.getElementById('ivd-download-pdf-side');
    if (downloadBtn) downloadBtn.addEventListener('click', triggerPDF);
    if (downloadPdfSide) downloadPdfSide.addEventListener('click', triggerPDF);

    // 3. Email Receipt Trigger
    const triggerEmail = () => {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: 'Email Receipt',
                text: `Send official payment receipt for ${rawId} to ${r.patient}?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#059669',
                cancelButtonColor: '#64748b',
                confirmButtonText: 'Yes, Send Email'
            }).then((result) => {
                if (result.isConfirmed) {
                    Swal.fire({
                        title: 'Email Sent!',
                        text: `Receipt sent to ${r.patient}.`,
                        icon: 'success',
                        confirmButtonColor: '#059669'
                    });
                }
            });
        } else {
            alert(`Emailing receipt for ${rawId}...`);
        }
    };

    const emailBtn = document.getElementById('ivd-email-btn');
    const emailReceiptSide = document.getElementById('ivd-email-receipt-side');
    if (emailBtn) emailBtn.addEventListener('click', triggerEmail);
    if (emailReceiptSide) emailReceiptSide.addEventListener('click', triggerEmail);
});

// ==========================================================================
// payment-detail.js
// ==========================================================================
document.addEventListener("DOMContentLoaded", function () {
    if ((location.pathname.split("/").pop() || "index.html") !== "payment-detail.html") return;
    var $ = function (id) {
        return document.getElementById(id);
    };
    var params = new URLSearchParams(window.location.search);
    var pick = function (key, fallback) {
        var v = params.get(key);
        return v && v.length ? v : fallback;
    };

    var r = {
        id: pick("id", "1"),
        patient: pick("patient", "Anna Peterson"),
        invoiceref: pick("invoiceref", "INV-10001"),
        amount: pick("amount", "1200"),
        method: pick("method", "Card"),
        date: pick("date", "2024-11-29"),
        receivedby: pick("receivedby", "Nina Patel"),
    };

    function fmt(n) {
        var num = Number(n) || 0;
        return (
            "$" +
            num
                .toFixed(2)
                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        );
    }

    var paymentId = "#PMT-" + (20000 + Number(r.id));
    var amountFmt = fmt(r.amount);

    $("pmd-payment-title").textContent = "Payment " + paymentId;
    $("pmd-payment-id").textContent = paymentId;
    $("pmd-patient-name").textContent = r.patient;
    $("pmd-invoice-ref").textContent = r.invoiceref;
    $("pmd-date").textContent = r.date;

    $("pmd-amount").textContent = amountFmt;
    $("pmd-method").textContent = r.method;
    $("pmd-stat-invoiceref").textContent = r.invoiceref;
    $("pmd-receivedby").textContent = r.receivedby;

    $("pmd-side-patient").textContent = r.patient;
    $("pmd-side-invoiceref").textContent = r.invoiceref;
    $("pmd-side-date").textContent = r.date;

    $("pmd-kv-patient").textContent = r.patient;
    $("pmd-kv-invoiceref").textContent = r.invoiceref;
    $("pmd-kv-date").textContent = r.date;

    document.title = "Payment " + paymentId + " — Dreams HMS";

    // ---- Receipt / summary card ----
    $("pmd-summary").innerHTML =
        '<div class="pmd-kv"><span class="k"><i class="icon-user text-[13px]"></i>Patient</span><span class="v">' +
        r.patient +
        '</span></div>' +
        '<div class="pmd-kv"><span class="k"><i class="icon-hash text-[13px]"></i>Payment ID</span><span class="v">' +
        paymentId +
        '</span></div>' +
        '<div class="pmd-kv"><span class="k"><i class="icon-file-text text-[13px]"></i>Invoice Reference</span><span class="v text-primary">' +
        r.invoiceref +
        '</span></div>' +
        '<div class="pmd-kv"><span class="k"><i class="icon-dollar-sign text-[13px]"></i>Amount</span><span class="v">' +
        amountFmt +
        '</span></div>' +
        '<div class="pmd-kv"><span class="k"><i class="icon-banknote text-[13px]"></i>Method</span><span class="v">' +
        r.method +
        '</span></div>' +
        '<div class="pmd-kv"><span class="k"><i class="icon-calendar text-[13px]"></i>Date</span><span class="v">' +
        r.date +
        '</span></div>' +
        '<div class="pmd-kv"><span class="k"><i class="icon-user text-[13px]"></i>Received By</span><span class="v">' +
        r.receivedby +
        "</span></div>";

    // ---- Actions ----
    var download = function () {
        if (window.MC && MC.toast) MC.toast("Preparing receipt download…", "info");
        else alert("Preparing receipt download…");
    };
    $("pmd-download-btn").onclick = download;
    $("pmd-download-btn-2").onclick = download;
});

// ==========================================================================
// pre-authorization-detail.js
// ==========================================================================
document.addEventListener('DOMContentLoaded', function () {
  if (document.body.dataset.page !== 'pre-authorization-detail') return;

  var $ = function (id) { return document.getElementById(id); };
  var params = new URLSearchParams(window.location.search);
  var pick = function (key, fallback) { var v = params.get(key); return v && v.length ? v : fallback; };
  var fmt = function (n) {
    return '$' + parseFloat(n || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  var r = {
    id: pick('id', '1'),
    patient: pick('patient', 'Priya Nair'),
    insurer: pick('insurer', 'BlueCross Health'),
    procedure: pick('procedure', 'Elective knee arthroscopy'),
    urgency: pick('urgency', 'Routine'),
    cost: pick('cost', '7500'),
    date: pick('date', '2024-12-01'),
    decision: pick('decision', '2024-12-06'),
    status: pick('status', 'Approved'),
  };

  var paId = '#PA-' + String(r.id).padStart(5, '0');

  var BADGE = {
    Pending: 'text-warning bg-warning/10',
    Approved: 'text-success bg-success/10',
    Denied: 'text-danger bg-danger/10',
    'More Info Needed': 'text-primary bg-primary/10',
  };
  var STATUS_TONE = {
    Pending: '#F59E0B',
    Approved: '#009966',
    Denied: '#e7000b',
    'More Info Needed': '#0371c6',
  };

  $('pad-procedure-name').textContent = r.procedure;
  $('pad-status-badge').textContent = r.status;
  $('pad-pa-id').textContent = paId;
  $('pad-patient-name').textContent = r.patient;
  $('pad-insurer-name').textContent = r.insurer;
  $('pad-date').textContent = r.date;
  $('pad-insurer').textContent = r.insurer;
  $('pad-cost').textContent = fmt(r.cost);
  $('pad-urgency').textContent = r.urgency;
  $('pad-req-date').textContent = r.date;
  $('pad-side-patient').textContent = r.patient;
  $('pad-side-urgency').textContent = 'Urgency: ' + r.urgency;
  $('pad-kv-patient').textContent = r.patient;
  $('pad-kv-procedure').textContent = r.procedure;
  $('pad-kv-reqdate').textContent = r.date;
  $('pad-kv-decdate').textContent = r.decision;
  document.title = r.procedure + ' — ' + paId + ' — Dreams HMS';

  var badgeCls = BADGE[r.status] || 'text-gray-900 bg-light/60';
  var badgeEl = $('pad-status-badge');
  badgeCls.split(' ').forEach(function (c) { badgeEl.classList.add(c); });

  var tone = STATUS_TONE[r.status] || '#94a3b8';
  var dot = $('pad-status-badge').previousElementSibling;
  if (dot) dot.style.background = tone;

  // ---- Actions ----
  function download() { MC.toast('Preparing authorization PDF download…', 'info'); }
  $('pad-download-btn').onclick = download;
  $('pad-side-download').onclick = download;
});

// ==========================================================================
// refund-detail.js
// ==========================================================================
document.addEventListener("DOMContentLoaded", function () {
    if ((location.pathname.split("/").pop() || "index.html") !== "refund-detail.html") return;
    var $ = function (id) {
        return document.getElementById(id);
    };
    var params = new URLSearchParams(window.location.search);
    var pick = function (key, fallback) {
        var v = params.get(key);
        return v && v.length ? v : fallback;
    };

    var r = {
        id: pick("id", "1"),
        patient: pick("patient", "Diego Fernandez"),
        invoiceref: pick("invoiceref", "INV-10032"),
        amount: pick("amount", "150"),
        reason: pick("reason", "Duplicate charge on lab test"),
        date: pick("date", "2024-12-02"),
        status: pick("status", "Processed"),
    };

    function fmt(n) {
        var num = Number(n) || 0;
        return (
            "$" +
            num
                .toFixed(2)
                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        );
    }

    var BADGE = {
        Pending: "text-warning bg-warning/10",
        Processed: "text-success bg-success/10",
    };

    var refundId = "#RFD-" + (40000 + Number(r.id));
    var amountFmt = fmt(r.amount);

    $("rfd-refund-title").textContent = "Refund " + refundId;
    $("rfd-status-badge").textContent = r.status;
    $("rfd-refund-id").textContent = refundId;
    $("rfd-patient-name").textContent = r.patient;
    $("rfd-invoice-ref").textContent = r.invoiceref;
    $("rfd-date").textContent = r.date;

    $("rfd-amount").textContent = amountFmt;
    $("rfd-stat-invoiceref").textContent = r.invoiceref;
    $("rfd-stat-date").textContent = r.date;
    $("rfd-stat-status").textContent = r.status;

    $("rfd-side-patient").textContent = r.patient;
    $("rfd-side-invoiceref").textContent = r.invoiceref;
    $("rfd-side-amount").textContent = amountFmt;

    $("rfd-kv-patient").textContent = r.patient;
    $("rfd-kv-invoiceref").textContent = r.invoiceref;
    $("rfd-kv-date").textContent = r.date;

    document.title = "Refund " + refundId + " — Dreams HMS";

    var badgeCls = BADGE[r.status] || "text-gray-900 bg-light/60";
    var toneMap = {
        Pending: "#f59e0b",
        Processed: "#10b981",
    };
    var dot = $("rfd-status-badge").previousElementSibling;
    if (dot) dot.style.background = toneMap[r.status] || "#94a3b8";

    // ---- Summary card ----
    $("rfd-summary").innerHTML =
        '<div class="rfd-kv"><span class="k"><i class="icon-user text-[13px]"></i>Patient</span><span class="v">' +
        r.patient +
        '</span></div>' +
        '<div class="rfd-kv"><span class="k"><i class="icon-hash text-[13px]"></i>Refund ID</span><span class="v">' +
        refundId +
        '</span></div>' +
        '<div class="rfd-kv"><span class="k"><i class="icon-file-text text-[13px]"></i>Invoice Reference</span><span class="v text-primary">' +
        r.invoiceref +
        '</span></div>' +
        '<div class="rfd-kv"><span class="k"><i class="icon-dollar-sign text-[13px]"></i>Amount</span><span class="v">' +
        amountFmt +
        '</span></div>' +
        '<div class="rfd-kv"><span class="k"><i class="icon-message-square text-[13px]"></i>Reason</span><span class="v">' +
        r.reason +
        '</span></div>' +
        '<div class="rfd-kv"><span class="k"><i class="icon-calendar text-[13px]"></i>Date</span><span class="v">' +
        r.date +
        '</span></div>' +
        '<div class="rfd-kv"><span class="k"><i class="icon-circle-check text-[13px]"></i>Status</span><span class="v"><span class="inline-block px-2 py-1 text-xs font-semibold rounded-lg whitespace-nowrap ' +
        badgeCls +
        '">' +
        r.status +
        "</span></span></div>";

    // ---- Actions ----
    var download = function () {
        if (window.MC && MC.toast) MC.toast("Preparing refund receipt download…", "info");
        else alert("Preparing refund receipt download…");
    };
    $("rfd-download-btn").onclick = download;
    $("rfd-download-btn-2").onclick = download;
});

// ==========================================================================
// reimbursement-detail.js
// ==========================================================================
document.addEventListener('DOMContentLoaded', function () {
  if (document.body.dataset.page !== 'reimbursement-detail') return;

  var $ = function (id) { return document.getElementById(id); };
  var params = new URLSearchParams(window.location.search);
  var pick = function (key, fallback) { var v = params.get(key); return v && v.length ? v : fallback; };
  var fmt = function (n) {
    return '$' + parseFloat(n || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  var r = {
    id: pick('id', '1'),
    patient: pick('patient', 'James Morrison'),
    insurer: pick('insurer', 'BlueCross Health'),
    claimed: pick('claimed', '3200'),
    approved: pick('approved', '3200'),
    paid: pick('paid', '3200'),
    date: pick('date', '2024-12-10'),
    method: pick('method', 'Bank Transfer'),
    ref: pick('ref', 'TXN-88213401'),
    status: pick('status', 'Paid'),
  };

  var rbId = '#RB-' + String(r.id).padStart(5, '0');

  var BADGE = {
    'Awaiting Payment': 'text-warning bg-warning/10',
    'Partially Paid': 'text-primary bg-primary/10',
    Paid: 'text-success bg-success/10',
    Overdue: 'text-danger bg-danger/10',
  };
  var STATUS_TONE = {
    'Awaiting Payment': '#F59E0B',
    'Partially Paid': '#0371c6',
    Paid: '#009966',
    Overdue: '#e7000b',
  };

  $('rmd-patient-name').textContent = r.patient;
  $('rmd-status-badge').textContent = r.status;
  $('rmd-rb-id').textContent = rbId;
  $('rmd-insurer-name').textContent = r.insurer;
  $('rmd-method').textContent = r.method;
  $('rmd-date').textContent = r.date;
  $('rmd-claimed').textContent = fmt(r.claimed);
  $('rmd-approved').textContent = fmt(r.approved);
  $('rmd-paid').textContent = Number(r.paid) > 0 ? fmt(r.paid) : '—';
  $('rmd-pmethod').textContent = r.method;
  $('rmd-side-insurer').textContent = r.insurer;
  $('rmd-side-ref').textContent = 'Ref: ' + r.ref;
  $('rmd-kv-patient').textContent = r.patient;
  $('rmd-kv-insurer').textContent = r.insurer;
  $('rmd-kv-ref').textContent = r.ref;
  $('rmd-kv-date').textContent = r.date;
  document.title = r.patient + ' — ' + rbId + ' — Dreams HMS';

  var badgeCls = BADGE[r.status] || 'text-gray-900 bg-light/60';
  var badgeEl = $('rmd-status-badge');
  badgeCls.split(' ').forEach(function (c) { badgeEl.classList.add(c); });

  var tone = STATUS_TONE[r.status] || '#94a3b8';
  var dot = $('rmd-status-badge').previousElementSibling;
  if (dot) dot.style.background = tone;

  // ---- Actions ----
  function download() { MC.toast('Preparing reimbursement PDF download…', 'info'); }
  $('rmd-download-btn').onclick = download;
});
