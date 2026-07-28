import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, MapPin, Plus, Pencil, Trash2 } from "lucide-react";
import { customerAddressService, type CustomerAddress } from "../../services/customer-auth.service";

interface AddressModalProps {
  open: boolean;
  onClose: () => void;
  customer: { firstName?: string; fullName?: string } | null;
  onLoginModal: (view: "choice" | "login" | "register") => void;
  onAddressesChange?: (defaultAddress: CustomerAddress | null) => void;
}

const ICONS = ["🏠", "🏢", "🛒", "🏖️", "📍"];

export function AddressModal({ open, onClose, customer, onLoginModal, onAddressesChange }: AddressModalProps) {
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ alias: "", addressLine1: "", city: "Manizales", reference: "", deliveryInstructions: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && customer) {
      setLoading(true);
      customerAddressService.getAddresses()
        .then(setAddresses)
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [open, customer]);

  if (!open) return null;

  if (!customer) {
    return createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8 text-center mx-4" onClick={(e) => e.stopPropagation()}>
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-bold text-lg mb-2">Inicia sesión</h3>
          <p className="text-sm text-muted-foreground mb-6">Debes iniciar sesión para administrar tus direcciones de entrega.</p>
          <button onClick={() => { onClose(); onLoginModal("login"); }} className="w-full py-2.5 rounded-xl font-bold text-sm transition-all hover:brightness-95" style={{ background: "#FFF200", color: "#1A1A2E" }}>Iniciar sesión</button>
        </div>
      </div>,
      document.body
    );
  }

  const defaultAddr = addresses.find(a => a.isDefault);
  const notifyChange = (updated: CustomerAddress[]) => {
    setAddresses(updated);
    onAddressesChange?.(updated.find(a => a.isDefault) ?? null);
  };

  const handleSetDefault = async (id: number) => {
    try {
      await customerAddressService.setDefault(id);
      notifyChange(addresses.map(a => ({ ...a, isDefault: a.id === id })));
    } catch {}
  };

  const handleDelete = async (id: number) => {
    try {
      await customerAddressService.deleteAddress(id);
      notifyChange(addresses.filter(a => a.id !== id));
    } catch {}
  };

  const openEdit = (addr: CustomerAddress) => {
    setForm({ alias: addr.alias ?? "", addressLine1: addr.addressLine1, city: addr.city, reference: addr.reference ?? "", deliveryInstructions: addr.deliveryInstructions ?? "" });
    setEditingId(addr.id);
    setShowForm(true);
  };

  const openNew = () => { setForm({ alias: "", addressLine1: "", city: "Manizales", reference: "", deliveryInstructions: "" }); setEditingId(null); setShowForm(true); };

  const handleSave = async () => {
    if (!form.addressLine1) return;
    setSaving(true);
    try {
      if (editingId) {
        await customerAddressService.updateAddress(editingId, { alias: form.alias || null, addressLine1: form.addressLine1, city: form.city, reference: form.reference || null, deliveryInstructions: form.deliveryInstructions || null, isDefault: false });
        const updated = await customerAddressService.getAddresses();
        notifyChange(updated);
      } else {
        await customerAddressService.createAddress({ alias: form.alias || null, addressLine1: form.addressLine1, city: form.city, reference: form.reference || null, deliveryInstructions: form.deliveryInstructions || null, isDefault: false });
        const updated = await customerAddressService.getAddresses();
        notifyChange(updated);
      }
      setShowForm(false); setEditingId(null);
    } catch {} finally { setSaving(false); }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="font-bold text-lg text-foreground">Direcciones de entrega</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{defaultAddr ? `Predeterminada: ${defaultAddr.alias || defaultAddr.addressLine1}` : "Sin dirección predeterminada"}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"><X className="w-4 h-4" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12"><div className="w-6 h-6 border-2 border-foreground border-t-transparent rounded-full animate-spin" /></div>
          ) : showForm ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-bold text-sm">{editingId ? "Editar dirección" : "Nueva dirección"}</p>
                <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-xs text-muted-foreground underline hover:text-foreground">Cancelar</button>
              </div>
              {[
                { key: "alias", placeholder: "Etiqueta (Ej: Casa, Oficina)" },
                { key: "addressLine1", placeholder: "Dirección completa *", required: true },
                { key: "city", placeholder: "Ciudad" },
                { key: "reference", placeholder: "Referencia (nombre de quien recibe)" },
                { key: "deliveryInstructions", placeholder: "Instrucciones (timbre, piso, etc.)" },
              ].map(({ key, placeholder, required }) => (
                <input key={key} placeholder={placeholder + (required ? " *" : "")} value={(form as any)[key] ?? ""} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full text-xs border border-border rounded-lg px-3 py-2.5 focus:outline-none" onFocus={e => e.target.style.boxShadow = "0 0 0 2px #FFF200"} onBlur={e => e.target.style.boxShadow = "none"} />
              ))}
              <button onClick={handleSave} disabled={saving} className="w-full py-2.5 rounded-xl text-xs font-bold transition-all hover:brightness-95 disabled:opacity-50" style={{ background: "#FFF200", color: "#1A1A2E" }}>
                {saving ? "Guardando..." : editingId ? "Guardar cambios" : "Agregar dirección"}
              </button>
            </div>
          ) : (
            <>
              {addresses.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="font-bold text-sm mb-1">Sin direcciones</p>
                  <p className="text-xs text-muted-foreground mb-4">Guarda tus direcciones para hacer pedidos más rápido.</p>
                  <button onClick={openNew} className="px-4 py-2 rounded-xl text-xs font-bold transition-all hover:brightness-95" style={{ background: "#FFF200", color: "#1A1A2E" }}><Plus className="w-3 h-3 inline mr-1" /> Agregar dirección</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr, i) => (
                    <div key={addr.id} className={`p-4 rounded-xl border-2 transition-colors ${addr.isDefault ? "border-foreground" : "border-border hover:border-muted-foreground"}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{ICONS[i % ICONS.length]}</span>
                          <div>
                            <p className="font-bold text-sm text-foreground">{addr.alias || addr.addressLine1}</p>
                            {addr.isDefault && <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background: "#FFF200", color: "#1A1A2E" }}>PREDETERMINADA</span>}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(addr)} className="w-7 h-7 rounded-lg flex items-center justify-center border border-border hover:bg-muted transition-colors"><Pencil className="w-3 h-3 text-muted-foreground" /></button>
                          <button onClick={() => handleDelete(addr.id)} className="w-7 h-7 rounded-lg flex items-center justify-center border border-border hover:bg-muted transition-colors"><Trash2 className="w-3 h-3 text-muted-foreground" /></button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ""}</p>
                      <p className="text-xs text-muted-foreground">{addr.city}{addr.reference ? ` · ${addr.reference}` : ""}</p>
                      {addr.deliveryInstructions && <p className="text-xs text-muted-foreground mt-0.5 italic">{addr.deliveryInstructions}</p>}
                      {!addr.isDefault && (
                        <button onClick={() => handleSetDefault(addr.id)} className="mt-2 text-xs font-semibold text-muted-foreground underline hover:text-foreground transition-colors">Establecer como predeterminada</button>
                      )}
                    </div>
                  ))}
                  <button onClick={openNew} className="w-full py-2.5 rounded-xl text-xs font-bold border-2 border-dashed border-border hover:border-foreground hover:bg-muted transition-all text-muted-foreground"><Plus className="w-3 h-3 inline mr-1" /> Agregar nueva dirección</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

export function getAddressDisplay(addr: CustomerAddress | null): string {
  if (!addr) return "Administrar direcciones";
  const label = addr.alias || addr.addressLine1;
  return label.length > 25 ? label.slice(0, 25) + "..." : label;
}
