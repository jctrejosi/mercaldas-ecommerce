import { useState } from "react";
import {
  GripVertical, Eye, EyeOff, Settings, Plus, ChevronRight,
  LayoutTemplate, Image, Star, Zap, Tag, TrendingUp, ShoppingBag,
  BarChart2, Users, Store, Sparkles, Calendar, X, Save,
  ToggleLeft, ToggleRight, Palette, Monitor, Smartphone, ExternalLink,
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

type SectionType =
  | "hero" | "featured" | "promo_banner" | "marketplace" | "categories"
  | "bestsellers" | "new_products" | "seasonal" | "supplier_promos"
  | "brand_carousel" | "recommendations";

interface Section {
  id: string;
  type: SectionType;
  label: string;
  icon: React.ElementType;
  visible: boolean;
  scheduled: boolean;
  scheduleStart?: string;
  scheduleEnd?: string;
  title: string;
  subtitle: string;
  bgColor: string;
  hasCta: boolean;
  ctaText: string;
  clicks: number;
  views: number;
}

const SECTION_ICONS: Record<SectionType, React.ElementType> = {
  hero: LayoutTemplate, featured: Star, promo_banner: Image,
  marketplace: Store, categories: Tag, bestsellers: TrendingUp,
  new_products: ShoppingBag, seasonal: Sparkles, supplier_promos: BarChart2,
  brand_carousel: Users, recommendations: Zap,
};

const INITIAL_SECTIONS: Section[] = [
  { id: "s1", type: "hero", label: "Hero Banner Carousel", icon: SECTION_ICONS.hero, visible: true, scheduled: false, title: "Ofertas de la Semana", subtitle: "Hasta 40% de descuento en productos seleccionados", bgColor: "#FEF3C7", hasCta: true, ctaText: "Ver ofertas", clicks: 4823, views: 18420 },
  { id: "s2", type: "featured", label: "Productos Destacados", icon: SECTION_ICONS.featured, visible: true, scheduled: false, title: "Lo más vendido esta semana", subtitle: "", bgColor: "#FFFFFF", hasCta: false, ctaText: "", clicks: 2341, views: 12800 },
  { id: "s3", type: "promo_banner", label: "Banner Promocional", icon: SECTION_ICONS.promo_banner, visible: true, scheduled: true, scheduleStart: "2025-07-25", scheduleEnd: "2025-07-31", title: "Flash Sale — Viernes", subtitle: "Solo por hoy, precios imbatibles", bgColor: "#FEE2E2", hasCta: true, ctaText: "Aprovechar ahora", clicks: 1920, views: 9300 },
  { id: "s4", type: "marketplace", label: "Sección Marketplace", icon: SECTION_ICONS.marketplace, visible: true, scheduled: false, title: "Marcas que te recomendamos", subtitle: "Descubre productos exclusivos de nuestros socios", bgColor: "#F0FDF4", hasCta: false, ctaText: "", clicks: 890, views: 6100 },
  { id: "s5", type: "categories", label: "Categorías", icon: SECTION_ICONS.categories, visible: true, scheduled: false, title: "Compra por categoría", subtitle: "", bgColor: "#FFFFFF", hasCta: false, ctaText: "", clicks: 3102, views: 14200 },
  { id: "s6", type: "bestsellers", label: "Más Vendidos", icon: SECTION_ICONS.bestsellers, visible: true, scheduled: false, title: "Bestsellers de Mercaldas", subtitle: "Los favoritos de nuestra comunidad", bgColor: "#FFFFFF", hasCta: true, ctaText: "Ver todos", clicks: 2750, views: 11400 },
  { id: "s7", type: "new_products", label: "Nuevos Productos", icon: SECTION_ICONS.new_products, visible: false, scheduled: false, title: "Recién llegados", subtitle: "Descubre los últimos productos de nuestra tienda", bgColor: "#EFF6FF", hasCta: true, ctaText: "Explorar", clicks: 0, views: 0 },
  { id: "s8", type: "seasonal", label: "Campaña Estacional", icon: SECTION_ICONS.seasonal, visible: false, scheduled: true, scheduleStart: "2025-08-01", scheduleEnd: "2025-08-31", title: "Mes de la Independencia", subtitle: "Celebra con los mejores precios", bgColor: "#FEF3C7", hasCta: true, ctaText: "Celebrar ahora", clicks: 0, views: 0 },
  { id: "s9", type: "supplier_promos", label: "Promos de Proveedores", icon: SECTION_ICONS.supplier_promos, visible: true, scheduled: false, title: "Ofertas de nuestros socios", subtitle: "", bgColor: "#FFFFFF", hasCta: false, ctaText: "", clicks: 1450, views: 7300 },
  { id: "s10", type: "brand_carousel", label: "Carrusel de Marcas", icon: SECTION_ICONS.brand_carousel, visible: true, scheduled: false, title: "Nuestras marcas", subtitle: "", bgColor: "#F9FAFB", hasCta: false, ctaText: "", clicks: 620, views: 4100 },
  { id: "s11", type: "recommendations", label: "Recomendaciones", icon: SECTION_ICONS.recommendations, visible: false, scheduled: false, title: "Solo para ti", subtitle: "Basado en tus compras anteriores", bgColor: "#FFFFFF", hasCta: false, ctaText: "", clicks: 0, views: 0 },
];

function SectionPanel({ section, onUpdate, onClose }: {
  section: Section;
  onUpdate: (id: string, patch: Partial<Section>) => void;
  onClose: () => void;
}) {
  return (
    <div className="w-80 bg-white border-l border-gray-100 flex flex-col overflow-y-auto">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
        <h3 className="font-bold text-gray-900 text-sm">{section.label}</h3>
        <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
          <X size={14} />
        </button>
      </div>

      <div className="p-5 space-y-5">
        {/* Visibility toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-800">Visible</p>
            <p className="text-xs text-gray-400">Mostrar en el sitio web</p>
          </div>
          <button
            onClick={() => onUpdate(section.id, { visible: !section.visible })}
            className={`w-11 h-6 rounded-full relative transition-all ${section.visible ? "bg-amber-400" : "bg-gray-200"}`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${section.visible ? "right-1" : "left-1"}`} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Contenido</p>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Título</label>
            <input
              value={section.title}
              onChange={(e) => onUpdate(section.id, { title: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Subtítulo</label>
            <input
              value={section.subtitle}
              onChange={(e) => onUpdate(section.id, { subtitle: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300"
              placeholder="Opcional"
            />
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Botón CTA</p>
            <button
              onClick={() => onUpdate(section.id, { hasCta: !section.hasCta })}
              className={`w-9 h-5 rounded-full relative transition-all ${section.hasCta ? "bg-amber-400" : "bg-gray-200"}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${section.hasCta ? "right-0.5" : "left-0.5"}`} />
            </button>
          </div>
          {section.hasCta && (
            <input
              value={section.ctaText}
              onChange={(e) => onUpdate(section.id, { ctaText: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300"
              placeholder="Texto del botón"
            />
          )}
        </div>

        {/* Background */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Fondo</p>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg border border-gray-200" style={{ background: section.bgColor }} />
            <input
              value={section.bgColor}
              onChange={(e) => onUpdate(section.id, { bgColor: e.target.value })}
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 font-mono"
            />
          </div>
          <div className="flex gap-2">
            {["#FFFFFF", "#FEF3C7", "#EFF6FF", "#F0FDF4", "#FEE2E2", "#F9FAFB"].map((c) => (
              <button
                key={c}
                onClick={() => onUpdate(section.id, { bgColor: c })}
                className={`w-6 h-6 rounded-md border-2 transition-all ${section.bgColor === c ? "border-amber-400 scale-110" : "border-gray-200"}`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>

        {/* Scheduling */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Programar</p>
            <button
              onClick={() => onUpdate(section.id, { scheduled: !section.scheduled })}
              className={`w-9 h-5 rounded-full relative transition-all ${section.scheduled ? "bg-amber-400" : "bg-gray-200"}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${section.scheduled ? "right-0.5" : "left-0.5"}`} />
            </button>
          </div>
          {section.scheduled && (
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Fecha inicio</label>
                <input type="date" defaultValue={section.scheduleStart} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Fecha fin</label>
                <input type="date" defaultValue={section.scheduleEnd} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300" />
              </div>
            </div>
          )}
        </div>

        {/* Analytics */}
        {(section.views > 0 || section.clicks > 0) && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Analítica (últimos 7 días)</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-gray-900">{section.views.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Vistas</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-gray-900">{section.clicks.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Clics</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 text-center">CTR: <strong className="text-amber-600">{((section.clicks / section.views) * 100).toFixed(1)}%</strong></p>
            </div>
          </div>
        )}
      </div>

      <div className="p-5 border-t border-gray-100 mt-auto sticky bottom-0 bg-white">
        <button className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold bg-amber-400 text-amber-900 hover:bg-amber-500 rounded-xl transition-colors">
          <Save size={14} /> Guardar cambios
        </button>
      </div>
    </div>
  );
}

function SectionPreview({ section }: { section: Section }) {
  return (
    <div
      className="rounded-xl border-2 border-dashed border-gray-200 p-4 text-center"
      style={{ background: section.bgColor || "#fff" }}
    >
      <div className="flex items-center justify-center gap-2 mb-1">
        <section.icon size={14} className="text-gray-400" />
        <span className="text-xs font-semibold text-gray-500">{section.label}</span>
      </div>
      {section.title && <p className="text-sm font-bold text-gray-700">{section.title}</p>}
      {section.subtitle && <p className="text-xs text-gray-500 mt-0.5">{section.subtitle}</p>}
      {section.hasCta && section.ctaText && (
        <span className="inline-block mt-2 px-3 py-1 text-xs font-semibold bg-amber-400 text-amber-900 rounded-lg">{section.ctaText}</span>
      )}
    </div>
  );
}

export default function HomepageEditor() {
  const [sections, setSections] = useState<Section[]>(INITIAL_SECTIONS);
  const [activeSection, setActiveSection] = useState<Section | null>(null);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [previewOpen, setPreviewOpen] = useState(false);

  function updateSection(id: string, patch: Partial<Section>) {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    setActiveSection((prev) => (prev?.id === id ? { ...prev, ...patch } : prev));
  }

  function onDragEnd(result: any) {
    if (!result.destination) return;
    const items = Array.from(sections);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setSections(items);
  }

  const visibleCount = sections.filter((s) => s.visible).length;
  const scheduledCount = sections.filter((s) => s.scheduled).length;

  return (
    <div className="flex h-full">
      {/* Main editor */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Editor de Página de Inicio</h1>
            <p className="text-xs text-gray-400 mt-0.5">{visibleCount} secciones visibles · {scheduledCount} programadas</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Preview device toggle */}
            <div className="flex items-center bg-gray-100 rounded-xl p-1">
              <button onClick={() => setPreviewMode("desktop")} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${previewMode === "desktop" ? "bg-white shadow-sm text-gray-800" : "text-gray-500"}`}>
                <Monitor size={13} /> Escritorio
              </button>
              <button onClick={() => setPreviewMode("mobile")} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${previewMode === "mobile" ? "bg-white shadow-sm text-gray-800" : "text-gray-500"}`}>
                <Smartphone size={13} /> Móvil
              </button>
            </div>
            <button
              onClick={() => setPreviewOpen(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <ExternalLink size={14} /> Vista previa
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-500 rounded-xl transition-colors">
              <Save size={14} /> Publicar
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">
            {/* Instructions */}
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-6">
              <GripVertical size={14} className="text-blue-500 shrink-0" />
              <p className="text-sm text-blue-700">Arrastra las secciones para reordenarlas. Haz clic en cualquier sección para editar su contenido.</p>
            </div>

            {/* Drag & drop list */}
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="sections">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                    {sections.map((section, index) => (
                      <Draggable key={section.id} draggableId={section.id} index={index}>
                        {(prov, snapshot) => (
                          <div
                            ref={prov.innerRef}
                            {...prov.draggableProps}
                            className={`bg-white rounded-2xl border transition-all ${snapshot.isDragging ? "shadow-xl border-amber-300 rotate-1" : activeSection?.id === section.id ? "border-amber-300 shadow-md" : "border-gray-100 hover:border-gray-200 hover:shadow-sm"}`}
                          >
                            <div className="flex items-center gap-3 p-4">
                              {/* Drag handle */}
                              <div {...prov.dragHandleProps} className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing transition-colors p-0.5">
                                <GripVertical size={16} />
                              </div>

                              {/* Icon */}
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${section.visible ? "bg-amber-100 text-amber-600" : "bg-gray-100 text-gray-400"}`}>
                                <section.icon size={15} />
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className={`text-sm font-semibold ${section.visible ? "text-gray-800" : "text-gray-400"}`}>
                                    {section.label}
                                  </p>
                                  {section.scheduled && (
                                    <span className="text-[10px] font-semibold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                                      <Calendar size={9} /> Programado
                                    </span>
                                  )}
                                </div>
                                {section.visible && section.title && (
                                  <p className="text-xs text-gray-400 truncate mt-0.5">"{section.title}"</p>
                                )}
                                {!section.visible && (
                                  <p className="text-xs text-gray-300 mt-0.5">Sección oculta</p>
                                )}
                              </div>

                              {/* Analytics mini */}
                              {section.views > 0 && (
                                <div className="hidden sm:flex items-center gap-3 text-right mr-2">
                                  <div>
                                    <p className="text-xs font-bold text-gray-700">{section.views.toLocaleString()}</p>
                                    <p className="text-[10px] text-gray-400">vistas</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-gray-700">{section.clicks.toLocaleString()}</p>
                                    <p className="text-[10px] text-gray-400">clics</p>
                                  </div>
                                </div>
                              )}

                              {/* Visibility toggle */}
                              <button
                                onClick={(e) => { e.stopPropagation(); updateSection(section.id, { visible: !section.visible }); }}
                                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${section.visible ? "text-green-500 hover:bg-green-50" : "text-gray-300 hover:bg-gray-100"}`}
                              >
                                {section.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                              </button>

                              {/* Edit button */}
                              <button
                                onClick={() => setActiveSection(activeSection?.id === section.id ? null : section)}
                                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${activeSection?.id === section.id ? "bg-amber-100 text-amber-600" : "hover:bg-gray-100 text-gray-400 hover:text-gray-600"}`}
                              >
                                <Settings size={14} />
                              </button>
                            </div>

                            {/* Preview when active */}
                            {activeSection?.id === section.id && (
                              <div className="px-4 pb-4">
                                <SectionPreview section={section} />
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            {/* Add section */}
            <button className="w-full mt-4 flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-2xl text-sm text-gray-400 hover:border-amber-300 hover:text-amber-600 transition-colors">
              <Plus size={16} /> Añadir nueva sección
            </button>
          </div>
        </div>
      </div>

      {/* Settings panel */}
      {activeSection && (
        <SectionPanel
          section={sections.find((s) => s.id === activeSection.id) || activeSection}
          onUpdate={updateSection}
          onClose={() => setActiveSection(null)}
        />
      )}

      {/* Preview modal */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-8">
          <div className={`bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col ${previewMode === "mobile" ? "w-96 h-[700px]" : "w-full max-w-4xl h-[600px]"}`}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-white rounded-lg border border-gray-200 px-3 py-1 text-xs text-gray-500 text-center">mercaldas.com</div>
              </div>
              <button onClick={() => setPreviewOpen(false)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-200 text-gray-500 transition-colors">
                <X size={14} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {sections.filter((s) => s.visible).map((s) => (
                <div key={s.id} className="rounded-xl overflow-hidden border border-gray-100">
                  <SectionPreview section={s} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
