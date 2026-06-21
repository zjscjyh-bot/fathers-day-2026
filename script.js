// ============================================
// 父亲节快乐 · 2026 · 交互与特效
// ============================================

(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;

  // --------------------------------------------
  // 1. 鼠标光晕跟随
  // --------------------------------------------
  const glow = document.getElementById('cursorGlow');
  if (glow && isFinePointer && !reduceMotion) {
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let gx = mx;
    let gy = my;
    let active = false;

    window.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
      if (!active) {
        active = true;
        glow.style.opacity = '1';
      }
    });

    window.addEventListener('mouseleave', () => {
      glow.style.opacity = '0';
      active = false;
    });

    function tickGlow() {
      gx += (mx - gx) * 0.15;
      gy += (my - gy) * 0.15;
      glow.style.transform = `translate(${gx}px, ${gy}px) translate(-50%, -50%)`;
      requestAnimationFrame(tickGlow);
    }
    tickGlow();
  }

  // --------------------------------------------
  // 2. 粒子系统：飘升的光点
  // --------------------------------------------
  const canvas = document.getElementById('particles');
  const ctx = canvas.getContext('2d');
  let W = 0;
  let H = 0;
  let particles = [];
  const PARTICLE_COUNT = window.innerWidth < 768 ? 35 : 70;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  const COLORS = [
    'rgba(212, 160, 23, ', // gold
    'rgba(200, 118, 26, ', // amber
    'rgba(181, 74, 42, ',  // terracotta
    'rgba(245, 222, 179, ' // cornsilk
  ];

  function spawn(initial) {
    return {
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
      twinkleSpeed: Math.random() * 0.04 + 0.01
    };
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(spawn(true));
    }
  }

  function drawParticles() {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.sway += p.swaySpeed;
      p.twinkle += p.twinkleSpeed;
      p.x += p.vx + Math.sin(p.sway) * 0.3;
      p.y += p.vy;

      // 回收
      if (p.y < -20 || p.x < -20 || p.x > W + 20) {
        particles[i] = spawn(false);
        continue;
      }

      const flicker = (Math.sin(p.twinkle) + 1) * 0.5;
      const a = p.alpha * (0.5 + flicker * 0.5);

      // 光晕
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
      grad.addColorStop(0, p.color + a + ')');
      grad.addColorStop(1, p.color + '0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
      ctx.fill();

      // 核心点
      ctx.fillStyle = p.color + Math.min(1, a + 0.3) + ')';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(drawParticles);
  }

  if (!reduceMotion) {
    resize();
    initParticles();
    drawParticles();
    window.addEventListener('resize', () => {
      resize();
      initParticles();
    });
  }

  // --------------------------------------------
  // 3. 点击产生波纹 + 粒子爆发
  // --------------------------------------------
  function burstAt(x, y) {
    if (reduceMotion) return;
    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: 10px;
      height: 10px;
      border: 1.5px solid rgba(181, 74, 42, 0.8);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
      z-index: 998;
      animation: rippleOut 0.9s ease-out forwards;
    `;
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 900);

    // 临时粒子爆发
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12;
      const speed = Math.random() * 3 + 2;
      particles.push({
        x: x,
        y: y,
        r: Math.random() * 2 + 1,
        vy: Math.sin(angle) * speed,
        vx: Math.cos(angle) * speed,
        sway: 0,
        swaySpeed: 0.02,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: 0.9,
        twinkle: 0,
        twinkleSpeed: 0.05
      });
      // 控制总数，避免无限增长
      if (particles.length > PARTICLE_COUNT + 60) {
        particles.shift();
      }
    }
  }

  // 动态注入 ripple 关键帧
  const style = document.createElement('style');
  style.textContent = `
    @keyframes rippleOut {
      0% { width: 10px; height: 10px; opacity: 0.9; border-width: 2px; }
      100% { width: 220px; height: 220px; opacity: 0; border-width: 0.5px; }
    }
  `;
  document.head.appendChild(style);

  document.addEventListener('click', (e) => {
    burstAt(e.clientX, e.clientY);
  });

  // --------------------------------------------
  // 4. 标题字符：鼠标悬停联动光晕放大
  // --------------------------------------------
  const chars = document.querySelectorAll('.title__char');
  chars.forEach((c) => {
    c.addEventListener('mouseenter', () => {
      if (glow && isFinePointer) {
        glow.style.width = '320px';
        glow.style.height = '320px';
      }
    });
    c.addEventListener('mouseleave', () => {
      if (glow && isFinePointer) {
        glow.style.width = '240px';
        glow.style.height = '240px';
      }
    });
  });

  // --------------------------------------------
  // 5. 视差：背景光环跟随鼠标轻微移动
  // --------------------------------------------
  const rings = document.querySelector('.bg-rings');
  const sun = document.querySelector('.bg-sun');
  if (isFinePointer && !reduceMotion) {
    window.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      if (rings) {
        rings.style.transform = `translate(calc(-50% + ${x * 18}px), calc(-50% + ${y * 18}px))`;
      }
      if (sun) {
        sun.style.transform = `translateX(calc(-50% + ${x * 30}px)) translateY(${y * 20}px)`;
      }
    });
  }

  // --------------------------------------------
  // 6. 控制台彩蛋
  // --------------------------------------------
  console.log(
    '%c父亲节快乐。',
    'font-size: 22px; font-weight: bold; color: #b54a2a; font-family: serif; padding: 8px;'
  );
  console.log(
    '%c2026.06.21',
    'font-size: 12px; color: #9c5410; font-family: monospace; letter-spacing: 0.2em; padding: 4px;'
  );
})();
