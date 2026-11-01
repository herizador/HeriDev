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
    let limpiarVitrina = () => {};

    (async () => {
      // Comprobamos antes de importar: quien pide movimiento reducido no debe
      // descargar GSAP para nada.
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      // 0. Vitrina de Las Joyas: no necesita GSAP. El escenario es `sticky`, así
      // que el scroll es nativo (sin pin ni hijack); aquí solo se traduce el
      // progreso a una variable CSS y al capítulo activo.
      const vitrina = document.querySelector("[data-vitrina]");
      if (vitrina) {
        vitrina.classList.add("vitrina--activa");
        let frame = 0;

        const actualizar = () => {
          frame = 0;
          const recorrido = vitrina.offsetHeight - window.innerHeight;
          const progreso =
            recorrido > 0
              ? Math.min(1, Math.max(0, -vitrina.getBoundingClientRect().top / recorrido))
              : 0;

          vitrina.style.setProperty("--vitrina", progreso.toFixed(4));

          const capitulo = Math.min(2, Math.floor(progreso * 2.999));
          if (vitrina.dataset.capitulo !== String(capitulo)) {
            vitrina.dataset.capitulo = String(capitulo);
          }
        };

        const pedir = () => {
          if (!frame) frame = requestAnimationFrame(actualizar);
        };

        window.addEventListener("scroll", pedir, { passive: true });
        window.addEventListener("resize", pedir);
        actualizar();

        limpiarVitrina = () => {
          window.removeEventListener("scroll", pedir);
          window.removeEventListener("resize", pedir);
          if (frame) cancelAnimationFrame(frame);
          vitrina.classList.remove("vitrina--activa");
          vitrina.removeAttribute("data-capitulo");
        };
      }

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
      limpiarVitrina();
      ctx?.revert();
    };
  }, []);

  return null;
}
