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
  return (
    <div className="w-full rounded-lg border border-cian/20 bg-fondo/90 p-4 font-mono text-sm shadow-lg">
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
              style={{
                clipPath: "inset(0 100% 0 0)",
                animation: `typing ${line.length * SPEED}ms ${i * DELAY}ms forwards`,
              }}
            >
              {line}
            </span>
            {i === LINES.length - 1 && (
              <span
                className="ml-0.5 inline-block h-4 w-2 bg-cian"
                style={{
                  opacity: 0,
                  animation: `blink 0.5s step-end infinite alternate ${(LINES.length - 1) * DELAY + LINES[LINES.length - 1].length * SPEED}ms`,
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
