import { AlertTriangle, Frown, Home, RefreshCw, ServerCrash, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

interface ErrorPageProps {
  statusCode: 404 | 500 | 502 | 503;
  onRetry?: () => void;
  onGoHome: () => void;
}

const ERROR_CONFIG: Record<
  number,
  { title: string; subtitle: string; description: string; color: string; bgLight: string; icon: typeof AlertTriangle }
> = {
  404: {
    title: "Página no encontrada",
    subtitle: "Esta página no existe o fue movida",
    description:
      "El enlace que seguiste puede estar roto o la página ha sido eliminada. Verifica la dirección o vuelve al inicio.",
    color: "#EAB308",
    bgLight: "#FEF9C3",
    icon: Frown,
  },
  500: {
    title: "Servidor no disponible",
    subtitle: "Error interno del servidor",
    description:
      "Ocurrió un error inesperado. Nuestro equipo técnico ha sido notificado. Por favor, intenta de nuevo en unos minutos.",
    color: "#EF4444",
    bgLight: "#FEE2E2",
    icon: AlertTriangle,
  },
  502: {
    title: "Servidor no disponible",
    subtitle: "Puerta de enlace inválida",
    description:
      "El servidor recibió una respuesta inválida de otro servidor. Esto suele ser temporal. Intenta recargar la página.",
    color: "#EF4444",
    bgLight: "#FEE2E2",
    icon: ServerCrash,
  },
  503: {
    title: "Servidor no disponible",
    subtitle: "Servicio temporalmente fuera de línea",
    description:
      "El servicio está en mantenimiento o sobrecargado. Intenta de nuevo en unos momentos.",
    color: "#EF4444",
    bgLight: "#FEE2E2",
    icon: ServerCrash,
  },
};

export function ErrorPage({ statusCode, onRetry, onGoHome }: ErrorPageProps) {
  const [visible, setVisible] = useState(false);
  const config = ERROR_CONFIG[statusCode] ?? ERROR_CONFIG[500];
  const Icon = config.icon;
  const isClientError = statusCode === 404;

  useEffect(() => {
    const timer = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: config.bgLight }}
      role="alert"
      aria-live="polite"
    >
      <div
        className={`max-w-md w-full text-center transition-all duration-500 ease-out ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div
            className="w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center animate-bounce"
            style={{ background: config.color }}
            aria-hidden="true"
          >
            <Icon className="w-12 h-12 md:w-14 md:h-14 text-white" />
          </div>
        </div>

        {/* Status code */}
        <p
          className="text-8xl md:text-9xl font-black leading-none mb-2 select-none"
          style={{ color: config.color, fontFamily: "'Bricolage Grotesque', sans-serif" }}
          aria-hidden="true"
        >
          {statusCode}
        </p>

        {/* Title */}
        <h1
          className="text-2xl md:text-3xl font-black mt-2"
          style={{ color: "#1A1A2E", fontFamily: "'Bricolage Grotesque', sans-serif" }}
        >
          {config.title}
        </h1>

        {/* Subtitle */}
        <p className="text-sm md:text-base font-semibold mt-1" style={{ color: "#6B7280" }}>
          {config.subtitle}
        </p>

        {/* Description */}
        <p className="text-xs md:text-sm mt-3 leading-relaxed" style={{ color: "#9CA3AF" }}>
          {config.description}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          {isClientError ? (
            <button
              onClick={() => window.history.back()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                background: "#F3F4F6",
                color: "#1A1A2E",
                outlineColor: "#1A1A2E",
              }}
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              Volver
            </button>
          ) : onRetry ? (
            <button
              onClick={onRetry}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                background: config.color,
                color: "#FFFFFF",
                outlineColor: config.color,
              }}
            >
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              Reintentar
            </button>
          ) : null}

          <button
            onClick={onGoHome}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              background: isClientError ? config.color : "#1A1A2E",
              color: isClientError ? "#1A1A2E" : "#FFFFFF",
              outlineColor: isClientError ? config.color : "#1A1A2E",
            }}
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            Ir al inicio
          </button>
        </div>
      </div>
    </div>
  );
}
