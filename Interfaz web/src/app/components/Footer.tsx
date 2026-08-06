import { useEffect, useState } from "react";
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
} from "lucide-react";
import { Logo } from "../Logo";
import type { CatalogCategory } from "../types";
import dsiLogo from "../../assets/logo.png";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const PAYMENT_ICONS = ["Visa", "Mastercard", "PSE", "Nequi", "Daviplata", "Efecty"];

const DEFAULT_CONFIG = {
  description:
    "El supermercado de Manizales con más de 30 años llevando los mejores productos a los hogares del Eje Cafetero.",
  socialLinks: [
    { platform: "facebook", url: "#" },
    { platform: "instagram", url: "#" },
    { platform: "twitter", url: "#" },
    { platform: "youtube", url: "#" },
  ] as { platform: string; url: string }[],
  resolvedCategories: [] as { code: string; name: string }[],
  helpLinks: [
    { label: "Centro de ayuda", url: "#" },
    { label: "Cómo comprar", url: "#" },
    { label: "Métodos de pago", url: "#" },
    { label: "Política de devoluciones", url: "#" },
    { label: "Términos y condiciones", url: "#" },
    { label: "Privacidad", url: "#" },
  ] as { label: string; url: string }[],
  contact: {
    address: "Cra 23 # 64-60, Manizales",
    phone: "(606) 890-1234",
    whatsapp: "3001234567",
    email: "servicio@mercaldas.com.co",
  },
  hours: "Lun–Dom · 6am – 10pm",
};

const SOCIAL_ICONS: Record<string, import("lucide-react").LucideIcon> = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  youtube: Youtube,
};

interface FooterProps {
  categories: CatalogCategory[];
  onCategoryClick: (categoryName: string) => void;
  generalLogo?: { url?: string } | null;
}

export function Footer({ categories, onCategoryClick, generalLogo }: FooterProps) {
  const [config, setConfig] = useState(DEFAULT_CONFIG);

  useEffect(() => {
    fetch(`${API_BASE_URL}/landing/footer`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && Object.keys(data).length > 0) setConfig({ ...DEFAULT_CONFIG, ...data });
      })
      .catch(() => {});
  }, []);

  // Categorías: de la config (resolvedCategories) o fallback a raíz del catálogo
  const footerCategories =
    config.resolvedCategories.length > 0
      ? config.resolvedCategories.map((c) => ({ id: 0, name: c.name, slug: c.code }))
      : categories.filter((c) => !c.parentId).slice(0, 6);

  const socialLinks = config.socialLinks || [];

  return (
    <footer className="pt-12 pb-6" style={{ background: "#111827" }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <Logo dark={false} logoSrc={generalLogo?.url} />
            <p className="text-xs mt-3 leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
              {config.description}
            </p>
            <div className="flex gap-2 mt-4">
              {socialLinks.map((s) => {
                const Icon = SOCIAL_ICONS[s.platform];
                if (!Icon) return null;
                return (
                  <a
                    key={s.platform}
                    href={s.url || "#"}
                    target={s.url ? "_blank" : undefined}
                    rel={s.url ? "noopener noreferrer" : undefined}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/20 cursor-pointer"
                    style={{ background: "rgba(255,255,255,0.08)" }}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.65)" }} />
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Categorías</h4>
            <ul className="space-y-2">
              {footerCategories.map((c) => (
                <li key={c.slug || c.name}>
                  <button
                    onClick={() => onCategoryClick(c.name)}
                    className="text-xs hover:text-white transition-colors text-left cursor-pointer underline-offset-4 hover:underline"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Ayuda</h4>
            <ul className="space-y-2">
              {config.helpLinks.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.url || "#"}
                    className="text-xs hover:text-white transition-colors cursor-pointer underline-offset-4 hover:underline"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Contacto</h4>
            <ul className="space-y-2">
              <li className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                📍 {config.contact.address}
              </li>
              <li className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                📞 {config.contact.phone}
              </li>
              <li className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                ✉️ {config.contact.email}
              </li>
              <li className="text-xs font-semibold text-white mt-3">Horario de atención</li>
              <li className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                {config.hours}
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t py-5" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <p className="text-xs mb-3 font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>
            Medios de pago aceptados
          </p>
          <div className="flex flex-wrap gap-2">
            {PAYMENT_ICONS.map((pm) => (
              <div
                key={pm}
                className="px-3 py-1.5 rounded-lg text-xs font-bold"
                style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.65)" }}
              >
                {pm}
              </div>
            ))}
          </div>
        </div>

        <div className="border-t pt-4 pb-2 relative flex items-center justify-center" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <a href="https://dsi.com.co" target="_blank" rel="noopener noreferrer" className="absolute left-0 flex items-center hover:opacity-80 transition-opacity">
            <img src={dsiLogo} alt="DSI SA" className="w-9 h-9 object-contain" />
          </a>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
            © 2026 Desarrollado por <span className="font-bold text-white/70">DSI SA</span> · Todos los derechos reservados
          </p>
          <p className="absolute right-0 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
            Manizales, Caldas, Colombia
          </p>
        </div>
      </div>
    </footer>
  );
}
