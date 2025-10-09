interface PropsPhone {
  coupleName: string;
  relationshipTime: string;
  CoupleMessage: string;
}

function Phone({ coupleName, relationshipTime, CoupleMessage }: PropsPhone) {
  return (
    <div className="border-12 p-4 w-[320px] rounded-[45px] mt-50 border-[#484d52] h-150 overflow-y-auto  esconde-scroll">
      <div className="w-[200px] h-[300px] mx-auto ">
        <label
          htmlFor="file-upload-input"
          className="relative w-full h-full rounded-[30px]  cursor-pointer bg-[url('upload.png')] bg-cover bg-no-repeat transition-opacity duration-200 overflow-hidden flex items-center justify-center"
        ></label>

        <input
          id="file-upload-input"
          type="file"
          accept="image/*"
          name="imageUpload"
          className="hidden"
        />
      </div>
      <p className="text-[#ff6969]  text-[20px] text-center font-serif mt-5 break-all ">
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
      <p className="text-white text-center font-semibold text-[15px] break-all ">
        "{CoupleMessage}"
      </p>
    </div>
  );
}

export default Phone;
