import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { calculateRelationshipTime } from './calculateRelationshipTime';
import { getPageBySlug } from '../firebase/firebaseService';

interface LovePageData {
  id?: string;
  coupleName: string;
  coupleMessage: string;
  youtubeLink: string;
  startDate: string;
  startTime: string;
  email: string;
  selectedPlan: string;
  imagesUrl: string[] | string | null;
  customSlug?: string;
  createdAt: {
    toDate?: () => Date;
  };
}

const FloatingHearts: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="absolute heart-animation"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 5}s`,
          }}
        >
          <img
            src="https://wallpapers.com/images/hd/minecraft-pixel-heart-icon-hojbu1gs09swfmph.png"
            alt="heart"
            className="w-6 h-6 opacity-70"
          />
        </div>
      ))}
    </div>
  );
};

const EditModal: React.FC<{
  pageData: LovePageData;
  onClose: () => void;
  onSave: (data: Partial<LovePageData>) => void;
}> = ({ pageData, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    coupleName: pageData.coupleName,
    coupleMessage: pageData.coupleMessage,
    youtubeLink: pageData.youtubeLink,
    startDate: pageData.startDate,
    startTime: pageData.startTime,
    selectedPlan: pageData.selectedPlan
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#121212] rounded-2xl p-6 max-w-md w-full mx-auto">
        <h2 className="text-2xl font-bold text-white mb-4">Editar Página</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-white text-sm mb-1 block">Nome do Casal</label>
            <input
              type="text"
              value={formData.coupleName}
              onChange={(e) => setFormData(prev => ({ ...prev, coupleName: e.target.value }))}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
              required
            />
          </div>

          <div>
            <label className="text-white text-sm mb-1 block">Mensagem do Casal</label>
            <textarea
              value={formData.coupleMessage}
              onChange={(e) => setFormData(prev => ({ ...prev, coupleMessage: e.target.value }))}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="text-white text-sm mb-1 block">Link do YouTube</label>
            <input
              type="text"
              value={formData.youtubeLink}
              onChange={(e) => setFormData(prev => ({ ...prev, youtubeLink: e.target.value }))}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white text-sm mb-1 block">Data de Início</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                required
              />
            </div>
            <div>
              <label className="text-white text-sm mb-1 block">Hora de Início</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-[#ff6969] hover:bg-[#ff5c5c] text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
            >
              Salvar Alterações
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SharedLovePage: React.FC = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const [pageData, setPageData] = useState<LovePageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [relationshipTime, setRelationshipTime] = useState<string>('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const processImageUrls = (urls: string[] | string | null | undefined): string[] => {
    console.log('🔄 Processando URLs:', urls);
    
    if (!urls) return [];
    
    if (typeof urls === 'string') {
      return urls.trim() !== '' ? [urls] : [];
    }
    
    if (Array.isArray(urls)) {
      // ✅ CORRIGIDO: Filtra apenas URLs válidas
      return urls.filter(url => 
        url && 
        typeof url === 'string' && 
        url.trim() !== '' &&
        (url.startsWith('http://') || url.startsWith('https://'))
      );
    }
    
    return [];
  };

  // Função para atualizar o tempo do relacionamento em tempo real
  const updateRelationshipTime = () => {
    if (pageData) {
      const time = calculateRelationshipTime(pageData.startDate, pageData.startTime);
      setRelationshipTime(time);
    }
  };

  // Carregar dados da página
  useEffect(() => {
    const loadPageData = async () => {
      if (!pageId) {
        setError('ID da página não encontrado');
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 Buscando página:', pageId);
        
        let pageData = null;
        
        // Sempre tentar buscar por slug primeiro
        console.log('🔄 Buscando por slug personalizado...');
        pageData = await getPageBySlug(pageId);
        
        if (!pageData) {
          console.log('🔄 Buscando como ID normal...');
          const docRef = doc(db, 'paginas', pageId);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            pageData = { id: docSnap.id, ...docSnap.data() } as LovePageData;
          }
        }

        if (pageData) {
          const data = pageData as LovePageData;
          console.log('✅ Dados recebidos do Firestore:', data);
          console.log('🖼️ URLs de imagem recebidas:', data.imagesUrl);
          
          setPageData(data);
          
          const processedUrls = processImageUrls(data.imagesUrl);
          console.log('🖼️ URLs processadas:', processedUrls);
          setImageUrls(processedUrls);
          
          // Calcular tempo inicial
          updateRelationshipTime();
        } else {
          console.log('❌ Página não encontrada no Firestore');
          setError('Página não encontrada');
        }
      } catch (err) {
        console.error('💥 Erro ao carregar página:', err);
        setError('Erro ao carregar a página');
      } finally {
        setLoading(false);
      }
    };

    loadPageData();
  }, [pageId]);

  // Atualizar o tempo a cada segundo se tiver hora específica
  useEffect(() => {
    if (!pageData) return;

    const interval = setInterval(updateRelationshipTime, pageData.startTime ? 1000 : 60000);
    return () => clearInterval(interval);
  }, [pageData]);

  // Carrossel automático
  useEffect(() => {
    if (imageUrls.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => 
        prev === imageUrls.length - 1 ? 0 : prev + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [imageUrls]);

  const nextImage = () => {
    if (imageUrls.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === imageUrls.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (imageUrls.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? imageUrls.length - 1 : prev - 1
      );
    }
  };

  const convertYoutubeLink = (link: string): string => {
    if (!link) return '';
    try {
      const url = new URL(link);
      let videoId = '';
      
      if (url.hostname.includes("youtube.com")) {
        videoId = url.searchParams.get("v") || '';
      } else if (url.hostname === "youtu.be") {
        videoId = url.pathname.substring(1);
      }
      
      return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=1&loop=1&playlist=${videoId}` : "";
    } catch {
      return "";
    }
  };

  const handleEditSave = async (updatedData: Partial<LovePageData>) => {
    if (!pageData?.id) return;

    setIsEditing(true);
    try {
      const docRef = doc(db, 'paginas', pageData.id);
      await updateDoc(docRef, {
        ...updatedData,
        updatedAt: new Date()
      });
      
      // Atualizar estado local
      setPageData(prev => prev ? { ...prev, ...updatedData } : null);
      setShowEditModal(false);
      
      // Recalcular tempo
      updateRelationshipTime();
      
      alert('Alterações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar página:', error);
      alert('Erro ao salvar alterações');
    } finally {
      setIsEditing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-400 to-red-500 flex items-center justify-center">
        <FloatingHearts />
        <div className="text-white text-center z-10">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Carregando página de amor...</p>
        </div>
      </div>
    );
  }

  if (error || !pageData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-400 to-red-500 flex items-center justify-center">
        <FloatingHearts />
        <div className="text-white text-center z-10">
          <p className="text-xl mb-4">{error || 'Página não encontrada'}</p>
          <Link 
            to="/" 
            className="bg-white text-pink-500 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition duration-200"
          >
            Criar minha página
          </Link>
        </div>
      </div>
    );
  }

  const youtubeEmbedUrl = convertYoutubeLink(pageData.youtubeLink);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-400 to-red-500 relative">
      <FloatingHearts />

      <style>
        {`
          .heart-animation {
            animation: floatHeart linear infinite;
          }
          @keyframes floatHeart {
            0% {
              transform: translateY(100vh) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(-100px) rotate(360deg);
              opacity: 0;
            }
          }
          .heart-overlay {
            animation: floatOverlay ease-in-out infinite;
          }
          @keyframes floatOverlay {
            0%, 100% {
              transform: translateY(0) scale(1);
              opacity: 0.4;
            }
            50% {
              transform: translateY(-10px) scale(1.1);
              opacity: 0.7;
            }
          }
          .fade-in {
            animation: fadeIn 0.8s ease-in;
          }
          @keyframes fadeIn {
            from { 
              opacity: 0; 
              transform: translateY(20px) scale(0.95); 
            }
            to { 
              opacity: 1; 
              transform: translateY(0) scale(1); 
            }
          }
        `}
      </style>

      <div className="absolute top-4 left-4 z-50">
        <Link 
          to="/"
          className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition duration-200 flex items-center gap-2"
        >
          <span>←</span>
          Criar sua página
        </Link>
      </div>

      {/* Botão Editar */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={() => setShowEditModal(true)}
          className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition duration-200 flex items-center gap-2"
          disabled={isEditing}
        >
          {isEditing ? 'Editando...' : ' Editar'}
        </button>
      </div>

      <div className="text-center text-white py-12 fade-in">
        <div className="mb-4">
          <img 
            src="https://wallpapers.com/images/hd/minecraft-pixel-heart-icon-hojbu1gs09swfmph.png" 
            alt="Coração" 
            className="w-16 h-16 mx-auto mb-4 animate-pulse"
          />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
          {pageData.coupleName}
        </h1>
        <p className="text-xl md:text-2xl opacity-90 mb-2">Estão juntos há</p>
        <p className="text-2xl md:text-4xl font-bold bg-white/20 backdrop-blur-sm inline-block px-6 py-3 rounded-2xl">
          {relationshipTime}
        </p>
      </div>

      <div className="fade-in">
        <div className="bg-white/20 backdrop-blur-sm mx-4 md:mx-auto md:max-w-2xl rounded-2xl p-6 md:p-8 mb-8 transform hover:scale-[1.02] transition duration-300">
          <p className="text-white text-xl md:text-2xl text-center italic leading-relaxed">
            "{pageData.coupleMessage}"
          </p>
        </div>
      </div>

      {imageUrls.length > 0 ? (
        <div className="fade-in mx-4 md:mx-auto md:max-w-4xl mb-12">
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
            <h2 className="text-white text-3xl font-bold text-center mb-8 flex items-center justify-center gap-3">
              <span>Nossos Momentos</span>
              <span className="text-lg">({imageUrls.length} foto{imageUrls.length !== 1 ? 's' : ''})</span>
            </h2>
            
            <div className="relative group">
              <div className="relative rounded-2xl overflow-hidden bg-black/10 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10"></div>
                
                <img
                  src={imageUrls[currentImageIndex]}
                  alt={`Momento ${currentImageIndex + 1}`}
                  className="w-full h-64 md:h-96 object-cover transition duration-700 ease-in-out"
                  onError={(e) => {
                    console.error(' Erro ao carregar imagem:', imageUrls[currentImageIndex]);
                    e.currentTarget.src = 'https://via.placeholder.com/800x400/FF69B4/FFFFFF?text=Imagem+Não+Encontrada';
                  }}
                />

                {imageUrls.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/60 text-white p-3 rounded-full hover:bg-black/80 transition duration-200 z-20 opacity-0 group-hover:opacity-100"
                    >
                      ◀
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/60 text-white p-3 rounded-full hover:bg-black/80 transition duration-200 z-20 opacity-0 group-hover:opacity-100"
                    >
                      ▶
                    </button>

                    <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-3 z-20">
                      {imageUrls.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            index === currentImageIndex 
                              ? 'bg-white scale-125' 
                              : 'bg-white/50 hover:bg-white/70'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-between items-center mt-4 px-2">
                <p className="text-white text-sm">
                  {currentImageIndex + 1} / {imageUrls.length}
                </p>
                {imageUrls.length > 1 && (
                  <div className="flex items-center gap-2 text-white/70 text-sm">
                    <span>Troca automática: 3s</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="fade-in mx-4 md:mx-auto md:max-w-2xl mb-12">
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 text-center">
            <p className="text-white text-lg"> Nenhuma imagem disponível</p>
            <p className="text-white/70 text-sm mt-2">As imagens serão carregadas em breve...</p>
          </div>
        </div>
      )}

      {youtubeEmbedUrl && (
        <div className="fade-in mx-4 md:mx-auto md:max-w-4xl mb-12">
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
            <h2 className="text-white text-3xl font-bold text-center mb-8 flex items-center justify-center gap-3">
              <span>Nossa Música</span>
            </h2>
            
            <div className="bg-black/30 rounded-2xl p-4 md:p-6">
              <div className="aspect-w-16 aspect-h-9 rounded-xl overflow-hidden shadow-2xl bg-black">
                <iframe
                  src={youtubeEmbedUrl}
                  title="Nossa música especial"
                  className="w-full h-64 md:h-80 rounded-lg"
                  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              
              {/* Instrução para o usuário sobre o áudio */}
              <div className="mt-4 text-center">
                <p className="text-white/70 text-sm mb-2">
                  🎵 A música toca automaticamente (pode estar sem som devido às políticas do navegador)
                </p>
                <p className="text-white/50 text-xs">
                  Dica: Clique no ícone de som no player do YouTube para ativar o áudio
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="text-center text-white/80 py-8 fade-in">
        <div className="flex items-center justify-center gap-2 mb-2">
          <img 
            src="https://wallpapers.com/images/hd/minecraft-pixel-heart-icon-hojbu1gs09swfmph.png" 
            alt="heart" 
            className="w-4 h-4" 
          />
          <p className="text-sm">
            Página criada com amor • {pageData.createdAt?.toDate ? 
              new Date(pageData.createdAt.toDate()).toLocaleDateString('pt-BR') : 
              'Data não disponível'
            }
          </p>
        </div>
      </div>

      {showEditModal && pageData && (
        <EditModal
          pageData={pageData}
          onClose={() => setShowEditModal(false)}
          onSave={handleEditSave}
        />
      )}
    </div>
  );
};

export default SharedLovePage;