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


  useEffect(() => {
    const storedImages = getImagesFromStorage();
    setSavedImages(storedImages);
  }, []);

  useEffect(() => {
    const totalImages = files.length > 0 ? files.length : savedImages.length;
    if (totalImages > 0) setCurrentIndex(0);
  }, [files, savedImages]);

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
            <img
              key={currentIndex}
              src={imagesToDisplay[currentIndex]}
              alt={`Imagem ${currentIndex + 1}`}
              className="w-full h-full object-cover rounded-[30px] transition-all duration-500"
            />

            {totalImages > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black/40 text-white px-2 py-1 rounded-full hover:bg-black/60"
                >
                  ◀
                </button>
                <button
                  onClick={handleNext}
                  className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black/40 text-white px-2 py-1 rounded-full hover:bg-black/60"
                >
                  ▶
                </button>

                <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-2">
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
            className="w-full h-full rounded-[30px] cursor-pointer bg-[url('upload.png')] bg-cover bg-center bg-no-repeat flex items-center justify-center hover:opacity-80 transition-opacity border-4 border-transparent hover:border-[#ff6969]"
          ></label>
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
        <div className="mt-4 w-full flex justify-center hover:border-[#ff6969] border-4 rounded-lg">
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