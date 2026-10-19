// ==============================================================================
// 💖 ROMANTIC BIRTHDAY SURPRISE ENGINE 💖 (Optimized & Lag-Free)
// Handles surprise envelope, background music, relationship timer,
// 3D cake candles, 3D flip cards, love letter, "Open When..." notes,
// and live customization.
// ==============================================================================

(function() {
    'use strict';

    // State
    let currentConfig = {};
    let isPlayingMusic = false;
    let audioContext = null;
    let synthInterval = null;
    let totalCandlesLit = 3;

    // Default configuration fallback
    const DEFAULT_CONFIG = window.SURPRISE_CONFIG || {
        herName: "My Love",
        herNickname: "Gorgeous",
        yourName: "Yours Forever",
        birthdayDate: "2026-10-25",
        loveStartDate: "2024-02-14",
        mainGreetingTitle: "Happy Birthday, Beautiful! ✨",
        mainGreetingSubtitle: "Today is all about celebrating the most incredible, radiant, and loving soul in my life.",
        reasons: [
            { title: "Your Kind Heart", text: "You always care deeply about everyone around you and bring genuine warmth everywhere you go." },
            { title: "Your Radiant Smile", text: "One look at your smile can instantly melt away all my stress and make my day 1000x brighter." },
            { title: "The Way You Laugh", text: "Your cute little giggle and wholehearted laughs are the sweetest, most contagious sounds in the world." },
            { title: "Your Big Dreams", text: "I love how passionate and ambitious you are. Watching you grow and succeed inspires me every single day." },
            { title: "Your Cute Quirks", text: "All the silly little things you do when you think no one is watching make me fall deeper in love." },
            { title: "How You Understand Me", text: "You know what I'm thinking without me even saying a single word. My best friend, partner, and soulmate." },
            { title: "Your Gentle Patience", text: "The way you listen, understand, and bring peace to every storm is something I will always cherish." },
            { title: "Just Being YOU", text: "You don't ever have to change a single thing. You are perfectly, undeniably, wonderfully you." }
        ],
        loveLetter: {
            salutation: "My Dearest,",
            paragraphs: [
                "Today is the day the world was blessed with you, and my life was made infinitely better the moment you walked into it.",
                "You are not only the most beautiful person I have ever laid my eyes on, but your heart, your patience, and your unconditional love are things I thank the heavens for every single day.",
                "Thank you for holding my hand through every storm, for celebrating every joy, and for making ordinary days feel like extraordinary adventures.",
                "On your special birthday, I want to remind you of how deeply, endlessly, and passionately you are loved. May this new year bring you everything your sweet heart has ever dreamed of.",
                "Happy Birthday, my angel. Today, tomorrow, and for all the years to come — I am forever yours."
            ],
            signOff: "With all my love and whole heart,",
            signature: "Your Favorite Person ❤️"
        },
        openWhenLetters: [
            {
                title: "Open when you've had a tough day 💆‍♀️",
                badge: "Deep Breath",
                content: "Hey beautiful. You are doing amazing. Don't be so hard on yourself. Drink some water, put on comfy clothes, and remember that today does not define tomorrow. You are strong, capable, and I am so proud of you. I'm right here whenever you need to vent."
            },
            {
                title: "Open when you need a smile 🌸",
                badge: "Instant Joy",
                content: "Did you know that you are officially the cutest girl in the entire universe? It's a scientific fact verified by me! Also, remember the silly moments when we couldn't stop laughing? That cute smile on your face right now is my favorite view ever."
            },
            {
                title: "Open when you're doubting yourself 🌟",
                badge: "You Got This",
                content: "Pause and look at everything you've overcome to get here. You are brilliant, hardworking, and so much stronger than you think. Trust your instincts, take it one step at a time, and remember that I believe in you 1000%."
            },
            {
                title: "Open when you achieve a big goal 🎉",
                badge: "Celebrate!",
                content: "I AM SO INCREDIBLY PROUD OF YOU! I always knew you had greatness in you. Take a moment right now to celebrate your win and pat yourself on the back. You earned every bit of this, and the best is yet to come!"
            }
        ],
        musicFile: "music/song.mp3"
    };

    // Load saved customizations from localStorage with safeguards
    function loadConfig() {
        const saved = localStorage.getItem('birthday_surprise_custom_config');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                currentConfig = Object.assign({}, DEFAULT_CONFIG, parsed);
                // Ensure balanced reasons and letters fill all empty spaces
                if (!currentConfig.reasons || currentConfig.reasons.length < 8) {
                    currentConfig.reasons = DEFAULT_CONFIG.reasons;
                }
                if (!currentConfig.openWhenLetters || currentConfig.openWhenLetters.length < 4) {
                    currentConfig.openWhenLetters = DEFAULT_CONFIG.openWhenLetters;
                }
                delete currentConfig.coupons;
                delete currentConfig.photo;
                delete currentConfig.video;
                return;
            } catch (e) {
                console.error("Failed to parse saved config, using default", e);
            }
        }
        currentConfig = Object.assign({}, DEFAULT_CONFIG);
    }

    function saveConfigToStorage() {
        localStorage.setItem('birthday_surprise_custom_config', JSON.stringify(currentConfig));
    }

    // ==========================================================================
    // AUDIO ENGINE (Web Audio API Synthesizer + Fallback for music & SFX)
    // ==========================================================================
    function getAudioContext() {
        if (!audioContext) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            audioContext = new AudioCtx();
        }
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        return audioContext;
    }

    const ROMANTIC_CHORDS = [
        [523.25, 659.25, 783.99],
        [440.00, 523.25, 659.25],
        [349.23, 440.00, 523.25],
        [392.00, 493.88, 587.33]
    ];

    let chordStep = 0;
    function playMusicBoxNote(freq, delay = 0, duration = 1.0) {
        try {
            const ctx = getAudioContext();
            const now = ctx.currentTime + delay;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.06, now + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + duration);
        } catch (e) {}
    }

    function startSynthesizedMelody() {
        if (synthInterval) clearInterval(synthInterval);
        chordStep = 0;
        synthInterval = setInterval(() => {
            if (!isPlayingMusic) return;
            const chord = ROMANTIC_CHORDS[chordStep % ROMANTIC_CHORDS.length];
            playMusicBoxNote(chord[0], 0, 1.4);
            playMusicBoxNote(chord[1], 0.25, 1.2);
            playMusicBoxNote(chord[2], 0.5, 1.2);
            chordStep++;
        }, 1300);
    }

    function stopSynthesizedMelody() {
        if (synthInterval) {
            clearInterval(synthInterval);
            synthInterval = null;
        }
    }

    function playChimeSound() {
        try {
            const ctx = getAudioContext();
            const notes = [523.25, 659.25, 783.99, 1046.50];
            notes.forEach((freq, idx) => {
                const now = ctx.currentTime + (idx * 0.08);
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now);

                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(0.1, now + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(now);
                osc.stop(now + 1.0);
            });
        } catch (e) {}
    }

    function toggleMusic() {
        const audioEl = document.getElementById('bg-audio');
        const musicBtn = document.getElementById('music-btn');
        const musicText = document.getElementById('music-text');

        getAudioContext();

        if (isPlayingMusic) {
            isPlayingMusic = false;
            audioEl.pause();
            stopSynthesizedMelody();
            musicBtn.classList.remove('playing');
            musicText.textContent = "Play Music";
        } else {
            isPlayingMusic = true;
            musicBtn.classList.add('playing');
            musicText.textContent = "Music Playing";

            if (currentConfig.musicFile) {
                audioEl.src = currentConfig.musicFile;
                audioEl.play().catch(() => {
                    startSynthesizedMelody();
                });
            } else {
                startSynthesizedMelody();
            }
        }
    }

    // ==========================================================================
    // LIGHTWEIGHT, LAG-FREE CONFETTI & PARTICLES
    // ==========================================================================
    function triggerConfettiBurst(originX = window.innerWidth / 2, originY = window.innerHeight / 2) {
        const colors = ['#ff4d79', '#f6d365', '#ff9ebb', '#ffffff', '#c9184a'];
        const numParticles = 32;

        for (let i = 0; i < numParticles; i++) {
            const particle = document.createElement('div');
            document.body.appendChild(particle);

            const size = Math.random() * 8 + 5;
            const isHeart = Math.random() > 0.45;

            particle.style.position = 'fixed';
            particle.style.left = `${originX}px`;
            particle.style.top = `${originY}px`;
            particle.style.width = isHeart ? 'auto' : `${size}px`;
            particle.style.height = isHeart ? 'auto' : `${size}px`;
            particle.style.background = isHeart ? 'transparent' : colors[Math.floor(Math.random() * colors.length)];
            particle.style.borderRadius = '50%';
            particle.style.pointerEvents = 'none';
            particle.style.zIndex = '10001';

            if (isHeart) {
                particle.textContent = ['❤️', '💖', '✨'][Math.floor(Math.random() * 3)];
                particle.style.fontSize = '14px';
            }

            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 14 + 6;
            const vx = Math.cos(angle) * velocity;
            let vy = Math.sin(angle) * velocity - 4;

            let posX = originX;
            let posY = originY;
            let opacity = 1;

            function animate() {
                vy += 0.4;
                posX += vx;
                posY += vy;
                opacity -= 0.02;

                particle.style.transform = `translate3d(${posX - originX}px, ${posY - originY}px, 0)`;
                particle.style.opacity = Math.max(opacity, 0);

                if (opacity > 0 && posY < window.innerHeight + 20) {
                    requestAnimationFrame(animate);
                } else {
                    particle.remove();
                }
            }
            requestAnimationFrame(animate);
        }
    }

    // Lag-free ambient canvas sparkles
    function setupSparkleCanvas() {
        const canvas = document.getElementById('sparkle-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }, { passive: true });

        const particles = [];
        const maxParticles = 20;

        for (let i = 0; i < maxParticles; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: Math.random() * 2.5 + 1,
                speedY: Math.random() * 0.35 + 0.15,
                opacity: Math.random() * 0.6 + 0.2,
                isHeart: Math.random() > 0.6
            });
        }

        function render() {
            ctx.clearRect(0, 0, width, height);

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.y -= p.speedY;

                if (p.y < -10) {
                    p.y = height + 10;
                    p.x = Math.random() * width;
                }

                ctx.globalAlpha = p.opacity;
                if (p.isHeart) {
                    ctx.fillStyle = '#ff7597';
                    ctx.font = '10px serif';
                    ctx.fillText('❤', p.x, p.y);
                } else {
                    ctx.fillStyle = '#fce49c';
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            requestAnimationFrame(render);
        }
        render();
    }

    // ==========================================================================
    // STAGE 1: ENVELOPE SURPRISE REVEAL
    // ==========================================================================
    function setupEnvelope() {
        const overlay = document.getElementById('envelope-overlay');
        const envelope = document.getElementById('envelope-box');
        const mainContent = document.getElementById('main-content');
        const seal = document.getElementById('envelope-seal');
        const overlayTitle = document.getElementById('overlay-letter-title');

        if (currentConfig.herName) {
            overlayTitle.textContent = `For ${currentConfig.herName} ❤️`;
        }

        function openEnvelope() {
            if (envelope.classList.contains('open')) return;

            playChimeSound();
            envelope.classList.add('open');

            const rect = envelope.getBoundingClientRect();
            triggerConfettiBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);

            if (!isPlayingMusic) {
                toggleMusic();
            }

            setTimeout(() => {
                overlay.classList.add('opened');
                mainContent.classList.remove('hidden');

                setTimeout(() => {
                    triggerConfettiBurst(window.innerWidth * 0.3, window.innerHeight * 0.4);
                    triggerConfettiBurst(window.innerWidth * 0.7, window.innerHeight * 0.4);
                }, 250);
            }, 1100);
        }

        envelope.addEventListener('click', openEnvelope);
        seal.addEventListener('click', openEnvelope);
    }

    // ==========================================================================
    // LIVE RELATIONSHIP TIMER
    // ==========================================================================
    function setupTimer() {
        const daysEl = document.getElementById('timer-days');
        const hoursEl = document.getElementById('timer-hours');
        const minsEl = document.getElementById('timer-mins');
        const secsEl = document.getElementById('timer-secs');
        const titleEl = document.getElementById('timer-title');

        if (!daysEl) return;

        function update() {
            const startDate = new Date(currentConfig.loveStartDate || "2024-02-14").getTime();
            const now = new Date().getTime();
            const diff = Math.max(0, now - startDate);

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const mins = Math.floor((diff / (1000 * 60)) % 60);
            const secs = Math.floor((diff / 1000) % 60);

            daysEl.textContent = days;
            hoursEl.textContent = hours.toString().padStart(2, '0');
            minsEl.textContent = mins.toString().padStart(2, '0');
            secsEl.textContent = secs.toString().padStart(2, '0');

            if (titleEl) {
                titleEl.textContent = `Loving ${currentConfig.herName} for every single second:`;
            }
        }

        update();
        setInterval(update, 1000);
    }

    // ==========================================================================
    // INTERACTIVE BIRTHDAY CAKE & CANDLES (Fixed Right-Side Up)
    // ==========================================================================
    function setupCake() {
        const blowBtn = document.getElementById('blow-candles-btn');
        const blowBtnText = document.getElementById('blow-btn-text');
        const wishBox = document.getElementById('wish-reveal-box');
        const relightBtn = document.getElementById('relight-btn');
        const candles = [
            document.getElementById('candle-1'),
            document.getElementById('candle-2'),
            document.getElementById('candle-3')
        ];

        totalCandlesLit = 3;

        function blowCandle(candle) {
            if (!candle || !candle.classList.contains('active')) return;
            candle.classList.remove('active');
            candle.classList.add('extinguished');
            totalCandlesLit--;

            if (totalCandlesLit <= 0) {
                candlesAllExtinguished();
            }
        }

        function candlesAllExtinguished() {
            playChimeSound();
            triggerConfettiBurst(window.innerWidth * 0.5, window.innerHeight * 0.4);

            blowBtn.style.display = 'none';
            wishBox.classList.remove('hidden');

            const wishMsg = document.getElementById('wish-custom-msg');
            wishMsg.textContent = `May every wish you made in this moment come true, ${currentConfig.herName}! You deserve the happiest year ahead ❤️`;
        }

        candles.forEach(candle => {
            if (candle) {
                candle.addEventListener('click', () => blowCandle(candle));
            }
        });

        if (blowBtn) {
            blowBtn.addEventListener('click', () => {
                candles.forEach(c => blowCandle(c));
            });
        }

        if (relightBtn) {
            relightBtn.addEventListener('click', () => {
                candles.forEach(c => {
                    if (c) {
                        c.classList.add('active');
                        c.classList.remove('extinguished');
                    }
                });
                totalCandlesLit = 3;
                wishBox.classList.add('hidden');
                blowBtn.style.display = 'inline-flex';
                blowBtnText.textContent = "Click to Blow Out Candles!";
            });
        }
    }

    // ==========================================================================
    // REASONS WHY I LOVE YOU (FLIP CARDS)
    // ==========================================================================
    function renderReasons() {
        const grid = document.getElementById('reasons-grid');
        if (!grid) return;
        grid.innerHTML = '';
        const reasons = currentConfig.reasons || [];

        reasons.forEach((reason, idx) => {
            const card = document.createElement('div');
            card.className = 'flip-card';

            card.innerHTML = `
                <div class="flip-card-inner">
                    <div class="flip-card-front">
                        <span class="card-num">Reason #${idx + 1}</span>
                        <div class="card-heart-icon">💖</div>
                        <h4 class="card-front-title">${reason.title}</h4>
                        <span class="card-flip-hint">Tap to flip & read ✨</span>
                    </div>
                    <div class="flip-card-back">
                        <div class="card-heart-icon">💌</div>
                        <p class="card-back-text">${reason.text}</p>
                    </div>
                </div>
            `;

            card.addEventListener('click', () => {
                card.classList.toggle('flipped');
            });

            grid.appendChild(card);
        });
    }

    // ==========================================================================
    // HANDWRITTEN LOVE LETTER
    // ==========================================================================
    function renderLoveLetter() {
        const letter = currentConfig.loveLetter;
        if (!letter) return;

        const salutationEl = document.getElementById('letter-salutation');
        if (salutationEl) {
            salutationEl.textContent = `${letter.salutation} ${currentConfig.herNickname || currentConfig.herName},`;
        }
        
        const bodyEl = document.getElementById('letter-body');
        if (bodyEl) {
            bodyEl.innerHTML = '';
            (letter.paragraphs || []).forEach(pText => {
                const p = document.createElement('p');
                p.textContent = pText;
                bodyEl.appendChild(p);
            });
        }

        const signoffEl = document.getElementById('letter-signoff');
        if (signoffEl) {
            signoffEl.textContent = letter.signOff || "With all my love and whole heart,";
        }

        const signatureEl = document.getElementById('letter-signature');
        if (signatureEl) {
            signatureEl.textContent = currentConfig.yourName || letter.signature || "Your Favorite Person ❤️";
        }
    }

    // ==========================================================================
    // "OPEN WHEN..." MINI ENVELOPES
    // ==========================================================================
    function renderOpenWhen() {
        const grid = document.getElementById('open-when-grid');
        if (!grid) return;
        grid.innerHTML = '';
        const letters = currentConfig.openWhenLetters || [];

        letters.forEach((item) => {
            const card = document.createElement('div');
            card.className = 'open-when-card';

            card.innerHTML = `
                <div class="open-when-envelope-icon">💌</div>
                <h4 class="open-when-title">${item.title}</h4>
                <span class="open-when-badge">${item.badge || "Open Me"}</span>
            `;

            card.addEventListener('click', () => {
                openWhenDialog(item);
            });

            grid.appendChild(card);
        });
    }

    function openWhenDialog(item) {
        const modal = document.getElementById('open-when-modal');
        const title = document.getElementById('open-when-dialog-title');
        const badge = document.getElementById('open-when-dialog-badge');
        const text = document.getElementById('open-when-dialog-text');

        title.textContent = item.title;
        badge.textContent = item.badge || "From My Heart";
        text.textContent = item.content;

        modal.classList.remove('hidden');
    }

    // ==========================================================================
    // VIRTUAL GIFT BOX
    // ==========================================================================
    function setupGiftBox() {
        const giftBox = document.getElementById('gift-box');
        const hint = document.getElementById('gift-hint');
        const reveal = document.getElementById('gift-revealed-box');

        if (!giftBox) return;

        giftBox.addEventListener('click', () => {
            if (giftBox.classList.contains('opened')) return;

            playChimeSound();
            giftBox.classList.add('opened');
            hint.textContent = "🎉 Unwrapped with all my love!";

            const rect = giftBox.getBoundingClientRect();
            triggerConfettiBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);

            setTimeout(() => {
                reveal.classList.remove('hidden');
                triggerConfettiBurst();
            }, 500);
        });
    }

    // ==========================================================================
    // LIVE CUSTOMIZER MODAL (GEAR ⚙️)
    // ==========================================================================
    function setupCustomizer() {
        const btn = document.getElementById('customizer-btn');
        const modal = document.getElementById('customize-modal');
        const closeBtn = document.getElementById('customize-close');
        const saveBtn = document.getElementById('cfg-save-btn');
        const resetBtn = document.getElementById('cfg-reset-btn');
        const exportBtn = document.getElementById('cfg-export-btn');

        const herNameInput = document.getElementById('cfg-her-name');
        const yourNameInput = document.getElementById('cfg-your-name');
        const bdayInput = document.getElementById('cfg-bday-date');
        const loveDateInput = document.getElementById('cfg-love-date');
        const greetingTitleInput = document.getElementById('cfg-greeting-title');
        const letterTextInput = document.getElementById('cfg-letter-text');

        btn.addEventListener('click', () => {
            herNameInput.value = currentConfig.herName || '';
            yourNameInput.value = currentConfig.yourName || '';
            bdayInput.value = currentConfig.birthdayDate || '';
            loveDateInput.value = currentConfig.loveStartDate || '';
            greetingTitleInput.value = currentConfig.mainGreetingTitle || '';
            
            if (currentConfig.loveLetter && currentConfig.loveLetter.paragraphs) {
                letterTextInput.value = currentConfig.loveLetter.paragraphs.join('\n\n');
            } else {
                letterTextInput.value = '';
            }

            modal.classList.remove('hidden');
        });

        closeBtn.addEventListener('click', () => modal.classList.add('hidden'));

        saveBtn.addEventListener('click', () => {
            if (herNameInput.value.trim()) currentConfig.herName = herNameInput.value.trim();
            if (yourNameInput.value.trim()) currentConfig.yourName = yourNameInput.value.trim();
            if (bdayInput.value) currentConfig.birthdayDate = bdayInput.value;
            if (loveDateInput.value) currentConfig.loveStartDate = loveDateInput.value;
            if (greetingTitleInput.value.trim()) currentConfig.mainGreetingTitle = greetingTitleInput.value.trim();

            currentConfig.loveLetter = currentConfig.loveLetter || {};
            if (letterTextInput.value.trim()) {
                currentConfig.loveLetter.paragraphs = letterTextInput.value.trim().split('\n\n').filter(p => p.trim());
            }

            saveConfigToStorage();
            applyConfigToDOM();
            modal.classList.add('hidden');
            triggerConfettiBurst();
        });

        resetBtn.addEventListener('click', () => {
            if (confirm("Reset everything back to defaults?")) {
                localStorage.removeItem('birthday_surprise_custom_config');
                currentConfig = Object.assign({}, DEFAULT_CONFIG);
                applyConfigToDOM();
                modal.classList.add('hidden');
            }
        });

        exportBtn.addEventListener('click', () => {
            const fileContent = "window.SURPRISE_CONFIG = " + JSON.stringify(currentConfig, null, 4) + ";";
            const blob = new Blob([fileContent], { type: 'application/javascript' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'config.js';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            alert("Downloaded updated 'config.js'! Replace the file in your folder to make changes permanent!");
        });
    }

    // Apply config settings into HTML text
    function applyConfigToDOM() {
        const nameEl = document.getElementById('display-her-name');
        if (nameEl) nameEl.textContent = currentConfig.herName || "My Love";

        const footerNameEl = document.getElementById('footer-her-name');
        if (footerNameEl) footerNameEl.textContent = currentConfig.herName || "Her";

        const subtitleEl = document.getElementById('display-subtitle');
        if (subtitleEl) subtitleEl.textContent = currentConfig.mainGreetingSubtitle || "To the girl who brings sunshine into my days and starlight into my nights.";
        
        renderReasons();
        renderLoveLetter();
        renderOpenWhen();
    }

    // Modal click outside to dismiss
    function setupModalDismiss() {
        const modals = [
            document.getElementById('open-when-modal'),
            document.getElementById('customize-modal')
        ];

        modals.forEach(modal => {
            if (!modal) return;
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.add('hidden');
                }
            });
        });

        const openWhenClose = document.getElementById('open-when-close');
        if (openWhenClose) openWhenClose.addEventListener('click', () => document.getElementById('open-when-modal').classList.add('hidden'));

        const openWhenConfirm = document.getElementById('open-when-confirm-btn');
        if (openWhenConfirm) openWhenConfirm.addEventListener('click', () => document.getElementById('open-when-modal').classList.add('hidden'));
    }

    // ==========================================================================
    // INITIALIZATION
    // ==========================================================================
    document.addEventListener('DOMContentLoaded', () => {
        loadConfig();
        setupSparkleCanvas();
        setupEnvelope();
        setupTimer();
        setupCake();
        setupGiftBox();
        setupCustomizer();
        setupModalDismiss();
        applyConfigToDOM();

        const musicBtn = document.getElementById('music-btn');
        if (musicBtn) {
            musicBtn.addEventListener('click', toggleMusic);
        }
    });

})();
