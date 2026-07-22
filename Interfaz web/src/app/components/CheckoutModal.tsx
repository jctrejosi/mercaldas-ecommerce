import {
  ArrowLeft,
  X,
  ChevronRight,
  CheckCircle2,
  Truck,
  Clock,
  MapPin,
  Wallet,
  Banknote,
  Smartphone,
  Building2,
  CreditCard,
} from "lucide-react";
import { Logo } from "../Logo";
import type { CartItem } from "../types";
import type {
  EpaycoConfigResponse,
  WompiConfigResponse,
} from "../../services/orders.service";

type EpaycoConfig = EpaycoConfigResponse;
type WompiConfig = WompiConfigResponse;

interface CheckoutModalProps {
  checkoutOpen: boolean;
  checkoutStep: number;
  cartItems: CartItem[];
  cartTotal: number;
  checkoutAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    notes: string;
  };
  checkoutShipping: "standard" | "express";
  checkoutPayment: "efectivo" | "tarjeta" | "nequi" | "pse";
  checkoutLoading: boolean;
  checkoutError: string | null;
  cardPayment: {
    cardholderName: string;
    cardNumber: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
    installments: string;
  };
  cardGateway: "epayco" | "wompi";
  wompiAcceptance: {
    terms: boolean;
    personalData: boolean;
  };
  wompiConfig: WompiConfig | null;
  psePayment: {
    bank: string;
    personType: "natural" | "juridica";
  };
  nequiPayment: {
    phone: string;
  };
  lastOrderId: string;
  onClose: () => void;
  onSetCheckoutStep: (step: number) => void;
  onSetCheckoutAddress: (
    updater: (
      prev: CheckoutModalProps["checkoutAddress"],
    ) => CheckoutModalProps["checkoutAddress"],
  ) => void;
  onSetCheckoutShipping: (shipping: "standard" | "express") => void;
  onSetCheckoutPayment: (
    payment: "efectivo" | "tarjeta" | "nequi" | "pse",
  ) => void;
  onSetCardPayment: (
    updater: (
      prev: CheckoutModalProps["cardPayment"],
    ) => CheckoutModalProps["cardPayment"],
  ) => void;
  onSetCardGateway: (gateway: "epayco" | "wompi") => void;
  onSetWompiAcceptance: (
    updater: (
      prev: CheckoutModalProps["wompiAcceptance"],
    ) => CheckoutModalProps["wompiAcceptance"],
  ) => void;
  onSetPsePayment: (
    updater: (
      prev: CheckoutModalProps["psePayment"],
    ) => CheckoutModalProps["psePayment"],
  ) => void;
  onSetNequiPayment: (
    updater: (
      prev: CheckoutModalProps["nequiPayment"],
    ) => CheckoutModalProps["nequiPayment"],
  ) => void;
  onPlaceOrder: () => Promise<void>;
  fmt: (n: number) => string;
}

export function CheckoutModal({
  checkoutOpen,
  checkoutStep,
  cartItems,
  cartTotal,
  checkoutAddress,
  checkoutShipping,
  checkoutPayment,
  checkoutLoading,
  checkoutError,
  cardPayment,
  cardGateway,
  wompiAcceptance,
  wompiConfig,
  psePayment,
  nequiPayment,
  lastOrderId,
  onClose,
  onSetCheckoutStep,
  onSetCheckoutAddress,
  onSetCheckoutShipping,
  onSetCheckoutPayment,
  onSetCardPayment,
  onSetCardGateway,
  onSetWompiAcceptance,
  onSetPsePayment,
  onSetNequiPayment,
  onPlaceOrder,
  fmt,
}: CheckoutModalProps) {
  if (!checkoutOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-muted overflow-y-auto">
      <div className="bg-white border-b border-border px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        {checkoutStep < 4 && (
          <button
            onClick={() =>
              checkoutStep === 1
                ? onClose()
                : onSetCheckoutStep(checkoutStep - 1)
            }
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="flex-1">
          <Logo dark={true} />
        </div>
        {checkoutStep < 4 && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {checkoutStep < 4 && (
        <div className="bg-white px-6 pb-4 pt-2 flex items-center gap-2 border-b border-border">
          {["Resumen", "Dirección", "Pago"].map((label, i) => {
            const step = i + 1;
            const active = checkoutStep === step;
            const done = checkoutStep > step;
            return (
              <div key={step} className="flex items-center gap-2 shrink-0">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={
                    done
                      ? { background: "#34C759", color: "#fff" }
                      : active
                        ? { background: "#1A1A2E", color: "#FFF200" }
                        : { background: "#F4F4F6", color: "#6B7280" }
                  }
                >
                  {done ? <CheckCircle2 className="w-4 h-4" /> : step}
                </div>
                <span
                  className={`text-xs font-semibold ${active ? "text-foreground" : "text-muted-foreground"}`}
                >
                  {label}
                </span>
                {i < 2 && (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 space-y-4">
        {checkoutStep === 1 && (
          <>
            <h2
              className="text-xl font-black"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Resumen del pedido
            </h2>
            <div className="bg-white rounded-2xl border border-border divide-y divide-border overflow-hidden">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 object-cover rounded-xl"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.unit} × {item.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-bold shrink-0">
                    {fmt(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-border p-4 space-y-3">
              <h3 className="text-sm font-bold">Tipo de envío</h3>
              {(["standard", "express"] as const).map((type) => (
                <label
                  key={type}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${checkoutShipping === type ? "border-yellow-300 bg-yellow-50" : "border-border hover:bg-muted/40"}`}
                >
                  <input
                    type="radio"
                    name="shipping"
                    value={type}
                    checked={checkoutShipping === type}
                    onChange={() => onSetCheckoutShipping(type)}
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${checkoutShipping === type ? "border-yellow-500" : "border-muted-foreground"}`}
                  >
                    {checkoutShipping === type && (
                      <div className="w-2 h-2 rounded-full bg-foreground" />
                    )}
                  </div>
                  <Truck className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">
                      {type === "standard"
                        ? "Envío estándar"
                        : "Envío express"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {type === "standard"
                        ? "2-3 horas hábiles"
                        : "45-60 minutos"}
                    </p>
                  </div>
                  <span className="text-sm font-bold">
                    {fmt(type === "standard" ? 4900 : 9900)}
                  </span>
                </label>
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-border p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">{fmt(cartTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Envío</span>
                <span className="font-semibold">
                  {fmt(checkoutShipping === "express" ? 9900 : 4900)}
                </span>
              </div>
              <div className="flex justify-between font-black text-base border-t border-border pt-2">
                <span>Total</span>
                <span>
                  {fmt(
                    cartTotal +
                      (checkoutShipping === "express" ? 9900 : 4900),
                  )}
                </span>
              </div>
            </div>
            <button
              onClick={() => onSetCheckoutStep(2)}
              className="w-full py-4 rounded-2xl font-black text-base hover:brightness-95 active:scale-95 transition-all"
              style={{ background: "#1A1A2E", color: "#FFF200" }}
            >
              Continuar con la dirección →
            </button>
          </>
        )}

        {checkoutStep === 2 && (
          <>
            <h2
              className="text-xl font-black"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Dirección de entrega
            </h2>
            <div className="bg-white rounded-2xl border border-border p-4 space-y-3">
              {([
                {
                  key: "name" as const,
                  label: "Nombre completo",
                  placeholder: "Carlos Ríos",
                  type: "text",
                },
                {
                  key: "phone" as const,
                  label: "Celular",
                  placeholder: "300 123 4567",
                  type: "tel",
                },
                {
                  key: "address" as const,
                  label: "Dirección",
                  placeholder: "Cra 23 #45-67, Barrio San José",
                  type: "text",
                },
                {
                  key: "city" as const,
                  label: "Ciudad",
                  placeholder: "Manizales",
                  type: "text",
                },
                {
                  key: "notes" as const,
                  label: "Indicaciones adicionales (opcional)",
                  placeholder: "Apto 301, timbre no funciona...",
                  type: "text",
                },
              ]).map(({ key, label, placeholder, type }) => (
                <div key={key}>
                  <label className="text-xs font-semibold block mb-1">
                    {label}
                  </label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={checkoutAddress[key]}
                    onChange={(e) =>
                      onSetCheckoutAddress((prev) => ({
                        ...prev,
                        [key]: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/50 text-sm focus:outline-none"
                    onFocus={(e) => {
                      e.target.style.boxShadow = "0 0 0 2px #FFF200";
                      e.target.style.borderColor = "#FFF200";
                    }}
                    onBlur={(e) => {
                      e.target.style.boxShadow = "none";
                      e.target.style.borderColor = "";
                    }}
                  />
                </div>
              ))}
            </div>
            <button
              onClick={() => onSetCheckoutStep(3)}
              disabled={
                !checkoutAddress.name ||
                !checkoutAddress.phone ||
                !checkoutAddress.address
              }
              className="w-full py-4 rounded-2xl font-black text-base hover:brightness-95 active:scale-95 transition-all disabled:opacity-40"
              style={{ background: "#1A1A2E", color: "#FFF200" }}
            >
              Continuar con el pago →
            </button>
          </>
        )}

        {checkoutStep === 3 && (
          <>
            <h2
              className="text-xl font-black"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Método de pago
            </h2>
            <div className="bg-white rounded-2xl border border-border divide-y divide-border overflow-hidden">
              {([
                {
                  key: "efectivo" as const,
                  label: "Efectivo contra entrega",
                  Icon: Banknote,
                  desc: "Paga al recibir tu pedido",
                },
                {
                  key: "nequi" as const,
                  label: "Nequi",
                  Icon: Smartphone,
                  desc: "Transferencia inmediata",
                },
                {
                  key: "pse" as const,
                  label: "PSE",
                  Icon: Building2,
                  desc: "Débito bancario en línea",
                },
                {
                  key: "tarjeta" as const,
                  label: "Tarjeta débito / crédito",
                  Icon: CreditCard,
                  desc: "Visa, Mastercard, Amex",
                },
              ]).map(({ key, label, Icon, desc }) => (
                <label
                  key={key}
                  className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-colors ${checkoutPayment === key ? "bg-yellow-50" : "hover:bg-muted/40"}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={key}
                    checked={checkoutPayment === key}
                    onChange={() => onSetCheckoutPayment(key)}
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${checkoutPayment === key ? "border-yellow-500" : "border-muted-foreground"}`}
                  >
                    {checkoutPayment === key && (
                      <div className="w-2 h-2 rounded-full bg-foreground" />
                    )}
                  </div>
                  <Icon className="w-5 h-5 text-muted-foreground shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </label>
              ))}
            </div>

            {checkoutPayment === "tarjeta" && (
              <div className="bg-white rounded-2xl border border-border p-4 space-y-3">
                <h3 className="text-sm font-bold">Datos de la tarjeta</h3>
                <div>
                  <label className="text-xs font-semibold block mb-1">
                    Nombre del titular
                  </label>
                  <input
                    type="text"
                    value={cardPayment.cardholderName}
                    onChange={(e) =>
                      onSetCardPayment((prev) => ({
                        ...prev,
                        cardholderName: e.target.value,
                      }))
                    }
                    placeholder="Nombre como aparece en la tarjeta"
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/50 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">
                    Número de tarjeta
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={19}
                    value={cardPayment.cardNumber}
                    onChange={(e) =>
                      onSetCardPayment((prev) => ({
                        ...prev,
                        cardNumber: e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 16)
                          .replace(/(.{4})/g, "$1 ")
                          .trim(),
                      }))
                    }
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/50 text-sm focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs font-semibold block mb-1">
                      MM
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={2}
                      value={cardPayment.expiryMonth}
                      onChange={(e) =>
                        onSetCardPayment((prev) => ({
                          ...prev,
                          expiryMonth: e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 2),
                        }))
                      }
                      placeholder="08"
                      className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/50 text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold block mb-1">
                      AA
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={2}
                      value={cardPayment.expiryYear}
                      onChange={(e) =>
                        onSetCardPayment((prev) => ({
                          ...prev,
                          expiryYear: e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 2),
                        }))
                      }
                      placeholder="29"
                      className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/50 text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold block mb-1">
                      CVV
                    </label>
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      value={cardPayment.cvv}
                      onChange={(e) =>
                        onSetCardPayment((prev) => ({
                          ...prev,
                          cvv: e.target.value.replace(/\D/g, "").slice(0, 4),
                        }))
                      }
                      placeholder="123"
                      className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/50 text-sm focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">
                    Cuotas
                  </label>
                  <select
                    value={cardPayment.installments}
                    onChange={(e) =>
                      onSetCardPayment((prev) => ({
                        ...prev,
                        installments: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/50 text-sm focus:outline-none"
                  >
                    {[1, 2, 3, 6, 12].map((value) => (
                      <option key={value} value={String(value)}>
                        {value} cuota{value > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-3">
                  <div>
                    <label className="text-xs font-semibold block mb-2">
                      Pasarela de pago
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => onSetCardGateway("epayco")}
                        className={`px-3 py-2.5 rounded-xl border text-sm font-semibold ${cardGateway === "epayco" ? "border-yellow-400 bg-yellow-50" : "border-border bg-white"}`}
                      >
                        ePayco
                        <span className="block text-[11px] font-medium text-muted-foreground">
                          Principal
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onSetCardGateway("wompi")}
                        className={`px-3 py-2.5 rounded-xl border text-sm font-semibold ${cardGateway === "wompi" ? "border-yellow-400 bg-yellow-50" : "border-border bg-white"}`}
                      >
                        Wompi
                        <span className="block text-[11px] font-medium text-muted-foreground">
                          Alternativa
                        </span>
                      </button>
                    </div>
                  </div>

                  {cardGateway === "epayco" ? (
                    <div className="text-xs text-muted-foreground rounded-lg bg-white border border-border px-3 py-2">
                      El pago con tarjeta se procesará usando ePayco.
                    </div>
                  ) : (
                    <>
                      <label className="flex items-start gap-2 text-xs text-muted-foreground">
                        <input
                          type="checkbox"
                          checked={wompiAcceptance.terms}
                          onChange={(e) =>
                            onSetWompiAcceptance((prev) => ({
                              ...prev,
                              terms: e.target.checked,
                            }))
                          }
                          className="mt-0.5"
                        />
                        <span>
                          Acepto los{" "}
                          <a
                            href={wompiConfig?.acceptancePermalink ?? "#"}
                            target="_blank"
                            rel="noreferrer"
                            className="underline text-foreground"
                          >
                            términos y condiciones de Wompi
                          </a>
                          .
                        </span>
                      </label>
                      <label className="flex items-start gap-2 text-xs text-muted-foreground">
                        <input
                          type="checkbox"
                          checked={wompiAcceptance.personalData}
                          onChange={(e) =>
                            onSetWompiAcceptance((prev) => ({
                              ...prev,
                              personalData: e.target.checked,
                            }))
                          }
                          className="mt-0.5"
                        />
                        <span>
                          Autorizo el tratamiento de datos personales según{" "}
                          <a
                            href={
                              wompiConfig?.personalDataAuthPermalink ?? "#"
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="underline text-foreground"
                          >
                            la política de Wompi
                          </a>
                          .
                        </span>
                      </label>
                    </>
                  )}
                </div>
              </div>
            )}

            {checkoutPayment === "pse" && (
              <div className="bg-white rounded-2xl border border-border p-4 space-y-3">
                <h3 className="text-sm font-bold">Pago con PSE</h3>
                <div>
                  <label className="text-xs font-semibold block mb-1">
                    Banco
                  </label>
                  <select
                    value={psePayment.bank}
                    onChange={(e) =>
                      onSetPsePayment((prev) => ({
                        ...prev,
                        bank: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/50 text-sm focus:outline-none"
                  >
                    <option value="">Selecciona un banco</option>
                    <option value="bancolombia">Bancolombia</option>
                    <option value="davivienda">Davivienda</option>
                    <option value="bbva">BBVA</option>
                    <option value="bogota">Banco de Bogotá</option>
                    <option value="occidente">Banco de Occidente</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">
                    Tipo de persona
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["natural", "juridica"] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() =>
                          onSetPsePayment((prev) => ({
                            ...prev,
                            personType: type,
                          }))
                        }
                        className={`px-3 py-2.5 rounded-xl border text-sm font-semibold ${psePayment.personType === type ? "border-yellow-400 bg-yellow-50" : "border-border bg-white"}`}
                      >
                        {type === "natural"
                          ? "Persona natural"
                          : "Persona jurídica"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {checkoutPayment === "nequi" && (
              <div className="bg-white rounded-2xl border border-border p-4 space-y-3">
                <h3 className="text-sm font-bold">Pago con Nequi</h3>
                <div>
                  <label className="text-xs font-semibold block mb-1">
                    Número asociado a Nequi
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={nequiPayment.phone}
                    onChange={(e) =>
                      onSetNequiPayment({
                        phone: e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10),
                      })
                    }
                    placeholder="3001234567"
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/50 text-sm focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-border p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{fmt(cartTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Envío</span>
                <span>
                  {fmt(checkoutShipping === "express" ? 9900 : 4900)}
                </span>
              </div>
              <div className="flex justify-between font-black text-base border-t border-border pt-2">
                <span>Total a pagar</span>
                <span>
                  {fmt(
                    cartTotal +
                      (checkoutShipping === "express" ? 9900 : 4900),
                  )}
                </span>
              </div>
            </div>
            {checkoutError && (
              <div className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2 text-center">
                {checkoutError}
              </div>
            )}
            <button
              onClick={onPlaceOrder}
              disabled={
                checkoutLoading ||
                (checkoutPayment === "tarjeta" &&
                  (!cardPayment.cardholderName ||
                    !cardPayment.cardNumber ||
                    !cardPayment.expiryMonth ||
                    !cardPayment.expiryYear ||
                    !cardPayment.cvv ||
                    (cardGateway === "wompi" &&
                      (!wompiAcceptance.terms ||
                        !wompiAcceptance.personalData)))) ||
                (checkoutPayment === "pse" && !psePayment.bank) ||
                (checkoutPayment === "nequi" && !nequiPayment.phone)
              }
              className="w-full py-4 rounded-2xl font-black text-base hover:brightness-95 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "#FFF200", color: "#1A1A2E" }}
            >
              {checkoutLoading
                ? "Procesando pedido..."
                : "Confirmar pedido →"}
            </button>
          </>
        )}

        {checkoutStep === 4 && (
          <div className="flex flex-col items-center text-center py-10 gap-5">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <div>
              <h2
                className="text-2xl font-black"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
              >
                ¡Pedido confirmado!
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Tu pedido <strong>{lastOrderId}</strong> ha sido recibido.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-border p-4 w-full text-left space-y-2.5">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>
                  {checkoutShipping === "express"
                    ? "Entrega en 45-60 minutos"
                    : "Entrega en 2-3 horas"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>
                  {checkoutAddress.address}, {checkoutAddress.city}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Wallet className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="capitalize">{checkoutPayment}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full py-4 rounded-2xl font-black text-base hover:brightness-95 active:scale-95 transition-all"
              style={{ background: "#1A1A2E", color: "#FFF200" }}
            >
              Ver mis pedidos
            </button>
            <button
              onClick={onClose}
              className="text-sm text-muted-foreground underline hover:text-foreground"
            >
              Seguir comprando
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
