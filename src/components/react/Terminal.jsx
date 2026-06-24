const lines = [
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
const LINE_DELAY = 400;

export default function Terminal() {
  return (
    <div class="w-full rounded-lg border border-cian/20 bg-fondo/90 p-4 font-mono text-sm shadow-lg">
      <div class="mb-2 flex items-center gap-2 border-b border-cian/10 pb-2">
        <span class="h-3 w-3 rounded-full bg-red-500" />
        <span class="h-3 w-3 rounded-full bg-yellow-500" />
        <span class="h-3 w-3 rounded-full bg-green-500" />
        <span class="ml-2 text-xs text-texto/50">terminal — heridev</span>
      </div>
      <div class="space-y-0.5">
        {lines.map((line, i) => (
          <div key={i} class="flex">
            <span
              class="inline-block overflow-hidden whitespace-nowrap text-texto/80"
              style={{
                maxWidth: 0,
                animation: `typing ${line.length * SPEED}ms ${i * LINE_DELAY}ms forwards`,
              }}
            >
              {line}
            </span>
            {i === lines.length - 1 && (
              <span
                class="inline-block h-4 w-2 bg-cian"
                style={{
                  opacity: 0,
                  animation: "blink 0.5s step-end infinite alternate",
                  animationDelay: `${(lines.length - 1) * LINE_DELAY + lines[lines.length - 1].length * SPEED}ms`,
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
