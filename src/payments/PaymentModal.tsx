// components/PaymentModal.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { usePixPayment } from './usePixPayment';

type PaymentMethod = 'pix';

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
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
};

const PaymentModal: React.FC<PaymentModalProps> = ({
    initialPlanValue,
    onCancel,
    onConfirm,
    userData,
}) => {
    console.log("🎯 PaymentModal renderizado com:", userData);
    
    const [coupon, setCoupon] = useState<string>('');
    const [discountValue, setDiscountValue] = useState<number>(0);
    const [couponMessage, setCouponMessage] = useState<string>('');
    const [showPixDetails, setShowPixDetails] = useState(false);
    const [copyMessage, setCopyMessage] = useState<string>('');

    const {
        isLoading,
        pixData,
        error,
        usingSimulation,
        createPixPayment,
        monitorPaymentStatus,
        clearError,
        clearPixData
    } = usePixPayment({
        userEmail: userData.email,
        coupleName: userData.coupleName,
        planTitle: userData.planTitle,
        photosCount: userData.photosCount,
        totalValue: initialPlanValue - discountValue
    });

    const totalValue = initialPlanValue - discountValue;

    const handleApplyCoupon = useCallback(() => {
        console.log("🎫 Aplicando cupom:", coupon);
        setCouponMessage('');
        
        if (coupon.toLowerCase() === 'desconto10') {
            setDiscountValue(1.0);
            setCouponMessage('Cupom aplicado com sucesso! R$ 1,00 de desconto.');
        } else if (coupon.toLowerCase() === 'devpix') {
            setDiscountValue(0);
            setCouponMessage('✅ Cupom DEV ativado! O PIX será simulado automaticamente.');
        } else {
            setDiscountValue(0);
            setCouponMessage('Cupom inválido ou expirado.');
        }
    }, [coupon]);

    const handleConfirm = useCallback(async () => {
        console.log("🔄 handleConfirm chamado");
        
        const isDevMode = coupon.toLowerCase() === 'devpix';
        
        if (isDevMode) {
            console.log("🔧 Modo desenvolvimento - usando simulação...");
            // Força modo simulação
            const pixResult = await createPixPayment(true);
            if (pixResult) {
                setShowPixDetails(true);
                // Simula pagamento automático
                setTimeout(() => {
                    console.log("✅ Pagamento simulado confirmado!");
                    onConfirm('pix', totalValue);
                }, 3000);
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
                    console.log("✅ Pagamento confirmado!");
                    onConfirm('pix', totalValue);
                } else {
                    console.log("⏳ Pagamento pendente, verificando em 5s...");
                    setTimeout(checkPayment, 5000);
                }
            };
            
            checkPayment();
        }
    }, [coupon, totalValue, createPixPayment, monitorPaymentStatus, onConfirm]);

    const handleBackFromPix = useCallback(() => {
        console.log("↩️ Voltando da tela do PIX");
        setShowPixDetails(false);
        setCopyMessage('');
        clearPixData();
    }, [clearPixData]);

    const handleCopyPixKey = async () => {
        if (!pixData?.pixKey) return;
        try {
            await navigator.clipboard.writeText(pixData.pixKey);
            setCopyMessage('📋 Chave PIX Copiada!');
        } catch (_err) {
            setCopyMessage('❌ Falha ao copiar.');
        }
        setTimeout(() => setCopyMessage(''), 3000);
    };

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                if (showPixDetails) {
                    handleBackFromPix();
                } else {
                    onCancel();
                }
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [showPixDetails, handleBackFromPix, onCancel]);

    const renderPixDetails = () => (
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-md mx-auto transform transition-all scale-100">
            <div className='flex justify-between items-center mb-4'>
                <h2 className="text-2xl font-bold text-gray-800">
                    Pagamento via Pix {usingSimulation && "(Simulação)"}
                </h2>
                <button 
                    className='text-gray-400 hover:text-gray-700 transition duration-150'
                    onClick={handleBackFromPix}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <strong>Erro:</strong> {error}
                </div>
            )}

            {isLoading && (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">
                        {usingSimulation ? "Gerando PIX simulado..." : "Conectando com a API..."}
                    </p>
                </div>
            )}
            
            {pixData && !isLoading && (
                <>
                    {usingSimulation && (
                        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
                            <strong>⚠️ MODO SIMULAÇÃO</strong> - Este é um PIX de teste
                        </div>
                    )}
                    
                    <div className="text-center mb-6">
                        <p className="text-gray-600 mb-4">
                            Escaneie o QR Code para pagar <strong>{formatCurrency(pixData.amount)}</strong>
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
                        <p className="text-sm font-semibold text-gray-700 mb-2">Chave PIX (Copia e Cola):</p>
                        <div className="flex gap-2">
                            <code className="flex-1 bg-white p-2 border rounded text-xs overflow-x-auto">
                                {pixData.pixKey}
                            </code>
                            <button
                                onClick={handleCopyPixKey}
                                className="bg-purple-600 text-white px-3 py-2 rounded text-sm hover:bg-purple-700"
                            >
                                {copyMessage || 'Copiar'}
                            </button>
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-xs text-gray-500 mb-4">
                            {usingSimulation 
                                ? "Pagamento será simulado automaticamente em instantes..." 
                                : "Após o pagamento, sua página será criada automaticamente."
                            }
                        </p>
                        
                        <button 
                            className="w-full bg-gray-500 text-white font-bold py-3 rounded-lg hover:bg-gray-600 transition duration-150"
                            onClick={handleBackFromPix}
                        >
                            Voltar
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
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4" onClick={onCancel}>
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-md mx-auto transform transition-all scale-100" onClick={(e) => e.stopPropagation()}>
                <div className='flex justify-end'>
                    <button className='text-gray-400 hover:text-gray-700 transition duration-150' onClick={onCancel}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">Finalizar Pagamento</h2>

                <div className="space-y-3 mb-6">
                    <div className="p-4 rounded-lg border cursor-pointer ring-2 ring-purple-500 border-purple-500 bg-purple-50">
                        <span className="font-medium text-gray-700">Pix (Pagamento Instantâneo)</span>
                    </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg mb-4 border">
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Cupom</label>
                    <div className="flex gap-3">
                        <input 
                            type="text" 
                            value={coupon} 
                            onChange={(e) => setCoupon(e.target.value)} 
                            className="flex-grow text-gray-700 p-2 border rounded-lg text-sm outline-none focus:ring-purple-500 focus:border-purple-500" 
                            placeholder="Ex: DESCONTO10" 
                        />
                        <button 
                            className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-150" 
                            onClick={handleApplyCoupon}
                        >
                            Aplicar
                        </button>
                    </div>
                    {couponMessage && (
                        <p className={`mt-2 text-xs font-medium ${discountValue > 0 ? 'text-green-600' : 'text-red-500'}`}>
                            {couponMessage}
                        </p>
                    )}
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg mb-6 border border-purple-200">
                    {discountValue > 0 && (
                        <div className="flex justify-between text-green-600 mb-2 text-sm md:text-base">
                            <span>Desconto</span>
                            <span>- {formatCurrency(discountValue)}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-gray-700 mb-4 text-sm md:text-base">
                        <span>Plano</span>
                        <span>{formatCurrency(initialPlanValue)}</span>
                    </div>

                    <div className="flex justify-between font-extrabold text-xl pt-3 border-t-2 border-purple-300 text-gray-800">
                        <span>Total a Pagar</span>
                        <span>{formatCurrency(totalValue)}</span>
                    </div>
                </div>

                <div className="text-center">
                    <button 
                        className="w-full bg-green-500 text-white font-bold py-3 rounded-lg shadow-xl hover:bg-green-600 transition duration-150 mb-3 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        onClick={handleConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Aguarde...' : 'Gerar QR Code e Pagar'}
                    </button>
                    <button 
                        className="w-full bg-red-500 text-white font-bold py-3 rounded-lg shadow-md hover:bg-red-600 transition duration-150"
                        onClick={onCancel}
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;