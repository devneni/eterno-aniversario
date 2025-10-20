import React, { useState, useCallback, useEffect } from 'react';

type PaymentMethod = 'pix' | 'credit_card';

interface PixData {
    qrCodeImageUrl: string;
    pixKey: string; 
    amount: number;
}

interface PaymentModalProps {
    initialPlanValue: number;
    onCancel: () => void;
    onConfirm: (method: PaymentMethod, total: number) => void;
    // Função para gerar o PIX (que chama a API no LovePageForm.tsx)
    onGeneratePix: () => Promise<PixData>;
}

const formatCurrency = (value: number): string => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
};

const PaymentModal: React.FC<PaymentModalProps> = ({
    initialPlanValue,
    onCancel,
    onConfirm,
    onGeneratePix, 
}) => {

    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('pix');
    const [coupon, setCoupon] = useState<string>('');
    const [discountValue, setDiscountValue] = useState<number>(0);
    const [couponMessage, setCouponMessage] = useState<string>('');

    // ESTADOS PARA O FLUXO PIX
    const [showPixDetails, setShowPixDetails] = useState(false); 
    const [isLoading, setIsLoading] = useState(false); 
    const [pixData, setPixData] = useState<PixData | null>(null); 
    const [pixError, setPixError] = useState<string | null>(null);
    const [copyMessage, setCopyMessage] = useState<string>('');

    const totalValue = initialPlanValue - discountValue;

    // Função para voltar para a tela de seleção de método
    const handleBackFromPix = useCallback(() => {
        setShowPixDetails(false);
        setCopyMessage('');
        // Mantém pixData para possível reexibição se o usuário voltar
        setPixError(null);
        setIsLoading(false);
    }, []);
    
    // Efeito para ESC e foco na modal
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
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [onCancel, showPixDetails, handleBackFromPix]); 

    const handleApplyCoupon = useCallback(() => {
        setCouponMessage('');
        // Simulação de desconto (Adapte esta lógica para sua API real de cupons)
        if (coupon.toLowerCase() === 'desconto10') {
            setDiscountValue(1.0);
            setCouponMessage('Cupom aplicado com sucesso! R$ 1,00 de desconto.');
        } else {
            setDiscountValue(0);
            setCouponMessage('Cupom inválido ou expirado.');
        }
    }, [coupon]);

    // LÓGICA DE CONFIRMAÇÃO
    const handleConfirm = useCallback(async () => {
        if (selectedMethod === 'credit_card') {
            // Se for Cartão de Crédito, chama o handler do pai para iniciar o processo
            onConfirm(selectedMethod, totalValue); 
            return;
        }
        
        // Lógica para PIX: chama a função passada pelo pai (onGeneratePix)
        setIsLoading(true);
        setPixError(null);
        setPixData(null);
        setShowPixDetails(true); // Abre a tela de loading/detalhes
        
        try {
            // CHAMA A FUNÇÃO REAL DE API DO LovePageForm
            const data = await onGeneratePix(); 
            setPixData(data);
        } catch (error) {
            console.error('Erro na API Pix:', error);
            // Corrigido: _err para ignorar o warning 'no-unused-vars'
            setPixError(error instanceof Error ? error.message : 'Falha desconhecida ao gerar o QR Code. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    }, [selectedMethod, totalValue, onGeneratePix, onConfirm]);

    // LÓGICA DE COPIAR CHAVE PIX
    const handleCopyPixKey = async () => {
        if (!pixData?.pixKey) return;
        try {
            // Usa o payload do PIX (chave) para a funcionalidade Copia e Cola
            await navigator.clipboard.writeText(pixData.pixKey); 
            setCopyMessage('📋 Chave PIX Copiada!');
        } catch (_err) { 
            setCopyMessage('❌ Falha ao copiar.');
        }
        setTimeout(() => setCopyMessage(''), 3000);
    };

    const confirmButtonText = selectedMethod === 'pix' ? 'Gerar QR Code e Pagar' : 'Pagar Agora';
    
    const RadioSelectedClass = 'ring-2 ring-purple-500 border-purple-500 bg-purple-50'; 
    const RadioUnselectedClass = 'border-gray-300 hover:bg-gray-100'; 

    // --- Renderização do Modal de Detalhes do Pix ---
    const renderPixDetails = () => (
        <div 
            className="bg-white p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-md mx-auto transform transition-all scale-100"
            onClick={(e) => e.stopPropagation()} 
        >
             <div className='flex justify-end'>
                <button 
                    className='text-gray-400 hover:text-gray-700 transition duration-150'
                    onClick={handleBackFromPix}
                    aria-label="Voltar para a seleção de pagamento"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">Pagamento via Pix</h2>

            {isLoading && (
                <div className="text-center py-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto mb-3"></div>
                    <p className="text-gray-600">Gerando QR Code...</p>
                    <p className="text-sm text-gray-400 mt-2">Isso pode levar alguns segundos.</p>
                </div>
            )}
            
            {pixError && (
                <div className="text-center py-6 bg-red-100 border border-red-400 text-red-700 rounded-md mb-4">
                    <p className="font-semibold">Erro ao processar PIX.</p>
                    <p className="text-sm">{pixError}</p>
                </div>
            )}

            {/* Conteúdo exibido APENAS após a requisição retornar sucesso */}
            {pixData && !isLoading && (
                <>
                    <div className="text-center mb-6">
                        <p className="text-gray-600 mb-2 font-medium">Escaneie o QR Code para pagar {formatCurrency(pixData.amount)}:</p>
                        
                        {/* QR Code */}
                        <div className="flex justify-center items-center w-48 h-48 mx-auto rounded-lg mb-4 overflow-hidden shadow-lg border border-gray-200">
                            {/* O QR code é base64, então é usado diretamente no src */}
                            <img 
                                src={pixData.qrCodeImageUrl} 
                                alt="QR Code Pix" 
                                className="w-full h-full object-contain" 
                            />
                        </div>
                    </div>
                    
                    {/* Chave Pix Copia e Cola */}
                    <div className="p-4 bg-gray-100 rounded-lg border border-gray-200 mb-6">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Chave Pix (Copia e Cola):</p>
                        <div className="flex items-center space-x-2">
                            <p className="flex-grow font-mono text-xs md:text-sm bg-white p-2 border rounded-md overflow-x-auto whitespace-nowrap scrollbar-hide text-green-600">
                                {pixData.pixKey}
                            </p>
                            <button
                                onClick={handleCopyPixKey}
                                className="flex-shrink-0 bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition duration-150 text-sm font-medium"
                                aria-label="Copiar chave Pix"
                            >
                                {copyMessage ? 'Copiado!' : 'Copiar'}
                            </button>
                        </div>
                        {copyMessage && <p className={`mt-2 text-xs font-medium text-purple-600`}>{copyMessage}</p>}
                    </div>

                    <div className="text-center">
                        <p className="text-xs text-red-500 font-medium mb-3">
                            ⚠️ Não feche esta tela antes de pagar.
                        </p>
                        <button 
                            className="w-full bg-red-400 text-white font-bold py-3 rounded-lg shadow-xl hover:bg-red-500 transition duration-150 mb-3"
                            onClick={handleBackFromPix}
                        >
                            Voltar para a seleção
                        </button>
                        <p className="text-xs text-gray-500">Sua página será criada automaticamente após o pagamento ser aprovado.</p>
                    </div>
                </>
            )}
        </div>
    );
    
    // --- Renderização do Modal Principal (Seleção) ---
    if (showPixDetails) {
        return (
            <div 
                className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4" 
                onClick={handleBackFromPix}
            >
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
                <div className='flex justify-end'>
                    <button 
                        className='text-gray-400 hover:text-gray-700 transition duration-150'
                        onClick={onCancel}
                        aria-label="Fechar modal"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">Finalizar Pagamento</h2>

                <div className="space-y-3 mb-6">
                    <div 
                        className={`p-4 rounded-lg border cursor-pointer ${selectedMethod === 'pix' ? RadioSelectedClass : RadioUnselectedClass}`}
                        onClick={() => setSelectedMethod('pix')}
                    >
                        <span className="font-medium text-gray-700">Pix (Pagamento Instantâneo)</span>
                    </div>
                    <div 
                        className={`p-4 rounded-lg border cursor-pointer ${selectedMethod === 'credit_card' ? RadioSelectedClass : RadioUnselectedClass}`}
                        onClick={() => setSelectedMethod('credit_card')}
                    >
                        <span className="font-medium text-gray-700">Cartão de Crédito</span>
                    </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg mb-4 border">
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Cupom</label>
                    <div className="flex gap-3">
                        <input type="text" value={coupon} onChange={(e) => setCoupon(e.target.value)} className="flex-grow text-gray-700 p-2 border rounded-lg text-sm outline-none focus:ring-purple-500 focus:border-purple-500" placeholder="Ex: DESCONTO10" />
                        <button className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-150" onClick={handleApplyCoupon}>Aplicar Cupom</button>
                    </div>
                    {couponMessage && <p className={`mt-2 text-xs font-medium ${discountValue > 0 ? 'text-green-600' : 'text-red-500'}`}>{couponMessage}</p>}
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
                        className="w-full bg-green-400 text-white font-bold py-3 rounded-lg shadow-xl hover:bg-green-500 transition duration-150 mb-3"
                        onClick={handleConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Aguarde...' : confirmButtonText}
                    </button>
                    <button 
                        className="w-full bg-red-400 text-white font-bold py-3 rounded-lg shadow-md hover:bg-red-500 transition duration-150"
                        onClick={onCancel}
                    >
                        Cancelar / Voltar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;