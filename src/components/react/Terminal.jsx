import { useEffect, useRef, useState } from "react";

const LINES = [
  "> heridev@portfolio:~$ ./init --profile",
  "> Cargando perfil...",
  "> Nombre: Ismael Mateo Díaz Gutiérrez",
  "> Alias: HeriDev",
  "> Ubicación: Zaragoza, España",
  "> Stack: Astro · React · Tailwind · Node.js",
  "> Certificaciones: Oracle Java · Oracle SQL",
  ">",
  "> heridev@portfolio:~$ ./build --prod",
  "> Construyendo portafolio cyberpunk...",
  "> Integrando ♥ 3D con Spline...",
  "> Conectando a API de GitHub...",
  "> Listo. Puerto 3000.",
];

const SPEED = 30;
const DELAY = 400;

export default function Terminal() {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="w-full rounded-lg border border-cian/20 bg-fondo/90 p-4 font-mono text-sm shadow-lg">
      <div className="mb-2 flex items-center gap-2 border-b border-cian/10 pb-2">
        <span className="h-3 w-3 rounded-full bg-red-500" />
        <span className="h-3 w-3 rounded-full bg-yellow-500" />
        <span className="h-3 w-3 rounded-full bg-green-500" />
        <span className="ml-2 text-xs text-texto/50">terminal — heridev</span>
      </div>
      <div className="space-y-0.5">
        {LINES.map((line, i) => (
          <div key={i} className="flex h-5 items-center">
            <span
              className="inline-block overflow-hidden whitespace-nowrap text-texto/80"
              style={line.replace(">", "").trim().length > 0 ? {
                maxWidth: 0,
                borderRight: "2px solid #00f3ff",
                animation: visible
                  ? `tw-terminal ${line.length * SPEED}ms steps(${line.length}) ${i * DELAY}ms forwards`
                  : "none",
              } : {border: "none"}}
            >
              {line}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
