import { lazy, Suspense } from "react";

const Spline = lazy(() => import("@splinetool/react-spline"));

export default function SplineViewer({ scene }) {
  return (
    <div className="relative w-full h-[400px] overflow-hidden rounded-lg">
      <Suspense
        fallback={
          <div className="flex h-full items-center justify-center bg-gris/50">
            <div className="animate-neon-pulse text-cian text-sm tracking-widest uppercase">
              Cargando escena 3D...
            </div>
          </div>
        }
      >
        <Spline scene={scene} />
      </Suspense>
    </div>
  );
}
