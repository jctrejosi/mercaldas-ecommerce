import { useState, useEffect } from "react";
import { Loader2, Save } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function General() {
  const [logoUrl, setLogoUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);

  const load = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/landing/general-logo`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setLogoUrl(data.url ?? "");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setOk(false);
    try {
      let url = logoUrl;
      if (pendingFile) {
        const fd = new FormData();
        fd.append("file", pendingFile);
        fd.append("code", "logo_mercaldas");
        const res = await fetch(`${API_BASE_URL}/upload/image`, {
          method: "POST",
          body: fd,
        });
        if (!res.ok) throw new Error("Error al subir la imagen");
        const data = await res.json();
        url = data.url;
        setLogoUrl(url);
        setPendingFile(null);
        setPendingPreview("");
      }
      const res = await fetch(`${API_BASE_URL}/admin/landing/general-logo`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) throw new Error("Error al guardar");
      setOk(true);
    } catch (e: any) {
      setError(e.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">General</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Configuración general de la tienda
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 max-w-xl space-y-5">
        <div>
          <h3 className="font-semibold text-sm text-gray-900">Logo de la empresa</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Aparece en el header (junto al buscador) y en el footer. Si no se configura, se muestra el logo de texto.
          </p>
        </div>

        {/* Vista previa del logo actual */}
        {(pendingPreview || logoUrl) ? (
          <div className="border border-gray-200 rounded-xl p-4 flex items-center justify-center bg-gray-50">
            <img
              src={pendingPreview || logoUrl}
              alt="Logo"
              className="h-12 object-contain"
            />
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-gray-400 text-sm">
            Sin logo configurado
            <span className="text-xs">— se usará el logo de texto por defecto</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Subir imagen
          </label>
          <div className="flex items-center gap-3">
            <label className="flex items-center justify-center gap-1 px-4 py-2 text-xs font-semibold border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              Elegir archivo
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setPendingFile(file);
                  setPendingPreview(URL.createObjectURL(file));
                }}
                className="hidden"
              />
            </label>
            <input
              value={logoUrl}
              onChange={(e) => {
                setLogoUrl(e.target.value);
                setPendingFile(null);
                setPendingPreview("");
              }}
              placeholder="…o pega una URL de imagen"
              className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 font-mono"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        {ok && <p className="text-sm text-green-600">Logo guardado correctamente</p>}

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-500 rounded-xl transition-colors disabled:opacity-50"
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          <Save size={14} /> Guardar logo
        </button>
      </div>
    </div>
  );
}
