import { useCallback, useEffect, useMemo, useState } from "react";
import Particles, { ParticlesProvider } from "@tsparticles/react";
import { loadBasic } from "@tsparticles/basic";
import { loadInteractivityPlugin } from "@tsparticles/plugin-interactivity";
import { loadParticlesLinksInteraction } from "@tsparticles/interaction-particles-links";
import { loadExternalAttractInteraction } from "@tsparticles/interaction-external-attract";

function currentTheme() {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function buildOptions(theme, reducedMotion) {
  var light = theme === "light";
  var count = light ? 110 : 70;
  if (reducedMotion) count = Math.round(count / 2);

  return {
    fpsLimit: 60,
    fullScreen: { enable: false },
    particles: {
      number: { value: count, density: { enable: true, area: 900 } },
      paint: {
        color: {
          value: light
            ? ["#9d00ff", "#8a00e6", "#7a00cc"]
            : ["#ffffff", "#e6e1f2", "#c9c2dd"],
        },
      },
      links: { enable: false },
      move: {
        enable: !reducedMotion,
        speed: 0.35,
        direction: "none",
        outModes: { default: "out" },
      },
      size: {
        value: light ? { min: 1.5, max: 3.5 } : { min: 1, max: 2.6 },
      },
      opacity: {
        value: light ? { min: 0.65, max: 0.95 } : { min: 0.35, max: 0.7 },
        animation: { enable: !reducedMotion, speed: 0.6, sync: false },
      },
    },
    interactivity: {
      events: {
        onHover: { enable: !reducedMotion, mode: "attract" },
      },
      modes: {
        attract: { distance: 140, duration: 0.4, speed: 0.8 },
      },
    },
    detectRetina: true,
  };
}

export default function HeroParticles() {
  const [theme, setTheme] = useState(currentTheme);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(function () {
    var onTheme = function (e) {
      setTheme(e && e.detail === "light" ? "light" : "dark");
    };
    setTheme(currentTheme());
    window.addEventListener("heridev:theme", onTheme);
    return function () {
      window.removeEventListener("heridev:theme", onTheme);
    };
  }, []);

  // Con movimiento reducido: menos partículas, sin desplazamiento ni atracción.
  useEffect(function () {
    var mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    var update = function () {
      setReducedMotion(mq.matches);
    };
    update();
    mq.addEventListener("change", update);
    return function () {
      mq.removeEventListener("change", update);
    };
  }, []);

  const initEngine = useCallback(async (engine) => {
    // El orden importa: basic -> interactivity -> links + attract.
    // Reordenarlo rompe el build (tsParticles Interactivity Plugin is not loaded).
    await loadBasic(engine);
    await loadInteractivityPlugin(engine);
    await loadParticlesLinksInteraction(engine);
    await loadExternalAttractInteraction(engine);
  }, []);

  const options = useMemo(function () {
    return buildOptions(theme, reducedMotion);
  }, [theme, reducedMotion]);

  return (
    <ParticlesProvider init={initEngine}>
      <Particles
        key={theme}
        id="hero-particles"
        className="absolute inset-0 z-0 w-full h-full"
        options={options}
      />
    </ParticlesProvider>
  );
}
