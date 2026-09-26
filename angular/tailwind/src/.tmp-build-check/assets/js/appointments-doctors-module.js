// ==========================================================================
// add-doctor.js
// ==========================================================================
(function () {
    "use strict";
    var page = document.getElementById("adr-page"); if (!page) return;
    var $ = function (s, r) { return (r || document).querySelector(s); };
    var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
    var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };

    function toast(msg, type) {
        var t = document.createElement("div"); t.className = "adr-toast " + (type || "success");
        t.innerHTML = '<i class="icon-' + (type === "error" ? "circle-alert" : type === "info" ? "info" : "circle-check") + '"></i>' + msg;
        document.body.appendChild(t);
        setTimeout(function () { t.style.transition = "opacity .3s,transform .3s"; t.style.opacity = "0"; t.style.transform = "translateY(10px)"; }, 2400);
        setTimeout(function () { t.remove(); }, 2750);
    }

    var STEPS = [
        ["Personal", "icon-user", "Personal Information", "Basic identity and contact details"],
        ["Professional", "icon-stethoscope", "Professional Details", "Specialty, department and registration"],
        ["Education", "icon-graduation-cap", "Qualifications & Education", "Degrees, institutes and certifications"],
        ["Schedule", "icon-calendar-clock", "Schedule & Availability", "Working days, hours and slots"],
        ["Consultation", "icon-video", "Consultation Settings", "Fees, type, services and bio"],
        ["Documents", "icon-folder", "Documents", "License, certificates and ID proof"],
        ["Review", "icon-clipboard-check", "Review & Submit", "Confirm and register the doctor"]
    ];
    var DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    var SERVICES = ["Consultation", "Follow-up", "Emergency", "Procedures", "Surgery", "Diagnostics", "Teleconsult", "Home Visit"];
    var REQDOCS = ["Medical License", "Degree Certificate", "ID Proof", "Profile Photo"];

    var model = { gender: "Male", dept: "Cardiology", desig: "Consultant", emp: "Full-time", ctype: "In-person", slot: "20 min", days: { Mon: 1, Tue: 1, Wed: 1, Thu: 1, Fri: 1, Sat: 0, Sun: 0 }, services: {}, docs: [] };
    var step = 0;

    /* ---- build stepper ---- */
    function buildStepper() {
        var h = "";
        STEPS.forEach(function (s, i) {
            h += '<div class="adr-step' + (i === step ? " active" : i < step ? " done" : "") + '" data-step="' + i + '"><span class="adr-step-node">' + (i < step ? '<i class="icon-check"></i>' : (i + 1)) + '</span><span class="adr-step-lbl">' + s[0] + '</span></div>';
            if (i < STEPS.length - 1) h += '<span class="adr-step-line' + (i < step ? " done" : "") + '"></span>';
        });
        $("#adr-stepper").innerHTML = h;
    }

    /* ---- days ---- */
    function buildDays() {
        $("#adr-days").innerHTML = DAYS.map(function (d) { return '<button type="button" class="adr-day' + (model.days[d] ? " on" : "") + '" data-day="' + d + '"><div class="d">' + d + '</div><i class="mark icon-' + (model.days[d] ? "check" : "x") + '"></i></button>'; }).join("");
    }
    /* ---- services ---- */
    function buildServices() {
        $("#adr-services").innerHTML = SERVICES.map(function (s) { return '<button type="button" class="adr-chipsel' + (model.services[s] ? " on" : "") + '" data-service="' + s + '">' + (model.services[s] ? '<i class="icon-check text-[10px]"></i>' : "") + s + '</button>'; }).join("");
    }
    /* ---- required docs checklist ---- */
    function buildReqDocs() {
        $("#adr-reqdocs").innerHTML = REQDOCS.map(function (d) { var has = model.docs.some(function (f) { return f.tag === d; }); return '<div class="adr-doc ' + (has ? "adr-c-emerald" : "adr-c-amber") + '" style="justify-content:center;flex-direction:column;gap:.2rem;text-align:center;padding:.6rem"><span class="adr-doc-ico"><i class="icon-' + (has ? "check" : "file") + '"></i></span><span class="text-[10px] font-bold ' + (has ? "text-emerald-600" : "text-gray-500") + '">' + d + '</span></div>'; }).join("");
    }
    function buildDocList() {
        $("#adr-doclist").innerHTML = model.docs.length ? model.docs.map(function (f, i) { return '<div class="adr-doc adr-c-primary"><span class="adr-doc-ico"><i class="icon-file-text"></i></span><div class="min-w-0 flex-1"><p class="font-bold text-gray-900 dark:text-white truncate">' + esc(f.name) + '</p><p class="text-[10px] text-gray-400">' + f.size + ' · ' + esc(f.tag) + '</p></div><button type="button" class="adr-icobtn" style="width:1.8rem;height:1.8rem" data-rmdoc="' + i + '"><i class="icon-x text-xs"></i></button></div>'; }).join("") : "";
    }
    function addDoc(name) {
        var lower = name.toLowerCase(), tag = "Other";
        if (lower.indexOf("licen") > -1) tag = "Medical License"; else if (lower.indexOf("degree") > -1 || lower.indexOf("cert") > -1 || lower.indexOf("mbbs") > -1) tag = "Degree Certificate"; else if (lower.indexOf("id") > -1 || lower.indexOf("aadha") > -1 || lower.indexOf("passport") > -1) tag = "ID Proof"; else if (lower.indexOf("photo") > -1 || lower.indexOf("jpg") > -1 || lower.indexOf("png") > -1) tag = "Profile Photo";
        model.docs.push({ name: name, size: (80 + name.length * 4) + " KB", tag: tag });
        buildDocList(); buildReqDocs(); updateProgress();
    }

    var fullName = function () { var f = (model.first || "").trim(), l = (model.last || "").trim(); var n = (f + " " + l).trim(); return n ? "Dr. " + n : "Dr. New Doctor"; };
    var money = function (n) { return "₹" + Number(n || 0).toLocaleString("en-IN"); };

    /* ---- progress / checklist ---- */
    var CHECKS = [
        ["Personal info", function () { return model.first && model.last && model.phone && model.email; }],
        ["Professional details", function () { return model.spec && model.dept && model.exp; }],
        ["Qualifications", function () { return model.degree; }],
        ["Schedule set", function () { return Object.keys(model.days).some(function (d) { return model.days[d]; }); }],
        ["Consultation fee", function () { return model.fee; }],
        ["Documents uploaded", function () { return model.docs.length >= 2; }]
    ];
    function pct() { var done = CHECKS.filter(function (c) { return c[1](); }).length; return Math.round(done / CHECKS.length * 100); }
    function updateProgress() {
        var p = pct();
        $("#adr-pct-badge").textContent = p; $("#adr-mini-pct").textContent = p + "%"; $("#adr-big-pct").textContent = p + "%";
        $("#adr-mini-meter").style.width = p + "%"; $("#adr-big-meter").style.width = p + "%";
        $("#adr-checklist").innerHTML = CHECKS.map(function (c) { var ok = c[1](); return '<div class="flex items-center gap-2 text-xs"><span class="grid place-items-center w-4 h-4 rounded-full ' + (ok ? "bg-emerald-500 text-white" : "bg-gray-200 dark:bg-slate-700 text-gray-400") + '"><i class="icon-' + (ok ? "check" : "minus") + ' text-[9px]"></i></span><span class="' + (ok ? "text-gray-700 dark:text-gray-200 font-semibold" : "text-gray-400") + '">' + c[0] + '</span></div>'; }).join("");
    }

    /* ---- step navigation ---- */
    function goStep(n) {
        if (n < 0 || n > STEPS.length - 1) return;
        step = n;
        $$(".adr-panel").forEach(function (p) { p.classList.toggle("active", +p.getAttribute("data-panel") === step); });
        buildStepper();
        var s = STEPS[step];
        $("#adr-form-title").textContent = s[2]; $("#adr-form-sub").textContent = s[3]; $("#adr-form-head .ico").innerHTML = '<i class="' + s[1] + '"></i>';
        $("#adr-form-count").textContent = (step + 1) + " / " + STEPS.length; $("#adr-step-badge").textContent = step + 1;
        $("#adr-back").disabled = step === 0;
        $("#adr-next").classList.toggle("hidden", step === STEPS.length - 1);
        $("#adr-submit").classList.toggle("hidden", step !== STEPS.length - 1);
        if (step === STEPS.length - 1) buildReview();
        $("#adr-page").scrollIntoView({ behavior: "smooth", block: "start" });
    }
    function validateStep() {
        var reqBy = { 0: ["first", "last", "phone", "email"], 1: ["spec", "exp"], 2: ["degree"], 4: ["fee"] };
        var req = reqBy[step]; if (!req) return true;
        var ok = true, first = null;
        req.forEach(function (k) { var el = $('[data-k="' + k + '"]'); var v = (model[k] || "").toString().trim(); if (!v) { ok = false; if (el) { el.classList.add("err"); if (!first) first = el; } } });
        if (!ok) { toast("Please fill the required fields", "error"); if (first) first.focus(); }
        return ok;
    }

    /* ---- review ---- */
    function buildReview() {
        var row = function (k, v) { return '<div class="flex items-center justify-between px-4 py-2 border-b border-border-color text-xs" style="border-bottom-style:dashed"><span class="text-gray-500 dark:text-gray-400">' + k + '</span><span class="font-bold text-gray-900 dark:text-white text-right">' + esc(v || "—") + "</span></div>"; };
        var sec = function (ico, title, s, rows) { return '<div class="adr-review-sec"><div class="adr-review-head"><span class="grid place-items-center w-6 h-6 rounded-lg text-white" style="background:linear-gradient(135deg,var(--color-primary),#6366f1)"><i class="' + ico + ' text-[11px]"></i></span>' + title + '<button type="button" class="ml-auto text-[11px] font-bold text-primary hover:underline" data-goto="' + s + '">Edit</button></div>' + rows + "</div>"; };
        var days = Object.keys(model.days).filter(function (d) { return model.days[d]; }).join(", ") || "—";
        var services = Object.keys(model.services).filter(function (s) { return model.services[s]; }).join(", ") || "—";
        $("#adr-review").innerHTML =
            sec("icon-user", "Personal", 0, row("Name", fullName()) + row("Gender", model.gender) + row("Phone", model.phone) + row("Email", model.email) + row("Blood Group", model.blood) + row("Languages", model.langs)) +
            sec("icon-stethoscope", "Professional", 1, row("Specialty", model.spec) + row("Department", model.dept) + row("Designation", model.desig) + row("Experience", (model.exp || 0) + " yrs") + row("Reg. No", model.reg) + row("Employment", model.emp)) +
            sec("icon-graduation-cap", "Education", 2, row("Degree", model.degree) + row("Higher", model.higher) + row("University", model.univ) + row("Certifications", model.certs)) +
            sec("icon-calendar-clock", "Schedule", 3, row("Working Days", days) + row("Hours", (model.start || "—") + " – " + (model.end || "—")) + row("Slot", model.slot) + row("Max/Day", model.maxpat)) +
            sec("icon-video", "Consultation", 4, row("Fee", money(model.fee)) + row("Follow-up Fee", money(model.fufee)) + row("Type", model.ctype) + row("Services", services)) +
            sec("icon-folder", "Documents", 5, row("Uploaded", model.docs.length + " file(s)") + model.docs.map(function (f) { return row(f.tag, f.name); }).join(""));
    }

    /* ---- events ---- */
    page.addEventListener("input", function (e) { var el = e.target.closest(".adr-live"); if (!el) return; model[el.getAttribute("data-k")] = el.value; el.classList.remove("err"); updateProgress(); });
    page.addEventListener("change", function (e) { var el = e.target.closest(".adr-live"); if (el) { model[el.getAttribute("data-k")] = el.value; updateProgress(); } });

    $("#adr-stepper").addEventListener("click", function (e) { var s = e.target.closest("[data-step]"); if (s) { var n = +s.getAttribute("data-step"); if (n <= step || validateStep()) goStep(n); } });
    $("#adr-days").addEventListener("click", function (e) { var d = e.target.closest("[data-day]"); if (!d) return; var k = d.getAttribute("data-day"); model.days[k] = model.days[k] ? 0 : 1; buildDays(); updateProgress(); });
    $("#adr-services").addEventListener("click", function (e) { var s = e.target.closest("[data-service]"); if (!s) return; var k = s.getAttribute("data-service"); model.services[k] = !model.services[k]; buildServices(); });
    $("#f-emp").addEventListener("click", function (e) { var b = e.target.closest("[data-emp]"); if (!b) return; $$("#f-emp button").forEach(function (x) { x.classList.remove("on"); }); b.classList.add("on"); model.emp = b.getAttribute("data-emp"); });
    $("#f-ctype").addEventListener("click", function (e) { var b = e.target.closest("[data-ctype]"); if (!b) return; $$("#f-ctype button").forEach(function (x) { x.classList.remove("on"); }); b.classList.add("on"); model.ctype = b.getAttribute("data-ctype"); });

    // photo
    $("#adr-photo").addEventListener("change", function (e) { var f = e.target.files && e.target.files[0]; if (!f) return; var rd = new FileReader(); rd.onload = function (ev) { model.photo = ev.target.result; $("#adr-avaup-inner").outerHTML = '<img id="adr-avaup-inner" src="' + ev.target.result + '" alt="">'; }; rd.readAsDataURL(f); });

    // documents
    var drop = $("#adr-drop"), fileInput = $("#adr-files");
    drop.addEventListener("click", function () { fileInput.click(); });
    fileInput.addEventListener("change", function (e) { $$(e.target.files).forEach(function (f) { addDoc(f.name); }); toast(e.target.files.length + " document(s) added"); });
    ["dragover", "dragenter"].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add("drag"); }); });
    ["dragleave", "drop"].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove("drag"); }); });
    drop.addEventListener("drop", function (e) { var fs = e.dataTransfer && e.dataTransfer.files; if (fs && fs.length) { $$(fs).forEach(function (f) { addDoc(f.name); }); toast(fs.length + " document(s) added"); } });
    $("#adr-doclist").addEventListener("click", function (e) { var b = e.target.closest("[data-rmdoc]"); if (!b) return; model.docs.splice(+b.getAttribute("data-rmdoc"), 1); buildDocList(); buildReqDocs(); updateProgress(); });

    $("#adr-review").addEventListener("click", function (e) { var b = e.target.closest("[data-goto]"); if (b) goStep(+b.getAttribute("data-goto")); });

    $("#adr-next").addEventListener("click", function () { if (validateStep()) goStep(step + 1); });
    $("#adr-back").addEventListener("click", function () { goStep(step - 1); });
    function saveDraft() { toast("Draft saved · " + pct() + "% complete", "info"); }
    $("#adr-save-draft").addEventListener("click", saveDraft); $("#adr-save-draft-2").addEventListener("click", saveDraft);
    $("#adr-submit").addEventListener("click", function () {
        if (!validateStep()) return;
        if (!$("#adr-consent").checked) { toast("Please confirm the verification consent", "error"); return; }
        this.innerHTML = '<i class="icon-loader"></i>Registering…'; this.disabled = true;
        var self = this;
        setTimeout(function () { toast(fullName() + " registered successfully"); self.innerHTML = '<i class="icon-check"></i>Registered'; setTimeout(function () { window.location.href = "doctors.html"; }, 900); }, 900);
    });

    document.addEventListener("keydown", function (e) { if (e.key === "Escape") { } });

    setTimeout(function () {
        var sk = $("#adr-skeleton"), ct = $("#adr-content");
        if (sk) sk.style.display = "none";
        if (ct) { ct.classList.remove("hidden"); ct.style.animation = "adr-slide .4s ease"; }
        buildStepper(); buildDays(); buildServices(); buildReqDocs(); goStep(0); updateProgress();
    }, 1400);
})();

// ==========================================================================
// appointment-calendar.js
// ==========================================================================
// Dreams HMS — Appointment Calendar (day / week / month)
(function () {
    "use strict";

    const $ = (id) => document.getElementById(id);
    const body = $("cal-body");
    if (!body) return;

    const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

    // Fixed "today" so the static template renders identically for every buyer.
    const TODAY = { y: 2026, m: 6, d: 17 }; // 17 Jul 2026
    const NOW_MINUTES = 10 * 60 + 30; // current-time indicator at 10:30

    const TYPE_COLOR = {
        Consultation: { dot: "bg-primary", card: "bg-primary-100 dark:bg-primary-600/20 border-primary/30 text-primary" },
        "Follow-Up": { dot: "bg-emerald-500", card: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400" },
        Emergency: { dot: "bg-danger", card: "bg-red-50 dark:bg-red-500/10 border-danger/30 text-danger" },
        Procedure: { dot: "bg-purple", card: "bg-purple-50 dark:bg-purple-500/10 border-purple/30 text-purple" },
    };

    const DOCTORS = ["Dr. Sarah Chen", "Dr. Michael Reyes", "Dr. Emily Carter", "Dr. David Okonkwo", "Dr. Laura Bennett"];
    const DEPTS = ["Cardiology", "Neurology", "Orthopedics", "Pediatrics", "Oncology"];
    const TYPES = ["Consultation", "Follow-Up", "Emergency", "Procedure"];

    let events = [
        { id: 1, patient: "James Morrison", doctor: "Dr. Sarah Chen", dept: "Cardiology", type: "Consultation", date: "2026-07-17", start: 9, dur: 0.5, phone: "(212) 555-0147" },
        { id: 2, patient: "Linda Whitfield", doctor: "Dr. Michael Reyes", dept: "Neurology", type: "Follow-Up", date: "2026-07-17", start: 9.5, dur: 0.5, phone: "(212) 555-0182" },
        { id: 3, patient: "Robert Castillo", doctor: "Dr. Emily Carter", dept: "Orthopedics", type: "Procedure", date: "2026-07-17", start: 10, dur: 1, phone: "(646) 555-0113" },
        { id: 4, patient: "Angela Brooks", doctor: "Dr. David Okonkwo", dept: "Pediatrics", type: "Consultation", date: "2026-07-17", start: 11, dur: 0.5, phone: "(718) 555-0164" },
        { id: 5, patient: "Marcus Delgado", doctor: "Dr. Laura Bennett", dept: "Oncology", type: "Follow-Up", date: "2026-07-17", start: 14, dur: 0.5, phone: "(347) 555-0198" },
        { id: 6, patient: "Gregory Hollis", doctor: "Dr. David Okonkwo", dept: "Pediatrics", type: "Emergency", date: "2026-07-17", start: 15.5, dur: 1, phone: "(718) 555-0139" },
        { id: 7, patient: "Daniel Kowalski", doctor: "Dr. Michael Reyes", dept: "Neurology", type: "Consultation", date: "2026-07-16", start: 9, dur: 0.5, phone: "(917) 555-0176" },
        { id: 8, patient: "Sofia Alvarez", doctor: "Dr. Emily Carter", dept: "Orthopedics", type: "Follow-Up", date: "2026-07-16", start: 10, dur: 0.5, phone: "(646) 555-0155" },
        { id: 9, patient: "Naomi Fitzgerald", doctor: "Dr. Laura Bennett", dept: "Oncology", type: "Consultation", date: "2026-07-18", start: 14, dur: 0.5, phone: "(212) 555-0190" },
        { id: 10, patient: "Ethan Caldwell", doctor: "Dr. Sarah Chen", dept: "Cardiology", type: "Consultation", date: "2026-07-18", start: 9.5, dur: 0.5, phone: "(347) 555-0102" },
        { id: 11, patient: "Camille Rousseau", doctor: "Dr. Michael Reyes", dept: "Neurology", type: "Follow-Up", date: "2026-07-20", start: 10, dur: 0.5, phone: "(917) 555-0128" },
        { id: 12, patient: "Hannah Whitmore", doctor: "Dr. David Okonkwo", dept: "Pediatrics", type: "Consultation", date: "2026-07-21", start: 9, dur: 0.5, phone: "(212) 555-0163" },
        { id: 13, patient: "Victor Ramirez", doctor: "Dr. Laura Bennett", dept: "Oncology", type: "Procedure", date: "2026-07-21", start: 15.5, dur: 1, phone: "(718) 555-0174" },
        { id: 14, patient: "Isabelle Duncan", doctor: "Dr. Sarah Chen", dept: "Cardiology", type: "Follow-Up", date: "2026-07-22", start: 14, dur: 0.5, phone: "(347) 555-0145" },
        { id: 15, patient: "Omar Haddad", doctor: "Dr. David Okonkwo", dept: "Pediatrics", type: "Emergency", date: "2026-07-22", start: 10, dur: 1, phone: "(917) 555-0119" },
        { id: 16, patient: "Grace Lindqvist", doctor: "Dr. Emily Carter", dept: "Orthopedics", type: "Consultation", date: "2026-07-23", start: 9.5, dur: 0.5, phone: "(646) 555-0136" },
    ];

    let view = "month";
    let cursor = { y: TODAY.y, m: TODAY.m, d: TODAY.d };
    let miniCursor = { y: TODAY.y, m: TODAY.m };
    const active = { doctors: new Set(DOCTORS), depts: new Set(DEPTS), types: new Set(TYPES) };

    const iso = (y, m, d) => y + "-" + String(m + 1).padStart(2, "0") + "-" + String(d).padStart(2, "0");
    const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
    const firstWeekday = (y, m) => new Date(y, m, 1).getDay();

    function fmtHour(h) {
        const base = Math.floor(h);
        const mins = h % 1 ? "30" : "00";
        const suffix = base >= 12 ? "PM" : "AM";
        const display = base % 12 === 0 ? 12 : base % 12;
        return display + ":" + mins + " " + suffix;
    }

    function visible() {
        return events.filter(
            (e) => active.doctors.has(e.doctor) && active.depts.has(e.dept) && active.types.has(e.type),
        );
    }

    function eventsOn(dateIso) {
        return visible().filter((e) => e.date === dateIso).sort((a, b) => a.start - b.start);
    }

    // The 4 KPI cards in #stats-row are already static markup in the HTML,
    // matching what MC.apptStats([...]) plus calStats() would have produced
    // on load. calStats() stays below to update the same #stat-* elements
    // after a genuine mutation (booking, drag-and-drop reschedule).

    // Capacity model: 10 bookable slots per doctor per day.
    const SLOTS_PER_DAY = HOURS.length * DOCTORS.length;

    function calStats() {
        const todayIso = iso(TODAY.y, TODAY.m, TODAY.d);
        const today = events.filter((e) => e.date === todayIso).length;

        const base = new Date(TODAY.y, TODAY.m, TODAY.d);
        const start = new Date(base);
        start.setDate(base.getDate() - base.getDay());
        const weekDates = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            weekDates.push(iso(d.getFullYear(), d.getMonth(), d.getDate()));
        }
        const week = events.filter((e) => weekDates.indexOf(e.date) !== -1).length;

        $("stat-today").textContent = today;
        $("stat-week").textContent = week;
        $("stat-slots").textContent = Math.max(0, SLOTS_PER_DAY - today);
        $("stat-util").textContent = Math.round((today / SLOTS_PER_DAY) * 100) + "%";
    }

    // --- Filters ------------------------------------------------------------
    // #filter-doctors, #filter-depts and #filter-types are already static
    // checkbox markup in the HTML (all checked by default), matching what
    // DOCTORS.map(checkboxRow)/DEPTS.map(...)/TYPES.map(...) would have
    // produced on load.

    document.querySelectorAll("[data-filter]").forEach(function (box) {
        box.addEventListener("change", function () {
            const set = active[box.dataset.filter];
            if (box.checked) set.add(box.value);
            else set.delete(box.value);
            render();
        });
    });

    // --- Mini calendar ------------------------------------------------------
    function renderMini() {
        $("mini-label").textContent = MONTHS[miniCursor.m] + " " + miniCursor.y;
        const total = daysInMonth(miniCursor.y, miniCursor.m);
        const lead = firstWeekday(miniCursor.y, miniCursor.m);
        let html = "";
        for (let i = 0; i < lead; i++) html += "<span></span>";
        for (let d = 1; d <= total; d++) {
            const dateIso = iso(miniCursor.y, miniCursor.m, d);
            const isToday = miniCursor.y === TODAY.y && miniCursor.m === TODAY.m && d === TODAY.d;
            const isSel = cursor.y === miniCursor.y && cursor.m === miniCursor.m && d === cursor.d;
            const has = eventsOn(dateIso).length > 0;
            html +=
                '<button type="button" data-mini="' + d + '" class="relative h-7 rounded-lg text-xs font-medium transition-colors ' +
                (isToday
                    ? "bg-primary text-white"
                    : isSel
                      ? "bg-primary-100 dark:bg-primary-600/20 text-primary"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700") +
                '">' + d +
                (has && !isToday ? '<span class="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"></span>' : "") +
                "</button>";
        }
        $("mini-grid").innerHTML = html;
    }

    $("mini-grid").addEventListener("click", function (e) {
        const btn = e.target.closest("[data-mini]");
        if (!btn) return;
        cursor = { y: miniCursor.y, m: miniCursor.m, d: parseInt(btn.dataset.mini, 10) };
        render();
    });

    $("mini-prev").addEventListener("click", function () {
        miniCursor.m--;
        if (miniCursor.m < 0) { miniCursor.m = 11; miniCursor.y--; }
        renderMini();
    });
    $("mini-next").addEventListener("click", function () {
        miniCursor.m++;
        if (miniCursor.m > 11) { miniCursor.m = 0; miniCursor.y++; }
        renderMini();
    });

    // --- Event card ---------------------------------------------------------
    function card(e, compact) {
        const c = TYPE_COLOR[e.type];
        return (
            '<button type="button" draggable="true" data-event="' + e.id + '" ' +
            'class="cal-event w-full text-left px-2 py-1 rounded-md border cursor-grab active:cursor-grabbing transition-transform hover:-translate-y-0.5 ' + c.card + '">' +
            '<span class="block text-[11px] font-semibold truncate">' + e.patient + "</span>" +
            (compact ? "" : '<span class="block text-[10px] opacity-80 truncate">' + fmtHour(e.start) + " · " + e.doctor + "</span>") +
            "</button>"
        );
    }

    // --- Views --------------------------------------------------------------
    function renderMonth() {
        $("cal-label").textContent = MONTHS[cursor.m] + " " + cursor.y;
        const total = daysInMonth(cursor.y, cursor.m);
        const lead = firstWeekday(cursor.y, cursor.m);

        let html = '<div class="grid grid-cols-7 gap-px bg-border-color rounded-lg overflow-hidden min-w-[720px]">';
        DAYS.forEach(function (d) {
            html += '<div class="bg-gray-50 dark:bg-slate-800 py-2 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">' + d + "</div>";
        });
        for (let i = 0; i < lead; i++) {
            html += '<div class="bg-white dark:bg-slate-900 min-h-28"></div>';
        }
        for (let d = 1; d <= total; d++) {
            const dateIso = iso(cursor.y, cursor.m, d);
            const dayEvents = eventsOn(dateIso);
            const isToday = cursor.y === TODAY.y && cursor.m === TODAY.m && d === TODAY.d;
            html +=
                '<div class="bg-white dark:bg-slate-900 min-h-28 p-1.5 space-y-1 cal-drop" data-date="' + dateIso + '">' +
                '<div class="flex items-center justify-between">' +
                '<span class="' + (isToday ? "w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold" : "text-xs font-semibold text-gray-600 dark:text-gray-400") + '">' + d + "</span>" +
                (dayEvents.length > 2 ? '<span class="text-[10px] text-gray-400">+' + (dayEvents.length - 2) + "</span>" : "") +
                "</div>" +
                dayEvents.slice(0, 2).map((e) => card(e, true)).join("") +
                "</div>";
        }
        body.innerHTML = html + "</div>";
    }

    function timeGrid(dates) {
        const label = dates.length === 1
            ? DAYS[new Date(dates[0]).getUTCDay()] + ", " + dates[0].split("-")[2] + " " + MONTHS[cursor.m] + " " + cursor.y
            : MONTHS[cursor.m] + " " + cursor.y;
        $("cal-label").textContent = label;

        const cols = dates.length;
        let html = '<div class="min-w-[720px]"><div class="grid" style="grid-template-columns:64px repeat(' + cols + ',minmax(0,1fr))">';

        html += "<div></div>";
        dates.forEach(function (dt) {
            const parts = dt.split("-");
            const isToday = dt === iso(TODAY.y, TODAY.m, TODAY.d);
            html +=
                '<div class="pb-2 text-center border-b border-border-color">' +
                '<p class="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">' + DAYS[new Date(dt + "T00:00:00").getDay()] + "</p>" +
                '<p class="' + (isToday ? "mx-auto mt-1 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold" : "mt-1 text-sm font-bold text-gray-900") + '">' + parseInt(parts[2], 10) + "</p></div>";
        });

        HOURS.forEach(function (h) {
            html += '<div class="h-16 pr-2 pt-1 text-right text-[11px] text-gray-400 border-b border-border-color">' + fmtHour(h) + "</div>";
            dates.forEach(function (dt) {
                const slotEvents = eventsOn(dt).filter((e) => Math.floor(e.start) === h);
                const isNow = dt === iso(TODAY.y, TODAY.m, TODAY.d) && h === Math.floor(NOW_MINUTES / 60);
                html +=
                    '<div class="relative h-16 border-b border-l border-border-color p-1 space-y-1 cal-drop hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors" data-date="' + dt + '" data-hour="' + h + '">' +
                    (isNow
                        ? '<span class="absolute left-0 right-0 z-10 flex items-center pointer-events-none" style="top:' + ((NOW_MINUTES % 60) / 60) * 100 + '%">' +
                          '<span class="w-1.5 h-1.5 rounded-full bg-danger"></span><span class="flex-1 h-px bg-danger"></span></span>'
                        : "") +
                    slotEvents.map((e) => card(e, false)).join("") +
                    "</div>";
            });
        });

        body.innerHTML = html + "</div></div>";
    }

    function renderWeek() {
        const base = new Date(cursor.y, cursor.m, cursor.d);
        const start = new Date(base);
        start.setDate(base.getDate() - base.getDay());
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            dates.push(iso(d.getFullYear(), d.getMonth(), d.getDate()));
        }
        timeGrid(dates);
    }

    function renderDay() {
        timeGrid([iso(cursor.y, cursor.m, cursor.d)]);
    }

    function render() {
        if (view === "month") renderMonth();
        else if (view === "week") renderWeek();
        else renderDay();
        renderMini();
        calStats();
    }

    // --- View switching -----------------------------------------------------
    document.querySelectorAll(".view-btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
            view = btn.dataset.view;
            document.querySelectorAll(".view-btn").forEach(function (b) {
                const on = b === btn;
                b.setAttribute("aria-selected", on ? "true" : "false");
                b.className =
                    "view-btn px-4 py-1.5 rounded-lg text-sm font-medium " +
                    (on ? "bg-white dark:bg-slate-600 text-gray-900 shadow-sm" : "text-gray-500 dark:text-gray-400");
            });
            render();
        });
    });

    function shift(dir) {
        if (view === "month") {
            cursor.m += dir;
            if (cursor.m < 0) { cursor.m = 11; cursor.y--; }
            if (cursor.m > 11) { cursor.m = 0; cursor.y++; }
            miniCursor = { y: cursor.y, m: cursor.m };
        } else {
            const step = view === "week" ? 7 : 1;
            const d = new Date(cursor.y, cursor.m, cursor.d + dir * step);
            cursor = { y: d.getFullYear(), m: d.getMonth(), d: d.getDate() };
            miniCursor = { y: cursor.y, m: cursor.m };
        }
        render();
    }

    $("cal-prev").addEventListener("click", () => shift(-1));
    $("cal-next").addEventListener("click", () => shift(1));
    $("cal-today").addEventListener("click", function () {
        cursor = { y: TODAY.y, m: TODAY.m, d: TODAY.d };
        miniCursor = { y: TODAY.y, m: TODAY.m };
        render();
    });

    // --- Popups -------------------------------------------------------------
    function detailRow(label, value) {
        return (
            '<div class="flex justify-between gap-4 py-2 border-b border-border-color last:border-0">' +
            '<span class="text-sm text-gray-500 dark:text-gray-400">' + label + "</span>" +
            '<span class="text-sm font-medium text-gray-900 text-right">' + value + "</span></div>"
        );
    }

    let quickSlot = null;

    body.addEventListener("click", function (e) {
        const evBtn = e.target.closest("[data-event]");
        if (evBtn) {
            const ev = events.find((x) => x.id === parseInt(evBtn.dataset.event, 10));
            if (!ev) return;
            $("details-body").innerHTML =
                detailRow("Patient", ev.patient) +
                detailRow("Phone", ev.phone) +
                detailRow("Doctor", ev.doctor) +
                detailRow("Department", ev.dept) +
                detailRow("Type", '<span class="badge badge-blue">' + ev.type + "</span>") +
                detailRow("Date", ev.date) +
                detailRow("Time", fmtHour(ev.start) + " — " + fmtHour(ev.start + ev.dur));
            MC.openModal("details-modal");
            return;
        }

        const cell = e.target.closest(".cal-drop");
        if (!cell) return;
        quickSlot = { date: cell.dataset.date, hour: cell.dataset.hour ? parseFloat(cell.dataset.hour) : 9 };
        $("quick-slot").textContent = quickSlot.date + " at " + fmtHour(quickSlot.hour);
        $("q-patient").value = "";
        MC.openModal("quick-modal");
    });

    $("btn-quick").addEventListener("click", function () {
        quickSlot = { date: iso(cursor.y, cursor.m, cursor.d), hour: 9 };
        $("quick-slot").textContent = quickSlot.date + " at " + fmtHour(9);
        $("q-patient").value = "";
        MC.openModal("quick-modal");
    });

    $("quick-save").addEventListener("click", function () {
        const patient = $("q-patient").value.trim();
        if (!patient) {
            MC.toast("Patient name is required", "error");
            return;
        }
        events.push({
            id: Math.max.apply(null, events.map((e) => e.id)) + 1,
            patient: patient,
            doctor: $("q-doctor").value,
            dept: DEPTS[DOCTORS.indexOf($("q-doctor").value)] || "Cardiology",
            type: $("q-type").value,
            date: quickSlot.date,
            start: quickSlot.hour,
            dur: 0.5,
            phone: "(212) 555-0100",
        });
        MC.closeModal("quick-modal");
        MC.toast("Appointment booked for " + patient);
        render();
    });

    // --- Drag & drop --------------------------------------------------------
    let dragId = null;

    body.addEventListener("dragstart", function (e) {
        const el = e.target.closest("[data-event]");
        if (!el) return;
        dragId = parseInt(el.dataset.event, 10);
        el.classList.add("opacity-50");
    });

    body.addEventListener("dragend", function (e) {
        const el = e.target.closest("[data-event]");
        if (el) el.classList.remove("opacity-50");
    });

    body.addEventListener("dragover", function (e) {
        if (e.target.closest(".cal-drop")) e.preventDefault();
    });

    body.addEventListener("drop", function (e) {
        const cell = e.target.closest(".cal-drop");
        if (!cell || dragId === null) return;
        e.preventDefault();
        const ev = events.find((x) => x.id === dragId);
        if (ev) {
            ev.date = cell.dataset.date;
            if (cell.dataset.hour) ev.start = parseFloat(cell.dataset.hour);
            MC.toast(ev.patient + " moved to " + ev.date);
        }
        dragId = null;
        render();
    });

    // --- Misc ---------------------------------------------------------------
    document.querySelectorAll("[data-close]").forEach(function (btn) {
        btn.addEventListener("click", () => MC.closeModal(btn.dataset.close));
    });
    ["quick-modal", "details-modal"].forEach(MC.closeOnBackdrop);
    $("btn-print").addEventListener("click", () => window.print());

    // The default month view, mini calendar and stat cards are already
    // static markup in the HTML (see comments above), matching what
    // render() would have produced for the frozen TODAY on load. render()
    // stays available above for view switching, month/week/day navigation,
    // filter changes and the mutation handlers (quick-book, drag-and-drop
    // reschedule).
})();

// ==========================================================================
// appointment-detail.js
// ==========================================================================
/**
 * Dreams HMS — Appointment Detail Page Logic
 * Handles URL parameter parsing, token announcement, appointment rescheduling, and print triggers.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Handle URL Query Parameters for Dynamic Data Loading
    const urlParams = new URLSearchParams(window.location.search);
    const aptId = urlParams.get('id');
    const patientName = urlParams.get('patient');
    const status = urlParams.get('status');

    if (patientName) {
        const patientNameEl = document.getElementById('apmd-patient-name');
        if (patientNameEl) {
            patientNameEl.childNodes[0].textContent = patientName + ' ';
        }
    }
    if (aptId) {
        const aptIdEl = document.getElementById('apmd-apt-id');
        if (aptIdEl) aptIdEl.textContent = '#' + aptId;
    }
    if (status) {
        const statusTextEl = document.getElementById('apmd-status-text');
        if (statusTextEl) statusTextEl.textContent = status;
    }

    // 2. Print Appointment Slip Trigger
    document.querySelectorAll('[data-action="print"]').forEach(btn => {
        btn.addEventListener('click', () => {
            window.print();
        });
    });

    // 3. Call Token Announcement Trigger
    const callTokenBtn = document.getElementById('apmd-call-token-btn');
    if (callTokenBtn) {
        callTokenBtn.addEventListener('click', () => {
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    title: 'Calling Token T-012',
                    text: 'Announcing Token T-012 for Priya Raghavan to proceed to Room 4B (Dr. Sarah Chen)',
                    icon: 'info',
                    showCancelButton: true,
                    confirmButtonColor: '#3b82f6',
                    confirmButtonText: 'Announce Audio Prompt'
                }).then((result) => {
                    if (result.isConfirmed) {
                        Swal.fire({
                            title: 'Token Called!',
                            text: 'Waiting lounge audio prompt triggered successfully.',
                            icon: 'success',
                            confirmButtonColor: '#3b82f6'
                        });
                    }
                });
            } else {
                alert('Token T-012 called to Consultation Room 4B.');
            }
        });
    }

    // 4. Reschedule Appointment Trigger
    const rescheduleBtn = document.getElementById('apmd-reschedule-btn');
    if (rescheduleBtn) {
        rescheduleBtn.addEventListener('click', () => {
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    title: 'Reschedule Appointment',
                    html: `
                        <div class="text-left text-xs space-y-3 font-sans">
                            <div>
                                <label class="block font-semibold mb-1 text-slate-700 dark:text-slate-200">New Date</label>
                                <input type="text" id="swal-resched-date" placeholder="dd/mm/yyyy" data-provider="flatpickr" data-date-format="d-m-Y" data-default-date="20-07-2026" class="w-full border rounded p-2 bg-slate-50 dark:bg-slate-800 dark:border-slate-700" />
                            </div>
                            <div>
                                <label class="block font-semibold mb-1 text-slate-700 dark:text-slate-200">Time Slot</label>
                                <select id="swal-resched-time" class="w-full border rounded p-2 bg-slate-50 dark:bg-slate-800 dark:border-slate-700">
                                    <option value="10:00 AM">10:00 AM - 10:30 AM</option>
                                    <option value="02:00 PM">02:00 PM - 02:30 PM</option>
                                    <option value="04:30 PM">04:30 PM - 05:00 PM</option>
                                </select>
                            </div>
                        </div>
                    `,
                    showCancelButton: true,
                    confirmButtonColor: '#3b82f6',
                    confirmButtonText: 'Confirm Reschedule',
                    focusConfirm: false,
                    didOpen: (popup) => {
                        // The reschedule date field is inserted by SweetAlert2, after the
                        // page's initial-load flatpickr auto-init has already run, so it
                        // must be initialized here, scoped to this popup only.
                        if (typeof flatpickr !== "undefined") {
                            popup.querySelectorAll('[data-provider="flatpickr"]').forEach((el) => {
                                if (el._flatpickr) return;
                                const config = { disableMobile: true };
                                if (el.hasAttribute("data-date-format")) config.dateFormat = el.getAttribute("data-date-format");
                                if (el.hasAttribute("data-default-date")) config.defaultDate = el.getAttribute("data-default-date");
                                flatpickr(el, config);
                            });
                        }
                    }
                }).then((result) => {
                    if (result.isConfirmed) {
                        Swal.fire({
                            title: 'Rescheduled!',
                            text: 'Appointment rescheduled successfully.',
                            icon: 'success',
                            confirmButtonColor: '#3b82f6'
                        });
                    }
                });
            } else {
                alert('Reschedule dialog opened.');
            }
        });
    }

    // 5. Cancel Appointment Trigger
    const cancelBtn = document.getElementById('apmd-cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    title: 'Cancel Appointment?',
                    text: 'Are you sure you want to cancel appointment #APT-20265? This will release token T-012.',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#ef4444',
                    cancelButtonColor: '#64748b',
                    confirmButtonText: 'Yes, Cancel Appointment'
                }).then((result) => {
                    if (result.isConfirmed) {
                        Swal.fire({
                            title: 'Appointment Cancelled',
                            text: 'Status updated to Cancelled.',
                            icon: 'success',
                            confirmButtonColor: '#ef4444'
                        });
                    }
                });
            } else {
                if (confirm('Cancel appointment #APT-20265?')) {
                    alert('Appointment cancelled.');
                }
            }
        });
    }
});

// ==========================================================================
// appointment-requests.js
// ==========================================================================
// Dreams HMS — Appointment Requests
(function () {
    "use strict";
    if ((location.pathname.split("/").pop() || "index.html") !== "appointment-requests.html") return;

    const $ = (id) => document.getElementById(id);
    const tbody = $("tbody");
    if (!tbody) return;

    const STATUS = { New: "badge-blue", Pending: "badge-amber", Approved: "badge-green", Rejected: "badge-red" };
    const CHANNEL = { "Patient Portal": "badge-purple", Phone: "badge-gray", "Walk-in Desk": "badge-blue", Referral: "badge-emerald" };

    const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const fmt = (iso) => {
        const p = iso.split("-");
        return p[2] + " " + MONTHS[parseInt(p[1], 10) - 1] + " " + p[0];
    };

    let data = [
        { id: 1, code: "REQ-5011", patient: "James Morrison", phone: "(212) 555-0147", email: "j.morrison@mail.com", doctor: "Dr. Sarah Chen", dept: "Cardiology", date: "2026-07-20", time: "09:00 AM", channel: "Patient Portal", status: "New", reason: "Chest tightness on exertion", submitted: "2026-07-16" },
        { id: 2, code: "REQ-5012", patient: "Linda Whitfield", phone: "(212) 555-0182", email: "l.whitfield@mail.com", doctor: "Dr. Michael Reyes", dept: "Neurology", date: "2026-07-21", time: "10:00 AM", channel: "Phone", status: "New", reason: "Recurring migraine review", submitted: "2026-07-16" },
        { id: 3, code: "REQ-5013", patient: "Robert Castillo", phone: "(646) 555-0113", email: "r.castillo@mail.com", doctor: "Dr. Emily Carter", dept: "Orthopedics", date: "2026-07-22", time: "11:00 AM", channel: "Referral", status: "Pending", reason: "Knee pain, referred by GP", submitted: "2026-07-15" },
        { id: 4, code: "REQ-5014", patient: "Angela Brooks", phone: "(718) 555-0164", email: "a.brooks@mail.com", doctor: "Dr. David Okonkwo", dept: "Pediatrics", date: "2026-07-19", time: "02:00 PM", channel: "Patient Portal", status: "Approved", reason: "Annual wellness check", submitted: "2026-07-14" },
        { id: 5, code: "REQ-5015", patient: "Marcus Delgado", phone: "(347) 555-0198", email: "m.delgado@mail.com", doctor: "Dr. Laura Bennett", dept: "Oncology", date: "2026-07-23", time: "03:30 PM", channel: "Phone", status: "Pending", reason: "Chemotherapy scheduling", submitted: "2026-07-15" },
        { id: 6, code: "REQ-5016", patient: "Priya Raghavan", phone: "(212) 555-0121", email: "p.raghavan@mail.com", doctor: "Dr. Sarah Chen", dept: "Cardiology", date: "2026-07-18", time: "09:00 AM", channel: "Walk-in Desk", status: "Rejected", reason: "Blood pressure review", submitted: "2026-07-13" },
        { id: 7, code: "REQ-5017", patient: "Daniel Kowalski", phone: "(917) 555-0176", email: "d.kowalski@mail.com", doctor: "Dr. Michael Reyes", dept: "Neurology", date: "2026-07-24", time: "10:00 AM", channel: "Patient Portal", status: "New", reason: "Numbness in left hand", submitted: "2026-07-17" },
        { id: 8, code: "REQ-5018", patient: "Sofia Alvarez", phone: "(646) 555-0155", email: "s.alvarez@mail.com", doctor: "Dr. Emily Carter", dept: "Orthopedics", date: "2026-07-25", time: "11:00 AM", channel: "Referral", status: "Approved", reason: "Post-op shoulder review", submitted: "2026-07-12" },
        { id: 9, code: "REQ-5019", patient: "Naomi Fitzgerald", phone: "(212) 555-0190", email: "n.fitzgerald@mail.com", doctor: "Dr. Laura Bennett", dept: "Oncology", date: "2026-07-26", time: "02:00 PM", channel: "Patient Portal", status: "Pending", reason: "Second opinion requested", submitted: "2026-07-16" },
        { id: 10, code: "REQ-5020", patient: "Ethan Caldwell", phone: "(347) 555-0102", email: "e.caldwell@mail.com", doctor: "Dr. Sarah Chen", dept: "Cardiology", date: "2026-07-27", time: "09:00 AM", channel: "Phone", status: "New", reason: "Palpitations at night", submitted: "2026-07-17" },
        { id: 11, code: "REQ-5021", patient: "Camille Rousseau", phone: "(917) 555-0128", email: "c.rousseau@mail.com", doctor: "Dr. Michael Reyes", dept: "Neurology", date: "2026-07-28", time: "10:00 AM", channel: "Patient Portal", status: "Approved", reason: "EEG results discussion", submitted: "2026-07-11" },
        { id: 12, code: "REQ-5022", patient: "Victor Ramirez", phone: "(718) 555-0174", email: "v.ramirez@mail.com", doctor: "Dr. Laura Bennett", dept: "Oncology", date: "2026-07-29", time: "03:30 PM", channel: "Referral", status: "Rejected", reason: "Biopsy scheduling", submitted: "2026-07-10" },
        { id: 13, code: "REQ-5023", patient: "Hannah Whitmore", phone: "(212) 555-0163", email: "h.whitmore@mail.com", doctor: "Dr. David Okonkwo", dept: "Pediatrics", date: "2026-07-30", time: "09:00 AM", channel: "Walk-in Desk", status: "Pending", reason: "Immunisation schedule", submitted: "2026-07-15" },
        { id: 14, code: "REQ-5024", patient: "Grace Lindqvist", phone: "(646) 555-0136", email: "g.lindqvist@mail.com", doctor: "Dr. Emily Carter", dept: "Orthopedics", date: "2026-07-31", time: "11:00 AM", channel: "Patient Portal", status: "New", reason: "Lower back pain assessment", submitted: "2026-07-17" },
    ];

    let actionId = null;

    function detailUrl(r) {
        return "appointment-request-detail.html?" + new URLSearchParams({
            id: r.code, patient: r.patient, doctor: r.doctor, dept: r.dept,
            date: r.date, time: r.time, channel: r.channel, status: r.status,
        }).toString();
    }

    function stats() {
        $("stat-new").textContent = data.filter((r) => r.status === "New").length;
        $("stat-approved").textContent = data.filter((r) => r.status === "Approved").length;
        $("stat-pending").textContent = data.filter((r) => r.status === "Pending").length;
        $("stat-rejected").textContent = data.filter((r) => r.status === "Rejected").length;
    }

    function row(label, value) {
        return (
            '<div class="flex justify-between gap-4 py-2 border-b border-border-color last:border-0">' +
            '<span class="text-sm text-gray-500 dark:text-gray-400">' + label + "</span>" +
            '<span class="text-sm font-medium text-gray-900 text-right">' + value + "</span></div>"
        );
    }

    // --- Statistics (Appointment module component) ---------------------------
    MC.apptStats($("stats-row"), [
        { id: "stat-new", icon: "icon-inbox", label: "New Requests", tone: "primary", delta: 22.4, spark: [2, 4, 3, 5, 4, 6, 7] },
        { id: "stat-approved", icon: "icon-circle-check", label: "Approved", tone: "emerald", delta: 10.6, spark: [3, 4, 3, 5, 6, 5, 7] },
        { id: "stat-pending", icon: "icon-clock", label: "Pending", tone: "amber", delta: -2.8, spark: [5, 4, 5, 4, 3, 4, 3] },
        { id: "stat-rejected", icon: "icon-circle-x", label: "Rejected", tone: "danger", delta: -5.9, spark: [3, 2, 3, 2, 2, 1, 2] },
    ]);

    const grid = MC.grid({
        tbody: tbody,
        data: data,
        pageSize: 10,
        skipInitialRender: true,
        search: $("search"),
        filters: [
            { el: $("filter-doctor"), match: (r, v) => r.doctor === v },
            { el: $("filter-channel"), match: (r, v) => r.channel === v },
            { el: $("filter-status"), match: (r, v) => r.status === v },
        ],
        info: $("info"),
        pager: $("pager"),
        selectAll: $("select-all"),
        bulkBar: $("bulk-bar"),
        bulkCount: $("bulk-count"),
        empty: { icon: "icon-inbox", title: "No requests found", text: "Try adjusting your search or filters." },
        columns: [
            { render: (r) => '<a class="font-medium text-primary" href="' + detailUrl(r) + '">' + r.code + "</a>" },
            {
                render: (r) =>
                    '<div><p class="font-medium text-gray-900">' + r.patient + "</p>" +
                    '<p class="text-xs text-gray-500 dark:text-gray-400">' + r.phone + "</p></div>",
            },
            {
                render: (r) =>
                    '<div><p class="text-gray-900">' + r.doctor + "</p>" +
                    '<p class="text-xs text-gray-500 dark:text-gray-400">' + r.dept + "</p></div>",
            },
            { render: (r) => fmt(r.date) },
            { render: (r) => r.time },
            { render: (r) => MC.badge(CHANNEL, r.channel) },
            { render: (r) => MC.badge(STATUS, r.status) },
            {
                cls: "text-right",
                render: (r) =>
                    MC.actions(r.id, [
                        { label: "View Details", icon: "icon-eye", act: "view" },
                        { label: "Approve", icon: "icon-circle-check", act: "approve" },
                        { label: "Suggest Slot", icon: "icon-calendar-clock", act: "suggest" },
                        { label: "Reject", icon: "icon-circle-x", act: "reject", danger: true },
                    ]),
            },
        ],
    });

    function refresh() {
        grid.setData(data);
        stats();
    }

    tbody.addEventListener("click", function (e) {
        const btn = e.target.closest("[data-act]");
        if (!btn) return;
        const rec = data.find((r) => r.id === parseInt(btn.dataset.id, 10));
        if (!rec) return;
        actionId = rec.id;

        switch (btn.dataset.act) {
            case "view":
                $("view-body").innerHTML =
                    row("Request ID", rec.code) +
                    row("Patient", rec.patient) +
                    row("Phone", rec.phone) +
                    row("Email", rec.email) +
                    row("Requested Doctor", rec.doctor) +
                    row("Department", rec.dept) +
                    row("Preferred Date", fmt(rec.date)) +
                    row("Requested Time", rec.time) +
                    row("Channel", MC.badge(CHANNEL, rec.channel)) +
                    row("Status", MC.badge(STATUS, rec.status)) +
                    row("Submitted", fmt(rec.submitted)) +
                    row("Reason", rec.reason);
                MC.openModal("view-modal");
                break;
            case "approve":
                if (rec.status === "Approved") {
                    MC.toast("Request is already approved", "info");
                    return;
                }
                $("approve-body").innerHTML =
                    row("Request ID", rec.code) +
                    row("Patient", rec.patient) +
                    row("Doctor", rec.doctor) +
                    row("Date", fmt(rec.date)) +
                    row("Time", rec.time);
                MC.openModal("approve-modal");
                break;
            case "suggest":
                $("suggest-name").textContent = rec.code + " · " + rec.patient;
                $("sg-date").value = rec.date;
                MC.openModal("suggest-modal");
                break;
            case "reject":
                $("reject-name").textContent = rec.code + " · " + rec.patient;
                MC.openModal("reject-modal");
                break;
        }
    });

    $("approve-confirm").addEventListener("click", function () {
        const rec = data.find((r) => r.id === actionId);
        if (rec) rec.status = "Approved";
        const notify = $("approve-notify").checked;
        MC.closeModal("approve-modal");
        MC.toast(notify ? "Request approved and patient notified" : "Request approved");
        refresh();
    });

    $("reject-confirm").addEventListener("click", function () {
        const rec = data.find((r) => r.id === actionId);
        if (rec) rec.status = "Rejected";
        MC.closeModal("reject-modal");
        MC.toast("Request rejected · " + $("reject-reason").value, "info");
        refresh();
    });

    $("suggest-confirm").addEventListener("click", function () {
        const rec = data.find((r) => r.id === actionId);
        if (rec) {
            rec.date = $("sg-date").value || rec.date;
            rec.time = $("sg-time").value;
            rec.status = "Pending";
        }
        MC.closeModal("suggest-modal");
        MC.toast("Alternative slot sent to patient");
        refresh();
    });

    document.querySelectorAll("[data-bulk]").forEach(function (btn) {
        btn.addEventListener("click", function () {
            const ids = grid.selected().map(Number);
            if (!ids.length) return;
            const approve = btn.dataset.bulk === "approve";
            data.forEach(function (r) {
                if (ids.indexOf(r.id) !== -1) r.status = approve ? "Approved" : "Rejected";
            });
            MC.toast(ids.length + " requests " + (approve ? "approved" : "rejected"));
            grid.clearSelection();
            refresh();
        });
    });

    $("btn-reset").addEventListener("click", function () {
        $("search").value = "";
        $("filter-doctor").value = "";
        $("filter-channel").value = "";
        $("filter-status").value = "";
        grid.refresh();
        MC.toast("Filters cleared", "info");
    });

    $("btn-print").addEventListener("click", () => window.print());

    $("btn-export").addEventListener("click", function () {
        const head = ["Request ID", "Patient", "Phone", "Email", "Doctor", "Department", "Preferred Date", "Time", "Channel", "Status"];
        const rows = data.map((r) => [r.code, r.patient, r.phone, r.email, r.doctor, r.dept, r.date, r.time, r.channel, r.status]);
        const csv = [head].concat(rows)
            .map((line) => line.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(","))
            .join("\n");
        const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
        const a = document.createElement("a");
        a.href = url;
        a.download = "appointment-requests.csv";
        a.click();
        URL.revokeObjectURL(url);
        MC.toast("Requests exported");
    });

    document.querySelectorAll("[data-close]").forEach(function (btn) {
        btn.addEventListener("click", () => MC.closeModal(btn.dataset.close));
    });
    ["approve-modal", "reject-modal", "suggest-modal", "view-modal"].forEach(MC.closeOnBackdrop);
    stats();
})();

// ==========================================================================
// appointments.js
// ==========================================================================
// Dreams HMS — Appointment List
(function () {
    "use strict";
    if ((location.pathname.split("/").pop() || "index.html") !== "appointments.html") return;

    const STATUS = {
        Pending: "badge-amber",
        Confirmed: "badge-blue",
        "Checked In": "badge-purple",
        Completed: "badge-green",
        Cancelled: "badge-red",
    };
    const PAYMENT = {
        Paid: "badge-green",
        Unpaid: "badge-red",
        Insurance: "badge-blue",
        Refunded: "badge-gray",
    };
    const TYPE = {
        Consultation: "badge-blue",
        "Follow-Up": "badge-green",
        Emergency: "badge-red",
        Procedure: "badge-purple",
        "Check-Up": "badge-gray",
    };

    const TODAY = "2026-07-17";

    let data = [
        { id: 1, code: "APT-20260", patient: "James Morrison", phone: "(212) 555-0147", doctor: "Dr. Sarah Chen", dept: "Cardiology", date: TODAY, slot: "09:00 AM - 09:30 AM", type: "Consultation", status: "Confirmed", payment: "Paid", fee: 180, notes: "Chest tightness on exertion." },
        { id: 2, code: "APT-20261", patient: "Linda Whitfield", phone: "(212) 555-0182", doctor: "Dr. Michael Reyes", dept: "Neurology", date: TODAY, slot: "09:30 AM - 10:00 AM", type: "Follow-Up", status: "Checked In", payment: "Insurance", fee: 140, notes: "Post-migraine review." },
        { id: 3, code: "APT-20262", patient: "Robert Castillo", phone: "(646) 555-0113", doctor: "Dr. Emily Carter", dept: "Orthopedics", date: TODAY, slot: "10:00 AM - 10:30 AM", type: "Procedure", status: "Pending", payment: "Unpaid", fee: 420, notes: "Knee arthroscopy consult." },
        { id: 4, code: "APT-20263", patient: "Angela Brooks", phone: "(718) 555-0164", doctor: "Dr. David Okonkwo", dept: "Pediatrics", date: TODAY, slot: "11:00 AM - 11:30 AM", type: "Check-Up", status: "Completed", payment: "Paid", fee: 120, notes: "Annual wellness visit." },
        { id: 5, code: "APT-20264", patient: "Marcus Delgado", phone: "(347) 555-0198", doctor: "Dr. Laura Bennett", dept: "Oncology", date: TODAY, slot: "02:00 PM - 02:30 PM", type: "Follow-Up", status: "Confirmed", payment: "Insurance", fee: 260, notes: "Chemotherapy cycle review." },
        { id: 6, code: "APT-20265", patient: "Priya Raghavan", phone: "(212) 555-0121", doctor: "Dr. Sarah Chen", dept: "Cardiology", date: TODAY, slot: "03:30 PM - 04:00 PM", type: "Consultation", status: "Cancelled", payment: "Refunded", fee: 180, notes: "Patient requested cancellation." },
        { id: 7, code: "APT-20266", patient: "Daniel Kowalski", phone: "(917) 555-0176", doctor: "Dr. Michael Reyes", dept: "Neurology", date: "2026-07-18", slot: "09:00 AM - 09:30 AM", type: "Consultation", status: "Confirmed", payment: "Paid", fee: 200, notes: "Numbness in left hand." },
        { id: 8, code: "APT-20267", patient: "Sofia Alvarez", phone: "(646) 555-0155", doctor: "Dr. Emily Carter", dept: "Orthopedics", date: "2026-07-18", slot: "10:00 AM - 10:30 AM", type: "Follow-Up", status: "Pending", payment: "Unpaid", fee: 130, notes: "Post-op shoulder review." },
        { id: 9, code: "APT-20268", patient: "Gregory Hollis", phone: "(718) 555-0139", doctor: "Dr. David Okonkwo", dept: "Emergency", date: "2026-07-18", slot: "11:00 AM - 11:30 AM", type: "Emergency", status: "Completed", payment: "Insurance", fee: 540, notes: "Laceration repair." },
        { id: 10, code: "APT-20269", patient: "Naomi Fitzgerald", phone: "(212) 555-0190", doctor: "Dr. Laura Bennett", dept: "Oncology", date: "2026-07-19", slot: "02:00 PM - 02:30 PM", type: "Consultation", status: "Confirmed", payment: "Paid", fee: 240, notes: "Second opinion requested." },
        { id: 11, code: "APT-20270", patient: "Ethan Caldwell", phone: "(347) 555-0102", doctor: "Dr. Sarah Chen", dept: "Cardiology", date: "2026-07-19", slot: "09:30 AM - 10:00 AM", type: "Check-Up", status: "Pending", payment: "Unpaid", fee: 150, notes: "Blood pressure monitoring." },
        { id: 12, code: "APT-20271", patient: "Camille Rousseau", phone: "(917) 555-0128", doctor: "Dr. Michael Reyes", dept: "Neurology", date: "2026-07-20", slot: "10:00 AM - 10:30 AM", type: "Follow-Up", status: "Confirmed", payment: "Insurance", fee: 160, notes: "EEG results discussion." },
        { id: 13, code: "APT-20272", patient: "Theodore Nakamura", phone: "(646) 555-0187", doctor: "Dr. Emily Carter", dept: "Orthopedics", date: "2026-07-20", slot: "11:00 AM - 11:30 AM", type: "Consultation", status: "Cancelled", payment: "Refunded", fee: 170, notes: "Doctor unavailable." },
        { id: 14, code: "APT-20273", patient: "Hannah Whitmore", phone: "(212) 555-0163", doctor: "Dr. David Okonkwo", dept: "Pediatrics", date: "2026-07-21", slot: "09:00 AM - 09:30 AM", type: "Check-Up", status: "Confirmed", payment: "Paid", fee: 110, notes: "Immunisation schedule." },
        { id: 15, code: "APT-20274", patient: "Victor Ramirez", phone: "(718) 555-0174", doctor: "Dr. Laura Bennett", dept: "Oncology", date: "2026-07-21", slot: "03:30 PM - 04:00 PM", type: "Procedure", status: "Pending", payment: "Insurance", fee: 680, notes: "Biopsy scheduling." },
        { id: 16, code: "APT-20275", patient: "Isabelle Duncan", phone: "(347) 555-0145", doctor: "Dr. Sarah Chen", dept: "Cardiology", date: "2026-07-22", slot: "02:00 PM - 02:30 PM", type: "Follow-Up", status: "Completed", payment: "Paid", fee: 150, notes: "Stent follow-up, stable." },
        { id: 17, code: "APT-20276", patient: "Omar Haddad", phone: "(917) 555-0119", doctor: "Dr. David Okonkwo", dept: "Emergency", date: "2026-07-22", slot: "10:00 AM - 10:30 AM", type: "Emergency", status: "Checked In", payment: "Unpaid", fee: 460, notes: "Severe abdominal pain." },
        { id: 18, code: "APT-20277", patient: "Grace Lindqvist", phone: "(646) 555-0136", doctor: "Dr. Emily Carter", dept: "Orthopedics", date: "2026-07-23", slot: "09:30 AM - 10:00 AM", type: "Consultation", status: "Confirmed", payment: "Paid", fee: 190, notes: "Lower back pain assessment." },
    ];

    const $ = (id) => document.getElementById(id);
    const tbody = $("tbody");
    if (!tbody) return;

    function detailUrl(r) {
        return "appointment-detail.html?" + new URLSearchParams({
            id: r.code, patient: r.patient, doctor: r.doctor, dept: r.dept,
            date: r.date, slot: r.slot, type: r.type, status: r.status,
        }).toString();
    }

    let editingId = null;
    let actionId = null;

    const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    function fmtDate(iso) {
        const parts = iso.split("-");
        return parts[2] + " " + MONTHS[parseInt(parts[1], 10) - 1] + " " + parts[0];
    }

    function avatarPhoto(seed) {
        let h = 0;
        const s = String(seed);
        for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
        return "assets/img/avatar/avatar-" + String((h % 30) + 1).padStart(2, "0") + ".jpg";
    }

    function stats() {
        $("stat-total").textContent = data.length;
        $("stat-today").textContent = data.filter((r) => r.date === TODAY).length;
        $("stat-pending").textContent = data.filter((r) => r.status === "Pending").length;
        $("stat-confirmed").textContent = data.filter((r) => r.status === "Confirmed").length;
        $("stat-completed").textContent = data.filter((r) => r.status === "Completed").length;
        $("stat-cancelled").textContent = data.filter((r) => r.status === "Cancelled").length;
    }

    // --- Statistics (Appointment module component) ---------------------------
    MC.apptStats($("stats-row"), [
        { id: "stat-total", icon: "icon-calendar-days", label: "Total Appointments", tone: "primary", delta: 12.5, spark: [18, 22, 19, 26, 24, 31, 28] },
        { id: "stat-today", icon: "icon-calendar-check", label: "Today", tone: "sky", delta: 4.2, spark: [4, 6, 5, 7, 6, 8, 6] },
        { id: "stat-pending", icon: "icon-clock", label: "Pending", tone: "amber", delta: -6.1, spark: [9, 8, 10, 7, 6, 5, 4] },
        { id: "stat-confirmed", icon: "icon-user-check", label: "Confirmed", tone: "purple", delta: 8.9, spark: [10, 12, 11, 14, 13, 16, 18] },
        { id: "stat-completed", icon: "icon-circle-check", label: "Completed", tone: "emerald", delta: 15.3, spark: [6, 8, 7, 10, 12, 11, 14] },
        { id: "stat-cancelled", icon: "icon-circle-x", label: "Cancelled", tone: "danger", delta: -3.4, spark: [5, 4, 6, 3, 4, 2, 3] },
    ]);

    const grid = MC.grid({
        tbody: tbody,
        data: data,
        pageSize: 10,
        skipInitialRender: true,
        search: $("search"),
        filters: [
            { el: $("filter-dept"), match: (r, v) => r.dept === v },
            { el: $("filter-doctor"), match: (r, v) => r.doctor === v },
            { el: $("filter-status"), match: (r, v) => r.status === v },
        ],
        info: $("info"),
        pager: $("pager"),
        selectAll: $("select-all"),
        bulkBar: $("bulk-bar"),
        bulkCount: $("bulk-count"),
        empty: {
            icon: "icon-calendar-x",
            title: "No appointments found",
            text: "Try adjusting your search or filters, or book a new appointment.",
        },
        columns: [
            { render: (r) => '<a class="font-medium text-primary" href="' + detailUrl(r) + '">' + r.code + "</a>" },
            {
                render: (r) =>
                    '<div class="flex items-center gap-2.5">' +
                    '<span class="avatar" style="overflow:hidden"><img src="' + avatarPhoto(r.patient) + '" alt="" style="width:100%;height:100%;object-fit:cover"></span>' +
                    '<div><p class="font-medium text-gray-900">' + r.patient + "</p>" +
                    '<p class="text-xs text-gray-500 dark:text-gray-400">' + r.phone + "</p></div></div>",
            },
            { render: (r) => r.doctor },
            { render: (r) => r.dept },
            { render: (r) => fmtDate(r.date) },
            { render: (r) => '<span class="whitespace-nowrap">' + r.slot + "</span>" },
            { render: (r) => MC.badge(TYPE, r.type) },
            { render: (r) => MC.badge(STATUS, r.status) },
            { render: (r) => MC.badge(PAYMENT, r.payment) },
            {
                cls: "text-right",
                render: (r) =>
                    MC.actions(r.id, [
                        { label: "View", icon: "icon-eye", act: "view" },
                        { label: "Edit", icon: "icon-pencil", act: "edit" },
                        { label: "Reschedule", icon: "icon-calendar-clock", act: "resched" },
                        { label: "Check In", icon: "icon-user-check", act: "checkin" },
                        { label: "Send Reminder", icon: "icon-bell-plus", act: "remind" },
                        { label: "Collect Payment", icon: "icon-wallet", act: "pay" },
                        { label: "Print", icon: "icon-printer", act: "print" },
                        { label: "Cancel", icon: "icon-circle-x", act: "cancel" },
                        { label: "Delete", icon: "icon-trash-2", act: "delete", danger: true },
                    ]),
            },
        ],
    });

    function refresh() {
        grid.setData(data);
        stats();
    }

    // --- Form ---------------------------------------------------------------
    function openForm(row) {
        editingId = row ? row.id : null;
        $("m-title").textContent = row ? "Edit Appointment" : "New Appointment";
        $("f-patient").value = row ? row.patient : "";
        $("f-phone").value = row ? row.phone : "";
        $("f-doctor").value = row ? row.doctor : "Dr. Sarah Chen";
        $("f-dept").value = row ? row.dept : "Cardiology";
        $("f-date").value = row ? row.date : "";
        $("f-time").value = row ? row.slot : "09:00 AM - 09:30 AM";
        $("f-type").value = row ? row.type : "Consultation";
        $("f-status").value = row ? row.status : "Pending";
        $("f-payment").value = row ? row.payment : "Unpaid";
        $("f-fee").value = row ? row.fee : "";
        $("f-notes").value = row ? row.notes : "";
        MC.openModal("form-modal");
    }

    $("btn-add").addEventListener("click", () => openForm(null));
    $("m-close").addEventListener("click", () => MC.closeModal("form-modal"));
    $("m-cancel").addEventListener("click", () => MC.closeModal("form-modal"));

    $("btn-save").addEventListener("click", function () {
        const patient = $("f-patient").value.trim();
        if (!patient) {
            MC.toast("Patient name is required", "error");
            return;
        }
        const payload = {
            patient: patient,
            phone: $("f-phone").value.trim() || "(212) 555-0100",
            doctor: $("f-doctor").value,
            dept: $("f-dept").value,
            date: $("f-date").value || TODAY,
            slot: $("f-time").value,
            type: $("f-type").value,
            status: $("f-status").value,
            payment: $("f-payment").value,
            fee: parseInt($("f-fee").value, 10) || 0,
            notes: $("f-notes").value.trim(),
        };

        if (editingId) {
            Object.assign(data.find((r) => r.id === editingId), payload);
            MC.toast("Appointment updated");
        } else {
            const nextId = Math.max.apply(null, data.map((r) => r.id)) + 1;
            data.push(Object.assign({ id: nextId, code: "APT-" + (20259 + nextId) }, payload));
            MC.toast("Appointment created");
        }
        MC.closeModal("form-modal");
        refresh();
    });

    // --- Row actions --------------------------------------------------------
    function detailRow(label, value) {
        return (
            '<div class="flex justify-between gap-4 py-2 border-b border-border-color last:border-0">' +
            '<span class="text-sm text-gray-500 dark:text-gray-400">' + label + "</span>" +
            '<span class="text-sm font-medium text-gray-900 text-right">' + value + "</span></div>"
        );
    }

    tbody.addEventListener("click", function (e) {
        const btn = e.target.closest("[data-act]");
        if (!btn) return;
        const row = data.find((r) => r.id === parseInt(btn.dataset.id, 10));
        if (!row) return;
        actionId = row.id;

        switch (btn.dataset.act) {
            case "view":
                $("view-body").innerHTML =
                    detailRow("Appointment ID", row.code) +
                    detailRow("Patient", row.patient) +
                    detailRow("Phone", row.phone) +
                    detailRow("Doctor", row.doctor) +
                    detailRow("Department", row.dept) +
                    detailRow("Date", fmtDate(row.date)) +
                    detailRow("Time Slot", row.slot) +
                    detailRow("Visit Type", MC.badge(TYPE, row.type)) +
                    detailRow("Status", MC.badge(STATUS, row.status)) +
                    detailRow("Payment", MC.badge(PAYMENT, row.payment)) +
                    detailRow("Fee", "$" + row.fee.toFixed(2)) +
                    detailRow("Notes", row.notes || "—");
                MC.openModal("view-modal");
                break;
            case "edit":
                openForm(row);
                break;
            case "resched":
                $("resched-name").textContent = row.patient + " · " + row.code;
                $("rs-date").value = row.date;
                $("rs-time").value = row.slot;
                MC.openModal("resched-modal");
                break;
            case "checkin":
                if (row.status === "Cancelled") {
                    MC.toast("Cannot check in a cancelled appointment", "error");
                    break;
                }
                row.status = "Checked In";
                MC.toast(row.patient + " checked in");
                refresh();
                break;
            case "remind":
                $("remind-name").textContent = row.patient + " · " + row.code;
                $("rm-message").value =
                    "Hi " + row.patient.split(" ")[0] + ", this is a reminder of your " + row.type.toLowerCase() +
                    " with " + row.doctor + " on " + fmtDate(row.date) + " at " + row.slot.split(" - ")[0] +
                    ". Reply STOP to opt out.";
                MC.openModal("remind-modal");
                break;
            case "pay":
                if (row.payment === "Paid") {
                    MC.toast("This appointment is already paid", "info");
                    break;
                }
                if (row.payment === "Refunded") {
                    MC.toast("This appointment was refunded", "info");
                    break;
                }
                $("pay-name").textContent = row.patient + " · " + row.code;
                $("pay-summary").innerHTML =
                    detailRow("Consultation Fee", "$" + row.fee.toFixed(2)) +
                    detailRow("Current Status", MC.badge(PAYMENT, row.payment)) +
                    detailRow("Doctor", row.doctor);
                $("pm-amount").value = row.fee;
                MC.openModal("pay-modal");
                break;
            case "print":
                MC.toast("Sending " + row.code + " to printer", "info");
                window.print();
                break;
            case "cancel":
                $("cancel-name").textContent = row.patient + " · " + row.code;
                MC.openModal("cancel-modal");
                break;
            case "delete":
                MC.confirmDelete(row.patient + " · " + row.code, function () {
                    data = data.filter((r) => r.id !== row.id);
                    MC.toast("Appointment deleted");
                    refresh();
                });
                break;
        }
    });

    $("rs-confirm").addEventListener("click", function () {
        const row = data.find((r) => r.id === actionId);
        if (row) {
            row.date = $("rs-date").value || row.date;
            row.slot = $("rs-time").value;
            row.status = "Confirmed";
        }
        MC.closeModal("resched-modal");
        MC.toast("Appointment rescheduled");
        refresh();
    });

    $("cancel-confirm").addEventListener("click", function () {
        const row = data.find((r) => r.id === actionId);
        if (row) {
            row.status = "Cancelled";
            if (row.payment === "Paid") row.payment = "Refunded";
        }
        MC.closeModal("cancel-modal");
        MC.toast("Appointment cancelled");
        refresh();
    });

    $("view-print").addEventListener("click", () => window.print());

    $("rm-send").addEventListener("click", function () {
        const channels = [];
        if ($("rm-sms").checked) channels.push("SMS");
        if ($("rm-email").checked) channels.push("email");
        if ($("rm-call").checked) channels.push("phone call");
        if (!channels.length) {
            MC.toast("Select at least one channel", "error");
            return;
        }
        MC.closeModal("remind-modal");
        MC.toast("Reminder sent via " + channels.join(" and "));
    });

    $("pm-confirm").addEventListener("click", function () {
        const row = data.find((r) => r.id === actionId);
        const amount = parseFloat($("pm-amount").value) || 0;
        if (amount <= 0) {
            MC.toast("Enter an amount greater than zero", "error");
            return;
        }
        if (row) {
            row.payment = $("pm-method").value === "Insurance" ? "Insurance" : "Paid";
            row.fee = amount;
        }
        MC.closeModal("pay-modal");
        MC.toast("$" + amount.toFixed(2) + " collected via " + $("pm-method").value);
        refresh();
    });

    // --- Bulk actions -------------------------------------------------------
    document.querySelectorAll("[data-bulk]").forEach(function (btn) {
        btn.addEventListener("click", function () {
            const ids = grid.selected().map(Number);
            if (!ids.length) return;
            const mode = btn.dataset.bulk;

            if (mode === "delete") {
                MC.confirmDelete(ids.length + " appointments", function () {
                    data = data.filter((r) => ids.indexOf(r.id) === -1);
                    MC.toast(ids.length + " appointments deleted");
                    grid.clearSelection();
                    refresh();
                });
                return;
            }

            data.forEach(function (r) {
                if (ids.indexOf(r.id) !== -1) r.status = mode === "confirm" ? "Confirmed" : "Cancelled";
            });
            MC.toast(ids.length + " appointments " + (mode === "confirm" ? "confirmed" : "cancelled"));
            grid.clearSelection();
            refresh();
        });
    });

    // --- Toolbar ------------------------------------------------------------
    $("btn-reset").addEventListener("click", function () {
        $("search").value = "";
        $("filter-dept").value = "";
        $("filter-doctor").value = "";
        $("filter-status").value = "";
        $("filter-range").value = "";
        grid.refresh();
        MC.toast("Filters cleared", "info");
    });

    $("btn-print").addEventListener("click", () => window.print());

    $("btn-export").addEventListener("click", function () {
        const head = ["ID", "Patient", "Phone", "Doctor", "Department", "Date", "Slot", "Type", "Status", "Payment", "Fee"];
        const rows = data.map((r) => [r.code, r.patient, r.phone, r.doctor, r.dept, r.date, r.slot, r.type, r.status, r.payment, r.fee]);
        const csv = [head].concat(rows)
            .map((line) => line.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(","))
            .join("\n");
        const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
        const a = document.createElement("a");
        a.href = url;
        a.download = "appointments.csv";
        a.click();
        URL.revokeObjectURL(url);
        MC.toast("Exported " + data.length + " appointments");
    });

    // --- Modals -------------------------------------------------------------
    document.querySelectorAll("[data-close]").forEach(function (btn) {
        btn.addEventListener("click", () => MC.closeModal(btn.dataset.close));
    });
    ["form-modal", "view-modal", "resched-modal", "cancel-modal", "remind-modal", "pay-modal", "del-modal"].forEach(MC.closeOnBackdrop);
    MC.initDeleteModal();

    stats();
})();

// ==========================================================================
// book-appointment.js
// ==========================================================================
// Dreams HMS — Book Appointment
(function () {
    "use strict";

    const $ = (id) => document.getElementById(id);
    const form = $("book-form");
    if (!form) return;

    const DOCTORS = {
        Cardiology: ["Dr. Sarah Chen", "Dr. Isabelle Duncan"],
        Neurology: ["Dr. Michael Reyes", "Dr. Camille Rousseau"],
        Orthopedics: ["Dr. Emily Carter", "Dr. Theodore Nakamura"],
        Pediatrics: ["Dr. David Okonkwo", "Dr. Hannah Whitmore"],
        Oncology: ["Dr. Laura Bennett", "Dr. Victor Ramirez"],
        Emergency: ["Dr. Gregory Hollis", "Dr. Omar Haddad"],
    };

    const PATIENTS = [
        { id: "PT-2026-0184", name: "James Morrison", phone: "(212) 555-0147", email: "j.morrison@mail.com", age: 54, gender: "Male", blood: "A+" },
        { id: "PT-2026-0185", name: "Linda Whitfield", phone: "(212) 555-0182", email: "l.whitfield@mail.com", age: 43, gender: "Female", blood: "O-" },
        { id: "PT-2026-0186", name: "Robert Castillo", phone: "(646) 555-0113", email: "r.castillo@mail.com", age: 61, gender: "Male", blood: "B+" },
        { id: "PT-2026-0187", name: "Angela Brooks", phone: "(718) 555-0164", email: "a.brooks@mail.com", age: 9, gender: "Female", blood: "AB+" },
        { id: "PT-2026-0188", name: "Marcus Delgado", phone: "(347) 555-0198", email: "m.delgado@mail.com", age: 47, gender: "Male", blood: "O+" },
        { id: "PT-2026-0189", name: "Priya Raghavan", phone: "(212) 555-0121", email: "p.raghavan@mail.com", age: 35, gender: "Female", blood: "A-" },
    ];

    const SLOTS = [
        { label: "09:00 AM", taken: false },
        { label: "09:30 AM", taken: true },
        { label: "10:00 AM", taken: false },
        { label: "10:30 AM", taken: false },
        { label: "11:00 AM", taken: true },
        { label: "11:30 AM", taken: false },
        { label: "12:00 PM", taken: false },
        { label: "02:00 PM", taken: false },
        { label: "02:30 PM", taken: true },
        { label: "03:00 PM", taken: false },
        { label: "03:30 PM", taken: false },
        { label: "04:00 PM", taken: false },
    ];

    let mode = "existing";
    let selectedPatient = null;
    let selectedSlot = null;

    // --- Statistics (Appointment module component) ---------------------------
    MC.apptStats($("stats-row"), [
        { id: "stat-slots", icon: "icon-clock-3", label: "Slots Today", tone: "primary", delta: 0, meta: "per doctor", spark: [12, 12, 12, 12, 12, 12, 12] },
        { id: "stat-available", icon: "icon-circle-check", label: "Available", tone: "emerald", delta: 6.7, meta: "vs yesterday", spark: [7, 8, 7, 9, 8, 10, 9] },
        { id: "stat-booked", icon: "icon-user-check", label: "Booked", tone: "amber", delta: 9.1, meta: "vs yesterday", spark: [2, 3, 2, 3, 3, 4, 3] },
        { id: "stat-next", icon: "icon-calendar-clock", label: "Next Available", tone: "sky", delta: null, meta: "earliest free slot", spark: [] },
    ]);

    function bookStats() {
        const free = SLOTS.filter((s) => !s.taken);
        $("stat-slots").textContent = SLOTS.length;
        $("stat-available").textContent = free.length;
        $("stat-booked").textContent = SLOTS.length - free.length;
        $("stat-next").textContent = free.length ? free[0].label : "None";
    }

    // --- Patient mode -------------------------------------------------------
    document.querySelectorAll(".pt-btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
            mode = btn.dataset.mode;
            document.querySelectorAll(".pt-btn").forEach(function (b) {
                const on = b === btn;
                b.setAttribute("aria-selected", on ? "true" : "false");
                b.className =
                    "pt-btn px-4 py-1.5 rounded-lg text-sm font-medium " +
                    (on ? "bg-white dark:bg-slate-600 text-gray-900 shadow-sm" : "text-gray-500 dark:text-gray-400");
            });
            $("pane-existing").classList.toggle("hidden", mode !== "existing");
            $("pane-new").classList.toggle("hidden", mode !== "new");
        });
    });

    // --- Patient search -----------------------------------------------------
    function renderResults(term) {
        const list = $("p-results");
        const q = term.trim().toLowerCase();
        if (!q) {
            list.innerHTML =
                '<p class="p-4 text-sm text-gray-500 dark:text-gray-400 text-center">Start typing to search patient records.</p>';
            return;
        }
        const hits = PATIENTS.filter(
            (p) => p.name.toLowerCase().includes(q) || p.phone.includes(q) || p.id.toLowerCase().includes(q),
        );
        if (!hits.length) {
            list.innerHTML =
                '<div class="p-6 text-center"><i class="icon-user-x text-xl text-gray-300 dark:text-gray-600"></i>' +
                '<p class="text-sm font-semibold text-gray-900 mt-2">No patient found</p>' +
                '<p class="text-xs text-gray-500 dark:text-gray-400">Switch to New Patient to register them.</p></div>';
            return;
        }
        list.innerHTML = hits
            .map(
                (p) =>
                    '<button type="button" data-patient="' + p.id + '" class="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">' +
                    '<span class="avatar bg-primary text-xs">' + p.name.split(" ").map((n) => n[0]).join("") + "</span>" +
                    '<span class="flex-1"><span class="block text-sm font-medium text-gray-900">' + p.name + "</span>" +
                    '<span class="block text-xs text-gray-500 dark:text-gray-400">' + p.id + " · " + p.phone + "</span></span>" +
                    '<i class="icon-chevron-right text-gray-400"></i></button>',
            )
            .join("");
    }

    $("p-search").addEventListener("input", (e) => renderResults(e.target.value));
    renderResults("");

    $("p-results").addEventListener("click", function (e) {
        const btn = e.target.closest("[data-patient]");
        if (!btn) return;
        selectedPatient = PATIENTS.find((p) => p.id === btn.dataset.patient);
        $("p-selected").classList.remove("hidden");
        $("p-selected").innerHTML =
            '<div class="flex items-center gap-3">' +
            '<span class="avatar bg-primary">' + selectedPatient.name.split(" ").map((n) => n[0]).join("") + "</span>" +
            '<div class="flex-1"><p class="text-sm font-semibold text-gray-900">' + selectedPatient.name + "</p>" +
            '<p class="text-xs text-gray-500 dark:text-gray-400">' + selectedPatient.id + " · " + selectedPatient.age +
            " yrs · " + selectedPatient.gender + " · " + selectedPatient.blood + "</p></div>" +
            '<button type="button" id="p-clear" class="p-2 rounded-lg text-gray-500 hover:text-danger" aria-label="Clear selection"><i class="icon-x text-sm"></i></button></div>';
        $("p-search").value = "";
        renderResults("");
        $("p-clear").addEventListener("click", function () {
            selectedPatient = null;
            $("p-selected").classList.add("hidden");
        });
    });

    // --- Department / doctor ------------------------------------------------
    function fillDoctors() {
        const list = DOCTORS[$("d-dept").value] || [];
        $("d-doctor").innerHTML = list.map((d) => "<option>" + d + "</option>").join("");
    }
    $("d-dept").addEventListener("change", fillDoctors);
    fillDoctors();

    // --- Time slots ---------------------------------------------------------
    function renderSlots() {
        $("slots").innerHTML = SLOTS.map(function (s) {
            if (s.taken) {
                return (
                    '<button type="button" role="radio" aria-checked="false" disabled ' +
                    'class="px-3.5 py-2 rounded-lg border border-border-color text-sm font-medium text-gray-400 bg-gray-50 dark:bg-slate-800 line-through cursor-not-allowed">' +
                    s.label + "</button>"
                );
            }
            const on = selectedSlot === s.label;
            return (
                '<button type="button" role="radio" aria-checked="' + (on ? "true" : "false") + '" data-slot="' + s.label + '" ' +
                'class="px-3.5 py-2 rounded-lg border text-sm font-medium transition-colors ' +
                (on
                    ? "bg-primary border-primary text-white"
                    : "border-border-color text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary") +
                '">' + s.label + "</button>"
            );
        }).join("");
    }
    renderSlots();
    bookStats();

    $("slots").addEventListener("click", function (e) {
        const btn = e.target.closest("[data-slot]");
        if (!btn) return;
        selectedSlot = btn.dataset.slot;
        renderSlots();
    });

    // --- Validation & save --------------------------------------------------
    function patientName() {
        if (mode === "existing") return selectedPatient ? selectedPatient.name : "";
        const first = $("n-first").value.trim();
        const last = $("n-last").value.trim();
        return first && last ? first + " " + last : "";
    }

    function validate() {
        const name = patientName();
        if (!name) {
            MC.toast(mode === "existing" ? "Select a patient first" : "First and last name are required", "error");
            return null;
        }
        if (mode === "new" && !$("n-phone").value.trim()) {
            MC.toast("Phone number is required", "error");
            return null;
        }
        if (!$("a-date").value) {
            MC.toast("Appointment date is required", "error");
            return null;
        }
        if (!selectedSlot) {
            MC.toast("Select a time slot", "error");
            return null;
        }
        const priority = document.querySelector('input[name="priority"]:checked');
        return {
            name: name,
            dept: $("d-dept").value,
            doctor: $("d-doctor").value,
            consult: $("d-consult").value,
            date: $("a-date").value,
            slot: selectedSlot,
            visit: $("a-visit").value,
            priority: priority ? priority.value : "Normal",
            fee: $("d-fee").value || "0",
            payment: $("pay-method").value + " · " + $("pay-status").value,
        };
    }

    function row(label, value) {
        return (
            '<div class="flex justify-between gap-4 py-2 border-b border-border-color last:border-0">' +
            '<span class="text-sm text-gray-500 dark:text-gray-400">' + label + "</span>" +
            '<span class="text-sm font-medium text-gray-900 text-right">' + value + "</span></div>"
        );
    }

    let pendingPrint = false;

    function openConfirm(withPrint) {
        const d = validate();
        if (!d) return;
        pendingPrint = withPrint;
        $("confirm-body").innerHTML =
            row("Patient", d.name) +
            row("Doctor", d.doctor) +
            row("Department", d.dept) +
            row("Consultation", d.consult) +
            row("Date", d.date) +
            row("Time Slot", d.slot) +
            row("Visit Type", d.visit) +
            row("Priority", d.priority) +
            row("Payment", d.payment) +
            row("Fee", "$" + d.fee);
        MC.openModal("confirm-modal");
    }

    $("btn-save").addEventListener("click", () => openConfirm(false));
    $("btn-save-print").addEventListener("click", () => openConfirm(true));

    $("confirm-save").addEventListener("click", function () {
        MC.closeModal("confirm-modal");
        MC.toast("Appointment booked successfully");
        if (pendingPrint) window.print();
        window.setTimeout(function () {
            window.location.href = "appointments.html";
        }, 900);
    });

    document.querySelectorAll("[data-close]").forEach(function (btn) {
        btn.addEventListener("click", () => MC.closeModal(btn.dataset.close));
    });
    MC.closeOnBackdrop("confirm-modal");
})();

// ==========================================================================
// cancelled-appointments.js
// ==========================================================================
// Dreams HMS — Cancelled Appointments
(function () {
    "use strict";
    if ((location.pathname.split("/").pop() || "index.html") !== "cancelled-appointments.html") return;

    const $ = (id) => document.getElementById(id);
    const tbody = $("tbody");
    if (!tbody) return;

    const REFUND = { "Not Applicable": "badge-gray", Pending: "badge-amber", Processed: "badge-green" };
    const BY = { Patient: "badge-blue", Doctor: "badge-purple", Reception: "badge-emerald", System: "badge-gray" };

    const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const fmt = (iso) => {
        const p = iso.split("-");
        return p[2] + " " + MONTHS[parseInt(p[1], 10) - 1] + " " + p[0];
    };

    const TODAY = "2026-07-17";

    let data = [
        { id: 1, code: "APT-20265", patient: "Priya Raghavan", phone: "(212) 555-0121", doctor: "Dr. Sarah Chen", dept: "Cardiology", apptDate: "2026-07-17", cancelDate: TODAY, reason: "Patient request", refund: "Pending", by: "Patient", fee: 180, rescheduled: false },
        { id: 2, code: "APT-20272", patient: "Theodore Nakamura", phone: "(646) 555-0187", doctor: "Dr. Emily Carter", dept: "Orthopedics", apptDate: "2026-07-20", cancelDate: TODAY, reason: "Doctor unavailable", refund: "Processed", by: "Doctor", fee: 170, rescheduled: true },
        { id: 3, code: "APT-20281", patient: "Marcus Delgado", phone: "(347) 555-0198", doctor: "Dr. Laura Bennett", dept: "Oncology", apptDate: "2026-07-19", cancelDate: TODAY, reason: "Emergency rescheduling", refund: "Pending", by: "Reception", fee: 260, rescheduled: false },
        { id: 4, code: "APT-20244", patient: "Linda Whitfield", phone: "(212) 555-0182", doctor: "Dr. Michael Reyes", dept: "Neurology", apptDate: "2026-07-14", cancelDate: "2026-07-13", reason: "Insurance issue", refund: "Processed", by: "Reception", fee: 140, rescheduled: true },
        { id: 5, code: "APT-20239", patient: "Robert Castillo", phone: "(646) 555-0113", doctor: "Dr. Emily Carter", dept: "Orthopedics", apptDate: "2026-07-12", cancelDate: "2026-07-11", reason: "No longer required", refund: "Not Applicable", by: "Patient", fee: 0, rescheduled: false },
        { id: 6, code: "APT-20231", patient: "Angela Brooks", phone: "(718) 555-0164", doctor: "Dr. David Okonkwo", dept: "Pediatrics", apptDate: "2026-07-10", cancelDate: "2026-07-09", reason: "Patient request", refund: "Processed", by: "Patient", fee: 120, rescheduled: true },
        { id: 7, code: "APT-20228", patient: "Daniel Kowalski", phone: "(917) 555-0176", doctor: "Dr. Michael Reyes", dept: "Neurology", apptDate: "2026-07-08", cancelDate: "2026-07-07", reason: "Doctor unavailable", refund: "Pending", by: "Doctor", fee: 200, rescheduled: false },
        { id: 8, code: "APT-20220", patient: "Sofia Alvarez", phone: "(646) 555-0155", doctor: "Dr. Emily Carter", dept: "Orthopedics", apptDate: "2026-07-05", cancelDate: "2026-07-04", reason: "No-show auto-cancel", refund: "Not Applicable", by: "System", fee: 0, rescheduled: false },
        { id: 9, code: "APT-20215", patient: "Naomi Fitzgerald", phone: "(212) 555-0190", doctor: "Dr. Laura Bennett", dept: "Oncology", apptDate: "2026-07-03", cancelDate: "2026-07-02", reason: "Insurance issue", refund: "Processed", by: "Reception", fee: 240, rescheduled: true },
        { id: 10, code: "APT-20208", patient: "Ethan Caldwell", phone: "(347) 555-0102", doctor: "Dr. Sarah Chen", dept: "Cardiology", apptDate: "2026-07-01", cancelDate: "2026-06-30", reason: "Patient request", refund: "Pending", by: "Patient", fee: 150, rescheduled: false },
        { id: 11, code: "APT-20201", patient: "Camille Rousseau", phone: "(917) 555-0128", doctor: "Dr. Michael Reyes", dept: "Neurology", apptDate: "2026-06-28", cancelDate: "2026-06-27", reason: "Emergency rescheduling", refund: "Processed", by: "Doctor", fee: 160, rescheduled: true },
        { id: 12, code: "APT-20194", patient: "Victor Ramirez", phone: "(718) 555-0174", doctor: "Dr. Laura Bennett", dept: "Oncology", apptDate: "2026-06-25", cancelDate: "2026-06-24", reason: "No-show auto-cancel", refund: "Not Applicable", by: "System", fee: 0, rescheduled: false },
        { id: 13, code: "APT-20188", patient: "Hannah Whitmore", phone: "(212) 555-0163", doctor: "Dr. David Okonkwo", dept: "Pediatrics", apptDate: "2026-06-22", cancelDate: "2026-06-21", reason: "Patient request", refund: "Processed", by: "Patient", fee: 110, rescheduled: false },
        { id: 14, code: "APT-20180", patient: "Grace Lindqvist", phone: "(646) 555-0136", doctor: "Dr. Emily Carter", dept: "Orthopedics", apptDate: "2026-06-19", cancelDate: "2026-06-18", reason: "Doctor unavailable", refund: "Pending", by: "Doctor", fee: 190, rescheduled: false },
    ];

    let actionId = null;

    function detailUrl(r) {
        return "appointment-detail.html?" + new URLSearchParams({
            id: r.code, patient: r.patient, doctor: r.doctor, dept: r.dept,
            apptDate: r.apptDate, cancelDate: r.cancelDate, reason: r.reason, refund: r.refund,
        }).toString();
    }

    function stats() {
        $("stat-today").textContent = data.filter((r) => r.cancelDate === TODAY).length;
        $("stat-total").textContent = data.length;
        $("stat-refund").textContent = data.filter((r) => r.refund === "Pending").length;
        $("stat-resched").textContent = data.filter((r) => r.rescheduled).length;
    }

    function row(label, value) {
        return (
            '<div class="flex justify-between gap-4 py-2 border-b border-border-color last:border-0">' +
            '<span class="text-sm text-gray-500 dark:text-gray-400">' + label + "</span>" +
            '<span class="text-sm font-medium text-gray-900 text-right">' + value + "</span></div>"
        );
    }

    // --- Statistics (Appointment module component) ---------------------------
    MC.apptStats($("stats-row"), [
        { id: "stat-today", icon: "icon-calendar-x", label: "Cancelled Today", tone: "danger", delta: 4.8, spark: [1, 2, 1, 3, 2, 3, 3] },
        { id: "stat-total", icon: "icon-list-filter", label: "Total Cancelled", tone: "slate", delta: -6.5, meta: "vs last month", spark: [18, 16, 17, 15, 14, 13, 14] },
        { id: "stat-refund", icon: "icon-banknote", label: "Refund Pending", tone: "amber", delta: 2.3, spark: [4, 5, 4, 6, 5, 6, 5] },
        { id: "stat-resched", icon: "icon-calendar-check", label: "Rescheduled", tone: "emerald", delta: 16.1, spark: [2, 3, 4, 3, 5, 6, 6] },
    ]);

    const grid = MC.grid({
        tbody: tbody,
        data: data,
        pageSize: 10,
        skipInitialRender: true,
        search: $("search"),
        filters: [
            { el: $("filter-doctor"), match: (r, v) => r.doctor === v },
            { el: $("filter-refund"), match: (r, v) => r.refund === v },
            { el: $("filter-by"), match: (r, v) => r.by === v },
        ],
        info: $("info"),
        pager: $("pager"),
        selectAll: $("select-all"),
        bulkBar: $("bulk-bar"),
        bulkCount: $("bulk-count"),
        empty: { icon: "icon-calendar-x", title: "No cancellations found", text: "Try adjusting your search or filters." },
        columns: [
            {
                render: (r) =>
                    '<div><p class="font-medium"><a class="text-primary" href="' + detailUrl(r) + '">' + r.code + "</a></p>" +
                    '<p class="text-xs text-gray-500 dark:text-gray-400">' + fmt(r.apptDate) + "</p></div>",
            },
            {
                render: (r) =>
                    '<div><p class="font-medium text-gray-900">' + r.patient + "</p>" +
                    '<p class="text-xs text-gray-500 dark:text-gray-400">' + r.phone + "</p></div>",
            },
            {
                render: (r) =>
                    '<div><p class="text-gray-900">' + r.doctor + "</p>" +
                    '<p class="text-xs text-gray-500 dark:text-gray-400">' + r.dept + "</p></div>",
            },
            { render: (r) => fmt(r.cancelDate) },
            { render: (r) => '<span class="block max-w-40 truncate" title="' + r.reason + '">' + r.reason + "</span>" },
            {
                render: (r) =>
                    MC.badge(REFUND, r.refund) +
                    (r.fee ? '<span class="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">$' + r.fee.toFixed(2) + "</span>" : ""),
            },
            { render: (r) => MC.badge(BY, r.by) },
            {
                cls: "text-right",
                render: (r) =>
                    MC.actions(r.id, [
                        { label: "Restore", icon: "icon-undo-2", act: "restore" },
                        { label: "Reschedule", icon: "icon-calendar-clock", act: "resched" },
                        { label: "Refund", icon: "icon-banknote", act: "refund" },
                        { label: "Delete", icon: "icon-trash-2", act: "delete", danger: true },
                    ]),
            },
        ],
    });

    function refresh() {
        grid.setData(data);
        stats();
    }

    tbody.addEventListener("click", function (e) {
        const btn = e.target.closest("[data-act]");
        if (!btn) return;
        const rec = data.find((r) => r.id === parseInt(btn.dataset.id, 10));
        if (!rec) return;
        actionId = rec.id;

        switch (btn.dataset.act) {
            case "restore":
                $("restore-name").textContent = rec.patient + " · " + rec.code;
                MC.openModal("restore-modal");
                break;
            case "resched":
                $("resched-name").textContent = rec.patient + " · " + rec.code;
                $("rs-date").value = rec.apptDate;
                MC.openModal("resched-modal");
                break;
            case "refund":
                if (rec.refund === "Not Applicable") {
                    MC.toast("No payment was taken for this appointment", "info");
                    return;
                }
                if (rec.refund === "Processed") {
                    MC.toast("Refund already processed", "info");
                    return;
                }
                $("refund-name").textContent = rec.patient + " · " + rec.code;
                $("refund-summary").innerHTML =
                    row("Original Fee", "$" + rec.fee.toFixed(2)) +
                    row("Cancelled By", rec.by) +
                    row("Reason", rec.reason);
                $("rf-amount").value = rec.fee;
                MC.openModal("refund-modal");
                break;
            case "delete":
                MC.confirmDelete(rec.code + " · " + rec.patient, function () {
                    data = data.filter((r) => r.id !== rec.id);
                    MC.toast("Record deleted");
                    refresh();
                });
                break;
        }
    });

    $("restore-confirm").addEventListener("click", function () {
        const rec = data.find((r) => r.id === actionId);
        if (rec) data = data.filter((r) => r.id !== rec.id);
        MC.closeModal("restore-modal");
        MC.toast("Appointment restored and moved back to the schedule");
        refresh();
    });

    $("rs-confirm").addEventListener("click", function () {
        const rec = data.find((r) => r.id === actionId);
        if (rec) {
            rec.apptDate = $("rs-date").value || rec.apptDate;
            rec.rescheduled = true;
        }
        MC.closeModal("resched-modal");
        MC.toast("Appointment rescheduled");
        refresh();
    });

    $("refund-confirm").addEventListener("click", function () {
        const rec = data.find((r) => r.id === actionId);
        const amount = parseFloat($("rf-amount").value) || 0;
        if (amount <= 0) {
            MC.toast("Enter a refund amount greater than zero", "error");
            return;
        }
        if (rec) {
            rec.refund = "Processed";
            rec.fee = amount;
        }
        MC.closeModal("refund-modal");
        MC.toast("Refund of $" + amount.toFixed(2) + " processed");
        refresh();
    });

    document.querySelectorAll("[data-bulk]").forEach(function (btn) {
        btn.addEventListener("click", function () {
            const ids = grid.selected().map(Number);
            if (!ids.length) return;

            if (btn.dataset.bulk === "delete") {
                MC.confirmDelete(ids.length + " records", function () {
                    data = data.filter((r) => ids.indexOf(r.id) === -1);
                    MC.toast(ids.length + " records deleted");
                    grid.clearSelection();
                    refresh();
                });
                return;
            }

            let done = 0;
            data.forEach(function (r) {
                if (ids.indexOf(r.id) !== -1 && r.refund === "Pending") {
                    r.refund = "Processed";
                    done++;
                }
            });
            MC.toast(done ? done + " refunds processed" : "No pending refunds in selection", done ? "success" : "info");
            grid.clearSelection();
            refresh();
        });
    });

    $("btn-reset").addEventListener("click", function () {
        $("search").value = "";
        $("filter-doctor").value = "";
        $("filter-refund").value = "";
        $("filter-by").value = "";
        $("filter-range").value = "";
        grid.refresh();
        MC.toast("Filters cleared", "info");
    });

    $("btn-print").addEventListener("click", () => window.print());

    $("btn-export").addEventListener("click", function () {
        const head = ["Appointment ID", "Patient", "Phone", "Doctor", "Department", "Appointment Date", "Cancellation Date", "Reason", "Refund", "Cancelled By", "Amount"];
        const rows = data.map((r) => [r.code, r.patient, r.phone, r.doctor, r.dept, r.apptDate, r.cancelDate, r.reason, r.refund, r.by, r.fee]);
        const csv = [head].concat(rows)
            .map((line) => line.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(","))
            .join("\n");
        const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
        const a = document.createElement("a");
        a.href = url;
        a.download = "cancelled-appointments.csv";
        a.click();
        URL.revokeObjectURL(url);
        MC.toast("Cancellations exported");
    });

    document.querySelectorAll("[data-close]").forEach(function (btn) {
        btn.addEventListener("click", () => MC.closeModal(btn.dataset.close));
    });
    ["refund-modal", "restore-modal", "resched-modal", "del-modal"].forEach(MC.closeOnBackdrop);
    MC.initDeleteModal();
    stats();
})();

// ==========================================================================
// doctor-availability-detail.js
// ==========================================================================
(function () {
    "use strict";
    var dl = document.getElementById("dad-download-btn");
    var dl2 = document.getElementById("dad-side-download");
    function onDownload() { window.print(); }
    if (dl) dl.addEventListener("click", onDownload);
    if (dl2) dl2.addEventListener("click", onDownload);
})();

// ==========================================================================
// doctor-availability.js
// ==========================================================================
            (function () {
                "use strict";
                var page = document.getElementById("da-page"); if (!page) return;
                function $(s, r) { return (r || document).querySelector(s); }
                function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
                function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }
                function toast(msg, ic){ var w=$("#da-toast"); var t=document.createElement("div"); t.className="da-toast"; t.innerHTML='<i class="ti '+(ic||"ti-check")+' text-emerald-400"></i>'+esc(msg); w.appendChild(t); setTimeout(function(){ t.style.opacity="0"; t.style.transform="translateY(12px)"; t.style.transition="all .3s ease"; setTimeout(function(){ t.remove(); },300); },2600); }
                function mix(c,p){ return "color-mix(in srgb,"+c+" "+(p||15)+"%,transparent)"; }
                function ini(n){ return n.replace(/^Dr\.?\s*/i,"").split(" ").map(function(w){return w[0];}).join("").slice(0,2).toUpperCase(); }
                function did(n){ return "DAV-" + String(n).padStart(4,"0"); }
                function detailUrl(r){ return "doctor-availability-detail.html?" + new URLSearchParams({ id: r.id, name: r.name, dept: r.dept, status: r.status }).toString(); }

                /* ================= DATA ================= */
                var STATUS={
                    "Available":{c:"#10b981"},"In Consultation":{c:"#0ea5e9"},"On Leave":{c:"#f59e0b"},"Fully Booked":{c:"#8b5cf6"},"Off Duty":{c:"#94a3b8"}
                };
                var SHIFTS={
                    Morning:{c:"#0ea5e9",s:8,e:14},Afternoon:{c:"#10b981",s:14,e:18},Evening:{c:"#8b5cf6",s:18,e:22},Night:{c:"#1e293b",s:22,e:30},"On-call":{c:"#f59e0b",s:0,e:24},Off:{c:"#94a3b8",s:0,e:0}
                };
                var DAYS=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
                var DOCS=[
                    {id:1,name:"Dr. Sarah Roberts",dept:"Cardiology",spec:"Interventional Cardiology",exp:14,c:"#ef4444",shift:"Morning",time:"09:00–17:00",status:"Available",slots:6,booked:12,patients:14,upcoming:4,dur:20,ctype:"Both",oncall:0,phone:"+91 98765 43210",load:88,week:[1,1,1,1,1,0,0]},
                    {id:2,name:"Dr. Vikram Nair",dept:"Neurology",spec:"Stroke & Neuro-diagnostics",exp:11,c:"#8b5cf6",shift:"Evening",time:"14:00–22:00",status:"In Consultation",slots:2,booked:16,patients:16,upcoming:6,dur:30,ctype:"In-person",oncall:1,phone:"+91 98765 11223",load:82,week:[1,1,1,1,1,1,0]},
                    {id:3,name:"Dr. Anita Desai",dept:"Orthopedics",spec:"Joint Replacement",exp:9,c:"#0ea5e9",shift:"Morning",time:"08:00–14:00",status:"Fully Booked",slots:0,booked:18,patients:18,upcoming:8,dur:25,ctype:"In-person",oncall:0,phone:"+91 98765 33445",load:96,week:[1,1,1,0,1,1,0]},
                    {id:4,name:"Dr. Meera Iyer",dept:"Pediatrics",spec:"Neonatology",exp:7,c:"#f59e0b",shift:"Morning",time:"09:00–15:00",status:"Available",slots:9,booked:8,patients:8,upcoming:3,dur:15,ctype:"Both",oncall:1,phone:"+91 98765 55667",load:64,week:[1,1,1,1,0,0,1]},
                    {id:5,name:"Dr. Rajesh Menon",dept:"Oncology",spec:"Medical Oncology",exp:16,c:"#ec4899",shift:"Afternoon",time:"12:00–18:00",status:"In Consultation",slots:3,booked:14,patients:14,upcoming:5,dur:30,ctype:"In-person",oncall:0,phone:"+91 98765 77889",load:91,week:[1,1,1,1,1,0,0]},
                    {id:6,name:"Dr. John Mathew",dept:"Emergency",spec:"Emergency Medicine",exp:12,c:"#f43f5e",shift:"Night",time:"22:00–06:00",status:"On Leave",slots:0,booked:0,patients:0,upcoming:0,dur:20,ctype:"In-person",oncall:1,phone:"+91 98765 99001",load:0,week:[0,0,1,1,1,1,0]},
                    {id:7,name:"Dr. Priya Sharma",dept:"Gynecology",spec:"Obstetrics",exp:10,c:"#d946ef",shift:"Morning",time:"09:00–17:00",status:"Available",slots:5,booked:11,patients:11,upcoming:4,dur:20,ctype:"Both",oncall:0,phone:"+91 98765 22110",load:76,week:[1,1,1,1,1,0,0]},
                    {id:8,name:"Dr. Deepak Nair",dept:"Radiology",spec:"Diagnostic Imaging",exp:8,c:"#6366f1",shift:"Morning",time:"08:00–16:00",status:"Available",slots:11,booked:9,patients:9,upcoming:2,dur:15,ctype:"In-person",oncall:0,phone:"+91 98765 44332",load:58,week:[1,1,1,1,0,1,0]},
                    {id:9,name:"Dr. Sunita Rao",dept:"ENT",spec:"Otolaryngology",exp:6,c:"#14b8a6",shift:"Evening",time:"15:00–21:00",status:"Off Duty",slots:0,booked:0,patients:0,upcoming:0,dur:20,ctype:"Both",oncall:1,phone:"+91 98765 66778",load:0,week:[1,0,1,1,1,0,1]},
                    {id:10,name:"Dr. Karan Malhotra",dept:"Dermatology",spec:"Cosmetic Dermatology",exp:5,c:"#10b981",shift:"Afternoon",time:"13:00–19:00",status:"Available",slots:8,booked:7,patients:7,upcoming:3,dur:15,ctype:"Both",oncall:0,phone:"+91 98765 88990",load:52,week:[1,1,0,1,1,1,0]},
                    {id:11,name:"Dr. Arjun Menon",dept:"Nephrology",spec:"Dialysis & Transplant",exp:13,c:"#0891b2",shift:"Morning",time:"09:00–16:00",status:"Fully Booked",slots:0,booked:15,patients:15,upcoming:6,dur:25,ctype:"In-person",oncall:1,phone:"+91 98765 10101",load:90,week:[1,1,1,1,0,1,0]},
                    {id:12,name:"Dr. Fatima Sheikh",dept:"Psychiatry",spec:"Behavioral Health",exp:4,c:"#a855f7",shift:"Morning",time:"10:00–16:00",status:"Available",slots:7,booked:5,patients:5,upcoming:2,dur:40,ctype:"Video",oncall:0,phone:"+91 98765 20202",load:48,week:[1,1,1,0,1,0,0]}
                ];

                var LEAVES=[
                    {name:"Dr. John Mathew",type:"Sick Leave",range:"Jul 17 – Jul 19",c:"#f43f5e",status:"Approved"},
                    {name:"Dr. Robert Chen",type:"Annual Leave",range:"Jul 18 – Jul 25",c:"#0ea5e9",status:"Pending"},
                    {name:"Independence Day",type:"Public Holiday",range:"Aug 15",c:"#8b5cf6",status:"Holiday"},
                    {name:"Dr. Nina Roy",type:"Conference",range:"Jul 21 – Jul 23",c:"#14b8a6",status:"Pending"}
                ];
                var ACTIVITY=[
                    {ic:"ti-clock-share",c:"#0ea5e9",t:"Shift assigned to Dr. Priya Sharma",s:"Morning · 09:00–17:00",tm:"5m ago"},
                    {ic:"ti-plane",c:"#f59e0b",t:"Leave approved for Dr. John Mathew",s:"Sick leave · 3 days",tm:"22m ago"},
                    {ic:"ti-toggle-right",c:"#10b981",t:"Dr. Deepak Nair marked Available",s:"08:00–16:00",tm:"1h ago"},
                    {ic:"ti-phone-call",c:"#8b5cf6",t:"On-call assigned to Dr. Meera Iyer",s:"Pediatrics",tm:"2h ago"},
                    {ic:"ti-calendar-cog",c:"#ec4899",t:"Schedule modified — Cardiology",s:"3 doctors updated",tm:"3h ago"},
                    {ic:"ti-building-hospital",c:"#6366f1",t:"Radiology department hours extended",s:"Now open till 20:00",tm:"5h ago"}
                ];

                var KPIS=[
                    {l:"Available Doctors",v:42,ic:"ti-user-check",c:"#10b981",p:72,ch:"+6",spark:[30,34,33,38,40,39,42]},
                    {l:"In Consultation",v:23,ic:"ti-stethoscope",c:"#0ea5e9",p:55,ch:"live",spark:[18,20,19,22,21,24,23]},
                    {l:"On Leave",v:5,ic:"ti-plane",c:"#f59e0b",p:12,ch:"2 pending",spark:[3,4,4,5,4,5,5]},
                    {l:"Emergency On-call",v:8,ic:"ti-phone-call",c:"#ef4444",p:33,ch:"3 depts",spark:[6,7,6,8,7,8,8]},
                    {l:"Upcoming Shifts",v:64,ic:"ti-calendar-clock",c:"#8b5cf6",p:80,ch:"+12",spark:[40,48,52,55,60,58,64]},
                    {l:"Fully Booked",v:11,ic:"ti-calendar-x",c:"#ec4899",p:26,ch:"+3",spark:[6,8,7,9,10,9,11]}
                ];

                var state={ q:"", view:"list", filters:{dept:"",spec:"",shift:"",status:"",exp:"",ctype:"",date:"",sort:"name"}, sel:{} };

                /* ================= SPARKLINE ================= */
                function spark(data,c){
                    var w=90,h=26,max=Math.max.apply(null,data),min=Math.min.apply(null,data),rng=(max-min)||1;
                    var pts=data.map(function(v,i){ return (i/(data.length-1)*w).toFixed(1)+","+(h-((v-min)/rng)*(h-4)-2).toFixed(1); });
                    return '<svg viewBox="0 0 '+w+' '+h+'" width="'+w+'" height="'+h+'" preserveAspectRatio="none"><polyline fill="none" stroke="'+c+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="'+pts.join(" ")+'"/><polyline fill="'+mix(c,14)+'" stroke="none" points="0,'+h+' '+pts.join(" ")+' '+w+','+h+'"/></svg>';
                }

                /* ================= KPIs ================= */
                function renderKPIs(){
                    $("#da-kpis").innerHTML = KPIS.map(function(k){
                        return '<div class="da-kpi" style="--kc:'+k.c+'">'+
                            '<div class="flex items-start justify-between mb-2"><div class="da-kpi-ic" style="background:'+mix(k.c)+';color:'+k.c+'"><i class="ti '+k.ic+' text-lg"></i></div>'+
                            '<svg viewBox="0 0 36 36" class="da-ring w-11 h-11"><circle cx="18" cy="18" r="15.9155" fill="none" stroke="var(--color-gray-200)" stroke-width="3.4"/><circle class="bar" cx="18" cy="18" r="15.9155" fill="none" stroke="'+k.c+'" stroke-width="3.4" stroke-linecap="round" pathLength="100" style="--p:'+k.p+'"/></svg></div>'+
                            '<div class="da-kpi-v">'+k.v+'</div>'+
                            '<div class="flex items-center justify-between mt-1"><span class="text-xs da-muted font-semibold">'+esc(k.l)+'</span><span class="da-chip" style="background:'+mix(k.c)+';color:'+k.c+'">'+esc(k.ch)+'</span></div>'+
                            '<div class="mt-2 opacity-90">'+spark(k.spark,k.c)+'</div>'+
                        '</div>';
                    }).join("");
                }

                /* ================= DASHBOARD WIDGETS ================= */
                function renderWidgets(){
                    // department availability
                    var byDept={};
                    DOCS.forEach(function(d){ if(!byDept[d.dept]) byDept[d.dept]={tot:0,av:0,c:d.c}; byDept[d.dept].tot++; if(d.status==="Available"||d.status==="In Consultation") byDept[d.dept].av++; });
                    var depts=Object.keys(byDept).slice(0,6);
                    $("#da-w-dept").innerHTML=depts.map(function(k){
                        var o=byDept[k], pct=Math.round(o.av/o.tot*100);
                        return '<div><div class="flex items-center justify-between mb-1"><span class="text-xs font-semibold text-[var(--color-gray-900)]">'+esc(k)+'</span><span class="text-xs font-bold da-muted">'+o.av+'/'+o.tot+' avail</span></div><div class="da-bar"><span style="width:'+pct+'%;background:linear-gradient(90deg,'+o.c+','+mix(o.c,60)+')"></span></div></div>';
                    }).join("");

                    // workload
                    var byLoad=DOCS.slice().filter(function(d){return d.load>0;}).sort(function(a,b){return b.load-a.load;}).slice(0,5);
                    $("#da-w-load").innerHTML=byLoad.map(function(d){
                        var col=d.load>=90?"#ef4444":d.load>=75?"#f59e0b":"#10b981";
                        return '<div><div class="flex items-center justify-between mb-1"><span class="text-xs font-semibold text-[var(--color-gray-900)] truncate">'+esc(d.name.replace("Dr. ","Dr "))+'</span><span class="text-xs font-bold" style="color:'+col+'">'+d.load+'%</span></div><div class="da-bar"><span style="width:'+d.load+'%;background:linear-gradient(90deg,'+col+','+mix(col,60)+')"></span></div></div>';
                    }).join("");

                    // on-call coverage
                    var onc=DOCS.filter(function(d){return d.oncall;});
                    $("#da-w-oncall").innerHTML=onc.slice(0,5).map(function(d){
                        return '<div class="flex items-center gap-2.5"><div class="da-av" style="background:linear-gradient(135deg,'+d.c+','+mix(d.c,60)+')">'+esc(ini(d.name))+'</div><div class="flex-1 min-w-0"><div class="text-xs font-bold text-[var(--color-gray-900)] truncate">'+esc(d.name.replace("Dr. ","Dr "))+'</div><div class="text-[11px] da-muted truncate">'+esc(d.dept)+'</div></div><span class="da-tag" style="background:'+mix("#f59e0b")+';color:#d97706"><i class="ti ti-point"></i>On-call</span></div>';
                    }).join("");
                }

                /* ================= FILTER SELECTS =================
                   Department/specialty <option> lists are static markup in the
                   HTML now (matching this data), so they no longer need to be
                   built here. */
                var DEPTS=DOCS.map(function(d){return d.dept;}).filter(function(v,i,a){return a.indexOf(v)===i;});
                var SPECS=DOCS.map(function(d){return d.spec;}).filter(function(v,i,a){return a.indexOf(v)===i;});

                /* ================= FILTER ================= */
                function filtered(){
                    var f=state.filters, q=state.q.toLowerCase();
                    var arr=DOCS.filter(function(d){
                        if(q && (d.name+" "+d.dept+" "+d.spec).toLowerCase().indexOf(q)<0) return false;
                        if(f.dept && d.dept!==f.dept) return false;
                        if(f.spec && d.spec!==f.spec) return false;
                        if(f.shift && d.shift!==f.shift) return false;
                        if(f.status && d.status!==f.status) return false;
                        if(f.ctype && d.ctype!==f.ctype) return false;
                        if(f.exp){ var e=+f.exp; if(e===0 && d.exp>=5) return false; if(e===5 && (d.exp<5||d.exp>=10)) return false; if(e===10 && d.exp<10) return false; }
                        return true;
                    });
                    arr.sort(function(a,b){
                        if(f.sort==="exp") return b.exp-a.exp;
                        if(f.sort==="slots") return b.slots-a.slots;
                        if(f.sort==="load") return b.load-a.load;
                        return a.name.localeCompare(b.name);
                    });
                    return arr;
                }

                /* ================= LIST VIEW ================= */
                function renderList(arr){
                    $("#da-tbody").innerHTML=arr.map(function(d){
                        var sc=(STATUS[d.status]||{c:"#94a3b8"}).c;
                        var shc=(SHIFTS[d.shift]||{c:"#94a3b8"}).c;
                        return '<tr data-row="'+d.id+'">'+
                            '<td><input type="checkbox" class="da-cb da-rowcb" data-id="'+d.id+'"'+(state.sel[d.id]?" checked":"")+'></td>'+
                            '<td><div class="flex items-center gap-2.5"><div class="da-av" style="width:2.2rem;height:2.2rem;background:linear-gradient(135deg,'+d.c+','+mix(d.c,60)+')">'+esc(ini(d.name))+'</div><div><a href="'+detailUrl(d)+'" class="font-bold text-[var(--color-gray-900)] hover:text-[var(--color-primary)] hover:underline flex items-center gap-1.5">'+esc(d.name)+(d.oncall?'<i class="ti ti-phone-call text-amber-500 text-xs" title="On-call"></i>':'')+'</a><div class="text-xs da-muted">'+esc(did(d.id))+' · '+d.exp+' yrs exp</div></div></div></td>'+
                            '<td class="da-muted">'+esc(d.dept)+'</td>'+
                            '<td class="da-muted">'+esc(d.spec)+'</td>'+
                            '<td><span class="da-tag" style="background:'+mix(shc)+';color:'+shc+'">'+esc(d.shift)+'</span></td>'+
                            '<td class="da-muted whitespace-nowrap">'+esc(d.time)+'</td>'+
                            '<td><span class="font-bold" style="color:'+(d.slots>0?"#059669":"#dc2626")+'">'+d.slots+'</span> <span class="da-muted text-xs">free</span></td>'+
                            '<td><span class="da-tag" style="background:'+mix(sc)+';color:'+sc+'"><span class="da-dotstat" style="background:'+sc+'"></span>'+esc(d.status)+'</span></td>'+
                            '<td><button class="da-btn da-btn-soft !p-1.5" data-menu="'+d.id+'"><i class="ti ti-dots-vertical"></i></button></td>'+
                        '</tr>';
                    }).join("");
                    syncSelAll();
                }

                /* ================= BOARD VIEW ================= */
                function renderBoard(arr){
                    $("#da-board").innerHTML=arr.map(function(d){
                        var sc=(STATUS[d.status]||{c:"#94a3b8"}).c;
                        return '<div class="da-dcard" style="--dc:'+d.c+'">'+
                            '<div class="da-dhead" style="background:linear-gradient(135deg,'+d.c+','+mix(d.c,55)+')"><button class="da-btn da-btn-glass !p-1.5 absolute top-2 right-2" data-menu="'+d.id+'"><i class="ti ti-dots-vertical"></i></button><div class="da-dav" style="background:linear-gradient(135deg,'+d.c+','+mix(d.c,65)+')">'+esc(ini(d.name))+'</div></div>'+
                            '<div class="p-4 pt-8">'+
                                '<div class="flex items-start justify-between gap-2"><div class="min-w-0"><h3 class="font-bold text-[var(--color-gray-900)] truncate flex items-center gap-1.5">'+esc(d.name)+(d.oncall?'<i class="ti ti-phone-call text-amber-500 text-xs"></i>':'')+'</h3><p class="text-xs da-muted truncate">'+esc(d.dept)+' · '+esc(d.spec)+'</p></div><span class="da-tag flex-none" style="background:'+mix(sc)+';color:'+sc+'"><span class="da-dotstat" style="background:'+sc+'"></span>'+esc(d.status)+'</span></div>'+
                                '<div class="flex items-center gap-3 mt-3 text-xs da-muted"><span class="flex items-center gap-1"><i class="ti ti-briefcase"></i>'+d.exp+'y</span><span class="flex items-center gap-1"><i class="ti ti-clock"></i>'+esc(d.time)+'</span><span class="flex items-center gap-1"><i class="ti ti-hourglass"></i>'+d.dur+'min</span></div>'+
                                '<div class="grid grid-cols-3 gap-1.5 mt-3">'+
                                    '<div class="da-dstat"><div class="text-base font-extrabold text-[var(--color-gray-900)]">'+d.patients+'</div><div class="text-[10px] da-muted font-semibold">Patients</div></div>'+
                                    '<div class="da-dstat"><div class="text-base font-extrabold text-[var(--color-gray-900)]">'+d.upcoming+'</div><div class="text-[10px] da-muted font-semibold">Upcoming</div></div>'+
                                    '<div class="da-dstat"><div class="text-base font-extrabold" style="color:'+(d.slots>0?"#059669":"#dc2626")+'">'+d.slots+'</div><div class="text-[10px] da-muted font-semibold">Free</div></div>'+
                                '</div>'+
                                '<div class="flex items-center gap-2 mt-3.5 pt-3 border-t border-[var(--color-border-color)]"><a href="'+detailUrl(d)+'" class="da-btn da-btn-soft flex-1 !py-1.5 text-xs"><i class="ti ti-eye"></i> Details</a><button class="da-btn da-btn-soft !p-2" data-toast="Calling '+esc(d.name)+'"><i class="ti ti-phone"></i></button><button class="da-btn da-btn-soft !p-2" data-toast="Emailing '+esc(d.name)+'"><i class="ti ti-mail"></i></button></div>'+
                            '</div>'+
                        '</div>';
                    }).join("");
                }

                /* ================= SHIFT TIMELINE ================= */
                function renderTimeline(){
                    var START=0,END=24,span=24;
                    var ticks=""; for(var t=0;t<=24;t+=3){ ticks+='<span>'+(t===0||t===24?"12a":t===12?"12p":t>12?(t-12)+"p":t+"a")+'</span>'; }
                    $("#da-tl-scale").innerHTML=ticks;
                    var bands=[
                        {n:"Morning",s:8,e:14,c:"#0ea5e9",docs:DOCS.filter(function(d){return d.shift==="Morning";}).length},
                        {n:"Afternoon",s:14,e:18,c:"#10b981",docs:DOCS.filter(function(d){return d.shift==="Afternoon";}).length},
                        {n:"Evening",s:18,e:22,c:"#8b5cf6",docs:DOCS.filter(function(d){return d.shift==="Evening";}).length},
                        {n:"Night",s:22,e:24,c:"#1e293b",docs:DOCS.filter(function(d){return d.shift==="Night";}).length},
                        {n:"Emergency On-call",s:0,e:24,c:"#f59e0b",docs:DOCS.filter(function(d){return d.oncall;}).length}
                    ];
                    $("#da-timeline").innerHTML=bands.map(function(b){
                        var left=b.s/span*100, width=(b.e-b.s)/span*100;
                        return '<div class="flex items-center gap-2"><span class="text-[11px] font-bold da-muted w-32 flex-none">'+esc(b.n)+'</span><div class="da-tl-band flex-1"><div class="da-tl-seg" style="left:'+left+'%;width:'+width+'%;background:linear-gradient(135deg,'+b.c+','+mix(b.c,55)+')">'+b.docs+' doctors · '+(b.s===0&&b.e===24?"24h":pad(b.s)+"–"+pad(b.e))+'</div></div></div>';
                    }).join("");
                    $("#da-tl-legend").innerHTML=bands.map(function(b){ return '<span class="flex items-center gap-1.5 text-xs font-semibold da-muted"><span class="w-3 h-3 rounded" style="background:'+b.c+'"></span>'+esc(b.n)+'</span>'; }).join("")+'<span class="flex items-center gap-1.5 text-xs font-semibold da-muted"><span class="w-3 h-3 rounded" style="background:#94a3b8"></span>Off Duty</span>';
                }
                function pad(n){ return (n<10?"0":"")+n+":00"; }

                /* ================= SCHEDULE TOOLS ================= */
                function renderSchedTools(){
                    var tools=[
                        {n:"Weekly Planner",ic:"ti-calendar-week",c:"#0ea5e9",m:"assign"},
                        {n:"Monthly Planner",ic:"ti-calendar-month",c:"#6366f1",m:"assign"},
                        {n:"Shift Assignment",ic:"ti-clock-share",c:"#10b981",m:"assign"},
                        {n:"Leave Calendar",ic:"ti-plane",c:"#f59e0b",m:"addleave"},
                        {n:"Holiday Schedule",ic:"ti-confetti",c:"#ec4899",m:"block"},
                        {n:"Emergency Coverage",ic:"ti-urgent",c:"#ef4444",m:"oncall"}
                    ];
                    $("#da-schedtools").innerHTML=tools.map(function(t){
                        return '<button class="flex flex-col items-start gap-1.5 p-3 rounded-xl border border-[var(--color-border-color)] hover:border-[var(--color-primary)] transition text-left" data-modal="'+t.m+'"><span class="w-8 h-8 rounded-lg flex items-center justify-center" style="background:'+mix(t.c)+';color:'+t.c+'"><i class="ti '+t.ic+'"></i></span><span class="text-xs font-bold text-[var(--color-gray-900)]">'+esc(t.n)+'</span></button>';
                    }).join("");
                }

                /* ================= SIDEBAR LEAVES / ACTIVITY ================= */
                function renderLeaves(){
                    $("#da-leaves").innerHTML=LEAVES.map(function(l){
                        var sc=l.status==="Approved"?"#10b981":l.status==="Holiday"?"#8b5cf6":"#f59e0b";
                        return '<div class="flex items-center gap-2.5 p-2.5 rounded-lg border border-[var(--color-border-color)]"><div class="w-8 h-8 rounded-lg flex items-center justify-center flex-none" style="background:'+mix(l.c)+';color:'+l.c+'"><i class="ti '+(l.status==="Holiday"?"ti-confetti":"ti-plane")+'"></i></div><div class="flex-1 min-w-0"><div class="text-xs font-bold text-[var(--color-gray-900)] truncate">'+esc(l.name)+'</div><div class="text-[11px] da-muted truncate">'+esc(l.type)+' · '+esc(l.range)+'</div></div><span class="da-tag" style="background:'+mix(sc)+';color:'+sc+'">'+esc(l.status)+'</span></div>';
                    }).join("");
                }
                function renderActivity(){
                    $("#da-activity").innerHTML=ACTIVITY.map(function(a,i){
                        return '<div class="flex gap-3 '+(i<ACTIVITY.length-1?"pb-3":"")+'"><div class="flex flex-col items-center"><div class="w-8 h-8 rounded-lg flex items-center justify-center flex-none" style="background:'+mix(a.c)+';color:'+a.c+'"><i class="ti '+a.ic+' text-sm"></i></div>'+(i<ACTIVITY.length-1?'<div class="w-px flex-1 bg-[var(--color-border-color)] mt-1"></div>':'')+'</div><div class="min-w-0 pb-1"><div class="text-xs font-bold text-[var(--color-gray-900)]">'+esc(a.t)+'</div><div class="text-[11px] da-muted">'+esc(a.s)+'</div><div class="text-[10px] da-muted mt-.5">'+esc(a.tm)+'</div></div></div>';
                    }).join("");
                }

                /* ================= RENDER ================= */
                function render(){
                    var arr=filtered();
                    ["list","board"].forEach(function(v){ $("#da-view-"+v).classList.toggle("hidden", state.view!==v); });
                    $("#da-empty").classList.toggle("hidden", arr.length>0);
                    if(state.view==="list") renderList(arr);
                    else renderBoard(arr);
                }

                /* ================= ACTION MENU ================= */
                var ACTIONS=[
                    {a:"view",n:"View Profile",ic:"ti-user"},{a:"editavail",n:"Edit Availability",ic:"ti-calendar-cog"},{a:"assign",n:"Assign Shift",ic:"ti-clock-share"},{a:"block",n:"Block Schedule",ic:"ti-calendar-off"},
                    {sep:1},{a:"unavail",n:"Mark Unavailable",ic:"ti-toggle-left"},{a:"avail",n:"Mark Available",ic:"ti-toggle-right"},{a:"addleave",n:"Add Leave",ic:"ti-plane-departure"},{a:"editleave",n:"Edit Leave",ic:"ti-plane"},{a:"oncall",n:"Assign On-call",ic:"ti-phone-call"},{a:"appts",n:"View Appointments",ic:"ti-calendar-event"},
                    {sep:1},{a:"print",n:"Print Schedule",ic:"ti-printer"},{a:"pdf",n:"Download PDF",ic:"ti-file-download"},{a:"notify",n:"Send Notification",ic:"ti-bell"},{a:"email",n:"Send Email",ic:"ti-mail"},
                    {sep:1},{a:"archive",n:"Archive",ic:"ti-archive"},{a:"delete",n:"Delete",ic:"ti-trash",danger:1}
                ];
                var menuDoc=null;
                function openMenu(id,x,y){
                    menuDoc=id;
                    var m=$("#da-menu");
                    m.innerHTML=ACTIONS.map(function(a){ return a.sep?'<div class="da-sep"></div>':'<div class="da-mi'+(a.danger?" danger":"")+'" data-act="'+a.a+'"><i class="ti '+a.ic+'"></i>'+esc(a.n)+'</div>'; }).join("");
                    m.classList.add("open");
                    var w=210, h=Math.min(m.scrollHeight,window.innerHeight*0.7);
                    var px=Math.min(x, window.innerWidth-w-8), py=Math.min(y, window.innerHeight-h-8);
                    m.style.left=Math.max(8,px)+"px"; m.style.top=Math.max(8,py)+"px";
                }
                function closeMenu(){ $("#da-menu").classList.remove("open"); menuDoc=null; }

                function doAction(act){
                    var d=DOCS.filter(function(x){return x.id===menuDoc;})[0];
                    var name=d?d.name:"doctor";
                    if(act==="view"){ closeMenu(); openDrawer(menuDoc); return; }
                    if(act==="avail" && d){ d.status="Available"; if(d.slots===0) d.slots=5; render(); renderKPIs(); animateRings(); }
                    if(act==="unavail" && d){ d.status="Off Duty"; d.slots=0; render(); renderKPIs(); animateRings(); }
                    if(act==="oncall" && d){ d.oncall=d.oncall?0:1; render(); renderWidgets(); animateRings(); }
                    if(["editavail","assign","block","addleave","editleave"].indexOf(act)>=0){ closeMenu(); openModal(act==="editavail"?"addavail":act, d); return; }
                    if(act==="appts"){ closeMenu(); openModal("appts", d); return; }
                    if(act==="delete"){ closeMenu(); openModal("delete", d); return; }
                    var msgs={editavail:"Editing availability",print:"Printing schedule",pdf:"Downloading PDF",notify:"Notification sent",email:"Email sent",archive:"Doctor archived"};
                    toast((msgs[act]||"Action")+" — "+name.replace("Dr. ","Dr "), "ti-check");
                    closeMenu();
                }

                /* ================= DRAWER ================= */
                function openDrawer(id){
                    var d=DOCS.filter(function(x){return x.id===id;})[0]; if(!d) return;
                    var sc=(STATUS[d.status]||{c:"#94a3b8"}).c;
                    var week=DAYS.map(function(day,i){ return '<div class="da-calcol !rounded-lg"><div class="da-calhd !py-1 !text-[11px]">'+day+'</div><div class="py-1.5 text-center">'+(d.week[i]?'<span class="da-tag" style="background:'+mix("#10b981")+';color:#059669"><i class="ti ti-check"></i></span>':'<span class="text-[10px] da-muted">Off</span>')+'</div></div>'; }).join("");
                    var slots=["09:00","09:20","10:00","11:00","14:30","15:00"].slice(0,Math.max(1,Math.min(6,d.slots||3))).map(function(t){ return '<button class="da-tag" style="background:'+mix(d.c)+';color:'+d.c+'" data-toast="Slot '+t+' selected">'+t+'</button>'; }).join("");
                    var appts=[{n:"Ravi Kumar",t:"09:00 · Follow-up"},{n:"Anita Desai",t:"10:30 · New patient"},{n:"Mohammed Ali",t:"14:00 · Review"}].slice(0,d.upcoming||2);
                    var hist=[{s:"Morning",d:"Mon–Fri",c:"#0ea5e9"},{s:"On-call",d:"Sat",c:"#f59e0b"},{s:"Off",d:"Sun",c:"#94a3b8"}];
                    $("#da-drawer-body").innerHTML=''+
                        '<div class="relative p-5 pb-8" style="background:linear-gradient(135deg,'+d.c+','+mix(d.c,55)+')">'+
                            '<div class="flex items-center justify-between"><button class="da-btn da-btn-glass !p-2" data-close><i class="ti ti-x"></i></button><span class="da-tag" style="background:rgba(255,255,255,.2);color:#fff;border:1px solid rgba(255,255,255,.3)"><span class="da-dotstat" style="background:#fff"></span>'+esc(d.status)+'</span></div>'+
                            '<div class="flex items-center gap-3 mt-4 text-white"><div class="w-16 h-16 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-xl font-extrabold">'+esc(ini(d.name))+'</div><div><h2 class="text-xl font-extrabold">'+esc(d.name)+'</h2><p class="text-white/80 text-sm">'+esc(d.dept)+' · '+esc(d.spec)+'</p><p class="text-white/70 text-xs mt-.5"><i class="ti ti-briefcase"></i> '+d.exp+' yrs · <i class="ti ti-hourglass"></i> '+d.dur+' min consults</p></div></div>'+
                        '</div>'+
                        '<div class="p-5 space-y-5">'+
                            '<div class="grid grid-cols-3 gap-2"><div class="da-dstat !bg-[var(--color-white)] border border-[var(--color-border-color)] !p-3"><div class="text-lg font-extrabold text-[var(--color-gray-900)]">'+d.patients+'</div><div class="text-[10px] da-muted font-semibold">Patients Today</div></div><div class="da-dstat !bg-[var(--color-white)] border border-[var(--color-border-color)] !p-3"><div class="text-lg font-extrabold text-[var(--color-gray-900)]">'+d.upcoming+'</div><div class="text-[10px] da-muted font-semibold">Upcoming</div></div><div class="da-dstat !bg-[var(--color-white)] border border-[var(--color-border-color)] !p-3"><div class="text-lg font-extrabold" style="color:'+(d.slots>0?"#059669":"#dc2626")+'">'+d.slots+'</div><div class="text-[10px] da-muted font-semibold">Free Slots</div></div></div>'+
                            '<div class="flex items-center gap-2.5 p-3 rounded-xl" style="background:'+mix(d.c,8)+';border:1px solid '+mix(d.c,22)+'"><i class="ti ti-clock-hour-4 text-lg" style="color:'+d.c+'"></i><div><div class="text-xs da-muted font-semibold">Current Shift</div><div class="text-sm font-bold text-[var(--color-gray-900)]">'+esc(d.shift)+' · '+esc(d.time)+'</div></div>'+(d.oncall?'<span class="da-tag ml-auto" style="background:'+mix("#f59e0b")+';color:#d97706"><i class="ti ti-phone-call"></i>On-call</span>':'')+'</div>'+
                            '<div><div class="text-xs da-muted font-semibold mb-2">Weekly Schedule</div><div class="grid grid-cols-7 gap-1">'+week+'</div></div>'+
                            '<div><div class="text-xs da-muted font-semibold mb-2">Available Slots</div><div class="flex flex-wrap gap-1.5">'+(slots||'<span class="text-xs da-muted">No free slots</span>')+'</div></div>'+
                            '<div><div class="text-xs da-muted font-semibold mb-2">Upcoming Appointments</div><div class="space-y-1.5">'+(appts.map(function(a){ return '<div class="flex items-center gap-2.5 p-2 rounded-lg border border-[var(--color-border-color)]"><div class="da-av" style="width:1.9rem;height:1.9rem;background:linear-gradient(135deg,'+d.c+','+mix(d.c,60)+')">'+esc(ini(a.n))+'</div><span class="text-xs font-bold text-[var(--color-gray-900)] flex-1">'+esc(a.n)+'</span><span class="text-[11px] da-muted">'+esc(a.t)+'</span></div>'; }).join("")||'<span class="text-xs da-muted">None scheduled</span>')+'</div></div>'+
                            '<div><div class="text-xs da-muted font-semibold mb-2">Shift History / Timeline</div><div class="space-y-1.5">'+hist.map(function(h){ return '<div class="flex items-center gap-2 text-xs"><span class="da-dotstat" style="background:'+h.c+'"></span><span class="font-semibold text-[var(--color-gray-900)]">'+esc(h.s)+'</span><span class="da-muted ml-auto">'+esc(h.d)+'</span></div>'; }).join("")+'</div></div>'+
                            '<div class="grid grid-cols-2 gap-2 pt-1"><button class="da-btn da-btn-primary" data-modal="assign"><i class="ti ti-clock-share"></i> Assign Shift</button><button class="da-btn da-btn-soft" data-modal="addleave"><i class="ti ti-plane"></i> Add Leave</button><button class="da-btn da-btn-soft" data-toast="Notification sent"><i class="ti ti-bell"></i> Notify</button><button class="da-btn da-btn-soft" data-toast="Calling '+esc(d.name)+'"><i class="ti ti-phone"></i> Call</button></div>'+
                        '</div>';
                    $("#da-drawer").classList.add("open");
                    document.body.style.overflow = "hidden";
                    requestAnimationFrame(animateRings);
                }

                /* ================= MODALS ================= */
                function fld(label,inner){ return '<div><label class="da-lbl">'+label+'</label>'+inner+'</div>'; }
                function selDoc(){ return '<select class="da-inp">'+DOCS.map(function(d){return '<option>'+esc(d.name)+'</option>';}).join("")+'</select>'; }
                var MODALS={
                    addavail:{t:"Add Availability",ic:"ti-calendar-plus",body:function(d){ return '<div class="space-y-3">'+fld("Doctor",selDoc())+'<div class="grid grid-cols-2 gap-3">'+fld("Date",'<input type="text" placeholder="dd-mm-yyyy" class="da-inp" data-provider="flatpickr" data-date-format="d-m-Y">')+fld("Shift",'<select class="da-inp"><option>Morning</option><option>Afternoon</option><option>Evening</option><option>Night</option></select>')+'</div><div class="grid grid-cols-2 gap-3">'+fld("From",'<input type="text" placeholder="--:-- --" class="da-inp" data-provider="timepickr" data-default-time="09:00">')+fld("To",'<input type="text" placeholder="--:-- --" class="da-inp" data-provider="timepickr" data-default-time="17:00">')+'</div>'+fld("Consultation Type",'<select class="da-inp"><option>In-person</option><option>Video</option><option>Both</option></select>')+'</div>'; },cta:"Save Availability"},
                    assign:{t:"Assign Shift",ic:"ti-clock-share",body:function(){ return '<div class="space-y-3">'+fld("Doctor",selDoc())+'<div class="grid grid-cols-2 gap-3">'+fld("Shift",'<select class="da-inp"><option>Morning</option><option>Afternoon</option><option>Evening</option><option>Night</option><option>On-call</option></select>')+fld("Repeat",'<select class="da-inp"><option>This week</option><option>Every week</option><option>Weekdays</option><option>Custom</option></select>')+'</div>'+fld("Notes",'<input class="da-inp" placeholder="Optional">')+'</div>'; },cta:"Assign Shift"},
                    block:{t:"Block Schedule",ic:"ti-calendar-off",body:function(){ return '<div class="space-y-3">'+fld("Doctor",selDoc())+'<div class="grid grid-cols-2 gap-3">'+fld("From",'<input type="text" placeholder="dd-mm-yyyy" class="da-inp" data-provider="flatpickr" data-date-format="d-m-Y">')+fld("To",'<input type="text" placeholder="dd-mm-yyyy" class="da-inp" data-provider="flatpickr" data-date-format="d-m-Y">')+'</div>'+fld("Reason",'<select class="da-inp"><option>Meeting</option><option>Surgery block</option><option>Administrative</option><option>Personal</option></select>')+'</div>'; },cta:"Block Schedule"},
                    addleave:{t:"Add Leave",ic:"ti-plane-departure",body:function(){ return '<div class="space-y-3">'+fld("Doctor",selDoc())+'<div class="grid grid-cols-2 gap-3">'+fld("From",'<input type="text" placeholder="dd-mm-yyyy" class="da-inp" data-provider="flatpickr" data-date-format="d-m-Y">')+fld("To",'<input type="text" placeholder="dd-mm-yyyy" class="da-inp" data-provider="flatpickr" data-date-format="d-m-Y">')+'</div>'+fld("Type",'<select class="da-inp"><option>Annual Leave</option><option>Sick Leave</option><option>Conference</option><option>Emergency</option></select>')+fld("Reason",'<textarea class="da-inp" rows="2"></textarea>')+'</div>'; },cta:"Submit Leave"},
                    oncall:{t:"Assign On-call",ic:"ti-phone-call",body:function(){ return '<div class="space-y-3">'+fld("Doctor",selDoc())+'<div class="grid grid-cols-2 gap-3">'+fld("Date",'<input type="text" placeholder="dd-mm-yyyy" class="da-inp" data-provider="flatpickr" data-date-format="d-m-Y">')+fld("Coverage",'<select class="da-inp"><option>24 hours</option><option>Night only</option><option>Weekend</option></select>')+'</div>'+fld("Department",'<select class="da-inp">'+DEPTS.map(function(x){return '<option>'+esc(x)+'</option>';}).join("")+'</select>')+'</div>'; },cta:"Assign On-call"},
                    appts:{t:"Appointments",ic:"ti-calendar-event",body:function(d){ var rows=[{n:"Ravi Kumar",t:"09:00",r:"Follow-up"},{n:"Anita Desai",t:"10:30",r:"New patient"},{n:"Mohammed Ali",t:"14:00",r:"Review"}]; return '<div class="space-y-2">'+rows.map(function(r){ return '<div class="flex items-center gap-3 p-2.5 rounded-lg border border-[var(--color-border-color)]"><span class="da-tag" style="background:'+mix("#0ea5e9")+';color:#0284c7">'+r.t+'</span><span class="text-sm font-bold text-[var(--color-gray-900)] flex-1">'+esc(r.n)+'</span><span class="text-xs da-muted">'+esc(r.r)+'</span></div>'; }).join("")+'</div>'; },cta:"Close",noValidate:1},
                    import:{t:"Import Schedule",ic:"ti-upload",body:function(){ return '<div class="space-y-3"><div class="da-drop" id="da-dropzone"><i class="ti ti-cloud-upload text-3xl da-muted"></i><p class="text-sm font-bold text-[var(--color-gray-900)] mt-2">Drag & drop CSV / Excel / Shift Schedule</p><p class="text-xs da-muted">or click to browse files</p><input type="file" class="hidden" id="da-file"></div><div class="flex items-center gap-2"><button class="da-btn da-btn-soft flex-1" data-toast="Sample template downloaded"><i class="ti ti-file-download"></i> Download Sample Template</button></div><div class="p-3 rounded-lg" style="background:'+mix("#0ea5e9",8)+'"><div class="text-xs font-bold text-[var(--color-gray-900)] mb-1">Import Summary</div><div class="text-xs da-muted" id="da-import-sum">No file selected yet.</div></div></div>'; },cta:"Start Import"},
                    export:{t:"Export Schedule",ic:"ti-download",body:function(){ var opts=[["CSV","ti-file-text"],["Excel","ti-file-spreadsheet"],["PDF","ti-file-typography"],["Print","ti-printer"]]; var scope=[["Weekly Schedule"],["Monthly Schedule"],["Selected Records"],["All Records"]]; return '<div class="space-y-4"><div><div class="da-lbl">Format</div><div class="grid grid-cols-2 gap-2">'+opts.map(function(o,i){ return '<button class="da-btn da-btn-soft justify-start da-expfmt'+(i===0?" !border-[var(--color-primary)]":"")+'" data-fmt="'+o[0]+'"><i class="ti '+o[1]+'"></i> '+o[0]+'</button>'; }).join("")+'</div></div><div><div class="da-lbl">Scope</div><select class="da-inp">'+scope.map(function(s){return '<option>'+s[0]+'</option>';}).join("")+'</select></div></div>'; },cta:"Export Now"},
                    print:{t:"Print Schedule",ic:"ti-printer",body:function(){ return '<div class="space-y-3">'+fld("Range",'<select class="da-inp"><option>Today</option><option>This Week</option><option>This Month</option></select>')+fld("Include",'<select class="da-inp"><option>All doctors</option><option>By department</option><option>On-call only</option></select>')+'<p class="text-xs da-muted">A print-friendly schedule will open in a new dialog.</p></div>'; },cta:"Print"},
                    delete:{t:"Delete Confirmation",ic:"ti-trash",danger:1,body:function(d){ return '<div class="text-center py-2"><div class="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-3" style="background:'+mix("#ef4444")+';color:#ef4444"><i class="ti ti-alert-triangle text-2xl"></i></div><p class="font-bold text-[var(--color-gray-900)]">Remove '+(d?esc(d.name):"selected records")+'?</p><p class="text-sm da-muted mt-1">This will remove the availability record. This action cannot be undone.</p></div>'; },cta:"Delete",danger:1}
                };
                function openModal(key,d){
                    var m=MODALS[key]; if(!m) return;
                    var danger=m.danger;
                    $("#da-dialog").innerHTML=''+
                        '<div class="p-5">'+
                            '<div class="flex items-center justify-between mb-4"><h3 class="font-bold text-lg text-[var(--color-gray-900)] flex items-center gap-2"><i class="ti '+m.ic+'" style="color:'+(danger?"#ef4444":"var(--color-primary)")+'"></i> '+esc(m.t)+'</h3><button class="da-btn da-btn-soft !p-2" data-close><i class="ti ti-x"></i></button></div>'+
                            m.body(d)+
                            '<div class="flex justify-end gap-2 mt-5"><button class="da-btn da-btn-soft" data-close>'+(m.noValidate?"Done":"Cancel")+'</button>'+(m.noValidate?"":'<button class="da-btn '+(danger?"da-btn-soft !bg-rose-500 !text-white":"da-btn-primary")+'" id="da-modal-ok"><i class="ti '+(danger?"ti-trash":"ti-check")+'"></i> '+esc(m.cta)+'</button>')+'</div>'+
                        '</div>';
                    $("#da-modal").classList.add("open");
                    document.body.style.overflow = "hidden";
                    // Modal HTML is injected after the page's initial-load flatpickr auto-init has
                    // already run, so any date/time fields inside it must be initialized here instead.
                    if(typeof flatpickr!=="undefined"){
                        $$('[data-provider="flatpickr"]',$("#da-dialog")).forEach(function(el){
                            if(el._flatpickr) return;
                            var config={disableMobile:true};
                            if(el.hasAttribute("data-date-format")) config.dateFormat=el.getAttribute("data-date-format");
                            flatpickr(el,config);
                        });
                        $$('[data-provider="timepickr"]',$("#da-dialog")).forEach(function(el){
                            if(el._flatpickr) return;
                            var config={enableTime:true,noCalendar:true,dateFormat:"H:i"};
                            if(el.hasAttribute("data-default-time")) config.defaultDate=el.getAttribute("data-default-time");
                            flatpickr(el,config);
                        });
                    }
                    var ok=$("#da-modal-ok");
                    if(ok) ok.addEventListener("click", function(){
                        $("#da-modal").classList.remove("open");
                        if(!$$(".da-drawer.open,.da-modal.open").length) document.body.style.overflow="";
                        if(key==="delete" && d){ var i=DOCS.indexOf(d); if(i>=0) DOCS.splice(i,1); render(); renderKPIs(); renderWidgets(); animateRings(); }
                        if(key==="oncall"){ renderWidgets(); }
                        toast(m.t+" completed", danger?"ti-trash":"ti-check");
                    });
                    // import drop wiring
                    var dz=$("#da-dropzone");
                    if(dz){
                        dz.addEventListener("click", function(){ $("#da-file").click(); });
                        var fileInput=$("#da-file");
                        fileInput.addEventListener("change", function(){ if(this.files[0]) $("#da-import-sum").innerHTML='<b class="text-[var(--color-gray-900)]">'+esc(this.files[0].name)+'</b> ready · 24 rows detected · 0 errors'; });
                        ["dragover","dragenter"].forEach(function(ev){ dz.addEventListener(ev,function(e){ e.preventDefault(); dz.classList.add("drag"); }); });
                        ["dragleave","drop"].forEach(function(ev){ dz.addEventListener(ev,function(e){ e.preventDefault(); dz.classList.remove("drag"); }); });
                        dz.addEventListener("drop", function(e){ var f=e.dataTransfer.files[0]; if(f) $("#da-import-sum").innerHTML='<b class="text-[var(--color-gray-900)]">'+esc(f.name)+'</b> ready · 24 rows detected · 0 errors'; });
                    }
                    // export format toggle
                    $$(".da-expfmt").forEach(function(b){ b.addEventListener("click", function(){ $$(".da-expfmt").forEach(function(x){ x.classList.remove("!border-[var(--color-primary)]"); }); this.classList.add("!border-[var(--color-primary)]"); }); });
                }

                /* ================= SELECTION / BULK ================= */
                function selCount(){ return Object.keys(state.sel).filter(function(k){return state.sel[k];}).length; }
                function syncBulk(){ var n=selCount(); $("#da-bulk-n").textContent=n; $("#da-bulk").classList.toggle("show", n>0); }
                function syncSelAll(){ var sa=$("#da-selall"); if(!sa) return; var vis=filtered(); sa.checked=vis.length>0 && vis.every(function(d){return state.sel[d.id];}); }

                /* ================= EVENTS ================= */
                $("#da-search").addEventListener("input", function(){ state.q=this.value; render(); });
                $("#da-filter-toggle").addEventListener("click", function(){ $("#da-filters").classList.toggle("hidden"); });
                $("#da-view").addEventListener("click", function(e){ var b=e.target.closest("[data-v]"); if(!b) return; state.view=b.getAttribute("data-v"); $$(".da-segb",this).forEach(function(x){ x.classList.toggle("active",x===b); }); render(); });
                $$('[data-f]').forEach(function(sel){ sel.addEventListener("change", function(){ state.filters[this.getAttribute("data-f")]=this.value; updateFilterCount(); render(); }); });
                $("#da-clear").addEventListener("click", function(){ Object.keys(state.filters).forEach(function(k){ if(k!=="sort") state.filters[k]=""; }); $$('[data-f]').forEach(function(s){ if(s.getAttribute("data-f")!=="sort") s.value=""; }); updateFilterCount(); render(); toast("Filters cleared","ti-filter-off"); });
                function updateFilterCount(){ var n=Object.keys(state.filters).filter(function(k){ return k!=="sort" && state.filters[k]; }).length; var el=$("#da-filter-n"); el.textContent=n; el.classList.toggle("hidden", n===0); }

                document.addEventListener("click", function(e){
                    var mo=e.target.closest("[data-modal]"); if(mo){ openModal(mo.getAttribute("data-modal")); return; }
                    var op=e.target.closest("[data-open]"); if(op){ openDrawer(+op.getAttribute("data-open")); return; }
                    var mb=e.target.closest("[data-menu]"); if(mb){ var r=mb.getBoundingClientRect(); openMenu(+mb.getAttribute("data-menu"), r.right-210, r.bottom+4); e.stopPropagation(); return; }
                    var ai=e.target.closest("[data-act]"); if(ai){ doAction(ai.getAttribute("data-act")); return; }
                    var tt=e.target.closest("[data-toast]"); if(tt){ toast(tt.getAttribute("data-toast"),"ti-info-circle"); return; }
                    if(e.target.closest("[data-refresh]")){ $("#da-h-updated").textContent="just now"; render(); renderKPIs(); renderWidgets(); animateRings(); toast("Schedule refreshed","ti-refresh"); return; }
                    var rc=e.target.closest(".da-rowcb"); if(rc){ state.sel[rc.getAttribute("data-id")]=rc.checked; syncBulk(); syncSelAll(); return; }
                    var cl=e.target.closest("[data-close]"); if(cl){ var m=cl.closest(".da-drawer,.da-modal"); if(m) m.classList.remove("open"); if(!$$(".da-drawer.open,.da-modal.open").length) document.body.style.overflow=""; return; }
                    if(!e.target.closest("#da-menu")) closeMenu();
                });
                document.addEventListener("keydown", function(e){ if(e.key==="Escape"){ closeMenu(); $$(".da-drawer.open,.da-modal.open").forEach(function(m){ m.classList.remove("open"); }); document.body.style.overflow=""; } });
                window.addEventListener("scroll", closeMenu, true);

                document.addEventListener("change", function(e){
                    if(e.target.id==="da-selall"){ var vis=filtered(); vis.forEach(function(d){ state.sel[d.id]=e.target.checked; }); render(); syncBulk(); }
                });

                // bulk bar
                $("#da-bulk-x").addEventListener("click", function(){ state.sel={}; render(); syncBulk(); });
                $$('[data-bulk]').forEach(function(b){ b.addEventListener("click", function(){
                    var act=this.getAttribute("data-bulk"), n=selCount();
                    if(act==="delete"){ Object.keys(state.sel).forEach(function(k){ if(state.sel[k]){ var i=DOCS.map(function(d){return String(d.id);}).indexOf(k); if(i>=0) DOCS.splice(i,1); } }); state.sel={}; render(); renderKPIs(); renderWidgets(); animateRings(); syncBulk(); toast(n+" records deleted","ti-trash"); return; }
                    var names={assign:"Shift assigned to",avail:"Availability changed for",oncall:"On-call assigned to",notify:"Notification sent to",export:"Exported"};
                    toast((names[act]||"Updated")+" "+n+" doctor"+(n>1?"s":""), "ti-check");
                }); });

                /* ================= RINGS ================= */
                function animateRings(){ $$(".da-ring .bar").forEach(function(b){ var p=b.style.getPropertyValue("--p"); b.style.setProperty("--p","0"); requestAnimationFrame(function(){ b.style.setProperty("--p",p); }); }); }

                /* ================= REVEAL =================
                   KPIs, widgets, the shift timeline, schedule tools, leaves,
                   activity feed and the default (unfiltered, Calendar view)
                   doctor list are already static markup in the HTML, matching
                   what this data would have produced on load. renderKPIs(),
                   renderWidgets(), renderTimeline(), renderSchedTools(),
                   renderLeaves(), renderActivity() and render() all stay
                   available below for search/filter/sort/view changes and for
                   the mutation handlers (mark available/unavailable, delete,
                   on-call toggle, bulk actions). */
                setTimeout(function(){
                    $("#da-skeleton").classList.add("hidden");
                    $("#da-content").classList.remove("hidden");
                    requestAnimationFrame(animateRings);
                }, 1500);
            })();

// ==========================================================================
// doctor-dashboard.js
// ==========================================================================
// Dreams HMS — Doctor Dashboard
// Dr. Sarah Chen's clinical day: schedule rail, waiting room, results
// sign-off, inpatient census, insights, analytics, tasks and alerts.
// Every headline figure derives from the underlying lists. No API.
(function () {
    "use strict";
    if ((location.pathname.split("/").pop() || "index.html") !== "doctor-dashboard.html") return;

    const $ = (id) => document.getElementById(id);
    const esc = (v) => String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    const initials = (n) => n.replace(/^(Dr|Mr|Mrs|Ms)\.?\s+/i, "").split(/\s+/).slice(0, 2).map((p) => p.charAt(0).toUpperCase()).join("");

    /* ====================================================================
       Data — Dr. Chen's day (now = 09:42 AM)
       ==================================================================== */

    const NOW_MIN = 9 * 60 + 42;
    const DAY_START = 8 * 60, DAY_END = 17 * 60;

    const SCHEDULE = [
        { time: "8:00 AM", min: 480, patient: "Rosalind Pierce", type: "Follow-up", detail: "Post-syncope review, tilt-table results", done: true },
        { time: "8:30 AM", min: 510, patient: "Marcus Okoro", type: "Urgent", detail: "NSTEMI discharge planning", done: true },
        { time: "9:15 AM", min: 555, patient: "Bernadette Cho", type: "New Patient", detail: "Palpitations, Holter fitted", done: true },
        { time: "9:45 AM", min: 585, patient: "Grant Sutherland", type: "Follow-up", detail: "Hypertension titration, home BP diary" },
        { time: "10:30 AM", min: 630, patient: "Ophelia Grant", type: "Consult", detail: "Pre-op cardiac clearance for hip surgery" },
        { time: "11:15 AM", min: 675, patient: "Curtis Mbeki", type: "Follow-up", detail: "Post-stent 6-week review" },
        { time: "1:00 PM", min: 780, patient: "Ward Rounds", type: "Rounds", detail: "Cardiac ICU + telemetry, 6 patients", rounds: true },
        { time: "2:30 PM", min: 870, patient: "Priya Raghunathan", type: "New Patient", detail: "Exertional chest tightness, stress echo review" },
        { time: "3:15 PM", min: 915, patient: "Emmett Sandoval", type: "Consult", detail: "AF rate control, warfarin bridging" },
        { time: "4:00 PM", min: 960, patient: "MDT Meeting", type: "Meeting", detail: "Heart failure multidisciplinary board", rounds: true },
    ];

    const TYPE_TONE = { Urgent: "dr-rose", "New Patient": "dr-violet", "Follow-up": "dr-indigo", Consult: "dr-sky", Rounds: "dr-emerald", Meeting: "dr-amber" };

    let QUEUE = [
        { name: "Grant Sutherland", waited: 14, status: "Ready", room: "Exam 2" },
        { name: "Ophelia Grant", waited: 6, status: "Checked In", room: "Waiting" },
        { name: "Curtis Mbeki", waited: 0, status: "Arriving", room: "—" },
    ];

    let LABS = [
        { patient: "Marcus Okoro", test: "Troponin I (serial)", flag: "High", value: "0.42 ng/mL", urgent: true },
        { patient: "Rosalind Pierce", test: "Electrolyte panel", flag: "Normal", value: "K 4.1 mmol/L", urgent: false },
        { patient: "Emmett Sandoval", test: "INR", flag: "High", value: "3.4", urgent: true },
    ];

    const CENSUS = [
        { label: "Stable", n: 4, tone: "dr-emerald" },
        { label: "Watch", n: 2, tone: "dr-amber" },
        { label: "Critical", n: 1, tone: "dr-rose" },
    ];

    const CENSUS_STATS = [
        { icon: "icon-bed", label: "Avg. length of stay", val: "3.2 days" },
        { icon: "icon-clock", label: "Next rounds", val: "2:30 PM" },
    ];


    const WEEK = [
        { day: "Mon", n: 11 }, { day: "Tue", n: 9 }, { day: "Wed", n: 13 },
        { day: "Thu", n: 10 }, { day: "Fri", n: 6 },
    ];
    const LAST_WEEK_TOTAL = 44;

    // Appointments per hour, Mon–Fri 8AM–5PM (9 slots).
    const LOAD = [
        [2, 3, 4, 3, 1, 2, 3, 4, 2],
        [1, 2, 3, 2, 1, 1, 2, 3, 1],
        [3, 4, 4, 3, 2, 3, 4, 3, 2],
        [2, 3, 3, 2, 1, 2, 3, 2, 1],
        [2, 3, 2, 1, 1, 1, 2, 1, 0],
    ];
    const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    const HOURS = ["8", "9", "10", "11", "12", "1", "2", "3", "4"];

    const ACTIVITY = [
        { time: "9:38 AM", icon: "icon-file-text", text: "Prescription signed — Metoprolol 50 mg for Bernadette Cho", state: "done" },
        { time: "9:21 AM", icon: "icon-flask-conical", text: "Ordered serial troponins for Marcus Okoro", state: "done" },
        { time: "8:55 AM", icon: "icon-pen-line", text: "Clinical note filed — Rosalind Pierce follow-up", state: "done" },
        { time: "8:40 AM", icon: "icon-check", text: "Discharge summary approved — Kaitlyn Brewer", state: "done" },
        { time: "8:12 AM", icon: "icon-users", text: "Morning handover completed with night registrar", state: "done" },
    ];

    let ALERTS = [
        { id: "A1", text: "Critical troponin on Marcus Okoro — cath lab consult recommended.", tone: "dr-rose", icon: "icon-siren" },
        { id: "A2", text: "Telemetry: 12-beat NSVT run on bed CCU-3 overnight.", tone: "dr-amber", icon: "icon-activity" },
        { id: "A3", text: "Pharmacy query on Ophelia Grant's ACE inhibitor dose.", tone: "dr-sky", icon: "icon-pill" },
    ];

    let TASKS = [
        { id: "T1", text: "Countersign registrar's echo reports (3)", due: "By noon", done: false },
        { id: "T2", text: "Call Dr. Whitlock re: pre-op clearance", due: "Today", done: false },
        { id: "T3", text: "Complete mortality review paperwork", due: "Fri", done: false },
        { id: "T4", text: "Renew BLS certification", due: "Jul 30", done: true },
    ];

    // Theatre list intentionally empty — clinic day. Drives the empty state.
    const THEATRE = [];

    /* ====================================================================
       Hero
       ==================================================================== */

    function renderHero() {
        const remaining = SCHEDULE.filter((s) => !s.done && s.min >= NOW_MIN).length;
        $("hero-line").innerHTML = '<i class="icon-calendar text-[13px]" aria-hidden="true"></i>' +
            SCHEDULE.length + " appointments · " + remaining + " remaining";

        const pct = Math.max(0, Math.min(100, Math.round(((NOW_MIN - DAY_START) / (DAY_END - DAY_START)) * 100)));
        $("day-pct").textContent = pct + "%";
        // SVG width attribute, not a runtime Tailwind class — arbitrary
        // classes generated in JS never exist in the compiled stylesheet.
        $("day-track").innerHTML =
            '<svg class="h-full w-full" viewBox="0 0 100 8" preserveAspectRatio="none" role="img" aria-label="Clinic day ' + pct + ' percent complete">' +
            '<defs><linearGradient id="dayg" x1="0" y1="0" x2="1" y2="0">' +
            '<stop offset="0" stop-color="var(--dr-sky)"></stop><stop offset="1" stop-color="var(--dr-violet)"></stop></linearGradient></defs>' +
            '<rect x="0" y="0" width="' + pct + '" height="8" rx="4" fill="url(#dayg)"></rect></svg>';
        $("day-meta").innerHTML = "<span>8:00 AM</span><span>Now · 9:42 AM</span><span>5:00 PM</span>";

        const seen = SCHEDULE.filter((s) => s.done).length;
        const rail = [
            { label: "Seen", value: seen, icon: "icon-check" },
            { label: "Waiting", value: QUEUE.length, icon: "icon-users" },
            { label: "To Sign", value: LABS.length, icon: "icon-flask-conical" },
            { label: "Inpatients", value: CENSUS.reduce((a, c) => a + c.n, 0), icon: "icon-heart-pulse" },
        ];
        $("hero-rail").innerHTML = rail
            .map((r) =>
                '<div class="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 backdrop-blur-md">' +
                '<i class="' + r.icon + ' text-white/40 text-sm" aria-hidden="true"></i>' +
                '<div><dt class="text-[9px] font-bold uppercase tracking-wider text-white/40">' + r.label + "</dt>" +
                '<dd class="text-base font-extrabold text-white tabular-nums">' + r.value + "</dd></div></div>"
            )
            .join("");
    }

    /* ====================================================================
       Schedule rail
       ==================================================================== */

    // The "now" slot is the first undone appointment at/after the clock.
    function nowSlotIndex() {
        return SCHEDULE.findIndex((s) => !s.done);
    }

    function renderSchedule() {
        const nowIdx = nowSlotIndex();
        const remaining = SCHEDULE.filter((s) => !s.done).length;
        $("sched-chip").textContent = remaining + " left";

        $("schedule").innerHTML = SCHEDULE.map((s, i) => {
            const tone = TYPE_TONE[s.type] || "dr-indigo";
            const isNow = i === nowIdx;
            return (
                '<div class="dr-slot ' + tone + (isNow ? " is-now" : "") + '">' +
                '<span class="dr-slot-dot" aria-hidden="true"></span>' +
                '<div class="dr-slot-card' + (s.done ? " opacity-55" : "") + '">' +
                '<div class="flex items-center gap-2">' +
                '<p class="text-[11px] font-extrabold text-gray-900 tabular-nums">' + s.time + "</p>" +
                '<span class="dr-chip ' + tone + '">' + s.type + "</span>" +
                (isNow ? '<span class="dr-chip dr-rose">Next</span>' : "") +
                (s.done ? '<i class="icon-check text-success text-xs ml-auto" aria-hidden="true"></i>' : "") +
                "</div>" +
                '<p class="mt-1 text-xs font-bold text-gray-900 truncate">' + esc(s.patient) + "</p>" +
                '<p class="text-[10px] text-gray-400 truncate">' + esc(s.detail) + "</p>" +
                "</div></div>"
            );
        }).join("");
    }

    /* ====================================================================
       Waiting room, labs, census, AI
       ==================================================================== */

    function renderQueue() {
        $("queue-chip").textContent = QUEUE.length + " waiting";
        if (!QUEUE.length) {
            $("queue").innerHTML =
                '<div class="py-8 text-center"><i class="icon-armchair text-3xl text-gray-200 dark:text-slate-700" aria-hidden="true"></i>' +
                '<p class="mt-2 text-xs font-semibold text-gray-500 dark:text-gray-400">Waiting room clear</p>' +
                '<p class="text-[10px] text-gray-400">Next arrival expected 10:15 AM.</p></div>';
            return;
        }
        const TONE = { Ready: "dr-emerald", "Checked In": "dr-sky", Arriving: "dr-amber" };
        $("queue").innerHTML = QUEUE.map((p) =>
            '<div class="dr-row ' + TONE[p.status] + ' items-start">' +
            '<span class="hms-member-avatar size-8! text-[9px]! shrink-0 ' + TONE[p.status] + '">' + esc(initials(p.name)) + "</span>" +
            '<div class="min-w-0 flex-1">' +
            '<p class="text-xs font-bold text-gray-900 dark:text-white truncate">' + esc(p.name) + "</p>" +
            '<div class="mt-1 flex items-center justify-between gap-2">' +
            '<p class="min-w-0 truncate text-[10px] text-gray-400">' + esc(p.room) + (p.waited ? " · waited " + p.waited + "m" : "") + "</p>" +
            '<span class="dr-chip ' + TONE[p.status] + ' shrink-0">' + p.status + "</span>" +
            "</div></div></div>"
        ).join("");
    }

    function renderLabs() {
        $("labs-chip").textContent = LABS.length + " waiting";
        if (!LABS.length) {
            $("labs").innerHTML =
                '<div class="py-8 text-center"><i class="icon-check-check text-3xl text-success" aria-hidden="true"></i>' +
                '<p class="mt-2 text-xs font-semibold text-gray-500 dark:text-gray-400">Inbox zero</p>' +
                '<p class="text-[10px] text-gray-400">All results reviewed and signed.</p></div>';
            return;
        }
        $("labs").innerHTML = LABS.map((l, i) =>
            '<div class="dr-row' + (l.urgent ? " is-flagged" : "") + '" style="display:block">' +
            '<div class="flex items-center gap-2">' +
            '<p class="min-w-0 flex-1 truncate text-xs font-bold text-gray-900 dark:text-white">' + esc(l.test) + "</p>" +
            '<span class="badge shrink-0 ' + (l.flag === "High" ? "badge-red" : "badge-green") + '">' + l.flag + "</span>" +
            "</div>" +
            '<div class="mt-1.5 flex items-center justify-between gap-2">' +
            '<p class="min-w-0 flex-1 truncate text-[10px] text-gray-400">' + esc(l.patient) + " · " + esc(l.value) + "</p>" +
            '<button type="button" data-sign="' + i + '" class="shrink-0 rounded-lg bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary transition-colors hover:bg-primary/20">Sign</button>' +
            "</div></div>"
        ).join("");
    }

    function ring(pct, cls) {
        return (
            '<div class="relative grid place-items-center ' + cls + '">' +
            '<svg class="dr-ring" viewBox="0 0 36 36" aria-hidden="true" focusable="false">' +
            '<circle class="dr-ring-track" cx="18" cy="18" r="15.9155" fill="none" stroke="currentColor" stroke-width="3.4"></circle>' +
            '<circle cx="18" cy="18" r="15.9155" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-dasharray="' + pct + ' 100"></circle></svg>' +
            '<span class="dr-ring-label">' + pct + "%</span></div>"
        );
    }

    function renderCensus() {
        const total = CENSUS.reduce((a, c) => a + c.n, 0);
        $("census").innerHTML =
            '<div class="flex items-center justify-around">' +
            CENSUS.map((c) => {
                const pct = Math.round((c.n / total) * 100);
                return '<div class="text-center">' + ring(pct, c.tone) +
                    '<p class="mt-1.5 text-sm font-extrabold text-gray-900 tabular-nums">' + c.n + "</p>" +
                    '<p class="text-[10px] font-semibold text-gray-400">' + c.label + "</p></div>";
            }).join("") +
            "</div>" +
            '<p class="mt-3 text-center text-[10px] font-semibold text-gray-400">' + total + " admitted under your care</p>" +
            '<div class="mt-4 grid grid-cols-2 gap-2 border-t border-border-color pt-3 dark:border-white/10">' +
            CENSUS_STATS.map((s) =>
                '<div class="flex items-center gap-2 rounded-lg bg-emerald-50 p-2 dark:bg-white/5">' +
                '<span class="dr-tile-icon !size-7 text-xs"><i class="' + s.icon + '" aria-hidden="true"></i></span>' +
                '<div class="min-w-0"><p class="text-[9px] font-semibold uppercase tracking-wide text-gray-400">' + s.label + '</p>' +
                '<p class="text-xs font-extrabold text-gray-900 dark:text-gray-100">' + s.val + '</p></div>' +
                '</div>'
            ).join("") +
            '</div>';
    }

    /* ====================================================================
       Analytics — bars, heatmap, activity
       ==================================================================== */

    function renderPerf() {
        const total = WEEK.reduce((a, d) => a + d.n, 0);
        const delta = Math.round(((total - LAST_WEEK_TOTAL) / LAST_WEEK_TOTAL) * 100);
        $("perf-total").textContent = total;
        const dEl = $("perf-delta");
        dEl.className = "dr-delta " + (delta >= 0 ? "is-up" : "is-down");
        dEl.textContent = (delta >= 0 ? "+" : "") + delta + "%";

        const W = 220, H = 90, n = WEEK.length, slot = W / n, bw = slot * 0.55;
        const max = Math.max.apply(null, WEEK.map((d) => d.n));
        $("perf-chart").innerHTML = WEEK.map((d, i) => {
            const bh = Math.max(3, (d.n / max) * (H - 8));
            const x = i * slot + (slot - bw) / 2;
            return '<rect class="dr-bar' + (d.n === max ? " is-peak" : "") + '" x="' + x.toFixed(1) + '" y="' + (H - bh).toFixed(1) +
                '" width="' + bw.toFixed(1) + '" height="' + bh.toFixed(1) + '" rx="4"><title>' + d.day + ": " + d.n + " consults</title></rect>";
        }).join("");
        $("perf-axis").innerHTML = WEEK.map((d) => "<span>" + d.day + "</span>").join("");
    }

    function heatLevel(v) {
        if (v >= 4) return 4;
        return v;
    }

    function renderHeat() {
        const labelW = 34, cell = 20, rowH = 28, gap = 3, top = 14;
        const W = labelW + HOURS.length * (cell + gap);
        const H = top + DAYS.length * (rowH + gap);
        let svg = "";
        HOURS.forEach((h, c) => {
            svg += '<text class="wb-heat-val" x="' + (labelW + c * (cell + gap) + cell / 2) + '" y="9" text-anchor="middle">' + h + "</text>";
        });
        let peak = { v: -1 };
        DAYS.forEach((d, r) => {
            const y = top + r * (rowH + gap);
            svg += '<text class="wb-heat-val" x="0" y="' + (y + rowH / 2 + 3) + '">' + d + "</text>";
            LOAD[r].forEach((v, c) => {
                if (v > peak.v) peak = { v: v, d: d, h: HOURS[c] };
                const x = labelW + c * (cell + gap);
                svg += '<rect class="dr-heat lv-' + heatLevel(v) + '" x="' + x + '" y="' + y + '" width="' + cell + '" height="' + rowH + '" rx="4">' +
                    "<title>" + d + " " + HOURS[c] + ":00 — " + v + " appointments</title></rect>";
            });
        });
        $("heat").innerHTML = '<svg viewBox="0 0 ' + W + " " + H + '" width="100%" role="img" aria-label="Appointment load by day and hour">' + svg + "</svg>";
        $("heat-peak").textContent = peak.d + " " + peak.h + ":00 (" + peak.v + " appts)";
    }

    function renderActivity() {
        $("activity").innerHTML = ACTIVITY.map((a) =>
            '<li class="hms-tl-item is-done">' +
            '<span class="hms-tl-node"><i class="' + a.icon + '" aria-hidden="true"></i></span>' +
            '<div class="min-w-0 flex-1 -mt-0.5">' +
            '<span class="text-[10px] font-bold text-gray-400 tabular-nums">' + a.time + "</span>" +
            '<p class="text-xs text-gray-600 dark:text-gray-300">' + esc(a.text) + "</p></div></li>"
        ).join("");
    }

    /* ====================================================================
       Alerts, tasks, theatre
       ==================================================================== */

    function renderAlerts() {
        if (!ALERTS.length) {
            $("alerts").innerHTML =
                '<div class="py-8 text-center"><i class="icon-bell-off text-3xl text-gray-200 dark:text-slate-700" aria-hidden="true"></i>' +
                '<p class="mt-2 text-xs font-semibold text-gray-500 dark:text-gray-400">No active alerts</p>' +
                '<p class="text-[10px] text-gray-400">You are all caught up.</p></div>';
            return;
        }
        $("alerts").innerHTML = ALERTS.map((a) =>
            '<div class="' + a.tone + ' flex items-start gap-2.5 rounded-xl border border-border-color dark:border-white/10 p-2.5">' +
            '<span class="dr-tile-icon size-8! text-xs!"><i class="' + a.icon + '" aria-hidden="true"></i></span>' +
            '<p class="min-w-0 flex-1 text-xs text-gray-600 dark:text-gray-300">' + esc(a.text) + "</p>" +
            '<button type="button" data-dismiss="' + a.id + '" aria-label="Dismiss alert" class="text-gray-300 hover:text-gray-500 dark:text-slate-600"><i class="icon-x text-xs" aria-hidden="true"></i></button>' +
            "</div>"
        ).join("");
    }

    function renderTasks() {
        const open = TASKS.filter((t) => !t.done).length;
        $("tasks-chip").textContent = open + " open";
        $("tasks").innerHTML = TASKS.map((t) =>
            '<label class="flex items-center gap-2.5 rounded-xl border border-border-color dark:border-white/10 p-2.5 cursor-pointer' + (t.done ? " opacity-55" : "") + '" for="task-' + t.id + '">' +
            '<input type="checkbox" id="task-' + t.id + '" data-task="' + t.id + '" class="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"' + (t.done ? " checked" : "") + ">" +
            '<span class="min-w-0 flex-1 truncate text-xs font-semibold text-gray-700 dark:text-gray-300' + (t.done ? " line-through" : "") + '">' + esc(t.text) + "</span>" +
            '<span class="dr-chip dr-amber shrink-0">' + esc(t.due) + "</span></label>"
        ).join("");
    }

    function renderTheatre() {
        if (!THEATRE.length) {
            $("theatre").innerHTML =
                '<div class="py-10 text-center">' +
                '<i class="icon-scissors text-3xl text-gray-200 dark:text-slate-700" aria-hidden="true"></i>' +
                '<p class="mt-2 text-xs font-semibold text-gray-500 dark:text-gray-400">No procedures scheduled today</p>' +
                '<p class="text-[10px] text-gray-400">Your next theatre session is Tuesday, 21 Jul — 2 angioplasties booked.</p>' +
                '<a href="doctor-schedule.html" class="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold text-primary hover:underline">' +
                '<i class="icon-calendar text-xs" aria-hidden="true"></i>View surgical schedule</a></div>';
            return;
        }
    }

    /* ====================================================================
       Wiring
       ==================================================================== */

    function renderAll() {
        renderHero();
        renderSchedule();
        renderQueue();
        renderLabs();
        renderCensus();
        renderPerf();
        renderHeat();
        renderActivity();
        renderAlerts();
        renderTasks();
        renderTheatre();
    }

    function init() {
        // Initial content for the hero, schedule rail, waiting room, labs,
        // census, analytics, activity, alerts, tasks and theatre panels is
        // already present as static markup in the HTML (matching what
        // renderAll() below would produce for the seed data). renderAll()
        // stays available for the mutation handlers wired below.

        $("labs").addEventListener("click", function (e) {
            const btn = e.target.closest("[data-sign]");
            if (!btn) return;
            const l = LABS.splice(parseInt(btn.dataset.sign, 10), 1)[0];
            renderHero();
            renderLabs();
            MC.toast(l.test + " signed for " + l.patient + ".", "success");
        });

        $("alerts").addEventListener("click", function (e) {
            const btn = e.target.closest("[data-dismiss]");
            if (!btn) return;
            ALERTS = ALERTS.filter((a) => a.id !== btn.dataset.dismiss);
            renderAlerts();
        });
        $("btn-clear-alerts").addEventListener("click", function () {
            if (!ALERTS.length) return MC.toast("No alerts to clear.", "info");
            ALERTS = [];
            renderAlerts();
            MC.toast("All alerts cleared.", "success");
        });

        $("tasks").addEventListener("change", function (e) {
            const cb = e.target.closest("[data-task]");
            if (!cb) return;
            const t = TASKS.find((x) => x.id === cb.dataset.task);
            t.done = cb.checked;
            renderTasks();
            if (t.done) MC.toast("Task completed — " + t.text, "success");
        });

        $("btn-consult").addEventListener("click", function () {
            const next = SCHEDULE.find((s) => !s.done && !s.rounds);
            if (!next) return MC.toast("No consultations remaining today.", "info");
            next.done = true;
            const q = QUEUE.findIndex((p) => p.name === next.patient);
            if (q !== -1) QUEUE.splice(q, 1);
            renderAll();
            MC.toast("Consultation started — " + next.patient + " (" + next.time + ").", "success");
        });
        $("btn-rx").addEventListener("click", () => MC.toast("Prescription pad opened — continue on the Prescriptions page.", "info"));
        $("btn-note").addEventListener("click", () => MC.toast("Clinical note template opened.", "info"));
        $("btn-break").addEventListener("click", () => MC.toast("15-minute break blocked at 11:45 AM.", "success"));
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
})();

// ==========================================================================
// doctor-leave-requests.js
// ==========================================================================
            (function () {
                "use strict";
                var page = document.getElementById("lv-page"); if (!page) return;
                function $(s, r) { return (r || document).querySelector(s); }
                function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
                function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }
                function toast(msg, ic){ var w=$("#lv-toast"); var t=document.createElement("div"); t.className="lv-toast"; t.innerHTML='<i class="ti '+(ic||"ti-check")+' text-emerald-400"></i>'+esc(msg); w.appendChild(t); setTimeout(function(){ t.style.opacity="0"; t.style.transform="translateY(12px)"; t.style.transition="all .3s ease"; setTimeout(function(){ t.remove(); },300); },2600); }
                function mix(c,p){ return "color-mix(in srgb,"+c+" "+(p||15)+"%,transparent)"; }
                function ini(n){ return n.replace(/^Dr\.?\s*/i,"").split(" ").map(function(w){return w[0];}).join("").slice(0,2).toUpperCase(); }
                function detailUrl(r){ return "doctor-leave-request-detail.html?" + new URLSearchParams({ id:r.id, name:r.name, dept:r.dept, status:r.status }).toString(); }

                /* ================= DATA ================= */
                var TYPES={
                    "Annual Leave":{c:"#0ea5e9",ic:"ti-beach"},"Sick Leave":{c:"#ef4444",ic:"ti-vaccine"},"Conference":{c:"#8b5cf6",ic:"ti-presentation"},"Maternity":{c:"#ec4899",ic:"ti-baby-carriage"},"Emergency":{c:"#f43f5e",ic:"ti-urgent"},"Casual":{c:"#10b981",ic:"ti-coffee"}
                };
                var STAGES=["Pending","Under Review","Approved","Rejected"];
                var STAGEC={Pending:"#f59e0b","Under Review":"#0ea5e9",Approved:"#10b981",Rejected:"#ef4444"};
                var STAGEIC={Pending:"ti-clock","Under Review":"ti-eye",Approved:"ti-circle-check",Rejected:"ti-circle-x"};
                var PRIO={High:"#ef4444",Medium:"#f59e0b",Low:"#10b981"};

                var REQ=[
                    {id:"LR-2041",name:"Dr. John Mathew",dept:"Emergency",spec:"Emergency Medicine",c:"#f43f5e",type:"Sick Leave",start:"Jul 17",end:"Jul 19",days:3,reason:"Recovering from viral fever, advised bed rest by physician.",cov:"Assigned",covDoc:"Dr. G. Nair",status:"Approved",prio:"High",docs:2},
                    {id:"LR-2042",name:"Dr. Sarah Roberts",dept:"Cardiology",spec:"Interventional Cardiology",c:"#ef4444",type:"Conference",start:"Jul 21",end:"Jul 24",days:4,reason:"Speaker at International Cardiology Summit 2026, Mumbai.",cov:"Assigned",covDoc:"Dr. A. Khan",status:"Under Review",prio:"Medium",docs:3},
                    {id:"LR-2043",name:"Dr. Meera Iyer",dept:"Pediatrics",spec:"Neonatology",c:"#f59e0b",type:"Maternity",start:"Aug 01",end:"Oct 30",days:90,reason:"Maternity leave as per hospital policy.",cov:"Pending",covDoc:"",status:"Under Review",prio:"High",docs:4},
                    {id:"LR-2044",name:"Dr. Karan Malhotra",dept:"Dermatology",spec:"Cosmetic Dermatology",c:"#10b981",type:"Annual Leave",start:"Jul 28",end:"Aug 04",days:7,reason:"Family vacation, planned well in advance.",cov:"Not Required",covDoc:"",status:"Pending",prio:"Low",docs:1},
                    {id:"LR-2045",name:"Dr. Vikram Nair",dept:"Neurology",spec:"Stroke & Neuro",c:"#8b5cf6",type:"Casual",start:"Jul 20",end:"Jul 20",days:1,reason:"Personal work at home.",cov:"Pending",covDoc:"",status:"Pending",prio:"Low",docs:0},
                    {id:"LR-2046",name:"Dr. Anita Desai",dept:"Orthopedics",spec:"Joint Replacement",c:"#0ea5e9",type:"Emergency",start:"Jul 18",end:"Jul 22",days:5,reason:"Family medical emergency, needs to travel urgently.",cov:"Assigned",covDoc:"Dr. K. Singh",status:"Pending",prio:"High",docs:1},
                    {id:"LR-2047",name:"Dr. Priya Sharma",dept:"Gynecology",spec:"Obstetrics",c:"#d946ef",type:"Annual Leave",start:"Aug 10",end:"Aug 16",days:7,reason:"Annual planned leave.",cov:"Pending",covDoc:"",status:"Under Review",prio:"Medium",docs:1},
                    {id:"LR-2048",name:"Dr. Deepak Nair",dept:"Radiology",spec:"Diagnostic Imaging",c:"#6366f1",type:"Sick Leave",start:"Jul 16",end:"Jul 17",days:2,reason:"Migraine, unable to attend duty.",cov:"Assigned",covDoc:"Dr. M. Iyer",status:"Approved",prio:"Medium",docs:1},
                    {id:"LR-2049",name:"Dr. Rajesh Menon",dept:"Oncology",spec:"Medical Oncology",c:"#ec4899",type:"Conference",start:"Aug 05",end:"Aug 08",days:4,reason:"Attending oncology research workshop.",cov:"Pending",covDoc:"",status:"Rejected",prio:"Low",docs:2},
                    {id:"LR-2050",name:"Dr. Sunita Rao",dept:"ENT",spec:"Otolaryngology",c:"#14b8a6",type:"Casual",start:"Jul 25",end:"Jul 26",days:2,reason:"Personal.",cov:"Not Required",covDoc:"",status:"Rejected",prio:"Low",docs:0},
                    {id:"LR-2051",name:"Dr. Arjun Menon",dept:"Nephrology",spec:"Dialysis & Transplant",c:"#0891b2",type:"Annual Leave",start:"Aug 12",end:"Aug 20",days:9,reason:"Vacation abroad.",cov:"Pending",covDoc:"",status:"Pending",prio:"Medium",docs:1},
                    {id:"LR-2052",name:"Dr. Fatima Sheikh",dept:"Psychiatry",spec:"Behavioral Health",c:"#a855f7",type:"Conference",start:"Jul 29",end:"Jul 31",days:3,reason:"Mental health conference, presenting a paper.",cov:"Assigned",covDoc:"Dr. N. Roy",status:"Approved",prio:"Medium",docs:2}
                ];

                var POOL=[
                    {name:"Dr. Gopal Nair",dept:"Emergency",c:"#f43f5e",free:5},
                    {name:"Dr. Ayesha Khan",dept:"Cardiology",c:"#ef4444",free:3},
                    {name:"Dr. Kiran Singh",dept:"Orthopedics",c:"#0ea5e9",free:6},
                    {name:"Dr. Manoj Iyer",dept:"Radiology",c:"#6366f1",free:8}
                ];
                var KPIS=[
                    {l:"Pending Requests",v:5,ic:"ti-clock",c:"#f59e0b",p:38,ch:"+2",spark:[3,4,3,5,4,5,5]},
                    {l:"Approved Leaves",v:3,ic:"ti-circle-check",c:"#10b981",p:64,ch:"+1",spark:[1,2,2,3,2,3,3]},
                    {l:"Rejected",v:2,ic:"ti-circle-x",c:"#ef4444",p:16,ch:"-1",spark:[3,2,3,2,2,1,2]},
                    {l:"Doctors On Leave",v:5,ic:"ti-plane",c:"#8b5cf6",p:33,ch:"live",spark:[3,4,4,5,4,5,5]}
                ];

                var state={ q:"", view:"list", filters:{dept:"",spec:"",type:"",status:"",cov:"",prio:"",date:"",sort:"date"}, sel:{} };

                /* ================= SPARKLINE ================= */
                function spark(data,c){
                    var w=90,h=26,max=Math.max.apply(null,data),min=Math.min.apply(null,data),rng=(max-min)||1;
                    var pts=data.map(function(v,i){ return (i/(data.length-1)*w).toFixed(1)+","+(h-((v-min)/rng)*(h-4)-2).toFixed(1); });
                    return '<svg viewBox="0 0 '+w+' '+h+'" width="'+w+'" height="'+h+'" preserveAspectRatio="none"><polyline fill="none" stroke="'+c+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="'+pts.join(" ")+'"/><polyline fill="'+mix(c,14)+'" stroke="none" points="0,'+h+' '+pts.join(" ")+' '+w+','+h+'"/></svg>';
                }

                /* ================= KPIs ================= */
                function renderKPIs(){
                    $("#lv-kpis").innerHTML = KPIS.map(function(k){
                        return '<div class="lv-kpi" style="--kc:'+k.c+'"><div class="flex items-start justify-between mb-2"><div class="lv-kpi-ic" style="background:'+mix(k.c)+';color:'+k.c+'"><i class="ti '+k.ic+' text-lg"></i></div><svg viewBox="0 0 36 36" class="lv-ring w-11 h-11"><circle cx="18" cy="18" r="15.9155" fill="none" stroke="var(--color-gray-200)" stroke-width="3.4"/><circle class="bar" cx="18" cy="18" r="15.9155" fill="none" stroke="'+k.c+'" stroke-width="3.4" stroke-linecap="round" pathLength="100" style="--p:'+k.p+'"/></svg></div><div class="lv-kpi-v">'+k.v+'</div><div class="flex items-center justify-between mt-1"><span class="text-xs lv-muted font-semibold">'+esc(k.l)+'</span><span class="lv-chip" style="background:'+mix(k.c)+';color:'+k.c+'">'+esc(k.ch)+'</span></div><div class="mt-2 opacity-90">'+spark(k.spark,k.c)+'</div></div>';
                    }).join("");
                }

                /* ================= WIDGETS ================= */
                function renderWidgets(){
                    // upcoming
                    var up=REQ.filter(function(r){return r.status!=="Rejected";}).slice(0,5);
                    $("#lv-w-upcoming").innerHTML=up.map(function(r){ var t=TYPES[r.type]||{c:"#94a3b8"}; return '<div class="flex items-center gap-2.5"><div class="lv-av" style="background:linear-gradient(135deg,'+r.c+','+mix(r.c,60)+')">'+esc(ini(r.name))+'</div><div class="flex-1 min-w-0"><div class="text-xs font-bold text-[var(--color-gray-900)] truncate">'+esc(r.name.replace("Dr. ","Dr "))+'</div><div class="text-[11px] lv-muted truncate">'+esc(r.start)+' · '+r.days+'d</div></div><span class="lv-tag" style="background:'+mix(t.c)+';color:'+t.c+'">'+esc(r.type.split(" ")[0])+'</span></div>'; }).join("");

                    // coverage availability ring
                    var need=REQ.filter(function(r){return r.cov!=="Not Required" && r.status!=="Rejected";}).length;
                    var assigned=REQ.filter(function(r){return r.cov==="Assigned";}).length;
                    var pct=Math.round(assigned/(need||1)*100);
                    $("#lv-w-coverage").innerHTML='<div class="flex items-center gap-4"><svg viewBox="0 0 36 36" class="lv-ring w-24 h-24 flex-none"><circle cx="18" cy="18" r="15.9155" fill="none" stroke="var(--color-gray-200)" stroke-width="3.6"/><circle class="bar" cx="18" cy="18" r="15.9155" fill="none" stroke="#10b981" stroke-width="3.6" stroke-linecap="round" pathLength="100" style="--p:'+pct+'"/></svg><div><div class="text-2xl font-extrabold text-[var(--color-gray-900)]">'+pct+'%</div><div class="text-xs lv-muted font-semibold">Coverage assigned</div><div class="mt-2 space-y-1 text-xs"><div class="flex items-center gap-2"><span class="lv-dotstat" style="background:#10b981"></span><span class="lv-muted">Assigned</span><b class="text-[var(--color-gray-900)] ml-auto">'+assigned+'</b></div><div class="flex items-center gap-2"><span class="lv-dotstat" style="background:#f59e0b"></span><span class="lv-muted">Pending</span><b class="text-[var(--color-gray-900)] ml-auto">'+(need-assigned)+'</b></div></div></div></div>';

                    // approval timeline (counts by stage)
                    $("#lv-w-approval").innerHTML=STAGES.map(function(st){ var n=REQ.filter(function(r){return r.status===st;}).length; var c=STAGEC[st]; return '<div class="flex items-center gap-2.5"><span class="w-8 h-8 rounded-lg flex items-center justify-center flex-none" style="background:'+mix(c)+';color:'+c+'"><i class="ti '+STAGEIC[st]+'"></i></span><span class="text-xs font-semibold text-[var(--color-gray-900)] flex-1">'+esc(st)+'</span><span class="text-sm font-extrabold" style="color:'+c+'">'+n+'</span></div>'; }).join("");
                }

                /* ================= FILTER SELECTS =================
                   Department/specialty/type <option> lists are static markup
                   in the HTML now (matching this data). */
                var DEPTS=REQ.map(function(r){return r.dept;}).filter(function(v,i,a){return a.indexOf(v)===i;});
                var SPECS=REQ.map(function(r){return r.spec;}).filter(function(v,i,a){return a.indexOf(v)===i;});

                /* ================= FILTER ================= */
                function filtered(){
                    var f=state.filters, q=state.q.toLowerCase();
                    var arr=REQ.filter(function(r){
                        if(q && (r.name+" "+r.id+" "+r.dept+" "+r.type).toLowerCase().indexOf(q)<0) return false;
                        if(f.dept && r.dept!==f.dept) return false;
                        if(f.spec && r.spec!==f.spec) return false;
                        if(f.type && r.type!==f.type) return false;
                        if(f.status && r.status!==f.status) return false;
                        if(f.cov && r.cov!==f.cov) return false;
                        if(f.prio && r.prio!==f.prio) return false;
                        return true;
                    });
                    var po={High:0,Medium:1,Low:2};
                    arr.sort(function(a,b){
                        if(f.sort==="duration") return b.days-a.days;
                        if(f.sort==="priority") return po[a.prio]-po[b.prio];
                        if(f.sort==="name") return a.name.localeCompare(b.name);
                        return 0;
                    });
                    return arr;
                }

                /* ================= KANBAN ================= */
                function kcardHTML(r){
                    var t=TYPES[r.type]||{c:"#94a3b8",ic:"ti-calendar"};
                    return '<div class="lv-kcard" draggable="true" data-id="'+r.id+'" style="--kc:'+r.c+'">'+
                        '<div class="flex items-start gap-2"><div class="lv-av" style="background:linear-gradient(135deg,'+r.c+','+mix(r.c,60)+')">'+esc(ini(r.name))+'</div>'+
                        '<div class="flex-1 min-w-0"><div class="text-xs font-bold text-[var(--color-gray-900)] truncate">'+esc(r.name.replace("Dr. ","Dr "))+'</div><div class="text-[10px] lv-muted truncate">'+esc(r.dept)+' · <a href="'+detailUrl(r)+'" class="hover:underline">'+esc(r.id)+'</a></div></div>'+
                        '<span class="lv-tag flex-none" style="background:'+mix(PRIO[r.prio])+';color:'+PRIO[r.prio]+'"><i class="ti ti-flag-3" style="font-size:.6rem"></i>'+esc(r.prio)+'</span></div>'+
                        '<div class="flex items-center gap-1.5 mt-2"><span class="lv-tag" style="background:'+mix(t.c)+';color:'+t.c+'"><i class="ti '+t.ic+'" style="font-size:.62rem"></i>'+esc(r.type)+'</span><span class="lv-tag" style="background:var(--color-gray-100);color:var(--color-gray-600)"><i class="ti ti-calendar" style="font-size:.62rem"></i>'+r.days+'d</span></div>'+
                        '<p class="text-[11px] lv-muted mt-2 line-clamp-2" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">'+esc(r.reason)+'</p>'+
                        '<div class="flex items-center justify-between mt-2.5 pt-2 border-t border-[var(--color-border-color)]"><span class="lv-tag" style="background:'+mix(r.cov==="Assigned"?"#10b981":r.cov==="Pending"?"#f59e0b":"#94a3b8")+';color:'+(r.cov==="Assigned"?"#059669":r.cov==="Pending"?"#d97706":"#64748b")+'"><i class="ti ti-user-shield" style="font-size:.62rem"></i>'+esc(r.cov)+'</span>'+
                        '<div class="flex items-center gap-1"><button class="lv-btn lv-btn-soft !p-1.5" data-open="'+r.id+'" title="View"><i class="ti ti-eye"></i></button><button class="lv-btn lv-btn-soft !p-1.5" data-menu="'+r.id+'"><i class="ti ti-dots-vertical"></i></button></div></div>'+
                    '</div>';
                }
                function renderKanban(arr){
                    $("#lv-kanban").innerHTML=STAGES.map(function(st){
                        var items=arr.filter(function(r){return r.status===st;});
                        var c=STAGEC[st];
                        return '<div class="lv-kcol" data-col="'+st+'"><div class="lv-khd"><span class="w-2.5 h-2.5 rounded-full" style="background:'+c+'"></span><span class="text-[var(--color-gray-900)]">'+esc(st)+'</span><span class="lv-tag ml-auto" style="background:'+mix(c)+';color:'+c+'">'+items.length+'</span></div><div class="lv-kbody" data-col="'+st+'">'+(items.map(kcardHTML).join("")||'<div class="text-[11px] lv-muted text-center py-4">Drop requests here</div>')+'</div></div>';
                    }).join("");
                    wireDnD();
                }
                function wireDnD(){
                    var dragId=null;
                    $$(".lv-kcard").forEach(function(card){
                        card.addEventListener("dragstart", function(){ dragId=this.getAttribute("data-id"); this.classList.add("dragging"); });
                        card.addEventListener("dragend", function(){ this.classList.remove("dragging"); $$(".lv-kcol").forEach(function(c){c.classList.remove("drop");}); });
                    });
                    $$(".lv-kcol").forEach(function(col){
                        col.addEventListener("dragover", function(e){ e.preventDefault(); this.classList.add("drop"); });
                        col.addEventListener("dragleave", function(){ this.classList.remove("drop"); });
                        col.addEventListener("drop", function(e){
                            e.preventDefault(); this.classList.remove("drop");
                            var st=this.getAttribute("data-col"), r=REQ.filter(function(x){return x.id===dragId;})[0];
                            if(r && r.status!==st){ r.status=st; renderKanban(filtered()); renderKPIs(); renderWidgets(); animateRings(); toast(r.id+" moved to "+st, st==="Approved"?"ti-circle-check":st==="Rejected"?"ti-circle-x":"ti-arrows-exchange"); }
                        });
                    });
                }

                /* ================= LIST ================= */
                function renderList(arr){
                    $("#lv-tbody").innerHTML=arr.map(function(r){
                        var t=TYPES[r.type]||{c:"#94a3b8"}, sc=STAGEC[r.status];
                        return '<tr data-row="'+r.id+'">'+
                            '<td><input type="checkbox" class="lv-cb lv-rowcb" data-id="'+r.id+'"'+(state.sel[r.id]?" checked":"")+'></td>'+
                            '<td class="font-bold text-[var(--color-primary)]">'+esc(r.id)+'</td>'+
                            '<td><div class="flex items-center gap-2.5"><div class="lv-av" style="width:2.1rem;height:2.1rem;background:linear-gradient(135deg,'+r.c+','+mix(r.c,60)+')">'+esc(ini(r.name))+'</div><div><div class="font-bold text-[var(--color-gray-900)]">'+esc(r.name)+'</div><div class="text-xs lv-muted">'+esc(r.spec)+'</div></div></div></td>'+
                            '<td class="lv-muted">'+esc(r.dept)+'</td>'+
                            '<td><span class="lv-tag" style="background:'+mix(t.c)+';color:'+t.c+'">'+esc(r.type)+'</span></td>'+
                            '<td class="lv-muted whitespace-nowrap">'+esc(r.start)+'</td><td class="lv-muted whitespace-nowrap">'+esc(r.end)+'</td>'+
                            '<td class="font-bold text-[var(--color-gray-900)]">'+r.days+'d</td>'+
                            '<td><span class="lv-tag" style="background:'+mix(r.cov==="Assigned"?"#10b981":r.cov==="Pending"?"#f59e0b":"#94a3b8")+';color:'+(r.cov==="Assigned"?"#059669":r.cov==="Pending"?"#d97706":"#64748b")+'">'+esc(r.cov)+'</span></td>'+
                            '<td><span class="lv-tag" style="background:'+mix(sc)+';color:'+sc+'"><span class="lv-dotstat" style="background:'+sc+'"></span>'+esc(r.status)+'</span></td>'+
                            '<td><button class="lv-btn lv-btn-soft !p-1.5" data-menu="'+r.id+'"><i class="ti ti-dots-vertical"></i></button></td>'+
                        '</tr>';
                    }).join("");
                    syncSelAll();
                }

                /* ================= CALENDAR ================= */
                function renderCalendar(arr){
                    var todayIdx=3;
                    // map requests to days 13..19 by simple hash of start
                    var startDays={17:[],21:[],1:[],28:[],20:[],18:[],10:[],16:[],5:[],25:[],12:[],29:[]};
                    var week=[13,14,15,16,17,18,19];
                    var html=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(function(day,di){
                        var dnum=week[di];
                        var items=arr.filter(function(r){ var d=parseInt(r.start.replace(/[^0-9]/g,""),10); return d>=dnum && d<dnum+1 || (di===todayIdx && ["Jul 16","Jul 17","Jul 18"].indexOf(r.start)>=0); });
                        // simpler: bucket by day-of-month matching within week
                        items=arr.filter(function(r){ var d=parseInt(r.start.replace(/[^0-9]/g,""),10); return d===dnum; });
                        var blocks=items.slice(0,4).map(function(r){
                            var t=TYPES[r.type]||{c:"#94a3b8"}, sc=STAGEC[r.status];
                            return '<div class="lv-block" data-open="'+r.id+'" style="border-left:3px solid '+t.c+'"><div class="flex items-center gap-1.5"><div class="lv-av" style="width:1.6rem;height:1.6rem;font-size:.55rem;background:linear-gradient(135deg,'+r.c+','+mix(r.c,60)+')">'+esc(ini(r.name))+'</div><span class="text-[10px] font-bold text-[var(--color-gray-900)] truncate flex-1">'+esc(r.name.replace("Dr. ","Dr "))+'</span><span class="lv-dotstat" style="background:'+sc+'"></span></div><div class="text-[9px] lv-muted mt-1">'+esc(r.type)+' · '+r.days+'d</div></div>';
                        }).join("");
                        var more=items.length>4?'<div class="text-[10px] text-center lv-muted font-semibold py-1">+'+(items.length-4)+' more</div>':'';
                        return '<div class="lv-calcol"><div class="lv-calhd'+(di===todayIdx?" today":"")+'">'+day+' <span class="opacity-70 font-medium">'+dnum+'</span></div><div class="pb-1 min-h-[80px]">'+(blocks||'<div class="text-[10px] lv-muted text-center py-4">No leave</div>')+more+'</div></div>';
                    }).join("");
                    $("#lv-calendar").innerHTML=html;
                }

                /* ================= APPROVAL WORKFLOW ================= */
                function renderWorkflow(){
                    var steps=[
                        {n:"Request Submitted",ic:"ti-file-plus",done:1},{n:"Department Review",ic:"ti-building-hospital",done:1},{n:"HR Review",ic:"ti-user-check",done:1},{n:"Coverage Assigned",ic:"ti-user-shield",done:1},{n:"Final Approval",ic:"ti-rubber-stamp",done:0,cur:1},{n:"Leave Activated",ic:"ti-plane-departure",done:0},{n:"Return to Duty",ic:"ti-arrow-back-up",done:0}
                    ];
                    $("#lv-workflow").innerHTML=steps.map(function(s,i){
                        var c=s.done?"#10b981":s.cur?"var(--color-primary)":"var(--color-gray-300)";
                        var tc=s.done||s.cur?"var(--color-gray-900)":"var(--color-gray-400)";
                        return '<div class="flex items-center flex-none">'+(i>0?'<div class="w-8 h-.5 rounded" style="height:2px;background:'+(steps[i-1].done?"#10b981":"var(--color-gray-200)")+'"></div>':'')+
                            '<div class="flex flex-col items-center gap-1.5 px-1" style="min-width:92px"><div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background:'+(s.done||s.cur?mix(s.done?"#10b981":"var(--color-primary)"):"var(--color-gray-100)")+';color:'+c+';'+(s.cur?"box-shadow:0 0 0 4px "+mix("var(--color-primary)",20):"")+'"><i class="ti '+(s.done?"ti-check":s.ic)+'"></i></div><span class="text-[10px] font-bold text-center leading-tight" style="color:'+tc+'">'+esc(s.n)+'</span></div></div>';
                    }).join("");
                }

                /* ================= COVERAGE TOOLS + POOL ================= */
                function renderSide(){
                    var tools=[
                        {n:"Replacement Doctor",ic:"ti-user-plus",c:"#0ea5e9",m:"coverage"},
                        {n:"Shift Coverage",ic:"ti-clock-share",c:"#10b981",m:"coverage"},
                        {n:"Dept Availability",ic:"ti-building-hospital",c:"#6366f1",m:"coverage"},
                        {n:"Emergency Coverage",ic:"ti-urgent",c:"#ef4444",m:"coverage"},
                        {n:"Pending Assignments",ic:"ti-hourglass",c:"#f59e0b",m:"coverage"},
                        {n:"Coverage Calendar",ic:"ti-calendar",c:"#ec4899",m:"coverage"}
                    ];
                    $("#lv-covtools").innerHTML=tools.map(function(t){ return '<button class="flex flex-col items-start gap-1.5 p-3 rounded-xl border border-[var(--color-border-color)] hover:border-[var(--color-primary)] transition text-left" data-modal="'+t.m+'"><span class="w-8 h-8 rounded-lg flex items-center justify-center" style="background:'+mix(t.c)+';color:'+t.c+'"><i class="ti '+t.ic+'"></i></span><span class="text-xs font-bold text-[var(--color-gray-900)]">'+esc(t.n)+'</span></button>'; }).join("");

                    $("#lv-pool").innerHTML=POOL.map(function(p){ return '<div class="flex items-center gap-2.5 p-2.5 rounded-lg border border-[var(--color-border-color)]"><div class="lv-av" style="width:2.2rem;height:2.2rem;background:linear-gradient(135deg,'+p.c+','+mix(p.c,60)+')">'+esc(ini(p.name))+'</div><div class="flex-1 min-w-0"><div class="text-xs font-bold text-[var(--color-gray-900)] truncate">'+esc(p.name)+'</div><div class="text-[11px] lv-muted truncate">'+esc(p.dept)+'</div></div><span class="lv-tag" style="background:'+mix("#10b981")+';color:#059669">'+p.free+' free</span></div>'; }).join("");
                }

                /* ================= RENDER ================= */
                function render(){
                    var arr=filtered();
                    ["board","list","calendar"].forEach(function(v){ $("#lv-view-"+v).classList.toggle("hidden", state.view!==v); });
                    $("#lv-empty").classList.toggle("hidden", arr.length>0 || state.view==="calendar");
                    if(state.view==="board") renderKanban(arr);
                    else if(state.view==="list") renderList(arr);
                    else renderCalendar(arr);
                }

                /* ================= ACTION MENU ================= */
                var ACTIONS=[
                    {a:"view",n:"View Request",ic:"ti-eye"},{a:"edit",n:"Edit Request",ic:"ti-edit"},
                    {sep:1},{a:"approve",n:"Approve",ic:"ti-circle-check",ok:1},{a:"reject",n:"Reject",ic:"ti-circle-x",danger:1},{a:"changes",n:"Request Changes",ic:"ti-message-report"},
                    {sep:1},{a:"replace",n:"Assign Replacement",ic:"ti-user-plus"},{a:"shiftcov",n:"Assign Shift Coverage",ic:"ti-clock-share"},{a:"sched",n:"View Doctor Schedule",ic:"ti-calendar"},{a:"docs",n:"View Documents",ic:"ti-files"},
                    {sep:1},{a:"print",n:"Print Request",ic:"ti-printer"},{a:"pdf",n:"Download PDF",ic:"ti-file-download"},{a:"notify",n:"Send Notification",ic:"ti-bell"},{a:"email",n:"Send Email",ic:"ti-mail"},
                    {sep:1},{a:"archive",n:"Archive",ic:"ti-archive"},{a:"delete",n:"Delete",ic:"ti-trash",danger:1}
                ];
                var menuReq=null;
                function openMenu(id,x,y){
                    menuReq=id; var m=$("#lv-menu");
                    m.innerHTML=ACTIONS.map(function(a){ return a.sep?'<div class="lv-sep"></div>':'<div class="lv-mi'+(a.danger?" danger":a.ok?" ok":"")+'" data-act="'+a.a+'"><i class="ti '+a.ic+'"></i>'+esc(a.n)+'</div>'; }).join("");
                    m.classList.add("open");
                    var h=Math.min(m.scrollHeight,window.innerHeight*0.7);
                    m.style.left=Math.max(8,Math.min(x, window.innerWidth-220))+"px"; m.style.top=Math.max(8,Math.min(y, window.innerHeight-h-8))+"px";
                }
                function closeMenu(){ $("#lv-menu").classList.remove("open"); menuReq=null; }
                function doAction(act){
                    var r=REQ.filter(function(x){return x.id===menuReq;})[0]; var name=r?r.name:"request";
                    if(act==="view"){ closeMenu(); openDrawer(menuReq); return; }
                    if(act==="approve" && r){ r.status="Approved"; render(); renderKPIs(); renderWidgets(); animateRings(); toast(r.id+" approved","ti-circle-check"); closeMenu(); return; }
                    if(act==="reject" && r){ r.status="Rejected"; render(); renderKPIs(); renderWidgets(); animateRings(); toast(r.id+" rejected","ti-circle-x"); closeMenu(); return; }
                    if(["edit","replace","shiftcov"].indexOf(act)>=0){ closeMenu(); openModal(act==="edit"?"new":"coverage", r); return; }
                    if(act==="docs"){ closeMenu(); openModal("docs", r); return; }
                    if(act==="delete"){ closeMenu(); openModal("delete", r); return; }
                    var msgs={changes:"Changes requested",sched:"Opening schedule",print:"Printing request",pdf:"Downloading PDF",notify:"Notification sent",email:"Email sent",archive:"Request archived"};
                    toast((msgs[act]||"Action")+" — "+name.replace("Dr. ","Dr "),"ti-check"); closeMenu();
                }

                /* ================= DRAWER ================= */
                function openDrawer(id){
                    var r=REQ.filter(function(x){return x.id===id;})[0]; if(!r) return;
                    var t=TYPES[r.type]||{c:"#94a3b8",ic:"ti-calendar"}, sc=STAGEC[r.status];
                    var hist=[
                        {n:"Request Submitted",tm:"Jul 14, 09:12",c:"#10b981",done:1},
                        {n:"Department Review",tm:"Jul 14, 14:30",c:"#10b981",done:1},
                        {n:"HR Review",tm:"Jul 15, 10:05",c:"#10b981",done:1},
                        {n:"Coverage "+(r.cov==="Assigned"?"Assigned":"Pending"),tm:r.cov==="Assigned"?"Jul 15, 16:20":"—",c:r.cov==="Assigned"?"#10b981":"#f59e0b",done:r.cov==="Assigned"?1:0},
                        {n:"Final Approval",tm:r.status==="Approved"?"Jul 16, 09:00":"Pending",c:r.status==="Approved"?"#10b981":r.status==="Rejected"?"#ef4444":"#94a3b8",done:r.status==="Approved"?1:0}
                    ];
                    var docs=[]; for(var i=0;i<r.docs;i++) docs.push(["medical-certificate.pdf","leave-form.pdf","itinerary.pdf","approval-letter.pdf"][i]||"document.pdf");
                    $("#lv-drawer-body").innerHTML=''+
                        '<div class="relative p-5 pb-8" style="background:linear-gradient(135deg,'+r.c+','+mix(r.c,55)+')">'+
                            '<div class="flex items-center justify-between"><button class="lv-btn lv-btn-glass !p-2" data-close><i class="ti ti-x"></i></button><span class="lv-tag" style="background:rgba(255,255,255,.2);color:#fff;border:1px solid rgba(255,255,255,.3)"><span class="lv-dotstat" style="background:#fff"></span>'+esc(r.status)+'</span></div>'+
                            '<div class="flex items-center gap-3 mt-4 text-white"><div class="w-16 h-16 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-xl font-extrabold">'+esc(ini(r.name))+'</div><div><h2 class="text-xl font-extrabold">'+esc(r.name)+'</h2><p class="text-white/80 text-sm">'+esc(r.dept)+' · '+esc(r.spec)+'</p><p class="text-white/70 text-xs mt-.5">'+esc(r.id)+' · '+esc(r.prio)+' priority</p></div></div>'+
                        '</div>'+
                        '<div class="p-5 space-y-5">'+
                            '<div class="grid grid-cols-3 gap-2 text-center"><div class="p-3 rounded-xl border border-[var(--color-border-color)]"><div class="text-lg font-extrabold text-[var(--color-gray-900)]">'+r.days+'</div><div class="text-[10px] lv-muted font-semibold">Days</div></div><div class="p-3 rounded-xl border border-[var(--color-border-color)]"><div class="text-sm font-extrabold text-[var(--color-gray-900)]">'+esc(r.start)+'</div><div class="text-[10px] lv-muted font-semibold">Start</div></div><div class="p-3 rounded-xl border border-[var(--color-border-color)]"><div class="text-sm font-extrabold text-[var(--color-gray-900)]">'+esc(r.end)+'</div><div class="text-[10px] lv-muted font-semibold">End</div></div></div>'+
                            '<div class="flex items-center gap-2.5 p-3 rounded-xl" style="background:'+mix(t.c,8)+';border:1px solid '+mix(t.c,22)+'"><i class="ti '+t.ic+' text-lg" style="color:'+t.c+'"></i><div><div class="text-xs lv-muted font-semibold">Leave Type</div><div class="text-sm font-bold text-[var(--color-gray-900)]">'+esc(r.type)+'</div></div></div>'+
                            '<div><div class="text-xs lv-muted font-semibold mb-1.5">Reason</div><p class="text-sm lv-muted leading-relaxed p-3 rounded-lg bg-[var(--color-gray-100)]">'+esc(r.reason)+'</p></div>'+
                            '<div><div class="text-xs lv-muted font-semibold mb-2">Supporting Documents ('+r.docs+')</div>'+(docs.length?'<div class="space-y-1.5">'+docs.map(function(d){ return '<div class="flex items-center gap-2.5 p-2 rounded-lg border border-[var(--color-border-color)]"><i class="ti ti-file-text text-rose-500"></i><span class="text-xs font-semibold text-[var(--color-gray-900)] flex-1 truncate">'+esc(d)+'</span><button class="lv-btn lv-btn-soft !p-1.5" data-toast="Downloading '+esc(d)+'"><i class="ti ti-download"></i></button></div>'; }).join("")+'</div>':'<p class="text-xs lv-muted">No documents attached.</p>')+'</div>'+
                            '<div><div class="text-xs lv-muted font-semibold mb-2">Assigned Coverage</div>'+(r.covDoc?'<div class="flex items-center gap-2.5 p-2.5 rounded-lg" style="background:'+mix("#10b981",8)+';border:1px solid '+mix("#10b981",22)+'"><i class="ti ti-user-shield text-emerald-500"></i><span class="text-sm font-bold text-[var(--color-gray-900)] flex-1">'+esc(r.covDoc)+'</span><span class="lv-tag" style="background:'+mix("#10b981")+';color:#059669">Covering</span></div>':'<button class="lv-btn lv-btn-soft w-full" data-modal="coverage"><i class="ti ti-user-plus"></i> Assign Coverage</button>')+'</div>'+
                            '<div><div class="text-xs lv-muted font-semibold mb-2">Approval History / Timeline</div><div class="space-y-2.5">'+hist.map(function(h,i){ return '<div class="flex gap-3"><div class="flex flex-col items-center"><div class="w-6 h-6 rounded-full flex items-center justify-center flex-none" style="background:'+mix(h.c)+';color:'+h.c+'"><i class="ti '+(h.done?"ti-check":"ti-clock")+' text-xs"></i></div>'+(i<hist.length-1?'<div class="w-px flex-1 bg-[var(--color-border-color)] mt-1"></div>':'')+'</div><div class="pb-2"><div class="text-xs font-bold text-[var(--color-gray-900)]">'+esc(h.n)+'</div><div class="text-[11px] lv-muted">'+esc(h.tm)+'</div></div></div>'; }).join("")+'</div></div>'+
                            '<div class="grid grid-cols-2 gap-2 pt-1"><button class="lv-btn lv-btn-primary" data-act2="approve" data-id2="'+r.id+'"><i class="ti ti-check"></i> Approve</button><button class="lv-btn lv-btn-soft !text-rose-500" data-act2="reject" data-id2="'+r.id+'"><i class="ti ti-x"></i> Reject</button><button class="lv-btn lv-btn-soft" data-modal="coverage"><i class="ti ti-user-shield"></i> Coverage</button><button class="lv-btn lv-btn-soft" data-toast="Notification sent"><i class="ti ti-bell"></i> Notify</button></div>'+
                        '</div>';
                    $("#lv-drawer").classList.add("open");
                    document.body.style.overflow = "hidden";
                }

                /* ================= MODALS ================= */
                function fld(label,inner){ return '<div><label class="lv-lbl">'+label+'</label>'+inner+'</div>'; }
                function selDoc(){ return '<select class="lv-inp">'+REQ.map(function(r){return '<option>'+esc(r.name)+'</option>';}).filter(function(v,i,a){return a.indexOf(v)===i;}).join("")+'</select>'; }
                function selType(){ return '<select class="lv-inp">'+Object.keys(TYPES).map(function(t){return '<option>'+esc(t)+'</option>';}).join("")+'</select>'; }
                function selPool(){ return '<select class="lv-inp">'+POOL.map(function(p){return '<option>'+esc(p.name)+' — '+esc(p.dept)+' ('+p.free+' free)</option>';}).join("")+'</select>'; }
                var MODALS={
                    new:{t:"New Leave Request",ic:"ti-calendar-plus",body:function(r){ return '<div class="space-y-3">'+fld("Doctor",selDoc())+'<div class="grid grid-cols-2 gap-3">'+fld("Leave Type",selType())+fld("Priority",'<select class="lv-inp"><option>Low</option><option>Medium</option><option>High</option></select>')+'</div><div class="grid grid-cols-2 gap-3">'+fld("Start Date",'<input type="text" placeholder="dd-mm-yyyy" class="lv-inp" data-provider="flatpickr" data-date-format="d-m-Y">')+fld("End Date",'<input type="text" placeholder="dd-mm-yyyy" class="lv-inp" data-provider="flatpickr" data-date-format="d-m-Y">')+'</div>'+fld("Reason",'<textarea class="lv-inp" rows="3" placeholder="Reason for leave">'+(r?esc(r.reason):"")+'</textarea>')+'</div>'; },cta:"Submit Request"},
                    coverage:{t:"Assign Coverage",ic:"ti-user-shield",body:function(){ return '<div class="space-y-3">'+fld("Leave Request",'<select class="lv-inp">'+REQ.map(function(r){return '<option>'+esc(r.id)+' — '+esc(r.name)+'</option>';}).join("")+'</select>')+fld("Replacement Doctor",selPool())+fld("Coverage Type",'<select class="lv-inp"><option>Full Shift</option><option>Partial</option><option>On-call only</option><option>Emergency only</option></select>')+fld("Notes",'<input class="lv-inp" placeholder="Optional">')+'</div>'; },cta:"Assign Coverage"},
                    docs:{t:"Supporting Documents",ic:"ti-files",body:function(r){ var n=r?r.docs:0; var names=["medical-certificate.pdf","leave-form.pdf","itinerary.pdf","approval-letter.pdf"]; var d=[]; for(var i=0;i<n;i++) d.push(names[i]); return '<div class="space-y-2">'+(d.length?d.map(function(x){ return '<div class="flex items-center gap-2.5 p-2.5 rounded-lg border border-[var(--color-border-color)]"><i class="ti ti-file-text text-rose-500 text-lg"></i><span class="text-sm font-semibold text-[var(--color-gray-900)] flex-1 truncate">'+esc(x)+'</span><button class="lv-btn lv-btn-soft !p-1.5" data-toast="Downloading"><i class="ti ti-download"></i></button></div>'; }).join(""):'<p class="text-sm lv-muted text-center py-4">No documents attached.</p>')+'<div class="lv-drop" id="lv-dropzone"><i class="ti ti-cloud-upload text-2xl lv-muted"></i><p class="text-xs font-bold text-[var(--color-gray-900)] mt-1">Upload additional documents</p><input type="file" class="hidden" id="lv-file"></div></div>'; },cta:"Save"},
                    approvebulk:{t:"Approve Requests",ic:"ti-checks",body:function(){ var pend=REQ.filter(function(r){return r.status==="Pending"||r.status==="Under Review";}); return '<div class="space-y-2"><p class="text-sm lv-muted mb-2">'+pend.length+' requests awaiting approval:</p>'+pend.map(function(r){ return '<label class="flex items-center gap-2.5 p-2.5 rounded-lg border border-[var(--color-border-color)] cursor-pointer"><input type="checkbox" class="lv-cb" checked><div class="lv-av" style="width:2rem;height:2rem;background:linear-gradient(135deg,'+r.c+','+mix(r.c,60)+')">'+esc(ini(r.name))+'</div><div class="flex-1 min-w-0"><div class="text-xs font-bold text-[var(--color-gray-900)] truncate">'+esc(r.name)+'</div><div class="text-[11px] lv-muted">'+esc(r.type)+' · '+r.days+'d</div></div><span class="lv-tag" style="background:'+mix(STAGEC[r.status])+';color:'+STAGEC[r.status]+'">'+esc(r.status)+'</span></label>'; }).join("")+'</div>'; },cta:"Approve All Selected"},
                    import:{t:"Import Leave Requests",ic:"ti-upload",body:function(){ return '<div class="space-y-3"><div class="lv-drop" id="lv-dropzone"><i class="ti ti-cloud-upload text-3xl lv-muted"></i><p class="text-sm font-bold text-[var(--color-gray-900)] mt-2">Drag & drop CSV / Excel / Leave Requests</p><p class="text-xs lv-muted">or click to browse files</p><input type="file" class="hidden" id="lv-file"></div><button class="lv-btn lv-btn-soft w-full" data-toast="Sample template downloaded"><i class="ti ti-file-download"></i> Download Sample Template</button><div class="p-3 rounded-lg" style="background:'+mix("#f59e0b",8)+'"><div class="text-xs font-bold text-[var(--color-gray-900)] mb-1">Import Summary</div><div class="text-xs lv-muted" id="lv-import-sum">No file selected yet.</div></div></div>'; },cta:"Start Import"},
                    export:{t:"Export Leave Report",ic:"ti-download",body:function(){ var opts=[["CSV","ti-file-text"],["Excel","ti-file-spreadsheet"],["PDF","ti-file-typography"],["Print","ti-printer"]]; return '<div class="space-y-4"><div><div class="lv-lbl">Format</div><div class="grid grid-cols-2 gap-2">'+opts.map(function(o,i){ return '<button class="lv-btn lv-btn-soft justify-start lv-expfmt'+(i===0?" !border-[var(--color-primary)]":"")+'" data-fmt="'+o[0]+'"><i class="ti '+o[1]+'"></i> '+o[0]+'</button>'; }).join("")+'</div></div><div><div class="lv-lbl">Scope</div><select class="lv-inp"><option>Leave Calendar</option><option>Department Report</option><option>Selected Records</option><option>All Records</option></select></div></div>'; },cta:"Export Now"},
                    print:{t:"Print Leave Report",ic:"ti-printer",body:function(){ return '<div class="space-y-3">'+fld("Range",'<select class="lv-inp"><option>This Week</option><option>This Month</option><option>Custom</option></select>')+fld("Include",'<select class="lv-inp"><option>All requests</option><option>Approved only</option><option>Pending only</option><option>By department</option></select>')+'</div>'; },cta:"Print"},
                    delete:{t:"Delete Confirmation",ic:"ti-trash",danger:1,body:function(r){ return '<div class="text-center py-2"><div class="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-3" style="background:'+mix("#ef4444")+';color:#ef4444"><i class="ti ti-alert-triangle text-2xl"></i></div><p class="font-bold text-[var(--color-gray-900)]">Delete '+(r?esc(r.id):"selected requests")+'?</p><p class="text-sm lv-muted mt-1">This leave request will be permanently removed. This action cannot be undone.</p></div>'; },cta:"Delete",danger:1}
                };
                function openModal(key,r){
                    var m=MODALS[key]; if(!m) return; var danger=m.danger;
                    $("#lv-dialog").innerHTML='<div class="p-5"><div class="flex items-center justify-between mb-4"><h3 class="font-bold text-lg text-[var(--color-gray-900)] flex items-center gap-2"><i class="ti '+m.ic+'" style="color:'+(danger?"#ef4444":"var(--color-primary)")+'"></i> '+esc(m.t)+'</h3><button class="lv-btn lv-btn-soft !p-2" data-close><i class="ti ti-x"></i></button></div>'+m.body(r)+'<div class="flex justify-end gap-2 mt-5"><button class="lv-btn lv-btn-soft" data-close>Cancel</button><button class="lv-btn '+(danger?"lv-btn-soft !bg-rose-500 !text-white":"lv-btn-primary")+'" id="lv-modal-ok"><i class="ti '+(danger?"ti-trash":"ti-check")+'"></i> '+esc(m.cta)+'</button></div></div>';
                    $("#lv-modal").classList.add("open");
                    document.body.style.overflow = "hidden";
                    // Modal HTML is injected after the page's initial-load flatpickr auto-init has
                    // already run, so any date fields inside it must be initialized here instead.
                    if(typeof flatpickr!=="undefined"){
                        $$('[data-provider="flatpickr"]',$("#lv-dialog")).forEach(function(el){
                            if(el._flatpickr) return;
                            var config={disableMobile:true};
                            if(el.hasAttribute("data-date-format")) config.dateFormat=el.getAttribute("data-date-format");
                            flatpickr(el,config);
                        });
                    }
                    $("#lv-modal-ok").addEventListener("click", function(){
                        $("#lv-modal").classList.remove("open");
                        if(!$$(".lv-drawer.open,.lv-modal.open").length) document.body.style.overflow="";
                        if(key==="delete" && r){ var i=REQ.indexOf(r); if(i>=0) REQ.splice(i,1); render(); renderKPIs(); renderWidgets(); animateRings(); }
                        if(key==="approvebulk"){ REQ.forEach(function(x){ if(x.status==="Pending"||x.status==="Under Review") x.status="Approved"; }); render(); renderKPIs(); renderWidgets(); animateRings(); }
                        if(key==="coverage"){ renderWidgets(); }
                        toast(m.t+" completed", danger?"ti-trash":"ti-check");
                    });
                    var dz=$("#lv-dropzone");
                    if(dz){ dz.addEventListener("click", function(){ $("#lv-file").click(); }); var fi=$("#lv-file"); if(fi) fi.addEventListener("change", function(){ if(this.files[0] && $("#lv-import-sum")) $("#lv-import-sum").innerHTML='<b class="text-[var(--color-gray-900)]">'+esc(this.files[0].name)+'</b> ready · 18 rows · 0 errors'; });
                        ["dragover","dragenter"].forEach(function(ev){ dz.addEventListener(ev,function(e){ e.preventDefault(); dz.classList.add("drag"); }); });
                        ["dragleave","drop"].forEach(function(ev){ dz.addEventListener(ev,function(e){ e.preventDefault(); dz.classList.remove("drag"); }); });
                    }
                    $$(".lv-expfmt").forEach(function(b){ b.addEventListener("click", function(){ $$(".lv-expfmt").forEach(function(x){ x.classList.remove("!border-[var(--color-primary)]"); }); this.classList.add("!border-[var(--color-primary)]"); }); });
                }

                /* ================= SELECTION / BULK ================= */
                function selCount(){ return Object.keys(state.sel).filter(function(k){return state.sel[k];}).length; }
                function syncBulk(){ var n=selCount(); $("#lv-bulk-n").textContent=n; $("#lv-bulk").classList.toggle("show", n>0); }
                function syncSelAll(){ var sa=$("#lv-selall"); if(!sa) return; var vis=filtered(); sa.checked=vis.length>0 && vis.every(function(r){return state.sel[r.id];}); }

                /* ================= EVENTS ================= */
                $("#lv-search").addEventListener("input", function(){ state.q=this.value; render(); });
                $("#lv-filter-toggle").addEventListener("click", function(){ $("#lv-filters").classList.toggle("hidden"); });
                $("#lv-view").addEventListener("click", function(e){ var b=e.target.closest("[data-v]"); if(!b) return; state.view=b.getAttribute("data-v"); $$(".lv-segb",this).forEach(function(x){ x.classList.toggle("active",x===b); }); render(); });
                $$('[data-f]').forEach(function(sel){ sel.addEventListener("change", function(){ state.filters[this.getAttribute("data-f")]=this.value; updateFilterCount(); render(); }); });
                $("#lv-clear").addEventListener("click", function(){ Object.keys(state.filters).forEach(function(k){ if(k!=="sort") state.filters[k]=""; }); $$('[data-f]').forEach(function(s){ if(s.getAttribute("data-f")!=="sort") s.value=""; }); updateFilterCount(); render(); toast("Filters cleared","ti-filter-off"); });
                function updateFilterCount(){ var n=Object.keys(state.filters).filter(function(k){ return k!=="sort" && state.filters[k]; }).length; var el=$("#lv-filter-n"); el.textContent=n; el.classList.toggle("hidden", n===0); }

                document.addEventListener("click", function(e){
                    var mo=e.target.closest("[data-modal]"); if(mo){ openModal(mo.getAttribute("data-modal")); return; }
                    var op=e.target.closest("[data-open]"); if(op){ openDrawer(op.getAttribute("data-open")); return; }
                    var a2=e.target.closest("[data-act2]"); if(a2){ var id=a2.getAttribute("data-id2"), act=a2.getAttribute("data-act2"), r=REQ.filter(function(x){return x.id===id;})[0]; if(r){ r.status=act==="approve"?"Approved":"Rejected"; $("#lv-drawer").classList.remove("open"); if(!$$(".lv-drawer.open,.lv-modal.open").length) document.body.style.overflow=""; render(); renderKPIs(); renderWidgets(); animateRings(); toast(r.id+(act==="approve"?" approved":" rejected"), act==="approve"?"ti-circle-check":"ti-circle-x"); } return; }
                    var mb=e.target.closest("[data-menu]"); if(mb){ var rc=mb.getBoundingClientRect(); openMenu(mb.getAttribute("data-menu"), rc.right-212, rc.bottom+4); e.stopPropagation(); return; }
                    var ai=e.target.closest("[data-act]"); if(ai){ doAction(ai.getAttribute("data-act")); return; }
                    var tt=e.target.closest("[data-toast]"); if(tt){ toast(tt.getAttribute("data-toast"),"ti-info-circle"); return; }
                    if(e.target.closest("[data-refresh]")){ $("#lv-h-updated").textContent="just now"; render(); renderKPIs(); renderWidgets(); animateRings(); toast("Leave data refreshed","ti-refresh"); return; }
                    var rcb=e.target.closest(".lv-rowcb"); if(rcb){ state.sel[rcb.getAttribute("data-id")]=rcb.checked; syncBulk(); syncSelAll(); return; }
                    var cl=e.target.closest("[data-close]"); if(cl){ var m=cl.closest(".lv-drawer,.lv-modal"); if(m) m.classList.remove("open"); if(!$$(".lv-drawer.open,.lv-modal.open").length) document.body.style.overflow=""; return; }
                    if(!e.target.closest("#lv-menu")) closeMenu();
                });
                document.addEventListener("keydown", function(e){ if(e.key==="Escape"){ closeMenu(); $$(".lv-drawer.open,.lv-modal.open").forEach(function(m){ m.classList.remove("open"); }); document.body.style.overflow=""; } });
                window.addEventListener("scroll", closeMenu, true);
                document.addEventListener("change", function(e){ if(e.target.id==="lv-selall"){ var vis=filtered(); vis.forEach(function(r){ state.sel[r.id]=e.target.checked; }); render(); syncBulk(); } });

                $("#lv-bulk-x").addEventListener("click", function(){ state.sel={}; render(); syncBulk(); });
                $$('[data-bulk]').forEach(function(b){ b.addEventListener("click", function(){
                    var act=this.getAttribute("data-bulk"), n=selCount();
                    var ids=Object.keys(state.sel).filter(function(k){return state.sel[k];});
                    if(act==="approve"||act==="reject"){ ids.forEach(function(id){ var r=REQ.filter(function(x){return x.id===id;})[0]; if(r) r.status=act==="approve"?"Approved":"Rejected"; }); render(); renderKPIs(); renderWidgets(); animateRings(); toast(n+" request"+(n>1?"s":"")+" "+(act==="approve"?"approved":"rejected"), act==="approve"?"ti-circle-check":"ti-circle-x"); return; }
                    if(act==="delete"){ ids.forEach(function(id){ var i=REQ.map(function(r){return r.id;}).indexOf(id); if(i>=0) REQ.splice(i,1); }); state.sel={}; render(); renderKPIs(); renderWidgets(); animateRings(); syncBulk(); toast(n+" request"+(n>1?"s":"")+" deleted","ti-trash"); return; }
                    var names={coverage:"Coverage assigned for",notify:"Notifications sent to",export:"Exported"};
                    toast((names[act]||"Updated")+" "+n+" request"+(n>1?"s":""),"ti-check");
                }); });

                /* ================= RINGS ================= */
                function animateRings(){ $$(".lv-ring .bar").forEach(function(b){ var p=b.style.getPropertyValue("--p"); b.style.setProperty("--p","0"); requestAnimationFrame(function(){ b.style.setProperty("--p",p); }); }); }

                /* ================= REVEAL =================
                   KPIs, widgets, the approval workflow strip, coverage tools,
                   replacement-doctor pool and the default (unfiltered, List
                   view) request table are already static markup in the HTML.
                   renderKPIs(), renderWidgets(), renderWorkflow(), renderSide()
                   and render() stay available below for search/filter/sort/view
                   changes and for the mutation handlers (approve, reject,
                   delete, bulk actions). */
                setTimeout(function(){
                    $("#lv-skeleton").classList.add("hidden");
                    $("#lv-content").classList.remove("hidden");
                    requestAnimationFrame(animateRings);
                }, 1500);
            })();

// ==========================================================================
// doctor-profile.js
// ==========================================================================
(function () {
    "use strict";
    var page = document.getElementById("dp-page"); if (!page) return;
    function $(s, r) { return (r || document).querySelector(s); }
    function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }
    function toast(msg, ic){ var w=$("#dp-toast"); var t=document.createElement("div"); t.className="dp-toast"; t.innerHTML='<i class="ti '+(ic||"ti-check")+' text-emerald-400"></i>'+esc(msg); w.appendChild(t); setTimeout(function(){ t.style.opacity="0"; t.style.transform="translateY(12px)"; t.style.transition="all .3s ease"; setTimeout(function(){ t.remove(); },300); },2600); }

    /* ---------- DATA ---------- */
    var KPIS=[
        {l:"Total Patients",v:"3,240",ic:"ti-users",c:"#0ea5e9",ch:"+12%",up:1},
        {l:"Appointments",v:"18",s:"today",ic:"ti-calendar",c:"#6366f1",ch:"4 pending",up:1},
        {l:"Avg Rating",v:"4.9",ic:"ti-star",c:"#f59e0b",ch:"482 reviews",up:1},
        {l:"Consult Fee",v:"₹800",ic:"ti-currency-rupee",c:"#10b981",ch:"per visit",up:1},
        {l:"Success Rate",v:"98%",ic:"ti-heart-rate-monitor",c:"#ec4899",ch:"+2%",up:1},
        {l:"Experience",v:"14y",ic:"ti-briefcase",c:"#8b5cf6",ch:"since 2011",up:1}
    ];
    var SPECS=[
        {n:"Interventional Cardiology",p:95},
        {n:"Heart Failure Management",p:88},
        {n:"Preventive Cardiac Care",p:92},
        {n:"Echocardiography",p:85},
        {n:"Cardiac Catheterization",p:90},
        {n:"Arrhythmia Management",p:82},
        {n:"Hypertension Management",p:94}
    ];
    var EDU=[
        {t:"MD, Cardiology",s:"AIIMS, New Delhi",y:"2011"},
        {t:"MBBS",s:"King George Medical College",y:"2006"},
        {t:"Fellowship — Interventional Cardiology",s:"Cleveland Clinic, USA",y:"2013"},
        {t:"Senior Consultant",s:"Dreams Multi-Specialty Hospital",y:"2016 – Present"}
    ];
    var AWARDS=[
        {t:"Best Cardiologist 2023",s:"State Medical Council",ic:"ti-trophy",c:"#f59e0b"},
        {t:"Excellence in Patient Care",s:"Dreams HMS",ic:"ti-heart",c:"#ec4899"},
        {t:"Research Publication Award",s:"Intl. Cardiology Journal",ic:"ti-notebook",c:"#6366f1"}
    ];
    var DAYS=[{d:"Mon",h:"09:00–17:00",on:1},{d:"Tue",h:"09:00–17:00",on:1},{d:"Wed",h:"10:00–15:00",on:1},{d:"Thu",h:"09:00–17:00",on:1},{d:"Fri",h:"09:00–14:00",on:1},{d:"Sat",h:"10:00–13:00",on:1},{d:"Sun",h:"Off",on:0}];
    var SLOTS=[{t:"09:00",taken:1},{t:"09:30",taken:1},{t:"10:00",taken:0},{t:"10:30",taken:0},{t:"11:00",taken:1},{t:"11:30",taken:0},{t:"14:00",taken:0},{t:"14:30",taken:1},{t:"15:00",taken:0},{t:"15:30",taken:0},{t:"16:00",taken:0},{t:"16:30",taken:1}];
    var PAL=["#0ea5e9","#6366f1","#10b981","#f59e0b","#ec4899","#8b5cf6"];
    var PATIENTS=[
        {n:"Ravi Kumar",c:"Follow-up · Hypertension",t:"2h ago",st:"Stable",sc:"#10b981"},
        {n:"Anita Desai",c:"Angioplasty review",t:"5h ago",st:"Critical",sc:"#ef4444"},
        {n:"Mohammed Ali",c:"ECG consultation",t:"Yesterday",st:"Stable",sc:"#10b981"},
        {n:"Priya Sharma",c:"New patient · Chest pain",t:"Yesterday",st:"Monitoring",sc:"#f59e0b"},
        {n:"John Mathew",c:"Post-op checkup",t:"2 days ago",st:"Recovering",sc:"#0ea5e9"}
    ];
    var APPTS=[
        {n:"Deepak Nair",tm:"Today · 3:30 PM",ty:"In-person",r:"Consultation",st:"Confirmed",sc:"#10b981"},
        {n:"Sunita Rao",tm:"Today · 4:00 PM",ty:"Video",r:"Follow-up",st:"Confirmed",sc:"#10b981"},
        {n:"Arjun Menon",tm:"Tomorrow · 10:00 AM",ty:"In-person",r:"New patient",st:"Pending",sc:"#f59e0b"},
        {n:"Meera Iyer",tm:"Tomorrow · 11:30 AM",ty:"In-person",r:"Echo review",st:"Confirmed",sc:"#10b981"},
        {n:"Karan Malhotra",tm:"Jul 21 · 2:00 PM",ty:"Video",r:"Report discussion",st:"Pending",sc:"#f59e0b"}
    ];
    var RBARS=[{s:5,p:86},{s:4,p:10},{s:3,p:3},{s:2,p:1},{s:1,p:0}];
    var REVIEWS=[
        {n:"Ramesh G.",r:5,t:"2 days ago",x:"Excellent doctor! Dr. Roberts explained my condition clearly and the treatment worked wonders. Highly recommend."},
        {n:"Fatima S.",r:5,t:"1 week ago",x:"Very patient and thorough. She took time to answer all my questions. The best cardiologist I've consulted."},
        {n:"David L.",r:4,t:"2 weeks ago",x:"Great expertise and professionalism. Wait time was a bit long but the consultation was worth it."},
        {n:"Neha K.",r:5,t:"3 weeks ago",x:"Saved my father's life with a timely diagnosis. Forever grateful for her dedication and skill."}
    ];
    var DOCS=[
        {n:"Medical License",e:"PDF",s:"2.1 MB",ic:"ti-certificate",c:"#ef4444"},
        {n:"MD Degree Certificate",e:"PDF",s:"1.4 MB",ic:"ti-school",c:"#6366f1"},
        {n:"Board Certification",e:"PDF",s:"890 KB",ic:"ti-rosette-discount-check",c:"#10b981"},
        {n:"Fellowship Certificate",e:"PDF",s:"1.1 MB",ic:"ti-award",c:"#f59e0b"}
    ];
    var RINGS=[{l:"Success",p:98,c:"#10b981"},{l:"Punctual",p:94,c:"#0ea5e9"},{l:"Follow-up",p:89,c:"#6366f1"}];
    var TODAY=[
        {l:"Appointments",v:"18",ic:"ti-calendar",c:"#0ea5e9"},
        {l:"Completed",v:"11",ic:"ti-circle-check",c:"#10b981"},
        {l:"Waiting",v:"3",ic:"ti-clock",c:"#f59e0b"},
        {l:"Avg. wait",v:"12 min",ic:"ti-hourglass",c:"#6366f1"}
    ];

    /* ---------- RENDER ---------- */
    // NOTE: KPIs/specs/education/awards/weekly-hours are shown as static markup
    // in the HTML (matching what these builders would have produced on load).
    // The builder functions/data arrays are kept below only where a later
    // interaction still needs them (slot booking); the rest are intentionally
    // not re-invoked at load time any more.
    function mix(c){ return "color-mix(in srgb,"+c+" 15%,transparent)"; }

    var selSlot=null;
    function renderSlots(){
        $("#dp-slots").innerHTML = SLOTS.map(function(s,i){
            return '<div class="dp-slot'+(s.taken?' taken':'')+(selSlot===i?' sel':'')+'" data-slot="'+i+'">'+esc(s.t)+'</div>';
        }).join("");
    }
    $("#dp-slots").addEventListener("click", function(e){
        var el=e.target.closest("[data-slot]"); if(!el) return; var i=+el.getAttribute("data-slot"); if(SLOTS[i].taken) return;
        selSlot=(selSlot===i?null:i); renderSlots();
        var b=$("#dp-slotbook"); b.disabled=selSlot===null; b.style.opacity=selSlot===null?".5":"1";
    });
    $("#dp-slotbook").addEventListener("click", function(){ if(selSlot===null) return; toast("Slot "+SLOTS[selSlot].t+" booked for today","ti-calendar-check"); SLOTS[selSlot].taken=1; selSlot=null; renderSlots(); this.disabled=true; this.style.opacity=".5"; });

    /* ---------- TABS ---------- */
    $("#dp-tabs").addEventListener("click", function(e){
        var b=e.target.closest("[data-tab]"); if(!b) return;
        var t=b.getAttribute("data-tab");
        Array.prototype.forEach.call(document.querySelectorAll("#dp-tabs .dp-tab"),function(x){ x.classList.toggle("active",x===b); });
        Array.prototype.forEach.call(document.querySelectorAll("[data-panel]"),function(p){ p.classList.toggle("active",p.getAttribute("data-panel")===t); });
    });

    /* ---------- MODALS ---------- */
    function openM(id){ $("#"+id).classList.add("open"); document.body.style.overflow = "hidden"; }
    function closeM(el){ el.classList.remove("open"); if(!document.querySelectorAll(".dp-modal.open").length) document.body.style.overflow=""; }
    document.addEventListener("click", function(e){
        if(e.target.closest("[data-book]")){ openM("dp-bookmodal"); }
        if(e.target.closest("[data-msg]")){ openM("dp-msgmodal"); }
        if(e.target.closest("[data-menu]")){ toast("More actions menu","ti-dots"); }
        var c=e.target.closest("[data-close]"); if(c){ closeM(c.closest(".dp-modal")); }
    });
    document.addEventListener("keydown", function(e){ if(e.key==="Escape"){ Array.prototype.forEach.call(document.querySelectorAll(".dp-modal.open"),closeM); } });
    $("#dp-bk-submit").addEventListener("click", function(){ var n=$("#dp-bk-name").value.trim(); if(!n){ toast("Enter patient name","ti-alert-triangle"); return; } closeM($("#dp-bookmodal")); toast("Appointment booked for "+n,"ti-calendar-check"); $("#dp-bk-name").value=""; $("#dp-bk-reason").value=""; });
    $("#dp-mg-submit").addEventListener("click", function(){ var s=$("#dp-mg-sub").value.trim(); if(!s){ toast("Enter a subject","ti-alert-triangle"); return; } closeM($("#dp-msgmodal")); toast("Message sent to Dr. Roberts","ti-send"); $("#dp-mg-sub").value=""; $("#dp-mg-body").value=""; });

    /* ---------- REVEAL ---------- */
    setTimeout(function(){
        $("#dp-skeleton").classList.add("hidden");
        $("#dp-content").classList.remove("hidden");
        requestAnimationFrame(function(){
            document.querySelectorAll(".dp-ring .bar").forEach(function(b){ var p=b.style.getPropertyValue("--p"); b.style.setProperty("--p","0"); requestAnimationFrame(function(){ b.style.setProperty("--p",p); }); });
        });
    }, 1400);
})();

// ==========================================================================
// doctor-schedule.js
// ==========================================================================
(function () {
    "use strict";
    var page = document.getElementById("ds-page"); if (!page) return;
    function $(s, r) { return (r || document).querySelector(s); }
    function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }
    function toast(msg, ic){ var w=$("#ds-toast"); var t=document.createElement("div"); t.className="ds-toast"; t.innerHTML='<i class="ti '+(ic||"ti-check")+' text-emerald-400"></i>'+esc(msg); w.appendChild(t); setTimeout(function(){ t.style.opacity="0"; t.style.transform="translateY(12px)"; t.style.transition="all .3s ease"; setTimeout(function(){ t.remove(); },300); },2600); }
    function mix(c,p){ return "color-mix(in srgb,"+c+" "+(p||15)+"%,transparent)"; }
    function ini(n){ return n.replace(/^Dr\.?\s*/i,"").split(" ").map(function(w){return w[0];}).join("").slice(0,2).toUpperCase(); }

    /* ---------- SHIFT TYPES ---------- */
    var SHIFTS={
        M:{k:"M",n:"Morning",t:"09:00–17:00",c:"#0ea5e9",s:9,e:17},
        E:{k:"E",n:"Evening",t:"14:00–22:00",c:"#8b5cf6",s:14,e:22},
        N:{k:"N",n:"Night",t:"22:00–06:00",c:"#1e293b",s:22,e:30},
        C:{k:"C",n:"On-Call",t:"24h standby",c:"#f59e0b",s:8,e:20},
        O:{k:"O",n:"Off",t:"Day off",c:"#94a3b8",s:0,e:0}
    };
    var DAYNAMES=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
    var TODAY_IDX=3; // Thursday highlighted

    /* ---------- DOCTORS + WEEK PATTERN ---------- */
    // pattern: 7 shift keys Mon..Sun
    var DOCS=[
        {id:1,name:"Dr. Sarah Roberts",dept:"Cardiology",c:"#ef4444",pat:["M","M","E","M","M","O","O"],oncall:0,load:88},
        {id:2,name:"Dr. Vikram Nair",dept:"Neurology",c:"#8b5cf6",pat:["E","E","M","E","E","C","O"],oncall:1,load:82},
        {id:3,name:"Dr. Anita Desai",dept:"Orthopedics",c:"#0ea5e9",pat:["M","M","M","O","M","M","O"],oncall:0,load:76},
        {id:4,name:"Dr. Meera Iyer",dept:"Pediatrics",c:"#f59e0b",pat:["M","E","M","M","O","O","C"],oncall:1,load:70},
        {id:5,name:"Dr. Rajesh Menon",dept:"Oncology",c:"#ec4899",pat:["M","M","M","M","M","O","O"],oncall:0,load:91},
        {id:6,name:"Dr. John Mathew",dept:"Emergency",c:"#f43f5e",pat:["N","N","O","N","N","N","O"],oncall:1,load:94},
        {id:7,name:"Dr. Priya Sharma",dept:"Gynecology",c:"#d946ef",pat:["M","M","E","M","M","O","O"],oncall:0,load:79},
        {id:8,name:"Dr. Deepak Nair",dept:"Radiology",c:"#6366f1",pat:["M","M","M","M","O","M","O"],oncall:0,load:64},
        {id:9,name:"Dr. Sunita Rao",dept:"ENT",c:"#14b8a6",pat:["E","O","M","E","M","O","C"],oncall:1,load:58},
        {id:10,name:"Dr. Karan Malhotra",dept:"Dermatology",c:"#10b981",pat:["M","M","O","M","M","M","O"],oncall:0,load:52},
        {id:11,name:"Dr. Arjun Menon",dept:"Nephrology",c:"#0891b2",pat:["M","E","M","M","O","C","O"],oncall:1,load:85},
        {id:12,name:"Dr. Fatima Sheikh",dept:"Psychiatry",c:"#a855f7",pat:["M","M","M","O","E","O","O"],oncall:0,load:48}
    ];

    var LEAVES=[
        {name:"Dr. Robert Chen",dept:"Surgery",c:"#f43f5e",type:"Annual Leave",range:"Jul 18 – Jul 25",status:"Pending"},
        {name:"Dr. Laila Ahmed",dept:"Pediatrics",c:"#f59e0b",type:"Conference",range:"Jul 20 – Jul 22",status:"Approved"},
        {name:"Dr. Sam Wesley",dept:"Radiology",c:"#6366f1",type:"Sick Leave",range:"Jul 19",status:"Approved"},
        {name:"Dr. Nina Roy",dept:"ENT",c:"#14b8a6",type:"Emergency",range:"Jul 21 – Jul 23",status:"Pending"}
    ];

    var KPIS=[
        {l:"Active Doctors",v:"148",ic:"ti-stethoscope",c:"#0ea5e9",ch:"12 depts"},
        {l:"Shifts This Week",v:"642",ic:"ti-calendar-week",c:"#6366f1",ch:"+18"},
        {l:"On Duty Now",v:"32",ic:"ti-user-check",c:"#10b981",ch:"Live"},
        {l:"On-Call",v:"8",ic:"ti-phone-call",c:"#f59e0b",ch:"3 depts"},
        {l:"On Leave",v:"5",ic:"ti-plane",c:"#ec4899",ch:"2 pending"},
        {l:"Coverage",v:"96%",ic:"ti-shield-check",c:"#8b5cf6",ch:"+2%"}
    ];

    var state={ q:"", dept:"", view:"week", week:0 };

    /* ---------- KPIs / legend / selects ----------
       KPI tiles, the shift legend, department filter options and the
       doctor/day/shift-type <select> option lists are all static markup in
       the HTML now (matching what this data would have produced on load). */
    var DEPTS=DOCS.map(function(d){return d.dept;}).filter(function(v,i,a){return a.indexOf(v)===i;});
    function docOpts(){ return DOCS.map(function(d){return '<option value="'+d.id+'">'+esc(d.name)+' — '+esc(d.dept)+'</option>';}).join(""); }

    /* ---------- WEEK RANGE LABEL ---------- */
    function weekRange(){
        var base=13+state.week*7; // pretend Jul 13 = Monday of current week
        return "Jul "+base+" – "+(base+6)+", 2026";
    }
    function updateRange(){ $("#ds-range").textContent=weekRange(); $("#ds-weeklabel").innerHTML='<i class="ti ti-calendar"></i> '+(state.week===0?"This Week":state.week<0?Math.abs(state.week)+"w ago":state.week+"w ahead"); }

    /* ---------- FILTER ---------- */
    function docs(){
        var q=state.q.toLowerCase();
        return DOCS.filter(function(d){
            if(state.dept && d.dept!==state.dept) return false;
            if(q && (d.name+" "+d.dept).toLowerCase().indexOf(q)<0) return false;
            return true;
        });
    }

    /* ---------- WEEK GRID ---------- */
    function renderWeek(){
        var arr=docs();
        var h='<div class="ds-wc ds-whd" style="text-align:left">Doctor</div>';
        DAYNAMES.forEach(function(d,i){ h+='<div class="ds-wc ds-whd'+(i===TODAY_IDX&&state.week===0?" today":"")+'">'+d+'</div>'; });
        arr.forEach(function(doc){
            h+='<div class="ds-wc ds-doccell"><div class="ds-av" style="background:linear-gradient(135deg,'+doc.c+','+mix(doc.c,60)+')">'+esc(ini(doc.name))+'</div><div class="min-w-0"><div class="text-xs font-bold text-[var(--color-gray-900)] truncate">'+esc(doc.name.replace("Dr. ","Dr "))+'</div><div class="text-[10px] ds-muted truncate">'+esc(doc.dept)+'</div></div></div>';
            doc.pat.forEach(function(k,di){
                var s=SHIFTS[k];
                if(k==="O"){ h+='<div class="ds-wc"><div class="ds-off">— off —</div></div>'; }
                else { h+='<div class="ds-wc"><span class="ds-shift" style="background:'+s.c+';color:#fff" data-shift="'+doc.id+'-'+di+'" title="'+esc(doc.name)+' · '+esc(s.n)+' '+esc(s.t)+'">'+s.k+'<div style="font-size:.54rem;opacity:.85;font-weight:600">'+s.t.split("–")[0]+'</div></span></div>'; }
            });
        });
        if(!arr.length) h+='<div class="ds-wc" style="grid-column:1/-1;text-align:center;padding:2rem;color:var(--color-gray-400)">No doctors match your filters.</div>';
        $("#ds-weekgrid").innerHTML=h;
    }

    /* ---------- DAY TIMELINE ---------- */
    function renderDay(){
        var arr=docs();
        var START=6, END=24, span=END-START; // 6am..midnight
        var ticks=""; for(var t=START;t<=END;t+=3){ ticks+='<span>'+(t%24===0?"12a":t>12?(t-12)+"p":t+"a")+'</span>'; }
        $("#ds-ticks").innerHTML=ticks;
        var h="";
        arr.forEach(function(doc){
            var k=doc.pat[TODAY_IDX];
            var track="";
            if(k!=="O"){
                var s=SHIFTS[k];
                var st=Math.max(s.s,START), en=Math.min(s.e>24?24:s.e,END);
                if(k==="N"){ st=22; en=24; }
                var left=(st-START)/span*100, width=(en-st)/span*100;
                track='<div class="ds-tl-block" style="left:'+left+'%;width:'+width+'%;background:linear-gradient(135deg,'+s.c+','+mix(s.c,55)+')" data-shift="'+doc.id+'" title="'+esc(s.n)+' '+esc(s.t)+'">'+esc(s.n)+' · '+esc(s.t)+'</div>';
            } else {
                track='<div class="absolute inset-0 flex items-center justify-center text-[10px] font-bold" style="color:var(--color-gray-400)">Day Off</div>';
            }
            h+='<div class="ds-tl-row"><div class="flex items-center gap-2 min-w-0"><div class="ds-av" style="background:linear-gradient(135deg,'+doc.c+','+mix(doc.c,60)+')">'+esc(ini(doc.name))+'</div><div class="min-w-0"><div class="text-xs font-bold text-[var(--color-gray-900)] truncate">'+esc(doc.name.replace("Dr. ","Dr "))+'</div><div class="text-[10px] ds-muted truncate">'+esc(doc.dept)+'</div></div></div><div class="ds-tl-track">'+track+'</div></div>';
        });
        if(!arr.length) h='<div style="text-align:center;padding:2rem;color:var(--color-gray-400)">No doctors match your filters.</div>';
        $("#ds-daylist").innerHTML=h;
    }

    function render(){
        $("#ds-weekwrap").classList.toggle("hidden", state.view!=="week");
        $("#ds-daywrap").classList.toggle("hidden", state.view!=="day");
        if(state.view==="week") renderWeek(); else renderDay();
    }

    /* ---------- SIDEBAR ---------- */
    function renderSide(){
        var oncall=DOCS.filter(function(d){return d.oncall;});
        $("#ds-oncall").innerHTML=oncall.map(function(d){
            return '<div class="ds-row"><div class="ds-av" style="width:2.4rem;height:2.4rem;background:linear-gradient(135deg,'+d.c+','+mix(d.c,60)+')">'+esc(ini(d.name))+'</div><div class="flex-1 min-w-0"><div class="text-sm font-bold text-[var(--color-gray-900)] truncate">'+esc(d.name)+'</div><div class="text-xs ds-muted truncate">'+esc(d.dept)+'</div></div><a href="#" class="ds-btn ds-btn-soft !p-2" title="Call" onclick="return false"><i class="ti ti-phone"></i></a></div>';
        }).join("");

        $("#ds-leaves").innerHTML=LEAVES.map(function(l){
            var sc=l.status==="Approved"?"#10b981":"#f59e0b";
            return '<div class="ds-row !gap-2.5"><div class="ds-av" style="width:2.2rem;height:2.2rem;background:linear-gradient(135deg,'+l.c+','+mix(l.c,60)+')">'+esc(ini(l.name))+'</div><div class="flex-1 min-w-0"><div class="text-xs font-bold text-[var(--color-gray-900)] truncate">'+esc(l.name)+'</div><div class="text-[11px] ds-muted truncate">'+esc(l.type)+' · '+esc(l.range)+'</div></div><span class="ds-tag" style="background:'+mix(sc)+';color:'+sc+'">'+esc(l.status)+'</span></div>';
        }).join("");
    }

    /* ---------- EVENTS ---------- */
    $("#ds-search").addEventListener("input", function(){ state.q=this.value; render(); });
    $("#ds-dept").addEventListener("change", function(){ state.dept=this.value; render(); });
    $("#ds-view").addEventListener("click", function(e){ var b=e.target.closest("[data-v]"); if(!b) return; state.view=b.getAttribute("data-v"); Array.prototype.forEach.call(this.querySelectorAll(".ds-segb"),function(x){ x.classList.toggle("active",x===b); }); render(); });
    $("#ds-prev").addEventListener("click", function(){ state.week--; updateRange(); render(); });
    $("#ds-next").addEventListener("click", function(){ state.week++; updateRange(); render(); });
    $("#ds-today-btn").addEventListener("click", function(){ state.week=0; updateRange(); render(); });

    document.addEventListener("click", function(e){
        var sh=e.target.closest("[data-shift]"); if(sh){ var t=sh.getAttribute("title"); if(t) toast(t,"ti-clock"); return; }
        if(e.target.closest("[data-assign]")){ $("#ds-assignmodal").classList.add("open"); document.body.style.overflow = "hidden"; return; }
        if(e.target.closest("[data-leave]")){ $("#ds-leavemodal").classList.add("open"); document.body.style.overflow = "hidden"; return; }
        if(e.target.closest("[data-export]")){ toast("Exporting weekly roster...","ti-download"); return; }
        var c=e.target.closest("[data-close]"); if(c){ var m=c.closest(".ds-modal"); if(m) m.classList.remove("open"); if(!document.querySelectorAll(".ds-modal.open").length) document.body.style.overflow=""; return; }
    });
    document.addEventListener("keydown", function(e){ if(e.key==="Escape"){ Array.prototype.forEach.call(document.querySelectorAll(".ds-modal.open"),function(m){ m.classList.remove("open"); }); document.body.style.overflow=""; } });

    $("#ds-a-submit").addEventListener("click", function(){
        var id=+$("#ds-a-doc").value, day=+$("#ds-a-day").value, type=$("#ds-a-type").value;
        var doc=DOCS.filter(function(d){return d.id===id;})[0]; if(!doc) return;
        doc.pat[day]=type;
        $("#ds-assignmodal").classList.remove("open");
        if(!document.querySelectorAll(".ds-modal.open").length) document.body.style.overflow="";
        if(state.view!=="week"){ state.view="week"; Array.prototype.forEach.call($("#ds-view").querySelectorAll(".ds-segb"),function(x){ x.classList.toggle("active",x.getAttribute("data-v")==="week"); }); }
        render(); toast(SHIFTS[type].n+" shift assigned to "+doc.name.replace("Dr. ","Dr ")+" on "+DAYNAMES[day],"ti-calendar-check");
    });
    $("#ds-l-submit").addEventListener("click", function(){
        var id=+$("#ds-l-doc").value; var doc=DOCS.filter(function(d){return d.id===id;})[0];
        var from=$("#ds-l-from").value, to=$("#ds-l-to").value;
        if(!from){ toast("Select a start date","ti-alert-triangle"); return; }
        LEAVES.unshift({name:doc.name,dept:doc.dept,c:doc.c,type:$("#ds-l-type").value,range:from+(to?" – "+to:""),status:"Pending"});
        $("#ds-leavemodal").classList.remove("open");
        if(!document.querySelectorAll(".ds-modal.open").length) document.body.style.overflow="";
        $("#ds-l-reason").value="";
        renderSide(); toast("Leave request submitted for "+doc.name.replace("Dr. ","Dr "),"ti-send");
    });

    /* ---------- REVEAL ---------- */
    // Week grid, day timeline axis, on-call list and leave list are already
    // static markup for the default (This Week / week view) state, so the
    // reveal only needs to unveil the page — updateRange()/render()/renderSide()
    // stay available for search, filters, view/week navigation and the
    // assign-shift/schedule-leave modals.
    setTimeout(function(){
        $("#ds-skeleton").classList.add("hidden");
        $("#ds-content").classList.remove("hidden");
    }, 1400);
})();

// ==========================================================================
// doctors.js
// ==========================================================================
            (function () {
                "use strict";
                var page = document.getElementById("dr-page"); if (!page) return;
                var $ = function (s, r) { return (r || document).querySelector(s); };
                var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
                var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };

                function toast(msg, type) {
                    var t = document.createElement("div"); t.className = "dr-toast " + (type || "success");
                    t.innerHTML = '<i class="icon-' + (type === "error" ? "circle-alert" : type === "info" ? "info" : "circle-check") + '"></i>' + msg;
                    document.body.appendChild(t);
                    setTimeout(function () { t.style.transition = "opacity .3s,transform .3s"; t.style.opacity = "0"; t.style.transform = "translateY(10px)"; }, 2400);
                    setTimeout(function () { t.remove(); }, 2750);
                }

                var DEPT_ACC = { Cardiology: "rose", Neurology: "violet", Orthopedics: "amber", Pediatrics: "sky", "General Medicine": "teal", Dermatology: "emerald", ENT: "indigo", Oncology: "blue" };
                var acc = function (d) { return "dr-c-" + (DEPT_ACC[d] || "primary"); };
                var did = function (n) { return "DR-" + String(n).padStart(4, "0"); };
                var detailUrl = function (r) {
                    return "doctor-profile.html?" + new URLSearchParams({ id: r.id, name: r.name, spec: r.spec, dept: r.dept, status: r.status }).toString();
                };
                var inits = function (n) { return n.replace("Dr. ", "").split(" ").map(function (w) { return w[0]; }).join("").slice(0, 2).toUpperCase(); };
                var DOC_PHOTOS = ["avatar-01.jpg", "avatar-02.jpg", "avatar-03.jpg", "avatar-04.jpg", "avatar-05.jpg", "avatar-06.jpg", "avatar-07.jpg", "avatar-08.jpg", "avatar-09.jpg", "avatar-10.jpg", "avatar-11.jpg", "avatar-12.jpg", "avatar-13.jpg", "avatar-14.jpg", "avatar-15.jpg", "avatar-16.jpg", "avatar-17.jpg", "avatar-18.jpg", "avatar-19.jpg", "avatar-20.jpg", "avatar-21.jpg", "avatar-22.jpg", "avatar-23.jpg", "avatar-24.jpg", "avatar-25.jpg", "avatar-26.jpg", "avatar-27.jpg", "avatar-28.jpg", "avatar-29.jpg", "avatar-30.jpg"];
                var photoUrl = function (id) { return "assets/img/avatar/" + DOC_PHOTOS[(id - 1) % DOC_PHOTOS.length]; };
                // The avatar set is already square, face-centered headshots, so a
                // plain center object-fit:cover crop works for all of them — no
                // per-photo position bias needed (unlike the old wide "office
                // scene" doctor photos this used to point at).
                var photoPos = function () { return "50%"; };
                var STATUS_RING = { Available: "#10b981", Busy: "#d97706", "On Leave": "#8b5cf6", "Off Duty": "#64748b" };
                var money = function (n) { return "₹" + Number(n).toLocaleString("en-IN"); };
                function stars(n) { var f = Math.round(n), h = ""; for (var i = 1; i <= 5; i++) h += '<i class="icon-star' + (i <= f ? "" : " off") + '"></i>'; return '<span class="dr-stars">' + h + "</span>"; }

                var DEPTS = ["Cardiology", "Neurology", "Orthopedics", "Pediatrics", "General Medicine", "Dermatology", "ENT", "Oncology"];
                var STATUSES = ["Available", "Busy", "On Leave", "Off Duty"];
                var DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

                var seed = [
                    ["Dr. Ethan Chen", "Cardiologist", "Cardiology", "M", 18, "Available", 4.9, 32, 800, "In-person", "MD, DM Cardiology", [1, 1, 1, 1, 1, 0, 0]],
                    ["Dr. Priya Kumar", "Neurologist", "Neurology", "F", 12, "Busy", 4.7, 24, 900, "Both", "MD, DM Neurology", [1, 1, 1, 1, 1, 1, 0]],
                    ["Dr. Marcus Mills", "General Physician", "General Medicine", "M", 9, "Available", 4.5, 40, 500, "Both", "MBBS, MD", [1, 1, 1, 1, 1, 1, 0]],
                    ["Dr. Sofia Park", "Pediatrician", "Pediatrics", "F", 14, "Available", 4.8, 36, 600, "In-person", "MD Pediatrics", [1, 1, 1, 1, 1, 0, 0]],
                    ["Dr. David Wang", "Orthopedic Surgeon", "Orthopedics", "M", 20, "On Leave", 4.6, 18, 1000, "In-person", "MS Orthopedics", [1, 1, 0, 1, 1, 0, 0]],
                    ["Dr. Elena Rivas", "Dermatologist", "Dermatology", "F", 7, "Available", 4.4, 28, 700, "Telemedicine", "MD Dermatology", [1, 1, 1, 1, 1, 0, 0]],
                    ["Dr. James Okoro", "ENT Specialist", "ENT", "M", 11, "Busy", 4.3, 22, 650, "Both", "MS ENT", [1, 0, 1, 1, 1, 1, 0]],
                    ["Dr. Hannah Lee", "Oncologist", "Oncology", "F", 16, "Available", 4.9, 15, 1200, "In-person", "MD, DM Oncology", [1, 1, 1, 1, 1, 0, 0]],
                    ["Dr. Robert Frost", "Cardiologist", "Cardiology", "M", 22, "Off Duty", 4.5, 0, 850, "In-person", "MD, DM Cardiology", [0, 0, 1, 1, 1, 0, 0]],
                    ["Dr. Aisha Khan", "Neurologist", "Neurology", "F", 8, "Available", 4.6, 26, 800, "Both", "MD Neurology", [1, 1, 1, 1, 1, 1, 0]],
                    ["Dr. Thomas Reed", "Pediatrician", "Pediatrics", "M", 6, "Busy", 4.2, 34, 550, "In-person", "MD Pediatrics", [1, 1, 1, 1, 1, 0, 0]],
                    ["Dr. Grace Kim", "Dermatologist", "Dermatology", "F", 10, "Available", 4.7, 30, 750, "Telemedicine", "MD Dermatology", [1, 1, 1, 1, 1, 0, 0]],
                    ["Dr. Samuel Ali", "Orthopedic Surgeon", "Orthopedics", "M", 15, "Available", 4.5, 20, 950, "Both", "MS Orthopedics", [1, 1, 1, 0, 1, 1, 0]],
                    ["Dr. Nina Patel", "General Physician", "General Medicine", "F", 5, "On Leave", 4.3, 0, 450, "Both", "MBBS", [1, 1, 1, 1, 1, 0, 0]]
                ];
                var data = seed.map(function (a, i) {
                    return { id: i + 1, name: a[0], spec: a[1], dept: a[2], gender: a[3] === "M" ? "Male" : "Female", exp: a[4], status: a[5], rating: a[6], patients: a[7], fee: a[8], ctype: a[9], qual: a[10], days: a[11], phone: "+91 98" + (100000 + i * 137), email: a[0].toLowerCase().replace("dr. ", "").replace(" ", ".") + "@dreamshms.com", reviews: 40 + i * 13 };
                });
                var nextId = data.length + 1;

                var state = { view: "grid", q: "", dept: "", status: "", sort: "name", page: 1, size: 6, adv: {}, sel: {} };
                var selN = function () { return Object.keys(state.sel).length; };

                var grid = $("#dr-gridview"), tbody = $("#dr-tbody"), listView = $("#dr-listview"), empty = $("#dr-empty"), pager = $("#dr-pager");

                function statusBadge(s) { var c = { Available: "available", Busy: "busy", "On Leave": "leave", "Off Duty": "offduty" }[s] || "available"; return '<span class="dr-badge ' + c + '">' + esc(s) + "</span>"; }

                function filtered() {
                    var q = state.q.toLowerCase(), a = state.adv;
                    var rows = data.filter(function (r) {
                        if (q && !((r.name + " " + r.spec + " " + r.dept + " " + did(r.id)).toLowerCase().indexOf(q) > -1)) return false;
                        if (state.dept && r.dept !== state.dept) return false;
                        if (state.status && r.status !== state.status) return false;
                        if (a.spec && r.spec.toLowerCase().indexOf(a.spec.toLowerCase()) === -1) return false;
                        if (a.exp) { var lo = { "0-5 yrs": [0, 5], "5-10 yrs": [5, 10], "10-20 yrs": [10, 20], "20+ yrs": [20, 99] }[a.exp]; if (lo && (r.exp < lo[0] || r.exp > lo[1])) return false; }
                        if (a.rating) { var m = parseFloat(a.rating); if (r.rating < m) return false; }
                        if (a.type && a.type !== "Both" && r.ctype !== a.type && r.ctype !== "Both") return false;
                        if (a.gender && r.gender !== a.gender) return false;
                        return true;
                    });
                    rows.sort(function (x, y) {
                        switch (state.sort) {
                            case "name": return x.name.localeCompare(y.name);
                            case "rating": return y.rating - x.rating;
                            case "exp": return y.exp - x.exp;
                            case "patients": return y.patients - x.patients;
                            case "dept": return x.dept.localeCompare(y.dept);
                        }
                        return 0;
                    });
                    return rows;
                }

                function cardHTML(r) {
                    var sel = state.sel[r.id] ? " is-selected" : "";
                    return '<article class="dr-card ' + acc(r.dept) + sel + '" data-id="' + r.id + '">' +
                        '<div class="dr-cardtop"><input type="checkbox" class="dr-check dr-rowcheck" data-id="' + r.id + '"' + (state.sel[r.id] ? " checked" : "") + ' style="position:absolute;top:.6rem;left:.6rem;z-index:2"><button class="dr-mini dr-menu-btn" data-id="' + r.id + '" style="position:absolute;top:.5rem;right:.5rem;z-index:2;background:rgba(255,255,255,.2);border-color:rgba(255,255,255,.3);color:#fff"><i class="icon-ellipsis-vertical"></i></button></div>' +
                        '<div class="px-4 pb-4 -mt-7"><div class="flex items-end justify-between"><span class="dr-ava dr-ava-photo" style="--dr-ring:' + (STATUS_RING[r.status] || "#10b981") + '"><img src="' + photoUrl(r.id) + '" alt="' + esc(r.name) + '" loading="lazy" style="object-position:' + photoPos(r.id) + '"></span><span class="mb-1">' + statusBadge(r.status) + '</span></div>' +
                        '<p class="mt-2 font-bold text-gray-900 dark:text-white truncate">' + esc(r.name) + '</p><p class="text-[12px] text-primary font-semibold">' + esc(r.spec) + '</p>' +
                        '<div class="flex items-center justify-between mt-1.5"><div class="flex items-center gap-1.5">' + stars(r.rating) + '<span class="text-[11px] text-gray-400">' + r.rating.toFixed(1) + ' (' + r.reviews + ')</span></div><span class="dr-metarow"><i class="icon-building-2 text-xs"></i>' + esc(r.dept) + '</span></div>' +
                        '<div class="grid grid-cols-3 gap-1.5 mt-3"><div class="dr-statbox"><b>' + r.exp + 'y</b><span>Experience</span></div><div class="dr-statbox"><b>' + r.patients + '</b><span>Today</span></div><div class="dr-statbox"><b>' + money(r.fee) + '</b><span>Fee</span></div></div>' +
                        '<div class="flex flex-wrap gap-1.5 mt-3"><span class="dr-tag ' + acc(r.dept) + '"><i class="icon-graduation-cap text-[10px]"></i>' + esc(r.qual) + '</span><span class="dr-tag dr-c-sky"><i class="icon-' + (r.ctype === "Telemedicine" ? "video" : r.ctype === "Both" ? "monitor-smartphone" : "user") + ' text-[10px]"></i>' + esc(r.ctype) + '</span></div>' +
                        '<div class="flex items-center justify-between mt-3 pt-3 border-t border-border-color"><a href="' + detailUrl(r) + '" class="text-[11px] font-mono text-gray-400 hover:text-primary hover:underline">' + did(r.id) + '</a>' +
                        '<div class="flex gap-1.5"><button class="dr-mini dr-view" data-id="' + r.id + '" title="Profile"><i class="icon-eye text-sm"></i></button><button class="dr-mini dr-book" data-id="' + r.id + '" title="Book"><i class="icon-calendar-plus text-sm"></i></button><button class="dr-mini dr-edit" data-id="' + r.id + '" title="Edit"><i class="icon-edit text-sm"></i></button></div></div>' +
                        "</div></article>";
                }
                function rowHTML(r) {
                    var sel = state.sel[r.id] ? " is-selected" : "";
                    return '<tr class="' + sel + ' ' + acc(r.dept) + '" data-id="' + r.id + '"><td><input type="checkbox" class="dr-check dr-rowcheck" data-id="' + r.id + '"' + (state.sel[r.id] ? " checked" : "") + "></td>" +
                        '<td data-col="name"><div class="flex items-center gap-2.5"><span class="dr-ava-sm dr-ava-sm-photo"><img src="' + photoUrl(r.id) + '" alt="' + esc(r.name) + '" loading="lazy" style="object-position:' + photoPos(r.id) + '"></span><div class="min-w-0"><span class="font-bold text-gray-900 dark:text-white block leading-tight">' + esc(r.name) + '</span><a href="' + detailUrl(r) + '" class="text-[11px] font-mono text-gray-400 hover:text-primary hover:underline">' + did(r.id) + '</a></div></div></td>' +
                        '<td data-col="spec">' + esc(r.spec) + '</td><td data-col="dept">' + esc(r.dept) + '</td>' +
                        '<td data-col="exp" class="text-gray-500">' + r.exp + ' yrs</td><td data-col="patients">' + r.patients + '</td>' +
                        '<td data-col="rating"><div class="flex items-center gap-1">' + stars(r.rating) + '<span class="text-[11px] text-gray-400">' + r.rating.toFixed(1) + '</span></div></td>' +
                        '<td data-col="fee" class="font-semibold text-gray-900 dark:text-white">' + money(r.fee) + '</td>' +
                        '<td data-col="status">' + statusBadge(r.status) + '</td>' +
                        '<td class="text-right"><div class="inline-flex gap-1.5"><button class="dr-mini dr-view" data-id="' + r.id + '"><i class="icon-eye text-sm"></i></button><button class="dr-mini dr-edit" data-id="' + r.id + '"><i class="icon-edit text-sm"></i></button><button class="dr-mini dr-menu-btn" data-id="' + r.id + '"><i class="icon-ellipsis-vertical text-sm"></i></button></div></td></tr>';
                }

                function render() {
                    var rows = filtered(), total = rows.length, pages = Math.max(1, Math.ceil(total / state.size));
                    if (state.page > pages) state.page = pages;
                    var start = (state.page - 1) * state.size, pageRows = rows.slice(start, start + state.size);
                    $("#dr-count").textContent = total + " of " + data.length + " doctors";
                    empty.classList.toggle("hidden", total !== 0); pager.classList.toggle("hidden", total === 0);
                    if (state.view === "grid") { grid.classList.remove("hidden"); listView.classList.add("hidden"); grid.innerHTML = pageRows.map(cardHTML).join(""); }
                    else { grid.classList.add("hidden"); listView.classList.remove("hidden"); tbody.innerHTML = pageRows.map(rowHTML).join(""); }
                    $("#dr-page-info").textContent = total ? "Showing " + (start + 1) + "–" + (start + pageRows.length) + " of " + total : "No doctors";
                    pageNav(pages);
                    var allSel = pageRows.length && pageRows.every(function (r) { return state.sel[r.id]; });
                    $("#dr-select-all").checked = !!allSel; var s2 = $("#dr-select-all-2"); if (s2) s2.checked = !!allSel;
                    updateBulk();
                }
                function pageNav(pages) {
                    var p = state.page, h = '<button class="dr-pg" data-pg="prev"' + (p <= 1 ? " disabled" : "") + '><i class="icon-chevron-left"></i></button>';
                    var list = []; for (var i = 1; i <= pages; i++) { if (i === 1 || i === pages || Math.abs(i - p) <= 1) list.push(i); else if (list[list.length - 1] !== "…") list.push("…"); }
                    list.forEach(function (i) { h += i === "…" ? '<span class="px-1 text-gray-400">…</span>' : '<button class="dr-pg' + (i === p ? " is-active" : "") + '" data-pg="' + i + '">' + i + "</button>"; });
                    h += '<button class="dr-pg" data-pg="next"' + (p >= pages ? " disabled" : "") + '><i class="icon-chevron-right"></i></button>';
                    $("#dr-page-nav").innerHTML = h;
                }
                function initRings(scope) { requestAnimationFrame(function () { $$(".dr-ring[data-p]", scope).forEach(function (r) { r.style.setProperty("--p", Math.max(0, Math.min(100, +r.getAttribute("data-p") || 0))); }); }); }

                function buildKPIs() {
                    var by = function (f) { return data.filter(f).length; };
                    var totalPat = data.reduce(function (s, r) { return s + r.patients; }, 0);
                    var avgR = data.reduce(function (s, r) { return s + r.rating; }, 0) / data.length;
                    var availPct = Math.round(by(function (r) { return r.status === "Available"; }) / data.length * 100);
                    var k = [
                        ["Total Doctors", data.length, "primary", "icon-stethoscope", 82, "Staff"],
                        ["Available Now", by(function (r) { return r.status === "Available"; }), "emerald", "icon-circle-check", availPct, "On duty"],
                        ["Departments", DEPTS.filter(function (d) { return data.some(function (r) { return r.dept === d; }); }).length, "violet", "icon-building-2", 60, "Active"],
                        ["Patients Today", totalPat, "amber", "icon-users", 74, "Seen"],
                        ["Avg Rating", avgR.toFixed(1), "teal", "icon-star", Math.round(avgR / 5 * 100), "of 5"],
                        ["On Leave", by(function (r) { return r.status === "On Leave" || r.status === "Off Duty"; }), "rose", "icon-calendar-x", 25, "Away"]
                    ];
                    var spark = "1,14 9,11 17,13 25,7 33,9 41,4 53,2";
                    $("#dr-kpis").innerHTML = k.map(function (c) {
                        return '<div class="dr-stat dr-c-' + c[2] + '"><div class="flex items-start justify-between"><span class="dr-stat-ico"><i class="' + c[3] + '"></i></span>' +
                            '<svg class="dr-ring" viewBox="0 0 36 36" data-p="' + c[4] + '"><circle class="trk" cx="18" cy="18" r="15.915" pathLength="100"></circle><circle class="bar" cx="18" cy="18" r="15.915" pathLength="100"></circle></svg></div>' +
                            '<p class="mt-3 text-2xl font-extrabold text-gray-900 dark:text-white">' + c[1] + '</p><p class="text-[11px] font-semibold text-gray-500 dark:text-gray-400">' + c[0] + '</p>' +
                            '<div class="mt-2.5 flex items-center justify-between gap-2"><span class="dr-chip">' + c[5] + '</span><svg width="54" height="18" viewBox="0 0 54 18" fill="none" style="color:var(--dr-c)"><polyline points="' + spark + '" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div></div>';
                    }).join("");
                    initRings($("#dr-kpis")); initRings(page);

                    $("#dr-total-badge").textContent = data.length;
                    $("#dr-avail-badge").textContent = by(function (r) { return r.status === "Available"; });
                    $("#dr-patients-badge").textContent = totalPat;
                    $("#dr-rating-badge").textContent = avgR.toFixed(1);
                }

                function updateBulk() { var n = selN(); $("#dr-bulk-count").textContent = n; $("#dr-bulkbar").hidden = n === 0; }
                function selectedRecs() { return data.filter(function (r) { return state.sel[r.id]; }); }

                /* ---- action menu ---- */
                var menu = null;
                function closeMenu() { if (menu) { menu.remove(); menu = null; } }
                function showMenu(btn, id) {
                    closeMenu();
                    var I = function (ic, l, a, d) { return '<button data-a="' + a + '" data-id="' + id + '"' + (d ? ' class="danger"' : "") + '><i class="' + ic + '"></i>' + l + "</button>"; };
                    var html = '<div class="dr-menu"><p class="dr-menu-lbl">Doctor</p>' + I("icon-eye", "View Profile", "view") + I("icon-edit", "Edit", "edit") + I("icon-calendar-plus", "Book Appointment", "book") + I("icon-calendar-clock", "Manage Schedule", "sched") +
                        '<div class="dr-menu-sep"></div><p class="dr-menu-lbl">Status</p>' + I("icon-circle-check", "Set Available", "avail") + I("icon-coffee", "Set Busy", "setbusy") + I("icon-calendar-x", "Mark On Leave", "leave") +
                        '<div class="dr-menu-sep"></div><p class="dr-menu-lbl">Contact</p>' + I("icon-message-circle", "Send Message", "message") + I("icon-mail", "Email", "email") + I("icon-phone", "Call", "call") +
                        '<div class="dr-menu-sep"></div>' + I("icon-printer", "Print Profile", "print") + I("icon-trash-2", "Delete", "delete", true) + "</div>";
                    var w = document.createElement("div"); w.innerHTML = html; menu = w.firstChild; menu.style.position = "fixed"; document.body.appendChild(menu);
                    var b = btn.getBoundingClientRect(), mw = menu.offsetWidth, mh = menu.offsetHeight;
                    var left = Math.min(b.right - mw, window.innerWidth - mw - 8); if (left < 8) left = 8;
                    var top = b.bottom + 6; if (top + mh > window.innerHeight - 8) top = Math.max(8, b.top - mh - 6);
                    menu.style.left = left + "px"; menu.style.top = top + "px";
                    menu.addEventListener("click", function (e) { var t = e.target.closest("[data-a]"); if (!t) return; rowAction(t.getAttribute("data-a"), +t.getAttribute("data-id")); closeMenu(); });
                }

                /* ---- modal engine ---- */
                function modal(o) {
                    $("#dr-modal-title").textContent = o.title; $("#dr-modal-sub").textContent = o.sub || "";
                    $("#dr-modal-ico").innerHTML = '<i class="' + (o.icon || "icon-check") + '"></i>'; $("#dr-modal-ico").className = "dr-doc-ico " + (o.accent || "dr-c-primary");
                    $("#dr-modal-body").innerHTML = o.body || "";
                    var c = $("#dr-modal-confirm"); c.textContent = o.confirm || "Confirm"; c.className = "dr-btn " + (o.danger ? "dr-btn-danger" : "dr-btn-primary");
                    c.style.display = o.hideConfirm ? "none" : "";
                    c.onclick = function () { if (o.onConfirm && o.onConfirm() === false) return; closeModal(); };
                    $("#dr-modal").classList.add("open");
                    document.body.style.overflow = "hidden";
                    // Modal body HTML is injected after the page's initial-load flatpickr auto-init
                    // has already run, so any date fields inside it must be initialized here instead.
                    if (typeof flatpickr !== "undefined") {
                        $$('[data-provider="flatpickr"]', $("#dr-modal-body")).forEach(function (el) {
                            if (el._flatpickr) return;
                            var config = { disableMobile: true };
                            if (el.hasAttribute("data-date-format")) config.dateFormat = el.getAttribute("data-date-format");
                            flatpickr(el, config);
                        });
                    }
                }
                function closeModal() { $("#dr-modal").classList.remove("open"); if (!$$(".dr-drawer.open").length) document.body.style.overflow = ""; }
                function fld(l, id, v, ph) { return '<div><label class="dr-lbl">' + l + '</label><input id="' + id + '" class="dr-in" value="' + esc(v || "") + '" placeholder="' + esc(ph || "") + '"></div>'; }
                function sel(l, id, opts, v) { return '<div><label class="dr-lbl">' + l + '</label><select id="' + id + '" class="dr-in">' + opts.map(function (o) { return '<option' + (o === v ? " selected" : "") + ">" + o + "</option>"; }).join("") + "</select></div>"; }
                function area(l, id, v) { return '<div><label class="dr-lbl">' + l + '</label><textarea id="' + id + '" class="dr-in" rows="2" style="resize:vertical">' + esc(v || "") + "</textarea></div>"; }
                function docForm(r) {
                    r = r || {};
                    return '<div class="grid grid-cols-2 gap-3">' + fld("Full Name", "m-name", r.name, "e.g. Dr. Jane Doe") + fld("Specialty", "m-spec", r.spec, "e.g. Cardiologist") + sel("Department", "m-dept", DEPTS, r.dept) + sel("Gender", "m-gender", ["Male", "Female"], r.gender) + fld("Experience (yrs)", "m-exp", r.exp, "e.g. 12") + fld("Qualification", "m-qual", r.qual, "e.g. MD, DM") + fld("Consultation Fee", "m-fee", r.fee, "e.g. 800") + sel("Consultation Type", "m-ctype", ["In-person", "Telemedicine", "Both"], r.ctype) + sel("Status", "m-status", STATUSES, r.status) + fld("Phone", "m-phone", r.phone, "+91 …") + '</div>' + fld("Email", "m-email", r.email, "name@dreamshms.com");
                }
                function readForm() { return { name: $("#m-name").value.trim(), spec: $("#m-spec").value || "General Physician", dept: $("#m-dept").value, gender: $("#m-gender").value, exp: +$("#m-exp").value || 0, qual: $("#m-qual").value || "MBBS", fee: +$("#m-fee").value || 500, ctype: $("#m-ctype").value, status: $("#m-status").value, phone: $("#m-phone").value, email: $("#m-email").value, rating: 4.5, patients: 0, reviews: 0, days: [1, 1, 1, 1, 1, 0, 0] }; }

                function openForm(kind) {
                    if (kind === "schedule") {
                        return modal({ title: "Manage Schedule", icon: "icon-calendar-clock", accent: "dr-c-primary", sub: "Weekly availability template", confirm: "Save Schedule", body: sel("Doctor", "sc-doc", data.map(function (r) { return r.name; })) + '<label class="dr-lbl mt-2">Working Days</label><div class="dr-week">' + DAYS.map(function (d) { return '<button type="button" class="dr-day on" data-day="' + d + '"><div class="d">' + d + '</div><i class="icon-check text-emerald-500"></i></button>'; }).join("") + '</div><div class="grid grid-cols-2 gap-3 mt-3">' + fld("From", "sc-from", "09:00 AM") + fld("To", "sc-to", "05:00 PM") + '</div>', after: function () { var wk = $(".dr-week"); if (wk) wk.addEventListener("click", function (e) { var d = e.target.closest("[data-day]"); if (d) d.classList.toggle("on"); }); }, onConfirm: function () { toast("Schedule updated for " + $("#sc-doc").value); } });
                    }
                    if (kind === "dept") {
                        var deptAgg = {}; data.forEach(function (r) { deptAgg[r.dept] = (deptAgg[r.dept] || 0) + 1; });
                        return modal({ title: "Departments", icon: "icon-building-2", accent: "dr-c-violet", sub: DEPTS.length + " departments", hideConfirm: true, confirm: "Close", body: '<div class="space-y-2">' + DEPTS.map(function (d) { return '<div class="dr-recent ' + acc(d) + '" style="border:1px solid var(--color-border-color)"><span class="dr-doc-ico" style="width:2.2rem;height:2.2rem"><i class="icon-building-2"></i></span><div class="flex-1"><p class="text-sm font-bold text-gray-900 dark:text-white">' + d + '</p><p class="text-[10px] text-gray-400">' + (deptAgg[d] || 0) + ' doctors</p></div><button class="dr-tag ' + acc(d) + '" data-dept-filter="' + d + '">View</button></div>'; }).join("") + '</div>' });
                    }
                    modal({
                        title: "Add Doctor", icon: "icon-user-plus", accent: "dr-c-success", sub: "Onboard a new doctor", confirm: "Add Doctor",
                        body: docForm({ status: "Available", ctype: "Both", dept: "Cardiology", gender: "Male" }),
                        onConfirm: function () { var f = readForm(); if (!f.name) { toast("Doctor name is required", "error"); return false; } if (f.name.indexOf("Dr.") !== 0) f.name = "Dr. " + f.name; f.id = nextId++; data.unshift(f); state.page = 1; buildKPIs(); render(); toast(f.name + " added"); }
                    });
                }

                function rowAction(a, id) {
                    var r = data.find(function (x) { return x.id === id; }); if (!r) return;
                    switch (a) {
                        case "view": return openDetail(id);
                        case "edit": return modal({ title: "Edit Doctor", sub: did(r.id), icon: "icon-edit", confirm: "Save", body: docForm(r), onConfirm: function () { var f = readForm(); f.rating = r.rating; f.patients = r.patients; f.reviews = r.reviews; f.days = r.days; Object.assign(r, f); buildKPIs(); render(); toast("Doctor updated"); } });
                        case "book": return modal({ title: "Book Appointment", sub: r.name, icon: "icon-calendar-plus", accent: "dr-c-sky", confirm: "Book", body: fld("Patient", "bk-p", "", "Patient name") + '<div class="grid grid-cols-2 gap-3"><div><label class="dr-lbl">Date</label><input type="text" placeholder="dd-mm-yyyy" id="bk-d" class="dr-in" data-provider="flatpickr" data-date-format="d-m-Y"></div>' + sel("Time", "bk-t", ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"]) + '</div>', onConfirm: function () { toast("Appointment booked with " + r.name); } });
                        case "sched": return openForm("schedule");
                        case "avail": r.status = "Available"; buildKPIs(); render(); return toast(r.name + " set Available");
                        case "setbusy": r.status = "Busy"; buildKPIs(); render(); return toast(r.name + " set Busy");
                        case "leave": r.status = "On Leave"; buildKPIs(); render(); return toast(r.name + " marked On Leave");
                        case "message": return modal({ title: "Send Message", sub: r.name, icon: "icon-message-circle", accent: "dr-c-emerald", confirm: "Send", body: area("Message", "ms-msg"), onConfirm: function () { toast("Message sent to " + r.name); } });
                        case "email": return modal({ title: "Send Email", sub: r.email, icon: "icon-mail", accent: "dr-c-primary", confirm: "Send", body: fld("Subject", "em-s", "") + area("Message", "em-m"), onConfirm: function () { toast("Email sent to " + r.name); } });
                        case "call": return toast("Calling " + r.name + " · " + r.phone, "info");
                        case "print": toast("Printing profile…", "info"); return setTimeout(function () { window.print(); }, 400);
                        case "delete": return modal({ title: "Delete Doctor", sub: "This cannot be undone", icon: "icon-trash-2", accent: "dr-c-rose", danger: true, confirm: "Delete", body: '<p class="text-sm text-gray-600 dark:text-gray-300">Remove <strong>' + esc(r.name) + "</strong> from the roster?</p>", onConfirm: function () { data = data.filter(function (x) { return x.id !== id; }); delete state.sel[id]; buildKPIs(); render(); toast("Doctor removed"); } });
                    }
                }

                /* ---- profile drawer ---- */
                function openDetail(id) {
                    var r = data.find(function (x) { return x.id === id; }); if (!r) return;
                    var kv = function (k, v) { return '<div class="flex items-center justify-between py-2 border-b border-border-color" style="border-bottom-style:dashed"><span class="text-xs text-gray-500 dark:text-gray-400">' + k + '</span><span class="text-xs font-bold text-gray-900 dark:text-white text-right">' + v + "</span></div>"; };
                    var sec = function (t, inner) { return '<div><p class="text-[11px] font-bold uppercase tracking-wide text-gray-400 mb-1.5">' + t + '</p>' + inner + "</div>"; };
                    var stat = function (v, l, ac) { return '<div class="rounded-xl border border-border-color p-2.5 text-center dr-c-' + ac + '"><p class="text-lg font-extrabold text-gray-900 dark:text-white">' + v + '</p><p class="text-[10px] text-gray-500">' + l + '</p></div>'; };
                    var week = '<div class="dr-week ' + acc(r.dept) + '">' + DAYS.map(function (d, i) { return '<div class="dr-day' + (r.days[i] ? " on" : "") + '"><div class="d">' + d + '</div>' + (r.days[i] ? '<i class="icon-check" style="color:var(--dr-c)"></i>' : '<i class="icon-x text-gray-300"></i>') + '</div>'; }).join("") + '</div>';
                    $("#dr-detail-body").innerHTML =
                        '<div class="dr-drawer-hero ' + acc(r.dept) + '"><div class="relative flex items-center justify-between"><button class="dr-icobtn" style="background:rgba(255,255,255,.15);border-color:rgba(255,255,255,.25);color:#fff" data-close><i class="icon-x"></i></button><div class="flex gap-1.5"><button class="dr-icobtn" style="background:rgba(255,255,255,.15);border-color:rgba(255,255,255,.25);color:#fff" data-da="edit" data-id="' + id + '"><i class="icon-edit"></i></button><button class="dr-icobtn" style="background:rgba(255,255,255,.15);border-color:rgba(255,255,255,.25);color:#fff" data-da="print" data-id="' + id + '"><i class="icon-printer"></i></button></div></div>' +
                        '<div class="relative flex items-center gap-3 mt-4"><span class="dr-ava dr-ava-photo" style="width:4rem;height:4rem;--dr-ring:' + (STATUS_RING[r.status] || "#10b981") + '"><img src="' + photoUrl(r.id) + '" alt="' + esc(r.name) + '" style="object-position:' + photoPos(r.id) + '"></span><div class="min-w-0"><p class="text-lg font-extrabold truncate">' + esc(r.name) + '</p><p class="text-[12px] text-white/80">' + esc(r.spec) + '</p><div class="mt-1 flex items-center gap-1.5"><span class="dr-stars" style="color:#fde68a">' + stars(r.rating).replace('class="dr-stars"', 'class=""') + '</span><span class="text-[11px] text-white/80">' + r.rating.toFixed(1) + ' (' + r.reviews + ')</span></div></div></div>' +
                        '<div class="relative mt-3">' + statusBadge(r.status) + '</div></div>' +
                        '<div class="p-4 space-y-4"><div class="grid grid-cols-3 gap-2">' + stat(r.exp + "y", "Experience", "primary") + stat(r.patients, "Patients", "emerald") + stat(money(r.fee).replace("₹", "₹"), "Fee", "amber") + '</div>' +
                        sec("Professional Info", '<div class="rounded-xl border border-border-color p-3">' + kv("Department", esc(r.dept)) + kv("Qualification", esc(r.qual)) + kv("Consultation", esc(r.ctype)) + kv("Gender", esc(r.gender)) + kv("Doctor ID", did(r.id)) + '</div>') +
                        sec("Contact", '<div class="rounded-xl border border-border-color p-3">' + kv("Phone", esc(r.phone)) + kv("Email", esc(r.email)) + '</div>') +
                        sec("Weekly Availability", week) +
                        sec("Performance", '<div class="space-y-2">' + [["Patient Satisfaction", Math.round(r.rating / 5 * 100)], ["Appointment Adherence", 92], ["Response Time", 88]].map(function (p) { return '<div class="' + acc(r.dept) + '"><div class="flex justify-between text-xs mb-1"><span class="text-gray-500 dark:text-gray-400">' + p[0] + '</span><b class="text-gray-900 dark:text-white">' + p[1] + '%</b></div><div class="dr-bar"><i style="width:' + p[1] + '%"></i></div></div>'; }).join("") + '</div>') +
                        '<div class="grid grid-cols-2 gap-2"><button class="dr-btn dr-btn-primary" data-da="book" data-id="' + id + '"><i class="icon-calendar-plus"></i>Book</button><button class="dr-btn dr-btn-success" data-da="sched" data-id="' + id + '"><i class="icon-calendar-clock"></i>Schedule</button><button class="dr-btn dr-btn-solid" data-da="message" data-id="' + id + '"><i class="icon-message-circle"></i>Message</button><button class="dr-btn dr-btn-solid" data-da="call" data-id="' + id + '"><i class="icon-phone"></i>Call</button></div></div>';
                    $("#dr-detail-drawer").classList.add("open");
                    document.body.style.overflow = "hidden";
                }

                /* ---- bulk ---- */
                function bulk(a) {
                    var recs = selectedRecs(), n = recs.length;
                    if (!n && a !== "clear") return toast("No doctors selected", "error");
                    switch (a) {
                        case "clear": state.sel = {}; render(); return;
                        case "status": return modal({ title: "Update Status", sub: n + " doctors", icon: "icon-activity", confirm: "Apply", body: sel("Status", "bk-s", STATUSES), onConfirm: function () { var v = $("#bk-s").value; recs.forEach(function (r) { r.status = v; }); buildKPIs(); render(); toast(n + " set to " + v); } });
                        case "dept": return modal({ title: "Reassign Department", sub: n + " doctors", icon: "icon-building-2", accent: "dr-c-violet", confirm: "Apply", body: sel("Department", "bk-d", DEPTS), onConfirm: function () { var v = $("#bk-d").value; recs.forEach(function (r) { r.dept = v; }); buildKPIs(); render(); toast(n + " moved to " + v); } });
                        case "message": return modal({ title: "Message " + n + " doctors", icon: "icon-message-circle", accent: "dr-c-emerald", confirm: "Send", body: area("Message", "bk-m"), onConfirm: function () { toast("Message sent to " + n + " doctors"); } });
                        case "export": return toast("Exported " + n + " doctors");
                        case "print": toast("Printing " + n + " profiles…", "info"); return setTimeout(function () { window.print(); }, 400);
                        case "delete": return modal({ title: "Delete " + n + " doctors", sub: "This cannot be undone", icon: "icon-trash-2", accent: "dr-c-rose", danger: true, confirm: "Delete " + n, body: '<p class="text-sm text-gray-600 dark:text-gray-300">Remove ' + n + " selected doctors?</p>", onConfirm: function () { data = data.filter(function (x) { return !state.sel[x.id]; }); state.sel = {}; buildKPIs(); render(); toast(n + " doctors removed"); } });
                    }
                }

                function importModal() { modal({ title: "Import Doctors", sub: "CSV or Excel", icon: "icon-upload", accent: "dr-c-sky", confirm: "Import", body: '<div style="border:2px dashed var(--color-border-color);border-radius:.9rem;padding:1.75rem;text-align:center;color:var(--color-gray-500)"><i class="icon-cloud-upload text-3xl"></i><p class="text-sm font-bold mt-1">Drag &amp; drop your file</p><p class="text-[11px]">CSV, XLSX up to 10MB</p></div><div class="mt-3 rounded-xl border border-border-color p-3 grid grid-cols-3 text-center"><div><p class="text-lg font-extrabold text-emerald-600">12</p><p class="text-[10px] text-gray-500">Valid</p></div><div><p class="text-lg font-extrabold text-amber-600">1</p><p class="text-[10px] text-gray-500">Warnings</p></div><div><p class="text-lg font-extrabold text-rose-600">0</p><p class="text-[10px] text-gray-500">Errors</p></div></div>', onConfirm: function () { toast("Imported 12 doctors (1 warning)"); } }); }
                function exportModal() {
                    modal({
                        title: "Export Doctors", icon: "icon-download", accent: "dr-c-emerald", confirm: "Export",
                        body: '<label class="dr-lbl">Format</label><div class="grid grid-cols-4 gap-2 mb-3">' + ["CSV", "Excel", "PDF", "Print"].map(function (f, i) { return '<label class="flex items-center justify-center gap-1 rounded-lg border border-border-color p-2 cursor-pointer text-xs font-bold text-gray-700 dark:text-gray-300"><input type="radio" name="dr-exf" value="' + f + '"' + (i === 0 ? " checked" : "") + " class=\"accent-primary\">" + f + "</label>"; }).join("") + '</div><label class="dr-lbl">Records</label><div class="space-y-2">' + [["all", "All doctors"], ["available", "Available only"], ["filtered", "Current filters"], ["selected", "Selected (" + selN() + ")"]].map(function (o, i) { return '<label class="flex items-center gap-2.5 rounded-xl border border-border-color p-2.5 cursor-pointer text-sm text-gray-700 dark:text-gray-300"><input type="radio" name="dr-exs" value="' + o[0] + '"' + (i === 0 ? " checked" : "") + ' class="accent-primary">' + o[1] + "</label>"; }).join("") + "</div>",
                        onConfirm: function () { var f = (document.querySelector('input[name="dr-exf"]:checked') || {}).value || "CSV"; var s = (document.querySelector('input[name="dr-exs"]:checked') || {}).value || "all"; if (f === "Print") { toast("Opening print…", "info"); setTimeout(function () { window.print(); }, 400); } else toast("Exported " + s + " as " + f); }
                    });
                }

                setTimeout(function () {
                    var sk = $("#dr-skeleton"), ct = $("#dr-content");
                    if (sk) sk.style.display = "none";
                    if (ct) { ct.classList.remove("hidden"); ct.style.animation = "dr-fadein .4s ease"; }
                    // KPIs, header badges, sidebar "available now" widget, page
                    // 1 of the grid view, page nav, counts and pager info are
                    // already static markup in the HTML (matching this seed
                    // data with the default filters/sort/page-size). Only the
                    // KPI ring-fill animation still needs to run on reveal;
                    // buildKPIs()/render() stay available for every later
                    // interaction (search, filters, sort, view/page changes,
                    // add/edit/delete, bulk actions).
                    initRings($("#dr-kpis")); initRings(page);
                }, 1500);

                function on(id, ev, fn) { var el = $("#" + id); if (el) el.addEventListener(ev, fn); }
                on("dr-search", "input", function (e) { state.q = e.target.value; state.page = 1; render(); });
                on("dr-f-dept", "change", function (e) { state.dept = e.target.value; state.page = 1; render(); });
                on("dr-f-status", "change", function (e) { state.status = e.target.value; state.page = 1; render(); });
                on("dr-sort", "change", function (e) { state.sort = e.target.value; render(); });
                on("dr-view-grid", "click", function () { state.view = "grid"; this.classList.add("is-active"); $("#dr-view-list").classList.remove("is-active"); render(); });
                on("dr-view-list", "click", function () { state.view = "list"; this.classList.add("is-active"); $("#dr-view-grid").classList.remove("is-active"); render(); });
                on("dr-import", "click", importModal);
                on("dr-export", "click", exportModal);
                on("dr-filters", "click", function () { $("#dr-filter-drawer").classList.add("open"); document.body.style.overflow = "hidden"; });
                on("dr-size", "change", function (e) { state.size = +e.target.value; state.page = 1; render(); });
                on("dr-jump", "change", function (e) { var v = +e.target.value; if (v >= 1) { state.page = v; render(); } });
                on("dr-empty-clear", "click", function () { clearFilters(); });

                $("#dr-page-nav").addEventListener("click", function (e) { var b = e.target.closest("[data-pg]"); if (!b) return; var v = b.getAttribute("data-pg"); if (v === "prev") state.page--; else if (v === "next") state.page++; else state.page = +v; render(); });

                function selectAll(e) { var onn = e.target.checked, start = (state.page - 1) * state.size, rows = filtered().slice(start, start + state.size); rows.forEach(function (r) { if (onn) state.sel[r.id] = true; else delete state.sel[r.id]; }); render(); }
                on("dr-select-all", "change", selectAll); on("dr-select-all-2", "change", selectAll);

                function delegate(e) {
                    var mb = e.target.closest(".dr-menu-btn"); if (mb) { e.stopPropagation(); return showMenu(mb, +mb.getAttribute("data-id")); }
                    var bk = e.target.closest(".dr-book"); if (bk) { e.stopPropagation(); return rowAction("book", +bk.getAttribute("data-id")); }
                    var v = e.target.closest(".dr-view"); if (v) return openDetail(+v.getAttribute("data-id"));
                    var ed = e.target.closest(".dr-edit"); if (ed) return rowAction("edit", +ed.getAttribute("data-id"));
                    var ch = e.target.closest(".dr-rowcheck"); if (ch) { e.stopPropagation(); if (ch.checked) state.sel[+ch.getAttribute("data-id")] = true; else delete state.sel[+ch.getAttribute("data-id")]; return render(); }
                    if (e.target.closest("a,button,input")) return;
                    var card = e.target.closest(".dr-card[data-id]"); if (card) return openDetail(+card.getAttribute("data-id"));
                    var row = e.target.closest("tr[data-id]"); if (row) return openDetail(+row.getAttribute("data-id"));
                }
                grid.addEventListener("click", delegate); listView.addEventListener("click", delegate);

                document.addEventListener("click", function (e) {
                    var op = e.target.closest("[data-open]"); if (op) { var k = op.getAttribute("data-open"); if (k === "new") return openForm("new"); if (k === "schedule") return openForm("schedule"); if (k === "dept") return openForm("dept"); if (k === "export") return exportModal(); }
                    var df = e.target.closest("[data-dept-filter]"); if (df) { closeModal(); state.dept = df.getAttribute("data-dept-filter"); $("#dr-f-dept").value = state.dept; state.page = 1; render(); toast("Filtered by " + state.dept, "info"); return; }
                    if (e.target.closest("[data-close]")) { closeModal(); $$(".dr-drawer.open").forEach(function (dr) { dr.classList.remove("open"); }); if (!$$(".dr-drawer.open").length && !$("#dr-modal").classList.contains("open")) document.body.style.overflow = ""; }
                    var da = e.target.closest("[data-da]"); if (da) { $("#dr-detail-drawer").classList.remove("open"); if (!$$(".dr-drawer.open").length && !$("#dr-modal").classList.contains("open")) document.body.style.overflow = ""; rowAction(da.getAttribute("data-da"), +da.getAttribute("data-id")); }
                    if (menu && !menu.contains(e.target) && !e.target.closest(".dr-menu-btn")) closeMenu();
                });
                $("#dr-modal").addEventListener("mousedown", function (e) { if (e.target === this || e.target.classList.contains("dr-modal-back")) closeModal(); });
                $("#dr-bulkbar").addEventListener("click", function (e) { var b = e.target.closest("[data-bulk]"); if (b) bulk(b.getAttribute("data-bulk")); });
                window.addEventListener("resize", closeMenu);
                document.addEventListener("keydown", function (e) { if (e.key === "Escape") { closeMenu(); closeModal(); $$(".dr-drawer.open").forEach(function (dr) { dr.classList.remove("open"); }); document.body.style.overflow = ""; } });

                on("fd-apply", "click", function () {
                    state.adv = { spec: $("#fd-spec").value, exp: $("#fd-exp").value, rating: $("#fd-rating").value, type: $("#fd-type").value, gender: $("#fd-gender").value };
                    var n = Object.keys(state.adv).filter(function (k) { return state.adv[k]; }).length;
                    var badge = $("#dr-filter-badge"); badge.textContent = n; badge.classList.toggle("hidden", n === 0);
                    state.page = 1; $("#dr-filter-drawer").classList.remove("open"); if (!$$(".dr-drawer.open").length && !$("#dr-modal").classList.contains("open")) document.body.style.overflow = ""; render(); toast(n + " filter" + (n !== 1 ? "s" : "") + " applied");
                });
                on("fd-reset", "click", function () { $$("#dr-filter-drawer select,#dr-filter-drawer input").forEach(function (i) { i.value = ""; }); state.adv = {}; $("#dr-filter-badge").classList.add("hidden"); render(); });
                function clearFilters() { state.q = ""; state.dept = ""; state.status = ""; state.adv = {}; state.page = 1; $("#dr-search").value = ""; $("#dr-f-dept").value = ""; $("#dr-f-status").value = ""; $("#dr-filter-badge").classList.add("hidden"); render(); }
            })();

// ==========================================================================
// follow-up-appointments.js
// ==========================================================================
// Dreams HMS — Follow-up Appointments
(function () {
    "use strict";
    if ((location.pathname.split("/").pop() || "index.html") !== "follow-up-appointments.html") return;

    const $ = (id) => document.getElementById(id);
    const tbody = $("tbody");
    if (!tbody) return;

    const STATUS = {
        "Due Today": "badge-amber",
        Upcoming: "badge-blue",
        Missed: "badge-red",
        Completed: "badge-green",
        Cancelled: "badge-gray",
    };

    const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const fmt = (iso) => {
        const p = iso.split("-");
        return p[2] + " " + MONTHS[parseInt(p[1], 10) - 1] + " " + p[0];
    };

    let data = [
        { id: 1, patient: "James Morrison", phone: "(212) 555-0147", doctor: "Dr. Sarah Chen", dept: "Cardiology", prev: "2026-06-19", next: "2026-07-17", reason: "Post-stent review", status: "Due Today", history: ["2026-06-19 · Stent placement follow-up", "2026-05-08 · Angiogram", "2026-04-22 · Initial consultation"] },
        { id: 2, patient: "Linda Whitfield", phone: "(212) 555-0182", doctor: "Dr. Michael Reyes", dept: "Neurology", prev: "2026-06-17", next: "2026-07-17", reason: "Migraine medication review", status: "Due Today", history: ["2026-06-17 · Medication adjusted", "2026-05-13 · MRI review"] },
        { id: 3, patient: "Robert Castillo", phone: "(646) 555-0113", doctor: "Dr. Emily Carter", dept: "Orthopedics", prev: "2026-06-25", next: "2026-07-24", reason: "Knee arthroscopy recovery", status: "Upcoming", history: ["2026-06-25 · Arthroscopy performed", "2026-06-02 · Pre-op assessment"] },
        { id: 4, patient: "Angela Brooks", phone: "(718) 555-0164", doctor: "Dr. David Okonkwo", dept: "Pediatrics", prev: "2026-06-10", next: "2026-07-10", reason: "Growth monitoring", status: "Missed", history: ["2026-06-10 · Routine check", "2026-03-14 · Immunisation"] },
        { id: 5, patient: "Marcus Delgado", phone: "(347) 555-0198", doctor: "Dr. Laura Bennett", dept: "Oncology", prev: "2026-06-30", next: "2026-07-21", reason: "Chemotherapy cycle 3", status: "Upcoming", history: ["2026-06-30 · Cycle 2 completed", "2026-06-09 · Cycle 1 completed"] },
        { id: 6, patient: "Priya Raghavan", phone: "(212) 555-0121", doctor: "Dr. Sarah Chen", dept: "Cardiology", prev: "2026-05-28", next: "2026-06-28", reason: "Blood pressure review", status: "Missed", history: ["2026-05-28 · Medication started"] },
        { id: 7, patient: "Daniel Kowalski", phone: "(917) 555-0176", doctor: "Dr. Michael Reyes", dept: "Neurology", prev: "2026-06-12", next: "2026-07-12", reason: "Nerve conduction results", status: "Completed", history: ["2026-07-12 · Results reviewed, discharged", "2026-06-12 · EMG performed"] },
        { id: 8, patient: "Sofia Alvarez", phone: "(646) 555-0155", doctor: "Dr. Emily Carter", dept: "Orthopedics", prev: "2026-06-20", next: "2026-07-25", reason: "Shoulder physiotherapy review", status: "Upcoming", history: ["2026-06-20 · Physio plan agreed"] },
        { id: 9, patient: "Naomi Fitzgerald", phone: "(212) 555-0190", doctor: "Dr. Laura Bennett", dept: "Oncology", prev: "2026-06-15", next: "2026-07-15", reason: "Biopsy results discussion", status: "Completed", history: ["2026-07-15 · Results benign", "2026-06-15 · Biopsy taken"] },
        { id: 10, patient: "Ethan Caldwell", phone: "(347) 555-0102", doctor: "Dr. Sarah Chen", dept: "Cardiology", prev: "2026-06-27", next: "2026-07-27", reason: "Holter monitor review", status: "Upcoming", history: ["2026-06-27 · Monitor fitted"] },
        { id: 11, patient: "Camille Rousseau", phone: "(917) 555-0128", doctor: "Dr. Michael Reyes", dept: "Neurology", prev: "2026-05-20", next: "2026-06-20", reason: "Seizure medication review", status: "Missed", history: ["2026-05-20 · Dose increased"] },
        { id: 12, patient: "Hannah Whitmore", phone: "(212) 555-0163", doctor: "Dr. David Okonkwo", dept: "Pediatrics", prev: "2026-06-22", next: "2026-07-22", reason: "Asthma control review", status: "Upcoming", history: ["2026-06-22 · Inhaler technique taught"] },
        { id: 13, patient: "Victor Ramirez", phone: "(718) 555-0174", doctor: "Dr. Laura Bennett", dept: "Oncology", prev: "2026-06-18", next: "2026-07-17", reason: "Post-biopsy wound check", status: "Due Today", history: ["2026-06-18 · Biopsy performed"] },
        { id: 14, patient: "Grace Lindqvist", phone: "(646) 555-0136", doctor: "Dr. Emily Carter", dept: "Orthopedics", prev: "2026-06-05", next: "2026-07-05", reason: "Back pain reassessment", status: "Completed", history: ["2026-07-05 · Improved, discharged", "2026-06-05 · Physio referral"] },
    ];

    function detailUrl(r) {
        return "follow-up-appointment-detail.html?" + new URLSearchParams({
            id: r.id, patient: r.patient, doctor: r.doctor, dept: r.dept,
            prev: r.prev, next: r.next, reason: r.reason, status: r.status,
        }).toString();
    }

    function stats() {
        $("stat-due").textContent = data.filter((r) => r.status === "Due Today").length;
        $("stat-upcoming").textContent = data.filter((r) => r.status === "Upcoming").length;
        $("stat-missed").textContent = data.filter((r) => r.status === "Missed").length;
        $("stat-completed").textContent = data.filter((r) => r.status === "Completed").length;
    }

    // --- Statistics (Appointment module component) ---------------------------
    MC.apptStats($("stats-row"), [
        { id: "stat-due", icon: "icon-calendar-check", label: "Due Today", tone: "amber", delta: 3.1, spark: [2, 3, 2, 4, 3, 4, 3] },
        { id: "stat-upcoming", icon: "icon-calendar-clock", label: "Upcoming", tone: "sky", delta: 7.4, spark: [5, 6, 5, 7, 8, 7, 9] },
        { id: "stat-missed", icon: "icon-calendar-x", label: "Missed", tone: "danger", delta: -8.2, spark: [5, 4, 5, 3, 4, 3, 2] },
        { id: "stat-completed", icon: "icon-circle-check", label: "Completed", tone: "emerald", delta: 13.7, spark: [3, 4, 5, 4, 6, 7, 8] },
    ]);

    const grid = MC.grid({
        tbody: tbody,
        data: data,
        pageSize: 10,
        skipInitialRender: true,
        search: $("search"),
        filters: [
            { el: $("filter-doctor"), match: (r, v) => r.doctor === v },
            { el: $("filter-status"), match: (r, v) => r.status === v },
        ],
        info: $("info"),
        pager: $("pager"),
        selectAll: $("select-all"),
        bulkBar: $("bulk-bar"),
        bulkCount: $("bulk-count"),
        empty: { icon: "icon-calendar-check", title: "No follow-ups found", text: "Try adjusting your search or filters." },
        columns: [
            {
                render: (r) =>
                    '<div><p class="font-medium"><a class="text-primary" href="' + detailUrl(r) + '">' + r.patient + "</a></p>" +
                    '<p class="text-xs text-gray-500 dark:text-gray-400">' + r.phone + "</p></div>",
            },
            { render: (r) => r.doctor },
            { render: (r) => r.dept },
            { render: (r) => fmt(r.prev) },
            {
                render: (r) =>
                    '<span class="' + (r.status === "Missed" ? "text-danger font-semibold" : r.status === "Due Today" ? "text-amber-600 font-semibold" : "") + '">' +
                    fmt(r.next) + "</span>",
            },
            { render: (r) => '<span class="block max-w-44 truncate" title="' + r.reason + '">' + r.reason + "</span>" },
            { render: (r) => MC.badge(STATUS, r.status) },
            {
                cls: "text-right",
                render: (r) =>
                    MC.actions(r.id, [
                        { label: "View History", icon: "icon-history", act: "history" },
                        { label: "Reschedule", icon: "icon-calendar-clock", act: "resched" },
                        { label: "Send Reminder", icon: "icon-bell-ring", act: "remind" },
                        { label: "Complete", icon: "icon-circle-check", act: "complete" },
                        { label: "Cancel", icon: "icon-circle-x", act: "cancel", danger: true },
                    ]),
            },
        ],
    });

    function refresh() {
        grid.setData(data);
        stats();
    }

    let actionId = null;

    tbody.addEventListener("click", function (e) {
        const btn = e.target.closest("[data-act]");
        if (!btn) return;
        const row = data.find((r) => r.id === parseInt(btn.dataset.id, 10));
        if (!row) return;
        actionId = row.id;

        switch (btn.dataset.act) {
            case "history":
                $("history-name").textContent = row.patient + " · " + row.dept;
                $("history-body").innerHTML = row.history
                    .map(function (h) {
                        const parts = h.split(" · ");
                        return (
                            '<div class="flex gap-3 p-3 rounded-lg border border-border-color">' +
                            '<span class="size-9 shrink-0 flex items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-600/20">' +
                            '<i class="icon-file-text text-primary text-sm"></i></span>' +
                            '<div><p class="text-sm font-medium text-gray-900">' + parts[1] + "</p>" +
                            '<p class="text-xs text-gray-500 dark:text-gray-400">' + fmt(parts[0]) + "</p></div></div>"
                        );
                    })
                    .join("");
                MC.openModal("history-modal");
                return;
            case "resched":
                $("resched-name").textContent = row.patient + " · " + row.reason;
                $("rs-date").value = row.next;
                MC.openModal("resched-modal");
                return;
            case "remind":
                MC.toast("Reminder sent to " + row.patient, "info");
                return;
            case "complete":
                row.status = "Completed";
                MC.toast(row.patient + " follow-up completed");
                break;
            case "cancel":
                MC.confirmDelete(row.patient + " · " + row.reason, function () {
                    row.status = "Cancelled";
                    MC.toast("Follow-up cancelled");
                    refresh();
                });
                return;
        }
        refresh();
    });

    $("rs-confirm").addEventListener("click", function () {
        const row = data.find((r) => r.id === actionId);
        if (row) {
            row.next = $("rs-date").value || row.next;
            row.status = "Upcoming";
        }
        MC.closeModal("resched-modal");
        MC.toast("Follow-up rescheduled");
        refresh();
    });

    document.querySelectorAll("[data-bulk]").forEach(function (btn) {
        btn.addEventListener("click", function () {
            const ids = grid.selected().map(Number);
            if (!ids.length) return;
            if (btn.dataset.bulk === "remind") {
                MC.toast("Reminders sent to " + ids.length + " patients", "info");
                grid.clearSelection();
                return;
            }
            data.forEach(function (r) {
                if (ids.indexOf(r.id) !== -1) r.status = "Completed";
            });
            MC.toast(ids.length + " follow-ups completed");
            grid.clearSelection();
            refresh();
        });
    });

    $("btn-reset").addEventListener("click", function () {
        $("search").value = "";
        $("filter-doctor").value = "";
        $("filter-status").value = "";
        $("filter-range").value = "";
        grid.refresh();
        MC.toast("Filters cleared", "info");
    });

    $("btn-print").addEventListener("click", () => window.print());

    $("btn-export").addEventListener("click", function () {
        const head = ["Patient", "Phone", "Doctor", "Department", "Previous Visit", "Follow-up Date", "Reason", "Status"];
        const rows = data.map((r) => [r.patient, r.phone, r.doctor, r.dept, r.prev, r.next, r.reason, r.status]);
        const csv = [head].concat(rows)
            .map((line) => line.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(","))
            .join("\n");
        const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
        const a = document.createElement("a");
        a.href = url;
        a.download = "follow-up-appointments.csv";
        a.click();
        URL.revokeObjectURL(url);
        MC.toast("Follow-ups exported");
    });

    document.querySelectorAll("[data-close]").forEach(function (btn) {
        btn.addEventListener("click", () => MC.closeModal(btn.dataset.close));
    });
    ["resched-modal", "history-modal", "del-modal"].forEach(MC.closeOnBackdrop);
    MC.initDeleteModal();
    stats();
})();

// ==========================================================================
// operation-reports.js
// ==========================================================================
(function(){
    "use strict";
    if ((location.pathname.split("/").pop() || "index.html") !== "operation-reports.html") return;
    const $=(s,r)=>(r||document).querySelector(s);
    const $$=(s,r)=>Array.from((r||document).querySelectorAll(s));
    const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
    let toastT;
    function toast(msg,icon){ const t=$('#or-toast'); if(!t) return; t.innerHTML=`<i class="${icon||'icon-check'} text-teal-400"></i> ${msg}`; t.classList.add('show'); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove('show'),2500); }

    /* ============ ANALYTICS OVERVIEW ============ */
    function sparkArea(id,data,color){ const w=64,h=22,mn=Math.min(...data),mx=Math.max(...data),rg=(mx-mn)||1; const pts=data.map((v,i)=>`${(i/(data.length-1))*w},${h-((v-mn)/rg)*(h-3)-1.5}`).join(' '); return `<svg class="or-spark w-full h-6" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><defs><linearGradient id="sp${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${color}" stop-opacity=".3"/><stop offset="100%" stop-color="${color}" stop-opacity="0"/></linearGradient></defs><polygon points="0,${h} ${pts} ${w},${h}" fill="url(#sp${id})"/><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="1.6" stroke-linecap="round"/></svg>`; }
    const OV=[
        {t:'Surgeries Completed',v:'1,284',p:96,c:'#0d9488',ic:'icon-circle-check',chip:'+8.2%',up:1,sp:[210,230,225,248,260,275,284]},
        {t:'OT Utilization',v:'82%',p:82,c:'#1d4ed8',ic:'icon-layout-grid',chip:'+3.1%',up:1,sp:[74,76,78,79,80,81,82]},
        {t:'Avg Surgery Duration',v:'124m',p:68,c:'#7c3aed',ic:'icon-clock',chip:'-6 min',up:1,sp:[135,132,130,128,126,125,124]},
        {t:'Emergency Surgeries',v:'168',p:38,c:'#e06c1f',ic:'icon-siren',chip:'+12%',up:0,sp:[120,130,140,150,158,164,168]},
        {t:'Cancellation Rate',v:'3.6%',p:36,c:'#dc2626',ic:'icon-x-circle',chip:'-0.8%',up:1,sp:[5.1,4.8,4.4,4.1,3.9,3.7,3.6]},
        {t:'Recovery Success',v:'97.1%',p:97,c:'#15803d',ic:'icon-heart-pulse',chip:'+1.4%',up:1,sp:[94,95,95,96,96,97,97]},
    ];
    function renderOverview(){
        $('#or-overview').innerHTML=OV.map((o,i)=>`<div class="or-stat" style="--sc:${o.c}">
            <div class="flex items-start justify-between">
                <span class="or-iconbadge w-9 h-9" style="color:${o.c}"><i class="${o.ic}"></i></span>
                <div class="relative w-11 h-11"><svg viewBox="0 0 36 36" class="or-ring w-11 h-11"><circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--or-track)" stroke-width="3.2"/><circle class="bar" cx="18" cy="18" r="15.9" fill="none" stroke="${o.c}" stroke-width="3.2" stroke-linecap="round" pathLength="100" style="--p:${o.p}"/></svg><span class="absolute inset-0 flex items-center justify-center text-[9px] font-bold" style="color:${o.c}">${o.p}%</span></div>
            </div>
            <p class="text-2xl font-bold or-head mt-2">${o.v}</p>
            <div class="flex items-center justify-between"><p class="text-[11px] or-mut">${o.t}</p><span class="or-chip" style="background:color-mix(in srgb,${o.up?'#15803d':'#dc2626'} 12%,transparent);color:${o.up?'#15803d':'#dc2626'}"><i class="icon-arrow-${o.up?'up':'down'}-right text-[9px]"></i> ${o.chip}</span></div>
            <div class="mt-1.5">${sparkArea(i,o.sp,o.c)}</div>
        </div>`).join('');
    }
    function animateRings(){ $$('.or-ring .bar').forEach(b=>{ const p=b.style.getPropertyValue('--p'); b.style.setProperty('--p','0'); requestAnimationFrame(()=>requestAnimationFrame(()=>b.style.setProperty('--p',p))); }); }

    /* ============ SURGERY PERFORMANCE ============ */
    const PERF={
        'Department':[['Cardiac Surgery',312,96,'#dc2626'],['Orthopedics',286,97,'#e06c1f'],['General Surgery',264,95,'#0f766e'],['Neurosurgery',198,94,'#7c3aed'],['Pediatric',124,98,'#1d4ed8'],['Urology',100,96,'#0e7490']],
        'Procedure':[['Knee Replacement',188,98,'#e06c1f'],['CABG',164,95,'#dc2626'],['Appendectomy',142,99,'#0f766e'],['Cholecystectomy',126,97,'#1d4ed8'],['Craniotomy',98,93,'#7c3aed'],['C-Section',156,99,'#be185d']],
        'OT Room':[['OT-01',248,96,'#0f766e'],['Cardiac OT',224,95,'#dc2626'],['OT-02',212,97,'#1d4ed8'],['Neuro OT',186,94,'#7c3aed'],['OT-03',204,96,'#e06c1f'],['OT-04',210,97,'#0e7490']],
        'Priority':[['Routine',742,98,'#0f766e'],['Medium',268,96,'#1d4ed8'],['High',186,93,'#e06c1f'],['Emergency',168,90,'#dc2626']],
    };
    let perfKey='Department';
    function renderPerf(){
        const rows=PERF[perfKey]; const mx=Math.max(...rows.map(r=>r[1]));
        $('#or-perfbars').innerHTML=rows.map(r=>`<div><div class="flex justify-between text-xs mb-1"><span class="font-medium or-head">${r[0]}</span><span class="or-mut">${r[1]} · <span style="color:#15803d">${r[2]}%</span></span></div><div class="or-bar"><span style="width:${Math.round(r[1]/mx*100)}%;background:${r[3]}"></span></div></div>`).join('');
    }

    /* ============ OT UTILIZATION ============ */
    // Peak times were Math.random() on every load; frozen to a fixed set so
    // the (now static-HTML) initial markup stays in sync if this ever re-renders.
    const PEAK={'OT-01':'10:00','OT-02':'09:00','OT-03':'14:00','Cardiac OT':'11:00','Neuro OT':'10:00','OT-04':'09:00'};
    function renderUtil(){
        const rooms=[['OT-01',86,6,5,3],['OT-02',78,12,6,4],['OT-03',72,16,8,4],['Cardiac OT',91,3,4,2],['Neuro OT',68,20,7,5],['OT-04',80,10,6,4]];
        $('#or-utilcards').innerHTML=rooms.map(r=>{
            const seg=[['Usage',r[1],'#0d9488'],['Idle',r[2],'#94a3b8'],['Cleaning',r[3],'#b7791f'],['Maintenance',r[4],'#dc2626']];
            return `<div class="or-panel p-3">
                <div class="flex items-center justify-between mb-2"><span class="text-sm font-bold or-head">${r[0]}</span><span class="or-chip" style="background:color-mix(in srgb,${r[1]>=85?'#15803d':r[1]>=75?'#1d4ed8':'#e06c1f'} 13%,transparent);color:${r[1]>=85?'#15803d':r[1]>=75?'#1d4ed8':'#e06c1f'}">${r[1]}% used</span></div>
                <div class="or-bar mb-2" style="display:flex;gap:1px;background:transparent">${seg.map(s=>`<span style="width:${s[1]}%;background:${s[2]}" title="${s[0]} ${s[1]}%"></span>`).join('')}</div>
                <div class="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px]">${seg.map(s=>`<div class="flex items-center gap-1 or-mut"><span class="or-dot" style="background:${s[2]}"></span>${s[0]} ${s[1]}%</div>`).join('')}</div>
                <p class="text-[10px] or-mut mt-1.5">Peak: ${PEAK[r[0]]}</p>
            </div>`;
        }).join('');
    }

    /* ============ HEATMAP ============ */
    // Cell values were Math.random() on every load; frozen to a fixed grid so
    // the (now static-HTML) initial markup stays in sync if this ever re-renders.
    const HEAT={
        Mon:[28,52,78,88,92,85,70,55,38,22],
        Tue:[32,58,82,90,95,88,74,60,42,26],
        Wed:[25,48,75,85,90,82,68,52,35,20],
        Thu:[30,55,80,89,93,86,72,58,40,24],
        Fri:[22,40,65,76,84,79,62,45,30,18],
    };
    function renderHeatmap(){
        const hours=['08','09','10','11','12','13','14','15','16','17'];
        const days=['Mon','Tue','Wed','Thu','Fri'];
        function col(v){ return v>=85?'#dc2626':v>=65?'#e06c1f':v>=45?'#b7791f':v>=25?'#0f766e':'var(--or-track)'; }
        let html=`<div class="grid gap-1" style="grid-template-columns:34px repeat(${hours.length},1fr)">`;
        html+=`<span></span>`+hours.map(h=>`<span class="text-[8px] or-mut text-center">${h}</span>`).join('');
        days.forEach((d,di)=>{ html+=`<span class="text-[10px] or-mut flex items-center">${d}</span>`+hours.map((h,hi)=>{ const v=HEAT[d][hi]; return `<div class="or-heat" style="background:color-mix(in srgb,${col(v)} ${v>24?70:100}%,transparent);color:${v>=65?'#fff':'transparent'}" title="${d} ${h}:00 · ${v}%">${v}</div>`; }).join(''); });
        html+=`</div><div class="flex items-center justify-between mt-3 text-[10px] or-mut"><span>Low load</span><div class="flex gap-1">${['#0f766e','#b7791f','#e06c1f','#dc2626'].map(c=>`<span class="w-4 h-3 rounded" style="background:${c}"></span>`).join('')}</div><span>Peak load</span></div>`;
        $('#or-heatmap').innerHTML=html;
    }

    /* ============ SURGEON PERFORMANCE ============ */
    const AVC=['#475569','#0f766e','#1e40af','#4338ca','#0e7490','#334155'];
    function renderSurgeons(){
        const rows=[['Dr. A. Mehta','Cardiac',312,96,138,2.1,97],['Dr. R. Nair','Orthopedic',286,98,102,1.4,96],['Dr. S. Kapoor','Neuro',198,94,164,3.2,93],['Dr. L. Khan','General',264,95,88,1.8,95],['Dr. P. Rao','Pediatric',124,98,76,0.9,98],['Dr. V. Iyer','Urology',146,96,94,1.6,96]];
        $('#or-surgeons').innerHTML=rows.map((r,i)=>`<tr>
            <td><div class="flex items-center gap-2.5"><span class="or-avatar" style="width:32px;height:32px;background:${AVC[i]};font-size:11px">${r[0].replace('Dr. ','').split(' ').map(x=>x[0]).join('')}</span><span class="font-semibold">${r[0]}</span></div></td>
            <td><span class="or-npill">${r[1]}</span></td>
            <td class="font-semibold">${r[2]}</td>
            <td><span style="color:#15803d;font-weight:600">${r[3]}%</span></td>
            <td>${r[4]} min</td>
            <td><span style="color:${r[5]>2.5?'#dc2626':r[5]>1.5?'#e06c1f':'#15803d'};font-weight:600">${r[5]}%</span></td>
            <td><div class="flex items-center gap-2"><div class="or-bar w-16"><span style="width:${r[6]}%;background:#f59e0b"></span></div><span class="text-[11px] or-mut">${r[6]}%</span></div></td>
        </tr>`).join('');
    }

    /* ============ SAVED REPORTS ============ */
    let REPORTS=[
        {id:1,name:'Monthly OT Utilization',type:'Utilization',date:'Jul 2026',ic:'icon-layout-grid',c:'#1d4ed8'},
        {id:2,name:'Cardiac Dept Performance',type:'Department',date:'Q2 2026',ic:'icon-heart-pulse',c:'#dc2626'},
        {id:3,name:'Surgeon Scorecard',type:'Surgeon',date:'Jul 2026',ic:'icon-award','c':'#0f766e'},
        {id:4,name:'Emergency Surgery Trends',type:'Trends',date:'H1 2026',ic:'icon-siren',c:'#e06c1f'},
        {id:5,name:'OT Turnover Time',type:'Efficiency',date:'Jul 2026',ic:'icon-timer',c:'#7c3aed'},
        {id:6,name:'Post-Op Complication Rate',type:'Outcomes',date:'Q2 2026',ic:'icon-shield-alert',c:'#b45309'},
    ];
    function renderReports(){
        $('#or-reports').innerHTML=REPORTS.map(r=>`<div class="or-report" data-report="${r.id}">
            <div class="flex items-start justify-between mb-1.5"><span class="or-iconbadge w-9 h-9" style="color:${r.c}"><i class="${r.ic}"></i></span><button data-report-menu="${r.id}" onclick="event.stopPropagation()" class="w-7 h-7 rounded-md hover:bg-[var(--or-hover)] flex items-center justify-center or-mut"><i class="icon-more-vertical text-sm"></i></button></div>
            <p class="text-sm font-bold or-head">${r.name}</p>
            <p class="text-[11px] or-mut">${r.type} · ${r.date}</p>
            <div class="flex gap-1.5 mt-2"><button data-modal="export" onclick="event.stopPropagation()" class="or-npill hover:bg-[var(--or-hover)]"><i class="icon-download text-[11px]"></i> Export</button><button data-report-menu="${r.id}" onclick="event.stopPropagation()" class="or-npill hover:bg-[var(--or-hover)]"><i class="icon-eye text-[11px]"></i> View</button></div>
        </div>`).join('');
    }

    /* ============ MENU ============ */
    const ACTIONS=[['View Report','icon-eye','view'],['Generate','icon-file-chart-column','generate'],['Save','icon-bookmark','save'],['Export','icon-download','export'],['Print','icon-printer','print'],['Share','icon-share-2','share'],['Schedule','icon-calendar-clock','schedule'],['sep'],['Archive','icon-archive','archive'],['Delete','icon-trash-2','delete']];
    function openMenu(id,x,y){ closeMenu(); $('#or-menuhost').innerHTML=`<div class="or-menu" id="or-openmenu">${ACTIONS.map(a=>a[0]==='sep'?'<div class="or-menu-sep"></div>':`<button data-action="${a[2]}" data-rid="${id}" class="${a[2]==='delete'?'danger':''}"><i class="${a[1]}"></i> ${a[0]}</button>`).join('')}</div>`; const m=$('#or-openmenu'); const r=m.getBoundingClientRect(); m.style.left=Math.max(12,Math.min(x,window.innerWidth-r.width-12))+'px'; m.style.top=Math.max(12,Math.min(y,window.innerHeight-r.height-12))+'px'; }
    function closeMenu(){ $('#or-menuhost').innerHTML=''; }

    /* ============ MODALS ============ */
    const fld=(l,el)=>`<div><label class="or-formlabel">${l}</label>${el}</div>`;
    const inp=(ph)=>`<input class="or-in mt-1" placeholder="${ph||''}">`;
    const selE=(o)=>`<select class="or-in mt-1">${o.map(x=>`<option>${x}</option>`).join('')}</select>`;
    const MODALS={
        generate:{t:'Generate Report',sub:'Build a surgical analytics report',ic:'icon-file-chart-column',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('Report Type',selE(['OT Utilization','Department Performance','Surgeon Scorecard','Surgical Trends','Outcome Analysis','Emergency Report']))}${fld('Period',selE(['This Week','This Month','This Quarter','This Year','Custom']))}${fld('Department',selE(['All','Cardiac','Neuro','Orthopedic','General']))}${fld('Format',selE(['PDF','Excel','CSV','Dashboard']))}</div><div class="mt-3">${fld('Include Sections',selE(['All sections','Summary only','Charts only','Tables only']))}</div>`,cta:'Generate Report'},
        save:{t:'Save Report',sub:'Save the current configuration',ic:'icon-bookmark',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('Report Name',inp('e.g. Monthly OT Summary'))}${fld('Category',selE(['Utilization','Department','Surgeon','Trends']))}${fld('Visibility',selE(['Private','Team','Hospital-wide']))}${fld('Tags',inp('cardiac, monthly'))}</div>`,cta:'Save Report'},
        schedule:{t:'Schedule Report',sub:'Automate recurring delivery',ic:'icon-calendar-clock',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('Report',selE(REPORTS.map(r=>r.name)))}${fld('Frequency',selE(['Daily','Weekly','Monthly','Quarterly']))}${fld('Delivery',selE(['Email','Dashboard','Both']))}${fld('Recipients',inp('admin@dreamscare.health'))}</div>`,cta:'Schedule Report'},
        export:{t:'Export',sub:'Export report data',ic:'icon-download',body:`<p class="text-xs or-mut mb-2">Choose a format</p><div class="grid grid-cols-2 gap-2">${['PDF','Excel','CSV','Print','Department Report','Surgeon Report','OT Utilization Report','Full Analytics'].map(f=>`<button data-expfmt="${f}" class="or-btn or-btn-ghost justify-center">${f}</button>`).join('')}</div>`,cta:'Export'},
    };
    const SIMPLE={view:'Opening report...',print:'Printing report...',share:'Share link copied',archive:'Report archived',schedule:'Report scheduled'};
    function openModal(key){ const m=MODALS[key]; if(!m) return; $('#or-modalhost').innerHTML=`<div class="or-modal-wrap open"><div class="or-modal-bg" data-close></div><div class="or-modal">
        <div class="or-modal-head"><span class="or-modal-badge"><i class="${m.ic}"></i></span><div class="min-w-0"><h3 class="font-bold or-head leading-tight">${m.t}</h3><p class="text-[11px] or-mut">${m.sub||''}</p></div><button data-close class="ml-auto w-8 h-8 rounded-lg hover:bg-[var(--or-hover)] flex items-center justify-center or-mut"><i class="icon-x"></i></button></div>
        <div class="or-modal-body">${m.body}</div>
        <div class="or-modal-foot"><button data-close class="or-btn or-btn-ghost">Cancel</button><button data-modalok="${key}" class="or-btn or-btn-primary"><i class="${m.ic}"></i> ${m.cta}</button></div>
    </div></div>`; document.body.style.overflow = "hidden"; }
    function openDelete(msg,onOk){ $('#or-modalhost').innerHTML=`<div class="or-modal-wrap open"><div class="or-modal-bg" data-close></div><div class="or-modal" style="width:min(420px,94vw)"><div class="p-5 text-center"><div class="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style="background:color-mix(in srgb,#dc2626 13%,transparent);color:#dc2626"><i class="icon-alert-triangle text-2xl"></i></div><h3 class="font-bold text-lg or-head">Confirm</h3><p class="text-xs or-mut mt-1">${msg}</p><div class="flex gap-2 mt-4"><button data-close class="or-btn or-btn-ghost flex-1 justify-center">Cancel</button><button id="or-delok" class="or-btn or-btn-danger flex-1 justify-center">Delete</button></div></div></div></div>`; document.body.style.overflow = "hidden"; $('#or-delok').onclick=()=>{ onOk(); closeModal(); }; }
    function closeModal(){ $('#or-modalhost').innerHTML=''; document.body.style.overflow = ""; }

    /* ============ EVENTS ============ */
    document.addEventListener('click',e=>{
        if(e.target.closest('[data-pd]')){ const b=e.target.closest('[data-pd]'); $$('#or-periodtabs button').forEach(x=>x.classList.toggle('on',x===b)); const lbl={week:'This Week',month:'This Month · Jul 2026',quarter:'This Quarter · Q3',year:'This Year · 2026'}[b.dataset.pd]; $('#or-period').textContent=lbl; toast('Period: '+lbl,'icon-calendar-range'); return; }
        if(e.target.closest('[data-pf]')){ const b=e.target.closest('[data-pf]'); perfKey=b.dataset.pf; $$('#or-perftabs button').forEach(x=>x.classList.toggle('on',x===b)); renderPerf(); return; }
        if(e.target.closest('[data-report-menu]')){ const t=e.target.closest('[data-report-menu]'); const r=t.getBoundingClientRect(); openMenu(+t.dataset.reportMenu,r.left-180,r.bottom+4); return; }
        if(e.target.closest('[data-report]')){ openModal('generate'); return; }
        const t=e.target.closest('[data-modal],[data-modalok],[data-close],[data-action],[data-expfmt]');
        if(!t){ if(!e.target.closest('.or-menu')) closeMenu(); return; }
        if(t.dataset.modal!==undefined){ openModal(t.dataset.modal); return; }
        if(t.dataset.modalok!==undefined){ const k=t.dataset.modalok; if(k==='save'){ REPORTS.unshift({id:Date.now(),name:'Custom Report',type:'Custom',date:'Jul 2026',ic:'icon-file-chart-column',c:'#0d9488'}); renderReports(); } toast(MODALS[k].cta+' — done','icon-check'); closeModal(); return; }
        if(t.dataset.expfmt!==undefined){ toast('Exported: '+t.dataset.expfmt,'icon-download'); closeModal(); return; }
        if(t.dataset.close!==undefined){ closeModal(); return; }
        if(t.dataset.action!==undefined){ const a=t.dataset.action, id=+t.dataset.rid; closeMenu();
            if(a==='delete') openDelete('Delete this saved report?',()=>{ REPORTS=REPORTS.filter(r=>r.id!==id); renderReports(); toast('Report deleted','icon-trash-2'); });
            else if(MODALS[a]) openModal(a);
            else if(SIMPLE[a]) toast(SIMPLE[a]);
            return; }
    });
    // report builder live preview
    document.addEventListener('change',e=>{ if(e.target.dataset.rb!==undefined){ const n=rnd(180,1284); $('#or-rb-count').textContent=n.toLocaleString('en-IN'); $('#or-rb-bar').style.width=Math.round(n/1284*100)+'%'; } });

    function clock(){ $('#or-clock').textContent=new Date().toLocaleTimeString('en-GB'); }

    /* ============ INIT ============ */
    // renderOverview/renderPerf('Department')/renderUtil/renderHeatmap/renderSurgeons/renderReports
    // are now pre-rendered as static HTML in the page (#or-overview, #or-perfbars, #or-utilcards,
    // #or-heatmap, #or-surgeons, #or-reports) instead of being generated here on load.
    // renderPerf() still runs on tab switch and renderReports() still runs after save/delete.
    setTimeout(()=>{
        $('#or-skeleton').classList.add('hidden');
        $('#or-content').classList.remove('hidden');
        animateRings(); clock(); setInterval(clock,1000);
    },1400);
})();

// ==========================================================================
// operation-theater.js
// ==========================================================================
(function(){
    "use strict";
    if ((location.pathname.split("/").pop() || "index.html") !== "operation-theater.html") return;
    const $=(s,r)=>(r||document).querySelector(s);
    const $$=(s,r)=>Array.from((r||document).querySelectorAll(s));
    const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
    let toastT;
    function toast(msg,icon){ const t=$('#ot-toast'); t.innerHTML=`<i class="${icon||'icon-check'} text-teal-400"></i> ${msg}`; t.classList.add('show'); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove('show'),2500); }

    /* ============ DATA ============ */
    const STLABEL={avail:'Available',prep:'Preparing',prog:'In Surgery',emerg:'Emergency',clean:'Cleaning',maint:'Maintenance'};
    const STC={avail:'#15803d',prep:'#1d4ed8',prog:'#e06c1f',emerg:'#dc2626',clean:'#b7791f',maint:'#64748b'};
    const SURGEONS=['Dr. A. Mehta','Dr. S. Kapoor','Dr. R. Nair','Dr. L. Khan','Dr. P. Rao','Dr. V. Iyer'];
    const ANESTH=['Dr. K. Menon','Dr. T. Bose','Dr. M. Shah'];
    const NURSES=['N. Fernandes','N. Pillai','N. Sharma','N. Das','N. Reddy'];
    const PROCS=['Coronary Bypass (CABG)','Total Knee Replacement','Craniotomy','Appendectomy','Cholecystectomy','Hip Replacement','Cataract Surgery','C-Section','Spinal Fusion','Hernia Repair','Angioplasty','Thyroidectomy'];
    const NAMES=['Rahul Sharma','Anita Reddy','Vikram Nair','Priya Patel','Suresh Gupta','Meera Singh','Arjun Menon','Kavya Das','Deepak Joshi','Neha Verma','Rohan Iyer','Sana Khan'];
    const AVC=['#475569','#0f766e','#1e40af','#4338ca','#0e7490','#334155','#3f6212','#7c2d12'];
    const STAGES=['Patient Prepared','Shifted to OT','Anesthesia Started','Surgery Started','Critical Procedure','Closure','Recovery','Shift to ICU / Ward'];
    const ROOMS=[['OT-01','General','avail'],['OT-02','General','prep'],['OT-03','General','prog'],['OT-04','General','clean'],['Emergency OT','Emergency','emerg'],['Cardiac OT','Cardiac','prog'],['Orthopedic OT','Orthopedic','prog'],['Neuro OT','Neuro','maint']];
    const initials=n=>n.split(' ').map(x=>x[0]).join('').slice(0,2);

    // Progress/stage/duration were Math.random() on every load; frozen to a fixed
    // opening state so the (now static-HTML) initial markup stays in sync. The live
    // tick() simulation below still advances o.progress/o.stage upward from here.
    const FROZEN_PROGRESS={2:55,4:68,5:42,6:77};
    const FROZEN_STAGE={2:4,4:5,5:3,6:5};
    const FROZEN_DUR={1:95,2:140,4:180,5:200,6:110};
    let OTS=ROOMS.map((r,i)=>{
        const busy=r[2]==='prog'||r[2]==='emerg';
        const o={ id:i, room:r[0], type:r[1], status:r[2], sterile:r[2]==='maint'?'Pending':'Sterile', equip:r[2]==='maint'?'Servicing':'Ready', emergency:r[2]==='emerg', av:AVC[i%AVC.length] };
        if(busy||r[2]==='prep'){
            o.patient=NAMES[i%NAMES.length]; o.mrn='MRN-'+(60700+i); o.proc=PROCS[i%PROCS.length];
            o.surgeon=SURGEONS[i%SURGEONS.length]; o.anesth=ANESTH[i%ANESTH.length]; o.nurse=NURSES[i%NURSES.length];
            o.start=['08:15','09:00','07:30','10:20'][i%4]; o.eta=['11:30','12:15','10:45','13:00'][i%4];
            o.progress=busy?FROZEN_PROGRESS[i]:0; o.stage=busy?FROZEN_STAGE[i]:1; o.prio=o.emergency?'Emergency':['High','Medium','Routine'][i%3]; o.dur=FROZEN_DUR[i];
        }
        return o;
    });
    let focusId=OTS.find(o=>o.status==='prog')?.id ?? 0;
    const sel=new Set();

    /* ============ HERO COUNTS ============ */
    function updateCounts(){
        const c=s=>OTS.filter(o=>o.status===s).length;
        $('#ot-h-active').textContent=c('prog')+c('emerg'); $('#ot-h-surg').textContent=c('prog')+c('emerg');
        $('#ot-h-avail').textContent=c('avail'); $('#ot-h-emerg').textContent=c('emerg');
    }

    /* ============ OVERVIEW ============ */
    function trendSvg(data,color){ const w=54,h=18,mn=Math.min(...data),mx=Math.max(...data),rg=(mx-mn)||1; const pts=data.map((v,i)=>`${(i/(data.length-1))*w},${h-((v-mn)/rg)*h}`).join(' '); return `<svg class="ot-trend" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round"/></svg>`; }
    function renderOverview(){
        const c=s=>OTS.filter(o=>o.status===s).length;
        const W=[
            ['Total OT Rooms',OTS.length,100,'#0d9488','icon-layout-grid',[8,8,8,8,8,8]],
            ['Active Rooms',c('prog')+c('emerg'),56,'#e06c1f','icon-activity',[3,4,3,5,4,c('prog')+c('emerg')]],
            ['Available',c('avail'),25,'#15803d','icon-circle-check',[3,2,3,2,2,c('avail')]],
            ['Emergency OT',c('emerg'),20,'#dc2626','icon-alert-triangle',[1,0,1,2,1,c('emerg')]],
            ['Completed Today',18,80,'#1d4ed8','icon-clipboard-check',[12,14,15,16,17,18]],
            ['Avg Duration',124,68,'#7c3aed','icon-timer',[130,128,126,125,124,124]],
        ];
        $('#ot-overview').innerHTML=W.map((w,i)=>`
          <div class="ot-card p-3.5">
            <div class="flex items-start justify-between">
              <span class="ot-iconbadge w-9 h-9" style="color:${w[3]}"><i class="${w[4]}"></i></span>
              <div class="relative w-11 h-11"><svg viewBox="0 0 36 36" class="ot-ring w-11 h-11"><circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--ot-track)" stroke-width="3.2"/><circle class="bar" cx="18" cy="18" r="15.9" fill="none" stroke="${w[3]}" stroke-width="3.2" stroke-linecap="round" pathLength="100" style="--p:${w[2]}"/></svg><span class="absolute inset-0 flex items-center justify-center text-[9px] font-bold" style="color:${w[3]}">${w[2]}%</span></div>
            </div>
            <p class="text-2xl font-bold ot-head mt-2 tabular-nums">${w[1]}${i===5?'<span class="text-sm ot-mut"> min</span>':''}</p>
            <div class="flex items-center justify-between mt-1"><p class="text-[11px] ot-mut">${w[0]}</p>${trendSvg(w[5],w[3])}</div>
          </div>`).join('');
    }
    function animateRings(){ $$('.ot-ring .bar').forEach(b=>{ const p=b.style.getPropertyValue('--p'); b.style.setProperty('--p','0'); requestAnimationFrame(()=>requestAnimationFrame(()=>b.style.setProperty('--p',p))); }); }

    /* ============ OT CONTROL BOARD ============ */
    function renderLegend(){ $('#ot-legend').innerHTML=Object.keys(STLABEL).map(k=>`<span class="flex items-center gap-1.5 ot-mut"><span class="ot-dot" style="background:${STC[k]}"></span>${STLABEL[k]}</span>`).join(''); }
    function roomCard(o){
        const sc=STC[o.status], stcls='st-'+o.status;
        const busy=o.status==='prog'||o.status==='emerg'||o.status==='prep';
        return `<div class="ot-room ${stcls}" data-room="${o.id}">
            <div class="flex items-center justify-between mb-1.5">
                <label onclick="event.stopPropagation()" class="flex items-center gap-1.5"><input type="checkbox" data-sel="${o.id}" ${sel.has(o.id)?'checked':''} class="accent-[var(--ot-c)]"><span class="text-sm font-bold ot-head">${o.room}</span></label>
                <span class="statpill ot-chip">${o.emergency?'<i class="icon-alert-triangle text-[9px]"></i> ':''}${STLABEL[o.status]}</span>
            </div>
            ${busy?`<div class="flex items-center gap-2">
                <span class="ot-avatar flex-none" style="width:32px;height:32px;background:${o.av};font-size:11px">${initials(o.patient)}</span>
                <div class="min-w-0 flex-1"><p class="text-sm font-semibold ot-head truncate">${o.patient}</p><p class="text-[10px] ot-mut truncate">${o.proc}</p></div>
                <button data-menu="${o.id}" onclick="event.stopPropagation()" class="w-6 h-6 rounded-md hover:bg-[var(--ot-hover)] flex items-center justify-center ot-mut"><i class="icon-more-vertical text-sm"></i></button>
            </div>
            <div class="flex items-center justify-between text-[10px] ot-mut mt-1.5"><span><i class="icon-stethoscope text-[10px]"></i> ${o.surgeon.split('. ')[1]||o.surgeon}</span><span>${o.start} → ${o.eta}</span></div>
            ${o.progress>0?`<div class="flex items-center gap-2 mt-1.5"><div class="ot-stab flex-1"><span style="width:${o.progress}%;background:${sc}"></span></div><span class="text-[10px] font-bold" style="color:${sc}">${o.progress}%</span></div><p class="text-[10px] ot-mut mt-1">Phase: ${STAGES[o.stage]}</p>`:'<p class="text-[10px] ot-mut mt-2">Preparing theater...</p>'}`
            :`<div class="flex flex-col items-center justify-center py-3 text-center">
                <i class="icon-${o.status==='avail'?'circle-check':o.status==='clean'?'spray-can':'wrench'} text-2xl" style="color:${sc}"></i>
                <p class="text-[11px] ot-mut mt-1">${o.type} · ${o.status==='avail'?'Ready for allocation':o.status==='clean'?'Turnover cleaning':'Under maintenance'}</p>
                <button data-menu="${o.id}" onclick="event.stopPropagation()" class="absolute top-2.5 right-2.5 w-6 h-6 rounded-md hover:bg-[var(--ot-hover)] flex items-center justify-center ot-mut"><i class="icon-more-vertical text-sm"></i></button>
            </div>`}
            <div class="flex items-center justify-between mt-2 pt-2 border-t text-[10px]" style="border-color:var(--ot-border)">
                <span class="ot-mut"><i class="icon-shield-check text-[10px]" style="color:${o.sterile==='Sterile'?'#15803d':'#b7791f'}"></i> ${o.sterile}</span>
                <span class="ot-mut"><i class="icon-cpu text-[10px]"></i> ${o.equip}</span>
            </div>
            <div class="prev mt-1.5"><p class="text-[10px] ot-mut">${busy?'Anesthetist: '+o.anesth+' · Nurse: '+o.nurse:'Last used 40 min ago · turnover avg 22 min'}</p></div>
        </div>`;
    }
    function renderBoard(){ $('#ot-board').innerHTML=OTS.map(roomCard).join(''); }

    /* ============ WORKFLOW ============ */
    function renderWorkflow(){
        const o=OTS.find(x=>x.id===focusId)||OTS.find(x=>x.status==='prog'); if(!o||!o.proc){ $('#ot-wf-room').textContent='—'; $('#ot-workflow').innerHTML='<p class="text-sm ot-mut text-center py-4">Select an active theater.</p>'; return; }
        $('#ot-wf-room').textContent=o.room; const cur=o.stage||0;
        $('#ot-workflow').innerHTML=`<div class="space-y-0">`+STAGES.map((s,i)=>{
            const state=i<cur?'done':i===cur?'active':'';
            const pct=i<cur?100:i===cur?o.progress||60:0;
            return `<div class="ot-stage ${state} flex gap-3 ${i<STAGES.length-1?'pb-3':''}">
                <div class="flex flex-col items-center"><div class="ot-stage-dot">${i<cur?'<i class="icon-check text-[13px]"></i>':i+1}</div>${i<STAGES.length-1?`<div class="w-0.5 flex-1 mt-1" style="background:${i<cur?'var(--ot-accent)':'var(--ot-border)'}"></div>`:''}</div>
                <div class="flex-1 pb-1"><div class="flex items-center justify-between"><p class="text-sm font-medium ${state?'ot-head':'ot-mut'}">${s}</p>${i===cur?`<span class="ot-npill">In progress</span>`:i<cur?`<span class="text-[10px]" style="color:var(--ot-accent)">Done</span>`:''}</div>${state?`<div class="ot-stab mt-1.5"><span style="width:${pct}%;background:var(--ot-accent)"></span></div>`:''}</div>
            </div>`;
        }).join('')+`</div>`;
    }

    /* ============ SCHEDULE BOARD ============ */
    let schedView='timeline';
    // Duration was Math.random() on every load; frozen to a fixed set for a
    // deterministic static-HTML schedule board.
    const FROZEN_SCHED_DUR=[1,2,1,3,2,1,2,3];
    const SCHED=OTS.filter(o=>o.proc).concat(Array.from({length:8},(_,k)=>{ const i=k+20; return { id:100+k, room:ROOMS[k%8][0], patient:NAMES[i%NAMES.length], proc:PROCS[i%PROCS.length], surgeon:SURGEONS[i%SURGEONS.length], startH:8+k, dur:FROZEN_SCHED_DUR[k], prio:['High','Medium','Routine'][i%3], status:'Scheduled', av:AVC[i%AVC.length] }; }));
    function renderSchedule(){
        const host=$('#ot-schedule');
        if(schedView==='timeline'||schedView==='daily'){
            const hours=['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00'];
            const rooms=ROOMS.map(r=>r[0]);
            host.innerHTML=`<div class="ot-sched-grid" style="--cols:${rooms.length}">
                <div class="ot-sched-cell !border-b-2 flex items-center justify-center text-[10px] ot-mut font-semibold" style="min-height:32px">Time</div>
                ${rooms.map(r=>`<div class="ot-sched-cell !border-b-2 flex items-center justify-center text-[10px] font-semibold ot-head" style="min-height:32px">${r}</div>`).join('')}
                ${hours.map((h,hi)=>`<div class="ot-sched-cell flex items-center justify-center text-[10px] ot-mut">${h}</div>${rooms.map((r,ri)=>{
                    const blk=SCHED.find(s=>s.room===r&&((s.startH||8)-8)===hi);
                    return `<div class="ot-sched-cell">${blk?`<div class="ot-sched-block" data-sched="${blk.id}" style="top:2px;height:${(blk.dur||1)*44-6}px;background:${blk.prio==='High'?'#e06c1f':blk.prio==='Emergency'?'#dc2626':'#0f766e'}"><p class="font-semibold truncate">${blk.proc.split(' ')[0]}</p><p class="opacity-80 truncate">${(blk.surgeon||'').split('. ')[1]||''}</p></div>`:''}</div>`;
                }).join('')}`).join('')}</div>`;
        } else if(schedView==='weekly'){
            const days=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
            host.innerHTML=`<div class="grid grid-cols-1 md:grid-cols-7 gap-2">${days.map((d,di)=>`<div class="ot-panel p-2.5"><p class="text-xs font-bold ot-head mb-2">${d}</p><div class="space-y-1.5">${SCHED.filter((_,i)=>i%7===di).slice(0,3).map(s=>`<div class="rounded-md p-1.5 text-[10px]" style="background:color-mix(in srgb,${s.prio==='High'?'#e06c1f':'#0f766e'} 12%,transparent);border-left:2px solid ${s.prio==='High'?'#e06c1f':'#0f766e'}"><p class="font-semibold ot-head truncate">${s.proc.split(' ')[0]}</p><p class="ot-mut truncate">${s.room}</p></div>`).join('')||'<p class="text-[10px] ot-mut">—</p>'}</div></div>`).join('')}</div>`;
        } else {
            host.innerHTML=`<div class="grid grid-cols-2 md:grid-cols-4 gap-3">${OTS.map(o=>`<div class="ot-panel p-3"><div class="flex items-center justify-between mb-1"><span class="text-sm font-bold ot-head">${o.room}</span><span class="ot-chip" style="background:color-mix(in srgb,${STC[o.status]} 13%,transparent);color:${STC[o.status]}">${STLABEL[o.status]}</span></div><p class="text-[11px] ot-mut">${o.type} OT</p><p class="text-[11px] ot-mut mt-1">${o.status==='avail'?'Free now':o.proc?'Until '+o.eta:'—'}</p></div>`).join('')}</div>`;
        }
    }

    /* ============ TEAM ============ */
    function renderTeam(){
        const av=(nm,i)=>`<span class="ot-avatar flex-none" style="width:36px;height:36px;background:${AVC[i%AVC.length]};font-size:12px">${initials(nm)}</span>`;
        const surg=[['Dr. A. Mehta','Cardiac Surgery',3,'18y','In Surgery','Cardiac OT','#e06c1f'],['Dr. R. Nair','Orthopedics',2,'12y','Available','—','#15803d'],['Dr. S. Kapoor','Neurosurgery',1,'15y','Scrubbing','Neuro OT','#1d4ed8']];
        const anes=[['Dr. K. Menon','CABG · Cardiac OT','2 rooms','Active','#e06c1f'],['Dr. T. Bose','Standby','1 room','Available','#15803d']];
        const nur=[['N. Fernandes','Cardiac OT','Day','Scrubbed','#e06c1f'],['N. Das','OT-03','Day','Available','#15803d']];
        $('#ot-team').innerHTML=`
            <div><p class="text-[11px] font-bold ot-mut uppercase tracking-wide mb-2">Surgeons</p><div class="grid sm:grid-cols-3 gap-2">
            ${surg.map((x,i)=>`<div class="ot-panel p-3"><div class="flex items-center gap-2.5">${av(x[0],i)}<div class="min-w-0 flex-1"><p class="text-sm font-semibold ot-head truncate">${x[0]}</p><p class="text-[10px] ot-mut">${x[1]}</p></div><span class="ot-chip" style="background:color-mix(in srgb,${x[6]} 13%,transparent);color:${x[6]}">${x[4]}</span></div><div class="flex justify-between text-[10px] ot-mut mt-2"><span>${x[2]} today · ${x[3]}</span><span>${x[5]}</span></div></div>`).join('')}
            </div></div>
            <div class="grid sm:grid-cols-2 gap-3">
                <div><p class="text-[11px] font-bold ot-mut uppercase tracking-wide mb-2">Anesthesiologists</p><div class="space-y-2">${anes.map((x,i)=>`<div class="ot-panel p-3"><div class="flex items-center gap-2.5">${av(x[0],i+3)}<div class="min-w-0 flex-1"><p class="text-sm font-semibold ot-head truncate">${x[0]}</p><p class="text-[10px] ot-mut truncate">${x[1]} · ${x[2]}</p></div><span class="ot-chip" style="background:color-mix(in srgb,${x[4]} 13%,transparent);color:${x[4]}">${x[3]}</span></div></div>`).join('')}</div></div>
                <div><p class="text-[11px] font-bold ot-mut uppercase tracking-wide mb-2">OT Nurses</p><div class="space-y-2">${nur.map((x,i)=>`<div class="ot-panel p-3"><div class="flex items-center gap-2.5">${av(x[0],i+5)}<div class="min-w-0 flex-1"><p class="text-sm font-semibold ot-head truncate">${x[0]}</p><p class="text-[10px] ot-mut truncate">${x[1]} · ${x[2]}</p></div><span class="ot-chip" style="background:color-mix(in srgb,${x[4]} 13%,transparent);color:${x[4]}">${x[3]}</span></div></div>`).join('')}</div></div>
            </div>`;
    }

    /* ============ EQUIPMENT ============ */
    // Maintenance day was Math.random() on every load; frozen to a fixed set for
    // a deterministic static-HTML equipment list.
    const FROZEN_MAINT=[12,15,10,18,14,11,16,13];
    function renderEquipment(){
        const eq=[['Anesthesia Machine','ANES-04','Cardiac OT','In Use','#e06c1f'],['Surgical Lights','LGT-11','OT-03','In Use','#e06c1f'],['OT Table','TBL-07','Neuro OT','Idle','#64748b'],['Ventilator','VNT-09','Cardiac OT','In Use','#e06c1f'],['ECG Monitor','MON-15','OT-03','In Use','#e06c1f'],['Defibrillator','DEF-03','Standby','Ready','#15803d'],['Electrocautery','ECU-06','Ortho OT','In Use','#e06c1f'],['Suction Machine','SUC-12','Store','Ready','#15803d']];
        $('#ot-equipment').innerHTML=eq.map((e,i)=>`<div class="ot-panel p-3">
            <div class="flex items-center justify-between mb-1"><span class="text-sm font-semibold ot-head flex items-center gap-1.5"><span class="ot-iconbadge w-7 h-7" style="color:${e[4]}"><i class="icon-cpu text-sm"></i></span> ${e[0]}</span><span class="ot-chip" style="background:color-mix(in srgb,${e[4]} 13%,transparent);color:${e[4]}">${e[3]}</span></div>
            <div class="flex justify-between text-[11px] ot-mut mt-1"><span>${e[1]} · ${e[2]}</span><span><i class="icon-shield-check text-[11px]" style="color:#15803d"></i> Sterile</span></div>
            <p class="text-[10px] ot-mut mt-1">Last maintenance: Jul ${FROZEN_MAINT[i]}</p>
        </div>`).join('');
    }

    /* ============ ANALYTICS ============ */
    function bars(rows){ return rows.map(r=>`<div><div class="flex justify-between text-[11px] mb-1"><span class="ot-head font-medium">${r[0]}</span><span class="ot-mut">${r[1]}%</span></div><div class="ot-stab"><span style="width:${r[1]}%;background:${r[2]}"></span></div></div>`).join(''); }
    function renderAnalytics(){
        const util=[68,74,71,80,77,84,79,86];
        $('#ot-analytics').innerHTML=`
            <div class="ot-panel p-3">
                <div class="flex items-center justify-between mb-1"><p class="text-xs font-bold ot-head">Room Utilization · 8 days</p><span class="ot-chip" style="background:color-mix(in srgb,#0f766e 13%,transparent);color:#0f766e">79% avg</span></div>
                <svg class="w-full h-14" viewBox="0 0 280 56" preserveAspectRatio="none"><defs><linearGradient id="otg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0d9488" stop-opacity=".28"/><stop offset="100%" stop-color="#0d9488" stop-opacity="0"/></linearGradient></defs><polygon points="0,56 ${util.map((v,i)=>`${i/(util.length-1)*280},${56-(v/100*50)}`).join(' ')} 280,56" fill="url(#otg)"/><polyline points="${util.map((v,i)=>`${i/(util.length-1)*280},${56-(v/100*50)}`).join(' ')}" fill="none" stroke="#0d9488" stroke-width="2"/></svg>
            </div>
            <div class="grid sm:grid-cols-2 gap-3">
                <div class="ot-panel p-3"><p class="text-xs font-bold ot-head mb-2">Surgery Types</p>${bars([['Orthopedic',34,'#e06c1f'],['Cardiac',26,'#dc2626'],['General',22,'#0f766e'],['Neuro',18,'#1d4ed8']])}</div>
                <div class="ot-panel p-3"><p class="text-xs font-bold ot-head mb-2">Department Utilization</p>${bars([['Cardiac OT',88,'#dc2626'],['Ortho OT',76,'#e06c1f'],['General',64,'#0f766e'],['Neuro',52,'#1d4ed8']])}</div>
                <div class="ot-panel p-3"><p class="text-xs font-bold ot-head mb-2">Turnaround Time</p>${bars([['< 20 min',62,'#15803d'],['20–40 min',28,'#b7791f'],['> 40 min',10,'#dc2626']])}</div>
                <div class="ot-panel p-3"><p class="text-xs font-bold ot-head mb-2">Surgery Success</p>${bars([['Successful',96,'#15803d'],['Complications',3,'#b7791f'],['Re-operation',1,'#dc2626']])}</div>
            </div>`;
    }

    /* ============ ACTIVITY ============ */
    const ACTS=[
        ['Surgery Scheduled','CABG · Cardiac OT · 08:15','icon-calendar-plus','#0e7490'],
        ['Surgery Started','Knee Replacement · OT-03','icon-slice','#e06c1f'],
        ['OT Prepared','Neuro OT · sterile','icon-spray-can','#1d4ed8'],
        ['Equipment Checked','Anesthesia machine · OK','icon-cpu','#7c3aed'],
        ['Sterility Completed','OT-02 · verified','icon-shield-check','#15803d'],
        ['Surgery Completed','Appendectomy · OT-01','icon-circle-check','#15803d'],
        ['Recovery Started','C-Section · Ward 2','icon-heart','#15803d'],
        ['Patient Shifted','CABG → Cardiac ICU','icon-bed','#64748b'],
    ];
    // "Xm ago" was Math.random() on every load; frozen to a fixed descending set
    // for a deterministic static-HTML activity feed.
    const FROZEN_ACT_AGO=[3,9,14,22,28,35,44,52];
    function renderActivity(){ $('#ot-activity').innerHTML=ACTS.map((a,i)=>`<div class="ot-panel p-3 flex items-start gap-2.5"><span class="ot-iconbadge w-8 h-8 flex-none" style="color:${a[3]}"><i class="${a[2]}"></i></span><div class="min-w-0"><p class="text-sm font-semibold ot-head">${a[0]}</p><p class="text-[11px] ot-mut truncate">${a[1]}</p><p class="text-[10px] ot-mut mt-0.5">${FROZEN_ACT_AGO[i]}m ago</p></div></div>`).join(''); }

    /* ============ DRAWER ============ */
    function openDrawer(id){
        const o=OTS.find(x=>x.id===id); if(!o) return; const sc=STC[o.status];
        const box=(t,ic,body)=>`<div class="ot-panel p-3"><p class="text-[11px] font-bold ot-mut uppercase tracking-wide mb-2 flex items-center gap-1.5"><i class="${ic} ot-hicon text-[13px]"></i> ${t}</p>${body}</div>`;
        const row=(k,v)=>`<div class="flex justify-between text-xs py-0.5"><span class="ot-mut">${k}</span><span class="font-medium ot-head">${v}</span></div>`;
        const chk=(items)=>items.map(x=>`<label class="flex items-center gap-2 text-xs py-0.5 ot-head"><input type="checkbox" class="accent-[var(--ot-c)]" ${x[1]?'checked':''}> ${x[0]}</label>`).join('');
        const busy=!!o.proc;
        $('#ot-drawer').innerHTML=`
          <div class="p-4 border-b sticky top-0 z-10 flex items-center justify-between" style="background:var(--ot-elev);border-color:var(--ot-border)">
            <div class="flex items-center gap-3"><span class="ot-iconbadge w-11 h-11 flex-none" style="color:${sc};background:color-mix(in srgb,${sc} 12%,transparent)"><i class="icon-layout-grid text-lg"></i></span><div><p class="font-bold ot-head">${o.room}</p><p class="text-[11px] ot-mut">${o.type} OT · ${STLABEL[o.status]}</p></div></div>
            <button data-close class="w-8 h-8 rounded-lg hover:bg-[var(--ot-hover)] flex items-center justify-center ot-mut"><i class="icon-x"></i></button>
          </div>
          <div class="p-4 space-y-3">
            ${busy?`<div class="ot-panel p-3" style="border-left:3px solid ${sc}"><div class="flex items-center justify-between mb-1"><span class="text-sm font-semibold ot-head">Surgery Progress</span><span class="text-sm font-bold" style="color:${sc}">${o.progress}%</span></div><div class="ot-stab"><span style="width:${o.progress}%;background:${sc}"></span></div><p class="text-[11px] ot-mut mt-1">${STAGES[o.stage]} · ${o.start} → ${o.eta}</p></div>`:''}
            ${busy?box('Patient Information','icon-user',`<div class="flex items-center gap-2 mb-1.5"><span class="ot-avatar" style="width:34px;height:34px;background:${o.av};font-size:12px">${initials(o.patient)}</span><div><p class="text-sm font-semibold ot-head">${o.patient}</p><p class="text-[11px] ot-mut">${o.mrn}</p></div></div>`+row('Diagnosis',o.proc.split('(')[0])+row('Priority',o.prio)):box('Room Status','icon-info',row('Type',o.type)+row('Status',STLABEL[o.status])+row('Availability',o.status==='avail'?'Free now':'Occupied'))}
            ${busy?box('Surgery Information','icon-slice',row('Procedure',o.proc)+row('Start',o.start)+row('Est. Completion',o.eta)+row('Duration',o.dur+' min')):''}
            ${busy?box('Surgical Team','icon-users',row('Surgeon',o.surgeon)+row('Assistant','Dr. V. Iyer')+row('Anesthesiologist',o.anesth)+row('OT Nurse',o.nurse)):''}
            ${box('Equipment Checklist','icon-cpu',chk([['Anesthesia machine',1],['Surgical lights',1],['OT table',1],['Electrocautery',busy?1:0],['Suction ready',busy?1:0]]))}
            ${box('Sterility Checklist','icon-shield-check',chk([['Instruments autoclaved',1],['Sterile drapes',1],['Air filtration verified',1],['Surface disinfection',o.sterile==='Sterile'?1:0]]))}
            ${box('Surgical Notes','icon-notebook','<p class="text-xs ot-mut">'+(busy?'Procedure progressing without complication. Vitals stable.':'Theater idle — ready per protocol.')+'</p>')}
            ${busy?box('Recovery Plan','icon-heart-pulse',row('Destination','Cardiac ICU')+row('Monitoring','Continuous 24h')+row('Surgeon Review','Post-op 2h')):''}
            <div class="grid grid-cols-2 gap-2">
                ${busy?`<button data-action="pause" data-oid="${o.id}" class="ot-btn ot-btn-ghost justify-center"><i class="icon-pause"></i> Pause</button><button data-action="complete" data-oid="${o.id}" class="ot-btn ot-btn-primary justify-center"><i class="icon-circle-check"></i> Complete</button>`:`<button data-modal="schedule" class="ot-btn ot-btn-ghost justify-center"><i class="icon-calendar-plus"></i> Schedule</button><button data-modal="allocate" class="ot-btn ot-btn-primary justify-center"><i class="icon-layout-grid"></i> Allocate</button>`}
                <button data-modal="equipment" class="ot-btn ot-btn-ghost justify-center"><i class="icon-cpu"></i> Equipment</button>
                <button data-modal="sterility" class="ot-btn ot-btn-ghost justify-center"><i class="icon-shield-check"></i> Sterility</button>
            </div>
          </div>`;
        $('#ot-drawer').classList.add('open');
        document.body.style.overflow='hidden';
    }
    function closeDrawer(){ $('#ot-drawer').classList.remove('open'); document.body.style.overflow=''; }

    /* ============ MENU ============ */
    const ACTIONS=[['View Surgery','icon-eye','view'],['Edit Surgery','icon-edit','schedule'],['Assign OT','icon-layout-grid','allocate'],['Assign Surgeon','icon-stethoscope','surgeon'],['Assign Nurse','icon-user-check','nurse'],['Assign Anesthesiologist','icon-syringe','anesth'],['View Patient','icon-user','patient'],['Medical History','icon-history','history'],['sep'],['Start Surgery','icon-play','start'],['Pause Surgery','icon-pause','pause'],['Complete Surgery','icon-circle-check','complete'],['Transfer to Recovery','icon-heart-pulse','recovery'],['sep'],['Print Report','icon-printer','print'],['Download PDF','icon-file-down','pdf'],['Archive','icon-archive','archive'],['Delete','icon-trash-2','delete']];
    function openMenu(id,x,y){ closeMenu(); $('#ot-menuhost').innerHTML=`<div class="ot-menu" id="ot-openmenu">${ACTIONS.map(a=>a[0]==='sep'?'<div class="ot-menu-sep"></div>':`<button data-action="${a[2]}" data-oid="${id}" class="${a[2]==='delete'?'danger':''}"><i class="${a[1]}"></i> ${a[0]}</button>`).join('')}</div>`; const m=$('#ot-openmenu'); const r=m.getBoundingClientRect(); m.style.left=Math.max(12,Math.min(x,window.innerWidth-r.width-12))+'px'; m.style.top=Math.max(12,Math.min(y,window.innerHeight-r.height-12))+'px'; }
    function closeMenu(){ $('#ot-menuhost').innerHTML=''; }

    /* ============ MODALS ============ */
    const fld=(l,el)=>`<div><label class="ot-formlabel">${l}</label>${el}</div>`;
    const inp=(ph)=>`<input class="ot-in mt-1" placeholder="${ph||''}">`;
    const selE=(o)=>`<select class="ot-in mt-1">${o.map(x=>`<option>${x}</option>`).join('')}</select>`;
    const drop=(t)=>`<div class="ot-drop rounded-xl h-28 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[var(--ot-hover)]"><i class="icon-cloud-upload text-3xl ot-mut"></i><p class="text-sm font-semibold mt-1 ot-head">${t}</p></div>`;
    const roomOpts=OTS.map(o=>o.room+' · '+STLABEL[o.status]);
    const chkBody=(items)=>`<div class="space-y-1.5">${items.map(x=>`<label class="flex items-center gap-2 text-sm ot-head"><input type="checkbox" class="accent-[var(--ot-c)]" checked> ${x}</label>`).join('')}</div>`;
    const MODALS={
        schedule:{t:'Schedule Surgery',sub:'Book a new operation',ic:'icon-calendar-plus',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('Patient / MRN',inp('Search...'))}${fld('Procedure',selE(PROCS))}${fld('OT Room',selE(roomOpts))}${fld('Surgeon',selE(SURGEONS))}${fld('Anesthesiologist',selE(ANESTH))}${fld('OT Nurse',selE(NURSES))}${fld('Date & Time',`<input type="text" placeholder="dd-mm-yyyy --:--" class="ot-in mt-1" data-provider="flatpickr" data-date-format="d-m-Y" data-enable-time>`)}${fld('Est. Duration (min)',inp('120'))}${fld('Priority',selE(['Routine','Medium','High','Emergency']))}</div>`,cta:'Schedule Surgery'},
        emergency:{t:'Emergency Surgery',sub:'Allocate an immediate theater',ic:'icon-alert-triangle',body:`<div class="rounded-lg p-2.5 text-xs mb-3 flex items-center gap-2" style="background:color-mix(in srgb,#dc2626 11%,transparent);color:#dc2626;border:1px solid color-mix(in srgb,#dc2626 30%,transparent)"><i class="icon-alert-triangle"></i> Assigns the nearest available emergency OT.</div><div class="grid sm:grid-cols-2 gap-3">${fld('Patient / Unknown',inp('Name or "Unknown"'))}${fld('Procedure',selE(PROCS))}${fld('OT',selE(['Auto — Emergency OT','OT-01','OT-02']))}${fld('Surgeon On-call',selE(SURGEONS))}</div>`,cta:'Activate Emergency OT'},
        allocate:{t:'Allocate OT',sub:'Assign a theater to a case',ic:'icon-layout-grid',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('OT Room',selE(roomOpts))}${fld('Case / Patient',inp('Search...'))}${fld('Slot',selE(['08:00','10:00','12:00','14:00']))}${fld('Duration',inp('120 min'))}</div>`,cta:'Allocate OT'},
        team:{t:'Assign Surgical Team',sub:'Compose the OT team',ic:'icon-users',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('OT Room',selE(roomOpts))}${fld('Lead Surgeon',selE(SURGEONS))}${fld('Assistant Surgeon',selE(SURGEONS))}${fld('Anesthesiologist',selE(ANESTH))}${fld('Scrub Nurse',selE(NURSES))}${fld('Circulating Nurse',selE(NURSES))}</div>`,cta:'Assign Team'},
        surgeon:{t:'Assign Surgeon',sub:'Attach a surgeon',ic:'icon-stethoscope',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('OT / Case',selE(roomOpts))}${fld('Surgeon',selE(SURGEONS))}${fld('Role',selE(['Lead','Assistant']))}${fld('Shift',selE(['Day','Night']))}</div>`,cta:'Assign Surgeon'},
        nurse:{t:'Assign Nurse',sub:'Assign OT nursing',ic:'icon-user-check',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('OT / Case',selE(roomOpts))}${fld('Nurse',selE(NURSES))}${fld('Role',selE(['Scrub','Circulating']))}${fld('Shift',selE(['Day','Night']))}</div>`,cta:'Assign Nurse'},
        anesth:{t:'Assign Anesthesiologist',sub:'Attach anesthesia cover',ic:'icon-syringe',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('OT / Case',selE(roomOpts))}${fld('Anesthesiologist',selE(ANESTH))}${fld('Technique',selE(['General','Regional','Local','Spinal']))}${fld('Shift',selE(['Day','Night']))}</div>`,cta:'Assign'},
        equipment:{t:'Equipment Checklist',sub:'Verify theater equipment',ic:'icon-cpu',body:`<div class="mb-3">${fld('OT Room',selE(roomOpts))}</div><p class="text-[11px] font-semibold ot-mut uppercase mb-2">Checklist</p>${chkBody(['Anesthesia machine','Surgical lights','OT table','Ventilator','ECG monitor','Defibrillator','Electrocautery','Suction machine'])}`,cta:'Confirm Equipment'},
        sterility:{t:'Sterility Checklist',sub:'Confirm sterility protocol',ic:'icon-shield-check',body:`<div class="mb-3">${fld('OT Room',selE(roomOpts))}</div><p class="text-[11px] font-semibold ot-mut uppercase mb-2">Checklist</p>${chkBody(['Instruments autoclaved','Sterile drapes applied','Air filtration verified','Surface disinfection','Team scrubbed & gowned','Sterile field confirmed'])}`,cta:'Confirm Sterility'},
        import:{t:'Import',sub:'Bulk-load schedule or OT config',ic:'icon-upload',body:`<div class="flex gap-2 mb-3">${['CSV','Excel','Surgery Schedule','OT Configuration'].map(f=>`<span class="ot-npill">${f}</span>`).join('')}</div>${drop('Drop CSV / Excel file')}<button class="text-xs font-semibold text-[color:var(--ot-accent)] hover:underline mt-2"><i class="icon-download"></i> Download sample template</button><div class="mt-3 rounded-lg p-3 text-xs flex items-center gap-2" style="background:color-mix(in srgb,#15803d 11%,transparent);color:#15803d;border:1px solid color-mix(in srgb,#15803d 28%,transparent)"><i class="icon-circle-check"></i> Validation passed · 19 surgeries · 0 errors</div>`,cta:'Import'},
        export:{t:'Export',sub:'Generate an OT report',ic:'icon-download',body:`<p class="text-xs ot-mut mb-2">Choose a format &amp; scope</p><div class="grid grid-cols-2 gap-2">${['CSV','Excel','PDF','Print','Surgery Report','OT Utilization Report','Surgeon Report','Equipment Report','Selected Records','All Records'].map(f=>`<button data-expfmt="${f}" class="ot-btn ot-btn-ghost justify-center">${f}</button>`).join('')}</div>`,cta:'Export'},
    };
    const SIMPLE={patient:'Loading patient...',history:'Opening history...',start:'Surgery started',recovery:'Transferred to recovery',print:'Printing report...',pdf:'PDF downloaded',archive:'Record archived'};
    function openModal(key){ const m=MODALS[key]; if(!m) return; document.body.style.overflow='hidden'; $('#ot-modalhost').innerHTML=`<div class="ot-modal-wrap open"><div class="ot-modal-bg" data-close></div><div class="ot-modal">
        <div class="ot-modal-head"><span class="ot-modal-badge"><i class="${m.ic}"></i></span><div class="min-w-0"><h3 class="font-bold ot-head leading-tight">${m.t}</h3><p class="text-[11px] ot-mut">${m.sub||''}</p></div><button data-close class="ml-auto w-8 h-8 rounded-lg hover:bg-[var(--ot-hover)] flex items-center justify-center ot-mut"><i class="icon-x"></i></button></div>
        <div class="ot-modal-body">${m.body}</div>
        <div class="ot-modal-foot"><button data-close class="ot-btn ot-btn-ghost">Cancel</button><button data-modalok="${key}" class="ot-btn ot-btn-primary"><i class="${m.ic}"></i> ${m.cta}</button></div>
    </div></div>`;
        // Modal HTML is injected after the page's initial-load flatpickr auto-init has
        // already run, so any date fields inside it must be initialized here instead.
        if(typeof flatpickr!=="undefined"){
            $$('[data-provider="flatpickr"]',$('#ot-modalhost')).forEach(function(el){
                if(el._flatpickr) return;
                const config={disableMobile:true};
                if(el.hasAttribute('data-date-format')) config.dateFormat=el.getAttribute('data-date-format');
                if(el.hasAttribute('data-enable-time')){ config.enableTime=true; config.dateFormat=(config.dateFormat||'Y-m-d')+' H:i'; }
                flatpickr(el,config);
            });
        }
    }
    function openDelete(msg,onOk){ document.body.style.overflow='hidden'; $('#ot-modalhost').innerHTML=`<div class="ot-modal-wrap open"><div class="ot-modal-bg" data-close></div><div class="ot-modal" style="width:min(420px,94vw)"><div class="p-5 text-center"><div class="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style="background:color-mix(in srgb,#dc2626 13%,transparent);color:#dc2626"><i class="icon-alert-triangle text-2xl"></i></div><h3 class="font-bold text-lg ot-head">Confirm</h3><p class="text-xs ot-mut mt-1">${msg}</p><div class="flex gap-2 mt-4"><button data-close class="ot-btn ot-btn-ghost flex-1 justify-center">Cancel</button><button id="ot-delok" class="ot-btn ot-btn-danger flex-1 justify-center">Delete</button></div></div></div></div>`; $('#ot-delok').onclick=()=>{ onOk(); closeModal(); }; }
    function closeModal(){ $('#ot-modalhost').innerHTML=''; if(!$('#ot-drawer').classList.contains('open')) document.body.style.overflow=''; }

    /* ============ HELPERS ============ */
    function updateBulk(){ $('#ot-selcount').textContent=sel.size; $('.ot-bulk').classList.toggle('show',sel.size>0); }
    function refreshAll(){ renderOverview(); renderBoard(); renderWorkflow(); updateCounts(); animateRings(); }
    function setFocus(id){ focusId=id; renderWorkflow(); $$('.ot-room').forEach(el=>el.classList.toggle('ring-2',false)); }

    /* ============ LIVE PROGRESS SIM ============ */
    function tick(){
        OTS.forEach(o=>{ if((o.status==='prog'||o.status==='emerg')&&o.progress<98){ o.progress=Math.min(98,o.progress+rnd(0,2)); const ns=Math.min(STAGES.length-1,Math.floor(o.progress/100*STAGES.length)); if(ns>o.stage) o.stage=ns; } });
        renderBoard(); if(OTS.some(o=>o.id===focusId)) renderWorkflow();
    }

    /* ============ EVENTS ============ */
    document.addEventListener('click',e=>{
        if(e.target.closest('[data-sv]')){ const b=e.target.closest('[data-sv]'); schedView=b.dataset.sv; $$('#ot-schedtabs button').forEach(x=>x.classList.toggle('on',x===b)); renderSchedule(); return; }
        if(e.target.closest('[data-sched]')){ const id=+e.target.closest('[data-sched]').dataset.sched; const o=OTS.find(x=>x.id===id); if(o){ setFocus(id); openDrawer(id);} else openModal('schedule'); return; }
        const t=e.target.closest('[data-room],[data-menu],[data-action],[data-modal],[data-modalok],[data-close],[data-bulk],[data-expfmt]');
        if(!t){ if(!e.target.closest('.ot-menu')) closeMenu(); return; }
        if(t.dataset.room!==undefined){ setFocus(+t.dataset.room); openDrawer(+t.dataset.room); return; }
        if(t.dataset.menu!==undefined){ const r=t.getBoundingClientRect(); openMenu(+t.dataset.menu,r.left-200,r.bottom+4); return; }
        if(t.dataset.action!==undefined){ const a=t.dataset.action, id=+t.dataset.oid; closeMenu(); const o=OTS.find(x=>x.id===id); if(o) focusId=id;
            if(a==='view'){ openDrawer(id); }
            else if(a==='start'){ if(o){o.status='prog';o.progress=o.progress||5;o.stage=3;} refreshAll(); toast('Surgery started','icon-play'); }
            else if(a==='pause'){ toast('Surgery paused','icon-pause'); }
            else if(a==='complete'){ if(o){o.status='clean';o.progress=100;o.stage=7;} refreshAll(); closeDrawer(); toast('Surgery completed · theater turnover','icon-circle-check'); }
            else if(a==='recovery'){ if(o){o.status='clean';} refreshAll(); toast('Patient transferred to recovery','icon-heart-pulse'); }
            else if(MODALS[a]) openModal(a);
            else if(a==='delete') openDelete('Remove this OT record?',()=>{ OTS=OTS.filter(x=>x.id!==id); sel.delete(id); refreshAll(); toast('Record removed','icon-trash-2'); });
            else if(SIMPLE[a]) toast(SIMPLE[a]);
            return; }
        if(t.dataset.modal!==undefined){ openModal(t.dataset.modal); return; }
        if(t.dataset.modalok!==undefined){ toast(MODALS[t.dataset.modalok].cta+' — done','icon-check'); closeModal(); return; }
        if(t.dataset.expfmt!==undefined){ toast('Exported: '+t.dataset.expfmt,'icon-download'); closeModal(); return; }
        if(t.dataset.close!==undefined){ closeModal(); closeDrawer(); return; }
        if(t.dataset.bulk!==undefined){ const bk=t.dataset.bulk;
            if(bk==='delete') openDelete(`Delete ${sel.size} selected record(s)?`,()=>{ OTS=OTS.filter(o=>!sel.has(o.id)); sel.clear(); refreshAll(); updateBulk(); toast('Records removed','icon-trash-2'); });
            else { toast({allocate:'OT allocated',team:'Team assigned',export:'Exported',print:'Printing',archive:'Archived'}[bk]+' · '+sel.size+' records'); if(bk==='archive'){ sel.clear(); refreshAll(); updateBulk(); } }
            return; }
    });
    document.addEventListener('change',e=>{ if(e.target.dataset.sel!==undefined){ const id=+e.target.dataset.sel; e.target.checked?sel.add(id):sel.delete(id); updateBulk(); } });

    function clock(){ $('#ot-clock').textContent=new Date().toLocaleTimeString('en-GB'); }

    /* ============ INIT ============ */
    // renderOverview/renderLegend/renderBoard/renderWorkflow/renderSchedule/renderTeam/
    // renderEquipment/renderAnalytics/renderActivity/updateCounts are now pre-rendered as
    // static HTML (#ot-overview, #ot-legend, #ot-board, #ot-workflow, #ot-schedule, #ot-team,
    // #ot-equipment, #ot-analytics, #ot-activity, #ot-h-active/#ot-h-surg/#ot-h-avail/#ot-h-emerg)
    // instead of being generated here on load. They still run on every later interaction
    // (room actions, tab switches, bulk actions) and the live tick() simulation below.
    setTimeout(()=>{
        $('#ot-skeleton').classList.add('hidden');
        $('#ot-content').classList.remove('hidden');
        animateRings(); clock(); setInterval(clock,1000); setInterval(tick,3000);
    },1400);
})();

// ==========================================================================
// ot-booking.js
// ==========================================================================
// Dreams HMS — OT Booking Center
// Operation theater booking/scheduling: booking board (card / timeline / list
// views), OT availability grid, booking workflow kanban, emergency booking
// panel, surgery planning summary, resource allocation and activity feed.
// Static demo data only — no API, no backend.
(function(){
    "use strict";
    if ((location.pathname.split("/").pop() || "index.html") !== "ot-booking.html") return;
    const $=(s,r)=>(r||document).querySelector(s);
    const $$=(s,r)=>Array.from((r||document).querySelectorAll(s));
    const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
    let toastT;
    function toast(msg,icon){ const t=$('#ob-toast'); t.innerHTML=`<i class="${icon||'icon-check'} text-teal-400"></i> ${msg}`; t.classList.add('show'); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove('show'),2500); }

    /* ============ DATA ============ */
    const PRIOC={emerg:'#dc2626',high:'#e06c1f',med:'#1d4ed8',routine:'#0f766e'};
    const PRIOL={emerg:'Emergency',high:'High',med:'Medium',routine:'Routine'};
    const STAGES=['Draft','Pending Approval','Approved','Scheduled','In Progress','Completed','Cancelled'];
    const STAGEC={'Draft':'#64748b','Pending Approval':'#e06c1f','Approved':'#1d4ed8','Scheduled':'#0f766e','In Progress':'#7c3aed','Completed':'#15803d','Cancelled':'#dc2626'};
    const APPROVAL={'Draft':'Not submitted','Pending Approval':'Awaiting','Approved':'Approved','Scheduled':'Approved','In Progress':'Approved','Completed':'Approved','Cancelled':'Rejected'};
    const SURGEONS=['Dr. A. Mehta','Dr. S. Kapoor','Dr. R. Nair','Dr. L. Khan','Dr. P. Rao','Dr. V. Iyer'];
    const ANESTH=['Dr. K. Menon','Dr. T. Bose','Dr. M. Shah'];
    const NURSES=['N. Fernandes','N. Pillai','N. Sharma','N. Das','N. Reddy'];
    const PROCS=['CABG','Knee Replacement','Craniotomy','Appendectomy','Cholecystectomy','Hip Replacement','C-Section','Spinal Fusion','Angioplasty','Thyroidectomy'];
    const NAMES=['Rahul Sharma','Anita Reddy','Vikram Nair','Priya Patel','Suresh Gupta','Meera Singh','Arjun Menon','Kavya Das','Deepak Joshi','Neha Verma','Rohan Iyer','Sana Khan'];
    const PHOTOS=['assets/img/avatar/avatar-01.jpg','assets/img/avatar/avatar-03.jpg','assets/img/avatar/avatar-02.jpg','assets/img/avatar/avatar-04.jpg','assets/img/avatar/avatar-06.jpg','assets/img/avatar/avatar-05.jpg','assets/img/avatar/avatar-07.jpg','assets/img/avatar/avatar-08.jpg','assets/img/avatar/avatar-11.jpg','assets/img/avatar/avatar-09.jpg','assets/img/avatar/avatar-12.jpg','assets/img/avatar/avatar-10.jpg'];
    const ROOMS=['OT-01','OT-02','OT-03','OT-04','Cardiac OT','Neuro OT'];
    const AVC=['#475569','#0f766e','#1e40af','#4338ca','#0e7490','#334155','#3f6212','#7c2d12'];
    const EQUIP=['Anesthesia Machine','Surgical Lights','Electrocautery','C-Arm','Ventilator'];
    const initials=n=>n.split(' ').map(x=>x[0]).join('').slice(0,2);
    const detailUrl=()=>'ot-booking-detail.html';
    const prios=['emerg','high','med','routine','routine','med','high','routine','med','high'];

    let seq=0;
    function mkBooking(stage){
        const id=seq++;
        const st=stage||STAGES[rnd(0,5)];
        return { id, code:'BKG-'+(4300+id), patient:NAMES[id%NAMES.length], mrn:'MRN-'+(80500+id),
            surgeon:SURGEONS[id%SURGEONS.length], anesth:ANESTH[id%ANESTH.length], nurse:NURSES[id%NURSES.length],
            proc:PROCS[id%PROCS.length], room:ROOMS[id%ROOMS.length], date:'Jul '+rnd(20,27), time:['08:00','10:30','13:00','15:30'][id%4],
            dur:[1,2,2,3][id%4], prio:prios[id%prios.length], stage:st, av:AVC[id%AVC.length], photo:PHOTOS[id%PHOTOS.length],
            equip:[EQUIP[id%EQUIP.length],EQUIP[(id+2)%EQUIP.length]], recBed:'RB-'+String(rnd(1,20)).padStart(2,'0') };
    }
    // The initial 12-record seed used to come from mkBooking() called with no
    // stage argument, i.e. fully Math.random()-driven stage/date/bed on every
    // page load. Frozen here so the (now static-HTML) initial markup stays in
    // sync; mkBooking() above is unchanged and still used for new bookings
    // created interactively (New Booking / Emergency Booking).
    const FROZEN_STAGE_IDX=[1,3,4,2,0,5,1,3,4,2,0,5];
    const FROZEN_DATE_OFF=[20,21,22,23,24,25,26,27,20,21,22,23];
    const FROZEN_RECBED=[3,7,12,18,5,9,14,2,16,11,6,19];
    function mkBookingFrozen(id){
        return { id, code:'BKG-'+(4300+id), patient:NAMES[id%NAMES.length], mrn:'MRN-'+(80500+id),
            surgeon:SURGEONS[id%SURGEONS.length], anesth:ANESTH[id%ANESTH.length], nurse:NURSES[id%NURSES.length],
            proc:PROCS[id%PROCS.length], room:ROOMS[id%ROOMS.length], date:'Jul '+FROZEN_DATE_OFF[id], time:['08:00','10:30','13:00','15:30'][id%4],
            dur:[1,2,2,3][id%4], prio:prios[id%prios.length], stage:STAGES[FROZEN_STAGE_IDX[id]], av:AVC[id%AVC.length], photo:PHOTOS[id%PHOTOS.length],
            equip:[EQUIP[id%EQUIP.length],EQUIP[(id+2)%EQUIP.length]], recBed:'RB-'+String(FROZEN_RECBED[id]).padStart(2,'0') };
    }
    let BOOKINGS=Array.from({length:12},(_,i)=>mkBookingFrozen(i));
    seq=12;
    let focusId=BOOKINGS[0].id;
    const sel=new Set();
    let view='card', q='', fStatus='', fPrio='';

    const OTSTATES=[['OT-01','avail'],['OT-02','inuse'],['OT-03','clean'],['OT-04','reserved']];
    const RSL={avail:'Available',reserved:'Reserved',inuse:'In Use',clean:'Cleaning',maint:'Maintenance'};
    const RSC={avail:'#15803d',reserved:'#1d4ed8',inuse:'#e06c1f',clean:'#b7791f',maint:'#64748b'};

    function filtered(){
        return BOOKINGS.filter(b=>{
            if(q){ const t=q.toLowerCase(); if(!(b.patient.toLowerCase().includes(t)||b.code.toLowerCase().includes(t)||b.surgeon.toLowerCase().includes(t)||b.proc.toLowerCase().includes(t))) return false; }
            if(fStatus&&b.stage!==fStatus) return false;
            if(fPrio&&b.prio!==fPrio) return false;
            return true;
        });
    }

    /* ============ HERO COUNTS ============ */
    function updateCounts(){
        const pend=BOOKINGS.filter(b=>b.stage==='Pending Approval').length;
        $('#ob-h-pend').textContent=pend; $('#ob-h-pend2').textContent=pend;
        $('#ob-h-today').textContent=BOOKINGS.filter(b=>b.stage!=='Cancelled').length;
        $('#ob-h-emerg').textContent=BOOKINGS.filter(b=>b.prio==='emerg').length;
        $('#ob-h-avail').textContent=OTSTATES.filter(o=>o[1]==='avail').length;
    }

    /* ============ BOOKING BOARD ============ */
    function bookingCard(b){
        return `<div class="ob-book pr-${b.prio}" data-book="${b.id}">
            <div class="flex items-center gap-2 mb-2">
                <label onclick="event.stopPropagation()" class="flex items-center"><input type="checkbox" data-sel="${b.id}" ${sel.has(b.id)?'checked':''} class="accent-[var(--ob-c)]"></label>
                <a href="${detailUrl()}" onclick="event.stopPropagation()" class="text-[11px] font-bold ob-mut hover:underline">${b.code}</a>
                <span class="prpill ob-chip ml-auto">${b.prio==='emerg'?'<i class="icon-alert-triangle text-[9px]"></i> ':''}${PRIOL[b.prio]}</span>
                <button data-menu="${b.id}" onclick="event.stopPropagation()" class="w-6 h-6 rounded-md hover:bg-[var(--ob-hover)] flex items-center justify-center ob-mut"><i class="icon-more-vertical text-sm"></i></button>
            </div>
            <div class="flex items-center gap-2.5">
                <img class="ob-avatar flex-none" style="width:36px;height:36px" src="${b.photo}" alt="${b.patient}">
                <div class="min-w-0 flex-1"><p class="text-sm font-semibold ob-head truncate">${b.patient}</p><p class="text-[11px] ob-mut truncate">${b.mrn} · ${b.proc}</p></div>
            </div>
            <div class="grid grid-cols-2 gap-x-3 gap-y-1 mt-2.5 text-[11px]">
                <div class="flex items-center gap-1 ob-mut"><i class="icon-stethoscope text-[11px]"></i> ${b.surgeon.split('. ')[1]||b.surgeon}</div>
                <div class="flex items-center gap-1 ob-mut"><i class="icon-layout-grid text-[11px]"></i> ${b.room}</div>
                <div class="flex items-center gap-1 ob-mut"><i class="icon-calendar text-[11px]"></i> ${b.date} · ${b.time}</div>
                <div class="flex items-center gap-1 ob-mut"><i class="icon-clock text-[11px]"></i> ~${b.dur}h</div>
            </div>
            <div class="flex items-center justify-between mt-2.5 pt-2.5 border-t" style="border-color:var(--ob-border)">
                <span class="ob-chip" style="background:color-mix(in srgb,${STAGEC[b.stage]} 13%,transparent);color:${STAGEC[b.stage]}"><span class="ob-dot" style="background:${STAGEC[b.stage]}"></span> ${b.stage}</span>
                <span class="text-[10px] ob-mut">${b.stage==='Pending Approval'?'<i class="icon-clock text-[10px]"></i> Awaiting approval':'<i class="icon-shield-check text-[10px]"></i> '+APPROVAL[b.stage]}</span>
            </div>
            ${b.stage==='Pending Approval'?`<div class="flex gap-1.5 mt-2"><button data-quick-approve="${b.id}" onclick="event.stopPropagation()" class="ob-npill hover:bg-[var(--ob-hover)]"><i class="icon-check text-[11px]" style="color:#15803d"></i> Approve</button><button data-quick-reject="${b.id}" onclick="event.stopPropagation()" class="ob-npill hover:bg-[var(--ob-hover)]"><i class="icon-x text-[11px]" style="color:#dc2626"></i> Reject</button></div>`:''}
        </div>`;
    }
    function renderBoard(){
        const list=filtered(); $('#ob-count').textContent=list.length;
        const host=$('#ob-board');
        if(view==='card'){ host.innerHTML=`<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">${list.map(bookingCard).join('')||'<p class="text-sm ob-mut text-center py-6 col-span-3">No bookings found.</p>'}</div>`; }
        else if(view==='timeline'){
            const byDate={}; list.forEach(b=>{ (byDate[b.date]=byDate[b.date]||[]).push(b); });
            host.innerHTML=`<div class="ob-card p-5"><div class="ob-tlv">${Object.keys(byDate).sort().map(d=>`<div class="ob-tlv-item" style="--pv:var(--ob-accent)"><p class="text-sm font-bold ob-head mb-2">${d}</p><div class="space-y-2">${byDate[d].sort((a,b)=>a.time.localeCompare(b.time)).map(b=>`<div class="ob-panel p-2.5 flex items-center gap-2.5 pr-${b.prio}" data-book="${b.id}" style="cursor:pointer;border-left:3px solid ${PRIOC[b.prio]}"><span class="text-[11px] font-bold ob-mut w-12">${b.time}</span><img class="ob-avatar flex-none" style="width:30px;height:30px" src="${b.photo}" alt="${b.patient}"><div class="min-w-0 flex-1"><p class="text-sm font-semibold ob-head truncate">${b.proc} · ${b.patient}</p><p class="text-[10px] ob-mut">${b.room} · ${b.surgeon}</p></div><span class="ob-chip" style="background:color-mix(in srgb,${STAGEC[b.stage]} 13%,transparent);color:${STAGEC[b.stage]}">${b.stage}</span></div>`).join('')}</div></div>`).join('')||'<p class="text-sm ob-mut text-center py-4">No bookings.</p>'}</div></div>`;
        } else {
            host.innerHTML=`<div class="ob-card overflow-hidden"><div class="overflow-x-auto"><table class="ob-tbl"><thead><tr><th></th><th>Booking</th><th>Patient</th><th>Surgeon</th><th>OT</th><th>Date</th><th>Priority</th><th>Status</th><th></th></tr></thead><tbody>${list.map(b=>`<tr data-book="${b.id}" style="cursor:pointer"><td><input type="checkbox" data-sel="${b.id}" ${sel.has(b.id)?'checked':''} class="accent-[var(--ob-c)]" onclick="event.stopPropagation()"></td><td class="font-semibold"><a href="${detailUrl()}" onclick="event.stopPropagation()" class="hover:underline">${b.code}</a></td><td>${b.patient}</td><td>${b.surgeon}</td><td>${b.room}</td><td>${b.date} ${b.time}</td><td><span class="ob-chip" style="background:color-mix(in srgb,${PRIOC[b.prio]} 13%,transparent);color:${PRIOC[b.prio]}">${PRIOL[b.prio]}</span></td><td><span class="ob-chip" style="background:color-mix(in srgb,${STAGEC[b.stage]} 13%,transparent);color:${STAGEC[b.stage]}">${b.stage}</span></td><td class="text-right"><button data-menu="${b.id}" onclick="event.stopPropagation()" class="w-7 h-7 rounded-md hover:bg-[var(--ob-hover)] inline-flex items-center justify-center ob-mut"><i class="icon-more-vertical"></i></button></td></tr>`).join('')||'<tr><td colspan="9" class="text-center py-6 ob-mut">No bookings found.</td></tr>'}</tbody></table></div></div>`;
        }
    }

    /* ============ OT AVAILABILITY ============ */
    // "Next available" time, current procedure and held-for surgeon were all
    // Math.random() on every load; frozen for a deterministic static-HTML panel.
    const FROZEN_NEXT={ 'OT-02':'14:00', 'OT-03':'11:30', 'OT-04':'15:45' };
    const FROZEN_INUSE_PROC='Knee Replacement';
    const FROZEN_RESERVED_SURGEON='Dr. R. Nair';
    function renderOtRooms(){
        $('#ob-otlegend').innerHTML=Object.keys(RSL).map(k=>`<span class="flex items-center gap-1.5 ob-mut"><span class="ob-dot" style="background:${RSC[k]}"></span>${RSL[k]}</span>`).join('');
        $('#ob-otrooms').innerHTML=OTSTATES.map(([r,st])=>{
            const next=st==='avail'?'Now':FROZEN_NEXT[r];
            return `<div class="ob-otc rs-${st}">
                <div class="flex items-center justify-between mb-1.5"><span class="text-sm font-bold ob-head">${r}</span><span class="ob-chip" style="background:color-mix(in srgb,${RSC[st]} 13%,transparent);color:${RSC[st]}">${RSL[st]}</span></div>
                <p class="text-[11px] ob-mut">${st==='inuse'?'Current: '+FROZEN_INUSE_PROC:st==='clean'?'Turnover in progress':st==='maint'?'Under service':st==='reserved'?'Held for '+FROZEN_RESERVED_SURGEON.split('. ')[1]:'Ready for booking'}</p>
                <div class="flex items-center justify-between mt-2 text-[11px]"><span class="ob-mut">Next available</span><span class="font-semibold" style="color:${RSC[st]}">${next}</span></div>
                <button data-modal="allocate" class="ob-btn ob-btn-ghost w-full justify-center mt-2 !py-1 text-xs"><i class="icon-calendar-plus"></i> Book</button>
            </div>`;
        }).join('');
    }

    /* ============ WORKFLOW KANBAN ============ */
    function renderKanban(){
        $('#ob-kanban').innerHTML=STAGES.map(st=>{
            const items=BOOKINGS.filter(b=>b.stage===st);
            return `<div class="ob-kcol p-2.5" data-kcol="${st}">
                <div class="flex items-center justify-between mb-2 px-1"><span class="text-xs font-bold ob-head flex items-center gap-1.5"><span class="ob-dot" style="background:${STAGEC[st]}"></span> ${st}</span><span class="ob-npill">${items.length}</span></div>
                <div class="space-y-2 min-h-[40px]" data-kbody="${st}">
                ${items.slice(0,5).map(b=>`<div class="ob-ktask" draggable="true" data-task="${b.id}" style="border-left:3px solid ${PRIOC[b.prio]}">
                    <div class="flex items-center justify-between"><span class="text-[10px] font-bold ob-mut">${b.code}</span><span class="ob-chip" style="background:color-mix(in srgb,${PRIOC[b.prio]} 12%,transparent);color:${PRIOC[b.prio]}">${PRIOL[b.prio]}</span></div>
                    <p class="text-xs font-semibold ob-head mt-1 leading-tight">${b.proc}</p>
                    <p class="text-[10px] ob-mut mt-0.5">${b.patient} · ${b.room}</p>
                    <div class="flex items-center justify-between text-[10px] ob-mut mt-1"><span><i class="icon-calendar"></i> ${b.date}</span><i class="icon-grip-vertical"></i></div>
                </div>`).join('')||`<p class="text-[11px] ob-mut text-center py-2">Drop here</p>`}
                </div></div>`;
        }).join('');
    }
    let dragId=null;
    document.addEventListener('dragstart',e=>{ const t=e.target.closest('[data-task]'); if(t){ dragId=+t.dataset.task; t.classList.add('drag'); } });
    document.addEventListener('dragend',e=>{ const t=e.target.closest('[data-task]'); if(t) t.classList.remove('drag'); $$('.ob-kcol').forEach(c=>c.classList.remove('over')); });
    document.addEventListener('dragover',e=>{ const c=e.target.closest('[data-kcol]'); if(c){ e.preventDefault(); $$('.ob-kcol').forEach(x=>x.classList.toggle('over',x===c)); } });
    document.addEventListener('drop',e=>{ const c=e.target.closest('[data-kcol]'); if(c&&dragId!=null){ e.preventDefault(); const b=BOOKINGS.find(x=>x.id===dragId); if(b){ b.stage=c.dataset.kcol; refreshAll(); toast(b.code+' → '+b.stage,'icon-git-branch'); } dragId=null; } });

    /* ============ EMERGENCY PANEL ============ */
    // ETA was Math.random() on every load; frozen for a deterministic static-HTML panel.
    const FROZEN_ETA=[8,15,20,12];
    function renderEmergency(){
        const list=BOOKINGS.filter(b=>b.prio==='emerg').slice(0,4);
        $('#ob-emergency').innerHTML=list.map((b,i)=>`<div class="ob-panel p-3" style="border-left:3px solid #dc2626">
            <div class="flex items-center justify-between mb-1"><span class="ob-chip" style="background:color-mix(in srgb,#dc2626 13%,transparent);color:#dc2626"><span class="ob-dot ob-live" style="background:#dc2626"></span> ${PRIOL[b.prio]}</span><span class="text-[11px] ob-mut">ETA ${FROZEN_ETA[i%FROZEN_ETA.length]} min</span></div>
            <p class="text-sm font-semibold ob-head">${b.proc}</p><p class="text-[11px] ob-mut">${b.patient} · Suggested: ${b.room} · ${b.surgeon}</p>
            <div class="flex gap-1.5 mt-2"><button data-quick-approve="${b.id}" class="ob-npill hover:bg-[var(--ob-hover)]"><i class="icon-check text-[11px]" style="color:#15803d"></i> Approve</button><button data-modal="allocate" class="ob-npill hover:bg-[var(--ob-hover)]"><i class="icon-layout-grid text-[11px]"></i> Assign OT</button></div>
        </div>`).join('');
    }

    /* ============ PLANNING SUMMARY ============ */
    function renderPlanning(){
        const b=BOOKINGS.find(x=>x.id===focusId)||BOOKINGS[0]; if(!b){ $('#ob-planning').innerHTML='<p class="ob-mut text-sm">No booking selected.</p>'; return; } focusId=b.id;
        $('#ob-plan-id').textContent=b.code;
        const row=(k,v)=>`<div class="flex justify-between text-xs py-1 border-b" style="border-color:var(--ob-border)"><span class="ob-mut">${k}</span><span class="font-medium ob-head">${v}</span></div>`;
        $('#ob-planning').innerHTML=`
            <div class="flex items-center gap-3 mb-3">
                <img class="ob-avatar flex-none" style="width:42px;height:42px" src="${b.photo}" alt="${b.patient}">
                <div class="min-w-0 flex-1"><p class="font-bold ob-head">${b.patient}</p><p class="text-[11px] ob-mut">${b.mrn} · ${b.proc}</p></div>
                <span class="ob-chip pr-${b.prio}" style="background:color-mix(in srgb,${PRIOC[b.prio]} 13%,transparent);color:${PRIOC[b.prio]}">${PRIOL[b.prio]}</span>
            </div>
            <div class="grid sm:grid-cols-2 gap-x-4">
                <div>${row('Procedure',b.proc)}${row('Surgeon',b.surgeon)}${row('Anesthesiologist',b.anesth)}${row('OT Team',b.nurse+' +2')}${row('Priority',PRIOL[b.prio])}${row('MRN',b.mrn)}</div>
                <div>${row('OT Room',b.room)}${row('Date / Time',b.date+' · '+b.time)}${row('Est. Duration',b.dur+'h')}${row('Status',b.stage)}${row('Recovery Bed',b.recBed)}${row('Equipment',b.equip.join(', '))}</div>
            </div>
            <div class="flex flex-wrap gap-2 mt-3">
                ${b.stage==='Pending Approval'?`<button data-modal="approve" class="ob-btn ob-btn-primary"><i class="icon-check"></i> Approve</button><button data-modal="reject" class="ob-btn ob-btn-ghost"><i class="icon-x"></i> Reject</button>`:`<button data-modal="edit" class="ob-btn ob-btn-primary"><i class="icon-edit"></i> Edit Booking</button>`}
                <button data-modal="team" class="ob-btn ob-btn-ghost"><i class="icon-users"></i> Assign Team</button>
                <button data-open-drawer="${b.id}" class="ob-btn ob-btn-ghost"><i class="icon-eye"></i> Details</button>
            </div>`;
    }

    /* ============ DRAWER ============ */
    function openDrawer(id){
        const b=BOOKINGS.find(x=>x.id===id); if(!b) return; const c=PRIOC[b.prio];
        const box=(t,ic,body)=>`<div class="ob-panel p-3"><p class="text-[11px] font-bold ob-mut uppercase tracking-wide mb-2 flex items-center gap-1.5"><i class="${ic} ob-hicon text-[13px]"></i> ${t}</p>${body}</div>`;
        const row=(k,v)=>`<div class="flex justify-between text-xs py-0.5"><span class="ob-mut">${k}</span><span class="font-medium ob-head">${v}</span></div>`;
        const steps=STAGES.slice(0,6); const ci=steps.indexOf(b.stage);
        $('#ob-drawer').innerHTML=`
          <div class="p-4 border-b sticky top-0 z-10 flex items-center justify-between" style="background:var(--ob-elev);border-color:var(--ob-border)">
            <div class="flex items-center gap-3"><span class="ob-iconbadge w-11 h-11 flex-none" style="color:${c};background:color-mix(in srgb,${c} 12%,transparent)"><i class="icon-clipboard-check text-lg"></i></span><div><p class="font-bold ob-head">${b.code}</p><p class="text-[11px] ob-mut">${b.proc} · ${b.room}</p></div></div>
            <button data-close class="w-8 h-8 rounded-lg hover:bg-[var(--ob-hover)] flex items-center justify-center ob-mut"><i class="icon-x"></i></button>
          </div>
          <div class="p-4 space-y-3">
            <div class="flex items-center gap-2 flex-wrap"><span class="ob-chip" style="background:color-mix(in srgb,${c} 14%,transparent);color:${c}">${PRIOL[b.prio]}</span><span class="ob-chip" style="background:color-mix(in srgb,${STAGEC[b.stage]} 13%,transparent);color:${STAGEC[b.stage]}">${b.stage}</span><span class="ob-npill"><i class="icon-shield-check text-[11px]"></i> ${APPROVAL[b.stage]}</span></div>
            <div class="ob-panel p-3"><p class="text-[11px] font-bold ob-mut uppercase tracking-wide mb-2">Booking Progress</p><div class="flex items-center gap-1">${steps.map((s,i)=>`<div class="flex-1"><div class="ob-stab"><span style="width:${i<=ci?100:0}%;background:${i<ci?'#15803d':i===ci?STAGEC[b.stage]:'var(--ob-track)'}"></span></div><p class="text-[8px] ob-mut mt-1 text-center truncate">${s.split(' ')[0]}</p></div>`).join('')}</div></div>
            ${box('Patient','icon-user',`<div class="flex items-center gap-2 mb-1.5"><img class="ob-avatar" style="width:34px;height:34px" src="${b.photo}" alt="${b.patient}"><div><p class="text-sm font-semibold ob-head">${b.patient}</p><p class="text-[11px] ob-mut">${b.mrn}</p></div></div>`)}
            ${box('Booking Details','icon-clipboard-list',row('Procedure',b.proc)+row('Date / Time',b.date+' · '+b.time)+row('Duration',b.dur+'h')+row('Priority',PRIOL[b.prio]))}
            ${box('Resources','icon-boxes',row('OT Room',b.room)+row('Surgeon',b.surgeon)+row('Anesthesiologist',b.anesth)+row('OT Nurse',b.nurse)+row('Recovery Bed',b.recBed))}
            ${box('Equipment','icon-cpu','<div class="flex flex-wrap gap-1">'+b.equip.map(x=>`<span class="ob-npill">${x}</span>`).join('')+'</div>')}
            <div class="grid grid-cols-2 gap-2">
                ${b.stage==='Pending Approval'?`<button data-modal="approve" class="ob-btn ob-btn-primary justify-center"><i class="icon-check"></i> Approve</button><button data-modal="reject" class="ob-btn ob-btn-ghost justify-center"><i class="icon-x"></i> Reject</button>`:`<button data-modal="edit" class="ob-btn ob-btn-primary justify-center"><i class="icon-edit"></i> Edit</button><button data-modal="allocate" class="ob-btn ob-btn-ghost justify-center"><i class="icon-layout-grid"></i> Assign OT</button>`}
                <button data-modal="team" class="ob-btn ob-btn-ghost justify-center"><i class="icon-users"></i> Team</button>
                <button data-del-book="${b.id}" class="ob-btn ob-btn-ghost justify-center"><i class="icon-x-circle"></i> Cancel</button>
            </div>
          </div>`;
        $('#ob-drawer').classList.add('open');
        document.body.style.overflow='hidden';
    }
    function closeDrawer(){ $('#ob-drawer').classList.remove('open'); document.body.style.overflow=''; }

    /* ============ MENU ============ */
    const ACTIONS=[['View Booking','icon-eye','view'],['Edit','icon-edit','edit'],['Approve','icon-check','approve'],['Reject','icon-x','reject'],['Assign OT','icon-layout-grid','allocate'],['Assign Team','icon-users','team'],['Reschedule','icon-calendar-clock','edit'],['sep'],['Cancel','icon-x-circle','cancel'],['Print','icon-printer','print'],['Download PDF','icon-file-down','pdf'],['Archive','icon-archive','archive'],['Delete','icon-trash-2','delete']];
    function openMenu(id,x,y){ closeMenu(); $('#ob-menuhost').innerHTML=`<div class="ob-menu" id="ob-openmenu">${ACTIONS.map(a=>a[0]==='sep'?'<div class="ob-menu-sep"></div>':`<button data-action="${a[2]}" data-bid="${id}" class="${a[2]==='delete'?'danger':''}"><i class="${a[1]}"></i> ${a[0]}</button>`).join('')}</div>`; const m=$('#ob-openmenu'); const r=m.getBoundingClientRect(); m.style.left=Math.max(12,Math.min(x,window.innerWidth-r.width-12))+'px'; m.style.top=Math.max(12,Math.min(y,window.innerHeight-r.height-12))+'px'; }
    function closeMenu(){ $('#ob-menuhost').innerHTML=''; }

    /* ============ MODALS ============ */
    const fld=(l,el)=>`<div><label class="ob-formlabel">${l}</label>${el}</div>`;
    const inp=(ph)=>`<input class="ob-in mt-1" placeholder="${ph||''}">`;
    const selE=(o)=>`<select class="ob-in mt-1">${o.map(x=>`<option>${x}</option>`).join('')}</select>`;
    const drop=(t)=>`<div class="ob-drop rounded-xl h-28 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[var(--ob-hover)]"><i class="icon-cloud-upload text-3xl ob-mut"></i><p class="text-sm font-semibold mt-1 ob-head">${t}</p></div>`;
    const MODALS={
        new:{t:'New Booking',sub:'Reserve an operation theater',ic:'icon-plus',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('Patient / MRN',inp('Search...'))}${fld('Procedure',selE(PROCS))}${fld('Surgeon',selE(SURGEONS))}${fld('OT Room',selE(ROOMS))}${fld('Date & Time',`<input type="text" placeholder="dd-mm-yyyy --:--" class="ob-in mt-1" data-provider="flatpickr" data-date-format="d-m-Y" data-enable-time>`)}${fld('Est. Duration (h)',inp('2'))}${fld('Anesthesiologist',selE(ANESTH))}${fld('Priority',selE(['Routine','Medium','High','Emergency']))}</div>`,cta:'Create Booking'},
        edit:{t:'Edit Booking',sub:'Update the reservation',ic:'icon-edit',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('OT Room',selE(ROOMS))}${fld('Date & Time',`<input type="text" placeholder="dd-mm-yyyy --:--" class="ob-in mt-1" data-provider="flatpickr" data-date-format="d-m-Y" data-enable-time>`)}${fld('Duration (h)',inp('2'))}${fld('Priority',selE(['Routine','Medium','High','Emergency']))}</div>`,cta:'Save Changes'},
        approve:{t:'Approve Booking',sub:'Grant OT approval',ic:'icon-check',body:`<div class="rounded-lg p-2.5 text-xs mb-3 flex items-center gap-2" style="background:color-mix(in srgb,#15803d 11%,transparent);color:#15803d;border:1px solid color-mix(in srgb,#15803d 28%,transparent)"><i class="icon-shield-check"></i> Confirms OT, team &amp; equipment availability.</div><div class="grid sm:grid-cols-2 gap-3">${fld('Approver',selE(['OT Coordinator','Dept. Head','Chief Surgeon']))}${fld('Confirm OT',selE(ROOMS))}</div><div class="mt-3">${fld('Notes',`<textarea class="ob-in mt-1" rows="2" placeholder="Approval notes..."></textarea>`)}</div>`,cta:'Approve Booking'},
        reject:{t:'Reject Booking',sub:'Decline with a reason',ic:'icon-x',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('Reason',selE(['OT unavailable','Surgeon conflict','Equipment shortage','Incomplete pre-op','Reschedule needed']))}${fld('Notify',selE(['Surgeon','Coordinator','Both']))}</div><div class="mt-3">${fld('Notes',`<textarea class="ob-in mt-1" rows="2" placeholder="Rejection notes..."></textarea>`)}</div>`,cta:'Reject Booking'},
        emergency:{t:'Emergency Booking',sub:'Insert an urgent reservation',ic:'icon-alert-triangle',body:`<div class="rounded-lg p-2.5 text-xs mb-3 flex items-center gap-2" style="background:color-mix(in srgb,#dc2626 11%,transparent);color:#dc2626;border:1px solid color-mix(in srgb,#dc2626 30%,transparent)"><i class="icon-alert-triangle"></i> Auto-approves &amp; grabs the nearest free OT.</div><div class="grid sm:grid-cols-2 gap-3">${fld('Patient / Unknown',inp('Name or "Unknown"'))}${fld('Procedure',selE(PROCS))}${fld('OT',selE(['Auto — next free','OT-01','OT-02']))}${fld('Surgeon On-call',selE(SURGEONS))}</div>`,cta:'Book Emergency'},
        allocate:{t:'Assign OT',sub:'Allocate a theater to the booking',ic:'icon-layout-grid',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('Booking',inp('BKG-...'))}${fld('OT Room',selE(ROOMS))}${fld('Slot',selE(['08:00','10:30','13:00','15:30']))}${fld('Recovery Bed',selE(['Auto','RB-01','RB-02']))}</div>`,cta:'Assign OT'},
        team:{t:'Assign Team',sub:'Compose the surgical team',ic:'icon-users',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('Lead Surgeon',selE(SURGEONS))}${fld('Assistant',selE(SURGEONS))}${fld('Anesthesiologist',selE(ANESTH))}${fld('Scrub Nurse',selE(NURSES))}${fld('Circulating Nurse',selE(NURSES))}${fld('Technician',selE(['Tech A','Tech B']))}</div>`,cta:'Assign Team'},
        import:{t:'Import',sub:'Bulk-load bookings',ic:'icon-upload',body:`<div class="flex gap-2 mb-3">${['CSV','Excel','Booking Sheet'].map(f=>`<span class="ob-npill">${f}</span>`).join('')}</div>${drop('Drop CSV / Excel file')}<button class="text-xs font-semibold text-[color:var(--ob-accent)] hover:underline mt-2"><i class="icon-download"></i> Download sample template</button><div class="mt-3 rounded-lg p-3 text-xs flex items-center gap-2" style="background:color-mix(in srgb,#15803d 11%,transparent);color:#15803d;border:1px solid color-mix(in srgb,#15803d 28%,transparent)"><i class="icon-circle-check"></i> Validation passed · 12 bookings · 1 needs approval</div>`,cta:'Import'},
        export:{t:'Export',sub:'Export bookings',ic:'icon-download',body:`<p class="text-xs ob-mut mb-2">Choose a format &amp; scope</p><div class="grid grid-cols-2 gap-2">${['CSV','Excel','PDF','Print','Booking Report','Approval Report','OT Utilization','Selected','All Records'].map(f=>`<button data-expfmt="${f}" class="ob-btn ob-btn-ghost justify-center">${f}</button>`).join('')}</div>`,cta:'Export'},
    };
    const SIMPLE={print:'Printing booking...',pdf:'PDF downloaded',archive:'Booking archived'};
    function openModal(key){ const m=MODALS[key]; if(!m) return; document.body.style.overflow='hidden'; $('#ob-modalhost').innerHTML=`<div class="ob-modal-wrap open"><div class="ob-modal-bg" data-close></div><div class="ob-modal">
        <div class="ob-modal-head"><span class="ob-modal-badge"><i class="${m.ic}"></i></span><div class="min-w-0"><h3 class="font-bold ob-head leading-tight">${m.t}</h3><p class="text-[11px] ob-mut">${m.sub||''}</p></div><button data-close class="ml-auto w-8 h-8 rounded-lg hover:bg-[var(--ob-hover)] flex items-center justify-center ob-mut"><i class="icon-x"></i></button></div>
        <div class="ob-modal-body">${m.body}</div>
        <div class="ob-modal-foot"><button data-close class="ob-btn ob-btn-ghost">Cancel</button><button data-modalok="${key}" class="ob-btn ${key==='reject'?'ob-btn-danger':'ob-btn-primary'}"><i class="${m.ic}"></i> ${m.cta}</button></div>
    </div></div>`;
        // Modal HTML is injected after the page's initial-load flatpickr auto-init has
        // already run, so any date fields inside it must be initialized here instead.
        if(typeof flatpickr!=="undefined"){
            $$('[data-provider="flatpickr"]',$('#ob-modalhost')).forEach(function(el){
                if(el._flatpickr) return;
                const config={disableMobile:true};
                if(el.hasAttribute('data-date-format')) config.dateFormat=el.getAttribute('data-date-format');
                if(el.hasAttribute('data-enable-time')){ config.enableTime=true; config.dateFormat=(config.dateFormat||'Y-m-d')+' H:i'; }
                flatpickr(el,config);
            });
        }
    }
    function openDelete(msg,onOk){ document.body.style.overflow='hidden'; $('#ob-modalhost').innerHTML=`<div class="ob-modal-wrap open"><div class="ob-modal-bg" data-close></div><div class="ob-modal" style="width:min(420px,94vw)"><div class="p-5 text-center"><div class="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style="background:color-mix(in srgb,#dc2626 13%,transparent);color:#dc2626"><i class="icon-alert-triangle text-2xl"></i></div><h3 class="font-bold text-lg ob-head">Confirm</h3><p class="text-xs ob-mut mt-1">${msg}</p><div class="flex gap-2 mt-4"><button data-close class="ob-btn ob-btn-ghost flex-1 justify-center">Cancel</button><button id="ob-delok" class="ob-btn ob-btn-danger flex-1 justify-center">Delete</button></div></div></div></div>`; $('#ob-delok').onclick=()=>{ onOk(); closeModal(); }; }
    function closeModal(){ $('#ob-modalhost').innerHTML=''; if(!$('#ob-drawer').classList.contains('open')) document.body.style.overflow=''; }

    /* ============ HELPERS ============ */
    function updateBulk(){ $('#ob-selcount').textContent=sel.size; $('.ob-bulk').classList.toggle('show',sel.size>0); }
    function refreshAll(){ renderBoard(); renderKanban(); renderEmergency(); renderPlanning(); updateCounts(); }
    function setStage(id,st){ const b=BOOKINGS.find(x=>x.id===id); if(b) b.stage=st; }

    /* ============ EVENTS ============ */
    document.addEventListener('click',e=>{
        if(e.target.closest('[data-vw]')){ const b=e.target.closest('[data-vw]'); view=b.dataset.vw; $$('#ob-viewtabs button').forEach(x=>x.classList.toggle('on',x===b)); renderBoard(); return; }
        if(e.target.closest('[data-quick-approve]')){ setStage(+e.target.closest('[data-quick-approve]').dataset.quickApprove,'Approved'); refreshAll(); toast('Booking approved','icon-check'); return; }
        if(e.target.closest('[data-quick-reject]')){ setStage(+e.target.closest('[data-quick-reject]').dataset.quickReject,'Cancelled'); refreshAll(); toast('Booking rejected','icon-x'); return; }
        if(e.target.closest('[data-open-drawer]')){ openDrawer(+e.target.closest('[data-open-drawer]').dataset.openDrawer); return; }
        if(e.target.closest('[data-del-book]')){ const id=+e.target.closest('[data-del-book]').dataset.delBook; openDelete('Cancel this booking?',()=>{ setStage(id,'Cancelled'); closeDrawer(); refreshAll(); toast('Booking cancelled','icon-x-circle'); }); return; }
        const t=e.target.closest('[data-book],[data-menu],[data-action],[data-modal],[data-modalok],[data-close],[data-bulk],[data-expfmt]');
        if(!t){ if(!e.target.closest('.ob-menu')) closeMenu(); return; }
        if(t.dataset.book!==undefined){ focusId=+t.dataset.book; renderPlanning(); openDrawer(focusId); return; }
        if(t.dataset.menu!==undefined){ const r=t.getBoundingClientRect(); openMenu(+t.dataset.menu,r.left-185,r.bottom+4); return; }
        if(t.dataset.action!==undefined){ const a=t.dataset.action, id=+t.dataset.bid; closeMenu(); focusId=id; const b=BOOKINGS.find(x=>x.id===id);
            if(a==='view') openDrawer(id);
            else if(a==='approve'){ if(b.stage==='Pending Approval'){ setStage(id,'Approved'); refreshAll(); toast('Booking approved','icon-check'); } else openModal('approve'); }
            else if(a==='cancel'){ openDelete('Cancel this booking?',()=>{ setStage(id,'Cancelled'); refreshAll(); toast('Booking cancelled','icon-x-circle'); }); }
            else if(MODALS[a]) openModal(a);
            else if(a==='delete') openDelete('Delete this booking record?',()=>{ BOOKINGS=BOOKINGS.filter(x=>x.id!==id); sel.delete(id); refreshAll(); toast('Booking deleted','icon-trash-2'); });
            else if(SIMPLE[a]) toast(SIMPLE[a]);
            return; }
        if(t.dataset.modal!==undefined){ openModal(t.dataset.modal); return; }
        if(t.dataset.modalok!==undefined){ const k=t.dataset.modalok; const b=BOOKINGS.find(x=>x.id===focusId);
            if(k==='new'||k==='emergency'){ const nb=mkBooking(k==='emergency'?'Approved':'Pending Approval'); if(k==='emergency') nb.prio='emerg'; BOOKINGS.unshift(nb); refreshAll(); }
            else if(k==='approve'&&b){ setStage(b.id,'Approved'); refreshAll(); }
            else if(k==='reject'&&b){ setStage(b.id,'Cancelled'); refreshAll(); }
            toast(MODALS[k].cta+' — done','icon-check'); closeModal(); return; }
        if(t.dataset.expfmt!==undefined){ toast('Exported: '+t.dataset.expfmt,'icon-download'); closeModal(); return; }
        if(t.dataset.close!==undefined){ closeModal(); closeDrawer(); return; }
        if(t.dataset.bulk!==undefined){ const bk=t.dataset.bulk;
            if(bk==='delete') openDelete(`Delete ${sel.size} selected booking(s)?`,()=>{ BOOKINGS=BOOKINGS.filter(b=>!sel.has(b.id)); sel.clear(); refreshAll(); updateBulk(); toast('Bookings deleted','icon-trash-2'); });
            else if(bk==='approve'){ BOOKINGS.forEach(b=>{ if(sel.has(b.id)&&b.stage==='Pending Approval') b.stage='Approved'; }); sel.clear(); refreshAll(); updateBulk(); toast('Bookings approved','icon-check'); }
            else { toast({allocate:'OT assigned',team:'Team assigned',export:'Exported',print:'Printing',archive:'Archived'}[bk]+' · '+sel.size+' bookings'); if(bk==='archive'){ sel.clear(); refreshAll(); updateBulk(); } }
            return; }
    });
    document.addEventListener('change',e=>{
        if(e.target.dataset.sel!==undefined){ const id=+e.target.dataset.sel; e.target.checked?sel.add(id):sel.delete(id); updateBulk(); return; }
        if(e.target.id==='ob-fstatus'){ fStatus=e.target.value; renderBoard(); }
        if(e.target.id==='ob-fprio'){ fPrio=e.target.value; renderBoard(); }
    });
    document.addEventListener('input',e=>{ if(e.target.id==='ob-search'){ q=e.target.value; renderBoard(); } });

    function clock(){ $('#ob-clock').textContent=new Date().toLocaleTimeString('en-GB'); }

    /* ============ INIT ============ */
    // renderBoard/renderOtRooms/renderKanban/renderEmergency/renderPlanning/updateCounts
    // are now pre-rendered as static HTML (#ob-board, #ob-otrooms, #ob-otlegend, #ob-kanban,
    // #ob-emergency, #ob-planning, #ob-h-*) instead of being generated here on load. They
    // still run on every later interaction (view switch, filters, approve/reject, bulk actions).
    setTimeout(()=>{
        $('#ob-skeleton').classList.add('hidden');
        $('#ob-content').classList.remove('hidden');
        clock(); setInterval(clock,1000);
    },1400);
})();

// ==========================================================================
// ot-calendar.js
// ==========================================================================
        (function(){
            "use strict";
            if ((location.pathname.split("/").pop() || "index.html") !== "ot-calendar.html") return;
            const $=(s,r)=>(r||document).querySelector(s);
            const $$=(s,r)=>Array.from((r||document).querySelectorAll(s));
            const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
            let toastT;
            function toast(msg,icon){ const t=$('#oc-toast'); if(!t) return; t.innerHTML=`<i class="${icon||'icon-check'} text-teal-400"></i> ${msg}`; t.classList.add('show'); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove('show'),2500); }

            /* ============ DATA ============ */
            const PRIOC={emerg:'#dc2626',high:'#e06c1f',med:'#1d4ed8',routine:'#0f766e'};
            const PRIOL={emerg:'Emergency',high:'High',med:'Medium',routine:'Routine'};
            const SURGEONS=['Dr. A. Mehta','Dr. S. Kapoor','Dr. R. Nair','Dr. L. Khan','Dr. P. Rao','Dr. V. Iyer'];
            const ANESTH=['Dr. K. Menon','Dr. T. Bose','Dr. M. Shah'];
            const NURSES=['N. Fernandes','N. Pillai','N. Sharma','N. Das','N. Reddy'];
            const PROCS=['CABG','Knee Replacement','Craniotomy','Appendectomy','Cholecystectomy','Hip Replacement','Cataract','C-Section','Spinal Fusion','Hernia Repair','Angioplasty','Thyroidectomy'];
            const NAMES=['Rahul Sharma','Anita Reddy','Vikram Nair','Priya Patel','Suresh Gupta','Meera Singh','Arjun Menon','Kavya Das','Deepak Joshi','Neha Verma','Rohan Iyer','Sana Khan','Manoj Rao','Divya Menon'];
            const ROOMS=['OT-01','OT-02','OT-03','OT-04','Cardiac OT','Neuro OT','Emergency OT','Orthopedic OT'];
            const AVC=['#475569','#0f766e','#1e40af','#4338ca','#0e7490','#334155','#3f6212','#7c2d12'];
            const initials=n=>n.split(' ').map(x=>x[0]).join('').slice(0,2);

            // Fixed "today" so the static template renders identically for every buyer
            // (matches appointment-calendar.js's convention: 17 Jul 2026). "today" was
            // `new Date()` on every load.
            let curY=2026, curM=6, curView='month', curDay=17;
            const prios=['emerg','high','med','routine','routine','med','high'];

            // mkEvent is still genuinely needed: "Schedule Surgery" / "Emergency
            // Booking" and "Duplicate" actions create new events after a real user
            // action (see the click handler below).
            let seq=42; // continues after the frozen EVENTS ids (0-41) below
            function mkEvent(day){
                const id=seq++;
                const startH=rnd(8,15), dur=[1,2,2,3][rnd(0,3)];
                return { id, day, startH, dur, room:ROOMS[id%ROOMS.length], patient:NAMES[id%NAMES.length], mrn:'MRN-'+(70600+id),
                    proc:PROCS[id%PROCS.length], surgeon:SURGEONS[id%SURGEONS.length], anesth:ANESTH[id%ANESTH.length], nurse:NURSES[id%NURSES.length],
                    prio:prios[id%prios.length], status:['Scheduled','Confirmed','Tentative'][id%3], av:AVC[id%AVC.length] };
            }
            // Events were seeded across the month via Math.random() on every load (50%
            // chance per day of 1-3 events, plus 4 guaranteed on "today" and a forced
            // room/time clash for the Conflict Center); frozen here to one representative
            // run of that same seeding logic so the (now static-HTML) initial markup
            // stays in sync. Genuine mutations (drag/drop reschedule, conflict-resolve
            // actions, schedule/duplicate/delete) still operate on this array.
            let EVENTS=[{id:0,day:17,startH:9,dur:2,room:"OT-01",patient:"Rahul Sharma",mrn:"MRN-70600",proc:"CABG",surgeon:"Dr. A. Mehta",anesth:"Dr. K. Menon",nurse:"N. Fernandes",prio:"emerg",status:"Scheduled",av:"#475569"},
                {id:1,day:17,startH:9,dur:2,room:"OT-01",patient:"Anita Reddy",mrn:"MRN-70601",proc:"Knee Replacement",surgeon:"Dr. S. Kapoor",anesth:"Dr. T. Bose",nurse:"N. Pillai",prio:"high",status:"Confirmed",av:"#0f766e"},
                {id:2,day:4,startH:10,dur:1,room:"OT-03",patient:"Vikram Nair",mrn:"MRN-70602",proc:"Craniotomy",surgeon:"Dr. R. Nair",anesth:"Dr. M. Shah",nurse:"N. Sharma",prio:"med",status:"Tentative",av:"#1e40af"},
                {id:3,day:5,startH:15,dur:2,room:"OT-04",patient:"Priya Patel",mrn:"MRN-70603",proc:"Appendectomy",surgeon:"Dr. L. Khan",anesth:"Dr. K. Menon",nurse:"N. Das",prio:"routine",status:"Scheduled",av:"#4338ca"},
                {id:4,day:5,startH:10,dur:2,room:"Cardiac OT",patient:"Suresh Gupta",mrn:"MRN-70604",proc:"Cholecystectomy",surgeon:"Dr. P. Rao",anesth:"Dr. T. Bose",nurse:"N. Reddy",prio:"routine",status:"Confirmed",av:"#0e7490"},
                {id:5,day:8,startH:15,dur:2,room:"Neuro OT",patient:"Meera Singh",mrn:"MRN-70605",proc:"Hip Replacement",surgeon:"Dr. V. Iyer",anesth:"Dr. M. Shah",nurse:"N. Fernandes",prio:"med",status:"Tentative",av:"#334155"},
                {id:6,day:8,startH:9,dur:2,room:"Emergency OT",patient:"Arjun Menon",mrn:"MRN-70606",proc:"Cataract",surgeon:"Dr. A. Mehta",anesth:"Dr. K. Menon",nurse:"N. Pillai",prio:"high",status:"Scheduled",av:"#3f6212"},
                {id:7,day:8,startH:8,dur:2,room:"Orthopedic OT",patient:"Kavya Das",mrn:"MRN-70607",proc:"C-Section",surgeon:"Dr. S. Kapoor",anesth:"Dr. T. Bose",nurse:"N. Sharma",prio:"emerg",status:"Confirmed",av:"#7c2d12"},
                {id:8,day:9,startH:14,dur:2,room:"OT-01",patient:"Deepak Joshi",mrn:"MRN-70608",proc:"Spinal Fusion",surgeon:"Dr. R. Nair",anesth:"Dr. M. Shah",nurse:"N. Das",prio:"high",status:"Tentative",av:"#475569"},
                {id:9,day:9,startH:10,dur:1,room:"OT-02",patient:"Neha Verma",mrn:"MRN-70609",proc:"Hernia Repair",surgeon:"Dr. L. Khan",anesth:"Dr. K. Menon",nurse:"N. Reddy",prio:"med",status:"Scheduled",av:"#0f766e"},
                {id:10,day:9,startH:14,dur:1,room:"OT-03",patient:"Rohan Iyer",mrn:"MRN-70610",proc:"Angioplasty",surgeon:"Dr. P. Rao",anesth:"Dr. T. Bose",nurse:"N. Fernandes",prio:"routine",status:"Confirmed",av:"#1e40af"},
                {id:11,day:11,startH:11,dur:2,room:"OT-04",patient:"Sana Khan",mrn:"MRN-70611",proc:"Thyroidectomy",surgeon:"Dr. V. Iyer",anesth:"Dr. M. Shah",nurse:"N. Pillai",prio:"routine",status:"Tentative",av:"#4338ca"},
                {id:12,day:11,startH:12,dur:1,room:"Cardiac OT",patient:"Manoj Rao",mrn:"MRN-70612",proc:"CABG",surgeon:"Dr. A. Mehta",anesth:"Dr. K. Menon",nurse:"N. Sharma",prio:"med",status:"Scheduled",av:"#0e7490"},
                {id:13,day:11,startH:10,dur:2,room:"Neuro OT",patient:"Divya Menon",mrn:"MRN-70613",proc:"Knee Replacement",surgeon:"Dr. S. Kapoor",anesth:"Dr. T. Bose",nurse:"N. Das",prio:"high",status:"Confirmed",av:"#334155"},
                {id:14,day:12,startH:11,dur:3,room:"Emergency OT",patient:"Rahul Sharma",mrn:"MRN-70614",proc:"Craniotomy",surgeon:"Dr. R. Nair",anesth:"Dr. M. Shah",nurse:"N. Reddy",prio:"emerg",status:"Tentative",av:"#3f6212"},
                {id:15,day:12,startH:9,dur:2,room:"Orthopedic OT",patient:"Anita Reddy",mrn:"MRN-70615",proc:"Appendectomy",surgeon:"Dr. L. Khan",anesth:"Dr. K. Menon",nurse:"N. Fernandes",prio:"high",status:"Scheduled",av:"#7c2d12"},
                {id:16,day:12,startH:8,dur:1,room:"OT-01",patient:"Vikram Nair",mrn:"MRN-70616",proc:"Cholecystectomy",surgeon:"Dr. P. Rao",anesth:"Dr. T. Bose",nurse:"N. Pillai",prio:"med",status:"Confirmed",av:"#475569"},
                {id:17,day:13,startH:14,dur:2,room:"OT-02",patient:"Priya Patel",mrn:"MRN-70617",proc:"Hip Replacement",surgeon:"Dr. V. Iyer",anesth:"Dr. M. Shah",nurse:"N. Sharma",prio:"routine",status:"Tentative",av:"#0f766e"},
                {id:18,day:14,startH:15,dur:1,room:"OT-03",patient:"Suresh Gupta",mrn:"MRN-70618",proc:"Cataract",surgeon:"Dr. A. Mehta",anesth:"Dr. K. Menon",nurse:"N. Das",prio:"routine",status:"Scheduled",av:"#1e40af"},
                {id:19,day:14,startH:9,dur:3,room:"OT-04",patient:"Meera Singh",mrn:"MRN-70619",proc:"C-Section",surgeon:"Dr. S. Kapoor",anesth:"Dr. T. Bose",nurse:"N. Reddy",prio:"med",status:"Confirmed",av:"#4338ca"},
                {id:20,day:15,startH:10,dur:1,room:"Cardiac OT",patient:"Arjun Menon",mrn:"MRN-70620",proc:"Spinal Fusion",surgeon:"Dr. R. Nair",anesth:"Dr. M. Shah",nurse:"N. Fernandes",prio:"high",status:"Tentative",av:"#0e7490"},
                {id:21,day:15,startH:9,dur:1,room:"Neuro OT",patient:"Kavya Das",mrn:"MRN-70621",proc:"Hernia Repair",surgeon:"Dr. L. Khan",anesth:"Dr. K. Menon",nurse:"N. Pillai",prio:"emerg",status:"Scheduled",av:"#334155"},
                {id:22,day:17,startH:11,dur:1,room:"Emergency OT",patient:"Deepak Joshi",mrn:"MRN-70622",proc:"Angioplasty",surgeon:"Dr. P. Rao",anesth:"Dr. T. Bose",nurse:"N. Sharma",prio:"high",status:"Confirmed",av:"#3f6212"},
                {id:23,day:18,startH:15,dur:2,room:"Orthopedic OT",patient:"Neha Verma",mrn:"MRN-70623",proc:"Thyroidectomy",surgeon:"Dr. V. Iyer",anesth:"Dr. M. Shah",nurse:"N. Das",prio:"med",status:"Tentative",av:"#7c2d12"},
                {id:24,day:18,startH:12,dur:2,room:"OT-01",patient:"Rohan Iyer",mrn:"MRN-70624",proc:"CABG",surgeon:"Dr. A. Mehta",anesth:"Dr. K. Menon",nurse:"N. Reddy",prio:"routine",status:"Scheduled",av:"#475569"},
                {id:25,day:19,startH:14,dur:3,room:"OT-02",patient:"Sana Khan",mrn:"MRN-70625",proc:"Knee Replacement",surgeon:"Dr. S. Kapoor",anesth:"Dr. T. Bose",nurse:"N. Fernandes",prio:"routine",status:"Confirmed",av:"#0f766e"},
                {id:26,day:20,startH:12,dur:2,room:"OT-03",patient:"Manoj Rao",mrn:"MRN-70626",proc:"Craniotomy",surgeon:"Dr. R. Nair",anesth:"Dr. M. Shah",nurse:"N. Pillai",prio:"med",status:"Tentative",av:"#1e40af"},
                {id:27,day:20,startH:13,dur:2,room:"OT-04",patient:"Divya Menon",mrn:"MRN-70627",proc:"Appendectomy",surgeon:"Dr. L. Khan",anesth:"Dr. K. Menon",nurse:"N. Sharma",prio:"high",status:"Scheduled",av:"#4338ca"},
                {id:28,day:21,startH:10,dur:2,room:"Cardiac OT",patient:"Rahul Sharma",mrn:"MRN-70628",proc:"Cholecystectomy",surgeon:"Dr. P. Rao",anesth:"Dr. T. Bose",nurse:"N. Das",prio:"emerg",status:"Confirmed",av:"#0e7490"},
                {id:29,day:21,startH:8,dur:2,room:"Neuro OT",patient:"Anita Reddy",mrn:"MRN-70629",proc:"Hip Replacement",surgeon:"Dr. V. Iyer",anesth:"Dr. M. Shah",nurse:"N. Reddy",prio:"high",status:"Tentative",av:"#334155"},
                {id:30,day:21,startH:11,dur:2,room:"Emergency OT",patient:"Vikram Nair",mrn:"MRN-70630",proc:"Cataract",surgeon:"Dr. A. Mehta",anesth:"Dr. K. Menon",nurse:"N. Fernandes",prio:"med",status:"Scheduled",av:"#3f6212"},
                {id:31,day:24,startH:8,dur:2,room:"Orthopedic OT",patient:"Priya Patel",mrn:"MRN-70631",proc:"C-Section",surgeon:"Dr. S. Kapoor",anesth:"Dr. T. Bose",nurse:"N. Pillai",prio:"routine",status:"Confirmed",av:"#7c2d12"},
                {id:32,day:28,startH:14,dur:1,room:"OT-01",patient:"Suresh Gupta",mrn:"MRN-70632",proc:"Spinal Fusion",surgeon:"Dr. R. Nair",anesth:"Dr. M. Shah",nurse:"N. Sharma",prio:"routine",status:"Tentative",av:"#475569"},
                {id:33,day:28,startH:10,dur:3,room:"OT-02",patient:"Meera Singh",mrn:"MRN-70633",proc:"Hernia Repair",surgeon:"Dr. L. Khan",anesth:"Dr. K. Menon",nurse:"N. Das",prio:"med",status:"Scheduled",av:"#0f766e"},
                {id:34,day:29,startH:8,dur:3,room:"OT-03",patient:"Arjun Menon",mrn:"MRN-70634",proc:"Angioplasty",surgeon:"Dr. P. Rao",anesth:"Dr. T. Bose",nurse:"N. Reddy",prio:"high",status:"Confirmed",av:"#1e40af"},
                {id:35,day:30,startH:8,dur:3,room:"OT-04",patient:"Kavya Das",mrn:"MRN-70635",proc:"Thyroidectomy",surgeon:"Dr. V. Iyer",anesth:"Dr. M. Shah",nurse:"N. Fernandes",prio:"emerg",status:"Tentative",av:"#4338ca"},
                {id:36,day:30,startH:8,dur:3,room:"Cardiac OT",patient:"Deepak Joshi",mrn:"MRN-70636",proc:"CABG",surgeon:"Dr. A. Mehta",anesth:"Dr. K. Menon",nurse:"N. Pillai",prio:"high",status:"Scheduled",av:"#0e7490"},
                {id:37,day:31,startH:15,dur:1,room:"Neuro OT",patient:"Neha Verma",mrn:"MRN-70637",proc:"Knee Replacement",surgeon:"Dr. S. Kapoor",anesth:"Dr. T. Bose",nurse:"N. Sharma",prio:"med",status:"Confirmed",av:"#334155"},
                {id:38,day:17,startH:15,dur:3,room:"Emergency OT",patient:"Rohan Iyer",mrn:"MRN-70638",proc:"Craniotomy",surgeon:"Dr. R. Nair",anesth:"Dr. M. Shah",nurse:"N. Das",prio:"routine",status:"Tentative",av:"#3f6212"},
                {id:39,day:17,startH:12,dur:1,room:"Orthopedic OT",patient:"Sana Khan",mrn:"MRN-70639",proc:"Appendectomy",surgeon:"Dr. L. Khan",anesth:"Dr. K. Menon",nurse:"N. Reddy",prio:"routine",status:"Scheduled",av:"#7c2d12"},
                {id:40,day:17,startH:14,dur:1,room:"OT-01",patient:"Manoj Rao",mrn:"MRN-70640",proc:"Cholecystectomy",surgeon:"Dr. P. Rao",anesth:"Dr. T. Bose",nurse:"N. Fernandes",prio:"med",status:"Confirmed",av:"#475569"},
                {id:41,day:17,startH:10,dur:2,room:"OT-02",patient:"Divya Menon",mrn:"MRN-70641",proc:"Hip Replacement",surgeon:"Dr. V. Iyer",anesth:"Dr. M. Shah",nurse:"N. Pillai",prio:"high",status:"Tentative",av:"#0f766e"},
                {id:42,day:8,startH:16,dur:2,room:"Neuro OT",patient:"Farah Sheikh",mrn:"MRN-70642",proc:"Thyroidectomy",surgeon:"Dr. V. Iyer",anesth:"Dr. M. Shah",nurse:"N. Pillai",prio:"high",status:"Confirmed",av:"#7c3aed"}];
            let focusId=0;

            function overlaps(a,b){ return a.id!==b.id&&a.day===b.day&&a.room===b.room&&a.startH<b.startH+b.dur&&b.startH<a.startH+a.dur; }
            function isConflict(e){ return EVENTS.some(x=>overlaps(e,x)); }
            function conflictList(){ const seen=new Set(),out=[]; EVENTS.forEach(e=>{ EVENTS.forEach(x=>{ if(overlaps(e,x)){ const key=[Math.min(e.id,x.id),Math.max(e.id,x.id)].join('-'); if(!seen.has(key)){ seen.add(key); out.push([e,x]); } } }); }); return out; }

            /* ============ HERO COUNTS ============ */
            function updateCounts(){
                $('#oc-h-today').textContent=EVENTS.filter(e=>e.day===curDay).length;
                $('#oc-h-avail').textContent=Math.max(0,ROOMS.length-EVENTS.filter(e=>e.day===curDay).length);
                $('#oc-h-week').textContent=EVENTS.filter(e=>Math.abs(e.day-curDay)<=3).length;
                const nc=conflictList().length; $('#oc-h-conf').textContent=nc; $('#oc-conf-count').textContent=nc;
            }

            /* ============ CALENDAR VIEWS ============ */
            const MON=['January','February','March','April','May','June','July','August','September','October','November','December'];
            const DOW=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
            function renderCalendar(){
                $('#oc-caltitle').textContent=curView==='month'?`${MON[curM]} ${curY}`:curView==='week'?`Week of ${MON[curM]} ${curDay}`:curView==='day'?`${MON[curM]} ${curDay}, ${curY}`:curView==='timeline'?`Timeline · ${MON[curM]} ${curDay}`:`OT Resource · ${MON[curM]} ${curDay}`;
                if(curView==='month') renderMonth();
                else if(curView==='week') renderWeek();
                else if(curView==='day') renderDay();
                else renderResource(curView==='timeline');
            }
            function evtPill(e,compact){
                const c=PRIOC[e.prio], cf=isConflict(e);
                return `<div class="oc-evt ${cf?'conflict':''}" draggable="true" data-evt="${e.id}" data-src="month" style="background:${c}" title="${e.patient} · ${e.proc} · ${e.room} · ${e.startH}:00">
                    ${cf?'<i class="icon-alert-triangle text-[8px]"></i>':''}<span class="truncate">${e.startH}:00 ${e.proc}</span></div>`;
            }
            function renderMonth(){
                const first=new Date(curY,curM,1).getDay(); const days=new Date(curY,curM+1,0).getDate(); const prevDays=new Date(curY,curM,0).getDate();
                let cells=[];
                for(let i=first-1;i>=0;i--) cells.push({d:prevDays-i,dim:true});
                for(let d=1;d<=days;d++) cells.push({d,dim:false});
                while(cells.length%7!==0||cells.length<42) cells.push({d:cells.length-(first+days)+1,dim:true});
                cells=cells.slice(0,42);
                $('#oc-calendar').innerHTML=`
                    <div class="grid grid-cols-7 gap-1px mb-1">${DOW.map(d=>`<div class="text-center text-[11px] font-semibold oc-mut py-1">${d}</div>`).join('')}</div>
                    <div class="oc-monthgrid">${cells.map(c=>{
                        const evs=c.dim?[]:EVENTS.filter(e=>e.day===c.d);
                        const isToday=!c.dim&&c.d===curDay;
                        return `<div class="oc-daycell ${c.dim?'dim':''} ${isToday?'today':''}" data-daydrop="${c.dim?'':c.d}">
                            <div class="flex items-center justify-between"><span class="oc-daynum ${c.dim?'oc-mut':'oc-head'}">${c.d}</span>${evs.length>2?`<span class="text-[9px] oc-mut">+${evs.length-2}</span>`:''}</div>
                            <div class="space-y-0.5 overflow-hidden">${evs.slice(0,3).map(e=>evtPill(e)).join('')}</div>
                        </div>`;
                    }).join('')}</div>`;
            }
            function timeGrid(cols,colLabels,eventsFor,dropAttr){
                const hours=[8,9,10,11,12,13,14,15,16]; const rowH=46;
                let html=`<div class="oc-tgrid" style="grid-template-columns:56px repeat(${cols},minmax(120px,1fr))">`;
                html+=`<div class="oc-thead">Time</div>`+colLabels.map(l=>`<div class="oc-thead">${l}</div>`).join('');
                hours.forEach((h,hi)=>{
                    html+=`<div class="oc-hourlabel">${h}:00</div>`;
                    for(let ci=0;ci<cols;ci++){
                        const blocks=hi===0?eventsFor(ci):[];
                        html+=`<div class="oc-tcell dropcol" data-timedrop="${ci}">${hi===0?blocks.map(e=>{
                            const top=(e.startH-8)*rowH+2, height=e.dur*rowH-6, cf=isConflict(e);
                            return `<div class="oc-block ${cf?'conflict':''}" draggable="true" data-evt="${e.id}" style="top:${top}px;height:${height}px;background:${PRIOC[e.prio]}"><p class="font-semibold truncate">${e.proc}</p><p class="opacity-80 truncate">${e.patient}</p><p class="opacity-70 truncate">${e.startH}:00 · ${e.room}</p></div>`;
                        }).join(''):''}</div>`;
                    }
                });
                html+=`</div>`;
                return `<div class="overflow-x-auto">${html}</div>`;
            }
            function renderWeek(){
                const base=curDay-new Date(curY,curM,curDay).getDay();
                const dayNums=Array.from({length:7},(_,i)=>base+i);
                $('#oc-calendar').innerHTML=timeGrid(7,DOW.map((d,i)=>`${d} ${dayNums[i]>0?dayNums[i]:''}`),ci=>EVENTS.filter(e=>e.day===dayNums[ci]));
            }
            function renderDay(){
                $('#oc-calendar').innerHTML=timeGrid(ROOMS.length,ROOMS,ci=>EVENTS.filter(e=>e.day===curDay&&e.room===ROOMS[ci]));
            }
            function renderResource(timeline){
                // rooms as rows, hours as columns, with buffers
                const hours=[8,9,10,11,12,13,14,15,16]; const colW=104;
                let html=`<div class="overflow-x-auto"><div class="oc-tgrid" style="grid-template-columns:110px repeat(${hours.length},minmax(${colW}px,1fr))">`;
                html+=`<div class="oc-thead">OT Room</div>`+hours.map(h=>`<div class="oc-thead">${h}:00</div>`).join('');
                ROOMS.forEach((r,ri)=>{
                    html+=`<div class="oc-tcell flex items-center px-2 text-xs font-semibold oc-head" style="min-height:52px">${r}</div>`;
                    html+=`<div class="oc-tcell relative" style="grid-column:span ${hours.length}">`;
                    EVENTS.filter(e=>e.day===curDay&&e.room===r).forEach(e=>{
                        const left=(e.startH-8)*colW+2, width=e.dur*colW-4, cf=isConflict(e);
                        html+=`<div class="oc-block ${cf?'conflict':''}" draggable="true" data-evt="${e.id}" style="left:${left}px;width:${width}px;top:3px;height:44px;background:${PRIOC[e.prio]}"><p class="font-semibold truncate">${e.proc} · ${e.patient}</p><p class="opacity-75 truncate">${e.surgeon}</p></div>`;
                        // cleaning buffer after surgery
                        html+=`<div class="oc-buffer" style="left:${left+width+2}px;width:${colW*0.5}px;top:3px;height:44px;background:color-mix(in srgb,#b7791f 16%,transparent);color:#b7791f"><i class="icon-spray-can text-[10px]"></i></div>`;
                    });
                    html+=`</div>`;
                });
                html+=`</div></div>`;
                html+=`<div class="flex flex-wrap gap-3 mt-3 text-[11px]"><span class="flex items-center gap-1.5 oc-mut"><span class="w-3 h-3 rounded" style="background:#0f766e"></span>Surgery</span><span class="flex items-center gap-1.5 oc-mut"><span class="w-3 h-3 rounded" style="background:color-mix(in srgb,#b7791f 30%,transparent)"></span>Cleaning buffer</span><span class="flex items-center gap-1.5 oc-mut"><span class="w-3 h-3 rounded" style="box-shadow:0 0 0 2px #dc2626"></span>Conflict</span></div>`;
                $('#oc-calendar').innerHTML=html;
            }

            /* ============ DRAG & DROP ============ */
            let dragEvtId=null;
            document.addEventListener('dragstart',e=>{ const t=e.target.closest('[data-evt]'); if(t){ dragEvtId=+t.dataset.evt; t.classList.add('drag'); } });
            document.addEventListener('dragend',e=>{ const t=e.target.closest('[data-evt]'); if(t) t.classList.remove('drag'); $$('.oc-daycell,.oc-tcell').forEach(c=>c.classList.remove('dragover')); });
            document.addEventListener('dragover',e=>{ const c=e.target.closest('[data-daydrop],[data-timedrop]'); if(c){ e.preventDefault(); $$('.dragover').forEach(x=>x.classList.remove('dragover')); c.classList.add('dragover'); } });
            document.addEventListener('drop',e=>{
                const dcell=e.target.closest('[data-daydrop]'); const tcell=e.target.closest('[data-timedrop]');
                if(dragEvtId==null) return; const ev=EVENTS.find(x=>x.id===dragEvtId); if(!ev){ dragEvtId=null; return; }
                if(dcell&&dcell.dataset.daydrop){ e.preventDefault(); ev.day=+dcell.dataset.daydrop; refreshSchedule(); toast('Surgery moved to '+MON[curM]+' '+ev.day,'icon-move'); }
                else if(tcell){ e.preventDefault(); const ci=+tcell.dataset.timedrop; if(curView==='week'){ const base=curDay-new Date(curY,curM,curDay).getDay(); ev.day=base+ci; } else if(curView==='day'){ ev.room=ROOMS[ci]; } refreshSchedule(); toast('Surgery rescheduled','icon-move'); }
                dragEvtId=null;
            });

            /* ============ OT AVAILABILITY ============ */
            function renderAvail(){
                $('#oc-avail').innerHTML=ROOMS.map((r,i)=>{
                    const today=EVENTS.filter(e=>e.day===curDay&&e.room===r).sort((a,b)=>a.startH-b.startH);
                    const cur=today[0], next=today[1];
                    const free=today.length===0; const sc=free?'#15803d':'#e06c1f';
                    return `<div class="oc-panel p-3.5">
                        <div class="flex items-center justify-between mb-2"><span class="text-sm font-bold oc-head flex items-center gap-1.5"><span class="oc-iconbadge w-7 h-7" style="color:${sc}"><i class="icon-layout-grid text-sm"></i></span> ${r}</span><span class="oc-chip" style="background:color-mix(in srgb,${sc} 13%,transparent);color:${sc}">${free?'Available':'Booked'}</span></div>
                        <div class="text-[11px] space-y-1">
                            <div class="flex justify-between"><span class="oc-mut">Current</span><span class="oc-head font-medium">${cur?cur.proc+' ('+cur.startH+':00)':'—'}</span></div>
                            <div class="flex justify-between"><span class="oc-mut">Next</span><span class="oc-head font-medium">${next?next.proc+' ('+next.startH+':00)':'None'}</span></div>
                            <div class="flex justify-between"><span class="oc-mut">Equipment</span><span style="color:#15803d"><i class="icon-check text-[11px]"></i> Ready</span></div>
                            <div class="flex justify-between"><span class="oc-mut">Cleaning</span><span class="oc-head">${free?'Done':'Scheduled'}</span></div>
                        </div>
                        <button data-modal="schedule" class="oc-btn oc-btn-ghost w-full justify-center mt-2 !py-1.5 text-xs"><i class="icon-calendar-plus"></i> Book slot</button>
                    </div>`;
                }).join('');
            }

            /* ============ PLANNING PANEL ============ */
            function renderPlanning(){
                const e=EVENTS.find(x=>x.id===focusId)||EVENTS[0]; if(!e){ $('#oc-planning').innerHTML='<p class="oc-mut text-sm">No surgery selected.</p>'; return; } focusId=e.id;
                $('#oc-plan-id').textContent=e.proc+' · '+MON[curM]+' '+e.day;
                const row=(k,v)=>`<div class="flex justify-between text-xs py-1 border-b" style="border-color:var(--oc-border)"><span class="oc-mut">${k}</span><span class="font-medium oc-head">${v}</span></div>`;
                $('#oc-planning').innerHTML=`
                    <div class="flex items-center gap-3 mb-3">
                        <span class="oc-avatar flex-none" style="width:42px;height:42px;background:${e.av};font-size:14px">${initials(e.patient)}</span>
                        <div class="min-w-0 flex-1"><p class="font-bold oc-head">${e.patient}</p><p class="text-[11px] oc-mut">${e.mrn} · ${e.proc}</p></div>
                        <span class="oc-chip pr-${e.prio}" style="background:color-mix(in srgb,${PRIOC[e.prio]} 13%,transparent);color:${PRIOC[e.prio]}">${PRIOL[e.prio]}</span>
                    </div>
                    <div class="grid sm:grid-cols-2 gap-x-4">
                        <div>${row('Procedure',e.proc)}${row('OT Room',e.room)}${row('Date',MON[curM]+' '+e.day)}${row('Time',e.startH+':00')}${row('Duration',e.dur+'h')}</div>
                        <div>${row('Surgeon',e.surgeon)}${row('Anesthesiologist',e.anesth)}${row('OT Nurse',e.nurse)}${row('Status',e.status)}${row('Priority',PRIOL[e.prio])}</div>
                    </div>
                    <div class="mt-3">
                        <p class="text-[11px] font-bold oc-mut uppercase tracking-wide mb-2">Pre-op Checklist</p>
                        <div class="grid sm:grid-cols-2 gap-x-4 gap-y-1">${['Consent signed','Fasting confirmed','Blood cross-matched','Equipment reserved','Anesthesia review','Team briefed'].map(x=>`<label class="flex items-center gap-2 text-xs oc-head"><input type="checkbox" class="accent-[var(--oc-c)]" checked> ${x}</label>`).join('')}</div>
                    </div>
                    `;
            }

            /* ============ CONFLICT CENTER ============ */
            function renderConflicts(){
                const list=conflictList();
                const kinds=['Double Booking','OT Occupied','Surgeon Busy','Equipment Conflict'];
                $('#oc-conflicts').innerHTML=list.length?list.map((pair,i)=>{
                    const [a,b]=pair; const kind=a.surgeon===b.surgeon?'Surgeon Busy':a.room===b.room?'OT Occupied':kinds[i%kinds.length];
                    return `<div class="oc-panel p-3" style="border-left:3px solid #dc2626">
                        <div class="flex items-center justify-between mb-1"><span class="text-sm font-semibold oc-head flex items-center gap-1.5"><i class="icon-alert-triangle text-rose-500 text-[13px]"></i> ${kind}</span><span class="oc-chip" style="background:color-mix(in srgb,#dc2626 12%,transparent);color:#dc2626">${a.room}</span></div>
                        <p class="text-[11px] oc-mut">${a.proc} (${a.startH}:00) &amp; ${b.proc} (${b.startH}:00) — ${MON[curM]} ${a.day}</p>
                        <div class="flex gap-1.5 mt-2">
                            <button data-resolve-move="${b.id}" class="oc-npill hover:bg-[var(--oc-hover)]"><i class="icon-move text-[11px]"></i> Move ${b.proc}</button>
                            <button data-resolve-room="${b.id}" class="oc-npill hover:bg-[var(--oc-hover)]"><i class="icon-layout-grid text-[11px]"></i> New OT</button>
                            <button data-resolve-time="${b.id}" class="oc-npill hover:bg-[var(--oc-hover)]"><i class="icon-clock text-[11px]"></i> Shift time</button>
                        </div>
                    </div>`;
                }).join(''):'<div class="oc-panel p-4 text-center"><p class="text-sm oc-mut"><i class="icon-circle-check text-emerald-500"></i> No scheduling conflicts</p></div>';
            }

            /* ============ STAFF SCHEDULE ============ */
            function renderStaff(){
                const ph=(src,nm)=>`<img class="oc-avatar flex-none" style="width:36px;height:36px" src="${src}" alt="${nm}">`;
                const surg=[['Dr. A. Mehta','Cardiac',3,'Available','assets/img/doctor/doctor-02.jpg'],['Dr. R. Nair','Ortho',2,'In Surgery','assets/img/doctor/doctor-04.jpg'],['Dr. S. Kapoor','Neuro',1,'Available','assets/img/doctor/doctor-09.jpg'],['Dr. L. Khan','General',2,'Off at 2 PM','assets/img/doctor/doctor-06.jpg']];
                const anes=[['Dr. K. Menon',2,'Assigned','assets/img/doctor/doctor-12.jpg'],['Dr. T. Bose',1,'Available','assets/img/doctor/doctor-10.jpg']];
                const nur=[['N. Fernandes','Cardiac OT','Day','assets/img/avatar/avatar-08.jpg'],['N. Das','OT-03','Day','assets/img/avatar/avatar-11.jpg']];
                $('#oc-staff').innerHTML=`
                    <div><p class="text-[11px] font-bold oc-mut uppercase tracking-wide mb-2">Surgeons</p><div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    ${surg.map((x)=>`<div class="oc-panel p-3"><div class="flex items-center gap-2.5">${ph(x[4],x[0])}<div class="min-w-0 flex-1"><p class="text-sm font-semibold oc-head truncate">${x[0]}</p><p class="text-[10px] oc-mut">${x[1]} · ${x[2]} surgeries</p></div></div><div class="mt-2"><span class="oc-chip" style="background:color-mix(in srgb,${x[3]==='Available'?'#15803d':'#e06c1f'} 13%,transparent);color:${x[3]==='Available'?'#15803d':'#e06c1f'}">${x[3]}</span></div></div>`).join('')}
                    </div></div>
                    <div class="grid sm:grid-cols-2 gap-3">
                        <div><p class="text-[11px] font-bold oc-mut uppercase tracking-wide mb-2">Anesthesiologists</p><div class="grid grid-cols-2 gap-2">${anes.map((x)=>`<div class="oc-panel p-3"><div class="flex items-center gap-2.5">${ph(x[3],x[0])}<div class="min-w-0 flex-1"><p class="text-sm font-semibold oc-head truncate">${x[0]}</p><p class="text-[10px] oc-mut">${x[1]} today</p></div></div><span class="oc-chip mt-2 inline-flex" style="background:color-mix(in srgb,${x[2]==='Available'?'#15803d':'#e06c1f'} 13%,transparent);color:${x[2]==='Available'?'#15803d':'#e06c1f'}">${x[2]}</span></div>`).join('')}</div></div>
                        <div><p class="text-[11px] font-bold oc-mut uppercase tracking-wide mb-2">OT Nurses</p><div class="grid grid-cols-2 gap-2">${nur.map((x)=>`<div class="oc-panel p-3"><div class="flex items-center gap-2.5">${ph(x[3],x[0])}<div class="min-w-0 flex-1"><p class="text-sm font-semibold oc-head truncate">${x[0]}</p><p class="text-[10px] oc-mut">${x[1]} · ${x[2]}</p></div></div></div>`).join('')}</div></div>
                    </div>`;
            }

            /* ============ DRAWER ============ */
            function openDrawer(id){
                const e=EVENTS.find(x=>x.id===id); if(!e) return; const c=PRIOC[e.prio];
                const box=(t,ic,body)=>`<div class="oc-panel p-3"><p class="text-[11px] font-bold oc-mut uppercase tracking-wide mb-2 flex items-center gap-1.5"><i class="${ic} oc-hicon text-[13px]"></i> ${t}</p>${body}</div>`;
                const row=(k,v)=>`<div class="flex justify-between text-xs py-0.5"><span class="oc-mut">${k}</span><span class="font-medium oc-head">${v}</span></div>`;
                $('#oc-drawer').innerHTML=`
                  <div class="p-4 border-b sticky top-0 z-10 flex items-center justify-between" style="background:var(--oc-elev);border-color:var(--oc-border)">
                    <div class="flex items-center gap-3"><span class="oc-avatar flex-none" style="width:44px;height:44px;background:${e.av};font-size:14px">${initials(e.patient)}</span><div><p class="font-bold oc-head">${e.patient}</p><p class="text-[11px] oc-mut">${e.mrn} · ${e.proc}</p></div></div>
                    <button data-close class="w-8 h-8 rounded-lg hover:bg-[var(--oc-hover)] flex items-center justify-center oc-mut"><i class="icon-x"></i></button>
                  </div>
                  <div class="p-4 space-y-3">
                    <div class="flex items-center gap-2 flex-wrap"><span class="oc-chip" style="background:color-mix(in srgb,${c} 14%,transparent);color:${c}">${PRIOL[e.prio]}</span><span class="oc-npill">${e.status}</span>${isConflict(e)?'<span class="oc-chip" style="background:color-mix(in srgb,#dc2626 13%,transparent);color:#dc2626"><i class="icon-alert-triangle text-[10px]"></i> Conflict</span>':''}</div>
                    ${box('Schedule','icon-calendar',row('Date',MON[curM]+' '+e.day+', '+curY)+row('Time',e.startH+':00')+row('Duration',e.dur+'h')+row('OT Room',e.room))}
                    ${box('Procedure','icon-slice',row('Surgery',e.proc)+row('Priority',PRIOL[e.prio])+row('Status',e.status))}
                    ${box('Surgical Team','icon-users',row('Surgeon',e.surgeon)+row('Anesthesiologist',e.anesth)+row('OT Nurse',e.nurse))}
                    ${box('Equipment','icon-cpu','<div class="flex flex-wrap gap-1">'+['Anesthesia machine','Surgical lights','Electrocautery'].map(x=>`<span class="oc-npill">${x}</span>`).join('')+'</div>')}
                    ${box('Checklist','icon-clipboard-check',['Consent signed','Fasting confirmed','Cross-matched','Team briefed'].map(x=>`<label class="flex items-center gap-2 text-xs py-0.5 oc-head"><input type="checkbox" class="accent-[var(--oc-c)]" checked> ${x}</label>`).join(''))}
                    <div class="grid grid-cols-2 gap-2">
                        <button data-modal="edit" class="oc-btn oc-btn-ghost justify-center"><i class="icon-edit"></i> Edit</button>
                        <button data-modal="team" class="oc-btn oc-btn-ghost justify-center"><i class="icon-users"></i> Team</button>
                        <button data-modal="emergency" class="oc-btn oc-btn-ghost justify-center"><i class="icon-alert-triangle"></i> Escalate</button>
                        <button data-del-evt="${e.id}" class="oc-btn oc-btn-ghost justify-center"><i class="icon-trash-2"></i> Cancel</button>
                    </div>
                  </div>`;
                $('#oc-drawer').classList.add('open');
                document.body.style.overflow='hidden';
            }
            function closeDrawer(){ $('#oc-drawer').classList.remove('open'); document.body.style.overflow=''; }

            /* ============ MENU ============ */
            const ACTIONS=[['Quick Edit','icon-edit','edit'],['Assign Team','icon-users','team'],['View Details','icon-eye','view'],['Move Date','icon-move','move'],['Duplicate','icon-copy','dup'],['Mark Confirmed','icon-circle-check','confirm'],['sep'],['Delete','icon-trash-2','delete']];
            function openMenu(id,x,y){ closeMenu(); $('#oc-menuhost').innerHTML=`<div class="oc-menu" id="oc-openmenu">${ACTIONS.map(a=>a[0]==='sep'?'<div class="oc-menu-sep"></div>':`<button data-action="${a[2]}" data-eid="${id}" class="${a[2]==='delete'?'danger':''}"><i class="${a[1]}"></i> ${a[0]}</button>`).join('')}</div>`; const m=$('#oc-openmenu'); const r=m.getBoundingClientRect(); m.style.left=Math.max(12,Math.min(x,window.innerWidth-r.width-12))+'px'; m.style.top=Math.max(12,Math.min(y,window.innerHeight-r.height-12))+'px'; }
            function closeMenu(){ $('#oc-menuhost').innerHTML=''; }

            /* ============ MODALS ============ */
            const fld=(l,el)=>`<div><label class="oc-formlabel">${l}</label>${el}</div>`;
            const inp=(ph)=>`<input class="oc-in mt-1" placeholder="${ph||''}">`;
            const selE=(o)=>`<select class="oc-in mt-1">${o.map(x=>`<option>${x}</option>`).join('')}</select>`;
            const drop=(t)=>`<div class="oc-drop rounded-xl h-28 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[var(--oc-hover)]"><i class="icon-cloud-upload text-3xl oc-mut"></i><p class="text-sm font-semibold mt-1 oc-head">${t}</p></div>`;
            const MODALS={
                schedule:{t:'Schedule Surgery',sub:'Add a surgery to the calendar',ic:'icon-calendar-plus',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('Patient / MRN',inp('Search...'))}${fld('Procedure',selE(PROCS))}${fld('OT Room',selE(ROOMS))}${fld('Surgeon',selE(SURGEONS))}${fld('Date & Time',`<input type="text" placeholder="dd-mm-yyyy --:--" class="oc-in mt-1" data-provider="flatpickr" data-date-format="d-m-Y" data-enable-time>`)}${fld('Duration (h)',inp('2'))}${fld('Anesthesiologist',selE(ANESTH))}${fld('Priority',selE(['Routine','Medium','High','Emergency']))}</div>`,cta:'Schedule'},
                edit:{t:'Edit Schedule',sub:'Update surgery details',ic:'icon-edit',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('OT Room',selE(ROOMS))}${fld('Date & Time',`<input type="text" placeholder="dd-mm-yyyy --:--" class="oc-in mt-1" data-provider="flatpickr" data-date-format="d-m-Y" data-enable-time>`)}${fld('Duration (h)',inp('2'))}${fld('Status',selE(['Scheduled','Confirmed','Tentative']))}</div>`,cta:'Save Changes'},
                emergency:{t:'Emergency Booking',sub:'Insert an urgent case',ic:'icon-alert-triangle',body:`<div class="rounded-lg p-2.5 text-xs mb-3 flex items-center gap-2" style="background:color-mix(in srgb,#dc2626 11%,transparent);color:#dc2626;border:1px solid color-mix(in srgb,#dc2626 30%,transparent)"><i class="icon-alert-triangle"></i> Finds the next available emergency slot.</div><div class="grid sm:grid-cols-2 gap-3">${fld('Patient / Unknown',inp('Name or "Unknown"'))}${fld('Procedure',selE(PROCS))}${fld('OT',selE(['Auto — next free','OT-01','OT-02']))}${fld('Surgeon On-call',selE(SURGEONS))}</div>`,cta:'Book Emergency'},
                team:{t:'Assign Team',sub:'Compose the surgical team',ic:'icon-users',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('Lead Surgeon',selE(SURGEONS))}${fld('Assistant',selE(SURGEONS))}${fld('Anesthesiologist',selE(ANESTH))}${fld('Scrub Nurse',selE(NURSES))}${fld('Circulating Nurse',selE(NURSES))}${fld('Technician',selE(['Tech A','Tech B']))}</div>`,cta:'Assign Team'},
                block:{t:'Block OT',sub:'Reserve a theater (no surgery)',ic:'icon-ban',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('OT Room',selE(ROOMS))}${fld('Reason',selE(['Maintenance','Deep Cleaning','Equipment Install','Training']))}${fld('From',`<input type="text" placeholder="dd-mm-yyyy --:--" class="oc-in mt-1" data-provider="flatpickr" data-date-format="d-m-Y" data-enable-time>`)}${fld('To',`<input type="text" placeholder="dd-mm-yyyy --:--" class="oc-in mt-1" data-provider="flatpickr" data-date-format="d-m-Y" data-enable-time>`)}</div>`,cta:'Block OT'},
                import:{t:'Import',sub:'Bulk-load a surgery schedule',ic:'icon-upload',body:`<div class="flex gap-2 mb-3">${['CSV','Excel','Surgery Schedule'].map(f=>`<span class="oc-npill">${f}</span>`).join('')}</div>${drop('Drop CSV / Excel file')}<button class="text-xs font-semibold text-[color:var(--oc-accent)] hover:underline mt-2"><i class="icon-download"></i> Download sample template</button><div class="mt-3 rounded-lg p-3 text-xs flex items-center gap-2" style="background:color-mix(in srgb,#15803d 11%,transparent);color:#15803d;border:1px solid color-mix(in srgb,#15803d 28%,transparent)"><i class="icon-circle-check"></i> Validation passed · 24 surgeries · 2 conflicts flagged</div>`,cta:'Import'},
                export:{t:'Export',sub:'Export the schedule',ic:'icon-download',body:`<p class="text-xs oc-mut mb-2">Choose a format &amp; scope</p><div class="grid grid-cols-2 gap-2">${['CSV','Excel','PDF','Print','iCal (.ics)','Weekly Schedule','Surgeon Schedule','OT Utilization','Selected','All Records'].map(f=>`<button data-expfmt="${f}" class="oc-btn oc-btn-ghost justify-center">${f}</button>`).join('')}</div>`,cta:'Export'},
            };
            function openModal(key){ const m=MODALS[key]; if(!m) return; document.body.style.overflow='hidden'; $('#oc-modalhost').innerHTML=`<div class="oc-modal-wrap open"><div class="oc-modal-bg" data-close></div><div class="oc-modal">
                <div class="oc-modal-head"><span class="oc-modal-badge"><i class="${m.ic}"></i></span><div class="min-w-0"><h3 class="font-bold oc-head leading-tight">${m.t}</h3><p class="text-[11px] oc-mut">${m.sub||''}</p></div><button data-close class="ml-auto w-8 h-8 rounded-lg hover:bg-[var(--oc-hover)] flex items-center justify-center oc-mut"><i class="icon-x"></i></button></div>
                <div class="oc-modal-body">${m.body}</div>
                <div class="oc-modal-foot"><button data-close class="oc-btn oc-btn-ghost">Cancel</button><button data-modalok="${key}" class="oc-btn oc-btn-primary"><i class="${m.ic}"></i> ${m.cta}</button></div>
            </div></div>`;
                // Modal HTML is injected after the page's initial-load flatpickr auto-init has
                // already run, so any date fields inside it must be initialized here instead.
                if(typeof flatpickr!=="undefined"){
                    $$('[data-provider="flatpickr"]',$('#oc-modalhost')).forEach(function(el){
                        if(el._flatpickr) return;
                        const config={disableMobile:true};
                        if(el.hasAttribute('data-date-format')) config.dateFormat=el.getAttribute('data-date-format');
                        if(el.hasAttribute('data-enable-time')){ config.enableTime=true; config.dateFormat=(config.dateFormat||'Y-m-d')+' H:i'; }
                        flatpickr(el,config);
                    });
                }
            }
            function openDelete(msg,onOk){ document.body.style.overflow='hidden'; $('#oc-modalhost').innerHTML=`<div class="oc-modal-wrap open"><div class="oc-modal-bg" data-close></div><div class="oc-modal" style="width:min(420px,94vw)"><div class="p-5 text-center"><div class="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style="background:color-mix(in srgb,#dc2626 13%,transparent);color:#dc2626"><i class="icon-alert-triangle text-2xl"></i></div><h3 class="font-bold text-lg oc-head">Confirm</h3><p class="text-xs oc-mut mt-1">${msg}</p><div class="flex gap-2 mt-4"><button data-close class="oc-btn oc-btn-ghost flex-1 justify-center">Cancel</button><button id="oc-delok" class="oc-btn oc-btn-danger flex-1 justify-center">Delete</button></div></div></div></div>`; $('#oc-delok').onclick=()=>{ onOk(); closeModal(); }; }
            function closeModal(){ $('#oc-modalhost').innerHTML=''; if(!$('#oc-drawer').classList.contains('open')) document.body.style.overflow=''; }

            /* ============ HELPERS ============ */
            function refreshSchedule(){ renderCalendar(); renderAvail(); renderPlanning(); renderConflicts(); updateCounts(); }

            /* ============ EVENTS ============ */
            document.addEventListener('click',e=>{
                if(e.target.closest('[data-cv]')){ const b=e.target.closest('[data-cv]'); curView=b.dataset.cv; $$('#oc-viewtabs button').forEach(x=>x.classList.toggle('on',x===b)); renderCalendar(); return; }
                if(e.target.closest('[data-nav]')){ const v=e.target.closest('[data-nav]').dataset.nav;
                    if(v==='today'){ curM=6; curY=2026; curDay=17; }
                    else if(curView==='month'){ curM+=(+v); if(curM<0){curM=11;curY--;} if(curM>11){curM=0;curY++;} }
                    else { curDay+=(+v)*(curView==='week'?7:1); if(curDay<1) curDay=1; }
                    renderCalendar(); return; }
                if(e.target.closest('[data-resolve-move]')){ const ev=EVENTS.find(x=>x.id===+e.target.closest('[data-resolve-move]').dataset.resolveMove); if(ev){ev.day+=1;} refreshSchedule(); toast('Moved to next day','icon-move'); return; }
                if(e.target.closest('[data-resolve-room]')){ const ev=EVENTS.find(x=>x.id===+e.target.closest('[data-resolve-room]').dataset.resolveRoom); if(ev){ev.room=ROOMS[(ROOMS.indexOf(ev.room)+1)%ROOMS.length];} refreshSchedule(); toast('Reassigned OT','icon-layout-grid'); return; }
                if(e.target.closest('[data-resolve-time]')){ const ev=EVENTS.find(x=>x.id===+e.target.closest('[data-resolve-time]').dataset.resolveTime); if(ev){ev.startH=Math.min(16,ev.startH+ev.dur);} refreshSchedule(); toast('Shifted time slot','icon-clock'); return; }
                if(e.target.closest('[data-open-drawer]')){ openDrawer(+e.target.closest('[data-open-drawer]').dataset.openDrawer); return; }
                if(e.target.closest('[data-del-evt]')){ const id=+e.target.closest('[data-del-evt]').dataset.delEvt; openDelete('Cancel this scheduled surgery?',()=>{ EVENTS=EVENTS.filter(x=>x.id!==id); closeDrawer(); refreshSchedule(); toast('Surgery cancelled','icon-trash-2'); }); return; }
                // event pill/block: left-click focus+drawer, but allow menu via dedicated handler
                const evEl=e.target.closest('[data-evt]');
                if(evEl){ focusId=+evEl.dataset.evt; renderPlanning(); openDrawer(focusId); return; }
                const t=e.target.closest('[data-modal],[data-modalok],[data-close],[data-action],[data-expfmt]');
                if(!t){ if(!e.target.closest('.oc-menu')) closeMenu(); return; }
                if(t.dataset.modal!==undefined){ openModal(t.dataset.modal); return; }
                if(t.dataset.modalok!==undefined){ const k=t.dataset.modalok; if(k==='schedule'||k==='emergency'){ const ev=mkEvent(curDay); ev.prio=k==='emergency'?'emerg':'routine'; EVENTS.push(ev); refreshSchedule(); } toast(MODALS[k].cta+' — done','icon-check'); closeModal(); return; }
                if(t.dataset.expfmt!==undefined){ toast('Exported: '+t.dataset.expfmt,'icon-download'); closeModal(); return; }
                if(t.dataset.close!==undefined){ closeModal(); closeDrawer(); return; }
                if(t.dataset.action!==undefined){ const a=t.dataset.action, id=+t.dataset.eid; closeMenu(); const ev=EVENTS.find(x=>x.id===id); focusId=id;
                    if(a==='view') openDrawer(id);
                    else if(a==='move'){ if(ev) ev.day+=1; refreshSchedule(); toast('Moved to next day','icon-move'); }
                    else if(a==='dup'){ if(ev){ const c=Object.assign({},ev); c.id=seq++; c.startH=Math.min(16,ev.startH+ev.dur); EVENTS.push(c);} refreshSchedule(); toast('Surgery duplicated','icon-copy'); }
                    else if(a==='confirm'){ if(ev) ev.status='Confirmed'; refreshSchedule(); toast('Marked confirmed','icon-circle-check'); }
                    else if(a==='delete') openDelete('Delete this surgery?',()=>{ EVENTS=EVENTS.filter(x=>x.id!==id); refreshSchedule(); toast('Deleted','icon-trash-2'); });
                    else if(MODALS[a]) openModal(a);
                    return; }
            });
            // right-click on events → context menu
            document.addEventListener('contextmenu',e=>{ const evEl=e.target.closest('[data-evt]'); if(evEl){ e.preventDefault(); openMenu(+evEl.dataset.evt,e.clientX,e.clientY); } });

            function clock(){ $('#oc-clock').textContent=new Date().toLocaleTimeString('en-GB'); }

            /* ============ INIT ============ */
            // renderCalendar/renderAvail/renderPlanning/renderConflicts/updateCounts are
            // now pre-rendered as static HTML (#oc-calendar, #oc-avail, #oc-planning,
            // #oc-plan-id, #oc-conflicts, #oc-conf-count, #oc-caltitle, #oc-h-today,
            // #oc-h-avail, #oc-h-week, #oc-h-conf) instead of being generated here on
            // load. They still run on every later interaction (view/nav, drag & drop,
            // conflict resolve, schedule/duplicate/delete). renderStaff() has no
            // interactive trigger (#oc-staff is now static HTML too) so it is no longer
            // called at all.
            setTimeout(()=>{
                $('#oc-skeleton').classList.add('hidden');
                $('#oc-content').classList.remove('hidden');
                clock(); setInterval(clock,1000);
            },1400);
        })();

// ==========================================================================
// queue-management.js
// ==========================================================================
// Dreams HMS — Queue Management
(function () {
    "use strict";
    if ((location.pathname.split("/").pop() || "index.html") !== "queue-management.html") return;

    const $ = (id) => document.getElementById(id);
    const tbody = $("tbody");
    if (!tbody) return;
    const detailUrl = (r) => "queue-token-detail.html?" + new URLSearchParams({ id: r.id, token: r.token, patient: r.patient, status: r.status }).toString();

    const STATUS = {
        Waiting: "badge-amber",
        Called: "badge-blue",
        "In Consultation": "badge-purple",
        "On Hold": "badge-gray",
        Completed: "badge-green",
        Skipped: "badge-red",
    };
    const PRIORITY = {
        Normal: "badge-gray",
        Urgent: "badge-amber",
        Critical: "badge-red",
    };

    let data = [
        { id: 1, token: "A-101", patient: "James Morrison", phone: "(212) 555-0147", doctor: "Dr. Sarah Chen", room: "Room 204", wait: 4, priority: "Normal", status: "In Consultation" },
        { id: 2, token: "A-102", patient: "Linda Whitfield", phone: "(212) 555-0182", doctor: "Dr. Sarah Chen", room: "Room 204", wait: 11, priority: "Normal", status: "Called" },
        { id: 3, token: "A-103", patient: "Robert Castillo", phone: "(646) 555-0113", doctor: "Dr. Sarah Chen", room: "Room 204", wait: 18, priority: "Urgent", status: "Waiting" },
        { id: 4, token: "B-201", patient: "Angela Brooks", phone: "(718) 555-0164", doctor: "Dr. Michael Reyes", room: "Room 118", wait: 6, priority: "Normal", status: "In Consultation" },
        { id: 5, token: "B-202", patient: "Marcus Delgado", phone: "(347) 555-0198", doctor: "Dr. Michael Reyes", room: "Room 118", wait: 23, priority: "Normal", status: "Waiting" },
        { id: 6, token: "B-203", patient: "Priya Raghavan", phone: "(212) 555-0121", doctor: "Dr. Michael Reyes", room: "Room 118", wait: 31, priority: "Critical", status: "Waiting" },
        { id: 7, token: "C-301", patient: "Daniel Kowalski", phone: "(917) 555-0176", doctor: "Dr. Emily Carter", room: "Room 302", wait: 9, priority: "Normal", status: "On Hold" },
        { id: 8, token: "C-302", patient: "Sofia Alvarez", phone: "(646) 555-0155", doctor: "Dr. Emily Carter", room: "Room 302", wait: 14, priority: "Urgent", status: "Waiting" },
        { id: 9, token: "C-303", patient: "Gregory Hollis", phone: "(718) 555-0139", doctor: "Dr. Emily Carter", room: "Room 302", wait: 0, priority: "Normal", status: "Completed" },
        { id: 10, token: "D-401", patient: "Naomi Fitzgerald", phone: "(212) 555-0190", doctor: "Dr. David Okonkwo", room: "Room 106", wait: 0, priority: "Normal", status: "Completed" },
        { id: 11, token: "D-402", patient: "Ethan Caldwell", phone: "(347) 555-0102", doctor: "Dr. David Okonkwo", room: "Room 106", wait: 27, priority: "Normal", status: "Waiting" },
        { id: 12, token: "D-403", patient: "Camille Rousseau", phone: "(917) 555-0128", doctor: "Dr. David Okonkwo", room: "Room 106", wait: 35, priority: "Urgent", status: "Waiting" },
        { id: 13, token: "A-104", patient: "Theodore Nakamura", phone: "(646) 555-0187", doctor: "Dr. Sarah Chen", room: "Room 204", wait: 42, priority: "Normal", status: "Skipped" },
        { id: 14, token: "B-204", patient: "Hannah Whitmore", phone: "(212) 555-0163", doctor: "Dr. Michael Reyes", room: "Room 118", wait: 8, priority: "Normal", status: "Waiting" },
    ];

    const PRIORITY_RANK = { Critical: 0, Urgent: 1, Normal: 2 };

    function stats() {
        $("stat-waiting").textContent = data.filter((r) => r.status === "Waiting").length;
        $("stat-called").textContent = data.filter((r) => r.status === "Called").length;
        $("stat-consult").textContent = data.filter((r) => r.status === "In Consultation").length;
        $("stat-completed").textContent = data.filter((r) => r.status === "Completed").length;
    }

    function nextInLine() {
        return data
            .filter((r) => r.status === "Waiting")
            .sort(function (a, b) {
                const p = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
                return p !== 0 ? p : b.wait - a.wait;
            })[0];
    }

    function nowServing() {
        const current = data.find((r) => r.status === "In Consultation") || data.find((r) => r.status === "Called");
        $("now-token").textContent = current ? current.token : "—";
        $("now-patient").textContent = current ? current.patient : "No patient called";
        $("now-doctor").textContent = current ? current.doctor : "—";
        $("now-room").textContent = current ? current.room : "—";
        const next = nextInLine();
        $("now-next").textContent = next ? "Next up: " + next.token + " · " + next.patient : "Next up: queue is clear";
    }

    function waitCell(r) {
        if (r.status === "Completed") return '<span class="text-gray-400">—</span>';
        const cls = r.wait >= 30 ? "text-danger font-semibold" : r.wait >= 15 ? "text-amber-600 font-medium" : "text-gray-600 dark:text-gray-400";
        return '<span class="' + cls + '">' + r.wait + " min</span>";
    }

    // --- Statistics (Appointment module component) ---------------------------
    MC.apptStats($("stats-row"), [
        { id: "stat-waiting", icon: "icon-hourglass", label: "Waiting", tone: "amber", delta: 5.4, meta: "vs 1 hour ago", spark: [3, 5, 4, 6, 7, 6, 8] },
        { id: "stat-called", icon: "icon-bell-ring", label: "Called", tone: "sky", delta: 0, meta: "vs 1 hour ago", spark: [1, 2, 1, 2, 1, 2, 1] },
        { id: "stat-consult", icon: "icon-stethoscope", label: "In Consultation", tone: "purple", delta: 2.1, meta: "vs 1 hour ago", spark: [2, 3, 2, 4, 3, 4, 3] },
        { id: "stat-completed", icon: "icon-circle-check", label: "Completed", tone: "emerald", delta: 18.6, meta: "vs 1 hour ago", spark: [2, 4, 6, 8, 10, 12, 14] },
    ]);

    const grid = MC.grid({
        tbody: tbody,
        data: data,
        pageSize: 10,
        skipInitialRender: true,
        search: $("search"),
        filters: [
            { el: $("filter-doctor"), match: (r, v) => r.doctor === v },
            { el: $("filter-priority"), match: (r, v) => r.priority === v },
            { el: $("filter-status"), match: (r, v) => r.status === v },
        ],
        info: $("info"),
        pager: $("pager"),
        selectAll: $("select-all"),
        bulkBar: $("bulk-bar"),
        bulkCount: $("bulk-count"),
        empty: { icon: "icon-ticket", title: "Queue is empty", text: "No tokens match the current filters." },
        columns: [
            { render: (r) => '<a href="' + detailUrl(r) + '" class="inline-flex items-center justify-center min-w-14 px-2 py-1 rounded-lg bg-gray-100 dark:bg-slate-800 font-bold text-gray-900 hover:underline">' + r.token + "</a>" },
            {
                render: (r) =>
                    '<div><p class="font-medium text-gray-900">' + r.patient + "</p>" +
                    '<p class="text-xs text-gray-500 dark:text-gray-400">' + r.phone + "</p></div>",
            },
            { render: (r) => r.doctor },
            { render: (r) => r.room },
            { render: waitCell },
            { render: (r) => MC.badge(PRIORITY, r.priority) },
            { render: (r) => MC.badge(STATUS, r.status) },
            {
                cls: "text-right",
                render: (r) =>
                    MC.actions(r.id, [
                        { label: "Call", icon: "icon-bell-ring", act: "call" },
                        { label: "Announce", icon: "icon-volume-2", act: "announce" },
                        { label: "Start Consultation", icon: "icon-play", act: "start" },
                        { label: "Hold", icon: "icon-pause", act: "hold" },
                        { label: "Skip", icon: "icon-skip-forward", act: "skip" },
                        { label: "Complete", icon: "icon-circle-check", act: "complete" },
                        { label: "Print Token", icon: "icon-printer", act: "print" },
                        { label: "Remove", icon: "icon-trash-2", act: "delete", danger: true },
                    ]),
            },
        ],
    });

    function refresh() {
        grid.setData(data);
        stats();
        nowServing();
    }

    // --- Row actions --------------------------------------------------------
    let announceId = null;

    tbody.addEventListener("click", function (e) {
        const btn = e.target.closest("[data-act]");
        if (!btn) return;
        const row = data.find((r) => r.id === parseInt(btn.dataset.id, 10));
        if (!row) return;

        switch (btn.dataset.act) {
            case "announce":
                announceId = row.id;
                $("announce-token").textContent = row.token;
                $("announce-patient").textContent = row.patient;
                $("announce-room").textContent = row.doctor + " · " + row.room;
                MC.openModal("announce-modal");
                return;
            case "call":
                row.status = "Called";
                MC.toast("Called " + row.token + " · " + row.patient);
                break;
            case "start":
                row.status = "In Consultation";
                MC.toast(row.patient + " is now in consultation");
                break;
            case "hold":
                row.status = "On Hold";
                MC.toast(row.token + " placed on hold", "info");
                break;
            case "skip":
                row.status = "Skipped";
                MC.toast(row.token + " skipped", "info");
                break;
            case "complete":
                row.status = "Completed";
                row.wait = 0;
                MC.toast(row.patient + " marked complete");
                break;
            case "print":
                MC.toast("Printing token " + row.token, "info");
                window.print();
                return;
            case "delete":
                MC.confirmDelete(row.token + " · " + row.patient, function () {
                    data = data.filter((r) => r.id !== row.id);
                    MC.toast("Removed from queue");
                    refresh();
                });
                return;
        }
        refresh();
    });

    // --- Call next ----------------------------------------------------------
    $("btn-call-next").addEventListener("click", function () {
        const next = nextInLine();
        if (!next) {
            MC.toast("No patients waiting", "info");
            return;
        }
        data.forEach(function (r) {
            if (r.status === "Called") r.status = "In Consultation";
        });
        next.status = "Called";
        MC.toast("Now calling " + next.token + " · " + next.patient);
        refresh();
    });

    // --- Bulk ---------------------------------------------------------------
    document.querySelectorAll("[data-bulk]").forEach(function (btn) {
        btn.addEventListener("click", function () {
            const ids = grid.selected().map(Number);
            if (!ids.length) return;
            data.forEach(function (r) {
                if (ids.indexOf(r.id) === -1) return;
                if (btn.dataset.bulk === "hold") r.status = "On Hold";
                else {
                    r.status = "Completed";
                    r.wait = 0;
                }
            });
            MC.toast(ids.length + " tokens updated");
            grid.clearSelection();
            refresh();
        });
    });

    // --- Toolbar ------------------------------------------------------------
    $("btn-reset").addEventListener("click", function () {
        $("search").value = "";
        $("filter-doctor").value = "";
        $("filter-priority").value = "";
        $("filter-status").value = "";
        grid.refresh();
        MC.toast("Filters cleared", "info");
    });

    $("btn-print").addEventListener("click", () => window.print());

    $("btn-export").addEventListener("click", function () {
        const head = ["Token", "Patient", "Phone", "Doctor", "Room", "Waiting (min)", "Priority", "Status"];
        const rows = data.map((r) => [r.token, r.patient, r.phone, r.doctor, r.room, r.wait, r.priority, r.status]);
        const csv = [head].concat(rows)
            .map((line) => line.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(","))
            .join("\n");
        const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
        const a = document.createElement("a");
        a.href = url;
        a.download = "queue.csv";
        a.click();
        URL.revokeObjectURL(url);
        MC.toast("Queue exported");
    });

    $("announce-confirm").addEventListener("click", function () {
        const targets = [];
        if ($("an-display").checked) targets.push("display");
        if ($("an-audio").checked) targets.push("audio");
        if ($("an-sms").checked) targets.push("SMS");
        if (!targets.length) {
            MC.toast("Select at least one announcement channel", "error");
            return;
        }
        const row = data.find((r) => r.id === announceId);
        if (row && row.status === "Waiting") row.status = "Called";
        MC.closeModal("announce-modal");
        MC.toast("Announced " + (row ? row.token : "") + " on " + targets.join(", "));
        refresh();
    });

    document.querySelectorAll("[data-close]").forEach(function (btn) {
        btn.addEventListener("click", () => MC.closeModal(btn.dataset.close));
    });
    ["announce-modal", "del-modal"].forEach(MC.closeOnBackdrop);
    MC.initDeleteModal();
    stats();
    nowServing();
})();

// ==========================================================================
// scheduled-sessions.js
// ==========================================================================
            (function () {
                "use strict";
                var page = document.getElementById("ss-page"); if (!page) return;
                function $(s, r) { return (r || document).querySelector(s); }
                function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
                function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }
                function toast(msg, ic){ var w=$("#ss-toast"); var t=document.createElement("div"); t.className="ss-toast"; t.innerHTML='<i class="ti '+(ic||"ti-check")+' text-emerald-400"></i>'+esc(msg); w.appendChild(t); setTimeout(function(){ t.style.opacity="0"; t.style.transform="translateY(12px)"; t.style.transition="all .3s ease"; setTimeout(function(){ t.remove(); },300); },2600); }
                function mix(c,p){ return "color-mix(in srgb,"+c+" "+(p||15)+"%,transparent)"; }
                function ini(n){ return n.replace(/^Dr\.?\s*/i,"").split(" ").map(function(w){return w[0];}).join("").slice(0,2).toUpperCase(); }

                /* ================= DATA ================= */
                var STYPE={"In-person":{c:"#0ea5e9",ic:"ti-user"},"Video":{c:"#6366f1",ic:"ti-video"},"Therapy":{c:"#10b981",ic:"ti-heart-handshake"},"Procedure":{c:"#ec4899",ic:"ti-medical-cross"}};
                var STC={Scheduled:"#0ea5e9",Live:"#10b981",Completed:"#8b5cf6",Cancelled:"#94a3b8"};
                var STIC={Scheduled:"ti-calendar-clock",Live:"ti-player-play",Completed:"ti-circle-check",Cancelled:"ti-ban"};
                var PRIO={High:"#ef4444",Medium:"#f59e0b",Low:"#10b981"};

                // startMin = minutes from midnight (for countdown); day = day-of-month in July
                var SESS=[
                    {id:"SS-3001",pt:"Ravi Kumar",ptc:"#0ea5e9",ptphoto:"assets/img/avatar/avatar-01.jpg",doc:"Dr. Sarah Roberts",docc:"#ef4444",dept:"Cardiology",day:17,time:"09:00 AM",startMin:540,dur:30,stype:"In-person",status:"Completed",prio:"High",progress:100,age:52},
                    {id:"SS-3002",pt:"Anita Desai",ptc:"#8b5cf6",ptphoto:"assets/img/avatar/avatar-03.jpg",doc:"Dr. Vikram Nair",docc:"#8b5cf6",dept:"Neurology",day:17,time:"09:45 AM",startMin:585,dur:45,stype:"Video",status:"Completed",prio:"Medium",progress:100,age:34},
                    {id:"SS-3003",pt:"Mohammed Ali",ptc:"#10b981",ptphoto:"assets/img/avatar/avatar-02.jpg",doc:"Dr. Meera Iyer",docc:"#f59e0b",dept:"Pediatrics",day:17,time:"10:15 AM",startMin:615,dur:20,stype:"In-person",status:"Live",prio:"High",progress:60,age:6},
                    {id:"SS-3004",pt:"Priya Sharma",ptc:"#d946ef",ptphoto:"assets/img/avatar/avatar-04.jpg",doc:"Dr. Priya Sharma",docc:"#d946ef",dept:"Gynecology",day:17,time:"10:40 AM",startMin:640,dur:30,stype:"In-person",status:"Live",prio:"Medium",progress:35,age:29},
                    {id:"SS-3005",pt:"Deepak Nair",ptc:"#6366f1",ptphoto:"assets/img/avatar/avatar-06.jpg",doc:"Dr. Fatima Sheikh",docc:"#a855f7",dept:"Psychiatry",day:17,time:"11:00 AM",startMin:660,dur:40,stype:"Therapy",status:"Live",prio:"Low",progress:15,age:37},
                    {id:"SS-3006",pt:"Sunita Rao",ptc:"#14b8a6",ptphoto:"assets/img/avatar/avatar-05.jpg",doc:"Dr. Rajesh Menon",docc:"#ec4899",dept:"Oncology",day:17,time:"11:30 AM",startMin:690,dur:30,stype:"Procedure",status:"Scheduled",prio:"High",progress:0,age:58},
                    {id:"SS-3007",pt:"John Mathew",ptc:"#f43f5e",ptphoto:"assets/img/avatar/avatar-07.jpg",doc:"Dr. John Mathew",docc:"#f43f5e",dept:"Emergency",day:17,time:"12:00 PM",startMin:720,dur:25,stype:"In-person",status:"Scheduled",prio:"High",progress:0,age:41},
                    {id:"SS-3008",pt:"Karan Malhotra",ptc:"#10b981",ptphoto:"assets/img/avatar/avatar-11.jpg",doc:"Dr. Karan Malhotra",docc:"#10b981",dept:"Dermatology",day:17,time:"12:45 PM",startMin:765,dur:20,stype:"Video",status:"Scheduled",prio:"Low",progress:0,age:48},
                    {id:"SS-3009",pt:"Neha Kapoor",ptc:"#ec4899",ptphoto:"assets/img/avatar/avatar-08.jpg",doc:"Dr. Sarah Roberts",docc:"#ef4444",dept:"Cardiology",day:17,time:"02:00 PM",startMin:840,dur:30,stype:"In-person",status:"Scheduled",prio:"Medium",progress:0,age:33},
                    {id:"SS-3010",pt:"Arjun Menon",ptc:"#0891b2",ptphoto:"assets/img/avatar/avatar-12.jpg",doc:"Dr. Arjun Menon",docc:"#0891b2",dept:"Nephrology",day:17,time:"03:15 PM",startMin:915,dur:45,stype:"Procedure",status:"Scheduled",prio:"High",progress:0,age:60},
                    {id:"SS-3011",pt:"Fatima Sheikh",ptc:"#a855f7",ptphoto:"assets/img/avatar/avatar-09.jpg",doc:"Dr. Sunita Rao",docc:"#14b8a6",dept:"ENT",day:18,time:"09:30 AM",startMin:570,dur:20,stype:"In-person",status:"Scheduled",prio:"Low",progress:0,age:26},
                    {id:"SS-3012",pt:"Meera Iyer",ptc:"#f59e0b",ptphoto:"assets/img/avatar/avatar-10.jpg",doc:"Dr. Deepak Nair",docc:"#6366f1",dept:"Radiology",day:18,time:"11:00 AM",startMin:660,dur:30,stype:"Procedure",status:"Scheduled",prio:"Medium",progress:0,age:45},
                    {id:"SS-3013",pt:"Rohan Verma",ptc:"#f97316",ptphoto:"assets/img/avatar/avatar-13.jpg",doc:"Dr. Vikram Nair",docc:"#8b5cf6",dept:"Neurology",day:16,time:"10:00 AM",startMin:600,dur:45,stype:"Video",status:"Cancelled",prio:"Medium",progress:0,age:39},
                    {id:"SS-3014",pt:"Leela Menon",ptc:"#0d9488",ptphoto:"assets/img/avatar/avatar-14.jpg",doc:"Dr. Meera Iyer",docc:"#f59e0b",dept:"Pediatrics",day:22,time:"10:30 AM",startMin:630,dur:20,stype:"In-person",status:"Scheduled",prio:"Low",progress:0,age:8},
                    {id:"SS-3015",pt:"Sam Wesley",ptc:"#7c3aed",ptphoto:"assets/img/avatar/avatar-15.jpg",doc:"Dr. Rajesh Menon",docc:"#ec4899",dept:"Oncology",day:24,time:"02:30 PM",startMin:870,dur:60,stype:"Procedure",status:"Scheduled",prio:"High",progress:0,age:55}
                ];

                function detailUrl(id){ return "scheduled-session-detail.html?"+new URLSearchParams({id:id}).toString(); }

                var DOCS=[
                    {name:"Dr. Sarah Roberts",dept:"Cardiology",spec:"Interventional",c:"#ef4444",today:4,avail:"In session",next:"02:00 PM",hours:6.5,load:88,photo:"assets/img/doctor/doctor-01.jpg"},
                    {name:"Dr. Vikram Nair",dept:"Neurology",spec:"Stroke Care",c:"#8b5cf6",today:3,avail:"Available",next:"—",hours:4,load:60,photo:"assets/img/doctor/doctor-02.jpg"},
                    {name:"Dr. Meera Iyer",dept:"Pediatrics",spec:"Neonatology",c:"#f59e0b",today:5,avail:"In session",next:"10:30 AM",hours:5.5,load:74,photo:"assets/img/doctor/doctor-04.jpg"},
                    {name:"Dr. Rajesh Menon",dept:"Oncology",spec:"Medical Onc",c:"#ec4899",today:3,avail:"Available",next:"11:30 AM",hours:5,load:82,photo:"assets/img/doctor/doctor-05.jpg"},
                    {name:"Dr. Fatima Sheikh",dept:"Psychiatry",spec:"Behavioral",c:"#a855f7",today:2,avail:"In session",next:"—",hours:3.5,load:48,photo:"assets/img/doctor/doctor-11.jpg"},
                    {name:"Dr. John Mathew",dept:"Emergency",spec:"Emergency Med",c:"#f43f5e",today:4,avail:"Available",next:"12:00 PM",hours:7,load:94,photo:"assets/img/doctor/doctor-08.jpg"}
                ];
                function docPhoto(name){ var d=DOCS.filter(function(x){return x.name===name;})[0]; return d?d.photo:"assets/img/doctor/doctor-02.jpg"; }

                var ACTIVITY=[
                    {ic:"ti-calendar-plus",c:"#6366f1",t:"New session scheduled — SS-3015",s:"Sam Wesley · Oncology · Jul 24",tm:"6m ago"},
                    {ic:"ti-player-play",c:"#10b981",t:"Session started — SS-3003",s:"Dr. Meera Iyer · Pediatrics",tm:"14m ago"},
                    {ic:"ti-circle-check",c:"#8b5cf6",t:"Session completed — SS-3002",s:"45 min · Neurology",tm:"32m ago"},
                    {ic:"ti-ban",c:"#ef4444",t:"Session cancelled — SS-3013",s:"Rohan Verma · patient request",tm:"1h ago"},
                    {ic:"ti-stethoscope",c:"#0ea5e9",t:"Doctor assigned to SS-3009",s:"Dr. Sarah Roberts",tm:"2h ago"},
                    {ic:"ti-calendar-cog",c:"#f59e0b",t:"Session rescheduled — SS-3012",s:"Jul 18 · 11:00 AM",tm:"3h ago"}
                ];

                var KPIS=[
                    {l:"Total Scheduled",v:"246",ic:"ti-calendar",c:"#6366f1",p:80,ch:"+8%",spark:[190,205,215,225,235,242,246]},
                    {l:"Today's Sessions",v:"18",ic:"ti-calendar-event",c:"#0ea5e9",p:60,ch:"+3",spark:[12,14,15,16,17,18,18]},
                    {l:"Live Sessions",v:"3",ic:"ti-player-play",c:"#10b981",p:30,ch:"now",spark:[1,2,2,3,2,3,3]},
                    {l:"Upcoming",v:"9",ic:"ti-calendar-clock",c:"#ec4899",p:50,ch:"today",spark:[6,7,8,8,9,9,9]},
                    {l:"Completed",v:"192",ic:"ti-circle-check",c:"#8b5cf6",p:88,ch:"+6%",spark:[150,160,170,178,185,190,192]},
                    {l:"Cancelled",v:"14",ic:"ti-ban",c:"#ef4444",p:18,ch:"-2",spark:[18,17,16,15,15,14,14]}
                ];

                var COLS=[["id","ID",1],["patient","Patient",1],["doctor","Doctor",1],["dept","Department",1],["date","Date",1],["time","Time",1],["dur","Duration",1],["stype","Type",1],["status","Status",1]];
                var state={ q:"", view:"calendar", filters:{dept:"",doctor:"",stype:"",status:"",prio:"",date:"",sort:"time"}, sel:{}, cols:{}, calMonth:6, calYear:2026, selDay:null };
                COLS.forEach(function(c){ state.cols[c[0]]=true; });
                var TODAY=17;

                /* ================= SPARKLINE ================= */
                function spark(data,c){
                    var w=90,h=26,max=Math.max.apply(null,data),min=Math.min.apply(null,data),rng=(max-min)||1;
                    var pts=data.map(function(v,i){ return (i/(data.length-1)*w).toFixed(1)+","+(h-((v-min)/rng)*(h-4)-2).toFixed(1); });
                    return '<svg viewBox="0 0 '+w+' '+h+'" width="'+w+'" height="'+h+'" preserveAspectRatio="none"><polyline fill="none" stroke="'+c+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="'+pts.join(" ")+'"/><polyline fill="'+mix(c,14)+'" stroke="none" points="0,'+h+' '+pts.join(" ")+' '+w+','+h+'"/></svg>';
                }

                /* ================= KPIs ================= */
                function renderKPIs(){
                    KPIS[2].v=String(SESS.filter(function(s){return s.status==="Live";}).length);
                    KPIS[1].v=String(SESS.filter(function(s){return s.day===TODAY;}).length);
                    $("#ss-kpis").innerHTML = KPIS.map(function(k){
                        return '<div class="ss-kpi" style="--kc:'+k.c+'"><div class="flex items-start justify-between mb-2"><div class="ss-kpi-ic" style="background:'+mix(k.c)+';color:'+k.c+'"><i class="ti '+k.ic+' text-lg"></i></div><svg viewBox="0 0 36 36" class="ss-ring w-11 h-11"><circle cx="18" cy="18" r="15.9155" fill="none" stroke="var(--color-gray-200)" stroke-width="3.4"/><circle class="bar" cx="18" cy="18" r="15.9155" fill="none" stroke="'+k.c+'" stroke-width="3.4" stroke-linecap="round" pathLength="100" style="--p:'+k.p+'"/></svg></div><div class="ss-kpi-v">'+esc(k.v)+'</div><div class="flex items-center justify-between mt-1"><span class="text-xs ss-muted font-semibold">'+esc(k.l)+'</span><span class="ss-chip" style="background:'+mix(k.c)+';color:'+k.c+'">'+esc(k.ch)+'</span></div><div class="mt-2 opacity-90">'+spark(k.spark,k.c)+'</div></div>';
                    }).join("");
                }

                /* ================= WIDGETS ================= */
                function renderWidgets(){
                    var days=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], data=[28,34,30,38,42,20,14], max=Math.max.apply(null,data);
                    var w=280,h=90,pts=data.map(function(v,i){ return (i/(data.length-1)*w).toFixed(1)+","+(h-(v/max)*(h-10)-4).toFixed(1); });
                    $("#ss-w-trend").innerHTML='<svg viewBox="0 0 '+w+' '+h+'" class="w-full" style="height:100px" preserveAspectRatio="none"><defs><linearGradient id="ssg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="'+mix("#6366f1",35)+'"/><stop offset="100%" stop-color="'+mix("#6366f1",2)+'"/></linearGradient></defs><polyline fill="url(#ssg)" stroke="none" points="0,'+h+' '+pts.join(" ")+' '+w+','+h+'"/><polyline fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" points="'+pts.join(" ")+'"/></svg><div class="flex justify-between mt-1">'+days.map(function(x){return '<span class="text-[10px] ss-muted font-semibold">'+x+'</span>';}).join("")+'</div>';

                    var dur=[24,30,28,35,32,26,22], maxDur=Math.max.apply(null,dur), dl=["M","T","W","T","F","S","S"];
                    $("#ss-w-dur").innerHTML=dur.map(function(v,i){ return '<div class="flex-1 flex flex-col items-center gap-1 h-full justify-end"><span class="text-[10px] font-bold ss-muted">'+v+'</span><div class="w-full rounded-t-md" style="height:'+Math.round(v/maxDur*100)+'%;background:linear-gradient(180deg,#ec4899,#8b5cf6)"></div><span class="text-[10px] ss-muted font-semibold">'+dl[i]+'</span></div>'; }).join("");

                    $("#ss-w-completion").innerHTML='<div class="flex items-center gap-4"><svg viewBox="0 0 36 36" class="ss-ring w-24 h-24 flex-none"><circle cx="18" cy="18" r="15.9155" fill="none" stroke="var(--color-gray-200)" stroke-width="3.6"/><circle class="bar" cx="18" cy="18" r="15.9155" fill="none" stroke="#8b5cf6" stroke-width="3.6" stroke-linecap="round" pathLength="100" style="--p:93"/></svg><div><div class="text-2xl font-extrabold text-[var(--color-gray-900)]">93%</div><div class="text-xs ss-muted font-semibold">Completion rate</div><div class="mt-2 text-xs space-y-1"><div class="flex items-center gap-2"><span class="ss-dotstat" style="background:#8b5cf6"></span><span class="ss-muted">Completed</span><b class="text-[var(--color-gray-900)] ml-auto">192</b></div><div class="flex items-center gap-2"><span class="ss-dotstat" style="background:#ef4444"></span><span class="ss-muted">Cancelled</span><b class="text-[var(--color-gray-900)] ml-auto">14</b></div></div></div></div>';
                }

                /* ================= FILTER SELECTS ================= */
                var DEPTS=SESS.map(function(s){return s.dept;}).filter(function(v,i,a){return a.indexOf(v)===i;});
                var DOCTORS=DOCS.map(function(d){return d.name;});

                /* ================= FILTER ================= */
                function filtered(){
                    var f=state.filters, q=state.q.toLowerCase();
                    var arr=SESS.filter(function(s){
                        if(q && (s.id+" "+s.pt+" "+s.doc+" "+s.dept).toLowerCase().indexOf(q)<0) return false;
                        if(f.dept && s.dept!==f.dept) return false;
                        if(f.doctor && s.doc!==f.doctor) return false;
                        if(f.stype && s.stype!==f.stype) return false;
                        if(f.status && s.status!==f.status) return false;
                        if(f.prio && s.prio!==f.prio) return false;
                        if(state.selDay && s.day!==state.selDay) return false;
                        return true;
                    });
                    var po={High:0,Medium:1,Low:2};
                    arr.sort(function(a,b){
                        if(f.sort==="dur") return b.dur-a.dur;
                        if(f.sort==="prio") return po[a.prio]-po[b.prio];
                        if(f.sort==="name") return a.pt.localeCompare(b.pt);
                        return a.startMin-b.startMin;
                    });
                    return arr;
                }

                /* ================= CALENDAR ================= */
                var DOW=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
                var MONTHS=["January","February","March","April","May","June","July","August","September","October","November","December"];
                var DIM=[31,28,31,30,31,30,31,31,30,31,30,31];
                function firstDow(y,m){ // 0=Sun; Jul 2026 starts Wed (index 3). Compute simple known anchor: Jul 1 2026 = Wed
                    // Use a fixed table around 2026 by deltas from Jul
                    var anchors={"2026-6":3}; var key=y+"-"+m; if(anchors[key]!=null) return anchors[key];
                    // fallback: shift from Jul 2026
                    var base=3, days=0, ym=2026*12+6, cur=y*12+m;
                    var step=cur>ym?1:-1;
                    for(var i=ym;i!==cur;i+=step){ var mm=((i%12)+12)%12, yy=Math.floor(i/12); var dd=DIM[mm]+((mm===1&&(yy%4===0))?1:0); days+= step>0?dd:-DIM[((cur%12)+12)%12]; }
                    return ((base+ (step>0?days:days) )%7+7)%7;
                }
                function renderCalHead(){ $("#ss-cal-head").innerHTML=DOW.map(function(d){ return '<div class="ss-cal-hd">'+d+'</div>'; }).join(""); }
                function renderCalendar(){
                    var y=state.calYear, m=state.calMonth;
                    $("#ss-cal-title").textContent=MONTHS[m]+" "+y;
                    var start=firstDow(y,m), dim=DIM[m]+((m===1&&y%4===0)?1:0);
                    var prevDim=DIM[(m+11)%12];
                    var cells="";
                    for(var i=0;i<42;i++){
                        var dayNum, other=false, realDay=null;
                        if(i<start){ dayNum=prevDim-start+1+i; other=true; }
                        else if(i>=start+dim){ dayNum=i-start-dim+1; other=true; }
                        else { dayNum=i-start+1; realDay=dayNum; }
                        var isToday=(!other && m===6 && y===2026 && dayNum===TODAY);
                        var evs=(!other && m===6 && y===2026)?SESS.filter(function(s){return s.day===dayNum;}):[];
                        var evHtml=evs.slice(0,3).map(function(s){ var t=STYPE[s.stype]||{c:"#94a3b8"}; return '<div class="ss-cal-ev" style="background:'+mix(t.c,18)+';color:'+t.c+'" data-open="'+s.id+'" onclick="event.stopPropagation()"><span class="w-1.5 h-1.5 rounded-full flex-none" style="background:'+t.c+'"></span>'+esc(s.time.replace(" ",""))+' '+esc(s.pt.split(" ")[0])+'</div>'; }).join("");
                        var more=evs.length>3?'<div class="text-[9px] ss-muted font-bold mt-.5">+'+(evs.length-3)+' more</div>':'';
                        var sel=(state.selDay===realDay && realDay);
                        cells+='<div class="ss-cal-cell'+(other?" other":"")+(isToday?" today":"")+'" '+(realDay?'data-day="'+realDay+'"':'')+' style="'+(sel?"border-color:var(--color-primary)":"")+'"><div class="flex items-center justify-between"><span class="ss-cal-daynum'+(isToday?" text-[var(--color-primary)]":"")+'">'+dayNum+'</span>'+(evs.length?'<span class="text-[9px] font-bold ss-muted">'+evs.length+'</span>':'')+'</div>'+evHtml+more+'</div>';
                    }
                    $("#ss-calendar").innerHTML=cells;
                }

                /* ================= GRID (with countdown) ================= */
                function nowMin(){ var d=new Date(2026,6,17,10,25); return d.getHours()*60+d.getMinutes()+_tick; }
                var _tick=0;
                function countdown(s){
                    if(s.status==="Completed") return {t:"Completed",c:"#8b5cf6"};
                    if(s.status==="Cancelled") return {t:"Cancelled",c:"#94a3b8"};
                    if(s.status==="Live") return {t:"In progress",c:"#10b981"};
                    if(s.day!==TODAY) return {t:"On Jul "+s.day,c:"#0ea5e9"};
                    var diff=s.startMin-nowMin();
                    if(diff<=0) return {t:"Starting now",c:"#f59e0b"};
                    var h=Math.floor(diff/60), m=diff%60;
                    return {t:"in "+(h>0?h+"h ":"")+m+"m",c:"#0ea5e9"};
                }
                function gridHTML(s){
                    var t=STYPE[s.stype]||{c:"#94a3b8",ic:"ti-user"}, sc=STC[s.status], cd=countdown(s);
                    return '<div class="ss-surface p-4" style="border-left:3px solid '+PRIO[s.prio]+'">'+
                        '<div class="flex items-center justify-between mb-3"><a class="text-xs font-bold text-[var(--color-primary)]" href="'+detailUrl(s.id)+'">'+esc(s.id)+'</a><div class="flex items-center gap-1.5"><span class="ss-tag" style="background:'+mix(PRIO[s.prio])+';color:'+PRIO[s.prio]+'"><i class="ti ti-flag-3" style="font-size:.56rem"></i>'+esc(s.prio)+'</span><button class="ss-btn ss-btn-soft !p-1.5" data-menu="'+s.id+'"><i class="ti ti-dots-vertical"></i></button></div></div>'+
                        '<div class="flex items-center gap-2"><div class="flex -space-x-2"><img class="ss-av" src="'+s.ptphoto+'" alt="'+esc(s.pt)+'"><img class="ss-av" src="'+docPhoto(s.doc)+'" alt="'+esc(s.doc)+'"></div><div class="flex-1 min-w-0"><div class="text-sm font-bold text-[var(--color-gray-900)] truncate">'+esc(s.pt)+'</div><div class="text-xs ss-muted truncate">'+esc(s.doc.replace("Dr. ","Dr "))+' · '+esc(s.dept)+'</div></div></div>'+
                        '<div class="grid grid-cols-2 gap-2 mt-3 text-xs"><div class="flex items-center gap-1.5 ss-muted"><i class="ti ti-clock"></i> '+esc(s.time)+'</div><div class="flex items-center gap-1.5 ss-muted"><i class="ti '+t.ic+'" style="color:'+t.c+'"></i> '+esc(s.stype)+'</div><div class="flex items-center gap-1.5 ss-muted"><i class="ti ti-hourglass"></i> '+s.dur+' min</div><div class="flex items-center gap-1.5" style="color:'+cd.c+'"><i class="ti ti-clock-play"></i> '+esc(cd.t)+'</div></div>'+
                        (s.status==="Live"?'<div class="mt-2.5"><div class="flex items-center justify-between mb-1"><span class="text-[10px] ss-muted font-semibold">Progress</span><span class="text-[10px] font-bold text-emerald-600">'+s.progress+'%</span></div><div class="ss-bar"><span style="width:'+s.progress+'%;background:linear-gradient(90deg,#10b981,#059669)"></span></div></div>':'')+
                        '<div class="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--color-border-color)]"><span class="ss-tag" style="background:'+mix(sc)+';color:'+sc+'"><span class="ss-dotstat" style="background:'+sc+'"></span>'+esc(s.status)+'</span>'+(s.status==="Scheduled"?'<button class="ss-btn ss-btn-primary flex-1 !py-1.5 text-xs" data-start="'+s.id+'"><i class="ti ti-player-play"></i> Start</button>':s.status==="Live"?'<button class="ss-btn ss-btn-indigo flex-1 !py-1.5 text-xs" data-complete="'+s.id+'"><i class="ti ti-check"></i> Complete</button>':'<a class="ss-btn ss-btn-soft flex-1 !py-1.5 text-xs" href="'+detailUrl(s.id)+'"><i class="ti ti-eye"></i> View</a>')+'</div>'+
                    '</div>';
                }

                /* ================= LIST ================= */
                function td(col,html){ return '<td class="'+(state.cols[col]?"":"ss-hidecol")+'">'+html+'</td>'; }
                function renderList(arr){
                    $("#ss-tbody").innerHTML=arr.map(function(s){
                        var t=STYPE[s.stype]||{c:"#94a3b8"}, sc=STC[s.status];
                        return '<tr data-row="'+s.id+'"><td><input type="checkbox" class="ss-cb ss-rowcb" data-id="'+s.id+'"'+(state.sel[s.id]?" checked":"")+'></td>'+
                            td("id",'<a class="font-bold text-[var(--color-primary)]" href="'+detailUrl(s.id)+'">'+esc(s.id)+'</a>')+
                            td("patient",'<div class="flex items-center gap-2.5"><img class="ss-av ss-av-sm" src="'+s.ptphoto+'" alt="'+esc(s.pt)+'"><span class="font-bold text-[var(--color-gray-900)]">'+esc(s.pt)+'</span></div>')+
                            td("doctor",'<span class="ss-muted">'+esc(s.doc)+'</span>')+
                            td("dept",'<span class="ss-muted">'+esc(s.dept)+'</span>')+
                            td("date",'<span class="ss-muted whitespace-nowrap">Jul '+s.day+'</span>')+
                            td("time",'<span class="ss-muted whitespace-nowrap">'+esc(s.time)+'</span>')+
                            td("dur",'<span class="ss-muted">'+s.dur+'m</span>')+
                            td("stype",'<span class="ss-tag" style="background:'+mix(t.c)+';color:'+t.c+'">'+esc(s.stype)+'</span>')+
                            td("status",'<span class="ss-tag" style="background:'+mix(sc)+';color:'+sc+'"><span class="ss-dotstat" style="background:'+sc+'"></span>'+esc(s.status)+'</span>')+
                            '<td><button class="ss-btn ss-btn-soft !p-1.5" data-menu="'+s.id+'"><i class="ti ti-dots-vertical"></i></button></td></tr>';
                    }).join("");
                    $$('#ss-tabletag th[data-col]').forEach(function(th){ th.classList.toggle("ss-hidecol", !state.cols[th.getAttribute("data-col")]); });
                    syncSelAll();
                }

                /* ================= TODAY TIMELINE ================= */
                function renderTimeline(){
                    var arr=SESS.filter(function(s){return s.day===TODAY && s.status!=="Cancelled";}).sort(function(a,b){return a.startMin-b.startMin;});
                    $("#ss-timeline").innerHTML=arr.map(function(s){
                        var sc=STC[s.status];
                        return '<div class="ss-tl-card" style="border-left:3px solid '+sc+'" data-open="'+s.id+'"><div class="ss-tl-time"><div class="text-xs font-extrabold text-[var(--color-gray-900)]">'+esc(s.time.split(" ")[0])+'</div><div class="text-[10px] ss-muted font-semibold">'+esc(s.time.split(" ")[1])+'</div></div>'+
                            '<div class="flex-1 min-w-0"><div class="flex items-center gap-2"><img class="ss-av ss-av-sm" src="'+s.ptphoto+'" alt="'+esc(s.pt)+'"><div class="min-w-0"><div class="text-xs font-bold text-[var(--color-gray-900)] truncate">'+esc(s.pt)+'</div><div class="text-[10px] ss-muted truncate">'+esc(s.doc.replace("Dr. ","Dr "))+' · '+esc(s.dept)+'</div></div></div>'+
                            (s.status==="Live"?'<div class="mt-2"><div class="ss-bar !h-1.5"><span style="width:'+s.progress+'%;background:#10b981"></span></div></div>':'')+
                            '</div>'+
                            '<span class="ss-tag self-start flex-none" style="background:'+mix(sc)+';color:'+sc+'">'+(s.status==="Live"?'<span class="ss-liveblink"></span>':"")+esc(s.status)+'</span></div>';
                    }).join("");
                }

                /* ================= DOCTOR BOARD ================= */
                function renderBoards(){
                    $("#ss-docboard").innerHTML=DOCS.map(function(d){
                        var av=d.avail==="Available"?"#10b981":"#f59e0b", col=d.load>=85?"#ef4444":d.load>=70?"#f59e0b":"#10b981";
                        return '<div class="p-3.5 rounded-xl border border-[var(--color-border-color)]"><div class="flex items-center gap-2.5"><div class="relative flex-none"><img class="ss-av" style="width:2.6rem;height:2.6rem" src="'+d.photo+'" alt="'+esc(d.name)+'"><span class="absolute -bottom-.5 -right-.5 w-2.5 h-2.5 rounded-full border-2 border-[var(--color-white)]" style="background:'+av+'"></span></div><div class="flex-1 min-w-0"><div class="text-sm font-bold text-[var(--color-gray-900)] truncate">'+esc(d.name)+'</div><div class="text-[11px] ss-muted truncate">'+esc(d.dept)+' · '+esc(d.spec)+'</div></div><span class="ss-tag" style="background:'+mix(av)+';color:'+av+'">'+esc(d.avail)+'</span></div>'+
                            '<div class="grid grid-cols-3 gap-1.5 mt-3 text-center"><div class="p-1.5 rounded-lg bg-[var(--color-gray-100)]"><div class="text-sm font-extrabold text-[var(--color-gray-900)]">'+d.today+'</div><div class="text-[9px] ss-muted font-semibold">Sessions</div></div><div class="p-1.5 rounded-lg bg-[var(--color-gray-100)]"><div class="text-sm font-extrabold text-[var(--color-gray-900)]">'+d.hours+'h</div><div class="text-[9px] ss-muted font-semibold">Hours</div></div><div class="p-1.5 rounded-lg bg-[var(--color-gray-100)]"><div class="text-sm font-extrabold text-[var(--color-gray-900)]">'+esc(d.next)+'</div><div class="text-[9px] ss-muted font-semibold">Next</div></div></div>'+
                            '<div class="mt-2.5"><div class="flex items-center justify-between mb-1"><span class="text-[10px] ss-muted font-semibold">Workload</span><span class="text-[10px] font-bold" style="color:'+col+'">'+d.load+'%</span></div><div class="ss-bar"><span style="width:'+d.load+'%;background:linear-gradient(90deg,'+col+','+mix(col,60)+')"></span></div></div></div>';
                    }).join("");

                    $("#ss-activity").innerHTML=ACTIVITY.map(function(a,i){ return '<div class="flex gap-3"><div class="flex flex-col items-center"><div class="w-8 h-8 rounded-lg flex items-center justify-center flex-none" style="background:'+mix(a.c)+';color:'+a.c+'"><i class="ti '+a.ic+' text-sm"></i></div>'+(i<ACTIVITY.length-1?'<div class="w-px flex-1 bg-[var(--color-border-color)] mt-1"></div>':'')+'</div><div class="min-w-0 pb-3"><div class="text-xs font-bold text-[var(--color-gray-900)]">'+esc(a.t)+'</div><div class="text-[11px] ss-muted">'+esc(a.s)+'</div><div class="text-[10px] ss-muted mt-.5">'+esc(a.tm)+'</div></div></div>'; }).join("");
                }

                /* ================= RENDER ================= */
                function render(){
                    var arr=filtered();
                    ["calendar","grid","list"].forEach(function(v){ $("#ss-view-"+v).classList.toggle("hidden", state.view!==v); });
                    var showEmpty=arr.length===0 && state.view!=="calendar";
                    $("#ss-empty").classList.toggle("hidden", !showEmpty);
                    if(state.view==="calendar") renderCalendar();
                    else if(state.view==="grid") $("#ss-grid").innerHTML=arr.map(gridHTML).join("");
                    else renderList(arr);
                }

                /* ================= ACTION MENU ================= */
                var ACTIONS=[
                    {a:"view",n:"View Session",ic:"ti-eye"},{a:"edit",n:"Edit Session",ic:"ti-edit"},{a:"start",n:"Start Session",ic:"ti-player-play",ok:1},{a:"complete",n:"Complete Session",ic:"ti-check"},{a:"reschedule",n:"Reschedule",ic:"ti-calendar"},{a:"cancel",n:"Cancel Session",ic:"ti-ban",danger:1},
                    {sep:1},{a:"assign",n:"Assign Doctor",ic:"ti-stethoscope"},{a:"slot",n:"Change Time Slot",ic:"ti-clock-edit"},{a:"patient",n:"View Patient",ic:"ti-user"},{a:"mh",n:"View Medical History",ic:"ti-history"},{a:"upload",n:"Upload Documents",ic:"ti-upload"},
                    {sep:1},{a:"print",n:"Print Schedule",ic:"ti-printer"},{a:"pdf",n:"Download PDF",ic:"ti-file-download"},{a:"remind",n:"Send Reminder",ic:"ti-bell"},{a:"email",n:"Send Email",ic:"ti-mail"},
                    {sep:1},{a:"archive",n:"Archive",ic:"ti-archive"},{a:"delete",n:"Delete",ic:"ti-trash",danger:1}
                ];
                var menuSess=null;
                function openMenu(id,x,y){
                    menuSess=id; var m=$("#ss-menu");
                    m.innerHTML=ACTIONS.map(function(a){ return a.sep?'<div class="ss-sep"></div>':'<div class="ss-mi'+(a.danger?" danger":a.ok?" ok":"")+'" data-act="'+a.a+'"><i class="ti '+a.ic+'"></i>'+esc(a.n)+'</div>'; }).join("");
                    m.classList.add("open");
                    var h=Math.min(m.scrollHeight,window.innerHeight*0.7);
                    m.style.left=Math.max(8,Math.min(x, window.innerWidth-218))+"px"; m.style.top=Math.max(8,Math.min(y, window.innerHeight-h-8))+"px";
                }
                function closeMenu(){ $("#ss-menu").classList.remove("open"); menuSess=null; }
                function doAction(act){
                    var s=SESS.filter(function(x){return x.id===menuSess;})[0];
                    if(act==="view"){ closeMenu(); window.location.href=detailUrl(menuSess); return; }
                    if(act==="edit"||act==="slot"||act==="reschedule"){ closeMenu(); openModal("schedule", s); return; }
                    if(act==="assign"){ closeMenu(); openModal("assign", s); return; }
                    if(act==="upload"){ closeMenu(); openModal("upload", s); return; }
                    if(act==="cancel"||act==="delete"){ closeMenu(); openModal(act==="cancel"?"cancel":"delete", s); return; }
                    if(act==="start" && s){ s.status="Live"; s.progress=5; render(); renderKPIs(); renderWidgets(); renderTimeline(); animateRings(); toast("Session started — "+s.id,"ti-player-play"); closeMenu(); return; }
                    if(act==="complete" && s){ s.status="Completed"; s.progress=100; render(); renderKPIs(); renderWidgets(); renderTimeline(); animateRings(); toast("Session completed — "+s.id,"ti-circle-check"); closeMenu(); return; }
                    var msgs={patient:"Opening patient",mh:"Opening medical history",print:"Schedule printed",pdf:"PDF downloaded",remind:"Reminder sent",email:"Email sent",archive:"Session archived"};
                    toast((msgs[act]||"Action")+(s?" — "+s.id:""),"ti-check"); closeMenu();
                }

                /* ================= BODY SCROLL LOCK ================= */
                // Keep body scroll locked while the drawer or modal overlay is showing; only
                // unlock once neither remains open, so closing one doesn't unlock while the other is still up.
                function syncBodyLock(){ document.body.style.overflow = ($(".ss-drawer.open")||$(".ss-modal.open")) ? "hidden" : ""; }

                /* ================= DRAWER ================= */
                function openDrawer(id){
                    var s=SESS.filter(function(x){return x.id===id;})[0]; if(!s) return;
                    var t=STYPE[s.stype]||{c:"#94a3b8",ic:"ti-user"}, sc=STC[s.status], cd=countdown(s);
                    var tl=[{n:"Session scheduled",tm:"Jul "+(s.day-1),done:1},{n:"Doctor assigned",tm:"Jul "+(s.day-1),done:1},{n:"Reminder sent",tm:"Jul "+s.day+" 08:00",done:1},{n:s.status==="Scheduled"?"Awaiting start":"Session started",tm:s.status==="Scheduled"?cd.t:s.time,done:s.status!=="Scheduled"},{n:"Completed",tm:s.status==="Completed"?"Done":"Pending",done:s.status==="Completed"}];
                    $("#ss-drawer-body").innerHTML=''+
                        '<div class="relative p-5 pb-8" style="background:linear-gradient(135deg,'+s.ptc+','+mix(s.ptc,55)+')">'+
                            '<div class="flex items-center justify-between"><button class="ss-btn ss-btn-glass !p-2" data-close><i class="ti ti-x"></i></button><span class="ss-tag" style="background:rgba(255,255,255,.2);color:#fff;border:1px solid rgba(255,255,255,.3)">'+(s.status==="Live"?'<span class="ss-liveblink"></span>':'<span class="ss-dotstat" style="background:#fff"></span>')+esc(s.status)+'</span></div>'+
                            '<div class="flex items-center gap-3 mt-4 text-white"><img class="w-16 h-16 rounded-2xl object-cover border border-white/30" src="'+s.ptphoto+'" alt="'+esc(s.pt)+'"><div><h2 class="text-xl font-extrabold">'+esc(s.pt)+'</h2><p class="text-white/80 text-sm">'+esc(s.age)+' yrs · '+esc(s.dept)+'</p><p class="text-white/70 text-xs mt-.5">'+esc(s.id)+' · Jul '+s.day+' · '+esc(s.time)+'</p></div></div>'+
                        '</div>'+
                        '<div class="p-5 space-y-5">'+
                            (s.status==="Scheduled"?'<button class="ss-btn ss-btn-primary w-full" data-start="'+s.id+'"><i class="ti ti-player-play"></i> Start Session ('+esc(cd.t)+')</button>':s.status==="Live"?'<button class="ss-btn ss-btn-indigo w-full" data-complete="'+s.id+'"><i class="ti ti-check"></i> Complete Session</button>':'')+
                            '<div class="grid grid-cols-3 gap-2 text-center"><div class="p-3 rounded-xl border border-[var(--color-border-color)]"><div class="text-lg font-extrabold text-[var(--color-gray-900)]">'+s.dur+'m</div><div class="text-[10px] ss-muted font-semibold">Duration</div></div><div class="p-3 rounded-xl border border-[var(--color-border-color)]"><div class="text-sm font-extrabold text-[var(--color-gray-900)]">'+esc(s.time)+'</div><div class="text-[10px] ss-muted font-semibold">Start</div></div><div class="p-3 rounded-xl border border-[var(--color-border-color)]"><div class="text-sm font-extrabold" style="color:'+PRIO[s.prio]+'">'+esc(s.prio)+'</div><div class="text-[10px] ss-muted font-semibold">Priority</div></div></div>'+
                            '<div class="grid grid-cols-2 gap-2.5"><div class="p-3 rounded-xl border border-[var(--color-border-color)]"><div class="text-xs ss-muted font-semibold mb-1">Doctor</div><div class="flex items-center gap-2"><img class="ss-av ss-av-sm" src="'+docPhoto(s.doc)+'" alt="'+esc(s.doc)+'"><span class="text-sm font-bold text-[var(--color-gray-900)] truncate">'+esc(s.doc.replace("Dr. ","Dr "))+'</span></div></div><div class="p-3 rounded-xl border border-[var(--color-border-color)]"><div class="text-xs ss-muted font-semibold mb-1">Session Type</div><div class="text-sm font-bold text-[var(--color-gray-900)]"><i class="ti '+t.ic+'" style="color:'+t.c+'"></i> '+esc(s.stype)+'</div></div></div>'+
                            (s.status==="Live"?'<div><div class="flex items-center justify-between mb-1"><span class="text-xs ss-muted font-semibold">Session Progress</span><span class="text-xs font-bold text-emerald-600">'+s.progress+'%</span></div><div class="ss-bar"><span style="width:'+s.progress+'%;background:linear-gradient(90deg,#10b981,#059669)"></span></div></div>':'')+
                            '<div><div class="text-xs ss-muted font-semibold mb-1.5">Medical Notes</div><textarea class="ss-inp" rows="2" placeholder="Add notes...">Routine '+esc(s.stype.toLowerCase())+' session. Review prior reports.</textarea></div>'+
                            '<div><div class="text-xs ss-muted font-semibold mb-2">Uploaded Documents</div><div class="flex items-center gap-2.5 p-2 rounded-lg border border-[var(--color-border-color)]"><i class="ti ti-file-text text-rose-500"></i><span class="text-xs font-semibold text-[var(--color-gray-900)] flex-1 truncate">referral-note.pdf</span><button class="ss-btn ss-btn-soft !p-1.5" data-toast="Downloading"><i class="ti ti-download"></i></button></div></div>'+
                            '<div><div class="text-xs ss-muted font-semibold mb-2">Previous Sessions</div><div class="space-y-1.5"><div class="flex items-center gap-2.5 p-2 rounded-lg border border-[var(--color-border-color)]"><i class="ti ti-history ss-muted"></i><span class="text-xs font-semibold text-[var(--color-gray-900)] flex-1">'+esc(s.dept)+' · completed</span><span class="text-[11px] ss-muted">Jun 20</span></div></div></div>'+
                            '<div><div class="text-xs ss-muted font-semibold mb-2">Timeline</div><div class="space-y-2.5">'+tl.map(function(h,i){ return '<div class="flex gap-3"><div class="flex flex-col items-center"><div class="w-6 h-6 rounded-full flex items-center justify-center flex-none" style="background:'+mix(h.done?"#10b981":"#94a3b8")+';color:'+(h.done?"#10b981":"#94a3b8")+'"><i class="ti '+(h.done?"ti-check":"ti-clock")+' text-xs"></i></div>'+(i<tl.length-1?'<div class="w-px flex-1 bg-[var(--color-border-color)] mt-1"></div>':'')+'</div><div class="pb-2"><div class="text-xs font-bold text-[var(--color-gray-900)]">'+esc(h.n)+'</div><div class="text-[11px] ss-muted">'+esc(h.tm)+'</div></div></div>'; }).join("")+'</div></div>'+
                            '<div class="grid grid-cols-2 gap-2 pt-1"><button class="ss-btn ss-btn-soft" data-modal="schedule"><i class="ti ti-calendar"></i> Reschedule</button><button class="ss-btn ss-btn-soft" data-modal="assign"><i class="ti ti-stethoscope"></i> Assign</button><button class="ss-btn ss-btn-soft" data-toast="Reminder sent"><i class="ti ti-bell"></i> Remind</button><button class="ss-btn ss-btn-soft" data-toast="Schedule printed"><i class="ti ti-printer"></i> Print</button></div>'+
                        '</div>';
                    $("#ss-drawer").classList.add("open");
                    syncBodyLock();
                }

                /* ================= MODALS ================= */
                function fld(label,inner){ return '<div><label class="ss-lbl">'+label+'</label>'+inner+'</div>'; }
                function selDoc(v){ return '<select class="ss-inp">'+DOCTORS.map(function(d){return '<option'+(v===d?" selected":"")+'>'+esc(d)+'</option>';}).join("")+'</select>'; }
                var MODALS={
                    schedule:{t:"Schedule Session",ic:"ti-calendar-plus",body:function(s){ return '<div class="space-y-3">'+fld("Patient",'<input class="ss-inp" placeholder="Patient name" value="'+(s?esc(s.pt):"")+'">')+fld("Doctor",selDoc(s?s.doc:""))+'<div class="grid grid-cols-2 gap-3">'+fld("Department",'<select class="ss-inp">'+DEPTS.map(function(d){return '<option'+(s&&s.dept===d?" selected":"")+'>'+esc(d)+'</option>';}).join("")+'</select>')+fld("Session Type",'<select class="ss-inp">'+Object.keys(STYPE).map(function(x){return '<option'+(s&&s.stype===x?" selected":"")+'>'+esc(x)+'</option>';}).join("")+'</select>')+'</div><div class="grid grid-cols-3 gap-3">'+fld("Date",'<input type="text" placeholder="dd-mm-yyyy" class="ss-inp" data-provider="flatpickr" data-date-format="d-m-Y">')+fld("Time",'<input type="text" placeholder="--:-- --" class="ss-inp" data-provider="timepickr" data-default-time="10:00">')+fld("Duration",'<input class="ss-inp" type="number" value="'+(s?s.dur:30)+'">')+'</div>'+fld("Priority",'<select class="ss-inp"><option>Low</option><option>Medium</option><option>High</option></select>')+'</div>'; },cta:"Save Session"},
                    assign:{t:"Assign Doctor",ic:"ti-stethoscope",body:function(s){ return '<div class="space-y-3">'+fld("Session",'<input class="ss-inp" value="'+(s?esc(s.id+" — "+s.pt):"")+'" readonly>')+fld("Assign To",selDoc(s?s.doc:""))+fld("Note",'<input class="ss-inp" placeholder="Optional">')+'</div>'; },cta:"Assign Doctor"},
                    upload:{t:"Upload Documents",ic:"ti-upload",body:function(){ return '<div class="space-y-3"><div class="ss-drop" id="ss-dropzone"><i class="ti ti-cloud-upload text-3xl ss-muted"></i><p class="text-sm font-bold text-[var(--color-gray-900)] mt-2">Drag & drop reports or PDFs</p><input type="file" class="hidden" id="ss-file"></div><div class="text-xs ss-muted" id="ss-upload-sum"></div></div>'; },cta:"Upload"},
                    cancel:{t:"Cancel Session",ic:"ti-ban",danger:1,body:function(s){ return '<div class="space-y-3"><div class="text-center py-1"><div class="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center mb-2" style="background:'+mix("#ef4444")+';color:#ef4444"><i class="ti ti-ban text-xl"></i></div><p class="font-bold text-[var(--color-gray-900)]">Cancel '+(s?esc(s.id):"session")+'?</p></div>'+fld("Reason",'<select class="ss-inp"><option>Patient request</option><option>Doctor unavailable</option><option>Emergency</option><option>No-show</option></select>')+'<label class="flex items-center gap-2 text-sm font-semibold text-[var(--color-gray-700)]"><input type="checkbox" class="ss-cb" checked> Notify patient</label></div>'; },cta:"Cancel Session",danger:1},
                    import:{t:"Import Session Schedule",ic:"ti-upload",body:function(){ return '<div class="space-y-3"><div class="ss-drop" id="ss-dropzone"><i class="ti ti-cloud-upload text-3xl ss-muted"></i><p class="text-sm font-bold text-[var(--color-gray-900)] mt-2">Drag & drop CSV / Excel / Session Schedule</p><p class="text-xs ss-muted">or click to browse files</p><input type="file" class="hidden" id="ss-file"></div><button class="ss-btn ss-btn-soft w-full" data-toast="Sample template downloaded"><i class="ti ti-file-download"></i> Download Sample Template</button><div class="p-3 rounded-lg" style="background:'+mix("#6366f1",8)+'"><div class="text-xs font-bold text-[var(--color-gray-900)] mb-1">Import Summary</div><div class="text-xs ss-muted" id="ss-import-sum">No file selected yet.</div></div></div>'; },cta:"Start Import"},
                    export:{t:"Export Schedule",ic:"ti-download",body:function(){ var opts=[["CSV","ti-file-text"],["Excel","ti-file-spreadsheet"],["PDF","ti-file-typography"],["Print","ti-printer"]]; return '<div class="space-y-4"><div><div class="ss-lbl">Format</div><div class="grid grid-cols-2 gap-2">'+opts.map(function(o,i){ return '<button class="ss-btn ss-btn-soft justify-start ss-expfmt'+(i===0?" !border-[var(--color-primary)]":"")+'" data-fmt="'+o[0]+'"><i class="ti '+o[1]+'"></i> '+o[0]+'</button>'; }).join("")+'</div></div><div><div class="ss-lbl">Scope</div><select class="ss-inp"><option>Daily Schedule</option><option>Department Schedule</option><option>Doctor Schedule</option><option>Selected Records</option><option>All Records</option></select></div></div>'; },cta:"Export Now"},
                    print:{t:"Print Schedule",ic:"ti-printer",body:function(){ return '<div class="space-y-3">'+fld("Schedule",'<select class="ss-inp"><option>Today\'s schedule</option><option>Weekly</option><option>By doctor</option><option>By department</option></select>')+fld("Include",'<select class="ss-inp"><option>All details</option><option>Times only</option></select>')+'</div>'; },cta:"Print"},
                    delete:{t:"Delete Confirmation",ic:"ti-trash",danger:1,body:function(s){ return '<div class="text-center py-2"><div class="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-3" style="background:'+mix("#ef4444")+';color:#ef4444"><i class="ti ti-alert-triangle text-2xl"></i></div><p class="font-bold text-[var(--color-gray-900)]">Delete '+(s?esc(s.id):"selected sessions")+'?</p><p class="text-sm ss-muted mt-1">This session record will be permanently removed.</p></div>'; },cta:"Delete",danger:1}
                };
                function openModal(key,s){
                    var m=MODALS[key]; if(!m) return; var danger=m.danger;
                    $("#ss-dialog").innerHTML='<div class="p-5"><div class="flex items-center justify-between mb-4"><h3 class="font-bold text-lg text-[var(--color-gray-900)] flex items-center gap-2"><i class="ti '+m.ic+'" style="color:'+(danger?"#ef4444":"var(--color-primary)")+'"></i> '+esc(m.t)+'</h3><button class="ss-btn ss-btn-soft !p-2" data-close><i class="ti ti-x"></i></button></div>'+m.body(s)+'<div class="flex justify-end gap-2 mt-5"><button class="ss-btn ss-btn-soft" data-close>Cancel</button><button class="ss-btn '+(danger?"ss-btn-soft !bg-rose-500 !text-white":"ss-btn-primary")+'" id="ss-modal-ok"><i class="ti '+(danger?"ti-check":"ti-check")+'"></i> '+esc(m.cta)+'</button></div></div>';
                    $("#ss-modal").classList.add("open");
                    syncBodyLock();
                    // Modal HTML is injected after the page's initial-load flatpickr auto-init has
                    // already run, so any date/time fields inside it must be initialized here instead.
                    if(typeof flatpickr!=="undefined"){
                        $$('[data-provider="flatpickr"]',$("#ss-dialog")).forEach(function(el){
                            if(el._flatpickr) return;
                            var config={disableMobile:true};
                            if(el.hasAttribute("data-date-format")) config.dateFormat=el.getAttribute("data-date-format");
                            flatpickr(el,config);
                        });
                        $$('[data-provider="timepickr"]',$("#ss-dialog")).forEach(function(el){
                            if(el._flatpickr) return;
                            var config={enableTime:true,noCalendar:true,dateFormat:"H:i"};
                            if(el.hasAttribute("data-default-time")) config.defaultDate=el.getAttribute("data-default-time");
                            flatpickr(el,config);
                        });
                    }
                    $("#ss-modal-ok").addEventListener("click", function(){ $("#ss-modal").classList.remove("open"); syncBodyLock(); if(key==="delete" && s){ var i=SESS.indexOf(s); if(i>=0) SESS.splice(i,1); render(); renderKPIs(); renderWidgets(); renderTimeline(); animateRings(); } if(key==="cancel" && s){ s.status="Cancelled"; render(); renderKPIs(); renderWidgets(); renderTimeline(); animateRings(); } toast(m.t+" completed", danger?"ti-check":"ti-check"); });
                    var dz=$("#ss-dropzone");
                    if(dz){ dz.addEventListener("click", function(){ $("#ss-file").click(); }); var fi=$("#ss-file"); if(fi) fi.addEventListener("change", function(){ if(this.files[0]){ var el=$("#ss-import-sum")||$("#ss-upload-sum"); if(el) el.innerHTML='<b class="text-[var(--color-gray-900)]">'+esc(this.files[0].name)+'</b> ready'+($("#ss-import-sum")?' · 22 rows · 0 errors':''); } });
                        ["dragover","dragenter"].forEach(function(ev){ dz.addEventListener(ev,function(e){ e.preventDefault(); dz.classList.add("drag"); }); });
                        ["dragleave","drop"].forEach(function(ev){ dz.addEventListener(ev,function(e){ e.preventDefault(); dz.classList.remove("drag"); }); });
                    }
                    $$(".ss-expfmt").forEach(function(b){ b.addEventListener("click", function(){ $$(".ss-expfmt").forEach(function(x){ x.classList.remove("!border-[var(--color-primary)]"); }); this.classList.add("!border-[var(--color-primary)]"); }); });
                }

                /* ================= SELECTION / BULK ================= */
                function selCount(){ return Object.keys(state.sel).filter(function(k){return state.sel[k];}).length; }
                function syncBulk(){ var n=selCount(); $("#ss-bulk-n").textContent=n; $("#ss-bulk").classList.toggle("show", n>0); }
                function syncSelAll(){ var sa=$("#ss-selall"); if(!sa) return; var vis=filtered(); sa.checked=vis.length>0 && vis.every(function(s){return state.sel[s.id];}); }

                /* ================= EVENTS ================= */
                $("#ss-search").addEventListener("input", function(){ state.q=this.value; render(); });
                $("#ss-filter-toggle").addEventListener("click", function(){ $("#ss-filters").classList.toggle("hidden"); });
                $("#ss-cols-toggle").addEventListener("click", function(){ $("#ss-cols").classList.toggle("hidden"); });
                $("#ss-view").addEventListener("click", function(e){ var b=e.target.closest("[data-v]"); if(!b) return; state.view=b.getAttribute("data-v"); $$(".ss-segb",this).forEach(function(x){ x.classList.toggle("active",x===b); }); render(); });
                $$('[data-f]').forEach(function(sel){ sel.addEventListener("change", function(){ state.filters[this.getAttribute("data-f")]=this.value; updateFilterCount(); render(); }); });
                $("#ss-clear").addEventListener("click", function(){ Object.keys(state.filters).forEach(function(k){ if(k!=="sort") state.filters[k]=""; }); state.selDay=null; $$('[data-f]').forEach(function(s){ if(s.getAttribute("data-f")!=="sort") s.value=""; }); updateFilterCount(); render(); toast("Filters cleared","ti-filter-off"); });
                function updateFilterCount(){ var n=Object.keys(state.filters).filter(function(k){ return k!=="sort" && state.filters[k]; }).length+(state.selDay?1:0); var el=$("#ss-filter-n"); el.textContent=n; el.classList.toggle("hidden", n===0); }

                $("#ss-cal-prev").addEventListener("click", function(){ state.calMonth--; if(state.calMonth<0){ state.calMonth=11; state.calYear--; } renderCalendar(); });
                $("#ss-cal-next").addEventListener("click", function(){ state.calMonth++; if(state.calMonth>11){ state.calMonth=0; state.calYear++; } renderCalendar(); });
                $("#ss-cal-today").addEventListener("click", function(){ state.calMonth=6; state.calYear=2026; state.selDay=null; updateFilterCount(); renderCalendar(); });

                document.addEventListener("click", function(e){
                    var day=e.target.closest("[data-day]"); if(day && e.target.closest("#ss-calendar")){ var d=+day.getAttribute("data-day"); state.selDay=(state.selDay===d?null:d); updateFilterCount(); renderCalendar(); if(state.selDay){ state.view="grid"; $$(".ss-segb",$("#ss-view")).forEach(function(x){ x.classList.toggle("active",x.getAttribute("data-v")==="grid"); }); render(); toast("Showing Jul "+d,"ti-calendar"); } return; }
                    if(e.target.closest("[data-startfirst]")){ var first=SESS.filter(function(s){return s.status==="Scheduled"&&s.day===TODAY;})[0]; if(first){ first.status="Live"; first.progress=5; render(); renderKPIs(); renderWidgets(); renderTimeline(); animateRings(); toast("Session started — "+first.id,"ti-player-play"); } else toast("No scheduled sessions to start","ti-info-circle"); return; }
                    var st=e.target.closest("[data-start]"); if(st){ var s2=SESS.filter(function(x){return x.id===st.getAttribute("data-start");})[0]; if(s2){ s2.status="Live"; s2.progress=5; if($("#ss-drawer").classList.contains("open")){ $("#ss-drawer").classList.remove("open"); syncBodyLock(); } render(); renderKPIs(); renderWidgets(); renderTimeline(); animateRings(); toast("Session started — "+s2.id,"ti-player-play"); } return; }
                    var cp=e.target.closest("[data-complete]"); if(cp){ var s3=SESS.filter(function(x){return x.id===cp.getAttribute("data-complete");})[0]; if(s3){ s3.status="Completed"; s3.progress=100; if($("#ss-drawer").classList.contains("open")){ $("#ss-drawer").classList.remove("open"); syncBodyLock(); } render(); renderKPIs(); renderWidgets(); renderTimeline(); animateRings(); toast("Session completed — "+s3.id,"ti-circle-check"); } return; }
                    var mo=e.target.closest("[data-modal]"); if(mo){ openModal(mo.getAttribute("data-modal")); return; }
                    var op=e.target.closest("[data-open]"); if(op){ openDrawer(op.getAttribute("data-open")); return; }
                    var mb=e.target.closest("[data-menu]"); if(mb){ var rc=mb.getBoundingClientRect(); openMenu(mb.getAttribute("data-menu"), rc.right-218, rc.bottom+4); e.stopPropagation(); return; }
                    var ai=e.target.closest("[data-act]"); if(ai){ doAction(ai.getAttribute("data-act")); return; }
                    var tt=e.target.closest("[data-toast]"); if(tt){ toast(tt.getAttribute("data-toast"),"ti-info-circle"); return; }
                    if(e.target.closest("[data-refresh]")){ $("#ss-h-updated").textContent="just now"; render(); renderKPIs(); renderWidgets(); renderTimeline(); animateRings(); toast("Sessions refreshed","ti-refresh"); return; }
                    var rcb=e.target.closest(".ss-rowcb"); if(rcb){ state.sel[rcb.getAttribute("data-id")]=rcb.checked; syncBulk(); syncSelAll(); return; }
                    var cl=e.target.closest("[data-close]"); if(cl){ var m=cl.closest(".ss-drawer,.ss-modal"); if(m) m.classList.remove("open"); syncBodyLock(); return; }
                    if(!e.target.closest("#ss-menu")) closeMenu();
                });
                document.addEventListener("keydown", function(e){ if(e.key==="Escape"){ closeMenu(); $$(".ss-drawer.open,.ss-modal.open").forEach(function(m){ m.classList.remove("open"); }); syncBodyLock(); } });
                window.addEventListener("scroll", closeMenu, true);
                document.addEventListener("change", function(e){
                    if(e.target.id==="ss-selall"){ var vis=filtered(); vis.forEach(function(s){ state.sel[s.id]=e.target.checked; }); render(); syncBulk(); }
                    if(e.target.classList.contains("ss-colcb")){ state.cols[e.target.getAttribute("data-col")]=e.target.checked; render(); }
                });

                $("#ss-bulk-x").addEventListener("click", function(){ state.sel={}; render(); syncBulk(); });
                $$('[data-bulk]').forEach(function(b){ b.addEventListener("click", function(){
                    var act=this.getAttribute("data-bulk"), n=selCount();
                    var ids=Object.keys(state.sel).filter(function(k){return state.sel[k];});
                    if(act==="delete"){ ids.forEach(function(id){ var i=SESS.map(function(s){return s.id;}).indexOf(id); if(i>=0) SESS.splice(i,1); }); state.sel={}; render(); renderKPIs(); renderWidgets(); renderTimeline(); animateRings(); syncBulk(); toast(n+" session"+(n>1?"s":"")+" deleted","ti-trash"); return; }
                    if(act==="cancel"){ ids.forEach(function(id){ var s=SESS.filter(function(x){return x.id===id;})[0]; if(s) s.status="Cancelled"; }); render(); renderKPIs(); renderWidgets(); renderTimeline(); animateRings(); toast(n+" session"+(n>1?"s":"")+" cancelled","ti-ban"); return; }
                    if(act==="status"){ ids.forEach(function(id){ var s=SESS.filter(function(x){return x.id===id;})[0]; if(s && s.status==="Scheduled") s.status="Completed"; }); render(); renderKPIs(); toast(n+" marked completed","ti-circle-check"); return; }
                    var names={assign:"Doctor assigned to",reschedule:"Rescheduled",remind:"Reminders sent for",export:"Exported"};
                    toast((names[act]||"Updated")+" "+n+" session"+(n>1?"s":""),"ti-check");
                }); });

                /* ================= RINGS + LIVE PROGRESS ================= */
                function animateRings(){ $$(".ss-ring .bar").forEach(function(b){ var p=b.style.getPropertyValue("--p"); b.style.setProperty("--p","0"); requestAnimationFrame(function(){ b.style.setProperty("--p",p); }); }); }
                setInterval(function(){
                    _tick++;
                    var live=SESS.filter(function(s){return s.status==="Live" && s.progress<100;});
                    var changed=false;
                    live.forEach(function(s){ if(s.progress<98){ s.progress=Math.min(98,s.progress+1); changed=true; } });
                    if(changed){ if(state.view==="grid") $("#ss-grid").innerHTML=filtered().map(gridHTML).join(""); renderTimeline(); }
                }, 3000);

                /* ================= REVEAL =================
                   KPIs, widgets, calendar header, calendar grid (default view,
                   July 2026, unfiltered), doctor board, and today's timeline
                   are already static markup in the HTML, matching what these
                   builders would have produced on load. renderKPIs(),
                   renderWidgets(), renderCalHead(), renderCalendar(),
                   renderBoards(), renderTimeline(), render() and filtered()
                   all stay available below for search/filter/sort/view
                   changes and for the mutation handlers (start/complete
                   session, cancel, delete, bulk actions, live progress
                   ticks). */
                setTimeout(function(){
                    $("#ss-skeleton").classList.add("hidden");
                    $("#ss-content").classList.remove("hidden");
                    requestAnimationFrame(animateRings);
                }, 1500);
            })();

// ==========================================================================
// specializations.js
// ==========================================================================
(function () {
    "use strict";
    var page = document.getElementById("sp-page"); if (!page) return;
    function $(s, r) { return (r || document).querySelector(s); }
    function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }
    function toast(msg, ic){ var w=$("#sp-toast"); var t=document.createElement("div"); t.className="sp-toast"; t.innerHTML='<i class="ti '+(ic||"ti-check")+' text-emerald-400"></i>'+esc(msg); w.appendChild(t); setTimeout(function(){ t.style.opacity="0"; t.style.transform="translateY(12px)"; t.style.transition="all .3s ease"; setTimeout(function(){ t.remove(); },300); },2600); }
    function mix(c,p){ return "color-mix(in srgb,"+c+" "+(p||15)+"%,transparent)"; }

    /* ---------- DATA ---------- */
    var CATS=[
        {k:"all",n:"All",ic:"ti-layout-grid",c:"#8b5cf6"},
        {k:"Surgical",n:"Surgical",ic:"icon-scissors",c:"#ef4444"},
        {k:"Medical",n:"Medical",ic:"ti-stethoscope",c:"#0ea5e9"},
        {k:"Diagnostic",n:"Diagnostic",ic:"ti-scan",c:"#6366f1"},
        {k:"Pediatric",n:"Pediatric",ic:"ti-baby-carriage",c:"#f59e0b"},
        {k:"Critical",n:"Critical Care",ic:"ti-heartbeat",c:"#f43f5e"}
    ];
    var SPECS=[
        {id:1,name:"Cardiology",cat:"Medical",ic:"ti-heart",c:"#ef4444",dept:"Cardiology",doctors:18,procedures:214,rating:4.9,demand:"High",growth:14,wait:"2 days",desc:"Diagnosis and treatment of heart and blood vessel disorders including interventional procedures.",procs:["Angioplasty","Echocardiography","Pacemaker","Bypass Surgery"],docs:["Dr. Sarah Roberts","Dr. A. Khan","Dr. M. Lee"]},
        {id:2,name:"Neurology",cat:"Medical",ic:"ti-brain",c:"#8b5cf6",dept:"Neurology",doctors:14,procedures:158,rating:4.8,demand:"High",growth:11,wait:"3 days",desc:"Care for disorders of the brain, spinal cord and nervous system.",procs:["EEG","Stroke Care","Nerve Conduction","EMG"],docs:["Dr. Vikram Nair","Dr. S. Gupta"]},
        {id:3,name:"Orthopedic Surgery",cat:"Surgical",ic:"ti-bone",c:"#0ea5e9",dept:"Orthopedics",doctors:16,procedures:246,rating:4.7,demand:"High",growth:9,wait:"4 days",desc:"Surgical and non-surgical treatment of the musculoskeletal system.",procs:["Joint Replacement","Arthroscopy","Fracture Repair","Spine Surgery"],docs:["Dr. Anita Desai","Dr. K. Singh"]},
        {id:4,name:"Pediatrics",cat:"Pediatric",ic:"ti-baby-carriage",c:"#f59e0b",dept:"Pediatrics",doctors:12,procedures:132,rating:4.9,demand:"Medium",growth:6,wait:"1 day",desc:"Medical care for infants, children and adolescents.",procs:["Vaccination","Growth Assessment","NICU Care","Pediatric Surgery"],docs:["Dr. Meera Iyer","Dr. N. Bose"]},
        {id:5,name:"Oncology",cat:"Medical",ic:"ti-radioactive",c:"#ec4899",dept:"Oncology",doctors:11,procedures:98,rating:4.6,demand:"High",growth:18,wait:"2 days",desc:"Diagnosis and treatment of cancer including chemotherapy and radiation.",procs:["Chemotherapy","Radiation","Biopsy","Immunotherapy"],docs:["Dr. Rajesh Menon","Dr. L. Fernandez"]},
        {id:6,name:"General Surgery",cat:"Surgical",ic:"icon-scissors",c:"#f43f5e",dept:"Surgery",doctors:15,procedures:288,rating:4.7,demand:"High",growth:7,wait:"3 days",desc:"Broad surgical care of the abdomen, digestive tract and soft tissues.",procs:["Appendectomy","Hernia Repair","Laparoscopy","Gallbladder"],docs:["Dr. John Mathew","Dr. G. Nair"]},
        {id:7,name:"Radiology",cat:"Diagnostic",ic:"ti-scan",c:"#6366f1",dept:"Radiology",doctors:9,procedures:342,rating:4.8,demand:"Medium",growth:12,wait:"Same day",desc:"Diagnostic imaging services across modalities.",procs:["MRI","CT Scan","X-Ray","Ultrasound"],docs:["Dr. Deepak Nair","Dr. M. Iyer"]},
        {id:8,name:"Dermatology",cat:"Medical",ic:"ti-hand-finger",c:"#10b981",dept:"Dermatology",doctors:8,procedures:120,rating:4.7,demand:"Medium",growth:8,wait:"5 days",desc:"Care for skin, hair and nail conditions, cosmetic and surgical.",procs:["Skin Biopsy","Laser Therapy","Cosmetic","Allergy Test"],docs:["Dr. Karan Malhotra"]},
        {id:9,name:"Gynecology",cat:"Surgical",ic:"ti-mood-heart",c:"#d946ef",dept:"Gynecology",doctors:13,procedures:176,rating:4.8,demand:"Medium",growth:5,wait:"2 days",desc:"Women's reproductive health, obstetrics and gynecologic surgery.",procs:["Ultrasound","Laparoscopy","Maternity","Fertility"],docs:["Dr. Priya Sharma","Dr. D. Kaur"]},
        {id:10,name:"Emergency Medicine",cat:"Critical",ic:"ti-ambulance",c:"#dc2626",dept:"Emergency",doctors:20,procedures:410,rating:4.5,demand:"High",growth:15,wait:"Immediate",desc:"Acute care for urgent and life-threatening conditions.",procs:["Trauma Care","Triage","Resuscitation","Stabilization"],docs:["Dr. John Mathew","Dr. S. Ali"]},
        {id:11,name:"Anesthesiology",cat:"Critical",ic:"ti-lungs",c:"#0891b2",dept:"Surgery",doctors:10,procedures:264,rating:4.8,demand:"Medium",growth:4,wait:"N/A",desc:"Anesthesia and perioperative care for surgical patients.",procs:["General Anesthesia","Regional Block","Sedation","Pain Mgmt"],docs:["Dr. Arjun Menon"]},
        {id:12,name:"Ophthalmology",cat:"Surgical",ic:"ti-eye",c:"#14b8a6",dept:"Eye Care",doctors:7,procedures:194,rating:4.8,demand:"Medium",growth:10,wait:"4 days",desc:"Medical and surgical eye care.",procs:["Cataract","LASIK","Retina Surgery","Glaucoma"],docs:["Dr. Sunita Rao"]},
        {id:13,name:"Psychiatry",cat:"Medical",ic:"ti-mood-smile",c:"#a855f7",dept:"Psychiatry",doctors:5,procedures:64,rating:4.8,demand:"Low",growth:22,wait:"6 days",desc:"Mental health assessment, therapy and psychiatric treatment.",procs:["Counselling","Therapy","Psychometry","De-addiction"],docs:["Dr. Fatima Sheikh"]},
        {id:14,name:"Pathology",cat:"Diagnostic",ic:"ti-microscope",c:"#7c3aed",dept:"Laboratory",doctors:6,procedures:520,rating:4.7,demand:"Medium",growth:6,wait:"Same day",desc:"Laboratory diagnosis of disease through analysis of samples.",procs:["Blood Tests","Histopathology","Cytology","Cultures"],docs:["Dr. P. Shah"]},
        {id:15,name:"Neonatology",cat:"Pediatric",ic:"ti-baby-bottle",c:"#f97316",dept:"Pediatrics",doctors:6,procedures:88,rating:4.9,demand:"Low",growth:13,wait:"1 day",desc:"Specialized care for newborn infants, especially the ill or premature.",procs:["NICU Care","Ventilation","Phototherapy","Feeding Support"],docs:["Dr. N. Bose"]},
        {id:16,name:"Urology",cat:"Surgical",ic:"ti-droplet",c:"#2563eb",dept:"Urology",doctors:8,procedures:156,rating:4.6,demand:"Medium",growth:7,wait:"3 days",desc:"Care for the urinary tract and male reproductive system.",procs:["Cystoscopy","Kidney Stone","Prostate Surgery","TURP"],docs:["Dr. R. Jain"]}
    ];

    var KPIS=[
        {l:"Specializations",v:"24",ic:"ti-stethoscope",c:"#8b5cf6",ch:"6 categories"},
        {l:"Doctors Mapped",v:"148",ic:"ti-user-heart",c:"#0ea5e9",ch:"+6 this month"},
        {l:"Procedures/mo",v:"1,860",ic:"ti-clipboard-heart",c:"#ec4899",ch:"+9%"},
        {l:"High Demand",v:"12",ic:"ti-flame",c:"#f97316",ch:"50% of total"},
        {l:"Avg Rating",v:"4.7",ic:"ti-star",c:"#f59e0b",ch:"Stable"},
        {l:"Avg Wait",v:"2.8d",ic:"ti-clock",c:"#10b981",ch:"-0.4d"}
    ];

    var state={ q:"", cat:"all", demand:"", sort:"name", view:"grid" };
    function catColor(k){ for(var i=0;i<CATS.length;i++) if(CATS[i].k===k) return CATS[i].c; return "#8b5cf6"; }
    function demandColor(d){ return d==="High"?"#ef4444":d==="Medium"?"#f59e0b":"#10b981"; }
    function ini(n){ return n.replace(/^Dr\.?\s*/i,"").split(" ").map(function(w){return w[0];}).join("").slice(0,2).toUpperCase(); }
    function detailUrl(s){ return "specialization-detail.html?" + new URLSearchParams({ id:s.id, name:s.name, dept:s.dept, cat:s.cat }).toString(); }

    /* ---------- KPIs ----------
       The KPI strip is static markup in the HTML (matching what this
       map/join would have produced on load); KPIS is never rebuilt after
       load (add-specialization doesn't touch these figures), so it's kept
       only as reference data. */

    /* ---------- CATEGORY PILLS ---------- */
    function renderCats(){
        $("#sp-cats").innerHTML = CATS.map(function(c){
            var n = c.k==="all" ? SPECS.length : SPECS.filter(function(s){return s.cat===c.k;}).length;
            return '<button class="sp-cat'+(state.cat===c.k?" active":"")+'" data-cat="'+c.k+'"><i class="ti '+c.ic+'"></i>'+esc(c.n)+' <span class="n">'+n+'</span></button>';
        }).join("");
    }

    /* ---------- FILTER ---------- */
    function filtered(){
        var q=state.q.toLowerCase();
        var arr=SPECS.filter(function(s){
            if(state.cat!=="all" && s.cat!==state.cat) return false;
            if(state.demand && s.demand!==state.demand) return false;
            if(!q) return true;
            return (s.name+" "+s.dept+" "+s.procs.join(" ")).toLowerCase().indexOf(q)>=0;
        });
        arr.sort(function(a,b){
            if(state.sort==="name") return a.name.localeCompare(b.name);
            if(state.sort==="doctors") return b.doctors-a.doctors;
            if(state.sort==="procedures") return b.procedures-a.procedures;
            if(state.sort==="rating") return b.rating-a.rating;
            if(state.sort==="growth") return b.growth-a.growth;
            return 0;
        });
        return arr;
    }

    /* ---------- CARD ---------- */
    function cardHTML(s){
        var docs=s.docs.slice(0,3).map(function(n,i){ return '<div class="sp-ava" style="background:linear-gradient(135deg,'+s.c+','+mix(s.c,60)+');margin-left:'+(i?"-.45rem":"0")+'">'+esc(ini(n))+'</div>'; }).join("");
        return '<div class="sp-card" style="--sc:'+s.c+'" data-open="'+s.id+'">'+
            '<div class="p-4">'+
                '<div class="flex items-start gap-3"><div class="sp-card-ic" style="background:linear-gradient(135deg,'+s.c+','+mix(s.c,60)+')"><i class="ti '+s.ic+'"></i></div>'+
                    '<div class="flex-1 min-w-0"><h3 class="font-bold text-[var(--color-gray-900)] leading-tight truncate"><a href="'+detailUrl(s)+'" class="hover:underline" onclick="event.stopPropagation()">'+esc(s.name)+'</a></h3><p class="text-xs sp-muted flex items-center gap-1 mt-.5"><i class="ti ti-building-hospital"></i>'+esc(s.dept)+'</p></div>'+
                    '<span class="sp-tag" style="background:'+mix(demandColor(s.demand))+';color:'+demandColor(s.demand)+'"><i class="ti ti-point"></i>'+esc(s.demand)+'</span>'+
                '</div>'+
                '<div class="grid grid-cols-3 gap-1.5 mt-3.5">'+
                    '<div class="sp-stat"><div class="text-base font-extrabold text-[var(--color-gray-900)]">'+s.doctors+'</div><div class="text-[10px] sp-muted font-semibold">Doctors</div></div>'+
                    '<div class="sp-stat"><div class="text-base font-extrabold text-[var(--color-gray-900)]">'+s.procedures+'</div><div class="text-[10px] sp-muted font-semibold">Procedures</div></div>'+
                    '<div class="sp-stat"><div class="text-base font-extrabold text-[var(--color-gray-900)] flex items-center justify-center gap-.5"><i class="ti ti-star text-amber-400 text-xs"></i>'+s.rating+'</div><div class="text-[10px] sp-muted font-semibold">Rating</div></div>'+
                '</div>'+
                '<div class="mt-3"><div class="flex items-center justify-between mb-1"><span class="text-[11px] sp-muted font-semibold flex items-center gap-1"><i class="ti ti-trending-up text-emerald-500"></i>Growth</span><span class="text-[11px] font-bold text-emerald-600">+'+s.growth+'%</span></div><div class="sp-bar"><span style="width:'+Math.min(s.growth*4,100)+'%;background:linear-gradient(90deg,'+s.c+','+mix(s.c,60)+')"></span></div></div>'+
                '<div class="flex items-center justify-between mt-3.5 pt-3 border-t border-[var(--color-border-color)]"><div class="flex items-center">'+docs+(s.docs.length>3?'<span class="text-[11px] sp-muted ml-1.5 font-semibold">+'+(s.docs.length-3)+'</span>':'')+'</div><span class="text-[11px] sp-muted font-semibold flex items-center gap-1"><i class="ti ti-clock"></i>'+esc(s.wait)+'</span></div>'+
            '</div></div>';
    }

    /* ---------- LIST ROW ---------- */
    function rowHTML(s){
        return '<div class="sp-row" style="--sc:'+s.c+'" data-open="'+s.id+'">'+
            '<div class="sp-rowic" style="background:linear-gradient(135deg,'+s.c+','+mix(s.c,60)+')"><i class="ti '+s.ic+'"></i></div>'+
            '<div class="flex-1 min-w-0"><div class="flex items-center gap-2"><h3 class="font-bold text-[var(--color-gray-900)] truncate"><a href="'+detailUrl(s)+'" class="hover:underline" onclick="event.stopPropagation()">'+esc(s.name)+'</a></h3><span class="sp-tag" style="background:'+mix(catColor(s.cat))+';color:'+catColor(s.cat)+'">'+esc(s.cat)+'</span></div><p class="text-xs sp-muted truncate"><i class="ti ti-building-hospital"></i> '+esc(s.dept)+'</p></div>'+
            '<div class="hidden sm:flex items-center gap-5 flex-none text-center">'+
                '<div><div class="text-sm font-extrabold text-[var(--color-gray-900)]">'+s.doctors+'</div><div class="text-[10px] sp-muted">Doctors</div></div>'+
                '<div><div class="text-sm font-extrabold text-[var(--color-gray-900)]">'+s.procedures+'</div><div class="text-[10px] sp-muted">Procedures</div></div>'+
                '<div><div class="text-sm font-extrabold text-emerald-600">+'+s.growth+'%</div><div class="text-[10px] sp-muted">Growth</div></div>'+
                '<span class="sp-tag" style="background:'+mix(demandColor(s.demand))+';color:'+demandColor(s.demand)+'">'+esc(s.demand)+'</span>'+
                '<div class="sp-tag" style="background:'+mix("#f59e0b")+';color:#d97706"><i class="ti ti-star"></i>'+s.rating+'</div>'+
            '</div>'+
            '<i class="ti ti-chevron-right sp-muted flex-none"></i>'+
        '</div>';
    }

    /* ---------- RENDER ---------- */
    function render(){
        var arr=filtered();
        var grid=$("#sp-grid"), list=$("#sp-list"), empty=$("#sp-empty");
        grid.classList.toggle("hidden", state.view!=="grid");
        list.classList.toggle("hidden", state.view!=="list");
        empty.classList.toggle("hidden", arr.length>0);
        if(state.view==="grid") grid.innerHTML=arr.map(cardHTML).join("");
        else list.innerHTML=arr.map(rowHTML).join("");
    }

    /* ---------- SIDEBAR ---------- */
    function renderSide(){
        var byProc=SPECS.slice().sort(function(a,b){return b.procedures-a.procedures;}).slice(0,6);
        var max=byProc[0].procedures;
        $("#sp-topdemand").innerHTML=byProc.map(function(s){
            return '<div><div class="flex items-center justify-between mb-1"><span class="text-xs font-semibold text-[var(--color-gray-900)] flex items-center gap-1.5"><i class="ti '+s.ic+'" style="color:'+s.c+'"></i>'+esc(s.name)+'</span><span class="text-xs font-bold sp-muted">'+s.procedures+'</span></div><div class="sp-bar"><span style="width:'+Math.round(s.procedures/max*100)+'%;background:linear-gradient(90deg,'+s.c+','+mix(s.c,60)+')"></span></div></div>';
        }).join("");

        // donut by category
        var cats=CATS.filter(function(c){return c.k!=="all";});
        var counts=cats.map(function(c){ return {c:c, n:SPECS.filter(function(s){return s.cat===c.k;}).length}; });
        var total=counts.reduce(function(a,b){return a+b.n;},0)||1;
        var off=0, seg="";
        counts.forEach(function(x){
            var frac=x.n/total*100;
            seg+='<circle cx="18" cy="18" r="15.9155" fill="none" stroke="'+x.c.c+'" stroke-width="4.2" stroke-dasharray="'+frac+' '+(100-frac)+'" stroke-dashoffset="'+(-off)+'"/>';
            off+=frac;
        });
        $("#sp-donut").innerHTML=seg+'<circle cx="18" cy="18" r="10" fill="var(--color-white)"/>';
        $("#sp-donut-legend").innerHTML=counts.map(function(x){
            return '<div class="flex items-center gap-2 text-xs"><span class="w-2.5 h-2.5 rounded-full flex-none" style="background:'+x.c.c+'"></span><span class="font-semibold text-[var(--color-gray-900)] flex-1 truncate">'+esc(x.c.n)+'</span><span class="sp-muted font-bold">'+x.n+'</span></div>';
        }).join("");

        var byGrowth=SPECS.slice().sort(function(a,b){return b.growth-a.growth;}).slice(0,5);
        $("#sp-growth").innerHTML=byGrowth.map(function(s,i){
            return '<div class="flex items-center gap-2.5"><div class="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-extrabold" style="background:'+mix(s.c)+';color:'+s.c+'">'+(i+1)+'</div><span class="text-sm font-semibold text-[var(--color-gray-900)] flex-1 truncate">'+esc(s.name)+'</span><span class="sp-tag" style="background:'+mix("#10b981")+';color:#059669"><i class="ti ti-trending-up"></i>+'+s.growth+'%</span></div>';
        }).join("");
    }

    /* ---------- BODY SCROLL LOCK ---------- */
    // Keep body scroll locked while the drawer or add-modal overlay is showing; only
    // unlock once neither remains open.
    function syncBodyLock(){ document.body.style.overflow = ($("#sp-drawer").classList.contains("open")||$("#sp-addmodal").classList.contains("open")) ? "hidden" : ""; }

    /* ---------- DRAWER ---------- */
    function openDrawer(id){
        var s=SPECS.filter(function(x){return x.id===id;})[0]; if(!s) return;
        var procs=s.procs.map(function(p){ return '<span class="sp-tag" style="background:'+mix(s.c)+';color:'+s.c+'">'+esc(p)+'</span>'; }).join("");
        var docs=s.docs.map(function(n){ return '<div class="flex items-center gap-2 p-2 rounded-lg border border-[var(--color-border-color)]"><div class="sp-ava" style="width:2rem;height:2rem;font-size:.65rem;background:linear-gradient(135deg,'+s.c+','+mix(s.c,60)+')">'+esc(ini(n))+'</div><span class="text-sm font-semibold text-[var(--color-gray-900)]">'+esc(n)+'</span></div>'; }).join("");
        var body=$("#sp-drawer-body");
        body.innerHTML=''+
            '<div class="relative p-5 pb-7" style="background:linear-gradient(135deg,'+s.c+','+mix(s.c,55)+')">'+
                '<div class="flex items-center justify-between"><button class="sp-btn sp-btn-glass !p-2" data-close><i class="ti ti-x"></i></button><span class="sp-tag" style="background:rgba(255,255,255,.2);color:#fff;border:1px solid rgba(255,255,255,.3)"><i class="ti ti-point"></i>'+esc(s.demand)+' Demand</span></div>'+
                '<div class="flex items-center gap-3 mt-4 text-white"><div class="w-14 h-14 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-2xl"><i class="ti '+s.ic+'"></i></div><div><h2 class="text-xl font-extrabold">'+esc(s.name)+'</h2><p class="text-white/80 text-sm flex items-center gap-2"><span class="inline-flex items-center gap-1"><i class="ti ti-building-hospital"></i>'+esc(s.dept)+'</span><span class="inline-flex items-center gap-1"><i class="ti ti-category"></i>'+esc(s.cat)+'</span></p></div></div>'+
            '</div>'+
            '<div class="p-5 space-y-5">'+
                '<div class="grid grid-cols-2 gap-2.5">'+
                    '<div class="sp-stat !bg-[var(--color-white)] border border-[var(--color-border-color)] !p-3"><div class="text-xl font-extrabold text-[var(--color-gray-900)]">'+s.doctors+'</div><div class="text-[11px] sp-muted font-semibold">Doctors</div></div>'+
                    '<div class="sp-stat !bg-[var(--color-white)] border border-[var(--color-border-color)] !p-3"><div class="text-xl font-extrabold text-[var(--color-gray-900)]">'+s.procedures+'</div><div class="text-[11px] sp-muted font-semibold">Procedures/mo</div></div>'+
                    '<div class="sp-stat !bg-[var(--color-white)] border border-[var(--color-border-color)] !p-3"><div class="text-xl font-extrabold text-emerald-600">+'+s.growth+'%</div><div class="text-[11px] sp-muted font-semibold">YoY Growth</div></div>'+
                    '<div class="sp-stat !bg-[var(--color-white)] border border-[var(--color-border-color)] !p-3"><div class="text-xl font-extrabold text-[var(--color-gray-900)] flex items-center gap-1"><i class="ti ti-star text-amber-400 text-base"></i>'+s.rating+'</div><div class="text-[11px] sp-muted font-semibold">Avg Rating</div></div>'+
                '</div>'+
                '<div class="flex items-center gap-2.5 p-3 rounded-xl" style="background:'+mix(s.c,8)+';border:1px solid '+mix(s.c,22)+'"><i class="ti ti-clock text-lg" style="color:'+s.c+'"></i><div><div class="text-xs sp-muted font-semibold">Average Wait Time</div><div class="text-sm font-bold text-[var(--color-gray-900)]">'+esc(s.wait)+'</div></div></div>'+
                '<div><div class="text-xs sp-muted font-semibold mb-1.5">About</div><p class="text-sm sp-muted leading-relaxed">'+esc(s.desc)+'</p></div>'+
                '<div><div class="text-xs sp-muted font-semibold mb-2">Key Procedures</div><div class="flex flex-wrap gap-1.5">'+procs+'</div></div>'+
                '<div><div class="text-xs sp-muted font-semibold mb-2">Consultants ('+s.docs.length+')</div><div class="grid grid-cols-1 gap-2">'+docs+'</div></div>'+
                '<div class="flex gap-2 pt-1"><button class="sp-btn sp-btn-primary flex-1" data-toast="Viewing doctors in '+esc(s.name)+'"><i class="ti ti-users"></i> View Doctors</button><button class="sp-btn sp-btn-soft flex-1" data-toast="Edit specialization"><i class="ti ti-edit"></i> Edit</button></div>'+
            '</div>';
        $("#sp-drawer").classList.add("open");
        syncBodyLock();
    }

    /* ---------- EVENTS ---------- */
    $("#sp-search").addEventListener("input", function(){ state.q=this.value; render(); });
    $("#sp-demand").addEventListener("change", function(){ state.demand=this.value; render(); });
    $("#sp-sort").addEventListener("change", function(){ state.sort=this.value; render(); });
    $("#sp-view").addEventListener("click", function(e){ var b=e.target.closest("[data-v]"); if(!b) return; state.view=b.getAttribute("data-v"); Array.prototype.forEach.call(this.querySelectorAll(".sp-segb"),function(x){ x.classList.toggle("active",x===b); }); render(); });
    $("#sp-cats").addEventListener("click", function(e){ var b=e.target.closest("[data-cat]"); if(!b) return; state.cat=b.getAttribute("data-cat"); renderCats(); render(); });

    document.addEventListener("click", function(e){
        var op=e.target.closest("[data-open]"); if(op){ openDrawer(+op.getAttribute("data-open")); return; }
        if(e.target.closest("[data-add]")){ $("#sp-addmodal").classList.add("open"); syncBodyLock(); return; }
        if(e.target.closest("[data-export]")){ toast("Exporting specializations catalog...","ti-download"); return; }
        var tt=e.target.closest("[data-toast]"); if(tt){ toast(tt.getAttribute("data-toast"),"ti-info-circle"); return; }
        var c=e.target.closest("[data-close]"); if(c){ var m=c.closest(".sp-drawer,.sp-modal"); if(m) m.classList.remove("open"); syncBodyLock(); return; }
    });
    document.addEventListener("keydown", function(e){ if(e.key==="Escape"){ Array.prototype.forEach.call(document.querySelectorAll(".sp-drawer.open,.sp-modal.open"),function(m){ m.classList.remove("open"); }); syncBodyLock(); } });

    $("#sp-f-submit").addEventListener("click", function(){
        var n=$("#sp-f-name").value.trim(); if(!n){ toast("Enter specialization name","ti-alert-triangle"); return; }
        var id=Math.max.apply(null,SPECS.map(function(s){return s.id;}))+1;
        var catName=$("#sp-f-cat").value;
        SPECS.unshift({id:id,name:n,cat:catName,ic:"ti-stethoscope",c:catColor((CATS.filter(function(c){return c.n===catName;})[0]||{}).k),dept:$("#sp-f-dept").value.trim()||"—",doctors:+$("#sp-f-doc").value||0,procedures:0,rating:0,demand:$("#sp-f-dem").value,growth:0,wait:"—",desc:$("#sp-f-desc").value.trim()||"Newly added specialization.",procs:[],docs:[]});
        $("#sp-addmodal").classList.remove("open");
        syncBodyLock();
        ["sp-f-name","sp-f-dept","sp-f-doc","sp-f-desc"].forEach(function(x){ $("#"+x).value=""; });
        renderCats(); render(); renderSide(); toast("Specialization \""+n+"\" added","ti-check");
    });

    /* ---------- REVEAL -----------
       Category pills, the specialization grid (default view, unfiltered,
       sorted by name) and the sidebar (top-procedures bars, category donut,
       top-growth list) are already static markup in the HTML, matching what
       renderCats()/render()/renderSide() would have produced on load. Those
       functions stay available below for search/filter/sort/view changes and
       for the add-specialization handler. */
    setTimeout(function(){
        $("#sp-skeleton").classList.add("hidden");
        $("#sp-content").classList.remove("hidden");
    }, 1400);
})();

// ==========================================================================
// surgeon-profile.js
// ==========================================================================
(function () {
    "use strict";
    var page = document.getElementById("sup-page"); if (!page) return;
    function $(s, r) { return (r || document).querySelector(s); }
    function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }
    function toast(msg, ic){ var w=$("#sup-toast"); var t=document.createElement("div"); t.className="sup-toast"; t.innerHTML='<i class="ti '+(ic||"ti-check")+' text-emerald-400"></i>'+esc(msg); w.appendChild(t); setTimeout(function(){ t.style.opacity="0"; t.style.transform="translateY(12px)"; t.style.transition="all .3s ease"; setTimeout(function(){ t.remove(); },300); },2600); }

    /* ---------- DATA ---------- */
    var KPIS=[
        {l:"Total Surgeries",v:"2,140",ic:"ti-cut",c:"#0ea5e9",ch:"+8%",up:1},
        {l:"Upcoming Surgeries",v:"6",s:"today",ic:"ti-calendar",c:"#6366f1",ch:"2 pending",up:1},
        {l:"Avg Rating",v:"4.8",ic:"ti-star",c:"#f59e0b",ch:"356 reviews",up:1},
        {l:"Surgery Fee",v:"₹45,000",ic:"ti-currency-rupee",c:"#10b981",ch:"per procedure",up:1},
        {l:"Success Rate",v:"97%",ic:"ti-heart-rate-monitor",c:"#ec4899",ch:"+1%",up:1},
        {l:"Experience",v:"16y",ic:"ti-briefcase",c:"#8b5cf6",ch:"since 2009",up:1}
    ];
    var SPECS=[
        {n:"Joint Replacement Surgery",p:96},
        {n:"Arthroscopy",p:90},
        {n:"Trauma & Fracture Surgery",p:93},
        {n:"Spine Surgery",p:82}
    ];
    var EDU=[
        {t:"MCh, Orthopedics",s:"AIIMS, New Delhi",y:"2009"},
        {t:"MS, Orthopedic Surgery",s:"King George Medical College",y:"2005"},
        {t:"MBBS",s:"King George Medical College",y:"2001"},
        {t:"Fellowship — Joint Replacement Surgery",s:"Cleveland Clinic, USA",y:"2011"},
        {t:"Senior Consultant Surgeon",s:"Dreams Multi-Specialty Hospital",y:"2014 – Present"}
    ];
    var AWARDS=[
        {t:"Best Orthopedic Surgeon 2023",s:"State Medical Council",ic:"ti-trophy",c:"#f59e0b"},
        {t:"Excellence in Surgical Care",s:"Dreams HMS",ic:"ti-heart",c:"#ec4899"},
        {t:"Research Publication Award",s:"Intl. Orthopedic Journal",ic:"ti-notebook",c:"#6366f1"}
    ];
    var DAYS=[{d:"Mon",h:"08:00–16:00",on:1},{d:"Tue",h:"08:00–16:00",on:1},{d:"Wed",h:"09:00–14:00",on:1},{d:"Thu",h:"08:00–16:00",on:1},{d:"Fri",h:"08:00–13:00",on:1},{d:"Sat",h:"09:00–12:00",on:1},{d:"Sun",h:"Off",on:0}];
    var SLOTS=[{t:"08:00",taken:1},{t:"08:30",taken:1},{t:"09:00",taken:0},{t:"09:30",taken:0},{t:"10:00",taken:1},{t:"10:30",taken:0},{t:"13:00",taken:0},{t:"13:30",taken:1},{t:"14:00",taken:0},{t:"14:30",taken:0},{t:"15:00",taken:0},{t:"15:30",taken:1}];
    var PAL=["#0ea5e9","#6366f1","#10b981","#f59e0b","#ec4899","#8b5cf6"];
    var PATIENTS=[
        {n:"Ravi Kumar",c:"Pre-op · Knee Replacement",t:"2h ago",st:"Stable",sc:"#10b981"},
        {n:"Anita Desai",c:"Post-op review · Hip Replacement",t:"5h ago",st:"Recovering",sc:"#0ea5e9"},
        {n:"Mohammed Ali",c:"Fracture assessment",t:"Yesterday",st:"Stable",sc:"#10b981"},
        {n:"Priya Sharma",c:"New patient · ACL tear",t:"Yesterday",st:"Monitoring",sc:"#f59e0b"},
        {n:"John Mathew",c:"Post-op checkup · Spine Surgery",t:"2 days ago",st:"Recovering",sc:"#0ea5e9"}
    ];
    var APPTS=[
        {n:"Deepak Nair",tm:"Today · 3:30 PM",ty:"OT-02",r:"Knee Replacement",st:"Confirmed",sc:"#10b981"},
        {n:"Sunita Rao",tm:"Today · 5:00 PM",ty:"OT-02",r:"Arthroscopy",st:"Confirmed",sc:"#10b981"},
        {n:"Arjun Menon",tm:"Tomorrow · 09:00 AM",ty:"Cardiac OT",r:"Hip Replacement",st:"Pending",sc:"#f59e0b"},
        {n:"Meera Iyer",tm:"Tomorrow · 11:30 AM",ty:"OT-02",r:"Fracture Fixation",st:"Confirmed",sc:"#10b981"},
        {n:"Karan Malhotra",tm:"Jul 21 · 2:00 PM",ty:"OT-02",r:"Spine Surgery",st:"Pending",sc:"#f59e0b"}
    ];
    var RBARS=[{s:5,p:82},{s:4,p:12},{s:3,p:4},{s:2,p:1},{s:1,p:1}];
    var REVIEWS=[
        {n:"Ramesh G.",r:5,t:"2 days ago",x:"Excellent surgeon! Dr. Mehta explained the procedure clearly and my knee replacement recovery has been smooth. Highly recommend."},
        {n:"Fatima S.",r:5,t:"1 week ago",x:"Very patient and thorough. He took time to answer all my questions before the surgery. The best orthopedic surgeon I've consulted."},
        {n:"David L.",r:4,t:"2 weeks ago",x:"Great expertise and professionalism. Pre-op wait was a bit long but the surgery outcome was worth it."},
        {n:"Neha K.",r:5,t:"3 weeks ago",x:"Saved my father's mobility with a timely hip replacement. Forever grateful for his skill and dedication."}
    ];
    var DOCS=[
        {n:"Medical License",e:"PDF",s:"2.1 MB",ic:"ti-certificate",c:"#ef4444"},
        {n:"MCh Degree Certificate",e:"PDF",s:"1.4 MB",ic:"ti-school",c:"#6366f1"},
        {n:"Board Certification",e:"PDF",s:"890 KB",ic:"ti-rosette-discount-check",c:"#10b981"},
        {n:"Fellowship Certificate",e:"PDF",s:"1.1 MB",ic:"ti-award",c:"#f59e0b"}
    ];
    var RINGS=[{l:"Success",p:97,c:"#10b981"},{l:"Punctual",p:93,c:"#0ea5e9"},{l:"Recovery",p:96,c:"#6366f1"}];
    var TODAY=[
        {l:"Surgeries",v:"6",ic:"ti-calendar",c:"#0ea5e9"},
        {l:"Completed",v:"3",ic:"ti-circle-check",c:"#10b981"},
        {l:"In Prep",v:"2",ic:"ti-clock",c:"#f59e0b"},
        {l:"Avg. duration",v:"105 min",ic:"ti-hourglass",c:"#6366f1"}
    ];

    /* ---------- RENDER ---------- */
    function mix(c){ return "color-mix(in srgb,"+c+" 15%,transparent)"; }

    // NOTE: KPIs/specs/education/awards/weekly-hours/patients/appointments/
    // rating-bars/reviews/documents/rings/today are shown as static markup in
    // the HTML (matching what these builders would have produced on load).
    // The builder functions/data arrays are kept below only where a later
    // interaction still needs them (slot booking); the rest are intentionally
    // not re-invoked at load time any more.

    var selSlot=null;
    function renderSlots(){
        $("#sup-slots").innerHTML = SLOTS.map(function(s,i){
            return '<div class="sup-slot'+(s.taken?' taken':'')+(selSlot===i?' sel':'')+'" data-slot="'+i+'">'+esc(s.t)+'</div>';
        }).join("");
    }
    $("#sup-slots").addEventListener("click", function(e){
        var el=e.target.closest("[data-slot]"); if(!el) return; var i=+el.getAttribute("data-slot"); if(SLOTS[i].taken) return;
        selSlot=(selSlot===i?null:i); renderSlots();
        var b=$("#sup-slotbook"); b.disabled=selSlot===null; b.style.opacity=selSlot===null?".5":"1";
    });
    $("#sup-slotbook").addEventListener("click", function(){ if(selSlot===null) return; toast("OT slot "+SLOTS[selSlot].t+" booked for today","ti-calendar-check"); SLOTS[selSlot].taken=1; selSlot=null; renderSlots(); this.disabled=true; this.style.opacity=".5"; });

    /* ---------- TABS ---------- */
    $("#sup-tabs").addEventListener("click", function(e){
        var b=e.target.closest("[data-tab]"); if(!b) return;
        var t=b.getAttribute("data-tab");
        Array.prototype.forEach.call(document.querySelectorAll("#sup-tabs .sup-tab"),function(x){ x.classList.toggle("active",x===b); });
        Array.prototype.forEach.call(document.querySelectorAll("[data-panel]"),function(p){ p.classList.toggle("active",p.getAttribute("data-panel")===t); });
    });

    /* ---------- MODALS ---------- */
    function openM(id){ $("#"+id).classList.add("open"); document.body.style.overflow = "hidden"; }
    function closeM(el){ el.classList.remove("open"); if(!document.querySelectorAll(".sup-modal.open").length) document.body.style.overflow=""; }
    document.addEventListener("click", function(e){
        if(e.target.closest("[data-book]")){ openM("sup-bookmodal"); }
        if(e.target.closest("[data-msg]")){ openM("sup-msgmodal"); }
        if(e.target.closest("[data-menu]")){ toast("More actions menu","ti-dots"); }
        var c=e.target.closest("[data-close]"); if(c){ closeM(c.closest(".sup-modal")); }
    });
    document.addEventListener("keydown", function(e){ if(e.key==="Escape"){ Array.prototype.forEach.call(document.querySelectorAll(".sup-modal.open"),closeM); } });
    $("#sup-bk-submit").addEventListener("click", function(){ var n=$("#sup-bk-name").value.trim(); if(!n){ toast("Enter patient name","ti-alert-triangle"); return; } closeM($("#sup-bookmodal")); toast("Surgery assigned for "+n,"ti-calendar-check"); $("#sup-bk-name").value=""; $("#sup-bk-reason").value=""; });
    $("#sup-mg-submit").addEventListener("click", function(){ var s=$("#sup-mg-sub").value.trim(); if(!s){ toast("Enter a subject","ti-alert-triangle"); return; } closeM($("#sup-msgmodal")); toast("Message sent to Dr. Mehta","ti-send"); $("#sup-mg-sub").value=""; $("#sup-mg-body").value=""; });

    /* ---------- REVEAL ---------- */
    setTimeout(function(){
        $("#sup-skeleton").classList.add("hidden");
        $("#sup-content").classList.remove("hidden");
        requestAnimationFrame(function(){
            document.querySelectorAll(".sup-ring .bar").forEach(function(b){ var p=b.style.getPropertyValue("--p"); b.style.setProperty("--p","0"); requestAnimationFrame(function(){ b.style.setProperty("--p",p); }); });
        });
    }, 1400);
})();

// ==========================================================================
// surgeons.js
// ==========================================================================
(function(){
    "use strict";
    if ((location.pathname.split("/").pop() || "index.html") !== "surgeons.html") return;
    const $=(s,r)=>(r||document).querySelector(s);
    const $$=(s,r)=>Array.from((r||document).querySelectorAll(s));
    const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
    let toastT;
    function toast(msg,icon){ const t=$('#sg-toast'); t.innerHTML=`<i class="${icon||'icon-check'} text-teal-400"></i> ${msg}`; t.classList.add('show'); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove('show'),2500); }

    /* ============ DATA ============ */
    const STL={avail:'Available',surgery:'In Surgery',oncall:'On Call',off:'Off Duty',leave:'On Leave',emerg:'Emergency Duty'};
    const STC={avail:'#15803d',surgery:'#e06c1f',oncall:'#1d4ed8',off:'#64748b',leave:'#7c3aed',emerg:'#dc2626'};
    const SPECS=[['Cardiac Surgery','icon-heart-pulse','#dc2626'],['Neuro Surgery','icon-brain','#7c3aed'],['Orthopedic Surgery','icon-bone','#e06c1f'],['General Surgery','icon-slice','#0f766e'],['Plastic Surgery','icon-sparkles','#be185d'],['Pediatric Surgery','icon-baby','#1d4ed8'],['ENT Surgery','icon-ear','#0e7490'],['Urology','icon-droplet','#b45309']];
    const DEPTS=['Cardiology','Neurosciences','Orthopedics','General Surgery','Cosmetic','Pediatrics','ENT','Urology'];
    const QUAL=['MBBS, MS, MCh','MBBS, MS','MBBS, DNB','MBBS, MS, DrNB','MBBS, MS, FRCS'];
    const FIRST=['Arjun','Sneha','Rahul','Leela','Priya','Vikram','Kavya','Deepak','Nisha','Rohan','Anil','Meera','Karan','Divya'];
    const LAST=['Mehta','Kapoor','Nair','Khan','Rao','Iyer','Sharma','Reddy','Menon','Das'];
    const AVC=['#475569','#0f766e','#1e40af','#4338ca','#0e7490','#334155','#3f6212','#7c2d12'];
    const STATUSES=['avail','surgery','oncall','avail','off','leave','avail','surgery','oncall','avail','emerg','avail'];
    const initials=n=>n.replace('Dr. ','').split(' ').map(x=>x[0]).join('').slice(0,2);

    // Fixed (not regenerated on every load) so the static directory/performance/
    // schedule markup below always matches SURG exactly; name/dept/spec/
    // qualification are still the same deterministic modulo-indexed values the
    // old Array.from(...) generator produced, and the rnd()'d stat fields
    // (exp/today/succ/rating/total/dur/sat/comp/recov) are frozen to one
    // representative snapshot instead of re-randomizing each load.
    let SURG=[
        {id:0,name:"Dr. Arjun Mehta",spec:"Cardiac Surgery",specIc:"icon-heart-pulse",specC:"#dc2626",dept:"Cardiology",qual:"MBBS, MS, MCh",exp:13,status:"avail",today:2,succ:90,rating:4.9,av:"#475569",total:757,dur:106,sat:96,comp:3,recov:90,photo:"assets/img/doctor/doctor-02.jpg"},
        {id:1,name:"Dr. Sneha Khan",spec:"Neuro Surgery",specIc:"icon-brain",specC:"#7c3aed",dept:"Neurosciences",qual:"MBBS, MS",exp:19,status:"surgery",today:0,succ:88,rating:4.3,av:"#0f766e",total:504,dur:157,sat:91,comp:2.4,recov:92,photo:"assets/img/doctor/doctor-03.jpg"},
        {id:2,name:"Dr. Rahul Sharma",spec:"Orthopedic Surgery",specIc:"icon-bone",specC:"#e06c1f",dept:"Orthopedics",qual:"MBBS, DNB",exp:9,status:"oncall",today:3,succ:89,rating:4.7,av:"#1e40af",total:2048,dur:163,sat:97,comp:3.4,recov:99,photo:"assets/img/doctor/doctor-05.jpg"},
        {id:3,name:"Dr. Leela Das",spec:"General Surgery",specIc:"icon-slice",specC:"#0f766e",dept:"General Surgery",qual:"MBBS, MS, DrNB",exp:7,status:"avail",today:4,succ:99,rating:4.3,av:"#4338ca",total:571,dur:163,sat:89,comp:2.5,recov:95,photo:"assets/img/doctor/doctor-04.jpg"},
        {id:4,name:"Dr. Priya Nair",spec:"Plastic Surgery",specIc:"icon-sparkles",specC:"#be185d",dept:"Cosmetic",qual:"MBBS, MS, FRCS",exp:12,status:"off",today:0,succ:88,rating:4.8,av:"#0e7490",total:889,dur:136,sat:97,comp:1.8,recov:91,photo:"assets/img/doctor/doctor-01.jpg"},
        {id:5,name:"Dr. Vikram Iyer",spec:"Pediatric Surgery",specIc:"icon-baby",specC:"#1d4ed8",dept:"Pediatrics",qual:"MBBS, MS, MCh",exp:26,status:"leave",today:3,succ:97,rating:4.9,av:"#334155",total:1719,dur:136,sat:90,comp:2.2,recov:91,photo:"assets/img/doctor/doctor-08.jpg"},
        {id:6,name:"Dr. Kavya Menon",spec:"ENT Surgery",specIc:"icon-ear",specC:"#0e7490",dept:"ENT",qual:"MBBS, MS",exp:6,status:"avail",today:3,succ:91,rating:4.4,av:"#3f6212",total:423,dur:189,sat:91,comp:4.1,recov:91,photo:"assets/img/doctor/doctor-06.jpg"},
        {id:7,name:"Dr. Deepak Kapoor",spec:"Urology",specIc:"icon-droplet",specC:"#b45309",dept:"Urology",qual:"MBBS, DNB",exp:18,status:"surgery",today:0,succ:92,rating:4.5,av:"#7c2d12",total:1483,dur:109,sat:90,comp:1.4,recov:92,photo:"assets/img/doctor/doctor-09.jpg"},
        {id:8,name:"Dr. Nisha Rao",spec:"Cardiac Surgery",specIc:"icon-heart-pulse",specC:"#dc2626",dept:"Cardiology",qual:"MBBS, MS, DrNB",exp:12,status:"oncall",today:3,succ:92,rating:4.9,av:"#475569",total:1004,dur:170,sat:91,comp:2.9,recov:93,photo:"assets/img/doctor/doctor-10.jpg"},
        {id:9,name:"Dr. Rohan Reddy",spec:"Neuro Surgery",specIc:"icon-brain",specC:"#7c3aed",dept:"Neurosciences",qual:"MBBS, MS, FRCS",exp:28,status:"avail",today:3,succ:98,rating:4.6,av:"#0f766e",total:2093,dur:96,sat:89,comp:3.4,recov:92,photo:"assets/img/doctor/doctor-12.jpg"},
        {id:10,name:"Dr. Anil Mehta",spec:"Orthopedic Surgery",specIc:"icon-bone",specC:"#e06c1f",dept:"Orthopedics",qual:"MBBS, MS, MCh",exp:17,status:"emerg",today:2,succ:89,rating:4.5,av:"#1e40af",total:382,dur:183,sat:91,comp:1.3,recov:92,photo:"assets/img/doctor/doctor-13.jpg"},
        {id:11,name:"Dr. Meera Khan",spec:"General Surgery",specIc:"icon-slice",specC:"#0f766e",dept:"General Surgery",qual:"MBBS, MS",exp:28,status:"avail",today:2,succ:90,rating:4.4,av:"#4338ca",total:954,dur:186,sat:98,comp:4,recov:94,photo:"assets/img/doctor/doctor-11.jpg"},
    ];
    const sel=new Set();
    let focusId=0, view='grid', q='', fSpec='', fStatus='', sort='';

    function filtered(){
        let r=SURG.filter(s=>{
            if(q){ const t=q.toLowerCase(); if(!(s.name.toLowerCase().includes(t)||s.spec.toLowerCase().includes(t)||s.dept.toLowerCase().includes(t))) return false; }
            if(fSpec&&s.spec!==fSpec) return false;
            if(fStatus&&s.status!==fStatus) return false;
            return true;
        });
        if(sort==='name') r.sort((a,b)=>a.name.localeCompare(b.name));
        else if(sort==='succ') r.sort((a,b)=>b.succ-a.succ);
        else if(sort==='exp') r.sort((a,b)=>b.exp-a.exp);
        else if(sort==='rating') r.sort((a,b)=>b.rating-a.rating);
        return r;
    }

    /* ============ HERO COUNTS ============ */
    function updateCounts(){
        $('#sg-h-active').textContent=SURG.filter(s=>s.status!=='off'&&s.status!=='leave').length;
        $('#sg-h-surg').textContent=SURG.reduce((a,s)=>a+s.today,0);
        $('#sg-h-avail').textContent=SURG.filter(s=>s.status==='avail').length;
        $('#sg-h-oncall').textContent=SURG.filter(s=>s.status==='oncall'||s.status==='emerg').length;
        $('#sg-h-succ').textContent=Math.round(SURG.reduce((a,s)=>a+s.succ,0)/SURG.length)+'%';
    }

    /* ============ DIRECTORY ============ */
    function detailUrl(s){ return "surgeon-profile.html?" + new URLSearchParams({ id: s.id, name: s.name, spec: s.spec, dept: s.dept, status: s.status }).toString(); }
    function stars(r){ const full=Math.round(r); return Array.from({length:5},(_,i)=>`<i class="icon-star text-[11px]" style="color:${i<full?'#f59e0b':'var(--sg-soft)'}"></i>`).join(''); }
    function docCard(s){
        const live=s.status==='surgery'||s.status==='oncall'||s.status==='emerg';
        return `<div class="sg-doc stt-${s.status}" data-doc="${s.id}">
            <div class="sg-doc-banner">
                <label onclick="event.stopPropagation()" class="absolute top-2.5 left-2.5 z-10"><input type="checkbox" data-sel="${s.id}" ${sel.has(s.id)?'checked':''} class="accent-[var(--sg-c)]"></label>
                <button data-menu="${s.id}" onclick="event.stopPropagation()" class="sg-doc-menubtn absolute top-2 right-2 w-7 h-7 rounded-lg flex items-center justify-center"><i class="icon-more-vertical text-sm"></i></button>
            </div>
            <div class="px-4 pb-4 -mt-8">
                <div class="flex items-end justify-between">
                    <div class="sg-avatar-ring"><img class="sg-avatar" style="width:54px;height:54px" src="${s.photo}" alt="${s.name}"><span class="sg-statusdot${live?' pulse':''} absolute -bottom-0.5 -right-0.5" style="background:${STC[s.status]}"></span></div>
                    <span class="sg-chip mb-1.5" style="background:color-mix(in srgb,${STC[s.status]} 14%,transparent);color:${STC[s.status]}">${live?'<span class="sg-dot sg-live" style="background:'+STC[s.status]+'"></span>':''}${STL[s.status]}</span>
                </div>
                <p class="sg-doc-name mt-2.5"><a href="${detailUrl(s)}" onclick="event.stopPropagation()" class="hover:text-[var(--sg-accent)] hover:underline">${s.name}</a></p>
                <span class="sg-spec-pill mt-1.5" style="background:color-mix(in srgb,${s.specC} 13%,transparent);color:${s.specC}"><i class="${s.specIc} text-[11px]"></i> ${s.spec}</span>
                <p class="text-[11px] sg-mut mt-1.5">${s.dept} · ${s.qual}</p>
                <div class="flex items-center gap-1.5 mt-2">${stars(s.rating)}<span class="sg-rating-num">${s.rating.toFixed(1)}</span></div>
                <div class="sg-stat-row mt-3">
                    <div class="sg-stat"><span class="sg-stat-ic" style="background:color-mix(in srgb,var(--sg-c) 14%,transparent);color:var(--sg-c)"><i class="icon-briefcase"></i></span><p class="sg-stat-val sg-head">${s.exp}y</p><p class="sg-stat-lbl">Experience</p></div>
                    <div class="sg-stat"><span class="sg-stat-ic" style="background:color-mix(in srgb,#e06c1f 14%,transparent);color:#e06c1f"><i class="icon-calendar-check"></i></span><p class="sg-stat-val" style="color:#e06c1f">${s.today}</p><p class="sg-stat-lbl">Today</p></div>
                    <div class="sg-stat"><span class="sg-stat-ic" style="background:color-mix(in srgb,#15803d 14%,transparent);color:#15803d"><i class="icon-trending-up"></i></span><p class="sg-stat-val" style="color:#15803d">${s.succ}%</p><p class="sg-stat-lbl">Success</p></div>
                </div>
                <div class="flex gap-2 mt-3.5">
                    <a href="${detailUrl(s)}" onclick="event.stopPropagation()" class="sg-btn sg-btn-primary flex-1 justify-center !py-2 text-xs"><i class="icon-eye"></i> Profile</a>
                    <button data-modal="assign" onclick="event.stopPropagation()" title="Assign Surgery" class="sg-btn sg-btn-ghost !py-2 !px-2.5 text-xs"><i class="icon-slice"></i></button>
                    <button data-modal="allocate" onclick="event.stopPropagation()" title="Assign OT" class="sg-btn sg-btn-ghost !py-2 !px-2.5 text-xs"><i class="icon-layout-grid"></i></button>
                </div>
            </div>
        </div>`;
    }
    function compactCard(s){
        return `<div class="sg-doc stt-${s.status} p-3" data-doc="${s.id}">
            <div class="flex items-center gap-2.5">
                <div class="relative flex-none"><img class="sg-avatar round" style="width:42px;height:42px" src="${s.photo}" alt="${s.name}"><span class="sg-statusdot absolute -bottom-0.5 -right-0.5" style="background:${STC[s.status]}"></span></div>
                <div class="min-w-0 flex-1"><p class="text-sm font-bold sg-head truncate"><a href="${detailUrl(s)}" onclick="event.stopPropagation()" class="hover:text-[var(--sg-accent)] hover:underline">${s.name}</a></p><p class="text-[11px] truncate" style="color:${s.specC}">${s.spec}</p></div>
                <button data-menu="${s.id}" onclick="event.stopPropagation()" class="w-6 h-6 rounded-md hover:bg-[var(--sg-hover)] flex items-center justify-center sg-mut"><i class="icon-more-vertical text-sm"></i></button>
            </div>
            <div class="flex items-center justify-between mt-2 text-[11px]"><span class="sg-chip" style="background:color-mix(in srgb,${STC[s.status]} 13%,transparent);color:${STC[s.status]}">${STL[s.status]}</span><span class="sg-mut">${s.today} today · ${s.succ}%</span></div>
        </div>`;
    }
    function listRow(s){
        return `<div class="sg-row stt-${s.status}" data-doc="${s.id}" style="cursor:pointer">
            <label onclick="event.stopPropagation()"><input type="checkbox" data-sel="${s.id}" ${sel.has(s.id)?'checked':''} class="accent-[var(--sg-c)]"></label>
            <div class="flex items-center gap-2.5 min-w-0"><img class="sg-avatar round flex-none" style="width:36px;height:36px" src="${s.photo}" alt="${s.name}"><div class="min-w-0"><p class="text-sm font-semibold sg-head truncate"><a href="${detailUrl(s)}" onclick="event.stopPropagation()" class="hover:text-[var(--sg-accent)] hover:underline">${s.name}</a></p><p class="text-[11px] sg-mut truncate">${s.qual}</p></div></div>
            <div class="text-xs"><p class="font-medium" style="color:${s.specC}">${s.spec}</p><p class="sg-mut">${s.dept}</p></div>
            <div class="text-xs sg-head">${s.exp}y exp<p class="sg-mut">${s.today} today</p></div>
            <div><span class="sg-chip" style="background:color-mix(in srgb,${STC[s.status]} 13%,transparent);color:${STC[s.status]}">${STL[s.status]}</span></div>
            <button data-menu="${s.id}" onclick="event.stopPropagation()" class="w-7 h-7 rounded-md hover:bg-[var(--sg-hover)] flex items-center justify-center sg-mut justify-self-end"><i class="icon-more-vertical"></i></button>
        </div>`;
    }
    function renderDirectory(){
        const list=filtered(); $('#sg-count').textContent=list.length;
        const host=$('#sg-directory');
        if(view==='list'){ host.innerHTML=`<div class="sg-card overflow-hidden"><div class="sg-row !py-2 text-[10px] uppercase tracking-wide sg-mut font-bold"><span></span><span>Surgeon</span><span>Specialty</span><span>Workload</span><span>Status</span><span></span></div>${list.map(listRow).join('')||'<p class="text-sm sg-mut text-center py-6">No surgeons found.</p>'}</div>`; }
        else if(view==='compact'){ host.innerHTML=`<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">${list.map(compactCard).join('')}</div>`; }
        else { host.innerHTML=`<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">${list.map(docCard).join('')||'<p class="text-sm sg-mut text-center py-6 col-span-4">No surgeons found.</p>'}</div>`; }
    }

    /* ============ PERFORMANCE ============ */
    function ring(p,color,label,val){ return `<div class="sg-panel p-3 flex flex-col items-center text-center">
        <div class="relative w-16 h-16"><svg viewBox="0 0 36 36" class="sg-ring w-16 h-16"><circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--sg-track)" stroke-width="3.4"/><circle class="bar" cx="18" cy="18" r="15.9" fill="none" stroke="${color}" stroke-width="3.4" stroke-linecap="round" pathLength="100" style="--p:${p}"/></svg><span class="absolute inset-0 flex items-center justify-center text-xs font-bold" style="color:${color}">${val}</span></div>
        <p class="text-[11px] font-semibold sg-head mt-1.5">${label}</p></div>`; }
    function renderPerformance(){
        const s=SURG.find(x=>x.id===focusId)||SURG[0]; focusId=s.id; $('#sg-perf-name').textContent=s.name;
        $('#sg-performance').innerHTML=[
            ring(s.succ,'#15803d','Success Rate',s.succ+'%'),
            ring(Math.min(100,Math.round(s.total/25)),'#1d4ed8','Total Surgeries',s.total>999?(s.total/1000).toFixed(1)+'k':s.total),
            ring(Math.round(100-s.dur/3),'#0f766e','Avg Duration',s.dur+'m'),
            ring(s.sat,'#e06c1f','Satisfaction',s.sat+'%'),
            ring(Math.round(100-s.comp*15),'#b45309','Low Complication',s.comp+'%'),
            ring(s.recov,'#7c3aed','Recovery Rate',s.recov+'%'),
        ].join('');
    }
    function animateRings(){ $$('.sg-ring .bar').forEach(b=>{ const p=b.style.getPropertyValue('--p'); b.style.setProperty('--p','0'); requestAnimationFrame(()=>requestAnimationFrame(()=>b.style.setProperty('--p',p))); }); }

    /* ============ SCHEDULE ============ */
    const PROCS=['CABG','Knee Replacement','Craniotomy','Appendectomy','Angioplasty','Hip Replacement'];
    const ROOMS=['OT-01','OT-02','Cardiac OT','Neuro OT'];
    function renderSchedule(){
        const s=SURG.find(x=>x.id===focusId)||SURG[0]; $('#sg-sched-name').textContent=s.name;
        const times=['08:00','10:30','13:00','15:30']; const cols=['#e06c1f','#1d4ed8','#0f766e','#15803d'];
        $('#sg-schedule').innerHTML=times.map((t,i)=>`<div class="sg-tl-item" style="--tc:${cols[i]}"><div class="flex items-start gap-2"><div class="min-w-0 flex-1"><p class="text-sm font-semibold sg-head">${PROCS[i%PROCS.length]}</p><p class="text-[11px] sg-mut">${ROOMS[i%ROOMS.length]} · with ${['N. Das','Dr. Menon','N. Pillai','N. Sharma'][i]}</p></div><span class="text-[11px] sg-mut whitespace-nowrap">${t}</span></div></div>`).join('');
    }

    /* ============ SPECIALTIES ============ */
    function renderSpecialties(){
        $('#sg-specialties').innerHTML=SPECS.map(sp=>{
            const list=SURG.filter(s=>s.spec===sp[0]);
            return `<div class="sg-spec" style="--sv:${sp[2]}" data-spec="${sp[0]}">
                <div class="flex items-center justify-between mb-1.5"><span class="sg-iconbadge w-8 h-8" style="color:${sp[2]}"><i class="${sp[1]}"></i></span><span class="sg-chip" style="background:color-mix(in srgb,${sp[2]} 13%,transparent);color:${sp[2]}">${list.length}</span></div>
                <p class="text-sm font-bold sg-head leading-tight">${sp[0]}</p>
                <p class="text-[11px] sg-mut mt-0.5">${list.reduce((a,s)=>a+s.today,0)} surgeries today</p>
            </div>`;
        }).join('');
    }

    /* ============ TEAM ============ */
    function renderTeam(){
        const av=(nm,i)=>`<span class="sg-avatar round flex-none" style="width:34px;height:34px;background:${AVC[i%AVC.length]};font-size:11px">${nm.split(/[. ]/).filter(Boolean).map(x=>x[0]).join('').slice(0,2)}</span>`;
        const groups=[['Anesthesiologists','icon-syringe',[['Dr. K. Menon','Cardiac OT','Assigned'],['Dr. T. Bose','Standby','Available']]],['OT Nurses','icon-user-check',[['N. Fernandes','Cardiac OT','Scrubbed'],['N. Das','OT-03','Available']]],['Assistants','icon-users',[['Dr. V. Iyer','CABG','In Surgery'],['Dr. M. Shah','Standby','Available']]],['Residents','icon-graduation-cap',[['R. Sharma','Ortho','Observing'],['R. Nair','Neuro','On Round']]]];
        $('#sg-team').innerHTML=groups.map(g=>`<div><p class="text-[11px] font-bold sg-mut uppercase tracking-wide mb-2 flex items-center gap-1.5"><i class="${g[1]} sg-hicon text-[13px]"></i> ${g[0]}</p><div class="grid grid-cols-2 gap-2">${g[2].map((x,i)=>`<div class="sg-panel p-2.5 flex items-center gap-2.5">${av(x[0],i+g[0].length)}<div class="min-w-0 flex-1"><p class="text-sm font-semibold sg-head truncate">${x[0]}</p><p class="text-[10px] sg-mut truncate">${x[1]}</p></div><span class="sg-chip" style="background:color-mix(in srgb,${x[2]==='Available'?'#15803d':'#e06c1f'} 13%,transparent);color:${x[2]==='Available'?'#15803d':'#e06c1f'}">${x[2]}</span></div>`).join('')}</div></div>`).join('');
    }

    /* ============ DRAWER (profile) ============ */
    function openDrawer(id){
        const s=SURG.find(x=>x.id===id); if(!s) return;
        const box=(t,ic,body)=>`<div class="sg-panel p-3"><p class="text-[11px] font-bold sg-mut uppercase tracking-wide mb-2 flex items-center gap-1.5"><i class="${ic} sg-hicon text-[13px]"></i> ${t}</p>${body}</div>`;
        const row=(k,v)=>`<div class="flex justify-between text-xs py-0.5"><span class="sg-mut">${k}</span><span class="font-medium sg-head">${v}</span></div>`;
        $('#sg-drawer').innerHTML=`
          <div class="sg-doc-banner stt-${s.status}" style="height:80px;border-radius:0"></div>
          <div class="px-4 -mt-8">
            <div class="flex items-end justify-between">
                <div class="relative"><img class="sg-avatar" style="width:64px;height:64px" src="${s.photo}" alt="${s.name}"><span class="sg-statusdot absolute bottom-0 right-0" style="width:16px;height:16px;background:${STC[s.status]}"></span></div>
                <button data-close class="w-8 h-8 rounded-lg bg-[var(--sg-surface)] border flex items-center justify-center sg-mut mb-1" style="border-color:var(--sg-border)"><i class="icon-x"></i></button>
            </div>
            <p class="font-bold text-lg sg-head mt-2">${s.name}</p>
            <p class="text-sm font-medium" style="color:${s.specC}"><i class="${s.specIc} text-[12px]"></i> ${s.spec}</p>
            <p class="text-[11px] sg-mut">${s.dept} · ${s.qual}</p>
            <div class="flex items-center gap-2 mt-1.5">${stars(s.rating)}<span class="text-[11px] sg-mut">${s.rating.toFixed(1)} rating</span><span class="sg-chip ml-auto" style="background:color-mix(in srgb,${STC[s.status]} 13%,transparent);color:${STC[s.status]}">${STL[s.status]}</span></div>
          </div>
          <div class="p-4 space-y-3">
            <div class="grid grid-cols-3 gap-2 text-center">
                <div class="sg-panel py-2"><p class="text-lg font-bold sg-head">${s.exp}y</p><p class="text-[10px] sg-mut">Experience</p></div>
                <div class="sg-panel py-2"><p class="text-lg font-bold" style="color:#15803d">${s.succ}%</p><p class="text-[10px] sg-mut">Success</p></div>
                <div class="sg-panel py-2"><p class="text-lg font-bold" style="color:#e06c1f">${s.total>999?(s.total/1000).toFixed(1)+'k':s.total}</p><p class="text-[10px] sg-mut">Surgeries</p></div>
            </div>
            ${box('Professional','icon-award',row('Qualification',s.qual)+row('Department',s.dept)+row('Experience',s.exp+' years')+row('Specialty',s.spec))}
            ${box('Performance','icon-chart-column',row('Avg Duration',s.dur+' min')+row('Satisfaction',s.sat+'%')+row('Complication',s.comp+'%')+row('Recovery',s.recov+'%'))}
            ${box("Today's Workload",'icon-calendar-clock',row('Scheduled',s.today+' surgeries')+row('Status',STL[s.status])+row('Next Case',s.today?'08:00 · '+PROCS[s.id%PROCS.length]:'None'))}
            ${box('Contact','icon-phone',row('Extension','+91 80 4567 '+(1000+s.id))+row('Email',s.name.replace('Dr. ','').split(' ')[0].toLowerCase()+'@dreamscare.health'))}
            <div class="grid grid-cols-2 gap-2">
                <button data-modal="assign" class="sg-btn sg-btn-primary justify-center"><i class="icon-slice"></i> Assign Surgery</button>
                <button data-modal="allocate" class="sg-btn sg-btn-ghost justify-center"><i class="icon-layout-grid"></i> Assign OT</button>
                <button data-modal="leave" class="sg-btn sg-btn-ghost justify-center"><i class="icon-calendar"></i> Leave</button>
                <button data-modal="edit" class="sg-btn sg-btn-ghost justify-center"><i class="icon-edit"></i> Edit</button>
            </div>
          </div>`;
        $('#sg-drawer').classList.add('open');
        syncBodyLock();
    }
    function closeDrawer(){ $('#sg-drawer').classList.remove('open'); syncBodyLock(); }
    // Body scroll lock: keep it engaged while either the drawer or the modal host is showing,
    // so closing an inner modal doesn't unlock scroll while the drawer is still open behind it.
    function syncBodyLock(){ document.body.style.overflow = ($('#sg-drawer').classList.contains('open') || $('#sg-modalhost').innerHTML.trim()) ? 'hidden' : ''; }

    /* ============ MENU ============ */
    const ACTIONS=[['View Profile','icon-eye','view'],['Edit','icon-edit','edit'],['Assign Surgery','icon-slice','assign'],['Assign OT','icon-layout-grid','allocate'],['View Schedule','icon-calendar','schedule'],['Performance','icon-chart-column','perf'],['Contact','icon-phone','contact'],['sep'],['Print Profile','icon-printer','print'],['Download PDF','icon-file-down','pdf'],['Archive','icon-archive','archive'],['Delete','icon-trash-2','delete']];
    function openMenu(id,x,y){ closeMenu(); $('#sg-menuhost').innerHTML=`<div class="sg-menu" id="sg-openmenu">${ACTIONS.map(a=>a[0]==='sep'?'<div class="sg-menu-sep"></div>':`<button data-action="${a[2]}" data-sid="${id}" class="${a[2]==='delete'?'danger':''}"><i class="${a[1]}"></i> ${a[0]}</button>`).join('')}</div>`; const m=$('#sg-openmenu'); const r=m.getBoundingClientRect(); m.style.left=Math.max(12,Math.min(x,window.innerWidth-r.width-12))+'px'; m.style.top=Math.max(12,Math.min(y,window.innerHeight-r.height-12))+'px'; }
    function closeMenu(){ $('#sg-menuhost').innerHTML=''; }

    /* ============ MODALS ============ */
    const fld=(l,el)=>`<div><label class="sg-formlabel">${l}</label>${el}</div>`;
    const inp=(ph)=>`<input class="sg-in mt-1" placeholder="${ph||''}">`;
    const selE=(o)=>`<select class="sg-in mt-1">${o.map(x=>`<option>${x}</option>`).join('')}</select>`;
    const drop=(t)=>`<div class="sg-drop rounded-xl h-28 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[var(--sg-hover)]"><i class="icon-cloud-upload text-3xl sg-mut"></i><p class="text-sm font-semibold mt-1 sg-head">${t}</p></div>`;
    const names=SURG.map(s=>s.name);
    const MODALS={
        add:{t:'Add Surgeon',sub:'Onboard a surgical specialist',ic:'icon-user-plus',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('Full Name',inp('Dr. ...'))}${fld('Specialty',selE(SPECS.map(s=>s[0])))}${fld('Department',selE(DEPTS))}${fld('Qualification',selE(QUAL))}${fld('Experience (yrs)',inp('12'))}${fld('Registration No.',inp('MCI-...'))}${fld('Contact',inp('+91 ...'))}${fld('Email',inp('name@dreamscare.health'))}</div>`,cta:'Add Surgeon'},
        edit:{t:'Edit Surgeon',sub:'Update surgeon profile',ic:'icon-edit',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('Specialty',selE(SPECS.map(s=>s[0])))}${fld('Department',selE(DEPTS))}${fld('Status',selE(Object.values(STL)))}${fld('Experience',inp('12'))}</div>`,cta:'Save Changes'},
        assign:{t:'Assign Surgery',sub:'Assign a case to the surgeon',ic:'icon-slice',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('Surgeon',selE(names))}${fld('Procedure',selE(PROCS))}${fld('Patient / MRN',inp('Search...'))}${fld('OT Room',selE(ROOMS))}${fld('Date & Time',`<input type="text" placeholder="dd-mm-yyyy --:--" class="sg-in mt-1" data-provider="flatpickr" data-date-format="d-m-Y" data-enable-time>`)}${fld('Priority',selE(['Routine','Medium','High','Emergency']))}</div>`,cta:'Assign Surgery'},
        allocate:{t:'Assign OT',sub:'Allocate a theater',ic:'icon-layout-grid',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('Surgeon',selE(names))}${fld('OT Room',selE(ROOMS))}${fld('Slot',selE(['08:00','10:30','13:00','15:30']))}${fld('Duration (h)',inp('2'))}</div>`,cta:'Assign OT'},
        leave:{t:'Schedule Leave',sub:'Plan surgeon time off',ic:'icon-calendar',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('Surgeon',selE(names))}${fld('Type',selE(['Annual','Sick','Conference','Emergency']))}${fld('From',`<input type="text" placeholder="dd-mm-yyyy" class="sg-in mt-1" data-provider="flatpickr" data-date-format="d-m-Y">`)}${fld('To',`<input type="text" placeholder="dd-mm-yyyy" class="sg-in mt-1" data-provider="flatpickr" data-date-format="d-m-Y">`)}</div><div class="mt-3">${fld('Cover Surgeon',selE(names))}</div>`,cta:'Schedule Leave'},
        schedule:{t:'View Schedule',sub:'Weekly operating schedule',ic:'icon-calendar',body:`<div class="space-y-2">${['Mon','Tue','Wed','Thu','Fri'].map((d,i)=>`<div class="sg-panel p-2.5 flex items-center justify-between"><span class="text-sm font-medium sg-head">${d}</span><span class="text-[11px] sg-mut">${rnd(0,4)} surgeries · ${ROOMS[i%ROOMS.length]}</span></div>`).join('')}</div>`,cta:'Close'},
        import:{t:'Import',sub:'Bulk-load surgeon records',ic:'icon-upload',body:`<div class="flex gap-2 mb-3">${['CSV','Excel','Staff Directory'].map(f=>`<span class="sg-npill">${f}</span>`).join('')}</div>${drop('Drop CSV / Excel file')}<button class="text-xs font-semibold text-[color:var(--sg-accent)] hover:underline mt-2"><i class="icon-download"></i> Download sample template</button><div class="mt-3 rounded-lg p-3 text-xs flex items-center gap-2" style="background:color-mix(in srgb,#15803d 11%,transparent);color:#15803d;border:1px solid color-mix(in srgb,#15803d 28%,transparent)"><i class="icon-circle-check"></i> Validation passed · 12 surgeons · 0 errors</div>`,cta:'Import'},
        export:{t:'Export',sub:'Export the surgeon directory',ic:'icon-download',body:`<p class="text-xs sg-mut mb-2">Choose a format &amp; scope</p><div class="grid grid-cols-2 gap-2">${['CSV','Excel','PDF','Print','Directory Report','Performance Report','Schedule Report','Selected','All Records'].map(f=>`<button data-expfmt="${f}" class="sg-btn sg-btn-ghost justify-center">${f}</button>`).join('')}</div>`,cta:'Export'},
    };
    const SIMPLE={perf:'Loading performance...',contact:'Opening contact...',print:'Printing profile...',pdf:'PDF downloaded',archive:'Surgeon archived'};
    function openModal(key){ const m=MODALS[key]; if(!m) return; $('#sg-modalhost').innerHTML=`<div class="sg-modal-wrap open"><div class="sg-modal-bg" data-close></div><div class="sg-modal">
        <div class="sg-modal-head"><span class="sg-modal-badge"><i class="${m.ic}"></i></span><div class="min-w-0"><h3 class="font-bold sg-head leading-tight">${m.t}</h3><p class="text-[11px] sg-mut">${m.sub||''}</p></div><button data-close class="ml-auto w-8 h-8 rounded-lg hover:bg-[var(--sg-hover)] flex items-center justify-center sg-mut"><i class="icon-x"></i></button></div>
        <div class="sg-modal-body">${m.body}</div>
        <div class="sg-modal-foot"><button data-close class="sg-btn sg-btn-ghost">Cancel</button><button data-modalok="${key}" class="sg-btn sg-btn-primary"><i class="${m.ic}"></i> ${m.cta}</button></div>
    </div></div>`; syncBodyLock();
        // Modal HTML is injected after the page's initial-load flatpickr auto-init has
        // already run, so any date fields inside it must be initialized here instead.
        if(typeof flatpickr!=='undefined'){
            $$('[data-provider="flatpickr"]',$('#sg-modalhost')).forEach(el=>{
                if(el._flatpickr) return;
                const config={disableMobile:true};
                if(el.hasAttribute('data-date-format')) config.dateFormat=el.getAttribute('data-date-format');
                if(el.hasAttribute('data-enable-time')){ config.enableTime=true; config.dateFormat=(config.dateFormat||'Y-m-d')+' H:i'; }
                flatpickr(el,config);
            });
        }
    }
    function openDelete(msg,onOk){ $('#sg-modalhost').innerHTML=`<div class="sg-modal-wrap open"><div class="sg-modal-bg" data-close></div><div class="sg-modal" style="width:min(420px,94vw)"><div class="p-5 text-center"><div class="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style="background:color-mix(in srgb,#dc2626 13%,transparent);color:#dc2626"><i class="icon-alert-triangle text-2xl"></i></div><h3 class="font-bold text-lg sg-head">Confirm</h3><p class="text-xs sg-mut mt-1">${msg}</p><div class="flex gap-2 mt-4"><button data-close class="sg-btn sg-btn-ghost flex-1 justify-center">Cancel</button><button id="sg-delok" class="sg-btn sg-btn-danger flex-1 justify-center">Delete</button></div></div></div></div>`; syncBodyLock(); $('#sg-delok').onclick=()=>{ onOk(); closeModal(); }; }
    function closeModal(){ $('#sg-modalhost').innerHTML=''; syncBodyLock(); }

    /* ============ HELPERS ============ */
    function updateBulk(){ $('#sg-selcount').textContent=sel.size; $('.sg-bulk').classList.toggle('show',sel.size>0); }
    function refreshAll(){ renderDirectory(); renderPerformance(); renderSchedule(); renderSpecialties(); updateCounts(); animateRings(); }

    /* ============ EVENTS ============ */
    document.addEventListener('click',e=>{
        if(e.target.closest('[data-vw]')){ const b=e.target.closest('[data-vw]'); view=b.dataset.vw; $$('#sg-viewtabs button').forEach(x=>x.classList.toggle('on',x===b)); renderDirectory(); return; }
        if(e.target.closest('[data-spec]')){ const sp=e.target.closest('[data-spec]').dataset.spec; fSpec=sp; $('#sg-fspec').value=sp; renderDirectory(); document.querySelector('#sg-directory').scrollIntoView({behavior:'smooth',block:'center'}); toast('Filtered: '+sp,'icon-filter'); return; }
        const t=e.target.closest('[data-doc],[data-menu],[data-action],[data-modal],[data-modalok],[data-close],[data-bulk],[data-expfmt]');
        if(!t){ if(!e.target.closest('.sg-menu')) closeMenu(); return; }
        if(t.dataset.doc!==undefined){ focusId=+t.dataset.doc; renderPerformance(); renderSchedule(); animateRings(); openDrawer(focusId); return; }
        if(t.dataset.menu!==undefined){ const r=t.getBoundingClientRect(); openMenu(+t.dataset.menu,r.left-180,r.bottom+4); return; }
        if(t.dataset.action!==undefined){ const a=t.dataset.action, id=+t.dataset.sid; closeMenu(); focusId=id;
            if(a==='view') openDrawer(id);
            else if(a==='perf'||a==='schedule'){ renderPerformance(); renderSchedule(); animateRings(); if(a==='schedule') openModal('schedule'); else document.querySelector('#sg-performance').scrollIntoView({behavior:'smooth',block:'center'}); }
            else if(MODALS[a]) openModal(a);
            else if(a==='delete') openDelete('Remove this surgeon from the roster?',()=>{ SURG=SURG.filter(x=>x.id!==id); sel.delete(id); refreshAll(); toast('Surgeon removed','icon-trash-2'); });
            else if(SIMPLE[a]) toast(SIMPLE[a]);
            return; }
        if(t.dataset.modal!==undefined){ openModal(t.dataset.modal); return; }
        if(t.dataset.modalok!==undefined){ toast(MODALS[t.dataset.modalok].cta+' — done','icon-check'); closeModal(); return; }
        if(t.dataset.expfmt!==undefined){ toast('Exported: '+t.dataset.expfmt,'icon-download'); closeModal(); return; }
        if(t.dataset.close!==undefined){ closeModal(); closeDrawer(); return; }
        if(t.dataset.bulk!==undefined){ const bk=t.dataset.bulk;
            if(bk==='delete') openDelete(`Remove ${sel.size} selected surgeon(s)?`,()=>{ SURG=SURG.filter(s=>!sel.has(s.id)); sel.clear(); refreshAll(); updateBulk(); toast('Surgeons removed','icon-trash-2'); });
            else { toast({assign:'Surgery assigned',oncall:'Set on-call',export:'Exported',print:'Printing',archive:'Archived'}[bk]+' · '+sel.size+' surgeons'); if(bk==='archive'){ sel.clear(); refreshAll(); updateBulk(); } }
            return; }
    });
    document.addEventListener('change',e=>{
        if(e.target.dataset.sel!==undefined){ const id=+e.target.dataset.sel; e.target.checked?sel.add(id):sel.delete(id); updateBulk(); return; }
        if(e.target.id==='sg-fspec'){ fSpec=e.target.value; renderDirectory(); }
        if(e.target.id==='sg-fstatus'){ fStatus=e.target.value; renderDirectory(); }
        if(e.target.id==='sg-sort'){ sort=e.target.value; renderDirectory(); }
    });
    document.addEventListener('input',e=>{ if(e.target.id==='sg-search'){ q=e.target.value; renderDirectory(); } });

    function clock(){ $('#sg-clock').textContent=new Date().toLocaleTimeString('en-GB'); }

    /* ============ INIT =============
       Header counts, the surgeon directory (default grid view, unfiltered),
       performance rings, schedule, specialty cards and the care team roster
       are already static markup in the HTML, matching what
       renderDirectory()/renderPerformance()/renderSchedule()/
       renderSpecialties()/renderTeam()/updateCounts() would have produced on
       load for the (now fixed, non-random) SURG data. Those functions stay
       available below for search/filter/sort/view changes and for the
       mutation handlers (edit, delete, bulk actions). */
    setTimeout(()=>{
        $('#sg-skeleton').classList.add('hidden');
        $('#sg-content').classList.remove('hidden');
        animateRings(); clock(); setInterval(clock,1000);
    },1400);
})();

// ==========================================================================
// telemedicine.js
// ==========================================================================
            (function () {
                "use strict";
                var page = document.getElementById("tm-page"); if (!page) return;
                function $(s, r) { return (r || document).querySelector(s); }
                function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
                function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }
                function toast(msg, ic){ var w=$("#tm-toast"); var t=document.createElement("div"); t.className="tm-toast"; t.innerHTML='<i class="ti '+(ic||"ti-check")+' text-emerald-400"></i>'+esc(msg); w.appendChild(t); setTimeout(function(){ t.style.opacity="0"; t.style.transform="translateY(12px)"; t.style.transition="all .3s ease"; setTimeout(function(){ t.remove(); },300); },2600); }
                function mix(c,p){ return "color-mix(in srgb,"+c+" "+(p||15)+"%,transparent)"; }
                function ini(n){ return n.replace(/^Dr\.?\s*/i,"").split(" ").map(function(w){return w[0];}).join("").slice(0,2).toUpperCase(); }

                /* ================= DATA ================= */
                var CTYPE={Video:{c:"#6366f1",ic:"ti-video"},Audio:{c:"#0ea5e9",ic:"ti-phone"},Chat:{c:"#10b981",ic:"ti-message"}};
                var STC={Live:"#ef4444",Waiting:"#f59e0b",Scheduled:"#0ea5e9",Completed:"#10b981",Cancelled:"#94a3b8"};
                var PRIO={High:"#ef4444",Medium:"#f59e0b",Low:"#10b981"};

                var CONS=[
                    {id:"VC-9001",pt:"Ravi Kumar",ptc:"#0ea5e9",doc:"Dr. Sarah Roberts",docc:"#ef4444",dept:"Cardiology",time:"10:00 AM",ctype:"Video",dur:"18 min",status:"Live",prio:"High",room:"Room-A1",symptom:"Chest tightness, breathlessness",age:52},
                    {id:"VC-9002",pt:"Anita Desai",ptc:"#8b5cf6",doc:"Dr. Vikram Nair",docc:"#8b5cf6",dept:"Neurology",time:"10:15 AM",ctype:"Video",dur:"12 min",status:"Live",prio:"Medium",room:"Room-A2",symptom:"Recurring migraines",age:34},
                    {id:"VC-9003",pt:"Mohammed Ali",ptc:"#10b981",doc:"Dr. Meera Iyer",docc:"#f59e0b",dept:"Pediatrics",time:"10:30 AM",ctype:"Audio",dur:"—",status:"Waiting",prio:"High",room:"Room-B1",symptom:"Child fever & rash",age:6},
                    {id:"VC-9004",pt:"Priya Sharma",ptc:"#d946ef",doc:"Dr. Priya Sharma",docc:"#d946ef",dept:"Gynecology",time:"10:45 AM",ctype:"Video",dur:"—",status:"Waiting",prio:"Medium",room:"Room-B2",symptom:"Routine prenatal check",age:29},
                    {id:"VC-9005",pt:"John Mathew",ptc:"#f43f5e",doc:"Dr. Karan Malhotra",docc:"#10b981",dept:"Dermatology",time:"11:00 AM",ctype:"Video",dur:"—",status:"Scheduled",prio:"Low",room:"Room-C1",symptom:"Skin allergy follow-up",age:41},
                    {id:"VC-9006",pt:"Sunita Rao",ptc:"#14b8a6",doc:"Dr. Rajesh Menon",docc:"#ec4899",dept:"Oncology",time:"11:15 AM",ctype:"Video",dur:"—",status:"Scheduled",prio:"High",room:"Room-C2",symptom:"Chemo review",age:58},
                    {id:"VC-9007",pt:"Deepak Nair",ptc:"#6366f1",doc:"Dr. Fatima Sheikh",docc:"#a855f7",dept:"Psychiatry",time:"09:00 AM",ctype:"Video",dur:"40 min",status:"Completed",prio:"Medium",room:"Room-A1",symptom:"Anxiety management",age:37},
                    {id:"VC-9008",pt:"Meera Iyer",ptc:"#f59e0b",doc:"Dr. Deepak Nair",docc:"#6366f1",dept:"Radiology",time:"09:20 AM",ctype:"Audio",dur:"15 min",status:"Completed",prio:"Low",room:"Room-B1",symptom:"Report discussion",age:45},
                    {id:"VC-9009",pt:"Arjun Menon",ptc:"#0891b2",doc:"Dr. Arjun Menon",docc:"#0891b2",dept:"Nephrology",time:"09:40 AM",ctype:"Video",dur:"25 min",status:"Completed",prio:"Medium",room:"Room-C1",symptom:"Dialysis planning",age:60},
                    {id:"VC-9010",pt:"Fatima Sheikh",ptc:"#a855f7",doc:"Dr. Sunita Rao",docc:"#14b8a6",dept:"ENT",time:"11:30 AM",ctype:"Chat",dur:"—",status:"Scheduled",prio:"Low",room:"Room-C3",symptom:"Ear pain query",age:26},
                    {id:"VC-9011",pt:"Karan Malhotra",ptc:"#10b981",doc:"Dr. Anita Desai",docc:"#0ea5e9",dept:"Orthopedics",time:"08:30 AM",ctype:"Video",dur:"—",status:"Cancelled",prio:"Low",room:"Room-A3",symptom:"Knee pain",age:48},
                    {id:"VC-9012",pt:"Neha Kapoor",ptc:"#ec4899",doc:"Dr. Sarah Roberts",docc:"#ef4444",dept:"Cardiology",time:"11:45 AM",ctype:"Video",dur:"—",status:"Waiting",prio:"Medium",room:"Room-A1",symptom:"Palpitations",age:33}
                ];

                var DOCS=[
                    {name:"Dr. Sarah Roberts",dept:"Cardiology",spec:"Interventional",c:"#ef4444",online:1,current:"VC-9001",next:"11:45 AM",slots:3,rating:4.9},
                    {name:"Dr. Vikram Nair",dept:"Neurology",spec:"Stroke Care",c:"#8b5cf6",online:1,current:"VC-9002",next:"12:00 PM",slots:2,rating:4.8},
                    {name:"Dr. Meera Iyer",dept:"Pediatrics",spec:"Neonatology",c:"#f59e0b",online:1,current:"",next:"10:30 AM",slots:5,rating:4.9},
                    {name:"Dr. Karan Malhotra",dept:"Dermatology",spec:"Cosmetic",c:"#10b981",online:1,current:"",next:"11:00 AM",slots:6,rating:4.7},
                    {name:"Dr. Fatima Sheikh",dept:"Psychiatry",spec:"Behavioral",c:"#a855f7",online:0,current:"",next:"02:00 PM",slots:4,rating:4.8},
                    {name:"Dr. Rajesh Menon",dept:"Oncology",spec:"Medical Onc",c:"#ec4899",online:1,current:"",next:"11:15 AM",slots:1,rating:4.6}
                ];

                var ACTIVITY=[
                    {ic:"ti-video",c:"#6366f1",t:"Video consult started — VC-9001",s:"Dr. Sarah Roberts · Ravi Kumar",tm:"2m ago"},
                    {ic:"ti-calendar-plus",c:"#0ea5e9",t:"New appointment booked",s:"Neha Kapoor · Cardiology",tm:"14m ago"},
                    {ic:"ti-circle-check",c:"#10b981",t:"Session completed — VC-9007",s:"40 min · Psychiatry",tm:"35m ago"},
                    {ic:"ti-repeat",c:"#8b5cf6",t:"Follow-up booked",s:"Deepak Nair · in 7 days",tm:"1h ago"},
                    {ic:"ti-prescription",c:"#ec4899",t:"Prescription generated",s:"VC-9009 · Dr. Arjun Menon",tm:"2h ago"},
                    {ic:"ti-user-check",c:"#f59e0b",t:"Dr. Meera Iyer came online",s:"Pediatrics",tm:"3h ago"}
                ];

                var KPIS=[
                    {l:"Active Video Consults",v:"6",ic:"ti-video",c:"#6366f1",p:60,ch:"live",spark:[3,4,5,4,6,5,6]},
                    {l:"Scheduled",v:"14",ic:"ti-calendar-clock",c:"#0ea5e9",p:70,ch:"+3",spark:[8,10,11,12,13,13,14]},
                    {l:"Doctors Online",v:"18",ic:"ti-user-check",c:"#10b981",p:75,ch:"of 24",spark:[12,14,15,16,17,18,18]},
                    {l:"Waiting Patients",v:"4",ic:"ti-hourglass",c:"#f59e0b",p:33,ch:"avg 6m",spark:[2,3,4,3,5,4,4]},
                    {l:"Completed Today",v:"128",ic:"ti-circle-check",c:"#059669",p:85,ch:"+12%",spark:[80,95,100,110,118,124,128]},
                    {l:"Avg. Consult Time",v:"22m",ic:"ti-clock-hour-4",c:"#ec4899",p:55,ch:"-2m",spark:[26,25,24,23,22,22,22]}
                ];

                var COLS=[["id","ID",1],["patient","Patient",1],["doctor","Doctor",1],["dept","Department",1],["date","Appointment",1],["ctype","Type",1],["dur","Duration",1],["status","Status",1]];
                var state={ q:"", view:"grid", filters:{doctor:"",dept:"",ctype:"",status:"",prio:"",date:"",sort:"time"}, sel:{}, cols:{} };
                COLS.forEach(function(c){ state.cols[c[0]]=true; });

                /* ================= SPARKLINE ================= */
                function spark(data,c){
                    var w=90,h=26,max=Math.max.apply(null,data),min=Math.min.apply(null,data),rng=(max-min)||1;
                    var pts=data.map(function(v,i){ return (i/(data.length-1)*w).toFixed(1)+","+(h-((v-min)/rng)*(h-4)-2).toFixed(1); });
                    return '<svg viewBox="0 0 '+w+' '+h+'" width="'+w+'" height="'+h+'" preserveAspectRatio="none"><polyline fill="none" stroke="'+c+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="'+pts.join(" ")+'"/><polyline fill="'+mix(c,14)+'" stroke="none" points="0,'+h+' '+pts.join(" ")+' '+w+','+h+'"/></svg>';
                }

                /* ================= KPIs ================= */
                function renderKPIs(){
                    $("#tm-kpis").innerHTML = KPIS.map(function(k){
                        return '<div class="tm-kpi" style="--kc:'+k.c+'"><div class="flex items-start justify-between mb-2"><div class="tm-kpi-ic" style="background:'+mix(k.c)+';color:'+k.c+'"><i class="ti '+k.ic+' text-lg"></i></div><svg viewBox="0 0 36 36" class="tm-ring w-11 h-11"><circle cx="18" cy="18" r="15.9155" fill="none" stroke="var(--color-gray-200)" stroke-width="3.4"/><circle class="bar" cx="18" cy="18" r="15.9155" fill="none" stroke="'+k.c+'" stroke-width="3.4" stroke-linecap="round" pathLength="100" style="--p:'+k.p+'"/></svg></div><div class="tm-kpi-v">'+esc(k.v)+'</div><div class="flex items-center justify-between mt-1"><span class="text-xs tm-muted font-semibold">'+esc(k.l)+'</span><span class="tm-chip" style="background:'+mix(k.c)+';color:'+k.c+'">'+esc(k.ch)+'</span></div><div class="mt-2 opacity-90">'+spark(k.spark,k.c)+'</div></div>';
                    }).join("");
                }

                /* ================= WIDGETS ================= */
                function renderWidgets(){
                    var hrs=["9a","10a","11a","12p","1p","2p","3p"], data=[14,22,26,18,20,24,16], max=Math.max.apply(null,data);
                    var w=280,h=90,pts=data.map(function(v,i){ return (i/(data.length-1)*w).toFixed(1)+","+(h-(v/max)*(h-10)-4).toFixed(1); });
                    $("#tm-w-trend").innerHTML='<svg viewBox="0 0 '+w+' '+h+'" class="w-full" style="height:100px" preserveAspectRatio="none"><defs><linearGradient id="tmg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="'+mix("#6366f1",35)+'"/><stop offset="100%" stop-color="'+mix("#6366f1",2)+'"/></linearGradient></defs><polyline fill="url(#tmg)" stroke="none" points="0,'+h+' '+pts.join(" ")+' '+w+','+h+'"/><polyline fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" points="'+pts.join(" ")+'"/></svg><div class="flex justify-between mt-1">'+hrs.map(function(x){return '<span class="text-[10px] tm-muted font-semibold">'+x+'</span>';}).join("")+'</div>';

                    var online=DOCS.filter(function(d){return d.online;}).length;
                    $("#tm-w-avail").innerHTML='<div class="flex items-center gap-4"><svg viewBox="0 0 36 36" class="tm-ring w-24 h-24 flex-none"><circle cx="18" cy="18" r="15.9155" fill="none" stroke="var(--color-gray-200)" stroke-width="3.6"/><circle class="bar" cx="18" cy="18" r="15.9155" fill="none" stroke="#10b981" stroke-width="3.6" stroke-linecap="round" pathLength="100" style="--p:'+Math.round(online/DOCS.length*100)+'"/></svg><div><div class="text-2xl font-extrabold text-[var(--color-gray-900)]">'+online+'/'+DOCS.length+'</div><div class="text-xs tm-muted font-semibold">Doctors online</div><div class="mt-2 text-xs space-y-1"><div class="flex items-center gap-2"><span class="tm-dotstat" style="background:#ef4444"></span><span class="tm-muted">In consult</span><b class="text-[var(--color-gray-900)] ml-auto">'+DOCS.filter(function(d){return d.current;}).length+'</b></div><div class="flex items-center gap-2"><span class="tm-dotstat" style="background:#10b981"></span><span class="tm-muted">Available</span><b class="text-[var(--color-gray-900)] ml-auto">'+DOCS.filter(function(d){return d.online&&!d.current;}).length+'</b></div></div></div></div>';

                    var sc={};
                    CONS.forEach(function(c){ sc[c.status]=(sc[c.status]||0)+1; });
                    var entries=Object.keys(sc).map(function(k){ return {k:k,n:sc[k],c:STC[k]}; });
                    var tot=CONS.length, off=0, seg="";
                    entries.forEach(function(x){ var f=x.n/tot*100; seg+='<circle cx="18" cy="18" r="15.9155" fill="none" stroke="'+x.c+'" stroke-width="4.4" stroke-dasharray="'+f+' '+(100-f)+'" stroke-dashoffset="'+(-off)+'"/>'; off+=f; });
                    $("#tm-w-status").innerHTML=seg+'<circle cx="18" cy="18" r="10" fill="var(--color-white)"/>';
                    $("#tm-w-status-legend").innerHTML=entries.map(function(x){ return '<div class="flex items-center gap-2 text-xs"><span class="w-2.5 h-2.5 rounded-full flex-none" style="background:'+x.c+'"></span><span class="font-semibold text-[var(--color-gray-900)] flex-1">'+esc(x.k)+'</span><span class="tm-muted font-bold">'+x.n+'</span></div>'; }).join("");

                    $("#tm-w-success").innerHTML='<div class="flex items-center gap-4"><svg viewBox="0 0 36 36" class="tm-ring w-24 h-24 flex-none"><circle cx="18" cy="18" r="15.9155" fill="none" stroke="var(--color-gray-200)" stroke-width="3.6"/><circle class="bar" cx="18" cy="18" r="15.9155" fill="none" stroke="#6366f1" stroke-width="3.6" stroke-linecap="round" pathLength="100" style="--p:94"/></svg><div><div class="text-2xl font-extrabold text-[var(--color-gray-900)]">94%</div><div class="text-xs tm-muted font-semibold">Success rate</div><div class="mt-2 text-xs space-y-1"><div class="flex items-center gap-2"><span class="tm-dotstat" style="background:#10b981"></span><span class="tm-muted">Successful</span><b class="text-[var(--color-gray-900)] ml-auto">120</b></div><div class="flex items-center gap-2"><span class="tm-dotstat" style="background:#ef4444"></span><span class="tm-muted">Dropped</span><b class="text-[var(--color-gray-900)] ml-auto">8</b></div></div></div></div>';

                    var dur=[18,22,26,20,24,21,19], maxDur=Math.max.apply(null,dur), dl=["M","T","W","T","F","S","S"];
                    $("#tm-w-duration").innerHTML=dur.map(function(v,i){ return '<div class="flex-1 flex flex-col items-center gap-1 h-full justify-end"><span class="text-[10px] font-bold tm-muted">'+v+'</span><div class="w-full rounded-t-md" style="height:'+Math.round(v/maxDur*100)+'%;background:linear-gradient(180deg,#6366f1,#0ea5e9)"></div><span class="text-[10px] tm-muted font-semibold">'+dl[i]+'</span></div>'; }).join("");

                    var stars=[72,18,6,3,1];
                    $("#tm-w-sat").innerHTML='<div class="flex items-center gap-3 mb-3"><div class="text-3xl font-extrabold text-[var(--color-gray-900)]">4.8</div><div><div class="text-amber-400 text-sm"><i class="ti ti-star"></i><i class="ti ti-star"></i><i class="ti ti-star"></i><i class="ti ti-star"></i><i class="ti ti-star-half"></i></div><div class="text-[11px] tm-muted">2,140 ratings</div></div></div>'+[5,4,3,2,1].map(function(s,i){ return '<div class="flex items-center gap-2 mb-1"><span class="text-xs font-bold tm-muted w-3">'+s+'</span><i class="ti ti-star text-amber-400 text-xs"></i><div class="tm-bar flex-1"><span style="width:'+stars[i]+'%;background:#f59e0b"></span></div><span class="text-xs tm-muted w-8 text-right">'+stars[i]+'%</span></div>'; }).join("");
                }

                /* ================= FILTER SELECTS ================= */
                var DEPTS=CONS.map(function(c){return c.dept;}).filter(function(v,i,a){return a.indexOf(v)===i;});
                var DOCTORS=DOCS.map(function(d){return d.name;});

                /* ================= FILTER ================= */
                function filtered(){
                    var f=state.filters, q=state.q.toLowerCase();
                    var arr=CONS.filter(function(c){
                        if(q && (c.id+" "+c.pt+" "+c.doc+" "+c.dept).toLowerCase().indexOf(q)<0) return false;
                        if(f.doctor && c.doc!==f.doctor) return false;
                        if(f.dept && c.dept!==f.dept) return false;
                        if(f.ctype && c.ctype!==f.ctype) return false;
                        if(f.status && c.status!==f.status) return false;
                        if(f.prio && c.prio!==f.prio) return false;
                        return true;
                    });
                    var so={Live:0,Waiting:1,Scheduled:2,Completed:3,Cancelled:4}, po={High:0,Medium:1,Low:2};
                    arr.sort(function(a,b){
                        if(f.sort==="status") return so[a.status]-so[b.status];
                        if(f.sort==="prio") return po[a.prio]-po[b.prio];
                        if(f.sort==="name") return a.pt.localeCompare(b.pt);
                        return a.time.localeCompare(b.time);
                    });
                    return arr;
                }

                function detailUrl(c){ return "telemedicine-session-detail.html?"+new URLSearchParams({id:c.id,patient:c.pt,doctor:c.doc,status:c.status}).toString(); }

                /* ================= GRID ================= */
                function gridHTML(c){
                    var sc=STC[c.status], ct=CTYPE[c.ctype]||{c:"#94a3b8",ic:"ti-video"};
                    return '<div class="tm-ccard" style="--cc:'+c.ptc+'"><div class="p-4">'+
                        '<div class="flex items-center justify-between mb-3"><span class="text-xs font-bold text-[var(--color-primary)]">'+esc(c.id)+'</span><div class="flex items-center gap-1.5"><span class="tm-tag" style="background:'+mix(PRIO[c.prio])+';color:'+PRIO[c.prio]+'"><i class="ti ti-flag-3" style="font-size:.58rem"></i>'+esc(c.prio)+'</span><button class="tm-btn tm-btn-soft !p-1.5" data-menu="'+c.id+'"><i class="ti ti-dots-vertical"></i></button></div></div>'+
                        '<div class="flex items-center gap-2"><div class="flex -space-x-2"><div class="tm-av" style="background:linear-gradient(135deg,'+c.ptc+','+mix(c.ptc,60)+')">'+esc(ini(c.pt))+'</div><div class="tm-av" style="background:linear-gradient(135deg,'+c.docc+','+mix(c.docc,60)+')">'+esc(ini(c.doc))+'</div></div>'+
                        '<div class="flex-1 min-w-0"><div class="text-sm font-bold text-[var(--color-gray-900)] truncate">'+esc(c.pt)+'</div><div class="text-xs tm-muted truncate">with '+esc(c.doc.replace("Dr. ","Dr "))+'</div></div>'+
                        (c.status==="Live"?'<span class="tm-tag" style="background:'+mix("#ef4444")+';color:#dc2626"><span class="tm-live"></span>LIVE</span>':'<span class="tm-tag" style="background:'+mix(sc)+';color:'+sc+'"><span class="tm-dotstat" style="background:'+sc+'"></span>'+esc(c.status)+'</span>')+'</div>'+
                        '<div class="grid grid-cols-2 gap-2 mt-3 text-xs">'+
                            '<div class="flex items-center gap-1.5 tm-muted"><i class="ti ti-clock"></i> '+esc(c.time)+'</div>'+
                            '<div class="flex items-center gap-1.5 tm-muted"><i class="ti '+ct.ic+'" style="color:'+ct.c+'"></i> '+esc(c.ctype)+'</div>'+
                            '<div class="flex items-center gap-1.5 tm-muted"><i class="ti ti-building-hospital"></i> '+esc(c.dept)+'</div>'+
                            '<div class="flex items-center gap-1.5 tm-muted"><i class="ti ti-door"></i> '+esc(c.room)+'</div>'+
                        '</div>'+
                        '<div class="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--color-border-color)]">'+
                            (c.status==="Live"||c.status==="Waiting"||c.status==="Scheduled"?'<button class="tm-btn tm-btn-video flex-1 !py-1.5 text-xs" data-join="'+c.id+'"><i class="ti ti-video"></i> '+(c.status==="Live"?"Join":"Start")+'</button>':'<a class="tm-btn tm-btn-soft flex-1 !py-1.5 text-xs" href="'+detailUrl(c)+'"><i class="ti ti-eye"></i> View</a>')+
                            '<button class="tm-btn tm-btn-soft !p-2" data-open="'+c.id+'"><i class="ti ti-info-circle"></i></button>'+
                        '</div>'+
                    '</div></div>';
                }

                /* ================= LIST ================= */
                function td(col,html){ return '<td class="'+(state.cols[col]?"":"tm-hidecol")+'">'+html+'</td>'; }
                function renderList(arr){
                    $("#tm-tbody").innerHTML=arr.map(function(c){
                        var sc=STC[c.status], ct=CTYPE[c.ctype]||{c:"#94a3b8"};
                        return '<tr data-row="'+c.id+'"><td><input type="checkbox" class="tm-cb tm-rowcb" data-id="'+c.id+'"'+(state.sel[c.id]?" checked":"")+'></td>'+
                            td("id",'<a class="font-bold text-[var(--color-primary)] hover:underline" href="'+detailUrl(c)+'">'+esc(c.id)+'</a>')+
                            td("patient",'<div class="flex items-center gap-2.5"><div class="tm-av tm-av-sm" style="background:linear-gradient(135deg,'+c.ptc+','+mix(c.ptc,60)+')">'+esc(ini(c.pt))+'</div><span class="font-bold text-[var(--color-gray-900)]">'+esc(c.pt)+'</span></div>')+
                            td("doctor",'<span class="tm-muted">'+esc(c.doc)+'</span>')+
                            td("dept",'<span class="tm-muted">'+esc(c.dept)+'</span>')+
                            td("date",'<span class="tm-muted whitespace-nowrap">'+esc(c.time)+'</span>')+
                            td("ctype",'<span class="tm-tag" style="background:'+mix(ct.c)+';color:'+ct.c+'">'+esc(c.ctype)+'</span>')+
                            td("dur",'<span class="tm-muted">'+esc(c.dur)+'</span>')+
                            td("status",(c.status==="Live"?'<span class="tm-tag" style="background:'+mix("#ef4444")+';color:#dc2626"><span class="tm-live"></span>LIVE</span>':'<span class="tm-tag" style="background:'+mix(sc)+';color:'+sc+'"><span class="tm-dotstat" style="background:'+sc+'"></span>'+esc(c.status)+'</span>'))+
                            '<td><button class="tm-btn tm-btn-soft !p-1.5" data-menu="'+c.id+'"><i class="ti ti-dots-vertical"></i></button></td></tr>';
                    }).join("");
                    $$('#tm-tabletag th[data-col]').forEach(function(th){ th.classList.toggle("tm-hidecol", !state.cols[th.getAttribute("data-col")]); });
                    syncSelAll();
                }

                /* ================= CALENDAR (agenda) ================= */
                function renderCalendar(arr){
                    $("#tm-calendar").innerHTML=arr.slice().sort(function(a,b){return a.time.localeCompare(b.time);}).map(function(c){
                        var sc=STC[c.status], ct=CTYPE[c.ctype]||{c:"#94a3b8",ic:"ti-video"};
                        return '<div class="flex items-center gap-3 p-3 rounded-xl border border-[var(--color-border-color)] hover:border-[var(--color-primary)] transition cursor-pointer" data-open="'+c.id+'"><div class="text-center flex-none w-16"><div class="text-sm font-extrabold text-[var(--color-gray-900)]">'+esc(c.time.split(" ")[0])+'</div><div class="text-[10px] tm-muted font-semibold">'+esc(c.time.split(" ")[1]||"")+'</div></div><div class="w-1 h-10 rounded-full" style="background:'+ct.c+'"></div><div class="flex -space-x-2 flex-none"><div class="tm-av tm-av-sm" style="background:linear-gradient(135deg,'+c.ptc+','+mix(c.ptc,60)+')">'+esc(ini(c.pt))+'</div><div class="tm-av tm-av-sm" style="background:linear-gradient(135deg,'+c.docc+','+mix(c.docc,60)+')">'+esc(ini(c.doc))+'</div></div><div class="flex-1 min-w-0"><div class="text-sm font-bold text-[var(--color-gray-900)] truncate">'+esc(c.pt)+' · '+esc(c.dept)+'</div><div class="text-xs tm-muted truncate">'+esc(c.doc)+' · '+esc(c.ctype)+'</div></div>'+(c.status==="Live"?'<span class="tm-tag" style="background:'+mix("#ef4444")+';color:#dc2626"><span class="tm-live"></span>LIVE</span>':'<span class="tm-tag" style="background:'+mix(sc)+';color:'+sc+'">'+esc(c.status)+'</span>')+'</div>';
                    }).join("");
                }

                /* ================= BOARDS ================= */
                function renderBoards(){
                    var wait=CONS.filter(function(c){return c.status==="Waiting";});
                    $("#tm-wait-n").textContent=wait.length+" waiting";
                    $("#tm-waiting").innerHTML=wait.map(function(c,i){
                        var mins=[6,4,9,3][i%4];
                        return '<div class="flex items-center gap-2.5 p-2.5 rounded-lg border border-[var(--color-border-color)]"><div class="tm-av tm-av-sm" style="background:linear-gradient(135deg,'+c.ptc+','+mix(c.ptc,60)+')">'+esc(ini(c.pt))+'</div><div class="flex-1 min-w-0"><div class="text-xs font-bold text-[var(--color-gray-900)] truncate">'+esc(c.pt)+'</div><div class="text-[11px] tm-muted truncate">'+esc(c.time)+' · '+esc(c.dept)+'</div></div><div class="text-right flex-none"><span class="tm-tag" style="background:'+mix(PRIO[c.prio])+';color:'+PRIO[c.prio]+'">'+mins+'m</span><button class="tm-btn tm-btn-video !p-1.5 mt-1 block ml-auto" data-join="'+c.id+'"><i class="ti ti-video text-xs"></i></button></div></div>';
                    }).join("")||'<p class="text-sm tm-muted text-center py-3">No patients waiting.</p>';

                    $("#tm-activity").innerHTML=ACTIVITY.map(function(a,i){ return '<div class="flex gap-3"><div class="flex flex-col items-center"><div class="w-8 h-8 rounded-lg flex items-center justify-center flex-none" style="background:'+mix(a.c)+';color:'+a.c+'"><i class="ti '+a.ic+' text-sm"></i></div>'+(i<ACTIVITY.length-1?'<div class="w-px flex-1 bg-[var(--color-border-color)] mt-1"></div>':'')+'</div><div class="min-w-0 pb-3"><div class="text-xs font-bold text-[var(--color-gray-900)]">'+esc(a.t)+'</div><div class="text-[11px] tm-muted">'+esc(a.s)+'</div><div class="text-[10px] tm-muted mt-.5">'+esc(a.tm)+'</div></div></div>'; }).join("");
                }

                /* ================= RENDER ================= */
                function render(){
                    var arr=filtered();
                    ["grid","list","calendar"].forEach(function(v){ $("#tm-view-"+v).classList.toggle("hidden", state.view!==v); });
                    $("#tm-empty").classList.toggle("hidden", arr.length>0);
                    if(state.view==="grid") $("#tm-grid").innerHTML=arr.map(gridHTML).join("");
                    else if(state.view==="list") renderList(arr);
                    else renderCalendar(arr);
                }

                /* ================= BODY SCROLL LOCK ================= */
                // Keep body scroll locked while the drawer, modal, or video-call overlay is showing; only
                // unlock once none remain open, so closing one doesn't unlock while another is still up.
                function syncBodyLock(){ document.body.style.overflow = ($(".tm-drawer.open")||$(".tm-modal.open")||$("#tm-vc.open")) ? "hidden" : ""; }

                /* ================= VIDEO WORKSPACE ================= */
                var vcTimer=null, vcSec=0, vcState={cam:1,mic:1,share:0,record:0,chat:1};
                function openVC(cons){
                    var c=cons||CONS.filter(function(x){return x.status==="Live";})[0]||CONS[0];
                    $("#tm-vc-title").textContent=(c.ctype||"Video")+" Consultation · "+c.id;
                    $("#tm-vc-sub").textContent=c.dept+" · "+c.room;
                    $("#tm-vc-doctorname").innerHTML='<i class="ti ti-stethoscope"></i> '+esc(c.doc);
                    $("#tm-vc-patientlabel").innerHTML='<i class="ti ti-user"></i> '+esc(c.pt);
                    $("#tm-vc-bigav").textContent=ini(c.pt);
                    $("#tm-vc-bigav").style.background="linear-gradient(135deg,"+c.ptc+","+mix(c.ptc,60)+")";
                    vcSec=0; vcState={cam:1,mic:1,share:0,record:0,chat:1};
                    syncVCctrls();
                    $("#tm-vc").classList.add("open");
                    syncBodyLock();
                    if(vcTimer) clearInterval(vcTimer);
                    vcTimer=setInterval(function(){ vcSec++; var m=Math.floor(vcSec/60), s=vcSec%60; $("#tm-vc-timer").textContent=(m<10?"0":"")+m+":"+(s<10?"0":"")+s; }, 1000);
                    $("#tm-vc-net").innerHTML=[8,11,14,17].map(function(h,i){ return '<span style="height:'+h+'px;background:'+(i<3?"#34d399":"#94a3b8")+'"></span>'; }).join("");
                }
                function closeVC(){ $("#tm-vc").classList.remove("open"); syncBodyLock(); if(vcTimer){ clearInterval(vcTimer); vcTimer=null; } }
                function syncVCctrls(){
                    $$('[data-vcctrl]').forEach(function(b){
                        var k=b.getAttribute("data-vcctrl"), ic=b.querySelector("i");
                        if(k==="cam"){ b.classList.toggle("off", !vcState.cam); ic.className="ti "+(vcState.cam?"ti-video":"ti-video-off"); }
                        if(k==="mic"){ b.classList.toggle("off", !vcState.mic); ic.className="ti "+(vcState.mic?"ti-microphone":"ti-microphone-off"); }
                        if(k==="share") b.classList.toggle("off", vcState.share);
                        if(k==="record") b.classList.toggle("off", vcState.record);
                    });
                    $("#tm-vc-camoff").style.display=vcState.cam?"none":"flex";
                    $("#tm-vc-pip").style.display=vcState.cam?"flex":"none";
                    $("#tm-vc-sharing").style.display=vcState.share?"inline-flex":"none";
                    $("#tm-vc-side").classList.toggle("show", !!vcState.chat);
                    $("#tm-vc-mainwrap").classList.toggle("with-side", !!vcState.chat);
                }
                $$('[data-vcctrl]').forEach(function(b){ b.addEventListener("click", function(){
                    var k=this.getAttribute("data-vcctrl");
                    if(k==="end"){ closeVC(); toast("Consultation ended","ti-phone-off"); return; }
                    if(k==="cam"){ vcState.cam^=1; }
                    if(k==="mic"){ vcState.mic^=1; toast(vcState.mic?"Microphone on":"Microphone muted", vcState.mic?"ti-microphone":"ti-microphone-off"); }
                    if(k==="share"){ vcState.share^=1; toast(vcState.share?"Screen sharing started":"Screen sharing stopped","ti-screen-share"); }
                    if(k==="record"){ vcState.record^=1; toast(vcState.record?"Recording started":"Recording stopped","ti-circle"); }
                    if(k==="chat"){ vcState.chat^=1; }
                    if(k==="speaker"){ toast("Speaker settings","ti-volume"); }
                    if(k==="invite"){ toast("Invite link copied","ti-user-plus"); }
                    syncVCctrls();
                }); });
                $("#tm-vc-min").addEventListener("click", function(){ closeVC(); toast("Consultation minimized","ti-minimize"); });
                $$('.tm-vc-tab').forEach(function(t){ t.addEventListener("click", function(){
                    var k=this.getAttribute("data-vctab"), self=this;
                    $$('.tm-vc-tab').forEach(function(x){ var on=x===self; x.style.borderBottom=on?"2px solid #6366f1":"none"; x.style.color=on?"#fff":"rgba(255,255,255,.5)"; });
                    $("#tm-vc-chatpanel").classList.toggle("hidden", k!=="chat");
                    $("#tm-vc-chatinput").classList.toggle("hidden", k!=="chat");
                    $("#tm-vc-notespanel").classList.toggle("hidden", k!=="notes");
                }); });
                function sendMsg(){ var inp=$("#tm-vc-msgin"); if(!inp.value.trim()) return; var d=document.createElement("div"); d.className="tm-chatmsg"; d.style.cssText="background:#6366f1;color:#fff;margin-left:auto"; d.textContent=inp.value; $("#tm-vc-chatpanel").appendChild(d); inp.value=""; $("#tm-vc-chatpanel").scrollTop=$("#tm-vc-chatpanel").scrollHeight; }
                $("#tm-vc-send").addEventListener("click", sendMsg);
                $("#tm-vc-msgin").addEventListener("keydown", function(e){ if(e.key==="Enter") sendMsg(); });

                /* ================= ACTION MENU ================= */
                var ACTIONS=[
                    {a:"view",n:"View Consultation",ic:"ti-eye"},{a:"join",n:"Join Consultation",ic:"ti-video",video:1},{a:"edit",n:"Edit Appointment",ic:"ti-edit"},{a:"reschedule",n:"Reschedule",ic:"ti-calendar"},{a:"assign",n:"Assign Doctor",ic:"ti-user-plus"},
                    {sep:1},{a:"start",n:"Start Consultation",ic:"ti-player-play"},{a:"end",n:"End Consultation",ic:"ti-player-stop"},{a:"notes",n:"Add Clinical Notes",ic:"ti-notes"},{a:"rx",n:"Generate Prescription",ic:"ti-prescription"},{a:"upload",n:"Upload Documents",ic:"ti-upload"},
                    {sep:1},{a:"print",n:"Print Summary",ic:"ti-printer"},{a:"pdf",n:"Download PDF",ic:"ti-file-download"},{a:"email",n:"Send Email",ic:"ti-mail"},{a:"sms",n:"Send SMS",ic:"ti-message-2"},
                    {sep:1},{a:"archive",n:"Archive",ic:"ti-archive"},{a:"delete",n:"Delete",ic:"ti-trash",danger:1}
                ];
                var menuCon=null;
                function openMenu(id,x,y){
                    menuCon=id; var m=$("#tm-menu");
                    m.innerHTML=ACTIONS.map(function(a){ return a.sep?'<div class="tm-sep"></div>':'<div class="tm-mi'+(a.danger?" danger":a.video?" video":"")+'" data-act="'+a.a+'"><i class="ti '+a.ic+'"></i>'+esc(a.n)+'</div>'; }).join("");
                    m.classList.add("open");
                    var h=Math.min(m.scrollHeight,window.innerHeight*0.7);
                    m.style.left=Math.max(8,Math.min(x, window.innerWidth-214))+"px"; m.style.top=Math.max(8,Math.min(y, window.innerHeight-h-8))+"px";
                }
                function closeMenu(){ $("#tm-menu").classList.remove("open"); menuCon=null; }
                function doAction(act){
                    var c=CONS.filter(function(x){return x.id===menuCon;})[0];
                    if(act==="view"){ closeMenu(); openDrawer(menuCon); return; }
                    if(act==="join"||act==="start"){ closeMenu(); openVC(c); return; }
                    if(act==="edit"||act==="reschedule"){ closeMenu(); openModal("edit", c); return; }
                    if(act==="assign"){ closeMenu(); openModal("assign", c); return; }
                    if(act==="upload"){ closeMenu(); openModal("upload", c); return; }
                    if(act==="delete"){ closeMenu(); openModal("delete", c); return; }
                    var msgs={end:"Consultation ended",notes:"Clinical notes added",rx:"Prescription generated",print:"Summary printed",pdf:"PDF downloaded",email:"Email sent",sms:"SMS sent",archive:"Consultation archived"};
                    toast((msgs[act]||"Action")+(c?" — "+c.id:""),"ti-check"); closeMenu();
                }

                /* ================= DRAWER ================= */
                function openDrawer(id){
                    var c=CONS.filter(function(x){return x.id===id;})[0]; if(!c) return;
                    var prev=[{d:"Jun 28",s:"Follow-up · resolved"},{d:"May 12",s:"Initial consult"}];
                    var tl=[{n:"Appointment booked",tm:"Today, 08:30",done:1},{n:"Doctor assigned",tm:"Today, 08:35",done:1},{n:"Patient checked in",tm:"Today, "+c.time,done:1},{n:c.status==="Live"?"Consultation started":"Waiting room",tm:c.status==="Live"?"Now":"—",done:c.status==="Live"||c.status==="Completed"}];
                    $("#tm-drawer-body").innerHTML=''+
                        '<div class="relative p-5 pb-8" style="background:linear-gradient(135deg,'+c.ptc+','+mix(c.ptc,55)+')">'+
                            '<div class="flex items-center justify-between"><button class="tm-btn tm-btn-glass !p-2" data-close><i class="ti ti-x"></i></button><span class="tm-tag" style="background:rgba(255,255,255,.2);color:#fff;border:1px solid rgba(255,255,255,.3)">'+(c.status==="Live"?'<span class="tm-live"></span>LIVE':'<span class="tm-dotstat" style="background:#fff"></span>'+esc(c.status))+'</span></div>'+
                            '<div class="flex items-center gap-3 mt-4 text-white"><div class="w-16 h-16 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-xl font-extrabold">'+esc(ini(c.pt))+'</div><div><h2 class="text-xl font-extrabold">'+esc(c.pt)+'</h2><p class="text-white/80 text-sm">'+esc(c.age)+' yrs · '+esc(c.dept)+'</p><p class="text-white/70 text-xs mt-.5">'+esc(c.id)+' · '+esc(c.room)+'</p></div></div>'+
                        '</div>'+
                        '<div class="p-5 space-y-5">'+
                            (c.status==="Live"||c.status==="Waiting"||c.status==="Scheduled"?'<button class="tm-btn tm-btn-video w-full" data-join="'+c.id+'"><i class="ti ti-video"></i> '+(c.status==="Live"?"Join Live Consultation":"Start Consultation")+'</button>':'')+
                            '<div class="grid grid-cols-2 gap-2.5"><div class="p-3 rounded-xl border border-[var(--color-border-color)]"><div class="text-xs tm-muted font-semibold mb-1">Doctor</div><div class="flex items-center gap-2"><div class="tm-av tm-av-sm" style="background:linear-gradient(135deg,'+c.docc+','+mix(c.docc,60)+')">'+esc(ini(c.doc))+'</div><span class="text-sm font-bold text-[var(--color-gray-900)] truncate">'+esc(c.doc.replace("Dr. ","Dr "))+'</span></div></div><div class="p-3 rounded-xl border border-[var(--color-border-color)]"><div class="text-xs tm-muted font-semibold mb-1">Appointment</div><div class="text-sm font-bold text-[var(--color-gray-900)]">'+esc(c.time)+'</div><div class="text-[11px] tm-muted">'+esc(c.ctype)+' · '+esc(c.dur)+'</div></div></div>'+
                            '<div><div class="text-xs tm-muted font-semibold mb-1.5">Current Symptoms</div><p class="text-sm tm-muted p-3 rounded-lg bg-[var(--color-gray-100)]">'+esc(c.symptom)+'</p></div>'+
                            '<div><div class="text-xs tm-muted font-semibold mb-1.5">Medical History</div><div class="flex flex-wrap gap-1.5"><span class="tm-tag" style="background:var(--color-gray-100);color:var(--color-gray-600)">Hypertension</span><span class="tm-tag" style="background:var(--color-gray-100);color:var(--color-gray-600)">Allergy: Penicillin</span><span class="tm-tag" style="background:var(--color-gray-100);color:var(--color-gray-600)">Non-smoker</span></div></div>'+
                            '<div><div class="text-xs tm-muted font-semibold mb-2">Uploaded Documents</div><div class="space-y-1.5"><div class="flex items-center gap-2.5 p-2 rounded-lg border border-[var(--color-border-color)]"><i class="ti ti-file-text text-rose-500"></i><span class="text-xs font-semibold text-[var(--color-gray-900)] flex-1 truncate">lab-report.pdf</span><button class="tm-btn tm-btn-soft !p-1.5" data-toast="Downloading"><i class="ti ti-download"></i></button></div><div class="flex items-center gap-2.5 p-2 rounded-lg border border-[var(--color-border-color)]"><i class="ti ti-photo text-sky-500"></i><span class="text-xs font-semibold text-[var(--color-gray-900)] flex-1 truncate">xray-chest.jpg</span><button class="tm-btn tm-btn-soft !p-1.5" data-toast="Downloading"><i class="ti ti-download"></i></button></div></div></div>'+
                            '<div><div class="text-xs tm-muted font-semibold mb-2">Previous Consultations</div><div class="space-y-1.5">'+prev.map(function(p){ return '<div class="flex items-center gap-2.5 p-2 rounded-lg border border-[var(--color-border-color)]"><i class="ti ti-history tm-muted"></i><span class="text-xs font-semibold text-[var(--color-gray-900)] flex-1">'+esc(p.s)+'</span><span class="text-[11px] tm-muted">'+esc(p.d)+'</span></div>'; }).join("")+'</div></div>'+
                            '<div><div class="text-xs tm-muted font-semibold mb-2">Timeline</div><div class="space-y-2.5">'+tl.map(function(h,i){ return '<div class="flex gap-3"><div class="flex flex-col items-center"><div class="w-6 h-6 rounded-full flex items-center justify-center flex-none" style="background:'+mix(h.done?"#10b981":"#94a3b8")+';color:'+(h.done?"#10b981":"#94a3b8")+'"><i class="ti '+(h.done?"ti-check":"ti-clock")+' text-xs"></i></div>'+(i<tl.length-1?'<div class="w-px flex-1 bg-[var(--color-border-color)] mt-1"></div>':'')+'</div><div class="pb-2"><div class="text-xs font-bold text-[var(--color-gray-900)]">'+esc(h.n)+'</div><div class="text-[11px] tm-muted">'+esc(h.tm)+'</div></div></div>'; }).join("")+'</div></div>'+
                            '<div class="grid grid-cols-2 gap-2 pt-1"><button class="tm-btn tm-btn-soft" data-toast="Prescription generated"><i class="ti ti-prescription"></i> Prescribe</button><button class="tm-btn tm-btn-soft" data-modal="edit"><i class="ti ti-edit"></i> Edit</button><button class="tm-btn tm-btn-soft" data-toast="Summary printed"><i class="ti ti-printer"></i> Print</button><button class="tm-btn tm-btn-soft" data-toast="Email sent"><i class="ti ti-mail"></i> Email</button></div>'+
                        '</div>';
                    $("#tm-drawer").classList.add("open");
                    syncBodyLock();
                }

                /* ================= MODALS ================= */
                function fld(label,inner){ return '<div><label class="tm-lbl">'+label+'</label>'+inner+'</div>'; }
                function selDoc(v){ return '<select class="tm-inp">'+DOCTORS.map(function(d){return '<option'+(v===d?" selected":"")+'>'+esc(d)+'</option>';}).join("")+'</select>'; }
                var MODALS={
                    schedule:{t:"Schedule Consultation",ic:"ti-calendar-plus",body:function(){ return '<div class="space-y-3">'+fld("Patient",'<input class="tm-inp" placeholder="Patient name">')+fld("Doctor",selDoc())+'<div class="grid grid-cols-2 gap-3">'+fld("Date",'<input type="text" placeholder="dd-mm-yyyy" class="tm-inp" data-provider="flatpickr" data-date-format="d-m-Y">')+fld("Time",'<input type="text" placeholder="--:-- --" class="tm-inp" data-provider="timepickr" data-default-time="10:00">')+'</div><div class="grid grid-cols-2 gap-3">'+fld("Type",'<select class="tm-inp"><option>Video</option><option>Audio</option><option>Chat</option></select>')+fld("Priority",'<select class="tm-inp"><option>Low</option><option>Medium</option><option>High</option></select>')+'</div>'+fld("Reason / Symptoms",'<textarea class="tm-inp" rows="2"></textarea>')+'</div>'; },cta:"Schedule Consultation"},
                    edit:{t:"Edit Appointment",ic:"ti-edit",body:function(c){ return '<div class="space-y-3">'+fld("Patient",'<input class="tm-inp" value="'+(c?esc(c.pt):"")+'">')+fld("Doctor",selDoc(c?c.doc:""))+'<div class="grid grid-cols-2 gap-3">'+fld("Time",'<input type="text" placeholder="--:-- --" class="tm-inp" data-provider="timepickr" data-default-time="10:00">')+fld("Type",'<select class="tm-inp"><option>Video</option><option>Audio</option><option>Chat</option></select>')+'</div>'+fld("Status",'<select class="tm-inp"><option>Scheduled</option><option>Waiting</option><option>Live</option><option>Completed</option><option>Cancelled</option></select>')+'</div>'; },cta:"Save Changes"},
                    assign:{t:"Assign Doctor",ic:"ti-user-plus",body:function(c){ return '<div class="space-y-3">'+fld("Consultation",'<input class="tm-inp" value="'+(c?esc(c.id+" — "+c.pt):"")+'" readonly>')+fld("Assign To",selDoc())+fld("Note",'<input class="tm-inp" placeholder="Optional">')+'</div>'; },cta:"Assign Doctor"},
                    invite:{t:"Invite Patient",ic:"ti-user-plus",body:function(){ return '<div class="space-y-3">'+fld("Patient Name",'<input class="tm-inp" placeholder="Full name">')+'<div class="grid grid-cols-2 gap-3">'+fld("Email",'<input class="tm-inp" type="email" placeholder="email@example.com">')+fld("Mobile",'<input class="tm-inp" placeholder="+91...">')+'</div>'+fld("Consultation Link",'<div class="flex gap-2"><input class="tm-inp" value="https://dreamshms.care/vc/9013" readonly><button class="tm-btn tm-btn-soft" data-toast="Link copied"><i class="ti ti-copy"></i></button></div>')+fld("Send Via",'<select class="tm-inp"><option>Email + SMS</option><option>Email only</option><option>SMS only</option></select>')+'</div>'; },cta:"Send Invite"},
                    upload:{t:"Upload Documents",ic:"ti-upload",body:function(){ return '<div class="space-y-3"><div class="tm-drop" id="tm-dropzone"><i class="ti ti-cloud-upload text-3xl tm-muted"></i><p class="text-sm font-bold text-[var(--color-gray-900)] mt-2">Drag & drop reports, images or PDFs</p><p class="text-xs tm-muted">or click to browse</p><input type="file" class="hidden" id="tm-file"></div><div class="text-xs tm-muted" id="tm-upload-sum"></div></div>'; },cta:"Upload"},
                    import:{t:"Import Appointments",ic:"ti-upload",body:function(){ return '<div class="space-y-3"><div class="tm-drop" id="tm-dropzone"><i class="ti ti-cloud-upload text-3xl tm-muted"></i><p class="text-sm font-bold text-[var(--color-gray-900)] mt-2">Drag & drop CSV / Excel / Appointment Import</p><p class="text-xs tm-muted">or click to browse files</p><input type="file" class="hidden" id="tm-file"></div><button class="tm-btn tm-btn-soft w-full" data-toast="Sample template downloaded"><i class="ti ti-file-download"></i> Download Sample Template</button><div class="p-3 rounded-lg" style="background:'+mix("#6366f1",8)+'"><div class="text-xs font-bold text-[var(--color-gray-900)] mb-1">Import Summary</div><div class="text-xs tm-muted" id="tm-import-sum">No file selected yet.</div></div></div>'; },cta:"Start Import"},
                    export:{t:"Export Consultations",ic:"ti-download",body:function(){ var opts=[["CSV","ti-file-text"],["Excel","ti-file-spreadsheet"],["PDF","ti-file-typography"],["Print","ti-printer"]]; return '<div class="space-y-4"><div><div class="tm-lbl">Format</div><div class="grid grid-cols-2 gap-2">'+opts.map(function(o,i){ return '<button class="tm-btn tm-btn-soft justify-start tm-expfmt'+(i===0?" !border-[var(--color-primary)]":"")+'" data-fmt="'+o[0]+'"><i class="ti '+o[1]+'"></i> '+o[0]+'</button>'; }).join("")+'</div></div><div><div class="tm-lbl">Scope</div><select class="tm-inp"><option>Consultation Report</option><option>Department Report</option><option>Selected Records</option><option>All Records</option></select></div></div>'; },cta:"Export Now"},
                    print:{t:"Print Report",ic:"ti-printer",body:function(){ return '<div class="space-y-3">'+fld("Report",'<select class="tm-inp"><option>Today\'s consultations</option><option>By doctor</option><option>By department</option></select>')+fld("Include",'<select class="tm-inp"><option>All fields</option><option>Summary only</option></select>')+'</div>'; },cta:"Print"},
                    delete:{t:"Delete Confirmation",ic:"ti-trash",danger:1,body:function(c){ return '<div class="text-center py-2"><div class="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-3" style="background:'+mix("#ef4444")+';color:#ef4444"><i class="ti ti-alert-triangle text-2xl"></i></div><p class="font-bold text-[var(--color-gray-900)]">Delete '+(c?esc(c.id):"selected consultations")+'?</p><p class="text-sm tm-muted mt-1">This consultation record will be permanently removed.</p></div>'; },cta:"Delete",danger:1}
                };
                function openModal(key,c){
                    var m=MODALS[key]; if(!m) return; var danger=m.danger;
                    $("#tm-dialog").innerHTML='<div class="p-5"><div class="flex items-center justify-between mb-4"><h3 class="font-bold text-lg text-[var(--color-gray-900)] flex items-center gap-2"><i class="ti '+m.ic+'" style="color:'+(danger?"#ef4444":"var(--color-primary)")+'"></i> '+esc(m.t)+'</h3><button class="tm-btn tm-btn-soft !p-2" data-close><i class="ti ti-x"></i></button></div>'+m.body(c)+'<div class="flex justify-end gap-2 mt-5"><button class="tm-btn tm-btn-soft" data-close>Cancel</button><button class="tm-btn '+(danger?"tm-btn-soft !bg-rose-500 !text-white":"tm-btn-primary")+'" id="tm-modal-ok"><i class="ti '+(danger?"ti-trash":"ti-check")+'"></i> '+esc(m.cta)+'</button></div></div>';
                    $("#tm-modal").classList.add("open");
                    syncBodyLock();
                    // Modal HTML is injected after the page's initial-load flatpickr auto-init has
                    // already run, so any date/time fields inside it must be initialized here instead.
                    if(typeof flatpickr!=="undefined"){
                        $$('[data-provider="flatpickr"]',$("#tm-dialog")).forEach(function(el){
                            if(el._flatpickr) return;
                            var config={disableMobile:true};
                            if(el.hasAttribute("data-date-format")) config.dateFormat=el.getAttribute("data-date-format");
                            flatpickr(el,config);
                        });
                        $$('[data-provider="timepickr"]',$("#tm-dialog")).forEach(function(el){
                            if(el._flatpickr) return;
                            var config={enableTime:true,noCalendar:true,dateFormat:"H:i"};
                            if(el.hasAttribute("data-default-time")) config.defaultDate=el.getAttribute("data-default-time");
                            flatpickr(el,config);
                        });
                    }
                    $("#tm-modal-ok").addEventListener("click", function(){ $("#tm-modal").classList.remove("open"); syncBodyLock(); if(key==="delete" && c){ var i=CONS.indexOf(c); if(i>=0) CONS.splice(i,1); render(); renderKPIs(); renderWidgets(); renderBoards(); animateRings(); } toast(m.t+" completed", danger?"ti-trash":"ti-check"); });
                    var dz=$("#tm-dropzone");
                    if(dz){ dz.addEventListener("click", function(){ $("#tm-file").click(); }); var fi=$("#tm-file"); if(fi) fi.addEventListener("change", function(){ if(this.files[0]){ var el=$("#tm-import-sum")||$("#tm-upload-sum"); if(el) el.innerHTML='<b class="text-[var(--color-gray-900)]">'+esc(this.files[0].name)+'</b> ready'+($("#tm-import-sum")?' · 20 rows · 0 errors':''); } });
                        ["dragover","dragenter"].forEach(function(ev){ dz.addEventListener(ev,function(e){ e.preventDefault(); dz.classList.add("drag"); }); });
                        ["dragleave","drop"].forEach(function(ev){ dz.addEventListener(ev,function(e){ e.preventDefault(); dz.classList.remove("drag"); }); });
                    }
                    $$(".tm-expfmt").forEach(function(b){ b.addEventListener("click", function(){ $$(".tm-expfmt").forEach(function(x){ x.classList.remove("!border-[var(--color-primary)]"); }); this.classList.add("!border-[var(--color-primary)]"); }); });
                }

                /* ================= SELECTION / BULK ================= */
                function selCount(){ return Object.keys(state.sel).filter(function(k){return state.sel[k];}).length; }
                function syncBulk(){ var n=selCount(); $("#tm-bulk-n").textContent=n; $("#tm-bulk").classList.toggle("show", n>0); }
                function syncSelAll(){ var sa=$("#tm-selall"); if(!sa) return; var vis=filtered(); sa.checked=vis.length>0 && vis.every(function(c){return state.sel[c.id];}); }

                /* ================= EVENTS ================= */
                $("#tm-search").addEventListener("input", function(){ state.q=this.value; render(); });
                $("#tm-filter-toggle").addEventListener("click", function(){ $("#tm-filters").classList.toggle("hidden"); });
                $("#tm-cols-toggle").addEventListener("click", function(){ $("#tm-cols").classList.toggle("hidden"); });
                $("#tm-view").addEventListener("click", function(e){ var b=e.target.closest("[data-v]"); if(!b) return; state.view=b.getAttribute("data-v"); $$(".tm-segb",this).forEach(function(x){ x.classList.toggle("active",x===b); }); render(); });
                $$('[data-f]').forEach(function(sel){ sel.addEventListener("change", function(){ state.filters[this.getAttribute("data-f")]=this.value; updateFilterCount(); render(); }); });
                $("#tm-clear").addEventListener("click", function(){ Object.keys(state.filters).forEach(function(k){ if(k!=="sort") state.filters[k]=""; }); $$('[data-f]').forEach(function(s){ if(s.getAttribute("data-f")!=="sort") s.value=""; }); updateFilterCount(); render(); toast("Filters cleared","ti-filter-off"); });
                function updateFilterCount(){ var n=Object.keys(state.filters).filter(function(k){ return k!=="sort" && state.filters[k]; }).length; var el=$("#tm-filter-n"); el.textContent=n; el.classList.toggle("hidden", n===0); }

                document.addEventListener("click", function(e){
                    if(e.target.closest("[data-startvc]")){ openVC(); return; }
                    var jn=e.target.closest("[data-join]"); if(jn){ openVC(CONS.filter(function(x){return x.id===jn.getAttribute("data-join");})[0]); return; }
                    var mo=e.target.closest("[data-modal]"); if(mo){ openModal(mo.getAttribute("data-modal")); return; }
                    var op=e.target.closest("[data-open]"); if(op){ openDrawer(op.getAttribute("data-open")); return; }
                    var mb=e.target.closest("[data-menu]"); if(mb){ var rc=mb.getBoundingClientRect(); openMenu(mb.getAttribute("data-menu"), rc.right-212, rc.bottom+4); e.stopPropagation(); return; }
                    var ai=e.target.closest("[data-act]"); if(ai){ doAction(ai.getAttribute("data-act")); return; }
                    var tt=e.target.closest("[data-toast]"); if(tt){ toast(tt.getAttribute("data-toast"),"ti-info-circle"); return; }
                    if(e.target.closest("[data-refresh]")){ $("#tm-h-updated").textContent="just now"; render(); renderKPIs(); renderWidgets(); renderBoards(); animateRings(); toast("Consultations refreshed","ti-refresh"); return; }
                    var rcb=e.target.closest(".tm-rowcb"); if(rcb){ state.sel[rcb.getAttribute("data-id")]=rcb.checked; syncBulk(); syncSelAll(); return; }
                    var cl=e.target.closest("[data-close]"); if(cl){ var m=cl.closest(".tm-drawer,.tm-modal"); if(m) m.classList.remove("open"); syncBodyLock(); return; }
                    if(!e.target.closest("#tm-menu")) closeMenu();
                });
                document.addEventListener("keydown", function(e){ if(e.key==="Escape"){ closeMenu(); $$(".tm-drawer.open,.tm-modal.open").forEach(function(m){ m.classList.remove("open"); }); syncBodyLock(); if($("#tm-vc").classList.contains("open")) closeVC(); } });
                window.addEventListener("scroll", closeMenu, true);
                document.addEventListener("change", function(e){
                    if(e.target.id==="tm-selall"){ var vis=filtered(); vis.forEach(function(c){ state.sel[c.id]=e.target.checked; }); render(); syncBulk(); }
                    if(e.target.classList.contains("tm-colcb")){ state.cols[e.target.getAttribute("data-col")]=e.target.checked; render(); }
                });

                $("#tm-bulk-x").addEventListener("click", function(){ state.sel={}; render(); syncBulk(); });
                $$('[data-bulk]').forEach(function(b){ b.addEventListener("click", function(){
                    var act=this.getAttribute("data-bulk"), n=selCount();
                    var ids=Object.keys(state.sel).filter(function(k){return state.sel[k];});
                    if(act==="delete"){ ids.forEach(function(id){ var i=CONS.map(function(c){return c.id;}).indexOf(id); if(i>=0) CONS.splice(i,1); }); state.sel={}; render(); renderKPIs(); renderWidgets(); renderBoards(); animateRings(); syncBulk(); toast(n+" consultation"+(n>1?"s":"")+" deleted","ti-trash"); return; }
                    if(act==="status"){ ids.forEach(function(id){ var c=CONS.filter(function(x){return x.id===id;})[0]; if(c && c.status!=="Live") c.status="Completed"; }); render(); toast(n+" marked completed","ti-circle-check"); return; }
                    var names={assign:"Doctor assigned to",reschedule:"Rescheduled",notify:"Notifications sent to",export:"Exported"};
                    toast((names[act]||"Updated")+" "+n+" consultation"+(n>1?"s":""),"ti-check");
                }); });

                /* ================= RINGS ================= */
                function animateRings(){ $$(".tm-ring .bar").forEach(function(b){ var p=b.style.getPropertyValue("--p"); b.style.setProperty("--p","0"); requestAnimationFrame(function(){ b.style.setProperty("--p",p); }); }); }

                /* ================= REVEAL =================
                   KPIs, widgets (trend, availability, status donut, success
                   rate, duration bars, satisfaction), the consultation grid
                   (default view, unfiltered), the waiting-room list, and the
                   activity feed are already static markup in the HTML,
                   matching what these builders would have produced on load.
                   renderKPIs(), renderWidgets(), renderBoards(), render() and
                   filtered() all stay available below for search/filter/sort/
                   view changes and for the mutation handlers (join/start/end
                   consultation, delete, bulk actions). */
                setTimeout(function(){
                    $("#tm-skeleton").classList.add("hidden");
                    $("#tm-content").classList.remove("hidden");
                    requestAnimationFrame(animateRings);
                }, 1500);
            })();
