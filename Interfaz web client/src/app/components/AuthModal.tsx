import { X } from "lucide-react";
import { Logo } from "../Logo";
import { SocialAuthButtons } from "../SocialAuthButtons";
import type { CartItem } from "../types";

interface AuthModalProps {
  loginModal: boolean;
  modalView: "choice" | "login" | "register";
  authError: string | null;
  authLoading: boolean;
  cartItems: CartItem[];
  socialLogin: (
    provider: "google" | "facebook",
    accessToken: string,
    userData?: { email?: string; name?: string; picture?: string; id?: string },
  ) => Promise<unknown>;
  onClose: () => void;
  onSetModalView: (view: "choice" | "login" | "register") => void;
  onLoginSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  onRegisterSubmit: (e: React.FormEvent) => Promise<void>;
  onSocialSuccess: () => void;
  onSocialError: (error: unknown) => void;
}

export function AuthModal({
  loginModal,
  modalView,
  authError,
  authLoading,
  socialLogin,
  onClose,
  onSetModalView,
  onLoginSubmit,
  onRegisterSubmit,
  onSocialSuccess,
  onSocialError,
}: AuthModalProps) {
  if (!loginModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0"
        style={{
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(4px)",
        }}
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header strip */}
        <div className="px-6 pt-6 pb-4 border-b border-border">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <Logo dark={true} />
          {modalView === "choice" && (
            <>
              <h2
                className="font-black text-xl mt-3"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
              >
                Ingresa para continuar
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Necesitas una cuenta para completar tu pedido.
              </p>
            </>
          )}
          {modalView === "login" && (
            <>
              <h2
                className="font-black text-xl mt-3"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
              >
                Iniciar sesión
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Bienvenido de nuevo a Mercaldas.
              </p>
            </>
          )}
          {modalView === "register" && (
            <>
              <h2
                className="font-black text-xl mt-3"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
              >
                Crear cuenta
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Regístrate gratis y empieza a comprar.
              </p>
            </>
          )}
        </div>

        <div className="px-6 py-5 space-y-3">
          {/* ── Vista: choice ── */}
          {modalView === "choice" && (
            <>
              <button
                onClick={() => onSetModalView("login")}
                className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:brightness-95 active:scale-95"
                style={{ background: "#1A1A2E", color: "#FFF200" }}
              >
                Iniciar sesión
              </button>
              <button
                onClick={() => onSetModalView("register")}
                className="w-full py-3 rounded-xl font-bold text-sm border border-border hover:bg-muted transition-colors text-foreground"
              >
                Crear cuenta gratis
              </button>
              <p className="text-xs text-center text-muted-foreground pt-1">
                Al continuar aceptas nuestros{" "}
                <a href="#" className="underline hover:text-foreground">
                  Términos de uso
                </a>{" "}
                y{" "}
                <a href="#" className="underline hover:text-foreground">
                  Privacidad
                </a>
              </p>
            </>
          )}

          {/* ── Vista: login ── */}
          {modalView === "login" && (
            <form onSubmit={onLoginSubmit} className="space-y-3">
              <SocialAuthButtons
                label="Iniciar sesión"
                socialLogin={socialLogin}
                onSuccess={onSocialSuccess}
                onError={onSocialError}
              />

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="tu@correo.com"
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/50 text-sm focus:outline-none transition-all"
                  onFocus={(e) => {
                    e.target.style.boxShadow = "0 0 0 2px #FFF200";
                    e.target.style.borderColor = "#FFF200";
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = "none";
                    e.target.style.borderColor = "";
                  }}
                  disabled={authLoading}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-foreground">
                    Contraseña
                  </label>
                  <a
                    href="#"
                    className="text-xs text-muted-foreground hover:text-foreground underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/50 text-sm focus:outline-none transition-all"
                  onFocus={(e) => {
                    e.target.style.boxShadow = "0 0 0 2px #FFF200";
                    e.target.style.borderColor = "#FFF200";
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = "none";
                    e.target.style.borderColor = "";
                  }}
                  disabled={authLoading}
                />
              </div>

              {authError && (
                <div className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2 text-center">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:brightness-95 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "#1A1A2E", color: "#FFF200" }}
              >
                {authLoading ? "Iniciando sesión..." : "Iniciar sesión"}
              </button>

              <p className="text-xs text-center text-muted-foreground pt-1">
                ¿No tienes cuenta?{" "}
                <button
                  type="button"
                  onClick={() => onSetModalView("register")}
                  className="font-semibold text-foreground underline hover:no-underline"
                >
                  Regístrate gratis
                </button>
              </p>
            </form>
          )}

          {/* ── Vista: register ── */}
          {modalView === "register" && (
            <form onSubmit={onRegisterSubmit} className="space-y-3">
              <SocialAuthButtons
                label="Registrarse"
                socialLogin={socialLogin}
                onSuccess={onSocialSuccess}
                onError={onSocialError}
              />

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="Carlos"
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/50 text-sm focus:outline-none transition-all"
                    onFocus={(e) => {
                      e.target.style.boxShadow = "0 0 0 2px #FFF200";
                      e.target.style.borderColor = "#FFF200";
                    }}
                    onBlur={(e) => {
                      e.target.style.boxShadow = "none";
                      e.target.style.borderColor = "";
                    }}
                    disabled={authLoading}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Apellido
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Ríos"
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/50 text-sm focus:outline-none transition-all"
                    onFocus={(e) => {
                      e.target.style.boxShadow = "0 0 0 2px #FFF200";
                      e.target.style.borderColor = "#FFF200";
                    }}
                    onBlur={(e) => {
                      e.target.style.boxShadow = "none";
                      e.target.style.borderColor = "";
                    }}
                    disabled={authLoading}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="tu@correo.com"
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/50 text-sm focus:outline-none transition-all"
                  onFocus={(e) => {
                    e.target.style.boxShadow = "0 0 0 2px #FFF200";
                    e.target.style.borderColor = "#FFF200";
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = "none";
                    e.target.style.borderColor = "";
                  }}
                  disabled={authLoading}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Celular
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="300 123 4567"
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/50 text-sm focus:outline-none transition-all"
                  onFocus={(e) => {
                    e.target.style.boxShadow = "0 0 0 2px #FFF200";
                    e.target.style.borderColor = "#FFF200";
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = "none";
                    e.target.style.borderColor = "";
                  }}
                  disabled={authLoading}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/50 text-sm focus:outline-none transition-all"
                  onFocus={(e) => {
                    e.target.style.boxShadow = "0 0 0 2px #FFF200";
                    e.target.style.borderColor = "#FFF200";
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = "none";
                    e.target.style.borderColor = "";
                  }}
                  disabled={authLoading}
                />
              </div>

              {authError && (
                <div className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2 text-center">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:brightness-95 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "#1A1A2E", color: "#FFF200" }}
              >
                {authLoading ? "Creando cuenta..." : "Crear mi cuenta"}
              </button>

              <p className="text-xs text-center text-muted-foreground pt-1">
                ¿Ya tienes cuenta?{" "}
                <button
                  type="button"
                  onClick={() => onSetModalView("login")}
                  className="font-semibold text-foreground underline hover:no-underline"
                >
                  Inicia sesión
                </button>
              </p>
              <p className="text-xs text-center text-muted-foreground">
                Al registrarte aceptas nuestros{" "}
                <a href="#" className="underline hover:text-foreground">
                  Términos de uso
                </a>{" "}
                y{" "}
                <a href="#" className="underline hover:text-foreground">
                  Privacidad
                </a>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
