document.documentElement.classList.add('dyn');
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveal = (el) => el.setAttribute('data-reveal', '');
  const revealEls = () => document.querySelectorAll('[data-reveal]');

  if (reduce || !('IntersectionObserver' in window)) {
    revealEls().forEach((el) => el.classList.add('in-view'));
    return;
  }

  document.querySelectorAll('.rv-stagger').forEach((parent) => {
    [...parent.children].forEach((child, i) => {
      reveal(child);
      child.style.transitionDelay = Math.min(i * 90, 630) + 'ms';
    });
  });

  const io = new IntersectionObserver(
    (entries) => {
      for (const en of entries) {
        if (en.isIntersecting) {
          en.target.classList.add('in-view');
          io.unobserve(en.target);
        }
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
  );

  revealEls().forEach((el) => io.observe(el));

  const blobs = document.querySelector('.bg-blobs');
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {

    /* Ambient particle network */
    const cv = document.createElement('canvas');
    cv.id = 'fx-canvas';
    cv.setAttribute('aria-hidden', 'true');
    document.body.prepend(cv);
    const ctx = cv.getContext('2d');
    let W = 0, H = 0, dots = [];
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const LINK = 130;

    function size() {
      W = cv.width = Math.floor(innerWidth * DPR);
      H = cv.height = Math.floor(innerHeight * DPR);
      cv.style.width = innerWidth + 'px';
      cv.style.height = innerHeight + 'px';
      const n = Math.min(85, Math.floor((innerWidth * innerHeight) / 24000));
      dots = Array.from({ length: n }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.35 * DPR,
        vy: (Math.random() - 0.5) * 0.35 * DPR,
        r: (Math.random() * 1.6 + 0.7) * DPR,
        pulse: Math.random() * Math.PI * 2
      }));
    }
    size();
    addEventListener('resize', size);

    let px = -1e4, py = -1e4;
    addEventListener('pointermove', (e) => {
      px = e.clientX * DPR;
      py = e.clientY * DPR;
    }, { passive: true });
    addEventListener('pointerleave', () => { px = -1e4; py = -1e4; });

    let running = true;
    document.addEventListener('visibilitychange', () => {
      running = !document.hidden;
      if (running) frame();
    });

    function frame() {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      const t = performance.now() / 1000;

      for (const d of dots) {
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0 || d.x > W) d.vx *= -1;
        if (d.y < 0 || d.y > H) d.vy *= -1;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,255,217,' + (0.5 + Math.sin(t + d.pulse) * 0.25) + ')';
        ctx.fill();
      }

      for (let i = 0; i < dots.length; i++) {
        const a = dots[i];
        for (let j = i + 1; j < dots.length; j++) {
          const b = dots[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < LINK * DPR) {
            const al = (1 - dist / (LINK * DPR)) * 0.22;
            ctx.strokeStyle = 'rgba(0,225,255,' + al + ')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        if (px > 0) {
          const dx = a.x - px, dy = a.y - py;
          const dist = Math.hypot(dx, dy);
          if (dist < LINK * 1.6 * DPR) {
            const al = (1 - dist / (LINK * 1.6 * DPR)) * 0.4;
            ctx.strokeStyle = 'rgba(255,255,255,' + al * 0.5 + ')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(px, py);
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    /* Blob cursor parallax */
    if (blobs) {
    let mx = 0, my = 0, cx = 0, cy = 0;
    window.addEventListener('pointermove', (e) => {
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
    }, { passive: true });
    (function frame() {
      cx += (mx - cx) * 0.05;
      cy += (my - cy) * 0.05;
      blobs.style.transform =
        'translate3d(' + cx * -30 + 'px,' + cy * -30 + 'px,0) scale(' + (1 + Math.abs(cx) * 0.9) + ')';
      requestAnimationFrame(frame);
    })();
    }
  }
})();