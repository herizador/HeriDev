import { useEffect, useRef } from "react";

/**
 * Isla decorativa del hero: figura 3D en Three.js.
 *
 * Se hidrata con `client:idle`, pero el código de Three.js se importa en
 * dinámico y **solo si la pantalla es de escritorio**, así que en móvil y
 * tablet no se descarga la librería (ni se crea ningún contexto WebGL).
 * El contenedor es `aria-hidden` y `pointer-events-none`: no aporta
 * información ni intercepta clics.
 */
export default function Escena3D() {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    // Mismo breakpoint que la clase `xl:` de Tailwind.
    if (!window.matchMedia("(min-width: 1280px)").matches) return;

    // Ahorro de datos activado: no descargamos ~130 kB de Three.js para un adorno.
    if (navigator.connection && navigator.connection.saveData) return;

    let activo = true;
    let limpiar = () => {};

    import("./escena3d.js")
      .then(({ crearEscena }) => {
        if (!activo) return;
        const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        limpiar = crearEscena(host, { reduced: reducido }) || limpiar;
      })
      .catch(() => {
        // Si el chunk falla (red, WebGL), la web sigue funcionando sin figura.
      });

    return () => {
      activo = false;
      limpiar();
    };
  }, []);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className="pointer-events-none absolute right-0 top-1/2 -z-10 hidden h-[320px] w-[320px] -translate-y-1/2 opacity-0 xl:block"
    />
  );
}
