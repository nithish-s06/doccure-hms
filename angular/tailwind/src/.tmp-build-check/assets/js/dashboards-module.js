// ==========================================================================
// executive-dashboard.js
// ==========================================================================
// Dreams HMS — Executive Command Center
// Elena Vasquez-Moreno's boardroom view: digital-twin department wall,
// operations pipeline, decision intelligence, capacity radials, finance
// flow, clinical quality, workforce meters, intelligence feed, strategic
// projects, compliance console, executive calendar and activity stream.
// Every headline figure derives from the underlying lists. No API.
(function () {
    "use strict";
    if ((location.pathname.split("/").pop() || "index.html") !== "executive-dashboard.html") return;

    const $ = (id) => document.getElementById(id);
    const esc = (v) => String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    const toast = (msg, tone) => (window.MC && MC.toast ? MC.toast(msg, tone || "info") : console.log(msg));

    /* ====================================================================
       Data — Dreams Medical Center network (now = 5:20 PM)
       ==================================================================== */

    const DEPTS = [
        { name: "Emergency", icon: "icon-siren", state: "critical", cap: "28 bays", load: 92, alerts: 2, perf: "Surge protocol ready" },
        { name: "OPD", icon: "icon-stethoscope", state: "busy", cap: "14 clinics", load: 78, alerts: 0, perf: "Avg wait 22 min" },
        { name: "IPD", icon: "icon-bed", state: "optimal", cap: "412 beds", load: 81, alerts: 0, perf: "Discharges on track" },
        { name: "ICU", icon: "icon-heart-pulse", state: "busy", cap: "48 beds", load: 88, alerts: 1, perf: "2 step-downs pending" },
        { name: "Operation Theatre", icon: "icon-scissors", state: "optimal", cap: "9 suites", load: 67, alerts: 0, perf: "On schedule" },
        { name: "Laboratory", icon: "icon-flask-conical", state: "optimal", cap: "6 benches", load: 74, alerts: 0, perf: "TAT 2h 04m" },
        { name: "Pharmacy", icon: "icon-pill", state: "busy", cap: "4 counters", load: 83, alerts: 1, perf: "Insulin restock inbound" },
        { name: "Radiology", icon: "icon-scan-line", state: "optimal", cap: "5 modalities", load: 58, alerts: 0, perf: "MRI slots open" },
        { name: "Billing", icon: "icon-receipt", state: "optimal", cap: "6 counters", load: 62, alerts: 0, perf: "93% collection" },
        { name: "Reception", icon: "icon-headset", state: "busy", cap: "5 desks", load: 76, alerts: 0, perf: "Queue 12 min" },
    ];
    const DEPT_META = { optimal: ["Optimal", "ex-emerald"], busy: ["Busy", "ex-amber"], critical: ["Critical", "ex-rose"] };

    const PIPELINE = [
        { name: "Patient Arrival", icon: "icon-door-open", vol: 512, time: "—", pct: 100, delay: null },
        { name: "Registration", icon: "icon-user-plus", vol: 496, time: "4 min", pct: 97, delay: null },
        { name: "Consultation", icon: "icon-stethoscope", vol: 431, time: "18 min", pct: 87, delay: "12 waiting" },
        { name: "Diagnosis", icon: "icon-flask-conical", vol: 287, time: "1h 40m", pct: 74, delay: null },
        { name: "Treatment", icon: "icon-heart-pulse", vol: 224, time: "varies", pct: 69, delay: "OT-3 behind" },
        { name: "Pharmacy", icon: "icon-pill", vol: 198, time: "9 min", pct: 82, delay: null },
        { name: "Billing", icon: "icon-receipt", vol: 171, time: "6 min", pct: 88, delay: null },
        { name: "Discharge", icon: "icon-log-out", vol: 143, time: "32 min", pct: 79, delay: "5 pending docs" },
    ];
    const CURRENT_STAGE = 4;

    const BRIEFS = [
        { tag: "Attention", tone: "ex-rose", icon: "icon-siren", text: "Emergency at 92% for 3+ hours. Recommend opening the 8-bay surge wing and diverting two ambulances to the North campus." },
        { tag: "Bottleneck", tone: "ex-amber", icon: "icon-clock-alert", text: "Discharge documentation is the slowest step today (32 min avg). 5 patients are bed-blocking IPD — pharmacist review is the constraint." },
        { tag: "Resource", tone: "ex-violet", icon: "icon-package-minus", text: "Insulin cold-chain delivery arrived 1 day late. Pharmacy buffer now 36 hours — approve the standing safety-stock increase." },
        { tag: "Incident", tone: "ex-rose", icon: "icon-triangle-alert", text: "Refrigeration fault in lab RF-2 escalated and contained. No reagent loss. Full incident report due Monday." },
        { tag: "Satisfaction", tone: "ex-sky", icon: "icon-smile", text: "OPD satisfaction dipped to 4.1/5 (waiting time driven). Front-desk pilot of QR self-check-in lifts North campus to 4.6." },
        { tag: "Recommendation", tone: "ex-fuchsia", icon: "icon-sparkles", text: "Friday elective OT utilization is 67% vs 84% midweek — moving 4 elective slots to Friday frees Monday's ICU step-down pressure." },
    ];

    const CAPACITY = [
        { label: "Bed Occupancy", val: "81%", pct: 81, tone: "ex-sky", icon: "icon-bed", sub: "334 of 412 IPD beds" },
        { label: "ICU Availability", val: "6", pct: 88, tone: "ex-rose", icon: "icon-heart-pulse", sub: "42 of 48 in use", invert: true },
        { label: "Emergency Beds", val: "92%", pct: 92, tone: "ex-amber", icon: "icon-siren", sub: "26 of 28 bays" },
        { label: "Waiting Area", val: "64%", pct: 64, tone: "ex-violet", icon: "icon-armchair", sub: "118 seated across lobbies" },
        { label: "OT Utilization", val: "67%", pct: 67, tone: "ex-emerald", icon: "icon-scissors", sub: "6 of 9 suites active" },
        { label: "Ambulances", val: "9", pct: 75, tone: "ex-indigo", icon: "icon-ambulance", sub: "9 of 12 available", invert: true },
        { label: "Ventilators", val: "58%", pct: 58, tone: "ex-fuchsia", icon: "icon-wind", sub: "21 of 36 in use" },
        { label: "Isolation Rooms", val: "5", pct: 62, tone: "ex-gold", icon: "icon-shield-alert", sub: "8 of 13 occupied", invert: true },
    ];

    const FIN_FLOW = [
        { label: "Collected", amount: 96400, tone: "#10b981" },
        { label: "Insurance pipeline", amount: 31200, tone: "#0ea5e9" },
        { label: "Outstanding", amount: 14800, tone: "#f43f5e" },
    ];
    const FIN_GRID = [
        { label: "Collection Status", val: "93.4%", sub: "$96.4k of $103.2k billed", tone: "ex-emerald", icon: "icon-hand-coins" },
        { label: "Insurance Claims", val: "$31.2k", sub: "44 claims · 87% success rate", tone: "ex-sky", icon: "icon-shield-check" },
        { label: "Top Department", val: "IPD · $38.9k", sub: "27% of network revenue", tone: "ex-violet", icon: "icon-bed" },
        { label: "Operating Margin", val: "24.6%", sub: "+1.8 pts vs last quarter", tone: "ex-gold", icon: "icon-trending-up" },
    ];

    const CLINICAL = [
        { label: "Active Admissions", val: "334", sub: "41 today · 38 discharges", tone: "ex-sky", icon: "icon-bed" },
        { label: "Surgeries Today", val: "23", sub: "19 done · 4 in theatre", tone: "ex-violet", icon: "icon-scissors" },
        { label: "Avg Length of Stay", val: "4.2 d", sub: "Target 4.5 · trending down", tone: "ex-emerald", icon: "icon-calendar" },
        { label: "Readmission Rate", val: "3.1%", sub: "30-day · below 3.5% target", tone: "ex-emerald", icon: "icon-rotate-ccw" },
        { label: "Infection Alerts", val: "2", sub: "1 CLABSI review · 1 isolation", tone: "ex-amber", icon: "icon-bug" },
    ];

    const WORKFORCE = [
        { label: "Doctors on Duty", now: 86, total: 94, tone: "ex-indigo", icon: "icon-stethoscope", note: "8 on leave · locums covering" },
        { label: "Nurses on Duty", now: 213, total: 240, tone: "ex-sky", icon: "icon-heart-handshake", note: "Night shift fully staffed" },
        { label: "Staff Attendance", now: 91, total: 100, tone: "ex-emerald", icon: "icon-user-check", note: "91% network-wide today", pct: true },
        { label: "Shift Coverage", now: 96, total: 100, tone: "ex-violet", icon: "icon-clock", note: "2 gaps in radiology evening", pct: true },
        { label: "Leave Impact", now: 14, total: 100, tone: "ex-amber", icon: "icon-plane", note: "34 on leave · low risk", pct: true },
    ];

    let INTEL = [
        { id: "i1", kind: "Emergency Alert", urgent: true, icon: "icon-siren", tone: "ex-rose", text: "ED at 92% capacity — surge wing decision needed within the hour.", time: "5:12 PM" },
        { id: "i2", kind: "VIP Admission", icon: "icon-crown", tone: "ex-fuchsia", text: "Board member's family admitted to Suite 7 — concierge protocol active.", time: "4:48 PM" },
        { id: "i3", kind: "Critical Lab Result", icon: "icon-flask-conical", tone: "ex-rose", text: "Critical potassium flagged and resolved on Ward 4B — closed-loop confirmed.", time: "4:30 PM" },
        { id: "i4", kind: "Equipment Failure", icon: "icon-wrench", tone: "ex-amber", text: "Lab refrigeration RF-2 fault — engineer on site, reagents relocated safely.", time: "3:55 PM" },
        { id: "i5", kind: "OT Delay", icon: "icon-clock-alert", tone: "ex-amber", text: "OT-3 running 40 min behind — evening list compressed, no cancellations.", time: "3:20 PM" },
        { id: "i6", kind: "High Patient Volume", icon: "icon-users", tone: "ex-sky", text: "OPD crossed 430 visits — 8% above forecast, staffing held.", time: "2:45 PM" },
        { id: "i7", kind: "Compliance Reminder", icon: "icon-shield-check", tone: "ex-emerald", text: "NABH mock audit in 12 days — 3 open evidence items with quality team.", time: "1:30 PM" },
        { id: "i8", kind: "Revenue Milestone", icon: "icon-trophy", tone: "ex-gold", text: "Network crossed $500k monthly revenue — 11.8% ahead of plan.", time: "12:10 PM" },
    ];

    const PROJECTS = [
        { name: "East Wing Expansion", kind: "Expansion", pct: 62, tone: "ex-violet", icon: "icon-building-2", eta: "Q2 2027", note: "Structure complete · MEP fit-out" },
        { name: "NABH Accreditation", kind: "Accreditation", pct: 84, tone: "ex-emerald", icon: "icon-shield-check", eta: "Sep 2026", note: "Mock audit in 12 days" },
        { name: "Digital Transformation", kind: "Digital", pct: 71, tone: "ex-fuchsia", icon: "icon-cpu", eta: "Dec 2026", note: "e-ICU rollout at North campus" },
        { name: "MRI 3T Procurement", kind: "Equipment", pct: 45, tone: "ex-sky", icon: "icon-scan-line", eta: "Nov 2026", note: "Vendor shortlist to board Friday" },
        { name: "Sepsis Bundle Initiative", kind: "Quality", pct: 90, tone: "ex-rose", icon: "icon-heart-pulse", eta: "Aug 2026", note: "Mortality down 0.8 pts" },
        { name: "Solar + HVAC Upgrade", kind: "Infrastructure", pct: 33, tone: "ex-gold", icon: "icon-zap", eta: "Mar 2027", note: "Phase 1 roof survey done" },
    ];

    const RISK = {
        main: [
            { label: "NABH compliance", val: "96% · on track" },
            { label: "Audit status", val: "2 open · 14 closed YTD" },
            { label: "Data security", val: "No incidents · 30 days" },
            { label: "Overall risk level", val: "LOW · trending stable" },
        ],
        certs: [
            { label: "JCI accreditation", val: "Valid · renews Mar 2027" },
            { label: "ISO 15189 (Lab)", val: "Certified · audit 24 Jul" },
            { label: "Fire & safety NOC", val: "Valid · renews Dec 2026" },
            { label: "Insurance empanelment", val: "18 active · 2 pending" },
        ],
    };

    const CALENDAR = [
        { d: "18", m: "Jul", title: "Quarterly Board Meeting", sub: "9:00 AM · Boardroom A · Q2 results", tone: "ex-violet", icon: "icon-presentation" },
        { d: "21", m: "Jul", title: "Health Minister VIP Visit", sub: "11:30 AM · New cardiac wing tour", tone: "ex-fuchsia", icon: "icon-crown" },
        { d: "22", m: "Jul", title: "Emergency Dept Review", sub: "3:00 PM · Surge capacity + staffing", tone: "ex-rose", icon: "icon-siren" },
        { d: "24", m: "Jul", title: "Internal Quality Audit", sub: "Full day · Wards 3–5 · ISO 15189", tone: "ex-emerald", icon: "icon-shield-check" },
    ];

    let ACTIVITY = [
        { time: "5:05 PM", cat: "Finance", icon: "icon-badge-dollar-sign", tone: "ex-gold", text: "Q3 capital budget revision approved — $2.4M for imaging upgrade" },
        { time: "4:40 PM", cat: "Projects", icon: "icon-building-2", tone: "ex-violet", text: "East Wing expansion updated — MEP fit-out milestone signed off" },
        { time: "4:15 PM", cat: "Reviews", icon: "icon-presentation", tone: "ex-indigo", text: "Pharmacy department review completed — margin plan accepted" },
        { time: "3:50 PM", cat: "Governance", icon: "icon-file-text", tone: "ex-emerald", text: "Updated infection-control policy published network-wide" },
        { time: "3:10 PM", cat: "Incidents", icon: "icon-shield-check", tone: "ex-rose", text: "Lab refrigeration incident resolved — corrective action logged" },
        { time: "2:30 PM", cat: "Governance", icon: "icon-clipboard-check", tone: "ex-emerald", text: "Fire-safety audit closed — zero critical findings" },
        { time: "1:45 PM", cat: "Reviews", icon: "icon-users", tone: "ex-indigo", text: "Executive committee meeting completed — 6 decisions minuted" },
        { time: "12:20 PM", cat: "Finance", icon: "icon-trophy", tone: "ex-gold", text: "Monthly revenue milestone acknowledged to all department heads" },
        { time: "11:30 AM", cat: "Projects", icon: "icon-cpu", tone: "ex-violet", text: "e-ICU vendor contract executed — go-live scheduled October" },
        { time: "10:15 AM", cat: "Incidents", icon: "icon-siren", tone: "ex-rose", text: "Overnight ED surge debrief — diversion protocol praised" },
    ];

    /* ====================================================================
       Renderers
       ==================================================================== */

    function renderHero() {
        // fact-occ, fact-rev and fact-staff are static in HTML — they never change at runtime.
        const crit = DEPTS.filter((d) => d.state === "critical").length;
        $("fact-emerg").textContent = crit ? crit + " dept critical" : "Stable";

        const loads = DEPTS.reduce((s, d) => s + d.load, 0) / DEPTS.length;
        const health = Math.round(100 - (loads - 60) * 0.9 - crit * 4);
        const C = 2 * Math.PI * 52;
        const fill = $("health-fill");
        fill.setAttribute("stroke-dasharray", C.toFixed(1));
        fill.setAttribute("stroke-dashoffset", (C * (1 - health / 100)).toFixed(1));
        $("health-val").textContent = health + "%";

        const strip = $("alert-strip");
        const urgent = INTEL.find((i) => i.urgent);
        if (urgent) {
            strip.classList.add("is-alert");
            strip.innerHTML =
                '<span class="grid size-9 shrink-0 place-items-center rounded-xl bg-rose-500/25 text-rose-200"><i class="icon-siren" aria-hidden="true"></i></span>' +
                '<div class="min-w-0 flex-1"><p class="text-xs font-extrabold uppercase tracking-wider text-rose-200">Executive decision required — ' + esc(urgent.kind) + "</p>" +
                '<p class="mt-0.5 text-xs font-medium text-white/70">' + esc(urgent.text) + "</p></div>" +
                '<button type="button" id="btn-approve-surge" class="ex-action shrink-0"><i class="icon-check" aria-hidden="true"></i>Approve surge wing</button>';
            $("btn-approve-surge").addEventListener("click", () => {
                INTEL = INTEL.filter((i) => !i.urgent);
                const ed = DEPTS.find((d) => d.name === "Emergency");
                ed.state = "busy";
                ed.load = 74;
                ed.alerts = 0;
                ed.perf = "Surge wing open · 8 bays added";
                renderHero();
                renderTwin();
                renderIntel();
                toast("Surge wing approved — 8 bays opening, bed management notified.", "success");
            });
        } else {
            strip.classList.remove("is-alert");
            strip.innerHTML =
                '<span class="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-400/20 text-emerald-200"><i class="icon-shield-check" aria-hidden="true"></i></span>' +
                '<div class="min-w-0 flex-1"><p class="text-xs font-extrabold uppercase tracking-wider text-emerald-200">Network stable — no executive decisions pending</p>' +
                '<p class="mt-0.5 text-xs font-medium text-white/70">All campuses operating within thresholds. Next scheduled review: 6:00 PM ops call.</p></div>';
        }
    }

    function renderTwin() {
        $("twin-legend").innerHTML = Object.entries(DEPT_META).map(([k, m]) =>
            '<span class="ex-chip ' + m[1] + ' text-[9px]">' + m[0] + " · " + DEPTS.filter((d) => d.state === k).length + "</span>"
        ).join("");
        $("twin").innerHTML = DEPTS.map((d) => {
            const m = DEPT_META[d.state];
            return (
                '<div class="ex-dept is-' + d.state + '">' +
                '<div class="flex items-center gap-2"><span class="ex-panel-icon !size-8 shrink-0 text-xs" style="--ex-accent:var(--ex-dept-c)"><i class="' + d.icon + '" aria-hidden="true"></i></span>' +
                '<div class="min-w-0 flex-1"><p class="truncate text-xs font-extrabold text-gray-900">' + esc(d.name) + '</p>' +
                '<p class="text-[9px] font-bold text-gray-400">' + esc(d.cap) + "</p></div>" +
                (d.alerts ? '<span class="ex-chip ex-rose shrink-0 text-[9px]">' + d.alerts + "</span>" : "") +
                "</div>" +
                '<div class="mt-2 flex items-center justify-between"><span class="ex-dept-status">' + m[0] + '</span>' +
                '<span class="text-[10px] font-extrabold text-gray-500 tabular-nums">' + d.load + "% load</span></div>" +
                '<div class="ex-dept-track"><span class="ex-dept-fill" style="width:0%" data-w="' + d.load + '"></span></div>' +
                '<p class="mt-1.5 truncate text-[9px] font-semibold text-gray-400">' + esc(d.perf) + "</p></div>"
            );
        }).join("");
        requestAnimationFrame(() => document.querySelectorAll(".ex-dept-fill").forEach((f) => (f.style.width = f.dataset.w + "%")));
    }

    function renderPipeline() {
        $("pipeline").innerHTML = PIPELINE.map((s, i) => {
            const state = i < CURRENT_STAGE ? "is-done" : i === CURRENT_STAGE ? "is-now" : "";
            return (
                '<li class="ex-stage ' + state + '">' +
                '<span class="ex-stage-node"><i class="' + s.icon + '" aria-hidden="true"></i></span>' +
                '<p class="text-[10px] font-bold ' + (i === CURRENT_STAGE ? "text-gray-900" : "text-gray-500") + '">' + esc(s.name) + "</p>" +
                '<div class="ex-stage-plate"><div class="flex items-baseline justify-between">' +
                '<p class="text-sm font-extrabold text-gray-900 tabular-nums">' + s.vol + '</p>' +
                '<p class="text-[9px] font-bold text-gray-400 tabular-nums">' + esc(s.time) + "</p></div>" +
                '<div class="ex-stage-bar"><span style="width:0%" data-w="' + s.pct + '"></span></div>' +
                (s.delay ? '<p class="mt-1.5 text-[9px] font-extrabold text-rose-500"><i class="icon-clock-alert text-[9px]" aria-hidden="true"></i> ' + s.delay + "</p>" : '<p class="mt-1.5 text-[9px] font-semibold text-gray-400">' + s.pct + "% flow</p>") +
                "</div></li>"
            );
        }).join("");
        requestAnimationFrame(() => document.querySelectorAll(".ex-stage-bar span").forEach((b) => (b.style.width = b.dataset.w + "%")));
        $("pipe-chip").textContent = "512 patients through today";
    }

    function renderBriefs() {
        $("briefs").innerHTML = BRIEFS.map((b) => (
            '<div class="ex-brief ' + b.tone + '"><div class="flex items-center gap-2">' +
            '<span class="ex-brief-tag"><i class="' + b.icon + ' text-[9px]" aria-hidden="true"></i>' + b.tag + "</span></div>" +
            '<p class="mt-2 text-[11px] font-semibold leading-relaxed text-gray-700 dark:text-gray-300">' + esc(b.text) + "</p></div>"
        )).join("");
    }

    function renderCapacity() {
        $("capacity").innerHTML = CAPACITY.map((c) => {
            const C = 2 * Math.PI * 20;
            const shown = c.pct;
            return (
                '<div class="ex-cap ' + c.tone + '">' +
                '<span class="ex-ring"><svg viewBox="0 0 48 48"><circle class="ex-ring-track" cx="24" cy="24" r="20" fill="none" stroke="currentColor" stroke-width="4"/>' +
                '<circle class="ex-ring-fill" cx="24" cy="24" r="20" fill="none" stroke-width="4" stroke-linecap="round" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + (C * (1 - shown / 100)).toFixed(1) + '"/></svg>' +
                '<span class="ex-ring-label"><i class="' + c.icon + '" aria-hidden="true"></i></span></span>' +
                '<div class="min-w-0"><div class="flex items-baseline gap-1.5"><p class="text-base font-extrabold leading-none text-gray-900 tabular-nums">' + c.val + "</p>" +
                (c.invert ? '<span class="text-[9px] font-extrabold text-gray-400">free</span>' : "") + "</div>" +
                '<p class="mt-0.5 text-[10px] font-bold text-gray-500">' + c.label + "</p>" +
                '<p class="text-[9px] font-semibold text-gray-400">' + c.sub + "</p></div></div>"
            );
        }).join("");
        $("cap-chip").textContent = "81% network occupancy";
    }

    function renderFinance() {
        const total = FIN_FLOW.reduce((s, f) => s + f.amount, 0);
        $("fin-flow").innerHTML =
            '<div class="flex items-center justify-between"><p class="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Revenue Flow · Today</p>' +
            '<span class="ex-chip ex-gold text-[9px]"><i class="icon-trending-up text-[9px]" aria-hidden="true"></i>+9.2% vs yesterday</span></div>' +
            '<p class="mt-1.5 text-3xl font-extrabold text-gray-900 tabular-nums">$' + (total / 1000).toFixed(1) + "k</p>" +
            '<div class="ex-flow-track">' +
            FIN_FLOW.map((f) => '<span class="ex-flow-seg" style="width:0%;background:' + f.tone + '" data-w="' + ((f.amount / total) * 100).toFixed(1) + '"></span>').join("") +
            "</div>" +
            '<div class="mt-2 flex flex-wrap gap-x-4 gap-y-1">' +
            FIN_FLOW.map((f) => '<span class="inline-flex items-center gap-1.5 text-[10px] font-bold text-gray-500"><span class="size-2 rounded-full" style="background:' + f.tone + '"></span>' + f.label + ' · $' + (f.amount / 1000).toFixed(1) + "k</span>").join("") +
            "</div>";
        $("fin-grid").innerHTML = FIN_GRID.map((f) => (
            '<div class="ex-fin ' + f.tone + '"><div class="flex items-center gap-2"><span class="ex-panel-icon !size-7 text-[11px]"><i class="' + f.icon + '" aria-hidden="true"></i></span>' +
            '<p class="text-[10px] font-extrabold uppercase tracking-wide text-gray-400">' + f.label + "</p></div>" +
            '<p class="mt-1.5 text-lg font-extrabold text-gray-900 tabular-nums">' + f.val + '</p><p class="text-[10px] font-semibold text-gray-400">' + f.sub + "</p></div>"
        )).join("");
        requestAnimationFrame(() => document.querySelectorAll(".ex-flow-seg").forEach((s) => (s.style.width = s.dataset.w + "%")));
    }

    function renderClinical() {
        $("clinical").innerHTML = CLINICAL.map((c) => (
            '<div class="ex-clin ' + c.tone + '"><span class="ex-panel-icon !size-8 shrink-0 text-xs"><i class="' + c.icon + '" aria-hidden="true"></i></span>' +
            '<div class="min-w-0 flex-1"><div class="flex items-baseline justify-between gap-2">' +
            '<p class="text-[11px] font-bold text-gray-500">' + c.label + '</p>' +
            '<p class="text-sm font-extrabold text-gray-900 tabular-nums">' + c.val + "</p></div>" +
            '<p class="text-[10px] font-semibold text-gray-400">' + c.sub + "</p></div></div>"
        )).join("");
        $("clin-chip").textContent = "11 critical patients";
    }

    function renderWorkforce() {
        $("workforce").innerHTML = WORKFORCE.map((w) => {
            const pct = w.pct ? w.now : Math.round((w.now / w.total) * 100);
            return (
                '<div class="ex-staff ' + w.tone + '"><div class="flex items-center gap-2.5">' +
                '<span class="ex-panel-icon !size-8 shrink-0 text-xs"><i class="' + w.icon + '" aria-hidden="true"></i></span>' +
                '<div class="min-w-0 flex-1"><div class="flex items-baseline justify-between gap-2">' +
                '<p class="text-[11px] font-bold text-gray-500">' + w.label + '</p>' +
                '<p class="text-xs font-extrabold text-gray-900 tabular-nums">' + (w.pct ? pct + "%" : w.now + " / " + w.total) + "</p></div>" +
                '<div class="ex-staff-track"><span class="ex-staff-fill" style="width:0%" data-w="' + pct + '"></span></div>' +
                '<p class="mt-1 text-[9px] font-semibold text-gray-400">' + w.note + "</p></div></div></div>"
            );
        }).join("");
        $("staff-chip").textContent = "299 clinical on duty";
        requestAnimationFrame(() => document.querySelectorAll(".ex-staff-fill").forEach((f) => (f.style.width = f.dataset.w + "%")));
    }

    function renderIntel() {
        $("intel").innerHTML = INTEL.map((i) => (
            '<div class="ex-intel ' + i.tone + (i.urgent ? " is-urgent" : "") + '">' +
            '<span class="ex-panel-icon !size-8 shrink-0 text-xs"><i class="' + i.icon + '" aria-hidden="true"></i></span>' +
            '<div class="min-w-0 flex-1"><div class="flex items-center gap-2"><p class="text-[11px] font-extrabold text-gray-900">' + esc(i.kind) + '</p><span class="ml-auto text-[10px] font-semibold text-gray-400 tabular-nums">' + esc(i.time) + "</span></div>" +
            '<p class="mt-0.5 text-[11px] leading-relaxed text-gray-500">' + esc(i.text) + "</p></div>" +
            '<button type="button" data-dismiss="' + i.id + '" class="shrink-0 self-center rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10" aria-label="Dismiss"><i class="icon-check text-xs" aria-hidden="true"></i></button>' +
            "</div>"
        )).join("") || '<div class="grid place-items-center py-8 text-center"><span class="grid size-12 place-items-center rounded-2xl bg-emerald-500/10 text-lg text-emerald-500"><i class="icon-brain-circuit" aria-hidden="true"></i></span><p class="mt-3 text-xs font-bold text-gray-500">Feed clear</p><p class="text-[10px] text-gray-400">No open intelligence items.</p></div>';
    }

    function renderProjects() {
        $("projects").innerHTML = PROJECTS.map((p) => (
            '<div class="ex-proj ' + p.tone + '"><span class="ex-proj-dot"><i class="' + p.icon + '" aria-hidden="true"></i></span>' +
            '<div class="ex-proj-card"><div class="flex flex-wrap items-center gap-x-2 gap-y-1">' +
            '<p class="text-xs font-extrabold text-gray-900">' + esc(p.name) + '</p>' +
            '<span class="ex-chip ' + p.tone + ' text-[9px]">' + p.kind + '</span>' +
            '<span class="ml-auto text-[10px] font-extrabold text-gray-500 tabular-nums">' + p.pct + "%</span></div>" +
            '<div class="ex-proj-track"><span class="ex-proj-fill" style="width:0%" data-w="' + p.pct + '"></span></div>' +
            '<div class="mt-1.5 flex items-center justify-between text-[10px] font-semibold text-gray-400"><span>' + esc(p.note) + '</span><span class="shrink-0 tabular-nums">' + esc(p.eta) + "</span></div></div></div>"
        )).join("");
        $("proj-chip").textContent = PROJECTS.length + " active · avg " + Math.round(PROJECTS.reduce((s, p) => s + p.pct, 0) / PROJECTS.length) + "%";
        requestAnimationFrame(() => document.querySelectorAll(".ex-proj-fill").forEach((f) => (f.style.width = f.dataset.w + "%")));
    }

    function renderRisk() {
        $("risk-main").innerHTML =
            '<div class="mb-1 flex items-center gap-2"><span class="ex-panel-icon !size-7 text-[11px]"><i class="icon-shield-check" aria-hidden="true"></i></span><p class="text-[11px] font-extrabold uppercase tracking-wider text-gray-500">Governance Status</p></div>' +
            RISK.main.map((r) => '<div class="ex-risk-row"><span>' + r.label + '</span><b class="font-extrabold text-gray-900 tabular-nums">' + r.val + "</b></div>").join("");
        $("risk-certs").innerHTML =
            '<div class="mb-1 flex items-center gap-2"><span class="ex-panel-icon !size-7 text-[11px]"><i class="icon-badge-check" aria-hidden="true"></i></span><p class="text-[11px] font-extrabold uppercase tracking-wider text-gray-500">Accreditation &amp; Certifications</p></div>' +
            RISK.certs.map((r) => '<div class="ex-risk-row"><span>' + r.label + '</span><b class="font-extrabold text-gray-900 tabular-nums">' + r.val + "</b></div>").join("");
        $("risk-chip").textContent = "Risk: LOW";
    }

    function renderCalendar() {
        $("calendar").innerHTML = CALENDAR.map((c) => (
            '<div class="ex-cal ' + c.tone + '"><div class="ex-cal-date"><p class="text-sm font-extrabold leading-none tabular-nums" style="color:var(--ex-accent)">' + c.d + '</p><p class="text-[8px] font-extrabold uppercase text-gray-400">' + c.m + "</p></div>" +
            '<div class="min-w-0 flex-1"><p class="truncate text-xs font-extrabold text-gray-900">' + esc(c.title) + "</p>" +
            '<p class="mt-0.5 truncate text-[10px] font-semibold text-gray-500">' + esc(c.sub) + "</p></div>" +
            '<span class="ex-panel-icon !size-8 shrink-0 text-xs"><i class="' + c.icon + '" aria-hidden="true"></i></span></div>'
        )).join("");
    }

    let actFilter = "All";
    function renderActivity() {
        const cats = ["All"].concat([...new Set(ACTIVITY.map((a) => a.cat))]);
        $("act-filters").innerHTML = cats.map((c) =>
            '<button type="button" data-cat="' + c + '" aria-pressed="' + (actFilter === c) + '" class="ex-chip ex-violet cursor-pointer' + (actFilter === c ? "" : " opacity-50") + '">' + c + "</button>"
        ).join("");
        $("activity").innerHTML = ACTIVITY.filter((a) => actFilter === "All" || a.cat === actFilter).map((a) => (
            '<div class="ex-tl ' + a.tone + '"><span class="ex-tl-icon"><i class="' + a.icon + '" aria-hidden="true"></i></span>' +
            '<div class="min-w-0 flex-1 pb-1"><div class="flex items-center gap-2"><span class="ex-chip ' + a.tone + ' text-[9px]">' + a.cat + '</span><span class="text-[10px] font-semibold text-gray-400 tabular-nums">' + esc(a.time) + "</span></div>" +
            '<p class="mt-1 text-[11px] font-semibold leading-relaxed text-gray-700 dark:text-gray-300">' + esc(a.text) + "</p></div></div>"
        )).join("");
    }

    /* ====================================================================
       Wiring
       ==================================================================== */

    function init() {
        // NOTE: the hospital digital twin, pipeline, briefs, capacity, finance,
        // clinical, workforce, intelligence feed, projects, risk and calendar
        // panels are now pre-rendered as static HTML directly in the page
        // (see executive-dashboard.html) instead of being built here on load.
        // The render*() functions above are kept and still run on demand —
        // from the surge-approval action, the intel dismiss/clear handlers,
        // and the activity category filter below — to keep those widgets
        // fully interactive after the initial paint.
        renderHero();

        // Intelligence feed
        $("intel").addEventListener("click", (e) => {
            const b = e.target.closest("[data-dismiss]");
            if (!b) return;
            INTEL = INTEL.filter((i) => i.id !== b.dataset.dismiss);
            renderIntel();
            renderHero();
        });
        $("btn-intel-clear").addEventListener("click", () => {
            if (!INTEL.length) return toast("Intelligence feed is already clear.", "info");
            INTEL = [];
            renderIntel();
            renderHero();
            toast("All intelligence items dismissed and archived.", "success");
        });

        // Activity filters
        $("act-filters").addEventListener("click", (e) => {
            const c = e.target.closest("[data-cat]");
            if (!c) return;
            actFilter = c.dataset.cat;
            renderActivity();
        });

        // Hero quick actions
        $("btn-brief").addEventListener("click", () => toast("Executive brief compiled — occupancy, revenue and risk summary exported to PDF.", "success"));
        $("btn-review").addEventListener("click", () => toast("Department review workspace opened — Emergency queued first.", "info"));
        $("btn-broadcast").addEventListener("click", () => toast("Broadcast composer opened — reaches all department heads.", "info"));

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
            toast(item.dataset.act + (item.dataset.act === "Incident Center" ? " opened — 1 incident awaiting closure." : " opened."), item.dataset.act === "Incident Center" ? "error" : "success");
        });
        document.addEventListener("click", (e) => {
            if (!e.target.closest(".ex-dock")) {
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
// index.js
// ==========================================================================
(function () {
    "use strict";
    var $ = function (id) { return document.getElementById(id); };

    /* Announcement bar */
    var close = $("ld-announce-close");
    if (close) close.addEventListener("click", function () { var b = $("ld-announce"); if (b) b.style.display = "none"; });

    /* Mobile menu */
    var mBtn = $("ld-menu-btn"), mNav = $("ld-mobile");
    if (mBtn && mNav) {
        mBtn.addEventListener("click", function () { mNav.classList.toggle("hidden"); });
        mNav.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { mNav.classList.add("hidden"); }); });
    }

    /* ---------- Interactive dashboard showcase ---------- */
    var ROLES = [
        { key: "executive", name: "Executive", icon: "icon-crown", acc: "#d946ef", badge: "Command center", stats: [["Occupancy", "81%", "+3%"], ["Revenue today", "$103k", "+9%"], ["Ops health", "96%", "live"]], bars: [55, 70, 48, 82, 66, 100, 78], rows: [["Emergency", "92% load", "#f43f5e"], ["ICU", "6 beds free", "#f59e0b"], ["OT", "on schedule", "#10b981"]] },
        { key: "doctor", name: "Doctor", icon: "icon-stethoscope", acc: "#6366f1", badge: "Clinical day", stats: [["Consults", "11", "3 left"], ["Waiting room", "4", "live"], ["Results", "7", "to sign"]], bars: [40, 60, 45, 70, 55, 85, 62], rows: [["Grant Sutherland", "Follow-up · 9:45", "#6366f1"], ["Ophelia Grant", "Pre-op clearance", "#0ea5e9"], ["Curtis Mbeki", "Post-stent review", "#10b981"]] },
        { key: "reception", name: "Reception", icon: "icon-headset", acc: "#f59e0b", badge: "Front desk", stats: [["In queue", "8", "live"], ["Now serving", "A-41", "counter 3"], ["Walk-ins", "9", "today"]], bars: [50, 65, 80, 60, 72, 55, 68], rows: [["A-41 · Kowalski", "called", "#f59e0b"], ["E-04 · Al-Rashid", "emergency", "#f43f5e"], ["V-07 · Hartley", "VIP · waiting", "#8b5cf6"]] },
        { key: "laboratory", name: "Laboratory", icon: "icon-microscope", acc: "#0ea5e9", badge: "LIMS floor", stats: [["Samples", "186", "today"], ["Turnaround", "2h 04m", "-8%"], ["Critical", "5", "escalated"]], bars: [45, 55, 74, 61, 48, 90, 70], rows: [["SMP-88214", "STAT · troponin", "#f43f5e"], ["SMP-88205", "cultures", "#f59e0b"], ["SMP-88201", "ready", "#10b981"]] },
        { key: "pharmacy", name: "Pharmacy", icon: "icon-pill", acc: "#10b981", badge: "Dispensary", stats: [["Rx queue", "12", "active"], ["Dispensed", "119", "today"], ["Low stock", "17", "alerts"]], bars: [60, 72, 55, 84, 66, 78, 91], rows: [["RX-2481 · Urgent", "verify", "#f59e0b"], ["Insulin Glargine", "8 left", "#f43f5e"], ["Controlled log", "dual-signed", "#8b5cf6"]] },
        { key: "billing", name: "Billing", icon: "icon-receipt", acc: "#eab308", badge: "Revenue", stats: [["Revenue", "$103k", "+9%"], ["Collection", "93%", "+1pt"], ["Claims", "44", "87% ok"]], bars: [50, 62, 70, 58, 80, 74, 96], rows: [["INV-9214", "$4,820 · insurance", "#0ea5e9"], ["CLM-4471", "under review", "#f59e0b"], ["INV-9187", "overdue", "#f43f5e"]] },
        { key: "emergency", name: "Emergency", icon: "icon-siren", acc: "#f43f5e", badge: "ED surge", stats: [["ED load", "92%", "high"], ["Triage", "26", "waiting"], ["Ambulances", "9", "available"]], bars: [70, 85, 92, 78, 96, 88, 100], rows: [["Bay 3 · Code Blue", "responding", "#f43f5e"], ["Triage · chest pain", "level 2", "#f59e0b"], ["Transfer · ETA 25m", "inbound", "#0ea5e9"]] },
        { key: "nurse", name: "Nurse", icon: "icon-heart-pulse", acc: "#0d9488", badge: "Ward 4B", stats: [["Patients", "6", "assigned"], ["Meds due", "5", "next hr"], ["Vitals", "94%", "on time"]], bars: [48, 58, 66, 52, 74, 60, 82], rows: [["Rosa Delgado", "sepsis screen", "#f43f5e"], ["Harold Nakamura", "strict I/O", "#f59e0b"], ["Margaret W.", "discharge today", "#10b981"]] }
    ];

    function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

    function renderShowcase(r) {
        var url = $("ld-sc-url"), badge = $("ld-sc-badge"), body = $("ld-sc-body");
        if (!body) return;
        if (url) url.textContent = "app.dreamshms.com/" + r.key;
        if (badge) {
            badge.style.color = r.acc;
            badge.style.backgroundColor = "color-mix(in oklab, " + r.acc + " 14%, transparent)";
            badge.innerHTML = '<span class="size-1.5 rounded-full ld-live" style="background:' + r.acc + '"></span>' + esc(r.badge);
        }
        var stats = r.stats.map(function (s) {
            return '<div class="rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50/60 dark:bg-white/5 p-3">' +
                '<p class="text-[10px] font-bold uppercase tracking-wide text-gray-400">' + esc(s[0]) + '</p>' +
                '<div class="flex items-baseline gap-1.5"><p class="text-2xl font-black text-gray-900 dark:text-white">' + esc(s[1]) + '</p>' +
                '<span class="text-[11px] font-bold" style="color:' + r.acc + '">' + esc(s[2]) + '</span></div></div>';
        }).join("");
        var maxBar = Math.max.apply(null, r.bars);
        var bars = r.bars.map(function (b, i) {
            var h = Math.round((b / maxBar) * 100);
            var op = 0.35 + (i / r.bars.length) * 0.65;
            return '<span class="ld-bar flex-1 rounded-t" style="height:' + h + '%;background:' + r.acc + ';opacity:' + op.toFixed(2) + ';animation-delay:' + (i * 60) + 'ms"></span>';
        }).join("");
        var rows = r.rows.map(function (row) {
            return '<div class="flex items-center gap-3 rounded-xl border border-gray-100 dark:border-white/10 px-3 py-2.5">' +
                '<span class="size-2 rounded-full shrink-0" style="background:' + row[2] + '"></span>' +
                '<p class="text-[13px] font-bold text-gray-800 dark:text-gray-100 flex-1 truncate">' + esc(row[0]) + '</p>' +
                '<span class="text-[11px] font-semibold text-gray-400">' + esc(row[1]) + '</span></div>';
        }).join("");
        body.innerHTML =
            '<div class="grid lg:grid-cols-5 gap-5">' +
                '<div class="lg:col-span-3 space-y-4">' +
                    '<div class="grid grid-cols-3 gap-3">' + stats + '</div>' +
                    '<div class="rounded-2xl border border-gray-100 dark:border-white/10 p-4">' +
                        '<div class="flex items-center justify-between mb-3"><p class="text-[12px] font-bold text-gray-500 dark:text-gray-400">Weekly activity</p><span class="text-[11px] font-black" style="color:' + r.acc + '">trending up</span></div>' +
                        '<div class="flex items-end gap-2 h-28">' + bars + '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="lg:col-span-2 space-y-2.5">' +
                    '<p class="text-[11px] font-bold uppercase tracking-wide text-gray-400">Live worklist</p>' +
                    rows +
                    '<a href="dashboard.html" class="mt-1 flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-[13px] font-bold text-white" style="background:' + r.acc + '">Open ' + esc(r.name) + ' dashboard<i class="icon-arrow-right text-xs"></i></a>' +
                '</div>' +
            '</div>';
    }

    var tabsWrap = $("ld-tabs");
    if (tabsWrap) {
        // NOTE: the tab strip buttons and the initial showcase panel are now
        // pre-rendered as static HTML directly in the page (see index.html)
        // instead of being built here on load. renderShowcase() is kept and
        // still runs when a tab is clicked, to keep the showcase interactive.
        tabsWrap.addEventListener("click", function (e) {
            var btn = e.target.closest("[data-i]");
            if (!btn) return;
            tabsWrap.querySelectorAll(".ld-tab").forEach(function (b) { b.classList.remove("is-active"); });
            btn.classList.add("is-active");
            renderShowcase(ROLES[+btn.dataset.i]);
        });
    }

    /* ---------- Workflow timeline, modules, stats, comparison lists and FAQ ----------
       NOTE: these are static, non-interactive sections — the workflow strip,
       module grid, highlight stats, before/after comparison lists and FAQ
       accordion — with nothing that ever re-renders them after load. They are
       now pre-rendered as static HTML directly in the page (see index.html)
       instead of being built here on load. */

    /* Refresh AOS after dynamic content is injected */
    if (window.AOS && typeof window.AOS.refreshHard === "function") window.AOS.refreshHard();
})();

// ==========================================================================
// nurse-dashboard.js
// ==========================================================================
// Dreams HMS — Nurse Command Center
// RN Amara Mensah's live shift on Ward 4B: patient workspace, medication
// rounds, vitals watch, ward map, kanban tasks, alert center, doctor
// inbox, care timelines, performance gauges, handover and activity feed.
// Every headline figure derives from the underlying lists. No API.
(function () {
    "use strict";
    if ((location.pathname.split("/").pop() || "index.html") !== "nurse-dashboard.html") return;

    const $ = (id) => document.getElementById(id);
    const esc = (v) => String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    const initials = (n) => n.split(/\s+/).slice(0, 2).map((p) => p.charAt(0).toUpperCase()).join("");
    const toast = (msg, tone) => (window.MC && MC.toast ? MC.toast(msg, tone || "info") : console.log(msg));

    /* ====================================================================
       Data — Ward 4B, morning shift (now = 10:24 AM)
       ==================================================================== */

    const NOW_MIN = 10 * 60 + 24;
    const SHIFT_START = 7 * 60, SHIFT_END = 15 * 60;

    const STEPS = [
        { name: "Shift Start", time: "7:00 AM", min: 420, icon: "icon-sunrise" },
        { name: "Medication Round", time: "8:00 AM", min: 480, icon: "icon-pill" },
        { name: "Vitals Check", time: "10:00 AM", min: 600, icon: "icon-activity" },
        { name: "Doctor Round", time: "11:30 AM", min: 690, icon: "icon-stethoscope" },
        { name: "Patient Care", time: "1:00 PM", min: 780, icon: "icon-heart-handshake" },
        { name: "Shift Handover", time: "2:45 PM", min: 885, icon: "icon-arrow-left-right" },
    ];

    const PATIENTS = [
        { id: "p1", name: "Harold Nakamura", age: 71, bed: "4B-01", dx: "CHF exacerbation", risk: "high", doctor: "Dr. Chen", allergies: ["Penicillin"], isolation: false, condition: "Fluid overload improving on IV furosemide; strict I/O charting.", vitals: { hr: { v: 96, u: "bpm", ok: true }, bp: { v: "148/92", u: "mmHg", ok: false }, temp: { v: 37.1, u: "°C", ok: true }, spo2: { v: 91, u: "%", ok: false }, rr: { v: 22, u: "/min", ok: false }, glu: { v: 6.4, u: "mmol/L", ok: true } }, taken: "10:05 AM" },
        { id: "p2", name: "Selma Björk", age: 58, bed: "4B-03", dx: "Post-op cholecystectomy", risk: "medium", doctor: "Dr. Osei", allergies: [], isolation: false, condition: "Day 1 post-op, pain 3/10, tolerating sips; mobilise this afternoon.", vitals: { hr: { v: 84, u: "bpm", ok: true }, bp: { v: "122/78", u: "mmHg", ok: true }, temp: { v: 37.6, u: "°C", ok: false }, spo2: { v: 97, u: "%", ok: true }, rr: { v: 16, u: "/min", ok: true }, glu: { v: 5.2, u: "mmol/L", ok: true } }, taken: "9:48 AM" },
        { id: "p3", name: "Dmitri Volkov", age: 44, bed: "4B-05", dx: "Cellulitis, left leg", risk: "low", doctor: "Dr. Ferreira", allergies: ["Sulfa drugs"], isolation: false, condition: "Erythema margin receding; afebrile 24h on IV flucloxacillin.", vitals: { hr: { v: 72, u: "bpm", ok: true }, bp: { v: "118/74", u: "mmHg", ok: true }, temp: { v: 36.8, u: "°C", ok: true }, spo2: { v: 99, u: "%", ok: true }, rr: { v: 14, u: "/min", ok: true }, glu: { v: 5.0, u: "mmol/L", ok: true } }, taken: "9:30 AM" },
        { id: "p4", name: "Rosa Delgado", age: 82, bed: "4B-07", dx: "CAP + delirium", risk: "high", doctor: "Dr. Chen", allergies: ["Codeine", "Latex"], isolation: true, condition: "Droplet precautions. Intermittent confusion overnight — falls mat in place.", vitals: { hr: { v: 104, u: "bpm", ok: false }, bp: { v: "104/62", u: "mmHg", ok: true }, temp: { v: 38.4, u: "°C", ok: false }, spo2: { v: 93, u: "%", ok: false }, rr: { v: 24, u: "/min", ok: false }, glu: { v: 7.1, u: "mmol/L", ok: true } }, taken: "10:12 AM" },
    ];

    const RISK_META = { high: { label: "High Risk", tone: "ns-rose" }, medium: { label: "Medium", tone: "ns-amber" }, low: { label: "Stable", tone: "ns-emerald" } };

    let MEDS = [
        { time: "10:30 AM", min: 630, patient: "Rosa Delgado", bed: "4B-07", drug: "Ceftriaxone 1 g IV", status: "upcoming", priority: true, controlled: false, verify: "Pharmacy verified" },
        { time: "10:45 AM", min: 645, patient: "Harold Nakamura", bed: "4B-01", drug: "Furosemide 40 mg IV", status: "upcoming", priority: true, controlled: false, verify: "Pharmacy verified" },
        { time: "11:00 AM", min: 660, patient: "Selma Björk", bed: "4B-03", drug: "Oxycodone 5 mg PO", status: "upcoming", priority: false, controlled: true, verify: "Second signature required" },
        { time: "12:00 PM", min: 720, patient: "Theo Lindqvist", bed: "4B-09", drug: "Insulin glargine 18 u SC", status: "upcoming", priority: false, controlled: false, verify: "Pharmacy verified" },
        { time: "12:00 PM", min: 720, patient: "Dmitri Volkov", bed: "4B-05", drug: "Flucloxacillin 1 g IV", status: "upcoming", priority: false, controlled: false, verify: "Pharmacy verified" },
        { time: "8:00 AM", min: 480, patient: "Harold Nakamura", bed: "4B-01", drug: "Bisoprolol 5 mg PO", status: "done", priority: false, controlled: false, verify: "Double-checked" },
        { time: "8:05 AM", min: 485, patient: "Rosa Delgado", bed: "4B-07", drug: "Paracetamol 1 g PO", status: "done", priority: false, controlled: false, verify: "Double-checked" },
        { time: "8:15 AM", min: 495, patient: "Margaret Whitfield", bed: "4B-11", drug: "Enoxaparin 40 mg SC", status: "done", priority: false, controlled: false, verify: "Double-checked" },
        { time: "8:20 AM", min: 500, patient: "Theo Lindqvist", bed: "4B-09", drug: "Insulin aspart 6 u SC", status: "done", priority: false, controlled: false, verify: "Double-checked" },
        { time: "9:00 AM", min: 540, patient: "Selma Björk", bed: "4B-03", drug: "Ondansetron 4 mg IV", status: "missed", priority: false, controlled: false, verify: "Patient in imaging — rebook" },
    ];

    const BEDS = [
        { n: "01", state: "occupied", who: "Harold Nakamura" }, { n: "02", state: "available" },
        { n: "03", state: "occupied", who: "Selma Björk" }, { n: "04", state: "cleaning" },
        { n: "05", state: "occupied", who: "Dmitri Volkov" }, { n: "06", state: "available" },
        { n: "07", state: "isolation", who: "Rosa Delgado" }, { n: "08", state: "emergency", who: "Incoming — ED transfer" },
        { n: "09", state: "occupied", who: "Theo Lindqvist" }, { n: "10", state: "cleaning" },
        { n: "11", state: "discharge", who: "Margaret Whitfield" }, { n: "12", state: "available" },
    ];
    const BED_META = {
        available: { label: "Available", cls: "is-available", icon: "" },
        occupied: { label: "Occupied", cls: "is-occupied", icon: "" },
        cleaning: { label: "Cleaning", cls: "is-cleaning", icon: "icon-spray-can" },
        isolation: { label: "Isolation", cls: "is-isolation", icon: "icon-shield-alert" },
        emergency: { label: "Emergency", cls: "is-emergency", icon: "icon-siren" },
        discharge: { label: "Discharge today", cls: "is-discharge", icon: "icon-log-out" },
    };

    let TASKS = [
        { id: "t1", patient: "Rosa Delgado", text: "Repeat blood cultures before next dose", pri: "High", time: "10:30 AM", nurse: "Amara M.", lane: "pending" },
        { id: "t2", patient: "Harold Nakamura", text: "Daily weight + strict fluid balance", pri: "High", time: "11:00 AM", nurse: "Amara M.", lane: "pending" },
        { id: "t3", patient: "Margaret Whitfield", text: "Discharge checklist + TTO meds teaching", pri: "Medium", time: "1:30 PM", nurse: "Jonas P.", lane: "pending" },
        { id: "t4", patient: "Selma Björk", text: "First mobilisation with physio", pri: "Medium", time: "In progress", nurse: "Priya K.", lane: "progress" },
        { id: "t5", patient: "Theo Lindqvist", text: "Step glucose checks to 4-hourly", pri: "Low", time: "In progress", nurse: "Amara M.", lane: "progress" },
        { id: "t6", patient: "Dmitri Volkov", text: "Mark cellulitis margin, photo for notes", pri: "Low", time: "9:10 AM", nurse: "Jonas P.", lane: "done" },
        { id: "t7", patient: "Rosa Delgado", text: "Falls risk reassessment", pri: "High", time: "8:40 AM", nurse: "Amara M.", lane: "done" },
        { id: "t8", patient: "Harold Nakamura", text: "8 AM electrolytes — lab draw", pri: "High", time: "Due 8:00 AM", nurse: "Priya K.", lane: "delayed" },
    ];
    const LANES = [
        { key: "pending", label: "Pending", tone: "ns-amber" },
        { key: "progress", label: "In Progress", tone: "ns-cyan" },
        { key: "done", label: "Completed", tone: "ns-emerald" },
        { key: "delayed", label: "Delayed", tone: "ns-rose" },
    ];
    const PRI_TONE = { High: "ns-rose", Medium: "ns-amber", Low: "ns-emerald" };

    let ALERTS = [
        { id: "a1", kind: "Code Blue", code: true, icon: "icon-siren", tone: "ns-rose", text: "Ward 3A — resuscitation team responding. 4B on standby for overflow.", time: "10:18 AM" },
        { id: "a2", kind: "Critical Patient", icon: "icon-heart-pulse", tone: "ns-rose", text: "Rosa Delgado (4B-07) — temp 38.4°C, RR 24. Sepsis screen started.", time: "10:12 AM" },
        { id: "a3", kind: "Fall Risk", icon: "icon-person-standing", tone: "ns-amber", text: "Rosa Delgado attempted to stand unassisted overnight. Bed-exit alarm on.", time: "9:55 AM" },
        { id: "a4", kind: "Medication Delay", icon: "icon-pill", tone: "ns-amber", text: "Ondansetron for Selma Björk missed — patient in imaging. Rebook now.", time: "9:20 AM" },
    ];

    let INBOX = [
        { id: "r1", kind: "New Order", icon: "icon-file-plus", tone: "ns-cyan", from: "Dr. Chen", text: "Increase furosemide to 40 mg BD for Harold Nakamura — recheck U&E at 4 PM.", time: "10:15 AM" },
        { id: "r2", kind: "Lab Request", icon: "icon-flask-conical", tone: "ns-violet", from: "Dr. Chen", text: "Blood cultures ×2 for Rosa Delgado before next antibiotic dose.", time: "10:10 AM" },
        { id: "r3", kind: "Pending Instruction", icon: "icon-clock", tone: "ns-amber", from: "Dr. Osei", text: "Confirm oral intake for Selma Björk before switching analgesia to PO.", time: "9:40 AM" },
    ];

    const CARE = {
        p1: [
            { time: "10:05 AM", icon: "icon-activity", tone: "ns-teal", text: "Vitals recorded — BP 148/92, SpO₂ 91% on 2 L" },
            { time: "9:30 AM", icon: "icon-droplets", tone: "ns-cyan", text: "Fluid balance updated — net −850 mL since midnight" },
            { time: "8:00 AM", icon: "icon-pill", tone: "ns-violet", text: "Bisoprolol 5 mg given with obs check" },
            { time: "7:20 AM", icon: "icon-clipboard-list", tone: "ns-amber", text: "Night shift notes reviewed at bedside handover" },
        ],
        p4: [
            { time: "10:12 AM", icon: "icon-activity", tone: "ns-rose", text: "Vitals recorded — febrile 38.4°C, escalated to Dr. Chen" },
            { time: "9:55 AM", icon: "icon-person-standing", tone: "ns-amber", text: "Fall-risk reassessed — bed-exit alarm activated" },
            { time: "8:45 AM", icon: "icon-flask-conical", tone: "ns-violet", text: "Lab sample collected — FBC, CRP, lactate" },
            { time: "8:05 AM", icon: "icon-pill", tone: "ns-violet", text: "Paracetamol 1 g given for pyrexia" },
            { time: "7:30 AM", icon: "icon-utensils", tone: "ns-emerald", text: "Breakfast served — soft diet, 40% taken with assistance" },
            { time: "7:00 AM", icon: "icon-clipboard-list", tone: "ns-amber", text: "Night shift handover reviewed — confused ×2 overnight, settled with reorientation" },
        ],
        p2: [
            { time: "9:48 AM", icon: "icon-activity", tone: "ns-teal", text: "Vitals recorded — low-grade temp 37.6°C, monitoring" },
            { time: "9:15 AM", icon: "icon-stethoscope", tone: "ns-cyan", text: "Dr. Osei reviewed wound — dressing dry and intact" },
            { time: "8:30 AM", icon: "icon-accessibility", tone: "ns-emerald", text: "Physiotherapy — sat out of bed 20 min, tolerated well" },
            { time: "7:45 AM", icon: "icon-pen-line", tone: "ns-amber", text: "Shift note — pain 3/10 on movement, PRN charted" },
        ],
    };

    const PERF = [
        { label: "Patients Managed", val: 6, max: 6, tone: "ns-teal", icon: "icon-users" },
        { label: "Tasks Completed", val: 9, max: 14, tone: "ns-emerald", icon: "icon-list-checks" },
        { label: "Meds Given", val: 4, max: 10, tone: "ns-violet", icon: "icon-pill" },
        { label: "Avg Response", val: "3.2m", pct: 82, tone: "ns-cyan", icon: "icon-timer", sub: "target < 5m" },
        { label: "Pending Tasks", val: 3, max: 14, tone: "ns-amber", icon: "icon-hourglass", invert: true },
        { label: "Vitals On Time", val: "94%", pct: 94, tone: "ns-rose", icon: "icon-activity" },
    ];

    const HANDOVER = [
        { kind: "Outgoing Notes", tone: "ns-violet", icon: "icon-log-out", items: ["Rosa Delgado sepsis screen in progress — cultures before 10:30 dose", "Harold Nakamura on strict I/O; daily weight pending"] },
        { kind: "Incoming Notes", tone: "ns-cyan", icon: "icon-log-in", items: ["Night shift reported Rosa confused ×2, settled with reorientation", "Theo's insulin infusion stopped 6 AM — watch pre-lunch glucose"] },
        { kind: "Critical Patients", tone: "ns-rose", icon: "icon-heart-pulse", items: ["Rosa Delgado (4B-07) — febrile, delirium, isolation", "Harold Nakamura (4B-01) — SpO₂ 91%, on diuresis"] },
        { kind: "Special Instructions", tone: "ns-amber", icon: "icon-badge-alert", items: ["Controlled drug check due 2 PM — two signatures", "PPE audit for isolation bay at 1 PM", "Margaret Whitfield family collecting at 3 PM"] },
    ];

    let ACTIVITY = [
        { time: "10:18 AM", cat: "Alerts", icon: "icon-siren", tone: "ns-rose", text: "Code Blue announced on 3A — 4B standby acknowledged" },
        { time: "10:15 AM", cat: "Orders", icon: "icon-file-plus", tone: "ns-cyan", text: "New order from Dr. Chen — furosemide increased for 4B-01" },
        { time: "10:12 AM", cat: "Vitals", icon: "icon-activity", tone: "ns-teal", text: "Vitals charted for Rosa Delgado — escalated for fever" },
        { time: "10:05 AM", cat: "Vitals", icon: "icon-activity", tone: "ns-teal", text: "Vitals charted for Harold Nakamura" },
        { time: "9:52 AM", cat: "Labs", icon: "icon-flask-conical", tone: "ns-violet", text: "Lab porter collected morning bloods (5 patients)" },
        { time: "9:45 AM", cat: "Meds", icon: "icon-pill", tone: "ns-violet", text: "Missed dose flagged — ondansetron for 4B-03 rebooked" },
        { time: "9:30 AM", cat: "Transfers", icon: "icon-bed", tone: "ns-amber", text: "Bed 4B-04 released to cleaning after transfer to 2C" },
        { time: "9:10 AM", cat: "Discharges", icon: "icon-log-out", tone: "ns-emerald", text: "Discharge started for Margaret Whitfield — TTOs to pharmacy" },
        { time: "8:20 AM", cat: "Meds", icon: "icon-pill", tone: "ns-violet", text: "Morning medication round completed — 4 of 4 given" },
        { time: "7:05 AM", cat: "Orders", icon: "icon-clipboard-list", tone: "ns-cyan", text: "Bedside handover completed — 6 patients accepted" },
    ];

    /* ====================================================================
       Renderers
       ==================================================================== */

    function fmtLeft(mins) {
        const h = Math.floor(mins / 60), m = mins % 60;
        return (h ? h + "h " : "") + m + "m";
    }

    function renderHero() {
        const occupiedMine = PATIENTS.length;
        $("fact-beds").textContent = BEDS.filter((b) => b.state !== "available").length + " of " + BEDS.length;
        $("fact-patients").textContent = occupiedMine + " assigned";
        $("fact-meds").textContent = MEDS.filter((m) => m.status === "upcoming" && m.min <= NOW_MIN + 60).length + " due";
        $("fact-risk").textContent = PATIENTS.filter((p) => p.risk === "high").length + " watch";

        const pct = Math.min(1, Math.max(0, (NOW_MIN - SHIFT_START) / (SHIFT_END - SHIFT_START)));
        const C = 2 * Math.PI * 52;
        const fill = $("count-fill");
        fill.setAttribute("stroke-dasharray", C.toFixed(1));
        fill.setAttribute("stroke-dashoffset", (C * (1 - pct)).toFixed(1));
        $("count-left").textContent = fmtLeft(SHIFT_END - NOW_MIN);

        const strip = $("code-strip");
        const code = ALERTS.find((a) => a.code);
        if (code) {
            strip.classList.add("is-alert");
            strip.innerHTML =
                '<span class="grid size-9 shrink-0 place-items-center rounded-xl bg-rose-500/25 text-rose-200"><i class="icon-siren" aria-hidden="true"></i></span>' +
                '<div class="min-w-0 flex-1"><p class="text-xs font-extrabold uppercase tracking-wider text-rose-200">Emergency status — ' + esc(code.kind) + "</p>" +
                '<p class="mt-0.5 text-xs font-medium text-white/70">' + esc(code.text) + "</p></div>" +
                '<button type="button" id="btn-standby" class="ns-action shrink-0"><i class="icon-check" aria-hidden="true"></i>Acknowledge</button>';
            $("btn-standby").addEventListener("click", () => {
                ALERTS = ALERTS.filter((a) => !a.code);
                renderHero();
                renderAlerts();
                toast("Code Blue standby acknowledged for Ward 4B.", "success");
            });
        } else {
            strip.classList.remove("is-alert");
            strip.innerHTML =
                '<span class="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-400/20 text-emerald-200"><i class="icon-shield-check" aria-hidden="true"></i></span>' +
                '<div class="min-w-0 flex-1"><p class="text-xs font-extrabold uppercase tracking-wider text-emerald-200">Emergency status — all clear</p>' +
                '<p class="mt-0.5 text-xs font-medium text-white/70">No active codes on Ward 4B. Crash trolley checked 7:10 AM · next check 7:00 PM.</p></div>';
        }
    }

    function renderSteps() {
        let current = 0;
        STEPS.forEach((s, i) => { if (s.min <= NOW_MIN) current = i; });
        $("steps").innerHTML = STEPS.map((s, i) => {
            const state = i < current ? "is-done" : i === current ? "is-now" : "";
            return (
                '<li class="ns-step ' + state + '">' +
                '<span class="ns-step-node"><i class="' + s.icon + '" aria-hidden="true"></i></span>' +
                '<div><p class="ns-step-name">' + esc(s.name) + '</p><p class="ns-step-time">' + esc(s.time) + "</p></div>" +
                (i === current ? '<span class="ns-chip ns-cyan">Now</span>' : "") +
                "</li>"
            );
        }).join("");
        $("steps-chip").textContent = STEPS[current].name + " in progress";
    }

    let riskFilter = "all";
    function renderPatients() {
        const list = PATIENTS.filter((p) => riskFilter === "all" || p.risk === riskFilter);
        $("patients").innerHTML = list.map((p) => {
            const r = RISK_META[p.risk];
            const abn = Object.values(p.vitals).filter((v) => !v.ok).length;
            return (
                '<article class="ns-pt risk-' + p.risk + '">' +
                '<div class="flex items-start gap-3">' +
                '<span class="ns-pt-avatar">' + esc(initials(p.name)) + "</span>" +
                '<div class="min-w-0 flex-1">' +
                '<div class="flex items-center gap-2"><h3 class="truncate text-[13px] font-extrabold text-gray-900">' + esc(p.name) + '</h3><span class="ns-pt-bed"><i class="icon-bed text-[10px]" aria-hidden="true"></i>' + esc(p.bed) + "</span></div>" +
                '<p class="mt-0.5 text-[11px] font-semibold text-gray-500">' + p.age + " yrs · " + esc(p.dx) + " · " + esc(p.doctor) + "</p>" +
                '<div class="mt-1.5 flex flex-wrap gap-1">' +
                '<span class="ns-pt-tag ' + r.tone + ' ns-chip">' + r.label + "</span>" +
                (p.isolation ? '<span class="ns-pt-tag ns-violet ns-chip"><i class="icon-shield-alert text-[9px]" aria-hidden="true"></i>Isolation</span>' : "") +
                (p.allergies.length ? '<span class="ns-pt-tag ns-rose ns-chip"><i class="icon-triangle-alert text-[9px]" aria-hidden="true"></i>' + esc(p.allergies.join(", ")) + "</span>" : '<span class="ns-pt-tag ns-emerald ns-chip">No allergies</span>') +
                (abn ? '<span class="ns-pt-tag ns-rose ns-chip">' + abn + " abnormal vitals</span>" : "") +
                "</div>" +
                '<p class="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-gray-500">' + esc(p.condition) + "</p>" +
                "</div></div>" +
                '<div class="ns-pt-actions" role="group" aria-label="Actions for ' + esc(p.name) + '">' +
                '<button type="button" class="ns-pt-btn" data-act="view" data-p="' + p.id + '" title="View patient" aria-label="View patient"><i class="icon-eye" aria-hidden="true"></i></button>' +
                '<button type="button" class="ns-pt-btn" data-act="vitals" data-p="' + p.id + '" title="Record vitals" aria-label="Record vitals"><i class="icon-activity" aria-hidden="true"></i></button>' +
                '<button type="button" class="ns-pt-btn" data-act="med" data-p="' + p.id + '" title="Administer medicine" aria-label="Administer medicine"><i class="icon-pill" aria-hidden="true"></i></button>' +
                '<button type="button" class="ns-pt-btn" data-act="call" data-p="' + p.id + '" title="Call doctor" aria-label="Call doctor"><i class="icon-phone" aria-hidden="true"></i></button>' +
                '<button type="button" class="ns-pt-btn" data-act="note" data-p="' + p.id + '" title="Add nursing note" aria-label="Add nursing note"><i class="icon-pen-line" aria-hidden="true"></i></button>' +
                '<span class="ml-auto text-[10px] font-semibold text-gray-400 tabular-nums">Obs ' + esc(p.taken) + "</span>" +
                "</div></article>"
            );
        }).join("") || '<p class="col-span-full py-6 text-center text-xs font-semibold text-gray-400">No patients match this filter.</p>';
    }

    const VITAL_DEFS = [
        { k: "hr", label: "Heart Rate", icon: "icon-heart-pulse", color: "var(--ns-rose)", spark: [72, 78, 84, 80, 88, 92, 96] },
        { k: "bp", label: "Blood Pressure", icon: "icon-gauge", color: "var(--ns-violet)", spark: [70, 72, 68, 74, 76, 75, 78] },
        { k: "temp", label: "Temperature", icon: "icon-thermometer", color: "var(--ns-amber)", spark: [50, 52, 55, 54, 58, 60, 57] },
        { k: "spo2", label: "SpO₂", icon: "icon-wind", color: "var(--ns-cyan)", spark: [88, 86, 84, 85, 82, 80, 78] },
        { k: "rr", label: "Respiration", icon: "icon-waves", color: "var(--ns-teal)", spark: [40, 42, 45, 44, 48, 50, 52] },
        { k: "glu", label: "Blood Sugar", icon: "icon-droplet", color: "var(--ns-emerald)", spark: [60, 58, 55, 52, 50, 48, 46] },
    ];

    function sparkPath(pts) {
        const w = 64, h = 22, min = Math.min(...pts), max = Math.max(...pts), span = max - min || 1;
        return pts.map((p, i) => (i ? "L" : "M") + ((i / (pts.length - 1)) * w).toFixed(1) + " " + (h - ((p - min) / span) * (h - 4) - 2).toFixed(1)).join(" ");
    }

    function renderVitals() {
        const p = PATIENTS.find((x) => x.id === $("vitals-sel").value) || PATIENTS[0];
        $("vitals").innerHTML = VITAL_DEFS.map((d) => {
            const v = p.vitals[d.k];
            return (
                '<div class="ns-vital' + (v.ok ? "" : " is-abnormal") + '" style="--ns-v:' + d.color + '">' +
                '<div class="flex items-center justify-between"><span class="ns-vital-icon"><i class="' + d.icon + '" aria-hidden="true"></i></span>' +
                (v.ok ? "" : '<span class="ns-chip ns-rose text-[9px]">Abnormal</span>') + "</div>" +
                '<p class="mt-2 ns-vital-val">' + esc(v.v) + ' <span class="text-[10px] font-bold text-gray-400">' + esc(v.u) + "</span></p>" +
                '<div class="mt-1 flex items-end justify-between"><p class="text-[10px] font-bold text-gray-400">' + d.label + "</p>" +
                '<svg width="64" height="22" viewBox="0 0 64 22" aria-hidden="true"><path class="ns-spark" d="' + sparkPath(d.spark) + '"/></svg></div>' +
                "</div>"
            );
        }).join("");
        const abn = Object.values(p.vitals).filter((v) => !v.ok).length;
        $("vitals-chip").textContent = abn ? abn + " flagged" : "All normal";
        $("vitals-when").textContent = p.taken + " · " + p.name.split(" ")[0];
    }

    let medTab = "upcoming";
    const MED_TABS = [
        { key: "upcoming", label: "Upcoming", tone: "ns-cyan" },
        { key: "done", label: "Completed", tone: "ns-emerald" },
        { key: "missed", label: "Missed", tone: "ns-rose" },
    ];

    function renderMeds() {
        $("med-tabs").innerHTML = MED_TABS.map((t) => {
            const n = MEDS.filter((m) => m.status === t.key).length;
            return '<button type="button" role="tab" aria-selected="' + (medTab === t.key) + '" data-tab="' + t.key + '" class="ns-chip ' + t.tone + " cursor-pointer" + (medTab === t.key ? "" : " opacity-50") + '">' + t.label + " · " + n + "</button>";
        }).join("");

        const list = MEDS.filter((m) => m.status === medTab).sort((a, b) => a.min - b.min);
        $("meds").innerHTML = list.map((m, i) => {
            const due = m.status === "upcoming" && m.min - NOW_MIN <= 30;
            const tone = m.status === "missed" ? "ns-rose" : m.controlled ? "ns-violet" : m.priority ? "ns-amber" : "ns-teal";
            return (
                '<div class="ns-med ' + tone + (due ? " is-due" : "") + '">' +
                '<span class="ns-med-dot"><i class="' + (m.status === "done" ? "icon-check" : m.status === "missed" ? "icon-x" : "icon-clock") + '" aria-hidden="true"></i></span>' +
                '<div class="ns-med-card"><div class="flex flex-wrap items-center gap-x-2 gap-y-1">' +
                '<p class="text-[11px] font-extrabold text-gray-900 tabular-nums">' + esc(m.time) + "</p>" +
                (m.priority ? '<span class="ns-chip ns-amber text-[9px]"><i class="icon-zap text-[9px]" aria-hidden="true"></i>High priority</span>' : "") +
                (m.controlled ? '<span class="ns-cd"><i class="icon-lock text-[9px]" aria-hidden="true"></i>Controlled</span>' : "") +
                (m.status === "upcoming" ? '<button type="button" data-give="' + MEDS.indexOf(m) + '" class="ml-auto rounded-lg bg-teal-500/10 px-2 py-1 text-[10px] font-extrabold text-teal-600 transition-colors hover:bg-teal-500/20 dark:text-teal-300">Give now</button>' : "") +
                "</div>" +
                '<p class="mt-1 text-xs font-bold text-gray-800 dark:text-gray-200">' + esc(m.drug) + "</p>" +
                '<p class="mt-0.5 text-[11px] font-semibold text-gray-500">' + esc(m.patient) + " · " + esc(m.bed) + '</p>' +
                '<p class="mt-1 text-[10px] font-semibold text-gray-400"><i class="icon-badge-check text-[10px]" aria-hidden="true"></i> ' + esc(m.verify) + "</p>" +
                "</div></div>"
            );
        }).join("") || '<p class="py-6 text-center text-xs font-semibold text-gray-400">Nothing here — round is clear.</p>';

        const stats = [
            { label: "Given", n: MEDS.filter((m) => m.status === "done").length, tone: "ns-emerald", icon: "icon-check" },
            { label: "Due < 1 hr", n: MEDS.filter((m) => m.status === "upcoming" && m.min <= NOW_MIN + 60).length, tone: "ns-amber", icon: "icon-clock" },
            { label: "Missed", n: MEDS.filter((m) => m.status === "missed").length, tone: "ns-rose", icon: "icon-x" },
            { label: "Controlled", n: MEDS.filter((m) => m.controlled && m.status !== "done").length, tone: "ns-violet", icon: "icon-lock" },
        ];
        $("med-stats").innerHTML = stats.map((s) =>
            '<div class="ns-panel ' + s.tone + ' !flex-row items-center gap-2.5 !rounded-2xl p-2.5"><span class="ns-panel-icon !size-8 text-xs"><i class="' + s.icon + '" aria-hidden="true"></i></span><div><p class="text-base font-extrabold leading-none text-gray-900 tabular-nums">' + s.n + '</p><p class="mt-0.5 text-[10px] font-bold text-gray-400">' + s.label + "</p></div></div>"
        ).join("");
    }

    function renderWard() {
        $("ward").innerHTML = BEDS.map((b) => {
            const m = BED_META[b.state];
            return '<div class="ns-bed ' + m.cls + '" title="' + esc("Bed " + b.n + " — " + m.label + (b.who ? " · " + b.who : "")) + '">' + b.n + (m.icon ? '<span class="ns-bed-flag"><i class="' + m.icon + '" aria-hidden="true"></i></span>' : "") + "</div>";
        }).join("");
        $("ward-legend").innerHTML = Object.values(BED_META).map((m) =>
            '<span class="inline-flex items-center gap-1.5 text-[10px] font-bold text-gray-500"><span class="ns-bed ' + m.cls + ' !aspect-auto !size-3 !rounded"></span>' + m.label + "</span>"
        ).join("");
        const occ = BEDS.filter((b) => b.state !== "available" && b.state !== "cleaning").length;
        $("ward-chip").textContent = Math.round((occ / BEDS.length) * 100) + "% occupied";
        const sum = [
            { label: "Free now", n: BEDS.filter((b) => b.state === "available").length, tone: "text-emerald-500" },
            { label: "Turning over", n: BEDS.filter((b) => b.state === "cleaning").length, tone: "text-amber-500" },
            { label: "Leaving today", n: BEDS.filter((b) => b.state === "discharge").length, tone: "text-gray-400" },
        ];
        $("ward-summary").innerHTML = sum.map((s) =>
            '<div class="rounded-xl bg-gray-50 p-2.5 text-center dark:bg-white/5"><p class="text-lg font-extrabold tabular-nums ' + s.tone + '">' + s.n + '</p><p class="text-[10px] font-bold text-gray-400">' + s.label + "</p></div>"
        ).join("");
    }

    function renderKanban() {
        $("kanban").innerHTML = LANES.map((l) => {
            const items = TASKS.filter((t) => t.lane === l.key);
            return (
                '<div class="ns-lane ' + l.tone + '"><div class="mb-2 flex items-center justify-between px-1">' +
                '<p class="text-[11px] font-extrabold uppercase tracking-wider text-gray-500">' + l.label + '</p><span class="ns-chip ' + l.tone + '">' + items.length + "</span></div>" +
                '<div class="ns-lane-items" data-lane="' + l.key + '">' +
                (items.map((t) => (
                    '<div class="ns-task" draggable="true" data-task="' + t.id + '"><div class="flex items-center gap-1.5">' +
                    '<span class="ns-chip ' + PRI_TONE[t.pri] + ' text-[9px]">' + t.pri + "</span>" +
                    '<span class="ml-auto text-[10px] font-semibold text-gray-400 tabular-nums">' + esc(t.time) + "</span></div>" +
                    '<p class="mt-1.5 text-xs font-bold text-gray-800 dark:text-gray-200">' + esc(t.text) + "</p>" +
                    '<div class="mt-1.5 flex items-center justify-between"><p class="text-[10px] font-semibold text-gray-500"><i class="icon-user text-[10px]" aria-hidden="true"></i> ' + esc(t.patient) + "</p>" +
                    '<span class="text-[10px] font-bold text-gray-400">' + esc(t.nurse) + "</span></div>" +
                    (t.lane !== "done" ? '<button type="button" data-done="' + t.id + '" class="mt-2 w-full rounded-lg bg-emerald-500/10 py-1 text-[10px] font-extrabold text-emerald-600 transition-colors hover:bg-emerald-500/20 dark:text-emerald-300">Mark complete</button>' : "") +
                    "</div>"
                )).join("") || '<p class="py-4 text-center text-[10px] font-semibold text-gray-400">Empty</p>') +
                "</div></div>"
            );
        }).join("");
        const open = TASKS.filter((t) => t.lane !== "done").length;
        $("tasks-chip").textContent = open + " open · " + TASKS.filter((t) => t.lane === "delayed").length + " delayed";
    }

    function renderAlerts() {
        $("alerts").innerHTML = ALERTS.map((a) => (
            '<div class="ns-alert ' + a.tone + (a.code ? " is-code" : "") + '">' +
            '<span class="ns-panel-icon !size-8 shrink-0 text-xs"><i class="' + a.icon + '" aria-hidden="true"></i></span>' +
            '<div class="min-w-0 flex-1"><div class="flex items-center gap-2"><p class="text-[11px] font-extrabold text-gray-900">' + esc(a.kind) + '</p><span class="ml-auto text-[10px] font-semibold text-gray-400 tabular-nums">' + esc(a.time) + "</span></div>" +
            '<p class="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-gray-500">' + esc(a.text) + "</p></div>" +
            '<button type="button" data-ack="' + a.id + '" class="shrink-0 self-center rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10" aria-label="Acknowledge alert"><i class="icon-check text-xs" aria-hidden="true"></i></button>' +
            "</div>"
        )).join("") || '<div class="grid place-items-center py-8 text-center"><span class="grid size-12 place-items-center rounded-2xl bg-emerald-500/10 text-lg text-emerald-500"><i class="icon-shield-check" aria-hidden="true"></i></span><p class="mt-3 text-xs font-bold text-gray-500">All alerts acknowledged</p><p class="text-[10px] text-gray-400">Ward 4B is quiet — nice work.</p></div>';
    }

    function renderInbox() {
        $("inbox").innerHTML = INBOX.map((r) => (
            '<div class="ns-alert ' + r.tone + '"><span class="ns-panel-icon !size-8 shrink-0 text-xs"><i class="' + r.icon + '" aria-hidden="true"></i></span>' +
            '<div class="min-w-0 flex-1"><div class="flex items-center gap-2"><span class="ns-chip ' + r.tone + ' text-[9px]">' + esc(r.kind) + '</span><p class="text-[11px] font-extrabold text-gray-900">' + esc(r.from) + '</p><span class="ml-auto text-[10px] font-semibold text-gray-400 tabular-nums">' + esc(r.time) + "</span></div>" +
            '<p class="mt-1 text-[11px] leading-relaxed text-gray-500">' + esc(r.text) + "</p>" +
            '<button type="button" data-accept="' + r.id + '" class="mt-1.5 text-[10px] font-extrabold text-primary hover:underline">Accept &amp; action</button></div></div>'
        )).join("") || '<p class="py-8 text-center text-xs font-semibold text-gray-400">Inbox zero — no pending requests.</p>';
        $("inbox-chip").textContent = INBOX.length + " pending";
    }

    function renderCare() {
        const list = CARE.p4 || [];
        $("care").innerHTML = list.map((c) => (
            '<div class="ns-tl ' + c.tone + '"><span class="ns-tl-icon"><i class="' + c.icon + '" aria-hidden="true"></i></span>' +
            '<div class="min-w-0 flex-1 pb-1"><p class="text-[10px] font-bold text-gray-400 tabular-nums">' + esc(c.time) + "</p>" +
            '<p class="mt-0.5 text-[11px] font-semibold leading-relaxed text-gray-700 dark:text-gray-300">' + esc(c.text) + "</p></div></div>"
        )).join("");
    }

    function renderPerf() {
        $("perf").innerHTML = PERF.map((g) => {
            const pct = g.pct != null ? g.pct : Math.round((g.val / g.max) * 100);
            const shown = g.invert ? 100 - pct : pct;
            const C = 2 * Math.PI * 26;
            return (
                '<div class="ns-gauge ' + g.tone + ' flex-col gap-1.5 rounded-2xl border border-border-color p-3 dark:border-white/10">' +
                '<div class="relative"><svg class="ns-gauge-ring" viewBox="0 0 64 64"><circle class="ns-gauge-track" cx="32" cy="32" r="26" fill="none" stroke="currentColor" stroke-width="5"/>' +
                '<circle class="ns-gauge-fill" cx="32" cy="32" r="26" fill="none" stroke-width="5" stroke-linecap="round" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + (C * (1 - shown / 100)).toFixed(1) + '"/></svg>' +
                '<span class="ns-gauge-label">' + esc(g.max != null ? g.val + "/" + g.max : g.val) + "</span></div>" +
                '<p class="text-center text-[10px] font-extrabold text-gray-500">' + g.label + (g.sub ? '<br><span class="font-semibold text-gray-400">' + g.sub + "</span>" : "") + "</p></div>"
            );
        }).join("");
        $("sat-val").textContent = "4.6 / 5";
        requestAnimationFrame(() => ($("sat-bar").style.width = "92%"));
    }

    function renderHandover() {
        $("handover").innerHTML = HANDOVER.map((h) => (
            '<div class="ns-hand ' + h.tone + '"><div class="flex items-center gap-2"><span class="ns-panel-icon !size-7 text-[11px]"><i class="' + h.icon + '" aria-hidden="true"></i></span>' +
            '<p class="text-[11px] font-extrabold uppercase tracking-wider text-gray-500">' + h.kind + '</p><span class="ml-auto ns-chip ' + h.tone + '">' + h.items.length + "</span></div>" +
            '<ul class="mt-2.5 space-y-1.5">' + h.items.map((t) => '<li class="flex gap-2 text-[11px] font-semibold leading-relaxed text-gray-600 dark:text-gray-300"><i class="icon-corner-down-right mt-0.5 shrink-0 text-[10px] text-gray-300" aria-hidden="true"></i>' + esc(t) + "</li>").join("") + "</ul></div>"
        )).join("");
    }

    let actFilter = "All";
    function renderActivity() {
        const cats = ["All"].concat([...new Set(ACTIVITY.map((a) => a.cat))]);
        $("act-filters").innerHTML = cats.map((c) =>
            '<button type="button" data-cat="' + c + '" aria-pressed="' + (actFilter === c) + '" class="ns-chip ns-cyan cursor-pointer' + (actFilter === c ? "" : " opacity-50") + '">' + c + "</button>"
        ).join("");
        $("activity").innerHTML = ACTIVITY.filter((a) => actFilter === "All" || a.cat === actFilter).map((a) => (
            '<div class="ns-tl ' + a.tone + '"><span class="ns-tl-icon"><i class="' + a.icon + '" aria-hidden="true"></i></span>' +
            '<div class="min-w-0 flex-1 pb-1"><div class="flex items-center gap-2"><span class="ns-chip ' + a.tone + ' text-[9px]">' + a.cat + '</span><span class="text-[10px] font-semibold text-gray-400 tabular-nums">' + esc(a.time) + "</span></div>" +
            '<p class="mt-1 text-[11px] font-semibold leading-relaxed text-gray-700 dark:text-gray-300">' + esc(a.text) + "</p></div></div>"
        )).join("");
    }

    /* ====================================================================
       Wiring
       ==================================================================== */

    function pName(id) { return (PATIENTS.find((p) => p.id === id) || {}).name || ""; }

    function init() {
        // NOTE: the patient selector options, shift steps, patient workspace,
        // vitals, medication rounds, ward map, kanban board, alerts, doctor
        // inbox, care timeline, performance gauges, handover panels and
        // activity feed are now pre-rendered as static HTML directly in the
        // page (see nurse-dashboard.html) instead of being built here on
        // load. The render*() functions above are kept and still run on
        // demand from the event handlers below (filters, tabs, give/complete,
        // drag-drop, etc.) to keep every widget fully interactive after the
        // initial paint.
        renderHero();

        $("vitals-sel").addEventListener("change", renderVitals);

        // Risk filter chips
        document.querySelectorAll("[data-risk]").forEach((b) =>
            b.addEventListener("click", () => {
                riskFilter = b.dataset.risk;
                document.querySelectorAll("[data-risk]").forEach((x) => {
                    const on = x.dataset.risk === riskFilter;
                    x.setAttribute("aria-pressed", on);
                    x.classList.toggle("opacity-50", !on);
                });
                renderPatients();
            })
        );

        // Patient quick actions
        $("patients").addEventListener("click", (e) => {
            const btn = e.target.closest("[data-act]");
            if (!btn) return;
            const name = pName(btn.dataset.p);
            const msg = {
                view: "Opening chart for " + name + ".",
                vitals: "Vitals entry opened for " + name + ".",
                med: "eMAR opened — scan wristband for " + name + ".",
                call: "Paging assigned doctor for " + name + ".",
                note: "Nursing note started for " + name + ".",
            }[btn.dataset.act];
            toast(msg, btn.dataset.act === "call" ? "info" : "success");
        });

        // Medication tabs + give
        $("med-tabs").addEventListener("click", (e) => {
            const t = e.target.closest("[data-tab]");
            if (!t) return;
            medTab = t.dataset.tab;
            renderMeds();
        });
        $("meds").addEventListener("click", (e) => {
            const g = e.target.closest("[data-give]");
            if (!g) return;
            const m = MEDS[parseInt(g.dataset.give, 10)];
            if (m.controlled) toast("Controlled drug — second nurse signature requested for " + m.patient + ".", "info");
            m.status = "done";
            m.verify = "Double-checked";
            renderMeds();
            renderHero();
            toast(m.drug + " recorded as given to " + m.patient + ".", "success");
        });

        // Kanban complete
        $("kanban").addEventListener("click", (e) => {
            const d = e.target.closest("[data-done]");
            if (!d) return;
            const t = TASKS.find((x) => x.id === d.dataset.done);
            t.lane = "done";
            renderKanban();
            toast("Task completed — " + t.text, "success");
        });

        // Kanban drag and drop
        $("kanban").addEventListener("dragstart", (e) => {
            const card = e.target.closest("[data-task]");
            if (!card) return;
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", card.dataset.task);
            card.classList.add("is-dragging");
        });
        $("kanban").addEventListener("dragend", (e) => {
            const card = e.target.closest("[data-task]");
            if (card) card.classList.remove("is-dragging");
        });
        $("kanban").addEventListener("dragover", (e) => {
            const zone = e.target.closest(".ns-lane-items");
            if (!zone) return;
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
            zone.classList.add("is-over");
        });
        $("kanban").addEventListener("dragleave", (e) => {
            const zone = e.target.closest(".ns-lane-items");
            if (zone && !zone.contains(e.relatedTarget)) zone.classList.remove("is-over");
        });
        $("kanban").addEventListener("drop", (e) => {
            const zone = e.target.closest(".ns-lane-items");
            if (!zone) return;
            e.preventDefault();
            zone.classList.remove("is-over");
            const id = e.dataTransfer.getData("text/plain");
            const t = TASKS.find((x) => x.id === id);
            if (!t || t.lane === zone.dataset.lane) return;
            t.lane = zone.dataset.lane;
            renderKanban();
            toast("Moved to " + LANES.find((l) => l.key === t.lane).label + " — " + t.text, "info");
        });

        // Alerts
        $("alerts").addEventListener("click", (e) => {
            const a = e.target.closest("[data-ack]");
            if (!a) return;
            ALERTS = ALERTS.filter((x) => x.id !== a.dataset.ack);
            renderAlerts();
            renderHero();
        });
        $("btn-ack-all").addEventListener("click", () => {
            if (!ALERTS.length) return toast("No alerts to acknowledge.", "info");
            ALERTS = [];
            renderAlerts();
            renderHero();
            toast("All ward alerts acknowledged.", "success");
        });

        // Doctor inbox
        $("inbox").addEventListener("click", (e) => {
            const a = e.target.closest("[data-accept]");
            if (!a) return;
            const r = INBOX.find((x) => x.id === a.dataset.accept);
            INBOX = INBOX.filter((x) => x.id !== r.id);
            renderInbox();
            toast(r.kind + " from " + r.from + " accepted and added to tasks.", "success");
        });

        // Activity filters
        $("act-filters").addEventListener("click", (e) => {
            const c = e.target.closest("[data-cat]");
            if (!c) return;
            actFilter = c.dataset.cat;
            renderActivity();
        });

        // Hero quick actions
        $("btn-vitals").addEventListener("click", () => toast("Vitals entry opened — select a patient from the workspace.", "info"));
        $("btn-meds").addEventListener("click", () => toast("Medication round view pinned — 5 doses remaining.", "info"));
        $("btn-handover").addEventListener("click", () => toast("Handover sheet compiled from today's notes.", "success"));
        $("btn-print").addEventListener("click", () => toast("Handover sheet sent to the ward printer.", "success"));

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
            toast(item.dataset.act + (item.dataset.act === "Emergency Call" ? " — rapid response paged." : " opened."), item.dataset.act === "Emergency Call" ? "error" : "success");
        });
        document.addEventListener("click", (e) => {
            if (!e.target.closest(".ns-dock")) {
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
// reception-dashboard.js
// ==========================================================================
// Dreams HMS — Reception Command Center
// Lucia Fernandez's front desk at Counter 3: live token queue, appointment
// timeline, registration desk, waiting-area seat map, doctor status wall,
// visitor passes, billing counter, announcements, performance meters and
// the desk activity feed. Every headline figure derives from the lists.
(function () {
    "use strict";
    if ((location.pathname.split("/").pop() || "index.html") !== "reception-dashboard.html") return;

    const $ = (id) => document.getElementById(id);
    const esc = (v) => String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    const initials = (n) => n.replace(/^(Dr|Mr|Mrs|Ms)\.?\s+/i, "").split(/\s+/).slice(0, 2).map((p) => p.charAt(0).toUpperCase()).join("");
    const toast = (msg, tone) => (window.MC && MC.toast ? MC.toast(msg, tone || "info") : console.log(msg));

    /* ====================================================================
       Data — Main lobby, Counter 3 (now = 11:12 AM)
       ==================================================================== */

    const NOW_MIN = 11 * 60 + 12;

    const STEPS = [
        { name: "Patient Registration", time: "8:00 AM", min: 480, icon: "icon-user-plus" },
        { name: "Appointment Check-in", time: "8:30 AM", min: 510, icon: "icon-calendar-check" },
        { name: "Token Generation", time: "9:00 AM", min: 540, icon: "icon-ticket" },
        { name: "Doctor Assignment", time: "10:30 AM", min: 630, icon: "icon-stethoscope" },
        { name: "Billing", time: "12:00 PM", min: 720, icon: "icon-receipt" },
        { name: "Completion", time: "3:30 PM", min: 930, icon: "icon-badge-check" },
    ];

    let TOKEN_SEQ = 47;
    let TOKENS = [
        { no: "A-38", patient: "Miriam Adeyemi", doctor: "Dr. Chen", dept: "Cardiology", waited: 6, pri: "Normal", lane: "consult" },
        { no: "A-41", patient: "Peter Kowalski", doctor: "Dr. Osei", dept: "Orthopedics", waited: 12, pri: "Normal", lane: "called" },
        { no: "E-04", patient: "Fatima Al-Rashid", doctor: "Dr. Ferreira", dept: "Emergency", waited: 2, pri: "Emergency", lane: "called" },
        { no: "A-42", patient: "Johan Petersen", doctor: "Dr. Chen", dept: "Cardiology", waited: 18, pri: "Normal", lane: "waiting" },
        { no: "V-07", patient: "Amelia Hartley", doctor: "Dr. Nakato", dept: "Dermatology", waited: 9, pri: "VIP", lane: "waiting" },
        { no: "A-43", patient: "Rahul Krishnan", doctor: "Dr. Osei", dept: "Orthopedics", waited: 14, pri: "Normal", lane: "waiting" },
        { no: "A-44", patient: "Sofia Marino", doctor: "Dr. Nakato", dept: "Dermatology", waited: 5, pri: "Normal", lane: "waiting" },
        { no: "A-35", patient: "George Mensah", doctor: "Dr. Chen", dept: "Cardiology", waited: 0, pri: "Normal", lane: "done" },
        { no: "A-36", patient: "Hana Suzuki", doctor: "Dr. Nakato", dept: "Dermatology", waited: 0, pri: "Normal", lane: "done" },
        { no: "A-37", patient: "Liam O'Connor", doctor: "Dr. Osei", dept: "Orthopedics", waited: 0, pri: "Normal", lane: "done" },
    ];
    const LANES = [
        { key: "waiting", label: "Waiting", tone: "rc-amber" },
        { key: "called", label: "Called", tone: "rc-orange" },
        { key: "consult", label: "In Consultation", tone: "rc-sky" },
        { key: "done", label: "Completed", tone: "rc-emerald" },
    ];
    const PRI_TONE = { Emergency: "rc-rose", VIP: "rc-violet", Normal: "rc-sky" };

    let APPTS = [
        { time: "11:00 AM", min: 660, patient: "Miriam Adeyemi", doctor: "Dr. Chen", kind: "Current", note: "In consultation — room 4" },
        { time: "11:20 AM", min: 680, patient: "Peter Kowalski", doctor: "Dr. Osei", kind: "Upcoming", note: "Checked in · token A-41" },
        { time: "11:30 AM", min: 690, patient: "Amelia Hartley", doctor: "Dr. Nakato", kind: "VIP", note: "Private lounge · concierge notified" },
        { time: "11:40 AM", min: 700, patient: "Fatima Al-Rashid", doctor: "Dr. Ferreira", kind: "Emergency", note: "Fast-tracked from ED triage" },
        { time: "10:40 AM", min: 640, patient: "Bruno Silva", doctor: "Dr. Osei", kind: "Delayed", note: "Doctor running 25 min behind" },
        { time: "11:50 AM", min: 710, patient: "Sofia Marino", doctor: "Dr. Nakato", kind: "Walk-in", note: "Registered 10:58 AM · token A-44" },
        { time: "12:10 PM", min: 730, patient: "Johan Petersen", doctor: "Dr. Chen", kind: "Upcoming", note: "Awaiting call · token A-42" },
        { time: "12:30 PM", min: 750, patient: "Rahul Krishnan", doctor: "Dr. Osei", kind: "Walk-in", note: "X-ray review · token A-43" },
    ];
    const KIND_TONE = { Current: "rc-sky", Upcoming: "rc-indigo", Delayed: "rc-rose", "Walk-in": "rc-amber", VIP: "rc-violet", Emergency: "rc-rose" };

    let REGS = [
        { name: "Sofia Marino", kind: "New Registration", tone: "rc-sky", icon: "icon-user-plus", status: "Insurance verifying", docs: "ID captured · form 2 of 3", time: "10:58 AM" },
        { name: "Rahul Krishnan", kind: "Returning Patient", tone: "rc-emerald", icon: "icon-rotate-ccw", status: "Records matched", docs: "All documents on file", time: "10:45 AM" },
        { name: "Amelia Hartley", kind: "VIP Registration", tone: "rc-violet", icon: "icon-crown", status: "Complete", docs: "Concierge pack issued", time: "10:30 AM" },
        { name: "Bruno Silva", kind: "Insurance Update", tone: "rc-amber", icon: "icon-shield-check", status: "Pending insurer reply", docs: "Policy scan uploaded", time: "10:12 AM" },
        { name: "Fatima Al-Rashid", kind: "Emergency Intake", tone: "rc-rose", icon: "icon-siren", status: "Fast-tracked", docs: "Forms deferred — post-triage", time: "11:05 AM" },
    ];

    // 32 lobby seats: f = free, p = patient, m = family member, e = emergency queue
    const SEATS = "ppfmppfmpfppmffpempfppmffppfmpff".split("");
    const SEAT_META = { f: { label: "Available", cls: "is-free", icon: "" }, p: { label: "Patient", cls: "is-patient", icon: "icon-user" }, m: { label: "Family", cls: "is-family", icon: "icon-users" }, e: { label: "Emergency", cls: "is-emergency", icon: "icon-siren" } };

    let DOCTORS = [
        { name: "Dr. Sarah Chen", dept: "Cardiology", state: "consult", with_: "Miriam Adeyemi", next: "11:20 AM" },
        { name: "Dr. Kwame Osei", dept: "Orthopedics", state: "consult", with_: "Bruno Silva", next: "11:35 AM" },
        { name: "Dr. Inès Ferreira", dept: "Emergency", state: "available", with_: null, next: "Now" },
        { name: "Dr. Amina Nakato", dept: "Dermatology", state: "break", with_: null, next: "11:30 AM" },
        { name: "Dr. Viktor Halvorsen", dept: "General Surgery", state: "surgery", with_: "OT-2 · appendectomy", next: "1:30 PM" },
        { name: "Dr. Elena Vasquez", dept: "Pediatrics", state: "offline", with_: null, next: "Mon 9:00 AM" },
    ];
    const DOC_META = {
        available: { label: "Available", cls: "is-available" },
        consult: { label: "In Consultation", cls: "is-consult" },
        surgery: { label: "Surgery", cls: "is-surgery" },
        break: { label: "On Break", cls: "is-break" },
        offline: { label: "Offline", cls: "is-offline" },
    };

    let VISITORS = [
        { name: "Rosa Delgado Jr.", visiting: "Rosa Delgado · Ward 4B", kind: "Approved", tone: "rc-emerald", pass: "V-118", time: "10:40 AM" },
        { name: "Tunde Adeyemi", visiting: "Miriam Adeyemi · OPD", kind: "Waiting Approval", tone: "rc-amber", pass: "—", time: "11:02 AM" },
        { name: "Clara Petersen", visiting: "Johan Petersen · OPD", kind: "Approved", tone: "rc-emerald", pass: "V-119", time: "10:55 AM" },
        { name: "Al-Rashid Family (2)", visiting: "Fatima Al-Rashid · ED", kind: "Emergency", tone: "rc-rose", pass: "E-12", time: "11:06 AM" },
    ];

    const BILLS = [
        { label: "Pending Payments", val: "$1,840", n: "7 invoices", tone: "rc-amber", icon: "icon-hourglass" },
        { label: "Insurance Pending", val: "$3,120", n: "4 claims", tone: "rc-violet", icon: "icon-shield-check" },
        { label: "Refund Requests", val: "$260", n: "2 requests", tone: "rc-rose", icon: "icon-rotate-ccw" },
        { label: "Paid Today", val: "$5,430", n: "23 receipts", tone: "rc-sky", icon: "icon-check" },
    ];

    let NOTES = [
        { id: "n1", kind: "Emergency Broadcast", broadcast: true, tone: "rc-rose", icon: "icon-siren", text: "Code Blue drill at 2:00 PM — lobby announcements will pause for 10 minutes.", time: "10:50 AM" },
        { id: "n3", kind: "Doctor Announcement", tone: "rc-violet", icon: "icon-stethoscope", text: "Dr. Nakato's afternoon clinic moves to Room 12 — redirect checked-in patients.", time: "10:15 AM" },
        { id: "n4", kind: "System Alert", tone: "rc-amber", icon: "icon-monitor-cog", text: "Token display board 2 rebooting at 11:30 AM — announce tokens verbally for 5 min.", time: "11:00 AM" },
    ];

    const PERF = [
        { label: "Patients Registered", val: "23", pct: 77, tone: "rc-amber", icon: "icon-user-plus", sub: "target 30 / shift" },
        { label: "Avg Registration Time", val: "4m 10s", pct: 84, tone: "rc-sky", icon: "icon-timer", sub: "target < 5m" },
        { label: "Check-ins Completed", val: "31", pct: 89, tone: "rc-indigo", icon: "icon-calendar-check", sub: "35 booked today" },
        { label: "Walk-ins Managed", val: "9", pct: 100, tone: "rc-orange", icon: "icon-footprints", sub: "all tokened < 6m" },
        { label: "Token Efficiency", val: "92%", pct: 92, tone: "rc-emerald", icon: "icon-ticket", sub: "called on schedule" },
        { label: "Calls Answered", val: "18", pct: 90, tone: "rc-violet", icon: "icon-phone-call", sub: "avg pickup < 15s" },
        { label: "ID Verifications", val: "27", pct: 90, tone: "rc-rose", icon: "icon-shield-check", sub: "27 of 30 checked" },
        { label: "Avg Wait Time", val: "6m 40s", pct: 70, tone: "rc-slate", icon: "icon-hourglass", sub: "target < 8m" },
    ];

    let ACTIVITY = [
        { time: "11:08 AM", cat: "Tokens", icon: "icon-ticket", tone: "rc-orange", text: "Token A-44 generated for Sofia Marino — Dermatology" },
        { time: "11:06 AM", cat: "Visitors", icon: "icon-id-card", tone: "rc-sky", text: "Emergency pass E-12 issued to Al-Rashid family" },
        { time: "11:05 AM", cat: "Emergency", icon: "icon-siren", tone: "rc-rose", text: "Emergency intake fast-tracked — Fatima Al-Rashid to ED" },
        { time: "10:58 AM", cat: "Registrations", icon: "icon-user-plus", tone: "rc-amber", text: "New patient registered — Sofia Marino (walk-in)" },
        { time: "10:55 AM", cat: "Check-ins", icon: "icon-calendar-check", tone: "rc-indigo", text: "Johan Petersen checked in for 12:10 PM with Dr. Chen" },
        { time: "10:52 AM", cat: "Billing", icon: "icon-receipt", tone: "rc-emerald", text: "Invoice #4821 settled — $180 card payment" },
        { time: "10:45 AM", cat: "Registrations", icon: "icon-rotate-ccw", tone: "rc-amber", text: "Returning patient matched — Rahul Krishnan" },
        { time: "10:40 AM", cat: "Visitors", icon: "icon-id-card", tone: "rc-sky", text: "Visitor pass V-118 approved for Ward 4B" },
        { time: "10:30 AM", cat: "Check-ins", icon: "icon-crown", tone: "rc-indigo", text: "VIP arrival — Amelia Hartley escorted to private lounge" },
        { time: "10:12 AM", cat: "Billing", icon: "icon-shield-check", tone: "rc-emerald", text: "Insurance claim submitted for Bruno Silva — $940" },
    ];

    /* ====================================================================
       Renderers
       ==================================================================== */

    function renderHero() {
        $("fact-waiting").textContent = TOKENS.filter((t) => t.lane === "waiting").length + " in queue";
        $("fact-tokens").textContent = TOKENS.filter((t) => t.lane !== "done").length + " active";
        $("fact-emerg").textContent = TOKENS.some((t) => t.pri === "Emergency" && t.lane !== "done") ? "1 active" : "Clear";

        const called = TOKENS.filter((t) => t.lane === "called").sort((a, b) => (a.pri === "Emergency" ? -1 : 1));
        const s = $("serving");
        if (called.length) {
            const t = called[0];
            s.innerHTML =
                '<span class="rc-serving-token">' + esc(t.no) + "</span>" +
                '<div class="min-w-0 flex-1"><p class="text-xs font-extrabold uppercase tracking-wider text-amber-200">Now calling · Counter 3</p>' +
                '<p class="mt-0.5 truncate text-xs font-medium text-white/70">' + esc(t.patient) + " → " + esc(t.doctor) + " · " + esc(t.dept) + (t.pri !== "Normal" ? " · " + t.pri : "") + "</p></div>" +
                '<button type="button" id="btn-announce" class="rc-action shrink-0"><i class="icon-megaphone" aria-hidden="true"></i>Announce again</button>';
            $("btn-announce").addEventListener("click", () => toast("Token " + t.no + " announced on lobby displays.", "info"));
        } else {
            s.innerHTML =
                '<span class="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-400/20 text-emerald-200"><i class="icon-check" aria-hidden="true"></i></span>' +
                '<div class="min-w-0 flex-1"><p class="text-xs font-extrabold uppercase tracking-wider text-emerald-200">Queue clear at Counter 3</p>' +
                '<p class="mt-0.5 text-xs font-medium text-white/70">No token being called — press Call next to serve the queue.</p></div>';
        }
    }

    function renderClock() {
        const h24 = Math.floor(NOW_MIN / 60), m = NOW_MIN % 60;
        const h12 = ((h24 + 11) % 12) + 1;
        $("clock").innerHTML =
            '<span class="rc-clock-cell">' + String(h12).padStart(2, "0") + '</span><span class="rc-clock-sep">:</span>' +
            '<span class="rc-clock-cell">' + String(m).padStart(2, "0") + '</span>' +
            '<span class="ml-1 self-end pb-1 text-[11px] font-extrabold text-white/60">' + (h24 < 12 ? "AM" : "PM") + "</span>";
        $("clock-date").textContent = "Friday · July 17, 2026";
    }

    function renderSteps() {
        let current = 0;
        STEPS.forEach((s, i) => { if (s.min <= NOW_MIN) current = i; });
        $("steps").innerHTML = STEPS.map((s, i) => {
            const state = i < current ? "is-done" : i === current ? "is-now" : "";
            return (
                '<li class="rc-step ' + state + '">' +
                '<span class="rc-step-node"><i class="' + s.icon + '" aria-hidden="true"></i></span>' +
                '<div><p class="rc-step-name">' + esc(s.name) + '</p><p class="rc-step-time">' + esc(s.time) + "</p></div>" +
                (i === current ? '<span class="rc-chip rc-orange">Now</span>' : "") +
                "</li>"
            );
        }).join("");
        $("steps-chip").textContent = STEPS[current].name + " stage";
    }

    function renderQueue() {
        $("queue").innerHTML = LANES.map((l) => {
            const items = TOKENS.filter((t) => t.lane === l.key);
            return (
                '<div class="rc-lane ' + l.tone + '"><div class="mb-2 flex items-center justify-between px-1">' +
                '<p class="text-[11px] font-extrabold uppercase tracking-wider text-gray-500">' + l.label + '</p><span class="rc-chip ' + l.tone + '">' + items.length + "</span></div>" +
                '<div class="rc-lane-items" data-lane="' + l.key + '">' +
                (items.map((t, pos) => (
                    '<div class="rc-token ' + l.tone + (l.key === "called" ? " is-called" : "") + '" draggable="true" data-token="' + esc(t.no) + '">' +
                    '<div class="flex items-start gap-2.5">' +
                    '<span class="rc-token-no">' + esc(t.no) + "</span>" +
                    '<div class="min-w-0 flex-1"><p class="truncate text-xs font-extrabold text-gray-900">' + esc(t.patient) + "</p>" +
                    '<p class="mt-0.5 text-[10px] font-semibold text-gray-500">' + esc(t.doctor) + " · " + esc(t.dept) + "</p>" +
                    '<div class="mt-1 flex flex-wrap items-center gap-1">' +
                    (t.pri !== "Normal" ? '<span class="rc-chip ' + PRI_TONE[t.pri] + ' text-[9px]">' + t.pri + "</span>" : "") +
                    (l.key === "waiting" ? '<span class="rc-chip rc-amber text-[9px]">#' + (pos + 1) + " in line</span>" : "") +
                    (t.waited && l.key !== "done" ? '<span class="text-[9px] font-bold text-gray-400 tabular-nums"><i class="icon-clock text-[9px]" aria-hidden="true"></i> ' + t.waited + "m</span>" : "") +
                    "</div></div></div>" +
                    (l.key !== "done"
                        ? '<div class="mt-2 flex items-center gap-0.5 border-t border-dashed border-border-color pt-1.5 dark:border-white/10" role="group" aria-label="Token ' + esc(t.no) + ' actions">' +
                          (l.key === "waiting" ? '<button type="button" class="rc-token-btn" data-tk="call" data-no="' + esc(t.no) + '" title="Call" aria-label="Call token"><i class="icon-megaphone" aria-hidden="true"></i></button>' : "") +
                          (l.key === "called" ? '<button type="button" class="rc-token-btn" data-tk="start" data-no="' + esc(t.no) + '" title="Start consultation" aria-label="Start consultation"><i class="icon-play" aria-hidden="true"></i></button>' : "") +
                          (l.key === "consult" ? '<button type="button" class="rc-token-btn" data-tk="complete" data-no="' + esc(t.no) + '" title="Complete" aria-label="Complete token"><i class="icon-check" aria-hidden="true"></i></button>' : "") +
                          '<button type="button" class="rc-token-btn" data-tk="skip" data-no="' + esc(t.no) + '" title="Skip" aria-label="Skip token"><i class="icon-skip-forward" aria-hidden="true"></i></button>' +
                          '<button type="button" class="rc-token-btn" data-tk="hold" data-no="' + esc(t.no) + '" title="Hold" aria-label="Hold token"><i class="icon-pause" aria-hidden="true"></i></button>' +
                          '<button type="button" class="rc-token-btn" data-tk="reassign" data-no="' + esc(t.no) + '" title="Reassign doctor" aria-label="Reassign doctor"><i class="icon-shuffle" aria-hidden="true"></i></button>' +
                          "</div>"
                        : "") +
                    "</div>"
                )).join("") || '<p class="py-4 text-center text-[10px] font-semibold text-gray-400">Empty</p>') +
                "</div></div>"
            );
        }).join("");
        const active = TOKENS.filter((t) => t.lane !== "done").length;
        const avg = Math.round(TOKENS.filter((t) => t.lane === "waiting").reduce((s, t) => s + t.waited, 0) / Math.max(1, TOKENS.filter((t) => t.lane === "waiting").length));
        $("queue-chip").textContent = active + " active · avg wait " + avg + "m";
    }

    function renderAppts() {
        const list = APPTS.slice().sort((a, b) => a.min - b.min);
        $("appts").innerHTML = list.map((a) => {
            const tone = KIND_TONE[a.kind];
            const now = a.kind === "Current";
            return (
                '<div class="rc-appt ' + tone + (now ? " is-now" : "") + '">' +
                '<span class="rc-appt-dot"><i class="' + (now ? "icon-play" : a.kind === "Delayed" ? "icon-clock-alert" : "icon-clock") + '" aria-hidden="true"></i></span>' +
                '<div class="rc-appt-card"><div class="flex flex-wrap items-center gap-x-2 gap-y-1">' +
                '<p class="text-[11px] font-extrabold text-gray-900 tabular-nums">' + esc(a.time) + "</p>" +
                '<span class="rc-chip ' + tone + ' text-[9px]">' + a.kind + "</span></div>" +
                '<p class="mt-1 text-xs font-bold text-gray-800 dark:text-gray-200">' + esc(a.patient) + ' <span class="font-semibold text-gray-400">→ ' + esc(a.doctor) + "</span></p>" +
                '<p class="mt-0.5 text-[10px] font-semibold text-gray-500">' + esc(a.note) + "</p></div></div>"
            );
        }).join("");
        $("appt-chip").textContent = APPTS.filter((a) => ["Upcoming", "Walk-in", "VIP", "Emergency"].includes(a.kind)).length + " to seat";
    }

    function renderRegs() {
        $("reg-list").innerHTML = REGS.map((r) => (
            '<div class="rc-reg ' + r.tone + '"><div class="flex items-center gap-2.5">' +
            '<span class="rc-panel-icon !size-8 shrink-0 text-xs"><i class="' + r.icon + '" aria-hidden="true"></i></span>' +
            '<div class="min-w-0 flex-1"><div class="flex items-center gap-2"><p class="truncate text-xs font-extrabold text-gray-900">' + esc(r.name) + '</p><span class="ml-auto text-[10px] font-semibold text-gray-400 tabular-nums">' + esc(r.time) + "</span></div>" +
            '<p class="mt-0.5 text-[10px] font-bold text-gray-500">' + esc(r.kind) + " · " + esc(r.status) + "</p>" +
            '<p class="mt-0.5 text-[10px] font-semibold text-gray-400"><i class="icon-file-text text-[10px]" aria-hidden="true"></i> ' + esc(r.docs) + "</p></div></div></div>"
        )).join("");
        const stats = [
            { label: "New today", n: 14, tone: "rc-sky", icon: "icon-user-plus" },
            { label: "Returning", n: 9, tone: "rc-emerald", icon: "icon-rotate-ccw" },
            { label: "Insurance checks", n: 4, tone: "rc-violet", icon: "icon-shield-check" },
            { label: "Pending forms", n: 3, tone: "rc-amber", icon: "icon-file-warning" },
        ];
        $("reg-stats").innerHTML = stats.map((s) => (
            '<div class="rc-panel ' + s.tone + ' !flex-row items-center gap-2.5 !rounded-2xl p-2.5"><span class="rc-panel-icon !size-8 text-xs"><i class="' + s.icon + '" aria-hidden="true"></i></span>' +
            '<div><p class="text-base font-extrabold leading-none text-gray-900 tabular-nums">' + s.n + '</p><p class="mt-0.5 text-[10px] font-bold text-gray-400">' + s.label + "</p></div></div>"
        )).join("");
        $("reg-chip").textContent = REGS.length + " in progress";
    }

    function renderSeats() {
        $("seats").innerHTML = SEATS.map((s, i) => {
            const m = SEAT_META[s];
            return '<div class="rc-seat ' + m.cls + '" title="' + esc("Seat " + (i + 1) + " — " + m.label) + '">' + (m.icon ? '<i class="' + m.icon + '" aria-hidden="true"></i>' : "") + "</div>";
        }).join("");
        $("seat-legend").innerHTML = Object.values(SEAT_META).map((m) =>
            '<span class="inline-flex items-center gap-1.5 text-[10px] font-bold text-gray-500"><span class="rc-seat ' + m.cls + ' !aspect-auto !size-3 !rounded"></span>' + m.label + "</span>"
        ).join("");
        const free = SEATS.filter((s) => s === "f").length;
        const fam = SEATS.filter((s) => s === "m").length;
        const emerg = SEATS.filter((s) => s === "e").length;
        $("wait-chip").textContent = (SEATS.length - free) + " of " + SEATS.length + " seated";
        const stats = [
            { label: "Avg wait", v: "16m", tone: "text-amber-500" },
            { label: "Family waiting", v: fam, tone: "text-violet-500" },
            { label: "Emergency queue", v: emerg, tone: "text-rose-500" },
        ];
        $("wait-stats").innerHTML = stats.map((s) =>
            '<div class="rounded-xl bg-gray-50 p-2.5 text-center dark:bg-white/5"><p class="text-lg font-extrabold tabular-nums ' + s.tone + '">' + s.v + '</p><p class="text-[10px] font-bold text-gray-400">' + s.label + "</p></div>"
        ).join("");
    }

    let docFilter = "all";
    function renderDoctors() {
        const keys = ["all"].concat(Object.keys(DOC_META));
        $("doc-filters").innerHTML = keys.map((k) => {
            const n = k === "all" ? DOCTORS.length : DOCTORS.filter((d) => d.state === k).length;
            return '<button type="button" data-doc-f="' + k + '" aria-pressed="' + (docFilter === k) + '" class="rc-chip rc-emerald cursor-pointer' + (docFilter === k ? "" : " opacity-50") + '">' + (k === "all" ? "All" : DOC_META[k].label) + " · " + n + "</button>";
        }).join("");
        $("doctors").innerHTML = DOCTORS.filter((d) => docFilter === "all" || d.state === docFilter).map((d) => {
            const m = DOC_META[d.state];
            return (
                '<div class="rc-doc ' + m.cls + '"><div class="flex items-center gap-3">' +
                '<span class="rc-doc-avatar">' + esc(initials(d.name)) + '<span class="rc-doc-dot" aria-hidden="true"></span></span>' +
                '<div class="min-w-0 flex-1"><div class="flex items-center gap-2"><p class="truncate text-xs font-extrabold text-gray-900">' + esc(d.name) + '</p><span class="rc-doc-status">' + m.label + "</span></div>" +
                '<p class="mt-0.5 text-[10px] font-bold text-gray-500">' + esc(d.dept) + "</p>" +
                '<p class="mt-0.5 text-[10px] font-semibold text-gray-400">' + (d.with_ ? '<i class="icon-user text-[10px]" aria-hidden="true"></i> ' + esc(d.with_) + " · " : "") + "Next free: " + esc(d.next) + "</p></div>" +
                '<button type="button" data-doc="' + esc(d.name) + '" class="rc-token-btn shrink-0" title="Contact" aria-label="Contact doctor"><i class="icon-phone" aria-hidden="true"></i></button>' +
                "</div></div>"
            );
        }).join("") || '<p class="col-span-full py-6 text-center text-xs font-semibold text-gray-400">No doctors in this status.</p>';
    }

    function renderVisitors() {
        $("visitors").innerHTML = VISITORS.map((v, i) => (
            '<div class="rc-pass ' + v.tone + '"><span class="rc-pass-badge">' + esc(v.pass !== "—" ? v.pass : initials(v.name)) + "</span>" +
            '<div class="min-w-0 flex-1"><div class="flex items-center gap-2"><p class="truncate text-xs font-extrabold text-gray-900">' + esc(v.name) + '</p><span class="ml-auto text-[10px] font-semibold text-gray-400 tabular-nums">' + esc(v.time) + "</span></div>" +
            '<p class="mt-0.5 truncate text-[10px] font-semibold text-gray-500">' + esc(v.visiting) + "</p>" +
            '<span class="mt-1 rc-chip ' + v.tone + ' text-[9px]">' + v.kind + "</span></div>" +
            (v.kind === "Waiting Approval" ? '<button type="button" data-approve="' + i + '" class="shrink-0 self-center rounded-lg bg-emerald-500/10 px-2 py-1 text-[10px] font-extrabold text-emerald-600 transition-colors hover:bg-emerald-500/20 dark:text-emerald-300">Approve</button>' : "") +
            "</div>"
        )).join("");
        $("vis-chip").textContent = VISITORS.filter((v) => v.kind !== "Checked Out").length + " on site";
    }

    function renderBills() {
        $("bill-hero").innerHTML =
            '<div class="flex items-center justify-between"><p class="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Daily Collection</p>' +
            '<span class="rc-chip rc-emerald text-[9px]"><i class="icon-trending-up text-[9px]" aria-hidden="true"></i>+12% vs yesterday</span></div>' +
            '<p class="mt-1.5 text-3xl font-extrabold text-gray-900 tabular-nums">$8,550</p>' +
            '<p class="mt-0.5 text-[10px] font-semibold text-gray-400">30 transactions · counter + kiosk</p>';
        $("bills").innerHTML = BILLS.map((b) => (
            '<div class="rc-bill ' + b.tone + '"><div class="flex items-center gap-2"><span class="rc-panel-icon !size-7 text-[11px]"><i class="' + b.icon + '" aria-hidden="true"></i></span>' +
            '<p class="text-[10px] font-extrabold uppercase tracking-wide text-gray-400">' + b.label + "</p></div>" +
            '<p class="mt-1.5 rc-bill-val">' + b.val + '</p><p class="text-[10px] font-semibold text-gray-400">' + b.n + "</p></div>"
        )).join("");
    }

    function renderNotes() {
        $("announcements").innerHTML = NOTES.map((n) => (
            '<div class="rc-note ' + n.tone + (n.broadcast ? " is-broadcast" : "") + '"><div class="flex items-start gap-2.5">' +
            '<span class="rc-panel-icon !size-8 shrink-0 text-xs"><i class="' + n.icon + '" aria-hidden="true"></i></span>' +
            '<div class="min-w-0 flex-1"><div class="flex items-center gap-2"><p class="text-[11px] font-extrabold text-gray-900">' + esc(n.kind) + '</p><span class="ml-auto text-[10px] font-semibold text-gray-400 tabular-nums">' + esc(n.time) + "</span></div>" +
            '<p class="mt-0.5 text-[11px] leading-relaxed text-gray-500 line-clamp-2">' + esc(n.text) + "</p></div>" +
            '<button type="button" data-read="' + n.id + '" class="shrink-0 self-center rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10" aria-label="Mark read"><i class="icon-check text-xs" aria-hidden="true"></i></button>' +
            "</div></div>"
        )).join("") || '<div class="grid place-items-center py-8 text-center"><span class="grid size-12 place-items-center rounded-2xl bg-emerald-500/10 text-lg text-emerald-500"><i class="icon-inbox" aria-hidden="true"></i></span><p class="mt-3 text-xs font-bold text-gray-500">All caught up</p><p class="text-[10px] text-gray-400">No unread announcements.</p></div>';
    }

    function renderPerf() {
        $("perf").innerHTML = PERF.map((p) => (
            '<div class="rc-meter ' + p.tone + '"><div class="flex items-center gap-2.5">' +
            '<span class="rc-panel-icon !size-8 shrink-0 text-xs"><i class="' + p.icon + '" aria-hidden="true"></i></span>' +
            '<div class="min-w-0 flex-1"><div class="flex items-baseline justify-between gap-2"><p class="text-[11px] font-bold text-gray-500">' + p.label + '</p><p class="text-sm font-extrabold text-gray-900 tabular-nums">' + p.val + "</p></div>" +
            '<div class="rc-meter-track"><div class="rc-meter-fill" style="width:0%" data-w="' + p.pct + '"></div></div>' +
            '<p class="mt-1 text-[9px] font-semibold text-gray-400">' + p.sub + "</p></div></div></div>"
        )).join("");
        requestAnimationFrame(() => document.querySelectorAll(".rc-meter-fill").forEach((f) => (f.style.width = f.dataset.w + "%")));
        $("sat-val").textContent = "4.7 / 5";
        requestAnimationFrame(() => ($("sat-bar").style.width = "94%"));
    }

    let actFilter = "All";
    function renderActivity() {
        const cats = ["All"].concat([...new Set(ACTIVITY.map((a) => a.cat))]);
        $("act-filters").innerHTML = cats.map((c) =>
            '<button type="button" data-cat="' + c + '" aria-pressed="' + (actFilter === c) + '" class="rc-chip rc-orange cursor-pointer' + (actFilter === c ? "" : " opacity-50") + '">' + c + "</button>"
        ).join("");
        $("activity").innerHTML = ACTIVITY.filter((a) => actFilter === "All" || a.cat === actFilter).map((a) => (
            '<div class="rc-tl ' + a.tone + '"><span class="rc-tl-icon"><i class="' + a.icon + '" aria-hidden="true"></i></span>' +
            '<div class="min-w-0 flex-1 pb-1"><div class="flex items-center gap-2"><span class="rc-chip ' + a.tone + ' text-[9px]">' + a.cat + '</span><span class="text-[10px] font-semibold text-gray-400 tabular-nums">' + esc(a.time) + "</span></div>" +
            '<p class="mt-1 text-[11px] font-semibold leading-relaxed text-gray-700 dark:text-gray-300">' + esc(a.text) + "</p></div></div>"
        )).join("");
    }

    /* ====================================================================
       Queue operations + wiring
       ==================================================================== */

    function findToken(no) {
        return TOKENS.find((t) => t.no === no);
    }
    function refreshQueue() {
        renderQueue();
        renderHero();
    }

    function callNext() {
        const next = TOKENS.filter((t) => t.lane === "waiting").sort((a, b) => (a.pri === "Emergency" ? -1 : b.pri === "Emergency" ? 1 : 0))[0];
        if (!next) return toast("Queue is empty — no tokens waiting.", "info");
        next.lane = "called";
        refreshQueue();
        toast("Token " + next.no + " called — " + next.patient + " to Counter 3.", "success");
    }

    function init() {
        // NOTE: the front-desk clock, shift steps, token queue, appointment
        // timeline, registration feed, waiting-area seat map, doctor status
        // wall, visitor passes, billing tiles, announcements, performance
        // meters and activity feed are now pre-rendered as static HTML
        // directly in the page (see reception-dashboard.html) instead of
        // being built here on load. The render*() functions above are kept
        // and still run on demand from the event handlers below (queue
        // actions, drag-drop, filters, approvals, etc.) to keep every widget
        // fully interactive after the initial paint.
        renderHero();

        $("btn-call-next").addEventListener("click", callNext);

        // Token board actions
        $("queue").addEventListener("click", (e) => {
            const btn = e.target.closest("[data-tk]");
            if (!btn) return;
            const t = findToken(btn.dataset.no);
            const op = btn.dataset.tk;
            if (op === "call") {
                t.lane = "called";
                toast("Token " + t.no + " called — " + t.patient + ".", "success");
            } else if (op === "start") {
                t.lane = "consult";
                toast(t.patient + " sent to " + t.doctor + " — consultation started.", "success");
            } else if (op === "complete") {
                t.lane = "done";
                t.waited = 0;
                toast("Token " + t.no + " completed — routed to billing.", "success");
            } else if (op === "skip") {
                t.lane = "waiting";
                t.waited += 5;
                toast("Token " + t.no + " skipped — moved back to waiting.", "info");
            } else if (op === "hold") {
                t.lane = "waiting";
                toast("Token " + t.no + " on hold — patient will be re-called.", "info");
            } else if (op === "reassign") {
                t.doctor = t.doctor === "Dr. Chen" ? "Dr. Ferreira" : "Dr. Chen";
                toast("Token " + t.no + " reassigned to " + t.doctor + ".", "success");
            }
            refreshQueue();
        });

        // Token board drag and drop
        $("queue").addEventListener("dragstart", (e) => {
            const card = e.target.closest("[data-token]");
            if (!card) return;
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", card.dataset.token);
            card.classList.add("is-dragging");
        });
        $("queue").addEventListener("dragend", (e) => {
            const card = e.target.closest("[data-token]");
            if (card) card.classList.remove("is-dragging");
        });
        $("queue").addEventListener("dragover", (e) => {
            const zone = e.target.closest(".rc-lane-items");
            if (!zone) return;
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
            zone.classList.add("is-over");
        });
        $("queue").addEventListener("dragleave", (e) => {
            const zone = e.target.closest(".rc-lane-items");
            if (zone && !zone.contains(e.relatedTarget)) zone.classList.remove("is-over");
        });
        $("queue").addEventListener("drop", (e) => {
            const zone = e.target.closest(".rc-lane-items");
            if (!zone) return;
            e.preventDefault();
            zone.classList.remove("is-over");
            const no = e.dataTransfer.getData("text/plain");
            const t = findToken(no);
            if (!t || t.lane === zone.dataset.lane) return;
            t.lane = zone.dataset.lane;
            if (t.lane === "done") t.waited = 0;
            refreshQueue();
            toast("Token " + t.no + " moved to " + LANES.find((l) => l.key === t.lane).label + ".", "info");
        });

        // Registration quick actions
        document.querySelectorAll("[data-reg]").forEach((b) =>
            b.addEventListener("click", () => toast(b.dataset.reg + " workspace opened.", "success"))
        );

        // Doctor wall
        $("doc-filters").addEventListener("click", (e) => {
            const f = e.target.closest("[data-doc-f]");
            if (!f) return;
            docFilter = f.dataset.docF;
            renderDoctors();
        });
        $("doctors").addEventListener("click", (e) => {
            const d = e.target.closest("[data-doc]");
            if (d) toast("Calling " + d.dataset.doc + "'s consultation room…", "info");
        });

        // Visitors
        $("visitors").addEventListener("click", (e) => {
            const a = e.target.closest("[data-approve]");
            if (!a) return;
            const v = VISITORS[parseInt(a.dataset.approve, 10)];
            v.kind = "Approved";
            v.tone = "rc-emerald";
            v.pass = "V-120";
            renderVisitors();
            toast("Visitor pass " + v.pass + " printed for " + v.name + ".", "success");
        });

        // Announcements
        $("announcements").addEventListener("click", (e) => {
            const r = e.target.closest("[data-read]");
            if (!r) return;
            NOTES = NOTES.filter((n) => n.id !== r.dataset.read);
            renderNotes();
        });
        $("btn-read-all").addEventListener("click", () => {
            if (!NOTES.length) return toast("No unread announcements.", "info");
            NOTES = [];
            renderNotes();
            toast("All announcements marked as read.", "success");
        });

        // Activity filters
        $("act-filters").addEventListener("click", (e) => {
            const c = e.target.closest("[data-cat]");
            if (!c) return;
            actFilter = c.dataset.cat;
            renderActivity();
        });

        // Hero quick actions
        $("btn-register").addEventListener("click", () => toast("New patient registration form opened.", "success"));
        $("btn-checkin").addEventListener("click", () => toast("Appointment check-in scanner ready — scan booking QR.", "info"));
        $("btn-token").addEventListener("click", () => {
            TOKEN_SEQ += 1;
            const no = "A-" + TOKEN_SEQ;
            TOKENS.push({ no, patient: "Walk-in Patient", doctor: "Dr. Ferreira", dept: "General OPD", waited: 0, pri: "Normal", lane: "waiting" });
            ACTIVITY.unshift({ time: "11:12 AM", cat: "Tokens", icon: "icon-ticket", tone: "rc-orange", text: "Token " + no + " generated at Counter 3 (walk-in)" });
            refreshQueue();
            renderActivity();
            toast("Token " + no + " generated and sent to the printer.", "success");
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
            toast(item.dataset.act + (item.dataset.act === "Emergency Registration" ? " — fast-track intake opened." : " opened."), item.dataset.act === "Emergency Registration" ? "error" : "success");
        });
        document.addEventListener("click", (e) => {
            if (!e.target.closest(".rc-dock")) {
                menu.classList.add("is-closed");
                fab.classList.remove("is-open");
                fab.setAttribute("aria-expanded", "false");
            }
        });
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
})();
