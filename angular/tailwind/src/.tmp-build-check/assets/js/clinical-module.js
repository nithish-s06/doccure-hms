// ==========================================================================
// critical-alerts.js
// ==========================================================================
// Dreams HMS — Critical Alerts Command Center
// Hospital-wide incident management hub: overview widgets with ring gauges,
// severity-grouped real-time alert wall with live SLA countdowns, emergency
// response workflow kanban, department alert map, code blue center, incident
// timeline, doctor/nurse response board and alert analytics.
// Static demo data only — no API, no backend.
(function(){
    "use strict";
    if ((location.pathname.split("/").pop() || "index.html") !== "critical-alerts.html") return;
    const $=(s,r)=>(r||document).querySelector(s);
    const $$=(s,r)=>Array.from((r||document).querySelectorAll(s));
    const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
    let toastT;
    function toast(msg,icon){ const t=$('#ca-toast'); t.innerHTML=`<i class="${icon||'icon-check'} text-teal-400"></i> ${msg}`; t.classList.add('show'); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove('show'),2500); }

    /* ============ DATA ============ */
    const SEVS=[['crit','Critical','#dc2626'],['high','High','#e06c1f'],['med','Medium','#b7791f'],['info','Information','#1d4ed8'],['res','Resolved','#15803d']];
    const SEVC={crit:'#dc2626',high:'#e06c1f',med:'#b7791f',info:'#1d4ed8',res:'#15803d'};
    const SEVLABEL={crit:'Critical',high:'High',med:'Medium',info:'Information',res:'Resolved'};
    const DOCS=['Dr. A. Mehta','Dr. S. Kapoor','Dr. R. Nair','Dr. L. Khan','Dr. P. Rao'];
    const NURSES=['N. Fernandes','N. Pillai','N. Sharma','N. Das','N. Reddy'];
    const DEPTS=['ICU','Emergency','CCU','NICU','PICU','General Ward','Operating Theatre','Recovery Room'];
    const TYPES=['Cardiac Arrest','Oxygen Desaturation','Ventilator Failure','Sepsis Alert','Fall Detected','Hemorrhage','Anaphylaxis','Arrhythmia','BP Critical','Stroke Alert','Seizure','Medication Reaction'];
    const NAMES=['Rahul Sharma','Anita Reddy','Vikram Nair','Priya Patel','Suresh Gupta','Meera Singh','Arjun Menon','Kavya Das','Deepak Joshi','Neha Verma','Rohan Iyer','Sana Khan','Manoj Rao','Divya Menon'];
    const AVC=['#475569','#0f766e','#1e40af','#4338ca','#0e7490','#334155','#3f6212','#7c2d12'];
    const STATES=['New','Acknowledged','In Progress','Escalated','Resolved'];
    const initials=n=>n.split(' ').map(x=>x[0]).join('').slice(0,2);

    // Frozen static seed data (one snapshot of what mkAlert() used to generate
    // randomly on every page load) so the initial Alert Wall / Kanban / Overview
    // markup can be written directly into the HTML instead of JS-built on load.
    // mkAlert() is kept below so any future runtime code can still mint alerts
    // the same shape; seq continues on from the highest frozen id.
    let seq=22;
    function mkAlert(i){
        const id=seq++;
        const r=Math.random();
        let sev = r<0.24?'crit':r<0.46?'high':r<0.66?'med':r<0.82?'info':'res';
        const state = sev==='res'?'Resolved':STATES[rnd(0,3)];
        const dept=DEPTS[id%DEPTS.length];
        return { id, code:'ALT-'+(7200+id), sev, type:TYPES[id%TYPES.length], name:NAMES[id%NAMES.length], mrn:'MRN-'+(50900+id),
            dept, ward:dept==='ICU'?'ICU-A':dept, bed:dept.slice(0,3).toUpperCase()+'-'+String(rnd(1,12)).padStart(2,'0'),
            doc:DOCS[id%DOCS.length], nurse:NURSES[id%NURSES.length], state, pinned:false,
            triggered:rnd(1,58)+'m ago', sla:sev==='crit'?rnd(30,180):sev==='high'?rnd(120,420):rnd(300,900),
            av:AVC[id%AVC.length], col:state };
    }
    let ALERTS=[{"id":0,"code":"ALT-7200","sev":"res","type":"Cardiac Arrest","name":"Rahul Sharma","mrn":"MRN-50900","dept":"ICU","ward":"ICU-A","bed":"ICU-10","doc":"Dr. A. Mehta","nurse":"N. Fernandes","state":"Resolved","pinned":false,"triggered":"12m ago","sla":849,"av":"#475569","col":"Resolved"},{"id":1,"code":"ALT-7201","sev":"info","type":"Oxygen Desaturation","name":"Anita Reddy","mrn":"MRN-50901","dept":"Emergency","ward":"Emergency","bed":"EME-05","doc":"Dr. S. Kapoor","nurse":"N. Pillai","state":"In Progress","pinned":false,"triggered":"42m ago","sla":610,"av":"#0f766e","col":"In Progress"},{"id":2,"code":"ALT-7202","sev":"res","type":"Ventilator Failure","name":"Vikram Nair","mrn":"MRN-50902","dept":"CCU","ward":"CCU","bed":"CCU-08","doc":"Dr. R. Nair","nurse":"N. Sharma","state":"Resolved","pinned":false,"triggered":"27m ago","sla":693,"av":"#1e40af","col":"Resolved"},{"id":3,"code":"ALT-7203","sev":"res","type":"Sepsis Alert","name":"Priya Patel","mrn":"MRN-50903","dept":"NICU","ward":"NICU","bed":"NIC-08","doc":"Dr. L. Khan","nurse":"N. Das","state":"Resolved","pinned":false,"triggered":"2m ago","sla":794,"av":"#4338ca","col":"Resolved"},{"id":4,"code":"ALT-7204","sev":"high","type":"Fall Detected","name":"Suresh Gupta","mrn":"MRN-50904","dept":"PICU","ward":"PICU","bed":"PIC-11","doc":"Dr. P. Rao","nurse":"N. Reddy","state":"Escalated","pinned":false,"triggered":"2m ago","sla":307,"av":"#0e7490","col":"Escalated"},{"id":5,"code":"ALT-7205","sev":"crit","type":"Hemorrhage","name":"Meera Singh","mrn":"MRN-50905","dept":"General Ward","ward":"General Ward","bed":"GEN-01","doc":"Dr. A. Mehta","nurse":"N. Fernandes","state":"Escalated","pinned":false,"triggered":"24m ago","sla":69,"av":"#334155","col":"Escalated"},{"id":6,"code":"ALT-7206","sev":"res","type":"Anaphylaxis","name":"Arjun Menon","mrn":"MRN-50906","dept":"Operating Theatre","ward":"Operating Theatre","bed":"OPE-12","doc":"Dr. S. Kapoor","nurse":"N. Pillai","state":"Resolved","pinned":false,"triggered":"27m ago","sla":545,"av":"#3f6212","col":"Resolved"},{"id":7,"code":"ALT-7207","sev":"info","type":"Arrhythmia","name":"Kavya Das","mrn":"MRN-50907","dept":"Recovery Room","ward":"Recovery Room","bed":"REC-10","doc":"Dr. R. Nair","nurse":"N. Sharma","state":"Acknowledged","pinned":false,"triggered":"2m ago","sla":608,"av":"#7c2d12","col":"Acknowledged"},{"id":8,"code":"ALT-7208","sev":"med","type":"BP Critical","name":"Deepak Joshi","mrn":"MRN-50908","dept":"ICU","ward":"ICU-A","bed":"ICU-09","doc":"Dr. L. Khan","nurse":"N. Das","state":"Acknowledged","pinned":false,"triggered":"4m ago","sla":764,"av":"#475569","col":"Acknowledged"},{"id":9,"code":"ALT-7209","sev":"info","type":"Stroke Alert","name":"Neha Verma","mrn":"MRN-50909","dept":"Emergency","ward":"Emergency","bed":"EME-01","doc":"Dr. P. Rao","nurse":"N. Reddy","state":"New","pinned":false,"triggered":"20m ago","sla":609,"av":"#0f766e","col":"New"},{"id":10,"code":"ALT-7210","sev":"med","type":"Seizure","name":"Rohan Iyer","mrn":"MRN-50910","dept":"CCU","ward":"CCU","bed":"CCU-08","doc":"Dr. A. Mehta","nurse":"N. Fernandes","state":"New","pinned":false,"triggered":"43m ago","sla":520,"av":"#1e40af","col":"New"},{"id":11,"code":"ALT-7211","sev":"info","type":"Medication Reaction","name":"Sana Khan","mrn":"MRN-50911","dept":"NICU","ward":"NICU","bed":"NIC-10","doc":"Dr. S. Kapoor","nurse":"N. Pillai","state":"In Progress","pinned":false,"triggered":"4m ago","sla":404,"av":"#4338ca","col":"In Progress"},{"id":12,"code":"ALT-7212","sev":"crit","type":"Cardiac Arrest","name":"Manoj Rao","mrn":"MRN-50912","dept":"PICU","ward":"PICU","bed":"PIC-01","doc":"Dr. R. Nair","nurse":"N. Sharma","state":"Escalated","pinned":false,"triggered":"57m ago","sla":36,"av":"#0e7490","col":"Escalated"},{"id":13,"code":"ALT-7213","sev":"med","type":"Oxygen Desaturation","name":"Divya Menon","mrn":"MRN-50913","dept":"General Ward","ward":"General Ward","bed":"GEN-07","doc":"Dr. L. Khan","nurse":"N. Das","state":"New","pinned":false,"triggered":"25m ago","sla":344,"av":"#334155","col":"New"},{"id":14,"code":"ALT-7214","sev":"high","type":"Ventilator Failure","name":"Rahul Sharma","mrn":"MRN-50914","dept":"Operating Theatre","ward":"Operating Theatre","bed":"OPE-02","doc":"Dr. P. Rao","nurse":"N. Reddy","state":"In Progress","pinned":false,"triggered":"58m ago","sla":285,"av":"#3f6212","col":"In Progress"},{"id":15,"code":"ALT-7215","sev":"high","type":"Sepsis Alert","name":"Anita Reddy","mrn":"MRN-50915","dept":"Recovery Room","ward":"Recovery Room","bed":"REC-07","doc":"Dr. A. Mehta","nurse":"N. Fernandes","state":"In Progress","pinned":false,"triggered":"51m ago","sla":181,"av":"#7c2d12","col":"In Progress"},{"id":16,"code":"ALT-7216","sev":"info","type":"Fall Detected","name":"Vikram Nair","mrn":"MRN-50916","dept":"ICU","ward":"ICU-A","bed":"ICU-10","doc":"Dr. S. Kapoor","nurse":"N. Pillai","state":"Acknowledged","pinned":false,"triggered":"7m ago","sla":482,"av":"#475569","col":"Acknowledged"},{"id":17,"code":"ALT-7217","sev":"med","type":"Hemorrhage","name":"Priya Patel","mrn":"MRN-50917","dept":"Emergency","ward":"Emergency","bed":"EME-04","doc":"Dr. R. Nair","nurse":"N. Sharma","state":"Escalated","pinned":false,"triggered":"29m ago","sla":378,"av":"#0f766e","col":"Escalated"},{"id":18,"code":"ALT-7218","sev":"crit","type":"Anaphylaxis","name":"Suresh Gupta","mrn":"MRN-50918","dept":"CCU","ward":"CCU","bed":"CCU-06","doc":"Dr. L. Khan","nurse":"N. Das","state":"In Progress","pinned":false,"triggered":"45m ago","sla":179,"av":"#1e40af","col":"In Progress"},{"id":19,"code":"ALT-7219","sev":"med","type":"Arrhythmia","name":"Meera Singh","mrn":"MRN-50919","dept":"NICU","ward":"NICU","bed":"NIC-11","doc":"Dr. P. Rao","nurse":"N. Reddy","state":"In Progress","pinned":false,"triggered":"55m ago","sla":523,"av":"#4338ca","col":"In Progress"},{"id":20,"code":"ALT-7220","sev":"high","type":"BP Critical","name":"Arjun Menon","mrn":"MRN-50920","dept":"PICU","ward":"PICU","bed":"PIC-07","doc":"Dr. A. Mehta","nurse":"N. Fernandes","state":"New","pinned":false,"triggered":"22m ago","sla":354,"av":"#0e7490","col":"New"},{"id":21,"code":"ALT-7221","sev":"high","type":"Stroke Alert","name":"Kavya Das","mrn":"MRN-50921","dept":"General Ward","ward":"General Ward","bed":"GEN-11","doc":"Dr. S. Kapoor","nurse":"N. Pillai","state":"Acknowledged","pinned":false,"triggered":"52m ago","sla":396,"av":"#334155","col":"Acknowledged"}];
    const active=()=>ALERTS.filter(a=>a.sev!=='res');
    const sel=new Set();

    const fmtCd=s=>{ if(s<=0) return 'SLA breached'; const m=Math.floor(s/60),ss=s%60; return (m>0?m+'m ':'')+String(ss).padStart(2,'0')+'s'; };

    /* ============ HERO COUNTS ============ */
    function updateCounts(){
        $('#ca-h-active').textContent=active().length;
        $('#ca-h-high').textContent=ALERTS.filter(a=>a.sev==='high').length;
        $('#ca-h-crit').textContent=ALERTS.filter(a=>a.sev==='crit').length;
        $('#ca-h-esc').textContent=ALERTS.filter(a=>a.state==='Escalated').length;
        $('#ca-h-code').textContent=ALERTS.filter(a=>a.type==='Cardiac Arrest'&&a.sev==='crit').length;
    }

    /* ============ OVERVIEW WIDGETS ============ */
    function trendSvg(data,color){ const w=54,h=18,mn=Math.min(...data),mx=Math.max(...data),rg=(mx-mn)||1; const pts=data.map((v,i)=>`${(i/(data.length-1))*w},${h-((v-mn)/rg)*h}`).join(' '); return `<svg class="ca-trend" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round"/></svg>`; }
    function renderOverview(){
        const c=s=>ALERTS.filter(a=>a.sev===s).length;
        const W=[
            ['Active Alerts',active().length,72,'#0d9488','icon-bell-ring',[14,16,15,18,17,active().length]],
            ['Critical',c('crit'),30,'#dc2626','icon-alert-triangle',[7,6,8,7,6,c('crit')]],
            ['Warning',c('high')+c('med'),58,'#e06c1f','icon-alert-octagon',[10,11,9,12,11,c('high')+c('med')]],
            ['Information',c('info'),40,'#1d4ed8','icon-info',[5,6,5,7,6,c('info')]],
            ['Resolved',c('res'),88,'#15803d','icon-circle-check',[30,34,36,39,40,42]],
            ['Avg Response',3.2,64,'#7c3aed','icon-timer',[4.1,3.8,3.6,3.4,3.3,3.2]],
        ];
        $('#ca-overview').innerHTML=W.map((w,i)=>`
          <div class="ca-card p-3.5">
            <div class="flex items-start justify-between">
              <span class="ca-iconbadge w-9 h-9" style="color:${w[3]}"><i class="${w[4]}"></i></span>
              <div class="relative w-11 h-11"><svg viewBox="0 0 36 36" class="ca-ring w-11 h-11"><circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--ca-track)" stroke-width="3.2"/><circle class="bar" cx="18" cy="18" r="15.9" fill="none" stroke="${w[3]}" stroke-width="3.2" stroke-linecap="round" pathLength="100" style="--p:${w[2]}"/></svg><span class="absolute inset-0 flex items-center justify-center text-[9px] font-bold" style="color:${w[3]}">${w[2]}%</span></div>
            </div>
            <p class="text-2xl font-bold ca-head mt-2 tabular-nums">${w[1]}${i===5?'<span class="text-sm ca-mut"> min</span>':''}</p>
            <div class="flex items-center justify-between mt-1"><p class="text-[11px] ca-mut">${w[0]}</p>${trendSvg(w[5],w[3])}</div>
          </div>`).join('');
    }
    function animateRings(){ $$('.ca-ring .bar').forEach(b=>{ const p=b.style.getPropertyValue('--p'); b.style.setProperty('--p','0'); requestAnimationFrame(()=>requestAnimationFrame(()=>b.style.setProperty('--p',p))); }); }

    /* ============ ALERT WALL ============ */
    let wallQ='', wallDept='';
    function alertCard(a){
        const sc=SEVC[a.sev];
        return `<div class="ca-alert sev-${a.sev} ${a.pinned?'pinned':''}" data-alert="${a.id}">
            <div class="flex items-center gap-2 mb-1.5">
                <label onclick="event.stopPropagation()" class="flex items-center"><input type="checkbox" data-sel="${a.id}" ${sel.has(a.id)?'checked':''} class="accent-[var(--ca-c)]"></label>
                <span class="text-[11px] font-bold ca-mut">${a.code}</span>
                <span class="sevpill ca-chip ml-auto">${a.sev==='crit'?'<i class="icon-alert-triangle text-[9px]"></i> ':''}${SEVLABEL[a.sev]}</span>
                <button data-pin="${a.id}" onclick="event.stopPropagation()" class="w-5 h-5 rounded hover:bg-[var(--ca-hover)] flex items-center justify-center"><i class="icon-pin text-[12px] ${a.pinned?'':'ca-mut'}" style="${a.pinned?'color:'+sc:''}"></i></button>
            </div>
            <div class="flex items-center gap-2">
                <span class="ca-avatar flex-none" style="width:30px;height:30px;background:${a.av};font-size:11px">${initials(a.name)}</span>
                <div class="min-w-0 flex-1"><p class="text-sm font-semibold ca-head truncate leading-tight">${a.name}</p><p class="text-[10px] ca-mut">${a.mrn} · ${a.bed}</p></div>
                <button data-menu="${a.id}" onclick="event.stopPropagation()" class="w-6 h-6 rounded-md hover:bg-[var(--ca-hover)] flex items-center justify-center ca-mut"><i class="icon-more-vertical text-sm"></i></button>
            </div>
            <p class="text-xs font-medium ca-head mt-1.5">${a.type}</p>
            <p class="text-[10px] ca-mut">${a.dept} · ${a.ward}</p>
            <div class="flex items-center justify-between mt-2 text-[10px]">
                <span class="ca-mut"><i class="icon-stethoscope text-[10px]"></i> ${a.doc.split('. ')[1]||a.doc}</span>
                ${a.sev==='res'?'<span class="ca-npill">Closed</span>':`<span class="font-bold ca-cd" data-cd="${a.id}" style="color:${a.sla<60?'#dc2626':sc}"><i class="icon-clock text-[10px]"></i> ${fmtCd(a.sla)}</span>`}
            </div>
            <div class="flex flex-wrap gap-1 mt-2">
                ${a.sev!=='res'?`<button data-quick-ack="${a.id}" onclick="event.stopPropagation()" class="ca-npill hover:bg-[var(--ca-hover)]"><i class="icon-check text-[10px]"></i> Ack</button><button data-quick-esc="${a.id}" onclick="event.stopPropagation()" class="ca-npill hover:bg-[var(--ca-hover)]"><i class="icon-trending-up text-[10px]"></i> Escalate</button><button data-quick-res="${a.id}" onclick="event.stopPropagation()" class="ca-npill hover:bg-[var(--ca-hover)]"><i class="icon-circle-check text-[10px]"></i> Resolve</button>`:`<span class="ca-npill"><i class="icon-check text-[10px]"></i> Resolved</span>`}
            </div>
        </div>`;
    }
    function renderWall(){
        let list=ALERTS;
        if(wallDept) list=list.filter(a=>a.dept===wallDept);
        if(wallQ){ const q=wallQ.toLowerCase(); list=list.filter(a=>a.name.toLowerCase().includes(q)||a.code.toLowerCase().includes(q)||a.type.toLowerCase().includes(q)||a.mrn.toLowerCase().includes(q)); }
        $('#ca-wall').innerHTML=SEVS.map(s=>{
            const items=list.filter(a=>a.sev===s[0]).sort((x,y)=>y.pinned-x.pinned);
            return `<div class="ca-sevcol sev-${s[0]}">
                <div class="flex items-center justify-between mb-2 cursor-pointer" data-sevtoggle><span class="text-sm font-bold ca-head flex items-center gap-1.5"><span class="ca-dot" style="background:${s[2]}"></span> ${s[1]}</span><span class="flex items-center gap-1.5"><span class="ca-chip" style="background:color-mix(in srgb,${s[2]} 14%,transparent);color:${s[2]}">${items.length}</span><i class="icon-chevron-down text-xs ca-mut ca-caret transition-transform"></i></span></div>
                <div class="ca-sevbody space-y-2.5">${items.map(alertCard).join('')||`<p class="text-[11px] ca-mut text-center py-3 ca-panel rounded-lg">No alerts</p>`}</div>
            </div>`;
        }).join('');
    }
    function tickCountdown(){
        ALERTS.forEach(a=>{ if(a.sev!=='res'&&a.sla>0) a.sla=Math.max(0,a.sla-2); });
        $$('.ca-cd').forEach(el=>{ const a=ALERTS.find(x=>x.id===+el.dataset.cd); if(a){ el.innerHTML=`<i class="icon-clock text-[10px]"></i> ${fmtCd(a.sla)}`; el.style.color=a.sla<60?'#dc2626':SEVC[a.sev]; } });
    }

    /* ============ WORKFLOW KANBAN ============ */
    const KCOLS=[['New','#dc2626'],['Acknowledged','#e06c1f'],['In Progress','#1d4ed8'],['Escalated','#b7791f'],['Resolved','#15803d']];
    function renderKanban(){
        $('#ca-kanban').innerHTML=KCOLS.map(c=>{
            const items=ALERTS.filter(a=>a.col===c[0]).slice(0,6);
            return `<div class="ca-kcol p-2.5" data-kcol="${c[0]}">
                <div class="flex items-center justify-between mb-2 px-1"><span class="text-sm font-bold ca-head flex items-center gap-1.5"><span class="ca-dot" style="background:${c[1]}"></span> ${c[0]}</span><span class="ca-npill">${ALERTS.filter(a=>a.col===c[0]).length}</span></div>
                <div class="space-y-2 min-h-[40px]" data-kbody="${c[0]}">
                ${items.map(a=>`<div class="ca-ktask" draggable="true" data-task="${a.id}" style="border-left:3px solid ${SEVC[a.sev]}">
                    <div class="flex items-center justify-between"><span class="text-[11px] font-bold ca-mut">${a.code}</span><span class="ca-chip" style="background:color-mix(in srgb,${SEVC[a.sev]} 12%,transparent);color:${SEVC[a.sev]}">${SEVLABEL[a.sev]}</span></div>
                    <p class="text-xs font-semibold ca-head mt-1 leading-tight">${a.type}</p>
                    <p class="text-[10px] ca-mut mt-0.5">${a.name} · ${a.bed}</p>
                    <div class="flex items-center justify-between text-[10px] ca-mut mt-1.5"><span><i class="icon-user-check"></i> ${a.nurse.split(' ')[1]||a.nurse}</span>${a.sev!=='res'?`<span style="color:${a.sla<60?'#dc2626':SEVC[a.sev]}"><i class="icon-clock"></i> ${fmtCd(a.sla)}</span>`:'<i class="icon-grip-vertical"></i>'}</div>
                </div>`).join('')||`<p class="text-[11px] ca-mut text-center py-2">Drop here</p>`}
                </div></div>`;
        }).join('');
    }
    let dragId=null;
    document.addEventListener('dragstart',e=>{ const t=e.target.closest('[data-task]'); if(t){ dragId=+t.dataset.task; t.classList.add('drag'); } });
    document.addEventListener('dragend',e=>{ const t=e.target.closest('[data-task]'); if(t) t.classList.remove('drag'); $$('.ca-kcol').forEach(c=>c.classList.remove('over')); });
    document.addEventListener('dragover',e=>{ const c=e.target.closest('[data-kcol]'); if(c){ e.preventDefault(); $$('.ca-kcol').forEach(x=>x.classList.toggle('over',x===c)); } });
    document.addEventListener('drop',e=>{ const c=e.target.closest('[data-kcol]'); if(c&&dragId!=null){ e.preventDefault(); const a=ALERTS.find(x=>x.id===dragId); if(a){ a.col=c.dataset.kcol; a.state=c.dataset.kcol; if(a.col==='Resolved') a.sev='res'; renderKanban(); renderWall(); updateCounts(); toast(a.code+' → '+a.col,'icon-git-branch'); } dragId=null; } });

    /* ============ ACTIVITY ============ */
    const ACTS=[
        ['Alert Triggered','Cardiac arrest · ICU-A-01','icon-siren','#dc2626'],
        ['Code Blue Activated','NICU-02 · team dispatched','icon-alert-octagon','#1d4ed8'],
        ['Doctor Assigned','Dr. Mehta → ALT-7203','icon-stethoscope','#0e7490'],
        ['Nurse Responded','N. Das · 41s','icon-user-check','#15803d'],
        ['Patient Stabilized','ICU-A-01 · ROSC','icon-heart','#15803d'],
        ['Alert Escalated','ALT-7208 → Consultant','icon-trending-up','#e06c1f'],
        ['Alert Resolved','ALT-7191 closed','icon-circle-check','#15803d'],
        ['Incident Closed','INC-3320 documented','icon-file-check','#64748b'],
    ];
    function renderActivity(){ $('#ca-activity').innerHTML=ACTS.map(a=>`<div class="ca-panel p-3 flex items-start gap-2.5"><span class="ca-iconbadge w-8 h-8 flex-none" style="color:${a[3]}"><i class="${a[2]}"></i></span><div class="min-w-0"><p class="text-sm font-semibold ca-head">${a[0]}</p><p class="text-[11px] ca-mut truncate">${a[1]}</p><p class="text-[10px] ca-mut mt-0.5">${rnd(1,58)}m ago</p></div></div>`).join(''); }

    /* ============ DRAWER ============ */
    function openDrawer(id){
        const a=ALERTS.find(x=>x.id===id); if(!a) return; const sc=SEVC[a.sev];
        const box=(t,ic,body)=>`<div class="ca-panel p-3"><p class="text-[11px] font-bold ca-mut uppercase tracking-wide mb-2 flex items-center gap-1.5"><i class="${ic} ca-hicon text-[13px]"></i> ${t}</p>${body}</div>`;
        const row=(k,v)=>`<div class="flex justify-between text-xs py-0.5"><span class="ca-mut">${k}</span><span class="font-medium ca-head">${v}</span></div>`;
        $('#ca-drawer').innerHTML=`
          <div class="p-4 border-b sticky top-0 z-10 flex items-center justify-between" style="background:var(--ca-elev);border-color:var(--ca-border)">
            <div class="flex items-center gap-3"><span class="ca-iconbadge w-11 h-11 flex-none" style="color:${sc};background:color-mix(in srgb,${sc} 12%,transparent)"><i class="icon-siren text-lg"></i></span><div><p class="font-bold ca-head">${a.code}</p><p class="text-[11px] ca-mut">${a.type} · ${a.dept}</p></div></div>
            <button data-close class="w-8 h-8 rounded-lg hover:bg-[var(--ca-hover)] flex items-center justify-center ca-mut"><i class="icon-x"></i></button>
          </div>
          <div class="p-4 space-y-3">
            <div class="flex items-center gap-2 flex-wrap"><span class="ca-chip" style="background:color-mix(in srgb,${sc} 14%,transparent);color:${sc}">${SEVLABEL[a.sev]}</span><span class="ca-npill">${a.state}</span>${a.sev!=='res'?`<span class="ca-npill" style="color:${a.sla<60?'#dc2626':''}"><i class="icon-clock text-[11px]"></i> SLA ${fmtCd(a.sla)}</span>`:''}</div>
            ${box('Alert Summary','icon-info',row('Alert ID',a.code)+row('Type',a.type)+row('Source','Bedside monitor')+row('Severity',SEVLABEL[a.sev])+row('Triggered',a.triggered))}
            ${box('Patient Information','icon-user',`<div class="flex items-center gap-2 mb-1.5"><span class="ca-avatar" style="width:34px;height:34px;background:${a.av};font-size:12px">${initials(a.name)}</span><div><p class="text-sm font-semibold ca-head">${a.name}</p><p class="text-[11px] ca-mut">${a.mrn} · ${a.bed}</p></div></div>`+row('Ward / ICU',a.ward)+row('Current Condition',a.sev==='crit'?'Unstable':'Monitored'))}
            ${box('Assigned Staff','icon-users',row('Doctor',a.doc)+row('Nurse',a.nurse)+row('Response Time','2.1 min'))}
            ${box('Response Actions','icon-list-checks',['Nurse acknowledged','Doctor notified','Team activated'].map(x=>`<div class="flex items-center gap-2 text-xs py-0.5"><i class="icon-check text-emerald-500 text-[13px]"></i> ${x}</div>`).join(''))}
            ${box('Medication','icon-syringe',row('Adrenaline','1mg IV')+row('Amiodarone','300mg IV'))}
            ${box('Laboratory / Radiology','icon-flask-conical',row('Labs','ABG STAT')+row('Radiology','Portable CXR'))}
            ${box('Clinical Notes','icon-notebook','<p class="text-xs ca-mut">'+(a.sev==='crit'?'Immediate resuscitation initiated. Team at bedside.':'Under active monitoring, responding to therapy.')+'</p>')}
            ${box('Resolution Notes','icon-circle-check','<p class="text-xs ca-mut">'+(a.sev==='res'?'ROSC achieved, patient transferred to ICU. Incident documented.':'Pending resolution.')+'</p>')}
            <div class="grid grid-cols-2 gap-2">
                <button data-quick-ack="${a.id}" class="ca-btn ca-btn-ghost justify-center"><i class="icon-check"></i> Acknowledge</button>
                <button data-modal="escalate" class="ca-btn ca-btn-ghost justify-center"><i class="icon-trending-up"></i> Escalate</button>
                <button data-modal="note" class="ca-btn ca-btn-ghost justify-center"><i class="icon-notebook"></i> Notes</button>
                <button data-quick-res="${a.id}" class="ca-btn ca-btn-primary justify-center"><i class="icon-circle-check"></i> Resolve</button>
            </div>
          </div>`;
        $('#ca-drawer').classList.add('open');
        document.body.style.overflow = "hidden";
    }
    function closeDrawer(){ $('#ca-drawer').classList.remove('open'); if(!document.querySelector('.ca-modal-wrap')) document.body.style.overflow=""; }

    /* ============ MENU ============ */
    const ACTIONS=[['View Alert','icon-eye','view'],['View Patient','icon-user','patient'],['Acknowledge','icon-check','ack'],['Escalate','icon-trending-up','escalate'],['Assign Doctor','icon-stethoscope','doctor'],['Assign Nurse','icon-user-check','nurse'],['Notify Team','icon-bell-ring','notify'],['Create Incident','icon-file-plus','incident'],['Add Clinical Notes','icon-notebook','note'],['Mark In Progress','icon-loader','progress'],['Resolve Alert','icon-circle-check','resolve'],['sep'],['Print Incident','icon-printer','print'],['Download PDF','icon-file-down','pdf'],['Archive','icon-archive','archive'],['Delete','icon-trash-2','delete']];
    function openMenu(id,x,y){ closeMenu(); $('#ca-menuhost').innerHTML=`<div class="ca-menu" id="ca-openmenu">${ACTIONS.map(a=>a[0]==='sep'?'<div class="ca-menu-sep"></div>':`<button data-action="${a[2]}" data-aid="${id}" class="${a[2]==='delete'?'danger':''}"><i class="${a[1]}"></i> ${a[0]}</button>`).join('')}</div>`; const m=$('#ca-openmenu'); const r=m.getBoundingClientRect(); m.style.left=Math.max(12,Math.min(x,window.innerWidth-r.width-12))+'px'; m.style.top=Math.max(12,Math.min(y,window.innerHeight-r.height-12))+'px'; }
    function closeMenu(){ $('#ca-menuhost').innerHTML=''; }

    /* ============ MODALS ============ */
    const fld=(l,el)=>`<div><label class="ca-formlabel">${l}</label>${el}</div>`;
    const inp=(ph)=>`<input class="ca-in mt-1" placeholder="${ph||''}">`;
    const selE=(o)=>`<select class="ca-in mt-1">${o.map(x=>`<option>${x}</option>`).join('')}</select>`;
    const drop=(t)=>`<div class="ca-drop rounded-xl h-28 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[var(--ca-hover)]"><i class="icon-cloud-upload text-3xl ca-mut"></i><p class="text-sm font-semibold mt-1 ca-head">${t}</p></div>`;
    const MODALS={
        create:{t:'Create Alert',sub:'Raise a new critical alert',ic:'icon-plus',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('Alert Type',selE(TYPES))}${fld('Severity',selE(['Critical','High','Medium','Information']))}${fld('Patient / MRN',inp('Search...'))}${fld('Department',selE(DEPTS))}${fld('Bed',inp('e.g. ICU-A-01'))}${fld('Assign Doctor',selE(DOCS))}${fld('Assign Nurse',selE(NURSES))}${fld('SLA (min)',inp('5'))}</div>`,cta:'Create Alert'},
        codeblue:{t:'Trigger Code Blue',sub:'Activate cardiac arrest response',ic:'icon-alert-octagon',body:`<div class="rounded-lg p-2.5 text-xs mb-3 flex items-center gap-2" style="background:color-mix(in srgb,#1d4ed8 11%,transparent);color:#1d4ed8;border:1px solid color-mix(in srgb,#1d4ed8 30%,transparent)"><i class="icon-alert-octagon"></i> Pages the rapid response team immediately.</div><div class="grid sm:grid-cols-2 gap-3">${fld('Location / Bed',inp('e.g. ICU-A-01'))}${fld('Patient',inp('Name or "Unknown"'))}${fld('Response Team',selE(['On-call ICU','Cardiac Arrest Team','Rapid Response']))}${fld('Overhead Page',selE(['Yes','No']))}</div>`,cta:'Activate Code Blue'},
        broadcast:{t:'Emergency Broadcast',sub:'Send a hospital-wide message',ic:'icon-radio',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('Scope',selE(['Whole Hospital','ICU Zones','Department','Selected Staff']))}${fld('Priority',selE(['Emergency','Urgent','Advisory']))}</div><div class="mt-3">${fld('Message',`<textarea class="ca-in mt-1" rows="3" placeholder="Broadcast message..."></textarea>`)}</div>`,cta:'Send Broadcast'},
        escalate:{t:'Escalate Alert',sub:'Escalate to senior clinician',ic:'icon-trending-up',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('Alert',inp('ALT-...'))}${fld('Escalate To',selE(['Senior Intensivist','On-call Consultant','Department Head','Rapid Response']))}${fld('Reason',selE(['Deterioration','SLA breach risk','No response','Second opinion']))}${fld('Notify',selE(['SMS + Call','In-app','Overhead page']))}</div>`,cta:'Escalate'},
        resolve:{t:'Resolve Alert',sub:'Close the alert with an outcome',ic:'icon-circle-check',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('Outcome',selE(['Stabilized','Transferred','False Alarm','Resolved on treatment']))}${fld('Resolved By',selE(DOCS))}</div><div class="mt-3">${fld('Resolution Notes',`<textarea class="ca-in mt-1" rows="2" placeholder="Notes..."></textarea>`)}</div>`,cta:'Resolve Alert'},
        doctor:{t:'Assign Doctor',sub:'Attach a responding doctor',ic:'icon-stethoscope',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('Alert',inp('ALT-...'))}${fld('Doctor',selE(DOCS))}${fld('Role',selE(['Responder','Consultant','Team Lead']))}${fld('Notify',selE(['Call','SMS','Page']))}</div>`,cta:'Assign Doctor'},
        nurse:{t:'Assign Nurse',sub:'Attach a responding nurse',ic:'icon-user-check',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('Alert',inp('ALT-...'))}${fld('Nurse',selE(NURSES))}${fld('Ward',selE(DEPTS))}${fld('Shift',selE(['Day','Night']))}</div>`,cta:'Assign Nurse'},
        note:{t:'Clinical Notes',sub:'Document the response',ic:'icon-notebook',body:`${fld('Note Type',selE(['Response','Nursing','Clinical','Resolution']))}<div class="mt-3">${fld('Note',`<textarea class="ca-in mt-1" rows="3" placeholder="Observation..."></textarea>`)}</div>`,cta:'Save Note'},
        incident:{t:'Incident Details',sub:'Create an incident record',ic:'icon-file-plus',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('Incident ID',inp('INC-auto'))}${fld('Category',selE(['Clinical Emergency','Equipment Failure','Medication Error','Patient Safety']))}${fld('Severity',selE(['Critical','High','Medium']))}${fld('Owner',selE(DOCS))}</div><div class="mt-3">${fld('Summary',`<textarea class="ca-in mt-1" rows="2" placeholder="Incident summary..."></textarea>`)}</div>`,cta:'Create Incident'},
        settings:{t:'Alert Settings',sub:'Configure alert behaviour',ic:'icon-settings',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('Critical SLA (min)',inp('3'))}${fld('High SLA (min)',inp('7'))}${fld('Auto-escalate',selE(['On breach','Never','Manual']))}${fld('Sound Alerts',selE(['On','Off']))}</div>`,cta:'Save Settings'},
        import:{t:'Import',sub:'Bulk-load alerts or config',ic:'icon-upload',body:`<div class="flex gap-2 mb-3">${['CSV','Excel','Alert Configuration'].map(f=>`<span class="ca-npill">${f}</span>`).join('')}</div>${drop('Drop CSV / Excel file')}<button class="text-xs font-semibold text-[color:var(--ca-accent)] hover:underline mt-2"><i class="icon-download"></i> Download sample template</button><div class="mt-3 rounded-lg p-3 text-xs flex items-center gap-2" style="background:color-mix(in srgb,#15803d 11%,transparent);color:#15803d;border:1px solid color-mix(in srgb,#15803d 28%,transparent)"><i class="icon-circle-check"></i> Validation passed · 22 alerts · 0 errors</div>`,cta:'Import'},
        export:{t:'Export',sub:'Generate an incident report',ic:'icon-download',body:`<p class="text-xs ca-mut mb-2">Choose a format &amp; scope</p><div class="grid grid-cols-2 gap-2">${['CSV','Excel','PDF','Print','Critical Alert Report','Department Report','Incident Report','Selected Records','All Records'].map(f=>`<button data-expfmt="${f}" class="ca-btn ca-btn-ghost justify-center">${f}</button>`).join('')}</div>`,cta:'Export'},
    };
    const SIMPLE={patient:'Loading patient...',notify:'Team notified',progress:'Marked in progress',print:'Printing incident...',pdf:'PDF downloaded',archive:'Alert archived'};
    function openModal(key){ const m=MODALS[key]; if(!m) return; $('#ca-modalhost').innerHTML=`<div class="ca-modal-wrap open"><div class="ca-modal-bg" data-close></div><div class="ca-modal">
        <div class="ca-modal-head"><span class="ca-modal-badge"><i class="${m.ic}"></i></span><div class="min-w-0"><h3 class="font-bold ca-head leading-tight">${m.t}</h3><p class="text-[11px] ca-mut">${m.sub||''}</p></div><button data-close class="ml-auto w-8 h-8 rounded-lg hover:bg-[var(--ca-hover)] flex items-center justify-center ca-mut"><i class="icon-x"></i></button></div>
        <div class="ca-modal-body">${m.body}</div>
        <div class="ca-modal-foot"><button data-close class="ca-btn ca-btn-ghost">Cancel</button><button data-modalok="${key}" class="ca-btn ca-btn-primary"><i class="${m.ic}"></i> ${m.cta}</button></div>
    </div></div>`; document.body.style.overflow = "hidden"; }
    function openDelete(msg,onOk){ $('#ca-modalhost').innerHTML=`<div class="ca-modal-wrap open"><div class="ca-modal-bg" data-close></div><div class="ca-modal" style="width:min(420px,94vw)"><div class="p-5 text-center"><div class="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style="background:color-mix(in srgb,#dc2626 13%,transparent);color:#dc2626"><i class="icon-alert-triangle text-2xl"></i></div><h3 class="font-bold text-lg ca-head">Confirm</h3><p class="text-xs ca-mut mt-1">${msg}</p><div class="flex gap-2 mt-4"><button data-close class="ca-btn ca-btn-ghost flex-1 justify-center">Cancel</button><button id="ca-delok" class="ca-btn ca-btn-danger flex-1 justify-center">Delete</button></div></div></div></div>`; document.body.style.overflow = "hidden"; $('#ca-delok').onclick=()=>{ onOk(); closeModal(); }; }
    function closeModal(){ $('#ca-modalhost').innerHTML=''; if(!$('#ca-drawer').classList.contains('open')) document.body.style.overflow=""; }

    /* ============ HELPERS ============ */
    function updateBulk(){ $('#ca-selcount').textContent=sel.size; $('.ca-bulk').classList.toggle('show',sel.size>0); }
    function resolveAlert(id){ const a=ALERTS.find(x=>x.id===id); if(a){ a.sev='res'; a.state='Resolved'; a.col='Resolved'; } refreshAll(); toast('Alert resolved','icon-circle-check'); }
    function ackAlert(id){ const a=ALERTS.find(x=>x.id===id); if(a&&a.state==='New'){ a.state='Acknowledged'; a.col='Acknowledged'; } refreshAll(); toast('Alert acknowledged','icon-check'); }
    function refreshAll(){ renderOverview(); renderWall(); renderKanban(); updateCounts(); animateRings(); }

    /* ============ EVENTS ============ */
    document.addEventListener('click',e=>{
        if(e.target.closest('[data-sevtoggle]')){ e.target.closest('.ca-sevcol').classList.toggle('collapsed'); return; }
        if(e.target.closest('[data-collapse-all]')){ const any=$$('.ca-sevcol.collapsed').length===0; $$('.ca-sevcol').forEach(c=>c.classList.toggle('collapsed',any)); return; }
        if(e.target.closest('[data-pin]')){ const a=ALERTS.find(x=>x.id===+e.target.closest('[data-pin]').dataset.pin); if(a){a.pinned=!a.pinned;renderWall();} return; }
        if(e.target.closest('[data-quick-ack]')){ ackAlert(+e.target.closest('[data-quick-ack]').dataset.quickAck); return; }
        if(e.target.closest('[data-quick-esc]')){ const a=ALERTS.find(x=>x.id===+e.target.closest('[data-quick-esc]').dataset.quickEsc); if(a){a.state='Escalated';a.col='Escalated';} refreshAll(); toast('Alert escalated','icon-trending-up'); return; }
        if(e.target.closest('[data-quick-res]')){ resolveAlert(+e.target.closest('[data-quick-res]').dataset.quickRes); return; }
        if(e.target.closest('[data-dept-card]')){ const d=e.target.closest('[data-dept-card]').dataset.deptCard; wallDept=d; $('#ca-walldept').value=d; renderWall(); document.querySelector('#ca-wall').scrollIntoView({behavior:'smooth',block:'center'}); toast('Filtered: '+d,'icon-filter'); return; }
        const t=e.target.closest('[data-alert],[data-menu],[data-action],[data-modal],[data-modalok],[data-close],[data-bulk],[data-expfmt]');
        if(!t){ if(!e.target.closest('.ca-menu')) closeMenu(); return; }
        if(t.dataset.alert!==undefined){ openDrawer(+t.dataset.alert); return; }
        if(t.dataset.menu!==undefined){ const r=t.getBoundingClientRect(); openMenu(+t.dataset.menu,r.left-190,r.bottom+4); return; }
        if(t.dataset.action!==undefined){ const a=t.dataset.action, id=+t.dataset.aid; closeMenu();
            if(a==='view'){ openDrawer(id); }
            else if(a==='ack') ackAlert(id);
            else if(a==='resolve') resolveAlert(id);
            else if(a==='escalate'){ const al=ALERTS.find(x=>x.id===id); if(al){al.state='Escalated';al.col='Escalated';} refreshAll(); toast('Alert escalated','icon-trending-up'); }
            else if(MODALS[a]) openModal(a);
            else if(a==='delete') openDelete('Delete this alert record?',()=>{ ALERTS=ALERTS.filter(x=>x.id!==id); sel.delete(id); refreshAll(); toast('Alert deleted','icon-trash-2'); });
            else if(SIMPLE[a]) toast(SIMPLE[a]);
            return; }
        if(t.dataset.modal!==undefined){ openModal(t.dataset.modal); return; }
        if(t.dataset.modalok!==undefined){ toast(MODALS[t.dataset.modalok].cta+' — done','icon-check'); closeModal(); return; }
        if(t.dataset.expfmt!==undefined){ toast('Exported: '+t.dataset.expfmt,'icon-download'); closeModal(); return; }
        if(t.dataset.close!==undefined){ closeModal(); closeDrawer(); return; }
        if(t.dataset.bulk!==undefined){ const bk=t.dataset.bulk;
            if(bk==='delete') openDelete(`Delete ${sel.size} selected alert(s)?`,()=>{ ALERTS=ALERTS.filter(a=>!sel.has(a.id)); sel.clear(); refreshAll(); updateBulk(); toast('Alerts deleted','icon-trash-2'); });
            else if(bk==='resolve'){ ALERTS.forEach(a=>{ if(sel.has(a.id)){ a.sev='res'; a.state='Resolved'; a.col='Resolved'; } }); sel.clear(); refreshAll(); updateBulk(); toast('Alerts resolved','icon-circle-check'); }
            else { toast({ack:'Acknowledged',escalate:'Escalated',staff:'Staff assigned',export:'Exported',print:'Printing',archive:'Archived'}[bk]+' · '+sel.size+' alerts'); if(bk==='archive'){ sel.clear(); refreshAll(); updateBulk(); } }
            return; }
    });
    document.addEventListener('change',e=>{
        if(e.target.dataset.sel!==undefined){ const id=+e.target.dataset.sel; e.target.checked?sel.add(id):sel.delete(id); updateBulk(); return; }
        if(e.target.id==='ca-walldept'){ wallDept=e.target.value; renderWall(); }
    });
    document.addEventListener('input',e=>{ if(e.target.id==='ca-wallsearch'){ wallQ=e.target.value; renderWall(); } });

    function clock(){ $('#ca-clock').textContent=new Date().toLocaleTimeString('en-GB'); }

    /* ============ INIT ============ */
    // The Alert Wall / Kanban / Overview widgets / Activity feed / department
    // filter options are now written as static HTML (frozen ALERTS snapshot
    // above) instead of built here — only counts, ring animation and the
    // live clock/countdown still need JS on load.
    setTimeout(()=>{
        $('#ca-skeleton').classList.add('hidden');
        $('#ca-content').classList.remove('hidden');
        updateCounts();
        animateRings(); clock(); setInterval(clock,1000); setInterval(tickCountdown,2000);
    },1400);
})();
// ==========================================================================
// critical-care.js
// ==========================================================================
// Dreams HMS — Critical Care Unit
// Bedside-monitor board: unit telemetry, organ support matrix, NEWS2
// deterioration watch, bed board, rounds, infusions and a patient drawer.
// Static demo data only — no API, no backend.
(function () {
    "use strict";
    if ((location.pathname.split("/").pop() || "index.html") !== "critical-care.html") return;

    const $ = (id) => document.getElementById(id);

    function esc(v) {
        return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
        });
    }

    // Deterministic photo per person (same name always gets the same face)
    // picked from the shared 30-photo demo set, rather than plain initials.
    function avatarPhoto(seed) {
        let hash = 0;
        for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
        return "assets/img/avatar/avatar-" + String((hash % 30) + 1).padStart(2, "0") + ".jpg";
    }

    function detailUrl() {
        return "critical-care-detail.html";
    }

    /* ====================================================================
       Clinical scoring
       ==================================================================== */

    // NEWS2 — the UK/NHS national early warning score. Each parameter scores
    // 0-3; the aggregate drives escalation. Implemented to the published
    // thresholds rather than invented ones.
    function news2(v) {
        let s = 0;

        // Respiratory rate
        if (v.rr <= 8) s += 3;
        else if (v.rr <= 11) s += 1;
        else if (v.rr <= 20) s += 0;
        else if (v.rr <= 24) s += 2;
        else s += 3;

        // SpO2 (scale 1)
        if (v.spo2 <= 91) s += 3;
        else if (v.spo2 <= 93) s += 2;
        else if (v.spo2 <= 95) s += 1;

        // Supplemental oxygen
        if (v.o2) s += 2;

        // Systolic BP
        const sys = parseInt(v.bp, 10);
        if (sys <= 90) s += 3;
        else if (sys <= 100) s += 2;
        else if (sys <= 110) s += 1;
        else if (sys >= 220) s += 3;

        // Heart rate
        if (v.hr <= 40) s += 3;
        else if (v.hr <= 50) s += 1;
        else if (v.hr <= 90) s += 0;
        else if (v.hr <= 110) s += 1;
        else if (v.hr <= 130) s += 2;
        else s += 3;

        // Consciousness (AVPU) — anything but Alert scores 3
        if (v.avpu && v.avpu !== "A") s += 3;

        // Temperature (°F converted from the NEWS2 °C bands)
        if (v.temp <= 95.0) s += 3;
        else if (v.temp <= 96.8) s += 1;
        else if (v.temp <= 100.4) s += 0;
        else if (v.temp <= 102.2) s += 1;
        else s += 2;

        return s;
    }

    function newsBand(score) {
        if (score >= 7) return { cls: "is-critical", label: "Critical", tone: "tone-critical" };
        if (score >= 5) return { cls: "is-high", label: "High", tone: "tone-high" };
        if (score >= 3) return { cls: "is-medium", label: "Medium", tone: "tone-medium" };
        return { cls: "is-low", label: "Low", tone: "tone-stable" };
    }

    const CONDITION = {
        Critical: { badge: "badge-red", dot: "bg-danger", accent: "#ef4444", tone: "tone-critical" },
        Guarded: { badge: "badge-amber", dot: "bg-warning", accent: "#eab308", tone: "tone-high" },
        Improving: { badge: "badge-green", dot: "bg-success", accent: "#22c55e", tone: "tone-stable" },
    };

    /* ====================================================================
       Data
       ==================================================================== */

    const PATIENTS = [
        {
            bed: "ICU-01", name: "Marcus Holloway", age: 58, gender: "Male", los: 2,
            diagnosis: "Post-op haemorrhagic shock, splenectomy", condition: "Critical",
            intensivist: "Dr. Naomi Adeyemi", admitted: "From OR 3 · 11:40 AM, 15 Jul",
            vitals: { hr: 122, bp: "88/54", spo2: 91, rr: 26, temp: 96.4, avpu: "P", o2: true },
            support: { vent: true, vaso: true, crrt: false, sedation: true },
            sofa: 12, rass: -4, ventMode: "PRVC · FiO2 60% · PEEP 10",
            infusions: [
                { drug: "Noradrenaline", rate: "0.28 mcg/kg/min", tone: "tone-critical" },
                { drug: "Propofol", rate: "180 mg/hr", tone: "tone-purple" },
                { drug: "Fentanyl", rate: "120 mcg/hr", tone: "tone-purple" },
            ],
            lines: [
                { name: "Right IJ central line", day: 2, risk: false },
                { name: "Left radial arterial line", day: 2, risk: false },
                { name: "Endotracheal tube 8.0", day: 2, risk: false },
                { name: "Urinary catheter", day: 2, risk: false },
            ],
            labs: [
                { name: "Lactate", value: "4.1 mmol/L", flag: "high" },
                { name: "Hemoglobin", value: "7.8 g/dL", flag: "low" },
                { name: "Creatinine", value: "1.9 mg/dL", flag: "high" },
                { name: "Platelets", value: "88 K/µL", flag: "low" },
                { name: "pH", value: "7.28", flag: "low" },
            ],
            notes: [
                { who: "Dr. Naomi Adeyemi", role: "Intensivist", time: "09:10 AM", text: "Remains vasopressor-dependent 36 hours post-splenectomy. Lactate not clearing. Repeat CT abdomen ordered to exclude ongoing bleeding." },
            ],
            timeline: [
                { time: "15 Jul, 11:40", text: "Admitted from OR 3 post-splenectomy", state: "done" },
                { time: "15 Jul, 14:20", text: "Noradrenaline started, MAP target 65", state: "done" },
                { time: "16 Jul, 08:00", text: "Failed sedation hold — agitated, resedated", state: "done" },
                { time: "17 Jul, 09:10", text: "Repeat CT abdomen ordered", state: "current" },
            ],
        },
        {
            bed: "ICU-02", name: "Denise Okafor", age: 34, gender: "Female", los: 1,
            diagnosis: "Status asthmaticus, respiratory failure", condition: "Guarded",
            intensivist: "Dr. Rafael Contreras", admitted: "From ED · 09:31 AM, 16 Jul",
            vitals: { hr: 104, bp: "126/78", spo2: 94, rr: 22, temp: 98.6, avpu: "A", o2: true },
            support: { vent: true, vaso: false, crrt: false, sedation: true },
            sofa: 6, rass: -2, ventMode: "PS 12/5 · FiO2 35%",
            infusions: [
                { drug: "Propofol", rate: "90 mg/hr", tone: "tone-purple" },
                { drug: "Magnesium Sulfate", rate: "2 g over 20 min", tone: "tone-info" },
                { drug: "Salbutamol", rate: "10 mg/hr neb", tone: "tone-info" },
            ],
            lines: [
                { name: "Right subclavian central line", day: 1, risk: false },
                { name: "Endotracheal tube 7.5", day: 1, risk: false },
            ],
            labs: [
                { name: "pCO2", value: "48 mmHg", flag: "high" },
                { name: "pH", value: "7.34", flag: "low" },
                { name: "Potassium", value: "3.4 mmol/L", flag: "low" },
                { name: "Hemoglobin", value: "12.8 g/dL", flag: "normal" },
            ],
            notes: [
                { who: "Dr. Rafael Contreras", role: "Intensivist", time: "08:40 AM", text: "Airway pressures improving on pressure support. Tolerating weaning trial. Aiming for extubation this afternoon if ABG holds." },
            ],
            timeline: [
                { time: "16 Jul, 09:31", text: "Admitted from ED, intubated for fatigue", state: "done" },
                { time: "16 Jul, 18:00", text: "Peak pressures settling, steroids continued", state: "done" },
                { time: "17 Jul, 08:40", text: "Weaning trial — PS 12/5, tolerating", state: "current" },
            ],
        },
        {
            bed: "ICU-03", name: "Arthur Delgado", age: 71, gender: "Male", los: 1,
            diagnosis: "Ischaemic stroke, post-thrombolysis", condition: "Critical",
            intensivist: "Dr. Naomi Adeyemi", admitted: "From ED · 10:15 AM, 16 Jul",
            vitals: { hr: 88, bp: "168/92", spo2: 96, rr: 18, temp: 98.1, avpu: "V", o2: true },
            support: { vent: false, vaso: false, crrt: false, sedation: false },
            sofa: 5, rass: -1, ventMode: "—",
            infusions: [
                { drug: "Labetalol", rate: "2 mg/min", tone: "tone-critical" },
                { drug: "Normal Saline", rate: "80 mL/hr", tone: "tone-info" },
            ],
            lines: [
                { name: "Right radial arterial line", day: 1, risk: false },
                { name: "Peripheral IV x2", day: 1, risk: false },
            ],
            labs: [
                { name: "INR", value: "1.1", flag: "normal" },
                { name: "Glucose", value: "168 mg/dL", flag: "high" },
                { name: "Creatinine", value: "1.2 mg/dL", flag: "normal" },
            ],
            notes: [
                { who: "Dr. Naomi Adeyemi", role: "Intensivist", time: "07:50 AM", text: "Post-thrombolysis, no haemorrhagic conversion on repeat CT. BP tightly controlled on labetalol. Neuro obs hourly." },
            ],
            timeline: [
                { time: "16 Jul, 10:15", text: "Admitted post-thrombolysis for neuro obs", state: "done" },
                { time: "16 Jul, 22:00", text: "Repeat CT — no haemorrhagic conversion", state: "done" },
                { time: "17 Jul, 07:50", text: "Hourly neuro obs, BP target < 180", state: "current" },
            ],
        },
        {
            bed: "ICU-04", name: "Yolanda Prescott", age: 55, gender: "Female", los: 4,
            diagnosis: "Septic shock, urinary source · AKI", condition: "Critical",
            intensivist: "Dr. Rafael Contreras", admitted: "From ED · 06:20 AM, 13 Jul",
            vitals: { hr: 116, bp: "94/58", spo2: 93, rr: 24, temp: 101.8, avpu: "V", o2: true },
            support: { vent: true, vaso: true, crrt: true, sedation: true },
            sofa: 14, rass: -3, ventMode: "PRVC · FiO2 50% · PEEP 8",
            infusions: [
                { drug: "Noradrenaline", rate: "0.18 mcg/kg/min", tone: "tone-critical" },
                { drug: "Vasopressin", rate: "0.03 units/min", tone: "tone-critical" },
                { drug: "Midazolam", rate: "6 mg/hr", tone: "tone-purple" },
                { drug: "Meropenem", rate: "1 g q8h", tone: "tone-info" },
            ],
            lines: [
                { name: "Right IJ vascath (CRRT)", day: 3, risk: false },
                { name: "Left IJ central line", day: 4, risk: true },
                { name: "Endotracheal tube 7.5", day: 4, risk: false },
                { name: "Urinary catheter", day: 4, risk: true },
            ],
            labs: [
                { name: "Lactate", value: "2.8 mmol/L", flag: "high" },
                { name: "Creatinine", value: "3.4 mg/dL", flag: "high" },
                { name: "White Cell Count", value: "22.1 K/µL", flag: "high" },
                { name: "CRP", value: "284 mg/L", flag: "high" },
                { name: "Potassium", value: "5.4 mmol/L", flag: "high" },
            ],
            notes: [
                { who: "Dr. Rafael Contreras", role: "Intensivist", time: "09:05 AM", text: "Day 4 septic shock. CRRT running for AKI and hyperkalaemia. Noradrenaline requirement slowly falling. Central line day 4 — review need for replacement." },
            ],
            timeline: [
                { time: "13 Jul, 06:20", text: "Admitted from ED, septic shock", state: "done" },
                { time: "13 Jul, 09:00", text: "Intubated, noradrenaline started", state: "done" },
                { time: "14 Jul, 11:30", text: "CRRT started for AKI and hyperkalaemia", state: "done" },
                { time: "17 Jul, 09:05", text: "Weaning vasopressors, CRRT continues", state: "current" },
            ],
        },
        {
            bed: "ICU-05", name: "Harriet Nakashima", age: 59, gender: "Female", los: 1,
            diagnosis: "Flail chest, post rib fixation", condition: "Guarded",
            intensivist: "Dr. Naomi Adeyemi", admitted: "From OR 5 · 10:50 AM, 16 Jul",
            vitals: { hr: 96, bp: "112/70", spo2: 95, rr: 20, temp: 98.9, avpu: "A", o2: true },
            support: { vent: false, vaso: false, crrt: false, sedation: false },
            sofa: 4, rass: 0, ventMode: "HFNC 40 L/min · FiO2 35%",
            infusions: [
                { drug: "Fentanyl", rate: "50 mcg/hr", tone: "tone-purple" },
                { drug: "Ketamine", rate: "10 mg/hr", tone: "tone-purple" },
            ],
            lines: [
                { name: "Right chest drain", day: 1, risk: false },
                { name: "Thoracic epidural", day: 1, risk: false },
                { name: "Peripheral IV x2", day: 1, risk: false },
            ],
            labs: [
                { name: "Hemoglobin", value: "10.2 g/dL", flag: "low" },
                { name: "pO2", value: "78 mmHg", flag: "low" },
                { name: "AST", value: "142 U/L", flag: "high" },
            ],
            notes: [
                { who: "Dr. Naomi Adeyemi", role: "Intensivist", time: "08:20 AM", text: "Extubated in theatre, on HFNC. Epidural providing good analgesia — key to avoiding reintubation. Physio 4-hourly." },
            ],
            timeline: [
                { time: "16 Jul, 10:50", text: "Admitted from OR 5 post rib fixation", state: "done" },
                { time: "16 Jul, 16:00", text: "Weaned to HFNC, epidural running", state: "done" },
                { time: "17 Jul, 08:20", text: "Chest physio 4-hourly, mobilising", state: "current" },
            ],
        },
        {
            bed: "HDU-01", name: "Camila Restrepo", age: 31, gender: "Female", los: 1,
            diagnosis: "Pulmonary contusion, polytrauma", condition: "Improving",
            intensivist: "Dr. Rafael Contreras", admitted: "From ED · 09:25 AM, 16 Jul",
            vitals: { hr: 84, bp: "118/74", spo2: 97, rr: 18, temp: 98.4, avpu: "A", o2: false },
            support: { vent: false, vaso: false, crrt: false, sedation: false },
            sofa: 2, rass: 0, ventMode: "Room air",
            infusions: [{ drug: "Paracetamol", rate: "1 g q6h", tone: "tone-info" }],
            lines: [{ name: "Peripheral IV", day: 1, risk: false }],
            labs: [
                { name: "Hemoglobin", value: "12.1 g/dL", flag: "normal" },
                { name: "Lactate", value: "1.4 mmol/L", flag: "normal" },
            ],
            notes: [
                { who: "Dr. Rafael Contreras", role: "Intensivist", time: "08:05 AM", text: "Off oxygen overnight, saturations maintained on room air. Suitable for step-down to surgical ward today." },
            ],
            timeline: [
                { time: "16 Jul, 09:25", text: "Admitted from ED for respiratory monitoring", state: "done" },
                { time: "16 Jul, 20:00", text: "Weaned off oxygen", state: "done" },
                { time: "17 Jul, 08:05", text: "For step-down to surgical ward", state: "current" },
            ],
        },
        {
            bed: "HDU-02", name: "Curtis Mbeki", age: 52, gender: "Male", los: 1,
            diagnosis: "Rhabdomyolysis, crush injury", condition: "Guarded",
            intensivist: "Dr. Naomi Adeyemi", admitted: "From ED · 10:30 AM, 16 Jul",
            vitals: { hr: 92, bp: "128/78", spo2: 98, rr: 18, temp: 98.0, avpu: "A", o2: false },
            support: { vent: false, vaso: false, crrt: false, sedation: false },
            sofa: 3, rass: 0, ventMode: "Room air",
            infusions: [
                { drug: "Normal Saline", rate: "250 mL/hr", tone: "tone-info" },
                { drug: "Sodium Bicarbonate", rate: "50 mmol/L", tone: "tone-info" },
            ],
            lines: [
                { name: "Peripheral IV x2", day: 1, risk: false },
                { name: "Urinary catheter", day: 1, risk: false },
            ],
            labs: [
                { name: "Creatine Kinase", value: "18400 U/L", flag: "high" },
                { name: "Creatinine", value: "1.6 mg/dL", flag: "high" },
                { name: "Potassium", value: "5.0 mmol/L", flag: "high" },
            ],
            notes: [
                { who: "Dr. Naomi Adeyemi", role: "Intensivist", time: "07:30 AM", text: "CK peaked at 18400. Aggressive fluids with urine output target 200 mL/hr. Renal function holding — no CRRT needed so far." },
            ],
            timeline: [
                { time: "16 Jul, 10:30", text: "Admitted from ED, crush injury", state: "done" },
                { time: "16 Jul, 12:00", text: "Aggressive fluid resuscitation started", state: "done" },
                { time: "17 Jul, 07:30", text: "CK trending down, urine output adequate", state: "current" },
            ],
        },
    ];

    // Bays with no patient are open beds.
    const BAYS = ["ICU-01", "ICU-02", "ICU-03", "ICU-04", "ICU-05", "ICU-06", "HDU-01", "HDU-02", "HDU-03", "HDU-04", "HDU-05", "HDU-06"];

    const TEAM = [
        { name: "Dr. Naomi Adeyemi", role: "Consultant Intensivist", status: "On Unit", tone: "tone-stable" },
        { name: "Dr. Rafael Contreras", role: "Consultant Intensivist", status: "On Unit", tone: "tone-stable" },
        { name: "Dr. Lucia Mendel", role: "ICU Registrar", status: "In Bay 04", tone: "tone-high" },
        { name: "Priya Raghunathan, RN", role: "Charge Nurse", status: "On Unit", tone: "tone-stable" },
        { name: "Elliot Vance, RN", role: "Bedside Nurse — Bay 01", status: "In Bay 01", tone: "tone-high" },
        { name: "Marcus Ellery, RT", role: "Respiratory Therapist", status: "On Unit", tone: "tone-stable" },
    ];

    /* ====================================================================
       Derived
       ==================================================================== */

    const active = () => PATIENTS.filter((p) => !p.steppedDown);
    const scoreOf = (p) => news2(p.vitals);

    /* ====================================================================
       SVG waveforms — geometry in attributes, never inline CSS
       ==================================================================== */

    // Each parameter gets a characteristic trace, like a real monitor:
    // ECG complexes for HR, a pleth pulse for SpO2, slow waves for RR.
    const WAVES = {
        ecg: "0,16 18,16 22,16 26,10 30,22 34,16 44,16 50,3 54,29 58,16 74,16 80,14 86,18 92,16 120,16",
        pleth: "0,24 8,20 14,8 20,5 26,9 32,14 38,17 44,19 50,21 56,23 62,24 70,24 78,20 84,8 90,5 96,9 102,15 110,21 120,24",
        resp: "0,16 10,10 20,6 30,10 40,16 50,22 60,26 70,22 80,16 90,10 100,6 110,10 120,16",
        flat: "0,16 30,16 60,16 90,16 120,16",
    };

    function wave(kind) {
        return (
            '<svg class="cc-wave" viewBox="0 0 120 32" preserveAspectRatio="none" aria-hidden="true" focusable="false">' +
            '<polyline class="cc-wave-line" points="' + WAVES[kind] + '" fill="none" stroke="currentColor" stroke-width="1.5" ' +
            'stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"></polyline></svg>'
        );
    }

    /* ====================================================================
       Hero
       ==================================================================== */

    // Unit status is derived from occupancy and acuity, not hardcoded.
    function unitStatus() {
        const occ = active().length / BAYS.length;
        const critical = active().filter((p) => p.condition === "Critical").length;
        if (occ >= 0.9 || critical >= 4) return { cls: "is-critical", text: "Critical Load" };
        if (occ >= 0.5 || critical >= 2) return { cls: "is-strained", text: "Strained" };
        return { cls: "is-stable", text: "Stable" };
    }

    function renderHero() {
        const st = unitStatus();
        $("cc-status").className = "cc-status " + st.cls;
        $("cc-status-text").textContent = st.text;

        const vent = active().filter((p) => p.support.vent).length;
        const rail = [
            { label: "Occupied", value: active().length + "/" + BAYS.length, icon: "icon-bed" },
            { label: "Ventilated", value: vent, icon: "icon-wind" },
            { label: "Vasopressors", value: active().filter((p) => p.support.vaso).length, icon: "icon-heart-pulse" },
            { label: "CRRT", value: active().filter((p) => p.support.crrt).length, icon: "icon-droplets" },
            { label: "Nurse Ratio", value: "1:1", icon: "icon-users" },
        ];

        $("hero-rail").innerHTML = rail
            .map(function (r) {
                return (
                    '<div class="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-md">' +
                    '<i class="' + r.icon + ' text-white/40 text-sm" aria-hidden="true"></i>' +
                    "<div>" +
                    '<dt class="text-[9px] font-bold uppercase tracking-wider text-white/40">' + esc(r.label) + "</dt>" +
                    '<dd class="text-sm font-extrabold text-white tabular-nums">' + esc(r.value) + "</dd></div></div>"
                );
            })
            .join("");
    }

    /* ====================================================================
       Monitor widgets
       ==================================================================== */

    function avg(fn) {
        const list = active();
        return Math.round(list.reduce((s, p) => s + fn(p), 0) / list.length);
    }

    function renderMonitors() {
        const beds = active().length;
        const vent = active().filter((p) => p.support.vent).length;
        const vaso = active().filter((p) => p.support.vaso).length;
        const crrt = active().filter((p) => p.support.crrt).length;
        const deteriorating = active().filter((p) => scoreOf(p) >= 7).length;

        const mons = [
            { id: "mon-beds", label: "Occupancy", icon: "icon-bed", value: beds, unit: "/" + BAYS.length, meta: Math.round((beds / BAYS.length) * 100) + "% full", wave: "flat", varName: "--cc-hr", alarm: false },
            { id: "mon-hr", label: "Mean HR", icon: "icon-heart-pulse", value: avg((p) => p.vitals.hr), unit: "bpm", meta: "unit average", wave: "ecg", varName: "--cc-hr", alarm: false },
            { id: "mon-spo2", label: "Mean SpO2", icon: "icon-activity", value: avg((p) => p.vitals.spo2), unit: "%", meta: "unit average", wave: "pleth", varName: "--cc-spo2", alarm: avg((p) => p.vitals.spo2) < 94 },
            { id: "mon-vent", label: "Ventilated", icon: "icon-wind", value: vent, unit: "pts", meta: Math.round((vent / beds) * 100) + "% of unit", wave: "resp", varName: "--cc-rr", alarm: false },
            { id: "mon-support", label: "Vaso / CRRT", icon: "icon-droplets", value: vaso + " / " + crrt, unit: "", meta: "organ support", wave: "flat", varName: "--cc-support", alarm: false },
            { id: "mon-news", label: "NEWS2 ≥ 7", icon: "icon-trending-up", value: deteriorating, unit: "pts", meta: deteriorating ? "escalation needed" : "none rising", wave: "ecg", varName: "--cc-score", alarm: deteriorating > 0 },
        ];

        $("mon-row").innerHTML = mons
            .map(function (m) {
                return (
                    '<article class="cc-mon' + (m.alarm ? " is-alarm" : "") + '" data-accent="' + m.varName + '">' +
                    '<div class="cc-mon-head">' +
                    '<i class="' + m.icon + ' cc-mon-icon" aria-hidden="true"></i>' +
                    '<span class="cc-mon-label">' + esc(m.label) + "</span>" +
                    (m.alarm ? '<i class="icon-bell-ring cc-mon-icon ml-auto text-[11px]" aria-hidden="true"></i>' : "") +
                    "</div>" +
                    '<div class="cc-screen">' +
                    '<div class="cc-readout">' +
                    '<span class="cc-readout-value" id="' + m.id + '">' + esc(m.value) + "</span>" +
                    (m.unit ? '<span class="cc-readout-unit">' + esc(m.unit) + "</span>" : "") +
                    "</div>" +
                    '<p class="cc-readout-meta">' + esc(m.meta) + "</p>" +
                    wave(m.wave) +
                    "</div></article>"
                );
            })
            .join("");

        // Parameter colour is a CSS variable; set it via the stylesheet-driven
        // data attribute rather than an inline style.
        $("mon-row").querySelectorAll(".cc-mon").forEach(function (el) {
            el.classList.add("accent-" + el.dataset.accent.replace("--cc-", ""));
        });
    }

    /* ====================================================================
       Organ support matrix
       ==================================================================== */

    const ORGANS = [
        { key: "vent", icon: "icon-wind", label: "Ventilation" },
        { key: "vaso", icon: "icon-heart-pulse", label: "Vasopressors" },
        { key: "crrt", icon: "icon-droplets", label: "CRRT" },
        { key: "sedation", icon: "icon-pill", label: "Sedation" },
    ];

    function renderOrgans() {
        $("organ-body").innerHTML = active()
            .map(function (p) {
                const cells = ORGANS.map(function (o) {
                    const on = p.support[o.key];
                    return (
                        '<td class="hms-cell text-center"><span class="cc-organ mx-auto' + (on ? " is-on" : "") + '" ' +
                        'title="' + esc(p.name) + " — " + o.label + (on ? ": active" : ": not required") + '">' +
                        '<i class="' + o.icon + '" aria-hidden="true"></i>' +
                        '<span class="sr-only">' + o.label + (on ? " active" : " not required") + "</span></span></td>"
                    );
                }).join("");

                // SOFA 0-24; >11 predicts >80% mortality.
                const sofaTone = p.sofa >= 12 ? "tone-critical" : p.sofa >= 8 ? "tone-high" : p.sofa >= 4 ? "tone-medium" : "tone-stable";

                return (
                    '<tr class="hms-row" data-row-id="' + esc(p.bed) + '">' +
                    '<td class="hms-cell"><div class="flex items-center gap-2.5">' +
                    '<span class="hms-member-avatar size-8! ' + CONDITION[p.condition].tone + '"><img src="' + avatarPhoto(p.name) + '" alt="" loading="lazy"></span>' +
                    '<div class="min-w-0"><p class="text-xs font-bold text-gray-900 truncate">' + esc(p.name) + "</p>" +
                    '<p class="text-[10px] text-gray-400">' + esc(p.bed) + "</p></div></div></td>" +
                    cells +
                    '<td class="hms-cell"><span class="hms-chip ' + sofaTone + '">' + p.sofa + "</span></td></tr>"
                );
            })
            .join("");
    }

    /* ====================================================================
       Deterioration watch
       ==================================================================== */

    function renderDeterioration() {
        // Highest NEWS2 first — the sickest patient leads the list.
        const list = active()
            .map((p) => ({ p: p, score: scoreOf(p) }))
            .sort((a, b) => b.score - a.score);

        const rising = list.filter((x) => x.score >= 5).length;
        $("det-count").textContent = rising + " rising";

        $("det-list").innerHTML = list
            .map(function (x) {
                const b = newsBand(x.score);
                const p = x.p;
                const v = p.vitals;
                return (
                    '<li class="' + b.tone + ' rounded-xl border border-border-color dark:border-white/10 p-3 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors" data-row-id="' + esc(p.bed) + '">' +
                    '<div class="flex items-center gap-2.5">' +
                    '<span class="size-1.5 rounded-full bg-[var(--tc-accent)] shrink-0" aria-hidden="true"></span>' +
                    '<button type="button" data-open="' + esc(p.bed) + '" class="text-xs font-bold text-gray-900 hover:text-primary transition-colors truncate mr-auto">' +
                    esc(p.name) + "</button>" +
                    '<span class="cc-news ' + b.cls + '">NEWS2 ' + x.score + "</span></div>" +
                    '<p class="mt-1.5 text-[10px] font-semibold text-gray-400">' + esc(p.bed) + " · " + esc(p.diagnosis) + "</p>" +
                    '<div class="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-semibold text-gray-500 dark:text-gray-400">' +
                    "<span>HR " + v.hr + "</span><span>BP " + esc(v.bp) + "</span><span>SpO2 " + v.spo2 + "%</span>" +
                    "<span>RR " + v.rr + "</span><span>Temp " + v.temp + "°F</span>" +
                    (x.score >= 7 ? '<span class="ml-auto font-extrabold text-danger">Rapid response</span>' : "") +
                    "</div></li>"
                );
            })
            .join("");
    }

    /* ====================================================================
       Bed board
       ==================================================================== */

    function renderBeds() {
        $("bed-board").innerHTML = BAYS.map(function (bay) {
            const p = active().find((x) => x.bed === bay);

            if (!p) {
                return (
                    '<article class="cc-bay is-empty" data-row-id="' + esc(bay) + '">' +
                    '<div class="flex items-center justify-between gap-2">' +
                    '<p class="text-xs font-extrabold text-gray-400">' + esc(bay) + "</p>" +
                    '<i class="icon-plus text-gray-300 dark:text-slate-600 text-sm" aria-hidden="true"></i></div>' +
                    '<p class="mt-6 text-[10px] font-bold uppercase tracking-wide text-gray-300 dark:text-slate-600">Open</p></article>'
                );
            }

            const score = scoreOf(p);
            const b = newsBand(score);
            const supports = ORGANS.filter((o) => p.support[o.key]);

            return (
                '<article class="cc-bay ' + CONDITION[p.condition].tone + '" data-row-id="' + esc(p.bed) + '" data-open="' + esc(p.bed) + '" tabindex="0" role="button" ' +
                'aria-label="Open ' + esc(p.name) + " in " + esc(bay) + '">' +
                '<div class="flex items-center justify-between gap-2">' +
                '<p class="text-xs font-extrabold text-gray-900">' + esc(bay) + "</p>" +
                '<span class="cc-news ' + b.cls + '">' + score + "</span></div>" +
                '<p class="mt-2 text-[11px] font-bold text-gray-900 truncate">' + esc(p.name) + "</p>" +
                '<p class="text-[9px] text-gray-400 truncate">' + esc(p.diagnosis) + "</p>" +
                '<div class="mt-2 flex items-center gap-1">' +
                supports
                    .map((o) => '<i class="' + o.icon + ' text-[10px] text-[var(--tc-accent)]" title="' + o.label + '" aria-hidden="true"></i>')
                    .join("") +
                (supports.length ? "" : '<span class="text-[9px] font-bold text-gray-300 dark:text-slate-600">No support</span>') +
                '<span class="ml-auto text-[9px] font-bold text-gray-400">D' + p.los + "</span>" +
                "</div></article>"
            );
        }).join("");
    }

    /* ====================================================================
       Patient registry
       ==================================================================== */

    function renderGrid() {
        const q = $("search").value.trim().toLowerCase();
        const cond = $("filter-condition").value;
        const sup = $("filter-support").value;

        const rows = active().filter(function (p) {
            const hit = !q || p.name.toLowerCase().includes(q) || p.bed.toLowerCase().includes(q) || p.diagnosis.toLowerCase().includes(q);
            const okCond = !cond || p.condition === cond;
            const anySupport = p.support.vent || p.support.vaso || p.support.crrt;
            const okSup =
                !sup || (sup === "none" ? !anySupport : p.support[sup]);
            return hit && okCond && okSup;
        }).sort((a, b) => scoreOf(b) - scoreOf(a));

        $("grid-count").textContent = rows.length + (rows.length === 1 ? " patient" : " patients");

        if (!rows.length) {
            $("grid-body").innerHTML =
                '<tr><td colspan="9" class="py-12 text-center">' +
                '<i class="icon-search-x text-3xl text-gray-300 dark:text-slate-600" aria-hidden="true"></i>' +
                '<p class="mt-2 text-sm font-semibold text-gray-500 dark:text-gray-400">No patients match these filters</p>' +
                '<p class="text-xs text-gray-400">Try clearing the search, condition or support filter.</p></td></tr>';
            return;
        }

        $("grid-body").innerHTML = rows
            .map(function (p) {
                const score = scoreOf(p);
                const b = newsBand(score);
                const c = CONDITION[p.condition];
                const supports = ORGANS.filter((o) => p.support[o.key]);

                return (
                    '<tr class="hms-row ' + c.tone + '" data-row-id="' + esc(p.bed) + '">' +
                    '<td class="hms-cell"><a class="font-mono text-[11px] font-bold text-primary hover:underline" href="' + detailUrl() + '">' + esc(p.bed) + "</a></td>" +
                    '<td class="hms-cell"><div class="flex items-center gap-2.5">' +
                    '<span class="hms-member-avatar size-9!"><img src="' + avatarPhoto(p.name) + '" alt="" loading="lazy"></span>' +
                    '<div class="min-w-0"><p class="text-xs font-bold text-gray-900 truncate">' + esc(p.name) + "</p>" +
                    '<p class="text-[10px] text-gray-400">' + p.age + " " + esc(p.gender.charAt(0)) + "</p></div></div></td>" +
                    '<td class="hms-cell"><p class="text-xs text-gray-600 dark:text-gray-300 max-w-48 truncate" title="' + esc(p.diagnosis) + '">' + esc(p.diagnosis) + "</p></td>" +
                    '<td class="hms-cell"><span class="cc-news ' + b.cls + '">' + score + "</span>" +
                    '<p class="mt-1 text-[9px] font-bold text-gray-400">' + b.label + "</p></td>" +
                    '<td class="hms-cell"><div class="flex items-center gap-1">' +
                    (supports.length
                        ? supports.map((o) => '<span class="cc-organ is-on size-6! text-[9px]!" title="' + o.label + '"><i class="' + o.icon + '" aria-hidden="true"></i></span>').join("")
                        : '<span class="text-[10px] font-bold text-gray-300 dark:text-slate-600">None</span>') +
                    "</div></td>" +
                    '<td class="hms-cell"><p class="text-xs text-gray-600 dark:text-gray-300 truncate">' + esc(p.intensivist) + "</p></td>" +
                    '<td class="hms-cell"><span class="text-xs font-bold text-gray-900 tabular-nums">D' + p.los + "</span></td>" +
                    '<td class="hms-cell">' + MC.badge({ Critical: "badge-red", Guarded: "badge-amber", Improving: "badge-green" }, p.condition) + "</td>" +
                    '<td class="hms-cell text-right">' +
                    MC.actions(p.bed, [
                        { label: "View", icon: "icon-eye", act: "view" },
                        { label: "Add Note", icon: "icon-pen-line", act: "note" },
                        { label: "Rapid Response", icon: "icon-siren", act: "rapid", danger: true },
                        { label: "Step Down", icon: "icon-arrow-down", act: "step" },
                    ]) +
                    "</td></tr>"
                );
            })
            .join("");

        if (window.HSStaticMethods) window.HSStaticMethods.autoInit();
    }

    /* ====================================================================
       Drawer
       ==================================================================== */

    const FLAG = {
        high: { chip: "badge-red", icon: "icon-arrow-up", label: "High" },
        low: { chip: "badge-amber", icon: "icon-arrow-down", label: "Low" },
        normal: { chip: "badge-green", icon: "icon-check", label: "Normal" },
    };

    // RASS runs +4 (combative) to -5 (unrousable); 0 is calm and alert.
    function rassScale(value) {
        let steps = "";
        for (let i = 4; i >= -5; i--) {
            steps += '<span class="cc-rass-step' + (i === value ? " is-on" : "") + '" title="RASS ' + i + '"></span>';
        }
        return steps;
    }

    const RASS_LABEL = {
        "4": "Combative", "3": "Very agitated", "2": "Agitated", "1": "Restless", "0": "Alert and calm",
        "-1": "Drowsy", "-2": "Light sedation", "-3": "Moderate sedation", "-4": "Deep sedation", "-5": "Unrousable",
    };

    function telemetryTile(label, value, unit, alarm, varName) {
        return (
            '<div class="cc-screen accent-' + varName + '">' +
            '<p class="relative text-[9px] font-extrabold uppercase tracking-wider text-white/40">' + label + "</p>" +
            '<div class="cc-readout mt-0.5"><span class="cc-readout-value text-[1.3rem]!">' + value + "</span>" +
            '<span class="cc-readout-unit">' + unit + "</span></div>" +
            (alarm ? '<p class="cc-readout-meta text-danger!">Out of range</p>' : '<p class="cc-readout-meta">In range</p>') +
            "</div>"
        );
    }

    function openDrawer(bed) {
        const p = active().find((x) => x.bed === bed);
        if (!p) return;
        const score = scoreOf(p);
        const b = newsBand(score);
        const v = p.vitals;

        $("dw-avatar").innerHTML = '<img class="absolute inset-0 size-full object-cover" src="' + avatarPhoto(p.name) + '" alt="" loading="lazy">';
        $("dw-title").textContent = p.name;
        $("dw-sub").textContent = p.bed + " · " + p.age + " yrs · " + p.gender + " · Day " + p.los;

        $("dw-chips").innerHTML =
            '<span class="hms-chip ' + CONDITION[p.condition].tone + '">' + p.condition + "</span>" +
            '<span class="hms-chip ' + b.tone + '">NEWS2 ' + score + "</span>" +
            '<span class="hms-chip tone-purple">SOFA ' + p.sofa + "</span>" +
            '<span class="hms-chip tone-info">' + esc(p.diagnosis) + "</span>";

        // Telemetry — thresholds mirror the NEWS2 bands.
        $("dw-telemetry").innerHTML =
            telemetryTile("Heart Rate", v.hr, "bpm", v.hr > 90 || v.hr < 51, "hr") +
            telemetryTile("SpO2", v.spo2, "%", v.spo2 < 94, "spo2") +
            telemetryTile("Blood Pressure", v.bp, "mmHg", parseInt(v.bp, 10) <= 110, "bp") +
            telemetryTile("Resp. Rate", v.rr, "/min", v.rr > 20 || v.rr < 12, "rr");

        // Organ support
        $("dw-organ").innerHTML = ORGANS.map(function (o) {
            const on = p.support[o.key];
            const detail = o.key === "vent" ? p.ventMode : on ? "Active" : "Not required";
            return (
                '<div class="flex items-center gap-2.5 rounded-xl border border-border-color dark:border-white/10 px-3 py-2.5 ' +
                (on ? "tone-critical" : "tone-stable") + '">' +
                '<span class="cc-organ' + (on ? " is-on" : "") + '"><i class="' + o.icon + '" aria-hidden="true"></i></span>' +
                '<div class="min-w-0 flex-1"><p class="text-xs font-bold text-gray-900">' + o.label + "</p>" +
                '<p class="text-[10px] text-gray-400 truncate">' + esc(detail) + "</p></div>" +
                '<span class="badge ' + (on ? "badge-red" : "badge-gray") + '">' + (on ? "Active" : "Off") + "</span></div>"
            );
        }).join("");

        // Sedation
        $("dw-sedation").innerHTML =
            '<div class="flex items-center gap-3">' +
            '<div class="min-w-0 flex-1"><p class="text-xs font-bold text-gray-900">RASS ' + (p.rass > 0 ? "+" : "") + p.rass + "</p>" +
            '<p class="text-[10px] text-gray-400">' + RASS_LABEL[String(p.rass)] + "</p></div>" +
            '<div class="cc-rass" role="img" aria-label="Richmond Agitation-Sedation Scale: ' + p.rass + '">' + rassScale(p.rass) + "</div></div>" +
            '<p class="mt-2.5 text-[10px] text-gray-400">AVPU: <span class="font-bold text-gray-600 dark:text-gray-300">' +
            ({ A: "Alert", V: "Voice", P: "Pain", U: "Unresponsive" }[v.avpu] || v.avpu) + "</span></p>";

        // Infusions
        $("dw-infusions").innerHTML = p.infusions
            .map(function (i) {
                return (
                    '<li class="' + i.tone + ' flex items-center gap-2.5 rounded-lg border border-border-color dark:border-white/10 px-3 py-2">' +
                    '<span class="grid size-7 shrink-0 place-items-center rounded-lg bg-[color-mix(in_oklab,var(--tc-accent)_14%,transparent)] text-[var(--tc-accent)]">' +
                    '<i class="icon-syringe text-[11px]" aria-hidden="true"></i></span>' +
                    '<p class="text-xs font-bold text-gray-900 mr-auto">' + esc(i.drug) + "</p>" +
                    '<span class="text-[10px] font-extrabold text-gray-500 dark:text-gray-400 tabular-nums">' + esc(i.rate) + "</span></li>"
                );
            })
            .join("");

        // Lines & tubes — day count drives the infection-risk flag.
        $("dw-lines").innerHTML = p.lines
            .map(function (l) {
                return (
                    '<li class="flex items-center gap-2.5 rounded-lg border border-border-color dark:border-white/10 px-3 py-2">' +
                    '<i class="icon-cable text-gray-400 text-sm shrink-0" aria-hidden="true"></i>' +
                    '<p class="text-xs font-semibold text-gray-700 dark:text-gray-300 mr-auto">' + esc(l.name) + "</p>" +
                    '<span class="badge ' + (l.risk ? "badge-amber" : "badge-gray") + '">Day ' + l.day + "</span>" +
                    (l.risk ? '<span class="hms-chip tone-high"><i class="icon-triangle-alert text-[9px]" aria-hidden="true"></i>Review</span>' : "") +
                    "</li>"
                );
            })
            .join("");

        // Labs
        $("dw-labs").innerHTML = p.labs
            .map(function (l) {
                const f = FLAG[l.flag];
                return (
                    '<li class="flex items-center gap-2.5 rounded-lg border border-border-color dark:border-white/10 px-3 py-2">' +
                    '<p class="text-xs font-semibold text-gray-700 dark:text-gray-300 mr-auto">' + esc(l.name) + "</p>" +
                    '<p class="text-xs font-extrabold text-gray-900 tabular-nums">' + esc(l.value) + "</p>" +
                    '<span class="badge ' + f.chip + '"><i class="' + f.icon + ' text-[9px]" aria-hidden="true"></i>' + f.label + "</span></li>"
                );
            })
            .join("");

        // Notes
        $("dw-notes").innerHTML = p.notes
            .map(function (n) {
                return (
                    '<article class="rounded-xl border border-border-color dark:border-white/10 p-3">' +
                    '<div class="flex items-center gap-2">' +
                    '<span class="hms-member-avatar tone-info size-7!"><img src="' + avatarPhoto(n.who) + '" alt="" loading="lazy"></span>' +
                    '<div class="min-w-0 mr-auto"><p class="text-[11px] font-bold text-gray-900 truncate">' + esc(n.who) + "</p>" +
                    '<p class="text-[9px] font-semibold text-gray-400">' + esc(n.role) + "</p></div>" +
                    '<span class="text-[10px] font-bold text-gray-400 tabular-nums">' + esc(n.time) + "</span></div>" +
                    '<p class="mt-2 text-xs text-gray-600 dark:text-gray-300">' + esc(n.text) + "</p></article>"
                );
            })
            .join("");

        // Care timeline
        $("dw-timeline").innerHTML = p.timeline
            .map(function (t) {
                const state = t.state === "done" ? "is-done" : t.state === "current" ? "is-current" : "";
                return (
                    '<li class="hms-tl-item ' + state + '">' +
                    '<span class="hms-tl-node"><i class="' + (t.state === "done" ? "icon-check" : "icon-activity") + '" aria-hidden="true"></i></span>' +
                    '<div class="min-w-0 flex-1 -mt-0.5">' +
                    '<div class="flex items-center gap-2">' +
                    '<span class="text-[10px] font-bold text-gray-400 tabular-nums">' + esc(t.time) + "</span>" +
                    (t.state === "current" ? '<span class="hms-chip tone-critical">Now</span>' : "") +
                    "</div>" +
                    '<p class="mt-0.5 text-xs text-gray-600 dark:text-gray-300">' + esc(t.text) + "</p></div></li>"
                );
            })
            .join("");

        ["dw-act-escalate", "dw-act-wean", "dw-act-note", "dw-act-stepdown"].forEach(function (b) {
            $(b).dataset.bed = p.bed;
        });

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

    function openNote(bed) {
        const p = active().find((x) => x.bed === bed);
        if (!p) return;
        $("nt-sub").textContent = p.name + " · " + p.bed;
        $("nt-body").value = "";
        $("nt-save").dataset.bed = bed;
        MC.openModal("note-modal");
    }

    function openStep(bed) {
        const p = active().find((x) => x.bed === bed);
        if (!p) return;
        const score = scoreOf(p);
        const supports = ORGANS.filter((o) => o.key !== "sedation" && p.support[o.key]);

        $("st-sub").textContent = p.name + " · " + p.bed + " · NEWS2 " + score;
        $("st-notes").value = "";
        $("st-save").dataset.bed = bed;

        // Warn rather than block — the decision stays clinical.
        const reasons = [];
        if (score >= 5) reasons.push("NEWS2 is " + score + ", which is still in the " + newsBand(score).label.toLowerCase() + " band");
        if (supports.length) reasons.push("still receiving " + supports.map((o) => o.label.toLowerCase()).join(" and "));

        if (reasons.length) {
            $("st-warning-text").textContent =
                "This patient " + reasons.join(", and is ") + ". Confirm with the consultant before stepping down.";
            $("st-warning").classList.remove("hidden");
        } else {
            $("st-warning").classList.add("hidden");
        }

        MC.openModal("step-modal");
    }

    function openRapid(bed) {
        $("rr-patient").innerHTML = active()
            .map((p) => '<option value="' + esc(p.bed) + '"' + (p.bed === bed ? " selected" : "") + ">" + esc(p.name) + " (" + esc(p.bed) + ")</option>")
            .join("");
        $("rr-notes").value = "";
        MC.openModal("rapid-modal");
    }

    /* ====================================================================
       Render + wiring
       ==================================================================== */

    function renderAll() {
        renderHero();
        renderMonitors();
        renderOrgans();
        renderDeterioration();
        renderBeds();
        renderGrid();
    }

    function init() {
        document.body.insertAdjacentHTML("beforeend", MC.deleteModalHTML);

        // Hero / monitors / organ matrix / deterioration watch / bed board /
        // patient registry (and the admit modal's bed & intensivist option
        // lists) are now written directly into the HTML as static markup
        // reflecting this same PATIENTS data, so no initial renderAll() is
        // needed here — it still runs after any mutation (wean, step-down).

        // Filters
        $("search").addEventListener("input", renderGrid);
        $("filter-condition").addEventListener("change", renderGrid);
        $("filter-support").addEventListener("change", renderGrid);

        // Bed board + deterioration list open the drawer
        function delegateOpen(container) {
            $(container).addEventListener("click", function (e) {
                const t = e.target.closest("[data-open]");
                if (t) openDrawer(t.dataset.open);
            });
        }
        delegateOpen("bed-board");
        delegateOpen("det-list");

        $("bed-board").addEventListener("keydown", function (e) {
            if (e.key !== "Enter" && e.key !== " ") return;
            const t = e.target.closest("[data-open]");
            if (!t) return;
            e.preventDefault();
            openDrawer(t.dataset.open);
        });

        // Grid row actions
        $("grid-body").addEventListener("click", function (e) {
            const btn = e.target.closest("[data-act]");
            if (!btn) return;
            const bed = btn.dataset.id;
            const act = btn.dataset.act;
            if (act === "view") openDrawer(bed);
            else if (act === "note") openNote(bed);
            else if (act === "rapid") openRapid(bed);
            else if (act === "step") openStep(bed);
        });

        // Hero actions
        $("btn-admit").addEventListener("click", function () {
            $("ad-form").reset();
            MC.openModal("admit-modal");
        });
        $("btn-rapid").addEventListener("click", () => openRapid(null));
        $("btn-rounds").addEventListener("click", function () {
            MC.toast("Ward round started — " + active().length + " patients on the list.", "info");
        });
        $("btn-handover").addEventListener("click", function () {
            MC.toast("Handover sheet for " + active().length + " patients sent to the printer.", "info");
            window.print();
        });

        // Drawer
        $("dw-close").addEventListener("click", closeDrawer);
        $("dw-backdrop").addEventListener("click", closeDrawer);
        $("dw-act-escalate").addEventListener("click", function () {
            const bed = this.dataset.bed;
            closeDrawer();
            openRapid(bed);
        });
        $("dw-act-note").addEventListener("click", function () {
            const bed = this.dataset.bed;
            closeDrawer();
            openNote(bed);
        });
        $("dw-act-stepdown").addEventListener("click", function () {
            const bed = this.dataset.bed;
            closeDrawer();
            openStep(bed);
        });
        $("dw-act-wean").addEventListener("click", function () {
            const p = active().find((x) => x.bed === this.dataset.bed);
            if (!p) return;
            if (!p.support.vent) return MC.toast(p.name + " is not ventilated.", "error");
            p.support.vent = false;
            p.ventMode = "HFNC 40 L/min · FiO2 35%";
            closeDrawer();
            renderAll();
            MC.toast(p.name + " weaned to high-flow nasal cannula.", "success");
        });

        // Admit modal
        $("ad-close").addEventListener("click", () => MC.closeModal("admit-modal"));
        $("ad-cancel").addEventListener("click", () => MC.closeModal("admit-modal"));
        $("ad-save").addEventListener("click", function () {
            if (!$("ad-bed").value) return MC.toast("No critical care bed is available.", "error");
            if (!$("ad-patient").value.trim()) return MC.toast("Enter the patient name.", "error");
            if (!$("ad-diagnosis").value.trim()) return MC.toast("Enter a primary diagnosis.", "error");
            MC.closeModal("admit-modal");
            MC.toast($("ad-patient").value + " admitted to " + $("ad-bed").value + ".", "success");
        });

        // Rapid response
        $("rr-cancel").addEventListener("click", () => MC.closeModal("rapid-modal"));
        $("rr-send").addEventListener("click", function () {
            const p = active().find((x) => x.bed === $("rr-patient").value);
            MC.closeModal("rapid-modal");
            MC.toast("Rapid response called" + (p ? " for " + p.name + " (" + p.bed + ")" : "") + " — team en route.", "error");
        });

        // Note modal
        $("nt-cancel").addEventListener("click", () => MC.closeModal("note-modal"));
        $("nt-save").addEventListener("click", function () {
            const p = active().find((x) => x.bed === this.dataset.bed);
            if (!p) return;
            if (!$("nt-body").value.trim()) return MC.toast("Write the note before saving.", "error");
            p.notes.unshift({
                who: "Dr. Naomi Adeyemi", role: "Intensivist", time: "09:42 AM",
                text: $("nt-type").value + ": " + $("nt-body").value.trim(),
            });
            MC.closeModal("note-modal");
            MC.toast("Note added to " + p.name + "'s record.", "success");
        });

        // Step down
        $("st-cancel").addEventListener("click", () => MC.closeModal("step-modal"));
        $("st-save").addEventListener("click", function () {
            const p = active().find((x) => x.bed === this.dataset.bed);
            if (!p) return;
            p.steppedDown = true;
            MC.closeModal("step-modal");
            renderAll();
            MC.toast(p.name + " stepped down to " + $("st-dest").value + ". " + p.bed + " now open.", "success");
        });

        MC.initDeleteModal();
        ["admit-modal", "rapid-modal", "note-modal", "step-modal", "del-modal"].forEach(MC.closeOnBackdrop);

        document.addEventListener("keydown", function (e) {
            if (e.key !== "Escape") return;
            closeDrawer();
            ["admit-modal", "rapid-modal", "note-modal", "step-modal", "del-modal"].forEach(MC.closeModal);
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
// ==========================================================================
// diet.js
// ==========================================================================
(function () {
if ((location.pathname.split("/").pop() || "index.html") !== "diet.html") return;
const SBADGE = {
    Active: "text-success bg-success/10",
    "On Hold": "text-warning bg-warning/10",
    Completed: "text-gray-900 bg-light/60",
};
const TBADGE = {
    Diabetic: "text-warning bg-warning/10",
    Cardiac: "text-danger bg-danger/10",
    "Weight Loss": "text-success bg-success/10",
    Renal: "text-primary bg-primary/10",
    "High Protein": "text-purple bg-purple/10",
    Liquid: "text-gray-900 bg-light/60",
    General: "text-primary bg-primary/10",
};
let data = [
    {
        id: 1,
        patient: "James Morrison",
        type: "Cardiac",
        ward: "Cardiology - A101",
        dietitian: "Dr. Nadia Ahmed",
        cal: 1800,
        date: "2024-12-01",
        status: "Active",
        meals: "3",
        notes: "Low sodium, low fat, no fried food",
    },
    {
        id: 2,
        patient: "Robert Clark",
        type: "Liquid",
        ward: "ICU - 01",
        dietitian: "Dr. Nadia Ahmed",
        cal: 1200,
        date: "2024-12-03",
        status: "Active",
        meals: "6",
        notes: "Post-op, IV + oral liquids only",
    },
    {
        id: 3,
        patient: "Emily Johnson",
        type: "High Protein",
        ward: "Maternity - MW01",
        dietitian: "Dr. Pita",
        cal: 2400,
        date: "2024-11-29",
        status: "Completed",
        meals: "5",
        notes: "Post-delivery recovery",
    },
    {
        id: 4,
        patient: "David Torres",
        type: "General",
        ward: "Surgical - SW05",
        dietitian: "Dr. Nadia Ahmed",
        cal: 2000,
        date: "2024-12-04",
        status: "Active",
        meals: "3",
        notes: "Post knee surgery",
    },
    {
        id: 5,
        patient: "Michael Harris",
        type: "Cardiac",
        ward: "Geriatrics - G03",
        dietitian: "Dr. Pita",
        cal: 1600,
        date: "2024-12-01",
        status: "Active",
        meals: "4",
        notes: "Low potassium, no salt",
    },
    {
        id: 6,
        patient: "Linda Nguyen",
        type: "Renal",
        ward: "Oncology - OW02",
        dietitian: "Dr. Nadia Ahmed",
        cal: 1900,
        date: "2024-12-05",
        status: "Active",
        meals: "3",
        notes: "Chemotherapy dietary support",
    },
    {
        id: 7,
        patient: "Carlos Vega",
        type: "Liquid",
        ward: "ICU - 04",
        dietitian: "Dr. Pita",
        cal: 1000,
        date: "2024-12-10",
        status: "Active",
        meals: "6",
        notes: "NPO, progressing to liquids",
    },
    {
        id: 8,
        patient: "Helen Yu",
        type: "Diabetic",
        ward: "Neurology - N01",
        dietitian: "Dr. Nadia Ahmed",
        cal: 1700,
        date: "2024-12-09",
        status: "On Hold",
        meals: "4",
        notes: "Stroke patient — awaiting swallow assessment",
    },
];
let nextId = 9,
    editingId = null;
function rowHTML(r) {
    return `<tr><td class="font-medium text-gray-900">${r.patient}</td><td><span class="inline-block px-2 py-1 text-xs font-semibold rounded-lg whitespace-nowrap ${TBADGE[r.type] || "text-gray-900 bg-light/60"}">${r.type}</span></td><td class="text-gray-500 dark:text-gray-400 text-sm">${r.ward}</td><td class="text-gray-500 dark:text-gray-400 text-sm">${r.dietitian}</td><td class="font-semibold text-gray-900">${r.cal} kcal</td><td class="text-gray-500 dark:text-gray-400 text-sm max-w-xs truncate">${r.notes || "—"}</td><td class="text-gray-500 dark:text-gray-400 text-sm">${r.date}</td><td><span class="inline-block px-2 py-1 text-xs font-semibold rounded-lg whitespace-nowrap ${SBADGE[r.status] || "text-gray-900 bg-light/60"}">${r.status}</span></td><td><div class="flex gap-1"><button onclick="openEdit(${r.id})" class="p-1.5 size-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400" title="Edit"><i class="icon-edit text-base"></i></button><button onclick="deleteRecord(${r.id},'${r.patient}')" class="p-1.5 size-7 flex items-center justify-center rounded hover:bg-danger/20 dark:hover:bg-red-900/20 text-danger" title="Delete"><i class="icon-trash-2 text-base"></i></button></div></td></tr>`;
}
function updateStats() {
    document.getElementById("stat-total").textContent = data.filter(
        (r) => r.status === "Active",
    ).length;
    document.getElementById("stat-diabetic").textContent = data.filter(
        (r) => r.type === "Diabetic",
    ).length;
    document.getElementById("stat-cardiac").textContent = data.filter(
        (r) => r.type === "Cardiac",
    ).length;
    document.getElementById("stat-other").textContent = data.filter(
        (r) => !["Diabetic", "Cardiac"].includes(r.type),
    ).length;
}
function render(q = "", type = "") {
    const visible = new Set(
        data
            .filter((r) => {
                const m = q
                    ? r.patient.toLowerCase().includes(q.toLowerCase()) ||
                      r.type.toLowerCase().includes(q.toLowerCase())
                    : true;
                return m && (type ? r.type === type : true);
            })
            .map((r) => r.id),
    );
    const tbody = document.getElementById("tbody");
    let shown = 0;
    tbody.querySelectorAll("[data-row-id]").forEach((tr) => {
        const isVisible = visible.has(Number(tr.dataset.rowId));
        tr.classList.toggle("hidden", !isVisible);
        if (isVisible) shown++;
    });
    const empty = document.getElementById("tbody-empty");
    if (empty) empty.classList.toggle("hidden", shown !== 0);
    document.getElementById("count").textContent =
        `${shown} of ${data.length}`;
    updateStats();
}
function openAdd() {
    editingId = null;
    document.getElementById("m-title").textContent = "New Diet Plan";
    document.getElementById("btn-save").textContent = "Save Plan";
    document.getElementById("m-form").reset();
    document.getElementById("f-date").value = new Date()
        .toISOString()
        .split("T")[0];
    MC.openModal("form-modal");
}
function openEdit(id) {
    const r = data.find((x) => x.id === id);
    editingId = id;
    document.getElementById("m-title").textContent = "Edit Diet Plan";
    document.getElementById("btn-save").textContent = "Update";
    document.getElementById("f-patient").value = r.patient;
    document.getElementById("f-type").value = r.type;
    document.getElementById("f-ward").value = r.ward;
    document.getElementById("f-dietitian").value = r.dietitian;
    document.getElementById("f-cal").value = r.cal;
    document.getElementById("f-date").value = r.date;
    document.getElementById("f-status").value = r.status;
    document.getElementById("f-meals").value = r.meals;
    document.getElementById("f-notes").value = r.notes;
    MC.openModal("form-modal");
}
function saveRecord() {
    const patient = document.getElementById("f-patient").value.trim();
    if (!patient) {
        MC.toast("Patient name required", "error");
        return;
    }
    const rec = {
        patient,
        type: document.getElementById("f-type").value,
        ward: document.getElementById("f-ward").value.trim(),
        dietitian: document.getElementById("f-dietitian").value.trim(),
        cal: parseInt(document.getElementById("f-cal").value) || 1800,
        date: document.getElementById("f-date").value,
        status: document.getElementById("f-status").value,
        meals: document.getElementById("f-meals").value,
        notes: document.getElementById("f-notes").value.trim(),
    };
    const tbody = document.getElementById("tbody");
    if (editingId) {
        const idx = data.findIndex((x) => x.id === editingId);
        data[idx] = { ...data[idx], ...rec };
        const existing = tbody.querySelector(
            `[data-row-id="${editingId}"]`,
        );
        if (existing) existing.outerHTML = rowHTML(data[idx]);
        MC.toast("Plan updated", "success");
    } else {
        const newRecord = { id: nextId++, ...rec };
        data.push(newRecord);
        tbody.insertAdjacentHTML("beforeend", rowHTML(newRecord));
        MC.toast("Diet plan created", "success");
    }
    MC.closeModal("form-modal");
    render(
        document.getElementById("search").value,
        document.getElementById("filter-type").value,
    );
}
function deleteRecord(id, name) {
    MC.confirmDelete(name, () => {
        data = data.filter((x) => x.id !== id);
        const el = document.querySelector(
            `#tbody [data-row-id="${id}"]`,
        );
        if (el) el.remove();
        render(
            document.getElementById("search").value,
            document.getElementById("filter-type").value,
        );
        MC.toast("Plan removed", "success");
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
                document.getElementById("filter-type").value,
            ),
        );
    document
        .getElementById("filter-type")
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
// emergency-call-detail.js
// ==========================================================================
document.addEventListener('DOMContentLoaded', function () {
  if (document.body.dataset.page !== 'emergency-call-detail') return;

  var $ = function (id) { return document.getElementById(id); };
  var params = new URLSearchParams(window.location.search);
  var pick = function (key, fallback) { var v = params.get(key); return v && v.length ? v : fallback; };

  var r = {
    id: pick('id', '1'),
    caller: pick('caller', 'Susan Blake'),
    location: pick('location', '42 Elm Street'),
    vehicle: pick('vehicle', 'AMB-101'),
    time: pick('time', '2024-12-06 14:32'),
    status: pick('status', 'Completed'),
  };

  var BADGE = {
    Dispatched: 'text-warning bg-warning/10',
    'En Route': 'text-primary bg-primary/10',
    Completed: 'text-success bg-success/10',
  };

  var callId = '#EC-' + String(r.id).padStart(5, '0');

  $('ecd-caller').textContent = r.caller;
  $('ecd-status-badge').textContent = r.status;
  $('ecd-call-id').textContent = callId;
  $('ecd-hero-location').textContent = r.location;
  $('ecd-hero-vehicle').textContent = r.vehicle;
  $('ecd-hero-time').textContent = r.time;

  $('ecd-stat-vehicle').textContent = r.vehicle;
  $('ecd-stat-location').textContent = r.location;
  $('ecd-stat-time').textContent = r.time;
  $('ecd-stat-status').textContent = r.status;
  $('ecd-stat-status').className = 'mt-3 inline-flex w-fit items-center px-3 py-1.5 rounded-lg text-sm font-extrabold ' + (BADGE[r.status] || 'text-gray-700 bg-gray-100');

  $('ecd-info-caller').textContent = r.caller;
  $('ecd-info-location').textContent = r.location;
  $('ecd-info-vehicle').textContent = r.vehicle;
  $('ecd-info-time').textContent = r.time;
  $('ecd-info-status').textContent = r.status;

  $('ecd-side-vehicle').textContent = r.vehicle;

  $('ecd-kv-caller').textContent = r.caller;
  $('ecd-kv-location').textContent = r.location;
  $('ecd-kv-vehicle').textContent = r.vehicle;
  $('ecd-kv-time').textContent = r.time;

  document.title = 'Emergency Call — ' + callId + ' — Dreams HMS';

  // ---- Dispatch workflow timeline ----
  var STAGES = ['Dispatched', 'En Route', 'Completed'];
  var STAGE_ICON = ['icon-siren', 'icon-navigation', 'icon-check-circle'];
  var idx = STAGES.indexOf(r.status);
  var reachedIndex = idx === -1 ? 0 : idx;

  $('ecd-timeline').innerHTML = STAGES.map(function (label, i) {
    var state = i < reachedIndex ? 'done' : i === reachedIndex ? 'current' : '';
    var when = i <= reachedIndex ? r.time : 'Pending';
    return '<div class="ecd-tl-item ' + state + '"><span class="ecd-tl-node"><i class="' + STAGE_ICON[i] + '"></i></span>' +
      '<p class="text-sm font-bold text-gray-900 dark:text-white">' + label + '</p>' +
      '<p class="text-xs text-gray-500 dark:text-gray-400">' + when + '</p></div>';
  }).join('');

  // ---- Actions ----
  $('ecd-callback-btn').onclick = function () {};
});
// ==========================================================================
// emergency-dashboard.js
// ==========================================================================
// Dreams HMS — Emergency Dashboard
// Live triage board: queue, beds, alerts, ambulances, admissions, physicians.
// Static demo data only — no API, no backend.
(function () {
    "use strict";
    if ((location.pathname.split("/").pop() || "index.html") !== "emergency-dashboard.html") return;

    const $ = (id) => document.getElementById(id);

    function esc(v) {
        return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
        });
    }

    function avatarSrc(seed) {
        let h = 0;
        const s = String(seed);
        for (let i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) >>> 0; }
        const n = (h % 30) + 1;
        return "assets/img/avatar/avatar-" + String(n).padStart(2, "0") + ".jpg";
    }

    /* --- Data ----------------------------------------------------------- */

    const QUEUE = [
        { id: "ER-4821", name: "Marcus Holloway", age: 58, gender: "Male", triage: 1, complaint: "Chest pain, ST elevation on ECG", wait: 2, status: "In Treatment", arrival: "09:38 AM", mode: "EMS — Medic 12", vitals: "BP 88/54 · HR 122 · SpO2 91%", allergies: "Penicillin", doctor: "Dr. Sarah Chen" },
        { id: "ER-4822", name: "Denise Okafor", age: 34, gender: "Female", triage: 2, complaint: "Severe asthma exacerbation", wait: 8, status: "In Treatment", arrival: "09:31 AM", mode: "Walk-in", vitals: "BP 132/86 · HR 108 · SpO2 89%", allergies: "None known", doctor: "Dr. Michael Reyes" },
        { id: "ER-4823", name: "Arthur Delgado", age: 71, gender: "Male", triage: 2, complaint: "Sudden left-sided weakness, slurred speech", wait: 5, status: "Awaiting Bed", arrival: "09:34 AM", mode: "EMS — Medic 07", vitals: "BP 178/96 · HR 88 · SpO2 96%", allergies: "Sulfa drugs", doctor: "Dr. Priya Nair" },
        { id: "ER-4824", name: "Kaitlyn Brewer", age: 27, gender: "Female", triage: 3, complaint: "Right lower quadrant abdominal pain", wait: 24, status: "Waiting", arrival: "09:15 AM", mode: "Walk-in", vitals: "BP 118/74 · HR 96 · Temp 100.8°F", allergies: "Latex", doctor: "Unassigned" },
        { id: "ER-4825", name: "Terrence Whitfield", age: 45, gender: "Male", triage: 3, complaint: "Laceration to left forearm, work injury", wait: 31, status: "In Triage", arrival: "09:08 AM", mode: "Walk-in", vitals: "BP 128/80 · HR 84 · SpO2 99%", allergies: "None known", doctor: "Dr. Elena Vasquez" },
        { id: "ER-4826", name: "Rosalind Pierce", age: 63, gender: "Female", triage: 3, complaint: "Syncopal episode at home", wait: 19, status: "Waiting", arrival: "09:20 AM", mode: "EMS — Medic 03", vitals: "BP 104/62 · HR 58 · SpO2 97%", allergies: "Codeine", doctor: "Unassigned" },
        { id: "ER-4827", name: "Julian Alvarez", age: 8, gender: "Male", triage: 4, complaint: "Fever and sore throat, 3 days", wait: 42, status: "Waiting", arrival: "08:57 AM", mode: "Walk-in", vitals: "HR 104 · Temp 102.1°F · SpO2 98%", allergies: "None known", doctor: "Unassigned" },
        { id: "ER-4828", name: "Bernadette Cho", age: 52, gender: "Female", triage: 4, complaint: "Ankle sprain, unable to bear weight", wait: 47, status: "Waiting", arrival: "08:52 AM", mode: "Walk-in", vitals: "BP 124/78 · HR 76", allergies: "Ibuprofen", doctor: "Unassigned" },
        { id: "ER-4829", name: "Grant Sutherland", age: 39, gender: "Male", triage: 5, complaint: "Prescription refill, chronic back pain", wait: 63, status: "Waiting", arrival: "08:36 AM", mode: "Walk-in", vitals: "BP 130/82 · HR 72", allergies: "None known", doctor: "Unassigned" },
    ];

    const ALERTS = [
        { id: "AL-01", title: "STEMI activation — Bay 1", body: "12-lead confirms anterior ST elevation for Marcus Holloway (ER-4821). Cath lab notified, door-to-balloon clock started at 09:38.", time: "09:41 AM", level: "critical", icon: "icon-heart-pulse" },
        { id: "AL-02", title: "Stroke alert — Bay 4", body: "Arthur Delgado (ER-4823) last known well 08:50. CT suite on standby, neurology paged for thrombolysis window.", time: "09:36 AM", level: "critical", icon: "icon-brain" },
        { id: "AL-03", title: "Sepsis screen positive", body: "Kaitlyn Brewer (ER-4824) meets 2 of 3 qSOFA criteria. Lactate ordered, one-hour bundle initiated.", time: "09:29 AM", level: "urgent", icon: "icon-thermometer" },
        { id: "AL-04", title: "ER at 88% occupancy", body: "Only 3 of 40 bays remain open, with 2 more in cleaning. Charge nurse advised to begin diversion protocol for non-trauma arrivals.", time: "09:22 AM", level: "urgent", icon: "icon-triangle-alert" },
        { id: "AL-05", title: "O-negative blood low", body: "Blood bank reports 4 units of O-negative remaining. Restock requested from regional supply.", time: "09:04 AM", level: "warning", icon: "icon-droplet" },
    ];

    const ALERT_STYLE = {
        critical: { dot: "bg-danger", text: "text-danger", chip: "badge-red", label: "Critical" },
        urgent: { dot: "bg-warning", text: "text-warning", chip: "badge-amber", label: "Urgent" },
        warning: { dot: "bg-info", text: "text-info", chip: "badge-blue", label: "Advisory" },
    };

    const ZONES = [
        { name: "Resuscitation", icon: "icon-heart-pulse", total: 6, occupied: 5, cleaning: 1 },
        { name: "Acute Care", icon: "icon-activity", total: 18, occupied: 16, cleaning: 1 },
        { name: "Observation", icon: "icon-eye", total: 10, occupied: 9, cleaning: 0 },
        { name: "Fast Track", icon: "icon-zap", total: 6, occupied: 5, cleaning: 0 },
    ];

    const AMBULANCES = [
        { unit: "Medic 12", status: "Inbound", crew: "R. Santiago, T. Boyd", eta: "Arrived 09:38", patient: "58 M — chest pain, STEMI", dest: "Resuscitation Bay 1", miles: "0.0 mi" },
        { unit: "Medic 07", status: "Inbound", crew: "K. Duffy, M. Ansari", eta: "4 min", patient: "71 M — suspected CVA", dest: "Resuscitation Bay 2", miles: "1.8 mi" },
        { unit: "Medic 03", status: "At Scene", crew: "L. Moreau, D. Pratt", eta: "12 min", patient: "63 F — syncope", dest: "Acute Care", miles: "6.2 mi" },
        { unit: "Medic 18", status: "Available", crew: "J. Whitaker, S. Lin", eta: "—", patient: "None", dest: "Station 4", miles: "3.1 mi" },
        { unit: "Medic 21", status: "Out of Service", crew: "Unassigned", eta: "—", patient: "None", dest: "Maintenance bay", miles: "0.4 mi" },
    ];

    const ADMISSIONS = [
        { name: "Marcus Holloway", id: "ER-4821", time: "09:40 AM", ward: "Cardiac ICU / 302", doctor: "Dr. Sarah Chen", condition: "Critical" },
        { name: "Arthur Delgado", id: "ER-4823", time: "09:35 AM", ward: "Neuro ICU / 118", doctor: "Dr. Priya Nair", condition: "Critical" },
        { name: "Denise Okafor", id: "ER-4822", time: "09:33 AM", ward: "Pulmonary / 214", doctor: "Dr. Michael Reyes", condition: "Serious" },
        { name: "Harold Nakamura", id: "ER-4816", time: "08:47 AM", ward: "General Med / 407", doctor: "Dr. Elena Vasquez", condition: "Stable" },
        { name: "Simone Ferraro", id: "ER-4814", time: "08:12 AM", ward: "Ortho / 221", doctor: "Dr. James Whitlock", condition: "Stable" },
        { name: "Cedric Lawson", id: "ER-4811", time: "07:35 AM", ward: "Observation / 09", doctor: "Dr. Elena Vasquez", condition: "Stable" },
    ];

    const CONDITION_BADGE = { Critical: "badge-red", Serious: "badge-amber", Stable: "badge-green" };

    const DOCTORS = [
        { name: "Dr. Sarah Chen", role: "Attending — Emergency Medicine", status: "With Patient", load: 4, since: "07:00 AM" },
        { name: "Dr. Michael Reyes", role: "Attending — Pulmonology", status: "With Patient", load: 3, since: "07:00 AM" },
        { name: "Dr. Priya Nair", role: "Attending — Neurology", status: "On Call", load: 2, since: "08:15 AM" },
        { name: "Dr. Elena Vasquez", role: "Resident — Emergency Medicine", status: "Available", load: 1, since: "07:00 AM" },
        { name: "Dr. James Whitlock", role: "Attending — Orthopedics", status: "In Surgery", load: 2, since: "06:30 AM" },
        { name: "Dr. Amara Osei", role: "Resident — Pediatrics", status: "Available", load: 0, since: "09:00 AM" },
        { name: "Dr. Thomas Rivas", role: "Attending — Trauma Surgery", status: "Off Shift", load: 0, since: "19:00 PM" },
    ];

    const DOC_STATUS = {
        Available: { badge: "badge-green", dot: "bg-success" },
        "With Patient": { badge: "badge-amber", dot: "bg-warning" },
        "On Call": { badge: "badge-blue", dot: "bg-info" },
        "In Surgery": { badge: "badge-purple", dot: "bg-purple" },
        "Off Shift": { badge: "badge-gray", dot: "bg-gray-400" },
    };

    /* --- Derived figures ------------------------------------------------ */

    const totalBeds = ZONES.reduce((s, z) => s + z.total, 0);
    const occupiedBeds = ZONES.reduce((s, z) => s + z.occupied, 0);
    const cleaningBeds = ZONES.reduce((s, z) => s + z.cleaning, 0);
    const freeBeds = totalBeds - occupiedBeds - cleaningBeds;
    const critical = QUEUE.filter((p) => p.triage <= 2).length;
    const avgWait = Math.round(QUEUE.reduce((s, p) => s + p.wait, 0) / QUEUE.length);
    const inbound = AMBULANCES.filter((a) => a.status === "Inbound").length;
    const onDuty = DOCTORS.filter((d) => d.status !== "Off Shift").length;
    const occupancyPct = Math.round((occupiedBeds / totalBeds) * 100);

    /* --- KPIs ----------------------------------------------------------- */

    function renderKpis() {
        MC.erKpis($("kpi-row"), [
            { id: "kpi-queue", icon: "icon-users", label: "In Queue", tone: "info", live: "Live", pct: Math.round((QUEUE.length / totalBeds) * 100), meta: "of " + totalBeds + " bays", ecg: true },
            { id: "kpi-critical", icon: "icon-heart-pulse", label: "Critical (ESI 1–2)", tone: "critical", live: "Live", pct: Math.round((critical / QUEUE.length) * 100), meta: "of queue", ecg: true },
            { id: "kpi-wait", icon: "icon-clock", label: "Avg Wait Time", unit: "min", tone: "urgent", pct: Math.min(100, Math.round((avgWait / 60) * 100)), meta: "target 30 min", ecg: true },
            { id: "kpi-beds", icon: "icon-bed", label: "Beds Available", tone: freeBeds <= 3 ? "critical" : "stable", pct: occupancyPct, meta: occupiedBeds + " occupied", ecg: true },
            { id: "kpi-ambulance", icon: "icon-ambulance", label: "Ambulances Inbound", tone: "purple", live: inbound > 0 ? "En route" : "", pct: Math.round((inbound / AMBULANCES.length) * 100), meta: AMBULANCES.length + " units tracked", ecg: true },
            { id: "kpi-doctors", icon: "icon-stethoscope", label: "Physicians On Duty", tone: "slate", pct: Math.round((onDuty / DOCTORS.length) * 100), meta: DOCTORS.length + " on roster", ecg: true },
        ]);

        $("kpi-queue").textContent = QUEUE.length;
        $("kpi-critical").textContent = critical;
        $("kpi-wait").textContent = avgWait;
        $("kpi-beds").textContent = freeBeds;
        $("kpi-ambulance").textContent = inbound;
        $("kpi-doctors").textContent = onDuty;
    }

    /* --- Critical Alerts ------------------------------------------------ */

    // The alert cards are already in the HTML (data-row-id="AL-xx" per
    // alert), so acknowledging one just hides its card instead of rebuilding
    // the whole list; the "All alerts acknowledged" placeholder is a real
    // (initially hidden) <li> that gets revealed once none remain visible.
    function renderAlerts() {
        let anyVisible = false;
        document.querySelectorAll("#alerts-list [data-row-id]").forEach(function (li) {
            const a = ALERTS.find((x) => x.id === li.dataset.rowId);
            const show = !!a && !a.acked;
            li.classList.toggle("hidden", !show);
            if (show) anyVisible = true;
        });
        const empty = $("alerts-empty");
        if (empty) empty.classList.toggle("hidden", anyVisible);
    }

    /* --- Bed Availability ----------------------------------------------- */

    function renderBeds() {
        $("beds-zones").innerHTML = ZONES.map(function (z) {
            const free = z.total - z.occupied - z.cleaning;
            const pct = Math.round((z.occupied / z.total) * 100);

            // One dot per bay: occupied -> cleaning -> available.
            let dots = "";
            for (let i = 0; i < z.total; i++) {
                const cls =
                    i < z.occupied ? "bg-danger" : i < z.occupied + z.cleaning ? "bg-warning" : "bg-success";
                const label = i < z.occupied ? "Occupied" : i < z.occupied + z.cleaning ? "Cleaning" : "Available";
                dots += '<span class="size-3 rounded-sm ' + cls + '" title="' + z.name + " bay " + (i + 1) + " — " + label + '"></span>';
            }

            return (
                '<div class="rounded-xl border border-border-color p-4">' +
                '<div class="flex items-center gap-2">' +
                '<i class="' + z.icon + ' text-gray-400"></i>' +
                '<p class="font-semibold text-sm text-gray-900 mr-auto">' + esc(z.name) + "</p>" +
                '<span class="badge ' + (free === 0 ? "badge-red" : free <= 1 ? "badge-amber" : "badge-green") + '">' +
                free + " free</span></div>" +
                '<div class="mt-3 flex flex-wrap gap-1" role="img" aria-label="' + z.name + ": " + z.occupied + " occupied, " + z.cleaning + " cleaning, " + free + ' available">' +
                dots + "</div>" +
                '<p class="mt-3 text-[11px] font-medium text-gray-400">' + z.occupied + " of " + z.total + " bays occupied · " + pct + "%</p>" +
                "</div>"
            );
        }).join("");
    }

    /* --- Recent Admissions ---------------------------------------------- */

    function renderAdmissions() {
        $("admissions-body").innerHTML = ADMISSIONS.map(function (a) {
            return (
                "<tr>" +
                '<td><div class="flex items-center gap-3">' +
                '<img src="' + avatarSrc(a.id) + '" alt="" class="avatar object-cover ring-2 ring-purple/30">' +
                '<div><p class="font-semibold text-gray-900">' + esc(a.name) + "</p>" +
                '<p class="text-xs text-gray-400">' + esc(a.id) + "</p></div></div></td>" +
                '<td><span class="text-sm text-gray-600 dark:text-gray-300 tabular-nums">' + esc(a.time) + "</span></td>" +
                '<td><span class="text-sm text-gray-600 dark:text-gray-300">' + esc(a.ward) + "</span></td>" +
                '<td><span class="text-sm text-gray-600 dark:text-gray-300">' + esc(a.doctor) + "</span></td>" +
                "<td>" + MC.badge(CONDITION_BADGE, a.condition) + "</td></tr>"
            );
        }).join("");
    }

    /* --- Doctor Availability -------------------------------------------- */

    function doctorPhoto(i) { return "assets/img/doctor/doctor-" + String((i % 30) + 1).padStart(2, "0") + ".jpg"; }

    function renderDoctors() {
        $("doctors-list").innerHTML = DOCTORS.map(function (d, i) {
            const s = DOC_STATUS[d.status];
            return (
                '<li class="p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-colors">' +
                '<span class="relative shrink-0">' +
                '<img class="avatar object-cover" src="' + doctorPhoto(i) + '" alt="" loading="lazy">' +
                '<span class="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-white dark:border-slate-800 ' + s.dot + '" aria-hidden="true"></span>' +
                "</span>" +
                '<div class="min-w-0 flex-1">' +
                '<p class="font-semibold text-sm text-gray-900 truncate">' + esc(d.name) + "</p>" +
                '<p class="text-xs text-gray-400 truncate">' + esc(d.role) + "</p></div>" +
                '<div class="text-right shrink-0">' +
                '<span class="badge ' + s.badge + '">' + esc(d.status) + "</span>" +
                '<p class="mt-1 text-[10px] font-semibold text-gray-500 dark:text-gray-400">' +
                (d.status === "Off Shift" ? "Since " + esc(d.since) : d.load + " patient" + (d.load === 1 ? "" : "s")) +
                "</p></div></li>"
            );
        }).join("");
    }

    /* --- Modals --------------------------------------------------------- */

    function row(term, value) {
        return (
            "<div><dt class=\"text-xs font-medium text-gray-400\">" + term + "</dt>" +
            '<dd class="mt-0.5 text-sm font-semibold text-gray-900">' + value + "</dd></div>"
        );
    }

    function openAlert(id) {
        const a = ALERTS.find((x) => x.id === id);
        if (!a) return;
        $("am-title").textContent = a.title;
        $("am-time").textContent = ALERT_STYLE[a.level].label + " · raised " + a.time;
        $("am-body").textContent = a.body;
        $("am-note").value = "";
        $("am-ack").dataset.id = a.id;
        MC.openModal("alert-modal");
    }

    /* --- Wiring --------------------------------------------------------- */

    function init() {
        // KPI row, alert cards, bed zones, admissions table, doctor list and
        // the code-blue patient dropdown are already written into the HTML
        // as static markup for this same data, so nothing needs building
        // here — renderAlerts()/renderBeds()/etc. still run after a real
        // mutation (acknowledge, ack-all).

        $("alerts-list").addEventListener("click", function (e) {
            const btn = e.target.closest("[data-alert]");
            if (btn) openAlert(btn.dataset.alert);
        });

        $("btn-refresh").addEventListener("click", function () {
            renderAlerts();
            MC.toast("Board refreshed — data current as of 09:42 AM.", "info");
        });

        $("btn-handover").addEventListener("click", function () {
            MC.toast("Shift handover report sent to the printer.", "info");
            window.print();
        });

        $("btn-ack-all").addEventListener("click", function () {
            const open = ALERTS.filter((a) => !a.acked);
            if (!open.length) return MC.toast("No open alerts to acknowledge.", "info");
            open.forEach((a) => (a.acked = true));
            renderAlerts();
            MC.toast(open.length + " alerts acknowledged.", "success");
        });

        // Alert modal
        $("am-cancel").addEventListener("click", () => MC.closeModal("alert-modal"));
        $("am-ack").addEventListener("click", function () {
            const a = ALERTS.find((x) => x.id === this.dataset.id);
            if (a) a.acked = true;
            MC.closeModal("alert-modal");
            renderAlerts();
            MC.toast("Alert acknowledged.", "success");
        });

        // Code Blue
        $("btn-code-blue").addEventListener("click", () => MC.openModal("code-modal"));
        $("cb-cancel").addEventListener("click", () => MC.closeModal("code-modal"));
        $("cb-activate").addEventListener("click", function () {
            MC.closeModal("code-modal");
            MC.toast("Code Blue activated at " + $("cb-location").value + ". Team paged.", "error");
            $("cb-details").value = "";
        });

        ["alert-modal", "code-modal"].forEach(MC.closeOnBackdrop);

        // Escape closes whichever modal is open.
        document.addEventListener("keydown", function (e) {
            if (e.key !== "Escape") return;
            ["alert-modal", "code-modal"].forEach(MC.closeModal);
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
// ==========================================================================
// emergency.js
// ==========================================================================
(function () {
if ((location.pathname.split("/").pop() || "index.html") !== "emergency.html") return;
const pad = (n) => "#ER-" + String(n).padStart(4, "0");
const detailUrl = (r) => "emergency-detail.html?" + new URLSearchParams({ id: r.id, patient: r.patient, complaint: r.complaint, triage: r.triage, status: r.status }).toString();
const TBADGE = {
    "Red (Critical)": "text-danger bg-danger/10",
    "Orange (Urgent)": "text-warning bg-warning/10",
    "Yellow (Semi-urgent)": "text-info bg-info/10",
    "Green (Non-urgent)": "text-success bg-success/10",
};
const SBADGE = {
    Waiting: "text-warning bg-warning/10",
    "In Treatment": "text-primary bg-primary/10",
    Admitted: "text-purple bg-purple/10",
    Discharged: "text-success bg-success/10",
};
const now = () => {
    const d = new Date();
    return d.toISOString().slice(0, 16);
};
let data = [
    {
        id: 1,
        patient: "Carlos Vega",
        agegen: "52/M",
        complaint: "Severe chest pain, sweating",
        triage: "Red (Critical)",
        doctor: "Dr. Tom Rivas",
        arrival: "2024-12-10T08:15",
        status: "In Treatment",
        notes: "Suspected MI",
    },
    {
        id: 2,
        patient: "Diana Park",
        agegen: "34/F",
        complaint: "Difficulty breathing, high fever",
        triage: "Orange (Urgent)",
        doctor: "Dr. Sarah Chen",
        arrival: "2024-12-10T09:00",
        status: "In Treatment",
        notes: "",
    },
    {
        id: 3,
        patient: "Brian Lee",
        agegen: "28/M",
        complaint: "Deep laceration on forearm",
        triage: "Yellow (Semi-urgent)",
        doctor: "Dr. Alice Mills",
        arrival: "2024-12-10T09:30",
        status: "Waiting",
        notes: "",
    },
    {
        id: 4,
        patient: "Sophie Turner",
        agegen: "19/F",
        complaint: "Allergic reaction, hives",
        triage: "Orange (Urgent)",
        doctor: "Dr. James Park",
        arrival: "2024-12-10T10:00",
        status: "Admitted",
        notes: "Anaphylaxis — epinephrine given",
    },
    {
        id: 5,
        patient: "Mark Davis",
        agegen: "67/M",
        complaint: "Fall, suspected hip fracture",
        triage: "Orange (Urgent)",
        doctor: "Dr. Felix Osei",
        arrival: "2024-12-10T10:45",
        status: "Waiting",
        notes: "",
    },
    {
        id: 6,
        patient: "Aisha Kofi",
        agegen: "8/F",
        complaint: "High fever, seizure",
        triage: "Red (Critical)",
        doctor: "Dr. James Park",
        arrival: "2024-12-10T11:00",
        status: "In Treatment",
        notes: "Febrile seizure — pediatric emergency",
    },
    {
        id: 7,
        patient: "Peter Walsh",
        agegen: "45/M",
        complaint: "Minor burn on hand",
        triage: "Green (Non-urgent)",
        doctor: "Dr. Tom Rivas",
        arrival: "2024-12-10T11:30",
        status: "Discharged",
        notes: "",
    },
    {
        id: 8,
        patient: "Hannah Cruz",
        agegen: "38/F",
        complaint: "Abdominal pain",
        triage: "Yellow (Semi-urgent)",
        doctor: "Dr. Li Wang",
        arrival: "2024-12-10T12:00",
        status: "Waiting",
        notes: "",
    },
];
let nextId = 9,
    editingId = null;
function rowHTML(r) {
    return `<tr><td class="text-primary font-mono text-sm"><a href="${detailUrl(r)}">${pad(r.id)}</a></td><td><p class="font-medium text-gray-900">${r.patient}</p><p class="text-xs text-gray-400">${r.agegen}</p></td><td class="text-gray-600 dark:text-gray-300 max-w-xs">${r.complaint}</td><td><span class="inline-block px-2 py-1 text-xs font-semibold rounded-lg whitespace-nowrap ${TBADGE[r.triage] || "text-gray-900 bg-light/60"} text-xs">${r.triage}</span></td><td class="text-gray-500 dark:text-gray-400 text-sm">${r.doctor}</td><td class="text-gray-500 dark:text-gray-400 text-sm">${r.arrival.replace("T", " ")}</td><td><span class="inline-block px-2 py-1 text-xs font-semibold rounded-lg whitespace-nowrap ${SBADGE[r.status] || "text-gray-900 bg-light/60"}">${r.status}</span></td><td><div class="flex gap-1"><button onclick="openEdit(${r.id})" class="p-1.5 size-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400" title="Edit"><i class="icon-edit text-base"></i></button><button onclick="deleteRecord(${r.id},'${r.patient}')" class="p-1.5 size-7 flex items-center justify-center rounded hover:bg-danger/20 dark:hover:bg-red-900/20 text-danger" title="Close"><i class="icon-trash-2 text-base"></i></button></div></td></tr>`;
}
function updateStats() {
    document.getElementById("stat-total").textContent = data.filter(
        (r) => r.status !== "Discharged",
    ).length;
    document.getElementById("stat-critical").textContent = data.filter(
        (r) => r.triage === "Red (Critical)" && r.status !== "Discharged",
    ).length;
    document.getElementById("stat-urgent").textContent = data.filter(
        (r) => r.triage === "Orange (Urgent)" && r.status !== "Discharged",
    ).length;
    document.getElementById("stat-stable").textContent = data.filter(
        (r) =>
            ["Green (Non-urgent)", "Yellow (Semi-urgent)"].includes(r.triage) ||
            r.status === "Discharged",
    ).length;
}
function render(q = "", triage = "", status = "") {
    const visible = new Set(
        data
            .filter((r) => {
                const m = q
                    ? r.patient.toLowerCase().includes(q.toLowerCase()) ||
                      r.complaint.toLowerCase().includes(q.toLowerCase())
                    : true;
                return (
                    m &&
                    (triage ? r.triage === triage : true) &&
                    (status ? r.status === status : true)
                );
            })
            .map((r) => r.id),
    );
    const tbody = document.getElementById("tbody");
    let shown = 0;
    tbody.querySelectorAll("[data-row-id]").forEach((tr) => {
        const isVisible = visible.has(Number(tr.dataset.rowId));
        tr.classList.toggle("hidden", !isVisible);
        if (isVisible) shown++;
    });
    const empty = document.getElementById("tbody-empty");
    if (empty) empty.classList.toggle("hidden", shown !== 0);
    document.getElementById("count").textContent =
        `${shown} of ${data.length}`;
    if (typeof lucide !== "undefined" && typeof lucide.createIcons === "function") {

    }
    updateStats();
}
function openAdd() {
    editingId = null;
    document.getElementById("m-title").textContent = "Register Emergency Case";
    document.getElementById("btn-save").textContent = "Register";
    document.getElementById("m-form").reset();
    document.getElementById("f-arrival").value = now();
    MC.openModal("form-modal");
}
function openEdit(id) {
    const r = data.find((x) => x.id === id);
    editingId = id;
    document.getElementById("m-title").textContent = "Edit Case";
    document.getElementById("btn-save").textContent = "Update";
    document.getElementById("f-patient").value = r.patient;
    document.getElementById("f-agegen").value = r.agegen;
    document.getElementById("f-complaint").value = r.complaint;
    document.getElementById("f-triage").value = r.triage;
    document.getElementById("f-doctor").value = r.doctor;
    document.getElementById("f-arrival").value = r.arrival;
    document.getElementById("f-status").value = r.status;
    document.getElementById("f-notes").value = r.notes;
    MC.openModal("form-modal");
}
function saveRecord() {
    const patient = document.getElementById("f-patient").value.trim();
    const complaint = document.getElementById("f-complaint").value.trim();
    if (!patient) {
        MC.toast("Patient name required", "error");
        return;
    }
    if (!complaint) {
        MC.toast("Complaint required", "error");
        return;
    }
    const rec = {
        patient,
        agegen: document.getElementById("f-agegen").value.trim(),
        complaint,
        triage: document.getElementById("f-triage").value,
        doctor: document.getElementById("f-doctor").value.trim(),
        arrival: document.getElementById("f-arrival").value,
        status: document.getElementById("f-status").value,
        notes: document.getElementById("f-notes").value.trim(),
    };
    const tbody = document.getElementById("tbody");
    if (editingId) {
        const idx = data.findIndex((x) => x.id === editingId);
        data[idx] = { ...data[idx], ...rec };
        const existing = tbody.querySelector(
            `[data-row-id="${editingId}"]`,
        );
        if (existing) existing.outerHTML = rowHTML(data[idx]);
        MC.toast("Case updated", "success");
    } else {
        const newRecord = { id: nextId++, ...rec };
        data.push(newRecord);
        tbody.insertAdjacentHTML("beforeend", rowHTML(newRecord));
        MC.toast("Emergency case registered", "success");
    }
    MC.closeModal("form-modal");
    render(
        document.getElementById("search").value,
        document.getElementById("filter-triage").value,
        document.getElementById("filter-status").value,
    );
}
function deleteRecord(id, name) {
    MC.confirmDelete(name, () => {
        data = data.filter((x) => x.id !== id);
        const el = document.querySelector(
            `#tbody [data-row-id="${id}"]`,
        );
        if (el) el.remove();
        render(
            document.getElementById("search").value,
            document.getElementById("filter-triage").value,
            document.getElementById("filter-status").value,
        );
        MC.toast("Case closed", "success");
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
                document.getElementById("filter-triage").value,
                document.getElementById("filter-status").value,
            ),
        );
    document
        .getElementById("filter-triage")
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
                document.getElementById("filter-triage").value,
                e.target.value,
            ),
        );
    MC.initDeleteModal();
    MC.closeOnBackdrop("form-modal");
    MC.closeOnBackdrop("del-modal");
    if (typeof lucide !== "undefined") {
        updateStats();
    } else {
        window.addEventListener("load", () => {
            updateStats();
        });
    }
});

})();
// ==========================================================================
// emr-dashboard.js
// ==========================================================================
(function(){
    "use strict";
    if ((location.pathname.split("/").pop() || "index.html") !== "emr-dashboard.html") return;
    const $=(s,r)=>(r||document).querySelector(s);
    const $$=(s,r)=>Array.from((r||document).querySelectorAll(s));
    const page=$('#em-page');
    const mix=(c,n)=>`color-mix(in srgb, ${c} ${n}%, transparent)`;
    const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

    let toastT;
    function toast(msg,icon){ const t=$('#em-toast'); t.innerHTML=`<i class="ti ${icon||'ti-check'} text-emerald-400"></i> ${msg}`; t.classList.add('show'); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove('show'),2500); }

    /* ============ DATA ============ */
    const DEPTS=['Cardiology','Neurology','Orthopedics','Oncology','Pediatrics','Emergency','Nephrology','Pulmonology'];
    const DOCTORS=['Dr. A. Mehta','Dr. S. Kapoor','Dr. R. Nair','Dr. L. Khan','Dr. P. Rao','Dr. M. Iyer'];
    const DIAG=['Acute MI','Ischemic Stroke','Pneumonia','Type 2 Diabetes','Fracture — Femur','Sepsis','CKD Stage 3','COPD Exacerbation','Hypertension','Appendicitis'];
    const STATUS=['Admitted','Under Treatment','Observation','Discharged'];
    const RISK=['High','Medium','Low'];
    const BLOOD=['O+','A+','B+','AB+','O-','A-'];
    const AVC=['#6366f1','#0ea5e9','#10b981','#f59e0b','#ef4444','#a855f7','#ec4899','#14b8a6'];
    const FIRST=['Rahul','Anita','Vikram','Priya','Suresh','Meera','Arjun','Kavya','Deepak','Neha','Rohan','Sana','Manoj','Divya','Karan','Pooja'];
    const LAST=['Sharma','Reddy','Nair','Patel','Gupta','Singh','Menon','Das','Joshi','Verma'];
    const ALLERG=[['Penicillin'],['Sulfa','Latex'],[],['Peanuts'],['Aspirin'],[]];

    function mk(i){
        const name=FIRST[i%FIRST.length]+' '+LAST[(i*3)%LAST.length];
        const risk=RISK[i%3===0?0:(i%2?1:2)];
        return { id:i, mrn:'MRN-'+(10400+i), name, age:18+((i*7)%70), gender:i%2?'Male':'Female',
            blood:BLOOD[i%BLOOD.length], doc:DOCTORS[i%DOCTORS.length], dept:DEPTS[i%DEPTS.length],
            diag:DIAG[i%DIAG.length], allerg:ALLERG[i%ALLERG.length], risk,
            status:STATUS[i%STATUS.length], critical:risk==='High'&&i%3===0, adm:`Jul ${1+(i%18)}, 2026`,
            updated:`${(i%12)+1}h ago`, av:AVC[i%AVC.length] };
    }
    let PAT=Array.from({length:24},(_,i)=>mk(i));

    /* ============ STATE ============ */
    const state={ view:'dashboard', q:'', dept:'', status:'', risk:'', sort:'', sel:new Set(),
        cols:{mrn:1,patient:1,doctor:1,dept:1,diag:1,adm:1,status:1,critical:1} };

    function filtered(){
        let r=PAT.filter(p=>{
            if(state.q){ const q=state.q.toLowerCase(); if(!(p.name.toLowerCase().includes(q)||p.mrn.toLowerCase().includes(q)||p.diag.toLowerCase().includes(q)||p.doc.toLowerCase().includes(q))) return false; }
            if(state.dept && p.dept!==state.dept) return false;
            if(state.status && p.status!==state.status) return false;
            if(state.risk && p.risk!==state.risk) return false;
            return true;
        });
        if(state.sort==='name') r.sort((a,b)=>a.name.localeCompare(b.name));
        else if(state.sort==='mrn') r.sort((a,b)=>a.mrn.localeCompare(b.mrn));
        else if(state.sort==='risk'){ const o={High:0,Medium:1,Low:2}; r.sort((a,b)=>o[a.risk]-o[b.risk]); }
        return r;
    }
    function detailUrl(p){ return 'emr-record-detail.html?id='+p.id+'&mrn='+encodeURIComponent(p.mrn)+'&name='+encodeURIComponent(p.name)+'&age='+p.age+'&gender='+encodeURIComponent(p.gender)+'&blood='+encodeURIComponent(p.blood)+'&doc='+encodeURIComponent(p.doc)+'&dept='+encodeURIComponent(p.dept)+'&diag='+encodeURIComponent(p.diag)+'&risk='+encodeURIComponent(p.risk)+'&status='+encodeURIComponent(p.status); }
    const riskColor=r=>r==='High'?'#ef4444':r==='Medium'?'#f59e0b':'#22c55e';
    const statusB=s=>({Admitted:'em-b-info','Under Treatment':'em-b-warn',Observation:'em-b-info',Discharged:'em-b-ok'}[s]||'em-b-info');
    function avatar(p,sz){ sz=sz||36; return `<span class="em-av" style="width:${sz}px;height:${sz}px;background:${p.av};font-size:${sz*.36}px">${p.name.split(' ').map(n=>n[0]).join('').slice(0,2)}</span>`; }

    /* ============ KPI ============ */
    const KPIS=[
        {t:'Total Patient Records',v:12480,suf:'',p:88,c:'#6366f1',c2:'#818cf8',ic:'ti-folders',chip:'+124 today',spark:[110,116,120,122,124,123,125]},
        {t:'Active Admissions',v:418,suf:'',p:82,c:'#0ea5e9',c2:'#38bdf8',ic:'ti-bed',chip:'82% beds',spark:[380,392,400,405,410,415,418]},
        {t:'Critical Patients',v:6,suf:'',p:24,c:'#ef4444',c2:'#f87171',ic:'ti-urgent',chip:'ICU monitored',spark:[9,8,7,7,6,6,6]},
        {t:'Completed Consultations',v:1842,suf:'',p:74,c:'#22c55e',c2:'#4ade80',ic:'ti-stethoscope',chip:'+8% vs avg',spark:[1500,1600,1680,1720,1790,1820,1842]},
        {t:'Pending Lab Results',v:57,suf:'',p:46,c:'#f59e0b',c2:'#fbbf24',ic:'ti-flask',chip:'12 critical',spark:[70,66,63,60,59,58,57]},
        {t:"Today's Clinical Notes",v:326,suf:'',p:68,c:'#a855f7',c2:'#c084fc',ic:'ti-notes',chip:'+42 last hr',spark:[240,260,280,300,312,320,326]},
    ];
    function sparkPts(a,w,h){ const mn=Math.min(...a),mx=Math.max(...a),rg=(mx-mn)||1; return a.map((v,i)=>`${(i/(a.length-1))*w},${h-((v-mn)/rg)*h}`).join(' '); }
    function renderKPIs(){
        $('#em-kpis').innerHTML=KPIS.map(k=>`
          <div class="em-kpi" style="--k1:${k.c};--k2:${k.c2}">
            <div class="glow"></div>
            <div class="flex items-start justify-between">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background:${mix(k.c,15)};color:${k.c}"><i class="ti ${k.ic} text-lg"></i></div>
              <div class="relative w-11 h-11"><svg viewBox="0 0 36 36" class="em-ring w-11 h-11"><circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--color-gray-200)" stroke-width="3.2"/><circle class="bar" cx="18" cy="18" r="15.9" fill="none" stroke="${k.c}" stroke-width="3.2" stroke-linecap="round" pathLength="100" style="--p:${k.p}"/></svg><span class="absolute inset-0 flex items-center justify-center text-[9px] font-bold" style="color:${k.c}">${k.p}%</span></div>
            </div>
            <p class="text-2xl font-bold mt-3 em-count" data-to="${k.v}">0</p>
            <p class="text-xs em-muted">${k.t}</p>
            <div class="flex items-center justify-between mt-2"><span class="em-b" style="background:${mix(k.c,12)};color:${k.c}">${k.chip}</span><svg width="52" height="18" viewBox="0 0 52 18" class="overflow-visible"><polyline points="${sparkPts(k.spark,52,18)}" fill="none" stroke="${k.c}" stroke-width="1.6" stroke-linecap="round"/></svg></div>
          </div>`).join('');
    }
    function animateCounts(){ $$('.em-count').forEach(el=>{ const to=+el.dataset.to,st=performance.now(); (function step(t){ const p=Math.min(1,(t-st)/1000); el.textContent=Math.round(to*(1-Math.pow(1-p,3))).toLocaleString('en-IN'); if(p<1)requestAnimationFrame(step); })(st); }); }
    function animateRings(){ $$('.em-ring .bar').forEach(b=>{ const p=b.style.getPropertyValue('--p'); b.style.setProperty('--p','0'); requestAnimationFrame(()=>requestAnimationFrame(()=>b.style.setProperty('--p',p))); }); }

    /* ============ EXEC WIDGETS ============ */
    function area(id,data,color){ const el=$(id); if(!el)return; const w=260,h=+id.includes('flow')?90:80; const pts=sparkPts(data,w,h-10); el.innerHTML=`<defs><linearGradient id="g${id.slice(1)}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${color}" stop-opacity=".35"/><stop offset="100%" stop-color="${color}" stop-opacity="0"/></linearGradient></defs><polygon points="0,${h} ${pts} ${w},${h}" fill="url(#g${id.slice(1)})"/><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round"/>`; }
    function bars(id,rows){ $(id).innerHTML=rows.map(r=>`<div><div class="flex justify-between text-[11px] mb-1"><span class="font-medium">${r[0]}</span><span class="em-muted">${r[1]}${r[3]||''}</span></div><div class="em-barwrap"><span style="width:${r[1]}%;background:${r[2]}"></span></div></div>`).join(''); }
    function renderExec(){
        area('#em-flow',[40,52,48,66,60,72,68,80],'#14b8a6');
        area('#em-activity-chart',[30,45,40,55,50,68,60,72],'#6366f1');
        area('#em-adm',[20,26,24,30,28,34,32,38],'#0ea5e9');
        // donut
        const seg=[['Cardiac',28,'#ef4444'],['Neuro',22,'#a855f7'],['Respiratory',18,'#0ea5e9'],['Metabolic',17,'#f59e0b'],['Other',15,'#22c55e']];
        let off=0; $('#em-donut').innerHTML=`<circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--color-gray-200)" stroke-width="3.6"/>`+seg.map(s=>{ const c=`<circle cx="18" cy="18" r="15.9" fill="none" stroke="${s[2]}" stroke-width="3.6" stroke-dasharray="${s[1]} ${100-s[1]}" stroke-dashoffset="${-off}" pathLength="100"/>`; off+=s[1]; return c; }).join('');
        $('#em-donut-legend').innerHTML=seg.map(s=>`<div class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full" style="background:${s[2]}"></span><span class="flex-1">${s[0]}</span><span class="em-muted font-semibold">${s[1]}%</span></div>`).join('');
        bars('#em-deptperf',[['Cardiology',92,'#ef4444','%'],['Neurology',86,'#a855f7','%'],['Oncology',78,'#0ea5e9','%'],['Pediatrics',71,'#22c55e','%']]);
        bars('#em-workload',[['Dr. Mehta',88,'#6366f1',' pts'],['Dr. Kapoor',74,'#0ea5e9',' pts'],['Dr. Nair',65,'#10b981',' pts'],['Dr. Khan',58,'#f59e0b',' pts']]);
        bars('#em-treat',[['Recovering',64,'#22c55e','%'],['Stable',52,'#0ea5e9','%'],['Under Obs.',38,'#f59e0b','%'],['Critical',12,'#ef4444','%']]);
    }

    /* ============ DASHBOARD CONTENT ============ */
    function renderSummary(){
        const crit=PAT.filter(p=>p.critical).slice(0,4);
        $('#em-summary').innerHTML=`
          <div class="em-card p-4 sm:col-span-2">
            <div class="flex items-center justify-between mb-3"><h3 class="text-sm font-bold flex items-center gap-1.5"><i class="ti ti-urgent text-rose-500"></i> Critical Cases</h3><span class="em-b em-b-danger">${crit.length} active</span></div>
            <div class="grid sm:grid-cols-2 gap-2.5">
              ${crit.map(p=>`<button data-drawer="${p.id}" class="flex items-center gap-2.5 rounded-xl border em-hairline p-2.5 text-left hover:shadow-md transition w-full">
                ${avatar(p,38)}<div class="min-w-0 flex-1"><p class="text-sm font-semibold truncate">${p.name}</p><p class="text-[11px] em-muted truncate">${p.diag} · ${p.dept}</p></div>
                <span class="em-b em-b-danger">High</span></button>`).join('')}
            </div>
          </div>`;
    }
    function renderRecent(){
        $('#em-recent').innerHTML=PAT.slice(0,5).map(p=>`<button data-drawer="${p.id}" class="flex items-center gap-2.5 w-full text-left hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg p-1.5 transition">${avatar(p,32)}<div class="min-w-0 flex-1"><p class="text-sm font-medium truncate">${p.name}</p><p class="text-[11px] em-muted">${p.mrn} · ${p.dept}</p></div><span class="text-[11px] em-muted">${p.adm}</span></button>`).join('');
        $('#em-reviews').innerHTML=PAT.slice(5,10).map(p=>`<div class="flex items-center gap-2.5"><span class="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center"><i class="ti ti-clipboard-text"></i></span><div class="min-w-0 flex-1"><p class="text-sm font-medium truncate">${p.name}</p><p class="text-[11px] em-muted">${p.doc}</p></div><button data-drawer="${p.id}" class="text-[11px] font-semibold text-[var(--em-c)] hover:underline">Review</button></div>`).join('');
    }
    function renderLabRadio(){
        const lab=[['Pending','57','#f59e0b','ti-clock'],['Completed','284','#22c55e','ti-check'],['Critical','12','#ef4444','ti-alert-triangle'],['Avg TAT','2.4h','#0ea5e9','ti-timeline']];
        $('#em-lab').innerHTML=lab.map(l=>`<div class="rounded-xl border em-hairline p-2.5"><div class="flex items-center gap-1.5 text-[11px] em-muted"><i class="ti ${l[3]}" style="color:${l[2]}"></i> ${l[0]}</div><p class="text-lg font-bold mt-0.5">${l[1]}</p></div>`).join('');
        const rad=[['X-Ray','Completed','#22c55e'],['CT Scan','In Progress','#f59e0b'],['MRI','Scheduled','#0ea5e9'],['Ultrasound','Reported','#22c55e'],['PET Scan','Pending','#a855f7']];
        $('#em-radio').innerHTML=rad.map(r=>`<div class="flex items-center gap-2.5"><span class="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center"><i class="ti ti-radioactive" style="color:${r[2]}"></i></span><div class="flex-1"><p class="text-sm font-medium">${r[0]}</p></div><span class="em-b" style="background:${mix(r[2],14)};color:${r[2]}">${r[1]}</span></div>`).join('');
    }
    function renderMeds(){
        const meds=[['Active Prescriptions','842','ti-prescription','#6366f1'],['Medication Schedule','On track','ti-calendar-time','#22c55e'],['Refill Needed','23','ti-refresh-alert','#f59e0b'],['Expiring Soon','9','ti-alarm','#ef4444'],['Drug Allergies','flagged','ti-alert-hexagon','#a855f7']];
        $('#em-meds').innerHTML=meds.map(m=>`<div class="flex items-center gap-2.5"><span class="w-8 h-8 rounded-lg flex items-center justify-center" style="background:${mix(m[3],14)};color:${m[3]}"><i class="ti ${m[2]}"></i></span><div class="flex-1"><p class="text-sm font-medium">${m[0]}</p></div><span class="text-sm font-bold">${m[1]}</span></div>`).join('');
    }
    function renderDocs(){
        const d=[['Dr. A. Mehta','Cardiology',18,4.9,'Available'],['Dr. S. Kapoor','Neurology',14,4.7,'In Surgery'],['Dr. R. Nair','Orthopedics',11,4.8,'Available'],['Dr. L. Khan','Oncology',9,4.6,'On Round']];
        $('#em-docs').innerHTML=d.map((x,i)=>`<div class="flex items-center gap-2.5"><span class="em-av" style="width:34px;height:34px;background:${AVC[i]};font-size:12px">${x[0].split(' ').map(n=>n[0]).join('').slice(1,3)}</span><div class="min-w-0 flex-1"><p class="text-sm font-medium truncate">${x[0]}</p><p class="text-[11px] em-muted">${x[1]} · ${x[2]} pts today</p></div><div class="text-right"><span class="em-b em-b-warn"><i class="ti ti-star text-[9px]"></i> ${x[3]}</span><p class="text-[10px] mt-0.5" style="color:${x[4]==='Available'?'#22c55e':'#f59e0b'}">${x[4]}</p></div></div>`).join('');
    }
    const NOTES=[
        {t:'SOAP',pt:'Rahul Sharma',doc:'Dr. Mehta',time:'10m ago',pin:1,txt:'S: Chest pain radiating to left arm. O: BP 148/92, ECG ST-elevation. A: Acute MI. P: Aspirin, cath lab.'},
        {t:'Progress',pt:'Anita Reddy',doc:'Dr. Kapoor',time:'32m ago',pin:0,txt:'Neuro status improving, GCS 14. Continue thrombolytics protocol, monitor hourly.'},
        {t:'Nursing',pt:'Vikram Nair',doc:'Nurse J.',time:'1h ago',pin:0,txt:'Vitals stable. Pain 3/10. Dressing changed. IV fluids running at 80ml/hr.'},
        {t:'Surgical',pt:'Priya Patel',doc:'Dr. Nair',time:'2h ago',pin:1,txt:'ORIF femur completed. Blood loss 250ml. Hemodynamically stable post-op.'},
        {t:'Follow-up',pt:'Suresh Gupta',doc:'Dr. Khan',time:'3h ago',pin:0,txt:'Chemo cycle 3 tolerated well. Next review in 2 weeks. CBC ordered.'},
        {t:'Progress',pt:'Meera Singh',doc:'Dr. Rao',time:'4h ago',pin:0,txt:'Respiratory rate normalized. Weaning off oxygen. Ambulating with assistance.'},
    ];
    function renderNotes(){
        const tab=state.notetab||'All', q=(state.noteq||'').toLowerCase();
        const list=NOTES.filter(n=>(tab==='All'||n.t===tab)&&(!q||n.pt.toLowerCase().includes(q)||n.txt.toLowerCase().includes(q)));
        $('#em-notes').innerHTML=list.length?list.map((n,i)=>`
          <div class="rounded-xl border em-hairline p-3 hover:shadow-md transition">
            <div class="flex items-center justify-between mb-1.5"><span class="em-b em-b-info">${n.t}</span><div class="flex items-center gap-1"><button data-notepin="${i}" class="w-6 h-6 rounded hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center justify-center"><i class="ti ${n.pin?'ti-pin text-[var(--em-c)]':'ti-pin em-muted'} text-sm"></i></button><button class="w-6 h-6 rounded hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center justify-center"><i class="ti ti-star em-muted text-sm"></i></button></div></div>
            <p class="text-sm font-semibold">${n.pt}</p><p class="text-[11px] em-muted mb-1.5">${n.doc} · ${n.time}</p>
            <p class="text-xs em-muted line-clamp-2">${n.txt}</p>
          </div>`).join(''):`<p class="text-sm em-muted col-span-2 text-center py-4">No notes found.</p>`;
    }
    function renderAlerts(){
        const a=[['Critical Patients',6,'#ef4444','ti-urgent'],['Medication',14,'#f59e0b','ti-pill'],['Allergy',8,'#a855f7','ti-alert-hexagon'],['Lab Alerts',12,'#0ea5e9','ti-flask'],['Emergency',3,'#dc2626','ti-ambulance'],['Infection',5,'#14b8a6','ti-virus']];
        $('#em-alerts').innerHTML=a.map(x=>`<div class="rounded-xl border em-hairline p-2.5 flex items-center gap-2"><span class="w-8 h-8 rounded-lg flex items-center justify-center flex-none" style="background:${mix(x[2],14)};color:${x[2]}"><i class="ti ${x[3]}"></i></span><div><p class="text-lg font-bold leading-none">${x[1]}</p><p class="text-[10px] em-muted">${x[0]}</p></div></div>`).join('');
    }
    function renderRisk(){
        const r=[['High Risk',6,'#ef4444'],['Medium Risk',38,'#f59e0b'],['Low Risk',204,'#22c55e']];
        const tot=248;
        $('#em-risk').innerHTML=r.map(x=>`<div><div class="flex justify-between text-xs mb-1"><span class="font-medium flex items-center gap-1.5"><span class="w-2 h-2 rounded-full" style="background:${x[2]}"></span>${x[0]}</span><span class="em-muted">${x[1]}</span></div><div class="em-barwrap"><span style="width:${Math.round(x[1]/tot*100)}%;background:${x[2]}"></span></div></div>`).join('')
          +`<div class="grid grid-cols-3 gap-2 pt-1">${[['Infection','5','#14b8a6'],['Allergy','8','#a855f7'],['Drug Int.','4','#ef4444']].map(z=>`<div class="rounded-lg border em-hairline p-2 text-center"><p class="text-sm font-bold" style="color:${z[2]}">${z[1]}</p><p class="text-[10px] em-muted">${z[0]}</p></div>`).join('')}</div>`;
    }
    const TLINE=[
        ['Registration','08:02 AM','Reg Desk','Patient registered · MRN-10428','done','ti-user-plus','#6366f1'],
        ['Admission','08:20 AM','Dr. Mehta','Admitted to Cardiology ICU','done','ti-bed','#0ea5e9'],
        ['Vital Signs','08:35 AM','Nurse J.','BP 148/92, HR 104, SpO2 94%','done','ti-heartbeat','#ef4444'],
        ['Consultation','09:10 AM','Dr. Mehta','Cardiac evaluation completed','done','ti-stethoscope','#22c55e'],
        ['Diagnosis','09:25 AM','Dr. Mehta','Acute Myocardial Infarction','done','ti-clipboard-check','#a855f7'],
        ['Lab Ordered','09:40 AM','Dr. Mehta','Troponin, CBC, Lipid panel','active','ti-flask','#f59e0b'],
        ['Radiology','10:05 AM','Dr. Kapoor','Chest X-Ray requested','active','ti-radioactive','#0ea5e9'],
        ['Prescription','—','Pending','Awaiting cath lab','pending','ti-prescription','#94a3b8'],
        ['Surgery','—','Scheduled','Angioplasty 02:00 PM','pending','icon-scissors','#94a3b8'],
        ['Follow-up','—','—','Post-op review','pending','ti-calendar','#94a3b8'],
        ['Discharge','—','—','Estimated Jul 22','pending','ti-logout','#94a3b8'],
    ];
    function renderTimeline(){
        $('#em-timeline').innerHTML=TLINE.map(t=>`<div class="em-tl-item" style="--tc:${t[6]}">
            <div class="flex items-start gap-2"><div class="min-w-0 flex-1"><p class="text-sm font-semibold flex items-center gap-1.5"><i class="ti ${t[5]}" style="color:${t[6]}"></i> ${t[0]} ${t[4]==='active'?'<span class="em-b em-b-warn">Active</span>':t[4]==='pending'?'<span class="em-b" style="background:'+mix('#94a3b8',14)+';color:#94a3b8">Pending</span>':'<span class="em-b em-b-ok">Done</span>'}</p><p class="text-[11px] em-muted mt-0.5">${t[3]}</p><p class="text-[10px] em-muted">${t[2]}</p></div><span class="text-[11px] em-muted whitespace-nowrap">${t[1]}</span></div></div>`).join('');
    }
    function renderDocCenter(){
        const d=[['Prescriptions',124,'ti-prescription','#6366f1'],['Lab Reports',286,'ti-flask','#0ea5e9'],['Radiology',92,'ti-radioactive','#a855f7'],['Insurance',58,'ti-shield','#22c55e'],['Consent Forms',41,'ti-file-check','#f59e0b'],['Clinical Notes',326,'ti-notes','#ec4899'],['Referrals',18,'ti-send','#14b8a6'],['Discharge',73,'ti-logout','#ef4444']];
        $('#em-docs-center').innerHTML=d.map(x=>`<button data-modal="upload" class="rounded-xl border em-hairline p-2.5 text-left hover:shadow-md transition"><span class="w-8 h-8 rounded-lg flex items-center justify-center" style="background:${mix(x[3],14)};color:${x[3]}"><i class="ti ${x[2]}"></i></span><p class="text-sm font-semibold mt-1.5">${x[1]}</p><p class="text-[10px] em-muted">${x[0]}</p></button>`).join('');
    }
    const FEED=[
        ['Admission','Rahul Sharma → Cardiology ICU','ti-bed','#0ea5e9','2m'],
        ['Clinical Note','SOAP note by Dr. Mehta','ti-notes','#6366f1','8m'],
        ['Prescription','Atorvastatin 40mg issued','ti-prescription','#a855f7','15m'],
        ['Lab Result','Troponin — Critical High','ti-flask','#ef4444','22m'],
        ['Radiology','Chest X-Ray reported','ti-radioactive','#14b8a6','35m'],
        ['Doctor Update','Dr. Kapoor now available','ti-user-check','#22c55e','48m'],
        ['Transfer','Ward B → ICU (Bed 12)','ti-transfer','#f59e0b','1h'],
        ['Discharge','Meera Singh discharged','ti-logout','#0ea5e9','2h'],
    ];
    function renderFeed(){ $('#em-feed').innerHTML=FEED.map(f=>`<div class="rounded-xl border em-hairline p-3 flex items-start gap-2.5 hover:shadow-md transition"><span class="w-9 h-9 rounded-lg flex items-center justify-center flex-none" style="background:${mix(f[3],14)};color:${f[3]}"><i class="ti ${f[2]}"></i></span><div class="min-w-0"><p class="text-sm font-semibold">${f[0]}</p><p class="text-[11px] em-muted truncate">${f[1]}</p><p class="text-[10px] em-muted mt-0.5">${f[4]} ago</p></div></div>`).join(''); }

    /* ============ CARD VIEW ============ */
    function renderCards(){
        const list=filtered();
        $('#em-cards').innerHTML=list.map(p=>`
          <div class="em-pcard" data-row-id="${p.id}">
            <div class="p-4 pb-3" style="background:linear-gradient(135deg,${mix(p.av,12)},transparent)">
              <div class="flex items-start gap-3">
                <label class="pt-1"><input type="checkbox" data-sel="${p.id}" ${state.sel.has(p.id)?'checked':''} class="accent-[var(--em-c)]"></label>
                ${avatar(p,46)}
                <div class="min-w-0 flex-1"><p class="font-bold truncate">${p.name}</p><p class="text-[11px] em-muted">${p.mrn} · ${p.age}y · ${p.gender} · ${p.blood}</p></div>
                <div class="relative"><button data-menu="${p.id}" class="w-8 h-8 rounded-lg hover:bg-white/60 dark:hover:bg-slate-800 flex items-center justify-center"><i class="ti ti-dots-vertical em-muted"></i></button></div>
              </div>
            </div>
            <div class="px-4 pb-4 space-y-2">
              <div class="flex items-center justify-between text-xs"><span class="em-muted">Diagnosis</span><span class="font-semibold">${p.diag}</span></div>
              <div class="flex items-center justify-between text-xs"><span class="em-muted">Doctor</span><span class="font-medium">${p.doc}</span></div>
              <div class="flex items-center justify-between text-xs"><span class="em-muted">Department</span><span class="font-medium">${p.dept}</span></div>
              <div class="flex items-center justify-between text-xs"><span class="em-muted">Allergies</span><span class="font-medium">${p.allerg.length?p.allerg.join(', '):'None'}</span></div>
              <div class="flex flex-wrap items-center gap-1.5 pt-1">
                <span class="em-b" style="background:${mix(riskColor(p.risk),15)};color:${riskColor(p.risk)}"><i class="ti ti-activity-heartbeat text-[9px]"></i> ${p.risk} Risk</span>
                <span class="em-b ${statusB(p.status)}">${p.status}</span>
                ${p.critical?'<span class="em-b em-b-danger"><i class="ti ti-urgent text-[9px]"></i> Critical</span>':''}
                <span class="text-[10px] em-muted ml-auto">Updated ${p.updated}</span>
              </div>
              <div class="flex gap-2 pt-1">
                <a href="${detailUrl(p)}" class="flex-1 text-center text-xs font-semibold bg-[var(--em-c)] text-white rounded-lg py-1.5 hover:opacity-90">View EMR</a>
                <button data-modal="note" class="text-xs font-semibold border em-hairline rounded-lg px-2.5 py-1.5 hover:bg-gray-50 dark:hover:bg-slate-800"><i class="ti ti-notes"></i></button>
                <button data-menu="${p.id}" class="text-xs font-semibold border em-hairline rounded-lg px-2.5 py-1.5 hover:bg-gray-50 dark:hover:bg-slate-800"><i class="ti ti-dots"></i></button>
              </div>
            </div>
          </div>`).join('');
    }

    /* ============ LIST VIEW ============ */
    const COLS=[['mrn','MRN'],['patient','Patient'],['doctor','Doctor'],['dept','Department'],['diag','Diagnosis'],['adm','Admission'],['status','Status'],['critical','Critical']];
    function renderList(){
        const list=filtered();
        $('#em-listhead').innerHTML=`<th style="width:36px"><input type="checkbox" data-selall class="accent-[var(--em-c)]"></th>`+COLS.map(c=>`<th data-col="${c[0]}" class="${state.cols[c[0]]?'':'em-hidecol'}">${c[1]}</th>`).join('')+`<th class="text-right">Actions</th>`;
        $('#em-listbody').innerHTML=list.map(p=>`<tr data-row-id="${p.id}">
            <td><input type="checkbox" data-sel="${p.id}" ${state.sel.has(p.id)?'checked':''} class="accent-[var(--em-c)]"></td>
            <td data-col="mrn" class="${state.cols.mrn?'':'em-hidecol'}"><a href="${detailUrl(p)}" class="font-semibold text-[var(--em-c)] hover:underline">${p.mrn}</a></td>
            <td data-col="patient" class="${state.cols.patient?'':'em-hidecol'}"><button data-drawer="${p.id}" class="flex items-center gap-2 hover:text-[var(--em-c)]">${avatar(p,28)}<span class="font-medium">${p.name}</span></button></td>
            <td data-col="doctor" class="${state.cols.doctor?'':'em-hidecol'}">${p.doc}</td>
            <td data-col="dept" class="${state.cols.dept?'':'em-hidecol'}">${p.dept}</td>
            <td data-col="diag" class="${state.cols.diag?'':'em-hidecol'}">${p.diag}</td>
            <td data-col="adm" class="${state.cols.adm?'':'em-hidecol'}">${p.adm}</td>
            <td data-col="status" class="${state.cols.status?'':'em-hidecol'}"><span class="em-b ${statusB(p.status)}">${p.status}</span></td>
            <td data-col="critical" class="${state.cols.critical?'':'em-hidecol'}">${p.critical?'<span class="em-b em-b-danger"><i class="ti ti-urgent text-[9px]"></i> Yes</span>':'<span class="em-muted text-xs">—</span>'}</td>
            <td class="text-right"><div class="inline-flex gap-1"><a href="${detailUrl(p)}" class="w-7 h-7 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 inline-flex items-center justify-center"><i class="ti ti-eye"></i></a><button data-menu="${p.id}" class="w-7 h-7 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 inline-flex items-center justify-center"><i class="ti ti-dots-vertical"></i></button></div></td>
          </tr>`).join('')||`<tr><td colspan="10" class="text-center py-8 em-muted">No records match your filters.</td></tr>`;
    }

    /* ============ COLUMN MENU ============ */
    function buildColMenu(){
        $('#em-colmenu').innerHTML=COLS.map(c=>`<label class="flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer"><input type="checkbox" data-coltoggle="${c[0]}" ${state.cols[c[0]]?'checked':''} class="accent-[var(--em-c)]"> ${c[1]}</label>`).join('');
    }

    /* ============ RENDER DISPATCH ============ */
    function renderView(){
        $('#em-count').textContent=filtered().length;
        if(state.view==='card') renderCards();
        else if(state.view==='list') renderList();
        updateBulk();
    }
    function refreshAll(){ renderSummary(); renderRecent(); renderLabRadio(); renderMeds(); renderDocs(); renderNotes(); renderAlerts(); renderRisk(); renderTimeline(); renderDocCenter(); renderFeed(); renderView(); }

    /* ============ ACTION MENU ============ */
    const ACTIONS=[['View EMR','ti-eye','drawer'],['Edit Record','ti-edit','record'],['View Timeline','ti-timeline','timeline'],['Add Clinical Note','ti-notes','note'],['Create Prescription','ti-prescription','rx'],['Order Laboratory','ti-flask','lab'],['Order Radiology','ti-radioactive','radio'],['Upload Document','ti-upload','upload'],['Admit Patient','ti-bed','admit'],['Transfer Ward','ti-transfer','transfer'],['Schedule Surgery','icon-scissors','surgery'],['Schedule Follow-up','ti-calendar','followup'],['Generate Report','ti-report-medical','report'],['Print Summary','ti-printer','print'],['Download PDF','ti-file-download','pdf'],['Share Record','ti-share','share'],['Archive','ti-archive','archive'],['Delete','ti-trash','delete']];
    function openMenu(id,x,y){
        closeMenu();
        const host=$('#em-menuhost');
        host.innerHTML=`<div class="em-menu" id="em-openmenu">${ACTIONS.map(a=>`<button data-action="${a[2]}" data-pid="${id}" class="${a[2]==='delete'?'danger':''}"><i class="ti ${a[1]}"></i> ${a[0]}</button>`).join('')}</div>`;
        const m=$('#em-openmenu'); const r=m.getBoundingClientRect();
        let px=Math.min(x,window.innerWidth-r.width-12), py=Math.min(y,window.innerHeight-r.height-12);
        m.style.left=Math.max(12,px)+'px'; m.style.top=Math.max(12,py)+'px';
    }
    function closeMenu(){ $('#em-menuhost').innerHTML=''; }

    /* ============ DRAWER ============ */
    function openDrawer(id){
        const p=PAT.find(x=>x.id===id); if(!p) return;
        const sec=(t,ic,body)=>`<div class="rounded-xl border em-hairline p-3"><p class="text-xs font-bold em-muted uppercase tracking-wide mb-2 flex items-center gap-1.5"><i class="ti ${ic} text-[var(--em-c)]"></i> ${t}</p>${body}</div>`;
        const row=(k,v)=>`<div class="flex justify-between text-xs py-0.5"><span class="em-muted">${k}</span><span class="font-medium">${v}</span></div>`;
        $('#em-drawer').innerHTML=`
          <div class="p-4 border-b em-hairline sticky top-0 bg-[var(--color-white)] z-10 flex items-center justify-between">
            <div class="flex items-center gap-3">${avatar(p,44)}<div><p class="font-bold">${p.name}</p><p class="text-[11px] em-muted">${p.mrn} · ${p.age}y · ${p.gender} · ${p.blood}</p></div></div>
            <button data-close class="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center justify-center"><i class="ti ti-x"></i></button>
          </div>
          <div class="p-4 space-y-3">
            <div class="flex flex-wrap gap-1.5">
              <span class="em-b" style="background:${mix(riskColor(p.risk),15)};color:${riskColor(p.risk)}">${p.risk} Risk</span>
              <span class="em-b ${statusB(p.status)}">${p.status}</span>${p.critical?'<span class="em-b em-b-danger">Critical</span>':''}
            </div>
            ${sec('Demographics','ti-user',row('Age',p.age+' yrs')+row('Gender',p.gender)+row('Blood Group',p.blood)+row('Admitted',p.adm))}
            ${sec('Current Diagnosis','ti-clipboard-check',`<p class="text-sm font-semibold">${p.diag}</p><p class="text-[11px] em-muted">Managed by ${p.doc} · ${p.dept}</p>`)}
            ${sec('Allergies','ti-alert-hexagon',p.allerg.length?p.allerg.map(a=>`<span class="em-b em-b-danger mr-1 mb-1">${a}</span>`).join(''):'<p class="text-xs em-muted">No known allergies</p>')}
            ${sec('Vital Signs','ti-heartbeat',`<div class="grid grid-cols-3 gap-2 text-center">${[['BP','148/92'],['HR','104'],['SpO2','94%'],['Temp','99.1°F'],['RR','20'],['BMI','26.4']].map(v=>`<div class="rounded-lg bg-gray-50 dark:bg-slate-800 p-1.5"><p class="text-[10px] em-muted">${v[0]}</p><p class="text-sm font-bold">${v[1]}</p></div>`).join('')}</div>`)}
            ${sec('Medical History','ti-history',row('Chronic','Hypertension, T2DM')+row('Recent Procedure','Angiography')+row('Immunizations','Up to date'))}
            ${sec('Medications','ti-pill',['Aspirin 75mg','Atorvastatin 40mg','Metoprolol 25mg'].map(m=>`<div class="flex items-center gap-2 text-xs py-0.5"><i class="ti ti-point text-[var(--em-c)]"></i> ${m}</div>`).join(''))}
            ${sec('Diagnostics','ti-flask',row('Lab Reports','8 available')+row('Radiology','3 studies')+row('Pending','2 results'))}
            ${sec('Insurance','ti-shield',row('Provider','Star Health')+row('Policy','Active')+row('Coverage','₹5,00,000'))}
            ${sec('Family History','ti-users',row('Cardiac','Father — MI')+row('Diabetes','Mother — T2DM'))}
            <div class="grid grid-cols-2 gap-2">
              <button data-modal="note" class="text-xs font-semibold border em-hairline rounded-lg py-2 hover:bg-gray-50 dark:hover:bg-slate-800"><i class="ti ti-notes"></i> Add Note</button>
              <button data-modal="rx" class="text-xs font-semibold border em-hairline rounded-lg py-2 hover:bg-gray-50 dark:hover:bg-slate-800"><i class="ti ti-prescription"></i> Prescribe</button>
              <button data-modal="report" class="text-xs font-semibold border em-hairline rounded-lg py-2 hover:bg-gray-50 dark:hover:bg-slate-800"><i class="ti ti-report-medical"></i> Report</button>
              <button data-print class="text-xs font-semibold border em-hairline rounded-lg py-2 hover:bg-gray-50 dark:hover:bg-slate-800"><i class="ti ti-printer"></i> Print</button>
            </div>
            <button data-drawer-emr="${p.id}" class="w-full text-sm font-semibold bg-[var(--em-c)] text-white rounded-lg py-2.5 hover:opacity-90">Open Full EMR</button>
          </div>`;
        $('#em-drawer').classList.add('open');
        document.body.style.overflow='hidden';
    }
    function closeDrawer(){ $('#em-drawer').classList.remove('open'); document.body.style.overflow=''; }

    /* ============ MODALS ============ */
    const fld=(l,el)=>`<div class="em-field"><label>${l}</label>${el}</div>`;
    const inp=(ph)=>`<input class="em-input mt-1" placeholder="${ph||''}">`;
    const selEl=(opts)=>`<select class="em-input mt-1">${opts.map(o=>`<option>${o}</option>`).join('')}</select>`;
    const drop=(txt)=>`<div class="em-drop rounded-xl h-28 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800"><i class="ti ti-cloud-upload text-3xl em-muted"></i><p class="text-sm font-semibold mt-1">${txt}</p></div>`;
    const MODALS={
        record:{t:'New Medical Record',ic:'ti-file-plus',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('Patient Name',inp('Full name'))}${fld('MRN',inp('Auto-generated'))}${fld('Age',inp('Years'))}${fld('Gender',selEl(['Male','Female','Other']))}${fld('Blood Group',selEl(BLOOD))}${fld('Department',selEl(DEPTS))}${fld('Assigned Doctor',selEl(DOCTORS))}${fld('Admission Type',selEl(['OPD','IPD','Emergency']))}<div class="sm:col-span-2">${fld('Chief Complaint',`<textarea class="em-input mt-1" rows="2" placeholder="Presenting symptoms..."></textarea>`)}</div></div>`,cta:'Create Record'},
        record_edit:{t:'Edit Record',ic:'ti-edit',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('Diagnosis',inp('Update diagnosis'))}${fld('Status',selEl(STATUS))}${fld('Risk Level',selEl(RISK))}${fld('Department',selEl(DEPTS))}</div>`,cta:'Save Changes'},
        note:{t:'Add Clinical Note',ic:'ti-notes',body:`${fld('Note Type',selEl(['SOAP','Progress','Nursing','Follow-up','Surgical']))}<div class="mt-3">${fld('Subjective / Note',`<textarea class="em-input mt-1" rows="3" placeholder="Clinical observation..."></textarea>`)}</div><div class="grid grid-cols-2 gap-3 mt-3">${fld('Tags',inp('e.g. cardiac, urgent'))}${fld('Author',selEl(DOCTORS))}</div>`,cta:'Save Note'},
        rx:{t:'New Prescription',ic:'ti-prescription',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('Medication',inp('Drug name'))}${fld('Dosage',inp('e.g. 40mg'))}${fld('Frequency',selEl(['Once daily','Twice daily','Thrice daily','As needed']))}${fld('Duration',inp('e.g. 7 days'))}</div><div class="mt-3">${fld('Instructions',`<textarea class="em-input mt-1" rows="2" placeholder="After meals..."></textarea>`)}</div>`,cta:'Issue Prescription'},
        lab:{t:'Laboratory Order',ic:'ti-flask',body:`${fld('Test Category',selEl(['Hematology','Biochemistry','Microbiology','Serology','Pathology']))}<div class="grid grid-cols-2 gap-3 mt-3">${fld('Priority',selEl(['Routine','Urgent','STAT']))}${fld('Sample',selEl(['Blood','Urine','Swab','Tissue']))}</div>`,cta:'Order Test'},
        radio:{t:'Radiology Order',ic:'ti-radioactive',body:`${fld('Study Type',selEl(['X-Ray','CT Scan','MRI','Ultrasound','PET Scan']))}<div class="grid grid-cols-2 gap-3 mt-3">${fld('Body Region',inp('e.g. Chest'))}${fld('Priority',selEl(['Routine','Urgent','STAT']))}</div>`,cta:'Order Study'},
        upload:{t:'Upload Documents',ic:'ti-upload',body:`${drop('Drag & drop or click to browse')}<div class="mt-3">${fld('Category',selEl(['Prescriptions','Lab Reports','Radiology','Insurance','Consent Forms','Referral Letters','Discharge Summary']))}</div>`,cta:'Upload'},
        report:{t:'Generate Report',ic:'ti-report-medical',body:`${fld('Report Type',selEl(['Clinical Summary','Discharge Summary','Department Report','Doctor Report','Diagnostic Report']))}<div class="grid grid-cols-2 gap-3 mt-3">${fld('Format',selEl(['PDF','Excel','Print']))}${fld('Date Range',selEl(['Today','This Week','This Month','Custom']))}</div>`,cta:'Generate'},
        import:{t:'Import EMR Data',ic:'ti-upload',body:`<div class="flex gap-2 mb-3">${['CSV','Excel','HL7','EMR'].map(f=>`<span class="em-b em-b-info">${f}</span>`).join('')}</div>${drop('Drop CSV / Excel / HL7 / EMR file')}<button class="text-xs font-semibold text-[var(--em-c)] hover:underline mt-2"><i class="ti ti-download"></i> Download sample template</button><div class="mt-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 p-3 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2"><i class="ti ti-circle-check"></i> Validation passed · 248 records ready · 0 errors</div>`,cta:'Import Records'},
        export:{t:'Export EMR',ic:'ti-download',body:`<p class="text-xs em-muted mb-2">Choose scope & format</p><div class="grid grid-cols-2 gap-2 mb-3">${['CSV','Excel','PDF','Print','Clinical Summary','Department Report','Doctor Report','Selected Records','Entire EMR (Demo)'].map(f=>`<button data-expfmt="${f}" class="text-xs font-semibold border em-hairline rounded-lg px-3 py-2 hover:bg-gray-50 dark:hover:bg-slate-800">${f}</button>`).join('')}</div>`,cta:'Export'},
        timeline:{t:'Clinical Timeline',ic:'ti-timeline',body:`<div class="em-tl">${TLINE.slice(0,7).map(t=>`<div class="em-tl-item" style="--tc:${t[6]}"><p class="text-sm font-semibold"><i class="ti ${t[5]}" style="color:${t[6]}"></i> ${t[0]}</p><p class="text-[11px] em-muted">${t[3]} · ${t[1]}</p></div>`).join('')}</div>`,cta:'Close'},
    };
    const SIMPLE={admit:'Patient admitted',transfer:'Ward transfer initiated',surgery:'Surgery scheduled',followup:'Follow-up scheduled',pdf:'PDF downloaded',share:'Record shared',archive:'Record archived'};
    function openModal(key){
        const m=MODALS[key]; if(!m) return;
        document.body.style.overflow='hidden';
        $('#em-modalhost').innerHTML=`<div class="em-modal-wrap open"><div class="em-modal-bg" data-close></div><div class="em-modal">
            <div class="flex items-center justify-between p-4 border-b em-hairline"><h3 class="font-bold flex items-center gap-2"><i class="ti ${m.ic} text-[var(--em-c)]"></i> ${m.t}</h3><button data-close class="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center justify-center"><i class="ti ti-x"></i></button></div>
            <div class="p-4">${m.body}</div>
            <div class="flex justify-end gap-2 p-4 border-t em-hairline"><button data-close class="text-sm font-semibold px-3 py-2 rounded-lg border em-hairline hover:bg-gray-50 dark:hover:bg-slate-800">Cancel</button><button data-modalok="${key}" class="text-sm font-semibold px-4 py-2 rounded-lg bg-[var(--em-c)] text-white hover:opacity-90">${m.cta}</button></div>
        </div></div>`;
    }
    function openDelete(msg,onOk){
        document.body.style.overflow='hidden';
        $('#em-modalhost').innerHTML=`<div class="em-modal-wrap open"><div class="em-modal-bg" data-close></div><div class="em-modal" style="width:min(420px,94vw)"><div class="p-5 text-center"><div class="w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-500 flex items-center justify-center mx-auto mb-3"><i class="ti ti-alert-triangle text-2xl"></i></div><h3 class="font-bold text-lg">Confirm Deletion</h3><p class="text-xs em-muted mt-1">${msg}</p><div class="flex gap-2 mt-4"><button data-close class="flex-1 text-sm font-semibold px-3 py-2 rounded-lg border em-hairline hover:bg-gray-50 dark:hover:bg-slate-800">Cancel</button><button id="em-delok" class="flex-1 text-sm font-semibold px-3 py-2 rounded-lg bg-rose-500 text-white hover:opacity-90">Delete</button></div></div></div></div>`;
        $('#em-delok').onclick=()=>{ onOk(); closeModal(); };
    }
    function closeModal(){ $('#em-modalhost').innerHTML=''; if(!$('#em-drawer').classList.contains('open')) document.body.style.overflow=''; }

    /* ============ BULK ============ */
    function updateBulk(){
        const bar=$('.em-bulk'); $('#em-selcount').textContent=state.sel.size;
        bar.classList.toggle('show',state.sel.size>0);
    }

    /* ============ EVENTS ============ */
    document.addEventListener('click',e=>{
        const t=e.target.closest('[data-view],[data-drawer],[data-drawer-emr],[data-menu],[data-action],[data-modal],[data-modalok],[data-close],[data-refresh],[data-print],[data-clear],[data-cols-btn],[data-notetab],[data-notepin],[data-bulk],[data-expfmt],[data-modal]');
        // view toggle
        if(e.target.closest('#em-viewtoggle button')){ const b=e.target.closest('button'); state.view=b.dataset.view; $$('#em-viewtoggle button').forEach(x=>x.classList.toggle('on',x===b)); $$('.em-view').forEach(v=>v.classList.toggle('active',v.dataset.viewpanel===state.view)); renderView(); animateRings(); return; }
        if(!t){ if(!e.target.closest('.em-menu')) closeMenu(); if(!e.target.closest('#em-colmenu')&&!e.target.closest('[data-cols-btn]')) $('#em-colmenu').classList.add('hidden'); return; }

        if(t.dataset.drawer!==undefined){ openDrawer(+t.dataset.drawer); return; }
        if(t.dataset.drawerEmr!==undefined){ toast('Opening full EMR chart...','ti-file-text'); return; }
        if(t.dataset.menu!==undefined){ const r=t.getBoundingClientRect(); openMenu(+t.dataset.menu,r.left-200,r.bottom+4); return; }
        if(t.dataset.action!==undefined){ const a=t.dataset.action, pid=+t.dataset.pid; closeMenu();
            if(a==='drawer') openDrawer(pid);
            else if(a==='timeline') openModal('timeline');
            else if(a==='record') openModal('record_edit');
            else if(MODALS[a]) openModal(a);
            else if(a==='print'){ toast('Printing summary...','ti-printer'); }
            else if(a==='delete'){ openDelete('Delete this patient record permanently?',()=>{ PAT=PAT.filter(x=>x.id!==pid); state.sel.delete(pid); refreshAll(); toast('Record deleted','ti-trash'); }); }
            else if(SIMPLE[a]) toast(SIMPLE[a]);
            return; }
        if(t.dataset.modal!==undefined){ openModal(t.dataset.modal); return; }
        if(t.dataset.modalok!==undefined){ const k=t.dataset.modalok; if(k==='timeline'){closeModal();return;} toast((MODALS[k].cta)+' — saved','ti-check'); closeModal(); return; }
        if(t.dataset.expfmt!==undefined){ toast('Exported: '+t.dataset.expfmt,'ti-download'); closeModal(); return; }
        if(t.dataset.close!==undefined){ closeModal(); closeDrawer(); return; }
        if(t.dataset.refresh!==undefined){ $('#em-sync').textContent='just now'; refreshAll(); animateRings(); toast('Data refreshed','ti-refresh'); return; }
        if(t.dataset.print!==undefined){ toast('Preparing print view...','ti-printer'); return; }
        if(t.dataset.clear!==undefined){ state.q=state.dept=state.status=state.risk=state.sort=''; $('#em-search').value=''; $$('[data-filter]').forEach(s=>s.value=''); refreshAll(); return; }
        if(t.dataset.colsBtn!==undefined){ $('#em-colmenu').classList.toggle('hidden'); const r=t.getBoundingClientRect(); const m=$('#em-colmenu'); m.style.left=Math.max(12,r.right-230)+'px'; m.style.top=(r.bottom+4)+'px'; return; }
        if(t.dataset.notetab!==undefined){ state.notetab=t.dataset.notetab; $$('#em-notetabs button').forEach(x=>x.classList.toggle('on',x===t)); renderNotes(); return; }
        if(t.dataset.notepin!==undefined){ NOTES[+t.dataset.notepin].pin^=1; renderNotes(); return; }
        if(t.dataset.bulk!==undefined){ const b=t.dataset.bulk;
            if(b==='delete'){ openDelete(`Delete ${state.sel.size} selected record(s)?`,()=>{ PAT=PAT.filter(x=>!state.sel.has(x.id)); state.sel.clear(); refreshAll(); toast('Records deleted','ti-trash'); }); }
            else { toast({assign:'Doctor assigned',report:'Reports generated',export:'Exported',print:'Printing',status:'Status updated',notify:'Notifications sent',archive:'Archived'}[b]+' · '+state.sel.size+' records'); if(b==='archive'){ state.sel.clear(); refreshAll(); } }
            return; }
    });

    // checkboxes
    document.addEventListener('change',e=>{
        if(e.target.dataset.sel!==undefined){ const id=+e.target.dataset.sel; e.target.checked?state.sel.add(id):state.sel.delete(id); updateBulk(); return; }
        if(e.target.dataset.selall!==undefined){ const on=e.target.checked; filtered().forEach(p=>on?state.sel.add(p.id):state.sel.delete(p.id)); renderList(); updateBulk(); return; }
        if(e.target.dataset.coltoggle!==undefined){ const c=e.target.dataset.coltoggle; state.cols[c]=e.target.checked?1:0; renderList(); return; }
        const f=e.target.closest('[data-filter]'); if(f){ state[f.dataset.filter]=f.value; refreshAll(); }
    });
    // search inputs
    document.addEventListener('input',e=>{
        if(e.target.id==='em-search'){ state.q=e.target.value; renderView(); }
        if(e.target.id==='em-notesearch'){ state.noteq=e.target.value; renderNotes(); }
    });

    /* ============ INIT ============ */
    // The dashboard panel (KPIs, exec charts, summary, recent, lab/radio,
    // meds, docs, notes, alerts, risk, timeline, doc center, feed), the
    // department filter options, the unfiltered Card grid (#em-cards) and
    // Patient Registry table (#em-listhead/#em-listbody, every column
    // visible) are now written directly into the HTML as static markup for
    // this same PAT/NOTES data, so nothing needs building on load —
    // renderKPIs()/renderExec()/renderView()/refreshAll() still run after
    // a real mutation (bulk/single delete, search/filter/sort, notes
    // tab/pin, switching to the Card/List view, refresh, clear filters,
    // column visibility toggles).
    setTimeout(()=>{
        $('#em-skeleton').classList.add('hidden');
        $('#em-content').classList.remove('hidden');
        animateCounts(); animateRings();
    },1500);
})();
// ==========================================================================
// icu-beds.js
// ==========================================================================
(function(){
    "use strict";
    if ((location.pathname.split("/").pop() || "index.html") !== "icu-beds.html") return;
    const $=(s,r)=>(r||document).querySelector(s);
    const $$=(s,r)=>Array.from((r||document).querySelectorAll(s));
    const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
    let toastT;
    function toast(msg,icon){ const t=$('#ib-toast'); t.innerHTML=`<i class="${icon||'icon-check'} text-indigo-400"></i> ${msg}`; t.classList.add('show'); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove('show'),2500); }

    /* ============ DATA ============ */
    // bed status: occupied / available / reserved / cleaning / maintenance / inactive
    const STC={occupied:'red',available:'green',reserved:'blue',cleaning:'yellow',maintenance:'orange',inactive:'gray'};
    const STLABEL={occupied:'Occupied',available:'Available',reserved:'Reserved',cleaning:'Cleaning',maintenance:'Maintenance',inactive:'Inactive'};
    const BC={green:'#16a34a',blue:'#2563eb',yellow:'#ca8a04',orange:'#ea580c',red:'#dc2626',gray:'#64748b'};
    const DOCS=['Dr. A. Mehta','Dr. S. Kapoor','Dr. R. Nair','Dr. L. Khan','Dr. P. Rao'];
    const NURSES=['N. Fernandes','N. Pillai','N. Sharma','N. Das','N. Reddy'];
    const HK=['H. Kumar','H. Bibi','H. Raju','H. Sunita'];
    const DIAG=['Acute MI','Septic Shock','ARDS','TBI','Post-CABG','Ischemic Stroke','Severe Pneumonia','DKA','Cardiac Arrest','GI Bleed'];
    const NAMES=['Rahul Sharma','Anita Reddy','Vikram Nair','Priya Patel','Suresh Gupta','Meera Singh','Arjun Menon','Kavya Das','Deepak Joshi','Neha Verma','Rohan Iyer','Sana Khan'];
    const AVC=['#475569','#0f766e','#1e40af','#4338ca','#0e7490','#334155','#3f6212','#7c2d12'];
    const BLOOD=['O+','A+','B+','AB+','O-','A-'];
    const BEDTYPES=['Standard ICU','High-Dependency','Ventilator Bed','Isolation','Cardiac','Neonatal'];
    const ZONES=[['ICU-A','ICU A',6],['ICU-B','ICU B',6],['CCU','CCU',5],['NICU','NICU',4],['PICU','PICU',4],['ISO','Isolation ICU',4]];

    // Frozen static seed data (one snapshot of what the old Math.random()-driven
    // mkBed()/ZONES.forEach() loop used to generate randomly on every page load)
    // so the initial floor map / hero stats / workspace / matrix markup can be
    // written directly into the HTML instead of JS-built on load.
    // mkBed() is kept below so any future runtime code can still mint beds the
    // same shape; seq continues on from the highest frozen id.
    let seq=29;
    function mkBed(zone,zlabel,i){
        const r=Math.random();
        let status = r<0.56?'occupied':r<0.72?'available':r<0.82?'reserved':r<0.9?'cleaning':r<0.97?'maintenance':'inactive';
        const id=seq++;
        const bt=zone==='NICU'?'Neonatal':zone==='ISO'?'Isolation':zone==='CCU'?'Cardiac':BEDTYPES[id%BEDTYPES.length];
        const b={ id, zone, zlabel, label:zone+'-'+String(i+1).padStart(2,'0'), status, type:bt, iso:zone==='ISO',
            clean:status==='cleaning'?rnd(20,90):100, maint:status==='maintenance', doc:DOCS[id%DOCS.length], nurse:NURSES[id%NURSES.length], av:AVC[id%AVC.length] };
        if(status==='occupied'){
            const crit=Math.random()<0.4;
            b.name=NAMES[id%NAMES.length]; b.mrn='MRN-'+(30500+id); b.age=rnd(18,86); b.gender=id%2?'Male':'Female';
            b.blood=BLOOD[id%BLOOD.length]; b.diag=DIAG[id%DIAG.length]; b.los=rnd(1,18); b.vent=Math.random()<0.55;
            b.crit=crit; b.hr=rnd(60,130); b.spo2=rnd(88,99); b.stab=crit?rnd(24,48):rnd(66,96);
            b.disc='Jul '+rnd(20,28);
        }
        if(status==='reserved'){ b.resFor=NAMES[(id+3)%NAMES.length]; b.resEta=rnd(1,6)+'h'; }
        return b;
    }
    let BEDS=[{"id":0,"zone":"ICU-A","zlabel":"ICU A","label":"ICU-A-01","status":"occupied","type":"Standard ICU","iso":false,"clean":100,"maint":false,"doc":"Dr. A. Mehta","nurse":"N. Fernandes","av":"#475569","name":"Rahul Sharma","mrn":"MRN-30500","age":30,"gender":"Female","blood":"O+","diag":"Acute MI","los":12,"vent":true,"crit":true,"hr":102,"spo2":88,"stab":36,"disc":"Jul 28"},{"id":1,"zone":"ICU-A","zlabel":"ICU A","label":"ICU-A-02","status":"maintenance","type":"High-Dependency","iso":false,"clean":100,"maint":true,"doc":"Dr. S. Kapoor","nurse":"N. Pillai","av":"#0f766e"},{"id":2,"zone":"ICU-A","zlabel":"ICU A","label":"ICU-A-03","status":"available","type":"Ventilator Bed","iso":false,"clean":100,"maint":false,"doc":"Dr. R. Nair","nurse":"N. Sharma","av":"#1e40af"},{"id":3,"zone":"ICU-A","zlabel":"ICU A","label":"ICU-A-04","status":"available","type":"Isolation","iso":false,"clean":100,"maint":false,"doc":"Dr. L. Khan","nurse":"N. Das","av":"#4338ca"},{"id":4,"zone":"ICU-A","zlabel":"ICU A","label":"ICU-A-05","status":"occupied","type":"Cardiac","iso":false,"clean":100,"maint":false,"doc":"Dr. P. Rao","nurse":"N. Reddy","av":"#0e7490","name":"Suresh Gupta","mrn":"MRN-30504","age":31,"gender":"Female","blood":"O-","diag":"Post-CABG","los":1,"vent":true,"crit":false,"hr":108,"spo2":92,"stab":81,"disc":"Jul 22"},{"id":5,"zone":"ICU-A","zlabel":"ICU A","label":"ICU-A-06","status":"cleaning","type":"Neonatal","iso":false,"clean":27,"maint":false,"doc":"Dr. A. Mehta","nurse":"N. Fernandes","av":"#334155"},{"id":6,"zone":"ICU-B","zlabel":"ICU B","label":"ICU-B-01","status":"occupied","type":"Standard ICU","iso":false,"clean":100,"maint":false,"doc":"Dr. S. Kapoor","nurse":"N. Pillai","av":"#3f6212","name":"Arjun Menon","mrn":"MRN-30506","age":48,"gender":"Female","blood":"O+","diag":"Severe Pneumonia","los":8,"vent":true,"crit":false,"hr":92,"spo2":96,"stab":75,"disc":"Jul 28"},{"id":7,"zone":"ICU-B","zlabel":"ICU B","label":"ICU-B-02","status":"available","type":"High-Dependency","iso":false,"clean":100,"maint":false,"doc":"Dr. R. Nair","nurse":"N. Sharma","av":"#7c2d12"},{"id":8,"zone":"ICU-B","zlabel":"ICU B","label":"ICU-B-03","status":"occupied","type":"Ventilator Bed","iso":false,"clean":100,"maint":false,"doc":"Dr. L. Khan","nurse":"N. Das","av":"#475569","name":"Deepak Joshi","mrn":"MRN-30508","age":35,"gender":"Female","blood":"B+","diag":"Cardiac Arrest","los":6,"vent":true,"crit":false,"hr":62,"spo2":98,"stab":96,"disc":"Jul 26"},{"id":9,"zone":"ICU-B","zlabel":"ICU B","label":"ICU-B-04","status":"occupied","type":"Isolation","iso":false,"clean":100,"maint":false,"doc":"Dr. P. Rao","nurse":"N. Reddy","av":"#0f766e","name":"Neha Verma","mrn":"MRN-30509","age":54,"gender":"Male","blood":"AB+","diag":"GI Bleed","los":16,"vent":true,"crit":true,"hr":69,"spo2":97,"stab":38,"disc":"Jul 27"},{"id":10,"zone":"ICU-B","zlabel":"ICU B","label":"ICU-B-05","status":"occupied","type":"Cardiac","iso":false,"clean":100,"maint":false,"doc":"Dr. A. Mehta","nurse":"N. Fernandes","av":"#1e40af","name":"Rohan Iyer","mrn":"MRN-30510","age":80,"gender":"Female","blood":"O-","diag":"Acute MI","los":17,"vent":false,"crit":true,"hr":81,"spo2":97,"stab":38,"disc":"Jul 28"},{"id":11,"zone":"ICU-B","zlabel":"ICU B","label":"ICU-B-06","status":"reserved","type":"Neonatal","iso":false,"clean":100,"maint":false,"doc":"Dr. S. Kapoor","nurse":"N. Pillai","av":"#4338ca","resFor":"Vikram Nair","resEta":"4h"},{"id":12,"zone":"CCU","zlabel":"CCU","label":"CCU-01","status":"available","type":"Cardiac","iso":false,"clean":100,"maint":false,"doc":"Dr. R. Nair","nurse":"N. Sharma","av":"#0e7490"},{"id":13,"zone":"CCU","zlabel":"CCU","label":"CCU-02","status":"occupied","type":"Cardiac","iso":false,"clean":100,"maint":false,"doc":"Dr. L. Khan","nurse":"N. Das","av":"#334155","name":"Anita Reddy","mrn":"MRN-30513","age":54,"gender":"Male","blood":"A+","diag":"TBI","los":15,"vent":true,"crit":false,"hr":82,"spo2":88,"stab":87,"disc":"Jul 24"},{"id":14,"zone":"CCU","zlabel":"CCU","label":"CCU-03","status":"occupied","type":"Cardiac","iso":false,"clean":100,"maint":false,"doc":"Dr. P. Rao","nurse":"N. Reddy","av":"#3f6212","name":"Vikram Nair","mrn":"MRN-30514","age":77,"gender":"Female","blood":"B+","diag":"Post-CABG","los":17,"vent":true,"crit":true,"hr":124,"spo2":89,"stab":33,"disc":"Jul 24"},{"id":15,"zone":"CCU","zlabel":"CCU","label":"CCU-04","status":"occupied","type":"Cardiac","iso":false,"clean":100,"maint":false,"doc":"Dr. A. Mehta","nurse":"N. Fernandes","av":"#7c2d12","name":"Priya Patel","mrn":"MRN-30515","age":41,"gender":"Male","blood":"AB+","diag":"Ischemic Stroke","los":17,"vent":true,"crit":true,"hr":105,"spo2":99,"stab":40,"disc":"Jul 22"},{"id":16,"zone":"CCU","zlabel":"CCU","label":"CCU-05","status":"occupied","type":"Cardiac","iso":false,"clean":100,"maint":false,"doc":"Dr. S. Kapoor","nurse":"N. Pillai","av":"#475569","name":"Suresh Gupta","mrn":"MRN-30516","age":34,"gender":"Female","blood":"O-","diag":"Severe Pneumonia","los":14,"vent":false,"crit":true,"hr":99,"spo2":90,"stab":37,"disc":"Jul 21"},{"id":17,"zone":"NICU","zlabel":"NICU","label":"NICU-01","status":"occupied","type":"Neonatal","iso":false,"clean":100,"maint":false,"doc":"Dr. R. Nair","nurse":"N. Sharma","av":"#0f766e","name":"Meera Singh","mrn":"MRN-30517","age":33,"gender":"Male","blood":"A-","diag":"DKA","los":15,"vent":false,"crit":false,"hr":77,"spo2":99,"stab":84,"disc":"Jul 21"},{"id":18,"zone":"NICU","zlabel":"NICU","label":"NICU-02","status":"maintenance","type":"Neonatal","iso":false,"clean":100,"maint":true,"doc":"Dr. L. Khan","nurse":"N. Das","av":"#1e40af"},{"id":19,"zone":"NICU","zlabel":"NICU","label":"NICU-03","status":"occupied","type":"Neonatal","iso":false,"clean":100,"maint":false,"doc":"Dr. P. Rao","nurse":"N. Reddy","av":"#4338ca","name":"Kavya Das","mrn":"MRN-30519","age":39,"gender":"Male","blood":"A+","diag":"GI Bleed","los":12,"vent":false,"crit":false,"hr":93,"spo2":95,"stab":72,"disc":"Jul 20"},{"id":20,"zone":"NICU","zlabel":"NICU","label":"NICU-04","status":"available","type":"Neonatal","iso":false,"clean":100,"maint":false,"doc":"Dr. A. Mehta","nurse":"N. Fernandes","av":"#0e7490"},{"id":21,"zone":"PICU","zlabel":"PICU","label":"PICU-01","status":"reserved","type":"Isolation","iso":false,"clean":100,"maint":false,"doc":"Dr. S. Kapoor","nurse":"N. Pillai","av":"#334155","resFor":"Rahul Sharma","resEta":"2h"},{"id":22,"zone":"PICU","zlabel":"PICU","label":"PICU-02","status":"occupied","type":"Cardiac","iso":false,"clean":100,"maint":false,"doc":"Dr. R. Nair","nurse":"N. Sharma","av":"#3f6212","name":"Rohan Iyer","mrn":"MRN-30522","age":30,"gender":"Female","blood":"O-","diag":"ARDS","los":9,"vent":true,"crit":false,"hr":110,"spo2":91,"stab":92,"disc":"Jul 23"},{"id":23,"zone":"PICU","zlabel":"PICU","label":"PICU-03","status":"available","type":"Neonatal","iso":false,"clean":100,"maint":false,"doc":"Dr. L. Khan","nurse":"N. Das","av":"#7c2d12"},{"id":24,"zone":"PICU","zlabel":"PICU","label":"PICU-04","status":"occupied","type":"Standard ICU","iso":false,"clean":100,"maint":false,"doc":"Dr. P. Rao","nurse":"N. Reddy","av":"#475569","name":"Rahul Sharma","mrn":"MRN-30524","age":82,"gender":"Female","blood":"O+","diag":"Post-CABG","los":5,"vent":true,"crit":true,"hr":75,"spo2":98,"stab":24,"disc":"Jul 25"},{"id":25,"zone":"ISO","zlabel":"Isolation ICU","label":"ISO-01","status":"occupied","type":"Isolation","iso":true,"clean":100,"maint":false,"doc":"Dr. A. Mehta","nurse":"N. Fernandes","av":"#0f766e","name":"Anita Reddy","mrn":"MRN-30525","age":74,"gender":"Male","blood":"A+","diag":"Ischemic Stroke","los":4,"vent":true,"crit":false,"hr":126,"spo2":93,"stab":71,"disc":"Jul 24"},{"id":26,"zone":"ISO","zlabel":"Isolation ICU","label":"ISO-02","status":"occupied","type":"Isolation","iso":true,"clean":100,"maint":false,"doc":"Dr. S. Kapoor","nurse":"N. Pillai","av":"#1e40af","name":"Vikram Nair","mrn":"MRN-30526","age":46,"gender":"Female","blood":"B+","diag":"Severe Pneumonia","los":5,"vent":true,"crit":true,"hr":70,"spo2":88,"stab":29,"disc":"Jul 22"},{"id":27,"zone":"ISO","zlabel":"Isolation ICU","label":"ISO-03","status":"occupied","type":"Isolation","iso":true,"clean":100,"maint":false,"doc":"Dr. R. Nair","nurse":"N. Sharma","av":"#4338ca","name":"Priya Patel","mrn":"MRN-30527","age":44,"gender":"Male","blood":"AB+","diag":"DKA","los":11,"vent":true,"crit":false,"hr":99,"spo2":93,"stab":92,"disc":"Jul 23"},{"id":28,"zone":"ISO","zlabel":"Isolation ICU","label":"ISO-04","status":"reserved","type":"Isolation","iso":true,"clean":100,"maint":false,"doc":"Dr. L. Khan","nurse":"N. Das","av":"#0e7490","resFor":"Kavya Das","resEta":"2h"}];
    const bcOf=b=>BC[STC[b.status]==='red'&&!(b.crit)?'red':STC[b.status]]; // occupied always red family
    const statusColor=b=>BC[STC[b.status]];
    const count=st=>BEDS.filter(b=>b.status===st).length;
    let activeId=BEDS.find(b=>b.status==='occupied')?.id ?? BEDS[0].id;
    const sel=new Set();

    /* ============ HERO STATS ============ */
    function renderHero(){
        const total=BEDS.length, occ=count('occupied'), avail=count('available'), res=count('reserved'), cln=count('cleaning'), iso=BEDS.filter(b=>b.iso).length;
        $('#ib-h-occrate').textContent=Math.round(occ/total*100)+'%';
        const s=[['Total ICU Beds',total,'#818cf8'],['Occupied',occ,'#f87171'],['Available',avail,'#34d399'],['Reserved',res,'#60a5fa'],['Cleaning',cln,'#fcd34d'],['Isolation',iso,'#5eead4']];
        $('#ib-herostats').innerHTML=s.map(x=>`<div class="ib-hstat"><p class="text-[11px] text-slate-300">${x[0]}</p><p class="text-xl font-bold" style="color:${x[2]}">${x[1]}</p></div>`).join('');
    }

    /* ============ FLOOR MAP ============ */
    let zoneFilter='ALL', bedQ='', statusFilter='';
    function renderZoneTabs(){
        $('#ib-zonetabs').innerHTML=`<button data-zone="ALL" class="${zoneFilter==='ALL'?'on':''}">All</button>`+ZONES.map(z=>`<button data-zone="${z[0]}" class="${zoneFilter===z[0]?'on':''}">${z[1]}</button>`).join('');
        $('#ib-bedlegend').innerHTML=Object.keys(STLABEL).map(k=>`<span class="flex items-center gap-1 ib-mut"><span class="ib-dot" style="background:${BC[STC[k]]}"></span>${STLABEL[k]}</span>`).join('');
    }
    function bedCard(b){
        const bc=statusColor(b), scls='bs-'+STC[b.status];
        if(b.status!=='occupied'){
            const icon={available:'icon-bed',reserved:'icon-bookmark',cleaning:'icon-spray-can',maintenance:'icon-wrench',inactive:'icon-bed'}[b.status];
            const extra=b.status==='reserved'?`<p class="text-[10px] ib-mut mt-1">Reserved for ${b.resFor} · ETA ${b.resEta}</p>`
                :b.status==='cleaning'?`<div class="ib-stab mt-2"><span style="width:${b.clean}%;background:${bc}"></span></div><p class="text-[10px] ib-mut mt-1">Turnover ${b.clean}%</p>`
                :b.status==='maintenance'?`<p class="text-[10px] ib-mut mt-1">Bio-medical servicing</p>`
                :b.status==='inactive'?`<p class="text-[10px] ib-mut mt-1">Out of service</p>`
                :`<p class="text-[10px] ib-mut mt-1">Ready for allocation</p>`;
            return `<div class="ib-bed ${scls} ${b.id===activeId?'sel':''}" data-bed="${b.id}">
                <div class="flex items-center justify-between mb-1"><label onclick="event.stopPropagation()" class="flex items-center gap-1.5"><input type="checkbox" data-sel="${b.id}" ${sel.has(b.id)?'checked':''} class="accent-[var(--ib-c)]"><span class="text-xs font-bold ib-head">${b.label}</span></label><span class="ib-chip stat">${STLABEL[b.status]}</span></div>
                <div class="flex flex-col items-center justify-center py-2 text-center"><i class="${icon} text-2xl" style="color:${bc}"></i><p class="text-[11px] ib-mut mt-1">${b.type}</p></div>
                ${extra}
                <div class="flex items-center justify-between mt-2 text-[10px] ib-mut"><span>${b.iso?'<i class="icon-shield"></i> Iso':'<i class="icon-bed"></i> '+b.zlabel}</span><button data-menu="${b.id}" onclick="event.stopPropagation()" class="w-6 h-6 rounded-md hover:bg-[var(--ib-hover)] flex items-center justify-center"><i class="icon-more-vertical"></i></button></div>
            </div>`;
        }
        const ini=b.name.split(' ').map(n=>n[0]).join('');
        return `<div class="ib-bed ${scls} ${b.id===activeId?'sel':''}" data-bed="${b.id}">
            <div class="flex items-center justify-between mb-1.5"><label onclick="event.stopPropagation()" class="flex items-center gap-1.5"><input type="checkbox" data-sel="${b.id}" ${sel.has(b.id)?'checked':''} class="accent-[var(--ib-c)]"><span class="text-xs font-bold ib-head">${b.label}</span></label><span class="ib-chip stat">${b.crit?'<i class="icon-alert-triangle text-[9px]"></i> ':''}Occupied</span></div>
            <div class="flex items-center gap-2">
                <span class="rounded-lg flex items-center justify-center text-white font-bold flex-none" style="width:36px;height:36px;background:${b.av};font-size:12px">${ini}</span>
                <div class="min-w-0 flex-1"><p class="text-sm font-semibold ib-head truncate">${b.name}</p><p class="text-[10px] ib-mut">${b.mrn} · ${b.age}y · ${b.gender[0]} · Day ${b.los}</p></div>
                <button data-menu="${b.id}" onclick="event.stopPropagation()" class="w-6 h-6 rounded-md hover:bg-[var(--ib-hover)] flex items-center justify-center ib-mut"><i class="icon-more-vertical text-sm"></i></button>
            </div>
            <p class="text-[11px] ib-mut mt-1.5 truncate">${b.diag} · ${b.type}</p>
            <div class="flex items-center gap-1.5 mt-1.5 text-[10px] flex-wrap">
                <span class="ib-chip" style="background:color-mix(in srgb,${b.crit?'#ef4444':'#22c55e'} 13%,transparent);color:${b.crit?'#dc2626':'#16a34a'}"><span class="ib-monidot ib-live" style="background:${b.crit?'#ef4444':'#22c55e'}"></span> ${b.hr} · ${b.spo2}%</span>
                ${b.vent?'<span class="ib-chip" style="background:color-mix(in srgb,#a855f7 15%,transparent);color:#9333ea"><i class="icon-wind"></i> Vent</span>':''}
                ${b.iso?'<span class="ib-chip" style="background:color-mix(in srgb,#14b8a6 15%,transparent);color:#0d9488"><i class="icon-shield"></i> Iso</span>':''}
            </div>
            <div class="prev mt-1.5 pt-1.5 border-t" style="border-color:var(--ib-border)"><p class="text-[10px] ib-mut"><i class="icon-stethoscope"></i> ${b.doc}</p><p class="text-[10px] ib-mut"><i class="icon-user-check"></i> ${b.nurse} · Disc. ${b.disc}</p></div>
        </div>`;
    }
    function renderFloor(){
        const zones=zoneFilter==='ALL'?ZONES:ZONES.filter(z=>z[0]===zoneFilter);
        $('#ib-floor').innerHTML=zones.map(z=>{
            let list=BEDS.filter(b=>b.zone===z[0]);
            if(statusFilter) list=list.filter(b=>b.status===statusFilter);
            if(bedQ){ const q=bedQ.toLowerCase(); list=list.filter(b=>b.label.toLowerCase().includes(q)||(b.name&&b.name.toLowerCase().includes(q))||(b.mrn&&b.mrn.toLowerCase().includes(q))||b.type.toLowerCase().includes(q)); }
            if(!list.length) return '';
            const o=list.filter(b=>b.status==='occupied').length;
            return `<div>
                <div class="flex items-center gap-2 mb-2"><span class="ib-chip" style="background:color-mix(in srgb,#6366f1 14%,transparent);color:#4f46e5"><i class="icon-hospital"></i> ${z[1]}</span><span class="text-[11px] ib-mut">${o}/${list.length} occupied</span><div class="flex-1 h-px" style="background:var(--ib-border)"></div></div>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">${list.map(bedCard).join('')}</div>
            </div>`;
        }).join('')||`<p class="text-sm ib-mut text-center py-6">No beds match your filter.</p>`;
    }

    /* ============ BED WORKSPACE ============ */
    function renderWorkspace(){
        const b=BEDS.find(x=>x.id===activeId)||BEDS[0]; activeId=b.id;
        const bc=statusColor(b);
        const box=(t,ic,body)=>`<div class="ib-panel p-3"><p class="text-[11px] font-bold ib-mut uppercase tracking-wide mb-2 flex items-center gap-1.5"><i class="${ic} text-indigo-500"></i> ${t}</p>${body}</div>`;
        const row=(k,v)=>`<div class="flex justify-between text-xs py-0.5"><span class="ib-mut">${k}</span><span class="font-medium ib-head">${v}</span></div>`;
        const occ=b.status==='occupied';
        $('#ib-workspace').innerHTML=`
            <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                    <span class="rounded-xl flex items-center justify-center flex-none" style="width:48px;height:48px;background:color-mix(in srgb,${bc} 16%,transparent);color:${bc}"><i class="icon-bed text-2xl"></i></span>
                    <div><p class="text-lg font-bold ib-head">${b.label}</p><p class="text-[11px] ib-mut">${b.zlabel} · ${b.type}${b.iso?' · Isolation':''}</p></div>
                </div>
                <div class="flex items-center gap-2"><span class="ib-chip" style="background:color-mix(in srgb,${bc} 16%,transparent);color:${bc}">${STLABEL[b.status]}</span><button data-menu="${b.id}" class="w-8 h-8 rounded-lg border flex items-center justify-center ib-mut" style="border-color:var(--ib-border)"><i class="icon-more-vertical"></i></button></div>
            </div>
            <div class="grid sm:grid-cols-2 gap-3">
                ${box('Bed Information','icon-info',row('Bed No',b.label)+row('Zone',b.zlabel)+row('Type',b.type)+row('Isolation',b.iso?'Yes':'No')+row('Status',STLABEL[b.status]))}
                ${occ?box('Patient Information','icon-user',row('Name',b.name)+row('MRN',b.mrn)+row('Age / Sex',b.age+'y / '+b.gender)+row('Blood',b.blood)+row('Diagnosis',b.diag)):box('Current Occupancy','icon-user-x','<p class="text-xs ib-mut">'+(b.status==='reserved'?'Reserved for '+b.resFor+' (ETA '+b.resEta+')':'No patient assigned — bed '+STLABEL[b.status].toLowerCase()+'.')+'</p>')}
                ${box('Admission & Discharge','icon-calendar',occ?row('Admitted','Day '+b.los)+row('Expected Discharge',b.disc)+row('Consultant',b.doc):row('Last Occupied','2 days ago')+row('Avg Turnover','48 min'))}
                ${box('Cleaning Schedule','icon-spray-can',row('Status',b.status==='cleaning'?'In progress ('+b.clean+'%)':'Completed')+row('Last Clean','Today 06:20')+row('Next Due','On discharge'))}
                ${box('Maintenance History','icon-wrench',row('Status',b.maint?'Under service':'Operational')+row('Last Service','Jul 12')+row('Next Check','Aug 12'))}
                ${box('Assigned Equipment','icon-cpu','<div class="flex flex-wrap gap-1">'+['Ventilator','ECG Monitor','Infusion Pump'].map(e=>`<span class="ib-chip" style="background:color-mix(in srgb,#0ea5e9 12%,transparent);color:#0284c7">${e}</span>`).join('')+'</div>')}
                ${box('Assigned Staff','icon-users',row('Doctor',b.doc)+row('Nurse',b.nurse)+row('Housekeeping',HK[b.id%HK.length]))}
                ${box('Transfer History','icon-arrow-left-right',(occ?['Admitted from ER','Moved from ICU-B-02']:['Discharged to General','Deep clean completed']).map(x=>`<div class="flex items-center gap-2 text-xs py-0.5"><i class="icon-dot text-indigo-500"></i> ${x}</div>`).join(''))}
            </div>
            ${box('Bed Notes','icon-sticky-note','<p class="text-xs ib-mut">'+(occ?(b.crit?'Critical patient — 1:1 nursing, continuous monitoring.':'Stable. Standard monitoring, review on next round.'):'Bed prepared per ICU protocol. Ready as scheduled.')+'</p>')}
            <div class="flex flex-wrap gap-2 mt-3">
                ${occ?'<button data-modal="release" class="text-xs font-semibold px-3 py-2 rounded-lg bg-[var(--ib-c)] text-white hover:opacity-90"><i class="icon-bed"></i> Release</button><button data-modal="transfer" class="text-xs font-semibold px-3 py-2 rounded-lg border ib-head hover:bg-[var(--ib-hover)]" style="border-color:var(--ib-border)"><i class="icon-arrow-left-right"></i> Transfer</button>':'<button data-modal="allocate" class="text-xs font-semibold px-3 py-2 rounded-lg bg-[var(--ib-c)] text-white hover:opacity-90"><i class="icon-bed"></i> Allocate</button><button data-modal="reserve" class="text-xs font-semibold px-3 py-2 rounded-lg border ib-head hover:bg-[var(--ib-hover)]" style="border-color:var(--ib-border)"><i class="icon-bookmark"></i> Reserve</button>'}
                <button data-modal="equipment" class="text-xs font-semibold px-3 py-2 rounded-lg border ib-head hover:bg-[var(--ib-hover)]" style="border-color:var(--ib-border)"><i class="icon-cpu"></i> Equipment</button>
                <button data-modal="cleaning" class="text-xs font-semibold px-3 py-2 rounded-lg border ib-head hover:bg-[var(--ib-hover)]" style="border-color:var(--ib-border)"><i class="icon-spray-can"></i> Cleaning</button>
            </div>`;
        renderTimeline();
    }

    /* ============ STATUS MATRIX ============ */
    function ring(p,color,label,val){ return `<div class="ib-panel p-3 flex flex-col items-center text-center">
        <div class="relative w-16 h-16"><svg viewBox="0 0 36 36" class="ib-ring w-16 h-16"><circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--ib-track)" stroke-width="3.4"/><circle class="bar" cx="18" cy="18" r="15.9" fill="none" stroke="${color}" stroke-width="3.4" stroke-linecap="round" pathLength="100" style="--p:${p}"/></svg><span class="absolute inset-0 flex items-center justify-center text-sm font-bold" style="color:${color}">${val}</span></div>
        <p class="text-[11px] font-semibold ib-head mt-1.5">${label}</p></div>`; }
    function renderMatrix(){
        const total=BEDS.length;
        const m=[
            ['occupied',count('occupied'),'#ef4444','Occupied'],
            ['available',count('available'),'#22c55e','Available'],
            ['reserved',count('reserved'),'#3b82f6','Reserved'],
            ['cleaning',count('cleaning'),'#eab308','Cleaning'],
            ['maintenance',count('maintenance'),'#f97316','Maintenance'],
            ['isolation',BEDS.filter(b=>b.iso).length,'#14b8a6','Isolation'],
        ];
        $('#ib-matrix').innerHTML=m.map(x=>ring(Math.round(x[1]/total*100),x[2],x[3],x[1])).join('');
    }

    /* ============ CLEANING KANBAN ============ */
    const KCOLS=[['Pending Cleaning','#f59e0b'],['Cleaning','#0ea5e9'],['Inspection','#a855f7'],['Ready','#22c55e']];
    let CTASKS=[
        {id:1,bed:'ICU-A-04',col:'Pending Cleaning',staff:'H. Kumar',eta:'15m',prio:'High',check:'3/6'},
        {id:2,bed:'ICU-B-02',col:'Cleaning',staff:'H. Bibi',eta:'8m',prio:'Critical',check:'4/6'},
        {id:3,bed:'CCU-03',col:'Cleaning',staff:'H. Raju',eta:'12m',prio:'Medium',check:'2/6'},
        {id:4,bed:'ICU-A-01',col:'Inspection',staff:'Supervisor',eta:'5m',prio:'High',check:'6/6'},
        {id:5,bed:'NICU-02',col:'Pending Cleaning',staff:'H. Sunita',eta:'20m',prio:'Low',check:'0/6'},
        {id:6,bed:'PICU-01',col:'Ready',staff:'H. Kumar',eta:'—',prio:'Low',check:'6/6'},
        {id:7,bed:'ISO-02',col:'Cleaning',staff:'H. Bibi',eta:'25m',prio:'Critical',check:'1/6'},
    ];
    const prioC={Critical:'#dc2626',High:'#ea580c',Medium:'#ca8a04',Low:'#16a34a'};
    function renderKanban(){
        $('#ib-kanban').innerHTML=KCOLS.map(c=>{
            const list=CTASKS.filter(t=>t.col===c[0]);
            return `<div class="ib-kcol p-2.5" data-kcol="${c[0]}">
                <div class="flex items-center justify-between mb-2 px-1"><span class="text-sm font-bold ib-head flex items-center gap-1.5"><span class="ib-dot" style="background:${c[1]}"></span> ${c[0]}</span><span class="ib-chip" style="background:color-mix(in srgb,${c[1]} 15%,transparent);color:${c[1]}">${list.length}</span></div>
                <div class="space-y-2 min-h-[40px]" data-kbody="${c[0]}">
                ${list.map(t=>`<div class="ib-ktask" draggable="true" data-task="${t.id}" style="border-left:3px solid ${prioC[t.prio]}">
                    <div class="flex items-center justify-between"><span class="text-sm font-bold ib-head"><i class="icon-bed text-sm" style="color:${prioC[t.prio]}"></i> ${t.bed}</span><span class="ib-chip" style="background:color-mix(in srgb,${prioC[t.prio]} 13%,transparent);color:${prioC[t.prio]}">${t.prio}</span></div>
                    <div class="flex items-center justify-between text-[10px] ib-mut mt-1.5"><span><i class="icon-user"></i> ${t.staff}</span><span><i class="icon-clock"></i> ETA ${t.eta}</span></div>
                    <div class="flex items-center justify-between mt-1"><span class="text-[10px] ib-mut"><i class="icon-list-checks"></i> Checklist ${t.check}</span><i class="icon-grip-vertical ib-mut text-xs"></i></div>
                </div>`).join('')||`<p class="text-[11px] ib-mut text-center py-2">Drop beds here</p>`}
                </div></div>`;
        }).join('');
    }
    let dragId=null;
    document.addEventListener('dragstart',e=>{ const t=e.target.closest('[data-task]'); if(t){ dragId=+t.dataset.task; t.classList.add('drag'); } });
    document.addEventListener('dragend',e=>{ const t=e.target.closest('[data-task]'); if(t) t.classList.remove('drag'); $$('.ib-kcol').forEach(c=>c.classList.remove('over')); });
    document.addEventListener('dragover',e=>{ const c=e.target.closest('[data-kcol]'); if(c){ e.preventDefault(); $$('.ib-kcol').forEach(x=>x.classList.toggle('over',x===c)); } });
    document.addEventListener('drop',e=>{ const c=e.target.closest('[data-kcol]'); if(c&&dragId!=null){ e.preventDefault(); const t=CTASKS.find(x=>x.id===dragId); if(t){ t.col=c.dataset.kcol; renderKanban(); toast(t.bed+' → '+t.col,'icon-spray-can'); } dragId=null; } });

    /* ============ TRANSFERS ============ */
    const TRANSFERS=[
        {pt:'Rahul Sharma',from:'ER',to:'ICU-A-05',doc:'Dr. Mehta',prio:'Critical',eta:'10m',type:'Incoming',av:'#ef4444'},
        {pt:'Anita Reddy',from:'ICU-B-02',to:'General Ward',doc:'Dr. Kapoor',prio:'Medium',eta:'30m',type:'Outgoing',av:'#a855f7'},
        {pt:'Vikram Nair',from:'PICU-03',to:'ICU-A-04',doc:'Dr. Nair',prio:'High',eta:'15m',type:'Incoming',av:'#0ea5e9'},
        {pt:'Priya Patel',from:'ICU-A-01',to:'Isolation ICU',doc:'Dr. Khan',prio:'Critical',eta:'5m',type:'Emergency',av:'#f97316'},
        {pt:'Suresh Gupta',from:'CCU-02',to:'Cardiac Step-down',doc:'Dr. Rao',prio:'Low',eta:'—',type:'Completed',av:'#22c55e'},
        {pt:'Meera Singh',from:'ICU-B-04',to:'ICU-A-06',doc:'Dr. Mehta',prio:'Medium',eta:'20m',type:'Outgoing',av:'#ec4899'},
    ];
    let trTab='All';
    const trTypeC={Incoming:'#22c55e',Outgoing:'#0ea5e9',Emergency:'#ef4444',Completed:'#64748b'};
    function renderTransfers(){
        const list=TRANSFERS.filter(t=>trTab==='All'||t.type===trTab);
        $('#ib-transfers').innerHTML=list.map(t=>`<div class="ib-panel p-3" style="border-left:3px solid ${trTypeC[t.type]}">
            <div class="flex items-center gap-2 mb-2"><span class="rounded-lg flex items-center justify-center text-white font-bold flex-none" style="width:34px;height:34px;background:${t.av};font-size:11px">${t.pt.split(' ').map(n=>n[0]).join('')}</span><div class="min-w-0 flex-1"><p class="text-sm font-semibold ib-head truncate">${t.pt}</p><p class="text-[10px] ib-mut">${t.doc}</p></div><span class="ib-chip" style="background:color-mix(in srgb,${trTypeC[t.type]} 14%,transparent);color:${trTypeC[t.type]}">${t.type}</span></div>
            <div class="flex items-center gap-1.5 text-[11px] ib-head"><span class="ib-chip" style="background:var(--ib-hover)">${t.from}</span><i class="icon-arrow-right ib-mut"></i><span class="ib-chip" style="background:var(--ib-hover)">${t.to}</span></div>
            <div class="flex items-center justify-between mt-2 text-[11px]"><span class="ib-chip" style="background:color-mix(in srgb,${prioC[t.prio]} 13%,transparent);color:${prioC[t.prio]}">${t.prio}</span><span class="ib-mut"><i class="icon-clock"></i> ETA ${t.eta}</span></div>
        </div>`).join('')||`<p class="text-sm ib-mut col-span-3 text-center py-4">No transfers in this category.</p>`;
    }

    // Equipment Assignment (#ib-equipment) and Care Team Assignment (#ib-team)
    // panels are static demo content with no mutation path anywhere in this
    // file, so their markup now lives directly in icu-beds.html and the old
    // renderEquip()/renderTeam() one-time-build functions were removed.

    /* ============ TIMELINE ============ */
    const TLINE=[
        ['Bed Allocated','Day 1 · 02:14','Charge Nurse','Assigned to R. Sharma','icon-bed','#6366f1'],
        ['Patient Admitted','Day 1 · 02:20','Dr. Mehta','From ER · Acute MI','icon-user-plus','#0ea5e9'],
        ['Equipment Assigned','Day 1 · 02:35','RT Thomas','Ventilator VENT-04','icon-cpu','#a855f7'],
        ['Cleaning Started','Day 3 · 10:00','H. Kumar','Post-procedure clean','icon-spray-can','#eab308'],
        ['Cleaning Completed','Day 3 · 10:48','H. Kumar','Turnover 48 min','icon-check','#22c55e'],
        ['Maintenance','Day 4 · 09:00','Bio-medical','Monitor calibration','icon-wrench','#f97316'],
        ['Patient Transfer','Day 5 · 14:20','Dr. Kapoor','→ ICU-A-06','icon-arrow-left-right','#ec4899'],
    ];
    function renderTimeline(){
        const b=BEDS.find(x=>x.id===activeId);
        $('#ib-tl-bed').textContent=b?b.label:'—';
        $('#ib-timeline').innerHTML=TLINE.map(t=>`<div class="ib-tl-item" style="--tc:${t[5]}"><div class="flex items-start gap-2"><div class="min-w-0 flex-1"><p class="text-sm font-semibold ib-head flex items-center gap-1.5"><i class="${t[4]}" style="color:${t[5]}"></i> ${t[0]}</p><p class="text-[11px] ib-mut mt-0.5">${t[3]}</p><p class="text-[10px] ib-mut">${t[2]}</p></div><span class="text-[11px] ib-mut whitespace-nowrap">${t[1]}</span></div></div>`).join('');
    }

    // Recent Bed Activities panel (#ib-activities) is static demo content
    // (each item's "Xm ago" was decorative Math.random(), not a real event)
    // with no mutation path, so its markup now lives directly in
    // icu-beds.html and the old renderActs() one-time-build function was
    // removed.

    /* ============ CAPACITY RIBBON ============ */
    const ALERTS=[
        ['avail','#16a34a','Bed ICU-A12 Available','icon-bed'],
        ['crit','#dc2626','ICU-B07 Critical Occupancy','icon-alert-triangle'],
        ['clean','#ca8a04','Bed Cleaning Completed — CCU-03','icon-spray-can'],
        ['avail','#2563eb','Patient Transfer Scheduled — PICU-03','icon-arrow-left-right'],
        ['clean','#ea580c','Isolation Bed Reserved — ISO-02','icon-shield'],
        ['crit','#dc2626','Emergency bed requested — ICU-A','icon-ambulance'],
    ];
    let capF='all';
    function renderRibbon(){
        let list=ALERTS.filter(a=>capF==='all'||a[0]===capF);
        if(!list.length) list=[['avail','#16a34a','No items in this category','icon-check']];
        const one=list.map(a=>`<span class="ib-alert" style="background:color-mix(in srgb,${a[1]} 13%,transparent);color:${a[1]};border-color:color-mix(in srgb,${a[1]} 35%,transparent)"><i class="${a[3]}"></i> ${a[2]}</span>`).join('');
        $('#ib-ribbon').innerHTML=one+one;
    }

    /* ============ MENU / MODALS ============ */
    const ACTIONS=[['View Bed','icon-eye','view'],['Allocate Bed','icon-bed','allocate'],['Reserve Bed','icon-bookmark','reserve'],['Release Bed','icon-bed','release'],['Transfer Patient','icon-arrow-left-right','transfer'],['Assign Doctor','icon-stethoscope','doctor'],['Assign Nurse','icon-user-check','nurse'],['Assign Equipment','icon-cpu','equipment'],['Mark Cleaning','icon-spray-can','cleaning'],['Mark Maintenance','icon-wrench','maintenance'],['View History','icon-history','history'],['Print Details','icon-printer','print'],['Download PDF','icon-file-down','pdf'],['Archive','icon-archive','archive'],['Delete','icon-trash-2','delete']];
    function openMenu(id,x,y){ closeMenu(); $('#ib-menuhost').innerHTML=`<div class="ib-menu" id="ib-openmenu">${ACTIONS.map(a=>`<button data-action="${a[2]}" data-bid="${id}" class="${a[2]==='delete'?'danger':''}"><i class="${a[1]}"></i> ${a[0]}</button>`).join('')}</div>`; const m=$('#ib-openmenu'); const r=m.getBoundingClientRect(); m.style.left=Math.max(12,Math.min(x,window.innerWidth-r.width-12))+'px'; m.style.top=Math.max(12,Math.min(y,window.innerHeight-r.height-12))+'px'; }
    function closeMenu(){ $('#ib-menuhost').innerHTML=''; }

    const fld=(l,el)=>`<div><label class="text-[11px] font-semibold ib-mut">${l}</label>${el}</div>`;
    const inp=(ph)=>`<input class="ib-in mt-1" placeholder="${ph||''}">`;
    const selE=(o)=>`<select class="ib-in mt-1">${o.map(x=>`<option>${x}</option>`).join('')}</select>`;
    const drop=(t)=>`<div class="ib-drop rounded-xl h-28 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[var(--ib-hover)]"><i class="icon-cloud-upload text-3xl ib-mut"></i><p class="text-sm font-semibold mt-1 ib-head">${t}</p></div>`;
    const bedOpts=BEDS.map(b=>b.label+' · '+STLABEL[b.status]);
    const chk=(items)=>`<div class="space-y-1.5">${items.map(x=>`<label class="flex items-center gap-2 text-sm ib-head"><input type="checkbox" class="accent-[var(--ib-c)]" checked> ${x}</label>`).join('')}</div>`;
    const MODALS={
        allocate:{t:'Allocate Bed',ic:'icon-bed',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('Patient / MRN',inp('Search patient...'))}${fld('Bed',selE(bedOpts))}${fld('Bed Type',selE(BEDTYPES))}${fld('Admission Type',selE(['General','Emergency','Transfer']))}${fld('Doctor',selE(DOCS))}${fld('Nurse',selE(NURSES))}</div>`,cta:'Allocate Bed'},
        reserve:{t:'Reserve Bed',ic:'icon-bookmark',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('Bed',selE(bedOpts))}${fld('Reserve For',inp('Patient name'))}${fld('Expected Arrival',selE(['Within 1h','1–3h','3–6h','Today']))}${fld('Reason',selE(['Scheduled Admission','Post-Op','Transfer In','Emergency Hold']))}</div>`,cta:'Reserve Bed'},
        release:{t:'Release Bed',ic:'icon-bed',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('Bed',selE(bedOpts))}${fld('Reason',selE(['Discharge','Transfer Out','Deceased','Bed Swap']))}${fld('Next Status',selE(['Cleaning','Available','Maintenance']))}${fld('Housekeeping',selE(HK))}</div>`,cta:'Release Bed'},
        transfer:{t:'Transfer Patient',ic:'icon-arrow-left-right',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('Patient',inp('Search...'))}${fld('From Bed',selE(bedOpts))}${fld('To Bed',selE(bedOpts))}${fld('Priority',selE(['Critical','High','Medium','Low']))}${fld('Reason',selE(['Escalation','Step-down','Isolation','Specialty']))}${fld('ETA',selE(['Immediate','15 min','30 min','1h']))}</div>`,cta:'Confirm Transfer'},
        emergency:{t:'Emergency Bed Allocation',ic:'icon-alert-triangle',body:`<div class="rounded-lg p-2.5 text-xs mb-3 flex items-center gap-2" style="background:color-mix(in srgb,#ef4444 12%,transparent);color:#dc2626;border:1px solid color-mix(in srgb,#ef4444 35%,transparent)"><i class="icon-alert-triangle"></i> System will auto-select the nearest available critical-care bed</div><div class="grid sm:grid-cols-2 gap-3">${fld('Patient / Unknown',inp('Name or "Unknown"'))}${fld('Presenting',selE(['Cardiac Arrest','Trauma','Respiratory Failure','Sepsis']))}${fld('Preferred Zone',selE(['Auto','ICU-A','ICU-B','CCU']))}${fld('Ventilator',selE(['Required','Not required']))}</div>`,cta:'Allocate Emergency Bed'},
        doctor:{t:'Assign Doctor',ic:'icon-stethoscope',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('Bed',selE(bedOpts))}${fld('Doctor',selE(DOCS))}${fld('Role',selE(['Intensivist','Consultant','Resident']))}${fld('Shift',selE(['Day','Night']))}</div>`,cta:'Assign Doctor'},
        nurse:{t:'Assign Nurse',ic:'icon-user-check',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('Bed',selE(bedOpts))}${fld('Nurse',selE(NURSES))}${fld('Shift',selE(['Day','Night']))}${fld('Ratio',selE(['1:1','1:2']))}</div>`,cta:'Assign Nurse'},
        equipment:{t:'Assign Equipment',ic:'icon-cpu',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('Bed',selE(bedOpts))}${fld('Equipment',selE(['Ventilator','ECG Monitor','Infusion Pump','Defibrillator','Oxygen','Syringe Pump','Portable Monitor']))}${fld('Equipment ID',inp('e.g. VENT-04'))}${fld('Duration',selE(['Continuous','Procedure only','Standby']))}</div>`,cta:'Assign Equipment'},
        cleaning:{t:'Cleaning Checklist',ic:'icon-spray-can',body:`<div class="grid sm:grid-cols-2 gap-3 mb-3">${fld('Bed',selE(bedOpts))}${fld('Assign Staff',selE(HK))}</div><p class="text-[11px] font-semibold ib-mut uppercase mb-2">Turnover checklist</p>${chk(['Linen change','Surface disinfection','Equipment wipe-down','Waste disposal','Floor mopping','Final inspection'])}`,cta:'Start Cleaning'},
        maintenance:{t:'Maintenance Request',ic:'icon-wrench',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('Bed',selE(bedOpts))}${fld('Issue',selE(['Bed frame','Electrical','Monitor','Oxygen port','Call system','Other']))}${fld('Priority',selE(['Low','Medium','High','Urgent']))}${fld('Assign To',selE(['Bio-medical','Facilities','Electrical']))}</div><div class="mt-3">${fld('Description',`<textarea class="ib-in mt-1" rows="2" placeholder="Describe issue..."></textarea>`)}</div>`,cta:'Submit Request'},
        import:{t:'Import Beds',ic:'icon-upload',body:`<div class="flex gap-2 mb-3">${['CSV','Excel','Bed Master'].map(f=>`<span class="ib-chip" style="background:color-mix(in srgb,var(--ib-c) 14%,transparent);color:var(--ib-c)">${f}</span>`).join('')}</div>${drop('Drop CSV / Excel / Bed Master file')}<button class="text-xs font-semibold text-[var(--ib-c)] hover:underline mt-2"><i class="icon-download"></i> Download sample template</button><div class="mt-3 rounded-lg p-3 text-xs flex items-center gap-2" style="background:color-mix(in srgb,#22c55e 12%,transparent);color:#16a34a;border:1px solid color-mix(in srgb,#22c55e 30%,transparent)"><i class="icon-circle-check"></i> Validation passed · 29 beds · 0 errors</div>`,cta:'Import Beds'},
        export:{t:'Export Bed Report',ic:'icon-download',body:`<p class="text-xs ib-mut mb-2">Choose format & scope</p><div class="grid grid-cols-2 gap-2">${['CSV','Excel','PDF','Print','Occupancy Report','Capacity Report','Cleaning Report','Equipment Report'].map(f=>`<button data-expfmt="${f}" class="text-xs font-semibold border rounded-lg px-3 py-2 hover:bg-[var(--ib-hover)] ib-head" style="border-color:var(--ib-border)">${f}</button>`).join('')}</div>`,cta:'Export'},
        history:{t:'Bed History',ic:'icon-history',body:`<div class="ib-tl">${TLINE.slice(0,6).map(t=>`<div class="ib-tl-item" style="--tc:${t[5]}"><p class="text-sm font-semibold ib-head"><i class="${t[4]}" style="color:${t[5]}"></i> ${t[0]}</p><p class="text-[11px] ib-mut">${t[3]} · ${t[1]}</p></div>`).join('')}</div>`,cta:'Close'},
    };
    const SIMPLE={pdf:'PDF downloaded',print:'Printing bed details...',archive:'Bed archived'};
    function statusFromAction(a){ return {allocate:'occupied',reserve:'reserved',release:'available',cleaning:'cleaning',maintenance:'maintenance'}[a]; }
    function openModal(key){ const m=MODALS[key]; if(!m) return; $('#ib-modalhost').innerHTML=`<div class="ib-modal-wrap open"><div class="ib-modal-bg" data-close></div><div class="ib-modal"><div class="ib-modal-head"><span class="ib-modal-badge"><i class="${m.ic}"></i></span><div class="min-w-0"><h3 class="font-bold ib-head leading-tight">${m.t}</h3><p class="text-[11px] ib-mut">${m.sub||'Review the details and confirm.'}</p></div><button data-close class="ml-auto w-8 h-8 rounded-lg hover:bg-[var(--ib-hover)] flex items-center justify-center ib-mut"><i class="icon-x"></i></button></div><div class="ib-modal-body">${m.body}</div><div class="ib-modal-foot"><button data-close class="ib-btn ib-btn-ghost">Cancel</button><button data-modalok="${key}" class="ib-btn ib-btn-primary"><i class="${m.ic}"></i> ${m.cta}</button></div></div></div>`; document.body.style.overflow = "hidden"; }
    function openDelete(msg,onOk){ $('#ib-modalhost').innerHTML=`<div class="ib-modal-wrap open"><div class="ib-modal-bg" data-close></div><div class="ib-modal" style="width:min(420px,94vw)"><div class="p-5 text-center"><div class="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style="background:color-mix(in srgb,#ef4444 15%,transparent);color:#dc2626"><i class="icon-alert-triangle text-2xl"></i></div><h3 class="font-bold text-lg ib-head">Confirm</h3><p class="text-xs ib-mut mt-1">${msg}</p><div class="flex gap-2 mt-4"><button data-close class="flex-1 text-sm font-semibold px-3 py-2 rounded-lg border ib-head hover:bg-[var(--ib-hover)]" style="border-color:var(--ib-border)">Cancel</button><button id="ib-delok" class="flex-1 text-sm font-semibold px-3 py-2 rounded-lg bg-rose-500 text-white hover:bg-rose-400">Delete</button></div></div></div></div>`; document.body.style.overflow = "hidden"; $('#ib-delok').onclick=()=>{ onOk(); closeModal(); }; }
    function closeModal(){ $('#ib-modalhost').innerHTML=''; document.body.style.overflow = ""; }

    function updateBulk(){ $('#ib-selcount').textContent=sel.size; $('.ib-bulk').classList.toggle('show',sel.size>0); }
    function refreshOps(){ renderHero(); renderFloor(); renderMatrix(); renderWorkspace(); }

    /* ============ EVENTS ============ */
    document.addEventListener('click',e=>{
        if(e.target.closest('[data-zone]')){ zoneFilter=e.target.closest('[data-zone]').dataset.zone; renderZoneTabs(); renderFloor(); return; }
        if(e.target.closest('[data-cap]')){ const b=e.target.closest('[data-cap]'); capF=b.dataset.cap; $$('#ib-capfilter button').forEach(x=>x.classList.toggle('on',x===b)); renderRibbon(); return; }
        if(e.target.closest('[data-trtab]')){ const b=e.target.closest('[data-trtab]'); trTab=b.dataset.trtab; $$('#ib-transtabs button').forEach(x=>x.classList.toggle('on',x===b)); renderTransfers(); return; }
        const t=e.target.closest('[data-bed],[data-menu],[data-action],[data-modal],[data-modalok],[data-close],[data-dismiss-alerts],[data-bulk],[data-expfmt]');
        if(!t){ if(!e.target.closest('.ib-menu')) closeMenu(); return; }
        if(t.dataset.bed!==undefined){ activeId=+t.dataset.bed; renderFloor(); renderWorkspace(); document.getElementById('ib-workspace').scrollIntoView({behavior:'smooth',block:'start'}); return; }
        if(t.dataset.menu!==undefined){ const r=t.getBoundingClientRect(); openMenu(+t.dataset.menu,r.left-190,r.bottom+4); return; }
        if(t.dataset.action!==undefined){ const a=t.dataset.action, id=+t.dataset.bid; closeMenu(); activeId=id;
            if(a==='view'){ renderFloor(); renderWorkspace(); document.getElementById('ib-workspace').scrollIntoView({behavior:'smooth'}); }
            else if(['allocate','reserve','release','cleaning','maintenance'].includes(a)){ const b=BEDS.find(x=>x.id===id); if(b){ b.status=statusFromAction(a); if(a==='allocate'&&!b.name){ b.name=NAMES[id%NAMES.length]; b.mrn='MRN-'+(30500+id); b.age=rnd(20,80); b.gender=id%2?'Male':'Female'; b.blood=BLOOD[id%BLOOD.length]; b.diag=DIAG[id%DIAG.length]; b.los=1; b.hr=rnd(60,120); b.spo2=rnd(90,99); b.crit=false; b.vent=false; b.disc='Jul '+rnd(22,28); } } refreshOps(); toast('Bed '+STLABEL[b.status].toLowerCase(),'icon-bed'); }
            else if(MODALS[a]) openModal(a);
            else if(a==='delete') openDelete('Remove this bed from the floor plan?',()=>{ BEDS=BEDS.filter(x=>x.id!==id); sel.delete(id); if(activeId===id) activeId=BEDS[0]?.id; refreshOps(); toast('Bed removed','icon-trash-2'); });
            else if(SIMPLE[a]) toast(SIMPLE[a]);
            return; }
        if(t.dataset.modal!==undefined){ openModal(t.dataset.modal); return; }
        if(t.dataset.modalok!==undefined){ const k=t.dataset.modalok; if(k==='history'){closeModal();return;} const st=statusFromAction(k); if(st){ const b=BEDS.find(x=>x.id===activeId); if(b){ b.status=st; refreshOps(); } } toast(MODALS[k].cta+' — done','icon-check'); closeModal(); return; }
        if(t.dataset.expfmt!==undefined){ toast('Exported: '+t.dataset.expfmt,'icon-download'); closeModal(); return; }
        if(t.dataset.close!==undefined){ closeModal(); return; }
        if(t.dataset.dismissAlerts!==undefined){ $('#ib-ribbonwrap').style.display='none'; toast('Capacity feed dismissed','icon-bell-off'); return; }
        if(t.dataset.bulk!==undefined){ const bk=t.dataset.bulk;
            if(bk==='delete') openDelete(`Delete ${sel.size} selected bed(s)?`,()=>{ BEDS=BEDS.filter(b=>!sel.has(b.id)); sel.clear(); refreshOps(); updateBulk(); toast('Beds removed','icon-trash-2'); });
            else { const st=statusFromAction(bk); if(st){ BEDS.forEach(b=>{ if(sel.has(b.id)) b.status=st; }); refreshOps(); } toast({allocate:'Allocated',reserve:'Reserved',release:'Released',cleaning:'Marked cleaning',maintenance:'Marked maintenance',staff:'Staff assigned',export:'Exported',print:'Printing'}[bk]+' · '+sel.size+' beds'); if(['staff','export','print'].includes(bk)===false){ sel.clear(); updateBulk(); } }
            return; }
    });
    document.addEventListener('change',e=>{
        if(e.target.dataset.sel!==undefined){ const id=+e.target.dataset.sel; e.target.checked?sel.add(id):sel.delete(id); updateBulk(); return; }
        if(e.target.id==='ib-statusfilter'){ statusFilter=e.target.value; renderFloor(); }
    });
    document.addEventListener('input',e=>{ if(e.target.id==='ib-bedsearch'){ bedQ=e.target.value; renderFloor(); } });

    function animateRings(){ $$('.ib-ring .bar').forEach(b=>{ const p=b.style.getPropertyValue('--p'); b.style.setProperty('--p','0'); requestAnimationFrame(()=>requestAnimationFrame(()=>b.style.setProperty('--p',p))); }); }
    function clock(){ $('#ib-clock').textContent=new Date().toLocaleTimeString('en-GB'); }

    /* ============ INIT ============ */
    // Hero stats, zone tabs/legend, the bed floor map, bed workspace, status
    // matrix, cleaning kanban, transfers, equipment, care team, timeline and
    // activity feed are now written directly into icu-beds.html as static
    // markup for the frozen BEDS snapshot above, so nothing needs building on
    // load — the render functions above stay only for genuine follow-up
    // interactions (zone/status/search filters, bed click, drag-drop,
    // transfer tabs, capacity filter, allocate/reserve/release/etc mutations).
    setTimeout(()=>{
        $('#ib-skeleton').classList.add('hidden');
        $('#ib-content').classList.remove('hidden');
        animateRings(); clock(); setInterval(clock,1000);
    },1500);
})();
// ==========================================================================
// icu-monitoring.js
// ==========================================================================
(function(){
    "use strict";
    if ((location.pathname.split("/").pop() || "index.html") !== "icu-monitoring.html") return;
    const $=(s,r)=>(r||document).querySelector(s);
    const $$=(s,r)=>Array.from((r||document).querySelectorAll(s));
    const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
    let toastT;
    function toast(msg,icon){ const t=$('#im-toast'); if(!t) return; t.innerHTML=`<i class="${icon||'icon-check'} text-teal-400"></i> ${msg}`; t.classList.add('show'); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove('show'),2500); }

    /* ============ DATA ============ */
    const SEV={red:'Critical',orange:'Serious',yellow:'Observation',green:'Stable',blue:'Recovery',gray:'Offline'};
    const SEVC={red:'#dc2626',orange:'#e06c1f',yellow:'#b7791f',green:'#15803d',blue:'#1d4ed8',gray:'#64748b'};
    const DOCS=['Dr. A. Mehta','Dr. S. Kapoor','Dr. R. Nair','Dr. L. Khan','Dr. P. Rao'];
    const NURSES=['N. Fernandes','N. Pillai','N. Sharma','N. Das','N. Reddy'];
    const DIAG=['Acute MI','Septic Shock','ARDS','Traumatic Brain Injury','Post-CABG','Ischemic Stroke','Multi-organ Failure','Severe Pneumonia','Diabetic Ketoacidosis','Cardiac Arrest'];
    const NAMES=['Rahul Sharma','Anita Reddy','Vikram Nair','Priya Patel','Suresh Gupta','Meera Singh','Arjun Menon','Kavya Das','Deepak Joshi','Neha Verma','Rohan Iyer','Sana Khan'];
    const AVC=['#475569','#0f766e','#1e40af','#4338ca','#0e7490','#334155','#3f6212','#7c2d12'];
    const BLOOD=['O+','A+','B+','AB+','O-','A-'];
    const ZONES=[['ICU-A','ICU A',5],['ICU-B','ICU B',5],['CCU','CCU',4],['NICU','NICU',4],['PICU','PICU',3],['ISO','Isolation ICU',3]];

    // Frozen static seed data (one snapshot of what the old Math.random()-driven
    // mkBed()/ZONES.forEach() loop used to generate randomly on every page load)
    // so the initial overview widgets / vitals dashboard / bed legend / floor
    // map / ventilator panel / activity feed markup can be written directly
    // into the HTML instead of JS-built on load.
    // mkBed() is kept below so any future runtime code can still mint beds the
    // same shape; seq continues on from the highest frozen id.
    let seq=24;
    function mkBed(zone,zlabel,i){
        const empty=Math.random()<0.14;
        const sevs=['red','orange','orange','yellow','yellow','green','green','blue'];
        const sev=empty?'gray':sevs[rnd(0,sevs.length-1)];
        const id=seq++;
        const b={ id, zone, zlabel, label:zone+'-'+String(i+1).padStart(2,'0'), sev, empty };
        if(!empty){
            b.name=NAMES[id%NAMES.length]; b.mrn='MRN-'+(40800+id); b.age=rnd(18,86); b.gender=id%2?'Male':'Female';
            b.blood=BLOOD[id%BLOOD.length]; b.diag=DIAG[id%DIAG.length]; b.los=rnd(1,17); b.vent=Math.random()<0.6; b.iso=zone==='ISO'||Math.random()<0.1;
            b.doc=DOCS[id%DOCS.length]; b.nurse=NURSES[id%NURSES.length]; b.av=AVC[id%AVC.length];
            b.hr=rnd(58,138); b.sys=rnd(88,158); b.dia=rnd(54,96); b.spo2=rnd(86,99); b.temp=(rnd(360,402)/10); b.rr=rnd(12,32);
            b.stab=sev==='red'?rnd(20,42):sev==='orange'?rnd(45,64):sev==='yellow'?rnd(65,80):sev==='blue'?rnd(80,90):rnd(84,98);
            b.alarm=sev==='red'&&Math.random()<0.6;
            b.hist=Array.from({length:12},()=>rnd(60,110));
        }
        return b;
    }
    let BEDS=[{"id":0,"zone":"ICU-A","zlabel":"ICU A","label":"ICU-A-01","sev":"red","empty":false,"name":"Rahul Sharma","mrn":"MRN-40800","age":54,"gender":"Female","blood":"O+","diag":"Acute MI","los":3,"vent":true,"iso":false,"doc":"Dr. A. Mehta","nurse":"N. Fernandes","av":"#475569","hr":122,"sys":141,"dia":54,"spo2":96,"temp":37.7,"rr":18,"stab":33,"alarm":true,"hist":[74,98,107,99,109,78,99,105,91,78,87,106]},{"id":1,"zone":"ICU-A","zlabel":"ICU A","label":"ICU-A-02","sev":"blue","empty":false,"name":"Anita Reddy","mrn":"MRN-40801","age":57,"gender":"Male","blood":"A+","diag":"Septic Shock","los":16,"vent":false,"iso":false,"doc":"Dr. S. Kapoor","nurse":"N. Pillai","av":"#0f766e","hr":97,"sys":145,"dia":71,"spo2":93,"temp":39.4,"rr":26,"stab":85,"alarm":false,"hist":[96,64,96,109,105,61,110,64,88,87,81,60]},{"id":2,"zone":"ICU-A","zlabel":"ICU A","label":"ICU-A-03","sev":"blue","empty":false,"name":"Vikram Nair","mrn":"MRN-40802","age":84,"gender":"Female","blood":"B+","diag":"ARDS","los":3,"vent":false,"iso":false,"doc":"Dr. R. Nair","nurse":"N. Sharma","av":"#1e40af","hr":78,"sys":127,"dia":93,"spo2":97,"temp":36.2,"rr":24,"stab":88,"alarm":false,"hist":[61,61,85,92,91,108,78,66,76,105,61,91]},{"id":3,"zone":"ICU-A","zlabel":"ICU A","label":"ICU-A-04","sev":"red","empty":false,"name":"Priya Patel","mrn":"MRN-40803","age":64,"gender":"Male","blood":"AB+","diag":"Traumatic Brain Injury","los":12,"vent":false,"iso":false,"doc":"Dr. L. Khan","nurse":"N. Das","av":"#4338ca","hr":78,"sys":101,"dia":59,"spo2":94,"temp":39.8,"rr":31,"stab":25,"alarm":false,"hist":[91,91,84,105,91,87,68,75,85,83,93,88]},{"id":4,"zone":"ICU-A","zlabel":"ICU A","label":"ICU-A-05","sev":"blue","empty":false,"name":"Suresh Gupta","mrn":"MRN-40804","age":69,"gender":"Female","blood":"O-","diag":"Post-CABG","los":17,"vent":true,"iso":false,"doc":"Dr. P. Rao","nurse":"N. Reddy","av":"#0e7490","hr":138,"sys":114,"dia":55,"spo2":96,"temp":36.9,"rr":22,"stab":83,"alarm":false,"hist":[63,60,96,78,72,103,70,104,75,98,86,97]},{"id":5,"zone":"ICU-B","zlabel":"ICU B","label":"ICU-B-01","sev":"orange","empty":false,"name":"Meera Singh","mrn":"MRN-40805","age":26,"gender":"Male","blood":"A-","diag":"Ischemic Stroke","los":2,"vent":false,"iso":false,"doc":"Dr. A. Mehta","nurse":"N. Fernandes","av":"#334155","hr":75,"sys":104,"dia":89,"spo2":89,"temp":38.4,"rr":18,"stab":55,"alarm":false,"hist":[74,60,105,93,79,62,109,109,88,85,84,86]},{"id":6,"zone":"ICU-B","zlabel":"ICU B","label":"ICU-B-02","sev":"green","empty":false,"name":"Arjun Menon","mrn":"MRN-40806","age":31,"gender":"Female","blood":"O+","diag":"Multi-organ Failure","los":8,"vent":true,"iso":false,"doc":"Dr. S. Kapoor","nurse":"N. Pillai","av":"#3f6212","hr":102,"sys":96,"dia":74,"spo2":94,"temp":36.6,"rr":32,"stab":90,"alarm":false,"hist":[105,61,81,63,72,75,63,73,95,89,85,85]},{"id":7,"zone":"ICU-B","zlabel":"ICU B","label":"ICU-B-03","sev":"orange","empty":false,"name":"Kavya Das","mrn":"MRN-40807","age":65,"gender":"Male","blood":"A+","diag":"Severe Pneumonia","los":10,"vent":true,"iso":false,"doc":"Dr. R. Nair","nurse":"N. Sharma","av":"#7c2d12","hr":104,"sys":141,"dia":65,"spo2":87,"temp":40,"rr":15,"stab":63,"alarm":false,"hist":[77,61,93,70,78,69,82,98,101,83,81,69]},{"id":8,"zone":"ICU-B","zlabel":"ICU B","label":"ICU-B-04","sev":"orange","empty":false,"name":"Deepak Joshi","mrn":"MRN-40808","age":39,"gender":"Female","blood":"B+","diag":"Diabetic Ketoacidosis","los":10,"vent":false,"iso":false,"doc":"Dr. L. Khan","nurse":"N. Das","av":"#475569","hr":70,"sys":154,"dia":75,"spo2":87,"temp":36.5,"rr":22,"stab":48,"alarm":false,"hist":[71,73,92,82,92,95,93,74,95,74,93,67]},{"id":9,"zone":"ICU-B","zlabel":"ICU B","label":"ICU-B-05","sev":"gray","empty":true},{"id":10,"zone":"CCU","zlabel":"CCU","label":"CCU-01","sev":"red","empty":false,"name":"Rohan Iyer","mrn":"MRN-40810","age":77,"gender":"Female","blood":"O-","diag":"Acute MI","los":12,"vent":false,"iso":false,"doc":"Dr. A. Mehta","nurse":"N. Fernandes","av":"#1e40af","hr":64,"sys":151,"dia":75,"spo2":91,"temp":40,"rr":26,"stab":31,"alarm":false,"hist":[78,73,60,90,61,69,104,109,60,77,96,109]},{"id":11,"zone":"CCU","zlabel":"CCU","label":"CCU-02","sev":"blue","empty":false,"name":"Sana Khan","mrn":"MRN-40811","age":65,"gender":"Male","blood":"A-","diag":"Septic Shock","los":14,"vent":false,"iso":false,"doc":"Dr. S. Kapoor","nurse":"N. Pillai","av":"#4338ca","hr":74,"sys":99,"dia":73,"spo2":88,"temp":37.2,"rr":25,"stab":83,"alarm":false,"hist":[60,92,82,84,76,65,70,85,104,64,99,67]},{"id":12,"zone":"CCU","zlabel":"CCU","label":"CCU-03","sev":"green","empty":false,"name":"Rahul Sharma","mrn":"MRN-40812","age":86,"gender":"Female","blood":"O+","diag":"ARDS","los":17,"vent":false,"iso":false,"doc":"Dr. R. Nair","nurse":"N. Sharma","av":"#0e7490","hr":128,"sys":101,"dia":73,"spo2":97,"temp":38.1,"rr":31,"stab":87,"alarm":false,"hist":[67,97,102,63,105,83,79,69,73,109,73,65]},{"id":13,"zone":"CCU","zlabel":"CCU","label":"CCU-04","sev":"orange","empty":false,"name":"Anita Reddy","mrn":"MRN-40813","age":72,"gender":"Male","blood":"A+","diag":"Traumatic Brain Injury","los":9,"vent":true,"iso":false,"doc":"Dr. L. Khan","nurse":"N. Das","av":"#334155","hr":104,"sys":111,"dia":63,"spo2":86,"temp":39.7,"rr":26,"stab":53,"alarm":false,"hist":[65,91,60,100,64,81,80,77,75,110,94,66]},{"id":14,"zone":"NICU","zlabel":"NICU","label":"NICU-01","sev":"blue","empty":false,"name":"Vikram Nair","mrn":"MRN-40814","age":76,"gender":"Female","blood":"B+","diag":"Post-CABG","los":3,"vent":true,"iso":false,"doc":"Dr. P. Rao","nurse":"N. Reddy","av":"#3f6212","hr":81,"sys":126,"dia":55,"spo2":95,"temp":38.3,"rr":24,"stab":81,"alarm":false,"hist":[81,92,77,106,79,78,92,89,76,85,61,72]},{"id":15,"zone":"NICU","zlabel":"NICU","label":"NICU-02","sev":"gray","empty":true},{"id":16,"zone":"NICU","zlabel":"NICU","label":"NICU-03","sev":"yellow","empty":false,"name":"Suresh Gupta","mrn":"MRN-40816","age":23,"gender":"Female","blood":"O-","diag":"Multi-organ Failure","los":1,"vent":true,"iso":false,"doc":"Dr. S. Kapoor","nurse":"N. Pillai","av":"#475569","hr":75,"sys":135,"dia":57,"spo2":99,"temp":38.6,"rr":20,"stab":66,"alarm":false,"hist":[78,98,79,93,63,101,95,109,78,108,86,67]},{"id":17,"zone":"NICU","zlabel":"NICU","label":"NICU-04","sev":"gray","empty":true},{"id":18,"zone":"PICU","zlabel":"PICU","label":"PICU-01","sev":"yellow","empty":false,"name":"Arjun Menon","mrn":"MRN-40818","age":42,"gender":"Female","blood":"O+","diag":"Diabetic Ketoacidosis","los":7,"vent":true,"iso":false,"doc":"Dr. L. Khan","nurse":"N. Das","av":"#1e40af","hr":70,"sys":91,"dia":96,"spo2":97,"temp":38.5,"rr":22,"stab":69,"alarm":false,"hist":[69,69,76,92,78,61,97,106,91,108,69,109]},{"id":19,"zone":"PICU","zlabel":"PICU","label":"PICU-02","sev":"yellow","empty":false,"name":"Kavya Das","mrn":"MRN-40819","age":83,"gender":"Male","blood":"A+","diag":"Cardiac Arrest","los":7,"vent":true,"iso":false,"doc":"Dr. P. Rao","nurse":"N. Reddy","av":"#4338ca","hr":96,"sys":130,"dia":75,"spo2":89,"temp":38.7,"rr":26,"stab":78,"alarm":false,"hist":[88,62,92,98,100,66,110,104,100,105,66,82]},{"id":20,"zone":"PICU","zlabel":"PICU","label":"PICU-03","sev":"yellow","empty":false,"name":"Deepak Joshi","mrn":"MRN-40820","age":25,"gender":"Female","blood":"B+","diag":"Acute MI","los":2,"vent":true,"iso":false,"doc":"Dr. A. Mehta","nurse":"N. Fernandes","av":"#0e7490","hr":119,"sys":144,"dia":63,"spo2":97,"temp":38.7,"rr":22,"stab":71,"alarm":false,"hist":[82,76,65,76,97,96,65,78,76,97,63,96]},{"id":21,"zone":"ISO","zlabel":"Isolation ICU","label":"ISO-01","sev":"yellow","empty":false,"name":"Neha Verma","mrn":"MRN-40821","age":47,"gender":"Male","blood":"AB+","diag":"Septic Shock","los":5,"vent":true,"iso":true,"doc":"Dr. S. Kapoor","nurse":"N. Pillai","av":"#334155","hr":109,"sys":91,"dia":55,"spo2":87,"temp":37.1,"rr":26,"stab":66,"alarm":false,"hist":[90,79,89,71,103,94,87,81,101,85,93,68]},{"id":22,"zone":"ISO","zlabel":"Isolation ICU","label":"ISO-02","sev":"yellow","empty":false,"name":"Rohan Iyer","mrn":"MRN-40822","age":67,"gender":"Female","blood":"O-","diag":"ARDS","los":14,"vent":true,"iso":true,"doc":"Dr. R. Nair","nurse":"N. Sharma","av":"#3f6212","hr":123,"sys":148,"dia":73,"spo2":95,"temp":38.8,"rr":30,"stab":80,"alarm":false,"hist":[98,109,88,101,93,75,66,69,94,62,110,106]},{"id":23,"zone":"ISO","zlabel":"Isolation ICU","label":"ISO-03","sev":"orange","empty":false,"name":"Sana Khan","mrn":"MRN-40823","age":21,"gender":"Male","blood":"A-","diag":"Traumatic Brain Injury","los":6,"vent":true,"iso":true,"doc":"Dr. L. Khan","nurse":"N. Das","av":"#7c2d12","hr":103,"sys":110,"dia":86,"spo2":88,"temp":36.1,"rr":32,"stab":53,"alarm":false,"hist":[79,81,92,96,104,87,81,63,104,96,102,79]}];
    const mon=()=>BEDS.filter(b=>!b.empty);
    let focusId=mon()[0]?mon()[0].id:null;
    const initials=n=>n.split(' ').map(x=>x[0]).join('').slice(0,2);

    /* ============ OVERVIEW WIDGETS ============ */
    function trendSvg(data,color){ const w=54,h=18,mn=Math.min(...data),mx=Math.max(...data),rg=(mx-mn)||1; const pts=data.map((v,i)=>`${(i/(data.length-1))*w},${h-((v-mn)/rg)*h}`).join(' '); return `<svg class="im-trend" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round"/></svg>`; }
    function renderOverview(){
        const c=s=>mon().filter(b=>b.sev===s).length;
        const W=[
            ['Under Monitoring',mon().length,90,'#0d9488','icon-monitor',[18,20,21,22,23,24]],
            ['Critical',c('red'),30,'#dc2626','icon-alert-triangle',[7,6,5,6,5,5]],
            ['Stable',c('green'),82,'#15803d','icon-heart-pulse',[9,10,11,12,12,13]],
            ['On Ventilator',mon().filter(b=>b.vent).length,74,'#1d4ed8','icon-air-vent',[11,12,13,13,14,14]],
            ['Isolation',mon().filter(b=>b.iso).length,44,'#7c3aed','icon-shield',[3,3,4,4,4,4]],
            ['Emergency Cases',c('orange'),52,'#e06c1f','icon-siren',[4,5,5,4,5,5]],
        ];
        $('#im-overview').innerHTML=W.map(w=>`
          <div class="im-card p-3.5">
            <div class="flex items-start justify-between">
              <span class="im-iconbadge w-9 h-9" style="color:${w[3]}"><i class="${w[4]}"></i></span>
              <div class="relative w-11 h-11"><svg viewBox="0 0 36 36" class="im-ring w-11 h-11"><circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--im-track)" stroke-width="3.2"/><circle class="bar" cx="18" cy="18" r="15.9" fill="none" stroke="${w[3]}" stroke-width="3.2" stroke-linecap="round" pathLength="100" style="--p:${w[2]}"/></svg><span class="absolute inset-0 flex items-center justify-center text-[9px] font-bold" style="color:${w[3]}">${w[2]}%</span></div>
            </div>
            <p class="text-2xl font-bold im-head mt-2 tabular-nums">${w[1]}</p>
            <div class="flex items-center justify-between mt-1"><p class="text-[11px] im-mut">${w[0]}</p>${trendSvg(w[5],w[3])}</div>
          </div>`).join('');
    }
    function animateRings(){ $$('.im-ring .bar').forEach(b=>{ const p=b.style.getPropertyValue('--p'); b.style.setProperty('--p','0'); requestAnimationFrame(()=>requestAnimationFrame(()=>b.style.setProperty('--p',p))); }); }

    /* ============ VITAL SIGNS DASHBOARD ============ */
    function renderVitalsDash(){
        const b=BEDS.find(x=>x.id===focusId&&!x.empty)||mon()[0]; if(!b) return;
        $('#im-vs-pt').textContent=b.label+' · '+b.name;
        const cards=[
            ['Heart Rate',b.hr,'bpm','#dc2626','icon-heart-pulse',b.hist],
            ['Blood Pressure',b.sys+'/'+b.dia,'mmHg','#6d28d9','icon-activity',b.hist.map(v=>v+30)],
            ['SpO₂',b.spo2,'%','#1d4ed8','icon-air-vent',b.hist.map(v=>90+(v%9))],
            ['Temperature',b.temp.toFixed(1),'°C','#b45309','icon-thermometer',b.hist.map(v=>36+(v%3))],
            ['Respiratory',b.rr,'/min','#15803d','icon-wind',b.hist.map(v=>14+(v%16))],
            ['Pulse',b.hr,'bpm','#0e7490','icon-heart',b.hist],
        ];
        $('#im-vitalsdash').innerHTML=cards.map(c=>`<div class="im-panel p-3">
            <div class="flex items-center justify-between mb-1"><span class="im-iconbadge w-7 h-7" style="color:${c[3]}"><i class="${c[4]} text-sm"></i></span><span class="text-[10px] im-mut uppercase">${c[2]}</span></div>
            <p class="text-xl font-bold tabular-nums" style="color:${c[3]}">${c[1]}</p><p class="text-[11px] im-mut mb-1.5">${c[0]}</p>
            <svg class="im-trend w-full h-8" viewBox="0 0 100 28" preserveAspectRatio="none"><polyline points="${(function(){const d=c[5],mn=Math.min(...d),mx=Math.max(...d),rg=(mx-mn)||1;return d.map((v,i)=>`${(i/(d.length-1))*100},${28-((v-mn)/rg)*26-1}`).join(' ');})()}" fill="none" stroke="${c[3]}" stroke-width="1.5"/></svg>
        </div>`).join('');
    }

    /* ============ LIVE TICK ============ */
    function tick(){
        mon().forEach(b=>{
            b.hr=Math.max(50,Math.min(150,b.hr+rnd(-2,2))); b.spo2=Math.max(82,Math.min(100,b.spo2+rnd(-1,1)));
            b.rr=Math.max(10,Math.min(36,b.rr+rnd(-1,1))); b.sys=Math.max(85,Math.min(165,b.sys+rnd(-2,2))); b.dia=Math.max(50,Math.min(100,b.dia+rnd(-2,2))); b.temp=Math.max(35,Math.min(41,b.temp+rnd(-1,1)/10));
            const upd=(k,val)=>{ const el=$(`[data-v="${b.id}-${k}"]`); if(el){ const suf=el.querySelector('span')?.outerHTML||''; el.innerHTML=val+suf; } };
            upd('hr',b.hr); upd('pulse',b.hr); upd('spo2',b.spo2); upd('rr',b.rr); upd('bp',b.sys+'/'+b.dia); upd('temp',b.temp.toFixed(1));
        });
    }

    /* ============ ICU BED FLOOR ============ */
    // Bed status legend (#im-bedlegend) is static demo content with no
    // mutation path, so its markup now lives directly in
    // icu-monitoring.html and the old renderBedLegend() one-time-build
    // function was removed.
    function renderFloor(){
        $('#im-floor').innerHTML=ZONES.map(z=>{
            const list=BEDS.filter(b=>b.zone===z[0]);
            const o=list.filter(b=>!b.empty).length;
            return `<div>
                <div class="flex items-center gap-2 mb-2"><span class="im-npill"><i class="icon-hospital text-[11px]"></i> ${z[1]}</span><span class="text-[11px] im-mut">${o}/${list.length} monitored</span><div class="flex-1 h-px" style="background:var(--im-border)"></div></div>
                <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">${list.map(bedCard).join('')}</div>
            </div>`;
        }).join('');
    }
    function bedCard(b){
        const sc=SEVC[b.sev];
        if(b.empty) return `<div class="im-bed im-bed-empty sev-gray"><div class="flex items-center justify-between"><span class="text-xs font-bold im-mut">${b.label}</span><span class="im-npill">Empty</span></div><div class="flex items-center justify-center py-2 im-mut"><i class="icon-bed text-xl"></i></div></div>`;
        return `<div class="im-bed sev-${b.sev}" data-bed="${b.id}">
            <div class="flex items-center justify-between"><span class="text-xs font-bold im-head">${b.label}</span>${b.alarm?'<span class="im-dot im-live" style="background:#dc2626"></span>':'<span class="im-dot" style="background:'+sc+'"></span>'}</div>
            <p class="text-[11px] font-medium im-head truncate mt-1">${b.name}</p>
            <div class="flex items-center gap-1 mt-1 text-[10px]"><span style="color:#dc2626"><i class="icon-heart-pulse"></i> ${b.hr}</span>${b.vent?'<span class="im-mut ml-1"><i class="icon-air-vent"></i></span>':''}${b.iso?'<span class="im-mut ml-0.5"><i class="icon-shield"></i></span>':''}</div>
            <div class="im-stab mt-1.5"><span style="width:${b.stab}%;background:${sc}"></span></div>
        </div>`;
    }

    // Ventilator Monitoring Center (#im-vents / #im-vent-count) is static
    // demo content with no mutation path, so its markup now lives directly
    // in icu-monitoring.html and the old renderVents() one-time-build
    // function was removed.

    // Recent Monitoring Activity feed (#im-activity) is static demo content
    // (each item's "Xm ago" was decorative Math.random(), not a real event)
    // with no mutation path, so its markup now lives directly in
    // icu-monitoring.html and the old ACTS array / renderActivity()
    // one-time-build function were removed.

    /* ============ DRAWER ============ */
    function openDrawer(id){
        const b=BEDS.find(x=>x.id===id&&!x.empty); if(!b) return; const sc=SEVC[b.sev];
        const box=(t,ic,body)=>`<div class="im-panel p-3"><p class="text-[11px] font-bold im-mut uppercase tracking-wide mb-2 flex items-center gap-1.5"><i class="${ic} im-hicon text-[13px]"></i> ${t}</p>${body}</div>`;
        const row=(k,v)=>`<div class="flex justify-between text-xs py-0.5"><span class="im-mut">${k}</span><span class="font-medium im-head">${v}</span></div>`;
        $('#im-drawer').innerHTML=`
          <div class="p-4 border-b sticky top-0 z-10 flex items-center justify-between" style="background:var(--im-elev);border-color:var(--im-border)">
            <div class="flex items-center gap-3"><span class="im-avatar flex-none" style="width:44px;height:44px;background:${b.av};font-size:14px">${initials(b.name)}</span><div><p class="font-bold im-head">${b.name}</p><p class="text-[11px] im-mut">${b.mrn} · ${b.label} · ${b.age}y · ${b.gender}</p></div></div>
            <button data-close class="w-8 h-8 rounded-lg hover:bg-[var(--im-hover)] flex items-center justify-center im-mut"><i class="icon-x"></i></button>
          </div>
          <div class="p-4 space-y-3">
            <div class="flex items-center gap-2 flex-wrap"><span class="im-chip" style="background:color-mix(in srgb,${sc} 14%,transparent);color:${sc}"><i class="icon-square-activity text-[11px]"></i> ${SEV[b.sev]}</span>${b.vent?'<span class="im-npill"><i class="icon-air-vent text-[11px]"></i> Ventilated</span>':''}${b.iso?'<span class="im-npill"><i class="icon-shield text-[11px]"></i> Isolation</span>':''}</div>
            ${box('Current Vitals','icon-heart-pulse',`<div class="grid grid-cols-3 gap-2 text-center">${[['HR',b.hr,'#dc2626'],['SpO₂',b.spo2+'%','#1d4ed8'],['BP',b.sys+'/'+b.dia,'#6d28d9'],['Resp',b.rr,'#15803d'],['Temp',b.temp.toFixed(1),'#b45309'],['Stability',b.stab+'%',sc]].map(v=>`<div class="rounded-lg p-1.5" style="background:var(--im-surface)"><p class="text-[9px] im-mut">${v[0]}</p><p class="text-sm font-bold" style="color:${v[2]}">${v[1]}</p></div>`).join('')}</div>`)}
            ${box('Diagnosis','icon-clipboard-plus',row('Primary',b.diag)+row('Admitted','Day '+b.los)+row('Blood',b.blood))}
            ${box('Allergies','icon-octagon-alert',b.id%3===0?'<span class="im-chip" style="background:color-mix(in srgb,#dc2626 13%,transparent);color:#dc2626">Penicillin</span>':'<p class="text-xs im-mut">No known allergies</p>')}
            ${box('Ventilator Settings','icon-air-vent',b.vent?row('Mode','AC/VC')+row('FiO₂',rnd(30,80)+'%')+row('PEEP',rnd(5,12))+row('Pressure',rnd(14,28)):'<p class="text-xs im-mut">Not ventilated</p>')}
            ${box('Medication Schedule','icon-syringe',['Noradrenaline · continuous','Heparin · Q12H','Pantoprazole · OD'].map(m=>`<div class="flex items-center gap-2 text-xs py-0.5"><span class="im-dot" style="background:var(--im-accent)"></span> ${m}</div>`).join(''))}
            ${box('Laboratory / Radiology','icon-flask-conical',row('Labs','ABG ready')+row('Radiology','CXR — improving')+row('Pending','2 results'))}
            ${box('Assigned Staff','icon-users',row('Intensivist',b.doc)+row('Nurse',b.nurse)+row('RT','R. Thomas'))}
            ${box('Emergency Contact','icon-phone',row('Name','Family (Spouse)')+row('Phone','+91 98xxxxxx21'))}
            ${box('Clinical Notes','icon-notebook','<p class="text-xs im-mut">'+(b.sev==='red'?'Critical — continuous monitoring, escalate on any desat.':'Stable on current settings. Routine monitoring.')+'</p>')}
            <div class="grid grid-cols-2 gap-2">
                <button data-modal="note" class="im-btn im-btn-ghost justify-center"><i class="icon-notebook"></i> Note</button>
                <button data-modal="medication" class="im-btn im-btn-ghost justify-center"><i class="icon-syringe"></i> Medication</button>
                <button data-modal="escalate" class="im-btn im-btn-ghost justify-center"><i class="icon-trending-up"></i> Escalate</button>
                <button data-menu-d="${b.id}" class="im-btn im-btn-ghost justify-center"><i class="icon-more-horizontal"></i> More</button>
            </div>
          </div>`;
        $('#im-drawer').classList.add('open');
        document.body.style.overflow='hidden';
    }
    function closeDrawer(){ $('#im-drawer').classList.remove('open'); document.body.style.overflow=''; }

    /* ============ MENU ============ */
    const ACTIONS=[['Open Monitoring','icon-monitor','openmon'],['View Patient','icon-eye','view'],['Clinical Notes','icon-notebook','note'],['Medication','icon-syringe','medication'],['Doctor Orders','icon-clipboard-list','orders'],['Laboratory','icon-flask-conical','lab'],['Radiology','icon-radiation','radio'],['sep'],['Assign Doctor','icon-stethoscope','doctor'],['Assign Nurse','icon-user-check','nurse'],['Escalate Alert','icon-trending-up','escalate'],['sep'],['Print Report','icon-printer','print'],['Download PDF','icon-file-down','pdf'],['Archive','icon-archive','archive'],['Delete','icon-trash-2','delete']];
    function openMenu(id,x,y){ closeMenu(); $('#im-menuhost').innerHTML=`<div class="im-menu" id="im-openmenu">${ACTIONS.map(a=>a[0]==='sep'?'<div class="im-menu-sep"></div>':`<button data-action="${a[2]}" data-bid="${id}" class="${a[2]==='delete'?'danger':''}"><i class="${a[1]}"></i> ${a[0]}</button>`).join('')}</div>`; const m=$('#im-openmenu'); const r=m.getBoundingClientRect(); m.style.left=Math.max(12,Math.min(x,window.innerWidth-r.width-12))+'px'; m.style.top=Math.max(12,Math.min(y,window.innerHeight-r.height-12))+'px'; }
    function closeMenu(){ $('#im-menuhost').innerHTML=''; }

    /* ============ MODALS ============ */
    const fld=(l,el)=>`<div><label class="im-formlabel">${l}</label>${el}</div>`;
    const inp=(ph)=>`<input class="im-in mt-1" placeholder="${ph||''}">`;
    const selE=(o)=>`<select class="im-in mt-1">${o.map(x=>`<option>${x}</option>`).join('')}</select>`;
    const drop=(t)=>`<div class="im-drop rounded-xl h-28 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[var(--im-hover)]"><i class="icon-cloud-upload text-3xl im-mut"></i><p class="text-sm font-semibold mt-1 im-head">${t}</p></div>`;
    const bedOpts=BEDS.map(b=>b.label+(b.empty?' (empty)':' · '+b.name));
    const MODALS={
        addmon:{t:'Add Monitor',sub:'Bring a new bedside monitor online',ic:'icon-monitor',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('Monitor ID',inp('e.g. MON-24'))}${fld('Bed',selE(bedOpts))}${fld('Monitor Type',selE(['Multi-parameter','Cardiac','Neonatal','Transport']))}${fld('Assigned Nurse',selE(NURSES))}</div>`,cta:'Add Monitor'},
        connect:{t:'Connect Patient',sub:'Attach a patient to a monitor',ic:'icon-plug',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('Patient / MRN',inp('Search...'))}${fld('Bed',selE(bedOpts))}${fld('Parameters',selE(['Full (ECG, SpO₂, NIBP, Temp)','Basic (ECG, SpO₂)']))}${fld('Alarm Profile',selE(['Adult','Pediatric','Neonatal']))}</div>`,cta:'Connect'},
        assignbed:{t:'Assign Bed',sub:'Assign a monitored bed',ic:'icon-bed',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('Patient',inp('Search...'))}${fld('Zone',selE(ZONES.map(z=>z[1])))}${fld('Bed',selE(bedOpts))}${fld('Nurse',selE(NURSES))}</div>`,cta:'Assign'},
        emergency:{t:'Emergency Alert',sub:'Broadcast a critical-care emergency',ic:'icon-alert-triangle',body:`<div class="rounded-lg p-2.5 text-xs mb-3 flex items-center gap-2" style="background:color-mix(in srgb,#dc2626 11%,transparent);color:#dc2626;border:1px solid color-mix(in srgb,#dc2626 30%,transparent)"><i class="icon-alert-triangle"></i> Alerts the rapid response team immediately.</div><div class="grid sm:grid-cols-2 gap-3">${fld('Type',selE(['Code Blue','Code Red','Rapid Response','Emergency Transfer']))}${fld('Bed / Patient',selE(bedOpts))}${fld('Team',selE(['On-call ICU','Cardiac Arrest Team','Trauma Team']))}${fld('Priority',selE(['Immediate','Urgent']))}</div>`,cta:'Broadcast Alert'},
        escalate:{t:'Escalate Alert',sub:'Escalate to senior clinician',ic:'icon-trending-up',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('Bed / Patient',selE(bedOpts))}${fld('Escalate To',selE(['Senior Intensivist','On-call Consultant','Department Head']))}${fld('Reason',selE(['Deterioration','Unresolved alarm','Family request','Second opinion']))}${fld('Notify',selE(['SMS + Call','In-app','Overhead page']))}</div>`,cta:'Escalate'},
        nurse:{t:'Assign Nurse',sub:'Assign nursing coverage',ic:'icon-user-check',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('Bed / Patient',selE(bedOpts))}${fld('Nurse',selE(NURSES))}${fld('Shift',selE(['Day','Night']))}${fld('Ratio',selE(['1:1','1:2']))}</div>`,cta:'Assign Nurse'},
        doctor:{t:'Assign Doctor',sub:'Attach an intensivist',ic:'icon-stethoscope',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('Bed / Patient',selE(bedOpts))}${fld('Doctor',selE(DOCS))}${fld('Role',selE(['Intensivist','Consultant','Resident']))}${fld('Shift',selE(['Day','Night']))}</div>`,cta:'Assign Doctor'},
        medication:{t:'Medication Order',sub:'Prescribe or schedule a drug',ic:'icon-syringe',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('Drug',inp('e.g. Noradrenaline'))}${fld('Dose',inp('e.g. 0.1 mcg/kg/min'))}${fld('Route',selE(['IV Infusion','IV Bolus','Oral']))}${fld('Frequency',selE(['Continuous','Q6H','Q8H','STAT']))}</div>`,cta:'Order'},
        note:{t:'Clinical Note',sub:'Document a monitoring observation',ic:'icon-notebook',body:`${fld('Note Type',selE(['Monitoring','Nursing','ICU Round','Procedure']))}<div class="mt-3">${fld('Note',`<textarea class="im-in mt-1" rows="3" placeholder="Observation..."></textarea>`)}</div>`,cta:'Save Note'},
        orders:{t:'Doctor Orders',sub:'Place a clinical order',ic:'icon-clipboard-list',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('Order Type',selE(['Medication','Laboratory','Radiology','Procedure','Consultation']))}${fld('Priority',selE(['Critical','High','Medium','Low']))}${fld('Doctor',selE(DOCS))}${fld('When',selE(['STAT','Routine','Timed']))}</div>`,cta:'Place Order'},
        details:{t:'Monitoring Details',sub:'Configure the monitor',ic:'icon-monitor',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('Monitor ID',inp('MON-01'))}${fld('Sampling',selE(['1s','5s','15s']))}${fld('Alarm — HR high',inp('120'))}${fld('Alarm — SpO₂ low',inp('90'))}</div>`,cta:'Save Settings'},
        import:{t:'Import',sub:'Bulk-load monitors or assignments',ic:'icon-upload',body:`<div class="flex gap-2 mb-3">${['CSV','Excel','Monitoring Devices','Patient Assignments'].map(f=>`<span class="im-npill">${f}</span>`).join('')}</div>${drop('Drop CSV / Excel file')}<button class="text-xs font-semibold text-[color:var(--im-accent)] hover:underline mt-2"><i class="icon-download"></i> Download sample template</button><div class="mt-3 rounded-lg p-3 text-xs flex items-center gap-2" style="background:color-mix(in srgb,#15803d 11%,transparent);color:#15803d;border:1px solid color-mix(in srgb,#15803d 28%,transparent)"><i class="icon-circle-check"></i> Validation passed · 24 monitors · 0 errors</div>`,cta:'Import'},
        export:{t:'Export',sub:'Generate a monitoring report',ic:'icon-download',body:`<p class="text-xs im-mut mb-2">Choose a format &amp; scope</p><div class="grid grid-cols-2 gap-2">${['CSV','Excel','PDF','Print','Monitoring Report','Critical Alert Report','ICU Summary','Selected Records','All Records'].map(f=>`<button data-expfmt="${f}" class="im-btn im-btn-ghost justify-center">${f}</button>`).join('')}</div>`,cta:'Export'},
    };
    const SIMPLE={openmon:'Opening monitor...',view:'Loading patient...',lab:'Lab ordered',radio:'Radiology ordered',print:'Printing report...',pdf:'PDF downloaded',archive:'Monitor archived'};
    function openModal(key){ const m=MODALS[key]; if(!m) return; document.body.style.overflow='hidden'; $('#im-modalhost').innerHTML=`<div class="im-modal-wrap open"><div class="im-modal-bg" data-close></div><div class="im-modal">
        <div class="im-modal-head"><span class="im-modal-badge"><i class="${m.ic}"></i></span><div class="min-w-0"><h3 class="font-bold im-head leading-tight">${m.t}</h3><p class="text-[11px] im-mut">${m.sub||''}</p></div><button data-close class="ml-auto w-8 h-8 rounded-lg hover:bg-[var(--im-hover)] flex items-center justify-center im-mut"><i class="icon-x"></i></button></div>
        <div class="im-modal-body">${m.body}</div>
        <div class="im-modal-foot"><button data-close class="im-btn im-btn-ghost">Cancel</button><button data-modalok="${key}" class="im-btn im-btn-primary"><i class="${m.ic}"></i> ${m.cta}</button></div>
    </div></div>`; }
    function openDelete(msg,onOk){ document.body.style.overflow='hidden'; $('#im-modalhost').innerHTML=`<div class="im-modal-wrap open"><div class="im-modal-bg" data-close></div><div class="im-modal" style="width:min(420px,94vw)"><div class="p-5 text-center"><div class="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style="background:color-mix(in srgb,#dc2626 13%,transparent);color:#dc2626"><i class="icon-alert-triangle text-2xl"></i></div><h3 class="font-bold text-lg im-head">Confirm</h3><p class="text-xs im-mut mt-1">${msg}</p><div class="flex gap-2 mt-4"><button data-close class="im-btn im-btn-ghost flex-1 justify-center">Cancel</button><button id="im-delok" class="im-btn im-btn-danger flex-1 justify-center">Delete</button></div></div></div></div>`; $('#im-delok').onclick=()=>{ onOk(); closeModal(); }; }
    function closeModal(){ $('#im-modalhost').innerHTML=''; if(!$('#im-drawer').classList.contains('open')) document.body.style.overflow=''; }

    function setFocus(id){ focusId=id; renderVitalsDash(); }

    /* ============ EVENTS ============ */
    document.addEventListener('click',e=>{
        if(e.target.closest('[data-fullscreen]')){ const el=document.documentElement; if(!document.fullscreenElement){ el.requestFullscreen&&el.requestFullscreen(); toast('Full-screen monitoring','icon-maximize'); } else { document.exitFullscreen&&document.exitFullscreen(); } return; }
        const t=e.target.closest('[data-bed],[data-menu-d],[data-action],[data-modal],[data-modalok],[data-close],[data-expfmt]');
        if(!t){ if(!e.target.closest('.im-menu')) closeMenu(); return; }
        if(t.dataset.bed!==undefined){ setFocus(+t.dataset.bed); openDrawer(+t.dataset.bed); return; }
        if(t.dataset.menuD!==undefined){ const r=t.getBoundingClientRect(); openMenu(+t.dataset.menuD,r.left-190,r.top-10); return; }
        if(t.dataset.action!==undefined){ const a=t.dataset.action, id=+t.dataset.bid; closeMenu();
            if(a==='openmon'||a==='view'){ setFocus(id); openDrawer(id); }
            else if(MODALS[a]) openModal(a);
            else if(a==='escalate') openModal('escalate');
            else if(a==='delete') openDelete('Remove this monitor?',()=>{ const b=BEDS.find(x=>x.id===id); if(b){ b.empty=true; b.sev='gray'; } renderFloor(); renderOverview(); animateRings(); toast('Monitor removed','icon-trash-2'); });
            else if(SIMPLE[a]) toast(SIMPLE[a]);
            return; }
        if(t.dataset.modal!==undefined){ openModal(t.dataset.modal); return; }
        if(t.dataset.modalok!==undefined){ toast(MODALS[t.dataset.modalok].cta+' — done','icon-check'); closeModal(); return; }
        if(t.dataset.expfmt!==undefined){ toast('Exported: '+t.dataset.expfmt,'icon-download'); closeModal(); return; }
        if(t.dataset.close!==undefined){ closeModal(); closeDrawer(); return; }
    });

    function clock(){ $('#im-clock').textContent=new Date().toLocaleTimeString('en-GB'); }

    /* ============ INIT ============ */
    // Overview widgets, vitals dashboard, bed legend, floor map, ventilator
    // panel and activity feed are now written directly into
    // icu-monitoring.html as static markup for the frozen BEDS snapshot
    // above, so nothing needs building on load — renderOverview() and
    // renderVitalsDash() stay only for genuine follow-up interactions
    // (focusing a different bed, removing a monitor), and renderFloor()
    // stays for the same delete mutation.
    setTimeout(()=>{
        $('#im-skeleton').classList.add('hidden');
        $('#im-content').classList.remove('hidden');
        animateRings(); clock(); setInterval(clock,1000); setInterval(tick,2000);
    },1400);
})();
// ==========================================================================
// icu.js
// ==========================================================================
        (function(){
            "use strict";
            if ((location.pathname.split("/").pop() || "index.html") !== "icu.html") return;
            const $=(s,r)=>(r||document).querySelector(s);
            const $$=(s,r)=>Array.from((r||document).querySelectorAll(s));
            const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
            let toastT;
            function toast(msg,icon){ const t=$('#ic-toast'); t.innerHTML=`<i class="${icon||'icon-check'} text-sky-400"></i> ${msg}`; t.classList.add('show'); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove('show'),2500); }

            /* ============ DATA ============ */
            const RISK={green:'Stable',yellow:'Observation',orange:'Serious',red:'Critical',gray:'Available'};
            const RISKC={green:'#16a34a',yellow:'#ca8a04',orange:'#ea580c',red:'#dc2626',gray:'#64748b'};
            const DOCS=['Dr. A. Mehta','Dr. S. Kapoor','Dr. R. Nair','Dr. L. Khan','Dr. P. Rao'];
            const NURSES=['N. Fernandes','N. Pillai','N. Sharma','N. Das'];
            const DIAG=['Acute MI','Septic Shock','ARDS','TBI','Post-CABG','Stroke','Mulicon-activity Failure','Pneumonia','DKA','Cardiac Arrest'];
            const NAMES=['Rahul Sharma','Anita Reddy','Vikram Nair','Priya Patel','Suresh Gupta','Meera Singh','Arjun Menon','Kavya Das','Deepak Joshi','Neha Verma','Rohan Iyer','Sana Khan'];
            const AVC=['#475569','#0f766e','#1e40af','#4338ca','#0e7490','#334155','#3f6212','#7c2d12'];
            const ZONES=[['ICU-A','ICU A',6],['ICU-B','ICU B',5],['NICU','NICU',5],['PICU','PICU',4],['CCU','CCU',6]];

            // Frozen static seed data (one snapshot of what the old Math.random()-driven
            // mkBed()/ZONES.forEach() loop used to generate randomly on every page load)
            // so the initial legend/floor map/monitoring wall/emergency-ops/ventilator/
            // workload/equipment/events markup can be written directly into icu.html
            // instead of JS-built on load.
            // mkBed() is kept below so any future runtime code can still mint beds the
            // same shape; bedSeq continues on from the highest frozen id.
            let bedSeq=26;
            function mkBed(zone,i){
                const empty=Math.random()<0.18;
                const risks=['green','green','yellow','yellow','orange','red'];
                const risk=empty?'gray':risks[rnd(0,risks.length-1)];
                const id=bedSeq++;
                const b={ id, zone, label:zone+'-'+String(i+1).padStart(2,'0'), risk, empty };
                if(!empty){
                    b.name=NAMES[id%NAMES.length]; b.age=rnd(19,84); b.gender=id%2?'Male':'Female';
                    b.diag=DIAG[id%DIAG.length]; b.days=rnd(1,21); b.vent=Math.random()<0.6;
                    b.doc=DOCS[id%DOCS.length]; b.nurse=NURSES[id%NURSES.length]; b.av=AVC[id%AVC.length];
                    b.hr=rnd(58,138); b.sys=rnd(88,158); b.dia=rnd(54,96); b.spo2=rnd(86,99); b.temp=(rnd(360,402)/10); b.rr=rnd(12,32);
                    b.stab=risk==='red'?rnd(20,42):risk==='orange'?rnd(45,65):risk==='yellow'?rnd(66,82):rnd(83,98);
                }
                return b;
            }
            let BEDS=[{"id":0,"zone":"ICU-A","label":"ICU-A-01","risk":"yellow","empty":false,"name":"Rahul Sharma","age":74,"gender":"Female","diag":"Acute MI","days":19,"vent":false,"doc":"Dr. A. Mehta","nurse":"N. Fernandes","av":"#475569","hr":75,"sys":89,"dia":69,"spo2":95,"temp":37.6,"rr":27,"stab":74},{"id":1,"zone":"ICU-A","label":"ICU-A-02","risk":"orange","empty":false,"name":"Anita Reddy","age":59,"gender":"Male","diag":"Septic Shock","days":2,"vent":false,"doc":"Dr. S. Kapoor","nurse":"N. Pillai","av":"#0f766e","hr":70,"sys":109,"dia":75,"spo2":90,"temp":39.7,"rr":17,"stab":47},{"id":2,"zone":"ICU-A","label":"ICU-A-03","risk":"red","empty":false,"name":"Vikram Nair","age":38,"gender":"Female","diag":"ARDS","days":8,"vent":true,"doc":"Dr. R. Nair","nurse":"N. Sharma","av":"#1e40af","hr":65,"sys":137,"dia":56,"spo2":88,"temp":36,"rr":25,"stab":20},{"id":3,"zone":"ICU-A","label":"ICU-A-04","risk":"green","empty":false,"name":"Priya Patel","age":43,"gender":"Male","diag":"TBI","days":12,"vent":true,"doc":"Dr. L. Khan","nurse":"N. Das","av":"#4338ca","hr":87,"sys":103,"dia":63,"spo2":98,"temp":39.4,"rr":21,"stab":92},{"id":4,"zone":"ICU-A","label":"ICU-A-05","risk":"red","empty":false,"name":"Suresh Gupta","age":45,"gender":"Female","diag":"Post-CABG","days":6,"vent":true,"doc":"Dr. P. Rao","nurse":"N. Fernandes","av":"#0e7490","hr":113,"sys":93,"dia":70,"spo2":92,"temp":39.4,"rr":27,"stab":27},{"id":5,"zone":"ICU-A","label":"ICU-A-06","risk":"yellow","empty":false,"name":"Meera Singh","age":69,"gender":"Male","diag":"Stroke","days":4,"vent":true,"doc":"Dr. A. Mehta","nurse":"N. Pillai","av":"#334155","hr":71,"sys":120,"dia":84,"spo2":94,"temp":36.6,"rr":15,"stab":82},{"id":6,"zone":"ICU-B","label":"ICU-B-01","risk":"yellow","empty":false,"name":"Arjun Menon","age":78,"gender":"Female","diag":"Mulicon-activity Failure","days":14,"vent":false,"doc":"Dr. S. Kapoor","nurse":"N. Sharma","av":"#3f6212","hr":86,"sys":105,"dia":86,"spo2":92,"temp":36,"rr":30,"stab":67},{"id":7,"zone":"ICU-B","label":"ICU-B-02","risk":"gray","empty":true},{"id":8,"zone":"ICU-B","label":"ICU-B-03","risk":"green","empty":false,"name":"Deepak Joshi","age":24,"gender":"Female","diag":"DKA","days":1,"vent":true,"doc":"Dr. L. Khan","nurse":"N. Fernandes","av":"#475569","hr":84,"sys":98,"dia":93,"spo2":97,"temp":39.1,"rr":32,"stab":89},{"id":9,"zone":"ICU-B","label":"ICU-B-04","risk":"yellow","empty":false,"name":"Neha Verma","age":79,"gender":"Male","diag":"Cardiac Arrest","days":14,"vent":false,"doc":"Dr. P. Rao","nurse":"N. Pillai","av":"#0f766e","hr":118,"sys":149,"dia":75,"spo2":86,"temp":36.2,"rr":26,"stab":73},{"id":10,"zone":"ICU-B","label":"ICU-B-05","risk":"yellow","empty":false,"name":"Rohan Iyer","age":54,"gender":"Female","diag":"Acute MI","days":6,"vent":false,"doc":"Dr. A. Mehta","nurse":"N. Sharma","av":"#1e40af","hr":90,"sys":146,"dia":75,"spo2":88,"temp":39.1,"rr":29,"stab":78},{"id":11,"zone":"NICU","label":"NICU-01","risk":"yellow","empty":false,"name":"Sana Khan","age":50,"gender":"Male","diag":"Septic Shock","days":21,"vent":true,"doc":"Dr. S. Kapoor","nurse":"N. Das","av":"#4338ca","hr":126,"sys":132,"dia":72,"spo2":90,"temp":38.7,"rr":27,"stab":66},{"id":12,"zone":"NICU","label":"NICU-02","risk":"yellow","empty":false,"name":"Rahul Sharma","age":84,"gender":"Female","diag":"ARDS","days":11,"vent":true,"doc":"Dr. R. Nair","nurse":"N. Fernandes","av":"#0e7490","hr":58,"sys":128,"dia":58,"spo2":98,"temp":37.7,"rr":22,"stab":76},{"id":13,"zone":"NICU","label":"NICU-03","risk":"green","empty":false,"name":"Anita Reddy","age":80,"gender":"Male","diag":"TBI","days":3,"vent":false,"doc":"Dr. L. Khan","nurse":"N. Pillai","av":"#334155","hr":117,"sys":106,"dia":75,"spo2":89,"temp":39.4,"rr":25,"stab":92},{"id":14,"zone":"NICU","label":"NICU-04","risk":"gray","empty":true},{"id":15,"zone":"NICU","label":"NICU-05","risk":"green","empty":false,"name":"Priya Patel","age":27,"gender":"Male","diag":"Stroke","days":15,"vent":false,"doc":"Dr. A. Mehta","nurse":"N. Das","av":"#7c2d12","hr":101,"sys":109,"dia":84,"spo2":87,"temp":36.3,"rr":29,"stab":86},{"id":16,"zone":"PICU","label":"PICU-01","risk":"green","empty":false,"name":"Suresh Gupta","age":78,"gender":"Female","diag":"Mulicon-activity Failure","days":12,"vent":true,"doc":"Dr. S. Kapoor","nurse":"N. Fernandes","av":"#475569","hr":89,"sys":147,"dia":92,"spo2":92,"temp":37.5,"rr":15,"stab":83},{"id":17,"zone":"PICU","label":"PICU-02","risk":"yellow","empty":false,"name":"Meera Singh","age":42,"gender":"Male","diag":"Pneumonia","days":16,"vent":true,"doc":"Dr. R. Nair","nurse":"N. Pillai","av":"#0f766e","hr":119,"sys":106,"dia":71,"spo2":91,"temp":37.6,"rr":28,"stab":67},{"id":18,"zone":"PICU","label":"PICU-03","risk":"yellow","empty":false,"name":"Arjun Menon","age":51,"gender":"Female","diag":"DKA","days":16,"vent":false,"doc":"Dr. L. Khan","nurse":"N. Sharma","av":"#1e40af","hr":90,"sys":133,"dia":82,"spo2":89,"temp":39.7,"rr":16,"stab":76},{"id":19,"zone":"PICU","label":"PICU-04","risk":"green","empty":false,"name":"Kavya Das","age":55,"gender":"Male","diag":"Cardiac Arrest","days":7,"vent":false,"doc":"Dr. P. Rao","nurse":"N. Das","av":"#4338ca","hr":99,"sys":118,"dia":62,"spo2":95,"temp":40,"rr":23,"stab":86},{"id":20,"zone":"CCU","label":"CCU-01","risk":"green","empty":false,"name":"Deepak Joshi","age":82,"gender":"Female","diag":"Acute MI","days":12,"vent":false,"doc":"Dr. A. Mehta","nurse":"N. Fernandes","av":"#0e7490","hr":68,"sys":103,"dia":78,"spo2":91,"temp":36,"rr":28,"stab":96},{"id":21,"zone":"CCU","label":"CCU-02","risk":"gray","empty":true},{"id":22,"zone":"CCU","label":"CCU-03","risk":"red","empty":false,"name":"Rohan Iyer","age":53,"gender":"Female","diag":"ARDS","days":6,"vent":false,"doc":"Dr. R. Nair","nurse":"N. Sharma","av":"#3f6212","hr":112,"sys":122,"dia":88,"spo2":91,"temp":36.9,"rr":21,"stab":29},{"id":23,"zone":"CCU","label":"CCU-04","risk":"green","empty":false,"name":"Sana Khan","age":83,"gender":"Male","diag":"TBI","days":2,"vent":false,"doc":"Dr. L. Khan","nurse":"N. Das","av":"#7c2d12","hr":103,"sys":98,"dia":95,"spo2":96,"temp":37,"rr":27,"stab":90},{"id":24,"zone":"CCU","label":"CCU-05","risk":"yellow","empty":false,"name":"Rahul Sharma","age":42,"gender":"Female","diag":"Post-CABG","days":11,"vent":false,"doc":"Dr. P. Rao","nurse":"N. Fernandes","av":"#475569","hr":107,"sys":158,"dia":61,"spo2":86,"temp":36.1,"rr":17,"stab":67},{"id":25,"zone":"CCU","label":"CCU-06","risk":"yellow","empty":false,"name":"Anita Reddy","age":27,"gender":"Male","diag":"Stroke","days":13,"vent":false,"doc":"Dr. A. Mehta","nurse":"N. Pillai","av":"#0f766e","hr":86,"sys":119,"dia":83,"spo2":87,"temp":37.4,"rr":27,"stab":67}];
            const occupied=()=>BEDS.filter(b=>!b.empty);

            /* ============ BED FLOOR ============ */
            let zoneFilter='ALL';
            function renderLegend(){
                $('#ic-bedlegend').innerHTML=Object.keys(RISK).map(k=>`<span class="flex items-center gap-1 ic-mut"><span class="ic-dot" style="background:${RISKC[k]}"></span>${RISK[k]}</span>`).join('');
                $('#ic-zonetabs').innerHTML=`<button data-zone="ALL" class="px-3 py-1.5 rounded-lg text-xs font-semibold ${zoneFilter==='ALL'?'bg-sky-500 text-white':'ic-mut'}">All</button>`+ZONES.map(z=>`<button data-zone="${z[0]}" class="px-3 py-1.5 rounded-lg text-xs font-semibold ${zoneFilter===z[0]?'bg-sky-500 text-white':'ic-mut'}">${z[1]}</button>`).join('');
            }
            function bedTile(b){
                if(b.empty) return `<div class="ic-bed ic-bed-empty st-gray" data-modal="assignbed">
                    <div class="flex items-center justify-between"><span class="text-xs font-bold ic-mut">${b.label}</span><span class="ic-chip risk">Available</span></div>
                    <div class="flex flex-col items-center justify-center py-3 ic-mut"><i class="icon-bed text-2xl"></i><p class="text-[11px] mt-1">Assign patient</p></div></div>`;
                const initials=b.name.split(' ').map(n=>n[0]).join('');
                return `<div class="ic-bed st-${b.risk}" data-bed="${b.id}">
                    <div class="flex items-center justify-between mb-1.5"><span class="text-xs font-bold ic-head">${b.label}</span><span class="ic-chip risk">${b.risk==='red'?'<i class="icon-alert-triangle text-[9px]"></i> ':''}${RISK[b.risk]}</span></div>
                    <div class="flex items-center gap-2">
                        <span class="rounded-lg flex items-center justify-center text-white font-bold flex-none" style="width:34px;height:34px;background:${b.av};font-size:12px">${initials}</span>
                        <div class="min-w-0"><p class="text-sm font-semibold ic-head truncate">${b.name}</p><p class="text-[10px] ic-mut">${b.age}y · ${b.gender[0]} · Day ${b.days}</p></div>
                    </div>
                    <p class="text-[11px] ic-mut mt-1.5 truncate">${b.diag}</p>
                    <div class="flex items-center gap-2 mt-2 text-[10px]">
                        <span class="ic-chip" style="background:color-mix(in srgb,#ef4444 13%,transparent);color:#dc2626"><i class="icon-heart-pulse"></i> ${b.hr}</span>
                        <span class="ic-chip" style="background:color-mix(in srgb,#0ea5e9 13%,transparent);color:#0284c7"><i class="icon-air-vent"></i> ${b.spo2}%</span>
                        ${b.vent?'<span class="ic-chip" style="background:color-mix(in srgb,#a855f7 15%,transparent);color:#9333ea"><i class="icon-wind"></i> Vent</span>':''}
                    </div>
                    <div class="preview px-2 py-1.5 text-[10px] left-2 right-2 rounded-md" style="background:var(--ic-elev);border:1px solid var(--ic-border)"><p class="ic-mut"><i class="icon-stethoscope"></i> ${b.doc} · <i class="icon-user-check"></i> ${b.nurse}</p></div>
                </div>`;
            }
            function renderFloor(){
                const zones=zoneFilter==='ALL'?ZONES:ZONES.filter(z=>z[0]===zoneFilter);
                $('#ic-floor').innerHTML=zones.map(z=>{
                    const list=BEDS.filter(b=>b.zone===z[0]);
                    const occ=list.filter(b=>!b.empty).length;
                    return `<div>
                        <div class="flex items-center gap-2 mb-2"><span class="ic-chip" style="background:color-mix(in srgb,#0ea5e9 14%,transparent);color:#0284c7"><i class="icon-hospital"></i> ${z[1]}</span><span class="text-[11px] ic-mut">${occ}/${list.length} occupied</span><div class="flex-1 h-px" style="background:var(--ic-border)"></div></div>
                        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">${list.map(bedTile).join('')}</div>
                    </div>`;
                }).join('');
            }

            /* ============ MONITORING WALL ============ */
            // Matches what renderMonitors() computes for the frozen BEDS snapshot above
            // (lowest-stability 6 occupied beds), so tick() has ids to update against
            // the static #ic-monitors markup below without a redundant initial rebuild.
            let monIds=occupied().sort((a,b)=>a.stab-b.stab).slice(0,6).map(b=>b.id);
            function ecgPath(w,h,seed){
                const pts=[]; const n=60;
                for(let i=0;i<n;i++){ const x=i/(n-1)*w; let y=h/2; const ph=(i+seed)%15; if(ph===5)y=h*0.15; else if(ph===6)y=h*0.85; else if(ph===7)y=h*0.35; else y=h/2+Math.sin(i*0.7+seed)*2; pts.push(x.toFixed(1)+','+y.toFixed(1)); }
                return pts.join(' ');
            }
            function renderMonitors(){
                const list=occupied().sort((a,b)=>a.stab-b.stab).slice(0,6); monIds=list.map(b=>b.id);
                $('#ic-monitors').innerHTML=list.map(b=>{
                    const sc=RISKC[b.risk], scr='#34d399';
                    return `<div class="ic-monitor" data-mon="${b.id}">
                        <div class="flex items-center justify-between px-3 py-2 border-b" style="border-color:var(--ic-border)">
                            <div class="flex items-center gap-2"><span class="ic-dot ic-live" style="background:${sc}"></span><span class="text-sm font-bold ic-head">${b.label}</span><span class="text-[11px] ic-mut">${b.name}</span></div>
                            <button data-bed="${b.id}" class="text-[11px] font-semibold text-sky-500 hover:underline">Open</button>
                        </div>
                        <div class="px-3 pt-3"><div class="ic-screen px-2 py-1"><svg class="ic-ecg w-full h-11" viewBox="0 0 260 44" style="color:${scr}"><polyline points="${ecgPath(260,44,b.id)}" fill="none" stroke="currentColor" stroke-width="1.6"/></svg></div></div>
                        <div class="grid grid-cols-3 gap-2 px-3 pt-2">
                            ${[['HR',b.hr,'bpm','#ef4444','hr'],['SpO₂',b.spo2,'%','#0ea5e9','spo2'],['BP',b.sys+'/'+b.dia,'','#a855f7','bp'],['Temp',b.temp.toFixed(1),'°C','#f59e0b','temp'],['Resp',b.rr,'/m','#22c55e','rr'],['Pulse',b.hr,'bpm','#ec4899','pulse']].map(v=>`
                                <div class="rounded-lg text-center py-1.5" style="background:var(--ic-panel)"><p class="text-[9px] ic-mut uppercase">${v[0]}</p><p class="text-base font-bold ic-vital" data-v="${v[4]}" data-bid="${b.id}" style="color:${v[3]}">${v[1]}<span class="text-[9px] ic-mut ml-0.5">${v[2]}</span></p></div>`).join('')}
                        </div>
                        <div class="px-3 py-2.5"><div class="flex items-center justify-between text-[10px] mb-1"><span class="ic-mut">Stability</span><span class="font-bold" style="color:${sc}" data-stabtxt="${b.id}">${b.stab}%</span></div><div class="ic-stability"><span data-stab="${b.id}" style="width:${b.stab}%;background:${sc}"></span></div></div>
                    </div>`;
                }).join('');
            }
            function tick(){
                monIds.forEach(id=>{
                    const b=BEDS.find(x=>x.id===id); if(!b) return;
                    b.hr=Math.max(50,Math.min(150,b.hr+rnd(-3,3)));
                    b.spo2=Math.max(82,Math.min(100,b.spo2+rnd(-1,1)));
                    b.rr=Math.max(10,Math.min(36,b.rr+rnd(-1,1)));
                    b.sys=Math.max(85,Math.min(165,b.sys+rnd(-2,2))); b.dia=Math.max(50,Math.min(100,b.dia+rnd(-2,2)));
                    b.temp=Math.max(35,Math.min(41,b.temp+rnd(-1,1)/10));
                    const set=(v,val)=>{ const el=$(`[data-v="${v}"][data-bid="${id}"]`); if(el){ const suf=el.querySelector('span')?.outerHTML||''; el.innerHTML=val+suf; } };
                    set('hr',b.hr); set('pulse',b.hr); set('spo2',b.spo2); set('rr',b.rr); set('bp',b.sys+'/'+b.dia); set('temp',b.temp.toFixed(1));
                });
            }

            // Emergency Operations tiles (#ic-emergops) are static demo content with no
            // mutation path, so their markup now lives directly in icu.html and the old
            // renderEmergOps() one-time-build function was removed.

            // Ventilator Command Center (#ic-vents) is static demo content with no
            // mutation path, so its markup now lives directly in icu.html and the old
            // renderVents() one-time-build function was removed.

            // ICU Workload Map (#ic-workload) is static demo content with no mutation
            // path, so its markup now lives directly in icu.html and the old
            // heatColor()/renderWorkload() one-time-build functions were removed.

            // Equipment Status grid (#ic-equipment) is static demo content with no
            // mutation path, so its markup now lives directly in icu.html and the old
            // renderEquipment() one-time-build function was removed.

            /* ============ TIMELINE (patient drawer only) ============ */
            const TLINE=[
                ['Admission','Day 1 · 02:14','Dr. Mehta','Emergency admit — Acute MI','icon-user-plus','#0ea5e9'],
                ['Ventilator Started','Day 1 · 02:40','RT Team','Intubated · AC/VC mode','icon-air-vent','#a855f7'],
                ['Medication','Day 1 · 03:10','Nurse F.','Noradrenaline drip started','icon-syringe','#ec4899'],
                ['Doctor Review','Day 2 · 08:00','Dr. Mehta','Hemodynamics improving','icon-stethoscope','#22c55e'],
                ['Lab','Day 2 · 09:30','Lab','Troponin trending down','icon-flask-conical','#f59e0b'],
                ['Radiology','Day 2 · 11:00','Dr. Kapoor','Chest X-Ray — clearing','icon-radiation','#0ea5e9'],
                ['Procedure','Day 3 · 14:20','Dr. Nair','Central line placement','icon-slice','#ef4444'],
                ['Recovery','Day 4 · 07:00','Dr. Mehta','Weaning from ventilator','icon-heart','#22c55e'],
            ];
            // Recent ICU Events feed (#ic-events) is static demo content (each item's
            // "Xm ago" was decorative Math.random(), not a real event) with no mutation
            // path, so its markup now lives directly in icu.html and the old EVENTS
            // array / renderEvents() one-time-build function were removed.

            const ALERTS=[
                ['#dc2626','Patient ICU-203 — Oxygen Critical','icon-alert-triangle'],
                ['#ea580c','Ventilator VENT-07 maintenance due','icon-wrench'],
                ['#16a34a','ICU-A Bed 05 now available','icon-bed'],
                ['#dc2626','Code Blue activated — CCU-02','icon-alert-octagon'],
                ['#ca8a04','Medication due — ICU-B-01','icon-syringe'],
                ['#ea580c','Rapid response team dispatched','icon-footprints'],
            ];
            function renderRibbon(){
                const one=ALERTS.map(a=>`<span class="ic-alert" style="background:color-mix(in srgb,${a[0]} 13%,transparent);color:${a[0]};border-color:color-mix(in srgb,${a[0]} 35%,transparent)"><i class="${a[2]}"></i> ${a[1]}</span>`).join('');
                $('#ic-ribbon').innerHTML=one+one;
            }

            /* ============ DRAWER ============ */
            function openDrawer(id){
                const b=BEDS.find(x=>x.id===id); if(!b||b.empty) return; const sc=RISKC[b.risk];
                const sec=(t,ic,body)=>`<div class="ic-glass2 p-3"><p class="text-[11px] font-bold ic-mut uppercase tracking-wide mb-2 flex items-center gap-1.5"><i class="${ic} text-sky-500"></i> ${t}</p>${body}</div>`;
                const row=(k,v)=>`<div class="flex justify-between text-xs py-0.5"><span class="ic-mut">${k}</span><span class="font-medium ic-head">${v}</span></div>`;
                $('#ic-drawer').innerHTML=`
                  <div class="p-4 border-b sticky top-0 z-10 flex items-center justify-between" style="background:var(--ic-elev);border-color:var(--ic-border)">
                    <div class="flex items-center gap-3"><span class="rounded-xl flex items-center justify-center text-white font-bold" style="width:44px;height:44px;background:${b.av}">${b.name.split(' ').map(n=>n[0]).join('')}</span><div><p class="font-bold ic-head">${b.name}</p><p class="text-[11px] ic-mut">${b.label} · ${b.age}y · ${b.gender}</p></div></div>
                    <button data-close class="w-8 h-8 rounded-lg hover:bg-[var(--ic-hover)] flex items-center justify-center ic-mut"><i class="icon-x"></i></button>
                  </div>
                  <div class="p-4 space-y-3">
                    <div class="flex items-center gap-2 flex-wrap"><span class="ic-chip" style="background:color-mix(in srgb,${sc} 16%,transparent);color:${sc}"><i class="icon-heart-pulse"></i> ${RISK[b.risk]}</span>${b.vent?'<span class="ic-chip" style="background:color-mix(in srgb,#a855f7 15%,transparent);color:#9333ea"><i class="icon-air-vent"></i> Ventilated</span>':''}<span class="ic-chip" style="background:color-mix(in srgb,#0ea5e9 14%,transparent);color:#0284c7">Day ${b.days}</span></div>
                    ${sec('Vitals','icon-heart-pulse',`<div class="grid grid-cols-3 gap-2 text-center">${[['HR',b.hr,'#ef4444'],['SpO₂',b.spo2+'%','#0ea5e9'],['BP',b.sys+'/'+b.dia,'#a855f7'],['Temp',b.temp.toFixed(1),'#f59e0b'],['Resp',b.rr,'#22c55e'],['Stability',b.stab+'%',sc]].map(v=>`<div class="rounded-lg p-1.5" style="background:var(--ic-panel)"><p class="text-[9px] ic-mut">${v[0]}</p><p class="text-sm font-bold" style="color:${v[2]}">${v[1]}</p></div>`).join('')}</div>`)}
                    ${sec('Medical Summary','icon-clipboard-plus',row('Diagnosis',b.diag)+row('Admitted','Day '+b.days)+row('Ventilator',b.vent?'Yes · AC/VC':'No'))}
                    ${sec('Allergies','icon-octagon-alert',b.id%3===0?'<span class="ic-chip" style="background:color-mix(in srgb,#ef4444 15%,transparent);color:#dc2626">Penicillin</span>':'<p class="text-xs ic-mut">No known allergies</p>')}
                    ${sec('Current Medications','icon-syringe',['Noradrenaline','Heparin','Pantoprazole'].map(m=>`<div class="flex items-center gap-2 text-xs py-0.5"><i class="icon-dot text-sky-500"></i> <span class="ic-head">${m}</span></div>`).join(''))}
                    ${sec('Diagnostics','icon-flask-conical',row('Lab','ABG · CBC ready')+row('Radiology','Chest X-Ray')+row('Pending','2 results'))}
                    ${sec('Assigned Staff','icon-users',row('Intensivist',b.doc)+row('Nurse',b.nurse))}
                    ${sec('Timeline','icon-activity',TLINE.slice(0,4).map(t=>`<div class="flex items-center gap-2 text-xs py-0.5"><i class="${t[4]}" style="color:${t[5]}"></i><span class="ic-head">${t[0]}</span><span class="ic-mut">· ${t[1]}</span></div>`).join(''))}
                    <div class="grid grid-cols-2 gap-2">
                      <button data-modal="note" class="text-xs font-semibold border rounded-lg py-2 hover:bg-[var(--ic-hover)] ic-head" style="border-color:var(--ic-border)"><i class="icon-notebook"></i> Note</button>
                      <button data-modal="medication" class="text-xs font-semibold border rounded-lg py-2 hover:bg-[var(--ic-hover)] ic-head" style="border-color:var(--ic-border)"><i class="icon-syringe"></i> Medication</button>
                      <button data-modal="transfer" class="text-xs font-semibold border rounded-lg py-2 hover:bg-[var(--ic-hover)] ic-head" style="border-color:var(--ic-border)"><i class="icon-arrow-left-right"></i> Transfer</button>
                      <button data-menu-d="${b.id}" class="text-xs font-semibold border rounded-lg py-2 hover:bg-[var(--ic-hover)] ic-head" style="border-color:var(--ic-border)"><i class="icon-more-horizontal"></i> More</button>
                    </div>
                  </div>`;
                $('#ic-drawer').classList.add('open');
                document.body.style.overflow='hidden';
            }
            function closeDrawer(){ $('#ic-drawer').classList.remove('open'); document.body.style.overflow=''; }

            /* ============ MENU ============ */
            const ACTIONS=[['View','icon-eye','view'],['Clinical Notes','icon-notebook','note'],['Medication','icon-syringe','medication'],['Transfer','icon-arrow-left-right','transfer'],['Assign Doctor','icon-stethoscope','doctor'],['Assign Nurse','icon-user-check','nurse'],['Laboratory','icon-flask-conical','lab'],['Radiology','icon-radiation','radio'],['Print Summary','icon-printer','print'],['Download PDF','icon-file-down','pdf'],['Archive','icon-archive','archive'],['Delete','icon-trash-2','delete']];
            function openMenu(id,x,y){
                closeMenu();
                $('#ic-menuhost').innerHTML=`<div class="ic-menu" id="ic-openmenu">${ACTIONS.map(a=>`<button data-action="${a[2]}" data-bid="${id}" class="${a[2]==='delete'?'danger':''}"><i class="${a[1]}"></i> ${a[0]}</button>`).join('')}</div>`;
                const m=$('#ic-openmenu'); const r=m.getBoundingClientRect();
                m.style.left=Math.max(12,Math.min(x,window.innerWidth-r.width-12))+'px';
                m.style.top=Math.max(12,Math.min(y,window.innerHeight-r.height-12))+'px';
            }
            function closeMenu(){ $('#ic-menuhost').innerHTML=''; }

            /* ============ MODALS ============ */
            const fld=(l,el)=>`<div><label class="text-[11px] font-semibold ic-mut">${l}</label>${el}</div>`;
            const inp=(ph)=>`<input class="ic-in mt-1" placeholder="${ph||''}">`;
            const selEl=(o)=>`<select class="ic-in mt-1">${o.map(x=>`<option>${x}</option>`).join('')}</select>`;
            const bedOpts=BEDS.map(b=>b.label+(b.empty?' (empty)':' · '+b.name));
            const MODALS={
                admit:{t:'Admit Patient',ic:'icon-user-plus',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('Patient Name',inp('Full name'))}${fld('Age',inp('Years'))}${fld('Gender',selEl(['Male','Female','Other']))}${fld('Diagnosis',selEl(DIAG))}${fld('Assign Bed',selEl(bedOpts))}${fld('Intensivist',selEl(DOCS))}${fld('Ventilator',selEl(['Not required','AC/VC','SIMV','CPAP']))}${fld('Risk Level',selEl(['Stable','Observation','Serious','Critical']))}</div>`,cta:'Admit to ICU'},
                emergency:{t:'Emergency Admission',ic:'icon-alert-triangle',body:`<div class="rounded-lg p-2.5 text-xs mb-3 flex items-center gap-2" style="background:color-mix(in srgb,#ef4444 12%,transparent);color:#dc2626;border:1px solid color-mix(in srgb,#ef4444 35%,transparent)"><i class="icon-alert-triangle"></i> Priority admission — nearest available critical bed</div><div class="grid sm:grid-cols-2 gap-3">${fld('Patient / Unknown',inp('Name or "Unknown"'))}${fld('Presenting',selEl(['Cardiac Arrest','Trauma','Respiratory Failure','Sepsis','Stroke']))}${fld('Triage',selEl(['Immediate (Red)','Urgent (Orange)']))}${fld('Bed',selEl(['Auto — nearest','ICU-A-05','CCU-03']))}</div>`,cta:'Activate Emergency'},
                assignbed:{t:'Assign ICU Bed',ic:'icon-bed',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('Patient / MRN',inp('Search...'))}${fld('Zone',selEl(ZONES.map(z=>z[1])))}${fld('Bed',selEl(bedOpts))}${fld('Nurse',selEl(NURSES))}</div>`,cta:'Assign Bed'},
                transfer:{t:'Transfer Patient',ic:'icon-arrow-left-right',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('Patient',inp('Search...'))}${fld('From',selEl(bedOpts))}${fld('To',selEl(['ICU-A','ICU-B','NICU','PICU','CCU','General Ward','Step-down']))}${fld('Reason',selEl(['Step-down','Escalation','Isolation','Specialty'])) }</div>`,cta:'Confirm Transfer'},
                medication:{t:'Medication Order',ic:'icon-syringe',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('Drug',inp('e.g. Noradrenaline'))}${fld('Dose',inp('e.g. 0.1 mcg/kg/min'))}${fld('Route',selEl(['IV Infusion','IV Bolus','Oral','NG Tube']))}${fld('Frequency',selEl(['Continuous','Q6H','Q8H','STAT']))}</div>`,cta:'Order Medication'},
                note:{t:'Clinical Note',ic:'icon-notebook',body:`${fld('Note Type',selEl(['Progress','ICU Round','Nursing','Procedure']))}<div class="mt-3">${fld('Note',`<textarea class="ic-in mt-1" rows="3" placeholder="Clinical observation..."></textarea>`)}</div>`,cta:'Save Note'},
                equipment:{t:'Equipment Detail',ic:'icon-cpu',body:`<div class="grid sm:grid-cols-2 gap-3">${fld('Equipment',selEl(['Ventilators','Defibrillators','Monitors','Infusion Pumps']))}${fld('Action',selEl(['Assign','Service','Calibrate','Retire']))}${fld('Assigned Bed',selEl(bedOpts))}${fld('Next Maintenance',`<input type="text" placeholder="dd/mm/yyyy" class="ic-in mt-1" data-provider="flatpickr" data-date-format="d-m-Y">`)}</div>`,cta:'Update Equipment'},
                export:{t:'Export ICU Report',ic:'icon-download',body:`<p class="text-xs ic-mut mb-2">Choose format</p><div class="grid grid-cols-2 gap-2">${['CSV','Excel','PDF','Print','Occupancy Report','Shift Handover'].map(f=>`<button data-expfmt="${f}" class="text-xs font-semibold border rounded-lg px-3 py-2 hover:bg-[var(--ic-hover)] ic-head" style="border-color:var(--ic-border)">${f}</button>`).join('')}</div>`,cta:'Export'},
            };
            const SIMPLE={doctor:'Doctor assigned',nurse:'Nurse assigned',lab:'Lab ordered',radio:'Radiology ordered',print:'Printing summary...',pdf:'PDF downloaded',archive:'Record archived'};
            function openModal(key){
                const m=MODALS[key]; if(!m) return;
                document.body.style.overflow='hidden';
                $('#ic-modalhost').innerHTML=`<div class="ic-modal-wrap open"><div class="ic-modal-bg" data-close></div><div class="ic-modal">
                    <div class="ic-modal-head"><span class="ic-modal-badge"><i class="${m.ic}"></i></span><div class="min-w-0"><h3 class="font-bold ic-head leading-tight">${m.t}</h3><p class="text-[11px] ic-mut">${m.sub||'Review the details and confirm.'}</p></div><button data-close class="ml-auto w-8 h-8 rounded-lg hover:bg-[var(--ic-hover)] flex items-center justify-center ic-mut"><i class="icon-x"></i></button></div>
                    <div class="ic-modal-body">${m.body}</div>
                    <div class="ic-modal-foot"><button data-close class="ic-btn ic-btn-ghost">Cancel</button><button data-modalok="${key}" class="ic-btn ic-btn-primary"><i class="${m.ic}"></i> ${m.cta}</button></div>
                </div></div>`;
                // Modal HTML is injected after the page's initial-load flatpickr auto-init has
                // already run, so any date fields inside it must be initialized here instead.
                if(typeof flatpickr!=='undefined'){
                    $$('[data-provider="flatpickr"]',$('#ic-modalhost')).forEach(el=>{
                        if(el._flatpickr) return;
                        const config={disableMobile:true};
                        if(el.hasAttribute('data-date-format')) config.dateFormat=el.getAttribute('data-date-format');
                        flatpickr(el,config);
                    });
                }
            }
            function openDelete(msg,onOk){
                document.body.style.overflow='hidden';
                $('#ic-modalhost').innerHTML=`<div class="ic-modal-wrap open"><div class="ic-modal-bg" data-close></div><div class="ic-modal" style="width:min(420px,94vw)"><div class="p-5 text-center"><div class="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style="background:color-mix(in srgb,#ef4444 15%,transparent);color:#dc2626"><i class="icon-alert-triangle text-2xl"></i></div><h3 class="font-bold text-lg ic-head">Confirm</h3><p class="text-xs ic-mut mt-1">${msg}</p><div class="flex gap-2 mt-4"><button data-close class="flex-1 text-sm font-semibold px-3 py-2 rounded-lg border hover:bg-[var(--ic-hover)] ic-head" style="border-color:var(--ic-border)">Cancel</button><button id="ic-delok" class="flex-1 text-sm font-semibold px-3 py-2 rounded-lg bg-rose-500 text-white hover:bg-rose-400">Delete</button></div></div></div></div>`;
                $('#ic-delok').onclick=()=>{ onOk(); closeModal(); };
            }
            function closeModal(){ $('#ic-modalhost').innerHTML=''; if(!$('#ic-drawer').classList.contains('open')) document.body.style.overflow=''; }

            /* ============ CODE BLUE ============ */
            function codeBlue(){
                document.body.style.overflow='hidden';
                $('#ic-modalhost').innerHTML=`<div class="ic-modal-wrap open"><div class="ic-modal-bg" style="background:rgba(30,64,175,.5)" data-close></div><div class="ic-modal" style="width:min(440px,94vw);border-color:#3b82f6">
                    <div class="p-6 text-center">
                        <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3" style="background:color-mix(in srgb,#3b82f6 22%,transparent);color:#2563eb;animation:ic-blink 1s infinite"><i class="icon-alert-octagon text-3xl"></i></div>
                        <h3 class="text-xl font-bold ic-head">CODE BLUE</h3><p class="text-sm ic-mut mt-1">Cardiac arrest response protocol</p>
                        <div class="grid sm:grid-cols-2 gap-3 mt-4 text-left">${fld('Location',selEl(bedOpts))}${fld('Response Team',selEl(['Team A (on-call)','Team B','Rapid Response']))}</div>
                        <div class="flex gap-2 mt-4"><button data-close class="flex-1 text-sm font-semibold px-3 py-2 rounded-lg border hover:bg-[var(--ic-hover)] ic-head" style="border-color:var(--ic-border)">Cancel</button><button data-close id="ic-cbgo" class="flex-1 text-sm font-semibold px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500">Activate & Alert Team</button></div>
                    </div></div></div>`;
                $('#ic-cbgo').addEventListener('click',()=>toast('Code Blue activated — team dispatched','icon-alert-octagon'));
            }

            /* ============ EVENTS ============ */
            document.addEventListener('click',e=>{
                if(e.target.closest('[data-zone]')){ zoneFilter=e.target.closest('[data-zone]').dataset.zone; renderLegend(); renderFloor(); return; }
                const t=e.target.closest('[data-bed],[data-mon],[data-menu-d],[data-action],[data-modal],[data-modalok],[data-close],[data-codeblue],[data-dismiss-alerts],[data-expfmt]');
                if(!t){ if(!e.target.closest('.ic-menu')) closeMenu(); return; }
                if(t.dataset.bed!==undefined){ openDrawer(+t.dataset.bed); return; }
                if(t.dataset.menuD!==undefined){ const r=t.getBoundingClientRect(); openMenu(+t.dataset.menuD,r.left-180,r.top-10); return; }
                if(t.dataset.codeblue!==undefined){ codeBlue(); return; }
                if(t.dataset.dismissAlerts!==undefined){ $('#ic-ribbonwrap').style.display='none'; toast('Alerts dismissed','icon-bell-off'); return; }
                if(t.dataset.action!==undefined){ const a=t.dataset.action, id=+t.dataset.bid; closeMenu();
                    if(a==='view') openDrawer(id);
                    else if(MODALS[a]) openModal(a);
                    else if(a==='delete') openDelete('Remove this patient record from ICU?',()=>{ const b=BEDS.find(x=>x.id===id); if(b){ b.empty=true; b.risk='gray'; } closeDrawer(); renderFloor(); renderMonitors(); toast('Record removed','icon-trash-2'); });
                    else if(SIMPLE[a]) toast(SIMPLE[a]);
                    return; }
                if(t.dataset.modal!==undefined){ openModal(t.dataset.modal); return; }
                if(t.dataset.modalok!==undefined){ toast(MODALS[t.dataset.modalok].cta+' — done','icon-check'); closeModal(); return; }
                if(t.dataset.expfmt!==undefined){ toast('Exported: '+t.dataset.expfmt,'icon-download'); closeModal(); return; }
                if(t.dataset.close!==undefined){ closeModal(); closeDrawer(); return; }
            });

            /* ============ CLOCK ============ */
            function clock(){ const d=new Date(); $('#ic-clock').textContent=d.toLocaleTimeString('en-GB'); }

            /* ============ INIT ============ */
            // Zone legend/tabs, the bed floor map, monitoring wall, emergency-ops tiles,
            // ventilator panel, workload heatmap, equipment grid and events list are now
            // written directly into icu.html as static markup for the frozen BEDS
            // snapshot above, so nothing needs building on load — renderLegend() and
            // renderFloor() stay only for the genuine follow-up interaction (zone filter
            // click) and renderMonitors() only for the delete-record mutation; tick()
            // keeps updating the already-rendered monitor tiles via monIds above.
            setTimeout(()=>{
                $('#ic-skeleton').classList.add('hidden');
                $('#ic-content').classList.remove('hidden');
                renderRibbon();
                clock(); setInterval(clock,1000);
                setInterval(tick,2000);
            },1500);
        })();// ==========================================================================
// lab-test-result-detail.js
// ==========================================================================
document.addEventListener("DOMContentLoaded", function () {
  if (document.body.dataset.page !== "lab-test-result-detail") return;

  var $ = function (id) { return document.getElementById(id); };
  var params = new URLSearchParams(window.location.search);
  var pick = function (key, fallback) { var v = params.get(key); return v && v.length ? v : fallback; };

  var r = {
    id: pick("id", "1"),
    patient: pick("patient", "Anna Peterson"),
    test: pick("test", "Complete Blood Count"),
    value: pick("value", "13.2 g/dL (12-16)"),
    flag: pick("flag", "Normal"),
    verifiedBy: pick("verifiedBy", "Dr. Rachel Kim"),
    date: pick("date", "2024-12-02"),
  };

  var BADGE = {
    Normal: "text-success bg-success/10",
    Abnormal: "text-warning bg-warning/10",
    Critical: "text-danger bg-danger/10",
  };
  var TONE = { Normal: "#10b981", Abnormal: "#f59e0b", Critical: "#f43f5e" };
  var FLAG_ICON = { Normal: "icon-check", Abnormal: "icon-alert-triangle", Critical: "icon-alert-octagon" };

  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ======================================================================
     Multi-analyte panel reference data. Only tests that are genuinely
     reported as a panel get a breakdown table; single-analyte tests (Blood
     Glucose, Urine Culture, HIV Antibody, Biopsy) keep one clear result.
     ====================================================================== */
  var PANELS = {
    "Complete Blood Count": [
      { name: "White Blood Cells (WBC)", value: 7.2, unit: "x10³/µL", low: 4.5, high: 11.0, flag: "Normal" },
      { name: "Red Blood Cells (RBC)", value: 4.8, unit: "x10⁶/µL", low: 4.2, high: 5.4, flag: "Normal" },
      { name: "Hemoglobin (Hgb)", value: 13.2, unit: "g/dL", low: 12, high: 16, flag: "Normal" },
      { name: "Hematocrit (Hct)", value: 39.5, unit: "%", low: 36, high: 46, flag: "Normal" },
      { name: "MCV", value: 88, unit: "fL", low: 80, high: 100, flag: "Normal" },
      { name: "Platelets", value: 245, unit: "x10³/µL", low: 150, high: 400, flag: "Normal" },
      { name: "Neutrophils", value: 58, unit: "%", low: 40, high: 70, flag: "Normal" },
      { name: "Lymphocytes", value: 32, unit: "%", low: 20, high: 40, flag: "Normal" },
    ],
    "Lipid Panel": [
      { name: "Total Cholesterol", value: 245, unit: "mg/dL", low: 0, high: 200, flag: "Abnormal" },
      { name: "LDL Cholesterol", value: 165, unit: "mg/dL", low: 0, high: 100, flag: "Abnormal" },
      { name: "HDL Cholesterol", value: 38, unit: "mg/dL", low: 40, high: 90, flag: "Abnormal" },
      { name: "Triglycerides", value: 210, unit: "mg/dL", low: 0, high: 150, flag: "Abnormal" },
      { name: "Cholesterol / HDL Ratio", value: 6.4, unit: "", low: 0, high: 5, flag: "Abnormal" },
    ],
    "Liver Function Test": [
      { name: "ALT (SGPT)", value: 320, unit: "U/L", low: 7, high: 56, flag: "Critical" },
      { name: "AST (SGOT)", value: 245, unit: "U/L", low: 10, high: 40, flag: "Critical" },
      { name: "Alkaline Phosphatase", value: 130, unit: "U/L", low: 44, high: 147, flag: "Normal" },
      { name: "Total Bilirubin", value: 2.8, unit: "mg/dL", low: 0.1, high: 1.2, flag: "Abnormal" },
      { name: "Albumin", value: 3.6, unit: "g/dL", low: 3.5, high: 5.0, flag: "Normal" },
      { name: "Total Protein", value: 6.8, unit: "g/dL", low: 6.0, high: 8.3, flag: "Normal" },
    ],
    "Hepatitis B Panel": [
      { name: "HBsAg", value: "Positive", expected: "Negative", flag: "Abnormal" },
      { name: "Anti-HBc (Total)", value: "Positive", expected: "Negative", flag: "Abnormal" },
      { name: "Anti-HBs", value: "Negative", expected: "Negative / Positive", flag: "Normal" },
      { name: "HBeAg", value: "Negative", expected: "Negative", flag: "Normal" },
    ],
  };

  var SPECIMEN = {
    "Complete Blood Count": { type: "Whole Blood (EDTA)", method: "Automated Hematology Analyzer" },
    "Lipid Panel": { type: "Serum", method: "Enzymatic Colorimetric Assay" },
    "Liver Function Test": { type: "Serum", method: "Automated Chemistry Analyzer" },
    "Blood Glucose": { type: "Plasma (Fluoride)", method: "Hexokinase Method" },
    "Urine Culture": { type: "Midstream Urine", method: "Aerobic Culture, 48h Incubation" },
    "HIV Antibody Test": { type: "Serum", method: "4th-Gen Chemiluminescent Immunoassay" },
    "Biopsy Analysis": { type: "Tissue Section", method: "Histopathology, H&E Stain" },
    "Hepatitis B Panel": { type: "Serum", method: "Chemiluminescent Immunoassay" },
  };

  var DEPARTMENT = {
    "Complete Blood Count": "Hematology",
    "Lipid Panel": "Biochemistry",
    "Liver Function Test": "Biochemistry",
    "Blood Glucose": "Biochemistry",
    "Urine Culture": "Microbiology",
    "HIV Antibody Test": "Serology",
    "Biopsy Analysis": "Histopathology",
    "Hepatitis B Panel": "Serology",
  };

  var REFERRERS = ["Dr. Priya Nair", "Dr. Alan Ford", "Dr. James Wu", "Dr. Nina Petrova", "Dr. Rachel Kim"];

  var INTERPRETATION = {
    Normal: "All reported parameters fall within the reference range. No clinical action required based on this result alone.",
    Abnormal: "One or more parameters fall outside the reference range. Clinical correlation with the patient's history and a repeat or follow-up test is recommended.",
    Critical: "This result contains a critical value that may require urgent clinical attention. The ordering clinician has been notified per critical-value protocol.",
  };

  /* --- helpers ---------------------------------------------------------- */

  function seedNum(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
    return h || 1;
  }

  // Deterministic light random walk of 5 points ending exactly at `current`,
  // so the same patient/test always draws the same trend on reload.
  function makeTrend(current, seed) {
    var rnd = seedNum(seed);
    function next() { rnd = (rnd * 1103515245 + 12345) >>> 0; return (rnd % 1000) / 1000; }
    var pts = [current];
    var v = current;
    for (var i = 0; i < 4; i++) {
      v = v * (0.9 + next() * 0.2);
      pts.unshift(Math.round(v * 100) / 100);
    }
    return pts;
  }

  // Parses "245 mg/dL (<200)", "ALT 320 U/L (7-56)", "13.2 g/dL (12-16)" into
  // { value, unit, low, high }. Returns null for qualitative results.
  function parseSingle(str) {
    var m = /^(?:[A-Za-z/]+\s+)?([\d.]+)\s*([A-Za-z%/µ]*)\s*\(([<>]?)\s*([\d.]+)(?:\s*-\s*([\d.]+))?\)/.exec(str);
    if (!m) return null;
    var value = parseFloat(m[1]);
    var cmp = m[3];
    var a = parseFloat(m[4]);
    var b = m[5] !== undefined ? parseFloat(m[5]) : undefined;
    var low, high;
    if (cmp === "<") { low = 0; high = a; }
    else if (cmp === ">") { low = a; high = a * 1.6; }
    else if (b !== undefined) { low = a; high = b; }
    else { low = 0; high = a; }
    return { value: value, unit: m[2] || "", low: low, high: high };
  }

  function rangeBar(value, low, high, flag) {
    var span = Math.max(high - low, 0.0001);
    var scaleMin = Math.min(low - span * 0.35, value - span * 0.15);
    var scaleMax = Math.max(high + span * 0.35, value + span * 0.15);
    var total = scaleMax - scaleMin || 1;
    var pct = function (v) { return Math.max(0, Math.min(100, ((v - scaleMin) / total) * 100)).toFixed(2); };
    var color = TONE[flag] || TONE.Normal;
    return (
      '<div class="lrd-range">' +
      '<div class="lrd-range-track">' +
      '<span class="lrd-range-zone" style="left:' + pct(low) + "%;width:" + (pct(high) - pct(low)) + '%"></span>' +
      '<span class="lrd-range-marker" style="left:' + pct(value) + "%;border-color:" + color + '"></span>' +
      "</div>" +
      '<div class="lrd-range-labels"><span>' + low + "</span><span class=\"lrd-range-ref\">Reference " + low + "–" + high + "</span><span>" + high + "</span></div>" +
      "</div>"
    );
  }

  function sparkline(points, flag) {
    var w = 100, h = 32, pad = 3;
    var min = Math.min.apply(null, points), max = Math.max.apply(null, points);
    var span = max - min || 1;
    var stepX = (w - pad * 2) / (points.length - 1);
    var coords = points.map(function (v, i) {
      var x = pad + i * stepX;
      var y = h - pad - ((v - min) / span) * (h - pad * 2);
      return [x, y];
    });
    var linePts = coords.map(function (c) { return c[0].toFixed(1) + "," + c[1].toFixed(1); }).join(" ");
    var last = coords[coords.length - 1];
    var color = TONE[flag] || TONE.Normal;
    return (
      '<svg class="lrd-spark" viewBox="0 0 ' + w + " " + h + '" preserveAspectRatio="none" aria-hidden="true">' +
      '<polyline points="' + linePts + '" fill="none" stroke="' + color + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"></polyline>' +
      '<circle cx="' + last[0].toFixed(1) + '" cy="' + last[1].toFixed(1) + '" r="2.6" fill="' + color + '"></circle>' +
      "</svg>"
    );
  }

  function trendDates(reportDate) {
    var end = new Date(reportDate);
    var offsets = [120, 90, 60, 30, 0];
    return offsets.map(function (d) {
      var t = new Date(end);
      t.setDate(t.getDate() - d);
      return t.toISOString().slice(0, 10);
    });
  }

  function badgePill(flag, extraCls) {
    return '<span class="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full whitespace-nowrap ' +
      (BADGE[flag] || "text-gray-600 bg-gray-100") + (extraCls ? " " + extraCls : "") + '">' +
      '<i class="' + (FLAG_ICON[flag] || "icon-minus") + ' text-[10px]"></i>' + flag + "</span>";
  }

  /* ======================================================================
     Render
     ====================================================================== */

  var resultId = "#RES-" + String(r.id).padStart(5, "0");
  var badgeCls = BADGE[r.flag] || "text-gray-600 bg-gray-100";
  var panel = PANELS[r.test] || null;
  var single = parseSingle(r.value);
  var specimen = SPECIMEN[r.test] || { type: "Blood", method: "Standard Laboratory Analysis" };
  var department = DEPARTMENT[r.test] || "General Laboratory";

  // ---- Hero ----
  $("lrd-test-name").textContent = r.test;
  $("lrd-flag-text").textContent = r.flag;
  $("lrd-flag-badge").className = "lrd-hbadge " + badgeCls;
  $("lrd-flag-dot").style.background = TONE[r.flag] || "#94a3b8";
  $("lrd-result-id").textContent = resultId;
  $("lrd-patient-name").textContent = r.patient;
  $("lrd-verified-by").textContent = r.verifiedBy;
  $("lrd-date").textContent = r.date;

  // ---- Stat cards ----
  $("lrd-stat-test").textContent = r.test;
  $("lrd-stat-flag").textContent = r.flag;
  $("lrd-stat-verified").textContent = r.verifiedBy;
  $("lrd-stat-date").textContent = r.date;

  // ---- Critical alert banner ----
  if (r.flag === "Critical") {
    $("lrd-critical-banner").style.display = "";
  }

  // ---- Result panel ----
  $("lrd-result-value").textContent = r.value;
  var pillEl = $("lrd-result-flag-pill");
  pillEl.className = "inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-full whitespace-nowrap " + badgeCls;
  pillEl.innerHTML = '<i class="' + (FLAG_ICON[r.flag] || "icon-minus") + '"></i>' + r.flag;
  $("lrd-verified-note").textContent = "Verified by " + r.verifiedBy + " on " + r.date;
  $("lrd-result-range").innerHTML = single ? rangeBar(single.value, single.low, single.high, r.flag) : "";

  // ---- Panel breakdown table (only for true multi-analyte panels) ----
  if (panel) {
    $("lrd-panel-section").style.display = "";
    $("lrd-panel-count").textContent = panel.length + " parameters";
    $("lrd-panel-body").innerHTML = panel.map(function (a) {
      var rangeCell = a.low !== undefined
        ? rangeBar(a.value, a.low, a.high, a.flag)
        : '<span class="text-xs text-gray-400">Expected: ' + esc(a.expected) + "</span>";
      return (
        '<tr class="hms-row">' +
        '<td class="hms-cell"><p class="text-xs font-bold text-gray-900 dark:text-white">' + esc(a.name) + "</p></td>" +
        '<td class="hms-cell"><span class="text-sm font-extrabold tabular-nums text-gray-900 dark:text-white">' + esc(a.value) + "</span>" +
        (a.unit ? ' <span class="text-[10px] font-semibold text-gray-400">' + esc(a.unit) + "</span>" : "") + "</td>" +
        '<td class="hms-cell min-w-[190px]">' + rangeCell + "</td>" +
        '<td class="hms-cell text-right">' + badgePill(a.flag) + "</td>" +
        "</tr>"
      );
    }).join("");
  }

  // ---- Trend ----
  if (single) {
    $("lrd-trend-section").style.display = "";
    var trendPts = makeTrend(single.value, r.test + "|" + r.patient);
    var trendDts = trendDates(r.date);
    $("lrd-trend-chart").innerHTML = sparkline(trendPts, r.flag);
    $("lrd-trend-current").textContent = trendPts[trendPts.length - 1] + (single.unit ? " " + single.unit : "");
    var delta = trendPts[trendPts.length - 1] - trendPts[0];
    var deltaEl = $("lrd-trend-delta");
    deltaEl.textContent = (delta >= 0 ? "+" : "") + Math.round(delta * 100) / 100 + " vs 4 months ago";
    deltaEl.className = "text-[11px] font-bold " + (delta > 0 ? "text-danger" : delta < 0 ? "text-success" : "text-gray-400");
    $("lrd-trend-points").innerHTML = trendPts.map(function (v, i) {
      return '<div><p class="text-[9px] font-bold text-gray-400">' + trendDts[i].slice(5) + '</p><p class="text-xs font-extrabold text-gray-900 dark:text-white tabular-nums">' + v + "</p></div>";
    }).join("");
  }

  // ---- Clinical interpretation ----
  $("lrd-interp-text").textContent = INTERPRETATION[r.flag] || INTERPRETATION.Normal;
  $("lrd-interp-icon").className = "lrd-icobox " + (r.flag === "Critical" ? "bg-danger" : r.flag === "Abnormal" ? "bg-warning" : "bg-success");
  $("lrd-interp-icon").innerHTML = '<i class="' + (FLAG_ICON[r.flag] || "icon-check") + '"></i>';

  // ---- Specimen & collection ----
  var collected = new Date(r.date);
  collected.setHours(collected.getHours() - 20);
  var received = new Date(r.date);
  received.setHours(received.getHours() - 15);
  var fmtDT = function (d) { return d.toISOString().slice(0, 10) + " · " + d.toTimeString().slice(0, 5); };
  $("lrd-spec-type").textContent = specimen.type;
  $("lrd-spec-method").textContent = specimen.method;
  $("lrd-spec-collected").textContent = fmtDT(collected);
  $("lrd-spec-received").textContent = fmtDT(received);
  $("lrd-spec-dept").textContent = department;

  // ---- Sidebar: patient ----
  $("lrd-kv-patient").textContent = r.patient;
  $("lrd-kv-test").textContent = r.test;
  $("lrd-kv-date").textContent = r.date;
  var mrn = "MRN-" + String(10000 + parseInt(r.id, 10) * 137).slice(0, 6);
  $("lrd-kv-mrn").textContent = mrn;

  // ---- Sidebar: order info ----
  var referrer = REFERRERS[seedNum(r.patient) % REFERRERS.length];
  $("lrd-order-physician").textContent = referrer;
  $("lrd-order-dept").textContent = department;
  var priority = r.flag === "Critical" ? "STAT" : "Routine";
  $("lrd-order-priority").innerHTML = '<span class="lrd-chip' + (priority === "STAT" ? " lrd-chip-stat" : "") + '">' + priority + "</span>";

  // ---- Sidebar: status timeline ----
  var steps = [
    { label: "Order Placed", by: referrer, offset: -22 },
    { label: "Specimen Collected", by: "Phlebotomy Team", offset: -20 },
    { label: "Received in Lab", by: department + " Lab", offset: -15 },
    { label: "Analysis Complete", by: department + " Lab", offset: -3 },
    { label: "Verified & Reported", by: r.verifiedBy, offset: 0 },
  ];
  $("lrd-timeline").innerHTML = steps.map(function (s, i) {
    var t = new Date(r.date);
    t.setHours(t.getHours() + s.offset);
    var isLast = i === steps.length - 1;
    return (
      '<div class="lrd-tl">' +
      '<span class="lrd-tl-dot' + (isLast ? " is-done" : "") + '"><i class="' + (isLast ? "icon-check" : "icon-circle") + '"></i></span>' +
      '<div class="min-w-0 pb-1"><p class="text-xs font-bold text-gray-900 dark:text-white">' + esc(s.label) + "</p>" +
      '<p class="text-[10px] text-gray-400">' + esc(s.by) + " · " + fmtDT(t) + "</p></div>" +
      "</div>"
    );
  }).join("");

  // ---- Sidebar: related tests ----
  var RELATED = {
    "Complete Blood Count": ["Peripheral Blood Smear", "Reticulocyte Count", "Iron Studies"],
    "Lipid Panel": ["Blood Glucose", "HbA1c", "Thyroid Panel"],
    "Liver Function Test": ["Hepatitis B Panel", "Hepatitis C Antibody", "Coagulation Profile (PT/INR)"],
    "Blood Glucose": ["HbA1c", "Lipid Panel", "Complete Blood Count"],
    "Urine Culture": ["Urinalysis", "Complete Blood Count", "Renal Function Panel"],
    "HIV Antibody Test": ["Hepatitis B Panel", "Hepatitis C Antibody", "Complete Blood Count"],
    "Biopsy Analysis": ["Immunohistochemistry Panel", "Complete Blood Count", "Tumor Marker Panel"],
    "Hepatitis B Panel": ["Liver Function Test", "Hepatitis C Antibody", "HIV Antibody Test"],
  };
  var related = RELATED[r.test] || ["Complete Blood Count", "Blood Glucose", "Lipid Panel"];
  $("lrd-related").innerHTML = related.map(function (name) {
    return (
      '<a href="lab-tests.html" class="lrd-related-item">' +
      '<span class="ico"><i class="icon-flask-conical"></i></span>' +
      '<span class="flex-1 min-w-0 text-xs font-bold text-gray-900 dark:text-white truncate">' + esc(name) + "</span>" +
      '<i class="icon-chevron-right text-gray-300 text-[12px]"></i></a>'
    );
  }).join("");

  // ---- Side hero ----
  $("lrd-side-verified").textContent = r.verifiedBy;
  $("lrd-side-date").textContent = "Reported " + r.date;

  document.title = r.test + " — " + resultId + " — Dreams HMS";

  // ---- Actions ----
  var downloadHandler = function () {
    MC.toast("Preparing report download…", "info");
  };
  $("lrd-download-btn").onclick = downloadHandler;
  $("lrd-download-btn-2").onclick = downloadHandler;

  var flagHandler = function () {
    MC.toast("Result flagged for physician review.", "success");
  };
  var flagBtn = $("lrd-flag-btn");
  if (flagBtn) flagBtn.onclick = flagHandler;
});
// ==========================================================================
// laboratory-dashboard.js
// ==========================================================================
// Dreams HMS — Laboratory Command Center
// Dr. Priya Oduya's LIMS floor: sample pipeline, tracking kanban,
// critical results, equipment bay, technician bench, performance dials,
// QC console, category benches, report approvals and the activity feed.
// Every headline figure derives from the underlying lists. No API.
(function () {
    "use strict";
    if ((location.pathname.split("/").pop() || "index.html") !== "laboratory-dashboard.html") return;

    const $ = (id) => document.getElementById(id);
    const esc = (v) => String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    const initials = (n) => n.replace(/^(Dr|Mr|Mrs|Ms)\.?\s+/i, "").split(/\s+/).slice(0, 2).map((p) => p.charAt(0).toUpperCase()).join("");
    const toast = (msg, tone) => (window.MC && MC.toast ? MC.toast(msg, tone || "info") : console.log(msg));

    /* ====================================================================
       Data — Central Diagnostics Lab (now = 2:15 PM)
       ==================================================================== */

    const PIPELINE = [
        { name: "Sample Collection", icon: "icon-syringe", count: 186, pct: 100, delay: null },
        { name: "Barcode Generated", icon: "icon-barcode", count: 186, pct: 100, delay: null },
        { name: "Lab Processing", icon: "icon-flask-conical", count: 42, pct: 74, delay: "6 delayed" },
        { name: "Quality Verification", icon: "icon-shield-check", count: 18, pct: 61, delay: null },
        { name: "Doctor Approval", icon: "icon-stethoscope", count: 11, pct: 48, delay: "2 waiting > 1h" },
        { name: "Report Delivered", icon: "icon-send", count: 118, pct: 63, delay: null },
    ];
    const CURRENT_STAGE = 2;

    let SAMPLES = [
        { id: "SMP-88214", patient: "Miriam Adeyemi", test: "Troponin I", pri: "STAT", time: "1:58 PM", tech: "J. Park", eta: "2:25 PM", lane: "processing" },
        { id: "SMP-88209", patient: "Harold Nakamura", test: "U&E Panel", pri: "Urgent", time: "1:40 PM", tech: "A. Osei", eta: "2:40 PM", lane: "processing" },
        { id: "SMP-88216", patient: "Selma Björk", test: "FBC", pri: "Routine", time: "2:05 PM", tech: "—", eta: "3:10 PM", lane: "received" },
        { id: "SMP-88217", patient: "Dmitri Volkov", test: "CRP + Cultures", pri: "Routine", time: "2:08 PM", tech: "—", eta: "5:30 PM", lane: "received" },
        { id: "SMP-88218", patient: "Amelia Hartley", test: "Lipid Profile", pri: "VIP", time: "2:12 PM", tech: "—", eta: "3:30 PM", lane: "received" },
        { id: "SMP-88205", patient: "Rosa Delgado", test: "Blood Cultures", pri: "Urgent", time: "12:45 PM", tech: "L. Ferreira", eta: "2:30 PM", lane: "review" },
        { id: "SMP-88201", patient: "Theo Lindqvist", test: "HbA1c", pri: "Routine", time: "12:10 PM", tech: "J. Park", eta: "Done", lane: "ready" },
        { id: "SMP-88198", patient: "Johan Petersen", test: "Liver Panel", pri: "Routine", time: "11:50 AM", tech: "A. Osei", eta: "Done", lane: "ready" },
        { id: "SMP-88190", patient: "Margaret Whitfield", test: "Coag Screen", pri: "Routine", time: "11:20 AM", tech: "L. Ferreira", eta: "Sent", lane: "delivered" },
        { id: "SMP-88186", patient: "Hana Suzuki", test: "TSH", pri: "Routine", time: "10:55 AM", tech: "M. Diallo", eta: "Sent", lane: "delivered" },
    ];
    const LANES = [
        { key: "received", label: "Received", tone: "lb-blue" },
        { key: "processing", label: "Processing", tone: "lb-cyan" },
        { key: "review", label: "Under Review", tone: "lb-amber" },
        { key: "ready", label: "Ready", tone: "lb-violet" },
        { key: "delivered", label: "Delivered", tone: "lb-emerald" },
    ];
    const NEXT_LANE = { received: "processing", processing: "review", review: "ready", ready: "delivered" };
    const PRI_TONE = { STAT: "lb-rose", Urgent: "lb-amber", VIP: "lb-violet", Routine: "lb-blue" };
    const TECHS_POOL = ["J. Park", "A. Osei", "L. Ferreira", "M. Diallo"];

    let CRITICALS = [
        { id: "c1", kind: "STAT Request", stat: true, icon: "icon-zap", tone: "lb-rose", text: "Troponin I for Miriam Adeyemi (SMP-88214) — cardiology waiting, ETA 2:25 PM.", time: "1:58 PM" },
        { id: "c2", kind: "Critical Blood Report", icon: "icon-droplet", tone: "lb-rose", text: "Potassium 6.8 mmol/L — Harold Nakamura. Phoned to Ward 4B, read-back confirmed.", time: "1:52 PM" },
        { id: "c3", kind: "Positive Infection", icon: "icon-bug", tone: "lb-amber", text: "Blood culture growing gram-negative rods — Rosa Delgado. ID + sensitivities running.", time: "1:30 PM" },
        { id: "c4", kind: "High Risk Alert", icon: "icon-triangle-alert", tone: "lb-amber", text: "INR 5.2 — Emmett Sandoval. Anticoagulation clinic paged for urgent review.", time: "12:48 PM" },
    ];

    let EQUIPMENT = [
        { name: "Hematology Analyzer XN-1000", state: "running", util: 82, last: "Jul 10", next: "Aug 10", note: "218 tubes today" },
        { name: "Biochemistry Analyzer AU-680", state: "running", util: 91, last: "Jul 8", next: "Aug 8", note: "Peak load — reagent R2 low" },
        { name: "PCR Thermocycler Q5", state: "running", util: 64, last: "Jul 12", next: "Sep 12", note: "Run 3 of 4 · 42 cycles" },
        { name: "Blood Gas Analyzer ABL-90", state: "maintenance", util: 0, last: "Today", next: "In service 4 PM", note: "Electrode swap in progress" },
        { name: "Digital Microscope DM-750", state: "idle", util: 12, last: "Jul 5", next: "Aug 5", note: "Reserved for pathology 3 PM" },
        { name: "Refrigeration Unit RF-2 (2–8°C)", state: "error", util: 100, last: "Jun 30", next: "Engineer called", note: "Temp 9.4°C — moving reagents to RF-1" },
    ];
    const EQ_META = { running: "Running", idle: "Idle", maintenance: "Maintenance", error: "Error" };

    const TECHS = [
        { name: "Jisoo Park", dept: "Hematology", assigned: 14, done: 11, shift: "Day", load: 78, perf: "top", tone: "lb-indigo" },
        { name: "Abena Osei", dept: "Biochemistry", assigned: 16, done: 12, shift: "Day", load: 86, perf: "high", tone: "lb-cyan" },
        { name: "Luis Ferreira", dept: "Microbiology", assigned: 9, done: 6, shift: "Day", load: 62, perf: "steady", tone: "lb-violet" },
        { name: "Mariam Diallo", dept: "Molecular Dx", assigned: 7, done: 7, shift: "Evening", load: 35, perf: "ahead", tone: "lb-emerald" },
    ];
    const PERF_BADGE = { top: ["Top performer", "lb-emerald"], high: ["High load", "lb-amber"], steady: ["On track", "lb-blue"], ahead: ["Ahead of queue", "lb-emerald"] };

    const PERF = [
        { label: "Avg Turnaround", val: "2h 04m", pct: 86, tone: "lb-cyan", sub: "target < 2h 30m" },
        { label: "Samples Processed", val: "186", pct: 74, tone: "lb-blue", sub: "of 250 expected" },
        { label: "Reports Delivered", val: "118", pct: 63, tone: "lb-emerald", sub: "today" },
        { label: "Pending Verification", val: "18", pct: 39, tone: "lb-amber", sub: "in QC + review" },
        { label: "Critical Cases", val: "5", pct: 100, tone: "lb-rose", sub: "all escalated" },
        { label: "STAT Compliance", val: "96%", pct: 96, tone: "lb-violet", sub: "< 45 min target" },
    ];

    const QC = {
        main: [
            { label: "QC runs passed", val: "27 of 29" },
            { label: "QC failed — repeats", val: "2 (Westgard 1-3s)" },
            { label: "Equipment validation", val: "5 of 6 instruments" },
            { label: "Compliance score", val: "98.2% · ISO 15189" },
        ],
        cal: [
            { label: "AU-680 calibration", val: "Due 4:00 PM" },
            { label: "XN-1000 daily QC", val: "Passed 7:05 AM" },
            { label: "Pipette verification", val: "Due Jul 21" },
        ],
    };

    const CATS = [
        { name: "Hematology", icon: "icon-droplet", tone: "lb-rose", running: 12, done: 64, pending: 5 },
        { name: "Biochemistry", icon: "icon-flask-conical", tone: "lb-blue", running: 16, done: 71, pending: 9 },
        { name: "Microbiology", icon: "icon-bug", tone: "lb-amber", running: 8, done: 22, pending: 11 },
    ];

    let REPORTS = [
        { id: "RPT-3312", patient: "Theo Lindqvist", test: "HbA1c", state: "Pending", tone: "lb-amber", icon: "icon-hourglass", by: "Awaiting pathologist" },
        { id: "RPT-3311", patient: "Johan Petersen", test: "Liver Panel", state: "Verified", tone: "lb-blue", icon: "icon-file-check", by: "QC passed · P. Oduya" },
        { id: "RPT-3310", patient: "Rosa Delgado", test: "Blood Cultures (interim)", state: "Doctor Approval", tone: "lb-violet", icon: "icon-stethoscope", by: "With Dr. Chen" },
        { id: "RPT-3308", patient: "Margaret Whitfield", test: "Coag Screen", state: "Ready to Send", tone: "lb-emerald", icon: "icon-send", by: "Auto-release queued" },
        { id: "RPT-3305", patient: "Bruno Silva", test: "Lipid Profile", state: "Rejected", tone: "lb-rose", icon: "icon-file-x", by: "Hemolyzed — recollect" },
    ];

    let ACTIVITY = [
        { time: "2:12 PM", cat: "Samples", icon: "icon-test-tube", tone: "lb-blue", text: "SMP-88218 registered — lipid profile for Amelia Hartley (VIP)" },
        { time: "2:08 PM", cat: "Samples", icon: "icon-barcode", tone: "lb-cyan", text: "Barcode printed for SMP-88217 — CRP + cultures" },
        { time: "1:58 PM", cat: "Critical", icon: "icon-zap", tone: "lb-rose", text: "STAT troponin started for Miriam Adeyemi — 45-min clock running" },
        { time: "1:52 PM", cat: "Critical", icon: "icon-siren", tone: "lb-rose", text: "Critical potassium 6.8 phoned to Ward 4B — read-back logged" },
        { time: "1:45 PM", cat: "Tests", icon: "icon-flask-conical", tone: "lb-indigo", text: "U&E batch completed on AU-680 — 24 results to review" },
        { time: "1:30 PM", cat: "QC", icon: "icon-shield-check", tone: "lb-emerald", text: "Afternoon QC passed on XN-1000 — all levels in range" },
        { time: "1:10 PM", cat: "Reports", icon: "icon-file-check", tone: "lb-violet", text: "RPT-3311 verified — liver panel for Johan Petersen" },
        { time: "12:55 PM", cat: "Reports", icon: "icon-send", tone: "lb-emerald", text: "RPT-3308 delivered to Dr. Ferreira — coag screen" },
        { time: "12:40 PM", cat: "Tests", icon: "icon-dna", tone: "lb-cyan", text: "PCR run 3 started — 18 respiratory panels, 42 cycles" },
        { time: "12:20 PM", cat: "QC", icon: "icon-triangle-alert", tone: "lb-amber", text: "QC repeat on AU-680 level 2 — Westgard 1-3s, recalibrating" },
    ];

    /* ====================================================================
       Renderers
       ==================================================================== */

    function renderHero() {
        $("fact-queue").textContent = SAMPLES.filter((s) => ["received", "processing", "review"].includes(s.lane)).length + " in queue";
        $("fact-crit").textContent = CRITICALS.length + " open";
        $("fact-reports").textContent = REPORTS.filter((r) => r.state !== "Ready to Send" && r.state !== "Rejected").length + " pending";

        const running = EQUIPMENT.filter((e) => e.state === "running").length;
        const errors = EQUIPMENT.filter((e) => e.state === "error").length;
        const pct = Math.round(((EQUIPMENT.length - errors - EQUIPMENT.filter((e) => e.state === "maintenance").length * 0.5) / EQUIPMENT.length) * 100);
        $("health-pct").textContent = pct + "%";
        requestAnimationFrame(() => ($("health-fill").style.width = pct + "%"));
        $("health-note").textContent = running + " running · " + errors + " fault · 1 in service";

        const strip = $("stat-strip");
        const stat = CRITICALS.find((c) => c.stat);
        if (stat) {
            strip.classList.add("is-alert");
            strip.innerHTML =
                '<span class="grid size-9 shrink-0 place-items-center rounded-xl bg-rose-500/25 text-rose-200"><i class="icon-zap" aria-hidden="true"></i></span>' +
                '<div class="min-w-0 flex-1"><p class="text-xs font-extrabold uppercase tracking-wider text-rose-200">STAT in progress — ' + esc(stat.time) + "</p>" +
                '<p class="mt-0.5 text-xs font-medium text-white/70">' + esc(stat.text) + "</p></div>" +
                '<button type="button" id="btn-track-stat" class="lb-action shrink-0"><i class="icon-crosshair" aria-hidden="true"></i>Track</button>';
            $("btn-track-stat").addEventListener("click", () => toast("SMP-88214 on the analyzer — 9 minutes to result.", "info"));
        } else {
            strip.classList.remove("is-alert");
            strip.innerHTML =
                '<span class="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-400/20 text-emerald-200"><i class="icon-shield-check" aria-hidden="true"></i></span>' +
                '<div class="min-w-0 flex-1"><p class="text-xs font-extrabold uppercase tracking-wider text-emerald-200">No STAT requests running</p>' +
                '<p class="mt-0.5 text-xs font-medium text-white/70">All urgent work is inside turnaround targets.</p></div>';
        }
    }

    function renderPipeline() {
        $("pipeline").innerHTML = PIPELINE.map((s, i) => {
            const state = i < CURRENT_STAGE ? "is-done" : i === CURRENT_STAGE ? "is-now" : "";
            return (
                '<li class="lb-stage ' + state + '">' +
                '<span class="lb-stage-node"><i class="' + s.icon + '" aria-hidden="true"></i></span>' +
                '<p class="text-[11px] font-bold ' + (i === CURRENT_STAGE ? "text-gray-900" : "text-gray-500") + '">' + esc(s.name) + "</p>" +
                '<div class="lb-stage-plate"><div class="flex items-center justify-between">' +
                '<p class="text-sm font-extrabold text-gray-900 tabular-nums">' + s.count + '</p>' +
                '<p class="text-[10px] font-bold text-gray-400 tabular-nums">' + s.pct + "%</p></div>" +
                '<div class="lb-stage-bar"><span style="width:0%" data-w="' + s.pct + '"></span></div>' +
                (s.delay ? '<p class="mt-1.5 text-[9px] font-extrabold text-rose-500"><i class="icon-clock-alert text-[9px]" aria-hidden="true"></i> ' + s.delay + "</p>" : '<p class="mt-1.5 text-[9px] font-semibold text-gray-400">On schedule</p>') +
                "</div></li>"
            );
        }).join("");
        requestAnimationFrame(() => document.querySelectorAll(".lb-stage-bar span").forEach((b) => (b.style.width = b.dataset.w + "%")));
        $("pipe-chip").textContent = PIPELINE[CURRENT_STAGE].name + " — " + PIPELINE[CURRENT_STAGE].count + " in stage";
    }

    function renderKanban() {
        $("kanban").innerHTML = LANES.map((l) => {
            const items = SAMPLES.filter((s) => s.lane === l.key);
            return (
                '<div class="lb-lane ' + l.tone + '" data-lane="' + l.key + '"><div class="mb-2 flex items-center justify-between px-1">' +
                '<p class="text-[11px] font-extrabold uppercase tracking-wider text-gray-500">' + l.label + '</p><span class="lb-chip ' + l.tone + '">' + items.length + "</span></div>" +
                (items.map((s) => (
                    '<div class="lb-card ' + l.tone + (s.pri === "STAT" && l.key !== "delivered" ? " is-stat" : "") + '" draggable="true" data-id="' + esc(s.id) + '">' +
                    '<div class="flex items-center gap-1.5">' +
                    '<span class="lb-id">' + esc(s.id) + "</span>" +
                    (s.pri !== "Routine" ? '<span class="lb-chip ' + PRI_TONE[s.pri] + ' text-[9px]">' + s.pri + "</span>" : "") +
                    "</div>" +
                    '<p class="mt-1.5 truncate text-xs font-extrabold text-gray-900">' + esc(s.patient) + "</p>" +
                    '<p class="mt-0.5 text-[10px] font-semibold text-gray-500">' + esc(s.test) + "</p>" +
                    '<div class="mt-1 flex items-center justify-between text-[9px] font-bold text-gray-400 tabular-nums">' +
                    '<span><i class="icon-clock text-[9px]" aria-hidden="true"></i> ' + esc(s.time) + "</span>" +
                    '<span>' + (s.tech !== "—" ? '<i class="icon-user text-[9px]" aria-hidden="true"></i> ' + esc(s.tech) : "Unassigned") + "</span>" +
                    '<span>ETA ' + esc(s.eta) + "</span></div>" +
                    (l.key !== "delivered"
                        ? '<div class="mt-2 flex items-center gap-0.5 border-t border-dashed border-border-color pt-1.5 dark:border-white/10" role="group" aria-label="' + esc(s.id) + ' actions">' +
                          '<button type="button" class="lb-card-btn" data-s="view" data-id="' + esc(s.id) + '" title="View" aria-label="View sample"><i class="icon-eye" aria-hidden="true"></i></button>' +
                          (s.tech === "—" ? '<button type="button" class="lb-card-btn" data-s="assign" data-id="' + esc(s.id) + '" title="Assign technician" aria-label="Assign technician"><i class="icon-user-plus" aria-hidden="true"></i></button>' : "") +
                          '<button type="button" class="lb-card-btn" data-s="advance" data-id="' + esc(s.id) + '" title="Advance" aria-label="Advance stage"><i class="icon-arrow-right" aria-hidden="true"></i></button>' +
                          (l.key === "review" ? '<button type="button" class="lb-card-btn" data-s="verify" data-id="' + esc(s.id) + '" title="Verify" aria-label="Verify"><i class="icon-shield-check" aria-hidden="true"></i></button>' : "") +
                          '<button type="button" class="lb-card-btn" data-s="barcode" data-id="' + esc(s.id) + '" title="Print barcode" aria-label="Print barcode"><i class="icon-barcode" aria-hidden="true"></i></button>' +
                          (l.key === "ready" ? '<button type="button" class="lb-card-btn" data-s="report" data-id="' + esc(s.id) + '" title="Generate report" aria-label="Generate report"><i class="icon-file-text" aria-hidden="true"></i></button>' : "") +
                          "</div>"
                        : "") +
                    "</div>"
                )).join("") || '<p class="py-4 text-center text-[10px] font-semibold text-gray-400">Empty</p>') +
                "</div>"
            );
        }).join("");
        const active = SAMPLES.filter((s) => s.lane !== "delivered").length;
        $("board-chip").textContent = active + " on the board · " + SAMPLES.filter((s) => s.pri === "STAT" && s.lane !== "delivered").length + " STAT";
    }

    let dragSampleId = null;
    document.addEventListener("dragstart", (e) => {
        const card = e.target.closest("#kanban [data-id]");
        if (!card) return;
        dragSampleId = card.dataset.id;
        card.classList.add("is-dragging");
    });
    document.addEventListener("dragend", (e) => {
        const card = e.target.closest("#kanban [data-id]");
        if (card) card.classList.remove("is-dragging");
        document.querySelectorAll("#kanban .lb-lane").forEach((l) => l.classList.remove("is-drop-target"));
    });
    document.addEventListener("dragover", (e) => {
        const lane = e.target.closest("#kanban [data-lane]");
        if (!lane) return;
        e.preventDefault();
        document.querySelectorAll("#kanban .lb-lane").forEach((l) => l.classList.toggle("is-drop-target", l === lane));
    });
    document.addEventListener("drop", (e) => {
        const lane = e.target.closest("#kanban [data-lane]");
        if (!lane || dragSampleId == null) return;
        e.preventDefault();
        const s = findSample(dragSampleId);
        if (s && s.lane !== lane.dataset.lane) {
            s.lane = lane.dataset.lane;
            if (s.lane === "delivered") s.eta = "Sent";
            renderKanban();
            renderHero();
            toast(s.id + " moved to " + LANES.find((l) => l.key === s.lane).label + ".", "success");
        }
        dragSampleId = null;
    });

    function renderCriticals() {
        $("criticals").innerHTML = CRITICALS.map((c) => {
            const tone = c.tone.split(",").pop().trim();
            return (
                '<div class="lb-crit ' + tone + (c.stat ? " is-stat" : "") + '">' +
                '<span class="lb-panel-icon !size-8 shrink-0 text-xs"><i class="' + c.icon + '" aria-hidden="true"></i></span>' +
                '<div class="min-w-0 flex-1"><div class="flex items-center gap-2"><p class="text-[11px] font-extrabold text-gray-900">' + esc(c.kind) + '</p><span class="ml-auto text-[10px] font-semibold text-gray-400 tabular-nums">' + esc(c.time) + "</span></div>" +
                '<p class="mt-0.5 text-[11px] leading-relaxed text-gray-500">' + esc(c.text) + "</p></div>" +
                '<button type="button" data-ack="' + c.id + '" class="shrink-0 self-center rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10" aria-label="Resolve alert"><i class="icon-check text-xs" aria-hidden="true"></i></button>' +
                "</div>"
            );
        }).join("") || '<div class="grid place-items-center py-8 text-center"><span class="grid size-12 place-items-center rounded-2xl bg-emerald-500/10 text-lg text-emerald-500"><i class="icon-shield-check" aria-hidden="true"></i></span><p class="mt-3 text-xs font-bold text-gray-500">No open critical results</p><p class="text-[10px] text-gray-400">All flags resolved and acknowledged.</p></div>';
    }

    function renderEquipment() {
        $("equipment").innerHTML = EQUIPMENT.map((e, i) => (
            '<div class="lb-eq is-' + e.state + '"><div class="flex items-start gap-2.5">' +
            '<span class="lb-eq-icon"><i class="' + (e.state === "error" ? "icon-triangle-alert" : e.state === "maintenance" ? "icon-wrench" : "icon-microscope") + '" aria-hidden="true"></i></span>' +
            '<div class="min-w-0 flex-1"><div class="flex items-center gap-2"><p class="truncate text-xs font-extrabold text-gray-900">' + esc(e.name) + '</p><span class="lb-eq-status ml-auto shrink-0">' + EQ_META[e.state] + "</span></div>" +
            '<p class="mt-0.5 text-[10px] font-semibold text-gray-400">' + esc(e.note) + "</p>" +
            '<div class="mt-1.5 flex items-center justify-between text-[9px] font-bold text-gray-400"><span>Utilization</span><span class="tabular-nums">' + e.util + "%</span></div>" +
            '<div class="lb-eq-track"><span class="lb-eq-fill" style="width:0%" data-w="' + e.util + '"></span></div>' +
            '<div class="mt-1.5 flex items-center justify-between text-[9px] font-semibold text-gray-400"><span><i class="icon-history text-[9px]" aria-hidden="true"></i> Serviced ' + esc(e.last) + "</span><span>Next: " + esc(e.next) + "</span></div></div>" +
            (e.state === "error" ? '<button type="button" data-eng="' + i + '" class="shrink-0 self-start rounded-lg bg-rose-500/10 px-2 py-1 text-[10px] font-extrabold text-rose-600 transition-colors hover:bg-rose-500/20 dark:text-rose-300">Escalate</button>' : "") +
            "</div></div>"
        )).join("");
        $("eq-chip").textContent = EQUIPMENT.filter((e) => e.state === "running").length + " of " + EQUIPMENT.length + " running";
        requestAnimationFrame(() => document.querySelectorAll(".lb-eq-fill").forEach((f) => (f.style.width = f.dataset.w + "%")));
    }

    function renderTechs() {
        $("techs").innerHTML = TECHS.map((t) => {
            const badge = PERF_BADGE[t.perf];
            return (
                '<div class="lb-tech ' + t.tone + '"><div class="flex items-start gap-3">' +
                '<span class="lb-tech-avatar">' + esc(initials(t.name)) + "</span>" +
                '<div class="min-w-0 flex-1"><div class="flex items-center gap-2"><p class="truncate text-xs font-extrabold text-gray-900">' + esc(t.name) + '</p>' +
                '<span class="lb-chip ' + badge[1] + ' ml-auto shrink-0 text-[9px]">' + badge[0] + "</span></div>" +
                '<p class="mt-0.5 text-[10px] font-bold text-gray-500">' + esc(t.dept) + " · " + t.shift + " shift</p>" +
                '<div class="mt-1.5 flex items-center gap-3 text-[10px] font-semibold text-gray-400 tabular-nums">' +
                '<span><b class="font-extrabold text-gray-700 dark:text-gray-200">' + t.assigned + "</b> assigned</span>" +
                '<span><b class="font-extrabold text-gray-700 dark:text-gray-200">' + t.done + "</b> completed</span></div>" +
                '<div class="mt-1 flex items-center justify-between text-[9px] font-bold text-gray-400"><span>Workload</span><span class="tabular-nums">' + t.load + "%</span></div>" +
                '<div class="lb-tech-load"><span style="width:0%" data-w="' + t.load + '"></span></div></div></div></div>'
            );
        }).join("");
        $("tech-chip").textContent = TECHS.length + " on shift";
        requestAnimationFrame(() => document.querySelectorAll(".lb-tech-load span").forEach((f) => (f.style.width = f.dataset.w + "%")));
    }

    function renderPerf() {
        $("perf").innerHTML = PERF.map((g) => {
            const C = 2 * Math.PI * 26;
            return (
                '<div class="lb-dial ' + g.tone + ' flex-col gap-1.5 rounded-2xl border border-border-color p-3 dark:border-white/10">' +
                '<div class="relative"><svg viewBox="0 0 64 64"><circle class="lb-dial-track" cx="32" cy="32" r="26" fill="none" stroke="currentColor" stroke-width="5"/>' +
                '<circle class="lb-dial-fill" cx="32" cy="32" r="26" fill="none" stroke-width="5" stroke-linecap="round" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + (C * (1 - g.pct / 100)).toFixed(1) + '"/></svg>' +
                '<span class="lb-dial-label">' + esc(g.val) + "</span></div>" +
                '<p class="text-center text-[10px] font-extrabold text-gray-500">' + g.label + '<br><span class="font-semibold text-gray-400">' + g.sub + "</span></p></div>"
            );
        }).join("");
    }

    function renderQc() {
        $("qc-main").innerHTML =
            '<div class="mb-1 flex items-center gap-2"><span class="lb-panel-icon !size-7 text-[11px]"><i class="icon-shield-check" aria-hidden="true"></i></span><p class="text-[11px] font-extrabold uppercase tracking-wider text-gray-500">Today’s QC</p></div>' +
            QC.main.map((r) => '<div class="lb-qc-row"><span>' + r.label + '</span><b class="font-extrabold text-gray-900 tabular-nums">' + r.val + "</b></div>").join("");
        $("qc-cal").innerHTML =
            '<div class="mb-1 flex items-center gap-2"><span class="lb-panel-icon !size-7 text-[11px]"><i class="icon-calendar-cog" aria-hidden="true"></i></span><p class="text-[11px] font-extrabold uppercase tracking-wider text-gray-500">Calibration Schedule</p></div>' +
            QC.cal.map((r) => '<div class="lb-qc-row"><span>' + r.label + '</span><b class="font-extrabold text-gray-900 tabular-nums">' + r.val + "</b></div>").join("");
        $("qc-chip").textContent = "98.2% compliant";
    }

    function renderCats() {
        $("categories").innerHTML = CATS.map((c) => (
            '<div class="lb-cat ' + c.tone + '"><div class="flex items-center gap-2.5">' +
            '<span class="lb-panel-icon !size-8 shrink-0 text-xs"><i class="' + c.icon + '" aria-hidden="true"></i></span>' +
            '<p class="min-w-0 flex-1 truncate text-xs font-extrabold text-gray-900">' + c.name + "</p></div>" +
            '<div class="mt-2 flex gap-1.5">' +
            '<div class="lb-cat-pill"><p class="text-xs font-extrabold text-gray-900 tabular-nums">' + c.running + '</p><p class="text-[8px] font-bold uppercase tracking-wide text-gray-400">Running</p></div>' +
            '<div class="lb-cat-pill"><p class="text-xs font-extrabold text-gray-900 tabular-nums">' + c.done + '</p><p class="text-[8px] font-bold uppercase tracking-wide text-gray-400">Done</p></div>' +
            '<div class="lb-cat-pill"><p class="text-xs font-extrabold text-gray-900 tabular-nums">' + c.pending + '</p><p class="text-[8px] font-bold uppercase tracking-wide text-gray-400">Queue</p></div>' +
            "</div></div>"
        )).join("");
        $("cat-chip").textContent = CATS.reduce((s, c) => s + c.running, 0) + " tests running";
    }

    function renderReports() {
        $("reports").innerHTML = REPORTS.map((r, i) => (
            '<div class="lb-rep ' + r.tone + '"><span class="lb-rep-dot"><i class="' + r.icon + '" aria-hidden="true"></i></span>' +
            '<div class="lb-rep-card"><div class="flex flex-wrap items-center gap-x-2 gap-y-1">' +
            '<span class="lb-id ' + r.tone + '">' + esc(r.id) + '</span><span class="lb-chip ' + r.tone + ' text-[9px]">' + r.state + "</span>" +
            (r.state === "Verified" || r.state === "Ready to Send" ? '<button type="button" data-send="' + i + '" class="ml-auto rounded-lg bg-emerald-500/10 px-2 py-1 text-[10px] font-extrabold text-emerald-600 transition-colors hover:bg-emerald-500/20 dark:text-emerald-300">Send</button>' : "") +
            "</div>" +
            '<p class="mt-1 text-xs font-bold text-gray-800 dark:text-gray-200">' + esc(r.patient) + ' <span class="font-semibold text-gray-400">· ' + esc(r.test) + "</span></p>" +
            '<p class="mt-0.5 text-[10px] font-semibold text-gray-500">' + esc(r.by) + "</p></div></div>"
        )).join("");
        $("rep-chip").textContent = REPORTS.filter((r) => r.state === "Pending" || r.state === "Doctor Approval").length + " awaiting sign-off";
    }

    let actFilter = "All";
    function renderActivity() {
        const cats = ["All"].concat([...new Set(ACTIVITY.map((a) => a.cat))]);
        $("act-filters").innerHTML = cats.map((c) =>
            '<button type="button" data-cat="' + c + '" aria-pressed="' + (actFilter === c) + '" class="lb-chip lb-cyan cursor-pointer' + (actFilter === c ? "" : " opacity-50") + '">' + c + "</button>"
        ).join("");
        $("activity").innerHTML = ACTIVITY.filter((a) => actFilter === "All" || a.cat === actFilter).map((a) => (
            '<div class="lb-tl ' + a.tone + '"><span class="lb-tl-icon"><i class="' + a.icon + '" aria-hidden="true"></i></span>' +
            '<div class="min-w-0 flex-1 pb-1"><div class="flex items-center gap-2"><span class="lb-chip ' + a.tone + ' text-[9px]">' + a.cat + '</span><span class="text-[10px] font-semibold text-gray-400 tabular-nums">' + esc(a.time) + "</span></div>" +
            '<p class="mt-1 text-[11px] font-semibold leading-relaxed text-gray-700 dark:text-gray-300">' + esc(a.text) + "</p></div></div>"
        )).join("");
    }

    /* ====================================================================
       Wiring
       ==================================================================== */

    function findSample(id) {
        return SAMPLES.find((s) => s.id === id);
    }

    function init() {
        // Panels are already painted server-side as static HTML (see the
        // laboratory-dashboard.html markup for #pipeline, #kanban,
        // #criticals, #equipment, #techs, #perf, #qc-main/#qc-cal,
        // #categories, #reports, #act-filters and #activity, plus the hero
        // facts/health bar/STAT strip) — the render*() functions below are
        // only re-invoked after a real mutation to keep those panels in
        // sync, not on initial load.
        //
        // renderHero() normally (re)builds #stat-strip and, when a STAT
        // sample is in progress, wires up its "Track" button — since the
        // static markup already contains that button, reattach its handler
        // directly here instead of calling renderHero() just for that.
        const trackBtn = $("btn-track-stat");
        if (trackBtn) trackBtn.addEventListener("click", () => toast("SMP-88214 on the analyzer — 9 minutes to result.", "info"));

        // Kanban ops
        $("kanban").addEventListener("click", (e) => {
            const btn = e.target.closest("[data-s]");
            if (!btn) return;
            const s = findSample(btn.dataset.id);
            const op = btn.dataset.s;
            if (op === "view") return toast(s.id + " — " + s.test + " for " + s.patient + " · collected " + s.time + ".", "info");
            if (op === "barcode") return toast("Barcode reprinted for " + s.id + ".", "success");
            if (op === "assign") {
                s.tech = TECHS_POOL[SAMPLES.indexOf(s) % TECHS_POOL.length];
                renderKanban();
                return toast(s.id + " assigned to " + s.tech + ".", "success");
            }
            if (op === "verify") {
                s.lane = "ready";
                renderKanban();
                renderHero();
                return toast(s.id + " verified — result released to Ready.", "success");
            }
            if (op === "report") return toast("Report generated for " + s.id + " — queued for pathologist sign-off.", "success");
            if (op === "advance") {
                s.lane = NEXT_LANE[s.lane];
                if (s.lane === "delivered") s.eta = "Sent";
                renderKanban();
                renderHero();
                const msg = { processing: "moved to processing", review: "on the review bench", ready: "ready for delivery", delivered: "report delivered" }[s.lane];
                toast(s.id + " " + msg + ".", "success");
            }
        });

        // Criticals
        $("criticals").addEventListener("click", (e) => {
            const a = e.target.closest("[data-ack]");
            if (!a) return;
            CRITICALS = CRITICALS.filter((c) => c.id !== a.dataset.ack);
            renderCriticals();
            renderHero();
        });
        $("btn-notify-all").addEventListener("click", () => {
            if (!CRITICALS.length) return toast("No critical results to notify.", "info");
            toast("Critical-result notifications sent to " + CRITICALS.length + " ordering doctors.", "success");
        });

        // Equipment escalation
        $("equipment").addEventListener("click", (e) => {
            const b = e.target.closest("[data-eng]");
            if (!b) return;
            const eq = EQUIPMENT[parseInt(b.dataset.eng, 10)];
            eq.state = "maintenance";
            eq.note = "Engineer on site — ETA repair 5 PM";
            eq.next = "In service 5 PM";
            eq.util = 0;
            renderEquipment();
            renderHero();
            toast(eq.name + " escalated — biomedical engineer dispatched.", "success");
        });

        // Reports
        $("reports").addEventListener("click", (e) => {
            const b = e.target.closest("[data-send]");
            if (!b) return;
            const r = REPORTS[parseInt(b.dataset.send, 10)];
            r.state = "Ready to Send";
            r.tone = "lb-emerald";
            r.icon = "icon-send";
            r.by = "Delivered to ordering doctor";
            REPORTS.splice(REPORTS.indexOf(r), 1);
            renderReports();
            renderHero();
            toast(r.id + " sent — " + r.patient + "'s " + r.test + " delivered.", "success");
        });

        // Activity filters
        $("act-filters").addEventListener("click", (e) => {
            const c = e.target.closest("[data-cat]");
            if (!c) return;
            actFilter = c.dataset.cat;
            renderActivity();
        });

        // Hero quick actions
        $("btn-sample").addEventListener("click", () => {
            const id = "SMP-882" + (19 + SAMPLES.filter((s) => s.id > "SMP-88218").length);
            SAMPLES.unshift({ id, patient: "Walk-in Patient", test: "FBC + ESR", pri: "Routine", time: "2:15 PM", tech: "—", eta: "3:45 PM", lane: "received" });
            renderKanban();
            renderHero();
            toast(id + " registered — barcode sent to the printer.", "success");
        });
        $("btn-verify").addEventListener("click", () => toast("Verification worklist opened — 18 results awaiting review.", "info"));
        $("btn-stat").addEventListener("click", () => toast("STAT order form opened — 45-minute turnaround clock starts on receipt.", "error"));

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
            toast(item.dataset.act + (item.dataset.act === "Emergency Test" ? " — STAT priority applied, lab supervisor notified." : " opened."), item.dataset.act === "Emergency Test" ? "error" : "success");
        });
        document.addEventListener("click", (e) => {
            if (!e.target.closest(".lb-dock")) {
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
// laboratory.js
// ==========================================================================
(function () {
if ((location.pathname.split("/").pop() || "index.html") !== "laboratory.html") return;
const pad = (n) => "#LAB-" + String(n).padStart(4, "0");
const SBADGE = {
    Pending: "text-gray-900 bg-light/60",
    "Sample Collected": "text-warning bg-warning/10",
    Processing: "text-purple bg-purple/10",
    Completed: "text-success bg-success/10",
    Cancelled: "text-danger bg-danger/10",
};
const PBADGE = {
    Routine: "text-primary bg-primary/10",
    Urgent: "text-warning bg-warning/10",
    STAT: "text-danger bg-danger/10",
};
let data = [
    {
        id: 1,
        test: "Complete Blood Count",
        patient: "James Morrison",
        doctor: "Dr. Sarah Chen",
        sample: "Blood",
        date: "2024-12-10",
        priority: "Routine",
        status: "Completed",
        notes: "",
    },
    {
        id: 2,
        test: "Lipid Profile",
        patient: "Sarah Adams",
        doctor: "Dr. Raj Kumar",
        sample: "Blood",
        date: "2024-12-10",
        priority: "Routine",
        status: "Processing",
        notes: "",
    },
    {
        id: 3,
        test: "Urine Culture",
        patient: "Robert Clark",
        doctor: "Dr. Alice Mills",
        sample: "Urine",
        date: "2024-12-10",
        priority: "Urgent",
        status: "Processing",
        notes: "",
    },
    {
        id: 4,
        test: "Thyroid Function Test",
        patient: "Emily Johnson",
        doctor: "Dr. James Park",
        sample: "Blood",
        date: "2024-12-11",
        priority: "Routine",
        status: "Pending",
        notes: "",
    },
    {
        id: 5,
        test: "HbA1c",
        patient: "David Torres",
        doctor: "Dr. Felix Osei",
        sample: "Blood",
        date: "2024-12-11",
        priority: "Routine",
        status: "Sample Collected",
        notes: "",
    },
    {
        id: 6,
        test: "Chest X-Ray Film",
        patient: "Linda Nguyen",
        doctor: "Dr. Li Wang",
        sample: "Tissue",
        date: "2024-12-12",
        priority: "STAT",
        status: "Processing",
        notes: "Biopsy sample",
    },
    {
        id: 7,
        test: "Blood Culture",
        patient: "Michael Harris",
        doctor: "Dr. Maya Nair",
        sample: "Blood",
        date: "2024-12-12",
        priority: "STAT",
        status: "Pending",
        notes: "High fever — suspected sepsis",
    },
    {
        id: 8,
        test: "Stool Routine",
        patient: "Anna Peterson",
        doctor: "Dr. Tom Rivas",
        sample: "Stool",
        date: "2024-12-13",
        priority: "Routine",
        status: "Completed",
        notes: "",
    },
];
let nextId = 9,
    editingId = null;
function detailUrl(r) {
    return "lab-test-detail.html?" + new URLSearchParams({
        id: r.id, test: r.test, patient: r.patient, doctor: r.doctor,
        sample: r.sample, date: r.date, priority: r.priority, status: r.status, notes: r.notes || "",
    }).toString();
}
function rowHTML(r) {
    return `<tr data-row-id="${r.id}"><td class="text-primary font-mono text-sm"><a href="${detailUrl(r)}">${pad(r.id)}</a></td><td class="font-medium text-gray-900">${r.test}</td><td class="text-gray-600 dark:text-gray-300">${r.patient}</td><td class="text-gray-500 dark:text-gray-400">${r.doctor}</td><td><span class="inline-block px-2 py-1 text-xs font-semibold rounded-lg whitespace-nowrap text-gray-900 bg-light/60">${r.sample}</span></td><td class="text-gray-500 dark:text-gray-400 text-sm">${r.date}</td><td><span class="inline-block px-2 py-1 text-xs font-semibold rounded-lg whitespace-nowrap ${PBADGE[r.priority] || "text-gray-900 bg-light/60"}">${r.priority}</span></td><td><span class="inline-block px-2 py-1 text-xs font-semibold rounded-lg whitespace-nowrap ${SBADGE[r.status] || "text-gray-900 bg-light/60"}">${r.status}</span></td><td><div class="flex gap-1"><button onclick="openEdit(${r.id})" class="p-1.5 size-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400" title="Edit"><i class="icon-edit text-base"></i></button><button onclick="deleteRecord(${r.id},'${r.test}')" class="p-1.5 size-7 flex items-center justify-center rounded hover:bg-danger/20 dark:hover:bg-red-900/20 text-danger" title="Delete"><i class="icon-trash-2 text-base"></i></button></div></td></tr>`;
}
function updateStats() {
    document.getElementById("stat-total").textContent = data.length;
    document.getElementById("stat-pend").textContent = data.filter(
        (r) => r.status === "Pending",
    ).length;
    document.getElementById("stat-proc").textContent = data.filter((r) =>
        ["Sample Collected", "Processing"].includes(r.status),
    ).length;
    document.getElementById("stat-done").textContent = data.filter(
        (r) => r.status === "Completed",
    ).length;
}
function render(q = "", priority = "", status = "") {
    const rows = data.filter((r) => {
        const m = q
            ? r.test.toLowerCase().includes(q.toLowerCase()) ||
              r.patient.toLowerCase().includes(q.toLowerCase()) ||
              r.doctor.toLowerCase().includes(q.toLowerCase())
            : true;
        return (
            m &&
            (priority ? r.priority === priority : true) &&
            (status ? r.status === status : true)
        );
    });
    document.getElementById("count").textContent =
        `${rows.length} of ${data.length}`;
    const visible = new Set(rows.map((r) => r.id));
    const tbody = document.getElementById("tbody");
    Array.from(tbody.querySelectorAll("[data-row-id]")).forEach((tr) => {
        tr.classList.toggle("hidden", !visible.has(Number(tr.dataset.rowId)));
    });
    const emptyRow = document.getElementById("tbody-empty");
    if (emptyRow) emptyRow.classList.toggle("hidden", rows.length !== 0);
    updateStats();
}
function openAdd() {
    editingId = null;
    document.getElementById("m-title").textContent = "New Lab Test";
    document.getElementById("btn-save").textContent = "Create Request";
    document.getElementById("m-form").reset();
    document.getElementById("f-date").value = new Date()
        .toISOString()
        .split("T")[0];
    MC.openModal("form-modal");
}
function openEdit(id) {
    const r = data.find((x) => x.id === id);
    editingId = id;
    document.getElementById("m-title").textContent = "Edit Test Request";
    document.getElementById("btn-save").textContent = "Update";
    document.getElementById("f-test").value = r.test;
    document.getElementById("f-patient").value = r.patient;
    document.getElementById("f-doctor").value = r.doctor;
    document.getElementById("f-sample").value = r.sample;
    document.getElementById("f-date").value = r.date;
    document.getElementById("f-priority").value = r.priority;
    document.getElementById("f-status").value = r.status;
    document.getElementById("f-notes").value = r.notes;
    MC.openModal("form-modal");
}
function saveRecord() {
    const test = document.getElementById("f-test").value.trim();
    const patient = document.getElementById("f-patient").value.trim();
    if (!test) {
        MC.toast("Test name required", "error");
        return;
    }
    if (!patient) {
        MC.toast("Patient name required", "error");
        return;
    }
    const rec = {
        test,
        patient,
        doctor: document.getElementById("f-doctor").value.trim(),
        sample: document.getElementById("f-sample").value,
        date: document.getElementById("f-date").value,
        priority: document.getElementById("f-priority").value,
        status: document.getElementById("f-status").value,
        notes: document.getElementById("f-notes").value.trim(),
    };
    const tbody = document.getElementById("tbody");
    if (editingId) {
        const idx = data.findIndex((x) => x.id === editingId);
        data[idx] = { ...data[idx], ...rec };
        const existingEl = tbody.querySelector(`[data-row-id="${editingId}"]`);
        if (existingEl) existingEl.outerHTML = rowHTML(data[idx]);
        MC.toast("Test updated", "success");
    } else {
        const newRecord = { id: nextId++, ...rec };
        data.push(newRecord);
        tbody.insertAdjacentHTML("beforeend", rowHTML(newRecord));
        MC.toast("Test request created", "success");
    }
    MC.closeModal("form-modal");
    render(
        document.getElementById("search").value,
        document.getElementById("filter-priority").value,
        document.getElementById("filter-status").value,
    );
}
function deleteRecord(id, name) {
    MC.confirmDelete(name, () => {
        data = data.filter((x) => x.id !== id);
        const el = document.getElementById("tbody").querySelector(`[data-row-id="${id}"]`);
        if (el) el.remove();
        render(
            document.getElementById("search").value,
            document.getElementById("filter-priority").value,
            document.getElementById("filter-status").value,
        );
        MC.toast("Test deleted", "success");
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
                document.getElementById("filter-priority").value,
                document.getElementById("filter-status").value,
            ),
        );
    document
        .getElementById("filter-priority")
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
                document.getElementById("filter-priority").value,
                e.target.value,
            ),
        );
    MC.initDeleteModal();
    MC.closeOnBackdrop("form-modal");
    MC.closeOnBackdrop("del-modal");
    updateStats();
});

})();
// ==========================================================================
// medical-records.js
// ==========================================================================
(function () {
if ((location.pathname.split("/").pop() || "index.html") !== "medical-records.html") return;
const pad = (n) => "#MR-" + String(n).padStart(5, "0");
const detailUrl = (r) =>
    "medical-record-detail.html?" +
    new URLSearchParams({
        id: r.id,
        patient: r.patient,
        type: r.type,
        diag: r.diag,
        doctor: r.doctor,
        dept: r.dept,
        date: r.date,
        status: r.status,
    }).toString();
const SBADGE = {
    Complete: "text-success bg-success/10",
    "Pending Review": "text-warning bg-warning/10",
    Confidential: "text-danger bg-danger/10",
};
const TBADGE = {
    Admission: "text-warning bg-warning/10",
    Outpatient: "text-primary bg-primary/10",
    Surgery: "text-purple bg-purple/10",
    Emergency: "text-danger bg-danger/10",
    "Follow-Up": "text-success bg-success/10",
};
let data = [
    {
        id: 1,
        patient: "James Morrison",
        type: "Admission",
        diag: "Acute MI",
        doctor: "Dr. Sarah Chen",
        dept: "Cardiology",
        date: "2024-12-01",
        status: "Complete",
        notes: "",
    },
    {
        id: 2,
        patient: "Sarah Adams",
        type: "Outpatient",
        diag: "Migraine Disorder",
        doctor: "Dr. Raj Kumar",
        dept: "Neurology",
        date: "2024-12-02",
        status: "Complete",
        notes: "",
    },
    {
        id: 3,
        patient: "Robert Clark",
        type: "Surgery",
        diag: "Cardiac Arrest Recovery",
        doctor: "Dr. Alice Mills",
        dept: "Surgery",
        date: "2024-12-03",
        status: "Pending Review",
        notes: "Post-op notes pending",
    },
    {
        id: 4,
        patient: "Emily Johnson",
        type: "Admission",
        diag: "Normal Delivery",
        doctor: "Dr. James Park",
        dept: "Pediatrics",
        date: "2024-11-29",
        status: "Complete",
        notes: "",
    },
    {
        id: 5,
        patient: "David Torres",
        type: "Surgery",
        diag: "Knee Osteoarthritis",
        doctor: "Dr. Felix Osei",
        dept: "Orthopedics",
        date: "2024-12-04",
        status: "Complete",
        notes: "",
    },
    {
        id: 6,
        patient: "Michael Harris",
        type: "Admission",
        diag: "Congestive Heart Failure",
        doctor: "Dr. Maya Nair",
        dept: "Geriatrics",
        date: "2024-12-01",
        status: "Confidential",
        notes: "Family notified",
    },
    {
        id: 7,
        patient: "Linda Nguyen",
        type: "Outpatient",
        diag: "Stage 2 Breast Cancer",
        doctor: "Dr. Li Wang",
        dept: "Oncology",
        date: "2024-12-05",
        status: "Confidential",
        notes: "",
    },
    {
        id: 8,
        patient: "Anna Peterson",
        type: "Follow-Up",
        diag: "Viral Fever",
        doctor: "Dr. Tom Rivas",
        dept: "Emergency",
        date: "2024-11-30",
        status: "Complete",
        notes: "",
    },
];
let nextId = 9,
    editingId = null;
function rowHTML(r) {
    return `<tr data-row-id="${r.id}"><td class="text-primary font-mono text-sm"><a href="${detailUrl(r)}">${pad(r.id)}</a></td><td class="font-medium text-gray-900">${r.patient}</td><td class="text-gray-600 dark:text-gray-300 max-w-xs">${r.diag}</td><td><span class="inline-block px-2 py-1 text-xs font-semibold rounded-lg whitespace-nowrap ${TBADGE[r.type] || "text-gray-900 bg-light/60"}">${r.type}</span></td><td class="text-gray-500 dark:text-gray-400 text-sm">${r.doctor}</td><td class="text-gray-500 dark:text-gray-400 text-sm">${r.date}</td><td><span class="inline-block px-2 py-1 text-xs font-semibold rounded-lg whitespace-nowrap ${SBADGE[r.status] || "text-gray-900 bg-light/60"}">${r.status}</span></td><td><div class="flex gap-1"><button onclick="openEdit(${r.id})" class="p-1.5 size-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400" title="Edit"><i class="icon-edit text-base"></i></button><button onclick="deleteRecord(${r.id},'${r.patient}')" class="p-1.5 size-7 flex items-center justify-center rounded hover:bg-danger/20 dark:hover:bg-red-900/20 text-danger" title="Delete"><i class="icon-trash-2 text-base"></i></button></div></td></tr>`;
}
function updateStats() {
    document.getElementById("stat-total").textContent = data.length;
    document.getElementById("stat-comp").textContent = data.filter(
        (r) => r.status === "Complete",
    ).length;
    document.getElementById("stat-pend").textContent = data.filter(
        (r) => r.status === "Pending Review",
    ).length;
    document.getElementById("stat-conf").textContent = data.filter(
        (r) => r.status === "Confidential",
    ).length;
}
function render(q = "", type = "", status = "") {
    const tbody = document.getElementById("tbody");
    const matches = data.filter((r) => {
        const m = q
            ? r.patient.toLowerCase().includes(q.toLowerCase()) ||
              r.diag.toLowerCase().includes(q.toLowerCase())
            : true;
        return (
            m &&
            (type ? r.type === type : true) &&
            (status ? r.status === status : true)
        );
    });
    const visible = new Set(matches.map((r) => r.id));
    let anyVisible = false;
    tbody.querySelectorAll("[data-row-id]").forEach((tr) => {
        const isVisible = visible.has(Number(tr.dataset.rowId));
        tr.classList.toggle("hidden", !isVisible);
        if (isVisible) anyVisible = true;
    });
    let empty = tbody.querySelector("#no-records-row");
    if (!anyVisible) {
        if (!empty) {
            tbody.insertAdjacentHTML(
                "beforeend",
                `<tr id="no-records-row"><td colspan="8" class="text-center py-10 text-gray-400">No records found</td></tr>`,
            );
        }
    } else if (empty) {
        empty.remove();
    }
    document.getElementById("count").textContent =
        `${matches.length} of ${data.length}`;
    updateStats();
}
function openAdd() {
    editingId = null;
    document.getElementById("m-title").textContent = "Add Medical Record";
    document.getElementById("btn-save").textContent = "Save Record";
    document.getElementById("m-form").reset();
    document.getElementById("f-date").value = new Date()
        .toISOString()
        .split("T")[0];
    MC.openModal("form-modal");
}
function openEdit(id) {
    const r = data.find((x) => x.id === id);
    editingId = id;
    document.getElementById("m-title").textContent = "Edit Record";
    document.getElementById("btn-save").textContent = "Update";
    document.getElementById("f-patient").value = r.patient;
    document.getElementById("f-type").value = r.type;
    document.getElementById("f-diag").value = r.diag;
    document.getElementById("f-doctor").value = r.doctor;
    document.getElementById("f-dept").value = r.dept;
    document.getElementById("f-date").value = r.date;
    document.getElementById("f-status").value = r.status;
    document.getElementById("f-notes").value = r.notes;
    MC.openModal("form-modal");
}
function saveRecord() {
    const patient = document.getElementById("f-patient").value.trim();
    const diag = document.getElementById("f-diag").value.trim();
    if (!patient) {
        MC.toast("Patient name required", "error");
        return;
    }
    if (!diag) {
        MC.toast("Diagnosis required", "error");
        return;
    }
    const rec = {
        patient,
        type: document.getElementById("f-type").value,
        diag,
        doctor: document.getElementById("f-doctor").value.trim(),
        dept: document.getElementById("f-dept").value,
        date: document.getElementById("f-date").value,
        status: document.getElementById("f-status").value,
        notes: document.getElementById("f-notes").value.trim(),
    };
    if (editingId) {
        const idx = data.findIndex((x) => x.id === editingId);
        data[idx] = { ...data[idx], ...rec };
        const existingEl = document
            .getElementById("tbody")
            .querySelector(`[data-row-id="${editingId}"]`);
        if (existingEl) existingEl.outerHTML = rowHTML(data[idx]);
        MC.toast("Record updated", "success");
    } else {
        const newRecord = { id: nextId++, ...rec };
        data.push(newRecord);
        document
            .getElementById("tbody")
            .insertAdjacentHTML("beforeend", rowHTML(newRecord));
        MC.toast("Record added", "success");
    }
    MC.closeModal("form-modal");
    render(
        document.getElementById("search").value,
        document.getElementById("filter-type").value,
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
            document.getElementById("filter-type").value,
            document.getElementById("filter-status").value,
        );
        MC.toast("Record deleted", "success");
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
                document.getElementById("filter-type").value,
                document.getElementById("filter-status").value,
            ),
        );
    document
        .getElementById("filter-type")
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
                document.getElementById("filter-type").value,
                e.target.value,
            ),
        );
    MC.initDeleteModal();
    MC.closeOnBackdrop("form-modal");
    MC.closeOnBackdrop("del-modal");
    updateStats();
});

})();
// ==========================================================================
// radiology-report-detail.js
// ==========================================================================
// ---- Radiology Report Detail --------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
  if (document.body.dataset.page !== "radiology-report-detail") return;

  var $ = function (id) { return document.getElementById(id); };
  var params = new URLSearchParams(window.location.search);
  var pick = function (key, fallback) { var v = params.get(key); return v && v.length ? v : fallback; };

  var r = {
    id: pick("id", "1"),
    patient: pick("patient", "David Torres"),
    modality: pick("modality", "X-Ray"),
    findings: pick("findings", "No acute abnormality detected."),
    radiologist: pick("radiologist", "Dr. Nina Petrova"),
    date: pick("date", "2024-12-02"),
    status: pick("status", "Finalized"),
    history: pick("history", "Patient presents with persistent chest discomfort and shortness of breath. Rule out acute cardiopulmonary pathology."),
    technique: pick("technique", "Standard two-view radiographic series (PA and lateral) obtained using digital radiography. No prior comparison studies available. No contrast administered."),
    impression: pick("impression", "1. No evidence of acute cardiopulmonary disease.\n2. No displaced fracture or focal osseous lesion.\n3. Recommend clinical correlation and follow-up imaging if symptoms persist."),
  };

  var BADGE = {
    Draft: "text-warning bg-warning/10",
    Finalized: "text-success bg-success/10",
  };
  var STATUS_TONE = { Draft: "#F59E0B", Finalized: "#009966" };

  var reportId = "#RPT-" + String(r.id).padStart(5, "0");

  $("rrd-patient-name").textContent = r.patient;
  $("rrd-status-badge").textContent = r.status;
  $("rrd-report-id").textContent = reportId;
  $("rrd-modality").textContent = r.modality;
  $("rrd-radiologist-name").textContent = r.radiologist;
  $("rrd-date").textContent = r.date;
  $("rrd-modality-stat").textContent = r.modality;
  $("rrd-radiologist-stat").textContent = r.radiologist;
  $("rrd-report-date").textContent = r.date;
  $("rrd-status-stat").textContent = r.status;
  $("rrd-findings-text").textContent = r.findings;
  $("rrd-sig-radiologist").textContent = "— " + r.radiologist;
  $("rrd-sig-date").textContent = r.date;
  $("rrd-history-text").textContent = r.history;
  $("rrd-technique-text").textContent = r.technique;
  $("rrd-impression-text").textContent = r.impression;
  $("rrd-sig-radiologist-2").textContent = "— " + r.radiologist;
  $("rrd-sig-date-2").textContent = r.date;
  $("rrd-side-patient").textContent = r.patient;
  $("rrd-side-modality").textContent = r.modality + " Scan";
  $("rrd-kv-patient").textContent = r.patient;
  $("rrd-kv-modality").textContent = r.modality;
  $("rrd-kv-radiologist").textContent = r.radiologist;
  $("rrd-kv-date").textContent = r.date;
  document.title = r.patient + " — " + reportId + " — Dreams HMS";

  var badgeCls = BADGE[r.status] || "text-gray-600 bg-gray-100";
  var badgeEl = $("rrd-status-badge");
  badgeCls.split(" ").forEach(function (c) { badgeEl.classList.add(c); });

  var tone = STATUS_TONE[r.status] || "#94a3b8";
  var dot = badgeEl.previousElementSibling;
  if (dot) dot.style.background = tone;

  // ---- Actions ----
  var downloadHandler = function () {
    MC.toast("Preparing report PDF download…", "info");
  };
  $("rrd-download-btn").onclick = downloadHandler;
  $("rrd-download-btn-2").onclick = downloadHandler;

  var isDraft = r.status === "Draft";
  var finalizeBtn = $("rrd-finalize-btn");
  if (isDraft) {
    finalizeBtn.onclick = function () {
      MC.toast("Report finalized", "success");
    };
  } else {
    finalizeBtn.disabled = true;
    finalizeBtn.title = "This report is already finalized";
  }
});
// ==========================================================================
// radiology.js
// ==========================================================================
(function () {
if ((location.pathname.split("/").pop() || "index.html") !== "radiology.html") return;
const pad = (n) => "#RAD-" + String(n).padStart(4, "0");
const SBADGE = {
    Pending: "text-gray-900 bg-light/60",
    Scheduled: "text-warning bg-warning/10",
    "In Progress": "text-purple bg-purple/10",
    Reported: "text-success bg-success/10",
};
const PBADGE = {
    Routine: "text-primary bg-primary/10",
    Urgent: "text-warning bg-warning/10",
    STAT: "text-danger bg-danger/10",
};
let data = [
    {
        id: 1,
        patient: "James Morrison",
        ref: "Dr. Sarah Chen",
        mod: "X-Ray",
        body: "Chest",
        date: "2024-12-10",
        priority: "Routine",
        status: "Reported",
        radio: "Dr. Patel",
        notes: "Possible pneumonia",
    },
    {
        id: 2,
        patient: "Robert Clark",
        ref: "Dr. Alice Mills",
        mod: "CT Scan",
        body: "Abdomen",
        date: "2024-12-10",
        priority: "Urgent",
        status: "Reported",
        radio: "Dr. Patel",
        notes: "Post-operative",
    },
    {
        id: 3,
        patient: "Sarah Adams",
        ref: "Dr. Raj Kumar",
        mod: "MRI",
        body: "Brain",
        date: "2024-12-11",
        priority: "Routine",
        status: "Scheduled",
        radio: "",
        notes: "Headache investigation",
    },
    {
        id: 4,
        patient: "David Torres",
        ref: "Dr. Felix Osei",
        mod: "X-Ray",
        body: "Left Knee",
        date: "2024-12-11",
        priority: "Routine",
        status: "Reported",
        radio: "Dr. Patel",
        notes: "",
    },
    {
        id: 5,
        patient: "Helen Yu",
        ref: "Dr. Raj Kumar",
        mod: "MRI",
        body: "Spine",
        date: "2024-12-12",
        priority: "Urgent",
        status: "In Progress",
        radio: "Dr. Patel",
        notes: "Acute stroke",
    },
    {
        id: 6,
        patient: "Linda Nguyen",
        ref: "Dr. Li Wang",
        mod: "PET Scan",
        body: "Full Body",
        date: "2024-12-13",
        priority: "Routine",
        status: "Pending",
        radio: "",
        notes: "Oncology staging",
    },
    {
        id: 7,
        patient: "Anna Peterson",
        ref: "Dr. James Park",
        mod: "Ultrasound",
        body: "Abdomen",
        date: "2024-12-10",
        priority: "STAT",
        status: "Reported",
        radio: "Dr. Patel",
        notes: "",
    },
    {
        id: 8,
        patient: "Mark Davis",
        ref: "Dr. Tom Rivas",
        mod: "X-Ray",
        body: "Right Hip",
        date: "2024-12-10",
        priority: "Urgent",
        status: "Reported",
        radio: "Dr. Patel",
        notes: "Suspected fracture",
    },
];
let nextId = 9,
    editingId = null;
function detailUrl(r) {
    return "radiology-order-detail.html?id=" + r.id + "&patient=" + encodeURIComponent(r.patient) + "&ref=" + encodeURIComponent(r.ref) +
        "&mod=" + encodeURIComponent(r.mod) + "&body=" + encodeURIComponent(r.body) + "&date=" + encodeURIComponent(r.date) +
        "&priority=" + encodeURIComponent(r.priority) + "&status=" + encodeURIComponent(r.status) + "&radio=" + encodeURIComponent(r.radio || "") +
        "&notes=" + encodeURIComponent(r.notes || "");
}
function rowHTML(r) {
    return `<tr data-row-id="${r.id}"><td class="text-primary font-mono text-sm"><a href="${detailUrl(r)}">${pad(r.id)}</a></td><td class="font-medium text-gray-900">${r.patient}</td><td><span class="inline-block px-2 py-1 text-xs font-semibold rounded-lg whitespace-nowrap text-purple bg-purple/10">${r.mod}</span></td><td class="text-gray-600 dark:text-gray-300">${r.body}</td><td class="text-gray-500 dark:text-gray-400 text-sm">${r.ref}</td><td class="text-gray-500 dark:text-gray-400 text-sm">${r.date}</td><td><span class="inline-block px-2 py-1 text-xs font-semibold rounded-lg whitespace-nowrap ${PBADGE[r.priority] || "text-gray-900 bg-light/60"}">${r.priority}</span></td><td><span class="inline-block px-2 py-1 text-xs font-semibold rounded-lg whitespace-nowrap ${SBADGE[r.status] || "text-gray-900 bg-light/60"}">${r.status}</span></td><td><div class="flex gap-1"><button onclick="openEdit(${r.id})" class="p-1.5 size-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400" title="Edit"><i class="icon-edit text-base"></i></button><button onclick="deleteRecord(${r.id},'${r.patient}')" class="p-1.5 size-7 flex items-center justify-center rounded hover:bg-danger/20 dark:hover:bg-red-900/20 text-danger" title="Delete"><i class="icon-trash-2 text-base"></i></button></div></td></tr>`;
}
function updateStats() {
    document.getElementById("stat-total").textContent = data.length;
    document.getElementById("stat-pend").textContent = data.filter((r) =>
        ["Pending", "Scheduled"].includes(r.status),
    ).length;
    document.getElementById("stat-proc").textContent = data.filter(
        (r) => r.status === "In Progress",
    ).length;
    document.getElementById("stat-done").textContent = data.filter(
        (r) => r.status === "Reported",
    ).length;
}
function render(q = "", mod = "", status = "") {
    const tbody = document.getElementById("tbody");
    const matches = data.filter((r) => {
        const m = q
            ? r.patient.toLowerCase().includes(q.toLowerCase()) ||
              r.mod.toLowerCase().includes(q.toLowerCase()) ||
              r.body.toLowerCase().includes(q.toLowerCase())
            : true;
        return (
            m &&
            (mod ? r.mod === mod : true) &&
            (status ? r.status === status : true)
        );
    });
    const visible = new Set(matches.map((r) => r.id));
    let anyVisible = false;
    tbody.querySelectorAll("[data-row-id]").forEach((tr) => {
        const isVisible = visible.has(Number(tr.dataset.rowId));
        tr.classList.toggle("hidden", !isVisible);
        if (isVisible) anyVisible = true;
    });
    let empty = tbody.querySelector("#no-scans-row");
    if (!anyVisible) {
        if (!empty) {
            tbody.insertAdjacentHTML(
                "beforeend",
                `<tr id="no-scans-row"><td colspan="9" class="text-center py-10 text-gray-400">No scans found</td></tr>`,
            );
        }
    } else if (empty) {
        empty.remove();
    }
    document.getElementById("count").textContent =
        `${matches.length} of ${data.length}`;
    updateStats();
}
function openAdd() {
    editingId = null;
    document.getElementById("m-title").textContent = "New Imaging Request";
    document.getElementById("btn-save").textContent = "Create Request";
    document.getElementById("m-form").reset();
    document.getElementById("f-date").value = new Date()
        .toISOString()
        .split("T")[0];
    MC.openModal("form-modal");
}
function openEdit(id) {
    const r = data.find((x) => x.id === id);
    editingId = id;
    document.getElementById("m-title").textContent = "Edit Request";
    document.getElementById("btn-save").textContent = "Update";
    document.getElementById("f-patient").value = r.patient;
    document.getElementById("f-ref").value = r.ref;
    document.getElementById("f-mod").value = r.mod;
    document.getElementById("f-body").value = r.body;
    document.getElementById("f-date").value = r.date;
    document.getElementById("f-priority").value = r.priority;
    document.getElementById("f-status").value = r.status;
    document.getElementById("f-radio").value = r.radio;
    document.getElementById("f-notes").value = r.notes;
    MC.openModal("form-modal");
}
function saveRecord() {
    const patient = document.getElementById("f-patient").value.trim();
    if (!patient) {
        MC.toast("Patient name required", "error");
        return;
    }
    const rec = {
        patient,
        ref: document.getElementById("f-ref").value.trim(),
        mod: document.getElementById("f-mod").value,
        body: document.getElementById("f-body").value.trim(),
        date: document.getElementById("f-date").value,
        priority: document.getElementById("f-priority").value,
        status: document.getElementById("f-status").value,
        radio: document.getElementById("f-radio").value.trim(),
        notes: document.getElementById("f-notes").value.trim(),
    };
    if (editingId) {
        const idx = data.findIndex((x) => x.id === editingId);
        data[idx] = { ...data[idx], ...rec };
        const existingEl = document
            .getElementById("tbody")
            .querySelector(`[data-row-id="${editingId}"]`);
        if (existingEl) existingEl.outerHTML = rowHTML(data[idx]);
        MC.toast("Request updated", "success");
    } else {
        const newRecord = { id: nextId++, ...rec };
        data.push(newRecord);
        document
            .getElementById("tbody")
            .insertAdjacentHTML("beforeend", rowHTML(newRecord));
        MC.toast("Imaging request created", "success");
    }
    MC.closeModal("form-modal");
    render(
        document.getElementById("search").value,
        document.getElementById("filter-mod").value,
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
            document.getElementById("filter-mod").value,
            document.getElementById("filter-status").value,
        );
        MC.toast("Request deleted", "success");
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
                document.getElementById("filter-mod").value,
                document.getElementById("filter-status").value,
            ),
        );
    document
        .getElementById("filter-mod")
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
                document.getElementById("filter-mod").value,
                e.target.value,
            ),
        );
    MC.initDeleteModal();
    MC.closeOnBackdrop("form-modal");
    MC.closeOnBackdrop("del-modal");
    updateStats();
});

})();
// ==========================================================================
// sample-detail.js
// ==========================================================================
document.addEventListener("DOMContentLoaded", function () {
  if (document.body.dataset.page !== "sample-detail") return;

  var $ = function (id) { return document.getElementById(id); };
  var params = new URLSearchParams(window.location.search);
  var pick = function (key, fallback) { var v = params.get(key); return v && v.length ? v : fallback; };

  var from = pick("from", "collection"); // "collection" | "tracking"
  var isTracking = from === "tracking";

  var r = {
    id: pick("id", "1"),
    patient: pick("patient", "Emily Johnson"),
    test: pick("test", "Complete Blood Count (CBC w/ Diff)"),
    collectedBy: pick("collectedBy", isTracking ? "—" : "Nurse Alicia Brown"),
    time: pick("time", isTracking ? "—" : "09:30 AM"),
    sampleType: pick("sampleType", isTracking ? "—" : "Whole Blood (EDTA)"),
    status: pick("status", "Received"),
    stage: pick("stage", "Reported"),
    updated: pick("updated", "2024-12-02 09:45 AM"),
    from: from,
  };

  var stagePresent = !!(params.get("stage") && params.get("stage").length);

  var BADGE_STAGE = {
    Collection: "text-gray-600 bg-gray-100",
    Transit: "text-warning bg-warning/10",
    Lab: "text-primary bg-primary/10",
    Testing: "text-purple bg-purple/10",
    Reported: "text-success bg-success/10",
  };
  var BADGE_STATUS = {
    Collected: "text-primary bg-primary/10",
    "In Transit": "text-warning bg-warning/10",
    Received: "text-success bg-success/10",
  };
  var TONE = {
    Collection: "#94a3b8", Transit: "#f59e0b", Lab: "#6366f1", Testing: "#8b5cf6", Reported: "#10b981",
    Collected: "#6366f1", "In Transit": "#f59e0b", Received: "#10b981",
  };

  var currentLabel = stagePresent ? r.stage : r.status;
  var badgeCls = stagePresent
    ? (BADGE_STAGE[r.stage] || "text-gray-600 bg-gray-100")
    : (BADGE_STATUS[r.status] || "text-gray-600 bg-gray-100");

  var sampleId = "#SMP-" + String(r.id).padStart(5, "0");
  var lastUpdated = r.updated || r.time || "—";

  // ---- Hero Elements ----
  if ($("smd-patient-name")) $("smd-patient-name").textContent = r.patient;
  if ($("smd-status-text")) $("smd-status-text").textContent = currentLabel;
  if ($("smd-status-badge")) $("smd-status-badge").className = "smd-hbadge " + badgeCls;
  if ($("smd-status-dot")) $("smd-status-dot").style.background = TONE[currentLabel] || "#94a3b8";
  if ($("smd-sample-id")) $("smd-sample-id").textContent = sampleId;
  if ($("smd-test-name")) $("smd-test-name").textContent = r.test;
  if ($("smd-updated")) $("smd-updated").textContent = lastUpdated;
  if ($("smd-back-btn")) $("smd-back-btn").href = isTracking ? "sample-tracking.html" : "sample-collection.html";

  // ---- Stat Cards ----
  if ($("smd-sample-type")) $("smd-sample-type").textContent = r.sampleType || "—";
  if ($("smd-test-value")) $("smd-test-value").textContent = r.test;
  if ($("smd-collected-by")) $("smd-collected-by").textContent = r.collectedBy || "—";
  if ($("smd-time")) $("smd-time").textContent = r.time || "—";

  // ---- Sample Information Card ----
  if ($("smd-info-sample-type")) $("smd-info-sample-type").textContent = r.sampleType || "—";
  if ($("smd-info-collected-by")) $("smd-info-collected-by").textContent = r.collectedBy || "—";
  if ($("smd-info-time")) $("smd-info-time").textContent = r.time || "—";
  if ($("smd-info-state")) $("smd-info-state").textContent = currentLabel;

  // ---- Sidebar Elements ----
  if ($("smd-side-sample-id")) $("smd-side-sample-id").textContent = sampleId;
  if ($("smd-side-test")) $("smd-side-test").textContent = r.test;
  if ($("smd-side-patient")) $("smd-side-patient").textContent = r.patient;
  if ($("smd-kv-patient")) $("smd-kv-patient").textContent = r.patient;
  if ($("smd-kv-test")) $("smd-kv-test").textContent = r.test;
  if ($("smd-kv-sampleid")) $("smd-kv-sampleid").textContent = sampleId;
  if ($("smd-kv-updated")) $("smd-kv-updated").textContent = lastUpdated;
  if ($("smd-all-samples-link")) $("smd-all-samples-link").href = isTracking ? "sample-tracking.html" : "sample-collection.html";

  document.title = r.patient + " — " + sampleId + " — Dreams HMS";

  // ---- CBC PARAMETERS TABLE ----
  // Static: #smd-cbc-results-table now ships pre-rendered in the HTML
  // (the parameters array never varies with the query string).

  // ---- Workflow Timeline ----
  var STAGES = ["Collection", "Transit", "Lab Accessioning", "Automated Testing", "Pathologist Verified"];
  var STAGE_ICON = ["icon-clipboard-list", "icon-truck", "icon-flask-conical", "icon-microscope", "icon-file-check"];
  var STAGE_DESC = [
    "Collected by " + r.collectedBy + " (EDTA Tube)",
    "Transported via Temp-Controlled Biohazard Carrier (4°C)",
    "Received & Scanned by Lab Tech (Accession Rack B-14)",
    "Processed on Sysmex XN-9000 Hematology Analyzer",
    "Verified & Electronically Signed by Dr. Marcus Vance, MD"
  ];

  var reachedIndex;
  if (stagePresent) {
    reachedIndex = STAGES.indexOf(r.stage);
    if (reachedIndex < 0) reachedIndex = 0;
  } else {
    var STATUS_INDEX = { Collected: 0, "In Transit": 1, Received: 4 };
    reachedIndex = STATUS_INDEX[r.status];
    if (reachedIndex == null) reachedIndex = 4;
  }

  if ($("smd-timeline")) {
    $("smd-timeline").innerHTML = STAGES.map(function (label, i) {
      var state = i < reachedIndex ? "done" : i === reachedIndex ? "current" : "";
      var when = i <= reachedIndex ? lastUpdated : "Scheduled";
      return '<div class="smd-tl-item ' + state + '"><span class="smd-tl-node"><i class="' + STAGE_ICON[i] + '"></i></span>' +
        '<div class="flex items-center justify-between">' +
          '<p class="text-sm font-bold text-gray-900 dark:text-white">' + label + '</p>' +
          '<span class="text-[11px] font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded">' + when + '</span>' +
        '</div>' +
        '<p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">' + STAGE_DESC[i] + '</p></div>';
    }).join("");
  }

  // ---- Event Handlers ----
  document.querySelectorAll('[data-action="print"]').forEach(function (btn) {
    btn.addEventListener("click", function () {
      window.print();
    });
  });

  if ($("smd-export-btn")) {
    $("smd-export-btn").addEventListener("click", function () {
      alert("Exporting Laboratory Report for " + sampleId + " as PDF...");
    });
  }

  if ($("smd-rerun-btn")) {
    $("smd-rerun-btn").addEventListener("click", function () {
      if (confirm("Request automated re-run / repeat analysis for sample " + sampleId + "?")) {
        alert("Re-run order #RR-" + Math.floor(Math.random() * 90000 + 10000) + " dispatched to Sysmex XN-9000 analyzer.");
      }
    });
  }
});

// ==========================================================================
// scan-request-detail.js
// ==========================================================================
// ---- Scan Request Detail -----------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
  if (document.body.dataset.page !== "scan-request-detail") return;

  var $ = function (id) { return document.getElementById(id); };
  var params = new URLSearchParams(window.location.search);
  var pick = function (key, fallback) { var v = params.get(key); return v && v.length ? v : fallback; };

  var r = {
    id: pick("id", "1"),
    patient: pick("patient", "Anna Peterson"),
    doctor: pick("doctor", "Dr. Sarah Lee"),
    modality: pick("modality", "X-Ray"),
    priority: pick("priority", "Routine"),
    date: pick("date", "2024-12-02"),
    status: pick("status", "Completed"),
  };

  var PBADGE = {
    Routine: "text-primary bg-primary/10",
    Urgent: "text-warning bg-warning/10",
    STAT: "text-danger bg-danger/10",
  };
  var SBADGE = {
    Pending: "text-warning bg-warning/10",
    Scheduled: "text-primary bg-primary/10",
    Completed: "text-success bg-success/10",
  };
  var STATUS_TONE = { Pending: "#F59E0B", Scheduled: "#0371c6", Completed: "#009966" };

  var scanId = "#SCR-" + String(r.id).padStart(5, "0");

  $("srd-patient-name").textContent = r.patient;
  $("srd-status-badge").textContent = r.status;
  $("srd-priority-badge").textContent = r.priority;
  $("srd-scan-id").textContent = scanId;
  $("srd-modality").textContent = r.modality;
  $("srd-doctor-name").textContent = r.doctor;
  $("srd-date").textContent = r.date;
  $("srd-modality-stat").textContent = r.modality;
  $("srd-doctor-stat").textContent = r.doctor;
  $("srd-priority-stat").textContent = r.priority;
  $("srd-requested-date").textContent = r.date;
  $("srd-side-patient").textContent = r.patient;
  $("srd-side-modality").textContent = r.modality + " Scan";
  $("srd-kv-patient").textContent = r.patient;
  $("srd-kv-doctor").textContent = r.doctor;
  $("srd-kv-modality").textContent = r.modality;
  $("srd-kv-date").textContent = r.date;
  document.title = r.patient + " — " + scanId + " — Dreams HMS";

  // Status badge (with pulsing dot) on the hero
  var statusBadgeCls = SBADGE[r.status] || "text-gray-600 bg-gray-100";
  var statusBadgeEl = $("srd-status-badge");
  statusBadgeCls.split(" ").forEach(function (c) { statusBadgeEl.classList.add(c); });
  var dot = statusBadgeEl.previousElementSibling;
  if (dot) dot.style.background = STATUS_TONE[r.status] || "#94a3b8";

  // Priority badge on the hero
  var priorityBadgeCls = PBADGE[r.priority] || "text-gray-600 bg-gray-100";
  var priorityBadgeEl = $("srd-priority-badge");
  priorityBadgeCls.split(" ").forEach(function (c) { priorityBadgeEl.classList.add(c); });

  // ---- Workflow timeline ----
  var STAGES = ["Pending", "Scheduled", "Completed"];
  var STAGE_ICON = ["icon-clipboard-list", "icon-calendar", "icon-check-circle"];
  var reachedIndex = STAGES.indexOf(r.status);
  reachedIndex = reachedIndex === -1 ? 0 : reachedIndex;

  $("srd-timeline").innerHTML = STAGES.map(function (label, i) {
    var state = i < reachedIndex ? "done" : i === reachedIndex ? "current" : "";
    var when = i <= reachedIndex ? r.date : "Pending";
    return '<div class="srd-tl-item ' + state + '"><span class="srd-tl-node"><i class="' + STAGE_ICON[i] + '"></i></span>' +
      '<p class="text-sm font-bold text-gray-900 dark:text-white">' + label + '</p>' +
      '<p class="text-xs text-gray-500 dark:text-gray-400">' + when + '</p></div>';
  }).join("");
});
// ==========================================================================
// trauma-cases.js
// ==========================================================================
// Dreams HMS — Trauma Command Center
// Flagship trauma operations board: hero status rail, ring-gauge KPI widgets,
// overview analytics, kanban priority board, enterprise case registry and a
// slide-over case drawer. Static demo data only — no API, no backend.
(function () {
    "use strict";
    if ((location.pathname.split("/").pop() || "index.html") !== "trauma-cases.html") return;

    const $ = (id) => document.getElementById(id);

    function esc(v) {
        return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
        });
    }

    function initials(name) {
        return name
            .replace(/^(Dr|Mr|Mrs|Ms)\.?\s+/i, "")
            .split(/\s+/)
            .slice(0, 2)
            .map((p) => p.charAt(0).toUpperCase())
            .join("");
    }

    /* ====================================================================
       Data
       ==================================================================== */

    // Emergency timeline stages, in clinical order.
    const STAGES = [
        { key: "arrival", label: "Arrival", icon: "icon-ambulance" },
        { key: "assessment", label: "Assessment", icon: "icon-stethoscope" },
        { key: "ct", label: "CT Scan", icon: "icon-scan" },
        { key: "blood", label: "Blood Test", icon: "icon-droplet" },
        { key: "surgery", label: "Surgery", icon: "icon-scissors" },
        { key: "recovery", label: "Recovery", icon: "icon-heart-pulse" },
        { key: "icu", label: "ICU", icon: "icon-bed" },
        { key: "discharge", label: "Discharge", icon: "icon-check" },
    ];

    const SEVERITY = {
        Critical: { tone: "tone-critical", badge: "badge-red", pips: 4, color: "var(--tc-critical)" },
        Major: { tone: "tone-high", badge: "badge-amber", pips: 3, color: "var(--tc-high)" },
        Moderate: { tone: "tone-medium", badge: "badge-yellow", pips: 2, color: "var(--tc-medium)" },
        Minor: { tone: "tone-stable", badge: "badge-green", pips: 1, color: "var(--tc-stable)" },
    };

    const PRIORITY = {
        Critical: { tone: "tone-critical", label: "Critical" },
        High: { tone: "tone-high", label: "High" },
        Medium: { tone: "tone-medium", label: "Medium" },
        Stable: { tone: "tone-stable", label: "Stable" },
    };

    const STATUS_BADGE = {
        "In Resus": "badge-red",
        "In CT": "badge-purple",
        "In OR": "badge-amber",
        "ICU Admit": "badge-blue",
        Observation: "badge-green",
        Discharged: "badge-gray",
    };

    const CASES = [
        {
            id: "TR-2026-0418", name: "Unknown Male", age: 40, gender: "Male", blood: "O−",
            type: "MVC — Restrained Driver", severity: "Critical", priority: "Critical",
            regions: ["chest", "abdomen", "legL"], region: "Chest, Abdomen, Left Leg",
            team: "Alpha", doctor: "Dr. Thomas Rivas", location: "OR 3", status: "In OR",
            arrival: "09:12 AM", since: 38, iss: 34, stage: 4, mtp: true,
            vitals: { hr: 138, bp: "82/48", spo2: 90, rr: 28, temp: 96.4, gcs: 8 },
            injuries: [
                { region: "Abdomen", text: "Grade IV splenic laceration", sev: "Critical" },
                { region: "Chest", text: "Left hemothorax, 3 rib fractures", sev: "Critical" },
                { region: "Left Leg", text: "Mid-shaft femur fracture", sev: "Major" },
            ],
            labs: [
                { name: "Hemoglobin", value: "7.2 g/dL", flag: "low" },
                { name: "Lactate", value: "4.8 mmol/L", flag: "high" },
                { name: "Base Deficit", value: "−8.1", flag: "high" },
                { name: "INR", value: "1.6", flag: "high" },
                { name: "Platelets", value: "142 K/µL", flag: "low" },
            ],
            radiology: [
                { name: "FAST — bedside", result: "Positive, free fluid RUQ", status: "Complete" },
                { name: "CT Pan-Scan", result: "Splenic laceration, hemothorax", status: "Complete" },
                { name: "Chest X-Ray", result: "Confirms tube placement", status: "Complete" },
            ],
            meds: [
                { name: "Tranexamic Acid", dose: "1 g IV bolus", time: "09:18 AM" },
                { name: "Packed RBC", dose: "4 units — MTP", time: "09:22 AM" },
                { name: "Fentanyl", dose: "100 mcg IV", time: "09:26 AM" },
            ],
            notes: [
                { who: "Dr. Thomas Rivas", role: "Trauma Lead", time: "09:48 AM", text: "FAST positive with persistent hypotension despite 2 units. To OR for exploratory laparotomy. Anticipate splenectomy." },
                { who: "Kendra Vasquez, RN", role: "Trauma Nurse", time: "09:22 AM", text: "MTP initiated, 4 units O-neg hung. Two large-bore IVs sited. Patient remains unresponsive, GCS 8." },
            ],
            timeline: [
                { stage: "arrival", time: "09:12 AM", text: "EMS arrival, Level 1 activation, Resus Bay 1" },
                { stage: "assessment", time: "09:16 AM", text: "Primary survey, FAST positive, MTP initiated" },
                { stage: "ct", time: "09:31 AM", text: "CT pan-scan — splenic laceration confirmed" },
                { stage: "blood", time: "09:22 AM", text: "Type and cross, 4 units transfused" },
                { stage: "surgery", time: "09:48 AM", text: "To OR 3 — exploratory laparotomy in progress" },
            ],
        },
        {
            id: "TR-2026-0417", name: "Deshawn Pritchard", age: 23, gender: "Male", blood: "A+",
            type: "GSW — Abdomen", severity: "Critical", priority: "Critical",
            regions: ["abdomen"], region: "Abdomen",
            team: "Bravo", doctor: "Dr. Marissa Bloom", location: "Resus Bay 2", status: "In Resus",
            arrival: "09:29 AM", since: 21, iss: 27, stage: 3, mtp: true,
            vitals: { hr: 124, bp: "94/58", spo2: 94, rr: 24, temp: 97.8, gcs: 14 },
            injuries: [
                { region: "Abdomen", text: "Penetrating trauma, LUQ entry wound", sev: "Critical" },
                { region: "Abdomen", text: "Suspected small bowel involvement", sev: "Major" },
            ],
            labs: [
                { name: "Hemoglobin", value: "9.8 g/dL", flag: "low" },
                { name: "Lactate", value: "3.1 mmol/L", flag: "high" },
                { name: "White Cell Count", value: "14.2 K/µL", flag: "high" },
                { name: "Type & Cross", value: "A+ — 4 units held", flag: "normal" },
            ],
            radiology: [
                { name: "FAST — bedside", result: "Positive, free fluid", status: "Complete" },
                { name: "CT Abdomen", result: "Awaiting scanner", status: "Pending" },
            ],
            meds: [
                { name: "Cefazolin", dose: "2 g IV", time: "09:34 AM" },
                { name: "Packed RBC", dose: "2 units O-neg", time: "09:33 AM" },
                { name: "Tetanus Toxoid", dose: "0.5 mL IM", time: "09:36 AM" },
            ],
            notes: [
                { who: "Dr. Marissa Bloom", role: "Trauma Surgeon", time: "09:40 AM", text: "FAST positive. Haemodynamically borderline but responding to blood. OR notified, likely laparotomy within the hour." },
            ],
            timeline: [
                { stage: "arrival", time: "09:29 AM", text: "EMS arrival, Level 1 activation, Resus Bay 2" },
                { stage: "assessment", time: "09:33 AM", text: "Primary survey, two large-bore IVs, O-neg started" },
                { stage: "blood", time: "09:36 AM", text: "Type and cross complete — A+, 4 units held" },
            ],
        },
        {
            id: "TR-2026-0416", name: "Emmett Sandoval", age: 74, gender: "Male", blood: "B+",
            type: "Fall — Ground Level", severity: "Major", priority: "High",
            regions: ["head", "pelvis"], region: "Head, Pelvis",
            team: "Charlie", doctor: "Dr. Yusuf Karim", location: "CT Suite", status: "In CT",
            arrival: "09:30 AM", since: 20, iss: 17, stage: 2, mtp: false,
            vitals: { hr: 92, bp: "148/82", spo2: 96, rr: 18, temp: 98.1, gcs: 15 },
            injuries: [
                { region: "Pelvis", text: "Right femoral neck fracture", sev: "Major" },
                { region: "Head", text: "Occipital strike, on warfarin — bleed risk", sev: "Major" },
            ],
            labs: [
                { name: "INR", value: "3.4", flag: "high" },
                { name: "Hemoglobin", value: "11.9 g/dL", flag: "low" },
                { name: "Creatinine", value: "1.3 mg/dL", flag: "normal" },
                { name: "Platelets", value: "198 K/µL", flag: "normal" },
            ],
            radiology: [
                { name: "CT Head", result: "In progress", status: "In Progress" },
                { name: "Pelvis X-Ray", result: "Femoral neck fracture", status: "Complete" },
            ],
            meds: [
                { name: "Vitamin K", dose: "10 mg IV", time: "09:37 AM" },
                { name: "Prothrombin Complex", dose: "2000 units IV", time: "09:39 AM" },
                { name: "Morphine", dose: "4 mg IV", time: "09:35 AM" },
            ],
            notes: [
                { who: "Dr. Yusuf Karim", role: "Emergency Physician", time: "09:37 AM", text: "INR 3.4 on warfarin with head strike. Reversal started before CT. Orthopaedics aware of hip fracture, will review post-scan." },
            ],
            timeline: [
                { stage: "arrival", time: "09:30 AM", text: "EMS arrival, Level 2 activation, Resus Bay 3" },
                { stage: "assessment", time: "09:35 AM", text: "Secondary survey, reversal agent ordered" },
                { stage: "ct", time: "09:44 AM", text: "To CT — head and pelvis" },
            ],
        },
        {
            id: "TR-2026-0415", name: "Camila Restrepo", age: 31, gender: "Female", blood: "O+",
            type: "Pedestrian Struck", severity: "Major", priority: "High",
            regions: ["chest", "legR"], region: "Chest, Right Leg",
            team: "Bravo", doctor: "Dr. Marissa Bloom", location: "Surgical ICU", status: "ICU Admit",
            arrival: "08:41 AM", since: 69, iss: 14, stage: 6, mtp: false,
            vitals: { hr: 96, bp: "118/72", spo2: 97, rr: 20, temp: 98.4, gcs: 14 },
            injuries: [
                { region: "Right Leg", text: "Tibial plateau fracture", sev: "Major" },
                { region: "Chest", text: "Right pulmonary contusion", sev: "Moderate" },
            ],
            labs: [
                { name: "Hemoglobin", value: "12.4 g/dL", flag: "normal" },
                { name: "Lactate", value: "1.8 mmol/L", flag: "normal" },
                { name: "Troponin", value: "0.02 ng/mL", flag: "normal" },
            ],
            radiology: [
                { name: "CT Chest", result: "Pulmonary contusion, no pneumothorax", status: "Complete" },
                { name: "CT Tib-Fib", result: "Displaced plateau fracture", status: "Complete" },
            ],
            meds: [
                { name: "Ketorolac", dose: "30 mg IV", time: "08:58 AM" },
                { name: "Cefazolin", dose: "2 g IV", time: "09:02 AM" },
            ],
            notes: [
                { who: "Dr. Marissa Bloom", role: "Trauma Surgeon", time: "09:25 AM", text: "Stable for ICU admission for respiratory monitoring. Orthopaedics to fix plateau fracture on tomorrow's list." },
            ],
            timeline: [
                { stage: "arrival", time: "08:41 AM", text: "EMS arrival, Level 2 activation, Resus Bay 4" },
                { stage: "assessment", time: "08:47 AM", text: "Primary and secondary survey complete" },
                { stage: "ct", time: "08:52 AM", text: "CT complete — contusion confirmed" },
                { stage: "blood", time: "08:55 AM", text: "Bloods unremarkable, no transfusion" },
                { stage: "recovery", time: "09:10 AM", text: "Stabilised in resus, respiratory monitoring" },
                { stage: "icu", time: "09:25 AM", text: "Admitted to Surgical ICU 204" },
            ],
        },
        {
            id: "TR-2026-0414", name: "Roland Beckett", age: 46, gender: "Male", blood: "AB+",
            type: "Assault — Blunt", severity: "Moderate", priority: "Medium",
            regions: ["head"], region: "Head, Face",
            team: "Charlie", doctor: "Dr. Yusuf Karim", location: "Observation", status: "Observation",
            arrival: "08:14 AM", since: 96, iss: 9, stage: 5, mtp: false,
            vitals: { hr: 82, bp: "132/84", spo2: 99, rr: 16, temp: 98.6, gcs: 15 },
            injuries: [
                { region: "Head", text: "Nasal bone fracture, displaced", sev: "Moderate" },
                { region: "Head", text: "Left zygomatic arch fracture", sev: "Moderate" },
            ],
            labs: [
                { name: "Hemoglobin", value: "14.1 g/dL", flag: "normal" },
                { name: "Ethanol", value: "0.14 g/dL", flag: "high" },
            ],
            radiology: [{ name: "CT Maxillofacial", result: "Nasal and zygomatic fractures", status: "Complete" }],
            meds: [{ name: "Ibuprofen", dose: "600 mg PO", time: "08:40 AM" }],
            notes: [
                { who: "Dr. Yusuf Karim", role: "Emergency Physician", time: "09:02 AM", text: "Neurologically intact, GCS 15 throughout. To observation pending ENT review for nasal reduction." },
            ],
            timeline: [
                { stage: "arrival", time: "08:14 AM", text: "Walk-in, trauma consult requested" },
                { stage: "assessment", time: "08:22 AM", text: "Secondary survey, GCS 15" },
                { stage: "ct", time: "08:29 AM", text: "Maxillofacial CT complete" },
                { stage: "blood", time: "08:34 AM", text: "Routine bloods, ethanol elevated" },
                { stage: "recovery", time: "09:02 AM", text: "To observation pending ENT" },
            ],
        },
        {
            id: "TR-2026-0413", name: "Harriet Nakashima", age: 59, gender: "Female", blood: "A−",
            type: "MVC — Unrestrained", severity: "Major", priority: "High",
            regions: ["chest", "abdomen"], region: "Chest, Abdomen",
            team: "Alpha", doctor: "Dr. Thomas Rivas", location: "OR 5", status: "In OR",
            arrival: "07:52 AM", since: 118, iss: 21, stage: 4, mtp: false,
            vitals: { hr: 110, bp: "106/64", spo2: 93, rr: 26, temp: 97.2, gcs: 13 },
            injuries: [
                { region: "Chest", text: "Rib fractures 4–8, flail segment", sev: "Critical" },
                { region: "Abdomen", text: "Grade II liver laceration", sev: "Major" },
            ],
            labs: [
                { name: "Hemoglobin", value: "10.6 g/dL", flag: "low" },
                { name: "Lactate", value: "2.6 mmol/L", flag: "high" },
                { name: "AST", value: "180 U/L", flag: "high" },
            ],
            radiology: [
                { name: "CT Chest/Abdo", result: "Flail chest, liver laceration", status: "Complete" },
                { name: "Chest X-Ray", result: "Post chest-tube, lung re-expanded", status: "Complete" },
            ],
            meds: [
                { name: "Fentanyl", dose: "75 mcg IV", time: "08:02 AM" },
                { name: "Cefazolin", dose: "2 g IV", time: "08:40 AM" },
            ],
            notes: [
                { who: "Dr. Thomas Rivas", role: "Trauma Lead", time: "08:44 AM", text: "Flail segment with poor respiratory mechanics. To OR 5 for rib fixation. Liver laceration managed non-operatively." },
            ],
            timeline: [
                { stage: "arrival", time: "07:52 AM", text: "EMS arrival, Level 2 activation, Resus Bay 6" },
                { stage: "assessment", time: "07:58 AM", text: "Primary survey, flail segment identified" },
                { stage: "ct", time: "08:20 AM", text: "CT chest/abdomen complete" },
                { stage: "blood", time: "08:12 AM", text: "Bloods sent, no transfusion required" },
                { stage: "surgery", time: "08:44 AM", text: "To OR 5 — rib fixation in progress" },
            ],
        },
        {
            id: "TR-2026-0412", name: "Priya Raghunathan", age: 28, gender: "Female", blood: "B−",
            type: "Fall — From Height", severity: "Minor", priority: "Stable",
            regions: ["armR"], region: "Right Arm",
            team: "Charlie", doctor: "Dr. Yusuf Karim", location: "Observation", status: "Observation",
            arrival: "07:31 AM", since: 139, iss: 5, stage: 5, mtp: false,
            vitals: { hr: 74, bp: "116/70", spo2: 100, rr: 14, temp: 98.2, gcs: 15 },
            injuries: [{ region: "Right Arm", text: "Distal radius fracture, closed", sev: "Minor" }],
            labs: [{ name: "Hemoglobin", value: "13.2 g/dL", flag: "normal" }],
            radiology: [{ name: "Wrist X-Ray", result: "Colles fracture, minimally displaced", status: "Complete" }],
            meds: [{ name: "Acetaminophen", dose: "1 g PO", time: "07:50 AM" }],
            notes: [
                { who: "Dr. Yusuf Karim", role: "Emergency Physician", time: "08:15 AM", text: "Closed reduction and cast applied. Neurovascularly intact. For fracture clinic follow-up in one week." },
            ],
            timeline: [
                { stage: "arrival", time: "07:31 AM", text: "Walk-in after fall from ladder" },
                { stage: "assessment", time: "07:40 AM", text: "Focused exam, neurovascularly intact" },
                { stage: "ct", time: "07:48 AM", text: "Wrist X-Ray — Colles fracture" },
                { stage: "blood", time: "07:52 AM", text: "Routine bloods, unremarkable" },
                { stage: "recovery", time: "08:15 AM", text: "Cast applied, to observation" },
            ],
        },
        {
            id: "TR-2026-0411", name: "Curtis Mbeki", age: 52, gender: "Male", blood: "O+",
            type: "Industrial — Crush", severity: "Moderate", priority: "Medium",
            regions: ["armL"], region: "Left Arm, Hand",
            team: "Bravo", doctor: "Dr. Marissa Bloom", location: "Resus Bay 1", status: "In Resus",
            arrival: "09:04 AM", since: 46, iss: 11, stage: 3, mtp: false,
            vitals: { hr: 88, bp: "128/78", spo2: 98, rr: 18, temp: 98.0, gcs: 15 },
            injuries: [
                { region: "Left Arm", text: "Crush injury, forearm compartment risk", sev: "Major" },
                { region: "Left Arm", text: "2nd–3rd metacarpal fractures", sev: "Moderate" },
            ],
            labs: [
                { name: "Creatine Kinase", value: "2400 U/L", flag: "high" },
                { name: "Potassium", value: "5.1 mmol/L", flag: "high" },
                { name: "Creatinine", value: "1.1 mg/dL", flag: "normal" },
            ],
            radiology: [{ name: "Forearm X-Ray", result: "Metacarpal fractures, no radius involvement", status: "Complete" }],
            meds: [
                { name: "Normal Saline", dose: "1 L IV bolus", time: "09:10 AM" },
                { name: "Morphine", dose: "5 mg IV", time: "09:08 AM" },
            ],
            notes: [
                { who: "Dr. Marissa Bloom", role: "Trauma Surgeon", time: "09:20 AM", text: "CK rising, monitoring for rhabdomyolysis and compartment syndrome. Hourly neurovascular checks. Plastics consulted." },
            ],
            timeline: [
                { stage: "arrival", time: "09:04 AM", text: "EMS arrival from worksite, Level 2 activation" },
                { stage: "assessment", time: "09:08 AM", text: "Compartment checks started, analgesia given" },
                { stage: "blood", time: "09:16 AM", text: "CK 2400 — rhabdomyolysis watch" },
            ],
        },
    ];

    const TEAM = [
        { name: "Dr. Thomas Rivas", role: "Lead Surgeon", status: "In OR", tone: "tone-high", pager: "x2041" },
        { name: "Dr. Yusuf Karim", role: "Emergency Physician", status: "Available", tone: "tone-stable", pager: "x2043" },
        { name: "Kendra Vasquez, RN", role: "Trauma Nurse", status: "In Resus", tone: "tone-critical", pager: "x2045" },
        { name: "Dr. Ingrid Solberg", role: "Radiologist", status: "Available", tone: "tone-stable", pager: "x2048" },
        { name: "Dr. Simone Lattimore", role: "Anesthetist", status: "In OR", tone: "tone-high", pager: "x2044" },
        { name: "Dr. Marissa Bloom", role: "Trauma Surgeon", status: "In Resus", tone: "tone-critical", pager: "x2042" },
    ];

    const DEPARTMENTS = [
        { name: "Orthopedics", icon: "icon-bone", count: 14, tone: "tone-info" },
        { name: "General Surgery", icon: "icon-scissors", count: 11, tone: "tone-critical" },
        { name: "Neurosurgery", icon: "icon-brain", count: 7, tone: "tone-purple" },
        { name: "Thoracic", icon: "icon-heart-pulse", count: 6, tone: "tone-high" },
        { name: "Plastics", icon: "icon-hand", count: 4, tone: "tone-medium" },
        { name: "Vascular", icon: "icon-activity", count: 3, tone: "tone-stable" },
    ];

    // Admissions per 2-hour block since midnight.
    const HOURLY = [
        { label: "00", n: 3 }, { label: "02", n: 2 }, { label: "04", n: 1 },
        { label: "06", n: 4 }, { label: "08", n: 9 }, { label: "10", n: 7 },
        { label: "12", n: 6 }, { label: "14", n: 5 }, { label: "16", n: 8 },
        { label: "18", n: 11 }, { label: "20", n: 7 }, { label: "22", n: 5 },
    ];

    const LEVEL = {
        1: { label: "Level 1", name: "Full team, immediate", team: 9, blood: true },
        2: { label: "Level 2", name: "Modified team", team: 5, blood: false },
        3: { label: "Consult", name: "Trauma surgery review", team: 2, blood: false },
    };

    const BLOOD_ONEG = 4;

    /* ====================================================================
       Derived figures
       ==================================================================== */

    const open = () => CASES.filter((c) => c.status !== "Discharged");
    const countBy = (fn) => open().filter(fn).length;

    /* ====================================================================
       SVG primitives — geometry in attributes, never inline CSS
       ==================================================================== */

    // Circular progress gauge. r is chosen so the circumference is exactly
    // 100, which lets stroke-dasharray read as a percentage.
    function ring(pct) {
        const v = Math.max(0, Math.min(100, pct));
        return (
            '<svg class="tc-kpi-ring" viewBox="0 0 36 36" aria-hidden="true" focusable="false">' +
            '<circle class="tc-kpi-ring-track" cx="18" cy="18" r="15.9155" fill="none" stroke="currentColor" stroke-width="3"></circle>' +
            '<circle cx="18" cy="18" r="15.9155" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" ' +
            'stroke-dasharray="' + v + ' 100"></circle>' +
            "</svg>"
        );
    }

    function sparkline(series) {
        if (!series || series.length < 2) return "";
        const W = 64, H = 28;
        const max = Math.max.apply(null, series);
        const min = Math.min.apply(null, series);
        const span = max - min || 1;
        const step = W / (series.length - 1);
        const pts = series.map(function (v, i) {
            return (i * step).toFixed(1) + "," + (H - 2 - ((v - min) / span) * (H - 4)).toFixed(1);
        });
        return (
            '<svg class="tc-kpi-spark" viewBox="0 0 ' + W + " " + H + '" preserveAspectRatio="none" aria-hidden="true" focusable="false">' +
            '<polygon points="0,' + H + " " + pts.join(" ") + " " + W + "," + H + '" fill="currentColor" opacity="0.14"></polygon>' +
            '<polyline points="' + pts.join(" ") + '" fill="none" stroke="currentColor" stroke-width="1.5" ' +
            'stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"></polyline>' +
            "</svg>"
        );
    }

    /* ====================================================================
       Hero
       ==================================================================== */

    // Trauma level is derived, not hardcoded: the board escalates itself.
    function traumaLevel() {
        const critical = countBy((c) => c.priority === "Critical");
        if (open().length >= 12 || critical >= 4) return { cls: "is-mass", text: "Mass Casualty" };
        if (critical >= 2) return { cls: "is-high", text: "High Alert" };
        return { cls: "is-normal", text: "Normal" };
    }

    function renderHero() {
        const lv = traumaLevel();
        $("tc-level").className = "tc-level " + lv.cls;
        $("tc-level-text").textContent = lv.text;

        const rail = [
            { label: "Open Cases", value: open().length, icon: "icon-folder-open" },
            { label: "In Theatre", value: countBy((c) => c.status === "In OR"), icon: "icon-scissors" },
            { label: "Massive Transfusion", value: countBy((c) => c.mtp), icon: "icon-droplet" },
            { label: "O− Units", value: BLOOD_ONEG, icon: "icon-flask-conical" },
            { label: "Team Ready", value: TEAM.filter((t) => t.status === "Available").length + "/" + TEAM.length, icon: "icon-users" },
        ];

        $("hero-rail").innerHTML = rail
            .map(function (r) {
                return (
                    '<div class="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-md">' +
                    '<i class="' + r.icon + ' text-white/40 text-sm" aria-hidden="true"></i>' +
                    "<div>" +
                    '<dt class="text-[9px] font-bold uppercase tracking-wider text-white/40">' + esc(r.label) + "</dt>" +
                    '<dd class="text-sm font-extrabold text-white tabular-nums">' + esc(r.value) + "</dd>" +
                    "</div></div>"
                );
            })
            .join("");
    }

    /* ====================================================================
       KPI widgets
       ==================================================================== */

    function renderKpis() {
        const critical = countBy((c) => c.priority === "Critical");
        const major = countBy((c) => c.severity === "Major");
        const minor = countBy((c) => c.severity === "Minor" || c.severity === "Moderate");
        const surgery = countBy((c) => c.status === "In OR");
        const icu = countBy((c) => c.status === "ICU Admit");
        const total = open().length;

        const cards = [
            { id: "kpi-active", icon: "icon-siren", label: "Active Trauma Cases", value: total, tone: "tone-critical", pct: Math.round((total / 12) * 100), chip: "Live", chipIcon: "icon-radio", spark: [4, 5, 5, 6, 7, 6, 8] },
            { id: "kpi-critical", icon: "icon-heart-pulse", label: "Critical Patients", value: critical, tone: "tone-critical", pct: Math.round((critical / total) * 100), chip: critical >= 2 ? "Escalated" : "Steady", chipIcon: "icon-trending-up", spark: [1, 1, 2, 2, 1, 2, 2] },
            { id: "kpi-major", icon: "icon-bone", label: "Major Trauma", value: major, tone: "tone-high", pct: Math.round((major / total) * 100), chip: "ISS 16+", chipIcon: "icon-gauge", spark: [2, 3, 3, 2, 3, 3, 3] },
            { id: "kpi-minor", icon: "icon-bandage", label: "Minor Trauma", value: minor, tone: "tone-stable", pct: Math.round((minor / total) * 100), chip: "Fast Track", chipIcon: "icon-zap", spark: [4, 3, 3, 2, 3, 3, 3] },
            { id: "kpi-surgery", icon: "icon-scissors", label: "Surgery Waiting", value: surgery, tone: "tone-medium", pct: Math.round((surgery / total) * 100), chip: "2 OR open", chipIcon: "icon-door-open", spark: [1, 1, 2, 2, 2, 1, 2] },
            { id: "kpi-icu", icon: "icon-bed", label: "ICU Transfers", value: icu, tone: "tone-info", pct: Math.round((icu / total) * 100), chip: "4 beds free", chipIcon: "icon-check", spark: [0, 1, 1, 1, 2, 1, 1] },
        ];

        $("kpi-row").innerHTML = cards
            .map(function (c) {
                return (
                    '<article class="tc-kpi ' + c.tone + '">' +
                    '<div class="tc-kpi-head">' +
                    '<span class="tc-kpi-icon"><i class="' + c.icon + '" aria-hidden="true"></i></span>' +
                    '<div class="relative">' + ring(c.pct) +
                    '<span class="tc-kpi-ring-label">' + c.pct + "%</span></div>" +
                    "</div>" +
                    '<p class="tc-kpi-value" id="' + c.id + '">' + c.value + "</p>" +
                    '<p class="tc-kpi-label">' + esc(c.label) + "</p>" +
                    '<div class="tc-kpi-foot">' +
                    sparkline(c.spark) +
                    '<span class="hms-chip"><i class="' + c.chipIcon + ' text-[9px]" aria-hidden="true"></i>' + esc(c.chip) + "</span>" +
                    "</div></article>"
                );
            })
            .join("");
    }

    /* ====================================================================
       Overview — severity donut, departments, hourly chart
       ==================================================================== */

    function renderSeverity() {
        const order = ["Critical", "Major", "Moderate", "Minor"];
        const counts = order.map((s) => ({ name: s, n: countBy((c) => c.severity === s) }));
        const total = open().length;

        // Donut segments: circumference is 100, so each dasharray is a
        // percentage and each offset is the running total before it.
        let offset = 0;
        const segs = counts
            .filter((c) => c.n > 0)
            .map(function (c) {
                const pct = (c.n / total) * 100;
                const seg =
                    '<circle cx="21" cy="21" r="15.9155" fill="none" stroke="' + SEVERITY[c.name].color + '" ' +
                    'stroke-width="4.5" stroke-dasharray="' + pct.toFixed(2) + " " + (100 - pct).toFixed(2) + '" ' +
                    'stroke-dashoffset="' + (-offset).toFixed(2) + '"></circle>';
                offset += pct;
                return seg;
            })
            .join("");

        $("sev-donut").innerHTML =
            '<circle cx="21" cy="21" r="15.9155" fill="none" stroke="currentColor" stroke-width="4.5" class="text-gray-100 dark:text-slate-700"></circle>' + segs;
        $("sev-total").textContent = total;

        $("sev-legend").innerHTML = counts
            .map(function (c) {
                const pct = total ? Math.round((c.n / total) * 100) : 0;
                return (
                    '<li class="' + SEVERITY[c.name].tone + ' flex items-center gap-2.5">' +
                    '<span class="size-2.5 rounded-full shrink-0 bg-[var(--tc-accent)]" aria-hidden="true"></span>' +
                    '<span class="text-xs font-semibold text-gray-700 dark:text-gray-300 mr-auto">' + c.name + "</span>" +
                    '<span class="text-xs font-extrabold text-gray-900 tabular-nums">' + c.n + "</span>" +
                    '<span class="text-[10px] font-bold text-gray-400 tabular-nums w-8 text-right">' + pct + "%</span>" +
                    "</li>"
                );
            })
            .join("");
    }

    function renderDepartments() {
        const max = Math.max.apply(null, DEPARTMENTS.map((d) => d.count));
        $("dept-list").innerHTML = DEPARTMENTS.map(function (d) {
            const pct = Math.round((d.count / max) * 100);
            return (
                '<div class="tc-dept ' + d.tone + '">' +
                '<span class="hms-panel-icon"><i class="' + d.icon + '" aria-hidden="true"></i></span>' +
                '<div class="min-w-0 flex-1">' +
                '<div class="flex items-center gap-2">' +
                '<p class="text-xs font-bold text-gray-900 mr-auto truncate">' + esc(d.name) + "</p>" +
                '<span class="text-xs font-extrabold text-gray-900 tabular-nums">' + d.count + "</span></div>" +
                '<svg class="mt-1.5 h-1.5 w-full text-[var(--tc-accent)]" viewBox="0 0 100 6" preserveAspectRatio="none" role="img" ' +
                'aria-label="' + esc(d.name) + ": " + d.count + ' cases">' +
                '<rect x="0" y="0" width="100" height="6" rx="3" fill="currentColor" opacity="0.14"></rect>' +
                '<rect x="0" y="0" width="' + pct + '" height="6" rx="3" fill="currentColor"></rect>' +
                "</svg></div></div>"
            );
        }).join("");
    }

    function renderHourly() {
        const W = 240, H = 80, n = HOURLY.length;
        const max = Math.max.apply(null, HOURLY.map((h) => h.n));
        const peak = HOURLY.find((h) => h.n === max);
        const slot = W / n;
        const bw = slot * 0.56;

        $("hourly-chart").innerHTML = HOURLY.map(function (h, i) {
            const bh = Math.max(2, (h.n / max) * (H - 6));
            const x = i * slot + (slot - bw) / 2;
            return (
                '<rect class="tc-bar' + (h.n === max ? " is-peak" : "") + '" x="' + x.toFixed(1) + '" y="' + (H - bh).toFixed(1) +
                '" width="' + bw.toFixed(1) + '" height="' + bh.toFixed(1) + '" rx="2">' +
                "<title>" + h.label + ":00 — " + h.n + " admissions</title></rect>"
            );
        }).join("");

        $("hourly-axis").innerHTML = HOURLY.map((h) => "<span>" + h.label + "</span>").join("");
        $("hourly-total").textContent = HOURLY.reduce((s, h) => s + h.n, 0);
        $("hourly-peak").textContent = "Peak " + peak.label + ":00";
    }

    /* ====================================================================
       Priority board (kanban)
       ==================================================================== */

    function renderBoard() {
        $("board").innerHTML = Object.keys(PRIORITY)
            .map(function (key) {
                const p = PRIORITY[key];
                const items = open().filter((c) => c.priority === key);

                const tickets = items
                    .map(function (c) {
                        return (
                            '<article class="tc-ticket" data-open="' + esc(c.id) + '" data-id="' + esc(c.id) + '" ' +
                            'draggable="true" tabindex="0" role="button" ' +
                            'aria-label="Open case ' + esc(c.id) + " for " + esc(c.name) + '. Draggable, drop on another column to change priority."' + '>' +
                            '<div class="flex items-start gap-2">' +
                            '<i class="icon-grip-vertical tc-grip text-sm mt-0.5" aria-hidden="true"></i>' +
                            '<div class="min-w-0 flex-1">' +
                            '<div class="flex items-center gap-2">' +
                            '<p class="text-xs font-bold text-gray-900 truncate mr-auto">' + esc(c.name) + "</p>" +
                            '<span class="hms-chip">' + esc(c.blood) + "</span></div>" +
                            '<p class="mt-1 text-[11px] text-gray-500 dark:text-gray-400 truncate">' + esc(c.type) + "</p>" +
                            '<div class="mt-2 flex items-center gap-2 text-[10px] font-semibold text-gray-400">' +
                            '<span class="inline-flex items-center gap-1 truncate">' +
                            '<i class="icon-user-round text-[10px]" aria-hidden="true"></i>' + esc(c.doctor.replace("Dr. ", "Dr ")) + "</span>" +
                            '<span class="inline-flex items-center gap-1 ml-auto shrink-0">' +
                            '<i class="icon-clock text-[10px]" aria-hidden="true"></i>' + c.since + "m</span>" +
                            "</div></div></div></article>"
                        );
                    })
                    .join("");

                return (
                    '<div class="tc-col ' + p.tone + '" data-priority="' + key + '">' +
                    '<div class="tc-col-head">' +
                    '<span class="size-2 rounded-full bg-[var(--tc-accent)]" aria-hidden="true"></span>' +
                    '<h3 class="tc-col-title">' + p.label + "</h3>" +
                    '<span class="tc-col-count">' + items.length + "</span></div>" +
                    '<div class="tc-col-body" data-priority="' + key + '">' + tickets +
                    (items.length === 0 ? '<p class="tc-col-empty">Drop a case here</p>' : "") +
                    "</div></div>"
                );
            })
            .join("");
    }

    /* ====================================================================
       Case registry
       ==================================================================== */

    function sevPips(severity) {
        const s = SEVERITY[severity];
        let pips = "";
        for (let i = 0; i < 4; i++) pips += '<span class="tc-sev-pip' + (i < s.pips ? " is-on" : "") + '"></span>';
        return '<span class="tc-sev ' + s.tone + '" title="' + severity + '">' + pips + "</span>";
    }

    function detailUrl(c) {
        return "trauma-case-detail.html?" + new URLSearchParams({
            id: c.id, patient: c.name, severity: c.severity, type: c.type, region: c.region,
            team: c.team, location: c.location, status: c.status,
        }).toString();
    }

    // Case Registry rows are always sorted by severity desc, then ISS desc.
    // Neither field ever changes at runtime, so this order is stable and the
    // static markup can ship pre-sorted; only content + visibility mutate.
    function rowHTML(c) {
        const s = SEVERITY[c.severity];
        return (
            '<tr class="hms-row ' + s.tone + '" data-row-id="' + esc(c.id) + '">' +
            '<td class="hms-cell"><a href="' + detailUrl(c) + '" class="font-mono text-[11px] font-bold text-primary hover:underline">' + esc(c.id) + "</a>" +
            '<p class="text-[10px] text-gray-400">' + esc(c.arrival) + "</p></td>" +
            '<td class="hms-cell"><div class="flex items-center gap-2.5">' +
            '<span class="hms-member-avatar size-9!">' + esc(initials(c.name)) + "</span>" +
            '<div class="min-w-0"><p class="text-xs font-bold text-gray-900 truncate">' + esc(c.name) + "</p>" +
            '<p class="text-[10px] text-gray-400">' + c.age + " " + esc(c.gender.charAt(0)) + " · " + esc(c.blood) + "</p></div></div></td>" +
            '<td class="hms-cell"><p class="text-xs text-gray-600 dark:text-gray-300 max-w-40 truncate" title="' + esc(c.type) + '">' + esc(c.type) + "</p></td>" +
            '<td class="hms-cell">' + sevPips(c.severity) +
            '<p class="mt-1 text-[10px] font-bold text-gray-400">ISS ' + c.iss + "</p></td>" +
            '<td class="hms-cell"><p class="text-xs text-gray-600 dark:text-gray-300 max-w-32 truncate" title="' + esc(c.region) + '">' + esc(c.region) + "</p></td>" +
            '<td class="hms-cell"><span class="hms-chip">Team ' + esc(c.team) + "</span>" +
            '<p class="mt-1 text-[10px] text-gray-400 truncate">' + esc(c.doctor) + "</p></td>" +
            '<td class="hms-cell"><span class="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300">' +
            '<i class="icon-map-pin text-[11px] text-gray-400" aria-hidden="true"></i>' + esc(c.location) + "</span></td>" +
            '<td class="hms-cell">' + MC.badge(STATUS_BADGE, c.status) + "</td>" +
            '<td class="hms-cell text-right">' +
            MC.actions(c.id, [
                { label: "View", icon: "icon-eye", act: "view" },
                { label: "Update", icon: "icon-list-checks", act: "update" },
                { label: "Transfer", icon: "icon-ambulance", act: "transfer" },
                { label: "Schedule Surgery", icon: "icon-scissors", act: "surgery" },
                { label: "ICU", icon: "icon-bed", act: "icu" },
                { label: "Print", icon: "icon-printer", act: "print" },
                { label: "Discharge", icon: "icon-check", act: "discharge", danger: true },
            ]) +
            "</td></tr>"
        );
    }

    // Replaces one case's row markup in place (status/location changed).
    // Row position never needs to change: severity and ISS — the only sort
    // keys — are immutable once a case is created.
    function refreshGridRow(c) {
        const el = $("grid-body").querySelector('[data-row-id="' + c.id + '"]');
        if (el) el.outerHTML = rowHTML(c);
    }

    function renderGrid() {
        const q = $("search").value.trim().toLowerCase();
        const sev = $("filter-severity").value;
        const loc = $("filter-location").value;

        const matches = CASES.filter(function (c) {
            const hit = !q || c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || c.team.toLowerCase().includes(q);
            return hit && (!sev || c.severity === sev) && (!loc || c.location === loc);
        });

        $("grid-count").textContent = matches.length + (matches.length === 1 ? " case" : " cases");

        const visible = new Set(matches.map((c) => c.id));
        const tbody = $("grid-body");
        let anyVisible = false;
        tbody.querySelectorAll("[data-row-id]").forEach(function (tr) {
            const isVisible = visible.has(tr.dataset.rowId);
            tr.classList.toggle("hidden", !isVisible);
            if (isVisible) anyVisible = true;
        });

        let empty = document.getElementById("grid-empty-row");
        if (!anyVisible) {
            if (!empty) {
                tbody.insertAdjacentHTML(
                    "beforeend",
                    '<tr id="grid-empty-row"><td colspan="9" class="py-12 text-center">' +
                        '<i class="icon-search-x text-3xl text-gray-300 dark:text-slate-600" aria-hidden="true"></i>' +
                        '<p class="mt-2 text-sm font-semibold text-gray-500 dark:text-gray-400">No cases match these filters</p>' +
                        '<p class="text-xs text-gray-400">Try clearing the search, severity or location filter.</p></td></tr>',
                );
            }
        } else if (empty) {
            empty.remove();
        }

        if (window.HSStaticMethods) window.HSStaticMethods.autoInit();
    }

    /* ====================================================================
       Case drawer
       ==================================================================== */

    // Simple front/back body outline. Regions light up from case.regions.
    const BODY_PARTS = [
        { key: "head", d: "M30 4 m-7 0 a7 7 0 1 0 14 0 a7 7 0 1 0 -14 0", label: "Head" },
        { key: "chest", d: "M20 15 h20 v18 h-20 z", label: "Chest" },
        { key: "abdomen", d: "M21 34 h18 v16 h-18 z", label: "Abdomen" },
        { key: "pelvis", d: "M22 51 h16 v11 h-16 z", label: "Pelvis" },
        { key: "armR", d: "M12 16 h7 v34 h-7 z", label: "Right Arm" },
        { key: "armL", d: "M41 16 h7 v34 h-7 z", label: "Left Arm" },
        { key: "legR", d: "M22 63 h7 v42 h-7 z", label: "Right Leg" },
        { key: "legL", d: "M31 63 h7 v42 h-7 z", label: "Left Leg" },
    ];

    function vitalTile(label, value, unit, alert) {
        return (
            '<div class="tc-vital' + (alert ? " is-alert" : "") + '">' +
            '<p class="text-[9px] font-bold uppercase tracking-wider text-gray-400">' + label + "</p>" +
            '<p class="mt-0.5 text-base font-extrabold tabular-nums ' + (alert ? "text-danger" : "text-gray-900") + '">' +
            value + '<span class="ml-0.5 text-[10px] font-bold text-gray-400">' + unit + "</span></p></div>"
        );
    }

    const FLAG = {
        high: { chip: "badge-red", icon: "icon-arrow-up", label: "High" },
        low: { chip: "badge-amber", icon: "icon-arrow-down", label: "Low" },
        normal: { chip: "badge-green", icon: "icon-check", label: "Normal" },
    };

    const RAD_STATUS = { Complete: "badge-green", "In Progress": "badge-amber", Pending: "badge-gray" };

    function openDrawer(id) {
        const c = CASES.find((x) => x.id === id);
        if (!c) return;
        const s = SEVERITY[c.severity];

        $("dw-avatar").textContent = initials(c.name);
        $("dw-title").textContent = c.name;
        $("dw-sub").textContent = c.id + " · " + c.age + " yrs · " + c.gender + " · arrived " + c.arrival;

        $("dw-chips").innerHTML =
            '<span class="hms-chip ' + s.tone + '">' + c.severity + "</span>" +
            '<span class="hms-chip tone-info">ISS ' + c.iss + "</span>" +
            '<span class="hms-chip tone-purple">' + esc(c.blood) + "</span>" +
            '<span class="hms-chip tone-stable">Team ' + esc(c.team) + "</span>" +
            (c.mtp ? '<span class="hms-chip tone-critical">MTP Active</span>' : "");

        // Patient Summary
        const sum = [
            ["Trauma Type", c.type], ["Body Region", c.region], ["Assigned Doctor", c.doctor],
            ["Current Location", c.location], ["Status", c.status], ["Time Since Arrival", c.since + " min"],
        ];
        $("dw-summary").innerHTML = sum
            .map(function (r) {
                return (
                    '<div><dt class="text-[10px] font-bold uppercase tracking-wider text-gray-400">' + r[0] + "</dt>" +
                    '<dd class="mt-0.5 text-xs font-bold text-gray-900">' + esc(r[1]) + "</dd></div>"
                );
            })
            .join("");

        // Vitals — thresholds drive the alert styling.
        const v = c.vitals;
        $("dw-vitals").innerHTML =
            vitalTile("Heart Rate", v.hr, "bpm", v.hr > 110 || v.hr < 50) +
            vitalTile("Blood Pressure", v.bp, "mmHg", parseInt(v.bp, 10) < 100) +
            vitalTile("SpO2", v.spo2, "%", v.spo2 < 94) +
            vitalTile("Resp. Rate", v.rr, "/min", v.rr > 22 || v.rr < 10) +
            vitalTile("Temp", v.temp, "°F", v.temp < 97 || v.temp > 100.4) +
            vitalTile("GCS", v.gcs, "/15", v.gcs < 13);

        // Injury diagram
        $("dw-body").innerHTML = BODY_PARTS.map(function (p) {
            const hit = c.regions.indexOf(p.key) !== -1;
            return (
                '<path class="tc-body-part' + (hit ? " is-hit" : "") + '" d="' + p.d + '" stroke-width="1" rx="2">' +
                "<title>" + p.label + (hit ? " — injured" : "") + "</title></path>"
            );
        }).join("");

        $("dw-injuries").innerHTML = c.injuries
            .map(function (i) {
                return (
                    '<li class="' + SEVERITY[i.sev].tone + ' rounded-xl border border-border-color dark:border-white/10 p-2.5">' +
                    '<div class="flex items-center gap-2">' +
                    '<span class="size-1.5 rounded-full bg-[var(--tc-accent)] shrink-0" aria-hidden="true"></span>' +
                    '<p class="text-[10px] font-bold uppercase tracking-wide text-gray-400 mr-auto">' + esc(i.region) + "</p>" +
                    '<span class="hms-chip">' + i.sev + "</span></div>" +
                    '<p class="mt-1 text-xs font-semibold text-gray-700 dark:text-gray-300">' + esc(i.text) + "</p></li>"
                );
            })
            .join("");

        // Labs
        $("dw-labs").innerHTML = c.labs
            .map(function (l) {
                const f = FLAG[l.flag];
                return (
                    '<li class="flex items-center gap-2.5 rounded-lg border border-border-color dark:border-white/10 px-3 py-2">' +
                    '<p class="text-xs font-semibold text-gray-700 dark:text-gray-300 mr-auto">' + esc(l.name) + "</p>" +
                    '<p class="text-xs font-extrabold text-gray-900 tabular-nums">' + esc(l.value) + "</p>" +
                    '<span class="badge ' + f.chip + '"><i class="' + f.icon + ' text-[9px]" aria-hidden="true"></i>' + f.label + "</span></li>"
                );
            })
            .join("");

        // Radiology
        $("dw-radiology").innerHTML = c.radiology
            .map(function (r) {
                return (
                    '<li class="flex items-center gap-2.5 rounded-lg border border-border-color dark:border-white/10 px-3 py-2">' +
                    '<i class="icon-scan text-gray-400 text-sm shrink-0" aria-hidden="true"></i>' +
                    '<div class="min-w-0 flex-1"><p class="text-xs font-bold text-gray-900">' + esc(r.name) + "</p>" +
                    '<p class="text-[10px] text-gray-400 truncate">' + esc(r.result) + "</p></div>" +
                    '<span class="badge ' + RAD_STATUS[r.status] + '">' + r.status + "</span></li>"
                );
            })
            .join("");

        // Medications
        $("dw-meds").innerHTML = c.meds
            .map(function (m) {
                return (
                    '<li class="flex items-center gap-2.5 rounded-lg border border-border-color dark:border-white/10 px-3 py-2">' +
                    '<span class="grid size-7 shrink-0 place-items-center rounded-lg bg-purple/10 text-purple">' +
                    '<i class="icon-pill text-[11px]" aria-hidden="true"></i></span>' +
                    '<div class="min-w-0 flex-1"><p class="text-xs font-bold text-gray-900">' + esc(m.name) + "</p>" +
                    '<p class="text-[10px] text-gray-400">' + esc(m.dose) + "</p></div>" +
                    '<span class="text-[10px] font-bold text-gray-400 tabular-nums">' + esc(m.time) + "</span></li>"
                );
            })
            .join("");

        // Doctor notes
        $("dw-notes").innerHTML = c.notes
            .map(function (n) {
                return (
                    '<article class="rounded-xl border border-border-color dark:border-white/10 p-3">' +
                    '<div class="flex items-center gap-2">' +
                    '<span class="hms-member-avatar tone-info size-7! text-[9px]!">' + esc(initials(n.who)) + "</span>" +
                    '<div class="min-w-0 mr-auto"><p class="text-[11px] font-bold text-gray-900 truncate">' + esc(n.who) + "</p>" +
                    '<p class="text-[9px] font-semibold text-gray-400">' + esc(n.role) + "</p></div>" +
                    '<span class="text-[10px] font-bold text-gray-400 tabular-nums">' + esc(n.time) + "</span></div>" +
                    '<p class="mt-2 text-xs text-gray-600 dark:text-gray-300">' + esc(n.text) + "</p></article>"
                );
            })
            .join("");

        // Emergency timeline — stages before the current one are done.
        const done = {};
        c.timeline.forEach((t) => (done[t.stage] = t));

        $("dw-timeline").innerHTML = STAGES.map(function (st, i) {
            const rec = done[st.key];
            const isCurrent = i === c.stage;
            const state = rec && !isCurrent ? "is-done" : isCurrent ? "is-current" : "";
            return (
                '<li class="hms-tl-item ' + state + '">' +
                '<span class="hms-tl-node"><i class="' + (rec && !isCurrent ? "icon-check" : st.icon) + '" aria-hidden="true"></i></span>' +
                '<div class="min-w-0 flex-1 -mt-0.5">' +
                '<div class="flex items-center gap-2">' +
                '<p class="text-xs font-bold ' + (rec || isCurrent ? "text-gray-900" : "text-gray-400") + '">' + st.label + "</p>" +
                (rec ? '<span class="text-[10px] font-bold text-gray-400 tabular-nums">' + esc(rec.time) + "</span>" : "") +
                (isCurrent ? '<span class="hms-chip tone-critical">In progress</span>' : "") +
                "</div>" +
                '<p class="mt-0.5 text-[11px] ' + (rec ? "text-gray-500 dark:text-gray-400" : "text-gray-300 dark:text-slate-600") + '">' +
                (rec ? esc(rec.text) : "Not started") + "</p></div></li>"
            );
        }).join("");

        // Quick actions carry the case id.
        ["dw-act-surgery", "dw-act-icu", "dw-act-transfer", "dw-act-discharge"].forEach(function (b) {
            $(b).dataset.id = c.id;
        });

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

    function updateAdvice() {
        const l = LEVEL[$("am-level").value] || LEVEL[1];
        const iss = parseFloat($("am-iss").value);
        const box = $("am-advice");
        const icon = $("am-advice-icon");

        box.classList.remove("border-danger", "border-warning", "border-border-color");
        icon.className = "shrink-0";

        const bits = [l.team + "-member team paged"];
        if (l.blood) bits.push("2 units O-neg to the bay");
        if (!isNaN(iss) && iss >= 25) bits.push("ISS " + iss + " — notify OR and ICU now");
        else if (!isNaN(iss) && iss >= 16) bits.push("ISS " + iss + " — serious, expect admission");

        if ($("am-level").value === "1") {
            box.classList.add("border-danger");
            icon.classList.add("icon-siren", "text-danger");
        } else if ($("am-level").value === "2") {
            box.classList.add("border-warning");
            icon.classList.add("icon-triangle-alert", "text-warning");
        } else {
            box.classList.add("border-border-color");
            icon.classList.add("icon-info", "text-info");
        }
        $("am-advice-text").textContent = l.label + " — " + l.name + ". " + bits.join(" · ") + ".";
    }

    function openStatus(id) {
        const c = CASES.find((x) => x.id === id);
        if (!c) return;
        $("sm-sub").textContent = c.name + " · " + c.id;
        $("sm-status").value = c.status;
        $("sm-location").value = c.location;
        $("sm-notes").value = "";
        $("sm-save").dataset.id = c.id;
        MC.openModal("status-modal");
    }

    function openSurgery(id) {
        const c = CASES.find((x) => x.id === id);
        if (!c) return;
        $("gm-sub").textContent = c.name + " · " + c.id + " · " + c.type;
        $("gm-procedure").value = "";
        $("gm-notes").value = "";
        $("gm-save").dataset.id = c.id;
        MC.openModal("surgery-modal");
    }

    function openTransfer(id) {
        $("tm-case").innerHTML = open()
            .map((c) => '<option value="' + esc(c.id) + '"' + (c.id === id ? " selected" : "") + ">" + esc(c.name) + " (" + esc(c.id) + ")</option>")
            .join("");
        $("tm-notes").value = "";
        MC.openModal("transfer-modal");
    }

    /* ====================================================================
       Render + wiring
       ==================================================================== */

    function renderAll() {
        renderHero();
        renderKpis();
        renderSeverity();
        renderBoard();
        renderGrid();
    }

    function init() {
        document.body.insertAdjacentHTML("beforeend", MC.deleteModalHTML);

        // Hero rail / KPI row / severity donut & legend / department list /
        // hourly chart / priority board (and the activation, surgery &
        // transfer modals' bay/mechanism/surgeon/anesthetist/escort option
        // lists) are now written directly into the HTML as static markup
        // reflecting this same CASES/TEAM/DEPARTMENTS/HOURLY data, so no
        // initial renderAll() is needed here — it still runs after any
        // mutation (drag-drop reprioritise, transfer, status update,
        // surgery booking, ICU admit, discharge).
        updateAdvice();

        // Filters
        $("search").addEventListener("input", renderGrid);
        $("filter-severity").addEventListener("change", renderGrid);
        $("filter-location").addEventListener("change", renderGrid);

        // Board tickets open the drawer (click + keyboard).
        $("board").addEventListener("click", function (e) {
            const t = e.target.closest("[data-open]");
            if (t) openDrawer(t.dataset.open);
        });
        $("board").addEventListener("keydown", function (e) {
            if (e.key !== "Enter" && e.key !== " ") return;
            const t = e.target.closest("[data-open]");
            if (!t) return;
            e.preventDefault();
            openDrawer(t.dataset.open);
        });

        // Board tickets — drag and drop to reprioritise between columns.
        $("board").addEventListener("dragstart", function (e) {
            const ticket = e.target.closest(".tc-ticket");
            if (!ticket) return;
            ticket.classList.add("is-dragging");
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", ticket.dataset.id);
        });
        $("board").addEventListener("dragend", function (e) {
            const ticket = e.target.closest(".tc-ticket");
            if (ticket) ticket.classList.remove("is-dragging");
            $("board").querySelectorAll(".tc-col-body.is-drop-target").forEach((el) => el.classList.remove("is-drop-target"));
        });
        $("board").addEventListener("dragover", function (e) {
            const body = e.target.closest(".tc-col-body");
            if (!body) return;
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
            body.classList.add("is-drop-target");
        });
        $("board").addEventListener("dragleave", function (e) {
            const body = e.target.closest(".tc-col-body");
            if (body && !body.contains(e.relatedTarget)) body.classList.remove("is-drop-target");
        });
        $("board").addEventListener("drop", function (e) {
            const body = e.target.closest(".tc-col-body");
            if (!body) return;
            e.preventDefault();
            body.classList.remove("is-drop-target");
            const id = e.dataTransfer.getData("text/plain");
            const priority = body.dataset.priority;
            const c = CASES.find((x) => x.id === id);
            if (!c || !priority || c.priority === priority) return;
            c.priority = priority;
            renderAll();
            MC.toast(c.name + " moved to " + PRIORITY[priority].label + " priority.", "success");
        });

        // Grid row actions — delegated, the grid re-renders on every keystroke.
        $("grid-body").addEventListener("click", function (e) {
            const btn = e.target.closest("[data-act]");
            if (!btn) return;
            const id = btn.dataset.id;
            const c = CASES.find((x) => x.id === id);
            if (!c) return;
            const act = btn.dataset.act;

            if (act === "view") openDrawer(id);
            else if (act === "update") openStatus(id);
            else if (act === "transfer") openTransfer(id);
            else if (act === "surgery") openSurgery(id);
            else if (act === "icu") {
                c.status = "ICU Admit";
                c.location = "Surgical ICU";
                refreshGridRow(c);
                renderAll();
                MC.toast(c.name + " admitted to Surgical ICU.", "success");
            } else if (act === "print") {
                MC.toast("Trauma report for " + c.id + " sent to the printer.", "info");
                window.print();
            } else if (act === "discharge") {
                MC.confirmDelete(c.name + " (" + c.id + ")", function () {
                    c.status = "Discharged";
                    c.stage = 7;
                    refreshGridRow(c);
                    renderAll();
                    MC.toast(c.id + " discharged and sent to the registry.", "success");
                });
            }
        });

        // Hero quick actions
        $("btn-new-case").addEventListener("click", function () {
            $("am-form").reset();
            $("am-level").value = "1";
            updateAdvice();
            MC.openModal("activate-modal");
        });
        $("btn-activate").addEventListener("click", function () {
            $("am-form").reset();
            $("am-level").value = "1";
            updateAdvice();
            MC.openModal("activate-modal");
        });
        $("btn-transfer").addEventListener("click", () => openTransfer(null));
        $("btn-print").addEventListener("click", function () {
            MC.toast("Trauma report — " + open().length + " open cases — sent to the printer.", "info");
            window.print();
        });

        // Drawer
        $("dw-close").addEventListener("click", closeDrawer);
        $("dw-backdrop").addEventListener("click", closeDrawer);
        $("dw-act-surgery").addEventListener("click", function () {
            closeDrawer();
            openSurgery(this.dataset.id);
        });
        $("dw-act-transfer").addEventListener("click", function () {
            closeDrawer();
            openTransfer(this.dataset.id);
        });
        $("dw-act-icu").addEventListener("click", function () {
            const c = CASES.find((x) => x.id === this.dataset.id);
            if (!c) return;
            c.status = "ICU Admit";
            c.location = "Surgical ICU";
            closeDrawer();
            refreshGridRow(c);
            renderAll();
            MC.toast(c.name + " admitted to Surgical ICU.", "success");
        });
        $("dw-act-discharge").addEventListener("click", function () {
            const c = CASES.find((x) => x.id === this.dataset.id);
            if (!c) return;
            closeDrawer();
            MC.confirmDelete(c.name + " (" + c.id + ")", function () {
                c.status = "Discharged";
                c.stage = 7;
                refreshGridRow(c);
                renderAll();
                MC.toast(c.id + " discharged and sent to the registry.", "success");
            });
        });

        // Activation modal
        $("am-level").addEventListener("change", updateAdvice);
        $("am-iss").addEventListener("input", updateAdvice);
        $("am-close").addEventListener("click", () => MC.closeModal("activate-modal"));
        $("am-cancel").addEventListener("click", () => MC.closeModal("activate-modal"));
        $("am-save").addEventListener("click", function () {
            if (!$("am-patient").value.trim()) return MC.toast("Enter a patient name or description.", "error");
            const l = LEVEL[$("am-level").value] || LEVEL[1];
            MC.closeModal("activate-modal");
            MC.toast(l.label + " activation sent — " + l.team + " staff paged to " + $("am-bay").value + ".", "error");
        });

        // Transfer modal
        $("tm-close").addEventListener("click", () => MC.closeModal("transfer-modal"));
        $("tm-cancel").addEventListener("click", () => MC.closeModal("transfer-modal"));
        $("tm-save").addEventListener("click", function () {
            const c = CASES.find((x) => x.id === $("tm-case").value);
            if (!c) return MC.toast("Select a case to transfer.", "error");
            c.location = $("tm-dest").value;
            MC.closeModal("transfer-modal");
            refreshGridRow(c);
            renderAll();
            MC.toast(c.name + " transferring to " + c.location + " — " + $("tm-mode").value.split(" — ")[0] + ".", "success");
        });

        // Status modal
        $("sm-cancel").addEventListener("click", () => MC.closeModal("status-modal"));
        $("sm-save").addEventListener("click", function () {
            const c = CASES.find((x) => x.id === this.dataset.id);
            if (!c) return;
            c.status = $("sm-status").value;
            c.location = $("sm-location").value;
            MC.closeModal("status-modal");
            refreshGridRow(c);
            renderAll();
            MC.toast(c.id + " updated — " + c.status + " at " + c.location + ".", "success");
        });

        // Surgery modal
        $("gm-close").addEventListener("click", () => MC.closeModal("surgery-modal"));
        $("gm-cancel").addEventListener("click", () => MC.closeModal("surgery-modal"));
        $("gm-save").addEventListener("click", function () {
            const c = CASES.find((x) => x.id === this.dataset.id);
            if (!c) return;
            if (!$("gm-procedure").value.trim()) return MC.toast("Enter the procedure before booking.", "error");
            c.status = "In OR";
            c.location = $("gm-or").value.split(" — ")[0];
            MC.closeModal("surgery-modal");
            refreshGridRow(c);
            renderAll();
            MC.toast($("gm-procedure").value + " booked in " + c.location + " for " + c.name + ".", "success");
        });

        MC.initDeleteModal();
        ["activate-modal", "transfer-modal", "status-modal", "surgery-modal", "del-modal"].forEach(MC.closeOnBackdrop);

        document.addEventListener("keydown", function (e) {
            if (e.key !== "Escape") return;
            closeDrawer();
            ["activate-modal", "transfer-modal", "status-modal", "surgery-modal", "del-modal"].forEach(MC.closeModal);
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
// ==========================================================================
// triage.js
// ==========================================================================
// Dreams HMS — Triage Station
// ESI assessment desk: waiting list, assessment flow, reassessment timers,
// and the shift's completed triage log. Static demo data only.
(function () {
    "use strict";
    if ((location.pathname.split("/").pop() || "index.html") !== "triage.html") return;

    const $ = (id) => document.getElementById(id);

    function esc(v) {
        return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
        });
    }

    function avatarSrc(seed) {
        let h = 0;
        const s = String(seed);
        for (let i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) >>> 0; }
        const n = (h % 30) + 1;
        return "assets/img/avatar/avatar-" + String(n).padStart(2, "0") + ".jpg";
    }

    /* --- Data ----------------------------------------------------------- */

    // Emergency Severity Index — the US standard 5-level triage scale.
    // Kept identical to emergency-dashboard.js so the two boards agree.
    const ESI = {
        1: { label: "ESI 1", name: "Resuscitation", badge: "badge-red", bar: "text-danger", desc: "Requires immediate life-saving intervention. Unresponsive, intubated, apneic, or pulseless." },
        2: { label: "ESI 2", name: "Emergent", badge: "badge-red", bar: "text-danger", desc: "High-risk situation, severe pain or distress, or confused / lethargic / disoriented. Cannot wait." },
        3: { label: "ESI 3", name: "Urgent", badge: "badge-amber", bar: "text-warning", desc: "Stable, but two or more resources expected (labs, imaging, IV fluids, specialty consult)." },
        4: { label: "ESI 4", name: "Less Urgent", badge: "badge-blue", bar: "text-info", desc: "Stable, one resource expected (a single X-ray, simple laceration repair, or prescription)." },
        5: { label: "ESI 5", name: "Non Urgent", badge: "badge-green", bar: "text-success", desc: "Stable, no resources expected beyond a focused exam. Prescription refill, suture removal." },
    };

    const NURSES = ["Alicia Barnett, RN", "Devon Marsh, RN", "Camille Ortega, RN", "Preston Vaughn, RN", "Nadia Whitmore, RN"];

    const WAITING = [
        { id: "ER-4830", name: "Lorraine Fitzgerald", age: 68, gender: "Female", complaint: "Shortness of breath on exertion", arrival: "Walk-in", at: "09:26 AM", wait: 16 },
        { id: "ER-4831", name: "Damon Escobar", age: 41, gender: "Male", complaint: "Deep laceration to right hand, kitchen knife", arrival: "Walk-in", at: "09:19 AM", wait: 23 },
        { id: "ER-4832", name: "Priscilla Vance", age: 29, gender: "Female", complaint: "Migraine with photophobia, 2 days", arrival: "Walk-in", at: "09:11 AM", wait: 31 },
        { id: "ER-4833", name: "Emmett Sandoval", age: 74, gender: "Male", complaint: "Fall at home, hip pain, unable to stand", arrival: "EMS", at: "09:30 AM", wait: 12 },
        { id: "ER-4834", name: "Yolanda Prescott", age: 55, gender: "Female", complaint: "Elevated blood sugar, blurred vision", arrival: "Transfer", at: "08:58 AM", wait: 44 },
        { id: "ER-4835", name: "Nathaniel Boone", age: 33, gender: "Male", complaint: "Persistent cough with fever, 5 days", arrival: "Walk-in", at: "08:49 AM", wait: 53 },
    ];

    const REASSESS = [
        { id: "ER-4824", name: "Kaitlyn Brewer", esi: 3, since: 28, vitals: "HR 96 · Temp 100.8°F", due: "Overdue by 8 min", overdue: true },
        { id: "ER-4827", name: "Julian Alvarez", esi: 4, since: 46, vitals: "HR 104 · Temp 102.1°F", due: "Overdue by 16 min", overdue: true },
        { id: "ER-4826", name: "Rosalind Pierce", esi: 3, since: 22, vitals: "HR 58 · BP 104/62", due: "Due in 8 min", overdue: false },
        { id: "ER-4829", name: "Grant Sutherland", esi: 5, since: 63, vitals: "HR 72 · BP 130/82", due: "Due in 27 min", overdue: false },
    ];

    const DONE = [
        { id: "ER-4821", name: "Marcus Holloway", esi: 1, vitals: "BP 88/54 · HR 122 · SpO2 91%", nurse: "Alicia Barnett, RN", time: "09:38 AM", disposition: "Resuscitation" },
        { id: "ER-4823", name: "Arthur Delgado", esi: 2, vitals: "BP 178/96 · HR 88 · SpO2 96%", nurse: "Devon Marsh, RN", time: "09:34 AM", disposition: "Resuscitation" },
        { id: "ER-4822", name: "Denise Okafor", esi: 2, vitals: "BP 132/86 · HR 108 · SpO2 89%", nurse: "Alicia Barnett, RN", time: "09:31 AM", disposition: "Acute Care" },
        { id: "ER-4826", name: "Rosalind Pierce", esi: 3, vitals: "BP 104/62 · HR 58 · SpO2 97%", nurse: "Camille Ortega, RN", time: "09:20 AM", disposition: "Acute Care" },
        { id: "ER-4825", name: "Terrence Whitfield", esi: 3, vitals: "BP 128/80 · HR 84 · SpO2 99%", nurse: "Devon Marsh, RN", time: "09:12 AM", disposition: "Fast Track" },
        { id: "ER-4824", name: "Kaitlyn Brewer", esi: 3, vitals: "BP 118/74 · HR 96 · Temp 100.8°F", nurse: "Camille Ortega, RN", time: "09:04 AM", disposition: "Observation" },
        { id: "ER-4827", name: "Julian Alvarez", esi: 4, vitals: "HR 104 · Temp 102.1°F · SpO2 98%", nurse: "Preston Vaughn, RN", time: "08:57 AM", disposition: "Fast Track" },
        { id: "ER-4828", name: "Bernadette Cho", esi: 4, vitals: "BP 124/78 · HR 76", nurse: "Preston Vaughn, RN", time: "08:52 AM", disposition: "Fast Track" },
        { id: "ER-4829", name: "Grant Sutherland", esi: 5, vitals: "BP 130/82 · HR 72", nurse: "Nadia Whitmore, RN", time: "08:36 AM", disposition: "Waiting Room" },
        { id: "ER-4816", name: "Harold Nakamura", esi: 3, vitals: "BP 142/88 · HR 90 · SpO2 95%", nurse: "Alicia Barnett, RN", time: "08:21 AM", disposition: "Observation" },
        { id: "ER-4814", name: "Simone Ferraro", esi: 4, vitals: "BP 120/76 · HR 80", nurse: "Nadia Whitmore, RN", time: "08:05 AM", disposition: "Fast Track" },
        { id: "ER-4811", name: "Cedric Lawson", esi: 5, vitals: "BP 126/80 · HR 74", nurse: "Camille Ortega, RN", time: "07:33 AM", disposition: "Waiting Room" },
    ];

    const DISPOSITION_BADGE = {
        Resuscitation: "badge-red",
        "Acute Care": "badge-amber",
        Observation: "badge-purple",
        "Fast Track": "badge-blue",
        "Waiting Room": "badge-gray",
    };

    // Triage times per completed assessment, in minutes — used for the average.
    const TRIAGE_TIMES = [3, 4, 3, 5, 6, 4, 7, 5, 4, 6, 5, 8];

    /* --- Derived figures ------------------------------------------------ */

    const avgTriage = Math.round(TRIAGE_TIMES.reduce((s, t) => s + t, 0) / TRIAGE_TIMES.length);
    const highAcuity = DONE.filter((d) => d.esi <= 2).length;
    const overdue = REASSESS.filter((r) => r.overdue).length;
    const longestWait = Math.max.apply(null, WAITING.map((w) => w.wait));

    /* --- KPIs ----------------------------------------------------------- */

    function renderKpis() {
        MC.erKpis($("kpi-row"), [
            { id: "kpi-waiting", icon: "icon-clipboard-list", label: "Awaiting Triage", tone: "urgent", live: "Live", pct: Math.min(100, Math.round((WAITING.length / 10) * 100)), meta: "queue cap 10", ecg: true },
            { id: "kpi-longest", icon: "icon-hourglass", label: "Longest Wait", unit: "min", tone: longestWait >= 45 ? "critical" : "urgent", pct: Math.min(100, Math.round((longestWait / 60) * 100)), meta: "target 15 min", ecg: true },
            { id: "kpi-avg", icon: "icon-timer", label: "Avg Triage Time", unit: "min", tone: "stable", pct: Math.min(100, Math.round((avgTriage / 10) * 100)), meta: "target 10 min", ecg: true },
            { id: "kpi-acuity", icon: "icon-heart-pulse", label: "High Acuity (ESI 1–2)", tone: "critical", live: "Live", pct: Math.round((highAcuity / DONE.length) * 100), meta: "of " + DONE.length + " triaged", ecg: true },
            { id: "kpi-reassess", icon: "icon-timer-reset", label: "Reassessments Overdue", tone: overdue ? "critical" : "stable", live: overdue ? "Action" : "", pct: Math.round((overdue / REASSESS.length) * 100), meta: REASSESS.length + " on timer", ecg: true },
            { id: "kpi-done", icon: "icon-clipboard-check", label: "Triaged This Shift", tone: "purple", pct: Math.min(100, Math.round((DONE.length / 20) * 100)), meta: "since 07:00 AM", ecg: true },
        ]);

        $("kpi-waiting").textContent = WAITING.length;
        $("kpi-longest").textContent = longestWait;
        $("kpi-avg").textContent = avgTriage;
        $("kpi-acuity").textContent = highAcuity;
        $("kpi-reassess").textContent = overdue;
        $("kpi-done").textContent = DONE.length;
    }

    /* --- ESI Distribution ----------------------------------------------- */

    function renderDist() {
        const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        DONE.forEach((d) => counts[d.esi]++);
        const max = Math.max.apply(null, Object.keys(counts).map((k) => counts[k])) || 1;

        $("dist-list").innerHTML = Object.keys(counts)
            .map(function (level) {
                const e = ESI[level];
                const n = counts[level];
                const pct = Math.round((n / DONE.length) * 100);
                const barPct = Math.round((n / max) * 100);

                const barBg = e.bar.replace("text-", "bg-");

                return (
                    "<div>" +
                    '<div class="flex items-center gap-2 mb-1.5">' +
                    '<span class="badge ' + e.badge + '">' + e.label + "</span>" +
                    '<span class="text-xs text-gray-500 dark:text-gray-400 mr-auto">' + esc(e.name) + "</span>" +
                    '<span class="text-xs font-bold text-gray-900 tabular-nums">' + n + "</span>" +
                    '<span class="text-[10px] text-gray-400 tabular-nums w-8 text-right">' + pct + "%</span>" +
                    "</div>" +
                    // Plain rounded divs, not SVG rects — an SVG rx doesn't stay
                    // circular once preserveAspectRatio="none" stretches a wide,
                    // short viewBox, so the "rounded" ends render almost flat.
                    '<div class="h-2 w-full rounded-full overflow-hidden ' + barBg + '/10" role="img" ' +
                    'aria-label="' + e.label + ": " + n + " patients, " + pct + ' percent of today\'s triage">' +
                    '<div class="h-full rounded-full ' + barBg + " w-[" + barPct + '%]"></div>' +
                    "</div></div>"
                );
            })
            .join("");
    }

    /* --- Completed Triage ----------------------------------------------- */

    function detailUrl(d) {
        return "triage-detail.html?" + new URLSearchParams({ id: d.id, name: d.name, esi: d.esi, disposition: d.disposition }).toString();
    }

    // Rows for #done-body ship pre-rendered as static HTML (data-row-id per
    // DONE.id); this only toggles which rows are visible for the current
    // ESI-level filter, it never rebuilds the row markup.
    function renderDone() {
        const level = $("filter-esi").value;
        const rows = DONE.filter((d) => !level || String(d.esi) === level);

        $("done-count").textContent = rows.length;

        const visible = new Set(rows.map((d) => d.id));
        const tbody = $("done-body");
        let anyVisible = false;
        tbody.querySelectorAll("[data-row-id]").forEach(function (tr) {
            const isVisible = visible.has(tr.dataset.rowId);
            tr.classList.toggle("hidden", !isVisible);
            if (isVisible) anyVisible = true;
        });

        const empty = document.getElementById("done-empty-row");
        if (empty) empty.classList.toggle("hidden", anyVisible);
    }

    /* --- ESI decision support ------------------------------------------- */

    // Suggests a level from the vitals entered. Intentionally conservative:
    // it only ever suggests, and the nurse's selection always wins.
    function suggestEsi() {
        const hr = parseFloat($("as-hr").value);
        const spo2 = parseFloat($("as-spo2").value);
        const rr = parseFloat($("as-rr").value);
        const pain = parseFloat($("as-pain").value);

        const reasons = [];
        let level = null;

        if (!isNaN(spo2) && spo2 < 90) { level = 1; reasons.push("SpO2 below 90%"); }
        else if (!isNaN(hr) && (hr > 130 || hr < 40)) { level = 1; reasons.push("heart rate outside 40–130"); }
        else if (!isNaN(rr) && (rr > 30 || rr < 8)) { level = 1; reasons.push("respiratory rate outside 8–30"); }
        else if (!isNaN(spo2) && spo2 < 94) { level = 2; reasons.push("SpO2 below 94%"); }
        else if (!isNaN(hr) && (hr > 110 || hr < 50)) { level = 2; reasons.push("heart rate outside 50–110"); }
        else if (!isNaN(pain) && pain >= 7) { level = 2; reasons.push("severe pain (" + pain + "/10)"); }
        else if (!isNaN(hr) || !isNaN(spo2) || !isNaN(rr)) { level = 3; reasons.push("vitals within normal limits"); }

        const box = $("as-suggest");
        const icon = $("as-suggest-icon");
        const text = $("as-suggest-text");

        box.classList.remove("border-danger", "border-warning", "border-border-color");
        icon.className = "shrink-0";

        if (!level) {
            box.classList.add("border-border-color");
            icon.classList.add("icon-info", "text-info");
            text.textContent = "Enter vitals for a suggested ESI level. The nurse's assessment always overrides the suggestion.";
            return;
        }

        const e = ESI[level];
        if (level <= 1) {
            box.classList.add("border-danger");
            icon.classList.add("icon-siren", "text-danger");
        } else if (level === 2) {
            box.classList.add("border-warning");
            icon.classList.add("icon-triangle-alert", "text-warning");
        } else {
            box.classList.add("border-border-color");
            icon.classList.add("icon-info", "text-info");
        }

        text.textContent = "Suggested " + e.label + " — " + e.name + " (" + reasons.join(", ") + "). Confirm or override below.";

        // Pre-select only while the nurse hasn't chosen for themselves.
        if (!$("as-esi").dataset.touched) $("as-esi").value = String(level);
    }

    /* --- Modals --------------------------------------------------------- */

    function openAssess() {
        $("as-form").reset();
        $("as-esi").dataset.touched = "";
        $("as-nurse").innerHTML = NURSES.map((n) => "<option>" + esc(n) + "</option>").join("");

        $("as-avatar").src = "assets/img/avatar/avatar-01.jpg";
        $("as-title").textContent = "New Assessment";
        $("as-sub").textContent = "Unregistered arrival · triage first, register after";

        suggestEsi();
        MC.openModal("assess-modal");
    }

    function renderGuide() {
        $("gm-body").innerHTML = Object.keys(ESI)
            .map(function (level) {
                const e = ESI[level];
                return (
                    '<li class="rounded-lg border border-border-color p-3 flex gap-3">' +
                    '<span class="badge ' + e.badge + ' shrink-0 h-fit">' + e.label + "</span>" +
                    "<div>" +
                    '<p class="font-semibold text-sm text-gray-900">' + esc(e.name) + "</p>" +
                    '<p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">' + esc(e.desc) + "</p>" +
                    "</div></li>"
                );
            })
            .join("");
    }

    /* --- Wiring --------------------------------------------------------- */

    function init() {
        // Shared confirm dialog, injected rather than duplicated per page.
        document.body.insertAdjacentHTML("beforeend", MC.deleteModalHTML);

        // KPI row, ESI distribution and the ESI guide modal body are already
        // written into the HTML as static markup for this same
        // WAITING/DONE/REASSESS/TRIAGE_TIMES/ESI data, so nothing needs
        // building here — completed triage log rows ship pre-rendered too;
        // renderDone() still runs on the ESI filter to toggle visibility.
        renderDone();

        $("filter-esi").addEventListener("change", renderDone);

        $("btn-new").addEventListener("click", () => openAssess());
        $("btn-esi-guide").addEventListener("click", () => MC.openModal("guide-modal"));
        $("btn-export").addEventListener("click", function () {
            MC.toast("Triage log exported — " + DONE.length + " assessments.", "success");
        });

        // Assessment modal
        ["as-hr", "as-spo2", "as-rr", "as-pain"].forEach(function (id) {
            $(id).addEventListener("input", suggestEsi);
        });
        $("as-esi").addEventListener("change", function () {
            this.dataset.touched = "1";
        });
        $("as-close").addEventListener("click", () => MC.closeModal("assess-modal"));
        $("as-cancel").addEventListener("click", () => MC.closeModal("assess-modal"));
        $("as-save").addEventListener("click", function () {
            const level = $("as-esi").value;
            if (!level) return MC.toast("Select an ESI level before completing triage.", "error");
            if (!$("as-complaint").value.trim()) return MC.toast("A chief complaint is required.", "error");

            MC.closeModal("assess-modal");
            MC.toast("Walk-in patient triaged as " + ESI[level].label + " → " + $("as-disposition").value + ".", "success");
        });

        // ESI guide
        $("gm-close").addEventListener("click", () => MC.closeModal("guide-modal"));
        $("gm-done").addEventListener("click", () => MC.closeModal("guide-modal"));

        MC.initDeleteModal();
        ["assess-modal", "guide-modal", "del-modal"].forEach(MC.closeOnBackdrop);

        document.addEventListener("keydown", function (e) {
            if (e.key !== "Escape") return;
            ["assess-modal", "guide-modal", "del-modal"].forEach(MC.closeModal);
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
