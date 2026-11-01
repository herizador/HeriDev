import { useEffect, useRef } from "react";

/**
 * Isla decorativa: figura 3D con OGL (WebGL, ~16 kB).
 *
 * El código de la escena se importa en dinámico y **solo si la pantalla es de
 * escritorio**, así que en móvil y tablet no se descarga la librería (ni se crea
 * ningún contexto WebGL). El contenedor es `aria-hidden` y `pointer-events-none`:
 * no aporta información ni intercepta clics. El tamaño y la posición los decide
 * quien la usa mediante `className`.
 *
 * `variante`: "hero" (icosaedro) o "joya" (octaedro).
 */
export default function Escena3D({ variante = "hero", className = "" }) {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    // Mismo breakpoint que la clase `xl:` de Tailwind.
    if (!window.matchMedia("(min-width: 1280px)").matches) return;

    // Ahorro de datos activado: no descargamos la librería 3D para un adorno.
    if (navigator.connection && navigator.connection.saveData) return;

    let activo = true;
    let limpiar = () => {};
    let observador = null;

    const montar = () => {
      import("./escena3d.js")
        .then(({ crearEscena }) => {
          if (!activo) return;
          const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          limpiar = crearEscena(host, { reduced: reducido, variante }) || limpiar;
        })
        .catch(() => {
          // Si el chunk falla (red, WebGL), la web sigue funcionando sin figura.
        });
    };

    // El escenario activa el contenedor después de hidratar la isla, así que al
    // montar puede medir 0 px. Esperamos a que el layout le dé tamaño real.
    if (host.clientWidth && host.clientHeight) {
      montar();
    } else {
      observador = new ResizeObserver(() => {
        if (!host.clientWidth || !host.clientHeight) return;
        observador.disconnect();
        observador = null;
        montar();
      });
      observador.observe(host);
    }

    return () => {
      activo = false;
      observador?.disconnect();
      limpiar();
    };
  }, [variante]);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className={`pointer-events-none opacity-0 ${className}`}
    />
  );
}
