"use client";

import { useEffect, useRef } from "react";

const ICONS = [
  {
    id: "notion",
    svg: (
      <path d="M4.5 4.5l15 2.5v12.5l-15-2.5V4.5zm2.5 3.5v7l2 .3V8.3l-2-.3zm4 0v7l2 .3V8.3l-2-.3zm4 .5l-1 .2v6l1 .2V8.5z" />
    ),
  },
  {
    id: "github",
    svg: (
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    ),
  },
  {
    id: "slack",
    svg: (
      <path d="M5.04 15.16a2.52 2.52 0 01-5.04 0c0-1.4 1.12-2.52 2.52-2.52h2.52v2.52zm1.26 0a2.52 2.52 0 015.04 0v6.3a2.52 2.52 0 01-5.04 0v-6.3zm2.52-10.1a2.52 2.52 0 010-5.04c1.4 0 2.52 1.12 2.52 2.52v2.52H8.82zm0 1.26a2.52 2.52 0 010 5.04H2.52a2.52 2.52 0 010-5.04h6.3zm10.1 2.52a2.52 2.52 0 015.04 0c0 1.4-1.12 2.52-2.52 2.52h-2.52V8.84zm-1.26 0a2.52 2.52 0 01-5.04 0V2.52a2.52 2.52 0 015.04 0v6.32zm-2.52 10.1a2.52 2.52 0 010 5.04c-1.4 0-2.52-1.12-2.52-2.52v-2.52h2.52zm0-1.26a2.52 2.52 0 010-5.04h6.3a2.52 2.52 0 010 5.04h-6.3z" />
    ),
  },
  {
    id: "vscode",
    svg: (
      <path d="M23.15 2.587L18.21.21a1.49 1.49 0 00-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 00-1.276.057L.327 7.261A1 1 0 00.326 8.74L3.899 12 .326 15.26a1 1 0 00.001 1.479L1.65 17.94a.999.999 0 001.276.057l4.12-3.128 9.46 8.63a1.49 1.49 0 001.704.29l4.942-2.377A1.5 1.5 0 0024 20.06V3.939a1.5 1.5 0 00-.85-1.352zm-5.146 14.279L11.41 12l6.594-4.866v9.732z" />
    ),
  },
  {
    id: "browser",
    svg: (
      <path d="M3 3h18v2H3V3zm0 4h18v14H3V7zm2 2v10h14V9H5z" />
    ),
  },
  {
    id: "terminal",
    svg: (
      <path d="M3 3h18v18H3V3zm16 16V5H5v14h14zM7 8l3 3-3 3 1.5 1.5L13 11 8.5 6.5 7 8zm7 7h4v2h-4v-2z" />
    ),
  },
  {
    id: "text",
    svg: (
      <path d="M4 4h16v2H4V4zm0 4h16v2H4V8zm0 4h12v2H4v-2zm0 4h8v2H4v-2z" />
    ),
  },
  {
    id: "bookmark",
    svg: (
      <path d="M5 2h14v20l-7-4.5L5 22V2zm2 2v14.5l5-3.2 5 3.2V4H7z" />
    ),
  },
];

export function ChaosBox() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const icons = container.querySelectorAll<HTMLDivElement>(".chaos-icon");
    if (icons.length === 0) return;

    const boxW = container.clientWidth;
    const boxH = container.clientHeight;
    const iconSize = 52;
    const padding = 4;

    const particles = Array.from(icons).map((el) => {
      const speed = parseFloat(el.dataset.speed || "0.3");
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

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    const onMouseLeave = () => {
      mouseX = -9999;
      mouseY = -9999;
    };

    container.addEventListener("mousemove", onMouseMove);
    container.addEventListener("mouseleave", onMouseLeave);

    let lastTime = 0;
    let animationId: number;

    const animate = (time: number) => {
      const dt = Math.min((time - lastTime) / 16, 3);
      lastTime = time;

      particles.forEach((p) => {
        let { vx, vy } = p;

        const dx = p.x + iconSize / 2 - mouseX;
        const dy = p.y + iconSize / 2 - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < repelRadius && dist > 0) {
          const force = ((repelRadius - dist) / repelRadius) * repelForce;
          vx += (dx / dist) * force;
          vy += (dy / dist) * force;
        }

        p.x += vx * dt;
        p.y += vy * dt;

        p.vx = vx * 0.99;
        p.vy = vy * 0.99;

        if (p.x < padding) { p.x = padding; p.vx = Math.abs(p.vx); }
        if (p.x > boxW - iconSize - padding) { p.x = boxW - iconSize - padding; p.vx = -Math.abs(p.vx); }
        if (p.y < padding) { p.y = padding; p.vy = Math.abs(p.vy); }
        if (p.y > boxH - iconSize - padding) { p.y = boxH - iconSize - padding; p.vy = -Math.abs(p.vy); }

        p.x = Math.max(padding, Math.min(boxW - iconSize - padding, p.x));
        p.y = Math.max(padding, Math.min(boxH - iconSize - padding, p.y));

        p.rotation += p.rotSpeed * dt;

        p.scale += p.scaleDirection * p.scaleSpeed * 0.01 * dt;
        if (p.scale > 1.2 || p.scale < 0.7) p.scaleDirection *= -1;

        p.el.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.rotation}deg) scale(${p.scale})`;
      });

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    const onResize = () => {
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      particles.forEach((p) => {
        p.x = Math.min(p.x, newW - iconSize - padding);
        p.y = Math.min(p.y, newH - iconSize - padding);
      });
    };

    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animationId);
      container.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-square max-w-[320px] mx-auto bg-card border border-border rounded-xl overflow-hidden"
    >
      {ICONS.map((icon) => (
        <div
          key={icon.id}
          className="chaos-icon absolute w-[52px] h-[52px] flex items-center justify-center text-muted-foreground/70 will-change-transform"
          data-speed={icon.id === "notion" ? 0.3 : icon.id === "github" ? 0.5 : icon.id === "slack" ? 0.4 : icon.id === "vscode" ? 0.6 : icon.id === "browser" ? 0.35 : icon.id === "terminal" ? 0.45 : icon.id === "text" ? 0.55 : 0.25}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            {icon.svg}
          </svg>
        </div>
      ))}
    </div>
  );
}
