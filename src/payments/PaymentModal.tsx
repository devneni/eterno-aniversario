// components/PaymentModal.tsx
import React, { useState, useCallback, useEffect, useRef } from "react";
import { usePixPayment } from "./usePixPayment";
import { useLanguage } from "../components/useLanguage";
import { translations } from "../components/translations";

type PaymentMethod = "pix";

interface PaymentModalProps {
  initialPlanValue: number;
  onCancel: () => void;
  onConfirm: (method: PaymentMethod, total: number) => void;
  userData: {
    email: string;
    coupleName: string;
    planTitle: string;
    photosCount: number;
  };
}

const formatCurrency = (value: number): string => {
  return `R$ ${value.toFixed(2).replace(".", ",")}`;
};

const PaymentModal: React.FC<PaymentModalProps> = ({
  initialPlanValue,
  onCancel,
  onConfirm,
  userData,
}) => {
  const { language } = useLanguage();
  const t = translations[language];

  console.log("🎯 PaymentModal renderizado com:", userData);

  const [coupon, setCoupon] = useState<string>("");
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [couponMessage, setCouponMessage] = useState<string>("");
  const [showPixDetails, setShowPixDetails] = useState(false);
  const [copyMessage, setCopyMessage] = useState<string>("");
  const confirmedRef = useRef(false);
  const pollTimerRef = useRef<number | null>(null);

  const {
    isLoading,
    pixData,
    error,
    usingSimulation,
    createPixPayment,
    monitorPaymentStatus,
    clearPixData,
  } = usePixPayment({
    userEmail: userData.email,
    coupleName: userData.coupleName,
    planTitle: userData.planTitle,
    photosCount: userData.photosCount,
    totalValue: initialPlanValue - discountValue,
  });

  const totalValue = initialPlanValue - discountValue;

  const handleApplyCoupon = useCallback(() => {
    console.log("🎫 Aplicando cupom:", coupon);
    setCouponMessage("");

    if (coupon.toLowerCase() === "desconto10") {
      setDiscountValue(1.0);
      setCouponMessage(
        language === "pt"
          ? "Cupom aplicado com sucesso! R$ 1,00 de desconto."
          : "Coupon applied successfully! $1.00 discount."
      );
    } else if (coupon.toLowerCase() === "devpix") {
      setDiscountValue(0);
      setCouponMessage(
        language === "pt"
          ? "✅ Cupom DEV ativado! O PIX será simulado automaticamente."
          : "✅ DEV coupon activated! PIX will be simulated automatically."
      );
    } else {
      setDiscountValue(0);
      setCouponMessage(
        language === "pt"
          ? "Cupom inválido ou expirado."
          : "Invalid or expired coupon."
      );
    }
  }, [coupon, language]);

  const handleConfirm = useCallback(async () => {
    console.log("🔄 handleConfirm chamado");

    const isDevMode = coupon.toLowerCase() === "devpix";

    if (isDevMode) {
      console.log("🔧 Modo desenvolvimento - usando simulação...");
      // Força modo simulação
      const pixResult = await createPixPayment(true);
      if (pixResult) {
        setShowPixDetails(true);
        // Simula pagamento automático
        pollTimerRef.current = window.setTimeout(() => {
          if (confirmedRef.current) return;
          confirmedRef.current = true;
          console.log("✅ Pagamento simulado confirmado!");
          onConfirm("pix", totalValue);
        }, 3000);
      } else {
        // Falhou criar PIX simulado (improvável). Exibe erro genérico.
        alert(
          language === "pt"
            ? "Falha ao gerar PIX simulado."
            : "Failed to generate simulated PIX."
        );
      }
      return;
    }

    console.log("💰 Tentando API real primeiro...");
    const pixResult = await createPixPayment(false); // Tenta API real

    if (pixResult) {
      console.log("📱 Mostrando detalhes do PIX");
      setShowPixDetails(true);

      // Inicia monitoramento do pagamento
      const checkPayment = async () => {
        console.log("🔍 Verificando status do pagamento...");
        const isPaid = await monitorPaymentStatus(pixResult.paymentId);
        if (isPaid) {
          if (confirmedRef.current) return;
          confirmedRef.current = true;
          console.log("✅ Pagamento confirmado!");
          onConfirm("pix", totalValue);
        } else {
          console.log("⏳ Pagamento pendente, verificando em 7s...");
          pollTimerRef.current = window.setTimeout(checkPayment, 7000);
        }
      };

      checkPayment();
    } else {
      alert(
        language === "pt"
          ? "Não foi possível gerar o PIX. Tente novamente."
          : "Could not generate PIX. Please try again."
      );
    }
  }, [
    coupon,
    totalValue,
    createPixPayment,
    monitorPaymentStatus,
    onConfirm,
    language,
  ]);

  const handleBackFromPix = useCallback(() => {
    console.log("↩️ Voltando da tela do PIX");
    setShowPixDetails(false);
    setCopyMessage("");
    clearPixData();
  }, [clearPixData]);

  const handleUseSimulation = useCallback(async () => {
    console.log("🧪 Forçando simulação após erro da API");
    const pixResult = await createPixPayment(true);
    if (pixResult) {
      setShowPixDetails(true);
      // Confirmar automaticamente após curto período
      if (pollTimerRef.current) {
        clearTimeout(pollTimerRef.current);
      }
      pollTimerRef.current = window.setTimeout(() => {
        if (confirmedRef.current) return;
        confirmedRef.current = true;
        console.log("✅ Pagamento simulado confirmado (fallback)!");
        onConfirm("pix", totalValue);
      }, 3000);
    } else {
      alert(
        language === "pt"
          ? "Falha ao iniciar simulação."
          : "Failed to start simulation."
      );
    }
  }, [createPixPayment, onConfirm, totalValue, language]);

  const handleCopyPixKey = async () => {
    if (!pixData?.pixKey) return;
    try {
      await navigator.clipboard.writeText(pixData.pixKey);
      setCopyMessage(
        language === "pt" ? "📋 Chave PIX Copiada!" : "📋 PIX Key Copied!"
      );
    } catch (_err) {
      setCopyMessage(
        language === "pt" ? "❌ Falha ao copiar." : "❌ Failed to copy."
      );
    }
    setTimeout(() => setCopyMessage(""), 3000);
  };

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (showPixDetails) {
          handleBackFromPix();
        } else {
          onCancel();
        }
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("keydown", handleEsc);
      if (pollTimerRef.current) {
        clearTimeout(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [showPixDetails, handleBackFromPix, onCancel]);

  const renderPixDetails = () => (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-md mx-auto transform transition-all scale-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          {language === "pt" ? "Pagamento via Pix" : "Payment via PIX"}{" "}
          {usingSimulation &&
            (language === "pt" ? "(Simulação)" : "(Simulation)")}
        </h2>
        <button
          className="text-gray-400 hover:text-gray-700 transition duration-150"
          onClick={handleBackFromPix}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <div className="flex flex-col gap-3">
            <div>
              <strong>{language === "pt" ? "Erro:" : "Error:"}</strong> {error}
            </div>
            <div className="flex gap-2">
              <button
                className="bg-gray-700 text-white px-3 py-2 rounded text-sm hover:bg-gray-800"
                onClick={handleConfirm}
              >
                {language === "pt" ? "Tentar novamente" : "Try again"}
              </button>
              <button
                className="bg-purple-600 text-white px-3 py-2 rounded text-sm hover:bg-purple-700"
                onClick={handleUseSimulation}
              >
                {language === "pt" ? "Usar simulação" : "Use simulation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {usingSimulation
              ? language === "pt"
                ? "Gerando PIX simulado..."
                : "Generating simulated PIX..."
              : language === "pt"
              ? "Conectando com a API..."
              : "Connecting with API..."}
          </p>
        </div>
      )}

      {pixData && !isLoading && (
        <>
          {usingSimulation && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
              <strong>
                ⚠️ {language === "pt" ? "MODO SIMULAÇÃO" : "SIMULATION MODE"}
              </strong>{" "}
              -{" "}
              {language === "pt"
                ? "Este é um PIX de teste"
                : "This is a test PIX"}
            </div>
          )}

          <div className="text-center mb-6">
            <p className="text-gray-600 mb-4">
              {language === "pt"
                ? "Escaneie o QR Code para pagar"
                : "Scan the QR Code to pay"}{" "}
              <strong>{formatCurrency(pixData.amount)}</strong>
            </p>

            <div className="flex justify-center mb-4">
              <img
                src={pixData.qrCodeImageUrl}
                alt="QR Code Pix"
                className="w-48 h-48 border rounded-lg"
              />
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-2">
              {language === "pt"
                ? "Chave PIX (Copia e Cola):"
                : "PIX Key (Copy and Paste):"}
            </p>
            <div className="flex gap-2">
              <code className="flex-1 bg-white p-2 border rounded text-xs overflow-x-auto">
                {pixData.pixKey}
              </code>
              <button
                onClick={handleCopyPixKey}
                className="bg-purple-600 text-white px-3 py-2 rounded text-sm hover:bg-purple-700"
              >
                {copyMessage || (language === "pt" ? "Copiar" : "Copy")}
              </button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500 mb-4">
              {usingSimulation
                ? language === "pt"
                  ? "Pagamento será simulado automaticamente em instantes..."
                  : "Payment will be simulated automatically in moments..."
                : language === "pt"
                ? "Após o pagamento, sua página será criada automaticamente."
                : "After payment, your page will be created automatically."}
            </p>

            <button
              className="w-full bg-gray-500 text-white font-bold py-3 rounded-lg hover:bg-gray-600 transition duration-150"
              onClick={handleBackFromPix}
            >
              {language === "pt" ? "Voltar" : "Back"}
            </button>
          </div>
        </>
      )}
    </div>
  );

  if (showPixDetails) {
    return (
      <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">
        {renderPixDetails()}
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-md mx-auto transform transition-all scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end">
          <button
            className="text-gray-400 hover:text-gray-700 transition duration-150"
            onClick={onCancel}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">
          {language === "pt" ? "Finalizar Pagamento" : "Complete Payment"}
        </h2>

        <div className="space-y-3 mb-6">
          <div className="p-4 rounded-lg border cursor-pointer ring-2 ring-purple-500 border-purple-500 bg-purple-50">
            <span className="font-medium text-gray-700">
              {language === "pt"
                ? "Pix (Pagamento Instantâneo)"
                : "PIX (Instant Payment)"}
            </span>
          </div>
        </div>

        <div className="p-3 bg-gray-50 rounded-lg mb-4 border">
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            {language === "pt" ? "Cupom" : "Coupon"}
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              className="flex-grow text-gray-700 p-2 border rounded-lg text-sm outline-none focus:ring-purple-500 focus:border-purple-500"
              placeholder={
                language === "pt" ? "Ex: DESCONTO10" : "Ex: DISCOUNT10"
              }
            />
            <button
              className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-150"
              onClick={handleApplyCoupon}
            >
              {language === "pt" ? "Aplicar" : "Apply"}
            </button>
          </div>
          {couponMessage && (
            <p
              className={`mt-2 text-xs font-medium ${
                discountValue > 0 ? "text-green-600" : "text-red-500"
              }`}
            >
              {couponMessage}
            </p>
          )}
        </div>

        <div className="bg-purple-50 p-4 rounded-lg mb-6 border border-purple-200">
          {discountValue > 0 && (
            <div className="flex justify-between text-green-600 mb-2 text-sm md:text-base">
              <span>{language === "pt" ? "Desconto" : "Discount"}</span>
              <span>- {formatCurrency(discountValue)}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-700 mb-4 text-sm md:text-base">
            <span>{language === "pt" ? "Plano" : "Plan"}</span>
            <span>{formatCurrency(initialPlanValue)}</span>
          </div>

          <div className="flex justify-between font-extrabold text-xl pt-3 border-t-2 border-purple-300 text-gray-800">
            <span>{language === "pt" ? "Total a Pagar" : "Total to Pay"}</span>
            <span>{formatCurrency(totalValue)}</span>
          </div>
        </div>

        <div className="text-center">
          <button
            className="w-full bg-green-500 text-white font-bold py-3 rounded-lg shadow-xl hover:bg-green-600 transition duration-150 mb-3 disabled:bg-gray-400 disabled:cursor-not-allowed"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading
              ? language === "pt"
                ? "Aguarde..."
                : "Please wait..."
              : language === "pt"
              ? "Gerar QR Code e Pagar"
              : "Generate QR Code and Pay"}
          </button>
          <button
            className="w-full bg-red-500 text-white font-bold py-3 rounded-lg shadow-md hover:bg-red-600 transition duration-150"
            onClick={onCancel}
          >
            {language === "pt" ? "Cancelar" : "Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
