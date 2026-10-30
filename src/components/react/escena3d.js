import {
  AdditiveBlending,
  Color,
  EdgesGeometry,
  Group,
  IcosahedronGeometry,
  LineBasicMaterial,
  LineSegments,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  WebGLRenderer,
} from "three";

const COLOR_MORADO = 0x9d00ff;
const COLOR_MORADO_CLARO = 0x6d288c;

/**
 * Monta la escena Three.js dentro de `host` y devuelve una función de limpieza.
 *
 * Módulo puro (sin React) a propósito: así Rollup puede eliminar de `three`
 * todo lo que no se usa y el chunk pesa mucho menos.
 *
 * - Respeta `prefers-reduced-motion`: dibuja un único fotograma estático.
 * - Pausa el bucle cuando la pestaña está oculta o el canvas sale de pantalla.
 * - Se recolorea al cambiar entre tema claro y oscuro.
 */
export function crearEscena(host, { reduced = false } = {}) {
  let ancho = host.clientWidth || 1;
  let alto = host.clientHeight || 1;

  const scene = new Scene();
  const camera = new PerspectiveCamera(45, ancho / alto, 0.1, 100);
  camera.position.z = 5.2;

  let renderer;
  try {
    renderer = new WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
  } catch {
    // Sin WebGL disponible: no montamos nada y no rompemos la página.
    return () => {};
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(ancho, alto);
  renderer.domElement.style.display = "block";
  host.appendChild(renderer.domElement);

  const esClaro = () => document.documentElement.dataset.theme === "light";
  const color = new Color(esClaro() ? COLOR_MORADO_CLARO : COLOR_MORADO);

  const group = new Group();
  scene.add(group);

  // Núcleo: icosaedro en alambre + puntos en sus vértices.
  const geoNucleo = new IcosahedronGeometry(1.45, 1);
  const geoAristas = new EdgesGeometry(geoNucleo);

  const matLineas = new LineBasicMaterial({ color, transparent: true, opacity: 0.9 });
  const lineas = new LineSegments(geoAristas, matLineas);
  group.add(lineas);

  const matPuntos = new PointsMaterial({
    color,
    size: 0.075,
    transparent: true,
    opacity: 0.95,
  });
  const puntos = new Points(geoNucleo, matPuntos);
  group.add(puntos);

  // Halo exterior, más tenue y con blending aditivo.
  const geoHaloBase = new IcosahedronGeometry(2.05, 1);
  const geoHalo = new EdgesGeometry(geoHaloBase);
  geoHaloBase.dispose();
  const matHalo = new LineBasicMaterial({
    color,
    transparent: true,
    opacity: 0.16,
    blending: AdditiveBlending,
    depthWrite: false,
  });
  const halo = new LineSegments(geoHalo, matHalo);
  group.add(halo);

  // --- Interacción: la figura se inclina hacia el cursor, con amortiguación ---
  const objetivo = { x: 0, y: 0 };
  const actual = { x: 0, y: 0 };

  const onPointerMove = (event) => {
    const rect = host.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    objetivo.x = ((event.clientX - rect.left) / rect.width - 0.5) * 0.9;
    objetivo.y = ((event.clientY - rect.top) / rect.height - 0.5) * 0.9;
  };

  // --- Bucle de render, con pausa cuando no se ve ---
  let raf = 0;
  let autoY = 0;
  let ultimo = 0;
  let enPantalla = true;

  const tick = (tiempo) => {
    raf = requestAnimationFrame(tick);
    const dt = Math.min((tiempo - ultimo) / 1000 || 0, 0.05);
    ultimo = tiempo;

    autoY += dt * 0.22;
    actual.x += (objetivo.x - actual.x) * 0.045;
    actual.y += (objetivo.y - actual.y) * 0.045;

    group.rotation.y = autoY + actual.x;
    group.rotation.x = actual.y * 0.75;
    halo.rotation.y = -autoY * 0.45;
    halo.rotation.z = autoY * 0.2;

    renderer.render(scene, camera);

    // La figura aparece en cuanto hay un fotograma real dibujado.
    if (host.style.opacity !== "1") host.style.opacity = "1";
  };

  const arrancar = () => {
    if (raf || reduced || !enPantalla || document.hidden) return;
    ultimo = performance.now();
    raf = requestAnimationFrame(tick);
  };

  const parar = () => {
    if (!raf) return;
    cancelAnimationFrame(raf);
    raf = 0;
  };

  const onVisibilityChange = () => {
    if (document.hidden) parar();
    else arrancar();
  };

  const onThemeChange = () => {
    const hex = esClaro() ? COLOR_MORADO_CLARO : COLOR_MORADO;
    matLineas.color.setHex(hex);
    matPuntos.color.setHex(hex);
    matHalo.color.setHex(hex);
    if (reduced) renderer.render(scene, camera);
  };

  const io = new IntersectionObserver(
    (entries) => {
      enPantalla = entries[0].isIntersecting;
      if (enPantalla) arrancar();
      else parar();
    },
    { threshold: 0 }
  );
  io.observe(host);

  const ro = new ResizeObserver(() => {
    const w = host.clientWidth;
    const h = host.clientHeight;
    if (!w || !h) return;
    ancho = w;
    alto = h;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    if (reduced) renderer.render(scene, camera);
  });
  ro.observe(host);

  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("heridev:theme", onThemeChange);
  document.addEventListener("visibilitychange", onVisibilityChange);

  // Entrada suave: el canvas nace transparente (clase `opacity-0`) y aparece
  // cuando ya hay un fotograma dibujado. Sin animación si se pide movimiento reducido.
  if (reduced) {
    // Fotograma único: la figura se ve, pero no se mueve.
    renderer.render(scene, camera);
    host.style.opacity = "1";
  } else {
    host.style.transition = "opacity 900ms ease";
    arrancar();
  }

  return () => {
    parar();
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("heridev:theme", onThemeChange);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    io.disconnect();
    ro.disconnect();

    geoNucleo.dispose();
    geoAristas.dispose();
    geoHalo.dispose();
    matLineas.dispose();
    matPuntos.dispose();
    matHalo.dispose();
    renderer.dispose();

    if (renderer.domElement.parentNode === host) {
      host.removeChild(renderer.domElement);
    }
  };
}
