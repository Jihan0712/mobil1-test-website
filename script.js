/* ======================================================
   MOBIL 1 ALL-IN-1 PORTAL — v3.0 SCRIPT
   8 Features: Service Log · Garage · Calendar ·
   Talk to Max · Odyssey · Stamps · Extreme Index · Forum
   ====================================================== */

// ── UTILITIES ──
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const LS = {
    get(k, d = null) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
};
function showToast(msg, type = 'success') {
    const c = $('#toastContainer');
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.textContent = msg;
    c.appendChild(t);
    setTimeout(() => t.remove(), 3200);
}
function formatDate(d) {
    const dt = new Date(d);
    return dt.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
}
function formatNum(n) { return n.toLocaleString('en-PH'); }

// ── APP STATE ──
let vehicles = LS.get('m1_vehicles', []);
let logs = LS.get('m1_logs', []);
let reminders = LS.get('m1_reminders', []);
let forumPosts = LS.get('m1_forum', []);
let odysseyKm = LS.get('m1_odyssey_km', 0);
let activeVehicleIdx = 0;
let calMonth, calYear;

const now = new Date();
calMonth = now.getMonth();
calYear = now.getFullYear();

// ══════════════════════════════════════════════════════
// START PAGE
// ══════════════════════════════════════════════════════
(function initStartPage() {
    const startPage = $('#startPage');
    const startBtn = $('#startBtn');
    const splash = $('#appSplash');

    if (!startPage) return;

    // Keep splash hidden until start page is dismissed
    splash.style.opacity = '0';
    splash.style.visibility = 'hidden';

    startBtn.addEventListener('click', () => {
        // Fade out start page
        startPage.classList.add('hidden');
        setTimeout(() => {
            startPage.style.display = 'none';
            // Show splash screen briefly
            splash.style.opacity = '1';
            splash.style.visibility = 'visible';
            splash.classList.remove('hidden');
            // Then auto-dismiss splash after its animation
            setTimeout(() => {
                splash.classList.add('hidden');
                setTimeout(() => splash.style.display = 'none', 600);
            }, 1800);
        }, 600);
    });
})();

// ══════════════════════════════════════════════════════
// SPLASH SCREEN (fallback if no start page)
// ══════════════════════════════════════════════════════
window.addEventListener('load', () => {
    const startPage = $('#startPage');
    // Only auto-dismiss splash if start page doesn't exist
    if (startPage && !startPage.classList.contains('hidden')) return;
    setTimeout(() => {
        const splash = $('#appSplash');
        splash.classList.add('hidden');
        setTimeout(() => splash.style.display = 'none', 600);
    }, 1800);
});

// ══════════════════════════════════════════════════════
// HERO PARTICLES
// ══════════════════════════════════════════════════════
(function initParticles() {
    const container = $('#heroParticles');
    if (!container) return;
    for (let i = 0; i < 30; i++) {
        const s = document.createElement('span');
        s.style.left = Math.random() * 100 + '%';
        s.style.top = Math.random() * 100 + '%';
        s.style.animationDuration = (6 + Math.random() * 8) + 's';
        s.style.animationDelay = Math.random() * 6 + 's';
        s.style.width = s.style.height = (1 + Math.random() * 3) + 'px';
        container.appendChild(s);
    }
})();

// ══════════════════════════════════════════════════════
// NAVBAR
// ══════════════════════════════════════════════════════
const navToggle = $('#navToggle');
const mobileNav = $('#mobileNav');
const navbar = $('#navbar');

navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    mobileNav.classList.toggle('open');
});
// Close on link click
$$('.mobile-nav a').forEach(a => {
    a.addEventListener('click', () => {
        navToggle.classList.remove('active');
        mobileNav.classList.remove('open');
    });
});

// Auto-hide navbar on scroll
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const current = window.scrollY;
    if (current > lastScroll && current > 100) navbar.classList.add('hidden');
    else navbar.classList.remove('hidden');
    lastScroll = current;
}, { passive: true });

// ══════════════════════════════════════════════════════
// SECTION REVEAL (Intersection Observer)
// ══════════════════════════════════════════════════════
const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); } });
}, { threshold: 0.1 });
$$('.section-reveal').forEach(s => revealObs.observe(s));

// Nav active link spy
const sectionIds = ['hero','servicelog','garage','calendar','talktomax','odyssey','stamps','extremeindex','forum'];
const navSpy = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            const id = e.target.id;
            $$('.nav-links a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
            $$('.bottom-tab').forEach(t => t.classList.toggle('active', t.dataset.section === id));
        }
    });
}, { threshold: 0.3 });
sectionIds.forEach(id => { const s = document.getElementById(id); if (s) navSpy.observe(s); });

// ══════════════════════════════════════════════════════
// MODAL SYSTEM
// ══════════════════════════════════════════════════════
function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-close-trigger')) {
        const overlay = e.target.closest('.modal-overlay');
        if (overlay) overlay.classList.remove('active');
    }
});

// ══════════════════════════════════════════════════════
// TOUCH RIPPLE
// ══════════════════════════════════════════════════════
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn, .fab-option, .bottom-tab, .garage-tab, .odyssey-dest, .forum-tab, .log-filter, .chat-chip');
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
    btn.style.position = btn.style.position || 'relative';
    btn.style.overflow = 'hidden';
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
});

// ══════════════════════════════════════════════════════
// FAB
// ══════════════════════════════════════════════════════
const appFab = $('#appFab');
const fabMenu = $('#fabMenu');
const fabBackdrop = $('#fabBackdrop');

appFab.addEventListener('click', () => {
    const isOpen = fabMenu.classList.contains('open');
    fabMenu.classList.toggle('open');
    fabBackdrop.classList.toggle('open');
    appFab.classList.toggle('open');
});
fabBackdrop.addEventListener('click', () => {
    fabMenu.classList.remove('open');
    fabBackdrop.classList.remove('open');
    appFab.classList.remove('open');
});
$$('.fab-option').forEach(opt => {
    opt.addEventListener('click', () => {
        const action = opt.dataset.action;
        fabMenu.classList.remove('open');
        fabBackdrop.classList.remove('open');
        appFab.classList.remove('open');
        if (action === 'add-vehicle') openModal('addVehicleModal');
        else if (action === 'log-service') openModal('addLogModal');
        else if (action === 'talk-max') document.getElementById('talktomax').scrollIntoView({ behavior: 'smooth' });
    });
});

// ══════════════════════════════════════════════════════
// INSTALL BANNER (PWA)
// ══════════════════════════════════════════════════════
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    setTimeout(() => $('#installBanner').classList.add('show'), 3000);
});
$('#installBtn').addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    $('#installBanner').classList.remove('show');
});
$('#installDismiss').addEventListener('click', () => $('#installBanner').classList.remove('show'));

// ══════════════════════════════════════════════════════
// PULL TO REFRESH
// ══════════════════════════════════════════════════════
let ptrStartY = 0;
document.addEventListener('touchstart', (e) => { if (window.scrollY === 0) ptrStartY = e.touches[0].clientY; }, { passive: true });
document.addEventListener('touchmove', (e) => {
    if (ptrStartY && e.touches[0].clientY - ptrStartY > 80 && window.scrollY === 0) {
        $('#ptrIndicator').classList.add('active');
    }
}, { passive: true });
document.addEventListener('touchend', () => {
    if ($('#ptrIndicator').classList.contains('active')) {
        setTimeout(() => { $('#ptrIndicator').classList.remove('active'); location.reload(); }, 800);
    }
    ptrStartY = 0;
}, { passive: true });


// ══════════════════════════════════════════════════════
// 1. SERVICE LOG HISTORY
// ══════════════════════════════════════════════════════
function populateLogVehicleSelect() {
    const sel = $('#logVehicle');
    sel.innerHTML = vehicles.length ? vehicles.map((v, i) => `<option value="${i}">${v.name} (${v.plate})</option>`).join('') : '<option value="">No vehicles — add one first</option>';
}

function renderLogs(filter = 'all') {
    const timeline = $('#logTimeline');
    let filtered = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date));
    if (filter === 'oil') filtered = filtered.filter(l => l.type.toLowerCase().includes('oil'));
    else if (filter === 'maintenance') filtered = filtered.filter(l => !l.type.toLowerCase().includes('oil'));

    if (!filtered.length) {
        timeline.innerHTML = `<div class="empty-state">
            <div class="empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
            <h3>No service entries yet</h3><p>Add a vehicle in your Garage first, then log your Mobil 1 services here.</p>
        </div>`;
        return;
    }

    timeline.innerHTML = filtered.map((l, i) => {
        const veh = vehicles[l.vehicleIdx];
        return `<div class="log-entry" data-idx="${i}" data-cat="${l.type.toLowerCase().includes('oil') ? 'oil' : 'maintenance'}">
            <div class="log-dot"></div>
            <button class="log-delete" onclick="deleteLog(${logs.indexOf(l)})" title="Delete">&times;</button>
            <div class="log-date">${formatDate(l.date)}</div>
            <div class="log-type">${l.type}</div>
            <div class="log-detail">
                <span>📍 ${l.shop || 'N/A'}</span>
                <span>🛣️ ${formatNum(l.mileage)} km</span>
                ${l.notes ? `<span>📝 ${l.notes}</span>` : ''}
            </div>
            ${veh ? `<span class="log-vehicle-badge">${veh.name}</span>` : ''}
        </div>`;
    }).join('');
}

$('#addLogEntryBtn').addEventListener('click', () => {
    if (!vehicles.length) { showToast('Add a vehicle first!', 'error'); return; }
    populateLogVehicleSelect();
    $('#logDate').value = new Date().toISOString().split('T')[0];
    openModal('addLogModal');
});

$('#saveLogBtn').addEventListener('click', () => {
    const type = $('#logType').value;
    const vIdx = parseInt($('#logVehicle').value);
    const date = $('#logDate').value;
    const mileage = parseInt($('#logMileage').value) || 0;
    const shop = $('#logShop').value.trim();
    const notes = $('#logNotes').value.trim();
    if (!date) { showToast('Pick a date', 'error'); return; }
    if (isNaN(vIdx)) { showToast('Select a vehicle', 'error'); return; }

    logs.push({ type, vehicleIdx: vIdx, date, mileage, shop, notes, id: Date.now() });
    LS.set('m1_logs', logs);

    // Update vehicle mileage if log mileage is higher
    if (mileage > vehicles[vIdx].mileage) {
        vehicles[vIdx].mileage = mileage;
        LS.set('m1_vehicles', vehicles);
    }

    closeModal('addLogModal');
    renderLogs();
    updateGarageDashboard();
    updateStamps();
    showToast('Service logged ✓');
    // Reset form
    $('#logMileage').value = '';
    $('#logShop').value = '';
    $('#logNotes').value = '';
});

window.deleteLog = function(idx) {
    logs.splice(idx, 1);
    LS.set('m1_logs', logs);
    renderLogs();
    updateStamps();
    showToast('Entry removed');
};

// Log filters
$$('.log-filter').forEach(btn => {
    btn.addEventListener('click', () => {
        $$('.log-filter').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderLogs(btn.dataset.filter);
    });
});


// ══════════════════════════════════════════════════════
// 2. MULTI-VEHICLE GARAGE
// ══════════════════════════════════════════════════════
function renderGarageTabs() {
    const tabs = $('#garageTabs');
    tabs.innerHTML = vehicles.map((v, i) => `<button class="garage-tab ${i === activeVehicleIdx ? 'active' : ''}" data-idx="${i}">${v.name}</button>`).join('');
    tabs.querySelectorAll('.garage-tab').forEach(t => {
        t.addEventListener('click', () => { activeVehicleIdx = parseInt(t.dataset.idx); renderGarageTabs(); updateGarageDashboard(); });
    });
}

function updateGarageDashboard() {
    const empty = $('#garageEmpty');
    const view = $('#garageVehicleView');
    if (!vehicles.length) { empty.style.display = ''; view.style.display = 'none'; return; }
    empty.style.display = 'none'; view.style.display = '';

    const v = vehicles[activeVehicleIdx] || vehicles[0];
    if (!v) return;

    const daysSinceOil = Math.floor((Date.now() - new Date(v.lastOil).getTime()) / 86400000);
    const kmSinceOil = v.mileage - (v.oilChangeMileage || v.mileage);
    const oilLife = Math.max(0, Math.min(100, Math.round(100 - (kmSinceOil / v.interval * 100))));
    const kmRemaining = Math.max(0, v.interval - kmSinceOil);
    let health = 100;
    if (oilLife < 20) health -= 30;
    else if (oilLife < 50) health -= 15;
    if (daysSinceOil > 180) health -= 20;
    health = Math.max(0, Math.min(100, health));

    const nextServiceDate = new Date(v.lastOil);
    nextServiceDate.setMonth(nextServiceDate.getMonth() + Math.ceil(v.interval / 1666)); // rough estimate

    $('#gHealthScore').textContent = health + '%';
    $('#gMileage').textContent = formatNum(v.mileage) + ' km';
    $('#gLastOil').textContent = formatDate(v.lastOil);
    $('#gNextService').textContent = formatDate(nextServiceDate);
    $('#gOilFill').style.width = oilLife + '%';
    $('#gOilFill').style.background = oilLife > 50 ? 'linear-gradient(90deg, var(--green), var(--blue))' : oilLife > 20 ? 'linear-gradient(90deg, var(--orange), var(--gold))' : 'var(--red)';
    $('#gOilText').textContent = oilLife + '% Oil Life';
    $('#gOilKm').textContent = formatNum(kmRemaining) + ' km remaining';

    // Service count for this vehicle
    const vehLogs = logs.filter(l => l.vehicleIdx === activeVehicleIdx);
    $('#gServiceCount').textContent = vehLogs.length;
    const vehRems = reminders.filter(r => r.vehicleIdx === activeVehicleIdx);
    $('#gReminderCount').textContent = vehRems.length;
}

$('#addVehicleBtn').addEventListener('click', () => {
    $('#vehLastOil').value = new Date().toISOString().split('T')[0];
    openModal('addVehicleModal');
});

$('#saveVehicleBtn').addEventListener('click', () => {
    const plate = $('#vehPlate').value.trim().toUpperCase();
    const name = $('#vehName').value.trim();
    const mileage = parseInt($('#vehMileage').value) || 0;
    const lastOil = $('#vehLastOil').value;
    const interval = parseInt($('#vehInterval').value);
    if (!plate || !name) { showToast('Fill in plate and name', 'error'); return; }
    if (vehicles.find(v => v.plate === plate)) { showToast('Vehicle already exists', 'error'); return; }

    vehicles.push({ plate, name, mileage, lastOil, interval, oilChangeMileage: mileage, id: Date.now() });
    LS.set('m1_vehicles', vehicles);
    activeVehicleIdx = vehicles.length - 1;

    closeModal('addVehicleModal');
    renderGarageTabs();
    updateGarageDashboard();
    populateLogVehicleSelect();
    updateStamps();
    updateCalendar();
    showToast(`${name} added to garage ✓`);
    // Reset form
    $('#vehPlate').value = ''; $('#vehName').value = ''; $('#vehMileage').value = '';
});

$('#deleteVehicleBtn').addEventListener('click', () => {
    if (!vehicles.length) return;
    const v = vehicles[activeVehicleIdx];
    if (!confirm(`Remove ${v.name} (${v.plate})?`)) return;
    vehicles.splice(activeVehicleIdx, 1);
    LS.set('m1_vehicles', vehicles);
    // Clean up related logs
    logs = logs.filter(l => l.vehicleIdx !== activeVehicleIdx);
    logs.forEach(l => { if (l.vehicleIdx > activeVehicleIdx) l.vehicleIdx--; });
    LS.set('m1_logs', logs);
    reminders = reminders.filter(r => r.vehicleIdx !== activeVehicleIdx);
    reminders.forEach(r => { if (r.vehicleIdx > activeVehicleIdx) r.vehicleIdx--; });
    LS.set('m1_reminders', reminders);

    activeVehicleIdx = Math.max(0, activeVehicleIdx - 1);
    renderGarageTabs();
    updateGarageDashboard();
    renderLogs();
    updateStamps();
    updateCalendar();
    showToast('Vehicle removed');
});


// ══════════════════════════════════════════════════════
// 3. PREDICTIVE SERVICE CALENDAR
// ══════════════════════════════════════════════════════
function updateCalendar() {
    renderCalGrid();
    renderPrediction();
    renderReminders();
}

function renderCalGrid() {
    const grid = $('#calGrid');
    const firstDay = new Date(calYear, calMonth, 1);
    const lastDay = new Date(calYear, calMonth + 1, 0);
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    const today = new Date();

    // Gather event dates
    const eventDates = {};
    // Past services = green
    logs.forEach(l => { const d = l.date; eventDates[d] = 'event-green'; });
    // Reminders = blue
    reminders.forEach(r => { eventDates[r.date] = 'event-blue'; });
    // Predicted next service = red
    vehicles.forEach(v => {
        const pred = predictNextService(v);
        if (pred) eventDates[pred] = 'event-red';
    });

    $('#calMonthYear').textContent = firstDay.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' });

    let html = '';
    // Previous month fill
    const prevLast = new Date(calYear, calMonth, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
        html += `<div class="cal-day other-month">${prevLast - i}</div>`;
    }
    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const isToday = d === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();
        const ev = eventDates[dateStr];
        html += `<div class="cal-day${isToday ? ' today' : ''}${ev ? ' has-event ' + ev : ''}">${d}</div>`;
    }
    // Next month fill
    const totalCells = startDay + daysInMonth;
    const remaining = 7 - (totalCells % 7);
    if (remaining < 7) {
        for (let i = 1; i <= remaining; i++) {
            html += `<div class="cal-day other-month">${i}</div>`;
        }
    }
    grid.innerHTML = html;
}

function predictNextService(v) {
    if (!v || !v.lastOil) return null;
    const daysPer1000km = 30; // rough: 1000km/month
    const kmToGo = v.interval - (v.mileage - (v.oilChangeMileage || v.mileage));
    const daysToGo = Math.max(7, Math.round(kmToGo / 1000 * daysPer1000km));
    const d = new Date(v.lastOil);
    d.setDate(d.getDate() + daysToGo);
    return d.toISOString().split('T')[0];
}

function renderPrediction() {
    if (!vehicles.length) {
        $('#calPredDate').textContent = '--';
        $('#calPredDetail').textContent = 'Add a vehicle to see predictions';
        return;
    }
    const v = vehicles[activeVehicleIdx] || vehicles[0];
    const pred = predictNextService(v);
    if (pred) {
        $('#calPredDate').textContent = formatDate(pred);
        $('#calPredDetail').textContent = `${v.name} — based on ${formatNum(v.interval)} km interval`;
    }
}

$('#calPrev').addEventListener('click', () => { calMonth--; if (calMonth < 0) { calMonth = 11; calYear--; } updateCalendar(); });
$('#calNext').addEventListener('click', () => { calMonth++; if (calMonth > 11) { calMonth = 0; calYear++; } updateCalendar(); });

// Reminders
function populateRemVehicleSelect() {
    const sel = $('#remVehicle');
    sel.innerHTML = vehicles.length ? vehicles.map((v, i) => `<option value="${i}">${v.name}</option>`).join('') : '<option value="">No vehicles</option>';
}

function renderReminders() {
    const list = $('#calRemindersList');
    if (!reminders.length) { list.innerHTML = '<div class="cal-rem-empty">No reminders set yet.</div>'; return; }
    list.innerHTML = reminders.map((r, i) => {
        const veh = vehicles[r.vehicleIdx];
        return `<div class="cal-rem-item">
            <div class="rem-info">
                <span class="rem-type">${r.type === 'Custom' ? r.custom : r.type}</span>
                <span class="rem-date">${formatDate(r.date)}</span>
                ${veh ? `<span class="rem-vehicle">${veh.name}</span>` : ''}
            </div>
            <button class="rem-delete" onclick="deleteReminder(${i})">&times;</button>
        </div>`;
    }).join('');
}

$('#addReminderBtn').addEventListener('click', () => {
    if (!vehicles.length) { showToast('Add a vehicle first', 'error'); return; }
    populateRemVehicleSelect();
    openModal('addReminderModal');
});
$('#remType').addEventListener('change', () => {
    $('#customRemField').style.display = $('#remType').value === 'Custom' ? '' : 'none';
});
$('#saveReminderBtn').addEventListener('click', () => {
    const type = $('#remType').value;
    const custom = $('#remCustom').value.trim();
    const date = $('#remDate').value;
    const vehicleIdx = parseInt($('#remVehicle').value);
    if (!date) { showToast('Pick a date', 'error'); return; }
    reminders.push({ type, custom, date, vehicleIdx, id: Date.now() });
    LS.set('m1_reminders', reminders);
    closeModal('addReminderModal');
    updateCalendar();
    updateGarageDashboard();
    showToast('Reminder added ✓');
});
window.deleteReminder = function(idx) {
    reminders.splice(idx, 1);
    LS.set('m1_reminders', reminders);
    updateCalendar();
    updateGarageDashboard();
    showToast('Reminder removed');
};


// ══════════════════════════════════════════════════════
// 4. TALK TO MAX — AI Chat (Predefined)
// ══════════════════════════════════════════════════════
const maxResponses = [
    { keywords: ['oil', 'traffic', 'edsa', 'heavy'], response: "In heavy Manila traffic, your engine idles for hours — that's like running a marathon standing still! I'd go with Mobil 1™ 5W-30. It handles the constant stop-and-go without breaking down. Trust me, on track days my engine goes through similar stress but at 300 km/h! 🏎️" },
    { keywords: ['how often', 'change', 'frequency', 'when'], response: "In Philippine conditions — heat, traffic, floods — I'd recommend every 7,500 to 10,000 km with Mobil 1 full synthetic. That's roughly every 4-6 months for regular Manila driving. With conventional oil? Cut that in half. Mobil 1 just lasts longer under stress." },
    { keywords: ['synthetic', 'worth', 'difference', 'better'], response: "Absolutely worth it! Think of it this way — synthetic is like racing fuel vs regular. Mobil 1 synthetic holds its viscosity even at extreme temperatures. Here in PH where it hits 38°C regularly, your engine NEEDS that protection. I wouldn't put anything else in my car." },
    { keywords: ['heat', 'temperature', 'hot', 'summer'], response: "Heat is engine enemy #1 — and Manila summers are brutal. At 38°C+ outside, your engine bay hits 100°C easily. Conventional oil starts to break down. Mobil 1 synthetic stays stable up to 500°F (260°C). It's literally built for extreme heat. Same tech that protects my F1 engine." },
    { keywords: ['best', 'product', 'recommend', 'which'], response: "For most Filipino drivers, Mobil 1™ 5W-30 is the sweet spot — perfect for Manila traffic and provincial road trips. If you drive a turbo or performance car, go Mobil 1™ 5W-40. For newer Japanese cars like Vios or Civic, Mobil 1™ 0W-20 gives the best fuel efficiency. All full synthetic, all proven on the track!" },
    { keywords: ['flood', 'rain', 'water', 'rainy'], response: "Rainy season is tricky! Water contamination in oil is a real thing after wading through floods. My advice: if you've driven through knee-deep water, get your oil checked ASAP. Mobil 1's advanced additives resist moisture contamination better than conventional oils, but don't push it. Safety first — just like on a wet track! 🌧️" },
    { keywords: ['diesel', 'fortuner', 'innova', 'truck', 'pickup'], response: "For diesel engines like the Fortuner or Hilux, look at Mobil 1™ ESP Formula 5W-30 or Mobil Delvac. Diesel engines run higher compression and create more soot — they need oil that can handle that. Been getting questions from Filipino truck owners and they swear by the difference. 💪" },
    { keywords: ['fuel', 'save', 'economy', 'consumption', 'gas'], response: "Good oil = better fuel economy. Mobil 1 0W-20 can improve fuel efficiency by up to 2% vs thicker oils. Doesn't sound like much? Over 10,000 km in Manila traffic, that's significant pesos saved. Lower viscosity means less internal friction. It's the same principle we use in F1 — every fraction counts!" },
    { keywords: ['long drive', 'road trip', 'baguio', 'sagada', 'province'], response: "Road trips! My favorite topic. Before any long drive — TPLEX to Baguio, Sagada Mountain Province, wherever — make sure your oil is fresh. Mountain driving puts extra stress on your engine with steep inclines. Mobil 1 5W-30 maintains its film strength even under that kind of load. Pack snacks too! 🏔️" },
    { keywords: ['hello', 'hi', 'hey', 'kumusta', 'sup'], response: "Hey there! 👋 Good to see another car enthusiast. I'm Max — three-time World Champion and your go-to for engine care advice. Whether it's EDSA traffic or a Sagada road trip, ask me anything about keeping your engine at peak performance!" },
    { keywords: ['sludge', 'dirty', 'dark', 'black'], response: "Sludge is the silent killer! It builds up when oil degrades from heat and contaminants. Filipino traffic makes this worse because of all the idle time. Mobil 1's advanced detergent additives actively fight sludge formation. I've seen engines with 200k+ km still clean inside because the owner used quality synthetic from day one." },
    { keywords: ['turbo', 'performance', 'fast', 'speed', 'race'], response: "Turbo engines run significantly hotter and spin components up to 200,000 RPM. They NEED oil that won't volatilize or break down. Mobil 1™ 5W-40 is designed exactly for that — it's what protects engines in F1. If you're pushing your car hard, don't cheap out on oil. Your turbo will thank you!" },
];

const chatMessages = $('#chatMessages');
const chatInput = $('#chatInput');
const chatSend = $('#chatSend');
const chatSuggestions = $('#chatSuggestions');

function addChatMessage(text, isUser = false) {
    const div = document.createElement('div');
    div.className = `chat-msg ${isUser ? 'user' : 'bot'}`;
    div.innerHTML = `<div class="chat-msg-avatar">${isUser ? 'You' : 'MV'}</div>
        <div class="chat-msg-bubble"><p>${text}</p></div>`;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTyping() {
    const div = document.createElement('div');
    div.className = 'chat-msg bot';
    div.id = 'typingIndicator';
    div.innerHTML = `<div class="chat-msg-avatar">MV</div>
        <div class="chat-msg-bubble"><div class="chat-typing"><span></span><span></span><span></span></div></div>`;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTyping() {
    const el = $('#typingIndicator');
    if (el) el.remove();
}

function getMaxResponse(input) {
    const lower = input.toLowerCase();
    let best = null;
    let bestScore = 0;
    for (const r of maxResponses) {
        const score = r.keywords.filter(k => lower.includes(k)).length;
        if (score > bestScore) { bestScore = score; best = r; }
    }
    if (best) return best.response;
    return "That's a great question! While I'm mainly tuned for engine and oil advice, I'd say — when in doubt, check your Mobil 1 oil level and make sure you're within your service interval. Anything specific about oil types, driving conditions, or vehicle care? Ask away! 🏁";
}

function sendChat() {
    const text = chatInput.value.trim();
    if (!text) return;
    addChatMessage(text, true);
    chatInput.value = '';
    chatSuggestions.style.display = 'none';
    showTyping();
    setTimeout(() => {
        removeTyping();
        addChatMessage(getMaxResponse(text));
    }, 1200 + Math.random() * 800);
}
chatSend.addEventListener('click', sendChat);
chatInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendChat(); });
$$('.chat-chip').forEach(chip => {
    chip.addEventListener('click', () => {
        chatInput.value = chip.dataset.q;
        sendChat();
    });
});


// ══════════════════════════════════════════════════════
// 5. MOBIL-1 ODYSSEY
// ══════════════════════════════════════════════════════
const destinations = {
    sagada: { km: 410, hours: 10, mult: 3, stress: 'Extreme' },
    launion: { km: 270, hours: 6, mult: 2, stress: 'Severe' },
    baguio: { km: 250, hours: 5, mult: 2, stress: 'Severe' },
    batangas: { km: 110, hours: 3, mult: 1.5, stress: 'Moderate' },
    pagudpud: { km: 580, hours: 12, mult: 4, stress: 'Extreme' },
};
let selectedDest = 'sagada';

function updateOdysseyUI() {
    const d = destinations[selectedDest];
    const pts = Math.round(d.km * d.mult);
    $('#oriDistance').textContent = d.km + ' km';
    $('#oriDrive').textContent = '~' + d.hours + ' hrs';
    $('#oriPoints').textContent = formatNum(pts) + ' pts';
    $('#oriStress').textContent = d.stress;

    // Progress
    const totalKm = odysseyKm;
    const pct = Math.min(100, (totalKm / 10000) * 100);
    $('#odysseyMileFill').style.width = pct + '%';
    $('#odysseyKmCurrent').textContent = formatNum(totalKm) + ' km';
    $('#odysseyKmTarget').textContent = formatNum(Math.max(0, 10000 - totalKm)) + ' km to Legend';

    // Tier
    let tier = 'Explorer';
    if (totalKm >= 7500) tier = 'Gold';
    else if (totalKm >= 5000) tier = 'Silver';
    else if (totalKm >= 2500) tier = 'Bronze';
    $('#odysseyTier').textContent = tier;
}

$$('.odyssey-dest').forEach(btn => {
    btn.addEventListener('click', () => {
        $$('.odyssey-dest').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedDest = btn.dataset.dest;
        updateOdysseyUI();
    });
});

$('#claimJourneyBtn').addEventListener('click', () => {
    const d = destinations[selectedDest];
    odysseyKm += d.km;
    LS.set('m1_odyssey_km', odysseyKm);
    updateOdysseyUI();
    updateStamps();
    showToast(`+${formatNum(d.km)} km claimed! Total: ${formatNum(odysseyKm)} km`);
});


// ══════════════════════════════════════════════════════
// 6. SERVICE STAMPS
// ══════════════════════════════════════════════════════
function updateStamps() {
    const oilLogs = logs.filter(l => l.type.toLowerCase().includes('oil'));
    const totalLogs = logs.length;
    const totalKm = odysseyKm;
    const vehicleCount = vehicles.length;

    function setStamp(id, earned) {
        const card = document.getElementById(id);
        if (!card) return;
        if (earned) {
            card.classList.add('earned');
            card.querySelector('.stamp-status').textContent = '✓ Earned';
        } else {
            card.classList.remove('earned');
            card.querySelector('.stamp-status').textContent = 'Locked';
        }
    }

    setStamp('stampFirst', oilLogs.length >= 1);
    setStamp('stamp3services', totalLogs >= 3);
    setStamp('stamp5k', totalKm >= 5000);
    setStamp('stampMulti', vehicleCount >= 3);
    setStamp('stamp10k', totalKm >= 10000);
    setStamp('stampOdyssey', totalKm >= 10000); // Legend status
}


// ══════════════════════════════════════════════════════
// 7. EXTREME INDEX
// ══════════════════════════════════════════════════════
function initExtremeIndex() {
    const score = 65 + Math.floor(Math.random() * 25); // 65-89
    updateGauge(score);

    // Periodic fluctuation
    setInterval(() => {
        const newScore = Math.max(40, Math.min(100, score + Math.floor(Math.random() * 11) - 5));
        updateGauge(newScore);
    }, 8000);
}

function updateGauge(score) {
    const needle = $('#gaugeNeedle');
    // Map 0-100 to -90deg to 90deg
    const angle = -90 + (score / 100) * 180;
    needle.style.transform = `rotate(${angle}deg)`;
    $('#gaugeValue').textContent = score;
    if (score >= 70) $('#gaugeLabel').textContent = 'EXTREME';
    else if (score >= 40) $('#gaugeLabel').textContent = 'SEVERE';
    else $('#gaugeLabel').textContent = 'MODERATE';
}


// ══════════════════════════════════════════════════════
// 8. FORUM
// ══════════════════════════════════════════════════════
$('#newPostBtn').addEventListener('click', () => openModal('newPostModal'));

$('#submitPostBtn').addEventListener('click', () => {
    const category = $('#postCategory').value;
    const title = $('#postTitle').value.trim();
    const content = $('#postContent').value.trim();
    if (!title || !content) { showToast('Fill in title and content', 'error'); return; }

    forumPosts.unshift({
        category, title, content,
        author: 'You', initials: 'ME',
        time: 'Just now', likes: 0, comments: 0,
        id: Date.now()
    });
    LS.set('m1_forum', forumPosts);
    closeModal('newPostModal');
    renderForumPosts();
    showToast('Post published ✓');
    $('#postTitle').value = '';
    $('#postContent').value = '';
});

function renderForumPosts(filter = 'all') {
    const feed = $('#forumFeed');
    // Keep existing seed posts, prepend user posts
    const seedPosts = feed.querySelectorAll('.forum-post[data-cat]');
    const seedHTML = [...seedPosts].map(p => p.outerHTML).join('');

    let userPostsHTML = '';
    let filtered = filter === 'all' ? forumPosts : forumPosts.filter(p => p.category === filter);
    filtered.forEach(p => {
        const tagClass = p.category === 'routes' ? 'fp-tag-routes' : p.category === 'tips' ? 'fp-tag-tips' : 'fp-tag-stories';
        userPostsHTML += `<div class="forum-post" data-cat="${p.category}">
            <div class="fp-header">
                <div class="fp-avatar" style="background:var(--red);">${p.initials}</div>
                <div class="fp-meta"><span class="fp-author">${p.author}</span><span class="fp-time">${p.time}</span></div>
                <span class="fp-tag ${tagClass}">${p.category.charAt(0).toUpperCase() + p.category.slice(1)}</span>
            </div>
            <h4 class="fp-title">${p.title}</h4>
            <p class="fp-body">${p.content}</p>
            <div class="fp-actions">
                <button class="fp-action fp-like"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg> <span>${p.likes}</span></button>
                <button class="fp-action fp-comment"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> <span>${p.comments}</span></button>
                <button class="fp-action fp-share"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg> Share</button>
            </div>
        </div>`;
    });

    // If filtering, also filter seed posts
    if (filter === 'all') {
        feed.innerHTML = userPostsHTML + seedHTML;
    } else {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = seedHTML;
        const filteredSeeds = [...tempDiv.querySelectorAll(`.forum-post[data-cat="${filter}"]`)].map(el => el.outerHTML).join('');
        feed.innerHTML = userPostsHTML + filteredSeeds;
    }

    // Re-attach like handlers
    attachForumActions();
}

function attachForumActions() {
    $$('.fp-like').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('liked');
            const span = btn.querySelector('span');
            let count = parseInt(span.textContent);
            span.textContent = btn.classList.contains('liked') ? count + 1 : Math.max(0, count - 1);
        });
    });
    $$('.fp-share').forEach(btn => {
        btn.addEventListener('click', () => {
            if (navigator.share) {
                navigator.share({ title: 'Mobil 1 Forum', text: 'Check out this post on the Mobil 1 All-in-1 Portal!' });
            } else {
                showToast('Link copied!', 'info');
            }
        });
    });
}

// Forum tab filtering
$$('.forum-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        $$('.forum-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        renderForumPosts(tab.dataset.tab);
    });
});

// Initial forum actions
attachForumActions();


// ══════════════════════════════════════════════════════
// INITIALIZATION
// ══════════════════════════════════════════════════════
(function init() {
    renderGarageTabs();
    updateGarageDashboard();
    renderLogs();
    updateCalendar();
    updateOdysseyUI();
    updateStamps();
    initExtremeIndex();
    if (forumPosts.length) renderForumPosts();
})();
