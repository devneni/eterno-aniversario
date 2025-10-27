import { useState, useEffect } from "react";
import { getImagesFromStorage } from "./imageStorage";
import { useLanguage } from './useLanguage'; 
import { translations } from './translations'; 

interface PropsPhone {
  coupleName: string;
  relationshipTime: string;
  CoupleMessage: string;
  files?: File[];
  setFiles?: (files: File[]) => void;
  youtubeLink: string;
  textColor?: string;
  backgroundColor?: string;
  imageUrls?: string[];
}

interface FallingHeart {
  id: number;
  left: number;
  animationDuration: number;
  size: number;
  delay: number;
}

const getBackgroundStyle = (backgroundColor: string): string => {
  const gradients = {
    'purple-gradient': 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #c084fc 100%)',
    'blue-gradient': 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 50%, #93c5fd 100%)',
    'red-gradient': 'linear-gradient(135deg, #ef4444 0%, #f87171 50%, #fca5a5 100%)',
    'pink-gradient': 'linear-gradient(135deg, #ec4899 0%, #f472b6 50%, #f9a8d4 100%)',
    'yellow-gradient': 'linear-gradient(135deg, #eab308 0%, #facc15 50%, #fde047 100%)',
    'orange-gradient': 'linear-gradient(135deg, #f97316 0%, #fb923c 50%, #fdba74 100%)',
    'green-gradient': 'linear-gradient(135deg, #22c55e 0%, #4ade80 50%, #86efac 100%)',
    'black-gradient': 'linear-gradient(135deg, #1f2937 0%, #374151 50%, #4b5563 100%)',
    'white-gradient': 'linear-gradient(135deg, #f9fafb 0%, #e5e7eb 50%, #d1d5db 100%)',
    'gray-gradient': 'linear-gradient(135deg, #6b7280 0%, #9ca3af 50%, #d1d5db 100%)',
  };

  if (gradients[backgroundColor as keyof typeof gradients]) {
    return gradients[backgroundColor as keyof typeof gradients];
  }

  if (backgroundColor.startsWith('#')) {
    const lightenColor = (color: string, percent: number) => {
      const num = parseInt(color.replace('#', ''), 16);
      const amt = Math.round(2.55 * percent);
      const R = (num >> 16) + amt;
      const G = (num >> 8 & 0x00FF) + amt;
      const B = (num & 0x0000FF) + amt;
      return `#${(
        0x1000000 +
        (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255)
      ).toString(16).slice(1)}`;
    };

    const baseColor = backgroundColor;
    const lighterColor = lightenColor(baseColor, 20);
    const evenLighterColor = lightenColor(baseColor, 40);

    return `linear-gradient(135deg, ${baseColor} 0%, ${lighterColor} 50%, ${evenLighterColor} 100%)`;
  }

  return 'linear-gradient(135deg, #ec4899 0%, #f472b6 50%, #f9a8d4 100%)';
};

function convertYoutubeLink(link: string): string {
  try {
    const url = new URL(link);
    if (url.hostname.includes("youtube.com")) {
      const videoId = url.searchParams.get("v");
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.hostname === "youtu.be") {
      const videoId = url.pathname.substring(1);
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return "";
  } catch {
    return "";
  }
}

function Phone({
  coupleName,
  relationshipTime,
  CoupleMessage,
  files = [],
  setFiles,
  youtubeLink,
  textColor = "#ffffff",
  backgroundColor = "#ec4899",
  imageUrls = [],
}: PropsPhone) {
  const { language } = useLanguage();
  const t = translations[language];
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [savedImages, setSavedImages] = useState<string[]>([]);
  const [fallingHearts, setFallingHearts] = useState<FallingHeart[]>([]);

  const heartImage = "https://wallpapers.com/images/hd/minecraft-pixel-heart-icon-hojbu1gs09swfmph.png";

  useEffect(() => {
    const storedImages = getImagesFromStorage();
    setSavedImages(storedImages);
  }, []);

  useEffect(() => {
    const totalImages = files.length > 0 ? files.length : savedImages.length;
    if (totalImages > 0) setCurrentIndex(0);
  }, [files, savedImages]);

  useEffect(() => {
    if (files.length > 0 || savedImages.length > 0) {
      // Gerar corações iniciais
      const initialHearts: FallingHeart[] = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        left: Math.random() * 100, 
        animationDuration: 5 + Math.random() * 5, 
        size: 12 + Math.random() * 12, 
        delay: Math.random() * 8, 
      }));
      setFallingHearts(initialHearts);

      const heartInterval = setInterval(() => {
        setFallingHearts(prev => [
          ...prev.slice(-20),
          {
            id: Date.now(),
            left: Math.random() * 100,
            animationDuration: 5 + Math.random() * 5,
            size: 12 + Math.random() * 12,
            delay: 0,
          }
        ]);
      }, 1500);

      return () => clearInterval(heartInterval);
    }
  }, [files.length, savedImages.length]);

  const handleNext = () => {
    const totalImages = files.length > 0 ? files.length : savedImages.length;
    if (totalImages > 0) {
      setCurrentIndex((prev) => (prev + 1) % totalImages);
    }
  };

  const handlePrev = () => {
    const totalImages = files.length > 0 ? files.length : savedImages.length;
    if (totalImages > 0) {
      setCurrentIndex((prev) => (prev - 1 + totalImages) % totalImages);
    }
  };

  const handleSelectFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && setFiles) {
      const filesArray = Array.from(e.target.files);
      setFiles(filesArray);
    }
  };

  const imagesToDisplay = files.length > 0 
    ? files.map(file => URL.createObjectURL(file))
    : savedImages;

  const totalImages = imagesToDisplay.length;
  const totalImagesCount = files.length > 0 ? files.length : savedImages.length;

  return (
    <div 
      className="border-12 p-4 w-[320px] rounded-[45px] mt-50 border-[#484d52] h-150 overflow-y-auto esconde-scroll mb-15"
      style={{ 
        background: getBackgroundStyle(backgroundColor),
      }}
    >

      <div className="mb-4">
        <img
          src="https://wallpapers.com/images/hd/minecraft-pixel-heart-icon-hojbu1gs09swfmph.png"
          alt="Coração"
          className="w-6 h-6 mx-auto mb-4 animate-pulse"
        />
      </div>

      <p className="text-[27px] text-center font-serif mt-5 break-all mb-2"
        style={{ color: textColor }}>
        {coupleName}
      </p>

      <p className="text-white text-center mt-2 font-serif text-[12px]"
        style={{ color: textColor }}>
        {language === 'pt' ? 'Estão juntos há' : 'Together for'}
      </p>

      <p className="text-[12px] text-center mb-2 font-bold bg-white/20 backdrop-blur-sm px-1 py-3 rounded-2xl "
        style={{ color: textColor }}>
        {relationshipTime}
      </p>

      <div className="relative w-[200px] h-[200px] mx-auto fade-in md:mx-auto mb-12md:max-w-4xl mb- overflow-hidden bg-white/20 backdrop-blur-sm rounded-2xl p-6">
        <p className="font-bold text-center text-[12px] mb-4"
          style={{ color: textColor }}>
          {language === 'pt' ? 'Nossos momentos' : 'Our moments'} <span className="text-[8px]">
          ({totalImagesCount} {totalImagesCount === 1 ? t.photos : t.photos})</span>
        </p>

        {totalImages > 0 ? (
          <>
            <div className="relative w-full h-30 overflow-hidden">
              <img
                key={currentIndex}
                src={imagesToDisplay[currentIndex]}
                alt={`Imagem ${currentIndex + 1}`}
                className="w-full h-full object-cover rounded-lg transition-all duration-500  "
              />

              <div className="absolute inset-0 pointer-events-none ">
                {fallingHearts.map((heart) => (
                  <img
                    key={heart.id}
                    src={heartImage}
                    alt="Coração caindo"
                    className="absolute"
                    style={{
                      left: `${heart.left}%`,
                      width: `${heart.size}px`,
                      height: `${heart.size}px`,
                      animation: `fall ${heart.animationDuration}s linear ${heart.delay}s infinite`,
                      filter: 'brightness(1.2)',
                    }}
                  />
                ))}
              </div>

              <style jsx>{`
                @keyframes fall {
                  0% {
                    transform: translateY(-50px) rotate(0deg);
                    opacity: 0;
                  }
                  10% {
                    opacity: 1;
                  }
                  90% {
                    opacity: 0.8;
                  }
                  100% {
                    transform: translateY(350px) rotate(180deg);
                    opacity: 0;
                  }
                }
              `}</style>
            </div>

            {totalImages > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black/40 text-white px-2 py-1 rounded-full hover:bg-black/60 z-20"
                >
                   ←
                </button>
                <button
                  onClick={handleNext}
                  className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black/40 text-white px-2 py-1 rounded-full hover:bg-black/60 z-20"
                >
                  →
                </button>

                <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-2 z-20">
                  {imagesToDisplay.map((_, i) => (
                    <span
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i === currentIndex ? "bg-white" : "bg-gray-500"
                      }`}
                    ></span>
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <label
            htmlFor="file-upload-input"
            className="w-full h-full rounded-[30px] cursor-pointer bg-[url('upload.png')] bg-cover bg-center bg-no-repeat flex items-center justify-center hover:opacity-80 transition-opacity border-4 border-transparent hover:border-[#ff6969] relative"
          >
            
          </label>
        )}

        <input
          id="file-upload-input"
          onChange={handleSelectFiles}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
        />
      </div>

      <p className="mt-3 bg-white/20 backdrop-blur-s text-center rounded-2xl p-6 md:p-8 mb-3 transform hover:scale-[1.02] transition duration-300 "
        style={{ color: textColor }}>
        "{CoupleMessage}"
      </p>

      {youtubeLink && (
        <div className="fade-in mx-4 md:mx-auto md:max-w-4xl mb-12 bg-white/20 backdrop-blur-sm rounded-2xl p-6">
          <p className="text-center font-bold mb-4 "
          style={{color:textColor}}>
            {language === 'pt' ? 'Nossa música' : 'Our song'}
          </p>
          <iframe
            width="100%"
            height="130"
            src={`${convertYoutubeLink(youtubeLink)}?autoplay=1`}
            title="YouTube video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="rounded-lg"
          ></iframe>
        </div>
      )}
      
      <div className="flex items-center justify-center gap-2 mb-2">
        <img   
          src="https://wallpapers.com/images/hd/minecraft-pixel-heart-icon-hojbu1gs09swfmph.png"
          alt="heart"
          className="w-2 h-2"
        />
        <p className="text-center text-[8px]"
          style={{color: textColor}}>
          {language === 'pt' ? 'Página criada com amor •' : 'Page created with love •'}
        </p>
      </div>
    </div>
  );
}

export default Phone;