import { useState, useEffect, useCallback } from "react";

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

export default function Terminal() {
  const [visibleLines, setVisibleLines] = useState(1);
  const [currentText, setCurrentText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const typeLine = useCallback((line, index) => {
    if (index >= lines.length) return;
    setIsTyping(true);
    let charIndex = 0;
    const interval = setInterval(() => {
      charIndex++;
      setCurrentText(line.slice(0, charIndex));
      if (charIndex >= line.length) {
        clearInterval(interval);
        setIsTyping(false);
        setVisibleLines((prev) => prev + 1);
        setTimeout(() => {
          typeLine(lines[index + 1], index + 1);
        }, 300);
      }
    }, 25);
  }, []);

  useEffect(() => {
    setTimeout(() => typeLine(lines[0], 0), 500);
  }, [typeLine]);

  return (
    <div class="w-full rounded-lg border border-cian/20 bg-fondo/90 p-4 font-mono text-sm shadow-lg">
      <div class="mb-2 flex items-center gap-2 border-b border-cian/10 pb-2">
        <span class="h-3 w-3 rounded-full bg-red-500" />
        <span class="h-3 w-3 rounded-full bg-yellow-500" />
        <span class="h-3 w-3 rounded-full bg-green-500" />
        <span class="ml-2 text-xs text-texto/50">terminal — heridev</span>
      </div>
      <div class="space-y-1">
        {lines.slice(0, visibleLines - 1).map((line, i) => (
          <div key={i} class="text-texto/80">
            {line}
          </div>
        ))}
        {visibleLines <= lines.length && (
          <div class="text-cian">
            {currentText}
            <span class="animate-neon-pulse ml-1 inline-block h-4 w-2 bg-cian" />
          </div>
        )}
      </div>
    </div>
  );
}
