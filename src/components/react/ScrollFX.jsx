import { useEffect } from "react";

/**
 * Capa de animación con GSAP + ScrollTrigger.
 *
 * No renderiza nada: solo orquesta efectos sobre elementos que ya existen en el
 * DOM, así que no añade marcado ni rompe el HTML estático indexable.
 *
 * Contrato con el resto del proyecto:
 * - `[data-fx="hero"]`  bloque de texto del hero (se eleva y desvanece al bajar).
 * - `.fx-rule`          línea divisoria de sección (se dibuja de izquierda a derecha).
 * - `[data-fx="zoom"]`  miniatura del CV (entra con un leve zoom).
 *
 * Reglas:
 * - Nunca toca `.reveal` ni `.tw-s-*`: esos los gestiona el Observer del layout.
 * - Con `prefers-reduced-motion` activo no se ejecuta: el CSS ya lo deja todo visible.
 * - GSAP se importa de forma dinámica, fuera del camino crítico de carga.
 */
export default function ScrollFX() {
  useEffect(() => {
    let ctx;
    let cancelado = false;

    (async () => {
      // Comprobamos antes de importar: quien pide movimiento reducido no debe
      // descargar GSAP para nada.
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const [{ gsap }, scrollTriggerModule] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelado) return;

      const ScrollTrigger = scrollTriggerModule.default ?? scrollTriggerModule.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        // 1. Hero: el texto se eleva y se desvanece mientras la sección sale de pantalla.
        const hero = document.querySelector('[data-fx="hero"]');
        if (hero) {
          gsap.to(hero, {
            yPercent: -14,
            opacity: 0.15,
            ease: "none",
            scrollTrigger: {
              trigger: "#inicio",
              start: "top top",
              end: "bottom top",
              scrub: 0.5,
            },
          });
        }

        // 2. Las líneas divisorias se dibujan al entrar en pantalla (una sola vez).
        gsap.utils.toArray(".fx-rule").forEach((rule) => {
          gsap.from(rule, {
            scaleX: 0,
            transformOrigin: "left center",
            duration: 0.9,
            ease: "power2.out",
            scrollTrigger: {
              trigger: rule,
              start: "top 92%",
              once: true,
            },
          });
        });

        // 3. La miniatura del CV gana profundidad con un zoom atado al scroll.
        const paper = document.querySelector('[data-fx="zoom"]');
        if (paper) {
          gsap.fromTo(
            paper,
            { scale: 0.92 },
            {
              scale: 1,
              ease: "none",
              scrollTrigger: {
                trigger: paper,
                start: "top 88%",
                end: "center 55%",
                scrub: 0.5,
              },
            }
          );
        }
      });
    })();

    return () => {
      cancelado = true;
      ctx?.revert();
    };
  }, []);

  return null;
}
