import { useCallback, useMemo } from "react";
import Particles, { ParticlesProvider } from "@tsparticles/react";
import { loadBasic } from "@tsparticles/basic";
import { loadInteractivityPlugin } from "@tsparticles/plugin-interactivity";
import { loadParticlesLinksInteraction } from "@tsparticles/interaction-particles-links";
import { loadExternalAttractInteraction } from "@tsparticles/interaction-external-attract";

export default function HeroParticles() {
  const initEngine = useCallback(async (engine) => {
    // El orden importa: basic -> interactivity -> links + attract.
    // Reordenarlo rompe el build (tsParticles Interactivity Plugin is not loaded).
    await loadBasic(engine);
    await loadInteractivityPlugin(engine);
    await loadParticlesLinksInteraction(engine);
    await loadExternalAttractInteraction(engine);
  }, []);

  const options = useMemo(() => ({
    fpsLimit: 60,
    fullScreen: { enable: false },
    particles: {
      number: { value: 70, density: { enable: true, area: 900 } },
      color: { value: ["#9d00ff", "#c07bff", "#7a2bd6"] },
      links: { enable: false },
      move: {
        enable: true,
        speed: 0.35,
        direction: "none",
        outModes: { default: "out" },
      },
      size: {
        value: { min: 1, max: 2.4 },
      },
      opacity: {
        value: { min: 0.25, max: 0.6 },
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
  }), []);

  return (
    <ParticlesProvider init={initEngine}>
      <Particles
        id="hero-particles"
        className="absolute inset-0 z-0 w-full h-full"
        options={options}
      />
    </ParticlesProvider>
  );
}
