import { useState, useEffect } from "react";

interface PropsPhone {
  coupleName: string;
  relationshipTime: string;
  CoupleMessage: string;
  files?: File[];
  setFiles?: (files: File[]) => void;
}

function Phone({
  coupleName,
  relationshipTime,
  CoupleMessage,
  files = [],
  setFiles,
}: PropsPhone) {
  const [currentIndex, setCurrentIndex] = useState(0);

  
  useEffect(() => {
    if (files.length > 0) setCurrentIndex(0);
  }, [files]);

  const handleNext = () => {
    if (files.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % files.length);
    }
  };

  const handlePrev = () => {
    if (files.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + files.length) % files.length);
    }
  };

  const handleSelectFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && setFiles) {
      const filesArray = Array.from(e.target.files);
      setFiles(filesArray);
    }
  };

  return (
    <div className="border-12 p-4 w-[320px] rounded-[45px] mt-50 border-[#484d52] h-150 overflow-y-auto esconde-scroll">
      <div className="relative w-[200px] h-[300px] mx-auto rounded-[30px] overflow-hidden">

        {files.length > 0 ? (
          <>
            <img
              key={currentIndex}
              src={URL.createObjectURL(files[currentIndex])}
              alt={`Imagem ${currentIndex + 1}`}
              className="w-full h-full object-cover rounded-[30px] transition-all duration-500"
            />

            {files.length > 1 && (
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
                  {files.map((_, i) => (
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

      <p className="text-[#ff6969] text-[20px] text-center font-serif mt-5 break-all">
        {coupleName}
      </p>
      <p className="text-white text-center mt-2 font-serif text-[24px]">
        Estão juntos há
      </p>
      {relationshipTime && (
        <p className="text-white text-center text-lg font-bold text-[18px]">
          {relationshipTime}
        </p>
      )}
      <p className="text-white text-center font-semibold text-[15px] break-all">
        "{CoupleMessage}"
      </p>
    </div>
  );
}

export default Phone;
