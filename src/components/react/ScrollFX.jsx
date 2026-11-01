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
 * - `[data-fx="zoom"]`  miniatura del CV (entra con zoom y leve giro).
 * - `[data-escenario]`  escenario de pasos (joyas, terminal, trayectoria, GitHub):
 *   sticky nativo + `--paso` (0–1), `data-paso` y evento `heridev:paso`.
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
    let limpiarEscenarios = () => {};

    (async () => {
      // Comprobamos antes de importar: quien pide movimiento reducido no debe
      // descargar GSAP para nada.
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      // 0. Escenarios de pasos (joyas, terminal, trayectoria, GitHub): no
      // necesitan GSAP. El escenario es `sticky`, así que el scroll es nativo
      // (sin pin ni hijack); aquí solo se traduce el progreso a `--paso`, al
      // paso activo y a un evento que consume el terminal.
      const escenarios = Array.from(document.querySelectorAll("[data-escenario]"));
      if (escenarios.length) {
        escenarios.forEach((el) => el.classList.add("pasos--activo"));
        let frame = 0;

        const actualizar = () => {
          frame = 0;

          for (const el of escenarios) {
            const total = Number(el.dataset.pasos) || 1;
            const recorrido = el.offsetHeight - window.innerHeight;
            const progreso =
              recorrido > 0
                ? Math.min(1, Math.max(0, -el.getBoundingClientRect().top / recorrido))
                : 0;

            el.style.setProperty("--paso", progreso.toFixed(4));

            const paso = Math.min(total - 1, Math.floor(progreso * (total - 0.001)));
            if (el.dataset.paso !== String(paso)) {
              el.dataset.paso = String(paso);
              document.dispatchEvent(
                new CustomEvent("heridev:paso", {
                  detail: { id: el.dataset.escenario, paso, progreso },
                })
              );
            }
          }
        };

        const pedir = () => {
          if (!frame) frame = requestAnimationFrame(actualizar);
        };

        window.addEventListener("scroll", pedir, { passive: true });
        window.addEventListener("resize", pedir);
        actualizar();

        limpiarEscenarios = () => {
          window.removeEventListener("scroll", pedir);
          window.removeEventListener("resize", pedir);
          if (frame) cancelAnimationFrame(frame);
          escenarios.forEach((el) => {
            el.classList.remove("pasos--activo");
            el.removeAttribute("data-paso");
            el.style.removeProperty("--paso");
          });
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

        // 3. La miniatura del CV gana profundidad con un zoom y un leve giro
        //    atados al scroll (sin pin: la página nunca se queda bloqueada).
        const paper = document.querySelector('[data-fx="zoom"]');
        if (paper) {
          gsap.fromTo(
            paper,
            { scale: 0.92, rotateY: -8, rotateX: 5 },
            {
              scale: 1,
              rotateY: 0,
              rotateX: 0,
              transformPerspective: 900,
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
      limpiarEscenarios();
      ctx?.revert();
    };
  }, []);

  return null;
}
