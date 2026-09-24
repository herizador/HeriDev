import { useCallback, useEffect, useMemo, useRef } from "react";
import Particles, { ParticlesProvider } from "@tsparticles/react";
import { loadBasic } from "@tsparticles/basic";
import { loadInteractivityPlugin } from "@tsparticles/plugin-interactivity";
import { loadParticlesLinksInteraction } from "@tsparticles/interaction-particles-links";
import { loadExternalAttractInteraction } from "@tsparticles/interaction-external-attract";

export default function HeroParticles() {
  const containerRef = useRef(null);

  const particlesLoaded = useCallback(async (container) => {
    containerRef.current = container;
  }, []);

  const initEngine = useCallback(async (engine) => {
    await loadBasic(engine);
    await loadInteractivityPlugin(engine);
    await loadParticlesLinksInteraction(engine);
    await loadExternalAttractInteraction(engine);
  }, []);

  useEffect(() => {
    const idle = { x: 0, y: 0, time: Date.now() };
    let lastExplosion = 0;
    let canvasRect = null;

    const getCanvasRect = () => {
      const c = containerRef.current;
      if (!c) return null;
      return c.canvas.element?.getBoundingClientRect() ?? null;
    };

    const interval = setInterval(() => {
      if (Date.now() - idle.time > 2500 && Date.now() - lastExplosion > 3500) {
        lastExplosion = Date.now();
        const c = containerRef.current;
        if (!c || !c.particles) return;
        canvasRect = getCanvasRect();
        if (!canvasRect) return;
        const strength = 30 + Math.random() * 40;
        c.particles.forEach((p) => {
          const dx = p.position.x + canvasRect.left - idle.x;
          const dy = p.position.y + canvasRect.top - idle.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          p.velocity.x += (dx / dist) * strength * (0.7 + Math.random() * 0.6);
          p.velocity.y += (dy / dist) * strength * (0.7 + Math.random() * 0.6);
        });
      }
    }, 200);

    const onMouseMove = (e) => {
      idle.x = e.clientX;
      idle.y = e.clientY;
      idle.time = Date.now();
    };
    document.addEventListener("mousemove", onMouseMove);
    return () => {
      clearInterval(interval);
      document.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  const options = useMemo(() => ({
    fpsLimit: 60,
    fullScreen: { enable: false },
    particles: {
      number: { value: 90, density: { enable: true } },
      color: { value: "#00f3ff" },
      links: {
        color: "#9d00ff",
        distance: 160,
        enable: true,
        opacity: 0.35,
        width: 1.2,
      },
      move: {
        enable: true,
        speed: 1.2,
        outModes: { default: "bounce" },
      },
      size: {
        value: { min: 1.5, max: 3.5 },
      },
      opacity: { value: 0.9 },
    },
    interactivity: {
      events: {
        onHover: { enable: true, mode: "attract" },
      },
      modes: {
        attract: { distance: 250, duration: 0.3, speed: 6 },
      },
    },
    detectRetina: true,
  }), []);

  return (
    <ParticlesProvider init={initEngine}>
      <Particles
        id="hero-particles"
        className="absolute inset-0 z-0 w-full h-full"
        options={options}
        particlesLoaded={particlesLoaded}
      />
    </ParticlesProvider>
  );
}
