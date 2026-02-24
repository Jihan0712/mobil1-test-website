// ===== MOBIL 1 — CONQUER EVERY ROAD =====
// Static website JavaScript

document.addEventListener('DOMContentLoaded', () => {

    // ===== PARTICLES =====
    const particlesContainer = document.getElementById('heroParticles');
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDuration = (4 + Math.random() * 8) + 's';
        particle.style.animationDelay = Math.random() * 5 + 's';
        particle.style.width = (1 + Math.random() * 3) + 'px';
        particle.style.height = particle.style.width;
        particlesContainer.appendChild(particle);
    }

    // ===== NAVBAR SCROLL =====
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    // ===== MOBILE NAV =====
    const navToggle = document.getElementById('navToggle');
    const mobileNav = document.getElementById('mobileNav');
    navToggle.addEventListener('click', () => {
        mobileNav.classList.toggle('active');
    });
    mobileNav.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => mobileNav.classList.remove('active'));
    });

    // ===== INTERSECTION OBSERVER — Factor Cards =====
    const factorCards = document.querySelectorAll('.factor-card');
    const factorObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.delay || 0;
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, parseInt(delay));
            }
        });
    }, { threshold: 0.2 });
    factorCards.forEach(card => factorObserver.observe(card));

    // ===== INTERSECTION OBSERVER — Generic fade-in =====
    const fadeEls = document.querySelectorAll('.fade-in, .stat-item, .reward-card, .section-header');
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.15 });
    fadeEls.forEach(el => fadeObserver.observe(el));

    // ===== COUNTER ANIMATION =====
    const statValues = document.querySelectorAll('.stat-value[data-count]');
    const countObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.dataset.counted) {
                entry.target.dataset.counted = 'true';
                const target = parseInt(entry.target.dataset.count);
                let current = 0;
                const increment = target / 60;
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        current = target;
                        clearInterval(timer);
                    }
                    entry.target.textContent = Math.round(current);
                }, 20);
            }
        });
    }, { threshold: 0.5 });
    statValues.forEach(el => countObserver.observe(el));

    // ===== PIT STOP TO EDSA — Engine Reveal + Hotspot Cards =====
    const carBody = document.getElementById('carBody');
    const carEngine = document.getElementById('carEngine');
    const revealBtn = document.getElementById('revealEngineBtn');
    const revealBtnText = document.getElementById('revealBtnText');
    const narrationText = document.getElementById('narrationText');
    let engineRevealed = false;

    revealBtn.addEventListener('click', () => {
        engineRevealed = !engineRevealed;
        if (engineRevealed) {
            carBody.classList.add('transparent');
            carEngine.classList.add('visible');
            revealBtn.classList.add('active');
            revealBtnText.textContent = 'Show Car Body';
            narrationText.textContent = '"See that engine? Every time you\'re stuck in traffic, it\'s running hot. The oil is fighting for its life in there..."';
        } else {
            carBody.classList.remove('transparent');
            carEngine.classList.remove('visible');
            revealBtn.classList.remove('active');
            revealBtnText.textContent = 'Reveal the Engine';
            narrationText.textContent = '"You think you know extreme driving? Let me show you what your engine faces every single day on these roads..."';
        }
    });

    // ===== HOTSPOT CARD CLICKS =====
    const hotspotModal = document.getElementById('hotspotModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalDesc = document.getElementById('modalDesc');
    const modalClose = document.getElementById('modalClose');
    const modalBackdrop = document.getElementById('modalBackdrop');

    document.querySelectorAll('.hotspot-card').forEach(card => {
        card.addEventListener('click', () => {
            modalTitle.textContent = card.dataset.title;
            modalDesc.textContent = card.dataset.desc;
            hotspotModal.classList.add('active');
        });
    });

    function closeModal() {
        hotspotModal.classList.remove('active');
    }
    modalClose.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    // ===== ENGINE STRESS CALCULATOR =====
    const trafficTime = document.getElementById('trafficTime');
    const trafficValue = document.getElementById('trafficValue');
    const heatOptions = document.getElementById('heatOptions');
    const floodOptions = document.getElementById('floodOptions');
    const calculateBtn = document.getElementById('calculateBtn');
    const calcResult = document.getElementById('calcResult');
    const resultActive = document.getElementById('resultActive');
    const resultScore = document.getElementById('resultScore');
    const resultLabel = document.getElementById('resultLabel');
    const resultMessage = document.getElementById('resultMessage');
    const resultRingFill = document.getElementById('resultRingFill');

    let heatValue = 2;
    let floodValue = 2;

    // Traffic slider
    trafficTime.addEventListener('input', () => {
        const val = parseFloat(trafficTime.value);
        trafficValue.textContent = val >= 6 ? '6+ hrs' : val + ' hrs';
    });

    // Option buttons
    function setupOptions(container, callback) {
        container.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                container.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                callback(parseInt(btn.dataset.value));
            });
        });
    }
    setupOptions(heatOptions, val => heatValue = val);
    setupOptions(floodOptions, val => floodValue = val);

    // Calculate
    calculateBtn.addEventListener('click', () => {
        const traffic = parseFloat(trafficTime.value);

        // Weighted scoring
        const trafficScore = Math.min(traffic / 6, 1) * 40;
        const heatScore = (heatValue / 4) * 30;
        const floodScore = (floodValue / 4) * 30;
        const totalScore = Math.round(trafficScore + heatScore + floodScore);

        let label, color, message;
        if (totalScore < 40) {
            label = 'MODERATE USE';
            color = '#22c55e';
            message = 'Your driving conditions are relatively mild. Regular oil changes with quality oil are sufficient.';
        } else if (totalScore < 70) {
            label = 'SEVERE USE';
            color = '#f97316';
            message = 'What feels routine is often <strong>Severe</strong>. And Severe Use requires full synthetic protection.';
        } else {
            label = 'EXTREME USE';
            color = '#ef4444';
            message = 'Your daily drive is <strong>Extreme</strong>. Only Mobil 1™ full synthetic can deliver the protection your engine demands.';
        }

        // Show result
        calcResult.querySelector('.result-default').style.display = 'none';
        resultActive.style.display = 'block';

        // Animate ring
        const circumference = 339.292;
        const offset = circumference - (totalScore / 100) * circumference;
        resultRingFill.style.stroke = color;
        resultRingFill.style.strokeDashoffset = offset;

        // Animate score counter
        let currentScore = 0;
        const scoreTimer = setInterval(() => {
            currentScore += Math.ceil(totalScore / 40);
            if (currentScore >= totalScore) {
                currentScore = totalScore;
                clearInterval(scoreTimer);
            }
            resultScore.textContent = currentScore;
        }, 25);

        resultLabel.textContent = label;
        resultLabel.style.color = color;
        resultMessage.innerHTML = message;
    });

    // ===== GAUGE ANIMATION =====
    const gaugeNeedle = document.getElementById('gaugeNeedle');
    const gaugeValue = document.getElementById('gaugeValue');
    const gaugeLabel = document.getElementById('gaugeLabel');

    // Simulate live data fluctuation
    function updateGauge() {
        const base = 72;
        const variation = Math.random() * 16 - 8;
        const value = Math.round(base + variation);
        const angle = ((value / 100) * 180) - 90;

        if (gaugeNeedle) {
            gaugeNeedle.style.transform = `rotate(${angle}deg)`;
            gaugeNeedle.style.transition = 'transform 1.5s ease';
        }
        if (gaugeValue) gaugeValue.textContent = value;

        let label = 'MODERATE';
        if (value >= 60) label = 'SEVERE';
        if (value >= 80) label = 'EXTREME';
        if (gaugeLabel) gaugeLabel.textContent = label;
    }

    updateGauge();
    setInterval(updateGauge, 4000);

    // ===== SMOOTH SCROLL =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
});
