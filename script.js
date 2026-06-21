// ============================================
// 致父亲 · 2026 父亲节 · 交互脚本
// ============================================

(function () {
  'use strict';

  // 滚动揭示动画
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  // 导航栏滚动时收缩
  const nav = document.querySelector('.nav');
  let lastScroll = 0;
  window.addEventListener(
    'scroll',
    () => {
      const y = window.scrollY;
      if (y > 80) {
        nav.style.padding = '0.9rem 3rem';
        nav.style.fontSize = '0.72rem';
      } else {
        nav.style.padding = '1.5rem 3rem';
        nav.style.fontSize = '0.78rem';
      }
      lastScroll = y;
    },
    { passive: true }
  );

  // 平滑滚动到锚点
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 70;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // 鼠标视差：hero 的太阳轻微跟随
  const sun = document.querySelector('.hero__sun');
  if (sun && window.matchMedia('(pointer: fine)').matches) {
    const hero = document.querySelector('.hero');
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      sun.style.transform = `translateX(calc(-50% + ${x * 30}px)) translateY(${y * 20}px)`;
    });
  }

  // 时光轴卡片：进入时按顺序点亮圆点
  const timelineItems = document.querySelectorAll('.timeline__item');
  if ('IntersectionObserver' in window) {
    const tio = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            entry.target.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateX(0)';
            tio.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    timelineItems.forEach((item) => {
      item.style.opacity = '0';
      item.style.transform = 'translateX(-20px)';
      tio.observe(item);
    });
  }

  // 控制台彩蛋
  console.log(
    '%c爸，节日快乐。',
    'font-size: 20px; font-weight: bold; color: #b54a2a; font-family: serif; padding: 8px;'
  );
  console.log(
    '%c就这一句，别的也不说了。',
    'font-size: 12px; color: #8a3217; font-family: serif; padding: 4px;'
  );
})();
