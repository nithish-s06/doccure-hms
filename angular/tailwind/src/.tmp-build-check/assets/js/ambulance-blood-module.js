// ==========================================================================
// ambulance-trip-detail.js
// ==========================================================================
document.addEventListener('DOMContentLoaded', function () {
  if (document.body.dataset.page !== 'ambulance-trip-detail') return;

  var $ = function (id) { return document.getElementById(id); };
  var params = new URLSearchParams(window.location.search);
  var pick = function (key, fallback) { var v = params.get(key); return v && v.length ? v : fallback; };

  var r = {
    id: pick('id', '1'),
    vehicle: pick('vehicle', 'AMB-101'),
    driver: pick('driver', 'Mark Reynolds'),
    pickup: pick('pickup', '42 Elm Street'),
    drop: pick('drop', 'City General Hospital'),
    patient: pick('patient', 'Susan Blake'),
    distance: pick('distance', '8.5'),
    date: pick('date', '2024-12-06'),
    status: pick('status', 'Completed'),
  };

  var BADGE = {
    Active: 'text-primary bg-primary/10',
    Completed: 'text-success bg-success/10',
  };

  var tripId = '#TRP-' + String(r.id).padStart(5, '0');
  var distanceLabel = r.distance + ' km';

  $('atd-patient').textContent = r.patient;
  $('atd-status-badge').textContent = r.status;
  $('atd-trip-id').textContent = tripId;
  $('atd-hero-vehicle').textContent = r.vehicle;
  $('atd-hero-driver').textContent = r.driver;
  $('atd-hero-date').textContent = r.date;

  $('atd-stat-vehicle').textContent = r.vehicle;
  $('atd-stat-driver').textContent = r.driver;
  $('atd-stat-distance').textContent = distanceLabel;
  $('atd-stat-status').textContent = r.status;
  $('atd-stat-status').className = 'mt-3 inline-flex w-fit items-center px-3 py-1.5 rounded-lg text-sm font-extrabold ' + (BADGE[r.status] || 'text-gray-700 bg-gray-100');

  $('atd-route-pickup').textContent = r.pickup;
  $('atd-route-drop').textContent = r.drop;
  $('atd-route-distance').textContent = distanceLabel;

  $('atd-side-driver').textContent = r.driver;

  $('atd-kv-patient').textContent = r.patient;
  $('atd-kv-driver').textContent = r.driver;
  $('atd-kv-vehicle').textContent = r.vehicle;
  $('atd-kv-date').textContent = r.date;

  document.title = 'Ambulance Trip — ' + tripId + ' — Dreams HMS';

  // ---- Trip workflow timeline ----
  var STAGES = ['Dispatched', 'Active', 'Completed'];
  var STAGE_ICON = ['icon-siren', 'icon-navigation', 'icon-check-circle'];
  var reachedIndex = { Dispatched: 0, Active: 1, Completed: 2 }[r.status];
  reachedIndex = reachedIndex == null ? 0 : reachedIndex;

  $('atd-timeline').innerHTML = STAGES.map(function (label, i) {
    var state = i < reachedIndex ? 'done' : i === reachedIndex ? 'current' : '';
    var when = i <= reachedIndex ? r.date : 'Pending';
    return '<div class="atd-tl-item ' + state + '"><span class="atd-tl-node"><i class="' + STAGE_ICON[i] + '"></i></span>' +
      '<p class="text-sm font-bold text-gray-900 dark:text-white">' + label + '</p>' +
      '<p class="text-xs text-gray-500 dark:text-gray-400">' + when + '</p></div>';
  }).join('');
});

// ==========================================================================
// ambulance.js
// ==========================================================================
(function () {
if ((location.pathname.split("/").pop() || "index.html") !== "ambulance.html") return;
const SBADGE = {
    Available: "text-success bg-success/10",
    Dispatched: "text-danger bg-danger/10",
    "En Route": "text-warning bg-warning/10",
    Completed: "text-primary bg-primary/10",
    Maintenance: "text-gray-900 bg-light/60",
};
const PBADGE = {
    Emergency: "text-danger bg-danger/10",
    Urgent: "text-warning bg-warning/10",
    Routine: "text-primary bg-primary/10",
};
const now = () => {
    const d = new Date();
    return d.toISOString().slice(0, 16);
};
let data = [
    {
        id: 1,
        vehicle: "AMB-001",
        patient: "Carlos Vega",
        driver: "John Smith",
        para: "Tom Bradley",
        pickup: "45 Oak Street",
        time: "2024-12-10T08:10",
        priority: "Emergency",
        status: "Completed",
        dist: 8.2,
        notes: "Cardiac arrest",
    },
    {
        id: 2,
        vehicle: "AMB-002",
        patient: "Aisha Kofi",
        driver: "Mike Chen",
        para: "Fatima Ali",
        pickup: "12 Pine Ave, School",
        time: "2024-12-10T11:00",
        priority: "Emergency",
        status: "Completed",
        dist: 3.1,
        notes: "Febrile seizure",
    },
    {
        id: 3,
        vehicle: "AMB-003",
        patient: "Diana Park",
        driver: "Sam Lee",
        para: "Kevin Wright",
        pickup: "88 River Rd",
        time: "2024-12-10T09:00",
        priority: "Urgent",
        status: "Completed",
        dist: 5.8,
        notes: "",
    },
    {
        id: 4,
        vehicle: "AMB-001",
        patient: "",
        driver: "John Smith",
        para: "",
        pickup: "",
        time: "",
        priority: "Routine",
        status: "Available",
        dist: 0,
        notes: "",
    },
    {
        id: 5,
        vehicle: "AMB-002",
        patient: "Mark Davis",
        driver: "Mike Chen",
        para: "Tom Bradley",
        pickup: "City Park, East Entrance",
        time: "2024-12-10T10:45",
        priority: "Urgent",
        status: "En Route",
        dist: 0,
        notes: "Possible hip fracture",
    },
    {
        id: 6,
        vehicle: "AMB-004",
        patient: "",
        driver: "—",
        para: "",
        pickup: "",
        time: "",
        priority: "Routine",
        status: "Maintenance",
        dist: 0,
        notes: "Scheduled service",
    },
    {
        id: 7,
        vehicle: "AMB-003",
        patient: "",
        driver: "Sam Lee",
        para: "",
        pickup: "",
        time: "",
        priority: "Routine",
        status: "Available",
        dist: 0,
        notes: "",
    },
    {
        id: 8,
        vehicle: "AMB-005",
        patient: "Sarah Kim",
        driver: "Lisa Park",
        para: "Kevin Wright",
        pickup: "200 Airport Blvd",
        time: "2024-12-10T12:30",
        priority: "Urgent",
        status: "Dispatched",
        dist: 0,
        notes: "Transfer from clinic",
    },
];
let nextId = 9,
    editingId = null;
function detailUrl(r) {
    return (
        "ambulance-vehicle-detail.html?" +
        new URLSearchParams({
            vehicle: r.vehicle,
            driver: r.driver,
            status: r.status,
        }).toString()
    );
}
function rowHTML(r) {
    return `<tr data-row-id="${r.id}"><td class="text-primary text-sm"><a href="${detailUrl(r)}">${r.vehicle}</a></td><td class="font-medium text-gray-900">${r.patient || '<span class="text-gray-400">—</span>'}</td><td class="text-gray-500 dark:text-gray-400">${r.driver}</td><td class="text-gray-500 dark:text-gray-400 text-sm">${r.pickup || "—"}</td><td class="text-gray-500 dark:text-gray-400 text-sm">${r.time ? r.time.replace("T", " ") : "—"}</td><td><span class="inline-block px-2 py-1 text-xs font-semibold rounded-lg whitespace-nowrap ${PBADGE[r.priority] || "text-gray-900 bg-light/60"}">${r.priority}</span></td><td class="text-gray-500 dark:text-gray-400 text-sm">${r.para || "—"}</td><td><span class="inline-block px-2 py-1 text-xs font-semibold rounded-lg whitespace-nowrap ${SBADGE[r.status] || "text-gray-900 bg-light/60"}">${r.status}</span></td><td><div class="flex gap-1"><button onclick="openEdit(${r.id})" class="p-1.5 size-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400" title="Edit"><i class="icon-edit text-base"></i></button><button onclick="deleteRecord(${r.id},'${r.vehicle}')" class="p-1.5 size-7 flex items-center justify-center rounded hover:bg-danger/20 dark:hover:bg-red-900/20 text-danger" title="Delete"><i class="icon-trash-2 text-base"></i></button></div></td></tr>`;
}
function updateStats() {
    document.getElementById("stat-total").textContent = data.length;
    document.getElementById("stat-dispatch").textContent = data.filter((r) =>
        ["Dispatched", "En Route"].includes(r.status),
    ).length;
    document.getElementById("stat-avail").textContent = data.filter(
        (r) => r.status === "Available",
    ).length;
    document.getElementById("stat-maint").textContent = data.filter(
        (r) => r.status === "Maintenance",
    ).length;
}
function render(q = "", status = "") {
    const visibleIds = new Set(
        data
            .filter((r) => {
                const m = q
                    ? r.vehicle.toLowerCase().includes(q.toLowerCase()) ||
                      r.patient.toLowerCase().includes(q.toLowerCase()) ||
                      r.driver.toLowerCase().includes(q.toLowerCase())
                    : true;
                return m && (status ? r.status === status : true);
            })
            .map((r) => r.id),
    );
    const tbody = document.getElementById("tbody");
    let visibleCount = 0;
    tbody.querySelectorAll("[data-row-id]").forEach((tr) => {
        const match = visibleIds.has(Number(tr.dataset.rowId));
        tr.classList.toggle("hidden", !match);
        if (match) visibleCount++;
    });
    document.getElementById("count").textContent =
        `${visibleCount} of ${data.length}`;
    const emptyRow = document.getElementById("empty-row");
    if (emptyRow) emptyRow.classList.toggle("hidden", visibleCount !== 0);
    updateStats();
}
function openAdd() {
    editingId = null;
    document.getElementById("m-title").textContent = "Log Ambulance Trip";
    document.getElementById("btn-save").textContent = "Save Trip";
    document.getElementById("m-form").reset();
    document.getElementById("f-time").value = now();
    MC.openModal("form-modal");
}
function openEdit(id) {
    const r = data.find((x) => x.id === id);
    editingId = id;
    document.getElementById("m-title").textContent = "Edit Trip";
    document.getElementById("btn-save").textContent = "Update";
    document.getElementById("f-vehicle").value = r.vehicle;
    document.getElementById("f-patient").value = r.patient;
    document.getElementById("f-driver").value = r.driver;
    document.getElementById("f-para").value = r.para;
    document.getElementById("f-pickup").value = r.pickup;
    document.getElementById("f-time").value = r.time;
    document.getElementById("f-priority").value = r.priority;
    document.getElementById("f-status").value = r.status;
    document.getElementById("f-dist").value = r.dist;
    document.getElementById("f-notes").value = r.notes;
    MC.openModal("form-modal");
}
function saveRecord() {
    const vehicle = document.getElementById("f-vehicle").value.trim();
    if (!vehicle) {
        MC.toast("Vehicle number required", "error");
        return;
    }
    const rec = {
        vehicle,
        patient: document.getElementById("f-patient").value.trim(),
        driver: document.getElementById("f-driver").value.trim(),
        para: document.getElementById("f-para").value.trim(),
        pickup: document.getElementById("f-pickup").value.trim(),
        time: document.getElementById("f-time").value,
        priority: document.getElementById("f-priority").value,
        status: document.getElementById("f-status").value,
        dist: parseFloat(document.getElementById("f-dist").value) || 0,
        notes: document.getElementById("f-notes").value.trim(),
    };
    const tbody = document.getElementById("tbody");
    if (editingId) {
        const idx = data.findIndex((x) => x.id === editingId);
        data[idx] = { ...data[idx], ...rec };
        const existingEl = tbody.querySelector(
            `[data-row-id="${editingId}"]`,
        );
        if (existingEl) existingEl.outerHTML = rowHTML(data[idx]);
        MC.toast("Trip updated", "success");
    } else {
        const newRecord = { id: nextId++, ...rec };
        data.push(newRecord);
        tbody.insertAdjacentHTML("beforeend", rowHTML(newRecord));
        MC.toast("Trip logged", "success");
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
        const el = document
            .getElementById("tbody")
            .querySelector(`[data-row-id="${id}"]`);
        if (el) el.remove();
        render(
            document.getElementById("search").value,
            document.getElementById("filter-status").value,
        );
        MC.toast("Trip deleted", "success");
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
    updateStats();
});
})();

// ==========================================================================
// blood-bank.js
// ==========================================================================
(function(){
    "use strict";
    if ((location.pathname.split("/").pop() || "index.html") !== "blood-bank.html") return;
    const $=(s,r)=>(r||document).querySelector(s);
    const $$=(s,r)=>Array.from((r||document).querySelectorAll(s));
    const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
    let toastT;
    function toast(msg,icon){ const t=$('#bb-toast'); t.innerHTML=`<i class="${icon||'icon-check'} text-rose-400"></i> ${msg}`; t.classList.add('show'); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove('show'),2500); }

    /* ============ DATA ============ */
    const GROUPS=['O+','O-','A+','A-','B+','B-','AB+','AB-'];
    const GCOL={'O+':'#dc2626','O-':'#b91c1c','A+':'#e06c1f','A-':'#c2560e','B+':'#7c3aed','B-':'#6d28d9','AB+':'#1d4ed8','AB-':'#1e40af'};
    const CAP=100;
    const SKL={ok:'In Stock',low:'Low Stock',crit:'Critical',out:'Out of Stock'};
    const SKC={ok:'#15803d',low:'#b7791f',crit:'#dc2626',out:'#64748b'};
    function statusOf(u){ return u===0?'out':u<=12?'crit':u<=28?'low':'ok'; }

    let INV=GROUPS.map((g,i)=>{
        const avail=[52,9,44,18,36,14,22,7][i];
        return { id:i, g, avail, reserved:rnd(2,10), expiring:rnd(0,8), lastDon:['2h ago','Today','Yesterday','2 days ago'][i%4], universal:g==='O-'||g==='AB+' };
    });
    const stat=x=>statusOf(x.avail);
    const sel=new Set();
    let view='grid', q='', fStatus='', focusId=0;

    function filtered(){
        return INV.filter(x=>{
            if(q&&!x.g.toLowerCase().includes(q.toLowerCase())) return false;
            if(fStatus&&stat(x)!==fStatus) return false;
            return true;
        });
    }

    /* ============ HERO COUNTS ============ */
    function updateCounts(){
        $('#bb-h-total').textContent=INV.reduce((a,x)=>a+x.avail,0);
        const crit=INV.filter(x=>stat(x)==='crit'||stat(x)==='out').length;
        $('#bb-h-crit').textContent=crit; $('#bb-h-crit2').textContent=crit;
        $('#bb-h-exp').textContent=INV.reduce((a,x)=>a+x.expiring,0);
    }

    /* ============ BLOOD DROP SVG ============ */
    function drop(g,color){ return `<div class="bb-drop"><svg viewBox="0 0 24 30"><path d="M12 1 C12 1 3 12 3 19 a9 9 0 0 0 18 0 C21 12 12 1 12 1 Z" fill="${color}"/></svg><span class="lbl">${g}</span></div>`; }

    /* ============ INVENTORY BOARD ============ */
    function bgCard(x){
        const st=stat(x), pct=Math.round(x.avail/CAP*100);
        return `<div class="bb-bg sk-${st}" data-bg="${x.id}">
            <div class="p-4">
                <div class="flex items-start justify-between">
                    <label onclick="event.stopPropagation()" class="flex items-center"><input type="checkbox" data-sel="${x.id}" ${sel.has(x.id)?'checked':''} class="accent-rose-600"></label>
                    <button data-menu="${x.id}" onclick="event.stopPropagation()" class="w-7 h-7 rounded-md hover:bg-[var(--bb-hover)] flex items-center justify-center bb-mut"><i class="icon-more-vertical text-sm"></i></button>
                </div>
                <div class="flex items-center gap-3 -mt-2">
                    ${drop(x.g,GCOL[x.g])}
                    <div><p class="text-2xl font-bold bb-head leading-none">${x.avail}<span class="text-sm bb-mut font-medium"> units</span></p><span class="bb-chip mt-1" style="background:color-mix(in srgb,${SKC[st]} 13%,transparent);color:${SKC[st]}"><span class="bb-dot" style="background:${SKC[st]}"></span> ${SKL[st]}</span></div>
                </div>
                ${x.universal?'<span class="bb-npill mt-2 inline-flex"><i class="icon-star text-[10px]" style="color:#f59e0b"></i> Universal</span>':''}
                <div class="bb-stab mt-3"><span style="width:${pct}%;background:${SKC[st]}"></span></div>
                <div class="grid grid-cols-3 gap-2 mt-3 text-center">
                    <div class="bb-panel py-1.5"><p class="text-sm font-bold bb-head">${x.reserved}</p><p class="text-[9px] bb-mut">Reserved</p></div>
                    <div class="bb-panel py-1.5"><p class="text-sm font-bold" style="color:${x.expiring>0?'#e06c1f':'#15803d'}">${x.expiring}</p><p class="text-[9px] bb-mut">Expiring</p></div>
                    <div class="bb-panel py-1.5"><p class="text-sm font-bold bb-head">${x.avail-x.reserved}</p><p class="text-[9px] bb-mut">Available</p></div>
                </div>
                <p class="text-[10px] bb-mut mt-2"><i class="icon-clock text-[10px]"></i> Last donation ${x.lastDon}</p>
                <div class="flex gap-2 mt-3">
                    <button data-modal="issue" onclick="event.stopPropagation()" class="bb-btn bb-btn-primary flex-1 justify-center !py-1.5 text-xs"><i class="icon-hand-heart"></i> Issue</button>
                    <button data-modal="reserve" onclick="event.stopPropagation()" class="bb-btn bb-btn-ghost !py-1.5 !px-2.5 text-xs"><i class="icon-bookmark"></i></button>
                    <button data-modal="add" onclick="event.stopPropagation()" class="bb-btn bb-btn-ghost !py-1.5 !px-2.5 text-xs"><i class="icon-plus"></i></button>
                </div>
            </div>
        </div>`;
    }
    function compactCard(x){
        const st=stat(x);
        return `<div class="bb-bg sk-${st} p-3" data-bg="${x.id}">
            <div class="flex items-center gap-2.5">
                ${drop(x.g,GCOL[x.g])}
                <div class="min-w-0 flex-1"><p class="text-lg font-bold bb-head leading-none">${x.avail}<span class="text-xs bb-mut font-medium"> units</span></p><span class="bb-chip mt-1 inline-flex" style="background:color-mix(in srgb,${SKC[st]} 13%,transparent);color:${SKC[st]}">${SKL[st]}</span></div>
                <button data-menu="${x.id}" onclick="event.stopPropagation()" class="w-6 h-6 rounded-md hover:bg-[var(--bb-hover)] flex items-center justify-center bb-mut"><i class="icon-more-vertical text-sm"></i></button>
            </div>
            <div class="flex justify-between text-[10px] bb-mut mt-2"><span>Reserved ${x.reserved}</span><span style="color:${x.expiring>0?'#e06c1f':''}">Expiring ${x.expiring}</span></div>
        </div>`;
    }
    function listRow(x){
        const st=stat(x), pct=Math.round(x.avail/CAP*100);
        return `<div class="bb-row sk-${st}" data-bg="${x.id}" style="cursor:pointer">
            <label onclick="event.stopPropagation()"><input type="checkbox" data-sel="${x.id}" ${sel.has(x.id)?'checked':''} class="accent-rose-600"></label>
            <div class="flex items-center gap-2"><span class="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style="background:${GCOL[x.g]}">${x.g}</span></div>
            <div><p class="text-sm font-semibold bb-head">${x.avail} units</p><div class="bb-stab mt-1 w-28"><span style="width:${pct}%;background:${SKC[st]}"></span></div></div>
            <div class="text-xs bb-mut">Reserved ${x.reserved}<p>Expiring ${x.expiring}</p></div>
            <div><span class="bb-chip" style="background:color-mix(in srgb,${SKC[st]} 13%,transparent);color:${SKC[st]}">${SKL[st]}</span></div>
            <button data-menu="${x.id}" onclick="event.stopPropagation()" class="w-7 h-7 rounded-md hover:bg-[var(--bb-hover)] flex items-center justify-center bb-mut justify-self-end"><i class="icon-more-vertical"></i></button>
        </div>`;
    }
    function renderInventory(){
        const list=filtered(); const host=$('#bb-inventory');
        if(view==='list'){ host.innerHTML=`<div class="bb-card overflow-hidden"><div class="bb-row !py-2 text-[10px] uppercase tracking-wide bb-mut font-bold"><span></span><span>Group</span><span>Stock</span><span>Details</span><span>Status</span><span></span></div>${list.map(listRow).join('')||'<p class="text-sm bb-mut text-center py-6">No groups found.</p>'}</div>`; }
        else if(view==='compact'){ host.innerHTML=`<div class="grid grid-cols-2 md:grid-cols-4 gap-3">${list.map(compactCard).join('')}</div>`; }
        else { host.innerHTML=`<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">${list.map(bgCard).join('')||'<p class="text-sm bb-mut text-center py-6 col-span-4">No groups found.</p>'}</div>`; }
    }

    // Blood Components panel (#bb-components) is static demo content — six fixed
    // component cards with no mutation path — rendered once and never touched
    // again, so its markup now lives directly in blood-bank.html and the old
    // renderComponents() one-time-build function was removed.

    /* ============ ALERTS ============ */
    function renderAlerts(){
        const near=INV.reduce((a,x)=>a+x.expiring,0);
        const low=INV.filter(x=>stat(x)==='low');
        const out=INV.filter(x=>stat(x)==='out');
        const alerts=[
            ['Near Expiry',near+' units','icon-clock','#e06c1f','Within 5 days'],
            ['Expired Units','6 units','icon-x-circle','#dc2626','Pending disposal'],
            ['Low Stock',low.map(x=>x.g).join(', ')||'None','icon-trending-down','#b7791f',low.length+' groups'],
            ['Out of Stock',out.map(x=>x.g).join(', ')||'None','icon-package-x','#64748b',out.length+' groups'],
        ];
        $('#bb-alerts').innerHTML=alerts.map(a=>`<div class="bb-panel p-2.5 flex items-center gap-2.5" style="border-left:3px solid ${a[3]}">
            <span class="bb-iconbadge w-8 h-8 flex-none" style="color:${a[3]}"><i class="${a[2]}"></i></span>
            <div class="min-w-0 flex-1"><p class="text-sm font-semibold bb-head">${a[0]}</p><p class="text-[11px] bb-mut truncate">${a[4]}</p></div>
            <span class="text-sm font-bold whitespace-nowrap" style="color:${a[3]}">${a[1]}</span>
        </div>`).join('');
    }

    /* ============ EMERGENCY REQUESTS ============ */
    const AVC=['#475569','#0f766e','#1e40af','#4338ca','#0e7490','#334155'];
    let REQ=[
        {id:1,pt:'Rahul Sharma',g:'O-',units:4,prio:'Critical',status:'Awaiting',bank:'Central Bank',av:'#dc2626'},
        {id:2,pt:'Anita Reddy',g:'B+',units:2,prio:'High',status:'Cross-matching',bank:'Central Bank',av:'#0f766e'},
        {id:3,pt:'Vikram Nair',g:'AB-',units:3,prio:'Critical',status:'Awaiting',bank:'Partner Bank',av:'#1e40af'},
        {id:4,pt:'Priya Patel',g:'A+',units:1,prio:'Medium',status:'Fulfilled',bank:'Central Bank',av:'#4338ca'},
        {id:5,pt:'Meera Singh',g:'B-',units:2,prio:'High',status:'Cross-matching',bank:'Partner Bank',av:'#0e7490'},
        {id:6,pt:'Arjun Menon',g:'AB+',units:5,prio:'Critical',status:'Awaiting',bank:'Central Bank',av:'#334155'},
    ];
    const prioC={Critical:'#dc2626',High:'#e06c1f',Medium:'#b7791f'};
    const rstC={Awaiting:'#e06c1f','Cross-matching':'#1d4ed8',Fulfilled:'#15803d'};
    function renderRequests(){
        $('#bb-requests').innerHTML=REQ.map(r=>`<div class="bb-panel p-3" style="border-left:3px solid ${prioC[r.prio]}">
            <div class="flex items-center gap-2.5 mb-2">
                <span class="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold" style="background:${GCOL[r.g]}">${r.g}</span>
                <div class="min-w-0 flex-1"><p class="text-sm font-semibold bb-head truncate">${r.pt}</p><p class="text-[11px] bb-mut">${r.units} units · ${r.bank}</p></div>
                <span class="bb-chip" style="background:color-mix(in srgb,${prioC[r.prio]} 13%,transparent);color:${prioC[r.prio]}">${r.prio==='Critical'?'<span class="bb-dot bb-live" style="background:'+prioC[r.prio]+'"></span> ':''}${r.prio}</span>
            </div>
            <div class="flex items-center justify-between">
                <span class="bb-chip" style="background:color-mix(in srgb,${rstC[r.status]} 13%,transparent);color:${rstC[r.status]}">${r.status}</span>
                ${r.status!=='Fulfilled'?`<button data-fulfil="${r.id}" class="bb-npill hover:bg-[var(--bb-hover)]"><i class="icon-check text-[11px]" style="color:#15803d"></i> Fulfil</button>`:'<span class="text-[11px]" style="color:#15803d"><i class="icon-circle-check text-[11px]"></i> Done</span>'}
            </div>
        </div>`).join('');
    }

    // Donation & Usage Summary (#bb-summary, #bb-topgroups) is static demo
    // content — fixed KPI figures and a fixed "top requested groups" bar list
    // with no mutation path — rendered once and never touched again, so its
    // markup now lives directly in blood-bank.html and the old renderSummary()
    // one-time-build function was removed.

    // Inventory Activity feed (#bb-activity) is static demo content — six fixed
    // activity entries with no mutation path (each item's "Xm ago" was
    // decorative Math.random(), not a real event) — rendered once and never
    // touched again, so its markup now lives directly in blood-bank.html and
    // the old renderActivity() one-time-build function was removed.

    /* ============ DRAWER ============ */
    function openDrawer(id){
        const x=INV.find(v=>v.id===id); if(!x) return; const st=stat(x), pct=Math.round(x.avail/CAP*100);
        const box=(t,ic,body)=>`<div class="bb-panel p-3"><p class="text-[11px] font-bold bb-mut uppercase tracking-wide mb-2 flex items-center gap-1.5"><i class="${ic} bb-hicon text-[13px]"></i> ${t}</p>${body}</div>`;
        const row=(k,v)=>`<div class="flex justify-between text-xs py-0.5"><span class="bb-mut">${k}</span><span class="font-medium bb-head">${v}</span></div>`;
        $('#bb-drawer').innerHTML=`
          <div class="p-4 border-b sticky top-0 z-10 flex items-center justify-between" style="background:var(--bb-elev);border-color:var(--bb-border)">
            <div class="flex items-center gap-3">${drop(x.g,GCOL[x.g])}<div><p class="font-bold bb-head text-lg">Blood Group ${x.g}</p><p class="text-[11px] bb-mut">${x.avail} units · ${SKL[st]}</p></div></div>
            <button data-close class="w-8 h-8 rounded-lg hover:bg-[var(--bb-hover)] flex items-center justify-center bb-mut"><i class="icon-x"></i></button>
          </div>
          <div class="p-4 space-y-3">
            <div class="bb-panel p-3"><div class="flex items-center justify-between mb-1"><span class="text-sm font-semibold bb-head">Stock Level</span><span class="text-sm font-bold" style="color:${SKC[st]}">${pct}%</span></div><div class="bb-stab"><span style="width:${pct}%;background:${SKC[st]}"></span></div><p class="text-[11px] bb-mut mt-1">${x.avail} of ${CAP} units capacity</p></div>
            <div class="grid grid-cols-3 gap-2 text-center">
                <div class="bb-panel py-2"><p class="text-lg font-bold bb-head">${x.avail-x.reserved}</p><p class="text-[10px] bb-mut">Available</p></div>
                <div class="bb-panel py-2"><p class="text-lg font-bold" style="color:#1d4ed8">${x.reserved}</p><p class="text-[10px] bb-mut">Reserved</p></div>
                <div class="bb-panel py-2"><p class="text-lg font-bold" style="color:#e06c1f">${x.expiring}</p><p class="text-[10px] bb-mut">Expiring</p></div>
            </div>
            ${box('Inventory Detail','icon-clipboard-list',row('Status',SKL[st])+row('Last Donation',x.lastDon)+row('Shelf Life','35–42 days')+row('Storage','2–6°C'))}
            ${box('Components','icon-flask-conical',row('Packed RBC',rnd(10,40)+' units')+row('Plasma',rnd(8,30)+' units')+row('Platelets',rnd(4,18)+' units'))}
            ${box('Compatibility','icon-git-merge',(x.g==='O-'?'<p class="text-xs bb-mut">Universal donor — compatible with all groups.</p>':x.g==='AB+'?'<p class="text-xs bb-mut">Universal recipient.</p>':'<p class="text-xs bb-mut">Compatible recipients: '+x.g+', AB'+(x.g[0]==='O'?'':'')+'.</p>'))}
            <div class="grid grid-cols-2 gap-2">
                <button data-modal="issue" class="bb-btn bb-btn-primary justify-center"><i class="icon-hand-heart"></i> Issue</button>
                <button data-modal="reserve" class="bb-btn bb-btn-ghost justify-center"><i class="icon-bookmark"></i> Reserve</button>
                <button data-modal="add" class="bb-btn bb-btn-ghost justify-center"><i class="icon-plus"></i> Add Units</button>
                <button data-modal="transfer" class="bb-btn bb-btn-ghost justify-center"><i class="icon-arrow-left-right"></i> Transfer</button>
            </div>
          </div>`;
        $('#bb-drawer').classList.add('open');
        document.body.style.overflow = 'hidden';
    }
    function closeDrawer(){ $('#bb-drawer').classList.remove('open'); document.body.style.overflow = ''; }

    /* ============ MENU ============ */
    const ACTIONS=[['View Inventory','icon-eye','view'],['Edit','icon-edit','edit'],['Reserve','icon-bookmark','reserve'],['Issue','icon-hand-heart','issue'],['Transfer','icon-arrow-left-right','transfer'],['sep'],['Print','icon-printer','print'],['Export','icon-download','export'],['Archive','icon-archive','archive'],['Delete','icon-trash-2','delete']];
    function openMenu(id,x,y){ closeMenu(); $('#bb-menuhost').innerHTML=`<div class="bb-menu" id="bb-openmenu">${ACTIONS.map(a=>a[0]==='sep'?'<div class="bb-menu-sep"></div>':`<button data-action="${a[2]}" data-gid="${id}" class="${a[2]==='delete'?'danger':''}"><i class="${a[1]}"></i> ${a[0]}</button>`).join('')}</div>`; const m=$('#bb-openmenu'); const r=m.getBoundingClientRect(); m.style.left=Math.max(12,Math.min(x,window.innerWidth-r.width-12))+'px'; m.style.top=Math.max(12,Math.min(y,window.innerHeight-r.height-12))+'px'; }
    function closeMenu(){ $('#bb-menuhost').innerHTML=''; }

    /* ============ MODALS ============ */
    const fld=(l,el)=>`<div><label class="bb-formlabel">${l}</label>${el}</div>`;
    const inp=(ph)=>`<input class="bb-in mt-1" placeholder="${ph||''}">`;
    const selE=(o)=>`<select class="bb-in mt-1">${o.map(x=>`<option>${x}</option>`).join('')}</select>`;
    const dropz=(t)=>`<div class="bb-dropz rounded-xl h-28 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[var(--bb-hover)]"><i class="icon-cloud-upload text-3xl bb-mut"></i><p class="text-sm font-semibold mt-1 bb-head">${t}</p></div>`;
    const MODALS={
        add:{t:'Add Blood Units',sub:'Register a new donation / stock',ic:'icon-plus',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('Blood Group',selE(GROUPS))}${fld('Component',selE(['Whole Blood','Packed RBC','Platelets','Plasma','Cryoprecipitate']))}${fld('Units',inp('e.g. 12'))}${fld('Source',selE(['Donor','Donor Drive','Transfer In','Purchase']))}${fld('Donor / Batch ID',inp('DNR-...'))}${fld('Expiry Date',`<input type="text" placeholder="dd/mm/yyyy" class="bb-in mt-1" data-provider="flatpickr" data-date-format="d-m-Y">`)}</div>`,cta:'Add Units'},
        edit:{t:'Edit Inventory',sub:'Adjust stock levels',ic:'icon-edit',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('Blood Group',selE(GROUPS))}${fld('Available Units',inp('52'))}${fld('Reserved',inp('6'))}${fld('Expiring',inp('3'))}</div>`,cta:'Save Changes'},
        issue:{t:'Issue Blood',sub:'Dispense units to a patient/ward',ic:'icon-hand-heart',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('Blood Group',selE(GROUPS))}${fld('Units',inp('2'))}${fld('Patient / MRN',inp('Search...'))}${fld('Ward / Requester',selE(['ICU','OT-01','Ward 4','Emergency']))}${fld('Cross-match',selE(['Verified','Pending']))}${fld('Issued By',inp('Lab Tech'))}</div>`,cta:'Issue Blood'},
        reserve:{t:'Reserve Blood',sub:'Hold units for a case',ic:'icon-bookmark',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('Blood Group',selE(GROUPS))}${fld('Units',inp('2'))}${fld('Patient / Case',inp('Search...'))}${fld('Reserve Until',`<input type="text" placeholder="dd/mm/yyyy" class="bb-in mt-1" data-provider="flatpickr" data-date-format="d-m-Y">`)}</div>`,cta:'Reserve'},
        emergency:{t:'Emergency Blood Request',sub:'Raise an urgent request',ic:'icon-siren',body:`<div class="rounded-lg p-2.5 text-xs mb-3 flex items-center gap-2" style="background:color-mix(in srgb,#dc2626 11%,transparent);color:#dc2626;border:1px solid color-mix(in srgb,#dc2626 30%,transparent)"><i class="icon-siren"></i> Notifies the blood bank &amp; nearest partners immediately.</div><div class="grid sm:grid-cols-2 gap-3">${fld('Patient / MRN',inp('Search...'))}${fld('Blood Group',selE(GROUPS))}${fld('Units Required',inp('4'))}${fld('Priority',selE(['Critical','High','Medium']))}${fld('Ward',selE(['ICU','OT','Emergency']))}${fld('Blood Bank',selE(['Central Bank','Partner Bank','Regional Bank']))}</div>`,cta:'Send Request'},
        transfer:{t:'Transfer Stock',sub:'Move units between banks',ic:'icon-arrow-left-right',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('Blood Group',selE(GROUPS))}${fld('Units',inp('5'))}${fld('From',selE(['Central Bank','Partner Bank']))}${fld('To',selE(['Partner Bank','Regional Bank','Central Bank']))}${fld('Transport',selE(['Cold-chain van','Courier']))}${fld('ETA',selE(['30 min','1 hour','2 hours']))}</div>`,cta:'Transfer Stock'},
        import:{t:'Import',sub:'Bulk-load inventory records',ic:'icon-upload',body:`<div class="flex gap-2 mb-3">${['CSV','Excel','Blood Bank Sheet'].map(f=>`<span class="bb-npill">${f}</span>`).join('')}</div>${dropz('Drop CSV / Excel file')}<button class="text-xs font-semibold text-rose-600 hover:underline mt-2"><i class="icon-download"></i> Download sample template</button><div class="mt-3 rounded-lg p-3 text-xs flex items-center gap-2" style="background:color-mix(in srgb,#15803d 11%,transparent);color:#15803d;border:1px solid color-mix(in srgb,#15803d 28%,transparent)"><i class="icon-circle-check"></i> Validation passed · 8 groups · 0 errors</div>`,cta:'Import'},
        export:{t:'Export',sub:'Export inventory data',ic:'icon-download',body:`<p class="text-xs bb-mut mb-2">Choose a format</p><div class="grid grid-cols-2 gap-2">${['CSV','Excel','PDF','Print','Stock Report','Expiry Report','Donation Report','Full Inventory'].map(f=>`<button data-expfmt="${f}" class="bb-btn bb-btn-ghost justify-center">${f}</button>`).join('')}</div>`,cta:'Export'},
    };
    const SIMPLE={print:'Printing report...',archive:'Archived'};
    function openModal(key){ const m=MODALS[key]; if(!m) return; $('#bb-modalhost').innerHTML=`<div class="bb-modal-wrap open"><div class="bb-modal-bg" data-close></div><div class="bb-modal">
        <div class="bb-modal-head"><span class="bb-modal-badge"><i class="${m.ic}"></i></span><div class="min-w-0"><h3 class="font-bold bb-head leading-tight">${m.t}</h3><p class="text-[11px] bb-mut">${m.sub||''}</p></div><button data-close class="ml-auto w-8 h-8 rounded-lg hover:bg-[var(--bb-hover)] flex items-center justify-center bb-mut"><i class="icon-x"></i></button></div>
        <div class="bb-modal-body">${m.body}</div>
        <div class="bb-modal-foot"><button data-close class="bb-btn bb-btn-ghost">Cancel</button><button data-modalok="${key}" class="bb-btn bb-btn-primary"><i class="${m.ic}"></i> ${m.cta}</button></div>
    </div></div>`; document.body.style.overflow = 'hidden';
        // Modal HTML is injected after the page's initial-load flatpickr auto-init has
        // already run, so any date fields inside it must be initialized here instead.
        if(typeof flatpickr!=='undefined'){
            $$('[data-provider="flatpickr"]',$('#bb-modalhost')).forEach(el=>{
                if(el._flatpickr) return;
                const config={disableMobile:true};
                if(el.hasAttribute('data-date-format')) config.dateFormat=el.getAttribute('data-date-format');
                flatpickr(el,config);
            });
        }
    }
    function openDelete(msg,onOk){ $('#bb-modalhost').innerHTML=`<div class="bb-modal-wrap open"><div class="bb-modal-bg" data-close></div><div class="bb-modal" style="width:min(420px,94vw)"><div class="p-5 text-center"><div class="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style="background:color-mix(in srgb,#dc2626 13%,transparent);color:#dc2626"><i class="icon-alert-triangle text-2xl"></i></div><h3 class="font-bold text-lg bb-head">Confirm</h3><p class="text-xs bb-mut mt-1">${msg}</p><div class="flex gap-2 mt-4"><button data-close class="bb-btn bb-btn-ghost flex-1 justify-center">Cancel</button><button id="bb-delok" class="bb-btn bb-btn-danger flex-1 justify-center">Delete</button></div></div></div></div>`; document.body.style.overflow = 'hidden'; $('#bb-delok').onclick=()=>{ onOk(); closeModal(); }; }
    function closeModal(){ $('#bb-modalhost').innerHTML=''; if(!$('#bb-drawer').classList.contains('open')) document.body.style.overflow = ''; }

    /* ============ HELPERS ============ */
    function updateBulk(){ $('#bb-selcount').textContent=sel.size; $('.bb-bulk').classList.toggle('show',sel.size>0); }
    function refreshAll(){ renderInventory(); renderAlerts(); renderRequests(); updateCounts(); }

    /* ============ EVENTS ============ */
    document.addEventListener('click',e=>{
        if(e.target.closest('[data-vw]')){ const b=e.target.closest('[data-vw]'); view=b.dataset.vw; $$('#bb-viewtabs button').forEach(x=>x.classList.toggle('on',x===b)); renderInventory(); return; }
        if(e.target.closest('[data-fulfil]')){ const id=+e.target.closest('[data-fulfil]').dataset.fulfil; const r=REQ.find(x=>x.id===id); if(r) r.status='Fulfilled'; renderRequests(); toast('Request fulfilled','icon-circle-check'); return; }
        const t=e.target.closest('[data-bg],[data-menu],[data-action],[data-modal],[data-modalok],[data-close],[data-bulk],[data-expfmt]');
        if(!t){ if(!e.target.closest('.bb-menu')) closeMenu(); return; }
        if(t.dataset.bg!==undefined){ focusId=+t.dataset.bg; openDrawer(focusId); return; }
        if(t.dataset.menu!==undefined){ const r=t.getBoundingClientRect(); openMenu(+t.dataset.menu,r.left-180,r.bottom+4); return; }
        if(t.dataset.action!==undefined){ const a=t.dataset.action, id=+t.dataset.gid; closeMenu(); focusId=id;
            if(a==='view') openDrawer(id);
            else if(MODALS[a]) openModal(a);
            else if(a==='delete') openDelete('Remove this blood group inventory record?',()=>{ INV=INV.filter(x=>x.id!==id); sel.delete(id); refreshAll(); toast('Record removed','icon-trash-2'); });
            else if(SIMPLE[a]) toast(SIMPLE[a]);
            return; }
        if(t.dataset.modal!==undefined){ openModal(t.dataset.modal); return; }
        if(t.dataset.modalok!==undefined){ const k=t.dataset.modalok; const x=INV.find(v=>v.id===focusId);
            if(k==='add'&&x){ x.avail+=rnd(6,14); }
            else if(k==='issue'&&x){ x.avail=Math.max(0,x.avail-rnd(1,3)); }
            else if(k==='emergency'){ REQ.unshift({id:Date.now(),pt:'New Patient',g:GROUPS[rnd(0,7)],units:rnd(1,4),prio:'Critical',status:'Awaiting',bank:'Central Bank',av:'#dc2626'}); }
            refreshAll(); toast(MODALS[k].cta+' — done','icon-check'); closeModal(); return; }
        if(t.dataset.expfmt!==undefined){ toast('Exported: '+t.dataset.expfmt,'icon-download'); closeModal(); return; }
        if(t.dataset.close!==undefined){ closeModal(); closeDrawer(); return; }
        if(t.dataset.bulk!==undefined){ const bk=t.dataset.bulk;
            if(bk==='delete') openDelete(`Remove ${sel.size} selected record(s)?`,()=>{ INV=INV.filter(x=>!sel.has(x.id)); sel.clear(); refreshAll(); updateBulk(); toast('Records removed','icon-trash-2'); });
            else { toast({reserve:'Reserved',transfer:'Transfer initiated',export:'Exported',print:'Printing',archive:'Archived'}[bk]+' · '+sel.size+' groups'); if(bk==='archive'){ sel.clear(); refreshAll(); updateBulk(); } }
            return; }
    });
    document.addEventListener('change',e=>{
        if(e.target.dataset.sel!==undefined){ const id=+e.target.dataset.sel; e.target.checked?sel.add(id):sel.delete(id); updateBulk(); return; }
        if(e.target.id==='bb-fstatus'){ fStatus=e.target.value; renderInventory(); }
    });
    document.addEventListener('input',e=>{ if(e.target.id==='bb-search'){ q=e.target.value; renderInventory(); } });

    function clock(){ $('#bb-clock').textContent=new Date().toLocaleTimeString('en-GB'); }

    /* ============ INIT ============ */
    setTimeout(()=>{
        $('#bb-skeleton').classList.add('hidden');
        $('#bb-content').classList.remove('hidden');
        renderInventory(); renderAlerts(); renderRequests(); updateCounts();
        clock(); setInterval(clock,1000);
    },1400);
})();

// ==========================================================================
// blood-donors.js
// ==========================================================================
(function(){
    "use strict";
    if ((location.pathname.split("/").pop() || "index.html") !== "blood-donors.html") return;
    const $=(s,r)=>(r||document).querySelector(s);
    const $$=(s,r)=>Array.from((r||document).querySelectorAll(s));
    const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
    function detailUrl(d){ return "blood-donor-profile.html?" + new URLSearchParams({ id:d.id, name:d.name, g:d.g, age:d.age, gender:d.gender, phone:d.phone, city:d.city, el:d.el, donations:d.donations, last:d.last, next:d.next, badge:d.badge }).toString(); }
    let toastT;
    function toast(msg,icon){ const t=$('#bd-toast'); t.innerHTML=`<i class="${icon||'icon-check'} text-rose-400"></i> ${msg}`; t.classList.add('show'); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove('show'),2500); }

    /* ============ DATA ============ */
    const GROUPS=['O+','O-','A+','A-','B+','B-','AB+','AB-'];
    const GCOL={'O+':'#dc2626','O-':'#b91c1c','A+':'#e06c1f','A-':'#c2560e','B+':'#7c3aed','B-':'#6d28d9','AB+':'#1d4ed8','AB-':'#1e40af'};
    const ELL={elig:'Eligible',soon:'Eligible Soon',defer:'Deferred',new:'New Donor'};
    const ELC={elig:'#15803d',soon:'#b7791f',defer:'#dc2626',new:'#1d4ed8'};
    const FIRST=['Rahul','Anita','Vikram','Priya','Suresh','Meera','Arjun','Kavya','Deepak','Neha','Rohan','Sana','Manoj','Divya','Karan','Pooja'];
    const LAST=['Sharma','Reddy','Nair','Patel','Gupta','Singh','Menon','Das','Joshi','Verma'];
    const AVC=['#475569','#0f766e','#1e40af','#4338ca','#0e7490','#334155','#3f6212','#7c2d12'];
    const CITIES=['Whitefield','Indiranagar','Koramangala','Jayanagar','HSR Layout','Marathahalli'];
    const initials=n=>n.split(' ').map(x=>x[0]).join('').slice(0,2);
    const MPHOTO=['assets/img/avatar/avatar-01.jpg','assets/img/avatar/avatar-02.jpg','assets/img/avatar/avatar-06.jpg','assets/img/avatar/avatar-07.jpg','assets/img/avatar/avatar-11.jpg','assets/img/avatar/avatar-12.jpg','assets/img/avatar/avatar-13.jpg','assets/img/avatar/avatar-15.jpg'];
    const FPHOTO=['assets/img/avatar/avatar-03.jpg','assets/img/avatar/avatar-04.jpg','assets/img/avatar/avatar-05.jpg','assets/img/avatar/avatar-08.jpg','assets/img/avatar/avatar-09.jpg','assets/img/avatar/avatar-10.jpg','assets/img/avatar/avatar-14.jpg','assets/img/avatar/avatar-16.jpg'];

    let DON=Array.from({length:16},(_,i)=>{
        const el=['elig','elig','soon','defer','new','elig','soon','elig'][i%8];
        const don=el==='new'?0:rnd(1,42);
        const gender=i%2?'Male':'Female';
        return { id:i, name:FIRST[i%FIRST.length]+' '+LAST[(i*3)%LAST.length], g:GROUPS[i%GROUPS.length],
            age:rnd(19,58), gender, phone:'+91 98'+rnd(10000000,99999999),
            city:CITIES[i%CITIES.length], el, donations:don, last:el==='new'?'—':['3 weeks ago','2 months ago','5 months ago','Yesterday'][i%4],
            next:el==='elig'?'Now':el==='soon'?rnd(1,8)+' weeks':el==='defer'?'Deferred':'After screening',
            av:AVC[i%AVC.length], photo:(gender==='Male'?MPHOTO:FPHOTO)[Math.floor(i/2)%8], badge:don>=25?'Gold':don>=10?'Silver':don>=3?'Bronze':'New' };
    });
    const sel=new Set();
    let view='grid', q='', fGroup='', fElig='', sort='', focusId=0;

    function filtered(){
        let r=DON.filter(d=>{
            if(q){ const t=q.toLowerCase(); if(!(d.name.toLowerCase().includes(t)||d.g.toLowerCase().includes(t)||d.phone.includes(t))) return false; }
            if(fGroup&&d.g!==fGroup) return false;
            if(fElig&&d.el!==fElig) return false;
            return true;
        });
        if(sort==='name') r.sort((a,b)=>a.name.localeCompare(b.name));
        else if(sort==='donations') r.sort((a,b)=>b.donations-a.donations);
        return r;
    }

    /* ============ HERO COUNTS ============ */
    function updateCounts(){
        const el=DON.filter(d=>d.el==='elig').length;
        $('#bd-h-elig').textContent=el; $('#bd-h-elig2').textContent=el;
        $('#bd-h-total').textContent=DON.length;
    }

    /* ============ DIRECTORY ============ */
    const badgeC={Gold:'#f59e0b',Silver:'#94a3b8',Bronze:'#b45309',New:'#1d4ed8'};
    function donorCard(d){
        const live=d.el==='elig';
        return `<div class="bd-donor el-${d.el}" data-donor="${d.id}">
            <div class="bd-donor-banner">
                <label onclick="event.stopPropagation()" class="absolute top-2.5 left-2.5 z-10"><input type="checkbox" data-sel="${d.id}" ${sel.has(d.id)?'checked':''} class="accent-rose-600"></label>
                <button data-menu="${d.id}" onclick="event.stopPropagation()" class="bd-donor-menubtn absolute top-2 right-2 w-7 h-7 rounded-lg flex items-center justify-center"><i class="icon-more-vertical text-sm"></i></button>
            </div>
            <div class="px-4 pb-4 -mt-8">
                <div class="flex items-end justify-between">
                    <div class="bd-avatar-ring"><img class="bd-avatar" style="width:54px;height:54px" src="${d.photo}" alt="${d.name}"><span class="bd-statusdot${live?' bd-live':''} absolute -bottom-0.5 -right-0.5" style="background:${ELC[d.el]}"></span></div>
                    <span class="bd-gtag mb-1" style="width:38px;height:38px;background:${GCOL[d.g]};font-size:.82rem">${d.g}</span>
                </div>
                <p class="bd-donor-name mt-2.5"><a href="${detailUrl(d)}" onclick="event.stopPropagation()" class="hover:underline">${d.name}</a></p>
                <p class="text-[11px] bd-mut mt-1">${d.age}y · ${d.gender} · ${d.city}</p>
                <div class="flex items-center gap-1.5 mt-2 flex-wrap"><span class="bd-chip" style="background:color-mix(in srgb,${ELC[d.el]} 13%,transparent);color:${ELC[d.el]}"><span class="bd-dot" style="background:${ELC[d.el]}"></span> ${ELL[d.el]}</span><span class="bd-npill"><i class="icon-medal text-[10px]" style="color:${badgeC[d.badge]}"></i> ${d.badge}</span></div>
                <div class="bd-stat-row mt-3">
                    <div class="bd-stat"><span class="bd-stat-ic" style="background:color-mix(in srgb,#dc2626 14%,transparent);color:#dc2626"><i class="icon-droplet"></i></span><p class="bd-stat-val bd-head">${d.donations}</p><p class="bd-stat-lbl">Donations</p></div>
                    <div class="bd-stat"><span class="bd-stat-ic" style="background:color-mix(in srgb,${ELC[d.el]} 14%,transparent);color:${ELC[d.el]}"><i class="icon-calendar-check"></i></span><p class="bd-stat-val" style="color:${ELC[d.el]}">${d.next}</p><p class="bd-stat-lbl">Next Eligible</p></div>
                </div>
                <p class="text-[10px] bd-mut mt-2.5"><i class="icon-clock text-[10px]"></i> Last donation ${d.last}</p>
                <div class="flex gap-2 mt-3">
                    <button data-modal="appointment" onclick="event.stopPropagation()" class="bd-btn bd-btn-primary flex-1 justify-center !py-2 text-xs"><i class="icon-calendar-plus"></i> Schedule</button>
                    <button data-modal="record" onclick="event.stopPropagation()" title="Record Donation" class="bd-btn bd-btn-ghost !py-2 !px-2.5 text-xs"><i class="icon-droplet"></i></button>
                    <a href="${detailUrl(d)}" onclick="event.stopPropagation()" title="View Profile" class="bd-btn bd-btn-ghost !py-2 !px-2.5 text-xs"><i class="icon-eye"></i></a>
                </div>
            </div>
        </div>`;
    }
    function compactCard(d){
        return `<div class="bd-donor el-${d.el} p-3" data-donor="${d.id}">
            <div class="flex items-center gap-2.5">
                <div class="relative flex-none"><img class="bd-avatar round" style="width:42px;height:42px" src="${d.photo}" alt="${d.name}"><span class="bd-statusdot absolute -bottom-0.5 -right-0.5" style="background:${ELC[d.el]}"></span></div>
                <div class="min-w-0 flex-1"><p class="text-sm font-bold bd-head truncate">${d.name}</p><p class="text-[11px] bd-mut">${d.donations} donations · ${d.city}</p></div>
                <span class="bd-gtag" style="width:32px;height:32px;background:${GCOL[d.g]};font-size:.72rem">${d.g}</span>
            </div>
            <div class="flex items-center justify-between mt-2"><span class="bd-chip" style="background:color-mix(in srgb,${ELC[d.el]} 13%,transparent);color:${ELC[d.el]}">${ELL[d.el]}</span><span class="text-[11px] bd-mut">Next: ${d.next}</span></div>
        </div>`;
    }
    function listRow(d){
        return `<div class="bd-row el-${d.el}" data-donor="${d.id}" style="cursor:pointer">
            <label onclick="event.stopPropagation()"><input type="checkbox" data-sel="${d.id}" ${sel.has(d.id)?'checked':''} class="accent-rose-600"></label>
            <div class="flex items-center gap-2.5 min-w-0"><img class="bd-avatar round flex-none" style="width:36px;height:36px" src="${d.photo}" alt="${d.name}"><div class="min-w-0"><p class="text-sm font-semibold bd-head truncate">${d.name}</p><p class="text-[11px] bd-mut truncate">${d.phone}</p></div></div>
            <div><span class="bd-gtag" style="width:34px;height:28px;background:${GCOL[d.g]};font-size:.7rem">${d.g}</span></div>
            <div class="text-xs bd-head">${d.donations} donations<p class="bd-mut">${d.last}</p></div>
            <div><span class="bd-chip" style="background:color-mix(in srgb,${ELC[d.el]} 13%,transparent);color:${ELC[d.el]}">${ELL[d.el]}</span></div>
            <button data-menu="${d.id}" onclick="event.stopPropagation()" class="w-7 h-7 rounded-md hover:bg-[var(--bd-hover)] flex items-center justify-center bd-mut justify-self-end"><i class="icon-more-vertical"></i></button>
        </div>`;
    }
    function renderDirectory(){
        const list=filtered(); $('#bd-count').textContent=list.length; const host=$('#bd-directory');
        if(view==='list'){ host.innerHTML=`<div class="bd-card overflow-hidden"><div class="bd-row !py-2 text-[10px] uppercase tracking-wide bd-mut font-bold"><span></span><span>Donor</span><span>Group</span><span>History</span><span>Eligibility</span><span></span></div>${list.map(listRow).join('')||'<p class="text-sm bd-mut text-center py-6">No donors found.</p>'}</div>`; }
        else if(view==='compact'){ host.innerHTML=`<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">${list.map(compactCard).join('')}</div>`; }
        else { host.innerHTML=`<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">${list.map(donorCard).join('')||'<p class="text-sm bd-mut text-center py-6 col-span-4">No donors found.</p>'}</div>`; }
    }

    /* ============ DISTRIBUTION ============ */
    function renderDistribution(){
        const counts=GROUPS.map(g=>[g,DON.filter(d=>d.g===g).length]);
        const mx=Math.max(...counts.map(c=>c[1]))||1;
        $('#bd-distribution').innerHTML=counts.map(c=>`<div class="bd-panel p-3">
            <div class="flex items-center justify-between mb-2"><span class="bd-gtag" style="width:34px;height:30px;background:${GCOL[c[0]]};font-size:.72rem">${c[0]}</span><span class="text-lg font-bold bd-head">${c[1]}</span></div>
            <div class="bd-stab"><span style="width:${Math.round(c[1]/mx*100)}%;background:${GCOL[c[0]]}"></span></div>
            <p class="text-[10px] bd-mut mt-1.5">donors registered</p>
        </div>`).join('');
    }

    /* ============ ELIGIBILITY ============ */
    function renderEligibility(){
        $('#bd-eligibility').innerHTML=Object.keys(ELL).filter(k=>k!=='new').map(k=>{
            const list=DON.filter(d=>d.el===k);
            return `<div class="bd-panel p-2.5 flex items-center gap-2.5" style="border-left:3px solid ${ELC[k]}">
                <span class="bd-iconbadge w-8 h-8 flex-none" style="color:${ELC[k]}"><i class="icon-${k==='elig'?'circle-check':k==='soon'?'clock':k==='defer'?'circle-x':'user-plus'}"></i></span>
                <span class="text-sm font-medium bd-head flex-1">${ELL[k]}</span>
                <div class="flex -space-x-2">${list.slice(0,4).map(d=>`<img class="bd-avatar round" style="width:24px;height:24px;border:2px solid var(--bd-surface)" src="${d.photo}" alt="${d.name}">`).join('')}</div>
                <span class="bd-chip" style="background:color-mix(in srgb,${ELC[k]} 13%,transparent);color:${ELC[k]}">${list.length}</span>
            </div>`;
        }).join('');
    }

    // Donation Drives & Appointments (#bd-camps) is static demo content — six
    // fixed camp cards with no mutation path (the "Register Donor" button just
    // opens the generic appointment modal, not tied back to a specific camp) —
    // rendered once and never touched again, so its markup now lives directly
    // in blood-donors.html and the old renderCamps() one-time-build function
    // was removed.

    /* ============ TOP DONORS ============ */
    function renderTop(){
        const top=[...DON].sort((a,b)=>b.donations-a.donations).slice(0,5);
        const medals=['#f59e0b','#94a3b8','#b45309','#64748b','#64748b'];
        $('#bd-top').innerHTML=top.map((d,i)=>`<div class="bd-panel p-3 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white text-xs flex-none" style="background:${medals[i]}">${i+1}</span>
            <span class="bd-avatar round flex-none" style="width:34px;height:34px;background:${d.av};font-size:11px">${initials(d.name)}</span>
            <div class="min-w-0 flex-1"><p class="text-sm font-semibold bd-head truncate">${d.name}</p><p class="text-[11px] bd-mut">${d.g} · ${d.badge} donor</p></div>
            <div class="text-right"><p class="text-sm font-bold bd-hicon">${d.donations}</p><p class="text-[10px] bd-mut">donations</p></div>
        </div>`).join('');
    }

    // Donor Activity feed (#bd-activity) is static demo content — four fixed
    // activity entries with no mutation path (each item's "Xm ago" was
    // decorative Math.random(), not a real event) — rendered once and never
    // touched again, so its markup now lives directly in blood-donors.html and
    // the old renderActivity() one-time-build function was removed.

    /* ============ DRAWER ============ */
    function stars(n){ const f=Math.min(5,Math.round(n/8)); return Array.from({length:5},(_,i)=>`<i class="icon-star text-[11px]" style="color:${i<f?'#f59e0b':'var(--bd-soft)'}"></i>`).join(''); }
    function openDrawer(id){
        const d=DON.find(x=>x.id===id); if(!d) return;
        const box=(t,ic,body)=>`<div class="bd-panel p-3"><p class="text-[11px] font-bold bd-mut uppercase tracking-wide mb-2 flex items-center gap-1.5"><i class="${ic} bd-hicon text-[13px]"></i> ${t}</p>${body}</div>`;
        const row=(k,v)=>`<div class="flex justify-between text-xs py-0.5"><span class="bd-mut">${k}</span><span class="font-medium bd-head">${v}</span></div>`;
        const hist=['3 weeks ago · A+ · 450ml','4 months ago · A+ · 450ml','8 months ago · A+ · 350ml'];
        $('#bd-drawer').innerHTML=`
          <div class="bd-donor-banner el-${d.el}" style="height:80px;border-radius:0"></div>
          <div class="px-4 -mt-8">
            <div class="flex items-end justify-between">
                <div class="relative"><img class="bd-avatar" style="width:64px;height:64px" src="${d.photo}" alt="${d.name}"><span class="bd-statusdot absolute bottom-0 right-0" style="width:16px;height:16px;background:${ELC[d.el]}"></span></div>
                <button data-close class="w-8 h-8 rounded-lg bg-[var(--bd-surface)] border flex items-center justify-center bd-mut mb-1" style="border-color:var(--bd-border)"><i class="icon-x"></i></button>
            </div>
            <div class="flex items-center gap-2 mt-2"><p class="font-bold text-lg bd-head">${d.name}</p><span class="bd-gtag" style="width:34px;height:28px;background:${GCOL[d.g]};font-size:.7rem">${d.g}</span></div>
            <p class="text-[11px] bd-mut">${d.age}y · ${d.gender} · ${d.city}</p>
            <div class="flex items-center gap-2 mt-1.5">${stars(d.donations)}<span class="bd-chip ml-auto" style="background:color-mix(in srgb,${ELC[d.el]} 13%,transparent);color:${ELC[d.el]}">${ELL[d.el]}</span></div>
          </div>
          <div class="p-4 space-y-3">
            <div class="grid grid-cols-3 gap-2 text-center">
                <div class="bd-panel py-2"><p class="text-lg font-bold bd-head">${d.donations}</p><p class="text-[10px] bd-mut">Donations</p></div>
                <div class="bd-panel py-2"><p class="text-lg font-bold" style="color:${ELC[d.el]}">${d.next}</p><p class="text-[10px] bd-mut">Next Eligible</p></div>
                <div class="bd-panel py-2"><p class="text-lg font-bold" style="color:${badgeC[d.badge]}">${d.badge}</p><p class="text-[10px] bd-mut">Badge</p></div>
            </div>
            ${box('Contact','icon-phone',row('Phone',d.phone)+row('City',d.city)+row('Email',d.name.split(' ')[0].toLowerCase()+'@mail.com'))}
            ${box('Medical / Eligibility','icon-shield-check',row('Status',ELL[d.el])+row('Last Donation',d.last)+row('Hemoglobin','13.8 g/dL')+row('Weight',rnd(56,84)+' kg'))}
            ${box('Donation History','icon-droplet',hist.map(h=>`<div class="flex items-center gap-2 text-xs py-0.5"><span class="bd-dot" style="background:${GCOL[d.g]}"></span> ${h}</div>`).join(''))}
            <div class="grid grid-cols-2 gap-2">
                <button data-modal="appointment" class="bd-btn bd-btn-primary justify-center"><i class="icon-calendar-plus"></i> Schedule</button>
                <button data-modal="record" class="bd-btn bd-btn-ghost justify-center"><i class="icon-droplet"></i> Record</button>
                <button data-modal="edit" class="bd-btn bd-btn-ghost justify-center"><i class="icon-edit"></i> Edit</button>
                <button data-simple="contact" class="bd-btn bd-btn-ghost justify-center"><i class="icon-phone"></i> Call</button>
            </div>
          </div>`;
        $('#bd-drawer').classList.add('open');
        document.body.style.overflow = 'hidden';
    }
    function closeDrawer(){ $('#bd-drawer').classList.remove('open'); document.body.style.overflow = ''; }

    /* ============ MENU ============ */
    const ACTIONS=[['View Profile','icon-eye','view'],['Edit','icon-edit','edit'],['Schedule Donation','icon-calendar-plus','appointment'],['Record Donation','icon-droplet','record'],['Send Reminder','icon-bell','remind'],['Contact','icon-phone','contact'],['Eligibility Check','icon-shield-check','eligcheck'],['sep'],['Print Card','icon-printer','print'],['Download PDF','icon-file-down','pdf'],['Archive','icon-archive','archive'],['Delete','icon-trash-2','delete']];
    function openMenu(id,x,y){ closeMenu(); $('#bd-menuhost').innerHTML=`<div class="bd-menu" id="bd-openmenu">${ACTIONS.map(a=>a[0]==='sep'?'<div class="bd-menu-sep"></div>':`<button data-action="${a[2]}" data-did="${id}" class="${a[2]==='delete'?'danger':''}"><i class="${a[1]}"></i> ${a[0]}</button>`).join('')}</div>`; const m=$('#bd-openmenu'); const r=m.getBoundingClientRect(); m.style.left=Math.max(12,Math.min(x,window.innerWidth-r.width-12))+'px'; m.style.top=Math.max(12,Math.min(y,window.innerHeight-r.height-12))+'px'; }
    function closeMenu(){ $('#bd-menuhost').innerHTML=''; }

    /* ============ MODALS ============ */
    const fld=(l,el)=>`<div><label class="bd-formlabel">${l}</label>${el}</div>`;
    const inp=(ph)=>`<input class="bd-in mt-1" placeholder="${ph||''}">`;
    const selE=(o)=>`<select class="bd-in mt-1">${o.map(x=>`<option>${x}</option>`).join('')}</select>`;
    const dropz=(t)=>`<div class="bd-dropz rounded-xl h-28 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[var(--bd-hover)]"><i class="icon-cloud-upload text-3xl bd-mut"></i><p class="text-sm font-semibold mt-1 bd-head">${t}</p></div>`;
    const MODALS={
        add:{t:'Add Donor',sub:'Register a new blood donor',ic:'icon-user-plus',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('Full Name',inp('Donor name'))}${fld('Blood Group',selE(GROUPS))}${fld('Age',inp('e.g. 28'))}${fld('Gender',selE(['Male','Female','Other']))}${fld('Phone',inp('+91 ...'))}${fld('City / Area',selE(CITIES))}${fld('Weight (kg)',inp('65'))}${fld('Last Donation',`<input type="text" placeholder="dd/mm/yyyy" class="bd-in mt-1" data-provider="flatpickr" data-date-format="d-m-Y">`)}</div>`,cta:'Register Donor'},
        edit:{t:'Edit Donor',sub:'Update donor details',ic:'icon-edit',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('Blood Group',selE(GROUPS))}${fld('Phone',inp('+91 ...'))}${fld('City',selE(CITIES))}${fld('Eligibility',selE(Object.values(ELL)))}</div>`,cta:'Save Changes'},
        appointment:{t:'Schedule Donation',sub:'Book a donation appointment',ic:'icon-calendar-plus',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('Donor',inp('Search...'))}${fld('Blood Group',selE(GROUPS))}${fld('Date',`<input type="text" placeholder="dd/mm/yyyy" class="bd-in mt-1" data-provider="flatpickr" data-date-format="d-m-Y">`)}${fld('Time Slot',selE(['09:00','10:30','12:00','14:00','15:30']))}${fld('Location',selE(['Central Blood Bank','Corporate Drive','Community Camp']))}${fld('Reminder',selE(['SMS','Email','Both']))}</div>`,cta:'Schedule'},
        record:{t:'Record Donation',sub:'Log a completed donation',ic:'icon-droplet',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('Donor',inp('Search...'))}${fld('Blood Group',selE(GROUPS))}${fld('Volume (ml)',selE(['450','350','250'])) }${fld('Component',selE(['Whole Blood','Plasma','Platelets']))}${fld('Hemoglobin',inp('13.8'))}${fld('Collected By',inp('Phlebotomist'))}</div>`,cta:'Record Donation'},
        camp:{t:'New Donation Camp',sub:'Organise a blood drive',ic:'icon-tent',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('Camp Name',inp('e.g. Corporate Drive'))}${fld('Organizer',inp('Company / NGO'))}${fld('Location',inp('Venue'))}${fld('Date',`<input type="text" placeholder="dd/mm/yyyy" class="bd-in mt-1" data-provider="flatpickr" data-date-format="d-m-Y">`)}${fld('Target Units',inp('120'))}${fld('Contact',inp('+91 ...'))}</div>`,cta:'Create Camp'},
        import:{t:'Import',sub:'Bulk-load donor records',ic:'icon-upload',body:`<div class="flex gap-2 mb-3">${['CSV','Excel','Donor List'].map(f=>`<span class="bd-npill">${f}</span>`).join('')}</div>${dropz('Drop CSV / Excel file')}<button class="text-xs font-semibold text-rose-600 hover:underline mt-2"><i class="icon-download"></i> Download sample template</button><div class="mt-3 rounded-lg p-3 text-xs flex items-center gap-2" style="background:color-mix(in srgb,#15803d 11%,transparent);color:#15803d;border:1px solid color-mix(in srgb,#15803d 28%,transparent)"><i class="icon-circle-check"></i> Validation passed · 16 donors · 0 errors</div>`,cta:'Import'},
        export:{t:'Export',sub:'Export donor data',ic:'icon-download',body:`<p class="text-xs bd-mut mb-2">Choose a format</p><div class="grid grid-cols-2 gap-2">${['CSV','Excel','PDF','Print','Eligible Donors','By Blood Group','Donation History','Full Registry'].map(f=>`<button data-expfmt="${f}" class="bd-btn bd-btn-ghost justify-center">${f}</button>`).join('')}</div>`,cta:'Export'},
    };
    const SIMPLE={remind:'Reminder sent',contact:'Calling donor...',eligcheck:'Eligibility verified',print:'Printing donor card...',pdf:'PDF downloaded',archive:'Donor archived'};
    function openModal(key){ const m=MODALS[key]; if(!m) return; $('#bd-modalhost').innerHTML=`<div class="bd-modal-wrap open"><div class="bd-modal-bg" data-close></div><div class="bd-modal">
        <div class="bd-modal-head"><span class="bd-modal-badge"><i class="${m.ic}"></i></span><div class="min-w-0"><h3 class="font-bold bd-head leading-tight">${m.t}</h3><p class="text-[11px] bd-mut">${m.sub||''}</p></div><button data-close class="ml-auto w-8 h-8 rounded-lg hover:bg-[var(--bd-hover)] flex items-center justify-center bd-mut"><i class="icon-x"></i></button></div>
        <div class="bd-modal-body">${m.body}</div>
        <div class="bd-modal-foot"><button data-close class="bd-btn bd-btn-ghost">Cancel</button><button data-modalok="${key}" class="bd-btn bd-btn-primary"><i class="${m.ic}"></i> ${m.cta}</button></div>
    </div></div>`; document.body.style.overflow = 'hidden';
        // Modal HTML is injected after the page's initial-load flatpickr auto-init has
        // already run, so any date fields inside it must be initialized here instead.
        if(typeof flatpickr!=='undefined'){
            $$('[data-provider="flatpickr"]',$('#bd-modalhost')).forEach(el=>{
                if(el._flatpickr) return;
                const config={disableMobile:true};
                if(el.hasAttribute('data-date-format')) config.dateFormat=el.getAttribute('data-date-format');
                flatpickr(el,config);
            });
        }
    }
    function openDelete(msg,onOk){ $('#bd-modalhost').innerHTML=`<div class="bd-modal-wrap open"><div class="bd-modal-bg" data-close></div><div class="bd-modal" style="width:min(420px,94vw)"><div class="p-5 text-center"><div class="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style="background:color-mix(in srgb,#dc2626 13%,transparent);color:#dc2626"><i class="icon-alert-triangle text-2xl"></i></div><h3 class="font-bold text-lg bd-head">Confirm</h3><p class="text-xs bd-mut mt-1">${msg}</p><div class="flex gap-2 mt-4"><button data-close class="bd-btn bd-btn-ghost flex-1 justify-center">Cancel</button><button id="bd-delok" class="bd-btn bd-btn-danger flex-1 justify-center">Delete</button></div></div></div></div>`; document.body.style.overflow = 'hidden'; $('#bd-delok').onclick=()=>{ onOk(); closeModal(); }; }
    function closeModal(){ $('#bd-modalhost').innerHTML=''; if(!$('#bd-drawer').classList.contains('open')) document.body.style.overflow = ''; }

    /* ============ HELPERS ============ */
    function updateBulk(){ $('#bd-selcount').textContent=sel.size; $('.bd-bulk').classList.toggle('show',sel.size>0); }
    function refreshAll(){ renderDirectory(); renderDistribution(); renderEligibility(); renderTop(); updateCounts(); }

    /* ============ EVENTS ============ */
    document.addEventListener('click',e=>{
        if(e.target.closest('[data-vw]')){ const b=e.target.closest('[data-vw]'); view=b.dataset.vw; $$('#bd-viewtabs button').forEach(x=>x.classList.toggle('on',x===b)); renderDirectory(); return; }
        if(e.target.closest('[data-simple]')){ toast(SIMPLE[e.target.closest('[data-simple]').dataset.simple]||'Done'); return; }
        const t=e.target.closest('[data-donor],[data-menu],[data-action],[data-modal],[data-modalok],[data-close],[data-bulk],[data-expfmt]');
        if(!t){ if(!e.target.closest('.bd-menu')) closeMenu(); return; }
        if(t.dataset.donor!==undefined){ focusId=+t.dataset.donor; openDrawer(focusId); return; }
        if(t.dataset.menu!==undefined){ const r=t.getBoundingClientRect(); openMenu(+t.dataset.menu,r.left-180,r.bottom+4); return; }
        if(t.dataset.action!==undefined){ const a=t.dataset.action, id=+t.dataset.did; closeMenu(); focusId=id;
            if(a==='view') openDrawer(id);
            else if(MODALS[a]) openModal(a);
            else if(a==='delete') openDelete('Remove this donor from the registry?',()=>{ DON=DON.filter(x=>x.id!==id); sel.delete(id); refreshAll(); toast('Donor removed','icon-trash-2'); });
            else if(SIMPLE[a]) toast(SIMPLE[a]);
            return; }
        if(t.dataset.modal!==undefined){ openModal(t.dataset.modal); return; }
        if(t.dataset.modalok!==undefined){ const k=t.dataset.modalok; const d=DON.find(x=>x.id===focusId);
            if(k==='record'&&d){ d.donations++; d.el='soon'; d.last='Today'; }
            refreshAll(); toast(MODALS[k].cta+' — done','icon-check'); closeModal(); return; }
        if(t.dataset.expfmt!==undefined){ toast('Exported: '+t.dataset.expfmt,'icon-download'); closeModal(); return; }
        if(t.dataset.close!==undefined){ closeModal(); closeDrawer(); return; }
        if(t.dataset.bulk!==undefined){ const bk=t.dataset.bulk;
            if(bk==='delete') openDelete(`Remove ${sel.size} selected donor(s)?`,()=>{ DON=DON.filter(x=>!sel.has(x.id)); sel.clear(); refreshAll(); updateBulk(); toast('Donors removed','icon-trash-2'); });
            else { toast({notify:'Notifications sent',appointment:'Appointments scheduled',sms:'SMS sent',export:'Exported',print:'Printing',archive:'Archived'}[bk]+' · '+sel.size+' donors'); if(bk==='archive'){ sel.clear(); refreshAll(); updateBulk(); } }
            return; }
    });
    document.addEventListener('change',e=>{
        if(e.target.dataset.sel!==undefined){ const id=+e.target.dataset.sel; e.target.checked?sel.add(id):sel.delete(id); updateBulk(); return; }
        if(e.target.id==='bd-fgroup'){ fGroup=e.target.value; renderDirectory(); }
        if(e.target.id==='bd-felig'){ fElig=e.target.value; renderDirectory(); }
        if(e.target.id==='bd-sort'){ sort=e.target.value; renderDirectory(); }
    });
    document.addEventListener('input',e=>{ if(e.target.id==='bd-search'){ q=e.target.value; renderDirectory(); } });

    function clock(){ $('#bd-clock').textContent=new Date().toLocaleTimeString('en-GB'); }

    /* ============ INIT ============ */
    setTimeout(()=>{
        $('#bd-skeleton').classList.add('hidden');
        $('#bd-content').classList.remove('hidden');
        renderDirectory(); renderDistribution(); renderEligibility(); renderTop(); updateCounts();
        clock(); setInterval(clock,1000);
    },1400);
})();

// ==========================================================================
// blood-issue-detail.js
// ==========================================================================
document.addEventListener("DOMContentLoaded", function () {
  if ((location.pathname.split("/").pop() || "index.html") !== "blood-issue-detail.html") return;
  var $ = function (id) { return document.getElementById(id); };
  var params = new URLSearchParams(window.location.search);
  var pick = function (key, fallback) { var v = params.get(key); return v && v.length ? v : fallback; };

  var r = {
    id: pick("id", "1"),
    group: pick("group", "O+"),
    units: pick("units", "2"),
    issuedTo: pick("issuedTo", "Ravi Kumar — ICU Bed 4"),
    issuedBy: pick("issuedBy", "Nurse Fatima Ali"),
    date: pick("date", "2024-12-06 09:20"),
    crossmatch: pick("crossmatch", "Compatible"),
  };

  var CROSSMATCH_BADGE = {
    Compatible: "text-success bg-success/10",
    Pending: "text-warning bg-warning/10",
    Incompatible: "text-danger bg-danger/10",
  };
  var CROSSMATCH_CARD_COLOR = { Compatible: "bid-c-emerald", Pending: "bid-c-amber", Incompatible: "bid-c-rose" };

  var issueId = "#BI-" + String(r.id).padStart(5, "0");

  // Split "Ravi Kumar — ICU Bed 4" into a name + location for the hero/side panels.
  var toParts = String(r.issuedTo).split(/\s*—\s*/);
  var issuedName = toParts[0] || r.issuedTo;
  var issuedLocation = toParts[1] || "";

  $("bid-issued-name").textContent = issuedName;
  $("bid-crossmatch-badge").textContent = r.crossmatch;
  $("bid-issue-id").textContent = issueId;
  $("bid-group-meta").textContent = r.group;
  $("bid-location-meta").textContent = issuedLocation || "—";
  $("bid-date").textContent = r.date;

  $("bid-group").textContent = r.group;
  $("bid-units").textContent = r.units;
  $("bid-crossmatch").textContent = r.crossmatch;
  $("bid-issue-date").textContent = r.date;

  $("bid-r-group").textContent = r.group;
  $("bid-r-units").textContent = r.units;
  $("bid-r-issuedto").textContent = r.issuedTo;
  $("bid-r-issuedby").textContent = r.issuedBy;
  $("bid-r-date").textContent = r.date;
  $("bid-r-crossmatch").textContent = r.crossmatch;
  $("bid-r-recordid").textContent = "System-generated blood issue record · " + issueId;

  $("bid-side-issuedby").textContent = r.issuedBy;
  $("bid-side-location").textContent = issuedLocation || "Blood Bank Dispensary";

  $("bid-kv-issuedto").textContent = r.issuedTo;
  $("bid-kv-issuedby").textContent = r.issuedBy;
  $("bid-kv-date").textContent = r.date;

  document.title = issuedName + " — " + issueId + " — Dreams HMS";

  // Badge / accent colors
  var badgeCls = CROSSMATCH_BADGE[r.crossmatch] || "text-gray-900 bg-light/60";
  $("bid-crossmatch-badge").className = "inline-block px-2 py-1 text-xs font-bold rounded-lg whitespace-nowrap " + badgeCls;
  $("bid-crossmatch").className = "mt-3 text-xl font-extrabold " + (badgeCls.split(" ")[0] || "text-gray-900 dark:text-white");

  var crossmatchCard = $("bid-crossmatch-card");
  crossmatchCard.classList.remove("bid-c-emerald");
  crossmatchCard.classList.add(CROSSMATCH_CARD_COLOR[r.crossmatch] || "bid-c-emerald");

  // Incompatible crossmatch — show the alert banner.
  if (r.crossmatch === "Incompatible") {
    $("bid-alert-banner").style.display = "";
  }

  // ---- Actions ----
  // Print / navigation are handled inline via onclick / href — nothing else is interactive
  // on this page, since a blood issue is a point-in-time record rather than a workflow.
});

// ==========================================================================
// blood-request-detail.js
// ==========================================================================
document.addEventListener("DOMContentLoaded", function () {
  if ((location.pathname.split("/").pop() || "index.html") !== "blood-request-detail.html") return;
  var $ = function (id) { return document.getElementById(id); };
  var params = new URLSearchParams(window.location.search);
  var pick = function (key, fallback) { var v = params.get(key); return v && v.length ? v : fallback; };

  var r = {
    id: pick("id", "1"),
    patient: pick("patient", "Ravi Kumar"),
    group: pick("group", "O+"),
    units: pick("units", "2"),
    requestedBy: pick("requestedBy", "Dr. Mehta — ICU"),
    urgency: pick("urgency", "Emergency"),
    date: pick("date", "2024-12-06"),
    status: pick("status", "Fulfilled"),
  };

  var URGENCY_BADGE = {
    Routine: "text-primary bg-primary/10",
    Urgent: "text-warning bg-warning/10",
    Emergency: "text-danger bg-danger/10",
  };
  var STATUS_BADGE = {
    Pending: "text-warning bg-warning/10",
    Approved: "text-primary bg-primary/10",
    Fulfilled: "text-success bg-success/10",
  };
  var URGENCY_COLOR = { Routine: "bqd-c-primary", Urgent: "bqd-c-amber", Emergency: "bqd-c-rose" };

  var requestId = "#BR-" + String(r.id).padStart(5, "0");

  $("bqd-patient-name").textContent = r.patient;
  $("bqd-status-badge").textContent = r.status;
  $("bqd-urgency-badge").textContent = r.urgency;
  $("bqd-request-id").textContent = requestId;
  $("bqd-group-meta").textContent = r.group;
  $("bqd-requestedby-meta").textContent = r.requestedBy;
  $("bqd-date").textContent = r.date;
  $("bqd-group").textContent = r.group;
  $("bqd-units").textContent = r.units;
  $("bqd-requestedby").textContent = r.requestedBy;
  $("bqd-urgency").textContent = r.urgency;
  $("bqd-kv-patient").textContent = r.patient;
  $("bqd-kv-group").textContent = r.group;
  $("bqd-kv-units").textContent = r.units;
  $("bqd-kv-date").textContent = r.date;
  document.title = r.patient + " — " + requestId + " — Dreams HMS";

  // Split "Dr. Mehta — ICU" into a name + department for the sidebar hero.
  var byParts = String(r.requestedBy).split(/\s*—\s*/);
  $("bqd-side-doctor").textContent = byParts[0] || r.requestedBy;
  $("bqd-side-dept").textContent = byParts[1] || "Requesting Department";

  // Badge classes
  var statusEl = $("bqd-status-badge");
  statusEl.className = "inline-block px-2 py-1 text-xs font-bold rounded-lg whitespace-nowrap " + (STATUS_BADGE[r.status] || "text-gray-900 bg-light/60");

  var urgencyBadgeEl = $("bqd-urgency-badge");
  var urgencyChipCls = URGENCY_BADGE[r.urgency] || "text-gray-900 bg-light/60";
  urgencyBadgeEl.className = "inline-block px-2 py-1 text-xs font-bold rounded-lg whitespace-nowrap " + urgencyChipCls;

  var urgencyEl = $("bqd-urgency");
  urgencyEl.className = "mt-3 text-xl font-extrabold " + (urgencyChipCls.split(" ")[0] || "text-gray-900 dark:text-white");

  // Recolor the urgency stat card to match severity.
  var urgencyCard = $("bqd-urgency-card");
  urgencyCard.classList.remove("bqd-c-amber");
  urgencyCard.classList.add(URGENCY_COLOR[r.urgency] || "bqd-c-amber");

  // ---- Workflow timeline ----
  var STAGES = ["Pending", "Approved", "Fulfilled"];
  var STAGE_ICON = ["icon-clock", "icon-shield-check", "icon-check-circle"];
  var STAGE_DESC = [
    "Blood request submitted and awaiting review.",
    "Request reviewed and approved by the blood bank.",
    "Units dispensed and delivered to the requesting ward.",
  ];
  var reachedIndex = STAGES.indexOf(r.status);
  if (reachedIndex < 0) reachedIndex = 0;

  $("bqd-timeline").innerHTML = STAGES.map(function (label, i) {
    var state = i < reachedIndex ? "done" : i === reachedIndex ? "current" : "";
    var when = i <= reachedIndex ? r.date : "Pending";
    return '<div class="bqd-tl-item ' + state + '"><span class="bqd-tl-node"><i class="' + STAGE_ICON[i] + '"></i></span>' +
      '<p class="text-sm font-bold text-gray-900 dark:text-white">' + label + '</p>' +
      '<p class="text-xs text-gray-500 dark:text-gray-400">' + STAGE_DESC[i] + '</p>' +
      '<p class="text-[11px] text-gray-400 mt-0.5">' + when + '</p></div>';
  }).join("");

  // ---- Request notes ----
  var noteText;
  if (r.status === "Fulfilled") {
    noteText = "This request has been fulfilled — " + r.units + " unit(s) of " + r.group + " blood were issued to " + r.patient + ".";
  } else if (r.status === "Approved") {
    noteText = "This request has been approved and is awaiting dispensing from blood bank inventory.";
  } else {
    noteText = "This request is pending approval." + (r.urgency === "Emergency" ? " Marked as Emergency priority — please review and process without delay." : "");
  }
  $("bqd-notes-panel").innerHTML =
    '<div class="bqd-note"><i class="icon-clipboard-check mr-1"></i>' + noteText + "</div>";

  // ---- Actions ----
  $("bqd-mark-fulfilled").onclick = function () {
    if (r.status === "Fulfilled") {
      MC.toast("This request is already fulfilled", "info");
      return;
    }
    MC.toast("Blood request marked as fulfilled", "success");
  };
  if (r.status === "Fulfilled") {
    var btn = $("bqd-mark-fulfilled");
    btn.disabled = true;
    btn.innerHTML = '<i class="icon-check-circle"></i>Already Fulfilled';
  }
});
