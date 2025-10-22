import { useState, useEffect } from "react";
import { getImagesFromStorage } from "./imageStorage";

interface PropsPhone {
  coupleName: string;
  relationshipTime: string;
  CoupleMessage: string;
  files?: File[];
  setFiles?: (files: File[]) => void;
  youtubeLink: string;
}

// 🆕 Interface para os corações caindo
interface FallingHeart {
  id: number;
  left: number;
  animationDuration: number;
  size: number;
  delay: number;
}

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
}: PropsPhone) {
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

  // 🆕 Efeito para gerar corações caindo
  useEffect(() => {
    if (files.length > 0 || savedImages.length > 0) {
      // Gerar corações iniciais
      const initialHearts: FallingHeart[] = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        left: Math.random() * 100, // 0% a 100%
        animationDuration: 5 + Math.random() * 5, // 5-10 segundos
        size: 12 + Math.random() * 12, // 12-24px
        delay: Math.random() * 8, // 0-8 segundos de delay
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

  return (
    <div className="border-12 p-4 w-[320px] rounded-[45px] mt-50 border-[#484d52] h-150 overflow-y-auto esconde-scroll">
      <div className="relative w-[200px] h-[300px] mx-auto rounded-[30px] overflow-hidden">
        {totalImages > 0 ? (
          <>
       
            <div className="relative w-full h-full overflow-hidden">
       
              <img
                key={currentIndex}
                src={imagesToDisplay[currentIndex]}
                alt={`Imagem ${currentIndex + 1}`}
                className="w-full h-full object-cover rounded-[30px] transition-all duration-500"
              />

              
              <div className="absolute inset-0 pointer-events-none">
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
                  ◀
                </button>
                <button
                  onClick={handleNext}
                  className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black/40 text-white px-2 py-1 rounded-full hover:bg-black/60 z-20"
                >
                  ▶
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
           
            <img 
              src={heartImage} 
              alt="Coração" 
              className="w-20 h-20 opacity-80 animate-pulse"
            />
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

      <p className="text-[#ff6969] text-[20px] text-center font-serif mt-5 break-all">
        {coupleName}
      </p>
      <p className="text-white text-center mt-2 font-serif text-[24px]">
        Estão juntos há
      </p>
      <p className="text-white text-center text-lg font-bold text-[14px] mb-2">
        {relationshipTime}
      </p>
      <p className="text-white text-center font-semibold text-[15px] break-all">
        "{CoupleMessage}"
      </p>

      {youtubeLink && (
        <div className="mt-4 w-full flex justify-center hover:border-[#ff6969] border-4 rounded-lg relative">
          <iframe
            width="100%"
            height="200"
            src={`${convertYoutubeLink(youtubeLink)}?autoplay=1`}
            title="YouTube video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="rounded-lg"
          ></iframe>
        </div>
      )}
    </div>
  );
}

export default Phone;