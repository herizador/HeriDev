import Particles, { ParticlesProvider } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

export default function HeroParticles() {
  return (
    <ParticlesProvider init={async (engine) => { await loadSlim(engine); }}>
      <Particles
        id="hero-particles"
        className="absolute inset-0 z-0 w-full h-full"
        options={{
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
              onHover: {
                enable: true,
                mode: "attract",
              },
            },
            modes: {
              attract: {
                distance: 250,
                duration: 0.3,
                speed: 6,
              },
            },
          },
          detectRetina: true,
        }}
      />
    </ParticlesProvider>
  );
}
