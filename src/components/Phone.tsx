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
  files,
  setFiles,
}: PropsPhone) {
  return (
    <div className="border-12 p-4 w-[320px] rounded-[45px] mt-50 border-[#484d52] h-150 overflow-y-auto esconde-scroll">
      <div className="w-[200px] h-[300px] mx-auto relative">
   
        {files && files.length > 0 ? (
          <img
            src={URL.createObjectURL(files[0])}
            alt="Uploaded"
            className="w-full h-full object-cover rounded-[30px]"
          />
        ) : (
          
          <label
            htmlFor="file-upload-input"
            className="w-full h-full rounded-[30px] cursor-pointer bg-[url('upload.png')] bg-cover bg-center bg-no-repeat flex items-center justify-center hover:opacity-80 transition-opacity border-4 border-transparent hover:border-[#ff6969]"
          >
            
          </label>
        )}

        <input
          id="file-upload-input"
          onChange={(e) => {
            if (e.target.files && setFiles) {
              const filesArray = Array.from(e.target.files).slice(0, 1);
              setFiles(filesArray);
            }
          }}
          type="file"
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
