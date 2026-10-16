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

function buildOptions(theme) {
  var light = theme === "light";
  return {
    fpsLimit: 60,
    fullScreen: { enable: false },
    particles: {
      number: { value: light ? 90 : 70, density: { enable: true, area: 900 } },
      color: {
        value: light
          ? ["#9d00ff", "#8a00e6", "#7a00cc"]
          : ["#9d00ff", "#7a2bd6", "#5b21b6"],
      },
      links: { enable: false },
      move: {
        enable: true,
        speed: 0.35,
        direction: "none",
        outModes: { default: "out" },
      },
      size: {
        value: light ? { min: 1.2, max: 3.2 } : { min: 1, max: 2.6 },
      },
      opacity: {
        value: light ? { min: 0.55, max: 0.9 } : { min: 0.35, max: 0.7 },
        animation: { enable: true, speed: 0.6, sync: false },
      },
    },
    interactivity: {
      events: {
        onHover: { enable: true, mode: "attract" },
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

  const initEngine = useCallback(async (engine) => {
    // El orden importa: basic -> interactivity -> links + attract.
    // Reordenarlo rompe el build (tsParticles Interactivity Plugin is not loaded).
    await loadBasic(engine);
    await loadInteractivityPlugin(engine);
    await loadParticlesLinksInteraction(engine);
    await loadExternalAttractInteraction(engine);
  }, []);

  const options = useMemo(function () {
    return buildOptions(theme);
  }, [theme]);

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
