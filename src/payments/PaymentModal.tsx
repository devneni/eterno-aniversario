import React, { useState, useCallback } from 'react';

type PaymentMethod = 'pix' | 'credit_card';

interface PaymentModalProps {
 initialPlanValue: number;
 onCancel: () => void;
 onConfirm: (method: PaymentMethod, total: number) => void;
}

const formatCurrency = (value: number): string => {
 return `R$ ${value.toFixed(2).replace('.', ',')}`;
};

const PaymentModal: React.FC<PaymentModalProps> = ({
 initialPlanValue,
 onCancel,
 onConfirm,
}) => {
 
 const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('pix');
 const [coupon, setCoupon] = useState<string>('');
 const [discountValue, setDiscountValue] = useState<number>(0);
 const [couponMessage, setCouponMessage] = useState<string>('');

 // Adiciona a opção de fechar a modal quando a tecla ESC é pressionada.
  React.useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onCancel]);

 // Calcula o valor total com desconto.
  const totalValue = initialPlanValue - discountValue;

 const handleApplyCoupon = useCallback(() => {
  setCouponMessage('');
  if (coupon.toLowerCase() === 'desconto10') {
   setDiscountValue(1.0);
   setCouponMessage('Cupom aplicado com sucesso! R$ 1,00 de desconto.');
  } else {
   setDiscountValue(0);
   setCouponMessage('Cupom inválido ou expirado.');
  }
 }, [coupon]);

 const handleConfirm = useCallback(() => {
  onConfirm(selectedMethod, totalValue);
 }, [selectedMethod, totalValue, onConfirm]);

 const confirmButtonText = selectedMethod === 'pix' ? 'Gerar QR Code' : 'Pagar Agora';
 
 // Classes de estilo
 const RadioSelectedClass = 'ring-2 ring-purple-500 border-purple-500 bg-purple-50'; 
 const RadioUnselectedClass = 'border-gray-300 hover:bg-gray-100'; 

 return (
  // NOVO: Adiciona onClick={onCancel} para fechar ao clicar no fundo escuro (backdrop)
  <div 
      className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4" 
      onClick={onCancel}
    >
   
   <div 
        className="bg-white p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-md mx-auto transform transition-all scale-100"
        // CRUCIAL: Interrompe a propagação do evento para que clicar no conteúdo NÃO feche a modal
        onClick={(e) => e.stopPropagation()} 
      >
        {/* BOTÃO 'X' PARA FECHAR NO CANTO */}
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
      <button className="bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-700 transition duration-150" onClick={handleApplyCoupon}>Aplicar Cupom</button>
     </div>
     {couponMessage && <p className={`mt-2 text-xs font-medium ${discountValue > 0 ? 'text-green-600' : 'text-red-500'}`}>{couponMessage}</p>}
    </div>
    
    {/* Sumário */}
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

    {/* Botões de Ação */}
    <div className="text-center">
     <button 
      className="w-full bg-green-400 text-white font-bold py-3 rounded-lg shadow-xl hover:bg-700 transition duration-150 mb-3"
      onClick={handleConfirm}
     >
      {confirmButtonText}
     </button>
     <button 
      className="w-full bg-red-400 text-white font-bold py-3 rounded-lg shadow-md hover:bg-bg-700 transition duration-150"
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
