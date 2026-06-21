// ============================================
// 父亲节快乐 · 2026 · 点击贺卡翻开
// ============================================

(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;

  // --------------------------------------------
  // 鼠标光晕
  // --------------------------------------------
  const glow = document.getElementById('cursorGlow');
  if (glow && isFinePointer && !reduceMotion) {
    let mx = innerWidth / 2, my = innerHeight / 2;
    let gx = mx, gy = my;
    let active = false;
    addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      if (!active) { active = true; glow.style.opacity = '1'; }
    });
    addEventListener('mouseleave', () => { glow.style.opacity = '0'; active = false; });
    (function tick() {
      gx += (mx - gx) * 0.15; gy += (my - gy) * 0.15;
      glow.style.transform = `translate(${gx}px, ${gy}px) translate(-50%, -50%)`;
      requestAnimationFrame(tick);
    })();
  }

  // --------------------------------------------
  // 粒子系统
  // --------------------------------------------
  const canvas = document.getElementById('particles');
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, particles = [];
  const FLOAT_COUNT = innerWidth < 768 ? 30 : 55;

  const COLORS = [
    'rgba(212, 160, 23, ',
    'rgba(200, 118, 26, ',
    'rgba(181, 74, 42, ',
    'rgba(245, 222, 179, '
  ];

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function spawnFloat(initial) {
    return {
      type: 'float',
      x: Math.random() * W,
      y: initial ? Math.random() * H : H + 20,
      r: Math.random() * 2.2 + 0.6,
      vy: -(Math.random() * 0.5 + 0.15),
      vx: (Math.random() - 0.5) * 0.3,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: Math.random() * 0.02 + 0.005,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: Math.random() * 0.5 + 0.2,
      twinkle: Math.random() * Math.PI * 2,
      twinkleSpeed: Math.random() * 0.04 + 0.01,
      gravity: 0, decay: 0
    };
  }

  function spawnBurst(x, y, opts) {
    const angle = opts.angle != null ? opts.angle : Math.random() * Math.PI * 2;
    const speed = opts.minSpeed + Math.random() * (opts.maxSpeed - opts.minSpeed);
    return {
      type: 'burst',
      x: x, y: y,
      r: Math.random() * (opts.maxR || 3) + (opts.minR || 1),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (opts.upBias || 0),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: 1,
      decay: Math.random() * 0.012 + 0.006,
      gravity: opts.gravity != null ? opts.gravity : 0.08,
      sway: 0, swaySpeed: 0, twinkle: 0, twinkleSpeed: 0
    };
  }

  function initFloat() {
    particles = particles.filter(p => p.type === 'burst');
    for (let i = 0; i < FLOAT_COUNT; i++) particles.push(spawnFloat(true));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      if (p.type === 'float') {
        p.sway += p.swaySpeed;
        p.twinkle += p.twinkleSpeed;
        p.x += p.vx + Math.sin(p.sway) * 0.3;
        p.y += p.vy;
        if (p.y < -20 || p.x < -20 || p.x > W + 20) {
          particles[i] = spawnFloat(false);
          continue;
        }
        const flicker = (Math.sin(p.twinkle) + 1) * 0.5;
        const a = p.alpha * (0.5 + flicker * 0.5);
        drawGlow(p.x, p.y, p.r, p.color, a);
      } else {
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
        if (p.alpha <= 0 || p.y > H + 40) {
          particles.splice(i, 1);
          continue;
        }
        drawGlow(p.x, p.y, p.r, p.color, Math.max(0, p.alpha));
      }
    }
    requestAnimationFrame(draw);
  }

  function drawGlow(x, y, r, color, a) {
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
    grad.addColorStop(0, color + a + ')');
    grad.addColorStop(1, color + '0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r * 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = color + Math.min(1, a + 0.3) + ')';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  if (!reduceMotion) {
    resize(); initFloat(); draw();
    addEventListener('resize', () => { resize(); initFloat(); });
  }

  function burstAt(x, y, count, opts) {
    opts = opts || {};
    for (let i = 0; i < count; i++) {
      particles.push(spawnBurst(x, y, {
        angle: (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3,
        minSpeed: opts.minSpeed || 2,
        maxSpeed: opts.maxSpeed || 7,
        minR: 1, maxR: 3.5,
        gravity: opts.gravity != null ? opts.gravity : 0.06,
        upBias: opts.upBias || 0
      }));
    }
  }

  function fireworkAt(x, y) {
    for (let i = 0; i < 8; i++) {
      particles.push(spawnBurst(x, y, {
        angle: -Math.PI / 2 + (Math.random() - 0.5) * 0.4,
        minSpeed: 4, maxSpeed: 8,
        minR: 1, maxR: 2,
        gravity: 0.12, upBias: 0
      }));
    }
    setTimeout(() => {
      burstAt(x, y - 80, 28, { minSpeed: 2, maxSpeed: 6, gravity: 0.07 });
    }, 300);
  }

  // --------------------------------------------
  // 开卡流程：点击贺卡直接翻开
  // --------------------------------------------
  const card = document.getElementById('card');
  const hint = document.getElementById('hint');
  const rays = document.getElementById('rays');
  const flash = document.getElementById('flash');
  const insideEyebrow = document.getElementById('insideEyebrow');
  const cardUnderline = document.getElementById('cardUnderline');
  const insideFoot = document.getElementById('insideFoot');
  const titleChars = document.querySelectorAll('.title__char');

  let opened = false;

  card.addEventListener('click', () => {
    if (opened) return;
    opened = true;
    openCard();
  });

  function openCard() {
    // 1. 隐藏提示
    hint.classList.add('is-hidden');

    // 2. 贺卡翻开
    card.classList.add('is-open');

    const cardRect = card.getBoundingClientRect();
    const cx = cardRect.left + cardRect.width / 2;
    const cy = cardRect.top + cardRect.height / 2;

    // 3. 翻开瞬间特效
    flash.classList.add('is-active');
    setTimeout(() => flash.classList.remove('is-active'), 900);

    rays.classList.add('is-active');
    setTimeout(() => rays.classList.remove('is-active'), 1800);

    // 主爆发
    burstAt(cx, cy, 60, { minSpeed: 3, maxSpeed: 10, gravity: 0.05 });
    setTimeout(() => burstAt(cx, cy, 35, { minSpeed: 2, maxSpeed: 7, gravity: 0.04 }), 300);

    // 烟花
    setTimeout(() => fireworkAt(cx - 150, cy - 80), 450);
    setTimeout(() => fireworkAt(cx + 150, cy - 80), 600);
    setTimeout(() => fireworkAt(cx, cy - 140), 800);

    // 持续小喷发
    let pulseCount = 0;
    const pulseTimer = setInterval(() => {
      burstAt(cx, cy, 14, { minSpeed: 1.5, maxSpeed: 4, gravity: 0.05 });
      pulseCount++;
      if (pulseCount >= 5) clearInterval(pulseTimer);
    }, 450);

    // 4. 逐字显示"父亲节快乐"（用 transition + class，永久保留）
    // 翻开动画 1.5s，等翻开过半开始显字
    titleChars.forEach((ch) => {
      const i = parseInt(ch.dataset.i, 10);
      const delay = 700 + i * 130; // 0.7s 开始，每字间隔 0.13s
      setTimeout(() => {
        ch.classList.add('is-shown');
      }, delay);
    });

    // 5. 副标、下划线、日期依次显示
    setTimeout(() => insideEyebrow.classList.add('is-shown'), 600);
    setTimeout(() => cardUnderline.classList.add('is-shown'), 700 + titleChars.length * 130 + 200);
    setTimeout(() => insideFoot.classList.add('is-shown'), 700 + titleChars.length * 130 + 400);
  }

  // --------------------------------------------
  // 视差
  // --------------------------------------------
  const ringsBg = document.querySelector('.bg-rings');
  const sunBg = document.querySelector('.bg-sun');
  if (isFinePointer && !reduceMotion) {
    addEventListener('mousemove', (e) => {
      const x = (e.clientX / innerWidth - 0.5) * 2;
      const y = (e.clientY / innerHeight - 0.5) * 2;
      if (ringsBg) ringsBg.style.transform = `translate(calc(-50% + ${x * 18}px), calc(-50% + ${y * 18}px))`;
      if (sunBg) sunBg.style.transform = `translateX(calc(-50% + ${x * 30}px)) translateY(${y * 20}px)`;
    });
  }

  // --------------------------------------------
  // 控制台彩蛋
  // --------------------------------------------
  console.log('%c父亲节快乐。', 'font-size: 22px; font-weight: bold; color: #b54a2a; font-family: serif; padding: 8px;');
  console.log('%c2026.06.21', 'font-size: 12px; color: #9c5410; font-family: monospace; letter-spacing: 0.2em; padding: 4px;');
})();
