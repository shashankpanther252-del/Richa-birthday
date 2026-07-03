/* ===== STATE ===== */
const state = {
  currentPage: 'welcome',
  galleryIndex: 0,
  galleryTimer: null,
  isPlaying: false,
  musicStarted: false,
  letterComplete: false,
  cakeVisible: false,
  celebrationActive: false,
  replaying: false,
  transitionLocked: false
};

/* ===== DOM REFS ===== */
const loadingScreen = document.getElementById('loading-screen');
const pages = document.querySelectorAll('.page');
const giftBox = document.getElementById('giftBox');
const giftLid = document.getElementById('giftLid');
const welcomeSection = document.getElementById('welcome');
const gallerySection = document.getElementById('gallery');
const letterSection = document.getElementById('letter');
const cakeSection = document.getElementById('cake');
const celebrationSection = document.getElementById('celebration');
const bgMusic = document.getElementById('bgMusic');
const galleryBg = document.getElementById('galleryBg');
const slides = document.querySelectorAll('.gallery-slide');
const progressFills = document.querySelectorAll('.progress-fill');
const galleryCurrentSpan = document.getElementById('galleryCurrent');
const letterBody = document.getElementById('letterBody');
const letterCursor = document.getElementById('letterCursor');
const cakeWrapper = document.querySelector('.cake-wrapper');
const cakeHeading = document.querySelector('.cake-heading');
const replayBtn = document.getElementById('replayBtn');
const floatingLights = document.getElementById('floatingLights');
const galleryNext = document.getElementById('galleryNext');
const galleryPrev = document.getElementById('galleryPrev');
const balloonsContainer = document.getElementById('balloonsContainer');
const heartsContainer = document.getElementById('heartsContainer');
const starsContainer = document.getElementById('starsContainer');
const sparklesContainer = document.getElementById('sparklesContainer');

/* ===== HELPER: PAGE TRANSITIONS ===== */
function transitionToPage(targetId) {
  if (state.transitionLocked) return;
  state.transitionLocked = true;

  const current = document.querySelector('.page.active');
  const target = document.getElementById(targetId);

  if (!current || !target || current === target) {
    state.transitionLocked = false;
    return;
  }
  // Exit current
  current.classList.remove('active');
  current.classList.add('exit-up');

  setTimeout(() => {
    current.classList.remove('exit-up');
    current.style.display = 'none';

    // Prepare target  
    target.style.display = 'flex';  
    target.classList.add('enter-up');  

    requestAnimationFrame(() => {  
      requestAnimationFrame(() => {  
        target.classList.add('active');  
        target.classList.remove('enter-up');  
        state.currentPage = targetId;  
        state.transitionLocked = false;  
      });  
    });

  }, 600);

  // Stop gallery timer if leaving gallery
  if (targetId !== 'gallery' && state.galleryTimer) {
    clearInterval(state.galleryTimer);
    state.galleryTimer = null;
  }
}

/* ===== LOADING SCREEN ===== */
function dismissLoading() {
  loadingScreen.classList.add('hidden');
  setTimeout(() => {
    loadingScreen.style.display = 'none';
  }, 800);
}

// Auto-dismiss loading after 3s
setTimeout(dismissLoading, 3000);

/* ===== AUDIO ===== */
function startMusic() {
  if (state.musicStarted) return;
  state.musicStarted = true;
  bgMusic.volume = 0.4;
  bgMusic.play().catch(() => {
    // Autoplay blocked, will retry on next interaction
  });
}
// Music starts on first tap anywhere
document.addEventListener('click', startMusic, { once: true });
document.addEventListener('touchstart', startMusic, { once: true });

/* ===== GIFT BOX ===== */
giftBox.addEventListener('click', function(e) {
  e.stopPropagation();
  if (giftLid.classList.contains('open')) return;

  giftLid.classList.add('open');

  // Start music on gift open
  startMusic();

  // Transition to gallery after animation
  setTimeout(() => {
    transitionToPage('gallery');
    initGallery();
  }, 1000);
});

/* ===== GALLERY ===== */
const TOTAL_SLIDES = 4;
const SLIDE_DURATION = 4000; // 4 seconds per photo

function initGallery() {
  state.galleryIndex = 0;
  showGallerySlide(0);
  startGalleryTimer();
}

function showGallerySlide(index) {
  // Update slides
  slides.forEach((slide, i) => {
    slide.classList.remove('active', 'exit');
    if (i === index) {
      slide.classList.add('active');
    }
  });

  // Update background blur
  const imgSrc = slides[index].querySelector('img').src;
  galleryBg.style.backgroundImage = `url(${imgSrc})`;

  // Update counter
  galleryCurrentSpan.textContent = index + 1;
}

function startGalleryTimer() {
  if (state.galleryTimer) clearInterval(state.galleryTimer);

  let elapsed = 0;
  const interval = 50; // update every 50ms for smooth progress bar

  state.galleryTimer = setInterval(() => {
    elapsed += interval;
    const progress = (elapsed / SLIDE_DURATION) * 100;

    // Update current progress bar  
    if (progressFills[state.galleryIndex]) {  
      progressFills[state.galleryIndex].style.width = Math.min(progress, 100) + '%';  
    }  

    if (elapsed >= SLIDE_DURATION) {  
      // Mark complete  
      if (progressFills[state.galleryIndex]) {  
        progressFills[state.galleryIndex].classList.add('complete');  
      }  
      advanceGallery();  
    }

  }, interval);
}

function advanceGallery() {
  if (state.galleryIndex < TOTAL_SLIDES - 1) {
    state.galleryIndex++;
    resetProgressBars();
    showGallerySlide(state.galleryIndex);
    startGalleryTimer();
  } else {
    // Gallery complete - transition to letter
    if (state.galleryTimer) {
      clearInterval(state.galleryTimer);
      state.galleryTimer = null;
    }
    setTimeout(() => {
  transitionToPage('letter');

  setTimeout(() => {
    startTypewriter();
  }, 700);
}, 500);
  }
}

function resetProgressBars() {
  progressFills.forEach((fill, i) => {
    if (i < state.galleryIndex) {
      fill.style.width = '100%';
      fill.classList.add('complete');
    } else if (i === state.galleryIndex) {
      fill.style.width = '0%';
      fill.classList.remove('complete');
    } else {
      fill.style.width = '0%';
      fill.classList.remove('complete');
    }
  });
}

// Manual navigation
galleryNext.addEventListener('click', function(e) {
  e.stopPropagation();
  if (state.galleryIndex < TOTAL_SLIDES - 1) {
    if (state.galleryTimer) clearInterval(state.galleryTimer);
    if (progressFills[state.galleryIndex]) {
      progressFills[state.galleryIndex].classList.add('complete');
      progressFills[state.galleryIndex].style.width = '100%';
    }
    advanceGallery();
  }
});

galleryPrev.addEventListener('click', function(e) {
  e.stopPropagation();
  if (state.galleryIndex > 0) {
    if (state.galleryTimer) clearInterval(state.galleryTimer);
    progressFills.forEach(f => { f.classList.remove('complete'); f.style.width = '0%'; });
    state.galleryIndex--;
    showGallerySlide(state.galleryIndex);
    startGalleryTimer();
  }
});

// Touch swipe for gallery
let touchStartX = 0;
let touchEndX = 0;

gallerySection.addEventListener('touchstart', function(e) {
  touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

gallerySection.addEventListener('touchend', function(e) {
  touchEndX = e.changedTouches[0].screenX;
  const diff = touchStartX - touchEndX;
  if (Math.abs(diff) > 50) {
    if (diff > 0) {
      galleryNext.click();
    } else {
      galleryPrev.click();
    }
  }
}, { passive: true });

/* ===== TYPEWRITER LETTER ===== */
const letterText = `Dear Richa,\n\nHappy Birthday!\n\nWe have never met, and you don't know me personally. That is completely okay.\n\nInstead of writing just another 'Happy Birthday' comment, I wanted to create something a little different — a small website made with time, effort, and genuine respect.\n\nYour journey has inspired me to work harder toward my own goals.\n\nOne moment that stayed with me was the interview where your father kissed you on the head and praised you. It reflected a beautiful bond and was genuinely heartwarming to watch.\n\nI have admired your performances since Mahabharat and I have also enjoyed watching your dance videos over the years.\n\nI simply hope this little surprise brings a smile to your face on your special day.\n\nWishing you happiness, good health, success, and many memorable moments ahead.\n\nA small birthday gift from Shashank Gupta ❤️`;

function startTypewriter() {
  letterBody.innerHTML = '';
  letterCursor.style.display = 'inline-block';
  state.letterComplete = false;

  // Split into paragraphs
  const paragraphs = letterText.split('\n\n');
  let totalChars = 0;
  paragraphs.forEach(p => totalChars += p.length);

  const typeSpeed = 30; // ms per character
  let charIndex = 0;
  let paraIndex = 0;
  let currentPara = 0;
  const paraElements = [];

  // Create paragraph elements
  paragraphs.forEach((text, i) => {
    const p = document.createElement('p');
    p.dataset.fullText = text;
    p.dataset.index = i;
    letterBody.appendChild(p);
    paraElements.push(p);
  });

  function typeNextChar() {
    if (state.currentPage !== 'letter') return;

    if (paraIndex >= paraElements.length) {  
      letterCursor.style.display = 'none';  
      state.letterComplete = true;  

      // Auto-transition to cake after a pause  
      setTimeout(() => {  
        if (state.currentPage === 'letter') {  
          transitionToPage('cake');  
          initCake();  
        }  
      }, 3000);  
      return;  
    }  

    const currentParaEl = paraElements[paraIndex];  
    const fullText = currentParaEl.dataset.fullText;  
    if (charIndex < fullText.length) {  
      // Type next character  
      const displayText = fullText.substring(0, charIndex + 1);  
      currentParaEl.innerHTML = displayText.replace(/\n/g, '<br>');  
      charIndex++;  
      setTimeout(typeNextChar, typeSpeed);  
    } else {  
      // Move to next paragraph  
      currentParaEl.style.opacity = '1';  
      charIndex = 0;  
      paraIndex++;  
      setTimeout(typeNextChar, typeSpeed * 4); // pause between paragraphs  
    }

  }

  // Start typing after a brief delay
  setTimeout(typeNextChar, 60);
}

/* ===== CAKE PAGE ===== */
function initCake() {
  state.cakeVisible = true;

  // Animate cake heading
  cakeHeading.style.opacity = '1';

  // Animate cake wrapper
  setTimeout(() => {
    cakeWrapper.classList.add('visible');
  }, 300);

  // Create floating lights
  createFloatingLights();

  // Auto-transition to celebration
  setTimeout(() => {
    if (state.currentPage === 'cake') {
      transitionToPage('celebration');
      initCelebration();
    }
  }, 6000);
}

function createFloatingLights() {
  floatingLights.innerHTML = '';
  const colors = ['#ff6b9d', '#c44dff', '#ffd700', '#ff9a9e', '#667eea', '#f5af19'];

  for (let i = 0; i < 30; i++) {
    const dot = document.createElement('div');
    dot.className = 'light-dot';
    const color = colors[Math.floor(Math.random() * colors.length)];
    const left = Math.random() * 100;
    const delay = Math.random() * 5;
    const duration = 3 + Math.random() * 4;
    const size = 3 + Math.random() * 5;
    dot.style.cssText = `  
      left: ${left}%;   bottom: ${10 + Math.random() * 30}%;   width: ${size}px;   height: ${size}px;   background: ${color};   box-shadow: 0 0 ${size * 2}px ${color};   animation-delay: ${delay}s;   animation-duration: ${duration}s;`;
    floatingLights.appendChild(dot);
  }
}

/* ===== CELEBRATION PAGE ===== */
function initCelebration() {
  if (state.celebrationActive && !state.replaying) return;
  state.celebrationActive = true;

  // Start canvases
  initFireworks();
  initConfetti();

  // Floating elements
  createFloatingBalloons();
  createFloatingHearts();
  createFloatingStars();
  createFloatingSparkles();

  // Ensure music is playing
  startMusic();
}

/* ===== FIREWORKS (Canvas) ===== */
let fireworksAnimId = null;

function initFireworks() {
  const canvas = document.getElementById('fireworksCanvas');
  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  let rockets = [];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Rocket {
    constructor() {
      const colors = ['#ff6b9d', '#c44dff', '#ffd700', '#ff9a9e', '#667eea', '#f5af19', '#ff4400', '#00d4ff'];
      this.x = Math.random() * width;
      this.y = height;
      this.targetY = 80 + Math.random() * (height * 0.4);
      this.speed = 3 + Math.random() * 4;
      this.angle = -Math.PI/2 + (Math.random() - 0.5) * 0.3;
      this.vx = Math.cos(this.angle) * this.speed;
      this.vy = Math.sin(this.angle) * this.speed;
      this.trail = [];
      this.alive = true;
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {  
      this.trail.push({ x: this.x, y: this.y });  
      if (this.trail.length > 8) this.trail.shift();  
      this.x += this.vx;  
      this.y += this.vy;  
      this.vy += 0.04;  
      if (this.y < this.targetY || this.vy > 0) {  
        this.alive = false;  
        this.explode();  
      }  
    }  

    explode() {  
      const count = 60 + Math.floor(Math.random() * 60);  
      const hue = Math.floor(Math.random() * 360);  
      for (let i = 0; i < count; i++) {  
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3;  
        const speed = 1.5 + Math.random() * 4;  
        particles.push({  
          x: this.x, y: this.y,  
          vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,  
          life: 1, decay: 0.008 + Math.random() * 0.012,  
          size: 2 + Math.random() * 3,  
          color: `hsl(${hue + Math.random() * 60 - 30}, 100%, ${60 + Math.random() * 30}%)`,  
          gravity: 0.02 + Math.random() * 0.02  
        });  
      }  
    }  

    draw(ctx) {  
      for (let i = 0; i < this.trail.length; i++) {  
        const alpha = i / this.trail.length;  
        ctx.beginPath();  
        ctx.arc(this.trail[i].x, this.trail[i].y, 2 * alpha, 0, Math.PI * 2);  
        ctx.fillStyle = `rgba(255,255,255,${alpha * 0.5})`;  
        ctx.fill();  
      }  
      ctx.beginPath();  
      ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);  
      ctx.fillStyle = 'rgba(255,255,255,0.8)';  
      ctx.fill();  
    }

  }

  let frameCount = 0;
  function animate() {
    if (state.currentPage !== 'celebration') {
      fireworksAnimId = requestAnimationFrame(animate);
      return;
    }

    ctx.fillStyle = 'rgba(10, 10, 18, 0.1)';  
    ctx.fillRect(0, 0, width, height);  

    frameCount++;  
    if (frameCount % 15 === 0 && rockets.length < 5) {  
      if (Math.random() < 0.4) rockets.push(new Rocket());  
    }  

    rockets = rockets.filter(r => r.alive);  
    rockets.forEach(r => { r.update(); if (r.alive) r.draw(ctx); });  

    particles = particles.filter(p => p.life > 0);  
    particles.forEach(p => {  
      p.x += p.vx;  
      p.y += p.vy;  
      p.vy += p.gravity;  
      p.vx *= 0.99;  
      p.life -= p.decay;  
      ctx.beginPath();  
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);  
      ctx.fillStyle = `hsla(${p.color.match(/hsl\(([^)]+)\)/)?.[1] || '0,100%,70%'}, ${p.life})`;  
      ctx.fill();  
    });  

    fireworksAnimId = requestAnimationFrame(animate);

  }

  ctx.clearRect(0, 0, width, height);
  animate();
}

/* ===== CONFETTI (Canvas) ===== */
let confettiAnimId = null;

function initConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  const ctx = canvas.getContext('2d');
  let width, height;
  let confettiPieces = [];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const colors = ['#ff6b9d', '#c44dff', '#ffd700', '#ff9a9e',
    '#667eea', '#f5af19', '#ff4400', '#00d4ff', '#50e3c2', '#e3a5ff'];

  function addConfetti(count) {
    for (let i = 0; i < count; i++) {
      confettiPieces.push({
        x: Math.random() * width, y: -20 - Math.random() * height * 0.5,
        w: 4 + Math.random() * 8, h: 4 + Math.random() * 6,
        vx: (Math.random() - 0.5) * 2, vy: 1 + Math.random() * 3,
        rotation: Math.random() * 360, rotSpeed: (Math.random() - 0.5) * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: 0.7 + Math.random() * 0.3,
        swing: Math.random() * 2, swingSpeed: 0.02 + Math.random() * 0.03,
        swingOffset: Math.random() * Math.PI * 2
      });
    }
  }

  addConfetti(200);

  function animate() {
    if (state.currentPage !== 'celebration') {
      confettiAnimId = requestAnimationFrame(animate);
      return;
    }

    ctx.clearRect(0, 0, width, height);  

    if (Math.random() < 0.1) addConfetti(10);  

    confettiPieces = confettiPieces.filter(p => p.y < height + 50);  

    confettiPieces.forEach(p => {  
      p.x += p.vx + Math.sin(p.swingOffset + Date.now() * p.swingSpeed) * p.swing;  
      p.y += p.vy;  
      p.rotation += p.rotSpeed;  

      ctx.save();  
      ctx.translate(p.x, p.y);  
      ctx.rotate(p.rotation * Math.PI / 180);  
      ctx.globalAlpha = p.opacity;  
      ctx.fillStyle = p.color;  
      ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);  
      ctx.restore();  
    });  

    confettiAnimId = requestAnimationFrame(animate);

  }

  animate();
}

/* ===== FLOATING BALLOONS ===== */
function createFloatingBalloons() {
  balloonsContainer.innerHTML = '';
  const emojis = ['🎈', '🎈', '🎈', '🎈'];
  for (let i = 0; i < 12; i++) {
    const balloon = document.createElement('div');
    balloon.className = 'floating-balloon';
    balloon.textContent = emojis[i % emojis.length];
    balloon.style.left = Math.random() * 90 + '%';
    balloon.style.animationDelay = Math.random() * 8 + 's';
    balloon.style.animationDuration = (5 + Math.random() * 4) + 's';
    balloon.style.fontSize = (1.5 + Math.random() * 1.5) + 'rem';
    balloonsContainer.appendChild(balloon);
  }
}

/* ===== FLOATING HEARTS ===== */
function createFloatingHearts() {
  heartsContainer.innerHTML = '';
  for (let i = 0; i < 15; i++) {
    const heart = document.createElement('div');
    heart.className = 'floating-heart';
    heart.textContent = '❤️';
    heart.style.left = Math.random() * 95 + '%';
    heart.style.animationDelay = Math.random() * 6 + 's';
    heart.style.animationDuration = (4 + Math.random() * 3) + 's';
    heartsContainer.appendChild(heart);
  }
}

/* ===== FLOATING STARS ===== */
function createFloatingStars() {
  starsContainer.innerHTML = '';
  const starShapes = ['⭐', '✨', '🌟', '⭐'];
  for (let i = 0; i < 15; i++) {
    const star = document.createElement('div');
    star.className = 'floating-star';
    star.textContent = starShapes[i % starShapes.length];
    star.style.left = Math.random() * 95 + '%';
    star.style.fontSize = (0.8 + Math.random() * 1.2) + 'rem';
    star.style.animationDelay = Math.random() * 7 + 's';
    star.style.animationDuration = (5 + Math.random() * 4) + 's';
    starsContainer.appendChild(star);
  }
}

/* ===== FLOATING SPARKLES ===== */
function createFloatingSparkles() {
  sparklesContainer.innerHTML = '';
  for (let i = 0; i < 25; i++) {
    const sparkle = document.createElement('div');
    sparkle.className = 'floating-sparkle';
    sparkle.style.left = Math.random() * 98 + '%';
    sparkle.style.animationDelay = Math.random() * 5 + 's';
    sparkle.style.animationDuration = (3 + Math.random() * 3) + 's';
    sparkle.style.width = sparkle.style.height = (2 + Math.random() * 4) + 'px';
    const colors = ['#ffd700', '#ff6b9d', '#c44dff', '#fff', '#00d4ff'];
    sparkle.style.background = colors[Math.floor(Math.random() * colors.length)];
    sparkle.style.boxShadow = `0 0 ${6 + Math.random() * 6}px ${sparkle.style.background}`;
    sparklesContainer.appendChild(sparkle);
  }
}

/* ===== REPLAY ===== */
replayBtn.addEventListener('click', function() {
  state.replaying = true;

  celebrationSection.classList.remove('active');
  celebrationSection.classList.add('exit-up');

  setTimeout(() => {
    // Reset all states to initial
    state.currentPage = 'welcome';
    state.galleryIndex = 0;
    state.isPlaying = false;
    state.musicStarted = false;
    state.letterComplete = false;
    state.cakeVisible = false;
    state.celebrationActive = false;
    state.replaying = false;
    state.transitionLocked = false;

    // Clear intervals/animations
    if (state.galleryTimer) clearInterval(state.galleryTimer);
    if (fireworksAnimId) cancelAnimationFrame(fireworksAnimId);
    if (confettiAnimId) cancelAnimationFrame(confettiAnimId);

    // Reset elements
    pages.forEach(page => {
      page.classList.remove('active', 'exit-up', 'enter-up');
      page.style.display = 'none';
    });
    welcomeSection.style.display = 'flex';
    welcomeSection.classList.add('active');

    giftLid.classList.remove('open');
    letterBody.innerHTML = '';
    letterCursor.style.display = 'inline-block';
    cakeWrapper.classList.remove('visible');
    cakeHeading.style.opacity = '0';
    floatingLights.innerHTML = '';
    balloonsContainer.innerHTML = '';
    heartsContainer.innerHTML = '';
    starsContainer.innerHTML = '';
    sparklesContainer.innerHTML = '';

    // Reset progress bars
    progressFills.forEach(fill => {
      fill.style.width = '0%';
      fill.classList.remove('complete');
    });
    galleryCurrentSpan.textContent = '1';

    // Stop and reset music
    bgMusic.pause();
    bgMusic.currentTime = 0;

    // Re-attach initial event listeners if they were removed with { once: true }
    document.removeEventListener('click', startMusic);
    document.removeEventListener('touchstart', startMusic);
    document.addEventListener('click', startMusic, { once: true });
    document.addEventListener('touchstart', startMusic, { once: true });

    // Dismiss loading screen if it somehow reappears
    loadingScreen.classList.add('hidden');
    setTimeout(() => {
      loadingScreen.style.display = 'none';
    }, 800);

  }, 800); // Match exit-up transition duration
});
