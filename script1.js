 /* =========================================================
   Happy Birthday Richa Mukherjee — Interactions
   ========================================================= */

(function () {
  'use strict';

  // ---------- Config ----------
  const PHOTOS = [
    { src: 'photo1.jpg', caption: 'Radiance, in gold ✦' },
    { src: 'photo2.jpg', caption: 'Grace in every frame' },
    { src: 'photo3.jpg', caption: 'That smile — pure sunshine' },
    { src: 'photo4.jpg', caption: 'Effortless elegance' }
  ];
  const STORY_DURATION_MS = 4000;

  const LETTER_TEXT =
`Dear Richa,

Happy Birthday!

We have never met, and you don't know me personally. That is completely okay.

Instead of writing just another 'Happy Birthday' comment, I wanted to create something a little different — a small website made with time, effort, and genuine respect.

Your journey has inspired me to work harder toward my own goals.

One moment that stayed with me was the interview where your father kissed you on the head and praised you. It reflected a beautiful bond and was genuinely heartwarming to watch.

I have admired your performances since Mahabharat, and I have also enjoyed watching your dance videos over the years.

I simply hope this little surprise brings a smile to your face on your special day.

Wishing you happiness, good health, success, and many memorable moments ahead.

— A small birthday gift from Shashank Gupta ♥`;

  // ---------- Utilities ----------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const rand = (a, b) => Math.random() * (b - a) + a;

  const screens = {
    loader: $('#screen-loader'),
    welcome: $('#screen-welcome'),
    gift: $('#screen-gift'),
    gallery: $('#screen-gallery'),
    letter: $('#screen-letter'),
    cake: $('#screen-cake'),
    celebrate: $('#screen-celebrate'),
  };

  let currentScreen = 'loader';
  function show(name) {
    if (currentScreen === name) return;
    const from = screens[currentScreen];
    const to = screens[name];
    if (from) from.classList.remove('active');
    if (to) {
      // small delay so exit transition can start
      setTimeout(() => to.classList.add('active'), 60);
    }
    currentScreen = name;
    onEnter(name);
  }

  function onEnter(name) {
    if (name === 'welcome') { /* nothing yet */ }
    if (name === 'gift') { resetGift(); }
    if (name === 'gallery') { startStory(); }
    if (name === 'letter') { startTypewriter(); }
    if (name === 'cake') { startCake(); }
    if (name === 'celebrate') { startCelebration(); }
    else { stopCelebration(); }
  }

  // ---------- Music ----------
  const audio = $('#bg-music');
  audio.volume = 0.55;
  const musicBtn = $('#music-toggle');
  let musicStarted = false;
  let musicMuted = false;

  function tryPlayMusic() {
    if (musicStarted) return;
    audio.play().then(() => {
      musicStarted = true;
      musicBtn.classList.remove('muted');
    }).catch(() => { /* wait for user gesture */ });
  }
  musicBtn.addEventListener('click', () => {
    if (!musicStarted) {
      audio.play().then(() => {
        musicStarted = true; musicMuted = false;
        musicBtn.classList.remove('muted');
      }).catch(() => {});
      return;
    }
    musicMuted = !musicMuted;
    audio.muted = musicMuted;
    musicBtn.classList.toggle('muted', musicMuted);
  });
  // start visually muted until interaction
  musicBtn.classList.add('muted');

  // ---------- 1. LOADER ----------
  window.addEventListener('load', () => {
    setTimeout(() => show('welcome'), 2400);
  });

  // ---------- 2. WELCOME ----------
  $('#btn-open-surprise').addEventListener('click', () => {
    tryPlayMusic();
    show('gift');
  });

  // ---------- 3. GIFT ----------
  const giftBox = $('#gift-box');
  const giftBurst = $('#gift-burst');
  const giftHint = $('#gift-hint');

  function resetGift() {
    giftBox.classList.remove('opening');
    giftBurst.innerHTML = '';
    giftHint.style.opacity = '';
  }
  giftBox.addEventListener('click', () => {
    if (giftBox.classList.contains('opening')) return;
    tryPlayMusic();
    // build burst
    const colors = ['#f0d8a3', '#e79aa8', '#fdf3d9', '#d4a24c', '#ff7896'];
    for (let i = 0; i < 22; i++) {
      const b = document.createElement('span');
      b.className = 'b';
      const ang = (Math.PI * 2 * i) / 22 + rand(-0.1, 0.1);
      const dist = rand(90, 160);
      b.style.setProperty('--x', `${Math.cos(ang) * dist}px`);
      b.style.setProperty('--y', `${Math.sin(ang) * dist}px`);
      b.style.background = colors[i % colors.length];
      b.style.animationDelay = `${rand(0, 0.15)}s`;
      giftBurst.appendChild(b);
    }
    giftBox.classList.add('opening');
    giftHint.style.opacity = '0';
    setTimeout(() => show('gallery'), 1500);
  });

  // ---------- 4. GALLERY (IG Stories) ----------
  const storyStage = $('#story-stage');
  const storyProgress = $('#story-progress');
  const storyBg = $('#story-bg');
  let storyIndex = 0;
  let storyTimer = null;
  let storyActive = false;

  // build slides
  PHOTOS.forEach((p, i) => {
    const slide = document.createElement('div');
    slide.className = 'story-slide';
    slide.dataset.idx = i;
    slide.innerHTML = `
      <img src=\"${p.src}\" alt=\"Richa photo ${i + 1}\" draggable=\"false\" />
      <div class=\"story-slide-caption\">${p.caption}</div>
    `;
    storyStage.appendChild(slide);

    const sp = document.createElement('div');
    sp.className = 'sp-item';
    sp.innerHTML = '<span class=\"sp-fill\"></span>';
    sp.style.setProperty('--sp-dur', `${STORY_DURATION_MS}ms`);
    storyProgress.appendChild(sp);
  });

  function setStoryIndex(i) {
    const slides = $$('.story-slide', storyStage);
    const progs = $$('.sp-item', storyProgress);
    slides.forEach((s, idx) => s.classList.toggle('active', idx === i));
    progs.forEach((p, idx) => {
      p.classList.remove('active', 'done');
      const fill = $('.sp-fill', p);
      fill.style.transition = 'none';
      fill.style.width = '0%';
      if (idx < i) p.classList.add('done');
    });
    // force reflow
    void storyProgress.offsetWidth;
    if (progs[i]) {
      const fill = $('.sp-fill', progs[i]);
      fill.style.transition = `width ${STORY_DURATION_MS}ms linear`;
      progs[i].classList.add('active');
    }
    // background blur = current image
    storyBg.style.backgroundImage = `url(\"${PHOTOS[i].src}\")`;
  }

  function startStory() {
    storyActive = true;
    storyIndex = 0;
    setStoryIndex(0);
    scheduleNextStory();
  }
  function scheduleNextStory() {
    clearTimeout(storyTimer);
    storyTimer = setTimeout(() => {
      if (!storyActive) return;
      storyIndex++;
      if (storyIndex >= PHOTOS.length) {
        storyActive = false;
        show('letter');
        return;
      }
      setStoryIndex(storyIndex);
      scheduleNextStory();
    }, STORY_DURATION_MS);
  }
  $('#story-prev').addEventListener('click', () => {
    if (!storyActive) return;
    storyIndex = Math.max(0, storyIndex - 1);
    setStoryIndex(storyIndex);
    scheduleNextStory();
  });
  $('#story-next').addEventListener('click', () => {
    if (!storyActive) return;
    storyIndex++;
    if (storyIndex >= PHOTOS.length) {
      storyActive = false;
      show('letter');
      return;
    }
    setStoryIndex(storyIndex);
    scheduleNextStory();
  });

  // ---------- 5. LETTER (typewriter) ----------
  const twEl = $('#typewriter');
  const twCursor = $('#type-cursor');
  const letterBtn = $('#btn-letter-next');
  let twTimer = null;
  let twStarted = false;

  function startTypewriter() {
    if (twStarted) return;
    twStarted = true;
    twEl.textContent = '';
    letterBtn.hidden = true;
    letterBtn.classList.remove('visible');
    let i = 0;
    const total = LETTER_TEXT.length;
    function step() {
      if (i >= total) {
        letterBtn.hidden = false;
        letterBtn.classList.add('visible');
        twCursor.style.opacity = '0.4';
        return;
      }
      const ch = LETTER_TEXT[i++];
      twEl.textContent += ch;
      let delay = 26;
      if (ch === ',' ) delay = 120;
      else if (ch === '.') delay = 200;
      else if (ch === '\n') delay = 260;
      else if (ch === ' ') delay = 22;
      twTimer = setTimeout(step, delay);
    }
    step();
  }
  letterBtn.addEventListener('click', () => show('cake'));

  // Allow tap on letter to skip typing
  $('#screen-letter').addEventListener('click', (e) => {
    if (e.target.closest('#btn-letter-next')) return;
    if (twStarted && letterBtn.hidden) {
      clearTimeout(twTimer);
      twEl.textContent = LETTER_TEXT;
      letterBtn.hidden = false;
      letterBtn.classList.add('visible');
      twCursor.style.opacity = '0.4';
    }
  });

  // ---------- 6. CAKE ----------
  const flame = $('#flame');
  const floatingLights = $('#floating-lights');
  let lightsInterval = null;
  let cakeStarted = false;

  function spawnLight() {
    const fl = document.createElement('span');
    fl.className = 'fl';
    fl.style.left = `${rand(10, 90)}%`;
    fl.style.animationDuration = `${rand(4, 7)}s`;
    fl.style.animationDelay = `${rand(0, 1)}s`;
    fl.style.transform = `scale(${rand(.6, 1.3)})`;
    floatingLights.appendChild(fl);
    setTimeout(() => fl.remove(), 8000);
  }
  function startCake() {
    if (cakeStarted) return;
    cakeStarted = true;
    for (let i = 0; i < 6; i++) spawnLight();
    lightsInterval = setInterval(spawnLight, 500);
  }
  flame.addEventListener('click', () => {
    if (flame.classList.contains('out')) return;
    flame.classList.add('out');
    setTimeout(() => show('celebrate'), 900);
  });
  $('#btn-cake-next').addEventListener('click', () => show('celebrate'));

  // ---------- 7. CELEBRATION ----------
  const confettiLayer = $('#confetti-layer');
  const balloonsLayer = $('#balloons-layer');
  const heartsLayer = $('#hearts-layer');
  const starsLayer = $('#stars-layer');
  const sparklesLayer = $('#sparkles-layer');
  const fwCanvas = $('#fireworks-canvas');
  let fwCtx = null;
  let fwRaf = null;
  let fwParticles = [];
  let fwLaunchTimer = null;
  let floaterTimers = [];
  let celebrationRunning = false;

  function buildConfetti() {
    confettiLayer.innerHTML = '';
    const colors = ['#f0d8a3', '#e79aa8', '#fdf3d9', '#d4a24c', '#ff7896', '#b9536e', '#f4c1c9'];
    for (let i = 0; i < 90; i++) {
      const s = document.createElement('span');
      s.style.left = `${rand(0, 100)}%`;
      s.style.background = colors[i % colors.length];
      s.style.width = `${rand(6, 12)}px`;
      s.style.height = `${rand(10, 18)}px`;
      s.style.borderRadius = Math.random() < .3 ? '50%' : '2px';
      s.style.animationDuration = `${rand(4, 8)}s`;
      s.style.animationDelay = `${rand(0, 6)}s`;
      s.style.transform = `rotate(${rand(0, 360)}deg)`;
      confettiLayer.appendChild(s);
    }
  }
  function buildBalloons() {
    balloonsLayer.innerHTML = '';
    const palettes = [
      ['#f7d8d0', '#d97a8a'],
      ['#f0d8a3', '#b9814a'],
      ['#f4c1c9', '#b9536e'],
      ['#fdf3d9', '#e6be7a'],
      ['#e79aa8', '#7a1e3a'],
    ];
    for (let i = 0; i < 10; i++) {
      const b = document.createElement('div');
      b.className = 'balloon';
      const p = palettes[i % palettes.length];
      b.style.setProperty('--c1', p[0]);
      b.style.setProperty('--c2', p[1]);
      b.style.left = `${rand(4, 92)}%`;
      b.style.animationDuration = `${rand(9, 16)}s`;
      b.style.animationDelay = `${rand(0, 8)}s`;
      b.style.transform = `scale(${rand(.7, 1.15)})`;
      balloonsLayer.appendChild(b);
    }
  }
  function buildFloaters(layer, symbol, count) {
    layer.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const el = document.createElement('span');
      el.className = 'f';
      el.textContent = symbol;
      el.style.left = `${rand(0, 100)}%`;
      el.style.fontSize = `${rand(14, 28)}px`;
      el.style.animationDuration = `${rand(8, 14)}s`;
      el.style.animationDelay = `${rand(0, 8)}s`;
      layer.appendChild(el);
    }
  }
  function buildSparkles() {
    sparklesLayer.innerHTML = '';
    for (let i = 0; i < 60; i++) {
      const s = document.createElement('span');
      s.className = 'sp';
      s.style.left = `${rand(0, 100)}%`;
      s.style.top = `${rand(0, 100)}%`;
      s.style.animationDelay = `${rand(0, 3)}s`;
      s.style.animationDuration = `${rand(1.4, 3)}s`;
      sparklesLayer.appendChild(s);
    }
  }

  // Fireworks canvas
  function initFireworks() {
    fwCtx = fwCanvas.getContext('2d');
    const resize = () => {
      fwCanvas.width = window.innerWidth * devicePixelRatio;
      fwCanvas.height = window.innerHeight * devicePixelRatio;
      fwCanvas.style.width = window.innerWidth + 'px';
      fwCanvas.style.height = window.innerHeight + 'px';
      fwCtx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);
  }
  function launchFirework() {
    const w = window.innerWidth, h = window.innerHeight;
    const x = rand(w * 0.15, w * 0.85);
    const y = rand(h * 0.15, h * 0.55);
    const hue = Math.floor(rand(0, 360));
    const particles = Math.floor(rand(60, 110));
    for (let i = 0; i < particles; i++) {
      const angle = (Math.PI * 2 * i) / particles;
      const speed = rand(1.5, 5.5);
      fwParticles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: rand(0.008, 0.02),
        color: `hsl(${hue + rand(-15, 15)}, 90%, ${rand(55, 75)}%)`,
        size: rand(1.5, 3),
      });
    }
  }
  function fwFrame() {
    if (!celebrationRunning) return;
    const w = window.innerWidth, h = window.innerHeight;
    fwCtx.fillStyle = 'rgba(10, 5, 8, 0.18)';
    fwCtx.fillRect(0, 0, w, h);
    fwCtx.globalCompositeOperation = 'lighter';
    for (let i = fwParticles.length - 1; i >= 0; i--) {
      const p = fwParticles[i];
      p.vx *= 0.985;
      p.vy = p.vy * 0.985 + 0.03; // gravity
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      if (p.life <= 0) { fwParticles.splice(i, 1); continue; }
      fwCtx.globalAlpha = Math.max(0, p.life);
      fwCtx.fillStyle = p.color;
      fwCtx.beginPath();
      fwCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      fwCtx.fill();
    }
    fwCtx.globalAlpha = 1;
    fwCtx.globalCompositeOperation = 'source-over';
    fwRaf = requestAnimationFrame(fwFrame);
  }

  function startCelebration() {
    if (celebrationRunning) return;
    celebrationRunning = true;
    if (!fwCtx) initFireworks();
    buildConfetti();
    buildBalloons();
    buildFloaters(heartsLayer, '♥', 14);
    buildFloaters(starsLayer, '✦', 14);
    buildSparkles();
    fwParticles = [];
    launchFirework();
    fwLaunchTimer = setInterval(launchFirework, 900);
    fwFrame();
    tryPlayMusic();
  }
  function stopCelebration() {
    celebrationRunning = false;
    clearInterval(fwLaunchTimer);
    cancelAnimationFrame(fwRaf);
    fwParticles = [];
  }

  $('#btn-replay').addEventListener('click', () => {
    // reset state
    stopCelebration();
    twStarted = false;
    cakeStarted = false;
    clearInterval(lightsInterval);
    floatingLights.innerHTML = '';
    flame.classList.remove('out');
    resetGift();
    show('welcome');
  });

  // Any first interaction attempts to start music
  document.addEventListener('click', tryPlayMusic, { once: true });
  document.addEventListener('touchstart', tryPlayMusic, { once: true, passive: true });

})();
"
Observation: Create successful: /app/frontend/public/birthday/script.js