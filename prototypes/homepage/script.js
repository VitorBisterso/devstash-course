document.addEventListener('DOMContentLoaded', () => {
  const chaosBox = document.getElementById('chaos-box');
  const icons = chaosBox ? chaosBox.querySelectorAll('.chaos-icon') : [];
  const navbar = document.getElementById('navbar');
  const navToggle = document.querySelector('.nav-toggle');
  const navInner = document.querySelector('.nav-inner');
  const yearSpan = document.getElementById('current-year');

  // Current year in footer
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  // Navbar toggle (mobile)
  if (navToggle && navInner) {
    navToggle.addEventListener('click', () => {
      navInner.classList.toggle('show-nav');
    });
  }

  // Navbar opacity on scroll
  let lastScroll = 0;
  const onScroll = () => {
    const scrollY = window.scrollY;
    navbar.classList.toggle('scrolled', scrollY > 50);
    lastScroll = scrollY;
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  // Fade-in on scroll using IntersectionObserver
  const fadeElements = document.querySelectorAll('.fade-in');
  if (fadeElements.length > 0) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    fadeElements.forEach((el) => observer.observe(el));
  }

  // Pricing toggle
  const pricingToggle = document.getElementById('pricing-toggle');
  const monthlyLabel = document.getElementById('toggle-monthly-label');
  const yearlyLabel = document.getElementById('toggle-yearly-label');
  const priceAmounts = document.querySelectorAll('.price-amount');

  if (pricingToggle) {
    const updatePricing = () => {
      const isYearly = pricingToggle.checked;
      monthlyLabel.classList.toggle('active', !isYearly);
      yearlyLabel.classList.toggle('active', isYearly);
      priceAmounts.forEach((el) => {
        el.textContent = isYearly ? el.dataset.yearly : el.dataset.monthly;
      });
      document.querySelectorAll('.price-period-text').forEach((el) => {
        el.style.display = isYearly ? 'none' : '';
      });
      document.querySelectorAll('.price-yearly-text').forEach((el) => {
        el.style.display = isYearly ? '' : 'none';
      });
    };
    pricingToggle.addEventListener('change', updatePricing);
    updatePricing();
  }

  // Chaos container animation
  if (!chaosBox || icons.length === 0) return;

  const rect = chaosBox.getBoundingClientRect();
  const boxW = chaosBox.clientWidth;
  const boxH = chaosBox.clientHeight;
  const iconSize = 52;
  const padding = 4;

  const particles = Array.from(icons).map((el, i) => {
    const speed = parseFloat(el.dataset.speed) || 0.3;
    return {
      el,
      x: Math.random() * (boxW - iconSize - padding * 2) + padding,
      y: Math.random() * (boxH - iconSize - padding * 2) + padding,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 0.5,
      scale: 0.8 + Math.random() * 0.4,
      scaleDirection: Math.random() > 0.5 ? 1 : -1,
      scaleSpeed: 0.2 + Math.random() * 0.3,
    };
  });

  let mouseX = -9999;
  let mouseY = -9999;
  const repelRadius = 80;
  const repelForce = 0.15;

  chaosBox.addEventListener('mousemove', (e) => {
    const r = chaosBox.getBoundingClientRect();
    mouseX = e.clientX - r.left;
    mouseY = e.clientY - r.top;
  });

  chaosBox.addEventListener('mouseleave', () => {
    mouseX = -9999;
    mouseY = -9999;
  });

  let lastTime = 0;

  function animate(time) {
    const dt = Math.min((time - lastTime) / 16, 3);
    lastTime = time;

    particles.forEach((p) => {
      let vx = p.vx;
      let vy = p.vy;

      // Mouse repelling
      const dx = p.x + iconSize / 2 - mouseX;
      const dy = p.y + iconSize / 2 - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < repelRadius && dist > 0) {
        const force = (repelRadius - dist) / repelRadius * repelForce;
        vx += (dx / dist) * force;
        vy += (dy / dist) * force;
      }

      // Apply velocity
      p.x += vx * dt;
      p.y += vy * dt;

      // Dampen
      p.vx = vx * 0.99;
      p.vy = vy * 0.99;

      // Bounce off walls
      if (p.x < padding) { p.x = padding; p.vx = Math.abs(p.vx); }
      if (p.x > boxW - iconSize - padding) { p.x = boxW - iconSize - padding; p.vx = -Math.abs(p.vx); }
      if (p.y < padding) { p.y = padding; p.vy = Math.abs(p.vy); }
      if (p.y > boxH - iconSize - padding) { p.y = boxH - iconSize - padding; p.vy = -Math.abs(p.vy); }

      // Keep within bounds
      p.x = Math.max(padding, Math.min(boxW - iconSize - padding, p.x));
      p.y = Math.max(padding, Math.min(boxH - iconSize - padding, p.y));

      // Rotation
      p.rotation += p.rotSpeed * dt;

      // Scale pulsing
      p.scale += p.scaleDirection * p.scaleSpeed * 0.01 * dt;
      if (p.scale > 1.2 || p.scale < 0.7) p.scaleDirection *= -1;

      p.el.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.rotation}deg) scale(${p.scale})`;
    });

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);

  // Handle resize
  const onResize = () => {
    const r = chaosBox.getBoundingClientRect();
    const newW = chaosBox.clientWidth;
    const newH = chaosBox.clientHeight;
    particles.forEach((p) => {
      p.x = Math.min(p.x, newW - iconSize - padding);
      p.y = Math.min(p.y, newH - iconSize - padding);
    });
  };
  window.addEventListener('resize', onResize);
});