/* ================================================================
   MOBIL 1 — ALL-IN-1 PORTAL  |  script.js
   ================================================================ */

// ==================== UTILITY HELPERS ====================

function $(sel, ctx = document) { return ctx.querySelector(sel); }
function $$(sel, ctx = document) { return [...ctx.querySelectorAll(sel)]; }

function showToast(message, type = 'info') {
    const container = $('#toastContainer');
    const icons = { success: '✓', warning: '⚠', error: '✕', info: 'ℹ' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span class="toast-message">${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

function formatDate(dateStr) {
    if (!dateStr) return '--';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function daysBetween(d1, d2) {
    return Math.round((new Date(d2) - new Date(d1)) / 86400000);
}

function formatKm(n) {
    return n ? n.toLocaleString() + ' km' : '--';
}

// ==================== HERO PARTICLES ====================

(function initParticles() {
    const container = $('#heroParticles');
    if (!container) return;
    for (let i = 0; i < 30; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random() * 100 + '%';
        p.style.animationDuration = (Math.random() * 6 + 4) + 's';
        p.style.animationDelay = Math.random() * 6 + 's';
        p.style.width = p.style.height = (Math.random() * 3 + 1) + 'px';
        container.appendChild(p);
    }
})();

// ==================== NAVBAR ====================

(function initNavbar() {
    const navbar = $('#navbar');
    const toggle = $('#navToggle');
    const mobileNav = $('#mobileNav');

    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    toggle?.addEventListener('click', () => {
        mobileNav.classList.toggle('active');
    });

    $$('.mobile-nav a').forEach(a => {
        a.addEventListener('click', () => mobileNav.classList.remove('active'));
    });

    // Smooth scroll for all internal links
    $$('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const target = $(a.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                mobileNav?.classList.remove('active');
            }
        });
    });
})();

// ==================== INTERSECTION OBSERVER ====================

(function initObservers() {
    const factorObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                setTimeout(() => e.target.classList.add('visible'), parseInt(e.target.dataset.delay) || 0);
            }
        });
    }, { threshold: 0.2 });

    $$('.factor-card').forEach(card => factorObs.observe(card));

    const fadeObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    $$('.fade-in').forEach(el => fadeObs.observe(el));

    // Counter animation for reveal stats
    const counterObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting && !e.target.dataset.counted) {
                e.target.dataset.counted = 'true';
                const target = parseInt(e.target.dataset.count);
                let current = 0;
                const step = Math.max(1, Math.floor(target / 40));
                const timer = setInterval(() => {
                    current += step;
                    if (current >= target) {
                        current = target;
                        clearInterval(timer);
                    }
                    e.target.textContent = current;
                }, 40);
            }
        });
    }, { threshold: 0.5 });

    $$('.stat-value[data-count]').forEach(el => counterObs.observe(el));
})();

// ==================== ENGINE REVEAL (PIT STOP) ====================

(function initEngineReveal() {
    const revealBtn = $('#revealEngineBtn');
    const carBody = $('#carBody');
    const carEngine = $('#carEngine');
    const btnText = $('#revealBtnText');
    const narrationText = $('#narrationText');

    const narrations = [
        '"You think you know extreme driving? Let me show you what your engine faces every single day on these roads..."',
        '"Now look closely at those cylinders — 47 stop-and-go cycles per kilometer, each one grinding metal against metal without proper lubrication."',
        '"This is why I trust Mobil 1 in my RB20. And trust me — your EDSA commute puts more thermal stress on oil than most racetracks."',
        '"See that oil flowing? In this heat, conventional oil starts breaking down in weeks. Mobil 1 keeps protecting for up to 20,000 km."',
    ];

    let revealed = false;
    let narrationIndex = 0;

    revealBtn?.addEventListener('click', () => {
        revealed = !revealed;
        carBody.classList.toggle('transparent', revealed);
        carEngine.classList.toggle('visible', revealed);
        revealBtn.classList.toggle('active', revealed);
        btnText.textContent = revealed ? 'Show Car Body' : 'Reveal the Engine';

        narrationIndex = revealed ? 1 : 0;
        narrationText.textContent = narrations[narrationIndex];
    });

    // Cycle narrations every 8s
    setInterval(() => {
        if (revealed) {
            narrationIndex = (narrationIndex % (narrations.length - 1)) + 1;
            narrationText.style.opacity = 0;
            setTimeout(() => {
                narrationText.textContent = narrations[narrationIndex];
                narrationText.style.opacity = 1;
            }, 300);
        }
    }, 8000);
})();

// ==================== HOTSPOT MODAL ====================

(function initHotspotModal() {
    const modal = $('#hotspotModal');
    const mTitle = $('#modalTitle');
    const mDesc = $('#modalDesc');
    const mClose = $('#modalClose');
    const backdrop = $('#modalBackdrop');

    $$('.hotspot-card').forEach(card => {
        card.addEventListener('click', () => {
            mTitle.textContent = card.dataset.title;
            mDesc.textContent = card.dataset.desc;
            modal.classList.add('active');
        });
    });

    function closeModal() { modal.classList.remove('active'); }
    mClose?.addEventListener('click', closeModal);
    backdrop?.addEventListener('click', closeModal);
})();

// ==================== ENGINE STRESS CALCULATOR ====================

(function initCalculator() {
    const trafficRange = $('#trafficTime');
    const trafficValue = $('#trafficValue');
    const calcBtn = $('#calculateBtn');
    let heatVal = 2, floodVal = 2;

    trafficRange?.addEventListener('input', () => {
        trafficValue.textContent = trafficRange.value + ' hrs';
    });

    // Option buttons
    function setupOptions(containerId, onSelect) {
        const container = $('#' + containerId);
        if (!container) return;
        $$('.option-btn', container).forEach(btn => {
            btn.addEventListener('click', () => {
                $$('.option-btn', container).forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                onSelect(parseInt(btn.dataset.value));
            });
        });
    }

    setupOptions('heatOptions', v => heatVal = v);
    setupOptions('floodOptions', v => floodVal = v);

    calcBtn?.addEventListener('click', () => {
        const traffic = parseFloat(trafficRange.value);
        const trafficScore = Math.min(100, (traffic / 6) * 100) * 0.40;
        const heatScore = ((heatVal - 1) / 3) * 100 * 0.30;
        const floodScore = ((floodVal - 1) / 3) * 100 * 0.30;
        const total = Math.round(trafficScore + heatScore + floodScore);

        showResult(total);
    });

    function showResult(score) {
        const defaultDiv = $('.result-default');
        const activeDiv = $('#resultActive');
        const scoreSpan = $('#resultScore');
        const labelDiv = $('#resultLabel');
        const messageP = $('#resultMessage');
        const ringFill = $('#resultRingFill');
        const recName = $('#recProductName');
        const recDesc = $('#recProductDesc');

        if (defaultDiv) defaultDiv.style.display = 'none';
        activeDiv.style.display = 'block';

        let label, color, message, product, productDesc;

        if (score < 40) {
            label = 'MODERATE';
            color = '#22c55e';
            message = 'Your driving conditions are relatively gentle. Regular oil changes with a quality product will keep your engine in great shape.';
            product = 'Mobil Super™ Synthetic Blend';
            productDesc = 'Great everyday protection for moderate Filipino driving conditions. Reliable and cost-effective.';
        } else if (score < 70) {
            label = 'SEVERE USE';
            color = '#f97316';
            message = 'Stop-and-go traffic, heat exposure — your engine works harder than you think. Full synthetic protection is strongly recommended.';
            product = 'Mobil 1™ 5W-30';
            productDesc = 'Full synthetic formula engineered for severe driving. Outstanding wear protection and thermal stability for Philippine conditions.';
        } else {
            label = 'EXTREME';
            color = '#ef4444';
            message = 'Your conditions match what F1 engines face. Hours of traffic in extreme heat with flood wading — your oil needs to be extraordinary.';
            product = 'Mobil 1™ 0W-20 Advanced Fuel Economy';
            productDesc = 'Our most advanced formula. Up to 20,000 km between changes. Maximum protection for the most extreme Philippine roads.';
        }

        scoreSpan.textContent = score;
        labelDiv.textContent = label;
        labelDiv.style.color = color;
        messageP.textContent = message;
        recName.textContent = product;
        recDesc.textContent = productDesc;

        // Animate ring
        const circumference = 2 * Math.PI * 54;
        const offset = circumference - (score / 100) * circumference;
        ringFill.style.stroke = color;
        ringFill.style.strokeDashoffset = offset;

        // Update miles reward tracker
        updateMileTracker(score);
    }
})();

// ==================== GAUGE ANIMATION ====================

(function initGauge() {
    const needle = $('#gaugeNeedle');
    const valEl = $('#gaugeValue');
    const labelEl = $('#gaugeLabel');
    if (!needle) return;

    function updateGauge(val) {
        const angle = -90 + (val / 100) * 180;
        needle.style.transform = `rotate(${angle}deg)`;
        valEl.textContent = val;

        if (val < 40) { labelEl.textContent = 'MODERATE'; labelEl.style.color = '#22c55e'; }
        else if (val < 70) { labelEl.textContent = 'SEVERE'; labelEl.style.color = '#f97316'; }
        else { labelEl.textContent = 'EXTREME'; labelEl.style.color = '#ef4444'; }
    }

    // Initial
    let baseVal = 78;
    updateGauge(baseVal);

    // Random fluctuation
    setInterval(() => {
        const delta = Math.round((Math.random() - 0.5) * 8);
        baseVal = Math.max(0, Math.min(100, baseVal + delta));
        updateGauge(baseVal);
    }, 3000);
})();

// ==================== SERVICE PASSPORT SYSTEM ====================

const PassportSystem = (() => {
    const STORAGE_KEY = 'mobil1_vehicles';

    function getVehicles() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
        catch { return []; }
    }

    function saveVehicles(vehicles) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles));
    }

    let activeVehicleIndex = 0;

    function init() {
        renderVehicleTabs();
        setupModals();
        setupEventListeners();
    }

    function renderVehicleTabs() {
        const tabs = $('#vehicleTabs');
        const vehicles = getVehicles();
        tabs.innerHTML = '';

        vehicles.forEach((v, i) => {
            const tab = document.createElement('button');
            tab.className = 'vehicle-tab' + (i === activeVehicleIndex ? ' active' : '');
            tab.innerHTML = `<span class="vt-plate">${v.plate}</span><span class="vt-name">${v.name}</span>`;
            tab.addEventListener('click', () => {
                activeVehicleIndex = i;
                renderVehicleTabs();
                renderDashboard();
            });
            tabs.appendChild(tab);
        });

        renderDashboard();
    }

    function renderDashboard() {
        const vehicles = getVehicles();
        const empty = $('#passportEmpty');
        const view = $('#passportVehicleView');

        if (vehicles.length === 0) {
            empty.style.display = 'block';
            view.style.display = 'none';
            return;
        }

        empty.style.display = 'none';
        view.style.display = 'block';

        if (activeVehicleIndex >= vehicles.length) activeVehicleIndex = vehicles.length - 1;

        const v = vehicles[activeVehicleIndex];
        renderStats(v);
        renderOilLife(v);
        renderReminders(v);
        renderServiceHistory(v);
    }

    function renderStats(v) {
        const health = calcHealthScore(v);
        const serviceHistory = v.services || [];

        $('#psHealthScore').textContent = health + '/100';
        $('#psEngineAge').textContent = formatKm(v.mileage);
        $('#psLastOil').textContent = formatDate(v.lastOil);

        // Next service
        const nextServiceKm = v.mileage + v.interval;
        $('#psNextService').textContent = formatKm(v.interval) + ' due';
    }

    function calcHealthScore(v) {
        let score = 100;
        const daysSinceOil = v.lastOil ? daysBetween(v.lastOil, new Date().toISOString().split('T')[0]) : 365;

        // Deduct based on days since oil change
        if (daysSinceOil > 180) score -= 30;
        else if (daysSinceOil > 90) score -= 15;
        else if (daysSinceOil > 60) score -= 5;

        // Deduct based on mileage
        if (v.mileage > 100000) score -= 10;
        else if (v.mileage > 50000) score -= 5;

        // Bonus for services logged
        const serviceCount = (v.services || []).length;
        score += Math.min(10, serviceCount * 2);

        // Overdue reminders penalty
        const overdueCount = (v.reminders || []).filter(r => {
            return daysBetween(new Date().toISOString().split('T')[0], r.date) < 0;
        }).length;
        score -= overdueCount * 5;

        return Math.max(0, Math.min(100, score));
    }

    function renderOilLife(v) {
        const fill = $('#oilLifeFill');
        const text = $('#oilLifeText');
        const km = $('#oilLifeKm');

        if (!v.lastOil) {
            fill.style.width = '0%';
            text.textContent = 'No data';
            km.textContent = 'Log your first oil change';
            return;
        }

        const daysSince = daysBetween(v.lastOil, new Date().toISOString().split('T')[0]);
        // Assume interval as KM-based, estimate ~150 days for standard interval
        const estimatedDays = Math.round((v.interval / 10000) * 180);
        const pct = Math.max(0, Math.min(100, 100 - (daysSince / estimatedDays) * 100));

        fill.style.width = pct + '%';

        if (pct > 60) { text.textContent = 'Oil Life Good'; }
        else if (pct > 30) { text.textContent = 'Oil Change Soon'; }
        else { text.textContent = 'Oil Change Overdue!'; }

        const kmRemaining = Math.max(0, Math.round(v.interval * (pct / 100)));
        km.textContent = `~${kmRemaining.toLocaleString()} km remaining`;
    }

    function renderReminders(v) {
        const list = $('#remindersList');
        const reminders = v.reminders || [];

        if (reminders.length === 0) {
            list.innerHTML = '<div class="reminders-empty">No reminders set. Add one to stay on top of maintenance & dues.</div>';
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        const sorted = [...reminders].sort((a, b) => new Date(a.date) - new Date(b.date));

        list.innerHTML = sorted.map((r, i) => {
            const diff = daysBetween(today, r.date);
            let badge, cssClass, icon;

            if (diff < 0) {
                badge = '<span class="ri-badge overdue">Overdue</span>';
                cssClass = 'overdue';
                icon = '🔴';
            } else if (diff <= 14) {
                badge = '<span class="ri-badge due-soon">Due Soon</span>';
                cssClass = 'upcoming';
                icon = '🟡';
            } else {
                badge = '<span class="ri-badge scheduled">Scheduled</span>';
                cssClass = 'later';
                icon = '🟢';
            }

            return `
                <div class="reminder-item ${cssClass}">
                    <div class="ri-icon">${icon}</div>
                    <div class="ri-info">
                        <div class="ri-type">${r.type === 'Custom' ? r.custom : r.type}</div>
                        <div class="ri-date">${formatDate(r.date)}</div>
                        ${r.notes ? `<div class="ri-notes">${r.notes}</div>` : ''}
                    </div>
                    ${badge}
                    <button class="reminder-delete" data-index="${i}" title="Delete reminder">&times;</button>
                </div>
            `;
        }).join('');

        // Delete reminder handlers
        $$('.reminder-delete', list).forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.index);
                const vehicles = getVehicles();
                vehicles[activeVehicleIndex].reminders.splice(idx, 1);
                saveVehicles(vehicles);
                renderDashboard();
                showToast('Reminder removed', 'info');
            });
        });
    }

    function renderServiceHistory(v) {
        const timeline = $('#serviceTimeline');
        const services = v.services || [];

        if (services.length === 0) {
            timeline.innerHTML = '<div class="service-empty">No services logged yet. Start building your verified history.</div>';
            return;
        }

        const sorted = [...services].sort((a, b) => new Date(b.date) - new Date(a.date));

        timeline.innerHTML = sorted.map(s => `
            <div class="service-entry">
                <div class="se-dot"></div>
                <div class="se-info">
                    <div class="se-type">${s.type}</div>
                    <div class="se-meta">
                        <span>📅 ${formatDate(s.date)}</span>
                        <span>📏 ${s.mileage ? s.mileage.toLocaleString() + ' km' : 'N/A'}</span>
                        ${s.shop ? `<span>🏪 ${s.shop}</span>` : ''}
                    </div>
                    ${s.notes ? `<div class="se-notes">"${s.notes}"</div>` : ''}
                </div>
            </div>
        `).join('');
    }

    function setupModals() {
        // Generic passport modal handling
        $$('.pmodal-backdrop, .pmodal-close').forEach(el => {
            el.addEventListener('click', () => {
                el.closest('.passport-modal').classList.remove('active');
            });
        });
    }

    function setupEventListeners() {
        // Add Vehicle
        $('#addVehicleBtn')?.addEventListener('click', () => {
            $('#addVehicleModal').classList.add('active');
        });

        $('#saveVehicleBtn')?.addEventListener('click', () => {
            const plate = $('#vehPlate').value.trim().toUpperCase();
            const name = $('#vehName').value.trim();
            const mileage = parseInt($('#vehMileage').value) || 0;
            const lastOil = $('#vehLastOil').value;
            const interval = parseInt($('#vehInterval').value);

            if (!plate || !name) {
                showToast('Please enter plate number and vehicle name.', 'warning');
                return;
            }

            const vehicles = getVehicles();
            if (vehicles.some(v => v.plate === plate)) {
                showToast('A vehicle with this plate already exists.', 'error');
                return;
            }

            vehicles.push({
                plate, name, mileage, lastOil, interval,
                services: [],
                reminders: [],
                soundCheckHistory: []
            });
            saveVehicles(vehicles);
            activeVehicleIndex = vehicles.length - 1;

            // Reset form
            $('#vehPlate').value = '';
            $('#vehName').value = '';
            $('#vehMileage').value = '';
            $('#vehLastOil').value = '';
            $('#addVehicleModal').classList.remove('active');

            renderVehicleTabs();
            showToast(`${name} (${plate}) registered!`, 'success');
        });

        // Add Reminder
        $('#addReminderBtn')?.addEventListener('click', () => {
            const vehicles = getVehicles();
            if (vehicles.length === 0) {
                showToast('Add a vehicle first!', 'warning');
                return;
            }
            $('#addReminderModal').classList.add('active');
        });

        // Show/hide custom reminder input
        $('#remType')?.addEventListener('change', () => {
            const customGrp = $('#customRemGroup');
            customGrp.style.display = $('#remType').value === 'Custom' ? 'flex' : 'none';
        });

        $('#saveReminderBtn')?.addEventListener('click', () => {
            const type = $('#remType').value;
            const custom = $('#remCustom').value.trim();
            const date = $('#remDate').value;
            const notes = $('#remNotes').value.trim();

            if (!date) {
                showToast('Please select a due date.', 'warning');
                return;
            }
            if (type === 'Custom' && !custom) {
                showToast('Please enter custom reminder text.', 'warning');
                return;
            }

            const vehicles = getVehicles();
            if (!vehicles[activeVehicleIndex].reminders) vehicles[activeVehicleIndex].reminders = [];
            vehicles[activeVehicleIndex].reminders.push({ type, custom, date, notes });
            saveVehicles(vehicles);

            $('#remDate').value = '';
            $('#remNotes').value = '';
            $('#remCustom').value = '';
            $('#addReminderModal').classList.remove('active');

            renderDashboard();
            showToast('Reminder set!', 'success');
        });

        // Add Service
        $('#addServiceBtn')?.addEventListener('click', () => {
            const vehicles = getVehicles();
            if (vehicles.length === 0) {
                showToast('Add a vehicle first!', 'warning');
                return;
            }
            $('#addServiceModal').classList.add('active');
        });

        $('#saveServiceBtn')?.addEventListener('click', () => {
            const type = $('#svcType').value;
            const date = $('#svcDate').value;
            const mileage = parseInt($('#svcMileage').value) || null;
            const shop = $('#svcShop').value.trim();
            const notes = $('#svcNotes').value.trim();

            if (!date) {
                showToast('Please select a service date.', 'warning');
                return;
            }

            const vehicles = getVehicles();
            const v = vehicles[activeVehicleIndex];
            if (!v.services) v.services = [];
            v.services.push({ type, date, mileage, shop, notes });

            // If it's an oil change, update lastOil
            if (type.toLowerCase().includes('oil change')) {
                v.lastOil = date;
                if (mileage) v.mileage = mileage;
            }

            // Update mileage if higher
            if (mileage && mileage > v.mileage) {
                v.mileage = mileage;
            }

            saveVehicles(vehicles);

            $('#svcDate').value = '';
            $('#svcMileage').value = '';
            $('#svcShop').value = '';
            $('#svcNotes').value = '';
            $('#addServiceModal').classList.remove('active');

            renderDashboard();
            showToast('Service logged successfully!', 'success');
        });

        // Delete Vehicle
        $('#deleteVehicleBtn')?.addEventListener('click', () => {
            const vehicles = getVehicles();
            if (vehicles.length === 0) return;
            const v = vehicles[activeVehicleIndex];
            if (confirm(`Remove ${v.name} (${v.plate})? This will delete all service history and reminders.`)) {
                vehicles.splice(activeVehicleIndex, 1);
                saveVehicles(vehicles);
                activeVehicleIndex = 0;
                renderVehicleTabs();
                showToast('Vehicle removed.', 'info');
            }
        });

        // Sound Check
        $('#soundCheckBtn')?.addEventListener('click', startSoundCheck);
    }

    return { init };
})();

// ==================== 1 SOUND CHECK ====================

function startSoundCheck() {
    const canvas = $('#soundCanvas');
    const ctx = canvas.getContext('2d');
    const resultDiv = $('#soundResult');
    const scoreDiv = $('#soundScore');
    const statusDiv = $('#soundStatus');
    const messageDiv = $('#soundMessage');
    const btn = $('#soundCheckBtn');

    btn.textContent = '🎤 Listening... (5 seconds)';
    btn.disabled = true;
    resultDiv.style.display = 'none';

    // Try real microphone; fallback to simulation
    let audioCtx, analyser, dataArray, source, animId;
    let samples = [];

    function drawWaveform() {
        if (!analyser) return;
        analyser.getByteTimeDomainData(dataArray);
        ctx.fillStyle = '#0a0a14';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ff3333';
        ctx.beginPath();
        const sliceW = canvas.width / dataArray.length;
        let x = 0;
        for (let i = 0; i < dataArray.length; i++) {
            const y = (dataArray[i] / 128.0) * (canvas.height / 2);
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            x += sliceW;
        }
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();

        // Collect RMS samples
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
            const v = (dataArray[i] - 128) / 128;
            sum += v * v;
        }
        samples.push(Math.sqrt(sum / dataArray.length));

        animId = requestAnimationFrame(drawWaveform);
    }

    function finishCheck() {
        cancelAnimationFrame(animId);
        if (source && source.disconnect) source.disconnect();
        if (audioCtx) audioCtx.close();

        // Analyze
        const avgRMS = samples.reduce((a, b) => a + b, 0) / (samples.length || 1);
        const score = Math.min(100, Math.round((1 - avgRMS * 3) * 100));

        let status, color, message;
        if (score >= 80) {
            status = 'HEALTHY'; color = '#22c55e';
            message = 'Your engine sounds smooth! Keep up the regular Mobil 1 oil changes.';
        } else if (score >= 50) {
            status = 'MODERATE'; color = '#f97316';
            message = 'Some irregularities detected. Consider scheduling a check-up and switching to Mobil 1 full synthetic.';
        } else {
            status = 'NEEDS ATTENTION'; color = '#ef4444';
            message = 'Unusual engine sounds detected. We strongly recommend a professional inspection and Mobil 1 protection.';
        }

        resultDiv.style.display = 'block';
        scoreDiv.textContent = score + '/100';
        statusDiv.textContent = status;
        statusDiv.style.color = color;
        messageDiv.textContent = message;

        btn.textContent = 'Start Engine Sound Check';
        btn.disabled = false;

        showToast(`Sound Check: ${status} (${score}/100)`, score >= 80 ? 'success' : score >= 50 ? 'warning' : 'error');
    }

    // Attempt microphone access
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                analyser = audioCtx.createAnalyser();
                analyser.fftSize = 2048;
                dataArray = new Uint8Array(analyser.fftSize);
                source = audioCtx.createMediaStreamSource(stream);
                source.connect(analyser);
                drawWaveform();
                setTimeout(() => {
                    stream.getTracks().forEach(t => t.stop());
                    finishCheck();
                }, 5000);
            })
            .catch(() => {
                runSimulatedSoundCheck(ctx, canvas, resultDiv, scoreDiv, statusDiv, messageDiv, btn);
            });
    } else {
        runSimulatedSoundCheck(ctx, canvas, resultDiv, scoreDiv, statusDiv, messageDiv, btn);
    }
}

function runSimulatedSoundCheck(ctx, canvas, resultDiv, scoreDiv, statusDiv, messageDiv, btn) {
    let frame = 0;
    const totalFrames = 150; // ~5 seconds at 30fps

    function drawSim() {
        ctx.fillStyle = '#0a0a14';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#ff3333';
        ctx.lineWidth = 2;
        ctx.beginPath();

        for (let x = 0; x < canvas.width; x++) {
            const noise = Math.sin(x * 0.05 + frame * 0.1) * 20 +
                          Math.sin(x * 0.02 + frame * 0.15) * 15 +
                          (Math.random() - 0.5) * 10;
            const y = canvas.height / 2 + noise;
            x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
        frame++;

        if (frame < totalFrames) {
            requestAnimationFrame(drawSim);
        } else {
            // Simulated result
            const score = 60 + Math.round(Math.random() * 30);
            let status, color, message;
            if (score >= 80) {
                status = 'HEALTHY'; color = '#22c55e';
                message = 'Your engine sounds smooth! Keep up the regular Mobil 1 oil changes.';
            } else if (score >= 60) {
                status = 'MODERATE'; color = '#f97316';
                message = 'Minor irregularities — consider Mobil 1 full synthetic for better protection.';
            } else {
                status = 'NEEDS ATTENTION'; color = '#ef4444';
                message = 'Unusual sounds detected. Professional inspection recommended.';
            }

            resultDiv.style.display = 'block';
            scoreDiv.textContent = score + '/100';
            statusDiv.textContent = status;
            statusDiv.style.color = color;
            messageDiv.textContent = message;

            btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/></svg> Start Engine Sound Check`;
            btn.disabled = false;

            showToast(`Sound Check: ${status} (${score}/100) — Simulated`, score >= 80 ? 'success' : 'warning');
        }
    }

    drawSim();
}

// ==================== JARGON TRANSLATOR ====================

(function initJargonTranslator() {
    const jargonDB = [
        // Engine
        { term: 'PMS', category: 'maintenance', simple: 'Preventive Maintenance Service — a regular check-up for your car, like a doctor\'s visit but for your engine.', detail: 'Includes oil change, filter replacement, brake inspection, fluid top-ups, and more. Recommended every 5,000–10,000 km.' },
        { term: 'Viscosity', category: 'oil', simple: 'How thick or thin your oil is — like choosing between honey and water.', detail: 'Measured in grades like 5W-30. Lower numbers flow better in cold; higher numbers stay thick in heat. Philippine heat needs good 5W-30 or 0W-20.' },
        { term: 'Synthetic Oil', category: 'oil', simple: 'Premium, lab-engineered oil that outperforms regular oil in every way.', detail: 'Unlike conventional oil from refined crude, synthetic oil (like Mobil 1) is chemically designed for maximum protection, lasting up to 20,000 km.' },
        { term: 'Sludge', category: 'engine', simple: 'Gooey, dark gunk that builds up inside your engine when old oil breaks down.', detail: 'Caused by heat, short trips, and infrequent oil changes. Clogs oil passages and can cause engine failure. Mobil 1 prevents sludge formation.' },
        { term: 'Timing Belt', category: 'engine', simple: 'A rubber belt that keeps key engine parts spinning in perfect sync.', detail: 'If it snaps, the engine can self-destruct instantly. Replace every 60,000–100,000 km. No warning signs — just do it on schedule.' },
        { term: 'Spark Plug', category: 'engine', simple: 'The tiny device that creates the spark to ignite fuel in your engine.', detail: 'Worn spark plugs cause poor fuel economy, misfires, and rough idling. Replace every 30,000–60,000 km depending on type.' },
        { term: 'Camshaft', category: 'engine', simple: 'A spinning rod with bumps that opens and closes your engine\'s valves at the right time.', detail: 'Controls when fuel enters and exhaust exits. VVT (Variable Valve Timing) camshafts adjust for better performance.' },
        { term: 'Turbocharger', category: 'engine', simple: 'A device that forces more air into the engine to make it more powerful.', detail: 'Uses exhaust gases to spin a turbine. Needs proper synthetic oil (like Mobil 1) because of extreme heat — up to 1,000°C exhaust temperatures.' },
        { term: 'Compression Ratio', category: 'engine', simple: 'How much the engine squeezes the air-fuel mixture before igniting it.', detail: 'Higher ratio = more power and efficiency but needs higher octane fuel. Most Philippine cars are 10:1 to 12:1.' },
        { term: 'Crankshaft', category: 'engine', simple: 'The main rotating shaft that converts pistons moving up-and-down into spinning motion.', detail: 'Turns the up-down motion of pistons into rotational power that ultimately turns your wheels. Bearings need constant lubrication.' },
        // Oil & Fluids
        { term: '5W-30', category: 'oil', simple: 'An oil grade — flows easily when cold (5W), stays thick enough when hot (30).', detail: 'The "W" stands for Winter. 5W-30 is an all-season oil excellent for Philippine conditions. Mobil 1 5W-30 offers superior protection.' },
        { term: '0W-20', category: 'oil', simple: 'Ultra-thin oil designed for modern fuel-efficient engines.', detail: 'Flows almost instantly on cold starts, reducing engine wear. Despite being thin, Mobil 1 0W-20 forms a strong protective film at operating temperatures.' },
        { term: 'Oil Filter', category: 'oil', simple: 'A canister that catches dirt and metal particles before they circulate through your engine.', detail: 'Change it every oil change. A clogged filter lets contaminants through, accelerating wear. Costs ₱200–800 but prevents ₱50,000+ repairs.' },
        { term: 'Coolant', category: 'oil', simple: 'The liquid that keeps your engine from overheating — it\'s not just water!', detail: 'A mix of antifreeze and water that circulates through the engine. Never use plain water in Manila heat — it boils at 100°C while engines reach 120°C+.' },
        { term: 'Brake Fluid', category: 'oil', simple: 'Special liquid that transfers your foot\'s pressure to the brakes.', detail: 'Absorbs moisture over time, which lowers its boiling point. In Manila traffic with constant braking, fresh brake fluid is critical. Change every 2 years.' },
        { term: 'Transmission Fluid', category: 'oil', simple: 'Oil that lubricates and cools your gearbox, whether automatic or manual.', detail: 'Automatic transmission fluid (ATF) also acts as hydraulic fluid for gear shifts. Change every 40,000–60,000 km for smooth shifting.' },
        { term: 'Power Steering Fluid', category: 'oil', simple: 'Hydraulic fluid that makes turning the steering wheel easy.', detail: 'Low fluid makes steering heavy and can damage the pump. Check level monthly. Some newer cars use electric power steering instead.' },
        // Maintenance
        { term: 'Alignment', category: 'maintenance', simple: 'Adjusting your wheels so they all point perfectly straight.', detail: 'Misaligned wheels cause uneven tire wear and pulling to one side. Check after hitting potholes (common in PH). Costs ₱1,500–3,000.' },
        { term: 'Balancing', category: 'maintenance', simple: 'Adding small weights to your tires so they spin evenly without vibration.', detail: 'Unbalanced tires cause steering wheel vibration, especially at 80+ km/h. Done with tire rotation or when you feel shaking.' },
        { term: 'Tire Rotation', category: 'maintenance', simple: 'Moving your tires to different positions so they wear out evenly.', detail: 'Front tires wear faster due to steering and braking. Rotate every 8,000–12,000 km to extend tire life by up to 20%.' },
        { term: 'Catalytic Converter', category: 'maintenance', simple: 'A device in the exhaust that converts toxic gases into less harmful emissions.', detail: 'Required for emission testing. Contains precious metals (platinum, palladium). Replacement costs ₱15,000–50,000. Theft target worldwide.' },
        { term: 'Cabin Air Filter', category: 'maintenance', simple: 'A filter that cleans the air coming into your car\'s interior through the A/C.', detail: 'Traps dust, pollen, and EDSA pollution. Replace every 15,000–20,000 km. A dirty one weakens your A/C and makes the cabin smell.' },
        { term: 'Drive Belt', category: 'maintenance', simple: 'A rubber belt connecting the engine to accessories like A/C, alternator, and power steering.', detail: 'Also called serpentine belt. If it breaks, you lose A/C, power steering, and charging. Squealing on start-up = replace soon. Check every PMS.' },
        { term: 'Idle', category: 'maintenance', simple: 'When your engine is running but the car isn\'t moving — like in Manila traffic.', detail: 'Normal idle RPM: 600–900. High idle wastes fuel and indicates a problem. Excessive idling (very common in PH) is extremely hard on engine oil.' },
        // Electrical
        { term: 'Alternator', category: 'electrical', simple: 'A generator that charges your car battery while the engine runs.', detail: 'Without it, your battery dies in minutes. Signs of failure: dim lights, warning light, dead battery. Costs ₱5,000–15,000 to replace.' },
        { term: 'ECU', category: 'electrical', simple: 'The car\'s brain — a computer that controls engine performance, fuel, and emissions.', detail: 'ECU (Engine Control Unit) processes data from dozens of sensors. Modern cars have multiple computers. Reprogramming can improve performance.' },
        { term: 'OBD', category: 'electrical', simple: 'A plug under your dashboard where mechanics read your car\'s error codes.', detail: 'OBD-II (On-Board Diagnostics) is standard since 1996. Cheap OBD scanners (₱500–3,000) let you read Check Engine light codes yourself.' },
        { term: 'Fuse', category: 'electrical', simple: 'A tiny safety device that breaks the circuit when too much electricity flows, protecting car electronics.', detail: 'If something electrical stops working (radio, lights, A/C), check the fuse box first. Fuses cost ₱10–50 each. Always replace with same amperage.' },
        { term: 'Battery CCA', category: 'electrical', simple: 'Cold Cranking Amps — how much power your battery can deliver to start the engine.', detail: 'Higher CCA = more starting power. Less critical in PH vs. cold countries, but hot weather shortens battery life to 2–3 years.' },
        // Drivetrain
        { term: 'CVT', category: 'drivetrain', simple: 'A type of automatic transmission with no fixed gears — it smoothly changes ratios.', detail: 'Continuously Variable Transmission. Very common in Honda, Toyota, Nissan. Feels smooth but needs specific CVT fluid. Don\'t use regular ATF!' },
        { term: 'AWD', category: 'drivetrain', simple: 'All-Wheel Drive — sends power to all four wheels for better grip.', detail: 'Useful on wet roads and rough terrain. Costs more fuel. Common in SUVs and crossovers. Not the same as 4WD (which has low range).' },
        { term: 'Differential', category: 'drivetrain', simple: 'A gear set that lets your left and right wheels spin at different speeds when turning.', detail: 'Without it, tires would scrub on turns. Differential fluid needs changing every 50,000–80,000 km. LSD (Limited Slip) versions improve traction.' },
        { term: 'Clutch', category: 'drivetrain', simple: 'The connection between engine and transmission in a manual car — what you press with your left foot.', detail: 'Slipping clutch = engine revs up but car barely moves. Heavy traffic kills clutches faster. Replacement costs ₱8,000–25,000.' },
        { term: 'Torque', category: 'drivetrain', simple: 'Twisting force — how hard your engine can push or pull. Important for hills and heavy loads.', detail: 'Measured in Nm. More torque at low RPM = better for city driving and hauling. Diesel engines have more torque; gasoline has more horsepower.' },
        { term: 'RPM', category: 'drivetrain', simple: 'Revolutions Per Minute — how fast your engine is spinning.', detail: 'Shown on the tachometer. Normal driving: 1,500–3,000 RPM. Redline: 6,000–8,000 RPM. Keeping RPM low saves fuel. High RPM in traffic wastes oil life.' },
        { term: 'Horsepower', category: 'drivetrain', simple: 'A measure of your engine\'s total power output — how fast it can go.', detail: 'Originally defined as the power a horse can sustain. Most PH cars: 90–200 hp. More HP = faster but uses more fuel. Real-world driving rarely uses full HP.' },
        { term: 'Suspension', category: 'drivetrain', simple: 'The system of springs and shock absorbers that keeps your ride smooth over bumps.', detail: 'Absorbs road imperfections (potholes, speed bumps). Worn suspension causes bouncing, poor handling, and faster tire wear. Check every PMS.' },
        { term: 'ABS', category: 'electrical', simple: 'Anti-lock Braking System — prevents your wheels from locking up during hard braking.', detail: 'Pumps the brakes automatically (up to 15x/sec) so you can steer while braking. The pedal pulsing is normal. Required by law in PH since 2020.' },
        { term: 'EFI', category: 'engine', simple: 'Electronic Fuel Injection — precisely sprays fuel into the engine using computer control.', detail: 'Replaced old carburetors. More efficient, better emissions, easier to maintain. Clogged injectors cause rough idle and poor fuel economy.' },
        { term: 'Gasket', category: 'engine', simple: 'A seal between engine parts that prevents oil, coolant, or gas from leaking.', detail: 'Head gasket failure is serious — mixing coolant and oil. Signs: white smoke, milkshake-colored oil, overheating. Repair costs ₱15,000–40,000.' },
    ];

    const searchInput = $('#jargonInput');
    const clearBtn = $('#jargonClear');
    const resultsDiv = $('#jargonResults');
    const glossaryDiv = $('#jargonGlossary');
    let activeCat = 'all';

    function renderGlossary() {
        const filtered = activeCat === 'all' ? jargonDB : jargonDB.filter(j => j.category === activeCat);
        const sorted = [...filtered].sort((a, b) => a.term.localeCompare(b.term));
        glossaryDiv.innerHTML = sorted.map(j => `
            <div class="jg-card" data-term="${j.term}">
                <div class="jg-term">${j.term}</div>
                <div class="jg-simple">${j.simple.substring(0, 80)}${j.simple.length > 80 ? '...' : ''}</div>
            </div>
        `).join('');

        $$('.jg-card', glossaryDiv).forEach(card => {
            card.addEventListener('click', () => {
                searchInput.value = card.dataset.term;
                doSearch(card.dataset.term);
            });
        });
    }

    function doSearch(query) {
        query = query.toLowerCase().trim();
        clearBtn.style.display = query ? 'flex' : 'none';

        if (!query) {
            resultsDiv.innerHTML = '';
            return;
        }

        const results = jargonDB.filter(j =>
            j.term.toLowerCase().includes(query) ||
            j.simple.toLowerCase().includes(query) ||
            j.detail.toLowerCase().includes(query)
        );

        if (results.length === 0) {
            resultsDiv.innerHTML = `<div class="jargon-result-card"><div class="jr-term">No results for "${query}"</div><div class="jr-simple">Try another term or browse the glossary below.</div></div>`;
            return;
        }

        resultsDiv.innerHTML = results.map(j => `
            <div class="jargon-result-card">
                <div class="jr-term">${j.term}</div>
                <div class="jr-category">${j.category}</div>
                <div class="jr-simple">${j.simple}</div>
                <div class="jr-detail">${j.detail}</div>
            </div>
        `).join('');
    }

    searchInput?.addEventListener('input', () => doSearch(searchInput.value));
    clearBtn?.addEventListener('click', () => {
        searchInput.value = '';
        clearBtn.style.display = 'none';
        resultsDiv.innerHTML = '';
        searchInput.focus();
    });

    // Category filters
    $$('.jcat-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            $$('.jcat-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeCat = btn.dataset.cat;
            renderGlossary();
        });
    });

    renderGlossary();
})();

// ==================== ROAD TRIP EXPLORER ====================

(function initRoadTrip() {
    const destBtns = $$('.rtm-dest');
    const riDistance = $('#riDistance');
    const riDrive = $('#riDrive');
    const riPoints = $('#riPoints');
    const riStress = $('#riStress');

    function selectDest(btn) {
        destBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const km = parseInt(btn.dataset.km);
        const hours = parseInt(btn.dataset.hours);
        const mult = parseFloat(btn.dataset.multiplier);
        const points = Math.round(km * mult);

        riDistance.textContent = km + ' km';
        riDrive.textContent = '~' + hours + ' hrs';
        riPoints.textContent = points.toLocaleString() + ' pts';

        if (km > 400) riStress.textContent = 'Extreme';
        else if (km > 200) riStress.textContent = 'Severe';
        else riStress.textContent = 'Moderate';
    }

    destBtns.forEach(btn => {
        btn.addEventListener('click', () => selectDest(btn));
    });
})();

// ==================== REWARDS MILE TRACKER ====================

function updateMileTracker(stressScore) {
    const fill = $('#rewardMileFill');
    const current = $('#rewardKmCurrent');
    const target = $('#rewardKmTarget');

    // Simulated - add km based on stress score
    let storedKm = parseInt(localStorage.getItem('mobil1_reward_km') || '0');
    storedKm += Math.round(stressScore * 10 + Math.random() * 200);
    localStorage.setItem('mobil1_reward_km', storedKm.toString());

    const goldTarget = 10000;
    const pct = Math.min(100, (storedKm / goldTarget) * 100);
    fill.style.width = pct + '%';
    current.textContent = storedKm.toLocaleString() + ' km';

    let tier;
    if (storedKm >= 9000) tier = 'Gold';
    else if (storedKm >= 6000) tier = 'Silver';
    else if (storedKm >= 3000) tier = 'Bronze';
    else tier = 'None';

    const remaining = Math.max(0, goldTarget - storedKm);
    target.textContent = remaining > 0 ? remaining.toLocaleString() + ' km to Gold' : 'Gold Achieved! 🏆';
}

// Initialize reward bar from storage
(function initRewardBar() {
    const storedKm = parseInt(localStorage.getItem('mobil1_reward_km') || '0');
    if (storedKm > 0) {
        const goldTarget = 10000;
        const pct = Math.min(100, (storedKm / goldTarget) * 100);
        const fill = $('#rewardMileFill');
        const current = $('#rewardKmCurrent');
        const target = $('#rewardKmTarget');
        if (fill) fill.style.width = pct + '%';
        if (current) current.textContent = storedKm.toLocaleString() + ' km';
        const remaining = Math.max(0, goldTarget - storedKm);
        if (target) target.textContent = remaining > 0 ? remaining.toLocaleString() + ' km to Gold' : 'Gold Achieved! 🏆';
    }
})();

// ==================== INIT ====================

document.addEventListener('DOMContentLoaded', () => {
    PassportSystem.init();
});
