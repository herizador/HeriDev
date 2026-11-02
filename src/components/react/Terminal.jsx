import { useEffect, useRef, useState } from "react";

const LINES = [
  "> heridev@portfolio:~$ ./init --profile",
  "> Cargando perfil...",
  "> Nombre: Ismael Mateo Díaz Gutiérrez",
  "> Alias: HeriDev",
  "> Ubicación: Zaragoza, España",
  "> Stack: Java · Render · Supabase · GitHub · Vercel · R2",
  "> Certificaciones: Oracle Java · Oracle SQL",
  ">",
  "> heridev@portfolio:~$ ./build --prod",
  "> Construyendo portafolio cyberpunk...",
  "> Integrando escena 3D con OGL...",
  "> Conectando con la API de GitHub...",
  "> Listo. Puerto 3000.",
];

// Cada paso del escenario revela un bloque de líneas: 0–7 (init), 8–9 (build)
// y 10–12 (deploy). El terminal no sabe de scroll: solo escucha `heridev:paso`.
const FIN = [8, 10, LINES.length];

const VELOCIDAD = 12; // ms por carácter
const PAUSA = 160; // ms entre líneas

const sinMovimiento = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function Terminal() {
  const ref = useRef(null);
  const progreso = useRef({ completas: 0, parcial: "" });
  const [vista, setVista] = useState({ completas: 0, parcial: "" });
  const [objetivo, setObjetivo] = useState(null);
  const [reducido, setReducido] = useState(false);

  // 1. ¿Cuántas líneas toca mostrar? En escritorio lo dicta el escenario;
  //    en móvil, sin escenario o con movimiento reducido, se escriben todas.
  useEffect(() => {
    const host = ref.current?.closest("[data-escenario]");
    const escritorio = window.matchMedia("(min-width: 1280px)").matches;
    const calma = sinMovimiento();
    setReducido(calma);

    if (calma) {
      setObjetivo(LINES.length);
      return;
    }

    if (!host || !escritorio) {
      const el = ref.current;
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entrada]) => {
          if (entrada.isIntersecting) {
            setObjetivo(LINES.length);
            obs.disconnect();
          }
        },
        { threshold: 0.3 }
      );
      obs.observe(el);
      return () => obs.disconnect();
    }

    const leer = () => {
      const total = Number(host.dataset.pasos) || 1;
      const paso = Math.min(total - 1, Number(host.dataset.paso) || 0);
      setObjetivo(FIN[Math.min(paso, FIN.length - 1)]);
    };

    leer();
    document.addEventListener("heridev:paso", leer);
    return () => document.removeEventListener("heridev:paso", leer);
  }, []);

  // 2. Escribe hasta la línea objetivo. Si el paso cambia a mitad de una línea,
  //    el temporizador se reinicia y continúa donde estaba.
  useEffect(() => {
    if (objetivo === null) return;

    if (reducido) {
      progreso.current = { completas: objetivo, parcial: "" };
      setVista(progreso.current);
      return;
    }

    if (progreso.current.completas > objetivo) {
      progreso.current = { completas: objetivo, parcial: "" };
      setVista(progreso.current);
    }

    let vivo = true;
    let timer = null;

    const escribir = () => {
      if (!vivo) return;
      const p = progreso.current;
      if (p.completas >= objetivo) return;

      const linea = LINES[p.completas];
      if (p.parcial.length < linea.length) {
        p.parcial = linea.slice(0, p.parcial.length + 1);
        setVista({ ...p });
        timer = setTimeout(escribir, VELOCIDAD);
      } else {
        p.completas += 1;
        p.parcial = "";
        setVista({ ...p });
        timer = setTimeout(escribir, PAUSA);
      }
    };

    escribir();
    return () => {
      vivo = false;
      clearTimeout(timer);
    };
  }, [objetivo, reducido]);

  const filaActiva =
    objetivo === null ? -1 : Math.min(vista.completas, Math.max(0, objetivo - 1));

  return (
    <div
      ref={ref}
      className="terminal-caja w-full min-w-0 overflow-hidden rounded-lg border border-morado/20 bg-fondo/90 p-4 font-mono text-sm shadow-lg"
    >
      <div className="mb-2 flex items-center gap-2 border-b border-morado/10 pb-2">
        <span className="h-3 w-3 rounded-full bg-red-500" />
        <span className="h-3 w-3 rounded-full bg-yellow-500" />
        <span className="h-3 w-3 rounded-full bg-green-500" />
        <span className="ml-2 text-xs text-texto/50">terminal — heridev</span>
      </div>
      <div className="space-y-0.5">
        {LINES.map((linea, i) => {
          const completa = i < vista.completas;
          const enCurso = i === vista.completas;
          const texto = completa ? linea : enCurso ? vista.parcial : "";

          return (
            <div key={i} className="flex min-h-5 items-center xl:h-5">
              <span className="min-w-0 whitespace-pre-wrap break-words text-texto/80 xl:whitespace-pre">
                {texto}
              </span>
              {i === filaActiva && (
                <span
                  aria-hidden="true"
                  className="terminal-caret ml-px inline-block h-4 w-[2px] shrink-0 bg-morado"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
