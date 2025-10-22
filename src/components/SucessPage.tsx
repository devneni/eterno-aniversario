import  { useEffect } from 'react';

interface SuccessPageProps {
  pageUrl: string;
  coupleName: string;
  onClose?: () => void;
  onEdit?: () => void;
}

function SuccessPage({ pageUrl, coupleName, onClose, onEdit }: SuccessPageProps) {
  useEffect(() => {
    console.log('Abrindo página em NOVA ABA:', pageUrl);
    

    const newTab = window.open(pageUrl, '_blank');
    
    if (!newTab) {
      console.log('Popup bloqueado, mostrando instruções');
      alert('Popup bloqueado! Por favor, clique no botão "Abrir Página Novamente" para acessar sua página.');
    }
  }, [pageUrl]);

  const handleShareQRCode = async () => {
    alert('Funcionalidade de QR code em desenvolvimento!');
  };

  const handleShareLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      alert('Link personalizado copiado para a área de transferência!');
    } catch (error) {
      console.error('Erro ao copiar link:', error);
      const textArea = document.createElement('textarea');
      textArea.value = pageUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Link personalizado copiado!');
    }
  };

  const handleAccessPage = () => {

    window.open(pageUrl, '_blank');
  };

  const handleEditPage = () => {
    window.open(pageUrl, '_blank');
    if (onEdit) {
      onEdit();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#121212] rounded-2xl p-6 max-w-md w-full mx-auto">
        <div className="text-center mb-2">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✓</span>
          </div>
          <h1 className="font-extrabold text-white text-2xl mb-2">
            Página Criada com Sucesso!
          </h1>
          <p className="text-gray-300 text-sm mb-4">
            Sua página já está aberta em uma nova aba 
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg p-3 mb-4">
          <p className="text-gray-400 text-xs mb-1">Seu link personalizado:</p>
          <div className="flex items-center justify-between">
            <code className="text-green-400 text-sm font-mono break-all">
              {pageUrl}
            </code>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleShareQRCode}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
          >
           
            Compartilhar QR Code
          </button>
          
          <button
            onClick={handleShareLink}
            className="w-full bg-[#ff6969] hover:bg-[#ff5252] text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
          >
          
            Copiar Link Personalizado
          </button>
          
          <button
            onClick={handleAccessPage}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
          >
          
            Abrir Página Novamente
          </button>

          {onEdit && (
            <button
              onClick={handleEditPage}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
            >
             
              Editar Página
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
            >
              Fechar
            </button>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-700">
          <p className="text-center text-white text-sm">
            Página de <span className="font-semibold text-pink-700">{coupleName}</span>
          </p>
          <p className="text-center text-white text-xs mt-2">
            Este link é permanente e pode ser compartilhado!
          </p>
          <p className="text-center text-gray-500 text-xs mt-1">
            Abre em nova aba
          </p>
        </div>
      </div>
    </div>
  );
}

export default SuccessPage;