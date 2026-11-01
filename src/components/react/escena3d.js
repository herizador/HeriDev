import { Camera, Color, Geometry, Mesh, Program, Renderer, Transform } from "ogl";

const MORADO = 0x9d00ff;
const MORADO_CLARO = 0x6d288c;

const VERTICES_ICOSAEDRO = [
  [-1, 1.618, 0], [1, 1.618, 0], [-1, -1.618, 0], [1, -1.618, 0],
  [0, -1, 1.618], [0, 1, 1.618], [0, -1, -1.618], [0, 1, -1.618],
  [1.618, 0, -1], [1.618, 0, 1], [-1.618, 0, -1], [-1.618, 0, 1],
];

const CARAS_ICOSAEDRO = [
  [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
  [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
  [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
  [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
];

const VERTICES_OCTAEDRO = [
  [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1],
];

const CARAS_OCTAEDRO = [
  [0, 2, 4], [2, 1, 4], [1, 3, 4], [3, 0, 4],
  [2, 0, 5], [1, 2, 5], [3, 1, 5], [0, 3, 5],
];

/**
 * Formas disponibles. Cada una cambia la geometría, el encuadre y el carácter
 * del giro, pero comparten el mismo renderer y los mismos shaders.
 */
const FORMAS = {
  hero: {
    vertices: VERTICES_ICOSAEDRO,
    caras: CARAS_ICOSAEDRO,
    radio: 1.45,
    detalle: 1,
    escalaHalo: 2.05 / 1.45,
    giro: 1,
    inclinacion: 1,
  },
  joya: {
    vertices: VERTICES_OCTAEDRO,
    caras: CARAS_OCTAEDRO,
    radio: 1.5,
    detalle: 2,
    escalaHalo: 1.34,
    giro: 1.7,
    inclinacion: 0.65,
    camara: 6.4,
  },
};

const VERTEX = /* glsl */ `
  attribute vec3 position;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform float uSize;

  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uSize;
  }
`;

const FRAGMENT = /* glsl */ `
  precision highp float;
  uniform vec3 uColor;
  uniform float uOpacity;

  void main() {
    gl_FragColor = vec4(uColor, uOpacity);
  }
`;

/**
 * Poliedro geodésico de `detalle` subdivisiones, normalizado a la esfera.
 * Devuelve las posiciones de los vértices y las aristas ya duplicadas, para
 * poder dibujarlas con `gl.LINES` sin buffers de índices.
 */
function poliedro({ vertices, caras }, radio, detalle) {
  const posiciones = vertices.map(([x, y, z]) => {
    const largo = Math.hypot(x, y, z) || 1;
    return [(x / largo) * radio, (y / largo) * radio, (z / largo) * radio];
  });

  let triangulos = caras;

  for (let d = 0; d < detalle; d++) {
    const cache = new Map();

    const puntoMedio = (i, j) => {
      const clave = i < j ? i + ":" + j : j + ":" + i;
      const guardado = cache.get(clave);
      if (guardado !== undefined) return guardado;

      const a = posiciones[i];
      const b = posiciones[j];
      const x = (a[0] + b[0]) / 2;
      const y = (a[1] + b[1]) / 2;
      const z = (a[2] + b[2]) / 2;
      const largo = Math.hypot(x, y, z) || 1;

      const indice = posiciones.length;
      posiciones.push([(x / largo) * radio, (y / largo) * radio, (z / largo) * radio]);
      cache.set(clave, indice);
      return indice;
    };

    const siguientes = [];
    for (const [a, b, c] of triangulos) {
      const ab = puntoMedio(a, b);
      const bc = puntoMedio(b, c);
      const ca = puntoMedio(c, a);
      siguientes.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]);
    }
    triangulos = siguientes;
  }

  const aristasVistas = new Set();
  const aristas = [];
  for (const [a, b, c] of triangulos) {
    for (const [i, j] of [[a, b], [b, c], [c, a]]) {
      const clave = i < j ? i + ":" + j : j + ":" + i;
      if (aristasVistas.has(clave)) continue;
      aristasVistas.add(clave);
      aristas.push(...posiciones[i], ...posiciones[j]);
    }
  }

  const puntos = new Float32Array(posiciones.length * 3);
  posiciones.forEach((p, i) => {
    puntos[i * 3] = p[0];
    puntos[i * 3 + 1] = p[1];
    puntos[i * 3 + 2] = p[2];
  });

  return { vertices: puntos, aristas: new Float32Array(aristas) };
}

/**
 * Monta la escena 3D dentro de `host` y devuelve una función de limpieza.
 *
 * Módulo puro (sin React) a propósito: así Rollup puede eliminar de OGL todo
 * lo que no se usa y el chunk se queda en unos pocos kB.
 *
 * - `variante`: "hero" (icosaedro) o "joya" (octaedro).
 * - Respeta `prefers-reduced-motion`: dibuja un único fotograma estático.
 * - Pausa el bucle cuando la pestaña está oculta o el canvas sale de pantalla.
 * - Se recolorea al cambiar entre tema claro y oscuro.
 */
export function crearEscena(host, { reduced = false, variante = "hero" } = {}) {
  const forma = FORMAS[variante] ?? FORMAS.hero;

  let ancho = host.clientWidth || 1;
  let alto = host.clientHeight || 1;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  let renderer;
  try {
    renderer = new Renderer({
      width: ancho,
      height: alto,
      dpr,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
  } catch {
    // Sin WebGL disponible: no montamos nada y no rompemos la página.
    return () => {};
  }

  const gl = renderer.gl;
  gl.canvas.style.display = "block";
  host.appendChild(gl.canvas);

  const camera = new Camera(gl, { fov: 45, near: 0.1, far: 100 });
  camera.position.z = forma.camara ?? 5.2;
  camera.perspective({ aspect: ancho / alto });

  const escena = new Transform();

  // Un único objeto Color compartido: cambiar el tema recolorea las tres mallas.
  const color = new Color(esClaro() ? MORADO_CLARO : MORADO);

  // La joya de `#joyas` vive dentro de una vitrina: su giro y su color los dicta
  // el progreso de scroll (variable `--vitrina`), no el reloj.
  const vitrina = variante === "joya" ? host.closest("[data-vitrina]") : null;
  let claro = esClaro();

  const PALETA = {
    oscuro: [[157, 0, 255], [198, 110, 255]],
    claro: [[109, 40, 140], [176, 118, 230]],
  };

  const aplicarColor = (p) => {
    const [a, b] = claro ? PALETA.claro : PALETA.oscuro;
    color.r = (a[0] + (b[0] - a[0]) * p) / 255;
    color.g = (a[1] + (b[1] - a[1]) * p) / 255;
    color.b = (a[2] + (b[2] - a[2]) * p) / 255;
  };

  const progreso = () => {
    if (!vitrina) return 0;
    const v = parseFloat(vitrina.style.getPropertyValue("--vitrina"));
    return Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 0;
  };

  // Los puntos se encogen en lienzos pequeños para que la densidad se parezca.
  const tamanoPunto = (w, h) =>
    Math.max(0.6, Math.min(1.15, Math.min(w, h) / 320)) * 3 * dpr;

  const { vertices, aristas } = poliedro(forma, forma.radio, forma.detalle);
  const geoAristas = new Geometry(gl, { position: { size: 3, data: aristas } });
  const geoVertices = new Geometry(gl, { position: { size: 3, data: vertices } });

  const programaLineas = new Program(gl, {
    vertex: VERTEX,
    fragment: FRAGMENT,
    uniforms: {
      uColor: { value: color },
      uOpacity: { value: 0.9 },
      uSize: { value: 1 },
    },
    transparent: true,
    depthTest: false,
  });

  const programaVertices = new Program(gl, {
    vertex: VERTEX,
    fragment: FRAGMENT,
    uniforms: {
      uColor: { value: color },
      uOpacity: { value: 0.95 },
      uSize: { value: tamanoPunto(ancho, alto) },
    },
    transparent: true,
    depthTest: false,
  });

  const programaHalo = new Program(gl, {
    vertex: VERTEX,
    fragment: FRAGMENT,
    uniforms: {
      uColor: { value: color },
      uOpacity: { value: 0.16 },
      uSize: { value: 1 },
    },
    transparent: true,
    depthTest: false,
  });

  const nucleo = new Transform();
  nucleo.setParent(escena);

  const mallaLineas = new Mesh(gl, {
    geometry: geoAristas,
    program: programaLineas,
    mode: gl.LINES,
    frustumCulled: false,
  });
  mallaLineas.setParent(nucleo);

  const mallaVertices = new Mesh(gl, {
    geometry: geoVertices,
    program: programaVertices,
    mode: gl.POINTS,
    frustumCulled: false,
  });
  mallaVertices.setParent(nucleo);

  // El halo reutiliza los mismos buffers, solo cambia la escala y la opacidad.
  const halo = new Transform();
  halo.scale.set(forma.escalaHalo, forma.escalaHalo, forma.escalaHalo);
  halo.setParent(escena);

  const mallaHalo = new Mesh(gl, {
    geometry: geoAristas,
    program: programaHalo,
    mode: gl.LINES,
    frustumCulled: false,
  });
  mallaHalo.setParent(halo);

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

  const pintar = () => {
    renderer.render({ scene: escena, camera });
  };

  const tick = (tiempo) => {
    raf = requestAnimationFrame(tick);
    const dt = Math.min((tiempo - ultimo) / 1000 || 0, 0.05);
    ultimo = tiempo;

    autoY += dt * 0.22 * forma.giro;
    actual.x += (objetivo.x - actual.x) * 0.045;
    actual.y += (objetivo.y - actual.y) * 0.045;

    if (vitrina) {
      // Giro scrubbed: el scroll manda, con una deriva mínima para que no
      // parezca congelada mientras el escenario está fijo.
      const p = progreso();
      nucleo.rotation.y = autoY * 0.3 + p * Math.PI * 2 * 1.4 + actual.x;
      nucleo.rotation.x = Math.sin(p * Math.PI) * 0.45 + actual.y * 0.5;
      halo.rotation.y = -p * Math.PI * 1.1 - autoY * 0.2;
      halo.rotation.z = p * 0.8;
      aplicarColor(p);
    } else {
      nucleo.rotation.y = autoY + actual.x;
      nucleo.rotation.x = actual.y * 0.75 * forma.inclinacion;
      halo.rotation.y = -autoY * 0.45;
      halo.rotation.z = autoY * 0.2;
    }

    pintar();

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
    claro = esClaro();
    if (vitrina) aplicarColor(progreso());
    else color.set(claro ? MORADO_CLARO : MORADO);
    if (reduced) pintar();
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
    camera.perspective({ aspect: w / h });
    renderer.setSize(w, h);
    programaVertices.uniforms.uSize.value = tamanoPunto(w, h);
    if (reduced) pintar();
  });
  ro.observe(host);

  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("heridev:theme", onThemeChange);
  document.addEventListener("visibilitychange", onVisibilityChange);

  // Entrada suave: el canvas nace transparente (clase `opacity-0`) y aparece
  // cuando ya hay un fotograma dibujado. Sin animación si se pide movimiento reducido.
  if (reduced) {
    // Fotograma único: la figura se ve, pero no se mueve.
    pintar();
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

    geoAristas.remove();
    geoVertices.remove();
    programaLineas.remove();
    programaVertices.remove();
    programaHalo.remove();

    // Libera el contexto WebGL en cuanto se desmonta la isla.
    const perderContexto = gl.getExtension("WEBGL_lose_context");
    if (perderContexto) perderContexto.loseContext();

    if (gl.canvas.parentNode === host) host.removeChild(gl.canvas);
  };
}

function esClaro() {
  return document.documentElement.dataset.theme === "light";
}
